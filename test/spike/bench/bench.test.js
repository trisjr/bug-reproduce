'use strict';

/**
 * Unit test suite cho B7a Overhead Benchmark Harness.
 * Kiểm thử chi tiết các phân hệ: config, load driver, cgroup sampler,
 * resource gates D-12, orchestrator chu kỳ A/B (D-11), và reporter JSON/CSV.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  loadBenchConfig,
  generateRequestPayload,
  runLoadDriver,
  ERROR_SKU,
  SUCCESS_SKUS,
  CUSTOMERS,
  parseKeyValueFile,
  takeSnapshot,
  computeMetricsDiff,
  evaluateResourceGates,
  probeForeignContainers,
  calculatePercentile,
  calculateStats,
  calculateDeltaPct,
  calculateStatsDelta,
  runBenchmark,
  formatJsonReport,
  formatCsvReport,
  formatTextSummary,
} = require('../../../src/spike/bench');

test('B7a Config: loads default values and validates overrides', () => {
  const config = loadBenchConfig();
  assert.strictEqual(config.sampling, 'OFF');
  assert.deepStrictEqual(config.stages, ['OFF', 'ON', 'OFF', 'ON']);
  assert.strictEqual(config.targetErrorRate, 0.05);
  assert.strictEqual(config.memLimitBytes, 320 * 1024 * 1024);
  assert.strictEqual(config.memWarningThresholdRatio, 0.9);

  const custom = loadBenchConfig({
    endpoint: 'http://custom-host:9000/checkout',
    concurrency: 16,
    requestCount: 2000,
    targetErrorRate: 0.02,
  });
  assert.strictEqual(custom.endpoint, 'http://custom-host:9000/checkout');
  assert.strictEqual(custom.concurrency, 16);
  assert.strictEqual(custom.requestCount, 2000);
  assert.strictEqual(custom.targetErrorRate, 0.02);

  assert.throws(() => loadBenchConfig({ concurrency: 0 }), TypeError);
  assert.throws(() => loadBenchConfig({ requestCount: -5 }), TypeError);
  assert.throws(() => loadBenchConfig({ targetErrorRate: 2.0 }), TypeError);
});

test('B7a Driver: generates deterministic 5% error rate and cycles SKUs/customers', () => {
  const N = 1000;
  const rate = 0.05;
  const payloads = [];

  for (let i = 0; i < N; i++) {
    payloads.push(generateRequestPayload(i, N, rate));
  }

  const errors = payloads.filter((p) => p.isTargetError);
  const successes = payloads.filter((p) => !p.isTargetError);

  assert.strictEqual(errors.length, 50, 'Exactly 50 errors (5%) for N=1000');
  assert.strictEqual(successes.length, 950, 'Exactly 950 successes (95%)');

  errors.forEach((p) => {
    assert.strictEqual(p.sku, ERROR_SKU);
    assert.ok(CUSTOMERS.includes(p.customer_id));
  });

  successes.forEach((p) => {
    assert.ok(SUCCESS_SKUS.includes(p.sku));
    assert.ok(CUSTOMERS.includes(p.customer_id));
  });
});

test('B7a Driver: runs load driver and categorizes P-discard vs P-persist', async () => {
  const result = await runLoadDriver({
    endpoint: 'http://mock/checkout',
    concurrency: 4,
    requestCount: 50,
    targetErrorRate: 0.1, // 10% error
    requestFn: async ({ body }) => {
      const isErr = body.sku === ERROR_SKU;
      return {
        statusCode: isErr ? 402 : 201,
        durationMs: isErr ? 30.0 : 12.0,
        pathLabel: isErr ? 'P-persist' : 'P-discard',
      };
    },
  });

  assert.strictEqual(result.requestCount, 50);
  assert.strictEqual(result.errorCount, 5);
  assert.strictEqual(result.successCount, 45);
  assert.strictEqual(result.latencies['P-persist'].length, 5);
  assert.strictEqual(result.latencies['P-discard'].length, 45);
  assert.strictEqual(result.latencies.all.length, 50);
  assert.strictEqual(result.statusCodes[201], 45);
  assert.strictEqual(result.statusCodes[402], 5);
});

test('B7a Sampler: parses cgroup key-value files and computes metric deltas', () => {
  const cpuContent = 'usage_usec 2000000\nnr_periods 200\nnr_throttled 10\nthrottled_usec 500000\n';
  const parsed = parseKeyValueFile(cpuContent);
  assert.strictEqual(parsed.usage_usec, 2000000);
  assert.strictEqual(parsed.nr_periods, 200);
  assert.strictEqual(parsed.nr_throttled, 10);
  assert.strictEqual(parsed.throttled_usec, 500000);

  const start = takeSnapshot({
    mockMetrics: {
      cpu: { usage_usec: 1000000, nr_periods: 100, nr_throttled: 0, throttled_usec: 0 },
      memory: { peak_bytes: 100 * 1024 * 1024, oom_kill: 0 },
    },
  });
  const end = takeSnapshot({
    mockMetrics: {
      cpu: { usage_usec: 2500000, nr_periods: 200, nr_throttled: 5, throttled_usec: 200000 },
      memory: { peak_bytes: 220 * 1024 * 1024, oom_kill: 0 },
    },
  });

  const diff = computeMetricsDiff(start, end);
  assert.strictEqual(diff.cpu_usage_usec_delta, 1500000);
  assert.strictEqual(diff.cpu_usage_ms_delta, 1500);
  assert.strictEqual(diff.nr_throttled_delta, 5);
  assert.strictEqual(diff.throttled_usec_delta, 200000);
  assert.strictEqual(diff.memory_peak_bytes, 220 * 1024 * 1024);
  assert.strictEqual(diff.oom_kill_delta, 0);
});

test('B7a Gates: verifies D-12 Resource Gates (throttling, OOM kill, memory warning, container probe)', async () => {
  const baseSnap = takeSnapshot({
    mockMetrics: {
      cpu: { usage_usec: 1000, nr_throttled: 0 },
      memory: { peak_bytes: 100 * 1024 * 1024, oom_kill: 0 },
    },
  });

  // Clean run
  const clean = evaluateResourceGates({
    startSnapshot: baseSnap,
    endSnapshot: baseSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(clean.passed, true);
  assert.strictEqual(clean.uninterpretable, false);
  assert.strictEqual(clean.aborted, false);
  assert.strictEqual(clean.warnings.length, 0);

  // Throttled run -> UNINTERPRETABLE
  const throttled = evaluateResourceGates({
    startSnapshot: baseSnap,
    endSnapshot: takeSnapshot({ mockMetrics: { cpu: { nr_throttled: 3 } } }),
    diff: { nr_throttled_delta: 3, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(throttled.uninterpretable, true);

  // OOM kill -> ABORTED
  const oom = evaluateResourceGates({
    startSnapshot: baseSnap,
    endSnapshot: takeSnapshot({ mockMetrics: { memory: { oom_kill: 1 } } }),
    diff: { nr_throttled_delta: 0, oom_kill_delta: 1, memory_peak_bytes: 320 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(oom.aborted, true);
  assert.strictEqual(oom.passed, false);

  // 90% memory peak warning (>= 288MB of 320MB)
  const highMem = evaluateResourceGates({
    startSnapshot: baseSnap,
    endSnapshot: baseSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 290 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: { allRunning: true },
  });
  assert.strictEqual(highMem.warnings.length, 1);
  assert.ok(highMem.warnings[0].includes('Memory peak reached'));

  // Container probe failure
  const downContainer = evaluateResourceGates({
    startSnapshot: baseSnap,
    endSnapshot: baseSnap,
    diff: { nr_throttled_delta: 0, oom_kill_delta: 0, memory_peak_bytes: 100 * 1024 * 1024 },
    memLimitBytes: 320 * 1024 * 1024,
    containerProbeResult: {
      allRunning: false,
      containers: { tnm_stub: { name: 'tnm_stub', status: 'dead', running: false } },
    },
  });
  assert.strictEqual(downContainer.passed, false);

  // Probe container mock
  const probe = await probeForeignContainers({
    mockStatus: { tnm_db: true, tnm_redis: true, tnm_stub: false, tnm_app: true },
  });
  assert.strictEqual(probe.allRunning, false);
  assert.strictEqual(probe.containers.tnm_stub.running, false);
});

test('B7a Orchestrator: executes A/B stages, calls resetOrders(), computes stats and deltas', async () => {
  // Math checks
  assert.strictEqual(calculatePercentile([10, 20, 30, 40, 50], 50), 30);
  assert.strictEqual(calculatePercentile([10, 20, 30, 40, 50], 95), 50);
  assert.strictEqual(calculateDeltaPct(10, 11), 10.0);
  assert.strictEqual(calculateDeltaPct(20, 18), -10.0);

  const stats = calculateStats([5, 10, 15, 20, 25]);
  assert.strictEqual(stats.n, 5);
  assert.strictEqual(stats.avg, 15);
  assert.strictEqual(stats.p50, 15);
  assert.strictEqual(stats.min, 5);
  assert.strictEqual(stats.max, 25);

  let resetCount = 0;
  const recordedHistory = [];

  const result = await runBenchmark({
    config: loadBenchConfig({
      requestCount: 20,
      concurrency: 2,
      stages: ['OFF', 'ON', 'OFF', 'ON'],
    }),
    resetOrdersFn: async () => {
      resetCount++;
    },
    setRecorderStateFn: async (mode) => {
      recordedHistory.push(mode);
    },
    mockContainerStatus: { tnm_db: true, tnm_redis: true, tnm_stub: true, tnm_app: true },
    requestFn: async ({ body }) => {
      const isErr = body.sku === ERROR_SKU;
      const isRecorded = recordedHistory[recordedHistory.length - 1] === 'ON';
      const dur = isErr ? (isRecorded ? 26.0 : 25.0) : (isRecorded ? 11.0 : 10.0);
      return {
        statusCode: isErr ? 402 : 201,
        durationMs: dur,
        pathLabel: isErr ? 'P-persist' : 'P-discard',
      };
    },
  });

  assert.strictEqual(resetCount, 4, 'resetOrders() must be called 4 times (before each stage)');
  assert.deepStrictEqual(recordedHistory, ['OFF', 'ON', 'OFF', 'ON']);
  assert.strictEqual(result.stages.length, 4);
  assert.strictEqual(result.verdict, 'PASS');

  // Verify Summary Deltas
  const discard = result.summary['P-discard'];
  assert.strictEqual(discard.baseline_off.avg, 10.0);
  assert.strictEqual(discard.recorded_on.avg, 11.0);
  assert.strictEqual(discard.delta_pct.avg, 10.0);

  const persist = result.summary['P-persist'];
  assert.strictEqual(persist.baseline_off.avg, 25.0);
  assert.strictEqual(persist.recorded_on.avg, 26.0);
  assert.strictEqual(persist.delta_pct.avg, 4.0);
});

test('B7a Reporter: produces valid JSON schema (MTP §3.1/§3.2), CSV and Text Summary', async () => {
  const result = await runBenchmark({
    config: loadBenchConfig({ requestCount: 10, concurrency: 2 }),
    mockContainerStatus: { tnm_db: true, tnm_redis: true, tnm_stub: true, tnm_app: true },
    requestFn: async ({ body }) => ({
      statusCode: body.sku === ERROR_SKU ? 402 : 201,
      durationMs: 15.0,
      pathLabel: body.sku === ERROR_SKU ? 'P-persist' : 'P-discard',
    }),
  });

  const jsonStr = formatJsonReport(result);
  const parsed = JSON.parse(jsonStr);
  assert.ok(parsed.metadata);
  assert.ok(parsed.resource_gates);
  assert.ok(parsed.stages);
  assert.ok(parsed.summary['P-discard']);
  assert.ok(parsed.summary['P-persist']);
  assert.ok(parsed.summary.overall);
  assert.ok(parsed.summary.cpu_overhead);
  assert.ok(parsed.summary.memory_overhead);
  assert.strictEqual(parsed.verdict, 'PASS');

  const csvStr = formatCsvReport(result);
  assert.ok(csvStr.includes('path,metric,baseline_off,recorded_on,delta_pct,n_baseline,n_recorded'));
  assert.ok(csvStr.includes('P-discard,avg'));
  assert.ok(csvStr.includes('P-persist,p95'));

  const textStr = formatTextSummary(result);
  assert.ok(textStr.includes('B7a OVERHEAD BENCHMARK REPORT'));
  assert.ok(textStr.includes('RESOURCE GATES (D-12)'));
  assert.ok(textStr.includes('P-discard'));
  assert.ok(textStr.includes('P-persist'));
  assert.ok(textStr.includes('Sampling=OFF'));
  assert.ok(textStr.includes('FINAL VERDICT     : PASS'));
});
