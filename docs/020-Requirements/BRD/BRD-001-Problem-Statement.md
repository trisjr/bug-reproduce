---
id: BRD-001
type: brd
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🧩 BRD-001 — Problem Statement (Repro)

**Nguồn sự thật duy nhất**: `docs/999-Resources/RQ.md`. Mọi khẳng định trong tài liệu này đều kèm số hiệu section (`§N`) của `RQ.md`. Chỗ nào `RQ.md` không có căn cứ thì ghi `TBD` hoặc gắn nhãn **hypothesis**, không suy đoán và không trình bày như dữ liệu đã đo.

**Tài liệu cha**: [PRD-Repro](../PRD-Repro.md) mục 2.1.

---

## 1. Vấn đề

`RQ.md` §1 phát biểu vấn đề bằng đúng một câu, và đây là câu định nghĩa toàn bộ sản phẩm:

> **A bug happens in production, but nobody can reproduce it locally.**

### 1.1 Hình dạng thực tế của vấn đề

§2.1 minh hoạ bằng một production incident điển hình. Thông tin mà developer nhận được:

```text
ERROR #1842

TypeError: Cannot read properties of undefined

POST /api/checkout

User: 18392
Trace ID: abc123
```

§2.1 nhận xét thẳng về khối thông tin này:

> This tells the developer **what happened**, but often not enough to reproduce it.

### 1.2 Chín câu hỏi developer phải tự trả lời

Sau khi đọc incident ở trên, §2.1 liệt kê **9 câu hỏi** mà developer vẫn phải tự xác định (trích nguyên văn):

| # | Câu hỏi (§2.1) | Loại thông tin còn thiếu |
|---:|---|---|
| 1 | *What exact request triggered the error?* | Inbound request |
| 2 | *What data did the database return?* | Database result |
| 3 | *What did external APIs return?* | External API response |
| 4 | *Which feature flags were enabled?* | Feature flag state |
| 5 | *What was the user's state?* | Application/user state |
| 6 | *What application version was running?* | Code version |
| 7 | *What was the system time?* | Clock |
| 8 | *What happened in dependent services?* | Distributed context |
| 9 | *Was the bug caused by a specific ordering or timing?* | Concurrency / timing |

> **Điểm cần chú ý ngay ở đây**: 7 trong 9 câu hỏi này hỏi về **input mà execution đã nhìn thấy**, không hỏi về **hạ tầng**. Đây là quan sát dẫn thẳng tới insight nền tảng ở mục 5.

### 1.3 Debugging loop hiện tại kết thúc bằng "Hope"

§2.1 mô tả vòng lặp debug mà developer thực sự đi qua:

```text
Production Bug
      ↓
Read logs
      ↓
Inspect traces
      ↓
Guess the state
      ↓
Try locally
      ↓
Cannot reproduce
      ↓
Ask for more information
      ↓
Guess again
      ↓
Deploy
      ↓
Hope
```

§30 (*Developer Journey — Without Repro*) lặp lại đúng vòng lặp này và cũng kết thúc bằng bước **`Hope`**.

Hai chi tiết của vòng lặp này là **phát biểu vấn đề thật sự**, không phải cách nói cho hài hước:

- **`Guess the state`** xuất hiện ở giữa vòng lặp: developer phải **tái tạo state bằng suy đoán**, vì không ai đưa cho họ state thật.
- **`Hope`** là bước cuối cùng: quy trình hiện tại **không có bước xác nhận** rằng bản fix thật sự giải quyết được execution đã gây lỗi. Deploy xong thì chỉ còn cách chờ xem incident có tái xuất hiện không.

⇒ Vấn đề không chỉ là "tốn thời gian". Vấn đề là **vòng lặp hiện tại không có điểm kết thúc xác định** — nó kết thúc bằng một trạng thái tâm lý, không phải bằng một bằng chứng.

---

## 2. Vì sao observability không đủ

§3 có tiêu đề tường minh: *"Existing Observability Is Not Enough"*.

### 2.1 Observability trả lời câu hỏi khác

§3 liệt kê những gì observability tool cung cấp: **logs, traces, metrics, stack traces, request information, timestamps, service information** — và định vị chúng ở đúng một câu hỏi:

> What happened?

Nhưng developer vẫn còn một câu hỏi chưa ai trả lời (§3, nguyên văn):

> **Can I make the same execution happen again?**

§3 tóm tắt quan hệ giữa hai lớp:

```text
Observability
"What happened?"

        +

Repro
"Can I replay what happened?"
```

### 2.2 Repro là phép cộng, không phải phép thay thế

Đây là ràng buộc quan trọng nhất của mục này, và cả §3 lẫn §34 đều nói rõ:

- §3: *"Repro is therefore not intended to replace observability platforms. It adds a **reproducibility layer** on top of production diagnostics."*
- §34 (*What Repro Is Not*) liệt kê tường minh những thứ Repro **không** nhằm thay thế: **Sentry, Datadog, APM systems, logging platforms, testing frameworks, CI/CD systems** — và nói *"Instead, it complements them."*
- §34 vẽ workflow mà Repro **nhận input từ** observability: `Sentry / APM → (incident) → Repro → (replay) → Developer → (fix) → Regression Test → CI`.

**Hệ quả cho việc định nghĩa vấn đề**: vấn đề cần giải **không phải** "thiếu dữ liệu chẩn đoán ở production". Các tổ chức gặp vấn đề này thường **đã có** observability. Vấn đề là khoảng cách giữa *dữ liệu mô tả* một execution và *khả năng chạy lại* execution đó.

