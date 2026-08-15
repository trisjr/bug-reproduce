'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * TEST BẤT BIẾN HẠ DÒNG (`R2`) — A/B Ở TẦNG APP.
 *
 * Vì sao ở tầng app: `B1` chỉ `Depends: GA`; recorder (`B3`) và replay (`B5`) CHƯA
 * TỒN TẠI lúc này. Test này thay thế chúng bằng cách so hai lần chạy thật:
 *
 *   Pha A — "redis-warm"    : Redis sống, counter đã được hâm nóng bằng 1 request.
 *   Pha B — "redis-blocked" : Redis trỏ vào cổng đóng (mô phỏng B5 chặn / Redis tắt).
 *
 * Ba thứ PHẢI bất biến giữa hai pha:
 *   (i)   response (status code + body, so NGUYÊN VẸN, không normalize)
 *   (ii)  log truy vấn `pg`   — cùng dãy target/arguments/result
 *   (iii) log gọi HTTP stub   — cùng dãy phía app VÀ phía stub
 *
 * Cộng bốn kiểm chứng cấu trúc chống "nghi thức rỗng" và chống read-through cache:
 *   (iv)  cả hai pha chạm ĐỦ 5 dependency trong MỘT request
 *   (v)   pha A có ít nhất một lời gọi Redis THÀNH CÔNG (Redis thật sự được gọi)
 *   (vi)  pha B mọi lời gọi Redis đều lỗi/bỏ qua mà app vẫn cho cùng kết cục
 *   (vii) MỌI interaction Redis nằm SAU mốc `outcome-computed` ở cả hai pha
 *
 * Điều kiện chạy: PostgreSQL + Redis thật, env CT-4 đầy đủ. Script tự spawn app và
 * stub trên cổng trống riêng ⇒ không đụng service đang chạy.
 *
 * ⚠️ Nếu hai pha chạy vắt qua mốc 22:00 hoặc 06:00 UTC, `pricing.window` đổi và
 *    check (i) sẽ FAIL — đó là clock, không phải Redis. Chạy lại là hết.
 */

const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const { createPool } = require('./db');
const { failFast, loadAppConfig } = require('./config');
const { requestJson } = require('./http-json');
const { resetOrders, setupSpikeDatabase } = require('./seed');

const APP_SCRIPT = path.join(__dirname, 'server.js');
const STUB_SCRIPT = path.join(__dirname, 'stub', 'server.js');
const CHILD_READY_TIMEOUT_MS = 15000;

const MEASURED_REQUEST_BODY = Object.freeze({ customer_id: 'cust-1001', sku: 'SKU-BOOK-001', quantity: 2 });
const WARMUP_REQUEST_ID = 'b1-invariant-warmup';
const MEASURED_REQUEST_ID = 'b1-invariant-measured';

// --------------------------------------------------------------------------
// Tiện ích
// --------------------------------------------------------------------------

/** Canonical form (Spec §3.2 phép normalization 3): sắp key rồi stringify. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonical(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonical(value), null, 2);
}

/** Xin một cổng TCP trống từ OS. */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Spawn một process con và đợi dòng JSON `event: "ready"` trên stdout.
 * @returns {Promise<{child: import('node:child_process').ChildProcess, lines: string[]}>}
 */
function spawnChild({ name, script, env }) {
  const child = spawn(process.execPath, [script], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  const lines = [];
  let buffer = '';
  let stderr = '';

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    const parts = buffer.split('\n');
    buffer = parts.pop();
    for (const part of parts) if (part.trim() !== '') lines.push(part);
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  return new Promise((resolve, reject) => {
    const deadline = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`[${name}] không sẵn sàng sau ${CHILD_READY_TIMEOUT_MS}ms. stderr: ${stderr}`));
    }, CHILD_READY_TIMEOUT_MS);

    child.on('exit', (code) => {
      clearTimeout(deadline);
      reject(new Error(`[${name}] thoát sớm với mã ${code}. stderr: ${stderr}`));
    });

    const poll = setInterval(() => {
      const ready = lines.some((line) => {
        try {
          return JSON.parse(line).event === 'ready';
        } catch {
          return false;
        }
      });
      if (ready) {
        clearInterval(poll);
        clearTimeout(deadline);
        child.removeAllListeners('exit');
        resolve({ child, lines });
      }
    }, 25);
  });
}

