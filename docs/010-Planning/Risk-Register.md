---
id: RISK-001
type: risk-register
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ⚠️ Risk Register: Repro

> **Nguồn sự thật**: [RQ.md](../999-Resources/RQ.md) §20 (17 mục risk có mitigation) và §21 (Risk Matrix, bảng 18 dòng). Mục 3 lấy từ [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md). Mục 4 là các mâu thuẫn nội tại của chính `RQ.md`.

> [!IMPORTANT]
> **Cột `Owner` của toàn bộ tài liệu này là `TBD`.** `RQ.md` không có một tên người hay tên team nào. Gán owner bây giờ là bịa. Đây là hạng mục đầu tiên cần điền khi dự án có team thật.

---

## 1. Risk Matrix Overview

`RQ.md §21` dùng thang **ba mức** và một cột phạm vi, khác với thang Probability × Impact của template chuẩn. Tài liệu này **giữ nguyên thang của `RQ.md`**, không tự quy đổi — quy đổi sang thang khác sẽ tạo ra những con số không có nguồn.

| Ký hiệu | Mức | Ý nghĩa |
|---|---|---|
| 🔴 | **Critical** | Có thể làm sản phẩm thất bại hoặc gây thiệt hại nghiêm trọng cho người dùng |
| 🟠 | **High** | Ảnh hưởng đáng kể tới chất lượng hoặc khả năng vận hành |
| 🟡 | **Medium** | Cần theo dõi, chưa chặn |

**Cột `MVP?`** trong §21 trả lời câu hỏi: *risk này có phải được xử lý ngay ở V0.1 không?* — **không phải** *risk này có nghiêm trọng không*. Hai risk 🔴 Critical vẫn có thể mang `MVP? = No` (Race conditions) vì §20.13 chủ động hoãn chúng.

> [!NOTE]
> **Cột `MVP?` của §21 là nguồn có thẩm quyền cho capability phi chức năng.** §18 ("MVP capabilities") liệt kê *core replay loop* và **không** nhắc redaction, encryption, retention hay self-hosting — nhưng §21 ghi **Yes** cho cả năm risk tương ứng. Cách đọc đã chốt: §18 là danh sách vòng lặp lõi, §21 là danh sách nghĩa vụ phi chức năng; hai section **bổ sung** cho nhau chứ không loại trừ nhau. Đây là **diễn giải của PM**, ghi lại tường minh ở [PRD-Repro §3.4](../020-Requirements/PRD-Repro.md).

---

## 2. Risk Log — 18 risk của §21

**Severity và cột `MVP?` giữ nguyên bản của §21, không tự đánh giá lại.** Cột *Nguồn §* trỏ tới mục tương ứng trong §20 nơi risk được mô tả đầy đủ.

| ID | Risk | Severity | MVP? | Mitigation (§21) | Nguồn § | Owner |
|---|---|:---:|:---:|---|---|---|
| **R-01** | Insufficient execution capture | 🔴 Critical | Yes | Narrow execution scope | §20.1 | `TBD` |
| **R-02** | Replay non-determinism | 🔴 Critical | Yes | Deterministic inputs | §20.2 | `TBD` |
| **R-03** | False replay equivalence | 🔴 Critical | Yes | Execution verification | §20.3 | `TBD` |
| **R-04** | Side effects | 🔴 Critical | Yes | Default-deny writes | §20.4 | `TBD` |
| **R-05** | Sensitive data | 🔴 Critical | Yes | Redaction + encryption | §20.5 | `TBD` |
| **R-06** | Security exposure | 🔴 Critical | Yes | Private/self-hosted architecture | §20.6 | `TBD` |
| **R-07** | False confidence | 🔴 Critical | Yes | Explicit replay semantics | §20.16 | `TBD` |
| **R-08** | Developer adoption | 🔴 Critical | Yes | Minimal integration | §20.14 | `TBD` |
| **R-09** | Race conditions | 🔴 Critical | **No** | Future | §20.13 | `TBD` |
| **R-10** | Production overhead | 🟠 High | Yes | Async + bounded capture | §20.7 | `TBD` |
| **R-11** | Version drift | 🟠 High | Yes | Version metadata | §20.8 | `TBD` |
| **R-12** | Schema drift | 🟠 High | Yes | Schema metadata | §20.9 | `TBD` |
| **R-13** | External dependency drift | 🟠 High | Yes | Recorded responses | §20.10 | `TBD` |
| **R-14** | Replay boundary | 🟠 High | Yes | Explicit service boundaries | §20.11 | `TBD` |
| **R-15** | Capsule size | 🟠 High | Yes | Compression + limits | §20.12 | `TBD` |
| **R-16** | Compliance | 🟠 High | Yes | Policies + self-hosting | §20.17 | `TBD` |
| **R-17** | OSS business model | 🟡 Medium | **Later** | Define after product validation | §28 | `TBD` |
| **R-18** | Compatibility matrix | 🟡 Medium | Yes | Narrow initial support | §20.14 *(suy ra)* | `TBD` |

