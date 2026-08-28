#!/usr/bin/env node

/**
 * Repro Unified Test Runner Script
 * Executes all test suites across the monorepo: Unit, Integration, Security, and Fidelity.
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

console.log('🚀 Running Repro V0.1 Full Test Suite...\n');

const testProcess = spawn(
  'node',
  [
    '--experimental-strip-types',
    '--no-warnings',
    '--test',
    'test/unit/*.test.ts',
    'test/integration/*.test.ts',
    'test/security/*.test.ts',
    'test/fidelity/*.test.ts',
  ],
  {
    cwd: rootDir,
    stdio: 'inherit',
  }
);

testProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ All Repro V0.1 test suites passed successfully!');
    process.exit(0);
  } else {
    console.error(`\n❌ Test run failed with exit code ${code}`);
    process.exit(code ?? 1);
  }
});
