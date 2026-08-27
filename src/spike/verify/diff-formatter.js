'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/diff-formatter.js
 *  TRÍCH XUẤT EXECUTION DIFF HẠNG NHẤT (ADR-011 · Spec §9 · §3.4)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  ĐỊNH DẠNG THEO ADR-011 & SPEC §9:
 *  ----------------------------------
 *  ⚠️ Execution diverged
 *
 *  First Divergence Point: Unit #k [Kind: target]
 *  Attributed Cause: <cause> (Step <step>) — <reason>
 *
 *  Production → <expected_value>
 *  Local      → <actual_value>
 */

const { canonicalJson } = require('../contract');

/**
 * Chuyển một giá trị / unit thành chuỗi đại diện ngắn gọn cho diff output.
 */
function formatUnitSummary(unit) {
  if (!unit) return '(none / missing)';
  if (unit.type === 'concurrency-group') {
    const items = (unit.interactions || []).map((i) => `${i.kind}: ${i.target || '(no target)'}`);
    return `[ConcurrencyGroup ${unit.groupId}: ${items.join(', ')}]`;
  }
  const item = unit.interaction || unit;
  if (!item.kind) {
    if (item.class && item.type) {
      return `Outcome ${item.class}:${item.type}`;
    }
    return JSON.stringify(item);
  }
  const targetStr = item.target !== null && item.target !== undefined ? ` '${item.target}'` : '';
  const dirStr = item.direction ? ` [${item.direction}]` : '';
  const resStr = item.result ? ` -> result: ${item.result}` : '';
  const argsStr = item.arguments && item.arguments !== '{}' ? ` args: ${item.arguments}` : '';
  return `${item.kind}${targetStr}${dirStr}${argsStr}${resStr}`;
}

/**
 * Format kết quả verification thành chuỗi text/CLI.
 *
 * @param {object} result Kết quả từ verifyExecution()
 * @returns {string}
 */
function formatDiffText(result) {
  if (!result) return 'No verification result to display';

  const lines = [];

  // Trạng thái 1: Inconclusive (Cổng Tầng 1)
  if (result.inconclusive || result.verdict === 'inconclusive') {
    lines.push('⏸️ Execution inconclusive (Cổng Tầng 1 — Spec §3.5)');
    lines.push(`Lý do: ${result.reason || (result.gate && result.gate.reason) || 'Chưa xác định'}`);
    if (result.details || (result.gate && result.gate.details)) {
      lines.push(`Chi tiết: ${result.details || result.gate.details}`);
    }
    if (result.exclusionAxis || (result.gate && result.gate.exclusionAxis)) {
      const ax = result.exclusionAxis || result.gate.exclusionAxis;
      lines.push(`Trục loại trừ: Trục ${ax.axis} (${ax.group || ax.dependency})`);
    }
    if (result.failedConditions && result.failedConditions.length > 0) {
      lines.push(`Điều kiện không thoả: ${result.failedConditions.join(', ')}`);
    }
    lines.push('Hệ quả: Loại khỏi denominator D=7, KHÔNG chạy Rubric Tầng 2.');
    return lines.join('\n');
  }

  // Trạng thái 2: Matched (Rubric Tầng 2 thoả mãn 100%)
  if (result.matched || result.verdict === 'matched') {
    lines.push('✓ Execution matched');
    lines.push(`Tổng số đơn vị so sánh: ${result.totalUnits ?? (result.rubric && result.rubric.totalUnits) ?? 0}`);
    lines.push('Mọi điều kiện của Spec §3.4 đều thoả mãn (độ dài, từng đơn vị exact, hai neo U0/U∞).');
    return lines.join('\n');
  }

  // Trạng thái 3: Diverged (Rubric Tầng 2 phân kỳ)
  lines.push('⚠️ Execution diverged\n');

  const div = result.firstDivergence || (result.rubric && result.rubric.firstDivergence);
  const attr = result.attribution;

  if (div) {
    const pointStr = div.point ? `[${div.point.toUpperCase()}]` : '';
    const indexStr = div.index !== undefined ? `Đơn vị #${div.index}` : '';
    lines.push(`First Divergence Point: ${indexStr} ${pointStr}`);
    if (div.reason) {
      lines.push(`Mô tả: ${div.reason}`);
    }
  }

  if (attr) {
    lines.push(`\nQuy trách nhiệm (Spec §3.6 Bước ${attr.step}): ${attr.cause.toUpperCase()}`);
    lines.push(`Căn cứ: ${attr.reason}`);
  }

  lines.push('\nChi tiết so sánh (ADR-011 D2):');
  if (div) {
    const expStr = formatUnitSummary(div.expectedUnit);
    const actStr = formatUnitSummary(div.actualUnit);
    lines.push(`   Production → ${expStr}`);
    lines.push(`   Local      → ${actStr}`);

    if (div.mismatchedFields && div.mismatchedFields.length > 0) {
      lines.push(`   Mismatched Fields: ${div.mismatchedFields.join(', ')}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format kết quả verification thành JSON object có cấu trúc chuẩn máy đọc được.
 *
 * @param {object} result Kết quả từ verifyExecution()
 * @returns {object}
 */
function formatDiffJson(result) {
  if (!result) return { schema: 'repro.spike.execution-diff', valid: false };

  const div = result.firstDivergence || (result.rubric && result.rubric.firstDivergence) || null;
  const attr = result.attribution || null;
  const gate = result.gate || (result.inconclusive ? result : null);

  return {
    schema: 'repro.spike.execution-diff',
    verdict: result.verdict,
    inconclusive: Boolean(result.inconclusive),
    matched: Boolean(result.matched),
    gate: gate
      ? {
          reason: gate.reason,
          details: gate.details,
          exclusionAxis: gate.exclusionAxis || null,
          failedConditions: gate.failedConditions || [],
        }
      : null,
    rubric: result.rubric
      ? {
          matched: result.rubric.matched,
          conditionFailed: result.rubric.conditionFailed || null,
          totalUnits: result.rubric.totalUnits || 0,
        }
      : null,
    firstDivergence: div
      ? {
          point: div.point,
          index: div.index,
          reason: div.reason,
          mismatchedFields: div.mismatchedFields || [],
          expectedSummary: formatUnitSummary(div.expectedUnit),
          actualSummary: formatUnitSummary(div.actualUnit),
          expectedUnit: div.expectedUnit || null,
          actualUnit: div.actualUnit || null,
        }
      : null,
    attribution: attr
      ? {
          step: attr.step,
          cause: attr.cause,
          reason: attr.reason,
          evidence: attr.evidence || null,
        }
      : null,
  };
}

module.exports = {
  formatUnitSummary,
  formatDiffText,
  formatDiffJson,
};