async function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  for (let i = 0; i < 40 && child.exitCode === null; i += 1) await sleep(25);
  if (child.exitCode === null) child.kill('SIGKILL');
}

/** Lọc interaction của đúng một request từ stdout của app. */
function interactionsOf(lines, requestId) {
  return lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((entry) => entry && entry.log === 'spike-interaction' && entry.request_id === requestId);
}

/** Chiếu một nhóm interaction về dạng so sánh được (bỏ ordinal tuyệt đối). */
function projectSequence(interactions, kind) {
  return interactions
    .filter((entry) => entry.kind === kind)
    .map((entry, index) => ({
      position: index + 1,
      target: entry.target,
      arguments: entry.arguments,
      result: entry.result,
      error: entry.error,
    }));
}

// --------------------------------------------------------------------------
// Chạy một pha
// --------------------------------------------------------------------------

/**
 * @param {{name: string, config: object, pool: import('pg').Pool,
 *          redis: {host: string, port: number}, warmRedis: boolean}} options
 */
async function runPhase({ name, config, pool, redis, warmRedis }) {
  const appPort = await findFreePort();
  const stubPort = await findFreePort();
  const stubUrl = `http://127.0.0.1:${stubPort}`;

  const stubEnv = {
    ...process.env,
    SPIKE_RUN_ID: config.runId,
    SPIKE_HTTP_STUB_URL: stubUrl,
  };
  const appEnv = {
    ...process.env,
    SPIKE_RUN_ID: config.runId,
    SPIKE_APP_PORT: String(appPort),
    SPIKE_PG_HOST: config.pg.host,
    SPIKE_PG_PORT: String(config.pg.port),
    SPIKE_PG_USER: config.pg.user,
    SPIKE_PG_PASSWORD: config.pg.password,
    SPIKE_PG_DATABASE: config.pg.database,
    SPIKE_REDIS_HOST: redis.host,
    SPIKE_REDIS_PORT: String(redis.port),
    SPIKE_HTTP_STUB_URL: stubUrl,
    SPIKE_FLAG_FILE: config.flagFile,
  };

  let stub;
  let app;
  try {
    await resetOrders(pool);
    stub = await spawnChild({ name: `${name}:stub`, script: STUB_SCRIPT, env: stubEnv });
    app = await spawnChild({ name: `${name}:app`, script: APP_SCRIPT, env: appEnv });

    if (warmRedis) {
      // Hâm nóng counter Redis, rồi XOÁ dấu vết của nó trong DB và trong sổ ghi
      // của stub, để hai pha khởi hành từ trạng thái giống hệt nhau
      // (order_id = 1, count = 1, stub call ordinal = 1).
      // ⚠️ Chỉ trạng thái NGOÀI Redis bị reset — Redis vẫn giữ nguyên độ "ấm",
      //    đó chính là biến độc lập của phép A/B này.
      await requestJson({
        url: `http://127.0.0.1:${appPort}/checkout`,
        method: 'POST',
        body: MEASURED_REQUEST_BODY,
        headers: { 'x-spike-request-id': WARMUP_REQUEST_ID },
      });
      await resetOrders(pool);
      await requestJson({ url: `${stubUrl}/__stub/reset`, method: 'POST', body: {} });
    }

    const response = await requestJson({
      url: `http://127.0.0.1:${appPort}/checkout`,
      method: 'POST',
      body: MEASURED_REQUEST_BODY,
      headers: { 'x-spike-request-id': MEASURED_REQUEST_ID },
    });

    const stubCalls = await requestJson({ url: `${stubUrl}/__stub/calls?request_id=${MEASURED_REQUEST_ID}` });

    return {
      name,
      response: { statusCode: response.statusCode, body: response.body },
      interactions: interactionsOf(app.lines, MEASURED_REQUEST_ID),
      warmupInteractions: warmRedis ? interactionsOf(app.lines, WARMUP_REQUEST_ID) : [],
      stubCalls: (stubCalls.body.calls || []).map((call) => ({
        ordinal: call.ordinal,
        method: call.method,
        path: call.path,
        body: call.body,
        response: call.response,
      })),
    };
  } finally {
    await stopChild(app && app.child);
    await stopChild(stub && stub.child);
  }
}

