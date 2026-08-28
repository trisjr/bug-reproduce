# Tasks: 2026-08-28-phase-p2-build-v01

> **Chủ quyền**: PM độc quyền tick trạng thái `[ ]` $\to$ `[x]` sau khi kiểm tra `FILES_TOUCHED` và `STATUS: DONE` của từng worker contract. Worker không tự tick file này.

## Batch 1: Monorepo Root & Core Foundation (`@repro/core`)
- [x] **Lô 1.1: Root Monorepo & Core Types** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Khởi tạo root `package.json` với `npm workspaces` cho 5 packages (`core`, `sdk`, `replay`, `diff`, `cli`).
  - [x] Cấu hình `tsconfig.base.json` (ES2022, NodeNext) và `.npmrc` (engine-strict=true).
  - [x] Khởi tạo `packages/core/package.json` và `packages/core/tsconfig.json`.
  - [x] Định nghĩa Ubiquitous Language TypeScript types tại `packages/core/src/types/`: `manifest.ts`, `interaction.ts`, `runtime.ts`, `verification.ts`.
- [x] **Lô 1.2: Core Crypto, Schemas & Capsule I/O** (`software-engineer` | Ngân sách: 75 tool calls)
  - [x] Hiện thực `packages/core/src/schemas/`: `manifest.schema.ts`, `interaction.schema.ts`, `redaction.schema.ts`.
  - [x] Hiện thực `packages/core/src/crypto/`: `envelope.ts` (AES-256-GCM, CSPRNG DEK), `integrity.ts` (HMAC-SHA256 Digest-Before-Parse `SEC-027`), `shredding.ts`.
  - [x] Hiện thực `packages/core/src/capsule/`: `writer.ts` (JSONL streaming serializer, tar.gz packager), `reader.ts` (zip-slip safe, digest verify), `validator.ts`.
  - [x] Hiện thực `packages/core/src/custody/`: `client.ts` (mTLS/Bearer Key Custody REST client), `memory-vault.ts` (auto-zeroize).
  - [x] Tạo entry point `packages/core/src/index.ts`.

## Batch 2: In-Process Capture SDK (`@repro/node`)
- [x] **Lô 2.1: SDK Context & Interceptors** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Khởi tạo `packages/sdk/package.json` với ZERO external production dependencies (`SEC-037`).
  - [x] Hiện thực `packages/sdk/src/context/`: `async-storage.ts` (Node.js AsyncLocalStorage execution tracking), `execution-id.ts` (Monotonic UUIDv7).
  - [x] Hiện thực `packages/sdk/src/interceptors/pg/`: `client-hook.ts`, `pool-hook.ts`, `native-guard.ts` (PostgreSQL Client/Pool query interceptor).
  - [x] Hiện thực `packages/sdk/src/interceptors/http/`: `inbound-hook.ts` (Inbound HTTP request listener), `outbound-hook.ts` (Outbound http/https boundary).
  - [x] Hiện thực `packages/sdk/src/interceptors/clock/`: `clock-hook.ts` (Date.now & hrtime observer).
- [x] **Lô 2.2: SDK Redaction Pipeline & Ring Buffer** (`software-engineer` | Ngân sách: 75 tool calls)
  - [x] Hiện thực `packages/sdk/src/redaction/`: `rules.ts` (Default PII/Token/PAN patterns), `masker.ts` (Format-preserving masking `SEC-002`), `audit-trail.ts`.
  - [x] Hiện thực `packages/sdk/src/buffer/`: `ring-buffer.ts` (Bounded circular in-memory buffer with drop-oldest `ADR-008`), `size-guard.ts` (`SEC-008` 100 rows / 64 KB truncation), `trigger-listener.ts` (5xx / error capture trigger).
  - [x] Tạo entry point `packages/sdk/src/index.ts` xuất API: `repro.init()`, `repro.capture()`, `repro.wrapHandler()`.

## Batch 3: Deterministic Replay Engine & Defense (`@repro/replay`)
- [x] **Lô 3.1: Replay Adapters & Virtual Clock** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Khởi tạo `packages/replay/package.json` và `packages/replay/tsconfig.json`.
  - [x] Hiện thực `packages/replay/src/adapters/`: `db-mock.ts` (PostgreSQL query matcher & response supplier), `http-mock.ts` (Outbound HTTP responder), `flag-mock.ts`.
  - [x] Hiện thực `packages/replay/src/clock/`: `virtual-clock.ts` (Deterministic virtual clock frozen at T0 with monotonic progression), `timer-patch.ts` (setTimeout/setInterval virtualizer).
- [x] **Lô 3.2: Replay Engine, Trigger & L1 Write Defense** (`software-engineer` | Ngân sách: 75 tool calls)
  - [x] Hiện thực `packages/replay/src/defense/`: `l1-ast-filter.ts` (AST SQL classifier: Allow SELECT, Deny WRITE `ADR-005`), `http-verb-guard.ts` (Deny non-idempotent HTTP methods), `fallback-guard.ts` (E9 rule: Ban real network fallback).
  - [x] Hiện thực `packages/replay/src/engine/`: `session.ts` (ReplaySession state machine), `loader.ts` (Capsule loader & interaction indexer), `local-tracer.ts` (Local interaction tracer).
  - [x] Hiện thực `packages/replay/src/trigger/`: `http-injector.ts` (Synthetic inbound request dispatcher `Story-09`).
  - [x] Tạo entry point `packages/replay/src/index.ts`.

