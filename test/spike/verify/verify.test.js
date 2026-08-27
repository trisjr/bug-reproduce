'use strict';

/**
 * ============================================================================
 *  test/spike/verify/verify.test.js
 *  TEST SUITE CHO VERIFICATION & DIFF ENGINE (B6)
 * ============================================================================
 *
 *  Bao phủ:
 *    - Cổng inconclusive Tầng 1 (Spec §3.5)
 *    - Rubric So Sánh Nhị Phân Tầng 2 (Spec §3.4)
 *    - Thủ tục quy trách nhiệm 6 bước (Spec §3.6)
 *    - Execution Diff Formatter (ADR-011)
 *    - API verifyExecution & ExecutionVerifier
 */

const assert = require('node:assert');
const test = require('node:test');

const {
  makeArtifact,
  makeClassAssessment,
  makeDriftFlags,
  makeInteraction,
  makeU0,
  makeUInfinity,
  serializeArtifact,
  REDACTION_MARKER,
} = require('../../../src/spike/contract');

const {
  verifyExecution,
  ExecutionVerifier,
  evaluateGate,
  GATE_REASONS,
  evaluateRubric,
  groupInteractions,
  compareUnits,
  RUBRIC_CONDITIONS,
  attributeDivergence,
  ATTRIBUTION_CAUSES,
  formatDiffText,
  formatDiffJson,
} = require('../../../src/spike/verify');

function createSampleArtifact(overrides = {}) {
  const base = {
    capsuleId: 'capsule-test-suite',
    scenarioId: 'SC-1',
    classAssessment: makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
    drift: makeDriftFlags({}),
    u0: makeU0({
      target: '/checkout',
      arguments: { userId: 7731, items: [1, 2] },
    }),
    interactions: [
      makeInteraction({
        kind: 'clock',
        direction: 'READ',
        result: '2026-08-14T09:12:03.114Z',
        ordinal: 1,
      }),
      makeInteraction({
        kind: 'feature-flag',
        direction: 'READ',
        target: 'new_checkout',
        result: true,
        ordinal: 2,
      }),
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM users WHERE id = $1',
        arguments: { sqlLiterals: [7731] },
        result: [{ id: 7731, name: 'Alice' }],
        ordinal: 3,
      }),
      makeInteraction({
        kind: 'outbound-http',
        direction: 'READ',
        target: 'GET https://tax.example.com/v1/calc?rate=0.1',
        arguments: { query: { rate: '0.1' } },
        result: { tax: 12.5 },
        ordinal: 4,
      }),
    ],
    uInfinity: makeUInfinity({
      class: 'http-response',
      type: '200',
    }),
  };

  return makeArtifact(Object.assign({}, base, overrides));
}

// ===========================================================================
test('Tầng 1: Cổng inconclusive loại bỏ execution ngoài class hoặc không kiểm được', () => {
  // 1. inClass === false (Trục 2 Redis)
  const redisArtifact = createSampleArtifact({
    classAssessment: makeClassAssessment({
      inClass: false,
      mechanism: 'M-cap',
      exclusionAxis: { axis: 2, dependency: 'Redis' },
      failedConditions: [],
    }),
  });
  const gateRedis = evaluateGate(redisArtifact);
  assert.strictEqual(gateRedis.verdict, 'inconclusive');
  assert.strictEqual(gateRedis.inconclusive, true);
  assert.strictEqual(gateRedis.reason, GATE_REASONS.OUT_OF_CLASS);
  assert.strictEqual(gateRedis.exclusionAxis.dependency, 'Redis');

  // 2. inClass === false (Trục 1 S1-S7 failed)
  const nonDetArtifact = createSampleArtifact({
    classAssessment: makeClassAssessment({
      inClass: false,
      mechanism: 'M-scope',
      exclusionAxis: { axis: 1, group: 'Randomness' },
      failedConditions: ['S1'],
    }),
  });
  const gateNonDet = evaluateGate(nonDetArtifact);
  assert.strictEqual(gateNonDet.verdict, 'inconclusive');
  assert.strictEqual(gateNonDet.failedConditions[0], 'S1');

  // 3. inClass === null (Không kiểm được)
  const unassessableArtifact = createSampleArtifact({
    classAssessment: makeClassAssessment({
      inClass: null,
      mechanism: 'none-declaration',
    }),
  });
  const gateUnassessable = evaluateGate(unassessableArtifact);
  assert.strictEqual(gateUnassessable.verdict, 'inconclusive');
  assert.strictEqual(gateUnassessable.reason, GATE_REASONS.UNASSESSABLE_CLASS);

  // 4. Thiếu class_assessment (Silent capture error)
  const silentArtifact = createSampleArtifact({ classAssessment: null });
  const gateSilent = evaluateGate(silentArtifact);
  assert.strictEqual(gateSilent.verdict, 'inconclusive');
  assert.strictEqual(gateSilent.reason, GATE_REASONS.MISSING_CLASS_ASSESSMENT);

  // 5. inClass === true (Passes gate)
  const validArtifact = createSampleArtifact();
  const gateValid = evaluateGate(validArtifact);
  assert.strictEqual(gateValid.verdict, 'pass');
  assert.strictEqual(gateValid.inconclusive, false);
});

