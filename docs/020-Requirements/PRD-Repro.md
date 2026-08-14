---
id: PRD-001
type: prd
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 📄 PRD — Repro

> **Production happened. Now replay it.** (`RQ.md` §36)

**Nguồn sự thật duy nhất của tài liệu này**: `docs/999-Resources/RQ.md`. Mọi khẳng định đều kèm số hiệu section (`§N`). Chỗ nào `RQ.md` không có căn cứ được ghi `TBD` chứ không suy đoán.

---

## 1. Executive Summary

Repro là một **open-source developer tool** giải quyết một trong những vấn đề khó chịu nhất của phát triển phần mềm (§1):

> **Một bug xảy ra ở production, nhưng không ai reproduce được nó ở local.**

Thay vì cố clone toàn bộ production environment, Repro **capture execution context** đã gây ra failure ở production và đóng gói nó thành một artifact portable gọi là **Repro Capsule** (§1, §6). Developer sau đó replay execution đó lên code local của mình (§1).

Nguyên tắc sản phẩm nền tảng (§1, §33.1, §40):

> **Repro không tái tạo production environment. Repro tái tạo production execution.**

Vòng lặp lõi của sản phẩm (§1, §17, §20.15):

```text
Capture → Replay → Verify
```

Kết quả của một lần replay có đúng hai nhánh, và **cả hai đều có giá trị** (§1, §9):

- **Bug reproduced** — developer có một execution xác định để debug.
- **Execution diverged** — Repro chỉ ra production khác local **ở đâu**, thay vì chỉ trả về "Could not reproduce" (§9).

**One-liner** (§35):

> **Repro turns production bugs into reproducible local executions.**

**Positioning** (§29): Repro **không** là một monitoring platform. Observability trả lời *"What happened?"*; Repro trả lời *"Can I replay it?"* (§3, §29). Repro bổ sung một **reproducibility layer** lên trên production diagnostics chứ không thay thế Sentry / Datadog / APM / logging / testing framework / CI-CD (§3, §34).

---

## 2. Background & Objectives

### 2.1 Problem Statement

Chi tiết vấn đề nằm ở tài liệu riêng: [BRD-001-Problem-Statement](./BRD/BRD-001-Problem-Statement.md).

Tóm tắt (§2.1, §3, §4):

- Một production incident thường cho biết **what happened** nhưng không đủ để reproduce: developer vẫn phải tự đoán request nào, DB trả gì, external API trả gì, feature flag nào bật, state của user, version nào đang chạy, system time, chuyện gì xảy ra ở dependent service, có phụ thuộc thứ tự/thời điểm không (§2.1 — 9 câu hỏi).
- Vòng lặp debug hiện tại kết thúc bằng **"Hope"** (§2.1, §30).
- Observability cung cấp logs / traces / metrics / stack traces nhưng không trả lời được *"Can I make the same execution happen again?"* (§3).
- Clone production environment là không khả thi: production là K8s + 20 API replica + PostgreSQL cluster + Redis + Kafka + external API + cloud infra + feature flags + secrets, còn local là Docker + 1 API + local PostgreSQL + local Redis + mock service (§4).

### 2.2 Goals

Goal của sản phẩm bám đúng **Key Hypothesis** (§37), trích nguyên văn:

> **If developers can capture a failed production execution and replay it locally with the same relevant inputs, the time required to diagnose and fix production bugs will decrease significantly.**

Từ đó, MVP chỉ tối ưu cho **một** outcome (§37):

```text
Production Bug → Successful Local Replay → Understand → Fix → Regression Test
```

> ⚠️ Bước cuối (**Regression Test**) của chuỗi §37 **không thuộc V0.1** theo §26. **M1 ✅ ĐÃ CHỐT 2026-08-14**: giữ nguyên §26 — regression test generation ở **V0.2**. Outcome chain của V0.1 do đó kết thúc ở `Fix` + `repro verify`. Xem mục 8.2 và mục 10.4.

MVP phải trả lời đúng **một câu hỏi** (§19):

> **Can we reliably capture and replay a meaningful class of production executions?**

Ba goal cụ thể của V0.1, tất cả đều dẫn xuất từ §18/§19/§37:

| # | Goal | Nguồn § |
|---|---|---|
| G1 | Capture được một failed production execution của ứng dụng Node.js + PostgreSQL + HTTP thành một Repro Capsule portable | §18, §6, §37 |
| G2 | Replay capsule đó lên code local, không cần truy cập production | §5, §7, §11, §18 |
| G3 | Phân biệt được **"Replay completed"** với **"Execution matched"**, và khi diverged thì chỉ ra khác biệt | §10, §9, §20.3 |

> **Không đặt goal dạng số ở đây.** Bốn ngưỡng của §24 là *initial hypotheses* của technical spike, xem mục 9 và [NFR-Repro](./NFR-Repro.md).

### 2.3 Non-Goals

§19 liệt kê tường minh 11 mục **ngoài phạm vi V0.1**:

| # | Non-Goal | Nguồn § | Tính chất |
|---|---|---|---|
| NG-01 | Full production environment cloning | §19 | **Loại vĩnh viễn** — trái §33.1 và §40 |
| NG-02 | Full production database snapshots | §19 | Hoãn (§11 nêu *minimal* DB snapshot ở future) |
| NG-03 | Browser replay | §19 | Hoãn — §26 V0.2 |
| NG-04 | Kubernetes orchestration | §19 | **Loại vĩnh viễn** — §20.15 xếp container runtime vào scope explosion |
| NG-05 | Kafka replay | §19 | Hoãn — §26 V0.3 |
| NG-06 | Distributed race-condition replay | §19 | Hoãn — §20.13, §26 Future |
| NG-07 | Multi-language support | §19 | Hoãn — §26 V0.3 (Python, Go) |
| NG-08 | AI root-cause analysis | §19 | Hoãn — §26 Future, §27 |
| NG-09 | Automatic code fixes | §19 | Hoãn — §26 Future, §27 |
| NG-10 | Enterprise billing | §19 | Hoãn — §28 nói commercial model chỉ định nghĩa **sau** khi validate |
| NG-11 | Large observability dashboard | §19 | **Loại vĩnh viễn** ở dạng "large dashboard" — §33.2 CLI là primary interface, §25 demo không cần dashboard |

Thêm một Non-Goal **không nằm trong §19**, đến từ quyết định **E5** đối với §38 Q6:

| # | Non-Goal | Căn cứ |
|---|---|---|
| NG-12 | **Manual recording** — V0.1 không có cơ chế để developer chủ động bật ghi một execution | §18 (danh sách CLI **không có** lệnh `record`), §26 V0.1 chỉ ghi "Production capture", §20.15 product boundary |

**Cách đọc cột "Tính chất"**: *Hoãn* = có thể vào roadmap sau (xem [Roadmap](../010-Planning/Roadmap.md)); *Loại vĩnh viễn* = mâu thuẫn với nguyên tắc sản phẩm, không nên đưa lại vào bất kỳ phase nào.

---

## 3. Scope / MVP

### 3.1 Target stack

§18 ghi thẳng:

> **Start with: Node.js + PostgreSQL + HTTP applications**

và nói rõ mục đích: *"This intentionally limits the scope to make the core hypothesis testable"* (§18).

**Quyết định E6 — §38 Q4 coi như ĐÃ được `RQ.md` trả lời, không để lơ lửng.** §38 Q4 hỏi *"Which initial stack should be supported?"* với ba lựa chọn (Node.js + PostgreSQL / Python + PostgreSQL / Other). Bốn chỗ khác của cùng tài liệu đã trả lời:

| Neo | Nội dung |
|---|---|
| §18 | *"Start with: Node.js + PostgreSQL + HTTP applications"* |
| §22 | Test app của technical spike là Node.js, `POST /checkout`, dependency PostgreSQL |
| §26 | V0.1 liệt kê Node.js, PostgreSQL, HTTP |
| §20.14 | Mitigation adoption dùng đúng package name `npm install @repro/node` |

⇒ **Target stack V0.1 = Node.js + PostgreSQL + HTTP.** Q4 được đóng, không xuất hiện trong mục 10 như câu hỏi còn mở.

### 3.2 In scope V0.1

Theo §18 "MVP capabilities", chia 4 nhóm:

**Capture** (§18)

- HTTP request
- stack trace
- database query/result
- external HTTP response
- feature flag state
- clock/timestamp
- Git commit
- runtime metadata

**Replay** (§18)

- HTTP request replay
- database result replay
- external API replay
- clock replay
- safe side-effect handling

**Analysis** (§18)

