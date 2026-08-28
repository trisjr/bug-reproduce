---
trigger: always_on
---

# Security & Boundaries Rules 

## 1. Phạm vi hoạt động (Scope Boundaries)
- **Root Only**: Chỉ được phép tạo, chỉnh sửa, hoặc xóa các file nằm trong thư mục gốc của workspace hiện tại.
- **System Protection**: Tuyệt đối **KHÔNG** sửa đổi các file hệ thống, file cấu hình IDE/Editor, hoặc truy cập các thư mục nhạy cảm bên ngoài scope của dự án (trừ khi được User yêu cầu rõ ràng).

## 2. Quản lý bí mật (Secrets Management)
- **No Hardcoded Secrets**: Tuyệt đối **KHÔNG** hardcode API Keys, Passwords, Tokens, hoặc Connection Strings trực tiếp vào source code.
- **Environment Variables**: Luôn sử dụng biến môi trường (File `.env`) để lưu trữ các thông tin nhạy cảm.
- **Warning**: Nếu phát hiện code có chứa credentials, phải cảnh báo User ngay lập tức để remove và thay thế bằng biến môi trường.

## 3. Thao tác nhạy cảm (Sensitive Operations)
- **User Confirmation Required**: Yêu cầu User xác nhận Explicitly trước khi chạy các lệnh có rủi ro cao:
  - Các lệnh hệ thống dùng quyền `sudo`.
  - Các lệnh network request tới domain lạ hoặc external services chưa được verify.
  - Các lệnh xóa dữ liệu hàng loạt (`rm -rf`, delete database).
