/**
 * Repro Replay Session Lifecycle Coordinator
 * Specification: ADR-005, ADR-006, ADR-010, Story-09 (Scenario 1..3), Story-10, Story-11, Story-12
 * Zero external dependencies: Uses Node.js built-in APIs (node:events, node:crypto) and @repro/core
 */

import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type { ReproManifest } from '@repro/core';
import type { MockAdaptersBundle } from '../adapters/index.ts';
import { createMockAdapters } from '../adapters/index.ts';
import { VirtualClock } from '../clock/virtual-clock.ts';
import { installVirtualClock, uninstallVirtualClock } from '../clock/timer-patch.ts';
import type { CapsuleLoaderOptions, LoadedCapsule } from './loader.ts';
import { CapsuleLoader } from './loader.ts';
import type { LocalTraceEntry, LocalTraceSummary } from './local-tracer.ts';
import { LocalInteractionTracer } from './local-tracer.ts';
import type { InboundInjectorOptions, InboundInjectionResult } from '../trigger/http-injector.ts';
import { InboundHttpInjector } from '../trigger/http-injector.ts';

/**
 * Replay Session Lifecycle States
 */
export type ReplaySessionState =
  | 'INIT'
  | 'LOADED'
  | 'ARMED'
  | 'INJECTING'
  | 'TRACING'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Configuration options for initializing a ReplaySession.
 */
export interface ReplaySessionOptions extends CapsuleLoaderOptions, InboundInjectorOptions {
  /** Path to the .repro.tar.gz capsule archive */
  capsulePath?: string;
  /** In-memory buffer of the capsule archive */
  capsuleBuffer?: Buffer;
  /** Initial virtual clock timestamp (defaults to manifest created_at or T0 = 0) */
  clockInitialTimeMs?: number;
}

/**
 * Final execution result of a completed or failed ReplaySession.
 */
export interface ReplaySessionResult {
  session_id: string;
  state: ReplaySessionState;
  manifest?: ReproManifest;
  drift_warning?: string;
  injection_result?: InboundInjectionResult;
  trace_summary: LocalTraceSummary;
  traces: LocalTraceEntry[];
  duration_ms: number;
  success: boolean;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * ReplaySession coordinates the complete lifecycle of a deterministic replay run:
 * INIT -> LOADED -> ARMED (mock adapters & virtual clock) -> INJECTING (U0) -> TRACING -> COMPLETED.
 */
export class ReplaySession extends EventEmitter {
  public readonly sessionId: string;
  private state: ReplaySessionState = 'INIT';
  private loadedCapsule: LoadedCapsule | null = null;
  private mockAdapters: MockAdaptersBundle | null = null;
  private virtualClock: VirtualClock | null = null;
  private readonly localTracer: LocalInteractionTracer;
  private readonly injector: InboundHttpInjector;
  private lastInjectionResult: InboundInjectionResult | null = null;
  private sessionStartTimeMs: number = Date.now();
  private options: ReplaySessionOptions;

  constructor(options: ReplaySessionOptions = {}) {
    super();
    this.sessionId = `ses_${randomUUID()}`;
    this.options = { ...options };
    this.localTracer = new LocalInteractionTracer();
    this.injector = new InboundHttpInjector();
  }

  /**
   * Returns current lifecycle state.
   */
  public getState(): ReplaySessionState {
    return this.state;
  }

  /**
   * Returns the loaded capsule data if available.
   */
  public getLoadedCapsule(): LoadedCapsule | null {
    return this.loadedCapsule;
  }

  /**
   * Returns the virtual clock instance if initialized.
   */
  public getVirtualClock(): VirtualClock | null {
    return this.virtualClock;
  }

  /**
   * Returns mock adapters bundle if armed/loaded.
   */
  public getMockAdapters(): MockAdaptersBundle | null {
    return this.mockAdapters;
  }

