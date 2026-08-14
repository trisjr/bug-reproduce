---
id: ADR-004
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-004: Record/Replay External Inputs At Boundary

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.
>
> Phạm vi: file này chỉ chạm **`GATE-03`**. Nhãn chốt của `M1` ở §Open items thuộc quyết định của run trước và **giữ nguyên nguyên trạng**.

## Context

[ADR-001](./ADR-001-Replay-Execution-Not-Environment.md) chốt rằng Repro tái tạo execution bằng cách cấp lại **các input ngoài liên quan**. ADR này định nghĩa *input ngoài* nằm ở đâu và được ghi/phát lại ở tầng nào — cho phần **không phải database** ([ADR-003](./ADR-003-Database-Record-Replay-Not-Snapshot.md) xử lý database).

`RQ.md` §5 mô hình hoá một execution thành chuỗi: HTTP Request → Authentication → Feature Flags → Database Reads → Cache Reads → External APIs → Business Logic → Response. Khi lỗi xảy ra, Repro capture *"the relevant external inputs"*. Ví dụ của §5 ghép production (`DB Query → Result A`, `Redis → Result B`, `Tax API → Response C`, `Feature Flag → true`) với replay local (`Recorded DB Result A`, `Recorded Redis Result B`, `Recorded Tax API Response C`, `Recorded Feature Flag`) và kết luận: *"The local application is not running inside production. It is simply receiving the same relevant inputs that the production execution received."*

§12 đặc tả riêng cho external API: production trả `{"tax": 0}` cho `POST /tax`, local trả `{"tax": 12.43}`; *"Repro replaces the real response during replay"*; luồng là `Production → External API → Record Response → Repro Capsule → Local Replay`; kết quả: *"The application therefore sees the same response it saw in production."*

§7 cho ví dụ cụ thể: `taxAPI.calculate(...) → { tax: 0 }` là một trong ba thứ được ghi.

§6 cho hình dạng lưu trữ: `feature-flags.json` ở gốc capsule, và thư mục `network/` chứa `tax-api.json`, `payment-api.json`.

§18 chốt phạm vi MVP: capture có *HTTP request*, *external HTTP response*, *feature flag state*, *clock/timestamp*; replay có *HTTP request replay*, *external API replay*, *clock replay*.

§20.10 (High) nêu risk tương ứng — External Dependency Drift: *"External services can change behavior between production and local replay"*; mitigation: *"Use recorded responses for supported external dependencies."* Cụm **"supported"** là quan trọng: RQ.md tự giới hạn phạm vi ngay trong mitigation.

§9 xác nhận feature flag là input hạng nhất, không phải cấu hình: mục 3 của Execution Diff là `Feature flag — Production → new_checkout = true / Local → new_checkout = false`.

§14 và §20.11 (High) định vị boundary trong kiến trúc phân tán: *"service boundaries can become replay boundaries"*, *"The developer runs the service under investigation while Repro replays its dependencies."* §20.11 nêu đánh đổi: mock hết ⇒ deterministic nhưng kém thực tế; không mock gì ⇒ local setup quá phức tạp. Quyết định `E5` đã chốt: **replay boundary = service boundary**.

Quyết định `E1` đã chốt: **Redis không thuộc V0.1 capture** — §18 và §26 (Redis ở V0.3) là phát biểu phạm vi, thắng sơ đồ §5/§17.

## Decision

**Input ngoài được ghi và phát lại tại *dependency boundary*. Với V0.1, boundary đó gồm: outbound HTTP và feature flag; cộng inbound HTTP làm điểm vào của execution.**

