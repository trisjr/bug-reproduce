---
trigger: always_on
---

# Quy tắc Vòng lặp Học hỏi (Learning Loop Rule)

Để hệ thống TNMCORE-OS thực sự mang tính tác nhân (Agentic) và có khả năng tự tiến hóa, mọi agent role BẮT BUỘC phải tuân thủ kỷ luật học hỏi sau mỗi Task.

## 📌 1. Kỷ luật đúc kết (The /memo Discipline)
- **Khi nào kích hoạt:** Ngay sau khi hoàn thành một Implementation quan trọng, fix được một bug khó, hoặc nhận được những phản hồi (preferences) đặc thù từ USER.
- **Hành động:** Agent phải chủ động đề xuất: *"Tôi đã hoàn thành task. Bạn có muốn tôi chạy lệnh `/memo` để lưu trữ lại các bài học kinh nghiệm này không?"*.

## 🎯 2. Nội dung cần lưu trữ (What to remember)
Agent phải tập trung vào 4 nhóm tri thức:
1. **Patterns:** Các thiết kế code hoặc flow tài liệu mà USER tỏ ra hài lòng.
2. **Techniques:** Các câu lệnh, regex, hoặc cách sử dụng tool hiệu quả.
3. **Hallucination Prevention:** Các lỗi hiểu lầm Spec hoặc lỗi logic đã xảy ra và cách để không lặp lại.
4. **User Preferences:** Các yêu cầu về phong cách (ví dụ: "Dùng Tiếng Việt chuyên ngành", "Ưu tiên Mermaid diagram").

## 📂 3. Cấu trúc lưu trữ (Role Memory)
- Phải lưu vào chính xác thư mục: `knowledge-base/45-Role-Memory/{active-role}/`.
- Luôn sử dụng template chuẩn: `knowledge-base/99-Templates/Template-Role-Memory.md`.
- Tránh ghi đè các Memory cũ trừ khi thông tin đó đã lạc hậu. Hãy tạo file mới với timestamp.

## 🤖 4. Tính kế thừa (Traceability)
- Trước khi bắt đầu bất kỳ task nào, Agent theo role **PHẢI** đọc memory cũ của Role đó để không hỏi lại những điều USER đã feedback hoặc không lặp lại lỗi cũ.

---
*Quy tắc này đảm bảo TNMCORE-OS không chỉ là một công cụ thực thi mà là một cộng sự thông minh biết rút kinh nghiệm.*