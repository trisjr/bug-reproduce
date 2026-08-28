/**
 * Repro PostgreSQL Pool Interceptor
 * Specification: ADR-007 (U-01, U-C1), Story-02
 *
 * Monkey-patches pg.Pool.prototype.query.
 * Handles pool-level queries and coordinates with client-hook to prevent double recording.
 */

import { parsePgQueryArgs, normalizeSql, computeSqlFingerprint, extractQueryResult } from './client-hook.ts';
import { executionContextManager } from '../../context/async-storage.ts';
import { generateInteractionId } from '../../context/execution-id.ts';
import { warnIfPgNative } from './native-guard.ts';
import type { DatabaseInteraction } from '@repro/core';

let isPoolPatched = false;
let originalPoolQuery: Function | null = null;
let targetPoolPrototype: Record<string, unknown> | null = null;

// Context flag to prevent nested double-capture between Pool.query and Client.query
let isInsidePoolQuery = false;

export function getIsInsidePoolQuery(): boolean {
  return isInsidePoolQuery;
}

/**
 * Patches pg.Pool.prototype.query to capture pool-level queries.
 */
export function patchPgPool(pgModule?: unknown): boolean {
  if (isPoolPatched) return true;

  try {
    let poolProto: Record<string, unknown> | null = null;

    if (pgModule && typeof pgModule === 'object') {
      warnIfPgNative(pgModule);
      const mod = pgModule as Record<string, unknown>;
      if (mod['Pool'] && typeof mod['Pool'] === 'function') {
        poolProto = (mod['Pool'] as { prototype: Record<string, unknown> }).prototype;
      }
    }

    if (!poolProto) {
      const globalPg = (globalThis as Record<string, unknown>)['__repro_pg_target'];
      if (globalPg && typeof globalPg === 'object') {
        const mod = globalPg as Record<string, unknown>;
        if (mod['Pool'] && typeof mod['Pool'] === 'function') {
          poolProto = (mod['Pool'] as { prototype: Record<string, unknown> }).prototype;
        }
      }
    }

    if (!poolProto || typeof poolProto['query'] !== 'function') {
      return false;
    }

    targetPoolPrototype = poolProto;
    originalPoolQuery = poolProto['query'] as Function;

    const original = originalPoolQuery;

    poolProto['query'] = function interceptedPoolQuery(this: unknown, ...args: unknown[]) {
      if (!executionContextManager.isActive()) {
        return original.apply(this, args);
      }

      // If pool delegates to client.query and client is patched, flag that we are inside pool query
      isInsidePoolQuery = true;
      try {
        const resultPromise = original.apply(this, args);
        if (resultPromise && typeof resultPromise.finally === 'function') {
          return resultPromise.finally(() => {
            isInsidePoolQuery = false;
          });
        }
        isInsidePoolQuery = false;
        return resultPromise;
      } catch (err) {
        isInsidePoolQuery = false;
        throw err;
      }
    };

    isPoolPatched = true;
    return true;
  } catch (err) {
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro PgPoolInterceptor] Failed to patch pg.Pool:', err);
    }
    return false;
  }
}

/**
 * Restores original pg.Pool.prototype.query.
 */
export function unpatchPgPool(pgModule?: unknown): boolean {
  if (!isPoolPatched) return true;

  try {
    let poolProto = targetPoolPrototype;

    if (!poolProto && pgModule && typeof pgModule === 'object') {
      const mod = pgModule as Record<string, unknown>;
      if (mod['Pool'] && typeof mod['Pool'] === 'function') {
        poolProto = (mod['Pool'] as { prototype: Record<string, unknown> }).prototype;
      }
    }

    if (poolProto && originalPoolQuery) {
      poolProto['query'] = originalPoolQuery;
    }

    isPoolPatched = false;
    originalPoolQuery = null;
    targetPoolPrototype = null;
    isInsidePoolQuery = false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if pg.Pool is currently patched.
 */
export function isPgPoolPatched(): boolean {
  return isPoolPatched;
}
