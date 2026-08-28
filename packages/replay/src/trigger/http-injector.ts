/**
 * Repro Inbound HTTP Injector (Synthetic U0 Entrypoint Trigger)
 * Specification: Story-09 (FR-027, FR-028, FR-050), ADR-006, SDD-Repro §3.7
 * Zero external dependencies: Uses Node.js built-in APIs (node:net, node:tls, node:buffer)
 */

import { Socket } from 'node:net';
import { connect as connectTls } from 'node:tls';
import { Buffer } from 'node:buffer';
import type { InboundInteraction, InboundRequest } from '@repro/core';

/**
 * Options for configuring synthetic inbound HTTP injection.
 */
export interface InboundInjectorOptions {
  /** Target base URL (e.g. 'http://127.0.0.1:3000' or 'http://localhost:8080') */
  targetUrl?: string;
  /** Target server port (defaults to 3000 if not specified in URL) */
  targetPort?: number;
  /** Target server host (defaults to '127.0.0.1') */
  targetHost?: string;
  /** Request timeout in milliseconds (default 15000ms) */
  timeoutMs?: number;
  /** Additional or override HTTP headers */
  overrideHeaders?: Record<string, string>;
  /** Optional custom execution ID for tracing */
  executionId?: string;
}

/**
 * Result of the synthetic inbound injection.
 */
export interface InboundInjectionResult {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  success: boolean;
  error?: Error;
}

/**
 * InboundHttpInjector dispatches synthetic HTTP requests replicating recorded interaction U0
 * directly into the local target server over loopback network.
 * Implemented using raw Node.js sockets to remain completely isolated and unaffected by
 * mock adapters installed in the process.
 */
export class InboundHttpInjector {
  /**
   * Dispatches the recorded inbound interaction U0 to the local target server.
   */
  public static async inject(
    inbound: InboundInteraction | InboundRequest,
    options: InboundInjectorOptions = {}
  ): Promise<InboundInjectionResult> {
    const injector = new InboundHttpInjector();
    return injector.inject(inbound, options);
  }

