'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Dependency #1: POSTGRESQL — NGUỒN SỰ THẬT DUY NHẤT của response.
 * Mọi truy vấn đều đi qua `runQuery()` để sinh đúng một đơn vị `db-query`.
 *
 * ⛔ Không có nhánh nào cho phép BỎ QUA một truy vấn. Số lượng truy vấn của một
 *    request là HẰNG SỐ — đó là điều kiện 1 của rubric §3.4 (hai dãy cùng số đơn vị).
 */

const { Pool } = require('pg');
const { KIND } = require('./interaction-log');

const POOL_MAX_CLIENTS = 5;
const CONNECTION_TIMEOUT_MS = 5000;

/**
 * @param {{host: string, port: number, user: string, password: string, database: string}} pgConfig
 * @returns {import('pg').Pool}
 */
function createPool(pgConfig) {
  return new Pool({
    host: pgConfig.host,
    port: pgConfig.port,
    user: pgConfig.user,
    password: pgConfig.password,
    database: pgConfig.database,
    max: POOL_MAX_CLIENTS,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    application_name: 'spike-app',
  });
}

/**
 * SQL fingerprint theo Spec §3.2 phép normalization 1: literal đã nằm ở bind
 * parameter, ở đây chỉ chuẩn hoá khoảng trắng.
 * @param {string} sql
 * @returns {string}
 */
function normalizeSql(sql) {
  return sql.replace(/\s+/gu, ' ').trim();
}

/**
 * @param {import('pg').Pool} pool
 * @param {import('./interaction-log').InteractionLog} log
 * @param {{sql: string, values?: unknown[]}} query
 * @returns {Promise<import('pg').QueryResult>}
 */
async function runQuery(pool, log, { sql, values = [] }) {
  const target = normalizeSql(sql);
  try {
    const result = await pool.query(sql, values);
    log.record({
      kind: KIND.DB_QUERY,
      target,
      args: values,
      result: { row_count: result.rowCount, rows: result.rows },
    });
    return result;
  } catch (error) {
    log.record({ kind: KIND.DB_QUERY, target, args: values, result: null, error: error.message });
    throw error;
  }
}

module.exports = { createPool, normalizeSql, runQuery };