1. **Đơn vị ghi là một *interaction tại boundary***, không phải trạng thái của dependency. Với HTTP: cặp (request, response) đã hoàn tất, lưu trong `network/` (§6, §12). Với feature flag: giá trị flag *tại thời điểm execution đó đọc nó*, lưu trong `feature-flags.json` (§6, §9).
2. **Outbound HTTP: lúc replay, request thật không rời process; replay layer trả recorded response** (§12: *"Repro replaces the real response during replay"*). Việc chặn ở tầng process được siết thêm bởi [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md).
3. **Inbound HTTP: request gốc được capture và *tiêm lại* làm điểm khởi động của replay** (§18 *"HTTP request replay"*, §6 `request.json`). Đây là một bài toán **khác** với outbound — xem `U-03`.
4. **Feature flag là input được ghi, không phải cấu hình được tái dựng.** Lúc replay, không kết nối tới flag provider; giá trị lấy từ capsule (§9, §6).
5. **Boundary tầng HTTP transport là boundary chính**, không phải tầng SDK/API object. §12 (`POST /tax`), §6 (`network/tax-api.json`) và §18 (*"external HTTP response"*) đều nói ở tầng HTTP; §7 viết `taxAPI.calculate(...)` được đọc là **ký hiệu minh hoạ**. Ghi ra vì đây là diễn giải.
6. **Chỉ "supported external dependencies" được phủ** (§20.10). Dependency không được hỗ trợ **không** được im lặng bỏ qua: nó phải hiện ra ở kết quả replay.
7. **Replay boundary = service boundary** (`E5`, §14): dependency được replay, service đang điều tra chạy thật.
8. **Redis/cache không thuộc V0.1** (`E1`, §18/§26).
9. **Interaction không khớp ⇒ `E9`**: divergence + incomplete capture, không crash, **KHÔNG** fallback gọi dịch vụ thật.
10. **Clock** cũng là input ngoài được capture/replay (§18), nhưng phạm vi determinism của nó thuộc [ADR-010](./ADR-010-Bounded-Determinism-Scope.md) — ADR này chỉ ghi nhận nó nằm cùng nhóm.

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Chạy dependency thật ở local** (docker-compose toàn bộ, hoặc trỏ vào sandbox của nhà cung cấp) | **[stated]** §14, §20.11, §4 | §14: *"Repro should not require developers to run the entire production architecture locally"*; §20.11: *"If nothing is mocked, local setup becomes too complex"*; §4 cho thấy local vốn đã dùng "Mock services". Ngoài ra dependency thật sẽ trôi (§20.10) nên vẫn không deterministic. |
| A2 | **Mock tất cả, kể cả service đang điều tra** | **[stated]** §20.11 (*"If everything is mocked, replay becomes deterministic but less realistic"*), §14 | Loại: nếu service đang điều tra cũng bị mock thì không còn gì để chạy code của developer — trái §8 (developer sửa code rồi replay) và trái `E5`. |
| A3 | **Contract mock / fixture do developer viết tay** (kiểu stub HTTP hoặc contract test) | **[inferred]** | RQ.md không nêu. Loại **làm nguồn dữ liệu**: fixture mã hoá *điều developer tin*, không phải *điều production trả về* — đúng vòng lặp `Guess the state` ở §2.1. Recorded response vẫn có thể được *xuất ra* thành fixture ở V0.2 (§26 "Regression test generation") — chạm **M1**, xem §Open items. |
| A4 | **Dựng lại external response từ observability span** (OTel/APM payload) | **[inferred]** | RQ.md không nêu. Loại: §3 nói observability trả lời *"What happened?"* chứ không trả lời *"Can I replay it?"*; span thường không mang đủ body; §34 định vị Repro bổ sung chứ không thay thế APM. |
| A5 | **Chặn ở tầng SDK/API object** (bọc `taxAPI.calculate`) thay vì tầng HTTP transport | **[inferred]** — nhưng có gốc từ ký hiệu ở §7 | **RQ.md mơ hồ giữa hai tầng**: §7 viết `taxAPI.calculate(...) → { tax: 0 }` (dạng SDK) trong khi §6/§12/§18 viết dạng HTTP (`network/tax-api.json`, `POST /tax`, *"external HTTP response"*). Loại tầng SDK làm boundary chính vì nó đòi một adapter cho **từng** SDK ⇒ không mở rộng được và va §21 ("Compatibility matrix"). **Nhưng chính khoảng hở này là lý do ADR-005 phải fail-closed**: SDK dùng transport riêng sẽ không đi qua sink HTTP đã instrument. |
| A6 | **Đánh giá feature flag tại chỗ lúc replay** (chạy flag SDK với context production) | **[inferred]** | RQ.md không nêu. Loại: §9 đối xử flag như một *giá trị được ghi và đem đi diff*; đánh giá lại đòi credential của provider (§20.6) và không deterministic theo thời gian (rule đổi thì kết quả đổi). |
| A7 | **Chỉ capture inbound HTTP, để mọi dependency chạy thật** | **[inferred]** | Loại: §7 và §12 cho thấy nguyên nhân bug nằm **ở chính response của dependency** (`coupon = null`, `tax = 0`). Bỏ dependency ra ngoài là bỏ đúng biến gây lỗi. |
| A8 | **Ghi ở tầng socket/TCP thay vì tầng HTTP** | **[inferred]** | RQ.md không nêu. Loại làm boundary chính: dữ liệu ở tầng đó không có ngữ nghĩa để diff (§9 cần hiển thị `tax = 0` chứ không phải byte stream), và TLS làm nó bất khả thi nếu không chạm khoá. Giữ lại như *lưới an toàn* ở ADR-005 (chặn egress), không phải làm nguồn ghi. |

