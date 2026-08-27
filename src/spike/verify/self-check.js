'use strict';

/**
 * ============================================================================
 *  B6 · src/spike/verify/self-check.js
 *  BỘ TEST TỰ ĐỘNG XÁC MINH CƠ CHẾ VERIFICATION & DIFF ENGINE (B6)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec §0.3).
 *
 *  KIỂM THỬ:
 *    1. Cổng inconclusive Tầng 1 (Spec §3.5)
 *    2. Rubric So Sánh Nhị Phân Tầng 2 — 3 điều kiện (Spec §3.4)
 *    3. Thủ tục quy trách nhiệm 6 bước (Spec §3.6)
 *    4. Execution Diff Formatter (ADR-011)
 *    5. API tích hợp verifyExecution & ExecutionVerifier
 */

const {
  makeArtifact,
  makeClassAssessment,
  makeDriftFlags,
  makeInteraction,
  makeU0,
  makeUInfinity,
  REDACTION_MARKER,
} = require('../contract');

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
} = require('./index');

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log('  ✓ ' + name);
    pass++;
  } else {
    console.error('  ✗ ' + name);
    console.error('    got:      ' + a);
    console.error('    expected: ' + e);
    fail++;
  }
}

function checkTrue(name, cond, detail) {
  check(name + (detail ? ' — ' + detail : ''), cond === true, true);
}

console.log('\n=== B6 self-check · src/spike/verify ===');

// Helper dựng artifact mẫu
function createMockArtifact(overrides = {}) {
  const base = {
    capsuleId: 'capsule-test-1001',
    scenarioId: 'SC-1',
    classAssessment: makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
    drift: makeDriftFlags({}),
    u0: makeU0({
      target: '/checkout',
      arguments: { userId: 7731 },
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
    ],
    uInfinity: makeUInfinity({
      class: 'http-response',
      type: '200',
    }),
  };

  return makeArtifact(Object.assign({}, base, overrides));
}

// ---------------------------------------------------------------------------
console.log('\n[1] Cổng inconclusive Tầng 1 (Spec §3.5 · §2.6)');
// ---------------------------------------------------------------------------
const outOfClassArtifact = createMockArtifact({
  classAssessment: makeClassAssessment({
    inClass: false,
    mechanism: 'M-cap',
    exclusionAxis: { axis: 2, dependency: 'Redis' },
    failedConditions: [],
  }),
});
const gOutOfClass = evaluateGate(outOfClassArtifact);
check('inClass=false (Redis Trục 2) -> verdict inconclusive', gOutOfClass.verdict, 'inconclusive');
checkTrue('inconclusive flag is true', gOutOfClass.inconclusive);
check('reason là OUT_OF_CLASS', gOutOfClass.reason, GATE_REASONS.OUT_OF_CLASS);
check('exclusionAxis trục 2 được giữ', gOutOfClass.exclusionAxis.dependency, 'Redis');

const unassessableArtifact = createMockArtifact({
  classAssessment: makeClassAssessment({
    inClass: null,
    mechanism: 'none-declaration',
    failedConditions: [],
  }),
});
const gUnassessable = evaluateGate(unassessableArtifact);
check('inClass=null (Không kiểm được) -> verdict inconclusive', gUnassessable.verdict, 'inconclusive');
check('reason là UNASSESSABLE_CLASS', gUnassessable.reason, GATE_REASONS.UNASSESSABLE_CLASS);

const missingAssessmentArtifact = createMockArtifact({ classAssessment: null });
const gMissing = evaluateGate(missingAssessmentArtifact);
check('thiếu class_assessment -> verdict inconclusive', gMissing.verdict, 'inconclusive');
check('reason là MISSING_CLASS_ASSESSMENT', gMissing.reason, GATE_REASONS.MISSING_CLASS_ASSESSMENT);

const validInClassArtifact = createMockArtifact();
const gPass = evaluateGate(validInClassArtifact);
check('inClass=true -> verdict pass ở Cổng Tầng 1', gPass.verdict, 'pass');
checkTrue('inconclusive flag is false', !gPass.inconclusive);

// ---------------------------------------------------------------------------
console.log('\n[2] Rubric So Sánh Nhị Phân Tầng 2 — 3 Điều Kiện (Spec §3.4)');
// ---------------------------------------------------------------------------

// Ca A: Khớp 100% -> verdict matched
const expectedA = createMockArtifact();
const actualA = createMockArtifact();
const rMatch = evaluateRubric(expectedA, actualA);
check('2 execution giống nhau -> verdict matched', rMatch.verdict, 'matched');
checkTrue('matched is true', rMatch.matched);
check('totalUnits tính đúng', rMatch.totalUnits, 3);

// Ca B: Điều kiện 1 — Mismatch độ dài
const actualShort = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'clock',
      direction: 'READ',
      result: '2026-08-14T09:12:03.114Z',
      ordinal: 1,
    }),
  ],
});
const rLenMismatch = evaluateRubric(expectedA, actualShort);
check('thiếu interaction -> verdict diverged', rLenMismatch.verdict, 'diverged');
check('conditionFailed là 1 (LENGTH)', rLenMismatch.conditionFailed, RUBRIC_CONDITIONS.LENGTH);
check('firstDivergence point là length', rLenMismatch.firstDivergence.point, 'length');
check('chỉ số phân kỳ đầu tiên là 2', rLenMismatch.firstDivergence.index, 2);

