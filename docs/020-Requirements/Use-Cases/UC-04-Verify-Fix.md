---
id: UC-04
type: use-case
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🎬 UC-04 — Verify Fix

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N`. Chỗ `RQ.md` không định nghĩa hành vi ⇒ ghi `TBD` và nói rõ thiếu nguồn.
**Hợp đồng FR**: [PRD-Repro](../PRD-Repro.md) mục 5.7.

---

## 1. Mục tiêu

Thay bước cuối **`Hope`** của debugging loop hiện tại (§2.1, §30) bằng một **bằng chứng có giới hạn được phát biểu chính xác**: chạy lại bản fix trên **đúng capsule đã gây lỗi** và cho biết execution đó còn tái hiện failure hay không.

Neo ngôn từ bắt buộc — §20.16 (*False Confidence About Fixes* — 🔴 **Critical**):

> A successful replay only proves that:
> **This captured execution no longer fails.**
>
> It does not necessarily prove that every production manifestation of the bug has been eliminated.

| ✅ **BẮT BUỘC dùng** (§20.16) | ❌ **CẤM dùng** (§20.16) |
|---|---|
| `✓ Captured execution no longer reproduces` | `✓ Production bug is definitely fixed` |

> **Đây không phải chuyện văn phong.** §20.16 xếp việc dùng sai ngôn từ thành risk 🔴 Critical, §21 đánh `MVP? = Yes` với mitigation *"Explicit replay semantics"*, và `N-17` ([NFR-Repro](../NFR-Repro.md) mục 4) nâng nó thành ràng buộc phi chức năng bắt buộc. Mục tiêu của UC này **bị giới hạn có chủ ý** ở đúng phạm vi mà bằng chứng cho phép.

---

## 2. Actor

| Vai | Trách nhiệm |
|---|---|
| **Software Engineer** (primary) | Sửa code, chạy verify, đọc kết quả before/after, quyết định deploy |
| **Replay Runtime + Verification engine** (system actor) | Chạy lại capsule trên code đã sửa, so sánh với baseline trước fix |

---

## 3. Trigger

Developer **đã sửa code** sau khi hiểu được bug qua [UC-02](./UC-02-Replay-Capsule-Locally.md) (`💥 BUG REPRODUCED`) hoặc qua [UC-03](./UC-03-Read-Execution-Diff.md) (đọc divergence ra nguyên nhân).

§8 đặt đây là **Step 5**, ngay sau **Step 4 — Developer fixes the code**.

---

## 4. Preconditions

| # | Điều kiện | Nguồn § |
|---|---|---|
| P1 | Capsule `1842` đã có ở local ([UC-02](./UC-02-Replay-Capsule-Locally.md) bước 2) | §8 Step 2 |
| P2 | Đã tồn tại **baseline before fix** — tức capsule này **đã từng** được replay và cho kết quả `reproduced` | §8 Step 5 (output có dòng `Before fix`) |
| P3 | Developer đã sửa code local | §8 Step 4 |
| P4 | Có bộ tiêu chí equivalence để kết luận | ⚠️ **`TBD` — xem `A2` và `ACG-01`** |

> ⚠️ **P2 chưa được `RQ.md` đặc tả.** Output §8 in cả `Before fix` và `After fix`, tức hệ thống phải **lưu lại kết quả của lần replay trước**. `RQ.md` **không nói** baseline đó được lưu ở đâu, lưu bao lâu, hay điều gì xảy ra nếu `repro verify` được gọi mà **chưa từng** có lần replay nào trước đó. ⇒ **`TBD`**, thiếu nguồn.

---

## 5. Main success flow

| # | Bước | Lệnh / Actor | Nguồn § | FR |
|---:|---|---|---|---|
| 1 | Developer **sửa code** ở local | Developer | §8 Step 4 | — |
| 2 | Developer chạy verify | `repro verify 1842` | §8 Step 5, §18, §25 | `FR-052` |
| 3 | Hệ thống **replay lại trên đúng capsule cũ** — cùng request, cùng recorded DB result, cùng recorded external response, cùng flag, cùng clock — nhưng trên code **đã sửa** | Replay runtime | §8, §18 | `FR-046` (dùng lại `FR-028`…`FR-036`) |
| 4 | Hệ thống **so sánh before / after** trên cùng một capsule | Verification engine | §8 Step 5 | `FR-046` |
| 5 | Hệ thống in kết quả bằng **ngôn từ giới hạn kết luận** của §20.16 | CLI | §8, §20.16, §25 | `FR-046`, `N-17` |

**Output §8 Step 5** (nguyên văn `RQ.md`):

```text
BUG-1842

