'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Entrypoint của B7a Overhead Benchmark Harness.
 * CLI runner và module export.
 */

const fs = require('node:fs');
const path = require('node:path');

const configMod = require('./config');
const driverMod = require('./driver');
const samplerMod = require('./sampler');
const gatesMod = require('./gates');
const orchestratorMod = require('./orchestrator');
const reporterMod = require('./reporter');

/**
 * Parse CLI args từ process.argv.
 *
 * @param {string[]} argv
 * @returns {Record<string, unknown>}
 */
function parseCliArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--endpoint' && i + 1 < argv.length) {
      args.endpoint = argv[++i];
    } else if (arg === '--concurrency' && i + 1 < argv.length) {
      args.concurrency = Number(argv[++i]);
    } else if ((arg === '--count' || arg === '--request-count') && i + 1 < argv.length) {
      args.requestCount = Number(argv[++i]);
    } else if (arg === '--error-rate' && i + 1 < argv.length) {
      args.targetErrorRate = Number(argv[++i]);
    } else if (arg === '--out' && i + 1 < argv.length) {
      args.outFile = argv[++i];
    } else if (arg === '--format' && i + 1 < argv.length) {
      args.format = argv[++i];
    } else if (arg === '--cgroup-path' && i + 1 < argv.length) {
      args.cgroupPath = argv[++i];
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

/**
 * Main CLI execution.
 */
async function main() {
  const cliArgs = parseCliArgs(process.argv.slice(2));
  const config = configMod.loadBenchConfig(cliArgs);

  const format = String(cliArgs.format || 'text').toLowerCase();
  const outFile = cliArgs.outFile ? String(cliArgs.outFile) : null;

  if (format === 'text') {
    console.log(`\nKhởi động Overhead Benchmark Harness (RunID: ${config.runId})...`);
    console.log(`Endpoint: ${config.endpoint} | Concurrency: ${config.concurrency} | Req/Stage: ${config.requestCount}`);
  }

  const result = await orchestratorMod.runBenchmark({ config });

  if (format === 'json') {
    console.log(reporterMod.formatJsonReport(result));
  } else if (format === 'csv') {
    console.log(reporterMod.formatCsvReport(result));
  } else {
    console.log(reporterMod.formatTextSummary(result));
  }

  if (outFile) {
    const resolvedPath = path.resolve(process.cwd(), outFile);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    const content = outFile.endsWith('.csv')
      ? reporterMod.formatCsvReport(result)
      : reporterMod.formatJsonReport(result);
    fs.writeFileSync(resolvedPath, content, 'utf8');
    if (format === 'text') {
      console.log(`\nĐã lưu báo cáo tại: ${resolvedPath}`);
    }
  }

  if (result.verdict !== 'PASS') {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Benchmark Runner Error:', err);
    process.exit(1);
  });
}

module.exports = {
  ...configMod,
  ...driverMod,
  ...samplerMod,
  ...gatesMod,
  ...orchestratorMod,
  ...reporterMod,
  parseCliArgs,
  main,
};
