'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * HTTP Load Driver cho B7a Overhead Benchmark Harness.
 * Phát tải 100% traffic, >90% thành công (P-discard), 5% decline 402 tất định
 * (P-persist) chạm đủ 5 dependencies để đo overhead chính xác theo MTP §3.1/§3.2.
 */

const http = require('node:http');
const crypto = require('node:crypto');

const CUSTOMERS = Object.freeze([
  'cust-1001',
  'cust-1002',
  'cust-1003',
]);

const SUCCESS_SKUS = Object.freeze([
  'SKU-BOOK-001',
  'SKU-MUG-002',
  'SKU-DESK-003',
]);

const ERROR_SKU = 'SKU-GPU-004'; // Giá 620000 cents > 500000 limit -> 402 Declined

/**
 * Sinh payload request thứ i với phân bổ lỗi tất định.
 *
 * @param {number} index - Index của request (0 <= index < requestCount)
 * @param {number} totalCount - Tổng số request
 * @param {number} targetErrorRate - Tỷ lệ lỗi mục tiêu (0 <= rate <= 1)
 * @returns {{ customer_id: string, sku: string, quantity: number, isTargetError: boolean }}
 */
function generateRequestPayload(index, totalCount, targetErrorRate) {
  // Phân bố lỗi đều và tất định xuyên suốt tổng số request
  const isTargetError =
    targetErrorRate > 0 &&
    Math.floor((index + 1) * targetErrorRate) > Math.floor(index * targetErrorRate);

  const customerId = CUSTOMERS[index % CUSTOMERS.length];

  if (isTargetError) {
    return {
      customer_id: customerId,
      sku: ERROR_SKU,
      quantity: 1,
      isTargetError: true,
    };
  }

  const sku = SUCCESS_SKUS[index % SUCCESS_SKUS.length];
  return {
    customer_id: customerId,
    sku,
    quantity: 1,
    isTargetError: false,
  };
}

/**
 * Gửi 1 HTTP request và đo latency in-process / network.
 *
 * @param {object} params
 * @param {string} params.endpoint
 * @param {object} params.body
 * @param {number} params.timeoutMs
 * @param {http.Agent} [params.agent]
 * @param {Function} [params.customRequestFn] - Mock function dùng cho unit test
 * @returns {Promise<{ statusCode: number, durationMs: number, pathLabel: string, rawDurationMs?: number }>}
 */
function sendSingleRequest({ endpoint, body, timeoutMs, agent, customRequestFn }) {
  if (typeof customRequestFn === 'function') {
    return customRequestFn({ endpoint, body, timeoutMs });
  }

  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const postData = JSON.stringify(body);
    const requestId = `bench-req-${crypto.randomUUID()}`;

    const reqOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      agent,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(postData),
        'x-spike-request-id': requestId,
      },
      timeout: timeoutMs,
    };

    const clientStart = process.hrtime.bigint();

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const clientElapsedMs = Number(process.hrtime.bigint() - clientStart) / 1e6;

        // Ưu tiên đọc in-process duration từ app header để triệt tiêu nhiễu port-forwarding
        const headerDuration = res.headers['x-spike-duration-ms'];
        let durationMs = clientElapsedMs;
        if (headerDuration !== undefined && !Number.isNaN(Number(headerDuration))) {
          durationMs = Number(headerDuration);
        }

        // Đọc path label từ header (P-discard vs P-persist)
        let pathLabel = res.headers['x-spike-path'];
        if (!pathLabel) {
          // Fallback logic
          pathLabel = (res.statusCode === 201 || res.statusCode === 200) ? 'P-discard' : 'P-persist';
        }

        resolve({
          statusCode: res.statusCode || 0,
          durationMs,
          pathLabel,
          clientElapsedMs,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Request timeout sau ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Chạy Load Driver phát tải HTTP với concurrency kiểm soát.
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number} [options.concurrency=10]
 * @param {number} [options.requestCount=1000]
 * @param {number} [options.targetErrorRate=0.05]
 * @param {number} [options.timeoutMs=5000]
 * @param {Function} [options.requestFn] - Custom request function cho test
 * @param {Function} [options.onProgress] - Callback tiến độ
 * @returns {Promise<{
 *   requestCount: number,
 *   successCount: number,
 *   errorCount: number,
 *   actualErrorRate: number,
 *   totalElapsedMs: number,
 *   latencies: { all: number[], 'P-discard': number[], 'P-persist': number[] },
 *   statusCodes: Record<number, number>,
 *   failures: Array<{ index: number, error: string }>,
 * }>}
 */
async function runLoadDriver(options) {
  const endpoint = options.endpoint;
  const concurrency = Math.max(1, Number(options.concurrency || 10));
  const requestCount = Math.max(1, Number(options.requestCount || 1000));
  const targetErrorRate = Number(
    options.targetErrorRate !== undefined ? options.targetErrorRate : 0.05
  );
  const timeoutMs = Number(options.timeoutMs || 5000);
  const requestFn = options.requestFn;
  const onProgress = options.onProgress;

  const agent = new http.Agent({
    keepAlive: true,
    maxSockets: concurrency,
  });

  const latencies = {
    all: [],
    'P-discard': [],
    'P-persist': [],
  };
  const statusCodes = {};
  const failures = [];

  let nextIndex = 0;
  let completedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  const driverStart = process.hrtime.bigint();

  async function worker() {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= requestCount) {
        break;
      }

      const payload = generateRequestPayload(currentIndex, requestCount, targetErrorRate);

      try {
        const response = await sendSingleRequest({
          endpoint,
          body: {
            customer_id: payload.customer_id,
            sku: payload.sku,
            quantity: payload.quantity,
          },
          timeoutMs,
          agent,
          customRequestFn: requestFn,
        });

        const status = response.statusCode;
        statusCodes[status] = (statusCodes[status] || 0) + 1;

        if (status >= 200 && status < 400) {
          successCount++;
        } else {
          errorCount++;
        }

        const dur = response.durationMs;
        latencies.all.push(dur);

        const pathKey = response.pathLabel === 'P-persist' ? 'P-persist' : 'P-discard';
        latencies[pathKey].push(dur);
      } catch (err) {
        failures.push({
          index: currentIndex,
          error: err.message || String(err),
        });
        errorCount++;
      } finally {
        completedCount++;
        if (typeof onProgress === 'function' && completedCount % 100 === 0) {
          onProgress({ completedCount, totalCount: requestCount });
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, requestCount) }, () => worker());
  await Promise.all(workers);

  agent.destroy();

  const totalElapsedMs = Number(process.hrtime.bigint() - driverStart) / 1e6;
  const actualErrorRate = requestCount > 0 ? errorCount / requestCount : 0;

  return {
    requestCount,
    successCount,
    errorCount,
    actualErrorRate,
    totalElapsedMs,
    latencies,
    statusCodes,
    failures,
  };
}

module.exports = {
  CUSTOMERS,
  SUCCESS_SKUS,
  ERROR_SKU,
  generateRequestPayload,
  sendSingleRequest,
  runLoadDriver,
};
