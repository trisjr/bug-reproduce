---
name: nodejs-best-practices
description: Các nguyên tắc phát triển và ra quyết định trong Node.js. Lựa chọn framework, các pattern bất đồng bộ (async), bảo mật và kiến trúc.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Node.js Best Practices

> Các nguyên tắc và tư duy ra quyết định cho việc phát triển Node.js năm 2025.
> **Học cách TƯ DUY, không chỉ máy móc copy các pattern.**

## Table of Contents
1. [Cách sử dụng Skill này](#-cách-sử-dụng-skill-này)
2. [Lựa chọn Framework](#1-lựa-chọn-framework-2025)
3. [Các lưu ý về Runtime](#2-các-lưu-ý-về-runtime-2025)
4. [Nguyên tắc Kiến trúc](#3-nguyên-tắc-kiến-trúc)
5. [Nguyên tắc Xử lý lỗi](#4-nguyên-tắc-xử-lý-lỗi)
6. [Nguyên tắc Async Patterns](#5-nguyên-tắc-async-patterns)
7. [Nguyên tắc Validation](#6-nguyên-tắc-validation)
8. [Nguyên tắc Bảo mật](#7-nguyên-tắc-bảo-mật)
9. [Nguyên tắc Kiểm thử](#8-nguyên-tắc-kiểm-thử)
10. [Anti-Patterns](#10-anti-patterns-cần-tránh)
11. [Danh sách Quyết định](#11-danh-sách-quyết-định)
12. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## ⚠️ Cách sử dụng Skill này

Skill này tập trung vào **nguyên tắc ra quyết định**, không phải những đoạn code cố định.
- HỎI ý kiến người dùng khi có điểm chưa rõ.
- Chọn framework/pattern dựa trên **NGỮ CẢNH (CONTEXT)**.
- Đừng mặc định một giải pháp cho mọi bài toán.

## 1. Lựa chọn Framework (2025)

### Cây quyết định (Decision Tree)
1. **Edge/Serverless (Cloudflare, Vercel)**: Sử dụng **Hono** (không phụ thuộc, khởi động cực nhanh).
2. **High Performance API**: Sử dụng **Fastify** (nhanh hơn Express 2-3 lần).
3. **Doanh nghiệp/Đòi hỏi sự bài bản**: Sử dụng **NestJS** (cấu trúc tốt, DI, decorators).
4. **Legacy/Ổn định/Hệ sinh thái lớn nhất**: Sử dụng **Express**.

## 2. Các lưu ý về Runtime (2025)

- **Native TypeScript**: Node.js 22+ hỗ trợ `--experimental-strip-types` để chạy trực tiếp file `.ts`.
- **Module System**: Luôn ưu tiên **ESM (import/export)** cho dự án mới thay vì CommonJS.
- **Runtimes khác**: Ngoài Node.js, hãy cân nhắc **Bun** (hiệu năng cao) hoặc **Deno** (an toàn).

## 3. Nguyên tắc Kiến trúc (Architecture)

### Cấu trúc đa tầng (Layered Structure)
1. **Controller Layer**: Xử lý HTTP specifics và validate đầu vào.
2. **Service Layer**: Nơi chứa Business Logic (không phụ thuộc framework).
3. **Repository Layer**: Chỉ xử lý truy cập dữ liệu (DB Queries, ORM).

## 4. Nguyên tắc Xử lý lỗi (Error Handling)

- **Tập trung hóa**: Sử dụng Middleware để bắt lỗi ở cấp cao nhất.
- **Phản hồi**: Khách hàng nhận được mã trạng thái HTTP thích hợp, **KHÔNG** bao giờ lộ thông tin nội bộ (như stack trace).

### Mã trạng thái HTTP (Status Codes)
- 400: Dữ liệu đầu vào sai.
- 401: Chưa xác thực.
- 403: Không có quyền.
- 404: Không tìm thấy.
- 422: Schema đúng nhưng vi phạm quy tắc nghiệp vụ.
- 500: Lỗi hệ thống.

## 5. Nguyên tắc Async Patterns
- Sử dụng `async/await` cho tuần tự, `Promise.all` cho thực thi song song độc lập.
- **Lưu ý Event Loop**: Đừng bao giờ block Event Loop bằng các tác vụ nặng về CPU (mã hóa, xử lý ảnh) ở thread chính; hãy dùng Worker Threads.

## 6. Nguyên tắc Validation
- **Validate tại ranh giới (Boundaries)**: Validate ngay khi dữ liệu đi vào API, trước khi lưu DB.
- **Thư viện**: **Zod** (ưu tiên hàng đầu cho TypeScript), **Valibot** (khi cần bundle nhỏ).

## 7. Nguyên tắc Bảo mật (Security)
- [ ] Không bao giờ nối chuỗi SQL (phòng chống SQL Injection).
- [ ] Băm password bằng **Argon2** hoặc **bcrypt**.
- [ ] Sử dụng biến môi trường (`.env`) cho các bí mật (Secrets).
- [ ] Sử dụng **Helmet.js** để thiết lập các header bảo mật.

## 8. Nguyên tắc Kiểm thử (Testing)
- **Unit**: Logic nghiệp vụ.
- **Integration**: Các endpoint API (dùng Supertest).
- **Node.js 22+**: Có sẵn test runner (`node --test`), không nhất thiết phải cài thư viện ngoài.

## 10. Anti-Patterns (Cần tránh)
- ❌ Dùng các phương thức đồng bộ (`fs.readFileSync`) trong code Production.
- ❌ Đưa logic nghiệp vụ trực tiếp vào Controller.
- ❌ Hardcode bí mật trực tiếp vào code.

## Tài liệu tham khảo
- Node.js Official Documentation.
- Goldbergyoni's Node.js Best Practices (GitHub).
- OWASP Node.js Security Cheat Sheet.
