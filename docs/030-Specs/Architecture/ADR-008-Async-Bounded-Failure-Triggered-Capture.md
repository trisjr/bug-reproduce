---
id: ADR-008
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-008: Async, Bounded, Sampled, Failure-Triggered Capture

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.

## Context

[ADR-007](./ADR-007-In-Process-SDK-Interception.md) đặt Recorder **bên trong process của ứng dụng production**. Điều đó biến mọi chi phí của capture thành chi phí trực tiếp trên đường đi của request thật. RQ.md §20.7 (*Production Performance Overhead — High*) liệt kê bốn thứ instrumentation có thể làm tăng: `latency`, `CPU usage`, `memory usage`, `network traffic`, và đặt một nguyên tắc không thương lượng:

> **Repro must never become the reason production becomes slower or fails.** (§20.7)

§20.7 đưa ra đúng năm mitigation, nguyên văn:

- `asynchronous capture`
- `bounded buffers`
- `sampling`
- `configurable capture limits`
- `capture only failed/high-value executions`

§21 tóm lại thành một dòng: `Production overhead / High / MVP? Yes / Async + bounded capture`.

§20.12 (*Capsule Size — High*) bổ sung một trục chi phí thứ hai — dung lượng — với mitigation `compression`, `deduplication`, `content hashing`, `size limits`, `selective capture`, `lazy loading`. Hai risk này gắn với nhau: cùng một cơ chế giới hạn phục vụ cả overhead lẫn kích thước.

§24 đề xuất ngưỡng `< 5% production latency overhead`. **Phải đọc §24 đúng như nó tự khai**: RQ.md viết *"These numbers should be treated as **initial hypotheses**, not final product commitments"*, và toàn bộ §22–§24 nói về một **technical spike**, không phải về sản phẩm. Bốn con số của §24 (`≥ 80%`, `< 5%`, `< 10 MB`, `< 30 seconds`) do đó là **giả thuyết validation**, **không phải acceptance criteria** của V0.1.

> ✅ **CHỐT GATE-01 — 2026-08-14** — **technical spike §22 mà đoạn trên nói tới đã được bật**: `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3.
>
> ⚠️ **Điều này KHÔNG thăng cấp bốn con số §24 thành cam kết.** Cách đọc §24 ở đoạn trên **giữ nguyên không đổi**: `≥ 80%` / `< 5%` / `< 10 MB` / `< 30 seconds` vẫn là **initial hypotheses** cho spike, **không** phải acceptance criteria. `GATE-01` cấp phương tiện để **đo**, nó không biến giả thuyết thành ngưỡng đã duyệt. Và `Go` không tự làm spike đo được — `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

Về trigger, §38 đặt hai câu hỏi để ngỏ: Q5 *"Should V0.1 support only failed executions?"* và Q6 *"Should manual recording also be supported?"*. RQ.md **không tự trả lời**. Quyết định **E5** của run này chốt: V0.1 **chỉ capture failed executions**, **không** có manual recording.

Có một điểm mà RQ.md **không thừa nhận** và ADR này bắt buộc phải ghi thẳng: mitigation `capture only failed/high-value executions` (§20.7) **không tự nó là một cơ chế giảm overhead** — vì trạng thái "failed" chỉ biết được **sau khi** execution kết thúc. Chi tiết ở `U-09` (§Open items) và ở §Consequences → Negative.

## Decision

Capture pipeline của Repro V0.1 có **bốn thuộc tính bắt buộc**, áp dụng đồng thời:

1. **Async** — công việc nặng của capture (serialize, nén, mã hoá, ghi/đẩy đi) **không nằm trên đường đi đồng bộ của request**. Trên critical path chỉ được phép làm phần rẻ nhất: ghi tham chiếu/giá trị vào một buffer trong bộ nhớ. Mọi thứ còn lại chạy ngoài critical path. (§20.7 `asynchronous capture`)

2. **Bounded** — mọi buffer đều có trần cứng: trần theo execution (số lượng và kích thước input được giữ) và trần toàn cục theo process. **Khi chạm trần, hành vi là drop, không phải block, không phải grow.** Ứng dụng không bao giờ được chờ Repro. Việc drop phải để lại **dấu vết tường minh trong capsule** — capsule bị cắt phải tự khai là bị cắt, không được im lặng. (§20.7 `bounded buffers` + `configurable capture limits`; §20.12 `size limits`, `selective capture`)

