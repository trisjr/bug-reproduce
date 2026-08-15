# Verdict: 2026-08-15-p0a-spike-protocol

> **Lane** `doc` · **Shape** A (Authoring) · **Tier** T3 (4/4)
> **Verifier**: `context-auditor` — agent **khác** cả ba writer (`business-analyst`, `architect`, `quality-assurance`), theo đúng guardrail *"verify bởi chính người vừa làm là nghi thức rỗng"*.

## Vòng verify 1 — 2026-08-15

| Khía cạnh | Trạng thái |
|---|---|
| **Completeness** | ✅ **ĐẠT** — 6/6 hạng mục `outline.md`. Frontmatter đủ `id`/`type`/`status`/`created` ở cả 3 deliverable. `updated: 2026-08-15` bump **7/7** file PM sửa. Thư mục + naming khớp **RULE-001 §Document Type Mapping** |
| **Correctness** | ✅ **ĐẠT** — mọi `SEC-*` · `THREAT-*` · `U-*` · `ACG-*` · `N-*` · `FR-*` · `ADR-*` được trích **đều tồn tại đúng nội dung**. Mọi trích dẫn `RQ.md` khớp chữ (§18 đúng 8 nhóm, §20.1 đúng 9 nhóm đúng thứ tự, §22 đúng 10 scenario × 7 bước, §23 đúng 5 metric). Số học kiểm lại đúng hết (`80%×7=5.6 ⇒ ≥6/7` · `1/7=14.3pp` · `K=3` +50% tại `p=0.1`). **Không có một ngưỡng bịa nào** |
| **Coherence** | 🔴 **2 CRITICAL** — xem dưới |
| **Connectivity** | ✅ **ĐẠT** — **0 link chết** (toàn bộ relative link của 3 deliverable + 7 file PM, cộng 20/20 anchor nội bộ). **0 wiki-link**. **0 orphan** — cả 3 đã đăng ký MOC cha, 2 tài liệu lớn đã vào `000-Index` |
| **Mốc tuần `G4`** | ✅ Phase 0 = 10 tuần · `P0-A` = `W1`–`W3` · `GATE-06` = `W10` = 2026-10-23. **Không** còn `W9`/`2026-10-16` sống ở bất kỳ tài liệu sản phẩm nào |

## CRITICAL

### `C1` — Hai thủ tục quy trách nhiệm divergence, thứ tự ngược nhau

`Spec §3.6` ↔ `MTP §7.1`: cả hai tuyên bố *"khớp đầu tiên thắng"* trên **cùng một sự kiện** (`verdict = diverged`) nhưng đặt `non-determinism` ở **bước 4** vs **bước 1**, và `MTP` **không có** nhãn `unattributed`.

**Ba bằng chứng đây là mâu thuẫn thật, không phải cách đọc:**
1. **Probe `S11` gãy** — `Spec` bắt `S11` phải ra `incomplete-capture`; theo `MTP`, nếu `K=3` lần cho khác verdict thì dòng 1 khớp trước ⇒ nhãn `NON-DETERMINISM`, **không bao giờ tới dòng manifest**. Đúng chế độ hỏng mà `S11` sinh ra để bắt.
2. **`unattributed` không có đường tồn tại trong `MTP`** — `Template T7` bắt in tỷ lệ `unattributed` như con số riêng; chạy theo `MTP` thì con số đó **luôn = 0 theo cấu tạo**, tín hiệu *"rubric chưa phủ hết"* bị xoá.
3. **`Spec` tự mâu thuẫn qua đường nối hai writer** — §4 (BA) dẫn ngược sang `MTP §7`, trong khi §3 (Architect) tự dựng thủ tục riêng.

**✅ Quyết định PM (escalation tầng 2 — trong phạm vi `brief.md`)**: **`Spec §3.6` là chủ sở hữu DUY NHẤT**. Lý do: nó neo [`ADR-011`](../../../030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md) `D3` (ADR đã `Accepted`) và có nhãn `unattributed`. `MTP §7.1` hạ xuống thành **bảng vận hành trỏ ngược**, giữ phần đóng góp thật là *cách thu thập bằng chứng* cho từng bước. Hai đóng góp kỹ thuật của `MTP` (bước `3b` `truncated`; điều kiện `K` cho bước non-determinism) được **hấp thụ vào `Spec §3.6`**.

