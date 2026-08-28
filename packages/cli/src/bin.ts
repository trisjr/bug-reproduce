#!/usr/bin/env node
/**
 * Repro CLI Binary Entry Point
 * Specification: EPIC-05, Story-16, Story-17, Story-18, SDD-Repro §5.2, §5.5
 */

import { parseArgs, renderHelp, renderVersion } from './parser.ts';
import { ExitCode } from './types.ts';
import {
  listCommand,
  pullCommand,
  inspectCommand,
  replayCommand,
  diffCommand,
  verifyCommand,
  purgeCommand,
  keysCommand,
} from './commands/index.ts';

/**
 * Main CLI execution router.
 */
export async function runCli(argv: string[] = process.argv): Promise<number> {
  const parsed = parseArgs(argv);
  const { command, subcommand, positional, flags } = parsed;

  // Handle global flags: --version and --help
  if (flags.version || command === 'version') {
    console.log(renderVersion());
    return ExitCode.SUCCESS;
  }

  if (flags.help || command === 'help' || !command) {
    const targetCommand = command === 'help' ? subcommand : command;
    console.log(renderHelp(targetCommand, flags.noColor ? false : true));
    return ExitCode.SUCCESS;
  }

  try {
    switch (command) {
      case 'list': {
        await listCommand({
          json: flags.json,
          service: flags.service,
          dir: flags.dir,
          limit: flags.limit,
          noColor: flags.noColor,
        });
        return ExitCode.SUCCESS;
      }

      case 'pull': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        if (!capsuleId) {
          throw new Error('Missing required argument: <capsule-id>\nUsage: repro pull <capsule-id> [options]');
        }
        await pullCommand(capsuleId, {
          json: flags.json,
          out: flags.out,
          dir: flags.dir,
          allowInRepo: flags.allowInRepo,
          forceInsideGit: flags.forceInsideGit,
          overwrite: flags.overwrite,
          storeUrl: flags.storeUrl,
          authToken: flags.authToken,
          noColor: flags.noColor,
        });
        return ExitCode.SUCCESS;
      }

      case 'inspect': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        if (!capsuleId) {
          throw new Error('Missing required argument: <capsule-id>\nUsage: repro inspect <capsule-id> [options]');
        }
        await inspectCommand(capsuleId, {
          json: flags.json,
          dir: flags.dir,
          showInteractions: flags.showInteractions,
          noColor: flags.noColor,
        });
        return ExitCode.SUCCESS;
      }

      case 'replay': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        if (!capsuleId) {
          throw new Error('Missing required argument: <capsule-id>\nUsage: repro replay <capsule-id> [options]');
        }
        const replayRes = await replayCommand(capsuleId, {
          json: flags.json,
          dir: flags.dir,
          port: flags.port,
          host: flags.host,
          timeoutMs: flags.timeout,
          allowUnrecordedRead: flags.allowUnrecorded as boolean,
          noColor: flags.noColor,
        });
        return replayRes.exitCode;
      }

      case 'diff': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        if (!capsuleId) {
          throw new Error('Missing required argument: <capsule-id>\nUsage: repro diff <capsule-id> [options]');
        }
        const diffRes = await diffCommand(capsuleId, {
          json: flags.json,
          dir: flags.dir,
          port: flags.port,
          maxWidth: flags.maxWidth,
          showAllInteractions: flags.showAll as boolean,
          noColor: flags.noColor,
        });
        return diffRes.exitCode;
      }

      case 'verify': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        if (!capsuleId) {
          throw new Error('Missing required argument: <capsule-id>\nUsage: repro verify <capsule-id> [options]');
        }
        const verifyRes = await verifyCommand(capsuleId, {
          json: flags.json,
          dir: flags.dir,
          port: flags.port,
          timeoutMs: flags.timeout,
          noColor: flags.noColor,
        });
        return verifyRes.exitCode;
      }

      case 'purge': {
        const capsuleId = positional[1] || flags.capsule || flags.capsuleId;
        await purgeCommand({
          json: flags.json,
          dir: flags.dir,
          capsule: capsuleId,
          before: flags.before,
          hard: flags.hard,
          reason: flags.reason,
          storeUrl: flags.storeUrl,
          authToken: flags.authToken,
          noColor: flags.noColor,
        });
        return ExitCode.SUCCESS;
      }

      case 'keys': {
        const keysSubcommand = subcommand || 'status';
        const keyId = positional[2] || flags.keyId || flags.key;
        await keysCommand(keysSubcommand, {
          json: flags.json,
          keyId: keyId as string,
          storeUrl: flags.storeUrl,
          authToken: flags.authToken,
          noColor: flags.noColor,
        });
        return ExitCode.SUCCESS;
      }

      default: {
        console.error(`Unknown command: "${command}".\n`);
        console.log(renderHelp(undefined, flags.noColor ? false : true));
        return ExitCode.FATAL;
      }
    }
  } catch (error) {
    if (flags.json) {
      console.error(
        JSON.stringify(
          {
            error: true,
            name: (error as Error).name,
            message: (error as Error).message,
            stack: flags.verbose ? (error as Error).stack : undefined,
          },
          null,
          2
        )
      );
    } else {
      const red = (t: string) => (flags.noColor ? t : `\x1b[31m${t}\x1b[39m`);
      const bold = (t: string) => (flags.noColor ? t : `\x1b[1m${t}\x1b[22m`);
      console.error(`\n${red(bold('✖ ERROR:'))} ${(error as Error).message}\n`);
      if (flags.verbose && (error as Error).stack) {
        console.error((error as Error).stack);
      }
    }
    return ExitCode.FATAL;
  }
}

// Auto-run if executed directly as script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('bin.ts')) {
  runCli().then((code) => {
    process.exit(code);
  });
}