// ===========================================================================
test('Tầng 2: Rubric So Sánh Nhị Phân (Spec §3.4)', () => {
  const exp = createSampleArtifact();
  const act = createSampleArtifact();

  // 1. Khớp 100%
  const resMatch = evaluateRubric(exp, act);
  assert.strictEqual(resMatch.verdict, 'matched');
  assert.strictEqual(resMatch.matched, true);
  assert.strictEqual(resMatch.totalUnits, 4);

  // 2. Điều kiện 1: Độ dài lệch (length mismatch)
  const actShort = createSampleArtifact({
    interactions: exp.interactions.slice(0, 2),
  });
  const resLen = evaluateRubric(exp, actShort);
  assert.strictEqual(resLen.verdict, 'diverged');
  assert.strictEqual(resLen.conditionFailed, RUBRIC_CONDITIONS.LENGTH);
  assert.strictEqual(resLen.firstDivergence.point, 'length');
  assert.strictEqual(resLen.firstDivergence.index, 3);

  // 3. Điều kiện 2: DB Query mismatch
  const actDbDiff = createSampleArtifact({
    interactions: [
      exp.interactions[0],
      exp.interactions[1],
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM users WHERE id = $1',
        arguments: { sqlLiterals: [7731] },
        result: [{ id: 7731, name: 'Different' }],
        ordinal: 3,
      }),
      exp.interactions[3],
    ],
  });
  const resDb = evaluateRubric(exp, actDbDiff);
  assert.strictEqual(resDb.verdict, 'diverged');
  assert.strictEqual(resDb.conditionFailed, RUBRIC_CONDITIONS.UNITS);
  assert.strictEqual(resDb.firstDivergence.index, 3);
  assert.ok(resDb.firstDivergence.mismatchedFields.includes('result'));

  // 4. Điều kiện 2: Outbound HTTP mismatch
  const actHttpDiff = createSampleArtifact({
    interactions: [
      exp.interactions[0],
      exp.interactions[1],
      exp.interactions[2],
      makeInteraction({
        kind: 'outbound-http',
        direction: 'READ',
        target: 'GET https://tax.example.com/v1/calc?rate=0.2', // rate 0.2 != 0.1
        arguments: { query: { rate: '0.2' } },
        result: { tax: 25.0 },
        ordinal: 4,
      }),
    ],
  });
  const resHttp = evaluateRubric(exp, actHttpDiff);
  assert.strictEqual(resHttp.verdict, 'diverged');
  assert.strictEqual(resHttp.firstDivergence.index, 4);

  // 5. Điều kiện 3: Neo U0 mismatch
  const actU0Diff = createSampleArtifact({
    u0: makeU0({ target: '/different-path' }),
  });
  const resU0 = evaluateRubric(exp, actU0Diff);
  assert.strictEqual(resU0.verdict, 'diverged');
  assert.strictEqual(resU0.conditionFailed, RUBRIC_CONDITIONS.ANCHORS);
  assert.strictEqual(resU0.firstDivergence.point, 'u0');

  // 6. Điều kiện 3: Neo U∞ outcomeIdentity mismatch
  const actUInfDiff = createSampleArtifact({
    uInfinity: makeUInfinity({ class: 'http-response', type: '404' }),
  });
  const resUInf = evaluateRubric(exp, actUInfDiff);
  assert.strictEqual(resUInf.verdict, 'diverged');
  assert.strictEqual(resUInf.firstDivergence.point, 'uInfinity');

  // 7. Neo U∞ outcomeIdentity matching (không so stack trace)
  const expErr = createSampleArtifact({
    uInfinity: makeUInfinity({ class: 'exception', type: 'RangeError' }),
  });
  const actErr = createSampleArtifact({
    uInfinity: makeUInfinity({ class: 'exception', type: 'RangeError' }),
  });
  const resErr = evaluateRubric(expErr, actErr);
  assert.strictEqual(resErr.verdict, 'matched');
});

