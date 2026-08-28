---
id: MOC-PLANNING
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-28
---

# Planning Map of Content (MOC)

Chiến lược, lịch trình và quản trị rủi ro. Xem thêm [Documentation Master Index](../000-Index.md).

## Tài liệu dự án Repro

- [Charter-Repro](./Charter-Repro.md) — Project Charter: business case, objectives, stakeholders, recommended next step
- [Roadmap](./Roadmap.md) — Phase 0 (technical spike, **✅ Go từ 2026-08-14**) → V0.1 → V0.2 → V0.3 → Future, kèm Non-Goals
- [Risk-Register](./Risk-Register.md) — 18 risk của `RQ.md §21`, 11 threat chưa có mitigation, 5 mâu thuẫn nội tại của tài liệu gốc, **5 rủi ro sinh từ năm quyết định gate** (§4.2), và **6 rủi ro + 2 blocker sinh từ Timeline** (§4.4, 2026-08-15 — họ `TL-*`, họ duy nhất nói về *khả năng thực thi* thay vì về sản phẩm)
- [Estimates/Timeline-Repro](./Estimates/Timeline-Repro.md) — **Timeline & WBS** · ✅ **`status: approved` — `@TrisJr` duyệt 2026-08-15**. 9 khối `P0-A` → `P5` (gồm `LG` Legal & Compliance chạy song song `P1`, `P4` Design Partner & Market Validation, `P5` GTM & Commercial), 10 vai, WBS tới mức task cho Phase 0, workstream cho V0.1, critical path hai nhánh và **6 blocker**. **Lớp execution đặt trên Roadmap** — Roadmap giữ nguyên vai trò nguồn thứ tự.<br>**`T0` đã chốt**: `W1` = 2026-08-17. **Phase 0 = 12 tuần** (~54.0–54.7 MD / 60 = 90–91%) ⇒ **`GATE-06` = 2026-11-06**. **Phase `P0-C` đã hoàn tất 100% (Task C1–C6)**, sẵn sàng cho phán quyết của Sponsor `@TrisJr` tại `GATE-06`.

## Thư mục

- [Sprints/](./Sprints/) — *(chưa có nội dung — sinh ra từ `D7`/`P2` của Timeline)*
- [Implementation-Plans/](./Implementation-Plans/) — *(chưa có nội dung)*
- [pm-runs/](./pm-runs/README.md) — run-state của các run `/pm-code` và `/pm-doc`
- [Estimates/](./Estimates/Timeline-Repro.md) — WBS / ETA / Budget. **Đã có `Timeline-Repro.md` từ 2026-08-15.** Budget bằng tiền vẫn **chưa có** — `RQ.md` không có dữ kiện chi phí và đơn giá lao động chưa được cung cấp; timeline chỉ ước lượng bằng **MD (man-day)**.

## Ghi chú trạng thái

- **[OKRs](./OKRs.md) cố ý giữ nguyên stub.** `RQ.md §31–32` là **North Star Metric và supporting metrics** — chúng thuộc mục *Success Metrics* của [PRD-Repro](../020-Requirements/PRD-Repro.md), **không phải** OKR có Objective / Key Result kèm chủ sở hữu và kỳ hạn. Đây là **quyết định**, không phải bỏ sót.
  - **Cập nhật 2026-08-14**: lý do *"chưa có owner"* **không còn đúng** — `GATE-01` đã cấp `@TrisJr`. Nhưng OKRs **vẫn giữ stub**, vì hai lý do còn lại vẫn nguyên: **chưa có kỳ** (Phase 0 chưa có timeline, `RQ.md` không có ước lượng effort nào) và **chưa có baseline** (chưa đo được gì — `N-05` còn chưa có ngưỡng, xem `GATE-01-r`).
  - **Cập nhật 2026-08-28**: Phase `P0-C` đã chạy xong và cung cấp số liệu thực nghiệm đầy đủ (`N-05` in-class = $100.0\%$, Composite $7/7$, Latency $+1.62\%$, Peak RSS $45.2\text{ MB}$). Sau `GATE-06`, baseline thực nghiệm sẽ chính thức được chuyển thành cam kết SLA và OKR tại Phase `P1` (Task `D1`).
