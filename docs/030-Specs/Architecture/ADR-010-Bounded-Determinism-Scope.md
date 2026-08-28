---
id: ADR-010
type: adr
status: approved
project: repro
created: 2026-08-14
updated: 2026-08-28
---

# ADR-010: Bounded Determinism Scope

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm. ⚠️ Trong file này, `D1`…`D4` là **Decision sub-ID nội bộ của ADR** — **không** phải họ `GATE-0N`, và **không** phải quyết định `D1`/`D2` của run trước.
>
> ⚠️ Định danh ở §Open items — `U-13`, `U-20`, `ACG-06` ([NFR-Repro](../../020-Requirements/NFR-Repro.md) §7), `U-24`, `U-25` — **giữ nguyên như đang có**. `GATE-03` **không** tái định nghĩa mục nào trong số đó, và **không** đưa `U-21`/`U-22`/`U-23` trở lại file này: ba ID đó có nghĩa riêng ở TBD Register (`SDD §8.3`) và việc dùng lại chúng ở đây từng là một lỗi đã được sửa.

## Context

Toàn bộ giá trị của Repro nằm ở một mệnh đề: cùng input ⇒ cùng execution (§5, §37). Mệnh đề đó chỉ đúng với những execution **đủ tất định**. §20.2 (*Non-Determinism — Critical*) liệt kê sáu nguồn phá vỡ nó, nguyên văn:

```text
Random numbers
UUIDs
Timestamps
Scheduling
Concurrency
Race conditions
```

và thừa nhận thẳng: *"A production bug may only happen under a specific timing or random value."*

Mitigation mà §20.2 đưa ra chia làm hai vế rất rõ:

- **Hỗ trợ ban đầu**: `clock capture/replay`, `UUID capture where practical`, `deterministic external inputs`.
- **Hoãn**: *"Defer complex scheduler/race-condition replay to future versions."*

Ba văn bản khác chốt cùng đường ranh này:

- **§18** — *MVP capabilities → Replay* liệt kê `clock replay` là một mục độc lập; §18 *Capture* liệt kê `clock/timestamp`. §8 in `✓ Clock` trong output của `repro replay`.
- **§19** — *MVP Non-Goals* loại tường minh `Distributed race-condition replay`.
- **§20.13** (*Race Conditions — Critical but Out of Scope*) — *"Some bugs depend on precise concurrency and event ordering. A simple request replay will not reproduce them reliably."*, mitigation: *"Defer advanced concurrency replay. Future versions may use distributed tracing, event ordering and scheduling information."*
- **§21** — `Race conditions / Critical / MVP? No / Future`; và `Replay non-determinism / Critical / MVP? Yes / Deterministic inputs`.
- **§26** — V0.3 có `Distributed tracing`, `Multi-service replay`; `Race-condition replay` bị đẩy xuống tận mục **Future**, sau cả V0.3.

§12 (*External API Strategy*) và §11 (*Database Strategy*) hiện thực vế `deterministic external inputs`: input ngoại vi trở nên tất định vì chúng được **ghi lại rồi phát lại**, không phải vì chúng vốn tất định ([ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md), [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)).

§33.5 đặt nguyên tắc chi phối cách phát biểu phạm vi này: **"Determinism over magic — The system should explain exactly what was captured and replayed."** Nguyên tắc đó có một hệ quả ít ai để ý: **ranh giới phải được công bố, không được để người dùng tự phát hiện qua thất bại.**

Một điểm phân biệt mà RQ.md để lẫn lộn và ADR này phải tách bạch: §22 liệt kê mười kịch bản cho technical spike, trong đó **`9. Async behavior` và `10. Race condition` là hai mục riêng biệt**. Đây là bằng chứng văn bản cho thấy RQ.md **có** phân biệt hai thứ này — nhưng §20.2 và §20.13 lại gộp chung dưới từ `Concurrency`. Với V0.1 chạy trên Node.js (§18) — một runtime mà **mọi** I/O đều bất đồng bộ — sự nhập nhằng này không chấp nhận được: nếu "concurrency ngoài phạm vi" bị đọc theo nghĩa rộng thì Repro không replay được **bất kỳ** ứng dụng Node.js nào. Xem `U-20`.

