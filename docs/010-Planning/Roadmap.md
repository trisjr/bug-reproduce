---
id: ROADMAP-001
type: roadmap
status: draft
project: repro
created: 2026-02-04
updated: 2026-08-14
---

# 🗺️ Roadmap: Repro

> **Nguồn sự thật duy nhất**: [RQ.md](../999-Resources/RQ.md) — §11, §15, §18, §19, §22, §23, §24, §26, §33.7, §39. Mỗi hạng mục dưới đây đều ghi section nguồn. Chỗ nào `RQ.md` không nói, tài liệu ghi `TBD`.

> [!IMPORTANT]
> **Roadmap này không có ngày tháng.** `RQ.md` không chứa một mốc thời gian, một ước lượng effort, hay một thông tin về team size nào. Điền ngày vào đây sẽ là bịa. Roadmap này vì vậy sắp xếp theo **thứ tự và điều kiện chuyển phase**, không theo lịch. Ngày tháng là `TBD` cho tới khi có team và ước lượng thật.

---

## Nguyên tắc phân phase

**§33.7 — Narrow before broad**: hỗ trợ một lớp bug nhỏ một cách *đáng tin cậy* trước khi cố hỗ trợ mọi kịch bản production. Đây là nguyên tắc quyết định thứ tự của toàn bộ roadmap này.

**§20.15 — Product boundary**: một tính năng chỉ được xét nếu nó **trực tiếp** cải thiện

> **Capture → Replay → Verify**

Mọi thứ khác để sau. §20.15 nêu đích danh 8 hướng phình scope cần chặn: APM, distributed tracing, network proxy, database proxy, container runtime, artifact storage, test framework, browser automation.

**Hệ quả của hai nguyên tắc trên lên cách đọc roadmap**: một mục nằm ở phase sau **không** có nghĩa "kém quan trọng", mà có nghĩa "chưa cần để trả lời câu hỏi của phase hiện tại".

---

## Phase 0 — Technical Spike *(trước V0.1)*

> §39 khuyến nghị **dứt khoát**: KHÔNG bắt đầu bằng việc xây nền tảng Repro đầy đủ.

### Mục tiêu — đúng một câu hỏi

> **Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?** (§39)

§22 nói rõ: mục tiêu của spike **không phải** là xây sản phẩm.

### Test application (§22)

Node.js, một endpoint `POST /checkout`. Dependencies: PostgreSQL, Redis, external HTTP API, feature flag, system clock.

