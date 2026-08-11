---
id: KB-SDLC-P5
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 5: Phát Triển (Development Sprint)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Quy trình Dev với OpenSpec](#4-quy-trình-dev-với-openspec)
5. [Security Gate](#5-security-gate)
6. [Câu lệnh mẫu](#6-câu-lệnh-mẫu)
7. [Tiêu chí chuyển Phase](#7-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                                       |
| :--------------------- | :--------------------------------------------------------------------------------------------- |
| **Role chính**         | 🧑‍💻 **Engineer** (Software Engineer)                                                            |
| **Support**            | 🛡️ **Security Auditor** (code audit cho features nhạy cảm)                                     |
| **Mục tiêu**           | Viết code theo Specs, tuân thủ Clean Code, tạo PR                                              |
| **Kích hoạt**          | `"Hãy đóng vai trò Engineer"` → File `.agent/roles/software-engineer.md`                       |
| **Thư mục tác nghiệp** | Source code (`src/`) + `docs/022-User-Stories/Active-Sprint/`                                  |
| **Skills gợi ý**       | `software-engineer`, `typescript-expert`, `senior-frontend`, `senior-backend`, `code-reviewer` |

---

## 2. Input cần có

- Active Sprint Stories (Phase 4) — với Acceptance Criteria
- API Specs + DB Schema (Phase 2)
- UI Specs / Design System (Phase 3)
- Coding Standards (`knowledge-base/10-Technical/Coding-Standards.md`)

---

## 3. Output (Artifacts)

| #   | Artifact            | Đường dẫn             | Mô tả                            |
| :-- | :------------------ | :-------------------- | :------------------------------- |
| 1   | **Source Code**     | `src/` (project repo) | Code implementation cho Stories  |
| 2   | **Unit Tests**      | `src/**/*.test.ts`    | Tests cho logic nghiệp vụ        |
| 3   | **Pull Request**    | GitHub (via MCP)      | PR với mô tả theo template chuẩn |
| 4   | **OpenSpec Change** | `openspec/changes/`   | Delta specs cho từng thay đổi    |

---

## 4. Quy trình Dev với OpenSpec

```
1. /opsx-explore    → Phân tích impact, tư duy giải pháp (nếu cần)
2. /opsx-new        → Tạo change mới cho Story (hoặc /opsx-ff cho fast-forward)
3. /opsx-continue   → Tạo artifacts tuần tự (delta specs, plan)
4. /opsx-apply      → Thực thi code theo plan đã duyệt
5. /opsx-verify     → Verify code khớp với specs trước khi commit
6. /submit-pr       → Tạo branch, commit, push, tạo PR
7. /opsx-sync       → Sync delta specs vào main specs (sau khi merge)
8. /opsx-archive    → Archive change đã hoàn thành
```

> [!TIP]
> **Fast-forward:** Dùng `/opsx-ff` để gộp bước 2-4 thành một lần duy nhất cho các Story đơn giản.

---

## 5. Security Gate

Cho features nhạy cảm (Auth, Payment, PII...):

```
"Dùng vai trò Security Auditor để review code Auth
 tại @src/auth/ trước khi submit PR."
```

---

## 6. Câu lệnh mẫu

```
"Dùng vai trò Engineer để implement Story-Login
 dựa trên @Endpoint-Auth.md và @Proto-Login.md."

"/opsx-ff" → Fast-forward: tạo change + implement trong 1 lần
```

---

## 7. Tiêu chí chuyển Phase

- [ ] Code pass lint + build
- [ ] Unit tests > 80% coverage cho logic mới
- [ ] `/opsx-verify` pass — code khớp với specs
- [ ] PR đã tạo theo chuẩn `/submit-pr`
- [ ] Code đã review (hoặc self-review qua skill `code-reviewer`)
- [ ] Security review pass (nếu feature nhạy cảm)

---

## Tài liệu tham khảo

- [← Phase 4: Sprint Planning](./Phase-4-Sprint-Planning.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 6: Quality Assurance →](./Phase-6-Quality-Assurance.md)
