'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Orchestrator điều phối chu kỳ A/B xen kẽ OFF / ON / OFF / ON (D-11),
 * tự động gọi resetOrders() trước mỗi chặng để khử drift seq-scan,
 * và tính toán phân vị P50/P95/P99, avg, delta % cho P-discard và P-persist.
 */

const { loadBenchConfig } = require('./config');
const { runLoadDriver } = require('./driver');
const { takeSnapshot, computeMetricsDiff } = require('./sampler');
const { probeForeignContainers, evaluateResourceGates } = require('./gates');

/**
 * Tính giá trị phân vị (nearest rank) từ mảng đã sắp xếp tăng dần.
 *
 * @param {number[]} sortedArray
 * @param {number} percentile - Giá trị từ 0 đến 100
 * @returns {number}
 */
function calculatePercentile(sortedArray, percentile) {
  if (!sortedArray || sortedArray.length === 0) {
    return 0;
  }
  if (sortedArray.length === 1) {
    return sortedArray[0];
  }
  const p = Math.max(0, Math.min(100, percentile));
  const rank = Math.ceil((p / 100) * sortedArray.length) - 1;
  const index = Math.min(Math.max(0, rank), sortedArray.length - 1);
  return sortedArray[index];
}

/**
 * Tính toán các chỉ số thống kê (N, avg, P50, P95, P99, min, max) từ mảng latencies.
 *
 * @param {number[]} latencies
 * @returns {{
 *   n: number,
 *   avg: number,
 *   p50: number,
 *   p95: number,
 *   p99: number,
 *   min: number,
 *   max: number,
 * }}
 */
function calculateStats(latencies) {
  if (!latencies || latencies.length === 0) {
    return {
      n: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
    };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    n,
    avg: Number((sum / n).toFixed(3)),
    p50: Number(calculatePercentile(sorted, 50).toFixed(3)),
    p95: Number(calculatePercentile(sorted, 95).toFixed(3)),
    p99: Number(calculatePercentile(sorted, 99).toFixed(3)),
    min: Number(sorted[0].toFixed(3)),
    max: Number(sorted[n - 1].toFixed(3)),
  };
}

/**
 * Tính delta phần trăm giữa giá trị baseline và recorded: ((recorded - baseline) / baseline) * 100.
 *
 * @param {number} baselineVal
 * @param {number} recordedVal
 * @returns {number}
 */
function calculateDeltaPct(baselineVal, recordedVal) {
  if (baselineVal === 0) {
    return recordedVal === 0 ? 0 : 100.0;
  }
  const delta = ((recordedVal - baselineVal) / baselineVal) * 100;
  return Number(delta.toFixed(2));
}

/**
 * Tính delta thống kê giữa 2 tập stats baseline và recorded.
 *
 * @param {ReturnType<typeof calculateStats>} baselineStats
 * @param {ReturnType<typeof calculateStats>} recordedStats
 * @returns {{
 *   avg: number,
 *   p50: number,
 *   p95: number,
 *   p99: number,
 *   min: number,
 *   max: number,
 * }}
 */
function calculateStatsDelta(baselineStats, recordedStats) {
  return {
    avg: calculateDeltaPct(baselineStats.avg, recordedStats.avg),
    p50: calculateDeltaPct(baselineStats.p50, recordedStats.p50),
    p95: calculateDeltaPct(baselineStats.p95, recordedStats.p95),
    p99: calculateDeltaPct(baselineStats.p99, recordedStats.p99),
    min: calculateDeltaPct(baselineStats.min, recordedStats.min),
    max: calculateDeltaPct(baselineStats.max, recordedStats.max),
  };
}

/**
 * Reset bảng spike_order trước mỗi chặng để khử drift seq-scan (D-11).
 *
 * @param {object} [poolOrFn]
 */
async function resetOrders(poolOrFn) {
  if (!poolOrFn) {
    return;
  }
  if (typeof poolOrFn === 'function') {
    await poolOrFn();
    return;
  }
  if (typeof poolOrFn.query === 'function') {
    await poolOrFn.query('TRUNCATE TABLE spike_order RESTART IDENTITY');
  }
}

/**
 * Chạy toàn bộ Benchmark Harness theo chu kỳ A/B xen kẽ (D-11).
 *
 * @param {object} [options={}]
 * @param {typeof import('./config').DEFAULT_CONFIG} [options.config]
 * @param {Function} [options.resetOrdersFn] - Hàm reset database table spike_order
 * @param {Function} [options.setRecorderStateFn] - Hàm chuyển đổi trạng thái recorder (OFF/ON)
 * @param {Function} [options.requestFn] - Custom request function cho driver
 * @param {Function} [options.probeFn] - Custom container probe function
 * @param {object} [options.mockMetricsByStage] - Mock sampler metrics theo stage index
 * @param {Function} [options.onStageComplete] - Callback sau mỗi stage
 * @returns {Promise<{
 *   metadata: object,
 *   resource_gates: object,
 *   stages: object[],
 *   summary: object,
 *   verdict: 'PASS' | 'UNINTERPRETABLE' | 'ABORTED' | 'FAILED',
 * }>}
 */
