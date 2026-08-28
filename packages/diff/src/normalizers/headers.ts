/**
 * HTTP Headers Normalizer (Lowercase, Volatile Filter, Multi-value Sorter)
 * Specification: ADR-006, Story-13, SDD-Repro §3.2
 */

export const VOLATILE_HEADERS: Record<string, true> = {
  'date': true,
  'x-request-id': true,
  'etag': true,
  'server': true,
  'age': true,
  'x-trace-id': true,
  'x-amzn-trace-id': true,
  'x-runtime': true,
  'x-response-time': true,
  'last-modified': true,
  'cf-ray': true,
  'cf-cache-status': true,
  'x-cloud-trace-context': true,
  'x-b3-traceid': true,
  'x-b3-spanid': true,
  'connection': true,
  'keep-alive': true,
  'transfer-encoding': true,
  'x-powered-by': true,
  'report-to': true,
  'nel': true
};

const DO_NOT_SPLIT_HEADERS: Record<string, true> = {
  'authorization': true,
  'cookie': true,
  'set-cookie': true,
  'user-agent': true,
  'if-match': true,
  'if-none-match': true,
  'proxy-authorization': true
};

export interface NormalizeHeadersOptions {
  customVolatileHeaders?: string[];
  preserveVolatile?: boolean;
}

export type RawHeadersInput =
  | Record<string, string | string[] | number | boolean | null | undefined>
  | [string, string][]
  | Array<{ name: string; value: string }>
  | Headers;

/**
 * Normalizes HTTP headers by:
 * 1. Lowercasing all header names.
 * 2. Filtering out volatile/ephemeral headers (date, etag, server, trace ids, etc.).
 * 3. Sorting multi-valued headers lexicographically.
 * 4. Returning an object with keys sorted alphabetically.
 */
export function normalizeHeaders(
  headers: RawHeadersInput | null | undefined,
  options: NormalizeHeadersOptions = {}
): Record<string, string | string[]> {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  const volatileMap: Record<string, true> = { ...VOLATILE_HEADERS };
  if (options.customVolatileHeaders) {
    for (const h of options.customVolatileHeaders) {
      volatileMap[h.toLowerCase()] = true;
    }
  }

  const intermediate: Record<string, string[]> = {};

  // Extract entries from various input formats
  if (headers instanceof Headers) {
    headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase().trim();
      if (!options.preserveVolatile && volatileMap[lowerKey]) return;
      if (!intermediate[lowerKey]) intermediate[lowerKey] = [];
      intermediate[lowerKey].push(val);
    });
  } else if (Array.isArray(headers)) {
    for (const entry of headers) {
      if (Array.isArray(entry) && entry.length >= 2) {
        const [k, v] = entry;
        if (typeof k !== 'string' || v === undefined || v === null) continue;
        const lowerKey = k.toLowerCase().trim();
        if (!options.preserveVolatile && volatileMap[lowerKey]) continue;
        if (!intermediate[lowerKey]) intermediate[lowerKey] = [];
        intermediate[lowerKey].push(String(v));
      } else if (entry && typeof entry === 'object' && 'name' in entry && 'value' in entry) {
        const { name, value } = entry as { name: string; value: string };
        if (typeof name !== 'string' || value === undefined || value === null) continue;
        const lowerKey = name.toLowerCase().trim();
        if (!options.preserveVolatile && volatileMap[lowerKey]) continue;
        if (!intermediate[lowerKey]) intermediate[lowerKey] = [];
        intermediate[lowerKey].push(String(value));
      }
    }
  } else {
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined || value === null) continue;
      const lowerKey = key.toLowerCase().trim();
      if (!options.preserveVolatile && volatileMap[lowerKey]) continue;

      if (!intermediate[lowerKey]) intermediate[lowerKey] = [];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            intermediate[lowerKey].push(String(item));
          }
        }
      } else {
        intermediate[lowerKey].push(String(value));
      }
    }
  }

  // Normalize multi-valued entries and sort keys
  const sortedKeys = Object.keys(intermediate).sort();
  const normalized: Record<string, string | string[]> = {};

  for (const key of sortedKeys) {
    const rawValues = intermediate[key];
    if (rawValues.length === 0) continue;

    if (DO_NOT_SPLIT_HEADERS[key]) {
      // Keep without comma-splitting
      if (rawValues.length === 1) {
        normalized[key] = rawValues[0].trim();
      } else {
        normalized[key] = rawValues.map((v) => v.trim()).sort();
      }
      continue;
    }

    // Split comma-separated tokens (e.g. "gzip, deflate, br")
    const allTokens: string[] = [];
    for (const rawVal of rawValues) {
      const parts = rawVal.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) {
          allTokens.push(trimmed);
        }
      }
    }

    const sortedTokens = allTokens.sort();
    if (sortedTokens.length === 1) {
      normalized[key] = sortedTokens[0];
    } else if (sortedTokens.length > 1) {
      normalized[key] = sortedTokens;
    }
  }

  return normalized;
}