// --------------------------------------------------------------------------
// Kiểm chứng
// --------------------------------------------------------------------------

class CheckSheet {
  constructor() {
    this.checks = [];
  }

  add(id, description, passed, detail) {
    this.checks.push({ id, description, passed, detail });
  }

  equal(id, description, left, right, detail) {
    const same = canonicalJson(left) === canonicalJson(right);
    this.add(id, description, same, same ? detail : `A=${canonicalJson(left)}\n---\nB=${canonicalJson(right)}`);
  }

  get failed() {
    return this.checks.filter((check) => !check.passed);
  }

  print() {
    process.stdout.write('\n=== R2 — TEST BẤT BIẾN HẠ DÒNG (A/B tầng app) ===\n');
    for (const check of this.checks) {
      process.stdout.write(`${check.passed ? 'PASS' : 'FAIL'}  ${check.id}  ${check.description}\n`);
      if (check.detail) process.stdout.write(`      ${String(check.detail).replace(/\n/gu, '\n      ')}\n`);
    }
    process.stdout.write(
      `\nKẾT QUẢ: ${this.failed.length === 0 ? 'PASS' : `FAIL (${this.failed.length} check)`}\n`,
    );
  }
}

const REQUIRED_KINDS = Object.freeze(['inbound-http', 'clock', 'feature-flag', 'db-query', 'outbound-http', 'cache']);

function checkDependencyCoverage(sheet, phase) {
  const kinds = new Set(phase.interactions.map((entry) => entry.kind));
  const missing = REQUIRED_KINDS.filter((kind) => !kinds.has(kind));
  sheet.add(
    `DEP-${phase.name}`,
    `[${phase.name}] một request chạm đủ 5 dependency (${REQUIRED_KINDS.join(', ')})`,
    missing.length === 0,
    missing.length === 0 ? `${phase.interactions.length} đơn vị` : `thiếu: ${missing.join(', ')}`,
  );
}

function checkCacheOffPath(sheet, phase) {
  const marker = phase.interactions.find((entry) => entry.kind === 'marker' && entry.target === 'outcome-computed');
  const cacheEntries = phase.interactions.filter((entry) => entry.kind === 'cache');

  sheet.add(
    `MARK-${phase.name}`,
    `[${phase.name}] có mốc \`outcome-computed\``,
    Boolean(marker),
    marker ? `ordinal=${marker.ordinal}` : 'không tìm thấy mốc',
  );

  const allAfter = Boolean(marker) && cacheEntries.every((entry) => entry.ordinal > marker.ordinal);
  sheet.add(
    `OFFPATH-${phase.name}`,
    `[${phase.name}] MỌI interaction Redis nằm SAU mốc kết cục (cấm read-through cache)`,
    allAfter && cacheEntries.length > 0,
    `cache ordinals=[${cacheEntries.map((entry) => entry.ordinal).join(', ')}], marker=${marker ? marker.ordinal : 'n/a'}`,
  );

  const allFlagged = cacheEntries.every((entry) => entry.off_execution_path === true);
  sheet.add(
    `FLAG-${phase.name}`,
    `[${phase.name}] mọi interaction Redis mang \`off_execution_path: true\``,
    allFlagged,
    `${cacheEntries.length} interaction`,
  );
}

