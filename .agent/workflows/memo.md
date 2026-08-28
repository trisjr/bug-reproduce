---
description: Đúc kết kinh nghiệm và lưu vào Role-Memory sau khi hoàn thành task
---

# Workflow: /memo - Cập nhật Bộ nhớ Vai trò (Role Memory Update)

Quy trình này giúp TNMCORE-OS tự học hỏi và lưu trữ các bài học kinh nghiệm (Lesson Learned) để nâng cao năng lực tác nhân (Agentic capability) trong tương lai.

## Các bước thực hiện:

1. **Phân tích Context & Discovery:**
   - Đọc file mẫu để đảm bảo cấu trúc đồng nhất:
     {{ view_file "knowledge-base/99-Templates/Template-Role-Memory.md" }}
   - Xác định Role đang kích hoạt (PM, PO, Engineer, v.v.).

2. **Tổng hợp Kinh nghiệm (Intel Construction):**
   Hãy rà soát lịch sử hội thoại và các file Artifacts vừa tạo để trích xuất:
   - **Patterns:** Các cách tiếp cận logic hoặc technical đã chứng minh hiệu quả.
   - **Solutions:** Các "công thức" giải quyết vấn đề cụ thể trong task vừa thực hiện.
   - **Pitfalls:** Những lỗi Hallucination, lỗi cú pháp hoặc hiểu nhầm Requirement đã xảy ra.
   - **User Preferences:** Những sở thích về phong cách code, định dạng tài liệu mà User đã nhắc đến.

3. **Xác định đường dẫn lưu trữ:**
   - Thư mục: `knowledge-base/45-Role-Memory/{active-role-slug}/`
   - Naming: `YYYY-MM-DD-{topic-name}.md`
   - (Ví dụ: `2026-02-05-otp-auth-logic.md`)

4. **Thực thi (Implementation):**
   - Tạo file memory mới.
   - **BẮT BUỘC** có YAML Frontmatter chuẩn với `id: MEM-{NNN}`, `type: memory`, and `status: active`.
   - Sử dụng Tiếng Việt và giữ nguyên thuật ngữ chuyên ngành.
   // turbo
   {{ write_to_file TargetFile="knowledge-base/45-Role-Memory/{role}/{filename}.md" Overwrite=false }}

5. **Kết nối & Lan tỏa (Traceability):**
   - Đề xuất cập nhật vào `AGENTS.md` (Active Brain) nếu đây là một kinh nghiệm cực kỳ quan trọng cần được nạp ngay lập tức ở lần sau.

6. **Hoàn tất:**
   Thông báo: "🧠 Role Memory đã được cập nhật. TNMCORE-OS đã thông minh hơn một chút!"
