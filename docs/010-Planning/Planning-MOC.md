---
id: MOC-PLANNING
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-14
---

# Planning Map of Content (MOC)

Chiến lược, lịch trình và quản trị rủi ro. Xem thêm [Documentation Master Index](../000-Index.md).

## Tài liệu dự án Repro

- [Charter-Repro](./Charter-Repro.md) — Project Charter: business case, objectives, stakeholders, recommended next step
- [Roadmap](./Roadmap.md) — Phase 0 (technical spike, **✅ Go từ 2026-08-14**) → V0.1 → V0.2 → V0.3 → Future, kèm Non-Goals
- [Risk-Register](./Risk-Register.md) — 18 risk của `RQ.md §21`, 11 threat chưa có mitigation, 5 mâu thuẫn nội tại của tài liệu gốc, và **5 rủi ro sinh từ năm quyết định gate** (§4.2)
- [Estimates/Timeline-Repro](./Estimates/Timeline-Repro.md) — **Timeline & WBS** (2026-08-15): 9 khối `P0-A` → `P5` (gồm `LG` Legal & Compliance chạy song song `P1`, `P4` Design Partner & Market Validation, `P5` GTM & Commercial), 10 vai, WBS tới mức task cho Phase 0, workstream cho V0.1, critical path hai nhánh và **6 blocker**. **Lớp execution đặt trên Roadmap** — Roadmap giữ nguyên vai trò nguồn thứ tự

## Thư mục

- [Sprints/](./Sprints/) — *(chưa có nội dung — sinh ra từ `D7`/`P2` của Timeline)*
- [Implementation-Plans/](./Implementation-Plans/) — *(chưa có nội dung)*
- [pm-runs/](./pm-runs/README.md) — run-state của các run `/pm-code` và `/pm-doc`
- [Estimates/](./Estimates/Timeline-Repro.md) — WBS / ETA / Budget. **Đã có `Timeline-Repro.md` từ 2026-08-15.** Budget bằng tiền vẫn **chưa có** — `RQ.md` không có dữ kiện chi phí và đơn giá lao động chưa được cung cấp; timeline chỉ ước lượng bằng **MD (man-day)**.

## Ghi chú trạng thái

- **[OKRs](./OKRs.md) cố ý giữ nguyên stub.** `RQ.md §31–32` là **North Star Metric và supporting metrics** — chúng thuộc mục *Success Metrics* của [PRD-Repro](../020-Requirements/PRD-Repro.md), **không phải** OKR có Objective / Key Result kèm chủ sở hữu và kỳ hạn. Đây là **quyết định**, không phải bỏ sót.
  - **Cập nhật 2026-08-14**: lý do *"chưa có owner"* **không còn đúng** — `GATE-01` đã cấp `@TrisJr`. Nhưng OKRs **vẫn giữ stub**, vì hai lý do còn lại vẫn nguyên: **chưa có kỳ** (Phase 0 chưa có timeline, `RQ.md` không có ước lượng effort nào) và **chưa có baseline** (chưa đo được gì — `N-05` còn chưa có ngưỡng, xem `GATE-01-r`).
  - **Cập nhật 2026-08-15**: lý do *"chưa có kỳ"* nay **chỉ còn đúng một nửa** — [Timeline-Repro](./Estimates/Timeline-Repro.md) đã cấp cấu trúc kỳ (`W1`–`W8` cho Phase 0), nhưng **trục là tương đối** (`T0` chưa chọn — giả định `TL-A1`) nên chưa quy ra kỳ dương lịch được. Lý do **chưa có baseline vẫn nguyên vẹn**: `N-05` chỉ có ngưỡng tại `D1`, **sau** khi spike cho dữ liệu. ⇒ OKRs **vẫn giữ stub**. Thời điểm đúng để viết vẫn là **sau `GATE-06`**.
- Cột `Owner` của `Risk-Register`: **✅ CHỐT GATE-01 — 2026-08-14** — toàn bộ **18/18 risk** thuộc **`@TrisJr`**. `RQ.md` **vẫn** không có tên người hay tên team nào; tên này đến từ quyết định của anh, không từ tài liệu gốc. Lưu ý: một người giữ cả 18 risk là trạng thái **dự án một người**, không phải phân bổ trách nhiệm — xem [Charter §5.1](./Charter-Repro.md).
- **Năm quyết định gate ngày 2026-08-14** (`GATE-01`…`GATE-05`) được ghi tại [Risk-Register §4.2](./Risk-Register.md) (năm rủi ro phát sinh) và [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) (bản ghi gốc, kèm phản biện PM đã nêu trước khi anh chọn).
