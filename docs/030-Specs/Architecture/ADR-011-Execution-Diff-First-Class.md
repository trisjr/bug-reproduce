---
id: ADR-011
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-011: Execution Diff as a First-Class Outcome

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.
>
> ⚠️ **Hai họ định danh khác nhau, đừng đọc lẫn.** Trong file này `D1`…`D6` là **Decision sub-ID nội bộ của chính ADR này** (`### D5 — Ràng buộc an toàn của diff mode`, v.v.) — chúng **không** liên quan gì tới `GATE-0N`, và cũng **không** phải quyết định `D1`/`D2` của run trước. `GATE-03` **không** đổi tên, không đổi số, không đổi nội dung mục nào trong `D1`…`D6`.
>
> Phạm vi: file này chỉ chạm **`GATE-03`**. `U-10` (*diff mode có gọi dependency local thật không — RQ.md tự nói ngược*) **VẪN `TBD`**: `Accepted` phê chuẩn hướng *"Execution Diff là outcome hạng nhất"*, nó **không** chọn phía nào giữa `F3` và `F4`, và do đó **không** đóng được rủi ro side-effect mà `D5` chỉ phát biểu ràng buộc chứ không thay thế. Nhãn chốt của `M1` ở §Open items thuộc run trước và **giữ nguyên nguyên trạng**.

## Context

§9 (*Execution Diff*) mở đầu bằng một thừa nhận: *"Reproduction will not always succeed. The local environment may behave differently from production."* Rồi nó từ chối một cách xử lý cụ thể:

> Instead of simply returning: `Could not reproduce.` — Repro should explain **where the execution diverged**. (§9)

và kết luận bằng một phát biểu về **giá trị sản phẩm**, không phải về giao diện:

> *"This is a key product capability. Repro can still provide value even when the bug cannot be reproduced. The product becomes: **'Show me what was different between production and my environment.'**"* (§9)

Ba văn bản khác nâng nó lên hàng đầu:

- **§17** vẽ `Execution Diff` là **một ô riêng** trong core product flow, đứng sau Local App, phân nhánh thành `Matched` → `Reproduced` và `Diverged` → `Explain`.
- **§18** liệt kê `execution diff` trong *Analysis* **cạnh** `execution verification` (hai mục tách rời), và cấp cho nó **một lệnh CLI riêng**: `repro diff 1842`, bên cạnh `repro replay` và `repro verify`.
- **§26** đưa `Execution diff` vào danh sách V0.1.
- **§33.3** đặt nó thành nguyên tắc sản phẩm: *"Explain failure — If replay fails, show how production and local executions differ."*
- **§38 Q3** hỏi *"Is Execution Diff valuable enough to be a core feature?"* — RQ.md đặt câu hỏi nhưng ba văn bản trên đã trả lời bằng hành động.

### Định dạng mà §9 quy định

Ví dụ của §9 không phải minh hoạ tuỳ ý — nó có cấu trúc ổn định và ADR này coi đó là hợp đồng trình bày:

```text
⚠️ Execution diverged

1. Database query

   Production → coupon = null
   Local      → coupon = { discount: 10 }

2. Tax API

   Production → tax = 0
   Local      → tax = 12.43

3. Feature flag

   Production → new_checkout = true
   Local      → new_checkout = false
```

Ba đặc điểm: **divergence được đánh số**; **nhóm theo loại input** (`Database query`, `Tax API`, `Feature flag` — đúng ba nhóm mà §18 capture); mỗi mục là một **cặp Production/Local**.

### Vì sao giữ tách khỏi ADR-006

[ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md) trả lời *"execution này có tương đương không?"* — một phán quyết nhị phân trên một lần replay. Có ý kiến đề xuất gộp diff vào đó như phần trình bày kết quả. ADR này **không gộp**, với hai lý do:

