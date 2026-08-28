/**
 * MockHttpServer — Local HTTP server simulating external third-party APIs.
 * Supports configurable routes, response delays, and request logging.
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';

export interface MockRoute {
  method: string;
  path: string;
  status: number;
  body: unknown;
  delayMs?: number;
  headers?: Record<string, string>;
}

export interface RecordedRequest {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

export class MockHttpServer {
  private server: Server | null = null;
  private port = 0;
  private routes: MockRoute[] = [];
  private requests: RecordedRequest[] = [];
  private defaultStatus = 200;
  private defaultBody: unknown = { ok: true };

  public addRoute(route: MockRoute): void {
    this.routes.push(route);
  }

  public setDefault(status: number, body: unknown): void {
    this.defaultStatus = status;
    this.defaultBody = body;
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

  public getRequests(): RecordedRequest[] {
    return [...this.requests];
  }

  public clearRequests(): void {
    this.requests = [];
  }

  public clearRoutes(): void {
    this.routes = [];
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      const method = (req.method ?? 'GET').toUpperCase();
      const url = req.url ?? '/';

      this.requests.push({
        timestamp: new Date().toISOString(),
        method,
        url,
        headers: req.headers as Record<string, string | string[] | undefined>,
        body,
      });

      const matchedRoute = this.routes.find(
        (r) => r.method.toUpperCase() === method && r.path === url,
      );

      const status = matchedRoute?.status ?? this.defaultStatus;
      const responseBody = matchedRoute?.body ?? this.defaultBody;
      const delayMs = matchedRoute?.delayMs ?? 0;
      const extraHeaders = matchedRoute?.headers ?? {};

      const send = () => {
        res.writeHead(status, { 'Content-Type': 'application/json', ...extraHeaders });
        res.end(JSON.stringify(responseBody));
      };

      if (delayMs > 0) {
        setTimeout(send, delayMs);
      } else {
        send();
      }
    });
  }
}