  /**
   * Returns local interaction tracer.
   */
  public getTracer(): LocalInteractionTracer {
    return this.localTracer;
  }

  /**
   * Returns the last synthetic injection result.
   */
  public getInjectionResult(): InboundInjectionResult | null {
    return this.lastInjectionResult;
  }

  /**
   * Phase 1: Loads and decrypts the capsule archive, indexes interactions.
   * State transition: INIT -> LOADED
   */
  public async load(
    capsulePathOrBuffer?: string | Buffer,
    options?: CapsuleLoaderOptions
  ): Promise<LoadedCapsule> {
    if (this.state !== 'INIT' && this.state !== 'LOADED' && this.state !== 'COMPLETED') {
      throw new Error(`Cannot load capsule in state '${this.state}'. Expected 'INIT' or 'LOADED'.`);
    }

    const mergedOptions: CapsuleLoaderOptions = {
      ...this.options,
      ...options,
    };

    const target = capsulePathOrBuffer || this.options.capsulePath || this.options.capsuleBuffer;
    if (!target) {
      throw new Error("No capsule path or buffer provided to load().");
    }

    let loaded: LoadedCapsule;
    if (typeof target === 'string') {
      loaded = await CapsuleLoader.load(target, mergedOptions);
    } else {
      loaded = await CapsuleLoader.loadFromBuffer(target, mergedOptions);
    }

    this.loadedCapsule = loaded;

    // 1. Initialize mock adapters
    this.mockAdapters = createMockAdapters(loaded.interactions);

    // 2. Initialize virtual clock with recorded clock interactions
    let initialTimeMs = this.options.clockInitialTimeMs;
    if (initialTimeMs === undefined && loaded.manifest.created_at) {
      const parsedTime = Date.parse(loaded.manifest.created_at);
      if (!Number.isNaN(parsedTime)) {
        initialTimeMs = parsedTime;
      }
    }

    this.virtualClock = new VirtualClock({
      initialTimeMs: initialTimeMs ?? Date.now(),
      interactions: loaded.index.getClockInteractions(),
    });

    this.state = 'LOADED';
    this.emit('stateChange', this.state);
    this.emit('loaded', loaded);

    return loaded;
  }

  /**
   * Phase 2: Arms the runtime by installing mock adapters (Postgres, HTTP, Flags)
   * and virtual clock timer monkey-patches.
   * State transition: LOADED -> ARMED
   */
  public arm(): void {
    if (this.state !== 'LOADED' && this.state !== 'COMPLETED') {
      throw new Error(`Cannot arm session in state '${this.state}'. Session must be 'LOADED'.`);
    }

    if (!this.mockAdapters || !this.virtualClock || !this.loadedCapsule) {
      throw new Error("Session is missing initialized adapters or clock. Call load() first.");
    }

    // 1. Install mock adapters
    this.mockAdapters.install();

    // 2. Install virtual clock patches
    installVirtualClock(this.virtualClock);

    // 3. Start local tracer
    this.sessionStartTimeMs = Date.now();
    this.localTracer.start(this.virtualClock.now());

    this.state = 'ARMED';
    this.emit('stateChange', this.state);
    this.emit('armed');
  }

