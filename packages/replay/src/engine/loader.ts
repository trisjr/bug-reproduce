/**
 * Repro Capsule Loader & Interaction Indexer
 * Specification: ADR-002, ADR-012, Story-09 (Scenario 1..3), Story-10, SEC-027
 * Zero external dependencies: Uses Node.js built-in APIs and @repro/core
 */

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type {
  ReproManifest,
  InteractionUnit,
  InboundInteraction,
  DatabaseInteraction,
  OutboundInteraction,
  ClockInteraction,
  FlagInteraction,
  RuntimeMetadata,
  InteractionCategory,
} from '@repro/core';
import { readCapsule, InMemoryKeyVault, KeyCustodyClient } from '@repro/core';

/**
 * Error thrown when capsule uses an unsupported major format version (Story-09 Scenario 3).
 */
export class UnsupportedFormatVersionError extends Error {
  public readonly code = 'UNSUPPORTED_FORMAT_VERSION';
  public readonly version: string;

  constructor(version: string) {
    super(
      `UNSUPPORTED_FORMAT_VERSION: Capsule format version '${version}' is not supported by this runtime. ` +
        `Please upgrade your @repro/cli or runtime package to replay this capsule.`
    );
    this.name = 'UnsupportedFormatVersionError';
    this.version = version;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedFormatVersionError);
    }
  }
}

/**
 * Error thrown when capsule payload integrity or digest check fails (SEC-027).
 */
export class CapsuleIntegrityError extends Error {
  public readonly code = 'CAPSULE_INTEGRITY_FAILED';

  constructor(message: string) {
    super(`Capsule integrity check failed (SEC-027): ${message}`);
    this.name = 'CapsuleIntegrityError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CapsuleIntegrityError);
    }
  }
}

/**
 * Error thrown when a required decryption key (DEK) cannot be resolved.
 */
export class MissingKeyError extends Error {
  public readonly code = 'MISSING_DECRYPTION_KEY';
  public readonly keyId?: string;

  constructor(message: string, keyId?: string) {
    super(message);
    this.name = 'MissingKeyError';
    this.keyId = keyId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingKeyError);
    }
  }
}

/**
 * InteractionIndex manages and provides fast deterministic indexing and querying
 * over recorded interaction units from a loaded capsule.
 */
export class InteractionIndex {
  private readonly interactions: InteractionUnit[] = [];
  private readonly bySequence = new Map<number, InteractionUnit>();
  private readonly byId = new Map<string, InteractionUnit>();
  private readonly byCategory = new Map<InteractionCategory, InteractionUnit[]>();
  private initialInbound: InboundInteraction | null = null;
  private readonly consumedIds = new Set<string>();

  constructor(interactions: InteractionUnit[] = []) {
    this.interactions = [...interactions].sort((a, b) => a.sequence_idx - b.sequence_idx);
    this.buildIndexes();
  }

  private buildIndexes(): void {
    this.bySequence.clear();
    this.byId.clear();
    this.byCategory.clear();
    this.initialInbound = null;

    for (const item of this.interactions) {
      this.bySequence.set(item.sequence_idx, item);
      this.byId.set(item.interaction_id, item);

      const catList = this.byCategory.get(item.category) || [];
      catList.push(item);
      this.byCategory.set(item.category, catList);

      if (item.category === 'HTTP_INBOUND' && !this.initialInbound) {
        this.initialInbound = item as InboundInteraction;
      }
    }
  }

  /**
   * Returns the initial inbound interaction U0 representing the entrypoint request (Story-09).
   */
  public getInitialInbound(): InboundInteraction | null {
    return this.initialInbound;
  }

  /**
   * Returns all recorded interaction units in sequence order.
   */
  public getInteractions(): InteractionUnit[] {
    return [...this.interactions];
  }

  /**
   * Returns interactions filtered by category.
   */
  public getInteractionsByCategory<T extends InteractionUnit = InteractionUnit>(
    category: InteractionCategory
  ): T[] {
    return (this.byCategory.get(category) || []) as T[];
  }

  /**
   * Returns all recorded database interactions (PostgreSQL).
   */
  public getDatabaseInteractions(): DatabaseInteraction[] {
    return this.getInteractionsByCategory<DatabaseInteraction>('POSTGRES_QUERY');
  }

  /**
   * Returns all recorded outbound HTTP/HTTPS interactions.
   */
  public getHttpInteractions(): OutboundInteraction[] {
    return this.getInteractionsByCategory<OutboundInteraction>('HTTP_OUTBOUND');
  }

  /**
   * Returns all recorded clock tick interactions.
   */
  public getClockInteractions(): ClockInteraction[] {
    return this.getInteractionsByCategory<ClockInteraction>('CLOCK_TICK');
  }

  /**
   * Returns all recorded feature flag interactions.
   */
  public getFlagInteractions(): FlagInteraction[] {
    return this.getInteractionsByCategory<FlagInteraction>('FEATURE_FLAG');
  }

  /**
   * Finds interaction by its monotonic sequence index.
   */
  public getBySequence(seq: number): InteractionUnit | null {
    return this.bySequence.get(seq) || null;
  }

  /**
   * Finds interaction by its UUID/ID.
   */
  public getById(id: string): InteractionUnit | null {
    return this.byId.get(id) || null;
  }

