/**
 * Tier 2 Verification Rubric — Semantic Equivalence & Divergence Attribution
 * Specification: ADR-006, Story-13, SDD-Repro §3.9
 */

import type {
  InteractionUnit,
  InboundInteraction,
  OutboundInteraction,
  DatabaseInteraction,
  ClockInteraction,
  FlagInteraction,
  Tier2Result,
  DivergencePoint
} from '@repro/core';
import { normalizeInteractionUnit } from './tier1-gate.ts';
import { canonicalizeJson, canonicalizeValue } from '../normalizers/json.ts';

export const REDACTION_MARKERS: Record<string, true> = {
  '<<REPRO_REDACTED>>': true,
  '[REDACTED]': true,
  '***': true,
  'REDACTED': true,
  '<redacted>': true
};

const DEFAULT_TIME_DRIFT_TOLERANCE_MS = 50;
const DEFAULT_MATCH_THRESHOLD = 0.90; // Per N-05 SLA target

export interface Tier2RubricOptions {
  timeDriftToleranceMs?: number;
  matchThreshold?: number;
}

export interface Tier2RubricResult extends Tier2Result {
  is_equivalent: boolean;
  divergence_points: DivergencePoint[];
}

/**
 * Checks if a value represents a known privacy redaction mask.
 */
export function isRedactionMask(val: unknown): boolean {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return REDACTION_MARKERS[trimmed] === true || trimmed.includes('REDACTED');
  }
  return false;
}

/**
 * Checks if two values are semantically equivalent:
 * 1. Exact equality after canonicalization.
 * 2. Redaction mask equivalence (both sides masked).
 * 3. Recursive comparison for objects and arrays.
 */