1. **Diff là một execution mode khác, không phải một cách render.** §18 cấp cho nó lệnh CLI riêng; §17 cấp cho nó ô riêng trong flow. Một mode có thể phải chạy khác đi để **thu được** dữ liệu local đem ra so sánh.
2. **`U-10` là bằng chứng.** §9 hiển thị `Local → tax = 12.43` — một **giá trị thật của môi trường local**. Giá trị đó không thể có nếu API local không bị gọi. Nhưng §11/§12 nói replay layer trả recorded result nên API local lẽ ra **không** được gọi. Nếu diff mode thật sự chạy dependency thật thì nó có **mô hình thực thi khác hẳn** verification — và gộp hai thứ vào một ADR sẽ chôn mất mâu thuẫn này. Chi tiết ở §Open items.

## Decision

### D1 — Execution Diff là kết quả hạng nhất của một reproduction thất bại

Khi replay không tái hiện được, kết quả **được coi là hoàn tất và có giá trị**, không phải một lỗi. Repro trả về một Execution Diff mô tả execution đã phân kỳ ở đâu. `Could not reproduce.` **không** phải một output hợp lệ của V0.1 (§9).

Diff **không** là cách trình bày của verification. Nó là một **outcome độc lập**, có lệnh riêng `repro diff` (§18) và vị trí riêng trong flow (§17).

### D2 — Cấu trúc của một Execution Diff

Theo §9:

1. **Danh sách divergence được đánh số**, thứ tự ổn định và tái lập được.
2. **Nhóm theo loại input**, phủ đúng các nhóm §18 capture: database query result, external HTTP response, feature flag state, HTTP request, clock. Mismatch phiên bản (code/runtime/dependency/schema) là một nhóm riêng — §18 gọi là `code/version mismatch detection` và §15 quy định thông điệp `⚠️ Code mismatch`.
3. **Mỗi divergence là một cặp `Production` / `Local`** với giá trị hai bên.

### D3 — Mỗi divergence phải mang một NGUYÊN NHÂN quy được

Đây là phần ADR này **thêm vào**: §9 chỉ trình bày *cái gì khác nhau*, không trình bày *vì sao*. Không có phần này, Execution Diff sẽ đổ lỗi cho code của developer trong những trường hợp mà nguyên nhân là chính Repro. Ít nhất các nguyên nhân sau phải phân biệt được:

| Nguyên nhân | Ý nghĩa | Nguồn |
|---|---|---|
| `code` | Code local khác code production | §15, §20.8 |
| `incomplete-capture` | Capsule thiếu input này — có thể do buffer chạm trần hoặc capture bị cắt | **E9**; [ADR-008](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md) |
| `redaction` | Giá trị bị thay đổi bởi chính redaction gate của Repro | §16; xác nhận chéo giữa lens kiến trúc (`U-15`) và lens `security-auditor` |
| `version-drift` | Lệch Git commit / runtime / dependency / schema | §15, §20.8, §20.9 |
| `out-of-scope-determinism` | Phân kỳ do nguồn phi tất định nằm ngoài phạm vi | [ADR-010](./ADR-010-Bounded-Determinism-Scope.md) |

Căn cứ nguyên tắc: §33.5 *"Determinism over magic — The system should explain exactly what was captured and replayed."* Một diff không quy được nguyên nhân là vi phạm nguyên tắc đó. Đặc biệt với `redaction`: nếu không tách ra, Repro sẽ báo divergence **do chính nó gây ra** — và cách redaction thất bại trong thực tế không phải bị bypass kỹ thuật, mà là **bị người dùng tự tắt đi** khi họ mất niềm tin vào kết quả.

### D4 — Thiếu input lúc replay ⇒ divergence, không phải crash

Theo **E9**: khi capsule không có input mà code local yêu cầu, Repro báo **divergence + incomplete capture** (nguyên nhân `incomplete-capture` ở D3), **không** crash, và **KHÔNG** fallback gọi hệ thống thật. Điều cuối cùng là ràng buộc an toàn, không phải lựa chọn tiện dụng: fallback sẽ gọi hệ thống thật bằng dữ liệu production, phá vỡ [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md).