> **Lưu ý về Redis**: test app của spike *có* Redis, nhưng điều đó **không** đồng nghĩa Repro *capture* Redis ở V0.1 — xem [E1](#e1--redis-không-thuộc-v01-capture) bên dưới.

### 10 scenario (§22)

| # | Scenario | Ghi chú phạm vi |
|---|---|---|
| 1 | Database state causes bug | |
| 2 | External API response causes bug | |
| 3 | Feature flag causes bug | |
| 4 | Time-dependent bug | |
| 5 | Missing data | |
| 6 | Dependency/version difference | |
| 7 | Randomness | §20.2 đã **hoãn** phần scheduler/race; randomness chỉ hỗ trợ "UUID capture where practical" |
| 8 | Side effect | |
| 9 | Async behavior | Async **trong một execution** nằm trong phạm vi; race **giữa nhiều execution** thì không |
| 10 | Race condition | §20.13 xếp là **Critical but Out of Scope** — hoãn sang tương lai |

### Quy trình 7 bước cho mỗi scenario (§22)

```text
Production-like execution
        ↓
Capture
        ↓
Create Repro Capsule
        ↓
Destroy original environment      ← bước then chốt
        ↓
Run local application
        ↓
Replay
        ↓
Verify execution
```

> [!NOTE]
> **Bước "Destroy original environment" phải được giữ nguyên.** Đây chính là phép thử tính **portable** của capsule (§40) — nếu không phá môi trường gốc thì không chứng minh được capsule tự chứa, và toàn bộ spike mất giá trị.

### Thứ spike phải đo (§23)

Replay Success Rate · Execution Match Rate · Capture Overhead (CPU / Memory / Latency / Network) · Capsule Size (**Average và P95**) · Replay Time.

### Ngưỡng đề xuất (§24)

```text
≥ 80% meaningful deterministic test cases reproduced
< 5%  production latency overhead
< 10 MB average capsule size
< 30 seconds replay time
```

> [!WARNING]
> **Bốn con số này là *initial hypotheses*, KHÔNG phải cam kết sản phẩm.** §24 nói nguyên văn: *"These numbers should be treated as initial hypotheses, not final product commitments."* Chúng là metric của **spike**, không phải acceptance criteria của MVP.
>
> Ngoài ra §24 còn để hở hai chỗ mà [NFR-Repro](../020-Requirements/NFR-Repro.md) ghi lại đầy đủ: (a) **denominator của `≥80%` chưa xác định** — §22 có 10 scenario nhưng §20.2/§20.13 đã hoãn scenario 7/9/10, vậy 80% tính trên 10 hay trên 7? (b) **"reproduced" chưa rõ** là *replay success* hay *execution match* — §23 phân biệt hai chỉ số này. Và §23 đòi đo **P95** capsule size nhưng §24 chỉ đặt ngưỡng cho **average** ⇒ ngưỡng P95 là `TBD`.

### Gate chuyển phase (§39, §24)

- Trả lời **Có** ⇒ tiến vào V0.1.
- Trả lời **Không** ⇒ **xác định lớp bug nào không replay được và thu hẹp phạm vi sản phẩm tương ứng** (§39). Không phải bỏ, cũng không phải cứ thế đi tiếp.
- §24 bổ sung điều kiện dừng cứng: nếu spike không đạt tỷ lệ replay hữu ích trên một lớp bug có ý nghĩa, **khái niệm sản phẩm phải được xem xét lại trước khi xây nền tảng đầy đủ**.

---

## V0.1 — Validate the Core

**Câu hỏi V0.1 phải trả lời** (§19): *"Can we reliably capture and replay a meaningful class of production executions?"*

### 10 hạng mục của §26 V0.1

| # | Hạng mục | Chi tiết từ §18 |
|---|---|---|
| 1 | Node.js | Target runtime duy nhất |
| 2 | PostgreSQL | Database duy nhất được hỗ trợ |
| 3 | HTTP | Giao thức duy nhất được hỗ trợ |
| 4 | Production capture | HTTP request, stack trace, database query/result, external HTTP response, feature flag state, clock/timestamp, Git commit, runtime metadata |
| 5 | Repro Capsule | Artifact portable theo cấu trúc §6 |
| 6 | Local replay | HTTP request replay, database result replay, clock replay, **safe side-effect handling** |
| 7 | External API replay | Trả recorded response thay vì gọi thật (§12) |
| 8 | Execution verification | Phân biệt *"Replay completed"* với *"Execution matched"* (§10, §20.3) |
| 9 | Execution diff | Chỉ ra production và local khác nhau ở đâu (§9) |
| 10 | CLI | 6 verb: `list`, `pull`, `inspect`, `replay`, `diff`, `verify` (§18, §33.2) |

### Capability phi chức năng cũng thuộc V0.1

§18 liệt kê *core replay loop*, **không phải** danh sách đầy đủ mọi capability của MVP. §21 (Risk Matrix, cột **"MVP?"**) mới là nguồn có thẩm quyền cho nhóm phi chức năng — và nó ghi **Yes** cho: Sensitive data (redaction + encryption), Security exposure (private/self-hosted architecture), Compliance (policies + self-hosting), Capsule size (compression + limits), Production overhead (async + bounded capture).

> Đây là **diễn giải để §18 và §21 tương thích với nhau**, không phải điều `RQ.md` nói thẳng. Ghi lại tường minh ở [PRD-Repro §3.4](../020-Requirements/PRD-Repro.md).

### E1 — Redis KHÔNG thuộc V0.1 capture

| Phía nói **có** | Phía nói **không** |
|---|---|
| §5 (execution chain có "Cache Reads" và "Redis → Result B"), §13 ("Cache read" ở nhóm READ), §17 (Recorder box liệt kê Redis), §22 (test app có Redis) | §18 (MVP capture list **không có** Redis), §26 (đặt Redis ở **V0.3**) |

**Quyết định**: §18 và §26 là **phát biểu phạm vi tường minh**; §5/§17 là **sơ đồ minh hoạ kiến trúc chung**; §22 là **dependency của test app**. Phát biểu phạm vi thắng sơ đồ. ⇒ Redis ở **V0.3**. *(Sơ đồ §17 của `RQ.md` cần sửa cho khớp.)*

---

## V0.2 — Developer Workflow

7 hạng mục của §26:

| # | Hạng mục |
|---|---|
| 1 | GitHub integration |
| 2 | GitHub Actions |
| 3 | **Regression test generation** ✅ **M1 — đã chốt ở V0.2** |
| 4 | Browser replay |
| 5 | Better data anonymization |
| 6 | Replay visualization |
| 7 | Next.js support |

> [!NOTE]
> ### ✅ M1 — ĐÃ CHỐT 2026-08-14: regression test generation **giữ ở V0.2**
>
> **Bối cảnh mâu thuẫn (giữ nguyên làm dấu vết — `RQ.md` vẫn tự nói ngược ở đây):**
> **Phía nói V0.2**: §26 xếp thẳng vào V0.2.
> **Phía giả định đã có ở V0.1**: §25.6 (Killer Demo — chính là demo bán MVP) in `✓ Regression case generated`; §30 ("With Repro" journey) kết thúc bằng `Regression test`; §31 (**North Star Metric**) đếm *"converted into regression tests"*.
> Hệ quả: giữ nguyên §26 ⇒ **North Star Metric của V0.1 không đo được bằng chính V0.1**.
>
> **Quyết định**: **giữ §26.** Regression test generation thuộc **V0.2**.
> **Chỉ số thành công của V0.1**: **số bug đạt trạng thái *"Execution matched"*** (§10) — trạng thái mạnh nhất mà V0.1 tự sinh ra được, và là chỉ số trực tiếp chống risk Critical §20.3.
> **North Star §31**: giữ nguyên làm metric **dài hạn**, **kích hoạt từ V0.2** khi tính năng này tồn tại.
>
> **Hệ quả còn lại — chưa giải**: chỉ số thành công của V0.1 được đo bởi `N-05` (Execution Match Rate, §23), mà **§24 không đặt ngưỡng** cho nó ⇒ V0.1 hiện **chưa có tiêu chí pass/fail** cho chính chỉ số thành công của mình. Xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md).
>
> **Ràng buộc kèm theo vẫn nguyên giá trị**: dù tính năng nằm ở V0.2, quyết định về nó **phải chốt ở V0.1** vì regression test *phải* mang dữ liệu production để chạy được và test *phải* được commit ⇒ nó **ràng buộc capsule format** ngay từ v1. Nay thời điểm đã biết chắc, ràng buộc này càng rõ. Chi tiết ở [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) (`THREAT-006`) và [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md).

