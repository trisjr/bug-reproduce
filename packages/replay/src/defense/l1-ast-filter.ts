/**
 * Repro Layer 1 AST SQL Filter & Classifier
 * Specification: ADR-005 (Default-Deny Write Side Effects), Story-12 (SEC-032..036, FR-034..036)
 * Zero external dependencies: Uses Node.js built-in APIs
 */

/**
 * Error thrown when a SQL statement contains write/mutation side effects
 * under ADR-005 Default-Deny replay policy (Fail-Closed).
 */
export class WriteSideEffectBlockedError extends Error {
  public readonly code = 'BLOCKED_WRITE_SIDE_EFFECT';
  public readonly sql: string;
  public readonly reason: string;
  public readonly statementType: string;
  public readonly blockedTokens?: string[];

  constructor(
    message: string,
    sql: string,
    reason?: string,
    statementType?: string,
    blockedTokens?: string[]
  ) {
    super(
      message ||
        `SQL write side effect blocked by L1 AST filter: ${reason || 'Non-read operation prohibited under ADR-005 default-deny policy'}`
    );
    this.name = 'WriteSideEffectBlockedError';
    this.sql = sql;
    this.reason =
      reason || 'Non-read SQL operation prohibited under ADR-005 fail-closed policy';
    this.statementType = statementType || 'UNKNOWN';
    this.blockedTokens = blockedTokens;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WriteSideEffectBlockedError);
    }
  }
}

/**
 * Classification details for a parsed SQL statement.
 */
export interface SqlClassification {
  /** True if the statement is provably a read-only query (e.g. pure SELECT, EXPLAIN) */
  isReadOnly: boolean;
  /** Primary SQL command / statement type (e.g. 'SELECT', 'INSERT', 'UPDATE', 'WITH') */
  command: string;
  /** Detailed statement type description */
  statementType: string;
  /** Detailed reason if blocked or classified as write */
  reason?: string;
  /** Tokens that triggered write classification */
  blockedTokens?: string[];
  /** Indicates whether the statement uses Common Table Expressions (WITH ...) */
  hasCte: boolean;
  /** Indicates whether CTE contains write/mutation subqueries (e.g. WITH x AS (UPDATE ...)) */
  hasMutationCte: boolean;
  /** Indicates whether multiple statements were detected */
  isMultiStatement: boolean;
}

/**
 * Prohibited SQL write / DDL / DML / mutation command keywords.
 */
const MUTATION_KEYWORDS: Record<string, true> = {
  INSERT: true,
  UPDATE: true,
  DELETE: true,
  DROP: true,
  ALTER: true,
  TRUNCATE: true,
  CALL: true,
  CREATE: true,
  REPLACE: true,
  MERGE: true,
  GRANT: true,
  REVOKE: true,
  LOCK: true,
  EXECUTE: true,
  EXEC: true,
  DO: true,
  UPSERT: true,
  VACUUM: true,
  REINDEX: true,
  CLUSTER: true,
  REFRESH: true,
  COMMENT: true,
  COPY: true,
  LISTEN: true,
  NOTIFY: true,
  UNLISTEN: true,
  DISCARD: true,
  LOAD: true,
  RENAME: true,
};

/**
 * Read-only statement root commands allowlist.
 */
const READ_ROOT_COMMANDS: Record<string, true> = {
  SELECT: true,
  EXPLAIN: true,
  SHOW: true,
  DESCRIBE: true,
  DESC: true,
  VALUES: true,
};

const COMMON_SQL_KEYWORDS: Record<string, true> = {
  WITH: true,
  RECURSIVE: true,
  AS: true,
  FROM: true,
  WHERE: true,
  JOIN: true,
  ON: true,
  GROUP: true,
  BY: true,
  HAVING: true,
  ORDER: true,
  LIMIT: true,
  OFFSET: true,
  UNION: true,
  INTERSECT: true,
  EXCEPT: true,
  ALL: true,
  DISTINCT: true,
  AND: true,
  OR: true,
  NOT: true,
  IN: true,
  EXISTS: true,
  BETWEEN: true,
  LIKE: true,
  ILIKE: true,
  IS: true,
  NULL: true,
  TRUE: true,
  FALSE: true,
  CASE: true,
  WHEN: true,
  THEN: true,
  ELSE: true,
  END: true,
  RETURNING: true,
};

