/**
 * Repro HTTP Replay Mock Adapter (Outbound HTTP, HTTPS & Fetch)
 * Specification: ADR-004, ADR-005, ADR-007, Story-10 (FR-029, FR-033, Rule E9)
 * Zero external dependencies: Uses Node.js built-in APIs (node:http, node:https, node:url, node:stream) and @repro/core
 */

import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import type { OutboundInteraction } from '@repro/core';

/**
 * Error thrown when an unrecorded HTTP interaction occurs during replay (Fail-Closed, Rule E9).
 */
export class UnrecordedHttpInteractionError extends Error {
  public readonly code = 'REPRO_UNRECORDED_INTERACTION';
  public readonly method: string;
  public readonly url: string;
  public readonly requestBody?: string;

  constructor(
    message: string,
    details: {
      method: string;
      url: string;
      requestBody?: string;
    }
  ) {
    super(
      message ||
        `Unrecorded Outbound HTTP interaction: ${details.method} ${details.url}. Fail-closed: No real network fallback allowed (ADR-004, Rule E9).`
    );
    this.name = 'UnrecordedHttpInteractionError';
    this.method = details.method;
    this.url = details.url;
    this.requestBody = details.requestBody;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnrecordedHttpInteractionError);
    }
  }
}

/**
 * Normalizes headers object to lowercase Record<string, string>.
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
 * Normalizes URL for flexible matching (e.g. matching /path, or with host).
 */
export function urlsMatch(recordedUrl: string, requestUrl: string): boolean {
  if (recordedUrl === requestUrl) return true;
  try {
    const r = new URL(recordedUrl);
    const q = new URL(requestUrl);
    if (r.pathname === q.pathname && r.search === q.search) {
      if (r.hostname === q.hostname || r.hostname === 'localhost' || q.hostname === 'localhost') {
        return true;
      }
    }
  } catch {
    // String matching
  }
  return false;
}

/**
 * Mock IncomingMessage stream representing the recorded response.
 */
export class MockIncomingMessage extends Readable {
  public statusCode: number;
  public statusMessage: string;
  public headers: Record<string, string>;
  public complete = true;
  public httpVersion = '1.1';
  public httpVersionMajor = 1;
  public httpVersionMinor = 1;

  constructor(statusCode: number, headers: Record<string, string>, body: string) {
    super();
    this.statusCode = statusCode;
    this.statusMessage = statusCode === 200 ? 'OK' : 'Mock Response';
    this.headers = headers;

    const payload = Buffer.from(body, 'utf-8');
    this.push(payload);
    this.push(null);
  }

  public _read(): void {
    // Pushed in constructor
  }
}

/**
 * Mock ClientRequest capturing outbound request data and dispatching recorded response.
 */
export class MockClientRequest extends EventEmitter {
  private bodyChunks: Buffer[] = [];
  private ended = false;
  private readonly adapter: HttpMockAdapter;
  private readonly method: string;
  private readonly url: string;
  private readonly customHeaders: Record<string, string>;
  private readonly responseCallback?: (res: MockIncomingMessage) => void;

