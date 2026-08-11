---
id: KB-SDLC-P3
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 3: Thiết Kế UI/UX (Product Design)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Công cụ bổ trợ](#4-công-cụ-bổ-trợ)
5. [Câu lệnh mẫu](#5-câu-lệnh-mẫu)
6. [Tiêu chí chuyển Phase](#6-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                                                       |
| :--------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Role chính**         | 🎨 **Designer** (Product Designer)                                                                             |
| **Mục tiêu**           | Xây dựng Design System, Wireframe và UI Specs cho development                                                  |
| **Kích hoạt**          | `"Hãy đóng vai trò Designer"` → File `.agent/roles/product-designer.md`                                        |
| **Thư mục tác nghiệp** | `docs/040-Design/`                                                                                             |
| **Skills gợi ý**       | `product-designer`, `ui-ux-pro-max`, `ui-design-system`, `implementing-figma-designs`, `web-design-guidelines` |

---

## 2. Input cần có

- PRD + User Stories (Phase 1)
- SDD (Phase 2) — để hiểu giới hạn kỹ thuật
- Brand Guidelines (nếu có)

---

## 3. Output (Artifacts)

| #   | Artifact          | Đường dẫn SSOT                                        | Mô tả                                         |
| :-- | :---------------- | :---------------------------------------------------- | :-------------------------------------------- |
| 1   | **Design System** | `docs/040-Design/Design-System/`                      | Color Tokens, Typography, Spacing, Components |
| 2   | **Wireframes**    | `docs/040-Design/Wireframes/WF-{Screen}-{Device}.png` | Khung giao diện low/high-fidelity             |
| 3   | **User Flow**     | `docs/040-Design/Specs/UF-{Feature}.md`               | Sơ đồ luồng người dùng                        |
| 4   | **UI Specs**      | `docs/040-Design/Specs/Proto-{Screen}.md`             | Đặc tả chi tiết từng màn hình                 |
| 5   | **Assets**        | `docs/040-Design/Assets/`                             | Images, Icons, Illustrations                  |

---

## 4. Công cụ bổ trợ

- **Figma MCP**: Kết nối Figma để lấy design data trực tiếp
- **Stitch MCP**: Tạo UI prototype nhanh bằng AI
- **`generate_image`**: Tạo mockup/visual assets
- **Skill `web-design-guidelines`**: Audit UI Accessibility (WCAG)

---

## 5. Câu lệnh mẫu

```
"Dùng vai trò Designer để xây dựng Design System cho dự án
 dựa trên brand guidelines sau: [...]."

"Dùng vai trò Designer để tạo User Flow cho feature Login
 dựa trên @UC-01-Login.md."
```

---

## 6. Tiêu chí chuyển Phase

- [ ] Design System có đủ Colors, Typography, Spacing
- [ ] Wireframe cho ít nhất các màn hình chính
- [ ] User Flow cover hết Main Flow trong Use Cases
- [ ] UI Specs có đầy đủ trạng thái (Hover, Error, Loading)

---

## Tài liệu tham khảo

- [← Phase 2: Architecture Design](./Phase-2-Architecture-Design.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 4: Sprint Planning →](./Phase-4-Sprint-Planning.md)