  /**
   * Returns the total count of recorded interactions.
   */
  public count(): number {
    return this.interactions.length;
  }

  /**
   * Consumes the next unconsumed interaction in a category (FIFO queue).
   */
  public consumeNext<T extends InteractionUnit = InteractionUnit>(
    category: InteractionCategory
  ): T | null {
    const list = this.getInteractionsByCategory<T>(category);
    for (const item of list) {
      if (!this.consumedIds.has(item.interaction_id)) {
        this.consumedIds.add(item.interaction_id);
        return item;
      }
    }
    return null;
  }

  /**
   * Resets consumption tracking.
   */
  public reset(): void {
    this.consumedIds.clear();
  }
}

/**
 * Options for loading a Repro capsule archive.
 */
export interface CapsuleLoaderOptions {
  /** Optional pre-shared Data Encryption Key */
  dek?: Buffer | Uint8Array;
  /** Optional HMAC integrity verification key (SEC-027) */
  hmacKey?: Buffer | Uint8Array | string;
  /** Local in-memory vault for resolving DEK (ADR-012) */
  vault?: InMemoryKeyVault;
  /** Remote key custody client for resolving DEK (ADR-012) */
  custodyClient?: KeyCustodyClient;
  /** Current local git commit hash to perform drift warning check (Story-09 Scenario 2) */
  currentCommit?: string;
  /** Expected target commit hash */
  expectedCommit?: string;
}

/**
 * Loaded capsule payload containing parsed manifest, indexed interactions, and metadata.
 */
export interface LoadedCapsule {
  manifest: ReproManifest;
  interactions: InteractionUnit[];
  index: InteractionIndex;
  runtimeMetadata: RuntimeMetadata;
  checksums: Record<string, string>;
  driftWarning?: string;
}

/**
 * CapsuleLoader unpacks, validates, verifies integrity, and indexes Repro capsule archives (.repro.tar.gz).
 */
export class CapsuleLoader {
  /**
   * Loads a Repro capsule from a file path on disk.
   */
  public static async load(
    capsulePath: string,
    options: CapsuleLoaderOptions = {}
  ): Promise<LoadedCapsule> {
    if (!capsulePath || typeof capsulePath !== 'string') {
      throw new Error("Missing required 'capsulePath'.");
    }

    let dekBuffer = options.dek ? Buffer.from(options.dek) : undefined;

    // 1. Initial read and unpack using core reader
    let rawResult;
    try {
      rawResult = await readCapsule(capsulePath, dekBuffer, options.hmacKey);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('Integrity') || errMsg.includes('Checksum') || errMsg.includes('HMAC')) {
        throw new CapsuleIntegrityError(errMsg);
      }
      throw err;
    }

    const { manifest, interactions, runtimeMetadata, checksums } = rawResult;

    // 2. Format Version Check (Story-09 Scenario 3)
    const formatVersion = manifest.format_version || '1.0.0';
    const majorVersion = formatVersion.split('.')[0];
    if (majorVersion !== '1') {
      throw new UnsupportedFormatVersionError(formatVersion);
    }

    // 3. Resolve DEK if needed and not already provided
    if (!dekBuffer && manifest.encryption_metadata?.key_id) {
      const keyId = manifest.encryption_metadata.key_id;
      if (options.vault) {
        const vaultDek = options.vault.get(keyId);
        if (vaultDek) {
          dekBuffer = vaultDek;
        }
      } else if (options.custodyClient) {
        try {
          dekBuffer = await options.custodyClient.retrieveDek(keyId);
        } catch (err: unknown) {
          throw new MissingKeyError(
            `Failed to retrieve DEK '${keyId}' from Key Custody Service: ${err instanceof Error ? err.message : String(err)}`,
            keyId
          );
        }
      }
    }

    // 4. Code Drift Check (Story-09 Scenario 2)
    let driftWarning: string | undefined;
    const currentCommit = options.currentCommit || options.expectedCommit;
    if (currentCommit && manifest.target_commit) {
      const localClean = currentCommit.trim().toLowerCase();
      const targetClean = manifest.target_commit.trim().toLowerCase();
      if (localClean !== targetClean) {
        const prodShort = targetClean.slice(0, 7);
        const localShort = localClean.slice(0, 7);
        driftWarning = `⚠️ Warning: Code mismatch (Production: ${prodShort} vs Local: ${localShort}). Replay may diverge.`;
      }
    }

    // 5. Index interactions
    const index = new InteractionIndex(interactions);

    return {
      manifest,
      interactions,
      index,
      runtimeMetadata,
      checksums,
      driftWarning,
    };
  }

  /**
   * Loads a Repro capsule from an in-memory buffer.
   */
  public static async loadFromBuffer(
    buffer: Buffer,
    options: CapsuleLoaderOptions = {}
  ): Promise<LoadedCapsule> {
    const tempPath = join(
      tmpdir(),
      `repro_capsule_${Date.now()}_${randomBytes(8).toString('hex')}.repro.tar.gz`
    );

    await fs.writeFile(tempPath, buffer);
    try {
      return await CapsuleLoader.load(tempPath, options);
    } finally {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore temp file unlink failure
      }
    }
  }
}
