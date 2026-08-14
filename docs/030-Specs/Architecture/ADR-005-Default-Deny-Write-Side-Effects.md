---
id: ADR-005
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-005: Default-Deny Write Side Effects

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.

## Context

`RQ.md` §13 mở đầu bằng một câu tuyệt đối: *"Replaying production must never accidentally repeat dangerous side effects."* Danh sách ví dụ của §13: charge credit card, send email, create shipment, send webhook, delete record, publish Kafka event.

§13 mô tả cơ chế: Repro phải phân biệt

```text
READ                 WRITE
────                 ─────
SELECT               INSERT
GET                  UPDATE
Cache read           DELETE
                     POST payment
                     Publish event
```

và quy định hành vi lúc replay: `READ → return recorded result`; `WRITE → do not execute against real production systems → return recorded result`. §13 kết: *"This must be a core safety mechanism."*

§20.4 xếp Side Effects ở mức **Critical** và ghi mitigation: *"Default-deny write behavior during replay. Recorded responses should be returned instead of executing real side effects."* §21 xác nhận: `Side effects | 🔴 Critical | MVP? Yes | Default-deny writes`.

§33.6 nâng lên thành product principle số 6 — *"Safe by default: Replay must never accidentally trigger production side effects."*

§18 liệt kê *"safe side-effect handling"* trong nhóm MVP Replay capabilities.

**Vì sao cơ chế mà RQ.md mô tả là chưa đủ.** `findings/architect.md` (`U-12`) và `findings/security-auditor.md` (`SEC-032`, `SEC-033`) — hai lens độc lập — cùng chỉ ra: phân loại **theo verb tại các sink đã instrument** *fail-open đúng ở chỗ nguy hiểm nhất — cái nó không nhận diện được*. Các ví dụ cụ thể được nêu:

- `net.Socket` thô — không đi qua HTTP client đã instrument.
- `child_process` gọi `curl` — rời hẳn process, không sink nào thấy.
- SDK dùng transport riêng — request rời máy mà không chạm HTTP client đã instrument.
- `WITH x AS (UPDATE ...) SELECT ...` — câu lệnh **bắt đầu bằng `WITH`**, mọi phép so khớp verb ở đầu chuỗi đều đọc nhầm thành read.
- `SELECT charge_customer(...)` — verb là `SELECT`, tác dụng là tính phí.
- `CALL ...` — stored procedure, verb không nằm trong cả hai danh sách của §13.
- `GET /v1/send?to=...` — ngữ nghĩa write trên một HTTP verb thuộc nhóm READ của §13.

Điểm chung: mỗi ví dụ **không** phải lỗi triển khai mà là hệ quả cấu trúc của việc dùng **denylist các verb ghi**. Denylist chỉ chặn được cái nó nhận ra; thứ nó không nhận ra sẽ đi qua. Với một control mà chế độ hỏng là *"đã tính tiền thẻ thật"*, fail-open là không chấp nhận được.

**Hai lens độc lập cùng kết luận fail-closed** ⇒ đủ mạnh để viết như **quyết định**, không phải TBD.

## Decision

**Trong replay, mọi write side effect bị chặn mặc định. Việc chặn được thực thi *fail-closed*: một interaction chỉ được ra ngoài nếu nó đã được *chứng minh* là read.**

1. **Default-deny, không có opt-out ở V0.1.** Không có cờ CLI, không có biến môi trường, không có tuỳ chọn cấu hình nào bật lại write thật (§13, §20.4, §33.6).
2. **Đảo chiều mặc định: từ "denylist các verb ghi" sang "allowlist những gì đã chứng minh là read".** Bất kỳ interaction nào *không phân loại được*, *không nhận diện được*, hoặc *nằm ngoài tầm phân loại* đều bị **từ chối**, không được coi là read.
3. **Thực thi hai lớp:**
   - **L1 — phân loại tại sink đã instrument.** Đây là cơ chế §13 mô tả (verb SQL, HTTP method) và nó **được giữ**, vì chỉ L1 mới *trả lời được* read bằng recorded result. Nhưng L1 chỉ có thẩm quyền **cho phép**, không có thẩm quyền **bảo đảm**.
   - **L2 — chặn egress ở mức process, với allowlist chỉ gồm loopback + replay proxy.** L2 là lưới an toàn cho mọi thứ L1 không nhìn thấy: socket thô, child process, SDK có transport riêng. L2 không cần hiểu ngữ nghĩa — nó chỉ cần bảo đảm *không có gì rời máy*.
