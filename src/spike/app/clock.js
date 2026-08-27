'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Dependency #5: CLOCK. Kết cục của `POST /checkout` PHẢI phụ thuộc đồng hồ một
 * cách quan sát được, nếu không nhóm capture `clock/timestamp` của B3 không có gì
 * để chứng minh.
 *
 * Nhánh business phụ thuộc clock: "night window" (22:00–06:00 UTC) ⇒ phụ thu đêm.
 * Nó đi vào `pricing.window`, `pricing.surcharge_cents`, `pricing.total_cents`,
 * `order_date` — và vì `total_cents` là số tiền gửi sang stub, clock còn đổi CẢ
 * `arguments` của lời gọi outbound-http.
 */

const { KIND } = require('./interaction-log');

const NIGHT_WINDOW_START_HOUR_UTC = 22;
const NIGHT_WINDOW_END_HOUR_UTC = 6;

let customClockProvider = null;

/**
 * Đăng ký clock provider tuỳ chỉnh (dùng cho B8 fixture / fault injection).
 * @param {(() => number|Date)|Date|number|string|null} provider
 */
function setClockProvider(provider) {
  customClockProvider = provider;
}

function resetClockProvider() {
  customClockProvider = null;
}

/**
 * Đọc đồng hồ trong process và ghi lại thành một đơn vị `clock`.
 * @param {import('./interaction-log').InteractionLog} log
 * @param {string} label định danh điểm đọc (Spec §3.2 field `target`)
 * @param {Date|number|string} [overrideDate] giá trị đè trực tiếp cho lần đọc này
 * @returns {Date}
 */
function readClock(log, label, overrideDate) {
  let ts;
  if (overrideDate !== undefined && overrideDate !== null) {
    ts = overrideDate instanceof Date ? overrideDate.getTime() : new Date(overrideDate).getTime();
  } else if (typeof customClockProvider === 'function') {
    const val = customClockProvider();
    ts = val instanceof Date ? val.getTime() : new Date(val).getTime();
  } else if (customClockProvider instanceof Date) {
    ts = customClockProvider.getTime();
  } else if (customClockProvider !== null && customClockProvider !== undefined) {
    ts = new Date(customClockProvider).getTime();
  } else {
    ts = Date.now();
  }

  const now = new Date(ts);
  const isInjected = overrideDate !== undefined || customClockProvider !== null;
  log.record({
    kind: KIND.CLOCK,
    target: label,
    args: { source: isInjected ? 'injected' : 'Date.now()' },
    result: now.toISOString(),
  });
  return now;
}

/**
 * @param {Date} now
 * @returns {'night'|'day'}
 */
function pricingWindow(now) {
  const hour = now.getUTCHours();
  const isNight = hour >= NIGHT_WINDOW_START_HOUR_UTC || hour < NIGHT_WINDOW_END_HOUR_UTC;
  return isNight ? 'night' : 'day';
}

/**
 * Ngày UTC dạng `YYYY-MM-DD` — giá trị THÔ của đồng hồ không bao giờ đi vào
 * response (nó sẽ khiến mọi so sánh A/B lệch vì mili giây).
 * @param {Date} now
 * @returns {string}
 */
function orderDate(now) {
  return now.toISOString().slice(0, 10);
}

module.exports = {
  NIGHT_WINDOW_END_HOUR_UTC,
  NIGHT_WINDOW_START_HOUR_UTC,
  orderDate,
  pricingWindow,
  readClock,
  setClockProvider,
  resetClockProvider,
};
