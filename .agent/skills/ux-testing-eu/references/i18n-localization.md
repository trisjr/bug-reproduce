# i18n / Localization — Checklist Kiểm Thử

## Mục lục
1. [Language Switching](#1-language-switching)
2. [Text & Content](#2-text--content)
3. [Date, Time & Numbers](#3-date-time--numbers)
4. [Currency](#4-currency)
5. [Layout & Text Expansion](#5-layout--text-expansion)
6. [RTL Support](#6-rtl-support)
7. [Media & Assets](#7-media--assets)
8. [Technical Validation](#8-technical-validation)
9. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

> Internationalization (i18n) đảm bảo sản phẩm hoạt động đúng trên nhiều ngôn ngữ, vùng miền và văn hóa. Đặc biệt quan trọng cho thị trường EU (24 ngôn ngữ chính thức).

## 1. Language Switching

### Checklist
- [ ] Language switcher **dễ tìm** (header, footer, hoặc settings)
- [ ] Hiển thị tên ngôn ngữ bằng **chính ngôn ngữ đó** (Deutsch, Français, không phải German, French)
- [ ] Flag icons: KHÔNG dùng flag = language (🇬🇧 ≠ English — có Irish, Welsh, etc.)
  - ✅ Dùng text labels hoặc globe icon
- [ ] Chuyển ngôn ngữ **không mất state** (không reload page, giữ URL params)
- [ ] URL reflects language (`/de/`, `/fr/` hoặc `?lang=de`)
- [ ] `<html lang="xx">` attribute cập nhật đúng
- [ ] `hreflang` tags cho SEO (`<link rel="alternate" hreflang="de">`)
- [ ] Default language detection từ browser `Accept-Language` header
- [ ] Language preference **persistent** (localStorage/cookie/account)

## 2. Text & Content

### Checklist
- [ ] **No hardcoded strings** — tất cả user-facing text qua i18n framework
- [ ] **No string concatenation** cho sentences
  - ❌ `"You have " + count + " items"` → sai ngữ pháp Đức
  - ✅ `t('items.count', { count })` với ICU message format
- [ ] **Pluralization** đúng rules cho từng locale
  - EN: 1 item / 2 items (2 forms)
  - PL: 1 koszulka / 2 koszulki / 5 koszulek (3 forms)
  - AR: 6 forms
- [ ] **Gender-aware** text (nếu applicable)
  - FR: "connecté" (m) vs "connectée" (f)
- [ ] **No cultural assumptions** trong content
  - ❌ "Enter your ZIP code" (US term)
  - ✅ "Enter your postal code"
- [ ] Translations **complete** — không có text chưa dịch (fallback to EN)
- [ ] **Context** cho translators — cùng "Save" có thể là "Speichern" hoặc "Sichern" tùy context
- [ ] Special characters render đúng (umlauts: ÄÖÜ, accents: éèê, cedilla: ç)

## 3. Date, Time & Numbers

### Checklist

| Format | US | DE | FR | VN |
|--------|-----|-----|-----|-----|
| Date | 04/09/2026 | 09.04.2026 | 09/04/2026 | 09/04/2026 |
| Time | 8:30 AM | 08:30 | 08h30 | 08:30 |
| Number | 1,234.56 | 1.234,56 | 1 234,56 | 1.234,56 |
| Week start | Sunday | Monday | Monday | Monday |

- [ ] Date format đúng locale (DD/MM/YYYY cho hầu hết EU)
- [ ] Time format: 24h cho EU (08:30, không phải 8:30 AM)
- [ ] Number format: decimal comma cho EU (1.234,56)
- [ ] Week start: Monday cho EU
- [ ] Relative dates localized ("2 Tage her" cho DE, "il y a 2 jours" cho FR)
- [ ] Date picker respects locale format + week start
- [ ] Timezone: hiển thị local time của user hoặc UTC offset rõ ràng

## 4. Currency

### Checklist
- [ ] Currency symbol đúng vị trí theo locale
  - EN: $100.00 (symbol trước)
  - DE: 100,00 € (symbol sau)
  - FR: 100,00 € (symbol sau, space trước)
- [ ] Decimal separator đúng locale
- [ ] Thousands separator đúng locale
- [ ] Tax display theo quy định quốc gia (EU: VAT included in price)
- [ ] Multi-currency: user chọn được currency preference
- [ ] Exchange rate disclaimer (nếu hiển thị converted prices)

## 5. Layout & Text Expansion

### Checklist

> Text dịch sang ngôn ngữ khác thường **dài hơn** tiếng Anh:

| Language | Expansion vs English |
|----------|:-------------------:|
| German | +30% |
| French | +20% |
| Finnish | +30-40% |
| Arabic | +25% (RTL) |
| Chinese | -50% (nhưng taller) |

- [ ] UI **không vỡ** khi text dài hơn 30-40% so với EN
- [ ] Buttons **co giãn** theo text (không fixed width)
- [ ] Navigation items không bị **overflow/truncate**
- [ ] Tables xử lý đúng text dài (wrap hoặc horizontal scroll)
- [ ] Tooltips, dropdowns, modals cho phép text dài
- [ ] **Ellipsis (...)** chỉ dùng khi có tooltip show full text
- [ ] Line-height đủ cho diacritics (ÄÖÜ, Ñ, Ç) — không bị cắt

## 6. RTL Support

> Áp dụng cho Arabic, Hebrew, Farsi, Urdu.

### Checklist
- [ ] Layout **mirror** (sidebar bên phải, text align right)
- [ ] `dir="rtl"` attribute trên `<html>` hoặc container
- [ ] Icons directional **flip** (arrow, chevron, progress)
  - ❌ Back arrow (←) vẫn hướng trái trong RTL
  - ✅ Back arrow (→) hướng phải trong RTL
- [ ] Numbers vẫn LTR trong context RTL
- [ ] Bidirectional text (BiDi) render đúng khi mix LTR + RTL
- [ ] CSS dùng `margin-inline-start` thay vì `margin-left`
- [ ] Scrollbar position (bên trái trong RTL)

## 7. Media & Assets

### Checklist
- [ ] Images không chứa **hardcoded text** (text overlay qua CSS)
- [ ] Culturally appropriate imagery (tránh religious symbols, hand gestures)
- [ ] Video/audio có subtitles/captions cho target languages
- [ ] PDF/downloads available trong target languages
- [ ] Legal documents (Terms, Privacy) dịch sang local language

## 8. Technical Validation

### Automated Checks

```bash
# 1. Tìm hardcoded strings trong source
grep -rn ">[A-Z][a-zA-Z ]*<" src/ --include="*.tsx" --include="*.jsx" | head -20

# 2. Kiểm tra missing translation keys
# (framework-specific, ví dụ next-intl)
npx next-intl-checker --locale en,de,fr

# 3. Validate HTML lang attribute
# Check trong browser: document.documentElement.lang

# 4. Check hreflang tags
curl -s <URL> | grep hreflang
```

### Manual Smoke Test Checklist
1. Switch sang mỗi supported language
2. Kiểm tra critical flows (login, checkout, settings) ở mỗi language
3. Kiểm tra date/number format trên data-heavy pages
4. Resize browser → layout still OK với text dài?

---

## Tài Liệu Tham Khảo
1. [W3C Internationalization Best Practices](https://www.w3.org/International/quicktips/)
2. [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
3. [CLDR — Common Locale Data Repository](https://cldr.unicode.org/)
4. [Material Design — Bidirectionality](https://m2.material.io/design/usability/bidirectionality.html)
5. [EU Language Requirements](https://european-union.europa.eu/principles-countries-history/languages_en)