// ===========================================================================
test('Tầng 2: Concurrency Groups & Equivalence Relations (Spec §3.3)', () => {
  // Concurrency group set equality
  const expCG = createSampleArtifact({
    interactions: [
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM inventory WHERE item_id = 1',
        concurrencyGroup: 'INV_GROUP',
        ordinal: 1,
      }),
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM inventory WHERE item_id = 2',
        concurrencyGroup: 'INV_GROUP',
        ordinal: 2,
      }),
    ],
  });

  const actCGShuffled = createSampleArtifact({
    interactions: [
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM inventory WHERE item_id = 2',
        concurrencyGroup: 'INV_GROUP',
        ordinal: 1,
      }),
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM inventory WHERE item_id = 1',
        concurrencyGroup: 'INV_GROUP',
        ordinal: 2,
      }),
    ],
  });

  const resCG = evaluateRubric(expCG, actCGShuffled);
  assert.strictEqual(resCG.verdict, 'matched');
  assert.strictEqual(resCG.totalUnits, 1);

  // Redaction marker matching
  const expRed = createSampleArtifact({
    interactions: [
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM secrets',
        result: { token: REDACTION_MARKER },
        redactedFields: ['token'],
      }),
    ],
  });
  const actRed = createSampleArtifact({
    interactions: [
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM secrets',
        result: { token: REDACTION_MARKER },
        redactedFields: ['token'],
      }),
    ],
  });
  const resRed = evaluateRubric(expRed, actRed);
  assert.strictEqual(resRed.verdict, 'matched');
});

