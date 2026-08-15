---
id: MOC-PLANNING
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-15
---

# Planning Map of Content (MOC)

Chiến lược, lịch trình và quản trị rủi ro. Xem thêm [Documentation Master Index](../000-Index.md).

## Tài liệu dự án Repro

- [Charter-Repro](./Charter-Repro.md) — Project Charter: business case, objectives, stakeholders, recommended next step
- [Roadmap](./Roadmap.md) — Phase 0 (technical spike, **✅ Go từ 2026-08-14**) → V0.1 → V0.2 → V0.3 → Future, kèm Non-Goals
- [Risk-Register](./Risk-Register.md) — 18 risk của `RQ.md §21`, 11 threat chưa có mitigation, 5 mâu thuẫn nội tại của tài liệu gốc, **5 rủi ro sinh từ năm quyết định gate** (§4.2), và **6 rủi ro + 2 blocker sinh từ Timeline** (§4.4, 2026-08-15 — họ `TL-*`, họ duy nhất nói về *khả năng thực thi* thay vì về sản phẩm)
- [Estimates/Timeline-Repro](./Estimates/Timeline-Repro.md) — **Timeline & WBS** · ✅ **`status: approved` — `@TrisJr` duyệt 2026-08-15**. 9 khối `P0-A` → `P5` (gồm `LG` Legal & Compliance chạy song song `P1`, `P4` Design Partner & Market Validation, `P5` GTM & Commercial), 10 vai, WBS tới mức task cho Phase 0, workstream cho V0.1, critical path hai nhánh và **6 blocker**. **Lớp execution đặt trên Roadmap** — Roadmap giữ nguyên vai trò nguồn thứ tự.<br>**`T0` đã chốt**: `W1` = 2026-08-17. **Phase 0 = 10 tuần**, `P0-A` = `W1`–`W3` (46 MD / 50 = 92%) ⇒ **`GATE-06` = 2026-10-23**. *(Giãn hai lần trong ngày 2026-08-15: lần 1 mua đệm `W7`; lần 2 tiêu hết đệm đó vì analysis fan-out tìm ra ~4.5 MD phạm vi chưa được đếm — xem `TL-r1`.)*

## Thư mục

- [Sprints/](./Sprints/) — *(chưa có nội dung — sinh ra từ `D7`/`P2` của Timeline)*
- [Implementation-Plans/](./Implementation-Plans/) — *(chưa có nội dung)*
- [pm-runs/](./pm-runs/README.md) — run-state của các run `/pm-code` và `/pm-doc`
- [Estimates/](./Estimates/Timeline-Repro.md) — WBS / ETA / Budget. **Đã có `Timeline-Repro.md` từ 2026-08-15.** Budget bằng tiền vẫn **chưa có** — `RQ.md` không có dữ kiện chi phí và đơn giá lao động chưa được cung cấp; timeline chỉ ước lượng bằng **MD (man-day)**.

## Ghi chú trạng thái

- **[OKRs](./OKRs.md) cố ý giữ nguyên stub.** `RQ.md §31–32` là **North Star Metric và supporting metrics** — chúng thuộc mục *Success Metrics* của [PRD-Repro](../020-Requirements/PRD-Repro.md), **không phải** OKR có Objective / Key Result kèm chủ sở hữu và kỳ hạn. Đây là **quyết định**, không phải bỏ sót.
  - **Cập nhật 2026-08-14**: lý do *"chưa có owner"* **không còn đúng** — `GATE-01` đã cấp `@TrisJr`. Nhưng OKRs **vẫn giữ stub**, vì hai lý do còn lại vẫn nguyên: **chưa có kỳ** (Phase 0 chưa có timeline, `RQ.md` không có ước lượng effort nào) và **chưa có baseline** (chưa đo được gì — `N-05` còn chưa có ngưỡng, xem `GATE-01-r`).
  - **Cập nhật 2026-08-15**: lý do *"chưa có kỳ"* **đã hết đúng** — [Timeline-Repro](./Estimates/Timeline-Repro.md) được duyệt, `T0` chốt (`W1` = 2026-08-17), Phase 0 = `W1`–`W10` ⇒ kỳ dương lịch **quy đổi được**. Nhưng lý do **chưa có baseline vẫn nguyên vẹn**: `N-05` chỉ có ngưỡng tại `D1`, **sau** khi spike cho dữ liệu. ⇒ OKRs **vẫn giữ stub** — nay chỉ còn **một** lý do thay vì hai, và lý do đó đóng tại `GATE-06` (2026-10-23).
- Cột `Owner` của `Risk-Register`: **✅ CHỐT GATE-01 — 2026-08-14** — toàn bộ **18/18 risk** thuộc **`@TrisJr`**. `RQ.md` **vẫn** không có tên người hay tên team nào; tên này đến từ quyết định của anh, không từ tài liệu gốc. Lưu ý: một người giữ cả 18 risk là trạng thái **dự án một người**, không phải phân bổ trách nhiệm — xem [Charter §5.1](./Charter-Repro.md).
- **Năm quyết định gate ngày 2026-08-14** (`GATE-01`…`GATE-05`) được ghi tại [Risk-Register §4.2](./Risk-Register.md) (năm rủi ro phát sinh) và [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) (bản ghi gốc, kèm phản biện PM đã nêu trước khi anh chọn).
- ✅ **`P0-A` — Spike Protocol ĐÃ ĐÓNG 2026-08-15.** 🚪 **`Gate A` DUYỆT** bởi `@TrisJr`. Run container: [pm-runs/2026-08-15-p0a-spike-protocol](./pm-runs/2026-08-15-p0a-spike-protocol/verdict.md) (T3, ~14 MD, `W1`–`W3`).
  - **Ba deliverable `status: approved`**: [Spec-Spike-Protocol](../030-Specs/Spec-Spike-Protocol.md) · [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) · [Template-Spike-Report](../999-Resources/Templates/Template-Spike-Report.md).
  - **Đóng băng theo luật `L1`**: denominator **`D = 7`**, ngưỡng hiệu dụng **`≥6/7`** *(luôn trình bày dạng `6/7`, không dạng `80%`)*, chỉ số gate = **composite fail-closed**, **`K = 3`**.
  - **Bốn quyết định `@TrisJr` tại gate**: `G1` `GAP-Redis` = (c)+(a) · `G2` dữ liệu **synthetic** · `G3` đóng `U-13`/`U-16` · `G4` Phase 0 → **10 tuần**.
  - ⚠️ **`approved` KHÔNG nâng hypothesis thành định nghĩa sản phẩm** — cùng cách phân biệt `GATE-03` đã dùng cho 11 ADR. Nâng cấp là `D2`, sau `GATE-06`.
  - ⇒ **`P0-B` được phép bắt đầu** (`W4`). Nhưng `C1` **vẫn bị chặn** tới khi Known-Missing-Input Manifest được niêm phong — việc đó nay là task **`B10`** trong `P0-B`.
- ⚠️ **`P0-B` (`W4`–`W7`) chạy ở 110% capacity và KHÔNG có đệm.** `B10` (0.5 MD, phát hiện sau `Gate A`) đẩy nó từ 107% lên 110%. Đệm duy nhất của Phase 0 nằm ở `P0-C` và **đã có chủ** — dành cho khả năng `C1` phải chạy lại nếu phân bố `SEC-008` bị kiểm duyệt. ⇒ **`P0-B` trượt thì trượt thẳng vào `GATE-06`**, không có gì hấp thụ.
