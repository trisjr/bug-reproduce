---
id: ADR-001
type: adr
status: draft
project: repro
created: 2026-08-14
---

# ADR-001: Replay Execution, Not Environment

**Decision status**: Proposed
**Related to**: [SDD-Repro](./SDD-Repro.md)

## Context

Đây là quyết định nền tảng nhất của Repro. Mọi ADR còn lại là hệ quả của nó.

Bài toán gốc (`RQ.md` §2.1): một incident production cung cấp *what happened* (error type, endpoint, user id, trace id) nhưng không đủ để developer làm cho lỗi xảy ra lại. §2.1 liệt kê 9 câu hỏi developer vẫn phải tự trả lời (request nào, DB trả gì, external API trả gì, feature flag nào bật, state của user, application version, system time, dependent service, ordering/timing) và mô tả vòng lặp debug kết thúc bằng `Hope`.

§3 định vị khoảng trống: observability trả lời *"What happened?"*, nhưng developer cần trả lời *"Can I make the same execution happen again?"*. §3 nói rõ Repro **không** thay thế observability platform mà thêm một *reproducibility layer* lên trên.

§4 loại bỏ cách tiếp cận ngây thơ. Bảng đối chiếu của §4 cho thấy production (Kubernetes, 20 API replicas, PostgreSQL cluster, Redis, Kafka, External APIs, cloud infrastructure, feature flags, secrets) và local (Docker, 1 API, local PostgreSQL, local Redis, mock services) khác nhau **về cấu trúc**, không phải về cấu hình. §4 kết luận nguyên văn: *"This is not practical"* và chốt abstraction thay thế: *"Capture the execution, not the environment."*

§33.1 nâng điều này lên thành product principle số 1 — *"Replay execution, not infrastructure. Do not attempt to clone production."* §40 phát biểu lại ở dạng thesis: Repro không cố làm cho developer chạy production trên laptop, mà làm cho **một execution production trở nên portable**.

§5 mô tả cơ chế: một execution được nhìn như một chuỗi input ngoài (HTTP request → authentication → feature flags → database reads → cache reads → external APIs → business logic → response). Khi lỗi xảy ra, Repro capture *các input ngoài liên quan*; khi replay, ứng dụng local nhận đúng các input đó. §5 nói rõ: *"The local application is not running inside production. It is simply receiving the same relevant inputs that the production execution received."*

§19 dùng làm **tiêu chí đánh giá alternatives**: "Full production environment cloning" và "Full production database snapshots" nằm trong danh sách Non-Goals của V0.1. Nhưng hai mục này **không cùng hạng**: environment cloning trái trực tiếp với §33.1 và §40 ⇒ đây là mục **loại vĩnh viễn ở tầng nguyên tắc**, không phải hoãn; trong khi database snapshot chỉ bị hoãn (§11 và §26 "Future" đều để ngỏ dạng *minimal* snapshot — xem [ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md)).

§20.15 đặt guardrail phạm vi: một tính năng chỉ được xem xét nếu nó trực tiếp cải thiện **Capture → Replay → Verify**.

## Decision

**Repro tái tạo *execution* của production, không tái tạo *environment* của production.**

Cụ thể:

1. **Đơn vị tái tạo là một execution** — một lần chạy request/response đã kết thúc bằng lỗi — chứ không phải một hệ thống đang chạy (§1, §5, §40).
2. **Cơ chế là ghi lại các input ngoài tại boundary rồi phát lại chúng cho code local** (§5, §7). Ứng dụng local chạy trên máy developer, không chạy trong production, và không cần truy cập production lúc replay (§11).
3. **Artifact trung gian là Repro Capsule** — portable, chứa *chỉ* thông tin cần để tái tạo execution đó, và *không* phải bản sao của production environment (§6). Hợp đồng của artifact này thuộc [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md).
4. **Environment cloning bị loại vĩnh viễn khỏi định hướng sản phẩm**, không phải hoãn (§19 + §33.1 + §40). Mọi alternative đề xuất tái dựng môi trường đều bị đánh giá bằng tiêu chí này.
5. **Khi tái tạo không thành công, sản phẩm vẫn phải trả về giá trị** dưới dạng Execution Diff — giải thích execution đã lệch ở đâu (§9), thay vì chỉ báo `Could not reproduce.`
6. **Guardrail phạm vi**: tính năng chỉ được nhận nếu nó trực tiếp phục vụ Capture → Replay → Verify (§20.15).

