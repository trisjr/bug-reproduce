# GDPR UX Compliance — Checklist Kiểm Thử

## Mục lục
1. [Cookie Consent UX](#1-cookie-consent-ux)
2. [Privacy & Transparency](#2-privacy--transparency)
3. [User Rights (Data Subject Rights)](#3-user-rights-data-subject-rights)
4. [Consent Management](#4-consent-management)
5. [Forms & Data Collection](#5-forms--data-collection)
6. [Third-Party & Tracking](#6-third-party--tracking)
7. [Children's Data (Art. 8)](#7-childrens-data-art-8)
8. [Dark Patterns (EU DSA)](#8-dark-patterns-eu-dsa)
9. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

> GDPR (General Data Protection Regulation) không chỉ là vấn đề backend/legal — nó ảnh hưởng trực tiếp đến **UI/UX**. QA phải kiểm tra rằng user interface tôn trọng quyền của người dùng EU.

## 1. Cookie Consent UX

### Checklist
- [ ] Cookie banner xuất hiện **trước khi** set bất kỳ non-essential cookie nào
- [ ] Nút **"Reject All"** / **"Từ chối tất cả"** cùng mức nổi bật với "Accept All"
  - ❌ Reject nhỏ, xám, khó tìm = vi phạm
  - ✅ Accept và Reject cùng size, cùng style
- [ ] **Granular control** — user chọn được từng category (Analytics, Marketing, Functional)
- [ ] Cookie preferences **lưu lại** — không hỏi lại mỗi pageview
- [ ] Có link **"Manage cookies"** / **"Quản lý cookie"** ở footer để thay đổi sau
- [ ] Banner không chặn nội dung (không fullscreen overlay bắt buộc)
- [ ] Pre-selected toggles: CHỈNH essential = ON (locked), others = OFF by default
- [ ] Đóng banner (X) = Reject (không phải Accept)

### Cách kiểm tra
1. Clear cookies → refresh page → banner xuất hiện?
2. Click "Reject All" → kiểm tra DevTools → Application → Cookies: chỉ essential cookies
3. Click "Accept All" → kiểm tra: analytics/marketing cookies xuất hiện
4. Quay lại → click "Manage cookies" → preferences đã saved đúng?

## 2. Privacy & Transparency

### Checklist
- [ ] **Privacy Policy** link dễ tìm (footer, registration form, cookie banner)
- [ ] Privacy Policy viết bằng **ngôn ngữ rõ ràng** — không jargon pháp lý
- [ ] Nêu rõ **ai** thu thập, **gì** thu thập, **tại sao**, **bao lâu** giữ
- [ ] Nêu rõ **quyền** của user (access, rectification, erasure, portability)
- [ ] **Contact info** của Data Controller / DPO dễ tìm
- [ ] **Last updated date** hiển thị trên Privacy Policy
- [ ] Thông báo khi Privacy Policy thay đổi

## 3. User Rights (Data Subject Rights)

### Checklist — GDPR Articles 15-22
- [ ] **Right to Access (Art. 15)** — User xem được data của mình
  - UI: Settings → "Your Data" / "Download my data"
- [ ] **Right to Rectification (Art. 16)** — User sửa được thông tin cá nhân
  - UI: Profile → Edit → Save
- [ ] **Right to Erasure (Art. 17)** — User xóa được account + data
  - UI: Settings → "Delete Account" → Confirmation
  - ❌ Không ẩn sau 10 bước
  - ✅ Tối đa 3-4 clicks
- [ ] **Right to Data Portability (Art. 20)** — User export data được
  - UI: Settings → "Export my data" → Download (JSON/CSV)
- [ ] **Right to Object (Art. 21)** — User opt-out marketing được
  - UI: Settings → Notifications → Unsubscribe
- [ ] **Right to Withdraw Consent (Art. 7(3))** — Rút consent dễ bằng cho consent
  - UI: Cookie settings, notification preferences, marketing opt-out

### Cách kiểm tra
1. Tạo account → vào Settings → tìm data management options
2. Đếm số clicks để đến "Delete Account" → phải ≤ 4
3. Thử "Export data" → file download được? Format hợp lệ?
4. Thử "Delete Account" → confirmation rõ ràng? Data thực sự bị xóa?

## 4. Consent Management

### Checklist
- [ ] **Explicit opt-in** — Checkbox KHÔNG pre-checked cho marketing
- [ ] **Separate consents** — Marketing, analytics, third-party riêng biệt
- [ ] **Consent record** — Timestamp + version policy khi user consent
- [ ] **Re-consent** — Hỏi lại khi purpose thay đổi
- [ ] Consent **dễ withdraw** bằng dễ give
- [ ] Double opt-in cho email marketing (best practice)

## 5. Forms & Data Collection

### Checklist
- [ ] Chỉ thu thập data **cần thiết** (data minimization)
  - ❌ Bắt buộc phone number cho newsletter signup
  - ✅ Chỉ email cho newsletter
- [ ] Purpose rõ ràng bên cạnh mỗi data field
- [ ] Phân biệt required vs optional fields
- [ ] Password field có **show/hide** toggle
- [ ] Sensitive data (SSN, DOB) có giải thích tại sao cần
- [ ] Form submission có **confirmation** (email, toast, redirect)
- [ ] Error messages KHÔNG expose sensitive data

## 6. Third-Party & Tracking

### Checklist
- [ ] User biết third-party services nào đang được dùng (Google Analytics, Facebook Pixel, etc.)
- [ ] Third-party scripts chỉ load **sau khi** user consent
- [ ] Share buttons không track trước khi interact
- [ ] Embedded content (YouTube, Maps) có consent layer
- [ ] Cross-site tracking disclosed trong Privacy Policy

### Cách kiểm tra (Automated)
```bash
# Kiểm tra cookies và requests trước consent
# 1. Clear cookies, disable consent
# 2. Load page
# 3. Check Network tab cho third-party requests
# 4. Check Application → Cookies cho tracking cookies
```

## 7. Children's Data (Art. 8)

> Áp dụng nếu service target users dưới 16 tuổi (hoặc 13-16 tùy quốc gia EU).

### Checklist
- [ ] Age gate / verification nếu applicable
- [ ] Parental consent mechanism
- [ ] Ngôn ngữ Privacy Policy phù hợp lứa tuổi
- [ ] Không thu thập data không cần thiết từ minors

## 8. Dark Patterns (EU DSA)

> **EU Digital Services Act (DSA)** cấm "dark patterns" — thiết kế giao diện lừa dối hoặc gây nhầm lẫn, ảnh hưởng đến quyền tự do lựa chọn của người dùng.

### Checklist — Prohibited Practices
- [ ] **Confirmshaming** — Không "shame" user khi từ chối
  - ❌ "No thanks, I don't want to save money"
  - ✅ "No thanks" / "Decline"
- [ ] **Forced continuity** — Không tự renew subscription không cảnh báo
  - ✅ Email reminder trước khi renew
- [ ] **Hidden costs** — Không giấu phí đến bước cuối
  - ✅ Total cost visible từ đầu
- [ ] **Trick questions** — Không dùng double negatives confusing
  - ❌ "Uncheck to not receive no emails"
  - ✅ "Receive marketing emails: Yes / No"
- [ ] **Roach motel** — Cancel / unsubscribe phải dễ bằng subscribe
- [ ] **Misdirection** — Không highlight "Accept" while dimming "Reject"
- [ ] **Nagging** — Không hỏi lặp lại consent đã từ chối
- [ ] **Obstruction** — Không giấu "Delete account" sau nhiều lớp menu

---

## Tài Liệu Tham Khảo
1. [GDPR Official Text](https://gdpr-info.eu/) — Full regulation
2. [EU Digital Services Act](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package)
3. [CNIL Cookie Guidelines](https://www.cnil.fr/en/cookies-and-other-tracking-devices) — French DPA
4. [ICO Cookie Guidance](https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/) — UK DPA
5. [Dark Patterns Tip Line](https://darkpatterns.org/) — Deceptive Design
6. [EDPB Guidelines on Consent](https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en)
