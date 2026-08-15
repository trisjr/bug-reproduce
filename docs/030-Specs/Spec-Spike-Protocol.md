---
id: SPEC-SPIKE-001
type: technical-spec
status: draft
project: repro
created: 2026-08-15
updated: 2026-08-15
---

# Spike Protocol — Phase 0

> **Trạng thái soạn thảo**: khung do task `A1` dựng (🕵️ BA). Bốn `ACG` nay **đã có nội dung ở dạng hypothesis**: `§2` (`ACG-07` — task `A2`, 🏗️ Architect) · `§3` (`ACG-01` — task `A3`, 🏗️ Architect) · `§4` (`ACG-02` + `ACG-03` — task `A4`, 🕵️ BA).
>
> Tài liệu vẫn ở `status: draft`: **chưa qua review chéo `A7` và chưa qua `Gate A`**. Và theo [§0.2](#02-mọi-định-nghĩa-trong-tài-liệu-này-là-hypothesis-không-phải-định-nghĩa-sản-phẩm), *"có nội dung"* **không** đồng nghĩa với *"đã chốt"* — mọi phát biểu ở đây là `HYPOTHESIS — cần validate` cho tới `GATE-06` → `D2`.

## 0. Mục đích và ràng buộc bất khả nhượng

### 0.1 Tài liệu này tồn tại để trả lời một câu hỏi duy nhất

> **"Chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"**

Đây đúng là exit criteria của **Gate A** ở [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) §3. `GATE-01 = Go` (2026-08-14) đã **bật** technical spike, nhưng `Go` **không tự làm cho spike đo được**: bốn khoảng hở `ACG-01`, `ACG-02`, `ACG-03`, `ACG-07` ở [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 7 vẫn hở nguyên — không có định nghĩa *"sufficiently equivalent"*, không có tiêu chí chọn test case, không có denominator, không có *"Supported Execution Class"*.

Hệ quả nếu tài liệu này không tồn tại hoặc tồn tại mà không đóng đủ bốn gap: `P0-B` (Spike Build, **21.5 MD**) và `P0-C` (Spike Run + Report, **10.5 MD**) chạy hết **~32 MD** rồi cho ra một kết quả **không kết luận được** — không ai nói được `GATE-06` là `Có` hay `Không`. Đây chính là kịch bản mà `GATE-01-r` mô tả, và là lý do 9.5 MD của `P0-A` được cấp vốn: **9.5 MD mua lấy khả năng kết luận của ~32 MD phía sau**.

### 0.2 Mọi định nghĩa trong tài liệu này là `HYPOTHESIS`, KHÔNG phải định nghĩa sản phẩm

> [!IMPORTANT]
> **Không một mục nào trong tài liệu này là định nghĩa sản phẩm.** Mọi phát biểu định nghĩa sinh ra ở `P0-A` là **hypothesis có nhãn**, tồn tại để **spike có thể bác bỏ nó**.

Việc **nâng hypothesis lên thành định nghĩa sản phẩm** là công việc của task **`D2`**, thuộc phase **`P1`**, và chỉ được thực hiện **sau `GATE-06`** — tức sau khi đã có dữ liệu thực từ spike. Trước thời điểm đó, mọi trích dẫn tài liệu này như một quyết định đã chốt là **sai quy trình**, không phải sai sót biên tập.

Lý do không thoả hiệp được: `NFR-Repro` mục 7 ghi tường minh với cả `ACG-01` và `ACG-07` rằng phương án đề xuất *"PHẢI được validate qua technical spike §22 trước khi trở thành quyết định"* và **"cấm ghi nó vào bất kỳ tài liệu nào như định nghĩa đã chốt"**. Tài liệu này là nơi hypothesis được viết ra — không phải nơi lệnh cấm đó được gỡ.

### 0.3 Toàn bộ code `P0-B` là `throwaway`

Hai neo nguyên văn trong [RQ.md](../999-Resources/RQ.md):

- `[stated §39]` — *"Do **not** start by building the full Repro platform. First build a technical spike that validates the core loop."*
- `[stated §22]` — *"Before investing in a full product, build a small technical spike. The goal is **not** to build the product."*

⇒ **Toàn bộ code sinh ra trong `P0-B` là `throwaway`.** Nó tồn tại để trả lời một câu hỏi, **không** để tiến hoá thành V0.1. Tái sử dụng bất kỳ phần nào của nó cho V0.1 là **một quyết định riêng phải đi qua `P1`**, không phải mặc định. Cơ chế bảo vệ ràng buộc này nằm ở [§5 — Shortcut ledger](#5-shortcut-ledger).

---

## 1. Phạm vi, cách gắn nhãn hypothesis, quy tắc cấm nâng cấp

### 1.1 Phạm vi — tài liệu này đóng gì và KHÔNG đóng gì

| Hạng mục | Trong phạm vi tài liệu này? | Ở đâu |
|---|:--:|---|
| `ACG-07` — *Supported Execution Class* | ✅ **Đóng** (dạng hypothesis) | §2 — task `A2` |
| `ACG-01` — *"sufficiently equivalent"* / execution path + rubric | ✅ **Đóng** (dạng hypothesis) | §3 — task `A3` |
| `ACG-02` — tiêu chí chọn test case *"meaningful"* | ✅ **Đóng** (dạng hypothesis) | §4 — task `A4` |
| `ACG-03` — denominator của `≥ 80%` + định nghĩa *"reproduced"* | ✅ **Đóng** (dạng hypothesis) | §4 — task `A4` |
| `ACG-04` — điều kiện đo latency overhead | ❌ **Không** | [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) — task `A5` |
| `ACG-05` — mốc đo replay time | ❌ **Không** | [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) — task `A5` |
| `ACG-11` — điểm đo capsule size trong pipeline | ❌ **Không** | [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) — task `A5` |
| `N-05` — **ngưỡng** Execution Match Rate | ❌ **Không** | Task `D1` — cần **dữ liệu phân bố thực tế từ spike**; chốt ngưỡng trước khi có dữ liệu là bịa số |

> **Ranh giới giữa tài liệu này và measurement plan**: tài liệu này định nghĩa **cái gì được coi là đạt** (definition + rubric + denominator). Measurement plan định nghĩa **đo bằng cách nào** (công cụ, mốc đo, population, đơn vị). Hai tài liệu **không** được lặp nội dung của nhau; xung đột thì tài liệu **sở hữu** hạng mục theo bảng trên thắng.

> **`N-05` nằm ngoài phạm vi là có chủ ý.** Tài liệu này cấp cho spike khả năng **tính ra** một con số; nó **không** cấp ngưỡng để phán quyết con số đó. Việc gộp hai thứ ⇒ ngưỡng sẽ được chọn sau khi đã nhìn thấy kết quả, đúng loại gian lận mà `ACG-02` cảnh báo.

### 1.2 Quy ước nhãn — bắt buộc dùng xuyên suốt

**Mọi phát biểu định nghĩa** trong tài liệu này (§2, §3, §4 và mọi mục bổ sung sau này) **phải mang đúng một trong ba nhãn** dưới đây. Phát biểu không nhãn là **lỗi review**, `A7` phải trả lại.

| Nhãn | Nghĩa | Ai được dùng |
|---|---|---|
| `[stated §N]` | Có **nguyên văn** trong `RQ.md` tại section `N`. Trích dẫn phải khớp chữ, không diễn giải lại | Mọi tác giả |
| `[inferred]` | **Suy luận** của tác giả tài liệu. `RQ.md` **không nói** điều này. Phải nêu suy luận từ dữ kiện nào | Mọi tác giả |
| `HYPOTHESIS — cần validate` | **Đề xuất chưa phải định nghĩa sản phẩm.** Được viết ra để spike có cơ hội **bác bỏ** nó | Mọi tác giả |

Ba quy tắc phụ:

1. **Nhãn đi kèm phát biểu, không đi kèm mục.** Một mục có thể chứa cả ba loại nhãn; không được gắn một nhãn ở đầu mục rồi coi như phủ toàn mục.
2. **`[inferred]` không được nâng thành `[stated §N]`** bằng cách trích một section chỉ *gợi ý* điều đó. Không có nguyên văn ⇒ `[inferred]`.
3. **`HYPOTHESIS — cần validate` phải kèm *điểm yếu đã biết***: hypothesis không nói được nó sai ở đâu thì spike không bác bỏ được nó, và nó sẽ tự động "đúng".

### 1.3 Quy tắc cấm nâng cấp

> [!WARNING]
> **Cấm bất kỳ tài liệu hạ nguồn nào trích dẫn một mục của file này như *"định nghĩa sản phẩm"*.**

Cụ thể:

- Tài liệu hạ nguồn (ADR, SDD, user story, test case, spec kỹ thuật) khi tham chiếu tài liệu này **phải mang theo nhãn gốc**. Trích `ACG-07` từ §2 mà bỏ nhãn `HYPOTHESIS — cần validate` là **vi phạm**, kể cả khi nội dung trích đúng nguyên văn.
- **Cấm `C4` (Spike Report) nâng hypothesis thành định nghĩa.** `C4` được phép phát biểu: *"hypothesis X **được dữ liệu ủng hộ / bị dữ liệu bác bỏ / không kết luận được**"*. `C4` **không** được phép phát biểu: *"Supported Execution Class **là** …"*, *"`Execution matched` **được định nghĩa là** …"*. Ranh giới giữa hai loại phát biểu này là ranh giới giữa `P0` và `P1`.
- **Cấm dùng bất kỳ mục nào của tài liệu này làm acceptance criteria của user story.** Ràng buộc này trùng với điều kiện gỡ `GATE-02` — story chỉ được viết bằng **định nghĩa đã chốt ở `D2`**.
- Con đường hợp lệ duy nhất để một hypothesis ở đây trở thành định nghĩa sản phẩm: **`GATE-06` → `D2`**. Không có đường tắt nào khác, kể cả khi spike cho kết quả rất đẹp.

### 1.4 Ba luật chống gian lận thống kê

Ba luật dưới đây là **nguyên tắc**; **cơ chế chi tiết nằm ở §4** (task `A4`). Nêu ở đây vì chúng ràng buộc cả §2 và §3, không riêng §4.

| Luật | Nội dung | Nó chặn hành vi gì |
|---|---|---|
| **L1 — Đóng băng** | Tập scenario được chọn **và** verdict kỳ vọng của từng scenario được **đóng băng tại `Gate A`**, tức **trước khi `C1` chạy dòng đầu tiên** | Chọn lại tập test sau khi đã nhìn thấy kết quả — cách rẻ nhất để một ngưỡng tự thoả mãn chính nó |
| **L2 — Bánh cóc một chiều** | Denominator chỉ được **co lại**, **không bao giờ nở ra**. Một scenario nằm **ngoài** denominator, **dù pass**, cũng **không** được kéo vào | Nhặt thêm scenario dễ vào mẫu số sau khi biết chúng pass — làm tỷ lệ tăng mà năng lực sản phẩm không đổi |
| **L3 — Báo cáo hai mẫu số** | Denominator co lại thì `C4` **phải in cả hai**: số gốc (đóng băng tại `Gate A`) **và** số đã co, kèm lý do co từng scenario | Giấu việc thu hẹp phạm vi — `≥ 80%` trên 5 scenario và trên 10 scenario là hai phát biểu khác nhau về sản phẩm |

> **Vì sao ba luật này phải nằm trong protocol chứ không nằm trong report**: `NFR-Repro` `ACG-02` nêu thẳng rằng *"một ngưỡng có thể tự thoả mãn bằng cách chọn lại tập test"*, và câu hỏi *"ai quyết định, quyết định lúc nào (trước hay sau khi biết kết quả)"* hiện **không có câu trả lời**. Đặt luật vào report là đặt luật **sau** khi kết quả đã biết — quá muộn để có tác dụng.

### 1.5 Ràng buộc thứ tự cứng

> [!CAUTION]
> **`C1` KHÔNG ĐƯỢC khởi động** trước khi cả **hai** điều kiện dưới đây được thoả:
>
> **(i)** Quyết định về **`GAP-Redis`** đã **thành văn bản trong §2** của tài liệu này — chọn tường minh một phương án, kèm lý do và kèm hệ quả lên denominator.
>
> **(ii)** **Known-Missing-Input Manifest** (định nghĩa tại [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md)) đã được **niêm phong**.

Lý do — không phải thủ tục hành chính: nếu chạy `C1` khi hai điều kiện chưa thoả, `C3` sẽ quy mọi scenario fail về *"non-determinism"* trong khi nguyên nhân thật là **thiếu capture đã biết trước**. Khi đó `GATE-06` được trả lời **sai bằng dữ liệu sai** — và không có cách nào phát hiện điều đó từ chính báo cáo, vì phần thiếu không được ghi ở đâu cả. Manifest tồn tại đúng để biến *"đã biết trước là thiếu"* thành **bằng chứng có ngày tháng**, chứ không phải một câu giải thích viết sau khi nhìn kết quả.

---

## 2. `ACG-07` — Supported Execution Class

> **Nhắc lại quy ước §1.2 quy tắc 1**: nhãn đi kèm **từng phát biểu**, **không** phủ cả mục — mục này **không** khai một nhãn mặc định. Mỗi phát biểu định nghĩa dưới đây mang nhãn `HYPOTHESIS — cần validate` **ngay tại điểm phát biểu**. Các nhãn `[stated §N]` / `[inferred]` ở cột *Nhãn* của mỗi bảng là nhãn của **căn cứ**, không phải nhãn của kết luận thuộc/không-thuộc class.

> **Quy ước ký hiệu — bắt buộc, để namespace `S` không mang hai nghĩa** (`[inferred]` — quy ước biên tập, không phải phát biểu định nghĩa):
>
> | Tiền tố | Nghĩa | Ở đâu |
> |:--:|---|---|
> | `S1`–`S7` | **Điều kiện thuộc class** | §2.2 |
> | `SC-1`…`SC-10` | **Scenario §22 của `RQ.md`** — trong văn xuôi viết *"scenario N"* thì đọc là `SC-N` | §22; áp dụng ở §3.10, §4 |
> | `SC-11` | **Probe Redis** — không phải scenario §22, không bao giờ nằm trong denominator | §2.5 |
>
> Trước vòng sửa này, probe được ký hiệu `S11` — trùng namespace với điều kiện class `S1`–`S7`. Không dùng `C1`–`C11` cho scenario vì `C1`–`C7` đã là task ID của [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md).

### 2.1 Vì sao mục này tồn tại và nó phải có ba phần

§20.1 là risk 🔴 Critical **số một** của `RQ.md`, và mitigation của nó là *"Limit the MVP to a **clearly defined class** of deterministic request/response executions"* `[stated §20.1]`. Class đó **không tồn tại ở bất kỳ đâu** trong `RQ.md` — đây đúng là nội dung của `ACG-07` tại [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 7. Hệ quả: **risk Critical #1 hiện chưa có mitigation thực thi được.**

`ACG-07` quy định định nghĩa phải có **ba phần**: (i) điều kiện đủ · (ii) điều kiện loại trừ · (iii) hành vi khi execution rơi ra ngoài class. Mục này viết đủ ba phần, và **thêm một trục loại trừ thứ hai** mà `ACG-07` không yêu cầu nhưng thiếu nó thì định nghĩa hở đúng chỗ `GAP-Redis` rơi vào (xem §2.4).

> **Phát biểu class** — `HYPOTHESIS — cần validate`:
>
> Một execution thuộc **Supported Execution Class** của Repro V0.1 khi và chỉ khi nó thoả **đồng thời** cả bảy điều kiện `S1`–`S7` (§2.2) **và** không rơi vào bất kỳ điều kiện loại trừ nào của **hai** trục ở §2.3 và §2.4.

### 2.2 (i) Điều kiện đủ — `S1`–`S7`

| ID | Điều kiện | Neo nguồn | Nhãn của căn cứ |
|:--:|---|---|---|
| **`S1`** | Execution bắt đầu bằng **đúng một inbound HTTP request** và kết thúc bằng **đúng một** kết cục: một HTTP response, hoặc một error/exception thoát ra ngoài handler | §5 (chuỗi `HTTP Request → … → Response`), §18 (*"Node.js + PostgreSQL + HTTP applications"*, `HTTP request replay`), §22 (`POST /checkout`) | Hình dạng `[stated §5]`, `[stated §18]`; việc dùng nó làm **điều kiện thuộc class** là `[inferred]` |
| **`S2`** | Execution **hoàn tất bên trong một process**. Mọi dependency nằm ngoài process được phục vụ bằng recorded value, không bằng lời gọi thật | §14 (microservices), §20.11 (replay boundary), §19 (`Distributed race-condition replay` ngoài phạm vi), §26 (`Multi-service replay` ở V0.3) | Ranh giới `[stated §20.11]`, `[stated §26]`; điều kiện class `[inferred]` |
| **`S3`** | **Mọi external input ảnh hưởng kết cục đều đi qua một interception point thuộc 8 nhóm capture của §18**: inbound HTTP request · stack trace · database query/result · external HTTP response · feature flag state · clock/timestamp · Git commit · runtime metadata | §18 *"MVP capabilities → Capture"* | §18 liệt kê **capability** `[stated §18]`; việc biến danh sách đó thành **điều kiện thuộc class** là `[inferred]` |
| **`S4`** | **Nguồn phi tất định giới hạn ở clock.** Randomness/UUID **treo** — xem `ACG-06`; execution phụ thuộc giá trị ngẫu nhiên **chưa** khẳng định được là thuộc class | §18 (`clock/timestamp` trong capture list), §20.2, [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D1.1` và `D1.4` | Clock `[stated §18]`; giới hạn *"chỉ clock"* `[inferred]`; treo randomness `[stated §20.2]` (*"where practical"*) |
| **`S5`** | Kết cục **không phụ thuộc thời điểm tương đối giữa các execution**. Bất đồng bộ **bên trong một** execution (`Promise.all`, `await`, callback, microtask) **vẫn thuộc class** | §20.13 (hoãn race condition), §19, §22 (tách `9. Async behavior` khỏi `10. Race condition`), [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D1.3`/`D2.2`/`D3` | Hoãn race `[stated §20.13]`; **đường ranh** giữa async-trong-execution và race-giữa-execution là phần `ADR-010 D3` tự khai là *"phần ADR này thêm vào"* ⇒ `[inferred]` |
| **`S6`** | **Mọi interaction có khả năng ghi phân loại được** theo quy tắc **fail-closed**: interaction nào **không chứng minh được là READ** thì bị xử như WRITE và bị chặn | §13 (hai danh sách READ/WRITE), §20.4 (*"Default-deny write behavior"*), [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `Decision 2` | §13 là **danh sách ví dụ**, không phải quy tắc toàn phần — đúng nội dung `ACG-09` ⇒ quy tắc fail-closed là `[inferred]` (nguồn: `ADR-005`) |
| **`S7`** | **Ổn định dưới phép lặp**: replay cùng một capsule, cùng code, lặp `K` lần cho **cùng một kết quả** | `U-25` — [SDD-Repro](./Architecture/SDD-Repro.md) §8.2 (✅ CHỐT `GATE-01`, 2026-08-14: *"nếu bản thân replay không tất định thì mọi kết luận equivalence đều rỗng"*) | `[inferred]` — `RQ.md` **không đặt câu hỏi này**; `U-25` là phần `SDD` thêm vào |

> **Vì sao `S7` phải có mặt.** `S1`–`S6` đều là điều kiện **khai báo được** nhưng **không kiểm được** trong một lần chạy: chúng nói về hình dạng và về những gì execution *không* phụ thuộc, mà sự vắng mặt của một phụ thuộc thì không quan sát trực tiếp được. `S7` là điều kiện duy nhất có **phép thử chạy được** trên chính spike. Không có nó, Supported Execution Class là **một lời tuyên bố không có phép thử** — đúng lỗi mà `ACG-07` đang tố cáo ở §20.1.
>
> Giá trị `K` **không** thuộc tài liệu này — nó là tham số đo, thuộc [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) (task `A5`). Ở đây chỉ ràng buộc: `K > 1`, và verdict của một scenario chỉ được coi là đạt khi **cả `K` lần** đều cho cùng kết quả (fail-closed).

### 2.3 (ii-a) Loại trừ — trục 1: đối chiếu 9 nhóm hidden input của §20.1

§20.1 liệt kê 9 nhóm hidden input `[stated §20.1]` và chỉ nói *"If these are not captured, replay may fail"* — **không** nói execution có chúng thì thuộc hay không thuộc class. Bảng dưới đây là phần tài liệu này thêm vào.

Cột *Cơ chế phát hiện* chỉ được điền bằng **một trong ba** cơ chế thực sự tồn tại ở `P0-B`; không có cơ chế thứ tư nào được bịa ra:

- **`M-cap`** — nhóm này **được capture** tại một interception seam thuộc 8 nhóm §18.
- **`M-rep`** — nhóm này **lộ ra qua phép lặp** (`S7` / `U-25`): hai lần replay cho kết quả khác nhau.
- **`M-scope`** — nhóm này **được một phát biểu phạm vi tường minh của `RQ.md` loại trừ**, nên không cần phát hiện: nó bị loại **trước** khi chạy, bằng văn bản có thẩm quyền.

| # | Nhóm hidden input §20.1 | Thuộc class? | Cơ chế phát hiện | Ghi chú |
|:--:|---|:--:|:--:|---|
| 1 | **Environment variables** | ❌ Ngoài | 🔴 **KHÔNG CÓ** | Không seam nào của §18 chạm tới; không lộ qua lặp (env ổn định giữa các lần replay) |
| 2 | **Filesystem state** | ❌ Ngoài | 🔴 **KHÔNG CÓ** | Cùng lý do; đọc file cấu hình/template không đi qua seam nào |
| 3 | **Randomness** | ⏸️ **TREO** | 🟡 `M-rep` (một phần) | Phụ thuộc `ACG-06` (*"UUID capture where practical"* — một **miễn trừ**, không phải tiêu chí). Chỉ lộ qua lặp **khi** giá trị ngẫu nhiên chạm boundary hoặc đổi kết cục |
| 4 | **System clock** | ✅ **Trong** | 🟢 `M-cap` | §18 có `clock/timestamp`; replay trả recorded time ([ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D1.1`). Ngữ nghĩa cụ thể: `U-13`, đóng ở [§3.8](#38-u-13--ngữ-nghĩa-clock-lúc-replay-hypothesis) |
| 5 | **Process state** | ❌ Ngoài | 🔴 **KHÔNG CÓ** | Module-level cache, memoization, độ ấm của connection pool. **Đây là cùng lớp vấn đề với Redis**, chỉ khác là nó nằm **bên trong** process ⇒ ngay cả phát biểu loại trừ ở §2.4 cũng không với tới |
| 6 | **Concurrency** | ⚖️ **Tách đôi** | 🟢 `M-scope` cho phần ngoài | Async **trong một** execution: **trong** class (`S5`, `ADR-010 D1.3`) — nhưng thừa hưởng `U-20` (chưa đóng). Race **giữa các** execution: **ngoài** class, loại bởi §20.13/§19/§26 |
| 7 | **Network behavior** | ⚠️ **Một phần** | 🟡 `M-cap` (một phần) | Phần biểu hiện thành **external HTTP response** thì §18 capture được. Phần ở tầng transport (timeout, retry, reset kết nối) **không** có seam nào — phần đó **ngoài** class |
| 8 | **OS behavior** | ❌ Ngoài | 🔴 **KHÔNG CÓ** | Không seam, không lộ qua lặp trên cùng một máy |
| 9 | **Background jobs** | ❌ Ngoài | 🟢 `M-scope` | §26 đặt `Background jobs` ở **V0.3** `[stated §26]`. Nhóm này **xuất hiện trên cả hai trục** — xem ghi chú cuối §2.4 |

> [!WARNING]
> ### 🔴 Bốn nhóm bị loại trừ BẰNG LỜI KHAI, KHÔNG BẰNG PHÉP KIỂM
>
> **`Environment variables` · `Filesystem state` · `Process state` · `OS behavior`** — bốn nhóm này **không có cơ chế phát hiện nào** ở `P0-B`. Không `M-cap`, không `M-rep`, và cũng **không** `M-scope`: `RQ.md` §20.1 nêu tên chúng nhưng **không có phát biểu phạm vi nào loại chúng ra**.
>
> Nghĩa là: khi Supported Execution Class tuyên bố *"execution phụ thuộc bốn nhóm này nằm ngoài class"*, tuyên bố đó **không kiểm chứng được từ bên trong spike**. Nếu một scenario của spike **thực sự** phụ thuộc một trong bốn nhóm mà không ai biết, spike sẽ ghi nhận `diverged` hoặc — nguy hiểm hơn — ghi nhận `matched` mà không ai phát hiện giả định đã bị vi phạm.
>
> **Ba hệ quả bắt buộc, không phải khuyến nghị:**
>
> 1. Đây chính là **điểm yếu đã biết** mà §1.2 quy tắc 3 đòi hỏi cho hypothesis `ACG-07`. Nó được công bố **ở đây**, trước khi spike chạy — không phải phát hiện muộn ở `C4`.
> 2. Bốn nhóm này **phải xuất hiện trong Spike Report như một giới hạn đã công bố**, kèm nguyên văn *"loại trừ bằng lời khai, không bằng phép kiểm"*.
> 3. Bốn nhóm này **phải nằm trong Known-Missing-Input Manifest** của từng scenario (§2.5).
>
> `U-24` ([SDD-Repro](./Architecture/SDD-Repro.md) §8.3 — *cơ chế phát hiện "execution này nằm ngoài phạm vi determinism"*) **vẫn `TBD`**. Khối `class_assessment` ở §2.6 là một **đề xuất** cơ chế cho `U-24`, chưa phải câu trả lời của nó.

### 2.4 (ii-b) Loại trừ — trục 2: dependency nằm ngoài 8 nhóm capture của §18

Trục này **không có trong `ACG-07`** và không có trong `RQ.md`. Nó được thêm vào vì trục 1 **không phủ được `GAP-Redis`**: Redis không nằm trong 9 nhóm §20.1 — nó là một dependency **được đặt tên tường minh** mà §18 **chủ động không capture** và §26 đẩy sang V0.3. Đó là lý do không cơ chế nào của trục 1 tự bắt được nó.

> **Phát biểu loại trừ gọn** — `HYPOTHESIS — cần validate`, `[inferred]`:
>
> **Một execution nằm ngoài Supported Execution Class nếu kết cục của nó phụ thuộc một dependency không thuộc 8 nhóm capture của §18.**

Phát biểu trên phủ được cả lớp; bảng dưới chỉ là các thể hiện đã biết tên tại thời điểm viết:

| Dependency | Neo loại trừ | Nhãn |
|---|---|---|
| **Redis / cache** | §18 capture list không có; §26 đặt `Redis` ở **V0.3**; `E1` tại [SDD-Repro](./Architecture/SDD-Repro.md) §3.2 và `C-03` tại [Risk-Register](../010-Planning/Risk-Register.md) đã chốt *"Redis ngoài V0.1"* | `[stated §18]`, `[stated §26]` |
| **Kafka / message queue** | §19 loại `Kafka replay` khỏi V0.1; §26 đặt `Kafka` ở V0.3 | `[stated §19]`, `[stated §26]` |
| **Background jobs** | §26 đặt `Background jobs` ở V0.3 | `[stated §26]` |
| **Browser state** | §19 loại `Browser replay`; §26 đặt `Browser replay` ở V0.2 | `[stated §19]`, `[stated §26]` |
| **Egress phi-HTTP** (gRPC, socket thô, driver có transport riêng) | §18 chỉ capture `external HTTP response`; [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `L2` xác nhận đây là vùng `L1` **không nhìn thấy** | `[inferred]` — `RQ.md` không nêu nhóm này |
| **Database khác PostgreSQL** | §18 `Target` = *"Node.js + PostgreSQL + HTTP applications"* | `[stated §18]` |

> **Hai trục khác nhau về bản chất, đừng gộp.** Trục 1 nói về **hidden input** — thứ `RQ.md` thừa nhận là có thể tồn tại mà chưa ai chỉ ra được cách phát hiện. Trục 2 nói về **dependency đã có tên, đã được quyết định là không capture ở V0.1**. `Background jobs` xuất hiện trên **cả hai** trục vì nó vừa là hidden input (§20.1 nhóm 9) vừa là dependency được đặt tên và hoãn (§26 V0.3) — không phải trùng lặp biên tập.
>
> **`GAP-Redis` không phải ca cá biệt.** Nó là **thể hiện đầu tiên bị phát hiện** của một lớp rộng hơn, mà `process state` (trục 1, nhóm 5) là thể hiện **nguy hiểm hơn** vì nó nằm trong process nên ngay cả phát biểu loại trừ ở trên cũng không với tới.

### 2.5 Quyết định `G1` — `GAP-Redis`

> ✅ **ĐÃ CHỐT — `@TrisJr`, 2026-08-15 — quyết định `G1`**: `GAP-Redis` chọn **(c) + phần định nghĩa của (a)**.
>
> - **Phần (c)** — *hiện thực trong test app*: test app của `B1` vẫn đủ 5 dependency như §22 liệt kê, nhưng **Redis được thiết kế để không ảnh hưởng kết cục** của execution được capture. Phần này thuộc exit criteria của `B1`, **không** thuộc tài liệu này.
> - **Phần (a)** — *định nghĩa*: thuộc về §2.4 này, và được phát biểu như sau.

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> **Một execution mà kết cục phụ thuộc `cache state` nằm ngoài Supported Execution Class.**

**Vì sao (c) chứ không phải (b) — lý do quyết định là tính chuyển giao của bằng chứng**: `GATE-06` là cổng quyết định có xây V0.1 hay không, mà V0.1 có **8 nhóm capture**. Phương án (b) — capture Redis như throwaway — sẽ đo một hệ thống **9 nhóm** rồi dùng con số đó phán quyết một sản phẩm **8 nhóm**. Đây là lỗi **hiệu lực đo lường**, và nó tệ hơn (c) ở một điểm quyết định: khuyết điểm của (b) **vô hình trong báo cáo** vì nó nằm bên trong chính con số. Khuyết điểm của (c) **nêu tên được và báo cáo được** — nó trở thành một điều khoản loại trừ **công bố trước**, đúng thứ §20.1 yêu cầu.

**Hai ràng buộc bắt buộc đi kèm — thiếu một trong hai thì `G1` không còn đúng:**

| ID | Ràng buộc | Vì sao không thoả hiệp được |
|:--:|---|---|
| **`R1`** | **CẤM thêm hook Redis ở *một* phía.** Không được instrument Redis ở phía capture mà không có ở phía replay, hoặc ngược lại | Một hook lệch tạo ra interaction chỉ tồn tại ở một bên ⇒ dãy đơn vị so sánh (§3.1) khác độ dài ⇒ **cả 10 scenario** ra `diverged` với nguyên nhân `incomplete-capture` **giả**. Kết quả spike khi đó là rác, và rác đó **trông giống một phát hiện thật** |
| **`R2`** | **Cách dùng Redis ở `B1` phải chịu được việc bị `B5` chặn hoặc vắng mặt.** Nếu Redis bị thiếu hoặc bị egress-block chặn, execution vẫn phải đi tới cùng một kết cục | Sau bước *"Destroy original environment"* của §22, Redis production **không còn tồn tại**. Và [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `L2` chặn egress ở mức process với allowlist chỉ gồm loopback + replay proxy ⇒ lời gọi Redis ra ngoài **sẽ** bị chặn. `R2` không phải phòng xa; nó là hệ quả trực tiếp của hai quyết định đã có |

**Known-Missing-Input Manifest — điều kiện tiên quyết của `C1`:**

Với **từng** scenario, **trước khi `C1` chạy**, phải dựng và **niêm phong** một manifest liệt kê mọi input **đã biết trước là không được capture**. Thứ tự bắt buộc có mặt: **Redis / cache state** đứng đầu, cộng **filesystem state**, **environment variables**, **process state** (ba nhóm thuộc cảnh báo 🔴 §2.3).

> Manifest tồn tại để biến *"đã biết trước là thiếu"* thành **bằng chứng có ngày tháng**, chứ không phải một câu giải thích viết sau khi nhìn kết quả — đây chính là điều kiện (ii) của [§1.5](#15-ràng-buộc-thứ-tự-cứng).
>
> **Cơ chế** của manifest (format, nơi lưu, ai niêm phong, cách xác minh niêm phong) thuộc [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §6. Theo ranh giới ở §1.1, tài liệu này chỉ phát biểu **yêu cầu**, không lặp lại cơ chế.

**Probe `SC-11` — kiểm chính thủ tục quy trách nhiệm:**

| Thuộc tính | Nội dung |
|---|---|
| **Là gì** | Một execution **cố tình được thiết kế để phụ thuộc Redis state** — tức cố tình nằm **ngoài** Supported Execution Class theo phát biểu §2.4 |
| **Vị trí trong phép đo** | **NGOÀI denominator — theo cấu tạo.** `SC-11` chưa bao giờ nằm trong tập scenario đóng băng ở `Gate A`, nên việc nó ở ngoài **không** phải một lần co mẫu số và **không** kích hoạt `L2`/`L3` của §1.4 |
| **Mục đích phụ** | Định lượng cái giá của việc loại `cache state` khỏi class |
| **Mục đích chính** | **Kiểm chính thủ tục quy trách nhiệm ở [§3.6](#36-thủ-tục-quy-trách-nhiệm-divergence--khớp-đầu-tiên-thắng).** `SC-11` **phải** ra `diverged` với nguyên nhân **`incomplete-capture`**, **không** phải `out-of-scope-determinism` |
| **Điều kiện hành động** | Ra sai nhãn ⇒ **rubric có lỗi**, phải sửa **trước khi `C3` chạy**. Không được ghi chú lại rồi chạy tiếp |

> **Vì sao đúng cặp nhãn đó mới đúng.** Redis vắng mặt là **một input đã biết trước là không được ghi** — lỗi thuộc về phạm vi capture của Repro, tức `incomplete-capture`. Nếu thủ tục trả về `out-of-scope-determinism`, nó đang nói *"execution này phi tất định"* — một lời quy trách nhiệm **sai địa chỉ**, và là đúng loại sai lệch sẽ khiến `C3` đọc nhầm nguyên nhân trên **mọi** scenario khác. `SC-11` là phép thử rẻ nhất phát hiện được sai lệch đó **trước** khi nó lan.
>
> **`SC-11` KHÔNG kích hoạt được bước 4 của [§3.6](#36-thủ-tục-quy-trách-nhiệm-divergence--khớp-đầu-tiên-thắng), và đó là lý do phép thử này chạy được** (`[inferred]`, phân tích ghi tại §3.6): lời gọi Redis hỏng **ổn định** — Redis production đã bị destroy ở bước *"Destroy original environment"* §22, và allowlist egress của [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `L2` là **tĩnh** ⇒ `K = 3` lần replay cho **cùng** verdict, cùng điểm phân kỳ. Điều kiện quan sát của bước 4 (*`K` lần cho **khác** verdict*) **sai** ⇒ bước 4 không khớp **dù nó đứng ở vị trí nào** trong thứ tự.

### 2.6 (iii) Hành vi khi execution rơi ra ngoài class — ba thời điểm, ba hành vi

| Thời điểm | Hành vi | Căn cứ |
|---|---|---|
| **Capture** | ✅ **VẪN CAPTURE**, đầy đủ như execution trong class, **cộng** một khối `class_assessment` ghi vào capsule | Lỗi **đã xảy ra rồi**. Từ chối capture là **phá huỷ bằng chứng duy nhất** về một sự cố production, để đổi lấy một con số đẹp hơn. §33.5 (*"Determinism over magic — the system should explain exactly what was captured and replayed"*) đòi ghi lại, không đòi im lặng `[stated §33]` |
| **Replay** | ✅ **VẪN CHẠY** — không crash, **không** fallback gọi hệ thống thật. Nhưng **verdict bị chặn trần**: kết quả **không bao giờ** được in ra là `Execution matched` trơn | [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D1` (kết quả của một reproduction thất bại vẫn *"hoàn tất và có giá trị"*; `Could not reproduce.` không phải output hợp lệ) và `D4` (thiếu input ⇒ divergence + `incomplete-capture`, **không** crash, **KHÔNG** fallback — fallback sẽ gọi hệ thống thật bằng dữ liệu production, phá [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md)) |
| **Đếm metric** | ⛔ **LOẠI khỏi denominator**, và việc loại phải được **công bố TRƯỚC khi chạy** | [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) §Consequences cảnh báo thẳng: `≥80%` (§24) *"có thể được làm đẹp bằng cách thu hẹp phạm vi"*, vì chính `D1`/`D2` quyết định cái gì là *"meaningful deterministic"*. Ràng buộc `L1`/`L2`/`L3` ở §1.4 áp đầy đủ; quy tắc denominator thuộc §4 |

**Khối `class_assessment` — nội dung tối thiểu** (`[inferred]` — `RQ.md` không quy định; đây là đề xuất cơ chế cho `U-24`):

- Execution **thuộc hay không thuộc** class, và **điều kiện nào** trong `S1`–`S7` không thoả.
- Nếu bị loại: **trục nào** loại nó — trục 1 (§2.3, ghi rõ nhóm §20.1) hay trục 2 (§2.4, ghi rõ tên dependency).
- **Cơ chế** nào phát hiện: `M-cap` / `M-rep` / `M-scope` / **không cơ chế nào — kết luận đến từ lời khai**.

> [!CAUTION]
> **KHÔNG có phương án "capture im lặng".**
>
> Một capsule được ghi mà **không** mang theo đánh giá về việc nó có thuộc class hay không là một artifact **trông giống hệt** capsule hợp lệ. Nó sẽ được replay, được chấm điểm, và được đưa vào một con số — mang theo một giả định đã bị vi phạm mà không ai đọc được từ chính artifact đó.
>
> Phương án này bị loại **ở tầng nguyên tắc**, không phải tầng kỹ thuật: §33.5 *"Determinism over magic — The system should explain exactly what was captured and replayed"* `[stated §33]`. Một hệ thống không nói được nó **không** capture cái gì thì không thoả nguyên tắc đó, dù nó có nói đúng mọi thứ nó **đã** capture.

### 2.7 Điểm yếu đã biết của hypothesis `ACG-07`

Bắt buộc theo §1.2 quy tắc 3 — hypothesis không nói được nó sai ở đâu thì spike không bác bỏ được nó, và nó sẽ tự động "đúng".

| # | Điểm yếu | Mức |
|:--:|---|:--:|
| **`E-A`** | **Bốn nhóm loại trừ bằng lời khai** (§2.3). Đây là điểm yếu nặng nhất: một phần của class **không kiểm chứng được từ bên trong spike** | 🔴 |
| **`E-B`** | **`S4` treo randomness.** `ACG-06` chưa đóng ⇒ scenario 7 (Randomness) chưa khẳng định được thuộc hay không thuộc class ⇒ nằm ngoài denominator | 🟠 |
| **`E-C`** | **`S5` thừa hưởng `U-20`.** Async trong một execution *thuộc* class, nhưng cách so sánh thứ tự async (`U-20`) chưa đóng ⇒ `S5` đúng về phạm vi mà chưa đủ để chấm điểm scenario 9 | 🟠 |
| **`E-D`** | **`S7` chưa có `K`.** `K` thuộc `A5`; trước khi `K` được chốt, `S7` là điều kiện **có phép thử nhưng chưa có tham số** | 🟠 |
| **`E-E`** | **Trục 2 đánh đổi phạm vi lấy tính chuyển giao của bằng chứng.** Loại `cache state` khỏi class khiến kết luận của spike **không nói gì** về lớp execution phụ thuộc cache — một lớp phổ biến trong ứng dụng thật. `SC-11` định lượng cái giá này, nhưng không xoá nó | 🟠 |
| **`E-F`** | **`U-24` chưa có câu trả lời.** Khối `class_assessment` là **đề xuất**, chưa được validate; nếu nó không dựng được ở `P0-B` thì hành vi (iii) ở dòng *Capture* mất cơ chế thực thi | 🟠 |

---

## 3. `ACG-01` — Định nghĩa vận hành execution path và rubric

> **Nhắc lại quy ước §1.2 quy tắc 1**: nhãn đi kèm **từng phát biểu**, **không** phủ cả mục — mục này **không** khai một nhãn mặc định. Mỗi phát biểu định nghĩa dưới đây mang nhãn `HYPOTHESIS — cần validate` **ngay tại điểm phát biểu**. Nhãn `[stated §N]` / `[inferred]` ở các bảng là nhãn của **căn cứ**.

### 3.1 Đơn vị so sánh của *"execution path"*

`ACG-01` chỉ ra rằng `RQ.md` §10 dùng ký hiệu `A → B → C` mà **không định nghĩa `A`, `B`, `C` là gì** — bốn cách hiểu (function call · code line · tracing span · chuỗi interaction với dependency) cho **bốn hệ thống khác nhau hoàn toàn** `[stated §10]` là ký hiệu, phần còn lại là khoảng trống.

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> **Một đơn vị của execution path là một `interaction` đã đi qua interception layer** — tức một lời gọi mà Repro đã chặn được tại một trong 8 nhóm capture của §18.
>
> Cộng thêm **hai đơn vị neo** bắt buộc, luôn có mặt ở đầu và cuối dãy:
>
> | Neo | Là gì | So như thế nào |
> |:--:|---|---|
> | **`U0`** | **Inbound HTTP request đã chuẩn hoá** — method, route template, header đã lọc, body ở canonical form | Exact sau normalization |
> | **`U∞`** | **Kết cục** — HTTP response thoát ra, hoặc exception thoát ra khỏi handler | **So bằng danh tính loại**, **KHÔNG** so stack trace |

**Vì sao `U∞` chỉ so danh tính loại**: [ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) `A3` ghi rõ *"stack trace dịch chuyển theo **mọi** thay đổi code — đúng use case chính (§8 bước 4)"*. Dùng stack trace làm tiêu chí sẽ khiến mọi replay sau khi developer sửa một dòng đều `diverged`.

**Vì sao `U0` và `U∞` phải là đơn vị, không phải phần phụ**: `ADR-006` `A2` loại *"chỉ so output"* làm tiêu chí **duy nhất** nhưng giữ nó *"làm tín hiệu sàn"*. Đưa chúng vào dãy đơn vị là cách hiện thực đúng câu đó — chúng không thay thế chuỗi interaction, chúng **đóng khung** nó ở hai đầu.

**Ba ứng viên còn lại bị loại, có neo:**

| Ứng viên | Lý do loại | Neo |
|---|---|---|
| **Syscall / instruction trace** | Chi phí ở mức một công cụ hệ thống, đòi can thiệp runtime/kernel | [ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) `A4` loại tường minh, viện §20.7 (overhead production), §20.15 (scope explosion — `Container runtime`), §20.14 (adoption phải ở mức `npm install` + `repro.init()`) |
| **Function call / code line** | Đòi **instrument mới ở production** — bản ghi tham chiếu phải được tạo ra tại production, va thẳng §20.7 (*"Repro must never become the reason production becomes slower or fails"*) | `ADR-006` §Consequences (*"Mọi tín hiệu ở tầng path đều tốn instrumentation ở production"*); `A5` (coverage) vẫn là ứng viên mở của `U-04` nhưng cùng vấp ràng buộc này |
| **Tracing span** | §26 đặt `Distributed tracing` ở **V0.3** `[stated §26]` — không có ở V0.1 để mà so | §26; §20.13 cũng đẩy hướng này về tương lai |

> **Ưu điểm quyết định của lựa chọn này**: nó **chỉ dùng thứ Repro đã chặn được** theo [ADR-003](./Architecture/ADR-003-Database-Record-Replay-Not-Snapshot.md) và [ADR-004](./Architecture/ADR-004-Record-Replay-External-Inputs-At-Boundary.md). Không cần một cơ chế mới nào ở `P0-B`. Đây đúng là ứng viên `(a)` của `U-04` và `A6` của `ADR-006` — **cả hai đều ghi *"chưa được chọn"***; tài liệu này chọn nó **ở dạng hypothesis**, không phải chốt.

### 3.2 Tập field đưa vào so sánh

Mỗi đơn vị là một bản ghi có các field dưới đây. Cột *Vào so sánh?* là phần `ACG-01` yêu cầu mục 2 (*"định nghĩa tập field, và với mỗi field: exact hay tolerant"*).

| Field | Nghĩa | Vào so sánh? | Exact / tolerant |
|---|---|:--:|---|
| `kind` | Loại interaction: `inbound-http` · `db-query` · `outbound-http` · `feature-flag` · `clock` | ✅ | **Exact** sau normalization |
| `target` | Định danh đích: **SQL fingerprint** · **URL path template** · tên feature flag | ✅ | **Exact** sau normalization |
| `arguments` | Tham số đã chuẩn hoá: bind parameter, query string, request body | ✅ | **Exact** sau normalization |
| `direction` | `READ` / `WRITE` theo quy tắc **fail-closed** của `ACG-09` + [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) | ✅ | **Exact** |
| `result` | Giá trị trả về đã chuẩn hoá (DB result, HTTP response body, flag state, **giá trị clock đã đọc**) | ✅ | **Exact** sau normalization |
| `outcome` | Chỉ ở `U∞`: danh tính **loại** của response/exception | ✅ | **Exact** |
| `ordinal` | Vị trí của đơn vị trong dãy | ✅ | 🟡 **Tolerant** — xem §3.3, quy tắc nhóm đồng thời |
| `timestamp` **quan sát** | Thời điểm wall-clock của **máy đang chạy** khi interaction xảy ra | ❌ | Loại — khác nhau ở mọi lần chạy, không mang thông tin về execution |
| `latency` / `duration` | Thời gian thực thi của interaction | ❌ | Loại — thuộc tính của máy, không của execution |
| `connection id` / socket / pool handle | Định danh kết nối | ❌ | Loại — thuộc tính hạ tầng |
| `stack trace` | Ngăn xếp tại điểm gọi | ❌ | Loại — `ADR-006 A3`: dịch chuyển theo mọi thay đổi code |
| Thứ tự key trong JSON | — | ❌ | Loại — bị canonical form triệt tiêu trước khi so |
| Field **đã redact** | Field mà redaction gate đã thay đổi giá trị | ⚠️ **Có, nhưng so bằng MARKER** | So sự **có mặt của marker**, không so giá trị. Neo: [ADR-002](./Architecture/ADR-002-Repro-Capsule-Format-Contract.md) đã chốt *capsule ghi lại field nào đã bị redact* |
| Giá trị **sinh ngẫu nhiên** (UUID, random) | — | ⏸️ **TREO** | **Phụ thuộc `ACG-06`.** Chưa quyết được là input đã capture hay nguồn phi tất định ⇒ **không** viết quy tắc ở đây |

**Bốn phép normalization** (`[inferred]` — `RQ.md` không quy định):

1. **SQL → fingerprint**: literal được thay bằng placeholder; khoảng trắng và chữ hoa/thường chuẩn hoá. Giá trị literal đi vào `arguments`, không đi vào `target`.
2. **URL → path template + canonical query**: `/users/7731` → `/users/:id`; query string sắp thứ tự.
3. **JSON → canonical form**: key sắp thứ tự, khoảng trắng loại bỏ.
4. **Field đã redact → marker**: giá trị thật bị thay bằng một marker ổn định; hai bên so marker với marker.

> ⚠️ **Phép 1 và 2 đứng trên `U-02` — rủi ro hiện thực cao nhất của cả thiết kế** ([SDD-Repro](./Architecture/SDD-Repro.md) §4.4). Định danh query để match lúc replay **chưa được chốt** (4 phương án, không phương án nào được chọn). Rubric này thừa hưởng nguyên vẹn độ giòn đó — xem `W2` ở §3.11.
>
> ⚠️ **Giá trị clock đã đọc là `result` của một đơn vị `kind = clock`, KHÔNG tolerant.** Nó là **input đã capture** theo §18, không phải một đại lượng đo được phép sai số. Đừng nhầm nó với `timestamp` quan sát ở dòng bị loại phía trên. Ngữ nghĩa cấp phát giá trị này: §3.8.

### 3.3 Exact hay tolerant — tolerance được hiện thực bằng cái gì

> **Phát biểu then chốt** — `HYPOTHESIS — cần validate`:
>
> *"Sufficiently equivalent"* được vận hành hoá thành **exact trên một tập field đã bị thu hẹp có chủ đích** — **KHÔNG** phải *"khớp ≥ X%"*.
>
> **Tolerance = normalization + quan hệ tương đương. KHÔNG phải ngưỡng phần trăm, KHÔNG phải epsilon, KHÔNG phải sai số mili giây.**

**Vì sao không có ngưỡng phần trăm — đây là lý do phải nói thẳng**: một ngưỡng dạng *"khớp ≥ 90% thì kết luận `matched`"* sẽ **dựng lại đúng cái false confidence mà §20.3 tồn tại để chặn**. §20.3 `[stated §20.3]`: *"A replay may complete successfully while following a different execution path. This creates false confidence."* Nếu 90% đơn vị khớp mà 10% lệch nằm đúng ở nhánh gây bug, kết luận `matched` không chỉ sai — nó **sai theo hướng nguy hiểm nhất**, vì nó cấp một chứng nhận cho đúng thứ chưa được kiểm chứng.

**Ba quan hệ tương đương được dùng thay cho ngưỡng số:**

| Quan hệ | Áp cho | Nội dung |
|---|---|---|
| **Nhóm đồng thời so như TẬP** | `ordinal` | Các interaction được phát ra song song trong cùng một nhóm đồng thời (`Promise.all`, các `await` không phụ thuộc nhau) so như **tập** (set equality); **giữa các nhóm** vẫn so như **dãy**. Neo: `U-20` ([ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) §Open items — *"so sánh chuỗi ngây thơ sẽ gọi những replay đúng là diverged"*) |
| **Marker tương đương marker** | Field đã redact | Hai giá trị đều mang marker ⇒ coi là bằng nhau. Không có quan hệ này, redaction sẽ tự sinh ra divergence do chính Repro gây ra ([ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D3`, `U-15`) |
| **Canonical form** | `target`, `arguments`, `result` | Hai giá trị chuẩn hoá về cùng dạng ⇒ bằng nhau, dù biểu diễn thô khác nhau |

> **Cách xác định ranh giới của một nhóm đồng thời chưa được chốt** — nó là `U-20`, vẫn `SPIKE`. Tài liệu này phát biểu **quan hệ so sánh**, không phát biểu cơ chế nhận diện nhóm. Xem `W3` ở §3.11.
>
> **Không có epsilon cho số thực, không có tolerance mili giây cho timestamp.** Không nguồn nào cấp con số đó, và bịa một con số ở đây sẽ khiến `C3` đo một thứ do tài liệu này tưởng tượng ra. **`TBD`** — nếu spike phát hiện cần một quan hệ tương đương cho số thực, `C4` báo cáo dữ liệu, `D2` quyết định.

### 3.4 Ngưỡng nhị phân — điều kiện của `Execution matched`

> **`HYPOTHESIS — cần validate`**:
>
> Verdict là **`Execution matched`** khi và chỉ khi **cả ba** điều kiện dưới đây đúng:
>
> 1. **Bằng độ dài**: dãy đơn vị của production và của local có **cùng số đơn vị** sau normalization (một nhóm đồng thời tính là **một** đơn vị).
> 2. **Mọi đơn vị bằng nhau**: với mọi vị trí `i`, đơn vị thứ `i` của hai bên bằng nhau trên toàn bộ tập field *Vào so sánh = ✅* ở §3.2, theo ba quan hệ tương đương ở §3.3.
> 3. **Hai neo bằng nhau**: `U0` bằng `U0`, và `U∞` bằng `U∞`.
>
> Ngược lại — **bất kỳ điều kiện nào trong ba điều kiện trên không thoả** — verdict là **`Execution diverged`**, kèm **chỉ số của đơn vị phân kỳ ĐẦU TIÊN**.

**Không có trạng thái thứ ba ở tầng rubric.** Điều kiện 3 là dư thừa về mặt logic nếu điều kiện 2 đã phủ hai neo, nhưng nó được viết tách ra có chủ đích: `U0` và `U∞` là **hai đơn vị mà rubric không bao giờ được phép bỏ qua**, kể cả khi một hiện thực tương lai thu hẹp tập interaction ở giữa.

**Chỉ số đơn vị phân kỳ đầu tiên là output bắt buộc**, không phải tuỳ chọn: [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D2` đòi *"danh sách divergence được đánh số, thứ tự ổn định và tái lập được"*, và `D1` đặt Execution Diff là **kết quả hạng nhất** — `Could not reproduce.` không phải output hợp lệ của V0.1 `[stated §9]`.

### 3.5 `inconclusive` là một CỔNG đứng TRƯỚC rubric, không phải verdict thứ ba

```text
[Tầng 1 — GATE lớp]
Execution có thuộc Supported Execution Class (§2) không?
   │
   ├─ KHÔNG, hoặc KHÔNG KIỂM ĐƯỢC
   │     → verdict = inconclusive
   │     → KHÔNG chạy rubric §3.4
   │     → loại khỏi denominator (§2.6)
   │
   └─ CÓ
         │
         ▼
[Tầng 2 — RUBRIC §3.4]
   → Execution matched   ⟺ ba điều kiện §3.4 đều đúng
   → Execution diverged  ⟺ ngược lại   ← NHỊ PHÂN TUYỆT ĐỐI
                                          + chỉ số đơn vị phân kỳ đầu tiên
                                          + nguyên nhân theo §3.6
```

> **Cách đặt hai tầng này giải một mâu thuẫn tưởng như không gỡ được.** Exit criteria của `A3` đòi rubric cho **kết luận nhị phân**; [ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) `Decision 7` đòi *"kết quả không kết luận được phải hiện ra như một trạng thái riêng, không được gộp vào matched hay diverged"* (§33.5). Hai yêu cầu này **chỉ mâu thuẫn khi `inconclusive` được đặt cùng tầng với hai verdict kia**. Đặt nó làm **cổng đứng trước**, cả hai đều được thoả nguyên vẹn: rubric vẫn nhị phân tuyệt đối, và trạng thái không kết luận được vẫn hiện ra riêng.
>
> **Hệ quả vận hành**: `inconclusive` **không bao giờ** là kết quả của việc chạy rubric. Nếu một hiện thực trả `inconclusive` **sau** khi đã so sánh, đó là **lỗi hiện thực** — cổng đã bị đặt sai chỗ.

### 3.6 Thủ tục quy trách nhiệm divergence — khớp đầu tiên thắng

> [!IMPORTANT]
> **Mục này là chủ sở hữu DUY NHẤT của thủ tục quy trách nhiệm.** Không tài liệu nào khác được tự định nghĩa thứ tự các bước. [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7 là **bảng vận hành** của chính thủ tục này — nó nói *"chạy như thế nào tại `C3`"*, **không** nói *"thứ tự là gì"*. Xung đột giữa hai tài liệu ⇒ mục này thắng, theo ranh giới ownership ở [§1.1](#11-phạm-vi--tài-liệu-này-đóng-gì-và-không-đóng-gì).
>
> Neo của quyền sở hữu: bảng nguyên nhân gốc nằm ở [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D3` (`Accepted`), và nhãn `unattributed` — thứ **không** tồn tại trong `ADR-011 D3` — được thêm vào **ở đây**, nên chỉ ở đây mới phát biểu được một thứ tự phủ kín không gian nguyên nhân.

Khi verdict là `diverged`, đơn vị phân kỳ đầu tiên phải mang **đúng một** nguyên nhân. Thủ tục chạy theo **đúng thứ tự dưới đây**; **bước nào khớp trước thì thắng** và thủ tục dừng.

| Bước | Nguyên nhân | Câu hỏi kiểm | Neo |
|:--:|---|---|---|
| **1** | `redaction` | Có field nào **tham gia so sánh** ở đơn vị này bị redaction gate thay đổi giá trị không? | [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D3`; §16; `U-15` |
| **2** | `incomplete-capture` | Capsule có **thiếu entry** cho interaction mà code local yêu cầu không? (kể cả: entry tồn tại nhưng không match được theo `U-02`) — **và** capsule **KHÔNG** mang cờ `truncated: true` tại điểm phân kỳ. **Có cờ ⇒ không kết luận ở đây, đi tiếp bước `2b`** | `ADR-011` `D3`/`D4`; `E9`; [ADR-008](./Architecture/ADR-008-Async-Bounded-Failure-Triggered-Capture.md) |
| **`2b`** | `truncated` | Capsule có cờ **`truncated: true`** tại điểm phân kỳ không? ⇒ *"diverged vì cap cắt dữ liệu"* | `[inferred]` — **tinh chỉnh** của `incomplete-capture` trong `ADR-011 D3` (*"có thể do buffer chạm trần hoặc **capture bị cắt**"*); phân biệt được là bắt buộc theo [UC-02](../020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md) `A5`/`A6`; nguồn phép kiểm: [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7.1 — **hàng nhãn `truncated`** (bảng vận hành hiện hành tra theo **nhãn**, không theo số hiệu dòng) |
| **3** | `version-drift` | **Cờ drift** có được bật không? (Git commit · runtime · dependency · schema version) | `ADR-011` `D3`; §15, §20.8, §20.9, §20.10; hành vi của cờ: [§3.9](#39-u-16--drift-phiên-bản-là-warning-hay-fatal-hypothesis) |
| **4** | `out-of-scope-determinism` | **Điều kiện quan sát được, không phải suy đoán**: `K` lần replay trên **cùng một capsule, cùng code, cùng máy** có cho **KHÁC** verdict không? `K = 3` — `CHỐT` tại [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.3. **Cùng verdict ở cả `K` lần ⇒ bước này KHÔNG khớp**, dù nguyên nhân thật có vẻ giống phi tất định | `ADR-011` `D3`; [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D2`/`D4`; **`U-25`**; `K` = `[stated MTP §2.3]` |
| **5** | `code` | Còn lại, và code local khác code trong capsule | `ADR-011` `D3`; §15, §20.8 |
| **6** | `unattributed` | **Không bước nào ở trên khớp** | `[inferred]` — **KHÔNG có trong `ADR-011 D3`**; đây là phần tài liệu này thêm vào |

> **Vì sao `truncated` đứng ở `2b` chứ không phải sau `version-drift`** (`[inferred]`): `MTP §7.1` **bản trước vòng hợp nhất** đánh số phép kiểm này là dòng `3b`, và ở đó dòng bắt entry thiếu là **dòng 2** — một dòng **hẹp**: nó chỉ khớp khi điểm phân kỳ *chạm một mục trong Known-Missing-Input Manifest đã niêm phong*. Bước 2 của thủ tục này **rộng hơn** — nó bắt **mọi** entry thiếu. Đặt `truncated` sau bước 2 mà không có mệnh đề loại trừ ⇒ **mọi** ca cap cắt đều bị bước 2 nuốt trước, và dòng `truncated` **không bao giờ khớp được** — một bước chết. Hai cách sửa tương đương nhau về kết quả: hoặc đặt `truncated` **trên** bước 2, hoặc giữ nguyên vị trí kèm mệnh đề loại trừ. Chọn cách thứ hai vì nó giữ nguyên số hiệu **bước 2 / 3 / 4 / 5** mà phần còn lại của tài liệu đã tham chiếu.
>
> **Ánh xạ hai tài liệu — dùng bản HIỆN HÀNH**: hàng nhãn **`truncated`** của [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7.1 ⟷ bước **`2b`** của §3.6. Cùng một phép kiểm, cùng một kết luận. Số hiệu `3b` chỉ thuộc **bản trước vòng hợp nhất** — `MTP §7.1` hiện hành đã bỏ hết số hiệu dòng và tra theo **nhãn**, nên **đừng** trích nó theo số dòng nữa; bảng có số hiệu `3b` còn tra được ở [findings/quality-assurance](../010-Planning/pm-runs/2026-08-15-p0a-spike-protocol/findings/quality-assurance.md).
>
> **Vì sao hai nhãn này không phá quy tắc *"một nhãn duy nhất"***: `truncated` là một **tinh chỉnh có phân biệt** bên trong họ `incomplete-capture` của `ADR-011 D3`, không phải nguyên nhân thứ hai cùng lúc — mệnh đề loại trừ ở bước 2 bảo đảm đúng **một** trong hai khớp. Lý do phải tách ra thành nhãn riêng: [UC-02](../020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md) `A6` ghi *"capsule truncate biểu hiện ra **giống hệt** capsule thiếu input"* ⇒ cờ `truncated` là **dấu hiệu phân biệt duy nhất**; gộp hai thứ là tự nguyện mù với một trong hai.
>
> **Tần suất mong đợi ở `C1`**: cap **TẮT** tại `C1` (yêu cầu `B3-6` của [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §4.2) ⇒ bước `2b` chỉ khớp trong **thí nghiệm cắt offline** (MTP §4.3), nơi nó là **kết quả mong đợi**, không phải lỗi.

> [!IMPORTANT]
> ### Nguyên tắc: quy lỗi cho Repro TRƯỚC khi quy lỗi cho developer
>
> `redaction` (bước 1), `incomplete-capture` (bước 2) và `truncated` (bước `2b`) đứng **TRÊN** `code` (bước 5) — đây không phải thứ tự tuỳ tiện. Ba nguyên nhân đó là **lỗi của chính Repro**: redaction gate của Repro đã thay đổi giá trị, capture pipeline của Repro đã bỏ sót input, hoặc cap của Repro đã cắt mất dữ liệu.
>
> Không có nguyên tắc này, **Repro sẽ đổ lỗi cho code của developer trong đúng những ca mà chính nó gây ra**. `ADR-011` §Consequences nói thẳng hậu quả: developer sẽ kết luận công cụ không đáng tin — *"hoặc tệ hơn, tự tắt redaction"*.
>
> **Nguyên tắc này KHÔNG nhường chỗ trong vòng hợp nhất này** — nó được giữ nguyên và được mở rộng cho `2b`.

> [!CAUTION]
> ### `unattributed` PHẢI hiện ra như chính nó — CẤM gộp thầm vào `code`
>
> Một divergence không quy được nguyên nhân là một **sự kiện có thông tin**: nó nói rằng thủ tục **chưa phủ hết không gian nguyên nhân**. Gộp nó vào `code` biến một khoảng trống của Repro thành một lời buộc tội developer, và **xoá mất tín hiệu duy nhất** cho biết rubric cần được sửa.
>
> Đây cũng là ràng buộc §33.5 (*"explain exactly what was captured and replayed"*): nói *"do code"* khi thực ra **không biết** là một phát biểu vượt quá bằng chứng.
>
> **Yêu cầu lên `C3` và `C4`**: tỷ lệ `unattributed` phải được **in ra như một con số riêng**. Tỷ lệ cao là bằng chứng rubric chưa đủ, không phải bằng chứng code xấu.
>
> ⛔ **Hệ quả lên mọi bảng vận hành hạ nguồn**: một bảng kết thúc bằng dòng *"còn lại ⇒ `code`"* mà **không** có dòng `unattributed` sẽ làm tỷ lệ này **luôn bằng 0 theo cấu tạo** — nó không đo được gì, và nó xoá đúng tín hiệu mà mục này tồn tại để giữ. Bảng vận hành ở [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7 **phải** mang dòng cuối `unattributed`.

> ⚠️ **Bước 4 biến `U-25` từ *"trong phạm vi spike"* thành *ĐIỀU KIỆN TIÊN QUYẾT*.** Không lặp replay thì `out-of-scope-determinism` **không có tín hiệu quan sát được nào** — bước 4 sẽ không bao giờ khớp, và mọi divergence do phi tất định sẽ rơi xuống bước 5 và bị dán nhãn `code`. Giá trị `K = 3` nay đã `CHỐT` tại [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.3 `[stated MTP §2.3]` ⇒ điều kiện tiên quyết này **đã được thoả**; ràng buộc còn lại chỉ là `C1` phải thật sự chạy đủ `K` lần cho **mọi** capsule.

#### 3.6.1 Phán quyết thứ tự — vì sao `out-of-scope-determinism` ở bước 4, KHÔNG phải bước 1

`[inferred]` — phán quyết của tài liệu này, ghi lại vì [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7.1 (bản trước vòng hợp nhất) đặt phép kiểm phi tất định ở **dòng 1**. Hai thứ tự chỉ khác nhau ở **một lớp sự kiện**, và lớp đó phải được gọi tên chứ không để lơ lửng.

**Bước 0 — thứ tự có thực sự quyết định gì không.** Hai thứ tự cho **cùng** kết quả trên mọi divergence mà điều kiện quan sát của bước 4 **sai** — tức `K = 3` lần replay cho **cùng** verdict. Chúng chỉ khác nhau khi `K` lần cho **khác** verdict **đồng thời** một trong các bước 1 / 2 / `2b` / 3 cũng khớp.

**Kiểm bằng chính ca `SC-11`** ([§2.5](#25-quyết-định-g1--gap-redis)): Redis production đã bị destroy ở bước *"Destroy original environment"* của §22, và allowlist egress của [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `L2` (loopback + replay proxy) là **tĩnh** ⇒ lời gọi cache hỏng **ổn định**, hỏng **giống nhau** ở cả 3 lần, tại **cùng một** điểm phân kỳ. ⇒ Điều kiện của bước 4 **sai** ⇒ bước 4 **không khớp ở bất kỳ vị trí nào**, và `SC-11` ra `incomplete-capture` **dưới cả hai thứ tự**.

> ⇒ **Nói thẳng cho hết mâu thuẫn**: tiền đề *"nếu `K = 3` lần cho khác verdict"* trong lập luận về `SC-11` **không đúng với `SC-11`**. Probe này **không** phải bằng chứng cho thấy hai thứ tự cho hai kết quả khác nhau — và nó vẫn giữ nguyên giá trị của mình, vì nó kiểm cặp `incomplete-capture` ↔ `out-of-scope-determinism` bằng cách khác: bước 4 phải **im lặng** khi không có tín hiệu quan sát được.

**Lớp sự kiện mà thứ tự THỰC SỰ quyết định**: divergence vừa **không lặp lại được chính nó** (`K` lần khác verdict) vừa chạm một **record có trước**: redaction record, một mục trong Known-Missing-Input Manifest đã niêm phong, cờ `truncated`, hoặc cờ drift. Với lớp này, thứ tự MTP cho `NON-DETERMINISM`; thứ tự ở đây cho nhãn của bước khớp trước.

**Ba căn cứ chọn bước 4:**

| # | Căn cứ | Sức nặng |
|:--:|---|---|
| **1** | **[§1.5](#15-ràng-buộc-thứ-tự-cứng) đã lập pháp cho đúng ca này.** Nguyên văn: chạy `C1` khi manifest chưa niêm phong thì *"`C3` sẽ quy mọi scenario fail về **non-determinism** trong khi nguyên nhân thật là **thiếu capture đã biết trước**"*. Đặt phi tất định ở bước 1 là **mã hoá cứng đúng hỏng hóc đó vào thủ tục** — kể cả khi manifest **đã** được niêm phong đúng hạn. Manifest sẽ tồn tại mà không bao giờ được tra tới | 🔴 Quyết định |
| **2** | **Chính MTP §7.1 tự bác thứ tự của nó.** Lời mở của bảng: *"nguyên nhân được nghĩ tới trước thường là **non-determinism**, vì nó là lời giải thích **dễ nhất và không đòi bằng chứng gì**"*; và dòng 2 ghi ❌ ***"CẤM ghi là non-determinism"*** cho ca chạm manifest. Hai câu đó không đứng chung được với việc dòng 1 luôn thắng trước. Thứ tự ở đây **hiện thực đúng ý định đã phát biểu của MTP**, không phải lật nó | 🔴 Quyết định |
| **3** | **Bằng chứng có trước thắng bằng chứng suy ra sau.** Redaction record, manifest (kèm commit hash niêm phong), cờ `truncated`, cờ drift đều là artifact **tồn tại trước khi `C1` chạy** và **không sửa được sau khi nhìn kết quả**. *"`K` lần khác verdict"* là quan sát sinh ra **trong lúc chạy** và nó **không** loại trừ được các nguyên nhân kia — một capsule thiếu input hoàn toàn có thể làm replay vừa lệch vừa không ổn định | 🟠 Củng cố |

**Đóng góp thật của MTP được giữ nguyên, chỉ đổi chỗ đứng** (`[inferred]`): quan sát *"`K` lần cho khác verdict"* là **tín hiệu thực nghiệm duy nhất** trong cả bảng — mất nó là mất thật. Nên:

1. Cờ **`replay_unstable`** được ghi vào kết quả replay của **mọi** divergence có `K` lần khác verdict, **độc lập** với nhãn mà thủ tục kết luận. Nhãn quy trách nhiệm là **một**; tín hiệu ổn định là **một trường riêng**, hai thứ không cạnh tranh nhau.
2. Hệ quả ở mức scenario **không** đi qua thủ tục này: `K` lần khác verdict ⇒ scenario **không** `reproduced` theo composite fail-closed [§4.6](#46--lỗ-rò-của-emr-và-cách-bịt--chỉ-số-composite-fail-closed), và vi phạm `S7` ([§2.2](#22-i-điều-kiện-đủ--s1s7)) ⇒ cổng lớp [§3.5](#35-inconclusive-là-một-cổng-đứng-trước-rubric-không-phải-verdict-thứ-ba) xử lý. Không nhãn nào ở §3.6 làm nhẹ đi hai hệ quả đó.

### 3.7 Ví dụ chạy tay

#### Ví dụ chính — verdict `Execution matched`

Capsule `repro-1842`, execution `POST /checkout`.

> ⚠️ **`G1` dưới đây là ký hiệu cục bộ của ví dụ** (tên của nhóm đồng thời), **không phải** quyết định gate `G1` ở §2.5. Hai thứ trùng chữ, không trùng nghĩa.

**Dãy đơn vị của production, sau normalization:**

| # | Đơn vị | `kind` | `target` | `direction` | `result` |
|:--:|:--:|---|---|:--:|---|
| 1 | `U0` | `inbound-http` | `POST /checkout` | `READ` | body canonical: `{"userId":7731}` |
| 2 | `I1` | `clock` | — | `READ` | `2026-08-14T09:12:03.114Z` |
| 3 | `I2` | `feature-flag` | `new_checkout` | `READ` | `true` |
| 4 | `I3` | `db-query` | `SELECT * FROM users WHERE id = $1` | `READ` | 1 row |
| 5 | **`G1` = {`I4`, `I5`}** | — | — | — | **nhóm đồng thời — so như TẬP** |
| — | ↳ `I4` | `db-query` | `SELECT * FROM coupons WHERE id = $1` | `READ` | `null` |
| — | ↳ `I5` | `outbound-http` | `POST https://tax.example/:path` | `READ` | `{"tax":0}` |
| 6 | `U∞` | — | — | — | `outcome` = exception loại `TypeError` |

⇒ **Độ dài dãy = 6 đơn vị** (`G1` tính là **một**).

**Chạy rubric §3.4 trên bản replay ở local:**

| Điều kiện | Kiểm | Kết quả |
|:--:|---|:--:|
| (1) Bằng độ dài | Local cũng cho 6 đơn vị | ✅ |
| (2) Mọi đơn vị bằng nhau | `U0`, `I1`, `I2`, `I3` khớp exact sau normalization. `G1`: local phát ra `{I5, I4}` — **thứ tự đảo**, nhưng `G1` so như **tập** ⇒ bằng nhau | ✅ |
| (3) Hai neo bằng nhau | `U0` bằng; `U∞` local cũng là `TypeError` — **so danh tính loại**, stack trace **không** vào so sánh dù hai bên khác nhau | ✅ |

⇒ **Verdict: `Execution matched`.**

> **Ba chi tiết ví dụ này cố tình phơi ra**: (a) thứ tự đảo bên trong `G1` **không** gây `diverged` — đó là `U-20` được xử lý bằng quan hệ tương đương, không bằng ngưỡng; (b) stack trace khác nhau **không** gây `diverged`; (c) `I1` khớp exact vì giá trị clock là **input đã capture**, không phải đại lượng đo.

#### Biến thể A — verdict `diverged` và quy trách nhiệm

Thay đổi: feature flag `new_checkout` **không có entry trong capsule** (flag được thêm vào hệ thống sau thời điểm capture). Ở local, code đọc flag, seam feature-flag **không tìm thấy giá trị đã ghi** ⇒ theo [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) `D4`, lời gọi **không được phục vụ**, **không crash**, và **KHÔNG** fallback sang SDK thật; replay runtime ghi lại một feature-flag read **không phục vụ được** tại vị trí đó.

- Điều kiện (2) hỏng tại đơn vị **#3** (`I2`): production `result` = `true`, local = *interaction không phục vụ được*.
- ⇒ **`Execution diverged`**, chỉ số đơn vị phân kỳ đầu tiên = **3**.

**Chạy thủ tục §3.6:**

| Bước | Kiểm | Khớp? |
|:--:|---|:--:|
| 1 · `redaction` | `feature-flags` có nằm trong danh sách field đã redact của capsule không? → **Không** | ❌ |
| 2 · `incomplete-capture` | Capsule có entry cho `new_checkout` không? → **Không có**. Và capsule có cờ `truncated: true` tại đơn vị #3 không? → **Không** (cap TẮT ở `C1`) ⇒ mệnh đề loại trừ của bước 2 không kích hoạt | ✅ **KHỚP — dừng** |

⇒ **Nguyên nhân: `incomplete-capture`.** Không đi tiếp tới bước 5. Đây chính là nguyên tắc *"quy lỗi cho Repro trước"* hoạt động: capsule thiếu input, **không** phải code local sai.

> **Nếu capsule CÓ cờ `truncated: true`** tại đúng đơn vị đó — chuyện chỉ xảy ra trong thí nghiệm cắt offline — bước 2 nhường, và bước `2b` kết luận **`truncated`**: entry thiếu vì **cap đã cắt**, không vì phạm vi capture hở. Hai ca trông giống hệt nhau ở đầu ra; cờ là thứ duy nhất tách được chúng.
>
> **Nếu bước 2 không khớp** — tức capsule **có** entry và replay layer **đã** trả `true`, mà execution vẫn lệch — thủ tục đi tiếp: bước 3 hỏi cờ drift. Nếu drift detector đã bật cờ (Git commit khác), nguyên nhân là **`version-drift`**, **không** phải `code`. Chỉ khi **cả năm** bước đầu (1 · 2 · `2b` · 3 · 4) đều không khớp thì `code` mới được kết luận. Trật tự này là toàn bộ giá trị của thủ tục.

#### Biến thể B — phơi bày điểm mù `W1`

Thay đổi: developer sửa `calculateDiscount` từ `if (coupon)` sang `if (coupon && coupon.active)`. Cả hai nhánh **chỉ tính toán trên giá trị đã có trong bộ nhớ**, không phát thêm bất kỳ interaction nào, và cả hai cùng kết thúc bằng exception loại `TypeError`.

- Dãy đơn vị local: **giống hệt** production — vẫn 6 đơn vị, mọi field khớp, `U∞` cùng loại.
- ⇒ **Verdict: `Execution matched`.**

> 🔴 **Và verdict đó SAI về mặt sự thật**: execution local đã đi **một nhánh code khác**. Rubric **không phát hiện được**, vì nhánh đó không để lại dấu vết nào tại boundary đã instrument và không đổi danh tính loại của kết cục.
>
> Đây là `W1` (§3.11). Nó không phải một lỗi hiện thực có thể sửa — nó là **hệ quả cấu trúc** của việc chọn boundary interaction làm đơn vị so sánh.

### 3.8 `U-13` — ngữ nghĩa clock lúc replay (`HYPOTHESIS`)

> **Đây là phạm vi bổ sung của `A3` theo quyết định `G3` của `@TrisJr` ngày 2026-08-15**, không có trong Timeline bản gốc.

**Vì sao phải đóng ở đây, không được để mở**: một đoạn code đo `t2 - t1` cho **hai kết quả khác nhau** tuỳ ngữ nghĩa clock. Không đóng thì `B3` (recorder) và `B5` (replay layer) **không xây được**, và Engineer sẽ phải quyết định **ngầm** trong lúc viết `B5` — một quyết định kiến trúc sinh ra trong một PR, không có ai review nó như một quyết định.

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> Lúc replay, mọi lời gọi đọc clock của ứng dụng được phục vụ bằng **dãy giá trị clock đã ghi, theo đúng thứ tự đã ghi** — lời gọi thứ `n` nhận giá trị đã ghi ở lời gọi thứ `n`.
>
> **Hệ quả quan sát được**: `t2 - t1` đo ở local **bằng đúng** `t2 - t1` ở production.

**Hai phương án bị loại, và lý do là các neo đã có:**

| Phương án | Hành vi của `t2 - t1` | Vì sao bị loại |
|---|---|---|
| **Freeze** — mọi lời gọi trả **cùng một** mốc | Mọi delta = **0** | Code đo elapsed time thấy `0` ở local trong khi production thấy giá trị thật ⇒ **thay đổi hành vi quan sát được** của chính execution đang được tái hiện |
| **Virtual clock chạy tiếp theo tốc độ local** | Delta = tốc độ **máy local** | Giá trị đến từ **môi trường local**, không từ capsule ⇒ vi phạm [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D1.2` (*"đều đến từ capsule, không đến từ môi trường local"*) |

**Ba neo cùng chỉ về phương án được chọn:**

1. [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) `D1.1` — *"thời gian mà ứng dụng đọc được lúc replay là thời gian đã ghi ở production"* (§18, §20.2, §8 `✓ Clock`).
2. [SDD-Repro](./Architecture/SDD-Repro.md) §3.2, seam `Clock`: chiều capture = *"timestamp đã đọc"*, chiều replay = *"trả recorded time"*.
3. §3.2 của tài liệu này xếp giá trị clock là `result` của một đơn vị `kind = clock` — **input đã capture, KHÔNG tolerant**. Ba nguồn này chỉ nhất quán với nhau dưới ngữ nghĩa *"phát lại dãy giá trị đã ghi"*.

**Điểm yếu đã biết** (bắt buộc theo §1.2 quy tắc 3):

- **Dãy có thể cạn.** Nếu code local đọc clock **nhiều lần hơn** số lần đã ghi — chuyện **bình thường** sau khi developer sửa code — dãy hết giá trị. Hành vi lúc đó gắn với `U-11` (interaction không khớp capsule) và với `incomplete-capture` ở bước 2 §3.6; **bản thân `U-11` vẫn `TBD`**, tài liệu này **không** đóng nó.
- **"Thứ tự đã ghi" thừa hưởng `U-20`.** Khi lời gọi clock nằm trong một nhánh async song song, thứ tự ghi được có thể không ổn định giữa các lần chạy.
- **`U-13` ở [SDD-Repro](./Architecture/SDD-Repro.md) §8.3 vẫn ở disposition `SPIKE`.** Phát biểu trên là hypothesis để spike **bác bỏ**, không phải câu trả lời cho `U-13`.

### 3.9 `U-16` — drift phiên bản là warning hay fatal (`HYPOTHESIS`)

> **Phạm vi bổ sung của `A3` theo quyết định `G3`.** Đây là **đầu vào của bước 3** trong thủ tục §3.6 — mà `C3` phụ thuộc thủ tục đó.

> **`HYPOTHESIS — cần validate`** · `[inferred]` · **phạm vi: chỉ trong spike Phase 0**:
>
> Mọi drift phát hiện được là **`warning` + một cờ có cấu trúc ghi vào kết quả replay**. **Không fatal. Không chặn replay.**

**Ba ràng buộc buộc phải chọn phương án này:**

1. **Scenario 6 (Dependency/version difference) phải chạy được thì mới vào được denominator.** Nếu drift là fatal, scenario 6 bị chặn ngay trước khi có verdict ⇒ nó không thể có verdict kỳ vọng khai trước ⇒ nó rơi ra ngoài denominator theo `L1` §1.4.
2. **Bước 3 của §3.6 lấy chính cờ đó làm đầu vào.** Fatal thì replay dừng trước khi rubric chạy ⇒ bước 3 **không bao giờ có dữ liệu** ⇒ mọi divergence do drift sẽ rơi xuống bước 5 và bị dán nhãn `code`. Đây là đúng loại quy trách nhiệm sai mà §3.6 tồn tại để chặn.
3. **`ACG-10` chỉ ra code mismatch là *trạng thái thường trực*, không phải ngoại lệ hiếm**: §8 bước 4–5 là *developer sửa code rồi replay lại* — nếu drift là fatal thì use case chính của sản phẩm bị chặn ở mọi lần dùng.

**Phạm vi của phát biểu này — hẹp, và cố ý hẹp:**

- Nó đóng **duy nhất** câu hỏi *warn hay fatal* **cho spike**.
- **Ba tầng cảnh báo** mà `U-16` đề xuất ở [SDD-Repro](./Architecture/SDD-Repro.md) §3.11 (*thông tin / cảnh báo / chặn*) **vẫn `TBD`** — `RQ.md` không cho căn cứ nào để xếp loại drift nào vào tầng nào, và xếp sai tạo alert fatigue.
- Nó **không** cấp một ngưỡng nào cho việc drift ở mức nào thì đáng lo. Không có nguồn ⇒ **`TBD`**.

**Điểm yếu đã biết**: warning-only nghĩa là replay **có thể chạy trên một môi trường lệch nặng** (runtime major version khác, schema version khác) và cho verdict `diverged` mà bước 3 quy về `version-drift` — **đúng nhãn**, nhưng nhãn đó **không nói được** drift ấy có **thực sự gây ra** phân kỳ hay chỉ tình cờ có mặt. Đây là giới hạn phải công bố; spike ghi lại tần suất để `D1`/`U-16` có dữ liệu thật mà quyết định.

### 3.10 Hệ quả lên denominator — bàn giao cho `A4`

> ✅ **Quyết định `G3` — `@TrisJr`, 2026-08-15**: `A3` đóng thêm `U-13` và `U-16` ở dạng hypothesis.

**Mối liên hệ, phát biểu tường minh để `A4` dùng được:**

| Đóng được gì | Scenario §22 được mở khoá | Lý do |
|---|---|---|
| `U-13` (§3.8) | **Scenario 4 — Time-dependent bug** | Không có ngữ nghĩa clock thì **không khai được verdict kỳ vọng**: với code đo `t2 - t1`, freeze và virtual cho **hai kết quả khác nhau**. Mà `L1` §1.4 đòi verdict kỳ vọng phải đóng băng **trước** khi `C1` chạy |
| `U-16` (§3.9) | **Scenario 6 — Dependency/version difference** | Không có hành vi của cảnh báo drift thì scenario 6 **không có kết cục xác định** để khai trước |

⇒ Cả hai được đóng ⇒ scenario **4** và **6** **vào được denominator** ⇒ **denominator = 7**, theo quyết định `G3`.

> **Ranh giới ownership**: câu trên là **tham chiếu tới quyết định `G3`**, không phải định nghĩa denominator. Quy tắc denominator, tập scenario, và ngưỡng hiệu dụng thuộc **§4** (`ACG-02` + `ACG-03`, task `A4` — 🕵️ BA) theo bảng §1.1. §3 chỉ chịu trách nhiệm về **điều kiện kỹ thuật** làm hai scenario đó trở nên chấm điểm được.
>
> **Ba scenario vẫn ngoài denominator sau `G3`, vì lý do nằm ngoài phạm vi `A3`**: scenario 7 (Randomness — `ACG-06`), scenario 9 (Async — `U-20`), scenario 10 (Race condition — §20.13 + §19 đặt ngoài phạm vi ở **mọi** phương án, không bao giờ vào được).

### 3.11 Điểm yếu đã biết của rubric — `W1`–`W7`

Bắt buộc theo §1.2 quy tắc 3, và theo exit criteria của `A3` (*"nêu rõ điểm yếu đã biết"*). Danh sách này phải vào Spike Report **ngay từ `A3`**, không đợi `C4`: viết từ bây giờ thì nó là **giới hạn đã công bố**; xuất hiện lần đầu ở `C4` thì nó là **phát hiện muộn** — khác biệt lớn về mặt quản trị, dù nội dung giống nhau.

| # | Điểm yếu | Mức |
|:--:|---|:--:|
| **`W1`** | **Rẽ nhánh thuần logic: recall = 0.** Hai nhánh code khác nhau, **cả hai không chạm dependency nào**, cùng kết cục ⇒ rubric kết luận `Execution matched` **trong khi execution thực sự đã khác**. Xem biến thể B ở §3.7 | 🔴 |
| **`W2`** | **Thừa hưởng toàn bộ độ giòn của `U-02`.** Normalization phép 1 và 2 (§3.2) đứng trên định danh query — mà [SDD-Repro](./Architecture/SDD-Repro.md) §4.4 gọi `U-02` là ***"rủi ro hiện thực cao nhất"*** và **không chốt** phương án nào trong bốn | 🔴 |
| **`W3`** | **`U-20` chưa đóng.** §3.3 phát biểu *quan hệ* so sánh cho nhóm đồng thời nhưng **không** phát biểu cơ chế **nhận diện** ranh giới nhóm. Sai ranh giới ⇒ hoặc báo `diverged` sai (nhóm quá hẹp), hoặc bỏ sót phân kỳ thật (nhóm quá rộng) | 🟠 |
| **`W4`** | **Capsule đã redact không bao giờ bit-perfect.** Marker-so-marker (§3.3) giấu đi mọi khác biệt bên trong field đã redact. Nếu bug nằm **đúng trong** giá trị bị redact, rubric mù với nó | 🟠 |
| **`W5`** | **Không dùng nguyên xi cho `repro verify` (`U-08`).** Sau khi developer sửa code, phân kỳ là **dấu hiệu thành công**. Rubric này trả lời câu hỏi của `replay` (*"execution có lặp lại như production không?"*), **không** trả lời câu hỏi của `verify`. `U-08` vẫn `TBD` | 🟠 |
| **`W6`** | **Chưa có dữ liệu hiệu chỉnh.** [ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) §Consequences: tiêu chí quá chặt ⇒ báo `diverged` liên tục, người dùng bỏ tính năng; quá lỏng ⇒ khôi phục đúng false confidence §20.3. **Spike này chính là nguồn dữ liệu đó** — nên rubric hiện tại là điểm khởi đầu, không phải điểm đến | 🟠 |
| **`W7`** | **Đứng trên hypothesis `U-13` chưa validate.** Đơn vị `kind = clock` so exact (§3.2) chỉ có nghĩa dưới ngữ nghĩa clock ở §3.8. Nếu spike bác bỏ §3.8, tập field ở §3.2 phải viết lại | 🟠 |

> [!IMPORTANT]
> ### Phát biểu trung thực nhất mà rubric này hỗ trợ được
>
> Khi verdict là `Execution matched`, điều duy nhất đã được chứng minh là:
>
> > **"Không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục."**
>
> **KHÔNG** phải:
>
> > ~~"Execution local giống execution production."~~
>
> `W1` là lý do chính xác vì sao hai câu này khác nhau, và khác nhau **không thể thu hẹp được** bằng cách hiện thực tốt hơn. Ràng buộc này cộng dồn với §20.16 (`Captured execution no longer reproduces`, **không** phải *"bug đã được sửa"*) — hai ràng buộc ngôn từ ở hai chỗ khác nhau, cả hai đều bắt buộc.

> **Đính chính đối với `NFR-Repro` `ACG-01`.** [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 7 viết rằng điểm yếu này là *"đúng loại bug mà §7 lấy làm ví dụ mở đầu"*. Đọc lại §7 nguyên văn: bug ở đó **chạm database** — `db.coupons.find(user.couponId)` trả `null` — rồi kết thúc bằng `TypeError` khi truy cập `coupon.discount`. Với đơn vị neo `U∞` (danh tính loại của exception) và với đơn vị `db-query` cho lần đọc `coupons`, rubric này **bắt được** ca §7.
>
> ⇒ **`W1` vẫn đúng nguyên vẹn** — recall = 0 với rẽ nhánh thuần logic. Nhưng **§7 không phải ví dụ của nó**. Ví dụ đúng của `W1` là biến thể B ở §3.7. Ghi lại đính chính này ở đây vì nếu không, `C4` sẽ trích `ACG-01` và lặp lại nhầm lẫn.

---

## 4. `ACG-02` + `ACG-03` — Tiêu chí chọn test case và denominator

> **Nhắc lại quy ước §1.2 quy tắc 1**: nhãn đi kèm **từng phát biểu**, **không** phủ cả mục — mục này **không** khai một nhãn mặc định. Mỗi phát biểu định nghĩa dưới đây mang nhãn `HYPOTHESIS — cần validate` **ngay tại điểm phát biểu**. Nhãn `[stated §N]` / `[inferred]` ở các bảng là nhãn của **căn cứ**, không phải nhãn của kết luận IN/OUT.

> **Ranh giới với measurement plan, phát biểu một lần cho cả mục**: §4 quyết định **scenario nào được tính vào ngưỡng** và **con số nào là chỉ số gate**. **Nguyên nhân của một lần `diverged`** do [§3.6](#36-thủ-tục-quy-trách-nhiệm-divergence--khớp-đầu-tiên-thắng) của **chính tài liệu này** quyết định — đó là chủ sở hữu duy nhất của thủ tục quy trách nhiệm; [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7 là **bảng vận hành** của thủ tục đó, không phải nguồn của nó. Hai câu hỏi khác nhau, không lặp nhau — và chính MTP §2.3 quy tắc 2 đã nhường phần phán xử *"scenario rốt cuộc pass hay fail"* về phía tài liệu này `[stated MTP §2.3]`.

### 4.1 `ACG-02` — định nghĩa vận hành của *"meaningful"*, và vì sao nó hẹp có chủ đích

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> **meaningful ≡ (execution nằm trong Supported Execution Class của [§2](#2-acg-07--supported-execution-class)) ∧ (verdict của nó chấm được pass/fail bằng rubric [§3.4](#34-ngưỡng-nhị-phân--điều-kiện-của-execution-matched) mà không cần phán đoán chủ quan).**

**Tài liệu này cố ý KHÔNG định nghĩa *"meaningful"* theo nghĩa *"quan trọng với business"*.** Một tiêu chí kiểu *"bug này có đáng để sản phẩm quan tâm không"* **không kiểm được**: nó không có phép thử, không có người chịu trách nhiệm, và ai cũng có thể lập luận theo cả hai chiều sau khi đã nhìn thấy kết quả. Đó đúng là cánh cửa mà `ACG-02` cảnh báo — [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 7 viết thẳng rằng *"một ngưỡng có thể tự thoả mãn bằng cách chọn lại tập test"*, và rằng câu hỏi *"ai quyết định, quyết định lúc nào (trước hay sau khi biết kết quả), bằng tiêu chí gì"* hiện **không có câu trả lời**.

> ⚠️ **Bộ tiêu chí dưới đây trả lời đúng một câu hỏi: *"case này có được tính vào ngưỡng không?"***
>
> Nó **không** trả lời: *"case này có đáng làm sản phẩm không?"* — câu hỏi thứ hai là việc của `D1`/`D2` ở `P1`, sau khi có dữ liệu thật, và **không** thuộc phạm vi một tài liệu viết trước khi spike chạy.

**Cái giá phải trả, khai luôn ở đây**: định nghĩa hẹp này khiến kết luận của spike **không nói gì** về lớp execution nằm ngoài class — kể cả khi lớp đó phổ biến trong ứng dụng thật. Đây là `X3` ở [§4.10](#410-điểm-yếu-đã-biết-của-hypothesis-acg-02--acg-03--x1x6), và nó là đánh đổi có ý thức: một tiêu chí kiểm được trên tập hẹp có giá trị chứng minh **cao hơn** một tiêu chí không kiểm được trên tập rộng.

### 4.2 Sáu tiêu chí `M-1`–`M-6`

Mỗi tiêu chí là một **câu hỏi nhị phân**.

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> **Một scenario được tính vào denominator khi và chỉ khi cả sáu câu trả lời `M-1`–`M-6` đều là *Có*.**

| ID | Câu hỏi nhị phân | Cách kiểm — ai / lúc nào | Neo nguồn |
|:--:|---|---|---|
| **`M-1`** | Trigger của scenario có tái tạo được lỗi **`K/K` lần** trên môi trường production-like không? | 🧑‍💻 Engineer + 🧪 QA, tại **`B8`** (exit criteria: *"10 fixture tái tạo được lỗi… chạy lại vẫn lỗi"*). **`K = 3`** — con số **`CHỐT` tại [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.3**, tài liệu này **không** đặt nó | `[stated MTP §2.3]` cho giá trị `K`; việc **mượn** cùng con số cho phép lặp **trigger** (MTP chốt `K` cho phép lặp **replay**, `U-25`) là `[inferred]` — dùng một con số cho cả hai đầu của vòng lặp để không sinh ra tham số thứ hai không ai sở hữu |
| **`M-2`** | **Mọi** input có quan hệ nhân quả với kết cục có nằm trong **8 nhóm capture của §18** không? | 🕵️ BA + 🏗️ Architect, đọc thiết kế fixture, **tại `A4` / đóng băng ở `Gate A`** | §18 `[stated §18]`; đối chiếu `S3` (§2.2) và trục loại trừ 2 (§2.4) |
| **`M-3`** | Execution có **đóng** không — một inbound HTTP request → **một** kết cục (response hoặc exception thoát khỏi handler), và **mọi** interaction nhân quả hoàn tất **bên trong** cửa sổ request đó, **trong cùng một process**? | 🕵️ BA + 🏗️ Architect, đọc thiết kế fixture, **tại `A4`** | `S1` + `S2` (§2.2); §5, §18, §22 `[stated]`; §20.11 |
| **`M-4`** | Kết cục có **độc lập** với concurrency / event ordering **giữa các execution** không? | 🕵️ BA + 🏗️ Architect, đọc thiết kế fixture, **tại `A4`** | `S5` (§2.2); §19 Non-Goals, §20.13 `[stated §20.13]` |
| **`M-5`** | **Chữ ký lỗi** (lỗi biểu hiện ra sao) **VÀ verdict kỳ vọng** đã được khai **trước khi chạy** chưa? | 🕵️ BA viết, 👤 `@TrisJr` duyệt tại **`Gate A`**, ghi vào `verdict.md` | Luật `L1` — [§1.4](#14-ba-luật-chống-gian-lận-thống-kê) |
| **`M-6`** | Verdict có chấm được **dưới ràng buộc default-deny WRITE của `B5`** không — tức chấm được **mà không cần** một side effect thật xảy ra? | 🏗️ Architect + 🧪 QA, đối chiếu rubric §3.2/§3.4 với **block log của `B5`**, **tại `A4`** | §13, §20.4 `[stated]`; [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) `Decision 2`; `S6` (§2.2) |

> **`M-1` là tiêu chí duy nhất được kiểm SAU khi đóng băng.** Năm tiêu chí còn lại là phép đọc thiết kế, làm được tại `A4`. `M-1` đòi chạy fixture thật ⇒ chỉ có bằng chứng tại `B8`. Đây chính là lý do luật `L2` (bánh cóc một chiều, [§4.7](#47-ba-luật-chống-gian-lận-thống-kê--dạng-thao-tác-được)) chỉ cho phép denominator **co**: `M-1` hỏng là **con đường co duy nhất biết được TRƯỚC `C1`** — nó là con đường ① của bảng `L2-a`, và riêng con đường này lý do rời phải được ghi có ngày tháng **trước `C1`**. Hai con đường co hợp lệ còn lại — hypothesis [§3.8](#38-u-13--ngữ-nghĩa-clock-lúc-replay-hypothesis)/[§3.9](#39-u-16--drift-phiên-bản-là-warning-hay-fatal-hypothesis) bị bác bỏ, và cổng `inconclusive` [§3.5](#35-inconclusive-là-một-cổng-đứng-trước-rubric-không-phải-verdict-thứ-ba) — chỉ lộ ra **tại hoặc sau `C1`**; xem bảng `L2-a` tại [§4.7](#47-ba-luật-chống-gian-lận-thống-kê--dạng-thao-tác-được).

> 🔺 **`M-6` — đọc đúng vai trò của block log, đừng nhầm với bằng chứng an toàn.** Block log của `B5` là **tín hiệu so sánh**: một lời gọi WRITE bị chặn vẫn xuất hiện như **một đơn vị** trong dãy §3.1 với `direction = WRITE`, nên rubric §3.4 vẫn so được nó. Bằng chứng rằng **không có** side effect thật rời máy là một câu hỏi khác, dùng **canary log** theo [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §5.2 — MTP cấm dùng log của chính replay runtime làm bằng chứng an toàn (xác minh vòng tròn). §4 dùng block log cho **vế so sánh**, **không** dùng nó cho vế an toàn.

### 4.3 Áp thử lên cả 10 scenario §22

Bảng này được điền **trước khi `C1` chạy**, và đó là toàn bộ giá trị của nó.

> **Mọi kết luận IN/OUT trong bảng dưới đây mang nhãn `HYPOTHESIS — cần validate`** · `[inferred]`: chúng là kết quả của việc áp `M-1`–`M-6` lên **thiết kế** fixture, **không** phải kết quả của một phép đo — fixture chưa tồn tại tại thời điểm viết. Điểm yếu này được ghi tường minh ở `X6` ([§4.10](#410-điểm-yếu-đã-biết-của-hypothesis-acg-02--acg-03--x1x6)).

| # | Scenario §22 | `M-1` | `M-2` | `M-3` | `M-4` | `M-5` | `M-6` | Kết luận | Lý do |
|:--:|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| 1 | Database state causes bug | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | DB query/result thuộc §18; execution đóng; verdict kỳ vọng `matched` |
| 2 | External API response causes bug | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | External HTTP response thuộc §18; verdict kỳ vọng `matched` |
| 3 | Feature flag causes bug | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | Feature flag state thuộc §18; verdict kỳ vọng `matched` |
| 4 | Time-dependent bug | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | 🔗 **Phụ thuộc [§3.8](#38-u-13--ngữ-nghĩa-clock-lúc-replay-hypothesis)** — xem ràng buộc ngay dưới bảng |
| 5 | Missing data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | Thiếu dữ liệu biểu hiện qua `result` của một `db-query` đã capture; verdict kỳ vọng `matched` |
| 6 | Dependency/version difference | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** *(có điều kiện)* | 🔗 **Phụ thuộc [§3.9](#39-u-16--drift-phiên-bản-là-warning-hay-fatal-hypothesis)**; nhánh fixture phải khai tại §4 — xem [§4.3.1](#431-scenario-6--khai-nhánh-fixture-ngay-tại-đây) |
| 7 | Randomness | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | 🔴 **OUT** | **`M-2` hỏng**: giá trị ngẫu nhiên/UUID là input nhân quả **ngoài 8 nhóm §18**. `ACG-06` (*"UUID capture where practical"*) là một **miễn trừ**, **không** phải tiêu chí ⇒ không dùng nó để kéo scenario vào. Khớp lý do `ACG-06` ở [§3.10](#310-hệ-quả-lên-denominator--bàn-giao-cho-a4) và `E-B` ở §2.7 |
| 8 | Side effect | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 **IN** | `M-6` là điểm mấu chốt: lời gọi WRITE bị `B5` chặn **vẫn** là một đơn vị so sánh ⇒ chấm được **mà không cần** side effect thật xảy ra |
| 9 | Async behavior | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 🔴 **OUT** | **`M-3` hỏng**: phần async **không đóng trong cửa sổ request** ⇒ **`U∞` không xác định trọn vẹn tại thời điểm so sánh** (`U-20` / `W3`). Khớp lý do `U-20` ở [§3.10](#310-hệ-quả-lên-denominator--bàn-giao-cho-a4) và `W3` ở §3.11: ranh giới nhóm đồng thời chưa nhận diện được ⇒ dãy đơn vị không xác định |
| 10 | Race condition | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🔴 **OUT** | **`M-4` hỏng**: phụ thuộc *"precise concurrency and event ordering"* `[stated §20.13]`; §19 Non-Goals liệt kê `Distributed race-condition replay`. Khớp [§3.10](#310-hệ-quả-lên-denominator--bàn-giao-cho-a4) — scenario này **ngoài phạm vi ở mọi phương án**, không bao giờ vào được |

> 🔗 **Phụ thuộc bắt buộc phải khai: scenario 4 và 6 vào được denominator LÀ NHỜ §3.**
>
> Trước quyết định **`G3`** (`@TrisJr`, 2026-08-15), hai scenario này **không** thoả `M-5`: không có ngữ nghĩa clock thì code đo `t2 - t1` cho **hai verdict kỳ vọng khác nhau** tuỳ freeze hay virtual; không có hành vi của cảnh báo drift thì scenario 6 **không có kết cục xác định** để khai trước. `A3` đóng `U-13` ([§3.8](#38-u-13--ngữ-nghĩa-clock-lúc-replay-hypothesis)) và `U-16` ([§3.9](#39-u-16--drift-phiên-bản-là-warning-hay-fatal-hypothesis)) ở dạng hypothesis ⇒ `M-5` thoả ⇒ **4 và 6 vào denominator**. Bàn giao tường minh ở [§3.10](#310-hệ-quả-lên-denominator--bàn-giao-cho-a4).
>
> ⚠️ **Chiều ngược lại cũng đúng và phải được theo dõi**: nếu spike **bác bỏ** §3.8 hoặc §3.9, denominator mất tương ứng scenario 4 hoặc 6. Đó là một lần **co** hợp lệ theo `L2`, và `C4` phải in cả hai mẫu số theo `L3`.

#### 4.3.1 Scenario 6 — khai nhánh fixture NGAY TẠI ĐÂY

Scenario 6 có **hai** cách dựng fixture, và chúng cho **hai verdict kỳ vọng ngược nhau**. Chọn nhánh nào **phải khai tại §4 này**, **không bao giờ** khai sau đó — khai sau là khai khi đã biết kết quả, đúng thứ `L1` tồn tại để chặn.

| Nhánh | Fixture đo cái gì | Verdict kỳ vọng | Hệ quả |
|---|---|:--:|:--:|
| **(A) ✅ ĐƯỢC CHỌN** | Replay **theo đúng version ghi trong capsule** — Git commit / runtime / dependency version của capsule được dựng lại ở local | **`matched`** | 🟢 **IN**, tính vào denominator |
| (B) — bị loại | Fixture cố tình tạo **version mismatch** để đo *version mismatch detection* | **`diverged`** (nguyên nhân `version-drift`, bước 3 §3.6) | 🔴 **OUT** khỏi denominator |

> **Vì sao chọn (A)** — `HYPOTHESIS — cần validate` · `[inferred]`: câu hỏi của `GATE-06` là *"capture đủ thông tin để **replay** một lớp bug có ý nghĩa hay không"* `[stated §39]`. Nhánh (A) trả lời đúng câu đó. Nhánh (B) đo một **tính năng khác** — `code/version mismatch detection` của §18 nhóm Analysis — và một scenario mà verdict kỳ vọng là `diverged` **không thể** đóng góp vào một tỷ lệ đếm *"reproduced"*: cộng nó vào tử số là tự mâu thuẫn, để nó ở mẫu số là tự làm hỏng tỷ lệ.
>
> Nhánh (B) **vẫn đáng chạy** — nhưng nó thuộc observation set ([§4.8](#48-observation-set--7-9-10--probe-sc-11)), không thuộc denominator. `B8` **không** được tự đổi sang (B); đổi nhánh là một quyết định phải quay lại `Gate A`.

### 4.4 Denominator — SUY RA từ §4.3, không khẳng định trước

Áp bộ tiêu chí §4.2 lên bảng §4.3, tập IN là `{1, 2, 3, 4, 5, 6, 8}`.

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> **Denominator `D = 7`.**

**Ngưỡng hiệu dụng, suy ra bằng số học:**

```text
Ngưỡng §24 dòng 1 :  ≥ 80% meaningful deterministic test cases reproduced
Denominator       :  D = 7
80% × 7           =  5.6  scenario
Số scenario nguyên:  ⇒ cần ≥ 6

⇒ NGƯỠNG HIỆU DỤNG = ≥ 6/7        (6/7 = 85.7% — ĐẠT)
                       5/7 = 71.4% — TRƯỢT
```

> [!WARNING]
> ### ⚠️ Cảnh báo độ mịn — bắt buộc in ở mọi nơi trình bày con số này
>
> Với `D = 7`, **một scenario = 14.3 điểm phần trăm**.
>
> Ở cỡ mẫu này, ngưỡng `≥ 80%` **mất gần hết ý nghĩa thống kê**: không có cách nào để tỷ lệ rơi vào khoảng `71.4% – 85.7%`, nên `80%` không phân biệt được điều gì mà `≥6/7` không phân biệt được. Nó thực chất là quy tắc **"được sai tối đa 1 trên 7"**.
>
> ⇒ **Mọi nơi trình bày — `C2`, `C4`, `Gate A`, `GATE-06` — PHẢI dùng dạng `≥ 6/7`, KHÔNG dùng dạng `80%`**, để không tạo **cảm giác chính xác giả**. Một con số hai chữ số thập phân trên mẫu số 7 gợi ý một độ phân giải mà phép đo không có.

> **Đây KHÔNG phải một ngưỡng mới.** `≥ 6/7` là **dạng hiệu dụng của ngưỡng §24 dòng 1**, áp lên chỉ số composite ở [§4.6](#46--lỗ-rò-của-emr-và-cách-bịt--chỉ-số-composite-fail-closed). Tài liệu này **không** thêm ngưỡng nào ngoài **bốn ngưỡng §24**. Đặc biệt: **`N-05` (Execution Match Rate thô) vẫn KHÔNG có ngưỡng** — theo bảng [§1.1](#11-phạm-vi--tài-liệu-này-đóng-gì-và-không-đóng-gì), việc chốt ngưỡng cho `N-05` thuộc **`D1`**, cần **dữ liệu phân bố thực tế từ spike**.

### 4.5 `ACG-03` — *"reproduced"* = **Execution Match Rate**

> **`HYPOTHESIS — cần validate`** · `[inferred]`:
>
> Chữ *"reproduced"* ở §24 dòng 1 được vận hành hoá bằng **Execution Match Rate**, **không** bằng **Replay Success Rate**.

**Ba lý do, xếp theo sức nặng:**

| # | Lý do | Neo |
|:--:|---|---|
| **1** | **Quyết định `M1` ngày 2026-08-14 chốt metric chính thức của V0.1 = *"số production bug đạt trạng thái `Execution matched`"***. Gate spike bằng Replay Success Rate ⇒ chấm bằng một chỉ số **không đo trạng thái mà V0.1 dùng để định nghĩa thành công**. Đó là tái diễn đúng lỗi false confidence §20.3 (*"A replay may complete successfully while following a different execution path"* `[stated §20.3]`) **ngay bên trong cái gate dựng ra để chống nó** | [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 8.2, mục 10.4 `[stated]`; §20.3 `[stated]` |
| **2** | **`NFR` 2.1(b) đã đề xuất đúng hướng này**: *"đo cả hai, và ngưỡng `≥ 80%` áp cho Execution Match Rate — vì đó là chỉ số phản ánh giá trị thật của sản phẩm theo §10"* | [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 2.1(b) `[stated NFR 2.1]` |
| **3** | **Scenario 8 CHỈ chấm được bằng EMR.** Side effect thật **không được phép** xảy ra khi replay ([ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md), §20.4) ⇒ *"bug đã tái hiện"* theo nghĩa RSR **không có biểu hiện quan sát được**. EMR chấm được, vì lời gọi WRITE bị chặn vẫn là một đơn vị so sánh qua block log của `B5` | §20.4 `[stated]`; `ADR-005`; `M-6` §4.2 |

> ⚠️ **Phát biểu cho đúng mức — `M1` RÀNG BUỘC, KHÔNG CHỐT HỘ `ACG-03`.**
>
> `M1` **loại một nhánh** (RSR làm chỉ số gate) khỏi tập lựa chọn hợp lệ. Nó **không** tự nó chốt `ACG-03`. [NFR-Repro](../020-Requirements/NFR-Repro.md) mục 7 nói rõ: *"Không một mục nào của `ACG-01`…`ACG-12` được các quyết định ngày 2026-08-14 đóng lại"* `[stated NFR §7]`. Phát biểu ở §4.5 vì thế vẫn là **hypothesis**, và con đường hợp lệ duy nhất để nó thành định nghĩa sản phẩm vẫn là **`GATE-06` → `D2`** ([§1.3](#13-quy-tắc-cấm-nâng-cấp)).

### 4.6 🔺 Lỗ rò của EMR và cách bịt — chỉ số composite fail-closed

**Đây là mục quan trọng nhất của §4.** Chọn EMR mà không bịt lỗ dưới đây thì lựa chọn ở §4.5 tự phá chính mục đích của nó.

**Lỗ rò, phát biểu bằng chính định nghĩa của nguồn** — §23 `[stated §23]`:

```text
Execution Match Rate  =  Equivalent executions  /  Total replays
                                                   ^^^^^^^^^^^^^
                          mẫu số là SỐ LẦN REPLAY, không phải SỐ TEST CASE
```

⇒ Một scenario **không replay được** — crash, capsule không mở được, replay từ chối khởi động — **rơi hẳn khỏi mẫu số**. Nó không làm tỷ lệ xấu đi; nó **biến mất**.

> [!CAUTION]
> ### Kịch bản tệ nhất và con số đẹp nhất là CÙNG MỘT kịch bản
>
> `3` scenario replay được, **cả 3 đều khớp** ⇒ `EMR = 3/3 = 100%` — trong khi **4/7 scenario chưa từng được replay một lần nào**.
>
> Spike báo **"đạt"** đúng trong kịch bản mà sản phẩm hỏng nặng nhất. Không ai đọc được điều đó từ chính con số, vì phần hỏng **không có mặt trong phân số**.

**Cách bịt — chỉ số composite ở mức scenario, fail-closed** — `HYPOTHESIS — cần validate` · `[inferred]`:

```text
scenario "reproduced"  ⟺  (a) replay CHẠY TỚI KẾT QUẢ
                      VÀ  (b) verdict rubric §3.4 = Execution matched

scenario KHÔNG replay được  ⇒  KHÔNG reproduced
                            ⇒  KHÔNG bị loại khỏi mẫu số

chỉ số gate  =  (số scenario reproduced) / 7
ngưỡng gate  =  ≥ 6/7
```

**Với `K = 3` lần replay** (`K` `CHỐT` tại [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.3): một scenario chỉ được tính **reproduced** khi **cả 3 lần** đều cho verdict `Execution matched` — **fail-closed**. Ba lần khác verdict ⇒ **không** reproduced (hệ quả ở mức scenario, độc lập với nhãn nguyên nhân), và mỗi lần `diverged` được quy trách nhiệm theo [§3.6](#36-thủ-tục-quy-trách-nhiệm-divergence--khớp-đầu-tiên-thắng) — nơi *"`K` lần cho khác verdict"* là **điều kiện quan sát của bước 4** (`out-of-scope-determinism`) và **chỉ kết luận được khi các bước 1 · 2 · `2b` · 3 không khớp trước**. Tín hiệu bất ổn định luôn được giữ dưới dạng cờ `replay_unstable` ([§3.6.1](#361-phán-quyết-thứ-tự--vì-sao-out-of-scope-determinism-ở-bước-4-không-phải-bước-1)), khớp với `S7`/`U-25` ở §2.2.

> **Nguyên tắc chung của cả `L1`–`L3` lẫn composite, phát biểu một câu**: **bằng chứng thiếu ⇒ tính là KHÔNG đạt, KHÔNG phải loại khỏi mẫu số.** Mọi cơ chế ở §4.6 và §4.7 chỉ là các hệ quả thao tác được của câu này.

> ⚠️ **Composite là CHỈ SỐ GATE, KHÔNG THAY THẾ hai chỉ số §23.**
>
> `C2` **vẫn** tổng hợp và báo cáo **cả** Replay Success Rate **và** Execution Match Rate **thô** đúng theo định nghĩa §23 — đó là exit criteria của `C2` và không bị §4 sửa đổi. Composite là chỉ số **thứ ba**, dùng để phán quyết `≥ 6/7`.
>
> ⇒ **Ba con số PHẢI cùng xuất hiện ở `C4`**: `RSR` (§23) · `EMR` thô (§23, mẫu số **danh nghĩa** `D × K = 21` theo [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.2 — **và chính mẫu số này co lại khi replay không chạy**, đó là lỗ rò mô tả ở trên) · **chỉ số composite** (mẫu số **cố định** `7`). In thiếu một trong ba là in một bức tranh không kiểm chứng được — và đúng chỗ thiếu đó là chỗ lỗ rò ẩn nấp.

### 4.7 Ba luật chống gian lận thống kê — dạng thao tác được

[§1.4](#14-ba-luật-chống-gian-lận-thống-kê) nêu **nguyên tắc**; mục này viết ra **thao tác**.

| Luật | Thao tác cụ thể | Ai / lúc nào | Vi phạm trông như thế nào |
|---|---|---|---|
| **`L1` — Đóng băng** | Tập **7 scenario** của §4.3 **và** **toàn bộ verdict kỳ vọng** của từng scenario (gồm nhánh (A) của scenario 6) được ghi vào **`verdict.md`** của run, cùng `K = 3` | 👤 `@TrisJr` duyệt tại **`Gate A`**, **trước khi `C1` chạy dòng đầu tiên** | Một verdict kỳ vọng xuất hiện lần đầu trong `C3`/`C4`; hoặc `verdict.md` không có bảng này |
| **`L2` — Bánh cóc một chiều** | Denominator **chỉ co, không bao giờ nở**. ① Scenario trong observation set — **dù pass** — **không** được kéo vào. ② Rời denominator chỉ được qua **đúng ba con đường** ở bảng `L2-a` ngay dưới; ngoài ba con đường đó, **không** có cách hợp lệ nào | Theo từng con đường — xem `L2-a` | Một scenario rời denominator mà **không** truy được về một trong ba artifact bằng chứng của `L2-a`; hoặc denominator ở `C4` **lớn hơn** 7; hoặc lần co **không** được in theo `L3` |
| **`L3` — Báo cáo hai mẫu số** | Denominator co lại ⇒ `C4` in **cả hai**: **`7`** (số đóng băng tại `Gate A`) **và** số đã co, **kèm lý do co từng scenario** | 🧪 QA tại `C4` | `C4` chỉ in một mẫu số |

**Bảng `L2-a` — ba con đường co hợp lệ** (`[inferred]` — hợp nhất ba phát biểu đã có trong tài liệu, **không** thêm con đường mới):

| # | Con đường co | Mốc thời gian | Ai ghi lý do / ở đâu | Neo trong tài liệu |
|:--:|---|---|---|---|
| **①** | **`M-1` hỏng** — trigger không tái tạo được lỗi `K/K` lần trên môi trường production-like | Tại **`B8`**, lý do phải có ngày tháng **trước `C1`** | 🧪 QA ghi tại `B8`; 🎩 PM xác nhận **trước `C1`** | [§4.2](#42-sáu-tiêu-chí-m-1m-6) `M-1` |
| **②** | **Hypothesis §3.8 (`U-13`) hoặc §3.9 (`U-16`) bị spike BÁC BỎ** ⇒ mất verdict kỳ vọng của scenario `SC-4` hoặc `SC-6` ⇒ `M-5` hỏng | **Tại hoặc SAU `C1`** — bằng chứng bác bỏ chỉ tồn tại sau khi chạy. **Không** phải ở `B8` | 🧪 QA ghi bằng chứng bác bỏ tại **`C3`**; `C4` in **hai mẫu số** theo `L3` | §4.3 ghi chú *"chiều ngược lại"*; [§3.8](#38-u-13--ngữ-nghĩa-clock-lúc-replay-hypothesis), [§3.9](#39-u-16--drift-phiên-bản-là-warning-hay-fatal-hypothesis) |
| **③** | **Cổng `inconclusive` khớp** — execution **không thuộc** hoặc **không kiểm được** Supported Execution Class ⇒ rubric §3.4 **không chạy** ⇒ loại khỏi denominator | **Tại `C1`**, ở cổng lớp — **trước** rubric | Khối **`class_assessment`** ghi vào chính capsule (§2.6) là bằng chứng gốc; 🧪 QA đối chiếu và ghi tại **`C3`**; `C4` in hai mẫu số theo `L3` | [§3.5](#35-inconclusive-là-một-cổng-đứng-trước-rubric-không-phải-verdict-thứ-ba); [§2.6](#26-iii-hành-vi-khi-execution-rơi-ra-ngoài-class--ba-thời-điểm-ba-hành-vi) |

> **Vì sao phải liệt kê đủ ba, không được rút gọn về ①**: `L3` (in hai mẫu số) chỉ kích hoạt **khi một lần co được thừa nhận là một lần co**. Nếu chỉ ① được công nhận, hai con đường ② và ③ sẽ làm mẫu số nhỏ đi mà `C4` **không** phải in số gốc — đúng hành vi mà `L3` tồn tại để chặn, đạt được **mà không vi phạm chữ nào** của luật viết thiếu.
>
> **Con đường ③ KHÔNG mâu thuẫn với yêu cầu *"công bố TRƯỚC khi chạy"* của [§2.6](#26-iii-hành-vi-khi-execution-rơi-ra-ngoài-class--ba-thời-điểm-ba-hành-vi)**: §2.6 nói về execution **đã biết trước** là ngoài class (như probe `SC-11`) — loại **trước**, không phải một lần co. Còn ③ là ca một scenario **đã đóng băng trong tập 7** rơi vào cổng `inconclusive` **lúc chạy** — một **phát hiện tại runtime**, nên nó là **lần co theo `L2`** và **bắt buộc kích hoạt `L3`**. Hai thứ khác nhau về thời điểm biết, đừng gộp.

> **Vì sao `L2` cấm cả trường hợp "scenario ngoài denominator lại pass"** — đây là chỗ dễ bị coi là quá khắt khe. Một scenario ở observation set pass **là một tin tốt và phải được báo cáo**; nhưng kéo nó vào mẫu số **sau khi biết nó pass** làm tỷ lệ tăng mà **năng lực sản phẩm không đổi một chút nào**. Nơi đúng để tin tốt đó phát huy tác dụng là `C3`, `D2` và vế *"Không"* của §39 — không phải tử số của một ngưỡng.

### 4.8 Observation set — `{7, 9, 10}` + probe `SC-11`

Ba scenario OUT **không** bị bỏ. Chúng **vẫn được dựng fixture tại `B8`** và **vẫn chạy đủ 7 bước tại `C1`** — đúng như ghi chú của [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) §4: *"denominator chỉ đúng khi ta biết thật sự scenario nào chạy được và scenario nào không — biết bằng cách thử, không bằng cách giả định"* `[stated Timeline §4]`.

| Thuộc tính | Nội dung |
|---|---|
| **Thành viên** | Scenario **7** (Randomness) · **9** (Async behavior) · **10** (Race condition) · **probe `SC-11`** (định nghĩa tại [§2.5](#25-quyết-định-g1--gap-redis)) |
| **Vẫn làm gì** | Dựng fixture (`B8`), chạy đủ 7 bước §22 và `K = 3` lần replay (`C1`) |
| **Kết quả ghi ở đâu** | **Ghi RIÊNG**, tách khỏi mọi phép tính của chỉ số gate |
| **Dùng để làm gì** | `C3` (phân loại lớp bug **không** replay được) · `D2` (nâng hypothesis lên định nghĩa, hoặc **giữ nguyên gap kèm lý do**) · và vế **"Không"** của §39 (*"identify which classes of bugs cannot be replayed and narrow the product scope accordingly"* `[stated §39]`) |
| **Không bao giờ dùng để** | Đóng góp vào tử số hoặc mẫu số của chỉ số gate — kể cả khi pass (`L2`) |

> **`SC-11` nằm ở đây là đúng chỗ theo cấu tạo, không phải một lần co mẫu số.** §2.5 đã ghi: `SC-11` **chưa bao giờ** nằm trong tập đóng băng ở `Gate A`, nên việc nó ở ngoài **không** kích hoạt `L2`/`L3`. Mục đích chính của `SC-11` cũng khác ba scenario kia: nó **kiểm chính thủ tục quy trách nhiệm §3.6** (phải ra `diverged` + `incomplete-capture`, **không** phải `out-of-scope-determinism`), chứ không đo năng lực replay.

### 4.9 Phụ thuộc cứng — điều kiện làm sụp lựa chọn ở §4.5

> [!CAUTION]
> **Lựa chọn EMR ở §4.5 SỤP HOÀN TOÀN nếu §3 không cho ra một rubric nhị phân chạy tay được.**
>
> EMR đếm *"equivalent executions"*. Không có rubric nhị phân thì **không có phép đếm nào tồn tại** — mọi con số EMR sẽ là một phán đoán chủ quan đội lốt tỷ lệ, tức vi phạm chính định nghĩa `meaningful` ở §4.1.
>
> **Khi đó `A4` KHÔNG ĐƯỢC âm thầm tụt về Replay Success Rate.** Phải **escalate lên `Gate A` như một `BLOCKER`**, theo đường escalate chuẩn (`escalations.md` → PM tổng hợp kèm phản biện → `@TrisJr` quyết → ghi `verdict.md`).
>
> **Vì sao tụt về RSR không phải một giải pháp dự phòng**: RSR trả lời *"replay có chạy xong không"*; EMR trả lời *"execution có đi đúng đường không"*. Tụt về RSR là **đổi cả câu hỏi mà `GATE-06` trả lời** — và đổi nó **âm thầm**, ở giữa phase, sau khi ngân sách đã được cấp cho câu hỏi cũ. Đó là một quyết định của `@TrisJr`, không phải một điều chỉnh kỹ thuật của `A4`.

**Điều kiện tối thiểu của rubric để §4.5 đứng vững** (đối chiếu [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §7.2, cùng nội dung ở một tài liệu khác):

1. Rubric xuất ra **verdict nhị phân** `matched` / `diverged` — hiện có tại [§3.4](#34-ngưỡng-nhị-phân--điều-kiện-của-execution-matched). ✅
2. Rubric xuất ra **chỉ số đơn vị phân kỳ đầu tiên** — hiện có tại §3.4, bắt buộc theo `ADR-011 D2`. ✅
3. Rubric **chạy tay được** trên một ví dụ — hiện có tại §3.7. ✅

⇒ Tại thời điểm viết, cả ba điều kiện đã được §3 đáp ứng ở **dạng hypothesis**. Nếu spike bác bỏ bất kỳ điều nào, `C4` **không** được tự chọn chỉ số thay thế; nó báo cáo dữ liệu và trả câu hỏi về `GATE-06`.

### 4.10 Điểm yếu đã biết của hypothesis `ACG-02` + `ACG-03` — `X1`–`X6`

Bắt buộc theo [§1.2](#12-quy-ước-nhãn--bắt-buộc-dùng-xuyên-suốt) quy tắc 3 — hypothesis không nói được nó sai ở đâu thì spike không bác bỏ được nó, và nó sẽ tự động "đúng".

| # | Điểm yếu | Mức |
|:--:|---|:--:|
| **`X1`** | **Cỡ mẫu 7 quá nhỏ để ngưỡng có ý nghĩa thống kê.** Một scenario = 14.3 pp; toàn bộ phán quyết `GATE-06` treo trên *"sai tối đa 1"*. Cảnh báo ở §4.4 làm cho điều này **nhìn thấy được**, nhưng **không xoá** nó — và không có cách nào xoá nó trong phạm vi 10 scenario của §22 | 🔴 |
| **`X2`** | **Toàn bộ §4.5 sụp nếu rubric §3 không nhị phân được.** Phụ thuộc một chiều, không có phương án lùi hợp lệ ở tầng `A4` — xem [§4.9](#49-phụ-thuộc-cứng--điều-kiện-làm-sụp-lựa-chọn-ở-45) | 🔴 |
| **`X3`** | **Định nghĩa `meaningful` hẹp ⇒ kết luận của spike KHÔNG nói gì về lớp execution ngoài class** — gồm cả lớp phụ thuộc cache (`G1`), randomness, async không đóng, và race condition. Observation set định lượng một phần cái giá này, nhưng không xoá nó | 🟠 |
| **`X4`** | **Chỉ số composite ở §4.6 chưa từng được validate.** Nó là **đề xuất của tài liệu này**, không có trong §23 và không có trong `RQ.md`. Nếu `B7` không xuất được nó ở dạng máy đọc được, `C4` sẽ chỉ có hai chỉ số §23 — tức lỗ rò quay lại nguyên vẹn. Ràng buộc này phải tới được `B7` **trước** `C1` | 🟠 |
| **`X5`** | **`M-1` chỉ kiểm được sau khi đóng băng.** Một scenario có thể vào denominator tại `Gate A` rồi hỏng `M-1` tại `B8` ⇒ denominator co ngay trước khi chạy. `L2`/`L3` làm việc co **minh bạch**, nhưng ở `D = 7` thì mỗi lần co đổi luôn ngưỡng hiệu dụng (`6/7` → `5/6` → `4/5`), và mỗi lần đổi làm ngưỡng **dễ hơn** | 🟠 |
| **`X6`** | **Việc áp `M-2`/`M-3`/`M-4` lên 10 scenario là phép đọc THIẾT KẾ fixture, không phải phép đo.** Fixture chưa tồn tại tại thời điểm §4.3 được viết. Nếu `B8` dựng fixture khác với giả định ở §4.3 — ví dụ scenario 9 được dựng đóng gọn trong cửa sổ request — bảng §4.3 sẽ lệch thực tế. `L2` **cấm** sửa theo hướng nới mẫu số; đúng cách xử lý là ghi nhận ở `C3` và để `D2` quyết | 🟠 |

---

## 5. Shortcut ledger

### 5.1 Vì sao mục này tồn tại

Đây là **control cho rủi ro `TL-r4`** — *"code spike bị tái dùng thầm lặng cho V0.1"* (🟠 High, [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) §12).

Cần nói thẳng một điều: **prefix nhánh `spike/` là một quy ước, không phải một control.** Nó đặt nhãn lên branch, nhưng nó **không** ngăn được việc một file trong `src/spike/` được copy sang `src/`, và nó **không** ghi lại **cái gì đã bị bỏ qua** trong file đó. Khi tới `P1`, người review một module tái dùng sẽ phải trả lời câu hỏi *"module này đã bỏ qua những gì?"* — và nếu không có ledger, câu trả lời đó **dựa vào trí nhớ** về một quyết định xảy ra nhiều tuần trước, bởi cùng một người đang muốn tái dùng nó. Đó không phải review, đó là hợp lý hoá.

Ledger biến câu hỏi đó thành một **bảng tra cứu**.

### 5.2 Bảng ledger

**Quy tắc ghi**: ghi **ngay lúc phát sinh** — cùng PR với đoạn code bỏ qua requirement, không ghi hồi tố. Một mục ghi hồi tố **không** có giá trị chứng minh, vì nó chỉ chứng minh rằng người viết **nhớ ra** vào lúc viết, không chứng minh rằng việc bỏ qua là **có ý thức** vào lúc bỏ qua.

Năm dòng dưới đây là **pre-register tại `A1`** — chúng được ghi **trước khi** `P0-B` bắt đầu, vì chúng suy ra trực tiếp từ phạm vi `P0-B` đã cấp vốn ở [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) §4. Chúng là **ngoại lệ được nêu tên**, không phải tiền lệ cho việc ghi hồi tố.

| `SEC-xxx` bị bỏ qua | Ai bỏ | Vì sao | File/module | Ngày |
|---|---|---|---|---|
| `SEC-027` — verify hash/signature **trước khi** parse payload | Phạm vi `P0-B`, task `B4` (🧑‍💻 Engineer) — pre-register tại `A1` | `B4` là *"capsule writer tối thiểu — **KHÔNG** phải capsule format v1"*; exit criteria của nó chỉ đòi artifact **tự chứa** và mở được sau khi môi trường gốc bị destroy. Không có digest/signature trong artifact ⇒ **không có gì để verify**. Capsule spike được coi là dữ liệu của chính mình — giả định này **sai với V0.1** (`THREAT-009`) nhưng chấp nhận được khi capsule không rời máy | `src/spike/capsule/`, `src/spike/replay/` | 2026-08-15 |
| `SEC-001` — redaction lỗi ⇒ **không persist** bản ghi | Phạm vi `P0-B`, task `B3` (🧑‍💻 Engineer) — pre-register tại `A1` | **Không có redaction engine trong `P0-B`.** `B3` capture đúng 8 nhóm của §18 và không có bước redaction nào ⇒ nhánh *"redaction ném lỗi"* không tồn tại để fail closed | `src/spike/recorder/` | 2026-08-15 |
| `SEC-011` — không có config ⇒ dùng **built-in default profile**, không bao giờ *"no redaction"* | Phạm vi `P0-B`, task `B3` (🧑‍💻 Engineer) — pre-register tại `A1` | Cùng lý do: **không có redaction engine trong `P0-B`** ⇒ recorder spike chạy ở đúng trạng thái *"không rule nào khớp"* mà `SEC-011` tuyên bố phải là **bất khả thi** ở V0.1. Hệ quả trực tiếp `[inferred]`: **dữ liệu dùng trong spike phải là dữ liệu tổng hợp, không phải dữ liệu production thật** | `src/spike/recorder/` | 2026-08-15 |
| `SEC-015` — capsule được mã hoá AEAD ở storage, storage không giữ khoá | Phạm vi `P0-B` (🧑‍💻 Engineer) — pre-register tại `A1` | **Capsule spike KHÔNG được mã hoá at rest.** Không có key store trong `P0-B` (`U-06d` vẫn là blocker mở), và crypto-shred không nằm trong phạm vi spike | `src/spike/capsule/` và nơi lưu capsule spike | 2026-08-15 |
| `SEC-018` / `SEC-019` / `SEC-020` — authn + authz deny-by-default, giới hạn scope theo service/team, audit log append-only | Phạm vi `P0-B` (🧑‍💻 Engineer, ⚙️ DevOps) — pre-register tại `A1` | **Không có authn / authz / audit trên nơi lưu capsule spike.** Cả ba là `MUST-V0.1` thuộc OSS core, nhưng `P0-B` không dựng collector có kiểm soát truy cập; capsule spike nằm ở storage cục bộ không phân quyền và mọi thao tác lên nó **không để lại dấu vết** | nơi lưu capsule spike (`src/spike/`) | 2026-08-15 |

> **Đọc bảng trên đúng cách**: nó **không** nói năm requirement này là tuỳ chọn. Nó nói rằng ở `P0-B` chúng **bị bỏ qua có ý thức**, và mọi module trong bảng **mang nợ** đúng những requirement đó khi muốn rời `src/spike/`.

### 5.3 Quy tắc tại `P1` — điều kiện để một module rời `src/spike/`

1. **Module được tái dùng phải được review như code mới.** Không kế thừa trạng thái *"đã chạy được rồi"*: việc nó đã chạy đúng trong spike là bằng chứng về **spike**, không phải bằng chứng về **V0.1** — hai thứ có tập requirement khác nhau, và §5.2 liệt kê đúng phần chênh lệch.
2. **Module phải thoả tập `MUST-V0.1` áp cho nó — TRƯỚC KHI rời `src/spike/`**, không phải sau. Tra tập này ở [Spec-Security-Repro-Threat-Model](./Security/Spec-Security-Repro-Threat-Model.md) mục 11, đối chiếu với các dòng ledger mang tên module đó.
3. **Việc tái dùng phải là một quyết định tường minh, có văn bản, ở `P1`** — không phải một PR "dọn dẹp" di chuyển thư mục. Mặc định là **viết lại**; tái dùng là ngoại lệ phải được biện hộ.

### 5.4 Hai control kèm theo

**(a) CI import-guard.**

> Bất kỳ build nào **ngoài** phạm vi spike mà resolve tới một path nằm dưới `src/spike/` ⇒ **fail build**.

Đây là phần biến `TL-r4` từ *"rủi ro dựa vào kỷ luật"* thành *"rủi ro bị chặn bởi máy"*. Ledger ghi lại **cái gì đã bị bỏ qua**; import-guard đảm bảo phần bị bỏ qua đó **không âm thầm đi vào** đường build của sản phẩm. Ledger không có import-guard vẫn dựa vào trí nhớ; import-guard không có ledger thì chặn được việc rò rỉ nhưng không nói được **vì sao** module đó nguy hiểm.

**(b) Không publish bất cứ thứ gì trong Phase 0.**

> **Cấm** đẩy artifact của spike lên bất kỳ registry nào, đặc biệt **cấm** dùng tên gần với `@repro/node`.

Lý do lấy thẳng từ `THREAT-019` ở [Spec-Security-Repro-Threat-Model](./Security/Spec-Security-Repro-Threat-Model.md): recorder chạy **in-process** trong production, nên `@repro/node` là *"vị trí đắt nhất mà một attacker chuỗi cung ứng có thể chiếm được"*, và `THREAT-019` là threat có **impact lớn nhất trong toàn bộ threat model**. Publish một artifact spike — code `throwaway`, không có provenance, không có lockfile pinned, đã bỏ qua năm nhóm requirement ở §5.2 — dưới một cái tên gần với package thật là **tự tay tạo ra vector của `THREAT-019`** trước khi sản phẩm kịp tồn tại. Việc chiếm chỗ tên trên registry, nếu cần, là một quyết định riêng của `P1`/`P3`, không phải việc của Phase 0.

---

## 6. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | **Nguồn** của bốn khoảng hở `ACG-01`, `ACG-02`, `ACG-03`, `ACG-07` (mục 7) mà tài liệu này đóng ở dạng hypothesis |
| [ADR-006 — Execution Verification By Equivalence](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) | Quyết định kiến trúc mà rubric `ACG-01` ở §3 phải tương thích |
| [ADR-010 — Bounded Determinism Scope](./Architecture/ADR-010-Bounded-Determinism-Scope.md) | Ranh giới determinism — đầu vào cho Supported Execution Class ở §2 |
| [ADR-011 — Execution Diff First Class](./Architecture/ADR-011-Execution-Diff-First-Class.md) | Diff là first-class ⇒ ràng buộc đầu ra của rubric §3 |
| [ADR-005 — Default Deny Write Side Effects](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) | Ràng buộc an toàn khi replay trong spike (`B5`) |
| [Spec-Security-Repro-Threat-Model](./Security/Spec-Security-Repro-Threat-Model.md) | Nguồn của mọi mã `SEC-xxx` và `THREAT-019` dùng ở §5 |
| [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) | **Measurement plan** — sở hữu `ACG-04`, `ACG-05`, `ACG-11` và **Known-Missing-Input Manifest** (§1.5). *Được tạo trong cùng run bởi task `A5`* |
| [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) | Nguồn của task `A1`–`A4`, `Gate A`, `GAP-Redis`, và rủi ro `TL-r4` |
| [RQ.md](../999-Resources/RQ.md) | Tài liệu gốc — §22 (technical validation before MVP), §39 (recommended next step) |
