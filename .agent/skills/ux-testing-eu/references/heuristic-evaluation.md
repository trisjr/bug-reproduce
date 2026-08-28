# Nielsen's 10 Usability Heuristics — Checklist Chi Tiết

## Mục lục
1. [Visibility of System Status](#1-visibility-of-system-status)
2. [Match Between System and Real World](#2-match-between-system-and-real-world)
3. [User Control and Freedom](#3-user-control-and-freedom)
4. [Consistency and Standards](#4-consistency-and-standards)
5. [Error Prevention](#5-error-prevention)
6. [Recognition Rather Than Recall](#6-recognition-rather-than-recall)
7. [Flexibility and Efficiency of Use](#7-flexibility-and-efficiency-of-use)
8. [Aesthetic and Minimalist Design](#8-aesthetic-and-minimalist-design)
9. [Help Users Recognize, Diagnose, and Recover from Errors](#9-help-users-recognize-diagnose-and-recover-from-errors)
10. [Help and Documentation](#10-help-and-documentation)
11. [Dark Patterns / Deceptive Design (EU DSA)](#11-dark-patterns--deceptive-design-eu-dsa)
12. [Phân loại mức độ nghiêm trọng](#phân-loại-mức-độ-nghiêm-trọng)
13. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Visibility of System Status

> Hệ thống luôn phải thông báo cho user biết đang xảy ra chuyện gì, thông qua phản hồi phù hợp trong thời gian hợp lý.

**Checklist:**
- [ ] Loading indicator khi fetch data (spinner, skeleton, progress bar)
- [ ] Progress indicator cho multi-step process (step 1/3, progress bar %)
- [ ] Real-time feedback khi submit form (button disabled + loading state)
- [ ] File upload progress (% completion, file size)
- [ ] Nav item active/selected state rõ ràng
- [ ] Breadcrumb hoặc page title cho biết user đang ở đâu
- [ ] Notification/badge cho biết có item mới
- [ ] Connection status indicator (online/offline)

**Ví dụ lỗi:** Submit form → không có loading → user click lại → duplicate submission.

## 2. Match Between System and Real World

> Sử dụng ngôn ngữ, khái niệm và quy ước mà user quen thuộc. Thông tin xuất hiện theo thứ tự tự nhiên và logic.

**Checklist:**
- [ ] Labels/text dùng ngôn ngữ user domain (không phải developer jargon)
- [ ] Icon trực quan, dễ hiểu (🗑️ = xóa, ✏️ = chỉnh sửa)
- [ ] Format dữ liệu đúng locale (ngày tháng, số, tiền tệ)
- [ ] Thứ tự field trong form logic (tên → email → phone → address)
- [ ] Metaphor quen thuộc (shopping cart, folder, bookmark)
- [ ] Error messages dùng ngôn ngữ người bình thường

**Ví dụ lỗi:** "Error 500: Internal Server Error" thay vì "Đã xảy ra lỗi. Vui lòng thử lại."

## 3. User Control and Freedom

> User thường chọn nhầm. Cần có "emergency exit" rõ ràng để rời khỏi trạng thái không mong muốn mà không cần quy trình phức tạp.

**Checklist:**
- [ ] Undo cho các hành động destructive (xóa, archive)
- [ ] Cancel/Close ở mọi dialog/modal
- [ ] Back button hoạt động đúng (browser history)
- [ ] Có thể dismiss notification/toast
- [ ] Edit/modify sau khi submit (sửa comment, sửa profile)
- [ ] Clear/reset filters dễ dàng
- [ ] Escape key đóng modal/dropdown

**Ví dụ lỗi:** Xóa item → không có confirmation → không thể undo.

## 4. Consistency and Standards

> User không nên thắc mắc liệu các từ, tình huống, hoặc hành động khác nhau có nghĩa giống nhau không.

**Checklist:**
- [ ] Cùng action → cùng UI pattern (tất cả "Delete" buttons đều đỏ)
- [ ] Cùng terminology xuyên suốt app ("Khách hàng" không lúc "Customer")
- [ ] Button placement nhất quán (Primary bên phải, Cancel bên trái)
- [ ] Form validation style nhất quán (tất cả dùng inline error, không mix alert)
- [ ] Date format nhất quán xuyên suốt app
- [ ] Icon usage nhất quán (không thay đổi icon cho cùng action)
- [ ] Platform conventions (link màu xanh + underline, error màu đỏ)

**Ví dụ lỗi:** Page A: "Lưu" bên phải. Page B: "Lưu" bên trái.

## 5. Error Prevention

> Tốt hơn cả error messages tốt là thiết kế cẩn thận để ngăn lỗi xảy ra.

**Checklist:**
- [ ] Confirmation dialog trước destructive actions (xóa, reset)
- [ ] Form validation real-time (không chờ submit)
- [ ] Date picker thay vì text input cho ngày tháng
- [ ] Dropdown/select thay vì text input khi có limited options
- [ ] Auto-save cho long forms
- [ ] Disable submit button khi form invalid
- [ ] Search suggestions/autocomplete để tránh typo
- [ ] Input masks cho phone, credit card

**Ví dụ lỗi:** Cho nhập tự do email → "abc" cũng submit được → lỗi backend.

## 6. Recognition Rather Than Recall

> Giảm thiểu gánh nặng ghi nhớ. Đối tượng, hành động, tùy chọn phải luôn visible.

**Checklist:**
- [ ] Menu labels rõ ràng (không chỉ dùng icon)
- [ ] Search có gợi ý/autocomplete
- [ ] Recent items/history có sẵn
- [ ] Form placeholders hướng dẫn format mong muốn
- [ ] Tooltip cho icon-only buttons
- [ ] Breadcrumb cho navigation sâu
- [ ] Filter/sort selections visible (không ẩn sau click)

**Ví dụ lỗi:** Icon-only toolbar → user không biết icon nào làm gì.

## 7. Flexibility and Efficiency of Use

> Accelerators — invisible cho novice — giúp expert thao tác nhanh hơn.

**Checklist:**
- [ ] Keyboard shortcuts cho common actions
- [ ] Bulk actions (select all, batch delete)
- [ ] Search/filter/sort cho danh sách dài
- [ ] Copy-paste support
- [ ] Drag and drop (khi phù hợp)
- [ ] Default values hợp lý cho forms
- [ ] Remember user preferences (theme, language, last view)

**Ví dụ lỗi:** Muốn xóa 50 items → phải xóa từng cái một, không có batch.

## 8. Aesthetic and Minimalist Design

> Dialogues không nên chứa thông tin không liên quan hoặc hiếm khi cần. Mỗi unit thông tin thừa cạnh tranh với thông tin quan trọng.

**Checklist:**
- [ ] Clear visual hierarchy (heading → subheading → body)
- [ ] Whitespace đủ — không crowded
- [ ] Chỉ hiện thông tin cần thiết ở mỗi bước
- [ ] Progressive disclosure (details on demand)
- [ ] Imagery phục vụ mục đích, không decorative thừa
- [ ] CTA (Call to Action) nổi bật, rõ ràng
- [ ] Không có "noise" elements (ads, banners không liên quan)

**Ví dụ lỗi:** Dashboard có 20 metrics → user không biết nhìn đâu trước.

## 9. Help Users Recognize, Diagnose, and Recover from Errors

> Error messages nên được diễn đạt bằng ngôn ngữ đơn giản, chỉ ra chính xác vấn đề và gợi ý cách khắc phục.

**Checklist:**
- [ ] Error messages bằng ngôn ngữ người dùng (không phải error codes)
- [ ] Chỉ ra chính xác field nào lỗi (highlight inline)
- [ ] Gợi ý cách sửa ("Mật khẩu cần ít nhất 8 ký tự")
- [ ] Error state visual rõ (red border, error icon)
- [ ] 404 page có link quay lại hoặc search
- [ ] Network error có retry button
- [ ] Form validation error persist cho đến khi user sửa xong

**Ví dụ lỗi:** "Validation failed" → không biết field nào sai, sửa thế nào.

## 10. Help and Documentation

> Dù hệ thống tốt nhất vẫn cần docs. Thông tin phải dễ tìm, tập trung vào task, liệt kê các bước cụ thể.

**Checklist:**
- [ ] Onboarding tour cho user mới (step-by-step)
- [ ] Tooltip cho features phức tạp
- [ ] FAQ/Help center link dễ tìm
- [ ] Contextual help (? icon cạnh field khó hiểu)
- [ ] Empty states có hướng dẫn "Bắt đầu"
- [ ] Search trong docs/help

**Ví dụ lỗi:** Feature mới phức tạp → không có onboarding → user bỏ cuộc.

---

## 11. Dark Patterns / Deceptive Design (EU DSA)

> **EU Digital Services Act (DSA)** — có hiệu lực từ 02/2024 — cấm các thiết kế giao diện lừa dối hoặc gây nhầm lẫn, ảnh hưởng đến quyền tự do lựa chọn của người dùng.

**Checklist — Prohibited Practices:**

- [ ] **Confirmshaming** — Không shame user khi từ chối
  - ❌ "No thanks, I don't want to save money"
  - ✅ "No thanks" / "Decline"
- [ ] **Forced continuity** — Không tự renew subscription không cảnh báo
  - ✅ Email/notification reminder trước khi renew
- [ ] **Hidden costs** — Không giấu phí đến bước cuối checkout
  - ✅ Total cost visible từ bước đầu
- [ ] **Trick questions** — Không dùng double negatives confusing
  - ❌ "Uncheck to not receive no emails"
  - ✅ "Receive marketing emails: Yes / No"
- [ ] **Roach motel** — Cancel/unsubscribe phải dễ bằng subscribe
  - Đếm clicks: Subscribe ≤ Cancel clicks
- [ ] **Misdirection** — Không highlight "Accept" while dimming "Reject"
  - ✅ Cả hai buttons cùng visual weight
- [ ] **Nagging** — Không hỏi lặp lại consent/upsell đã từ chối
  - Max 1 lần/session cho cùng request
- [ ] **Obstruction** — Không giấu "Delete account" sau 5+ layers of menus
  - ✅ Tối đa 3-4 clicks đến destructive actions

**Severity:** Mọi vi phạm Dark Patterns = Level 3 (Major) trở lên vì liên quan đến EU legal compliance.

---

## Phân Loại Mức Độ Nghiêm Trọng

| Level | Severity | Mô tả | Action |
|-------|----------|-------|--------|
| 0 | None | Không phải usability problem | — |
| 1 | Cosmetic | Chỉ sửa nếu có thời gian thừa | Low priority |
| 2 | Minor | Gây khó chịu nhẹ, user vẫn hoàn thành task | Fix next sprint |
| 3 | Major | User gặp khó khăn đáng kể khi hoàn thành task | Fix before release |
| 4 | Catastrophic | User không thể hoàn thành task. Block release. | Fix immediately |

---

## Tài Liệu Tham Khảo
1. [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
2. [How to Conduct a Heuristic Evaluation](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/)
3. [Severity Ratings for Usability Problems](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/)