4. **Interaction không phân loại được ⇒ bị chặn *và* được báo cáo tường minh** như một outcome của replay, không nuốt im lặng (§33.5 *"Determinism over magic"*).
5. **Write bị chặn trả về recorded result nếu có** (§13, §20.4). **Khi không có**: áp `E9` — divergence + incomplete capture, **không** crash, **KHÔNG** fallback gọi hệ thống thật. Giá trị trả về cụ thể là **TBD** (§Open items).
6. **Áp cho mọi execution mode chạy code ứng dụng**, bao gồm cả diff mode. §9 hiển thị `Local → tax = 12.43` — một giá trị *thật* của môi trường local, hàm ý dependency local **đã bị gọi** — trong khi §11/§12 nói replay layer trả recorded result. Nếu diff mode có gọi dependency thật thì ADR này **phải** áp ở đó; ngược lại đó là một lỗ hổng side-effect. (Quyết định về diff mode thuộc [ADR-011](./ADR-011-Execution-Diff-First-Class.md); ràng buộc thì phát biểu ở đây.)

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Denylist theo verb tại các sink đã instrument** (đúng cơ chế RQ.md mô tả) | **[stated]** §13 | **Giữ làm L1, loại làm cơ chế *duy nhất*.** Lý do: 7 lớp bypass ở §Context. Denylist chỉ chặn được cái nó nhận ra; và cái nó không nhận ra chính là chỗ nguy hiểm nhất. |
| A2 | **Cho phép write chạy vào môi trường local/sandbox** thay vì chặn | **[inferred]** | RQ.md không nêu. Loại: §33.6 và §20.4 nói *never accidentally trigger*; ngoài ra kết quả replay khi đó phụ thuộc state local ⇒ phá thẳng tiêu chí equivalence của [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md). Và "local" không phải bảo đảm: một endpoint cấu hình sai vẫn trỏ ra production. |
| A3 | **Cho phép write kèm xác nhận, hoặc kèm cờ `--allow-writes`** | **[inferred]** | RQ.md không nêu. Loại cho V0.1: §13 *"must be a core safety mechanism"*, §33.6 *"never accidentally"*. Một cờ đặt đường nguy hiểm cách người dùng đúng một phím, trong khi §20.14 lại đẩy sản phẩm về phía dùng CLI không ma sát. Chỉ nên xem xét lại **sau khi** L2 tồn tại và được kiểm chứng. |
| A4 | **Dry-run / rollback transaction cho write DB** (mở transaction rồi luôn rollback) | **[inferred]** | RQ.md không nêu. Loại làm cơ chế chính: chỉ phủ sink database, không làm gì cho email, payment, webhook, event — mà đó mới là danh sách §13 sợ nhất; đồng thời đòi một kết nối DB thật, thứ [ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md) vừa loại bỏ. |
| A5 | **Dựa vào developer trỏ cấu hình local sang endpoint không phải production** | **[inferred]** | Loại: đây **chính là** tai nạn mà §20.4 mô tả. Cấu hình là quy ước, không phải control. |
| A6 | **Chỉ chặn egress ở mức mạng, bỏ phân loại tại sink** | **[inferred]** | Loại làm cơ chế duy nhất: chặn được thì replay *dừng*, nhưng không *trả lời* được read bằng recorded result — mà trả lời chính là công việc của replay (§11, §12). L1 và L2 bổ sung nhau, không thay thế nhau. |
| A7 | **Không chặn gì, chỉ ghi log những side effect đã xảy ra** | **[inferred]** | Loại: §13/§20.4/§33.6 đều đòi *ngăn*, không đòi *quan sát*. Log sau khi thẻ đã bị tính tiền là vô nghĩa. |

## Consequences

### Positive

