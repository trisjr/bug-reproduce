/**
 * Repro Capsule Structure Validator
 * Specification: ADR-002, SDD-Repro §4.2
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import type { ReproManifest } from '../types/manifest.ts';
import { validateManifest } from '../schemas/manifest.schema.ts';
import { validateInteractionUnit } from '../schemas/interaction.schema.ts';
import { computeSha256 } from '../crypto/integrity.ts';

export interface CapsuleValidationResult {
  valid: boolean;
  errors: string[];
  manifest?: ReproManifest;
}

const REQUIRED_FILES = [
  'manifest.json',
  'interactions.jsonl',
  'runtime_metadata.json',
  'checksums.sha256',
] as const;

/**
 * Validates the structure and integrity of an unpacked capsule directory or in-memory file map.
 *
 * @param source Path to unpacked directory, or map of filename -> Buffer
 */
export async function validateCapsuleStructure(
  source: string | Record<string, Buffer> | Map<string, Buffer>
): Promise<CapsuleValidationResult> {
  const errors: string[] = [];
  const fileMap = new Map<string, Buffer>();

  // 1. Load files into map
  if (typeof source === 'string') {
    try {
      const dirents = await fs.readdir(source, { withFileTypes: true });
      for (const dirent of dirents) {
        if (dirent.isFile()) {
          const content = await fs.readFile(join(source, dirent.name));
          fileMap.set(dirent.name, content);
        }
      }
    } catch (err) {
      return {
        valid: false,
        errors: [`Cannot read capsule directory '${source}': ${(err as Error).message}`],
      };
    }
  } else if (source instanceof Map) {
    for (const [k, v] of source.entries()) {
      fileMap.set(k, v);
    }
  } else if (typeof source === 'object' && source !== null) {
    for (const [k, v] of Object.entries(source)) {
      fileMap.set(k, v);
    }
  } else {
    return {
      valid: false,
      errors: ['Invalid source: Expected directory path string or file buffer map.'],
    };
  }

  // 2. Check for required files
  for (const reqFile of REQUIRED_FILES) {
    if (!fileMap.has(reqFile)) {
      errors.push(`Missing required capsule entry: '${reqFile}'.`);
    }
  }

  if (!fileMap.has('manifest.json')) {
    return { valid: false, errors };
  }

  // 3. Validate manifest.json
  let parsedManifest: ReproManifest | undefined;
  try {
    const raw = JSON.parse(fileMap.get('manifest.json')!.toString('utf8'));
    const manifestRes = validateManifest(raw);
    if (!manifestRes.valid || !manifestRes.manifest) {
      errors.push(...manifestRes.errors.map((e) => `manifest.json: ${e}`));
    } else {
      parsedManifest = manifestRes.manifest;
    }
  } catch (err) {
    errors.push(`Failed to parse 'manifest.json': ${(err as Error).message}`);
  }

  // 4. Validate checksums.sha256
  const checksumsBuf = fileMap.get('checksums.sha256');
  if (checksumsBuf) {
    const lines = checksumsBuf.toString('utf8').split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    for (const line of lines) {
      const match = /^([a-fA-F0-9]{64})\s+(.+)$/.exec(line);
      if (match) {
        const [, expectedHash, filename] = match;
        const targetBuf = fileMap.get(filename.trim());
        if (targetBuf) {
          const actualHash = computeSha256(targetBuf);
          if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
            errors.push(
              `Checksum mismatch for '${filename}': expected ${expectedHash}, computed ${actualHash}.`
            );
          }
        }
      }
    }
  }

  // 5. Validate interactions.jsonl syntax and schema
  const interactionsBuf = fileMap.get('interactions.jsonl');
  if (interactionsBuf && interactionsBuf.length > 0) {
    const lines = interactionsBuf.toString('utf8').split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    for (let i = 0; i < lines.length; i++) {
      try {
        const parsed = JSON.parse(lines[i]);
        const unitRes = validateInteractionUnit(parsed);
        if (!unitRes.valid) {
          errors.push(`interactions.jsonl (line ${i + 1}): ${unitRes.errors.join('; ')}`);
        }
      } catch (err) {
        errors.push(`interactions.jsonl (line ${i + 1}): Invalid JSON: ${(err as Error).message}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    manifest: parsedManifest,
  };
}
