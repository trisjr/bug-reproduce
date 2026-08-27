'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Reporter cho Overhead Benchmark Harness (B7a).
 * Xuất báo cáo theo định dạng JSON chuẩn (MTP §3.1/§3.2), CSV và Text Summary
 * hiển thị đầy đủ N cạnh mọi P95/P99 và điều kiện đo (error_rate, sampling = OFF).
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
 * Xuất báo cáo benchmark định dạng CSV.
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

    const base = pathSummary.baseline_off || {};
    const rec = pathSummary.recorded_on || {};
    const delta = pathSummary.delta_pct || {};

    const nBase = base.n || 0;
    const nRec = rec.n || 0;

    for (const metric of metrics) {
      const baseVal = base[metric] !== undefined ? base[metric] : '';
      const recVal = rec[metric] !== undefined ? rec[metric] : '';
      const deltaVal = delta[metric] !== undefined ? `${delta[metric]}%` : '';

      rows.push(`${pathKey},${metric},${baseVal},${recVal},${deltaVal},${nBase},${nRec}`);
    }
  }

  // Thêm CPU & Memory metrics vào cuối CSV
  if (summary.cpu_overhead) {
    const cpu = summary.cpu_overhead;
    rows.push(`resource,cpu_usage_ms,${cpu.baseline_off_usage_ms},${cpu.recorded_on_usage_ms},${cpu.delta_pct}%,,`);
  }
  if (summary.memory_overhead) {
    const mem = summary.memory_overhead;
    rows.push(`resource,memory_peak_mb,${mem.baseline_off_peak_mb},${mem.recorded_on_peak_mb},${mem.delta_pct}%,,`);
  }

  return rows.join('\n');
}

/**
 * Tạo bảng text tóm tắt kết quả benchmark cho CLI console.
 * Bắt buộc in N cạnh mọi P95/P99 và ghi rõ tỷ lệ lỗi, sampling = OFF (MTP §2.5, §3.2).
 *
 * @param {object} benchmarkResult
 * @returns {string}
 */
function formatTextSummary(benchmarkResult) {
  const meta = benchmarkResult.metadata || {};
  const gates = benchmarkResult.resource_gates || {};
  const summary = benchmarkResult.summary || {};
  const verdict = benchmarkResult.verdict || 'UNKNOWN';

  const lines = [];

  lines.push('================================================================================');
  lines.push('               REPRO SPIKE — B7a OVERHEAD BENCHMARK REPORT                      ');
  lines.push('================================================================================');
  lines.push(`Run ID            : ${meta.run_id || 'N/A'}`);
  lines.push(`Timestamp         : ${meta.timestamp || 'N/A'}`);
  lines.push(`Conditions        : Concurrency=${meta.concurrency}, Req/Stage=${meta.request_count_per_stage}, Error_Rate=${((meta.target_error_rate || 0.05) * 100).toFixed(0)}%, Sampling=${meta.sampling || 'OFF'}`);
  lines.push(`A/B Sequence      : ${(meta.stages || []).join(' -> ')}`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push('1. RESOURCE GATES (D-12):');
  lines.push(`   Status         : ${gates.passed ? 'PASSED' : 'NOT PASSED'}`);
  lines.push(`   Throttling     : ${gates.uninterpretable ? 'FAILED (CFS throttled)' : 'OK (No throttling)'}`);
  lines.push(`   OOM Kill       : ${gates.aborted ? 'FAILED (OOM Kill occurred)' : 'OK (0 events)'}`);
  if (gates.warnings && gates.warnings.length > 0) {
    for (const w of gates.warnings) {
      lines.push(`   ⚠️ Warning     : ${w}`);
    }
  }
  if (gates.errors && gates.errors.length > 0) {
    for (const e of gates.errors) {
      lines.push(`   ❌ Error       : ${e}`);
    }
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('2. LATENCY OVERHEAD SUMMARY (In-Process ms):');
  lines.push('   Path        | Metric | Baseline (OFF) | Recorded (ON)  | Delta (%)');
  lines.push('   ------------+--------+----------------+----------------+-----------');

  const paths = [
    { key: 'P-discard', label: 'P-discard  ' },
    { key: 'P-persist', label: 'P-persist  ' },
    { key: 'overall',   label: 'Overall    ' },
  ];

  for (const { key, label } of paths) {
    const pData = summary[key];
    if (!pData) continue;

    const b = pData.baseline_off || {};
    const r = pData.recorded_on || {};
    const d = pData.delta_pct || {};

    lines.push(`   ${label} | Avg    | ${String(b.avg || 0).padStart(8)} ms     | ${String(r.avg || 0).padStart(8)} ms     | ${String(d.avg >= 0 ? `+${d.avg}` : d.avg).padStart(6)}%`);
    lines.push(`               | P50    | ${String(b.p50 || 0).padStart(8)} ms     | ${String(r.p50 || 0).padStart(8)} ms     | ${String(d.p50 >= 0 ? `+${d.p50}` : d.p50).padStart(6)}% (N=${b.n}/${r.n})`);
    lines.push(`               | P95    | ${String(b.p95 || 0).padStart(8)} ms     | ${String(r.p95 || 0).padStart(8)} ms     | ${String(d.p95 >= 0 ? `+${d.p95}` : d.p95).padStart(6)}% (N=${b.n}/${r.n})`);
    lines.push(`               | P99    | ${String(b.p99 || 0).padStart(8)} ms     | ${String(r.p99 || 0).padStart(8)} ms     | ${String(d.p99 >= 0 ? `+${d.p99}` : d.p99).padStart(6)}% (N=${b.n}/${r.n})`);
    lines.push('   ------------+--------+----------------+----------------+-----------');
  }

  lines.push('3. RESOURCE OVERHEAD:');
  if (summary.cpu_overhead) {
    const cpu = summary.cpu_overhead;
    lines.push(`   CPU Usage      : Baseline=${cpu.baseline_off_usage_ms}ms, Recorded=${cpu.recorded_on_usage_ms}ms (Delta: ${cpu.delta_pct >= 0 ? `+${cpu.delta_pct}` : cpu.delta_pct}%)`);
  }
  if (summary.memory_overhead) {
    const mem = summary.memory_overhead;
    lines.push(`   Memory Peak    : Baseline=${mem.baseline_off_peak_mb}MB, Recorded=${mem.recorded_on_peak_mb}MB (Delta: ${mem.delta_mb >= 0 ? `+${mem.delta_mb}` : mem.delta_mb}MB, ${mem.delta_pct >= 0 ? `+${mem.delta_pct}` : mem.delta_pct}%)`);
  }

  lines.push('================================================================================');
  lines.push(`FINAL VERDICT     : ${verdict}`);
  lines.push('================================================================================');

  return lines.join('\n');
}

module.exports = {
  formatJsonReport,
  formatCsvReport,
  formatTextSummary,
};