3. **Sampled** — tỉ lệ capture là tham số cấu hình được, có giá trị mặc định và có thể hạ xuống dưới 100%. Sampling là **van xả áp lực vận hành**, không phải cơ chế chọn lọc chất lượng. (§20.7 `sampling`)

4. **Failure-triggered** — quyết định *giữ hay huỷ* một execution buffer dựa trên tín hiệu failure của chính execution đó. Theo **E5**: V0.1 **chỉ** giữ failed executions; **không** có manual recording; **không** có capture theo lịch hay theo tỉ lệ cố định của traffic thành công. (§20.7 `capture only failed/high-value executions`; §38 Q5, Q6 + E5)

**Hệ quả cấu trúc bắt buộc phải viết ra, vì nó là phần RQ.md bỏ sót:** để (4) hoạt động, pipeline phải **buffer mọi execution nằm trong diện sampling ngay từ đầu**, rồi **huỷ buffer khi execution kết thúc thành công**. Do đó:

- Chi phí trên critical path (mục 1) áp cho **100% execution được sample**, không phải chỉ cho execution lỗi.
- Chỉ chi phí **sau trigger** (serialize/nén/mã hoá/đẩy đi) mới được hưởng lợi từ việc lọc theo failure.
- Ngân sách overhead vì thế phải được phát biểu theo **hai thành phần tách rời**: chi phí buffer-mọi-execution và chi phí materialize-execution-lỗi. Một con số duy nhất là phát biểu sai. Ngưỡng cụ thể: xem `U-09`.

Định nghĩa "failed" ở V0.1 và ngưỡng của từng tham số: xem §Open items — ADR này chốt **hình dạng** của pipeline, không chốt **giá trị số**.

Khi capsule sinh ra thiếu input và điều đó lộ ra lúc replay, hành vi tuân theo quyết định **E9**: báo **divergence + incomplete capture**, **không** crash, và **không** fallback gọi hệ thống thật ([ADR-011](./ADR-011-Execution-Diff-First-Class.md), [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md)).

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ |
|---|---|---|---|
| B1 | **Synchronous capture** — ghi và persist ngay trên đường đi của request | **[stated]** — **§20.7** liệt kê `asynchronous capture` là mitigation, tức loại bỏ hình thái đồng bộ; §21 chốt lại `Async + bounded capture` | Ưu: không bao giờ mất dữ liệu do drop, thứ tự đảm bảo. Nhược: vi phạm trực tiếp nguyên tắc §20.7 — biến độ trễ và lỗi của storage thành độ trễ và lỗi của production. |
| B2 | **Unbounded buffering** — giữ mọi thứ trong bộ nhớ cho tới khi đẩy đi được | **[stated]** — **§20.7** liệt kê `bounded buffers`; **§20.12** liệt kê `size limits` | Ưu: không mất dữ liệu, capsule luôn đầy đủ. Nhược: biến sự cố downstream (storage chậm/chết) thành sự cố memory của production — đúng kịch bản §20.7 cấm. |
| B3 | **Capture 100% execution** (mọi request đều thành capsule) | **[stated]** — **§20.7** liệt kê `capture only failed/high-value executions` như mitigation, tức capture-tất-cả bị loại tường minh | Ưu: không bao giờ bỏ lỡ bug; không cần định nghĩa "failed"; thoát hoàn toàn `U-09`. Nhược: chi phí dung lượng và mạng tuyến tính theo traffic (§20.12); và mỗi capsule là một bản sao dữ liệu production nhạy cảm (§20.5) ⇒ capture-tất-cả là **phóng đại bề mặt rủi ro dữ liệu**, không chỉ là vấn đề chi phí. |
| B4 | **Capture cả high-value executions** (chậm bất thường, khách hàng trọng yếu…) ngoài failed | **[stated]** — **§20.7** nêu nguyên văn `failed/high-value` ⇒ RQ.md **không** loại; bị thu hẹp bởi quyết định **E5** của run, không phải bởi RQ.md | Bị hoãn khỏi V0.1 vì "high-value" cần một định nghĩa nghiệp vụ mà RQ.md không cung cấp. Ghi lại ở đây để về sau không tưởng nhầm là RQ.md đã loại. |
| B5 | **Manual recording** — developer chủ động bật ghi cho một phiên/một request | **[stated]** — **§38 Q6** *"Should manual recording also be supported?"*; đây là một **câu hỏi mở**, RQ.md **không** loại; việc loại khỏi V0.1 là quyết định **E5** của run | Ưu: thoát hoàn toàn nghịch lý `U-09` (biết trước cần capture cái gì) và là con đường tự nhiên để tái hiện bug không-crash. Nhược lớn: là một **kênh trích xuất dữ liệu production do developer tự kích hoạt** — mô hình lạm dụng nội bộ mà lens `security-auditor` nêu. Đây là alternative mạnh nhất bị loại; nếu `U-09` không giải được, đây là chỗ quay lại. |
| B6 | **Sampling xác suất là trigger duy nhất** (không dùng tín hiệu failure) | **[inferred]** — §20.7 nêu `sampling` như một mitigation overhead, **không** nêu nó như một trigger; RQ.md không cân phương án này | Ưu: overhead dự đoán được tuyệt đối, không cần định nghĩa "failed". Nhược: bug hiếm gần như chắc chắn không lọt vào mẫu ⇒ phá thẳng giả thuyết lõi §37. |
| B7 | **Capture theo tín hiệu bên ngoài** — chỉ ghi khi hệ thống observability (§34: Sentry/APM) báo incident | **[inferred]** — §34 mô tả luồng `Sentry / APM → incident → Repro` nhưng ở tầng *workflow của con người*, **không** nói tín hiệu đó điều khiển recorder | Nhược: tín hiệu đến **sau khi** execution đã kết thúc và buffer đã bị huỷ ⇒ không giải được `U-09`, chỉ dời nó. |
| B8 | **Ring buffer luôn bật trên đĩa**, giữ N execution gần nhất, trích xuất khi cần | **[inferred]** — RQ.md không nêu | Ưu: giải được `U-09` (dữ liệu đã có sẵn khi biết là lỗi). Nhược: dữ liệu production nhạy cảm nằm sẵn trên đĩa của mọi node production ⇒ va vào §20.5 và §16; và va vào `Artifact storage` mà §20.15 cảnh báo. |

