/**
 * SQL Normalizer & Canonical Fingerprinter
 * Specification: ADR-006, Story-13, SDD-Repro §3.2
 */

import { createHash } from 'node:crypto';
export const SQL_KEYWORDS: Record<string, true> = {
  SELECT: true, INSERT: true, UPDATE: true, DELETE: true, FROM: true, WHERE: true, AND: true, OR: true, NOT: true, IN: true,
  IS: true, NULL: true, JOIN: true, LEFT: true, RIGHT: true, INNER: true, OUTER: true, FULL: true, CROSS: true, ON: true,
  GROUP: true, BY: true, HAVING: true, ORDER: true, ASC: true, DESC: true, LIMIT: true, OFFSET: true, AS: true, UNION: true,
  ALL: true, DISTINCT: true, BETWEEN: true, LIKE: true, ILIKE: true, EXISTS: true, CASE: true, WHEN: true, THEN: true,
  ELSE: true, END: true, RETURNING: true, SET: true, VALUES: true, INTO: true, CREATE: true, TABLE: true, DROP: true,
  ALTER: true, INDEX: true, VIEW: true, WITH: true, PRIMARY: true, KEY: true, FOREIGN: true, REFERENCES: true,
  CHECK: true, DEFAULT: true, UNIQUE: true, CONSTRAINT: true, CASCADE: true, TRUNCATE: true, BEGIN: true,
  COMMIT: true, ROLLBACK: true, TRANSACTION: true, COALESCE: true, COUNT: true, SUM: true, AVG: true, MIN: true,
  MAX: true, CAST: true, EXTRACT: true, INTERVAL: true, TRUE: true, FALSE: true, CONFLICT: true, DO: true, NOTHING: true,
  EXCEPT: true, INTERSECT: true, OVER: true, PARTITION: true, WINDOW: true, ROW_NUMBER: true, RANK: true,
  DENSE_RANK: true, FILTER: true, ARRAY: true, JSON_BUILD_OBJECT: true, JSON_AGG: true, NOW: true, CURRENT_TIMESTAMP: true
};
/**
 * Normalizes a raw SQL query string by:
 * 1. Removing SQL comments (single-line -- and multi-line /* ... *\/) without touching literals.
 * 2. Normalizing whitespace (collapsing multiple whitespace characters, trimming).
 * 3. Converting SQL keywords to uppercase canonical form while preserving identifiers and literals.
 * 4. Preserving bind parameters ($1, $2, ?) and string/numeric literals.
 */
export function normalizeSql(sql: string): string {
  if (typeof sql !== 'string' || !sql.trim()) {
    return '';
  }

  let i = 0;
  const n = sql.length;
  const tokens: string[] = [];

  while (i < n) {
    const char = sql[i];

    // 1. Whitespace
    if (/\s/.test(char)) {
      while (i < n && /\s/.test(sql[i])) {
        i++;
      }
      tokens.push(' ');
      continue;
    }

    // 2. Line comment: --
    if (char === '-' && i + 1 < n && sql[i + 1] === '-') {
      i += 2;
      while (i < n && sql[i] !== '\n') {
        i++;
      }
      tokens.push(' ');
      continue;
    }

    // 3. Block comment: /* ... */
    if (char === '/' && i + 1 < n && sql[i + 1] === '*') {
      i += 2;
      while (i < n && !(sql[i] === '*' && i + 1 < n && sql[i + 1] === '/')) {
        i++;
      }
      if (i < n) {
        i += 2; // skip */
      }
      tokens.push(' ');
      continue;
    }

    // 4. Single-quoted string literal: '...' (escaped as '' or \')
    if (char === "'") {
      let str = "'";
      i++;
      while (i < n) {
        if (sql[i] === "'") {
          if (i + 1 < n && sql[i + 1] === "'") {
            str += "''";
            i += 2;
          } else {
            str += "'";
            i++;
            break;
          }
        } else if (sql[i] === '\\' && i + 1 < n) {
          str += sql[i] + sql[i + 1];
          i += 2;
        } else {
          str += sql[i];
          i++;
        }
      }
      tokens.push(str);
      continue;
    }

    // 5. Double-quoted identifier: "..."
    if (char === '"') {
      let ident = '"';
      i++;
      while (i < n) {
        if (sql[i] === '"') {
          if (i + 1 < n && sql[i + 1] === '"') {
            ident += '""';
            i += 2;
          } else {
            ident += '"';
            i++;
            break;
          }
        } else {
          ident += sql[i];
          i++;
        }
      }
      tokens.push(ident);
      continue;
    }

    // 6. Parameter placeholder: $1, $2, ?
    if (char === '$' && i + 1 < n && /\d/.test(sql[i + 1])) {
      let param = '$';
      i++;
      while (i < n && /\d/.test(sql[i])) {
        param += sql[i];
        i++;
      }
      tokens.push(param);
      continue;
    }

    // 7. Word / Identifier / Keyword: [a-zA-Z_][a-zA-Z0-9_]*
    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (i < n && /[a-zA-Z0-9_]/.test(sql[i])) {
        word += sql[i];
        i++;
      }
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS[upper]) {
        tokens.push(upper);
      } else {
        tokens.push(word);
      }
      continue;
    }

    // 8. Numbers (integer or float): 123, 123.45
    if (/\d/.test(char)) {
      let num = '';
      while (i < n && (/\d/.test(sql[i]) || (sql[i] === '.' && i + 1 < n && /\d/.test(sql[i + 1])))) {
        num += sql[i];
        i++;
      }
      tokens.push(num);
      continue;
    }

    // 9. Other punctuation / operators
    tokens.push(char);
    i++;
  }

  const raw = tokens.join('');
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*;\s*$/, '')
    .trim();
}

/**
 * Computes deterministic SHA-256 fingerprint for a normalized SQL query.
 */
export function computeSqlFingerprint(sql: string): string {
  const normalized = normalizeSql(sql);
  return createHash('sha256').update(normalized).digest('hex');
}
