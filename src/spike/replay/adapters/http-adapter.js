'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/adapters/http-adapter.js
 *  HTTP EGRESS REPLAY ADAPTER & R3 ALLOWLIST (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Interceptor cho HTTP/HTTPS/Fetch egress.
 *    - Áp dụng quy tắc R3 (MTP bảng T6):
 *      "Cái chứng minh READ trong replay KHÔNG phải verb, mà là KHỚP VỚI MỘT ENTRY READ ĐÃ GHI TRONG CAPSULE".
 *    - Chặn mọi write request hoặc unrecorded request:
 *      - WRITE -> ném `ReplayBlockedWriteError` (L1 default-deny, ADR-005).
 *      - Unrecorded -> ném `MissingRecordingError` (fail-closed, SEC-034).
 *    - Tuyệt đối KHÔNG fallback ra mạng thật.
 */

const http = require('node:http');
const https = require('node:https');
const { directionOf, normalize, identity } = require('../../contract');
const { MissingRecordingError, ReplayBlockedWriteError } = require('../errors');

/**
 * Phân tích URL và options thành định dạng interaction tiêu chuẩn.
 * @param {string|URL|object} input
 * @param {object} [init]
 * @returns {{ url: string, method: string, headers: object, body: any }}
 */
function parseHttpParams(input, init = {}) {
  let url = '';
  let method = 'GET';
  let headers = {};
  let body = null;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && typeof input === 'object') {
    url = input.url || input.href || '';
    if (input.method) method = input.method;
    if (input.headers) headers = Object.assign({}, input.headers);
    if (input.body !== undefined) body = input.body;
  }

  if (init && typeof init === 'object') {
    if (init.method) method = init.method;
    if (init.headers) headers = Object.assign({}, headers, init.headers);
    if (init.body !== undefined) body = init.body;
  }

  method = method.toUpperCase();

  // Parse JSON body nếu là string
  let parsedBody = body;
  if (typeof body === 'string' && body.trim().startsWith('{')) {
    try {
      parsedBody = JSON.parse(body);
    } catch (_) {}
  }

  return { url, method, headers, body: parsedBody };
}

/**
 * Định dạng body / response từ capsule thành Response object tiêu chuẩn cho Fetch API.
 * @param {any} recordedResult
 * @returns {object} Response-like object
 */
function formatFetchResponse(recordedResult) {
  let statusCode = 200;
  let body = recordedResult;
  let headers = {};

  if (recordedResult && typeof recordedResult === 'object') {
    if (typeof recordedResult.status_code === 'number') {
      statusCode = recordedResult.status_code;
    } else if (typeof recordedResult.statusCode === 'number') {
      statusCode = recordedResult.statusCode;
    } else if (typeof recordedResult.status === 'number') {
      statusCode = recordedResult.status;
    }

    if (recordedResult.headers && typeof recordedResult.headers === 'object') {
      headers = recordedResult.headers;
    }

    if ('body' in recordedResult) {
      body = recordedResult.body;
    }
  }

  const ok = statusCode >= 200 && statusCode < 300;
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body);

  return {
    ok,
    status: statusCode,
    statusCode,
    statusText: statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : 'Response',
    headers: {
      get: (name) => headers[name.toLowerCase()] || headers[name] || null,
      raw: () => headers,
    },
    json: async () => (typeof body === 'object' ? body : JSON.parse(bodyText)),
    text: async () => bodyText,
    body,
  };
}

/**
 * Xử lý tương tác Outbound HTTP theo quy tắc R3 (allowlist dựa trên capsule).
 * @param {import('../session').ReplaySession} session
 * @param {{ url: string, method: string, headers?: object, body?: any }} request
 * @returns {any} recorded result
 */
