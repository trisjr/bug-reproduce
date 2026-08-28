/**
 * Terminal Execution Diff Formatter — Two-Column Side-by-Side & Divergence List UI
 * Specification: ADR-011, Story-15, SDD-Repro §9, §3.10, §20.16
 */

import type {
  InteractionUnit,
  InboundInteraction,
  OutboundInteraction,
  DatabaseInteraction,
  ClockInteraction,
  FlagInteraction,
  DivergencePoint,
  EquivalenceVerdict,
  AttributionCategory,
  AttributionReason
} from '@repro/core';
import type { DivergenceAttributionResult } from '../attribution/classifier.ts';
import type { EnvironmentDriftResult } from '../attribution/drift-detector.ts';

export interface TerminalDiffOptions {
  color?: boolean;
  maxWidth?: number;
  showAllInteractions?: boolean;
  maxDisplayItems?: number;
}

export interface TerminalDiffRenderInput {
  verdict?: EquivalenceVerdict | string;
  recorded?: unknown[] | Record<string, unknown>;
  replayed?: unknown[] | Record<string, unknown>;
  divergence_points?: DivergencePoint[];
  first_divergence_index?: number;
  attribution?: DivergenceAttributionResult;
  drift_result?: EnvironmentDriftResult;
  app_name?: string;
  capsule_id?: string;
}

/**
 * ANSI Color Palette with color-toggle awareness.
 */
export class AnsiColor {
  private enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }

  public reset(text: string): string {
    return this.enabled ? `\x1b[0m${text}\x1b[0m` : text;
  }

  public bold(text: string): string {
    return this.enabled ? `\x1b[1m${text}\x1b[22m` : text;
  }

  public dim(text: string): string {
    return this.enabled ? `\x1b[2m${text}\x1b[22m` : text;
  }

  public red(text: string): string {
    return this.enabled ? `\x1b[31m${text}\x1b[39m` : text;
  }

  public green(text: string): string {
    return this.enabled ? `\x1b[32m${text}\x1b[39m` : text;
  }

  public yellow(text: string): string {
    return this.enabled ? `\x1b[33m${text}\x1b[39m` : text;
  }

  public blue(text: string): string {
    return this.enabled ? `\x1b[34m${text}\x1b[39m` : text;
  }

  public magenta(text: string): string {
    return this.enabled ? `\x1b[35m${text}\x1b[39m` : text;
  }

  public cyan(text: string): string {
    return this.enabled ? `\x1b[36m${text}\x1b[39m` : text;
  }

  public gray(text: string): string {
    return this.enabled ? `\x1b[90m${text}\x1b[39m` : text;
  }

  public bgRed(text: string): string {
    return this.enabled ? `\x1b[41m\x1b[37m${text}\x1b[39m\x1b[49m` : text;
  }

  public bgGreen(text: string): string {
    return this.enabled ? `\x1b[42m\x1b[30m${text}\x1b[39m\x1b[49m` : text;
  }

  public bgYellow(text: string): string {
    return this.enabled ? `\x1b[43m\x1b[30m${text}\x1b[39m\x1b[49m` : text;
  }
}

/**
 * Strips ANSI escape sequences from a string to measure visible length.
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Pads a string with ANSI characters to a visual width.
 */
export function padVisual(str: string, width: number, align: 'left' | 'right' = 'left'): string {
  const visibleLen = stripAnsi(str).length;
  if (visibleLen >= width) {
    return str;
  }
  const pad = ' '.repeat(width - visibleLen);
  return align === 'left' ? str + pad : pad + str;
}

/**
 * Truncates a string to visible width, appending ellipsis if needed.
 */
export function truncateVisual(str: string, maxLen: number): string {
  const clean = stripAnsi(str);
  if (clean.length <= maxLen) return str;
  if (maxLen <= 3) return clean.slice(0, maxLen);
  return clean.slice(0, maxLen - 1) + '…';
}

/**
 * Summarizes an InteractionUnit into a concise single-line representation.
 */
