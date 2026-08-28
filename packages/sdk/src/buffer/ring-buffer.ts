/**
 * Repro Bounded Ring Buffer (ADR-008, Story-04)
 * Specification: ADR-008, SDD-Repro §4.1, Story-04
 * Zero external dependencies: Uses native JavaScript arrays and Buffer calculations
 */

import { Buffer } from 'node:buffer';
import type { InteractionUnit } from '@repro/core';

export interface RingBufferOptions {
  /**
   * Maximum number of interaction units stored in memory per buffer instance.
   * Default: 1000 items
   */
  maxInteractions?: number;

  /**
   * Maximum total byte capacity in memory.
   * Default: 10 MB (10 * 1024 * 1024 bytes)
   */
  maxBytes?: number;
}

export interface RingBufferStats {
  currentCount: number;
  currentBytes: number;
  maxInteractions: number;
  maxBytes: number;
  totalEnqueued: number;
  droppedCount: number;
  hasOverflow: boolean;
}

interface BufferEntry {
  interaction: InteractionUnit;
  byteSize: number;
}

/**
 * Estimates the memory footprint of an InteractionUnit in bytes.
 */
export function estimateInteractionSize(unit: InteractionUnit): number {
  try {
    return Buffer.byteLength(JSON.stringify(unit) ?? '', 'utf8');
  } catch {
    return 256; // conservative fallback estimate
  }
}

/**
 * In-memory circular/bounded ring buffer implementing FIFO drop-oldest on saturation (ADR-008).
 * Ensures zero external egress on successful executions (200 OK) and bounded memory usage.
 */
export class BoundedRingBuffer {
  public readonly maxInteractions: number;
  public readonly maxBytes: number;

  private entries: BufferEntry[] = [];
  private currentBytes = 0;
  private totalEnqueued = 0;
  private droppedCount = 0;
  private hasOverflow = false;

  constructor(options?: RingBufferOptions) {
    this.maxInteractions = options?.maxInteractions ?? 1000;
    this.maxBytes = options?.maxBytes ?? 10 * 1024 * 1024; // 10 MB default
  }

  /**
   * Pushes an interaction into the ring buffer.
   * If capacity (item count or byte limit) is exceeded, oldest items are dropped (FIFO).
   *
   * @param interaction The interaction unit to buffer
   * @returns boolean true if successfully buffered
   */
  public push(interaction: InteractionUnit): boolean {
    const itemBytes = estimateInteractionSize(interaction);

    // If a single interaction is larger than the entire buffer limit, skip it and mark overflow
    if (itemBytes > this.maxBytes) {
      this.droppedCount++;
      this.hasOverflow = true;
      return false;
    }

    // Evict oldest items while buffer would exceed limits
    while (
      this.entries.length > 0 &&
      (this.entries.length + 1 > this.maxInteractions || this.currentBytes + itemBytes > this.maxBytes)
    ) {
      const oldest = this.entries.shift();
      if (oldest) {
        this.currentBytes -= oldest.byteSize;
        this.droppedCount++;
        this.hasOverflow = true;
      }
    }

    this.entries.push({
      interaction,
      byteSize: itemBytes,
    });

    this.currentBytes += itemBytes;
    this.totalEnqueued++;

    return true;
  }

  /**
   * Drains and returns all interactions currently in the buffer, clearing the buffer.
   * Used when packaging a capsule upon failure trigger (5xx or unhandled exception).
   */
  public drain(): InteractionUnit[] {
    const interactions = this.entries.map((e) => e.interaction);
    this.clear();
    return interactions;
  }

  /**
   * Returns a shallow copy of all buffered interactions without removing them.
   */
  public peek(): InteractionUnit[] {
    return this.entries.map((e) => e.interaction);
  }

  /**
   * Discards all buffered interactions and resets byte counter (Zero Egress on 200 OK).
   */
  public clear(): void {
    this.entries = [];
    this.currentBytes = 0;
  }

  /**
   * Resets all buffer state including dropped count and overflow flags.
   */
  public reset(): void {
    this.clear();
    this.totalEnqueued = 0;
    this.droppedCount = 0;
    this.hasOverflow = false;
  }

  /**
   * Returns current buffer statistics and metrics.
   */
  public getStats(): RingBufferStats {
    return {
      currentCount: this.entries.length,
      currentBytes: this.currentBytes,
      maxInteractions: this.maxInteractions,
      maxBytes: this.maxBytes,
      totalEnqueued: this.totalEnqueued,
      droppedCount: this.droppedCount,
      hasOverflow: this.hasOverflow,
    };
  }

  /**
   * Returns the number of currently buffered interactions.
   */
  public get length(): number {
    return this.entries.length;
  }

  /**
   * Returns true if any items were dropped due to buffer overflow.
   */
  public get overflowed(): boolean {
    return this.hasOverflow;
  }
}
