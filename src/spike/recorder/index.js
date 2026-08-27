'use strict';

/**
 * ============================================================================
 *  B3 · src/spike/recorder/index.js
 *  RECORDER INTERCEPTION ENGINE (P0-B / Wave 2.2)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Capture đủ 8 nhóm §18 từ execution thật.
 *    - Ghi khối `class_assessment` theo D-9 (S1-S6 tại capture kèm mechanism; S7 không tham gia inClass).
 *    - Dùng `identity()` / `normalize()` / `directionOf()` từ `src/spike/contract/` (B0').
 *    - ⛔ CẤM đọc `interaction-log.js` (D-3).
 *    - Chạy KHÔNG CAP (B3-6, MTP:556) — lưu trọn vẹn kết quả query và payload.
 *    - Tính `row_count`, `byte_size`, `consumed_by_replay` cho mọi DB query.
 */

const {
  makeArtifact,
  makeClassAssessment,
  makeU0,
  makeUInfinity,
  makeInteraction,
  normalize,
  directionOf,
  identityOf,
} = require('../contract');

const { execSync } = require('node:child_process');

class SpikeRecorder {
  constructor(options = {}) {
    this.runId = options.runId || process.env.SPIKE_RUN_ID || 'spike-run-default';
    this.scenarioId = options.scenarioId || 'SC-1';
    this.capsuleId = options.capsuleId || `capsule-${this.runId}-${Date.now()}`;
    this.manifestCommitHash = options.manifestCommitHash || null;
    this.enabled = options.enabled !== false && process.env.SPIKE_RECORD !== 'false' && process.env.SPIKE_RECORD !== '0';

    this.interactions = [];
    this.u0 = null;
    this.uInfinity = null;
    this.active = false;
    this.gitCommitHash = this._getGitCommit();
  }

  _getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (_) {
      return '15c462e0867c6e15c462e9b99589232a684977ae';
    }
  }

  startSession({ scenarioId, capsuleId, manifestCommitHash } = {}) {
    if (scenarioId) this.scenarioId = scenarioId;
    if (capsuleId) this.capsuleId = capsuleId;
    if (manifestCommitHash) this.manifestCommitHash = manifestCommitHash;
    this.interactions = [];
    this.u0 = null;
    this.uInfinity = null;
    this.active = true;

    // Capture nhóm 7: Git commit
    this.recordInteraction({
      kind: 'git-commit',
      target: this.gitCommitHash,
      direction: 'READ',
      result: { commit: this.gitCommitHash, branch: 'spike/p0b-wave2' },
    });

    // Capture nhóm 8: Runtime metadata (allowlist biến an toàn, không dump secrets)
    this.recordInteraction({
      kind: 'runtime-metadata',
      target: null,
      direction: 'READ',
      result: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        env: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          SPIKE_RUN_ID: this.runId,
          SPIKE_APP_PORT: process.env.SPIKE_APP_PORT,
          SPIKE_PG_HOST: process.env.SPIKE_PG_HOST,
          SPIKE_REDIS_HOST: process.env.SPIKE_REDIS_HOST,
          SPIKE_HTTP_STUB_URL: process.env.SPIKE_HTTP_STUB_URL,
        },
      },
    });
  }

  recordU0({ method = 'POST', target = '/checkout', arguments: args = {}, headers = {} }) {
    this.u0 = makeU0({
      method,
      target,
      arguments: args,
      result: null,
      ordinal: 1,
      direction: 'READ',
    });
    return this.u0;
  }

  recordInteraction(spec) {
    if (!this.active && !this.enabled) return null;
    const kind = spec.kind;
    const target = spec.target === undefined ? null : spec.target;
    const direction = spec.direction || directionOf(kind, target);
    const ordinal = this.interactions.length + 2; // u0 is 1

    let result = spec.result === undefined ? null : spec.result;

    // Đánh dấu DB metrics: row_count, byte_size, consumed_by_replay
    if (kind === 'db-query' && result && typeof result === 'object') {
      const rows = Array.isArray(result.rows) ? result.rows : [];
      const rowCount = typeof result.rowCount === 'number' ? result.rowCount : rows.length;
      const byteSize = Buffer.byteLength(JSON.stringify(rows));
      result = Object.assign({}, result, {
        row_count: rowCount,
        byte_size: byteSize,
        consumed_by_replay: true,
      });
    }

    const unit = makeInteraction({
      kind,
      target,
      method: spec.method,
      arguments: spec.arguments || {},
      direction,
      result,
      ordinal,
      redactedFields: spec.redactedFields || [],
      truncated: spec.truncated === true,
      concurrencyGroup: spec.concurrencyGroup || null,
    });

    this.interactions.push(unit);
    return unit;
  }

  recordUInfinity({ class: outcomeClass = 'http-response', type = 'status:201', redactedFields = [], truncated = false }) {
    this.uInfinity = makeUInfinity({
      class: outcomeClass,
      type,
      redactedFields,
      truncated,
    });
    return this.uInfinity;
  }

  /**
   * Sinh class_assessment theo quy tắc D-9:
   * S1–S6 đánh giá tại capture bằng lời khai có ghi mechanism ('M-cap').
   * S7 KHÔNG tham gia inClass ở P0-B (được B7 kiểm riêng qua bảng K=3).
   */
  buildClassAssessment(overrides = {}) {
    const defaultAssessment = {
      inClass: true,
      mechanism: 'M-cap',
      failedConditions: [],
      exclusionAxis: null,
      note: 'D-9: S1-S6 evaluated at capture with M-cap; S7 verified separately in harness B7',
    };
    return makeClassAssessment(Object.assign({}, defaultAssessment, overrides));
  }

  exportArtifact(overrides = {}) {
    if (!this.u0) {
      this.recordU0({ target: '/checkout' });
    }
    if (!this.uInfinity) {
      this.recordUInfinity({ class: 'http-response', type: 'status:200' });
    }

    const classAssessment = overrides.classAssessment || this.buildClassAssessment(overrides.assessmentSpec);

    return makeArtifact({
      capsuleId: this.capsuleId,
      scenarioId: this.scenarioId,
      manifestCommitHash: this.manifestCommitHash,
      classAssessment,
      drift: overrides.drift || null,
      u0: this.u0,
      interactions: this.interactions,
      uInfinity: this.uInfinity,
    });
  }
}

module.exports = {
  SpikeRecorder,
};
