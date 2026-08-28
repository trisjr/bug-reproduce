/**
 * Pure Node.js CLI Argument Parser & Help Generator (Zero External Dependencies)
 * Specification: EPIC-05, Story-18, SDD-Repro §5.2, §5.5
 */

export interface ParsedArgs {
  command?: string;
  subcommand?: string;
  positional: string[];
  flags: {
    json?: boolean;
    help?: boolean;
    version?: boolean;
    verbose?: boolean;
    noColor?: boolean;
    hard?: boolean;
    allowInRepo?: boolean;
    forceInsideGit?: boolean;
    overwrite?: boolean;
    showInteractions?: boolean;
    strict?: boolean;
    port?: number;
    timeout?: number;
    limit?: number;
    maxWidth?: number;
    host?: string;
    service?: string;
    capsule?: string;
    capsuleId?: string;
    before?: string;
    reason?: string;
    out?: string;
    dir?: string;
    storeUrl?: string;
    authToken?: string;
    keyId?: string;
    [key: string]: unknown;
  };
}

/**
 * Parses raw process.argv tokens into structured commands and flags.
 */
export function parseArgs(rawArgv: string[]): ParsedArgs {
  // Strip node binary and script path if passed
  const argv = rawArgv.slice(rawArgv[0]?.endsWith('node') || rawArgv[0]?.endsWith('bun') ? 2 : 0);

  const parsed: ParsedArgs = {
    positional: [],
    flags: {},
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (!arg) {
      i++;
      continue;
    }

    if (arg === '--') {
      // Everything remaining is positional
      parsed.positional.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const equalIdx = arg.indexOf('=');
      if (equalIdx !== -1) {
        const flagName = arg.slice(2, equalIdx);
        const flagVal = arg.slice(equalIdx + 1);
        assignFlag(parsed.flags, flagName, flagVal);
      } else {
        const flagName = arg.slice(2);
        // Check if next token is a value or another flag
        const nextArg = argv[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          assignFlag(parsed.flags, flagName, nextArg);
          i++; // Consume value
        } else {
          assignFlag(parsed.flags, flagName, true);
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      // Short flag handling
      const shortFlags = arg.slice(1);
      if (shortFlags.length === 1) {
        const flagName = expandShortFlag(shortFlags);
        const nextArg = argv[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-') && !isBooleanShortFlag(shortFlags)) {
          assignFlag(parsed.flags, flagName, nextArg);
          i++;
        } else {
          assignFlag(parsed.flags, flagName, true);
        }
      } else {
        // Group of boolean short flags, e.g. -jvh
        for (const char of shortFlags) {
          assignFlag(parsed.flags, expandShortFlag(char), true);
        }
      }
    } else {
      parsed.positional.push(arg);
    }

    i++;
  }

  // Extract top-level command and potential subcommand
  if (parsed.positional.length > 0) {
    parsed.command = parsed.positional[0]?.toLowerCase();
    if (parsed.positional.length > 1) {
      parsed.subcommand = parsed.positional[1];
    }
  }

  return parsed;
}

function expandShortFlag(short: string): string {
  const map: Record<string, string> = {
    h: 'help',
    v: 'version',
    j: 'json',
    p: 'port',
    s: 'service',
    c: 'capsule',
    o: 'out',
    d: 'dir',
    r: 'reason',
  };
  return map[short] || short;
}

function isBooleanShortFlag(short: string): boolean {
  return short === 'h' || short === 'v' || short === 'j';
}

function assignFlag(flags: Record<string, unknown>, rawName: string, value: unknown): void {
  // Normalize camelCase from kebab-case (e.g. store-url -> storeUrl)
  const camel = rawName.replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());

  if (value === 'true') {
    flags[camel] = true;
  } else if (value === 'false') {
    flags[camel] = false;
  } else if (typeof value === 'string' && /^\d+$/.test(value) && (camel === 'port' || camel === 'timeout' || camel === 'limit' || camel === 'maxWidth')) {
    flags[camel] = Number.parseInt(value, 10);
  } else {
    flags[camel] = value;
  }
}

/**
 * Generates formatted CLI Help documentation.
 */
export function renderHelp(command?: string, color = true): string {
  const bold = (t: string) => (color ? `\x1b[1m${t}\x1b[22m` : t);
  const cyan = (t: string) => (color ? `\x1b[36m${t}\x1b[39m` : t);
  const dim = (t: string) => (color ? `\x1b[2m${t}\x1b[22m` : t);

  if (command === 'list') {
    return [
      bold('NAME:'),
      '  repro list - List local and remote execution capsules',
      '',
      bold('USAGE:'),
      '  repro list [options]',
      '',
      bold('OPTIONS:'),
      '  -s, --service <name>   Filter capsules by service name',
      '  -d, --dir <path>       Directory to search for capsules (default: ~/.repro/capsules)',
      '  -j, --json             Output in machine-readable JSON format',
      '      --limit <number>   Maximum number of capsules to list',
      '      --no-color         Disable ANSI color output',
      '',
    ].join('\n');
  }

  if (command === 'pull') {
    return [
      bold('NAME:'),
      '  repro pull - Pull/download a capsule to local storage (SEC-042, SEC-043)',
      '',
      bold('USAGE:'),
      '  repro pull <capsule-id> [options]',
      '',
      bold('OPTIONS:'),
      '  -o, --out <path>           Destination path or directory',
      '      --allow-in-repo        Allow saving inside a Git repository (SEC-043 bypass)',
      '      --force-inside-git     Alias for --allow-in-repo',
      '      --overwrite            Overwrite existing capsule file',
      '      --store-url <url>      Remote Capsule Store API endpoint',
      '      --auth-token <token>   Bearer authentication token',
      '  -j, --json                 Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  if (command === 'inspect') {
    return [
      bold('NAME:'),
      '  repro inspect - Inspect manifest, interactions, and redaction metadata',
      '',
      bold('USAGE:'),
      '  repro inspect <capsule-id> [options]',
      '',
      bold('OPTIONS:'),
      '      --show-interactions   Display full list of interaction units',
      '  -d, --dir <path>          Search directory for capsule',
      '  -j, --json                Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  if (command === 'replay') {
    return [
      bold('NAME:'),
      '  repro replay - Deterministically replay a captured execution locally',
      '',
      bold('USAGE:'),
      '  repro replay <capsule-id> [options]',
      '',
      bold('OPTIONS:'),
      '  -p, --port <number>        Target application port (default: 3000)',
      '      --host <string>        Target application host (default: 127.0.0.1)',
      '      --timeout <ms>         Replay session timeout in ms (default: 30000)',
      '      --allow-unrecorded     Allow unrecorded read interactions',
      '  -j, --json                 Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  if (command === 'diff') {
    return [
      bold('NAME:'),
      '  repro diff - Display two-column execution diff comparing Recorded vs Local',
      '',
      bold('USAGE:'),
      '  repro diff <capsule-id> [options]',
      '',
      bold('OPTIONS:'),
      '  -p, --port <number>        Target application port for replay',
      '      --max-width <number>   Maximum terminal display width (default: 120)',
      '      --show-all             Show all interactions, not just divergences',
      '  -j, --json                 Output in machine-readable JSON format',
      '      --no-color             Disable ANSI color output',
      '',
    ].join('\n');
  }

  if (command === 'verify') {
    return [
      bold('NAME:'),
      '  repro verify - Verify bug fix against captured execution (Compliant with §20.16)',
      '',
      bold('USAGE:'),
      '  repro verify <capsule-id> [options]',
      '',
      bold('OPTIONS:'),
      '  -p, --port <number>        Target application port',
      '      --timeout <ms>         Replay timeout in milliseconds',
      '  -j, --json                 Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  if (command === 'purge') {
    return [
      bold('NAME:'),
      '  repro purge - Crypto-shred Data Encryption Keys (DEKs) at Key Custody (Story-08)',
      '',
      bold('USAGE:'),
      '  repro purge [--capsule=<id>] [--before=<date>] [--hard] [--reason=<string>]',
      '',
      bold('OPTIONS:'),
      '  -c, --capsule <id>         Target single capsule ID to purge',
      '      --before <date>        Purge all capsules created before date (YYYY-MM-DD)',
      '      --hard                 Delete physical capsule files from disk after shredding DEK',
      '  -r, --reason <string>      Purge audit reason (default: GDPR_EXPLICIT_PURGE)',
      '  -j, --json                 Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  if (command === 'keys') {
    return [
      bold('NAME:'),
      '  repro keys - Manage Data Encryption Keys and inspect Key Custody status',
      '',
      bold('USAGE:'),
      '  repro keys <rotate|status> [--key=<key-id>] [options]',
      '',
      bold('SUBCOMMANDS:'),
      '  rotate                     Rotate key and generate a fresh DEK and Key ID',
      '  status                     Inspect the active status of a key reference',
      '',
      bold('OPTIONS:'),
      '      --key <key-id>         Specific key identifier',
      '  -j, --json                 Output in machine-readable JSON format',
      '',
    ].join('\n');
  }

  // Global Help
  return [
    bold('Repro CLI — Unified Developer Execution Capture, Replay & Verification Tooling'),
    dim('Version: 0.1.0 | Specification: EPIC-05, Story-16, Story-17, Story-18'),
    '',
    bold('USAGE:'),
    '  repro <command> [arguments] [flags]',
    '',
    bold('DEVELOPER VERBS (Story-16):'),
    `  ${cyan('list')}      List local and remote execution capsules`,
    `  ${cyan('pull')}      Pull/download a capsule to local storage (${dim('SEC-042, SEC-043')})`,
    `  ${cyan('inspect')}   Inspect manifest, interactions, and redaction audit trail`,
    `  ${cyan('replay')}    Deterministically replay execution locally with virtual clock`,
    `  ${cyan('diff')}      Show side-by-side 2-column execution diff (${dim('Production vs Local')})`,
    `  ${cyan('verify')}    Verify fix on current code (${dim('§20.16 Contract-compliant')})`,
    '',
    bold('OPERATIONAL & SECURITY ADMIN VERBS (Story-08, Story-17):'),
    `  ${cyan('purge')}     Trigger crypto-shredding at Key Custody Store (${dim('GDPR Art 17')})`,
    `  ${cyan('keys')}      Rotate encryption keys or query Key Custody status`,
    '',
    bold('GLOBAL FLAGS:'),
    '  -h, --help        Show help for command',
    '  -v, --version     Show version number',
    '  -j, --json        Output in machine-readable JSON format',
    '      --no-color    Disable ANSI color output',
    '',
    bold('EXAMPLES:'),
    '  repro list',
    '  repro pull cap_1842',
    '  repro inspect cap_1842',
    '  repro replay cap_1842 --port=3000',
    '  repro diff cap_1842',
    '  repro verify cap_1842',
    '  repro purge --before=2026-08-01 --hard',
    '  repro keys rotate',
    '',
  ].join('\n');
}

/**
 * Returns the version string.
 */
export function renderVersion(): string {
  return '0.1.0';
}
