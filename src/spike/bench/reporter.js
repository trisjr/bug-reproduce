'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Reporter cho Benchmark Harness (B7a Overhead + B7b Fidelity & Composite).
 * Xuất báo cáo theo định dạng JSON chuẩn (MTP §3.1/§3.2), CSV và Text Summary
 * hiển thị đầy đủ N cạnh mọi P95/P99 và điều kiện đo.
 */

/**
 * Xuất báo cáo benchmark định dạng JSON (chuẩn MTP §3.1, §3.2).
 *
 * @param {object} benchmarkResult
 * @param {boolean} [pretty=true]
 * @returns {string}
 */
function formatJsonReport(benchmarkResult, pretty = true) {
  return JSON.stringify(benchmarkResult, null, pretty ? 2 : undefined);
}

/**
 * Xuất báo cáo benchmark overhead định dạng CSV (B7a).
 *
 * @param {object} benchmarkResult
 * @returns {string}
 */
function formatCsvReport(benchmarkResult) {
  const summary = benchmarkResult.summary || {};
  const rows = [
    'path,metric,baseline_off,recorded_on,delta_pct,n_baseline,n_recorded',
  ];

  const paths = ['P-discard', 'P-persist', 'overall'];
  const metrics = ['avg', 'p50', 'p95', 'p99', 'min', 'max'];

  for (const pathKey of paths) {
    const pathSummary = summary[pathKey];
    if (!pathSummary) continue;

    for (const metric of metrics) {
      const baseVal = pathSummary.baseline_off ? pathSummary.baseline_off[metric] : '';
      const recVal = pathSummary.recorded_on ? pathSummary.recorded_on[metric] : '';
      const deltaVal = pathSummary.delta_pct ? pathSummary.delta_pct[metric] : '';
      const nBase = pathSummary.baseline_off ? pathSummary.baseline_off.n : '';
      const nRec = pathSummary.recorded_on ? pathSummary.recorded_on.n : '';

      rows.push(
        [
          pathKey,
          metric,
          baseVal !== undefined ? baseVal : '',
          recVal !== undefined ? recVal : '',
          deltaVal !== undefined ? deltaVal : '',
          nBase !== undefined ? nBase : '',
          nRec !== undefined ? nRec : '',
        ].join(',')
      );
    }
  }

  // Thêm CPU & Memory metrics vào cuối CSV
  if (summary.cpu_overhead) {
    rows.push(`cpu,avg_cpu_delta_pct,,,${summary.cpu_overhead.avg_cpu_delta_pct || ''},,`);
  }
  if (summary.memory_overhead) {
    rows.push(`memory,avg_rss_delta_mb,,,${summary.memory_overhead.avg_rss_delta_mb || ''},,`);
    rows.push(`memory,peak_rss_mb,,,${summary.memory_overhead.peak_rss_mb || ''},,`);
  }

  return rows.join('\n');
}

/**
 * Xuất báo cáo Fidelity benchmark định dạng CSV (B7b).
 *
 * @param {object} fidelityResult
 * @returns {string}
 */
function formatFidelityCsvReport(fidelityResult) {
  const rows = [
    'scenario_id,in_class,k_runs,success_count,matched_count,success_rate_pct,match_rate_pct,fully_reproduced',
  ];

  const summaries = fidelityResult.scenario_summaries || {};
  for (const [id, sc] of Object.entries(summaries)) {
    rows.push(
      [
        id,
        sc.in_class,
        sc.k_runs,
        sc.success_count,
        sc.matched_count,
        sc.success_rate_pct,
        sc.match_rate_pct,
        sc.fully_reproduced,
      ].join(',')
    );
  }

  return rows.join('\n');
}

/**
 * Xuất báo cáo Composite benchmark định dạng CSV (B7b).
 *
 * @param {object} compositeResult
 * @returns {string}
 */
function formatCompositeCsvReport(compositeResult) {
  const rows = [
    'hypothesis_id,hypothesis_name,threshold,actual_value,verdict',
  ];

  const hypotheses = compositeResult.hypotheses_evaluation || [];
  for (const h of hypotheses) {
    rows.push(
      [
        h.id,
        `"${h.name}"`,
        `"${h.threshold}"`,
        `"${h.actual}"`,
        h.passed ? 'PASS' : 'FAIL',
      ].join(',')
    );
  }

  return rows.join('\n');
}

/**
 * Tạo bảng text tóm tắt kết quả benchmark overhead cho CLI console (B7a).
 *
 * @param {object} benchmarkResult
 * @returns {string}
 */
