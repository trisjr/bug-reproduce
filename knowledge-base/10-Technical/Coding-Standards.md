<!-- Knowledge Base -->
# Tiêu Chuẩn Viết Code (Coding Standards)

## Mục lục
1. [Nguyên Tắc Chung](#1-nguyên-tắc-chung)
2. [Đặt Tên (Naming Convention)](#2-đặt-tên-naming-convention)
3. [TypeScript Best Practices](#3-typescript-best-practices)
4. [Cấu Trúc Hàm & Class](#4-cấu-trúc-hàm--class)
5. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Nguyên Tắc Chung
- **KISS (Keep It Simple, Stupid):** Hệ thống Agent ưu tiên code dễ hiểu hơn là code tối ưu cực đoan nhưng khó đọc.
- **DRY (Don't Repeat Yourself):** Tái sử dụng code thông qua các Utility functions hoặc Components.
- **SOLID:** Tuân thủ 5 nguyên tắc thiết kế hướng đối tượng để đảm bảo tính mở rộng.

## 2. Đặt Tên (Naming Convention)
- **Variables/Functions:** Sử dụng `camelCase` (ví dụ: `getUserData`).
- **Classes/Interfaces/Types:** Sử dụng `PascalCase` (ví dụ: `UserService`).
- **Constants:** Sử dụng `UPPER_CASE` với dấu gạch dưới (ví dụ: `MAX_RETRY_COUNT`).
- **Boolean:** Tiền tố `is`, `has`, hoặc `should` (ví dụ: `isActive`).

## 3. TypeScript Best Practices
- **Strict Mode:** Luôn bật `strict: true` trong `tsconfig.json`.
- **No Implicit Any:** Tránh sử dụng kiểu `any`. Ưu tiên sử dụng `unknown` nếu không rõ kiểu dữ liệu.
- **Interfaces vs Types:** Sử dụng `interface` cho các định nghĩa object có tính kế thừa, `type` cho union/intersection types.
- **Readonly:** Sử dụng `readonly` cho các thuộc tính không được phép thay đổi sau khi khởi tạo.

## 4. Cấu Trúc Hàm & Class
- **Single Responsibility:** Mỗi hàm/class chỉ thực hiện một nhiệm vụ duy nhất.
- **Hàm ngắn gọn:** Một hàm không nên vượt quá 20-30 dòng code.
- **Arguments:** Một hàm không nên nhận quá 3 tham số. Nếu nhiều hơn, hãy truyền vào một `object`.

---

## Tài Liệu Tham Khảo
1. [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
2. [Clean Code: A Handbook of Agile Software Craftsmanship - Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
3. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
