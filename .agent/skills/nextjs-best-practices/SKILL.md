---
name: nextjs-best-practices
description: Các nguyên tắc của Next.js App Router. Bao gồm Server Components, fetching dữ liệu, và các routing pattern.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Next.js Best Practices

> Các nguyên tắc phát triển ứng dụng với Next.js App Router.

## Table of Contents
1. [Server vs Client Components](#1-server-vs-client-components)
2. [Pattern Fetch Dữ liệu](#2-pattern-fetch-dữ-liệu)
3. [Nguyên tắc Routing](#3-nguyên-tắc-routing)
4. [API Routes (Route Handlers)](#4-api-routes)
5. [Nguyên tắc Hiệu năng](#5-nguyên-tắc-hiệu-năng)
6. [Metadata & SEO](#6-metadata)
7. [Chiến lược Caching](#7-chiến-lược-caching)
8. [Server Actions](#8-server-actions)
9. [Anti-Patterns](#9-anti-patterns)
10. [Cấu trúc Dự án](#10-cấu-trúc-dự-án)
11. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## 1. Server vs Client Components

### Cây quyết định (Decision Tree)
```
Nó có cần...?
│
├── useState, useEffect, event handlers
│   └── Client Component ('use client')
│
├── Fetch dữ liệu trực tiếp, không tương tác
│   └── Server Component (Mặc định)
│
└── Cả hai? 
    └── Chia nhỏ: Cha là Server + Con là Client
```

## 2. Pattern Fetch Dữ liệu (Data Fetching)

| Pattern | Mục đích sử dụng |
|---------|-----|
| **Mặc định** | Static (được cache khi build) |
| **Revalidate** | ISR (refresh dựa trên thời gian) |
| **No-store** | Dynamic (mỗi request một lần) |

- **DB:** Fetch trực tiếp trong Server Component.
- **API:** Dùng `fetch()` kèm theo cơ chế caching của Next.js.

## 3. Nguyên tắc Routing

### Các file quy ước (File Conventions)
- `page.tsx`: UI của Route.
- `layout.tsx`: Layout dùng chung.
- `loading.tsx`: Trạng thái loading.
- `error.tsx`: Error boundary xử lý lỗi.
- `not-found.tsx`: Trang 404.

## 4. API Routes (Route Handlers)
- Sử dụng **GET, POST, PUT, DELETE**.
- Validate dữ liệu đầu vào bằng **Zod**.
- Sử dụng **Edge runtime** khi có thể để đạt tốc độ cao nhất.

## 5. Nguyên tắc Hiệu năng (Performance)
- **Tối ưu hình ảnh**: Sử dụng component `next/image`.
- **Bundle Optimization**: Sử dụng dynamic imports cho các component nặng.
- **Code splitting**: Tự động hóa dựa trên Route.

## 6. Metadata
- **Static**: Khai báo metadata cố định.
- **Dynamic**: Sử dụng hàm `generateMetadata` cho các trang động (như chi tiết sản phẩm).

## 7. Chiến lược Caching
Next.js có nhiều lớp cache: **Request, Data, Full Route**.
- Cần nắm vững `revalidatePath` và `revalidateTag` để làm mới dữ liệu khi cần (ví dụ: sau khi update DB).

## 8. Server Actions
Sử dụng cho: Submit form, thay đổi dữ liệu (mutations), kích hoạt revalidation.
- Luôn đánh dấu bằng `'use server'`.

## 9. Anti-Patterns (Những điều cần tránh)
- ❌ Dùng `'use client'` ở mọi nơi.
- ❌ Fetch dữ liệu trong Client Components (gây hiệu ứng waterfall).
- ❌ Bỏ qua trạng thái loading/error.

## 10. Cấu trúc Dự án (Project Structure)
```
app/
├── (marketing)/     # Nhóm Route (không hiện trên URL)
│   └── page.tsx
├── (dashboard)/
│   ├── layout.tsx   # Layout trang Dashboard
│   └── page.tsx
├── api/
│   └── [resource]/
│       └── route.ts
└── components/
    └── ui/          # Các component nguyên tử (atom)
```

## Tài liệu tham khảo
- Next.js Documentation (nextjs.org/docs).
- Vercel Best Practices.
- "Next.js App Router" by Nikolas Burk.
