'use strict';

/**
 * ============================================================================
 *  B5 · src/spike/replay/index.js
 *  REPLAY RUNTIME ENGINE & ADAPTER ENTRY POINT (P0-B / Wave 3)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Cung cấp:
 *    - ReplaySession: Quản lý nạp artifact, FIFO occurrence queues, tracking.
 *    - SpikeReplayRuntime / createReplayRuntime(): Engine tích hợp toàn bộ adapters.
 *    - wrapApp(handler, options): Wrap app handlers (như handleCheckout) để chạy
 *      hoàn toàn trong môi trường mock/replay không đụng tới DB hay mạng thật.
 *    - Error hierarchy: MissingRecordingError, ReplayBlockedWriteError.
 */

const { MissingRecordingError, ReplayBlockedWriteError } = require('./errors');
const { ReplaySession } = require('./session');
const {
  createDbAdapter,
  createMockPool,
  createMockClient,
  MockPgPool,
  MockPgClient,
} = require('./adapters/db-adapter');
const {
  createHttpAdapter,
  HttpReplayAdapter,
} = require('./adapters/http-adapter');
const {
  createClockAdapter,
  ClockReplayAdapter,
} = require('./adapters/clock-adapter');
const {
  createFlagAdapter,
  FlagReplayAdapter,
} = require('./adapters/flag-adapter');

class SpikeReplayRuntime {
  /**
   * @param {object|string} artifactOrPath Artifact object, JSON string, hoặc file path
   * @param {object} [options]
   */
  constructor(artifactOrPath, options = {}) {
    if (artifactOrPath instanceof ReplaySession) {
      this.session = artifactOrPath;
    } else {
      this.session = new ReplaySession(artifactOrPath);
    }

    this.options = options;

    // Khởi tạo các I/O Adapters
    this.dbAdapter = createDbAdapter(this.session);
    this.httpAdapter = createHttpAdapter(this.session);
    this.clockAdapter = createClockAdapter(this.session);
    this.flagAdapter = createFlagAdapter(this.session);

    // Tiện ích tắt
    this.pool = this.dbAdapter.pool;
    this.fetch = this.httpAdapter.fetch.bind(this.httpAdapter);
    this.requestJson = this.httpAdapter.requestJson.bind(this.httpAdapter);
  }

  /**
   * Trả về danh sách interactions đã được dispatch.
   */
  getDispatchedInteractions() {
    return this.session.getDispatchedInteractions();
  }

  /**
   * Trả về danh sách write side-effects bị chặn bởi L1.
   */
  getBlockedWrites() {
    return this.session.getBlockedWrites();
  }

  /**
   * Trả về danh sách interactions đọc bị thiếu trong recording.
   */
  getUnservedReads() {
    return this.session.getUnservedReads();
  }

  /**
   * Reset runtime và session về trạng thái ban đầu.
   */
  reset() {
    this.session.reset();
  }

  /**
   * Chạy một async function trong replay context (tự động cài đặt & dọn dẹp hooks).
   * @param {(runtime: SpikeReplayRuntime) => Promise<any>} fn
   * @returns {Promise<any>}
   */
  async run(fn) {
    try {
      return await fn(this);
    } finally {
      // Dọn dẹp bất kỳ hook nào nếu có
      this.httpAdapter.restore();
    }
  }
}

/**
 * Factory tạo SpikeReplayRuntime.
 * @param {object|string} artifactOrPath
 * @param {object} [options]
 * @returns {SpikeReplayRuntime}
 */
function createReplayRuntime(artifactOrPath, options = {}) {
  return new SpikeReplayRuntime(artifactOrPath, options);
}

/**
 * Wrap một request handler (như `handleCheckout` từ `src/spike/app/checkout.js`)
 * để chạy an toàn trong môi trường Replay.
 *
 * @param {Function} handler Handler dạng `async (ctx, rawBody) => response`
 * @param {object} options `{ artifact | capsulePath | session | runtime, appClockModule?, extraCtx? }`
 * @returns {(rawBody?: any, customCtx?: any) => Promise<{ statusCode: number, body: any, runtime: SpikeReplayRuntime, session: ReplaySession }>}
 */
function wrapApp(handler, options = {}) {
  if (typeof handler !== 'function') {
    throw new TypeError('wrapApp: handler must be a function');
  }

  let runtime;
  if (options.runtime instanceof SpikeReplayRuntime) {
    runtime = options.runtime;
  } else if (options.session instanceof ReplaySession) {
    runtime = new SpikeReplayRuntime(options.session);
  } else if (options.artifact || options.capsulePath || options.artifactOrPath) {
    const target = options.artifact || options.capsulePath || options.artifactOrPath;
    runtime = new SpikeReplayRuntime(target);
  } else {
    throw new TypeError('wrapApp: options must specify artifact, capsulePath, session, or runtime');
  }

  return async function replayHandler(rawBody, customCtx = {}) {
    // Cài đặt clock provider nếu có clock module được truyền vào
    if (options.appClockModule) {
      runtime.clockAdapter.install(options.appClockModule);
    }

    // Tạo context giả lập tương thích hoàn toàn với app checkout
    const dummyLog = {
      record: () => {},
      markOutcomeComputed: () => {},
    };

    const dummyCache = {
      shadowCompare: async () => {},
      recordCheckoutTelemetry: async () => {},
    };

    const replayCtx = Object.assign(
      {
        config: {
          runId: runtime.session.scenarioId || 'replay-run',
          flagFile: 'replay-flags',
          httpStubUrl: 'http://spike-httpstub:8081',
        },
        pool: runtime.pool,
        cache: dummyCache,
        log: dummyLog,
        requestId: 'replay-req-1',
      },
      options.extraCtx || {},
      customCtx
    );

    try {
      const result = await handler(replayCtx, rawBody);
      return {
        statusCode: result?.statusCode || 200,
        body: result?.body,
        runtime,
        session: runtime.session,
        dispatchedInteractions: runtime.getDispatchedInteractions(),
        blockedWrites: runtime.getBlockedWrites(),
      };
    } finally {
      if (options.appClockModule) {
        runtime.clockAdapter.restore(options.appClockModule);
      }
    }
  };
}

module.exports = {
  // Error Hierarchy
  MissingRecordingError,
  ReplayBlockedWriteError,

  // Session & Runtime
  ReplaySession,
  SpikeReplayRuntime,
  createReplayRuntime,
  wrapApp,

  // Adapters
  createDbAdapter,
  createMockPool,
  createMockClient,
  MockPgPool,
  MockPgClient,
  createHttpAdapter,
  HttpReplayAdapter,
  createClockAdapter,
  ClockReplayAdapter,
  createFlagAdapter,
  FlagReplayAdapter,
};