### D5 — Ràng buộc an toàn của diff mode (phụ thuộc `U-10`)

`U-10` **chưa được giải**. Nhưng ràng buộc sau đúng trong **mọi** cách giải:

> **Nếu diff mode thực thi dependency local thật, thì default-deny write của [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md) PHẢI áp dụng đầy đủ ở mode này.** Không có ngoại lệ.

Không có ràng buộc này, diff mode là một **lỗ hổng side-effect**: một mode chạy dependency thật với dữ liệu production nhưng không nằm dưới cơ chế an toàn mà §13 và §20.4 dựng lên cho replay. §20.4 liệt kê hậu quả — `payments`, `emails`, `webhooks`, `database writes`, `events` — và không nơi nào trong §13/§20.4 giới hạn phạm vi bảo vệ chỉ cho lệnh `replay`.

### D6 — Ngôn ngữ kết quả

Theo §20.16, diff **không** được phát biểu quá điều nó chứng minh được. `Matched` (§17) nghĩa là execution đã capture khớp — **không** phải là bug production đã hết. Ngôn ngữ chuẩn: `✓ Captured execution no longer reproduces`, **không** phải `✓ Production bug is definitely fixed` (§20.16 nguyên văn cả hai).

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ |
|---|---|---|---|
| F1 | **Chỉ trả `Could not reproduce.`** khi replay không khớp | **[stated]** — **§9** loại nguyên văn: *"Instead of simply returning: `Could not reproduce.`"* | Ưu: rẻ nhất, không cần định nghĩa equivalence. Nhược: bỏ phí toàn bộ giá trị mà §9 gọi là *"a key product capability"*; và bỏ phí đúng những lần chạy mà developer cần thông tin nhất. |
| F2 | **Gộp diff vào verification** — coi diff là phần trình bày của kết quả [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md) | **[inferred]** — RQ.md không cân phương án này. Bằng chứng phản bác nằm trong chính RQ.md: **§18** cấp `repro diff` là lệnh CLI **riêng** cạnh `repro verify`; **§17** vẽ `Execution Diff` là ô **riêng** | Bị loại vì `U-10`: diff có thể phải **chạy dependency thật** để có giá trị `Local`, còn verification thì không. Hai mô hình thực thi khác nhau không nên nằm chung một quyết định. |
| F3 | **Diff chạy hoàn toàn trên recorded values**, không gọi dependency local nào | **[stated]** — **§11** và **§12** phát biểu rằng replay layer trả recorded result, nên dependency local **không** được gọi | Đây là **một trong hai vế của `U-10`**. Ưu: an toàn tuyệt đối về side effect, D5 trở nên không cần thiết. Nhược: **không giải thích được** `Local → tax = 12.43` ở §9 — giá trị đó phải đến từ đâu đó. |
| F4 | **Diff chạy dependency local thật** để lấy giá trị `Local` rồi so với giá trị đã ghi | **[stated]** — **§9** hiển thị `Local → tax = 12.43` và `Local → coupon = { discount: 10 }`, là giá trị thật của môi trường local | Vế còn lại của `U-10`. Ưu: đúng với ví dụ của §9 và đúng với câu định vị *"Show me what was different between production and my environment"* — chữ *my environment* hàm ý môi trường thật. Nhược: **mở ra rủi ro side effect** ⇒ bắt buộc phải có D5. |
| F5 | **So sánh output/response cuối cùng** thay vì so sánh input và đường đi | **[inferred]** — RQ.md không nêu; bị bác bởi **§10**, vốn đòi so cả `execution path: A → B → C`, và bởi **§9**, vốn nhóm theo **loại input** | Nhược: không phát hiện được trường hợp §20.3 cảnh báo — replay hoàn tất mà đi đường khác, tạo *false confidence*. |
| F6 | **Diff văn bản của log** giữa hai lần chạy | **[inferred]** — RQ.md không nêu | Nhược: log không phải input; §9 nhóm theo loại input, không theo dòng log. |
| F7 | **Để AI giải thích divergence** thay vì diff có cấu trúc | **[stated]** — **§27** liệt kê `execution diff explanation` là một khả năng AI **tiềm năng** nhưng chốt: *"these features should come **after** the replay engine is proven reliable"*; **§19** loại `AI root-cause analysis` khỏi V0.1; **§27** mở đầu bằng *"AI should be treated as a layer on top of Repro, not the core product"* | Bị hoãn tường minh. Diff có cấu trúc của D2 chính là **đầu vào** mà lớp AI về sau sẽ cần — nên D2 không mâu thuẫn với §27, nó là điều kiện cần. |

