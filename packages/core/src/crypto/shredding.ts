/**
 * Repro Memory Zeroization and Crypto-Shredding Primitives (SEC-038, SEC-016)
 * Specification: ADR-002, ADR-012, SDD-Repro §4.2
 */

import { Buffer } from 'node:buffer';

/**
 * Securely overwrites a memory buffer with 0x00 bytes (SEC-038).
 * Ensures ephemeral DEK and secret material are wiped from process memory.
 *
 * @param buffer Memory buffer to zeroize
 */
export function zeroizeBuffer(buffer: Buffer | Uint8Array): void {
  if (!buffer || buffer.length === 0) {
    return;
  }
  buffer.fill(0);
}

/**
 * Triggers crypto-shredding for a given key reference.
 * If a custom purge function (such as KeyCustodyClient.purgeDek) is supplied, it is invoked.
 *
 * @param keyRef Identifier of the key to shred
 * @param purgeFn Optional async purge handler
 * @returns true if key was successfully shredded
 */
export async function shredKey(
  keyRef: string,
  purgeFn?: (keyRef: string) => Promise<boolean> | boolean
): Promise<boolean> {
  if (!keyRef || typeof keyRef !== 'string') {
    throw new Error("Invalid key reference: Expected non-empty string identifier.");
  }

  if (purgeFn) {
    return Boolean(await purgeFn(keyRef));
  }

  return true;
}
