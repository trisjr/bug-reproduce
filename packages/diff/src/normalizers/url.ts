/**
 * URL Normalizer & Path Templater
 * Specification: ADR-006, Story-13, SDD-Repro §3.2
 */

const DUMMY_BASE = 'http://repro.internal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_ID_REGEX = /^\d+$/;
const HEX_ID_REGEX = /^[0-9a-f]{16,}$/i;

/**
 * Safely decodes a percent-encoded string component.
 * If decoding fails due to malformed sequences, returns the original string safely.
 */
export function safeDecodeURIComponent(component: string): string {
  try {
    return decodeURIComponent(component);
  } catch {
    return component;
  }
}

/**
 * Checks if a path segment is a dynamic variable segment (e.g. UUID, numeric ID, long hex).
 */
export function isVariableSegment(segment: string): boolean {
  return NUMERIC_ID_REGEX.test(segment) || UUID_REGEX.test(segment) || HEX_ID_REGEX.test(segment);
}

export interface NormalizeUrlOptions {
  templateVariableSegments?: boolean;
}

/**
 * Normalizes an absolute or relative URL:
 * 1. Safe decoding of percent-encoded characters.
 * 2. Path normalization: collapses redundant slashes (`//` -> `/`), removes trailing slash (except root `/`).
 * 3. Optional path templating: converts dynamic IDs (UUID, numeric, hex) to `:id`.
 * 4. Query normalization: sorts query parameters by key lexicographically; sorts multiple values per key.
 */
export function normalizeUrl(rawUrl: string, options: NormalizeUrlOptions = {}): string {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return '';
  }

  const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl);
  let parsed: URL;

  try {
    parsed = new URL(rawUrl, DUMMY_BASE);
  } catch {
    // If URL parsing completely fails, return sanitized string
    return rawUrl.trim();
  }

  // 1. Path normalization
  const rawPath = parsed.pathname;
  const segments = rawPath
    .split('/')
    .filter((seg, idx, arr) => seg !== '' || idx === 0 || idx === arr.length - 1);

  const normalizedSegments = segments.map((seg) => {
    if (!seg) return '';
    const decoded = safeDecodeURIComponent(seg);
    if (options.templateVariableSegments && isVariableSegment(decoded)) {
      return ':id';
    }
    return decoded;
  });

  let normalizedPath = normalizedSegments.join('/');
  // Collapse duplicate slashes
  normalizedPath = normalizedPath.replace(/\/+/g, '/');

  // Strip trailing slash unless it's just root "/"
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // 2. Query parameter sorting
  const queryParams: Record<string, string[]> = {};
  for (const [key, value] of parsed.searchParams.entries()) {
    const decodedKey = safeDecodeURIComponent(key);
    const decodedValue = safeDecodeURIComponent(value);
    if (!queryParams[decodedKey]) {
      queryParams[decodedKey] = [];
    }
    queryParams[decodedKey].push(decodedValue);
  }

  const sortedKeys = Object.keys(queryParams).sort();
  const queryStringParts: string[] = [];

  for (const key of sortedKeys) {
    const values = queryParams[key].sort();
    for (const val of values) {
      queryStringParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }

  const queryString = queryStringParts.length > 0 ? `?${queryStringParts.join('&')}` : '';

  // 3. Assemble result
  if (isAbsolute) {
    // Remove default ports (80 for http, 443 for https) if present
    const origin = parsed.origin;
    return `${origin}${normalizedPath}${queryString}`;
  }

  return `${normalizedPath}${queryString}`;
}