  constructor(
    adapter: HttpMockAdapter,
    method: string,
    url: string,
    headers: Record<string, string>,
    callback?: (res: MockIncomingMessage) => void
  ) {
    super();
    this.adapter = adapter;
    this.method = method;
    this.url = url;
    this.customHeaders = headers;
    this.responseCallback = callback;
  }
  public write(chunk: unknown, encodingOrCallback?: string | Function, cb?: Function): boolean {
    if (this.ended || this.destroyed) return false;
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        this.bodyChunks.push(chunk);
      } else if (typeof chunk === 'string') {
        const enc = typeof encodingOrCallback === 'string' ? encodingOrCallback : 'utf-8';
        this.bodyChunks.push(Buffer.from(chunk, enc as BufferEncoding));
      }
    }
    const callback = typeof encodingOrCallback === 'function' ? encodingOrCallback : cb;
    if (typeof callback === 'function') {
      process.nextTick(callback);
    }
    return true;
  }

  public end(chunk?: unknown, encodingOrCallback?: string | Function, cb?: Function): this {
    if (this.ended || this.destroyed) return this;
    this.ended = true;

    if (chunk) {
      this.write(chunk, encodingOrCallback as string);
    }

    const callback = typeof encodingOrCallback === 'function' ? encodingOrCallback : cb;
    if (typeof callback === 'function') {
      process.nextTick(callback);
    }

    const requestBody = Buffer.concat(this.bodyChunks).toString('utf-8');

    process.nextTick(() => {
      try {
        const matched = this.adapter.matchInteraction(this.method, this.url, requestBody);
        const responseData = matched.data.response;
        const res = new MockIncomingMessage(
          responseData.status_code,
          responseData.headers,
          responseData.body
        );

        if (this.callback) {
          this.callback(res);
        }
        this.emit('response', res);
      } catch (err) {
        this.emit('error', err);
      }
    });

    return this;
  }

  public abort(): void {
    this.destroy(new Error('Request aborted'));
  }

  public destroy(error?: Error): this {
    if (this.destroyed) return this;
    this.destroyed = true;
    if (error) {
      this.emit('error', error);
    }
    this.emit('close');
    return this;
  }

  public setTimeout(_timeout: number, callback?: () => void): this {
    if (callback) process.nextTick(callback);
    return this;
  }

  public setHeader(_name: string, _value: string | string[]): this {
    return this;
  }

  public getHeader(_name: string): undefined {
    return undefined;
  }
}

/**
 * HttpMockAdapter manages Outbound HTTP interactions recorded in a capsule
 * and enforces strict Zero-Egress / Fail-Closed replay.
 */
export class HttpMockAdapter {
  private readonly interactions: OutboundInteraction[] = [];
  private readonly consumedInteractionIds = new Set<string>();
  private originalHttpRequest: typeof http.request | null = null;
  private originalHttpGet: typeof http.get | null = null;
  private originalHttpsRequest: typeof https.request | null = null;
  private originalHttpsGet: typeof https.get | null = null;
  private originalFetch: typeof globalThis.fetch | null = null;
  private installed = false;

  constructor(interactions: OutboundInteraction[] = []) {
    this.interactions = [...interactions].sort((a, b) => a.sequence_idx - b.sequence_idx);
  }

  /**
   * Loads or replaces recorded outbound interactions.
   */
  public loadInteractions(interactions: OutboundInteraction[]): void {
    this.interactions.length = 0;
    this.interactions.push(...[...interactions].sort((a, b) => a.sequence_idx - b.sequence_idx));
    this.reset();
  }

  /**
   * Resets consumption state.
   */
  public reset(): void {
    this.consumedInteractionIds.clear();
  }

  /**
   * Matches an outbound HTTP request against recorded interactions in the capsule.
   */
  public matchInteraction(
    method: string,
    url: string,
    requestBody?: string
  ): OutboundInteraction {
    const normalizedMethod = method.toUpperCase();

    // Strategy 1: Exact match on method, URL match, and unconsumed state
    let matched = this.interactions.find(
      (i) =>
        !this.consumedInteractionIds.has(i.interaction_id) &&
        i.data.method.toUpperCase() === normalizedMethod &&
        urlsMatch(i.data.url, url) &&
        (!requestBody || !i.data.request_body || i.data.request_body === requestBody)
    );

    // Strategy 2: Relaxed body match if URL and method match
    if (!matched) {
      matched = this.interactions.find(
        (i) =>
          !this.consumedInteractionIds.has(i.interaction_id) &&
          i.data.method.toUpperCase() === normalizedMethod &&
          urlsMatch(i.data.url, url)
      );
    }

    // Strategy 3: Method match fallback in sequence
    if (!matched) {
      matched = this.interactions.find(
        (i) =>
          !this.consumedInteractionIds.has(i.interaction_id) &&
          i.data.method.toUpperCase() === normalizedMethod
      );
    }

    if (!matched) {
      throw new UnrecordedHttpInteractionError(
        `REPRO_UNRECORDED_INTERACTION: No recorded HTTP interaction found for ${normalizedMethod} ${url}`,
        {
          method: normalizedMethod,
          url,
          requestBody,
        }
      );
    }

    this.consumedInteractionIds.add(matched.interaction_id);
    return matched;
  }

