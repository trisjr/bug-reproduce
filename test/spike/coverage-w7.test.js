'use strict';
/**
 * Test hồi quy cho W-7 (R7: một statement đếm một lần).
 * Chứng minh: dòng LOG: statement: đếm 1, dòng STATEMENT: (lặp lại sau ERROR) không bị đếm đôi.
 */
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const RUN_ID = 'test-run';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spike-w7-test-'));
const stmtLogFile = path.join(tmpDir, `canary-db-statements-${RUN_ID}.log`);
// Log có 1 statement thành công và 1 statement lỗi (kèm dòng STATEMENT: lặp lại)
const logContent = [
  '2026-08-16 10:00:00.000 UTC user=spike_user db=spike_db app=client client=10.83.0.4 LOG:  statement: SELECT 1',
  '2026-08-16 10:00:01.000 UTC user=spike_user db=spike_db app=client client=10.83.0.4 LOG:  statement: INSERT INTO non_existent_table VALUES (1)',
  '2026-08-16 10:00:01.001 UTC user=spike_user db=spike_db app=client client=10.83.0.4 ERROR:  relation "non_existent_table" does not exist',
  '2026-08-16 10:00:01.002 UTC user=spike_user db=spike_db app=client client=10.83.0.4 STATEMENT:  INSERT INTO non_existent_table VALUES (1)',
].join('\n');

fs.writeFileSync(stmtLogFile, logContent, 'utf8');

const coverageScript = path.resolve(__dirname, '../../src/spike/infra/coverage/coverage.js');

try {
  const result = execFileSync(
    process.execPath,
    [
      coverageScript,
      '--run-id', 'test-run',
      '--canary-log-dir', tmpDir,
      '--evidence-dir', tmpDir,
      '--out-dir', tmpDir,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
} catch (e) {
  // exit 30 is expected when fixture attestation is missing (fail-closed)
  assert.strictEqual(e.status, 30, 'coverage.js should exit 30 for incomplete coverage');
}
const files = fs.readdirSync(tmpDir);
const outFileName = files.find((f) => f.startsWith('canary-coverage-test-run'));
assert.ok(outFileName, 'coverage JSON file must be generated. Found: ' + JSON.stringify(files));

const outJsonFile = path.join(tmpDir, outFileName);
const out = JSON.parse(fs.readFileSync(outJsonFile, 'utf8'));
// Test hồi quy 1: Không bị đếm đôi (2 statement chứ không phải 3)
assert.strictEqual(
  out.escaped_side_effects_breakdown.db_sink_statement_log_lines_from_network_clients,
  2,
  'Test 1: Phải đếm đúng 2 statements từ network client (không đếm đôi dòng STATEMENT:)'
);

// Test hồi quy 2: Dòng STATEMENT: lặp lại được ghi nhận vào excluded by reason
assert.strictEqual(
  out.escaped_side_effects_breakdown.db_sink_statement_lines_excluded_by_reason.db_statement_error_detail,
  1,
  'Test 2: Dòng STATEMENT: lặp lại phải được phân loại vào db_statement_error_detail'
);

console.log('✅ W-7 regression tests passed (2/2)');
// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });
