# Run Plan: 2026-08-28-phase-p2-build-v01

Lane: code
Tier: T3 (Full OpenSpec / Analysis fan-out → GATE → Batched Implementation → Independent Multi-Pass Verification)

## 1. Tổng quan Triage & Căn cứ Kỹ thuật
- **Điểm Triage**: 3/4 (Q1=Có, Q2=Có, Q3=Không, Q4=Có).
- **Lý do**: Phase P2 xây dựng toàn bộ mã nguồn production V0.1 cho 9 workstreams (`WS-1`..`WS-9`), 5 packages trong monorepo, 5 Epics, 15 User Stories, và 33 yêu cầu bảo mật `MUST-V0.1`.
- **Tóm tắt phân tích 4 lens**:
  1. *Architect*: Thiết kế Monorepo `npm workspaces` 5 packages (`core`, `sdk`, `replay`, `diff`, `cli`), chuẩn hóa Data Flow 10 giai đoạn bằng TypeScript Interfaces chính xác.
  2. *Security*: Thiết lập 5 chốt chặn an ninh (`L1+L2` Fail-Closed, Redaction Format-Preserving, AES-256-GCM Envelope Encryption + Key Custody, Crypto-shredding TTL 30 ngày, Digest-Before-Parse `SEC-027`).
  3. *DevOps*: Thiết lập Node 22 native runtime, native `node:test` runner, zero-dependency SDK, Docker Test Infra với Mock Key Custody & Canary Sink, và supply chain hardening (SBOM CycloneDX, npm provenance).
  4. *QA*: Thiết lập Ma trận kiểm thử $1:1$ cho 15 User Stories, 12 kịch bản $T1$–$T12$, công thức đo lường tự động hóa $N\text{-}05$ ($R_{em} \ge 90.0\%$, Composite Gate $\ge 80.0\%$), và quy hoạch 5 phân vùng test suite.
  - *Mâu thuẫn giữa các lens*: **0 mâu thuẫn** — Cả 4 lens thống nhất $100\%$ về kiến trúc monorepo native, zero-dependency SDK, native `node:test`, và các chốt an ninh fail-closed.

---

## 2. Phases
| # | Phase | Agent / Vai trò | Song song? | Input | Output |
|---|-------|-----------------|:----------:|-------|--------|
| 1 | Intake & Triage | PM (Main loop) | Tuần tự | Yêu cầu gốc Phase P2 | `brief.md` |
| 2 | Analysis Fan-out | `architect`, `security-auditor`, `devops-engineer`, `quality-assurance` | **Song song** | SDD, ADRs, Epics, Stories, MTP | 4 files findings tại `findings/*.md` |
| 3 | GATE (bắt buộc) | PM + Sponsor `@TrisJr` | Tuần tự | `brief.md`, findings | `run-plan.md` + Gate Approval |
| 4 | Planning Artifacts | PM (Main loop) | Tuần tự | Gate Approved Plan | `tasks.md` cắt lô, OpenSpec change artifacts |
| 5 | Implementation | `software-engineer` (theo các lô độc lập) | Tuần tự từng lô | `tasks.md` từng lô | Source code tại `packages/*` và `test/*` |
| 6 | Verification & Close | `quality-assurance` (3 pass verify) + PM | **Song song 3 pass** | Source code & test suite | `verdict.md`, `cost.md`, Báo cáo tổng kết |

---

## 3. File Ownership Map
> **Nguyên tắc**: Các tập ownership PHẢI rời nhau tuyệt đối (disjoint). `tasks.md` và run-state thuộc quyền điều phối độc quyền của PM, không cấp cho worker nào.

