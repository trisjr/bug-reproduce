---
name: vercel-react-best-practices
description: Các nguyên tắc tối ưu hóa hiệu năng React và Next.js từ đội ngũ Engineering của Vercel. Sử dụng khi viết, review hoặc refactor code React/Next.js để đảm bảo các pattern hiệu năng tối ưu.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices

Hướng dẫn tối ưu hóa hiệu năng toàn diện cho ứng dụng React và Next.js, được duy trì bởi Vercel. Bao gồm 45 quy tắc chia thành 8 danh mục, được ưu tiên theo mức độ tác động.

## Table of Contents
1. [Khi nào cần áp dụng](#khi-nào-cần-áp-dụng)
2. [Danh mục quy tắc theo mức độ ưu tiên](#danh-mục-quy-tắc-theo-mức-độ-ưu-tiên)
3. [Tra cứu nhanh](#tra-cứu-nhanh)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Khi nào cần áp dụng (When to Apply)

Tham khảo các hướng dẫn này khi:
- Viết mới các component React hoặc trang Next.js.
- Triển khai việc fetch dữ liệu (cả ở phía client và server).
- Review code để phát hiện các vấn đề về hiệu năng.
- Refactor code React/Next.js hiện có.
- Tối ưu hóa kích thước bundle hoặc thời gian load trang.

## Danh mục quy tắc theo mức độ ưu tiên

| Ưu tiên | Danh mục | Tác động | Tiền tố |
|----------|----------|--------|--------|
| 1 | Loại bỏ tình trạng Waterfall | Cực kỳ quan trọng (CRITICAL) | `async-` |
| 2 | Tối ưu hóa kích thước Bundle | Cực kỳ quan trọng (CRITICAL) | `bundle-` |
| 3 | Hiệu năng phía Server | Cao (HIGH) | `server-` |
| 4 | Fetch dữ liệu phía Client | Trung bình - Cao | `client-` |
| 5 | Tối ưu hóa Re-render | Trung bình | `rerender-` |
| 6 | Hiệu năng Rendering | Trung bình | `rendering-` |
| 7 | Hiệu năng JavaScript | Thấp - Trung bình | `js-` |
| 8 | Các Pattern nâng cao | Thấp | `advanced-` |

## Tra cứu nhanh (Quick Reference)

### 1. Loại bỏ Waterfall (CRITICAL)
- `async-defer-await`: Đưa `await` vào sâu trong các nhánh code thực sự cần dùng dữ liệu đó.
- `async-parallel`: Sử dụng `Promise.all()` cho các thao tác độc lập.
- `async-suspense-boundaries`: Sử dụng **Suspense** để stream nội dung.

### 2. Tối ưu hóa Bundle (CRITICAL)
- `bundle-barrel-imports`: Import trực tiếp từ file nguồn, tránh sử dụng các file barrel (`index.ts` tập trung).
- `bundle-dynamic-imports`: Sử dụng `next/dynamic` cho các component nặng.
- `bundle-defer-third-party`: Load các script bên thứ ba (analytics, logging) sau khi trang đã hydration xong.

### 3. Hiệu năng phía Server (HIGH)
- `server-cache-react`: Sử dụng `React.cache()` để khử trùng lặp (deduplication) trong cùng một request.
- `server-serialization`: Giảm thiểu lượng dữ liệu truyền từ Server xuống Client Components.

### 5. Tối ưu hóa Re-render (MEDIUM)
- `rerender-memo`: Trích xuất các tác vụ nặng vào các component được memo.
- `rerender-derived-state`: Đăng ký (subscribe) vào các giá trị Boolean được phái sinh, thay vì các giá trị thô.

### 6. Hiệu năng Rendering (MEDIUM)
- `rendering-content-visibility`: Sử dụng thuộc tính `content-visibility` cho các danh sách dài.
- `rendering-hoist-jsx`: Đưa các JSX tĩnh ra ngoài định nghĩa component.

## Cách sử dụng
Đọc từng file quy tắc để biết chi tiết và ví dụ code:
- `rules/async-parallel.md`
- `rules/bundle-barrel-imports.md`

## Tài liệu tham khảo
- Vercel Engineering Blog.
- Next.js Documentation on Performance.
- `AGENTS.md` (Full guide expanded).
