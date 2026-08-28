/**
 * Repro Outbound HTTP Interceptor
 * Specification: ADR-007 (U-03), Story-02 (Scenario 3)
 * Zero external dependencies: Uses node:http, node:https, node:url
 */

import http from 'node:http';
import https from 'node:https';
import type { OutboundInteraction } from '@repro/core';
import { executionContextManager } from '../../context/async-storage.ts';
import { generateInteractionId } from '../../context/execution-id.ts';

let isOutboundPatched = false;
let originalHttpRequest: typeof http.request | null = null;
let originalHttpGet: typeof http.get | null = null;
let originalHttpsRequest: typeof https.request | null = null;
let originalHttpsGet: typeof https.get | null = null;
let originalGlobalFetch: typeof globalThis.fetch | null = null;

/**
 * Normalizes headers object to Record<string, string>.
 */
export function normalizeHeaders(
  headers?: http.OutgoingHttpHeaders | http.IncomingHttpHeaders | Headers | null
): Record<string, string> {
  if (!headers) return {};

  const result: Record<string, string> = {};

  if (typeof (headers as Headers).forEach === 'function') {
    (headers as Headers).forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      result[key.toLowerCase()] = value.join(', ');
    } else {
      result[key.toLowerCase()] = String(value);
    }
  }

  return result;
}

/**
 * Resolves full target URL string from request arguments.
 */
export function resolveTargetUrl(
  isHttps: boolean,
  arg0: unknown,
  arg1?: unknown
): { url: string; method: string; headers: Record<string, string> } {
  let protocol = isHttps ? 'https:' : 'http:';
  let host = 'localhost';
  let port = isHttps ? '443' : '80';
  let path = '/';
  let method = 'GET';
  let rawHeaders: http.OutgoingHttpHeaders | undefined;

  if (typeof arg0 === 'string') {
    try {
      const parsed = new URL(arg0);
      protocol = parsed.protocol;
      host = parsed.hostname;
      port = parsed.port || (protocol === 'https:' ? '443' : '80');
      path = `${parsed.pathname}${parsed.search}`;
    } catch {
      path = arg0;
    }
    if (arg1 && typeof arg1 === 'object') {
      const opts = arg1 as http.RequestOptions;
      if (opts.method) method = opts.method.toUpperCase();
      if (opts.headers) rawHeaders = opts.headers;
    }
  } else if (arg0 instanceof URL) {
    protocol = arg0.protocol;
    host = arg0.hostname;
    port = arg0.port || (protocol === 'https:' ? '443' : '80');
    path = `${arg0.pathname}${arg0.search}`;
    if (arg1 && typeof arg1 === 'object') {
      const opts = arg1 as http.RequestOptions;
      if (opts.method) method = opts.method.toUpperCase();
      if (opts.headers) rawHeaders = opts.headers;
    }
  } else if (arg0 && typeof arg0 === 'object') {
    const opts = arg0 as http.RequestOptions;
    if (opts.protocol) protocol = opts.protocol;
    if (opts.hostname) host = opts.hostname;
    else if (opts.host) host = opts.host;
    if (opts.port) port = String(opts.port);
    if (opts.path) path = opts.path;
    if (opts.method) method = opts.method.toUpperCase();
    if (opts.headers) rawHeaders = opts.headers;
  }

  const defaultPort = protocol === 'https:' ? '443' : '80';
  const portSuffix = port && port !== defaultPort ? `:${port}` : '';
  const fullUrl = `${protocol}//${host}${portSuffix}${path}`;

  return {
    url: fullUrl,
    method,
    headers: normalizeHeaders(rawHeaders),
  };
}

/**
 * Creates an intercepted wrapper around http/https.request.
 */