### `C2` — Chỉ số composite không có nơi sinh ra và không có ô chứa

`Spec §4.6` định nghĩa **chỉ số gate** = `(số scenario reproduced) / 7`, ngưỡng `≥6/7`, và bắt *"ba con số phải cùng xuất hiện ở `C4`"*. Nhưng `MTP §8.2` (`B7-1`…`B7-11` — **nơi duy nhất** yêu cầu đi tới `B7`) chỉ đòi 6 metric, và `Template` `T2`/`T6`/`T8` **không có dòng nào, không có ô nào** cho nó.

⇒ Chỉ số dựng ra để phán quyết cổng **không được đo, không được in, không có chỗ điền**. `C4` sẽ in đúng bức tranh mà `Spec §4.6` gọi là *"kịch bản tệ nhất và con số đẹp nhất là **cùng một** kịch bản"*.

**Nguyên nhân gốc — bài học quy trình**: `MTP` và `Template` viết ở Phase 2/3, còn `Spec §4` (nơi sinh ra composite) viết **sau cùng**. `outline.md` đã tuần tự hoá quyền ghi vào `Spec` nhưng **không có bước ripple ngược** từ §4 sang hai file kia. Lần sau: mục nào sinh ra một **chỉ số** thì phải có bước kiểm *"ai đo, in ở đâu"* trước khi đóng phase.

## WARNING đã đưa vào vòng sửa

| # | Nội dung |
|:--:|---|
| `W1` | Namespace `S1` hai nghĩa — điều kiện class (`S1`–`S7`) vs scenario §22. `Template §1.3` chốt quy ước cho `T` và `G` nhưng **bỏ sót `S`**. Sửa: scenario → `SC-1`…`SC-10`, probe → `SC-11` |
| `W2` | `Spec §4.7 L2` khai *"con đường **duy nhất**"* rồi tự nêu thêm hai con đường (hypothesis §3.8/§3.9 bị bác bỏ; cổng `inconclusive`). Không sửa ⇒ `L3` không được kích hoạt ở hai con đường sau |
| `W3` | `MTP §2.1` gọi cặp `7`/`10` là *"luật Hai mẫu số"* — sai. `L3` nghĩa là `7` (đóng băng) và **số đã co**. Nhầm ⇒ `C4` in `x/7` + `y/10` rồi tưởng đã thoả `L3` trong khi mẫu số đã co không được in |
| `W4` | Cảnh báo độ mịn (*"PHẢI dùng `≥6/7`, KHÔNG dùng `80%`"*) không có ô nào trong `Template` — chính là khuôn của `C4` |
| `S6` | `MTP` trỏ *"§nhật ký"* của Timeline — mục đúng là **§15 Ghi chú lịch sử** |

## SUGGESTION chưa xử — nợ lại có ý thức

| # | Nội dung | Vì sao hoãn |
|:--:|---|---|
| `S1` | `[stated §N]` khai là *"nguyên văn trong `RQ.md`"* nhưng tài liệu dùng `[stated MTP §2.3]`, `[stated NFR 2.1]`… Nội dung trích **đều đúng** | Mở rộng từ vựng nhãn, không phải lỗi nội dung |
| `S2` | *"**chỉ số** đơn vị phân kỳ đầu tiên"* (Spec) vs *"**điểm** phân kỳ đầu tiên"* (MTP) — cùng một đại lượng, hai tên | Ràng buộc **đã thoả**, chỉ là tên gọi |
| `S3` | `Template:47` khai *"`T#` trần **luôn** là bảng report"* ở thể tuyệt đối | Mỗi file tự nhất quán, mọi tham chiếu chéo đã qualify |
| `S4` | `N-04` gộp `t_verify` vào cửa sổ, trong khi §23 ghi *"to: execution result"* — **cần xác nhận** | Đọc được theo cả hai chiều; auditor cố ý không nâng mức |
| `S5` | Scenario 9 bị loại vì `M-3` nhưng lại viện `U-20`/`W3` — hai lý do độc lập chưa tách rõ | `X6` đã tự khai điểm yếu này |
| `S7` | `MTP`/`Template` không có trường `updated` | RULE-001 khai là **tuỳ chọn**; file mới tạo cùng ngày `created` ⇒ **không vi phạm** |
| `S9` | `brief.md` còn ghi `GATE-06 = 2026-10-16` | **Cố ý giữ** — đây là run-state ghi giả định `TL-A1` **trước** `G4`. Sửa sẽ phá giá trị lịch sử |
| **Glossary** | ~25 thuật ngữ mới đáng chuẩn hoá; và **họ `G1` nay có 4 nghĩa** | Xem dưới |

