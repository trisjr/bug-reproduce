'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/adapters/flag-adapter.js
 *  FEATURE FLAG REPLAY ADAPTER (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Interceptor cho Feature Flags:
 *      Trả về giá trị boolean đã ghi trong capsule theo từng flag name.
 *    - Flag không có trong capsule -> ném `MissingRecordingError` (fail-closed, SEC-034).
 *    - Cung cấp hàm đánh giá tương thích với `src/spike/app/flags.js` (`evaluateFlags`).
 */

const { MissingRecordingError } = require('../errors');

const DEFAULT_FLAG_NAMES = Object.freeze(['checkout_discount_v2', 'night_surcharge']);

class FlagReplayAdapter {
  /**
   * @param {import('../session').ReplaySession} session
   */
  constructor(session) {
    this.session = session;
  }

  /**
   * Lấy giá trị boolean của một flag từ capsule.
   * @param {string} flagName
   * @returns {boolean}
   */
  getFlag(flagName) {
    if (!flagName || typeof flagName !== 'string') {
      throw new TypeError('getFlag: flagName must be a non-empty string');
    }
    return this.session.consumeFlag(flagName.trim());
  }

  /**
   * Đánh giá danh sách flags từ capsule.
   * Hỗ trợ cả 2 dạng:
   *   - evaluateFlags(['flag1', 'flag2'])
   *   - evaluateFlags(log, flagFile) (tương thích app/flags.js)
   * @param {Array<string>|object} namesOrLog
   * @param {string|Array<string>} [flagFileOrNames]
   * @returns {Readonly<Record<string, boolean>>}
   */
  evaluateFlags(namesOrLog, flagFileOrNames) {
    let names = DEFAULT_FLAG_NAMES;
    let log = null;

    if (Array.isArray(namesOrLog)) {
      names = namesOrLog;
    } else if (namesOrLog && typeof namesOrLog.record === 'function') {
      log = namesOrLog;
      if (Array.isArray(flagFileOrNames)) {
        names = flagFileOrNames;
      }
    }

    const flags = {};
    for (const name of names) {
      const enabled = this.getFlag(name);
      flags[name] = enabled;

      if (log && typeof log.record === 'function') {
        log.record({
          kind: 'feature-flag',
          target: name,
          args: { provider: 'spike-replay-flag-adapter' },
          result: { enabled },
        });
      }
    }

    return Object.freeze(flags);
  }

  /**
   * Tạo evaluator function thay thế trực tiếp hàm `evaluateFlags` của `src/spike/app/flags.js`.
   * @param {Array<string>} [flagNames]
   * @returns {(log: object, flagFile?: string) => Readonly<Record<string, boolean>>}
   */
  createFlagEvaluator(flagNames = DEFAULT_FLAG_NAMES) {
    return (log, flagFile) => this.evaluateFlags(log, flagNames);
  }
}

/**
 * Factory tạo FlagReplayAdapter.
 * @param {import('../session').ReplaySession} session
 * @returns {FlagReplayAdapter}
 */
function createFlagAdapter(session) {
  return new FlagReplayAdapter(session);
}

module.exports = {
  FlagReplayAdapter,
  createFlagAdapter,
  DEFAULT_FLAG_NAMES,
};
