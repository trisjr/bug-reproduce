/**
 * Repro Failure-Triggered Capture Listener & Capsule Assembler
 * Specification: ADR-008, SDD-Repro §4.2, Story-04 (Scenario 1), Story-05
 * Zero external dependencies: Uses node:os, node:path, node:fs, node:crypto and @repro/core
 */

import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { randomBytes } from 'node:crypto';
import type {
  InteractionUnit,
  InboundInteraction,
  OutboundInteraction,
  DatabaseInteraction,
  ReproManifest,
  RuntimeMetadata,
  RedactionConfig,
  TriggerReason,
} from '@repro/core';
import { writeCapsule, type WriteCapsuleResult } from '@repro/core';
import { executionContextManager, type ExecutionContext } from '../context/async-storage.ts';
import { generateExecutionId } from '../context/execution-id.ts';
import { FormatPreservingMasker } from '../redaction/masker.ts';
import { BoundedRingBuffer } from './ring-buffer.ts';
import { guardDatabaseInteraction } from './size-guard.ts';

export interface TriggerListenerConfig {
  serviceName?: string;
  appVersion?: string;
  environment?: string;
  outputDir?: string;
  targetCommit?: string;
  keyCustodyUrl?: string;
  redactionConfig?: RedactionConfig;
  ringBuffer?: BoundedRingBuffer;
  onCapsuleCreated?: (result: WriteCapsuleResult, manifest: ReproManifest) => void;
  catchUncaughtExceptions?: boolean;
  catchUnhandledRejections?: boolean;
}

export interface CaptureOptions {
  error?: unknown;
  statusCode?: number;
  triggerType?: 'HTTP_5XX' | 'UNHANDLED_EXCEPTION' | 'MANUAL_DEBUG';
  context?: ExecutionContext;
  customMetadata?: Record<string, unknown>;
}

/**
 * Standard Environment Variables Allowlist (Spec-Security §5.7).
 */
const DEFAULT_ENV_ALLOWLIST = [
  'NODE_ENV',
  'APP_VERSION',
  'GIT_COMMIT',
  'BUILD_ID',
  'SERVICE_NAME',
  'REGION',
  'AZ',
  'DEPLOYMENT_ENV',
  'TZ',
  'LANG',
  'LC_ALL',
  'SCHEMA_VERSION',
  'MIGRATION_VERSION',
  'FEATURE_FLAG_SET_VERSION',
  'LOG_LEVEL',
];

/**
 * TriggerListener monitors application execution lifecycle for failure triggers (HTTP 5xx,
 * unhandled rejections, explicit capture calls) and packages reproducible capsules (ADR-008).
 */
export class TriggerListener {
  private readonly config: TriggerListenerConfig;
  private readonly masker: FormatPreservingMasker;
  private isListening = false;

  private uncaughtExceptionHandler: ((err: Error) => void) | null = null;
  private unhandledRejectionHandler: ((reason: unknown) => void) | null = null;

  constructor(config?: TriggerListenerConfig) {
    this.config = {
      serviceName: config?.serviceName ?? 'repro-service',
      appVersion: config?.appVersion ?? '0.1.0',
      environment: config?.environment ?? process.env['NODE_ENV'] ?? 'development',
      outputDir: config?.outputDir ?? path.join(process.cwd(), '.repro', 'capsules'),
      targetCommit: config?.targetCommit ?? process.env['GIT_COMMIT'] ?? '0000000000000000000000000000000000000000',
      keyCustodyUrl: config?.keyCustodyUrl ?? 'https://custody.repro.internal/api/v1/keys',
      redactionConfig: config?.redactionConfig,
      ringBuffer: config?.ringBuffer,
      onCapsuleCreated: config?.onCapsuleCreated,
      catchUncaughtExceptions: config?.catchUncaughtExceptions ?? false,
      catchUnhandledRejections: config?.catchUnhandledRejections ?? false,
    };

    this.masker = new FormatPreservingMasker({ config: this.config.redactionConfig });
  }

