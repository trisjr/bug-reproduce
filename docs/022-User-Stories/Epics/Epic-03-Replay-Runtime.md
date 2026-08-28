---
id: EPIC-03
type: epic
status: approved
project: repro
owner: "@product-owner"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/PRD-Repro.md"
---

# 🔄 Epic-03 — Deterministic Local Replay Runtime & Fail-Closed Write Defense

## 1. Overview & Business Value

Epic này xây dựng động cơ **Replay Runtime** trên môi trường local của developer. Runtime có nhiệm vụ nạp capsule, phát lại Inbound Request, đánh chặn các lệnh gọi Database/HTTP ngoại vi để trả về dữ liệu sản thi đã ghi lại, tịnh tiến Virtual Clock tất định ([ADR-010](../../030-Specs/Architecture/ADR-010-Bounded-Determinism-Scope.md)), và áp dụng lá chắn **Default-Deny Write 2 tầng ($L1+L2$)** ([ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md)) để ngăn chặn 100% rò rỉ side-effect ra ngoài production.

- **Parent Requirements**: [PRD-Repro §5.3](../../020-Requirements/PRD-Repro.md) (`FR-027` .. `FR-038`).
- **Target Workstream**: `WS-3` (Replay Runtime) & `WS-6` (Security MUST-V0.1).
- **Target Persona**: Software Engineer & QA Engineer.

---

## 2. In-Scope User Stories

1. **`Story-09`**: Nạp Capsule và Khởi tạo Môi trường Replay Cục bộ (Inbound HTTP Trigger Injection).
2. **`Story-10`**: Đánh chặn và Trả Dữ liệu Ghi lại cho PostgreSQL & External HTTP API (Wire Mocking).
3. **`Story-11`**: Tịnh tiến Thời gian Ảo Tất định (Deterministic Virtual Clock Progression & Microtask Ordering).
4. **`Story-12`**: Lá chắn Chống Tác Dụng Phụ Fail-Closed 2 Tầng ($L1$ AST Query Filter + $L2$ OS Process Sandbox).

---

## 3. High-Level Acceptance Criteria (DoD)

- [ ] **AC-01 (Deterministic Wire Mock)**: Trả về chính xác kết quả DB query và HTTP response đã ghi lại tương ứng với fingerprint của interaction hiện tại.
- [ ] **AC-02 (Virtual Time Fidelity)**: `Date.now()` và các bộ đếm thời gian trả về giá trị tịnh tiến ảo tất định dựa trên timestamp capture gốc, tái hiện chính xác time-dependent bugs.
- [ ] **AC-03 (Side-Effect Immunity)**: Chạy qua ma trận 12 kịch bản tấn công/side-effect ($T1$–$T12$), Canary Sink độc lập xác nhận `escaped_side_effects == 0`.
- [ ] **AC-04 (Process-Level Egress Sandbox)**: Sử dụng Node.js `--permission --deny-child-process` để triệt tiêu hoàn toàn khả năng gọi lệnh hệ thống như `curl` ($T8\text{-}b$).
- [ ] **AC-05 (Unmatched Fallback Ban)**: Gặp interaction lạ chưa ghi nhận $\to$ ném lỗi phân kỳ `incomplete-capture`, tuyệt đối không fallback gọi hệ thống thật.