- execution verification
- execution diff
- code/version mismatch detection

**CLI** (§18) — 6 lệnh:

```bash
repro list
repro pull 1842
repro inspect 1842
repro replay 1842
repro diff 1842
repro verify 1842
```

Ngoài bốn nhóm trên, còn một nhóm capability **phi chức năng** thuộc MVP theo §21 — xem mục 3.4 để hiểu vì sao.

### 3.3 Out of scope V0.1

Xem bảng 12 Non-Goal ở mục 2.3. Nhắc lại điểm quan trọng nhất về cách đọc:

- **Hoãn** (NG-02, NG-03, NG-05, NG-06, NG-07, NG-08, NG-09, NG-10): §26 đã đặt lịch cụ thể cho phần lớn, chi tiết ở [Roadmap](../010-Planning/Roadmap.md).
- **Loại vĩnh viễn** (NG-01, NG-04, NG-11): đây **không phải** "chưa làm". §33.1 nói *"Do not attempt to clone production"* và §40 nói Repro *"is not trying to make developers run production on their laptops"*. Một roadmap sau này đưa **full environment cloning** trở lại sẽ **mâu thuẫn với thesis của sản phẩm**, không chỉ là mở rộng scope. Tương tự, K8s orchestration và large dashboard nằm đúng trong danh sách scope explosion của §20.15.

### 3.4 Diễn giải §18 vs §21 — nguồn nào có thẩm quyền cho capability phi chức năng

> ⚠️ **Mục này là diễn giải của PM để hai section của `RQ.md` tương thích với nhau. `RQ.md` không nói thẳng điều này.**

**Vấn đề**: §18 "MVP capabilities" liệt kê Capture / Replay / Analysis / CLI và **không nhắc** redaction, encryption, retention, audit log, self-hosting. Nhưng §21 Risk Matrix đánh cột `MVP?` = **Yes** cho chính những thứ đó:

| Dòng §21 | Severity | MVP? | Mitigation (§21) |
|---|---|---:|---|
| Sensitive data | 🔴 Critical | **Yes** | Redaction + encryption |
| Security exposure | 🔴 Critical | **Yes** | Private/self-hosted architecture |
| Compliance | 🟠 High | **Yes** | Policies + self-hosting |
| Capsule size | 🟠 High | **Yes** | Compression + limits |
| Production overhead | 🟠 High | **Yes** | Async + bounded capture |

**Diễn giải được áp dụng (E2)**:

> §18 là danh sách của **core replay loop** — nó trả lời *"MVP làm được việc gì"*. §21 cột `MVP?` là **nguồn có thẩm quyền** cho các **capability phi chức năng** — nó trả lời *"MVP phải có control nào"*. Hai danh sách **bổ sung** nhau, không loại trừ nhau.

**Vì sao chọn cách đọc này**: cách đọc ngược lại (§18 là danh sách đầy đủ ⇒ redaction/encryption ngoài MVP) sẽ khiến §21 tự mâu thuẫn với chính nó ở 5 dòng, và khiến §20.5 (Critical, mitigation gồm redaction/anonymization/encryption/retention/self-hosting/access control) trở thành risk Critical **không có mitigation nào ở MVP**.

**Hệ quả trực tiếp**: `FR-019`…`FR-026` và `FR-054`…`FR-055` ở mục 5 là **in-scope V0.1**, dù không xuất hiện trong danh sách §18.

Điều này còn được chống lưng độc lập bởi threat model: [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) kết luận **33 requirement là MUST-V0.1**, phủ đúng redaction, encryption, retention, audit và authn/authz.

> **Bộ số đã đổi — `✅ CHỐT GATE-05b — 2026-08-14`**: phân loại requirement bảo mật đi từ `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` sang **`33 MUST-V0.1 / 8 SHOULD / 2 DEFER = 43`**. Nguyên nhân duy nhất: `SEC-016` (crypto-shredding) rời `DEFER` sang `MUST-V0.1`. **Tổng vẫn là 43.** Xem mục 5.2 (`FR-024`) và [NFR-Repro](./NFR-Repro.md) mục 5.4.

### 3.5 Redis — ngoài V0.1

**Quyết định E1: Redis KHÔNG thuộc V0.1 capture.**

`RQ.md` tự nói ngược ở điểm này, ghi lại trung thực cả hai phía:

| Phía "Redis có" | Phía "Redis không" |
|---|---|
| §5 vẽ execution chain có **"Cache Reads"** và **"Redis → Result B"** | §18 "MVP capabilities → Capture" **không liệt kê** Redis |
| §13 xếp **"Cache read"** vào nhóm READ | §26 đặt **Redis ở V0.3** |
| §17 Core Product Flow — box `Repro Recorder` liệt kê **Redis** | |
| §22 test app của technical spike có dependency **Redis** | |

**Lý do chọn**: §18 ("MVP capabilities") và §26 ("V0.3") là hai **phát biểu phạm vi tường minh**; §5 và §17 là **sơ đồ minh hoạ kiến trúc chung**; §22 là **dependency của test app** — test app *có* Redis không đồng nghĩa Repro *capture* Redis ở V0.1. Phát biểu phạm vi thắng sơ đồ minh hoạ.

⇒ Redis capture/replay nằm ở phụ lục post-MVP (`FR-065`). §17 của `RQ.md` là chỗ cần sửa cho khớp nếu anh muốn tài liệu gốc tự nhất quán.

---

## 4. Target Audience

Chi tiết đầy đủ: [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md).

> ⚠️ **Mức độ bằng chứng — đọc trước khi dùng.** `RQ.md` **không có** section "Target users". Ba nhóm người dùng chỉ xuất hiện đúng **một lần**, ở **dòng 7 frontmatter** (`Target users: Software Engineers, QA Engineers, SRE / DevOps`). Kiểm chứng bằng grep: `"QA"` và `"SRE"` xuất hiện **duy nhất 1 lần** trong toàn bộ 1995 dòng; `"developer"` xuất hiện **34 lần**. Repo không có user interview / survey / số liệu thị trường. ⇒ Persona dưới đây là **hypothesis chưa validated**, không phải kết quả nghiên cứu.

Ba nhóm **không** ngang hàng (quyết định E10):

| Persona | Vai trò | Căn cứ |
|---|---|---|
| **Software Engineer** — *primary* | Người pull capsule, replay, đọc diff, fix, verify. Toàn bộ §8, §9, §10, §25, §30 viết cho vai này. | Bằng chứng dày nhất; phần lớn `stated` |
| **SRE / DevOps** — *secondary, capture-side owner* | Người cài SDK vào production, cấu hình redaction, retention, self-hosting, chịu trách nhiệm overhead. | `inferred`, nhưng neo vững vào §16, §20.5, §20.6, §20.7, §20.17, §28 — toàn bộ mối quan tâm capture-side/compliance chỉ hợp lý khi gán cho vai này |
| **QA Engineer** — *activated at V0.2* | Người dùng regression test sinh ra từ capsule. | Persona mỏng nhất, `inferred` nặng. **Toàn bộ nội dung của nó neo vào regression test generation — §26 đặt ở V0.2** ⇒ với scope V0.1, QA Engineer chưa phải persona của MVP. **M1 ✅ ĐÃ CHỐT 2026-08-14** giữ §26 ⇒ *activated at V0.2* là **kết luận dứt khoát**, không còn treo. Xem mục 8.2 |

**Anti-pattern phải tránh với persona primary** (§20.14): developer có thể nhìn Repro như *"Another observability SDK"* hoặc *"This looks complicated to install"*. Đây là risk Critical về sản phẩm, và mitigation của nó là ràng buộc trực tiếp lên `FR-001`/`FR-002`.

---

## 5. Functional Requirements

**Phạm vi bảng này**: `FR-001`…`FR-055` = **in-scope V0.1**. `FR-056`…`FR-082` (post-MVP / out-of-scope) ở **Phụ lục A**.

**Cách đọc cột `Ưu tiên`**: dẫn xuất từ cột `Severity` của §21 — risk 🔴 Critical ⇒ `P0`, risk 🟠 High ⇒ `P1`. Đây là **quy ước ánh xạ của tài liệu này**, `RQ.md` không có cột priority.

