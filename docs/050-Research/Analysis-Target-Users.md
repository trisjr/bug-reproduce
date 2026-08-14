---
id: ANALYSIS-001
type: research
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🔬 Analysis — Target Users (Repro)

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N` hoặc số dòng. Chỗ không có căn cứ ⇒ gắn nhãn `inferred` hoặc ghi `TBD`.

---

## 1. Mức độ bằng chứng — đọc trước

> ### ⚠️ TÀI LIỆU NÀY KHÔNG PHẢI KẾT QUẢ NGHIÊN CỨU NGƯỜI DÙNG.
>
> Nó là một **tập hypothesis persona chưa validated**, dựng từ suy luận trên một tài liệu ý tưởng sản phẩm. Đọc nó như dữ liệu đã kiểm chứng là một lỗi nghiêm trọng về phương pháp.

### 1.1 Toàn bộ bằng chứng hiện có

**`RQ.md` KHÔNG có section "Target users".** Ba nhóm người dùng xuất hiện đúng **một lần**, ở **dòng 7 — frontmatter** của tài liệu:

```text
**Target users:** Software Engineers, QA Engineers, SRE / DevOps
```

Đó là **toàn bộ** căn cứ trực tiếp. Không có mô tả, không có phân cấp, không có ngữ cảnh, không có lý do chọn ba nhóm này.

### 1.2 Kiểm chứng bằng grep — PM đã xác minh

| Từ khoá | Số lần xuất hiện trong 1995 dòng `RQ.md` | Ghi chú |
|---|---:|---|
| `"QA"` | **1** | Chính là dòng 7 |
| `"SRE"` | **1** | Chính là dòng 7 |
| `"developer"` | **34** | Rải khắp §8, §9, §14, §15, §20.14, §22, §25, §30, §33, §38 |

⇒ Hai trong ba persona **không hề được nhắc lại** sau frontmatter. Persona thứ ba (developer) có bằng chứng dày, nhưng là bằng chứng về **hành vi được giả định**, không phải về **người dùng đã quan sát**.

### 1.3 Repo không có dữ liệu nghiên cứu

| Loại dữ liệu | Có trong repo? |
|---|---|
| User interview | ❌ Không |
| Survey | ❌ Không |
| Số liệu thị trường / phân tích cạnh tranh định lượng | ❌ Không |
| Telemetry / log hành vi | ❌ Không |
| Baseline "thời gian reproduce hiện tại" | ❌ Không — xem [BRD-001-Problem-Statement](../020-Requirements/BRD/BRD-001-Problem-Statement.md) mục 4 |

### 1.4 Quy ước nhãn dùng trong tài liệu này

| Nhãn | Nghĩa |
|---|---|
| `stated` | `RQ.md` **nói thẳng** điều này, trích được `§N` |
| `inferred` | **Suy luận** từ nội dung `RQ.md` — hợp lý nhưng **chưa được xác nhận** |

**Mọi dòng thuộc tính ở mục 3, 4, 5 đều mang một trong hai nhãn này.** Dòng không có nhãn là lỗi biên tập, không phải sự thật đã chốt.

### 1.5 Điều kiện nâng cấp — khi nào tài liệu này thôi là hypothesis

Ba câu hỏi của `RQ.md` §38 phải được validate với **người dùng thật**:

| §38 | Câu hỏi (nguyên văn) | Nó validate điều gì trong tài liệu này |
|---|---|---|
| **Q1** | *Is production → local reproduction a sufficiently painful problem to justify a dedicated tool?* | Toàn bộ mục *pain hiện tại* của cả ba persona |
| **Q2** | *Is "Execution Replay" a compelling enough value proposition for developers?* | Mục *tiêu chí thành công* của Persona A |
| **Q13** | *What is the minimum integration effort that developers will accept?* | Mục *anti-pattern* và toàn bộ Persona B (capture-side) |

Chừng nào Q1, Q2, Q13 chưa có đáp án từ người dùng thật, tài liệu này giữ nguyên `status: draft` và **không** được dùng làm căn cứ cho quyết định ưu tiên tính năng.

---

## 2. Phân cấp persona

**Quyết định E10 — ba nhóm ở dòng 7 KHÔNG ngang hàng.**

| Persona | Vai | Trạng thái ở V0.1 | Căn cứ phân cấp |
|---|---|---|---|
| **A — Software Engineer** | **Primary** | ✅ Hoạt động đầy đủ | Bằng chứng dày nhất: `"developer"` 34 lần; §8, §9, §10, §14, §15, §25, §30 đều viết cho vai này; §33.2 *"Developer-first"* là nguyên tắc sản phẩm số 2 |
| **B — SRE / DevOps** | **Secondary — capture-side owner** | ✅ Cần thiết để V0.1 chạy được ở production | `inferred` toàn bộ, nhưng neo vững vào §16, §20.5, §20.6, §20.7, §20.17, §28 — toàn bộ mối quan tâm capture-side / compliance chỉ hợp lý khi gán cho một vai vận hành |
| **C — QA Engineer** | **Activated at V0.2** — ✅ **xác định (M1 chốt 2026-08-14)** | ⚠️ **Chưa có giá trị ở V0.1** | Persona mỏng nhất; toàn bộ nội dung neo vào **regression test generation**, thứ §26 đặt ở **V0.2** — và M1 đã chốt **giữ nguyên §26** |

### 2.1 Vì sao Persona C chỉ "activated at V0.2"

Đây là kết luận có lập luận, không phải xếp hạng cảm tính:

1. Mọi giá trị mà `RQ.md` gán cho QA đều đi qua **regression test** — §30 journey kết ở `Regression test`, §31 North Star đếm *"converted into regression tests"*, §34 workflow kết ở `Regression Test → CI`, §37 chuỗi outcome kết ở `Regression Test`.
2. §26 đặt **Regression test generation** ở **V0.2 — Developer Workflow**.
3. §18 liệt kê 6 CLI verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) — **không verb nào** sinh ra artifact cho quy trình QA.

⇒ Ở V0.1, QA Engineer **có thể đọc capsule** ([UC-05](../020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md)) nhưng **không có luồng công việc nào** biến việc đọc đó thành output của họ.

> ✅ **M1 ĐÃ CHỐT 2026-08-14 — kết luận này nay là dứt khoát.** Mâu thuẫn trong nguồn vẫn còn nguyên và phải ghi lại: §26 đặt regression generation ở **V0.2**, trong khi §25, §30, §31, §37 đều giả định nó **đã có**. Quyết định của anh chọn **phía §26** — regression test generation **giữ ở V0.2**, không kéo về V0.1.
>
> ⇒ **Persona C xác định là "activated at V0.2"**, không còn là giả thiết treo theo M1, và phân cấp ở bảng trên **không phải viết lại**. Nhánh *"nếu đẩy lên V0.1 thì Persona C kích hoạt ngay"* **đã bị loại bỏ**.
>
> Hệ quả kèm theo: North Star §31 là metric **dài hạn kích hoạt từ V0.2**; metric chính thức của V0.1 là **số bug đạt trạng thái `Execution matched`** (§10). Xem [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 8.2 và 10.4.

---

## 3. Persona A — Software Engineer

**Vai**: Primary. Người pull capsule, replay, đọc diff, fix, verify.

| Thuộc tính | Nội dung | Nguồn § | Nhãn |
|---|---|---|---|
| **Jobs-to-be-done #1** | Trả lời được *"Can I make the same execution happen again?"* — chạy lại đúng execution đã lỗi ở production, trên code local | §3 | `stated` |
| **Jobs-to-be-done #2** | Hiểu vì sao production khác local, khi không reproduce được — *"Show me what was different between production and my environment."* | §9 | `stated` |
| **Jobs-to-be-done #3** | Xác nhận bản fix có tác dụng trên đúng execution đã gây lỗi, trước khi deploy | §8 Step 5, §20.16 | `stated` |
| **Jobs-to-be-done #4** | Làm được cả ba việc trên **mà không cần dựng lại production environment** | §4, §14, §40 | `stated` |
| **Pain #1 — thiếu thông tin để reproduce** | Incident cho biết *what happened* nhưng không đủ để reproduce; còn **9 câu hỏi** phải tự trả lời (request nào, DB trả gì, external API trả gì, flag nào bật, user state, version nào, system time, dependent service, ordering/timing) | §2.1 | `stated` |
| **Pain #2 — phải đoán** | Vòng lặp debug chứa bước `Guess the state` và `Guess again` | §2.1, §30 | `stated` |
| **Pain #3 — không có bằng chứng khi kết thúc** | Vòng lặp kết thúc bằng `Deploy → Hope` | §2.1, §30 | `stated` |
| **Pain #4 — observability không lấp được** | Có logs/traces/metrics/stack traces rồi vẫn không reproduce được | §3 | `stated` |
| **Pain #5 — local khác production về bản chất** | K8s + 20 replica + PostgreSQL cluster + Redis + Kafka + external API + cloud infra + flags + secrets, so với Docker + 1 API + local PostgreSQL + local Redis + mock service | §4 | `stated` |
| **Pain #6 — microservices** | Không muốn (và không thể) chạy toàn bộ kiến trúc production trên máy local | §14, §20.11, §40 | `stated` |
| **Trigger** | Một production incident được báo về (vd. qua Sentry/APM), kèm thông báo có capsule: `BUG-1842 — Checkout failed. Repro Capsule available.` | §8 Step 1, §34 | `stated` |
| **Tiêu chí thành công #1** | Nhìn thấy `💥 BUG REPRODUCED` — có một execution xác định để debug | §8, §25 | `stated` |
| **Tiêu chí thành công #2** | Nếu không reproduce được, **vẫn nhận được giá trị**: danh sách divergence đã đánh số, nhóm theo loại input, theo cặp Production / Local | §9 | `stated` |
| **Tiêu chí thành công #3** | Hệ thống **không** báo thành công giả — phân biệt được *"Replay completed"* với *"Execution matched"* | §10, §20.3 | `stated` |
| **Tiêu chí thành công #4** | Replay **không bao giờ** kích hoạt side effect thật (charge card, email, shipment, webhook, delete, publish event) | §13, §20.4, §33.6 | `stated` |
| **Tiêu chí thành công #5** | Hệ thống giải thích **chính xác** cái gì đã capture và cái gì đã replay — không có hành vi ngầm | §33.5 | `stated` |
| **Giao diện chính** | **CLI** — §33.2 *"Developer-first: The primary interface should be a simple CLI"*. Không cần dashboard | §33.2, §25, §19 | `stated` |
| **CLI dùng** | `repro list` · `repro pull 1842` · `repro inspect 1842` · `repro replay 1842` · `repro diff 1842` · `repro verify 1842` — **cả 6 verb của §18** | §18, §8 | `stated` |
| **Ngưỡng kiên nhẫn khi cài đặt** | `npm install @repro/node` + `repro.init()`, rồi capture được execution replay-được đầu tiên với cấu hình tối thiểu | §20.14 | `stated` |
| **Stack** | Node.js + PostgreSQL + HTTP (target V0.1) | §18, §22, §26 | `stated` |
| **Bối cảnh làm việc** | Có ứng dụng chạy production đã có observability (Sentry/APM), và có môi trường local chạy được app đó | §34, §4 | `inferred` |
| **Quan hệ với capsule** | Là **người tiêu thụ**, không phải người tạo — capsule do recorder tự tạo và tự upload (**E8**) | §8, §17, §18 | `inferred` |

### 3.1 Anti-pattern cần tránh với Persona A

§20.14 (*Developer Adoption* — 🔴 **Critical Product Risk**) ghi **nguyên văn** hai câu mà developer có thể nói về Repro:

| Anti-pattern (§20.14) | Vì sao chết người | Nhãn |
|---|---|---|
| *"Another observability SDK."* | Repro **không** trả lời cùng câu hỏi với observability (§3), và §29 nói thẳng Repro không được định vị là *"Another monitoring platform"*. Nếu developer xếp Repro vào ô đã có sẵn công cụ, họ **không đánh giá tiếp** | `stated` |
| *"This looks complicated to install."* | §20.14: *"If integration requires significant infrastructure, adoption will suffer."* | `stated` |

**Mitigation §20.14** — trải nghiệm đầu tiên phải cực đơn giản:

```bash
npm install @repro/node
```

```javascript
repro.init()
```

⇒ Ràng buộc trực tiếp lên `FR-001` và `FR-002` ([PRD-Repro](../020-Requirements/PRD-Repro.md) mục 5.1) và lên `N-15` ([NFR-Repro](../020-Requirements/NFR-Repro.md) mục 4).

> ⚠️ **Căng thẳng chưa được giải, `RQ.md` không nêu**: mitigation của §20.14 hứa cài đặt cực nhẹ, nhưng §8/§18/§28 lại **hàm ý tồn tại một Capsule Store ở xa có API và có auth** (`repro list`, `repro pull`), và §20.15 chính nó liệt kê *"Artifact storage"* như một biểu hiện của **scope explosion**. ⇒ Lời hứa *"chỉ `npm install`"* và yêu cầu *"phải có private storage self-hosted"* (`FR-054`, `FR-055`) **không tự động tương thích**. Ghi nhận ở [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 10.5 (`U-06`). **Không tự quyết.**

---

## 4. Persona B — SRE / DevOps

**Vai**: Secondary — **capture-side owner**. Người đưa Repro vào production và chịu trách nhiệm về hậu quả của việc đó.

> ⚠️ **Toàn bộ persona này là `inferred`.** `RQ.md` nhắc `"SRE"` **đúng 1 lần**, ở dòng 7 frontmatter, và **không mô tả gì**. Việc gán các mối quan tâm dưới đây cho vai này là suy luận từ bản chất công việc, không phải trích dẫn.

| Thuộc tính | Nội dung | Nguồn § | Nhãn |
|---|---|---|---|
| **Jobs-to-be-done #1** | Đưa recorder vào production **mà không làm production chậm đi hoặc lỗi** | §20.7 | `inferred` (ràng buộc gốc là `stated`) |
| **Jobs-to-be-done #2** | Bảo đảm dữ liệu production nhạy cảm không rò rỉ qua capsule | §16, §20.5 | `inferred` (ràng buộc gốc là `stated`) |
| **Jobs-to-be-done #3** | Giữ toàn bộ Repro trong hạ tầng của tổ chức (self-hosting) | §16, §20.6, §28 | `inferred` (ràng buộc gốc là `stated`) |
| **Jobs-to-be-done #4** | Đáp ứng yêu cầu compliance của tổ chức | §20.17 | `inferred` (ràng buộc gốc là `stated`) |
| **Pain #1 — overhead** | Instrumentation có thể tăng **latency, CPU usage, memory usage, network traffic** | §20.7 | `inferred` (gán vai) — nội dung risk là `stated` |
| **Pain #2 — dữ liệu nhạy cảm** | Captured data có thể chứa **PII, credentials, tokens, financial information, internal data** | §20.5 | `inferred` (gán vai) — nội dung risk là `stated` |
| **Pain #3 — attack surface mới** | *"A compromised Repro storage or collector could expose production information"* | §20.6 | `inferred` (gán vai) — nội dung risk là `stated` |
| **Pain #4 — compliance** | Dữ liệu capture có thể liên quan **GDPR, HIPAA, PCI DSS, SOC 2, internal security policies** | §20.17 | `inferred` (gán vai) — nội dung risk là `stated` |
| **Trigger** | Một team engineering yêu cầu bật Repro cho service của họ | — | `inferred` — **không có nguồn** |
| **Tiêu chí thành công #1** | `N-10` được giữ: *"Repro must never become the reason production becomes slower or fails"* | §20.7 | `stated` |
| **Tiêu chí thành công #2** | Topology mặc định là `Production → Private Recorder → Encrypted Capsule → Private Storage`, **không** gửi dữ liệu production lên public SaaS | §20.6, §28 | `stated` |
| **Tiêu chí thành công #3** | Redaction, anonymization, encryption, retention, access control, audit log đều hoạt động | §16, §20.5, §20.17 | `stated` |
| **Control cần có** | Cấu hình redaction (header + field), sampling, capture limits, selective capture, bounded buffer, async capture | §16, §20.7, §20.12 | `stated` |
| **Giao diện chính** | ⚠️ **Không có** — xem `GAP-04` | §18 | `inferred` |
| **CLI dùng** | ⚠️ **Không verb nào của §18 thuộc về vai này** — xem `GAP-04` | §18 | `stated` (danh sách 6 verb là `stated`) |

### 4.1 `GAP-04` — SRE có yêu cầu nhưng **không có lệnh nào để thực hiện**

**Phát biểu**:

> Persona B có yêu cầu tường minh về **retention** (§20.5, §20.17) và **audit log** (§20.17), nhưng `RQ.md` **không cung cấp lệnh CLI nào** để thực hiện hay kiểm tra chúng.

**Bằng chứng** — §18 liệt kê đúng **6 verb**, và **cả 6 đều developer-side**:

| Verb §18 | Phục vụ ai | Việc gì |
|---|---|---|
| `repro list` | Developer | Duyệt capsule |
| `repro pull` | Developer | Tải capsule về local |
| `repro inspect` | Developer | Xem nội dung capsule |
| `repro replay` | Developer | Chạy lại execution |
| `repro diff` | Developer | Đọc divergence |
| `repro verify` | Developer | Xác nhận fix |

**Không có** verb nào cho: cấu hình / kiểm tra retention policy, xoá capsule theo yêu cầu compliance, đọc audit log, quản lý quyền truy cập, kiểm tra overhead của recorder, hay xác thực cấu hình redaction trước khi deploy.

> **Danh sách thiếu ở trên VẪN ĐÚNG NGUYÊN VĂN sau các quyết định ngày 2026-08-14.** `✅ CHỐT GATE-04 — 2026-08-14` chốt **sàn của Capsule Store**, `✅ CHỐT GATE-05a — 2026-08-14` chốt **TTL mặc định 30 ngày**, `✅ CHỐT GATE-05b — 2026-08-14` chốt **crypto-shredding `MUST-V0.1`** — cả ba đều cấp **nội dung** cho những thứ persona này phải vận hành, **không** cấp **verb** nào để vận hành chúng. Nghịch lý còn nặng thêm: nay vai này có **thêm** một thao tác phải thực hiện được — **phá khoá** của một capsule để thực thi retention — mà cũng **không có verb nào**.
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

**Vì sao đây là gap thật, không phải chuyện thiếu tiện ích**:

- §20.17 yêu cầu *"data retention policies"*, *"deletion"* và *"audit logs"* như **mitigation cho risk 🟠 High**; §21 đánh dòng *Compliance* là `MVP? = Yes`. Một mitigation **không có giao diện để vận hành** thì không phải mitigation.
  - **Cập nhật sau ✅ CHỐT GATE-05a — 2026-08-14 và ✅ CHỐT GATE-05b — 2026-08-14**: hai trong ba mitigation này nay có **nội dung cụ thể** — *retention policy* có **giá trị mặc định 30 ngày** (`FR-024`, [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 5.2), và *deletion* có **cơ chế thực thi tới cả bản đã pull** là crypto-shredding (`SEC-016` = `MUST-V0.1`). ⇒ Lập luận *"không phải mitigation"* **thu hẹp lại**: vấn đề không còn là *"không biết phải làm gì"* mà là *"biết phải làm gì nhưng không có lệnh để làm"*. Câu kết ở trên **vẫn đúng**.
- §16 nói *"Organizations should be able to run Repro entirely inside their own infrastructure"* — self-hosting nghĩa là **chính tổ chức** phải vận hành nó, tức phải có công cụ vận hành.
- `FR-024`, `FR-025`, `FR-026` ([PRD-Repro](../020-Requirements/PRD-Repro.md) mục 5.2) là **MVP requirement** nhưng **không FR CLI nào** (`FR-047`…`FR-053`) phục vụ chúng.

**Liên đới `M2` — ✅ ĐÃ CHỐT 2026-08-14, và quyết định này làm `GAP-04` NẶNG THÊM chứ không nhẹ đi**:

Trước đây `GAP-04` còn mơ hồ ở một điểm: access control / audit **có thể** bị đẩy sang commercial layer theo §28, và khi đó gap này *"không được lấp ở bản OSS"* — tức nó là một rủi ro có điều kiện. Anh đã chốt **ngược lại**: **authentication + authorization + audit log thuộc OSS core**, ghi đè phần §28 xếp *Access control* và *Retention policies* vào commercial layer.

⇒ Cách phát biểu đúng của gap này **đổi**:

| Trước quyết định | Sau quyết định (2026-08-14) |
|---|---|
| *"Nếu bị đẩy sang commercial thì `GAP-04` không được lấp ở bản OSS"* — rủi ro **có điều kiện** | *"Authz và audit **chắc chắn phải có** trong OSS core, **nhưng chưa có giao diện vận hành**"* — **nợ tường minh** |

Cả 6 verb §18 (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side, **không verb nào** cấu hình quyền, đọc audit log, hay vận hành retention. Nay ba capability đó là **yêu cầu MVP chắc chắn** (`FR-024`, `FR-025`, `FR-026`), khoảng trống giao diện vận hành **không còn là giả định** — nó là **nợ đã biết, phải trả trước khi V0.1 dùng được ở tổ chức thật**. Xem [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 10.4 và [UC-05](../020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) `A1`.

**Trạng thái**: **`TBD` (đã thu hẹp)** — cần bổ sung verb vận hành cho authz / audit / retention. Nhánh thoát *"chốt tường minh rằng V0.1 không phục vụ vai này"* **đã hẹp lại đáng kể** sau M2: capability thì bắt buộc có, nên nếu CLI không phục vụ thì phải chỉ ra **giao diện nào** phục vụ. **Không tự quyết.**

> **Vì sao là `TBD (đã thu hẹp)` chứ không phải `đã đóng`** — `✅ CHỐT GATE-04 — 2026-08-14`:
>
> | Trục của `GAP-04` | Trạng thái sau 2026-08-14 |
> |---|---|
> | **Cái gì phải có** (nơi để cắm authz / audit / retention) | ✅ **ĐÃ CHỐT** — sàn Capsule Store = **object/file storage + một index + hook authn/authz/audit**, 3 thao tác tối thiểu theo `SDD §5.4` (`GATE-04`) |
> | **Retention làm với giá trị nào** | ✅ **ĐÃ CHỐT** — TTL mặc định **30 ngày**, cấu hình được (`GATE-05a`, `SEC-022`) |
> | **Deletion chạm được tới bản đã pull không** | ✅ **ĐÃ CHỐT** — có, qua crypto-shredding `MUST-V0.1` (`GATE-05b`, `SEC-016`) |
> | **Cơ chế authn/authz cụ thể** | ❌ **`TBD`** — owner **`@TrisJr`**; điều kiện đóng: quyết định thiết kế tại [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) §5.4 |
> | **Verb vận hành cho authz / audit / retention** | ❌ **`TBD` — chính là `GAP-04`, CHƯA ĐÓNG**; owner **`@TrisJr`**; điều kiện đóng: bổ sung verb vận hành, hoặc chỉ ra giao diện khác phục vụ vai này |
> | **Key custody** (ai giữ và ai được phá khoá) | ❌ **`TBD`, nay là blocker** — `U-06d`, `GATE-05b-r2` |
>
> ⇒ **`GAP-04` KHÔNG ĐÓNG.** Bản chất của gap này là **giao diện vận hành**, và không quyết định nào ngày 2026-08-14 cấp một verb nào. Cái đổi là gap **hẹp hơn và cụ thể hơn**: trước đây thiếu cả *nội dung* lẫn *giao diện*; nay chỉ còn thiếu **giao diện** — và vì nội dung đã chốt, phần thiếu này trở thành **nợ đến hạn**, không còn là nợ hoãn được.
>
> Rủi ro **`GATE-04-r`** (*"sàn đóng nhưng không vận hành được"*) tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2, cập nhật lên `C-02-r` thay vì tạo mục trùng. Neo Requirements: [PRD-Repro](../020-Requirements/PRD-Repro.md) mục 10.5 (`U-06`) và mục 10.4.

---

## 5. Persona C — QA Engineer

> ### ⚠️ ĐÂY LÀ PERSONA MỎNG NHẤT CỦA CẢ TÀI LIỆU.
>
> `RQ.md` nhắc `"QA"` **đúng 1 lần**, ở dòng 7 frontmatter. **Không có** một câu nào khác trong 1995 dòng mô tả vai này, nhu cầu của họ, hay cách họ dùng sản phẩm.
>
> **Gần như toàn bộ nội dung dưới đây là `inferred`.** Và theo **E10**, persona này **chưa có giá trị ở V0.1**.

| Thuộc tính | Nội dung | Nguồn § | Nhãn |
|---|---|---|---|
| **Jobs-to-be-done #1** | Biến một production bug thành **regression test** để nó không tái diễn | §26 (V0.2), §30, §31, §34, §37 | `inferred` |
| **Jobs-to-be-done #2** | Hiểu **điều kiện tái hiện** chính xác của một bug (input nào dẫn tới failure) | §6, §9 | `inferred` |
| **Jobs-to-be-done #3** | Đưa regression case vào CI | §34 (`Regression Test → CI`) | `inferred` |
| **Pain hiện tại** | ⚠️ **Không có nguồn.** `RQ.md` không mô tả pain nào của vai QA | — | `inferred` — **không có căn cứ** |
| **Trigger** | ⚠️ **Không có nguồn** | — | `inferred` — **không có căn cứ** |
| **Tiêu chí thành công** | Một regression case được sinh ra từ capsule và chạy được ở CI | §25 (`✓ Regression case generated`), §26, §34 | `inferred` |
| **CLI dùng ở V0.1** | `repro list`, `repro inspect` — đọc capsule để hiểu điều kiện tái hiện ([UC-05](../020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md)) | §18 | `inferred` |
| **CLI dùng ở V0.2 (giả định)** | ⚠️ **Chưa tồn tại** — §18 không có verb nào sinh regression test | §18, §26 | `stated` (sự thiếu vắng là `stated`) |
| **Trạng thái ở V0.1** | ⚠️ **Chưa có giá trị — xác định, không còn treo**: mọi jobs-to-be-done đều phụ thuộc regression test generation (`FR-056`), thứ §26 đặt ở **V0.2**, và **M1 chốt 2026-08-14 giữ nguyên §26** | §26 | `stated` |

### 5.1 Ba điều phải nói thẳng về Persona C

**1. Persona này có thể không tồn tại.**
Việc `RQ.md` liệt kê QA Engineer ở frontmatter rồi **không nhắc lại một lần nào** trong 1995 dòng có ít nhất hai cách giải thích khả dĩ: (a) tác giả thật sự nhắm tới vai này nhưng chưa viết ra; (b) đây là một dòng frontmatter viết theo quán tính. **Không có dữ liệu nào phân biệt hai khả năng.** ⇒ Không nên đầu tư thiết kế cho vai này trước khi Q1/Q2 (§38) được validate.

**2. Nó bị đẩy sang V0.2 — ✅ M1 đã chốt 2026-08-14.**
Toàn bộ giá trị của persona này đi qua regression test generation. `RQ.md` vẫn tự nói ngược: §26 đặt ở V0.2; §25, §30, §31, §37 giả định đã có. Quyết định chọn **phía §26** ⇒ persona này **thuộc V0.2, xác định** — không còn tình trạng *"không biết thuộc V0.1 hay V0.2"*. Hệ quả: **không đầu tư thiết kế cho vai này trong scope V0.1**. Xem mục 2.1.

**3. Ở V0.1, đây là persona "đọc" chứ không phải persona "làm".**
Với 6 verb của §18, việc duy nhất một QA Engineer làm được là **đọc capsule** ([UC-05](../020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md)). Không có output nào của họ được sản phẩm hỗ trợ tạo ra.

---

## 6. Điều chúng ta KHÔNG biết

> **Mục này tồn tại có chủ ý và bắt buộc phải giữ**: để không ai đọc tài liệu này như kết quả nghiên cứu. Danh sách dưới đây là **những gì một persona thật cần có mà tài liệu này không có**.

### 6.1 Không có bất kỳ dữ liệu demographic nào

`RQ.md` **không chứa** và tài liệu này **không bịa**:

| Loại thông tin | Trạng thái |
|---|---|
| Tên, tuổi, giới tính của bất kỳ người dùng nào | ❌ Không có — và **không được bịa** |
| Vị trí địa lý, múi giờ, ngôn ngữ | ❌ Không có |
| Số năm kinh nghiệm, seniority level | ❌ Không có |
| Tên công ty, tên khách hàng, case study | ❌ Không có |

> **Quy tắc cứng của tài liệu này**: **không một demographic / tên / tuổi / công ty / con số nào không có trong `RQ.md` được xuất hiện ở đây.** Một persona bịa ra sẽ được đọc như một persona đã nghiên cứu, và đó là cách một sản phẩm bị xây cho một người không tồn tại.

### 6.2 Không biết quy mô và bối cảnh tổ chức

- **Quy mô team**: **không** còn ảnh hưởng tới việc *có cần access control hay không* — M2 đã chốt 2026-08-14 là **có, trong OSS core** (mục 4.1). Nhưng nó vẫn ảnh hưởng tới **hình dạng mô hình quyền** (user / team / role — vẫn `TBD`), tới `GAP-04` (ai vận hành retention), và tới việc SRE có phải một vai riêng hay chỉ là một chiếc mũ mà developer đội thêm. Không có dữ liệu.
- **Số lượng service**: §14 giả định microservices, §18 giới hạn V0.1 ở **một** service. Không biết phân bố thực tế.
- **Industry / mức độ regulated**: §20.17 liệt kê GDPR, HIPAA, PCI DSS, SOC 2 — nhưng không biết bao nhiêu phần trăm người dùng mục tiêu thật sự chịu các chế tài này. Đây là biến quyết định mức độ ưu tiên của `FR-021`…`FR-026`.
- **Có sẵn observability chưa**: §34 giả định workflow bắt đầu từ Sentry/APM. Không có dữ liệu về tỷ lệ.

### 6.3 Không có số liệu hành vi

| Câu hỏi | Trạng thái |
|---|---|
| Bao lâu một lần developer gặp bug không reproduce được? | ❌ Không biết |
| Họ **thật sự** mất bao lâu để reproduce hiện nay? | ❌ Không biết — `Hours / Days` của §32 là **hypothesis không có nguồn**, xem [BRD-001-Problem-Statement](../020-Requirements/BRD/BRD-001-Problem-Statement.md) mục 4 |
| Bao nhiêu phần trăm bug production thuộc loại replay được? | ❌ **Vẫn không biết** — chính là §38 **Q7**. Spike §22 **đã được bật** (`✅ CHỐT GATE-01 — 2026-08-14`, `Sponsor`/`Manager` = **`@TrisJr`**) ⇒ chuyển từ *"chưa quyết chạy spike"* sang *"đang chờ kết quả spike"*. Nhưng `ACG-07` (*Supported Execution Class* — mẫu số của tỷ lệ này) **vẫn hở**, nên `GATE-01` **không** tự làm cho Q7 trả lời được — đúng nội dung `GATE-01-r`. Xem [BRD-001-Problem-Statement](../020-Requirements/BRD/BRD-001-Problem-Statement.md) mục 7 |
| Công cụ nào họ đang dùng thay thế, và vì sao chưa đủ? | ❌ Không biết ngoài phát biểu định tính của §3 |
| Mức nỗ lực tích hợp tối đa họ chấp nhận? | ❌ Không biết — chính là §38 **Q13** |
| Developer có cài SDK vào production được không, hay phải qua SRE? | ❌ Không biết — quyết định ranh giới Persona A / Persona B |

### 6.4 Không biết cách ba persona tương tác với nhau

`RQ.md` không mô tả **giao thức làm việc** giữa ba vai: ai quyết định bật capture cho service nào, ai cấp quyền truy cập capsule cho ai, ai chịu trách nhiệm khi một capsule chứa dữ liệu lọt redaction. Đây là khoảng trống trực tiếp gây ra `GAP-04`. **M2 đã chốt 2026-08-14** (authz + audit thuộc OSS core), nhưng quyết định đó **không** lấp khoảng trống này: biết *phải có* authz không đồng nghĩa với biết *ai cấp quyền cho ai theo quy trình nào* — phần đó vẫn `TBD`.

### 6.5 Cách dùng đúng tài liệu này

| ✅ Dùng được | ❌ Không dùng được |
|---|---|
| Làm **danh sách giả định cần kiểm chứng** khi phỏng vấn người dùng | Làm căn cứ ưu tiên tính năng |
| Làm **checklist** để bảo đảm mỗi FR có một vai chịu trách nhiệm | Làm đầu vào cho ước lượng thị trường |
| Làm nguồn cho **actor** của các Use Case | Trích dẫn ra ngoài như "nghiên cứu người dùng của Repro" |

---

## 7. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../020-Requirements/PRD-Repro.md) | Mục 4 (Target Audience) tóm tắt tài liệu này; mục 5 (`FR-001`…`FR-082`); mục 8.2 và 10.4 (**M1**, **M2** — ✅ đã chốt 2026-08-14); mục 10.3 (§38 Q1, Q2, Q13) |
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | `N-10` (production safety — Persona B), `N-15` (minimal integration — Persona A), `N-13`; mục 5.4 (M2 — ✅ đã chốt: authn/authz/audit thuộc OSS core), mục 6 (`X-3` — `Hours/Days` không phải NFR) |
| [BRD-001-Problem-Statement](../020-Requirements/BRD/BRD-001-Problem-Statement.md) | Vấn đề mà Persona A gặp phải — 9 câu hỏi §2.1; mục 4 (cảnh báo hypothesis về chi phí) |
| [UC-01 — Capture Failed Production Execution](../020-Requirements/Use-Cases/UC-01-Capture-Failed-Production-Execution.md) | Persona B là actor chính |
| [UC-02 — Replay Capsule Locally](../020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md) | Persona A |
| [UC-03 — Read Execution Diff](../020-Requirements/Use-Cases/UC-03-Read-Execution-Diff.md) | Persona A |
| [UC-04 — Verify Fix](../020-Requirements/Use-Cases/UC-04-Verify-Fix.md) | Persona A |
| [UC-05 — Browse And Inspect Capsules](../020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) | Persona A + Persona C; `A1` là nơi M2 biểu hiện thành hành vi — sau quyết định 2026-08-14, `A1` là exception flow **bắt buộc** của bản OSS |
| [Charter-Repro](../010-Planning/Charter-Repro.md) | Bối cảnh dự án |
| [Roadmap](../010-Planning/Roadmap.md) | Phasing V0.1 / V0.2 / V0.3 — cơ sở của phân cấp persona ở mục 2 |
| [RQ.md](../999-Resources/RQ.md) | **Nguồn sự thật gốc** — dòng 7 (frontmatter), §3, §4, §8, §9, §10, §13, §14, §16, §18, §20.5, §20.6, §20.7, §20.11, §20.12, §20.14, §20.15, §20.17, §25, §26, §28, §30, §31, §33, §34, §37, §38, §40 |
