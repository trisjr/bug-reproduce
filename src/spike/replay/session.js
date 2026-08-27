'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/session.js
 *  REPLAY SESSION & OCCURRENCE QUEUE (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Nạp artifact từ object hoặc đọc capsule từ B4 (`readCapsule`).
 *    - Xây dựng index tra cứu FIFO occurrence queue theo `identityOf(normalizedUnit)` từ B0'.
 *    - Quản lý trạng thái replay cursor, log các interactions được dispatch hoặc bị chặn.
 *    - Fail-closed: Missing recording ném `MissingRecordingError` (SEC-034).
 *    - Default-deny: Write side effects bị chặn ở L1 ném `ReplayBlockedWriteError` (ADR-005).
 */

const fs = require('node:fs');
const {
  validateArtifact,
  parseArtifact,
  normalize,
  identity,
  identityOf,
  directionOf,
} = require('../contract');
const { readCapsule } = require('../capsule');
const { MissingRecordingError, ReplayBlockedWriteError } = require('./errors');

class ReplaySession {
  /**
   * @param {object|string} artifactOrPath Artifact object, JSON string, hoặc đường dẫn tới capsule file
   */
  constructor(artifactOrPath) {
    this.artifact = this._loadArtifact(artifactOrPath);
    this.scenarioId = this.artifact.scenarioId;
    this.capsuleId = this.artifact.capsuleId;
    this.manifestCommitHash = this.artifact.manifestCommitHash;
    this.classAssessment = this.artifact.classAssessment;
    this.u0 = this.artifact.u0;
    this.uInfinity = this.artifact.uInfinity;
    this.rawInteractions = this.artifact.interactions || [];

    // Danh sách interaction entries kèm trạng thái consumed
    this.entries = [];
    // Map identityKey -> Array<Entry> (FIFO occurrence queue)
    this.fifoQueues = new Map();
    // FIFO queue riêng cho clock (U-13)
    this.clockQueue = [];
    // Map flagName -> Entry / boolean
    this.flagsMap = new Map();

    // Logs theo dõi trong quá trình replay
    this.dispatchedInteractions = [];
    this.blockedWrites = [];
    this.unservedReads = [];

    this._buildIndex();
  }

  /**
   * @private
   */
  _loadArtifact(artifactOrPath) {
    if (!artifactOrPath) {
      throw new TypeError('ReplaySession: artifactOrPath is required');
    }

    let parsed;
    if (typeof artifactOrPath === 'string') {
      const trimmed = artifactOrPath.trim();
      if (trimmed.startsWith('{')) {
        parsed = parseArtifact(trimmed);
      } else {
        // Đọc từ file path (thử readCapsule trước, nếu không rơi về fs)
        try {
          parsed = readCapsule(artifactOrPath);
        } catch (err) {
          if (fs.existsSync(artifactOrPath)) {
            const content = fs.readFileSync(artifactOrPath, 'utf8');
            parsed = parseArtifact(content);
          } else {
            throw err;
          }
        }
      }
    } else if (typeof artifactOrPath === 'object' && artifactOrPath !== null) {
      parsed = artifactOrPath;
    } else {
      throw new TypeError('ReplaySession: invalid artifactOrPath type ' + typeof artifactOrPath);
    }

    const validation = validateArtifact(parsed);
    if (!validation.ok) {
      throw new Error(
        'ReplaySession: invalid artifact schema: ' + JSON.stringify(validation.errors)
      );
    }

    return parsed;
  }

  /**
   * @private
   * Xây dựng FIFO occurrence queues và các index chuyên biệt.
   */
  _buildIndex() {
    this.entries = [];
    this.fifoQueues.clear();
    this.clockQueue = [];
    this.flagsMap.clear();

    for (let i = 0; i < this.rawInteractions.length; i++) {
      const raw = this.rawInteractions[i];
      const normalized = normalize(raw);
      const key = identity(normalized);

      const entry = {
        index: i,
        raw,
        normalized,
        identityKey: key,
        consumed: false,
      };

      this.entries.push(entry);

      // Thêm vào FIFO queue theo identityKey
      if (!this.fifoQueues.has(key)) {
        this.fifoQueues.set(key, []);
      }
      this.fifoQueues.get(key).push(entry);

      // Thêm vào Clock FIFO queue (U-13)
      if (raw.kind === 'clock') {
        this.clockQueue.push(entry);
      }

      // Lưu trữ flag lookup
      if (raw.kind === 'feature-flag') {
        const flagName = String(raw.target || '').trim();
        let val = false;
        if (raw.result && typeof raw.result === 'object' && 'enabled' in raw.result) {
          val = Boolean(raw.result.enabled);
        } else if (raw.result !== undefined && raw.result !== null) {
          val = Boolean(raw.result);
        }
        if (!this.flagsMap.has(flagName)) {
          this.flagsMap.set(flagName, []);
        }
        this.flagsMap.get(flagName).push({ entry, value: val });
      }
    }
  }

  /**
   * Khôi phục lại trạng thái replay từ đầu.
   */
  reset() {
    for (const entry of this.entries) {
      entry.consumed = false;
    }
    this.dispatchedInteractions = [];
    this.blockedWrites = [];
    this.unservedReads = [];
  }

  /**
   * Ghi nhận một write side-effect bị chặn ở L1.
   * @param {object} spec
   * @returns {object}
   */
  recordBlockedWrite(spec) {
    const record = {
      kind: spec.kind,
      target: spec.target,
      arguments: spec.arguments,
      method: spec.method,
      direction: 'WRITE',
      blockedAt: new Date().toISOString(),
      reason: spec.reason || 'L1 Sink Classifier blocked write side effect in default-deny replay',
    };
    this.blockedWrites.push(record);
    return record;
  }

  /**
   * Tiêu thụ một tương tác READ hoặc chặn một tương tác WRITE (fail-closed, ADR-005 / R3).
   * @param {object} spec
   * @returns {any} Kết quả đã ghi (recorded result)
   */
  consume(spec) {
    if (!spec || typeof spec !== 'object') {
      throw new TypeError('consume: spec must be an object');
    }

    const kind = String(spec.kind || '').trim().toLowerCase();
    const target = spec.target === undefined ? null : spec.target;
    const direction = spec.direction || directionOf(kind, target);

    // L1 SINK CLASSIFIER: Default-Deny Write
    if (direction === 'WRITE') {
      this.recordBlockedWrite(spec);
      throw new ReplayBlockedWriteError(
        `Replay blocked write side effect on ${kind}: "${target || ''}" (L1 default-deny)`,
        { kind, target, arguments: spec.arguments, unit: spec }
      );
    }

    // Xử lý riêng cho clock theo FIFO cursor (U-13)
    if (kind === 'clock') {
      return this.consumeClock(spec);
    }

    // Xử lý riêng cho feature-flag
    if (kind === 'feature-flag') {
      return this.consumeFlag(String(target || '').trim());
    }

    // Tìm kiếm trong FIFO queue theo identityOf
    const candidateKeys = this._generateCandidateKeys(spec);
    let matchedEntry = null;

    for (const key of candidateKeys) {
      const queue = this.fifoQueues.get(key);
      if (queue && queue.length > 0) {
        for (const entry of queue) {
          if (!entry.consumed) {
            matchedEntry = entry;
            break;
          }
        }
      }
      if (matchedEntry) break;
    }

    if (!matchedEntry) {
      // FAIL-CLOSED: Không tìm thấy recording -> Không fallback ra DB/mạng thật
      this.unservedReads.push({
        kind,
        target,
        arguments: spec.arguments,
        method: spec.method,
        direction: 'READ',
        missedAt: new Date().toISOString(),
      });
      throw new MissingRecordingError(
        `Missing recording in capsule for ${kind} target="${target || ''}" (fail-closed, SEC-034)`,
        { kind, target, arguments: spec.arguments, unit: spec }
      );
    }

    // Đánh dấu đã tiêu thụ theo FIFO
    matchedEntry.consumed = true;
    this.dispatchedInteractions.push(matchedEntry.raw);

    return matchedEntry.raw.result;
  }

  /**
   * @private
   * Sinh các candidate identity key cho các dạng packaging khác nhau của arguments.
   */
  _generateCandidateKeys(spec) {
    const keys = [];
    const kind = spec.kind;
    const target = spec.target === undefined ? null : spec.target;
    const method = spec.method;
    const rawArgs = spec.arguments;

    const baseUnit = {
      kind,
      target,
      method,
      direction: 'READ',
      redactedFields: spec.redactedFields || [],
    };

    // 1. Dạng chính xác như truyền vào
    try {
      const norm = normalize(Object.assign({}, baseUnit, { arguments: rawArgs }));
      keys.push(identity(norm));
    } catch (_) {}

    // 2. Các biến thể cho db-query: Array values vs { bind: values } vs { values }
    if (kind === 'db-query') {
      if (Array.isArray(rawArgs)) {
        try {
          keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: { bind: rawArgs } }))));
          keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: { values: rawArgs } }))));
        } catch (_) {}
      } else if (rawArgs && typeof rawArgs === 'object') {
        if (Array.isArray(rawArgs.bind)) {
          try {
            keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: rawArgs.bind }))));
            keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: { values: rawArgs.bind } }))));
          } catch (_) {}
        } else if (Array.isArray(rawArgs.values)) {
          try {
            keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: rawArgs.values }))));
            keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: { bind: rawArgs.values } }))));
          } catch (_) {}
        }
      }
    }

    // 3. Các biến thể cho outbound-http: body vs { body }
    if (kind === 'outbound-http' || kind === 'inbound-http') {
      if (rawArgs && typeof rawArgs === 'object' && !('body' in rawArgs)) {
        try {
          keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: { body: rawArgs } }))));
        } catch (_) {}
      } else if (rawArgs && typeof rawArgs === 'object' && 'body' in rawArgs) {
        try {
          keys.push(identity(normalize(Object.assign({}, baseUnit, { arguments: rawArgs.body }))));
        } catch (_) {}
      }
    }

    return Array.from(new Set(keys));
  }

  /**
   * Tiêu thụ lần đọc Clock kế tiếp theo FIFO cursor (U-13).
   * @param {object} [spec]
   * @returns {string|number|Date}
   */
  consumeClock(spec = {}) {
    let nextClockEntry = null;
    for (const entry of this.clockQueue) {
      if (!entry.consumed) {
        nextClockEntry = entry;
        break;
      }
    }

    if (!nextClockEntry) {
      this.unservedReads.push({
        kind: 'clock',
        target: spec.target || null,
        arguments: spec.arguments || {},
        missedAt: new Date().toISOString(),
      });
      throw new MissingRecordingError(
        'No more recorded clock entries in capsule (clock queue exhausted, U-13 fail-closed)',
        { kind: 'clock', target: spec.target, unit: spec }
      );
    }

    nextClockEntry.consumed = true;
    this.dispatchedInteractions.push(nextClockEntry.raw);
    return nextClockEntry.raw.result;
  }

  /**
   * Tiêu thụ Feature Flag theo flag name.
   * @param {string} flagName
   * @returns {boolean}
   */
  consumeFlag(flagName) {
    const list = this.flagsMap.get(flagName);
    let matched = null;

    if (list && list.length > 0) {
      for (const item of list) {
        if (!item.entry.consumed) {
          matched = item;
          break;
        }
      }
      // Nếu tất cả entries cho flag này đã consumed, vẫn cho phép đọc lại giá trị đã record (idempotent flag read)
      if (!matched && list.length > 0) {
        matched = list[list.length - 1];
      }
    }

    if (!matched) {
      this.unservedReads.push({
        kind: 'feature-flag',
        target: flagName,
        missedAt: new Date().toISOString(),
      });
      throw new MissingRecordingError(
        `Feature flag "${flagName}" was not recorded in capsule (fail-closed, SEC-034)`,
        { kind: 'feature-flag', target: flagName }
      );
    }

    matched.entry.consumed = true;
    this.dispatchedInteractions.push(matched.entry.raw);
    return matched.value;
  }

  /**
   * Trả về danh sách interactions đã được dispatch.
   * @returns {Array<object>}
   */
  getDispatchedInteractions() {
    return this.dispatchedInteractions.slice();
  }

  /**
   * Trả về danh sách write side effects bị chặn bởi L1.
   * @returns {Array<object>}
   */
  getBlockedWrites() {
    return this.blockedWrites.slice();
  }

  /**
   * Trả về danh sách read calls bị thiếu trong recording.
   * @returns {Array<object>}
   */
  getUnservedReads() {
    return this.unservedReads.slice();
  }

  /**
   * Trả về các interactions trong capsule chưa được tiêu thụ.
   * @returns {Array<object>}
   */
  getRemainingInteractions() {
    return this.entries.filter((e) => !e.consumed).map((e) => e.raw);
  }
}

module.exports = {
  ReplaySession,
};
