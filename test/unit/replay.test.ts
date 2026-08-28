/**
 * Unit Tests for @repro/replay
 * Specification: ADR-001, ADR-004, ADR-005, ADR-010, SDD-Repro §4.4
 * Tests: DatabaseMockAdapter, HttpMockAdapter, FlagMockAdapter,
 *        VirtualClock, L1AstSqlFilter, HttpVerbGuard, FallbackGuard
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DatabaseMockAdapter,
  HttpMockAdapter,
  FlagMockAdapter,
  VirtualClock,
  L1AstSqlFilter,
  HttpVerbGuard,
  HttpVerbBlockedError,
  FallbackGuard,
  UnrecordedInteractionFallbackError,
  computeSqlFingerprint,
} from '@repro/replay';
import type { DatabaseInteraction, FlagInteraction } from '@repro/core';

// ─── L1 AST Filter & Write Defense (ADR-005) ─────────────────────────────────

describe('@repro/replay — L1 AST Write Defense (ADR-005)', () => {
  const filter = new L1AstSqlFilter();

  it('allows read-only SELECT queries', () => {
    assert.equal(filter.classify('SELECT * FROM users WHERE id = 1').isReadOnly, true);
    assert.equal(filter.classify('SELECT u.id, o.total FROM users u JOIN orders o ON u.id = o.user_id').isReadOnly, true);
    assert.equal(filter.classify('WITH active_users AS (SELECT id FROM users) SELECT * FROM active_users').isReadOnly, true);
    assert.equal(filter.classify('EXPLAIN SELECT * FROM accounts').isReadOnly, true);
  });

  it('denies mutating DML statements (INSERT, UPDATE, DELETE)', () => {
    assert.equal(filter.classify("INSERT INTO users (name) VALUES ('alice')").isReadOnly, false);
    assert.equal(filter.classify("UPDATE accounts SET balance = 0 WHERE id = 1").isReadOnly, false);
    assert.equal(filter.classify('DELETE FROM sessions WHERE expired = true').isReadOnly, false);
  });

  it('denies destructive DDL statements (DROP, TRUNCATE, ALTER, CREATE)', () => {
    assert.equal(filter.classify('DROP TABLE users CASCADE').isReadOnly, false);
    assert.equal(filter.classify('TRUNCATE TABLE audit_log').isReadOnly, false);
    assert.equal(filter.classify('ALTER TABLE users DROP COLUMN email').isReadOnly, false);
    assert.equal(filter.classify('CREATE TABLE evil (id int)').isReadOnly, false);
  });
});

// ─── HTTP Verb Guard & Fallback Guard ─────────────────────────────────────────

describe('@repro/replay — HTTP Verb Guard & Fallback Guard', () => {
  it('allows idempotent HTTP verbs in replay', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('GET'), true);
    assert.equal(HttpVerbGuard.isSafeVerb('HEAD'), true);
    assert.equal(HttpVerbGuard.isSafeVerb('OPTIONS'), true);
  });

  it('denies non-idempotent HTTP verbs in replay', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('POST'), false);
    assert.equal(HttpVerbGuard.isSafeVerb('PUT'), false);
    assert.equal(HttpVerbGuard.isSafeVerb('DELETE'), false);
    assert.equal(HttpVerbGuard.isSafeVerb('PATCH'), false);
  });

  it('assertSafeVerb throws on non-idempotent verbs', () => {
    assert.doesNotThrow(() => HttpVerbGuard.assertSafeVerb('GET', 'https://api.example.com'));
    assert.throws(
      () => HttpVerbGuard.assertSafeVerb('POST', 'https://api.example.com'),
      (err: unknown) => err instanceof HttpVerbBlockedError
    );
  });

  it('FallbackGuard blocks un-mocked external network fallback (E9 rule)', () => {
    assert.equal(FallbackGuard.isFallbackAllowed(), false);
    assert.throws(() => {
      FallbackGuard.assertNoFallback('HTTP_OUTBOUND', 'https://api.stripe.com/v1/charges');
    }, (err: unknown) => {
      return err instanceof UnrecordedInteractionFallbackError;
    });
  });
});

// ─── Deterministic Virtual Clock (ADR-010) ───────────────────────────────────

describe('@repro/replay — Deterministic Virtual Clock (ADR-010)', () => {
  it('freezes time at T0 and advances monotonically with virtual ticks', () => {
    const t0 = 1700000000000;
    const clock = new VirtualClock({ initialTimeMs: t0 });

    assert.equal(clock.now(), t0);
    assert.equal(clock.nowDate().toISOString(), new Date(t0).toISOString());

    clock.advanceBy(500);
    assert.equal(clock.now(), t0 + 500);

    clock.advanceBy(1500);
    assert.equal(clock.now(), t0 + 2000);
  });

  it('progresses with tick count', () => {
    const clock = new VirtualClock({ initialTimeMs: 1000 });
    assert.equal(clock.getTickCount(), 0);
    clock.advanceBy(100);
    assert.equal(clock.getTickCount(), 1);
    assert.equal(clock.now(), 1100);
  });
});

// ─── Replay Adapters: Database, HTTP & Flags ──────────────────────────────────

describe('@repro/replay — Mock Adapters', () => {
  it('DatabaseMockAdapter matches recorded queries and returns canned rows', async () => {
    const sql = 'SELECT id, balance FROM accounts WHERE user_id = $1';
    const recordedInteractions: DatabaseInteraction[] = [
      {
        interaction_id: 'u-1',
        sequence_idx: 1,
        category: 'POSTGRES_QUERY',
        target: 'postgres://localhost:5432/test',
        timestamp_offset_ms: 10,
        data: {
          normalized_sql: sql,
          sql_fingerprint: computeSqlFingerprint(sql),
          parameters: ['user_42'],
          occurrence_index: 0,
          result: {
            command: 'SELECT',
            row_count: 1,
            rows: [{ id: 1, balance: 1500 }],
          },
        },
      },
    ];

    const dbAdapter = new DatabaseMockAdapter(recordedInteractions);
    const result = await dbAdapter.query(sql, ['user_42']);

    assert.equal(result.rowCount, 1);
    assert.deepEqual(result.rows, [{ id: 1, balance: 1500 }]);
  });

  it('FlagMockAdapter supplies deterministic flag evaluations', () => {
    const flagInteractions: FlagInteraction[] = [
      {
        interaction_id: 'u-2',
        sequence_idx: 1,
        category: 'FEATURE_FLAG',
        target: 'launchdarkly',
        timestamp_offset_ms: 5,
        data: {
          flag_name: 'new-checkout-flow',
          value: true,
          provider: 'launchdarkly',
        },
      },
    ];

    const flagAdapter = new FlagMockAdapter(flagInteractions);
    assert.equal(flagAdapter.getBoolean('new-checkout-flow', false), true);
    assert.equal(flagAdapter.getBoolean('unknown-flag', false), false);
  });
});
