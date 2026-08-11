---
id: KB-SDLC-P2
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 2: Thiết Kế Kiến Trúc (Architecture Design)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Tiêu chí chuyển Phase](#5-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                                                    |
| :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Role chính**         | 🏗️ **Architect**                                                                                            |
| **Support**            | 🛡️ **Security Auditor** (Threat Model) — 🛡️ **DevOps** (infra feasibility) — 🧪 **QA** (testability review) |
| **Mục tiêu**           | Thiết kế kiến trúc hệ thống, chọn tech stack, định nghĩa API & Schema                                       |
| **Kích hoạt**          | `"Hãy đóng vai trò Architect"` → File `.agent/roles/architect.md`                                           |
| **Thư mục tác nghiệp** | `docs/030-Specs/`                                                                                           |
| **Skills gợi ý**       | `software-architecture`, `senior-architect`, `database-design`, `senior-backend`                            |

---

## 2. Input cần có

- PRD + Use Cases (Phase 1)
- NFR (Non-Functional Requirements) nếu có
- Constraints về infra, budget, team size
- Research Notes (Phase 0) — tech trends

---

## 3. Output (Artifacts)

| #   | Artifact                               | Đường dẫn SSOT                                      | Mô tả                                                |
| :-- | :------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------- |
| 1   | **SDD**                                | `docs/030-Specs/Architecture/SDD-{Project}.md`      | System Design Document — kiến trúc tổng thể          |
| 2   | **ADR**                                | `docs/030-Specs/Architecture/ADR-{NNN}-{Title}.md`  | Architecture Decision Records (lý do chọn giải pháp) |
| 3   | **Tech Stack ADR**                     | `docs/030-Specs/Architecture/ADR-001-Tech-Stack.md` | Quyết định chọn công nghệ                            |
| 4   | **API Specs**                          | `docs/030-Specs/API/Endpoint-{Name}.md`             | Đặc tả từng API endpoint                             |
| 5   | **Integration Specs**                  | `docs/030-Specs/API/Spec-Integration-{Name}.md`     | Đặc tả tích hợp bên ngoài                            |
| 6   | **DB Schema**                          | `docs/030-Specs/Schema/DB-Entity-{Name}.md`         | Thiết kế cơ sở dữ liệu                               |
| 7   | **Security Spec** _(Security Auditor)_ | `docs/030-Specs/Security/Spec-Security-{Name}.md`   | Threat Model & Security Requirements                 |

> [!IMPORTANT]
> **🛡️ Security Review Gate:** Bắt buộc mời Security Auditor thực hiện Threat Modeling cho kiến trúc trước khi chuyển sang Phase 3. Đây là checkpoint bảo mật đầu tiên.

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò Architect để thiết kế System Architecture
 dựa trên @PRD-{Project}.md và @OKRs.md."

"Dùng vai trò Security Auditor để thực hiện Threat Model
 cho @SDD-{Project}.md."

"Hỏi DevOps: Kiến trúc này có phù hợp Cloud-native không?"
```

---

## 5. Tiêu chí chuyển Phase

- [ ] SDD có sơ đồ kiến trúc (Mermaid/Draw.io)
- [ ] Ít nhất 1 ADR cho quyết định tech stack
- [ ] API Specs cover hết các Use Cases chính
- [ ] DB Schema đã normalized và có ER Diagram
- [ ] ✅ **Security Spec đã được Security Auditor review**

---

## Tài liệu tham khảo

- [← Phase 1: Discovery & Analysis](./Phase-1-Discovery-Analysis.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 3: Product Design →](./Phase-3-Product-Design.md)
