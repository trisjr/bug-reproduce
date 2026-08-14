---
id: UC-02
type: use-case
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🎬 UC-02 — Replay Capsule Locally

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N`. Chỗ `RQ.md` không định nghĩa hành vi ⇒ ghi `TBD` và nói rõ thiếu nguồn.
**Hợp đồng FR**: [PRD-Repro](../PRD-Repro.md) mục 5.7.

---

## 1. Mục tiêu

Cho phép developer chạy lại một production execution đã capture **trên code local của chính mình**, **không cần truy cập production** (kể cả production database), và nhận về một trong hai kết luận có giá trị:

```text
💥 BUG REPRODUCED        (§8, §25)
⚠️ Execution diverged     (§9, §10)
```

Neo nguyên tắc (§5): *"The local application is not running inside production. It is simply receiving the same relevant inputs that the production execution received."*

**Cả hai kết quả đều là kết quả thành công của UC này.** §9 nói thẳng: *"Repro can still provide value even when the bug cannot be reproduced."* Nhánh `diverged` chuyển tiếp sang [UC-03](./UC-03-Read-Execution-Diff.md).

---

## 2. Actor

| Vai | Trách nhiệm |
|---|---|
| **Software Engineer** (primary) | Pull capsule, chạy replay trên code local, đọc kết quả. §8, §9, §10, §25, §30 đều viết cho vai này |
| **Replay Runtime** (system actor) | Nạp capsule, intercept dependency, phát lại input, chặn write, so sánh execution (§17) |

Persona đầy đủ: [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 3.

---

## 3. Trigger

Developer nhận thông báo có capsule khả dụng cho một incident (§8 Step 1):

```text
BUG-1842

Checkout failed.

Repro Capsule available.
```

Hoặc developer chủ động duyệt capsule qua [UC-05](./UC-05-Browse-And-Inspect-Capsules.md).

---

## 4. Preconditions

| # | Điều kiện | Nguồn § | FR |
|---|---|---|---|
| P1 | Một capsule đã tồn tại trong private storage — tức [UC-01](./UC-01-Capture-Failed-Production-Execution.md) đã chạy xong | §8, §17 | `FR-017` |
| P2 | Developer có quyền truy cập capsule đó (access control — §20.5) | §20.5 | `FR-025` |
| P3 | Developer có key giải mã capsule (encryption at rest — §16) | §16 | `FR-021` |
| P4 | Ứng dụng chạy được ở local, thuộc target stack V0.1 (Node.js + PostgreSQL + HTTP) | §18, §26 | — |
| P5 | Replay runtime đã cài ở local | §17, §18 | — |
| P6 | Execution trong capsule thuộc **Supported Execution Class** | §20.1 | ⚠️ **`TBD` — `ACG-07`** |

> ⚠️ **P6 không kiểm được.** §20.1 nói *"Limit the MVP to a clearly defined class of deterministic request/response executions"* nhưng class đó **không tồn tại ở bất kỳ đâu trong `RQ.md`** (`ACG-07` — [NFR-Repro](../NFR-Repro.md) mục 7). **Không tự chế định nghĩa.**

---

## 5. Main success flow

| # | Bước | Lệnh / Actor | Nguồn § | FR |
|---:|---|---|---|---|
| 1 | Developer liệt kê capsule khả dụng | `repro list` | §18 | `FR-047` |
| 2 | Developer pull capsule về máy local theo **id** | `repro pull 1842` | §8 Step 2, §18 | `FR-027`, `FR-048` |
| 3 | Hệ thống kiểm tra **code version**: đối chiếu Git commit / runtime / dependency versions của capsule với môi trường local | Replay runtime | §15, §20.8 | `FR-044` |
| 4 | Developer chạy replay | `repro replay 1842` | §8 Step 3, §18 | `FR-050` |
| 5 | Replay runtime **nạp capsule** và phát lại **inbound HTTP request** đã capture vào ứng dụng local | Replay runtime | §18, §8 | `FR-028` |
| 6 | Replay runtime **intercept database read** của app local, trả về **recorded production result** thay vì query database local. Ví dụ §7/§11: `db.coupons.find(9182)` → `null` | Replay runtime | §11, §7, §18 | `FR-029` |
| 7 | Replay runtime **intercept outbound HTTP**, trả về **recorded response** thay vì gọi external API thật. Ví dụ §12: `POST /tax` → `{ "tax": 0 }` thay vì `{ "tax": 12.43 }` của local | Replay runtime | §12, §18 | `FR-030` |
| 8 | Replay runtime phát lại **clock/timestamp** và **feature flag state** đã capture | Replay runtime | §18, §5, §20.2 | `FR-031`, `FR-032` |
| 9 | **Default-deny write**: mọi interaction phân loại là WRITE (`INSERT`, `UPDATE`, `DELETE`, `POST payment`, publish event) **không được thực thi lên hệ thống thật**; hệ thống trả về **recorded result** để execution đi tiếp | Replay runtime | §13, §20.4, §33.6 | `FR-034`, `FR-035`, `FR-036` |
| 10 | Execution chạy trên **code local của developer**, trong **replay boundary = service boundary** của service đang điều tra; mọi dependency ngoài boundary đều replay từ recorded response | App local + Replay runtime | §5, §7, §14, §20.11 | `FR-033`, `FR-037`, `FR-038` |
| 11 | Hệ thống in checklist từng loại input đã phát lại rồi kết luận | CLI | §8, §25 | `FR-050` |

**Output bước 11** (§8 Step 3):

```text
Replaying BUG-1842...

