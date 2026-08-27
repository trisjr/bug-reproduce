'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/self-check.js
 *  SELF-CHECK TEST SUITE FOR REPLAY ENGINE & ADAPTERS (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Kiểm thử:
 *    1. Error hierarchy (MissingRecordingError, ReplayBlockedWriteError).
 *    2. ReplaySession & FIFO occurrence queue matching.
 *    3. DB Adapter (pg mock, READ retrieval, L1 WRITE blocking, fail-closed).
 *    4. HTTP Adapter (R3 allowlist, mock fetch/requestJson, fail-closed).
 *    5. Clock Adapter (U-13 FIFO sequential playback, exhaustion error).
 *    6. Flag Adapter (feature flags retrieval, fail-closed on missing flag).
 *    7. SpikeReplayRuntime & wrapApp end-to-end integration.
 */

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const {
  MissingRecordingError,
  ReplayBlockedWriteError,
  ReplaySession,
  SpikeReplayRuntime,
  createReplayRuntime,
  wrapApp,
  createDbAdapter,
  createHttpAdapter,
  createClockAdapter,
  createFlagAdapter,
} = require('./index');

const {
  makeArtifact,
  makeClassAssessment,
  makeU0,
  makeUInfinity,
  makeInteraction,
} = require('../contract');
const { writeCapsule } = require('../capsule');

console.log('\n=== B5 Replay Runtime & Adapters Self-Check ===\n');

// ---------------------------------------------------------------------------
// 1. Error Hierarchy Tests
// ---------------------------------------------------------------------------
console.log('1. Testing Error Hierarchy...');

const missingErr = new MissingRecordingError('DB record missing', {
  kind: 'db-query',
  target: 'SELECT * FROM users',
  arguments: { bind: [1] },
});
assert.strictEqual(missingErr.name, 'MissingRecordingError');
assert.strictEqual(missingErr.code, 'MISSING_RECORDING');
assert.strictEqual(missingErr.kind, 'db-query');
assert.strictEqual(missingErr.target, 'SELECT * FROM users');
assert.ok(missingErr instanceof Error);

const blockedErr = new ReplayBlockedWriteError('Insert blocked', {
  kind: 'db-query',
  target: 'INSERT INTO users VALUES (1)',
  arguments: { bind: [1] },
});
assert.strictEqual(blockedErr.name, 'ReplayBlockedWriteError');
assert.strictEqual(blockedErr.code, 'BLOCKED_WRITE_SIDE_EFFECT');
assert.strictEqual(blockedErr.kind, 'db-query');
assert.ok(blockedErr instanceof Error);

console.log('   ✅ Error hierarchy verified (MissingRecordingError, ReplayBlockedWriteError)');

// ---------------------------------------------------------------------------
// 2. Fixture Artifact Preparation
// ---------------------------------------------------------------------------
const sampleArtifact = makeArtifact({
  capsuleId: 'capsule-b5-test-01',
  scenarioId: 'SC-1',
  manifestCommitHash: '15c462e0867c6e15c462e9b99589232a684977ae',
  classAssessment: makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
  u0: makeU0({
    method: 'POST',
    target: '/checkout',
    arguments: { customer_id: 'CUST-001', sku: 'SKU-001', quantity: 2 },
  }),
  interactions: [
    // Clock 1
    makeInteraction({
      kind: 'clock',
      target: 'checkout.pricing-window',
      direction: 'READ',
      ordinal: 2,
      result: '2026-08-16T12:00:00.000Z',
    }),
    // Flag 1
    makeInteraction({
      kind: 'feature-flag',
      target: 'checkout_discount_v2',
      direction: 'READ',
      ordinal: 3,
      result: { enabled: true },
    }),
    // Flag 2
    makeInteraction({
      kind: 'feature-flag',
      target: 'night_surcharge',
      direction: 'READ',
      ordinal: 4,
      result: { enabled: false },
    }),
    // DB Query 1 (Product)
    makeInteraction({
      kind: 'db-query',
      target: 'SELECT * FROM products WHERE sku = $1',
      arguments: { bind: ['SKU-001'] },
      direction: 'READ',
      ordinal: 5,
      result: {
        rowCount: 1,
        rows: [{ id: 1, sku: 'SKU-001', unit_price_cents: 10000 }],
      },
    }),
    // DB Query 2 (Customer)
    makeInteraction({
      kind: 'db-query',
      target: 'SELECT * FROM customers WHERE id = $1',
      arguments: { bind: ['CUST-001'] },
      direction: 'READ',
      ordinal: 6,
      result: {
        rowCount: 1,
        rows: [{ id: 'CUST-001', tier: 'gold' }],
      },
    }),
    // DB Query 3 (Duplicate Query 1 for FIFO test)
    makeInteraction({
      kind: 'db-query',
      target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
      arguments: { bind: ['CUST-001'] },
      direction: 'READ',
      ordinal: 7,
      result: {
        rowCount: 1,
        rows: [{ count: '1' }],
      },
    }),
    // DB Query 4 (Duplicate Query 2 for FIFO test - second call)
    makeInteraction({
      kind: 'db-query',
      target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
      arguments: { bind: ['CUST-001'] },
      direction: 'READ',
      ordinal: 8,
      result: {
        rowCount: 1,
        rows: [{ count: '2' }],
      },
    }),
    // Outbound HTTP (Authorize payment)
    makeInteraction({
      kind: 'outbound-http',
      method: 'POST',
      target: 'http://spike-httpstub:8081/payments/authorize',
      arguments: { body: { customer_id: 'CUST-001', amount_cents: 18000 } },
      direction: 'READ', // R3: Allowed because recorded as READ
      ordinal: 9,
      result: {
        statusCode: 200,
        body: { decision: 'approved', authorization_code: 'AUTH-999', reason: null },
      },
    }),
    // Clock 2 (Order finalized)
    makeInteraction({
      kind: 'clock',
      target: 'checkout.order-finalized',
      direction: 'READ',
      ordinal: 10,
      result: '2026-08-16T12:00:01.500Z',
    }),
  ],
  uInfinity: makeUInfinity({
    class: 'http-response',
    type: 'status:201',
  }),
});

// ---------------------------------------------------------------------------
// 3. ReplaySession & FIFO Occurrence Queue Tests
// ---------------------------------------------------------------------------
console.log('2. Testing ReplaySession & FIFO Occurrence Queues...');

const session = new ReplaySession(sampleArtifact);
assert.strictEqual(session.scenarioId, 'SC-1');
assert.strictEqual(session.capsuleId, 'capsule-b5-test-01');
assert.strictEqual(session.entries.length, 9);
assert.strictEqual(session.clockQueue.length, 2);

// Test FIFO order on duplicate queries:
const countQuery1 = session.consume({
  kind: 'db-query',
  target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
  arguments: { bind: ['CUST-001'] },
});
assert.strictEqual(countQuery1.rows[0].count, '1', 'First query must return first FIFO result');

const countQuery2 = session.consume({
  kind: 'db-query',
  target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
  arguments: { bind: ['CUST-001'] },
});
assert.strictEqual(countQuery2.rows[0].count, '2', 'Second query must return second FIFO result');

// Third query should fail because queue is exhausted
assert.throws(() => {
  session.consume({
    kind: 'db-query',
    target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
    arguments: { bind: ['CUST-001'] },
  });
}, MissingRecordingError);

console.log('   ✅ FIFO occurrence queue & exhaustion verified');

// ---------------------------------------------------------------------------
// 4. Database Adapter Tests (Mock pg.Pool & pg.Client)
// ---------------------------------------------------------------------------
console.log('3. Testing Database Adapter (pg.Pool & pg.Client mock)...');

session.reset();
const dbAdapter = createDbAdapter(session);
const pool = dbAdapter.pool;

(async () => {
  // Test SELECT query
  const resProduct = await pool.query('SELECT * FROM products WHERE sku = $1', ['SKU-001']);
  assert.strictEqual(resProduct.rowCount, 1);
  assert.strictEqual(resProduct.rows[0].sku, 'SKU-001');
  assert.strictEqual(resProduct.rows[0].unit_price_cents, 10000);

  // Test L1 Write Blocking (INSERT / UPDATE / DELETE / DROP)
  await assert.rejects(async () => {
    await pool.query('INSERT INTO orders (id, sku) VALUES ($1, $2)', [101, 'SKU-001']);
  }, ReplayBlockedWriteError);

  await assert.rejects(async () => {
    await pool.query('UPDATE products SET unit_price_cents = 0 WHERE id = 1');
  }, ReplayBlockedWriteError);

  await assert.rejects(async () => {
    await pool.query('DELETE FROM customers WHERE id = $1', ['CUST-001']);
  }, ReplayBlockedWriteError);

  // Verify blocked writes log
  const blockedWrites = session.getBlockedWrites();
  assert.strictEqual(blockedWrites.length, 3);
  assert.strictEqual(blockedWrites[0].kind, 'db-query');
  assert.ok(blockedWrites[0].target.startsWith('INSERT'));

  // Test Fail-Closed on unrecorded SELECT
  await assert.rejects(async () => {
    await pool.query('SELECT * FROM non_existent_table WHERE id = $1', [999]);
  }, MissingRecordingError);

  // Test MockPgClient connect & query
  const client = await pool.connect();
  const resCust = await client.query('SELECT * FROM customers WHERE id = $1', ['CUST-001']);
  assert.strictEqual(resCust.rows[0].id, 'CUST-001');
  client.release();
  assert.strictEqual(client._released, true);

  console.log('   ✅ DB Adapter verified (SELECT playback, L1 WRITE blocking, fail-closed)');

  // ---------------------------------------------------------------------------
  // 5. HTTP Adapter Tests (R3 Allowlist & Mock Fetch / RequestJson)
  // ---------------------------------------------------------------------------
  console.log('4. Testing HTTP Adapter (R3 allowlist & egress interception)...');

  session.reset();
  const httpAdapter = createHttpAdapter(session);

  // Test requestJson (R3 allowed because recorded as READ)
  const authResponse = await httpAdapter.requestJson({
    url: 'http://spike-httpstub:8081/payments/authorize',
    method: 'POST',
    body: { customer_id: 'CUST-001', amount_cents: 18000 },
  });
  assert.strictEqual(authResponse.statusCode, 200);
  assert.strictEqual(authResponse.body.decision, 'approved');
  assert.strictEqual(authResponse.body.authorization_code, 'AUTH-999');

  // Test fetch API
  session.reset();
  const fetchRes = await httpAdapter.fetch('http://spike-httpstub:8081/payments/authorize', {
    method: 'POST',
    body: JSON.stringify({ customer_id: 'CUST-001', amount_cents: 18000 }),
  });
  assert.strictEqual(fetchRes.status, 200);
  assert.strictEqual(fetchRes.ok, true);
  const jsonBody = await fetchRes.json();
  assert.strictEqual(jsonBody.decision, 'approved');

  // Test unrecorded HTTP request (Fail-closed)
  await assert.rejects(async () => {
    await httpAdapter.requestJson({
      url: 'https://api.unknown-service.com/data',
      method: 'GET',
    });
  }, MissingRecordingError);

  // Test unrecorded HTTP WRITE request (L1 write blocked)
  await assert.rejects(async () => {
    await httpAdapter.requestJson({
      url: 'https://api.external-payment.com/v1/charge',
      method: 'POST',
      body: { amount: 5000 },
    });
  }, ReplayBlockedWriteError);

  console.log('   ✅ HTTP Adapter verified (R3 matching, fail-closed, write blocking)');

  // ---------------------------------------------------------------------------
  // 6. Clock Adapter Tests (U-13 Sequential FIFO Cursor)
  // ---------------------------------------------------------------------------
  console.log('5. Testing Clock Adapter (U-13 sequential FIFO cursor)...');

  session.reset();
  const clockAdapter = createClockAdapter(session);

  // Read 1
  const clock1 = clockAdapter.nextDate();
  assert.strictEqual(clock1.toISOString(), '2026-08-16T12:00:00.000Z');

  // Read 2
  const clock2 = clockAdapter.nextDate();
  assert.strictEqual(clock2.toISOString(), '2026-08-16T12:00:01.500Z');

  // Verified t2 - t1 measured locally matches production recorded duration (1500ms)
  const durationMs = clock2.getTime() - clock1.getTime();
  assert.strictEqual(durationMs, 1500, 'U-13: t2 - t1 in replay must equal production recording');

  // Read 3 -> Exhausted -> MissingRecordingError
  assert.throws(() => {
    clockAdapter.nextDate();
  }, MissingRecordingError);

  console.log('   ✅ Clock Adapter verified (U-13 sequential playback, duration equality, fail-closed)');

  // ---------------------------------------------------------------------------
  // 7. Feature Flag Adapter Tests
  // ---------------------------------------------------------------------------
  console.log('6. Testing Feature Flag Adapter...');

  session.reset();
  const flagAdapter = createFlagAdapter(session);

  const flagDiscount = flagAdapter.getFlag('checkout_discount_v2');
  assert.strictEqual(flagDiscount, true);

  const flagNight = flagAdapter.getFlag('night_surcharge');
  assert.strictEqual(flagNight, false);

  const flagsMap = flagAdapter.evaluateFlags(['checkout_discount_v2', 'night_surcharge']);
  assert.deepStrictEqual(flagsMap, {
    checkout_discount_v2: true,
    night_surcharge: false,
  });

  // Unrecorded flag -> Fail-closed MissingRecordingError
  assert.throws(() => {
    flagAdapter.getFlag('unrecorded_experiment_flag');
  }, MissingRecordingError);

  console.log('   ✅ Feature Flag Adapter verified (flag retrieval, fail-closed)');

  // ---------------------------------------------------------------------------
  // 8. Capsule File Loading & ReplayRuntime Integration
  // ---------------------------------------------------------------------------
  console.log('7. Testing Capsule File Loading & SpikeReplayRuntime...');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spike-replay-test-'));
  const capsuleDir = path.join(tmpDir, 'src', 'spike', 'capsules');
  fs.mkdirSync(capsuleDir, { recursive: true });
  const capsulePath = path.join(capsuleDir, 'sc-1.capsule');

  writeCapsule(capsulePath, sampleArtifact);

  const runtime = createReplayRuntime(capsulePath);
  assert.strictEqual(runtime.session.scenarioId, 'SC-1');
  assert.strictEqual(runtime.session.capsuleId, 'capsule-b5-test-01');

  // Test wrapApp with mock handler
  const mockHandler = async (ctx, body) => {
    const clock = ctx.clockProvider ? ctx.clockProvider() : new Date();
    const product = await ctx.pool.query('SELECT * FROM products WHERE sku = $1', [body.sku]);
    const customer = await ctx.pool.query('SELECT * FROM customers WHERE id = $1', [body.customer_id]);
    return {
      statusCode: 200,
      body: {
        sku: product.rows[0].sku,
        customer_tier: customer.rows[0].tier,
        clock: clock.toISOString(),
      },
    };
  };

  const replayed = wrapApp(mockHandler, {
    runtime,
    extraCtx: {
      clockProvider: runtime.clockAdapter.createClockProvider(),
    },
  });

  const replayResult = await replayed({ sku: 'SKU-001', customer_id: 'CUST-001' });
  assert.strictEqual(replayResult.statusCode, 200);
  assert.strictEqual(replayResult.body.sku, 'SKU-001');
  assert.strictEqual(replayResult.body.customer_tier, 'gold');
  assert.strictEqual(replayResult.body.clock, '2026-08-16T12:00:00.000Z');

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log('   ✅ Capsule file loading & wrapApp end-to-end integration verified');

  console.log('\n============================================================');
  console.log('✅ B5 Replay Engine & All Adapters Self-Check PASSED (100%)');
  console.log('============================================================\n');
})();
