# Visual Consistency Audit Guide

## Mục lục
1. [Typography](#1-typography)
2. [Color Palette](#2-color-palette)
3. [Spacing & Layout](#3-spacing--layout)
4. [Components](#4-components)
5. [Iconography](#5-iconography)
6. [Images & Media](#6-images--media)
7. [Quy trình Audit](#quy-trình-audit)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Typography

### Checklist
- [ ] **Font family** khớp Design System (primary, secondary, mono)
- [ ] **Font weight** đúng theo hierarchy (heading: 600-700, body: 400, caption: 300-400)
- [ ] **Font size** scale nhất quán (thường theo scale: 12, 14, 16, 18, 20, 24, 30, 36, 48)
- [ ] **Line height** phù hợp (body: 1.5-1.6, heading: 1.2-1.3)
- [ ] **Letter spacing** nhất quán (thường 0 hoặc -0.01em cho heading)
- [ ] **Text color** đúng semantic (primary, secondary, disabled, inverse)
- [ ] Không có font-size nhỏ hơn **12px** (readability minimum)

### Cách kiểm tra
1. Mở DevTools → Inspect element
2. So sánh computed styles với Design System tokens
3. Check font loading: đảm bảo không FOIT/FOUT (Flash of Invisible/Unstyled Text)

## 2. Color Palette

### Checklist
- [ ] **Primary color** đúng hex/HSL
- [ ] **Secondary/accent colors** khớp palette
- [ ] **Semantic colors** nhất quán:
  - Success: green shade
  - Warning: yellow/amber shade
  - Error/Danger: red shade
  - Info: blue shade
- [ ] **Neutral/Gray scale** đúng (background, border, text muted)
- [ ] **Dark mode** (nếu có): colors inverted đúng, contrast vẫn đạt chuẩn
- [ ] Không dùng color hardcoded — phải dùng CSS variables/tokens

### Cách kiểm tra
1. DevTools → Styles pane → kiểm tra CSS variables
2. Eye-dropper tool → so sánh hex values
3. Contrast Analyzer → đảm bảo WCAG compliant

## 3. Spacing & Layout

### Checklist
- [ ] **Spacing scale** nhất quán (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- [ ] **Padding** nội bộ component nhất quán (button, card, input)
- [ ] **Margin** giữa sections nhất quán
- [ ] **Gap** trong grid/flex layouts nhất quán
- [ ] **Max-width** cho content (thường 1200-1440px)
- [ ] **Alignment** — elements aligned theo grid, không lệch
- [ ] **Density** — không quá crowded hoặc quá sparse

### Cách kiểm tra
1. DevTools → Box model tab
2. Overlay grid lines (DevTools → Settings → Show rulers)
3. Pixel-level measurement extensions

## 4. Components

### Checklist
- [ ] **Buttons**: đúng variant (primary, secondary, ghost, danger)
  - [ ] Size variants nhất quán (sm, md, lg)
  - [ ] States: default, hover, active, focus, disabled, loading
  - [ ] Icon + text alignment đúng
- [ ] **Inputs**: border, radius, padding nhất quán
  - [ ] States: default, focus, filled, error, disabled
  - [ ] Label position nhất quán (top, left, floating)
- [ ] **Cards**: shadow, radius, padding nhất quán
- [ ] **Modals/Dialogs**: overlay color, animation, close button position
- [ ] **Tables**: header style, row striping, border
- [ ] **Navigation**: active state, hover state, breadcrumb style
- [ ] **Tags/Badges**: color coding, border-radius, padding

### Cách kiểm tra
1. Screenshot → so sánh side-by-side với Design System docs
2. Kiểm tra CSS class usage — có dùng đúng component library?
3. Storybook (nếu có) → cross-reference

## 5. Iconography

### Checklist
- [ ] **Icon set** nhất quán (cùng 1 library: Lucide, Heroicons, MUI Icons, etc.)
- [ ] **Style** nhất quán (outline vs filled — không mix)
- [ ] **Size** nhất quán với context (16px inline, 20px button, 24px nav)
- [ ] **Stroke width** nhất quán (nếu dùng outline icons)
- [ ] **Color** theo semantic hoặc inherit text color
- [ ] Icons có **label/tooltip** cho accessibility

## 6. Images & Media

### Checklist
- [ ] **Aspect ratio** nhất quán cho cùng loại (avatar: 1:1, banner: 16:9, thumbnail: 4:3)
- [ ] **Border radius** cho images nhất quán (avatar: full circle, card image: match card radius)
- [ ] **Placeholder/skeleton** khi loading
- [ ] **Error state** khi image không load (fallback image hoặc icon)
- [ ] **Object fit** đúng (cover vs contain) — không bị méo
- [ ] **Lazy loading** cho below-the-fold images

---

## Quy Trình Audit

### Phase 1: Automated Scan
1. Chụp full-page screenshots ở standard viewports
2. Extract CSS variables/tokens từ DevTools
3. Compare extracted tokens vs Design System documentation

### Phase 2: Manual Review
1. Duyệt từng page/screen theo checklist trên
2. Ghi nhận violations vào UX Bug Report template
3. Screenshot mỗi violation kèm annotation

### Phase 3: Cross-Page Consistency
1. Mở 2-3 pages cạnh nhau
2. So sánh: header, footer, navigation, button style có giống nhau?
3. Check: cùng component ở pages khác nhau render giống nhau?

### Phase 4: Report
1. Điền kết quả vào UX Score Card
2. Phân loại violations theo severity
3. Đề xuất fixes có ưu tiên

---

## Tài Liệu Tham Khảo
1. [Material Design 3 — Design Tokens](https://m3.material.io/foundations)
2. [Tailwind CSS — Design System](https://tailwindcss.com/docs/theme)
3. [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
