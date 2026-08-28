# WCAG 2.1 AA — Checklist Kiểm Thử Accessibility

## Mục lục
1. [Perceivable (Nhận thức được)](#1-perceivable-nhận-thức-được)
2. [Operable (Vận hành được)](#2-operable-vận-hành-được)
3. [Understandable (Hiểu được)](#3-understandable-hiểu-được)
4. [Robust (Bền vững)](#4-robust-bền-vững)
5. [European Accessibility Act (EAA)](#5-european-accessibility-act-eaa)
6. [Công cụ Automated Testing](#công-cụ-automated-testing)
7. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

> Checklist này tập trung vào **WCAG 2.1 Level AA** — mức yêu cầu phổ biến nhất cho compliance.

## 1. Perceivable (Nhận thức được)

### 1.1 Text Alternatives
- [ ] Mọi `<img>` có `alt` text mô tả nội dung
- [ ] Decorative images dùng `alt=""` hoặc CSS background
- [ ] `<svg>` có `<title>` hoặc `aria-label`
- [ ] Audio/Video có transcript hoặc captions
- [ ] CAPTCHAs có alternative (audio CAPTCHA)

### 1.2 Color & Contrast
- [ ] Text contrast ≥ **4.5:1** (normal text ≤ 18px)
- [ ] Text contrast ≥ **3:1** (large text > 18px bold hoặc > 24px)
- [ ] UI component contrast ≥ **3:1** (borders, icons, focus indicators)
- [ ] Thông tin KHÔNG chỉ truyền qua color alone (thêm icon, text, pattern)
- [ ] Links phân biệt được với surrounding text (underline hoặc 3:1 contrast)

### 1.3 Adaptable Content
- [ ] Heading hierarchy logic (h1 → h2 → h3, không skip)
- [ ] Lists dùng `<ul>/<ol>/<dl>` semantic
- [ ] Tables có `<th>`, `scope`, `<caption>`
- [ ] Form groups dùng `<fieldset>` + `<legend>`
- [ ] Meaningful sequence preserved khi CSS disabled
- [ ] Content reflow ở 320px width (no horizontal scroll)

### 1.4 Distinguishable
- [ ] Text resize lên 200% không mất nội dung
- [ ] No text in images (dùng real text + CSS styling)
- [ ] Audio tự phát có control pause/stop/mute
- [ ] Spacing: line-height ≥ 1.5, paragraph spacing ≥ 2×font-size

---

## 2. Operable (Vận hành được)

### 2.1 Keyboard Accessible
- [ ] MỌI interactive element accessible bằng keyboard (Tab, Enter, Space, Arrows)
- [ ] Tab order logic (trái → phải, trên → dưới)
- [ ] Không có keyboard trap (user có thể Tab ra khỏi mọi component)
- [ ] Skip navigation link (skip to main content)
- [ ] Custom components (dropdown, modal) hỗ trợ arrow keys

### 2.2 Enough Time
- [ ] User có thể extend/disable time limits
- [ ] Auto-updating content có pause/stop control
- [ ] Session timeout có warning + option gia hạn
- [ ] No time limit cho reading content

### 2.3 Seizures & Physical Reactions
- [ ] Không có flashing content > 3 flashes/second
- [ ] Motion animation có `prefers-reduced-motion` support
- [ ] Parallax hoặc auto-play video respects user preference

### 2.4 Navigable
- [ ] Page `<title>` mô tả nội dung page
- [ ] Focus order logic và predictable
- [ ] Link text descriptive ("Xem chi tiết dự án" thay vì "Click here")
- [ ] Multiple navigation methods (nav menu, search, sitemap)
- [ ] Focus visible indicator (outline, border, highlight)
- [ ] Section headings có sẵn

### 2.5 Input Modalities
- [ ] Touch targets ≥ **44×44px** (mobile — WCAG 2.5.5 AAA recommended, 2.5.8 AA = 24×24px)
- [ ] Gestures có single-pointer alternative (swipe → button)
- [ ] Pointer cancellation (mousedown start → mouseup cancel)
- [ ] Motion actuation có alternative (shake → button)

---

## 3. Understandable (Hiểu được)

### 3.1 Readable
- [ ] `<html lang="vi">` (hoặc lang phù hợp) declared
- [ ] Foreign text inline có `lang` attribute
- [ ] Abbreviations có `<abbr>` hoặc expanded on first use

### 3.2 Predictable
- [ ] Focus change KHÔNG trigger unexpected context change
- [ ] Input change KHÔNG trigger unexpected context change
- [ ] Navigation consistent across pages
- [ ] Consistent identification (cùng icon = cùng function)

### 3.3 Input Assistance
- [ ] Error identified và described in text
- [ ] Labels hoặc instructions cho user input
- [ ] Error suggestions (gợi ý cách sửa)
- [ ] Error prevention cho legal/financial (review, confirm, reversible)
- [ ] `autocomplete` attribute cho personal data fields

---

## 4. Robust (Bền vững)

### 4.1 Compatible
- [ ] Valid HTML (no parsing errors)
- [ ] ARIA roles, states, properties đúng spec
- [ ] Status messages (`role="status"`, `role="alert"`) cho screen readers
- [ ] Custom controls có accessible name + role + state
- [ ] Form error announcements qua `aria-live` regions

---

## 5. European Accessibility Act (EAA)

> **Directive (EU) 2019/882** — có hiệu lực từ **28/06/2025**. EAA mở rộng yêu cầu accessibility vượt ra ngoài WCAG, áp dụng cho **products và services** bán tại EU.

### Scope — Áp dụng cho:
- E-commerce websites và apps
- Banking / financial services
- Telecommunications
- E-books và e-readers
- Self-service terminals (ATMs, kiosks)
- Transport services (booking, ticketing)

### Checklist — Yêu cầu bổ sung ngoài WCAG 2.1 AA

#### E-Commerce
- [ ] Product information accessible (mô tả sản phẩm, giá, availability)
- [ ] Checkout process fully keyboard accessible
- [ ] Payment forms compatible với screen readers
- [ ] Order confirmation accessible (email + on-screen)
- [ ] Customer support accessible (chat, email, phone — ít nhất 2 channels)

#### Mobile Apps
- [ ] Native accessibility features support (VoiceOver/TalkBack)
- [ ] Gesture alternatives cho mọi interaction
- [ ] Text scaling support (hệ thống font size)
- [ ] High contrast mode support
- [ ] Screen reader compatible cho tất cả screens

#### Self-Service (nếu applicable)
- [ ] Audio output cho visually impaired
- [ ] Physical controls accessible (wheelchair height)
- [ ] Timeout đủ dài cho users cần thêm thời gian
- [ ] Real-time text (RTT) support

### EAA vs WCAG — Khác biệt chính

| Aspect | WCAG 2.1 | EAA |
|--------|----------|-----|
| Scope | Web content | Products + Services |
| Legal status | Technical standard | EU Directive (law) |
| Enforcement | Varies by country | Mandatory EU-wide |
| Penalty | Varies | Market surveillance + fines |
| Mobile apps | Covered | **Explicitly** required |
| Hardware | Not covered | Self-service terminals included |

---

## Công Cụ Automated Testing

| Tool | Phạm vi | Lệnh chạy |
|------|---------|-----------|
| **Lighthouse** | Broad coverage | `npx lighthouse <URL> --only-categories=accessibility` |
| **axe-core CLI** | WCAG-focused | `npx @axe-core/cli <URL> --tags wcag2a,wcag2aa` |
| **pa11y** | Page-level | `npx pa11y <URL>` |
| **WAVE** | Browser extension | Manual — [wave.webaim.org](https://wave.webaim.org/) |

> ⚠️ **Automated tools chỉ phát hiện ~30-40% a11y issues.** Manual testing BẮT BUỘC cho keyboard navigation, screen reader, và cognitive accessibility.

### Manual Testing Tools

| Tool | Mục đích |
|------|---------|
| **Tab key** | Test keyboard navigation order |
| **Screen reader** (NVDA/VoiceOver) | Test assistive technology |
| **Colour Contrast Analyzer** | Check contrast ratios |
| **Browser zoom 200%** | Test text reflow |
| **Responsive mode** (DevTools) | Test viewport sizes |

---

## Tài Liệu Tham Khảo
1. [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&levels=aaa)
2. [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
3. [A11y Project Checklist](https://www.a11yproject.com/checklist/)
4. [Deque axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
