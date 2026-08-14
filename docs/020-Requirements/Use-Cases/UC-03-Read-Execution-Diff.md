---
id: UC-03
type: use-case
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🎬 UC-03 — Read Execution Diff

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N`. Chỗ `RQ.md` không định nghĩa hành vi ⇒ ghi `TBD` và nói rõ thiếu nguồn.
**Hợp đồng FR**: [PRD-Repro](../PRD-Repro.md) mục 5.7.

---

## 1. Mục tiêu

Khi replay **không** tái hiện được bug, cho developer biết production và local khác nhau **ở đâu** — thay vì trả về một câu vô dụng.

§9 nói thẳng vấn đề với cách làm ngây thơ:

> Instead of simply returning:
> ```text
> Could not reproduce.
> ```
> Repro should explain **where the execution diverged**.

§9 định vị đây là **capability lõi**, không phải tính năng phụ:

> This is a key product capability. Repro can still provide value even when the bug cannot be reproduced.

Và §9 phát biểu lại sản phẩm dưới góc nhìn này:

> **"Show me what was different between production and my environment."**

Neo nguyên tắc `N-16` / §33.3: *"If replay fails, show how production and local executions differ."*

> ⚠️ **§38 Q3 chất vấn chính mục tiêu này**: *"Is Execution Diff valuable enough to be a core feature?"* §9 tự khẳng định *"This is a key product capability"* — nhưng đó là **giả định của tác giả, chưa validate**. Xem [PRD-Repro](../PRD-Repro.md) mục 10.3.

---

## 2. Actor

| Vai | Trách nhiệm |
|---|---|
| **Software Engineer** (primary) | Đọc diff, quy nguyên nhân, quyết định bước tiếp theo |
| **Execution Diff engine** (system actor) | So sánh execution production vs local, đánh số và trình bày điểm phân kỳ (§17) |

---

## 3. Trigger

**Replay diverged** — [UC-02](./UC-02-Replay-Capsule-Locally.md) bước 11 kết luận:

```text
⚠️ Execution diverged
```

Hoặc developer chủ động gọi `repro diff 1842` (§18) trên một capsule đã replay.

Nguồn kích hoạt tương ứng với các flow của [UC-02](./UC-02-Replay-Capsule-Locally.md): `A3` (diverged), `A5` (capsule thiếu input — theo **E9** được xử lý là divergence + incomplete capture).

---

## 4. Preconditions

| # | Điều kiện | Nguồn § |
|---|---|---|
| P1 | [UC-02](./UC-02-Replay-Capsule-Locally.md) đã chạy trên capsule đó | §8, §9 |
| P2 | Hệ thống đã ghi lại được **chuỗi input mà production nhìn thấy** (từ capsule) và **chuỗi input mà local nhìn thấy** (từ lần replay) | §9, §10 |
| P3 | Hệ thống có tiêu chí kết luận `matched` / `diverged` | ⚠️ **`TBD` — `ACG-01`** |

> ⚠️ **P3 chưa tồn tại.** §10 dùng cụm *"sufficiently equivalent"* mà `RQ.md` **không định nghĩa ở bất kỳ đâu**; ký hiệu `A → B → C` cũng không được định nghĩa là function call / code line / span / chuỗi interaction với dependency. Chi tiết `ACG-01`: [NFR-Repro](../NFR-Repro.md) mục 7. **Không tự chế định nghĩa.**

---

## 5. Main success flow

Luồng này bám **đúng format §9**.

| # | Bước | Nguồn § | FR |
|---:|---|---|---|
| 1 | Hệ thống kết luận execution **diverged** — phân biệt tường minh với *"Replay completed"*, và **không** báo reproduce thành công | §10, §20.3 | `FR-039`, `FR-041` |
| 2 | Hệ thống so sánh **execution path** giữa Production và Local (§10 dùng ký hiệu `A → B → C` vs `A → B → D`) và thu thập toàn bộ điểm phân kỳ | §10 | `FR-040` |
| 3 | Hệ thống **đánh số** từng divergence — `1.`, `2.`, `3.`… — để mỗi điểm phân kỳ là một mục tham chiếu được | §9 | `FR-042` |
| 4 | Hệ thống **nhóm divergence theo loại input** (Database query · Tax API / external API · Feature flag · Clock…) thay vì đổ ra một danh sách phẳng | §9 | `FR-042` |
| 5 | Hệ thống trình bày mỗi divergence theo **cặp Production → / Local →**, và developer đọc kết quả qua `repro diff 1842` | §9, §18 | `FR-042`, `FR-051` |

**Output đúng format §9** (trích nguyên văn ví dụ của `RQ.md`):

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

**Ba đặc tính bắt buộc của format này** (đọc ra từ chính ví dụ §9):

| Đặc tính | Vì sao bắt buộc |
|---|---|
| **Đánh số** (`1.`, `2.`, `3.`) | Cho phép trao đổi *"divergence số 2"* trong review / issue mà không phải mô tả lại |
| **Nhóm theo loại input** | Loại input quyết định **ai** sửa và **sửa ở đâu** — DB drift, external drift, và flag lệch là ba đường xử lý khác nhau |
| **Cặp Production / Local** | `N-13` §33.5 *Determinism over magic*: người đọc phải thấy **cả hai vế**, không chỉ thấy kết luận |

> **Kết quả có giá trị độc lập** (`FR-043`, §9): UC này **hoàn tất thành công** ngay cả khi bug không bao giờ reproduce được. Đây là điểm phân biệt Repro với một replay tool thông thường.

---

## 6. Alternative / Exception flows

### `A1` — Divergence do code mismatch

**Điều kiện kích hoạt**: Git commit / runtime / dependency của capsule khác local ([UC-02](./UC-02-Replay-Capsule-Locally.md) `A1`).

**Căn cứ** — §15:

```text
⚠️ Code mismatch

