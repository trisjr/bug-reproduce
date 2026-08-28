'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Self-Check nội bộ cho toàn bộ module Benchmark (B7a Overhead + B7b Fidelity & Composite).
 * Kiểm chứng độc lập không phụ thuộc external libraries.
 */

const assert = require('node:assert');

const { loadBenchConfig, DEFAULT_CONFIG } = require('./config');
const { generateRequestPayload, runLoadDriver, ERROR_SKU, SUCCESS_SKUS } = require('./driver');
const { parseKeyValueFile, takeSnapshot, computeMetricsDiff } = require('./sampler');
const { evaluateResourceGates, probeForeignContainers } = require('./gates');
const { calculatePercentile, calculateStats, calculateDeltaPct, runBenchmark } = require('./orchestrator');
const {
  formatJsonReport,
  formatCsvReport,
  formatFidelityCsvReport,
  formatCompositeCsvReport,
  formatTextSummary,
  formatCompositeTextSummary,
} = require('./reporter');
const { runFidelityBenchmark, buildScenarioArtifacts, calculateDistribution } = require('./fidelity');
const { runCompositeBenchmark, evaluateHypothesesCompliance, HYPOTHESES_THRESHOLDS } = require('./composite');

console.log('\n=== B7 Benchmark Harness Self-Check (B7a + B7b) ===\n');

// ----------------------------------------------------------------------------
// 1. Config Tests
// ----------------------------------------------------------------------------
console.log('1. Testing Config Module...');
const defaultConfig = loadBenchConfig();
assert.strictEqual(defaultConfig.sampling, 'OFF', 'Sampling must be OFF (FR-015, MTP §3.2)');
assert.deepStrictEqual(defaultConfig.stages, ['OFF', 'ON', 'OFF', 'ON'], 'Stages must be OFF/ON/OFF/ON (D-11)');
assert.strictEqual(defaultConfig.targetErrorRate, 0.05, 'Target error rate must default to 5%');
assert.strictEqual(defaultConfig.memLimitBytes, 320 * 1024 * 1024, 'Mem limit must be 320MB');
assert.strictEqual(defaultConfig.memWarningThresholdRatio, 0.9, 'Mem warning ratio must be 0.9 (288MB)');

// Test override validation
const customConfig = loadBenchConfig({
  concurrency: 20,
  requestCount: 500,
  targetErrorRate: 0.1,
});
assert.strictEqual(customConfig.concurrency, 20);
assert.strictEqual(customConfig.requestCount, 500);
assert.strictEqual(customConfig.targetErrorRate, 0.1);

assert.throws(() => loadBenchConfig({ concurrency: -1 }), /concurrency/);
assert.throws(() => loadBenchConfig({ requestCount: 0 }), /requestCount/);
assert.throws(() => loadBenchConfig({ targetErrorRate: 1.5 }), /targetErrorRate/);
console.log('   ✅ Config module passed.');

// ----------------------------------------------------------------------------
// 2. Driver & Payload Generator Tests
// ----------------------------------------------------------------------------
console.log('2. Testing Driver & Deterministic Payload Generation...');
const N = 1000;
const targetRate = 0.05;
let errorCount = 0;
let successCount = 0;

for (let i = 0; i < N; i++) {
  const req = generateRequestPayload(i, N, targetRate);
  if (req.sku === ERROR_SKU) {
    errorCount++;
  } else {
    assert.ok(SUCCESS_SKUS.includes(req.sku));
    successCount++;
  }
}

assert.strictEqual(errorCount, 50, 'Must have exactly 50 error requests for N=1000, rate=0.05');
assert.strictEqual(successCount, 950, 'Must have exactly 950 success requests');

