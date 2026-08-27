'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Sampler thu thập cgroup v2 metrics (CPU, Memory, Throttling, OOM)
 * từ /sys/fs/cgroup/ hoặc fallback process metrics khi chạy local.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Parse file định dạng key-value của cgroup (ví dụ: `cpu.stat`, `memory.events`).
 *
 * @param {string} content
 * @returns {Record<string, number>}
 */
function parseKeyValueFile(content) {
  const result = {};
  if (!content || typeof content !== 'string') {
    return result;
  }

  const lines = content.trim().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const key = parts[0];
      const val = Number(parts[1]);
      result[key] = Number.isNaN(val) ? 0 : val;
    }
  }
  return result;
}

/**
 * Đọc nội dung file cgroup an toàn (trả về null nếu không đọc được).
 *
 * @param {string} cgroupPath
 * @param {string} filename
 * @returns {string | null}
 */
function safeReadCgroupFile(cgroupPath, filename) {
  try {
    const targetFile = path.join(cgroupPath, filename);
    if (fs.existsSync(targetFile)) {
      return fs.readFileSync(targetFile, 'utf8');
    }
  } catch (_) {}
  return null;
}

/**
 * Lấy snapshot metrics từ cgroup v2 hoặc process fallback.
 *
 * @param {object} [options={}]
 * @param {string} [options.cgroupPath='/sys/fs/cgroup']
 * @param {object} [options.mockMetrics] - Dùng cho unit tests
 * @returns {{
 *   timestamp: number,
 *   hrtime: bigint,
 *   cgroupAvailable: boolean,
 *   cpu: {
 *     usage_usec: number,
 *     user_usec: number,
 *     system_usec: number,
 *     nr_periods: number,
 *     nr_throttled: number,
 *     throttled_usec: number,
 *   },
 *   memory: {
 *     peak_bytes: number,
 *     current_bytes: number,
 *     oom_kill: number,
 *     events: Record<string, number>,
 *   },
 *   raw?: object,
 * }}
 */
function takeSnapshot(options = {}) {
  const hrtime = process.hrtime.bigint();
  const timestamp = Date.now();

  if (options.mockMetrics) {
    return {
      timestamp,
      hrtime,
      cgroupAvailable: true,
      cpu: {
        usage_usec: Number(options.mockMetrics.cpu?.usage_usec || 0),
        user_usec: Number(options.mockMetrics.cpu?.user_usec || 0),
        system_usec: Number(options.mockMetrics.cpu?.system_usec || 0),
        nr_periods: Number(options.mockMetrics.cpu?.nr_periods || 0),
        nr_throttled: Number(options.mockMetrics.cpu?.nr_throttled || 0),
        throttled_usec: Number(options.mockMetrics.cpu?.throttled_usec || 0),
      },
      memory: {
        peak_bytes: Number(options.mockMetrics.memory?.peak_bytes || 0),
        current_bytes: Number(options.mockMetrics.memory?.current_bytes || 0),
        oom_kill: Number(options.mockMetrics.memory?.oom_kill || 0),
        events: options.mockMetrics.memory?.events || {},
      },
      raw: options.mockMetrics,
    };
  }

  const cgroupPath = options.cgroupPath || '/sys/fs/cgroup';
  const cpuStatRaw = safeReadCgroupFile(cgroupPath, 'cpu.stat');
  const memPeakRaw = safeReadCgroupFile(cgroupPath, 'memory.peak');
  const memCurrentRaw = safeReadCgroupFile(cgroupPath, 'memory.current');
  const memEventsRaw = safeReadCgroupFile(cgroupPath, 'memory.events');

  const cgroupAvailable = cpuStatRaw !== null || memPeakRaw !== null || memEventsRaw !== null;

  if (cgroupAvailable) {
    const cpuStat = parseKeyValueFile(cpuStatRaw || '');
    const memEvents = parseKeyValueFile(memEventsRaw || '');
    const peakBytes = memPeakRaw !== null ? Number(memPeakRaw.trim()) || 0 : 0;
    const currentBytes = memCurrentRaw !== null ? Number(memCurrentRaw.trim()) || 0 : 0;

    return {
      timestamp,
      hrtime,
      cgroupAvailable: true,
      cpu: {
        usage_usec: cpuStat.usage_usec || 0,
        user_usec: cpuStat.user_usec || 0,
        system_usec: cpuStat.system_usec || 0,
        nr_periods: cpuStat.nr_periods || 0,
        nr_throttled: cpuStat.nr_throttled || 0,
        throttled_usec: cpuStat.throttled_usec || 0,
      },
      memory: {
        peak_bytes: peakBytes > 0 ? peakBytes : currentBytes,
        current_bytes: currentBytes,
        oom_kill: memEvents.oom_kill || 0,
        events: memEvents,
      },
    };
  }

  // Fallback: Node.js process metrics (cho macOS / local non-container run)
  const cpuUsage = process.cpuUsage();
  const memUsage = process.memoryUsage();

  return {
    timestamp,
    hrtime,
    cgroupAvailable: false,
    cpu: {
      usage_usec: cpuUsage.user + cpuUsage.system,
      user_usec: cpuUsage.user,
      system_usec: cpuUsage.system,
      nr_periods: 0,
      nr_throttled: 0,
      throttled_usec: 0,
    },
    memory: {
      peak_bytes: memUsage.rss,
      current_bytes: memUsage.rss,
      oom_kill: 0,
      events: { oom_kill: 0 },
    },
  };
}

