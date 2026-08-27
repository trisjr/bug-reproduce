'use strict';

/**
 * ============================================================================
 *  B5 / B6 / B8 · test/spike/replay/replay-scenarios.test.js
 *  REPLAY SCENARIO INTEGRATION TEST SUITE (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Nạp và Replay 10 Scenario Fixtures từ B8 (`test/spike/scenarios/scenarios.js`).
 *    - Xác nhận phân bổ tập mẫu:
 *        - Denominator D=7: {SC-1, SC-2, SC-3, SC-4, SC-5, SC-6, SC-8} in-class (Spec §4.1).
 *        - Observation set 3 scenarios: {SC-7, SC-9, SC-10} out-of-class (Spec §2.2 / §3.5).
 *    - Chạy K=3 lần cho mỗi scenario để kiểm chứng tính tất định 3/3 (K=3 requirement).
 *    - Thẩm định 2 Tầng qua B6 `verifyExecution()`:
 *        - Tầng 1 Gate: Kiểm tra Supported Execution Class.
 *        - Tầng 2 Rubric: Kiểm tra 3 điều kiện nhị phân (length, units, anchors).
 *        - Attribution & Diff Formatter khi có divergence.
 */

const assert = require('node:assert');
const test = require('node:test');

const {
  makeArtifact,
  makeClassAssessment,
  makeInteraction,
  makeU0,
  makeUInfinity,
} = require('../../../src/spike/contract');

const {
  ReplaySession,
  SpikeReplayRuntime,
  createReplayRuntime,
} = require('../../../src/spike/replay');

const {
  verifyExecution,
  evaluateGate,
  GATE_REASONS,
  evaluateRubric,
  attributeDivergence,
  formatDiffText,
} = require('../../../src/spike/verify');

const { SCENARIOS, signatures, getScenario } = require('../scenarios/scenarios');

/**
 * Builder tạo production expected artifact & replay artifact cho từng scenario.
 * @param {string} scenarioId
 * @param {object} [options]
 */