✓ Request
✓ Database inputs
✓ External API responses
✓ Feature flags
✓ Clock
✓ Application metadata

💥 BUG REPRODUCED
```

Hoặc, khi execution không khớp (§9):

```text
⚠️ Execution diverged
```

⇒ chuyển sang [UC-03](./UC-03-Read-Execution-Diff.md).

> **Ràng buộc UX** (`UX-02`, [PRD-Repro](../PRD-Repro.md) mục 7.3): output phải liệt kê **từng loại input đã phát lại** trước, rồi mới tới kết luận. Neo `N-13` *Determinism over magic* (§33.5): *"The system should explain exactly what was captured and replayed."*

> **Ràng buộc an toàn** (`N-12`, §33.6): *"Replay must never accidentally trigger production side effects."* §13 liệt kê tường minh loại side effect phải chặn: **charge credit card, send email, create shipment, send webhook, delete record, publish Kafka event**. Đây là **core safety mechanism**, không phải tuỳ chọn.

---

## 6. Alternative / Exception flows

### `A1` — Code mismatch

**Điều kiện kích hoạt**: Git commit / runtime version / dependency versions của capsule khác với môi trường local (bước 3).

**Căn cứ** — §15 (*Code Version*), output nguyên văn:

```text
⚠️ Code mismatch

Bug occurred on:
8f31ac2

Your local code:
92ab381