## Consequences

### Positive

- **Repro có giá trị cả khi thất bại.** §9 nói thẳng: *"Repro can still provide value even when the bug cannot be reproduced."* Đây là điểm khác biệt lớn nhất so với một công cụ replay đơn thuần — nhánh thất bại của §17 vẫn dẫn tới `Explain` chứ không dẫn tới ngõ cụt.
- **Bọc lót cho các giới hạn đã biết.** Phạm vi determinism có giới hạn ([ADR-010](./ADR-010-Bounded-Determinism-Scope.md)), capture bị chặn biên ([ADR-008](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md)), redaction làm sai lệch giá trị (§16) — cả ba đều làm tăng tỉ lệ divergence. Diff biến những thất bại đó từ *"công cụ hỏng"* thành *"thông tin chẩn đoán"*.
- **D3 chặn được kiểu mất niềm tin nguy hiểm nhất.** Nếu Repro báo divergence do redaction mà không nói ra, developer sẽ kết luận công cụ không đáng tin — hoặc tệ hơn, tự tắt redaction. Quy trách nhiệm đúng là điều kiện sống còn của redaction gate, chứ không phải tính năng làm đẹp.
- **Tách khỏi verification giữ cho ranh giới an toàn nhìn thấy được.** Nếu gộp, D5 sẽ ẩn trong một ADR nói về equivalence và rất dễ bị bỏ sót lúc hiện thực.
- **Phù hợp §33.3 và §33.5**, và tạo sẵn đầu vào có cấu trúc cho lớp AI ở §27 mà không kéo AI vào V0.1.

### Negative

- **`U-10` chưa giải ⇒ tồn tại một rủi ro side-effect chưa đóng.** Chừng nào chưa chốt diff mode có gọi dependency thật hay không, **không thể khẳng định V0.1 an toàn về side effect**. §20.4 là risk **Critical** và [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md) là mitigation của nó — nhưng phạm vi áp dụng của mitigation đó đang phụ thuộc vào một câu hỏi chưa có câu trả lời. D5 phát biểu ràng buộc nhưng **không thay thế được** việc chốt `U-10`.
- **RQ.md tự mâu thuẫn ở đúng chỗ này** (§9 vs §11/§12). Mọi tài liệu phái sinh đều thừa hưởng mâu thuẫn; không được che bằng cách diễn đạt mềm đi.
- **Phần "execution path" của diff CHƯA đặc tả được.** §10 dùng ký hiệu `A → B → C` nhưng **RQ.md không định nghĩa A, B, C là gì**, cũng không định nghĩa *"sufficiently equivalent"*. Đây là `U-04` của lens kiến trúc, xác nhận chéo độc lập bởi `ACG-01` của lens BA. Hệ quả: D2 chỉ hiện thực được **phần diff theo giá trị input**; phần diff theo đường đi thực thi bị chặn. Vì §20.3 là risk Critical và verification là mitigation của nó, khoảng trống này lan sang cả [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md). **Và sau `M1` (✅ ĐÃ CHỐT 2026-08-14, xem §Open items), nó lan thêm một bậc**: metric thành công của V0.1 nay là *số bug đạt trạng thái `Execution matched`* (§10) — một phán quyết tương đương — nên `U-04` chặn **chính phép đếm định nghĩa thành công của V0.1**, không chỉ chặn một phần của diff. `U-04` vẫn `TBD`; quyết định M1 **không** giải nó.
- **Mode thứ hai ⇒ hai bộ ngữ nghĩa phải giữ đồng bộ.** `replay`, `diff`, `verify` (§18) có thể phân kỳ về cách so sánh, cách xử lý input thiếu và mã thoát. Đây là áp lực đúng loại mà §20.15 cảnh báo, và là cái giá của việc không gộp F2.
- **`Matched` không chứng minh bug đã hết.** §20.16 (*False Confidence About Fixes — Critical*) tự thừa nhận: *"A successful replay only proves that: **This captured execution no longer fails.**"* — *"For example, a race condition may still exist."* D6 chỉ ràng buộc **ngôn ngữ**; nó không loại bỏ được rủi ro nhận thức.
- **Redaction làm replay không bit-perfect ⇒ có một sàn divergence không xoá được.** Bảo vệ dữ liệu và tính đúng của replay kéo ngược chiều nhau; D3 làm cho sự đánh đổi đó **nhìn thấy được**, không làm nó biến mất.
- **Diff có thể rò rỉ chính thứ redaction định che.** Diff đặt giá trị production cạnh giá trị local trong output CLI, và output đó thường bị dán vào ticket hoặc chat. Đây là một bề mặt lộ dữ liệu **RQ.md hoàn toàn không nêu** — §16 chỉ nói về capsule, không nói về output của công cụ.

