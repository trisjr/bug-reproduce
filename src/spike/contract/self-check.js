'use strict';

/*
 * ============================================================================
 *  B0 · src/spike/contract/self-check.js
 *  Chạy: `node src/spike/contract/self-check.js` (từ repo root, hoặc bất kỳ đâu)
 * ============================================================================
 *
 *  ⚠️  ĐÂY KHÔNG PHẢI TEST SUITE của dự án (`test/` thuộc worker khác).
 *      Đây là self-check tự chứa của `B0`, chứng minh BỐN PHÉP normalization của
 *      Spec §3.2 chạy đúng trên ví dụ, và schema từ chối artifact im lặng.
 *  ⛔  Self-check PASS KHÔNG có nghĩa `U-01`/`U-02` đã đóng. Nó chỉ chứng minh
 *      hiện thực KHỚP với bốn phép đã đóng băng tại `Gate A` — đúng phạm vi của `B0`.
 */

const C = require('./index');

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const a = typeof actual === 'string' ? actual : JSON.stringify(actual);
  const e = typeof expected === 'string' ? expected : JSON.stringify(expected);
  if (a === e) {
    pass += 1;
    console.log('  PASS  ' + name);
  } else {
    fail += 1;
    console.log('  FAIL  ' + name + '\n        expected: ' + e + '\n        actual:   ' + a);
  }
}

function checkTrue(name, cond, detail) {
  check(name + (detail ? ' — ' + detail : ''), cond === true, true);
}

console.log('\n=== B0 self-check · src/spike/contract ===');
console.log('node ' + process.version + ' · schema ' + C.SCHEMA_ID + '@' + C.SCHEMA_VERSION);

// ---------------------------------------------------------------------------
console.log('\n[Phép 1] SQL -> fingerprint (Spec §3.2.1)');
// ---------------------------------------------------------------------------
const q1 = C.sqlFingerprint("select * from Users where id = 7731 and name = 'bob'");
const q2 = C.sqlFingerprint("SELECT   *\n  FROM users\n WHERE id = 42 AND name = 'alice'");
check('literal khác nhau -> CÙNG fingerprint', q1.target, q2.target);
check('fingerprint không còn literal', q1.target, "SELECT * FROM USERS WHERE ID = ? AND NAME = ?");
check('literal đi vào arguments (không vào target)', q1.literals, [7731, 'bob']);
check('literal của câu thứ hai', q2.literals, [42, 'alice']);
const q3 = C.sqlFingerprint('SELECT * FROM users WHERE id = $1');
check('bind param $1 được GIỮ NGUYÊN', q3.target, 'SELECT * FROM USERS WHERE ID = $1');
check('bind param không bị coi là literal', q3.literals, []);
// Hồi quy: bóc string và number bằng hai lượt riêng làm mất thứ tự nguồn ⇒ hai câu
// lệnh KHÁC NHAU cho cùng (fingerprint, literals). Self-check này đã bắt được bug đó.
const cA = C.sqlFingerprint("SELECT * FROM t WHERE a = 1 AND b = 'x'");
const cB = C.sqlFingerprint("SELECT * FROM t WHERE a = 'x' AND b = 1");
check('literals giữ THỨ TỰ NGUỒN (câu A)', cA.literals, [1, 'x']);
check('literals giữ THỨ TỰ NGUỒN (câu B)', cB.literals, ['x', 1]);
checkTrue(
  'hai câu khác nhau KHÔNG va chạm định danh',
  C.canonicalJson([cA.target, cA.literals]) !== C.canonicalJson([cB.target, cB.literals])
);

// ---------------------------------------------------------------------------
console.log('\n[Phép 2] URL -> path template + canonical query (Spec §3.2.2)');
// ---------------------------------------------------------------------------
check('/users/7731 -> /users/:id', C.urlTemplate('/users/7731').target, '/users/:id');
check(
  'UUID segment -> :id',
  C.urlTemplate('/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301/items').target,
  '/orders/:id/items'
);
const uA = C.urlTemplate('https://tax.example/v1/calc?b=2&a=1');
const uB = C.urlTemplate('https://tax.example/v1/calc?a=1&b=2');
check('query đảo thứ tự -> cùng canonical query', C.canonicalJson(uA.query), C.canonicalJson(uB.query));
check('canonical query đã sắp key', C.canonicalJson(uA.query), '{"a":"1","b":"2"}');
check('URL tuyệt đối giữ origin', uA.target, 'https://tax.example/v1/calc');

