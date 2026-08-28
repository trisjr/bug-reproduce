---
name: frontend-dev-guidelines
description: Hướng dẫn phát triển Frontend cho ứng dụng React/TypeScript. Bao gồm các pattern hiện đại như Suspense, lazy loading, useSuspenseQuery, tổ chức file với thư mục features, styling với MUI v7, TanStack Router, tối ưu hóa hiệu năng và best practices cho TypeScript.
---

# Frontend Development Guidelines

## Mục đích
Hướng dẫn toàn diện cho việc phát triển React hiện đại, nhấn mạnh vào việc fetch dữ liệu dựa trên Suspense, lazy loading, tổ chức file bài bản và tối ưu hóa hiệu năng.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Tham chiếu nhanh Import Aliases](#tham-chiếu-nhanh-import-aliases)
3. [Hướng dẫn theo chủ đề](#hướng-dẫn-theo-chủ-đề)
4. [Nguyên tắc cốt lõi](#nguyên-tắc-cốt-lõi)
5. [Cấu trúc file mẫu](#cấu- trúc-file-mẫu)
6. [Template Component hiện đại](#template-component-hiện-đại-quick-copy)
7. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Khởi đầu nhanh (Quick Start)

### Danh sách kiểm tra cho Component mới (New Component Checklist)
- [ ] Sử dụng pattern `React.FC<Props>` với TypeScript.
- [ ] Sử dụng Lazy load nếu là component nặng: `React.lazy(() => import())`.
- [ ] Bao bọc trong `<SuspenseLoader>` cho các trạng thái loading.
- [ ] Sử dụng `useSuspenseQuery` để fetch dữ liệu.
- [ ] Sử dụng Import aliases: `@/`, `~types`, `~components`, `~features`.
- [ ] Style: Viết inline nếu < 100 dòng, tách file riêng nếu > 100 dòng.
- [ ] Sử dụng `useCallback` cho các event handler truyền xuống component con.
- [ ] Không sử dụng "early returns" kèm theo spinner (tránh layout shift).

### Danh sách kiểm tra cho Feature mới (New Feature Checklist)
- [ ] Tạo thư mục `features/{feature-name}/`.
- [ ] Tạo các thư mục con: `api/`, `components/`, `hooks/`, `helpers/`, `types/`.
- [ ] Tạo file API service: `api/{feature}Api.ts`.
- [ ] Thiết lập type trong `types/`.
- [ ] Tạo route trong `routes/{feature-name}/index.tsx`.

## Tham chiếu nhanh Import Aliases

| Alias | Trỏ tới | Ví dụ |
|-------|-------------|---------|
| `@/` | `src/` | `import { apiClient } from '@/lib/apiClient'` |
| `~types` | `src/types` | `import type { User } from '~types/user'` |
| `~components` | `src/components` | `import { SuspenseLoader } from '~components/SuspenseLoader'` |
| `~features` | `src/features` | `import { authApi } from '~features/auth'` |

## Hướng dẫn theo chủ đề (Topic Guides)

### 🎨 Pattern Component
- Sử dụng `React.lazy()` cho code splitting.
- Cấu trúc component: Props → Hooks → Handlers → Render → Export.

### 📊 Fetch dữ liệu (Data Fetching)
**PATTERN CHÍNH: useSuspenseQuery**
- Sử dụng cùng với các Suspense boundaries.
- Thay thế hoàn toàn cho việc kiểm tra `isLoading` thủ công.
- Type-safe với generics.

### 📁 Tổ chức File
- `features/`: Chứa các thành phần theo domain (posts, comments, auth).
- `components/`: Chứa các thành phần có khả năng tái sử dụng thực sự (SuspenseLoader, CustomAppBar).

### 🎨 Styling
**MUI v7 Grid:**
```typescript
<Grid size={{ xs: 12, md: 6 }}>  // ✅ Cú pháp v7
<Grid xs={12} md={6}>             // ❌ Cú pháp cũ
```

### 🛣️ Routing
**TanStack Router - Folder-Based:**
- Thư mục: `routes/my-route/index.tsx`.
- Sử dụng `createFileRoute`.

### ⏳ Trạng thái Loading & Error
**QUY TẮC QUAN TRỌNG: Không dùng Early Returns**
- ❌ KHÔNG dùng: `if (isLoading) return <Spinner />` (gây layout shift).
- ✅ LUÔN dùng: Bao bọc nội dung trong `<SuspenseLoader>`.

## Nguyên tắc cốt lõi (Core Principles)
1. **Lazy Load mọi thứ nặng**: Routes, DataGrid, charts, editors.
2. **Dùng Suspense cho Loading**: Sử dụng `SuspenseLoader` để có trải nghiệm UX tốt hơn.
3. **Features quy củ**: Luôn chia nhỏ thành `api/`, `components/`, `hooks/`, `helpers/`.
4. **Không dùng early returns**: Ngăn chặn tình trạng Cumulative Layout Shift (CLS).

## Template Component hiện đại (Quick Copy)

```typescript
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { featureApi } from '../api/featureApi';
import type { FeatureData } from '~types/feature';

export const MyComponent: React.FC<MyComponentProps> = ({ id, onAction }) => {
    const { data } = useSuspenseQuery({
        queryKey: ['feature', id],
        queryFn: () => featureApi.getFeature(id),
    });

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3 }}>
                {/* Nội dung */}
            </Paper>
        </Box>
    );
};

export default MyComponent;
```

## Tài liệu tham khảo
- [React Patterns Guide](resources/component-patterns.md).
- [Data Fetching Strategy](resources/data-fetching.md).
- [Styling Guide](resources/styling-guide.md).
- Vite Config (vite.config.ts).