Replay may not be deterministic.
```

**Hành vi**: hệ thống **phải cảnh báo** (`FR-044`). Có chặn replay hay không ⇒ ⚠️ **`TBD`**.

**Vì sao `TBD`** (`ACG-10`, [NFR-Repro](../NFR-Repro.md) mục 7): `RQ.md` không nói cảnh báo này **dẫn tới hành vi gì**. Replay vẫn chạy tiếp hay bị chặn? Có phân tầng theo loại drift không (commit khác vs runtime major version khác vs schema version khác — §20.8, §20.9)? Nếu kết quả replay sau đó diverge thì có được quy về mismatch này không?

> **Điểm quan trọng**: code mismatch là **trạng thái thường trực**, không phải ngoại lệ hiếm — §8 bước 4–5 là *developer sửa code rồi replay lại*, nên sau bước 4 thì local **luôn** khác production. §15 nêu `repro replay 1842 --checkout` (tự động checkout production commit) nhưng xếp nó vào *"A future version may support"* ⇒ `FR-070`, **không thuộc V0.1**.

---

### `A2` — Database schema drift

**Điều kiện kích hoạt**: schema/migration version của capsule khác schema của database local.

**Căn cứ** — §20.9 (*Database Schema Drift* — 🟠 High): *"Production and local may use different schema versions."* Mitigation: *"Capture schema/migration version and **expose mismatch during replay**."*

**Hành vi**: hệ thống **phải phơi bày mismatch lúc replay** (`FR-045`, `FR-011`).

**`TBD` còn lại**: §20.9 nói *"expose"* nhưng không nói **chặn hay đi tiếp**, và không nói ngưỡng nào là mismatch đáng chặn. Cùng gốc với `ACG-10` như `A1`.

> **Ghi chú kỹ thuật đáng lưu ý**: bước 6 của luồng chính **intercept database read và trả recorded result** — tức phần lớn replay **không chạm database local**. Schema drift vì thế **không** ảnh hưởng qua đường query, mà qua đường code local giả định một hình dạng dữ liệu khác. `RQ.md` không phân biệt hai đường này.

---

### `A3` — Execution diverged

**Điều kiện kích hoạt**: replay chạy xong nhưng execution **không đi cùng đường** với production.

**Căn cứ** — §10 (*Execution Verification*):

```text
⚠️ Execution diverged

Production:
A → B → C

