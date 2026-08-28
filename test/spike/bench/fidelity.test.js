'use strict';

/**
 * ============================================================================
 *  B7b · test/spike/bench/fidelity.test.js
 *  FIDELITY BENCHMARK & COMPOSITE METRIC INTEGRATION TEST SUITE (P0-B / Wave 4)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  KIỂM THỬ:
 *  - Chạy thực nghiệm Replay (B5) + Verification (B6) trên 10 fixtures (B8) + probe SC-11.
 *  - Thẩm định 6 Metric Cốt lõi của Phase 0 (Spec §4.1, MTP §3.1).
 *  - Thẩm định 4 Giả thuyết Ban đầu của RQ.md §24.
 */

const assert = require('node:assert');
const test = require('node:test');

const {
  runFidelityBenchmark,
  buildScenarioArtifacts,
  calculateDistribution,
} = require('../../../src/spike/bench/fidelity');

const {
  runCompositeBenchmark,
  evaluateHypothesesCompliance,
  HYPOTHESES_THRESHOLDS,
} = require('../../../src/spike/bench/composite');

const {
  formatFidelityCsvReport,
  formatCompositeCsvReport,
  formatCompositeTextSummary,
} = require('../../../src/spike/bench/reporter');

test('B7b Suite 1: Thống kê Phân vị (calculateDistribution)', () => {
  const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const dist = calculateDistribution(values);

  assert.strictEqual(dist.count, 10);
  assert.strictEqual(dist.avg, 550);
  assert.strictEqual(dist.min, 100);
  assert.strictEqual(dist.max, 1000);
  assert.strictEqual(dist.p50, 550);
  assert.strictEqual(dist.p95, 955);
  assert.strictEqual(dist.p99, 991);
});

test('B7b Suite 2: Chạy Fidelity Benchmark toàn diện (10 Scenarios + SC-11 x K=3)', async () => {
  const fidelityResult = await runFidelityBenchmark({ kIterations: 3 });

  assert.strictEqual(fidelityResult.phase, 'P0-B');
  assert.strictEqual(fidelityResult.task, 'B7b');

  const m = fidelityResult.metrics;
  assert.strictEqual(m.denominator_d, 7, 'Denominator D must be 7 (Spec §4.1)');
  assert.strictEqual(m.in_class_runs, 21, '7 in-class scenarios x 3 iterations = 21 runs');
  assert.strictEqual(m.out_of_class_runs, 12, '4 out-of-class scenarios x 3 iterations = 12 runs');
  assert.strictEqual(m.total_runs, 33, '11 scenarios x 3 iterations = 33 total runs');

  // In-class replay success & match rates on synthetic fixture pipeline
  assert.strictEqual(m.replay_success_rate_pct, 100.0, 'R_sr must be 100% on in-class fixtures');
  assert.strictEqual(m.execution_match_rate_pct, 100.0, 'R_em must be 100% on in-class fixtures');
  assert.strictEqual(m.scenarios_reproduced_count, 7, 'All 7 in-class scenarios must be reproduced (K=3/3)');
  assert.strictEqual(m.scenarios_reproduced_ratio, '7/7');
  assert.strictEqual(m.scenarios_reproduced_pct, 100.0);
  assert.strictEqual(m.escaped_side_effects, 0, 'Escaped side effects must strictly be 0 (ADR-005)');

  // Capsule size metrics
  assert.ok(m.capsule_size.avg_bytes > 0);
  assert.ok(m.capsule_size.p95_bytes >= m.capsule_size.avg_bytes);
  assert.ok(m.capsule_size.avg_mb < 10.0, 'Average capsule size must be < 10MB (§24)');

  // Replay execution duration metrics
  assert.ok(m.replay_time_ms.avg_seconds < 30.0, 'Average replay time must be < 30s (§24)');
  assert.ok(m.replay_time_ms.p95_seconds < 30.0);

  // Observation set checks (SC-7, SC-9, SC-10, SC-11)
  const sc7 = fidelityResult.scenario_summaries['SC-7'];
  assert.strictEqual(sc7.in_class, false);
  assert.strictEqual(sc7.success_count, 3);
  assert.strictEqual(sc7.matched_count, 0, 'SC-7 randomness must diverge');

  const sc11 = fidelityResult.scenario_summaries['SC-11'];
  assert.strictEqual(sc11.in_class, false);
  assert.strictEqual(sc11.matched_count, 0, 'SC-11 cache probe must diverge');
});

