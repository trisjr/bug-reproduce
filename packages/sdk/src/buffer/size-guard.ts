/**
 * Repro Size Guard & Truncation Engine (SEC-008)
 * Specification: ADR-008, Story-04 (Scenario 2), Spec-Security §11.b
 * Zero external dependencies: Uses node:buffer
 */

import { Buffer } from 'node:buffer';
import type {
  DatabaseQueryResult,
  DatabaseInteraction,
  DatabaseInteractionData,
} from '@repro/core';

/**
 * Hard limit of maximum rows per database query result (SEC-008).
 */
export const MAX_DATABASE_ROWS = 100;

/**
 * Hard limit of maximum serialized payload bytes per database query result (64 KB = 65,536 B) (SEC-008).
 */
export const MAX_DATABASE_BYTES = 64 * 1024;

export interface TruncationMetadata {
  truncated: boolean;
  original_row_count: number;
  original_byte_size: number;
  final_row_count: number;
  final_byte_size: number;
}

export interface TruncateResult<T> {
  data: T;
  metadata: TruncationMetadata;
}

/**
 * Measures the UTF-8 byte length of a serialized JSON object/array.
 */
export function measureJsonByteLength(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    return Buffer.byteLength(json ?? '', 'utf8');
  } catch {
    return 0;
  }
}

/**
 * Strictly enforces SEC-008: truncates database query results to at most 100 rows
 * and at most 64 KB payload size, attaching truncated metadata.
 *
 * @param queryResult Raw or parsed DatabaseQueryResult
 * @returns TruncateResult containing the bounded result and truncation metadata
 */
export function truncateQueryResult(queryResult: DatabaseQueryResult): TruncateResult<DatabaseQueryResult> {
  const originalRows = queryResult.rows || [];
  const originalRowCount = originalRows.length;
  const originalByteSize = measureJsonByteLength(originalRows);

  let truncated = false;
  let rows = originalRows;

  // 1. Enforce row count cap (max 100 rows)
  if (rows.length > MAX_DATABASE_ROWS) {
    rows = rows.slice(0, MAX_DATABASE_ROWS);
    truncated = true;
  }

  // 2. Enforce byte size cap (max 64 KB)
  let currentByteSize = measureJsonByteLength(rows);
  if (currentByteSize > MAX_DATABASE_BYTES) {
    truncated = true;

    // Binary search or step reduction to find largest slice <= MAX_DATABASE_BYTES
    let low = 0;
    let high = rows.length;
    let bestSlice = rows.slice(0, 1);

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidateSlice = rows.slice(0, mid);
      const candidateBytes = measureJsonByteLength(candidateSlice);

      if (candidateBytes <= MAX_DATABASE_BYTES) {
        bestSlice = candidateSlice;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    rows = bestSlice;
    currentByteSize = measureJsonByteLength(rows);
  }

  const finalRowCount = rows.length;
  const finalByteSize = currentByteSize;

  const boundedQueryResult: DatabaseQueryResult = {
    command: queryResult.command,
    row_count: originalRowCount, // preserve total count for replay diff awareness
    rows,
    fields: queryResult.fields,
  };

  return {
    data: boundedQueryResult,
    metadata: {
      truncated,
      original_row_count: originalRowCount,
      original_byte_size: originalByteSize,
      final_row_count: finalRowCount,
      final_byte_size: finalByteSize,
    },
  };
}

/**
 * Enforces SEC-008 truncation on a DatabaseInteractionUnit.
 */
export function guardDatabaseInteraction(interaction: DatabaseInteraction): DatabaseInteraction {
  if (!interaction || interaction.category !== 'POSTGRES_QUERY') {
    return interaction;
  }

  const dbData = interaction.data as DatabaseInteractionData;
  if (!dbData || !dbData.result) {
    return interaction;
  }

  const { data: boundedResult, metadata } = truncateQueryResult(dbData.result);

  return {
    ...interaction,
    truncated: interaction.truncated || metadata.truncated,
    data: {
      ...dbData,
      result: boundedResult,
    },
  };
}
