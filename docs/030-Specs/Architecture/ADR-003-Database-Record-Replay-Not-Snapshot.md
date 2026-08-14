---
id: ADR-003
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-003: Database Record/Replay, Not Snapshot

**Decision status**: Accepted — ✅ CHỐT GATE-03 — 2026-08-14
**Người duyệt**: `@TrisJr` · **Ngày duyệt**: 2026-08-14 · **Căn cứ**: `GATE-03`
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận *hướng quyết định*, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.
>
> Mapping tên gọi: `GATE-01` = G1 · `GATE-03` = G3. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị [PRD-Repro](../../020-Requirements/PRD-Repro.md) §Goals chiếm.

## Context

`RQ.md` §11 mở đầu bằng một thừa nhận: *"Database reproduction is one of the hardest technical areas."* Và chốt hướng đi ngay: *"The MVP should **not** attempt to copy the production database. Instead, the initial approach should be **record/replay of database results**."*

§11 minh hoạ bằng một truy vấn và kết quả:

```sql
SELECT * FROM coupons WHERE id = 9182;
```

trả về `null`. Repro ghi lại kết quả đó. Lúc replay, đường đi là `Local Application → Database Query → Repro Replay Layer → Recorded Production Result → Application`. §11 nêu lợi ích chính: *"This avoids requiring production database access."* Và để ngỏ lối thoát: *"A future version may support minimal database snapshots for cases where query-result replay is insufficient."*

§7 cho ví dụ vận hành đầy đủ, và nó là ví dụ trung tâm của cả tài liệu: production có `user.couponId = 9182` và `coupon #9182 = null`; local có `coupon #9182 = { discount: 10 }`; code chạy `coupon.discount` và crash ở production nhưng không crash ở local. Repro ghi `db.users.find(18392) → production result` và `db.coupons.find(9182) → null`. Đây chính xác là lớp bug mà quyết định này tồn tại để giải.

§6 cho hình dạng lưu trữ trong capsule: thư mục `database/` chứa `query-001.json` và `query-002.json`. **Cách đặt tên này là bằng chứng văn bản duy nhất** trong toàn bộ RQ.md về việc query được định danh thế nào lúc replay — và nó hàm ý match **theo thứ tự**. Xem §Open items.

§18 xác nhận phạm vi MVP: capture có *"database query/result"*, replay có *"database result replay"*, target stack là **Node.js + PostgreSQL + HTTP**. §26 xếp PostgreSQL ở V0.1 và Redis ở **V0.3**.

§12 áp cùng mô hình cho external API — hai ADR song song, cùng một triết lý record/replay tại boundary (xem [ADR-004](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)).

§20.9 (High) nêu risk kèm theo: Database Schema Drift — production và local có thể dùng schema version khác nhau; mitigation là *"Capture schema/migration version and expose mismatch during replay."*

§13 tách READ (`SELECT`, `GET`, cache read) khỏi WRITE (`INSERT`, `UPDATE`, `DELETE`, POST payment, publish event) và quy định lúc replay: READ → trả recorded result; WRITE → không chạy vào hệ thống thật, trả recorded result. Phần WRITE thuộc [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md); ADR này chỉ xử lý phía READ.