### 5.1 Capture — `FR-001` → `FR-016`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-001 | SDK phải cài được bằng một lệnh duy nhất: `npm install @repro/node` | Capture | §20.14 | P0 |
| FR-002 | SDK phải khởi tạo được bằng `repro.init()` với **cấu hình tối thiểu**; developer capture được execution replay-được đầu tiên mà không cần dựng thêm hạ tầng | Capture | §20.14, §38.13 | P0 |
| FR-003 | Capture inbound HTTP request đã kích hoạt execution (method, path, headers, body) | Capture | §18, §5, §6 | P0 |
| FR-004 | Capture stack trace của failure | Capture | §18, §2.1 | P0 |
| FR-005 | Capture database query và result của query đó | Capture | §18, §7, §11 | P0 |
| FR-006 | Capture response của external HTTP API mà execution gọi | Capture | §18, §12 | P0 |
| FR-007 | Capture feature flag state tại thời điểm execution | Capture | §18, §5, §6 | P0 |
| FR-008 | Capture clock/timestamp mà execution nhìn thấy | Capture | §18, §6, §20.2 | P0 |
| FR-009 | Capture application version và Git commit đang chạy ở production | Capture | §18, §15, §6 | P0 |
| FR-010 | Capture runtime version và dependency versions | Capture | §18, §15, §20.8 | P0 |
| FR-011 | Capture database schema/migration version | Capture | §15, §20.9 | P1 |
| FR-012 | V0.1 **chỉ capture failed executions** (không capture execution thành công) | Capture | §20.7, §18 (stack trace chỉ tồn tại khi failure), §37, §38.5 → **E5** | P0 |
| FR-013 | Capture phải **asynchronous** — không nằm trên đường đi của request | Capture | §20.7 | P1 |
| FR-014 | Capture phải dùng **bounded buffer** — không tăng vô hạn theo tải | Capture | §20.7 | P1 |
| FR-015 | Capture phải hỗ trợ **sampling** cấu hình được | Capture | §20.7 | P1 |
| FR-016 | Capture phải hỗ trợ **capture limits cấu hình được** và **selective capture** (giới hạn cái gì được ghi, ghi bao nhiêu) | Capture | §20.7, §20.12 | P1 |

> **Ghi chú định danh**: một lens phân tích trước từng gán *Redis capture* vào `FR-016`. Theo **E1**, Redis capture **không** thuộc V0.1; `FR-016` ở bảng trên là capture limits, còn Redis capture/replay nằm ở `FR-065` (Phụ lục A).

> **Điểm hở đã biết ở nhóm này** — `FR-012` va vào một nghịch lý mà `RQ.md` không thừa nhận: một execution chỉ **được biết là failed sau khi nó kết thúc**, nên hệ thống buộc phải buffer **mọi** execution rồi huỷ khi thành công. Ngân sách overhead của §24 (`< 5%`) vì thế áp lên **100% traffic**, không phải lên vài request lỗi. Ngược lại, sampling (`FR-015`) giảm overhead thì đồng thời giảm xác suất bắt được đúng execution lỗi. Chi tiết ở [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md).

### 5.2 Capsule — `FR-017` → `FR-026`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-017 | Execution đã capture phải được đóng gói thành một **Repro Capsule** — artifact portable, có cấu trúc: `manifest.json`, `request.json`, `environment.json`, `feature-flags.json`, `database/query-NNN.json`, `network/*.json`, `metadata.json` | Capsule | §6 | P0 |
| FR-018 | Capsule chỉ chứa **thông tin cần thiết để reproduce execution**, không phải bản sao của production environment | Capsule | §6, §40 | P0 |
| FR-019 | Capsule phải hỗ trợ **compression** và **size limits** | Capsule | §20.12 | P1 |
| FR-020 | Capsule phải hỗ trợ **deduplication** và **content hashing** | Capsule | §20.12 | P1 |
| FR-021 | Capsule phải hỗ trợ **encryption at rest** | Capsule | §16, §21 (Sensitive data, MVP=Yes) | P0 |
| FR-022 | Hệ thống phải **automatic redaction** theo cấu hình, tối thiểu ở hai mức: HTTP header (vd. `authorization`, `cookie`) và field (vd. `password`, `access_token`, `credit_card`) | Capsule | §16, §20.5 | P0 |
| FR-023 | Hệ thống phải hỗ trợ **PII anonymization** (vd. `john@example.com` → `user-1842@example.test`) | Capsule | §16, §20.5 | P0 |
| FR-024 | Hệ thống phải hỗ trợ **retention policy cấu hình được** và **deletion**. **TTL mặc định của capsule = 30 ngày** — `✅ CHỐT GATE-05a — 2026-08-14` | Capsule | §20.5, §20.17, §21 (Compliance, MVP=Yes); giá trị mặc định từ `GATE-05a` | P1 |
| FR-025 | Hệ thống phải có **strict access control** lên capsule | Capsule | §20.5, §21 (Sensitive data, MVP=Yes) | P0 |
| FR-026 | Hệ thống phải ghi **audit log** cho truy cập capsule | Capsule | §20.17 | P1 |

> ✅ **`CHỐT GATE-05a — 2026-08-14` — TTL mặc định của capsule = 30 ngày.** `RQ.md` §20.5 chỉ nói *"configurable retention"* và **không** đưa giá trị mặc định nào — trích dẫn đó **giữ nguyên** làm bằng chứng. Quyết định của anh cấp đúng một con số: **30 ngày là mặc định khi không cấu hình**. Retention **vẫn cấu hình được** theo đúng `FR-024` — `GATE-05a` chốt *mặc định*, **không** chốt *giá trị duy nhất*. Neo bảo mật: `SEC-022`. Hệ quả lên capsule đã pull về máy local: xem `✅ CHỐT GATE-05b` ở [NFR-Repro](./NFR-Repro.md) mục 5.4 và [UC-05](./Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) `A2`.
>
> ⚠️ **Việc chốt TTL không đi qua pháp chế.** §20.17 xếp retention vào nhóm compliance (GDPR / HIPAA / PCI DSS / SOC 2); `GATE-05a` do **`@TrisJr`** quyết. Đây là **rủi ro được chấp nhận có ý thức**, không phải một con số đã được thẩm định pháp lý.

> ✅ **M2 ĐÃ CHỐT 2026-08-14 — `FR-024`, `FR-025`, `FR-026` thuộc OSS core.** `RQ.md` §28 xếp *Access control* và *Retention policies* vào commercial layer; quyết định của anh **ghi đè** phần đó: **authentication + authorization + audit log nằm trong OSS core**, giữ nguyên là MVP. Chi tiết và hệ quả ở mục 10.4.

> **Diễn giải đã áp dụng cho `FR-019`**: §20.12 nêu *"lazy loading"* trong mitigation, trong khi §6 và §40 đòi capsule **tự chứa** và **portable**. Cách đọc được chọn: *lazy loading* = lazy loading **khi ĐỌC capsule** (không nạp toàn bộ vào memory), **không phải** lazy fetch dữ liệu từ production lúc replay. Cách đọc này giữ được cả ba section mà không mâu thuẫn. Ghi rõ đây là **diễn giải**, không phải câu chữ của `RQ.md`.

### 5.3 Replay — `FR-027` → `FR-038`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-027 | Developer phải pull được capsule về máy local theo **id** (vd. `1842`) | Replay | §8 (Step 2), §18 | P0 |
| FR-028 | Replay runtime phải phát lại **HTTP request** đã capture vào ứng dụng local | Replay | §18, §8 | P0 |
| FR-029 | Replay runtime phải **intercept database read** của app local và trả về **recorded production result** thay vì query database local | Replay | §11, §18, §7 | P0 |
| FR-030 | Replay runtime phải **intercept outbound HTTP** và trả về **recorded response** thay vì gọi external API thật | Replay | §12, §18 | P0 |
| FR-031 | Replay runtime phải phát lại **clock/timestamp** đã capture | Replay | §18, §20.2 | P0 |
| FR-032 | Replay runtime phải phát lại **feature flag state** đã capture | Replay | §5, §18 | P0 |
| FR-033 | Replay phải chạy trên **code local của developer** và **không yêu cầu truy cập production** (kể cả production database) | Replay | §5, §7, §11 | P0 |
| FR-034 | Hệ thống phải **phân loại interaction thành READ và WRITE** (READ: `SELECT`, `GET`, cache read; WRITE: `INSERT`, `UPDATE`, `DELETE`, `POST payment`, publish event) | Replay | §13 | P0 |
| FR-035 | **Default-deny writes**: trong lúc replay, WRITE **không được thực thi lên hệ thống thật**. Đây là core safety mechanism | Replay | §13, §20.4, §33.6 | P0 |
| FR-036 | WRITE bị chặn phải **trả về recorded result** cho application thay vì lỗi, để execution đi tiếp | Replay | §13 | P0 |
| FR-037 | **Replay boundary phải tường minh** và ở V0.1 = **service boundary của service đang điều tra**: developer chạy service đó bằng code local thật | Replay | §14, §20.11, §38.9 → **E5** | P1 |
| FR-038 | Mọi dependency **ngoài** replay boundary phải được replay từ **recorded response**, không được gọi thật | Replay | §14, §20.10, §12 | P1 |

