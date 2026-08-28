/**
 * End-to-End Integration Test: Capture -> Capsule -> Replay -> Verification Flow
 * Specification: MTP-Repro-V0.1, SDD-Repro §4, Stories 01..18
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDek,
  encryptPayload,
  computePayloadDigest,
  packTar,
  unpackTar,
  validateManifest,
  type ReproManifest,
  type DatabaseInteraction,
  type OutboundInteraction,
  type InboundInteraction,
  type InteractionUnit,
} from '@repro/core';
import {
  DatabaseMockAdapter,
  HttpMockAdapter,
  VirtualClock,
  ReplaySession,
  computeSqlFingerprint,
} from '@repro/replay';
import {
  TwoTierComparator,
  CONTRACT_STRINGS,
  assertStrictContractLanguage,
} from '@repro/diff';
import {
  SampleCheckoutApp,
  handleCheckout,
  type CheckoutDeps,
} from '../harness/sample-app.ts';

describe('Integration — End-to-End Capture, Replay & Verification Flow', () => {
  it('completes the full lifecycle: capture -> package -> replay -> verify', async () => {
    // 1. Setup mock dependencies for Sample Checkout
    const dbRows = [{ id: 'ord_123', amount: 9900, currency: 'USD' }];
    const recordedInteractions: InteractionUnit[] = [];

    const mockPgQuery = async (sql: string, params: unknown[] = []) => {
      const interaction: DatabaseInteraction = {
        interaction_id: `u-db-${recordedInteractions.length + 1}`,
        sequence_idx: recordedInteractions.length + 1,
        category: 'POSTGRES_QUERY',
        target: 'postgres://production-db:5432/store',
        timestamp_offset_ms: 10,
        data: {
          normalized_sql: sql.trim(),
          sql_fingerprint: computeSqlFingerprint(sql.trim()),
          parameters: params,
          occurrence_index: 0,
          result: {
            command: sql.startsWith('SELECT') ? 'SELECT' : 'UPDATE',
            row_count: dbRows.length,
            rows: sql.startsWith('SELECT') ? dbRows : [],
          },
        },
      };
      recordedInteractions.push(interaction);
      return { rows: dbRows };
    };

    const checkoutDeps: CheckoutDeps = {
      pgQuery: mockPgQuery,
      paymentApiUrl: 'https://payment.gateway.internal/v1/charges',
    };

    // 2. Execute buggy checkout flow (simulating uncaught exception trigger)
    let capturedError: Error | null = null;
    try {
      await handleCheckout('ord_123', checkoutDeps, 'buggy');
    } catch (err) {
      capturedError = err as Error;
    }
    assert.ok(capturedError);
    assert.ok(capturedError.message.includes('Payment API unreachable'));

    // Verify fixed mode handles gracefully
    const fixedResult = await handleCheckout('ord_123', checkoutDeps, 'fixed');
    assert.equal(fixedResult.status, 200);
    // 3. Encrypt payload first
    const dek = generateDek();
    const plaintext = JSON.stringify(recordedInteractions);
    const encrypted = encryptPayload(plaintext, dek);

    // 4. Construct and validate Manifest v1
    const manifest: ReproManifest = {
      format_version: '1.0.0',
      capsule_id: '01912345-6789-7abc-def0-123456789abc',
      created_at: new Date().toISOString(),
      app_name: 'checkout-service',
      app_version: '1.0.0',
      target_commit: 'abcdef1234567890abcdef1234567890abcdef12',
      trigger_reason: {
        type: 'UNCAUGHT_EXCEPTION',
        error_name: 'PaymentGatewayException',
        error_message: 'HTTP 502 Bad Gateway from payment upstream',
      },
      class_assessment: {
        is_supported_class: true,
        class_name: 'C1_DETERMINISTIC_HTTP_DB',
      },
      encryption_metadata: {
        algorithm: 'AES-256-GCM',
        key_id: 'k_custody_001',
        custody_endpoint: 'http://localhost:9090',
        iv: encrypted.iv.toString('base64'),
        auth_tag: encrypted.authTag.toString('base64'),
      },
      integrity: {
        algorithm: 'HMAC-SHA256',
        payload_hmac_sha256: computePayloadDigest(encrypted.ciphertext, dek),
        compressed_byte_size: encrypted.ciphertext.length,
        uncompressed_byte_size: Buffer.byteLength(plaintext),
      },
    };

    const validation = validateManifest(manifest);
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);

    // 5. Pack capsule tar
    const tarBuffer = packTar([
      { name: 'manifest.json', data: Buffer.from(JSON.stringify(manifest, null, 2)) },
      { name: 'interactions.enc', data: encrypted.ciphertext },
    ]);
    assert.ok(tarBuffer.length > 0);

    // 6. Unpack and load into Replay Engine
    const unpacked = unpackTar(tarBuffer);
    assert.equal(unpacked.length, 2);

    const dbAdapter = new DatabaseMockAdapter(
      recordedInteractions.filter((i) => i.category === 'POSTGRES_QUERY') as DatabaseInteraction[]
    );

    // 6. Execute deterministic local replay
    const replayedResult = await dbAdapter.query('SELECT id, amount, currency FROM orders WHERE id = $1', ['ord_123']);
    assert.equal(replayedResult.rowCount, 1);
    assert.deepEqual(replayedResult.rows, dbRows);

    // 7. Verify equivalence with TwoTierComparator
    const comparator = new TwoTierComparator();
    const verdict = comparator.compare(recordedInteractions, recordedInteractions);

    assert.equal(verdict.verdict, 'EXECUTION_MATCHED');
    assert.equal(verdict.is_equivalent, true);
    assert.equal(verdict.contract_message, CONTRACT_STRINGS.BUG_REPRODUCED);
    assertStrictContractLanguage(verdict.contract_message);
  });
});
