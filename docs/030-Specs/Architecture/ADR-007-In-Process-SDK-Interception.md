---
id: ADR-007
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-007: In-Process SDK Interception

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.

## Context

Repro Recorder phải quan sát được các input ngoại vi của một execution ở production: HTTP request, database query/result, external HTTP response, feature flag state, clock/timestamp, Git commit, runtime metadata (RQ.md §18 — *MVP capabilities → Capture*). §17 vẽ Recorder như một khối duy nhất đứng giữa PRODUCTION và Repro Capsule, nhưng **§17 không nói khối đó được hiện thực bằng cơ chế gì** — nó là sơ đồ luồng sản phẩm, không phải sơ đồ triển khai.

Câu hỏi kiến trúc do đó là: *đặt điểm chặn (interception point) ở đâu?* Ba họ giải pháp khả dĩ — in-process SDK, proxy ở tầng mạng/DB, hoặc một lớp bao ngoài process (sidecar / container runtime) — cho cùng một dữ liệu nhưng khác nhau hoàn toàn về chi phí tích hợp.

RQ.md đưa ra hai ràng buộc trực tiếp quyết định lựa chọn này:

1. **§20.14 — Developer Adoption, gắn nhãn *Critical Product Risk*.** RQ.md nêu thẳng hai phản ứng mà developer có thể có: *"Another observability SDK."* và *"This looks complicated to install."*, rồi kết luận: *"If integration requires significant infrastructure, adoption will suffer."* Mitigation được RQ.md viết ra dưới dạng code cụ thể — `npm install @repro/node` rồi `repro.init()` — và yêu cầu developer *"capture the first replayable execution with minimal configuration"*. Đây là chỗ hiếm hoi RQ.md đặc tả một quyết định kỹ thuật bằng chính cú pháp cài đặt.

2. **§20.15 — Product Scope Explosion, cũng *Critical*.** RQ.md liệt kê tường minh **"Network proxy"**, **"Database proxy"** và **"Container runtime"** trong danh sách những thứ mà sản phẩm *không được* phình ra thành, kèm product boundary: một tính năng chỉ được xét nếu nó trực tiếp cải thiện **Capture → Replay → Verify**.

Nói cách khác, hai risk Critical riêng biệt của RQ.md cùng chỉ về một hướng: điểm chặn phải nằm **bên trong process của ứng dụng**, không phải ở hạ tầng xung quanh nó. §21 củng cố: hàng *Developer adoption* là `Critical / MVP? Yes / Minimal integration`.

Phạm vi kỹ thuật ban đầu được §18 giới hạn còn **Node.js + PostgreSQL + HTTP**, và §26 đẩy Python/Go sang V0.3 — nghĩa là quyết định này chỉ phải đúng cho **một** runtime ở V0.1, nhưng phải lặp lại cho từng runtime về sau.

Cần ghi rõ một điều RQ.md không ghi: §20.14 mô tả *bề mặt tích hợp* (`npm install` + một dòng `init()`), **không** mô tả *cơ chế* đạt được bề mặt đó. Toàn bộ phần "làm thế nào để `repro.init()` nhìn thấy được query của `pg`" là khoảng trống — xem §Open items.

## Decision

Repro V0.1 chặn input ngoại vi bằng **in-process SDK**, phân phối như một package của chính hệ sinh thái runtime đích và kích hoạt bằng một lời gọi khởi tạo trong ứng dụng:

```bash
npm install @repro/node
```

```javascript
repro.init()
```

(hai đoạn trên là nguyên văn RQ.md §20.14)

Cụ thể:

1. **Recorder chạy trong cùng process với ứng dụng.** Không có proxy đứng trước database, không có proxy đứng trước external API, không có sidecar container, không có container runtime tuỳ biến.
2. **Bề mặt tích hợp bắt buộc tối thiểu**: một dependency + một lời gọi init. Mọi thứ đòi hỏi developer thay đổi topology triển khai đều nằm ngoài V0.1.
3. **Điểm chặn nằm ở ranh giới dependency của ứng dụng** — tức là ở lớp client library (driver PostgreSQL, HTTP client/server, feature flag client, clock), nhất quán với [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md). Cùng một điểm chặn phục vụ **cả hai chiều**: ghi (record) ở production và trả recorded result (replay) ở local, để capsule và replay layer nói chung một ngôn ngữ ([ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md), [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)).
4. **Phạm vi runtime V0.1 = Node.js**, dependency V0.1 = PostgreSQL + HTTP (§18). Redis **không** thuộc V0.1 capture — §18 không liệt kê Redis trong MVP capture list và §26 đặt Redis ở V0.3; sơ đồ §5/§17 và test app §22 có Redis nhưng đó là sơ đồ minh hoạ và dependency của test app, không phải phát biểu phạm vi (quyết định E1 của run).
5. **Không** dựng bất kỳ thành phần hạ tầng mới nào ở production ngoài chính process ứng dụng. Việc capsule đã encrypt đi tiếp về đâu thuộc [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md).