### 2.1 Ghi chú bổ sung cho các risk nặng nhất

Phần này **không** đánh giá lại severity — nó chỉ ghi lại điều §20 tự thừa nhận mà bảng §21 một dòng không chứa nổi.

- **R-01 — Insufficient execution capture.** §20.1 liệt kê 9 lớp hidden input mà Repro **không** capture: environment variables, filesystem state, randomness, system clock, process state, concurrency, network behavior, OS behavior, background jobs. Mitigation của §20.1 là *"Limit the MVP to a clearly defined class of deterministic request/response executions"* — nhưng **"clearly defined class" đó không tồn tại ở đâu trong `RQ.md`**. Đây là nợ định nghĩa, ghi lại thành `ACG-07` trong [NFR-Repro §7](../020-Requirements/NFR-Repro.md). Không có nó thì denominator của ngưỡng `≥80%` (§24) không xác định được.
- **R-03 — False replay equivalence.** Mitigation là Execution Verification (§10). Nhưng tiêu chí *"sufficiently equivalent"* của §10 **không có định nghĩa**, và ký hiệu `A → B → C` không được giải thích A/B/C là gì. ⇒ **feature quan trọng nhất về mặt tin cậy lại là feature không đo được**. Ghi lại thành `ACG-01` / `U-04`. Đồng thời chỉ số đo nó — Execution Match Rate (§23) — **không có ngưỡng** ở §24 (`N-05`).
- **R-04 — Side effects.** Mitigation §20.4 là default-deny write. Cơ chế mà §13 mô tả là **phân loại theo verb** (SELECT/GET/cache read = READ; INSERT/UPDATE/DELETE/POST payment/publish event = WRITE). Threat model chỉ ra cơ chế này **fail-open đúng ở chỗ nguy hiểm nhất** — những gì nó không nhận diện được. Chi tiết và đề xuất siết chặt: [ADR-005](../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md).
- **R-08 — Developer adoption.** §20.14 nêu đích danh hai câu giết sản phẩm: *"Another observability SDK"* và *"This looks complicated to install"*. Đây là risk **product**, không phải risk kỹ thuật — và nó ràng buộc mọi quyết định kiến trúc (xem [ADR-007](../030-Specs/Architecture/ADR-007-In-Process-SDK-Interception.md)).
- **R-10 — Production overhead.** §20.7 đặt nguyên tắc: *"Repro must never become the reason production becomes slower or fails."* Ngân sách `<5%` latency (§24) tồn tại vì risk này. **Nghịch lý cần biết**: §20.7 nói *"capture only failed/high-value executions"*, nhưng một execution chỉ được biết là failed **sau khi** nó kết thúc ⇒ phải buffer mọi execution rồi hủy khi thành công ⇒ ngân sách `<5%` thực chất áp cho **100% traffic**. `RQ.md` không thừa nhận điểm này. Chi tiết: [ADR-008](../030-Specs/Architecture/ADR-008-Async-Bounded-Failure-Triggered-Capture.md).
- **R-09 — Race conditions.** Là risk 🔴 Critical duy nhất mang `MVP? = No`. §20.13 chủ động hoãn. **Hệ quả phải nói thật với người dùng**: verify pass trên một capsule **không** chứng minh bug production đã hết nếu bug là race condition (§20.16).

---

## 3. Risk phát sinh từ threat model

[Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) dựng threat model đầy đủ cho thiết kế Repro: 13 asset, 6 trust boundary trên 4 zone, 19 threat theo khung STRIDE per-boundary, mỗi threat có **residual risk** riêng.

Trong 19 threat đó, **11 threat được đánh dấu `[GAP — RQ.md KHÔNG CÓ MITIGATION]`**. Đây là **risk mới**, **không** phải cách diễn đạt khác của 18 risk ở mục 2 — `RQ.md §20` không có một dòng mitigation nào cho chúng.

