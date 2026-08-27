'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/attribution.js
 *  THỦ TỤC QUY TRÁCH NHIỆM DIVERGENCE 6 BƯỚC (Spec-Spike-Protocol §3.6 · ADR-011 D3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  QUYỀN SỞ HỮU & NGUYÊN TẮC THỨ TỰ (Spec §3.6):
 *  ---------------------------------------------
 *  1. Mục §3.6 là chủ sở hữu DUY NHẤT của thủ tục quy trách nhiệm.
 *  2. "Khớp đầu tiên thắng" — bước nào khớp trước thì thắng và thủ tục dừng.
 *  3. Quy lỗi cho Repro TRƯỚC khi quy lỗi cho developer:
 *       `redaction` (1), `incomplete-capture` (2), `truncated` (2b) đứng TRÊN `code` (5).
 *  4. ⛔ CẤM gộp thầm `unattributed` (6) vào `code` (5) (Spec §3.6 CAUTION).
 *  5. Bước 4 (`out-of-scope-determinism`): CẤM chọn khi K lần replay cho CÙNG verdict.
 */

const { isRedactionMarker, REDACTION_MARKER } = require('../contract');

const ATTRIBUTION_CAUSES = Object.freeze({
  REDACTION: 'redaction',
  INCOMPLETE_CAPTURE: 'incomplete-capture',
  TRUNCATED: 'truncated',
  VERSION_DRIFT: 'version-drift',
  OUT_OF_SCOPE_DETERMINISM: 'out-of-scope-determinism',
  CODE: 'code',
  UNATTRIBUTED: 'unattributed',
});

const ATTRIBUTION_STEPS = Object.freeze([
  { step: '1', cause: ATTRIBUTION_CAUSES.REDACTION },
  { step: '2', cause: ATTRIBUTION_CAUSES.INCOMPLETE_CAPTURE },
  { step: '2b', cause: ATTRIBUTION_CAUSES.TRUNCATED },
  { step: '3', cause: ATTRIBUTION_CAUSES.VERSION_DRIFT },
  { step: '4', cause: ATTRIBUTION_CAUSES.OUT_OF_SCOPE_DETERMINISM },
  { step: '5', cause: ATTRIBUTION_CAUSES.CODE },
  { step: '6', cause: ATTRIBUTION_CAUSES.UNATTRIBUTED },
]);

/**
 * Kiểm tra xem divergence có liên quan đến field đã redact không (Bước 1).
 */
function checkRedaction(divergence, context) {
  if (!divergence) return null;

  const expectedUnit = divergence.expectedUnit;
  const actualUnit = divergence.actualUnit;
  const mismatchedFields = divergence.mismatchedFields || [];

  // 1. Kiểm tra redactedFields trên expectedUnit hoặc actualUnit
  const expRedacted = (expectedUnit && expectedUnit.redactedFields) || [];
  const actRedacted = (actualUnit && actualUnit.redactedFields) || [];
  const allRedacted = new Set([...expRedacted, ...actRedacted]);

  if (context && Array.isArray(context.redactedFields)) {
    for (const f of context.redactedFields) allRedacted.add(f);
  }

  // Nếu bất kỳ mismatched field nào nằm trong redactedFields
  for (const f of mismatchedFields) {
    if (allRedacted.has(f)) {
      return {
        matchedField: f,
        redactedFields: Array.from(allRedacted),
        reason: `Mismatched field '${f}' nằm trong danh sách redactedFields`,
      };
    }
  }

  // 2. Kiểm tra marker trong arguments hoặc result
  function hasMarker(val) {
    if (typeof val === 'string' && (val.includes(REDACTION_MARKER) || isRedactionMarker(val))) {
      return true;
    }
    if (val && typeof val === 'object') {
      try {
        const json = JSON.stringify(val);
        return json.includes(REDACTION_MARKER);
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  if (
    (expectedUnit && (hasMarker(expectedUnit.arguments) || hasMarker(expectedUnit.result))) ||
    (actualUnit && (hasMarker(actualUnit.arguments) || hasMarker(actualUnit.result)))
  ) {
    return {
      matchedField: 'marker',
      redactedFields: Array.from(allRedacted),
      reason: 'Giá trị chứa REDACTION_MARKER tại điểm phân kỳ',
    };
  }

  return null;
}

/**
 * Kiểm tra xem divergence có phải do thiếu capture không (Bước 2).
 * Lưu ý: Phải loại trừ trường hợp truncated: true (sẽ do bước 2b xử lý).
 */
function checkIncompleteCapture(divergence, context, isTruncated) {
  // Nếu có cờ truncated tại điểm phân kỳ -> Không kết luận ở bước 2, nhường cho bước 2b
  if (isTruncated) {
    return null;
  }

  if (context && context.missingRecording === true) {
    return {
      manifestEntry: context.manifestEntry || context.missingRecordingReason || 'MISSING_RECORDING',
      manifestCommitHash: context.manifestCommitHash || null,
      reason: 'Replay layer ghi nhận MISSING_RECORDING không tìm thấy trong capsule (ADR-011 D4)',
    };
  }

  // Kiểm tra Known-Missing-Input Manifest
  if (context && Array.isArray(context.knownMissingInputs) && context.knownMissingInputs.length > 0) {
    const target = divergence && (divergence.expectedUnit?.target || divergence.actualUnit?.target);
    const kind = divergence && (divergence.expectedUnit?.kind || divergence.actualUnit?.kind);

    for (const missing of context.knownMissingInputs) {
      const missingTarget = typeof missing === 'string' ? missing : missing.target || missing.name;
      const missingKind = typeof missing === 'object' ? missing.kind : null;

      if (
        (target && typeof target === 'string' && target.toLowerCase().includes(String(missingTarget).toLowerCase())) ||
        (kind && missingKind && kind === missingKind)
      ) {
        return {
          manifestEntry: missing,
          manifestCommitHash: context.manifestCommitHash || null,
          reason: `Interaction khớp với Known-Missing-Input Manifest: ${JSON.stringify(missing)}`,
        };
      }
    }
  }

  // Nếu điểm phân kỳ là do actual phát ra interaction mà expected không có (length mismatch do thiếu)
  if (
    divergence &&
    divergence.point === 'length' &&
    divergence.actualUnitsCount > divergence.expectedUnitsCount &&
    context &&
    context.hasUnrecordedCall === true
  ) {
    return {
      manifestEntry: 'extra-actual-interaction',
      manifestCommitHash: context.manifestCommitHash || null,
      reason: 'Actual execution phát ra interaction không có trong capsule đã capture',
    };
  }

  return null;
}

/**
 * Kiểm tra xem capsule có bị cắt dữ liệu không (Bước 2b).
 */
function checkTruncated(divergence, context) {
  if (
    divergence &&
    (divergence.expectedUnit?.truncated === true ||
      divergence.actualUnit?.truncated === true ||
      divergence.truncated === true)
  ) {
    return {
      truncated: true,
      reason: 'Cờ truncated: true được bật tại điểm phân kỳ trong capsule (MTP §7.1 · Spec §3.6 Bước 2b)',
    };
  }

  if (context && (context.truncated === true || context.isTruncated === true)) {
    return {
      truncated: true,
      cutAxis: context.cutAxis || null,
      cutLevel: context.cutLevel || null,
      reason: 'Capsule bị cắt dữ liệu do kích thước buffer/row cap (SEC-008)',
    };
  }

  return null;
}

/**
 * Kiểm tra cờ Version Drift (Bước 3).
 */
function checkVersionDrift(divergence, context) {
  const driftObj = (context && context.drift) || (divergence && divergence.drift);
  if (!driftObj || typeof driftObj !== 'object') return null;

  const driftedAxes = [];
  for (const axis of ['gitCommit', 'runtime', 'dependency', 'schemaVersion']) {
    const entry = driftObj[axis];
    if (entry && entry.drifted === true) {
      driftedAxes.push({
        axis,
        capsule: entry.capsule,
        local: entry.local,
      });
    }
  }

  if (driftedAxes.length > 0) {
    return {
      driftedAxes,
      reason: `Phát hiện cờ drift được bật trên các trục: ${driftedAxes.map((d) => d.axis).join(', ')}`,
    };
  }

  return null;
}

/**
 * Kiểm tra tính phi tất định qua K lần replay (Bước 4).
 * CẤM chọn nhãn này khi K lần cho CÙNG verdict!
 */
function checkOutOfScopeDeterminism(divergence, context) {
  if (!context) return null;

  if (context.replayUnstable === true) {
    return {
      replays: context.replays || [],
      replayUnstable: true,
      reason: 'K lần replay cho verdict không ổn định (replay_unstable: true)',
    };
  }

  const replays = context.replays;
  if (Array.isArray(replays) && replays.length >= 2) {
    const verdicts = replays.map((r) => (typeof r === 'string' ? r : r && r.verdict));
    const first = verdicts[0];
    const isUnstable = verdicts.some((v) => v !== first);

    if (isUnstable) {
      return {
        replays: verdicts,
        replayUnstable: true,
        reason: `K=${replays.length} lần replay cho các verdict khác nhau: [${verdicts.join(', ')}] (Spec §3.6 Bước 4)`,
      };
    }
  }

  return null;
}

/**
 * Kiểm tra xem có phải do code local khác code capsule không (Bước 5).
 */
function checkCode(divergence, context) {
  if (context && (context.localCodeDiffers === true || context.codeMismatch === true)) {
    return {
      localCodeDiffers: true,
      reason: 'Code local khác code production trong capsule (Spec §3.6 Bước 5)',
    };
  }

  return null;
}

/**
 * Thủ tục quy trách nhiệm divergence 6 bước (Spec §3.6).
 *
 * @param {object} divergence Thông tin First Divergence Point từ Rubric
 * @param {object} [context] Bối cảnh thực thi (manifest, drift, replays, code flags...)
 * @returns {{
 *   step: '1' | '2' | '2b' | '3' | '4' | '5' | '6',
 *   cause: 'redaction' | 'incomplete-capture' | 'truncated' | 'version-drift' | 'out-of-scope-determinism' | 'code' | 'unattributed',
 *   reason: string,
 *   evidence?: object
 * }}
 */
function attributeDivergence(divergence, context = {}) {
  // Xác định trước xem có cờ truncated không để dùng trong mệnh đề loại trừ của Bước 2
  const truncatedEvidence = checkTruncated(divergence, context);
  const isTruncated = truncatedEvidence !== null;

  // -------------------------------------------------------------------------
  // BƯỚC 1: redaction (Spec §3.6 Bước 1 · ADR-011 D3)
  // -------------------------------------------------------------------------
  const redactionEvidence = checkRedaction(divergence, context);
  if (redactionEvidence) {
    return {
      step: '1',
      cause: ATTRIBUTION_CAUSES.REDACTION,
      reason: redactionEvidence.reason,
      evidence: redactionEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 2: incomplete-capture (Spec §3.6 Bước 2 · ADR-011 D3/D4)
  // -------------------------------------------------------------------------
  const incompleteEvidence = checkIncompleteCapture(divergence, context, isTruncated);
  if (incompleteEvidence) {
    return {
      step: '2',
      cause: ATTRIBUTION_CAUSES.INCOMPLETE_CAPTURE,
      reason: incompleteEvidence.reason,
      evidence: incompleteEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 2b: truncated (Spec §3.6 Bước 2b · MTP §7.1)
  // -------------------------------------------------------------------------
  if (truncatedEvidence) {
    return {
      step: '2b',
      cause: ATTRIBUTION_CAUSES.TRUNCATED,
      reason: truncatedEvidence.reason,
      evidence: truncatedEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 3: version-drift (Spec §3.6 Bước 3 · ADR-011 D3)
  // -------------------------------------------------------------------------
  const driftEvidence = checkVersionDrift(divergence, context);
  if (driftEvidence) {
    return {
      step: '3',
      cause: ATTRIBUTION_CAUSES.VERSION_DRIFT,
      reason: driftEvidence.reason,
      evidence: driftEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 4: out-of-scope-determinism (Spec §3.6 Bước 4 · U-25, K=3)
  // -------------------------------------------------------------------------
  const determinismEvidence = checkOutOfScopeDeterminism(divergence, context);
  if (determinismEvidence) {
    return {
      step: '4',
      cause: ATTRIBUTION_CAUSES.OUT_OF_SCOPE_DETERMINISM,
      reason: determinismEvidence.reason,
      evidence: determinismEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 5: code (Spec §3.6 Bước 5 · ADR-011 D3)
  // -------------------------------------------------------------------------
  const codeEvidence = checkCode(divergence, context);
  if (codeEvidence) {
    return {
      step: '5',
      cause: ATTRIBUTION_CAUSES.CODE,
      reason: codeEvidence.reason,
      evidence: codeEvidence,
    };
  }

  // -------------------------------------------------------------------------
  // BƯỚC 6: unattributed (Spec §3.6 Bước 6 · CAUTION: CẤM gộp vào code)
  // -------------------------------------------------------------------------
  return {
    step: '6',
    cause: ATTRIBUTION_CAUSES.UNATTRIBUTED,
    reason:
      'Không khớp bất kỳ bước nào trong thủ tục 1–5 (Spec §3.6 Bước 6). ' +
      'Được ghi nhận là unattributed riêng biệt, không gộp vào code.',
    evidence: {
      divergence,
    },
  };
}

module.exports = {
  ATTRIBUTION_CAUSES,
  ATTRIBUTION_STEPS,
  checkRedaction,
  checkIncompleteCapture,
  checkTruncated,
  checkVersionDrift,
  checkOutOfScopeDeterminism,
  checkCode,
  attributeDivergence,
};
