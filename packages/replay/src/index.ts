/**
 * @repro/replay - Deterministic Replay Runtime, Write Defense & Virtual Clock
 * Specification: ADR-003, ADR-004, ADR-005, ADR-006, ADR-010, Story-09, Story-10, Story-11, Story-12
 */

import { Buffer } from 'node:buffer';
import type { ReplaySessionOptions, ReplaySessionResult } from './engine/session.ts';
import { ReplaySession } from './engine/session.ts';

// 1. Layer 1 Write Defense & Security Guards (ADR-005, Story-12)
export * from './defense/index.ts';

// 2. Replay Engine & Lifecycle Coordinator (Story-09, Story-10)
export * from './engine/index.ts';

// 3. Synthetic Inbound Request Trigger & U0 Injector (Story-09)
export * from './trigger/index.ts';

// 4. Mock Adapters (PostgreSQL, Outbound HTTP, Feature Flags) (ADR-003, ADR-004)
export * from './adapters/index.ts';

// 5. Deterministic Virtual Clock & Timer Monkey-Patches (ADR-010, Story-11)
export * from './clock/index.ts';

/**
 * High-level ReplayRunner utility for one-line replay execution.
 */
export class ReplayRunner {
  /**
   * Runs a complete end-to-end replay session from a capsule path or buffer.
   */
  public static async run(
    capsulePathOrBuffer: string | Buffer,
    options: ReplaySessionOptions = {}
  ): Promise<ReplaySessionResult> {
    const session = new ReplaySession(options);
    await session.load(capsulePathOrBuffer);
    session.arm();
    await session.inject();
    return session.complete();
  }

  /**
   * Creates and initializes a new ReplaySession.
   */
  public static createSession(options: ReplaySessionOptions = {}): ReplaySession {
    return new ReplaySession(options);
  }
}