- **Đóng risk Critical §20.4 bằng một control có chế độ hỏng đúng chiều**: khi control sai, hậu quả là *replay dừng*, không phải *email đã gửi đi*.
- **Fail-closed loại bỏ được cả một lớp bypass chưa biết tên.** L2 không cần liệt kê hết các đường thoát; nó chỉ cần bảo đảm biên.
- **L2 đồng thời phòng thủ cho hướng ngược lại**: một capsule độc hại ép replay runtime kết nối tới host do bên khác chọn sẽ bị chặn bởi cùng allowlist (nối với `SEC-027` ở [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md)).
- **Cái gì đã rời process trở nên kiểm toán được** — điều kiện cần để nói thật với khách hàng về residual risk.
- **Phục vụ trực tiếp §33.6 và §33.5**: an toàn mặc định, và giải thích được chính xác cái gì đã bị chặn.
- **Hai lens độc lập cùng kết luận** ⇒ quyết định này có bằng chứng chống lưng mạnh hơn phần lớn quyết định khác trong tập ADR này.

### Negative

- **Fail-closed sẽ chặn nhầm những read hợp lệ mà bộ phân loại không chứng minh được.** Với người dùng, việc này trông giống lỗi sản phẩm, và nó tạo áp lực đòi một cửa thoát. Đây là cách control an toàn thực sự chết trong đời thực: **bị người dùng vô hiệu hoá, không phải bị bypass kỹ thuật.**
- **L2 (chặn egress mức process) phụ thuộc hệ điều hành và làm nặng một sản phẩm mà luận điểm adoption là `npm install @repro/node` + `repro.init()`** (§20.14, Critical product risk). Nó cũng kéo Repro về phía *"Network proxy"* / *"Container runtime"* — đúng hai thứ §20.15 liệt kê như biểu hiện của scope explosion. **Đây là căng thẳng thật giữa hai risk Critical, và ADR này chọn nghiêng về phía an toàn.**
- **§13 và §18 không khớp nhau về việc write có được ghi hay không.** §13 nói lúc replay `WRITE → return recorded result`, tức là giả định kết quả của write **đã được ghi ở production**. Nhưng §18 danh sách capture chỉ có *"database query/result"* và *"external HTTP response"*, không nói gì về việc ghi kết quả của write (id sinh tự động, `RETURNING`, số row bị ảnh hưởng, response của `POST payment`). Nếu không ghi, thì "return recorded result" không thực hiện được — [inferred], xem §Open items.
- **Chặn write làm execution lệch khỏi production ở mọi chỗ mà *kết quả* của write ảnh hưởng logic phía sau** (id vừa sinh, số row, response của payment). Đây là chi phí fidelity trả cho an toàn, và nó nuôi thẳng vào §20.3 (false replay equivalence, Critical).
- **Không có cơ chế nào ở đây chặn side effect *không đi qua mạng và không đi qua DB***: ghi file, `process.exit`, sinh process con, thay đổi state chỉ trong bộ nhớ. §20.1 nêu hidden **input**; bài toán đối xứng là hidden **output**, và RQ.md không đặt tên cho nó ở bất kỳ đâu — [inferred].
- **Không có metric nào đo an toàn.** §23 đo Replay Success Rate, Execution Match Rate, Capture Overhead, Capsule Size, Replay Time — **không có** chỉ số nào kiểu "số side effect đã thoát ra". §22 có kịch bản #8 *"Side effect"* nhưng không có tiêu chí đạt/không đạt. Nghĩa là risk Critical này hiện **không có bằng chứng chấp nhận** nào được định nghĩa.
- **Diff mode là lỗ hổng tiềm tàng**: §9 hàm ý dependency local đã bị gọi thật, §11/§12 nói ngược lại. Chừng nào mâu thuẫn này chưa được giải ở ADR-011, phạm vi thực thi của ADR-005 chưa khép kín.

## Open items (TBD)