## Consequences

### Positive

- **§20.10 (External Dependency Drift, High) bị trung hoà cho các dependency được hỗ trợ**: response cũ được đóng băng trong capsule, dịch vụ ngoài đổi hành vi cũng không ảnh hưởng replay.
- **Local setup không đổi** (§14): developer chỉ chạy service đang điều tra, không phải dựng toàn bộ kiến trúc.
- **Feature flag trở thành đại lượng tường minh, so sánh được** (§9) — trước đó nó là loại state vô hình mà §2.1 liệt kê là câu hỏi developer phải tự đoán.
- **Một mô hình tinh thần duy nhất với ADR-003**: DB và HTTP cùng là "input ngoài ghi tại boundary" ⇒ một cơ chế diff, một cách giải thích cho user (§33.5).
- **Capsule vẫn portable** (§40): không phụ thuộc mạng lúc replay, khớp với `E3` (self-contained) ở ADR-002.
- **Boundary rõ ràng làm phạm vi kiểm soát được** — trực tiếp phục vụ guardrail §20.15 (Capture → Replay → Verify).

### Negative

- **§20.10 chỉ được *quản lý*, không được *giải quyết*.** Mitigation của chính §20.10 giới hạn ở *"supported external dependencies"*. Mọi thứ ngoài HTTP — gRPC, message queue (§19/§26 xếp Kafka ngoài V0.1), WebSocket, TCP thô, DNS, filesystem, SDK cloud dùng transport riêng — **không** được ghi, và do đó rơi thẳng vào §20.1 (Insufficient Execution Capture, Critical).
- **§20.1 vẫn đứng nguyên**: danh sách boundary (HTTP + flag + DB + clock) là một **giả thuyết về tính đủ**, và §38 Q8 thừa nhận *"What is the minimum execution context required to achieve a useful replay success rate?"* vẫn chưa có câu trả lời.
- **Bài toán định danh interaction lặp lại y hệt `U-02`, nhưng cho HTTP.** RQ.md không đưa quy tắc match nào: method + URL + body? có tính header không? theo thứ tự? Retry của cùng một request trông giống nhau nhưng phải trả response khác nhau. §6 chỉ đặt tên file theo *dependency* (`tax-api.json`) chứ không theo *interaction*, nên hình dạng cho nhiều lần gọi cùng một dependency chưa được định nghĩa — [inferred].
- **External response là nơi mang credential và PII rất đậm** (§20.5 Critical). Redaction ở đây đổi giá trị ⇒ có thể đổi code path ⇒ divergence do chính Repro gây ra (bù trừ ở ADR-002: capsule ghi lại field nào đã redact).
- **§20.11 tự thừa nhận chi phí**: mock dependency làm replay deterministic **nhưng kém thực tế**. Bug nằm ở tương tác *giữa* các service (timeout, backpressure, thứ tự) sẽ biến mất khỏi tầm nhìn.
- **§12 giả định thay thế response là trong suốt.** Streaming, chunked transfer, long-polling, retry/backoff, timeout, và **thời điểm** response quay về đều không được RQ.md nhắc tới. Một response được trả *ngay lập tức* lúc replay có thể làm mất đúng bug phụ thuộc thời gian — [inferred].
- **Auth với dịch vụ ngoài**: code local vẫn có thể cố lấy token, tạo ra outbound call không có counterpart trong capsule (`U-11`). Đây là ca "unmatched" phổ biến nhất trong thực tế — [inferred].
- **`E1` để lại lỗ hổng cache ở V0.1**: ứng dụng có Redis sẽ có một input ngoài không được ghi, và §5/§17 của RQ.md vẫn vẽ Redis trong luồng ⇒ tài liệu gốc cần sửa cho khớp (lane này không sửa `RQ.md`).
- **`E5` đặt boundary ở service, nên bug đa service nằm ngoài tầm với ở V0.1** — §26 xếp "Multi-service replay" ở V0.3, và §20.11 vẫn ở mức High.

