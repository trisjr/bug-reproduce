---
id: KB-SDLC-P8
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 8: Vận Hành & Cải Tiến (Operations & Retrospective)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Tiêu chí chuyển Sprint mới](#5-tiêu-chí-chuyển-sprint-mới)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                              |
| :--------------------- | :-------------------------------------------------------------------- |
| **Role chính**         | 🎩 **PM** + 📋 **PO**                                                 |
| **Mục tiêu**           | Theo dõi vận hành, thu thập feedback, rút kinh nghiệm cho Sprint tiếp |
| **Kích hoạt**          | PM cho Retro, PO cho Backlog grooming                                 |
| **Thư mục tác nghiệp** | `docs/080-Operations/` + `knowledge-base/40-Memory/`                  |

---

## 2. Input cần có

- Metrics vận hành (uptime, error rate, user feedback)
- Sprint velocity & burndown data
- Team feedback

---

## 3. Output (Artifacts)

| #   | Artifact                 | Đường dẫn SSOT                                           | Mô tả                                             |
| :-- | :----------------------- | :------------------------------------------------------- | :------------------------------------------------ |
| 1   | **Sprint Retrospective** | `docs/010-Planning/Sprints/Retro-Sprint-{NNN}.md`        | Bài học rút ra (What went well / What to improve) |
| 2   | **After Action Review**  | `knowledge-base/40-Memory/After-Action-Review.md`        | Cập nhật bài học kinh nghiệm vào Memory           |
| 3   | **Incident Report**      | `docs/080-Operations/Incidents/Incident-{NNN}-{Date}.md` | Báo cáo sự cố (nếu có)                            |
| 4   | **Backlog Updated**      | `docs/022-User-Stories/Backlog/`                         | Stories mới từ feedback                           |

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò PM để tổ chức Sprint Retrospective cho Sprint 1."

"/scrum-sprint-report" → Tạo báo cáo Sprint tự động

"/memo" → Đúc kết kinh nghiệm và lưu vào Role Memory
```

---

## 5. Tiêu chí chuyển Sprint mới

- [ ] Retro đã hoàn thành
- [ ] Bài học đã cập nhật vào After-Action-Review
- [ ] Backlog đã được grooming (thêm/sửa Stories từ feedback)
- [ ] → **Quay lại Phase 4** cho Sprint tiếp theo

---

## Tài liệu tham khảo

- [← Phase 7: Deployment & Release](./Phase-7-Deployment-Release.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