| ID | Unknown | Phương án đề xuất (nhãn) | Nó chặn cái gì |
|---|---|---|---|
| **`U-12`** | **Phân loại READ/WRITE — *hướng* đã chốt là fail-closed** (hai lens độc lập đồng thuận), nhưng **độ phủ của bộ phân loại thì chưa**. Cụ thể chưa định nghĩa: hình dạng SQL nào được tính là "đã chứng minh là read" (`WITH`, `CALL`, function gọi trong `SELECT`, multi-statement), và hình dạng HTTP nào (một `GET` có ngữ nghĩa write thì sao). | L1 chỉ cho qua khi khớp một tập hẹp, được liệt kê tường minh, và **không có lời gọi function/procedure**; mọi thứ khác đi vào nhánh từ chối. *cần validate bằng dữ liệu thật ở spike §22 (#8)*. | Chặn định nghĩa allowlist của L1; chặn phát biểu residual risk trong threat model; chặn khả năng nói thật với khách hàng về mức bảo đảm. |
| — | **Write chưa được record thì trả về gì.** §13 giả định luôn có recorded result; RQ.md không nói gì về trường hợp không có. Ba phương án: (a) giả lập thành công, (b) trả lỗi tường minh, (c) dừng execution và báo divergence. | Nghiêng về (b) hoặc (c): giả lập thành công (a) là *dựng* một sự thật chưa từng xảy ra ở production, mâu thuẫn §33.5. *cần validate*. | Chặn phân loại outcome của [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md); chặn exception flow của use case replay; chặn ngữ nghĩa exit code của `repro replay` (§18). |
| — | **Phạm vi L2 cho V0.1**: chặn ở tầng runtime (vá module mạng trong process) hay ở tầng hệ điều hành (namespace/sandbox). | V0.1: tầng runtime, đủ để phủ `net.Socket` và HTTP client; tầng OS phủ được cả `child_process` nhưng đắt hơn nhiều. *cần validate* — đây là đúng chỗ căng thẳng với §20.14/§20.15. | Chặn quyết định đóng gói replay runtime (thư viện vs process wrapper), thuộc [ADR-007](./ADR-007-In-Process-SDK-Interception.md); chặn ma trận nền tảng được hỗ trợ. |
| — | **Kết quả của write có được capture ở production không** (§13 vs §18). | TBD — nếu có thì capsule format v1 phải chừa chỗ ngay (ADR-002); nếu không thì §13 phải được đọc lại. | Chặn ngữ nghĩa entry `database/` và `network/` trong capsule format v1; chặn chính quyết định #5 ở trên. |
| — | **Bằng chứng chấp nhận cho risk Critical này.** §22 có kịch bản #8 *"Side effect"* nhưng §23 không có metric tương ứng và §24 không có ngưỡng. | Thêm một kiểm chứng dạng phủ định vào spike: *không có gì rời process* trong toàn bộ 10 kịch bản, đo bằng L2. *cần validate*. | Chặn kết luận go/no-go của §39 đối với risk Critical §20.4. |
| — | **Ràng buộc lên diff mode.** §9 hàm ý gọi dependency local thật; §11/§12 nói replay trả recorded result. | ADR này áp cho mọi mode chạy code ứng dụng. Quyết định về diff mode thuộc [ADR-011](./ADR-011-Execution-Diff-First-Class.md). | Chặn tính khép kín của phạm vi thực thi ADR-005; nếu diff mode gọi thật mà không áp default-deny thì đây là lỗ hổng side-effect. |

> ✅ **CHỐT GATE-01 — 2026-08-14** — spike §22 **đã được bật**: `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3. Điều này chạm hai mục ở trên: `U-12` (*cần validate bằng dữ liệu thật ở spike §22 #8*) và mục **bằng chứng chấp nhận** cho risk Critical §20.4 — kịch bản **#8 *Side effect*** của §22 nay đã có nơi để chạy, và kiểm chứng dạng phủ định (*không có gì rời process* trong toàn bộ 10 kịch bản, đo bằng L2) đã có phương tiện để thực hiện.
>
> ⚠️ **Cả hai mục VẪN mở.** `GATE-01` **không** đặt metric ở §23 cũng **không** đặt ngưỡng ở §24 cho risk này — hai chỗ thiếu đó vẫn thiếu, nên §22 #8 vẫn **chưa có tiêu chí đạt/không-đạt**; `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` cũng vẫn hở. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [ADR-011: Execution Diff First-Class](./ADR-011-Execution-Diff-First-Class.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
