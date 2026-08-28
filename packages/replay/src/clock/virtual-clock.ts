/**
 * Repro Deterministic Virtual Clock
 * Specification: ADR-010 (FR-031, Story-11, U-13)
 * Zero external dependencies: Uses Node.js built-in APIs and @repro/core
 */

import { EventEmitter } from 'node:events';
import type { ClockInteraction } from '@repro/core';

export interface VirtualClockOptions {
  /** Initial timestamp T0 in milliseconds (epoch) */
  initialTimeMs?: number;
  /** Optional sequence of ClockInteraction items */
  interactions?: ClockInteraction[];
}

/**
 * VirtualClock freezes time at initial timestamp T0 and progresses monotonically
 * based on interaction sequence or explicit manual progression.
 */
export class VirtualClock extends EventEmitter {
  private readonly initialTimeMs: number;
  private currentTimeMs: number;
  private tickCount = 0;
  private readonly clockInteractions: ClockInteraction[] = [];
  private interactionCursor = 0;

  constructor(options: VirtualClockOptions | number = {}) {
    super();

    if (typeof options === 'number') {
      this.initialTimeMs = options;
      this.currentTimeMs = options;
    } else {
      let startTime = options.initialTimeMs;
      if (options.interactions && options.interactions.length > 0) {
        this.clockInteractions = [...options.interactions].sort(
          (a, b) => a.sequence_idx - b.sequence_idx
        );
        if (!startTime) {
          startTime = this.clockInteractions[0]?.data.timestamp_ms;
        }
      }

      this.initialTimeMs = startTime ?? Date.now();
      this.currentTimeMs = this.initialTimeMs;
    }
  }

  /**
   * Returns the frozen initial timestamp T0.
   */
  public getInitialTime(): number {
    return this.initialTimeMs;
  }

  /**
   * Returns the current virtual timestamp in epoch milliseconds.
   */
  public now(): number {
    return this.currentTimeMs;
  }

  /**
   * Returns current virtual time as a Date object.
   */
  public nowDate(): Date {
    return new Date(this.currentTimeMs);
  }

  /**
   * Returns total monotonic tick count.
   */
  public getTickCount(): number {
    return this.tickCount;
  }

  /**
   * Monotonically advances the virtual clock to target timestamp.
   * If target is less than current time, does not go backward (monotonic constraint).
   */
  public advanceTo(targetTimestampMs: number): void {
    if (targetTimestampMs > this.currentTimeMs) {
      const prev = this.currentTimeMs;
      this.currentTimeMs = targetTimestampMs;
      this.tickCount += 1;
      this.emit('advance', this.currentTimeMs, prev);
    }
  }

  /**
   * Advances the virtual clock by a delta duration in milliseconds.
   */
  public advanceBy(deltaMs: number): void {
    if (deltaMs > 0) {
      this.advanceTo(this.currentTimeMs + deltaMs);
    }
  }

  /**
   * Consumes and advances to the next recorded ClockInteraction timestamp.
   */
  public nextInteraction(): ClockInteraction | null {
    if (this.interactionCursor < this.clockInteractions.length) {
      const interaction = this.clockInteractions[this.interactionCursor++];
      if (interaction.data.timestamp_ms) {
        this.advanceTo(interaction.data.timestamp_ms);
      }
      return interaction;
    }
    return null;
  }

  /**
   * Resets virtual clock back to initial timestamp T0.
   */
  public reset(): void {
    this.currentTimeMs = this.initialTimeMs;
    this.tickCount = 0;
    this.interactionCursor = 0;
    this.emit('reset', this.initialTimeMs);
  }

  /**
   * Emulates process.hrtime([prevSeconds, prevNanoseconds]).
   */
  public getHrTime(previous?: [number, number]): [number, number] {
    const elapsedMs = this.currentTimeMs - this.initialTimeMs;
    const totalNanos = BigInt(Math.max(0, elapsedMs)) * 1_000_000n;

    let seconds = Number(totalNanos / 1_000_000_000n);
    let nanos = Number(totalNanos % 1_000_000_000n);

    if (previous && Array.isArray(previous) && previous.length === 2) {
      seconds -= previous[0];
      nanos -= previous[1];
      if (nanos < 0) {
        seconds -= 1;
        nanos += 1_000_000_000;
      }
    }

    return [Math.max(0, seconds), Math.max(0, nanos)];
  }

  /**
   * Emulates process.hrtime.bigint().
   */
  public getHrTimeBigInt(): bigint {
    const elapsedMs = this.currentTimeMs - this.initialTimeMs;
    return BigInt(Math.max(0, elapsedMs)) * 1_000_000n;
  }
}