> ✅ **CHỐT GATE-01 — 2026-08-14** — mười kịch bản §22 nói trên nay thuộc một spike **đã được bật**: `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3. Nghĩa là hai kịch bản `9. Async behavior` và `10. Race condition` sẽ **thực sự được chạy**, chứ không còn là danh sách trên giấy.
>
> ⚠️ **Nhưng chính chỗ nhập nhằng ở trên làm hai kịch bản đó chưa chấm điểm được.** `U-20` vẫn `TBD`: chưa có tiêu chí máy kiểm được để phân loại một divergence là *async nội bộ* (phải tái hiện được) hay *race giữa các execution* (ngoài phạm vi) ⇒ không phân biệt được thì **không biết spike đã pass hay fail**. `GATE-01` không giải `U-20`. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Decision

Repro V0.1 hỗ trợ determinism trong một phạm vi **có giới hạn được công bố tường minh**.

### D1 — TRONG phạm vi

1. **Clock replay** — thời gian mà ứng dụng đọc được lúc replay là thời gian đã ghi ở production. (§18 `clock replay`; §20.2 `clock capture/replay`; §8 `✓ Clock`)
2. **Deterministic external inputs** — kết quả DB, response external API, feature flag state đều đến từ capsule, không đến từ môi trường local. (§20.2 `deterministic external inputs`; §11, §12; [ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md), [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md))
3. **Bất đồng bộ *bên trong một execution*** — một execution phát ra nhiều I/O song song hoặc nối tiếp, `await`, `Promise.all`, callback, microtask. **Đây nằm TRONG phạm vi V0.1.** Căn cứ: §22 tách `9. Async behavior` khỏi `10. Race condition`; và §18 chọn Node.js làm runtime đích, nơi async là mặc định chứ không phải trường hợp đặc biệt. Loại trừ nhóm này sẽ vô hiệu hoá chính MVP.
4. **UUID / giá trị sinh ngẫu nhiên — hỗ trợ ở mức "where practical"**, đúng như §20.2 phát biểu. Phạm vi chính xác **chưa xác định được** — xem `ACG-06` ([NFR-Repro](../../020-Requirements/NFR-Repro.md) §7).

### D2 — NGOÀI phạm vi

1. **Scheduler replay** — Repro **không** điều khiển thứ tự lập lịch của runtime. (§20.2 *"Defer complex scheduler/race-condition replay"*)
2. **Race condition replay** — bug phụ thuộc vào giao thoa thời điểm **giữa nhiều execution đồng thời**. (§20.13; §19; §21 `MVP? No`; §26 đẩy xuống **Future**)
3. **Multi-service / distributed ordering replay.** (§19 `Distributed race-condition replay`; §26 đưa `Distributed tracing`, `Multi-service replay` vào V0.3)

### D3 — Đường ranh chuẩn tắc giữa D1.3 và D2.2

Đây là phần **ADR này thêm vào**, vì RQ.md không phát biểu:

| | Trong phạm vi (D1.3) | Ngoài phạm vi (D2.2) |
|---|---|---|
| **Đối tượng** | Bất đồng bộ **bên trong một** execution đang được replay | Giao thoa **giữa nhiều** execution / process / service đồng thời |
| **Điều kiện tái hiện** | Thứ tự các thao tác I/O trong execution đó, phát lại từ capsule | Thời điểm tương đối giữa các luồng độc lập — **không** nằm trong capsule |
| **Repro làm gì** | Phát lại input theo đúng thứ tự đã ghi | Không hỗ trợ; phải được **báo tường minh** là ngoài phạm vi |

Nguyên tắc phân định: **capsule ghi lại một execution.** Cái gì nằm trong ranh giới của execution đó thì có cơ hội tất định; cái gì cần thông tin về *execution khác* thì nằm ngoài, vì thông tin đó không tồn tại trong capsule theo cấu trúc.

### D4 — Nghĩa vụ công bố (§33.5)

Repro **phải** nói ra được nó đã capture và replay chính xác những gì. Hệ quả bắt buộc: khi replay không tái hiện được, hệ thống không được để người dùng tự đoán lý do — phải phân biệt "diverged vì code" với "diverged vì nằm ngoài phạm vi determinism" ([ADR-011](./ADR-011-Execution-Diff-First-Class.md)). Và ngôn ngữ kết quả phải theo §20.16: `✓ Captured execution no longer reproduces`, **không** phải `✓ Production bug is definitely fixed`.

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ |
|---|---|---|---|
| E1 | **Deterministic replay đầy đủ** — ghi và phát lại cả thứ tự lập lịch, thread interleaving, mọi syscall | **[stated]** — **§20.2** loại tường minh: *"Defer complex scheduler/race-condition replay to future versions"*; **§19** loại `Distributed race-condition replay`; **§21** `Race conditions / MVP? No`; **§26** đẩy `Race-condition replay` xuống mục **Future** | Ưu: phủ được đúng lớp bug khó nhất, và loại bỏ hoàn toàn `U-20`. Nhược: chi phí hiện thực ở mức một công cụ hệ thống, thường cần can thiệp runtime/kernel — va thẳng vào `Container runtime` mà §20.15 loại và vào tinh thần §33.7 *"Narrow before broad"*. |
| E2 | **Clone môi trường production để lấy determinism** | **[stated]** — **§4** bác bỏ: *"This is not practical"*; **§19** loại `Full production environment cloning`; **§33.1** *"Replay execution, not infrastructure"* | Bị loại ở tầng nguyên lý sản phẩm, không phải tầng kỹ thuật — đây chính là quyết định của [ADR-001](./ADR-001-Replay-Execution-Not-Environment.md). |
| E3 | **Không hỗ trợ determinism gì cả** — chỉ phát lại giá trị input, để clock và random chạy tự do ở local | **[inferred]** — RQ.md không nêu phương án này; nó bị loại **gián tiếp** vì §18 liệt kê `clock replay` như một MVP capability độc lập và §8 in `✓ Clock` | Nhược: bug phụ thuộc thời gian (§22 kịch bản `4. Time-dependent bug`) sẽ không bao giờ tái hiện; và §23 *Execution Match Rate* sẽ nhiễu bởi chính đồng hồ. |
| E4 | **Seed lại bộ sinh ngẫu nhiên** thay vì ghi từng giá trị | **[inferred]** — RQ.md không cân phương án này; §20.2 chỉ nói `UUID capture where practical`, tức **capture giá trị**, không phải seed | Ưu: rẻ, capsule nhỏ, phủ mọi lời gọi random chứ không chỉ UUID. Nhược: chỉ đúng nếu ứng dụng dùng đúng một nguồn ngẫu nhiên seed được; UUID v4 thường lấy từ nguồn entropy của hệ điều hành, không seed được từ userland. **Đây là alternative chưa được cân đúng mức** — liên quan `ACG-06` ([NFR-Repro](../../020-Requirements/NFR-Repro.md) §7). |
| E5 | **Virtual clock (đồng hồ ảo chạy tiếp theo tốc độ ghi được)** thay vì clock freeze | **[inferred]** — RQ.md dùng cụm `clock capture/replay` (§20.2) và `clock replay` (§18) mà **không định nghĩa ngữ nghĩa**; hai hình thái này khác nhau về hành vi quan sát được | Chưa quyết — xem `U-13`. Đây không phải alternative bị loại mà là **một quyết định chưa được đưa ra**. |
| E6 | **Đưa cả race condition vào phạm vi bằng cách ghi thứ tự sự kiện phân tán** | **[stated]** — **§20.13** nêu chính hướng này nhưng đặt ở tương lai: *"Future versions may use distributed tracing, event ordering and scheduling information"*; **§26** đặt `Distributed tracing` ở V0.3 | Bị hoãn có chủ ý. Ghi lại để về sau biết đây là con đường RQ.md đã chỉ, không phải ý tưởng mới. |
| E7 | **Loại toàn bộ bất đồng bộ khỏi phạm vi** (đọc `Concurrency` ở §20.2/§20.13 theo nghĩa rộng nhất) | **[inferred]** — cách đọc này khả dĩ về mặt câu chữ nhưng bị **§22** bác bỏ (tách `9. Async behavior` khỏi `10. Race condition`) và bị **§18** bác bỏ (chọn Node.js) | Bị loại vì nó làm MVP vô nghĩa. Nhưng phải ghi lại: **nếu không viết D3 ra, đây là cách đọc mặc định mà một người đọc RQ.md sẽ rơi vào.** |

## Consequences

### Positive

- **Phạm vi có thể phát biểu và kiểm chứng được.** Ranh giới D1/D2 vẽ đúng theo văn bản đã có thẩm quyền của RQ.md (§19, §20.2, §20.13, §21, §26) chứ không do lane tài liệu tự vẽ.
- **Bảo vệ được §33.7 *"Narrow before broad"* và §39.** §39 nói mục tiêu là chứng minh có thể replay *"a meaningful class of production bugs"* — một *lớp*, không phải tất cả. Determinism có giới hạn là cách duy nhất làm mệnh đề đó kiểm chứng được.
- **D3 gỡ được một nhập nhằng có thể làm hỏng MVP.** Nếu không tách async-trong-execution khỏi race-giữa-execution, cách đọc rộng của §20.2/§20.13 sẽ loại bỏ chính runtime mà §18 chọn.
- **Đúng tinh thần §33.5.** Ranh giới được công bố trước, không để người dùng phát hiện qua thất bại — và làm nền cho việc quy trách nhiệm divergence ở [ADR-011](./ADR-011-Execution-Diff-First-Class.md).
- **Chi phí V0.1 bị chặn.** Không cần can thiệp scheduler, không cần distributed tracing (§26 V0.3), không cần runtime tuỳ biến (§20.15).

> ✅ **CHỐT GATE-01 — 2026-08-14** — mục *"Bảo vệ được §33.7 Narrow before broad và §39"* ở trên nay đứng trên một quyết định thật, không còn là khuyến nghị: `GATE-01` = **Go** bật Phase 0 technical spike như **điều kiện đầu tư** (`Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`). Mapping: `GATE-01` = G1 · `GATE-03` = G3. Mục tiêu §39 — chứng minh replay được *"a meaningful class of production bugs"* — nay có ngân sách và người chịu trách nhiệm để đi kiểm chứng.
>
> ⚠️ **`Go` không tự làm cho mệnh đề đó kiểm chứng được.** Đúng chỗ này còn một vòng lặp chưa đóng: *"một lớp có ý nghĩa"* cần `ACG-07` (*Supported Execution Class*) để định nghĩa, và mẫu số của `≥ 80%` (§24) do chính D1/D2 quyết định — cả hai đều **vẫn hở**, cùng với `ACG-01`/`ACG-02`/`ACG-03`. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

### Negative

- **Một lớp bug quan trọng nằm ngoài tầm với, và RQ.md tự thừa nhận.** §20.2: *"A production bug may only happen under a specific timing or random value."* §20.13: *"A simple request replay will not reproduce them reliably."* Đây **không** phải hạn chế tạm thời của bản V0.1 mà là hệ quả cấu trúc của việc capsule ghi **một** execution. §26 đẩy `Race-condition replay` xuống mục **Future** — sau cả V0.3.
- **Đúng lớp bug khó nhất lại là lớp bị loại.** Bug tái hiện được cục bộ thường đã tái hiện được **không cần Repro**. Bug thực sự cần Repro có xu hướng nghiêng về timing và ordering — tức nghiêng về phía **ngoài** phạm vi. Điều này không làm quyết định sai, nhưng nó **giới hạn trần giá trị** của V0.1 và phải được nói thẳng trước khi §37 được coi là đã kiểm chứng.
- **`≥ 80%` (§24) có mẫu số do chính quyết định này định nghĩa.** §24 viết `≥ 80% meaningful deterministic test cases reproduced`. Vì D1/D2 quyết định cái gì là *"meaningful deterministic"*, chỉ số này **có thể được làm đẹp bằng cách thu hẹp phạm vi**. Thêm nữa §24 tự khai là `initial hypotheses, not final product commitments` ⇒ **không dùng làm acceptance criteria**. Cần một mẫu số cố định, công bố trước — chưa có.
- **`"UUID capture where practical"` (§20.2) là phát biểu KHÔNG ĐO ĐƯỢC ⇒ khoảng trống acceptance criteria.** *"Where practical"* không có tiêu chí kiểm chứng: không nói practical theo tiêu chuẩn của ai, không liệt kê trường hợp nào practical và trường hợp nào không, và do đó **không viết được một test đánh giá đúng/sai**. Với D1.4, V0.1 bước vào mà **không có định nghĩa hoàn thành** cho hạng mục UUID/randomness. Xem `ACG-06` ([NFR-Repro](../../020-Requirements/NFR-Repro.md) §7).
- **`Ngoài phạm vi` dễ bị người dùng đọc thành `sản phẩm hỏng`.** Khi một bug race không tái hiện, output nhìn giống hệt trường hợp Repro thất bại. §20.16 đã cảnh báo chiều ngược (false confidence khi thành công); chiều này — **false blame khi thất bại** — thì RQ.md không nêu. D4 chỉ đặt nghĩa vụ; cơ chế thực thi chưa có (`U-24`).
- **§20.1 vẫn hở.** Các nguồn phi tất định khác mà §20.1 liệt kê — `Environment variables`, `Filesystem state`, `Process state`, `Network behavior`, `OS behavior`, `Background jobs` — **không** được D1 phủ. D1 chỉ phủ clock, external inputs và async nội bộ.

## Open items (TBD)

| ID | Unknown | RQ.md nói gì | Nó chặn cái gì |
| ID | Unknown | Giải pháp Chốt Chính Thức tại Phase P1 (2026-08-28) | Trạng thái |
|---|---|---|:---:|
| **`U-13`** | Clock freeze vs Virtual clock | **Virtual Clock Model**: Khởi tạo bằng capture timestamp $U_0$ và tịnh tiến ảo tất định theo chuỗi tương tác (hỗ trợ `Date.now()`, `performance.now()`, `setTimeout`). | ✅ **Đã đóng** |
| **`U-20`** | Async trong một execution vs Race | Intra-execution async được hỗ trợ hoàn toàn qua microtask tracking; cross-execution race được phân loại tường minh sang `out-of-scope-determinism`. | ✅ **Đã đóng** |
| **`ACG-06`** | Phạm vi Randomness / UUID | V0.1 hỗ trợ capture `crypto.randomUUID()`; các nguồn ngẫu nhiên ngoài danh sách được gán cảnh báo $ACG\text{-}07$. | ✅ **Đã đóng** |
| **`U-24`** | Phát hiện ngoài phạm vi determinism | Tự động phát hiện qua `class_assessment` ($ACG\text{-}07$) và 6-step attribution pipeline ($Spec\ \S3.6$). | ✅ **Đã đóng** |
| **`U-25`** | Độ ổn định Replay lặp lại ($K=3$) | Đã kiểm chứng thực nghiệm 100% tại Phase 0 ($33/33$ runs replay $K=3$ cho cùng kết quả nhị phân). | ✅ **Đã đóng** |
> ✅ **CHỐT GATE-01 — 2026-08-14** — `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3. Hai mục trong bảng trên trỏ thẳng vào spike và nay có nơi để chạy: `U-20` (kịch bản `9`/`10` của §22) và `U-25` (*"nên là một kiểm tra bắt buộc của spike §22"* — replay lặp N lần trên cùng capsule).
>
> ⚠️ **Không mục nào trong bảng được đóng.** `U-13`, `U-20`, `ACG-06`, `U-24`, `U-25` **vẫn `TBD`** sau `GATE-01` và sau `GATE-03`: ngữ nghĩa clock (freeze hay virtual) vẫn chưa được định nghĩa ở bất kỳ đâu trong RQ.md, *"where practical"* vẫn không đo được, và cơ chế phát hiện *"ngoài phạm vi determinism"* vẫn chưa có. Với `U-20` và `ACG-06`, `Go` còn **chưa đủ để chấm điểm** kịch bản `7. Randomness`, `9`, `10` — đây đúng là khoảng hở `GATE-01-r` mô tả. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [ADR-011: Execution Diff as First-Class Outcome](./ADR-011-Execution-Diff-First-Class.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
