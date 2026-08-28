---
name: software-architecture
description: Architectural decision-making framework. Requirements analysis, trade-off evaluation, ADR documentation. Use when making architecture decisions or analyzing system design.
---

# Architecture Decision Framework

> "Yêu cầu thúc đẩy kiến trúc. Sự đánh đổi định hướng quyết định. ADR lưu giữ lý do."

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Quy tắc Đọc có chọn lọc](#quy-tắc-đọc-có-chọn-lọc-selective-reading-rule)
3. [Nguyên tắc cốt lõi](#nguyên-tắc-cốt-lõi)
4. [Danh sách kiểm tra xác thực](#danh-sách-kiểm-tra-xác-thực-validation-checklist)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Năng lực cốt lõi (Core Capabilities)
- Phân tích yêu cầu và ràng buộc.
- Đánh giá sự đánh đổi (Trade-off evaluation).
- Soạn thảo tài liệu ADR (Architecture Decision Records).
- Lựa chọn pattern kiến trúc phù hợp.

## Quy tắc Đọc có chọn lọc (Selective Reading Rule)

**Chỉ đọc các file liên quan đến yêu cầu!** Kiểm tra sơ đồ nội dung và tìm thứ bạn cần.

| File | Mô tả | Khi nào cần đọc |
|------|-------------|--------------|
| `context-discovery.md` | Bộ câu hỏi, phân loại dự án | Khi bắt đầu thiết kế |
| `trade-off-analysis.md` | ADR templates, framework đánh đổi | Khi cần ra quyết định |
| `pattern-selection.md` | Cây quyết định, anti-patterns | Khi chọn pattern |
| `examples.md` | Ví dụ MVP, SaaS, Enterprise | Tham chiếu triển khai |
| `patterns-reference.md` | Tra cứu nhanh các pattern | So sánh các pattern |

## Nguyên tắc cốt lõi

**"Sự đơn giản là đỉnh cao của sự tinh tế."**

- Bắt đầu đơn giản.
- CHỈ thêm độ phức tạp khi chứng minh được sự cần thiết.
- Bạn luôn có thể thêm pattern sau này.
- Loại bỏ độ phức tạp KHÓ hơn nhiều so với việc thêm nó.

## Danh sách kiểm tra xác thực (Validation Checklist)

Trước khi chốt phương án kiến trúc:
- [ ] Đã hiểu rõ yêu cầu?
- [ ] Đã xác định được các ràng buộc kỹ thuật?
- [ ] Mỗi quyết định đều có phân tích sự đánh đổi (Trade-off)?
- [ ] Đã cân nhắc các giải pháp thay thế đơn giản hơn?
- [ ] Các quyết định quan trọng đã được viết ADR?
- [ ] Năng lực của team có khớp với các pattern đã chọn không?

## Tài liệu tham khảo
- `context-discovery.md`.
- `trade-off-analysis.md`.
- `pattern-selection.md`.
- ADR GitHub Repository guidance.