> [!NOTE]
> **Hai con số, đo hai thứ khác nhau — đừng lẫn:**
> - **11** = số threat mà **`RQ.md` không có mitigation**. Con số này **không đổi** sau quyết định ngày 2026-08-14, vì nguyên văn `§28` của tài liệu gốc không hề thay đổi.
> - **10** = số threat **không có mitigation từ bất kỳ nguồn nào**. `THREAT-008` đã rời nhóm này vì quyết định **D2** (§4.1) cấp cho nó một mitigation — nhưng là mitigation đến từ **quyết định sản phẩm**, không phải từ `RQ.md`.
>
> Khi cần biết *"còn bao nhiêu threat đang thực sự hở"*, dùng **10**. Khi cần biết *"tài liệu gốc thiếu bao nhiêu"*, dùng **11**.

| ID | Threat | Vì sao là risk mới, không nằm trong §21 |
|---|---|---|
| **THREAT-004** | Redaction config fail-open | §16 chỉ đưa ra **hình dạng** file config redaction, không nói gì về integrity của nó hay hành vi khi nó thiếu. Config bị xoá / typo / parse lỗi / deploy thiếu ⇒ recorder chạy ở chế độ "không rule nào khớp" = **full capture**, âm thầm, không tín hiệu. Không cần tấn công gì — chỉ cần một PR sửa YAML |
| **THREAT-005** | Recorder bị lạm dụng thành công cụ exfiltration nội bộ | §20.6 chỉ mô hình hoá attacker **bên ngoài** chiếm storage. **Mô hình insider hoàn toàn vắng mặt trong `RQ.md`.** Người không có quyền `psql` production nhưng **có quyền merge config** có thể mở rộng capture, tắt redaction một field, rồi `repro pull` — toàn bộ chuỗi trông giống debug bình thường. Đây là Repro trở thành **privilege escalation path** bypass phân quyền dữ liệu sẵn có của tổ chức |
| **THREAT-006** | Capsule vào git vĩnh viễn | Đường thứ hai **là tính năng có chủ đích**: regression test (§25, §26 V0.2) *phải* mang dữ liệu production để chạy được, và test *phải* được commit. Git history bất biến; force-push không xoá được fork / clone / CI cache. **Ràng buộc capsule format ⇒ phải chốt ở V0.1** dù tính năng ở V0.2 |
| **THREAT-007** | Capsule sprawl trong Zone 3 | Hệ quả trực tiếp của `TB-4` (storage → laptop). Một capsule → N bản trên N laptop, trong khi retention policy chỉ áp được lên bản gốc. `RQ.md` không có khái niệm nào về vòng đời của bản sao |
| **THREAT-008** | Bản self-host không có access control | ✅ **ĐÃ CÓ MITIGATION từ quyết định D2 (2026-08-14)** — authn + authz + audit vào OSS core, xem §4.1. `RQ.md` **vẫn** không có mitigation nên threat này giữ nhãn `[GAP]` trong threat model, nhưng residual risk đã giảm **Critical → Medium**. **Ba lý do residual chưa về thấp hơn**: (a) D2 là quyết định **phạm vi**, không phải control đang chạy; (b) `GAP-04` còn nguyên — không có CLI verb nào để vận hành authz/audit; (c) key custody và audit storage vẫn do tổ chức tự vận hành |
| **THREAT-009** | Capsule là input không tin cậy → thực thi mã trên máy developer | **Khoảng trống lớn nhất của thiết kế.** Toàn bộ `RQ.md` nhìn dữ liệu chảy **ra**; nhưng `repro replay` **nạp và deserialize artifact do bên khác tạo** rồi tiêm vào runtime. `RQ.md` **không có một dòng nào về capsule integrity** — không hash, không signature, không verification. Impact là **code execution trên máy có SSH key, cloud credential, quyền push code** ⇒ đường từ *lộ dữ liệu* sang **compromise chuỗi phát triển**. Đóng được bằng một requirement rẻ (`SEC-027`: verify **trước khi** parse) |
| **THREAT-011** | Không quy trách nhiệm được sau khi capsule rời Zone 2 | Storage log được "ai pull", **không** log được "capsule đó sau đó đi đâu". §20.17 đòi audit log nhưng audit dừng đúng ở boundary nguy hiểm nhất |
| **THREAT-013** | Capsule giả mạo được nạp vào storage | Mặt còn lại của `THREAT-009`: không có integrity thì không chỉ replay bị tấn công, mà chính storage cũng nhận được artifact không rõ nguồn gốc |
| **THREAT-016** | Capsule tồn tại vô thời hạn và không xoá được | §20.17 yêu cầu *retention policies* và *deletion*, nhưng không đặt giá trị mặc định nào. Không ai quyết ⇒ trạng thái mặc định là **TTL vô hạn**. Va thẳng vào GDPR right-to-erasure (xem mục 8 của threat model) |
| **THREAT-018** | Egress khi replay không thực sự bị chặn — phân loại theo verb fail-open | **Siết chặt lên §13 / §20.4**: §13 nêu *ý định* default-deny nhưng cơ chế nó mô tả (phân loại **theo verb** ở sink đã instrument) **fail-open đúng ở chỗ nguy hiểm nhất** — cái nó không nhận diện được (`net.Socket` thô, `child_process` gọi `curl`, SDK dùng transport riêng, `WITH x AS (UPDATE ...) SELECT`, `SELECT charge_customer(...)`, `CALL`, `GET /v1/send?to=`). Vì §13 có ý định nhưng không có cơ chế đủ, threat này được tính vào nhóm không-có-mitigation |
| **THREAT-019** | Chuỗi cung ứng `@repro/node` bị chiếm | §20.14 đặt `npm install @repro/node` làm điều kiện adoption, nhưng `RQ.md` không nói gì về bảo vệ chính package đó. Một package chạy **in-process ở production** là mục tiêu supply-chain có giá trị cao bất thường |