// Ca C: Điều kiện 2 — Mismatch từng đơn vị (DB query result khác)
const actualDbMismatch = createMockArtifact({
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
      result: [{ id: 7731, name: 'Bob' }], // Khác Alice -> Bob
      ordinal: 3,
    }),
  ],
});
const rDbMismatch = evaluateRubric(expectedA, actualDbMismatch);
check('DB query result khác -> verdict diverged', rDbMismatch.verdict, 'diverged');
check('conditionFailed là 2 (UNITS)', rDbMismatch.conditionFailed, RUBRIC_CONDITIONS.UNITS);
check('firstDivergence index là 3', rDbMismatch.firstDivergence.index, 3);
checkTrue('mismatchedFields chứa result', rDbMismatch.firstDivergence.mismatchedFields.includes('result'));

// Ca D: Điều kiện 3 — Neo U0 mismatch
const actualU0Mismatch = createMockArtifact({
  u0: makeU0({
    target: '/checkout',
    arguments: { userId: 9999 }, // Khác 7731
  }),
});
const rU0Mismatch = evaluateRubric(expectedA, actualU0Mismatch);
check('U0 arguments khác -> diverged tại U0', rU0Mismatch.verdict, 'diverged');
check('firstDivergence point là u0', rU0Mismatch.firstDivergence.point, 'u0');

// Ca E: Điều kiện 3 — Neo U∞ outcomeIdentity
const actualUInfMismatch = createMockArtifact({
  uInfinity: makeUInfinity({
    class: 'http-response',
    type: '500', // Khác 200
  }),
});
const rUInfMismatch = evaluateRubric(expectedA, actualUInfMismatch);
check('U∞ outcome.type khác (200 vs 500) -> diverged tại uInfinity', rUInfMismatch.verdict, 'diverged');
check('firstDivergence point là uInfinity', rUInfMismatch.firstDivergence.point, 'uInfinity');

// Ca F: U∞ cùng outcomeIdentity nhưng khác stack trace -> MATCHED (Spec §3.4 đk 3 không so stack trace)
const expException = createMockArtifact({
  uInfinity: makeUInfinity({ class: 'exception', type: 'TypeError' }),
});
const actException = createMockArtifact({
  uInfinity: makeUInfinity({ class: 'exception', type: 'TypeError' }),
});
const rExceptionMatch = evaluateRubric(expException, actException);
check('cùng exception:TypeError -> matched (không so stack trace)', rExceptionMatch.verdict, 'matched');

