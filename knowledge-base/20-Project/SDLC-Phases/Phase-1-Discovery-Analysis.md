---
id: KB-SDLC-P1
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 1: Khám Phá & Phân Tích (Discovery & Analysis)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Tiêu chí chuyển Phase](#5-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                                |
| :--------------------- | :-------------------------------------------------------------------------------------- |
| **Role chính**         | 🕵️ **BA** (Business Analyst)                                                            |
| **Support**            | 🎩 **PM** (brief PRD) — 🕵️ **Researcher** (insights) — 🧪 **QA** (Shift-Left review AC) |
| **Mục tiêu**           | Chuyển ý tưởng thành yêu cầu nghiệp vụ cụ thể, xác định scope rõ ràng                   |
| **Kích hoạt**          | `"Hãy đóng vai trò BA"` → File `.agent/roles/business-analyst.md`                       |
| **Thư mục tác nghiệp** | `docs/020-Requirements/` + `docs/022-User-Stories/`                                     |
| **Skills gợi ý**       | `business-analyst`, `brainstorming`, `ux-researcher-designer`, `product-owner`          |

> [!TIP]
> **Phân công PRD:** PM khởi tạo PRD brief (tầm nhìn, mục tiêu) → BA chi tiết hóa thành PRD đầy đủ (luồng xử lý, edge cases, AC). Cả hai đều sở hữu file `PRD-{Project}.md`.

---

## 2. Input cần có

- Project Charter + Research Notes (Phase 0)
- Meeting Notes / Cuộc phỏng vấn Stakeholder
- Feedback từ Researcher (nếu có)

---

## 3. Output (Artifacts)

| #   | Artifact                        | Đường dẫn SSOT                                       | Mô tả                                                            |
| :-- | :------------------------------ | :--------------------------------------------------- | :---------------------------------------------------------------- |
| 1   | **PRD**                         | `docs/020-Requirements/PRD-{Project}.md`             | Product Requirements Document — toàn bộ yêu cầu sản phẩm         |
| 2   | **SRS**                         | `docs/020-Requirements/SRS-{Project}.md`             | Software Requirements Specification — yêu cầu kỹ thuật phần mềm  |
| 3   | **BRD**                         | `docs/020-Requirements/BRD/BRD-{NNN}-{Title}.md`     | Business Requirements Document cho từng module                   |
| 4   | **Use Cases**                   | `docs/020-Requirements/Use-Cases/UC-{NN}-{Title}.md` | Kịch bản sử dụng chi tiết (Actor, Flow, Alt Flow)                |
| 5   | **Epics**                       | `docs/022-User-Stories/Epics/Epic-{Title}.md`        | Nhóm tính năng lớn (linked tới PRD)                              |
| 6   | **User Stories**                | `docs/022-User-Stories/Backlog/Story-{Title}.md`     | Stories chuẩn INVEST (linked tới Epic)                           |
| 7   | **Prioritized Backlog** _(PO)_ | `docs/022-User-Stories/Backlog-Priority.md`          | Backlog đã sắp xếp ưu tiên (RICE/MoSCoW), đánh dấu MVP Stories |
| 8   | **Glossary** _(cập nhật)_       | `knowledge-base/01-Metas/Glossary.md`                | Đồng bộ thuật ngữ Ubiquitous Language                            |

> [!WARNING]
> **QA Shift-Left:** Khuyến khích mời QA review Acceptance Criteria ngay ở Phase này. QA sẽ phát hiện các AC mơ hồ hoặc thiếu Unhappy Paths sớm, giảm chi phí sửa lỗi muộn.

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò BA để phân tích nghiệp vụ và viết PRD
 dựa trên @Charter-{Project}.md."

"Dùng vai trò BA để tách tính năng từ @PRD thành
 các User Story chuẩn INVEST."

"Hỏi QA: Acceptance Criteria của Story-Login có đủ
 Unhappy Paths chưa?"
```

---

## 5. Tiêu chí chuyển Phase

- [ ] PRD đã được PO/Stakeholder duyệt
- [ ] Ít nhất 1 Epic và 5 User Stories đã tạo
- [ ] Tất cả Use Cases có đầy đủ Main Flow & Alternative Flow
- [ ] Stories có liên kết (wiki-link) ngược về Epic & PRD
- [ ] **Backlog đã được sắp xếp ưu tiên** (RICE/MoSCoW) với MVP Stories được đánh dấu
- [ ] Glossary đã cập nhật thuật ngữ mới

---

## Tài liệu tham khảo

- [← Phase 0: Project Inception](./Phase-0-Project-Inception.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 2: Architecture Design →](./Phase-2-Architecture-Design.md)
