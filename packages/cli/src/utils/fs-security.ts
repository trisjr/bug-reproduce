/**
 * File System Security & Git Guard Utilities (SEC-042, SEC-043)
 * Specification: ADR-002, Spec-Security §7.1, Story-16, Story-17
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Ensures strict POSIX permissions 0700 (drwx------) on capsule directories (SEC-042).
 * Fails closed if permissions cannot be enforced.
 */
export async function ensureRestrictedDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true, mode: 0o700 });
    // Explicitly chmod in case umask modified the created directory permissions
    await fs.chmod(dirPath, 0o700);
  } catch (error) {
    throw new Error(
      `[SECURITY ERROR SEC-042] Failed to enforce strict directory permissions (0700) on "${dirPath}": ${(error as Error).message}`
    );
  }
}

/**
 * Ensures strict POSIX permissions 0600 (-rw-------) on capsule files (SEC-042).
 * Fails closed if permissions cannot be enforced.
 */
export async function ensureRestrictedFile(filePath: string): Promise<void> {
  try {
    await fs.chmod(filePath, 0o600);
  } catch (error) {
    throw new Error(
      `[SECURITY ERROR SEC-042] Failed to enforce strict file permissions (0600) on "${filePath}": ${(error as Error).message}`
    );
  }
}

/**
 * Helper to format numeric mode into human-readable octal and string format.
 */
export function formatFileMode(mode: number): string {
  const octal = (mode & 0o777).toString(8).padStart(4, '0');
  const userR = mode & 0o400 ? 'r' : '-';
  const userW = mode & 0o200 ? 'w' : '-';
  const userX = mode & 0o100 ? 'x' : '-';
  const groupR = mode & 0o040 ? 'r' : '-';
  const groupW = mode & 0o020 ? 'w' : '-';
  const groupX = mode & 0o010 ? 'x' : '-';
  const otherR = mode & 0o004 ? 'r' : '-';
  const otherW = mode & 0o002 ? 'w' : '-';
  const otherX = mode & 0o001 ? 'x' : '-';

  return `${octal} (${userR}${userW}${userX}${groupR}${groupW}${groupX}${otherR}${otherW}${otherX})`;
}

/**
 * Finds the nearest Git repository root by walking up parent directories.
 */
export async function findGitRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current !== root) {
    const gitDir = path.join(current, '.git');
    try {
      const stats = await fs.stat(gitDir);
      if (stats.isDirectory() || stats.isFile()) {
        return current;
      }
    } catch {
      // Continue walking up
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

/**
 * Checks if a pattern or directory name is present in a .gitignore file.
 */
export async function isPatternInGitignore(gitignorePath: string, pattern: string): Promise<boolean> {
  try {
    const content = await fs.readFile(gitignorePath, 'utf-8');
    const lines = content.split('\n').map((l) => l.trim());
    return lines.some((line) => {
      if (line.startsWith('#') || line.length === 0) return false;
      return (
        line === pattern ||
        line === `/${pattern}` ||
        line === `${pattern}/` ||
        line === `/${pattern}/` ||
        line === `**/${pattern}` ||
        line === `**/${pattern}/` ||
        line === `*.repro.tar.gz` ||
        line === `*.repro`
      );
    });
  } catch {
    return false;
  }
}

/**
 * Appends .repro/ to the project's .gitignore if not already present.
 */
export async function appendToGitignore(gitignorePath: string, entry = '.repro/'): Promise<void> {
  try {
    let content = '';
    try {
      content = await fs.readFile(gitignorePath, 'utf-8');
    } catch {
      content = '';
    }

    if (!content.endsWith('\n') && content.length > 0) {
      content += '\n';
    }
    content += `\n# Repro confidential capsules (SEC-043)\n${entry}\n*.repro.tar.gz\n`;
    await fs.writeFile(gitignorePath, content, 'utf-8');
  } catch {
    // Ignore if gitignore cannot be updated
  }
}

/**
 * Validates Git Guard (SEC-043): Prevents leaking confidential capsules into Git repositories.
 */
export async function checkGitGuard(
  targetPath: string,
  options: { allowInRepo?: boolean; forceInsideGit?: boolean } = {}
): Promise<{ isInsideGit: boolean; gitIgnored: boolean; gitRoot?: string }> {
  if (options.allowInRepo || options.forceInsideGit) {
    return { isInsideGit: false, gitIgnored: true };
  }

  const resolvedTarget = path.resolve(targetPath);
  const targetDir = path.dirname(resolvedTarget);
  const gitRoot = await findGitRoot(targetDir);

  if (!gitRoot) {
    return { isInsideGit: false, gitIgnored: true };
  }

  // Target is inside a git repository! Check .gitignore
  const gitignorePath = path.join(gitRoot, '.gitignore');
  const isIgnored =
    (await isPatternInGitignore(gitignorePath, '.repro')) ||
    (await isPatternInGitignore(gitignorePath, '.repro/')) ||
    (await isPatternInGitignore(gitignorePath, '*.repro.tar.gz'));

  if (isIgnored) {
    return { isInsideGit: true, gitIgnored: true, gitRoot };
  }

  // If writing to a default .repro directory, automatically add .repro/ to .gitignore
  if (resolvedTarget.includes(`${path.sep}.repro${path.sep}`) || resolvedTarget.endsWith('.repro')) {
    await appendToGitignore(gitignorePath, '.repro/');
    return { isInsideGit: true, gitIgnored: true, gitRoot };
  }

  // Otherwise, refuse to write without explicit flag
  throw new Error(
    `[SECURITY GUARD SEC-043] Refusing to write capsule inside a Git repository ("${gitRoot}") without .gitignore protection.\n` +
      `Writing raw capsules into a Git working tree risks leaking confidential production data.\n` +
      `To resolve:\n` +
      `  1. Add ".repro/" and "*.repro.tar.gz" to ${gitignorePath}, or\n` +
      `  2. Pass "--allow-in-repo" (or "--force-inside-git") to bypass this guard.`
  );
}
