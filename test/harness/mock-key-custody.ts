/**
 * MockKeyCustodyServer — Local HTTP server providing REST Key Custody endpoints.
 * Endpoints: GET/POST/DELETE /api/v1/keys/:key_ref
 * Supports Bearer token auth and audit logging.
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';

export interface AuditEntry {
  timestamp: string;
  method: string;
  path: string;
  keyRef: string;
  status: number;
  token: string | null;
}

export interface StoredKey {
  key_id: string;
  dek_base64: string;
  created_at: string;
  expires_at: string | null;
}

export class MockKeyCustodyServer {
  private server: Server | null = null;
  private port = 0;
  private keys: Map<string, StoredKey> = new Map();
  private auditLog: AuditEntry[] = [];
  private validToken: string;

  constructor(token?: string) {
    this.validToken = token ?? 'test-custody-token-1234';
  }

  public async start(preferredPort = 0): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(preferredPort, '127.0.0.1', () => {
        const addr = this.server!.address();
        if (addr && typeof addr === 'object') {
          this.port = addr.port;
        }
        resolve(this.port);
      });
      this.server.on('error', reject);
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  public getUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  public getToken(): string {
    return this.validToken;
  }

  public getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  public clearAuditLog(): void {
    this.auditLog = [];
  }

  public getStoredKeys(): Map<string, StoredKey> {
    return new Map(this.keys);
  }

  /** Pre-seed a key into the store for testing */
  public seedKey(keyRef: string, dekBase64?: string): StoredKey {
    const stored: StoredKey = {
      key_id: keyRef,
      dek_base64: dekBase64 ?? randomBytes(32).toString('base64'),
      created_at: new Date().toISOString(),
      expires_at: null,
    };
    this.keys.set(keyRef, stored);
    return stored;
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Route: /api/v1/keys/:key_ref
    if (pathParts[0] !== 'api' || pathParts[1] !== 'v1' || pathParts[2] !== 'keys') {
      this.sendJson(res, 404, { error: 'Not Found' });
      return;
    }

    const keyRef = pathParts[3] ?? '';
    const token = this.extractToken(req);

    // Auth check
    if (token !== this.validToken) {
      this.logAudit(req.method ?? 'GET', url.pathname, keyRef, 401, token);
      this.sendJson(res, 401, { error: 'Unauthorized: Invalid Bearer token' });
      return;
    }

    const method = (req.method ?? 'GET').toUpperCase();

    switch (method) {
      case 'GET':
        this.handleGet(keyRef, req, res, url, token);
        break;
      case 'POST':
        this.handlePost(keyRef, req, res, url, token);
        break;
      case 'DELETE':
        this.handleDelete(keyRef, req, res, url, token);
        break;
      default:
        this.logAudit(method, url.pathname, keyRef, 405, token);
        this.sendJson(res, 405, { error: 'Method Not Allowed' });
    }
  }

  private handleGet(keyRef: string, _req: IncomingMessage, res: ServerResponse, url: URL, token: string | null): void {
    if (!keyRef) {
      // List all keys
      const keys = Array.from(this.keys.values());
      this.logAudit('GET', url.pathname, '*', 200, token);
      this.sendJson(res, 200, { keys });
      return;
    }

    const stored = this.keys.get(keyRef);
    if (!stored) {
      this.logAudit('GET', url.pathname, keyRef, 404, token);
      this.sendJson(res, 404, { error: `Key not found: ${keyRef}` });
      return;
    }

    this.logAudit('GET', url.pathname, keyRef, 200, token);
    this.sendJson(res, 200, stored);
  }

  private handlePost(keyRef: string, req: IncomingMessage, res: ServerResponse, url: URL, token: string | null): void {
    if (!keyRef) {
      this.logAudit('POST', url.pathname, '', 400, token);
      this.sendJson(res, 400, { error: 'key_ref is required' });
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8');
      let dekBase64: string;

      try {
        const parsed = JSON.parse(body || '{}');
        dekBase64 = parsed.dek_base64 ?? randomBytes(32).toString('base64');
      } catch {
        dekBase64 = randomBytes(32).toString('base64');
      }

      const stored: StoredKey = {
        key_id: keyRef,
        dek_base64: dekBase64,
        created_at: new Date().toISOString(),
        expires_at: null,
      };
      this.keys.set(keyRef, stored);
      this.logAudit('POST', url.pathname, keyRef, 201, token);
      this.sendJson(res, 201, stored);
    });
  }

  private handleDelete(keyRef: string, _req: IncomingMessage, res: ServerResponse, url: URL, token: string | null): void {
    if (!keyRef) {
      this.logAudit('DELETE', url.pathname, '', 400, token);
      this.sendJson(res, 400, { error: 'key_ref is required' });
      return;
    }

    if (!this.keys.has(keyRef)) {
      this.logAudit('DELETE', url.pathname, keyRef, 404, token);
      this.sendJson(res, 404, { error: `Key not found: ${keyRef}` });
      return;
    }

    this.keys.delete(keyRef);
    this.logAudit('DELETE', url.pathname, keyRef, 200, token);
    this.sendJson(res, 200, { deleted: true, key_id: keyRef });
  }

  private extractToken(req: IncomingMessage): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }

  private logAudit(method: string, path: string, keyRef: string, status: number, token: string | null): void {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      method,
      path,
      keyRef,
      status,
      token,
    });
  }

  private sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  }
}
