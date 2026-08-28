---
id: STORY-008
type: story
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-02-Capsule-Store.md"
---

# 📝 Story-08 — Cơ Chế Tự Động Huỷ Khoá TTL 30 Ngày & Lệnh Crypto-Shredding `repro purge`

## 1. User Story Statement

**As a** Security Officer / SRE,  
**I want to** thực thi lệnh `repro purge` để xoá vĩnh viễn khoá giải mã DEK tại Key Custody Store hoặc để hệ thống tự động huỷ sau 30 ngày (TTL),  
**So that** toàn bộ các bản sao capsule phân tán lập tức vô phương giải mã toán học, đáp ứng yêu cầu GDPR Art 17 Right-to-Erasure ($SEC\text{-}016$, [ADR-012](../../030-Specs/Architecture/ADR-012-Key-Custody.md)).

- **Parent Epic**: [Epic-02 — Capsule & Store](../Epics/Epic-02-Capsule-Store.md)
- **Target Workstream**: `WS-2` & `WS-6`
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-024`, `FR-053b`, `SEC-016`, `SEC-022`, `ADR-012`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Xoá Khoá Chủ Động Qua Lệnh `repro purge`
- **Given** SRE hoặc Quản trị viên thực hiện lệnh `repro purge --capsule-id=1842 --reason="GDPR_REQUEST_7731"`,
- **When** request được xác thực bởi Key Custody Store,
- **Then** Key Custody Store ghi đè DEK trong bộ nhớ bằng bytes ngẫu nhiên, xoá bản ghi khỏi database, và ghi log kiểm toán bất biến `{ action: "CRYPTO_SHRED", key_id: "...", actor: "admin" }`.

### Scenario 2: Replay Thất Bại Sau Khi Khoá Bị Crypto-Shredded
- **Given** một capsule đã bị crypto-shredded,
- **When** developer hoặc kẻ tấn công cố gắng chạy `repro replay 1842` trên bất kỳ máy nào cầm file vật lý,
- **Then** runtime nhận mã lỗi `410 Gone` từ Key Custody và in thông điệp `❌ ERROR: Capsule key has been permanently shredded. Payload is unrecoverable.`

### Scenario 3: Tự Động Huỷ Khoá Khi Hết Hạn TTL 30 Ngày
- **Given** capsule được tạo quá 30 ngày và không được gia hạn đặc biệt,
- **When** tiến trình quét định kỳ (Auto-Shredding Sweep) chạy tại Key Custody Store,
- **Then** khoá tương ứng tự động chuyển sang trạng thái `EXPIRED` rồi `SHREDDED`, vô hiệu hoá vĩnh viễn khả năng giải mã capsule.
