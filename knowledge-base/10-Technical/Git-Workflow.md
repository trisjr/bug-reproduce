---
id: KB-TECH-011
type: standard
status: approved
created: 2026-03-04
updated: 2026-03-04
---

# Tiêu chuẩn Git & Pull Request (Git Standards)

Tài liệu này quy định các quy tắc bắt buộc đối với việc quản lý mã nguồn, nhằm đảm bảo lịch sử dự án rõ ràng, dễ truy vết và hỗ trợ tự động hóa.

## 📑 Mục lục

1. [Phạm vi hoạt động (Git Scope)](#1-phạm-vi-hoạt-động-git-scope)
2. [Quy tắc đặt tên Branch](#2-quy-tắc-đặt-tên-branch)
3. [Quy tắc Commit Message](#3-quy-tắc-commit-message)
4. [Cấu trúc Pull Request (PR)](#4-cấu-trúc-pull-request-pr)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Phạm vi hoạt động (Git Scope)

Trong kiến trúc TNMCORE-HUB, thư mục gốc (Root) của Hub không được dùng để quản lý Git cho mã nguồn dự án.

- **Vị trí thực thi:** Mọi lệnh Git (`git add`, `git commit`, `git push`...) phải được thực hiện bên trong các thư mục dự án nằm trong `/src`.
- **Repo riêng biệt:** Mỗi dự án trong thư mục `/src` là một GitHub Repository độc lập với Remote riêng.
- **Lưu ý:** Tuyệt đối không khởi tạo Git hoặc commit mã nguồn trực tiếp tại Hub Root để tránh xung đột cấu hình hệ điều hành TNMCORE-OS. Và không commit các file không liên quan đến task (package.json, package-lock.json, etc) nếu không được yêu cầu.

---

## 2. Quy tắc đặt tên Branch

Cấu trúc: `{type}/trisjr/{short-description}`

| Type       | Mục đích                              | Ví dụ                           |
| :--------- | :------------------------------------ | :------------------------------ |
| `feat`     | Tính năng mới                         | `feat/trisjr/referral-qr-modal` |
| `fix`      | Sửa lỗi                               | `fix/trisjr/phone-validation`   |
| `refactor` | Tái cấu trúc code (không đổi hành vi) | `refactor/trisjr/auth-logic`    |
| `docs`     | Cập nhật tài liệu                     | `docs/trisjr/git-standards`     |
| `chore`    | Cập nhật build, config, thư viện...   | `chore/trisjr/update-deps`      |
| `ci`       | Thay đổi cấu hình CI/CD               | `ci/trisjr/github-actions`      |

---

## 2. Quy tắc Commit Message

Sử dụng tiêu chuẩn **Conventional Commits**.

Cấu trúc: `<type>(<scope>): <description>`

- **Type**: Giống như loại Branch (`feat`, `fix`, `refactor`, etc.)
- **Scope (Tùy chọn)**: Module hoặc vùng ảnh hưởng (ví dụ: `auth`, `ui`, `api`).
- **Description**: Viết ngắn gọn ở thì hiện tại, không viết hoa chữ đầu, không dấu chấm cuối câu.

**Ví dụ:**

- `feat(referral): add qrcode modal for easy sharing`
- `fix(ui): fix overflow on small devices in referral page`
- `refactor(utils): unify share logic into shareUtils`

---

## 3. Cấu trúc Pull Request (PR)

Mọi PR phải tuân thủ chuẩn nội dung sau để người Review dễ nắm bắt. Điều này giúp đẩy nhanh quá trình Review và giảm thiểu lỗi.

### Tiêu đề PR

Viết hoa chữ cái đầu, có thể ghi rõ tiền tố Module/Scope trong ngoặc vuông để dễ đọc hơn.
**Tuyệt đối KHÔNG** bê nguyên định dạng commit message (như `feat(referral):...`) lên làm PR title.

**Ví dụ đúng:**

- `[Referral] Implement QR Code modal sharing`
- `[Auth] Fix overflow bug on small devices`

### Nội dung PR (Template Bắt Buộc)

```markdown
## � Link Ticket & Resources

- **Task Link**: [N/A hoặc Dán link task/ticket vào đây]
- **Figma Design**: [N/A hoặc Link Figma nếu có thay đổi UI]
- **Related PRs**: [N/A hoặc Link các PR liên quan nếu có]

## �📝 Phân tích & Giải pháp (Context)

### Vấn đề hiện tại

- Giải thích rõ "Tại sao" chúng ta cần thay đổi này. Vấn đề gốc rễ là gì?

### Giải pháp kỹ thuật

- Tóm tắt các thay đổi logic chính.
- Tại sao chọn phương án này thay vì phương án khác (Trade-offs)?

## 🛠 Danh sách thay đổi (Key Changes)

- [ ] **Feature**: Mô tả tính năng mới 1.
- [ ] **Refactor**: Mô tả các phần code đã tái cấu trúc.
- [ ] **Fix**: Các lỗi đã được xử lý.
- [ ] **Database/Config**: Các thay đổi về môi trường, DB, biến .env (Cần lưu ý đặc biệt).

## 🧪 Bằng chứng Kiểm thử (Testing & Evidence)

### Các bước thực hiện

1. [Bước 1...]
2. [Bước 2...]

### Kết quả

- [ ] Unit Tests: [Pass/Fail/NA]
- [ ] E2E Tests: [Pass/Fail/NA]
- [ ] Manual Test: [Mô tả thiết bị/môi trường đã test]

## 📸 Hình ảnh minh họa (UI/UX)

> [!TIP]
> Ưu tiên ảnh chụp màn hình hoặc GIF/Video ngắn nếu có thay đổi giao diện.

## ⚠️ Đánh giá Tác động & Rủi ro (Impact & Risks)

- **Vùng ảnh hưởng**: Những module nào có khả năng bị ảnh hưởng bởi thay đổi này?
- **Rủi ro**: Có khả năng gây lỗi hồi quy (regression) ở đâu không?
- **Dependencies**: Cần merge PR nào trước không?

## ✅ Checklist trước khi Merge

- [ ] Đã tự review code của bản thân (Self-review).
- [ ] Code không chứa các thông tin nhạy cảm (API Keys, Passwords).
- [ ] Đã cập nhật tài liệu (nếu cần).
- [ ] Đã xóa các file debug/log dư thừa.
```

---

## 4. Tài liệu tham khảo

1. [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
2. [GitHub Flow](https://docs.github.com/en/get-started/using-git/github-flow)
3. [Universal Workflow](../20-Project/Universal-Workflow.md)

---