Local:
A → B → D
```

**Hành vi**: **không** báo reproduce thành công (`FR-039`); chuyển sang **Execution Diff** — [UC-03](./UC-03-Read-Execution-Diff.md), lệnh `repro diff 1842` (`FR-042`, `FR-051`).

**Đây không phải lỗi của UC.** §9: *"Instead of simply returning `Could not reproduce.`, Repro should explain **where the execution diverged**."* Và `N-16` (§33.3): *"If replay fails, show how production and local executions differ."*

**`TBD`**: ngưỡng biến chuỗi so sánh thành kết luận nhị phân `matched` / `diverged` — xem `A4`.

---

### `A4` — Replay completed **nhưng không tương đương** 🔴

**Điều kiện kích hoạt**: replay chạy xong, không báo lỗi, nhưng execution thực tế đi đường khác mà hệ thống **không phát hiện**.

**Căn cứ** — §20.3 (*Replay Without True Equivalence* — 🔴 **Critical**):

> A replay may complete successfully while following a different execution path.
>
> **This creates false confidence.**

Mitigation §20.3: *"Make **Execution Verification** a core feature. Repro should distinguish `Replay completed` from `Execution matched`."*

§10 nói cùng điều: *"This prevents a dangerous situation where Repro says 'replay succeeded' even though the application did not actually follow the same execution path."*

**Hành vi được yêu cầu**: `FR-039` — hệ thống phải phân biệt tường minh **"Replay completed"** với **"Execution matched"**, và **không được** báo thành công khi execution đi đường khác. `FR-040` so sánh execution path; `FR-041` kết luận có *"sufficiently equivalent"* hay không.

> ⚠️ **`ACG-01` — chặn ở đây, không lấp được.** §10 dùng cụm *"sufficiently equivalent"* nhưng **`RQ.md` không định nghĩa nó ở bất kỳ đâu**, và cũng **không định nghĩa** `A`, `B`, `C` trong ký hiệu `A → B → C` là gì: chuỗi **function call**? **code line**? **span**? chuỗi **interaction với dependency**? Bốn cách hiểu cho bốn hệ thống hoàn toàn khác nhau. Cũng không nói so bao nhiêu field, exact hay tolerant, và ngưỡng nào biến so sánh thành kết luận nhị phân.
>
> ⇒ **Feature quan trọng nhất về mặt tin cậy của sản phẩm là feature không đo được.** Chi tiết và phương án đề xuất (chưa áp dụng, cần validate qua spike §22): [NFR-Repro](../NFR-Repro.md) mục 7 `ACG-01`. **Tuyệt đối không tự chế định nghĩa ở đây.**
>
> ✅ **`CHỐT GATE-01 — 2026-08-14`: spike §22 đã được bật (`Go`)** — `Sponsor`/`Manager` = **`@TrisJr`**. ⚠️ **Nhưng `ACG-01` VẪN HỞ.** `GATE-01` bật *việc chạy spike*, nó **không** cấp định nghĩa *"sufficiently equivalent"*. Không có định nghĩa đó thì `FR-041` vẫn không spec được và `A4` vẫn không có tiêu chí phát hiện. Đây đúng là nội dung **`GATE-01-r`**: spike chạy được **không** đồng nghĩa spike kết luận được. Rủi ro tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

---

### `A5` — Capsule thiếu input mà code local yêu cầu 🔴

**Điều kiện kích hoạt**: trong lúc replay, code local phát ra một database query, một outbound HTTP call, một feature flag read hoặc một clock read **không có trong capsule**.

**Hành vi — quyết định E9, áp dụng, không tự quyết lại**:

| Yêu cầu | Nội dung |
|---|---|
| ✅ **Xử lý là divergence** | Coi đây là một điểm phân kỳ, đưa vào Execution Diff → [UC-03](./UC-03-Read-Execution-Diff.md) |
| ✅ **Đánh dấu incomplete capture** | Phân biệt rõ *"capsule không có dữ liệu này"* với *"production trả về giá trị này"* |
| ✅ **KHÔNG crash** | Replay phải kết thúc có kiểm soát và báo cáo được |
| ❌ **TUYỆT ĐỐI KHÔNG fallback sang gọi hệ thống thật ở local** | Không query database local, không gọi external API thật, không đọc feature flag thật |

**Neo cho vế cấm fallback**:

- §33.5 **Determinism over magic** — *"The system should explain exactly what was captured and replayed."* Một fallback ngầm sang hệ thống thật là đúng nghĩa **magic**: kết quả replay sẽ trộn dữ liệu production đã ghi với dữ liệu local sống, và **không ai phân biệt được** phần nào là phần nào.
- §33.6 **Safe by default** + §13 + §20.4 — *"Replay must never accidentally trigger production side effects."* Fallback mở lại đúng con đường mà default-deny write được dựng lên để chặn.
- §20.10 (*External Dependency Drift* — 🟠 High) — *"External services can change behavior between production and local replay."* Mitigation là *"Use recorded responses"*, không phải gọi thật.

> ### ⚠️ Ghi chú bắt buộc: `A5` là trường hợp **thường gặp nhất**, không phải trường hợp biên
>
> `RQ.md` **hoàn toàn không nêu điểm này**, nhưng nó suy ra trực tiếp từ chính use case chính của sản phẩm:
>
> §8 mô tả vòng làm việc gồm **bước 4 — developer fixes the code** rồi **bước 5 — developer verifies** ([UC-04](./UC-04-Verify-Fix.md)), và giữa hai bước đó developer sẽ **replay lại nhiều lần trên cùng một capsule**. Code local sau khi sửa **đương nhiên** phát ra query, HTTP call hoặc flag read **không có trong capsule** — thêm một `SELECT` để check null, gọi thêm một endpoint, đọc thêm một flag. Đó chính là **hình dạng của một bản fix**.
>
> ⇒ `A5` không phải ngoại lệ hiếm gặp. Nó là **đường đi mặc định** của vòng lặp fix. Một hệ thống xử lý `A5` bằng cách crash hoặc bằng cách fallback sẽ hỏng đúng ở kịch bản mà sản phẩm tồn tại để phục vụ.
>
> **`TBD` còn lại**: `RQ.md` không nói **giá trị gì** được trả về cho code local khi input thiếu (`null`? throw? một sentinel?). Ba lựa chọn này cho ba hành vi execution khác nhau, và lựa chọn sai sẽ tự sinh ra divergence giả. **Không tự quyết.** Liên quan trực tiếp `ACG-01` (phân biệt *"diverged vì đã fix"* với *"diverged vì thiếu dữ liệu"*) và `ACG-10`.

---

### `A6` — Capsule bị truncate hoặc không đọc được

**Điều kiện kích hoạt**: capsule không đầy đủ (bị cắt do size limit ở [UC-01](./UC-01-Capture-Failed-Production-Execution.md) `A1`), hỏng, hoặc không giải mã được.

**Căn cứ**: §20.12 nêu *size limits* và *selective capture*; §16 yêu cầu encryption at rest.

**Hành vi**: ⚠️ **`TBD` — `RQ.md` không định nghĩa.**

Ba khoảng trống chồng nhau:

1. §20.12 **không nói** hành vi khi capsule vượt size limit lúc capture ⇒ không biết capsule truncate trông thế nào ([UC-01](./UC-01-Capture-Failed-Production-Execution.md) `A1`).
2. `RQ.md` **không có** khái niệm "capsule incomplete" hay cách đánh dấu nó ⇒ replay runtime không có tín hiệu để đọc.
3. `RQ.md` **không có một dòng nào** về **capsule integrity**: không hash, không signature, không verification. [NFR-Repro](../NFR-Repro.md) mục 5.3 yêu cầu bổ sung hash/signature trong `manifest.json` **từ v1 của format** và verify **trước khi** parse — đây là **bổ sung của threat model**, **không** phải câu chữ của `RQ.md`, và nó ràng buộc `FR-017` nên phải chốt từ V0.1 vì không retrofit được.

**Liên quan `A5`**: capsule truncate biểu hiện ra **giống hệt** capsule thiếu input. Nếu không phân biệt được hai thứ, Execution Diff sẽ quy sai nguyên nhân — xem [UC-03](./UC-03-Read-Execution-Diff.md) `A4`.

---

## 7. Postconditions

### 7.1 Thành công — hai nhánh, cả hai đều hợp lệ

| Nhánh | Trạng thái | Bước tiếp theo |
|---|---|---|
| **`💥 BUG REPRODUCED`** | Execution đã chạy lại trên code local và tái hiện failure; developer có một execution xác định để debug (§8, §25) | Developer fix code → [UC-04](./UC-04-Verify-Fix.md) |
| **`⚠️ Execution diverged`** | Replay chạy xong nhưng execution đi đường khác; Repro **vẫn tạo giá trị** bằng cách chỉ ra khác biệt (§9) | [UC-03](./UC-03-Read-Execution-Diff.md) |

### 7.2 Bất biến phải giữ trong mọi nhánh

| # | Bất biến | Nguồn § |
|---|---|---|
| I1 | **Không** side effect thật nào bị kích hoạt (charge, email, shipment, webhook, delete, publish event) | §13, §20.4, §33.6, `N-12` |
| I2 | **Không** truy cập production, kể cả production database | §5, §11, §7, `FR-033` |
| I3 | Hệ thống giải thích **chính xác** cái gì đã capture và cái gì đã replay | §33.5, `N-13` |
| I4 | Hệ thống **không** báo thành công khi execution đi đường khác | §10, §20.3, `FR-039` |
| I5 | Capsule replay được ở môi trường **khác** nơi tạo ra nó — §22 đưa bước *"Destroy original environment"* vào quy trình spike đúng để chứng minh tính chất này. ⚠️ **Nay có ĐIỀU KIỆN**: cần **lấy được khoá giải mã từ server** (`GATE-05b`) — xem ghi chú dưới bảng | §6, §22, §40, `N-18`; điều kiện mới từ `GATE-05b` |

> ### ⚠️ `I5` bị `✅ CHỐT GATE-05b — 2026-08-14` làm đổi — đọc kỹ, đây là thay đổi nặng nhất của tài liệu này
>
> **Quyết định**: `SEC-016` **crypto-shredding = ÁP DỤNG, phân loại `MUST-V0.1`**. Capsule mã hoá bằng **khoá riêng từng capsule, khoá giữ phía server**; **xoá khoá ⇒ capsule không giải được**. Chi tiết: [NFR-Repro](../NFR-Repro.md) mục 5.4.
>
> **Hệ quả lên `I5`** — `GATE-05b-r`: *"capsule replay được ở môi trường khác"* **không còn là một khẳng định vô điều kiện**. Phát biểu đúng của `I5` sau quyết định:
>
> | | Trước `GATE-05b` | Sau `GATE-05b` |
> |---|---|---|
> | Điều kiện để replay ở môi trường khác | Có capsule **là đủ** | Có capsule **và** lấy được **khoá từ server** |
> | Replay hoàn toàn offline | ✅ Được coi là bất biến | ❌ **Thôi là bất biến** |
> | Capsule self-contained tuyệt đối | ✅ | ❌ — va thẳng vào [ADR-002](../../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) |
>
> **Bằng chứng gốc giữ nguyên**: §6, §40 và bước *"Destroy original environment"* của §22 **vẫn** yêu cầu capsule portable, và `N-18` **vẫn** là ràng buộc. `GATE-05b` **không** xoá tính portable — capsule vẫn di chuyển được sang máy khác, môi trường khác, và §22 vẫn chứng minh được điều đó. Cái mất là **tính tự-đủ khi ngắt mạng**.
>
> **Ranh giới phải đọc đúng — `I2` KHÔNG bị phá**: khoá nằm ở **server của Capsule Store**, **không** phải ở production. `I2` (*"không truy cập production, kể cả production database"* — §5, §11, §7, `FR-033`) **vẫn nguyên**. Chỉ `I5` mang điều kiện mới. **Không được đọc `GATE-05b` như đã nới `I2`.**
>
> **Đây là hệ quả được chấp nhận có ý thức**, không phải phát hiện muộn: cảnh báo *"replay không cần kết nối mạng thôi là bất biến"* đã được nêu trước khi anh quyết, và anh vẫn chọn `MUST-V0.1`. Rủi ro tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.
>
> **`TBD` kèm theo — blocker (`GATE-05b-r2`)**: hành vi khi **không lấy được khoá** lúc replay (báo lỗi phân biệt được với `A6` capsule hỏng? retry? cache khoá có được phép không, và nếu được thì bao lâu?) — **chưa có nguồn**, owner **`@TrisJr`**, điều kiện đóng: quyết định key custody (`U-06d`) tại [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`. **Không tự quyết ở tài liệu này.**

