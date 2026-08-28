---
id: STORY-009
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-03-Replay-Runtime.md"
---

# 📝 Story-09 — Nạp Capsule & Kích Hoạt Inbound Request Replay Cục Bộ

## 1. User Story Statement

**As a** Software Engineer,  
**I want to** chạy lệnh `repro replay 1842` để runtime tự động khởi tạo môi trường nạp request $U0$ vào server Node.js local,  
**So that** ứng dụng bắt đầu thực thi lại chính xác chuỗi logic nghiệp vụ đã gây ra lỗi ở production.

- **Parent Epic**: [Epic-03 — Replay Runtime](../Epics/Epic-03-Replay-Runtime.md)
- **Target Workstream**: `WS-3` (Replay Runtime)
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-027`, `FR-028`, `FR-050`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Khởi Tạo Replay Runner & Nạp Inbound Request
- **Given** developer đã pull capsule `repro pull 1842` và server local đang chạy,
- **When** developer thực thi lệnh `repro replay 1842`,
- **Then** Replay Runtime giải mã capsule, trích xuất $U0$ và gửi synthetic HTTP request tương ứng (Method, Path, Canonical Headers, Body) tới endpoint local.

### Scenario 2: Kiểm Tra Trôi Lệch Môi Trường Trước Khi Chạy (Drift Warning)
- **Given** Git commit hash của mã nguồn local khác với commit hash ghi trong capsule manifest,
- **When** runtime khởi động trước khi replay,
- **Then** CLI in ra cảnh báo `⚠️ Warning: Code mismatch (Production: 8f31ac2 vs Local: 92ab381). Replay may diverge.` nhưng vẫn tiếp tục thực thi.

### Scenario 3: Từ Chối Replay Khi Version Format Không Tương Thích (Major Mismatch)
- **Given** capsule được tạo bởi phiên bản format major không hỗ trợ (ví dụ `2.0.0`),
- **When** runtime v1 cố gắng đọc manifest,
- **Then** runtime từ chối nạp capsule với mã lỗi `UNSUPPORTED_FORMAT_VERSION` và hướng dẫn người dùng cập nhật phiên bản CLI.
