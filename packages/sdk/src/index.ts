/**
 * @repro/node - In-Process Capture SDK for Node.js
 * Specification: ADR-007, ADR-008, Story-01, Story-02, Story-03, Story-04
 * Zero external production dependencies: Uses Node.js built-in APIs and @repro/core
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type {
  RedactionConfig,
  ReproManifest,
  InteractionUnit,
} from '@repro/core';
import type { WriteCapsuleResult } from '@repro/core';

import {
  executionContextManager,
  ExecutionContextManager,
  type ExecutionContext,
  type CreateContextOptions,
} from './context/async-storage.ts';
import { generateExecutionId, generateInteractionId } from './context/execution-id.ts';
import {
  installInterceptors,
  uninstallInterceptors,
  areInterceptorsInstalled,
  type InterceptorOptions,
} from './interceptors/index.ts';
import {
  FormatPreservingMasker,
  RedactionAuditTrail,
  DEFAULT_SDK_REDACTION_CONFIG,
  DEFAULT_SDK_REDACTION_RULES,
  NEVER_STORE_HEADERS,
  NEVER_STORE_FIELDS,
  REDACTION_PATTERNS,
  isValidLuhn,
} from './redaction/index.ts';
import {
  BoundedRingBuffer,
  type RingBufferOptions,
  type RingBufferStats,
  truncateQueryResult,
  guardDatabaseInteraction,
  TriggerListener,
  type TriggerListenerConfig,
  type CaptureOptions,
  MAX_DATABASE_ROWS,
  MAX_DATABASE_BYTES,
} from './buffer/index.ts';

// Re-export all submodules for comprehensive SDK customization
export * from './context/index.ts';
export * from './interceptors/index.ts';
export * from './redaction/index.ts';
export * from './buffer/index.ts';

export interface ReproConfig {
  /**
   * Logical application or service name (e.g. "order-service").
   */
  serviceName?: string;

  /**
   * Application semver version string.
   */
  appVersion?: string;

  /**
   * Deployment environment name ("production", "staging", "development").
   */
  environment?: string;

  /**
   * Target directory where packaged .repro.tar.gz capsules are stored locally.
   */
  outputDir?: string;

  /**
   * Git commit hash of the target build.
   */
  targetCommit?: string;

  /**
   * Key Custody REST API endpoint URI (ADR-012).
   */
  keyCustodyUrl?: string;

  /**
   * Sampling rate between 0.0 (0%) and 1.0 (100%). Default: 1.0
   */
  sampleRate?: number;

  /**
   * Format-preserving redaction configuration.
   */
  redaction?: RedactionConfig;

  /**
   * Bounded ring buffer configuration (ADR-008).
   */
  buffer?: RingBufferOptions;

  /**
   * In-process interceptors configuration (PG, HTTP, Clock).
   */
  interceptors?: InterceptorOptions;

  /**
   * Automatically capture on process unhandled exceptions.
   */
  catchUncaughtExceptions?: boolean;

  /**
   * Automatically capture on process unhandled promise rejections.
   */
  catchUnhandledRejections?: boolean;

  /**
   * Optional callback triggered whenever a capsule is packaged.
   */
  onCapsuleCreated?: (result: WriteCapsuleResult, manifest: ReproManifest) => void;
}

/**
 * ReproSDK encapsulates initialization, lifecycle monitoring, and failure-triggered capture.
 */
export class ReproSDK {
  private config: ReproConfig = {};
  private ringBuffer: BoundedRingBuffer | null = null;
  private triggerListener: TriggerListener | null = null;
  private isInitializedState = false;

