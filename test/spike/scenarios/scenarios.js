'use strict';

/**
 * ============================================================================
 *  B8 · test/spike/scenarios/scenarios.js
 *  10 SCENARIO FIXTURE DEFINITIONS & RUNNERS (P0-B / Wave 2.2)
 * ============================================================================
 *
 *  ⚠️  THROWAWAY (Spec-Spike-Protocol §0.3).
 *
 *  Tuân thủ:
 *    - M-5: Chữ ký lỗi và verdict kỳ vọng khớp 100% với m5-signatures.json.
 *    - G2: Dữ liệu synthetic 100%, không production data.
 *    - K=3: Mọi scenario tái tạo K/K = 3/3 lần.
 */

const signatures = require('./m5-signatures.json');

const SCENARIOS = Object.freeze([
  {
    id: 'SC-1',
    name: 'Database state',
    request: { customer_id: 'CUST-002', sku: 'SKU-LAPTOP-001', quantity: 1 },
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: true,
  },
  {
    id: 'SC-2',
    name: 'External API response',
    request: { customer_id: 'CUST-001', sku: 'SKU-GPU-004', quantity: 1 }, // triggers decline > 500k cents
    expectedStatus: 402,
    expectedOutcomeStatus: 'declined',
    inClass: true,
  },
  {
    id: 'SC-3',
    name: 'Feature flag',
    request: { customer_id: 'CUST-001', sku: 'SKU-PHONE-002', quantity: 1 },
    flags: { checkout_discount_v2: true, night_surcharge: true },
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: true,
  },
  {
    id: 'SC-4',
    name: 'Time-dependent',
    request: { customer_id: 'CUST-001', sku: 'SKU-LAPTOP-001', quantity: 1 },
    clockDate: '2026-08-16T23:30:00.000Z', // Night window (22:00-06:00 UTC)
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: true,
  },
  {
    id: 'SC-5',
    name: 'Missing data',
    request: { customer_id: 'CUST-NONEXISTENT', sku: 'SKU-NONE', quantity: 1 },
    expectedStatus: 404,
    expectedOutcomeStatus: 'not-found',
    inClass: true,
  },
  {
    id: 'SC-6',
    name: 'Dependency/version difference',
    request: { customer_id: 'CUST-001', sku: 'SKU-MONITOR-003', quantity: 1 },
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: true,
  },
  {
    id: 'SC-7',
    name: 'Randomness',
    request: { customer_id: 'CUST-001', sku: 'SKU-LAPTOP-001', quantity: 1 },
    omitRequestId: true, // triggers randomUUID
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: false,
  },
  {
    id: 'SC-8',
    name: 'Side effect',
    request: { customer_id: 'CUST-002', sku: 'SKU-GPU-004', quantity: 1 },
    expectedStatus: 402,
    expectedOutcomeStatus: 'declined',
    inClass: true,
  },
  {
    id: 'SC-9',
    name: 'Async behavior',
    request: { customer_id: 'CUST-001', sku: 'SKU-LAPTOP-001', quantity: 1, async_tail: true },
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: false,
  },
  {
    id: 'SC-10',
    name: 'Race condition',
    request: { customer_id: 'CUST-003', sku: 'SKU-LAPTOP-001', quantity: 1 },
    concurrency: 2,
    expectedStatus: 201,
    expectedOutcomeStatus: 'approved',
    inClass: false,
  },
]);

function getScenario(id) {
  const sc = SCENARIOS.find((s) => s.id === id);
  if (!sc) throw new Error(`Unknown scenario: ${id}`);
  const sig = signatures.scenarios.find((s) => s.id === id);
  return Object.assign({}, sc, { signature: sig });
}

module.exports = {
  SCENARIOS,
  signatures,
  getScenario,
};
