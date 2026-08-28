---
name: implementing-figma-designs
description: Quy trình chuẩn hóa để triển khai các thiết kế Figma 1:1 bằng cách sử dụng Design System hoặc Thư viện Component hiện có của dự án. Ưu tiên độ chính xác về thị giác, dữ liệu giả (mock data) và cấu trúc trước logic nghiệp vụ. Được kích hoạt khi triển khai từ Figma.
allowed-tools: Read, Grep, Glob, Find, View
---

# Implementing Figma Designs

Skill này chuẩn hóa quy trình chuyển đổi thiết kế Figma thành code với độ chính xác pixel-perfect. Nó thực thi workflow **"UI First, Data Later"** (UI trước, Dữ liệu sau) để tách biệt việc triển khai giao diện khỏi các phụ thuộc backend.

## Table of Contents
1. [Các nguyên tắc cốt lõi](#các-nguyên-tắc-cốt-lõi)
2. [Workflow chuẩn hóa](#workflow-chuẩn-hóa)
3. [Giao thức tra cứu Component](#giao-thức-tra-cứu-component-lookup-protocol)
4. [Danh sách kiểm tra chất lượng](#danh-sách-kiểm-tra-chất-lượng-quality-checklist)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Các nguyên tắc cốt lõi (Core Principles)

1. **UI First (Hollow Shell)**: Chỉ triển khai lớp giao diện. Sử dụng dữ liệu giả (mock data). Bỏ qua việc tích hợp API và logic state phức tạp ở giai đoạn đầu.
2. **Mock là Nguồn chân lý (Source of Truth)**: Hardcode text, số liệu và hình ảnh chính xác như trong thiết kế. Không sử dụng placeholder chung chung (Lorem Ipsum).
3. **Tuân thủ Design System**: Luôn sử dụng các token có sẵn (màu sắc, khoảng cách, typography) và các component hiện có thay vì dùng các con số tùy tiện (magic numbers).

## Workflow chuẩn hóa

### Bước 1: Khám phá (Discovery)
Trước khi viết code, việc xác định công cụ styling và các component hiện có là tối quan trọng.
- **Xác định Tech Stack & Styling**: Đọc `package.json` để tìm thư viện (Tailwind, MUI, Radix...). Tìm các file config (`tailwind.config.js`, `theme.ts`) để hiểu hệ thống Token.
- **Tìm kiếm Thư viện Component**: Tìm các thư mục UI dùng chung (ví dụ: `src/components`).

### Bước 2: Phân tích Giao diện & Kiểm kê
Phân tích thiết kế để lập kế hoạch phân cấp component.
- **Block-out**: Định nghĩa layout cấp cao (Stacks, Grids, Sections).
- **Khớp Component**: Ánh xạ các phần tử UI vào các component đã có trong code. Dùng `grep_search` để xem cách các component đó đã được sử dụng ở nơi khác.

### Bước 3: Tạo Dữ liệu giả (Mock Data Generation)
Tạo dữ liệu phản chiếu thiết kế 1:1.

```typescript
// ✅ Đúng: Text chính xác từ thiết kế
const MOCK_DATA = {
  title: "Dashboard Overview",
  balance: "$12,345.00",
};
```

### Bước 4: Triển khai (Pass 1:1)
Xây dựng component "Vỏ rỗng" (Hollow Shell).
- **Cấu trúc**: Viết JSX/HTML dùng các layout primitives (Div, Stack, Grid).
- **Tokenize**: Áp dụng style bằng project tokens (ví dụ: `p-4`, `text-primary`).
- **Mock binding**: Đổ `MOCK_DATA` vào các component.
- **Tinh chỉnh**: Kiểm tra độ tương đồng (padding, căn lề, font weights).

## Giao thức tra cứu Component (Lookup Protocol)

- **Để tìm định nghĩa component**:
  `find_by_name "ComponentName" --Type file --Extensions tsx,jsx,vue`
- **Để tìm ví dụ sử dụng (Xác minh)**:
  `grep_search "ComponentName" --Includes "*.stories.tsx,*.test.tsx,*Demo.tsx"`

## Danh sách kiểm tra chất lượng (Quality Checklist)
- [ ] **Visual Parity**: Nó có trông giống hệt ảnh chụp màn hình không?
- [ ] **Hardcoded Accuracy**: Text/hình ảnh có khớp chính xác không? (Chưa dùng "Loading..." ở giai đoạn này).
- [ ] **System Usage**: Khoảng cách/màu sắc có dùng biến/class (ví dụ: `text-blue-500`) thay vì hex code không?
- [ ] **No Logic Blocking**: UI có hoạt động độc lập với trạng thái API không?

## Tài liệu tham khảo
- Project Design Guidelines.
- Storybook (nếu có).
- Tailwind/MUI/CSS-in-JS Documentation.