(async () => {
  // Test runLoadDriver with custom mock requestFn
  let mockRequestCounter = 0;
  const mockRequestFn = async ({ body }) => {
    mockRequestCounter++;
    const isError = body && body.sku === ERROR_SKU;
    return {
      statusCode: isError ? 402 : 200,
      durationMs: 10.0,
      inProcessDurationMs: 8.0,
      pathLabel: isError ? 'P-persist' : 'P-discard',
    };
  };

  const driverResult = await runLoadDriver({
    requestCount: 100,
    concurrency: 5,
    targetErrorRate: 0.05,
    requestFn: mockRequestFn,
  });

  assert.strictEqual(driverResult.requestCount, 100);
  assert.strictEqual(driverResult.latencies['P-discard'].length, 95);
  assert.strictEqual(driverResult.latencies['P-persist'].length, 5);
  assert.strictEqual(driverResult.actualErrorRate, 0.05);
  console.log('   ✅ Driver module passed.');

  // ----------------------------------------------------------------------------
  // 3. Stats & Math Tests
  // ----------------------------------------------------------------------------
  console.log('3. Testing Percentile & Statistical Calculation Functions...');
  const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  assert.strictEqual(calculatePercentile(numbers, 50), 50);
  assert.strictEqual(calculatePercentile(numbers, 0), 10);
  assert.strictEqual(calculatePercentile(numbers, 100), 100);

  const stats = calculateStats(numbers);
  assert.strictEqual(stats.n, 10);
  assert.strictEqual(stats.avg, 55);
  assert.strictEqual(stats.min, 10);
  assert.strictEqual(stats.max, 100);
  assert.strictEqual(stats.p50, 50);

  assert.strictEqual(calculateDeltaPct(100, 105), 5.0);
  assert.strictEqual(calculateDeltaPct(100, 95), -5.0);
  assert.strictEqual(calculateDeltaPct(0, 10), 100.0);
  assert.strictEqual(calculateDeltaPct(0, 0), 0.0);
  console.log('   ✅ Percentile calculation passed.');

  // ----------------------------------------------------------------------------
  // 4. Resource Gates Tests (D-12)
  // ----------------------------------------------------------------------------
  console.log('4. Testing Resource Gates (D-12 Fail-Closed)...');

  // Case 1: Healthy
  const healthyGate = evaluateResourceGates({
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: defaultConfig.memLimitBytes,
    memWarningThresholdRatio: defaultConfig.memWarningThresholdRatio,
  });
  assert.strictEqual(healthyGate.passed, true);
  assert.strictEqual(healthyGate.aborted, false);
  assert.strictEqual(healthyGate.warnings.length, 0);

  // Case 2: Throttled -> Errors & Uninterpretable
  const throttledGate = evaluateResourceGates({
    diff: { nr_throttled_delta: 5, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: defaultConfig.memLimitBytes,
  });
  assert.strictEqual(throttledGate.passed, false);
  assert.strictEqual(throttledGate.uninterpretable, true);
  assert.ok(throttledGate.reasons.some((r) => r.includes('CFS CPU Throttling detected')));

  // Case 3: OOM -> Abort
  const oomGate = evaluateResourceGates({
    diff: { nr_throttled_delta: 0, oom_kill_delta: 1, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: defaultConfig.memLimitBytes,
  });
  assert.strictEqual(oomGate.passed, false);
  assert.strictEqual(oomGate.aborted, true);
  assert.ok(oomGate.reasons.some((r) => r.includes('Cgroup OOM Kill event detected')));

  // Case 4: High memory warning
  const highMemGate = evaluateResourceGates({
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 290 * 1024 * 1024 },
    memLimitBytes: defaultConfig.memLimitBytes,
    memWarningThresholdRatio: defaultConfig.memWarningThresholdRatio,
  });
  assert.strictEqual(highMemGate.passed, true);
  assert.strictEqual(highMemGate.warnings.length, 1);
  assert.ok(highMemGate.warnings[0].includes('Memory peak reached'));
  console.log('   ✅ Resource gates passed.');

  // ----------------------------------------------------------------------------
  // 5. Overhead Orchestrator Integration Test (B7a)
  // ----------------------------------------------------------------------------
  console.log('5. Testing B7a Benchmark Orchestrator (A/B Stages)...');
  let resetOrdersCallCount = 0;
  const mockResetOrders = async () => {
    resetOrdersCallCount++;
  };

  let recorderStateCalls = [];
  const mockSetRecorderState = async (state) => {
    recorderStateCalls.push(state);
  };

  const benchResult = await runBenchmark({
    config: {
      requestCount: 20,
      concurrency: 2,
      targetErrorRate: 0.05,
    },
    resetOrdersFn: mockResetOrders,
    setRecorderStateFn: mockSetRecorderState,
    requestFn: mockRequestFn,
    probeFn: async () => ({ allRunning: true }),
  });

  assert.strictEqual(recorderStateCalls.length, 4, 'Must transition recorder state 4 times');
  assert.deepStrictEqual(recorderStateCalls, ['OFF', 'ON', 'OFF', 'ON'], 'Stages must be OFF/ON/OFF/ON');
  assert.strictEqual(resetOrdersCallCount, 4, 'Must call resetOrders 4 times before each stage (D-11)');
  assert.strictEqual(benchResult.verdict, 'PASS');
  assert.ok(benchResult.summary['P-discard']);
  assert.ok(benchResult.summary['P-persist']);
  assert.ok(benchResult.summary.overall);
  console.log('   ✅ B7a Orchestrator passed.');

  // ----------------------------------------------------------------------------
  // 6. Fidelity Benchmark Tests (B7b)
  // ----------------------------------------------------------------------------
  console.log('6. Testing B7b Fidelity Benchmark Harness...');
  const fidelityResult = await runFidelityBenchmark({ kIterations: 3 });

  assert.strictEqual(fidelityResult.phase, 'P0-B');
  assert.strictEqual(fidelityResult.task, 'B7b');
  assert.strictEqual(fidelityResult.metrics.denominator_d, 7, 'Denominator D must be 7 (Spec §4.1)');
  assert.strictEqual(fidelityResult.metrics.in_class_runs, 21, 'In-class runs must be 7 * 3 = 21');
  assert.strictEqual(fidelityResult.metrics.out_of_class_runs, 12, 'Out-of-class runs must be 4 * 3 = 12');
  assert.strictEqual(fidelityResult.metrics.total_runs, 33, 'Total runs must be 11 * 3 = 33');

  // In-class 7 scenarios must have 100% success and match rate in synthetic fixture harness
  assert.strictEqual(fidelityResult.metrics.replay_success_rate_pct, 100.0);
  assert.strictEqual(fidelityResult.metrics.execution_match_rate_pct, 100.0);
  assert.strictEqual(fidelityResult.metrics.scenarios_reproduced_count, 7);
  assert.strictEqual(fidelityResult.metrics.escaped_side_effects, 0, 'Escaped side effects must be 0 (ADR-005)');

  // Capsule size distribution
  assert.ok(fidelityResult.metrics.capsule_size.avg_bytes > 0);
  assert.ok(fidelityResult.metrics.capsule_size.p95_bytes >= fidelityResult.metrics.capsule_size.avg_bytes);
  assert.ok(fidelityResult.metrics.capsule_size.avg_mb < 10.0, 'Average capsule size must be < 10MB (§24)');

  // Replay execution time distribution
  assert.ok(fidelityResult.metrics.replay_time_ms.avg_seconds < 30.0, 'Average replay time must be < 30s (§24)');
  assert.ok(fidelityResult.metrics.replay_time_ms.p95_seconds < 30.0);
  console.log('   ✅ B7b Fidelity Benchmark passed.');

  // ----------------------------------------------------------------------------
  // 7. Composite Metric Evaluator & RQ §24 Hypotheses Compliance Tests
  // ----------------------------------------------------------------------------
  console.log('7. Testing Composite Metric & RQ §24 Hypotheses Evaluation...');
  const compositeResult = await runCompositeBenchmark({
    fidelityResult,
    overheadResult: benchResult,
  });

  assert.strictEqual(compositeResult.verdict, 'PASS');
  assert.strictEqual(compositeResult.hypotheses_evaluation.length, 5);

  const h1 = compositeResult.hypotheses_evaluation.find((h) => h.id === 'H1_reproduced_rate');
  assert.ok(h1 && h1.passed, 'H1: Reproduced rate >= 80% must PASS');

  const h2 = compositeResult.hypotheses_evaluation.find((h) => h.id === 'H2_latency_overhead');
  assert.ok(h2 && h2.passed, 'H2: Latency overhead < 5% must PASS');

  const h3 = compositeResult.hypotheses_evaluation.find((h) => h.id === 'H3_capsule_size');
  assert.ok(h3 && h3.passed, 'H3: Average capsule size < 10MB must PASS');

  const h4 = compositeResult.hypotheses_evaluation.find((h) => h.id === 'H4_replay_time');
  assert.ok(h4 && h4.passed, 'H4: Replay time < 30s must PASS');

  const h5 = compositeResult.hypotheses_evaluation.find((h) => h.id === 'H5_escaped_side_effects');
  assert.ok(h5 && h5.passed, 'H5: Escaped side effects = 0 must PASS');

  // Test failure scenario when H2 exceeds 5%
  const failingCompliance = evaluateHypothesesCompliance(
    fidelityResult.metrics,
    { latency_delta_pct: 7.5 }
  );
  assert.strictEqual(failingCompliance.verdict, 'FAIL');
  const failedH2 = failingCompliance.hypotheses.find((h) => h.id === 'H2_latency_overhead');
  assert.strictEqual(failedH2.passed, false);
  console.log('   ✅ Composite metric evaluation passed.');

  // ----------------------------------------------------------------------------
  // 8. Reporters Output Verification (JSON, CSV, Text)
  // ----------------------------------------------------------------------------
  console.log('8. Testing Reporter Output (JSON, CSV, Composite Text)...');
  const fidelityCsv = formatFidelityCsvReport(fidelityResult);
  assert.ok(fidelityCsv.includes('scenario_id,in_class,k_runs,success_count,matched_count'));
  assert.ok(fidelityCsv.includes('SC-1,true,3,3,3,100,100,true'));

  const compositeCsv = formatCompositeCsvReport(compositeResult);
  assert.ok(compositeCsv.includes('hypothesis_id,hypothesis_name,threshold,actual_value,verdict'));
  assert.ok(compositeCsv.includes('H1_reproduced_rate'));

  const compositeText = formatCompositeTextSummary(compositeResult);
  assert.ok(compositeText.includes('REPRO SPIKE PHASE 0 (P0-B) — COMPOSITE METRIC EVALUATION (B7b / RQ §24)'));
  assert.ok(compositeText.includes('SIX CORE METRICS'));
  assert.ok(compositeText.includes('Replay Success Rate (R_sr)'));
  assert.ok(compositeText.includes('Execution Match Rate (R_em)'));
  assert.ok(compositeText.includes('RQ §24 INITIAL HYPOTHESES EVALUATION'));
  assert.ok(compositeText.includes('Overall Verdict : PASS'));
  console.log('   ✅ Reporter formats passed.');

  console.log('\n================================================================================');
  console.log('🎉 ALL B7 (B7a Overhead + B7b Fidelity & Composite) Self-Checks PASSED (8/8)');
  console.log('================================================================================\n');
})().catch((err) => {
  console.error('\n❌ Self-Check Failed:', err);
  process.exit(1);
});
