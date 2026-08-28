/**
 * Capsule Storage Resolution & File Discovery
 * Specification: EPIC-05, Story-16, SDD-Repro §4.2, §5.2
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Returns the default base directory for storing capsules.
 * Resolves ~ to os.homedir().
 */
export function getDefaultCapsulesDirectory(customDir?: string): string {
  if (customDir && customDir.trim().length > 0) {
    const raw = customDir.trim();
    if (raw.startsWith('~')) {
      return path.join(os.homedir(), raw.slice(1));
    }
    return path.resolve(raw);
  }

  const envDir = process.env.REPRO_DIR || process.env.REPRO_HOME;
  if (envDir && envDir.trim().length > 0) {
    const raw = envDir.trim();
    if (raw.startsWith('~')) {
      return path.join(os.homedir(), raw.slice(1));
    }
    return path.resolve(raw);
  }

  return path.join(os.homedir(), '.repro', 'capsules');
}

/**
 * Formats a byte size into human-readable representation (e.g., "12.4 KB", "1.5 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0 || Number.isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Lists all .repro.tar.gz or .tar.gz capsule files in a directory.
 */
export async function listLocalCapsuleFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.repro.tar.gz') || entry.name.endsWith('.tar.gz') || entry.name.endsWith('.repro'))) {
        files.push(path.join(directory, entry.name));
      }
    }

    return files.sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Resolves a capsule ID or file path to an absolute path on disk.
 * Searches in:
 * 1. Exact path if file exists
 * 2. Custom directory if provided
 * 3. Default ~/.repro/capsules
 * 4. Local ./.repro/capsules and ./
 */
export async function resolveCapsulePath(capsuleIdOrPath: string, customDir?: string): Promise<string> {
  const trimmed = capsuleIdOrPath.trim();

  // 1. Direct path check
  try {
    const stats = await fs.stat(trimmed);
    if (stats.isFile()) {
      return path.resolve(trimmed);
    }
  } catch {
    // Continue search
  }

  // Common candidate file names
  const candidates = [
    trimmed,
    `${trimmed}.repro.tar.gz`,
    `${trimmed}.tar.gz`,
    `cap_${trimmed}.repro.tar.gz`,
    `cap_${trimmed}.tar.gz`,
    `capsule_${trimmed}.repro.tar.gz`,
  ];

  // Search directories in order
  const searchDirs: string[] = [];
  if (customDir) {
    searchDirs.push(getDefaultCapsulesDirectory(customDir));
  }
  searchDirs.push(getDefaultCapsulesDirectory());
  searchDirs.push(path.resolve('.repro', 'capsules'));
  searchDirs.push(path.resolve('.repro'));
  searchDirs.push(path.resolve('test', 'fixtures'));
  searchDirs.push(path.resolve('test', 'spike', 'manifests'));
  searchDirs.push(process.cwd());

  for (const dir of searchDirs) {
    for (const candidate of candidates) {
      const fullPath = path.join(dir, candidate);
      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          return fullPath;
        }
      } catch {
        // Continue
      }
    }
  }

  throw new Error(
    `Capsule not found: "${capsuleIdOrPath}". Searched in:\n` +
      searchDirs.map((d) => `  - ${d}`).join('\n')
  );
}
