/**
 * @repro/core Unit Tests
 * Manifest v1 validation, AES-256-GCM envelope, HMAC digest-before-parse (SEC-027),
 * memory zeroization (SEC-038), tar pack/unpack zip-slip safe.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import {
  validateManifest,
  assertValidManifest,
  isReproManifest,
  ManifestValidationError,
} from '@repro/core';

import {
  generateDek,
  encryptPayload,
  decryptPayload,
  AES_KEY_BYTES,
  AES_IV_BYTES,
  AES_AUTH_TAG_BYTES,
  DecryptionError,
} from '@repro/core';

import {
  computePayloadDigest,
  verifyPayloadDigest,
  assertPayloadIntegrity,
  computeSha256,
  IntegrityError,
} from '@repro/core';

import {
  zeroizeBuffer,
  shredKey,
} from '@repro/core';

import {
  packTar,
  unpackTar,
  assertSafeEntryPath,
  TarError,
} from '@repro/core';

/** Helper to create a valid manifest object */
function createValidManifest(): Record<string, unknown> {
  return {
    format_version: '1.0.0',
    capsule_id: '01912345-6789-7abc-def0-123456789abc',
    created_at: '2026-01-01T00:00:00.000Z',
    app_name: 'test-app',
    app_version: '1.0.0',
    target_commit: 'abc123def456',
    trigger_reason: {
      type: 'HTTP_5XX',
      error_name: 'Error',
      error_message: 'Internal Server Error',
      status_code: 500,
    },
    class_assessment: {
      is_supported_class: true,
    },
    encryption_metadata: {
      algorithm: 'AES-256-GCM',
      key_id: 'key-ref-001',
      custody_endpoint: 'http://localhost:9090',
      iv: Buffer.alloc(12).toString('base64'),
      auth_tag: Buffer.alloc(16).toString('base64'),
    },
    integrity: {
      algorithm: 'HMAC-SHA256',
      payload_hmac_sha256: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      compressed_byte_size: 1024,
      uncompressed_byte_size: 4096,
    },
  };
}

// ─── Manifest v1 Validation ────────────────────────────────────────────────

describe('@repro/core — Manifest v1 Validation', () => {
  it('validates a well-formed manifest v1', () => {
    const manifest = createValidManifest();
    const result = validateManifest(manifest);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.ok(result.manifest);
    assert.equal(result.manifest.format_version, '1.0.0');
  });

  it('rejects non-object input', () => {
    assert.equal(validateManifest(null).valid, false);
    assert.equal(validateManifest(undefined).valid, false);
    assert.equal(validateManifest('string').valid, false);
    assert.equal(validateManifest(42).valid, false);
  });

  it('rejects missing required fields', () => {
    const result = validateManifest({});
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it('rejects invalid format_version', () => {
    const manifest = createValidManifest();
    manifest.format_version = '2.0.0';
    const result = validateManifest(manifest);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('format_version')));
  });

  it('rejects invalid trigger_reason type', () => {
    const manifest = createValidManifest();
    (manifest.trigger_reason as Record<string, unknown>).type = '';
    const result = validateManifest(manifest);
    assert.equal(result.valid, false);
  });

  it('isReproManifest returns boolean', () => {
    assert.equal(isReproManifest(createValidManifest()), true);
    assert.equal(isReproManifest({}), false);
  });

  it('assertValidManifest throws ManifestValidationError on invalid', () => {
    assert.throws(() => assertValidManifest({}), (err: unknown) => {
      return err instanceof ManifestValidationError;
    });
  });

  it('assertValidManifest does not throw on valid manifest', () => {
    assert.doesNotThrow(() => assertValidManifest(createValidManifest()));
  });
});

// ─── AES-256-GCM Envelope ──────────────────────────────────────────────────

describe('@repro/core — AES-256-GCM Envelope Encryption', () => {
  it('generates a 256-bit DEK (32 bytes)', () => {
    const dek = generateDek();
    assert.equal(dek.length, AES_KEY_BYTES);
    assert.ok(Buffer.isBuffer(dek));
  });

  it('encrypts and decrypts a plaintext payload round-trip', () => {
    const dek = generateDek();
    const plaintext = 'Hello, Repro capsule data!';
    const encrypted = encryptPayload(plaintext, dek);

    assert.ok(encrypted.ciphertext);
    assert.equal(encrypted.iv.length, AES_IV_BYTES);
    assert.equal(encrypted.authTag.length, AES_AUTH_TAG_BYTES);

    const decrypted = decryptPayload(encrypted.ciphertext, encrypted.iv, encrypted.authTag, dek);
    assert.equal(decrypted.toString('utf-8'), plaintext);
  });

  it('produces different ciphertexts for same plaintext (IV randomness)', () => {
    const dek = generateDek();
    const plaintext = 'Same data';
    const a = encryptPayload(plaintext, dek);
    const b = encryptPayload(plaintext, dek);
    assert.notDeepStrictEqual(a.ciphertext, b.ciphertext);
  });

  it('decryption fails with wrong DEK', () => {
    const dek1 = generateDek();
    const dek2 = generateDek();
    const encrypted = encryptPayload('secret', dek1);
    assert.throws(
      () => decryptPayload(encrypted.ciphertext, encrypted.iv, encrypted.authTag, dek2),
      (err: unknown) => err instanceof DecryptionError || err instanceof Error,
    );
  });

  it('decryption fails with tampered ciphertext', () => {
    const dek = generateDek();
    const encrypted = encryptPayload('secret payload', dek);
    const tampered = Buffer.from(encrypted.ciphertext);
    tampered[0] ^= 0xff;
    assert.throws(
      () => decryptPayload(tampered, encrypted.iv, encrypted.authTag, dek),
    );
  });
});

