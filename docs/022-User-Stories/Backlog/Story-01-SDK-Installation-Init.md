---
id: STORY-001
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-01-SDK-Capture.md"
---

# 📝 Story-01 — Cài Đặt và Khởi Tạo SDK In-Process `@repro/node`

## 1. User Story Statement

**As a** Software Engineer / SRE,  
**I want to** tích hợp `@repro/node` vào ứng dụng Node.js production chỉ với lệnh cài đặt npm và một dòng lệnh `repro.init()`,  
**So that** ứng dụng được trang bị khả năng capture tự động mà không cần tái cấu trúc kiến trúc hay thay đổi logic nghiệp vụ hiện có.

- **Parent Epic**: [Epic-01 — SDK Capture](../Epics/Epic-01-SDK-Capture.md)
- **Target Workstream**: `WS-1` (SDK & Capture)
- **Estimation**: 2.0 MD
- **Parent Requirements**: `FR-001`, `FR-002`, `FR-003`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Khởi tạo SDK trong mã nguồn ứng dụng
- **Given** ứng dụng Node.js chạy phiên bản 18, 20 hoặc 22 LTS,
- **When** developer import `@repro/node` và gọi `repro.init({ serviceName: 'checkout', storageEndpoint: 'https://store.corp' })` ở đầu entry file,
- **Then** SDK thiết lập thành công các hooks đánh chặn in-process và log thông điệp `[Repro] In-process recorder initialized for service "checkout"`.

### Scenario 2: Khởi tạo không xâm lấn qua Node CLI Preload
- **Given** ứng dụng Node.js không muốn thay đổi mã nguồn,
- **When** ứng dụng được khởi động bằng lệnh `node --require @repro/node/preload app.js` kèm biến môi trường `REPRO_STORAGE_ENDPOINT`,
- **Then** SDK tự động nạp cấu hình và kích hoạt recorder trước khi mã nguồn ứng dụng bắt đầu thực thi.

### Scenario 3: Xử lý lỗi an toàn không gián đoạn (Fail-Safe $§20.7$)
- **Given** SDK gặp lỗi cấu hình sai hoặc không thể kết nối tới storage collector,
- **When** ứng dụng xử lý các HTTP request production bình thường,
- **Then** SDK bắt toàn bộ lỗi nội bộ, ghi log cảnh báo ra stderr, và tuyệt đối không làm crash hoặc tăng độ trễ của request ứng dụng.
