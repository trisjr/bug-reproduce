/**
 * Two-Tier Verification Engine Coordinator
 * Specification: ADR-006, Story-13, SDD-Repro §3.9
 */

import type {
  EquivalenceVerdict,
  DivergencePoint
} from '@repro/core';
import { evaluateTier1Gate, type Tier1GateResult, type Tier1GateOptions } from './tier1-gate.ts';
import { evaluateTier2Rubric, type Tier2RubricResult, type Tier2RubricOptions } from './tier2-rubric.ts';

export interface ComparatorOptions extends Tier1GateOptions, Tier2RubricOptions {
  requireStrictByteEquality?: boolean;
}

export interface EquivalenceVerdictResult {
  verdict: EquivalenceVerdict;
  is_equivalent: boolean;
  score: number;
  tier1_passed: boolean;
  tier2_passed: boolean;
  divergence_points: DivergencePoint[];
  contract_message: string;
  tier1: Tier1GateResult;
  tier2?: Tier2RubricResult;
}

const CONTRACT_MESSAGES: Record<EquivalenceVerdict, string> = {
  EXECUTION_MATCHED: '💥 BUG REPRODUCED (✓ Execution matched)',
  EXECUTION_DIVERGED: '✗ Execution diverged — Replay did not follow recorded execution path',
  INCONCLUSIVE: '⚠ Inconclusive execution — Outside supported execution class or unmonitored crash'
};

/**
 * TwoTierComparator coordinates the two-tier verification process:
 * 1. Runs Tier 1 Gate (Strict Byte Equality after 4 normalizations).
 * 2. If Tier 1 passes 100% -> immediately concludes EXECUTION_MATCHED.
 * 3. If Tier 1 is inconclusive -> returns INCONCLUSIVE.
 * 4. If Tier 1 diverges -> invokes Tier 2 Rubric (Semantic Equivalence).
 */
export class TwoTierComparator {
  private readonly options: ComparatorOptions;

  constructor(options: ComparatorOptions = {}) {
    this.options = options;
  }

  /**
   * Compares recorded production execution against local replayed execution.
   */
  public compare(recorded: unknown, replayed: unknown): EquivalenceVerdictResult {
    // 1. Run Tier 1 Gate
    const tier1Result = evaluateTier1Gate(recorded, replayed, this.options);

    // If inconclusive, short-circuit
    if (tier1Result.verdict === 'INCONCLUSIVE') {
      return {
        verdict: 'INCONCLUSIVE',
        is_equivalent: false,
        score: tier1Result.score,
        tier1_passed: false,
        tier2_passed: false,
        divergence_points: tier1Result.inconclusive_reasons?.map((reason, idx) => ({
          index: idx,
          category: 'CLASS_ASSESSMENT',
          description: reason,
          production_value: null,
          local_value: null,
          attribution_reason: 'out-of-scope-determinism'
        })) ?? [],
        contract_message: CONTRACT_MESSAGES.INCONCLUSIVE,
        tier1: tier1Result
      };
    }

    // 2. If Tier 1 Gate strictly passes 100% byte equality
    if (tier1Result.passed) {
      return {
        verdict: 'EXECUTION_MATCHED',
        is_equivalent: true,
        score: 1.0,
        tier1_passed: true,
        tier2_passed: true,
        divergence_points: [],
        contract_message: CONTRACT_MESSAGES.EXECUTION_MATCHED,
        tier1: tier1Result
      };
    }

    // If strict byte equality is strictly required, stop here
    if (this.options.requireStrictByteEquality) {
      return {
        verdict: 'EXECUTION_DIVERGED',
        is_equivalent: false,
        score: tier1Result.score,
        tier1_passed: false,
        tier2_passed: false,
        divergence_points: tier1Result.divergence_index !== undefined ? [{
          index: tier1Result.divergence_index,
          category: 'STRICT_BYTE_CHECK',
          description: tier1Result.divergence_reason || 'Strict byte equality mismatch',
          production_value: null,
          local_value: null,
          attribution_reason: 'code'
        }] : [],
        contract_message: CONTRACT_MESSAGES.EXECUTION_DIVERGED,
        tier1: tier1Result
      };
    }

    // 3. Fall back to Tier 2 Rubric for Semantic Equivalence
    const tier2Result = evaluateTier2Rubric(recorded, replayed, this.options);

    return {
      verdict: tier2Result.verdict,
      is_equivalent: tier2Result.is_equivalent,
      score: tier2Result.match_score,
      tier1_passed: false,
      tier2_passed: tier2Result.is_equivalent,
      divergence_points: tier2Result.divergence_points,
      contract_message: CONTRACT_MESSAGES[tier2Result.verdict],
      tier1: tier1Result,
      tier2: tier2Result
    };
  }
}

/**
 * Functional entrypoint for two-tier comparison.
 */
export function compareExecutions(
  recorded: unknown,
  replayed: unknown,
  options: ComparatorOptions = {}
): EquivalenceVerdictResult {
  const comparator = new TwoTierComparator(options);
  return comparator.compare(recorded, replayed);
}
