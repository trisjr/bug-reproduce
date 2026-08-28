/**
 * Repro Monotonic Execution ID Generator (UUIDv7 - RFC 9562)
 * Specification: ADR-002, ADR-007, Story-01, Story-02
 * Zero external dependencies: Uses node:crypto
 */

import { randomBytes } from 'node:crypto';

// Monotonic state tracking across calls in the same process
let lastTimestampMs = 0;
let sequenceCounter = 0;

/**
 * Generates a strictly monotonic UUIDv7 string.
 *
 * Layout (RFC 9562 §5.7):
 * - 48 bits: Unix timestamp in milliseconds
 * - 4 bits:  Version = 7 (0b0111)
 * - 12 bits: Sequence counter (sub-ms ordering, 0..4095)
 * - 2 bits:  Variant = 0b10 (RFC 4122/9562)
 * - 62 bits: Cryptographically strong pseudo-random data
 *
 * Format: `xxxxxxxx-xxxx-7xxx-[89ab]xxx-xxxxxxxxxxxx`
 */
export function generateExecutionId(): string {
  const now = Date.now();

  if (now > lastTimestampMs) {
    lastTimestampMs = now;
    // Initialize sequence counter with 12-bit random offset or 0
    sequenceCounter = 0;
  } else {
    // If within same millisecond (or clock drifted backwards), increment counter
    sequenceCounter = (sequenceCounter + 1) & 0x0fff;
    if (sequenceCounter === 0) {
      // Counter rolled over within 1ms: increment timestamp artificially to maintain strict monotonicity
      lastTimestampMs += 1;
    }
  }

  const timestamp = lastTimestampMs;
  const seq = sequenceCounter;

  // 10 random bytes for remaining bits (16 bytes total in UUID)
  const rand = randomBytes(10);

  // High 48 bits: timestamp
  const timeHex = timestamp.toString(16).padStart(12, '0');
  const p1 = timeHex.slice(0, 8); // 8 hex chars (32 bits)
  const p2 = timeHex.slice(8, 12); // 4 hex chars (16 bits)

  // 16 bits: version (4 bits = 7) + 12 bits sequence
  const verAndSeq = (0x7000 | (seq & 0x0fff)).toString(16).padStart(4, '0');

  // 16 bits: variant (2 bits = 0b10) + 14 bits random
  const rand0 = rand[0] ?? 0;
  const rand1 = rand[1] ?? 0;
  const variantAndRand = (0x8000 | ((rand0 & 0x3f) << 8) | rand1).toString(16).padStart(4, '0');

  // 48 bits: random bytes 2..7
  const randTail = rand.subarray(2, 8).toString('hex');

  return `${p1}-${p2}-${verAndSeq}-${variantAndRand}-${randTail}`;
}

/**
 * Validates whether a given string is a valid UUIDv7.
 */
export function isValidExecutionId(id: string): boolean {
  if (typeof id !== 'string' || id.length !== 36) {
    return false;
  }
  const uuidv7Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv7Regex.test(id);
}

/**
 * Extracts the millisecond timestamp from a UUIDv7 string.
 */
export function extractTimestampFromExecutionId(id: string): number {
  if (!isValidExecutionId(id)) {
    throw new Error(`Invalid UUIDv7 execution ID: ${id}`);
  }
  const hex = id.replace(/-/g, '').slice(0, 12);
  return parseInt(hex, 16);
}

/**
 * Generates a prefixed interaction ID (e.g. "int_01918...").
 */
export function generateInteractionId(prefix = 'int'): string {
  const uuid = generateExecutionId().replace(/-/g, '');
  return `${prefix}_${uuid}`;
}
