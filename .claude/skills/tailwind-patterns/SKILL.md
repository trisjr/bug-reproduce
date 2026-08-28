---
name: tailwind-patterns
description: Các nguyên tắc của Tailwind CSS v4. Quy trình cấu hình hướng CSS (CSS-first), truy vấn container (container queries), các pattern hiện đại và kiến trúc thiết kế dựa trên token.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Tailwind CSS Patterns (v4 - 2025)

> CSS hiện đại hướng tiện ích (utility-first) với cấu hình thuần CSS.

## Table of Contents
1. [Kiến trúc Tailwind v4](#1-kiến-trúc-tailwind-v4)
2. [Cấu hình hướng CSS](#2-cấu-hình-hướng-css-css-based-configuration)
3. [Container Queries (v4 Native)](#3-container-queries-v4-native)
4. [Thiết kế Responsive](#4-thiết-kế-responsive)
5. [Chế độ Tối (Dark Mode)](#5-dark-mode)
6. [Các Pattern Layout hiện đại](#6-các-pattern-layout-hiện-đại)
7. [Hệ thống Màu sắc hiện đại](#7-hệ-thống-màu-sắc-hiện-đại)
8. [Hệ thống Typography](#8-hệ-thống-typography)
9. [Animation & Transitions](#9-animation--transitions)
10. [Trích xuất Component](#10-trích-xuất-component)
11. [Anti-Patterns](#11-anti-patterns)
12. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## 1. Kiến trúc Tailwind v4

### Thay đổi so với v3
- **Cấu hình**: Chuyển từ `tailwind.config.js` sang `@theme` trực tiếp trong CSS.
- **Engine**: Sử dụng Oxide engine (viết bằng Rust), nhanh hơn 10 lần.
- **Nesting**: Hỗ trợ CSS nesting nguyên bản mà không cần PostCSS.
- **Biến CSS**: Tận dụng triệt để CSS Variables cho mọi token.

## 2. Cấu hình hướng CSS (CSS-Based Configuration)

### Định nghĩa Theme
```css
@theme {
  /* Màu sắc - nên sử dụng tên có ý nghĩa nghiệp vụ (semantic) */
  --color-primary: oklch(0.7 0.15 250);
  --color-surface: oklch(0.98 0 0);
  
  /* Hệ thống khoảng cách (Spacing) */
  --spacing-md: 1rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

## 3. Container Queries (v4 Native)
- **Breakpoint** (`md:`): Phản hồi theo độ rộng Viewport (toàn màn hình).
- **Container** (`@container`): Phản hồi theo độ rộng của **phần tử cha**.
- **Khi nào dùng**: Ưu tiên Container Queries cho các component có khả năng tái sử dụng (để chúng tự thích nghi với vị trí được đặt).

## 4. Thiết kế Responsive
- **Nguyên tắc Mobile-First**: Viết style cho mobile trước (không có tiền tố), sau đó mới thêm các ghi đè (overrides) cho màn hình lớn bằng tiền tố `md:`, `lg:`.

## 5. Chế độ Tối (Dark Mode)
- Sử dụng tiền tố `dark:` (ví dụ: `bg-white dark:bg-zinc-900`).

## 6. Các Pattern Layout hiện đại
- **Flexbox**: `flex items-center justify-between`.
- **Grid**: `grid grid-cols-3`.
- **Bento Layout**: Ưu tiên các bố cục bất đối xứng (asymmetric) thay vì các lưới 3 cột truyền thống để tạo cảm giác hiện đại.

## 7. Hệ thống Màu sắc hiện đại
- Ưu tiên sử dụng định dạng **OKLCH** thay vì RGB/HSL để có màu sắc đồng nhất về mặt cảm nhận thị giác.

## 11. Anti-Patterns (Những điều cần tránh)
- ❌ Sử dụng các giá trị tùy ý (arbitrary values) ở mọi nơi (nên dùng scale của Design System).
- ❌ Lạm dụng `!important`.
- ❌ Trộn lẫn cấu hình của v3 vào workflow của v4.
- ❌ Lạm dụng `@apply` (nên trích xuất thành Component React/Vue).

## Tài liệu tham khảo
- Tailwind CSS v4 Documentation (tailwindcss.com).
- OKLCH Color Picker & Guide.
- Oxide Engine Project (GitHub).
