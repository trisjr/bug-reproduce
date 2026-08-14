---
id: ADR-006
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-006: Execution Verification By Equivalence

**Decision status**: Proposed
**Related to**: [SDD-Repro](./SDD-Repro.md)

## Context

`RQ.md` §10 phát biểu yêu cầu: *"Repro should not simply verify that a replay completed. It should determine whether the execution was sufficiently equivalent."*

Ví dụ của §10 so sánh bốn đại lượng giữa production và local — `DB result: null`, `tax: 0`, `flag: true`, và **`execution path: A → B → C`** — rồi kết luận `✓ Execution matched`. Trường hợp lệch được minh hoạ bằng `Production: A → B → C` vs `Local: A → B → D`. §10 giải thích vì sao điều này cần thiết: *"This prevents a dangerous situation where Repro says 'replay succeeded' even though the application did not actually follow the same execution path."*

§20.3 xếp risk tương ứng ở mức **Critical** — Replay Without True Equivalence: *"A replay may complete successfully while following a different execution path. This creates false confidence."* Mitigation của §20.3: *"Make Execution Verification a core feature"*, và phân biệt `Replay completed` với `Execution matched`. §21 xác nhận: `False replay equivalence | 🔴 Critical | MVP? Yes | Execution verification`.

§20.16 (Critical) siết phần ngôn ngữ — False Confidence About Fixes: một replay thành công chỉ chứng minh *"This captured execution no longer fails"*, không chứng minh mọi biểu hiện production của bug đã hết (ví dụ race condition vẫn còn). Mitigation: dùng chính xác câu `✓ Captured execution no longer reproduces` **thay vì** `✓ Production bug is definitely fixed`. §21: `False confidence | 🔴 Critical | Yes | Explicit replay semantics`.

§18 đặt *execution verification*, *execution diff*, và *code/version mismatch detection* vào nhóm Analysis của MVP, và cho `repro verify` một lệnh riêng bên cạnh `repro replay` và `repro diff`.

§8 mô tả vòng làm việc: bước 3 `repro replay 1842` → `💥 BUG REPRODUCED`; bước 4 developer sửa code; bước 5 `repro verify 1842` → `Before fix: ✗ reproduced / After fix: ✓ execution no longer reproduces`.

§23 định nghĩa **Execution Match Rate** = `Equivalent executions / Total replays` — một metric **tách riêng** khỏi Replay Success Rate.

**Khoảng trống trung tâm.** §10 dùng đúng ký hiệu `A → B → C` nhưng **RQ.md không định nghĩa A, B, C là gì** ở bất kỳ đâu, và cũng **không định nghĩa "sufficiently equivalent"**. `findings/architect.md` (`U-04`) gọi đây là *unknown lớn nhất của cả tài liệu*, và `findings/business-analyst.md` (`ACG-01`) độc lập chỉ ra cùng chỗ. Điều này chặn chính ADR này — mà ADR này lại là mitigation cho risk **Critical** §20.3.

**Khoảng trống thứ hai, không có trong RQ.md.** `findings/architect.md` (`U-08`): sau khi developer sửa code (§8 bước 4), execution path **đương nhiên** khác — và đó là dấu hiệu **thành công**. Nhưng §10 định nghĩa "diverged" là dấu hiệu **xấu**. Cùng một tín hiệu, hai nghĩa trái ngược ⇒ `replay` và `verify` cần **hai bộ tiêu chí equivalence khác nhau**. RQ.md không hề nói điều này.

## Decision

**Thành công của một replay được định nghĩa bằng *execution equivalence*, không bằng việc process chạy xong.**

