---
id: KB-PROJ-002
type: process
status: approved
created: 2026-03-04
updated: 2026-03-04
---

# Quy trình Làm việc Vạn năng (Universal Workflow)

Tài liệu này định nghĩa quy trình 6 bước tiêu chuẩn để triển khai mọi yêu cầu, từ tính năng mới đến sửa lỗi, đảm bảo tính nhất quán và chất lượng cao nhất cho TNMCORE-OS.

## 📑 Mục lục

1. [Tổng quan quy trình 6 bước](#1-tổng-quan-quy-trình-6-bước)
2. [Chi tiết các bước thực hiện](#2-chi-tiết-các-bước-thực-hiện)
3. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Tổng quan quy trình 6 bước

Quy trình này được thiết kế để tối ưu hóa sự cộng tác giữa Con người (User) và AI Agent, tập trung vào việc hiểu rõ yêu cầu trước khi gõ phím.

| Bước  | Tên bước                      | Công cụ/Workflow gợi ý | Kết quả đầu ra (Output)            |
| :---- | :---------------------------- | :--------------------- | :--------------------------------- |
| **1** | **Discovery** (Khám phá)      | `/opsx-explore`        | Hiểu rõ vấn đề, rủi ro, bối cảnh   |
| **2** | **Solution** (Giải pháp)      | `/opsx-new`            | Tài liệu Proposal, Design Spec     |
| **3** | **Plan** (Lập kế hoạch)       | `/writing-plans`       | Implementation Plan (Step-by-step) |
| **4** | **Implementation** (Thực thi) | `/opsx-apply`          | Mã nguồn hoàn thiện, đúng Spec     |
| **5** | **Verification** (Xác minh)   | `/opsx-verify`         | Unit Test pass, AC được đáp ứng    |
| **6** | **Retro** (Đúc kết)           | `/memo`                | Role Memory được cập nhật          |

---

## 2. Chi tiết các bước thực hiện

### Bước 1: Discovery (Khám phá)

- **Mục tiêu:** Không để xảy ra hiểu lầm về yêu cầu (Requirement gaps).
- **Hành động:** Agent sử dụng các công cụ rà soát codebase, đặt các câu hỏi Socratic để làm rõ ý định của User.

### Bước 2: Solution (Giải pháp)

- **Mục tiêu:** Chốt phương án kỹ thuật thông qua tài liệu.
- **Hành động:** Viết Proposal, Design, và xác định các Specs bị ảnh hưởng. Sử dụng OpenSpec để quản lý thay đổi (Changes).

### Bước 3: Plan (Lập kế hoạch)

- **Mục tiêu:** Chia nhỏ task để thực thi an toàn.
- **Hành động:** Tạo danh sách các file cần sửa, thứ tự thực hiện và các điểm kiểm tra (checkpoints).

### Bước 4: Implementation (Thực thi)

- **Mục tiêu:** Viết code chất lượng cao.
- **Hành động:** Tuân thủ [Git Workflow Standards](../10-Technical/Git-Workflow.md). Sử dụng AI để gen code scaffolding và logic lõi. Luôn viết code sạch, dễ đọc.

### Bước 5: Verification (Xác minh)

- **Mục tiêu:** Đảm bảo không có lỗi hồi quy (Regression).
- **Hành động:** Chạy Unit Test, Integration Test. Kiểm tra thủ công (Manual Test) và đối soát với Acceptance Criteria.

### Bước 6: Retro (Đúc kết)

- **Mục tiêu:** AI tự học hỏi và tiến hóa.
- **Hành động:** Lưu bài học vào Role-Memory để không lặp lại lỗi cũ và duy trì phong cách làm việc mà User ưng ý.

---

## 📚 Tài liệu tham khảo

1. [Hệ tư duy Antigravity](../../mindset.md)
2. [Nguyên tắc Giao tiếp](../../communication.md)
3. [Quy trình Git](../10-Technical/Git-Workflow.md)
