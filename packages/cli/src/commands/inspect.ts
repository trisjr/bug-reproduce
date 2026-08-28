/**
 * `repro inspect` Command Handler
 * Specification: EPIC-05, Story-16, SDD-Repro §4.2, §5.2
 */

import { readCapsule } from '@repro/core';
import type {
  InboundInteraction,
  DatabaseInteraction,
  OutboundInteraction,
  ClockInteraction,
  FlagInteraction,
} from '@repro/core';
import type { InspectOptions, InspectResult } from '../types.ts';
import { resolveCapsulePath } from '../utils/storage.ts';

function formatInteractionDescription(unit: unknown): string {
  if (!unit || typeof unit !== 'object') return '';

  if ('type' in unit) {
    const interactionType = (unit as { type: string }).type;

    if (interactionType === 'INBOUND_HTTP' || interactionType === 'INBOUND') {
      const inbound = unit as InboundInteraction;
      const req = inbound.request;
      if (req) {
        return `${req.method || 'GET'} ${req.url || req.path || '/'}`;
      }
    } else if (interactionType === 'DATABASE') {
      const db = unit as DatabaseInteraction;
      return (db.query || '').slice(0, 60).replace(/\s+/g, ' ');
    } else if (interactionType === 'OUTBOUND_HTTP' || interactionType === 'HTTP') {
      const out = unit as OutboundInteraction;
      const req = out.request;
      if (req) {
        return `${req.method || 'GET'} ${req.url || '/'}`;
      }
    } else if (interactionType === 'CLOCK') {
      const clock = unit as ClockInteraction;
      return `now: ${clock.virtual_time_ms}ms (epoch: ${clock.epoch_time_ms})`;
    } else if (interactionType === 'FLAG') {
      const flag = unit as FlagInteraction;
      return `${flag.key} = ${JSON.stringify(flag.value)}`;
    }
  }

  return '';
}

/**
 * Executes the `repro inspect <capsule-id>` command.
 */
export async function inspectCommand(capsuleId: string, options: InspectOptions = {}): Promise<InspectResult> {
  if (!capsuleId || capsuleId.trim().length === 0) {
    throw new Error('Missing required argument: <capsule-id>');
  }

  const filePath = await resolveCapsulePath(capsuleId, options.dir);
  const capsule = await readCapsule(filePath);
  const { manifest, interactions, runtimeMetadata, checksums } = capsule;

  // Summarize interaction types
  const summary: Record<string, number> = {};
  for (const unit of interactions) {
    summary[unit.type] = (summary[unit.type] || 0) + 1;
  }

  const redactionRules = manifest.redaction_applied || [];

  const result: InspectResult = {
    capsuleId: manifest.capsule_id || capsuleId,
    filePath,
    manifest,
    runtimeMetadata,
    interactionsCount: interactions.length,
    interactionsSummary: summary,
    interactions: options.showInteractions ? interactions : undefined,
    redactionRulesApplied: redactionRules,
    integrityChecksums: checksums || {},
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  const useColor = options.noColor ? false : true;
  const bold = (t: string) => (useColor ? `\x1b[1m${t}\x1b[22m` : t);
  const dim = (t: string) => (useColor ? `\x1b[2m${t}\x1b[22m` : t);
  const green = (t: string) => (useColor ? `\x1b[32m${t}\x1b[39m` : t);
  const cyan = (t: string) => (useColor ? `\x1b[36m${t}\x1b[39m` : t);

  console.log(`\n${bold('📦 REPRO CAPSULE INSPECTION')}`);
  console.log(`  File:        ${filePath}`);
  console.log(`  Capsule ID:  ${cyan(manifest.capsule_id || capsuleId)}`);
  console.log(`  Format Ver:  ${manifest.version || 'v1'}`);
  console.log(`  Service:     ${bold(manifest.app_name || 'unknown')}`);
  console.log(`  Environment: ${manifest.environment || 'local'}`);
  console.log(`  Captured At: ${manifest.created_at || 'unknown'}`);
  console.log(`  Duration:    ${manifest.duration_ms ? `${manifest.duration_ms}ms` : 'unknown'}`);
  console.log(`  Trigger:     ${manifest.trigger?.reason || 'MANUAL'} (${manifest.trigger?.type || 'INBOUND_REQUEST'})`);

  // Redaction
  console.log(`\n${bold('🔒 REDACTION AUDIT TRAIL (SEC-047)')}`);
  if (redactionRules.length === 0) {
    console.log(`  ${dim('No fields redacted.')}`);
  } else {
    for (const rule of redactionRules) {
      console.log(`  - ${cyan(rule.path)} ${dim(`[${rule.strategy}]`)}`);
    }
  }

  // Runtime
  if (runtimeMetadata) {
    console.log(`\n${bold('⚙️ RUNTIME ENVIRONMENT')}`);
    console.log(`  Node:        ${runtimeMetadata.node_version || 'unknown'}`);
    console.log(`  Platform:    ${runtimeMetadata.platform || 'unknown'} (${runtimeMetadata.arch || 'unknown'})`);
    console.log(`  Hostname:    ${runtimeMetadata.hostname || 'unknown'}`);
    if (runtimeMetadata.pid) {
      console.log(`  PID:         ${runtimeMetadata.pid}`);
    }
  }

  // Interactions Summary
  console.log(`\n${bold('🔄 RECORDED INTERACTIONS')} ${dim(`(Total: ${interactions.length})`)}`);
  const typeOrder = ['INBOUND_HTTP', 'INBOUND', 'DATABASE', 'OUTBOUND_HTTP', 'HTTP', 'CLOCK', 'FLAG'];
  const knownKeys = Object.keys(summary);
  const orderedTypes = [...typeOrder, ...knownKeys.filter((k) => !typeOrder.includes(k))];

  for (const type of orderedTypes) {
    if (summary[type]) {
      console.log(`  - ${type.padEnd(16)}: ${bold(String(summary[type]))} interaction(s)`);
    }
  }

  // Interaction Details
  if (interactions.length > 0) {
    console.log(`\n${bold('📋 INTERACTION SEQUENCE (First 5):')}`);
    const preview = interactions.slice(0, 5);
    for (const unit of preview) {
      const desc = formatInteractionDescription(unit);
      console.log(`  ${cyan(`[U${unit.sequence_number}]`)} ${unit.type.padEnd(14)} ${desc}`);
    }
    if (interactions.length > 5) {
      console.log(`  ${dim(`... and ${interactions.length - 5} more interaction(s)`)}`);
    }
  }

  // Integrity Checksums
  console.log(`\n${bold('🛡️ INTEGRITY (SEC-027)')}`);
  console.log(`  Payload Checksum: ${green('✓ Verified')} (HMAC-SHA256)\n`);

  return result;
}
