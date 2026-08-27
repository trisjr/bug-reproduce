'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Service `spike-httpstub` (CT-3) — "external API" của test app.
 *
 * ⛔ G2 — DỮ LIỆU SYNTHETIC, KHÔNG NGOẠI LỆ:
 *    - Không gọi internet, không outbound socket nào.
 *    - Không API key thật, không secret.
 *    - Response sinh TẤT ĐỊNH từ chính request (sha256), không random, không clock
 *      ⇒ replay được, và không tự sinh divergence giả.
 *
 * Cổng lắng nghe LẤY TỪ `SPIKE_HTTP_STUB_URL` (CT-4) — không thêm biến mới, và app
 * với stub không thể lệch cổng. Thiếu biến ⇒ fail fast.
 */

const http = require('node:http');
const crypto = require('node:crypto');

const { failFast, loadStubConfig } = require('../config');

const DECLINE_THRESHOLD_CENTS = 500000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_CALL_LOG = 500;

/** @type {Array<object>} bộ nhớ trong — bằng chứng phía stub cho test bất biến. */
const callLog = [];
/** @type {Map<string, {statusCode: number, body: object, count: number}>} */
const configuredFaults = new Map();
/**
 * @param {object} payload
 * @returns {{decision: 'approved'|'declined', authorization_code: string|null, reason: string|null,
 *            processor: string}}
 */
function authorize(payload) {
  const amountCents = Number(payload.amount_cents);
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    return { decision: 'declined', authorization_code: null, reason: 'invalid-amount', processor: 'spike-stub' };
  }
  if (amountCents > DECLINE_THRESHOLD_CENTS) {
    return { decision: 'declined', authorization_code: null, reason: 'amount-limit-exceeded', processor: 'spike-stub' };
  }

  const fingerprint = [payload.customer_id, payload.sku, payload.quantity, amountCents, payload.currency].join('|');
  const digest = crypto.createHash('sha256').update(fingerprint).digest('hex').slice(0, 10).toUpperCase();
  return { decision: 'approved', authorization_code: `AUTH-${digest}`, reason: null, processor: 'spike-stub' };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body quá lớn'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(raw.trim() === '' ? {} : JSON.parse(raw));
      } catch (error) {
        reject(new Error(`body không phải JSON: ${error.message}`));
      }
    });
  });
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function main() {
  const config = loadStubConfig();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'spike-httpstub'}`);

    if (req.method === 'GET' && url.pathname === '/healthz') {
      sendJson(res, 200, { status: 'ok', run_id: config.runId, calls: callLog.length });
      return;
    }

    // Bằng chứng phía stub — dùng bởi `test-invariant.js`. Bản ghi KHÔNG chứa
    // timestamp: mọi trường ở đây phải bất biến giữa hai lần chạy A/B.
    if (req.method === 'GET' && url.pathname === '/__stub/calls') {
      const requestId = url.searchParams.get('request_id');
      const calls = requestId ? callLog.filter((call) => call.request_id === requestId) : callLog;
      sendJson(res, 200, { run_id: config.runId, calls });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/__stub/reset') {
      callLog.length = 0;
      configuredFaults.clear();
      sendJson(res, 200, { status: 'reset' });
      return;
    }

    // Δ3: Fault injection endpoint cho B8 fixture
    if (req.method === 'POST' && url.pathname === '/__stub/fault') {
      let faultSpec;
      try {
        faultSpec = await readBody(req);
      } catch (error) {
        sendJson(res, 400, { error: 'bad-request', detail: error.message });
        return;
      }
      const targetPath = faultSpec.path || '/payments/authorize';
      const statusCode = Number(faultSpec.statusCode || faultSpec.status || 500);
      const body = faultSpec.body || {
        error: faultSpec.error || 'simulated-fault',
        detail: faultSpec.detail || 'deterministic fault injected via /__stub/fault',
      };
      const count = faultSpec.count !== undefined ? Number(faultSpec.count) : Infinity;
      configuredFaults.set(targetPath, { statusCode, body, count });
      sendJson(res, 200, { status: 'fault-configured', targetPath, statusCode, body, count });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/payments/authorize') {
      let payload;
      try {
        payload = await readBody(req);
      } catch (error) {
        sendJson(res, 400, { error: 'bad-request', detail: error.message });
        return;
      }

      // Kiểm tra fault injection cấu hình qua endpoint hoặc header
      const headerFaultStatus = req.headers['x-spike-stub-status'];
      const headerFaultJson = req.headers['x-spike-stub-fault'];
      let activeFault = null;

      if (headerFaultStatus || headerFaultJson) {
        let faultBody = { error: 'simulated-fault', detail: 'injected via header' };
        if (headerFaultJson) {
          try {
            faultBody = JSON.parse(String(headerFaultJson));
          } catch (_) {}
        }
        activeFault = {
          statusCode: Number(headerFaultStatus || 500),
          body: faultBody,
        };
      } else if (configuredFaults.has('/payments/authorize')) {
        const f = configuredFaults.get('/payments/authorize');
        if (f.count > 0) {
          f.count -= 1;
          activeFault = f;
        }
      }

      const result = activeFault ? activeFault.body : authorize(payload);
      const statusCode = activeFault ? activeFault.statusCode : 200;

      if (callLog.length < MAX_CALL_LOG) {
        callLog.push({
          ordinal: callLog.length + 1,
          request_id: String(req.headers['x-spike-request-id'] || ''),
          method: 'POST',
          path: '/payments/authorize',
          body: payload,
          response: result,
          status_code: statusCode,
        });
      }
      sendJson(res, statusCode, result);
      return;
    }

    sendJson(res, 404, { error: 'not-found', detail: `stub không phục vụ ${req.method} ${url.pathname}` });
  });

  server.listen(config.listenPort, config.listenHost, () => {
    process.stdout.write(
      `${JSON.stringify({
        log: 'spike-httpstub',
        event: 'ready',
        run_id: config.runId,
        port: config.listenPort,
        pid: process.pid,
        data: 'SYNTHETIC (G2) — no internet egress',
      })}\n`,
    );
  });

  const shutdown = () => {
    server.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    failFast(error, 'httpstub');
  }
}

module.exports = { DECLINE_THRESHOLD_CENTS, authorize, main };