## Đính chính một tiền đề PM đưa sai

PM viết trong prompt kiểm toán rằng `Glossary.md` *"hiện là stub ngắn, không đủ làm chuẩn đối chiếu"* — **sai**. Auditor verify: nó có **~40 mục Repro** với neo section đầy đủ, và **đã định nghĩa `Supported Execution Class`**.

⇒ Việc Glossary im lặng với thuật ngữ mới là **tín hiệu thật**, không phải giả âm tính. Quan trọng hơn: Glossary mục `GATE-0N` **đã có sẵn một luật chống trộn namespace** cảnh báo *"dùng lẫn sẽ tạo **dead link ngữ nghĩa** — loại lỗi phân giải im lặng sang nội dung sai thay vì báo lỗi"*, và run này vừa đưa vào **họ `G1`–`G4` thứ tư**. Đây là mục cần cập nhật trước nhất — **nợ lại, không thuộc phạm vi run này**.

## Kết luận vòng 1

> 🔴 **CHƯA ĐÓNG RUN.** Điều kiện đóng ở `brief.md` — *"chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"* — hiện được trả lời **mơ hồ**, không phải sai: có **hai** thủ tục quy trách nhiệm cho cùng một divergence, và **chỉ số gate `≥6/7` không có nơi nào sinh ra**. **Mơ hồ chưa phải là đã trả lời.**

Cả hai CRITICAL rơi đúng vào chỗ auditor được cảnh báo là dễ sinh lỗi nhất — **nơi ba writer khác nhau ghi vào cùng một chuỗi tài liệu** — và cả hai đều nằm trên đường `C3` → `C4` → `GATE-06`.

**Hành động**: dispatch **hai worker mới** (không tự vá — guardrail `pm-core`), kèm **nguyên văn** finding. `architect` → `Spec` (`C1`, `W2`, `W1` phần Spec). `quality-assurance` → `MTP` + `Template` (`C2`, `C1` phần MTP, `W1`, `W3`, `W4`, `S6`).

## Vòng sửa — 2026-08-15

Hai worker **mới** (không tự vá — guardrail `pm-core`), chạy song song trên hai tập file **rời nhau**.

### `C1` — ✅ ĐÓNG

| Bên | Đã làm |
|---|---|
| `architect` → `Spec §3.6` | Tuyên bố **chủ sở hữu duy nhất**; hấp thụ hai đóng góp của `MTP`: `truncated` thành bước **`2b`** (kèm **mệnh đề loại trừ** ở bước 2 — không có nó thì `2b` là **bước chết**, vì bước 2 của Spec rộng hơn dòng 2 của MTP), và điều kiện **`K = 3`** tường minh cho bước 4 |
| `quality-assurance` → `MTP §7.1` | Bỏ thứ tự riêng; thành **bảng tra cứu theo NHÃN**, cấp phần `§3.6` không có: **bằng chứng lấy ở đâu, đọc bằng gì**. Có dòng `unattributed` |

**Phán quyết kỹ thuật của `architect` — non-determinism GIỮ Ở BƯỚC 4**, hai căn cứ:
1. **`§1.5` đã lập pháp cho đúng ca này**: chạy `C1` khi manifest chưa niêm phong thì *"`C3` sẽ quy mọi scenario fail về non-determinism trong khi nguyên nhân thật là thiếu capture đã biết trước"*. Đặt phi tất định ở bước 1 là **mã hoá cứng đúng hỏng hóc đó** vào thủ tục — manifest sẽ tồn tại mà **không bao giờ được tra tới**.
2. **Chính `MTP §7.1` tự bác thứ tự của nó**: lời mở ghi *"non-determinism… là lời giải thích dễ nhất và không đòi bằng chứng gì"*, dòng 2 ghi *"CẤM ghi là non-determinism"*. ⇒ Đây là **hiện thực đúng ý định đã phát biểu của `MTP`**, không phải lật nó.