## Consequences

### Positive

- **Nguyên tắc §20.7 được bảo vệ bằng cấu trúc, không bằng thiện chí.** Async + bounded + drop-not-block nghĩa là con đường mà Repro làm production chậm đi hoặc chết đã bị chặn ở mức thiết kế: ứng dụng không có điểm nào chờ Repro.
- **Chi phí đắt nhất chỉ phải trả cho execution có giá trị.** Serialize, nén, mã hoá và truyền đi — phần tốn kém nhất — chỉ xảy ra với execution lỗi. Đây là phần lợi ích **có thật** của failure-trigger, và ADR này nói rõ nó chỉ có thật ở nửa sau pipeline.
- **Giảm mạnh lượng dữ liệu production nhạy cảm được vật chất hoá.** Mỗi capsule không sinh ra là một bản sao dữ liệu production không tồn tại (§20.5, §16). Failure-trigger là một biện pháp **privacy**, không chỉ là biện pháp hiệu năng — RQ.md không nói điều này nhưng nó là hệ quả trực tiếp.
- **Bám sát §20.12 mà không cần cơ chế riêng.** `size limits` và `selective capture` được hiện thực bằng chính cơ chế bounded buffer.
- **Tham số hoá được** (`configurable capture limits`, §20.7) ⇒ tổ chức tự chọn điểm cân bằng thay vì nhận một hằng số áp đặt.

### Negative

