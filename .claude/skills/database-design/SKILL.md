---
name: database-design
description: Database design principles and decision-making. Schema design, indexing strategy, ORM selection, serverless databases.
---

# Database Design

> **Học cách TƯ DUY, không phải copy các mẫu SQL.**

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Quy tắc Đọc có chọn lọc](#quy-tắc-đọc-có-chọn-lọc-selective-reading-rule)
3. [Nguyên tắc cốt lõi](#nguyên-tắc-cốt-lõi)
4. [Danh sách kiểm tra](#danh-sách-kiểm-tra-decision-checklist)
5. [Anti-Patterns (Những điều tuyệt đối tránh)](#anti-patterns-những-điều-tuyệt-đối-tránh)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Năng lực cốt lõi (Core Capabilities)
- Thiết kế Schema (Normalization/Denormalization).
- Lựa chọn Database (Relational vs NoSQL vs Serverless).
- Lựa chọn ORM (Prisma, Drizzle, Kysely).
- Chiến lược lập chỉ mục (Indexing Strategy).
- Tối ưu hóa truy vấn (Query Optimization).

## Quy tắc Đọc có chọn lọc (Selective Reading Rule)

**Chỉ đọc các file liên quan đến yêu cầu!** Kiểm tra sơ đồ nội dung để tìm thứ bạn cần.

| File | Mô tả | Khi nào cần đọc |
|------|-------------|--------------|
| `database-selection.md` | PostgreSQL vs Neon vs Turso vs SQLite | Khi chọn loại Database |
| `orm-selection.md` | Drizzle vs Prisma vs Kysely | Khi chọn ORM |
| `schema-design.md` | Normalization, PKs, Relationships | Khi thiết kế Schema |
| `indexing.md` | Các loại Index, Composite indexes | Khi tinh chỉnh hiệu năng |
| `optimization.md` | N+1, EXPLAIN ANALYZE | Khi tối ưu hóa truy vấn |
| `migrations.md` | Safe migrations, Serverless DBs | Khi thay đổi Schema |

## Nguyên tắc cốt lõi

- **HỎI người dùng** về sở thích database nếu không rõ.
- Chọn Database/ORM dựa trên **NGỮ CẢNH (CONTEXT)**.
- Đừng mặc định dùng PostgreSQL cho mọi thứ.

## Danh sách kiểm tra (Decision Checklist)

Trước khi thiết kế schema:
- [ ] Đã hỏi người dùng về sở thích Database chưa?
- [ ] Đã chọn loại Database phù hợp cho ngữ cảnh NÀY chưa?
- [ ] Đã cân nhắc đến môi trường triển khai (Deployment) chưa?
- [ ] Đã lập kế hoạch cho chiến lược Index chưa?
- [ ] Đã định nghĩa rõ ràng các loại quan hệ (Relationships)?

## Anti-Patterns (Những điều tuyệt đối tránh)

- ❌ Mặc định dùng PostgreSQL cho các ứng dụng đơn giản (SQLite có thể là đủ).
- ❌ Bỏ qua việc lập Index.
- ❌ Sử dụng `SELECT *` trong môi trường Production.
- ❌ Lưu dữ liệu dạng JSON khi dữ liệu có cấu trúc (Structured data) sẽ tốt hơn.
- ❌ Bỏ qua vấn đề truy vấn N+1.

## Tài liệu tham khảo
- `database-selection.md`.
- `schema-design.md`.
- `indexing.md`.
- PostgreSQL Documentation.
- Prisma/Drizzle Documentation.