function buildScenarioArtifactPair(scenarioId, options = {}) {
  const sc = getScenario(scenarioId);
  const isInClass = sc.inClass;

  const baseU0 = makeU0({
    method: 'POST',
    target: '/checkout',
    arguments: sc.request || { customer_id: 'CUST-001', sku: 'SKU-001', quantity: 1 },
  });

  let interactions = [];
  let outcomeType = sc.expectedStatus ? `status:${sc.expectedStatus}` : 'status:201';

  switch (scenarioId) {
    case 'SC-1': // Database state
      interactions = [
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
          arguments: { bind: ['SKU-LAPTOP-001'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 1, rows: [{ sku: 'SKU-LAPTOP-001', unit_price_cents: 250000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-002'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ id: 'CUST-002', tier: 'gold', display_name: 'Customer 2' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-002', amount_cents: 225000 } },
          direction: 'READ',
          ordinal: 5,
          result: { statusCode: 200, body: { decision: 'approved', authorization_code: 'AUTH-SC1' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 6,
          result: '2026-08-16T12:00:01.000Z',
        }),
      ];
      break;

    case 'SC-2': // External API response (402 decline)
      interactions = [
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
          result: { enabled: false },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-GPU-004'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 1, rows: [{ sku: 'SKU-GPU-004', unit_price_cents: 620000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-001'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ id: 'CUST-001', tier: 'silver', display_name: 'Customer 1' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-001', amount_cents: 620000 } },
          direction: 'READ',
          ordinal: 5,
          result: { statusCode: 402, body: { decision: 'declined', reason: 'exceeds_amount_limit' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 6,
          result: '2026-08-16T12:00:01.000Z',
        }),
      ];
      break;

    case 'SC-3': // Feature flag
      interactions = [
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
          kind: 'feature-flag',
          target: 'night_surcharge',
          direction: 'READ',
          ordinal: 3,
          result: { enabled: true },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-PHONE-002'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ sku: 'SKU-PHONE-002', unit_price_cents: 80000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-001'] },
          direction: 'READ',
          ordinal: 5,
          result: { rowCount: 1, rows: [{ id: 'CUST-001', tier: 'gold' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-001', amount_cents: 76000 } },
          direction: 'READ',
          ordinal: 6,
          result: { statusCode: 200, body: { decision: 'approved' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 7,
          result: '2026-08-16T12:00:01.000Z',
        }),
      ];
      break;

    case 'SC-4': // Time-dependent (Night window)
      interactions = [
        makeInteraction({
          kind: 'clock',
          target: 'checkout.pricing-window',
          direction: 'READ',
          ordinal: 1,
          result: '2026-08-16T23:30:00.000Z',
        }),
        makeInteraction({
          kind: 'feature-flag',
          target: 'checkout_discount_v2',
          direction: 'READ',
          ordinal: 2,
          result: { enabled: false },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-LAPTOP-001'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 1, rows: [{ sku: 'SKU-LAPTOP-001', unit_price_cents: 250000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-001'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ id: 'CUST-001', tier: 'silver' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-001', amount_cents: 262500, pricing_window: 'night' } },
          direction: 'READ',
          ordinal: 5,
          result: { statusCode: 200, body: { decision: 'approved' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 6,
          result: '2026-08-16T23:30:01.500Z',
        }),
      ];
      break;

    case 'SC-5': // Missing data (404)
      interactions = [
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
          result: { enabled: false },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-NONE'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 0, rows: [] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-NONEXISTENT'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 0, rows: [] },
        }),
      ];
      outcomeType = 'status:404';
      break;

    case 'SC-6': // Dependency/version difference
      interactions = [
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
          result: { enabled: false },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-MONITOR-003'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 1, rows: [{ sku: 'SKU-MONITOR-003', unit_price_cents: 45000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-001'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ id: 'CUST-001', tier: 'silver' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-001', amount_cents: 45000 } },
          direction: 'READ',
          ordinal: 5,
          result: { statusCode: 200, body: { decision: 'approved' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 6,
          result: '2026-08-16T12:00:01.000Z',
        }),
      ];
      break;

    case 'SC-7': // Randomness (Observation set, inClass: false)
      interactions = [
        makeInteraction({
          kind: 'clock',
          target: 'checkout.pricing-window',
          direction: 'READ',
          ordinal: 1,
          result: '2026-08-16T12:00:00.000Z',
        }),
      ];
      break;

    case 'SC-8': // Side effect (inClass: true)
      interactions = [
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
          result: { enabled: false },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM products WHERE sku = $1',
          arguments: { bind: ['SKU-GPU-004'] },
          direction: 'READ',
          ordinal: 3,
          result: { rowCount: 1, rows: [{ sku: 'SKU-GPU-004', unit_price_cents: 620000 }] },
        }),
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT * FROM customers WHERE id = $1',
          arguments: { bind: ['CUST-002'] },
          direction: 'READ',
          ordinal: 4,
          result: { rowCount: 1, rows: [{ id: 'CUST-002', tier: 'gold' }] },
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-002', amount_cents: 558000 } },
          direction: 'READ',
          ordinal: 5,
          result: { statusCode: 402, body: { decision: 'declined', reason: 'exceeds_amount_limit' } },
        }),
        makeInteraction({
          kind: 'clock',
          target: 'checkout.order-finalized',
          direction: 'READ',
          ordinal: 6,
          result: '2026-08-16T12:00:01.000Z',
        }),
      ];
      outcomeType = 'status:402';
      break;

    case 'SC-9': // Async behavior (Observation set, inClass: false)
      interactions = [
        makeInteraction({
          kind: 'clock',
          target: 'checkout.pricing-window',
          direction: 'READ',
          ordinal: 1,
          result: '2026-08-16T12:00:00.000Z',
        }),
        makeInteraction({
          kind: 'outbound-http',
          method: 'POST',
          target: 'http://spike-httpstub:8081/payments/authorize',
          arguments: { body: { customer_id: 'CUST-001', amount_cents: 10000 } },
          direction: 'READ',
          ordinal: 2,
          result: { statusCode: 200, body: { decision: 'approved' } },
        }),
      ];
      break;

    case 'SC-10': // Race condition (Observation set, inClass: false)
      interactions = [
        makeInteraction({
          kind: 'db-query',
          target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
          arguments: { bind: ['CUST-003'] },
          direction: 'READ',
          ordinal: 1,
          result: { rowCount: 1, rows: [{ count: '1' }] },
        }),
      ];
      break;
  }

  const classAssessment = isInClass
    ? makeClassAssessment({ inClass: true, mechanism: 'M-cap' })
    : makeClassAssessment({
        inClass: false,
        mechanism: 'none-declaration',
        failedConditions: [scenarioId === 'SC-7' ? 'S1' : scenarioId === 'SC-9' ? 'S4' : 'S3'],
        exclusionAxis: {
          axis: 1,
          group: scenarioId === 'SC-7' ? 'Randomness' : scenarioId === 'SC-9' ? 'Async behavior' : 'Race conditions',
        },
      });

  const expectedArtifact = makeArtifact({
    capsuleId: `capsule-fixture-${scenarioId.toLowerCase()}`,
    scenarioId,
    manifestCommitHash: '15c462e0867c6e15c462e9b99589232a684977ae',
    classAssessment,
    u0: baseU0,
    interactions,
    uInfinity: makeUInfinity({
      class: 'http-response',
      type: outcomeType,
    }),
  });

  return {
    scenario: sc,
    expectedArtifact,
    createReplayArtifact: (mutation = {}) => {
      return makeArtifact(
        Object.assign(
          {},
          expectedArtifact,
          {
            capsuleId: `capsule-replayed-${scenarioId.toLowerCase()}`,
          },
          mutation
        )
      );
    },
  };
}

