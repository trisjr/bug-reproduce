/**
 * Repro Inbound HTTP Interceptor (U0 Anchor)
 * Specification: ADR-007 (U-03), ADR-008, Story-01, Story-02 (Scenario 1)
 * Zero external dependencies: Uses node:http, node:https, node:url
 */

import http from 'node:http';
import https from 'node:https';
import type { InboundInteraction, InboundRequest } from '@repro/core';
import { executionContextManager } from '../../context/async-storage.ts';
import { generateExecutionId, generateInteractionId } from '../../context/execution-id.ts';

let isInboundPatched = false;
let originalHttpCreateServer: typeof http.createServer | null = null;
let originalHttpsCreateServer: typeof https.createServer | null = null;

/**
 * Normalizes HTTP headers from IncomingHttpHeaders to Record<string, string | string[] | undefined>.
 */
export function normalizeIncomingHeaders(
  rawHeaders: http.IncomingHttpHeaders
): Record<string, string | string[] | undefined> {
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    headers[key.toLowerCase()] = value;
  }
  return headers;
}

/**
 * Parses query parameters from URL string safely.
 */
export function parseQueryParams(urlStr: string): Record<string, string | string[]> | undefined {
  try {
    const parsed = new URL(urlStr, 'http://localhost');
    if (!parsed.search) return undefined;

    const result: Record<string, string | string[]> = {};
    for (const [key, val] of parsed.searchParams.entries()) {
      if (result[key] === undefined) {
        result[key] = val;
      } else if (Array.isArray(result[key])) {
        (result[key] as string[]).push(val);
      } else {
        result[key] = [result[key] as string, val];
      }
    }
    return result;
  } catch {
    return undefined;
  }
}

/**
 * Wraps a standard HTTP request listener with Repro ExecutionContext and U0 capture.
 */
export function wrapInboundRequestListener<
  Req extends http.IncomingMessage = http.IncomingMessage,
  Res extends http.ServerResponse = http.ServerResponse
>(listener: (req: Req, res: Res) => void): (req: Req, res: Res) => void {
  return function interceptedRequestListener(req: Req, res: Res) {
    const rawUrl = req.url || '/';
    const method = req.method || 'GET';
    const headers = normalizeIncomingHeaders(req.headers);
    const clientIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const queryParams = parseQueryParams(rawUrl);

    // Create execution context
    const executionId = generateExecutionId();
    const traceId = (req.headers['x-request-id'] as string) || (req.headers['traceparent'] as string) || executionId;

    const context = executionContextManager.createContext({
      executionId,
      traceId,
      metadata: {
        method,
        url: rawUrl,
        clientIp,
      },
    });

    // Inbound interaction data placeholder (U0)
    const inboundData: InboundRequest = {
      method,
      url: rawUrl,
      headers,
      query_params: queryParams,
      client_ip: clientIp,
      body: null,
    };

    const interaction: InboundInteraction = {
      interaction_id: generateInteractionId('inbound'),
      sequence_idx: 0, // U0 is always the initial root anchor
      category: 'HTTP_INBOUND',
      timestamp_offset_ms: 0,
      duration_ms: 0,
      redacted: false,
      truncated: false,
      data: inboundData,
    };

    // Buffer incoming body non-intrusively by tapping req.emit
    const bodyChunks: Buffer[] = [];
    const originalEmit = req.emit;

    req.emit = function interceptedEmit(this: Req, event: string | symbol, ...args: unknown[]) {
      if (event === 'data' && args[0]) {
        const chunk = args[0];
        if (Buffer.isBuffer(chunk)) {
          bodyChunks.push(chunk);
        } else if (typeof chunk === 'string') {
          bodyChunks.push(Buffer.from(chunk));
        }
      } else if (event === 'end') {
        if (bodyChunks.length > 0) {
          inboundData.body = Buffer.concat(bodyChunks).toString('utf-8');
        }
      }
      return originalEmit.apply(this, [event, ...args] as [string | symbol, ...unknown[]]);
    };

    // Track response finish and error triggers (5xx)
    res.on('finish', () => {
      if (res.statusCode >= 500) {
        context.hasError = true;
        if (!context.error) {
          context.error = new Error(`HTTP ${res.statusCode} Response`);
        }
      }
    });

    // Record U0 immediately in the context
    context.interactions.push(interaction);
    if (context.onInteraction) {
      context.onInteraction(interaction);
    }
    context.sequenceCounter = 1; // Subsequent interactions start from sequence_idx 1

    return executionContextManager.run(context, () => {
      return listener(req, res);
    });
  };
}

