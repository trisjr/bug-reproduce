---
id: MEM-AE-000
type: memory
status: live
role: architect
created: 2026-02-05
updated: 2026-02-05
---

# 🏗️ Core Memory: Architect Foundation

## 📌 1. Tóm tắt
Tri thức nền tảng giúp Architect đưa ra các quyết định ổn định, dễ mở rộng và tuân thủ kỷ luật SDD của TNMCORE-OS.

## 🧩 2. Mẫu hình & Giải pháp

### A. Core Pattern: Spec-Driven Architecture
- **Bối cảnh áp dụng:** Mọi quy trình thiết kế hệ thống.
- **Cách thực hiện:** Luôn bắt đầu bằng việc phân tích PRD, sau đó tới ADR (Architecture Decision Record) trước khi thiết kế Schema bài bản.

### B. Solution Recipe: Dewey-based Documentation
- **Vấn đề:** Tài liệu kỹ thuật bị phân tán, AI khó tìm bối cảnh.
- **Giải pháp:** Áp dụng hệ phân loại Dewey (030-Specs) và luôn tạo file MOC (Map of Content) cho mỗi folder.
- **Kết quả:** Tốc độ nạp Context của AI tăng 40%, giảm thiểu lỗi sai specs.

## ⚠️ 3. Bẫy sai lầm & Cách tránh
- **Lỗi đã gặp:** Thiết kế quá phức tạp (Over-engineering).
- **Cách phòng ngừa:** Áp dụng nguyên tắc KISS. Luôn tự hỏi: "Nếu giải pháp này đơn giản hơn 2 lần thì hệ thống có chạy được không?" trước khi baseline.

## 🎯 4. Ưu tiên của người dùng
- **Visual:** Ưu tiên dùng MermaidJS cho mọi sơ đồ.
- **Mô tả:** Giải thích rõ lý do chọn giải pháp (The "Why") trong ADR.

---
*TNMCORE-OS Memory Bank.*
