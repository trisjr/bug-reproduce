'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/gate.js
 *  CỔNG INCONCLUSIVE TẦNG 1 (Spec-Spike-Protocol §2.6 · §3.5)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  VỊ TRÍ VÀ VAI TRÒ (Spec §3.5):
 *  ------------------------------
 *  [Tầng 1 — GATE lớp]
 *  Execution có thuộc Supported Execution Class (§2) không?
 *     │
 *     ├─ KHÔNG, hoặc KHÔNG KIỂM ĐƯỢC
 *     │     → verdict = inconclusive
 *     │     → KHÔNG chạy rubric §3.4
 *     │     → loại khỏi denominator (D=7, Spec §2.6 / §4)
 *     │
 *     └─ CÓ
 *           ▼
 *  [Tầng 2 — RUBRIC §3.4]
 *     → Execution matched / diverged (Nhị phân)
 *
 *  Quy tắc denominator (Spec §2.6 · §4.8):
 *    - `inconclusive` không bao giờ là kết quả của việc chạy rubric.
 *    - Cổng này đứng TRƯỚC rubric.
 */

const {
  CLASS_CONDITIONS,
  ASSESSMENT_MECHANISMS,
} = require('../contract');

const GATE_REASONS = Object.freeze({
  OUT_OF_CLASS: 'OUT_OF_CLASS',
  UNASSESSABLE_CLASS: 'UNASSESSABLE_CLASS',
  MISSING_CLASS_ASSESSMENT: 'MISSING_CLASS_ASSESSMENT',
  INVALID_CLASS_ASSESSMENT: 'INVALID_CLASS_ASSESSMENT',
  MISSING_ARTIFACT: 'MISSING_ARTIFACT',
});

/**
 * Validate cấu trúc khối class_assessment theo Spec §2.6.
 *
 * @param {object} block
 * @param {string[]} errors
 * @param {string} path
 */
function validateAssessmentBlock(block, errors, path) {
  if (block === undefined || block === null) {
    errors.push(
      path +
        ': THIẾU khối `class_assessment` — Spec §2.6 CAUTION: "KHÔNG có phương án capture im lặng". ' +
        'Artifact không mang đánh giá class là artifact KHÔNG HỢP LỆ.'
    );
    return;
  }
  if (typeof block !== 'object') {
    errors.push(path + ': `class_assessment` phải là object');
    return;
  }
  if (!(block.inClass === true || block.inClass === false || block.inClass === null)) {
    errors.push(
      path + '.inClass: phải là true | false | null (null = KHÔNG KIỂM ĐƯỢC, Spec §3.5)'
    );
  }
  if (!ASSESSMENT_MECHANISMS.includes(block.mechanism)) {
    errors.push(
      path +
        '.mechanism: phải là một trong ' +
        ASSESSMENT_MECHANISMS.join(' | ') +
        ' (Spec §2.6), got ' +
        JSON.stringify(block.mechanism)
    );
  }
  if (!Array.isArray(block.failedConditions)) {
    errors.push(path + '.failedConditions: phải là mảng');
  } else {
    for (const c of block.failedConditions) {
      if (!CLASS_CONDITIONS.includes(c)) {
        errors.push(path + '.failedConditions: "' + c + '" không thuộc S1–S7 (Spec §2.2)');
      }
    }
  }
  if (block.inClass === false) {
    const ax = block.exclusionAxis;
    const ok =
      ax &&
      typeof ax === 'object' &&
      ((ax.axis === 1 && typeof ax.group === 'string' && ax.group.length > 0) ||
        (ax.axis === 2 && typeof ax.dependency === 'string' && ax.dependency.length > 0));
    if (!ok) {
      errors.push(
        path +
          '.exclusionAxis: inClass=false thì BẮT BUỘC ghi trục loại trừ — ' +
          '{axis:1, group} (Spec §2.3) hoặc {axis:2, dependency} (Spec §2.4)'
      );
    }
    if (block.failedConditions.length === 0 && (!ax || ax.axis !== 2)) {
      errors.push(
        path + '.failedConditions: inClass=false theo trục 1 thì phải nêu điều kiện S1–S7 không thoả'
      );
    }
  }
}

