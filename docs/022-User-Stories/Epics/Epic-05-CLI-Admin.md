---
id: EPIC-05
type: epic
status: approved
project: repro
owner: "@product-owner"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/PRD-Repro.md"
---

# 💻 Epic-05 — Unified Developer CLI & Operational Admin Tooling

## 1. Overview & Business Value

Epic này xây dựng giao diện dòng lệnh chính (**Unified Developer CLI `@repro/cli`** — [PRD-Repro §5.5](../../020-Requirements/PRD-Repro.md)), đóng vai trò là bề mặt tương tác chính của toàn bộ hệ sinh thái Repro V0.1 ($§33.2$). CLI bao gồm 6 verbs dành cho lập trình viên (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) và 4 nhóm verbs vận hành / bảo mật dành cho SRE và Quản trị viên (`auth`, `purge`, `keys`, `audit`).

- **Parent Requirements**: [PRD-Repro §5.5](../../020-Requirements/PRD-Repro.md) (`FR-047` .. `FR-053d`).
- **Target Workstream**: `WS-5` (CLI 6 Verbs) & `WS-7` (DevOps & CI).
- **Target Persona**: Software Engineer & SRE / DevOps.

---

## 2. In-Scope User Stories

1. **`Story-16`**: Bộ 6 Verbs Lập Trình Viên (`repro list`, `pull`, `inspect`, `replay`, `diff`, `verify`).
2. **`Story-17`**: Bộ Verbs Vận Hành & Quản Trị Bảo Mật (`repro auth`, `purge`, `keys`, `audit`).
3. **`Story-18`**: Định Dạng Kết Xuất Máy Đọc Được (`--json`), Quản Lý Exit Codes & Tích Hợp CI Pipeline.

---

## 3. High-Level Acceptance Criteria (DoD)

- [ ] **AC-01 (CLI-First Experience)**: Toàn bộ vòng lặp Capture $\to$ Replay $\to$ Verify thực hiện trơn tru trên terminal mà không đòi hỏi giao diện web dashboard ($UX\text{-}01$).
- [ ] **AC-02 (Interactive UX Checklist)**: Lệnh `repro replay` in ra checklist trực quan từng loại input đã phát lại (Request, DB, HTTP, Flags, Clock) trước khi đưa ra kết luận ($UX\text{-}02$).
- [ ] **AC-03 (Strict Contract Verbiage)**: Nghiêm cấm in ra các khẳng định phóng đại như `✓ Production bug is definitely fixed`; bắt buộc dùng ngôn ngữ giới hạn chuẩn của $§20.16$.
- [ ] **AC-04 (Admin & Security Operations)**: SRE thực hiện được lệnh xoá vĩnh viễn khoá crypto-shredding (`repro purge --before=<date>`) và kiểm tra tính toàn vẹn khoá (`repro keys status`).
- [ ] **AC-05 (CI/CD Exit Codes)**: Hỗ trợ cờ `--json` và mã thoát exit code chuẩn hoá (0: Match/Success, 1: Fatal Error, 2: Diverged / Bug Reproduced, 3: Incomplete Capture / Truncated).