Hệ quả trực tiếp, được tách thành ADR riêng: database (ADR-003), external input tại boundary (ADR-004), an toàn side effect (ADR-005), tiêu chí xác nhận (ADR-006).

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Clone/tái dựng toàn bộ production environment ở local** | **[stated]** §4, §19, §33.1 | §4 mô tả và kết luận nguyên văn *"This is not practical"*; §19 xếp "Full production environment cloning" vào Non-Goals; §33.1 *"Do not attempt to clone production"*. **Loại vĩnh viễn**, không phải hoãn — vì nó trái nguyên tắc nền tảng §33.1 và thesis §40, chứ không phải vì thiếu nguồn lực. |
| A2 | **Snapshot toàn bộ production database** | **[stated]** §11, §19 | §11: *"The MVP should not attempt to copy the production database"*; §19 Non-Goal. Khác A1 ở chỗ đây là **hoãn có điều kiện**: §11 và §26 "Future" đều để ngỏ dạng *minimal database snapshots* cho trường hợp query-result replay không đủ. Chi tiết ở ADR-003. |
| A3 | **Dựa hoàn toàn vào observability (logs/traces/metrics) để developer tự dựng lại state** | **[stated]** §3, §2.1, §34 | §3 tiêu đề nguyên văn *"Existing Observability Is Not Enough"*; §2.1 mô tả đây chính là vòng lặp `Guess the state → Try locally → Cannot reproduce → Guess again → Deploy → Hope`; §34 xác định Repro **bổ sung** cho Sentry/Datadog/APM chứ không thay thế. Đây là status quo mà sản phẩm tồn tại để thay đổi. |
| A4 | **Automatic environment reconstruction** (tự dựng lại môi trường từ metadata đã capture) | **[stated]** §26 "Future" | §26 xếp mục này ở nhóm **Future**, xa hơn cả V0.3. Diễn giải của em, ghi rõ là diễn giải: mục §26 này chỉ tương thích với §19/§33.1/§40 nếu nó được hiểu là *tái dựng tối thiểu, dẫn xuất từ capsule*, chứ không phải clone production. Không thuộc V0.1 dưới bất kỳ cách đọc nào. |
| A5 | **Record/replay ở tầng thấp** (syscall, VM, hoặc deterministic whole-process record-replay) | **[inferred]** | RQ.md không nêu. Loại vì: §20.7 (*"Repro must never become the reason production becomes slower or fails"*) — record ở tầng này chạy trên production là chi phí quá lớn; §20.15 liệt kê "Container runtime" như biểu hiện của scope explosion; §20.14 đặt kỳ vọng tích hợp ở mức `npm install @repro/node` + `repro.init()`. |
| A6 | **Chạy code của developer bên trong production / ephemeral prod-like environment cho từng bug** | **[inferred]** | RQ.md không nêu. Loại vì: §8 và §33.2 đặt trải nghiệm ở `repro replay 1842` trên máy developer; §13/§20.4 — chạy trong production nghĩa là side effect đánh vào hệ thống thật; §4 vẫn còn nguyên (môi trường đó vẫn không phải môi trường local của developer). |
| A7 | **Developer tự viết failing test từ logs** (reproduction thủ công) | **[inferred]** | RQ.md không nêu như một alternative, nhưng §2.1/§30 mô tả chính xác quy trình này như là *vấn đề*. Loại: nó dựa trên phỏng đoán state, đúng chỗ §2.1 gọi là `Guess the state`. |

## Consequences

### Positive

- **Bỏ được rào cản lớn nhất của reproduction**: không cần production access, không cần parity giữa prod và local (§4, §11).
- **Artifact portable**: capsule di chuyển được qua máy, qua thời gian, qua người (§40). §22 còn dùng bước *"Destroy original environment"* trong quy trình spike để chứng minh chính tính chất này.
- **Phạm vi kỹ thuật hữu hạn và test được**: §18 thu hẹp về Node.js + PostgreSQL + HTTP, làm cho giả thuyết lõi (§37) kiểm chứng được bằng một spike (§22, §39) thay vì bằng một platform.
- **Vẫn tạo giá trị khi tái tạo thất bại**: §9 biến "không reproduce được" thành *"Show me what was different between production and my environment"* — một sản phẩm phụ có giá trị độc lập.
- **Guardrail chống phình phạm vi có sẵn**: §20.15 cho một tiêu chí nhị phân để từ chối tính năng.
- **Tương thích với hạ tầng sẵn có**: §34 định vị Repro nằm giữa Sentry/APM và regression test, không cạnh tranh trực tiếp.

### Negative

