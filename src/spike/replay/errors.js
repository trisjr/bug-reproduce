'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/errors.js
 *  REPLAY RUNTIME ERROR HIERARCHY (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Mã lỗi:
 *    - MISSING_RECORDING (SEC-034): Tương tác không tìm thấy trong capsule.
 *      Fail-closed, không fallback ra hạ tầng thật.
 *    - BLOCKED_WRITE_SIDE_EFFECT (ADR-005): Tương tác WRITE bị chặn bởi L1
 *      Sink Classifier trong chế độ Replay default-deny.
 */

class MissingRecordingError extends Error {
  /**
   * @param {string} message
   * @param {object} [meta] metadata về interaction bị thiếu
   */
  constructor(message, meta = {}) {
    super(message || 'Interaction was not recorded in capsule (fail-closed, no network/DB fallback allowed)');
    this.name = 'MissingRecordingError';
    this.code = 'MISSING_RECORDING';
    this.unit = meta.unit || null;
    this.kind = meta.kind || (meta.unit ? meta.unit.kind : null);
    this.target = meta.target !== undefined ? meta.target : (meta.unit ? meta.unit.target : null);
    this.arguments = meta.arguments !== undefined ? meta.arguments : (meta.unit ? meta.unit.arguments : null);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingRecordingError);
    }
  }
}

class ReplayBlockedWriteError extends Error {
  /**
   * @param {string} message
   * @param {object} [meta] metadata về write interaction bị chặn
   */
  constructor(message, meta = {}) {
    super(message || 'Write side effect was blocked by Replay L1 Sink Classifier (ADR-005 default-deny)');
    this.name = 'ReplayBlockedWriteError';
    this.code = 'BLOCKED_WRITE_SIDE_EFFECT';
    this.unit = meta.unit || null;
    this.kind = meta.kind || (meta.unit ? meta.unit.kind : null);
    this.target = meta.target !== undefined ? meta.target : (meta.unit ? meta.unit.target : null);
    this.arguments = meta.arguments !== undefined ? meta.arguments : (meta.unit ? meta.unit.arguments : null);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReplayBlockedWriteError);
    }
  }
}

module.exports = {
  MissingRecordingError,
  ReplayBlockedWriteError,
};