// ===========================================================================
test('Thủ tục quy trách nhiệm 6 bước (Spec §3.6 · ADR-011 D3)', () => {
  // Bước 1: redaction
  const a1 = attributeDivergence(
    {
      point: 'interaction',
      index: 1,
      mismatchedFields: ['password'],
      expectedUnit: { redactedFields: ['password'] },
    },
    { redactedFields: ['password'] }
  );
  assert.strictEqual(a1.step, '1');
  assert.strictEqual(a1.cause, ATTRIBUTION_CAUSES.REDACTION);

  // Bước 2: incomplete-capture
  const a2 = attributeDivergence(
    {
      point: 'interaction',
      index: 1,
      expectedUnit: { kind: 'outbound-http', target: 'redis://cache' },
      mismatchedFields: ['result'],
    },
    {
      knownMissingInputs: ['redis://cache'],
      manifestCommitHash: 'hash-1234',
    }
  );
  assert.strictEqual(a2.step, '2');
  assert.strictEqual(a2.cause, ATTRIBUTION_CAUSES.INCOMPLETE_CAPTURE);

  // Bước 2b: truncated
  const a2b = attributeDivergence(
    {
      point: 'interaction',
      index: 1,
      expectedUnit: { truncated: true },
      mismatchedFields: ['result'],
    },
    { truncated: true }
  );
  assert.strictEqual(a2b.step, '2b');
  assert.strictEqual(a2b.cause, ATTRIBUTION_CAUSES.TRUNCATED);

  // Bước 3: version-drift
  const a3 = attributeDivergence(
    { point: 'interaction', index: 1, mismatchedFields: ['result'] },
    {
      drift: makeDriftFlags({
        gitCommit: { capsule: 'aaa', local: 'bbb', drifted: true },
      }),
    }
  );
  assert.strictEqual(a3.step, '3');
  assert.strictEqual(a3.cause, ATTRIBUTION_CAUSES.VERSION_DRIFT);

  // Bước 4: out-of-scope-determinism (K replays khác verdict)
  const a4 = attributeDivergence(
    { point: 'interaction', index: 1, mismatchedFields: ['result'] },
    { replays: ['matched', 'diverged', 'matched'] }
  );
  assert.strictEqual(a4.step, '4');
  assert.strictEqual(a4.cause, ATTRIBUTION_CAUSES.OUT_OF_SCOPE_DETERMINISM);

  // Ràng buộc Bước 4: K replays cùng verdict -> không được chọn step 4
  const a4Same = attributeDivergence(
    { point: 'interaction', index: 1, mismatchedFields: ['result'] },
    {
      replays: ['diverged', 'diverged', 'diverged'],
      localCodeDiffers: true,
    }
  );
  assert.strictEqual(a4Same.step, '5');
  assert.strictEqual(a4Same.cause, ATTRIBUTION_CAUSES.CODE);

  // Bước 5: code
  const a5 = attributeDivergence(
    { point: 'interaction', index: 1, mismatchedFields: ['result'] },
    { localCodeDiffers: true }
  );
  assert.strictEqual(a5.step, '5');
  assert.strictEqual(a5.cause, ATTRIBUTION_CAUSES.CODE);

  // Bước 6: unattributed (Không bao giờ gộp thầm vào code)
  const a6 = attributeDivergence(
    { point: 'interaction', index: 1, mismatchedFields: ['result'] },
    {}
  );
  assert.strictEqual(a6.step, '6');
  assert.strictEqual(a6.cause, ATTRIBUTION_CAUSES.UNATTRIBUTED);
  assert.notStrictEqual(a6.cause, ATTRIBUTION_CAUSES.CODE);
});

// ===========================================================================
test('Diff Formatter & Integration ExecutionVerifier', () => {
  const exp = createSampleArtifact();
  const act = createSampleArtifact({
    interactions: [
      exp.interactions[0],
      exp.interactions[1],
      makeInteraction({
        kind: 'db-query',
        direction: 'READ',
        target: 'SELECT * FROM users WHERE id = $1',
        arguments: { sqlLiterals: [7731] },
        result: [{ id: 7731, name: 'Charlie' }],
        ordinal: 3,
      }),
      exp.interactions[3],
    ],
  });

  const verifier = new ExecutionVerifier();
  const result = verifier.verify(exp, act, {
    context: { localCodeDiffers: true },
  });

  assert.strictEqual(result.verdict, 'diverged');
  assert.strictEqual(result.matched, false);
  assert.strictEqual(result.inconclusive, false);
  assert.strictEqual(result.attribution.cause, 'code');

  const text = formatDiffText(result);
  assert.ok(text.includes('⚠️ Execution diverged'));
  assert.ok(text.includes('First Divergence Point: Đơn vị #3'));
  assert.ok(text.includes('Production →'));
  assert.ok(text.includes('Local      →'));

  const json = formatDiffJson(result);
  assert.strictEqual(json.schema, 'repro.spike.execution-diff');
  assert.strictEqual(json.verdict, 'diverged');
  assert.strictEqual(json.attribution.cause, 'code');
  assert.strictEqual(json.firstDivergence.index, 3);
});

// ===========================================================================
test('Tích hợp serialize/parse JSON string trong verifyExecution', () => {
  const exp = createSampleArtifact();
  const act = createSampleArtifact();

  const expJson = serializeArtifact(exp);
  const actJson = serializeArtifact(act);

  const res = verifyExecution(expJson, actJson);
  assert.strictEqual(res.verdict, 'matched');
  assert.strictEqual(res.matched, true);
  assert.ok(res.diffText.includes('✓ Execution matched'));
});
