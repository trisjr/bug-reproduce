---
name: git-pushing
description: Stage, commit, and push git changes with conventional commit messages. Use when user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work.
---

# Git Push Workflow (TNMCORE-OS Standard)

Quy trình chuẩn để chuẩn bị (stage), đóng gói (commit) và đẩy (push) các thay đổi mã nguồn lên Remote Repository tuân thủ tiêu chuẩn **Conventional Commits**.

## Table of Contents
1. [Khi nào sử dụng](#khi-nào-sử-dụng)
2. [Tiêu chuẩn Conventional Commits](#tiêu-chuẩn-conventional-commits)
3. [Quy trình thực hiện chi tiết](#quy-trình-thực-hiện-chi-tiết)
4. [Công cụ hỗ trợ](#công-cụ-hỗ-trợ)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Khi nào sử dụng (When to Use)

Tự động kích hoạt khi người dùng yêu cầu đẩy thay đổi ("push this", "đẩy code lên"), nhắc đến việc lưu trữ ("save to github") hoặc hoàn thành task và muốn chia sẻ với team.

## Tiêu chuẩn Conventional Commits

Mọi commit message **PHẢI** tuân thủ cấu trúc: `<type>(<scope>): <description>`

### Các loại Commit phổ biến (Types)
- **feat**: Tính năng mới.
- **fix**: Sửa lỗi.
- **docs**: Thay đổi tài liệu.
- **style**: Thay đổi định dạng (không ảnh hưởng logic).
- **refactor**: Tái cấu trúc mã nguồn.
- **perf**: Cải tiến hiệu suất.
- **test**: Thêm hoặc sửa test.
- **chore**: Bảo trì hoặc dọn dẹp.

## Quy trình thực hiện chi tiết (Step-by-Step)

### Bước 1: Kiểm tra trạng thái (Status Discovery)
Sử dụng `git status` và `git diff --stat` để nắm bắt các thay đổi.

### Bước 2: Gom nhóm thay đổi (Staging)
Dùng `git add .` hoặc `git add <file>` để chuẩn bị staging.

### Bước 3: Đóng gói (Commit)
Tạo commit message theo chuẩn. Ví dụ: `git commit -m "feat(ui): add navigation bar"`.

### Bước 4: Đồng bộ & Chống xung đột (Sync & Rebase)
**LUÔN LUÔN** pull code mới nhất và rebase trước khi push:
`git pull origin <branch_name> --rebase`

### Bước 5: Đẩy code (Push)
Sau khi rebase thành công: `git push origin <branch_name>`.

## Công cụ hỗ trợ (Scripts)
Có thể sử dụng script tự động cho các thay đổi đơn giản:
```bash
bash .agent/skills/git-pushing/scripts/smart_commit.sh "feat(ui): add context menu"
```

## Tài liệu tham khảo
- [Conventional Commits Official](https://www.conventionalcommits.org/).
- SOP TNMCORE-OS (Mục Git Agent).
- GitHub Flow documentation.
