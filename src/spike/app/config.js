'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 * Code này tồn tại để trả lời RQ.md §39, KHÔNG để tiến hoá thành V0.1.
 *
 * ⛔ CTL-1 — TUYỆT ĐỐI KHÔNG `require('dotenv').config()`.
 *    Repo root có `.env` chứa secret vận hành thật; `dotenv.config()` mặc định đọc
 *    `.env` ở `process.cwd()` (= repo root khi chạy `npm start`), và recorder B3
 *    capture `runtime metadata` KHÔNG cap / KHÔNG redact ⇒ secret thật rơi vào artifact.
 *    App CHỈ nhận cấu hình từ biến môi trường do compose inject (CT-4).
 *
 * ⛔ CT-4 — cấm hardcode host/port. Thiếu biến ⇒ fail fast, KHÔNG fallback thầm lặng.
 */

/** Toàn bộ 11 biến CT-4 mà `spike-app` đọc. B2 inject đúng tên này. */
const APP_ENV_KEYS = Object.freeze([
  'SPIKE_RUN_ID',
  'SPIKE_APP_PORT',
  'SPIKE_PG_HOST',
  'SPIKE_PG_PORT',
  'SPIKE_PG_USER',
  'SPIKE_PG_PASSWORD',
  'SPIKE_PG_DATABASE',
  'SPIKE_REDIS_HOST',
  'SPIKE_REDIS_PORT',
  'SPIKE_HTTP_STUB_URL',
  'SPIKE_FLAG_FILE',
]);

/** Tập con cho `spike-httpstub`: stub tự suy ra cổng lắng nghe từ URL. */
const STUB_ENV_KEYS = Object.freeze(['SPIKE_RUN_ID', 'SPIKE_HTTP_STUB_URL']);

/** Tập con cho script seed: chỉ cần đường tới PostgreSQL. */
const SEED_ENV_KEYS = Object.freeze([
  'SPIKE_RUN_ID',
  'SPIKE_PG_HOST',
  'SPIKE_PG_PORT',
  'SPIKE_PG_USER',
  'SPIKE_PG_PASSWORD',
  'SPIKE_PG_DATABASE',
]);

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Đọc đúng danh sách key bắt buộc từ `process.env`.
 * @param {readonly string[]} keys
 * @returns {Record<string, string>}
 */
function requireEnv(keys) {
  const missing = keys.filter((key) => {
    const raw = process.env[key];
    return raw === undefined || raw === null || String(raw).trim() === '';
  });

  if (missing.length > 0) {
    throw new ConfigError(
      `Thiếu biến môi trường bắt buộc (CT-4): ${missing.join(', ')}. ` +
        'Cấu hình PHẢI do compose inject — app không có giá trị mặc định.',
    );
  }

  const values = {};
  for (const key of keys) values[key] = String(process.env[key]).trim();
  return values;
}

/**
 * @param {string} raw
 * @param {string} key
 * @returns {number}
 */
function parsePort(raw, key) {
  const port = Number.parseInt(raw, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`${key} phải là số cổng hợp lệ 1..65535, nhận được: "${raw}"`);
  }
  return port;
}

/** Cấu hình đầy đủ của `spike-app`. */
function loadAppConfig() {
  const env = requireEnv(APP_ENV_KEYS);
  const httpStubUrl = parseStubUrl(env.SPIKE_HTTP_STUB_URL);

  return Object.freeze({
    runId: env.SPIKE_RUN_ID,
    appPort: parsePort(env.SPIKE_APP_PORT, 'SPIKE_APP_PORT'),
    pg: Object.freeze({
      host: env.SPIKE_PG_HOST,
      port: parsePort(env.SPIKE_PG_PORT, 'SPIKE_PG_PORT'),
      user: env.SPIKE_PG_USER,
      password: env.SPIKE_PG_PASSWORD,
      database: env.SPIKE_PG_DATABASE,
    }),
    redis: Object.freeze({
      host: env.SPIKE_REDIS_HOST,
      port: parsePort(env.SPIKE_REDIS_PORT, 'SPIKE_REDIS_PORT'),
    }),
    httpStubUrl: httpStubUrl.href,
    flagFile: env.SPIKE_FLAG_FILE,
  });
}

/** Cấu hình của `spike-httpstub` — cổng lắng nghe LẤY TỪ `SPIKE_HTTP_STUB_URL`. */
function loadStubConfig() {
  const env = requireEnv(STUB_ENV_KEYS);
  const url = parseStubUrl(env.SPIKE_HTTP_STUB_URL);

  return Object.freeze({
    runId: env.SPIKE_RUN_ID,
    listenHost: '0.0.0.0',
    listenPort: parsePort(url.port, 'SPIKE_HTTP_STUB_URL (phần cổng)'),
    publicUrl: url.href,
  });
}

/** Cấu hình của script seed. */
function loadSeedConfig() {
  const env = requireEnv(SEED_ENV_KEYS);
  return Object.freeze({
    runId: env.SPIKE_RUN_ID,
    pg: Object.freeze({
      host: env.SPIKE_PG_HOST,
      port: parsePort(env.SPIKE_PG_PORT, 'SPIKE_PG_PORT'),
      user: env.SPIKE_PG_USER,
      password: env.SPIKE_PG_PASSWORD,
      database: env.SPIKE_PG_DATABASE,
    }),
  });
}

/**
 * @param {string} raw
 * @returns {URL}
 */
function parseStubUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new ConfigError(`SPIKE_HTTP_STUB_URL không phải URL hợp lệ: "${raw}"`);
  }
  if (url.protocol !== 'http:') {
    throw new ConfigError(
      `SPIKE_HTTP_STUB_URL phải là http:// (stub SYNTHETIC chạy nội bộ, không TLS, không internet) — nhận: "${raw}"`,
    );
  }
  if (!url.port) {
    throw new ConfigError(
      `SPIKE_HTTP_STUB_URL phải ghi cổng tường minh (stub tự bind cổng này) — nhận: "${raw}"`,
    );
  }
  return url;
}

/**
 * Fail fast cho mọi entry point: in lỗi rõ ràng rồi thoát mã 1.
 * @param {unknown} error
 * @param {string} entryPoint
 */
function failFast(error, entryPoint) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[spike:${entryPoint}] FATAL ${message}\n`);
  process.exit(1);
}

module.exports = {
  APP_ENV_KEYS,
  STUB_ENV_KEYS,
  SEED_ENV_KEYS,
  ConfigError,
  failFast,
  loadAppConfig,
  loadSeedConfig,
  loadStubConfig,
};