### 3.1 Quan hệ với mục 2

Ba threat có **giao** với risk của §21 nhưng **không trùng**, cần đọc kèm:

| Threat | Risk §21 liên quan | Khác nhau ở đâu |
|---|---|---|
| `THREAT-018` | `R-04` (Side effects) | §21 nói *phải* default-deny; threat model chỉ ra cơ chế được đề xuất **không đủ** để thực hiện điều đó |
| `THREAT-016` | `R-16` (Compliance) | §21 nói *phải* có retention policy; threat model chỉ ra **không có giá trị mặc định** thì policy không tồn tại trên thực tế |
| `THREAT-008` | `R-05`, `R-06` | §21 nói access control là MVP; §28 lại đẩy nó sang commercial — xem C-02 ở mục 4 |

### 3.2 Ba mục `TBD` của threat model — phân loại theo *loại* chưa biết

Điểm này quan trọng cho việc theo dõi, vì hai trong ba mục **không tự giải quyết theo thời gian**:

| Mục | Loại chưa biết | Ai giải được | Nếu không ai quyết |
|---|---|---|---|
| Giá trị TTL mặc định (`SEC-022`) | **Thiếu quyết định** | PM + pháp chế | Trôi vào trạng thái xấu mặc định: **TTL vô hạn** |
| Ngưỡng row/byte cap (`SEC-008`) | **Thiếu dữ kiện** | Tự giải khi technical spike §22 chạy | — |
| Key server-side vs replay offline (`SEC-016`) | **Thiếu quyết định** | Architect | Trôi vào trạng thái xấu mặc định: **không có crypto-shred** ⇒ `TB-4` vĩnh viễn bất khả hồi |

---

## 4. Mâu thuẫn nội tại của tài liệu gốc

> **Đây là một loại risk thật, không phải lỗi biên tập.** `RQ.md` là nguồn sự thật **duy nhất** của toàn bộ bộ tài liệu này. Chỗ nào nó tự nói ngược thì mọi tài liệu dẫn xuất đều lệch theo — và lệch một cách khó phát hiện, vì mỗi tài liệu đều trích đúng một section có thật.

