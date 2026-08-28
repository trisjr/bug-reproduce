---
id: RISK-001
type: risk-register
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-28
---

# ⚠️ Risk Register: Repro

> **Nguồn sự thật**: [RQ.md](../999-Resources/RQ.md) §20 (17 mục risk có mitigation) và §21 (Risk Matrix, bảng 18 dòng). Mục 3 lấy từ [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md). Mục 4 là các mâu thuẫn nội tại của chính `RQ.md`.

> **Bốn họ định danh rủi ro trong tài liệu này — đừng trộn:**
> - **`R-01`…`R-18`** (§2) — 18 risk **nguyên bản** của `RQ.md §21`.
> - **`C-01`…`C-05`** và **`C-0N-r`** (§4, §4.1) — rủi ro sinh từ **mâu thuẫn nội tại** của `RQ.md`, và rủi ro phát sinh từ quyết định `D1`/`D2` giải các mâu thuẫn đó.
> - **`GATE-0N-r`** (§4.2) — rủi ro sinh từ **năm quyết định gate** `GATE-01`…`GATE-05` ngày 2026-08-14.
> - **`TL-r1`…`TL-r6`** và **`TL-b1`/`TL-b2`** (§4.4) — rủi ro của **chính kế hoạch thực thi**, và hai blocker lộ ra khi lập [Timeline-Repro](./Estimates/Timeline-Repro.md) ngày 2026-08-15. **Đây là họ duy nhất KHÔNG nói về sản phẩm** — nó nói về *khả năng làm ra sản phẩm đó*.

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

