---
id: STORY-003
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-01-SDK-Capture.md"
---

# 📝 Story-03 — Pipeline Khử Dữ Liệu Nhạy Cảm (Redaction) Format-Preserving

## 1. User Story Statement

**As a** Security Auditor / SRE,  
**I want to** toàn bộ PII, mật khẩu, authorization tokens và dữ liệu thẻ thanh toán được tự động khử trước khi ghi vào capsule mà vẫn giữ nguyên cấu trúc kiểu dữ liệu,  
**So that** dữ liệu sản thi nhạy cảm không bị rò rỉ ra ngoài môi trường developer trong khi logic nghiệp vụ vẫn có thể thực thi replay.

- **Parent Epic**: [Epic-01 — SDK Capture](../Epics/Epic-01-SDK-Capture.md)
- **Target Workstream**: `WS-1` & `WS-6` (Security MUST-V0.1)
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-019` .. `FR-023`, `SEC-001` .. `SEC-007`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Khử Header Nhạy Cảm Mặc Định (Fail-Closed)
- **Given** Inbound hoặc Outbound HTTP request chứa header `Authorization: Bearer secret-jwt-token` và `Cookie: session=abc`,
- **When** dữ liệu đi qua Redaction Stage (`TB-2`),
- **Then** giá trị token được thay thế bằng chuỗi giả lập `[REDACTED_BEARER_TOKEN]` và cờ `redacted: true` được đánh dấu trong interaction metadata.

### Scenario 2: Khử Trường Body Format-Preserving
- **Given** Request body chứa trường JSON `{"email": "user@corp.com", "password": "supersecretpassword"}`,
- **When** SDK thực hiện serialize body,
- **Then** trường email được ẩn danh thành `user-anon-1842@corp.test`, trường password thành `[REDACTED_STRING]`, kiểu dữ liệu vẫn giữ là `string` (không bị xoá key thành `undefined`).

### Scenario 3: Ghi Nhận Dấu Vết Redaction Phục Vụ Diff
- **Given** một tương tác đã áp dụng quy tắc khử dữ liệu,
- **When** capsule được đóng gói,
- **Then** danh mục các field đã bị thay đổi được lưu tại trường `redaction_manifest` của interaction để Execution Diff phân loại đúng nguyên nhân phân kỳ.