| ID | Mâu thuẫn | Phía A | Phía B | Hệ quả | Xử lý |
|---|---|---|---|---|---|
| **C-01 (M1)** | **Regression test generation ở V0.1 hay V0.2?** | §26 xếp vào **V0.2** | §25.6 Killer Demo in `✓ Regression case generated`; §30 journey kết ở `Regression test`; §31 North Star đếm *"converted into regression tests"* | **North Star Metric của V0.1 không đo được bằng chính V0.1.** Lỗi ở tầng *"làm sao biết sản phẩm thành công"* | ✅ **ĐÃ CHỐT 2026-08-14** — xem §4.1 |
| **C-02 (M2)** | **Access control ở OSS core hay commercial layer?** | §28 xếp Access control / Retention policies / Team management / Enterprise security vào **commercial layer**; OSS core chỉ có "Basic Self-hosting" | §20.5 liệt kê *strict access control* trong mitigation; §21 ghi **MVP = Yes** cho Sensitive data / Security exposure / Compliance | **Bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.** | ✅ **ĐÃ CHỐT 2026-08-14** — xem §4.1 |
| **C-03** | **Redis có trong MVP capture không?** | §5 (execution chain có "Cache Reads", "Redis → Result B"), §13 ("Cache read" ở nhóm READ), §17 (Recorder box liệt kê Redis), §22 (test app có Redis) | §18 (MVP capture list **không có** Redis), §26 (đặt Redis ở **V0.3**) | Nếu đọc theo phía A thì MVP phình thêm một loại dependency chưa được đặt tên trong scope | **PM đã chốt**: Redis **ngoài V0.1**. Phát biểu phạm vi tường minh (§18, §26) thắng sơ đồ minh hoạ (§5, §17). *Ghi chú: sơ đồ §17 của `RQ.md` cần sửa cho khớp.* Xem [Roadmap](./Roadmap.md) |
| **C-04** | **P95 capsule size có ngưỡng không?** | §23 yêu cầu đo **cả** Average **và** P95 | §24 chỉ đặt ngưỡng `< 10 MB average`, không nói gì về P95 | Không có ngưỡng thì chỉ số P95 đo xong không dùng để ra quyết định được | **PM đã chốt**: ghi cả hai vào NFR — `N-03` có ngưỡng (average), `N-09` ngưỡng **`TBD`** (P95). **Không bịa một con số P95.** Xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md) |
| **C-05** | **Capsule tự chứa hay tham chiếu ra ngoài?** | §6 (*"only the information necessary"*) + §40 (*"portable"*) ⇒ **tự chứa** | §20.12 liệt kê **"lazy loading"** trong mitigation cho capsule size ⇒ hàm ý tham chiếu ra ngoài | Nếu capsule tham chiếu production lúc replay thì bước *"Destroy original environment"* của §22 mất ý nghĩa, và tính portable của §40 sụp | **PM đã chốt**: capsule **self-contained là bất biến V0.1**; "lazy loading" hiểu là lazy khi **đọc** capsule (không nạp hết vào memory), **không** phải lazy fetch từ production. Cách đọc này giữ được cả §6/§40 và §20.12. Ghi ở [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) |

### 4.1 Hai quyết định của anh — chốt ngày 2026-08-14

> Phần bối cảnh hai phía ở bảng trên **được giữ nguyên có chủ ý**. `RQ.md` vẫn tự nói ngược ở chính những chỗ đó — quyết định dưới đây không làm mâu thuẫn trong tài liệu gốc biến mất, nó chỉ ghi lại **ta chọn phía nào và vì sao**.

#### D1 — C-01 (M1): regression test generation **giữ ở V0.2**

| | |
|---|---|
| **Quyết định** | Giữ nguyên §26. Regression test generation thuộc **V0.2**, không kéo về V0.1 |
| **Chỉ số thành công của V0.1** | **Số bug đạt trạng thái *"Execution matched"*** (§10) |
| **North Star §31** | Giữ nguyên làm metric **dài hạn**, **kích hoạt từ V0.2** |

**Vì sao metric này đúng**: *"Execution matched"* là trạng thái mạnh nhất mà V0.1 **tự sinh ra được**, và nó đo đúng thứ V0.1 tồn tại để chứng minh — execution được **tái hiện thật**, không chỉ chạy xong. Nó cũng là chỉ số trực tiếp chống `R-03` (false replay equivalence, 🔴 Critical).

**Rủi ro còn lại — mới, phát sinh từ chính quyết định này**:

| ID | Rủi ro | Vì sao |
|---|---|---|
| **C-01-r** | **Chỉ số thành công của V0.1 chưa có tiêu chí pass/fail** | Metric mới được đo bởi `N-05` (Execution Match Rate, §23), nhưng §24 **không đặt ngưỡng** cho `N-05` — nó chỉ đặt ngưỡng cho Replay Success Rate. Trước đây đây là ghi chú phụ; nay `N-05` là chỉ số chính nên khoảng hở này **nặng hơn hẳn**. |
| **C-01-r2** | **`U-04` giờ chặn cả chỉ số thành công** | Không định nghĩa được *"sufficiently equivalent"* (§10) thì **không đếm được** "Execution matched". `U-04` vốn chặn `ADR-006`; nay nó chặn luôn khả năng đo thành công của V0.1. |

#### D2 — C-02 (M2): **authn + authz + audit vào OSS core**