Cơ chế hiện thực cụ thể của việc chặn (`pg`, HTTP inbound/outbound) **chưa được chốt** và được khai báo tường minh ở §Open items — ADR này chốt *vị trí* điểm chặn, không chốt *kỹ thuật* đạt được nó.

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ |
|---|---|---|---|
| A1 | **Database proxy** — đặt một proxy giữa app và PostgreSQL, chặn query/result ở tầng wire protocol | **[stated]** — RQ.md **§20.15** liệt kê nguyên văn `Database proxy` trong danh sách biểu hiện của scope explosion khiến *"the project too large"* | Ưu: không cần chạm code ứng dụng, không phụ thuộc phiên bản driver. Nhược: cần thay đổi topology triển khai ở production ⇒ va thẳng vào §20.14 (*"significant infrastructure"*); mất hoàn toàn ngữ cảnh in-process (stack trace §18, request nào phát ra query nào); và bị §20.15 loại tường minh. |
| A2 | **Network proxy** cho external API (egress proxy / MITM TLS) | **[stated]** — **§20.15** liệt kê nguyên văn `Network proxy` | Ưu: bắt được mọi HTTP kể cả từ library Repro chưa hỗ trợ. Nhược: cần terminate TLS của traffic production; §20.15 loại tường minh; §20.14 chi phí hạ tầng. |
| A3 | **Container runtime** — runtime/ảnh container tuỳ biến bao lấy ứng dụng | **[stated]** — **§20.15** liệt kê nguyên văn `Container runtime`; **§19** đặt `Kubernetes orchestration` ngoài phạm vi V0.1 | Ưu: chặn được cả filesystem, env, process state (đúng nhóm hidden input §20.1). Nhược: bị loại bởi cả §20.15 lẫn §19; và là hình thái nặng nhất của *"complicated to install"* (§20.14). |
| A4 | **Sidecar process** chạy cạnh ứng dụng, nhận dữ liệu qua IPC/local socket | **[inferred]** — RQ.md **không** dùng từ "sidecar" ở bất kỳ đâu. Suy ra như anh em cùng họ với A1–A3 và bị chặn bởi cùng một lập luận §20.14 (*"significant infrastructure"*) | Nhược: vẫn cần một cơ chế in-process để *sinh* dữ liệu gửi sang sidecar ⇒ không loại bỏ được A5/A6, chỉ cộng thêm một thành phần triển khai. |
| A5 | **Process wrapper** — `repro run node app.js`, không cần sửa code ứng dụng | **[inferred]** — RQ.md không nêu. Suy ra từ chính §20.14: wrapper *cũng* thoả *"minimal configuration"* nhưng đổi entrypoint thay vì đổi code | Đây là alternative cạnh tranh **thật sự** với quyết định, không phải rơm. Xem `U-19` ở §Open items — chưa được cân. |
| A6 | **Xây trên SDK observability có sẵn** (ví dụ chuẩn instrumentation của hệ sinh thái) thay vì tự viết lớp chặn | **[inferred]** — RQ.md không nêu. §3 và §34 chỉ nói Repro *bổ trợ* chứ không thay thế observability, **không** nói gì về việc tái sử dụng instrumentation của chúng | Ưu: thừa hưởng sẵn compatibility matrix — thứ mà §21 gọi là risk. Nhược: khuếch đại đúng nhận thức mà §20.14 sợ nhất (*"Another observability SDK."*); và ngữ nghĩa của observability là *sample + tổng hợp*, còn Repro cần **giá trị đầy đủ, chính xác từng byte** để replay. |
| A7 | **Không chặn gì — yêu cầu developer tự gọi API ghi thủ công** ở từng call site | **[inferred]** — RQ.md không nêu | Bị loại thẳng bởi §20.14: đây là mức tích hợp cao nhất có thể, đối cực của `repro.init()`. |

## Consequences

### Positive

