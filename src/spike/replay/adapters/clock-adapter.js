'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/adapters/clock-adapter.js
 *  SYSTEM CLOCK REPLAY ADAPTER (P0-B / Wave 3 / U-13)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Interceptor cho System Clock theo quyết định U-13:
 *      Phát lại tuần tự theo FIFO cursor. Lời gọi thứ n nhận giá trị clock thứ n đã ghi.
 *    - Hết dãy clock trong recording -> ném `MissingRecordingError` (fail-closed).
 *    - Tích hợp liền mạch với `src/spike/app/clock.js` thông qua `setClockProvider()`.
 */

const { MissingRecordingError } = require('../errors');

class ClockReplayAdapter {
  /**
   * @param {import('../session').ReplaySession} session
   */
  constructor(session) {
    this.session = session;
    this._originalDateNow = null;
    this._installed = false;
  }

  /**
   * Tiêu thụ và trả về Date object của lần đọc clock kế tiếp trong capsule.
   * @param {object} [spec]
   * @returns {Date}
   */
  nextDate(spec = {}) {
    const rawResult = this.session.consumeClock(spec);

    if (rawResult instanceof Date) {
      return rawResult;
    }

    if (typeof rawResult === 'string' || typeof rawResult === 'number') {
      const d = new Date(rawResult);
      if (!isNaN(d.getTime())) return d;
    }

    if (rawResult && typeof rawResult === 'object') {
      const val = rawResult.now || rawResult.iso || rawResult.date || rawResult.timestamp;
      if (val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // Nếu không parse được giá trị hợp lệ
    return new Date(rawResult);
  }

  /**
   * Trả về epoch milliseconds của lần đọc clock kế tiếp.
   * @returns {number}
   */
  now() {
    return this.nextDate().getTime();
  }

  /**
   * Tạo provider function tương thích với `setClockProvider()` của `src/spike/app/clock.js`.
   * @returns {() => Date}
   */
  createClockProvider() {
    return () => this.nextDate();
  }

  /**
   * Gắn adapter vào module clock của app hoặc hook Date.now toàn cục.
   * @param {object} [appClockModule] instance của require('../app/clock')
   */
  install(appClockModule) {
    if (appClockModule && typeof appClockModule.setClockProvider === 'function') {
      appClockModule.setClockProvider(this.createClockProvider());
    }

    if (!this._installed) {
      this._originalDateNow = Date.now;
      Date.now = () => this.now();
      this._installed = true;
    }
  }

  /**
   * Gỡ bỏ adapter khỏi module clock của app và khôi phục Date.now toàn cục.
   * @param {object} [appClockModule] instance của require('../app/clock')
   */
  restore(appClockModule) {
    if (appClockModule && typeof appClockModule.resetClockProvider === 'function') {
      appClockModule.resetClockProvider();
    }

    if (this._installed && this._originalDateNow) {
      Date.now = this._originalDateNow;
      this._installed = false;
    }
  }
}

/**
 * Factory tạo ClockReplayAdapter.
 * @param {import('../session').ReplaySession} session
 * @returns {ClockReplayAdapter}
 */
function createClockAdapter(session) {
  return new ClockReplayAdapter(session);
}

module.exports = {
  ClockReplayAdapter,
  createClockAdapter,
};