1. **Hai kết quả tách bạch, không thay thế nhau: `Replay completed` và `Execution matched`** (§20.3). Sản phẩm không được phép trình bày cái thứ nhất như thể là cái thứ hai. Đây là ràng buộc lên cả CLI output, exit code, và mọi tài liệu.
2. **Ngôn ngữ kết quả tuân thủ §20.16 nguyên văn**: `Captured execution no longer reproduces`. **Cấm** mọi phát biểu dạng "production bug đã được sửa".
3. **Equivalence được tính trên các chiều đã ghi**, tối thiểu gồm: giá trị input đã record (DB result, external response, feature flag — §10 so sánh đúng ba thứ này) **cộng** một tín hiệu về **execution path** (§10).
4. **Định nghĩa cụ thể của "execution path" và của "sufficiently equivalent" là TBD.** ADR này **cố ý không định nghĩa** — xem `U-04` ở §Open items. Việc viết ra một định nghĩa dứt khoát ở đây sẽ là bịa ra một cơ sở mà nguồn không có, và nó sẽ trở thành nền cho toàn bộ tính khả tín của sản phẩm.
5. **Verification là một stage phân tích riêng**, tách khỏi việc chạy replay (§18), và output của nó là đầu vào cho Execution Diff (§9, [ADR-011](./ADR-011-Execution-Diff-First-Class.md)).
6. **`replay` và `verify` là hai câu hỏi khác nhau và do đó có thể cần hai bộ tiêu chí equivalence khác nhau** (`U-08`). `replay` hỏi *"execution này có lặp lại như production không?"*; `verify` hỏi *"execution này còn thất bại như cũ không?"* — sau khi code đã đổi. Quyết định ở đây là **thừa nhận sự khác biệt và không dùng chung một bộ tiêu chí**; nội dung từng bộ là TBD.
7. **Kết quả không kết luận được phải hiện ra như một trạng thái riêng**, không được gộp vào "matched" hay "diverged" (§33.5 *"Determinism over magic"*).

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Lấy "replay chạy xong" làm tiêu chí thành công** | **[stated]** §10, §20.3 | RQ.md nêu và loại tường minh ở cả hai chỗ: §10 *"Repro should not simply verify that a replay completed"*; §20.3 *"A replay may complete successfully while following a different execution path. This creates false confidence."* |
| A2 | **Chỉ so sánh output** (HTTP response hoặc exception ném ra) | **[inferred]** | RQ.md không nêu. Hấp dẫn vì rẻ, trung lập ngôn ngữ, không cần instrument path. Loại **làm tiêu chí duy nhất** bằng chính ví dụ của §10: input giống nhau và output giống nhau vẫn có thể đến từ `A → B → D`. **Giữ lại làm tín hiệu sàn nếu `U-04` không giải được — nhãn "cần validate".** |
| A3 | **So sánh danh tính exception** (cùng error type + cùng stack trace) | **[inferred]** | §18 có capture stack trace và §2.1 minh hoạ `TypeError: Cannot read properties of undefined`, nên đây là tín hiệu sẵn có. Loại làm tiêu chí chính: stack trace dịch chuyển theo **mọi** thay đổi code — đúng use case chính (§8 bước 4). Giữ làm tín hiệu bổ trợ. |
| A4 | **Deterministic record/replay đầy đủ ở tầng instruction hoặc syscall, so sánh trace** | **[inferred]** | RQ.md không nêu. Loại: §20.7 (overhead trên production), §20.15 (scope explosion — *"Container runtime"*), §20.14 (adoption phải ở mức `npm install` + `repro.init()`). |
| A5 | **So sánh theo coverage** (tập dòng/nhánh đã chạy) | **[inferred]** | RQ.md không nêu. Là một cách vận hành hoá `A → B → C` hợp lý và có công cụ sẵn trong hệ sinh thái Node.js. **Không bị loại — là một ứng viên dưới `U-04`, chưa được chọn.** |
| A6 | **So sánh chuỗi interaction tại boundary** (thứ tự các lời gọi DB/HTTP mà ứng dụng phát ra) | **[inferred]** | RQ.md không nêu. Ưu điểm: chỉ dùng thứ Repro **đã** chặn được ở [ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md)/[ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md), không cần instrument thêm. Nhược: giòn theo cùng cơ chế với `U-02` khi code đổi. **Ứng viên dưới `U-04`, chưa được chọn.** |
| A7 | **Để developer tự nhìn diff và tự kết luận** | **[inferred]** | Loại **làm câu trả lời của sản phẩm**: §20.3 nói verification phải là *core feature*, không phải bài tập về nhà. Nhưng §9 cho thấy diff-cho-người vẫn là lối ra hợp lệ khi verification không kết luận được — giữ làm fallback, không làm cơ chế. |

## Consequences

### Positive

