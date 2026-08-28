# Spec: Repro V0.1 Core Engine

## 1. Scope & Modules
- `@repro/core`: Monorepo shared package containing TypeScript interfaces, JSON schemas, cryptographic primitives (AES-256-GCM envelope, HMAC-SHA256 digest-before-parse, memory zeroization), Key Custody REST client, and zip-slip safe POSIX ustar tar reader/writer.
- `@repro/node`: In-process Capture SDK installed in customer Node.js application (`npm install @repro/node`), capturing execution context via `AsyncLocalStorage`, intercepting PostgreSQL queries and HTTP inbound/outbound, format-preserving PII/PAN scrubbing, and bounded ring buffer ($100\text{ rows} / 64\text{ KB}$). Zero external production dependencies (`SEC-037`).
- `@repro/replay`: Deterministic local replay engine with virtual clock frozen at T0, PostgreSQL DB Mock, Outbound HTTP Mock, Feature Flag Mock, synthetic inbound request injection, and Layer 1 Write Defense (`L1AstSqlFilter`, `HttpVerbGuard`, `FallbackGuard` Rule E9).
- `@repro/diff`: Verification engine combining 4 normalizers (SQL, URL, JSON, Headers), TwoTierComparator (Tier 1 Gate strict byte equality & Tier 2 Rubric semantic equivalence), 6-step divergence attribution protocol, and terminal diff UI compliant with $§20.16$ contract wording.
- `@repro/cli`: Unified developer CLI providing 6 developer verbs (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`), and operational security commands (`purge` crypto-shredding, `keys` rotate).

## 2. Invariant Contracts
- `N-05`: Execution Match Rate $R_{em} \ge 90.0\%$ trên Supported Execution Classes.
- `SEC-008`: Bounded buffer query result truncation tại tối đa $100\text{ rows} / 64\text{ KB}$.
- `SEC-016`: Crypto-shredding Key Custody DEK (GDPR Điều 17).
- `SEC-027`: HMAC Digest verification TRƯỚC KHI parse payload capsule.
- `SEC-037`: `@repro/node` có 0 external production dependencies.
- `SEC-042` & `SEC-043`: POSIX permissions `0600`/`0700` và Git Guard chặn rò rỉ `.repro/`.
- `E9`: Replay runtime cấm tuyệt đối việc fallback gọi ra mạng/database thật.
- `§20.16`: Chuẩn hóa ngôn từ hợp đồng: `💥 BUG REPRODUCED (✓ Execution matched)` vs `✓ Captured execution no longer reproduces`.
