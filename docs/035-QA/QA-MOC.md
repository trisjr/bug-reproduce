---
id: MOC-QA
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-15
---

# 📂 035-QA Map of Content (MOC)

Đảm bảo chất lượng: test plan, test case, báo cáo lỗi và kiểm thử hiệu năng. Xem thêm [Documentation Master Index](../000-Index.md).

## Tài liệu

- [Test-Plans/MTP-Spike-Phase-0](./Test-Plans/MTP-Spike-Phase-0.md) — **Measurement plan cho technical spike Phase 0** *(2026-08-15)*. **Tài liệu QA đầu tiên của dự án.** Định nghĩa **cách đo**, cố ý **không** định nghĩa ngưỡng đạt.
  - **6 metric × 4 thuộc tính** — 5 metric của `RQ.md §23` cộng **`escaped_side_effects`** (metric thứ sáu, target `0`). Metric thứ sáu tồn tại vì [`ADR-005`](../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) ghi risk 🔴 Critical §20.4 hiện **không có bằng chứng chấp nhận nào được định nghĩa** — không có nó, `GATE-06` trả lời câu §39 mà không nói được gì về rủi ro đó.
  - **Bịt `ACG-04` / `ACG-05` / `ACG-11`** bằng **điều kiện đo**, không bằng ngưỡng.
  - **Chốt `K = 3`** cho `U-25` (mỗi capsule replay 3 lần) và **5 mức cắt/trục + control** cho thí nghiệm `SEC-008`.
  - **Ma trận 12 test `THREAT-018`** + **canary sink**. Hai ô **"khoảng hở đã đo được"** (`T8` `child_process`, `T12` loopback) — **cấm làm nhẹ test để cho pass**.
  - **Thủ tục quy trách nhiệm divergence 5 bước có thứ tự** — nó là thứ ngăn `C3` quy mọi scenario fail về *"non-determinism"* trong khi nguyên nhân thật là **thiếu capture đã biết trước**.

> [!IMPORTANT]
> **Bẫy phương pháp mà tài liệu này tồn tại để chặn** — đáng đọc kể cả khi anh không làm QA:
>
> Sau bước *Destroy original environment* của `RQ.md §22`, một WRITE **bị rò rỉ** sẽ nhận `ECONNREFUSED` và **trông giống hệt** một WRITE **bị chặn**. ⇒ Toàn bộ bằng chứng an toàn của `C1` là **con số không**, mà không ai biết — trừ khi có **canary sink** quan sát độc lập. Đây là lỗ hổng **phương pháp**, không phải lỗ hổng code, và không test nào tự bắt được nó.

## Trạng thái hiện tại

**Test plan cho V0.1 vẫn chưa có** — và đó vẫn là trạng thái đúng:

- `src/` và `test/` của repo còn **rỗng** — chưa có gì để kiểm thử. Toàn bộ bộ tài liệu hiện có là thiết kế **trước khi** hiện thực, xem [Specs-MOC](../030-Specs/Specs-MOC.md).
- **Technical spike đã được bật** — `✅ CHỐT GATE-01 — 2026-08-14`: `Go`, owner `@TrisJr` (xem [Roadmap](../010-Planning/Roadmap.md)). Nhưng `RQ.md §39` vẫn đặt spike **trước** MVP, và `✅ CHỐT GATE-02` hoãn phân rã Epic/Story tới sau gate Phase 0 ⇒ **test plan cho V0.1 vẫn phải chờ**. Viết bây giờ sẽ phải làm lại.
- **Chưa có tiêu chí pass/fail cho chỉ số thành công của V0.1 — `GATE-01` KHÔNG đóng khoảng hở này.** `N-05` (Execution Match Rate) là thước đo chính của V0.1 sau quyết định `D1`, nhưng `RQ.md §24` **không đặt ngưỡng** cho nó, và [NFR §3.1](../020-Requirements/NFR-Repro.md) ghi rõ ngưỡng *"cần anh chốt **sau** spike §22"* — xem thêm [ADR-006](../030-Specs/Architecture/ADR-006-Execution-Verification-By-Equivalence.md). Đây là rào chắn thật: **không có ngưỡng thì không viết được cổng đạt/không-đạt**.

