/**
 * Unit Tests for @repro/diff
 * Specification: ADR-006, ADR-011, Story-13, Story-14, Story-15, SDD-Repro §20.16
 * Tests: 4 Normalizers (SQL, URL, JSON, Headers), TwoTierComparator,
 *        Tier1Gate, Tier2Rubric, DivergenceClassifier, SummaryReport Contract Language
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSql,
  normalizeUrl,
  canonicalizeValue,
  normalizeHeaders,
  TwoTierComparator,
  evaluateTier1Gate,
  evaluateTier2Rubric,
  DivergenceClassifier,
  assertStrictContractLanguage,
  CONTRACT_STRINGS,
} from '@repro/diff';
import type { DatabaseInteraction, InboundInteraction } from '@repro/core';

// ─── Normalizer Pipeline (ADR-006) ───────────────────────────────────────────

describe('@repro/diff — Normalizer Pipeline (ADR-006)', () => {
  it('normalizeSql strips comments, collapses whitespace, and uppercases keywords', () => {
    const rawSql = `
      -- Fetch active users
      select  id,  name,  email
      from   users
      where  status = 'active'
      /* order by id */
      order by  id  desc;
    `;
    const normalized = normalizeSql(rawSql);
    assert.equal(normalized, "SELECT id, name, email FROM users WHERE status = 'active' ORDER BY id DESC");
  });

  it('normalizeUrl normalizes query param order and removes redundant slashes', () => {
    const rawUrl = 'https://api.example.com//v1/users/?sort=desc&limit=10&page=1';
    const normalized = normalizeUrl(rawUrl);
    assert.equal(normalized, 'https://api.example.com/v1/users?limit=10&page=1&sort=desc');
  });

  it('canonicalizeValue orders object keys recursively and rounds floats', () => {
    const input = {
      z: 1,
      a: { c: 3, b: 2.123456789 },
      m: [3, 2, 1],
    };
    const canonical = canonicalizeValue(input) as Record<string, unknown>;
    const keys = Object.keys(canonical);
    assert.deepEqual(keys, ['a', 'm', 'z']);

    const nestedA = canonical['a'] as Record<string, unknown>;
    assert.deepEqual(Object.keys(nestedA), ['b', 'c']);
    assert.equal(nestedA['b'], 2.123457); // rounded to 6 decimal places
  });

  it('normalizeHeaders lowercases keys, sorts values, and strips volatile headers', () => {
    const rawHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': 'req-12345',
      Date: 'Mon, 28 Aug 2026 12:00:00 GMT',
      Accept: 'application/json, text/plain',
    };
    const normalized = normalizeHeaders(rawHeaders);
    assert.equal(normalized['content-type'], 'application/json');
    assert.deepEqual(normalized['accept'], ['application/json', 'text/plain']);
    assert.equal(normalized['x-request-id'], undefined);
    assert.equal(normalized['date'], undefined);
  });
});

// ─── Two-Tier Verification Engine (Story-13) ─────────────────────────────────

describe('@repro/diff — Two-Tier Verification Engine (Story-13)', () => {
  it('TwoTierComparator passes Tier 1 on identical recorded vs replayed execution', () => {
    const interaction: DatabaseInteraction = {
      interaction_id: 'u-1',
      sequence_idx: 1,
      category: 'POSTGRES_QUERY',
      target: 'pg://local',
      timestamp_offset_ms: 10,
      data: {
        normalized_sql: 'SELECT id FROM users WHERE id = $1',
        sql_fingerprint: 'abc',
        parameters: [42],
        occurrence_index: 0,
        result: { command: 'SELECT', row_count: 1, rows: [{ id: 42 }] },
      },
    };

    const comparator = new TwoTierComparator();
    const result = comparator.compare([interaction], [interaction]);

    assert.equal(result.verdict, 'EXECUTION_MATCHED');
    assert.equal(result.is_equivalent, true);
    assert.equal(result.tier1_passed, true);
    assert.equal(result.contract_message, CONTRACT_STRINGS.BUG_REPRODUCED);
  });

  it('TwoTierComparator detects divergence when replayed interaction differs', () => {
    const recorded: DatabaseInteraction = {
      interaction_id: 'u-1',
      sequence_idx: 1,
      category: 'POSTGRES_QUERY',
      target: 'pg://local',
      timestamp_offset_ms: 10,
      data: {
        normalized_sql: 'SELECT id FROM users WHERE id = $1',
        sql_fingerprint: 'abc',
        parameters: [42],
        occurrence_index: 0,
        result: { command: 'SELECT', row_count: 1, rows: [{ id: 42 }] },
      },
    };

    const replayed: DatabaseInteraction = {
      interaction_id: 'u-1',
      sequence_idx: 1,
      category: 'POSTGRES_QUERY',
      target: 'pg://local',
      timestamp_offset_ms: 10,
      data: {
        normalized_sql: 'SELECT id FROM users WHERE id = $1',
        sql_fingerprint: 'abc',
        parameters: [99], // Diverged parameter
        occurrence_index: 0,
        result: { command: 'SELECT', row_count: 0, rows: [] },
      },
    };

    const comparator = new TwoTierComparator();
    const result = comparator.compare([recorded], [replayed]);

    assert.equal(result.verdict, 'EXECUTION_DIVERGED');
    assert.equal(result.tier1_passed, false);
    assert.ok(result.divergence_points.length > 0);
  });
});

// ─── Divergence Attribution & Contract Language (Story-14, Story-15) ─────────

describe('@repro/diff — Attribution & Contract Language (ADR-011, §20.16)', () => {
  it('DivergenceClassifier attributes code change divergence (Step 2)', () => {
    const classifier = new DivergenceClassifier();
    const result = classifier.classify({
      code_diff_present: true,
      first_divergence_point: {
        interaction_index: 0,
        interaction_id: 'u-1',
        category: 'POSTGRES_QUERY',
        reason: 'SQL query changed due to code refactor',
      },
    });

    assert.equal(result.category, 'CODE_CHANGE');
    assert.equal(result.step_matched, 2);
  });

  it('assertStrictContractLanguage allows exact compliant wording', () => {
    assert.doesNotThrow(() => {
      assertStrictContractLanguage(CONTRACT_STRINGS.NO_LONGER_REPRODUCES);
      assertStrictContractLanguage(CONTRACT_STRINGS.BUG_REPRODUCED);
    });
  });

  it('assertStrictContractLanguage throws on forbidden subjective claims (§20.16)', () => {
    assert.throws(() => {
      assertStrictContractLanguage('The production bug is definitely fixed by this commit.');
    }, (err: unknown) => {
      return err instanceof Error && err.message.includes('CONTRACT VIOLATION §20.16');
    });

    assert.throws(() => {
      assertStrictContractLanguage('Confirmed: bug is 100% fixed.');
    }, (err: unknown) => {
      return err instanceof Error && err.message.includes('CONTRACT VIOLATION §20.16');
    });
  });
});