// ---------------------------------------------------------------------------
console.log('\n[Phép 3] JSON -> canonical form (Spec §3.2.3)');
// ---------------------------------------------------------------------------
check(
  'key đảo thứ tự + khoảng trắng -> cùng canonical',
  C.canonicalJson({ b: 1, a: { d: 4, c: 3 } }),
  C.canonicalJson({ a: { c: 3, d: 4 }, b: 1 })
);
check('không khoảng trắng, key đã sắp', C.canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
check('mảng GIỮ thứ tự', C.canonicalJson([2, 1]), '[2,1]');

// ---------------------------------------------------------------------------
console.log('\n[Phép 4] Field đã redact -> marker (Spec §3.2.4 · §3.3)');
// ---------------------------------------------------------------------------
const rA = C.applyRedactionMarkers({ userId: 7731, card: '4111-1111' }, ['card']);
const rB = C.applyRedactionMarkers({ userId: 7731, card: '5500-0000' }, ['card']);
check('hai giá trị thật khác nhau -> marker == marker', C.canonicalJson(rA), C.canonicalJson(rB));
check('marker ổn định', rA.card, C.REDACTION_MARKER);
check('field không redact GIỮ giá trị', rA.userId, 7731);
checkTrue('isRedactionMarker nhận diện marker', C.isRedactionMarker(rA.card));

// ---------------------------------------------------------------------------
console.log('\n[identity()] định danh dùng chung B3 · B5 · B6 (R3, MTP T6)');
// ---------------------------------------------------------------------------
const rawRead = C.makeInteraction({
  kind: 'db-query',
  target: "SELECT * FROM users WHERE id = 7731",
  direction: 'READ',
  result: { rows: 1 },
  ordinal: 4,
});
const rawSameCallLater = C.makeInteraction({
  kind: 'db-query',
  target: "select  *  from USERS where id = 9999",
  direction: 'READ',
  result: { rows: 0 },
  ordinal: 11,
});
check(
  'ordinal + result KHÁC nhau -> KHÁC identity? (literal khác -> phải KHÁC)',
  C.identityOf(rawRead) === C.identityOf(rawSameCallLater),
  false
);
const rawSameLiteral = C.makeInteraction({
  kind: 'db-query',
  target: "SELECT   *   FROM Users   WHERE id = 7731",
  direction: 'READ',
  result: { rows: 999 },
  ordinal: 99,
});
check(
  'cùng call, khác ordinal/result -> CÙNG identity',
  C.identityOf(rawRead),
  C.identityOf(rawSameLiteral)
);
const rawWrite = C.makeInteraction({
  kind: 'db-query',
  target: "SELECT * FROM users WHERE id = 7731",
  direction: 'WRITE',
  result: null,
  ordinal: 4,
});
check(
  'direction NẰM NGOÀI identity (B5 phân biệt "không có entry" vs "entry là WRITE")',
  C.identityOf(rawRead),
  C.identityOf(rawWrite)
);

// R3: chứng minh READ = khớp một entry READ đã ghi, KHÔNG phải verb.
const recorded = [rawRead].map(C.normalize);
const index = C.buildIndex(recorded);
const lookup = C.identityOf(
  C.makeInteraction({
    kind: 'db-query',
    target: "SELECT * FROM users WHERE id = 7731",
    direction: 'READ',
    ordinal: 0,
  })
);
const hits = index.get(lookup) || [];
checkTrue('R3: tìm được entry đã ghi', hits.length === 1);
checkTrue('R3: entry tìm được đúng là READ', hits[0].direction === 'READ');
const missHits = index.get(C.identityOf(C.makeInteraction({
  kind: 'outbound-http',
  method: 'GET',
  target: 'https://api.example/v1/send?to=x',
  direction: 'READ',
  ordinal: 0,
}))) || [];
checkTrue(
  'R3 / T6: HTTP verb READ nhưng KHÔNG có entry -> 0 hit (fail-closed thuộc B5)',
  missHits.length === 0
);

// ---------------------------------------------------------------------------
console.log('\n[normalize(unit)] đơn vị clock + 6 field so sánh (Spec §3.2 · §3.7)');
// ---------------------------------------------------------------------------
const clockUnit = C.normalize(
  C.makeInteraction({ kind: 'clock', direction: 'READ', result: '2026-08-14T09:12:03.114Z', ordinal: 2 })
);
check('clock: target = null (Spec §3.7 hàng I1)', clockUnit.target, null);
check('clock: result exact, KHÔNG tolerant', clockUnit.result, '"2026-08-14T09:12:03.114Z"');
check(
  '6 field vào so sánh',
  C.INTERACTION_COMPARED_FIELDS.slice(),
  ['kind', 'target', 'arguments', 'direction', 'result', 'ordinal']
);
// ---------------------------------------------------------------------------
console.log('\n[directionOf(kind, target)] hàm thuần derive direction (D-3, B0\')');
// ---------------------------------------------------------------------------
check('directionOf inbound-http -> READ', C.directionOf('inbound-http', '/checkout'), 'READ');
check('directionOf clock -> READ', C.directionOf('clock'), 'READ');
check('directionOf feature-flag -> READ', C.directionOf('feature-flag', 'new_feature'), 'READ');
check('directionOf stack-trace -> READ', C.directionOf('stack-trace', 'TypeError'), 'READ');
check('directionOf git-commit -> READ', C.directionOf('git-commit', 'HEAD'), 'READ');
check('directionOf runtime-metadata -> READ', C.directionOf('runtime-metadata'), 'READ');
check('directionOf outbound-http GET -> READ', C.directionOf('outbound-http', 'GET https://api.example/data'), 'READ');
check('directionOf outbound-http POST -> WRITE', C.directionOf('outbound-http', 'POST https://api.example/pay'), 'WRITE');
check('directionOf outbound-http DELETE -> WRITE', C.directionOf('outbound-http', 'DELETE /item/1'), 'WRITE');
check('directionOf db-query SELECT -> READ', C.directionOf('db-query', 'SELECT * FROM users WHERE id = $1'), 'READ');
check('directionOf db-query INSERT -> WRITE', C.directionOf('db-query', 'INSERT INTO orders (id) VALUES ($1)'), 'WRITE');
check('directionOf db-query UPDATE -> WRITE', C.directionOf('db-query', 'UPDATE orders SET status = $1'), 'WRITE');
check('directionOf db-query DELETE -> WRITE', C.directionOf('db-query', 'DELETE FROM cart WHERE id = $1'), 'WRITE');

// ---------------------------------------------------------------------------
console.log('\n[normalize(unit) - 3 kind mới §18] stack-trace · git-commit · runtime-metadata');
// ---------------------------------------------------------------------------
const stUnit = C.normalize(C.makeInteraction({
  kind: 'stack-trace',
  target: 'TypeError: cannot read property',
  direction: 'READ',
  result: 'at handleCheckout (checkout.js:120)',
  ordinal: 7,
}));
check('stack-trace normalize ok', stUnit.kind, 'stack-trace');
check('stack-trace target giữ nguyên', stUnit.target, 'TypeError: cannot read property');

const gitUnit = C.normalize(C.makeInteraction({
  kind: 'git-commit',
  target: '15c462e',
  direction: 'READ',
  result: { branch: 'main' },
  ordinal: 8,
}));
check('git-commit normalize ok', gitUnit.kind, 'git-commit');
check('git-commit target là commit hash', gitUnit.target, '15c462e');

const metaUnit = C.normalize(C.makeInteraction({
  kind: 'runtime-metadata',
  direction: 'READ',
  result: { node: process.version, arch: process.arch },
  ordinal: 9,
}));
check('runtime-metadata target null được chấp nhận', metaUnit.target, null);


// ---------------------------------------------------------------------------
console.log('\n[schema] artifact + hai neo U0/U∞ + class_assessment (Spec §3.1 · §2.6)');
// ---------------------------------------------------------------------------
function buildArtifact(overrides) {
  return C.makeArtifact(
    Object.assign(
      {
        capsuleId: 'repro-1842',
        scenarioId: 'SC-1',
        classAssessment: C.makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
        u0: C.makeU0({
          method: 'POST',
          target: '/checkout',
          arguments: { body: { userId: 7731 } },
        }),
        interactions: [
          C.makeInteraction({ kind: 'clock', direction: 'READ', result: '2026-08-14T09:12:03.114Z', ordinal: 2 }),
          C.makeInteraction({ kind: 'feature-flag', target: 'new_checkout', direction: 'READ', result: true, ordinal: 3 }),
          C.makeInteraction({ kind: 'db-query', target: 'SELECT * FROM users WHERE id = $1', arguments: { bind: [7731] }, direction: 'READ', result: { rows: 1 }, ordinal: 4 }),
          C.makeInteraction({ kind: 'db-query', target: 'SELECT * FROM coupons WHERE id = $1', arguments: { bind: [3] }, direction: 'READ', result: null, ordinal: 5, concurrencyGroup: 'G1' }),
          C.makeInteraction({ kind: 'outbound-http', method: 'POST', target: 'https://tax.example/v1/calc', direction: 'READ', result: { tax: 0 }, ordinal: 6, concurrencyGroup: 'G1' }),
        ],
        uInfinity: C.makeUInfinity({ class: 'exception', type: 'TypeError' }),
      },
      overrides
    )
  );
}

const good = buildArtifact({});
const vGood = C.validateArtifact(good);
checkTrue('artifact hợp lệ -> ok', vGood.ok, JSON.stringify(vGood.errors));
check('U∞ so bằng danh tính loại', C.outcomeIdentity(good.uInfinity), 'exception:TypeError');
checkTrue('schema tự khai KHÔNG phải capsule format v1', good.notCapsuleFormatV1 === true);

const silent = buildArtifact({ classAssessment: null });
const vSilent = C.validateArtifact(silent);
checkTrue('THIẾU class_assessment -> artifact BỊ TỪ CHỐI (Spec §2.6 CAUTION)', vSilent.ok === false);
checkTrue(
  'thông điệp lỗi nêu đúng Spec §2.6',
  vSilent.errors.some((e) => e.includes('class_assessment') && e.includes('§2.6'))
);

const noU0 = buildArtifact({ u0: null });
checkTrue('THIẾU neo U0 -> bị từ chối (Spec §3.1/§3.4 đk3)', C.validateArtifact(noU0).ok === false);
const noUInf = buildArtifact({ uInfinity: null });
checkTrue('THIẾU neo U∞ -> bị từ chối (Spec §3.1/§3.4 đk3)', C.validateArtifact(noUInf).ok === false);

// class_assessment: ba ô của Spec §2.6 + ô "không kiểm được" của §3.5
const outOfClass = C.makeClassAssessment({
  inClass: false,
  failedConditions: ['S3'],
  exclusionAxis: { axis: 2, dependency: 'redis/cache' },
  mechanism: 'M-scope',
  note: 'SC-11 probe — Spec §2.5',
});
checkTrue(
  'class_assessment ngoài class (trục 2) hợp lệ',
  C.validateArtifact(buildArtifact({ classAssessment: outOfClass })).ok
);
const notAssessable = C.makeClassAssessment({ inClass: null, mechanism: 'none-declaration' });
checkTrue(
  'class_assessment "KHÔNG KIỂM ĐƯỢC" hợp lệ (Spec §3.5 · §2.3 lời khai)',
  C.validateArtifact(buildArtifact({ classAssessment: notAssessable })).ok
);
const badAxis = C.makeClassAssessment({ inClass: false, mechanism: 'M-cap' });
checkTrue(
  'inClass=false mà KHÔNG nêu trục loại trừ -> bị từ chối',
  C.validateArtifact(buildArtifact({ classAssessment: badAxis })).ok === false
);


// manifestCommitHash & drift flags
const withManifest = buildArtifact({
  manifestCommitHash: 'ca88a6e0867c6e15c462e9b99589232a684977ae',
  drift: C.makeDriftFlags({
    gitCommit: { capsule: 'ca88a6e', local: 'ca88a6e', drifted: false },
    runtime: { capsule: 'v22.21.1', local: 'v22.21.1', drifted: false },
    dependency: { capsule: 'hash1', local: 'hash2', drifted: true },
    schemaVersion: { capsule: '20260815_01', local: '20260815_01', drifted: false },
  }),
});
const vManifest = C.validateArtifact(withManifest);
checkTrue('artifact có manifestCommitHash và drift flags hợp lệ', vManifest.ok, JSON.stringify(vManifest.errors));
checkTrue('drift flag dependency phát hiện drifted=true', withManifest.drift.dependency.drifted === true);
checkTrue('drift flag gitCommit phát hiện drifted=false', withManifest.drift.gitCommit.drifted === false);
check('manifestCommitHash có trong artifact', withManifest.manifestCommitHash, 'ca88a6e0867c6e15c462e9b99589232a684977ae');
// round-trip
const rt = C.parseArtifact(C.serializeArtifact(good));
checkTrue('serialize/parse round-trip giữ nguyên hợp lệ', C.validateArtifact(rt).ok);
check(
  'serialize là canonical (ổn định giữa hai lần)',
  C.serializeArtifact(good),
  C.serializeArtifact(C.parseArtifact(C.serializeArtifact(good)))
);

// ---------------------------------------------------------------------------
console.log('\n=== KẾT QUẢ: ' + pass + ' pass, ' + fail + ' fail ===');
console.log(
  'Lưu ý phạm vi: self-check này KHÔNG chứng minh `U-01`/`U-02` đã đóng ' +
    '(thuộc `D3` của `P1`), và KHÔNG chứa verdict logic (`matched`/`diverged` thuộc `B6`).\n'
);
process.exit(fail === 0 ? 0 : 1);