// Ca G: Concurrency Group Set Equality (Spec §3.3)
const expConcurrent = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.a.com/v1',
      concurrencyGroup: 'G1',
      ordinal: 1,
    }),
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.b.com/v1',
      concurrencyGroup: 'G1',
      ordinal: 2,
    }),
  ],
});
// Đảo thứ tự phát ra trong nhóm đồng thời G1
const actConcurrentShuffled = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.b.com/v1',
      concurrencyGroup: 'G1',
      ordinal: 1,
    }),
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.a.com/v1',
      concurrencyGroup: 'G1',
      ordinal: 2,
    }),
  ],
});
const rConcurrentMatch = evaluateRubric(expConcurrent, actConcurrentShuffled);
check('nhóm đồng thời đảo thứ tự -> MATCHED (Set Equality, Spec §3.3)', rConcurrentMatch.verdict, 'matched');
check('nhóm đồng thời tính là 1 unit', rConcurrentMatch.totalUnits, 1);

// Ca H: Concurrency Group khác phần tử -> diverged
const actConcurrentMismatch = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.c.com/v1', // c thay vì a
      concurrencyGroup: 'G1',
      ordinal: 1,
    }),
    makeInteraction({
      kind: 'outbound-http',
      direction: 'READ',
      target: 'GET https://api.b.com/v1',
      concurrencyGroup: 'G1',
      ordinal: 2,
    }),
  ],
});
const rConcurrentDiff = evaluateRubric(expConcurrent, actConcurrentMismatch);
check('nhóm đồng thời khác phần tử -> diverged', rConcurrentDiff.verdict, 'diverged');

// Ca I: Canonical JSON và Redaction Marker matching (Spec §3.3)
const expRedacted = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'db-query',
      direction: 'READ',
      target: 'SELECT * FROM cards WHERE id = $1',
      result: { card: REDACTION_MARKER, userId: 7731 },
      redactedFields: ['card'],
    }),
  ],
});
const actRedacted = createMockArtifact({
  interactions: [
    makeInteraction({
      kind: 'db-query',
      direction: 'READ',
      target: 'SELECT * FROM cards WHERE id = $1',
      result: { card: REDACTION_MARKER, userId: 7731 },
      redactedFields: ['card'],
    }),
  ],
});
check('redaction marker matching -> matched', evaluateRubric(expRedacted, actRedacted).verdict, 'matched');

// ---------------------------------------------------------------------------
console.log('\n[3] Thủ tục quy trách nhiệm 6 bước (Spec §3.6)');
// ---------------------------------------------------------------------------

// Bước 1: redaction
const attr1 = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['card'],
    expectedUnit: { redactedFields: ['card'] },
  },
  { redactedFields: ['card'] }
);
check('Bước 1 khớp redaction', attr1.cause, ATTRIBUTION_CAUSES.REDACTION);
check('Bước 1 ghi step 1', attr1.step, '1');

// Bước 2: incomplete-capture (Known-Missing-Input Manifest)
const attr2 = attributeDivergence(
  {
    point: 'interaction',
    index: 2,
    expectedUnit: { kind: 'outbound-http', target: 'redis://cache:6379' },
    mismatchedFields: ['result'],
  },
  {
    knownMissingInputs: ['redis://cache:6379'],
    manifestCommitHash: 'abc1234',
  }
);
check('Bước 2 khớp incomplete-capture', attr2.cause, ATTRIBUTION_CAUSES.INCOMPLETE_CAPTURE);
check('Bước 2 ghi step 2', attr2.step, '2');

// Bước 2b: truncated (Capsule có cờ truncated: true)
const attr2b = attributeDivergence(
  {
    point: 'interaction',
    index: 3,
    expectedUnit: { truncated: true },
    mismatchedFields: ['result'],
  },
  { truncated: true }
);
check('Bước 2b khớp truncated', attr2b.cause, ATTRIBUTION_CAUSES.TRUNCATED);
check('Bước 2b ghi step 2b', attr2b.step, '2b');

// Bước 3: version-drift
const attr3 = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['result'],
  },
  {
    drift: makeDriftFlags({
      dependency: { capsule: 'pkg@1.0.0', local: 'pkg@2.0.0', drifted: true },
    }),
  }
);
check('Bước 3 khớp version-drift', attr3.cause, ATTRIBUTION_CAUSES.VERSION_DRIFT);
check('Bước 3 ghi step 3', attr3.step, '3');

