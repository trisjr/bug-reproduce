/**
 * Repro Database Replay Mock Adapter (PostgreSQL)
 * Specification: ADR-003, ADR-005, ADR-007, Story-10 (FR-029, FR-030, FR-033)
 * Zero external dependencies: Uses Node.js built-in APIs and @repro/core
 */

import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type {
  DatabaseInteraction,
  DatabaseQueryResult,
  DatabaseField,
} from '@repro/core';

/**
 * Error thrown when an unrecorded database interaction occurs during replay (Fail-Closed, Rule E9).
 */
export class UnrecordedDatabaseInteractionError extends Error {
  public readonly code = 'REPRO_UNRECORDED_INTERACTION';
  public readonly normalizedSql: string;
  public readonly sqlFingerprint: string;
  public readonly parameters: unknown[];
  public readonly occurrenceIndex: number;

  constructor(
    message: string,
    details: {
      normalizedSql: string;
      sqlFingerprint: string;
      parameters?: unknown[];
      occurrenceIndex?: number;
    }
  ) {
    super(
      message ||
        `Unrecorded PostgreSQL interaction: "${details.normalizedSql}". Fail-closed: No real database fallback allowed (ADR-003, Rule E9).`
    );
    this.name = 'UnrecordedDatabaseInteractionError';
    this.normalizedSql = details.normalizedSql;
    this.sqlFingerprint = details.sqlFingerprint;
    this.parameters = details.parameters ?? [];
    this.occurrenceIndex = details.occurrenceIndex ?? 0;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnrecordedDatabaseInteractionError);
    }
  }
}

/**
 * Normalizes SQL by trimming and collapsing whitespace into single spaces.
 */
export function normalizeSql(sql: string): string {
  if (!sql || typeof sql !== 'string') return '';
  return sql.trim().replace(/\s+/g, ' ');
}

/**
 * Computes SHA-256 fingerprint hex string for normalized SQL.
 */
export function computeSqlFingerprint(normalizedSql: string): string {
  return createHash('sha256').update(normalizedSql).digest('hex');
}

/**
 * Canonicalizes parameters for deterministic comparison.
 */
