/**
 * Repro Capsule Writer v1 (.repro.tar.gz)
 * Specification: ADR-002, ADR-012, SDD-Repro §4.2
 */

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import type { ReproManifest } from '../types/manifest.ts';
import type { InteractionUnit } from '../types/interaction.ts';
import type { RuntimeMetadata } from '../types/runtime.ts';
import { serializeInteractionJsonLines } from '../schemas/interaction.schema.ts';
import { computePayloadDigest, computeSha256 } from '../crypto/integrity.ts';
import { packTar, type TarEntry } from './tar.ts';

export interface WriteCapsuleResult {
  capsulePath: string;
  checksums: Record<string, string>;
  digest: string;
  uncompressedSize: number;
  compressedSize: number;
}

/**
 * Packages and writes a Repro Capsule v1 archive (.repro.tar.gz) containing:
 * 1. manifest.json
 * 2. interactions.jsonl
 * 3. runtime_metadata.json
 * 4. checksums.sha256
 *
 * @param destinationPath Path where the .repro.tar.gz file will be created
 * @param manifest ReproManifest descriptor
 * @param interactions Array of InteractionUnits or raw JSONL string
 * @param runtimeMetadata Execution environment metadata
 * @param dek Optional DEK for envelope encryption (if interactions need inline encryption)
 * @param hmacKey Key for computing HMAC-SHA256 payload digest (SEC-027)
 */
export async function writeCapsule(
  destinationPath: string,
  manifest: ReproManifest,
  interactions: InteractionUnit[] | string,
  runtimeMetadata: RuntimeMetadata,
  dek?: Buffer | Uint8Array,
  hmacKey?: Buffer | Uint8Array | string
): Promise<WriteCapsuleResult> {
  if (!destinationPath) {
    throw new Error("Missing required parameter 'destinationPath'.");
  }

  // 1. Prepare interactions.jsonl buffer
  const jsonlString = typeof interactions === 'string'
    ? interactions
    : serializeInteractionJsonLines(interactions);
  const interactionsData = Buffer.from(jsonlString, 'utf8');

  // 2. Prepare runtime_metadata.json buffer
  const runtimeData = Buffer.from(JSON.stringify(runtimeMetadata, null, 2), 'utf8');

  // 3. Compute HMAC-SHA256 payload digest (SEC-027)
  let digest = manifest.integrity?.payload_hmac_sha256 ?? '';
  if (hmacKey) {
    digest = computePayloadDigest(interactionsData, hmacKey);
  }

  // 4. Update manifest with integrity details
  const updatedManifest: ReproManifest = {
    ...manifest,
    integrity: {
      algorithm: 'HMAC-SHA256',
      payload_hmac_sha256: digest,
      uncompressed_byte_size: interactionsData.length + runtimeData.length,
      compressed_byte_size: 0, // updated after compression
      calculated_at: new Date().toISOString(),
    },
  };

  const manifestData = Buffer.from(JSON.stringify(updatedManifest, null, 2), 'utf8');

  // 5. Compute SHA-256 hashes for checksums.sha256 table
  const manifestHash = computeSha256(manifestData);
  const interactionsHash = computeSha256(interactionsData);
  const runtimeHash = computeSha256(runtimeData);

  const checksumsRecord: Record<string, string> = {
    'manifest.json': manifestHash,
    'interactions.jsonl': interactionsHash,
    'runtime_metadata.json': runtimeHash,
  };

  const checksumsContent = [
    `${manifestHash}  manifest.json`,
    `${interactionsHash}  interactions.jsonl`,
    `${runtimeHash}  runtime_metadata.json`,
  ].join('\n') + '\n';
  const checksumsData = Buffer.from(checksumsContent, 'utf8');

  // 6. Pack tarball entries
  const entries: TarEntry[] = [
    { name: 'manifest.json', data: manifestData },
    { name: 'interactions.jsonl', data: interactionsData },
    { name: 'runtime_metadata.json', data: runtimeData },
    { name: 'checksums.sha256', data: checksumsData },
  ];

  const tarBuffer = packTar(entries);

  // 7. Compress with GZIP
  const gzBuffer = gzipSync(tarBuffer, { level: 9 });

  // Update compressed byte size in manifest if needed for caller
  updatedManifest.integrity.compressed_byte_size = gzBuffer.length;

  // 8. Write to destination file
  const parentDir = dirname(destinationPath);
  if (parentDir && parentDir !== '.') {
    await fs.mkdir(parentDir, { recursive: true });
  }

  await fs.writeFile(destinationPath, gzBuffer);

  return {
    capsulePath: destinationPath,
    checksums: checksumsRecord,
    digest,
    uncompressedSize: tarBuffer.length,
    compressedSize: gzBuffer.length,
  };
}