- **Đánh trúng risk Critical §20.14.** Bề mặt tích hợp đúng bằng cái RQ.md tự viết ra: một `npm install` + một `repro.init()`. Không thay đổi topology production ⇒ không chạm vào ngân sách chính trị của team platform/SRE.
- **Không vi phạm product boundary §20.15.** Ba trong tám mục của danh sách scope explosion (`Network proxy`, `Database proxy`, `Container runtime`) bị loại ngay từ quyết định kiến trúc, không phải bằng kỷ luật ý chí về sau.
- **Giữ được ngữ cảnh in-process.** Stack trace (§18 capture list) và việc quy một query/HTTP call về đúng execution nào chỉ khả thi rẻ khi recorder ở trong process. Proxy chỉ thấy được luồng byte, không thấy được *ai* gọi.
- **Một điểm chặn phục vụ cả record lẫn replay.** Cùng lớp chặn ở production ghi ra capsule và ở local trả recorded result (§11, §12) ⇒ giảm nguy cơ hai đường code phân kỳ, phục vụ §33.5 *"Determinism over magic"*.
- **Phù hợp §33.2 Developer-first** và mô hình OSS core §28 (`Repro SDK` được liệt kê là thành phần đầu tiên của OSS core).
- **Chi phí V0.1 bị chặn bởi §18**: chỉ một runtime (Node.js), hai lớp dependency (PostgreSQL, HTTP).

### Negative

- **Compatibility matrix là nợ vĩnh viễn, không phải task một lần.** §21 xếp *Compatibility matrix* ở `Medium / MVP? Yes / Narrow initial support` — nghĩa là RQ.md **tự thừa nhận** đây là risk có mặt ngay từ MVP. Hệ quả trực tiếp của in-process interception: mỗi phiên bản driver mới, mỗi major version của runtime, mỗi HTTP client mà cộng đồng chuyển sang dùng là **một mặt trận bảo trì mới**. Chi phí này **tăng tuyến tính theo mức độ thành công của sản phẩm** và không có điểm kết thúc. Proxy (A1/A2) sẽ không có khoản nợ này — đây là cái giá có ý thức phải trả cho §20.14.
- **Mỗi ngôn ngữ là một lần hiện thực lại từ đầu.** §19 đặt `Multi-language support` ngoài phạm vi V0.1 và §26 đưa Python, Go vào V0.3. Cơ chế chặn của Node.js **không tái sử dụng được** cho runtime khác ⇒ chi phí mở rộng ngôn ngữ là chi phí xây mới, không phải chi phí cấu hình.
- **Recorder chia sẻ số phận với process ứng dụng.** §20.7 đặt nguyên tắc: *"Repro must never become the reason production becomes slower or fails."* In-process là hình thái **rủi ro nhất** đối với đúng nguyên tắc đó: một lỗi trong lớp chặn có thể làm hỏng chính request nó đang quan sát. Proxy cô lập được rủi ro này; in-process thì không. Ràng buộc vận hành phái sinh (async, bounded, fail-safe) nằm ở [ADR-008](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md).
- **Chỉ thấy được cái đi qua library đã instrument.** §20.1 (*Insufficient Execution Capture — Critical*) liệt kê nguyên văn nhóm input ẩn: `Environment variables`, `Filesystem state`, `Randomness`, `System clock`, `Process state`, `Concurrency`, `Network behavior`, `OS behavior`, `Background jobs`. In-process interception ở tầng client library **theo cấu trúc** không phủ được phần lớn nhóm này. RQ.md thừa nhận và mitigation của chính nó là thu hẹp phạm vi (§20.1), chứ không phải bịt lỗ.
- **Đường vòng qua lớp chặn là fail-open.** Lens `security-auditor` của run này chỉ ra (đồng thuận độc lập với `U-12` của lens kiến trúc): các đường I/O không đi qua sink đã instrument — socket thô, gọi tiến trình con để chạy công cụ mạng, SDK dùng transport riêng — sẽ **không bị nhận diện**, và cơ chế phân loại READ/WRITE của §13 vì thế fail-open đúng ở chỗ nguy hiểm nhất. Ràng buộc bù (fail-closed, allowlist egress lúc replay) là việc của [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md), nhưng **nguyên nhân gốc là giới hạn phủ sóng của quyết định trong ADR này**.
- **Nhận thức *"Another observability SDK."* (§20.14) không bị loại bỏ bởi quyết định này — nó bị *khuếch đại*.** Sản phẩm giao cho developer đúng thứ hình dạng mà §20.14 cảnh báo. Việc phân biệt phải đến từ định vị (§29) và từ trải nghiệm đầu tiên, tức là từ ngoài phạm vi ADR này. Đây là rủi ro còn lại đã biết, không có mitigation kỹ thuật.
- **Recorder có toàn quyền đọc dữ liệu trong process.** Đặt recorder in-process nghĩa là nó thấy được mọi thứ ứng dụng thấy — điều này làm redaction gate (§16) trở thành control point duy nhất, và làm mô hình lạm dụng từ nội bộ trở nên đáng kể (xem [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md) và [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md)).