function dispatchHttpInteraction(session, request) {
  const { url, method, body } = request;
  const targetWithMethod = `${method} ${url}`;

  // Kiểm tra xem trong capsule có entry nào khớp identity của request này không
  const candidateKeys = session._generateCandidateKeys({
    kind: 'outbound-http',
    target: url,
    method,
    arguments: body !== undefined && body !== null ? { body } : {},
  });

  let matchedEntry = null;
  for (const key of candidateKeys) {
    const queue = session.fifoQueues.get(key);
    if (queue && queue.length > 0) {
      for (const entry of queue) {
        if (!entry.consumed) {
          matchedEntry = entry;
          break;
        }
      }
    }
    if (matchedEntry) break;
  }

  if (matchedEntry) {
    // Đã tìm thấy entry trong capsule:
    // Kiểm tra direction của entry đó:
    if (matchedEntry.raw.direction === 'WRITE') {
      session.recordBlockedWrite({
        kind: 'outbound-http',
        target: targetWithMethod,
        method,
        arguments: { body },
        direction: 'WRITE',
      });
      throw new ReplayBlockedWriteError(
        `Replay blocked outbound HTTP write side effect: "${targetWithMethod}" (L1 default-deny, ADR-005)`,
        { kind: 'outbound-http', target: targetWithMethod, arguments: body }
      );
    }

    // Direction là READ: Quy tắc R3 được thoả mãn!
    matchedEntry.consumed = true;
    session.dispatchedInteractions.push(matchedEntry.raw);
    return matchedEntry.raw.result;
  }

  // Không tìm thấy entry trong capsule:
  // Xác định xem theo verb thì đây là WRITE hay READ
  const derivedDirection = directionOf('outbound-http', targetWithMethod);
  if (derivedDirection === 'WRITE') {
    session.recordBlockedWrite({
      kind: 'outbound-http',
      target: targetWithMethod,
      method,
      arguments: { body },
      direction: 'WRITE',
    });
    throw new ReplayBlockedWriteError(
      `Replay blocked unrecorded HTTP write request: "${targetWithMethod}" (L1 default-deny, ADR-005)`,
      { kind: 'outbound-http', target: targetWithMethod, arguments: body }
    );
  }

  // Verb là READ nhưng không có trong capsule -> Fail-closed!
  session.unservedReads.push({
    kind: 'outbound-http',
    target: targetWithMethod,
    method,
    arguments: { body },
    direction: 'READ',
    missedAt: new Date().toISOString(),
  });
  throw new MissingRecordingError(
    `Missing recording in capsule for outbound HTTP: "${targetWithMethod}" (fail-closed, SEC-034)`,
    { kind: 'outbound-http', target: targetWithMethod, arguments: body }
  );
}

class HttpReplayAdapter {
  /**
   * @param {import('../session').ReplaySession} session
   */
  constructor(session) {
    this.session = session;
    this._originalFetch = global.fetch;
    this._originalHttpRequest = http.request;
    this._originalHttpsRequest = https.request;
    this._installed = false;
  }

  /**
   * Mock Fetch function.
   */
  async fetch(input, init) {
    const params = parseHttpParams(input, init);
    const recordedResult = dispatchHttpInteraction(this.session, params);
    return formatFetchResponse(recordedResult);
  }

  /**
   * Helper tương thích với src/spike/app/http-json.js (`requestJson`).
   */
  async requestJson({ url, method = 'GET', body = null, headers = {}, timeoutMs = 5000 } = {}) {
    const params = parseHttpParams(url, { method, body, headers });
    const recordedResult = dispatchHttpInteraction(this.session, params);

    let statusCode = 200;
    let resBody = recordedResult;
    let resHeaders = {};

    if (recordedResult && typeof recordedResult === 'object') {
      if (typeof recordedResult.status_code === 'number') {
        statusCode = recordedResult.status_code;
      } else if (typeof recordedResult.statusCode === 'number') {
        statusCode = recordedResult.statusCode;
      }
      if ('body' in recordedResult) {
        resBody = recordedResult.body;
      }
      if (recordedResult.headers && typeof recordedResult.headers === 'object') {
        resHeaders = recordedResult.headers;
      }
    }

    return {
      statusCode,
      headers: resHeaders,
      body: resBody,
    };
  }

  /**
   * Cài đặt interceptor vào môi trường global.
   */
  install() {
    if (this._installed) return;
    global.fetch = this.fetch.bind(this);
    this._installed = true;
  }

  /**
   * Gỡ bỏ interceptor và khôi phục global methods.
   */
  restore() {
    if (!this._installed) return;
    if (this._originalFetch) {
      global.fetch = this._originalFetch;
    }
    this._installed = false;
  }
}

/**
 * Factory tạo HttpReplayAdapter.
 * @param {import('../session').ReplaySession} session
 * @returns {HttpReplayAdapter}
 */
function createHttpAdapter(session) {
  return new HttpReplayAdapter(session);
}

module.exports = {
  HttpReplayAdapter,
  createHttpAdapter,
  parseHttpParams,
  formatFetchResponse,
  dispatchHttpInteraction,
};