- **Đánh trực diện một risk Critical** (§20.3, §21) bằng chính mitigation mà RQ.md chỉ định.
- **Bảo vệ tài sản dễ mất nhất của sản phẩm: niềm tin.** Một công cụ reproducibility nói "thành công" khi thực ra đi đường khác sẽ mất uy tín một lần và không lấy lại được.
- **Ép ngôn ngữ chính xác** (§20.16, §33.5) — điều mà một sản phẩm dễ dàng làm sai theo hướng có lợi cho marketing.
- **Sinh ra đúng tín hiệu Execution Diff cần** (§9): biết *ở đâu* lệch, không chỉ biết *có* lệch.
- **Làm cho §23 Execution Match Rate có nghĩa** như một chỉ số độc lập với Replay Success Rate — hai câu hỏi khác nhau, hai con số khác nhau.
- **Thừa nhận `replay` ≠ `verify` sớm** tránh được một lỗi thiết kế mà nếu phát hiện muộn sẽ phải sửa cả CLI contract lẫn capsule format.

### Negative

- **Khái niệm trung tâm chưa được định nghĩa (`U-04`).** ADR này là một cam kết mà tiêu chí hiện thực của nó chưa tồn tại. Đây là unknown lớn nhất của toàn bộ tài liệu nguồn, và nó nằm ngay dưới mitigation cho một risk Critical.
- **§20.16 vẫn đứng nguyên bất kể verification tốt đến đâu.** Ngay cả một execution matched cũng chỉ chứng minh *"This captured execution no longer fails"*. Race condition (§20.13) vẫn có thể còn. Verification **không thể** cung cấp mức bảo đảm mà người dùng sẽ tự đọc vào nó.
- **Mọi tín hiệu ở tầng path đều tốn instrumentation *ở production*** — vì bản ghi tham chiếu phải được tạo ra tại production. Điều này va thẳng §20.7 (*"Repro must never become the reason production becomes slower or fails"*) và va giả thuyết `< 5%` latency overhead ở §24 — mà §24 tự nói bốn con số của nó là *"initial hypotheses, not final product commitments"*.
- **Redaction làm nhiễu chính tín hiệu này.** §16 đổi giá trị trước khi ghi ⇒ capsule đã redact có thể diverge vì lý do do chính Repro gây ra. Bù trừ đã chốt ở [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md) (capsule ghi lại field nào đã bị redact) nhưng nó **thêm** một nguyên nhân divergence phải phân loại, không bớt.
- **Nhiều trạng thái kết quả hơn ⇒ bề mặt UX phức tạp hơn**, đi ngược áp lực đơn giản hoá của §25 (demo trong 60–90 giây — đây là **ràng buộc UX cho demo**, không phải chỉ tiêu hiệu năng).
- **Không có dữ liệu để hiệu chỉnh.** Tiêu chí quá chặt ⇒ báo diverged liên tục trên capsule thật, người dùng bỏ tính năng; quá lỏng ⇒ khôi phục đúng cái false confidence mà §20.3 cảnh báo. Chưa có gì để chọn điểm giữa.
- **Execution bất đồng bộ phá giả định về thứ tự** (`U-20`): cùng một hành vi đúng có thể cho thứ tự interaction khác nhau; so sánh chuỗi ngây thơ sẽ gọi những replay đúng là "diverged".
- **`U-11` chưa được giải**: interaction không khớp là "diverged" hay là một hạng kết quả riêng — chưa có câu trả lời, mà nó là ca phổ biến nhất sau khi developer sửa code.

## Open items (TBD)

