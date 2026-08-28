---
id: MOC-020
type: moc
status: approved
project: repro
owner: "@business-analyst"
created: 2026-02-04
updated: 2026-08-28
---

# 📂 020-Requirements Map of Content (MOC)

Trung tâm quản lý Yêu cầu sản phẩm Repro V0.1. Xem thêm [Documentation Master Index](../000-Index.md).

---

## 📍 Danh Mục Tài Liệu Yêu Cầu

### 🏢 020.10 — Business Requirements (BRD)
- [BRD-001 — Problem Statement](./BRD/BRD-001-Problem-Statement.md) — Định nghĩa vấn đề "cannot reproduce", phân tích vì sao observability và clone production thất bại, và ranh giới sản phẩm.

### 📦 020.20 — Product Requirements (PRD)
- [PRD-Repro](./PRD-Repro.md) — **Core Product Spec V0.1**: Scope/MVP, Functional Requirements `FR-001`…`FR-082`, Supported Execution Class ($ACG\text{-}07$), CLI operational verbs (`FR-053a..d`), Success Metrics ($N\text{-}05$).

### 👤 020.30 — Use Cases & User Models
- [UC-01 — Capture Failed Production Execution](./Use-Cases/UC-01-Capture-Failed-Production-Execution.md) — SRE / DevOps / Software Engineer.
- [UC-02 — Replay Capsule Locally](./Use-Cases/UC-02-Replay-Capsule-Locally.md) — Software Engineer (Cập nhật Rubric 2 tầng & Supported Execution Class).
- [UC-03 — Read Execution Diff](./Use-Cases/UC-03-Read-Execution-Diff.md) — Software Engineer.
- [UC-04 — Verify Fix](./Use-Cases/UC-04-Verify-Fix.md) — Software Engineer.
- [UC-05 — Browse And Inspect Capsules](./Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) — Software Engineer + QA Engineer.
- User Persona Analysis: [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md).

### 🛡️ 020.40 — Non-Functional Requirements (NFR)
- [NFR-Repro](./NFR-Repro.md) — **Non-Functional Requirements V0.1**: Chốt hệ thống cam kết $N\text{-}05$ đa tầng ($\ge 90.0\%$ In-Class, $\ge 80.0\%$ Composite, $\ge 60.0\%$ Diagnostic), $N\text{-}06..09$, nâng cấp 4 $ACG$ ($ACG\text{-}01/02/03/07$) thành định nghĩa sản phẩm chính thức.

---

## 🔗 Liên Kết Tới Backlog & Kế Hoạch

- [User Stories MOC (Epics & Stories)](../022-User-Stories/Stories-MOC.md)
- [Architecture MOC (ADRs & SDD)](../030-Specs/Specs-MOC.md)
- [Master Test Plan V0.1](../035-QA/Test-Plans/MTP-Repro-V0.1.md)
- [Documentation Master Index](../000-Index.md)