---

## V0.3 — Distributed Systems

7 hạng mục của §26:

| # | Hạng mục | Ghi chú |
|---|---|---|
| 1 | Python | Mở rộng ngoài Node.js |
| 2 | Go | |
| 3 | **Redis** | Đây là chỗ chính thức của Redis — xem E1 |
| 4 | Kafka | §19 xếp Kafka replay vào Non-Goals của V0.1 |
| 5 | Background jobs | |
| 6 | Distributed tracing | §20.13 nêu đây là hướng để xử lý race condition sau này |
| 7 | Multi-service replay | §14: service boundary trở thành replay boundary; V0.1 là **single-service** |

---

## Future

7 hạng mục của §26, cộng 2 mục `RQ.md` nêu rải rác:

| # | Hạng mục | Nguồn |
|---|---|---|
| 1 | Minimal database snapshots | §26; §11 nói rõ đây là phương án cho trường hợp query-result replay không đủ |
| 2 | Race-condition replay | §26; §20.13 |
| 3 | Automatic environment reconstruction | §26 |
| 4 | AI root-cause analysis | §26; §27 (`repro explain 1842`) |
| 5 | AI-generated regression tests | §26; §27 |
| 6 | AI-generated fixes | §26; §27 |
| 7 | Automatic GitHub PR generation | §26; §27 |
| 8 | `repro replay 1842 --checkout` — tự động checkout production commit | §15 |
| 9 | Minimal database snapshot cho trường hợp record/replay không đủ | §11 |

