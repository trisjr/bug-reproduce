---
id: DOM-ACE-002
type: sop
status: live
created: 2026-03-02
updated: 2026-03-02
tags: [sop, context-engineering, workflow, agentic-ai]
linked-to: "./30-Context-Engineering-Foundations.md"
---

# 🛠️ SOP: Quy trình thực thi Context Engineering

## Mục lục
1. [Quy trình nạp ngữ cảnh (Loading)](#1-quy-trình-nạp-ngữ-cảnh-loading)
2. [Quy trình nén ngữ cảnh (Compaction)](#2-quy-trình-nén-ngữ-cảnh-compaction)
3. [Quy trình quản trị bộ nhớ (Memory Management)](#3-quy-trình-quản-trị-bộ-nhớ-memory-management)
4. [Danh sách kiểm tra (Checklist)](#4-danh-sách-kiểm-tra-checklist)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## 1. Quy trình nạp ngữ cảnh (Loading)
BẮT BUỘC thực hiện theo nguyên tắc **Progressive Disclosure**:
1. **Bước 1 (Lightweight Scan):** Sử dụng `list_dir` và đọc các file `Index.md` hoặc `MOC.md` để xác định bản đồ tri thức.
2. **Bước 2 (Targeted Search):** Dùng `grep_search` với từ khóa cụ thể để tìm các đoạn văn bản quan trọng thay vì đọc toàn bộ file dài.
3. **Bước 3 (View on Demand):** Chỉ dùng `view_file` khi đã xác định đúng mục tiêu. Nếu file > 500 dòng, hãy cân nhắc chỉ đọc các đoạn (Chunks) liên quan.

## 2. Quy trình nén ngữ cảnh (Compaction)
Kích hoạt khi số lượt hội thoại > 15 hoặc cảm thấy Model bắt đầu mất tập trung (Recall kém):
1. **Identify:** Liệt kê các quyết định (Decisions) và trạng thái (State) hiện tại.
2. **Discard:** Loại bỏ các block output của tool (JSON lớn, kết quả build, log dài).
3. **Summarize:** Tạo bản tóm tắt "High-fidelity summary" chứa:
   - Mục tiêu cuối cùng.
   - Các việc đã làm.
   - Các vấn đề chưa giải quyết.
   - Danh sách file đang mở.

## 3. Quy trình quản trị bộ nhớ (Memory Management)
Sau mỗi Milestone hoặc Task quan trọng:
1. **Ghi chép:** Sử dụng lệnh `/memo` để đẩy tri thức vào `knowledge-base/45-Role-Memory/`.
2. **Cấu trúc hóa:** Luôn sử dụng Tag và ID để dễ dàng truy xuất lại bằng `grep`.
3. **Cleanup:** Đóng các Tab/Files không còn liên quan đến bước tiếp theo để giải phóng Attention Budget.

## 4. Danh sách kiểm tra (Checklist) cho Agent
- [ ] Tôi có đang nạp quá nhiều file vào context không?
- [ ] Tôi đã dùng `grep` để tìm thông tin thay vì `view_file` mù quáng chưa?
- [ ] Tôi có đang giữ lại các tool output cũ không cần thiết không?
- [ ] Tôi đã cập nhật Role Memory sau khi hoàn thành Task chưa?

## Tài liệu tham khảo
- [30-Context-Engineering-Foundations](./30-Context-Engineering-Foundations.md)
- [AGENTS.md](../../AGENTS.md)
- [OS-Handbook.md](../../OS-Handbook.md)