| ID | Unknown | Phương án đề xuất (nhãn) | Nó chặn cái gì |
|---|---|---|---|
| **`U-04`** | **Định nghĩa "execution path" và "sufficiently equivalent" — TBD LÕI, unknown lớn nhất của cả tài liệu.** §10 dùng ký hiệu `A → B → C` nhưng RQ.md **không định nghĩa A, B, C là gì**, và **không định nghĩa** *"sufficiently equivalent"*. Hai lens độc lập (`U-04` của architect, `ACG-01` của business-analyst) cùng chỉ ra chỗ hở này. | **Không có phương án nào được chọn.** Các ứng viên, tất cả gắn nhãn *cần validate*: (a) chuỗi interaction tại boundary — dùng lại thứ đã chặn được, không cần instrument thêm; (b) chữ ký nhánh/coverage; (c) checkpoint do developer khai báo tường minh; (d) output + danh tính exception làm tín hiệu sàn. **CẤM viết bất kỳ mục nào ở trên như đã chốt.** | Chặn **chính ADR này** — mà ADR này là mitigation cho risk Critical §20.3. Chặn phần biểu diễn execution trace trong capsule format v1 ([ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md) — thêm sau là breaking change). Chặn metric §23 Execution Match Rate (không định nghĩa được tử số). Chặn bước *"Verify execution"* trong quy trình spike §22 và do đó chặn kết luận go/no-go §39. **Sau `M1` (✅ ĐÃ CHỐT 2026-08-14, xem dưới), nó chặn thêm một bậc**: chỉ số thành công của V0.1 nay là *số bug đạt trạng thái `Execution matched`* (§10), nên `U-04` không chỉ chặn ADR này mà chặn **chính khả năng đếm** chỉ số thành công của V0.1 — không định nghĩa được equivalence thì không đếm được `Execution matched`. **`U-04` vẫn `TBD`; quyết định `M1` không giải nó**, chỉ làm nó đắt hơn khi còn mở. |
| **`U-08`** | **`verify` phải phân biệt "diverged vì đã fix" với "diverged vì môi trường lệch".** Sau khi sửa code (§8 bước 4), execution path **đương nhiên** khác — đó là dấu hiệu **thành công**. Nhưng §10 định nghĩa "diverged" là dấu hiệu **xấu**. Cùng một tín hiệu, hai nghĩa trái ngược ⇒ `replay` và `verify` cần **hai bộ tiêu chí equivalence khác nhau**. **RQ.md không hề nói điều này.** | `verify` neo vào *sự vắng mặt của failure gốc* cộng *sự bảo toàn của các input đã ghi*, chứ **không** neo vào sự trùng khớp của execution path; `replay` thì ngược lại. *cần validate*. | Chặn hợp đồng của lệnh `repro verify` (§18, §8, §25) gồm cả output và exit code; chặn use case "verify fix"; chặn việc phát biểu ý nghĩa của `Before fix / After fix` ở §8. |
| **`U-20`** | **Thứ tự bất đồng bộ *bên trong một* execution.** §20.13 hoãn *race condition* giữa các execution, nhưng non-determinism về thứ tự **trong** một request (nhiều query/HTTP call chạy song song) nằm **trong** phạm vi V0.1 — và RQ.md không phân biệt hai thứ này ở bất kỳ đâu. | So sánh equivalence phải có khái niệm "tập đồng thời": các interaction phát ra song song thì so như tập, không so như dãy. *cần validate*. | Chặn `U-04` (không quyết được so-theo-thứ-tự hay không thì không định nghĩa được equivalence); chặn `U-02` (định danh query theo thứ tự càng giòn hơn khi có song song); chặn tính ổn định của kết quả `repro replay` giữa các lần chạy. |
| **`N-05`** | **Chỉ số thành công chính thức của V0.1 chưa có tiêu chí pass/fail.** Sau `M1` (✅ ĐÃ CHỐT 2026-08-14, xem dưới), chỉ số thành công của V0.1 là *số bug đạt trạng thái `Execution matched`* (§10) — đại lượng được đo bởi đúng metric này. `N-05` vì thế **không còn là một metric phụ thiếu ngưỡng**; nó là **thước đo chính của V0.1**. §23 yêu cầu đo `Equivalent executions / Total replays`. §24 đặt ngưỡng cho bốn thứ khác (`≥80%` reproduced, `<5%` latency overhead, `<10MB` capsule, `<30s` replay) — và §24 **tự nói** chúng là *"initial hypotheses, not final product commitments"* — nhưng **không có ngưỡng nào cho match rate**, dù §20.3 và §21 xếp false replay equivalence là **Critical**. Cộng với `U-04`, V0.1 vừa **chưa tính được** chỉ số thành công của mình, vừa **chưa có tiêu chí đạt/không-đạt** cho nó. | Không bịa số. Cần một ngưỡng, và nó phải đến từ dữ liệu của spike §22 chứ không từ tài liệu. *cần anh chốt sau spike*. | Chặn mọi cổng đạt/không-đạt cho spike (§39) đối với đúng risk mà ADR này tồn tại để giảm thiểu; chặn khả năng nói "verification đã đủ tốt". **Và nay chặn thêm**: không có ngưỡng thì **không phát biểu được V0.1 thành công hay thất bại**, vì đây chính là chỉ số định nghĩa thành công của V0.1. Đây là chỗ hở nghiêm trọng nhất còn lại của ADR này. |
| **`U-11`** | **Interaction không khớp được phân loại thế nào**: divergence hay một hạng kết quả riêng ("incomplete capture"). | Hạng riêng — gộp vào "diverged" sẽ trộn *"code local khác"* với *"capsule thiếu"*, hai nguyên nhân đòi hai hành động khác nhau. *cần validate*. | Chặn phân loại outcome dùng chung với ADR-003 và ADR-005; chặn cách trình bày của `repro diff` (§9). |
| — | **Nguyên nhân divergence phải phân loại được**: do code, do redaction (§16 — đã chốt ở ADR-002), do code/version mismatch (§15), do schema drift (§20.9), do external dependency drift (§20.10), do capsule thiếu (`E9`). RQ.md §9 chỉ trình bày divergence, không phân loại nguyên nhân. | Phân loại tường minh trong output của verification. *cần validate*. | Chặn giá trị sử dụng của §9 Execution Diff (một divergence không quy được nguyên nhân thì không hành động được); chặn `U-08`. |