### 5.4 Analysis — `FR-039` → `FR-046`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-039 | Hệ thống phải phân biệt tường minh **"Replay completed"** với **"Execution matched"**, và không được báo thành công khi execution đi đường khác | Analysis | §10, §20.3 | P0 |
| FR-040 | Hệ thống phải so sánh **execution path** giữa Production và Local (§10 dùng ký hiệu `A → B → C` vs `A → B → D`) | Analysis | §10 | P0 |
| FR-041 | Hệ thống phải kết luận execution có **"sufficiently equivalent"** hay không | Analysis | §10 | P0 |
| FR-042 | Khi diverged, hệ thống phải xuất **Execution Diff**: đánh số từng điểm phân kỳ, nhóm theo loại input, trình bày theo cặp **Production → / Local →** | Analysis | §9 | P0 |
| FR-043 | Execution Diff phải là **kết quả có giá trị độc lập**: Repro vẫn phải hữu ích ngay cả khi bug không reproduce được, thay vì chỉ trả về *"Could not reproduce"* | Analysis | §9, §33.3 | P0 |
| FR-044 | Hệ thống phải phát hiện **code/version mismatch** (Git commit, runtime, dependency) và cảnh báo *"Replay may not be deterministic"* | Analysis | §15, §20.8 | P1 |
| FR-045 | Hệ thống phải phát hiện **database schema drift** và phơi bày mismatch lúc replay | Analysis | §20.9, §15 | P1 |
| FR-046 | `verify` phải so được trạng thái **before fix / after fix** của cùng một capsule, và **bắt buộc dùng ngôn từ giới hạn kết luận**: `✓ Captured execution no longer reproduces` — **không** được viết `✓ Production bug is definitely fixed` | Analysis | §8 (Step 5), §20.16 | P0 |

> ⚠️ **`FR-041` chưa spec được.** `RQ.md` §10 dùng cụm *"sufficiently equivalent"* nhưng **không định nghĩa** nó ở bất kỳ đâu, và cũng không định nghĩa "execution path" là gì cụ thể (function call? code line? span?), so bao nhiêu field, exact hay tolerant. Đây là tiêu chí của chính feature được §21 chỉ định làm mitigation cho risk 🔴 Critical *"False replay equivalence"* ⇒ **feature quan trọng nhất về mặt tin cậy lại là feature không đo được.** Chi tiết ở [NFR-Repro](./NFR-Repro.md) mục 7 (`ACG-01`). **Không lấp bằng định nghĩa tự bịa.**

### 5.5 CLI — `FR-047` → `FR-053`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-047 | `repro list` — liệt kê capsule khả dụng | CLI | §18 | P0 |
| FR-048 | `repro pull <id>` — tải capsule về máy local | CLI | §18, §8 | P0 |
| FR-049 | `repro inspect <id>` — xem nội dung capsule | CLI | §18 | P0 |
| FR-050 | `repro replay <id>` — replay execution, in tiến trình theo từng loại input đã phát lại (Request / Database inputs / External API responses / Feature flags / Clock / Application metadata) và kết luận cuối | CLI | §18, §8, §25 | P0 |
| FR-051 | `repro diff <id>` — hiển thị execution diff | CLI | §18, §9 | P0 |
| FR-052 | `repro verify <id>` — verify fix trên captured execution | CLI | §18, §8, §20.16 | P0 |
| FR-053 | **CLI là primary interface** của sản phẩm; V0.1 không yêu cầu dashboard hay hạ tầng phức tạp để dùng được | CLI | §33.2, §25, §20.14 | P0 |

### 5.6 Deployment — `FR-054` → `FR-055`

| ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên |
|---|---|---|---|---|
| FR-054 | Tổ chức phải chạy được **toàn bộ Repro bên trong hạ tầng của chính họ** (self-hosting), **bắt buộc từ V0.1** | Deployment | §16, §28, §38.12 → **E7** | P0 |
| FR-055 | Kiến trúc **mặc định** phải là `Production → Private Recorder → Encrypted Capsule → Private Storage`. Hệ thống **không** được mặc định gửi production data lên public SaaS | Deployment | §20.6, §28 | P0 |

> **Ghi chú về lý do của `FR-054`** (nâng cấp so với `RQ.md`): §20.6 lập luận self-hosting bằng **bảo mật**. Lens bảo mật độc lập chỉ ra lập luận **compliance** mạnh hơn — self-hosting là thứ duy nhất giúp tổ chức tránh đưa nhà cung cấp vào vai processor và tránh phát sinh transfer dữ liệu xuyên biên giới (§20.17). Cả hai lý do đều dẫn tới cùng một requirement.

### 5.7 Traceability — FR ↔ Use Case

| Use Case | FR bao phủ (chính) |
|---|---|
| [UC-01 — Capture Failed Production Execution](./Use-Cases/UC-01-Capture-Failed-Production-Execution.md) | `FR-001`…`FR-026`, `FR-054`, `FR-055` |
| [UC-02 — Replay Capsule Locally](./Use-Cases/UC-02-Replay-Capsule-Locally.md) | `FR-027`…`FR-038`, `FR-044`, `FR-045`, `FR-048`, `FR-050` |
| [UC-03 — Read Execution Diff](./Use-Cases/UC-03-Read-Execution-Diff.md) | `FR-039`…`FR-043`, `FR-051` |
| [UC-04 — Verify Fix](./Use-Cases/UC-04-Verify-Fix.md) | `FR-046`, `FR-052` |
| [UC-05 — Browse And Inspect Capsules](./Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) | `FR-017`, `FR-021`…`FR-026`, `FR-047`, `FR-049` |

### 5.8 Phụ lục — `FR-056` → `FR-082` (Post-MVP / Out-of-scope)

Phasing chi tiết ở [Roadmap](../010-Planning/Roadmap.md). Bảng này tồn tại để **giữ liên tục bộ số hiệu `FR-001`…`FR-082`**, không phải để cam kết lịch giao. **Không mục nào dưới đây thuộc V0.1.**

| ID | Yêu cầu | Phase | Nguồn § |
|---|---|---|---|
| FR-056 | Regression test generation từ capsule | V0.2 | §26, §25 — ✅ **M1 đã chốt 2026-08-14: giữ V0.2** (mục 10.4) |
| FR-057 | GitHub integration | V0.2 | §26 |
| FR-058 | GitHub Actions integration | V0.2 | §26 |
| FR-059 | Browser replay | V0.2 | §26, §19 |
| FR-060 | Better data anonymization | V0.2 | §26 |
| FR-061 | Replay visualization | V0.2 | §26 |
| FR-062 | Next.js support | V0.2 | §26 |
| FR-063 | Python support | V0.3 | §26, §19 |
| FR-064 | Go support | V0.3 | §26, §19 |
| FR-065 | **Redis** capture/replay | V0.3 | §26 — xem **E1**, mục 3.5 |
| FR-066 | Kafka replay | V0.3 | §26, §19 |
| FR-067 | Background job capture/replay | V0.3 | §26 |
| FR-068 | Distributed tracing | V0.3 | §26, §20.13 |
| FR-069 | Multi-service replay | V0.3 | §26, §14 |
| FR-070 | `repro replay <id> --checkout` — tự động checkout production commit | Future | §15 |
| FR-071 | Minimal database snapshots cho trường hợp query-result replay không đủ | Future | §26, §11 |
| FR-072 | Race-condition replay | Future | §26, §20.13, §19 |
| FR-073 | Automatic environment reconstruction | Future | §26 |
| FR-074 | `repro explain <id>` — AI root-cause analysis | Future | §27, §26, §19 |
| FR-075 | AI execution-diff explanation | Future | §27 |
| FR-076 | AI relevant-commit identification | Future | §27 |
| FR-077 | AI suggested fix / automatic code fixes | Future | §27, §26, §19 |
| FR-078 | AI-generated regression tests | Future | §26, §27 |
| FR-079 | AI-generated GitHub issue | Future | §27 |
| FR-080 | Automatic GitHub pull request generation | Future | §26, §27 |
| FR-081 | Full production environment cloning + full production database snapshot | **Loại vĩnh viễn** | §19 — trái §33.1 và §40 |
| FR-082 | Hạ tầng ngoài product boundary: Kubernetes orchestration, enterprise billing, large observability dashboard | **Loại vĩnh viễn** ở dạng đã nêu | §19, §20.15, §33.2 |