  /**
   * Installs monkey-patches on http, https, and globalThis.fetch.
   */
  public install(
    httpMod: typeof http = http,
    httpsMod: typeof https = https
  ): void {
    if (this.installed) return;

    this.originalHttpRequest = httpMod.request;
    this.originalHttpGet = httpMod.get;
    this.originalHttpsRequest = httpsMod.request;
    this.originalHttpsGet = httpsMod.get;
    this.originalFetch = globalThis.fetch;

    const createMockHandler = (isHttps: boolean) => {
      return (arg0: unknown, arg1?: unknown, arg2?: unknown) => {
        const { url, method, headers } = resolveTargetUrl(isHttps, arg0, arg1);
        let callback: ((res: MockIncomingMessage) => void) | undefined;

        if (typeof arg1 === 'function') {
          callback = arg1 as (res: MockIncomingMessage) => void;
        } else if (typeof arg2 === 'function') {
          callback = arg2 as (res: MockIncomingMessage) => void;
        }

        return new MockClientRequest(this, method, url, headers, callback);
      };
    };

    httpMod.request = createMockHandler(false) as unknown as typeof http.request;
    httpMod.get = ((arg0: unknown, arg1?: unknown, arg2?: unknown) => {
      const req = (httpMod.request as Function)(arg0, arg1, arg2);
      req.end();
      return req;
    }) as unknown as typeof http.get;

    httpsMod.request = createMockHandler(true) as unknown as typeof https.request;
    httpsMod.get = ((arg0: unknown, arg1?: unknown, arg2?: unknown) => {
      const req = (httpsMod.request as Function)(arg0, arg1, arg2);
      req.end();
      return req;
    }) as unknown as typeof https.get;

    // Monkey-patch globalThis.fetch
    globalThis.fetch = async (
      input: string | URL | Request,
      init?: RequestInit
    ): Promise<Response> => {
      let targetUrl = '';
      let method = 'GET';
      let requestBody: string | undefined;

      if (typeof input === 'string') {
        targetUrl = input;
      } else if (input instanceof URL) {
        targetUrl = input.toString();
      } else if (input && typeof input === 'object') {
        const req = input as Request;
        targetUrl = req.url;
        method = req.method ? req.method.toUpperCase() : 'GET';
      }

      if (init) {
        if (init.method) method = init.method.toUpperCase();
        if (init.body) {
          if (typeof init.body === 'string') {
            requestBody = init.body;
          }
        }
      }

      const matched = this.matchInteraction(method, targetUrl, requestBody);
      const responseData = matched.data.response;

      return new Response(responseData.body, {
        status: responseData.status_code,
        headers: responseData.headers,
      });
    };

    this.installed = true;
  }

  /**
   * Restores original http, https, and globalThis.fetch functions.
   */
  public uninstall(
    httpMod: typeof http = http,
    httpsMod: typeof https = https
  ): void {
    if (!this.installed) return;

    if (this.originalHttpRequest) httpMod.request = this.originalHttpRequest;
    if (this.originalHttpGet) httpMod.get = this.originalHttpGet;
    if (this.originalHttpsRequest) httpsMod.request = this.originalHttpsRequest;
    if (this.originalHttpsGet) httpsMod.get = this.originalHttpsGet;
    if (this.originalFetch) globalThis.fetch = this.originalFetch;

    this.originalHttpRequest = null;
    this.originalHttpGet = null;
    this.originalHttpsRequest = null;
    this.originalHttpsGet = null;
    this.originalFetch = null;
    this.installed = false;
  }

  /**
   * Checks if HTTP mock adapter is currently installed.
   */
  public isInstalled(): boolean {
    return this.installed;
  }
}