| Worker / Batch | Sở hữu (Được phép ghi) | Cấm chạm |
|---|---|---|
| **PM (Main Loop)** | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/*`, `openspec/changes/phase-p2-build-v01/*` | Toàn bộ source code ngoài vùng run-state trong khi worker đang chạy |
| **Worker Lô 1** (Root & Core) | `package.json`, `tsconfig.base.json`, `.npmrc`, `packages/core/*` | `packages/sdk/*`, `packages/replay/*`, `packages/diff/*`, `packages/cli/*`, `test/*` |
| **Worker Lô 2** (SDK Capture) | `packages/sdk/*` | `packages/core/*`, `packages/replay/*`, `packages/diff/*`, `packages/cli/*`, `test/*` |
| **Worker Lô 3** (Replay Engine) | `packages/replay/*` | `packages/core/*`, `packages/sdk/*`, `packages/diff/*`, `packages/cli/*`, `test/*` |
| **Worker Lô 4** (Diff & Verify) | `packages/diff/*` | `packages/core/*`, `packages/sdk/*`, `packages/replay/*`, `packages/cli/*`, `test/*` |
| **Worker Lô 5** (CLI & Admin) | `packages/cli/*` | `packages/core/*`, `packages/sdk/*`, `packages/replay/*`, `packages/diff/*`, `test/*` |
| **Worker Lô 6** (Test Suite) | `test/*`, `infra/docker-compose.test.yml`, `scripts/*` | `packages/*` |
| **QA Verifier Pass 1** (Completeness) | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-completeness.md` | Read-only toàn bộ codebase |
| **QA Verifier Pass 2** (Correctness) | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-correctness.md` | Read-only toàn bộ codebase |
| **QA Verifier Pass 3** (Coherence) | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-coherence.md` | Read-only toàn bộ codebase |

---

## 4. Kế Hoạch Dispatch Theo Lô (Implementation Batches & Tool Call Budgets)

| Lô | Tên lô | Phạm vi file & Task | Worker Role | Dispatch | Ngân sách Tool Call |
|---|---|---|:---:|:---:|:---:|
| **Lô 1.1** | Monorepo Root & Core Types | Root `package.json`, `tsconfig.base.json`, `packages/core/package.json`, `packages/core/src/types/*` (`STORY-005`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 1.2** | Core Crypto & Capsule I/O | `packages/core/src/crypto/*`, `packages/core/src/capsule/*`, `packages/core/src/custody/*` (`STORY-005`, `006`, `007`, `008`, `SEC-015`, `SEC-027`) | `software-engineer` | Tuần tự | **75 tool calls** *(gồm +15 mutation-test SEC-027)* |
| **Lô 2.1** | SDK Interceptors & Context | `packages/sdk/package.json`, `packages/sdk/src/context/*`, `packages/sdk/src/interceptors/*` (`STORY-001`, `002`, `U-01`, `U-02`, `U-03`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 2.2** | SDK Redaction & Bounded Buffer | `packages/sdk/src/redaction/*`, `packages/sdk/src/buffer/*`, `packages/sdk/src/index.ts` (`STORY-003`, `004`, `SEC-002`, `SEC-008`) | `software-engineer` | Tuần tự | **75 tool calls** *(gồm +15 mutation-test SEC-008)* |
| **Lô 3.1** | Replay Adapters & Virtual Clock | `packages/replay/package.json`, `packages/replay/src/adapters/*`, `packages/replay/src/clock/*` (`STORY-010`, `011`, `ADR-003`, `ADR-010`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 3.2** | Replay Engine & L1 Write Defense | `packages/replay/src/engine/*`, `packages/replay/src/defense/*`, `packages/replay/src/trigger/*` (`STORY-009`, `012`, `ADR-005`, `E9`) | `software-engineer` | Tuần tự | **75 tool calls** *(gồm +15 mutation-test L1 AST filter)* |
| **Lô 4.1** | Two-Tier Verification Engine | `packages/diff/package.json`, `packages/diff/src/normalizers/*`, `packages/diff/src/engine/*` (`STORY-013`, `ADR-006`, `ACG-01`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 4.2** | Divergence Attribution & Diff UI | `packages/diff/src/attribution/*`, `packages/diff/src/formatter/*`, `packages/diff/src/index.ts` (`STORY-014`, `STORY-015`, `ADR-011`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 5.1** | Unified Developer CLI (6 Verbs) | `packages/cli/package.json`, `packages/cli/src/commands/*`, `packages/cli/src/bin.ts` (`EPIC-05`, `STORY-015`, `SEC-042`, `SEC-043`) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 6.1** | Test Suite: Unit & Integration | `test/unit/*`, `test/integration/*`, `test/harness/*`, `scripts/*` (15 Stories Test Traceability) | `software-engineer` | Tuần tự | **60 tool calls** |
| **Lô 6.2** | Test Suite: Security & Fidelity Bench | `test/security/*`, `test/fidelity/*`, `infra/docker-compose.test.yml` (12 kịch bản $T1$–$T12$, $N\text{-}05$ benchmark runner) | `software-engineer` | Tuần tự | **75 tool calls** *(gồm +15 Canary test)* |
| **Verify Pass 1** | Completeness Pass | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-completeness.md` | `quality-assurance` | Song song | **45 tool calls** |
| **Verify Pass 2** | Correctness Pass | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-correctness.md` | `quality-assurance` | Song song | **45 tool calls** |
| **Verify Pass 3** | Coherence Pass | `docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict-coherence.md` | `quality-assurance` | Song song | **45 tool calls** |

**Tổng ngân sách ước tính**: ~815 tool calls phân bổ trên 11 lô implementation và 3 pass verification.

---

## 5. Danh Sách Artifact Tạo/Sửa Ngoài Run-State
1. `package.json`, `tsconfig.base.json`, `.npmrc` (Root configuration monorepo).
2. `packages/core/` (Core schemas, manifest v1, envelope crypto, key custody client).
3. `packages/sdk/` (`@repro/node` in-process capture SDK, zero-dependency).
4. `packages/replay/` (`@repro/replay` deterministic local replay engine, wire mocking, L1 write defense).
5. `packages/diff/` (`@repro/diff` two-tier equivalence verification & 6-step attribution).
6. `packages/cli/` (`@repro/cli` unified CLI with 6 developer verbs + operational admin verbs).
7. `test/` (Comprehensive 5-level test suite: unit, integration, e2e, security $T1$–$T12$, fidelity $N\text{-}05$).
8. `infra/docker-compose.test.yml`, `scripts/` (Docker test environment & utility scripts).

---

## 6. Assumptions & Rủi Ro Tiềm Ẩn
- **Assumption 1**: Node.js built-ins (`crypto`, `async_hooks`, `http`, `https`) cung cấp đầy đủ primitive cho SDK mà không cần dependency bên ngoài.
  - *Nếu sai*: Sẽ phải bổ sung micro-dependencies vào SDK, cần security review đặc biệt để tránh supply chain risk (`SEC-037`).
- **Assumption 2**: AST SQL Classifier và regex filter tại L1 có thể bắt được $100\%$ các lệnh WRITE thông thường trước khi chạm database mock.
  - *Nếu sai*: L2 OS/Container sandbox `--internal` đóng vai trò phòng tuyến fail-closed thứ 2 ngăn chặn triệt để mọi side-effect rò rỉ.

---

## 7. Gate Submission & Phán Quyết
- **Trình ngày**: 2026-08-28
- **Người phê duyệt**: `@TrisJr` (Sponsor / Product Owner)
- **Kết quả**: ✅ **DUYỆT TOÀN VĂN KẾ HOẠCH VÀ CHO PHÉP BẮT ĐẦU THỰC THI**
- **Điều chỉnh của anh**: Không — thực thi đầy đủ theo 11 lô và 3 pass verification đã trình.
