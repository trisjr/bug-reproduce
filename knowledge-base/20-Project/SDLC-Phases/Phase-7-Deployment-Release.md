---
id: KB-SDLC-P7
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 7: Triển Khai (Deployment & Release)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Tiêu chí chuyển Phase](#5-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                             |
| :--------------------- | :------------------------------------------------------------------- |
| **Role chính**         | 🛡️ **DevOps** (DevOps Engineer)                                      |
| **Mục tiêu**           | Đưa sản phẩm lên môi trường Staging/Production                       |
| **Kích hoạt**          | `"Hãy đóng vai trò DevOps"` → File `.agent/roles/devops-engineer.md` |
| **Thư mục tác nghiệp** | `docs/070-Deployment/`                                               |
| **Skills gợi ý**       | `senior-devops`, `git-pushing`, `senior-secops`                      |

---

## 2. Input cần có

- Test Report đã Pass (Phase 6)
- Source code merged vào `main`/`release` branch
- Infra configuration (env, secrets)

---

## 3. Output (Artifacts)

| #   | Artifact             | Đường dẫn SSOT                                      | Mô tả                                       |
| :-- | :------------------- | :-------------------------------------------------- | :------------------------------------------ |
| 1   | **Release Notes**    | `docs/070-Deployment/Releases/Release-{Version}.md` | Danh sách thay đổi trong release            |
| 2   | **CHANGELOG**        | `docs/070-Deployment/CHANGELOG.md`                  | Lịch sử thay đổi tích lũy qua các phiên bản |
| 3   | **Deployment Guide** | `docs/070-Deployment/Deploy-{Env}.md`               | Hướng dẫn triển khai                        |
| 4   | **Runbook**          | `docs/070-Deployment/Runbooks/Runbook-{Service}.md` | Quy trình vận hành dịch vụ                  |
| 5   | **Rollback Plan**    | `docs/070-Deployment/Rollback-{Version}.md`         | Kế hoạch rollback nếu lỗi                   |

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò DevOps để tạo Release Notes cho version 1.0
 dựa trên các PR đã merge trong Sprint 1."

"Dùng vai trò DevOps để viết Runbook cho dịch vụ Authentication."
```

---

## 5. Tiêu chí chuyển Phase

- [ ] Deploy thành công lên Staging
- [ ] Smoke test pass trên Staging
- [ ] Release Notes + CHANGELOG đã tạo
- [ ] Rollback Plan đã sẵn sàng

---

## Tài liệu tham khảo

- [← Phase 6: Quality Assurance](./Phase-6-Quality-Assurance.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 8: Operations & Retro →](./Phase-8-Operations-Retro.md)
