---
id: STORY-007
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-02-Capsule-Store.md"
---

# 📝 Story-07 — Tích Hợp Private Key Custody Store & Quản Lý Định Danh Khoá

## 1. User Story Statement

**As a** System Architect / Developer,  
**I want to** SDK và CLI giao tiếp an toàn với Private Key Custody Store ([ADR-012](../../030-Specs/Architecture/ADR-012-Key-Custody.md)) qua giao thức mTLS / API Token để đăng ký và lấy khoá giải mã DEK just-in-time,  
**So that** việc quản lý khoá được tập trung và mở đường cho tính năng Crypto-shredding.

- **Parent Epic**: [Epic-02 — Capsule & Store](../Epics/Epic-02-Capsule-Store.md)
- **Target Workstream**: `WS-2` & `WS-6`
- **Estimation**: 3.0 MD
- **Parent Requirements**: `FR-021`, `SEC-016`, `ADR-012`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Đăng Ký DEK Tại Key Custody Store Khi Capture
- **Given** SDK vừa mã hoá xong capsule payload bằng DEK,
- **When** SDK gửi request `POST /v1/keys` tới Key Custody Store kèm encrypted DEK và metadata tenant,
- **Then** Key Custody Store lưu trữ DEK an toàn và trả về mã định danh `key_id` (ví dụ `k_01HZX89J4V8BQ...`) để lưu vào `manifest.json`.

### Scenario 2: Lấy Khoá Giải Mã Just-In-Time Lúc Replay
- **Given** developer có quyền hợp lệ thực hiện lệnh `repro replay 1842`,
- **When** CLI gửi request `GET /v1/keys/:key_id` tới Key Custody Store kèm thông tin xác thực,
- **Then** Key Custody Store trả về DEK hợp lệ, CLI nạp khoá vào bộ nhớ cách ly và giải mã capsule payload.

### Scenario 3: Xử Lý Khi Key Custody Không Thể Kết Nối (Fail-Closed)
- **Given** Key Custody Store bị mất kết nối mạng hoặc không thể xác thực,
- **When** developer chạy `repro replay 1842`,
- **Then** CLI ném lỗi rõ ràng `🔒 ERROR: Cannot connect to Key Custody Store. Fail-closed.` và dừng tiến trình an toàn.