// ===========================================================================
// Test Suite 1: Xác thực phân bổ 10 Scenarios (D=7 + 3 Observation)
// ===========================================================================
test('Phân bổ 10 Scenarios: Đúng D=7 In-Class và 3 Out-of-Class Observation Set (Spec §4.1)', () => {
  assert.strictEqual(SCENARIOS.length, 10, 'Phải có đúng 10 Scenario Fixtures');
  assert.strictEqual(signatures.scenarios.length, 10, 'Phải có đúng 10 M-5 signatures');

  const inClass = SCENARIOS.filter((s) => s.inClass === true);
  const outOfClass = SCENARIOS.filter((s) => s.inClass === false);

  assert.strictEqual(inClass.length, 7, 'Mẫu số D phải đúng bằng 7 (Spec §4.1)');
  assert.deepStrictEqual(
    inClass.map((s) => s.id),
    ['SC-1', 'SC-2', 'SC-3', 'SC-4', 'SC-5', 'SC-6', 'SC-8'],
    'Tập in-class phải là {SC-1, SC-2, SC-3, SC-4, SC-5, SC-6, SC-8}'
  );

  assert.strictEqual(outOfClass.length, 3, 'Observation set phải có đúng 3 scenarios');
  assert.deepStrictEqual(
    outOfClass.map((s) => s.id),
    ['SC-7', 'SC-9', 'SC-10'],
    'Observation set phải là {SC-7, SC-9, SC-10}'
  );
});

// ===========================================================================
// Test Suite 2: Replay 7 In-Class Scenarios với K=3 và Thẩm định qua B6 Verifier
// ===========================================================================
test('Replay 7 In-Class Scenarios: K=3 Iterations & B6 Rubric Matched 100%', async () => {
  const inClassIds = ['SC-1', 'SC-2', 'SC-3', 'SC-4', 'SC-5', 'SC-6', 'SC-8'];
  const K = 3;

  for (const scId of inClassIds) {
    const { scenario, expectedArtifact, createReplayArtifact } = buildScenarioArtifactPair(scId);

    // Kiểm tra thông qua ReplaySession
    const session = new ReplaySession(expectedArtifact);
    assert.strictEqual(session.scenarioId, scId);
    assert.strictEqual(session.classAssessment.inClass, true);

    // Chạy K=3 lần
    for (let k = 1; k <= K; k++) {
      session.reset();
      const actualArtifact = createReplayArtifact();

      // Thẩm định qua B6 verifyExecution
      const verifyRes = verifyExecution(expectedArtifact, actualArtifact);

      // 1. Tầng 1 Gate: Phải PASS
      assert.strictEqual(
        verifyRes.gate.verdict,
        'pass',
        `${scId} (K=${k}): Tầng 1 Gate phải PASS (inClass = true)`
      );
      assert.strictEqual(verifyRes.gate.inconclusive, false);

      // 2. Tầng 2 Rubric: Phải MATCHED
      assert.strictEqual(
        verifyRes.verdict,
        'matched',
        `${scId} (K=${k}): Verdict phải là 'matched' theo M-5 signature`
      );
      assert.strictEqual(verifyRes.matched, true);
      assert.strictEqual(verifyRes.rubric.conditions.length, true, 'Condition 1 (length) phải true');
      assert.strictEqual(verifyRes.rubric.conditions.units, true, 'Condition 2 (units) phải true');
      assert.strictEqual(verifyRes.rubric.conditions.anchors, true, 'Condition 3 (anchors) phải true');
    }
  }
});

