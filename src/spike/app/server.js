'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Entry point của service `spike-app` (CT-3). Chạy: `node src/spike/app/server.js`.
 * ⛔ CTL-1: KHÔNG `dotenv` — cấu hình 100% từ env do compose inject (CT-4).
 */

const http = require('node:http');
const crypto = require('node:crypto');

const { CacheSideChannel } = require('./cache');
const { CheckoutInputError, handleCheckout } = require('./checkout');
const { InteractionLog, KIND } = require('./interaction-log');
const { createPool } = require('./db');
const { failFast, loadAppConfig } = require('./config');

const MAX_BODY_BYTES = 64 * 1024;
const CHECKOUT_ROUTE = '/checkout';

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new CheckoutInputError(`Body vượt quá ${MAX_BODY_BYTES} bytes`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim() === '') {
        reject(new CheckoutInputError('Body rỗng — cần JSON {customer_id, sku, quantity}'));
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new CheckoutInputError(`Body không phải JSON hợp lệ: ${error.message}`));
      }
    });
  });
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {object} body
 * @param {string} requestId
 */
function sendJson(res, statusCode, body, requestId, meta = {}) {
  const payload = JSON.stringify(body);
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'x-spike-request-id': requestId,
  };
  if (meta.durationMs !== undefined) {
    headers['x-spike-duration-ms'] = Number(meta.durationMs).toFixed(3);
  }
  if (meta.pathLabel) {
    headers['x-spike-path'] = String(meta.pathLabel);
  }
  res.writeHead(statusCode, headers);
  res.end(payload);
}

function emitAppEvent(event, details) {
  process.stdout.write(`${JSON.stringify({ log: 'spike-app', event, ...details })}\n`);
}

async function main() {
  const config = loadAppConfig();
  const pool = createPool(config.pg);
  const cache = new CacheSideChannel(config.redis);

  // Redis chết KHÔNG được chặn app boot (R2).
  const redisReady = await cache.connect();

  const server = http.createServer(async (req, res) => {
    const startHrTime = process.hrtime.bigint();
    const requestId = String(req.headers['x-spike-request-id'] || crypto.randomUUID());
    const url = new URL(req.url, `http://${req.headers.host || 'spike-app'}`);

    const elapsed = () => Number(process.hrtime.bigint() - startHrTime) / 1e6;

    if (req.method === 'GET' && url.pathname === '/healthz') {
      sendJson(res, 200, { status: 'ok', run_id: config.runId }, requestId, {
        durationMs: elapsed(),
        pathLabel: 'P-healthz',
      });
      return;
    }

    if (req.method !== 'POST' || url.pathname !== CHECKOUT_ROUTE) {
      sendJson(res, 404, { error: 'not-found', detail: `chỉ hỗ trợ POST ${CHECKOUT_ROUTE}` }, requestId, {
        durationMs: elapsed(),
        pathLabel: 'P-discard',
      });
      return;
    }
    const log = new InteractionLog({ runId: config.runId, requestId });

    try {
      const body = await readJsonBody(req);

      // U0 — neo đầu dãy đơn vị (Spec §3.1).
      log.record({
        kind: KIND.INBOUND_HTTP,
        target: `POST ${CHECKOUT_ROUTE}`,
        args: body,
        result: null,
      });

      const { statusCode, body: responseBody } = await handleCheckout(
        { config, pool, cache, log, requestId },
        body,
      );
      const pathLabel = (statusCode === 201 || statusCode === 402) ? 'P-persist' : 'P-discard';
      sendJson(res, statusCode, responseBody, requestId, {
        durationMs: elapsed(),
        pathLabel,
      });
    } catch (error) {
      const isInputError = error instanceof CheckoutInputError;
      const statusCode = isInputError ? 400 : 500;
      log.record({
        kind: KIND.MARKER,
        target: 'request-failed',
        result: { status_code: statusCode },
        error: error.message,
      });
      sendJson(
        res,
        statusCode,
        { error: isInputError ? 'bad-request' : 'internal-error', detail: error.message },
        requestId,
        {
          durationMs: elapsed(),
          pathLabel: 'P-discard',
        }
      );
    }
  });

  server.listen(config.appPort, '0.0.0.0', () => {
    emitAppEvent('ready', {
      run_id: config.runId,
      port: config.appPort,
      pid: process.pid,
      redis_ready_at_boot: redisReady,
      http_stub_url: config.httpStubUrl,
      flag_file: config.flagFile,
    });
  });

  const shutdown = async (signal) => {
    emitAppEvent('shutdown', { signal });
    server.close();
    await cache.close();
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error) => failFast(error, 'app'));
