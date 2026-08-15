# Brief: 2026-08-15-p0a-spike-protocol

> **Run này là container thực thi của `P0-A` — Spike Protocol** (`W1–W2`), phase đầu tiên và **duy nhất đã được cấp vốn** của [Timeline-Repro](../../Estimates/Timeline-Repro.md).
>
> `A7` giao finding vào `findings/`, `GA` giao quyết định vào `verdict.md`. Vì vậy run này **không phải sổ tay phụ** — nó là nơi hai deliverable của phase đáp xuống.

## Yêu cầu gốc

> Dựa trên `docs/010-Planning/Estimates/Timeline-Repro.md` thì cần làm gì tiếp theo
>
> — và sau khi rà soát, `@TrisJr` quyết định ngày 2026-08-15:
> 1. Duyệt Timeline `draft → approved`
> 2. Chọn phương án capacity: **giãn Phase 0 thêm 1 tuần đệm**
> 3. Bắt đầu `P0-A`

## Bối cảnh — vì sao `P0-A` tồn tại

`GATE-01 = Go` (2026-08-14) đã **bật** technical spike, nhưng **không** làm cho spike đo được. Bốn khoảng hở vẫn nguyên vẹn — `ACG-01`, `ACG-02`, `ACG-03`, `ACG-07` — nên **chạy spike ngay lúc này vẫn không cho ra pass/fail** (`GATE-01-r`, [Risk-Register §4.2](../../Risk-Register.md)).

`P0-A` đóng đúng rủi ro đó. **9.5 MD này mua lấy khả năng kết luận của ~32 MD phía sau** (`P0-B` + `P0-C`).

**Ràng buộc bất khả nhượng**: mọi định nghĩa sinh ra ở đây là **hypothesis có nhãn**, **KHÔNG** phải định nghĩa sản phẩm. Việc nâng chúng thành định nghĩa là `D2`, thuộc `P1`, **sau** `GATE-06`.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| Q1 | Chạm > 1 domain? | **Có** | Requirements (`ACG-*`) · Architecture (`ACG-01`, `ACG-07`) · QA (measurement plan, rubric) · Security (`A7` soát rủi ro capture dữ liệu thật) |
| Q2 | Đổi kiến trúc / contract? | **Có** | `A3` định nghĩa **vận hành** của *execution path* — nó ràng buộc `ADR-006`, `ADR-011`, và cách `B6` được hiện thực |
| Q3 | Mơ hồ, thiếu AC? | **Có** | Đây chính là **lý do phase tồn tại**: bốn `ACG` chưa có tiêu chí nào |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 9.5 MD, 4 deliverable file mới + 3 MOC/index |

**Điểm**: 4/4 → **Tier**: **T3**

**Lane**: `doc` — run này sinh ra **tài liệu**, không sinh source code. Code của Phase 0 bắt đầu ở `P0-B`, sau `Gate A`.

**Shape**: **A — Authoring**. Tạo mới 3 tài liệu, không phải sweep chuẩn hoá kho docs. *(Có một hạng mục sửa file đã tồn tại — `A8` cập nhật MOC/Index — nhưng đó là close-step bắt buộc của mọi run, không làm đổi shape.)*

**Chọn tier thấp do phân vân**: Không. 4/4 là tuyệt đối, không có vùng xám.

**Đích tài liệu — tra từ Document Type Mapping của RULE-001** (không tự chế đường dẫn):

| Tài liệu | Loại (RULE-001) | Thư mục đích | Naming convention | Khớp? |
|---|---|---|---|---|
| `Spec-Spike-Protocol.md` | Technical Spec | `docs/030-Specs/` | `Spec-{Feature}.md` | ✅ |
| `MTP-Spike-Phase-0.md` | Test Plan | `docs/035-QA/Test-Plans/` | `MTP-{Name}.md` | ✅ |
| `Template-Spike-Report.md` | Template | `docs/999-Resources/Templates/` | `Template-{Type}.md` | ✅ |

Cả ba đường dẫn Timeline đã ghi **đều khớp** RULE-001 — không phải sửa đích.

> [!NOTE]
> **Độ lệch contract đã phát hiện, xử theo RULE-001.** Lệnh `/pm-doc` yêu cầu wiki-link `[[Document-Name]]`; [RULE-001](../../../../knowledge-base/99-Templates/Documents-Template.md) mục *Các quy tắc nghiêm ngặt* #5 **cấm tường minh** wiki-link và bắt dùng standard markdown link với relative path. RULE-001 đang `status: approved` và là contract của lane ⇒ **mọi link trong run này dùng `[text](./path.md)`**. Ghi lại để `context-auditor` không báo là vi phạm lệnh.