export function canonicalizeParameters(params: unknown[]): string {
  if (!params || !Array.isArray(params)) return '[]';
  return JSON.stringify(params, (_key, value) => {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

/**
 * Standard PostgreSQL query result returned by pg.Client.prototype.query.
 */
export interface PgQueryResult<T = Record<string, unknown>> {
  command: string;
  rowCount: number;
  rows: T[];
  fields: DatabaseField[];
}

/**
 * Parsed parameters from various pg.query() overload signatures.
 */
export interface ParsedQueryParams {
  text: string;
  values: unknown[];
  callback?: (err: Error | null, result?: PgQueryResult) => void;
}

/**
 * Parses variable arguments passed to pg.query.
 */
export function parseQueryParams(
  queryTextOrConfig: string | { text: string; values?: unknown[]; callback?: Function },
  valuesOrCallback?: unknown[] | Function,
  callbackArg?: Function
): ParsedQueryParams {
  let text = '';
  let values: unknown[] = [];
  let callback: ((err: Error | null, result?: PgQueryResult) => void) | undefined;

  if (typeof queryTextOrConfig === 'string') {
    text = queryTextOrConfig;
    if (Array.isArray(valuesOrCallback)) {
      values = valuesOrCallback;
      if (typeof callbackArg === 'function') {
        callback = callbackArg as (err: Error | null, result?: PgQueryResult) => void;
      }
    } else if (typeof valuesOrCallback === 'function') {
      callback = valuesOrCallback as (err: Error | null, result?: PgQueryResult) => void;
    }
  } else if (queryTextOrConfig && typeof queryTextOrConfig === 'object') {
    text = queryTextOrConfig.text || '';
    if (Array.isArray(queryTextOrConfig.values)) {
      values = queryTextOrConfig.values;
    } else if (Array.isArray(valuesOrCallback)) {
      values = valuesOrCallback;
    }

    if (typeof queryTextOrConfig.callback === 'function') {
      callback = queryTextOrConfig.callback as (err: Error | null, result?: PgQueryResult) => void;
    } else if (typeof valuesOrCallback === 'function') {
      callback = valuesOrCallback as (err: Error | null, result?: PgQueryResult) => void;
    } else if (typeof callbackArg === 'function') {
      callback = callbackArg as (err: Error | null, result?: PgQueryResult) => void;
    }
  }

  return { text, values, callback };
}

/**
 * DatabaseMockAdapter manages PostgreSQL interactions recorded in a capsule
 * and provides sub-millisecond deterministic mock query responses.
 */
export class DatabaseMockAdapter {
  private readonly interactions: DatabaseInteraction[] = [];
  private readonly fingerprintOccurrences = new Map<string, number>();
  private readonly consumedInteractionIds = new Set<string>();
  private active = false;

  constructor(interactions: DatabaseInteraction[] = []) {
    this.interactions = [...interactions].sort((a, b) => a.sequence_idx - b.sequence_idx);
  }

  /**
   * Loads or replaces the active database interactions.
   */
  public loadInteractions(interactions: DatabaseInteraction[]): void {
    this.interactions.length = 0;
    this.interactions.push(...[...interactions].sort((a, b) => a.sequence_idx - b.sequence_idx));
    this.reset();
  }

  /**
   * Resets internal consumption state and occurrence counters.
   */
  public reset(): void {
    this.fingerprintOccurrences.clear();
    this.consumedInteractionIds.clear();
  }

  /**
   * Retrieves remaining unconsumed interactions.
   */
  public getRemainingInteractions(): DatabaseInteraction[] {
    return this.interactions.filter((i) => !this.consumedInteractionIds.has(i.interaction_id));
  }

  /**
   * Matches an incoming query against recorded interactions and returns the recorded result in < 1ms.
   * Throws UnrecordedDatabaseInteractionError if no recorded interaction matches.
   */
  public matchAndExecute<T = Record<string, unknown>>(
    sql: string,
    parameters: unknown[] = []
  ): PgQueryResult<T> {
    const normalized = normalizeSql(sql);
    const fingerprint = computeSqlFingerprint(normalized);
    const paramsCanonical = canonicalizeParameters(parameters);

    const currentOccurrence = this.fingerprintOccurrences.get(fingerprint) ?? 0;
    this.fingerprintOccurrences.set(fingerprint, currentOccurrence + 1);

    // Strategy 1: Match by (fingerprint OR normalized_sql) + parameters canonical + occurrence index
    let matched: DatabaseInteraction | undefined = this.interactions.find(
      (i) =>
        !this.consumedInteractionIds.has(i.interaction_id) &&
        (i.data.sql_fingerprint === fingerprint || normalizeSql(i.data.normalized_sql) === normalized) &&
        canonicalizeParameters(i.data.parameters) === paramsCanonical &&
        i.data.occurrence_index === currentOccurrence
    );

    // Strategy 2: Match by (fingerprint OR normalized_sql) + parameters canonical in FIFO sequence
    if (!matched) {
      matched = this.interactions.find(
        (i) =>
          !this.consumedInteractionIds.has(i.interaction_id) &&
          (i.data.sql_fingerprint === fingerprint || normalizeSql(i.data.normalized_sql) === normalized) &&
          canonicalizeParameters(i.data.parameters) === paramsCanonical
      );
    }

    // Strategy 3: Match by (fingerprint OR normalized_sql) alone in FIFO sequence
    if (!matched) {
      matched = this.interactions.find(
        (i) =>
          !this.consumedInteractionIds.has(i.interaction_id) &&
          (i.data.sql_fingerprint === fingerprint || normalizeSql(i.data.normalized_sql) === normalized)
      );
    }
    if (!matched) {
      throw new UnrecordedDatabaseInteractionError(
        `REPRO_UNRECORDED_INTERACTION: No recorded database interaction found for query "${normalized}" with params ${paramsCanonical}`,
        {
          normalizedSql: normalized,
          sqlFingerprint: fingerprint,
          parameters,
          occurrenceIndex: currentOccurrence,
        }
      );
    }

    this.consumedInteractionIds.add(matched.interaction_id);

    const res = matched.data.result;
    return {
      command: res.command || 'SELECT',
      rowCount: res.row_count ?? (res.rows ? res.rows.length : 0),
      rows: (res.rows ? JSON.parse(JSON.stringify(res.rows)) : []) as T[],
      fields: res.fields ? [...res.fields] : [],
    };
  }

  /**
   * Asynchronous query execution compatible with pg.Client / pg.Pool.
   */
  public async query<T = Record<string, unknown>>(
    queryTextOrConfig: string | { text: string; values?: unknown[]; callback?: Function },
    valuesOrCallback?: unknown[] | Function,
    callbackArg?: Function
  ): Promise<PgQueryResult<T>> {
    const { text, values, callback } = parseQueryParams(
      queryTextOrConfig,
      valuesOrCallback,
      callbackArg
    );

    try {
      const result = this.matchAndExecute<T>(text, values);
      if (callback) {
        process.nextTick(() => callback(null, result));
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (callback) {
        process.nextTick(() => callback(error));
      }
      throw error;
    }
  }

  /**
   * Creates a mock PostgreSQL Client instance bound to this adapter.
   */
  public createClient(): MockPgClient {
    return new MockPgClient(this);
  }

  /**
   * Creates a mock PostgreSQL Pool instance bound to this adapter.
   */
  public createPool(): MockPgPool {
    return new MockPgPool(this);
  }

  /**
   * Checks if adapter is actively intercepting.
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Activates the mock adapter.
   */
  public activate(): void {
    this.active = true;
  }

  /**
   * Deactivates the mock adapter.
   */
  public deactivate(): void {
    this.active = false;
  }
}

/**
 * Mock PostgreSQL Client replicating pg.Client behavior during replay.
 */
export class MockPgClient extends EventEmitter {
  private readonly adapter: DatabaseMockAdapter;

  constructor(adapter: DatabaseMockAdapter) {
    super();
    this.adapter = adapter;
  }
  public async connect(callback?: (err?: Error) => void): Promise<void> {
    this.connected = true;
    if (callback) {
      process.nextTick(() => callback());
    }
  }

  public async end(callback?: (err?: Error) => void): Promise<void> {
    this.connected = false;
    this.emit('end');
    if (callback) {
      process.nextTick(() => callback());
    }
  }

  public query<T = Record<string, unknown>>(
    queryTextOrConfig: string | { text: string; values?: unknown[]; callback?: Function },
    valuesOrCallback?: unknown[] | Function,
    callbackArg?: Function
  ): Promise<PgQueryResult<T>> {
    return this.adapter.query<T>(queryTextOrConfig, valuesOrCallback, callbackArg);
  }

  public release(): void {
    // No-op for direct client
  }
}

/**
 * Mock PostgreSQL Pool replicating pg.Pool behavior during replay.
 */
export class MockPgPool extends EventEmitter {
  public totalCount = 10;
  public idleCount = 10;
  public waitingCount = 0;
  private readonly adapter: DatabaseMockAdapter;

  constructor(adapter: DatabaseMockAdapter) {
    super();
    this.adapter = adapter;
  }
  public async connect(
    callback?: (err: Error | null, client?: MockPgClient, release?: () => void) => void
  ): Promise<MockPgClient & { release: () => void }> {
    const client = this.adapter.createClient() as MockPgClient & { release: () => void };
    client.release = () => {
      // Re-add to idle pool if needed
    };

    if (callback) {
      process.nextTick(() => callback(null, client, client.release));
    }
    return client;
  }

  public query<T = Record<string, unknown>>(
    queryTextOrConfig: string | { text: string; values?: unknown[]; callback?: Function },
    valuesOrCallback?: unknown[] | Function,
    callbackArg?: Function
  ): Promise<PgQueryResult<T>> {
    return this.adapter.query<T>(queryTextOrConfig, valuesOrCallback, callbackArg);
  }

  public async end(callback?: () => void): Promise<void> {
    this.emit('remove');
    if (callback) {
      process.nextTick(() => callback());
    }
  }
}
