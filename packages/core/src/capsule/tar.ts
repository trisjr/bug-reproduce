/**
 * Repro Pure-JS POSIX ustar Tar Reader & Writer
 * Specification: ADR-002 (Container format .repro.tar.gz), Spec-Security (SEC-027, THREAT-009)
 */

import { Buffer } from 'node:buffer';

export class TarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TarError';
  }
}

export interface TarEntry {
  name: string;
  data: Buffer;
  mode?: number;
  mtime?: number;
}

export interface UnpackTarOptions {
  maxBytes?: number; // Decompression bomb threshold (default 50 MB)
}

const BLOCK_SIZE = 512;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validates entry path against Zip-Slip / Path Traversal vulnerabilities (THREAT-009).
 */
export function assertSafeEntryPath(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new TarError('Tar entry name must be a non-empty string.');
  }

  // Reject absolute paths
  if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/.test(name)) {
    throw new TarError(`Tar entry '${name}' has an unsafe absolute path.`);
  }

  // Reject directory traversal segments
  const segments = name.split(/[/\\]/);
  for (const seg of segments) {
    if (seg === '..') {
      throw new TarError(`Tar entry '${name}' contains illegal path traversal segment '..'.`);
    }
  }
}

/**
 * Encodes an octal string into a Buffer with exact byte length.
 */
function encodeOctal(value: number, length: number): Buffer {
  const buf = Buffer.alloc(length, 0);
  const octalStr = value.toString(8);
  const padded = octalStr.padStart(length - 1, '0') + '\0';
  buf.write(padded, 0, length, 'ascii');
  return buf;
}

/**
 * Parses an octal string from a Buffer slice.
 */
function parseOctal(buf: Buffer, offset: number, length: number): number {
  const str = buf.toString('ascii', offset, offset + length).replace(/\0.*$/g, '').trim();
  if (!str) return 0;
  const num = parseInt(str, 8);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Computes ustar header checksum (sum of all 512 bytes with chksum field treated as 8 spaces).
 */
function computeHeaderChecksum(header: Buffer): number {
  let sum = 0;
  for (let i = 0; i < BLOCK_SIZE; i++) {
    // Offset 148..156 is checksum field
    if (i >= 148 && i < 156) {
      sum += 0x20; // ASCII space
    } else {
      sum += header[i];
    }
  }
  return sum;
}

/**
 * Creates a 512-byte POSIX ustar header for a file entry.
 */
function createHeader(entry: TarEntry): Buffer {
  assertSafeEntryPath(entry.name);

  const header = Buffer.alloc(BLOCK_SIZE, 0);

  // 0..100: File name
  header.write(entry.name, 0, 100, 'utf8');

  // 100..108: File mode (default 0644)
  const mode = entry.mode ?? 0o644;
  encodeOctal(mode, 8).copy(header, 100);

  // 108..116: UID (0)
  encodeOctal(0, 8).copy(header, 108);

  // 116..124: GID (0)
  encodeOctal(0, 8).copy(header, 116);

  // 124..136: Size (12 bytes octal)
  encodeOctal(entry.data.length, 12).copy(header, 124);

  // 136..148: MTime (12 bytes octal)
  const mtime = Math.floor((entry.mtime ?? Date.now()) / 1000);
  encodeOctal(mtime, 12).copy(header, 136);

  // 156: Typeflag ('0' = regular file)
  header[156] = 0x30; // '0'

  // 257..263: Magic ("ustar\0")
  header.write('ustar\0', 257, 6, 'ascii');

  // 263..265: Version ("00")
  header.write('00', 263, 2, 'ascii');

  // Compute checksum and write to 148..156
  const chksum = computeHeaderChecksum(header);
  const chksumBuf = encodeOctal(chksum, 7); // 6 digits octal + null
  chksumBuf.copy(header, 148);
  header[155] = 0x20; // space after null per ustar spec

  return header;
}

/**
 * Packs multiple entries into a single POSIX ustar tar Buffer.
 */
export function packTar(entries: TarEntry[]): Buffer {
  const buffers: Buffer[] = [];

  for (const entry of entries) {
    assertSafeEntryPath(entry.name);

    // 1. Header block
    const header = createHeader(entry);
    buffers.push(header);

    // 2. Data blocks
    if (entry.data.length > 0) {
      buffers.push(entry.data);
      const remainder = entry.data.length % BLOCK_SIZE;
      if (remainder > 0) {
        const padding = Buffer.alloc(BLOCK_SIZE - remainder, 0);
        buffers.push(padding);
      }
    }
  }

  // Tar terminator: two 512-byte blocks of zeroes
  const endBlock = Buffer.alloc(BLOCK_SIZE * 2, 0);
  buffers.push(endBlock);

  return Buffer.concat(buffers);
}

/**
 * Unpacks a POSIX ustar tar Buffer into TarEntry[].
 * Protects against zip-slip and decompression bombs.
 */
export function unpackTar(
  tarBuffer: Buffer | Uint8Array,
  options: UnpackTarOptions = {}
): TarEntry[] {
  const buf = Buffer.isBuffer(tarBuffer) ? tarBuffer : Buffer.from(tarBuffer);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const entries: TarEntry[] = [];
  let totalBytes = 0;
  let offset = 0;

  while (offset + BLOCK_SIZE <= buf.length) {
    const header = buf.subarray(offset, offset + BLOCK_SIZE);

    // Check for end-of-archive (all zeroes in block)
    let isAllZero = true;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      if (header[i] !== 0) {
        isAllZero = false;
        break;
      }
    }

    if (isAllZero) {
      // Archive ended
      break;
    }

    // Parse file name (0..100)
    const name = header.toString('utf8', 0, 100).replace(/\0.*$/g, '').trim();
    if (!name) {
      offset += BLOCK_SIZE;
      continue;
    }

    assertSafeEntryPath(name);

    // Verify header checksum
    const recordedChksum = parseOctal(header, 148, 8);
    const calculatedChksum = computeHeaderChecksum(header);
    if (recordedChksum !== calculatedChksum) {
      throw new TarError(`Corrupted tar header for entry '${name}': Checksum mismatch.`);
    }

    // Parse size
    const size = parseOctal(header, 124, 12);
    if (size < 0) {
      throw new TarError(`Invalid file size ${size} in tar header for entry '${name}'.`);
    }

    totalBytes += size;
    if (totalBytes > maxBytes) {
      throw new TarError(
        `Decompression bomb detected: Total uncompressed tar size exceeded limit of ${maxBytes} bytes.`
      );
    }

    const mtimeSec = parseOctal(header, 136, 12);
    const mode = parseOctal(header, 100, 8);

    offset += BLOCK_SIZE;

    // Read data
    if (offset + size > buf.length) {
      throw new TarError(`Truncated tar archive: Entry '${name}' requires ${size} bytes but reaches EOF.`);
    }

    const data = Buffer.from(buf.subarray(offset, offset + size));
    entries.push({
      name,
      data,
      mode,
      mtime: mtimeSec * 1000,
    });

    // Advance offset aligned to BLOCK_SIZE
    const remainder = size % BLOCK_SIZE;
    const padding = remainder === 0 ? 0 : BLOCK_SIZE - remainder;
    offset += size + padding;
  }

  return entries;
}
