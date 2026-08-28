/**
 * Tier 1 Verification Gate — Strict Byte Equality After Normalization
 * Specification: ADR-006, Story-13, SDD-Repro §3.9
 */

import type {
  InteractionUnit,
  InboundInteraction,
  OutboundInteraction,
  DatabaseInteraction,
  ClockInteraction,
  FlagInteraction,
  Tier1Result
} from '@repro/core';
import { normalizeSql, computeSqlFingerprint } from '../normalizers/sql.ts';
import { normalizeUrl } from '../normalizers/url.ts';
import { canonicalizeJson, canonicalizeValue } from '../normalizers/json.ts';
import { normalizeHeaders } from '../normalizers/headers.ts';

export interface Tier1GateOptions {
  checkSupportedClass?: boolean;
}

export interface Tier1GateResult extends Tier1Result {
  verdict: 'EXECUTION_MATCHED' | 'EXECUTION_DIVERGED' | 'INCONCLUSIVE';
  score: number;
  divergence_index?: number;
  divergence_reason?: string;
  normalized_recorded?: unknown[];
  normalized_replayed?: unknown[];
}

/**
 * Normalizes a single InteractionUnit according to the 4 canonical transformations:
 * 1. SQL Normalization & Fingerprinting
 * 2. URL Templating & Canonical Query Sorting
 * 3. Recursive JSON Key Sorting & Float Normalization
 * 4. Header Lowercasing, Volatile Filtering, Multi-value Sorting
 */
export function normalizeInteractionUnit(unit: InteractionUnit | Record<string, unknown>): Record<string, unknown> {
  if (!unit || typeof unit !== 'object') {
    return {};
  }

  const category = (unit as InteractionUnit).category;
  const clone: Record<string, unknown> = {
    category,
    redacted: Boolean((unit as InteractionUnit).redacted),
    truncated: Boolean((unit as InteractionUnit).truncated)
  };

  if ('sequence_idx' in unit && typeof unit.sequence_idx === 'number') {
    clone.sequence_idx = unit.sequence_idx;
  }

  if (category === 'HTTP_INBOUND') {
    const inbound = (unit as InboundInteraction).data;
    if (inbound) {
      clone.data = {
        method: (inbound.method || 'GET').toUpperCase(),
        url: normalizeUrl(inbound.url || ''),
        headers: normalizeHeaders(inbound.headers),
        body: typeof inbound.body === 'string' ? canonicalizeValue(inbound.body, { parseJsonStrings: true }) : canonicalizeValue(inbound.body),
        query_params: inbound.query_params ? canonicalizeValue(inbound.query_params) : undefined
      };
    }
  } else if (category === 'HTTP_OUTBOUND') {
    const outbound = (unit as OutboundInteraction).data;
    if (outbound) {
      clone.data = {
        method: (outbound.method || 'GET').toUpperCase(),
        url: normalizeUrl(outbound.url || ''),
        headers: normalizeHeaders(outbound.headers),
        request_body: typeof outbound.request_body === 'string' ? canonicalizeValue(outbound.request_body, { parseJsonStrings: true }) : canonicalizeValue(outbound.request_body),
        response: outbound.response ? {
          status_code: outbound.response.status_code,
          headers: normalizeHeaders(outbound.response.headers),
          body: typeof outbound.response.body === 'string' ? canonicalizeValue(outbound.response.body, { parseJsonStrings: true }) : canonicalizeValue(outbound.response.body)
        } : undefined
      };
    }
  } else if (category === 'POSTGRES_QUERY') {
    const db = (unit as DatabaseInteraction).data;
    if (db) {
      const normSql = normalizeSql(db.normalized_sql || '');
      clone.data = {
        normalized_sql: normSql,
        sql_fingerprint: db.sql_fingerprint || computeSqlFingerprint(normSql),
        parameters: canonicalizeValue(db.parameters || []),
        result: canonicalizeValue(db.result || { command: 'SELECT', row_count: 0, rows: [] }),
        occurrence_index: db.occurrence_index ?? 0
      };
    }
  } else if (category === 'FEATURE_FLAG') {
    const flag = (unit as FlagInteraction).data;
    if (flag) {
      clone.data = {
        flag_name: flag.flag_name?.trim() || '',
        flag_key: flag.flag_key?.trim(),
        value: canonicalizeValue(flag.value),
        evaluation_context: canonicalizeValue(flag.evaluation_context)
      };
    }
  } else if (category === 'CLOCK_TICK') {
    const clock = (unit as ClockInteraction).data;
    if (clock) {
      clone.data = {
        timestamp_ms: clock.timestamp_ms,
        tick_count: clock.tick_count ?? 0,
        is_frozen: Boolean(clock.is_frozen)
      };
    }
  } else if ('data' in unit) {
    clone.data = canonicalizeValue(unit.data);
  }

  return canonicalizeValue(clone) as Record<string, unknown>;
}

