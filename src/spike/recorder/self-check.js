'use strict';

const assert = require('node:assert');
const { SpikeRecorder } = require('./index');
const { validateArtifact, serializeArtifact, parseArtifact } = require('../contract');

console.log('\n=== B3 Recorder Self-Check ===');

const recorder = new SpikeRecorder({
  runId: 'test-run-1',
  scenarioId: 'SC-1',
  manifestCommitHash: '15c462e0867c6e15c462e9b99589232a684977ae',
});

recorder.startSession();

// 1. Inbound HTTP (U0)
recorder.recordU0({
  method: 'POST',
  target: '/checkout',
  arguments: { body: { customer_id: 'CUST-001', sku: 'SKU-001', quantity: 2 } },
});

// 2. Clock
recorder.recordInteraction({
  kind: 'clock',
  target: 'checkout.pricing-window',
  result: '2026-08-16T12:00:00.000Z',
});

// 3. Feature flag
recorder.recordInteraction({
  kind: 'feature-flag',
  target: 'checkout_discount_v2',
  result: true,
});

// 4. DB Query (with row_count, byte_size, consumed_by_replay)
recorder.recordInteraction({
  kind: 'db-query',
  target: 'SELECT * FROM products WHERE sku = $1',
  arguments: { bind: ['SKU-001'] },
  result: {
    rowCount: 1,
    rows: [{ id: 1, sku: 'SKU-001', price_cents: 100000 }],
  },
});

// 5. Outbound HTTP
recorder.recordInteraction({
  kind: 'outbound-http',
  method: 'POST',
  target: 'http://spike-httpstub:8081/payments/authorize',
  arguments: { body: { amount_cents: 100000 } },
  result: { decision: 'approved', authorization_code: 'AUTH-123' },
});

// 6. Stack trace (exception / error tracing)
recorder.recordInteraction({
  kind: 'stack-trace',
  target: 'None',
  result: null,
});

// Outcome (U∞)
recorder.recordUInfinity({
  class: 'http-response',
  type: 'status:201',
});

const artifact = recorder.exportArtifact();
const validation = validateArtifact(artifact);

assert.strictEqual(validation.ok, true, 'Artifact must be valid according to schema: ' + JSON.stringify(validation.errors));
assert.strictEqual(artifact.scenarioId, 'SC-1');
assert.strictEqual(artifact.manifestCommitHash, '15c462e0867c6e15c462e9b99589232a684977ae');

// D-9 assertion
assert.strictEqual(artifact.classAssessment.inClass, true, 'D-9: inClass is true for S1-S6');
assert.strictEqual(artifact.classAssessment.mechanism, 'M-cap', 'D-9: mechanism is M-cap');

// DB metrics assertion
const dbUnit = artifact.interactions.find((u) => u.kind === 'db-query');
assert.ok(dbUnit, 'DB interaction must be captured');
assert.strictEqual(dbUnit.result.consumed_by_replay, true);
assert.strictEqual(dbUnit.result.row_count, 1);
assert.ok(typeof dbUnit.result.byte_size === 'number' && dbUnit.result.byte_size > 0);

// Round-trip serialization assertion
const serialized = serializeArtifact(artifact);
const parsed = parseArtifact(serialized);
assert.strictEqual(validateArtifact(parsed).ok, true);

console.log('✅ B3 Recorder self-check passed (all assertions green)');
