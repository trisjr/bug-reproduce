<!-- Knowledge Base -->
# Danh Sách Kiểm Tra Thực Thi (Agentic Implementation Checklist)

## Mục lục
1. [Giới Thiệu](#1-giới-thiệu)
2. [Các Bước Kiểm Tra Trước Khi Code](#2-các-bước-kiểm-tra-trước-khi-code)
3. [Quy Trình Kiểm Tra Code](#3-quy-trình-kiểm-tra-code)
4. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Giới Thiệu
Đây là danh sách kiểm tra (checklist) bắt buộc dành cho AI Agent trước và trong khi thực hiện bất kỳ task lập trình nào. Mục tiêu là đảm bảo AI luôn tuân thủ các tri thức đã có trong `knowledge-base/`.

## 2. Các Bước Kiểm Tra Trước Khi Code
Trước khi chạy lệnh `/opsx:apply`, AI Agent phải xác nhận đã thực hiện:

- [ ] **Tra cứu Glossary:** Đã đọc `knowledge-base/01-Metas/Glossary.md` để dùng đúng thuật ngữ chưa?
- [ ] **Kiểm tra Coding Standards:** Đã đọc `knowledge-base/10-Technical/Coding-Standards.md` để nắm vững quy tắc đặt tên và cấu trúc chưa?
- [ ] **Rà soát Bài học cũ (Memory):** Đã kiểm tra thư mục `knowledge-base/40-Memory/` để xem có lỗi nào tương tự từng xảy ra không? (Ví dụ: Memory leak, Security issues).
- [ ] **Xác nhận Framework:** Prompt đã tuân thủ khung **CO-STAR** trong `knowledge-base/99-Templates/Prompt-Engineering-Standard.md` chưa?

## 3. Quy Trình Kiểm Tra Code (Self-Review)
Sau khi viết code, AI Agent tự kiểm tra:

- [ ] Code có gây ra side-effects đã được cảnh báo trong `40-Memory/` không?
- [ ] Các hàm có đảm bảo tính Single Responsibility không?
- [ ] Đã có cleanup code (nếu task liên quan đến Resource Management như Socket, DB connection) chưa?

---

## Tài Liệu Tham Khảo
1. [TNMCORE-OS README - Section 8: Knowledge Base](../../README.md#8-hệ-thống-tri-thức-knowledge-base)
2. [SOP TNMCORE-OS - Section 3.3: Development Flow](../../SOP_TNMCORE-OS.md#33-giai-đoạn-3-development--openspec-execution-thực-thi)
