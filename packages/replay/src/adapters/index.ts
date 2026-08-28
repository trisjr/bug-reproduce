/**
 * Repro Replay Mock Adapters
 * Specification: ADR-003, ADR-004, ADR-005, Story-10
 */

import type {
  InteractionUnit,
  DatabaseInteraction,
  OutboundInteraction,
  FlagInteraction,
} from '@repro/core';
import { DatabaseMockAdapter } from './db-mock.ts';
import { HttpMockAdapter } from './http-mock.ts';
import { FlagMockAdapter } from './flag-mock.ts';

export * from './db-mock.ts';
export * from './http-mock.ts';
export * from './flag-mock.ts';

export interface MockAdaptersBundle {
  db: DatabaseMockAdapter;
  http: HttpMockAdapter;
  flags: FlagMockAdapter;
  install: () => void;
  uninstall: () => void;
  reset: () => void;
}

/**
 * Creates and initializes all mock adapters from a unified list of recorded interaction units.
 */
export function createMockAdapters(interactions: InteractionUnit[] = []): MockAdaptersBundle {
  const dbInteractions: DatabaseInteraction[] = [];
  const httpInteractions: OutboundInteraction[] = [];
  const flagInteractions: FlagInteraction[] = [];

  for (const item of interactions) {
    if (item.category === 'POSTGRES_QUERY') {
      dbInteractions.push(item as DatabaseInteraction);
    } else if (item.category === 'HTTP_OUTBOUND') {
      httpInteractions.push(item as OutboundInteraction);
    } else if (item.category === 'FEATURE_FLAG') {
      flagInteractions.push(item as FlagInteraction);
    }
  }

  const db = new DatabaseMockAdapter(dbInteractions);
  const http = new HttpMockAdapter(httpInteractions);
  const flags = new FlagMockAdapter(flagInteractions);

  return {
    db,
    http,
    flags,
    install(): void {
      db.activate();
      http.install();
    },
    uninstall(): void {
      db.deactivate();
      http.uninstall();
    },
    reset(): void {
      db.reset();
      http.reset();
    },
  };
}
