'use strict';

/**
 * THROWAWAY — Repro Spike Phase 0 / P0-B (Spec-Spike-Protocol §0.3).
 *
 * `POST /checkout` — chạm CẢ 5 dependency trong MỘT request:
 *   1. PostgreSQL   (db.js)        — nguồn sự thật DUY NHẤT của response
 *   2. Redis        (cache.js)     — side channel, KHÔNG ảnh hưởng kết cục (G1)
 *   3. HTTP stub    (external.js)  — stub tự chạy, SYNTHETIC (G2)
 *   4. Feature flag (flags.js)     — file JSON qua SPIKE_FLAG_FILE
 *   5. Clock        (clock.js)     — nhánh "night window" đổi giá VÀ đổi tham số
 *                                    của lời gọi HTTP ⇒ quan sát được
 *
 * ⛔ THỨ TỰ LÀ MỘT PHẦN CỦA HỢP ĐỒNG:
 *    clock → flags → db×2 → outbound-http → db×2 → [OUTCOME FROZEN] → redis×3.
 *    Redis chỉ xuất hiện SAU mốc `outcome-computed`, và `test-invariant.js` kiểm
 *    chứng điều đó bằng máy.
 */

const { KIND } = require('./interaction-log');
const { authorizePayment } = require('./external');
const { evaluateFlags } = require('./flags');
const { orderDate, pricingWindow, readClock } = require('./clock');
const { runQuery } = require('./db');

const CURRENCY = 'USD';
const DISCOUNT_RATE = 0.1;
const NIGHT_SURCHARGE_RATE = 0.05;
const DISCOUNT_TIER = 'gold';
const MAX_QUANTITY = 100;

const SQL = Object.freeze({
  SELECT_PRODUCT: 'SELECT sku, title, unit_price_cents, stock FROM spike_product WHERE sku = $1',
  SELECT_CUSTOMER: 'SELECT id, display_name, tier, country FROM spike_customer WHERE id = $1',
  INSERT_ORDER:
    'INSERT INTO spike_order (customer_id, sku, quantity, total_cents, status, pricing_window, order_date) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
  COUNT_ORDERS: 'SELECT COUNT(*)::int AS order_count FROM spike_order WHERE customer_id = $1',
});

class CheckoutInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CheckoutInputError';
  }
}

/**
 * Validation đầu vào — không tin bất cứ thứ gì đến từ client.
 * @param {unknown} body
 * @returns {{customer_id: string, sku: string, quantity: number}}
 */
function parseCheckoutRequest(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new CheckoutInputError('Body phải là một JSON object');
  }
  const { customer_id: customerId, sku, quantity } = body;

  if (typeof customerId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/u.test(customerId)) {
    throw new CheckoutInputError('`customer_id` phải là chuỗi [A-Za-z0-9_-]{1,64}');
  }
  if (typeof sku !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/u.test(sku)) {
    throw new CheckoutInputError('`sku` phải là chuỗi [A-Za-z0-9_-]{1,64}');
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new CheckoutInputError(`\`quantity\` phải là số nguyên 1..${MAX_QUANTITY}`);
  }

  return { customer_id: customerId, sku, quantity };
}

/**
 * HÀM THUẦN — không nhận cache, không đọc I/O.
 * @param {{unitPriceCents: number, quantity: number, tier: string,
 *          flags: Record<string, boolean>, window: 'night'|'day'}} input
 */
function computePricing({ unitPriceCents, quantity, tier, flags, window }) {
  const subtotalCents = unitPriceCents * quantity;
  const discountCents =
    flags.checkout_discount_v2 && tier === DISCOUNT_TIER ? Math.round(subtotalCents * DISCOUNT_RATE) : 0;
  const surchargeCents =
    flags.night_surcharge && window === 'night'
      ? Math.round((subtotalCents - discountCents) * NIGHT_SURCHARGE_RATE)
      : 0;

  return Object.freeze({
    currency: CURRENCY,
    unit_price_cents: unitPriceCents,
    subtotal_cents: subtotalCents,
    discount_cents: discountCents,
    surcharge_cents: surchargeCents,
    total_cents: subtotalCents - discountCents + surchargeCents,
    window,
  });
}

/**
 * HÀM THUẦN — chữ ký KHÔNG CÓ tham số cache. Đây là bằng chứng cấu trúc cho G1:
 * kết cục không thể phụ thuộc Redis vì Redis không đi vào được hàm này.
 */
function buildOutcome({ runId, requestId, request, customer, pricing, authorization, orderId, orderCount, date, finalizedAt }) {
  return Object.freeze({
    run_id: runId,
    request_id: requestId || null,
    status: authorization.decision,
    order_id: orderId,
    customer_id: customer.id,
    customer_tier: customer.tier,
    sku: request.sku,
    quantity: request.quantity,
    pricing,
    order_date: date,
    finalized_at: finalizedAt ? finalizedAt.toISOString() : undefined,
    orders_for_customer: orderCount,
    authorization: Object.freeze({
      decision: authorization.decision,
      code: authorization.authorization_code,
      reason: authorization.reason,
    }),
    source_of_truth: 'postgresql',
  });
}

