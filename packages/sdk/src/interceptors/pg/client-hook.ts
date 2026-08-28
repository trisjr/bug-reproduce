/**
 * Repro PostgreSQL Client Interceptor
 * Specification: ADR-007 (U-01, U-C1, U-C2), Story-02 (Scenario 2)
 *
 * Monkey-patches pg.Client.prototype.query to capture:
 * - Normalized SQL template
 * - Query parameters
 * - Duration (ms)
 * - Query result (command, rowCount, rows, fields)
 * - Monotonic sequence index and occurrence index
 */

import { createHash } from 'node:crypto';
import type {
  DatabaseInteraction,
  DatabaseQueryResult,
  DatabaseField,
} from '@repro/core';
import { executionContextManager } from '../../context/async-storage.ts';
import { generateInteractionId } from '../../context/execution-id.ts';
import { warnIfPgNative } from './native-guard.ts';

export const REPRO_PG_INTERCEPTED = Symbol('repro.pg.intercepted');

let isPatched = false;
let originalClientQuery: Function | null = null;
let targetPrototype: Record<string, unknown> | null = null;

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
 * Parses variable argument forms of pg.Client.prototype.query.
 */
export function parsePgQueryArgs(args: unknown[]): {
  sqlText: string;
  parameters: unknown[];
  callback?: Function;
  isConfigObject: boolean;
} {
  const arg0 = args[0];
  const arg1 = args[1];
  const arg2 = args[2];

  let sqlText = '';
  let parameters: unknown[] = [];
  let callback: Function | undefined;
  let isConfigObject = false;

  if (typeof arg0 === 'string') {
    sqlText = arg0;
    if (Array.isArray(arg1)) {
      parameters = arg1;
      if (typeof arg2 === 'function') {
        callback = arg2;
      }
    } else if (typeof arg1 === 'function') {
      callback = arg1;
    }
  } else if (arg0 && typeof arg0 === 'object') {
    const config = arg0 as Record<string, unknown>;
    isConfigObject = true;
    if (typeof config['text'] === 'string') {
      sqlText = config['text'];
    }
    if (Array.isArray(config['values'])) {
      parameters = config['values'];
    } else if (Array.isArray(arg1)) {
      parameters = arg1;
    }
    if (typeof arg1 === 'function') {
      callback = arg1;
    } else if (typeof arg2 === 'function') {
      callback = arg2;
    } else if (typeof config['callback'] === 'function') {
      callback = config['callback'] as Function;
    }
  }

  return { sqlText, parameters, callback, isConfigObject };
}

/**
 * Normalizes pg query result into Repro DatabaseQueryResult.
 */
export function extractQueryResult(result: unknown): DatabaseQueryResult {
  if (!result || typeof result !== 'object') {
    return {
      command: 'UNKNOWN',
      row_count: 0,
      rows: [],
    };
  }

  const res = result as Record<string, unknown>;
  const command = (typeof res['command'] === 'string' ? res['command'] : 'SELECT') as string;
  const rows = Array.isArray(res['rows']) ? (res['rows'] as Record<string, unknown>[]) : [];
  const rowCount = typeof res['rowCount'] === 'number' ? res['rowCount'] : rows.length;

  let fields: DatabaseField[] | undefined;
  if (Array.isArray(res['fields'])) {
    fields = (res['fields'] as Array<{ name?: string; dataTypeID?: number }>).map((f) => ({
      name: String(f.name ?? ''),
      dataTypeID: Number(f.dataTypeID ?? 0),
    }));
  }

  return {
    command,
    row_count: rowCount,
    rows,
    fields,
  };
}

/**
 * Safely records a database interaction to the active execution context.
 */
function recordPgInteraction(
  normalizedSql: string,
  sqlFingerprint: string,
  parameters: unknown[],
  result: unknown,
  startMs: number,
  sequenceIdx: number,
  occurrenceIdx: number,
  offsetMs: number
): void {
  try {
    const queryResult = extractQueryResult(result);

    const interaction: DatabaseInteraction = {
      interaction_id: generateInteractionId('pg'),
      sequence_idx: sequenceIdx,
      category: 'POSTGRES_QUERY',
      timestamp_offset_ms: offsetMs,
      duration_ms: Math.max(0, Date.now() - startMs),
      redacted: false,
      truncated: false,
      data: {
        normalized_sql: normalizedSql,
        sql_fingerprint: sqlFingerprint,
        parameters,
        result: queryResult,
        occurrence_index: occurrenceIdx,
      },
    };

    executionContextManager.recordInteraction(interaction);
  } catch (recErr) {
    // Fail-Safe (§20.7, U-C2): Never disrupt the host application query
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro PgInterceptor] Error recording interaction:', recErr);
    }
  }
}