function createInterceptedRequest(isHttps: boolean, originalFn: Function) {
  return function interceptedRequest(this: unknown, ...args: unknown[]): http.ClientRequest {
    if (!executionContextManager.isActive()) {
      return originalFn.apply(this, args) as http.ClientRequest;
    }

    const { url: targetUrl, method: targetMethod, headers: reqHeaders } = resolveTargetUrl(
      isHttps,
      args[0],
      args[1]
    );

    const startMs = Date.now();
    const sequenceIdx = executionContextManager.getNextSequenceIndex();
    const offsetMs = executionContextManager.getTimestampOffsetMs();

    const requestBodyChunks: Buffer[] = [];
    const responseBodyChunks: Buffer[] = [];

    const req: http.ClientRequest = originalFn.apply(this, args);

    // Buffer outgoing request body
    const originalWrite = req.write;
    const originalEnd = req.end;

    req.write = function interceptedWrite(this: http.ClientRequest, chunk: unknown, ...rest: unknown[]) {
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          requestBodyChunks.push(chunk);
        } else if (typeof chunk === 'string') {
          requestBodyChunks.push(Buffer.from(chunk));
        }
      }
      return (originalWrite as Function).apply(this, [chunk, ...rest]);
    };

    req.end = function interceptedEnd(this: http.ClientRequest, chunk?: unknown, ...rest: unknown[]) {
      if (chunk && typeof chunk !== 'function') {
        if (Buffer.isBuffer(chunk)) {
          requestBodyChunks.push(chunk);
        } else if (typeof chunk === 'string') {
          requestBodyChunks.push(Buffer.from(chunk));
        }
      }
      return (originalEnd as Function).apply(this, [chunk, ...rest]);
    };

    // Listen for response
    req.on('response', (res: http.IncomingMessage) => {
      const resHeaders = normalizeHeaders(res.headers);
      const originalResEmit = res.emit;

      res.emit = function interceptedResEmit(event: string | symbol, ...emitArgs: unknown[]) {
        if (event === 'data' && emitArgs[0]) {
          const chunk = emitArgs[0];
          if (Buffer.isBuffer(chunk)) {
            responseBodyChunks.push(chunk);
          } else if (typeof chunk === 'string') {
            responseBodyChunks.push(Buffer.from(chunk));
          }
        } else if (event === 'end') {
          try {
            const reqBody =
              requestBodyChunks.length > 0
                ? Buffer.concat(requestBodyChunks).toString('utf-8')
                : undefined;
            const resBody =
              responseBodyChunks.length > 0
                ? Buffer.concat(responseBodyChunks).toString('utf-8')
                : '';

            const interaction: OutboundInteraction = {
              interaction_id: generateInteractionId('http_out'),
              sequence_idx: sequenceIdx,
              category: 'HTTP_OUTBOUND',
              timestamp_offset_ms: offsetMs,
              duration_ms: Math.max(0, Date.now() - startMs),
              redacted: false,
              truncated: false,
              data: {
                method: targetMethod,
                url: targetUrl,
                headers: reqHeaders,
                request_body: reqBody,
                response: {
                  status_code: res.statusCode || 200,
                  headers: resHeaders,
                  body: resBody,
                },
              },
            };

            executionContextManager.recordInteraction(interaction);
          } catch (err) {
            if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
              console.error('[Repro OutboundInterceptor] Error recording interaction:', err);
            }
          }
        }

        return (originalResEmit as Function).apply(this, [event, ...emitArgs]);
      };
    });

    return req;
  };
}

/**
 * Patches globalThis.fetch for Node.js 22 built-in fetch capturing.
 */
