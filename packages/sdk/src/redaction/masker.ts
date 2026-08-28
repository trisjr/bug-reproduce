/**
 * Repro Format-Preserving Masker (SEC-002, SEC-005, SEC-007)
 * Specification: ADR-002, SDD-Repro §4.2, Story-03
 * Zero external dependencies: Built-in Node.js / JavaScript
 */

import type { RedactionConfig, RedactionRecord } from '@repro/core';
import {
  NEVER_STORE_HEADERS,
  NEVER_STORE_FIELDS,
  REDACTION_PATTERNS,
  isValidLuhn,
  DEFAULT_SDK_REDACTION_CONFIG,
} from './rules.ts';
import { RedactionAuditTrail } from './audit-trail.ts';

export interface MaskerOptions {
  config?: RedactionConfig;
  auditTrail?: RedactionAuditTrail;
}

export interface MaskResult<T> {
  value: T;
  records: RedactionRecord[];
  hasRedactions: boolean;
}

/**
 * Format-Preserving Masker for HTTP headers, JSON payloads, and unstructured strings.
 * Ensures strict compliance with PCI DSS (SEC-005) and fail-closed privacy (SEC-001, SEC-002).
 */
export class FormatPreservingMasker {
  private readonly config: RedactionConfig;
  private readonly auditTrail: RedactionAuditTrail;
  private readonly customNeverStoreFields: Record<string, true>;
  private readonly customNeverStoreHeaders: Record<string, true>;

  constructor(options?: MaskerOptions) {
    this.config = options?.config ?? DEFAULT_SDK_REDACTION_CONFIG;
    this.auditTrail = options?.auditTrail ?? new RedactionAuditTrail();

    this.customNeverStoreFields = { ...NEVER_STORE_FIELDS };
    if (this.config.fields) {
      for (const f of this.config.fields) {
        this.customNeverStoreFields[f.toLowerCase()] = true;
      }
    }

    this.customNeverStoreHeaders = { ...NEVER_STORE_HEADERS };
    if (this.config.headers) {
      for (const h of this.config.headers) {
        this.customNeverStoreHeaders[h.toLowerCase()] = true;
      }
    }
  }

  /**
   * Masks a Primary Account Number (PAN) / Credit card number while preserving format (SEC-005).
   * Format: First 4 digits + masked middle digits + last 4 digits (e.g. 4111-XXXX-XXXX-1111)
   */
  public maskPan(cardNumber: string): string {
    const cleanDigits = cardNumber.replace(/\D/g, '');
    if (cleanDigits.length < 13 || cleanDigits.length > 19) {
      return cardNumber;
    }

    let digitIdx = 0;
    const totalDigits = cleanDigits.length;
    let result = '';

    for (let i = 0; i < cardNumber.length; i++) {
      const char = cardNumber[i];
      if (char !== undefined && /\d/.test(char)) {
        if (digitIdx < 4 || digitIdx >= totalDigits - 4) {
          result += char;
        } else {
          result += 'X';
        }
        digitIdx++;
      } else if (char !== undefined) {
        result += char;
      }
    }

    return result;
  }

  /**
   * Masks an email address while preserving domain structure (e.g. j***@example.com).
   */
  public maskEmail(email: string): string {
    const atIdx = email.indexOf('@');
    if (atIdx <= 0) return '[REDACTED_EMAIL]';

    const localPart = email.substring(0, atIdx);
    const domainPart = email.substring(atIdx + 1);

    const firstChar = localPart[0] ?? 'u';
    return `${firstChar}***@${domainPart}`;
  }

  /**
   * Masks a US Social Security Number (e.g. XXX-XX-1234 or XXX-XX-XXXX).
   */
  public maskSsn(ssn: string): string {
    return ssn.replace(/^(\d{3})-(\d{2})-(\d{4})$/, 'XXX-XX-$3');
  }