async function runBenchmark(options = {}) {
  const config = options.config || loadBenchConfig(options);
  const resetOrdersFn = options.resetOrdersFn || (config.pool ? () => resetOrders(config.pool) : null);
  const setRecorderStateFn = options.setRecorderStateFn;
  const requestFn = options.requestFn;
  const probeFn = options.probeFn;
  const onStageComplete = options.onStageComplete;

  const stageResults = [];
  let allGatesPassed = true;
  let hasUninterpretable = false;
  let hasAborted = false;
  const aggregatedWarnings = [];
  const aggregatedErrors = [];

  // Mảng latencies tổng hợp theo baseline (OFF) và recorded (ON)
  const baselineLatencies = {
    all: [],
    'P-discard': [],
    'P-persist': [],
  };
  const recordedLatencies = {
    all: [],
    'P-discard': [],
    'P-persist': [],
  };

  let totalBaselineCpuUsageMs = 0;
  let totalRecordedCpuUsageMs = 0;
  let peakBaselineMemMb = 0;
  let peakRecordedMemMb = 0;

  for (let stageIdx = 0; stageIdx < config.stages.length; stageIdx++) {
    const stageMode = config.stages[stageIdx]; // 'OFF' | 'ON'

    // 1. Reset Orders trước mỗi chặng để khử drift seq-scan (D-11)
    if (typeof resetOrdersFn === 'function') {
      await resetOrdersFn();
    }

    // 2. Chuyển đổi trạng thái recorder sang OFF hoặc ON
    if (typeof setRecorderStateFn === 'function') {
      await setRecorderStateFn(stageMode, { stageIdx, config });
    }

    // 3. Khởi tạo Sampler snapshot
    const mockMetrics = options.mockMetricsByStage?.[stageIdx];
    const startSnapshot = takeSnapshot({
      cgroupPath: config.cgroupPath,
      mockMetrics: mockMetrics?.start,
    });

    // 4. Phát tải qua HTTP Load Driver
    const loadResult = await runLoadDriver({
      endpoint: config.endpoint,
      concurrency: config.concurrency,
      requestCount: config.requestCount,
      targetErrorRate: config.targetErrorRate,
      timeoutMs: config.timeoutMs,
      requestFn,
    });

    // 5. Kết thúc Sampler snapshot & tính diff
    const endSnapshot = takeSnapshot({
      cgroupPath: config.cgroupPath,
      mockMetrics: mockMetrics?.end,
    });
    const metricsDiff = computeMetricsDiff(startSnapshot, endSnapshot);

    // 6. Foreign Container Probe
    const containerProbeResult = await probeForeignContainers({
      dockerSocket: config.dockerSocket,
      containerNames: config.foreignContainers,
      mockStatus: options.mockContainerStatus,
      probeFn,
    });

    // 7. Đánh giá Resource Gates D-12
    const gateResult = evaluateResourceGates({
      startSnapshot,
      endSnapshot,
      diff: metricsDiff,
      memLimitBytes: config.memLimitBytes,
      memWarningThresholdRatio: config.memWarningThresholdRatio,
      containerProbeResult,
    });

    if (gateResult.warnings.length > 0) {
      aggregatedWarnings.push(...gateResult.warnings);
    }
    if (gateResult.errors.length > 0) {
      aggregatedErrors.push(...gateResult.errors);
    }
    if (gateResult.uninterpretable) {
      hasUninterpretable = true;
    }
    if (gateResult.aborted) {
      hasAborted = true;
    }
    if (!gateResult.passed) {
      allGatesPassed = false;
    }

    // 8. Tính stats phân vị cho stage
    const discardStats = calculateStats(loadResult.latencies['P-discard']);
    const persistStats = calculateStats(loadResult.latencies['P-persist']);
    const overallStats = calculateStats(loadResult.latencies.all);

    const stageData = {
      stage_index: stageIdx,
      mode: stageMode,
      request_count: loadResult.requestCount,
      success_count: loadResult.successCount,
      error_count: loadResult.errorCount,
      actual_error_rate: Number(loadResult.actualErrorRate.toFixed(4)),
      duration_ms: Number(loadResult.totalElapsedMs.toFixed(2)),
      paths: {
        'P-discard': discardStats,
        'P-persist': persistStats,
        overall: overallStats,
      },
      resource_diff: metricsDiff,
      gate_result: gateResult,
    };

    stageResults.push(stageData);

    // Gom dữ liệu vào baseline hoặc recorded
    if (stageMode === 'OFF') {
      baselineLatencies.all.push(...loadResult.latencies.all);
      baselineLatencies['P-discard'].push(...loadResult.latencies['P-discard']);
      baselineLatencies['P-persist'].push(...loadResult.latencies['P-persist']);
      totalBaselineCpuUsageMs += metricsDiff.cpu_usage_ms_delta;
      peakBaselineMemMb = Math.max(peakBaselineMemMb, metricsDiff.memory_peak_mb);
    } else {
      recordedLatencies.all.push(...loadResult.latencies.all);
      recordedLatencies['P-discard'].push(...loadResult.latencies['P-discard']);
      recordedLatencies['P-persist'].push(...loadResult.latencies['P-persist']);
      totalRecordedCpuUsageMs += metricsDiff.cpu_usage_ms_delta;
      peakRecordedMemMb = Math.max(peakRecordedMemMb, metricsDiff.memory_peak_mb);
    }

    if (typeof onStageComplete === 'function') {
      await onStageComplete({ stageIdx, stageData });
    }

    // Nếu bị Abort bởi OOM kill -> dừng chu kỳ ngay lập tức (fail-fast)
    if (gateResult.aborted) {
      break;
    }
  }

  // 9. Tổng hợp kết quả Baseline vs Recorded
  const summaryDiscardBaseline = calculateStats(baselineLatencies['P-discard']);
  const summaryDiscardRecorded = calculateStats(recordedLatencies['P-discard']);
  const summaryDiscardDelta = calculateStatsDelta(summaryDiscardBaseline, summaryDiscardRecorded);

  const summaryPersistBaseline = calculateStats(baselineLatencies['P-persist']);
  const summaryPersistRecorded = calculateStats(recordedLatencies['P-persist']);
  const summaryPersistDelta = calculateStatsDelta(summaryPersistBaseline, summaryPersistRecorded);

  const summaryOverallBaseline = calculateStats(baselineLatencies.all);
  const summaryOverallRecorded = calculateStats(recordedLatencies.all);
  const summaryOverallDelta = calculateStatsDelta(summaryOverallBaseline, summaryOverallRecorded);

  const cpuDeltaPct = calculateDeltaPct(totalBaselineCpuUsageMs, totalRecordedCpuUsageMs);
  const memoryDeltaMb = Number((peakRecordedMemMb - peakBaselineMemMb).toFixed(2));
  const memoryDeltaPct = calculateDeltaPct(peakBaselineMemMb, peakRecordedMemMb);

  // 10. Quyết định Verdict
  let verdict = 'PASS';
  if (hasAborted) {
    verdict = 'ABORTED';
  } else if (hasUninterpretable) {
    verdict = 'UNINTERPRETABLE';
  } else if (!allGatesPassed) {
    verdict = 'FAILED';
  }

  return {
    metadata: {
      run_id: config.runId,
      timestamp: new Date().toISOString(),
      sampling: config.sampling,
      concurrency: config.concurrency,
      request_count_per_stage: config.requestCount,
      target_error_rate: config.targetErrorRate,
      stages: config.stages,
      timeout_ms: config.timeoutMs,
      cgroup_path: config.cgroupPath,
      mem_limit_bytes: config.memLimitBytes,
    },
    resource_gates: {
      passed: allGatesPassed && !hasUninterpretable && !hasAborted,
      uninterpretable: hasUninterpretable,
      aborted: hasAborted,
      warnings: Array.from(new Set(aggregatedWarnings)),
      errors: Array.from(new Set(aggregatedErrors)),
    },
    stages: stageResults,
    summary: {
      'P-discard': {
        baseline_off: summaryDiscardBaseline,
        recorded_on: summaryDiscardRecorded,
        delta_pct: summaryDiscardDelta,
      },
      'P-persist': {
        baseline_off: summaryPersistBaseline,
        recorded_on: summaryPersistRecorded,
        delta_pct: summaryPersistDelta,
      },
      overall: {
        baseline_off: summaryOverallBaseline,
        recorded_on: summaryOverallRecorded,
        delta_pct: summaryOverallDelta,
      },
      cpu_overhead: {
        baseline_off_usage_ms: Number(totalBaselineCpuUsageMs.toFixed(2)),
        recorded_on_usage_ms: Number(totalRecordedCpuUsageMs.toFixed(2)),
        delta_pct: cpuDeltaPct,
      },
      memory_overhead: {
        baseline_off_peak_mb: Number(peakBaselineMemMb.toFixed(2)),
        recorded_on_peak_mb: Number(peakRecordedMemMb.toFixed(2)),
        delta_mb: memoryDeltaMb,
        delta_pct: memoryDeltaPct,
      },
    },
    verdict,
  };
}

module.exports = {
  calculatePercentile,
  calculateStats,
  calculateDeltaPct,
  calculateStatsDelta,
  resetOrders,
  runBenchmark,
};
