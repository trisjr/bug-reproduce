---
name: brainstorming-complex-requests
description: Socratic questioning protocol + user communication. MANDATORY for complex requests, new features, or unclear requirements. Includes progress reporting and error handling.
---

# Brainstorming & Giao tiếp (Communication Protocol)

> **BẮT BUỘC:** Sử dụng cho các yêu cầu phức tạp/mơ hồ, tính năng mới hoặc cập nhật lớn.

## Table of Contents
1. [Cổng Socratic (Bắt buộc)](#cổng-socratic-bắt-buộc)
2. [Tạo câu hỏi động](#tạo-câu-hỏi-động)
3. [Báo cáo tiến độ](#báo cáo-tiến-độ)
4. [Xử lý lỗi](#xử-lý-lỗi)
5. [Các nguyên tắc giao tiếp](#các-nguyên-tắc-giao-tiếp)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Cổng Socratic (Bắt buộc)

### Khi nào cần kích hoạt

| Pattern | Hành động |
|---------|--------|
| "Xây dựng/Tạo/Làm [thứ gì đó]" mà không có chi tiết | 🛑 HỎI ít nhất 3 câu hỏi |
| Tính năng hoặc kiến trúc phức tạp | 🛑 Làm rõ trước khi thực hiện |
| Yêu cầu cập nhật/thay đổi | 🛑 Xác nhận phạm vi (Scope) |
| Yêu cầu mơ hồ | 🛑 Hỏi về mục đích, người dùng, ràng buộc |

### 🚫 BẮT BUỘC: 3 Câu hỏi trước khi triển khai

1. **DỪNG LẠI** - KHÔNG bắt đầu viết code ngay.
2. **HỎI** - Ít nhất 3 câu hỏi xoay quanh:
   - 🎯 **Mục đích**: Bạn đang giải quyết vấn đề gì?
   - 👥 **Người dùng**: Ai sẽ sử dụng tính năng này?
   - 📦 **Phạm vi**: Những gì là bắt buộc (Must-have) và những gì là tùy chọn (Nice-to-have)?
3. **CHỜ ĐỢI** - Nhận phản hồi trước khi tiếp tục.

## Tạo câu hỏi động (Dynamic Questioning)

**⛔ KHÔNG BAO GIỜ sử dụng các template tĩnh.** Câu hỏi phải được thiết kế riêng cho từng ngữ cảnh.

### Quy trình tạo câu hỏi
1. Phân tích yêu cầu → Trích xuất domain, tính năng, quy mô.
2. Xác định các điểm quyết định (Decision points) → Cần làm rõ ngay hay có thể hoãn lại.
3. Tạo câu hỏi theo thứ tự ưu tiên: P0 (chặn đường) > P1 (đòn bẩy cao) > P2 (có thì tốt).
4. Định dạng kèm theo sự đánh đổi (Trade-offs): Cái gì, Tại sao, Các tùy chọn, Mặc định.

## Báo cáo tiến độ (Progress Reporting)

**NGUYÊN TẮC:** Sự minh bạch tạo nên niềm tin. Trạng thái công việc phải hiển thị rõ ràng.

### Định dạng Bảng Trạng thái

| Agent | Trạng thái | Task hiện tại | Tiến độ |
|-------|--------|--------------|----------|
| [Tên Agent] | ✅🔄⏳❌⚠️ | [Mô tả công việc] | [% hoặc số lượng] |

- ✅: Hoàn thành.
- 🔄: Đang chạy.
- ⏳: Đang chờ (phụ thuộc).
- ❌: Lỗi (cần can thiệp).
- ⚠️: Cảnh báo (vấn đề tiềm ẩn).

## Xử lý lỗi (Error Handling)

**NGUYÊN TẮC:** Lỗi là cơ hội để giao tiếp rõ ràng.
1. Xác nhận lỗi.
2. Giải thích những gì đã xảy ra (thân thiện với người dùng).
3. Đề xuất các giải pháp cụ thể kèm theo sự đánh đổi.
4. Yêu cầu người dùng lựa chọn hoặc cung cấp phương án thay thế.

## Các nguyên tắc giao tiếp
- **Súc tích**: Không chi tiết thừa, đi thẳng vào vấn đề.
- **Trực quan**: Sử dụng emoji (✅🔄⏳❌) để quét nhanh thông tin.
- **Cụ thể**: "Khoảng 2 phút" thay vì "đợi một lát".
- **Chủ động**: Đề xuất bước tiếp theo sau khi hoàn thành.

## Tài liệu tham khảo
- `references/dynamic-questioning.md` cho các ngân hàng câu hỏi chuyên sâu.
- Clean Communication in Software Engineering.
- Socratic Method in AI Interactions.