  /**
   * Masks a phone number preserving prefix/suffix (e.g. +1-XXX-XXX-4567).
   */
  public maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) return '[REDACTED_PHONE]';
    const last4 = digits.slice(-4);
    return phone.replace(/\d(?=.*\d{4})/g, 'X').replace(/\d{4}$/, last4);
  }

  /**
   * Scans and scrubs unstructured string content using regex patterns and Luhn verification (SEC-005, SEC-007).
   */
  public scrubString(text: string, pathPrefix = 'text'): string {
    if (!text || typeof text !== 'string') return text;

    let scrubbed = text;

    try {
      // 1. Scrutinize PAN candidates with Luhn validation (SEC-005)
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.PAN_CANDIDATE, (match) => {
        if (isValidLuhn(match)) {
          this.auditTrail.record(
            pathPrefix,
            'MASK',
            'string',
            'PAN_LUHN',
            this.maskPan(match)
          );
          return this.maskPan(match);
        }
        return match;
      });

      // 2. Scrub JWT tokens
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.JWT_TOKEN, () => {
        this.auditTrail.record(
          pathPrefix,
          'REPLACE-FIXED',
          'string',
          'JWT_TOKEN',
          '[REDACTED_JWT]'
        );
        return '[REDACTED_JWT]';
      });

      // 3. Scrub Bearer Auth headers/tokens
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.BEARER_TOKEN, () => {
        this.auditTrail.record(
          pathPrefix,
          'REPLACE-FIXED',
          'string',
          'BEARER_TOKEN',
          'Bearer [REDACTED_BEARER_TOKEN]'
        );
        return 'Bearer [REDACTED_BEARER_TOKEN]';
      });

      // 4. Scrub API keys
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.API_KEY, () => {
        this.auditTrail.record(
          pathPrefix,
          'REPLACE-FIXED',
          'string',
          'API_KEY',
          '[REDACTED_API_KEY]'
        );
        return '[REDACTED_API_KEY]';
      });

      // 5. Scrub SSN
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.US_SSN, (match) => {
        this.auditTrail.record(
          pathPrefix,
          'MASK',
          'string',
          'US_SSN',
          this.maskSsn(match)
        );
        return this.maskSsn(match);
      });

      // 6. Scrub Emails
      scrubbed = scrubbed.replace(REDACTION_PATTERNS.EMAIL, (match) => {
        this.auditTrail.record(
          pathPrefix,
          'PSEUDONYMIZE',
          'string',
          'EMAIL',
          this.maskEmail(match)
        );
        return this.maskEmail(match);
      });
    } catch {
      // Fail-Closed (SEC-001): In case of unexpected regex failure, return safe placeholder
      return '<REDACTION-FAILED>';
    }

    return scrubbed;
  }

  /**
   * Redacts an HTTP headers dictionary strictly according to NEVER_STORE_HEADERS (SEC-002).
   */
  public redactHeaders(
    headers: Record<string, string | string[] | undefined>,
    pathPrefix = 'headers'
  ): Record<string, string | string[] | undefined> {
    if (!headers || typeof headers !== 'object') return headers;

    const result: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) {
        result[key] = undefined;
        continue;
      }

      const lowerKey = key.toLowerCase();
      const currentPath = `${pathPrefix}.${lowerKey}`;

      if (this.customNeverStoreHeaders[lowerKey]) {
        if (lowerKey === 'authorization' || lowerKey === 'proxy-authorization') {
          result[key] = '[REDACTED_BEARER_TOKEN]';
          this.auditTrail.record(currentPath, 'REPLACE-FIXED', 'header', 'NEVER_STORE_HEADER', '[REDACTED_BEARER_TOKEN]');
        } else if (lowerKey === 'cookie' || lowerKey === 'set-cookie') {
          result[key] = '[REDACTED_COOKIE]';
          this.auditTrail.record(currentPath, 'REPLACE-FIXED', 'header', 'NEVER_STORE_HEADER', '[REDACTED_COOKIE]');
        } else if (lowerKey.includes('key') || lowerKey.includes('token')) {
          result[key] = '[REDACTED_API_KEY]';
          this.auditTrail.record(currentPath, 'REPLACE-FIXED', 'header', 'NEVER_STORE_HEADER', '[REDACTED_API_KEY]');
        } else {
          result[key] = '[REDACTED_HEADER]';
          this.auditTrail.record(currentPath, 'REPLACE-FIXED', 'header', 'NEVER_STORE_HEADER', '[REDACTED_HEADER]');
        }
      } else if (typeof value === 'string') {
        result[key] = this.scrubString(value, currentPath);
      } else if (Array.isArray(value)) {
        result[key] = value.map((v, i) => (typeof v === 'string' ? this.scrubString(v, `${currentPath}[${i}]`) : v));
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Recursively redacts an arbitrary object, array, or primitive data structure.
   */
  public redactValue(value: unknown, path = 'data'): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Try to see if this string is valid JSON
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          const redactedParsed = this.redactValue(parsed, path);
          return JSON.stringify(redactedParsed);
        } catch {
          // Not valid JSON, proceed as plain string
        }
      }
      return this.scrubString(value, path);
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item, idx) => this.redactValue(item, `${path}[${idx}]`));
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const currentPath = `${path}.${key}`;

        if (this.customNeverStoreFields[lowerKey]) {
          if (lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('key')) {
            result[key] = '[REDACTED_PASSWORD]';
            this.auditTrail.record(currentPath, 'REPLACE-FIXED', typeof val, 'NEVER_STORE_FIELD', '[REDACTED_PASSWORD]');
          } else if (lowerKey.includes('token') || lowerKey.includes('auth')) {
            result[key] = '[REDACTED_TOKEN]';
            this.auditTrail.record(currentPath, 'REPLACE-FIXED', typeof val, 'NEVER_STORE_FIELD', '[REDACTED_TOKEN]');
          } else if (lowerKey.includes('card') || lowerKey.includes('pan')) {
            result[key] = typeof val === 'string' ? this.maskPan(val) : '[REDACTED_PAN]';
            this.auditTrail.record(currentPath, 'MASK', typeof val, 'NEVER_STORE_FIELD', String(result[key]));
          } else if (lowerKey.includes('cvv') || lowerKey.includes('cvc')) {
            result[key] = 'XXX';
            this.auditTrail.record(currentPath, 'REPLACE-FIXED', typeof val, 'NEVER_STORE_FIELD', 'XXX');
          } else if (lowerKey.includes('ssn') || lowerKey.includes('social_security')) {
            result[key] = typeof val === 'string' ? this.maskSsn(val) : 'XXX-XX-XXXX';
            this.auditTrail.record(currentPath, 'MASK', typeof val, 'NEVER_STORE_FIELD', String(result[key]));
          } else if (lowerKey.includes('email') || lowerKey.includes('mail')) {
            result[key] = typeof val === 'string' ? this.maskEmail(val) : 'user-anon-1842@corp.test';
            this.auditTrail.record(currentPath, 'PSEUDONYMIZE', typeof val, 'NEVER_STORE_FIELD', String(result[key]));
          } else if (lowerKey.includes('phone') || lowerKey.includes('sdt') || lowerKey.includes('tel')) {
            result[key] = typeof val === 'string' ? this.maskPhone(val) : '[REDACTED_PHONE]';
            this.auditTrail.record(currentPath, 'MASK', typeof val, 'NEVER_STORE_FIELD', String(result[key]));
          } else {
            result[key] = '[REDACTED_STRING]';
            this.auditTrail.record(currentPath, 'REPLACE-FIXED', typeof val, 'NEVER_STORE_FIELD', '[REDACTED_STRING]');
          }
        } else {
          result[key] = this.redactValue(val, currentPath);
        }
      }

      return result;
    }

    return value;
  }

  /**
   * Retrieves the current audit trail instance.
   */
  public getAuditTrail(): RedactionAuditTrail {
    return this.auditTrail;
  }
}
