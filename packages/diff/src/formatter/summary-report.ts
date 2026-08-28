/**
 * Summary Report Formatter — Strict Contract Language Compliant with §20.16
 * Specification: ADR-011, Story-15, SDD-Repro §20.16, §5.3, §3.9
 */

import type {
  EquivalenceVerdict,
  DivergenceReport,
  AttributionCategory,
  AttributionReason
} from '@repro/core';
import type { EquivalenceVerdictResult } from '../engine/comparator.ts';
import { AnsiColor } from './terminal-diff.ts';

export interface SummaryReportOptions {
  color?: boolean;
  mode?: 'replay' | 'verify' | 'diff';
  beforeFixReproduced?: boolean;
  afterFixNoLongerReproduces?: boolean;
  executionClass?: string;
  matchScore?: number;
  divergenceCount?: number;
  primaryAttribution?: AttributionCategory | string;
  primaryReason?: AttributionReason | string;
  durationMs?: number;
  app_name?: string;
  capsule_id?: string;
}

/**
 * Inviolable Contract Messages per ADR-006, ADR-011, and SDD-Repro §20.16
 */
export const CONTRACT_STRINGS = {
  BUG_REPRODUCED: '💥 BUG REPRODUCED (✓ Execution matched)',
  NO_LONGER_REPRODUCES: '✓ Captured execution no longer reproduces',
  EXECUTION_DIVERGED: '✗ Execution diverged — Replay did not follow recorded execution path',
  INCONCLUSIVE: '⚠ Inconclusive execution — Outside supported execution class or unmonitored crash',
  BEFORE_FIX_REPRODUCED: 'Before fix: ✗ reproduced',
  AFTER_FIX_CLEARED: 'After fix:  ✓ captured execution no longer reproduces'
} as const;

/**
 * Strictly forbidden subjective phrases per SDD-Repro §20.16.
 * It is prohibited to claim that the production bug is definitely fixed.
 */
export const FORBIDDEN_PHRASES = [
  'production bug is definitely fixed',
  'production bug is fixed',
  'bug is definitely fixed',
  'bug is fixed permanently',
  'bug is 100% fixed',
  'bug resolved permanently'
] as const;

/**
 * Validates that a rendered report text contains no forbidden subjective claims.
 */
export function assertStrictContractLanguage(text: string): void {
  const lower = text.toLowerCase();
  for (const forbidden of FORBIDDEN_PHRASES) {
    if (lower.includes(forbidden)) {
      throw new Error(
        `[CONTRACT VIOLATION §20.16] Forbidden subjective claim detected: "${forbidden}". Only use "${CONTRACT_STRINGS.NO_LONGER_REPRODUCES}".`
      );
    }
  }
}

/**
 * Renders a strict contract-compliant summary report for CLI output (§20.16).
 *
 * Requirements:
 * 1. When bug is reproduced (replayed identical): emits "💥 BUG REPRODUCED (✓ Execution matched)"
 * 2. When bug no longer reproduces (execution fixed): emits "✓ Captured execution no longer reproduces"
 * 3. In verify mode:
 *    Before fix: ✗ reproduced
 *    After fix:  ✓ captured execution no longer reproduces
 * 4. STRICTLY PROHIBITS any subjective exaggeration such as "✓ Production bug is definitely fixed".
 */
