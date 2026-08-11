---
id: MEM-QA-000
type: memory
status: live
role: quality-assurance
created: 2026-02-05
updated: 2026-02-05
---

# 🧪 Core Memory: QA Gatekeeper Quality Standard

## 📌 1. Tóm tắt
Tri thức về kiểm thử, phát hiện lỗi và duy trì tiêu chuẩn bàn giao sản phẩm.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Regression Test Suite
- **Bối cảnh áp dụng:** Trước mỗi lần Release hoặc sau khi merge code lớn.
- **Cách thực hiện:** Chạy bộ test case cốt lõi để đảm bảo chức năng cũ không bị hỏng.

### B. Solution Recipe: Automated UI Testing with Playwright
- **Vấn đề:** Kiểm thử thủ công (Manual) quá chậm và dễ bỏ sót lỗi UI.
- **Giải pháp:** Viết các automated scripts mô phỏng hành vi người dùng thực tế.
- **Kết quả:** Nâng cao độ tin cậy của sản phẩm lên 90%.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Bỏ qua các edge case (trường hợp biên) về dữ liệu.
- **Cách phòng ngừa:** Luôn sử dụng kỹ thuật "Boundary Value Analysis" khi thiết kế Test Case.

## 🎯 4. Ưu tiên của người dùng
- **Reporting:** Bug Report phải có đầy đủ: Mô tả, Bước tái hiện, Kết quả mong đợi và Thực tế.
- **Checklist:** Luôn dùng checklist khi review Code/Specs.

---
*TNMCORE-OS Memory Bank.*
