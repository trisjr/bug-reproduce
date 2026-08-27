'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Cấu hình cho Overhead Benchmark Harness (B7a).
 * Quản lý endpoint, concurrency, request count, target error rate,
 * resource limits và các tham số điều phối A/B (D-11, D-12).
 */

const crypto = require('node:crypto');

const DEFAULT_CONFIG = Object.freeze({
  // HTTP Load Driver defaults
  endpoint: 'http://127.0.0.1:8080/checkout',
  concurrency: 10,
  requestCount: 1000,
  targetErrorRate: 0.05, // 5% deterministic error rate
  timeoutMs: 5000,

  // Protocol conditions (MTP §3.1, §3.2)
  sampling: 'OFF', // Sampling luôn TẮT trong toàn bộ spike (FR-015, MTP §3.2)

  // Resource Gates D-12 & Sampler
  cgroupPath: '/sys/fs/cgroup',
  memLimitBytes: 320 * 1024 * 1024, // 320 MB limit
  memWarningThresholdRatio: 0.9, // 90% = 288 MB warning threshold
  dockerSocket: '/var/run/docker.sock',
  foreignContainers: Object.freeze(['tnm_db', 'tnm_redis', 'tnm_stub', 'tnm_app']),

  // Orchestrator A/B Stages (D-11: OFF / ON / OFF / ON)
  stages: Object.freeze(['OFF', 'ON', 'OFF', 'ON']),

  // Target App Reset & Database
  pg: Object.freeze({
    host: process.env.SPIKE_PG_HOST || '127.0.0.1',
    port: Number(process.env.SPIKE_PG_PORT || 5432),
    user: process.env.SPIKE_PG_USER || 'spike_user',
    password: process.env.SPIKE_PG_PASSWORD || 'spike_pass',
    database: process.env.SPIKE_PG_DATABASE || 'spike_db',
  }),
});

/**
 * Load và chuẩn hoá cấu hình benchmark từ env vars hoặc object tham số.
 *
 * @param {Record<string, unknown>} [overrides={}]
 * @returns {typeof DEFAULT_CONFIG & { runId: string }}
 */
function loadBenchConfig(overrides = {}) {
  const env = process.env;

  const endpoint = String(
    overrides.endpoint ||
    env.SPIKE_BENCH_ENDPOINT ||
    env.SPIKE_APP_URL ||
    DEFAULT_CONFIG.endpoint
  );

  const concurrency = Number(
    overrides.concurrency !== undefined
      ? overrides.concurrency
      : env.SPIKE_BENCH_CONCURRENCY || DEFAULT_CONFIG.concurrency
  );
  if (!Number.isInteger(concurrency) || concurrency <= 0) {
    throw new TypeError(`concurrency phải là số nguyên dương, nhận: ${concurrency}`);
  }

  const requestCount = Number(
    overrides.requestCount !== undefined
      ? overrides.requestCount
      : env.SPIKE_BENCH_REQUEST_COUNT || DEFAULT_CONFIG.requestCount
  );
  if (!Number.isInteger(requestCount) || requestCount <= 0) {
    throw new TypeError(`requestCount phải là số nguyên dương, nhận: ${requestCount}`);
  }

  const targetErrorRate = Number(
    overrides.targetErrorRate !== undefined
      ? overrides.targetErrorRate
      : env.SPIKE_BENCH_ERROR_RATE !== undefined
        ? env.SPIKE_BENCH_ERROR_RATE
        : DEFAULT_CONFIG.targetErrorRate
  );
  if (Number.isNaN(targetErrorRate) || targetErrorRate < 0 || targetErrorRate > 1) {
    throw new TypeError(`targetErrorRate phải nằm trong khoảng [0, 1], nhận: ${targetErrorRate}`);
  }

  const timeoutMs = Number(
    overrides.timeoutMs !== undefined
      ? overrides.timeoutMs
      : env.SPIKE_BENCH_TIMEOUT_MS || DEFAULT_CONFIG.timeoutMs
  );

  const cgroupPath = String(
    overrides.cgroupPath ||
    env.SPIKE_CGROUP_PATH ||
    DEFAULT_CONFIG.cgroupPath
  );

  const memLimitBytes = Number(
    overrides.memLimitBytes !== undefined
      ? overrides.memLimitBytes
      : env.SPIKE_BENCH_MEM_LIMIT_BYTES || DEFAULT_CONFIG.memLimitBytes
  );

  const memWarningThresholdRatio = Number(
    overrides.memWarningThresholdRatio !== undefined
      ? overrides.memWarningThresholdRatio
      : DEFAULT_CONFIG.memWarningThresholdRatio
  );

  const stages = Array.isArray(overrides.stages)
    ? Object.freeze([...overrides.stages])
    : DEFAULT_CONFIG.stages;

  const foreignContainers = Array.isArray(overrides.foreignContainers)
    ? Object.freeze([...overrides.foreignContainers])
    : DEFAULT_CONFIG.foreignContainers;

  const dockerSocket = String(
    overrides.dockerSocket ||
    env.DOCKER_SOCKET ||
    DEFAULT_CONFIG.dockerSocket
  );

  const runId = String(
    overrides.runId ||
    env.SPIKE_RUN_ID ||
    `bench-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  );

  const pg = Object.freeze({
    host: String(overrides.pg?.host || env.SPIKE_PG_HOST || DEFAULT_CONFIG.pg.host),
    port: Number(overrides.pg?.port || env.SPIKE_PG_PORT || DEFAULT_CONFIG.pg.port),
    user: String(overrides.pg?.user || env.SPIKE_PG_USER || DEFAULT_CONFIG.pg.user),
    password: String(overrides.pg?.password || env.SPIKE_PG_PASSWORD || DEFAULT_CONFIG.pg.password),
    database: String(overrides.pg?.database || env.SPIKE_PG_DATABASE || DEFAULT_CONFIG.pg.database),
  });

  return Object.freeze({
    runId,
    endpoint,
    concurrency,
    requestCount,
    targetErrorRate,
    timeoutMs,
    sampling: DEFAULT_CONFIG.sampling,
    cgroupPath,
    memLimitBytes,
    memWarningThresholdRatio,
    stages,
    foreignContainers,
    dockerSocket,
    pg,
  });
}

module.exports = {
  DEFAULT_CONFIG,
  loadBenchConfig,
};
