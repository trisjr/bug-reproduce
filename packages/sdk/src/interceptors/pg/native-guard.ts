/**
 * Repro PostgreSQL Native Driver Guard
 * Specification: ADR-007 (U-01, U-C1), ADR-005, SEC-037
 *
 * pg-native uses C++ libpq bindings which bypass pure JavaScript prototype hooks.
 * This guard detects native bindings and emits a fail-closed warning or diagnostic.
 */

export interface NativeGuardResult {
  isNative: boolean;
  message?: string;
}

/**
 * Inspects a pg module or client instance for pg-native C++ bindings.
 */
export function checkPgNative(target?: unknown): NativeGuardResult {
  if (!target || typeof target !== 'object') {
    return { isNative: false };
  }

  const obj = target as Record<string, unknown>;

  // Check 1: pg.native exists on the pg module
  if (obj['native'] !== undefined && obj['native'] !== null) {
    return {
      isNative: true,
      message:
        '[Repro NativeGuard] pg.native detected. C++ libpq bindings bypass pure JS prototype interception and cannot be safely captured (ADR-007 §U-01).',
    };
  }

  // Check 2: Target client is a NativeClient instance
  const constructorName = obj.constructor?.name;
  if (constructorName === 'NativeClient' || constructorName === 'BoundPoolNative') {
    return {
      isNative: true,
      message: `[Repro NativeGuard] ${constructorName} instance detected. Native clients cannot be captured in-process.`,
    };
  }

  // Check 3: client._native or client.native property
  if (obj['_native'] !== undefined || obj['isNative'] === true) {
    return {
      isNative: true,
      message: '[Repro NativeGuard] Client has native bindings property enabled.',
    };
  }

  return { isNative: false };
}

/**
 * Checks for pg-native and logs a warning if detected.
 * In fail-closed security mode, it can also raise an error.
 */
export function warnIfPgNative(target?: unknown, failClosed = false): boolean {
  const result = checkPgNative(target);
  if (result.isNative && result.message) {
    console.warn(`[Repro WARNING] ${result.message}`);
    if (failClosed) {
      throw new Error(`[Repro FailClosed] ${result.message}`);
    }
    return true;
  }
  return false;
}
