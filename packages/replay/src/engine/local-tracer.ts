/**
 * Repro Local Interaction Tracer
 * Specification: ADR-006, ADR-011, Story-09, Story-10
 * Zero external dependencies: Uses Node.js built-in APIs and @repro/core
 */

import type { InteractionCategory } from '@repro/core';

/**
 * A single local interaction event recorded during replay execution.
 */
export interface LocalTraceEntry {
  /** Sequential index of this local interaction */
  sequence_idx: number;
  /** Category of interaction (HTTP_INBOUND, POSTGRES_QUERY, HTTP_OUTBOUND, etc.) */
  category: InteractionCategory;
  /** Millisecond offset from replay start timestamp T0 */
  timestamp_offset_ms: number;
  /** Query, URL, or identifier representing the target */
  target: string;
  /** True if this interaction matched a recorded capsule interaction */
  matched: boolean;
  /** ID of matched capsule interaction if found */
  matched_interaction_id?: string;
  /** True if this interaction was blocked (e.g. write side effect under ADR-005) */
  blocked: boolean;
  /** Reason why the interaction was blocked */
  block_reason?: string;
  /** Request parameters or payload */
  request_data: unknown;
  /** Response returned by mock adapter or local execution */
  response_data?: unknown;
  /** Error details if interaction failed */
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
  /** Execution duration in milliseconds */
  duration_ms: number;
}

/**
 * Summary metrics of a local replay execution run.
 */
export interface LocalTraceSummary {
  total_interactions: number;
  matched_count: number;
  unmatched_count: number;
  blocked_writes_count: number;
  categories: Record<InteractionCategory, number>;
  duration_ms: number;
  has_divergence: boolean;
}

/**
 * LocalInteractionTracer captures and records all runtime interactions
 * generated during a local replay run for equivalence verification and diffing.
 */
export class LocalInteractionTracer {
  private readonly traces: LocalTraceEntry[] = [];
  private startTimeMs: number = Date.now();
  private isTracing = false;
  private sequenceCounter = 0;

  /**
   * Starts or restarts tracing session.
   */
  public start(startTimeMs: number = Date.now()): void {
    this.startTimeMs = startTimeMs;
    this.isTracing = true;
    this.sequenceCounter = 0;
    this.traces.length = 0;
  }

  /**
   * Stops tracing session.
   */
  public stop(): void {
    this.isTracing = false;
  }

  /**
   * Checks if tracer is currently active.
   */
  public isActive(): boolean {
    return this.isTracing;
  }

  /**
   * Records a local interaction event.
   */
  public record(
    event: {
      category: InteractionCategory;
      target: string;
      matched?: boolean;
      matched_interaction_id?: string;
      blocked?: boolean;
      block_reason?: string;
      request_data?: unknown;
      response_data?: unknown;
      error?: Error | { name: string; message: string; code?: string; stack?: string };
      duration_ms?: number;
      timestamp_offset_ms?: number;
    }
  ): LocalTraceEntry {
    const sequence_idx = this.sequenceCounter++;
    const timestamp_offset_ms =
      event.timestamp_offset_ms !== undefined
        ? event.timestamp_offset_ms
        : Math.max(0, Date.now() - this.startTimeMs);

    let errorObj: LocalTraceEntry['error'] | undefined;
    if (event.error) {
      if (event.error instanceof Error) {
        const errCode =
          'code' in event.error && typeof event.error.code === 'string'
            ? event.error.code
            : undefined;
        errorObj = {
          name: event.error.name,
          message: event.error.message,
          code: errCode,
          stack: event.error.stack,
        };
      } else {
        errorObj = event.error;
      }
    }
    const entry: LocalTraceEntry = {
      sequence_idx,
      category: event.category,
      timestamp_offset_ms,
      target: event.target,
      matched: event.matched ?? false,
      matched_interaction_id: event.matched_interaction_id,
      blocked: event.blocked ?? false,
      block_reason: event.block_reason,
      request_data: event.request_data ?? null,
      response_data: event.response_data,
      error: errorObj,
      duration_ms: event.duration_ms ?? 0,
    };

    this.traces.push(entry);
    return entry;
  }

  /**
   * Returns all recorded local trace entries.
   */
  public getTraces(): LocalTraceEntry[] {
    return [...this.traces];
  }

  /**
   * Generates summary statistics from the current trace log.
   */
  public getSummary(): LocalTraceSummary {
    const categories: Record<InteractionCategory, number> = {
      HTTP_INBOUND: 0,
      HTTP_OUTBOUND: 0,
      POSTGRES_QUERY: 0,
      FEATURE_FLAG: 0,
      CLOCK_TICK: 0,
      RUNTIME_ENV: 0,
    };

    let matched_count = 0;
    let unmatched_count = 0;
    let blocked_writes_count = 0;

    for (const trace of this.traces) {
      if (categories[trace.category] !== undefined) {
        categories[trace.category]++;
      } else {
        categories[trace.category] = 1;
      }

      if (trace.matched) {
        matched_count++;
      } else {
        unmatched_count++;
      }

      if (trace.blocked) {
        blocked_writes_count++;
      }
    }

    const duration_ms =
      this.traces.length > 0
        ? this.traces[this.traces.length - 1].timestamp_offset_ms +
          (this.traces[this.traces.length - 1].duration_ms || 0)
        : 0;

    return {
      total_interactions: this.traces.length,
      matched_count,
      unmatched_count,
      blocked_writes_count,
      categories,
      duration_ms,
      has_divergence: unmatched_count > 0,
    };
  }

  /**
   * Clears all traces and resets state.
   */
  public clear(): void {
    this.traces.length = 0;
    this.sequenceCounter = 0;
  }

  /**
   * Exports the trace history as formatted or compact JSON string.
   */
  public exportJson(pretty = false): string {
    return JSON.stringify(
      {
        summary: this.getSummary(),
        traces: this.traces,
      },
      null,
      pretty ? 2 : undefined
    );
  }
}