test('B7b Suite 3: Đánh giá Tính tuân thủ 4 Giả thuyết §24 (evaluateHypothesesCompliance)', async () => {
  const fidelityResult = await runFidelityBenchmark({ kIterations: 3 });

  // Case 1: Healthy passing metrics
  const passingCompliance = evaluateHypothesesCompliance(fidelityResult.metrics, {
    latency_delta_pct: 1.85,
  });
  assert.strictEqual(passingCompliance.verdict, 'PASS');
  assert.strictEqual(passingCompliance.hypotheses.length, 5);
  for (const h of passingCompliance.hypotheses) {
    assert.strictEqual(h.passed, true, `Hypothesis ${h.id} must pass`);
  }

  // Case 2: Latency overhead >= 5% -> FAIL
  const highLatencyCompliance = evaluateHypothesesCompliance(fidelityResult.metrics, {
    latency_delta_pct: 5.8,
  });
  assert.strictEqual(highLatencyCompliance.verdict, 'FAIL');
  const failedH2 = highLatencyCompliance.hypotheses.find((h) => h.id === 'H2_latency_overhead');
  assert.strictEqual(failedH2.passed, false);

  // Case 3: Reproduced count < 6/7 -> FAIL
  const lowReproducedCompliance = evaluateHypothesesCompliance(
    {
      ...fidelityResult.metrics,
      scenarios_reproduced_pct: 71.43,
      scenarios_reproduced_count: 5,
    },
    { latency_delta_pct: 1.85 }
  );
  assert.strictEqual(lowReproducedCompliance.verdict, 'FAIL');
  const failedH1 = lowReproducedCompliance.hypotheses.find((h) => h.id === 'H1_reproduced_rate');
  assert.strictEqual(failedH1.passed, false);
});

test('B7b Suite 4: Chạy Composite Benchmark Hợp nhất (runCompositeBenchmark)', async () => {
  const compositeResult = await runCompositeBenchmark();

  assert.strictEqual(compositeResult.phase, 'P0-B');
  assert.strictEqual(compositeResult.task, 'B7b');
  assert.strictEqual(compositeResult.verdict, 'PASS');

  const summary = compositeResult.composite_summary;
  assert.strictEqual(summary.reproduced_ratio, '7/7');
  assert.strictEqual(summary.escaped_side_effects, 0);
  assert.ok(summary.avg_capsule_size_mb < 10.0);
  assert.ok(summary.avg_replay_time_seconds < 30.0);
  assert.ok(summary.production_latency_delta_pct < 5.0);

  // Reporters
  const csv = formatCompositeCsvReport(compositeResult);
  assert.ok(csv.includes('H1_reproduced_rate'));
  assert.ok(csv.includes('H2_latency_overhead'));
  assert.ok(csv.includes('H3_capsule_size'));
  assert.ok(csv.includes('H4_replay_time'));
  assert.ok(csv.includes('H5_escaped_side_effects'));

  const text = formatCompositeTextSummary(compositeResult);
  assert.ok(text.includes('REPRO SPIKE PHASE 0 (P0-B) — COMPOSITE METRIC EVALUATION'));
  assert.ok(text.includes('SIX CORE METRICS'));
  assert.ok(text.includes('RQ §24 INITIAL HYPOTHESES EVALUATION'));
  assert.ok(text.includes('Overall Verdict : PASS'));
});
