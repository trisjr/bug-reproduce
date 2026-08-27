'use strict';

const assert = require('node:assert');
const { SCENARIOS, signatures, getScenario } = require('./scenarios');

console.log('\n=== B8 Scenario Fixtures & M-5 Signatures Self-Check ===');

assert.strictEqual(signatures.scenarios.length, 10, 'Must have exactly 10 M-5 scenario signatures');
assert.strictEqual(SCENARIOS.length, 10, 'Must have exactly 10 fixture definitions');

signatures.scenarios.forEach((sig) => {
  assert.ok(sig.id.startsWith('SC-'), `ID must start with SC-: ${sig.id}`);
  assert.ok(sig.name, `Scenario ${sig.id} must have a name`);
  assert.ok(sig.failure_signature, `Scenario ${sig.id} must have failure_signature`);
  assert.ok(sig.failure_signature.type, `Scenario ${sig.id} must have failure_signature.type`);
  assert.ok(sig.failure_signature.trigger, `Scenario ${sig.id} must have failure_signature.trigger`);
  assert.ok(
    sig.expected_verdict === 'matched' || sig.expected_verdict === 'diverged',
    `Scenario ${sig.id} expected_verdict must be matched or diverged: ${sig.expected_verdict}`
  );

  const fixture = getScenario(sig.id);
  assert.strictEqual(fixture.id, sig.id);
  assert.strictEqual(fixture.inClass, sig.inClass);
});

// Verify denominator count (D=7 in-class scenarios: SC-1, SC-2, SC-3, SC-4, SC-5, SC-6, SC-8)
const inClassScenarios = signatures.scenarios.filter((s) => s.inClass === true);
assert.strictEqual(inClassScenarios.length, 7, 'D must be exactly 7 for in-class scenarios (L1)');
assert.deepStrictEqual(
  inClassScenarios.map((s) => s.id),
  ['SC-1', 'SC-2', 'SC-3', 'SC-4', 'SC-5', 'SC-6', 'SC-8'],
  'In-class scenarios must be exactly {1,2,3,4,5,6,8}'
);

// Verify observation set (SC-7, SC-9, SC-10)
const outOfClassScenarios = signatures.scenarios.filter((s) => s.inClass === false);
assert.strictEqual(outOfClassScenarios.length, 3, 'Observation set must have 3 scenarios');
assert.deepStrictEqual(
  outOfClassScenarios.map((s) => s.id),
  ['SC-7', 'SC-9', 'SC-10'],
  'Observation set must be exactly {7,9,10}'
);

console.log('✅ B8 Scenario Fixtures & M-5 Signatures self-check passed (10/10 verified, D=7 preserved)');