export function summarizeInteraction(unit: unknown): { category: string; summary: string; detail?: string } {
  if (!unit || typeof unit !== 'object') {
    return { category: 'UNKNOWN', summary: String(unit) };
  }

  const u = unit as Record<string, unknown>;
  const cat = (u.category || u.type || 'UNKNOWN') as string;

  switch (cat) {
    case 'HTTP_INBOUND': {
      const inb = unit as InboundInteraction;
      const req = inb.request || (u.data as Record<string, unknown>) || {};
      const method = (req as Record<string, unknown>).method || 'GET';
      const url = (req as Record<string, unknown>).url || '/';
      return { category: 'HTTP Inbound', summary: `${method} ${url}` };
    }
    case 'HTTP_OUTBOUND': {
      const out = unit as OutboundInteraction;
      const data = out.data || (u.data as Record<string, unknown>) || {};
      const method = (data as Record<string, unknown>).method || 'GET';
      const host = (data as Record<string, unknown>).host || '';
      const path = (data as Record<string, unknown>).path || '/';
      const status = (data as Record<string, unknown>).response_status_code;
      const statusText = status ? ` -> ${status}` : '';
      return { category: 'Tax API / HTTP', summary: `${method} ${host}${path}${statusText}` };
    }
    case 'POSTGRES_QUERY': {
      const db = unit as DatabaseInteraction;
      const data = db.data || (u.data as Record<string, unknown>) || {};
      const sql = (data as Record<string, unknown>).normalized_query || (data as Record<string, unknown>).query || '';
      const rowCount = (data as Record<string, unknown>).row_count ?? (Array.isArray((data as Record<string, unknown>).rows) ? ((data as Record<string, unknown>).rows as unknown[]).length : undefined);
      const rowText = rowCount !== undefined ? ` [${rowCount} rows]` : '';
      const cleanSql = String(sql).replace(/\s+/g, ' ').trim();
      return { category: 'Database query', summary: `${cleanSql}${rowText}` };
    }
    case 'FEATURE_FLAG': {
      const ff = unit as FlagInteraction;
      const data = ff.data || (u.data as Record<string, unknown>) || {};
      const key = (data as Record<string, unknown>).flag_key || (data as Record<string, unknown>).key || 'flag';
      const val = (data as Record<string, unknown>).evaluated_value ?? (data as Record<string, unknown>).value;
      return { category: 'Feature flag', summary: `${key} = ${JSON.stringify(val)}` };
    }
    case 'CLOCK_TICK': {
      const clk = unit as ClockInteraction;
      const data = clk.data || (u.data as Record<string, unknown>) || {};
      const iso = (data as Record<string, unknown>).iso_string || (data as Record<string, unknown>).epoch_ms || '';
      return { category: 'Clock tick', summary: `T = ${iso}` };
    }
    default:
      return { category: cat, summary: JSON.stringify(u.data || u).slice(0, 60) };
  }
}

/**
 * Formats a raw value into a clean readable inline string.
 */
function formatValueInline(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Extracts interaction units array from input wrapper.
 */
function extractUnitArray(input: unknown): InteractionUnit[] {
  if (Array.isArray(input)) {
    return input as InteractionUnit[];
  }
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.interactions)) {
      return obj.interactions as InteractionUnit[];
    }
    if (Array.isArray(obj.units)) {
      return obj.units as InteractionUnit[];
    }
  }
  return [];
}

/**
 * TerminalDiffFormatter formats execution differences between Recorded Production
 * and Local Replay runs for terminal presentation (ADR-011, Story-15).
 */
export class TerminalDiffFormatter {
  private c: AnsiColor;
  private options: TerminalDiffOptions;

  constructor(options: TerminalDiffOptions = {}) {
    const colorEnabled = options.color !== false && (typeof process === 'undefined' || !process.env?.NO_COLOR);
    this.c = new AnsiColor(colorEnabled);
    this.options = {
      maxWidth: 100,
      showAllInteractions: false,
      maxDisplayItems: 25,
      ...options,
      color: colorEnabled
    };
  }

