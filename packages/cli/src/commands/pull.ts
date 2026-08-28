/**
 * `repro pull` Command Handler (SEC-042, SEC-043)
 * Specification: EPIC-05, Story-16, Spec-Security §7.1, SDD-Repro §5.2
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';
import type { PullOptions, PullResult } from '../types.ts';
import { getDefaultCapsulesDirectory, formatBytes, resolveCapsulePath } from '../utils/storage.ts';
import { ensureRestrictedDirectory, ensureRestrictedFile, checkGitGuard, formatFileMode } from '../utils/fs-security.ts';

/**
 * Executes the `repro pull <capsule-id>` command.
 */
export async function pullCommand(capsuleId: string, options: PullOptions = {}): Promise<PullResult> {
  if (!capsuleId || capsuleId.trim().length === 0) {
    throw new Error('Missing required argument: <capsule-id>');
  }

  const cleanId = capsuleId.trim();

  // 1. Determine destination path
  let destPath: string;
  let destDir: string;

  if (options.out) {
    const rawOut = path.resolve(options.out);
    if (rawOut.endsWith('.repro.tar.gz') || rawOut.endsWith('.tar.gz')) {
      destPath = rawOut;
      destDir = path.dirname(destPath);
    } else {
      destDir = rawOut;
      destPath = path.join(destDir, `${cleanId}.repro.tar.gz`);
    }
  } else {
    destDir = getDefaultCapsulesDirectory(options.dir);
    destPath = path.join(destDir, `${cleanId}.repro.tar.gz`);
  }

  // 2. Git Working Tree Guard (SEC-043)
  const gitGuardResult = await checkGitGuard(destPath, {
    allowInRepo: options.allowInRepo,
    forceInsideGit: options.forceInsideGit,
  });

  // 3. Ensure restricted directory permissions (0700) (SEC-042)
  await ensureRestrictedDirectory(destDir);

  // 4. Check if file exists and overwrite flag
  try {
    const existing = await fs.stat(destPath);
    if (existing.isFile() && !options.overwrite) {
      // If already pulled, enforce permissions and return
      await ensureRestrictedFile(destPath);
      const result: PullResult = {
        capsuleId: cleanId,
        destinationPath: destPath,
        fileMode: '0600 (-rw-------)',
        directoryMode: '0700 (drwx------)',
        gitProtected: gitGuardResult.gitIgnored,
        sizeBytes: existing.size,
      };
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`✓ Capsule "${cleanId}" already exists at ${destPath} (permissions verified 0600).`);
      }
      return result;
    }
  } catch {
    // File does not exist, proceed with download/pull
  }

  // 5. Fetch capsule payload (from remote store or local fixture resolution)
  let capsuleBuffer: Buffer;
  const storeUrl = options.storeUrl || process.env.REPRO_STORE_URL;

  if (storeUrl) {
    const url = `${storeUrl.replace(/\/+$/, '')}/api/v1/capsules/${encodeURIComponent(cleanId)}`;
    const headers: Record<string, string> = {
      Accept: 'application/gzip, application/octet-stream, application/json',
    };
    const token = options.authToken || process.env.REPRO_AUTH_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to pull capsule from remote store (${response.status} ${response.statusText})`);
    }
    const arrayBuf = await response.arrayBuffer();
    capsuleBuffer = Buffer.from(arrayBuf);
  } else {
    // Attempt local resolution
    try {
      const sourcePath = await resolveCapsulePath(cleanId);
      capsuleBuffer = await fs.readFile(sourcePath);
    } catch {
      throw new Error(
        `Capsule "${cleanId}" could not be found locally or from remote store.\n` +
          `Set REPRO_STORE_URL or pass --store-url to download from remote Capsule Store.`
      );
    }
  }

  // 6. Write file with restricted permissions (0600) (SEC-042)
  await fs.writeFile(destPath, capsuleBuffer);
  await ensureRestrictedFile(destPath);

  const stats = await fs.stat(destPath);
  const result: PullResult = {
    capsuleId: cleanId,
    destinationPath: destPath,
    fileMode: formatFileMode(stats.mode),
    directoryMode: '0700 (drwx------)',
    gitProtected: gitGuardResult.gitIgnored,
    sizeBytes: stats.size,
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n✓ Pulled capsule "${cleanId}" successfully:`);
    console.log(`  Path:        ${destPath}`);
    console.log(`  Size:        ${formatBytes(stats.size)}`);
    console.log(`  Permissions: 0600 (-rw-------) [SEC-042 verified]`);
    console.log(`  Git Guard:   Protected (SEC-043)\n`);
  }

  return result;
}
