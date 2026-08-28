/**
 * 12 Side-Effect Leakage Test Cases: T1–T12 Safety Matrix (ADR-005, MTP §5.3)
 * Inviolable Requirement: escaped_side_effects == 0 across all scenarios
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  L1AstSqlFilter,
  HttpVerbGuard,
  FallbackGuard,
  HttpVerbBlockedError,
  UnrecordedInteractionFallbackError,
} from '@repro/replay';

describe('Security — T1–T12 Side-Effect Leakage Matrix (ADR-005, MTP §5.3)', () => {
  let escapedSideEffectsCount = 0;
  const filter = new L1AstSqlFilter();

  it('T1: Read-only SELECT query -> ALLOWED (0 escaped side effects)', () => {
    const classification = filter.classify('SELECT id, name FROM users WHERE active = true');
    assert.equal(classification.isReadOnly, true);
  });

  it('T2: INSERT statement -> BLOCKED by L1 AST filter', () => {
    const classification = filter.classify("INSERT INTO users (name) VALUES ('attacker')");
    assert.equal(classification.isReadOnly, false);
    if (classification.isReadOnly) escapedSideEffectsCount++;
  });

  it('T3: UPDATE statement -> BLOCKED by L1 AST filter', () => {
    const classification = filter.classify("UPDATE accounts SET balance = 1000000 WHERE id = 'att_1'");
    assert.equal(classification.isReadOnly, false);
    if (classification.isReadOnly) escapedSideEffectsCount++;
  });

  it('T4: DELETE statement -> BLOCKED by L1 AST filter', () => {
    const classification = filter.classify('DELETE FROM audit_logs WHERE id > 0');
    assert.equal(classification.isReadOnly, false);
    if (classification.isReadOnly) escapedSideEffectsCount++;
  });

  it('T5: DDL statements (DROP, TRUNCATE, ALTER) -> BLOCKED by L1 AST filter', () => {
    const dropRes = filter.classify('DROP TABLE users CASCADE');
    const truncRes = filter.classify('TRUNCATE TABLE transactions');
    const alterRes = filter.classify('ALTER TABLE accounts DROP COLUMN balance');

    assert.equal(dropRes.isReadOnly, false);
    assert.equal(truncRes.isReadOnly, false);
    assert.equal(alterRes.isReadOnly, false);

    if (dropRes.isReadOnly || truncRes.isReadOnly || alterRes.isReadOnly) {
      escapedSideEffectsCount++;
    }
  });

  it('T6: Mutating CTE (WITH ... DELETE/UPDATE) -> BLOCKED by L1 AST filter', () => {
    const cteRes = filter.classify(
      'WITH deleted_users AS (DELETE FROM users RETURNING id) SELECT count(*) FROM deleted_users'
    );
    assert.equal(cteRes.isReadOnly, false);
    if (cteRes.isReadOnly) escapedSideEffectsCount++;
  });

  it('T7: Outbound HTTP GET -> ALLOWED (0 escaped side effects)', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('GET'), true);
    assert.equal(HttpVerbGuard.isSafeVerb('HEAD'), true);
  });

  it('T8: Outbound HTTP POST -> BLOCKED by HttpVerbGuard', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('POST'), false);
    assert.throws(() => HttpVerbGuard.assertSafeVerb('POST', 'https://api.gateway.com/charge'));
  });

  it('T9: Outbound HTTP DELETE -> BLOCKED by HttpVerbGuard', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('DELETE'), false);
    assert.throws(() => HttpVerbGuard.assertSafeVerb('DELETE', 'https://api.gateway.com/user/1'));
  });

  it('T10: Unrecorded PostgreSQL interaction -> BLOCKED by Rule E9', () => {
    assert.throws(() => {
      FallbackGuard.assertNoFallback('POSTGRES_QUERY', 'postgres://prod-db:5432/orders');
    }, (err: unknown) => err instanceof UnrecordedInteractionFallbackError);
  });

  it('T11: Unrecorded HTTP interaction -> BLOCKED by Rule E9', () => {
    assert.throws(() => {
      FallbackGuard.assertNoFallback('HTTP_OUTBOUND', 'https://api.external.com/v1/resource');
    }, (err: unknown) => err instanceof UnrecordedInteractionFallbackError);
  });

  it('T12: Hostile host injection -> BLOCKED by Rule E9', () => {
    assert.throws(() => {
      FallbackGuard.assertNoFallback('HTTP_OUTBOUND', 'http://169.254.169.254/latest/meta-data/');
    }, (err: unknown) => err instanceof UnrecordedInteractionFallbackError);
  });

  it('Composite Invariant: Total escaped side effects across T1–T12 is 0', () => {
    assert.equal(escapedSideEffectsCount, 0, 'Inviolable contract failed: escaped_side_effects must be strictly 0');
  });
});
