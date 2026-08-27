'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Self-Check script cho B7a Overhead Benchmark Harness.
 * Kiểm tra toàn bộ các module: config, driver, sampler, gates, orchestrator, reporter.
 * Chạy: `node src/spike/bench/self-check.js`
 */

const assert = require('node:assert');

const { loadBenchConfig, DEFAULT_CONFIG } = require('./config');
const { generateRequestPayload, runLoadDriver, ERROR_SKU, SUCCESS_SKUS } = require('./driver');
const { parseKeyValueFile, takeSnapshot, computeMetricsDiff } = require('./sampler');
const { evaluateResourceGates, probeForeignContainers } = require('./gates');
const { calculatePercentile, calculateStats, calculateDeltaPct, runBenchmark } = require('./orchestrator');
const { formatJsonReport, formatCsvReport, formatTextSummary } = require('./reporter');

console.log('\n=== B7a Overhead Benchmark Harness Self-Check ===\n');

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
  const payload = generateRequestPayload(i, N, targetRate);
  if (payload.isTargetError) {
    errorCount++;
    assert.strictEqual(payload.sku, ERROR_SKU, 'Error payload must use SKU-GPU-004');
  } else {
    successCount++;
    assert.ok(SUCCESS_SKUS.includes(payload.sku), 'Success payload must use valid SKU');
  }
}

assert.strictEqual(errorCount, 50, 'Must have exactly 50 error requests for N=1000, rate=0.05');
assert.strictEqual(successCount, 950, 'Must have exactly 950 success requests');

