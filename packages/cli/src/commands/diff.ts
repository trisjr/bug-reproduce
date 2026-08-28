/**
 * `repro diff` Command Handler
 * Specification: EPIC-05, Story-15, ADR-011, SDD-Repro §3.10, §5.2
 */

import { ReplaySession } from '@repro/replay';
import { TwoTierComparator, formatTerminalDiff, classifyDivergence } from '@repro/diff';
import type { EquivalenceVerdict, DivergencePoint } from '@repro/core';
import type { DiffOptions, DiffResult } from '../types.ts';
import { ExitCode } from '../types.ts';
import { resolveCapsulePath } from '../utils/storage.ts';

/**
 * Executes the `repro diff <capsule-id>` command.
 */
export async function diffCommand(capsuleId: string, options: DiffOptions = {}): Promise<DiffResult> {
  if (!capsuleId || capsuleId.trim().length === 0) {
    throw new Error('Missing required argument: <capsule-id>');
  }

  const filePath = await resolveCapsulePath(capsuleId, options.dir);

  // 1. Run Replay to obtain local execution trace
  const session = new ReplaySession({
    targetPort: options.port,
  });

  const loadedCapsule = await session.load(filePath);
  session.arm();
  await session.inject();
  const sessionResult = await session.complete();

  // 2. Compare recorded vs replayed execution
  const comparator = new TwoTierComparator();
  const verdictResult = comparator.compare(loadedCapsule.interactions, sessionResult.traces);

  const verdict: EquivalenceVerdict = verdictResult.verdict;
  const divergencePoints: DivergencePoint[] = verdictResult.divergence_points || [];

  // 3. Classify divergence attribution if diverged
  let attributionResult;
  if (verdict === 'EXECUTION_DIVERGED' && divergencePoints.length > 0) {
    attributionResult = classifyDivergence({
      recorded: loadedCapsule.interactions,
      replayed: sessionResult.traces,
      first_divergence_point: divergencePoints[0],
      divergence_points: divergencePoints,
      manifest: loadedCapsule.manifest,
      runtime_metadata: loadedCapsule.runtimeMetadata,
    });
  }

  // 4. Render two-column side-by-side Terminal Diff
  const renderedDiff = formatTerminalDiff(
    {
      verdict,
      recorded: loadedCapsule.interactions,
      replayed: sessionResult.traces,
      divergence_points: divergencePoints,
      attribution: attributionResult,
      app_name: loadedCapsule.manifest.app_name,
      capsule_id: loadedCapsule.manifest.capsule_id || capsuleId,
    },
    {
      color: options.noColor ? false : true,
      maxWidth: options.maxWidth || 120,
      showAllInteractions: options.showAllInteractions,
    }
  );

  let exitCode = ExitCode.SUCCESS;
  if (verdict === 'EXECUTION_DIVERGED') {
    exitCode = ExitCode.DIVERGED;
  } else if (verdict === 'INCONCLUSIVE') {
    exitCode = ExitCode.INCOMPLETE;
  }

  const result: DiffResult = {
    capsuleId: loadedCapsule.manifest.capsule_id || capsuleId,
    verdict,
    renderedDiff,
    divergencePoints,
    recordedCount: loadedCapsule.interactions.length,
    replayedCount: sessionResult.traces.length,
    attribution: attributionResult,
    exitCode,
  };

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          capsuleId: result.capsuleId,
          verdict: result.verdict,
          divergencePoints: result.divergencePoints,
          recordedCount: result.recordedCount,
          replayedCount: result.replayedCount,
          attribution: result.attribution,
          exitCode: result.exitCode,
        },
        null,
        2
      )
    );
    return result;
  }

  console.log(renderedDiff);
  return result;
}