## Open items (TBD)

| ID | Unknown | Phương án đề xuất (nhãn) | Nó chặn cái gì |
|---|---|---|---|
| **`U-03`** | **Cơ chế intercept HTTP — cả *outbound* VÀ *inbound*.** RQ.md không nêu cơ chế ở bất kỳ đâu; §20.14 chỉ hàm ý in-process SDK (`npm install @repro/node` + `repro.init()`). Và RQ.md gộp hai bài toán **khác nhau về bản chất** vào một dòng §18 *"HTTP request replay"*: **outbound** phải *chặn và trả lời* (đứng ở vị trí client), còn **inbound** phải *tiêm một request đã ghi vào server của ứng dụng* — việc này phụ thuộc framework (`http.Server`, Express, Fastify, và Next.js mà §26 đưa vào V0.2). | Outbound: chặn ở tầng HTTP client của runtime. Inbound: tiêm ở tầng thấp nhất chung cho các framework thay vì viết adapter cho từng framework. Cả hai *cần validate*; cơ chế cụ thể thuộc [ADR-007](./ADR-007-In-Process-SDK-Interception.md). | Chặn phạm vi của ADR-007 và ma trận tương thích (§21 "Compatibility matrix", MVP = Yes); chặn quyết định replay runtime là *thư viện* hay *process wrapper*; chặn việc replay có dùng lại HTTP listener thật của ứng dụng hay không. |
| **`U-14`** | **Feature flag surface.** RQ.md nhắc feature flag ở §5, §6, §9, §18, §22 nhưng **không nói ứng dụng đọc flag bằng cách nào**: biến môi trường, SDK của provider, file cấu hình, hay bảng trong DB. Mỗi lối đọc có một điểm chặn khác nhau, và "flag state" có hình dạng khác nhau (giá trị boolean đã đánh giá vs targeting rule vs toàn bộ ruleset). | V0.1 ghi **giá trị đã đánh giá** cho từng flag mà execution đó thực sự đọc (khớp với cách §9 hiển thị), không ghi ruleset. *cần validate*. | Chặn schema của `feature-flags.json` trong capsule format v1 (ADR-002 — thay đổi sau là breaking change); chặn cách trình bày mục 3 của Execution Diff (§9); chặn quyết định có cần adapter cho từng provider hay không. |
| — | **Định danh interaction HTTP để match lúc replay** (song sinh của `U-02`). RQ.md không có quy tắc; §6 chỉ đặt tên theo dependency. | Khoá tổ hợp: method + URL đã chuẩn hoá + hash của body + chỉ số lần xuất hiện; hạ cấp có báo. *cần validate*. | Chặn hình dạng thư mục `network/` trong format v1; chặn hành vi với retry và với nhiều lần gọi cùng một endpoint. |
| — | **Dependency không được hỗ trợ thì làm gì.** §20.10 chỉ phủ *"supported"*; RQ.md không nói phần còn lại xử lý ra sao. | Phát hiện được thì chặn + báo `incomplete capture`; không phát hiện được thì đây chính là §20.1 — không thể hứa. Xem lưới an toàn ở [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md). | Chặn tính trung thực của kết quả replay: nếu im lặng bỏ qua, sản phẩm rơi vào đúng §20.3 (false equivalence, Critical). |
| — | **Thời điểm/độ trễ của recorded response** có được tái hiện không (§20.2 non-determinism). | TBD. | Chặn khả năng tái tạo bug phụ thuộc timeout/thời gian; liên quan [ADR-010](./ADR-010-Bounded-Determinism-Scope.md). |

