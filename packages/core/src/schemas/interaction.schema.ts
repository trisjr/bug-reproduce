/**
 * Repro Interaction Schema Validator v1
 * Specification: ADR-002, ADR-003, ADR-004, SDD-Repro §4
 */

import type {
  InteractionUnit,
  InteractionCategory,
  BaseInteractionUnit,
  InboundInteraction,
  OutboundInteraction,
  DatabaseInteraction,
  ClockInteraction,
  FlagInteraction,
} from '../types/interaction.ts';

export class InteractionValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'InteractionValidationError';
    this.errors = errors;
  }
}

export interface InteractionValidationResult {
  valid: boolean;
  errors: string[];
  interaction?: InteractionUnit;
}

export interface InteractionSequenceValidationResult {
  valid: boolean;
  errors: string[];
  interactions?: InteractionUnit[];
}

const VALID_CATEGORIES: ReadonlySet<string> = new Set([
  'HTTP_INBOUND',
  'HTTP_OUTBOUND',
  'POSTGRES_QUERY',
  'FEATURE_FLAG',
  'CLOCK_TICK',
  'RUNTIME_ENV',
]);

const CATEGORY_ALIAS_MAP: Record<string, InteractionCategory> = {
  http_inbound: 'HTTP_INBOUND',
  inbound: 'HTTP_INBOUND',
  request: 'HTTP_INBOUND',
  http_outbound: 'HTTP_OUTBOUND',
  outbound: 'HTTP_OUTBOUND',
  postgres_query: 'POSTGRES_QUERY',
  database: 'POSTGRES_QUERY',
  db: 'POSTGRES_QUERY',
  query: 'POSTGRES_QUERY',
  feature_flag: 'FEATURE_FLAG',
  flag: 'FEATURE_FLAG',
  clock_tick: 'CLOCK_TICK',
  clock: 'CLOCK_TICK',
  runtime_env: 'RUNTIME_ENV',
  env: 'RUNTIME_ENV',
};

/**
 * Validates a single InteractionUnit object.
 */
export function validateInteractionUnit(data: unknown): InteractionValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['InteractionUnit must be a non-null JSON object.'],
    };
  }

  const record = data as Record<string, unknown>;

  // 1. interaction_id / id
  const interactionId = record.interaction_id ?? record.id;
  if (!interactionId || typeof interactionId !== 'string') {
    errors.push("Missing or invalid 'interaction_id' (or 'id'). Must be a non-empty string.");
  }

  // 2. sequence_idx / seq
  const sequenceIdx = record.sequence_idx ?? record.seq;
  if (typeof sequenceIdx !== 'number' || !Number.isInteger(sequenceIdx) || sequenceIdx < 0) {
    errors.push("Missing or invalid 'sequence_idx' (or 'seq'). Must be a non-negative integer.");
  }

  // 3. category / type
  const rawCategory = record.category ?? record.type;
  let normalizedCategory: InteractionCategory | undefined;
  if (!rawCategory || typeof rawCategory !== 'string') {
    errors.push("Missing or invalid 'category' (or 'type'). Must be a recognized category string.");
  } else {
    const upper = rawCategory.toUpperCase();
    if (VALID_CATEGORIES.has(upper)) {
      normalizedCategory = upper as InteractionCategory;
    } else {
      const mapped = CATEGORY_ALIAS_MAP[rawCategory.toLowerCase()];
      if (mapped) {
        normalizedCategory = mapped;
      } else {
        errors.push(
          `Invalid category '${rawCategory}'. Allowed: ${Array.from(VALID_CATEGORIES).join(', ')}.`
        );
      }
    }
  }

  // 4. timestamp_offset_ms / timestamp
  const rawOffset = record.timestamp_offset_ms ?? record.timestamp;
  let timestampOffsetMs = 0;
  if (rawOffset !== undefined) {
    if (typeof rawOffset !== 'number' || Number.isNaN(rawOffset) || rawOffset < 0) {
      errors.push("Field 'timestamp_offset_ms' (or 'timestamp') must be a non-negative number.");
    } else {
      timestampOffsetMs = rawOffset;
    }
  }

  // 5. duration_ms
  const durationMs = typeof record.duration_ms === 'number' ? record.duration_ms : 0;

  // 6. redacted & truncated
  const redacted = Boolean(record.redacted);
  const truncated = Boolean(record.truncated);

  // 7. payload data
  const payloadData = (record.data ?? record.request ?? record.response ?? record.payload ?? {}) as Record<string, unknown>;

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const base: BaseInteractionUnit = {
    interaction_id: interactionId as string,
    sequence_idx: sequenceIdx as number,
    category: normalizedCategory!,
    timestamp_offset_ms: timestampOffsetMs,
    duration_ms: durationMs,
    redacted,
    truncated,
  };

  let normalizedUnit: InteractionUnit;

  switch (normalizedCategory) {
    case 'HTTP_INBOUND':
      normalizedUnit = {
        ...base,
        category: 'HTTP_INBOUND',
        data: {
          method: (payloadData.method as string) ?? 'GET',
          url: (payloadData.url as string) ?? '/',
          headers: (payloadData.headers as Record<string, string | string[] | undefined>) ?? {},
          body: (payloadData.body as string | null) ?? null,
          query_params: payloadData.query_params as Record<string, string | string[]> | undefined,
          client_ip: payloadData.client_ip as string | undefined,
        },
      } as InboundInteraction;
      break;

    case 'HTTP_OUTBOUND':
      normalizedUnit = {
        ...base,
        category: 'HTTP_OUTBOUND',
        data: {
          method: (payloadData.method as string) ?? 'GET',
          url: (payloadData.url as string) ?? '',
          headers: (payloadData.headers as Record<string, string>) ?? {},
          request_body: payloadData.request_body as string | undefined,
          response: (payloadData.response as OutboundInteraction['data']['response']) ?? {
            status_code: 200,
            headers: {},
            body: '',
          },
        },
      } as OutboundInteraction;
      break;

    case 'POSTGRES_QUERY':
      normalizedUnit = {
        ...base,
        category: 'POSTGRES_QUERY',
        data: {
          normalized_sql: (payloadData.normalized_sql as string) ?? '',
          sql_fingerprint: (payloadData.sql_fingerprint as string) ?? '',
          parameters: (payloadData.parameters as unknown[]) ?? [],
          result: (payloadData.result as DatabaseInteraction['data']['result']) ?? {
            command: 'SELECT',
            row_count: 0,
            rows: [],
          },
          occurrence_index: (payloadData.occurrence_index as number) ?? 0,
        },
      } as DatabaseInteraction;
      break;

    case 'CLOCK_TICK':
      normalizedUnit = {
        ...base,
        category: 'CLOCK_TICK',
        data: {
          timestamp_ms: (payloadData.timestamp_ms as number) ?? Date.now(),
          hrtime_bigint: payloadData.hrtime_bigint as string | undefined,
          tick_count: payloadData.tick_count as number | undefined,
          is_frozen: payloadData.is_frozen as boolean | undefined,
        },
      } as ClockInteraction;
      break;

    case 'FEATURE_FLAG':
      normalizedUnit = {
        ...base,
        category: 'FEATURE_FLAG',
        data: {
          flag_name: (payloadData.flag_name as string) ?? '',
          flag_key: payloadData.flag_key as string | undefined,
          value: (payloadData.value as boolean | string | number | Record<string, unknown>) ?? false,
          provider: payloadData.provider as string | undefined,
          evaluation_context: payloadData.evaluation_context as Record<string, unknown> | undefined,
        },
      } as FlagInteraction;
      break;

    default:
      normalizedUnit = {
        ...base,
        data: payloadData,
      } as InteractionUnit;
      break;
  }

  return {
    valid: true,
    errors: [],
    interaction: normalizedUnit,
  };
}

