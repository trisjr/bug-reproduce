/**
 * @repro/node (SDK) Unit Tests
 * AsyncLocalStorage tracking, PG interception, HTTP interception,
 * redaction (PAN Luhn, NEVER-STORE headers), ring buffer 100 rows / 64 KB (SEC-008).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

import {
  ReproSDK,
  executionContextManager,
  ExecutionContextManager,
  generateExecutionId,
  installInterceptors,
  uninstallInterceptors,
  areInterceptorsInstalled,
  FormatPreservingMasker,
  NEVER_STORE_HEADERS,
  NEVER_STORE_FIELDS,
  REDACTION_PATTERNS,
  isValidLuhn,
  BoundedRingBuffer,
  estimateInteractionSize,
  MAX_DATABASE_ROWS,
  MAX_DATABASE_BYTES,
} from '@repro/node';

import type { InteractionUnit } from '@repro/core';

// ─── AsyncLocalStorage Tracking ────────────────────────────────────────────

describe('@repro/node — AsyncLocalStorage Context Tracking', () => {
  it('executionContextManager is an ExecutionContextManager instance', () => {
    assert.ok(executionContextManager instanceof ExecutionContextManager);
  });

  it('createContext returns isolated execution context', () => {
    const ctx = executionContextManager.createContext({
      executionId: 'exec-001',
      traceId: 'trace-001',
      serviceName: 'test-svc',
    });
    assert.equal(ctx.executionId, 'exec-001');
    assert.equal(ctx.traceId, 'trace-001');
    assert.equal(ctx.serviceName, 'test-svc');
    assert.ok(Array.isArray(ctx.interactions));
    assert.equal(ctx.hasError, false);
  });

  it('run() provides context within async scope', () => {
    const ctx = executionContextManager.createContext({
      executionId: 'exec-002',
    });
    executionContextManager.run(ctx, () => {
      const retrieved = executionContextManager.getContext();
      assert.ok(retrieved);
      assert.equal(retrieved!.executionId, 'exec-002');
    });
  });

  it('getContext() returns undefined outside run scope', () => {
    const outside = executionContextManager.getContext();
    assert.equal(outside, undefined);
  });

  it('generateExecutionId returns unique strings', () => {
    const id1 = generateExecutionId();
    const id2 = generateExecutionId();
    assert.equal(typeof id1, 'string');
    assert.ok(id1.length > 0);
    assert.notEqual(id1, id2);
  });
});

// ─── Interceptors Module ───────────────────────────────────────────────────

describe('@repro/node — Interceptors Lifecycle', () => {
  afterEach(() => {
    if (areInterceptorsInstalled()) {
      uninstallInterceptors();
    }
  });

  it('installInterceptors/uninstallInterceptors toggles state', () => {
    assert.equal(areInterceptorsInstalled(), false);
    installInterceptors();
    assert.equal(areInterceptorsInstalled(), true);
    uninstallInterceptors();
    assert.equal(areInterceptorsInstalled(), false);
  });
});

// ─── Redaction: NEVER_STORE Headers & Fields ───────────────────────────────

describe('@repro/node — Redaction: NEVER-STORE Headers', () => {
  it('NEVER_STORE_HEADERS includes critical auth headers', () => {
    assert.equal(NEVER_STORE_HEADERS['authorization'], true);
    assert.equal(NEVER_STORE_HEADERS['cookie'], true);
    assert.equal(NEVER_STORE_HEADERS['set-cookie'], true);
    assert.equal(NEVER_STORE_HEADERS['x-api-key'], true);
    assert.equal(NEVER_STORE_HEADERS['x-csrf-token'], true);
  });

  it('NEVER_STORE_FIELDS includes password and secret fields', () => {
    assert.equal(NEVER_STORE_FIELDS['password'], true);
    assert.equal(NEVER_STORE_FIELDS['secret'], true);
    assert.equal(NEVER_STORE_FIELDS['access_token'], true);
  });

  it('REDACTION_PATTERNS exposes PAN pattern', () => {
    assert.ok(REDACTION_PATTERNS.PAN_CANDIDATE instanceof RegExp);
    assert.ok(REDACTION_PATTERNS.CREDIT_CARD_FORMATTED instanceof RegExp);
  });
});

// ─── Redaction: PAN Luhn Validator ─────────────────────────────────────────

describe('@repro/node — Redaction: PAN Luhn Algorithm', () => {
  it('validates a known valid Luhn number (Visa test card)', () => {
    assert.equal(isValidLuhn('4111111111111111'), true);
  });

  it('validates another known valid card (Mastercard test)', () => {
    assert.equal(isValidLuhn('5500000000000004'), true);
  });

  it('rejects invalid Luhn number', () => {
    assert.equal(isValidLuhn('1234567890123456'), false);
  });

  it('rejects non-numeric string', () => {
    assert.equal(isValidLuhn('abcd-efgh-ijkl-mnop'), false);
  });

  it('rejects empty string', () => {
    assert.equal(isValidLuhn(''), false);
  });
});

// ─── Ring Buffer — SEC-008 Bounded ─────────────────────────────────────────

describe('@repro/node — BoundedRingBuffer (SEC-008)', () => {
  /** Creates a minimal interaction unit for testing */
  function makeInteraction(id: number): InteractionUnit {
    return {
      category: 'POSTGRES_QUERY',
      sequence_idx: id,
      timestamp_ms: Date.now(),
      duration_ms: 1,
      redacted: false,
      truncated: false,
      data: { query: `SELECT ${id}`, params: [], result: { rows: [] } },
    } as unknown as InteractionUnit;
  }

  it('pushes and drains interactions', () => {
    const buf = new BoundedRingBuffer({ maxInteractions: 10 });
    buf.push(makeInteraction(1));
    buf.push(makeInteraction(2));
    const drained = buf.drain();
    assert.equal(drained.length, 2);
    assert.equal(buf.length, 0);
  });

  it('enforces maxInteractions limit (FIFO eviction)', () => {
    const maxItems = 100;
    const buf = new BoundedRingBuffer({ maxInteractions: maxItems, maxBytes: 10 * 1024 * 1024 });

    // Push 120 items into a buffer of 100
    for (let i = 0; i < 120; i++) {
      buf.push(makeInteraction(i));
    }

    assert.equal(buf.length, maxItems);
    const stats = buf.getStats();
    assert.equal(stats.droppedCount, 20);
    assert.equal(stats.hasOverflow, true);

    const drained = buf.drain();
    assert.equal(drained.length, maxItems);
    // Oldest items (0..19) were evicted; first remaining should be 20
    const firstSeqIdx = (drained[0] as unknown as Record<string, unknown>).sequence_idx;
    assert.equal(firstSeqIdx, 20);
  });

  it('enforces maxBytes limit (64 KB)', () => {
    const maxBytes = 64 * 1024; // 64 KB
    const buf = new BoundedRingBuffer({ maxInteractions: 10000, maxBytes });

    let pushed = 0;
    while (pushed < 500) {
      buf.push(makeInteraction(pushed));
      pushed++;
    }

    const stats = buf.getStats();
    assert.ok(stats.currentBytes <= maxBytes, `currentBytes ${stats.currentBytes} exceeds maxBytes ${maxBytes}`);
  });

  it('clear() resets count and bytes', () => {
    const buf = new BoundedRingBuffer();
    buf.push(makeInteraction(1));
    buf.push(makeInteraction(2));
    assert.ok(buf.length > 0);
    buf.clear();
    assert.equal(buf.length, 0);
    assert.equal(buf.getStats().currentBytes, 0);
  });

  it('peek() returns copy without clearing', () => {
    const buf = new BoundedRingBuffer();
    buf.push(makeInteraction(1));
    const peeked = buf.peek();
    assert.equal(peeked.length, 1);
    assert.equal(buf.length, 1); // still in buffer
  });

  it('estimateInteractionSize returns positive number', () => {
    const size = estimateInteractionSize(makeInteraction(1));
    assert.ok(size > 0);
    assert.equal(typeof size, 'number');
  });

  it('drops single oversized interaction', () => {
    const buf = new BoundedRingBuffer({ maxInteractions: 100, maxBytes: 50 });
    // This interaction serializes to more than 50 bytes
    const bigInteraction = makeInteraction(999);
    const result = buf.push(bigInteraction);
    assert.equal(result, false);
    assert.equal(buf.length, 0);
    assert.equal(buf.getStats().droppedCount, 1);
  });
});

// ─── ReproSDK Lifecycle ────────────────────────────────────────────────────

describe('@repro/node — ReproSDK Lifecycle', () => {
  let sdk: ReproSDK;

  beforeEach(() => {
    sdk = new ReproSDK();
  });

  afterEach(() => {
    sdk.shutdown();
  });

  it('init() sets initialized state', () => {
    assert.equal(sdk.isInitialized(), false);
    sdk.init({ serviceName: 'test-svc', environment: 'test' });
    assert.equal(sdk.isInitialized(), true);
  });

  it('shutdown() clears initialized state', () => {
    sdk.init({ serviceName: 'test-svc', environment: 'test' });
    sdk.shutdown();
    assert.equal(sdk.isInitialized(), false);
  });

  it('init() with invalid config does not crash (fail-safe)', () => {
    assert.doesNotThrow(() => {
      sdk.init({
        sampleRate: -1,
        environment: 'test',
      });
    });
  });
});
