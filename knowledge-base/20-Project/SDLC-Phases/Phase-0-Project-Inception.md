---
id: KB-SDLC-P0
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 0: Khởi Tạo Dự Án (Project Inception)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Tiêu chí chuyển Phase](#5-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                     |
| :--------------------- | :--------------------------------------------------------------------------- |
| **Role chính**         | 🎩 **PM** (Product Manager)                                                  |
| **Support**            | 🕵️ **Researcher** — nghiên cứu thị trường & đối thủ                          |
| **Mục tiêu**           | Xác định tầm nhìn, mục tiêu kinh doanh, và thiết lập nền tảng quản trị dự án |
| **Kích hoạt**          | `"Hãy đóng vai trò PM"` → File `.agent/roles/product-manager.md`             |
| **Thư mục tác nghiệp** | `docs/010-Planning/`                                                         |
| **Skills gợi ý**       | `product-manager-toolkit`, `product-strategist`, `brainstorming`             |

---

## 2. Input cần có

- Ý tưởng sản phẩm / Brief từ Stakeholder
- Ngân sách & Timeline dự kiến
- Thông tin thị trường / đối thủ (nếu có)

---

## 3. Output (Artifacts)

| #   | Artifact                          | Đường dẫn SSOT                           | Mô tả                                           |
| :-- | :-------------------------------- | :--------------------------------------- | :---------------------------------------------- |
| 1   | **Project Charter**               | `docs/010-Planning/Charter-{Project}.md` | Mục tiêu, phạm vi, Stakeholder Matrix (RACI), constraints |
| 2   | **Product Roadmap**               | `docs/010-Planning/Roadmap.md`           | Lộ trình phát triển tổng thể (3-6 tháng)                  |
| 3   | **OKRs**                          | `docs/010-Planning/OKRs.md`              | Mục tiêu & Kết quả then chốt                              |
| 4   | **Risk Register**                 | `docs/010-Planning/Risk-Register.md`     | Danh sách rủi ro và kế hoạch giảm thiểu                   |
| 5   | **MVP Scope**                     | `docs/010-Planning/MVP-Scope.md`         | Ranh giới MVP vs Full Scope, Go/No-Go Decision             |
| 6   | **Cấu trúc thư mục**              | `docs/` (toàn bộ Dewey)                  | Khởi tạo cấu trúc docs/ theo Documents-Template           |
| 7   | **Research Notes** _(Researcher)_ | `docs/050-Research/Analysis-{Topic}.md`  | Kết quả nghiên cứu đối thủ, thị trường                    |

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò PM để tạo Project Charter cho dự án [Tên]
 dựa trên brief sau: [Mô tả ý tưởng]."

"Dùng vai trò Researcher để nghiên cứu đối thủ cạnh tranh
 cho dự án @Charter-{Project}.md."
```

---

## 5. Tiêu chí chuyển Phase

- [ ] Project Charter đã được Stakeholder duyệt (bao gồm RACI Matrix)
- [ ] Roadmap có ít nhất 2 Milestones
- [ ] **Go/No-Go Decision** đã được Stakeholder phê duyệt
- [ ] **MVP Scope** đã tách rõ khỏi Full Scope
- [ ] Cấu trúc `docs/` đã được khởi tạo đầy đủ
- [ ] Research Notes đã có (nếu thị trường chưa rõ)

---

## Tài liệu tham khảo

- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 1: Discovery & Analysis →](./Phase-1-Discovery-Analysis.md)