> **Về nhóm AI (mục 4–7)**: §27 nêu nguyên tắc rõ — **AI là một layer phía trên Repro, không phải sản phẩm lõi**, và các tính năng này chỉ đến **sau khi replay engine đã được chứng minh là đáng tin cậy**.

---

## Non-Goals của V0.1

11 mục của §19, phân biệt **hoãn** với **loại vĩnh viễn**:

| # | Non-Goal | Loại | Vì sao |
|---|---|---|---|
| 1 | Full production environment cloning | **Loại vĩnh viễn** | Trái trực tiếp §33.1 (*"Replay execution, not infrastructure"*) và §40 (*"not trying to make developers run production on their laptops"*). Đây không phải việc để sau — nó là thứ sản phẩm **cố ý không làm**. |
| 2 | Full production database snapshots | Hoãn | §11 để ngỏ "minimal database snapshots" ở Future cho trường hợp record/replay không đủ |
| 3 | Browser replay | Hoãn | §26 V0.2 |
| 4 | Kubernetes orchestration | **Loại vĩnh viễn** | §20.15 xếp container runtime vào nhóm scope explosion |
| 5 | Kafka replay | Hoãn | §26 V0.3 |
| 6 | Distributed race-condition replay | Hoãn | §26 Future; §20.13 |
| 7 | Multi-language support | Hoãn | §26 V0.3 (Python, Go) |
| 8 | AI root-cause analysis | Hoãn | §26 Future; §27 — chỉ sau khi replay engine đáng tin cậy |
| 9 | Automatic code fixes | Hoãn | §26 Future; §27 |
| 10 | Enterprise billing | Hoãn | §28 — commercial model chỉ định nghĩa sau khi validate adoption |
| 11 | Large observability dashboard | **Loại vĩnh viễn** | §29 (*không* định vị là monitoring platform), §33.2 (CLI là giao diện chính), §25 (demo không cần dashboard) |

**Một Non-Goal nữa không nằm trong §19 nhưng đã được chốt**: **manual recording** không có ở V0.1. Neo: §18 (CLI không có lệnh `record`), §26 (V0.1 chỉ "Production capture"), §20.15 (product boundary). Đây là đáp án cho §38.6.

---

## Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [RQ.md](../999-Resources/RQ.md) | Nguồn sự thật gốc |
| [Charter-Repro](./Charter-Repro.md) | Bối cảnh, business case, next step |
| [PRD-Repro](../020-Requirements/PRD-Repro.md) | Scope/MVP chi tiết, Functional Requirements, Success Metrics |
| [Risk-Register](./Risk-Register.md) | 18 risk của §20–21 và các mâu thuẫn nội tại |
| [NFR-Repro](../020-Requirements/NFR-Repro.md) | Cách đọc 4 ngưỡng §24 và các acceptance criteria gap |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật, technical spike plan |
