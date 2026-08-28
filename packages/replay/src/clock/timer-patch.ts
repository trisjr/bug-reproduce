/**
 * Repro Virtual Clock Timer & Date Monkey-Patching
 * Specification: ADR-010 (FR-031, Story-11)
 * Zero external dependencies: Uses Node.js built-in APIs
 */

import { VirtualClock } from './virtual-clock.ts';

interface VirtualTimer {
  id: number;
  callback: Function;
  args: unknown[];
  dueTimeMs: number;
  intervalMs?: number;
  isImmediate?: boolean;
}

let activeClock: VirtualClock | null = null;
let isPatched = false;
let nextTimerId = 1;
const activeTimers = new Map<number, VirtualTimer>();

// Original globals
const OriginalDate = globalThis.Date;
const originalDateNow = globalThis.Date.now;
const originalHrtime = process.hrtime;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
const originalSetImmediate = globalThis.setImmediate;
const originalClearImmediate = globalThis.clearImmediate;

let clockAdvanceListener: ((currentTime: number) => void) | null = null;

/**
 * Executes due timers whose scheduled time is <= current virtual clock time.
 */
export function flushVirtualTimers(): number {
  if (!activeClock) return 0;

  const now = activeClock.now();
  let executedCount = 0;

  // Collect due timers
  const dueTimers: VirtualTimer[] = [];
  for (const timer of activeTimers.values()) {
    if (timer.dueTimeMs <= now) {
      dueTimers.push(timer);
    }
  }

  // Sort chronologically, tie-break by timer ID
  dueTimers.sort((a, b) => a.dueTimeMs - b.dueTimeMs || a.id - b.id);

  for (const timer of dueTimers) {
    if (!activeTimers.has(timer.id)) continue; // might have been cancelled

    if (timer.intervalMs !== undefined && timer.intervalMs > 0) {
      timer.dueTimeMs += timer.intervalMs;
    } else {
      activeTimers.delete(timer.id);
    }

    try {
      timer.callback(...timer.args);
      executedCount++;
    } catch (err) {
      // Uncaught errors in timers should be logged or delegated to process uncaughtException
      process.emit('uncaughtException', err instanceof Error ? err : new Error(String(err)));
    }
  }

  return executedCount;
}

/**
 * Creates custom Date class bound to virtual clock.
 */
function createVirtualDateClass(clock: VirtualClock): typeof Date {
  function PatchedDate(this: unknown, ...args: unknown[]) {
    if (!(this instanceof PatchedDate)) {
      // Called as a function: Date() -> string representation
      return new OriginalDate(clock.now()).toString();
    }

    if (args.length === 0) {
      return new OriginalDate(clock.now());
    }
    if (args.length === 1) {
      return new (OriginalDate as unknown as { new (v: unknown): Date })(args[0]);
    }
    return new (OriginalDate as unknown as { new (...a: unknown[]): Date })(...args);
  }

  PatchedDate.prototype = OriginalDate.prototype;
  PatchedDate.now = () => clock.now();
  PatchedDate.parse = OriginalDate.parse;
  PatchedDate.UTC = OriginalDate.UTC;

  return PatchedDate as unknown as typeof Date;
}

/**
 * Installs virtual clock monkey-patches across all timing primitives.
 */
export function installVirtualClock(clock: VirtualClock): void {
  if (isPatched) {
    uninstallVirtualClock();
  }

  activeClock = clock;
  activeTimers.clear();
  nextTimerId = 1;

  // 1. Patch Date constructor & Date.now
  globalThis.Date = createVirtualDateClass(clock);

  // 2. Patch process.hrtime
  const patchedHrtime = ((previous?: [number, number]) => {
    return clock.getHrTime(previous);
  }) as typeof process.hrtime;
  patchedHrtime.bigint = () => clock.getHrTimeBigInt();
  process.hrtime = patchedHrtime;

  // 3. Patch setTimeout / clearTimeout
  globalThis.setTimeout = ((callback: Function, ms = 0, ...args: unknown[]) => {
    const id = nextTimerId++;
    const delay = typeof ms === 'number' && !Number.isNaN(ms) ? Math.max(0, ms) : 0;
    const dueTimeMs = clock.now() + delay;

    const timer: VirtualTimer = {
      id,
      callback,
      args,
      dueTimeMs,
    };

    activeTimers.set(id, timer);

    // If delay is 0, schedule immediate microtask flush
    if (delay === 0) {
      queueMicrotask(() => flushVirtualTimers());
    }

    return id as unknown as NodeJS.Timeout;
  }) as unknown as typeof setTimeout;

  globalThis.clearTimeout = ((timeoutId: unknown) => {
    if (typeof timeoutId === 'number') {
      activeTimers.delete(timeoutId);
    }
  }) as typeof clearTimeout;

  // 4. Patch setInterval / clearInterval
  globalThis.setInterval = ((callback: Function, ms = 0, ...args: unknown[]) => {
    const id = nextTimerId++;
    const interval = typeof ms === 'number' && !Number.isNaN(ms) ? Math.max(1, ms) : 1;
    const dueTimeMs = clock.now() + interval;

    const timer: VirtualTimer = {
      id,
      callback,
      args,
      dueTimeMs,
      intervalMs: interval,
    };

    activeTimers.set(id, timer);
    return id as unknown as NodeJS.Timeout;
  }) as unknown as typeof setInterval;

  globalThis.clearInterval = ((intervalId: unknown) => {
    if (typeof intervalId === 'number') {
      activeTimers.delete(intervalId);
    }
  }) as typeof clearInterval;

  // 5. Patch setImmediate / clearImmediate
  globalThis.setImmediate = ((callback: Function, ...args: unknown[]) => {
    const id = nextTimerId++;
    const timer: VirtualTimer = {
      id,
      callback,
      args,
      dueTimeMs: clock.now(),
      isImmediate: true,
    };

    activeTimers.set(id, timer);
    queueMicrotask(() => flushVirtualTimers());

    return id as unknown as NodeJS.Immediate;
  }) as unknown as typeof setImmediate;

  globalThis.clearImmediate = ((immediateId: unknown) => {
    if (typeof immediateId === 'number') {
      activeTimers.delete(immediateId);
    }
  }) as typeof clearImmediate;

  // 6. Listen to virtual clock advance events to automatically flush timers
  clockAdvanceListener = () => {
    flushVirtualTimers();
  };
  clock.on('advance', clockAdvanceListener);

  isPatched = true;
}

/**
 * Restores all original time and timer primitives.
 */
export function uninstallVirtualClock(): void {
  if (!isPatched) return;

  if (activeClock && clockAdvanceListener) {
    activeClock.off('advance', clockAdvanceListener);
    clockAdvanceListener = null;
  }

  globalThis.Date = OriginalDate;
  process.hrtime = originalHrtime;
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
  globalThis.setImmediate = originalSetImmediate;
  globalThis.clearImmediate = originalClearImmediate;

  activeTimers.clear();
  activeClock = null;
  isPatched = false;
}

/**
 * Checks if virtual clock is currently installed.
 */
export function isVirtualClockInstalled(): boolean {
  return isPatched;
}

/**
 * Retrieves the currently active VirtualClock instance.
 */
export function getActiveVirtualClock(): VirtualClock | null {
  return activeClock;
}

/**
 * Retrieves number of currently active virtual timers.
 */
export function getActiveTimerCount(): number {
  return activeTimers.size;
}
