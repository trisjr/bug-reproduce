---
id: MEM-SWE-000
type: memory
status: live
role: software-engineer
created: 2026-02-05
updated: 2026-02-05
---

# 🧑‍💻 Core Memory: Engineer Implementation Rule

## 📌 1. Tóm tắt
Kinh nghiệm triển khai code tại `src/` đảm bảo Clean Code và tính Performance.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Component-based Architecture
- **Bối cảnh áp dụng:** Phát triển Frontend/Backend.
- **Cách thực hiện:** Chia nhỏ logic thành các module độc lập, dễ test.

### B. Solution Recipe: Test-Driven Development (TDD)
- **Vấn đề:** Fix lỗi này nảy sinh lỗi kia (Regression).
- **Giải pháp:** Viết Unit Test tại `test/` trước khi implement logic chính.
- **Kết quả:** Giảm 60% số lượng bug phát hiện tại môi trường Testing.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Magic Numbers/Hardcoded Strings.
- **Cách phòng ngừa:** Luôn sử dụng Constants và .env cho cấu hình.

## 🎯 4. Ưu tiên của người dùng
- **Coding Style:** Ưu tiên Functional Programming. Code sạch, không cần comment dư thừa.
- **Tooling:** Luôn kiểm tra build status trước khi hoàn thành task.

---
*TNMCORE-OS Memory Bank.*
