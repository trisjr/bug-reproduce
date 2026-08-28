/**
 * Repro Capsule Reader v1 (.repro.tar.gz)
 * Specification: ADR-002, ADR-012, Spec-Security (SEC-027 Digest-Before-Parse, THREAT-009)
 */

import { promises as fs } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import type { ReproManifest } from '../types/manifest.ts';
import type { InteractionUnit } from '../types/interaction.ts';
import type { RuntimeMetadata } from '../types/runtime.ts';
import { assertValidManifest } from '../schemas/manifest.schema.ts';
import { parseInteractionJsonLines } from '../schemas/interaction.schema.ts';
import { assertPayloadIntegrity, computeSha256 } from '../crypto/integrity.ts';
import { unpackTar } from './tar.ts';

export interface ReadCapsuleResult {
  manifest: ReproManifest;
  interactions: InteractionUnit[];
  runtimeMetadata: RuntimeMetadata;
  checksums: Record<string, string>;
}

/**
 * Safe JSON parse that neutralizes prototype pollution attempts (__proto__, constructor).
 */
function safeJsonParse<T>(text: string): T {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  }) as T;
}

/**
 * Parses the standard checksums.sha256 file into a key-value map.
 */
function parseChecksumsTable(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  for (const line of lines) {
    const match = /^([a-fA-F0-9]{64})\s+(.+)$/.exec(line);
    if (match) {
      const [, hash, filename] = match;
      result[filename.trim()] = hash.toLowerCase();
    }
  }

  return result;
}

/**
 * Reads, verifies, and unpacks a Repro Capsule v1 archive (.repro.tar.gz).
 * Enforces SEC-027 Verify-Before-Parse: verifies payload HMAC digest prior to deserializing interaction units.
 *
 * @param capsulePath Path to the .repro.tar.gz file
 * @param dek Optional Data Encryption Key if payload files are envelope-encrypted
 * @param hmacKey Key for verifying HMAC-SHA256 payload integrity
 */
export async function readCapsule(
  capsulePath: string,
  dek?: Buffer | Uint8Array,
  hmacKey?: Buffer | Uint8Array | string
): Promise<ReadCapsuleResult> {
  if (!capsulePath) {
    throw new Error("Missing required parameter 'capsulePath'.");
  }

  // 1. Read archive file from disk
  const compressedBuffer = await fs.readFile(capsulePath);

  // 2. Decompress GZIP stream
  let tarBuffer: Buffer;
  try {
    tarBuffer = gunzipSync(compressedBuffer);
  } catch (error) {
    throw new Error(`Failed to decompress capsule GZIP archive: ${(error as Error).message}`);
  }

  // 3. Unpack tar entries (safe against zip-slip & decompression bombs)
  const entries = unpackTar(tarBuffer);
  const fileMap = new Map<string, Buffer>();
  for (const entry of entries) {
    fileMap.set(entry.name, entry.data);
  }

  // 4. Verify presence of manifest.json
  const manifestBuffer = fileMap.get('manifest.json');
  if (!manifestBuffer) {
    throw new Error("Invalid capsule: Missing required 'manifest.json' entry.");
  }

  // 5. Parse and validate manifest schema
  let rawManifest: unknown;
  try {
    rawManifest = safeJsonParse(manifestBuffer.toString('utf8'));
  } catch (error) {
    throw new Error(`Failed to parse 'manifest.json': ${(error as Error).message}`);
  }

  assertValidManifest(rawManifest);
  const manifest: ReproManifest = rawManifest;

  // 6. Verify checksums.sha256 if present
  const checksumsBuffer = fileMap.get('checksums.sha256');
  let checksums: Record<string, string> = {};
  if (checksumsBuffer) {
    checksums = parseChecksumsTable(checksumsBuffer.toString('utf8'));
    for (const [filename, expectedHash] of Object.entries(checksums)) {
      const fileData = fileMap.get(filename);
      if (fileData) {
        const actualHash = computeSha256(fileData);
        if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
          throw new Error(
            `Integrity check failed: Checksum mismatch for entry '${filename}'. Expected ${expectedHash}, got ${actualHash}.`
          );
        }
      }
    }
  }

  // 7. SEC-027 Verify-Before-Parse
  const interactionsBuffer = fileMap.get('interactions.jsonl');
  if (hmacKey && interactionsBuffer) {
    const expectedDigest = manifest.integrity?.payload_hmac_sha256;
    if (expectedDigest) {
      assertPayloadIntegrity(interactionsBuffer, expectedDigest, hmacKey);
    }
  }

  // 8. Parse interactions.jsonl
  let interactions: InteractionUnit[] = [];
  if (interactionsBuffer && interactionsBuffer.length > 0) {
    interactions = parseInteractionJsonLines(interactionsBuffer.toString('utf8'));
  }

  // 9. Parse runtime_metadata.json
  const runtimeBuffer = fileMap.get('runtime_metadata.json');
  let runtimeMetadata: RuntimeMetadata = {
    node: { version: process.version },
    git: { branch: 'unknown', commit: manifest.target_commit },
    os: { platform: process.platform, arch: process.arch, release: '' },
    env: { allowlist: [], variables: {}, redacted_keys: [] },
    captured_at: manifest.created_at,
  };

  if (runtimeBuffer && runtimeBuffer.length > 0) {
    try {
      runtimeMetadata = safeJsonParse<RuntimeMetadata>(runtimeBuffer.toString('utf8'));
    } catch {
      // Keep default initialized structure if malformed
    }
  }

  return {
    manifest,
    interactions,
    runtimeMetadata,
    checksums,
  };
}