## Open items (TBD)

| ID | Unknown | RQ.md nói gì | Nó chặn cái gì |
|---|---|---|---|
| `U-01` | **Cơ chế chặn driver PostgreSQL (`pg`)** — monkey-patch prototype của module? wrapper client do Repro cung cấp? hook ở tầng protocol trong process? diagnostics channel của runtime? | §18 yêu cầu capture `database query/result`; §11 mô tả replay layer trả recorded result. RQ.md **không có một dòng nào** về cơ chế. | Chặn: ước lượng công sức V0.1; chặn việc biết trước sẽ vỡ ở phiên bản `pg` nào; chặn thiết kế định danh query để match lúc replay (`U-02`, thuộc [ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md)); chặn technical spike §22. |
| `U-03` | **Cơ chế chặn HTTP — cả outbound lẫn inbound.** Hai chiều là hai bài toán khác nhau: outbound cần thay response trả về cho app (§12); inbound cần tái tạo request lúc replay (§18 *HTTP request replay*). | §18 liệt kê cả `HTTP request` (capture) lẫn `external HTTP response`; §12 mô tả thay response. Cơ chế: **không có**. | Chặn: đặc tả `repro replay` (nạp request vào app bằng cách nào — gọi handler trực tiếp hay dựng HTTP thật ở loopback); chặn ranh giới với [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md) về egress allowlist; chặn `U-10` của [ADR-011](./ADR-011-Execution-Diff-First-Class.md). |
| `U-19` | **Library vs process wrapper** — `repro.init()` trong code (A5 là `repro run …`)? Hay hỗ trợ cả hai? | §20.14 chỉ nêu hình thái library (`npm install` + `repro.init()`). RQ.md **không cân** phương án wrapper. | Chặn: hợp đồng cài đặt trong tài liệu onboarding; chặn câu hỏi §38.13 (*"What is the minimum integration effort that developers will accept?"*) — vốn RQ.md để mở; chặn việc chặn được các dependency được nạp **trước** `repro.init()` (vấn đề thứ tự khởi tạo mà hình thái library luôn có còn wrapper thì không). |
| `U-C1` | **Compatibility matrix là nợ vĩnh viễn — chưa có chính sách.** Hỗ trợ bao nhiêu major version của driver? Hành vi khi gặp phiên bản chưa biết: từ chối chạy, chạy mà cảnh báo, hay im lặng không capture? | §21 khai risk `Compatibility matrix / Medium / MVP? Yes / Narrow initial support`. "Narrow initial support" là *hướng*, không phải *chính sách*. | Chặn: hợp đồng hành vi của SDK khi gặp môi trường ngoài matrix; chặn cam kết bảo trì trong tài liệu OSS (§28); và im lặng-không-capture là kịch bản tệ nhất vì nó tạo capsule thiếu input — nối vào quyết định **E9** (thiếu input lúc replay ⇒ divergence + incomplete capture, không crash, **không** fallback gọi hệ thống thật). |
| `U-C2` | **Ngưỡng an toàn của lớp chặn**: lỗi trong recorder có được phép ném ra ứng dụng không? | §20.7 chỉ nêu nguyên tắc *"never become the reason production becomes slower or fails"* — không nêu cơ chế. | Chặn: đặc tả xử lý lỗi của SDK; là điều kiện cần để [ADR-008](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md) có nghĩa. |

> ✅ **CHỐT GATE-01 — 2026-08-14** — technical spike §22 **đã được bật**: `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3. Cột *"Nó chặn cái gì"* của `U-01` ghi *chặn technical spike §22* — quan hệ đó nay **đảo chiều một nửa**: spike đã có ngân sách và người chịu trách nhiệm, nên nó là **nơi để thử** các cơ chế chặn driver `pg`.
>
> ⚠️ **`U-01` VẪN `TBD`, và `U-03` cũng vậy.** RQ.md vẫn **không có một dòng nào** về cơ chế; bốn ứng viên của `U-01` (monkey-patch prototype · wrapper client · hook tầng protocol · diagnostics channel) **chưa có ứng viên nào được chọn**, và `GATE-01` **không** chọn hộ. `Go` cũng không tự làm spike đo được — `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-008: Async, Bounded, Failure-Triggered Capture](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md)
- [ADR-009: Private / Self-Hosted Topology](./ADR-009-Private-Self-Hosted-Topology.md)
- [ADR-010: Bounded Determinism Scope](./ADR-010-Bounded-Determinism-Scope.md)
- [ADR-011: Execution Diff as First-Class Outcome](./ADR-011-Execution-Diff-First-Class.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