| | |
|---|---|
| **Quyết định** | **Authentication + authorization (access control) + audit log** đều thuộc **OSS core** — **ghi đè** phần §28 xếp Access control và Retention policies vào commercial layer |
| **Vẫn ở commercial layer** (§28) | Hosted storage · Team management · Analytics · AI analysis · Cloud integrations |

**Vì sao cả ba chứ không chỉ authn**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production** — mâu thuẫn chưa được giải. Thiếu audit thì tổ chức kiểm soát được nhưng **không chứng minh được**, trong khi §20.17 yêu cầu audit log như mitigation cho risk 🟠 High.

**Ảnh hưởng lên Risk Log ở mục 2**:

| Risk | Thay đổi |
|---|---|
| `R-05` Sensitive data · `R-06` Security exposure | Mitigation được **củng cố** — access control nay chắc chắn tồn tại ở bản self-host, không còn phụ thuộc việc mua bản thương mại |
| `R-16` Compliance | Audit log — thứ §20.17 đòi hỏi — nay chắc chắn có trong OSS core |
| `R-08` Developer adoption | **Xấu đi.** Đưa authn/authz/audit vào OSS core làm **tăng phạm vi hiện thực của V0.1** và va vào chính cảnh báo §20.14 (*"significant infrastructure"* hại adoption) và §20.15 (*"Artifact storage"* là biểu hiện scope explosion). Đây là đánh đổi có ý thức, không phải bỏ sót |

**Rủi ro còn lại**:

| ID | Rủi ro | Vì sao |
|---|---|---|
| **C-02-r** | **`GAP-04` nặng thêm, không nhẹ đi** | Trước đây authz/audit *có thể* không được lấp ở bản OSS nên gap này còn mơ hồ. Nay chúng **chắc chắn phải có**, mà §18 vẫn **không có một CLI verb nào** để vận hành chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side. Xem [Analysis-Target-Users §4.1](../050-Research/Analysis-Target-Users.md) |
| **C-02-r2** | **Hiện thực authz đúng vẫn là rủi ro riêng** | Quyết định này là quyết định **phạm vi**, không phải thiết kế. `U-06` (Capsule Store chưa được `RQ.md` đặc tả dòng nào) bị **thu hẹp** nhưng **chưa được giải** — store tối thiểu nay bắt buộc có authn/authz/audit hook, còn API và cơ chế auth vẫn `TBD` |

> **Crypto-shredding KHÔNG nằm trong quyết định này.** Nó vẫn là đề xuất **cần validate** (đánh đổi với replay offline chưa được giải) — xem mục 3.2.

### 4.2 Vì sao C-01 và C-02 được đối xử khác C-03/C-04/C-05

C-03, C-04, C-05 có **neo văn bản đủ mạnh để PM tự phân xử**: một phía là phát biểu phạm vi tường minh, phía kia là sơ đồ minh hoạ hoặc chỗ thiếu sót — chọn được mà không đổi định nghĩa sản phẩm.

C-01 và C-02 thì không. C-01 đổi **định nghĩa thành công** của sản phẩm; C-02 đổi **mô hình kinh doanh** và có hệ quả bảo mật trực tiếp. Cả hai đều được **hai lens phân tích độc lập tìm ra** — mức bằng chứng cao nhất run tài liệu này có. Vì vậy chúng được ghi trung thực cả hai phía kèm đề xuất và **đẩy lên cho anh quyết**, thay vì để một writer im lặng chọn một phía. Anh đã chốt cả hai ngày **2026-08-14** — xem §4.1.

> **Ba mâu thuẫn còn lại (C-03, C-04, C-05) giữ nguyên cách xử lý cũ** — chúng do PM phân xử ở tầng 2 và không nằm trong quyết định ngày 2026-08-14.

---

## 5. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [RQ.md](../999-Resources/RQ.md) | Nguồn sự thật gốc — §20, §21 |
| [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Chi tiết 19 threat, residual risk, và 11 threat chưa có mitigation |
| [Charter-Repro](./Charter-Repro.md) | Bối cảnh và điều kiện dừng đầu tư |
| [Roadmap](./Roadmap.md) | Phân phase và Non-Goals |
| [PRD-Repro](../020-Requirements/PRD-Repro.md) | Open Questions, Success Metrics, Validation Hypotheses |
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | Acceptance criteria gaps (`ACG-01`…`ACG-12`) |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | TBD register (`U-01`…`U-23`) và traceability risk → component |
