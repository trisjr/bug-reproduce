/**
 * Repro Payload Integrity Verification (SEC-027 Digest-Before-Parse)
 * Specification: ADR-002, SDD-Repro §4.2, Spec-Security (SEC-027, THREAT-009)
 */

import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

export class IntegrityError extends Error {
  constructor(message = 'SEC-027 Digest verification failed: Payload integrity compromised or invalid key.') {
    super(message);
    this.name = 'IntegrityError';
  }
}

/**
 * Computes an HMAC-SHA256 digest of a payload buffer.
 *
 * @param buffer Payload data (Buffer, Uint8Array, or string)
 * @param hmacKey Secret key for HMAC computation
 * @returns Hex-encoded HMAC-SHA256 string
 */
export function computePayloadDigest(
  buffer: Buffer | Uint8Array | string,
  hmacKey: Buffer | Uint8Array | string
): string {
  const dataBuf = typeof buffer === 'string'
    ? Buffer.from(buffer, 'utf8')
    : (Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));

  const keyBuf = typeof hmacKey === 'string'
    ? Buffer.from(hmacKey, 'utf8')
    : (Buffer.isBuffer(hmacKey) ? hmacKey : Buffer.from(hmacKey));

  const hmac = createHmac('sha256', keyBuf);
  hmac.update(dataBuf);
  return hmac.digest('hex');
}

/**
 * Verifies that a payload buffer matches the expected HMAC-SHA256 digest.
 * Employs timingSafeEqual to prevent side-channel timing attacks.
 *
 * @param buffer Payload data
 * @param expectedDigest Expected hex-encoded HMAC string
 * @param hmacKey Secret key for HMAC computation
 * @returns true if digest matches, false otherwise
 */
export function verifyPayloadDigest(
  buffer: Buffer | Uint8Array | string,
  expectedDigest: string,
  hmacKey: Buffer | Uint8Array | string
): boolean {
  if (!expectedDigest || typeof expectedDigest !== 'string') {
    return false;
  }

  const actualDigest = computePayloadDigest(buffer, hmacKey);

  try {
    const actualBuf = Buffer.from(actualDigest, 'hex');
    const expectedBuf = Buffer.from(expectedDigest, 'hex');

    if (actualBuf.length !== expectedBuf.length || actualBuf.length === 0) {
      return false;
    }

    return timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Asserts that a payload buffer matches the expected HMAC-SHA256 digest.
 * Throws IntegrityError if verification fails.
 */
export function assertPayloadIntegrity(
  buffer: Buffer | Uint8Array | string,
  expectedDigest: string,
  hmacKey: Buffer | Uint8Array | string
): void {
  const verified = verifyPayloadDigest(buffer, expectedDigest, hmacKey);
  if (!verified) {
    throw new IntegrityError(
      'SEC-027 Digest verification failed: Capsule payload has been tampered with or HMAC key is invalid.'
    );
  }
}

/**
 * Computes plain SHA-256 checksum for a buffer (used in checksums.sha256 table).
 */
export function computeSha256(buffer: Buffer | Uint8Array | string): string {
  const dataBuf = typeof buffer === 'string'
    ? Buffer.from(buffer, 'utf8')
    : (Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));

  return createHash('sha256').update(dataBuf).digest('hex');
}