- **§20.1 — Insufficient Execution Capture (Critical, RQ.md tự thừa nhận).** Một execution có thể phụ thuộc vào nhiều thứ hơn HTTP/DB/API: environment variables, filesystem state, randomness, system clock, process state, concurrency, network behavior, OS behavior, background jobs. Nếu không capture, replay có thể thất bại. Mitigation của chính §20.1 là *thu hẹp*: giới hạn MVP vào một lớp execution request/response deterministic được định nghĩa rõ, và **không hứa tái tạo mọi production bug**.
- **Lớp execution được hỗ trợ chưa được định nghĩa.** §20.1 yêu cầu *"a clearly defined class"* nhưng RQ.md không có chỗ nào định nghĩa lớp đó. Quyết định này do đó đang đứng trên một phạm vi chưa có biên.
- **§20.2 — Non-Determinism (Critical).** Random, UUID, timestamp, scheduling, concurrency, race condition. §20.2 chỉ cam kết clock capture/replay, UUID *where practical*, deterministic external inputs; phần còn lại hoãn.
- **§20.13 — Race Conditions (Critical but Out of Scope).** Một lớp bug hoàn toàn nằm ngoài tầm với của quyết định này: request replay đơn giản không tái tạo được chúng "reliably". Đây là chi phí cấu trúc, không phải thiếu sót triển khai.
- **§20.3 — Replay Without True Equivalence (Critical).** Vì local chỉ *nhận cùng input* chứ không *chạy trong cùng môi trường*, một replay có thể "thành công" mà đi theo execution path khác. Đây là lý do tồn tại của [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md).
- **§20.16 — False Confidence About Fixes (Critical).** Replay thành công chỉ chứng minh *"This captured execution no longer fails"*, không chứng minh mọi biểu hiện production của bug đã hết.
- **§20.11 — Replay Boundary (High).** Trong kiến trúc phân tán, nếu mock hết thì replay deterministic nhưng kém thực tế; nếu không mock gì thì local setup quá phức tạp. Quyết định này đẩy vấn đề sang chỗ đặt boundary ([ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)).
- **Bug do môi trường gây ra không được tái tạo, mà chỉ được *phát hiện* dưới dạng divergence.** Khác biệt OS, kernel, phiên bản thư viện, filesystem sẽ hiện ra ở §9 diff và ở cảnh báo mismatch (§15, §20.8, §20.9) — nghĩa là gánh nặng chẩn đoán vẫn quay lại developer.
- **§20.7 — Production Performance Overhead (High).** Vì capture phải xảy ra *trong* production, quyết định này đặt code của Repro vào đường đi nóng của khách hàng. §20.7 tự đặt nguyên tắc: *"Repro must never become the reason production becomes slower or fails."*
- **§20.5 / §20.6 (Critical).** Capsule mang dữ liệu execution production ra khỏi production — đó là chi phí *cố hữu* của tính portable ở §40, không phải một lỗi có thể sửa. Xem ADR-002 và Security Spec.
- **§20.14 — Developer Adoption (Critical product risk).** Nếu tích hợp đòi hỏi hạ tầng đáng kể, adoption sẽ hỏng — mà quyết định này bắt buộc phải có một thành phần chạy trong production.

## Open items (TBD)

`findings/architect.md` không gắn unknown bắt buộc nào cho ADR này. Ba mục dưới đây là những chỗ RQ.md tự để ngỏ và có ảnh hưởng trực tiếp tới quyết định — ghi lại để không ai đọc ADR này như đã đủ cơ sở.

| # | Unknown | Nó chặn cái gì |
|---|---|---|
| 1 | **Định nghĩa "Supported Execution Class"** — §20.1 yêu cầu giới hạn vào *"a clearly defined class of deterministic request/response executions"* nhưng RQ.md không định nghĩa lớp đó ở bất kỳ đâu. | Chặn phát biểu phạm vi của V0.1, chặn mẫu số của tỉ lệ reproduce (§23 Replay Success Rate), và chặn việc nói cho user biết bug nào Repro *không* nhận. |
| 2 | **§38 Q7 — bao nhiêu phần trăm production bug thực tế có thể replay được.** RQ.md để ở dạng câu hỏi chưa trả lời. | Chặn kết luận go/no-go của §39, và chặn mọi cam kết định lượng về giá trị sản phẩm. |
| 3 | **§38 Q8 — context tối thiểu cần capture để đạt tỉ lệ replay hữu ích.** Cũng là câu hỏi chưa trả lời. | Chặn phạm vi capture của ADR-003/ADR-004, và chặn ngân sách overhead §20.7. |

Ba mục này chỉ giải được bằng technical spike §22 + §39, không giải được bằng tài liệu. Bốn ngưỡng ở §24 (`≥80%` reproduced, `<5%` latency overhead, `<10MB` capsule, `<30s` replay time) là **giả thuyết validation cho spike** — §24 tự nói *"These numbers should be treated as initial hypotheses, not final product commitments"* — **không** phải acceptance criteria của sản phẩm.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