// Test runLoadDriver with custom mock requestFn
(async () => {
  const mockDriverResult = await runLoadDriver({
    endpoint: 'http://mock-app/checkout',
    concurrency: 5,
    requestCount: 100,
    targetErrorRate: 0.05,
    requestFn: async ({ body }) => {
      const isErr = body.sku === ERROR_SKU;
      return {
        statusCode: isErr ? 402 : 201,
        durationMs: isErr ? 25.5 : 10.2,
        pathLabel: isErr ? 'P-persist' : 'P-discard',
      };
    },
  });

  assert.strictEqual(mockDriverResult.requestCount, 100);
  assert.strictEqual(mockDriverResult.errorCount, 5);
  assert.strictEqual(mockDriverResult.successCount, 95);
  assert.strictEqual(mockDriverResult.latencies['P-discard'].length, 95);
  assert.strictEqual(mockDriverResult.latencies['P-persist'].length, 5);
  assert.strictEqual(mockDriverResult.latencies.all.length, 100);
  console.log('   ✅ Driver & payload generator passed.');

  // --------------------------------------------------------------------------
  // 3. Sampler & Cgroup Tests
  // --------------------------------------------------------------------------
  console.log('3. Testing Sampler & Cgroup Metrics Parsing...');
  const sampleCpuStat = `
usage_usec 1500000
user_usec 1000000
system_usec 500000
nr_periods 100
nr_throttled 5
throttled_usec 450000
`;
  const parsedCpu = parseKeyValueFile(sampleCpuStat);
  assert.strictEqual(parsedCpu.usage_usec, 1500000);
  assert.strictEqual(parsedCpu.nr_throttled, 5);
  assert.strictEqual(parsedCpu.throttled_usec, 450000);

  const startSnap = takeSnapshot({
    mockMetrics: {
      cpu: { usage_usec: 1000000, nr_periods: 50, nr_throttled: 0, throttled_usec: 0 },
      memory: { peak_bytes: 100 * 1024 * 1024, oom_kill: 0 },
    },
  });
  const endSnap = takeSnapshot({
    mockMetrics: {
      cpu: { usage_usec: 2500000, nr_periods: 100, nr_throttled: 2, throttled_usec: 150000 },
      memory: { peak_bytes: 250 * 1024 * 1024, oom_kill: 0 },
    },
  });

  const diff = computeMetricsDiff(startSnap, endSnap);
  assert.strictEqual(diff.cpu_usage_usec_delta, 1500000);
  assert.strictEqual(diff.cpu_usage_ms_delta, 1500);
  assert.strictEqual(diff.nr_throttled_delta, 2);
  assert.strictEqual(diff.throttled_usec_delta, 150000);
  assert.strictEqual(diff.memory_peak_bytes, 250 * 1024 * 1024);
  assert.strictEqual(diff.oom_kill_delta, 0);
  console.log('   ✅ Sampler & cgroup metrics passed.');

  // --------------------------------------------------------------------------
  // 4. Resource Gates D-12 Tests
  // --------------------------------------------------------------------------
  console.log('4. Testing Resource Gates D-12...');

  // Gate Test 1: Clean run -> PASSED
  const cleanGate = evaluateResourceGates({
    startSnapshot: startSnap,
    endSnapshot: startSnap,
    diff: { nr_throttled_delta: 0, throttled_usec_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 150 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(cleanGate.passed, true, 'Clean run must pass all gates');
  assert.strictEqual(cleanGate.uninterpretable, false);
  assert.strictEqual(cleanGate.aborted, false);
  assert.strictEqual(cleanGate.warnings.length, 0);

  // Gate Test 2: Throttling -> UNINTERPRETABLE
  const throttledGate = evaluateResourceGates({
    startSnapshot: startSnap,
    endSnapshot: endSnap,
    diff: { nr_throttled_delta: 2, throttled_usec_delta: 150000, oom_kill_delta: 0, memory_peak_bytes: 150 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(throttledGate.uninterpretable, true, 'Throttled run must be marked UNINTERPRETABLE');

  // Gate Test 3: OOM Kill -> ABORT / FAIL-FAST
  const oomGate = evaluateResourceGates({
    startSnapshot: startSnap,
    endSnapshot: endSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 1, memory_peak_bytes: 320 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(oomGate.aborted, true, 'OOM kill must trigger abort');
  assert.strictEqual(oomGate.passed, false);

  // Gate Test 4: Memory Peak 90% Warning (>= 288MB of 320MB)
  const warnGate = evaluateResourceGates({
    startSnapshot: startSnap,
    endSnapshot: startSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 295 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(warnGate.warnings.length, 1, 'Should trigger 90% memory warning');
  assert.ok(warnGate.warnings[0].includes('Memory peak reached'), 'Warning text matches');

  // Gate Test 5: Container probe failure
  const containerFailGate = evaluateResourceGates({
    startSnapshot: startSnap,
    endSnapshot: startSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: {
      allRunning: false,
      containers: { tnm_app: { name: 'tnm_app', status: 'exited', running: false } },
    },
  });
  assert.strictEqual(containerFailGate.passed, false, 'Container down must fail gates');

  // Test Container Probe Mock
  const probeMock = await probeForeignContainers({
    containerNames: ['tnm_db', 'tnm_redis', 'tnm_stub', 'tnm_app'],
    mockStatus: { tnm_db: true, tnm_redis: true, tnm_stub: true, tnm_app: true },
  });
  assert.strictEqual(probeMock.allRunning, true, 'All mock containers should be running');
  console.log('   ✅ Resource Gates D-12 passed.');

  // --------------------------------------------------------------------------
  // 5. Orchestrator, Math & A/B Cycle Tests
  // --------------------------------------------------------------------------
  console.log('5. Testing Orchestrator, Math & A/B Cycles...');

  // Percentile calculation tests
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
  assert.strictEqual(calculatePercentile(numbers, 50), 50);
  assert.strictEqual(calculatePercentile(numbers, 95), 95);
  assert.strictEqual(calculatePercentile(numbers, 99), 99);
  assert.strictEqual(calculatePercentile([42], 95), 42);
  assert.strictEqual(calculatePercentile([], 50), 0);

  const stats = calculateStats([10, 20, 30, 40, 50]);
  assert.strictEqual(stats.n, 5);
  assert.strictEqual(stats.avg, 30);
  assert.strictEqual(stats.min, 10);
  assert.strictEqual(stats.max, 50);

  // Delta calculation tests
  assert.strictEqual(calculateDeltaPct(100, 105), 5);
  assert.strictEqual(calculateDeltaPct(100, 95), -5);
  assert.strictEqual(calculateDeltaPct(0, 0), 0);

  // Full A/B Benchmark Orchestrator Run (with Mock Driver & Reset Hook)
  let resetCallCount = 0;
  const recordedStates = [];

  const benchResult = await runBenchmark({
    config: loadBenchConfig({
      requestCount: 50,
      concurrency: 5,
      stages: ['OFF', 'ON', 'OFF', 'ON'],
    }),
    resetOrdersFn: async () => {
      resetCallCount++;
    },
    setRecorderStateFn: async (mode) => {
      recordedStates.push(mode);
    },
    mockContainerStatus: { tnm_db: true, tnm_redis: true, tnm_stub: true, tnm_app: true },
    requestFn: async ({ body }) => {
      const isErr = body.sku === ERROR_SKU;
      const isRecorded = recordedStates[recordedStates.length - 1] === 'ON';
      // Giả lập recorder ON thêm ~1ms overhead
      const baseDur = isErr ? 25.0 : 10.0;
      const dur = isRecorded ? baseDur + 1.0 : baseDur;
      return {
        statusCode: isErr ? 402 : 201,
        durationMs: dur,
        pathLabel: isErr ? 'P-persist' : 'P-discard',
      };
    },
  });

  assert.strictEqual(resetCallCount, 4, 'resetOrders() must be called before each of the 4 stages (D-11)');
  assert.deepStrictEqual(recordedStates, ['OFF', 'ON', 'OFF', 'ON'], 'A/B sequence must be OFF/ON/OFF/ON');
  assert.strictEqual(benchResult.stages.length, 4, 'Must complete 4 stages');
  assert.strictEqual(benchResult.verdict, 'PASS', 'Verdict must be PASS');

  // Verify Summary and Deltas
  const summaryDiscard = benchResult.summary['P-discard'];
  assert.ok(summaryDiscard.baseline_off.avg > 0);
  assert.ok(summaryDiscard.recorded_on.avg > summaryDiscard.baseline_off.avg);
  assert.ok(summaryDiscard.delta_pct.avg > 0, 'Delta % should be positive when recorded is slower');

  const summaryPersist = benchResult.summary['P-persist'];
  assert.ok(summaryPersist.baseline_off.avg > 0);
  assert.ok(summaryPersist.recorded_on.avg > summaryPersist.baseline_off.avg);
  console.log('   ✅ Orchestrator, math & A/B cycles passed.');

  // --------------------------------------------------------------------------
  // 6. Reporter & Schema Tests
  // --------------------------------------------------------------------------
  console.log('6. Testing Reporter Output (JSON, CSV, Text)...');

  // JSON Schema Verification
  const jsonReport = formatJsonReport(benchResult);
  const parsedJson = JSON.parse(jsonReport);
  assert.ok(parsedJson.metadata);
  assert.strictEqual(parsedJson.metadata.sampling, 'OFF');
  assert.ok(parsedJson.resource_gates);
  assert.strictEqual(parsedJson.resource_gates.passed, true);
  assert.ok(Array.isArray(parsedJson.stages));
  assert.strictEqual(parsedJson.stages.length, 4);
  assert.ok(parsedJson.summary['P-discard']);
  assert.ok(parsedJson.summary['P-persist']);
  assert.ok(parsedJson.summary.overall);
  assert.ok(parsedJson.summary.cpu_overhead);
  assert.ok(parsedJson.summary.memory_overhead);
  assert.strictEqual(parsedJson.verdict, 'PASS');

  // CSV Verification
  const csvReport = formatCsvReport(benchResult);
  assert.ok(csvReport.includes('path,metric,baseline_off,recorded_on,delta_pct,n_baseline,n_recorded'));
  assert.ok(csvReport.includes('P-discard,avg'));
  assert.ok(csvReport.includes('P-persist,p95'));
  assert.ok(csvReport.includes('resource,cpu_usage_ms'));

  // Text Summary Verification
  const textSummary = formatTextSummary(benchResult);
  assert.ok(textSummary.includes('REPRO SPIKE — B7a OVERHEAD BENCHMARK REPORT'));
  assert.ok(textSummary.includes('RESOURCE GATES (D-12)'));
  assert.ok(textSummary.includes('P-discard'));
  assert.ok(textSummary.includes('P-persist'));
  assert.ok(textSummary.includes('Sampling=OFF'));
  assert.ok(textSummary.includes('N='));
  assert.ok(textSummary.includes('FINAL VERDICT     : PASS'));
  console.log('   ✅ Reporter output passed.');

  console.log('\n================================================================================');
  console.log('🎉 ALL B7a Overhead Benchmark Harness Self-Checks PASSED (6/6 components)');
  console.log('================================================================================\n');
})().catch((err) => {
  console.error('\n❌ Self-Check Failed:', err);
  process.exit(1);
});
