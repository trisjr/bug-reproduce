'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Client HTTP/JSON tối thiểu trên `node:http` — không thêm dependency.
 * Dùng bởi cả app (gọi stub) lẫn `test-invariant.js` (gọi app/stub).
 */

const http = require('node:http');

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * @param {{url: string, method?: string, body?: unknown, headers?: Record<string,string>,
 *          timeoutMs?: number}} options
 * @returns {Promise<{statusCode: number, headers: Record<string, string|string[]|undefined>, body: unknown, rawBody: string}>}
 */
function requestJson({ url, method = 'GET', body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const target = new URL(url);
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');

  const requestHeaders = { accept: 'application/json', ...headers };
  if (payload) {
    requestHeaders['content-type'] = 'application/json';
    requestHeaders['content-length'] = String(payload.length);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        path: `${target.pathname}${target.search}`,
        method,
        headers: requestHeaders,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf8');
          let parsed = null;
          if (rawBody.length > 0) {
            try {
              parsed = JSON.parse(rawBody);
            } catch {
              parsed = null;
            }
          }
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed, rawBody });
        });
      },
    );

    req.setTimeout(timeoutMs, () => req.destroy(new Error(`HTTP timeout sau ${timeoutMs}ms: ${url}`)));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = { requestJson };
