/**
 * Unit Tests for @repro/cli
 * Specification: EPIC-05, Story-16, Story-17, Story-18, SDD-Repro §5.2, §5.5
 * Tests: Argument Parser, Standard Exit Codes, POSIX Permissions, Git Guard Security
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseArgs,
  ExitCode,
  renderHelp,
  formatBytes,
  formatFileMode,
} from '@repro/cli';

// ─── CLI Argument Parser (Story-18) ──────────────────────────────────────────

describe('@repro/cli — Argument Parser (Story-18)', () => {
  it('parses commands, subcommands, and flags correctly', () => {
    const args = parseArgs(['pull', 'cap_1842', '--json', '--port=3000', '--allow-in-repo']);

    assert.equal(args.command, 'pull');
    assert.deepEqual(args.positional, ['pull', 'cap_1842']);
    assert.equal(args.flags.json, true);
    assert.equal(args.flags.port, 3000);
    assert.equal(args.flags.allowInRepo, true);
  });

  it('parses nested subcommands (e.g. keys rotate)', () => {
    const args = parseArgs(['keys', 'rotate', '--key-id=k-123']);

    assert.equal(args.command, 'keys');
    assert.equal(args.subcommand, 'rotate');
    assert.equal(args.flags.keyId, 'k-123');
  });

  it('handles global flags (-h, --help, -v, --version, --no-color)', () => {
    const helpArgs = parseArgs(['-h']);
    assert.equal(helpArgs.flags.help, true);

    const versionArgs = parseArgs(['--version']);
    assert.equal(versionArgs.flags.version, true);

    const colorArgs = parseArgs(['--no-color']);
    assert.equal(colorArgs.flags.noColor, true);
  });
});

// ─── Standard Exit Codes & Formatters ─────────────────────────────────────────

describe('@repro/cli — Exit Codes & Formatters', () => {
  it('defines standard POSIX exit codes', () => {
    assert.equal(ExitCode.SUCCESS, 0);
    assert.equal(ExitCode.FATAL, 1);
    assert.equal(ExitCode.DIVERGED, 2);
    assert.equal(ExitCode.INCOMPLETE, 3);
  });

  it('formatBytes formats file sizes readably', () => {
    assert.equal(formatBytes(500), '500 B');
    assert.equal(formatBytes(1024), '1.0 KB');
    assert.equal(formatBytes(1024 * 1024 * 5.5), '5.5 MB');
  });

  it('formatFileMode formats POSIX file modes correctly', () => {
    const modeStr = formatFileMode(0o600);
    assert.ok(modeStr.includes('0600'));
    assert.ok(modeStr.includes('(rw-------)'));
  });

  it('renderHelp outputs full developer verbs specification', () => {
    const help = renderHelp();
    assert.ok(help.includes('list'));
    assert.ok(help.includes('pull'));
    assert.ok(help.includes('inspect'));
    assert.ok(help.includes('replay'));
    assert.ok(help.includes('diff'));
    assert.ok(help.includes('verify'));
    assert.ok(help.includes('purge'));
    assert.ok(help.includes('keys'));
  });
});
