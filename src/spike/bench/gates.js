'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * Resource Gates D-12 cho B7a Overhead Benchmark Harness.
 * Kiểm tra các ngưỡng tài nguyên và điều kiện ngoại vi:
 *  1. cpu.stat.nr_throttled > 0 -> UNINTERPRETABLE (CFS throttling bóp méo đuôi latency).
 *  2. memory.events.oom_kill > 0 -> ABORT / FAIL-FAST (đứt gãy cửa sổ đo).
 *  3. memory.peak >= 0.9 * mem_limit (288 MB / 320 MB) -> WARNING sớm.
 *  4. Foreign container integrity: 4/4 container tnm_* phải giữ trạng thái running.
 */

const http = require('node:http');
const fs = require('node:fs');

/**
 * Probe trạng thái của 4 container tnm_* qua Docker Engine API (Unix socket) hoặc mock.
 *
 * @param {object} [options={}]
 * @param {string} [options.dockerSocket='/var/run/docker.sock']
 * @param {string[]} [options.containerNames=['tnm_db', 'tnm_redis', 'tnm_stub', 'tnm_app']]
 * @param {Record<string, string|boolean>} [options.mockStatus] - Dùng cho unit tests
 * @param {Function} [options.probeFn] - Custom probe function
 * @returns {Promise<{
 *   allRunning: boolean,
 *   containers: Record<string, { name: string, status: string, running: boolean }>,
 *   probeMethod: 'docker-socket' | 'mock' | 'custom' | 'assumed-local',
 *   error?: string,
 * }>}
 */
function probeForeignContainers(options = {}) {
  const containerNames = options.containerNames || ['tnm_db', 'tnm_redis', 'tnm_stub', 'tnm_app'];

  if (typeof options.probeFn === 'function') {
    return Promise.resolve(options.probeFn(options));
  }

  if (options.mockStatus) {
    const containers = {};
    let allRunning = true;

    for (const name of containerNames) {
      const val = options.mockStatus[name];
      const isRunning = val === true || val === 'running' || val === 'Up';
      containers[name] = {
        name,
        status: typeof val === 'string' ? val : (isRunning ? 'running' : 'exited'),
        running: isRunning,
      };
      if (!isRunning) {
        allRunning = false;
      }
    }

    return Promise.resolve({
      allRunning,
      containers,
      probeMethod: 'mock',
    });
  }

  const socketPath = options.dockerSocket || '/var/run/docker.sock';
  const socketExists = fs.existsSync(socketPath);

  if (!socketExists) {
    // Môi trường local/test không có Docker daemon socket -> Assumed running
    const containers = {};
    for (const name of containerNames) {
      containers[name] = {
        name,
        status: 'running (assumed-local)',
        running: true,
      };
    }
    return Promise.resolve({
      allRunning: true,
      containers,
      probeMethod: 'assumed-local',
    });
  }

  return new Promise((resolve) => {
    const req = http.request(
      {
        socketPath,
        path: '/containers/json?all=1',
        method: 'GET',
        headers: { host: 'localhost' },
        timeout: 3000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8');
            const list = JSON.parse(raw);
            const containers = {};
            let allRunning = true;

            const runningMap = new Map();
            if (Array.isArray(list)) {
              for (const c of list) {
                const names = Array.isArray(c.Names) ? c.Names.map((n) => n.replace(/^\//, '')) : [];
                const isRunning = c.State === 'running' || (typeof c.Status === 'string' && c.Status.startsWith('Up'));
                for (const n of names) {
                  runningMap.set(n, { status: c.Status || c.State || 'unknown', running: isRunning });
                }
              }
            }

            for (const name of containerNames) {
              const matched = runningMap.get(name);
              if (matched) {
                containers[name] = {
                  name,
                  status: matched.status,
                  running: matched.running,
                };
                if (!matched.running) {
                  allRunning = false;
                }
              } else {
                // Container không tìm thấy
                containers[name] = {
                  name,
                  status: 'not_found',
                  running: false,
                };
                allRunning = false;
              }
            }

            resolve({
              allRunning,
              containers,
              probeMethod: 'docker-socket',
            });
          } catch (err) {
            resolve({
              allRunning: false,
              containers: {},
              probeMethod: 'docker-socket',
              error: `Parse docker json error: ${err.message}`,
            });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        allRunning: false,
        containers: {},
        probeMethod: 'docker-socket',
        error: 'Docker socket probe timeout',
      });
    });

    req.on('error', (err) => {
      resolve({
        allRunning: false,
        containers: {},
        probeMethod: 'docker-socket',
        error: `Docker socket error: ${err.message}`,
      });
    });

    req.end();
  });
}