**Và `architect` bác một tiền đề trong bằng chứng #1 của auditor — đúng:**

> Auditor lập luận *"nếu `K=3` lần cho khác verdict thì `SC-11` ra sai nhãn"*. Nhưng Redis production **đã bị destroy** ở §22 và allowlist egress `ADR-005 L2` là **tĩnh** ⇒ lời gọi cache hỏng **ổn định** ⇒ `K=3` cho **cùng** verdict tại **cùng** điểm phân kỳ ⇒ điều kiện bước 4 **sai** ⇒ bước 4 **không khớp ở bất kỳ vị trí nào**, và `SC-11` ra `incomplete-capture` **dưới cả hai thứ tự**.

Điều này **không làm `C1` mất tính CRITICAL** — hai thủ tục cho cùng một sự kiện vẫn là defect, và bằng chứng #2 (`unattributed` luôn = 0 theo cấu tạo) đứng vững độc lập. Nhưng nó đúng, và `architect` **ghi thẳng vào tài liệu** (§2.5, §3.6.1) thay vì để mâu thuẫn lơ lửng. Lớp sự kiện mà thứ tự **thực sự** quyết định đã được gọi tên tường minh: divergence vừa `K`-khác-verdict **vừa** chạm một record có trước.

**Tín hiệu bất ổn định không mất**: cờ `replay_unstable` ghi trên **mọi** divergence có `K` lần khác verdict, độc lập với nhãn — tính được ở `C3` từ chính 3 verdict mà `MTP C1-2` đã bắt đưa vào population.

### `C2` — ✅ ĐÓNG

Bịt theo đúng **chuỗi sinh**: đo (`MTP §8.2` `B7-12`) → in (`Template T2` dòng 7) → điền phán quyết (`T8`). `T6` dòng 1 nay lấy composite làm **số đối chiếu chính**, RSR/EMR thô chỉ còn là ngữ cảnh. Ranh giới `§1.1` giữ nguyên: `B7-12` chỉ bắt **xuất ra**, còn chỉ số và ngưỡng là `TIÊU THỤ` từ `Spec §4.6`/`§4.4`.

QA xử được một va chạm chưa ai nêu: `T8` là ô trả lời `GATE-06`, nhưng dòng cấm số 2 cấm phán *pass/fail* trên số §24. Giải: `T8` cấp **số đo + phát biểu so sánh có neo**, quyết định vẫn thuộc `@TrisJr`, **không** thêm cột *đạt/không đạt* ở đâu.

### `W1`–`W4`, `S6` — ✅ ĐÓNG

Namespace: `S1`–`S7` = điều kiện class · **`SC-1`…`SC-10`** = scenario §22 · **`SC-11`** = probe. Bảng quy ước ở đầu `Spec §2` và trong `Template §1.3`.
`W2`: `§4.7` nay có bảng **`L2-a` ba con đường co hợp lệ**, mỗi con đường kèm mốc thời gian + người ghi lý do.
`W3`: `MTP §2.1` đổi *"theo luật Hai mẫu số"* → *"con số **diagnostic**"*, neo `L3` về `Spec §4.7`.
`W4`: cảnh báo độ mịn `≥6/7` chép nguyên văn dưới `T6`, cộng ô ở `T8`.

### Rủi ro tái phân kỳ — đã kiểm, KHÔNG tồn tại

`architect` cảnh báo lệch số hiệu `Spec 2b` ↔ `MTP 3b` có thể đẻ ra đúng loại divergence mà vòng này tồn tại để hoà giải. **PM verify: không xảy ra** — `MTP §7.1` dòng 13 ghi thẳng *"Bảng này **tra cứu theo NHÃN**, không theo số thứ tự bước — số thứ tự thuộc §3.6 và có thể đổi ở đó."*

> Hai agent chạy song song, mỗi bên tự phòng thủ, và thiết kế của QA **vô hiệu hoá đúng rủi ro** mà `architect` lo. Đây là kết quả của việc cấp cho cả hai **cùng một quyết định PM** thay vì để mỗi bên tự suy diễn.

