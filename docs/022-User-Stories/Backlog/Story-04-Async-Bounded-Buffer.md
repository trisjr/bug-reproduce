---
id: STORY-004
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-01-SDK-Capture.md"
---

# 📝 Story-04 — Bộ Nhớ Đệm Bất Đồng Bộ & Giới Hạn Kích Thước $SEC\text{-}008$

## 1. User Story Statement

**As a** Performance / SRE Lead,  
**I want to** SDK sử dụng bộ nhớ đệm bất đồng bộ có giới hạn trần cứng ($SEC\text{-}008$: $100\text{ rows} / 64\text{ KB}$ per query) và tự động huỷ bỏ khi request thành công,  
**So that** việc capture không bao giờ gây cạn kiệt tài nguyên bộ nhớ (OOM) hay làm chậm trễ ứng dụng production ($§20.7$).

- **Parent Epic**: [Epic-01 — SDK Capture](../Epics/Epic-01-SDK-Capture.md)
- **Target Workstream**: `WS-1` & `WS-6`
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-012` .. `FR-016`, `SEC-008`, `SEC-009`, `N-02`, `N-07`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Huỷ Bộ Nhớ Đệm Khi Request Thành Công (Zero Egress)
- **Given** một HTTP request được xử lý và trả về mã trạng thái `HTTP 200 OK`,
- **When** response kết thúc,
- **Then** toàn bộ interaction buffer trong bộ nhớ lập tức được giải phóng (garbage collected), không có bất kỳ network packet nào được gửi lên storage collector ($0\text{ B}$ egress).

### Scenario 2: Truncate Kết Quả Database Lớn Theo $SEC\text{-}008$
- **Given** một câu truy vấn SQL trả về $5,000$ dòng kết quả (vượt quá trần an toàn),
- **When** SDK thu thập kết quả query,
- **Then** SDK chỉ lưu giữ tối đa $100$ dòng đầu tiên hoặc $64\text{ KB}$ dữ liệu, gắn cờ `truncated: true` và `total_row_count: 5000` vào interaction record.

### Scenario 3: Bỏ Ghi Nhận Khi Execution Chạm Trần Bộ Nhớ Toàn Cục
- **Given** một request phức tạp tích luỹ vượt quá trần buffer $50\text{ MB}$,
- **When** SDK phát hiện vượt trần,
- **Then** SDK chuyển sang chế độ drop-not-block, gắn nhãn `buffer_overflow` trong manifest và hoàn tất request ứng dụng mà không chặn event loop.
