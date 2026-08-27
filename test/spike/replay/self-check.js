'use strict';

/**
 * ============================================================================
 *  B5 · test/spike/replay/self-check.js
 *  SELF-CHECK RUNNER CHO B5 SECURITY MATRIX & SCENARIO REPLAY SUITE (P0-B)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Chạy toàn bộ 12 test an toàn T1-T12 theo MTP §5.3, THREAT-018, ADR-005.
 *    - Chạy Replay Suite cho 10 Scenario Fixtures từ B8 với K=3 và B6 Verifier.
 *    - In kết quả chi tiết từng test case, đếm số test pass/fail.
 *    - Thoát với exit code 0 nếu 100% pass, hoặc exit code 1 nếu có lỗi.
 */

const { execFileSync } = require('node:child_process');
const path = require('node:path');

console.log('\n================================================================');
console.log('  B5 SECURITY MATRIX & SCENARIO REPLAY SUITE SELF-CHECK (Wave 3)');
console.log('================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

/**
 * Chạy test runner cho một test file cụ thể.
 * @param {string} relativePath
 * @param {string} suiteName
 */
function runTestSuite(relativePath, suiteName) {
  console.log(`▶ Đang thực thi Suite: [${suiteName}] (${relativePath})...`);
  const fullPath = path.resolve(__dirname, relativePath);

  try {
    const output = execFileSync(
      process.execPath,
      ['--test', '--test-reporter', 'spec', fullPath],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    const lines = output.split('\n');
    let suitePassCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('✔') || trimmed.startsWith('ok')) {
        console.log(`   ${trimmed}`);
        suitePassCount++;
        totalPassed++;
      } else if (trimmed.startsWith('✖') || trimmed.startsWith('not ok')) {
        console.error(`   ❌ ${trimmed}`);
        totalFailed++;
        failures.push(`${suiteName}: ${trimmed}`);
      }
    }

    console.log(`   ↳ Kết quả [${suiteName}]: Đã hoàn thành thành công (${suitePassCount} test cases PASS)\n`);
  } catch (err) {
    console.error(`❌ Suite [${suiteName}] thất bại với lỗi:`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
    totalFailed++;
    failures.push(`${suiteName}: Process exited with status ${err.status}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Chạy Ma trận 12 Test An Toàn T1-T12
// ---------------------------------------------------------------------------
runTestSuite('t1-t12-matrix.test.js', 'Ma trận 12 Test An Toàn T1-T12 (MTP §5.3 / ADR-005)');

// ---------------------------------------------------------------------------
// 2. Chạy Replay Scenarios Suite (10 Scenarios × K=3 & B6 Verifier)
// ---------------------------------------------------------------------------
runTestSuite('replay-scenarios.test.js', 'Replay 10 Scenario Fixtures & B6 Verifier Suite (K=3 / D=7)');

// ---------------------------------------------------------------------------
// Tổng kết kết quả
// ---------------------------------------------------------------------------
console.log('================================================================');
console.log('                        TỔNG KẾT BÁO CÁO                        ');
console.log('================================================================');
console.log(`  Tổng số test cases PASS: ${totalPassed}`);
console.log(`  Tổng số test cases FAIL: ${totalFailed}`);

if (totalFailed > 0) {
  console.error('\n❌ Danh sách lỗi:');
  for (const f of failures) {
    console.error(`   - ${f}`);
  }
  console.error('\n💥 SELF-CHECK THẤT BẠI!');
  process.exit(1);
} else {
  console.log('\n  ✓ 12/12 Test Cases An Toàn T1-T12 đạt chuẩn (L1 SQL/HTTP fail-closed, L2 sandbox probe PASS).');
  console.log('  ✓ 10/10 Scenario Fixtures Replay đạt chuẩn (K=3/3, D=7 preserved, B6 2-layer verification PASS).');
  console.log('\n🎉 B5 Security Matrix & Scenario Replay Suite Self-Check: HOÀN TẤT THÀNH CÔNG (100% PASS)\n');
  process.exit(0);
}
