---
id: UC-01
type: use-case
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🎬 UC-01 — Capture Failed Production Execution

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N`. Chỗ `RQ.md` không định nghĩa hành vi ⇒ ghi `TBD` và nói rõ thiếu nguồn.
**Hợp đồng FR**: [PRD-Repro](../PRD-Repro.md) mục 5.7.

---

## 1. Mục tiêu

Biến một **failed production execution** thành một **Repro Capsule** — artifact portable, đã redact và đã encrypt, nằm trong private storage của chính tổ chức, sẵn sàng để developer pull về replay ở local.

Neo nguyên tắc (§4, §33.1, §40):

> **Capture the execution, not the environment.**

Capsule chỉ chứa *"only the information necessary to reproduce the execution"* và *"should not be a copy of the production environment"* (§6).

> ⚠️ **`ACG-08`** ([NFR-Repro](../NFR-Repro.md) mục 7): *"only the information necessary"* **không có tiêu chí quyết định** tại thời điểm capture — capture xảy ra **trước** khi biết replay có thành công không. Mục tiêu này vì thế là **nguyên tắc**, không dùng làm acceptance criteria.

---

## 2. Actor

| Vai | Trách nhiệm trong UC này | Mức bằng chứng |
|---|---|---|
| **SRE / DevOps** (primary actor của UC này) | Cài SDK vào production, cấu hình redaction (§16), cấu hình sampling / capture limits (§20.7), sở hữu private storage (§20.6), chịu trách nhiệm về overhead lên production (§20.7) | `inferred` — xem [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 4 |
| **Software Engineer sở hữu service** | Có thể tự đảm nhiệm toàn bộ vai trên ở tổ chức nhỏ; là người **tiêu thụ** capsule ở [UC-02](./UC-02-Replay-Capsule-Locally.md) | §20.14 mô tả trải nghiệm cài đặt hướng thẳng tới developer |
| **Repro Recorder** (system actor) | Thành phần chạy in-process ở production, thực hiện buffer → redact → đóng gói → upload (§17) | `stated` (§17) |

> **Lưu ý**: `RQ.md` **không** phân vai người dùng cho luồng capture ở bất kỳ section nào. Việc gán SRE/DevOps là `inferred` từ bản chất công việc (§16, §20.5, §20.6, §20.7, §20.17), không phải trích dẫn.

---

## 3. Trigger

**Một execution ở production kết thúc ở trạng thái failed.**

Quyết định **E5** áp dụng: **V0.1 chỉ capture failed executions**, không capture execution thành công, và **không có manual recording**.

Neo:

| Neo | Nội dung |
|---|---|
| §20.7 | Mitigation: *"capture only failed/high-value executions"* |
| §18 | Capture list có **stack trace** — thứ chỉ tồn tại khi có failure |
| §37 | Chuỗi outcome của MVP bắt đầu từ `Production Bug` |
| §38 Q5 | *"Should V0.1 support only failed executions?"* → PM chốt **Có** (`FR-012`) |
| §38 Q6 | *"Should manual recording also be supported?"* → PM chốt **Không** → `NG-12`, §18 CLI **không có** lệnh `record` |

> ⚠️ **Nghịch lý trigger — đã ghi ở [PRD-Repro](../PRD-Repro.md) mục 5.1 và [NFR-Repro](../NFR-Repro.md) mục 2.2, nhắc lại ở đây vì nó ràng buộc trực tiếp bước 4–6 của luồng chính**: một execution chỉ **được biết là failed sau khi nó kết thúc**. Recorder vì thế buộc phải buffer **mọi** execution rồi huỷ khi thành công. `RQ.md` **không thừa nhận** điểm này ở bất kỳ đâu.

---

## 4. Preconditions

| # | Điều kiện | Nguồn § | FR |
|---|---|---|---|
| P1 | Ứng dụng thuộc target stack V0.1: **Node.js + PostgreSQL + HTTP** | §18, §22, §26 | — |
| P2 | Gói `@repro/node` đã được cài vào ứng dụng production | §20.14 | `FR-001` |
| P3 | `repro.init()` đã được gọi khi ứng dụng khởi động | §20.14 | `FR-002` |
| P4 | Cấu hình redaction đã tồn tại và parse được (header + field) | §16 | `FR-022` |
| P5 | Private storage đã sẵn sàng và recorder có quyền ghi vào đó | §20.6, §28 | `FR-055` |
| P6 | Toàn bộ thành phần Repro chạy trong hạ tầng của chính tổ chức (self-hosting, bắt buộc từ V0.1 — **E7**) | §16, §20.6, §28, §38 Q12 | `FR-054` |
| P7 | Execution nằm trong **Supported Execution Class** | §20.1 | ⚠️ **`TBD`** |

> ⚠️ **P7 không spec được.** §20.1 yêu cầu *"Limit the MVP to a clearly defined class of deterministic request/response executions"* nhưng **class đó không tồn tại ở bất kỳ đâu trong `RQ.md`** (`ACG-07`, [NFR-Repro](../NFR-Repro.md) mục 7). Tài liệu này **không tự chế định nghĩa thay thế**. Hệ quả: precondition P7 hiện **không kiểm được**, và `FR-012` (chỉ capture failed execution) chưa spec được là capture **class nào** của failed execution.

---

## 5. Main success flow

| # | Bước | Actor | Nguồn § | FR |
|---:|---|---|---|---|
| 1 | Cài SDK bằng **một lệnh duy nhất**: `npm install @repro/node` | SRE / Engineer | §20.14 | `FR-001` |
| 2 | Khởi tạo bằng `repro.init()` với **cấu hình tối thiểu** — không dựng thêm hạ tầng | SRE / Engineer | §20.14, §38 Q13 | `FR-002` |
| 3 | Cấu hình **redaction**: header (`authorization`, `cookie`) và field (`password`, `access_token`, `credit_card`); cấu hình sampling và capture limits | SRE / DevOps | §16, §20.7, §20.12 | `FR-015`, `FR-016`, `FR-022` |
| 4 | Execution chạy ở production: `POST /api/checkout` đi qua chuỗi `HTTP Request → Authentication → Feature Flags → Database Reads → External APIs → Business Logic` | Production app | §5, §2.1 | — |
| 5 | Recorder **buffer** các input mà execution nhìn thấy, **bất đồng bộ**, trên **bounded buffer**: inbound HTTP request · database query/result · external HTTP response · feature flag state · clock/timestamp · Git commit + application version · runtime + dependency versions · database schema/migration version | Repro Recorder | §18, §5, §6, §15, §17, §20.7 | `FR-003`, `FR-005`…`FR-011`, `FR-013`, `FR-014` |
| 6 | Execution **thất bại**. Recorder capture **stack trace** của failure và chốt buffer thành một execution record. Execution thành công thì buffer bị huỷ (xem nghịch lý ở mục 3) | Repro Recorder | §18, §2.1, §20.7 | `FR-004`, `FR-012` |
| 7 | **Redaction stage**: áp cấu hình redaction lên toàn bộ dữ liệu đã buffer; anonymize PII (`john@example.com` → `user-1842@example.test`) | Repro Recorder | §16, §20.5 | `FR-022`, `FR-023` |
| 8 | Đóng gói thành **Repro Capsule** với cấu trúc §6 — `manifest.json`, `request.json`, `environment.json`, `feature-flags.json`, `database/query-NNN.json`, `network/*.json`, `metadata.json` — kèm compression, deduplication, content hashing, size limits | Repro Recorder | §6, §20.12 | `FR-017`, `FR-018`, `FR-019`, `FR-020` |
| 9 | Recorder **tự upload** capsule đã **encrypt** lên **private storage** theo topology `Production → Private Recorder → Encrypted Capsule → Private Storage`. Access control và audit log áp lên capsule tại đây | Repro Recorder | §20.6, §28, §20.5, §20.17 | `FR-021`, `FR-024`, `FR-025`, `FR-026`, `FR-055` |

> **Quyết định E8 áp dụng ở bước 9**: recorder **tự upload**; `repro pull` ([UC-02](./UC-02-Replay-Capsule-Locally.md)) đọc từ private storage. **KHÔNG có lệnh push phía CLI** — §18 liệt kê đúng 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) và **không có** `push`.

**Kết quả developer nhìn thấy** (§8 Step 1):

```text
BUG-1842

Checkout failed.

Repro Capsule available.
```

> **Ràng buộc `N-10` xuyên suốt luồng này** ([NFR-Repro](../NFR-Repro.md) mục 4, §20.7): *"Repro must never become the reason production becomes slower or fails."* Khi có xung đột giữa "capture đầy đủ hơn" và "không ảnh hưởng production", §20.7 đã phân xử sẵn bằng chữ **never**.

---

## 6. Alternative / Exception flows

### `A1` — Capsule vượt size limit

**Điều kiện kích hoạt**: dữ liệu đã buffer vượt ngưỡng size cấu hình được (`FR-016`, `FR-019`).

**Căn cứ** — §20.12 (*Capsule Size* — 🟠 High): *"Large requests, database results, file uploads and binary data can create very large capsules."* Mitigation §20.12 liệt kê 6 kỹ thuật: **compression, deduplication, content hashing, size limits, selective capture, lazy loading**.

**Hành vi**: ⚠️ **`TBD` — `RQ.md` không định nghĩa.**

§20.12 nêu *"size limits"* như một mitigation nhưng **không nói vượt limit thì làm gì**. Bốn khả năng đều tương thích với câu chữ hiện có và cho bốn sản phẩm khác nhau:

| Khả năng | Hệ quả |
|---|---|
| Bỏ hẳn capsule | Mất execution — mâu thuẫn với chính mục tiêu của UC này |
| Truncate rồi vẫn lưu | Sinh **incomplete capture** — dẫn thẳng sang `A5`/`A6` của [UC-02](./UC-02-Replay-Capsule-Locally.md) |
| Lưu đủ nhưng cảnh báo | Vi phạm chính size limit vừa đặt ra |
| Selective capture ngay từ đầu (§20.12) | Cần quy tắc "cái gì quan trọng hơn" — quy tắc này không tồn tại |

**Thiếu nguồn**: `RQ.md` không có section nào phân xử. Liên quan `N-03`/`N-09` và `ACG-11` ([NFR-Repro](../NFR-Repro.md) mục 2.3, 3.3, 7). **Không tự quyết ở đây.**

---

### `A2` — Buffer đầy hoặc execution bị loại bởi sampling

**Điều kiện kích hoạt**: bounded buffer đạt giới hạn (`FR-014`), hoặc execution rơi ra ngoài tỷ lệ sampling đã cấu hình (`FR-015`).

**Căn cứ** — §20.7 (*Production Performance Overhead* — 🟠 High), mitigation gồm: **asynchronous capture, bounded buffers, sampling, configurable capture limits, capture only failed/high-value executions**.

**Hành vi**: execution **không** được capture; **không có capsule** nào được tạo. Đây là kết quả **được chấp nhận có chủ ý** vì `N-10` (§20.7) thắng yêu cầu về độ đầy đủ của capture.

**Điểm phải nói thẳng — `RQ.md` không nêu**:

> **Sampling và mục tiêu của sản phẩm kéo ngược chiều nhau.** Sampling (`FR-015`) tồn tại để giảm overhead, nhưng nó đồng thời **giảm xác suất bắt được đúng execution lỗi** — mà execution lỗi chính là thứ duy nhất V0.1 quan tâm (`FR-012`). Một bug hiếm là loại bug khó reproduce nhất, và cũng là loại bug dễ bị sampling loại bỏ nhất.

**Còn `TBD`**:

- Có tín hiệu nào báo cho developer rằng *"execution này đã fail nhưng không có capsule"* không? `RQ.md` không nói.
- Sampling áp **trước** hay **sau** khi biết execution failed? §20.7 không nói, và nghịch lý ở mục 3 khiến hai cách đặt cho hai kiến trúc khác hẳn nhau.

---

### `A3` — Hidden input không capture được

**Điều kiện kích hoạt**: execution phụ thuộc một input nằm ngoài tập mà §18 capture.

**Căn cứ** — §20.1 (*Insufficient Execution Capture* — 🔴 **Critical**, risk số một của tài liệu) liệt kê **9 nhóm hidden input**:

| # | Hidden input (§20.1) | V0.1 phủ? | Ghi chú |
|---:|---|---|---|
| 1 | Environment variables | ❌ | Không có FR |
| 2 | Filesystem state | ❌ | Không có FR |
| 3 | Randomness | ⚠️ | §20.2 chỉ hứa *"UUID capture where practical"* — `ACG-06` gọi đây là **miễn trừ, không phải tiêu chí** |
| 4 | System clock | ✅ | `FR-008` |
| 5 | Process state | ❌ | Không có FR |
| 6 | Concurrency | ❌ | §20.13 out of scope |
| 7 | Network behavior | ❌ | Không có FR |
| 8 | OS behavior | ❌ | Không có FR |
| 9 | Background jobs | ❌ | §26 đặt ở V0.3 |

§20.1: *"If these are not captured, replay may fail."*

**Hành vi**: ⚠️ **`TBD` — chặn bởi `ACG-07`.**

Recorder **không có cách nào biết** một execution phụ thuộc hidden input, vì theo định nghĩa nó không quan sát được input đó. Ba câu hỏi đều không có đáp án trong `RQ.md`:

1. Recorder có capture execution này không, hay từ chối?
2. Capsule có được **đánh dấu là incomplete** không?
3. Có cảnh báo nào tới người dùng không?

**Chặn**: `ACG-07` — chưa có "Supported Execution Class" thì không có tiêu chí để nói execution nào rơi ra ngoài. **Tuyệt đối không tự chế định nghĩa.** Hệ quả lan sang `A5` của [UC-02](./UC-02-Replay-Capsule-Locally.md).

---

### `A4` — Redaction miss

**Điều kiện kích hoạt**: dữ liệu nhạy cảm lọt qua cấu hình redaction và đi vào capsule.

**Căn cứ** — §20.5 (*Sensitive Production Data* — 🔴 **Critical**): captured data có thể chứa **PII, credentials, tokens, financial information, internal data**. §16 mô tả redaction dạng danh sách:

```yaml
redaction:
  headers:
    - authorization
    - cookie

  fields:
    - password
    - access_token
    - credit_card
```

**Vì sao đây là exception flow bắt buộc chứ không phải chuyện hiếm** ([NFR-Repro](../NFR-Repro.md) mục 5.5):

> **Redaction là hygiene control, KHÔNG phải containment boundary.**

Redaction dựa-trên-danh-sách về nguyên tắc **không thể** bắt được: free-text, tên field không đoán trước, payload lồng/encode, giá trị không có key, PII trong URL, binary có metadata nhúng, **stack trace và SQL error message** — và §18 **yêu cầu capture đúng stack trace**, tức sản phẩm chủ động ghi lại đúng loại dữ liệu mà mọi rule theo tên đều mù.

**Hành vi được yêu cầu** (từ NFR, **không** từ `RQ.md`):

- **Fail closed** ([NFR-Repro](../NFR-Repro.md) mục 5.1): redaction lỗi ⇒ **không persist** capsule; config redaction thiếu hoặc parse lỗi ⇒ **refuse to start**, tuyệt đối không mặc định về "no redaction".
- **Giữ hình dạng dữ liệu** ([NFR-Repro](../NFR-Repro.md) mục 5.6): thay thế format-preserving thay vì xoá key — xoá hẳn field làm **đổi code path** và sinh bug giả ở replay.
- **Capsule phải ghi lại đã redact field nào** — điều kiện để [UC-03](./UC-03-Read-Execution-Diff.md) phân biệt *"diverged vì code"* với *"diverged vì redaction"*, và để [UC-05](./UC-05-Browse-And-Inspect-Capsules.md) hiển thị đúng trạng thái đã redact.

> ⚠️ **Ghi rõ nguồn**: ba hành vi trên đến từ [NFR-Repro](../NFR-Repro.md) mục 5, **không** phải câu chữ của `RQ.md`. §16 chỉ đưa **hình dạng** config redaction và **không nói gì** về integrity của config hay hành vi khi config vắng mặt.

**Vẫn `TBD`**: quy trình xử lý sau khi phát hiện một capsule đã lưu có chứa dữ liệu lọt (thu hồi? xoá? thông báo?). `RQ.md` §20.17 nêu *deletion* và *audit logs* trong mitigation compliance nhưng không mô tả quy trình.

---

### `A5` — Capsule không upload được lên private storage

**Điều kiện kích hoạt**: bước 9 thất bại (mất mạng, storage từ chối, hết quyền).

**Hành vi**: **sàn của Capsule Store đã chốt** — `✅ CHỐT GATE-04 — 2026-08-14`; **cơ chế** authn/authz **vẫn `TBD`**.

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

**Bằng chứng gốc — giữ nguyên.** [PRD-Repro](../PRD-Repro.md) mục 10.5 (`U-06`) đã ghi nhận: `repro pull` (§8) và `repro list` (§18) **hàm ý** tồn tại một store ở xa có API và có auth; §20.6 vẽ *"Private Storage"*; §28 xếp *"Basic Self-hosting"* vào OSS core — nhưng `RQ.md` **không có một dòng đặc tả nào**: không API, không auth, không storage backend, không mô hình triển khai. Mệnh đề về `RQ.md` này **vẫn đúng** sau `GATE-04`: quyết định của anh cấp đặc tả **từ ngoài** `RQ.md`, nó không sửa `RQ.md`.

**Sàn tối thiểu đã chốt** (`GATE-04`): **object/file storage + một index + hook authn/authz/audit**, kèm 3 thao tác tối thiểu theo `SDD §5.4` — xem [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) §5.4 và [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `D3`.

⇒ **Ảnh hưởng tới `A5`**: đích upload của bước 9 nay xác định (object/file storage + index), nên `A5` không còn là *"lỗi khi ghi vào một thành phần chưa tồn tại trên giấy"*.

**Nhưng hành vi cụ thể của `A5` VẪN `TBD`** — và `GATE-04` **không** đóng nó:

| Câu hỏi của `A5` | Trạng thái |
|---|---|
| Upload lỗi thì retry? buffer trên đĩa? drop? | **`TBD`** — `GATE-04` chốt *sàn của store*, không chốt *hành vi của recorder khi store không với tới được* |
| `N-10` (*production không bao giờ được chậm đi hoặc lỗi vì Repro*) áp thế nào lên phần retry/buffer đó | **`TBD`** — ràng buộc đã biết, cơ chế chưa có |
| **Cơ chế** authn/authz để upload | **`TBD`** — `GATE-04` chốt *phải có hook*, **không** chốt *hook làm bằng gì* |

Owner của cả ba: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế recorder + Capsule Store API tại [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) §5.4. **Không tự quyết ở tài liệu này.**

---

## 7. Postconditions

### 7.1 Thành công

| # | Trạng thái sau UC | Nguồn § | FR |
|---|---|---|---|
| S1 | Một Repro Capsule tồn tại trong private storage, đúng cấu trúc §6 | §6, §17 | `FR-017`, `FR-018` |
| S2 | Capsule đã **redact** và **anonymize** theo cấu hình | §16, §20.5 | `FR-022`, `FR-023` |
| S3 | Capsule đã **encrypt at rest** | §16, §21 | `FR-021` |
| S4 | Capsule chịu **access control** và có **audit log** truy cập | §20.5, §20.17 | `FR-025`, `FR-026` |
| S5 | Capsule có **retention policy** áp lên nó — **TTL mặc định = 30 ngày** (`✅ CHỐT GATE-05a — 2026-08-14`), vẫn cấu hình được | §20.5, §20.17; giá trị mặc định từ `GATE-05a` | `FR-024` |
| S6 | Capsule **pull được** bằng id → chuyển sang [UC-02](./UC-02-Replay-Capsule-Locally.md) | §8, §18 | `FR-027` |
| S7 | Production **không** chậm đi hoặc lỗi vì Repro | §20.7 | `N-10` |

> ✅ **S4 và S5 đứng vững — M2 ĐÃ CHỐT 2026-08-14**: access control và audit log thuộc **OSS core**, nên hai postcondition này là hành vi bắt buộc của bản OSS, không phải tính năng trả phí. Xem mục 8.2.

> ✅ **`CHỐT GATE-05a — 2026-08-14` — `S5` nay có con số.** Trước quyết định này, `S5` chỉ nói *"có retention policy áp lên nó"* mà `RQ.md` **không cấp giá trị mặc định nào** (§20.5 chỉ nói *"configurable retention"*) ⇒ `S5` là một postcondition **không kiểm được**. Nay: **TTL mặc định = 30 ngày** khi không cấu hình; retention **vẫn cấu hình được** theo `FR-024`. ⇒ `S5` kiểm được: sau UC này, capsule phải mang một thời điểm hết hạn, và mặc định là **capture time + 30 ngày**. Neo bảo mật: `SEC-022`.

> ✅ **`CHỐT GATE-05b — 2026-08-14` — hệ quả lên capsule vừa được UC này tạo ra.** **Crypto-shredding = `MUST-V0.1`** (`SEC-016`): capsule mã hoá bằng **key riêng từng capsule, khoá giữ phía server**; xoá khoá ⇒ **capsule không giải được**, kể cả bản đã pull về laptop. Ba hệ quả trực tiếp lên UC này:
>
> 1. **`S3` (encrypt at rest, `FR-021`) siết lại**: encryption không còn được thoả bằng một khoá chung cấp store — mỗi capsule phải mã hoá bằng **khoá riêng của chính nó**, và khoá đó **không** được đóng gói bên trong capsule. Nếu khoá nằm trong capsule thì việc phá khoá không xoá được gì.
> 2. **`S5` + `S3` gắn với nhau**: hết retention (`S5`) nay có thể thực thi bằng **phá khoá**, chứ không chỉ bằng xoá bản gốc trong store — đó là điều duy nhất chạm được tới các bản copy đã rời khỏi hạ tầng tổ chức.
> 3. **`S6` (capsule pull được) mang điều kiện mới** — `GATE-05b-r`: capsule **không còn self-contained tuyệt đối**; bên nhận cần **lấy được khoá từ server** mới giải được. Chi tiết ở [UC-02](./UC-02-Replay-Capsule-Locally.md) `I5`.
>
> **`TBD` mới nổi lên thành blocker — `GATE-05b-r2`**: **key custody** (`U-06d`) — khoá giữ ở đâu, ai cấp, xoay vòng thế nào, xoá bằng thao tác nào. Không có key management thì cả `S3` lẫn `S5` **không thực thi được**. Owner: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế key management tại [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`. Rủi ro tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2. Chi tiết NFR: [NFR-Repro](../NFR-Repro.md) mục 5.4.

### 7.2 Thất bại

Không có capsule nào được tạo (`A2`), hoặc capsule tồn tại nhưng **incomplete** (`A1` truncate, `A3` hidden input). `RQ.md` **không định nghĩa** cách đánh dấu trạng thái incomplete trên capsule ⇒ **`TBD`**, và điều này chuyển gánh nặng sang exception flow của [UC-02](./UC-02-Replay-Capsule-Locally.md).

---

## 8. FR bao phủ

Tra theo **hợp đồng traceability** ở [PRD-Repro](../PRD-Repro.md) mục 5.7:

> **UC-01** → `FR-001`…`FR-026`, `FR-054`, `FR-055`

### 8.1 Chi tiết

| Nhóm | FR | Nội dung |
|---|---|---|
| Adoption / cài đặt | `FR-001`, `FR-002` | `npm install @repro/node`, `repro.init()` với cấu hình tối thiểu (§20.14) |
| Capture nội dung | `FR-003`…`FR-011` | HTTP request, stack trace, DB query/result, external HTTP response, feature flag, clock, Git commit + app version, runtime + dependency versions, schema version (§18, §15) |
| Capture chính sách | `FR-012`…`FR-016` | Chỉ capture failed execution (**E5**), asynchronous, bounded buffer, sampling, **capture limits + selective capture** (§20.7, §20.12) |
| Capsule | `FR-017`…`FR-020` | Cấu trúc §6, chỉ chứa thông tin cần thiết, compression + size limits, deduplication + content hashing |
| Bảo mật / compliance | `FR-021`…`FR-026` | Encryption at rest **(khoá riêng từng capsule, giữ phía server — `GATE-05b`)**, automatic redaction, PII anonymization, retention + deletion **(TTL mặc định 30 ngày — `GATE-05a`)**, strict access control, audit log (§16, §20.5, §20.17; giá trị mặc định và cơ chế crypto-shred từ `GATE-05a`/`GATE-05b` ngày 2026-08-14) |
| Deployment | `FR-054`, `FR-055` | Self-hosting bắt buộc từ V0.1 (**E7**); topology mặc định `Production → Private Recorder → Encrypted Capsule → Private Storage` (§20.6, §28) |

> **Ghi chú định danh — quan trọng**: `FR-016` là **capture limits + selective capture** (§20.7, §20.12), **không** phải Redis capture. Theo **E1**, Redis **không thuộc V0.1**; Redis capture/replay nằm ở `FR-065` (post-MVP, §26 V0.3). Xem [PRD-Repro](../PRD-Repro.md) mục 3.5 và 5.1.

### 8.2 M2 — Access control: OSS core hay commercial layer? — ✅ **ĐÃ CHỐT 2026-08-14: OSS core**

`FR-024`, `FR-025`, `FR-026` (postcondition S4, S5) rơi thẳng vào một mâu thuẫn nội tại của `RQ.md`. **Hai phía dưới đây giữ nguyên làm bằng chứng** — `RQ.md` vẫn tự nói ngược ở chính những section này:

| Phía "commercial layer" | Phía "MVP core" |
|---|---|
| §28 xếp **Access control**, **Retention policies**, **Team management**, **Enterprise security** vào *"Potential commercial layer"* | §20.5 (🔴 Critical *Sensitive Production Data*) liệt kê **strict access control** trong mitigation |
| §28 cho OSS core chỉ có *"Basic Self-hosting"* | §21 Risk Matrix đánh `MVP? = Yes` cho *Sensitive data* và *Security exposure* |
| | §20.17 (Compliance) yêu cầu retention policies, deletion, **audit logs** |

**Hệ quả**: **bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.** Tổ chức làm đúng khuyến nghị §20.6 sẽ nhận một hệ thống chứa dữ liệu production nhạy cảm mà không có authn/authz, không retention, không audit log.

#### ✅ Quyết định — **ĐÃ CHỐT 2026-08-14**

**Authentication + authorization (access control) + audit log nằm trong OSS core**, **không** phải commercial layer — **ghi đè** phần §28 xếp *Access control* và *Retention policies* vào commercial layer. `FR-024`, `FR-025`, `FR-026` giữ nguyên là **MVP**, nên **S4 và S5 là postcondition bắt buộc của bản OSS**. Giữ ở commercial layer theo §28: hosted storage · team management · analytics · AI analysis · cloud integrations.

**Lý do**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production**; thiếu audit thì tổ chức **kiểm soát được nhưng không chứng minh được**, trong khi §20.17 (🟠 High) yêu cầu audit log như mitigation.

**Hệ quả cho UC này**: S4/S5 nay **chắc chắn phải triển khai ở V0.1**, nhưng §18 **không có CLI verb nào** để cấu hình hay kiểm tra chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side. Giao diện vận hành cho S4/S5 là **`TBD` tường minh**, không phải chỗ hở âm thầm.

> **Cập nhật sau `✅ CHỐT GATE-04 — 2026-08-14`**: sàn của Capsule Store đã đóng (xem `A5`) ⇒ đã có **chỗ để cắm** authz và audit của S4. Nhưng đoạn trên **vẫn đúng nguyên văn**: §18 vẫn **không có CLI verb nào** để vận hành S4/S5, và **cơ chế** authn/authz vẫn `TBD`. `GAP-04` **chưa đóng** — rủi ro **`GATE-04-r`** tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2 và `GAP-04` tại [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 4.1.

Xem [PRD-Repro](../PRD-Repro.md) mục 10.4 và [NFR-Repro](../NFR-Repro.md) mục 5.4.

---

## 9. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | Hợp đồng FR (mục 5.7), scope V0.1, mục 10.4 (M1/M2 — ✅ đã chốt 2026-08-14) |
| [NFR-Repro](../NFR-Repro.md) | `N-10`, `N-11`, `N-14`; `ACG-06`, `ACG-07`, `ACG-08`, `ACG-11`; mục 5 (fail-closed, allowlist, capsule integrity, redaction là hygiene control) |
| [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) | Vấn đề mà luồng capture này giải — 9 câu hỏi §2.1 |
| [UC-02 — Replay Capsule Locally](./UC-02-Replay-Capsule-Locally.md) | Bước kế tiếp — tiêu thụ capsule do UC này tạo ra |
| [UC-05 — Browse And Inspect Capsules](./UC-05-Browse-And-Inspect-Capsules.md) | Xem nội dung capsule do UC này tạo ra; hiển thị trạng thái đã redact |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế recorder, capsule format, capsule store |
| [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) | Persona SRE/DevOps — actor của UC này, và `GAP-04` |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — §5, §6, §8, §16, §17, §18, §20.1, §20.5, §20.6, §20.7, §20.12, §20.14, §20.17, §28 |