/**
 * Patches pg.Client.prototype.query to capture database interactions.
 */
export function patchPgClient(pgModule?: unknown): boolean {
  if (isPatched) return true;

  try {
    let clientProto: Record<string, unknown> | null = null;

    if (pgModule && typeof pgModule === 'object') {
      warnIfPgNative(pgModule);
      const mod = pgModule as Record<string, unknown>;
      if (mod['Client'] && typeof mod['Client'] === 'function') {
        clientProto = (mod['Client'] as { prototype: Record<string, unknown> }).prototype;
      }
    }

    // Fallback: try global or ambient pg if passed or available
    if (!clientProto) {
      const globalPg = (globalThis as Record<string, unknown>)['__repro_pg_target'];
      if (globalPg && typeof globalPg === 'object') {
        const mod = globalPg as Record<string, unknown>;
        if (mod['Client'] && typeof mod['Client'] === 'function') {
          clientProto = (mod['Client'] as { prototype: Record<string, unknown> }).prototype;
        }
      }
    }

    if (!clientProto || typeof clientProto['query'] !== 'function') {
      return false;
    }

    targetPrototype = clientProto;
    originalClientQuery = clientProto['query'] as Function;

    const original = originalClientQuery;

    clientProto['query'] = function interceptedClientQuery(this: unknown, ...args: unknown[]) {
      // Check if recursion guard or not active
      if (!executionContextManager.isActive()) {
        return original.apply(this, args);
      }

      const { sqlText, parameters, callback } = parsePgQueryArgs(args);
      const normalizedSql = normalizeSql(sqlText);
      const sqlFingerprint = computeSqlFingerprint(normalizedSql);

      const sequenceIdx = executionContextManager.getNextSequenceIndex();
      const occurrenceIdx = executionContextManager.getQueryOccurrenceIndex(sqlFingerprint);
      const offsetMs = executionContextManager.getTimestampOffsetMs();
      const startMs = Date.now();

      // If callback style
      if (callback) {
        const wrappedCallback = (err: unknown, result: unknown) => {
          if (!err) {
            recordPgInteraction(
              normalizedSql,
              sqlFingerprint,
              parameters,
              result,
              startMs,
              sequenceIdx,
              occurrenceIdx,
              offsetMs
            );
          }
          return callback.call(this, err, result);
        };

        // Replace callback in args
        const modifiedArgs = [...args];
        if (typeof modifiedArgs[1] === 'function') {
          modifiedArgs[1] = wrappedCallback;
        } else if (typeof modifiedArgs[2] === 'function') {
          modifiedArgs[2] = wrappedCallback;
        } else if (
          modifiedArgs[0] &&
          typeof modifiedArgs[0] === 'object' &&
          typeof (modifiedArgs[0] as Record<string, unknown>)['callback'] === 'function'
        ) {
          (modifiedArgs[0] as Record<string, unknown>)['callback'] = wrappedCallback;
        }

        return original.apply(this, modifiedArgs);
      }

      // Promise / Async style
      try {
        const resultPromise = original.apply(this, args);

        if (resultPromise && typeof resultPromise.then === 'function') {
          return resultPromise.then(
            (result: unknown) => {
              recordPgInteraction(
                normalizedSql,
                sqlFingerprint,
                parameters,
                result,
                startMs,
                sequenceIdx,
                occurrenceIdx,
                offsetMs
              );
              return result;
            },
            (error: unknown) => {
              // On error, let error propagate naturally
              throw error;
            }
          );
        }

        return resultPromise;
      } catch (syncErr) {
        throw syncErr;
      }
    };

    isPatched = true;
    return true;
  } catch (err) {
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro PgInterceptor] Failed to patch pg.Client:', err);
    }
    return false;
  }
}

/**
 * Restores original pg.Client.prototype.query.
 */
export function unpatchPgClient(pgModule?: unknown): boolean {
  if (!isPatched) return true;

  try {
    let clientProto = targetPrototype;

    if (!clientProto && pgModule && typeof pgModule === 'object') {
      const mod = pgModule as Record<string, unknown>;
      if (mod['Client'] && typeof mod['Client'] === 'function') {
        clientProto = (mod['Client'] as { prototype: Record<string, unknown> }).prototype;
      }
    }

    if (clientProto && originalClientQuery) {
      clientProto['query'] = originalClientQuery;
    }

    isPatched = false;
    originalClientQuery = null;
    targetPrototype = null;
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if pg.Client is currently patched.
 */
export function isPgClientPatched(): boolean {
  return isPatched;
}
