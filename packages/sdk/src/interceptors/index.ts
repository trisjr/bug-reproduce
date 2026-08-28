/**
 * Repro In-Process Interceptors Aggregator
 * Specification: ADR-007, Story-01, Story-02
 * Zero external dependencies
 */

import { patchPgClient, unpatchPgClient } from './pg/client-hook.ts';
import { patchPgPool, unpatchPgPool } from './pg/pool-hook.ts';
import { patchHttpInbound, unpatchHttpInbound } from './http/inbound-hook.ts';
import { patchHttpOutbound, unpatchHttpOutbound } from './http/outbound-hook.ts';
import { patchClockObserver, unpatchClockObserver } from './clock/clock-hook.ts';

export * from './pg/index.ts';
export * from './http/index.ts';
export * from './clock/index.ts';

export interface InterceptorOptions {
  /**
   * PostgreSQL interception options.
   */
  pg?: {
    enabled?: boolean;
    module?: unknown;
    failClosedOnNative?: boolean;
  };
  /**
   * HTTP inbound / outbound interception options.
   */
  http?: {
    inbound?: boolean;
    outbound?: boolean;
  };
  /**
   * Clock observer options.
   */
  clock?: {
    enabled?: boolean;
  };
}

let interceptorsInstalled = false;

/**
 * Installs Repro in-process interceptors for PG, HTTP, and Clock.
 */
export function installInterceptors(options?: InterceptorOptions): void {
  if (interceptorsInstalled) return;

  const pgOpts = options?.pg;
  const httpOpts = options?.http;
  const clockOpts = options?.clock;

  // 1. PostgreSQL Interceptors
  if (pgOpts?.enabled !== false) {
    patchPgClient(pgOpts?.module);
    patchPgPool(pgOpts?.module);
  }

  // 2. HTTP Inbound & Outbound Interceptors
  if (httpOpts?.inbound !== false) {
    patchHttpInbound();
  }
  if (httpOpts?.outbound !== false) {
    patchHttpOutbound();
  }

  // 3. Clock Observer
  if (clockOpts?.enabled === true) {
    patchClockObserver();
  }

  interceptorsInstalled = true;
}

/**
 * Uninstalls all active Repro interceptors and restores original prototypes.
 */
export function uninstallInterceptors(): void {
  unpatchPgClient();
  unpatchPgPool();
  unpatchHttpInbound();
  unpatchHttpOutbound();
  unpatchClockObserver();

  interceptorsInstalled = false;
}

/**
 * Returns true if interceptors are currently installed.
 */
export function areInterceptorsInstalled(): boolean {
  return interceptorsInstalled;
}