// Bước 4: out-of-scope-determinism (K lần replay KHÁC verdict)
const attr4 = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['result'],
  },
  {
    replays: ['matched', 'diverged', 'matched'],
  }
);
check('Bước 4 khớp out-of-scope-determinism khi K replays khác verdict', attr4.cause, ATTRIBUTION_CAUSES.OUT_OF_SCOPE_DETERMINISM);
check('Bước 4 ghi step 4', attr4.step, '4');

// RÀNG BUỘC CỨNG BƯỚC 4: K lần replay CÙNG verdict -> CẤM chọn out-of-scope-determinism
const attr4Same = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['result'],
  },
  {
    replays: ['diverged', 'diverged', 'diverged'], // Cùng verdict!
    localCodeDiffers: true,
  }
);
check('K replays CÙNG verdict -> KHÔNG chọn step 4, rơi xuống step 5 (code)', attr4Same.cause, ATTRIBUTION_CAUSES.CODE);

// Bước 5: code
const attr5 = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['result'],
  },
  {
    localCodeDiffers: true,
  }
);
check('Bước 5 khớp code khi localCodeDiffers=true', attr5.cause, ATTRIBUTION_CAUSES.CODE);
check('Bước 5 ghi step 5', attr5.step, '5');

// Bước 6: unattributed (Không bước nào khớp, CẤM gộp vào code)
const attr6 = attributeDivergence(
  {
    point: 'interaction',
    index: 1,
    mismatchedFields: ['result'],
  },
  {}
);
check('Bước 6 khớp unattributed khi không có bằng chứng 1-5', attr6.cause, ATTRIBUTION_CAUSES.UNATTRIBUTED);
check('Bước 6 ghi step 6', attr6.step, '6');
checkTrue('unattributed KHÔNG bị gộp vào code', attr6.cause !== ATTRIBUTION_CAUSES.CODE);

// ---------------------------------------------------------------------------
console.log('\n[4] Execution Diff Formatter (ADR-011 · Spec §9)');
// ---------------------------------------------------------------------------
const vDiverged = verifyExecution(expectedA, actualDbMismatch, {
  context: { localCodeDiffers: true },
});
check('verifyExecution trả về diverged cho actualDbMismatch', vDiverged.verdict, 'diverged');
check('attribution gán đúng code', vDiverged.attribution.cause, ATTRIBUTION_CAUSES.CODE);
checkTrue('diffText chứa tiêu đề Execution diverged', vDiverged.diffText.includes('⚠️ Execution diverged'));
checkTrue('diffText chứa Production và Local', vDiverged.diffText.includes('Production →') && vDiverged.diffText.includes('Local      →'));
check('diffJson có schema chuẩn', vDiverged.diffJson.schema, 'repro.spike.execution-diff');
check('diffJson verdict là diverged', vDiverged.diffJson.verdict, 'diverged');

// ---------------------------------------------------------------------------
console.log('\n[5] Tích hợp verifyExecution & ExecutionVerifier');
// ---------------------------------------------------------------------------
const verifier = new ExecutionVerifier();
const vMatched = verifier.verify(expectedA, actualA);
check('ExecutionVerifier.verify trả về matched', vMatched.verdict, 'matched');
checkTrue('vMatched.diffText chứa Execution matched', vMatched.diffText.includes('✓ Execution matched'));

const vInconclusive = verifier.verify(outOfClassArtifact, actualA);
check('ExecutionVerifier.verify trả về inconclusive cho out-of-class', vInconclusive.verdict, 'inconclusive');
checkTrue('vInconclusive.diffText chứa Execution inconclusive', vInconclusive.diffText.includes('⏸️ Execution inconclusive'));

console.log('\n=== KẾT QUẢ SELF-CHECK: ' + pass + ' pass, ' + fail + ' fail ===\n');
process.exit(fail === 0 ? 0 : 1);
