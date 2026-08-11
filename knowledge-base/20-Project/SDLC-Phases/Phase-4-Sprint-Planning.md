---
id: KB-SDLC-P4
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 4: Lập Kế Hoạch Sprint (Sprint Planning)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Công cụ bổ trợ](#4-công-cụ-bổ-trợ)
5. [Câu lệnh mẫu](#5-câu-lệnh-mẫu)
6. [Tiêu chí chuyển Phase](#6-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                           |
| :--------------------- | :----------------------------------------------------------------- |
| **Role chính**         | 📋 **PO** (Product Owner)                                          |
| **Mục tiêu**           | Sắp xếp ưu tiên Backlog, chọn Stories cho Sprint, ước lượng effort |
| **Kích hoạt**          | `"Hãy đóng vai trò PO"` → File `.agent/roles/product-owner.md`     |
| **Thư mục tác nghiệp** | `docs/022-User-Stories/` + `docs/010-Planning/Sprints/`            |
| **Skills gợi ý**       | `agile-product-owner`, `clickup-expert`, `scrum-master`            |

---

## 2. Input cần có

- Toàn bộ User Stories trong Backlog (Phase 1)
- SDD + API Specs (Phase 2)
- UI Specs / Wireframes (Phase 3)
- Velocity trước đó (nếu không phải Sprint đầu)

---

## 3. Output (Artifacts)

| #   | Artifact                  | Đường dẫn SSOT                                         | Mô tả                                  |
| :-- | :------------------------ | :----------------------------------------------------- | :------------------------------------- |
| 1   | **Sprint Plan**           | `docs/010-Planning/Sprints/Sprint-{NNN}.md`            | Goal, Stories chọn, Definition of Done |
| 2   | **Active Sprint Stories** | `docs/022-User-Stories/Active-Sprint/Story-{Title}.md` | Stories chuyển từ Backlog sang Active  |
| 3   | **ClickUp Tasks**         | _(via MCP)_                                            | Tạo/sync tasks lên ClickUp             |

---

## 4. Công cụ bổ trợ

- **ClickUp MCP**: Tạo tasks, assign, set sprint
- **Skill `agile-product-owner`**: RICE prioritization, velocity tracking

---

## 5. Câu lệnh mẫu

```
"Dùng vai trò PO để lên Sprint Plan cho Sprint 1
 dựa trên Backlog tại @docs/022-User-Stories/Backlog/."

"Dùng vai trò PO để ước lượng Story Points cho các stories
 trong Sprint Plan."
```

---

## 6. Tiêu chí chuyển Phase

- [ ] Sprint Goal đã xác định rõ ràng
- [ ] Stories đã có Story Points và Acceptance Criteria
- [ ] Stories đã chuyển sang `Active-Sprint/`

---

## Tài liệu tham khảo

- [← Phase 3: Product Design](./Phase-3-Product-Design.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 5: Development Sprint →](./Phase-5-Development-Sprint.md)