### Mâu thuẫn M1 — ✅ ĐÃ CHỐT 2026-08-14

> Bối cảnh hai phía bên dưới **được giữ nguyên có chủ đích**. `RQ.md` vẫn tự nói ngược ở chính những section được trích; quyết định của người có thẩm quyền chỉ nói **ta chọn phía nào**, nó không làm mâu thuẫn ở nguồn biến mất.

- **`M1` — Regression test generation ở V0.1 hay V0.2?** §26 xếp ở **V0.2**; nhưng §25 in `✓ Regression case generated`, §30 kết ở *"Regression test"*, §31 North Star đếm *"converted into regression tests"* ⇒ **North Star Metric của V0.1 không đo được bằng chính V0.1.** Chạm ADR này ở alternative A3: recorded response chính là thứ sẽ được xuất thành fixture cho regression test. **Đề xuất (trước khi chốt)**: giữ tính năng ở V0.2 theo §26, nhưng chốt ràng buộc lên định dạng recorded interaction ngay ở V0.1.
  ✅ **ĐÃ CHỐT 2026-08-14** — chọn phía **§26: regression test generation giữ ở V0.2**, **không** kéo về V0.1. **Chỉ số thành công của V0.1** đổi sang **số bug đạt trạng thái `Execution matched`** (§10). **North Star §31 giữ nguyên** làm metric **dài hạn, kích hoạt từ V0.2**.
  **Lý do**: `Execution matched` là trạng thái mạnh nhất mà V0.1 **tự sinh ra được**, và đo đúng thứ V0.1 tồn tại để chứng minh — execution được tái hiện thật, không chỉ chạy xong; đồng thời là chỉ số trực tiếp chống risk **Critical** §20.3.
  **Hệ quả cho ADR này**: đề xuất trên **được giữ nguyên** và nay mạnh hơn — thời điểm tiêu thụ recorded interaction đã biết chắc là **V0.2**, nên ràng buộc lên định dạng `network/` phải chốt ngay ở **V0.1** (format v1 của [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md) — thêm sau là breaking change). Alternative **A3** giữ nguyên kết luận: recorded response **không** được thay bằng fixture viết tay làm nguồn dữ liệu; nó chỉ được **xuất ra** thành fixture ở V0.2. Việc định danh interaction HTTP (mục thứ ba của §Open items) vì thế cũng là ràng buộc của V0.1, không hoãn được sang V0.2.
  **Hệ quả nằm ngoài ADR này, ghi để không thất lạc**: chỉ số thành công mới của V0.1 được đo bởi `N-05` (Execution Match Rate, §23) — mà **§24 không đặt ngưỡng cho `N-05`**; và `U-04` (§10 không định nghĩa *"execution path"* / *"sufficiently equivalent"*) nay chặn **chính phép đếm** `Execution matched`. Xem [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md) §Open items.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [ADR-010: Bounded Determinism Scope](./ADR-010-Bounded-Determinism-Scope.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
