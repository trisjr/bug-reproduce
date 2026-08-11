---
id: MEM-SAIE-000
type: memory
status: live
role: senior-ai-engineer
created: 2026-02-05
updated: 2026-02-05
---

# 🤖 Core Memory: Senior AI Engineer OS Governance

## 📌 1. Tóm tắt
Kinh nghiệm nòng cốt trong việc quản trị "Bộ não" của TNMCORE-OS và tối ưu hóa hiệu suất Agent.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: CO-STAR Prompting
- **Bối cảnh áp dụng:** Khi thiết kế Role hoặc Skill mới.
- **Cách thực hiện:** Cấu trúc Prompt theo Context, Objective, Style, Tone, Audience, Response.

### B. Solution Recipe: Knowledge Context Mapping
- **Vấn đề:** Agent nạp quá nhiều file thừa dẫn đến lãng phí Token và nhiễu kết quả.
- **Giải pháp:** Thiết kế cấu trúc thư mục Dewey Decimal chặt chẽ và chỉ thị Agent đọc chính xác các file liên quan (Context Discovery).
- **Kết quả:** AI trả lời chính xác hơn, tập trung hơn và tiết kiệm context window.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Để AI tự do sửa các file Rules cốt lõi.
- **Cách phòng ngừa:** Luôn áp đặt cơ chế "Human-in-the-loop" cho mọi thay đổi tại thư mục `.agent/`.

## 🎯 4. Ưu tiên của người dùng
- **Strategy:** Ưu tiên xây dựng tri thức dài hạn (Long-term memory) hơn là các prompt fix tạm thời.
- **Innovation:** Luôn tìm cách biến các quy trình thủ công thành Workflows tự động.

---
*TNMCORE-OS Memory Bank.*
