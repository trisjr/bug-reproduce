---
id: UC-05
type: use-case
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 🎬 UC-05 — Browse And Inspect Capsules

**Nguồn sự thật**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm `§N`. Chỗ `RQ.md` không định nghĩa hành vi ⇒ ghi `TBD` và nói rõ thiếu nguồn.
**Hợp đồng FR**: [PRD-Repro](../PRD-Repro.md) mục 5.7.

---

## 1. Mục tiêu

Cho người dùng **duyệt** danh sách capsule khả dụng và **xem nội dung** của một capsule cụ thể — biết chính xác production execution đó đã nhìn thấy những input nào — **mà không cần chạy replay**.

Neo nguyên tắc `N-13` / §33.5 (*Determinism over magic*):

> **The system should explain exactly what was captured and replayed.**

UC này là hiện thân trực tiếp của nguyên tắc đó ở phía **"cái gì đã được capture"**. §40 mô tả capsule là *"everything needed to understand the execution"* — nhưng một artifact không đọc được thì không giúp ai hiểu gì.

**Ba tình huống dùng**:

1. Chọn capsule để pull trước khi replay ([UC-02](./UC-02-Replay-Capsule-Locally.md) bước 1).
2. Kiểm tra một input cụ thể khi Execution Diff chưa đủ để kết luận ([UC-03](./UC-03-Read-Execution-Diff.md)).
3. Xác nhận capsule có thật sự chứa đủ dữ liệu không, khi nghi ngờ incomplete capture ([UC-02](./UC-02-Replay-Capsule-Locally.md) `A5`, `A6`).

---

## 2. Actor

| Vai | Trách nhiệm trong UC này | Trạng thái ở V0.1 |
|---|---|---|
| **Software Engineer** (primary) | Duyệt, chọn, đọc nội dung capsule để phục vụ debug | ✅ Hoạt động đầy đủ |
| **QA Engineer** (secondary) | Đọc capsule để hiểu điều kiện tái hiện của một bug | ⚠️ **Giá trị hạn chế ở V0.1** — xem ghi chú dưới |
| **Capsule Store** (system actor) | Trả danh sách capsule và nội dung capsule, sau khi kiểm tra quyền và giải mã | ✅ **Sàn tối thiểu đã chốt** (`U-06`, `GATE-04`) · ⚠️ **cơ chế** authn/authz vẫn `TBD` |