## Batch 4: Verification & Execution Diff Engine (`@repro/diff`)
- [x] **Lô 4.1: Normalization & Two-Tier Equivalence** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Khởi tạo `packages/diff/package.json` và `packages/diff/tsconfig.json`.
  - [x] Hiện thực `packages/diff/src/normalizers/`: `sql.ts` (Canonical SQL whitespace & identifier normalizer), `url.ts` (Query param alphabetizer), `json.ts` (Deterministic key ordering & float rounder), `headers.ts` (Header case-insensitive allowlist filter).
  - [x] Hiện thực `packages/diff/src/engine/`: `comparator.ts` (Two-tier comparator), `tier1-gate.ts` (Strict byte equality), `tier2-rubric.ts` (Semantic equivalence rubric `ADR-006`).
- [x] **Lô 4.2: Divergence Attribution & Diff UI** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Hiện thực `packages/diff/src/attribution/`: `classifier.ts` (6-step divergence attribution protocol: Code Change vs Environment Drift vs Redaction Artifact vs Unattributed), `drift-detector.ts`.
  - [x] Hiện thực `packages/diff/src/formatter/`: `terminal-diff.ts` (Two-column colorized side-by-side terminal diff `ADR-011`), `summary-report.ts` (`§20.16` contract wording).
  - [x] Tạo entry point `packages/diff/src/index.ts`.

## Batch 5: Unified Developer CLI (`@repro/cli`)
- [x] **Lô 5.1: CLI 6 Verbs & Operational Commands** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Khởi tạo `packages/cli/package.json` với bin executable `repro`.
  - [x] Hiện thực `packages/cli/src/commands/`:
    - `list.ts`: `repro list` (Browse local & remote capsules).
    - `pull.ts`: `repro pull <id>` (Pull capsule with `chmod 0600` & git guard `SEC-042`, `SEC-043`).
    - `inspect.ts`: `repro inspect <id>` (View manifest, interactions metadata).
    - `replay.ts`: `repro replay <id>` (Execute deterministic local replay).
    - `diff.ts`: `repro diff <id>` (Show two-column execution diff).
    - `verify.ts`: `repro verify <id>` (Compare before/after fix with exact contract wording).
    - `purge.ts`: `repro purge` (Crypto-shred capsule DEKs at Key Custody `Story-08`).
    - `keys.ts`: `repro keys rotate` (Key lifecycle management).
  - [x] Tạo CLI entry point `packages/cli/src/bin.ts`.

## Batch 6: Test Harness & Fidelity Benchmark (`test/`)
- [x] **Lô 6.1: Unit & Integration Test Suites** (`software-engineer` | Ngân sách: 60 tool calls)
  - [x] Hiện thực `test/harness/`: `mock-key-custody.ts` (In-memory Key Custody server with mTLS/token auth), `mock-http-api.ts`, `sample-app.ts`.
  - [x] Hiện thực `test/unit/`: Test suites cho Core types, Crypto envelope, Schemas, Ring buffer, Redaction, Normalizers, Virtual clock.
  - [x] Hiện thực `test/integration/`: Test suites cho In-process SDK capture -> Capsule package -> Local Replay -> Verification diff.
- [x] **Lô 6.2: Security $T1$–$T12$ & Fidelity $N\text{-}05$ Benchmark** (`software-engineer` | Ngân sách: 75 tool calls)
  - [x] Hiện thực `test/security/`: 33 `SEC MUST-V0.1` tests (`TC-SEC-001..048`), 12 kịch bản $T1$–$T12$ với Canary Sink assertion (`escaped_side_effects == 0`), và adversarial fuzzing tests.
  - [x] Hiện thực `test/fidelity/`: 11 sealed scenario manifests (`SC-1`..`SC-11`), $N\text{-}05$ automated benchmark runner ($21$ replays, $R_{em} \ge 90.0\%$, Composite Gate $\ge 80.0\%$).
  - [x] Tạo `infra/docker-compose.test.yml` và script chạy test `scripts/test-all.js`.
## Verification & Close (Bước 6)
- [ ] **Pass 1: Completeness Verification** (`quality-assurance` | Ngân sách: 45 tool calls)
  - [ ] Đối chiếu 100% tasks trong `tasks.md` và 15 User Stories (`STORY-001`..`STORY-015`). Ghi `verdict-completeness.md`.
- [ ] **Pass 2: Correctness Verification** (`quality-assurance` | Ngân sách: 45 tool calls)
  - [ ] Chạy và đối chiếu toàn bộ test suite: Unit, Integration, 33 `SEC MUST`, 12 kịch bản $T1$–$T12$, $N\text{-}05$ Fidelity benchmark. Ghi `verdict-correctness.md`.
- [ ] **Pass 3: Coherence Verification** (`quality-assurance` | Ngân sách: 45 tool calls)
  - [ ] Kiểm tra tính nhất quán mã nguồn, type safety, DCO sign-off, license compliance, không có dead code/throwaway spike artifacts trong production package. Ghi `verdict-coherence.md`.
- [ ] **PM Summary, Cost Measurement & Close** (PM Main Loop)
  - [ ] Tổng hợp `verdict.md`.
  - [ ] Đo lường chi phí `cost.md` (turns, token cache_read, tool calls).
  - [ ] Báo cáo tổng kết hoàn tất Phase P2 trình Sponsor `@TrisJr`.
