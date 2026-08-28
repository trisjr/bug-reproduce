---
id: STORY-014
type: story
status: approved
project: repro
owner: "@quality-assurance"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-04-Verification-Diff.md"
---

# 📝 Story-14 — Quy Trình Phân Lập Nguyên Nhân Phân Kỳ Tự Động 6 Bước

## 1. User Story Statement

**As a** Developer / QA Engineer,  
**I want to** khi replay phân kỳ (`Execution diverged`), hệ thống tự động chạy qua quy trình 6 bước có thứ tự nghiêm ngặt ($Spec\ \S3.6$) để xác định nguyên nhân gốc,  
**So that** tôi biết chính xác lỗi bắt nguồn từ đâu (redaction, thiếu dữ liệu, lệch phiên bản, hay do mã nguồn) mà không đổ lỗi sai cho công cụ.

- **Parent Epic**: [Epic-04 — Verification & Diff](../Epics/Epic-04-Verification-Diff.md)
- **Target Workstream**: `WS-4` (Verification & Diff)
- **Estimation**: 3.0 MD
- **Parent Requirements**: `FR-042`, `FR-043`, `ADR-006`, `ADR-011`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Phân Lập Do Redaction (Bước 1)
- **Given** tương tác bị lệch do một trường dữ liệu nhạy cảm đã bị ẩn danh hoá ở production,
- **When** Attribution Engine đối chiếu với `redaction_manifest`,
- **Then** gán nhãn phân kỳ là `redaction` và ghi rõ: `Divergence caused by privacy redaction rule. Not a code defect.`

### Scenario 2: Phân Lập Do Thiếu Dữ Liệu hoặc Truncation (Bước 2 & 3)
- **Given** code local gọi một query không có trong capsule hoặc capsule mang cờ `truncated: true`,
- **When** Attribution Engine kiểm tra tính đầy đủ,
- **Then** gán nhãn `incomplete-capture` hoặc `truncated` tương ứng, hướng dẫn cấu hình lại tham số capture nếu cần.

### Scenario 3: Phân Lập Do Lệch Phiên Bản hoặc Phi Tất Định (Bước 4 & 5)
- **Given** môi trường local bị lệch commit hash hoặc execution thuộc kịch bản concurrency phức tạp ngoài class ($ACG\text{-}07$),
- **When** Engine phân tích,
- **Then** gán nhãn `version-drift` hoặc `out-of-scope-determinism`, không tính vào lỗi sản phẩm Repro.

### Scenario 4: Phân Lập Do Thay Đổi Mã Nguồn Ứng Dụng (Bước 6)
- **Given** execution vượt qua 5 bước kiểm tra trên và có sự thay đổi logic thật sự,
- **When** Engine kết luận cuối cùng,
- **Then** gán nhãn `code` và xuất điểm phân kỳ đầu tiên phục vụ debug.