## Assumptions

- **`TL-A1` — `T0` = tuần chứa 2026-08-17.** `W1` = 2026-08-17 → 2026-08-21; `W2` = 2026-08-24 → 2026-08-28. `Gate A` trình cuối `W2`.
  → **sai thì hỏng ở đâu**: mọi mốc `W` dịch theo, gồm cả ngày `GATE-06` = 2026-10-16 đã ghi vào Timeline §2.1. Sửa một chỗ (`TL-A1`) là đủ, không phải sửa từng bảng.
- **`TL-A2` — capacity solo 5 MD/tuần.** `P0-A` = 9.5 MD trên 2 tuần = **95%**.
  → **sai thì hỏng ở đâu**: `P0-A` không có đệm riêng. Đệm duy nhất của Phase 0 là `W7`, và nó thuộc `P0-B`/`P0-C` — **không** kéo ngược về được cho `P0-A`. `P0-A` trượt ⇒ trượt thẳng, không có gì hấp thụ.
- **Mọi vai (`BA`, `Architect`, `QA`, `Security`, `PM`) do agent role đảm nhiệm, một người điều phối.**
  → **sai thì hỏng ở đâu**: đúng nội dung `TL-r2` (🔴 Critical) — tại `Gate A`, người trình bày bằng chứng và người phán quyết là **một người**. Giảm nhẹ: bắt buộc ghi **phản biện** vào `escalations.md` **trước** khi `@TrisJr` quyết.

## Open questions

| # | Câu hỏi | Ai trả lời | Chặn phase nào |
|---|---|---|---|
| **OQ-1** | **`GAP-Redis`** — §22 bắt test app chạm Redis, §18/`C-03` không capture Redis, §22 lại bắt destroy environment ⇒ cả 10 scenario replay với input không được ghi. Chọn (a) loại trừ khỏi Supported Execution Class · (b) capture Redis như throwaway · (c) thiết kế test app để Redis không ảnh hưởng kết quả | 🏗️ Architect tại **`A2`**, `@TrisJr` duyệt tại `GA` | Chặn `A4` (denominator) và **làm sai lệch `GATE-06`** nếu để mặc. Chi tiết: [Timeline §3](../../Estimates/Timeline-Repro.md), [Risk-Register `C-03`](../../Risk-Register.md) |
| **OQ-2** | Spike dùng **dữ liệu giả lập hay dữ liệu thật**? Nếu thật thì control nào bắt buộc | 🛡️ Security tại **`A7`** (và `B9` ở `P0-B`) | Chặn `B1`/`B2`. Neo: §20.5, `THREAT-005` |
| **OQ-3** | Rubric `A3` có bắt được rẽ nhánh **thuần logic** (không chạm dependency nào) không? Nếu không thì điểm yếu này phải được ghi vào Spike Report | 🏗️ Architect tại **`A3`**, 🧪 QA soát | Không chặn, nhưng **`A3` exit criteria bắt buộc nêu điểm yếu đã biết** |
| **OQ-4** | `Template-Spec.md` hiện là stub *"Content to be added"* — dùng cấu trúc §2/§3/§4 mà Timeline quy định, hay bổ sung template trước? | 🎩 PM | Không chặn — Timeline đã quy định cấu trúc đủ chi tiết cho `A1` |

## Deliverable của run

| Task | File | Vai |
|---|---|---|
| `A1`–`A4` | `docs/030-Specs/Spec-Spike-Protocol.md` | 🕵️ BA + 🏗️ Architect |
| `A5` | `docs/035-QA/Test-Plans/MTP-Spike-Phase-0.md` | 🧪 QA |
| `A6` | `docs/999-Resources/Templates/Template-Spike-Report.md` | 🧪 QA |
| `A7` | `findings/architect.md` · `findings/quality-assurance.md` · `findings/security-auditor.md` | 🎩 PM tổng hợp |
| `A8` | `Specs-MOC.md` · `QA-MOC.md` · `000-Index.md` | 🔍 Context Auditor |
| `GA` | `verdict.md` | 👤 `@TrisJr` |

## Điều kiện đóng run

`Gate A` trả lời được đúng một câu:

> *"Chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"*

Không trả lời được ⇒ **không đóng run**, và `P0-B` **không được bắt đầu**.