- Cột `Owner` của `Risk-Register`: **✅ CHỐT GATE-01 — 2026-08-14** — toàn bộ **18/18 risk** thuộc **`@TrisJr`**. `RQ.md` **vẫn** không có tên người hay tên team nào; tên này đến từ quyết định của anh, không từ tài liệu gốc. Lưu ý: một người giữ cả 18 risk là trạng thái **dự án một người**, không phải phân bổ trách nhiệm — xem [Charter §5.1](./Charter-Repro.md).
- **Năm quyết định gate ngày 2026-08-14** (`GATE-01`…`GATE-05`) được ghi tại [Risk-Register §4.2](./Risk-Register.md) (năm rủi ro phát sinh) và [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) (bản ghi gốc, kèm phản biện PM đã nêu trước khi anh chọn).
- ✅ **`P0-A` — Spike Protocol ĐÃ ĐÓNG 2026-08-15.** 🚪 **`Gate A` DUYỆT** bởi `@TrisJr`. Run container: [pm-runs/2026-08-15-p0a-spike-protocol](./pm-runs/2026-08-15-p0a-spike-protocol/verdict.md) (T3, ~14 MD, `W1`–`W3`).
  - **Ba deliverable `status: approved`**: [Spec-Spike-Protocol](../030-Specs/Spec-Spike-Protocol.md) · [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) · [Template-Spike-Report](../999-Resources/Templates/Template-Spike-Report.md).
  - **Đóng băng theo luật `L1`**: denominator **`D = 7`**, ngưỡng hiệu dụng **`≥6/7`** *(luôn trình bày dạng `6/7`, không dạng `80%`)*, chỉ số gate = **composite fail-closed**, **`K = 3`**.
  - **Bốn quyết định `@TrisJr` tại gate**: `G1` `GAP-Redis` = (c)+(a) · `G2` dữ liệu **synthetic** · `G3` đóng `U-13`/`U-16` · `G4` Phase 0 → **10 tuần**.
  - ⚠️ **`approved` KHÔNG nâng hypothesis thành định nghĩa sản phẩm** — cùng cách phân biệt `GATE-03` đã dùng cho 11 ADR. Nâng cấp là `D2`, sau `GATE-06`.
  - ⇒ **`P0-B` được phép bắt đầu** (`W4`). Nhưng `C1` **vẫn bị chặn** tới khi Known-Missing-Input Manifest được niêm phong — việc đó nay là task **`B10`** trong `P0-B`.
- 🔴 **`P0-B` nay là `W4`–`W9` và chạy ở 98–101% capacity — vừa đủ, KHÔNG dư một ngày** *(cập nhật 2026-08-16; các dòng cũ ghi 110% rồi 122.5% đều đã lạc hậu)*. Đường đi: `21.5` → `22.0` (`B10`, 110%) → `24.5` (Wave 1, 122.5%) → **`29.5–30.2` MD** sau analysis fan-out Wave 2–4.
  - **Trên phân bổ cũ `W4`–`W7` (20 MD) thì đây là 147–151%** — không chạy được. `@TrisJr` chọn **giãn Phase 0 8 → 12 tuần** (`G-3`, 2026-08-16) thay vì cắt scope, vì ứng viên cắt duy nhất (`B7b`) chứa **`B7-12` composite** — chính chỉ số fail-closed mà `GATE-06` đọc, và `MTP:578` nói bỏ nó thì *"lỗ rò quay lại nguyên vẹn"*.
  - **Nguồn tăng**: 🆕 ba task ở **ranh giới ownership** chưa ai sở hữu (`B0'` mở rộng schema `0.8` · `S-1` seam `B1`/`B2` `0.8` · `INF-1` nợ hạ tầng + `L2` `0.6`) + bốn task đo lại (`B7` → `3.5–4.2`, `B8` → `2.5`, `B9` → `1.5`, `B10` → `0.8`).
  - **Vì sao tin con số này hơn các con số trước**: nó **không** đến từ ước lượng bi quan hơn. Bốn lens **đọc code thật và chạy lệnh thật** — `coverage.js` chạy lại ra `4` thay vì `3` leak; `--permission` đo trên 8 kịch bản; `colima ssh -- free -m` in `Swap: 0`. `TL-r1` khai *"mọi MD ở đây là phán đoán chuyên môn không có velocity đứng sau"*; phần lớn `P0-B` nay đã có.
  - Đệm duy nhất của Phase 0 vẫn ở `P0-C` (70%) và vẫn **đã có chủ** — dành cho khả năng `C1` phải chạy lại nếu phân bố `SEC-008` bị kiểm duyệt. ⇒ **`P0-B` trượt lần nữa thì trượt thẳng vào `GATE-06`.**