function patchFetch(): void {
  if (typeof globalThis.fetch !== 'function' || originalGlobalFetch !== null) {
    return;
  }

  originalGlobalFetch = globalThis.fetch;
  const originalFetch = originalGlobalFetch;

  globalThis.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    if (!executionContextManager.isActive()) {
      return originalFetch(input, init);
    }

    const startMs = Date.now();
    const sequenceIdx = executionContextManager.getNextSequenceIndex();
    const offsetMs = executionContextManager.getTimestampOffsetMs();

    let targetUrl = '';
    let targetMethod = 'GET';
    let reqHeaders: Record<string, string> = {};
    let reqBody: string | undefined;

    if (typeof input === 'string') {
      targetUrl = input;
    } else if (input instanceof URL) {
      targetUrl = input.toString();
    } else if (typeof (input as Request).url === 'string') {
      targetUrl = (input as Request).url;
      targetMethod = (input as Request).method;
    }

    if (init?.method) {
      targetMethod = init.method.toUpperCase();
    }

    if (init?.headers) {
      reqHeaders = normalizeHeaders(init.headers as unknown as Headers);
    }

    if (init?.body) {
      if (typeof init.body === 'string') {
        reqBody = init.body;
      } else if (Buffer.isBuffer(init.body)) {
        reqBody = init.body.toString('utf-8');
      }
    }

    try {
      const response = await originalFetch(input, init);

      // Clone response to read text without consuming body for host caller
      try {
        const cloned = response.clone();
        const responseBodyText = await cloned.text();
        const responseHeaders = normalizeHeaders(response.headers);

        const interaction: OutboundInteraction = {
          interaction_id: generateInteractionId('fetch_out'),
          sequence_idx: sequenceIdx,
          category: 'HTTP_OUTBOUND',
          timestamp_offset_ms: offsetMs,
          duration_ms: Math.max(0, Date.now() - startMs),
          redacted: false,
          truncated: false,
          data: {
            method: targetMethod,
            url: targetUrl,
            headers: reqHeaders,
            request_body: reqBody,
            response: {
              status_code: response.status,
              headers: responseHeaders,
              body: responseBodyText,
            },
          },
        };

        executionContextManager.recordInteraction(interaction);
      } catch (cloneErr) {
        if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
          console.error('[Repro OutboundInterceptor] Failed to clone fetch response:', cloneErr);
        }
      }

      return response;
    } catch (fetchErr) {
      throw fetchErr;
    }
  };
}

/**
 * Patches http.request, http.get, https.request, https.get and global.fetch.
 */
export function patchHttpOutbound(
  httpMod: typeof http = http,
  httpsMod: typeof https = https
): boolean {
  if (isOutboundPatched) return true;

  try {
    originalHttpRequest = httpMod.request;
    originalHttpGet = httpMod.get;
    originalHttpsRequest = httpsMod.request;
    originalHttpsGet = httpsMod.get;

    httpMod.request = createInterceptedRequest(false, originalHttpRequest) as typeof http.request;
    httpMod.get = createInterceptedRequest(false, originalHttpGet) as typeof http.get;
    httpsMod.request = createInterceptedRequest(true, originalHttpsRequest) as typeof https.request;
    httpsMod.get = createInterceptedRequest(true, originalHttpsGet) as typeof https.get;

    patchFetch();

    isOutboundPatched = true;
    return true;
  } catch (err) {
    if (process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test') {
      console.error('[Repro OutboundInterceptor] Failed to patch outbound HTTP:', err);
    }
    return false;
  }
}

/**
 * Restores original http and https outbound functions.
 */
export function unpatchHttpOutbound(
  httpMod: typeof http = http,
  httpsMod: typeof https = https
): boolean {
  if (!isOutboundPatched) return true;

  if (originalHttpRequest) {
    httpMod.request = originalHttpRequest;
    originalHttpRequest = null;
  }
  if (originalHttpGet) {
    httpMod.get = originalHttpGet;
    originalHttpGet = null;
  }
  if (originalHttpsRequest) {
    httpsMod.request = originalHttpsRequest;
    originalHttpsRequest = null;
  }
  if (originalHttpsGet) {
    httpsMod.get = originalHttpsGet;
    originalHttpsGet = null;
  }
  if (originalGlobalFetch) {
    globalThis.fetch = originalGlobalFetch;
    originalGlobalFetch = null;
  }

  isOutboundPatched = false;
  return true;
}

/**
 * Checks if outbound HTTP interceptor is active.
 */
export function isHttpOutboundPatched(): boolean {
  return isOutboundPatched;
}