Bug occurred on: 8f31ac2
Your local code:  92ab381

Replay may not be deterministic.
```

**Hành vi**: diff **phải** trình bày cảnh báo code mismatch **cùng ngữ cảnh** với danh sách divergence, vì nó thay đổi cách đọc toàn bộ diff — một divergence trên code khác là một tín hiệu khác hẳn.

**`TBD`** (`ACG-10`): `RQ.md` **không** nói cảnh báo này dẫn tới hành vi gì, và **không** có quy tắc **quy trách nhiệm** divergence về code mismatch. Cụ thể: nếu local ở commit khác và execution diverge, hệ thống có được phép nói *"divergence này do code mismatch"* không, hay chỉ được liệt kê song song hai sự kiện? `RQ.md` không phân xử.

---

### `A2` — Divergence do database schema drift

**Điều kiện kích hoạt**: schema/migration version của capsule khác local.

**Căn cứ** — §20.9 (🟠 High): *"Production and local may use different schema versions."* Mitigation: *"Capture schema/migration version and expose mismatch during replay."*

**Hành vi**: diff phải phơi bày schema mismatch như một hạng mục riêng, tách khỏi divergence ở tầng dữ liệu (`FR-045`, `FR-011`).

**Vì sao phải tách**: schema drift và data drift biểu hiện **giống nhau** ở tầng kết quả query (`coupon = null` vs `coupon = { discount: 10 }`) nhưng có **hai cách sửa hoàn toàn khác nhau** — một bên chạy migration, một bên là bug logic. Gộp chung sẽ dẫn developer đi sai hướng.

**`TBD`**: `RQ.md` không nói cách phân biệt hai loại này ở mức output. Cùng gốc với `ACG-01` mục *"quy trách nhiệm divergence"*.

---

### `A3` — Divergence do external dependency drift

**Điều kiện kích hoạt**: một external service trả kết quả khác giữa production và lúc replay.

**Căn cứ** — §20.10 (*External Dependency Drift* — 🟠 High): *"External services can change behavior between production and local replay."* Mitigation: *"Use recorded responses for supported external dependencies."*

**Hành vi**: với dependency **được hỗ trợ**, [UC-02](./UC-02-Replay-Capsule-Locally.md) bước 7 đã dùng recorded response (`FR-030`, `FR-038`) ⇒ **không được phép** phát sinh divergence loại này. Nếu vẫn phát sinh, đó là dấu hiệu dependency đó **nằm ngoài tập được hỗ trợ**, và diff phải nói rõ điều đó.

> **Điểm phải nói thẳng — `RQ.md` không nêu**: cụm *"supported external dependencies"* của §20.10 hàm ý tồn tại một **danh sách dependency được hỗ trợ**. Danh sách đó **không tồn tại** trong `RQ.md`. §18 chỉ nói *"external HTTP response"* — tức mọi thứ không đi qua HTTP (gRPC, message queue, SDK dùng transport riêng, socket thô) đều không rõ thuộc hay không thuộc phạm vi. ⇒ **`TBD`**, cùng họ với `ACG-07`.

---

### `A4` — Không phát hiện được divergence **nhưng bug vẫn không xảy ra** 🔴

**Điều kiện kích hoạt**: hệ thống kết luận `Execution matched` — mọi input khớp, execution path khớp — nhưng bug **không tái hiện** ở local.

**Hành vi**: ⚠️ **`TBD` — `RQ.md` không định nghĩa hành vi cho tình huống này ở bất kỳ đâu.**

**Nguyên nhân khả dĩ, đều có nguồn**:

| Nguyên nhân | Căn cứ | Repro có phát hiện được không |
|---|---|---|
| **Hidden input** không được capture | §20.1 — 9 nhóm: environment variables, filesystem state, randomness, system clock, process state, concurrency, network behavior, OS behavior, background jobs | ❌ Theo định nghĩa, không quan sát được thì không diff được |
| **Non-determinism** | §20.2 — random numbers, UUIDs, timestamps, scheduling, concurrency, race conditions. §20.2 chỉ hứa *"UUID capture where practical"* (`ACG-06` gọi đây là **miễn trừ, không phải tiêu chí**) | ❌ Phần lớn không |
| **Redaction làm đổi code path** | [NFR-Repro](../NFR-Repro.md) mục 5.6 — xoá field làm `if (user.email)` rẽ nhánh khác, schema validation fail, destructuring thành `undefined` | ⚠️ Chỉ khi capsule **ghi lại đã redact field nào** — yêu cầu này đến từ NFR, **không** có trong `RQ.md` |
| **Định nghĩa equivalence quá lỏng** | `ACG-01` — không có định nghĩa thì không biết "matched" nghĩa là gì | ❌ |

> ### 🔴 Đây là case tệ nhất cho user trust — phải nói thẳng
>
> Khi Repro báo **"mọi thứ khớp"** mà bug **không tái hiện**, người dùng không mất niềm tin vào *capsule này*. Họ mất niềm tin vào **chính công cụ**.
>
> Lý do: mọi kết quả khác của sản phẩm đều **tự giải thích được**. `💥 BUG REPRODUCED` là thắng lợi rõ ràng. `⚠️ Execution diverged` là thất bại **có ích** — nó chỉ ra chỗ khác nhau, và §9 xây cả một feature quanh giá trị đó. Nhưng *"matched nhưng không có bug"* là kết quả **không cung cấp bước tiếp theo nào**: không có divergence để đọc, không có manh mối để đào, và tệ hơn — nó nói rằng công cụ **tin là nó đã làm đúng**.
>
> Nó là biến thể ngược của chính risk §20.3 (*Replay Without True Equivalence* — 🔴 Critical). §20.3 lo *"replay hoàn tất nhưng execution khác"*; case này là *"execution báo khớp nhưng kết quả khác"*. `RQ.md` dành nguyên một section cho vế đầu và **không nhắc một chữ nào** về vế sau.
>
> Với một sản phẩm mà toàn bộ giá trị nằm ở lời hứa *"thay Guess bằng bằng chứng"* (§2.1, §40), một kết quả tự tin và sai là thiệt hại lớn hơn một kết quả thừa nhận không biết.
>
> **Cần thêm gì** (không tự quyết): hệ thống có nên phát ra một trạng thái thứ ba — kiểu *"matched nhưng outcome khác, nghi hidden input / non-determinism"* — kèm gợi ý điều tra? `RQ.md` chỉ có hai trạng thái (`matched` / `diverged`). Việc thêm trạng thái thứ ba là **quyết định sản phẩm**, ghi nhận ở đây chứ **không** tự áp dụng.

---

### `A5` — Không có divergence nào để hiển thị nhưng replay đã diverged

**Điều kiện kích hoạt**: hệ thống kết luận `diverged` nhưng danh sách divergence rỗng hoặc không tham chiếu được về một loại input cụ thể.

**Hành vi**: ⚠️ **`TBD`.**

Tình huống này khả dĩ vì §10 so sánh **execution path** (`A → B → C` vs `A → B → D`) trong khi §9 trình bày diff theo **loại input** (database / external API / feature flag). Hai trục này **không đồng nhất**: một execution có thể rẽ nhánh khác **mà không có input nào khác** — đúng loại rẽ nhánh thuần logic mà [NFR-Repro](../NFR-Repro.md) mục 7 (`ACG-01`, phần *"điểm yếu đã biết"*) đã cảnh báo là định nghĩa dựa-trên-dependency **không bắt được**, và đó lại chính là loại bug mà §7 lấy làm ví dụ mở đầu.

⇒ `RQ.md` **không phân xử** quan hệ giữa "execution path diff" (§10) và "input diff" (§9). **Không tự quyết.**

---

## 7. Postconditions

| # | Trạng thái sau UC | Nguồn § | FR |
|---|---|---|---|
| S1 | Developer có **danh sách divergence đã đánh số**, nhóm theo loại input, trình bày theo cặp Production / Local | §9 | `FR-042` |
| S2 | Developer biết được **loại nguyên nhân** của mỗi divergence khi hệ thống xác định được (code mismatch / schema drift / dependency drift) | §15, §20.9, §20.10 | `FR-044`, `FR-045` |
| S3 | UC hoàn tất **thành công** ngay cả khi bug không reproduce được — Repro vẫn tạo giá trị | §9, §33.3 | `FR-043` |
| S4 | Hệ thống **không** báo reproduce thành công khi execution đi đường khác | §10, §20.3 | `FR-039` |

**Bước tiếp theo khả dĩ**:

- Developer sửa **môi trường local** cho khớp (schema, dependency, flag) rồi replay lại → [UC-02](./UC-02-Replay-Capsule-Locally.md).
- Developer nhận ra divergence **chính là** manh mối bug và sửa code → [UC-04](./UC-04-Verify-Fix.md).
- Developer mở capsule xem chi tiết input đã capture → [UC-05](./UC-05-Browse-And-Inspect-Capsules.md).

---

## 8. FR bao phủ

Tra theo **hợp đồng traceability** ở [PRD-Repro](../PRD-Repro.md) mục 5.7:

> **UC-03** → `FR-039`…`FR-043`, `FR-051`

| FR | Nội dung | Bước / Flow |
|---|---|---|
| `FR-039` | Phân biệt tường minh **"Replay completed"** với **"Execution matched"**; không báo thành công khi execution đi đường khác | 1, S4, `A4` |
| `FR-040` | So sánh **execution path** Production vs Local (`A → B → C` vs `A → B → D`) | 2 |
| `FR-041` | Kết luận execution có **"sufficiently equivalent"** hay không | 1 — ⚠️ chặn bởi `ACG-01` |
| `FR-042` | Xuất **Execution Diff**: đánh số, nhóm theo loại input, cặp **Production → / Local →** | 3, 4, 5 |
| `FR-043` | Diff là **kết quả có giá trị độc lập** — Repro hữu ích cả khi bug không reproduce được | S3 |
| `FR-051` | `repro diff <id>` | 5 |

**FR liên quan, thuộc UC khác nhưng ràng buộc output của UC này**: `FR-044` (code mismatch → `A1`), `FR-045` (schema drift → `A2`), `FR-038` (recorded response tại boundary → `A3`) — cả ba thuộc [UC-02](./UC-02-Replay-Capsule-Locally.md) theo hợp đồng mục 5.7.

> ⚠️ **`FR-041` là FR không spec được của UC này.** `ACG-01` ([NFR-Repro](../NFR-Repro.md) mục 7): *"sufficiently equivalent"* không có định nghĩa, "execution path" không có định nghĩa, không có tập field so sánh, không có ngưỡng, không có quy tắc quy trách nhiệm divergence. §21 chỉ định **Execution verification** làm mitigation cho risk 🔴 Critical *"False replay equivalence"* ⇒ **feature quan trọng nhất về mặt tin cậy lại là feature không đo được.** Phương án đề xuất **chưa áp dụng**, cần validate qua technical spike §22.

> ⚠️ **Trạng thái sau các quyết định ngày 2026-08-14: KHÔNG ĐỔI. `FR-041` vẫn không spec được, `ACG-01` vẫn hở.**
>
> `✅ CHỐT GATE-01 — 2026-08-14` bật **Phase 0 technical spike** (`Go`, `Sponsor`/`Manager` = **`@TrisJr`**). Đó là quyết định **có chạy spike hay không** — nó **không** cấp định nghĩa *"sufficiently equivalent"*, **không** cấp đơn vị của *"execution path"*, **không** cấp tập field so sánh, **không** cấp ngưỡng.
>
> | Mục | Trạng thái sau 2026-08-14 |
> |---|---|
> | Việc chạy spike §22 | **`Go`** (`GATE-01`) |
> | `ACG-01` (*sufficiently equivalent*) | **vẫn hở** — owner **`@TrisJr`**; điều kiện đóng: định nghĩa được chốt tường minh, dự kiến sau kết quả spike §22 |
> | `FR-041` | **vẫn không spec được** — chặn bởi `ACG-01`, không phải bởi việc thiếu spike |
>
> ⇒ Đây đúng là nội dung **`GATE-01-r`**: `Go` **không tự làm cho spike đo được**. Spike có thể chạy xong và báo cáo đủ số liệu mà `FR-041` vẫn không có tiêu chí kết luận `Execution matched` / `Execution diverged`. **Tuyệt đối không đọc `GATE-01 = Go` như đã giải `ACG-01`.** Rủi ro tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

---

## 9. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | Hợp đồng FR (mục 5.7); mục 10.3 (§38 Q3 — diff có đủ giá trị không) |
| [NFR-Repro](../NFR-Repro.md) | `ACG-01` (chặn `FR-041`, P3, `A4`, `A5`), `ACG-06`, `ACG-10`; `N-05` Execution Match Rate; `N-13`, `N-16`; mục 5.6 (redaction ↔ replay fidelity) |
| [UC-02 — Replay Capsule Locally](./UC-02-Replay-Capsule-Locally.md) | Trigger của UC này; `A3`/`A5` của UC-02 dẫn vào đây |
| [UC-04 — Verify Fix](./UC-04-Verify-Fix.md) | Bước sau khi divergence chỉ ra nguyên nhân và developer đã fix |
| [UC-05 — Browse And Inspect Capsules](./UC-05-Browse-And-Inspect-Capsules.md) | Xem chi tiết input đã capture khi diff chưa đủ để kết luận |
| [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) | §38 Q3 và giới hạn phạm vi vấn đề (mục 6) |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế execution verification và diff engine |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — §7, §9, §10, §15, §18, §20.1, §20.2, §20.3, §20.8, §20.9, §20.10, §33.3, §33.5 |
