'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Dependency #3: EXTERNAL HTTP API — gọi tới `spike-httpstub` (CT-3).
 * G2: stub TỰ CHẠY, dữ liệu SYNTHETIC, KHÔNG gọi internet. Địa chỉ đến 100% từ
 * `SPIKE_HTTP_STUB_URL` (CT-4) — không hardcode host/port ở bất kỳ đâu.
 */

const { KIND } = require('./interaction-log');
const { requestJson } = require('./http-json');

const AUTHORIZE_PATH = '/payments/authorize';
const AUTHORIZE_TIMEOUT_MS = 4000;

/**
 * Gọi stub để "authorize" khoản thanh toán. Kết quả ĐI VÀO kết cục (khác Redis).
 * @param {{httpStubUrl: string, runId: string}} config
 * @param {import('./interaction-log').InteractionLog} log
 * @param {{requestId: string, payload: object}} call
 * @returns {Promise<{decision: string, authorization_code: string|null, reason: string|null}>}
 */
async function authorizePayment(config, log, { requestId, payload }) {
  const url = new URL(AUTHORIZE_PATH, config.httpStubUrl).href;
  const target = `POST ${AUTHORIZE_PATH}`;

  try {
    const response = await requestJson({
      url,
      method: 'POST',
      body: payload,
      headers: { 'x-spike-run-id': config.runId, 'x-spike-request-id': requestId },
      timeoutMs: AUTHORIZE_TIMEOUT_MS,
    });

    log.record({
      kind: KIND.OUTBOUND_HTTP,
      target,
      args: payload,
      result: { status_code: response.statusCode, body: response.body },
    });

    if (response.statusCode !== 200 || response.body === null) {
      throw new Error(`spike-httpstub trả về status ${response.statusCode}`);
    }
    return response.body;
  } catch (error) {
    log.record({ kind: KIND.OUTBOUND_HTTP, target, args: payload, result: null, error: error.message });
    throw error;
  }
}

module.exports = { AUTHORIZE_PATH, authorizePayment };