## Open items (TBD)

| ID | Unknown | RQ.md nói gì | Nó chặn cái gì |
|---|---|---|---|
| `U-10` | **Diff mode có gọi dependency local thật không? RQ.md TỰ NÓI NGƯỢC.** *Phía có*: **§9** hiển thị `Local → tax = 12.43` và `Local → coupon = { discount: 10 }` — giá trị **thật** của môi trường local, nghĩa là API/DB local **đã bị gọi**. *Phía không*: **§11** và **§12** nói replay layer trả recorded result, nên dependency local lẽ ra **không** được gọi. | Hai phía đều là văn bản của RQ.md, không phía nào phủ định phía kia. **Không được tự quyết trong lane tài liệu.** | Chặn: mô hình thực thi của `repro diff`; chặn **phạm vi áp dụng của [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md)** (D5 — nếu chạy thật thì default-deny write **phải** phủ mode này, không thì đây là lỗ hổng side-effect với dữ liệu production); chặn yêu cầu môi trường local của `repro diff` (có cần DB local chạy được không); chặn cả `< 30 seconds` replay time ở §24 (gọi thật thì thời gian là thời gian mạng thật). |
| `U-16` | **Phân tầng cảnh báo của drift detector.** Mismatch nào là *fatal* (dừng), *warning* (chạy tiếp, ghi nhận), hay *info*? Version drift có được tính là một divergence trong danh sách đánh số của §9 không, hay là một mục cảnh báo riêng? | §15 chỉ đưa ra **một** hình thái thông điệp: `⚠️ Code mismatch … Replay may not be deterministic.` §20.8 nói `warn about mismatches`; §20.9 nói `expose mismatch during replay`. **Không có phân tầng nào.** | Chặn: hợp đồng mã thoát của `repro replay`/`repro diff`/`repro verify` — thứ mà CI cần để quyết định pass/fail; chặn cấu trúc output của D2; chặn `code/version mismatch detection` ở §18 (biết là khác nhưng chưa biết phải làm gì với thông tin đó). |
| `U-17` | **Nguồn của schema version.** Lấy từ bảng lịch sử migration của công cụ migration? Từ introspection lược đồ database? Do ứng dụng tự khai? | §15 liệt kê `Schema version` trong danh sách metadata phải ghi; §20.9 nói `Capture schema/migration version`. **Không nói lấy từ đâu.** | Chặn: hiện thực capture ([ADR-007](./ADR-007-In-Process-SDK-Interception.md)); chặn phép so sánh drift (không có nguồn chuẩn thì "khác nhau" không có nghĩa); chặn mitigation của risk §20.9 — vốn được §21 đánh `High / MVP? Yes`. |
| `U-18` | **Ngưỡng của diff.** Divergence nào cũng làm execution "diverged", hay có phân loại nặng/nhẹ? Ví dụ chênh lệch timestamp vài mili giây có phải divergence không? | §10 dùng cụm *"sufficiently equivalent"* nhưng **không định nghĩa "sufficiently"**. §9 không phân loại mức độ. | Chặn: cả D2 lẫn [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md); là mặt kia của `U-04`. |
| `M1` | **Regression test generation — V0.1 hay V0.2? Mâu thuẫn nội tại của RQ.md.** *Phía V0.2*: **§26** đặt `Regression test generation` trong V0.2. *Phía V0.1*: **§25** *Killer Demo* in `✓ Regression case generated` như output của `repro verify`; **§30** *Developer Journey* kết thúc bằng `Regression test`; **§31** North Star Metric đếm *"converted into regression tests"*. **Hệ quả đã phát hiện: North Star Metric §31 không đo được bằng chính V0.1.** *(Hai phía giữ nguyên — RQ.md vẫn tự nói ngược ở chính các section này.)* | Ghi nhận thêm: ba con số ở §31 (`2,431` / `1,827` / `1,203`) được RQ.md gắn nhãn **"Example"** — đó là minh hoạ *cách đọc* metric, **không phải target**; và `60–90 second` (§25) là ràng buộc UX cho demo. Không con số nào trong nhóm này được dùng làm KPI. Điều này **không đổi** sau khi M1 được chốt. | ✅ **ĐÃ CHỐT 2026-08-14** — chọn phía **§26**: `Regression test generation` **giữ ở V0.2**, không kéo về V0.1 (§26 là phát biểu phạm vi tường minh; §25/§30/§31 là văn bản minh hoạ và metric). **Metric thành công của V0.1** đổi sang **số bug đạt trạng thái `Execution matched`** (§10 — chính là dòng `✓ Execution matched` mà §10 in ra). **North Star §31 giữ nguyên** làm metric **dài hạn, kích hoạt từ V0.2**. **Đã mở khoá**: nội dung Killer Demo và output của `repro verify` ở V0.1 — không có dòng `✓ Regression case generated`. **Hệ quả còn mở, phải đọc kèm**: chuỗi *outcome* mà ADR này định nghĩa nay kết thúc ở một phán quyết tương đương, nên **`U-18` và `U-04` chặn chính chỉ số thành công của V0.1** — §10 dùng `A → B → C` và cụm *"sufficiently equivalent"* mà **không định nghĩa** cái nào; không định nghĩa được equivalence thì **không đếm được** "Execution matched". Thêm nữa, **§24 không đặt ngưỡng** cho Execution Match Rate dù §23 yêu cầu đo. Cùng chạm [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md); xem [SDD-Repro](./SDD-Repro.md) §6.5 và §8.3. |
| `U-11` | **Code local phát ra query/HTTP call KHÔNG có trong capsule thì làm gì?** | RQ.md **hoàn toàn không nêu**. Và đây **không phải trường hợp biên** mà là trường hợp **thường gặp nhất**, vì use case chính là developer sửa code rồi replay lại (§8 bước 4–5). | Hành vi đã được **E9** định hướng (divergence + incomplete capture, không crash, không gọi hệ thống thật), nhưng vẫn chặn: thông điệp cụ thể của D3; và chặn việc phân biệt *"thiếu vì capsule bị cắt"* với *"thiếu vì code đã đổi"* — hai nguyên nhân khác nhau cần hai thông điệp khác nhau, xem `U-09d` ở [ADR-008](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md). |

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-008: Async, Bounded, Failure-Triggered Capture](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md)
- [ADR-010: Bounded Determinism Scope](./ADR-010-Bounded-Determinism-Scope.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