### Còn tồn sau vòng sửa — đã dispatch worker thứ ba

`architect` báo hai chỗ nằm **ngoài hàng rào ownership** của nó, đều trong `§4` (vùng BA):
1. `§4.8` còn ký hiệu **`S11`** ở ba chỗ (heading + hai dòng nội dung).
2. `§4.2` còn khai *"`M-1` hỏng là con đường hợp lệ **duy nhất**"* — nay mâu thuẫn `§4.7 L2-a` ba con đường.

⇒ Dispatch `business-analyst` (chủ sở hữu `§4`). **PM không tự vá** dù hai sửa này rất nhỏ — kỷ luật ownership là thứ đã giữ cho run này không sinh xung đột ghi nào, phá nó ở bước cuối vì tiện là không nhất quán.

## Vòng verify 2 — 2026-08-15

**Phạm vi hẹp có chủ đích** — chỉ soát vùng vòng sửa chạm. Verifier vẫn là `context-auditor`, read-only.

> 🟢 **ĐÓNG ĐƯỢC RUN.** 6/6 mục vòng 1 **ĐÓNG thật**. **0 CRITICAL mới.** 2 `WARNING` + 1 `SUGGESTION`, không mục nào chặn.

| Mục | Kết quả | Bằng chứng chính |
|---|:--:|---|
| `C1` thủ tục quy trách nhiệm | ✅ **ĐÓNG** *(sinh 1 lỗi mới, xem `W-1`)* | `Spec §3.6` là thủ tục **duy nhất**, có `unattributed` ở bước 6. `MTP §7.1` bỏ hẳn thứ tự riêng — và auditor kiểm thêm: **thứ tự dòng thực tế của bảng mới vẫn trùng khít 1→6 của `§3.6`**, nên kể cả người đọc theo dòng cũng không ra thứ tự khác |
| `C2` chỉ số composite | ✅ **ĐÓNG** | Đủ ba mắt xích **đo** (`MTP B7-12`) → **in** (`Template T2` dòng 7) → **điền** (`T8`). `T6` nay lấy composite làm số đối chiếu **chính**. `≥6/7` được khai là **dạng hiệu dụng** ở **cả 4 nơi**, không phải ngưỡng mới |
| `W1` namespace `S` | ✅ **ĐÓNG** | Không còn `S11` nghĩa probe trong tài liệu sản phẩm; `Spec:130` giữ lại **có chủ đích** ở thì quá khứ. Không chỗ nào đổi nhầm `S1`–`S7` |
| `W2` ba con đường co | ✅ **ĐÓNG** | Bảng `L2-a` tại `Spec:849–855`; `§4.2` hết mâu thuẫn. Auditor **không báo nhầm** `Spec:793` |
| `W3` `W4` `S6` | ✅ **ĐÓNG** cả ba | — |

### Phán quyết về phản biện của `architect` — **ĐÚNG**, và auditor xác nhận bằng nguồn gốc

Auditor tìm lại **bảng 5 bước nguyên bản của QA** tại [`findings/quality-assurance.md`](./findings/quality-assurance.md) — dòng 1 bản cũ **cũng đã có điều kiện thực nghiệm** (*"hai lần replay cho **khác** verdict?"*). Với `SC-11`: Redis destroy + allowlist tĩnh ⇒ hỏng **ổn định** ⇒ điều kiện dòng 1 **sai** ⇒ rơi xuống dòng Manifest ⇒ `incomplete-capture`. **Cùng kết quả dưới cả hai thứ tự.**

> **Nhưng CRITICAL vòng 1 vẫn đứng** — nó **không treo** trên tiền đề bị bác. Bằng chứng #2 (`unattributed` luôn = 0 theo cấu tạo) và #3 (`§4` dẫn ngược sang `MTP`) độc lập. Và defect gốc — **hai thủ tục, hai thứ tự, cho cùng một sự kiện** — là defect **bất kể** `SC-11` có phân biệt được chúng hay không.

