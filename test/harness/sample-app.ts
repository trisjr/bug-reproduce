/**
 * SampleCheckoutApp — Sample application simulating a checkout handler
 * using @repro/node patterns: PostgreSQL queries + external HTTP requests.
 * Two modes: buggy (throws 500) and fixed (returns 200 OK).
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';

export interface CheckoutDeps {
  /** Simulated PG query function */
  pgQuery: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  /** External payment API base URL */
  paymentApiUrl: string;
}

export interface CheckoutResult {
  status: number;
  body: unknown;
}

/**
 * Simulates a checkout handler that:
 * 1. Queries the DB for order info
 * 2. Calls external payment API
 * 3. In 'buggy' mode: throws on payment failure (HTTP 500)
 * 4. In 'fixed' mode: gracefully handles payment failure (HTTP 200)
 */
export async function handleCheckout(
  orderId: string,
  deps: CheckoutDeps,
  mode: 'buggy' | 'fixed' = 'buggy',
): Promise<CheckoutResult> {
  // Step 1: DB lookup
  const dbResult = await deps.pgQuery(
    'SELECT id, amount, currency FROM orders WHERE id = $1',
    [orderId],
  );

  if (dbResult.rows.length === 0) {
    return { status: 404, body: { error: 'Order not found' } };
  }

  const order = dbResult.rows[0] as Record<string, unknown>;

  // Step 2: Call external payment API
  let paymentResponse: Response;
  try {
    paymentResponse = await fetch(`${deps.paymentApiUrl}/api/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        amount: order['amount'],
        currency: order['currency'],
      }),
    });
  } catch (err) {
    if (mode === 'buggy') {
      throw new Error(`Payment API unreachable: ${(err as Error).message}`);
    }
    return {
      status: 200,
      body: { order_id: orderId, status: 'pending', reason: 'payment_api_unavailable' },
    };
  }

  // Step 3: Process payment result
  if (!paymentResponse.ok) {
    if (mode === 'buggy') {
      throw new Error(`Payment failed with status ${paymentResponse.status}`);
    }
    return {
      status: 200,
      body: { order_id: orderId, status: 'payment_failed', http_status: paymentResponse.status },
    };
  }

  const paymentData = await paymentResponse.json() as Record<string, unknown>;

  // Step 4: Update order status in DB
  await deps.pgQuery(
    'UPDATE orders SET status = $1, payment_ref = $2 WHERE id = $3',
    ['paid', paymentData['charge_id'], orderId],
  );

  return {
    status: 200,
    body: { order_id: orderId, status: 'completed', charge_id: paymentData['charge_id'] },
  };
}

/**
 * SampleCheckoutApp wraps the checkout logic into a local HTTP server
 * for integration testing scenarios.
 */
export class SampleCheckoutApp {
  private server: Server | null = null;
  private port = 0;
  private mode: 'buggy' | 'fixed';
  private deps: CheckoutDeps;

  constructor(deps: CheckoutDeps, mode: 'buggy' | 'fixed' = 'buggy') {
    this.deps = deps;
    this.mode = mode;
  }

  public setMode(mode: 'buggy' | 'fixed'): void {
    this.mode = mode;
  }

  public async start(preferredPort = 0): Promise<number> {
    const { promise, resolve, reject } = Promise.withResolvers<number>();
    this.server = createServer((req, res) => this.handleRequest(req, res));
    this.server.listen(preferredPort, '127.0.0.1', () => {
      const addr = this.server!.address();
      if (addr && typeof addr === 'object') {
        this.port = addr.port;
      }
      resolve(this.port);
    });
    this.server.on('error', reject);
    return promise;
  }

  public async stop(): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    if (this.server) {
      this.server.close(() => resolve());
    } else {
      resolve();
    }
    return promise;
  }

  public getUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);

    if (url.pathname !== '/checkout' || req.method !== 'POST') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      let orderId = 'unknown';
      try {
        const parsed = JSON.parse(body);
        orderId = parsed.order_id ?? 'unknown';
      } catch {
        // use default
      }

      handleCheckout(orderId, this.deps, this.mode)
        .then((result) => {
          res.writeHead(result.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result.body));
        })
        .catch((err: Error) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
    });
  }
}