/**
 * Token produced by the SQL tokenizer.
 */
interface SqlToken {
  type: 'KEYWORD' | 'IDENT' | 'STRING' | 'SYMBOL' | 'NUMBER' | 'DOLLAR_STRING';
  value: string;
  position: number;
}

/**
 * L1AstSqlFilter analyzes SQL queries and enforces strict fail-closed read-only semantics.
 * Every write operation (INSERT, UPDATE, DELETE, DDL, CALL, CTE mutations) is blocked and
 * throws WriteSideEffectBlockedError.
 */
export class L1AstSqlFilter {
  /**
   * Asserts that a SQL query is provably read-only.
   * Throws WriteSideEffectBlockedError if any write or unprovable construct is detected.
   */
  public static assertReadOnly(sql: string): void {
    const classification = L1AstSqlFilter.classify(sql);
    if (!classification.isReadOnly) {
      throw new WriteSideEffectBlockedError(
        `SQL write side effect blocked by L1 AST filter: ${classification.reason || 'Write operation detected'}`,
        sql,
        classification.reason,
        classification.statementType,
        classification.blockedTokens
      );
    }
  }

  /**
   * Checks if a SQL query is read-only.
   */
  public static isReadOnly(sql: string): boolean {
    return L1AstSqlFilter.classify(sql).isReadOnly;
  }

