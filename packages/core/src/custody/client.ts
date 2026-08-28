/**
 * Repro Key Custody REST Client
 * Specification: ADR-012 (Key Custody & Crypto-Shredding), SDD-Repro §4.2, §5.4
 */

import { Buffer } from 'node:buffer';

export class KeyCustodyError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'KeyCustodyError';
    this.status = status;
  }
}

export class KeyCustodyShreddedError extends KeyCustodyError {
  constructor(keyRef: string) {
    super(
      `❌ ERROR: Capsule key '${keyRef}' has been permanently shredded (Crypto-shredded). Payload is unrecoverable.`,
      404
    );
    this.name = 'KeyCustodyShreddedError';
  }
}

export class KeyCustodyExpiredError extends KeyCustodyError {
  constructor(keyRef: string) {
    super(
      `⚠️ ERROR: Capsule retention period for key '${keyRef}' has expired. Key is locked pending shredding.`,
      403
    );
    this.name = 'KeyCustodyExpiredError';
  }
}

export class KeyCustodyUnreachableError extends KeyCustodyError {
  constructor(endpoint: string, originalError?: Error) {
    super(
      `🔒 ERROR: Cannot connect to Key Custody Store at <${endpoint}>. Check network or auth credentials.${
        originalError ? ` (${originalError.message})` : ''
      }`,
      503
    );
    this.name = 'KeyCustodyUnreachableError';
  }
}

export interface KeyCustodyClientConfig {
  endpoint: string;
  authToken?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface StoreDekOptions {
  ttlSeconds?: number;
  appName?: string;
  capsuleId?: string;
}

export interface StoreDekResult {
  key_id: string;
  expires_at?: string;
}

export interface RotateKeyResult {
  new_key_id: string;
  new_dek: Buffer;
}

/**
 * Client for interacting with the Key Custody Service (ADR-012).
 */
export class KeyCustodyClient {
  private readonly endpoint: string;
  private readonly authToken?: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(config: KeyCustodyClientConfig) {
    if (!config || !config.endpoint) {
      throw new KeyCustodyError("KeyCustodyClient requires a valid 'endpoint' URI.");
    }
    this.endpoint = config.endpoint.replace(/\/+$/, '');
    this.authToken = config.authToken;
    this.timeoutMs = config.timeoutMs ?? 5000;
    this.fetchFn = config.fetchFn ?? globalThis.fetch;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Retrieves the Data Encryption Key (DEK) for a given key reference.
   * Handles 4 distinct states according to ADR-012 §4.2.
   */
  public async getDek(keyRef: string): Promise<Buffer> {
    if (!keyRef) {
      throw new KeyCustodyError("Missing required parameter 'keyRef'.");
    }

    const url = `${this.endpoint}/api/v1/keys/${encodeURIComponent(keyRef)}`;
    let response: Response;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      response = await this.fetchFn(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (error) {
      throw new KeyCustodyUnreachableError(this.endpoint, error as Error);
    }

    if (response.status === 200) {
      const body = (await response.json()) as { dek: string; key_id?: string };
      if (!body.dek) {
        throw new KeyCustodyError(`Key custody response missing 'dek' for key '${keyRef}'.`);
      }
      return Buffer.from(body.dek, 'base64');
    }

    if (response.status === 404 || response.status === 410) {
      throw new KeyCustodyShreddedError(keyRef);
    }

    if (response.status === 403) {
      throw new KeyCustodyExpiredError(keyRef);
    }

    if (response.status >= 500) {
      throw new KeyCustodyUnreachableError(this.endpoint, new Error(`Server returned status ${response.status}`));
    }

    throw new KeyCustodyError(`Key custody error: Unexpected status ${response.status}`, response.status);
  }

  /**
   * Stores a new DEK in the Key Custody Store.
   */
  public async storeDek(
    keyRef: string,
    dek: Buffer | Uint8Array,
    options: StoreDekOptions = {}
  ): Promise<StoreDekResult> {
    if (!keyRef) {
      throw new KeyCustodyError("Missing required parameter 'keyRef'.");
    }

    const dekBase64 = Buffer.isBuffer(dek) ? dek.toString('base64') : Buffer.from(dek).toString('base64');
    const url = `${this.endpoint}/api/v1/keys`;

    let response: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      response = await this.fetchFn(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          key_id: keyRef,
          dek: dekBase64,
          ttl_seconds: options.ttlSeconds,
          app_name: options.appName,
          capsule_id: options.capsuleId,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (error) {
      throw new KeyCustodyUnreachableError(this.endpoint, error as Error);
    }

    if (!response.ok) {
      throw new KeyCustodyError(`Failed to store DEK: status ${response.status}`, response.status);
    }

    const body = (await response.json()) as { key_id: string; expires_at?: string };
    return {
      key_id: body.key_id ?? keyRef,
      expires_at: body.expires_at,
    };
  }

  /**
   * Permanently purges/shreds a DEK (Crypto-shredding per GDPR Art 17 / SEC-016).
   */
  public async purgeDek(keyRef: string, reason = 'EXPLICIT_PURGE'): Promise<boolean> {
    if (!keyRef) {
      throw new KeyCustodyError("Missing required parameter 'keyRef'.");
    }

    const url = `${this.endpoint}/api/v1/keys/${encodeURIComponent(keyRef)}`;
    let response: Response;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      response = await this.fetchFn(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason }),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (error) {
      throw new KeyCustodyUnreachableError(this.endpoint, error as Error);
    }

    if (response.status === 200 || response.status === 204 || response.status === 404) {
      return true;
    }

    throw new KeyCustodyError(`Failed to purge DEK: status ${response.status}`, response.status);
  }

  /**
   * Rotates an existing key, generating a new DEK and key reference.
   */
  public async rotateKey(keyRef: string): Promise<RotateKeyResult> {
    if (!keyRef) {
      throw new KeyCustodyError("Missing required parameter 'keyRef'.");
    }

    const url = `${this.endpoint}/api/v1/keys/${encodeURIComponent(keyRef)}/rotate`;
    let response: Response;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      response = await this.fetchFn(url, {
        method: 'POST',
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (error) {
      throw new KeyCustodyUnreachableError(this.endpoint, error as Error);
    }

    if (!response.ok) {
      throw new KeyCustodyError(`Failed to rotate key: status ${response.status}`, response.status);
    }

    const body = (await response.json()) as { new_key_id: string; new_dek: string };
    return {
      new_key_id: body.new_key_id,
      new_dek: Buffer.from(body.new_dek, 'base64'),
    };
  }
}
