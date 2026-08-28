/**
 * @repro/cli Common Types and Exit Codes
 * Specification: EPIC-05, Story-16, Story-17, Story-18, SDD-Repro §5.2, §5.5
 */

import type {
  ReproManifest,
  InteractionUnit,
  RuntimeMetadata,
  EquivalenceVerdict,
  DivergencePoint,
} from '@repro/core';
import type { ReplaySessionResult } from '@repro/replay';
import type { DivergenceAttributionResult } from '@repro/diff';

/**
 * Standardized POSIX Exit Codes for Repro CLI (Story-18, PRD §5.5, SDD §5.2)
 *
 * 0: Match / Success / Verify Pass (Captured execution no longer reproduces)
 * 1: Fatal Error / Exception / Invalid Configuration / Security Violation
 * 2: Diverged / Bug Reproduced (Execution matched failure baseline)
 * 3: Incomplete Capture / Truncated / Inconclusive execution
 */
export const ExitCode = {
  SUCCESS: 0,
  FATAL: 1,
  DIVERGED: 2,
  INCOMPLETE: 3,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Global CLI Execution Flags
 */
export interface GlobalFlags {
  json?: boolean;
  verbose?: boolean;
  help?: boolean;
  version?: boolean;
  noColor?: boolean;
  dir?: string;
  storeUrl?: string;
  authToken?: string;
}

/**
 * Capsule Entry Item for List Command
 */
export interface CapsuleListItem {
  id: string;
  filePath: string;
  service: string;
  environment: string;
  createdAt: string;
  sizeBytes: number;
  sizeFormatted: string;
  status: 'VALID' | 'CORRUPTED' | 'ENCRYPTED' | 'SHREDDED';
  triggerReason?: string;
}

/**
 * List Command Options & Result
 */
export interface ListOptions extends GlobalFlags {
  remote?: boolean;
  service?: string;
  limit?: number;
}

export interface ListResult {
  capsules: CapsuleListItem[];
  total: number;
  directory: string;
}

/**
 * Pull Command Options & Result
 */
export interface PullOptions extends GlobalFlags {
  out?: string;
  allowInRepo?: boolean;
  forceInsideGit?: boolean;
  overwrite?: boolean;
}

export interface PullResult {
  capsuleId: string;
  destinationPath: string;
  fileMode: string;
  directoryMode: string;
  gitProtected: boolean;
  sizeBytes: number;
}

/**
 * Inspect Command Options & Result
 */
export interface InspectOptions extends GlobalFlags {
  showInteractions?: boolean;
  rawJson?: boolean;
}

export interface InspectResult {
  capsuleId: string;
  filePath: string;
  manifest: ReproManifest;
  runtimeMetadata?: RuntimeMetadata;
  interactionsCount: number;
  interactionsSummary: Record<string, number>;
  interactions?: InteractionUnit[];
  redactionRulesApplied: Array<{ path: string; strategy: string }>;
  integrityChecksums: Record<string, string>;
}

/**
 * Replay Command Options & Result
 */
export interface ReplayOptions extends GlobalFlags {
  port?: number;
  host?: string;
  service?: string;
  clockInitialTimeMs?: number;
  allowUnrecordedRead?: boolean;
  strict?: boolean;
  timeoutMs?: number;
}

export interface ReplayCommandResult {
  capsuleId: string;
  sessionResult: ReplaySessionResult;
  verdict: EquivalenceVerdict;
  matchScore: number;
  checklist: Array<{ title: string; status: 'SUCCESS' | 'SKIPPED' | 'FAILED'; detail?: string }>;
  contractMessage: string;
  exitCode: ExitCodeValue;
}

/**
 * Diff Command Options & Result
 */
export interface DiffOptions extends GlobalFlags {
  port?: number;
  maxWidth?: number;
  showAllInteractions?: boolean;
}

export interface DiffResult {
  capsuleId: string;
  verdict: EquivalenceVerdict;
  renderedDiff: string;
  divergencePoints: DivergencePoint[];
  recordedCount: number;
  replayedCount: number;
  attribution?: DivergenceAttributionResult;
  exitCode: ExitCodeValue;
}

/**
 * Verify Command Options & Result
 */
export interface VerifyOptions extends GlobalFlags {
  port?: number;
  timeoutMs?: number;
  strict?: boolean;
}

export interface VerifyResult {
  capsuleId: string;
  beforeFixReproduced: boolean;
  afterFixNoLongerReproduces: boolean;
  isVerified: boolean;
  verdict: EquivalenceVerdict;
  attribution?: DivergenceAttributionResult;
  summaryReport: string;
  contractMessage: string;
  exitCode: ExitCodeValue;
}

/**
 * Purge Command Options & Result (Story-08, ADR-012)
 */
export interface PurgeOptions extends GlobalFlags {
  capsule?: string;
  capsuleId?: string;
  before?: string;
  hard?: boolean;
  reason?: string;
}

export interface PurgeResult {
  purgedKeys: Array<{ keyId: string; status: string; fileDeleted?: boolean }>;
  totalPurged: number;
  hardDeleteApplied: boolean;
  message: string;
}

/**
 * Keys Command Options & Result
 */
export interface KeysOptions extends GlobalFlags {
  subcommand?: 'rotate' | 'status';
  keyId?: string;
  capsuleId?: string;
}

export interface KeysResult {
  action: 'rotate' | 'status';
  keyId: string;
  status: string;
  newKeyId?: string;
  createdAt?: string;
  expiresAt?: string;
}
