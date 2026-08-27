'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/adapters/db-adapter.js
 *  DATABASE REPLAY ADAPTER & MOCK PG POOL (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Nhiệm vụ:
 *    - Interceptor / Mock adapter cho pg.Pool và pg.Client (hàm `query()`).
 *    - Sử dụng `directionOf('db-query', sql)` từ B0':
 *      - Nếu WRITE: Ném `ReplayBlockedWriteError` (L1 sink classifier), ghi nhận block log.
 *      - Nếu READ: Tính `identityOf()`, lấy result từ FIFO queue của capsule.
 *        Nếu không tìm thấy -> ném `MissingRecordingError` (fail-closed, không fallback).
 */

const { EventEmitter } = require('node:events');
const { directionOf } = require('../../contract');
const { ReplayBlockedWriteError, MissingRecordingError } = require('../errors');

/**
 * Chuẩn hoá tham số gọi hàm query() của driver pg.
 * @param {string|object} textOrConfig
 * @param {any[]} [valuesOrCb]
 * @param {Function} [cb]
 * @returns {{ sql: string, values: any[], callback: Function|null }}
 */
function normalizeQueryParams(textOrConfig, valuesOrCb, cb) {
  let sql = '';
  let values = [];
  let callback = null;

  if (typeof textOrConfig === 'string') {
    sql = textOrConfig;
    if (typeof valuesOrCb === 'function') {
      callback = valuesOrCb;
    } else if (Array.isArray(valuesOrCb)) {
      values = valuesOrCb;
      if (typeof cb === 'function') callback = cb;
    }
  } else if (textOrConfig && typeof textOrConfig === 'object') {
    sql = textOrConfig.text || textOrConfig.sql || '';
    values = Array.isArray(textOrConfig.values) ? textOrConfig.values : [];
    if (typeof valuesOrCb === 'function') callback = valuesOrCb;
  }

  return { sql, values, callback };
}

/**
 * Định dạng kết quả từ capsule thành pg QueryResult tiêu chuẩn.
 * @param {any} recordedResult
 * @returns {object} { rows: any[], rowCount: number, command: string, fields: any[] }
 */
function formatPgResult(recordedResult) {
  let rows = [];
  let rowCount = 0;

  if (recordedResult && typeof recordedResult === 'object') {
    if (Array.isArray(recordedResult.rows)) {
      rows = recordedResult.rows;
    } else if (Array.isArray(recordedResult)) {
      rows = recordedResult;
    }

    if (typeof recordedResult.rowCount === 'number') {
      rowCount = recordedResult.rowCount;
    } else if (typeof recordedResult.row_count === 'number') {
      rowCount = recordedResult.row_count;
    } else {
      rowCount = rows.length;
    }
  }

  return {
    command: 'SELECT',
    rowCount,
    rows,
    fields: recordedResult && Array.isArray(recordedResult.fields) ? recordedResult.fields : [],
  };
}

class MockPgClient extends EventEmitter {
  /**
   * @param {import('../session').ReplaySession} session
   */
  constructor(session) {
    super();
    this.session = session;
    this._released = false;
  }

  async query(textOrConfig, valuesOrCb, cb) {
    const { sql, values, callback } = normalizeQueryParams(textOrConfig, valuesOrCb, cb);

    try {
      const direction = directionOf('db-query', sql);

      if (direction === 'WRITE') {
        // L1 SINK CLASSIFIER: Block write side-effects
        this.session.recordBlockedWrite({
          kind: 'db-query',
          target: sql,
          arguments: { bind: values },
          direction: 'WRITE',
        });
        const writeErr = new ReplayBlockedWriteError(
          `Replay blocked write query: "${sql}" (L1 default-deny, ADR-005)`,
          { kind: 'db-query', target: sql, arguments: values }
        );
        if (callback) {
          callback(writeErr);
          return;
        }
        throw writeErr;
      }

      // READ: Tra cứu FIFO queue trong session
      const recorded = this.session.consume({
        kind: 'db-query',
        target: sql,
        arguments: { bind: values },
        direction: 'READ',
      });

      const formatted = formatPgResult(recorded);

      if (callback) {
        callback(null, formatted);
        return formatted;
      }
      return formatted;
    } catch (err) {
      if (callback) {
        callback(err);
        return;
      }
      throw err;
    }
  }

  release() {
    this._released = true;
  }
}

class MockPgPool extends EventEmitter {
  /**
   * @param {import('../session').ReplaySession} session
   */
  constructor(session) {
    super();
    this.session = session;
    this.totalCount = 1;
    this.idleCount = 1;
    this.waitingCount = 0;
  }

  async query(textOrConfig, valuesOrCb, cb) {
    const client = new MockPgClient(this.session);
    return client.query(textOrConfig, valuesOrCb, cb);
  }

  async connect(cb) {
    const client = new MockPgClient(this.session);
    if (typeof cb === 'function') {
      cb(null, client, () => client.release());
      return;
    }
    return client;
  }

  async end(cb) {
    if (typeof cb === 'function') {
      cb(null);
      return;
    }
    return Promise.resolve();
  }
}

/**
 * Factory tạo Mock PG Pool gắn với ReplaySession.
 * @param {import('../session').ReplaySession} session
 * @returns {MockPgPool}
 */
function createMockPool(session) {
  return new MockPgPool(session);
}

/**
 * Factory tạo Mock PG Client gắn với ReplaySession.
 * @param {import('../session').ReplaySession} session
 * @returns {MockPgClient}
 */
function createMockClient(session) {
  return new MockPgClient(session);
}

/**
 * Factory tổng hợp DB Adapter.
 * @param {import('../session').ReplaySession} session
 * @returns {{ pool: MockPgPool, createClient: () => MockPgClient }}
 */
function createDbAdapter(session) {
  const pool = createMockPool(session);
  return {
    pool,
    createClient: () => createMockClient(session),
    createPool: () => createMockPool(session),
  };
}

module.exports = {
  MockPgClient,
  MockPgPool,
  createMockPool,
  createMockClient,
  createDbAdapter,
};
