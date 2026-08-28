/**
 * Repro Interaction Unit Type Definitions
 * Specification: ADR-002, ADR-003, ADR-004, SDD-Repro §4, Story-02, Story-03
 */

export type InteractionCategory =
  | 'HTTP_INBOUND'
  | 'HTTP_OUTBOUND'
  | 'POSTGRES_QUERY'
  | 'FEATURE_FLAG'
  | 'CLOCK_TICK'
  | 'RUNTIME_ENV';

export interface BaseInteractionUnit {
  interaction_id: string; // e.g. "int_01HZX89J4..."
  sequence_idx: number; // Monotonic sequence index 0..N (U0..Un)
  category: InteractionCategory;
  timestamp_offset_ms: number; // Milliseconds delta from T0
  duration_ms: number;
  redacted: boolean;
  truncated: boolean; // True if exceeds SEC-008 limits (100 rows / 64 KB)
}

export interface InboundRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: string | null;
  query_params?: Record<string, string | string[]>;
  client_ip?: string;
}

export interface InboundInteraction extends BaseInteractionUnit {
  category: 'HTTP_INBOUND';
  data: InboundRequest;
}

export interface OutboundInteractionData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
  url: string;
  headers: Record<string, string>;
  request_body?: string;
  response: {
    status_code: number;
    headers: Record<string, string>;
    body: string;
  };
}

export interface OutboundInteraction extends BaseInteractionUnit {
  category: 'HTTP_OUTBOUND';
  data: OutboundInteractionData;
}

export type HttpOutboundInteraction = OutboundInteraction;

export interface DatabaseField {
  name: string;
  dataTypeID: number;
}

export interface DatabaseQueryResult {
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | string;
  row_count: number;
  rows: Record<string, unknown>[];
  fields?: DatabaseField[];
}

export interface DatabaseInteractionData {
  normalized_sql: string; // Parameter placeholders normalized ($1, $2)
  sql_fingerprint: string; // SHA-256 hash of normalized SQL
  parameters: Array<string | number | boolean | null | unknown>;
  result: DatabaseQueryResult;
  occurrence_index: number; // N-th occurrence of this query in execution context
}

export interface DatabaseInteraction extends BaseInteractionUnit {
  category: 'POSTGRES_QUERY';
  data: DatabaseInteractionData;
}

export type PostgresQueryInteraction = DatabaseInteraction;

export interface ClockInteractionData {
  timestamp_ms: number; // Unix timestamp in ms
  hrtime_bigint?: string;
  tick_count?: number;
  is_frozen?: boolean;
}

export interface ClockInteraction extends BaseInteractionUnit {
  category: 'CLOCK_TICK';
  data: ClockInteractionData;
}

export interface FlagInteractionData {
  flag_name: string;
  flag_key?: string;
  value: boolean | string | number | Record<string, unknown>;
  provider?: string;
  evaluation_context?: Record<string, unknown>;
}

export interface FlagInteraction extends BaseInteractionUnit {
  category: 'FEATURE_FLAG';
  data: FlagInteractionData;
}

export interface RedactionRecord {
  field_path: string; // JSONPath or object path, e.g. "request.body.password"
  strategy: 'MASK' | 'DROP' | 'HASH' | 'SUBSTITUTE' | string;
  original_type?: string;
  pattern_matched?: string;
  masked_value_preview?: string;
}

export type InteractionUnit =
  | InboundInteraction
  | OutboundInteraction
  | DatabaseInteraction
  | ClockInteraction
  | FlagInteraction
  | BaseInteractionUnit;