/**
 * Đánh giá Resource Gates D-12 cho một chặng hoặc toàn bộ run.
 *
 * @param {object} params
 * @param {import('./sampler').takeSnapshot} params.startSnapshot
 * @param {import('./sampler').takeSnapshot} params.endSnapshot
 * @param {import('./sampler').computeMetricsDiff} params.diff
 * @param {number} [params.memLimitBytes=335544320] - 320 MB
 * @param {number} [params.memWarningThresholdRatio=0.9] - 90% (288 MB)
 * @param {Awaited<ReturnType<typeof probeForeignContainers>>} [params.containerProbeResult]
 * @returns {{
 *   passed: boolean,
 *   uninterpretable: boolean,
 *   aborted: boolean,
 *   warnings: string[],
 *   errors: string[],
 *   reasons: string[],
 *   details: {
 *     nr_throttled: number,
 *     nr_throttled_delta: number,
 *     throttled_usec: number,
 *     oom_kill: number,
 *     oom_kill_delta: number,
 *     memory_peak_bytes: number,
 *     memory_limit_bytes: number,
 *     memory_peak_mb: number,
 *     memory_limit_mb: number,
 *     memory_ratio: number,
 *     container_probe?: object,
 *   }
 * }}
 */
function evaluateResourceGates(params) {
  const {
    startSnapshot,
    endSnapshot,
    diff,
    memLimitBytes = 320 * 1024 * 1024,
    memWarningThresholdRatio = 0.9,
    containerProbeResult,
  } = params;

  const warnings = [];
  const errors = [];
  const reasons = [];

  let uninterpretable = false;
  let aborted = false;

  const nrThrottled = endSnapshot?.cpu?.nr_throttled || 0;
  const nrThrottledDelta = diff?.nr_throttled_delta || 0;
  const throttledUsec = diff?.throttled_usec_delta || 0;

  const oomKill = endSnapshot?.memory?.oom_kill || 0;
  const oomKillDelta = diff?.oom_kill_delta || 0;

  const memPeakBytes = diff?.memory_peak_bytes || endSnapshot?.memory?.peak_bytes || 0;
  const memPeakMb = Number((memPeakBytes / (1024 * 1024)).toFixed(2));
  const memLimitMb = Number((memLimitBytes / (1024 * 1024)).toFixed(2));
  const memRatio = memLimitBytes > 0 ? memPeakBytes / memLimitBytes : 0;

  // Gate 1: CFS CPU Throttling (D-12)
  if (nrThrottledDelta > 0 || nrThrottled > 0) {
    uninterpretable = true;
    const msg = `CFS CPU Throttling detected (nr_throttled: ${nrThrottled}, delta: ${nrThrottledDelta}, throttled: ${throttledUsec}µs). Latency distribution is distorted and UNINTERPRETABLE.`;
    errors.push(msg);
    reasons.push(msg);
  }

  // Gate 2: Cgroup Memory OOM Kill (D-12)
  if (oomKillDelta > 0 || oomKill > 0) {
    aborted = true;
    const msg = `Cgroup OOM Kill event detected (oom_kill: ${oomKill}, delta: ${oomKillDelta}). Immediate abort triggered.`;
    errors.push(msg);
    reasons.push(msg);
  }

  // Gate 3: Memory Peak 90% Warning Threshold (D-12)
  const warningLimitBytes = memLimitBytes * memWarningThresholdRatio;
  if (memPeakBytes >= warningLimitBytes && memLimitBytes > 0) {
    const warningMsg = `Memory peak reached ${(memRatio * 100).toFixed(1)}% of limit (${memPeakMb} MB / ${memLimitMb} MB, threshold: ${(memWarningThresholdRatio * 100).toFixed(0)}%).`;
    warnings.push(warningMsg);
  }

  // Gate 4: Foreign Container Integrity (4/4 tnm_* running)
  if (containerProbeResult && !containerProbeResult.allRunning) {
    const failedContainers = Object.values(containerProbeResult.containers || {})
      .filter((c) => !c.running)
      .map((c) => `${c.name} (${c.status})`);
    const containerMsg = `Foreign container integrity gate failed: non-running containers detected [${failedContainers.join(', ')}]`;
    errors.push(containerMsg);
    reasons.push(containerMsg);
  }

  const passed = !aborted && errors.length === 0;

  return {
    passed,
    uninterpretable,
    aborted,
    warnings,
    errors,
    reasons,
    details: {
      nr_throttled: nrThrottled,
      nr_throttled_delta: nrThrottledDelta,
      throttled_usec: throttledUsec,
      oom_kill: oomKill,
      oom_kill_delta: oomKillDelta,
      memory_peak_bytes: memPeakBytes,
      memory_limit_bytes: memLimitBytes,
      memory_peak_mb: memPeakMb,
      memory_limit_mb: memLimitMb,
      memory_ratio: Number(memRatio.toFixed(4)),
      container_probe: containerProbeResult,
    },
  };
}

module.exports = {
  probeForeignContainers,
  evaluateResourceGates,
};