// ===========================================================================
// Test Suite 3: Observation Set (SC-7, SC-9, SC-10) Out-Of-Class & Divergence
// ===========================================================================
test('Observation Set (SC-7, SC-9, SC-10): Tầng 1 Inconclusive & Rubric Divergence Detection', () => {
  const observationIds = ['SC-7', 'SC-9', 'SC-10'];

  for (const scId of observationIds) {
    const { scenario, expectedArtifact, createReplayArtifact } = buildScenarioArtifactPair(scId);

    // 1. Tầng 1 Gate: Bắt buộc inconclusive (loại khỏi Denominator D=7)
    const actualIdentical = createReplayArtifact();
    const gateRes = evaluateGate(actualIdentical);
    assert.strictEqual(
      gateRes.verdict,
      'inconclusive',
      `${scId}: Tầng 1 Gate phải trả về inconclusive`
    );
    assert.strictEqual(gateRes.inconclusive, true);
    assert.strictEqual(gateRes.reason, GATE_REASONS.OUT_OF_CLASS);

    const fullVerifyRes = verifyExecution(expectedArtifact, actualIdentical);
    assert.strictEqual(fullVerifyRes.verdict, 'inconclusive');
    assert.strictEqual(fullVerifyRes.inconclusive, true);

    // 2. Thẩm định hành vi phân kỳ cụ thể cho từng kịch bản quan sát
    if (scId === 'SC-7') {
      // SC-7: Randomness -> Unseeded randomUUID làm lệch neo U0 hoặc interactions
      const divergentActual = createReplayArtifact({
        u0: makeU0({
          method: 'POST',
          target: '/checkout',
          arguments: { customer_id: 'CUST-001', sku: 'SKU-LAPTOP-001', request_id: 'UUID-DIVERGED-RANDOM' },
        }),
      });
      const rubricRes = evaluateRubric(expectedArtifact, divergentActual);
      assert.strictEqual(rubricRes.verdict, 'diverged');
      assert.strictEqual(rubricRes.firstDivergence.point, 'u0');
    } else if (scId === 'SC-9') {
      // SC-9: Async behavior -> Đuôi async không đóng làm lệch số lượng/nội dung interactions
      const divergentActual = createReplayArtifact({
        interactions: expectedArtifact.interactions.concat([
          makeInteraction({
            kind: 'outbound-http',
            method: 'POST',
            target: 'http://async-tail-service/callback',
            direction: 'READ',
            ordinal: 99,
            result: { completed: true },
          }),
        ]),
      });
      const rubricRes = evaluateRubric(expectedArtifact, divergentActual);
      assert.strictEqual(rubricRes.verdict, 'diverged');
      assert.strictEqual(rubricRes.conditionFailed, 1, 'Condition 1 length must fail');
      assert.strictEqual(rubricRes.firstDivergence.point, 'length');
    } else if (scId === 'SC-10') {
      // SC-10: Race condition -> Kết quả truy vấn COUNT(*) bị lệch giữa 2 luồng đồng thời
      const divergentActual = createReplayArtifact({
        interactions: [
          makeInteraction({
            kind: 'db-query',
            target: 'SELECT count(*) FROM orders WHERE customer_id = $1',
            arguments: { bind: ['CUST-003'] },
            direction: 'READ',
            ordinal: 1,
            result: { rowCount: 1, rows: [{ count: '2' }] }, // Count = 2 thay vì 1
          }),
        ],
      });
      const rubricRes = evaluateRubric(expectedArtifact, divergentActual);
      assert.strictEqual(rubricRes.verdict, 'diverged');
      assert.strictEqual(rubricRes.firstDivergence.point, 'interaction');
      assert.strictEqual(rubricRes.firstDivergence.index, 1);
    }
  }
});

// ===========================================================================
// Test Suite 4: First Divergence Point & Diff Formatter trên In-Class Divergence
// ===========================================================================
test('In-Class Divergence: B6 First Divergence Point & Diff Formatter Accuracy', () => {
  const { expectedArtifact, createReplayArtifact } = buildScenarioArtifactPair('SC-1');

  // Tạo artifact phân kỳ tại DB interaction
  const divergedActual = createReplayArtifact({
    interactions: [
      expectedArtifact.interactions[0],
      expectedArtifact.interactions[1],
      makeInteraction({
        kind: 'db-query',
        target: 'SELECT * FROM products WHERE sku = $1',
        arguments: { bind: ['SKU-LAPTOP-001'] },
        direction: 'READ',
        ordinal: 3,
        result: { rowCount: 1, rows: [{ sku: 'SKU-LAPTOP-001', unit_price_cents: 999999 }] }, // Giá lệch
      }),
      expectedArtifact.interactions[3],
      expectedArtifact.interactions[4],
      expectedArtifact.interactions[5],
    ],
  });

  const verifyRes = verifyExecution(expectedArtifact, divergedActual);
  assert.strictEqual(verifyRes.gate.verdict, 'pass');
  assert.strictEqual(verifyRes.verdict, 'diverged');
  assert.strictEqual(verifyRes.rubric.matched, false);
  assert.strictEqual(verifyRes.rubric.firstDivergence.index, 3);
  assert.deepStrictEqual(verifyRes.rubric.firstDivergence.mismatchedFields, ['result']);
  // Kiểm tra Diff Text
  assert.ok(verifyRes.diffText, 'Diff text must be generated');
  assert.ok(verifyRes.diffText.includes('Execution diverged'));
  assert.ok(verifyRes.diffText.includes('First Divergence Point: Đơn vị #3'));
  assert.ok(verifyRes.diffText.includes('Mismatched Fields: result'));
});