> **Ghi chú**: `FR-081` và `FR-082` gộp nhiều mục §19 cùng loại vì chúng chia chung một **lý do loại trừ** (trái nguyên tắc sản phẩm §33.1/§40, hoặc nằm trong danh sách scope explosion §20.15) chứ không phải chung một lịch giao.

> **Điều kiện tiên quyết cho toàn bộ nhóm AI (`FR-074`…`FR-080`)**: §27 nói thẳng — *"these features should come after the replay engine is proven reliable"*. AI là **layer phía trên** Repro, không phải core product (§27).

---

## 6. Non-Functional Requirements

**Toàn bộ NFR nằm ở tài liệu riêng: [NFR-Repro](./NFR-Repro.md).** Mục này **không nhắc lại** để tránh hai bản khác nhau của cùng một con số.

Năm ràng buộc phi chức năng quan trọng nhất, ở mức PRD cần biết:

1. **Repro không được là nguyên nhân production chậm đi hoặc lỗi** (§20.7). Đây là ràng buộc mạnh nhất của toàn sản phẩm — nó thắng mọi yêu cầu về độ đầy đủ của capture.
2. **Safe by default** (§33.6, §20.4): replay **không bao giờ** được vô tình kích hoạt side effect thật (charge card, gửi email, tạo shipment, gửi webhook, xoá record, publish event — §13).
3. **Privacy by default** (§33.4): production data luôn được coi là dữ liệu nhạy cảm. Redaction, encryption, retention và access control là **MVP capability**, không phải tính năng thêm sau (§21, mục 3.4).
4. **Determinism over magic** (§33.5): hệ thống phải giải thích **chính xác** cái gì đã được capture và cái gì đã được replay. Không có hành vi ngầm.
5. **Minimal integration effort** (§20.14): `npm install @repro/node` + `repro.init()`. Nếu tích hợp đòi hỏi hạ tầng đáng kể thì adoption sẽ hỏng — và §21 xếp Developer adoption là 🔴 Critical.

Bốn ngưỡng số của §24 **không** nằm ở mục này. Xem mục 9.

---

## 7. User Flows & UX Requirements

### 7.1 Journey chính — 5 bước (§8)

| Bước | Hành động | Giao diện | UC |
|---|---|---|---|
| 1 | Production capture incident. Developer thấy: `BUG-1842 — Checkout failed. Repro Capsule available.` | Thông báo từ hệ thống hiện có (Sentry/APM — §34) | [UC-01](./Use-Cases/UC-01-Capture-Failed-Production-Execution.md) |
| 2 | Developer retrieve capsule | `repro pull 1842` | [UC-02](./Use-Cases/UC-02-Replay-Capsule-Locally.md) |
| 3 | Developer replay | `repro replay 1842` → in checklist từng loại input đã phát lại, kết luận `💥 BUG REPRODUCED` hoặc `⚠️ Execution diverged` | [UC-02](./Use-Cases/UC-02-Replay-Capsule-Locally.md), [UC-03](./Use-Cases/UC-03-Read-Execution-Diff.md) |
| 4 | Developer fix code | — | — |
| 5 | Developer verify fix | `repro verify 1842` → `Before fix: ✗ reproduced` / `After fix: ✓ execution no longer reproduces` | [UC-04](./Use-Cases/UC-04-Verify-Fix.md) |

Duyệt và xem nội dung capsule (`repro list` / `repro inspect`) là luồng riêng: [UC-05](./Use-Cases/UC-05-Browse-And-Inspect-Capsules.md).

### 7.2 Journey so sánh (§30)

**Without Repro**: `Production Bug → Logs → Traces → Investigate → Guess state → Try locally → Cannot reproduce → More investigation → Fix → Deploy → Hope`

**With Repro**: `Production Bug → Repro Capsule → repro replay → Execution reproduced → Inspect execution → Fix → repro verify → Regression test`

> ✅ **M1 ĐÃ CHỐT 2026-08-14.** Bước cuối (`Regression test`) của journey §30 **thuộc V0.2** theo §26 — quyết định giữ nguyên §26, **không** kéo regression test generation về V0.1. Ở V0.1, journey "With Repro" **kết thúc ở `repro verify`**, và đó là đường đi chuẩn được cam kết của MVP chứ không còn là phương án tạm. Chi tiết + lý do ở mục 8.2, quyết định ở mục 10.4.

### 7.3 Ràng buộc UX từ Killer Demo (§25)

§25 đặt ra một ràng buộc UX rất cụ thể: **toàn bộ value proposition phải hiểu được trong một demo 60–90 giây**, gồm 6 nhịp — production error → developer nói *"I can't reproduce this locally"* → `repro replay 1842` → `💥 BUG REPRODUCED` → developer fix → `repro verify 1842`.

Ba yêu cầu UX rút ra:

- **UX-01**: Không được yêu cầu dashboard hay hạ tầng phức tạp để trình bày giá trị sản phẩm (§25 nói thẳng: *"without requiring a large dashboard or complicated infrastructure"*).
- **UX-02**: Output của `replay` phải là checklist đọc được ngay, liệt kê **từng loại input đã phát lại** rồi mới tới kết luận (§8, §25).
- **UX-03**: Output của `verify` phải dùng đúng ngôn từ §20.16 (`✓ Original failure no longer occurs`), không được nâng mức khẳng định.

> **`60–90 giây` là ràng buộc UX cho demo, KHÔNG phải NFR về performance của sản phẩm.** Xem [NFR-Repro](./NFR-Repro.md) mục 6.

> ⚠️ §25 nhịp 6 in dòng `✓ Regression case generated` — trong khi §26 đặt regression test generation ở V0.2. **`RQ.md` vẫn tự nói ngược ở hai section này.** ✅ **M1 đã chốt 2026-08-14 theo phía §26** ⇒ dòng `✓ Regression case generated` **không thuộc output của V0.1**; demo §25 ở V0.1 dừng ở hai dòng kết quả của §8 Step 5. Xem mục 8.2, mục 10.4 và [UC-04](./Use-Cases/UC-04-Verify-Fix.md) mục 7.2.

---

## 8. Success Metrics

### 8.1 North Star Metric (§31)

> **Number of production bugs successfully converted into deterministic local test cases.**

§31 kèm một khối ví dụ (`2,431 production bugs captured / 1,827 successfully replayed / 1,203 converted into regression tests`). **`RQ.md` ghi rõ đó là "Example"** — nó minh hoạ **cách đọc** metric, không phải target. Ba con số này **không được** dùng làm KPI, và cố ý không đưa vào bảng nào của tài liệu này.

> ✅ **ĐÃ CHỐT 2026-08-14**: North Star §31 là metric **dài hạn**, **kích hoạt từ V0.2** (khi regression test generation tồn tại). Metric chính thức của **V0.1** là chỉ số ở mục 8.2.

### 8.2 M1 — North Star Metric của V0.1 không đo được bằng chính V0.1 — ✅ **ĐÃ CHỐT 2026-08-14**

**Đây là một mâu thuẫn nội tại của `RQ.md`. Hai phía dưới đây được giữ nguyên làm bằng chứng — `RQ.md` vẫn tự nói ngược ở chính những section này; quyết định chỉ nói ta chọn phía nào, nó không xoá mâu thuẫn trong tài liệu gốc.**

| Phía "regression generation thuộc V0.1" | Phía "regression generation thuộc V0.2" |
|---|---|
| §25 Killer Demo — chính là demo bán MVP — in `✓ Regression case generated` | §26 đặt **Regression test generation** trong danh sách **V0.2 — Developer Workflow** |
| §30 journey "With Repro" kết thúc bằng `Regression test` | |
| §31 **North Star Metric** đếm *"converted into regression tests"* | |
| §37 chuỗi outcome của MVP kết thúc bằng `Regression Test` | |

**Hệ quả**: nếu giữ §26, thì V0.1 **không có tính năng nào tạo ra regression test**, nên chỉ số dùng để đánh giá thành công của V0.1 **không có dữ liệu để đo**. Đây không phải lỗi biên tập nhỏ — nó là lỗi ở tầng *"làm sao biết sản phẩm thành công"*.

#### ✅ Quyết định — **ĐÃ CHỐT 2026-08-14**

| Hạng mục | Quyết định |
|---|---|
| **Regression test generation** | **Giữ nguyên §26 — thuộc V0.2.** **Không** kéo về V0.1 (`FR-056`, mục 5.8) |
| **North Star Metric §31** | Giữ nguyên làm metric **dài hạn**, **kích hoạt từ V0.2** |
| **Metric chính thức của V0.1** | **Số production bug đạt trạng thái `Execution matched`** — số bug đã capture, replay, và **verification xác nhận execution tương đương** (§10, `FR-039`, `FR-041`) |

