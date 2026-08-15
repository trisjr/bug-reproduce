'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Log interaction ở TẦNG APP. Đây KHÔNG phải recorder B3 — B3 sẽ tự chặn ở tầng
 * driver. Log này tồn tại để `test-invariant.js` có thứ đối chiếu được, và để
 * lời gọi Redis "quan sát được trong log" đúng như ràng buộc G1/R2 đòi hỏi.
 *
 * Mỗi dòng là một JSON object trên stdout (JSON-lines), mang `ordinal` tăng dần
 * trong phạm vi MỘT request.
 */

const LOG_TAG = 'spike-interaction';

/** Các loại đơn vị — đặt tên theo Spec-Spike-Protocol §3.2 field `kind`. */
const KIND = Object.freeze({
  INBOUND_HTTP: 'inbound-http',
  DB_QUERY: 'db-query',
  OUTBOUND_HTTP: 'outbound-http',
  FEATURE_FLAG: 'feature-flag',
  CLOCK: 'clock',
  /** Redis — LUÔN đánh dấu `off_execution_path: true` (G1). */
  CACHE: 'cache',
  /** Mốc kiểm chứng cấu trúc, không phải interaction thật. */
  MARKER: 'marker',
});

class InteractionLog {
  /**
   * @param {{runId: string, requestId: string, sink?: (line: string) => void}} options
   */
  constructor({ runId, requestId, sink }) {
    this.runId = runId;
    this.requestId = requestId;
    this.sink = sink || ((line) => process.stdout.write(line));
    this.entries = [];
    this.outcomeOrdinal = null;
  }

  /**
   * @param {{kind: string, target: string, args?: unknown, result?: unknown,
   *          offExecutionPath?: boolean, error?: string|null}} interaction
   * @returns {number} ordinal của đơn vị vừa ghi
   */
  record({ kind, target, args = null, result = null, offExecutionPath = false, error = null }) {
    const entry = {
      log: LOG_TAG,
      run_id: this.runId,
      request_id: this.requestId,
      ordinal: this.entries.length + 1,
      kind,
      target,
      arguments: args,
      result,
      off_execution_path: offExecutionPath,
      error,
    };
    this.entries.push(entry);
    this.sink(`${JSON.stringify(entry)}\n`);
    return entry.ordinal;
  }

  /**
   * Đóng băng ranh giới: MỌI interaction Redis phải nằm SAU mốc này.
   * `test-invariant.js` kiểm chứng bằng máy — đây là bằng chứng cấu trúc cho
   * lệnh cấm read-through cache (điều kiện 3) và cho G1 (điều kiện 2).
   * @returns {number}
   */
  markOutcomeComputed() {
    this.outcomeOrdinal = this.record({
      kind: KIND.MARKER,
      target: 'outcome-computed',
      result: { note: 'response đã được tính xong và Object.freeze; Redis chỉ được chạm SAU mốc này' },
    });
    return this.outcomeOrdinal;
  }
}

module.exports = { InteractionLog, KIND, LOG_TAG };