  /**
   * Classifies a SQL query into read-only vs write/mutation with detailed AST inspection.
   */
  public static classify(sql: string): SqlClassification {
    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return {
        isReadOnly: false,
        command: 'EMPTY',
        statementType: 'EMPTY',
        reason: 'Empty SQL query is unprovable',
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    try {
      const tokens = L1AstSqlFilter.tokenize(sql);
      if (tokens.length === 0) {
        return {
          isReadOnly: false,
          command: 'EMPTY',
          statementType: 'EMPTY',
          reason: 'SQL query contains only comments or whitespace',
          hasCte: false,
          hasMutationCte: false,
          isMultiStatement: false,
        };
      }

      // Split into statements by top-level semicolon
      const statements = L1AstSqlFilter.splitStatements(tokens);
      const isMultiStatement = statements.length > 1;

      for (let i = 0; i < statements.length; i++) {
        const stmtTokens = statements[i];
        if (stmtTokens.length === 0) continue;

        const singleResult = L1AstSqlFilter.classifySingleStatement(stmtTokens, sql);
        if (!singleResult.isReadOnly) {
          return {
            ...singleResult,
            isMultiStatement,
            reason: isMultiStatement
              ? `Statement #${i + 1} is not read-only: ${singleResult.reason}`
              : singleResult.reason,
          };
        }
      }

      // All statements passed read-only check
      const firstStmt = statements[0];
      const firstKeyword = firstStmt[0]?.value.toUpperCase() || 'SELECT';

      const hasCte = firstKeyword === 'WITH';
      return {
        isReadOnly: true,
        command: firstKeyword,
        statementType: hasCte ? 'SELECT_WITH_CTE' : firstKeyword,
        hasCte,
        hasMutationCte: false,
        isMultiStatement,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        isReadOnly: false,
        command: 'PARSE_ERROR',
        statementType: 'UNPARSEABLE',
        reason: `SQL AST tokenizer failed to parse query (fail-closed): ${errMsg}`,
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }
  }

  /**
   * Instance method forwarding to static classify.
   */
  public classify(sql: string): SqlClassification {
    return L1AstSqlFilter.classify(sql);
  }

  /**
   * Instance method forwarding to static assertReadOnly.
   */
  public assertReadOnly(sql: string): void {
    L1AstSqlFilter.assertReadOnly(sql);
  }

  /**
   * Classifies a single statement's token stream.
   */
  private static classifySingleStatement(
    tokens: SqlToken[],
    _originalSql: string
  ): SqlClassification {
    if (tokens.length === 0) {
      return {
        isReadOnly: false,
        command: 'EMPTY',
        statementType: 'EMPTY',
        reason: 'Empty statement',
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    const firstToken = tokens[0];
    const firstKeyword = firstToken.value.toUpperCase();

    // Check if directly a mutation root keyword (INSERT, UPDATE, DELETE, DROP, ALTER, etc.)
    if (MUTATION_KEYWORDS[firstKeyword]) {
      return {
        isReadOnly: false,
        command: firstKeyword,
        statementType: firstKeyword,
        reason: `Prohibited write/DDL/DML command: ${firstKeyword}`,
        blockedTokens: [firstKeyword],
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    // Handle CTE (Common Table Expression): WITH ...
    if (firstKeyword === 'WITH') {
      return L1AstSqlFilter.classifyWithCteStatement(tokens, _originalSql);
    }

    // Must be in READ_ROOT_COMMANDS allowlist
    if (!READ_ROOT_COMMANDS[firstKeyword]) {
      return {
        isReadOnly: false,
        command: firstKeyword,
        statementType: `UNKNOWN_${firstKeyword}`,
        reason: `Command '${firstKeyword}' is not in read-only allowlist (fail-closed ADR-005)`,
        blockedTokens: [firstKeyword],
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    // For SELECT / EXPLAIN: verify that no mutation keywords appear as commands inside subqueries
    const mutationTokensFound: string[] = [];
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'KEYWORD') {
        const kw = token.value.toUpperCase();
        if (MUTATION_KEYWORDS[kw]) {
          mutationTokensFound.push(kw);
        }
      }
    }

    if (mutationTokensFound.length > 0) {
      return {
        isReadOnly: false,
        command: firstKeyword,
        statementType: `${firstKeyword}_WITH_MUTATION`,
        reason: `Statement contains nested write/mutation keywords: ${mutationTokensFound.join(', ')}`,
        blockedTokens: mutationTokensFound,
        hasCte: false,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    return {
      isReadOnly: true,
      command: firstKeyword,
      statementType: firstKeyword,
      hasCte: false,
      hasMutationCte: false,
      isMultiStatement: false,
    };
  }

  /**
   * Deep analysis of CTE statement: WITH x AS (...) SELECT ...
   * Checks for CTE mutations such as WITH x AS (UPDATE ... RETURNING ...) SELECT ... (ADR-005, Story-12 Scenario 3)
   */
  private static classifyWithCteStatement(
    tokens: SqlToken[],
    _originalSql: string
  ): SqlClassification {
    let cursor = 1; // skip 'WITH'
    if (cursor < tokens.length && tokens[cursor].value.toUpperCase() === 'RECURSIVE') {
      cursor++;
    }

    const mutationTokens: string[] = [];
    let hasMutationCte = false;

    // Scan CTE definitions: <name> [(...)] AS ( ... )
    while (cursor < tokens.length) {
      // Expect CTE name
      const nameToken = tokens[cursor];
      if (!nameToken) break;

      // If we reach the main query (SELECT, INSERT, UPDATE, etc.) outside of CTE definition
      const kw = nameToken.value.toUpperCase();
      if (nameToken.type === 'KEYWORD' && (READ_ROOT_COMMANDS[kw] || MUTATION_KEYWORDS[kw])) {
        if (MUTATION_KEYWORDS[kw]) {
          mutationTokens.push(kw);
        }
        break;
      }

      cursor++; // skip name

      // Optional column list: (col1, col2)
      if (cursor < tokens.length && tokens[cursor].value === '(') {
        cursor = L1AstSqlFilter.skipParentheses(tokens, cursor);
      }

      // Expect 'AS'
      if (cursor < tokens.length && tokens[cursor].value.toUpperCase() === 'AS') {
        cursor++;
      }

      // Expect '(' opening CTE body subquery
      if (cursor < tokens.length && tokens[cursor].value === '(') {
        const subqueryStart = cursor + 1;
        const subqueryEnd = L1AstSqlFilter.findMatchingParen(tokens, cursor);
        cursor = subqueryEnd + 1;

        // Check tokens inside this CTE subquery for mutations
        for (let j = subqueryStart; j < subqueryEnd; j++) {
          const subToken = tokens[j];
          if (subToken.type === 'KEYWORD') {
            const subKw = subToken.value.toUpperCase();
            if (MUTATION_KEYWORDS[subKw]) {
              mutationTokens.push(subKw);
              hasMutationCte = true;
            }
          }
        }
      }

      // Check for comma separating next CTE
      if (cursor < tokens.length && tokens[cursor].value === ',') {
        cursor++;
      } else {
        // Reached end of CTE headers, moving to main statement
        break;
      }
    }

    // Inspect the remaining tokens (the main statement after WITH)
    let mainCommand = 'SELECT';
    if (cursor < tokens.length) {
      const mainFirst = tokens[cursor];
      if (mainFirst.type === 'KEYWORD') {
        mainCommand = mainFirst.value.toUpperCase();
        if (MUTATION_KEYWORDS[mainCommand]) {
          mutationTokens.push(mainCommand);
        }
      }

      for (let k = cursor; k < tokens.length; k++) {
        const remainingToken = tokens[k];
        if (remainingToken.type === 'KEYWORD') {
          const rkw = remainingToken.value.toUpperCase();
          if (MUTATION_KEYWORDS[rkw] && !mutationTokens.includes(rkw)) {
            mutationTokens.push(rkw);
          }
        }
      }
    }

    if (mutationTokens.length > 0) {
      return {
        isReadOnly: false,
        command: 'WITH',
        statementType: 'WITH_MUTATION_CTE',
        reason: `CTE statement contains prohibited write/mutation keywords: ${mutationTokens.join(', ')}`,
        blockedTokens: mutationTokens,
        hasCte: true,
        hasMutationCte: true,
        isMultiStatement: false,
      };
    }

    if (!READ_ROOT_COMMANDS[mainCommand]) {
      return {
        isReadOnly: false,
        command: 'WITH',
        statementType: `WITH_${mainCommand}`,
        reason: `Main query in CTE statement '${mainCommand}' is not in read-only allowlist`,
        blockedTokens: [mainCommand],
        hasCte: true,
        hasMutationCte: false,
        isMultiStatement: false,
      };
    }

    return {
      isReadOnly: true,
      command: 'WITH',
      statementType: 'WITH_SELECT_CTE',
      hasCte: true,
      hasMutationCte: false,
      isMultiStatement: false,
    };
  }

  /**
   * Skips to the token index immediately after the closing parenthesis.
   */
  private static skipParentheses(tokens: SqlToken[], openParenIndex: number): number {
    return L1AstSqlFilter.findMatchingParen(tokens, openParenIndex) + 1;
  }

  /**
   * Finds the index of the matching closing parenthesis.
   */
  private static findMatchingParen(tokens: SqlToken[], openParenIndex: number): number {
    let depth = 0;
    for (let i = openParenIndex; i < tokens.length; i++) {
      if (tokens[i].value === '(') {
        depth++;
      } else if (tokens[i].value === ')') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
    return tokens.length - 1;
  }

  /**
   * Splits a token stream into individual statement token arrays by semicolon.
   */
  private static splitStatements(tokens: SqlToken[]): SqlToken[][] {
    const statements: SqlToken[][] = [];
    let current: SqlToken[] = [];
    let parenDepth = 0;

    for (const token of tokens) {
      if (token.value === '(') parenDepth++;
      else if (token.value === ')') parenDepth = Math.max(0, parenDepth - 1);

      if (token.value === ';' && parenDepth === 0) {
        if (current.length > 0) {
          statements.push(current);
          current = [];
        }
      } else {
        current.push(token);
      }
    }

    if (current.length > 0) {
      statements.push(current);
    }

    return statements;
  }

  /**
   * Tokenizes SQL string into lexical tokens while safely stripping comments and isolating string literals.
   */
  public static tokenize(sql: string): SqlToken[] {
    const tokens: SqlToken[] = [];
    let i = 0;
    const len = sql.length;

    while (i < len) {
      const char = sql[i];

      // 1. Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // 2. Single-line comment: -- or //
      if (
        (char === '-' && i + 1 < len && sql[i + 1] === '-') ||
        (char === '/' && i + 1 < len && sql[i + 1] === '/')
      ) {
        i += 2;
        while (i < len && sql[i] !== '\n' && sql[i] !== '\r') {
          i++;
        }
        continue;
      }

      // 3. Multi-line comment: /* ... */
      if (char === '/' && i + 1 < len && sql[i + 1] === '*') {
        i += 2;
        while (i < len) {
          if (sql[i] === '*' && i + 1 < len && sql[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }

      // 4. PostgreSQL Dollar-Quoted Strings: $$...$$ or $tag$...$tag$
      if (char === '$') {
        const dollarMatch = sql.slice(i).match(/^\$([a-zA-Z0-9_]*)\$/);
        if (dollarMatch) {
          const tag = dollarMatch[0];
          const tagLen = tag.length;
          const closeIndex = sql.indexOf(tag, i + tagLen);
          if (closeIndex !== -1) {
            tokens.push({
              type: 'DOLLAR_STRING',
              value: sql.slice(i, closeIndex + tagLen),
              position: i,
            });
            i = closeIndex + tagLen;
            continue;
          }
        }
      }

      // 5. Single-quoted string literal: '...' (with '' and \' escapes)
      if (char === "'") {
        const startPos = i;
        i++;
        let strVal = '';
        while (i < len) {
          if (sql[i] === "'") {
            if (i + 1 < len && sql[i + 1] === "'") {
              strVal += "'";
              i += 2;
            } else {
              i++;
              break;
            }
          } else if (sql[i] === '\\' && i + 1 < len) {
            strVal += sql[i + 1];
            i += 2;
          } else {
            strVal += sql[i];
            i++;
          }
        }
        tokens.push({
          type: 'STRING',
          value: strVal,
          position: startPos,
        });
        continue;
      }

      // 6. Double-quoted identifier: "..." or Backtick identifier: `...`
      if (char === '"' || char === '`') {
        const quoteChar = char;
        const startPos = i;
        i++;
        let identVal = '';
        while (i < len) {
          if (sql[i] === quoteChar) {
            i++;
            break;
          }
          identVal += sql[i];
          i++;
        }
        tokens.push({
          type: 'IDENT',
          value: identVal,
          position: startPos,
        });
        continue;
      }

      // 7. Symbols / punctuation: ( ) , ; . = < > + - * /
      if (/^[(),;:.=<>+\-*%/!~&|^]/.test(char)) {
        tokens.push({
          type: 'SYMBOL',
          value: char,
          position: i,
        });
        i++;
        continue;
      }

      // 8. Numbers: 123, 123.45, 0x12
      if (/[0-9]/.test(char)) {
        const startPos = i;
        while (i < len && /[0-9a-fA-FxX.eE+\-]/.test(sql[i])) {
          i++;
        }
        tokens.push({
          type: 'NUMBER',
          value: sql.slice(startPos, i),
          position: startPos,
        });
        continue;
      }

      // 9. Word (Identifier or Keyword)
      if (/[a-zA-Z_#$@]/.test(char)) {
        const startPos = i;
        while (i < len && /[a-zA-Z0-9_#$@]/.test(sql[i])) {
          i++;
        }
        const word = sql.slice(startPos, i);
        const upperWord = word.toUpperCase();

        const isKeyword =
          Boolean(MUTATION_KEYWORDS[upperWord]) ||
          Boolean(READ_ROOT_COMMANDS[upperWord]) ||
          Boolean(COMMON_SQL_KEYWORDS[upperWord]);

        tokens.push({
          type: isKeyword ? 'KEYWORD' : 'IDENT',
          value: word,
          position: startPos,
        });
        continue;
      }

      // Fallback for unrecognized character
      tokens.push({
        type: 'SYMBOL',
        value: char,
        position: i,
      });
      i++;
    }

    return tokens;
  }
}
