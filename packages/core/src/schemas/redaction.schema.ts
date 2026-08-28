/**
 * Repro Redaction Configuration Schema Validator v1
 * Specification: ADR-002, SDD-Repro §4.2, Spec-Security §5 (SEC-011)
 */

export type RedactionStrategy =
  | 'MASK'
  | 'DROP'
  | 'HASH'
  | 'SUBSTITUTE'
  | 'PSEUDONYMIZE'
  | 'REPLACE-FIXED'
  | 'MARK';

export interface RedactionRule {
  pattern: string;
  strategy: RedactionStrategy;
  replacement?: string;
  field_path?: string;
  category?: string;
}

export interface RedactionConfig {
  enabled?: boolean;
  headers?: string[];
  fields?: string[];
  allowlist?: string[];
  denylist?: string[];
  rules?: RedactionRule[];
  mask_patterns?: string[];
  strategies?: Record<string, RedactionStrategy>;
}

export class RedactionValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'RedactionValidationError';
    this.errors = errors;
  }
}

export interface RedactionValidationResult {
  valid: boolean;
  errors: string[];
  config?: RedactionConfig;
}

const VALID_STRATEGIES: Record<string, true> = {
  MASK: true,
  DROP: true,
  HASH: true,
  SUBSTITUTE: true,
  PSEUDONYMIZE: true,
  'REPLACE-FIXED': true,
  MARK: true,
};

/**
 * Built-in default redaction configuration (SEC-011 Default Profile).
 * Fail-closed: ensures sensitive headers and body fields are redacted out-of-the-box.
 */
export const DEFAULT_REDACTION_CONFIG: Readonly<RedactionConfig> = {
  enabled: true,
  headers: [
    'authorization',
    'cookie',
    'set-cookie',
    'proxy-authorization',
    'x-api-key',
    'x-auth-token',
    'proxy-authenticate',
    'session-token',
  ],
  fields: [
    'password',
    'passcode',
    'token',
    'access_token',
    'refresh_token',
    'id_token',
    'secret',
    'client_secret',
    'api_key',
    'apikey',
    'credit_card',
    'card_number',
    'cvv',
    'cvc',
    'ssn',
    'social_security_number',
    'private_key',
    'pin',
  ],
  rules: [
    { pattern: 'password', strategy: 'MASK', replacement: '[REDACTED_PASSWORD]' },
    { pattern: 'token', strategy: 'MASK', replacement: '[REDACTED_TOKEN]' },
    { pattern: 'secret', strategy: 'MASK', replacement: '[REDACTED_SECRET]' },
    { pattern: 'credit_card', strategy: 'MASK', replacement: '[REDACTED_CREDIT_CARD]' },
    { pattern: 'ssn', strategy: 'MASK', replacement: '[REDACTED_SSN]' },
  ],
  mask_patterns: [
    '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', // Email
    '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', // Credit card 16-digit
    '\\b\\d{3}-\\d{2}-\\d{4}\\b', // US SSN
  ],
  strategies: {
    authorization: 'MASK',
    cookie: 'MASK',
    'set-cookie': 'MASK',
  },
};

/**
 * Validates a redaction configuration object.
 */
export function validateRedactionConfig(data: unknown): RedactionValidationResult {
  const errors: string[] = [];

  if (data === undefined || data === null) {
    return {
      valid: true,
      errors: [],
      config: { ...DEFAULT_REDACTION_CONFIG },
    };
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['RedactionConfig must be a non-null object.'],
    };
  }

  const record = data as Record<string, unknown>;

  // 1. enabled
  if (record.enabled !== undefined && typeof record.enabled !== 'boolean') {
    errors.push("Field 'enabled' must be a boolean.");
  }

  // 2. headers & fields & allowlist & denylist
  const stringArrayFields = ['headers', 'fields', 'allowlist', 'denylist', 'mask_patterns'] as const;
  for (const field of stringArrayFields) {
    const val = record[field];
    if (val !== undefined) {
      if (!Array.isArray(val) || val.some((item) => typeof item !== 'string')) {
        errors.push(`Field '${field}' must be an array of strings.`);
      }
    }
  }

  // 3. rules
  if (record.rules !== undefined) {
    if (!Array.isArray(record.rules)) {
      errors.push("Field 'rules' must be an array of RedactionRule objects.");
    } else {
      record.rules.forEach((rule, idx) => {
        if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
          errors.push(`Rule at index ${idx} must be a non-null object.`);
        } else {
          const r = rule as Record<string, unknown>;
          if (!r.pattern || typeof r.pattern !== 'string') {
            errors.push(`Rule at index ${idx} is missing a valid 'pattern' string.`);
          }
          if (!r.strategy || typeof r.strategy !== 'string' || !VALID_STRATEGIES[r.strategy]) {
            errors.push(
              `Rule at index ${idx} has invalid strategy '${String(r.strategy)}'. Allowed: ${Object.keys(VALID_STRATEGIES).join(', ')}.`
            );
          }
        }
      });
    }
  }

  // 4. strategies
  if (record.strategies !== undefined) {
    if (typeof record.strategies !== 'object' || Array.isArray(record.strategies) || record.strategies === null) {
      errors.push("Field 'strategies' must be a record mapping field names to valid RedactionStrategy.");
    } else {
      for (const [k, v] of Object.entries(record.strategies as Record<string, unknown>)) {
        if (typeof v !== 'string' || !VALID_STRATEGIES[v]) {
          errors.push(`Strategy for key '${k}' is invalid '${String(v)}'.`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  const normalized: RedactionConfig = {
    enabled: record.enabled !== undefined ? Boolean(record.enabled) : true,
    headers: (record.headers as string[]) ?? DEFAULT_REDACTION_CONFIG.headers,
    fields: (record.fields as string[]) ?? DEFAULT_REDACTION_CONFIG.fields,
    allowlist: record.allowlist as string[] | undefined,
    denylist: record.denylist as string[] | undefined,
    rules: (record.rules as RedactionRule[]) ?? DEFAULT_REDACTION_CONFIG.rules,
    mask_patterns: (record.mask_patterns as string[]) ?? DEFAULT_REDACTION_CONFIG.mask_patterns,
    strategies: (record.strategies as Record<string, RedactionStrategy>) ?? DEFAULT_REDACTION_CONFIG.strategies,
  };

  return {
    valid: true,
    errors: [],
    config: normalized,
  };
}

/**
 * Asserts that data conforms to RedactionConfig.
 */
export function assertValidRedactionConfig(data: unknown): asserts data is RedactionConfig {
  const result = validateRedactionConfig(data);
  if (!result.valid || !result.config) {
    throw new RedactionValidationError(
      `RedactionConfig validation failed:\n- ${result.errors.join('\n- ')}`,
      result.errors
    );
  }
}

/**
 * Type guard for RedactionConfig.
 */
export function isRedactionConfig(data: unknown): data is RedactionConfig {
  return validateRedactionConfig(data).valid;
}