**Lý do chốt**: `Execution matched` là trạng thái **mạnh nhất mà V0.1 tự sinh ra được**, và nó đo đúng thứ V0.1 tồn tại để chứng minh — rằng execution được **tái hiện thật**, không chỉ *"chạy xong"*. Nó cũng là chỉ số trực tiếp chống risk 🔴 Critical §20.3 (*Replay Without True Equivalence* — §21 gọi là **false replay equivalence**): replay chạy xong nhưng đi một execution path khác. Về vị trí trong chuỗi §37, nó là **bước ngay trước** regression conversion, nên khi V0.2 bật North Star §31 lên thì hai chỉ số nối tiếp nhau chứ không phải thay thế nhau.

**Hệ quả bắt buộc phải theo dõi — `N-05` nay là gap nặng, không còn là ghi chú phụ**:

`N-05` (**Execution Match Rate**) ở §23 trước đây chỉ là *"metric được yêu cầu đo nhưng không có ngưỡng"*. Sau quyết định này, nó **trở thành chỉ số thành công chính của V0.1** — trong khi §24 vẫn **không đặt ngưỡng nào** cho nó (§24 chỉ đặt ngưỡng cho Replay Success Rate, latency overhead, average capsule size, replay time). Không có ngưỡng ⇒ **không có tiêu chí pass/fail cho chính V0.1**. Chi tiết ở [NFR-Repro](./NFR-Repro.md) mục 3.

**Điểm yếu vẫn còn nguyên, không được quyết định này lấp**: chỉ số này **phụ thuộc vào định nghĩa "sufficiently equivalent"** — thứ hiện chưa có (`ACG-01`, mục 10.5). Không định nghĩa được nó thì vẫn không đo được chỉ số này. `U-04`/`ACG-01` giữ nguyên trạng thái **TBD**.

### 8.3 Supporting metrics (§32)

| # | Metric | Định nghĩa §32 | Đo được ở V0.1? |
|---|---|---|---|
| SM-1 | **Activation** | `Installation → First successful replay` | **Có** |
| SM-2 | **Replay Success Rate** | `Successful replays / Captured executions` | **Có** |
| SM-3 | **Time to Reproduce** | So sánh *Before Repro* với *With Repro* | **Không** — xem cảnh báo dưới |
| SM-4 | **Regression Conversion** | `Production bugs → Reproduced bugs → Regression tests` | **Không** — theo **M1 đã chốt 2026-08-14** (giữ §26), metric này **kích hoạt từ V0.2** cùng North Star §31 |
| SM-5 | **OSS Adoption** | GitHub stars, forks, contributors, package downloads, active installations, active developers, integrations | **Có**, nhưng là adoption metric, không phải chất lượng sản phẩm |

> ⚠️ **`Hours / Days → Minutes` (§32, SM-3) không phải là một target.** Đó là một **outcome metric không test được** trong phạm vi kỹ thuật: nó cần baseline "thời gian reproduce trước khi có Repro" mà repo **không có dữ liệu nào** (không user research, không survey). Ghi nhận nó như **hypothesis cần validate**, không đặt nó thành cam kết. Xem [NFR-Repro](./NFR-Repro.md) mục 6.

### 8.4 Điều kiện xem xét lại sản phẩm (§24, §39)

§24 nêu một điều kiện dừng, đáng coi là "success criteria phủ định":

> If the spike cannot achieve a useful replay rate on a meaningful class of bugs, the product concept should be reconsidered before building the full platform.

⇒ Success của giai đoạn hiện tại **không phải** là "xây xong MVP", mà là **technical spike §22 trả lời được câu hỏi §39**.

> ✅ **`CHỐT GATE-01 — 2026-08-14`: Phase 0 technical spike = `Go`.** Trước quyết định này, spike-trước-MVP là **khuyến nghị đọc ra từ §39**. Nay nó là **quyết định đã ghi** của anh: Phase 0 được bật, và được coi là **điều kiện đầu tư** — không phải một task trong backlog. `Sponsor` = **`@TrisJr`** · `Manager` = **`@TrisJr`** · Owner của **18/18 risk** = **`@TrisJr`**. Trích dẫn §24 và §39 ở trên **giữ nguyên** làm bằng chứng: chúng vẫn là căn cứ văn bản của quyết định, quyết định không thay chữ của nguồn.
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị bảng Goals ở mục 2.2 chiếm.
>
> ⚠️ **`GATE-01-r` — `Go` KHÔNG tự làm cho spike đo được.** Bốn khoảng hở vẫn nguyên sau quyết định: `ACG-01` (không có định nghĩa *"sufficiently equivalent"* ⇒ không **tính** được Execution Match Rate), `ACG-02` (không có tiêu chí chọn test case *meaningful*), `ACG-03` (không có denominator cho `≥ 80%`, và không rõ *"reproduced"* là replay success hay execution match), `ACG-07` (không có *"Supported Execution Class"*). Chạy spike ở trạng thái này vẫn **không kết luận được pass/fail**. Chi tiết bốn khoảng hở: [NFR-Repro](./NFR-Repro.md) mục 7. Rủi ro được ghi tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2.

---

## 9. Validation Hypotheses

> **Mục này tách riêng khỏi mục 5 (Functional Requirements) và mục 6 (Non-Functional Requirements) một cách có chủ ý.** Các con số dưới đây **không phải acceptance criteria**, **không phải cam kết sản phẩm**, và **không được dùng để nghiệm thu bất kỳ hạng mục nào.**

`RQ.md` §24 tự vô hiệu hoá chúng, trích **nguyên văn**:

> **These numbers should be treated as initial hypotheses, not final product commitments.**

Và §22–§23 định vị chúng là metric của **technical spike** — thứ chạy **trước** khi xây MVP (§39) — chứ không phải chỉ tiêu của sản phẩm.

