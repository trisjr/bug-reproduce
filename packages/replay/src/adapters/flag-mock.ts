/**
 * Repro Feature Flag Replay Mock Adapter
 * Specification: ADR-004, ADR-010, Story-10 (FR-030, Rule E9)
 * Zero external dependencies: Uses Node.js built-in APIs and @repro/core
 */

import type { FlagInteraction } from '@repro/core';

/**
 * Error thrown when an unrecorded feature flag interaction occurs during replay (Fail-Closed).
 */
export class UnrecordedFlagInteractionError extends Error {
  public readonly code = 'REPRO_UNRECORDED_INTERACTION';
  public readonly flagName: string;

  constructor(message: string, flagName: string) {
    super(
      message ||
        `Unrecorded Feature Flag: "${flagName}". Fail-closed: No live flag provider fallback allowed (ADR-004, Rule E9).`
    );
    this.name = 'UnrecordedFlagInteractionError';
    this.flagName = flagName;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnrecordedFlagInteractionError);
    }
  }
}

/**
 * FlagMockAdapter provides deterministic feature flag values recorded in the capsule.
 */
export class FlagMockAdapter {
  private readonly flagsByName = new Map<string, unknown>();
  private readonly rawInteractions: FlagInteraction[] = [];

  constructor(interactions: FlagInteraction[] = []) {
    this.loadInteractions(interactions);
  }

  /**
   * Loads flag interactions from capsule.
   */
  public loadInteractions(interactions: FlagInteraction[]): void {
    this.rawInteractions.length = 0;
    this.rawInteractions.push(...interactions);
    this.flagsByName.clear();

    for (const item of interactions) {
      const name = item.data.flag_name || item.data.flag_key;
      if (name) {
        this.flagsByName.set(name, item.data.value);
      }
    }
  }

  /**
   * Checks if a flag exists in the recorded capsule.
   */
  public hasFlag(name: string): boolean {
    return this.flagsByName.has(name);
  }

  /**
   * Retrieves raw recorded value for a flag.
   * Throws UnrecordedFlagInteractionError if flag is missing and no default is provided.
   */
  public getFlag<T = unknown>(name: string, defaultValue?: T): T {
    if (this.flagsByName.has(name)) {
      return this.flagsByName.get(name) as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new UnrecordedFlagInteractionError(
      `REPRO_UNRECORDED_INTERACTION: Feature flag "${name}" is not recorded in capsule.`,
      name
    );
  }

  /**
   * Retrieves boolean flag value.
   */
  public getBoolean(name: string, defaultValue?: boolean): boolean {
    const val = this.getFlag(name, defaultValue);
    return Boolean(val);
  }

  /**
   * Retrieves string flag value.
   */
  public getString(name: string, defaultValue?: string): string {
    const val = this.getFlag(name, defaultValue);
    return String(val ?? '');
  }

  /**
   * Retrieves number flag value.
   */
  public getNumber(name: string, defaultValue?: number): number {
    const val = this.getFlag(name, defaultValue);
    return Number(val ?? 0);
  }

  /**
   * Retrieves object/JSON flag value.
   */
  public getObject<T = Record<string, unknown>>(name: string, defaultValue?: T): T {
    const val = this.getFlag(name, defaultValue);
    return val as T;
  }

  /**
   * Returns a dictionary of all recorded flags and their values.
   */
  public getAllFlags(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of this.flagsByName.entries()) {
      result[k] = v;
    }
    return result;
  }

  /**
   * Evaluates a list of flag names against recorded values.
   */
  public evaluateFlags(names: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const name of names) {
      result[name] = this.getBoolean(name, false);
    }
    return result;
  }

  /**
   * Creates an evaluator function suitable for drop-in replacement of application flag evaluators.
   */
  public createFlagEvaluator(
    defaultFlagNames: string[] = []
  ): (log?: unknown, flagNames?: string[]) => Record<string, boolean> {
    return (_log, flagNames) => {
      const names = flagNames || defaultFlagNames;
      return this.evaluateFlags(names);
    };
  }
}
