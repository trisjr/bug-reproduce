---
id: CHARTER-001
type: charter
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# 📜 Project Charter: Repro

> **Nguồn sự thật duy nhất của tài liệu này**: [RQ.md](../999-Resources/RQ.md) — *Repro — Product Proposal* (1995 dòng, status `Concept`). Mọi khẳng định dưới đây đều trích được section number của tài liệu đó. Chỗ nào `RQ.md` không nói, tài liệu này ghi `TBD` thay vì suy đoán.

> [!IMPORTANT]
> **Đây là charter của một ý tưởng đã được cấp vốn cho ĐÚNG MỘT giai đoạn: Phase 0.** `RQ.md` vẫn tự khai `Status: Concept`, `src/` và `test/` của repo vẫn rỗng, và §39 vẫn khuyến nghị **không** bắt đầu bằng việc xây sản phẩm đầy đủ.
>
> Điều đã đổi ngày **2026-08-14**: `✅ CHỐT GATE-01` — anh quyết **Go** cho Phase 0 technical spike, coi đó là **điều kiện đầu tư** chứ không phải một task trong kế hoạch. Xem [§6.4](#64-điều-kiện-phải-chấp-nhận-trước-khi-đầu-tư) và [§7](#7-recommended-next-step).
>
> **Điều CHƯA đổi**: V0.1 và mọi phase sau **chưa được cấp vốn**. Gate của §39 vẫn là gate — nó chỉ mới được *mở để bước vào*, chưa được *đi qua*. Đọc phần từ §3 trở đi như một đề xuất, không phải cam kết.

---

## 1. Project Information

| Trường | Nội dung | Nguồn |
|---|---|---|
| **Project Name** | Repro | `RQ.md` dòng 1 |
| **Sponsor** | **`@TrisJr`** | ✅ **CHỐT GATE-01 — 2026-08-14**. `RQ.md` **vẫn** không có tên người — tên này đến từ quyết định của anh, không từ tài liệu gốc |
| **Manager** | **`@TrisJr`** | ✅ **CHỐT GATE-01 — 2026-08-14**. Cùng người với Sponsor — xem cảnh báo ở [§5](#5-stakeholders) |
| **Type** | Open-source Developer Tool | §frontmatter dòng 6 |
| **Status** | Concept | §frontmatter dòng 5 |
| **Primary goal** | Biến production bug thành reproducible local execution, và về sau thành regression test | §frontmatter dòng 8 |
| **Tagline** | *"Production happened. Now replay it."* | §36 |

---

## 2. Business Case

### 2.1 Bài toán

> **A bug happens in production, but nobody can reproduce it locally.** (§1)

Một production incident điển hình cho developer biết `ERROR #1842 / TypeError / POST /api/checkout / User: 18392 / Trace ID: abc123` (§2.1). Đó là thông tin về **cái gì đã xảy ra** — nhưng thường không đủ để tái hiện nó. Developer vẫn phải tự trả lời 9 câu hỏi mà §2.1 liệt kê: request nào đã kích hoạt lỗi, database trả về dữ liệu gì, external API trả về gì, feature flag nào đang bật, state của user ra sao, version nào đang chạy, system time là bao nhiêu, chuyện gì xảy ra ở service phụ thuộc, và bug có phụ thuộc thứ tự hay timing không.

Kết quả là vòng lặp debug mà §2.1 và §30 mô tả, kết thúc bằng đúng một từ: **Hope**.

### 2.2 Vì sao observability không đóng được khoảng trống này

Observability trả lời *"What happened?"* — logs, traces, metrics, stack trace, timestamps (§3). Nhưng câu hỏi developer cần trả lời là:

> **Can I make the same execution happen again?** (§3)

Repro **không** thay thế observability platform. Nó cộng thêm một **reproducibility layer** lên trên production diagnostics (§3, §34).

### 2.3 Vì sao không clone production

§4 đối chiếu trực tiếp: production có Kubernetes, 20 API replica, PostgreSQL cluster, Redis, Kafka, external API, cloud infrastructure, feature flags, secrets — trong khi local chỉ có Docker, 1 API, local PostgreSQL, local Redis, mock service. Clone toàn bộ môi trường tạo ra độ phức tạp khổng lồ mà không giải quyết được vấn đề.

Vì vậy Repro dùng một abstraction khác:

> **Capture the execution, not the environment.** (§4, §33.1)

### 2.4 Positioning

> **Observability tells you what happened. Repro lets you replay it.** (§29)

Repro **không** định vị là "another monitoring platform" (§29), và **không** nhắm thay thế Sentry / Datadog / APM / logging platform / testing framework / CI-CD (§34) — nó bổ trợ chúng.

### 2.5 One-liner

> **Repro turns production bugs into reproducible local executions.** (§35)

---

## 3. Project Objectives

### 3.1 Key Hypothesis — nguyên văn §37

> **If developers can capture a failed production execution and replay it locally with the same relevant inputs, the time required to diagnose and fix production bugs will decrease significantly.**

Toàn bộ MVP tồn tại để kiểm chứng **một** giả thuyết này. §37 nói rõ MVP phải tối ưu cho đúng một outcome: `Production Bug → Successful Local Replay → Understand → Fix → Regression Test`.

### 3.2 North Star Metric — §31

> **Number of production bugs successfully converted into deterministic local test cases.**

> [!NOTE]
> ### ✅ M1 — ĐÃ CHỐT 2026-08-14
>
> **Bối cảnh mâu thuẫn (giữ nguyên làm dấu vết — `RQ.md` vẫn tự nói ngược ở đây):**
> §26 đặt **Regression test generation** ở **V0.2**. Nhưng ba chỗ khác của cùng tài liệu đều giả định tính năng đó **đã có**: §25.6 (Killer Demo — chính là demo bán MVP) in `✓ Regression case generated`; §30 ("With Repro" journey) kết thúc bằng `Regression test`; và §31 (North Star Metric) đếm *"converted into regression tests"*. Hệ quả: giữ nguyên §26 thì **North Star Metric của V0.1 không đo được bằng chính V0.1**.
>
> **Quyết định**: **giữ §26** — regression test generation thuộc **V0.2**, không kéo về V0.1.
> **Chỉ số thành công của V0.1**: **số bug đạt trạng thái *"Execution matched"*** (§10).
> **North Star §31** giữ nguyên làm metric **dài hạn**, **kích hoạt từ V0.2**.
>
> **Vì sao metric này đúng**: *"Execution matched"* là trạng thái mạnh nhất mà V0.1 **tự sinh ra được**, và nó đo đúng thứ V0.1 tồn tại để chứng minh — rằng execution được **tái hiện thật**, không chỉ chạy xong. Nó cũng là chỉ số trực tiếp chống risk Critical §20.3 (false replay equivalence).
>
> **Hệ quả còn lại**: chỉ số này được đo bởi `N-05` (Execution Match Rate, §23) — mà §24 **không đặt ngưỡng** cho nó. Chỉ số thành công chính của V0.1 hiện **chưa có tiêu chí pass/fail**. Xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md) và [Risk-Register §4](./Risk-Register.md).

### 3.3 Con số trong §31 KHÔNG phải mục tiêu

`2,431 bugs captured / 1,827 replayed / 1,203 converted` — §31 ghi rõ đây là **"Example"**, minh hoạ *cách đọc* North Star Metric. **Không phải target.** Tương tự, `Hours/Days → Minutes` (§32) là outcome metric không test được, và `"within minutes"` (§38.14) là **một câu hỏi cần validate**, không phải cam kết.

---

## 4. High-Level Requirements

### 4.1 Product boundary — điều kiện để một tính năng được xét

§20.15 đặt guardrail cứng: một tính năng chỉ được cân nhắc nếu nó **trực tiếp** cải thiện

> **Capture → Replay → Verify**

Mọi thứ khác để sau. §20.15 cảnh báo cụ thể rằng ý tưởng này rất dễ phình thành APM + distributed tracing + network proxy + database proxy + container runtime + artifact storage + test framework + browser automation.

### 4.2 Ba năng lực lõi (§18)

| Nhóm | Nội dung | Nguồn |
|---|---|---|
| **Capture** | HTTP request, stack trace, database query/result, external HTTP response, feature flag state, clock/timestamp, Git commit, runtime metadata | §18 |
| **Replay** | HTTP request replay, database result replay, external API replay, clock replay, safe side-effect handling | §18 |
| **Analysis** | execution verification, execution diff, code/version mismatch detection | §18 |

### 4.3 Giao diện chính — CLI 6 verb (§18, §33.2)

```bash
repro list
repro pull 1842
repro inspect 1842
repro replay 1842
repro diff 1842
repro verify 1842
```

### 4.4 Target stack khởi điểm

**Node.js + PostgreSQL + HTTP** (§18). §18 nói rõ đây là giới hạn **có chủ đích** để làm giả thuyết lõi trở nên kiểm chứng được. Câu hỏi §38.4 *"Which initial stack should be supported?"* được coi là **đã được chính §18 trả lời** — chống lưng bởi §22 (test app), §26 (V0.1) và §20.14 (`npm install @repro/node`).

### 4.5 Artifact trung tâm — Repro Capsule

Capsule là artifact **portable** đóng gói execution đã capture (§6, §40). Nguyên tắc bất biến của §6: capsule chứa **chỉ thông tin cần thiết để tái hiện execution**, và **không** phải bản sao của môi trường production.

---

## 5. Stakeholders

> [!NOTE]
> **Mức độ bằng chứng.** `RQ.md` **không có** section "Target users". Ba nhóm dưới đây chỉ xuất hiện **đúng một lần**, ở **dòng 7 frontmatter**. PM đã grep xác minh: từ "QA" và "SRE" xuất hiện **duy nhất 1 lần** trong toàn bộ 1995 dòng (chính là dòng 7); từ "developer" xuất hiện 34 lần. Repo **không có** user interview, survey hay số liệu thị trường. ⇒ Đây là **phân cấp giả thuyết**, không phải kết quả nghiên cứu. Chi tiết: [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md).

| Vai | Mức | Vì sao | Neo văn bản |
|---|---|---|---|
| **Software Engineer** | **Primary** | Là người chạy toàn bộ 6 verb CLI, đọc execution diff, sửa code và verify fix. Toàn bộ §8, §9, §25, §30 viết từ góc nhìn này. | §8, §9, §18, §25, §30, §33.2 |
| **SRE / DevOps** | **Secondary — capture-side owner** | Là người sở hữu phía production: cài SDK, cấu hình redaction, quyết định retention, chịu trách nhiệm overhead và self-hosting. Không xuất hiện trực tiếp trong RQ.md nhưng mọi mối quan tâm ở §16, §20.5, §20.6, §20.7, §20.17, §28 chỉ hợp lý khi gán cho vai này. | §16, §20.5–20.7, §20.17, §28 |
| **QA Engineer** | **Activated at V0.2** | Persona mỏng nhất. Gần như toàn bộ giá trị của vai này neo vào **regression test** — mà §26 đặt tính năng đó ở **V0.2**. Với scope V0.1, QA Engineer chưa phải persona của MVP. Xem cảnh báo M1 ở §3.2. | §25.6, §26, §30, §31 |

### 5.1 Bên liên quan quản trị — `✅ CHỐT GATE-01 — 2026-08-14`

| Vai | Người | Ghi chú |
|---|---|---|
| **Sponsor** (chủ quyết định đầu tư) | **`@TrisJr`** | `GATE-01` |
| **Manager** (chủ điều phối) | **`@TrisJr`** | `GATE-01` |
| **Người phê duyệt tài liệu** `draft` → `approved` | **`@TrisJr`** | Đã thực thi lần đầu ở `GATE-03`: duyệt 11 ADR sang `Accepted` |
| **Người sở hữu ngân sách** | **`@TrisJr`** | `GATE-01` |
| **Owner của 18 risk** | **`@TrisJr`** | Xem [Risk-Register §2](./Risk-Register.md) |
| **Pháp chế** | ❌ **KHÔNG CÓ** | Xem cảnh báo bên dưới |

> [!WARNING]
> **Ba điều phải nói thẳng về cấu hình quản trị này.**
>
> 1. **Một người giữ mọi vai.** Đây là trạng thái của **dự án một người**, không phải phân bổ trách nhiệm. Không có ai ở vị trí phản biện độc lập quyết định của Sponsor — kể cả gate đầu tư. Khi dự án có team, đây là hạng mục đầu tiên phải chia lại.
> 2. **`GATE-05a` (TTL mặc định = 30 ngày) được quyết KHÔNG qua pháp chế.** [Threat Model §11.a](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) khai rõ mục này *cần PM **và** pháp chế*. Thực tế chỉ có `@TrisJr`. ⇒ **30 ngày là quyết định vận hành, chưa phải quyết định đã được thẩm định pháp lý.** Trước khi Repro xử lý dữ liệu production của tổ chức có nghĩa vụ GDPR, con số này **phải** được pháp chế rà lại. Đây là **rủi ro được chấp nhận có ý thức**, không phải bỏ sót.
> 3. **`GATE-05b` (crypto-shredding) được quyết bởi Sponsor, không bởi architect.** Threat Model §11.c khai mục này *cần architect*. Hệ quả kỹ thuật — mất bất biến *"replay không cần kết nối mạng"* — được ghi thành `GATE-05b-r` tại [Risk-Register §4.2](./Risk-Register.md).

---

## 6. Assumptions & Constraints

### 6.1 Product Principles — 7 nguyên tắc §33

1. **Replay execution, not infrastructure** — không cố clone production.
2. **Developer-first** — giao diện chính là một CLI đơn giản.
3. **Explain failure** — replay thất bại thì phải chỉ ra production và local khác nhau ở đâu.
4. **Privacy by default** — dữ liệu production luôn được coi là nhạy cảm.
5. **Determinism over magic** — hệ thống phải giải thích chính xác cái gì đã được capture và replay.
6. **Safe by default** — replay **không bao giờ** được vô tình kích hoạt side effect của production.
7. **Narrow before broad** — hỗ trợ một lớp bug nhỏ một cách đáng tin cậy trước khi mở rộng.

### 6.2 Ràng buộc phạm vi

- **Guardrail §20.15**: chỉ nhận tính năng cải thiện trực tiếp `Capture → Replay → Verify`.
- **Narrow stack §18**: Node.js + PostgreSQL + HTTP. Redis **không** thuộc V0.1 capture — §18 (MVP capabilities) và §26 (V0.3) là phát biểu phạm vi tường minh, thắng sơ đồ minh hoạ ở §5/§17. *(Ghi chú: sơ đồ §17 của `RQ.md` liệt kê Redis trong Recorder box — chỗ này của tài liệu gốc cần sửa cho khớp.)*
- **Non-Goals V0.1** — 11 mục ở §19. Trong đó **full production environment cloning** không phải "hoãn" mà là **loại vĩnh viễn**, vì nó trái trực tiếp §33.1 và §40.
- **§20.16 ràng buộc ngôn từ**: replay thành công chỉ chứng minh *"This captured execution no longer fails"*, **không** chứng minh mọi biểu hiện production của bug đã hết. Sản phẩm bắt buộc dùng câu `✓ Captured execution no longer reproduces` thay vì `✓ Production bug is definitely fixed`.

### 6.3 Assumptions của bộ tài liệu này

| # | Assumption | Sai thì hỏng ở đâu |
|---|---|---|
| A1 | `RQ.md` là nguồn sự thật **duy nhất và đủ dùng**. Không có user interview, không có số liệu thị trường, không có code. | Persona và mọi con số trong PRD là *giả thuyết được khai báo*, không phải phát hiện đã kiểm chứng. Mọi tài liệu vì vậy ghi rõ nguồn là proposal. |
| A2 | Các khuyến nghị `RQ.md` tự nêu được coi là **quyết định tạm thời** (stack §18, self-hosting §16/§28, AI là layer phía trên §27). | ADR sẽ ghi sai bối cảnh quyết định.<br>**Cập nhật `✅ CHỐT GATE-03 — 2026-08-14`**: 11 ADR nay ở **`Decision status: Accepted`**, duyệt bởi `@TrisJr`. ⚠ Nhưng `Accepted` **chỉ xác nhận hướng quyết định** — mục `Open items` của chúng vẫn giữ 6 unknown chưa giải (`U-01`, `U-02`, `U-03`, `U-04`, `U-13`, `U-20`). Rủi ro này ghi thành `GATE-03-r` tại [Risk-Register §4.2](./Risk-Register.md). File `status` frontmatter vẫn là `draft`. |
| A3 | 16 câu hỏi ở §38 **không chặn** việc soạn tài liệu; chúng được đưa nguyên vào mục *Open Questions* của PRD thay vì bị trả lời hộ. | Nếu cần đáp án chốt ngay thì PRD chưa dùng được để xuống story.<br>**Cập nhật `✅ CHỐT GATE-02 — 2026-08-14`**: việc *"xuống story"* **đã được hoãn có chủ ý** tới sau khi Phase 0 đóng gate — nên khoảng hở này **không còn chặn tiến độ**. Lý do hoãn: acceptance criteria dựa trên *"execution matched"* chưa kiểm chứng được. Xem [Stories-MOC](../022-User-Stories/Stories-MOC.md). |
| A4 | **Không bịa để lấp chỗ trống.** Trường nào `RQ.md` không nói (ngày tháng, tên người, ngân sách, velocity, kết quả đo thật) đều ghi `TBD`. | Tài liệu có nhiều `TBD`, trông "chưa xong". Đây là đánh đổi có chủ ý và đúng hơn là bịa.<br>**Vẫn đúng sau 2026-08-14.** Năm quyết định `GATE-0N` cấp thêm bốn dữ kiện — tên người (`@TrisJr`), TTL (`30 ngày`), sàn Capsule Store, trạng thái duyệt ADR. Cả bốn đến từ **quyết định của anh**, **không** từ `RQ.md`; mọi chỗ ghi chúng đều nói rõ điều đó. Những gì `RQ.md` không nói mà anh cũng chưa quyết thì **vẫn `TBD`** — xem [Risk-Register §4.2.1](./Risk-Register.md). |
| A5 | **Chưa có ai duyệt** để chuyển tài liệu từ `draft` sang `approved`. Toàn bộ bộ tài liệu ở `draft`. | Chỉ là nhãn trạng thái, sửa rẻ.<br>**Cập nhật 2026-08-14**: nay **đã có người duyệt** — `@TrisJr` (§5.1). Đã thực thi ở `GATE-03` cho 11 ADR. Nhưng **frontmatter `status:` của toàn bộ tài liệu vẫn là `draft`** — `GATE-03` duyệt `Decision status` của ADR, **không** chuyển `status` frontmatter. Hai trường khác nhau, đừng lẫn. |

### 6.4 Điều kiện phải chấp nhận trước khi đầu tư

§24 nói thẳng: nếu technical spike **không** đạt được tỷ lệ replay hữu ích trên một lớp bug có ý nghĩa, thì **khái niệm sản phẩm phải được xem xét lại trước khi xây nền tảng đầy đủ**. Đây là điều kiện dừng, không phải cảnh báo hình thức.

#### ✅ CHỐT GATE-01 — 2026-08-14

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.

| | |
|---|---|
| **Quyết định** | **Go** — bật **Phase 0 technical spike** |
| **Cách hiểu đúng** | Đây là **điều kiện đầu tư**, không phải một task trong kế hoạch. Vốn được cấp cho **đúng Phase 0**; V0.1 chưa được cấp |
| **Người quyết** | `@TrisJr` (Sponsor) |
| **Điều kiện dừng của §24 vẫn hiệu lực** | Không bị quyết định này gỡ bỏ. Spike không đạt ⇒ **xem xét lại khái niệm sản phẩm**, không đi tiếp |

**Phần trích §24 ở trên được giữ nguyên có chủ ý.** Quyết định `Go` **không** làm điều kiện dừng biến mất — nó chỉ ghi lại rằng ta chấp nhận điều kiện đó và bước vào.

> [!WARNING]
> **`GATE-01 = Go` KHÔNG tự làm cho spike đo được** — rủi ro `GATE-01-r` tại [Risk-Register §4.2](./Risk-Register.md).
>
> Bật spike trả lời câu *"có đầu tư hay không"*. Nó **không** trả lời câu *"chạy xong thì kết luận thế nào"*. Bốn khoảng hở vẫn nguyên tại [NFR-Repro §7](../020-Requirements/NFR-Repro.md): `ACG-03` (ngưỡng `≥80%` **không có denominator**, không có định nghĩa *"reproduced"*) · `ACG-02` (**không có tiêu chí chọn test case** — mà chính `ACG-02` đòi chốt *trước khi* chạy spike) · `ACG-01` (*"sufficiently equivalent"* không định nghĩa được) · `ACG-07` (**"Supported Execution Class" không tồn tại ở đâu trong `RQ.md`**).
>
> ⇒ **Chạy spike ở trạng thái hiện tại vẫn không cho ra pass/fail.** Việc phải làm trước khi spike chạy: một **spike protocol** chốt bốn mục này ở dạng *hypothesis có nhãn* (không phải định nghĩa sản phẩm). Tài liệu đó **chưa được viết** — nó là hạng mục kế tiếp, và **không** thuộc phạm vi quyết định ngày 2026-08-14.

---

## 7. Recommended Next Step

§39 khuyến nghị dứt khoát: **KHÔNG** bắt đầu bằng việc xây nền tảng Repro đầy đủ. Bước đầu tiên là một **technical spike** để trả lời đúng một câu:

> **Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?** (§39)

**Hình dạng của spike** (§22): một test app Node.js với `POST /checkout`, phụ thuộc PostgreSQL / Redis / external HTTP API / feature flag / system clock, chạy qua 10 scenario. Quy trình 7 bước cho mỗi scenario, trong đó bước **"Destroy original environment"** là bước then chốt — nó chính là phép thử tính portable của capsule.

**Thứ spike đo** (§23): Replay Success Rate, Execution Match Rate, Capture Overhead, Capsule Size (average **và** P95), Replay Time.

**Ngưỡng đề xuất** (§24): `≥80%` test case tái hiện được, `<5%` production latency overhead, `<10MB` average capsule size, `<30s` replay time.

> [!WARNING]
> **Bốn ngưỡng trên là *initial hypotheses*, KHÔNG phải cam kết sản phẩm** — §24 tự nói nguyên văn: *"These numbers should be treated as initial hypotheses, not final product commitments."* Chúng là metric của **spike**, không phải acceptance criteria của MVP. Chi tiết cách đọc: [NFR-Repro](../020-Requirements/NFR-Repro.md).

**Gate quyết định** (§39): trả lời **Có** ⇒ tiến vào MVP. Trả lời **Không** ⇒ xác định lớp bug nào không replay được và **thu hẹp phạm vi sản phẩm tương ứng** — không phải bỏ, cũng không phải cứ thế đi tiếp.

### 7.1 Trạng thái bước tiếp theo — `✅ CHỐT GATE-01 — 2026-08-14`

| Hạng mục | Trạng thái |
|---|---|
| **Phase 0 (technical spike §22)** | ✅ **Go** — đã được cấp vốn. Owner `@TrisJr`. Xem [Roadmap](./Roadmap.md) |
| **Gate §39 ở cuối Phase 0** | ⏳ **Chưa đi qua.** Hai nhánh Có/Không ở trên **vẫn nguyên hiệu lực** |
| **Spike protocol** (chốt `ACG-01`/`02`/`03`/`07` để spike cho điểm được) | ❌ **Chưa viết** — chặn việc *kết luận* spike, không chặn việc *bắt đầu*. Xem `GATE-01-r` |
| **Phân rã Epic/Story** | ⏸ **Hoãn tới sau gate §39** — `✅ CHỐT GATE-02 — 2026-08-14`. Xem [Stories-MOC](../022-User-Stories/Stories-MOC.md) |
| **V0.1 và các phase sau** | ❌ **Chưa được cấp vốn** |

**Bốn quyết định còn lại của ngày 2026-08-14** không thuộc mục *Recommended Next Step* nhưng ảnh hưởng tới cách đọc phần thiết kế:

| ID | Quyết định | Ghi ở |
|---|---|---|
| `GATE-02` | Spike trước, Epic/Story sau | [Stories-MOC](../022-User-Stories/Stories-MOC.md) |
| `GATE-03` | 11 ADR → `Accepted` (duyệt bởi `@TrisJr`) | [SDD §1.6](../030-Specs/Architecture/SDD-Repro.md) · §6.3 A2 |
| `GATE-04` | Sàn Capsule Store: object/file storage + một index + authn/authz/audit hook | [SDD §3.6](../030-Specs/Architecture/SDD-Repro.md) · [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) |
| `GATE-05a` / `GATE-05b` | TTL mặc định **30 ngày** · crypto-shredding **`MUST-V0.1`** | [Threat Model §11](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) · §5.1 |

---

## 8. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [RQ.md](../999-Resources/RQ.md) | **Nguồn sự thật gốc** của toàn bộ bộ tài liệu này |
| [PRD-Repro](../020-Requirements/PRD-Repro.md) | Yêu cầu sản phẩm chi tiết, Scope/MVP, Success Metrics, Open Questions |
| [BRD-001-Problem-Statement](../020-Requirements/BRD/BRD-001-Problem-Statement.md) | Phát biểu vấn đề đầy đủ (mở rộng §2 của charter này) |
| [Roadmap](./Roadmap.md) | Phân phase Spike → V0.1 → V0.2 → V0.3 → Future |
| [Risk-Register](./Risk-Register.md) | 18 risk của §20–21 + risk phát sinh từ threat model + mâu thuẫn nội tại |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật và index 11 ADR |
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | Ràng buộc phi chức năng và cách đọc 4 ngưỡng §24 |
| [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Threat model, redaction policy, ràng buộc tuân thủ |
| [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md) | Persona và mức độ bằng chứng của từng nhóm |
| [pm-runs/2026-08-14-gates-g1-g5](./pm-runs/2026-08-14-gates-g1-g5/escalations.md) | **Bản ghi gốc** của năm quyết định `GATE-01`…`GATE-05` (**E-01**, kèm phản biện PM đã nêu trước khi anh chọn) và năm rủi ro phát sinh (**E-02**) |
