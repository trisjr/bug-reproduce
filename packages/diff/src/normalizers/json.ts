/**
 * JSON Canonicalizer (Recursive Key Sorter & Float Normalizer)
 * Specification: ADR-006, Story-13, SDD-Repro §3.2
 */

export interface CanonicalizeOptions {
  floatPrecision?: number;
  parseJsonStrings?: boolean;
}

const DEFAULT_FLOAT_PRECISION = 6;

/**
 * Recursively sorts all keys of an object and rounds floating-point numbers
 * to a standardized precision.
 */
export function canonicalizeValue(data: unknown, options: CanonicalizeOptions = {}): unknown {
  const precision = options.floatPrecision ?? DEFAULT_FLOAT_PRECISION;

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'number') {
    if (!Number.isFinite(data)) {
      return null;
    }
    if (Number.isInteger(data)) {
      return Object.is(data, -0) ? 0 : data;
    }
    const factor = 10 ** precision;
    return Math.round(data * factor) / factor;
  }

  if (typeof data === 'string') {
    if (options.parseJsonStrings && (data.startsWith('{') || data.startsWith('['))) {
      try {
        const parsed = JSON.parse(data);
        return canonicalizeValue(parsed, options);
      } catch {
        return data;
      }
    }
    return data;
  }

  if (typeof data === 'boolean' || typeof data === 'symbol' || typeof data === 'bigint') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => canonicalizeValue(item, options));
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const result: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      if (obj[key] !== undefined) {
        result[key] = canonicalizeValue(obj[key], options);
      }
    }
    return result;
  }

  return data;
}

/**
 * Returns a compact, canonical JSON string with sorted object keys and rounded floats.
 */
export function canonicalizeJson(data: unknown, options: CanonicalizeOptions = {}): string {
  const canonical = canonicalizeValue(data, options);
  return JSON.stringify(canonical === undefined ? null : canonical);
}
