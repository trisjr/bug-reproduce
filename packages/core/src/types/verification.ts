/**
 * Repro Verification & Divergence Attribution Type Definitions
 * Specification: ADR-006, ADR-011, SDD-Repro §3.9, §3.10, Story-13, Story-14
 */

export type EquivalenceVerdict =
  | 'EXECUTION_MATCHED'
  | 'EXECUTION_DIVERGED'
  | 'INCONCLUSIVE';

export interface Tier1Result {
  passed: boolean;
  is_supported_class: boolean; // ACG-07 Supported Execution Class check
  inconclusive_reasons?: string[];
  execution_class?: string;
}

export interface Tier2Result {
  verdict: EquivalenceVerdict;
  inbound_matched: boolean; // U0 match
  interactions_matched: boolean; // U1..Un match in order & fingerprint
  outcome_matched: boolean; // U_inf match (HTTP status code / exception type)
  match_score: number; // Ratio 0.0 .. 1.0 (Target >= 0.90 per N-05)
  replay_unstable: boolean; // Flagged if K=3 runs produce varying outcomes
}

export type AttributionCategory =
  | 'CODE_CHANGE'
  | 'ENVIRONMENT_DRIFT'
  | 'REDACTION_ARTIFACT'
  | 'UNATTRIBUTED';

export type AttributionReason =
  | 'redaction'
  | 'incomplete-capture'
  | 'truncated'
  | 'version-drift'
  | 'out-of-scope-determinism'
  | 'code'
  | 'unattributed';

export interface DivergencePoint {
  index: number;
  category: string; // e.g. 'POSTGRES_QUERY', 'HTTP_OUTBOUND'
  description: string;
  production_value: unknown;
  local_value: unknown;
  attribution_category?: AttributionCategory;
  attribution_reason: AttributionReason | string;
}

export interface DivergenceReport {
  verdict: EquivalenceVerdict;
  is_in_class: boolean;
  match_score: number; // Ratio 0.0 .. 1.0 (Target >= 0.90 per N-05)
  replay_unstable: boolean;
  tier1: Tier1Result;
  tier2?: Tier2Result;
  divergence_points: DivergencePoint[];
  primary_attribution?: AttributionCategory;
  primary_reason?: AttributionReason | string;
  contract_message: string; // e.g. "✓ Captured execution no longer reproduces" (per §20.16)
}

export type VerificationResult = DivergenceReport;
