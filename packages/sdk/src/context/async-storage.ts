/**
 * Repro Execution Context Tracking via Node.js AsyncLocalStorage
 * Specification: ADR-007, ADR-008, Story-01, Story-02
 * Zero external dependencies: Uses node:async_hooks
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import type { InteractionUnit } from '@repro/core';
import { generateExecutionId } from './execution-id.ts';

export interface ExecutionContext {
  /**
   * Unique monotonic execution identifier (UUIDv7 format).
   */
  readonly executionId: string;

  /**
   * Distributed trace/correlation identifier.
   */
  traceId: string;

  /**
   * Logical service name (e.g. "checkout-api").
   */
  serviceName: string;

  /**
   * Start timestamp T0 in Unix epoch milliseconds.
   */
  readonly startTimeMs: number;

  /**
   * High-resolution process hrtime at T0.
   */
  readonly startHrtimeBigint: bigint;

  /**
   * Monotonic sequence index counter (U0, U1, ... Un).
   */
  sequenceCounter: number;

  /**
   * In-memory buffer of captured interaction units for this execution.
   */
  interactions: InteractionUnit[];

  /**
   * Tracks occurrence count per SQL fingerprint for deterministic query indexing.
   */
  queryOccurrences: Map<string, number>;

  /**
   * Freeform execution metadata (route, headers, tags).
   */
  metadata: Record<string, unknown>;

  /**
   * Whether recording is actively enabled for this context.
   */
  isCapturing: boolean;

  /**
   * Flag indicating if an uncaught exception or 5xx trigger occurred.
   */
  hasError: boolean;

  /**
   * Captured error payload if any.
   */
  error?: unknown;

  /**
   * Optional real-time sink/callback when an interaction is captured.
   */
  onInteraction?: (interaction: InteractionUnit) => void;
}

export interface CreateContextOptions {
  executionId?: string;
  traceId?: string;
  serviceName?: string;
  isCapturing?: boolean;
  metadata?: Record<string, unknown>;
  onInteraction?: (interaction: InteractionUnit) => void;
}

/**
 * Singleton manager for Node.js async execution context propagation.
 */
export class ExecutionContextManager {
  private readonly storage = new AsyncLocalStorage<ExecutionContext>();

  /**
   * Creates a new initialized ExecutionContext object.
   */
  public createContext(options?: CreateContextOptions): ExecutionContext {
    const executionId = options?.executionId ?? generateExecutionId();
    return {
      executionId,
      traceId: options?.traceId ?? executionId,
      serviceName: options?.serviceName ?? 'default-service',
      startTimeMs: Date.now(),
      startHrtimeBigint: process.hrtime.bigint(),
      sequenceCounter: 0,
      interactions: [],
      queryOccurrences: new Map<string, number>(),
      metadata: options?.metadata ?? {},
      isCapturing: options?.isCapturing ?? true,
      hasError: false,
      onInteraction: options?.onInteraction,
    };
  }

  /**
   * Runs a synchronous or asynchronous function within the specified ExecutionContext.
   */
  public run<R>(context: ExecutionContext, fn: () => R): R {
    return this.storage.run(context, fn);
  }

  /**
   * Convenience helper to create a context and run a function within it.
   */
  public runWithNewContext<R>(
    options: CreateContextOptions | undefined,
    fn: (context: ExecutionContext) => R
  ): R {
    const context = this.createContext(options);
    return this.storage.run(context, () => fn(context));
  }

  /**
   * Retrieves the active ExecutionContext from the current asynchronous execution chain.
   */
  public getContext(): ExecutionContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Alias for getContext() conforming to AsyncLocalStorage convention.
   */
  public getStore(): ExecutionContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Returns true if there is an active execution context currently recording.
   */
  public isActive(): boolean {
    const ctx = this.storage.getStore();
    return ctx !== undefined && ctx.isCapturing;
  }

  /**
   * Returns current active execution ID or undefined if outside an execution context.
   */
  public getExecutionId(): string | undefined {
    return this.storage.getStore()?.executionId;
  }

  /**
   * Retrieves and increments the monotonic sequence index (U0..Un) for the current context.
   * If outside a context, returns 0.
   */
  public getNextSequenceIndex(): number {
    const ctx = this.storage.getStore();
    if (!ctx) return 0;
    const current = ctx.sequenceCounter;
    ctx.sequenceCounter += 1;
    return current;
  }

  /**
   * Returns the elapsed milliseconds since T0 for the active execution context.
   */
  public getTimestampOffsetMs(): number {
    const ctx = this.storage.getStore();
    if (!ctx) return 0;
    return Math.max(0, Date.now() - ctx.startTimeMs);
  }

  /**
   * Records an interaction unit to the active context safely (Fail-Safe U-C2).
   */
  public recordInteraction(interaction: InteractionUnit): void {
    const ctx = this.storage.getStore();
    if (!ctx || !ctx.isCapturing) return;

    try {
      ctx.interactions.push(interaction);
      if (ctx.onInteraction) {
        ctx.onInteraction(interaction);
      }
    } catch (err) {
      // Fail-Safe (§20.7, U-C2): Logging warning, never crash the host application
      if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
        console.error('[Repro ExecutionContext] Failed to record interaction:', err);
      }
    }
  }

  /**
   * Returns and increments the occurrence index for a specific SQL query fingerprint in this context.
   */
  public getQueryOccurrenceIndex(sqlFingerprint: string): number {
    const ctx = this.storage.getStore();
    if (!ctx) return 0;
    const current = ctx.queryOccurrences.get(sqlFingerprint) ?? 0;
    ctx.queryOccurrences.set(sqlFingerprint, current + 1);
    return current;
  }

  /**
   * Marks the current execution context as having encountered an error/trigger.
   */
  public markError(error: unknown): void {
    const ctx = this.storage.getStore();
    if (!ctx) return;
    ctx.hasError = true;
    ctx.error = error;
  }

  /**
   * Sets custom metadata on the active context.
   */
  public setMetadata(key: string, value: unknown): void {
    const ctx = this.storage.getStore();
    if (!ctx) return;
    ctx.metadata[key] = value;
  }
}

/**
 * Global singleton instance of ExecutionContextManager.
 */
export const executionContextManager = new ExecutionContextManager();
export const defaultContextManager = executionContextManager;