/**
 * Asserts that data conforms to InteractionUnit.
 */
export function assertValidInteractionUnit(data: unknown): asserts data is InteractionUnit {
  const result = validateInteractionUnit(data);
  if (!result.valid || !result.interaction) {
    throw new InteractionValidationError(
      `Interaction validation failed:\n- ${result.errors.join('\n- ')}`,
      result.errors
    );
  }
}

/**
 * Type guard for InteractionUnit.
 */
export function isInteractionUnit(data: unknown): data is InteractionUnit {
  return validateInteractionUnit(data).valid;
}

/**
 * Validates an array/sequence of interaction units, checking strict monotonicity of sequence_idx.
 */
export function validateInteractionSequence(units: unknown[]): InteractionSequenceValidationResult {
  if (!Array.isArray(units)) {
    return {
      valid: false,
      errors: ['Interaction sequence must be an array of InteractionUnits.'],
    };
  }

  const errors: string[] = [];
  const validatedList: InteractionUnit[] = [];

  for (let i = 0; i < units.length; i++) {
    const res = validateInteractionUnit(units[i]);
    if (!res.valid || !res.interaction) {
      errors.push(`Unit at index ${i} is invalid: ${res.errors.join('; ')}`);
    } else {
      validatedList.push(res.interaction);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    interactions: errors.length === 0 ? validatedList : undefined,
  };
}

/**
 * Parses and validates newline-delimited JSON (JSONL) into InteractionUnit[].
 */
export function parseInteractionJsonLines(jsonl: string): InteractionUnit[] {
  const lines = jsonl.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const units: InteractionUnit[] = [];

  for (let i = 0; i < lines.length; i++) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(lines[i]);
    } catch (err) {
      throw new InteractionValidationError(
        `Failed to parse JSONL line ${i + 1}: ${(err as Error).message}`
      );
    }

    const res = validateInteractionUnit(parsed);
    if (!res.valid || !res.interaction) {
      throw new InteractionValidationError(
        `Invalid InteractionUnit on line ${i + 1}: ${res.errors.join('; ')}`,
        res.errors
      );
    }
    units.push(res.interaction);
  }

  return units;
}

/**
 * Serializes InteractionUnit[] to canonical JSONL string.
 */
export function serializeInteractionJsonLines(interactions: InteractionUnit[]): string {
  return interactions.map((u) => JSON.stringify(u)).join('\n') + (interactions.length > 0 ? '\n' : '');
}