- **`U-09` — nghịch lý capture trigger. Đây là hệ quả tiêu cực quan trọng nhất và RQ.md không thừa nhận nó.** §20.7 trình bày `capture only failed/high-value executions` như một mitigation overhead. Nhưng một execution **chỉ được biết là failed sau khi nó kết thúc**. Do đó recorder buộc phải **buffer MỌI execution** trong diện sampling rồi **huỷ khi thành công**. Hệ quả: ngân sách `< 5%` mà §24 đặt ra thực chất áp cho **100% traffic**, **không phải** cho vài request lỗi. Mitigation của §20.7 vì thế **không** làm giảm chi phí ở nửa đầu pipeline như cách đọc tự nhiên của câu chữ gợi ý. Mọi ước lượng overhead dựa trên tỉ lệ lỗi (kiểu "chỉ 0,1% request lỗi nên overhead không đáng kể") là **sai về cấu trúc**.
- **Sampling và mục tiêu sản phẩm kéo ngược chiều nhau.** Hạ sampling xuống để giảm overhead thì **đồng thời hạ xác suất bắt được đúng execution lỗi mà developer cần**. §20.7 liệt kê `sampling` cạnh `capture only failed executions` như hai mitigation cùng phe, nhưng chúng **xung đột**: cái sau muốn bắt được sự kiện hiếm, cái trước làm sự kiện hiếm khó lọt vào mẫu hơn. Với bug hiếm — đúng loại bug §2.1 mô tả là không tái hiện được — sampling là cơ chế **làm hỏng chính use case chính**. RQ.md không nêu xung đột này.
- **Async ⇒ có một cửa sổ mất mát không thể loại bỏ.** Nếu process chết ngay sau failure (đúng lúc bug nghiêm trọng nhất xảy ra), phần capture chưa kịp materialize sẽ mất. Hình thái bug càng nặng thì xác suất mất capsule càng cao — capture là ít tin cậy nhất đúng ở nơi nó có giá trị nhất.
- **Bounded ⇒ mất dữ liệu có hệ thống, không ngẫu nhiên.** Buffer chạm trần đúng lúc tải cao, payload lớn, kết quả query nhiều dòng — tức là đúng điều kiện mà nhiều bug production xảy ra. Capsule bị cắt dẫn tới thiếu input lúc replay, xử lý theo **E9** (divergence + incomplete capture, không crash, không gọi hệ thống thật). Nghĩa là: **một phần replay thất bại sẽ do chính chính sách capture gây ra**, và Execution Diff phải quy trách nhiệm đúng ([ADR-011](./ADR-011-Execution-Diff-First-Class.md)) thay vì đổ cho code của developer.
- **§20.7 tự thừa nhận overhead không thể bằng không.** RQ.md nêu thẳng bốn trục chi phí `latency / CPU / memory / network`. Không có cấu hình nào của ADR này đưa chi phí về 0 — chỉ có việc chọn chỗ trả.
- **`< 5%` không dùng được làm cổng nghiệm thu.** §24 tự khai là `initial hypotheses, not final product commitments` và thuộc về technical spike §22. V0.1 do đó bước vào **không có ngưỡng overhead đã được duyệt** — đây là khoảng trống thật, không phải chi tiết văn bản.
- **"Failed" chưa có định nghĩa ⇒ trigger chưa cài được.** Xem `U-09b`. Đồng thời bug **không** kèm exception (kết quả sai nhưng HTTP 200) sẽ **không bao giờ** được capture ở V0.1 — mà đó là một lớp bug rất phổ biến, và ví dụ §7 của chính RQ.md chỉ tình cờ nằm ngoài lớp này vì nó crash.
- **Không có manual recording (E5) ⇒ không có đường thoát.** Khi trigger tự động bỏ lỡ một execution, developer **không có cách nào** yêu cầu Repro ghi lại. Cửa sổ đó chỉ mở lại nếu B5 được xét lại.

> ✅ **CHỐT GATE-01 — 2026-08-14** — mục *"`< 5%` không dùng được làm cổng nghiệm thu"* ở trên **giữ nguyên hiệu lực**: `GATE-01` = **Go** bật spike §22 (`Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`), nhưng **không** duyệt một ngưỡng overhead nào. Mapping: `GATE-01` = G1 · `GATE-03` = G3.
>
> ⚠️ Do đó mệnh đề *"V0.1 bước vào **không có ngưỡng overhead đã được duyệt** — đây là khoảng trống thật"* **vẫn đúng nguyên văn sau `GATE-01` và sau `GATE-03`**. Spike nay có thể **sinh ra** con số; việc **chốt** ngưỡng vẫn là một quyết định chưa được ra. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Open items (TBD)

