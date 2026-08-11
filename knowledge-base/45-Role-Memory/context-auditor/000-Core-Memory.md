---
id: MEM-CAD-000
type: memory
status: live
role: context-auditor
created: 2026-03-02
updated: 2026-03-02
---

# 🔍 Core Memory: Context Auditor

## 📌 1. Tóm tắt
Kinh nghiệm thực hiện Audit tính nhất quán Context trong hệ thống TNMCORE-OS.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Cross-Reference Matrix
- **Bối cảnh áp dụng:** Khi cần kiểm tra tính nhất quán giữa nhiều tài liệu gốc.
- **Cách thực hiện:** Lập ma trận đối chiếu: hàng = tiêu chí (Roles count, Workflow steps, Dewey codes), cột = tài liệu (AGENTS.md, README, Handbook, Cheatsheet). Phát hiện mâu thuẫn ngay trên bảng.

### B. Solution Recipe: Priority-Based Fix
- **Vấn đề:** Phát hiện nhiều conflicts nhưng không biết sửa cái nào trước.
- **Giải pháp:** Phân loại theo mức độ ảnh hưởng đến Agent:
  - **Critical:** Agent nhận sai thông tin nền tảng (VD: sai số bước Workflow).
  - **Moderate:** Lỗi định dạng, liên kết gây khó khăn cho navigation.
  - **Low:** Lỗi thẩm mỹ, không ảnh hưởng logic.
- **Kết quả:** Đảm bảo sửa được các Critical trước, tránh gây thêm lỗi mới.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp (2026-03-02):** AGENTS.md tuyên bố "4 trụ cột" nhưng chỉ liệt kê 3 mục, trong khi mọi file khác nói "6 bước". Đây là Critical vì AGENTS.md được nạp đầu tiên.
- **Cách phòng ngừa:** Luôn đối chiếu con số, danh sách giữa AGENTS.md (first-loaded) với toàn bộ tài liệu còn lại.

## 🎯 4. Ưu tiên của người dùng
- **Audit Style:** Ưu tiên báo cáo dạng bảng so sánh, phân loại severity rõ ràng.
- **Fix Approach:** Trình kế hoạch Step-by-Step, chờ Approve trước khi sửa.

---
*TNMCORE-OS Memory Bank.*