function buildCheckSheet(phaseA, phaseB) {
  const sheet = new CheckSheet();

  // (i) response
  sheet.equal('I-RESPONSE', 'response (status + body) BẤT BIẾN giữa redis-warm và redis-blocked', phaseA.response, phaseB.response, `status=${phaseA.response.statusCode}`);

  // (ii) log pg
  const dbA = projectSequence(phaseA.interactions, 'db-query');
  const dbB = projectSequence(phaseB.interactions, 'db-query');
  sheet.equal('II-PG', `log truy vấn pg BẤT BIẾN (${dbA.length} query)`, dbA, dbB, `${dbA.length} query mỗi pha`);

  // (iii) log gọi HTTP stub — cả phía app lẫn phía stub
  const httpA = projectSequence(phaseA.interactions, 'outbound-http');
  const httpB = projectSequence(phaseB.interactions, 'outbound-http');
  sheet.equal('III-HTTP-APP', `log gọi HTTP stub phía app BẤT BIẾN (${httpA.length} lời gọi)`, httpA, httpB, `${httpA.length} lời gọi mỗi pha`);
  sheet.equal('III-HTTP-STUB', 'bản ghi phía stub BẤT BIẾN', phaseA.stubCalls, phaseB.stubCalls, `${phaseA.stubCalls.length} bản ghi mỗi pha`);

  // (iv) đủ 5 dependency
  checkDependencyCoverage(sheet, phaseA);
  checkDependencyCoverage(sheet, phaseB);

  // (v) Redis thật sự được gọi ở pha A — chống "nghi thức rỗng"
  const cacheA = phaseA.interactions.filter((entry) => entry.kind === 'cache');
  const succeededA = cacheA.filter((entry) => entry.error === null);
  sheet.add(
    'V-REDIS-REAL',
    'pha redis-warm: Redis THỰC SỰ được gọi và lời gọi quan sát được trong log',
    succeededA.length > 0,
    `${succeededA.length}/${cacheA.length} lời gọi Redis thành công: ${succeededA.map((entry) => entry.target).join(' | ')}`,
  );

  // (vi) pha B: Redis chết nhưng kết cục không đổi
  const cacheB = phaseB.interactions.filter((entry) => entry.kind === 'cache');
  const allFailedB = cacheB.length > 0 && cacheB.every((entry) => entry.error !== null);
  sheet.add(
    'VI-REDIS-DOWN',
    'pha redis-blocked: mọi lời gọi Redis lỗi/bỏ qua, app vẫn phục vụ bình thường',
    allFailedB,
    `${cacheB.filter((entry) => entry.error !== null).length}/${cacheB.length} lỗi — ví dụ: ${cacheB[0] ? cacheB[0].error : 'n/a'}`,
  );
  sheet.equal('VI-REDIS-COUNT', 'số lời gọi Redis giống nhau ở hai pha (không có nhánh nào bị bỏ)', cacheA.length, cacheB.length, `${cacheA.length} lời gọi`);

  // (vii) cấu trúc off-path
  checkCacheOffPath(sheet, phaseA);
  checkCacheOffPath(sheet, phaseB);

  return sheet;
}

// --------------------------------------------------------------------------
// main
// --------------------------------------------------------------------------

async function assertPostgresReachable(pool) {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    throw new Error(
      `Không kết nối được PostgreSQL tại ${pool.options.host}:${pool.options.port} — ${error.message}. ` +
        'Test này cần môi trường thật (B2). KHÔNG có chế độ giả lập.',
    );
  }
}

async function main() {
  const config = loadAppConfig();

  if (!fs.existsSync(config.flagFile)) {
    throw new Error(`SPIKE_FLAG_FILE không tồn tại: ${config.flagFile}`);
  }

  const pool = createPool(config.pg);
  let sheet;
  try {
    await assertPostgresReachable(pool);
    await setupSpikeDatabase(pool);

    const blackholePort = await findFreePort(); // cổng trống, KHÔNG bind ⇒ ECONNREFUSED

    process.stdout.write(
      `${JSON.stringify({
        log: 'spike-invariant-test',
        event: 'start',
        run_id: config.runId,
        redis_warm: `${config.redis.host}:${config.redis.port}`,
        redis_blocked: `127.0.0.1:${blackholePort}`,
        request: MEASURED_REQUEST_BODY,
      })}\n`,
    );

    const phaseA = await runPhase({ name: 'redis-warm', config, pool, redis: config.redis, warmRedis: true });
    const phaseB = await runPhase({
      name: 'redis-blocked',
      config,
      pool,
      redis: { host: '127.0.0.1', port: blackholePort },
      warmRedis: false,
    });

    sheet = buildCheckSheet(phaseA, phaseB);
    sheet.print();

    process.stdout.write(`\nResponse (giống hệt ở cả hai pha):\n${canonicalJson(phaseA.response)}\n`);
  } finally {
    await pool.end().catch(() => {});
  }

  if (!sheet || sheet.failed.length > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => failFast(error, 'test-invariant'));
}

module.exports = { canonical, canonicalJson, projectSequence };