| ID | Unknown | RQ.md nói gì | Nó chặn cái gì |
|---|---|---|---|
| `U-09` | **Nghịch lý capture trigger — chưa giải.** Chi phí thật của việc buffer 100% execution để chỉ giữ lại phần lỗi là bao nhiêu? Có cấu trúc nào (ví dụ chỉ giữ tham chiếu, hoãn sao chép giá trị) làm phần buffer đủ rẻ không? | §20.7 nêu mitigation nhưng **không thừa nhận** rằng trạng thái failed chỉ biết được sau khi kết thúc. §24 đặt `< 5%` mà không nói áp cho traffic nào. | Chặn: mọi NFR về overhead (không phát biểu được nếu chưa tách hai thành phần chi phí); chặn thiết kế buffer; chặn việc §24 có ý nghĩa hay không. **Là câu hỏi số một của technical spike §22.** |
| `U-09b` | **Định nghĩa "failed" ở V0.1**: uncaught exception? HTTP 5xx? cả 4xx? lỗi do ứng dụng tự phân loại? Ai phát tín hiệu — SDK tự phát hiện hay ứng dụng khai báo? | §20.7 dùng từ `failed`; §37 nói `failed production execution`; §38 Q5 hỏi có nên chỉ hỗ trợ failed. **Không chỗ nào định nghĩa.** | Chặn: hiện thực trigger; chặn phát biểu phạm vi *"lớp bug nào Repro bắt được"* — vốn là điều §39 nói phải làm rõ trước khi vào MVP; chặn mẫu số của tỉ lệ ở §23. |
| `U-09c` | **Giá trị mặc định của các tham số**: sampling rate, trần buffer theo execution, trần toàn cục, số dòng/byte tối đa giữ cho một kết quả query. | §20.7 nói `configurable capture limits`; §20.12 nói `size limits`. **Không con số nào.** §24 chỉ có `< 10 MB average` — là giả thuyết spike, và §23 đòi đo cả P95 mà §24 **không** đặt ngưỡng P95. | Chặn: cấu hình mặc định của SDK; chặn hợp đồng hành vi khi chạm trần. Lens `security-auditor` cũng để ngỏ ngưỡng row/byte cap với cùng lý do: **cần số liệu từ spike §22**, không được bịa. |
| `U-09d` | **Hành vi khi buffer chạm trần**: drop cả execution, hay giữ một phần và đánh dấu incomplete? | RQ.md nêu `selective capture` (§20.12) nhưng không nói tiêu chí chọn. | Chặn: trường khai báo `incomplete` trong capsule manifest ([ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md)); chặn việc **E9** có phân biệt được "thiếu vì bị cắt" với "thiếu vì code local gọi thứ không có trong capsule" — hai nguyên nhân khác nhau cần hai thông điệp khác nhau. |
| `U-09e` | **Sampling quyết định ở đâu**: đầu execution (rẻ, nhưng phải quyết khi chưa biết gì) hay có thể nâng cấp giữa chừng khi thấy tín hiệu bất thường? | RQ.md chỉ nêu từ `sampling`. | Chặn: điểm cân bằng giữa hai hệ quả tiêu cực nêu trên; nếu quyết ở đầu thì xung đột sampling ↔ bắt-được-bug-hiếm là **không giảm nhẹ được**. |

> ✅ **CHỐT GATE-01 — 2026-08-14** — `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3. Điều này chạm trực tiếp ba mục đầu bảng: `U-09` được ghi là ***"câu hỏi số một của technical spike §22"*** ⇒ nay đã có nơi trả lời; `U-09c` được ghi là ***"cần số liệu từ spike §22, không được bịa"*** ⇒ nay đã có nguồn số liệu được cấp phép.
>
> ⚠️ **`U-09`, `U-09b`, `U-09c` (và `U-09d`, `U-09e`) VẪN `TBD`.** `GATE-01` cấp **phương tiện đo**, không cấp **câu trả lời**: chi phí thật của buffer 100% vẫn chưa biết, *"failed"* vẫn **chưa có định nghĩa** ở bất kỳ đâu trong RQ.md, và **không một giá trị mặc định nào** được chốt ở đây — không bịa số. Nghịch lý capture trigger nêu ở §Context (*trạng thái "failed" chỉ biết được **sau khi** execution kết thúc*) **vẫn nguyên**. Thêm nữa `Go` không tự làm spike đo được: thiếu denominator và thiếu tiêu chí chọn test case (`ACG-01`/`ACG-02`/`ACG-03`/`ACG-07`) thì kết quả đo `U-09` vẫn **không quy được về pass/fail**. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [ADR-009: Private / Self-Hosted Topology](./ADR-009-Private-Self-Hosted-Topology.md)
- [ADR-011: Execution Diff as First-Class Outcome](./ADR-011-Execution-Diff-First-Class.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