Auditor còn kiểm một sắc thái không ai nêu: `MTP §5.2` trỏ host cũ về **canary**, nên lời gọi Redis có thể **chạm canary** thay vì `ECONNREFUSED`. Kết luận không đổi — `Spec §3.2` đã loại `latency`/`timestamp` khỏi tập field so sánh, nên dao động thời gian không sinh khác verdict.

### Soát lỗi MỚI do vòng sửa song song — trục quan trọng nhất

| Trục | Kết quả |
|---|---|
| Cross-ref trỏ **"bước 2/3/4"** của `§3.6` nay dịch chuyển vì chèn `2b` | ✅ **Sạch** — auditor soát 9 vị trí trong 4 file, tất cả khớp thứ tự hiện tại. `MTP` và `Template` **không dùng số bước** ⇒ **miễn nhiễm**. Đây là hiệu quả đo được của thiết kế tra-theo-nhãn |
| Anchor chết sau khi đổi heading `§3.6` và `§4.8` | ✅ **Sạch** — auditor tự dựng slug unicode-aware, quét **81 file** `.md`: 0 anchor chết |
| Cross-ref `Spec` ↔ `MTP` ↔ `Template` | 🟡 **1 lỗi mới** — `W-1` |

### WARNING vòng 2

| # | Nội dung | Chủ | Xử |
|:--:|---|---|---|
| **`W-1`** | **Lỗi MỚI do sửa song song**: `Spec:437/443/445` trích *"`MTP §7.1` dòng `3b`"* — dòng đó **không còn tồn tại** sau khi `§7.1` chuyển sang tra theo nhãn. `3b` duy nhất còn lại trong `MTP` là `:80` = **`Capture Overhead — CPU`**, khái niệm khác hẳn ⇒ đúng loại **dead link ngữ nghĩa** mà `Glossary` mục `GATE-0N` cảnh báo | `architect` | ✅ Đã **SendMessage resume** agent cũ thay vì spawn mới — tái dùng context, đúng tinh thần guardrail *"không spawn khi việc nhỏ hơn overhead nạp context"* |
| **`W-2`** | **Claim của PM SAI**: PM tuyên bố *"0 dead link thật toàn `docs/`"*. Thực tế `Timeline-Repro:168,169` còn **2 dead anchor** mốc tuần (`w9w20`→`w11w22`, `w14w31`→`w16w33`) — dư chấn ripple `G4`: heading đổi mốc tuần, link trỏ tới heading thì không | PM | ✅ Đã sửa |

**Nguyên nhân `W-2` — bài học công cụ:** script quét của PM chỉ kiểm **đường dẫn file**, **không** kiểm phần `#anchor` của link chéo file. Trước đó PM còn chạy một script slug **sai** cho 21 báo động giả (gộp nhầm `--` mà GitHub giữ lại). ⇒ **Hai lần công cụ tự chế của PM cho kết quả sai**, cả hai lần auditor độc lập đúng. Nguyên tắc rút ra: kết quả tự chạy mâu thuẫn với kết quả đã verify độc lập ⇒ **nghi công cụ của mình trước**.

### SUGGESTION — nợ lại

`MTP:523` (và nhẹ hơn `:518`) dùng `T7`/`T1` **trần**, va namespace `T1`–`T12` của chính `MTP §5.3` (ở đó `T7` = *"`net.Socket` thô"*). Quy ước `Template:47` chỉ lập pháp cho **report**, không phủ `MTP`. Auditor **không nâng mức** vì cách viết này có **từ trước** vòng sửa ⇒ không phải lỗi mới. Sửa rẻ nếu muốn: viết đủ *"bảng `T7` của Spike Report"*.

### Ngoại lệ ownership PM đã dùng — ghi lại để minh bạch

`pm-core` có hai guardrail kéo ngược nhau: *"không tự vá"* và *"không spawn khi phần việc nhỏ hơn overhead nạp context"*. PM viện guardrail thứ hai **hai lần**, cả hai đều là sửa cơ học sau khi **mọi writer đã xong** (không còn concurrency để bảo vệ):
1. Một anchor `#48-…-probe-s11` → `…-probe-sc-11` tại `Spec §4.3.1`.
2. Hai dead anchor mốc tuần tại `Timeline-Repro:168,169`.

