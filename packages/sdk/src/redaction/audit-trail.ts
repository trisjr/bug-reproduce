/**
 * Repro Redaction Audit Trail Tracker
 * Specification: ADR-002, SDD-Repro §4.2, Story-03 (Scenario 3)
 * Zero external dependencies
 */

import type { RedactionRecord } from '@repro/core';

export interface RedactionSummaryResult {
  total_fields_redacted: number;
  has_redactions: boolean;
  strategies_used: Record<string, number>;
}

/**
 * Tracks applied redactions during capture to provide an auditable manifest
 * for Execution Diff attribution (Story-03, ADR-011).
 */
export class RedactionAuditTrail {
  private readonly records: RedactionRecord[] = [];

  /**
   * Appends a RedactionRecord to the audit trail.
   */
  public addRecord(record: RedactionRecord): void {
    this.records.push(record);
  }

  /**
   * Convenience helper to record a single field redaction.
   */
  public record(
    fieldPath: string,
    strategy: string,
    originalType?: string,
    patternMatched?: string,
    maskedValuePreview?: string
  ): void {
    this.records.push({
      field_path: fieldPath,
      strategy,
      original_type: originalType,
      pattern_matched: patternMatched,
      masked_value_preview: maskedValuePreview,
    });
  }

  /**
   * Returns a copy of all tracked redaction records.
   */
  public getRecords(): RedactionRecord[] {
    return [...this.records];
  }

  /**
   * Computes a summary of redaction activities.
   */
  public getSummary(): RedactionSummaryResult {
    const strategiesUsed: Record<string, number> = {};
    for (const record of this.records) {
      strategiesUsed[record.strategy] = (strategiesUsed[record.strategy] ?? 0) + 1;
    }

    return {
      total_fields_redacted: this.records.length,
      has_redactions: this.records.length > 0,
      strategies_used: strategiesUsed,
    };
  }

  /**
   * Checks if the audit trail is empty.
   */
  public get length(): number {
    return this.records.length;
  }

  /**
   * Clears all accumulated redaction records.
   */
  public clear(): void {
    this.records.length = 0;
  }
}
