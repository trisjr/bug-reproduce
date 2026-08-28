---
id: EPIC-01
type: epic
status: approved
project: repro
owner: "@product-owner"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/PRD-Repro.md"
---

# 🚀 Epic-01 — In-Process SDK & Bounded Production Capture

## 1. Overview & Business Value

Epic này hiện thực gói thư viện `@repro/node` chạy in-process bên trong ứng dụng Node.js production. SDK có nhiệm vụ theo dõi, đánh chặn và ghi nhận 8 nhóm tương tác ngoại vi cốt lõi khi phát sinh lỗi thực thi (*Failure-Triggered*), áp dụng bộ lọc bảo mật Redaction, và đóng gói thành bản ghi an toàn mà không làm chậm ứng dụng production ($Overhead < 5.0\%$).

- **Parent Requirements**: [PRD-Repro §5.1 & §5.2](../../020-Requirements/PRD-Repro.md) (`FR-001` .. `FR-026`).
- **Target Workstream**: `WS-1` (SDK & Capture) & `WS-6` (Security MUST-V0.1).
- **Target Persona**: SRE / DevOps & Software Engineer.

---

## 2. In-Scope User Stories

1. **`Story-01`**: Cài đặt và Khởi tạo SDK In-Process (`npm install @repro/node` + `repro.init()`).
2. **`Story-02`**: Capture Tự động 8 Nhóm Tương tác Ngoại vi (HTTP, PostgreSQL, Timers, Outbound API, Feature Flags, Stack Trace, Git Metadata, Runtime Env).
3. **`Story-03`**: Pipeline Khử Dữ liệu Nhạy cảm (Redaction) Format-Preserving & Bảng Kê Trích Xuất.
4. **`Story-04`**: Quản lý Bộ Nhớ Đệm Bất Đồng Bộ (Async Bounded In-Memory Buffer & $SEC\text{-}008$ Truncation).

---

## 3. High-Level Acceptance Criteria (DoD)

- [ ] **AC-01 (Integration Friction)**: Cài đặt và kích hoạt thành công SDK chỉ với 2 dòng mã nguồn hoặc cờ preload `node --require @repro/node`.
- [ ] **AC-02 (Zero Disruption)**: Mọi ngoại lệ nội bộ trong SDK đều được bắt trọn vẹn (fail-safe), không bao giờ làm gián đoạn request của ứng dụng production ($§20.7$).
- [ ] **AC-03 (Overhead Ceiling)**: Độ trễ gia tăng trên đường discard $< 5.0\%$ (thực nghiệm $\le 2.0\%$), memory RSS $< 50\text{ MB}$.
- [ ] **AC-04 (Redaction Compliance)**: 100% các trường nhạy cảm trong Header/Body được thay thế bằng token định dạng, cờ `redacted: true` được ghi nhận.
- [ ] **AC-05 (Size Constraint)**: Kết quả DB query vượt quá $100\text{ rows} / 64\text{ KB}$ được truncate an toàn và đánh dấu cờ `truncated: true`.