// ─── HMAC Digest-Before-Parse (SEC-027) ────────────────────────────────────

describe('@repro/core — HMAC Digest-Before-Parse (SEC-027)', () => {
  const hmacKey = 'test-hmac-secret-key-32bytes!!!!';
  const payload = '{"data":"test capsule payload"}';

  it('computes HMAC-SHA256 hex digest', () => {
    const digest = computePayloadDigest(payload, hmacKey);
    assert.equal(typeof digest, 'string');
    assert.equal(digest.length, 64); // SHA-256 hex = 64 chars
    // deterministic
    assert.equal(computePayloadDigest(payload, hmacKey), digest);
  });

  it('verifyPayloadDigest returns true for correct digest', () => {
    const digest = computePayloadDigest(payload, hmacKey);
    assert.equal(verifyPayloadDigest(payload, digest, hmacKey), true);
  });

  it('verifyPayloadDigest returns false for wrong digest', () => {
    assert.equal(verifyPayloadDigest(payload, 'deadbeef'.repeat(8), hmacKey), false);
  });

  it('verifyPayloadDigest returns false for wrong key', () => {
    const digest = computePayloadDigest(payload, hmacKey);
    assert.equal(verifyPayloadDigest(payload, digest, 'wrong-key-wrong-key-wrong-key!!!'), false);
  });

  it('assertPayloadIntegrity throws IntegrityError on mismatch', () => {
    assert.throws(
      () => assertPayloadIntegrity(payload, 'bad_digest', hmacKey),
      (err: unknown) => err instanceof IntegrityError,
    );
  });

  it('assertPayloadIntegrity passes on valid digest', () => {
    const digest = computePayloadDigest(payload, hmacKey);
    assert.doesNotThrow(() => assertPayloadIntegrity(payload, digest, hmacKey));
  });

  it('computeSha256 produces consistent hash', () => {
    const hash = computeSha256('hello');
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.equal(computeSha256('hello'), hash);
    assert.notEqual(computeSha256('world'), hash);
  });
});

// ─── Memory Zeroization (SEC-038) ──────────────────────────────────────────

describe('@repro/core — Memory Zeroization (SEC-038)', () => {
  it('zeroizeBuffer fills all bytes with 0x00', () => {
    const buf = Buffer.from([0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe]);
    zeroizeBuffer(buf);
    for (let i = 0; i < buf.length; i++) {
      assert.equal(buf[i], 0x00);
    }
  });

  it('zeroizeBuffer handles empty buffer without error', () => {
    assert.doesNotThrow(() => zeroizeBuffer(Buffer.alloc(0)));
  });

  it('zeroizeBuffer handles Uint8Array', () => {
    const arr = new Uint8Array([1, 2, 3, 4]);
    zeroizeBuffer(arr);
    for (let i = 0; i < arr.length; i++) {
      assert.equal(arr[i], 0x00);
    }
  });

  it('shredKey invokes purge function', async () => {
    let purgedRef = '';
    const result = await shredKey('key-001', async (ref) => {
      purgedRef = ref;
      return true;
    });
    assert.equal(result, true);
    assert.equal(purgedRef, 'key-001');
  });

  it('shredKey throws on empty key reference', async () => {
    await assert.rejects(() => shredKey(''), { message: /Invalid key reference/ });
  });

  it('shredKey returns true without purge function', async () => {
    const result = await shredKey('key-002');
    assert.equal(result, true);
  });
});

// ─── Tar Pack/Unpack — Zip-Slip Safe ───────────────────────────────────────

describe('@repro/core — Tar Pack/Unpack (Zip-Slip Safe)', () => {
  it('packs and unpacks entries round-trip', () => {
    const entries = [
      { name: 'manifest.json', data: Buffer.from('{"format_version":"1.0.0"}') },
      { name: 'interactions.jsonl', data: Buffer.from('{"line":1}\n{"line":2}') },
    ];
    const tarBuf = packTar(entries);
    assert.ok(Buffer.isBuffer(tarBuf));
    assert.ok(tarBuf.length > 0);

    const unpacked = unpackTar(tarBuf);
    assert.equal(unpacked.length, 2);
    assert.equal(unpacked[0].name, 'manifest.json');
    assert.equal(unpacked[0].data.toString('utf-8'), '{"format_version":"1.0.0"}');
    assert.equal(unpacked[1].name, 'interactions.jsonl');
  });

  it('assertSafeEntryPath blocks path traversal (..)', () => {
    assert.throws(
      () => assertSafeEntryPath('../../../etc/passwd'),
      (err: unknown) => err instanceof TarError,
    );
  });

  it('assertSafeEntryPath blocks absolute paths', () => {
    assert.throws(
      () => assertSafeEntryPath('/etc/shadow'),
      (err: unknown) => err instanceof TarError,
    );
  });

  it('assertSafeEntryPath allows safe relative paths', () => {
    assert.doesNotThrow(() => assertSafeEntryPath('manifest.json'));
    assert.doesNotThrow(() => assertSafeEntryPath('data/interactions.jsonl'));
  });

  it('unpack enforces maxBytes decompression bomb limit', () => {
    // Create a tar with an entry claiming huge size but minimal data
    const entry = { name: 'big.bin', data: Buffer.alloc(1024, 0x41) };
    const tarBuf = packTar([entry]);
    // Very low maxBytes should reject
    assert.throws(
      () => unpackTar(tarBuf, { maxBytes: 100 }),
      (err: unknown) => err instanceof TarError,
    );
  });

  it('packs empty entries list', () => {
    const tarBuf = packTar([]);
    assert.ok(Buffer.isBuffer(tarBuf));
    const unpacked = unpackTar(tarBuf);
    assert.equal(unpacked.length, 0);
  });
});
