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

> **Ba họ định danh rủi ro trong tài liệu này — đừng trộn:**
> - **`R-01`…`R-18`** (§2) — 18 risk **nguyên bản** của `RQ.md §21`.
> - **`C-01`…`C-05`** và **`C-0N-r`** (§4, §4.1) — rủi ro sinh từ **mâu thuẫn nội tại** của `RQ.md`, và rủi ro phát sinh từ quyết định `D1`/`D2` giải các mâu thuẫn đó.
> - **`GATE-0N-r`** (§4.2) — rủi ro sinh từ **năm quyết định gate** `GATE-01`…`GATE-05` ngày 2026-08-14.

> [!IMPORTANT]
> **Cột `Owner` đã được cấp — `✅ CHỐT GATE-01 — 2026-08-14`.** Toàn bộ **18/18 risk** thuộc **`@TrisJr`**.
>
> Trước ngày này, cột `Owner` là `TBD` với lý do *"`RQ.md` không có một tên người hay tên team nào, gán owner bây giờ là bịa"*. Lý do đó **vẫn đúng về `RQ.md`** — tên người không đến từ tài liệu gốc, nó đến từ **quyết định `GATE-01`** khi anh bật Phase 0 và nhận cả ba vai (`Sponsor`, `Manager`, risk owner). Xem [§4.2](#42-năm-rủi-ro-mới-sinh-từ-năm-quyết-định-gate-2026-08-14).
>
> **Hệ quả cần biết**: một người giữ cả 18 risk 🔴/🟠/🟡 là trạng thái của **dự án một người**, không phải phân bổ trách nhiệm thật. Khi dự án có team, đây vẫn là hạng mục đầu tiên cần chia lại.

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
| **R-01** | Insufficient execution capture | 🔴 Critical | Yes | Narrow execution scope | §20.1 | `@TrisJr` |
| **R-02** | Replay non-determinism | 🔴 Critical | Yes | Deterministic inputs | §20.2 | `@TrisJr` |
| **R-03** | False replay equivalence | 🔴 Critical | Yes | Execution verification | §20.3 | `@TrisJr` |
| **R-04** | Side effects | 🔴 Critical | Yes | Default-deny writes | §20.4 | `@TrisJr` |
| **R-05** | Sensitive data | 🔴 Critical | Yes | Redaction + encryption | §20.5 | `@TrisJr` |
| **R-06** | Security exposure | 🔴 Critical | Yes | Private/self-hosted architecture | §20.6 | `@TrisJr` |
| **R-07** | False confidence | 🔴 Critical | Yes | Explicit replay semantics | §20.16 | `@TrisJr` |
| **R-08** | Developer adoption | 🔴 Critical | Yes | Minimal integration | §20.14 | `@TrisJr` |
| **R-09** | Race conditions | 🔴 Critical | **No** | Future | §20.13 | `@TrisJr` |
| **R-10** | Production overhead | 🟠 High | Yes | Async + bounded capture | §20.7 | `@TrisJr` |
| **R-11** | Version drift | 🟠 High | Yes | Version metadata | §20.8 | `@TrisJr` |
| **R-12** | Schema drift | 🟠 High | Yes | Schema metadata | §20.9 | `@TrisJr` |
| **R-13** | External dependency drift | 🟠 High | Yes | Recorded responses | §20.10 | `@TrisJr` |
| **R-14** | Replay boundary | 🟠 High | Yes | Explicit service boundaries | §20.11 | `@TrisJr` |
| **R-15** | Capsule size | 🟠 High | Yes | Compression + limits | §20.12 | `@TrisJr` |
| **R-16** | Compliance | 🟠 High | Yes | Policies + self-hosting | §20.17 | `@TrisJr` |
| **R-17** | OSS business model | 🟡 Medium | **Later** | Define after product validation | §28 | `@TrisJr` |
| **R-18** | Compatibility matrix | 🟡 Medium | Yes | Narrow initial support | §20.14 *(suy ra)* | `@TrisJr` |

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
> **BA con số, đo ba thứ khác nhau — đừng lẫn.** Đồng bộ với callout gốc ở [threat model mục 4.3](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md); cách phân loại do `security-auditor` quyết, PM không tự đặt số.
>
> | Con số | Đo cái gì | Trạng thái |
> |:---:|---|---|
> | **11** | Số threat mà **`RQ.md` không có mitigation** | **Bất biến.** `RQ.md` không thay đổi thì con số này không bao giờ đổi. Nhãn `[GAP]` của từng threat cũng **không** bị gỡ |
> | **10** | Không có mitigation từ **bất kỳ** nguồn nào — **sau `D2`** | **Lịch sử.** `THREAT-008` rời nhóm nhờ `D2` (§4.1) |
> | **9** | Không có mitigation từ **bất kỳ** nguồn nào — **sau `GATE-05`** | **Con số dùng để lập kế hoạch hôm nay.** `THREAT-016` rời nhóm nhờ **`GATE-05a`** (TTL 30 ngày là mitigation **vô điều kiện** cho vế *"tồn tại vô thời hạn"*). Gồm: `THREAT-004`, `005`, `006`, `007`, `009`, `011`, `013`, `018`, `019` |
>
> **Hai điều dễ đọc lệch:**
> - **Rời nhóm ≠ đã an toàn.** Nhóm này đếm *có mitigation hay chưa*, **không** đếm *residual đã thấp hay chưa*. Residual của `THREAT-016` vẫn **Cao**.
> - **`THREAT-007` và `THREAT-011` cố ý KHÔNG rời nhóm** dù crypto-shred có chạm tới chúng. Mitigation duy nhất của cả hai treo **hoàn toàn** trên key custody (`U-06d`) — đang là **blocker** (`GATE-05b-r2`, §4.2). *Một mitigation chưa thực thi được thì chưa phải mitigation.*

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
| **THREAT-016** | Capsule tồn tại vô thời hạn và không xoá được | §20.17 yêu cầu *retention policies* và *deletion*, nhưng **không đặt giá trị mặc định nào** — mệnh đề về `RQ.md` này **vẫn đúng**, nên nhãn `[GAP]` được giữ.<br>✅ **ĐÃ CÓ MITIGATION từ `GATE-05a` (2026-08-14)** — TTL mặc định **30 ngày** (§3.2, §4.2). Trạng thái xấu mặc định *"không ai quyết ⇒ TTL vô hạn"* **đã bị chặn**, và đó là mitigation **vô điều kiện** cho vế *"tồn tại vô thời hạn"* ⇒ `THREAT-016` **rời nhóm 9**.<br>⚠ **Nhưng residual vẫn Cao**: vế *"không xoá được"* chỉ đóng nhờ crypto-shredding (`GATE-05b`), mà cơ chế đó treo trên key custody `U-06d` — **blocker** (`GATE-05b-r2`, §4.2). Và **30 ngày chưa qua pháp chế rà soát** ([Charter §5.1](./Charter-Repro.md)) nên chưa phải kết luận tuân thủ GDPR right-to-erasure (xem mục 8 của threat model) |
| **THREAT-018** | Egress khi replay không thực sự bị chặn — phân loại theo verb fail-open | **Siết chặt lên §13 / §20.4**: §13 nêu *ý định* default-deny nhưng cơ chế nó mô tả (phân loại **theo verb** ở sink đã instrument) **fail-open đúng ở chỗ nguy hiểm nhất** — cái nó không nhận diện được (`net.Socket` thô, `child_process` gọi `curl`, SDK dùng transport riêng, `WITH x AS (UPDATE ...) SELECT`, `SELECT charge_customer(...)`, `CALL`, `GET /v1/send?to=`). Vì §13 có ý định nhưng không có cơ chế đủ, threat này được tính vào nhóm không-có-mitigation |
| **THREAT-019** | Chuỗi cung ứng `@repro/node` bị chiếm | §20.14 đặt `npm install @repro/node` làm điều kiện adoption, nhưng `RQ.md` không nói gì về bảo vệ chính package đó. Một package chạy **in-process ở production** là mục tiêu supply-chain có giá trị cao bất thường |

### 3.1 Quan hệ với mục 2

Ba threat có **giao** với risk của §21 nhưng **không trùng**, cần đọc kèm:

| Threat | Risk §21 liên quan | Khác nhau ở đâu |
|---|---|---|
| `THREAT-018` | `R-04` (Side effects) | §21 nói *phải* default-deny; threat model chỉ ra cơ chế được đề xuất **không đủ** để thực hiện điều đó |
| `THREAT-016` | `R-16` (Compliance) | §21 nói *phải* có retention policy; threat model chỉ ra **không có giá trị mặc định** thì policy không tồn tại trên thực tế. **Đã đóng phần này ngày 2026-08-14** — `GATE-05a` cấp giá trị **30 ngày** |
| `THREAT-008` | `R-05`, `R-06` | §21 nói access control là MVP; §28 lại đẩy nó sang commercial — xem C-02 ở mục 4 |

### 3.2 Ba mục `TBD` của threat model — phân loại theo *loại* chưa biết

Điểm này quan trọng cho việc theo dõi, vì hai trong ba mục **không tự giải quyết theo thời gian**:

| Mục | Loại chưa biết | Ai giải được | Trạng thái |
|---|---|---|---|
| Giá trị TTL mặc định (`SEC-022`) | **Thiếu quyết định** | ~~PM + pháp chế~~ → `@TrisJr` | ✅ **CHỐT GATE-05a — 2026-08-14**: **30 ngày** (cấu hình được; 30 ngày là mặc định khi không cấu hình). Nhánh xấu *"trôi vào TTL vô hạn"* **đã bị chặn**. ⚠ Quyết **không qua pháp chế** — xem [Charter §5](./Charter-Repro.md) |
| Ngưỡng row/byte cap (`SEC-008`) | **Thiếu dữ kiện** | Tự giải khi technical spike §22 chạy | ⏳ **Còn mở.** `GATE-01 = Go` đã **bật** spike, nhưng `SEC-008` chỉ giải khi spike **chạy xong** — và spike hiện chưa cho điểm được (`GATE-01-r`, §4.2) |
| Key server-side vs replay offline (`SEC-016`) | **Thiếu quyết định** | ~~Architect~~ → `@TrisJr` | ✅ **CHỐT GATE-05b — 2026-08-14**: **crypto-shredding ÁP DỤNG, `MUST-V0.1`**. Nhánh xấu *"`TB-4` vĩnh viễn bất khả hồi"* **đã bị chặn** — nhưng chỉ khả hồi **nếu có key management** (`GATE-05b-r2`, §4.2) |

**Ba mục này nay còn `1` mục thực sự mở** (`SEC-008`) thay vì 3. Hai mục *"thiếu quyết định"* — đúng hai mục mà mục này cảnh báo là **không tự giải theo thời gian** — đều đã có người quyết.

> [!WARNING]
> **Quyết định `GATE-05b` mua một thứ bằng cách bán một thứ khác.** Crypto-shredding làm `TB-4` khả hồi, nhưng phá bất biến *"replay không cần kết nối mạng"* của [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) và `§33.6 Safe by default`. Đây là đánh đổi **được chấp nhận có ý thức**, ghi thành `GATE-05b-r` ở §4.2 — không phải phát hiện muộn.

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
| **C-02-r** | **`GAP-04` nặng thêm, không nhẹ đi** | Trước đây authz/audit *có thể* không được lấp ở bản OSS nên gap này còn mơ hồ. Nay chúng **chắc chắn phải có**, mà §18 vẫn **không có một CLI verb nào** để vận hành chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side. Xem [Analysis-Target-Users §4.1](../050-Research/Analysis-Target-Users.md).<br>**Cập nhật sau `GATE-04` (2026-08-14)**: rủi ro này **KHÔNG được đóng**. `GATE-04` chốt *cái gì* store phải có, **không** chốt *ai vận hành nó bằng lệnh nào*. Xem `GATE-04-r` ở §4.2 |
| **C-02-r2** | **Hiện thực authz đúng vẫn là rủi ro riêng** | Quyết định này là quyết định **phạm vi**, không phải thiết kế. `U-06` (Capsule Store chưa được `RQ.md` đặc tả dòng nào) bị **thu hẹp** nhưng **chưa được giải** — store tối thiểu nay bắt buộc có authn/authz/audit hook, còn API và cơ chế auth vẫn `TBD`.<br>**Cập nhật sau `GATE-04` (2026-08-14)**: **phần sàn đã được giải** — sàn chốt là *object/file storage + một index + authn/authz/audit hook*, với 3 thao tác tối thiểu theo [SDD §5.4](../030-Specs/Architecture/SDD-Repro.md). **Cơ chế** authn/authz **vẫn `TBD`** ⇒ rủi ro hiện thực còn nguyên, chỉ hẹp hơn |

> **Crypto-shredding KHÔNG nằm trong quyết định `D2`** — mệnh đề này **vẫn đúng về `D2`**. Nhưng nó **đã được quyết riêng** bởi `GATE-05b` ngày 2026-08-14: **áp dụng, `MUST-V0.1`**. Xem §3.2 và §4.2.

### 4.2 Năm rủi ro mới sinh từ năm quyết định GATE (2026-08-14)

> **Cùng nguyên tắc với §4.1**: quyết định nào cũng có mặt trái, và bộ tài liệu này ghi thẳng mặt trái thay vì chỉ ghi phần tích cực. Năm rủi ro dưới đây **không tồn tại trước ngày 2026-08-14** — chúng do chính năm quyết định `GATE-01`…`GATE-05` sinh ra.
>
> **Định danh** dùng họ `GATE-0N-r`, cố ý **khác** họ `C-0N-r` ở §4.1 (rủi ro sinh từ *mâu thuẫn nội tại* của `RQ.md`) và khác họ `R-01`…`R-18` ở §2 (18 risk nguyên bản của `RQ.md §21`). Ba họ, ba nguồn gốc khác nhau — đừng trộn.
>
> Bản ghi quyết định gốc: [pm-runs/2026-08-14-gates-g1-g5/escalations.md](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) **E-01** và **E-02**.

| ID | Rủi ro | Severity | Sinh từ | Vì sao — và nó chặn cái gì |
|---|---|:---:|---|---|
| **`GATE-01-r`** | **`Go` không tự làm cho spike đo được** | 🔴 Critical | `GATE-01` | Bật Phase 0 giải quyết câu *"có đầu tư hay không"*, **không** giải quyết câu *"chạy xong thì kết luận thế nào"*. Bốn khoảng hở vẫn nguyên: `ACG-03` (ngưỡng `≥80%` **không có denominator** và không có định nghĩa *"reproduced"*), `ACG-02` (**không có tiêu chí chọn test case**, mà chính `ACG-02` đòi *chốt trước khi chạy spike*), `ACG-01` (*"sufficiently equivalent"* không định nghĩa được), `ACG-07` (**"Supported Execution Class" không tồn tại ở đâu trong `RQ.md`**). ⇒ **Chạy spike lúc này vẫn không cho ra pass/fail.** Xem [NFR-Repro §7](../020-Requirements/NFR-Repro.md). **Việc phải làm trước khi spike chạy**: một spike protocol chốt bốn mục này ở dạng *hypothesis có nhãn* — **chưa được viết**, thuộc run kế tiếp |
| **`GATE-03-r`** | **11 ADR mang `Accepted` trong khi bên trong còn 6 unknown chưa giải** | 🔴 Critical | `GATE-03` | `Accepted` xác nhận **hướng quyết định**, nhưng mục `Open items` của các ADR đó vẫn giữ `U-01` (cơ chế chặn driver `pg`), `U-02` (query matching identity — [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) gọi là *"rủi ro hiện thực cao nhất"*), `U-03`, **`U-04`** (*"unknown lớn nhất tài liệu"*), `U-13`, `U-20` — tất cả `TBD` hoặc disposition `SPIKE`. **Rủi ro thật**: người hiện thực và tài liệu hạ nguồn đọc `Accepted` như *"mọi thứ trong ADR này đã chốt"*. **Mitigation đã thi hành**: mỗi ADR mang callout tường minh *"`Accepted` KHÔNG đóng `Open items`"* |
| **`GATE-04-r`** | **Sàn Capsule Store đã đóng nhưng không vận hành được** | 🟠 High | `GATE-04` | `GATE-04` chốt *cái gì phải có*; **cơ chế** authn/authz **vẫn `TBD`** ([SDD §5.4](../030-Specs/Architecture/SDD-Repro.md)), và **`GAP-04` còn nguyên** — §18 không có một CLI verb nào để cấu hình authz, đọc audit log, hay kiểm tra retention. Sàn tồn tại trên giấy mà không ai có lệnh để chạm vào nó. Là **cùng một gap** với `C-02-r`, không phải rủi ro trùng lặp: `C-02-r` nói *gap tồn tại*, `GATE-04-r` nói *quyết định sàn đã không đóng nó* |
| **`GATE-05b-r`** | **"Replay không cần kết nối mạng" thôi là bất biến** | 🟠 High | `GATE-05b` | Crypto-shredding đòi khoá giữ phía server ⇒ replay **cần** liên hệ server để lấy khoá. Va trực tiếp vào ba chỗ: [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) (capsule **self-contained** — kết luận của `C-05` ở §4.1), [SDD §4.9](../030-Specs/Architecture/SDD-Repro.md), và `§33.6 Safe by default`. **Cũng làm yếu bước *"Destroy original environment"* của §22** — nếu "environment" bao gồm key server thì capsule không giải được, và phép thử portable của spike mất một phần ý nghĩa. Đây là **đánh đổi được chấp nhận có ý thức**, không phải phát hiện muộn |
| **`GATE-05b-r2`** | **`U-06d` (key custody) từ open item phụ thành BLOCKER** | 🔴 Critical | `GATE-05b` | Quyết định *"crypto-shredding là `MUST-V0.1`"* **chỉ có giá trị khi có nơi giữ và xoá khoá**. Không có key management thì: (a) crypto-shred không thực thi được ⇒ `TB-4` **vẫn** bất khả hồi dù tài liệu nói đã mitigated; (b) mất khoá = mất **toàn bộ** capsule, kể cả capsule còn trong hạn — một chế độ hỏng **mới**, không tồn tại trước quyết định này; (c) **hành vi CLI cũng bị chặn** — `repro inspect` nay phải phân biệt *khoá đã bị phá có chủ đích* (hết retention) với *khoá tạm không với tới được* (sự cố vận hành), tức **bốn** tình huống thay vì ba, và hành vi đó chưa có nguồn. `U-06d` hiện là `TBD` ở [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`.<br>**Owner**: **`@TrisJr`** — cấp tại đây, không tại `ADR-009`. Hai writer độc lập (`architect`, `business-analyst`) đều báo `PARTIAL` vì đúng mục này và **đúng khi từ chối tự gán owner**: `GATE-01` cấp owner cho **18 risk gốc của §21**, không cấp cho open item kỹ thuật. PM cấp ở tầng rủi ro theo cùng logic dự án-một-người của `GATE-01`.<br>**Điều kiện đóng**: có thiết kế key management (nơi giữ · luân chuyển · xoá · quy trình mất khoá) **trước khi** capsule format v1 đóng băng |

### 4.2.1 Ba mục KHÔNG bị đóng hộ bởi năm quyết định

Ghi tường minh để không ai đọc lệch — năm gate **không** chạm tới ba mục dưới đây, và chúng vẫn là chỗ hở nghiêm trọng nhất của bộ tài liệu:

| Mục | Trạng thái sau 2026-08-14 | Vì sao gate không đóng được nó |
|---|---|---|
| **`N-05`** — ngưỡng Execution Match Rate | ⏳ vẫn `TBD` | `C-01-r` gọi đây là *"chỗ hở nghiêm trọng nhất của cả tài liệu"*. Ngưỡng phải đến từ **dữ liệu đo của spike**, không từ bàn giấy — [NFR §3.1](../020-Requirements/NFR-Repro.md) ghi rõ *"cần anh chốt **sau** spike §22"*. `GATE-01` chỉ **bật** spike |
| **`U-04` / `ACG-01`** — *"sufficiently equivalent"* | ⏳ vẫn `TBD` | Không định nghĩa được equivalence thì **không ĐẾM được** *"Execution matched"* — tức là không đếm được chính chỉ số thành công của V0.1 (`C-01-r2`). Không gate nào trong năm gate chạm tới nó |
| **`ACG-07`** — *"Supported Execution Class"* | ⏳ vẫn `TBD` | §20.1 lấy chính nó làm mitigation cho risk 🔴 Critical `R-01`, nhưng khái niệm **không tồn tại ở đâu trong `RQ.md`**. Không có nó thì denominator của ngưỡng `≥80%` (§24) không xác định được |

### 4.3 Vì sao C-01 và C-02 được đối xử khác C-03/C-04/C-05

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
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | TBD register (`U-01`…`U-25`) và traceability risk → component |
| [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) | Bản ghi gốc năm quyết định `GATE-01`…`GATE-05` (**E-01**) và năm rủi ro phát sinh (**E-02**) |