> ⚠️ **Về QA Engineer** (quyết định **E10**): `RQ.md` **không có** section "Target users"; ba nhóm người dùng chỉ xuất hiện đúng một lần ở **dòng 7 frontmatter**. QA Engineer là persona **mỏng nhất**, và toàn bộ nội dung của nó neo vào **regression test generation** — thứ §26 đặt ở **V0.2** (**M1 ✅ đã chốt 2026-08-14: giữ V0.2**, nên persona này **xác định là activated at V0.2**). ⇒ Ở V0.1, QA Engineer **có thể** đọc capsule qua UC này, nhưng chưa có luồng công việc nào biến việc đọc đó thành output. Chi tiết: [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 5.

> ⚠️ **Về Capsule Store** (`U-06`, [PRD-Repro](../PRD-Repro.md) mục 10.5): `repro list` (§18) và `repro pull` (§8) **hàm ý** tồn tại một store ở xa có API và có auth; §20.6 vẽ *"Private Storage"*; §28 xếp *"Basic Self-hosting"* vào OSS core. Nhưng `RQ.md` **không có một dòng đặc tả nào**: không API, không auth, không storage backend, không mô hình triển khai. UC này phụ thuộc trực tiếp vào thành phần đó.

> ✅ **`CHỐT GATE-04 — 2026-08-14` — sàn tối thiểu của Capsule Store đã chốt.** Mệnh đề về `RQ.md` ở trên **giữ nguyên** (nó vẫn đúng: đặc tả đến **từ ngoài** `RQ.md`). Sàn gồm: **object/file storage + một index + hook authn/authz/audit**, kèm 3 thao tác tối thiểu theo `SDD §5.4`.
>
> **Ý nghĩa cho UC này**: bước 1 (`repro list`) đã có căn cứ — **index** là thành phần bắt buộc của sàn, nên việc liệt kê capsule không còn dựa trên một thành phần chưa tồn tại trên giấy. Bước 4 (kiểm quyền + audit) đã có **chỗ để cắm** vì hook authn/authz/audit thuộc sàn.
>
> **Cái vẫn `TBD`**: **cơ chế** authn/authz cụ thể và **mô hình quyền** (user / team / role) — `GATE-04` chốt *cái gì phải có*, **không** chốt *làm bằng cách nào*. Owner: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế tại [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) §5.4 và [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `D3`. Rủi ro **`GATE-04-r`** tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.

---

## 3. Trigger

Một trong ba:

| # | Trigger | Nguồn |
|---|---|---|
| T1 | Developer muốn xem có capsule nào khả dụng | §18 (`repro list`) |
| T2 | Developer nhận thông báo `Repro Capsule available` cho một incident | §8 Step 1 |
| T3 | Developer cần kiểm tra nội dung capsule khi replay hoặc diff cho kết quả khó hiểu | §9, §10 |

---

## 4. Preconditions

| # | Điều kiện | Nguồn § | FR |
|---|---|---|---|
| P1 | Ít nhất một capsule đã tồn tại — [UC-01](./UC-01-Capture-Failed-Production-Execution.md) đã chạy | §6, §17 | `FR-017` |
| P2 | Người dùng có **quyền truy cập** capsule (strict access control) | §20.5 | `FR-025` |
| P3 | Người dùng có **key giải mã** capsule (encryption at rest) | §16 | `FR-021` |
| P4 | Capsule **chưa hết retention** — mặc định **30 ngày** kể từ lúc capture (`✅ CHỐT GATE-05a — 2026-08-14`), cấu hình được | §20.5, §20.17; giá trị mặc định từ `GATE-05a` | `FR-024` |
| P5 | CLI đã cài ở máy người dùng | §18, §33.2 | `FR-053` |

---

## 5. Main success flow

| # | Bước | Lệnh / Actor | Nguồn § | FR |
|---:|---|---|---|---|
| 1 | Người dùng liệt kê capsule khả dụng | `repro list` | §18 | `FR-047` |
| 2 | Người dùng **chọn** một capsule theo id (vd. `1842`) | Người dùng | §8, §18 | — |
| 3 | Người dùng xem nội dung capsule | `repro inspect 1842` | §18 | `FR-049` |
| 4 | Hệ thống kiểm tra quyền (`FR-025`), giải mã (`FR-021`), ghi **audit log** truy cập (`FR-026`), rồi hiển thị nội dung capsule theo cấu trúc §6 | Capsule Store + CLI | §6, §16, §20.5, §20.17 | `FR-021`, `FR-025`, `FR-026`, `FR-049` |

**Nội dung capsule hiển thị ở bước 4** — theo đúng cấu trúc §6:

```text
repro-1842/
├── manifest.json
├── request.json
├── environment.json
├── feature-flags.json
├── database/
│   ├── query-001.json
│   └── query-002.json
├── network/
│   ├── tax-api.json
│   └── payment-api.json
└── metadata.json
```

§6 liệt kê những gì một capsule **có thể** chứa:

| Nhóm | Nội dung (§6) | FR capture tương ứng |
|---|---|---|
| Request | original request | `FR-003` |
| Database | relevant database query results | `FR-005` |
| Network | external API responses | `FR-006` |
| Feature flags | feature flag state | `FR-007` |
| Environment | relevant environment metadata | `FR-010` |
| Metadata | timestamps · application version · Git commit · runtime information | `FR-008`, `FR-009`, `FR-010` |

> ⚠️ **`RQ.md` không đặc tả output của `repro inspect`.** §18 chỉ liệt kê lệnh này trong danh sách 6 verb và **không có** ví dụ output nào (khác với `replay` ở §8/§25, `verify` ở §8/§25, `diff` ở §9 — cả ba đều có ví dụ). Bảng trên là suy ra từ **cấu trúc capsule §6**, không phải từ đặc tả lệnh. Định dạng cụ thể (cây thư mục? bảng? JSON? phân trang?) ⇒ **`TBD`**.

> **Ràng buộc `FR-053` / §33.2**: CLI là **primary interface**. V0.1 **không** yêu cầu dashboard để duyệt capsule — §25 nói thẳng demo phải hiểu được *"without requiring a large dashboard or complicated infrastructure"*, và §19 xếp *"Large observability dashboard"* vào Non-Goals.

---

## 6. Alternative / Exception flows

### `A1` — Không có quyền truy cập

**Điều kiện kích hoạt**: người dùng gọi `repro list` / `repro inspect` mà không có quyền trên capsule đó.

**Căn cứ** — §20.5 (*Sensitive Production Data* — 🔴 **Critical**) liệt kê **strict access control** trong mitigation; §21 đánh `MVP? = Yes` cho dòng *Sensitive data*.

**Hành vi mong đợi**: từ chối truy cập, ghi audit log lần từ chối (`FR-025`, `FR-026`).

> ✅ **`A1` là hành vi ĐÃ ĐƯỢC QUYẾT ĐỊNH — M2 chốt 2026-08-14: authn + authz + audit log thuộc OSS core.** Trước đây `A1` treo lơ lửng vì `RQ.md` tự nói ngược (§28 xếp Access control vào commercial layer). Nay `A1` **tồn tại ở mọi bản, gồm bản OSS self-host** — nó là exception flow bắt buộc của V0.1, không phải hành vi chỉ có ở bản trả phí.

**`TBD` còn lại — quyết định M2 KHÔNG lấp phần này**: `RQ.md` **không đặc tả** mô hình quyền — không có khái niệm user, team, role, hay phạm vi quyền theo service/environment. Cụ thể chưa trả lời được: `repro list` hiển thị capsule mà người dùng **không** có quyền đọc (biết là tồn tại) hay ẩn hoàn toàn? Hai lựa chọn này có hệ quả rò rỉ metadata khác nhau.

#### **M2 — Access control: OSS core hay commercial layer?** — ✅ **ĐÃ CHỐT 2026-08-14: OSS core**

**Mâu thuẫn nội tại của `RQ.md`. Hai phía dưới đây giữ nguyên làm bằng chứng — `RQ.md` vẫn tự nói ngược ở chính những section này; quyết định chỉ ghi lại ta chọn phía nào.**

| Phía "commercial layer" | Phía "MVP core" |
|---|---|
| **§28** xếp **Access control**, **Retention policies**, **Team management**, **Enterprise security** vào *"Potential commercial layer"* | **§20.5** (🔴 Critical) liệt kê **strict access control** trong mitigation |
| **§28** cho OSS core chỉ có *"Basic Self-hosting"* | **§21** Risk Matrix đánh `MVP? = Yes` cho *Sensitive data* và *Security exposure* |
| | **§20.17** (Compliance) yêu cầu retention policies, deletion, **audit logs** |

**Hệ quả**:

> **Bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.**

Tổ chức làm đúng khuyến nghị §20.6 (*"Prefer: Production → Private Recorder → Encrypted Capsule → Private Storage rather than requiring production data to be sent to a public SaaS"*) sẽ nhận về một hệ thống chứa dữ liệu production nhạy cảm mà **không có authn/authz, không retention, không audit log**.

**Vì sao UC này là chỗ mâu thuẫn biểu hiện thành hành vi**: nếu access control thuộc commercial layer, thì `A1` **không tồn tại** ở bản OSS — tức **bất kỳ ai chạm được CLI đều đọc được mọi capsule production**, gồm PII, credentials, tokens, financial information (§20.5).

##### ✅ Quyết định — **ĐÃ CHỐT 2026-08-14**

**Authentication + authorization (access control) + audit log nằm trong OSS core**, **không** phải commercial layer — **ghi đè** phần §28 xếp *Access control* và *Retention policies* vào commercial layer. `FR-024`, `FR-025`, `FR-026` giữ nguyên là **MVP**. Giữ ở commercial layer theo §28: hosted storage · team management · analytics · AI analysis · cloud integrations.

**Lý do**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production**; thiếu audit thì tổ chức **kiểm soát được nhưng không chứng minh được**, trong khi §20.17 (🟠 High) yêu cầu audit log như mitigation.

**Hệ quả trực tiếp lên UC này**:

- `A1` là **exception flow bắt buộc của V0.1** ở mọi bản phân phối, gồm bản OSS. Kịch bản *"bất kỳ ai chạm được CLI đều đọc được mọi capsule"* **bị loại bỏ khỏi thiết kế**.
- Nhưng **mô hình quyền vẫn `TBD`** (xem khối `TBD` phía trên) — quyết định nói *phải có authz*, **không** nói *authz trông như thế nào*.
- §18 **không có một CLI verb nào** để vận hành authn/authz/audit — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side. Đây là **nợ giao diện vận hành tường minh**: xem `GAP-04` ở [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 4.1.

> **Cập nhật sau `✅ CHỐT GATE-04 — 2026-08-14`**: sàn Capsule Store đã đóng (mục 2) ⇒ hook authn/authz/audit nay là thành phần **bắt buộc** của store, nên `A1` có nơi để thực thi. **Hai gạch đầu dòng cuối ở trên vẫn đúng nguyên văn**: **mô hình quyền vẫn `TBD`**, và §18 vẫn **không có một CLI verb nào** để vận hành authn/authz/audit. ⇒ **`GAP-04` CHƯA ĐÓNG.** `GATE-04` chốt *cái gì phải có*, không chốt *cách vận hành*. Rủi ro **`GATE-04-r`** tại [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.

Xem [PRD-Repro](../PRD-Repro.md) mục 10.4 và [NFR-Repro](../NFR-Repro.md) mục 5.4.

---

### `A2` — Capsule đã hết retention

**Điều kiện kích hoạt**: capsule đã bị xoá theo retention policy trước khi người dùng truy cập.

**Căn cứ** — §20.17 (*Compliance / Legal* — 🟠 High): dữ liệu production đã capture có thể liên quan **GDPR, HIPAA, PCI DSS, SOC 2, internal security policies**; mitigation liệt kê **data retention policies** và **deletion**. §20.5 cũng liệt kê *"configurable retention"*.

**Hành vi mong đợi**: `repro inspect` báo capsule không còn tồn tại, phân biệt rõ với *"không có quyền"* (`A1`) và *"id không tồn tại"*.

**Hai câu hỏi trước đây `RQ.md` không trả lời — nay ĐÃ CÓ ĐÁP ÁN**:

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

**1. Thời hạn retention mặc định = 30 ngày** — `✅ CHỐT GATE-05a — 2026-08-14`.

**Bằng chứng gốc giữ nguyên**: `RQ.md` chỉ nói *"configurable"* (§20.5) và **không đưa giá trị mặc định nào** — mệnh đề đó về `RQ.md` **vẫn đúng**; quyết định của anh cấp con số **từ ngoài** `RQ.md`. Và nguyên tắc *"một giá trị mặc định là quyết định compliance, không tự bịa"* **vẫn đúng** — đúng vì thế nên con số này do **`@TrisJr`** quyết, chứ không do tài liệu tự đặt.

- **30 ngày** là mặc định **khi không cấu hình**; retention **vẫn cấu hình được** theo `FR-024`. Neo bảo mật: `SEC-022`.
- ⇒ `A2` nay kích hoạt được một cách xác định: capsule tạo lúc `T` mà không có cấu hình riêng thì hết retention tại `T + 30 ngày`.
- ⚠️ **Việc chốt không đi qua pháp chế** — §20.17 xếp retention vào nhóm GDPR / HIPAA / PCI DSS / SOC 2. Đây là **rủi ro được chấp nhận có ý thức**, không phải con số đã được thẩm định pháp lý.

**2. Capsule đã pull về máy local CÓ bị retention chi phối** — `✅ CHỐT GATE-05b — 2026-08-14`, thông qua **crypto-shredding**.

**Bằng chứng gốc giữ nguyên**: `repro pull` (§8) vẫn tạo ra một **bản sao ngoài tầm kiểm soát trực tiếp của store**, và `RQ.md` **không nhắc tới nghịch lý này ở bất kỳ đâu**. Cái đổi là **cơ chế xử lý** nghịch lý đó:

| | Trước `GATE-05b` | Sau `GATE-05b` |
|---|---|---|
| Xoá phía server có chạm được bản trên laptop? | ❌ Không — *bất khả hồi* | ✅ **Có** — xoá **khoá** phía server ⇒ bản trên laptop thành **ciphertext vô nghĩa**, không giải được |
| Phân loại `SEC-016` | `DEFER` | **`MUST-V0.1`** |

**Cơ chế**: capsule mã hoá bằng **khoá riêng từng capsule, khoá giữ phía server**; replay lấy khoá just-in-time; *xoá = phá khoá*. ⇒ Hết retention (`A2`) nay có nghĩa **cả bản đã pull cũng không mở được**, kể cả bản đã lọt sang chat hay git.

**Đánh đổi phải nói thẳng — `GATE-05b-r`**: mất *"replay hoàn toàn offline"*; capsule **không còn self-contained tuyệt đối**. Hệ quả này **được chấp nhận có ý thức** — xem [UC-02](./UC-02-Replay-Capsule-Locally.md) `I5` và [Risk-Register](../../010-Planning/Risk-Register.md) §4.2.

**Hệ quả lên hành vi của `A2`**: `repro inspect` nay phải phân biệt được **bốn** tình huống, không phải ba — *hết retention (khoá đã bị phá)* · *không có quyền* (`A1`) · *id không tồn tại* · *có capsule nhưng không lấy được khoá* (`A3`, lý do vận hành chứ không phải hết hạn). Nhầm hai tình huống đầu với hai tình huống sau dẫn người dùng đi sai hướng khắc phục.

**`TBD` còn lại — nay là blocker (`GATE-05b-r2`)**: **key custody** (`U-06d`) — khoá giữ ở đâu, ai cấp, xoay vòng thế nào, **phá khoá bằng thao tác nào và ai được phép**. Không có key management thì `A2` **không thực thi được** đúng như vừa chốt. Owner: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế tại [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`. Chi tiết NFR: [NFR-Repro](../NFR-Repro.md) mục 5.4.

> ⚠️ **`GAP-04` không được đóng bởi hai quyết định này**: vẫn **không có CLI verb nào** để cấu hình retention, xem thời điểm hết hạn của một capsule, hay ra lệnh phá khoá. Xem `A1` và [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) mục 4.1.

---

### `A3` — Capsule đã encrypt mà người dùng không có key

**Điều kiện kích hoạt**: capsule tồn tại, người dùng có quyền, nhưng không giải mã được.

**Căn cứ** — §16: *"Capsules should support encryption at rest."*

**Hành vi mong đợi**: báo lỗi rõ ràng, **phân biệt** với `A1` (không quyền) và `A2` (hết retention) — ba nguyên nhân khác nhau dẫn tới ba hành động khắc phục khác nhau.

**`TBD`**: `RQ.md` **không đặc tả key management** — không nói key ở đâu, ai cấp, xoay vòng thế nào, hay quan hệ giữa quyền truy cập (`A1`) và quyền giữ key. §16 chỉ có đúng một câu về encryption.

> ⚠️ **`TBD` này nay là BLOCKER — `GATE-05b-r2`.** `✅ CHỐT GATE-05b — 2026-08-14` đặt crypto-shredding thành **`MUST-V0.1`** với **khoá giữ phía server** ⇒ key management đi từ *open item phụ* thành **điều kiện để cả `A2` lẫn `A3` thực thi được**. `A3` cũng vì thế **thường gặp hơn** trước: khoá không còn đi cùng người dùng, nó nằm ở server và có thể **đã bị phá có chủ đích** (hết retention) hoặc **tạm không với tới được** (vận hành) — hai nguyên nhân này phải được `repro inspect` phân biệt, xem `A2`. `U-06d`, owner **`@TrisJr`**, điều kiện đóng: quyết định key custody tại [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`.

> ⚠️ **Yêu cầu liên quan không đến từ `RQ.md`**: [NFR-Repro](../NFR-Repro.md) mục 5.3 yêu cầu capsule có **hash/signature trong `manifest.json` từ v1 của format**, và replay runtime phải **verify trước khi parse**. Lý do: `repro replay` **nạp và deserialize một artifact do bên khác tạo** rồi tiêm giá trị vào runtime của developer — trên chính máy có SSH key, cloud credential và quyền push code. `RQ.md` **không có một dòng nào** về capsule integrity. Yêu cầu này ràng buộc `FR-017` (capsule format) nên **phải chốt từ V0.1**, không retrofit được.

---

### `A4` — Field đã redact: phải hiển thị **rõ là đã redact** 🔴

**Điều kiện kích hoạt**: capsule chứa field đã bị redaction hoặc anonymization xử lý ([UC-01](./UC-01-Capture-Failed-Production-Execution.md) bước 7).

**Căn cứ** — §16 (redaction headers + fields, PII anonymization `john@example.com` → `user-1842@example.test`), §20.5 (🔴 Critical).

**Hành vi BẮT BUỘC**:

| ✅ Phải làm | ❌ Cấm |
|---|---|
| Hiển thị field **kèm nhãn cho biết nó đã bị redact / anonymize** | Hiển thị field **rỗng**, `null`, hoặc **bỏ hẳn field khỏi output** |

**Neo — §33.5 `N-13` *Determinism over magic***:

> **The system should explain exactly what was captured and replayed.**

**Vì sao đây là ràng buộc cứng chứ không phải chi tiết UI**:

Một field hiển thị **rỗng** thì người đọc **không phân biệt được ba tình huống hoàn toàn khác nhau**:

| Tình huống | Ý nghĩa với developer | Hành động đúng |
|---|---|---|
| Production **thật sự** trả về giá trị rỗng / `null` | Đây có thể **chính là bug** (§7: `coupon #9182 = null` là nguyên nhân của `TypeError`) | Đào tiếp vào logic |
| Field **đã bị redact** | Dữ liệu tồn tại nhưng bị che vì lý do bảo mật | Bỏ qua, không phải manh mối |
| Field **không được capture** (incomplete capture, [UC-01](./UC-01-Capture-Failed-Production-Execution.md) `A1`/`A3`) | Capsule thiếu dữ liệu | Nghi ngờ kết luận replay |

⇒ Nhầm ba tình huống này dẫn thẳng tới **kết luận sai về nguyên nhân bug**. Với §7 — ví dụ mở đầu của cả tài liệu, nơi bug **chính là** một giá trị `null` — việc hiển thị redacted field thành rỗng sẽ tạo ra **manh mối giả trông y hệt manh mối thật**.

**Ràng buộc liên đới**:

- [NFR-Repro](../NFR-Repro.md) mục 5.6: capsule **phải ghi lại đã redact field nào**, để Execution Diff (`FR-042`) phân biệt được *"diverged vì code"* với *"diverged vì redaction"*. UC này là nơi thông tin đó được **hiển thị ra**; [UC-03](./UC-03-Read-Execution-Diff.md) là nơi nó được **dùng để suy luận**.
- [NFR-Repro](../NFR-Repro.md) mục 5.6 cũng nêu hệ quả phải chấp nhận: *"replay của một capsule đã redact không bảo đảm bit-perfect"* — người đọc capsule cần thấy được điều đó ngay trong output của `inspect`.

> ⚠️ **Ghi rõ nguồn**: `RQ.md` **không** nêu yêu cầu này. §16 chỉ mô tả cơ chế redaction, **không** nói gì về cách trình bày dữ liệu đã redact. Ràng buộc ở `A4` được suy ra từ **§33.5** (nguyên tắc `Determinism over magic`) và từ [NFR-Repro](../NFR-Repro.md) mục 5.6. **Định dạng nhãn cụ thể: `TBD`.**

---

## 7. Postconditions

| # | Trạng thái sau UC | Nguồn § | FR |
|---|---|---|---|
| S1 | Người dùng biết **những capsule nào khả dụng** với mình | §18 | `FR-047` |
| S2 | Người dùng biết **chính xác** một capsule chứa những input nào, theo cấu trúc §6 | §6, §33.5 | `FR-049`, `FR-017` |
| S3 | Người dùng phân biệt được dữ liệu **thật**, dữ liệu **đã redact**, và dữ liệu **không được capture** | §33.5 | — (yêu cầu từ `A4`) |
| S4 | Mọi lần truy cập capsule đã được ghi **audit log** | §20.17 | `FR-026` |
| S5 | Capsule **không bị thay đổi** bởi UC này — đây là luồng **chỉ đọc** | §6 | — |

**Bước tiếp theo khả dĩ**: `repro pull` + `repro replay` → [UC-02](./UC-02-Replay-Capsule-Locally.md); hoặc `repro diff` → [UC-03](./UC-03-Read-Execution-Diff.md).

---

## 8. FR bao phủ

Tra theo **hợp đồng traceability** ở [PRD-Repro](../PRD-Repro.md) mục 5.7:

> **UC-05** → `FR-017`, `FR-021`…`FR-026`, `FR-047`, `FR-049`

| FR | Nội dung | Bước / Flow |
|---|---|---|
| `FR-017` | Capsule là artifact portable, cấu trúc `manifest.json` / `request.json` / `environment.json` / `feature-flags.json` / `database/query-NNN.json` / `network/*.json` / `metadata.json` | 4, S2 |
| `FR-021` | Encryption at rest | 4, `A3` |
| `FR-022` | Automatic redaction (header + field) | `A4` |
| `FR-023` | PII anonymization | `A4` |
| `FR-024` | Retention policy cấu hình được + deletion — **TTL mặc định 30 ngày** (`GATE-05a`); deletion thực thi được tới bản đã pull nhờ crypto-shredding (`GATE-05b`) | P4, `A2` |
| `FR-025` | Strict access control | P2, 4, `A1` |
| `FR-026` | Audit log truy cập capsule | 4, S4 |
| `FR-047` | `repro list` | 1 |
| `FR-049` | `repro inspect <id>` | 3 |

**FR liên quan**: `FR-053` (CLI là primary interface — §33.2) chi phối toàn bộ hình thức trình bày của UC này.

> ✅ **`FR-024`, `FR-025`, `FR-026` thuộc OSS core — M2 đã chốt 2026-08-14**, giữ nguyên là MVP. Xem `A1`.

---

## 9. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](../PRD-Repro.md) | Hợp đồng FR (mục 5.7); mục 10.4 (**M2** — ✅ đã chốt 2026-08-14: OSS core); mục 10.5 (`U-06` — **sàn Capsule Store đã chốt**, `GATE-04`; **cơ chế** authn/authz vẫn `TBD`); mục 5.2 (`FR-024` — TTL mặc định **30 ngày**, `GATE-05a`) |
| [NFR-Repro](../NFR-Repro.md) | `N-13` *Determinism over magic* (neo của `A4`); mục 5.3 (capsule integrity), 5.4 (M2 ✅ đã chốt 2026-08-14; **crypto-shredding `✅ CHỐT GATE-05b — 2026-08-14`, phân loại `MUST-V0.1`**), 5.5 (redaction là hygiene control), 5.6 (ghi lại field đã redact) |
| [UC-01 — Capture Failed Production Execution](./UC-01-Capture-Failed-Production-Execution.md) | Tạo ra capsule mà UC này đọc; bước 7 của UC-01 sinh ra tình huống `A4` |
| [UC-02 — Replay Capsule Locally](./UC-02-Replay-Capsule-Locally.md) | Bước 1 của UC-02 chính là bước 1 của UC này; UC này giúp chẩn đoán `A5`/`A6` của UC-02; `I5` mang **điều kiện mới** sau `GATE-05b` — replay ở môi trường khác cần lấy được khoá từ server |
| [ADR-009 — Private Self-Hosted Topology](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) | Sàn Capsule Store (`D3`); **key custody `U-06d`** — blocker của `A2`/`A3` |
| [UC-03 — Read Execution Diff](./UC-03-Read-Execution-Diff.md) | Dùng thông tin "field nào đã redact" để phân biệt nguyên nhân divergence |
| [BRD-001-Problem-Statement](../BRD/BRD-001-Problem-Statement.md) | 9 câu hỏi §2.1 — nội dung capsule chính là câu trả lời cho câu 1–7 |
| [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) | Persona QA Engineer (secondary actor) và `GAP-04` — SRE không có CLI verb nào |
| [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | Thiết kế Capsule Store, capsule format, key management |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — §6, §7, §8, §16, §18, §19, §20.5, §20.6, §20.17, §21, §25, §28, §33.2, §33.5, §40 |
