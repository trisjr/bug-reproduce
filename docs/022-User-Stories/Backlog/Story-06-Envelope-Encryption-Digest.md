---
id: STORY-006
type: story
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-02-Capsule-Store.md"
---

# 📝 Story-06 — Giao Thức Mã Hoá Envelope AES-256-GCM & Kiểm Tra Toàn Vẹn $SEC\text{-}027$

## 1. User Story Statement

**As a** Security Auditor,  
**I want to** capsule được mã hoá bằng thuật toán đối xứng AES-256-GCM với Data Encryption Key (DEK) riêng biệt và có mã xác thực HMAC-SHA256 trước khi giải nén,  
**So that** dữ liệu tại trạng thái nghỉ được bảo vệ tuyệt đối và ngăn chặn các cuộc tấn công giải nén zip-slip hay payload tampering ($SEC\text{-}027$, $THREAT\text{-}009$).

- **Parent Epic**: [Epic-02 — Capsule & Store](../Epics/Epic-02-Capsule-Store.md)
- **Target Workstream**: `WS-2` & `WS-6`
- **Estimation**: 3.0 MD
- **Parent Requirements**: `FR-021`, `SEC-011` .. `SEC-015`, `SEC-027` .. `SEC-031`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Mã Hoá Capsule Bằng Ephemeral DEK (Envelope Encryption)
- **Given** một capsule payload hoàn chỉnh,
- **When** Capsule Writer mã hoá payload,
- **Then** tạo ngẫu nhiên một DEK (256-bit AES-GCM), mã hoá toàn bộ payload, tạo Auth Tag 128-bit, và xoá sạch DEK plaintext khỏi bộ nhớ ngay sau khi gửi lên Key Custody Store.

### Scenario 2: Kiểm Tra Toàn Vẹn Digest-Before-Parse ($SEC\text{-}027$)
- **Given** developer hoặc CI thực hiện lệnh `repro pull` hoặc `repro replay`,
- **When** capsule được tải về máy,
- **Then** runtime tính toán HMAC-SHA256 của archive đã mã hoá và so khớp với `payload_hmac` trong manifest TRƯỚC KHI thực hiện bất kỳ thao tác giải nén hoặc parse JSON nào.

### Scenario 3: Chặn Đứng Tấn Công Tampering & Zip-Slip
- **Given** một capsule bị chỉnh sửa 1 byte hoặc chứa entry path độc hại (ví dụ `../../etc/passwd`),
- **When** runtime xác thực digest và entry paths,
- **Then** runtime ném lỗi `HMAC_VERIFICATION_FAILED` hoặc `PATH_TRAVERSAL_DETECTED` và lập tức huỷ bỏ quá trình nạp capsule fail-closed.