  /**
   * Formats the numbered divergence list grouped by category (ADR-011 §9 / Story-15).
   *
   * Example:
   * ⚠️ Execution diverged
   *
   * 1. Database query (⚡ FIRST DIVERGENCE)
   *    Production → coupon = null
   *    Local      → coupon = { discount: 10 }
   *
   * 2. Tax API
   *    Production → tax = 0
   *    Local      → tax = 12.43
   *
   * 3. Feature flag
   *    Production → new_checkout = true
   *    Local      → new_checkout = false
   */
  public formatDivergenceList(
    divergencePoints: DivergencePoint[],
    firstDivergenceIndex?: number
  ): string {
    if (!divergencePoints || divergencePoints.length === 0) {
      return this.c.green('✓ No execution divergences found.');
    }

    const lines: string[] = [];
    lines.push(this.c.bold(this.c.yellow('⚠️ Execution diverged\n')));

    const firstIndex = firstDivergenceIndex ?? (divergencePoints.length > 0 ? divergencePoints[0].index : undefined);

    divergencePoints.forEach((point, idx) => {
      const itemNum = idx + 1;
      const isFirst = point.index === firstIndex || idx === 0;
      const firstBadge = isFirst ? this.c.bold(this.c.yellow(' (⚡ FIRST DIVERGENCE)')) : '';

      // Determine category title
      let categoryTitle = point.category || 'Interaction';
      if (categoryTitle.toLowerCase().includes('postgres') || categoryTitle.toLowerCase().includes('database') || categoryTitle.toLowerCase().includes('db')) {
        categoryTitle = 'Database query';
      } else if (categoryTitle.toLowerCase().includes('outbound') || categoryTitle.toLowerCase().includes('http') || categoryTitle.toLowerCase().includes('tax') || categoryTitle.toLowerCase().includes('api')) {
        categoryTitle = 'Tax API / HTTP Outbound';
      } else if (categoryTitle.toLowerCase().includes('flag')) {
        categoryTitle = 'Feature flag';
      } else if (categoryTitle.toLowerCase().includes('clock')) {
        categoryTitle = 'Clock tick';
      }

      lines.push(`${this.c.bold(this.c.cyan(`${itemNum}. ${categoryTitle}`))}${firstBadge}`);

      // Production vs Local lines
      const prodVal = formatValueInline(point.production_value);
      const locVal = formatValueInline(point.local_value);

      lines.push(`   ${this.c.gray('Production →')} ${this.c.red(prodVal)}`);
      lines.push(`   ${this.c.gray('Local      →')} ${this.c.green(locVal)}`);

      if (point.description && point.description !== point.category) {
        lines.push(`   ${this.c.dim(`Detail: ${point.description}`)}`);
      }

      if (point.attribution_category || point.attribution_reason) {
        const attrCat = point.attribution_category ? `[${point.attribution_category}] ` : '';
        lines.push(`   ${this.c.dim(`Attribution: ${attrCat}${point.attribution_reason}`)}`);
      }

      lines.push(''); // Blank line separator
    });

    return lines.join('\n').trimEnd();
  }

  /**
   * Formats a 2-column side-by-side comparison table:
   * Recorded Production Execution vs Local Replayed Execution.
   */
  public formatSideBySideTable(
    recorded: unknown[] | Record<string, unknown>,
    replayed: unknown[] | Record<string, unknown>,
    firstDivergenceIndex?: number,
    divergencePoints?: DivergencePoint[]
  ): string {
    const recUnits = extractUnitArray(recorded);
    const repUnits = extractUnitArray(replayed);
    const maxLen = Math.max(recUnits.length, repUnits.length);

    if (maxLen === 0) {
      return this.c.gray('  (No interactions recorded or replayed)');
    }

    const divergenceIndices = new Set<number>(
      divergencePoints ? divergencePoints.map((p) => p.index) : []
    );

    const totalWidth = this.options.maxWidth || 100;
    // Columns: [ # | Status ] (6 chars) | Left Column (half) | Right Column (half)
    const prefixWidth = 6;
    const availableColWidth = Math.floor((totalWidth - prefixWidth - 7) / 2);
    const colWidth = Math.max(25, availableColWidth);

    const lines: string[] = [];

    // Header border
    const topBorder = `┌──────┬${'─'.repeat(colWidth + 2)}┬${'─'.repeat(colWidth + 2)}┐`;
    const midBorder = `├──────┼${'─'.repeat(colWidth + 2)}┼${'─'.repeat(colWidth + 2)}┤`;
    const botBorder = `└──────┴${'─'.repeat(colWidth + 2)}┴${'─'.repeat(colWidth + 2)}┘`;

    lines.push(this.c.gray(topBorder));

    // Table Header
    const col1Header = padVisual(this.c.bold(this.c.cyan('Recorded Production Execution')), colWidth);
    const col2Header = padVisual(this.c.bold(this.c.cyan('Local Replayed Execution')), colWidth);
    lines.push(
      `${this.c.gray('│')} ${padVisual(this.c.bold('#'), 4)} ${this.c.gray('│')} ${col1Header} ${this.c.gray('│')} ${col2Header} ${this.c.gray('│')}`
    );
    lines.push(this.c.gray(midBorder));

    const limit = this.options.maxDisplayItems || 25;
    const displayCount = Math.min(maxLen, limit);

    for (let i = 0; i < displayCount; i++) {
      const rec = recUnits[i];
      const rep = repUnits[i];

      const isFirstDiv = i === firstDivergenceIndex;
      const isDiv = isFirstDiv || divergenceIndices.has(i);

      let statusMarker = this.c.green('✓');
      if (isFirstDiv) {
        statusMarker = this.c.bold(this.c.yellow('⚡'));
      } else if (isDiv) {
        statusMarker = this.c.red('✗');
      }

      const recSummary = rec ? summarizeInteraction(rec) : { category: '-', summary: '(none)' };
      const repSummary = rep ? summarizeInteraction(rep) : { category: '-', summary: '(none)' };

      const recText = rec ? `[${recSummary.category}] ${recSummary.summary}` : '(not reached)';
      const repText = rep ? `[${repSummary.category}] ${repSummary.summary}` : '(missing)';

      let formattedRec = truncateVisual(recText, colWidth);
      let formattedRep = truncateVisual(repText, colWidth);

      if (isFirstDiv) {
        formattedRec = this.c.bold(this.c.red(formattedRec));
        formattedRep = this.c.bold(this.c.green(formattedRep));
      } else if (isDiv) {
        formattedRec = this.c.red(formattedRec);
        formattedRep = this.c.yellow(formattedRep);
      } else {
        formattedRec = this.c.gray(formattedRec);
        formattedRep = this.c.gray(formattedRep);
      }

      const rowNum = padVisual(String(i + 1), 3, 'right');
      const paddedRec = padVisual(formattedRec, colWidth);
      const paddedRep = padVisual(formattedRep, colWidth);

      lines.push(
        `${this.c.gray('│')} ${statusMarker} ${rowNum} ${this.c.gray('│')} ${paddedRec} ${this.c.gray('│')} ${paddedRep} ${this.c.gray('│')}`
      );
    }

    if (maxLen > displayCount) {
      const remaining = maxLen - displayCount;
      const ellipsisText = padVisual(this.c.dim(`... and ${remaining} more interaction(s)`), colWidth * 2 + 3);
      lines.push(`${this.c.gray('│')}   …  ${this.c.gray('│')} ${ellipsisText} ${this.c.gray('│')}`);
    }

    lines.push(this.c.gray(botBorder));

    return lines.join('\n');
  }