  /**
   * Injects the synthetic inbound request.
   */
  public async inject(
    inbound: InboundInteraction | InboundRequest,
    options: InboundInjectorOptions = {}
  ): Promise<InboundInjectionResult> {
    const requestData: InboundRequest =
      'data' in inbound && typeof inbound.data === 'object' && inbound.data !== null
        ? (inbound.data as InboundRequest)
        : (inbound as InboundRequest);

    const startTime = Date.now();
    const timeoutMs = options.timeoutMs ?? 15000;

    // 1. Resolve host, port, protocol, and path
    const { host, port, isHttps, path } = this.resolveTarget(requestData.url, options);

    // 2. Prepare HTTP headers
    const headers = this.prepareHeaders(requestData, host, port, options);

    // 3. Prepare payload body
    const bodyBuffer = requestData.body ? Buffer.from(requestData.body, 'utf8') : Buffer.alloc(0);
    if (bodyBuffer.length > 0 && !headers['content-length']) {
      headers['content-length'] = String(bodyBuffer.length);
    }

    // 4. Construct raw HTTP/1.1 request wire buffer
    const method = (requestData.method || 'GET').toUpperCase();
    let headerLines = `${method} ${path} HTTP/1.1\r\n`;
    for (const [key, value] of Object.entries(headers)) {
      headerLines += `${key}: ${value}\r\n`;
    }
    headerLines += '\r\n';

    const rawRequestBuffer = Buffer.concat([Buffer.from(headerLines, 'utf8'), bodyBuffer]);

    // 5. Send via socket and collect response
    return new Promise<InboundInjectionResult>((resolve) => {
      let socket: Socket;
      let timedOut = false;
      const chunks: Buffer[] = [];

      const timer = setTimeout(() => {
        timedOut = true;
        socket.destroy();
        resolve({
          statusCode: 504,
          statusMessage: 'Gateway Timeout',
          headers: {},
          body: '',
          durationMs: Date.now() - startTime,
          success: false,
          error: new Error(`Inbound HTTP injection timed out after ${timeoutMs}ms`),
        });
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
      };

      const onConnect = () => {
        socket.write(rawRequestBuffer);
      };

      const onData = (chunk: Buffer) => {
        chunks.push(chunk);
      };

      const onError = (err: Error) => {
        cleanup();
        if (timedOut) return;
        resolve({
          statusCode: 502,
          statusMessage: 'Bad Gateway',
          headers: {},
          body: '',
          durationMs: Date.now() - startTime,
          success: false,
          error: new Error(`Failed to connect to local target server at ${host}:${port}: ${err.message}`),
        });
      };

      const onClose = () => {
        cleanup();
        if (timedOut) return;

        const totalBuffer = Buffer.concat(chunks);
        const durationMs = Date.now() - startTime;

        try {
          const parsed = this.parseRawHttpResponse(totalBuffer);
          resolve({
            statusCode: parsed.statusCode,
            statusMessage: parsed.statusMessage,
            headers: parsed.headers,
            body: parsed.body,
            durationMs,
            success: parsed.statusCode >= 200 && parsed.statusCode < 400,
          });
        } catch (parseErr) {
          resolve({
            statusCode: 500,
            statusMessage: 'Internal Response Parse Error',
            headers: {},
            body: totalBuffer.toString('utf8'),
            durationMs,
            success: false,
            error: parseErr instanceof Error ? parseErr : new Error(String(parseErr)),
          });
        }
      };

      if (isHttps) {
        socket = connectTls(
          {
            host,
            port,
            rejectUnauthorized: false,
          },
          onConnect
        );
      } else {
        socket = new Socket();
        socket.connect(port, host, onConnect);
      }

      socket.on('data', onData);
      socket.on('error', onError);
      socket.on('close', onClose);
      socket.on('end', () => {
        socket.end();
      });
    });
  }

  /**
   * Resolves target connection parameters.
   */
  private resolveTarget(
    requestUrl: string,
    options: InboundInjectorOptions
  ): { host: string; port: number; isHttps: boolean; path: string } {
    let host = options.targetHost || '127.0.0.1';
    let port = options.targetPort || 3000;
    let isHttps = false;
    let path = '/';

    if (options.targetUrl) {
      try {
        const parsed = new URL(options.targetUrl);
        host = parsed.hostname || host;
        isHttps = parsed.protocol === 'https:';
        if (parsed.port) {
          port = Number.parseInt(parsed.port, 10);
        } else {
          port = isHttps ? 443 : 80;
        }
      } catch {
        // Keep defaults
      }
    }

    if (requestUrl) {
      if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
        try {
          const parsedReq = new URL(requestUrl);
          path = parsedReq.pathname + parsedReq.search;
          if (!options.targetUrl && !options.targetHost && !options.targetPort) {
            host = parsedReq.hostname;
            isHttps = parsedReq.protocol === 'https:';
            port = parsedReq.port ? Number.parseInt(parsedReq.port, 10) : isHttps ? 443 : 80;
          }
        } catch {
          path = requestUrl;
        }
      } else {
        path = requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`;
      }
    }

    return { host, port, isHttps, path };
  }

  /**
   * Prepares and normalizes outgoing HTTP headers for synthetic request.
   */
  private prepareHeaders(
    requestData: InboundRequest,
    host: string,
    port: number,
    options: InboundInjectorOptions
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    // 1. Copy recorded headers (excluding hop-by-hop and old host)
    if (requestData.headers) {
      for (const [k, v] of Object.entries(requestData.headers)) {
        if (v === undefined) continue;
        const lk = k.toLowerCase();
        if (lk === 'host' || lk === 'connection' || lk === 'content-length') continue;
        headers[lk] = Array.isArray(v) ? v.join(', ') : String(v);
      }
    }

    // 2. Set Host header
    headers.host = `${host}:${port}`;
    headers.connection = 'close';

    // 3. Repro synthetic tracing headers
    headers['x-repro-replay-trigger'] = 'u0-injection';
    if (options.executionId) {
      headers['x-repro-execution-id'] = options.executionId;
    }

    // 4. Override headers
    if (options.overrideHeaders) {
      for (const [k, v] of Object.entries(options.overrideHeaders)) {
        headers[k.toLowerCase()] = v;
      }
    }

    return headers;
  }

  /**
   * Parses raw HTTP/1.1 response wire buffer into status, headers, and body.
   */
  private parseRawHttpResponse(buffer: Buffer): {
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    body: string;
  } {
    const text = buffer.toString('utf8');
    const headerEndIndex = text.indexOf('\r\n\r\n');

    if (headerEndIndex === -1) {
      // If no valid HTTP header delimiter found, return whole text as body
      return {
        statusCode: 200,
        statusMessage: 'OK',
        headers: {},
        body: text,
      };
    }

    const headerSection = text.slice(0, headerEndIndex);
    const bodySection = text.slice(headerEndIndex + 4);

    const lines = headerSection.split('\r\n');
    const statusLine = lines[0] || 'HTTP/1.1 200 OK';
    const statusParts = statusLine.split(' ');

    const statusCode = Number.parseInt(statusParts[1] || '200', 10);
    const statusMessage = statusParts.slice(2).join(' ') || 'OK';

    const headers: Record<string, string> = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const value = line.slice(colonIndex + 1).trim();
        headers[key] = value;
      }
    }

    // Handle chunked transfer-encoding if necessary
    let finalBody = bodySection;
    if (headers['transfer-encoding']?.toLowerCase() === 'chunked') {
      finalBody = this.decodeChunkedBody(bodySection);
    }

    return {
      statusCode,
      statusMessage,
      headers,
      body: finalBody,
    };
  }

  /**
   * Decodes a chunked HTTP body.
   */
  private decodeChunkedBody(rawChunked: string): string {
    let cursor = 0;
    let decoded = '';

    while (cursor < rawChunked.length) {
      const lineEnd = rawChunked.indexOf('\r\n', cursor);
      if (lineEnd === -1) break;

      const sizeHex = rawChunked.slice(cursor, lineEnd).trim().split(';')[0];
      const chunkSize = Number.parseInt(sizeHex, 16);

      if (Number.isNaN(chunkSize) || chunkSize === 0) {
        break;
      }

      const chunkStart = lineEnd + 2;
      const chunkEnd = chunkStart + chunkSize;
      decoded += rawChunked.slice(chunkStart, chunkEnd);

      cursor = chunkEnd + 2; // skip trailing \r\n
    }

    return decoded;
  }
}