/**
 * Đánh giá Cổng inconclusive Tầng 1 trên artifact.
 *
 * @param {object} artifact Artifact (từ capsule hoặc replay result)
 * @param {object} [options] Tùy chọn kiểm tra bổ sung
 * @returns {{
 *   verdict: 'pass' | 'inconclusive',
 *   inconclusive: boolean,
 *   reason?: string,
 *   details?: string,
 *   exclusionAxis?: object|null,
 *   failedConditions?: string[],
 *   mechanism?: string,
 *   errors?: string[],
 *   classAssessment?: object
 * }}
 */
function evaluateGate(artifact, options = {}) {
  if (!artifact || typeof artifact !== 'object') {
    return {
      verdict: 'inconclusive',
      inconclusive: true,
      reason: GATE_REASONS.MISSING_ARTIFACT,
      details: 'Artifact không tồn tại hoặc không phải là object hợp lệ',
    };
  }

  const assessment = artifact.classAssessment;
  if (assessment === undefined || assessment === null) {
    return {
      verdict: 'inconclusive',
      inconclusive: true,
      reason: GATE_REASONS.MISSING_CLASS_ASSESSMENT,
      details:
        'THIẾU khối class_assessment (Spec §2.6 CAUTION: "KHÔNG có phương án capture im lặng"). ' +
        'Artifact không mang đánh giá class bị loại khỏi denominator ở Cổng Tầng 1.',
    };
  }

  const validationErrors = [];
  validateAssessmentBlock(assessment, validationErrors, 'classAssessment');

  if (validationErrors.length > 0) {
    return {
      verdict: 'inconclusive',
      inconclusive: true,
      reason: GATE_REASONS.INVALID_CLASS_ASSESSMENT,
      details: 'Khối class_assessment không hợp lệ theo schema contract (Spec §2.6)',
      errors: validationErrors,
      classAssessment: assessment,
    };
  }

  // inClass === false: Execution chắc chắn nằm ngoài class (Spec §2.3 / §2.4)
  if (assessment.inClass === false) {
    return {
      verdict: 'inconclusive',
      inconclusive: true,
      reason: GATE_REASONS.OUT_OF_CLASS,
      details:
        'Execution nằm ngoài Supported Execution Class ' +
        (assessment.exclusionAxis
          ? '(Trục ' +
            assessment.exclusionAxis.axis +
            ': ' +
            (assessment.exclusionAxis.group || assessment.exclusionAxis.dependency) +
            ')'
          : '') +
        (assessment.failedConditions && assessment.failedConditions.length > 0
          ? ' — vi phạm điều kiện ' + assessment.failedConditions.join(', ')
          : ''),
      exclusionAxis: assessment.exclusionAxis || null,
      failedConditions: assessment.failedConditions || [],
      mechanism: assessment.mechanism,
      note: assessment.note || null,
      classAssessment: assessment,
    };
  }

  // inClass === null: Execution KHÔNG KIỂM ĐƯỢC (Spec §3.5 / §2.3 lời khai)
  if (assessment.inClass === null) {
    return {
      verdict: 'inconclusive',
      inconclusive: true,
      reason: GATE_REASONS.UNASSESSABLE_CLASS,
      details:
        'Execution không kiểm được trạng thái class (inClass: null, Spec §3.5). ' +
        'Loại khỏi denominator D=7 theo luật bảo toàn bằng chứng.',
      exclusionAxis: assessment.exclusionAxis || null,
      failedConditions: assessment.failedConditions || [],
      mechanism: assessment.mechanism,
      note: assessment.note || null,
      classAssessment: assessment,
    };
  }

  // inClass === true: Thoả mãn Cổng Tầng 1, cho phép tiếp tục vào Rubric Tầng 2
  return {
    verdict: 'pass',
    inconclusive: false,
    classAssessment: assessment,
  };
}

module.exports = {
  GATE_REASONS,
  validateAssessmentBlock,
  evaluateGate,
};
