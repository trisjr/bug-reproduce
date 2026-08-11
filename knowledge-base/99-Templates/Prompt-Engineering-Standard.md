<!-- Knowledge Base -->
# Tiêu Chuẩn Prompt Engineering (CO-STAR Framework)

## Mục lục
1. [Giới Thiệu CO-STAR](#1-giới-thiệu-co-star)
2. [Chi Tiết Các Thành Phần](#2-chi-tiết-các-thành-phần)
3. [Mẫu Prompt Chuẩn](#3-mẫu-prompt-chuẩn)
4. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Giới Thiệu CO-STAR
CO-STAR là một framework được thiết kế để tạo ra các prompt chất lượng cao, giúp LLM hiểu rõ ngữ cảnh và yêu cầu của người dùng, từ đó đưa ra câu trả lời chính xác nhất.

## 2. Chi Tiết Các Thành Phần
- **(C) Context - Ngữ cảnh:** Cung cấp thông tin nền tảng về nhiệm vụ.
- **(O) Objective - Mục tiêu:** Định nghĩa rõ ràng kết quả cuối cùng bạn muốn đạt được.
- **(S) Style - Phong cách:** Chỉ định phong cách viết (ví dụ: như một Senior Engineer, ngắn gọn, chuyên nghiệp).
- **(T) Tone - Thái độ:** Thiết lập tông điệu của câu trả lời (ví dụ: tự tin, phân tích, hỗ trợ).
- **(A) Audience - Đối tượng:** Xác định ai sẽ là người đọc câu trả lời này.
- **(R) Response - Định dạng đầu ra:** Yêu cầu format cụ thể (ví dụ: JSON, Markdown Table, Code block).

## 3. Mẫu Prompt Chuẩn
**Ví dụ prompt cho việc Review Code:**
> **Context:** Tôi đang phát triển một module thanh toán bằng Node.js và TypeScript.
> **Objective:** Hãy review đoạn code dưới đây để tìm các lỗi tiềm ẩn về bảo mật và performance.
> **Style:** Senior Security Engineer.
> **Tone:** Phê bình chuyên nghiệp nhưng mang tính xây dựng.
> **Audience:** Junior Developer.
> **Response:** Liệt kê các lỗi dưới dạng danh sách kèm code ví dụ để sửa lại.

---

## Tài Liệu Tham Khảo
1. [Prompt Engineering Guide - DAIR.AI](https://www.promptingguide.ai/)
2. [OpenAI Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
3. [CO-STAR Framework Research & Articles](https://towardsdatascience.com/)
