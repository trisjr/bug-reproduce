/**
 * Repro In-Memory Key Vault (Local Mock & Ephemeral Vault)
 * Specification: ADR-012, SDD-Repro §4.2, Spec-Security (SEC-016, SEC-038)
 */

import { Buffer } from 'node:buffer';
import { generateDek } from '../crypto/envelope.ts';
import { zeroizeBuffer } from '../crypto/shredding.ts';

export type KeyStatus = 'ACTIVE' | 'SHREDDED' | 'EXPIRED' | 'NOT_FOUND';

export interface VaultKeyRecord {
  keyId: string;
  dek: Buffer;
  status: 'ACTIVE' | 'SHREDDED' | 'EXPIRED';
  createdAt: number;
  expiresAt?: number;
}

export interface StoreVaultKeyResult {
  keyId: string;
  expiresAt?: Date;
}

export interface RotateVaultKeyResult {
  newKeyId: string;
  newDek: Buffer;
}

/**
 * In-memory vault providing key storage with automated zeroization upon purge or expiration.
 */
export class InMemoryKeyVault {
  private readonly storeMap: Map<string, VaultKeyRecord> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(options: { autoCleanupIntervalMs?: number } = {}) {
    if (options.autoCleanupIntervalMs && options.autoCleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpired();
      }, options.autoCleanupIntervalMs);
      this.cleanupInterval.unref?.();
    }
  }

  /**
   * Stores a DEK with optional TTL in milliseconds.
   */
  public store(keyId: string, dek: Buffer | Uint8Array, ttlMs?: number): StoreVaultKeyResult {
    if (!keyId || typeof keyId !== 'string') {
      throw new Error("Invalid keyId: Expected non-empty string.");
    }

    const existing = this.storeMap.get(keyId);
    if (existing && existing.status === 'ACTIVE') {
      zeroizeBuffer(existing.dek);
    }

    const dekCopy = Buffer.from(dek);
    const now = Date.now();
    const expiresAt = ttlMs && ttlMs > 0 ? now + ttlMs : undefined;

    this.storeMap.set(keyId, {
      keyId,
      dek: dekCopy,
      status: 'ACTIVE',
      createdAt: now,
      expiresAt,
    });

    return {
      keyId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };
  }

  /**
   * Retrieves a copy of the DEK. Returns null if missing, shredded, or expired.
   */
  public get(keyId: string): Buffer | null {
    const record = this.storeMap.get(keyId);
    if (!record) {
      return null;
    }

    if (record.status === 'SHREDDED') {
      return null;
    }

    if (record.expiresAt && Date.now() > record.expiresAt) {
      if (record.status === 'ACTIVE') {
        record.status = 'EXPIRED';
        zeroizeBuffer(record.dek);
      }
      return null;
    }

    if (record.status === 'EXPIRED') {
      return null;
    }

    return Buffer.from(record.dek);
  }

  /**
   * Checks the exact status of a key.
   */
  public getKeyStatus(keyId: string): KeyStatus {
    const record = this.storeMap.get(keyId);
    if (!record) {
      return 'NOT_FOUND';
    }

    if (record.status === 'SHREDDED') {
      return 'SHREDDED';
    }

    if (record.expiresAt && Date.now() > record.expiresAt) {
      if (record.status === 'ACTIVE') {
        record.status = 'EXPIRED';
        zeroizeBuffer(record.dek);
      }
      return 'EXPIRED';
    }

    return record.status;
  }

  /**
   * Permanently crypto-shreds a key by zeroizing its memory buffer.
   */
  public purge(keyId: string): boolean {
    const record = this.storeMap.get(keyId);
    if (!record) {
      return false;
    }

    zeroizeBuffer(record.dek);
    record.status = 'SHREDDED';
    return true;
  }

  /**
   * Rotates a key by generating a new DEK and storing it under a new key ID.
   */
  public rotate(keyId: string): RotateVaultKeyResult {
    const newKeyId = `k_rot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newDek = generateDek();

    this.store(newKeyId, newDek);

    return {
      newKeyId,
      newDek: Buffer.from(newDek),
    };
  }

  /**
   * Cleans up expired keys, zeroizing their memory buffers.
   */
  public cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const record of this.storeMap.values()) {
      if (record.status === 'ACTIVE' && record.expiresAt && now > record.expiresAt) {
        record.status = 'EXPIRED';
        zeroizeBuffer(record.dek);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Destroys the vault, zeroizing all keys in memory and stopping cleanup intervals.
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    for (const record of this.storeMap.values()) {
      zeroizeBuffer(record.dek);
      record.status = 'SHREDDED';
    }
    this.storeMap.clear();
  }

  /**
   * Creates a mock fetch function implementing the REST Key Custody endpoints.
   */
  public asFetchHandler(): typeof fetch {
    return async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === 'string'
        ? input
        : (input instanceof URL ? input.toString() : input.url);
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const parsedUrl = new URL(urlStr, 'http://localhost');
      const pathname = parsedUrl.pathname;
      const keyApiPath = '/api/v1/keys';
      const apiIndex = pathname.indexOf(keyApiPath);

      if (apiIndex === -1) {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const subPath = pathname.slice(apiIndex + keyApiPath.length);

      // POST /api/v1/keys
      if (method === 'POST' && (subPath === '' || subPath === '/')) {
        const bodyText = typeof init?.body === 'string' ? init.body : '{}';
        const body = JSON.parse(bodyText) as { key_id: string; dek: string; ttl_seconds?: number };
        const dekBuf = Buffer.from(body.dek, 'base64');
        const ttlMs = body.ttl_seconds ? body.ttl_seconds * 1000 : undefined;
        const res = this.store(body.key_id, dekBuf, ttlMs);

        return new Response(
          JSON.stringify({ key_id: res.keyId, expires_at: res.expiresAt?.toISOString() }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // POST /api/v1/keys/:key_ref/rotate
      if (method === 'POST' && subPath.endsWith('/rotate')) {
        const keyRef = decodeURIComponent(subPath.slice(1, -'/rotate'.length));
        const res = this.rotate(keyRef);
        return new Response(
          JSON.stringify({ new_key_id: res.newKeyId, new_dek: res.newDek.toString('base64') }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // GET /api/v1/keys/:key_ref
      if (method === 'GET' && subPath.startsWith('/')) {
        const keyRef = decodeURIComponent(subPath.slice(1));
        const status = this.getKeyStatus(keyRef);

        if (status === 'ACTIVE') {
          const dek = this.get(keyRef);
          return new Response(JSON.stringify({ key_id: keyRef, dek: dek!.toString('base64') }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (status === 'SHREDDED' || status === 'NOT_FOUND') {
          return new Response(JSON.stringify({ error: 'Key shredded or not found', status }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (status === 'EXPIRED') {
          return new Response(JSON.stringify({ error: 'Key expired', status }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // DELETE /api/v1/keys/:key_ref
      if (method === 'DELETE' && subPath.startsWith('/')) {
        const keyRef = decodeURIComponent(subPath.slice(1));
        this.purge(keyRef);
        return new Response(JSON.stringify({ success: true, key_id: keyRef }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }
}
