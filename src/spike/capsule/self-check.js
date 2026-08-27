'use strict';

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { writeCapsule, readCapsule, inspectCapsule, isSafeCapsulePath } = require('./index');
const { makeArtifact, makeClassAssessment, makeU0, makeUInfinity } = require('../contract');

console.log('\n=== B4 Capsule Self-Check ===');

const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'spike-capsule-test-'));
const safeDir = path.join(tmpBase, 'src', 'spike', 'capsules');
const safeFilePath = path.join(safeDir, 'sc-1.capsule');

const sampleArtifact = makeArtifact({
  capsuleId: 'capsule-test-01',
  scenarioId: 'SC-1',
  manifestCommitHash: '15c462e0867c6e15c462e9b99589232a684977ae',
  classAssessment: makeClassAssessment({ inClass: true, mechanism: 'M-cap' }),
  u0: makeU0({ method: 'POST', target: '/checkout', arguments: { sku: 'SKU-001' } }),
  interactions: [],
  uInfinity: makeUInfinity({ class: 'http-response', type: 'status:201' }),
});

// 1. Kiểm tra writeCapsule và readCapsule
const writtenPath = writeCapsule(safeFilePath, sampleArtifact);
assert.strictEqual(writtenPath, safeFilePath);
assert.ok(fs.existsSync(safeFilePath));

const loaded = readCapsule(safeFilePath);
assert.strictEqual(loaded.capsuleId, 'capsule-test-01');
assert.strictEqual(loaded.scenarioId, 'SC-1');
assert.strictEqual(loaded.manifestCommitHash, '15c462e0867c6e15c462e9b99589232a684977ae');

// 2. Kiểm tra inspectCapsule
const metadata = inspectCapsule(loaded);
assert.strictEqual(metadata.scenarioId, 'SC-1');
assert.strictEqual(metadata.inClass, true);
assert.strictEqual(metadata.u0Target, '/checkout');

// 3. Kiểm tra D-8: Từ chối ghi nếu đường dẫn không an toàn
const unsafePath1 = path.join(tmpBase, 'sc-1.json'); // không có /capsules/ và không đuôi .capsule
assert.strictEqual(isSafeCapsulePath(unsafePath1), false);
assert.throws(() => {
  writeCapsule(unsafePath1, sampleArtifact);
}, /D-8 VIOLATION/);

const unsafePath2 = path.join(safeDir, 'sc-1.txt'); // có /capsules/ nhưng sai extension
assert.strictEqual(isSafeCapsulePath(unsafePath2), false);
assert.throws(() => {
  writeCapsule(unsafePath2, sampleArtifact);
}, /D-8 VIOLATION/);

const unsafePath3 = path.join(tmpBase, 'other', 'sc-1.capsule'); // đúng đuôi nhưng không nằm trong capsules/
assert.strictEqual(isSafeCapsulePath(unsafePath3), false);
assert.throws(() => {
  writeCapsule(unsafePath3, sampleArtifact);
}, /D-8 VIOLATION/);

// Cleanup
fs.rmSync(tmpBase, { recursive: true, force: true });

console.log('✅ B4 Capsule self-check passed (all assertions green, D-8 guard verified)');