export function renderSummaryReport(
  input: EquivalenceVerdict | DivergenceReport | EquivalenceVerdictResult | string | Record<string, unknown>,
  options: SummaryReportOptions = {}
): string {
  const colorEnabled = options.color !== false && (typeof process === 'undefined' || !process.env?.NO_COLOR);
  const c = new AnsiColor(colorEnabled);

  // Extract verdict and metadata from input
  let rawVerdict: string = 'EXECUTION_DIVERGED';
  let matchScore: number | undefined = options.matchScore;
  let divergenceCount: number | undefined = options.divergenceCount;
  let primaryAttribution: string | undefined = options.primaryAttribution;
  let primaryReason: string | undefined = options.primaryReason;
  let isInClass = true;

  if (typeof input === 'string') {
    rawVerdict = input;
  } else if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.verdict === 'string') {
      rawVerdict = obj.verdict;
    }
    if (typeof obj.match_score === 'number') {
      matchScore = obj.match_score;
    } else if (typeof obj.score === 'number') {
      matchScore = obj.score;
    }
    if (Array.isArray(obj.divergence_points)) {
      divergenceCount = obj.divergence_points.length;
    }
    if (typeof obj.primary_attribution === 'string') {
      primaryAttribution = obj.primary_attribution;
    }
    if (typeof obj.primary_reason === 'string') {
      primaryReason = obj.primary_reason;
    }
    if (typeof obj.is_in_class === 'boolean') {
      isInClass = obj.is_in_class;
    }
  }

  const lines: string[] = [];

  // Special Mode: Verify Mode (Story-15 Scenario 2 & Scenario 3)
  if (options.mode === 'verify') {
    lines.push(c.bold(c.cyan('============================================================')));
    lines.push(c.bold('🔬 REPRO VERIFICATION REPORT (§20.16 Contract)'));
    lines.push(c.gray('============================================================'));

    const beforeReproduced = options.beforeFixReproduced !== false; // default true
    const afterFixed = options.afterFixNoLongerReproduces !== false; // default true

    lines.push(
      beforeReproduced
        ? c.bold(c.red(CONTRACT_STRINGS.BEFORE_FIX_REPRODUCED))
        : c.gray('Before fix: ✓ matched')
    );

    lines.push(
      afterFixed
        ? c.bold(c.green(CONTRACT_STRINGS.AFTER_FIX_CLEARED))
        : c.bold(c.yellow('After fix:  ✗ bug still reproduces'))
    );

    lines.push(c.gray('────────────────────────────────────────────────────────────'));
    lines.push(
      c.dim(
        'Note (§20.16): Proves this captured execution no longer reproduces in local environment.\nDoes not guarantee race conditions or other untested paths are eliminated.'
      )
    );
    lines.push(c.bold(c.cyan('============================================================')));

    const output = lines.join('\n');
    assertStrictContractLanguage(output);
    return output;
  }

  // Standard Replay / Diff Mode Summary
  lines.push(c.gray('─'.repeat(60)));

  switch (rawVerdict) {
    case 'EXECUTION_MATCHED':
    case 'MATCHED':
    case 'BUG_REPRODUCED': {
      lines.push(c.bold(c.green(CONTRACT_STRINGS.BUG_REPRODUCED)));
      if (matchScore !== undefined) {
        lines.push(`  ${c.dim('Equivalence Score:')} ${c.bold(`${(matchScore * 100).toFixed(1)}%`)} (Threshold: ≥ 90.0%)`);
      }
      break;
    }

    case 'EXECUTION_DIVERGED':
    case 'DIVERGED': {
      // If caller specifically marked as fixed
      if (options.afterFixNoLongerReproduces) {
        lines.push(c.bold(c.green(CONTRACT_STRINGS.NO_LONGER_REPRODUCES)));
      } else {
        lines.push(c.bold(c.yellow(CONTRACT_STRINGS.EXECUTION_DIVERGED)));
      }

      if (matchScore !== undefined) {
        lines.push(`  ${c.dim('Equivalence Score:')} ${c.yellow(`${(matchScore * 100).toFixed(1)}%`)}`);
      }
      if (divergenceCount !== undefined) {
        lines.push(`  ${c.dim('Divergence Points:')} ${divergenceCount}`);
      }
      if (primaryAttribution) {
        lines.push(`  ${c.dim('Attribution:')} ${c.bold(primaryAttribution)} (${primaryReason || 'code'})`);
      }
      break;
    }

    case 'INCONCLUSIVE':
    default: {
      if (!isInClass) {
        lines.push(c.bold(c.yellow(CONTRACT_STRINGS.INCONCLUSIVE)));
      } else {
        lines.push(c.bold(c.yellow(`⚠️ Execution Status: ${rawVerdict}`)));
      }
      break;
    }
  }

  lines.push(c.gray('─'.repeat(60)));

  const result = lines.join('\n');
  assertStrictContractLanguage(result);
  return result;
}