  /**
   * Renders a comprehensive execution diff report for terminal output.
   */
  public formatDiff(input: TerminalDiffRenderInput): string {
    const lines: string[] = [];

    // Title Banner
    const appInfo = input.app_name ? ` — ${input.app_name}` : '';
    const capsuleInfo = input.capsule_id ? ` (Capsule: ${input.capsule_id})` : '';
    lines.push(this.c.bold(this.c.cyan(`🔍 REPRO EXECUTION DIFF${appInfo}${capsuleInfo}`)));
    lines.push(this.c.gray('─'.repeat(this.options.maxWidth || 80)));

    // Attribution Banner if present
    if (input.attribution) {
      const attr = input.attribution;
      const catBadge =
        attr.category === 'CODE_CHANGE'
          ? this.c.bgRed(` ${attr.category} `)
          : attr.category === 'REDACTION_ARTIFACT'
            ? this.c.bgYellow(` ${attr.category} `)
            : attr.category === 'ENVIRONMENT_DRIFT'
              ? this.c.bgYellow(` ${attr.category} `)
              : this.c.bgRed(` ${attr.category} `);

      lines.push(`${this.c.bold('Primary Attribution:')} ${catBadge} ${this.c.bold(`[${attr.reason}]`)}`);
      lines.push(`${this.c.bold('Explanation:')} ${attr.explanation}`);
      lines.push('');
    }

    // Two-Column Comparison Table
    lines.push(this.c.bold('Interaction Trace Comparison:'));
    const firstDivIndex = input.first_divergence_index ?? input.attribution?.divergence_index ?? input.divergence_points?.[0]?.index;
    const table = this.formatSideBySideTable(
      input.recorded || [],
      input.replayed || [],
      firstDivIndex,
      input.divergence_points
    );
    lines.push(table);
    lines.push('');

    // Divergence Breakdown List (ADR-011 §9 style)
    if (input.divergence_points && input.divergence_points.length > 0) {
      lines.push(this.c.bold('Divergence Breakdown (ADR-011 §9):'));
      lines.push(this.formatDivergenceList(input.divergence_points, firstDivIndex));
      lines.push('');
    }

    // Drift Summary if available
    if (input.drift_result && input.drift_result.has_drift) {
      lines.push(this.c.bold(this.c.yellow('⚠️ Environment Drift Detected:')));
      input.drift_result.summary.forEach((item) => {
        lines.push(`  • ${item}`);
      });
      lines.push('');
    }

    return lines.join('\n').trimEnd();
  }
}

/**
 * Functional entrypoint for terminal execution diff formatting.
 */
export function formatTerminalDiff(
  input: TerminalDiffRenderInput,
  options?: TerminalDiffOptions
): string {
  const formatter = new TerminalDiffFormatter(options);
  return formatter.formatDiff(input);
}
