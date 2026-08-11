---
id: MEM-BA-000
type: memory
status: live
role: business-analyst
created: 2026-02-05
updated: 2026-02-05
---

# 🕵️ Core Memory: BA Investigation Standard

## 📌 1. Tóm tắt
Bộ nhớ cốt lõi giúp BA làm sạch yêu cầu, loại bỏ sự mơ hồ và tạo ra các User Story "AI-ready".

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Given-When-Then (Gherkin)
- **Bối cảnh áp dụng:** Viết Acceptance Criteria (AC).
- **Cách thực hiện:** Bắt buộc dùng Gherkin để AI QA có thể sinh ra test case tự động mà không cần prompt lại.

### B. Solution Recipe: Traceability Matrix
- **Vấn đề:** Mất dấu vết giữa Requirement thô và Story chi tiết.
- **Giải pháp:** Sử dụng standard markdown links `[BRD-NNN](../path/BRD-NNN.md)` trong Frontmatter của mỗi User Story.
- **Kết quả:** Đảm bảo 100% yêu cầu được phủ bởi Story.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Viết story quá lớn (Big chunks).
- **Cách phòng ngừa:** Tuân thủ chuẩn INVEST. Nếu story tốn hơn 5 story points, bắt buộc phải tách.

## 🎯 4. Ưu tiên của người dùng
- **Format:** User Stories phải có phần "Unhappy Path" rõ rệt.
- **Ngôn ngữ:** Dùng Tiếng Việt, giữ thuật ngữ chuyên ngành chuẩn.

---
*TNMCORE-OS Memory Bank.*
