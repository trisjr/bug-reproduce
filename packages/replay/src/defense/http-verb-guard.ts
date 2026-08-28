/**
 * Repro HTTP Verb Guard (L1 Outbound Side Effect Defense)
 * Specification: ADR-005 (Default-Deny Write Side Effects), Story-12 (FR-034, SEC-033)
 * Zero external dependencies: Uses Node.js built-in APIs
 */

/**
 * Error thrown when an outbound HTTP request uses a state-mutating method
 * under ADR-005 Default-Deny replay policy (Fail-Closed).
 */
export class HttpVerbBlockedError extends Error {
  public readonly code = 'BLOCKED_HTTP_VERB';
  public readonly method: string;
  public readonly url?: string;
  public readonly reason: string;

  constructor(method: string, url?: string, reason?: string) {
    const formattedReason =
      reason ||
      `HTTP method '${method.toUpperCase()}' is mutating/non-idempotent and prohibited under ADR-005 default-deny policy`;
    super(
      url
        ? `Outbound HTTP write side effect blocked: ${method.toUpperCase()} ${url} (${formattedReason})`
        : `Outbound HTTP write side effect blocked: ${method.toUpperCase()} (${formattedReason})`
    );
    this.name = 'HttpVerbBlockedError';
    this.method = method.toUpperCase();
    this.url = url;
    this.reason = formattedReason;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpVerbBlockedError);
    }
  }
}

/**
 * Allowlist of read-only / safe / idempotent HTTP methods.
 */
const SAFE_HTTP_METHODS: Record<string, true> = {
  GET: true,
  HEAD: true,
  OPTIONS: true,
  TRACE: true,
};

/**
 * HttpVerbGuard inspects outbound HTTP request verbs and enforces strict
 * read-only semantics by denying any mutating methods (POST, PUT, DELETE, PATCH, CONNECT).
 */
export class HttpVerbGuard {
  /**
   * Checks whether the HTTP method is a provably safe/read-only verb.
   */
  public static isSafeVerb(method: string): boolean {
    if (!method || typeof method !== 'string') return false;
    const normalized = method.trim().toUpperCase();
    return Boolean(SAFE_HTTP_METHODS[normalized]);
  }

  /**
   * Asserts that an outbound HTTP request method is safe.
   * Throws HttpVerbBlockedError if the method is mutating or unrecognized.
   */
  public static assertSafeVerb(method: string, url?: string): void {
    if (!HttpVerbGuard.isSafeVerb(method)) {
      const normalized = typeof method === 'string' ? method.trim().toUpperCase() : 'UNKNOWN';
      throw new HttpVerbBlockedError(
        normalized,
        url,
        `HTTP verb '${normalized}' is not in the safe read-only allowlist (GET, HEAD, OPTIONS, TRACE)`
      );
    }
  }

  /**
   * Instance method forwarding to static isSafeVerb.
   */
  public isSafeVerb(method: string): boolean {
    return HttpVerbGuard.isSafeVerb(method);
  }

  /**
   * Instance method forwarding to static assertSafeVerb.
   */
  public assertSafeVerb(method: string, url?: string): void {
    HttpVerbGuard.assertSafeVerb(method, url);
  }
}