/**
 * Tính chênh lệch (diff) giữa 2 snapshot start và end.
 *
 * @param {ReturnType<typeof takeSnapshot>} startSnapshot
 * @param {ReturnType<typeof takeSnapshot>} endSnapshot
 * @returns {{
 *   elapsed_ms: number,
 *   cpu_usage_usec_delta: number,
 *   cpu_usage_ms_delta: number,
 *   nr_periods_delta: number,
 *   nr_throttled_delta: number,
 *   throttled_usec_delta: number,
 *   memory_peak_bytes: number,
 *   memory_peak_mb: number,
 *   oom_kill_delta: number,
 *   cgroupAvailable: boolean,
 * }}
 */
function computeMetricsDiff(startSnapshot, endSnapshot) {
  const elapsed_ms = Number(endSnapshot.hrtime - startSnapshot.hrtime) / 1e6;

  const cpu_usage_usec_delta = Math.max(
    0,
    endSnapshot.cpu.usage_usec - startSnapshot.cpu.usage_usec
  );
  const cpu_usage_ms_delta = cpu_usage_usec_delta / 1000;

  const nr_periods_delta = Math.max(
    0,
    endSnapshot.cpu.nr_periods - startSnapshot.cpu.nr_periods
  );
  const nr_throttled_delta = Math.max(
    0,
    endSnapshot.cpu.nr_throttled - startSnapshot.cpu.nr_throttled
  );
  const throttled_usec_delta = Math.max(
    0,
    endSnapshot.cpu.throttled_usec - startSnapshot.cpu.throttled_usec
  );

  const memory_peak_bytes = Math.max(
    startSnapshot.memory.peak_bytes,
    endSnapshot.memory.peak_bytes
  );
  const memory_peak_mb = memory_peak_bytes / (1024 * 1024);

  const oom_kill_delta = Math.max(
    0,
    endSnapshot.memory.oom_kill - startSnapshot.memory.oom_kill
  );

  return {
    elapsed_ms,
    cpu_usage_usec_delta,
    cpu_usage_ms_delta,
    nr_periods_delta,
    nr_throttled_delta,
    throttled_usec_delta,
    memory_peak_bytes,
    memory_peak_mb,
    oom_kill_delta,
    cgroupAvailable: endSnapshot.cgroupAvailable,
  };
}

module.exports = {
  parseKeyValueFile,
  safeReadCgroupFile,
  takeSnapshot,
  computeMetricsDiff,
};