export function areValuesEquivalent(valA: unknown, valB: unknown): boolean {
  if (valA === valB) return true;

  if (isRedactionMask(valA) && isRedactionMask(valB)) {
    return true;
  }

  if (valA === null || valA === undefined || valB === null || valB === undefined) {
    return valA === valB;
  }

  if (typeof valA === 'number' && typeof valB === 'number') {
    return Math.abs(valA - valB) < 1e-6;
  }

  if (typeof valA !== typeof valB) {
    return false;
  }

  if (Array.isArray(valA) && Array.isArray(valB)) {
    if (valA.length !== valB.length) return false;
    for (let i = 0; i < valA.length; i++) {
      if (!areValuesEquivalent(valA[i], valB[i])) return false;
    }
    return true;
  }

  if (typeof valA === 'object' && typeof valB === 'object') {
    const canonicalA = canonicalizeValue(valA) as Record<string, unknown>;
    const canonicalB = canonicalizeValue(valB) as Record<string, unknown>;

    const keysA = Object.keys(canonicalA);
    const keysB = Object.keys(canonicalB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!(key in canonicalB)) return false;
      if (!areValuesEquivalent(canonicalA[key], canonicalB[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Compares two interaction units semantically, applying:
 * - 50ms virtual clock drift tolerance
 * - Redaction mask equivalence
 * - JSON recursive key permutation tolerance
 */
export function compareUnitsSemantically(
  unitA: Record<string, unknown>,
  unitB: Record<string, unknown>,
  index: number,
  timeDriftToleranceMs: number
): { equivalent: boolean; divergence?: DivergencePoint } {
  const categoryA = unitA.category as string;
  const categoryB = unitB.category as string;

  if (categoryA !== categoryB) {
    return {
      equivalent: false,
      divergence: {
        index,
        category: categoryA || 'UNKNOWN',
        description: `Interaction category mismatch: recorded=${categoryA}, replayed=${categoryB}`,
        production_value: categoryA,
        local_value: categoryB,
        attribution_reason: 'code'
      }
    };
  }

  // Check redaction equivalence
  if (unitA.redacted && unitB.redacted) {
    return { equivalent: true };
  }

  // Check clock tick time drift tolerance
  if (categoryA === 'CLOCK_TICK') {
    const dataA = (unitA.data || {}) as Record<string, unknown>;
    const dataB = (unitB.data || {}) as Record<string, unknown>;
    const tsA = typeof dataA.timestamp_ms === 'number' ? dataA.timestamp_ms : 0;
    const tsB = typeof dataB.timestamp_ms === 'number' ? dataB.timestamp_ms : 0;
    const delta = Math.abs(tsA - tsB);

    if (delta <= timeDriftToleranceMs) {
      return { equivalent: true };
    }
    return {
      equivalent: false,
      divergence: {
        index,
        category: 'CLOCK_TICK',
        description: `Clock drift exceeds ${timeDriftToleranceMs}ms threshold (delta: ${delta}ms)`,
        production_value: tsA,
        local_value: tsB,
        attribution_reason: 'out-of-scope-determinism'
      }
    };
  }

  // Compare normalized data payloads
  const dataA = unitA.data as Record<string, unknown> | undefined;
  const dataB = unitB.data as Record<string, unknown> | undefined;

  if (!areValuesEquivalent(dataA, dataB)) {
    // Check if divergence is due to redaction artifact
    const hasRedactionMask = isRedactionMask(canonicalizeJson(dataA)) || isRedactionMask(canonicalizeJson(dataB));
    const reason = hasRedactionMask ? 'redaction' : 'code';

    return {
      equivalent: false,
      divergence: {
        index,
        category: categoryA,
        description: `Semantic divergence in ${categoryA} data payload`,
        production_value: dataA,
        local_value: dataB,
        attribution_reason: reason
      }
    };
  }

  return { equivalent: true };
}

function extractInteractions(input: unknown): InteractionUnit[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as InteractionUnit[];
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.interactions)) {
      return obj.interactions as InteractionUnit[];
    }
    if (Array.isArray(obj.units)) {
      return obj.units as InteractionUnit[];
    }
  }
  return [];
}

/**
 * Evaluates Tier 2 Rubric across recorded and replayed executions.
 */
export function evaluateTier2Rubric(
  recorded: unknown,
  replayed: unknown,
  options: Tier2RubricOptions = {}
): Tier2RubricResult {
  const tolerance = options.timeDriftToleranceMs ?? DEFAULT_TIME_DRIFT_TOLERANCE_MS;
  const threshold = options.matchThreshold ?? DEFAULT_MATCH_THRESHOLD;

  const recordedUnits = extractInteractions(recorded);
  const replayedUnits = extractInteractions(replayed);

  const normalizedRecorded = recordedUnits.map((u) => normalizeInteractionUnit(u));
  const normalizedReplayed = replayedUnits.map((u) => normalizeInteractionUnit(u));

  const divergencePoints: DivergencePoint[] = [];
  let inboundMatched = true;
  let outcomeMatched = true;

  // 1. Evaluate Inbound U0
  const u0Recorded = normalizedRecorded.find((u) => u.category === 'HTTP_INBOUND');
  const u0Replayed = normalizedReplayed.find((u) => u.category === 'HTTP_INBOUND');

  if (u0Recorded && u0Replayed) {
    const u0Comparison = compareUnitsSemantically(u0Recorded, u0Replayed, 0, tolerance);
    if (!u0Comparison.equivalent) {
      inboundMatched = false;
      if (u0Comparison.divergence) {
        divergencePoints.push(u0Comparison.divergence);
      }
    }
  } else if (u0Recorded && !u0Replayed) {
    inboundMatched = false;
    divergencePoints.push({
      index: 0,
      category: 'HTTP_INBOUND',
      description: 'Missing inbound U0 interaction in replayed execution',
      production_value: u0Recorded,
      local_value: null,
      attribution_reason: 'incomplete-capture'
    });
  }

  // 2. Evaluate Interaction Sequence
  const totalLength = Math.max(normalizedRecorded.length, normalizedReplayed.length);
  let matchedCount = 0;

  for (let i = 0; i < totalLength; i++) {
    const rec = normalizedRecorded[i];
    const rep = normalizedReplayed[i];

    if (rec && rep) {
      const cmp = compareUnitsSemantically(rec, rep, i, tolerance);
      if (cmp.equivalent) {
        matchedCount++;
      } else {
        if (cmp.divergence) {
          divergencePoints.push(cmp.divergence);
        }
      }
    } else if (rec && !rep) {
      divergencePoints.push({
        index: i,
        category: (rec.category as string) || 'UNKNOWN',
        description: `Interaction sequence truncated at index ${i}`,
        production_value: rec,
        local_value: null,
        attribution_reason: 'truncated'
      });
    } else if (!rec && rep) {
      divergencePoints.push({
        index: i,
        category: (rep.category as string) || 'UNKNOWN',
        description: `Unexpected extra interaction produced at index ${i}`,
        production_value: null,
        local_value: rep,
        attribution_reason: 'code'
      });
    }
  }

  // 3. Evaluate Outcome (U_inf) if available in artifact objects
  if (typeof recorded === 'object' && recorded !== null && typeof replayed === 'object' && replayed !== null) {
    const recObj = recorded as Record<string, unknown>;
    const repObj = replayed as Record<string, unknown>;

    if (recObj.outcome !== undefined || repObj.outcome !== undefined) {
      const outcomeA = canonicalizeValue(recObj.outcome);
      const outcomeB = canonicalizeValue(repObj.outcome);
      if (!areValuesEquivalent(outcomeA, outcomeB)) {
        outcomeMatched = false;
        divergencePoints.push({
          index: totalLength,
          category: 'OUTCOME_U_INF',
          description: 'Replay outcome (status/exception) diverged from recorded production outcome',
          production_value: outcomeA,
          local_value: outcomeB,
          attribution_reason: 'code'
        });
      }
    }
  }

  const matchScore = totalLength > 0 ? Number((matchedCount / totalLength).toFixed(4)) : (inboundMatched ? 1.0 : 0.0);
  const interactionsMatched = divergencePoints.length === 0 || (matchedCount === totalLength && totalLength > 0);
  const isEquivalent = inboundMatched && outcomeMatched && (matchScore >= threshold || divergencePoints.length === 0);

  const verdict = isEquivalent ? 'EXECUTION_MATCHED' : 'EXECUTION_DIVERGED';

  return {
    verdict,
    is_equivalent: isEquivalent,
    inbound_matched: inboundMatched,
    interactions_matched: interactionsMatched,
    outcome_matched: outcomeMatched,
    match_score: matchScore,
    replay_unstable: false,
    divergence_points: divergencePoints
  };
}
