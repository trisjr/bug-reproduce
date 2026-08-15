'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * ⛔ G2 — TOÀN BỘ DỮ LIỆU DƯỚI ĐÂY LÀ SYNTHETIC, do task này tự sinh.
 *    Không dump, không export, không sao chép từ bất kỳ hệ thống thật nào.
 *    Không chạm internet. Tên/địa chỉ/mã đều mang tiền tố "SYNTHETIC"/"SKU-"/"cust-".
 *
 * Chạy: `node src/spike/app/seed.js`  (env: nhóm SPIKE_PG_* + SPIKE_RUN_ID — CT-4)
 */

const { createPool } = require('./db');
const { failFast, loadSeedConfig } = require('./config');

/** Dữ liệu SYNTHETIC — ID tường minh, KHÔNG dùng serial (để reset là tất định). */
const CUSTOMERS = Object.freeze([
  { id: 'cust-1001', display_name: 'SYNTHETIC Customer 1001', tier: 'gold', country: 'VN' },
  { id: 'cust-1002', display_name: 'SYNTHETIC Customer 1002', tier: 'silver', country: 'VN' },
  { id: 'cust-1003', display_name: 'SYNTHETIC Customer 1003', tier: 'bronze', country: 'SG' },
]);

const PRODUCTS = Object.freeze([
  { sku: 'SKU-BOOK-001', title: 'SYNTHETIC Paperback', unit_price_cents: 12500, stock: 500 },
  { sku: 'SKU-MUG-002', title: 'SYNTHETIC Ceramic Mug', unit_price_cents: 3400, stock: 500 },
  { sku: 'SKU-DESK-003', title: 'SYNTHETIC Standing Desk', unit_price_cents: 189000, stock: 50 },
  // Giá cao để kích nhánh `declined` của stub (> 500000 cents).
  { sku: 'SKU-GPU-004', title: 'SYNTHETIC Workstation GPU', unit_price_cents: 620000, stock: 5 },
]);

const DDL = [
  `CREATE TABLE IF NOT EXISTS spike_customer (
     id            TEXT PRIMARY KEY,
     display_name  TEXT NOT NULL,
     tier          TEXT NOT NULL,
     country       TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS spike_product (
     sku              TEXT PRIMARY KEY,
     title            TEXT NOT NULL,
     unit_price_cents INTEGER NOT NULL,
     stock            INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS spike_order (
     id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
     customer_id    TEXT NOT NULL,
     sku            TEXT NOT NULL,
     quantity       INTEGER NOT NULL,
     total_cents    INTEGER NOT NULL,
     status         TEXT NOT NULL,
     pricing_window TEXT NOT NULL,
     order_date     DATE NOT NULL,
     created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
];

/**
 * @param {import('pg').Pool} pool
 */
async function ensureSchema(pool) {
  for (const statement of DDL) await pool.query(statement);
}

/**
 * Nạp lại dữ liệu tham chiếu SYNTHETIC (idempotent).
 * @param {import('pg').Pool} pool
 */
async function seedReferenceData(pool) {
  for (const customer of CUSTOMERS) {
    await pool.query(
      `INSERT INTO spike_customer (id, display_name, tier, country) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name,
         tier = EXCLUDED.tier, country = EXCLUDED.country`,
      [customer.id, customer.display_name, customer.tier, customer.country],
    );
  }
  for (const product of PRODUCTS) {
    await pool.query(
      `INSERT INTO spike_product (sku, title, unit_price_cents, stock) VALUES ($1, $2, $3, $4)
       ON CONFLICT (sku) DO UPDATE SET title = EXCLUDED.title,
         unit_price_cents = EXCLUDED.unit_price_cents, stock = EXCLUDED.stock`,
      [product.sku, product.title, product.unit_price_cents, product.stock],
    );
  }
}

/**
 * Đưa bảng đơn hàng về trạng thái TẤT ĐỊNH — `RESTART IDENTITY` là thứ khiến hai
 * pha của `test-invariant.js` so được response NGUYÊN VẸN, không cần normalize.
 * @param {import('pg').Pool} pool
 */
async function resetOrders(pool) {
  await pool.query('TRUNCATE TABLE spike_order RESTART IDENTITY');
}

/**
 * @param {import('pg').Pool} pool
 */
async function setupSpikeDatabase(pool) {
  await ensureSchema(pool);
  await seedReferenceData(pool);
  await resetOrders(pool);
}

async function main() {
  const config = loadSeedConfig();
  const pool = createPool(config.pg);
  try {
    await setupSpikeDatabase(pool);
    process.stdout.write(
      `${JSON.stringify({
        log: 'spike-seed',
        event: 'done',
        run_id: config.runId,
        database: config.pg.database,
        customers: CUSTOMERS.length,
        products: PRODUCTS.length,
        data: 'SYNTHETIC (G2)',
      })}\n`,
    );
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => failFast(error, 'seed'));
}

module.exports = { CUSTOMERS, PRODUCTS, ensureSchema, resetOrders, seedReferenceData, setupSpikeDatabase };
