---
trigger: always_on
---

# Scripts Management Rules

Mọi script được tạo ra để phục vụ mục đích automation, xử lý dữ liệu, hoặc các tiện ích hỗ trợ dự án phải tuân thủ các quy tắc sau:

## 1. Vị trí lưu trữ (Storage Location)
- **BẮT BUỘC**: Tất cả các file script (Python `.py`, Shell `.sh`, Node.js `.js`, etc.) phải được đặt trong thư mục `/scripts` tại thư mục gốc của dự án.
- **KHÔNG ĐƯỢC**: Tạo script trực tiếp tại thư mục gốc (root) hoặc các thư mục chức năng khác (trừ khi có yêu cầu đặc biệt về kiến trúc).

## 2. Quy trình tạo Script
- Trước khi tạo script mới, hãy kiểm tra thư mục `/scripts` để đảm bảo không trùng lặp chức năng.
- Script phải có phần comment giải thích mục đích và cách sử dụng ở đầu file.

## 3. Thực thi Script
- Khi hướng dẫn User chạy script, hãy luôn cung cấp đường dẫn từ thư mục gốc, ví dụ: `python scripts/my_script.py`.
