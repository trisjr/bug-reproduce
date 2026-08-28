---
name: requirement-impact
description: Đánh giá mức độ ảnh hưởng của bug/change lên các tài liệu Requirement hiện có. Tìm kiếm, phân tích và đề xuất cập nhật các file docs/ liên quan. Tái sử dụng bởi QA, Engineer, PO Roles.
---

# Requirement Impact Analysis

Skill này giúp đánh giá và cập nhật các tài liệu Requirement khi phát hiện bug hoặc change có ảnh hưởng đến nghiệp vụ hiện tại.

## Table of Contents
1. [Khi nào sử dụng](#khi-nào-sử-dụng)
2. [Input](#input)
3. [Quy trình thực thi](#quy-trình-thực-thi)
4. [Quy tắc vận hành](#quy-tắc-vận-hành)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Khi nào sử dụng
- Khi bug/change **có thể ảnh hưởng** đến Requirement, Spec hoặc User Story hiện có.
- Được gọi từ workflow `/opsx:ingest` hoặc sử dụng độc lập bởi các Role: QA, Engineer, PO.
- Ví dụ: "Bug lỗi thanh toán MoMo" → Tìm xem Requirement nào mô tả luồng thanh toán MoMo và đề xuất update.

## Input
Agent nhận một trong các dạng sau:
- **Mô tả bug/change** (văn bản tự do): "Lỗi tính điểm thưởng khi áp voucher..."
- **Bug Report** (đã được tạo sẵn từ `/opsx:ingest`): File markdown chứa title, description, steps to reproduce.

## Quy trình thực thi

### Bước 1: Trích xuất Keywords
Từ mô tả bug/change, trích xuất **3-5 keywords** quan trọng nhất liên quan đến nghiệp vụ.
- Ưu tiên: tên tính năng, entity, API endpoint, business flow.
- Loại bỏ: stop words, technical noise (stack trace, error codes).

### Bước 2: Tìm kiếm tài liệu liên quan
Sử dụng `grep_search` để tìm keywords trong các thư mục docs/ theo thứ tự ưu tiên:
1. `docs/020-Requirements/` — BRD, PRD, Use Cases
2. `docs/022-User-Stories/` — Epics, Stories
3. `docs/030-Specs/` — Technical Specs, API Specs, Schema

Giới hạn tối đa **5 files** liên quan nhất.

**Nếu không tìm thấy kết quả nào** → Thông báo User:
```
✅ Không tìm thấy tài liệu Requirement nào bị ảnh hưởng.
Các keywords đã tìm: [keyword1, keyword2, ...]
Các thư mục đã quét: docs/020, docs/022, docs/030

💡 Nếu anh biết file cụ thể cần update, hãy cho em biết đường dẫn.
```
→ Kết thúc skill (không tiếp tục sang Bước 3).

### Bước 3: Phân tích Impact
Với mỗi file tìm được:
- Đọc nội dung (`view_file`) để xác nhận mức độ liên quan thực tế.
- Đánh giá mức ảnh hưởng:
  - 🔴 **Trực tiếp** — Bug/change mâu thuẫn hoặc phá vỡ nội dung hiện tại.
  - 🟡 **Gián tiếp** — Cần bổ sung/làm rõ thêm, nhưng không sai.
  - ⚪ **Không ảnh hưởng** — Keyword khớp nhưng context khác.

### Bước 4: Trình bày kết quả & Xin phê duyệt
Trình User danh sách files bị ảnh hưởng theo format:

```
📋 Kết quả phân tích Impact:

| # | File | Mức ảnh hưởng | Mô tả ngắn |
|---|------|---------------|-------------|
| 1 | docs/020-Requirements/Payment-Flow.md | 🔴 Trực tiếp | Cần update logic retry |
| 2 | docs/022-User-Stories/EP-003-Payment.md | 🟡 Gián tiếp | Bổ sung AC mới |

❓ Bạn muốn em cập nhật file nào? (Chọn số hoặc "tất cả")
```

**BẮT BUỘC**: Chờ User xác nhận trước khi chỉnh sửa bất kỳ file nào.

### Bước 5: Thực hiện cập nhật
Với mỗi file User đồng ý:
1. Đọc nội dung hiện tại.
2. Soạn nội dung cập nhật (thêm/sửa section liên quan).
3. Trình User xem preview trước khi ghi file.
4. Ghi file sau khi User confirm.

### Bước 6: Tóm tắt kết quả
```
✅ Đã cập nhật [N] files:
- docs/020-Requirements/Payment-Flow.md — Thêm edge case retry logic
- docs/022-User-Stories/EP-003-Payment.md — Bổ sung AC #5

💡 Gợi ý bước tiếp theo:
- /opsx:ff để tạo change cho việc fix bug
- /opsx:ingest <URL khác> để tiếp tục nhập dữ liệu
```

## Quy tắc vận hành
- **Human-in-the-Loop**: TUYỆT ĐỐI không tự ý ghi đè file. Luôn trình và chờ User approve.
- **Anti-Hallucination**: Chỉ báo cáo file thực sự tồn tại (đã verify bằng `grep_search` hoặc `view_file`).
- **Minimal Change**: Chỉ sửa đúng phần bị ảnh hưởng, giữ nguyên phần còn lại của file.
- **Traceability**: Khi update file, thêm annotation nguồn gốc (ví dụ: `<!-- Updated from Bug: ClickUp#abc123 -->`).

## Tài liệu tham khảo
- `docs/000-Index.md` — Master Index tài liệu dự án.
- `knowledge-base/20-Project/Project-Governance.md` — Quy trình quản lý thay đổi.
- `AGENTS.md` — Primary Context hệ thống.