/**
 * Patches http.createServer and https.createServer to intercept inbound HTTP requests.
 */
export function patchHttpInbound(
  httpMod: typeof http = http,
  httpsMod: typeof https = https
): boolean {
  if (isInboundPatched) return true;

  try {
    originalHttpCreateServer = httpMod.createServer;
    originalHttpsCreateServer = httpsMod.createServer;

    // Patch http.createServer
    httpMod.createServer = function interceptedHttpCreateServer(
      ...args: unknown[]
    ): http.Server {
      let options: http.ServerOptions = {};
      let listener: ((req: http.IncomingMessage, res: http.ServerResponse) => void) | undefined;

      if (typeof args[0] === 'function') {
        listener = args[0] as (req: http.IncomingMessage, res: http.ServerResponse) => void;
      } else if (typeof args[0] === 'object' && args[0] !== null) {
        options = args[0] as http.ServerOptions;
        if (typeof args[1] === 'function') {
          listener = args[1] as (req: http.IncomingMessage, res: http.ServerResponse) => void;
        }
      }

      if (listener) {
        const wrapped = wrapInboundRequestListener(listener);
        if (typeof args[0] === 'function') {
          return originalHttpCreateServer!.call(httpMod, wrapped);
        }
        return originalHttpCreateServer!.call(httpMod, options, wrapped);
      }

      const server = (originalHttpCreateServer as Function).apply(httpMod, args) as http.Server;
      const originalOn = server.on;
      server.on = function interceptedOn(event: string, handler: (...handlerArgs: unknown[]) => void) {
        if (event === 'request' && typeof handler === 'function') {
          const wrapped = wrapInboundRequestListener(
            handler as (req: http.IncomingMessage, res: http.ServerResponse) => void
          );
          return originalOn.call(this, event, wrapped);
        }
        return originalOn.apply(this, [event, handler] as [string, (...args: unknown[]) => void]);
      };
      return server;
    } as unknown as typeof http.createServer;

    // Patch https.createServer
    httpsMod.createServer = function interceptedHttpsCreateServer(
      ...args: unknown[]
    ): https.Server {
      let options: https.ServerOptions = {};
      let listener: ((req: http.IncomingMessage, res: http.ServerResponse) => void) | undefined;

      if (typeof args[0] === 'object' && args[0] !== null) {
        options = args[0] as https.ServerOptions;
        if (typeof args[1] === 'function') {
          listener = args[1] as (req: http.IncomingMessage, res: http.ServerResponse) => void;
        }
      } else if (typeof args[0] === 'function') {
        listener = args[0] as (req: http.IncomingMessage, res: http.ServerResponse) => void;
      }

      if (listener) {
        const wrapped = wrapInboundRequestListener(listener);
        return originalHttpsCreateServer!.call(httpsMod, options, wrapped);
      }

      return (originalHttpsCreateServer as Function).apply(httpsMod, args) as https.Server;
    } as unknown as typeof https.createServer;

    isInboundPatched = true;
    return true;
  } catch (err) {
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro InboundInterceptor] Failed to patch http.createServer:', err);
    }
    return false;
  }
}

/**
 * Restores original http.createServer and https.createServer.
 */
export function unpatchHttpInbound(
  httpMod: typeof http = http,
  httpsMod: typeof https = https
): boolean {
  if (!isInboundPatched) return true;

  if (originalHttpCreateServer) {
    httpMod.createServer = originalHttpCreateServer;
    originalHttpCreateServer = null;
  }
  if (originalHttpsCreateServer) {
    httpsMod.createServer = originalHttpsCreateServer;
    originalHttpsCreateServer = null;
  }

  isInboundPatched = false;
  return true;
}

/**
 * Checks if HTTP inbound interceptor is active.
 */
export function isHttpInboundPatched(): boolean {
  return isInboundPatched;
}
