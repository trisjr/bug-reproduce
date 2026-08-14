---
id: MOC-QA
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-14
---

# 📂 035-QA Map of Content (MOC)

Đảm bảo chất lượng: test plan, test case, báo cáo lỗi và kiểm thử hiệu năng. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Chưa có tài liệu QA nào cho dự án Repro.** Đây là trạng thái đúng, không phải thiếu sót:

- `src/` và `test/` của repo còn **rỗng** — chưa có gì để kiểm thử. Toàn bộ bộ tài liệu hiện có là thiết kế **trước khi** hiện thực, xem [Specs-MOC](../030-Specs/Specs-MOC.md).
- `RQ.md §39` khuyến nghị chạy **technical spike trước**, chưa vào MVP. Test plan viết trước spike sẽ phải làm lại.
- **Chưa có tiêu chí pass/fail cho chỉ số thành công của V0.1.** `N-05` (Execution Match Rate) là thước đo chính của V0.1 sau quyết định `D1`, nhưng `RQ.md §24` **không đặt ngưỡng** cho nó — xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md) và [ADR-006](../030-Specs/Architecture/ADR-006-Execution-Verification-By-Equivalence.md). Đây là rào chắn thật: **không có ngưỡng thì không viết được cổng đạt/không-đạt** cho spike.

> [!WARNING]
> Khi bắt đầu viết test plan, **đọc `U-04` ở [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) trước.** Chừng nào *"sufficiently equivalent"* chưa được định nghĩa, khái niệm *"execution replay đúng"* chưa kiểm thử được một cách khách quan — mọi assertion về equivalence sẽ dựa trên một định nghĩa chưa tồn tại.

## Thư mục con theo RULE-001

- [Test-Plans/](./Test-Plans/) — Master Test Plan (`MTP-{Name}.md`). *(chưa có nội dung)*
- [Reports/](./Reports/) — Bug Report và Test Execution Report. *(chưa có nội dung)*
- `Test-Cases/` — **chưa tạo**. Chưa có feature nào được hiện thực để viết test case.
- `Automation/` — **chưa tạo**. Chưa có test suite nào để tự động hoá.
- `Performance/` — **chưa tạo**. Ngưỡng hiệu năng của V0.1 (`N-02` latency overhead `< 5%`, `N-03` capsule size average `< 10 MB`, `N-04` replay time `< 30s`, `N-09` P95 `TBD`) nằm ở [NFR-Repro §2–§3](../020-Requirements/NFR-Repro.md); chưa có phép đo thật nào. Cả `N-01`…`N-04` đều là **hypothesis của spike**, `NFR §1` cấm dùng làm acceptance criteria.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Test-Cases/` và `./Automation/` — **hai thư mục chưa bao giờ tồn tại trong repo**. Hai link chết đó đã được gỡ ngày 2026-08-14 và thay bằng tên thư mục dạng plain text kèm lý do. Không có file hay thư mục nào bị xoá.
