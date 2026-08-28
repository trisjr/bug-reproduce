/**
 * `repro verify` Command Handler — Strict Contract Language Compliant with §20.16
 * Specification: EPIC-05, Story-15, FR-046, SDD-Repro §8, §20.16, §5.2
 */

import { ReplaySession } from '@repro/replay';
import {
  TwoTierComparator,
  renderSummaryReport,
  classifyDivergence,
  assertStrictContractLanguage,
  CONTRACT_STRINGS,
} from '@repro/diff';
import type { EquivalenceVerdict, DivergencePoint } from '@repro/core';
import type { VerifyOptions, VerifyResult } from '../types.ts';
import { ExitCode } from '../types.ts';
import { resolveCapsulePath } from '../utils/storage.ts';

/**
 * Executes the `repro verify <capsule-id>` command.
 */
export async function verifyCommand(capsuleId: string, options: VerifyOptions = {}): Promise<VerifyResult> {
  if (!capsuleId || capsuleId.trim().length === 0) {
    throw new Error('Missing required argument: <capsule-id>');
  }

  const filePath = await resolveCapsulePath(capsuleId, options.dir);

  // 1. Run Replay on the current local codebase
  const session = new ReplaySession({
    targetPort: options.port,
    timeoutMs: options.timeoutMs,
  });

  const loadedCapsule = await session.load(filePath);
  session.arm();
  await session.inject();
  const sessionResult = await session.complete();

  // 2. Compare baseline failure against current replayed execution
  const comparator = new TwoTierComparator();
  const verdictResult = comparator.compare(loadedCapsule.interactions, sessionResult.traces);

  const verdict: EquivalenceVerdict = verdictResult.verdict;
  const divergencePoints: DivergencePoint[] = verdictResult.divergence_points || [];

  // 3. Classify divergence attribution (6-Step Attribution Protocol)
  let attributionResult;
  if (verdict === 'EXECUTION_DIVERGED' || divergencePoints.length > 0) {
    attributionResult = classifyDivergence({
      recorded: loadedCapsule.interactions,
      replayed: sessionResult.traces,
      first_divergence_point: divergencePoints[0],
      divergence_points: divergencePoints,
      manifest: loadedCapsule.manifest,
      runtime_metadata: loadedCapsule.runtimeMetadata,
      code_diff_present: true,
    });
  }

  // 4. Determine Before / After verification status
  // If execution matched baseline 100% -> Bug is reproduced (fix is NOT yet effective)
  // If execution diverged due to code change and completed without failure -> Captured execution no longer reproduces
  const bugStillReproduced = verdict === 'EXECUTION_MATCHED';
  const beforeFixReproduced = true;
  const afterFixNoLongerReproduces = !bugStillReproduced && (sessionResult.success || !sessionResult.error);
  const isVerified = afterFixNoLongerReproduces;

  let contractMessage: string;
  let exitCode = ExitCode.SUCCESS;

  if (isVerified) {
    contractMessage = CONTRACT_STRINGS.NO_LONGER_REPRODUCES;
    exitCode = ExitCode.SUCCESS;
  } else if (bugStillReproduced) {
    contractMessage = CONTRACT_STRINGS.BUG_REPRODUCED;
    exitCode = ExitCode.DIVERGED;
  } else {
    contractMessage = CONTRACT_STRINGS.EXECUTION_DIVERGED;
    exitCode = ExitCode.DIVERGED;
  }

  // 5. Render summary report compliant with §20.16
  const useColor = options.noColor ? false : true;
  const summaryReport = renderSummaryReport(verdictResult, {
    color: useColor,
    mode: 'verify',
    beforeFixReproduced,
    afterFixNoLongerReproduces,
    primaryAttribution: attributionResult?.category,
    primaryReason: attributionResult?.reason,
    capsule_id: loadedCapsule.manifest.capsule_id || capsuleId,
    app_name: loadedCapsule.manifest.app_name,
    durationMs: sessionResult.duration_ms,
  });

  // 6. Strict validation against forbidden subjective claims (§20.16)
  assertStrictContractLanguage(summaryReport);
  assertStrictContractLanguage(contractMessage);

  const result: VerifyResult = {
    capsuleId: loadedCapsule.manifest.capsule_id || capsuleId,
    beforeFixReproduced,
    afterFixNoLongerReproduces,
    isVerified,
    verdict,
    attribution: attributionResult,
    summaryReport,
    contractMessage,
    exitCode,
  };

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          capsuleId: result.capsuleId,
          isVerified: result.isVerified,
          beforeFix: beforeFixReproduced ? 'reproduced' : 'cleared',
          afterFix: afterFixNoLongerReproduces ? 'no_longer_reproduces' : 'still_reproduces',
          contractMessage: result.contractMessage,
          verdict: result.verdict,
          attribution: result.attribution
            ? {
                category: result.attribution.category,
                reason: result.attribution.reason,
                step: result.attribution.step_matched,
                explanation: result.attribution.explanation,
              }
            : undefined,
          exitCode: result.exitCode,
        },
        null,
        2
      )
    );
    return result;
  }

  const bold = (t: string) => (useColor ? `\x1b[1m${t}\x1b[22m` : t);
  const cyan = (t: string) => (useColor ? `\x1b[36m${t}\x1b[39m` : t);

  console.log(`\n${bold('🔍 REPRO VERIFY FIX VALIDATION')}`);
  console.log(`  Capsule: ${cyan(result.capsuleId)} (${loadedCapsule.manifest.app_name || 'unknown'})\n`);

  console.log(summaryReport);
  console.log();

  return result;
}
