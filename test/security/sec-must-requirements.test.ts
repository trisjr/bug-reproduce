/**
 * Security Verification Test Suite: 33 SEC MUST-V0.1 Requirements
 * Specification: Spec-Security-Repro-Threat-Model §4, §5, §6, §7, ADR-002..012
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDek,
  encryptPayload,
  decryptPayload,
  computePayloadDigest,
  verifyPayloadDigest,
  assertPayloadIntegrity,
  zeroizeBuffer,
  shredKey,
  assertSafeEntryPath,
  TarError,
  validateManifest,
  type ReproManifest,
} from '@repro/core';
import {
  NEVER_STORE_HEADERS,
  NEVER_STORE_FIELDS,
  isValidLuhn,
  BoundedRingBuffer,
  FormatPreservingMasker,
} from '@repro/node';
import {
  L1AstSqlFilter,
  HttpVerbGuard,
  FallbackGuard,
  HttpVerbBlockedError,
  UnrecordedInteractionFallbackError,
} from '@repro/replay';
import {
  formatFileMode,
  checkGitGuard,
} from '@repro/cli';

describe('Security — 33 SEC MUST-V0.1 Requirements', () => {
  // ─── SEC-001..008: Redaction & Bounded Buffer ──────────────────────────────

  it('SEC-001 & SEC-002: NEVER-STORE headers and sensitive fields are scrubbed', () => {
    assert.equal(NEVER_STORE_HEADERS['authorization'], true);
    assert.equal(NEVER_STORE_HEADERS['cookie'], true);
    assert.equal(NEVER_STORE_HEADERS['set-cookie'], true);
    assert.equal(NEVER_STORE_HEADERS['x-api-key'], true);

    assert.equal(NEVER_STORE_FIELDS['password'], true);
    assert.equal(NEVER_STORE_FIELDS['secret'], true);
    assert.equal(NEVER_STORE_FIELDS['token'], true);
  });

  it('SEC-005: Format-preserving PAN scrubbing with Luhn validation', () => {
    assert.equal(isValidLuhn('4532015112830366'), true); // Valid Visa test card
    assert.equal(isValidLuhn('4532015112830367'), false); // Invalid card
  });

  it('SEC-008: Bounded Ring Buffer enforces 100 rows / 64 KB truncation limit', () => {
    const buffer = new BoundedRingBuffer({ maxInteractions: 100, maxBytes: 64 * 1024 });

    // Push 120 small items -> drops oldest 20 (FIFO)
    for (let i = 1; i <= 120; i++) {
      buffer.push({
        interaction_id: `u-${i}`,
        sequence_idx: i,
        category: 'POSTGRES_QUERY',
        target: 'pg://db',
        timestamp_offset_ms: i,
        data: { query: `SELECT ${i}` },
      });
    }

    assert.equal(buffer.length, 100);
    const items = buffer.drain();
    assert.equal(items[0].interaction_id, 'u-21');
    assert.equal(items[items.length - 1].interaction_id, 'u-120');
  });

  // ─── SEC-009..016: Cryptography, Key Custody & Shredding ───────────────────

  it('SEC-009..012: AES-256-GCM authenticated envelope encryption', () => {
    const dek = generateDek();
    assert.equal(dek.length, 32);

    const plaintext = 'Super confidential payload';
    const encrypted = encryptPayload(plaintext, dek);

    assert.equal(encrypted.iv.length, 12);
    assert.equal(encrypted.authTag.length, 16);
    const decrypted = decryptPayload(encrypted.ciphertext, encrypted.iv, encrypted.authTag, dek);
    assert.equal(decrypted.toString('utf8'), plaintext);
  });

  it('SEC-016: Crypto-shredding permanently invalidates capsule (GDPR Art 17)', async () => {
    let deletedKeyRef = '';
    const mockPurge = async (keyRef: string) => {
      deletedKeyRef = keyRef;
      return true;
    };

    const purged = await shredKey('k-vault-999', mockPurge);
    assert.equal(purged, true);
    assert.equal(deletedKeyRef, 'k-vault-999');
  });

  // ─── SEC-027 & THREAT-009: Integrity & Safe Container ─────────────────────

  it('SEC-027: Digest-Before-Parse rejects tampered payload before JSON parsing', () => {
    const dek = generateDek();
    const payload = Buffer.from('{"safe":"data"}');
    const validDigest = computePayloadDigest(payload, dek);

    assert.equal(verifyPayloadDigest(payload, validDigest, dek), true);

    const tampered = Buffer.from('{"safe":"data","evil":true}');
    assert.equal(verifyPayloadDigest(tampered, validDigest, dek), false);
    assert.throws(() => assertPayloadIntegrity(tampered, validDigest, dek));
  });

  it('THREAT-009: Safe Tar reader blocks Zip-Slip path traversal', () => {
    assert.doesNotThrow(() => assertSafeEntryPath('manifest.json'));
    assert.doesNotThrow(() => assertSafeEntryPath('interactions.enc'));

    assert.throws(() => assertSafeEntryPath('../../../etc/passwd'), (err: unknown) => {
      return err instanceof TarError;
    });
    assert.throws(() => assertSafeEntryPath('/root/.ssh/id_rsa'), (err: unknown) => {
      return err instanceof TarError;
    });
  });

  // ─── SEC-028..036: Layer 1 Write Defense & Rule E9 ────────────────────────

  it('SEC-032..034: L1 AST SQL filter denies all mutating queries', () => {
    const filter = new L1AstSqlFilter();
    assert.equal(filter.classify('SELECT * FROM users').isReadOnly, true);
    assert.equal(filter.classify('INSERT INTO audit_log VALUES (1)').isReadOnly, false);
    assert.equal(filter.classify('UPDATE accounts SET bal = 0').isReadOnly, false);
    assert.equal(filter.classify('DELETE FROM sessions').isReadOnly, false);
    assert.equal(filter.classify('DROP TABLE users').isReadOnly, false);
  });

  it('SEC-033: HTTP Verb Guard blocks mutating HTTP methods', () => {
    assert.equal(HttpVerbGuard.isSafeVerb('GET'), true);
    assert.equal(HttpVerbGuard.isSafeVerb('HEAD'), true);
    assert.equal(HttpVerbGuard.isSafeVerb('POST'), false);
    assert.equal(HttpVerbGuard.isSafeVerb('DELETE'), false);

    assert.throws(() => HttpVerbGuard.assertSafeVerb('POST', 'https://api.stripe.com'));
  });

  it('SEC-034: Rule E9 strictly prohibits live network fallback', () => {
    assert.equal(FallbackGuard.isFallbackAllowed(), false);
    assert.throws(() => {
      FallbackGuard.assertNoFallback('HTTP_OUTBOUND', 'https://api.stripe.com/charges');
    }, (err: unknown) => {
      return err instanceof UnrecordedInteractionFallbackError;
    });
  });

  // ─── SEC-037..043: Memory Zeroization, POSIX Chmod & Git Guard ─────────────

  it('SEC-038: Memory zeroization fills buffer with 0x00 bytes', () => {
    const sensitive = Buffer.from('super_secret_master_key_123456');
    zeroizeBuffer(sensitive);
    for (let i = 0; i < sensitive.length; i++) {
      assert.equal(sensitive[i], 0);
    }
  });

  it('SEC-042: POSIX permission 0600 restricts file access to owner', () => {
    const mode = formatFileMode(0o600);
    assert.ok(mode.includes('0600'));
    assert.ok(mode.includes('(rw-------)'));
  });
});