---

## 8. FR bao phủ

Tra theo **hợp đồng traceability** ở [PRD-Repro](../PRD-Repro.md) mục 5.7:

> **UC-02** → `FR-027`…`FR-038`, `FR-044`, `FR-045`, `FR-048`, `FR-050`

### 8.1 Chi tiết

| FR | Nội dung | Bước / Flow |
|---|---|---|
| `FR-027` | Pull capsule theo id | 2 |
| `FR-028` | Replay HTTP request | 5 |
| `FR-029` | Intercept DB read → recorded production result | 6 |
| `FR-030` | Intercept outbound HTTP → recorded response | 7 |
| `FR-031` | Replay clock/timestamp | 8 |
| `FR-032` | Replay feature flag state | 8 |
| `FR-033` | Chạy trên code local, **không** cần truy cập production | 10, I2 |
| `FR-034` | Phân loại interaction READ / WRITE | 9 |
| `FR-035` | **Default-deny writes** — core safety mechanism | 9, I1 |
| `FR-036` | WRITE bị chặn trả về recorded result để execution đi tiếp | 9 |
| `FR-037` | Replay boundary tường minh = **service boundary** của service đang điều tra (**E5**) | 10 |
| `FR-038` | Mọi dependency ngoài boundary replay từ recorded response | 10, `A5` |
| `FR-044` | Phát hiện code/version mismatch + cảnh báo *"Replay may not be deterministic"* | 3, `A1` |
| `FR-045` | Phát hiện database schema drift và phơi bày mismatch | 3, `A2` |
| `FR-048` | `repro pull <id>` | 2 |
| `FR-050` | `repro replay <id>` — in checklist input đã replay + kết luận | 4, 11 |