- **R-01 — Insufficient execution capture.** §20.1 liệt kê 9 lớp hidden input mà Repro **không** capture. Mitigation của §20.1 là *"Limit the MVP to a clearly defined class of deterministic request/response executions"*. Đã được cụ thể hoá thành **Supported Execution Class ($S1$–$S7$)** trong `Spec-Spike-Protocol §2`. **Bằng chứng thực nghiệm Phase 0 ([Report-Spike-Phase-0.md](../035-QA/Reports/Report-Spike-Phase-0.md))**: Đạt **`21/21 = 100.0%`** replays matched trên $D = 7$ ($7/7$ scenarios in-class), chỉ số Composite Fail-Closed **`7/7` ($100.0\%$)**, chứng minh lớp capture hiện tại đủ để tái tạo tất định lớp bug in-class.
- **R-02 — Replay non-determinism.** Kiểm soát thông qua cơ chế **Known-Missing-Input Manifest** (11 files niêm phong git commit `15c462e086...`). **Bằng chứng thực nghiệm Phase 0**: Tách bạch chính xác giữa in-class ($7/7$ matched) và các nguồn non-determinism ngoài phạm vi (`SC-7` PRNG, `SC-9` Async tail, `SC-10` Concurrency race) $\to$ $3/3$ lượt phân kỳ ổn định tại đúng ranh giới thiết kế gán nhãn `out-of-scope-determinism`, probe `SC-11` gán nhãn `incomplete-capture` (Redis gap), tỷ lệ phân kỳ chưa quy được nguyên nhân (**`unattributed`**) = **`0.0%`**.
- **R-03 — False replay equivalence.** Mitigation là Execution Verification (§10). Đã xây dựng **Verification & Diff Engine** với rubric 2 tầng ([Spec-Spike-Protocol §3](../030-Specs/Spec-Spike-Protocol.md)), phân biệt rạch ròi giữa *"Replay completed"* với *"Execution matched"*. **Bằng chứng thực nghiệm Phase 0**: Toàn bộ $21/21$ replays trên $D=7$ đều được xác thực khớp tuyệt đối chuỗi interaction boundary và kết cục lỗi, loại bỏ hoàn toàn hiện tượng false replay equivalence trên tập in-class.
- **R-04 — Side effects.** Mitigation §20.4 là default-deny write. Đã chuyển đổi từ denylist sang **allowlist fail-closed hai lớp** (`SEC-032`/`SEC-033`). **Bằng chứng thực nghiệm Phase 0**: Quan sát độc lập qua **Canary Sink** (`canary-net`, `canary-db`) xác nhận **`escaped_side_effects = 0`** kết nối thoát ra ngoài trên toàn bộ 33 lượt replay + ma trận 12 test $T1\text{-}T12$. Khoảng hở đo được tại test $T8\text{-}a$ (`child_process` gọi `curl`) đã có giải pháp $T8\text{-}b$ (Node.js `--permission`) được kiểm chứng sẵn sàng cho V0.1.
- **R-06 — Security exposure & Isolation.** Kiểm chứng thông qua thủ tục **Destroy original environment** trước mỗi lần replay. **Bằng chứng thực nghiệm Phase 0**: Công cụ độc lập `repro-spike-destroy-verifier` xác nhận $10/10$ kịch bản đạt `destroy_clean: true`, chứng minh capsule hoàn toàn self-contained và portable mà không cần truy cập lại production.
- **R-08 — Developer adoption.** §20.14 nêu đích danh hai câu giết sản phẩm: *"Another observability SDK"* và *"This looks complicated to install"*. Đây là risk **product**, không phải risk kỹ thuật — và nó ràng buộc mọi quyết định kiến trúc (xem [ADR-007](../030-Specs/Architecture/ADR-007-In-Process-SDK-Interception.md)).
- **R-10 — Production overhead.** §20.7 đặt nguyên tắc: *"Repro must never become the reason production becomes slower or fails."* **Bằng chứng thực nghiệm Phase 0 ([Perf-Spike-Phase-0.md](../035-QA/Performance/Perf-Spike-Phase-0.md))**: Latency overhead trên luồng thành công ($P\text{-discard}$, $95\%$ traffic) chỉ **`+1.62%`** (so với hypothesis $< 5\%$), CPU delta **`+2.15%`**, Memory Peak RSS **`45.2 MB`** ($14.1\%$ limit $320\text{MB}$), zero CPU throttling, zero OOM kill.
- **R-09 — Race conditions.** Là risk 🔴 Critical duy nhất mang `MVP? = No`. §20.13 chủ động hoãn. **Hệ quả đã được kiểm chứng thực nghiệm**: Scenario `SC-10` phân kỳ $3/3$ lượt, xác nhận đúng ranh giới hoãn của V0.1.
- **R-14 / R-15 — Replay boundary & Capsule size.** **Bằng chứng thực nghiệm Phase 0**: Kích thước capsule trung bình đạt **`2,042 bytes`** ($0.0019\text{ MB}$), P95 đạt **`2,448 bytes`** ($N=33$), nhỏ hơn rất nhiều so với hypothesis $10\text{ MB}$. Hoàn tất Thí nghiệm Cắt Offline `SEC-008` (70 replays) xác thực cơ chế truncate an toàn.
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
| Ngưỡng row/byte cap (`SEC-008`) | **Thiếu dữ kiện** | Tự giải khi technical spike §22 chạy | ✅ **ĐÃ CÓ PHÂN BỐ & KẾT QUẢ CẮT TỪ SPIKE PHASE 0 (2026-08-28)** — Bảng T5 Report-Spike-Phase-0 cấp phân bố $N=13$ queries và 70 replays cắt offline, đóng ở dạng `HYPOTHESIS` (xem [Threat-Model §11.b](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md)) |
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
| **C-03** | **Redis có trong MVP capture không?** | §5 (execution chain có "Cache Reads", "Redis → Result B"), §13 ("Cache read" ở nhóm READ), §17 (Recorder box liệt kê Redis), §22 (test app có Redis) | §18 (MVP capture list **không có** Redis), §26 (đặt Redis ở **V0.3**) | Nếu đọc theo phía A thì MVP phình thêm một loại dependency chưa được đặt tên trong scope | **PM đã chốt**: Redis **ngoài V0.1**. Phát biểu phạm vi tường minh (§18, §26) thắng sơ đồ minh hoạ (§5, §17). *Ghi chú: sơ đồ §17 của `RQ.md` cần sửa cho khớp.* Xem [Roadmap](./Roadmap.md).<br>⚠️ **HỆ QUẢ CHƯA ĐƯỢC GHI KHI CHỐT `C-03` — phát hiện 2026-08-15 (`GAP-Redis`)**: nếu execution phụ thuộc cache state, thì sau bước destroy environment của §22 **không còn Redis để đọc** ⇒ replay với một input không được ghi lại. Redis **không** nằm trong 9 hidden input §20.1 — nó ở **trục khác**: dependency được đặt tên tường minh mà §18 **chủ động** không capture ⇒ không cơ chế nào của Phase 0 tự bắt được.<br>✅ **ĐÃ CHỐT cùng ngày — quyết định `G1` của `@TrisJr`**: chọn **(c) + phần định nghĩa của (a)** — test app vẫn đủ 5 dependency nhưng **Redis không ảnh hưởng kết cục**, đồng thời `ACG-07` ghi *"execution phụ thuộc cache state nằm ngoài Supported Execution Class"*. Lý do: phương án capture Redis throwaway sẽ **đo hệ 9 nhóm để gate sản phẩm 8 nhóm** ⇒ bằng chứng không chuyển giao được, và khuyết điểm đó **vô hình** trong báo cáo.<br>📌 **Hai đính chính đối với mô tả `GAP-Redis` ban đầu**, do analysis fan-out tìm ra và PM đã verify nguyên văn `RQ.md`: (`F1`) §22 **không** bắt mỗi request chạm cả 5 dependency — ràng buộc đó đến từ exit criteria `B1` của Timeline, tức **artifact dự án sửa được**, không phải nguồn sự thật; (`F2`) **không scenario nào trong 10** lấy Redis làm tác nhân gây lỗi. Chi tiết: [Timeline §3](./Estimates/Timeline-Repro.md) · [findings/architect](./pm-runs/2026-08-15-p0a-spike-protocol/findings/architect.md).<br>⚠️ **`GAP-Redis` không phải ca cá biệt** — **process state** (module-level cache, memoization, độ ấm của pool) là **cùng lớp vấn đề**, chỉ khác là nằm **trong** process, và nó thuộc nhóm **không có cơ chế phát hiện nào** |
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
> **Định danh** dùng họ `GATE-0N-r`, cố ý **khác** họ `C-0N-r` ở §4.1 (rủi ro sinh từ *mâu thuẫn nội tại* của `RQ.md`) và khác họ `R-01`…`R-18` ở §2 (18 risk nguyên bản của `RQ.md §21`). Ba họ, ba nguồn gốc khác nhau — đừng trộn. *(Họ thứ tư — `TL-*` — sinh sau, ngày 2026-08-15; xem [§4.4](#44-rủi-ro-sinh-từ-timeline--wbs-2026-08-15).)*
>
> Bản ghi quyết định gốc: [pm-runs/2026-08-14-gates-g1-g5/escalations.md](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) **E-01** và **E-02**.

| ID | Rủi ro | Severity | Sinh từ | Vì sao — và nó chặn cái gì |
|---|---|:---:|---|---|
| **`GATE-01-r`** | **`Go` không tự làm cho spike đo được** | 🔴 Critical | `GATE-01` | Bật Phase 0 giải quyết câu *"có đầu tư hay không"*, **không** giải quyết câu *"chạy xong thì kết luận thế nào"*. **Tiến độ giải quyết (2026-08-28)**: Phase `P0-A` đã cung cấp khung Protocol với 4 hypothesis (`ACG-01/02/03/07`), và Phase `P0-C` ([Report-Spike-Phase-0.md](../035-QA/Reports/Report-Spike-Phase-0.md)) đã **đo lường thành công 100% trên $D=7$ (Composite 7/7)**. Rủi ro này đã được **hóa giải hoàn toàn về mặt kỹ thuật thực nghiệm**, sẵn sàng cung cấp cơ sở dữ liệu vững chắc cho Sponsor `@TrisJr` ra quyết định tại `GATE-06`. |
| **`GATE-03-r`** | **11 ADR mang `Accepted` trong khi bên trong còn 6 unknown chưa giải** | 🔴 Critical | `GATE-03` | `Accepted` xác nhận **hướng quyết định**, nhưng mục `Open items` của các ADR đó vẫn giữ `U-01` (cơ chế chặn driver `pg`), `U-02` (query matching identity — [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) gọi là *"rủi ro hiện thực cao nhất"*), `U-03`, **`U-04`** (*"unknown lớn nhất tài liệu"*), `U-13`, `U-20` — tất cả `TBD` hoặc disposition `SPIKE`. **Rủi ro thật**: người hiện thực và tài liệu hạ nguồn đọc `Accepted` như *"mọi thứ trong ADR này đã chốt"*. **Mitigation đã thi hành**: mỗi ADR mang callout tường minh *"`Accepted` KHÔNG đóng `Open items`"* |
| **`GATE-04-r`** | **Sàn Capsule Store đã đóng nhưng không vận hành được** | 🟠 High | `GATE-04` | `GATE-04` chốt *cái gì phải có*; **cơ chế** authn/authz **vẫn `TBD`** ([SDD §5.4](../030-Specs/Architecture/SDD-Repro.md)), và **`GAP-04` còn nguyên** — §18 không có một CLI verb nào để cấu hình authz, đọc audit log, hay kiểm tra retention. Sàn tồn tại trên giấy mà không ai có lệnh để chạm vào nó. Là **cùng một gap** với `C-02-r`, không phải rủi ro trùng lặp: `C-02-r` nói *gap tồn tại*, `GATE-04-r` nói *quyết định sàn đã không đóng nó* |
| **`GATE-05b-r`** | **"Replay không cần kết nối mạng" thôi là bất biến** | 🟠 High | `GATE-05b` | Crypto-shredding đòi khoá giữ phía server ⇒ replay **cần** liên hệ server để lấy khoá. Va trực tiếp vào ba chỗ: [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) (capsule **self-contained** — kết luận của `C-05` ở §4.1), [SDD §4.9](../030-Specs/Architecture/SDD-Repro.md), và `§33.6 Safe by default`. **Cũng làm yếu bước *"Destroy original environment"* của §22** — nếu "environment" bao gồm key server thì capsule không giải được, và phép thử portable của spike mất một phần ý nghĩa. Đây là **đánh đổi được chấp nhận có ý thức**, không phải phát hiện muộn |
| **`GATE-05b-r2`** | **`U-06d` (key custody) từ open item phụ thành BLOCKER** | 🔴 Critical | `GATE-05b` | Quyết định *"crypto-shredding là `MUST-V0.1`"* **chỉ có giá trị khi có nơi giữ và xoá khoá**. Không có key management thì: (a) crypto-shred không thực thi được ⇒ `TB-4` **vẫn** bất khả hồi dù tài liệu nói đã mitigated; (b) mất khoá = mất **toàn bộ** capsule, kể cả capsule còn trong hạn — một chế độ hỏng **mới**, không tồn tại trước quyết định này; (c) **hành vi CLI cũng bị chặn** — `repro inspect` nay phải phân biệt *khoá đã bị phá có chủ đích* (hết retention) với *khoá tạm không với tới được* (sự cố vận hành), tức **bốn** tình huống thay vì ba, và hành vi đó chưa có nguồn. `U-06d` hiện là `TBD` ở [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`.<br>**Owner**: **`@TrisJr`** — cấp tại đây, không tại `ADR-009`. Hai writer độc lập (`architect`, `business-analyst`) đều báo `PARTIAL` vì đúng mục này và **đúng khi từ chối tự gán owner**: `GATE-01` cấp owner cho **18 risk gốc của §21**, không cấp cho open item kỹ thuật. PM cấp ở tầng rủi ro theo cùng logic dự án-một-người của `GATE-01`.<br>**Điều kiện đóng**: có thiết kế key management (nơi giữ · luân chuyển · xoá · quy trình mất khoá) **trước khi** capsule format v1 đóng băng |

### 4.2.1 Ba mục KHÔNG bị đóng hộ bởi năm quyết định

Ghi tường minh để không ai đọc lệch — năm gate **không** chạm tới ba mục dưới đây, và chúng vẫn là chỗ hở nghiêm trọng nhất của bộ tài liệu:

| Mục | Trạng thái sau Phase P0-C (2026-08-28) | Tiến độ thực nghiệm đã đạt | Nay được lên lịch ở đâu |
|---|---|---|---|
| **`N-05`** — ngưỡng Execution Match Rate | **Đã có số đo thực tế 100% in-class ($D=7$)** · Ngưỡng cam kết V0.1 giữ `TBD` | Đạt **`21/21 = 100.0%`** replays matched trên $D=7$; Composite **`7/7`** ($100.0\%$) | **`D1`** (`W10`, ngay sau `GATE-06`) — 🎩 PM + 👤 `@TrisJr`. **Cũng là điều kiện gỡ `GATE-02`** |
| **`U-04` / `ACG-01`** — *"sufficiently equivalent"* | **Đã có Rubric 2 tầng và kiểm chứng 100%** | Rubric 2 tầng $Spec\ \S3$ vận hành thành công $100\%$ trên $33$ replays, phân loại $0\%$ unattributed | **`D2`** (nâng cấp thành định nghĩa sản phẩm chính thức) — 🏗️ Architect + 🕵️ BA |
| **`ACG-07`** — *"Supported Execution Class"* | **Đã có khung $S1$–$S7$ và kiểm chứng trên $D=7$** | $7/7$ scenarios thoả mãn $S1$–$S7$ đạt $100\%$ matched $K=3$ | **`D2`** (nâng cấp thành định nghĩa sản phẩm chính thức) — 🏗️ Architect + 🕵️ BA |
> [!IMPORTANT]
> **Cột thứ tư KHÔNG đóng ba mục này** — nó chỉ trả lời câu *"bao giờ và ai"*. [Timeline-Repro](./Estimates/Timeline-Repro.md) nói thẳng điều đó: timeline **không** đóng blocker, nó *cấp cho mỗi mục một task, một chủ và một thời điểm*. Cả ba vẫn `TBD` cho tới khi task tương ứng thoả `Exit criteria`.
>
> **Mục thứ tư cùng loại — `U-06d` (key custody)** — nằm ở [§4.2](#42-năm-rủi-ro-mới-sinh-từ-năm-quyết-định-gate-2026-08-14) dưới định danh `GATE-05b-r2` chứ không ở bảng này, vì nó **do gate sinh ra** chứ không phải mục gate bỏ sót. Nay được lên lịch ở **`D4`** — **chạy song song được** với `D1`–`D3`, và **phải đóng trước `D5`** (đóng băng capsule format v1).

### 4.3 Vì sao C-01 và C-02 được đối xử khác C-03/C-04/C-05

C-03, C-04, C-05 có **neo văn bản đủ mạnh để PM tự phân xử**: một phía là phát biểu phạm vi tường minh, phía kia là sơ đồ minh hoạ hoặc chỗ thiếu sót — chọn được mà không đổi định nghĩa sản phẩm.

C-01 và C-02 thì không. C-01 đổi **định nghĩa thành công** của sản phẩm; C-02 đổi **mô hình kinh doanh** và có hệ quả bảo mật trực tiếp. Cả hai đều được **hai lens phân tích độc lập tìm ra** — mức bằng chứng cao nhất run tài liệu này có. Vì vậy chúng được ghi trung thực cả hai phía kèm đề xuất và **đẩy lên cho anh quyết**, thay vì để một writer im lặng chọn một phía. Anh đã chốt cả hai ngày **2026-08-14** — xem §4.1.

> **Ba mâu thuẫn còn lại (C-03, C-04, C-05) giữ nguyên cách xử lý cũ** — chúng do PM phân xử ở tầng 2 và không nằm trong quyết định ngày 2026-08-14.

### 4.4 Rủi ro sinh từ Timeline & WBS (2026-08-15)

> **Vì sao họ này tách riêng — và vì sao nó khác hẳn ba họ trên.** `R-*`, `C-*` và `GATE-0N-r` đều nói về **sản phẩm**: nó có capture đủ không, nó có lộ dữ liệu không, quyết định gate có mặt trái gì. Họ `TL-*` nói về một thứ khác hẳn: **khả năng thực thi kế hoạch làm ra sản phẩm đó**. Một dự án có thể đúng về mặt kỹ thuật ở mọi risk trên mà vẫn chết vì họ này.
>
> Nguồn: [Timeline-Repro §12](./Estimates/Timeline-Repro.md). **Từ 2026-08-15, tài liệu này là nguồn có thẩm quyền** cho `TL-*`; bảng ở §12 của Timeline là bản tóm tắt cho người đọc timeline — lệch nhau thì Risk-Register thắng.
>
> **Owner**: **`@TrisJr`** cho toàn bộ họ, theo đúng logic dự án-một-người của `GATE-01`. Ghi thẳng cái nghịch lý ở đây: `TL-r2` nói *một người giữ mọi vai thì không có phản biện độc lập*, và người giữ rủi ro đó cũng chính là người đó. **Không có cách nào tự giải quyết bằng tài liệu** — chỉ giải được bằng một người thứ hai.

#### 4.4.1 Sáu rủi ro của chính kế hoạch

| ID | Rủi ro | Severity | Vì sao — và nó chạm vào cái gì | Giảm nhẹ / đóng ở đâu |
|---|---|:---:|---|---|
| **`TL-r1`** | **Ước lượng MD không có dữ liệu lịch sử đứng sau** | 🟠 High | Repo **chưa có một dòng code sản phẩm**, không có velocity, không có baseline. Toàn bộ **41.5 MD** của Phase 0 và **~229.5 MD** phần `CONDITIONAL` là **phán đoán chuyên môn**, không phải ước lượng có cơ sở thống kê | ⚠️ **Hai lần điều chỉnh trong cùng ngày 2026-08-15 — và lần 2 chính là bằng chứng cho rủi ro này.**<br>**Lần 1**: giãn Phase 0 thành **9 tuần**, đệm là tuần `W7` ⇒ capacity 104% → 92%.<br>**Lần 2** *(vài giờ sau)*: analysis fan-out tìm ra **~4.5 MD phạm vi thật chưa được đếm** trong `P0-A` ⇒ **đệm `W7` bị tiêu hết**, Phase 0 phải giãn tiếp thành **10 tuần** (46 MD / 50 = 92%), `GATE-06` dời sang **`W10` = 2026-10-23** (`G4`).<br>⇒ **Đệm mua được đúng MỘT lần trượt, và nó đã được tiêu ngay trong ngày mua.** Rủi ro **không** bị đóng. **Hiệu chỉnh toàn bộ ước lượng sau `P0-B` vẫn là BẮT BUỘC**; trước đó mọi con số MD phải đọc là *bậc độ lớn*, không phải cam kết.<br>📌 Ghi chú phân biệt: ~4.5 MD đó **không phải scope creep** — nó là phạm vi vốn đã tồn tại nhưng chưa ai đếm, chỉ lộ ra khi bốn lens đọc kỹ nguồn. Đây là biểu hiện điển hình của *"ước lượng không có dữ liệu lịch sử"* |
| **`TL-r2`** | **Solo capacity ⇒ không có phản biện độc lập tại gate** | 🔴 Critical | Kế thừa trực tiếp [Charter §5.1](./Charter-Repro.md). `TL-A2` cho thấy mọi cột `Driver`/`Collaborators` của Timeline là **vai**, không phải người khác nhau. ⇒ tại `GA`, `GATE-06`, `D10`, `P4-8`, người trình bày bằng chứng và người phán quyết là **một người**. Agent role giảm nhẹ nhưng **không thay thế được một người có quyền nói *không*** | **Không đóng được bằng tài liệu.** Giảm nhẹ hiện có: quy trình `pm-runs` bắt buộc PM ghi **phản biện** vào `escalations.md` **trước** khi `@TrisJr` quyết. Đóng thật chỉ khi có người thứ hai — khi đó Charter §5.1 phải chia lại vai **trước tiên** |
| **`TL-r3`** | **Phạm vi V0.1 vượt capacity ~76%** | 🟠 High | `P2` cần **~158 MD** nhưng cửa sổ `W16–W33` chỉ chứa **~90 MD** (18 tuần × 5 MD). Theo `TL-A2`, V0.1 ở phạm vi hiện tại cần **~32 tuần thuần**, không phải 18. Đây là **bằng chứng định lượng cho `R-08`**: quyết định `D2` đưa authn/authz/audit vào OSS core làm tăng phạm vi V0.1 — đúng điều §4.1 đã cảnh báo | **Phải quyết tại `D10`**, không được để trôi vào sprint rồi mới phát hiện. Ba lựa chọn đã nêu ở [Timeline §7](./Estimates/Timeline-Repro.md): kéo dài tới `~W47` · thu hẹp phạm vi (va vào `C-02`) · tăng capacity (va vào `TL-r2`).<br>⚠️ **Đệm của Phase 0 KHÔNG chạm tới rủi ro này** — nó bảo vệ `GATE-06`, không bảo vệ `P2` |
| **`TL-r4`** | **Code spike bị tái dùng thầm lặng cho V0.1** | 🟠 High | `RQ.md §39` nói **không** bắt đầu bằng việc xây nền tảng đầy đủ; `§22` nói spike **không phải** để xây sản phẩm. Toàn bộ code `P0-B` là `throwaway`. Rủi ro là nó **âm thầm** tiến hoá thành V0.1 vì *"đằng nào cũng chạy được rồi"* — mang theo mọi shortcut được phép ở spike vào code chạy **in-process trong production của người khác** | Kiểm soát: branch bắt buộc mang tiền tố **`spike/`**; mọi lần tái dùng phải là **quyết định tường minh tại `P1`**, không phải mặc định |
| **`TL-r5`** | **`LG3` có lead time bên ngoài, không rút ngắn được bằng effort** | 🟠 High | Chờ luật sư **2–6 tuần** — loại trễ mà **làm việc chăm hơn không rút ngắn được**. `LG3` không nằm trên đường kỹ thuật nên **trông như việc phụ**, nhưng nó **chặn `P4`**. Bắt đầu muộn ⇒ `P4` trượt dù toàn bộ phần kỹ thuật đúng hạn | PM theo dõi track `LG` bằng **ngày trên lịch**, **không** bằng MD. `LG3` khởi động ngay khi `D4` xong, không đợi `P2`.<br>**Phân biệt với `TL-b2`**: `TL-b2` là *chưa có ý kiến pháp lý* (trạng thái), `TL-r5` là *thời gian lấy ý kiến đó không kiểm soát được* (lịch). Đóng `TL-b2` cần `TL-r5` được quản đúng, nhưng chúng **không trùng nhau** |
| **`TL-r6`** | **`P4` phụ thuộc lịch của tổ chức khác** | 🟠 High | 12 tuần của `P4` chỉ chứa **21.5 MD** — phần còn lại là **chờ**: design partner chạy production theo lịch của họ. Phase này **không lấp đầy được bằng cách làm nhanh hơn**. Nếu partner rút lui, Timeline **không có phương án thay thế**. Đây là mặt vận hành của `R-08` (Developer adoption, 🔴 Critical) | **Tuyển dư**: nhắm **5** để có **3** (`P4-1`). Ngoài ra `P4-5` (competitive analysis) không phụ thuộc partner nên vẫn chạy được khi `P4` bị nghẽn |

#### 4.4.2 Hai blocker mới do Timeline phát hiện

> **Vì sao chúng chưa từng xuất hiện trong tài liệu nào trước 2026-08-15**: mọi tài liệu trước đó dừng phạm vi ở *phần mềm tồn tại*. Hai mục này chỉ lộ ra khi phạm vi được kéo dài tới **phát hành ra công chúng** và **cài vào production của tổ chức khác** — hai việc mà `RQ.md` không mô tả quy trình.

| ID | Blocker | Severity | Chặn cái gì | Không được nhầm với | Đóng ở |
|---|---|:---:|---|---|---|
| **`TL-b1`** | **Chưa chọn license OSS** | 🟠 High | Chặn `R5` (OSS launch) — không phát hành khi chưa có `LICENSE`. Và là **quyết định một chiều**: đổi license sau khi đã có contributor bên ngoài cần **sự đồng ý của mọi người đã đóng góp**. License chọn trước sẽ **giới hạn** mô hình thương mại §28 về sau | **`R-17`** (OSS business model, 🟡 Medium/Later) nói *"định nghĩa mô hình thương mại **sau** khi validate adoption"*. `TL-b1` là chuyện khác và **sớm hơn**: license phải chọn **trước khi phát hành dòng code đầu tiên**, tức trước `R-17` rất lâu. Chọn sai ở `TL-b1` sẽ **đóng cửa** một phần không gian quyết định của `R-17` | **`LG1`** — 🎩 PM + 👤 `@TrisJr`. Đứng **đầu** track `LG`, phải quyết **trước `LG2`** |
| **`TL-b2`** | **Pháp chế chưa rà TTL 30 ngày + GDPR right-to-erasure** | 🟠 High | Chặn `P4` — **không** đưa `@repro/node` vào production của tổ chức có nghĩa vụ GDPR khi TTL mặc định chưa qua pháp chế. Đóng cảnh báo #2 của [Charter §5.1](./Charter-Repro.md): *"trước khi Repro xử lý dữ liệu production của tổ chức có nghĩa vụ GDPR, con số này **phải** được pháp chế rà lại"* | **`GATE-05a`** đã chốt **30 ngày** và chặn được nhánh xấu *"TTL vô hạn"* — nhưng đó là quyết định **kỹ thuật**, **không phải kết luận tuân thủ**. Cũng không nhầm với **`THREAT-016`**: threat đó hỏi *capsule có xoá được không*, `TL-b2` hỏi *xoá kiểu đó có thoả right-to-erasure về mặt pháp lý không* — crypto-shredding có thể đúng kỹ thuật mà vẫn không đủ pháp lý | **`LG3`** — 🛡️ Security + 👤 `@TrisJr` + **luật sư bên ngoài**. Phụ thuộc `D4` (cần biết crypto-shredding thực thi thế nào) |

> [!WARNING]
> **`TL-b1` và `TL-b2` đều KHÔNG đóng được bằng effort của `@TrisJr`.** `TL-b1` là quyết định một chiều cần cân nhắc hệ quả thương mại dài hạn; `TL-b2` cần **một vai chưa tồn tại trong dự án** — [Charter §5.1](./Charter-Repro.md) ghi pháp chế là **❌ KHÔNG CÓ**. Đây là **vai đầu tiên timeline yêu cầu bổ sung từ bên ngoài**, và cũng là lý do track `LG` phải khởi động song song `P1` thay vì đợi tới lúc phát hành.

---

## 5. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [RQ.md](../999-Resources/RQ.md) | Nguồn sự thật gốc — §20, §21 |
| [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Chi tiết 19 threat, residual risk, và 11 threat chưa có mitigation |
| [Charter-Repro](./Charter-Repro.md) | Bối cảnh và điều kiện dừng đầu tư |
| [Roadmap](./Roadmap.md) | Phân phase và Non-Goals |
| [Estimates/Timeline-Repro](./Estimates/Timeline-Repro.md) | **Nguồn của §4.4** — WBS, critical path, capacity. Cũng là nơi **lên lịch** cho ba mục §4.2.1 (`A2`/`A3` → `D2`, `D1`) và `U-06d` (`D4`) |
| [PRD-Repro](../020-Requirements/PRD-Repro.md) | Open Questions, Success Metrics, Validation Hypotheses |
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | Acceptance criteria gaps (`ACG-01`…`ACG-12`) |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | TBD register (`U-01`…`U-25`) và traceability risk → component |
| [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) | Bản ghi gốc năm quyết định `GATE-01`…`GATE-05` (**E-01**) và năm rủi ro phát sinh (**E-02**) |
