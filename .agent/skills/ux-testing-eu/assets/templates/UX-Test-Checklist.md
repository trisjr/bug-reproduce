---
id: UX-CHK-{NNN}
type: ux-test-checklist
status: draft
project: "{project_name}"
feature: "{feature_or_page}"
tester: "@{tester_name}"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# 🧪 UX Test Checklist (EU Compliance Edition)

> **Feature/Page:** {feature_or_page}
> **URL:** {url}
> **Design Ref:** {figma_link_or_screenshot}
> **Tester:** {tester_name}
> **Ngày test:** {date}
> **Devices:** {mobile / tablet / desktop}
> **Target Markets:** {EU / VN / Global}

---

## A. Heuristic Evaluation (Nielsen's 10 + Dark Patterns) — Weight: 15%

| # | Heuristic | ✅/❌ | Ghi chú | Severity |
|---|-----------|:---:|---------|:--------:|
| 1 | Visibility of system status | | | |
| 2 | Match real world | | | |
| 3 | User control & freedom | | | |
| 4 | Consistency & standards | | | |
| 5 | Error prevention | | | |
| 6 | Recognition over recall | | | |
| 7 | Flexibility & efficiency | | | |
| 8 | Aesthetic & minimalist design | | | |
| 9 | Help recognize errors | | | |
| 10 | Help & documentation | | | |

**Dark Patterns (EU DSA):**

| # | Pattern | ✅/❌ | Ghi chú |
|---|---------|:---:|---------|
| 11 | No confirmshaming | | |
| 12 | No forced continuity | | |
| 13 | No hidden costs | | |
| 14 | No trick questions | | |
| 15 | No roach motel | | |
| 16 | No misdirection | | |
| 17 | No nagging | | |
| 18 | No obstruction | | |

**Score:** ___/10

---

## B. Visual Consistency Audit — Weight: 10%

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 1 | Font family khớp Design System | | |
| 2 | Font size scale nhất quán | | |
| 3 | Color palette đúng | | |
| 4 | Semantic colors (success/error/warning) | | |
| 5 | Spacing grid nhất quán | | |
| 6 | Component variants đúng | | |
| 7 | Icon style nhất quán | | |
| 8 | Border radius thống nhất | | |

**Score:** ___/10

---

## C. Accessibility (WCAG 2.1 AA + EAA) — Weight: 20%

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 1 | Color contrast ≥ 4.5:1 (text) | | |
| 2 | Keyboard navigable (Tab order) | | |
| 3 | Focus indicator visible | | |
| 4 | Images có alt text | | |
| 5 | Form inputs có labels | | |
| 6 | ARIA landmarks đúng | | |
| 7 | Touch targets ≥ 44×44px | | |
| 8 | Không dùng color-only | | |
| 9 | Heading hierarchy logic | | |
| 10 | Error messages accessible | | |

**EAA Extensions (nếu applicable):**

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 11 | E-commerce product info accessible | | |
| 12 | Checkout keyboard accessible | | |
| 13 | Mobile native a11y support | | |
| 14 | Customer support ≥ 2 accessible channels | | |

**Automated scan:** Lighthouse a11y: ___/100 | axe violations: ___
**Score:** ___/10

---

## D. Responsive/Cross-device — Weight: 10%

| Viewport | Layout OK | Text OK | Images OK | Nav OK | Ghi chú |
|----------|:---------:|:-------:|:---------:|:------:|---------|
| 375px (Mobile) | | | | | |
| 428px (Mobile L) | | | | | |
| 768px (Tablet) | | | | | |
| 1280px (Desktop) | | | | | |
| 1440px (Desktop L) | | | | | |
| 1920px (Ultra) | | | | | |

**Score:** ___/10

---

## E. Interaction & Micro-animation — Weight: 10%

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 1 | Button states (hover/active/disabled/loading) | | |
| 2 | Form states (focus/error/success) | | |
| 3 | Loading states present | | |
| 4 | Empty states present | | |
| 5 | Error states present | | |
| 6 | Success feedback (toast/redirect) | | |
| 7 | Transitions smooth (no jank) | | |
| 8 | `prefers-reduced-motion` respected | | |

**Score:** ___/10

---

## F. Performance UX (Core Web Vitals) — Weight: 10%

| Metric | Value | Rating | Ghi chú |
|--------|-------|:------:|---------|
| LCP | | | < 2.5s: Good |
| INP | | | < 200ms: Good |
| CLS | | | < 0.1: Good |
| TTFB | | | < 800ms: Good |
| Perceived loading | | | Skeleton/spinner? |

**Lighthouse Performance:** ___/100
**Score:** ___/10

---

## G. GDPR UX Compliance — Weight: 15%

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 1 | Cookie banner: Reject cùng nổi bật với Accept | | |
| 2 | Cookie preferences: granular control | | |
| 3 | Cookie preferences: pre-selected = OFF (non-essential) | | |
| 4 | Privacy Policy link dễ tìm + dễ hiểu | | |
| 5 | Delete Account: ≤ 4 clicks | | |
| 6 | Export Data: download được (JSON/CSV) | | |
| 7 | Consent checkboxes: NOT pre-checked | | |
| 8 | Third-party tracking: chỉ sau consent | | |
| 9 | Unsubscribe dễ bằng subscribe | | |
| 10 | Consent management: user thay đổi được sau | | |

**Score:** ___/10

> ⚠️ **EU Compliance Gate:** Score < 5.0 → **Auto-block release**

---

## H. i18n / Localization — Weight: 10%

| # | Item | ✅/❌ | Ghi chú |
|---|------|:---:|---------|
| 1 | Language switcher dễ tìm, hoạt động đúng | | |
| 2 | Date format đúng locale (DD/MM/YYYY cho EU) | | |
| 3 | Number format đúng locale (1.234,56 cho DE) | | |
| 4 | Currency format + symbol đúng | | |
| 5 | UI không vỡ khi text dài +30% (DE/FI) | | |
| 6 | No hardcoded strings (qua i18n framework) | | |
| 7 | Pluralization đúng rules | | |
| 8 | RTL support (nếu applicable) | | |
| 9 | Timezone hiển thị đúng | | |
| 10 | `<html lang>` + `hreflang` tags đúng | | |

**Score:** ___/10

---

## 📊 Tổng Kết

| Category | Weight | Score | Weighted |
|----------|:------:|:-----:|:--------:|
| A. Heuristic + Dark Patterns | 15% | /10 | |
| B. Visual Consistency | 10% | /10 | |
| C. Accessibility (WCAG + EAA) | 20% | /10 | |
| D. Responsive | 10% | /10 | |
| E. Interaction | 10% | /10 | |
| F. Performance (CWV) | 10% | /10 | |
| G. GDPR UX | 15% | /10 | |
| H. i18n / Localization | 10% | /10 | |
| **TOTAL** | **100%** | | **___/10** |

**Grade:** ___  |  **Go/No-Go:** ___

> ⚠️ **EU Compliance Gate:** C < 5 hoặc G < 5 → **Auto FAIL** bất kể tổng điểm.

---

## 📝 Issues Found

| # | Category | Severity | Mô tả | Bug Report |
|---|----------|:--------:|-------|-----------|
| 1 | | | | [[UX-BUG-{NNN}]] |
| 2 | | | | [[UX-BUG-{NNN}]] |

---
*Generated by TNMCORE-OS UX Testing Skill (EU Compliance Edition)*
