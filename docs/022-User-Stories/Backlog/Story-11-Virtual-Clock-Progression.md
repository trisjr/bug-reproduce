---
id: STORY-011
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-03-Replay-Runtime.md"
---

# 📝 Story-11 — Tịnh Tiến Thời Gian Ảo Tất Định (Virtual Clock Progression)

## 1. User Story Statement

**As a** Software Engineer,  
**I want to** hệ thống đồng hồ (`Date.now()`, `new Date()`) và timers (`setTimeout`, `setInterval`) trong lúc replay được neo và tịnh tiến ảo tất định ([ADR-010](../../030-Specs/Architecture/ADR-010-Bounded-Determinism-Scope.md)),  
**So that** các lỗi logic phụ thuộc vào thời gian (Time-dependent bugs, ví dụ voucher hết hạn, token expiry) được tái hiện chính xác $100\%$ tại local.

- **Parent Epic**: [Epic-03 — Replay Runtime](../Epics/Epic-03-Replay-Runtime.md)
- **Target Workstream**: `WS-3` (Replay Runtime)
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-031`, `ADR-010`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Khởi Tạo Đồng Hồ Tại Capture Timestamp Gốc
- **Given** capsule ghi nhận một request xảy ra vào lúc `2026-08-15T10:30:00.000Z`,
- **When** ứng dụng local gọi `Date.now()` trong quá trình replay,
- **Then** giá trị trả về khớp chính xác với timestamp capture gốc bất kể thời gian thực tế trên máy developer là ngày nào.

### Scenario 2: Tịnh Tiến Thời Gian Ảo Theo Microtasks (Virtual Clock Model)
- **Given** mã nguồn thực thi logic tính toán thời lượng giữa 2 bước (`const t1 = Date.now(); await doAsync(); const t2 = Date.now();`),
- **When** Virtual Clock tịnh tiến ảo theo từng interaction tick,
- **Then** `t2 - t1` phản ánh đúng độ trễ ảo tương ứng đã ghi nhận (không bị trả về 0 như mô hình freeze hoàn toàn), giúp logic so sánh thời lượng chạy chính xác.

### Scenario 3: Điều Khiển Bộ Đếm Timers Tất Định
- **Given** ứng dụng sử dụng `setTimeout(fn, 5000)` để kiểm tra timeout,
- **When** replay runtime điều khiển event loop ảo,
- **Then** callback `fn` được kích hoạt đúng theo chuỗi interaction tương ứng mà không phải chờ đợi 5 giây thời gian thực.
