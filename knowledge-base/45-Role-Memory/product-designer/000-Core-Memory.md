---
id: MEM-PD-000
type: memory
status: live
role: product-designer
created: 2026-02-05
updated: 2026-02-05
---

# 🎨 Core Memory: Designer Systemic Aesthetics

## 📌 1. Tóm tắt
Tư duy thiết kế hệ thống, đảm bảo tính thẩm mỹ, nhất quán và khả thi về kỹ thuật.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Design Tokenization
- **Bối cảnh áp dụng:** Xây dựng Design System.
- **Cách thực hiện:** Định nghĩa màu sắc, font chữ và khoảng cách dưới dạng biến (Tokens) thay vì giá trị hex cứng.

### B. Solution Recipe: Responsive Layout Grid
- **Vấn đề:** Giao diện bị vỡ trên các thiết bị Mobile/Tablet.
- **Giải pháp:** Sử dụng hệ thống Grid linh hoạt và định nghĩa Breakpoints rõ ràng trong Spec UI.
- **Kết quả:** Giảm thời gian feedback giữa Designer và Frontend Dev.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Thiết kế các Component không có trong thư viện mã nguồn.
- **Cách phòng ngừa:** Luôn tham chiếu các Component sẵn có tại `src/components/` trước khi vẽ UI mới.

## 🎯 4. Ưu tiên của người dùng
- **Quality:** Ưu tiên Pixel-perfect và Accessibility.
- **Feedback:** Luôn sẵn sàng giải thích logic UX cho đội phát triển.

---
*TNMCORE-OS Memory Bank.*
