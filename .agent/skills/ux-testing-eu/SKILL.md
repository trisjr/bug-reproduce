---
name: ux-testing
description: Kiểm thử trải nghiệm người dùng (UX Testing) toàn diện cho QA. Bao gồm Heuristic Evaluation (Nielsen's 10), Visual Consistency Audit, Accessibility (WCAG 2.1), Responsive Testing, Interaction/Micro-animation, Performance UX. Hybrid manual + automated. Sử dụng khi "test UX", "kiểm tra UX", "đánh giá UX", "audit UX", "review UX", hoặc trước release.
---

# 🧪 UX Testing Skill (EU Compliance Edition)

Skill kiểm thử UX toàn diện — hybrid manual + automated. Chuẩn EU: WCAG 2.1 AA, EAA, GDPR, EU DSA.

## Khi Nào Kích Hoạt

- User nói: "test UX", "kiểm tra UX", "đánh giá UX", "audit UX", "review UX"
- Trước release / sau khi dev implement xong feature mới
- Khi cần kiểm tra EU compliance

## 8 Categories

| # | Category | Weight | Reference (load khi cần) |
|---|----------|:------:|--------------------------|
| A | Heuristic + Dark Patterns (EU DSA) | 15% | `references/heuristic-evaluation.md` |
| B | Visual Consistency | 10% | `references/visual-consistency.md` |
| C | Accessibility (WCAG 2.1 AA + EAA) | 20% | `references/wcag-checklist.md` |
| D | Responsive / Cross-device | 10% | *(inline — xem Bước 2)* |
| E | Interaction & Micro-animation | 10% | *(inline — xem Bước 2)* |
| F | Performance UX (Core Web Vitals) | 10% | *(inline — xem Bước 2)* |
| G | GDPR UX Compliance | 15% | `references/gdpr-ux-compliance.md` |
| H | i18n / Localization | 10% | `references/i18n-localization.md` |

> **Just-in-Time Loading:** Chỉ load reference file khi chạy category tương ứng. KHÔNG load tất cả cùng lúc.

## Workflow

### Bước 1 — Xác định phạm vi

Trước khi test, xác nhận với user:

| Thông tin | Bắt buộc | Ví dụ |
|:---|:---:|:---|
| URL/Page/Feature | ✅ | `https://example.com/home` |
| Target devices | ✅ | mobile-first / desktop-first |
| Target markets | ✅ | EU / VN / Global |
| Design reference | ⬜ | Figma link, screenshot |
| **Auth States** | ✅ | `guest` / `authenticated` / `both` ⭐ |
| Credentials (nếu auth ≠ guest) | ⬜ | Login URL + email + password |
| Login method | ⬜ | `form` / `social` / `OTP` |
| Protected Pages | ⬜ | `/profile`, `/settings`, `/dashboard` |

### Bước 2 — Chạy từng Category

**Categories A, B, C, G, H** → Load reference file tương ứng, chạy theo checklist.

**Categories D, E, F** → Checklist inline:

**D. Responsive** — Test breakpoints: 375px 🔴, 768px 🔴, 1280px 🔴, 1440px 🟡, 1920px 🟢.
Check: layout vỡ, text truncate, images scale, nav responsive, không hover-only trên mobile.

**E. Interaction** — Check: button states (hover/active/focus/disabled/loading), form states, loading/empty/error states, transitions smooth, `prefers-reduced-motion`.

**F. Performance** — LCP < 2.5s, INP < 200ms, CLS < 0.1, TTFB < 800ms. Check: perceived loading, image optimization, above-the-fold render.

### Bước 2.5 — Dual-State Protocol (khi Auth = `both`)

| Phase | Hành động | Lưu ý thêm |
|:---:|:---|:---|
| **1. Guest** | Chạy A-H cho public pages | Test redirect khi vào protected pages, CTA login rõ ràng |
| **2. Login** | Điền credentials, submit | Đánh giá form UX, validation, loading, redirect sau login |
| **3. Auth** | Chạy A-H cho protected pages | Profile/Settings, Logout flow, GDPR (Delete Account, Export Data) |
| **4. Compare** | So sánh Guest vs Auth | Tag `[Guest]`/`[Auth]` mỗi issue, tính score riêng nếu khác biệt lớn |

**Items chỉ test được khi Authenticated:** Form validation, Delete Account, Export Data, Consent management, dynamic content ARIA, real data format (date/number/currency).

### Bước 3 — Output

1. Tạo **Bug Report** cho mỗi issue → template: `assets/templates/UX-Bug-Report.md`
2. Điền **Checklist** → template: `assets/templates/UX-Test-Checklist.md`
3. Tính **Scorecard** → template: `assets/templates/UX-Scorecard.md`
   - Mỗi issue có **⚡ Ảnh hưởng thực tế** (hậu quả pháp lý 💰, UX ♿, business 📉)
   - Nếu test `both` → tag `[Guest]`/`[Auth]` trước mỗi issue
4. Lưu file vào **`docs/035-QA/Reports/`** (Dewey Decimal)
5. Cập nhật **`docs/035-QA/QA-MOC.md`** với link report mới

## Automated Scanning (chạy trước manual)

```bash
# Accessibility
npx lighthouse <URL> --only-categories=accessibility --output=json --chrome-flags="--headless"
npx @axe-core/cli <URL> --tags wcag2a,wcag2aa

# Responsive screenshots
npx playwright screenshot <URL> --viewport-size=375,812 --full-page mobile.png
npx playwright screenshot <URL> --viewport-size=1280,900 --full-page desktop.png

# Performance
npx lighthouse <URL> --only-categories=performance --output=json --chrome-flags="--headless"

# GDPR Cookie scan
# DevTools → Application → Cookies (manual)
```

## Scoring

| Score | Rating | Quyết định |
|:-----:|:------:|:----------:|
| 9-10 | ⭐ Excellent | ✅ Ship it |
| 7-8 | ✅ Good | ✅ Ship, minor notes |
| 5-6 | ⚠️ Acceptable | ⚠️ Ship + log known issues |
| 3-4 | 🔶 Below Average | 🔶 Fix trước release |
| 0-2 | 🔴 Critical | 🔴 Block release |

**Tổng điểm** = Σ (Score × Weight)

> ⚠️ **EU Compliance Gate:** Category C (Accessibility) hoặc G (GDPR) < 5.0 → **tự động Block** bất kể tổng điểm.

## Cross-Skill Integration

| Skill | Khi nào |
|:---|:---|
| `chrome-devtools` | Lighthouse, DevTools automation |
| `web-testing` | Playwright E2E, visual regression |
| `web-design-guidelines` | Review theo Web Interface Guidelines |
| `product-designer` | So sánh implementation vs design spec |

## Tài Liệu Tham Khảo

- `references/` — Checklist chi tiết cho categories A, B, C, G, H
- `assets/templates/` — Templates output (Scorecard, Checklist, Bug Report)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) · [GDPR](https://gdpr-info.eu/) · [EU DSA](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package) · [EAA](https://ec.europa.eu/social/main.jsp?catId=1202) · [Web Vitals](https://web.dev/vitals/)