/**
 * @param {{config: object, pool: import('pg').Pool, cache: import('./cache').CacheSideChannel,
 *          log: import('./interaction-log').InteractionLog, requestId: string}} ctx
 * @param {unknown} rawBody
 * @returns {Promise<{statusCode: number, body: object}>}
 */
async function handleCheckout(ctx, rawBody) {
  const { config, pool, cache, log, requestId } = ctx;
  const request = parseCheckoutRequest(rawBody);

  // --- 5. CLOCK -------------------------------------------------------------
  const now = readClock(log, 'checkout.pricing-window');
  const window = pricingWindow(now);
  const date = orderDate(now);

  // --- 4. FEATURE FLAG ------------------------------------------------------
  const flags = evaluateFlags(log, config.flagFile);

  // --- 1. POSTGRESQL (luôn chạy, không nhánh nào bỏ qua) --------------------
  const productResult = await runQuery(pool, log, { sql: SQL.SELECT_PRODUCT, values: [request.sku] });
  const customerResult = await runQuery(pool, log, { sql: SQL.SELECT_CUSTOMER, values: [request.customer_id] });

  const product = productResult.rows[0];
  const customer = customerResult.rows[0];
  if (!product || !customer) {
    // Δ6: nhánh 404 phát mốc kết cục + response-sent để neo U∞ tồn tại
    log.markOutcomeComputed();
    log.record({
      kind: KIND.MARKER,
      target: 'response-sent',
      result: { status_code: 404, outcome_status: 'not-found' },
    });
    return {
      statusCode: 404,
      body: { error: 'not-found', detail: 'sku hoặc customer_id không tồn tại trong dữ liệu synthetic' },
    };
  }

  const pricing = computePricing({
    unitPriceCents: product.unit_price_cents,
    quantity: request.quantity,
    tier: customer.tier,
    flags,
    window,
  });

  // --- 3. EXTERNAL HTTP (stub tự chạy, SYNTHETIC) ---------------------------
  const authorization = await authorizePayment(config, log, {
    requestId,
    payload: {
      customer_id: customer.id,
      sku: product.sku,
      quantity: request.quantity,
      amount_cents: pricing.total_cents,
      currency: pricing.currency,
      // clock đi thẳng vào tham số của lời gọi ngoài ⇒ B3 có bằng chứng
      pricing_window: pricing.window,
    },
  });

  const insertResult = await runQuery(pool, log, {
    sql: SQL.INSERT_ORDER,
    values: [
      customer.id,
      product.sku,
      request.quantity,
      pricing.total_cents,
      authorization.decision,
      pricing.window,
      date,
    ],
  });
  const countResult = await runQuery(pool, log, { sql: SQL.COUNT_ORDERS, values: [customer.id] });

  // Δ2: đọc clock lần 2 để kiểm chứng hệ quả t2 - t1
  const finalizedAt = readClock(log, 'checkout.order-finalized');
  const orderId = Number(insertResult.rows[0].id);
  const orderCount = countResult.rows[0].order_count;

  const outcome = buildOutcome({
    runId: config.runId,
    requestId,
    request,
    customer,
    pricing,
    authorization,
    orderId,
    orderCount,
    date,
    finalizedAt,
  });
  // ==========================================================================
  // KẾT CỤC ĐÃ ĐÓNG BĂNG. Mọi thứ dưới đây KHÔNG ĐƯỢC đổi `outcome`.
  // ==========================================================================
  log.markOutcomeComputed();

  // --- 2. REDIS (side channel, sau khi kết cục đã tính xong) ----------------
  // Không hàm nào dưới đây trả về giá trị; app vẫn đúng khi Redis chết (R2).
  await cache.shadowCompare(log, {
    key: `spike:${config.runId}:checkout-count:${customer.id}`,
    dbValue: orderCount,
  });
  await cache.recordCheckoutTelemetry(log, {
    counterKey: `spike:${config.runId}:checkout-count:${customer.id}`,
    lastOrderKey: `spike:${config.runId}:last-order:${customer.id}`,
    lastOrderValue: String(orderId),
  });


  // Δ5: đuôi async không đóng trong cửa sổ request (cho SC-9)
  if (ctx.asyncTail === true || (rawBody && typeof rawBody === 'object' && rawBody.async_tail === true)) {
    setImmediate(async () => {
      try {
        log.record({
          kind: KIND.MARKER,
          target: 'async-tail-dispatched',
          result: { status: 'running-after-response', order_id: orderId },
        });
        await new Promise((r) => setTimeout(r, 50));
        log.record({
          kind: KIND.MARKER,
          target: 'async-tail-completed',
          result: { status: 'completed-after-response', order_id: orderId },
        });
      } catch (_) {}
    });
  }
  const statusCode = outcome.status === 'approved' ? 201 : 402;
  log.record({
    kind: KIND.MARKER,
    target: 'response-sent',
    result: { status_code: statusCode, outcome_status: outcome.status },
  });

  return { statusCode, body: outcome };
}

module.exports = { CheckoutInputError, SQL, buildOutcome, computePricing, handleCheckout, parseCheckoutRequest };