Cộng hai dead link **do chính PM viết sai** trong `findings/` (`../../` → `../../../`). Cả ba nhóm đều được auditor hoặc worker phát hiện trước, không phải PM tự phát hiện rồi tự vá.

Riêng `W-1` — một **khẳng định nội dung** về tài liệu khác — PM **không** tự vá, mà resume `architect`.

**Ranh giới PM áp dụng**: *sửa cơ học thì PM làm, sửa khẳng định thì trả về chủ sở hữu.*

---

## Kết luận cuối — 2026-08-15

### `W-1` đã đóng

`architect` được **resume qua SendMessage** (không spawn mới) — chỉ **5 tool call** vì tái dùng transcript cũ. Ba chỗ đã vá theo hướng qualifier *"bản trước vòng hợp nhất"*, cộng pointer tới [`findings/quality-assurance.md`](./findings/quality-assurance.md) nơi bảng có số hiệu `3b` còn tra được.

Nó bổ sung một thứ không được yêu cầu và đáng giữ: **câu cấm trích `MTP` theo số dòng** — chặn tái phát cùng loại lỗi thay vì chỉ vá hiện tại. Và sửa đúng dữ kiện auditor bắt được: dòng **hẹp** là dòng **2** (Manifest), không phải dòng đứng ngay trước `3b`; lập luận *"bước chết"* giữ nguyên.

### Kiểm cơ học cuối — PM, lần này có kiểm anchor chéo file

| Chỉ số | Kết quả |
|---|---|
| File `.md` quét | **81** |
| Dead anchor | **0** |
| Dead link file (thật) | **3** — đều trong `pm-runs/2026-08-14-repro-product-docs/`, **có từ trước session này**, là dấu vết lịch sử của run khác ⇒ **không sửa** |
| Wiki-link | **0** |

### ✅ ĐÓNG RUN

Điều kiện đóng ở [`brief.md`](./brief.md) — *"Chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"* — nay **trả lời được**, không còn mơ hồ:

| Câu hỏi | Trả lời ở đâu |
|---|---|
| Execution nào được tính? | `Spec §2` — Supported Execution Class, `S1`–`S7` + hai trục loại trừ |
| Thế nào là `matched`? | `Spec §3` — rubric nhị phân, có ví dụ chạy tay, có `W1`–`W7` công bố trước |
| Đếm trên mẫu số nào? | `Spec §4` — **`D = 7`**, ngưỡng hiệu dụng **`≥6/7`** |
| Đo bằng cách nào? | `MTP` — 6 metric × 4 thuộc tính, `K = 3`, canary sink, 12 test |
| `diverged` thì lỗi của ai? | `Spec §3.6` — thủ tục 7 bước, **một** chủ sở hữu; `MTP §7.1` cấp bằng chứng |
| Báo cáo ra sao, cấm viết gì? | `Template` — 8 bảng bắt buộc, danh sách phát biểu **CẤM**, hai nhánh §39 đối xứng |

**Người verify**: `context-auditor` — **khác** cả bốn agent đã thực thi (`business-analyst`, `architect`, `quality-assurance` ×2).

**Kết luận**: **Đóng được.** Deliverable sẵn sàng cho `Gate A` — nơi `@TrisJr` phán quyết, và là gate mà run này chỉ **chuẩn bị**, không thay thế.

### Nợ lại có ý thức

| Mục | Vì sao hoãn |
|---|---|
| `SUGGESTION-1` — `MTP:523`/`:518` dùng `T7`/`T1` trần va namespace `T1`–`T12` | Có **từ trước** vòng sửa, không phải lỗi mới |
| `S1`–`S5`, `S7` của vòng 1 | Đã ghi ở mục *SUGGESTION chưa xử* phía trên |
| **Glossary** — ~25 thuật ngữ mới; và **họ `G1` nay có 4 nghĩa** | Ngoài phạm vi run. **Ưu tiên cao nhất cho lần tới**: `Glossary` mục `GATE-0N` đã có sẵn luật chống trộn namespace, và run này vừa thêm họ thứ tư vào đúng chỗ luật đó cảnh báo |
| 3 dead link trong run-state `2026-08-14` | Dấu vết lịch sử của run khác |

---

# 🚪 GATE A — quyết định của `@TrisJr` · 2026-08-15