### Mâu thuẫn M1 — ✅ ĐÃ CHỐT 2026-08-14

> Bối cảnh hai phía bên dưới **được giữ nguyên có chủ đích**. `RQ.md` vẫn tự nói ngược ở chính những section được trích; quyết định của người có thẩm quyền chỉ nói **ta chọn phía nào**, nó không làm mâu thuẫn ở nguồn biến mất.

- **`M1` — Regression test generation ở V0.1 hay V0.2?** §26 xếp ở **V0.2**. Nhưng §25 Killer Demo in `✓ Regression case generated` **ngay trong output của `repro verify`**, §30 Developer Journey kết thúc ở *"Regression test"*, và §31 North Star Metric đếm *"converted into regression tests"*. Hệ quả: **North Star Metric của V0.1 không đo được bằng chính V0.1**, và hợp đồng output của `verify` — thứ ADR này đang định nghĩa — bị hai section của cùng tài liệu mô tả khác nhau. **Đề xuất (trước khi chốt)**: `verify` ở V0.1 chỉ trả về kết quả equivalence theo §20.16; dòng `✓ Regression case generated` thuộc V0.2.
  ✅ **ĐÃ CHỐT 2026-08-14** — chọn phía **§26: regression test generation giữ ở V0.2**, **không** kéo về V0.1. **Chỉ số thành công của V0.1** đổi sang **số bug đạt trạng thái `Execution matched`** (§10 — chính dòng `✓ Execution matched` mà §10 in ra). **North Star §31 giữ nguyên** làm metric **dài hạn, kích hoạt từ V0.2**.
  **Lý do**: `Execution matched` là trạng thái mạnh nhất mà V0.1 **tự sinh ra được**, và đo đúng thứ V0.1 tồn tại để chứng minh — execution được tái hiện thật, không chỉ chạy xong; đồng thời là chỉ số trực tiếp chống risk **Critical** §20.3 — đúng risk mà ADR này là mitigation.
  **Đã mở khoá**: đề xuất trên được chấp thuận — hợp đồng output của `repro verify` ở V0.1 **chỉ** gồm kết quả equivalence theo ngôn ngữ §20.16 (`Captured execution no longer reproduces`), **không** có dòng `✓ Regression case generated`.
  **Hệ quả nặng nhất, và nó rơi đúng vào ADR này**: quyết định trên nâng phán quyết equivalence — thứ ADR này định nghĩa — từ *một tính năng lõi* thành ***thước đo thành công của V0.1***. Kéo theo hai chỗ hở, cả hai đều **vẫn mở**:
  1. **`N-05` (§Open items)** — chỉ số thành công của V0.1 được đo bởi Execution Match Rate (§23), mà **§24 không đặt ngưỡng** cho nó ⇒ **chưa có tiêu chí đạt/không-đạt** cho chính định nghĩa thành công của V0.1.
  2. **`U-04` (§Open items)** — §10 không định nghĩa *"execution path"* / *"sufficiently equivalent"* ⇒ **chưa đếm được** `Execution matched`. `U-04` vẫn **`TBD`**, mọi phương án vẫn ở nhãn *cần validate*; quyết định `M1` **không** giải nó.

  Nghĩa là V0.1 vừa **chưa tính được** chỉ số thành công của mình, vừa **chưa có ngưỡng pass/fail** cho nó. Trước `M1` đây là ghi chú phụ; nay nó là chỗ hở nghiêm trọng nhất của ADR này. Cùng chạm [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md) và [ADR-011](./ADR-011-Execution-Diff-First-Class.md).

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-010: Bounded Determinism Scope](./ADR-010-Bounded-Determinism-Scope.md)
- [ADR-011: Execution Diff First-Class](./ADR-011-Execution-Diff-First-Class.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
