---
id: MOC-SPECS
type: moc
status: approved
project: repro
owner: "@architect"
created: 2026-08-14
updated: 2026-08-28
---

# 📂 030-Specs Map of Content (MOC)

Đặc tả kỹ thuật: thiết kế hệ thống, quyết định kiến trúc, và bảo mật. Xem thêm [Documentation Master Index](../000-Index.md).

---

## 🔬 Technical Spec

- [Spec-Spike-Protocol](./Spec-Spike-Protocol.md) — **Spike Protocol cho Phase 0** (2026-08-15). Làm cho technical spike cho ra được pass/fail.
- [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) — Kế hoạch đo lường thực nghiệm Phase 0.
- [Report-Spike-Phase-0](../035-QA/Reports/Report-Spike-Phase-0.md) & [Perf-Spike-Phase-0](../035-QA/Performance/Perf-Spike-Phase-0.md) — Báo cáo kết quả thực nghiệm hoàn tất 100% Phase 0.

---

## 🏛️ Architecture

### System Design
- [SDD-Repro](./Architecture/SDD-Repro.md) — **System Design Document**: Kiến trúc hệ thống, format v1, authn/authz, 25 technical unknowns (đã đóng toàn bộ các blocker cốt lõi tại Phase P1).

### Architecture Decision Records (13 ADRs)

Toàn bộ **13 ADRs** đã được phê duyệt chính thức (`status: approved`):

| ADR ID | Quyết Định Cốt Lõi | Deliverable Path |
|---|---|---|
| **`ADR-001`** | Replay **execution**, không phải environment | [ADR-001-Replay-Execution-Not-Environment.md](./Architecture/ADR-001-Replay-Execution-Not-Environment.md) |
| **`ADR-002`** | Repro Capsule là artifact portable và là **format contract v1** | [ADR-002-Repro-Capsule-Format-Contract.md](./Architecture/ADR-002-Repro-Capsule-Format-Contract.md) |
| **`ADR-003`** | Record/replay **kết quả query**, không snapshot database | [ADR-003-Database-Record-Replay-Not-Snapshot.md](./Architecture/ADR-003-Database-Record-Replay-Not-Snapshot.md) |
| **`ADR-004`** | Record/replay input ngoài tại **dependency boundary** | [ADR-004-Record-Replay-External-Inputs-At-Boundary.md](./Architecture/ADR-004-Record-Replay-External-Inputs-At-Boundary.md) |
| **`ADR-005`** | **Default-deny write side effects** trong lúc replay (L1+L2) | [ADR-005-Default-Deny-Write-Side-Effects.md](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) |
| **`ADR-006`** | Execution verification bằng **phán quyết tương đương (Equivalence)** | [ADR-006-Execution-Verification-By-Equivalence.md](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) |
| **`ADR-007`** | **In-process SDK interception** cho Node.js applications | [ADR-007-In-Process-SDK-Interception.md](./Architecture/ADR-007-In-Process-SDK-Interception.md) |
| **`ADR-008`** | **Async, bounded, failure-triggered capture** | [ADR-008-Async-Bounded-Failure-Triggered-Capture.md](./Architecture/ADR-008-Async-Bounded-Failure-Triggered-Capture.md) |
| **`ADR-009`** | **Private self-hosted topology** cho recorder và storage | [ADR-009-Private-Self-Hosted-Topology.md](./Architecture/ADR-009-Private-Self-Hosted-Topology.md) |
| **`ADR-010`** | **Bounded determinism scope** (Virtual Clock Model) | [ADR-010-Bounded-Determinism-Scope.md](./Architecture/ADR-010-Bounded-Determinism-Scope.md) |
| **`ADR-011`** | Execution Diff là **kết quả hạng nhất** của reproduction thất bại | [ADR-011-Execution-Diff-First-Class.md](./Architecture/ADR-011-Execution-Diff-First-Class.md) |
| **`ADR-012`** | **Key Custody Architecture & Crypto-Shredding Protocol** ($U\text{-}06d$) | [ADR-012-Key-Custody.md](./Architecture/ADR-012-Key-Custody.md) |
| **`ADR-013`** | **Open Source License (Apache-2.0) & Contribution Model** ($LG1$) | [ADR-013-OSS-License-And-Contribution-Model.md](./Architecture/ADR-013-OSS-License-And-Contribution-Model.md) |

---

## 🛡️ Security & Legal Specs

- [Spec-Security-Repro-Threat-Model](./Security/Spec-Security-Repro-Threat-Model.md) — Threat Model đầy đủ: 19 threats, 43 security requirements (33 MUST-V0.1), L2 Container Sandbox, GDPR Right-to-Erasure review.
- [Spec-Security-Data-Retention-Legal-Review](./Security/Spec-Security-Data-Retention-Legal-Review.md) — **Hồ sơ Giải trình Pháp lý Crypto-shredding & TTL 30 ngày** (Task `LG3` — sẵn sàng gửi luật sư bên ngoài).
- [Spec-Security-Data-Processing-Agreement](./Security/Spec-Security-Data-Processing-Agreement.md) — **Mẫu Thỏa thuận Xử lý Dữ liệu (DPA)** chuẩn bị cho Design Partners ở Phase P4 (Task `LG4`).
- [Audit-Spike-Code-Phase-0](./Security/Audit-Spike-Code-Phase-0.md) — Báo cáo kiểm toán bảo mật mã nguồn spike.

---

## 🔗 Liên Kết Liên Quan

- [Documentation Master Index](../000-Index.md)
- [Requirements-MOC](../020-Requirements/Requirements-MOC.md)
- [QA-MOC](../035-QA/QA-MOC.md)