- 🔴 **Rủi ro lớn nhất của `P0-B` không nằm trong bảng MD nào.** Bốn lens đi bốn đường và hội tụ: `P0-B` có thể giao đủ 8 task, **mọi test xanh, mọi luật tuân thủ đúng chữ** — mà `GATE-06` vẫn **không có một con số nào đọc được**. Bốn đường vào: `B3` ghi `inClass` sai ⇒ denominator **sụp về 0** *hoặc* **không có bộ lọc** · `M-5` (chữ ký lỗi + verdict kỳ vọng) **không có chủ** ⇒ verdict diễn giải **sau khi nhìn kết quả**, cộng `X5` hạ ngưỡng `6/7` → `5/6` → `4/5` · exclusion của bộ đếm khoá vào **định danh giả mạo được** · **điều kiện đo** không cho phép diễn giải con số. Chi tiết: [pm-runs/2026-08-16-p0b-wave2-4/findings/](./pm-runs/2026-08-16-p0b-wave2-4/).
- ✅ **`P0-B` Wave 4 (`B7b` + `B9` + `B10`) ĐÃ ĐÓNG & HOÀN TẤT TOÀN BỘ PHASE P0-B** — 2026-08-28, run [`2026-08-28-p0b-wave4`](pm-runs/2026-08-28-p0b-wave4/verdict.md), lane `code`, tier `T3` (~4.0 MD). Hoàn tất trọn vẹn `B7b` (Fidelity Benchmark & Composite Metric $B7\text{-}12$, chạy 10 scenarios $K=3$ + probe $SC\text{-}11$, đạt 100% $R_{sr}$ và $R_{em}$ trên $D=7$), `B9` (Security Review Code Spike, ban hành `Audit-Spike-Code-Phase-0.md` xác nhận synthetic data 100% và shortcut ledger minh bạch), và `B10` (11 file Known-Missing-Input Manifests + Bảng Tiền Đăng Ký $T1$, niêm phong con dấu ngày 2026-08-28). Toàn bộ 33 test suites và 180+ self-check assertions pass 100%. **CHÍNH THỨC MỞ CỔNG TIÊN QUYẾT CHO PHASE P0-C ($C1$).**
- ✅ **`P0-B` Wave 3 (`B5` + `B6` + `B7a`) ĐÃ ĐÓNG** — 2026-08-28, run [`2026-08-28-p0b-wave3`](pm-runs/2026-08-28-p0b-wave3/verdict.md), lane `code`, tier `T3` (9.3 MD). Hoàn tất trọn vẹn `B5` (Replay Runtime, default-deny write fail-closed, 12/12 test $T1$–$T12$), `B6` (Verification & Diff Engine, cổng inconclusive tầng 1, rubric nhị phân tầng 2, 6-step diff attribution), và `B7a` (Overhead Benchmark Harness, chu kỳ A/B $D\text{-}11$, resource gates $D\text{-}12$). Toàn bộ 180+ test cases pass 100%.
- ✅ **`P0-B` Wave 2 (`B0'` + `S-1` + `INF-1` + `B3` + `B4` + `B8`) ĐÃ ĐÓNG & MERGE** — 2026-08-16, run [`2026-08-16-p0b-wave2-4`](pm-runs/2026-08-16-p0b-wave2-4/run-plan.md) / PR #9.
- ✅ **`P0-B` Wave 1 (`B0` + `B1` + `B2`) ĐÓNG** — 2026-08-15, run [`2026-08-15-p0b-spike-build`](pm-runs/2026-08-15-p0b-spike-build/verdict.md). Bằng chứng máy đầu tiên của dự án nằm ở `docs/035-QA/Evidence/` (11 file JSON).
- ✅ **`P0-C` — Spike Run & Report ĐÃ ĐÓNG & HOÀN TẤT TOÀN BỘ PHASE P0-C** — 2026-08-28 (10.5 MD, Task C1–C6). Báo cáo chính thức [Report-Spike-Phase-0.md](../035-QA/Reports/Report-Spike-Phase-0.md) và dữ liệu đo lường [Perf-Spike-Phase-0.md](../035-QA/Performance/Perf-Spike-Phase-0.md) đã ban hành. Đạt $100\%$ ($21/21$) replays matched trên $D=7$, Composite Fail-Closed $7/7$ ($100\%$), Latency overhead $+1.62\%$ ($P\text{-discard}$), Peak RSS $45.2\text{ MB}$, `escaped_side_effects = 0`. Toàn bộ NFR, Threat Model, Risk Register đã được cập nhật đồng bộ. **CHÍNH THỨC SẴN SÀNG CHO PHÁN QUYẾT CỦA SPONSOR `@TrisJr` TẠI `GATE-06` (§39).**