> [!WARNING]
> **Bản thân technical spike cũng chưa có cổng đạt/không-đạt** — rủi ro `GATE-01-r` tại [Risk-Register §4.2](../010-Planning/Risk-Register.md).
>
> Đây là điều QA cần biết trước nhất: `GATE-01 = Go` cho phép **chạy** spike, nhưng bốn khoảng hở ở [NFR §7](../020-Requirements/NFR-Repro.md) làm spike **không kết luận được**: `ACG-03` (ngưỡng `≥80%` không có denominator, không có định nghĩa *"reproduced"*) · `ACG-02` (**không có tiêu chí chọn test case** — mà chính `ACG-02` đòi chốt *trước khi* chạy) · `ACG-01` (*"sufficiently equivalent"*) · `ACG-07` (*"Supported Execution Class"*).
>
> ⇒ **Việc QA nên làm sớm nhất không phải test plan cho V0.1, mà là góp phần chốt bốn mục trên trong một spike protocol.**
>
> ✅ **Đã làm, 2026-08-15** — [Spec-Spike-Protocol](../030-Specs/Spec-Spike-Protocol.md) đóng cả bốn `ACG` ở dạng **hypothesis có nhãn**, và [MTP-Spike-Phase-0](./Test-Plans/MTP-Spike-Phase-0.md) cấp phần đo. Hai con số QA cần nhớ: **denominator = 7**, ngưỡng hiệu dụng **`≥ 6/7`** *(trình bày dạng `6/7`, **không** dạng `80%` — ở cỡ mẫu 7 thì một scenario = 14.3 điểm phần trăm, dùng `%` tạo cảm giác chính xác giả)*.
>
> **`U-25` đã được nâng từ *"kiểm tra đáng đưa vào"* thành *điều kiện tiên quyết*** — ba lens độc lập cùng chỉ ra nó là **công cụ duy nhất** tách được *non-determinism* (biểu hiện: không lặp lại được chính nó) khỏi *thiếu capture* (biểu hiện: diverged **ổn định** tại cùng một điểm) **bằng dữ liệu** thay vì bằng ý kiến. `K = 3` chốt ở [MTP §2.3](./Test-Plans/MTP-Spike-Phase-0.md). Lý do gốc vẫn nguyên: [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) — *"nếu bản thân replay không tất định thì mọi kết luận equivalence đều rỗng"*.

> [!WARNING]
> Khi bắt đầu viết test plan, **đọc `U-04` ở [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) trước.** Chừng nào *"sufficiently equivalent"* chưa được định nghĩa, khái niệm *"execution replay đúng"* chưa kiểm thử được một cách khách quan — mọi assertion về equivalence sẽ dựa trên một định nghĩa chưa tồn tại.

## Thư mục con theo RULE-001

- [Test-Plans/](./Test-Plans/) — Master Test Plan (`MTP-{Name}.md`). **Đã có [MTP-Spike-Phase-0](./Test-Plans/MTP-Spike-Phase-0.md)** *(2026-08-15)*. MTP cho V0.1 thuộc `D8`, sau `GATE-06`.
- [Reports/](./Reports/) — Bug Report và Test Execution Report. *(chưa có nội dung)*
- `Test-Cases/` — **chưa tạo**. Chưa có feature nào được hiện thực để viết test case.
- `Automation/` — **chưa tạo**. Chưa có test suite nào để tự động hoá.
- `Performance/` — **chưa tạo**. Ngưỡng hiệu năng của V0.1 (`N-02` latency overhead `< 5%`, `N-03` capsule size average `< 10 MB`, `N-04` replay time `< 30s`, `N-09` P95 `TBD`) nằm ở [NFR-Repro §2–§3](../020-Requirements/NFR-Repro.md); chưa có phép đo thật nào. Cả `N-01`…`N-04` đều là **hypothesis của spike**, `NFR §1` cấm dùng làm acceptance criteria.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Test-Cases/` và `./Automation/` — **hai thư mục chưa bao giờ tồn tại trong repo**. Hai link chết đó đã được gỡ ngày 2026-08-14 và thay bằng tên thư mục dạng plain text kèm lý do. Không có file hay thư mục nào bị xoá.
