/**
 * Repro Envelope Encryption Primitives (AES-256-GCM)
 * Specification: ADR-002, ADR-012, SDD-Repro §4.2, Spec-Security (SEC-015, SEC-016)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { Buffer } from 'node:buffer';

export class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

export class DecryptionError extends CryptoError {
  constructor(message = 'Decryption failed: Authentication tag mismatch or corrupted ciphertext.') {
    super(message);
    this.name = 'DecryptionError';
  }
}

export interface EncryptedPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

export const AES_KEY_BYTES = 32; // 256 bits
export const AES_IV_BYTES = 12; // 96 bits standard for GCM
export const AES_AUTH_TAG_BYTES = 16; // 128 bits
export const AES_ALGORITHM = 'aes-256-gcm';

/**
 * Generates a CSPRNG 256-bit Data Encryption Key (DEK).
 */
export function generateDek(): Buffer {
  return randomBytes(AES_KEY_BYTES);
}

/**
 * Encrypts a payload using AES-256-GCM with a 12-byte CSPRNG IV and a 16-byte Auth Tag.
 *
 * @param plaintext Data to encrypt (Buffer, Uint8Array, or string)
 * @param dek 256-bit (32-byte) Data Encryption Key
 * @returns { ciphertext: Buffer, iv: Buffer, authTag: Buffer }
 */
export function encryptPayload(
  plaintext: Buffer | Uint8Array | string,
  dek: Buffer | Uint8Array
): EncryptedPayload {
  const dekBuf = Buffer.isBuffer(dek) ? dek : Buffer.from(dek);
  if (dekBuf.length !== AES_KEY_BYTES) {
    throw new CryptoError(
      `Invalid DEK length: Expected ${AES_KEY_BYTES} bytes (256-bit), got ${dekBuf.length} bytes.`
    );
  }

  const plainBuf = typeof plaintext === 'string'
    ? Buffer.from(plaintext, 'utf8')
    : (Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext));

  const iv = randomBytes(AES_IV_BYTES);
  const cipher = createCipheriv(AES_ALGORITHM, dekBuf, iv, {
    authTagLength: AES_AUTH_TAG_BYTES,
  });

  const ciphertextChunk1 = cipher.update(plainBuf);
  const ciphertextChunk2 = cipher.final();
  const ciphertext = Buffer.concat([ciphertextChunk1, ciphertextChunk2]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv,
    authTag,
  };
}

/**
 * Decrypts an AES-256-GCM ciphertext using the provided IV, Auth Tag, and DEK.
 * Fails closed if the authentication tag or ciphertext does not match.
 *
 * @param ciphertext Encrypted data buffer
 * @param iv 12-byte IV
 * @param authTag 16-byte Authentication Tag
 * @param dek 32-byte Data Encryption Key
 * @returns Decrypted plaintext Buffer
 */
export function decryptPayload(
  ciphertext: Buffer | Uint8Array,
  iv: Buffer | Uint8Array,
  authTag: Buffer | Uint8Array,
  dek: Buffer | Uint8Array
): Buffer {
  const dekBuf = Buffer.isBuffer(dek) ? dek : Buffer.from(dek);
  if (dekBuf.length !== AES_KEY_BYTES) {
    throw new CryptoError(
      `Invalid DEK length: Expected ${AES_KEY_BYTES} bytes (256-bit), got ${dekBuf.length} bytes.`
    );
  }

  const ivBuf = Buffer.isBuffer(iv) ? iv : Buffer.from(iv);
  if (ivBuf.length !== AES_IV_BYTES) {
    throw new CryptoError(
      `Invalid IV length: Expected ${AES_IV_BYTES} bytes (96-bit), got ${ivBuf.length} bytes.`
    );
  }

  const tagBuf = Buffer.isBuffer(authTag) ? authTag : Buffer.from(authTag);
  if (tagBuf.length !== AES_AUTH_TAG_BYTES) {
    throw new CryptoError(
      `Invalid Auth Tag length: Expected ${AES_AUTH_TAG_BYTES} bytes (128-bit), got ${tagBuf.length} bytes.`
    );
  }

  const cipherBuf = Buffer.isBuffer(ciphertext) ? ciphertext : Buffer.from(ciphertext);

  try {
    const decipher = createDecipheriv(AES_ALGORITHM, dekBuf, ivBuf, {
      authTagLength: AES_AUTH_TAG_BYTES,
    });
    decipher.setAuthTag(tagBuf);

    const decryptedChunk1 = decipher.update(cipherBuf);
    const decryptedChunk2 = decipher.final();
    return Buffer.concat([decryptedChunk1, decryptedChunk2]);
  } catch (error) {
    throw new DecryptionError(
      `Decryption failed: Authentication tag verification failed or payload corrupted: ${(error as Error).message}`
    );
  }
}