> ⚠️ **Ràng buộc positioning kèm theo** (§29): Repro **không** được định vị là *"Another monitoring platform"*. §20.14 xếp việc developer hiểu nhầm Repro là *"Another observability SDK"* thành **risk 🔴 Critical về sản phẩm**. Tức là: nhầm lẫn ở tầng phát biểu vấn đề sẽ trực tiếp giết adoption. Chi tiết ở [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 3.

---

## 3. Vì sao clone production không khả thi

§4 (*Key Product Insight*) xét thẳng cách tiếp cận ngây thơ:

```text
Production
    ↓
Copy production environment
    ↓
Run locally
```

và kết luận: *"This is not practical."*

### 3.1 Bảng đối chiếu production vs local (§4)

§4 đặt hai môi trường cạnh nhau. Trích đầy đủ, giữ nguyên danh sách:

| Production (§4) | Developer Local (§4) |
|---|---|
| Kubernetes | Docker |
| 20 API replicas | 1 API |
| PostgreSQL cluster | Local PostgreSQL |
| Redis | Local Redis |
| Kafka | Mock services |
| External APIs | — |
| Cloud infrastructure | — |
| Feature flags | — |
| Secrets | — |
| ⇒ **BUG** | ⇒ (không tái hiện) |

§4 kết luận: *"Trying to reproduce the entire environment creates enormous complexity."*

> **Đọc bảng này cho đúng**: khoảng cách không nằm ở "local yếu hơn". Nó nằm ở chỗ **9 thành phần bên production chỉ có 4 thành phần đối ứng bên local**, và 5 thành phần còn lại (Kafka, External APIs, cloud infra, feature flags, secrets) **không có bản sao local nào có ý nghĩa** — không phải vì developer lười dựng, mà vì bản sao của chúng sẽ không mang **cùng dữ liệu** và **cùng state** như production tại thời điểm bug xảy ra.

### 3.2 Microservices làm khoảng cách rộng thêm một bậc

§14 chỉ ra ứng dụng hiện đại thường gồm nhiều service:

```text
Checkout Service
       │
       ├── User Service
       ├── Pricing Service
       ├── Payment Service
       ├── Inventory Service
       └── Tax Service
```

§14 nói thẳng: *"Repro should not require developers to run the entire production architecture locally."*

Và §20.11 (*Replay Boundary* — 🟠 High) nêu chính thế lưỡng nan này:

> If everything is mocked, replay becomes deterministic but less realistic.
> If nothing is mocked, local setup becomes too complex.

⇒ Ngay cả khi một developer sẵn sàng bỏ công dựng lại môi trường, với kiến trúc microservices thì "dựng lại môi trường" đồng nghĩa với **chạy toàn bộ kiến trúc production trên laptop** — điều mà §40 nói thẳng là không phải mục tiêu của sản phẩm: *"Repro is not trying to make developers run production on their laptops."*

---

## 4. Chi phí hiện tại

> ⚠️ **CẢNH BÁO BẮT BUỘC ĐỌC TRƯỚC MỤC NÀY.**
>
> **`RQ.md` không chứa bất kỳ dữ liệu đo lường nào về chi phí của vấn đề này.** Repo **không có** user interview, không có survey, không có số liệu thị trường, không có log baseline. Mọi con số ở mục này là **hypothesis chưa validated**, **không** phải kết quả đo.
>
> Bất kỳ tài liệu nào trích lại mục này **phải giữ nguyên nhãn hypothesis**.

### 4.1 Phát biểu duy nhất của `RQ.md` về chi phí

§32 (*Supporting Metrics*), mục **Time to Reproduce**, là chỗ duy nhất trong toàn bộ 1995 dòng của `RQ.md` nói về chi phí thời gian:

```text
Before Repro
Hours / Days

vs.

With Repro
Minutes
```

### 4.2 Vì sao `Hours / Days` phải mang nhãn hypothesis

| Thuộc tính của một con số dùng được | Trạng thái của `Hours / Days` |
|---|---|
| Có nguồn dữ liệu | ❌ **Không có** — `RQ.md` không dẫn nguồn nào |
| Có baseline đo được | ❌ **Không có** — cần "thời gian reproduce trước khi có Repro", repo không có dữ liệu này |
| Có định nghĩa đo (mốc bắt đầu / kết thúc) | ❌ **Không có** — §32 không định nghĩa |
| Có population xác định (loại bug nào, tổ chức nào) | ❌ **Không có** |

⇒ `Hours / Days → Minutes` là một **outcome hypothesis**, không phải một phép đo và cũng không phải một target.

Kết luận này đã được chốt độc lập ở hai tài liệu cùng bộ:

- [PRD-Repro](../PRD-Repro.md) mục 8.3 xếp `SM-3 Time to Reproduce` vào cột **"Đo được ở V0.1? Không"**.
- [NFR-Repro](../NFR-Repro.md) mục 6 xếp nó thành `X-3` trong bảng *"Con số trong `RQ.md` KHÔNG phải NFR"*, với lý do *"không test được"*.

### 4.3 Chi phí gì thì `RQ.md` **có** căn cứ để nói

Không cần con số, `RQ.md` vẫn mô tả được **hình dạng** của chi phí, và phần này thì có nguồn:

| Dạng chi phí | Căn cứ | Loại |
|---|---|---|
| Developer phải **đoán state** thay vì biết state | §2.1 (`Guess the state`), §30 (`Guess state`) | `stated` |
| Vòng lặp có bước **lặp lại** — *"Ask for more information → Guess again"* | §2.1 | `stated` |
| Quy trình kết thúc **không có bằng chứng** — `Hope` | §2.1, §30 | `stated` |
| Chi phí cơ hội của việc dựng lại môi trường | §4 (*"enormous complexity"*) | `stated` |

> **Cách dùng đúng của mục 4**: dùng mục 4.3 để lập luận về vấn đề; dùng mục 4.1 **chỉ khi** kèm nhãn hypothesis. Việc định lượng chi phí thật thuộc về §38 Q1 — xem mục 7.

---

## 5. Insight nền tảng

### 5.1 Phát biểu gốc

§4 kết lại toàn bộ lập luận của mục 3 bằng một câu, và đây là insight sinh ra sản phẩm:

> **Capture the execution, not the environment.**

§33.1 (*Product Principles*, nguyên tắc số 1) phát biểu lại ở dạng nguyên tắc thiết kế:

> **Replay execution, not infrastructure** — *"Do not attempt to clone production."*

§1 phát biểu lại ở dạng nguyên tắc sản phẩm:

> **Repro does not reproduce the production environment. It reproduces the production execution.**

### 5.2 Product thesis (§40)

§40 (*Final Product Thesis*) diễn giải insight thành một chuyển đổi cụ thể — biến một production execution thành thứ **portable**:

```text
Production
─────────────
"This happened."
       │
       │ capture
       ▼
Repro Capsule
─────────────
"This is everything
needed to understand
the execution."
       │
       │ replay
       ▼
Local
─────────────
"Make it happen again."
       │
       ▼
Reproduce → Understand → Fix → Test
```

§40 chốt bằng lời hứa nền tảng:

> **When production breaks, developers should be able to replay what happened instead of guessing what happened.**

### 5.3 Vì sao insight này giải được đúng vấn đề đã nêu ở mục 1

Đối chiếu ngược lại 9 câu hỏi của §2.1:

| Câu hỏi §2.1 | Được giải bằng | Trong scope V0.1? |
|---|---|---|
| 1. Request nào? | Capture HTTP request (§18) | ✅ |
| 2. DB trả gì? | Capture database query/result (§18, §11) | ✅ |
| 3. External API trả gì? | Capture external HTTP response (§18, §12) | ✅ |
| 4. Feature flag nào? | Capture feature flag state (§18) | ✅ |
| 5. User state? | Suy ra từ (1)+(2) — `RQ.md` không có mục capture riêng | ⚠️ gián tiếp |
| 6. Version nào? | Capture Git commit + app version (§18, §15) | ✅ |
| 7. System time? | Capture clock/timestamp (§18) | ✅ |
| 8. Dependent service? | Recorded response tại replay boundary (§14) — multi-service replay ở V0.3 (§26) | ⚠️ một phần |
| 9. Ordering / timing? | **Không** — §20.13 xếp race condition **out of scope** | ❌ |

⇒ Insight nền tảng giải được **7 trong 9** câu hỏi ở mức trực tiếp. Hai câu còn lại (8 và 9) chính là ranh giới của mục 6 dưới đây.

---

## 6. Phạm vi vấn đề KHÔNG bao gồm

> **Mục này tồn tại có chủ ý.** Một problem statement chỉ khuếch đại vấn đề mà không nêu giới hạn của chính nó sẽ tạo ra kỳ vọng sai, và §20.1 nói thẳng: *"Do not promise to reproduce every possible production bug."*

### 6.1 Hidden input — 9 nhóm mà việc capture execution **không** phủ được (§20.1)

§20.1 (*Insufficient Execution Capture* — 🔴 **Critical**, risk số một của tài liệu) mở đầu bằng: *"An application execution can depend on more than HTTP, database and API responses."* và liệt kê **9 nhóm hidden input**:

| # | Hidden input (§20.1) | V0.1 có cơ chế xử lý? |
|---:|---|---|
| 1 | Environment variables | ❌ Không có FR nào phủ |
| 2 | Filesystem state | ❌ Không có FR nào phủ |
| 3 | Randomness | ⚠️ §20.2 chỉ hứa *"UUID capture where practical"* — xem `ACG-06` |
| 4 | System clock | ✅ Có (`FR-008`, `FR-031`) |
| 5 | Process state | ❌ Không có FR nào phủ |
| 6 | Concurrency | ❌ §20.13 — out of scope |
| 7 | Network behavior | ❌ Không có FR nào phủ |
| 8 | OS behavior | ❌ Không có FR nào phủ |
| 9 | Background jobs | ❌ §26 đặt ở V0.3 |

§20.1 nói hệ quả: *"If these are not captured, replay may fail."*

> ⚠️ **Điểm hở phải khai, không được lấp**: mitigation của §20.1 là *"Limit the MVP to a clearly defined class of deterministic request/response executions"* — nhưng **class đó không tồn tại ở bất kỳ đâu trong `RQ.md`**. Đây là `ACG-07` ở [NFR-Repro](../NFR-Repro.md) mục 7. Hệ quả: **risk 🔴 Critical số một hiện chưa có mitigation thực thi được**, và phạm vi vấn đề mà Repro nhận giải **chưa có ranh giới chính thức**. Tài liệu này **không** tự chế một định nghĩa thay thế.

### 6.2 Race condition — Critical **nhưng out of scope**

§20.13 có tiêu đề tường minh: *"Race Conditions — **Critical but Out of Scope**"*.

- **Nội dung**: *"Some bugs depend on precise concurrency and event ordering. A simple request replay will not reproduce them reliably."*
- **Mitigation**: *"Defer advanced concurrency replay."*
- §21 Risk Matrix xác nhận: dòng *Race conditions*, Severity 🔴 Critical, **`MVP? = No`**, Mitigation = *"Future"*.
- §19 liệt kê *"Distributed race-condition replay"* trong Non-Goals của V0.1.

⇒ **Câu hỏi số 9 của §2.1** (*"Was the bug caused by a specific ordering or timing?"*) — một trong chính 9 câu hỏi định nghĩa vấn đề ở mục 1 — **nằm ngoài phạm vi V0.1**. Đây là một giới hạn phải nói thẳng ngay ở problem statement, không được để lộ ra ở giai đoạn sau.

### 6.3 Replay thành công **không** chứng minh bug production đã hết

§20.16 (*False Confidence About Fixes* — 🔴 **Critical**) giới hạn chính kết quả mà sản phẩm tạo ra:

> A successful replay only proves that:
> **This captured execution no longer fails.**
>
> It does not necessarily prove that every production manifestation of the bug has been eliminated.
>
> For example, a race condition may still exist.

Mitigation của §20.16 là **ràng buộc ngôn từ**, và nó bắt buộc:

| Bắt buộc dùng (§20.16) | Cấm dùng (§20.16) |
|---|---|
| `✓ Captured execution no longer reproduces` | `✓ Production bug is definitely fixed` |

Ràng buộc này đã được đưa vào `FR-046` ([PRD-Repro](../PRD-Repro.md) mục 5.4) và `N-17` ([NFR-Repro](../NFR-Repro.md) mục 4). Luồng chịu ràng buộc trực tiếp: [UC-04 — Verify Fix](../Use-Cases/UC-04-Verify-Fix.md).

### 6.4 Tổng kết ranh giới

Repro **nhận giải** khoảng cách giữa *"biết chuyện gì đã xảy ra"* và *"chạy lại được chuyện đã xảy ra"*, cho **một lớp execution request/response deterministic** (§20.1 — lớp này `TBD`, xem 6.1).

Repro **không nhận giải**:

- bug phụ thuộc concurrency / event ordering (§20.13, §19);
- bug phụ thuộc hidden input ngoài clock (§20.1 — 8/9 nhóm còn lại);
- việc chứng minh **toàn bộ** biểu hiện production của một bug đã bị loại bỏ (§20.16);
- và **không** thay thế observability (§3, §34) hay clone môi trường (§19 Non-Goal, §33.1).

---

## 7. Open Questions

Bốn câu hỏi dưới đây thuộc §38 (*Questions for PM Review*), trích **nguyên văn**. Đây là **validation question chưa có đáp án** — `RQ.md` đặt chúng ra và không trả lời ở bất kỳ section nào khác.

> ⚠️ Cả bốn đều nhắm thẳng vào **tính hợp lệ của chính problem statement này**. Chừng nào chưa được validate với người dùng thật, tài liệu này mô tả một vấn đề **được giả định**, không phải một vấn đề **đã được chứng minh**.

| §38 | Câu hỏi (nguyên văn) | Nó chất vấn điều gì trong tài liệu này |
|---|---|---|
| **Q1** | *Is production → local reproduction a sufficiently painful problem to justify a dedicated tool?* | Chất vấn **mục 1 và mục 4** — vấn đề có đủ đau để cần một công cụ riêng không. Không có user research thì không trả lời được |
| **Q2** | *Is "Execution Replay" a compelling enough value proposition for developers?* | Chất vấn **mục 5** — insight nền tảng có thuyết phục với người dùng thật không |
| **Q3** | *Is Execution Diff valuable enough to be a core feature?* | Chất vấn giá trị của nhánh *"không reproduce được nhưng chỉ ra khác biệt"* (§9). §9 tự khẳng định *"This is a key product capability"* — nhưng đó là **giả định của tác giả**, chưa validate |
| **Q7** | *What percentage of real-world production bugs can realistically be replayed?* | Chất vấn **mục 6** — kích thước thật của phần vấn đề mà Repro giải được. Bị chặn bởi technical spike §22 và bởi `ACG-07` (chưa có "Supported Execution Class" thì không có mẫu số). **Trạng thái đổi sau `✅ CHỐT GATE-01 — 2026-08-14`**: xem ghi chú dưới bảng |

> ✅ **`CHỐT GATE-01 — 2026-08-14` — Q7: lý do chưa trả lời được ĐÃ ĐỔI, nhưng Q7 VẪN CHƯA ĐƯỢC TRẢ LỜI.**
>
> | | Trước 2026-08-14 | Sau `GATE-01` |
> |---|---|---|
> | Vì sao Q7 chưa có đáp án | **Chưa có quyết định chạy spike** — không ai biết bao giờ mới có dữ liệu | **Đang chờ kết quả spike** — Phase 0 technical spike đã được bật (`Go`), `Sponsor`/`Manager` = **`@TrisJr`** |
> | Trạng thái Q7 | ❌ Chưa trả lời | ❌ **Vẫn chưa trả lời** |
>
> ⚠️ **`GATE-01-r` áp trực tiếp vào Q7**: `Go` **không tự làm cho spike trả lời được Q7**. Q7 là một tỷ lệ, và một tỷ lệ cần **mẫu số** — thứ `ACG-07` (*"Supported Execution Class"*) vẫn chưa cấp, cùng với `ACG-02` (tiêu chí *meaningful*) và `ACG-03` (định nghĩa *reproduced*). Cả ba **vẫn hở**. ⇒ Spike có thể chạy xong mà Q7 vẫn không có con số kiểm chứng được. Xem [NFR-Repro](../NFR-Repro.md) mục 7 và [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.

**Điều kiện để đóng bốn câu hỏi này**:

- Q1, Q2, Q3 — cần **user research với người dùng thật**; repo hiện không có bất kỳ dữ liệu nào loại này (xem [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 1).
- Q7 — cần kết quả **technical spike §22** (10 scenario) và một định nghĩa "Supported Execution Class" (`ACG-07`). **Spike đã được bật** (`✅ CHỐT GATE-01 — 2026-08-14`) ⇒ điều kiện thứ nhất **đang được thực hiện**; điều kiện thứ hai (`ACG-07`) **vẫn chưa có**, owner **`@TrisJr`**.

Trạng thái đầy đủ của các câu hỏi §38 khác: [PRD-Repro](../PRD-Repro.md) mục 10.

---

## 8. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | **Tài liệu cha** — mục 2.1 của PRD tóm tắt chính tài liệu này; `FR-001`…`FR-082`; M1, M2 |
| [NFR-Repro](../NFR-Repro.md) | `ACG-01`…`ACG-12` (đặc biệt `ACG-07`), `N-01`…`N-19`, và mục 6 (`X-3` — `Hours/Days` không phải NFR) |
| [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) | Ai gặp vấn đề này — và mức độ bằng chứng của khẳng định đó |
| [UC-01 — Capture Failed Production Execution](../Use-Cases/UC-01-Capture-Failed-Production-Execution.md) | Luồng capture — giải câu hỏi 1–7 của §2.1 |
| [UC-02 — Replay Capsule Locally](../Use-Cases/UC-02-Replay-Capsule-Locally.md) | Luồng replay — thay `Guess the state` bằng recorded input |
| [UC-03 — Read Execution Diff](../Use-Cases/UC-03-Read-Execution-Diff.md) | Luồng đọc diff — giá trị khi **không** reproduce được (§9, §38 Q3) |
| [UC-04 — Verify Fix](../Use-Cases/UC-04-Verify-Fix.md) | Luồng verify — thay bước `Hope` (§2.1, §30) bằng bằng chứng, trong giới hạn §20.16 |
| [UC-05 — Browse And Inspect Capsules](../Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) | Luồng duyệt / xem nội dung capsule |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật |
| [Charter-Repro](../../010-Planning/Charter-Repro.md) | Bối cảnh dự án |
| [Risk-Register](../../010-Planning/Risk-Register.md) | 18 risk của §21, gồm §20.1, §20.13, §20.16 nêu ở mục 6 |
| [Roadmap](../../010-Planning/Roadmap.md) | Phasing — vì sao câu hỏi 8 và 9 của §2.1 không thuộc V0.1 |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — mọi `§N` trong tài liệu này trỏ về đây |