> ✅ **`CHỐT GATE-01 — 2026-08-14`: spike đã được bật (xem mục 8.4).** Điều này **KHÔNG** thay đổi tư cách của bốn con số dưới đây: chúng **vẫn là hypothesis**, **không** trở thành acceptance criteria chỉ vì spike đã có `Go`. §24 tự nói *"initial hypotheses, not final product commitments"* — quyết định của anh bật **việc chạy spike**, nó **không** đặt ngưỡng nghiệm thu nào.
>
> ⚠️ **`GATE-01-r` áp trực tiếp vào mục này**: bốn ngưỡng ở 9.1 vẫn thiếu định nghĩa đo (9.3), và `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở. Spike có thể chạy xong, báo cáo đủ số liệu, mà **không ai kết luận được đạt hay không đạt**. Rủi ro tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2.

### 9.1 Bốn ngưỡng đề xuất (§24)

| Hypothesis | Ngưỡng §24 | Đo bằng metric §23 |
|---|---|---|
| VH-1 | `≥ 80%` meaningful deterministic test cases reproduced | Replay Success Rate |
| VH-2 | `< 5%` production latency overhead | Capture Overhead (Latency) |
| VH-3 | `< 10 MB` **average** capsule size | Capsule Size (Average) |
| VH-4 | `< 30 seconds` replay time | Replay Time |

### 9.2 Metric §23 mà technical spike phải đo

§23 yêu cầu spike đo 5 nhóm: **Replay Success Rate**, **Execution Match Rate**, **Capture Overhead** (CPU / Memory / Latency / Network), **Capsule Size** (Average **và P95**), **Replay Time**.

Đối chiếu §23 với §24 lộ ra một khoảng trống: **Execution Match Rate**, **CPU / Memory / Network overhead**, và **P95 capsule size** đều **được yêu cầu đo nhưng không có ngưỡng nào**. Chi tiết ở [NFR-Repro](./NFR-Repro.md) mục 3.

### 9.3 Vì sao không nâng bốn ngưỡng này thành acceptance criteria

Ngoài việc §24 tự nói không nên, mỗi ngưỡng còn thiếu định nghĩa đo:

- `VH-1` — **denominator chưa xác định** (80% trên tổng nào?) và **"reproduced" chưa rõ** là *replay success* hay *execution match*, trong khi §23 phân biệt hai chỉ số này.
- `VH-2` — chưa nói percentile nào, baseline nào, và áp cho bao nhiêu phần trăm traffic.
- `VH-3` — chưa nói trước hay sau compression, trước hay sau redaction.
- `VH-4` — chưa nói mốc bắt đầu tính từ đâu (có tính `repro pull` và thời gian boot app local không).

Đầy đủ ở [NFR-Repro](./NFR-Repro.md) mục 2 và mục 7.

---

## 10. Open Questions

### 10.1 Đã được `RQ.md` trả lời — đóng

| §38 | Câu hỏi | Đáp án | Neo |
|---|---|---|---|
| **Q4** | Which initial stack should be supported? | **Node.js + PostgreSQL + HTTP** | §18 *"Start with…"*, §22 test app, §26 V0.1, §20.14 `@repro/node` — xem mục 3.1 (**E6**) |

### 10.2 PM đã chốt kèm neo văn bản — ghi lại để truy vết

| §38 | Câu hỏi | Quyết định | Neo |
|---|---|---|---|
| **Q5** | Should V0.1 support only failed executions? | **Có — V0.1 chỉ capture failed executions** (`FR-012`) | §20.7 *"capture only failed/high-value executions"*, §18 (stack trace chỉ tồn tại khi failure), §37 |
| **Q6** | Should manual recording also be supported? | **Không** ở V0.1 → Non-Goal `NG-12` | §18 CLI **không có** lệnh `record`, §26 V0.1 chỉ ghi "Production capture", §20.15 product boundary |
| **Q9** | Where should the replay boundary sit for microservices? | **Replay boundary = service boundary của service đang điều tra**; service đó chạy code local thật, mọi dependency replay từ recorded response (`FR-037`, `FR-038`) | §14 *"service boundaries can become replay boundaries"*, §20.11, §26 đặt multi-service replay ở V0.3 ⇒ V0.1 là single-service |
| **Q10** | What production data can safely be captured? | **Shape + metadata + internal id**, *không* phải nội dung | Threat model — [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) |
| **Q11** | What should be redacted by default? | Danh sách redaction mặc định đầy đủ ở Security Spec, với **hai đảo chiều so với §16**: environment variable dùng **allowlist** (deny-by-default), free-text **mặc định drop** | §16 chỉ đưa *hình dạng* config; chi tiết ở Security Spec |
| **Q12** | Is self-hosting required from day one? | **Có** (`FR-054`) — và lý do mạnh nhất là **compliance**, không phải bảo mật (**E7**) | §16, §20.6, §20.17, §28 |

### 10.3 Còn mở — chưa có đáp án trong `RQ.md`

| §38 | Câu hỏi | Ghi chú |
|---|---|---|
| **Q1** | Is production → local reproduction a sufficiently painful problem to justify a dedicated tool? | Cần validation với người dùng thật. Repo không có user research |
| **Q2** | Is "Execution Replay" a compelling enough value proposition for developers? | Như trên |
| **Q3** | Is Execution Diff valuable enough to be a core feature? | §9 khẳng định *"This is a key product capability"* nhưng đó là **giả định của tác giả**, chưa validate |
| **Q7** | What percentage of real-world production bugs can realistically be replayed? | Chặn bởi technical spike §22 + §24. Liên quan trực tiếp `VH-1` và `ACG-03` |
| **Q8** | What is the minimum execution context required to achieve a useful replay success rate? | Liên quan trực tiếp `ACG-07` (mục 10.5) |
| **Q13** | What is the minimum integration effort that developers will accept? | §20.14 đề xuất `npm install` + `repro.init()` nhưng chưa có bằng chứng đó là đủ |
| **Q14** | Can a developer install and create their first replay within minutes? | ⚠️ **Đây là một CÂU HỎI, không phải cam kết.** Cụm `"within minutes"` **không được** dùng làm NFR — xem [NFR-Repro](./NFR-Repro.md) mục 6 |
| **Q15** | Should Repro remain fully open source initially? | §28 nói commercial model chỉ nên định nghĩa **sau** khi validate adoption và core replay |
| **Q16** | What capabilities, if any, should eventually become commercial? | **Còn mở**, nhưng đã hẹp lại: **M2 đã chốt 2026-08-14** (mục 10.4) loại **authn + authz + audit log** ra khỏi diện commercial (chúng thuộc OSS core). Phần §28 giữ ở commercial layer — hosted storage, team management, analytics, AI analysis, cloud integrations — vẫn chưa được chốt là danh sách cuối cùng; §28 nói commercial model chỉ nên định nghĩa **sau** khi validate adoption và core replay |

### 10.4 Hai mâu thuẫn nội tại — ✅ **ĐÃ CHỐT 2026-08-14**

> **Hai mục dưới đây không còn là open question.** Phần trình bày hai phía kèm section number được **giữ nguyên** làm bằng chứng: `RQ.md` **vẫn tự nói ngược** ở chính những section đó. Quyết định của anh không xoá mâu thuẫn trong nguồn — nó chỉ ghi lại **ta chọn phía nào và vì sao**.

#### M1 — Regression test generation: V0.1 hay V0.2? — ✅ **ĐÃ CHỐT 2026-08-14: giữ V0.2**

Đã trình bày đầy đủ cả hai phía ở **mục 8.2**. Tóm tắt: §26 đặt ở V0.2; §25, §30, §31, §37 đều giả định nó đã có. Hệ quả: **North Star Metric của V0.1 không đo được bằng chính V0.1.**

**Quyết định**: giữ nguyên §26 — regression test generation thuộc **V0.2**, **không** kéo về V0.1. North Star §31 giữ nguyên làm metric **dài hạn, kích hoạt từ V0.2**. Metric chính thức của V0.1 là **số bug đạt trạng thái `Execution matched`** (§10).

**Lý do**: `Execution matched` là trạng thái mạnh nhất mà V0.1 tự sinh ra được và đo đúng thứ V0.1 tồn tại để chứng minh — execution được tái hiện thật, không chỉ chạy xong; đồng thời là chỉ số trực tiếp chống risk 🔴 Critical §20.3.

**Hệ quả kéo theo**: `N-05` (Execution Match Rate, §23) từ *"metric không có ngưỡng"* trở thành **chỉ số thành công chính của V0.1** ⇒ việc §24 **không đặt ngưỡng** cho nó nay là khoảng hở **nặng hơn trước**. Xem mục 8.2 và [NFR-Repro](./NFR-Repro.md) mục 3. `ACG-01` (định nghĩa *"sufficiently equivalent"*) vẫn **TBD** và vẫn chặn việc đo chỉ số này.

#### M2 — Access control: OSS core hay commercial layer? — ✅ **ĐÃ CHỐT 2026-08-14: OSS core**

| Phía "commercial layer" | Phía "MVP core" |
|---|---|
| §28 xếp **Access control**, **Retention policies**, **Team management**, **Enterprise security** vào *"Potential commercial layer"* | §20.5 (risk 🔴 Critical *Sensitive Production Data*) liệt kê **strict access control** trong mitigation |
| §28 cho OSS core chỉ có *"Basic Self-hosting"* | §21 Risk Matrix đánh `MVP? = Yes` cho *Sensitive data* và *Security exposure* |
| | §20.17 (Compliance) yêu cầu retention policies, deletion, audit logs |

**Hệ quả**: **bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.** Tổ chức làm đúng theo khuyến nghị §20.6 sẽ nhận được một hệ thống chứa dữ liệu production nhạy cảm mà **không có authn/authz, không có retention, không có audit log**.

**Quyết định**: cả ba — **authentication**, **authorization (access control)**, và **audit log** — nằm trong **OSS core**, **không** phải commercial layer. Điều này **ghi đè** phần §28 xếp *Access control* và *Retention policies* vào commercial layer. `FR-024`, `FR-025`, `FR-026` giữ nguyên là MVP (mục 5.2).

**Giữ nguyên ở commercial layer** theo §28: hosted storage · team management · analytics · AI analysis · cloud integrations.

> **Bổ sung sau `✅ CHỐT GATE-05a — 2026-08-14`**: `FR-024` (retention) nay **có giá trị mặc định cụ thể** — **30 ngày** khi không cấu hình (mục 5.2). Trước `GATE-05a`, `FR-024` chỉ nói *"cấu hình được"* mà không có mặc định nào, nên nó là một MVP requirement **không triển khai được tới cùng**. Phần *Retention policies* của §28 vì thế đã bị hai quyết định chạm tới theo hai trục khác nhau: **M2** quyết nó thuộc **OSS core**, **`GATE-05a`** quyết **giá trị mặc định** của nó.

**Lý do**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host — đúng bản §20.6 khuyến nghị vì lý do bảo mật — vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production**. Thiếu audit thì tổ chức **kiểm soát được nhưng không chứng minh được**, trong khi §20.17 yêu cầu audit log như mitigation cho risk 🟠 High.

**Hệ quả kéo theo — `GAP-04` nặng thêm, không nhẹ đi**: trước đây authz/audit *có thể* không được lấp ở bản OSS nên `GAP-04` còn mơ hồ. Nay chúng **chắc chắn phải có trong OSS core**, mà §18 vẫn **không có một CLI verb nào** để vận hành chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều là developer-side. Khoảng trống giao diện vận hành giờ là **nợ tường minh**, không còn là rủi ro giả định. Xem [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md) mục 4.1.

> ⚠️ **Cập nhật sau `✅ CHỐT GATE-04 — 2026-08-14`: `GAP-04` VẪN NGUYÊN.** `GATE-04` chốt **sàn tối thiểu của Capsule Store** (mục 10.5, `U-06`), tức chốt *cái gì phải có*. Nó **không** cấp verb vận hành nào: §18 vẫn không có lệnh để cấu hình/kiểm tra retention, xoá capsule theo yêu cầu compliance, đọc audit log, hay quản lý quyền truy cập. **Không được đọc `GATE-04` như đã đóng `GAP-04`.**
>
> Cụ thể sau `GATE-04`: authn/authz/audit **hook** nay là phần bắt buộc của sàn ⇒ ba capability này chắc chắn tồn tại trong sản phẩm, nhưng **cơ chế** authn/authz vẫn `TBD` và **giao diện vận hành** vẫn `TBD`. Rủi ro này được PM ghi là **`GATE-04-r`** (*"sàn đóng nhưng không vận hành được"*) tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2, cập nhật lên `C-02-r` thay vì tạo mục trùng.

### 10.5 Hai khoảng trống — `ACG-07` còn hở, `U-06` đã chốt phần sàn

> **Trạng thái hai mục trong section này KHÁC nhau kể từ 2026-08-14.** `ACG-07` **vẫn hở nguyên** — không quyết định nào của anh chạm tới nó. `U-06` đã được `✅ CHỐT GATE-04 — 2026-08-14` ở **phần sàn**; phần **cơ chế** authn/authz vẫn `TBD`. Đọc từng mục, **không** suy trạng thái của mục này sang mục kia.

#### `ACG-07` — "Supported Execution Class" chưa hề được định nghĩa

§20.1 là risk 🔴 Critical **số một** của tài liệu (*Insufficient Execution Capture*), và mitigation của nó ghi:

> Limit the MVP to a clearly defined class of deterministic request/response executions.

Nhưng **"clearly defined class" đó không tồn tại ở bất kỳ đâu trong `RQ.md`.** Không có nó thì:

- `FR-012` (chỉ capture failed execution) **không spec được** — capture *class nào* của failed execution?
- **Denominator của §24 không xác định** — `≥80%` là 80% của cái gì (xem `ACG-03`)?
- **Exception flow của [UC-02](./Use-Cases/UC-02-Replay-Capsule-Locally.md) không có spec** — khi execution rơi ra ngoài class được hỗ trợ thì hệ thống hành xử thế nào?
- §19 hứa *"a meaningful class of production executions"* mà không nói class đó là gì.

**Không lấp bằng định nghĩa tự bịa.** Đây là mục **cần định nghĩa**, phương án đề xuất và ràng buộc validate ghi ở [NFR-Repro](./NFR-Repro.md) mục 7.

#### `U-06` — Capsule Store: **sàn tối thiểu đã chốt** — `✅ CHỐT GATE-04 — 2026-08-14`

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` là Goals của V0.1 ở mục 2.2.