function formatTextSummary(benchmarkResult) {
  const summary = benchmarkResult.summary || {};
  const config = benchmarkResult.config || {};
  const gates = benchmarkResult.resource_gates;
  const lines = [];

  lines.push('================================================================================');
  lines.push(' REPRO SPIKE — B7a OVERHEAD BENCHMARK REPORT');
  lines.push('================================================================================');
  lines.push(` Timestamp : ${benchmarkResult.timestamp || new Date().toISOString()}`);
  lines.push(` Strategy  : ${config.strategy || 'alternating (OFF/ON/OFF/ON)'} (Sampling=OFF)`);
  lines.push(` Duration  : ${((benchmarkResult.total_duration_ms || 0) / 1000).toFixed(1)}s`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push(' 1. LATENCY OVERHEAD SUMMARY');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(' Path        | Metric | Baseline OFF | Recorded ON  | Delta %   | N (off/on)');
  lines.push('-------------+--------+--------------+--------------+-----------+---------------');

  const paths = ['P-discard', 'P-persist', 'overall'];
  for (const pathKey of paths) {
    const p = summary[pathKey];
    if (!p) continue;
    for (const metric of ['avg', 'p50', 'p95', 'p99']) {
      const offVal = p.baseline_off ? p.baseline_off[metric] : 0;
      const onVal = p.recorded_on ? p.recorded_on[metric] : 0;
      const deltaVal = p.delta_pct ? p.delta_pct[metric] : 0;
      const nBase = p.baseline_off ? p.baseline_off.n : 0;
      const nRec = p.recorded_on ? p.recorded_on.n : 0;

      const offStr = `${Number(offVal || 0).toFixed(2)}ms`.padEnd(12);
      const onStr = `${Number(onVal || 0).toFixed(2)}ms`.padEnd(12);
      const deltaStr = `${Number(deltaVal || 0) >= 0 ? '+' : ''}${Number(deltaVal || 0).toFixed(2)}%`.padEnd(9);
      const nStr = `${nBase}/${nRec}`;
      lines.push(` ${pathKey.padEnd(11)} | ${metric.padEnd(6)} | ${offStr} | ${onStr} | ${deltaStr} | ${nStr}`);
    }
    lines.push('-------------+--------+--------------+--------------+-----------+---------------');
  }

  if (gates) {
    lines.push(' 2. RESOURCE GATES (D-12)');
    lines.push('--------------------------------------------------------------------------------');
    lines.push(` Throttling Gate : ${gates.uninterpretable ? 'FAILED (Throttled)' : 'PASSED'}`);
    lines.push(` OOM Kill Gate   : ${gates.aborted ? 'FAILED (OOM Kill)' : 'PASSED'}`);
    lines.push(` Resource Status : ${gates.passed ? 'ALL GATES PASSED' : 'VIOLATION DETECTED'}`);
    lines.push('--------------------------------------------------------------------------------');
  }

  if (summary.cpu_overhead || summary.memory_overhead) {
    lines.push(' 3. RESOURCE OVERHEAD SUMMARY');
    lines.push('--------------------------------------------------------------------------------');
    if (summary.cpu_overhead) {
      lines.push(` CPU Delta %  : +${(summary.cpu_overhead.avg_cpu_delta_pct || 0).toFixed(2)}%`);
    }
    if (summary.memory_overhead) {
      lines.push(` RSS Delta MB : +${(summary.memory_overhead.avg_rss_delta_mb || 0).toFixed(2)} MB (Peak: ${(summary.memory_overhead.peak_rss_mb || 0).toFixed(1)} MB)`);
    }
    lines.push('--------------------------------------------------------------------------------');
  }

  lines.push(` FINAL VERDICT     : ${benchmarkResult.verdict || 'UNKNOWN'}`);
  lines.push('================================================================================');

  return lines.join('\n');
}

/**
 * Tạo bảng text tóm tắt kết quả Composite Benchmark cho CLI console (B7b).
 *
 * @param {object} compositeResult
 * @returns {string}
 */
function formatCompositeTextSummary(compositeResult) {
  const sum = compositeResult.composite_summary || {};
  const hyps = compositeResult.hypotheses_evaluation || [];
  const lines = [];

  lines.push('================================================================================');
  lines.push(' REPRO SPIKE PHASE 0 (P0-B) — COMPOSITE METRIC EVALUATION (B7b / RQ §24)');
  lines.push('================================================================================');
  lines.push(` Timestamp       : ${compositeResult.timestamp || new Date().toISOString()}`);
  lines.push(` Overall Verdict : ${compositeResult.verdict || 'UNKNOWN'}`);
  lines.push(` Total Duration  : ${((compositeResult.total_duration_ms || 0) / 1000).toFixed(2)}s`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push(' 1. SIX CORE METRICS (Phase 0 Spike Targets)');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(` (1) Replay Success Rate (R_sr) : ${(sum.replay_success_rate_pct || 0).toFixed(2)}% (on D=7 in-class)`);
  lines.push(` (2) Execution Match Rate (R_em): ${(sum.execution_match_rate_pct || 0).toFixed(2)}% (on D=7 in-class)`);
  lines.push(` (3) Scenarios Reproduced Rate  : ${sum.reproduced_ratio || '6/7'} (${(sum.reproduced_pct || 0).toFixed(2)}%)`);
  lines.push(` (4) Production Latency Delta   : +${(sum.production_latency_delta_pct || 0).toFixed(2)}%`);
  lines.push(` (5) Capsule Size (Avg / P95)   : ${(sum.avg_capsule_size_mb || 0).toFixed(4)} MB / ${(sum.p95_capsule_size_mb || 0).toFixed(4)} MB`);
  lines.push(` (6) Replay Duration (Avg / P95): ${(sum.avg_replay_time_seconds || 0).toFixed(4)}s / ${(sum.p95_replay_time_seconds || 0).toFixed(4)}s`);
  lines.push(` (7) Escaped Side Effects       : ${sum.escaped_side_effects || 0} (Invariant ADR-005)`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push(' 2. RQ §24 INITIAL HYPOTHESES EVALUATION');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(' ID                      | Threshold         | Actual Value           | Verdict');
  lines.push('-------------------------+-------------------+------------------------+--------');

  for (const h of hyps) {
    const idStr = h.id.padEnd(23);
    const thStr = h.threshold.padEnd(17);
    const actStr = h.actual.padEnd(22);
    const vStr = h.passed ? 'PASS' : 'FAIL';
    lines.push(` ${idStr} | ${thStr} | ${actStr} | ${vStr}`);
  }

  lines.push('================================================================================');

  return lines.join('\n');
}

module.exports = {
  formatJsonReport,
  formatCsvReport,
  formatFidelityCsvReport,
  formatCompositeCsvReport,
  formatTextSummary,
  formatCompositeTextSummary,
};
