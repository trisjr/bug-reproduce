/**
 * Repro Rule E9 Fallback Guard (Zero-Egress Strict Defense)
 * Specification: ADR-005 (Decision §5), ADR-004, Story-12 (SEC-034, Rule E9)
 * Zero external dependencies: Uses Node.js built-in APIs
 */

/**
 * Error thrown when an unrecorded interaction attempts to fallback
 * to a real production/external network or database under Rule E9 (Fail-Closed).
 */
export class UnrecordedInteractionFallbackError extends Error {
  public readonly code = 'E9_FALLBACK_PROHIBITED';
  public readonly interactionType: string;
  public readonly target: string;
  public readonly details?: unknown;

  constructor(interactionType: string, target: string, details?: unknown) {
    super(
      `Rule E9 Violation: Unrecorded ${interactionType} interaction attempted fallback to '${target}'. ` +
        `Replay runtime strictly prohibits live network/database fallbacks (Fail-Closed).`
    );
    this.name = 'UnrecordedInteractionFallbackError';
    this.interactionType = interactionType;
    this.target = target;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnrecordedInteractionFallbackError);
    }
  }
}

/**
 * FallbackGuard enforces Rule E9 across all replay execution paths.
 * In Replay mode, there is zero live network fallback. Any missing recording
 * results in immediate divergence reporting or fail-closed error.
 */
export class FallbackGuard {
  /**
   * Always returns false: Live network and external database fallbacks are never allowed in replay.
   */
  public static isFallbackAllowed(): false {
    return false;
  }

  /**
   * Immediately rejects and throws UnrecordedInteractionFallbackError (Rule E9).
   */
  public static assertNoFallback(
    interactionType: string,
    target: string,
    details?: unknown
  ): never {
    throw new UnrecordedInteractionFallbackError(interactionType, target, details);
  }

  /**
   * Enforces Rule E9 on an unrecorded interaction event.
   */
  public static enforce(
    interactionType: string,
    target: string,
    details?: unknown
  ): never {
    return FallbackGuard.assertNoFallback(interactionType, target, details);
  }

  /**
   * Instance method forwarding to static isFallbackAllowed.
   */
  public isFallbackAllowed(): false {
    return FallbackGuard.isFallbackAllowed();
  }

  /**
   * Instance method forwarding to static enforce.
   */
  public enforce(
    interactionType: string,
    target: string,
    details?: unknown
  ): never {
    return FallbackGuard.enforce(interactionType, target, details);
  }
}