  /**
   * Starts global process listeners if enabled.
   */
  public start(): void {
    if (this.isListening) return;

    if (this.config.catchUncaughtExceptions) {
      this.uncaughtExceptionHandler = (err: Error) => {
        void this.capture({
          error: err,
          triggerType: 'UNHANDLED_EXCEPTION',
        });
      };
      process.on('uncaughtException', this.uncaughtExceptionHandler);
    }

    if (this.config.catchUnhandledRejections) {
      this.unhandledRejectionHandler = (reason: unknown) => {
        void this.capture({
          error: reason,
          triggerType: 'UNHANDLED_EXCEPTION',
        });
      };
      process.on('unhandledRejection', this.unhandledRejectionHandler);
    }

    this.isListening = true;
  }

  /**
   * Stops process event listeners.
   */
  public stop(): void {
    if (!this.isListening) return;

    if (this.uncaughtExceptionHandler) {
      process.removeListener('uncaughtException', this.uncaughtExceptionHandler);
      this.uncaughtExceptionHandler = null;
    }

    if (this.unhandledRejectionHandler) {
      process.removeListener('unhandledRejection', this.unhandledRejectionHandler);
      this.unhandledRejectionHandler = null;
    }

    this.isListening = false;
  }

  /**
   * Captures and packages a failure capsule asynchronously and safely (ADR-008, U-C2).
   */
  public async capture(options?: CaptureOptions): Promise<WriteCapsuleResult | undefined> {
    try {
      const activeCtx = options?.context ?? executionContextManager.getContext();
      const rawInteractions: InteractionUnit[] = activeCtx
        ? [...activeCtx.interactions]
        : (this.config.ringBuffer ? this.config.ringBuffer.drain() : []);

      if (rawInteractions.length === 0 && !options?.error) {
        // Nothing to capture
        return undefined;
      }

      // 1. Redact and guard interactions (SEC-002, SEC-005, SEC-008)
      const sanitizedInteractions: InteractionUnit[] = rawInteractions.map((rawUnit) => {
        if (rawUnit.category === 'POSTGRES_QUERY') {
          return guardDatabaseInteraction(rawUnit as DatabaseInteraction);
        }

        if (rawUnit.category === 'HTTP_INBOUND') {
          const inbound = rawUnit as InboundInteraction;
          return {
            ...inbound,
            data: {
              ...inbound.data,
              headers: this.masker.redactHeaders(inbound.data.headers),
              body: typeof inbound.data.body === 'string' ? this.masker.scrubString(inbound.data.body) : inbound.data.body,
            },
            redacted: true,
          };
        }

        if (rawUnit.category === 'HTTP_OUTBOUND') {
          const outbound = rawUnit as OutboundInteraction;
          return {
            ...outbound,
            data: {
              ...outbound.data,
              headers: this.masker.redactHeaders(outbound.data.headers) as Record<string, string>,
              request_body: typeof outbound.data.request_body === 'string' ? this.masker.scrubString(outbound.data.request_body) : outbound.data.request_body,
              response: {
                ...outbound.data.response,
                headers: this.masker.redactHeaders(outbound.data.response.headers) as Record<string, string>,
                body: typeof outbound.data.response.body === 'string' ? this.masker.scrubString(outbound.data.response.body) : outbound.data.response.body,
              },
            },
            redacted: true,
          };
        }

        return rawUnit;
      });

      // 2. Build Trigger Reason
      const triggerType = options?.triggerType ?? (options?.statusCode && options.statusCode >= 500 ? 'HTTP_5XX' : (options?.error ? 'UNHANDLED_EXCEPTION' : 'MANUAL_DEBUG'));
      const err = options?.error instanceof Error ? options.error : new Error(options?.error ? String(options.error) : 'Manual Repro Capture');

      const triggerReason: TriggerReason = {
        type: triggerType,
        error_name: err.name || 'Error',
        error_message: err.message || 'Unknown error',
        stack_trace: err.stack,
        status_code: options?.statusCode,
      };

      // 3. Build Manifest
      const capsuleId = activeCtx?.executionId ?? generateExecutionId();
      const createdAt = new Date().toISOString();
      const keyId = `key_${capsuleId}`;
      const iv = randomBytes(12).toString('base64');
      const authTag = randomBytes(16).toString('base64');

      const auditSummary = this.masker.getAuditTrail().getSummary();

      const manifest: ReproManifest = {
        format_version: '1.0.0',
        capsule_id: capsuleId,
        created_at: createdAt,
        app_name: this.config.serviceName ?? 'repro-service',
        app_version: this.config.appVersion ?? '0.1.0',
        target_commit: this.config.targetCommit ?? '0000000000000000000000000000000000000000',
        trigger_reason: triggerReason,
        class_assessment: {
          is_supported_class: true,
        },
        encryption_metadata: {
          algorithm: 'AES-256-GCM',
          key_id: keyId,
          custody_endpoint: this.config.keyCustodyUrl ?? 'https://custody.repro.internal/api/v1/keys',
          iv,
          auth_tag: authTag,
        },
        integrity: {
          payload_hmac_sha256: '', // filled by writeCapsule
          compressed_byte_size: 0,
          uncompressed_byte_size: 0,
        },
        redaction_summary: {
          total_fields_redacted: auditSummary.total_fields_redacted,
          has_redactions: auditSummary.has_redactions,
        },
        metadata: {
          trace_id: activeCtx?.traceId ?? capsuleId,
          service_name: this.config.serviceName,
          custom_attributes: options?.customMetadata,
        },
        environment: {
          node_version: process.version,
          os_platform: os.platform(),
          os_arch: os.arch(),
          os_release: os.release(),
          git_commit: this.config.targetCommit ?? '0000000000000000000000000000000000000000',
          env_keys_allowlist: DEFAULT_ENV_ALLOWLIST,
        },
      };

      // 4. Build Runtime Metadata
      const capturedEnvVars: Record<string, string> = {};
      for (const envKey of DEFAULT_ENV_ALLOWLIST) {
        if (process.env[envKey] !== undefined) {
          capturedEnvVars[envKey] = process.env[envKey] as string;
        }
      }

      const runtimeMetadata: RuntimeMetadata = {
        node: {
          version: process.version,
          node_env: process.env['NODE_ENV'],
        },
        git: {
          commit: this.config.targetCommit ?? '0000000000000000000000000000000000000000',
          branch: process.env['GIT_BRANCH'] ?? 'main',
        },
        os: {
          platform: os.platform(),
          arch: os.arch(),
          release: os.release(),
        },
        env: {
          allowlist: DEFAULT_ENV_ALLOWLIST,
          variables: capturedEnvVars,
          redacted_keys: [],
        },
        captured_at: createdAt,
        process_uptime_seconds: process.uptime(),
      };

      // 5. Ensure output directory exists and write capsule
      const outputDirectory = this.config.outputDir ?? path.join(process.cwd(), '.repro', 'capsules');
      await fs.mkdir(outputDirectory, { recursive: true });

      const capsuleFilePath = path.join(outputDirectory, `${capsuleId}.repro.tar.gz`);
      const hmacKey = randomBytes(32); // Session HMAC Key for integrity
      const dek = randomBytes(32);

      const result = await writeCapsule(
        capsuleFilePath,
        manifest,
        sanitizedInteractions,
        runtimeMetadata,
        dek,
        hmacKey
      );

      if (this.config.onCapsuleCreated) {
        this.config.onCapsuleCreated(result, manifest);
      }

      return result;
    } catch (err) {
      // Fail-Safe (§20.7, U-C2): Repro errors must NEVER crash the host application
      if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
        console.error('[Repro TriggerListener] Failed to package capsule:', err);
      }
      return undefined;
    }
  }
}
