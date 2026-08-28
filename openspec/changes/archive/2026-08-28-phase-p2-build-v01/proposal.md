# Proposal: Phase P2 — Build V0.1 Core Engine

## 1. Intent & Business Value
Chuyển đổi từ mã nguồn nghiên cứu thăm dò (Technical Spike Phase 0 tại `src/spike/`) sang xây dựng mã nguồn sản phẩm chính thức Repro V0.1 (`src/` và `packages/*`). Đạt chuẩn OSS công nghiệp, zero-dependency in-process SDK, bảo mật fail-closed 2 tầng, và chứng minh định lượng Execution Match Rate $R_{em} \ge 90.0\%$ trên Supported Execution Classes.

## 2. Scope & Target Packages
- Monorepo `npm workspaces` gồm 5 packages:
  - `@repro/core`: Schemas, Manifest v1, AES-256-GCM Envelope Encryption, Key Custody REST client, Capsule Reader/Writer.
  - `@repro/node`: In-process capture SDK (Node.js >= 22 native built-ins, zero external prod dependencies, async ring buffer, format-preserving redaction).
  - `@repro/replay`: Deterministic local replay engine (PostgreSQL/HTTP wire mocking, Virtual clock progression, Fail-closed L1 AST filter write defense).
  - `@repro/diff`: Two-tier equivalence verification engine, 6-step divergence attribution protocol, and terminal diff presentation.
  - `@repro/cli`: Unified developer CLI với 6 verbs (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) và operational admin commands (`purge`, `keys rotate`).
- Comprehensive Test Suite (`test/`): Unit, Integration, Security $T1$–$T12$, Fidelity $N\text{-}05$ benchmark ($21$ replays).

## 3. Success Criteria
- 15/15 User Stories (`STORY-001` .. `STORY-015`) hoàn thành và đạt DoD.
- 33/33 `SEC MUST-V0.1` passed, 12 kịch bản $T1$–$T12$ với Canary Sink đạt `escaped_side_effects == 0`.
- Automated $N\text{-}05$ Fidelity benchmark đạt $R_{em} \ge 90.0\%$ và Composite Gate $\ge 80.0\%$.
- 100% Zero-dependency trên package `@repro/node`.
