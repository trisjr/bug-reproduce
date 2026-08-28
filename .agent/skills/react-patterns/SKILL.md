---
name: react-patterns
description: Các pattern và nguyên tắc React hiện đại. Bao gồm Hooks, composition, performance và best practices với TypeScript.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# React Patterns

> Các nguyên tắc để xây dựng ứng dụng React chuẩn Production.

## Table of Contents
1. [Nguyên tắc Thiết kế Component](#1-nguyên-tắc-thiết-kế-component)
2. [Pattern cho Hook](#2-pattern-cho-hook)
3. [Lựa chọn Quản lý State](#3-lựa-chọn-quản-lý-state)
4. [Pattern trong React 19](#4-pattern-trong-react-19)
5. [Pattern về Composition](#5-pattern-về-composition)
6. [Nguyên tắc Hiệu năng](#6-nguyên-tắc-hiệu-năng)
7. [Xử lý lỗi](#7-xử-lý-lỗi)
8. [Pattern với TypeScript](#8-pattern-với-typescript)
9. [Nguyên tắc Kiểm thử](#9-nguyên-tắc-kiểm-thử)
10. [Anti-Patterns](#10-anti-patterns)
11. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## 1. Nguyên tắc Thiết kế Component

### Các loại Component (Component Types)

| Loại | Mục đích sử dụng | State |
|------|-----|-------|
| **Server** | Fetch dữ liệu, static content | Không có |
| **Client** | Tính tương tác | useState, effects |
| **Presentational** | Hiển thị UI | Chỉ dùng Props |
| **Container** | Logic/state phức tạp | State nặng |

### Quy tắc Thiết kế
- Mỗi component chỉ giữ một nhiệm vụ duy nhất (Single Responsibility).
- Props truyền xuống, Events đẩy lên (Props down, events up).
- Ưu tiên Composition thay vì kế thừa (Composition over inheritance).
- Ưu tiên các component nhỏ, tập trung.

## 2. Pattern cho Hook

### Khi nào nên trích xuất Hook (Extract Hooks)

| Pattern | Khi nào? |
|---------|-------------|
| **useLocalStorage** | Cần dùng chung logic lưu trữ |
| **useDebounce** | Nhiều giá trị cần debounce |
| **useFetch** | Các pattern fetch dữ liệu lặp lại |
| **useForm** | State của form phức tạp |

### Quy tắc dùng Hook
- Chỉ gọi Hook ở cấp độ cao nhất (top level).
- Thứ tự gọi Hook phải nhất quán trong mỗi lần render.
- Hook tùy chỉnh bắt đầu bằng tiền tố "use".
- Cleanup các effect khi unmount.

## 3. Lựa chọn Quản lý State

| Độ phức tạp | Giải pháp |
|------------|----------|
| Đơn giản | useState, useReducer |
| Dùng chung cục bộ | Context API |
| State từ Server | TanStack Query (React Query), SWR |
| Global phức tạp | Zustand, Redux Toolkit |

## 4. Pattern trong React 19

### Các Hook mới
- **useActionState**: Quản lý trạng thái submission của form.
- **useOptimistic**: Cập nhật UI theo hướng lạc quan (Optimistic updates).
- **use**: Đọc các resource (như Promise/Context) trực tiếp trong render.

### Lợi ích từ Compiler
- Tự động memoization.
- Giảm việc phải dùng useMemo/useCallback thủ công.

## 6. Nguyên tắc Hiệu năng (Performance)

### Khi nào cần tối ưu?
- Re-render chậm: Hãy Profile trước.
- Danh sách lớn: Sử dụng Virtualization (Ví dụ: React Window).
- Tính toán đắt đỏ: Sử dụng useMemo.
- Callback ổn định: Sử dụng useCallback.

### Thứ tự tối ưu
1. Kiểm tra xem có thực sự chậm không.
2. Profile bằng DevTools.
3. Xác định bottleneck (điểm nghẽn).
4. Áp dụng fix có mục tiêu.

## 8. TypeScript Patterns

### Props Typing
- Sử dụng **Interface** cho props của component.
- Sử dụng **Type** cho unions hoặc logic phức tạp.
- Sử dụng **Generic** cho các component có khả năng tái sử dụng cao.

### Các Type thông dụng
- Children: `ReactNode`.
- Event handler: `MouseEventHandler`, `ChangeEventHandler`.
- Ref: `RefObject<Element>`.

## 10. Anti-Patterns (Những điều cần tránh)

| ❌ Không nên | ✅ Nên làm |
|----------|-------|
| Prop drilling quá sâu | Sử dụng Context hoặc Store |
| Component khổng lồ | Chia nhỏ thành các component bé |
| Dùng useEffect cho mọi thứ | Sử dụng Server Components hoặc Event Handlers |
| Tối ưu hóa sớm (Premature) | Profile trước khi tối ưu |
| Dùng Index làm key | Sử dụng ID duy nhất và ổn định |

## Tài liệu tham khảo
- React Official Documentation.
- TanStack Query Documentation.
- Kent C. Dodds - "React Patterns".
