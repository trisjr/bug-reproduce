---
id: MOC-040
type: moc
status: draft
created: 2026-08-11
updated: 2026-08-14
---

# 📂 040-Design Map of Content (MOC)

UI/UX, Design System và đặc tả giao diện. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Chưa có tài liệu thiết kế nào cho dự án Repro.** Đây là trạng thái đúng, không phải thiếu sót:

- **CLI là primary interface của V0.1** — [PRD `FR-053`](../020-Requirements/PRD-Repro.md) (`RQ.md §33.2`, §25, §20.14). Bề mặt giao diện của V0.1 là 6 CLI verb, được đặc tả ở [SDD §5](../030-Specs/Architecture/SDD-Repro.md) chứ không phải ở thư mục này.
- **`Large observability dashboard` là Non-Goal bị loại vĩnh viễn** — [PRD `NG-11`](../020-Requirements/PRD-Repro.md) và [Roadmap](../010-Planning/Roadmap.md) mục 11, neo vào `RQ.md §19` (MVP Non-Goals) và §25 (*"without requiring a large dashboard or complicated infrastructure"*).
- **Ràng buộc UX duy nhất đã được ghi** nằm ở [PRD `UX-01`](../020-Requirements/PRD-Repro.md), không cần một tài liệu thiết kế riêng để phát biểu nó.

> [!NOTE]
> `NG-11` loại **"large dashboard"**, **không** loại mọi giao diện đồ hoạ về sau. Nếu một bề mặt UI được đưa vào phạm vi ở V0.2 trở đi ([Roadmap](../010-Planning/Roadmap.md)), tài liệu thiết kế của nó thuộc về đúng thư mục này — lúc đó MOC này phải được cập nhật, và `NG-11` phải được đọc lại nguyên văn trước khi viện dẫn.

## Thư mục con theo RULE-001

- [Design-System/](./Design-System/) — *(chưa có nội dung)*
- [Specs/](./Specs/) — User Flow, Prototype Spec. *(chưa có nội dung)*
- `Wireframes/` — **chưa tạo**. Chưa có màn hình nào để wireframe.
- `Assets/` — **chưa tạo**. Chưa có asset thiết kế nào.

## Ghi chú lịch sử

File này tồn tại từ 2026-08-11 nhưng **rỗng hoàn toàn, không có cả frontmatter** — vi phạm `RULE-001` §Bản mẫu Frontmatter. Nội dung hiện tại được viết ngày 2026-08-14 để đóng khoản nợ đó. Không có nội dung cũ nào bị xoá.
