/**
 * Repro Redaction Rules & Regex Primitives
 * Specification: ADR-002, SDD-Repro §4.2, Spec-Security-Repro §5, SEC-002, SEC-005, SEC-007
 * Zero external dependencies: Uses native RegExp and JavaScript algorithms
 */

import type { RedactionConfig, RedactionRule } from '@repro/core';

/**
 * Static lookup table of HTTP headers that MUST NEVER be stored in plain text or persisted (SEC-002).
 */
export const NEVER_STORE_HEADERS: Record<string, true> = {
  authorization: true,
  'proxy-authorization': true,
  cookie: true,
  'set-cookie': true,
  'x-api-key': true,
  'x-auth-token': true,
  'x-access-token': true,
  'x-csrf-token': true,
  'x-amz-security-token': true,
  'proxy-authenticate': true,
  'session-token': true,
};

/**
 * Sensitive field names (in JSON body or query params) that require automatic redaction.
 */
export const NEVER_STORE_FIELDS: Record<string, true> = {
  password: true,
  passwd: true,
  pwd: true,
  secret: true,
  client_secret: true,
  private_key: true,
  token: true,
  access_token: true,
  refresh_token: true,
  id_token: true,
  api_key: true,
  apikey: true,
  otp: true,
  pin: true,
  mfa_code: true,
  session: true,
  credit_card: true,
  card_number: true,
  pan: true,
  cvv: true,
  cvc: true,
  cvv2: true,
  track_data: true,
  ssn: true,
  social_security_number: true,
  tax_id: true,
  national_id: true,
  cmnd: true,
  cccd: true,
  passport_no: true,
  driver_license: true,
};

/**
 * Common Regular Expressions for Content Scrubbing (SEC-005, SEC-007).
 */
export const REDACTION_PATTERNS = {
  /**
   * Standard Email pattern: local_part@domain.tld
   */
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

  /**
   * Credit card numbers (13 to 19 digits, with optional hyphens or spaces).
   */
  PAN_CANDIDATE: /\b(?:\d[ -]*?){13,19}\b/g,

  /**
   * Strict 16-digit formatted credit card: 1234-5678-9012-3456
   */
  CREDIT_CARD_FORMATTED: /\b\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}\b/g,

  /**
   * US Social Security Number (SSN): 123-45-6789
   */
  US_SSN: /\b\d{3}-\d{2}-\d{4}\b/g,

  /**
   * Bearer Authentication Token header value (Bearer eyJ... or Bearer <token>)
   */
  BEARER_TOKEN: /Bearer\s+([A-Za-z0-9-_~+/=.]+)/gi,

  /**
   * JSON Web Token (JWT) formatted strings: eyJ...eyJ...xxx
   */
  JWT_TOKEN: /\beyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g,

  /**
   * Generic API Keys (e.g. sk_live_..., sk_test_..., AKIA..., etc.)
   */
  API_KEY: /\b(?:sk_live_|sk_test_|ghp_|gho_|xoxb-|xoxp-|AKIA)[A-Za-z0-9_]{16,}\b/g,

  /**
   * Phone numbers (International and US formatted phone numbers).
   */
  PHONE_NUMBER: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
} as const;

/**
 * Validates whether a candidate number string satisfies the Luhn algorithm (MOD 10 Checksum) (SEC-005).
 *
 * @param cardNumber Raw numeric string (can contain dashes or spaces)
 * @returns true if the card number passes the Luhn checksum
 */
export function isValidLuhn(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;

  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = parseInt(digits.charAt(i), 10);
    if (Number.isNaN(digit)) return false;

    let val = digit;
    if (shouldDouble) {
      val *= 2;
      if (val > 9) {
        val -= 9;
      }
    }

    sum += val;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Built-in default SDK Redaction Rules list conforming to SEC-002, SEC-005, SEC-007.
 */
export const DEFAULT_SDK_REDACTION_RULES: RedactionRule[] = [
  // 1. Passwords & Credentials
  {
    pattern: 'password',
    strategy: 'REPLACE-FIXED',
    replacement: '[REDACTED_PASSWORD]',
    category: 'CREDENTIAL',
  },
  {
    pattern: 'secret',
    strategy: 'REPLACE-FIXED',
    replacement: '[REDACTED_SECRET]',
    category: 'CREDENTIAL',
  },
  {
    pattern: 'token',
    strategy: 'REPLACE-FIXED',
    replacement: '[REDACTED_TOKEN]',
    category: 'CREDENTIAL',
  },
  {
    pattern: 'api_key',
    strategy: 'REPLACE-FIXED',
    replacement: '[REDACTED_API_KEY]',
    category: 'CREDENTIAL',
  },

  // 2. Financial & Payment Data (PCI DSS / SEC-005)
  {
    pattern: 'credit_card',
    strategy: 'MASK',
    replacement: '[REDACTED_PAN]',
    category: 'PCI',
  },
  {
    pattern: 'card_number',
    strategy: 'MASK',
    replacement: '[REDACTED_PAN]',
    category: 'PCI',
  },
  {
    pattern: 'cvv',
    strategy: 'REPLACE-FIXED',
    replacement: 'XXX',
    category: 'PCI',
  },
  {
    pattern: 'cvc',
    strategy: 'REPLACE-FIXED',
    replacement: 'XXX',
    category: 'PCI',
  },

  // 3. PII (Personal Identifiable Information)
  {
    pattern: 'email',
    strategy: 'PSEUDONYMIZE',
    category: 'PII',
  },
  {
    pattern: 'phone',
    strategy: 'MASK',
    category: 'PII',
  },
  {
    pattern: 'ssn',
    strategy: 'MASK',
    replacement: 'XXX-XX-XXXX',
    category: 'PII',
  },
];

/**
 * Built-in default Redaction Configuration for @repro/node SDK.
 */
export const DEFAULT_SDK_REDACTION_CONFIG: Readonly<RedactionConfig> = {
  enabled: true,
  headers: Object.keys(NEVER_STORE_HEADERS),
  fields: Object.keys(NEVER_STORE_FIELDS),
  rules: DEFAULT_SDK_REDACTION_RULES,
  strategies: {
    authorization: 'REPLACE-FIXED',
    cookie: 'REPLACE-FIXED',
    'set-cookie': 'REPLACE-FIXED',
    'proxy-authorization': 'REPLACE-FIXED',
    password: 'REPLACE-FIXED',
    credit_card: 'MASK',
    email: 'PSEUDONYMIZE',
    phone: 'MASK',
    ssn: 'MASK',
  },
};
