'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/index.js
 *  BỘ MÁY SO KHỚP NHỊ PHÂN 2 TẦNG & TRÍCH XUẤT EXECUTION DIFF (Spec §3.4–§3.6 · ADR-011)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  CẤU TRÚC 2 TẦNG:
 *  ----------------
 *  [Tầng 1 — GATE lớp (gate.js)]
 *     Kiểm tra Execution có thuộc Supported Execution Class không.
 *     Nếu KHÔNG/KHÔNG KIỂM ĐƯỢC -> verdict = 'inconclusive', loại khỏi D=7.
 *
 *  [Tầng 2 — RUBRIC (rubric.js)]
 *     So sánh 3 điều kiện nhị phân:
 *       (i) Độ dài bằng nhau sau normalization (nhóm đồng thời tính là 1 unit).
 *       (ii) Từng đơn vị exact trên 5 field (kind, target, arguments, direction, result).
 *       (iii) Hai neo U0 và U∞ khớp nhau (so danh tính loại outcomeIdentity).
 *     Nếu thoả 100% -> 'matched'.
 *     Nếu phân kỳ -> 'diverged' + First Divergence Point.
 *
 *  [QUY TRÁCH NHIỆM (attribution.js)]
 *     Thủ tục 6 bước: redaction -> incomplete-capture -> truncated (2b) -> version-drift -> out-of-scope-determinism -> code -> unattributed.
 *
 *  [DIFF FORMATTER (diff-formatter.js)]
 *     Xuất Execution Diff dạng text và JSON theo ADR-011.
 */

const fs = require('node:fs');
const { parseArtifact } = require('../contract');
const { evaluateGate, GATE_REASONS } = require('./gate');
const {
  evaluateRubric,
  groupInteractions,
  compareUnits,
  RUBRIC_CONDITIONS,
  EXACT_COMPARED_FIELDS,
} = require('./rubric');
const {
  attributeDivergence,
  ATTRIBUTION_CAUSES,
  ATTRIBUTION_STEPS,
} = require('./attribution');
const {
  formatDiffText,
  formatDiffJson,
  formatUnitSummary,
} = require('./diff-formatter');

/**
 * Load artifact từ object, JSON string hoặc filepath.
 * @param {object|string} input
 * @returns {object}
 */
function resolveArtifact(input) {
  if (!input) return null;
  if (typeof input === 'object') return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return parseArtifact(trimmed);
    }
    // Nếu là đường dẫn file
    if (fs.existsSync(input)) {
      const content = fs.readFileSync(input, 'utf8');
      return parseArtifact(content);
    }
  }
  return null;
}

/**
 * Hàm xác minh thực thi chính của Spike (2 Tầng + Attribution + Diff).
 *
 * @param {object|string} expectedCapsuleOrArtifact Artifact chuẩn đã capture ở production
 * @param {object|string} actualReplayArtifact Artifact thu được lúc replay ở local
 * @param {object} [options]
 * @param {object} [options.context] Bối cảnh phụ cho attribution (manifest, drift, replays...)
 * @returns {{
 *   verdict: 'matched' | 'diverged' | 'inconclusive',
 *   inconclusive: boolean,
 *   matched: boolean,
 *   gate?: object,
 *   rubric?: object,
 *   firstDivergence?: object,
 *   attribution?: object,
 *   diffText: string,
 *   diffJson: object
 * }}
 */
function verifyExecution(expectedCapsuleOrArtifact, actualReplayArtifact, options = {}) {
  const expected = resolveArtifact(expectedCapsuleOrArtifact);
  const actual = resolveArtifact(actualReplayArtifact);

  // -------------------------------------------------------------------------
  // TẦNG 1: CỔNG INCONCLUSIVE (Spec §3.5)
  // -------------------------------------------------------------------------
  const gateResult = evaluateGate(expected, options);
  if (gateResult.inconclusive) {
    const res = {
      verdict: 'inconclusive',
      inconclusive: true,
      matched: false,
      reason: gateResult.reason,
      details: gateResult.details,
      exclusionAxis: gateResult.exclusionAxis || null,
      failedConditions: gateResult.failedConditions || [],
      gate: gateResult,
    };
    res.diffText = formatDiffText(res);
    res.diffJson = formatDiffJson(res);
    return res;
  }

  // -------------------------------------------------------------------------
  // TẦNG 2: RUBRIC SO SÁNH NHỊ PHÂN (Spec §3.4)
  // -------------------------------------------------------------------------
  const rubricResult = evaluateRubric(expected, actual, options);

  if (rubricResult.verdict === 'matched') {
    const res = {
      verdict: 'matched',
      inconclusive: false,
      matched: true,
      gate: gateResult,
      rubric: rubricResult,
      totalUnits: rubricResult.totalUnits,
    };
    res.diffText = formatDiffText(res);
    res.diffJson = formatDiffJson(res);
    return res;
  }

  // -------------------------------------------------------------------------
  // PHÂN KỲ -> THỦ TỤC QUY TRÁCH NHIỆM 6 BƯỚC (Spec §3.6)
  // -------------------------------------------------------------------------
  const attrContext = Object.assign(
    {},
    expected && expected.drift ? { drift: expected.drift } : {},
    actual && actual.drift ? { drift: actual.drift } : {},
    options.context || {},
    options
  );

  const attributionResult = attributeDivergence(rubricResult.firstDivergence, attrContext);

  const res = {
    verdict: 'diverged',
    inconclusive: false,
    matched: false,
    gate: gateResult,
    rubric: rubricResult,
    firstDivergence: rubricResult.firstDivergence,
    attribution: attributionResult,
  };

  res.diffText = formatDiffText(res);
  res.diffJson = formatDiffJson(res);
  return res;
}

/**
 * Class wrapper cho ExecutionVerifier.
 */
class ExecutionVerifier {
  constructor(options = {}) {
    this.options = options;
  }

  verify(expected, actual, callOptions = {}) {
    return verifyExecution(expected, actual, Object.assign({}, this.options, callOptions));
  }

  evaluateGate(artifact, callOptions = {}) {
    return evaluateGate(artifact, Object.assign({}, this.options, callOptions));
  }

  evaluateRubric(expected, actual, callOptions = {}) {
    return evaluateRubric(expected, actual, Object.assign({}, this.options, callOptions));
  }

  attributeDivergence(divergence, context = {}) {
    return attributeDivergence(divergence, Object.assign({}, this.options.context, context));
  }

  formatDiffText(result) {
    return formatDiffText(result);
  }

  formatDiffJson(result) {
    return formatDiffJson(result);
  }
}

module.exports = {
  verifyExecution,
  ExecutionVerifier,
  // Gate
  evaluateGate,
  GATE_REASONS,
  // Rubric
  evaluateRubric,
  groupInteractions,
  compareUnits,
  RUBRIC_CONDITIONS,
  EXACT_COMPARED_FIELDS,
  // Attribution
  attributeDivergence,
  ATTRIBUTION_CAUSES,
  ATTRIBUTION_STEPS,
  // Diff formatter
  formatDiffText,
  formatDiffJson,
  formatUnitSummary,
};