  /**
   * Phase 3: Triggers synthetic inbound request U0 into the local target server.
   * State transition: ARMED -> INJECTING -> TRACING
   */
  public async inject(
    overrideOptions: InboundInjectorOptions = {}
  ): Promise<InboundInjectionResult> {
    if (this.state !== 'ARMED') {
      throw new Error(`Cannot inject inbound request in state '${this.state}'. Session must be 'ARMED'.`);
    }

    if (!this.loadedCapsule) {
      throw new Error("No loaded capsule available for injection.");
    }

    const u0 = this.loadedCapsule.index.getInitialInbound();
    if (!u0) {
      throw new Error("Loaded capsule does not contain an initial inbound interaction (U0).");
    }

    this.state = 'INJECTING';
    this.emit('stateChange', this.state);
    this.emit('injecting', u0);

    const injectionOptions: InboundInjectorOptions = {
      ...this.options,
      ...overrideOptions,
      executionId: this.sessionId,
    };

    try {
      const injectionResult = await this.injector.inject(u0, injectionOptions);
      this.lastInjectionResult = injectionResult;

      // Record U0 in local tracer
      this.localTracer.record({
        category: 'HTTP_INBOUND',
        target: `${u0.data.method} ${u0.data.url}`,
        matched: true,
        matched_interaction_id: u0.interaction_id,
        request_data: u0.data,
        response_data: {
          statusCode: injectionResult.statusCode,
          headers: injectionResult.headers,
          body: injectionResult.body,
        },
        duration_ms: injectionResult.durationMs,
        timestamp_offset_ms: 0,
      });

      this.state = 'TRACING';
      this.emit('stateChange', this.state);
      this.emit('injected', injectionResult);

      return injectionResult;
    } catch (err: unknown) {
      this.abort(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Phase 4: Completes the replay run, tears down mock adapters and virtual clock,
   * compiles local trace metrics and returns the final session result.
   * State transition: TRACING (or ARMED/LOADED) -> COMPLETED
   */
  public complete(): ReplaySessionResult {
    this.teardownRuntime();

    this.state = 'COMPLETED';
    this.emit('stateChange', this.state);

    const summary = this.localTracer.getSummary();
    const result: ReplaySessionResult = {
      session_id: this.sessionId,
      state: this.state,
      manifest: this.loadedCapsule?.manifest,
      drift_warning: this.loadedCapsule?.driftWarning,
      injection_result: this.lastInjectionResult ?? undefined,
      trace_summary: summary,
      traces: this.localTracer.getTraces(),
      duration_ms: Date.now() - this.sessionStartTimeMs,
      success: !summary.has_divergence && (!this.lastInjectionResult || this.lastInjectionResult.success),
    };

    this.emit('completed', result);
    return result;
  }

  /**
   * Aborts the session due to error or external interrupt.
   * State transition: * -> FAILED
   */
  public abort(error: Error | string): ReplaySessionResult {
    this.teardownRuntime();

    this.state = 'FAILED';
    this.emit('stateChange', this.state);

    const errObj =
      typeof error === 'string'
        ? { name: 'ReplayAbortedError', message: error }
        : {
            name: error.name,
            message: error.message,
            code: 'code' in error && typeof error.code === 'string' ? error.code : undefined,
            stack: error.stack,
          };

    const summary = this.localTracer.getSummary();
    const result: ReplaySessionResult = {
      session_id: this.sessionId,
      state: this.state,
      manifest: this.loadedCapsule?.manifest,
      drift_warning: this.loadedCapsule?.driftWarning,
      injection_result: this.lastInjectionResult ?? undefined,
      trace_summary: summary,
      traces: this.localTracer.getTraces(),
      duration_ms: Date.now() - this.sessionStartTimeMs,
      success: false,
      error: errObj,
    };

    this.emit('failed', result);
    return result;
  }

  /**
   * High-level helper: Executes the full end-to-end replay lifecycle (load -> arm -> inject -> complete).
   */
  public async run(
    options: ReplaySessionOptions = {}
  ): Promise<ReplaySessionResult> {
    this.options = { ...this.options, ...options };

    try {
      await this.load();
      this.arm();
      await this.inject();
      return this.complete();
    } catch (err: unknown) {
      return this.abort(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Uninstalls adapters and clock patches.
   */
  private teardownRuntime(): void {
    if (this.mockAdapters) {
      try {
        this.mockAdapters.uninstall();
      } catch {
        // Ignore uninstall error
      }
    }

    try {
      uninstallVirtualClock();
    } catch {
      // Ignore clock unpatch error
    }

    this.localTracer.stop();
  }
}