Before fix:
✗ reproduced

After fix:
✓ execution no longer reproduces
```

**Output §25 nhịp 6** (nguyên văn `RQ.md`):

```text
BUG-1842

✓ Execution replayed
✓ Original failure no longer occurs
✓ Regression case generated
```

> ⚠️ **Hai output trên KHÔNG giống nhau** — `RQ.md` §8 và §25 vẫn tự nói ngược. ✅ **M1 ĐÃ CHỐT 2026-08-14 theo phía §26** ⇒ dòng thứ ba `✓ Regression case generated` **không thuộc output của V0.1** (không có tính năng nào đứng sau nó). Output chuẩn của `repro verify` ở V0.1 là **hai dòng đầu**. Xem mục 7.2 và 8.2.

> **Ràng buộc `UX-03`** ([PRD-Repro](../PRD-Repro.md) mục 7.3): output của `verify` phải dùng đúng ngôn từ §20.16, **không được nâng mức khẳng định**. Cụ thể, `✓ Original failure no longer occurs` (§25) và `✓ execution no longer reproduces` (§8) đều nằm trong giới hạn cho phép; `✓ Production bug is definitely fixed` thì **không**.

---

## 6. Alternative / Exception flows

### `A1` — Fix không hiệu quả

**Điều kiện kích hoạt**: sau khi sửa code, replay trên capsule cũ **vẫn tái hiện** failure.

**Hành vi**: hệ thống báo `After fix: ✗ reproduced` (đối xứng với format §8) và developer quay lại bước 1.

**Đây là kết quả hợp lệ và có giá trị**: nó là thứ mà quy trình cũ **không có** — §2.1 và §30 cho thấy quy trình cũ đi thẳng từ `Fix` sang `Deploy` sang `Hope`, không có bước xác nhận nào ở giữa. Với UC này, một bản fix sai bị bắt **trước** khi deploy.

**`TBD`**: `RQ.md` chỉ in ví dụ ở trường hợp thành công (§8, §25) và **không** in format của trường hợp thất bại. Cụ thể chưa có: exit code, có tự chạy diff không, có chỉ ra failure xảy ra ở cùng chỗ hay chỗ khác không.

---

### `A2` — Fix làm execution **diverge** thay vì fix bug 🔴

**Điều kiện kích hoạt**: sau khi sửa code, execution **không đi cùng đường** với execution đã capture.

**Hành vi**: ⚠️ **`TBD` — và đây là `TBD` nghiêm trọng nhất của UC này.**

#### Vì sao đây là mâu thuẫn về **ngữ nghĩa của tín hiệu**, không phải chuyện chi tiết

Đặt hai section cạnh nhau:

| Section | Tín hiệu `diverged` nghĩa là gì |
|---|---|
| **§10** (*Execution Verification*), dùng ở [UC-02](./UC-02-Replay-Capsule-Locally.md) / [UC-03](./UC-03-Read-Execution-Diff.md) | **Dấu hiệu xấu** — replay không tái tạo được production; §20.3 gọi replay đi đường khác là nguồn của **false confidence** |
| **UC này** (§8 Step 4–5) | **Dấu hiệu tốt** — developer vừa sửa code; một bản fix đúng **theo định nghĩa** làm execution rẽ khác ở chỗ đã sửa. Nếu execution vẫn đi **y hệt** đường cũ thì nhiều khả năng fix **chưa có tác dụng** |

⇒ **Cùng một tín hiệu, hai nghĩa trái ngược, tuỳ theo người dùng đang ở lệnh nào.**

Nghiêm trọng hơn: sau bước 1 (sửa code) thì **code local chắc chắn khác code production** ⇒ `A1` của [UC-02](./UC-02-Replay-Capsule-Locally.md) (code mismatch, §15 *"Replay may not be deterministic"*) là **trạng thái mặc định** của UC này, không phải ngoại lệ. `ACG-10` ([NFR-Repro](../NFR-Repro.md) mục 7) đã ghi nhận đúng điểm này: *"code mismatch là trạng thái thường trực, không phải ngoại lệ hiếm"*.

#### Hệ quả cần ghi nhận

> **`verify` cần một bộ tiêu chí equivalence KHÁC `replay`.**
>
> - `replay` hỏi: *execution local có **giống** production không?* → divergence là **thất bại**.
> - `verify` hỏi: *failure ban đầu có **còn** xảy ra không, và execution có diverge **ở đúng chỗ được sửa** không?* → divergence ở chỗ đã sửa là **thành công**; divergence ở chỗ **khác** là tín hiệu đáng ngờ (fix chạm phải thứ không định chạm, hoặc môi trường lệch).
>
> **`RQ.md` không hề nói điều này.** Nó dùng chung một khái niệm *"execution no longer reproduces"* (§8) cho một phép so sánh về bản chất khác với §10.

**Cần thêm gì (không tự quyết)**:

1. Định nghĩa equivalence riêng cho `verify` — phân biệt *"diverged vì đã fix"* với *"diverged vì môi trường lệch"* (đúng yêu cầu của `ACG-10`).
2. Quy tắc xác định **điểm rẽ nhánh mong đợi** — chặn bởi `ACG-01` (chưa có định nghĩa "execution path" thì không định vị được điểm rẽ).
3. Hành vi khi execution diverge **trước** điểm được sửa.

**Trạng thái: `TBD`, chặn bởi `ACG-01` và `ACG-10`.**

---

### `A3` — Code mismatch với baseline

**Điều kiện kích hoạt**: ngoài phần fix chủ ý, môi trường local còn lệch với capsule ở runtime version, dependency versions, hoặc database schema version.

**Căn cứ** — §15:

```text
⚠️ Code mismatch

