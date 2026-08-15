'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Dependency #2: REDIS — "SIDE CHANNEL", KHÔNG nằm trên đường tính response.
 *
 * ⛔ RÀNG BUỘC CẤU TRÚC #1 — CẤM READ-THROUGH CACHE (architect Q4).
 *    Rubric §3.4 điều kiện 1 đòi hai dãy đơn vị CÙNG SỐ ĐƠN VỊ. Một cache hit bỏ
 *    qua truy vấn DB làm dãy lúc capture ngắn hơn dãy lúc replay ⇒ `diverged` ngay
 *    ở điều kiện 1. ⇒ Mọi mẫu hình mà cache THAY THẾ một lời gọi đều bị loại thẳng.
 *
 * ⛔ RÀNG BUỘC CẤU TRÚC #2 — MODULE NÀY KHÔNG TRẢ VỀ GIÁ TRỊ REDIS.
 *    Mọi hàm public đều `Promise<void>`. Business logic KHÔNG THỂ tiêu thụ giá trị
 *    Redis vì API không đưa ra giá trị nào để tiêu thụ. Đây là bằng chứng cấu trúc
 *    cho G1, không phải một quy ước dễ vi phạm.
 *
 * ✅ NHƯNG Redis PHẢI thực sự được gọi và lời gọi PHẢI quan sát được trong log —
 *    nếu không, exit criteria "chạm cả 5 dependency" thành nghi thức rỗng.
 *    Hai hình mẫu hợp lệ được dùng ở đây:
 *      (a) fire-and-forget write — ghi SAU khi kết cục đã tính xong, không đọc lại;
 *      (b) shadow read — đọc counter, đối chiếu với con số DB, ghi log, rồi VỨT.
 *
 * ✅ R2: chịu được việc Redis bị B5 chặn hoặc vắng mặt — timeout ngắn, nuốt lỗi,
 *    app vẫn boot và vẫn trả cùng response khi Redis chết.
 */

const Redis = require('ioredis');
const { KIND } = require('./interaction-log');

const OP_TIMEOUT_MS = 200;
const CONNECT_TIMEOUT_MS = 500;
const RECONNECT_DELAY_MS = 2000;
const COUNTER_TTL_SECONDS = 3600;

/**
 * @param {Promise<unknown>} promise
 * @param {number} timeoutMs
 * @returns {Promise<unknown>}
 */
function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`redis-op-timeout-${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

class CacheSideChannel {
  /**
   * @param {{host: string, port: number}} redisConfig
   */
  constructor(redisConfig) {
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      lazyConnect: true,
      connectTimeout: CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      // Vẫn thử lại (compose có thể khởi động app trước redis), nhưng không bao giờ
      // chặn đường request: mỗi op kiểm tra `status` trước khi gọi.
      retryStrategy: () => RECONNECT_DELAY_MS,
    });
    this.lastError = null;
    // Bắt buộc: không có handler thì lỗi socket sẽ giết process.
    this.client.on('error', (error) => {
      this.lastError = error.message;
    });
  }

  /** Kết nối "best effort" lúc boot — Redis chết KHÔNG được chặn app khởi động (R2). */
  async connect() {
    try {
      await withTimeout(this.client.connect(), CONNECT_TIMEOUT_MS + OP_TIMEOUT_MS);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Bọc một op Redis: luôn nuốt lỗi, luôn ghi log, LUÔN trả về `undefined`.
   * @param {import('./interaction-log').InteractionLog} log
   * @param {{target: string, args: object, summarize: (value: unknown) => unknown}} meta
   * @param {() => Promise<unknown>} operation
   * @returns {Promise<void>}
   */
  async #guarded(log, meta, operation) {
    const record = (result, error) =>
      log.record({
        kind: KIND.CACHE,
        target: meta.target,
        args: meta.args,
        result,
        // Đánh dấu để B3/B6 và test bất biến phân biệt được: đơn vị này KHÔNG
        // thuộc đường tính response (G1).
        offExecutionPath: true,
        error,
      });

    if (this.client.status !== 'ready') {
      record(null, `redis-unavailable:${this.client.status}`);
      return;
    }

    try {
      const value = await withTimeout(operation(), OP_TIMEOUT_MS);
      record(meta.summarize(value), null);
    } catch (error) {
      record(null, error.message);
    }
  }

  /**
   * Hình mẫu (b) — SHADOW READ: đọc counter, đối chiếu với con số DB, ghi log, VỨT.
   * Giá trị Redis KHÔNG rời khỏi hàm này.
   * @param {import('./interaction-log').InteractionLog} log
   * @param {{key: string, dbValue: number}} params
   * @returns {Promise<void>}
   */
  async shadowCompare(log, { key, dbValue }) {
    await this.#guarded(
      log,
      {
        target: `GET ${key}`,
        args: { pattern: 'shadow-read', db_value: dbValue },
        summarize: (value) => {
          const cached = value === null || value === undefined ? null : Number.parseInt(String(value), 10);
          return {
            cached_value: cached,
            db_value: dbValue,
            // Kết quả đối chiếu CHỈ đi vào log/metric — không ai đọc nó nữa.
            agrees_with_db: cached === dbValue,
            consumed_by_response: false,
          };
        },
      },
      () => this.client.get(key),
    );
  }

  /**
   * Hình mẫu (a) — FIRE-AND-FORGET WRITE: ghi SAU khi kết cục đã đóng băng,
   * không đọc lại trong cùng execution.
   * @param {import('./interaction-log').InteractionLog} log
   * @param {{counterKey: string, lastOrderKey: string, lastOrderValue: string}} params
   * @returns {Promise<void>}
   */
  async recordCheckoutTelemetry(log, { counterKey, lastOrderKey, lastOrderValue }) {
    await this.#guarded(
      log,
      {
        target: `INCR ${counterKey}`,
        args: { pattern: 'fire-and-forget-write', ttl_seconds: COUNTER_TTL_SECONDS },
        summarize: () => ({ acknowledged: true, consumed_by_response: false }),
      },
      async () => {
        await this.client.incr(counterKey);
        await this.client.expire(counterKey, COUNTER_TTL_SECONDS);
      },
    );

    await this.#guarded(
      log,
      {
        target: `SET ${lastOrderKey}`,
        args: { pattern: 'fire-and-forget-write', ttl_seconds: COUNTER_TTL_SECONDS },
        summarize: () => ({ acknowledged: true, consumed_by_response: false }),
      },
      () => this.client.set(lastOrderKey, lastOrderValue, 'EX', COUNTER_TTL_SECONDS),
    );
  }

  async close() {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

module.exports = { CacheSideChannel, OP_TIMEOUT_MS };