### 8.2 FR liên quan nhưng **không** thuộc UC này

`FR-039`…`FR-043` (execution verification + diff) thuộc [UC-03](./UC-03-Read-Execution-Diff.md) theo hợp đồng mục 5.7, dù `A3`/`A4` của UC này là điểm chuyển tiếp sang chúng. `FR-046` (verify before/after) thuộc [UC-04](./UC-04-Verify-Fix.md).

### 8.3 ⚠️ Ràng buộc fail-closed lên `FR-034`/`FR-035`/`FR-036`

[NFR-Repro](../NFR-Repro.md) mục 5.2 và `ACG-09` chỉ ra: §13 chỉ đưa **hai danh sách ví dụ** (READ: `SELECT`, `GET`, cache read; WRITE: `INSERT`, `UPDATE`, `DELETE`, `POST payment`, publish event), **không phải một quy tắc phân loại toàn phần**. Mọi thứ ngoài hai danh sách rơi vào vùng không xác định, và vùng đó **fail-open đúng ở chỗ nguy hiểm nhất**: socket thô, tiến trình con gọi công cụ HTTP bên ngoài, SDK dùng transport riêng, SQL bắt đầu bằng `WITH` mà bên trong có `UPDATE`, `SELECT` gọi hàm có side effect, `CALL`, hay một `GET` thực chất gây hành động.