Bug occurred on: 8f31ac2
Your local code:  92ab381

Replay may not be deterministic.
```

Cùng nhóm: §20.8 (*Version Drift* — 🟠 High), §20.9 (*Schema Drift* — 🟠 High).

**Hành vi**: hệ thống **phải cảnh báo** (`FR-044`, `FR-045`).

**`TBD`**: `RQ.md` không phân tầng cảnh báo. Với UC này, phân tầng là **bắt buộc** — nếu không, mọi lần `verify` đều bật cảnh báo code mismatch (vì developer **vừa mới sửa code**), và một cảnh báo bật ở 100% trường hợp là một cảnh báo **bị bỏ qua 100% trường hợp**. Cần tách *"commit khác vì tôi vừa fix"* khỏi *"runtime major version khác"* và *"schema version khác"*. `ACG-10` yêu cầu đúng việc này.

---

### `A4` — Bug là **race condition** ⇒ verify pass nhưng bug production vẫn còn 🔴

**Điều kiện kích hoạt**: failure gốc phụ thuộc concurrency / event ordering.

**Căn cứ**:

- §20.13 (*Race Conditions — **Critical but Out of Scope***): *"Some bugs depend on precise concurrency and event ordering. A simple request replay will not reproduce them reliably."* §21 xác nhận `MVP? = No`. §19 liệt kê *"Distributed race-condition replay"* trong Non-Goals.
- §20.16 nói thẳng hệ quả: *"It does not necessarily prove that every production manifestation of the bug has been eliminated. **For example, a race condition may still exist.**"*

**Hành vi**: verify có thể trả về `✓ Captured execution no longer reproduces` trong khi bug production **vẫn còn nguyên**. Đây **không phải lỗi hệ thống** — đó chính là lý do §20.16 cấm ngôn từ `✓ Production bug is definitely fixed`.

**Vì sao đây là exception flow bắt buộc**: nó là trường hợp mà **output đúng của hệ thống lại dẫn tới quyết định sai của con người**. Phòng vệ duy nhất mà `RQ.md` cung cấp là **ngôn từ** (§20.16) — không có cơ chế kỹ thuật nào.

**`TBD`**: hệ thống có nên phát hiện và cảnh báo rằng capsule này *có dấu hiệu phụ thuộc concurrency* không? `RQ.md` không nói, và §20.13 hoãn toàn bộ hạ tầng cần thiết (distributed tracing, event ordering, scheduling information) sang *"future versions"*. ⇒ Ở V0.1, **không có cách nào** phát hiện. Đây là giới hạn đã ghi ở [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) mục 6.2.

---

## 7. Postconditions

### 7.1 Thành công

| # | Trạng thái sau UC | Nguồn § | FR |
|---|---|---|---|
| S1 | Developer biết capsule `1842` **còn hay không còn** tái hiện failure trên code đã sửa | §8 Step 5 | `FR-046` |
| S2 | Kết quả được phát biểu bằng **ngôn từ giới hạn** — `✓ Captured execution no longer reproduces`, **không** phải `✓ Production bug is definitely fixed` | §20.16 | `FR-046`, `N-17` |
| S3 | Bước `Hope` của §2.1 / §30 được thay bằng một bằng chứng có phạm vi xác định | §2.1, §30, §20.16 | — |
| S4 | **Không** side effect thật nào bị kích hoạt trong lúc verify (verify dùng lại đường replay) | §13, §20.4, §33.6 | `FR-035`, `N-12` |

### 7.2 Regression case — **Post-MVP V0.2** ✅ **ĐÃ CHỐT 2026-08-14 (M1)**

| Trạng thái | Nội dung |
|---|---|
| **Không** thuộc postcondition của UC này ở V0.1 — **xác định**, không còn treo | **M1 chốt 2026-08-14 giữ nguyên §26**: **Regression test generation** thuộc **V0.2 — Developer Workflow** |
| FR tương ứng | `FR-056` — Phụ lục A của [PRD-Repro](../PRD-Repro.md) mục 5.8, **không mục nào trong phụ lục thuộc V0.1** |
| Postcondition thành công của V0.1 dừng ở | `S1`…`S4` ở mục 7.1 — **không** có postcondition nào về regression case |

⇒ Ở V0.1, journey **kết thúc tại `repro verify`** — đây là kết luận đã chốt, không phải phương án tạm. Dòng `✓ Regression case generated` của §25 **không có tính năng nào đứng sau** và **không được in** ở V0.1.

> **Ràng buộc ngôn từ §20.16 giữ nguyên, không bị quyết định này nới lỏng**: kết luận của `verify` vẫn phải là `✓ Captured execution no longer reproduces`; `✓ Production bug is definitely fixed` vẫn **bị cấm** (`S2`, `FR-046`, `N-17`). Việc regression case lùi sang V0.2 **không** cho phép nâng mức khẳng định để bù lại.

---

## 8. FR bao phủ

Tra theo **hợp đồng traceability** ở [PRD-Repro](../PRD-Repro.md) mục 5.7:

> **UC-04** → `FR-046`, `FR-052`

| FR | Nội dung | Bước / Flow |
|---|---|---|
| `FR-046` | `verify` so được **before fix / after fix** trên cùng một capsule, và **bắt buộc dùng ngôn từ giới hạn kết luận**: `✓ Captured execution no longer reproduces` — **không** được viết `✓ Production bug is definitely fixed` | 3, 4, 5, S1, S2 |
| `FR-052` | `repro verify <id>` | 2 |

**FR được dùng lại (thuộc [UC-02](./UC-02-Replay-Capsule-Locally.md) theo hợp đồng mục 5.7)**: `FR-028`…`FR-036` — bước 3 của UC này chạy lại đúng cơ chế replay, gồm cả **default-deny writes** (`FR-035`, bất biến S4). `FR-044` / `FR-045` chi phối `A3`.

**FR ngoài V0.1**: `FR-056` (regression test generation) — xem 8.2.

### 8.2 M1 — Regression test generation: V0.1 hay V0.2? — ✅ **ĐÃ CHỐT 2026-08-14: giữ V0.2**

**Mâu thuẫn nội tại của `RQ.md`. Hai phía dưới đây giữ nguyên làm bằng chứng — `RQ.md` vẫn tự nói ngược ở chính những section này; quyết định chỉ ghi lại ta chọn phía nào.**

| Phía "thuộc V0.1" | Phía "thuộc V0.2" |
|---|---|
| **§25** Killer Demo — chính là demo dùng để bán MVP — nhịp 6 in `✓ Regression case generated` | **§26** đặt **Regression test generation** trong **V0.2 — Developer Workflow** |
| **§30** journey *"With Repro"* kết thúc bằng `Regression test` | |
| **§31** **North Star Metric** đếm *"converted into regression tests"* | |
| **§37** chuỗi outcome của MVP kết thúc bằng `Regression Test` | |

**Hệ quả — không phải lỗi biên tập nhỏ**:

> **North Star Metric của V0.1 không đo được bằng chính V0.1.**

Nếu giữ §26, V0.1 **không có tính năng nào tạo ra regression test**, nên chỉ số dùng để đánh giá thành công của V0.1 **không có dữ liệu để đo**. Đây là lỗi ở tầng *"làm sao biết sản phẩm thành công"*.

**Hệ quả trực tiếp lên UC này**: hai output mẫu của `RQ.md` cho cùng một lệnh **không khớp nhau** — §8 Step 5 in 2 dòng kết quả, §25 nhịp 6 in 3 dòng trong đó dòng thứ ba là `✓ Regression case generated`.

#### ✅ Quyết định — **ĐÃ CHỐT 2026-08-14**

| Hạng mục | Quyết định |
|---|---|
| Regression test generation | **Giữ nguyên §26 — V0.2.** Không kéo về V0.1 ⇒ `FR-056` vẫn ngoài V0.1 |
| Output chuẩn của `repro verify` ở V0.1 | **Hai dòng theo §8 Step 5**; dòng `✓ Regression case generated` của §25 **không được in** |
| North Star §31 | Metric **dài hạn**, kích hoạt từ **V0.2** |
| Metric chính thức của V0.1 | **Số bug đạt trạng thái `Execution matched`** (§10, `FR-039`, `FR-041`) |

**Lý do**: `Execution matched` là trạng thái mạnh nhất mà V0.1 tự sinh ra được và đo đúng thứ V0.1 tồn tại để chứng minh — execution được tái hiện thật, không chỉ chạy xong; nó cũng chống trực tiếp risk 🔴 Critical §20.3.

**Hệ quả còn mở, không được coi là đã lấp**:

- `N-05` (Execution Match Rate, §23) nay là **chỉ số thành công chính của V0.1** mà §24 **không đặt ngưỡng** ⇒ chưa có tiêu chí pass/fail. Xem [NFR-Repro](../NFR-Repro.md) mục 3.
- Metric này **phụ thuộc định nghĩa *"sufficiently equivalent"*** — hiện vẫn chưa có (`ACG-01`, giữ nguyên **`TBD`**).
- **`UX-03` không đổi**: ngôn từ kết luận vẫn bị §20.16 khoá ở `✓ Captured execution no longer reproduces`.

Xem [PRD-Repro](../PRD-Repro.md) mục 8.2 và 10.4.

---

## 9. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | Hợp đồng FR (mục 5.7); mục 7.3 (`UX-03`); mục 8.2 và 10.4 (**M1** — ✅ đã chốt 2026-08-14: giữ V0.2); mục 5.8 (`FR-056`) |
| [NFR-Repro](../NFR-Repro.md) | `N-17` (ngôn từ giới hạn kết luận), `N-12` (safe by default); `ACG-01` và `ACG-10` — hai gap chặn `A2` và `A3` |
| [UC-02 — Replay Capsule Locally](./UC-02-Replay-Capsule-Locally.md) | Cơ chế replay mà bước 3 dùng lại; `A1` của UC-02 là trạng thái mặc định của UC này |
| [UC-03 — Read Execution Diff](./UC-03-Read-Execution-Diff.md) | Nguồn hiểu biết dẫn tới bản fix; và là công cụ đọc divergence ở `A2` |
| [UC-01 — Capture Failed Production Execution](./UC-01-Capture-Failed-Production-Execution.md) | Tạo ra capsule đóng vai baseline |
| [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) | Mục 1.3 (`Hope`) và mục 6.2/6.3 — giới hạn của kết luận verify |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế verification engine và lưu trữ baseline |
| [Roadmap](../../010-Planning/Roadmap.md) | Phasing của `FR-056` (regression test generation, V0.2) |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — §2.1, §8, §13, §15, §18, §19, §20.3, §20.4, §20.8, §20.9, §20.13, §20.16, §21, §25, §26, §30, §31, §37 |
