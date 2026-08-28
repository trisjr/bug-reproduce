'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Entrypoint của B7 Benchmark Harness (B7a Overhead + B7b Fidelity & Composite).
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
const fidelityMod = require('./fidelity');
const compositeMod = require('./composite');

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
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts.length > 1 ? parts[1] : true;
      args[key] = val;
    } else if (arg === '-o' && i + 1 < argv.length) {
      args.outFile = argv[++i];
    } else if (arg === '-f' && i + 1 < argv.length) {
      args.format = argv[++i];
    } else if (arg === '-m' && i + 1 < argv.length) {
      args.mode = argv[++i];
    }
  }
  return args;
}

/**
 * Main CLI execution.
 */
async function main() {
  const cliArgs = parseCliArgs(process.argv.slice(2));
  const mode = String(cliArgs.mode || 'composite').toLowerCase();
  const format = String(cliArgs.format || 'text').toLowerCase();
  const outFile = cliArgs.outFile ? String(cliArgs.outFile) : null;

  let result;

  if (mode === 'overhead' || mode === 'b7a') {
    const config = configMod.loadBenchConfig(cliArgs);
    result = await orchestratorMod.runBenchmark({ config });
    if (format === 'json') {
      console.log(reporterMod.formatJsonReport(result));
    } else if (format === 'csv') {
      console.log(reporterMod.formatCsvReport(result));
    } else {
      console.log(reporterMod.formatTextSummary(result));
    }
  } else if (mode === 'fidelity') {
    result = await fidelityMod.runFidelityBenchmark({
      kIterations: cliArgs.k ? Number(cliArgs.k) : 3,
    });
    if (format === 'json') {
      console.log(reporterMod.formatJsonReport(result));
    } else if (format === 'csv') {
      console.log(reporterMod.formatFidelityCsvReport(result));
    } else {
      console.log(JSON.stringify(result.metrics, null, 2));
    }
  } else {
    // Default: Composite Mode (B7b)
    result = await compositeMod.runCompositeBenchmark();
    if (format === 'json') {
      console.log(reporterMod.formatJsonReport(result));
    } else if (format === 'csv') {
      console.log(reporterMod.formatCompositeCsvReport(result));
    } else {
      console.log(reporterMod.formatCompositeTextSummary(result));
    }
  }

  if (outFile) {
    const resolvedPath = path.resolve(process.cwd(), outFile);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    let content;
    if (format === 'json') {
      content = reporterMod.formatJsonReport(result);
    } else if (format === 'csv') {
      content = mode === 'fidelity'
        ? reporterMod.formatFidelityCsvReport(result)
        : (mode === 'overhead' ? reporterMod.formatCsvReport(result) : reporterMod.formatCompositeCsvReport(result));
    } else {
      content = mode === 'composite' ? reporterMod.formatCompositeTextSummary(result) : reporterMod.formatTextSummary(result);
    }
    fs.writeFileSync(resolvedPath, content, 'utf8');
    console.error(`Report exported to: ${resolvedPath}`);
  }

  if (result.verdict && result.verdict !== 'PASS') {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Benchmark execution failed:', err);
    process.exit(1);
  });
}

module.exports = {
  // Config & CLI
  parseCliArgs,
  loadBenchConfig: configMod.loadBenchConfig,
  DEFAULT_CONFIG: configMod.DEFAULT_CONFIG,

  // Driver & Sampler
  runLoadDriver: driverMod.runLoadDriver,
  generateRequestPayload: driverMod.generateRequestPayload,
  sendSingleRequest: driverMod.sendSingleRequest,
  ERROR_SKU: driverMod.ERROR_SKU,
  SUCCESS_SKUS: driverMod.SUCCESS_SKUS,
  CUSTOMERS: driverMod.CUSTOMERS,
  parseKeyValueFile: samplerMod.parseKeyValueFile,
  takeSnapshot: samplerMod.takeSnapshot,
  computeMetricsDiff: samplerMod.computeMetricsDiff,

  // Gates & Orchestrator (B7a)
  evaluateResourceGates: gatesMod.evaluateResourceGates,
  probeForeignContainers: gatesMod.probeForeignContainers,
  calculatePercentile: orchestratorMod.calculatePercentile,
  calculateStats: orchestratorMod.calculateStats,
  calculateDeltaPct: orchestratorMod.calculateDeltaPct,
  calculateStatsDelta: orchestratorMod.calculateStatsDelta,
  resetOrders: orchestratorMod.resetOrders,
  runBenchmark: orchestratorMod.runBenchmark,
  // Fidelity & Composite (B7b)
  runFidelityBenchmark: fidelityMod.runFidelityBenchmark,
  buildScenarioArtifacts: fidelityMod.buildScenarioArtifacts,
  calculateDistribution: fidelityMod.calculateDistribution,
  runCompositeBenchmark: compositeMod.runCompositeBenchmark,
  evaluateHypothesesCompliance: compositeMod.evaluateHypothesesCompliance,
  HYPOTHESES_THRESHOLDS: compositeMod.HYPOTHESES_THRESHOLDS,

  // Reporters
  formatJsonReport: reporterMod.formatJsonReport,
  formatCsvReport: reporterMod.formatCsvReport,
  formatFidelityCsvReport: reporterMod.formatFidelityCsvReport,
  formatCompositeCsvReport: reporterMod.formatCompositeCsvReport,
  formatTextSummary: reporterMod.formatTextSummary,
  formatCompositeTextSummary: reporterMod.formatCompositeTextSummary,
};