**Đây là neo chính của `GATE-04` trong tầng Requirements.**

**Bằng chứng gốc — giữ nguyên 100%.** `repro pull` (§8) và `repro list` (§18) **hàm ý tồn tại một store ở xa có API và có auth**; §28 xếp *"Basic Self-hosting"* vào OSS core; §20.6 vẽ *"Private Storage"*. Nhưng `RQ.md` **không có một dòng đặc tả nào**: không API, không auth, không storage backend, không mô hình triển khai.

Và nó va vào chính guardrail của `RQ.md`: §20.15 liệt kê **"Artifact storage"** như một biểu hiện của scope explosion, còn §20.14 cảnh báo hạ tầng đáng kể sẽ hại adoption — trong khi §8/§18/§28 lại đòi phải có store.

**Vì sao nó thuộc PRD chứ không chỉ SDD**: nếu chấp nhận capsule là **file chuyển tay** cho V0.1 thì MVP **nhỏ hơn đáng kể** so với phương án có store. Đây là quyết định phạm vi, không phải chi tiết kỹ thuật.

> **Phương án "file chuyển tay" ĐÃ BỊ LOẠI vì `D2` (M2, 2026-08-14).** Câu trên **giữ nguyên** làm bằng chứng cho lập luận phạm vi, nhưng kết luận của nó không còn khả dụng: `M2` đặt **authn + authz + audit log vào OSS core** (mục 10.4), và một capsule *chuyển tay qua file* thì **không có chỗ nào** để đặt authz và audit — không có thực thể nào kiểm tra quyền, không có thực thể nào ghi *"ai đã pull gì"*. ⇒ *File chuyển tay* **không còn thoả sàn**, nên nó không còn là phương án tiết giảm phạm vi hợp lệ cho V0.1.

##### Sàn tối thiểu đã chốt

`GATE-04` chốt **sàn tối thiểu** mà Capsule Store của V0.1 bắt buộc phải có:

| # | Thành phần bắt buộc của sàn | Vì sao thuộc sàn |
|---|---|---|
| 1 | **Object/file storage** cho capsule | §20.6 *"Private Storage"*; capsule là artifact (§6) phải nằm ở đâu đó |
| 2 | **Một index** | `repro list` (§18) không thực hiện được nếu không có thứ để liệt kê; `repro pull <id>` (§8) cần tra id → artifact |
| 3 | **Hook authn/authz/audit** | `FR-025` (access control) + `FR-026` (audit log) là **OSS core** theo `D2`/M2 ⇒ store phải có chỗ cắm chúng |

Kèm **3 thao tác tối thiểu** theo `SDD §5.4` — xem [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) §5.4 và [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `D3`.

**Phần sàn ĐÓNG.** `U-06` **không còn** là *"khoảng trống ước lượng MVP"*: phạm vi hạ tầng tối thiểu của V0.1 nay xác định được, nên ước lượng MVP có đáy.

##### Cái mà `GATE-04` KHÔNG chốt

- **Cơ chế** authn/authz cụ thể (token? OIDC? mTLS? mô hình quyền theo user/team/role?) — **vẫn `TBD`**. `GATE-04` chốt *cái gì phải có*, **không** chốt *làm bằng cách nào*. Owner: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế ở [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) §5.4 + [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md).
- **`GAP-04` — giao diện vận hành — vẫn hở nguyên**: §18 không có CLI verb nào cho authz / audit / retention (mục 10.4). Rủi ro **`GATE-04-r`** tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2.

Chi tiết thiết kế: [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md).

---

## 11. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [BRD-001-Problem-Statement](./BRD/BRD-001-Problem-Statement.md) | Nguồn của mục 2.1 — vấn đề cần giải quyết |
| [NFR-Repro](./NFR-Repro.md) | Toàn bộ Non-Functional Requirements, validation threshold, acceptance criteria gaps |
| [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md) | Persona đầy đủ và mức độ bằng chứng của mục 4 |
| [UC-01 — Capture Failed Production Execution](./Use-Cases/UC-01-Capture-Failed-Production-Execution.md) | Luồng capture |
| [UC-02 — Replay Capsule Locally](./Use-Cases/UC-02-Replay-Capsule-Locally.md) | Luồng replay |
| [UC-03 — Read Execution Diff](./Use-Cases/UC-03-Read-Execution-Diff.md) | Luồng đọc diff |
| [UC-04 — Verify Fix](./Use-Cases/UC-04-Verify-Fix.md) | Luồng verify |
| [UC-05 — Browse And Inspect Capsules](./Use-Cases/UC-05-Browse-And-Inspect-Capsules.md) | Luồng duyệt/inspect |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật hiện thực các FR ở mục 5 |
| [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Threat model, redaction list, 43 yêu cầu bảo mật |
| [Roadmap](../010-Planning/Roadmap.md) | Phasing của `FR-056`…`FR-082` (Phụ lục A) |
| [Charter-Repro](../010-Planning/Charter-Repro.md) | Bối cảnh dự án |
| [Risk-Register](../010-Planning/Risk-Register.md) | 18 risk của §21 + risk phát sinh từ threat model + 5 mâu thuẫn nội tại |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — mọi `§N` trong tài liệu này trỏ về đây |
