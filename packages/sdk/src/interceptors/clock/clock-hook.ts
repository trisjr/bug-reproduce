/**
 * Repro Clock Observer Interceptor
 * Specification: ADR-007 (U-03), ADR-010, Story-02 (Scenario 4)
 * Zero external dependencies: Uses Node.js built-ins
 */

import type { ClockInteraction, ClockInteractionData } from '@repro/core';
import { executionContextManager } from '../../context/async-storage.ts';
import { generateInteractionId } from '../../context/execution-id.ts';

let isClockPatched = false;
let originalDateNow: typeof Date.now | null = null;
let tickCounter = 0;

/**
 * Records an explicit clock tick interaction into the active execution context.
 */
export function recordClockTick(options?: { is_frozen?: boolean }): ClockInteraction | undefined {
  if (!executionContextManager.isActive()) {
    return undefined;
  }

  const nowMs = Date.now();
  const hrtimeBigint = process.hrtime.bigint().toString();
  const sequenceIdx = executionContextManager.getNextSequenceIndex();
  const offsetMs = executionContextManager.getTimestampOffsetMs();
  tickCounter += 1;

  const clockData: ClockInteractionData = {
    timestamp_ms: nowMs,
    hrtime_bigint: hrtimeBigint,
    tick_count: tickCounter,
    is_frozen: options?.is_frozen ?? false,
  };

  const interaction: ClockInteraction = {
    interaction_id: generateInteractionId('clk'),
    sequence_idx: sequenceIdx,
    category: 'CLOCK_TICK',
    timestamp_offset_ms: offsetMs,
    duration_ms: 0,
    redacted: false,
    truncated: false,
    data: clockData,
  };

  executionContextManager.recordInteraction(interaction);
  return interaction;
}

/**
 * Observes current timestamp, recording a tick if within an active context.
 */
export function observeCurrentTime(): number {
  const now = Date.now();
  if (executionContextManager.isActive()) {
    recordClockTick();
  }
  return now;
}

/**
 * Patches Date.now to observe time progression during execution.
 */
export function patchClockObserver(): boolean {
  if (isClockPatched) return true;

  try {
    originalDateNow = Date.now;
    const original = originalDateNow;

    Date.now = function interceptedDateNow(): number {
      const now = original.call(Date);
      if (executionContextManager.isActive()) {
        // Sample clock observation in execution context
        try {
          recordClockTick();
        } catch {
          // Fail-safe: never disrupt Date.now()
        }
      }
      return now;
    };

    isClockPatched = true;
    return true;
  } catch (err) {
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro ClockInterceptor] Failed to patch clock observer:', err);
    }
    return false;
  }
}

/**
 * Restores original Date.now.
 */
export function unpatchClockObserver(): boolean {
  if (!isClockPatched) return true;

  if (originalDateNow) {
    Date.now = originalDateNow;
    originalDateNow = null;
  }

  isClockPatched = false;
  return true;
}

/**
 * Checks if clock observer is patched.
 */
export function isClockObserverPatched(): boolean {
  return isClockPatched;
}
