---
id: STORY-015
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-04-Verification-Diff.md"
---

# 📝 Story-15 — Trình Bày Báo Cáo Execution Diff Trực Quan & Lệnh `repro verify`

## 1. User Story Statement

**As a** Software Engineer,  
**I want to** chạy lệnh `repro diff 1842` để xem so sánh đối chiếu từng điểm phân kỳ giữa Production và Local, và chạy `repro verify 1842` để xác nhận việc sửa lỗi,  
**So that** tôi nhanh chóng định vị nguyên nhân gốc của bug và tự tin rằng code fix đã triệt tiêu được lỗi mà không phá vỡ hợp đồng.

- **Parent Epic**: [Epic-04 — Verification & Diff](../Epics/Epic-04-Verification-Diff.md)
- **Target Workstream**: `WS-4` & `WS-5`
- **Estimation**: 2.5 MD
- **Parent Requirements**: `FR-042`, `FR-046`, `FR-051`, `FR-052`, `ADR-011`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Hiển Thị Execution Diff Nhóm Theo Loại Input
- **Given** một replay bị phân kỳ (`Execution diverged`),
- **When** developer gõ `repro diff 1842`,
- **Then** CLI in ra danh sách phân kỳ đánh số rõ ràng, nhóm theo 4 loại input (Database, HTTP, Flags, Clock) và trình bày theo cặp đối chiếu trực quan `Production →` vs `Local →`.

### Scenario 2: Kiểm Chứng Fix Mã Nguồn Qua Lệnh `repro verify`
- **Given** developer đã sửa code local và chạy `repro verify 1842`,
- **When** runtime replay lại trên code mới và không còn phát sinh exception gốc,
- **Then** CLI in ra kết quả đối chiếu 2 trạng thái:
  ```text
  Before fix: ✗ reproduced
  After fix:  ✓ captured execution no longer reproduces
  ```

### Scenario 3: Tuân Thủ Nghiêm Ngặt Ngôn Ngữ Hợp Đồng ($§20.16$)
- **Given** lệnh `repro verify` thành công,
- **When** in thông báo hoàn tất ra màn hình terminal,
- **Then** CLI bắt buộc in dòng chữ `✓ Captured execution no longer reproduces`, tuyệt đối không in các câu từ phóng đại như `✓ Production bug is definitely fixed`.