  /**
   * Initializes the Repro SDK with configuration (Fail-Safe U-C2).
   *
   * @param config ReproConfig options
   */
  public init(config?: ReproConfig): void {
    try {
      this.config = {
        serviceName: config?.serviceName ?? 'repro-node-service',
        appVersion: config?.appVersion ?? '0.1.0',
        environment: config?.environment ?? process.env['NODE_ENV'] ?? 'development',
        outputDir: config?.outputDir,
        targetCommit: config?.targetCommit ?? process.env['GIT_COMMIT'],
        keyCustodyUrl: config?.keyCustodyUrl,
        sampleRate: config?.sampleRate ?? 1.0,
        redaction: config?.redaction ?? DEFAULT_SDK_REDACTION_CONFIG,
        buffer: config?.buffer,
        interceptors: config?.interceptors,
        catchUncaughtExceptions: config?.catchUncaughtExceptions ?? false,
        catchUnhandledRejections: config?.catchUnhandledRejections ?? false,
        onCapsuleCreated: config?.onCapsuleCreated,
      };

      // 1. Initialize Bounded Ring Buffer
      this.ringBuffer = new BoundedRingBuffer(this.config.buffer);

      // 2. Initialize Trigger Listener
      this.triggerListener = new TriggerListener({
        serviceName: this.config.serviceName,
        appVersion: this.config.appVersion,
        environment: this.config.environment,
        outputDir: this.config.outputDir,
        targetCommit: this.config.targetCommit,
        keyCustodyUrl: this.config.keyCustodyUrl,
        redactionConfig: this.config.redaction,
        ringBuffer: this.ringBuffer,
        onCapsuleCreated: this.config.onCapsuleCreated,
        catchUncaughtExceptions: this.config.catchUncaughtExceptions,
        catchUnhandledRejections: this.config.catchUnhandledRejections,
      });
      this.triggerListener.start();

      // 3. Install Interceptors
      installInterceptors(this.config.interceptors);

      this.isInitializedState = true;
    } catch (err) {
      // Fail-Safe (§20.7, U-C2): Repro initialization failure must never crash the host application
      if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
        console.error('[Repro SDK] Initialization failed:', err);
      }
    }
  }

  /**
   * Manually captures and packages a failure capsule for the current or specified context (Fail-Safe U-C2).
   */
  public async capture(error?: unknown, context?: ExecutionContext): Promise<WriteCapsuleResult | undefined> {
    try {
      if (!this.triggerListener) {
        this.triggerListener = new TriggerListener();
      }

      return await this.triggerListener.capture({
        error,
        context: context ?? executionContextManager.getContext(),
        triggerType: 'MANUAL_DEBUG',
      });
    } catch (err) {
      // Fail-Safe: Never throw out to host application
      if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
        console.error('[Repro SDK] Manual capture failed:', err);
      }
      return undefined;
    }
  }

  /**
   * Alias for capture(error) conforming to standard Sentry/APM interface convention.
   */
  public async captureException(error: unknown, context?: ExecutionContext): Promise<WriteCapsuleResult | undefined> {
    return this.capture(error, context);
  }

  /**
   * HTTP Request Wrapper for Express, Fastify, Connect, or native node:http request handlers.
   * Automatically isolates execution context, buffers interactions, monitors 5xx responses,
   * and guarantees 0 B egress upon successful 200 OK completion.
   */
  public wrapHandler<
    Req extends IncomingMessage = IncomingMessage,
    Res extends ServerResponse = ServerResponse
  >(
    handler: (req: Req, res: Res, next?: (err?: unknown) => void) => unknown
  ): (req: Req, res: Res, next?: (err?: unknown) => void) => unknown {
    const self = this;

    return function reproWrappedHandler(req: Req, res: Res, next?: (err?: unknown) => void): unknown {
      // Check sampling rate
      const sampleRate = self.config.sampleRate ?? 1.0;
      const shouldSample = sampleRate >= 1.0 || Math.random() < sampleRate;

      if (!shouldSample) {
        return handler(req, res, next);
      }

      const executionId = generateExecutionId();
      const traceId = (req.headers['x-request-id'] as string) || (req.headers['traceparent'] as string) || executionId;

      const context = executionContextManager.createContext({
        executionId,
        traceId,
        serviceName: self.config.serviceName,
        metadata: {
          url: req.url,
          method: req.method,
        },
      });

      // Hook response finish to capture on 5xx or discard buffer on success
      res.on('finish', () => {
        try {
          if (res.statusCode >= 500 || context.hasError) {
            void self.triggerListener?.capture({
              statusCode: res.statusCode,
              error: context.error ?? new Error(`HTTP ${res.statusCode} Response`),
              context,
            });
          } else {
            // Zero Egress (Story-04, Scenario 1): Request succeeded (200..499) -> discard interactions
            context.interactions = [];
          }
        } catch {
          // Fail-Safe: silently ignore post-response packaging errors
        }
      });

      return executionContextManager.run(context, () => {
        try {
          const result = handler(req, res, next);
          // Handle asynchronous handler errors (Promise rejection)
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            return (result as Promise<unknown>).catch((err) => {
              context.hasError = true;
              context.error = err;
              void self.triggerListener?.capture({
                error: err,
                context,
              });
              throw err; // Re-throw to allow framework error handling middleware to process
            });
          }
          return result;
        } catch (err) {
          // Handle synchronous handler error
          context.hasError = true;
          context.error = err;
          void self.triggerListener?.capture({
            error: err,
            context,
          });
          throw err;
        }
      });
    };
  }

  /**
   * Retrieves the current execution context from AsyncLocalStorage.
   */
  public getContext(): ExecutionContext | undefined {
    return executionContextManager.getContext();
  }

  /**
   * Returns true if the SDK has been initialized.
   */
  public isInitialized(): boolean {
    return this.isInitializedState;
  }

  /**
   * Shuts down the SDK, uninstalls interceptors, and clears buffers.
   */
  public shutdown(): void {
    if (this.triggerListener) {
      this.triggerListener.stop();
      this.triggerListener = null;
    }

    if (this.ringBuffer) {
      this.ringBuffer.clear();
      this.ringBuffer = null;
    }

    uninstallInterceptors();
    this.isInitializedState = false;
  }
}

/**
 * Global singleton Repro instance.
 */
export const repro = new ReproSDK();
export default repro;