> **`GA`** — task cuối của `P0-A` theo [Timeline §3](../../Estimates/Timeline-Repro.md). Driver: 👤 **`@TrisJr`** *(vai duy nhất được đóng gate)*.

## Quyết định: ✅ **DUYỆT**

**Exit criteria của `GA`** — *"Trả lời được: chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"* — **thoả**. Sáu câu hỏi con và nơi trả lời đã liệt kê ở mục *ĐÓNG RUN* phía trên.

## 🔒 Đóng băng theo luật `L1` — có hiệu lực từ thời điểm này

`Spec §4.7` luật **`L1` (Đóng băng)** bắt: *"Tập scenario và toàn bộ verdict kỳ vọng đóng băng tại `Gate A`, ghi vào `verdict.md`, trước khi `C1` chạy dòng lệnh đầu tiên."* Bản ghi niêm phong:

| Mục | Giá trị đóng băng |
|---|---|
| **Denominator `D`** | **7** |
| **Tập IN** *(vào denominator)* | `SC-1` Database state · `SC-2` External API response · `SC-3` Feature flag · `SC-4` Time-dependent · `SC-5` Missing data · `SC-6` Dependency/version difference · `SC-8` Side effect |
| **Observation set** *(chạy, ghi riêng, NGOÀI denominator)* | `SC-7` Randomness *(`M-2` hỏng)* · `SC-9` Async behavior *(`M-3` hỏng)* · `SC-10` Race condition *(`M-4` hỏng)* · **`SC-11`** probe Redis |
| **Ngưỡng hiệu dụng** | **`≥ 6/7`** — dạng hiệu dụng của ngưỡng §24 dòng 1. Trình bày **luôn** ở dạng `6/7`, **không** dạng `80%` |
| **Chỉ số gate** | **Composite fail-closed** ở mức scenario — **không** phải `EMR` thô |
| **`K`** *(`U-25`)* | **3** — scenario chỉ tính `reproduced` khi **cả 3 lần** đều `matched` |
| **`GAP-Redis`** | Phương án **(c) + định nghĩa của (a)** — quyết định `G1` |
| **Dữ liệu spike** | **SYNTHETIC**, không ngoại lệ — quyết định `G2` |
| **Nhánh `SC-6`** | **(A)** replay theo version ghi trong capsule, verdict kỳ vọng `matched` |

**Verdict kỳ vọng mức fixture (`M-5`)** chưa niêm phong được ở đây — nó sinh ra tại `B8` khi fixture tồn tại. Nó bị ràng buộc bởi luật **`L2` (bánh cóc một chiều)**: denominator **chỉ co, không bao giờ nở**, và ba con đường co hợp lệ đã liệt kê ở `Spec §4.7` bảng `L2-a`.

## Hệ quả của quyết định

1. **`P0-A` ĐÓNG.** Ba deliverable chuyển `status: draft → approved` — chúng là **protocol đã đóng băng** mà `P0-B`/`P0-C` phải tuân theo.
2. ⚠️ **`approved` KHÔNG nâng hypothesis thành định nghĩa sản phẩm.** Đây là cùng cách phân biệt mà `GATE-03` đã dùng cho 11 ADR (`Decision status: Accepted` nhưng `Open items` vẫn mở). Mọi mục mang nhãn `HYPOTHESIS` **vẫn là hypothesis**; nâng cấp là `D2`, thuộc `P1`, **sau `GATE-06`**.
3. **`P0-B` được phép bắt đầu** — nhưng `C1` vẫn bị chặn bởi điều kiện tiên quyết: Known-Missing-Input Manifest phải **niêm phong** trước.
4. **Ngân sách đã tiêu**: `P0-A` ~14 MD / `W1`–`W3`. Còn lại của Phase 0: `P0-B` 21.5 MD (`W4`–`W7`) + `P0-C` 10.5 MD (`W8`–`W10`). **`GATE-06` = 2026-10-23.**

> **Điều `GA` KHÔNG phán quyết**: nó **không** nói Repro khả thi. Nó chỉ nói *"nếu chạy spike theo protocol này, ta sẽ kết luận được"*. Câu hỏi khả thi thuộc **`GATE-06`**, và đó mới là gate quyết định có xây V0.1 hay không.