/**
 * Extracts the array of interaction units from various artifact representations.
 */
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

export function evaluateTier1Gate(
  recorded: unknown,
  replayed: unknown,
  options: Tier1GateOptions = {}
): Tier1GateResult {
  // 1. Inconclusive check on supported execution class (ACG-07 / Story-13 Scenario 2)
  if (options.checkSupportedClass !== false && typeof recorded === 'object' && recorded !== null) {
    const recordedObj = recorded as Record<string, unknown>;
    if (recordedObj.is_supported_class === false) {
      return {
        passed: false,
        is_supported_class: false,
        verdict: 'INCONCLUSIVE',
        score: 0,
        inconclusive_reasons: ['Execution marked as unsupported execution class (ACG-07)']
      };
    }
    if (recordedObj.class_assessment && typeof recordedObj.class_assessment === 'object') {
      const assessment = recordedObj.class_assessment as Record<string, unknown>;
      if (assessment.is_supported === false) {
        return {
          passed: false,
          is_supported_class: false,
          verdict: 'INCONCLUSIVE',
          score: 0,
          inconclusive_reasons: Array.isArray(assessment.reasons) ? assessment.reasons as string[] : ['Unsupported execution class']
        };
      }
    }
  }

  const recordedUnits = extractInteractions(recorded);
  const replayedUnits = extractInteractions(replayed);

  // 2. Normalize both interaction streams
  const normalizedRecorded = recordedUnits.map((u) => normalizeInteractionUnit(u));
  const normalizedReplayed = replayedUnits.map((u) => normalizeInteractionUnit(u));

  // 3. Serialize to canonical JSON bytes
  const recordedJson = canonicalizeJson(normalizedRecorded);
  const replayedJson = canonicalizeJson(normalizedReplayed);

  const recordedBuffer = Buffer.from(recordedJson, 'utf-8');
  const replayedBuffer = Buffer.from(replayedJson, 'utf-8');

  // 4. Strict Byte Equality check
  if (recordedBuffer.length === replayedBuffer.length && Buffer.compare(recordedBuffer, replayedBuffer) === 0) {
    return {
      passed: true,
      is_supported_class: true,
      verdict: 'EXECUTION_MATCHED',
      score: 1.0,
      normalized_recorded: normalizedRecorded,
      normalized_replayed: normalizedReplayed
    };
  }

  // 5. Compute divergence point & score for Tier 1 failure
  const totalLength = Math.max(normalizedRecorded.length, normalizedReplayed.length);
  let matchedCount = 0;
  let firstDivergenceIndex: number | undefined;
  let firstDivergenceReason: string | undefined;

  for (let i = 0; i < totalLength; i++) {
    const rec = normalizedRecorded[i];
    const rep = normalizedReplayed[i];

    if (rec && rep) {
      const recUnitJson = canonicalizeJson(rec);
      const repUnitJson = canonicalizeJson(rep);
      if (recUnitJson === repUnitJson) {
        matchedCount++;
      } else if (firstDivergenceIndex === undefined) {
        firstDivergenceIndex = i;
        firstDivergenceReason = `Strict byte mismatch at index ${i} between recorded and replayed interaction`;
      }
    } else if (firstDivergenceIndex === undefined) {
      firstDivergenceIndex = i;
      firstDivergenceReason = rec
        ? `Replay ended prematurely at index ${i}, expected ${normalizedRecorded.length} interactions`
        : `Replay produced unexpected extra interaction at index ${i}`;
    }
  }

  const score = totalLength > 0 ? Number((matchedCount / totalLength).toFixed(4)) : 0;

  return {
    passed: false,
    is_supported_class: true,
    verdict: 'EXECUTION_DIVERGED',
    score,
    divergence_index: firstDivergenceIndex,
    divergence_reason: firstDivergenceReason,
    normalized_recorded: normalizedRecorded,
    normalized_replayed: normalizedReplayed
  };
}