> **Ghi chú truy vết**: `findings/architect.md` gắn `D-24` vào ADR này ở dạng *"nhắc"*. Findings chỉ pin định danh, **không có toàn văn** `D-24`. Nội dung gần nhất có căn cứ trong RQ.md và nằm đúng phạm vi ADR này là **§20.9 schema drift** (được xử lý ở quyết định #4). Ánh xạ `D-24` ⇄ §20.9 là **suy đoán của em** — **TBD, cần PM xác nhận** trước khi coi ADR này đã phủ hết `D-24`.

## Decision

**V0.1 ghi lại *kết quả* của từng tương tác database tại boundary của DB client, rồi phát lại kết quả đó lúc replay. Không snapshot, không copy production database.**

1. **Đơn vị ghi là một interaction DB đã hoàn tất**: truy vấn (dạng chuẩn hoá) + tham số + kết quả trả về, lưu thành một entry trong `database/` của capsule (§6, §11).
2. **Lúc replay, local database KHÔNG được hỏi cho các read đã được ghi.** Replay layer trả thẳng recorded production result (§11 sơ đồ). Điều này giữ đúng lợi ích cốt lõi: *avoids requiring production database access* (§11) và loại bỏ mọi phụ thuộc vào dữ liệu local.
3. **Phạm vi V0.1: PostgreSQL** (§18, §26 V0.1). **Redis / cache KHÔNG thuộc V0.1** — quyết định `E1`: §18 (MVP capabilities) không liệt kê Redis và §26 xếp Redis ở V0.3; §5 ("Cache Reads", "Redis → Result B"), §13 ("Cache read" ở nhóm READ), §17 (box Recorder liệt kê Redis) và §22 (test app có Redis) là sơ đồ minh hoạ và dependency của test app, không phải phát biểu phạm vi. **Phát biểu phạm vi thắng sơ đồ.**
4. **Schema/migration version được capture và mismatch được hiển thị lúc replay** (§20.9). Đây là **phát hiện và cảnh báo**, không phải sửa chữa: Repro không migrate, không điều chỉnh kết quả cho khớp schema local.
5. **Interaction không khớp (local phát ra query không có counterpart trong capsule) ⇒ `E9`**: đánh dấu **divergence + incomplete capture**, **không** crash, và **KHÔNG** fallback gọi database thật. Giá trị trả về cụ thể là TBD — xem §Open items.
6. **Write không thuộc ADR này.** Mọi interaction được phân loại là write đi theo [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md) (default-deny, fail-closed).
7. **Minimal database snapshot được giữ như lối thoát tương lai, không phải V0.1** (§11, §26 "Future").

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Snapshot / clone toàn bộ production database** | **[stated]** §11, §19 | §11 nguyên văn: *"The MVP should not attempt to copy the production database"*; §19 xếp "Full production database snapshots" vào Non-Goals. Lý do sâu hơn: nó kéo theo §20.5 (toàn bộ PII của DB, không chỉ phần liên quan), chi phí lưu trữ, và trái §6 (*"only the information necessary"*). |
| A2 | **Minimal snapshot — chỉ các row đã chạm** | **[stated]** §11 (*"A future version may support minimal database snapshots for cases where query-result replay is insufficient"*), §26 "Future" | **Hoãn, không loại vĩnh viễn.** RQ.md tự nêu đây là lối thoát khi record/replay kết quả tỏ ra không đủ. Không thuộc V0.1. |
| A3 | **Seed dữ liệu đã ghi vào PostgreSQL local, rồi chạy query thật** | **[inferred]** | RQ.md không nêu. Đây là **alternative mạnh nhất trong nhóm [inferred]** vì nó giải được `U-02` (không cần match query — cứ chạy thật) và chịu được việc developer sửa code. Loại cho V0.1 vì: (a) tái lập phụ thuộc vào một local database và vào schema parity, đúng thứ §20.9 cảnh báo; (b) **không đảo ngược được** — result set là *phép chiếu* (join, aggregate, `count(*)`, subquery), không thể dựng lại row gốc từ nó; (c) §11 phát biểu tường minh hướng đi là record/replay *của results*. **Giữ lại như ứng viên số một nếu `U-02` chứng minh là không giải được — nhãn "cần validate".** |
| A4 | **Proxy ở tầng PostgreSQL wire protocol** thay vì chặn ở client library | **[inferred]** | RQ.md không nêu. Loại: §20.15 liệt kê *"Database proxy"* như một biểu hiện của scope explosion; §20.14 đặt kỳ vọng tích hợp ở `npm install @repro/node` + `repro.init()`. (Cơ chế intercept cụ thể thuộc ADR-007.) |
| A5 | **Lúc replay, chạy lại query vào production** | **[inferred]** | RQ.md không nêu. Loại: §11 nêu chính lợi ích là *"avoids requiring production database access"*; §20.6 muốn giảm bề mặt tấn công, không tăng; và dữ liệu production đã đổi từ lúc lỗi xảy ra ⇒ không deterministic. |
| A6 | **Developer tự viết fixture/seed bằng tay từ log** | **[inferred]** | RQ.md không nêu như alternative nhưng §2.1 mô tả chính xác nó dưới tên `Guess the state`. Đây là status quo cần thay thế, không phải giải pháp. |
| A7 | **Ghi ở tầng ORM/repository** (ví dụ bọc `db.users.find`) thay vì tầng driver | **[inferred]** | §7 viết recorded item ở dạng `db.users.find(18392)` (dạng ORM), trong khi §11 viết ở dạng SQL thô (`SELECT * FROM coupons WHERE id = 9182`) và §18 nói *"database query/result"*. **RQ.md mơ hồ giữa hai tầng.** Quyết định: lấy **tầng driver (`pg`)** làm boundary chính, vì §18 chốt PostgreSQL chứ không chốt ORM nào, và một ORM bất kỳ cuối cùng cũng đi qua driver. §7 được đọc là **ký hiệu minh hoạ**. Ghi ra vì đây là diễn giải, không phải nguyên văn. |

## Consequences

### Positive

- **Không cần production database access** (§11) — bỏ được rào cản vận hành và giảm bề mặt bảo mật so với A1/A5.
- **Không cần parity dữ liệu hay schema ở local** cho phần đã ghi: local không cần có `coupon #9182` để tái tạo §7.
- **Capsule nhỏ hơn snapshot nhiều bậc** — chỉ chứa kết quả của các query thực sự đã chạy (§6, §20.12).
- **Giải đúng lớp bug trung tâm của tài liệu** (§7): dữ liệu production khác dữ liệu local là nguyên nhân, và record/replay khử đúng biến đó.
- **Phạm vi PII hẹp hơn hẳn A1**: chỉ dữ liệu đã đi qua execution đó bị mang ra khỏi production, thay vì toàn bộ bảng (§20.5, §6).
- **Đối xứng với external API** (§12) ⇒ một mô hình tinh thần duy nhất cho developer, một cơ chế diff duy nhất (§9).

### Negative

- **`U-02` — định danh query để match lúc replay là rủi ro hiện thực cao nhất của cả thiết kế, và nó chưa được giải.** Xem §Open items. Đây không phải chi tiết triển khai: nếu match sai, replay trả sai dữ liệu cho đúng chỗ mà không ai biết — tức là biến §20.3 (false replay equivalence, Critical) từ risk thành hiện thực.
- **Ghi ở tầng kết quả là *lossy* theo bản chất**: capsule giữ *câu trả lời*, không giữ *trạng thái*. Bất kỳ query nào code local phát ra mà production chưa từng phát ra đều **không có câu trả lời** (`U-11`).
- **§11 tự thừa nhận có lớp thất bại**: *"...for cases where query-result replay is insufficient"* — RQ.md biết cách tiếp cận này không đủ trong một số trường hợp, nhưng **không nói là trường hợp nào**. Lớp thất bại đó hiện chưa được đặc tả ở bất kỳ đâu.
- **§20.9 — Database Schema Drift (High) chỉ được *phát hiện*, không được *xử lý*.** Recorded result mang hình dạng của schema production; nếu schema local thêm/bớt cột, code local có thể lỗi vì lý do không liên quan tới bug gốc.
- **Đây là nơi PII tập trung nhất** (§20.5 Critical). Redaction áp lên DB result sẽ đổi giá trị ⇒ có thể đổi code path ⇒ tạo divergence do chính Repro gây ra. Bù trừ nằm ở ADR-002 (capsule ghi lại field nào đã redact).
- **Non-determinism *bên trong* database không được xử lý** (§20.2 Critical): `now()`, `random()`, giá trị sequence/serial, thứ tự row khi không có `ORDER BY`. RQ.md chỉ cam kết clock capture/replay ở phía ứng dụng.
- **Transaction, cursor, prepared statement, connection pool, multi-statement** không được RQ.md nhắc tới ở bất kỳ đâu — [inferred]. Một interaction DB thực tế không phải lúc nào cũng là một cặp (query, result) độc lập.
- **Ràng buộc theo thứ tự làm quyết định này thù địch với chính use case chính**: §8 bước 4 là *"Developer fixes the code"*, và code đã sửa gần như chắc chắn phát ra chuỗi query khác.
- **`E1` để lại một khoảng trống thật ở V0.1**: ứng dụng có cache sẽ có một input ngoài không được ghi ⇒ rơi vào §20.1 (hidden input, Critical). RQ.md §5/§17 vẽ Redis trong luồng, nên tài liệu gốc cần được sửa cho khớp — lane này không sửa `RQ.md`.

## Open items (TBD)

| ID | Unknown | Phương án đề xuất (nhãn) | Nó chặn cái gì |
|---|---|---|---|
| **`U-02`** | **Query matching identity — TBD, rủi ro hiện thực cao nhất.** Lúc replay, làm sao biết query mà code local vừa phát ra tương ứng với entry nào trong `database/`? **Bằng chứng văn bản duy nhất trong RQ.md là §6 đặt tên `query-001.json` / `query-002.json`, hàm ý match theo *thứ tự*.** Và match theo thứ tự **rất giòn trong đúng use case chính**: §8 bước 4–5 là developer sửa code rồi replay lại — code đổi thì sequence lệch ngay, kể cả khi bản sửa là đúng. | **Phương án đề xuất — nhãn "cần validate", KHÔNG phải đã chốt**: định danh tổ hợp gồm *SQL đã chuẩn hoá* + *giá trị tham số* + *chỉ số lần xuất hiện trong nhóm cùng khoá*; khi không khớp chính xác thì hạ cấp dần (khoá tổ hợp → chỉ SQL chuẩn hoá → thứ tự) và **báo rõ mức hạ cấp đã dùng** thay vì im lặng. Mọi phương án ở đây đều chưa được cân đo bằng dữ liệu thật. | Chặn bảo đảm deterministic của replay (§20.3 — Critical); chặn vòng `repro verify` (§8 bước 5, ADR-006); chặn sơ đồ đặt tên `database/` trong capsule format v1 (ADR-002 — thay đổi sau là breaking change); chặn thiết kế kịch bản spike §22 (#1 "Database state causes bug", #5 "Missing data"). |
| **`U-01`** | **Cơ chế intercept `pg`.** RQ.md không nêu cơ chế nào ở bất kỳ đâu; §20.14 chỉ hàm ý in-process SDK qua `npm install @repro/node` + `repro.init()`. Chưa rõ bề mặt nào được phủ: `Client` vs `Pool`, `query()` vs prepared statement vs cursor vs stream vs `COPY`. | Thuộc [ADR-007](./ADR-007-In-Process-SDK-Interception.md) (writer khác). | Chặn định nghĩa "sink đã instrument" — mà chính định nghĩa đó là nền cho lập luận fail-closed của ADR-005; chặn ma trận tương thích (§21 "Compatibility matrix", MVP = Yes); chặn phạm vi thật của capture DB. |
| **`U-11`** | **Unmatched interaction — code local phát ra query không có trong capsule.** RQ.md hoàn toàn không nêu. **Đây không phải trường hợp biên mà là trường hợp thường gặp nhất**, vì use case chính là developer sửa code rồi replay lại (§8 bước 4–5). | `E9` áp dụng: đánh dấu **divergence + incomplete capture**, không crash, **không** fallback gọi DB thật. Còn TBD: **trả về giá trị gì** — kết quả rỗng, lỗi tường minh, hay dừng execution. *cần validate*. | Chặn ngữ nghĩa kết quả của `repro replay` và `repro diff` (§18); chặn phân loại outcome của ADR-006 (unmatched là "diverged" hay là một hạng riêng); chặn exception flow của use case replay. |
| **`D-24`** | **Toàn văn `D-24` không có trong findings.** Ánh xạ `D-24` ⇄ §20.9 (schema drift) là suy đoán của em. | TBD — cần PM xác nhận. | Chặn khẳng định "ADR-003 đã phủ hết decision được giao". |
| — | **Write result có được capture ở production không.** §13 nói lúc replay WRITE *"return recorded result"*, nhưng §18 danh sách capture chỉ có *"database query/result"* và *"external HTTP response"* — không nói rõ kết quả của write (id sinh tự động, `RETURNING`, số row bị ảnh hưởng) có được ghi hay không. | TBD — xem [ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md). | Chặn ngữ nghĩa entry `database/` trong capsule format v1 (ADR-002). |

> ✅ **CHỐT GATE-01 — 2026-08-14** — spike §22 (kịch bản #1 *Database state causes bug*, #5 *Missing data*) **đã được bật**: `GATE-01` = **Go**, Phase 0 technical spike là **điều kiện đầu tư** chứ không phải task — `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Mapping: `GATE-01` = G1 · `GATE-03` = G3.
>
> ⚠️ **`U-02` VẪN `TBD`.** Phương án định danh tổ hợp ở trên vẫn mang nhãn *cần validate* — `GATE-01` chỉ cấp **phương tiện** để cân đo nó bằng dữ liệu thật, nó **không** chốt phương án nào. Và `Go` không tự làm cho spike đo được: `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở ⇒ kịch bản #1/#5 chạy lúc này vẫn **chưa kết luận được pass/fail**. Xem `GATE-01-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) §4.2.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
