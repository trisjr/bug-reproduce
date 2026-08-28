---
id: STORY-010
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-03-Replay-Runtime.md"
---

# 📝 Story-10 — Đánh Chặn & Phát Lại Dữ Liệu PostgreSQL & External HTTP API

## 1. User Story Statement

**As a** Replay Runtime,  
**I want to** đánh chặn các lệnh gọi Database `pg` và HTTP API ngoại vi phát sinh từ mã nguồn local để trả về kết quả sản thi đã ghi lại ($U_i$),  
**So that** ứng dụng local nhận đúng dữ liệu mà không cần kết nối tới database thật hay gọi external API thật.

- **Parent Epic**: [Epic-03 — Replay Runtime](../Epics/Epic-03-Replay-Runtime.md)
- **Target Workstream**: `WS-3` (Replay Runtime)
- **Estimation**: 3.5 MD
- **Parent Requirements**: `FR-029`, `FR-030`, `FR-033`, `ADR-003`, `ADR-004`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Khớp Truy Vấn Database & Trả Kết Quả Ghi Lại
- **Given** ứng dụng local phát ra câu lệnh `client.query('SELECT * FROM coupons WHERE code = $1', ['SAVE10'])`,
- **When** Replay Runtime đánh chặn lời gọi,
- **Then** Runtime so khớp normalized SQL fingerprint và parameter array, tìm thấy bản ghi tương ứng trong `interactions.jsonl` và trả về mảng kết quả sản thi (ví dụ `rows: []`) trong thời gian $< 1\text{ ms}$.

### Scenario 2: Đánh Chặn Outbound External API & Trả Recorded Response
- **Given** ứng dụng gọi API tính thuế bên ngoài qua `fetch('https://tax.api/calculate', ...)`,
- **When** Replay Runtime đánh chặn network request,
- **Then** Runtime so khớp URL template và body hash, trả về HTTP status code $200$ kèm payload `{ "tax": 0 }` đã ghi lại mà không gửi bất kỳ TCP packet nào ra ngoài.

### Scenario 3: Xử Lý Khi Interaction Không Có Trong Capsule (Incomplete Capture)
- **Given** developer sửa code khiến ứng dụng phát ra một query SQL mới chưa từng có trong capsule,
- **When** Runtime tìm kiếm trong `interactions.jsonl` và không thấy,
- **Then** Runtime lập tức trả lỗi `REPRO_UNRECORDED_INTERACTION` và đánh dấu phân kỳ `incomplete-capture`, tuyệt đối không fallback query database local thật.