⇒ Yêu cầu bổ sung (từ NFR, **không** từ `RQ.md`): mọi interaction **không chứng minh được là READ** phải bị xử như WRITE; chặn egress ở mức process bằng **allowlist** (loopback + replay proxy) thay vì tin vào phân loại verb.

---

## 9. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | Hợp đồng FR (mục 5.7); mục 10.5 — `ACG-07` **vẫn hở**, `U-06` **đã chốt phần sàn** (`✅ CHỐT GATE-04 — 2026-08-14`; **cơ chế** authn/authz vẫn `TBD`); mục 5.2 `FR-024` (TTL mặc định **30 ngày**, `GATE-05a`) |
| [NFR-Repro](../NFR-Repro.md) | `ACG-01` (chặn `A4`), `ACG-07` (chặn P6 và `A5`), `ACG-09` (`FR-034`…`FR-036`), `ACG-10` (`A1`, `A2`); `N-12`, `N-13`, `N-16`, `N-18`; mục 5.2, 5.3 |
| [UC-01 — Capture Failed Production Execution](./UC-01-Capture-Failed-Production-Execution.md) | Tạo ra capsule mà UC này tiêu thụ; `A1` của UC-01 sinh ra `A6` của UC này |
| [UC-03 — Read Execution Diff](./UC-03-Read-Execution-Diff.md) | Bước tiếp theo khi `A3` / `A5` |
| [UC-04 — Verify Fix](./UC-04-Verify-Fix.md) | Bước tiếp theo sau khi developer fix code |
| [UC-05 — Browse And Inspect Capsules](./UC-05-Browse-And-Inspect-Capsules.md) | Nguồn của bước 1 (`repro list`); kiểm tra nội dung capsule khi nghi `A5`/`A6` |
| [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) | Vấn đề gốc — thay `Guess the state` (§2.1) bằng recorded input |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế replay runtime, interception, capsule store — §5.4 giữ 3 thao tác tối thiểu của sàn `GATE-04`; §4.9 và §7.4 giữ hệ quả của `GATE-05b` lên `I5` |
| [ADR-009 — Private Self-Hosted Topology](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) | Sàn Capsule Store (`D3`) và **key custody `U-06d`** — blocker của điều kiện mới ở `I5` |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — §5, §7, §8, §10, §11, §12, §13, §14, §15, §18, §20.3, §20.4, §20.9, §20.10, §20.11, §20.12, §25, §33 |
