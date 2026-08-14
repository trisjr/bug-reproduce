# Escalations: 2026-08-14-gates-g1-g5

Append-only. Không sửa entry cũ, chỉ thêm entry mới.

---

## E-01 — Anh chốt năm gate `GATE-01`…`GATE-05` (tầng 3, quyết định của anh)

- **Tầng**: 3 (hỏi anh) — cả năm gate đều vượt `brief.md`: quyết định đầu tư, cấp tên người, phê duyệt kiến trúc, quyết định phạm vi, quyết định có yếu tố pháp lý.
- **Worker**: không có. Đây là gate của Bước 3, hỏi trực tiếp bằng `AskUserQuestion`.
- **Số vòng**: **2**. Vòng 1 thu bốn quyết định; vòng 2 thu **nội dung cụ thể** cho ba lựa chọn mà `RQ.md` không cấp dữ liệu (tên người, sàn store, con số TTL, hướng crypto-shred). Vòng 2 đã được báo trước trong mô tả lựa chọn của vòng 1 — không phải hỏi lại vì thiếu chuẩn bị.

### Quyết định — nguyên văn, đây là nguồn mà mọi nhãn trong 32 file trỏ về

| ID | Quyết định | Chi tiết |
|---|---|---|
| **`GATE-01`** | **Go** — bật Phase 0 technical spike | Coi là **điều kiện đầu tư**, không phải task. `Sponsor` = **`@TrisJr`** · `Manager` = **`@TrisJr`** · Owner của **18/18 risk** = **`@TrisJr`** |
| **`GATE-02`** | **Spike trước, Epic/Story sau** | Hoãn phân rã Epic/Story tới **sau khi Phase 0 đóng gate**. Lý do: AC dựa trên *"execution matched"* chưa kiểm chứng được (`Stories-MOC:20`, `QA-MOC:18`) |
| **`GATE-03`** | **Duyệt toàn bộ 11 ADR → `Accepted`** | Người duyệt **`@TrisJr`**, ngày **2026-08-14**. ⚠ **Ngược khuyến nghị của PM** — xem mục *Phản biện đã nêu* bên dưới |
| **`GATE-04`** | **Chốt sàn Capsule Store** = object/file storage + **một index** + **authn/authz/audit hook**, 3 thao tác tối thiểu theo `SDD §5.4` | Nâng `SDD:502–506` từ *"quyết ở mức tối thiểu, để API/auth TBD"* thành quyết định chính thức. **Phần sàn đóng**; **cơ chế** authn/authz cụ thể **vẫn `TBD`** |
| **`GATE-05a`** | **TTL mặc định = 30 ngày** (`SEC-022`) | Vẫn cấu hình được (`FR-024`); 30 ngày là **mặc định khi không cấu hình**. Đóng `U-06b` |
| **`GATE-05b`** | **`SEC-016` crypto-shredding = ÁP DỤNG, `MUST-V0.1`** | Khoá giữ phía server; xoá khoá ⇒ capsule không giải được. Đóng `U-06c`. ⚠ **Ngược khuyến nghị của PM** |

### Phản biện PM đã nêu trước khi anh quyết, và anh vẫn chọn

Ghi lại để về sau đọc run-state biết PM **có** cảnh báo, và anh **có** quyết khác — không phải PM bỏ sót.

| Gate | PM khuyến nghị | Anh chọn | Cảnh báo đã nêu nguyên văn tại gate |
|---|---|---|---|
| `GATE-03` | Giữ `Proposed` + điều kiện review sau Phase 0 | **Duyệt hết** | *"4 unknown có disposition `SPIKE` nằm BÊN TRONG các ADR đó (`U-01`, `U-03`, `U-13`, `U-20`), và `U-02`/`U-04` vẫn `TBD`. Duyệt bây giờ là phê chuẩn tiền đề chưa kiểm chứng."* |
| `GATE-04` | Hoãn tới post-spike, tiêu chí *"sàn nhỏ nhất còn thoả `D2`"* | **Quyết ngay** — và chọn đúng phương án *nhỏ nhất còn thoả `D2`* | Anh quyết ngay nhưng **chọn đúng nội dung PM sẽ đề xuất** ⇒ khác biệt chỉ ở **thời điểm**, không ở nội dung. Rủi ro thấp |
| `GATE-05b` | Chốt deadline + owner, quyết ở lượt riêng | **Quyết ngay = MUST-V0.1** | *"Câu 'replay không cần kết nối mạng' (`SDD:1145`) KHÔNG còn đúng; bộ số 32/8/3=43 đổi thành 33/8/2=43."* |

**PM không mở lại tranh luận.** Quyết định của anh là quyết định. Việc còn lại của run là **thi hành trung thực**, kể cả phần hệ quả xấu — đúng nguyên tắc `verdict.md §10.6`: *"quyết định nào cũng có mặt trái, bộ tài liệu ghi thẳng thay vì chỉ ghi phần tích cực"*.

### Hành động

Dispatch 5 writer song song ở Bước 5 theo ownership map của `run-plan.md`, với outline toàn văn ở `outline.md`.

---

## E-02 — Năm rủi ro MỚI do chính năm quyết định sinh ra (tầng 2, PM tự quyết cách ghi)

- **Tầng**: 2 — nằm trong phạm vi `brief.md`, PM tự quyết cách phân loại và ghi.
- **Căn cứ tiền lệ**: `verdict.md §10.6` — run trước ghi 4 rủi ro mới (`C-01-r`…`C-02-r2`) sinh từ `D1`/`D2` vào `Risk-Register §4.1`. Run này áp cùng nguyên tắc.
- **Định danh**: **`GATE-0N-r`** / `GATE-0N-r2`. Không dùng lại họ `C-0N-r` (đó là rủi ro sinh từ *mâu thuẫn nội tại*, khác nguồn gốc), và không dùng `R-19`+ (`R-01`…`R-18` là 18 risk nguyên bản của `RQ.md §21`).

| ID | Rủi ro | Sinh từ | Ghi ở |
|---|---|---|---|
| **`GATE-01-r`** | **`GATE-01 = Go` KHÔNG tự làm cho spike đo được.** Ba khoảng hở `ACG-01` / `ACG-02` / `ACG-03` / `ACG-07` vẫn nguyên: không có denominator, không có định nghĩa *"reproduced"*, không có tiêu chí chọn test case, không có *"Supported Execution Class"*. Chạy spike lúc này vẫn **không kết luận được pass/fail** | `GATE-01` | `Risk-Register §4.2`; nhắc lại ở `Roadmap` Phase 0 và `Charter §7` |
| **`GATE-03-r`** | **11 ADR mang nhãn `Accepted` trong khi bên trong còn 6 unknown `TBD`/`SPIKE`** (`U-01`, `U-02`, `U-03`, `U-04`, `U-13`, `U-20`). Tài liệu hạ nguồn và người hiện thực có thể đọc `Accepted` như *"mọi thứ trong ADR này đã chốt"* | `GATE-03` | `Risk-Register §4.2`; **mitigation bắt buộc**: mỗi ADR phải mang callout *"`Accepted` không đóng mục `Open items`"* |
| **`GATE-04-r`** | **Sàn đóng nhưng không vận hành được.** `GATE-04` chốt *cái gì phải có*, nhưng **cơ chế** authn/authz vẫn `TBD` và `GAP-04` (§18 không có CLI verb nào cho authz/audit/retention) **còn nguyên** | `GATE-04` | `Risk-Register §4.2`; cập nhật `C-02-r` thay vì tạo trùng |
| **`GATE-05b-r`** | **"Replay không cần kết nối mạng" thôi là bất biến.** `SEC-016 = MUST-V0.1` va trực tiếp vào `ADR-002` (capsule self-contained), `SDD:1145`, và `§33.6 Safe by default`. Đây là **hệ quả được chấp nhận có ý thức**, không phải phát hiện muộn | `GATE-05b` | `Risk-Register §4.2`; `ADR-002 Consequences`; `SDD §4.9` + `§7.4` |
| **`GATE-05b-r2`** | **`U-06d` (key custody) từ open item phụ thành blocker.** Không có key management thì crypto-shredding **không thực thi được** — quyết định `MUST-V0.1` chỉ có giá trị khi có nơi giữ và xoá khoá | `GATE-05b` | `Risk-Register §4.2`; `ADR-009 Open items`; `Threat-Model §11` |

### Quyết định về hai con số phải đổi

| Con số | Trước | Sau | Nơi phải sửa |
|---|---|---|---|
| Phân loại requirement bảo mật | `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` | **`33 MUST-V0.1 / 8 SHOULD / 2 DEFER = 43`** | `Threat-Model:960` (bảng đếm) + `:963` (câu *"`D2` KHÔNG làm đổi bộ số này"* — phải nói rõ **`GATE-05b` thì CÓ làm đổi**), và **mọi file trích con số 43 hoặc 32/8/3** |
| TBD Register `SDD §8.3` | 25 mục, `U-06` = `TBD` | Vẫn **25 mục**. `U-06` chuyển sang **`CHỐT (phần sàn)` + `TBD` (cơ chế auth)**; `U-06b` và `U-06c` **đóng** | `SDD §8.3` (1516) · `ADR-009 Open items` (189–194) |

> **PM cố ý KHÔNG giảm 25 → 23.** Lý do y hệt cách `security-auditor` xử `THREAT-008` ở run trước (`verdict.md §10.5`): register đếm *"tài liệu này khai mình chưa biết gì"* tại thời điểm lập. Đóng một mục thì đổi **disposition** của mục đó, không xoá dòng — xoá dòng làm mất dấu vết là nó **từng** chưa biết.

---

## E-03 — Con số dẫn xuất "10 threat còn hở" có thể phải đổi (tầng 2, PM giao lại cho người có thẩm quyền)

- **Tầng**: 2 — PM tự quyết **cách xử lý**, nhưng **không tự quyết nội dung**.
- **Phát hiện**: PM tìm thấy trong lúc tự viết `Risk-Register`. **Bản dispatch của `security-auditor` chưa phủ hạng mục này** — prompt gốc còn dặn ngược: *"11 threat `[GAP]` và con số 10 dẫn xuất giữ nguyên"*.
- **Vấn đề**: `Risk-Register §3` khai hai con số — **11** (`RQ.md` không có mitigation) và **10** (không có mitigation từ **bất kỳ** nguồn nào). `GATE-05a` + `GATE-05b` cấp mitigation cho **`THREAT-016`** (*"Capsule tồn tại vô thời hạn và không xoá được"*) ⇒ con số **10 có thể phải thành 9**. Câu mô tả `THREAT-016` ở `Risk-Register §3` (*"Không ai quyết ⇒ trạng thái mặc định là TTL vô hạn"*) **nay không còn đúng**. Có thể còn `THREAT-007` (capsule sprawl), nhưng mitigation của nó **phụ thuộc `U-06d` key custody** — đang là blocker.
- **Vì sao PM không tự đặt số**: đây là **phân loại bảo mật**, thuộc thẩm quyền `security-auditor`. Có tiền lệ trực tiếp — `verdict.md §10.5`: *"`security-auditor` **được giao tự quyết** cách phân loại"* cho `THREAT-008`, và lựa chọn của họ (giữ nhãn `[GAP]`, bổ sung một con số dẫn xuất) chính là cách đếm hiện hành.
- **Quyết định của PM**: **`SendMessage` bổ sung hạng mục cho `security-auditor` đang chạy**, giao họ tự quyết phân loại và **báo lại con số cuối**; PM đồng bộ `Risk-Register §3` theo đúng lựa chọn của họ. PM **không** đặt số trước.
- **Trạng thái**: ⏳ chờ `security-auditor` trả lời. `Risk-Register §3` **tạm giữ nguyên con số 10** cho tới khi có câu trả lời — nếu đóng run mà chưa đồng bộ thì đó là **CRITICAL**, không phải WARNING.

---

## E-04 — Hai writer dùng hai biến thể nhãn khác nhau (tầng 2, PM chuẩn hoá ở close-step)

- **Tầng**: 2 — lỗi hình thức, PM tự sửa.
- **Phát hiện**: PM tự chạy `grep 'CHỐT GATE-0'` sau khi `architect` lượt B báo xong.
- **Vấn đề**: hai biến thể cùng tồn tại:

| Biến thể | Ai dùng | `grep 'CHỐT GATE-0'` có bắt được? |
|---|---|---|
| `✅ CHỐT GATE-03 — 2026-08-14` | PM (11 file), `architect` lượt B (9 ADR) | ✅ Có |
| ``✅ CHỐT `GATE-03` — 2026-08-14`` *(có backtick)* | `architect` lượt A (`ADR-002`) | ❌ **Không** |

- **Vì sao đáng sửa, không phải chuyện thẩm mỹ**: `brief.md` A3 dựng cả cơ chế truy vết trên **một chuỗi grep được**. Một biến thể có backtick làm phép đếm ở Bước 6 báo thiếu file — đúng loại lỗi `E-06` của run trước (bản kê thiếu ⇒ thi hành nửa vời), chỉ khác là lần này nó ẩn trong dấu backtick.
- **Quyết định**: **giữ biến thể KHÔNG backtick làm chuẩn** (đa số 20/21 file, và là dạng ghi trong `outline.md` mục 1). PM chuẩn hoá các chỗ có backtick **ở close-step**, sau khi writer lượt A báo xong — **không** sửa giữa lúc họ đang ghi file.
- **Trạng thái**: ⏳ chờ `architect` lượt A xong.

---

## E-05 — `business-analyst` báo `PARTIAL`: ba hệ quả phái sinh không có nguồn (tầng 2, PM chấp nhận)

- **Tầng**: 2 — PM tự quyết.
- **`STATUS: PARTIAL`** của `business-analyst` **KHÔNG phải làm dở.** Nó đúng ràng buộc #3 (*"không nguồn → `TBD` + điều kiện + owner, báo `PARTIAL`"*). Ba hạng mục dưới đây là **hệ quả phái sinh** của `GATE-05b` mà **cả mục 0 của `outline.md` lẫn `RQ.md` đều không cấp dữ liệu**:

| # | Hệ quả chưa có nguồn | Ghi ở | Điều kiện đóng |
|---|---|---|---|
| a | **Hành vi khi replay không lấy được khoá** — crypto-shred đòi khoá từ server; capsule không giải được thì `repro replay` làm gì? | `UC-02 I5` | `U-06d` tại [ADR-009](../../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) |
| b | **`repro inspect` nay phải phân biệt BỐN tình huống, không phải ba** — khoá **đã bị phá có chủ đích** (hết retention) khác về bản chất với khoá **tạm không với tới được** (sự cố vận hành) | `UC-05 A2`/`A3` | `U-06d` |
| c | **Retry/buffer khi upload capsule lỗi** dưới ràng buộc `N-10` | `UC-01 A5` | — |

- **Quyết định của PM**: **chấp nhận `PARTIAL`.** Ba mục này giữ `TBD` + owner `@TrisJr` + điều kiện đóng. Bịa hành vi cho chúng là đúng thứ ràng buộc #3 sinh ra để chặn, và cũng là đúng thứ `verdict.md §5` của run trước tính là tiêu chí PASS (*"khẳng định không có nguồn — 0 trường hợp"*).
- **Hạng mục (b) là phát hiện có giá trị riêng**: nó cho thấy `GATE-05b` không chỉ phá bất biến *"replay offline"* mà còn **sinh một chế độ hỏng mới** ở tầng UX. Đây là bằng chứng thêm cho `GATE-05b-r2` — `U-06d` không chỉ là open item kiến trúc, nó chặn cả việc spec hành vi CLI.

### Bốn chỗ writer tìm thấy mà bản kê inventory KHÔNG có

Ghi lại vì đây là **giới hạn của inventory**, đáng vào memory:

| # | Chỗ lệch | Ý nghĩa |
|---|---|---|
| 1 | **3 file thiếu hẳn trường `updated:`** — `UC-02`, `UC-03`, `BRD-001`. Inventory chỉ báo 6 ADR thiếu | Auditor chỉ kiểm trường `updated:` ở nhóm ADR (nơi được hỏi đích danh), không quét toàn kho |
| 2 | **2 chỗ trích bộ số không khớp pattern** — `PRD:210` và `NFR:459` viết *"32 requirement MUST-V0.1"*, không phải `32/8/3` | Bài học: khi một con số phải đổi, `grep` **từng thành phần** của nó, không chỉ chuỗi ghép |
| 3 | **`UC-05:275`** mang câu chặn crypto-shred, nằm **ngoài** vùng 164–177 mà bản kê giao | Bản kê 15 câu chặn của auditor vẫn **chưa đủ** — con số thực lớn hơn 15 |
| 4 | Writer tự thêm một phân biệt bản kê không nêu: khoá nằm ở **server của Capsule Store**, **không** ở production ⇒ `UC-02 I5` mang điều kiện mới nhưng **`I2` (*không truy cập production*) KHÔNG bị nới** | Nếu không ghi, `GATE-05b` sẽ bị đọc như đã nới cả `I2` — một hiểu lệch nghiêm trọng về bảo mật |

---

## E-06 — `architect` lượt A báo `PARTIAL`: `U-06d` không có owner kỹ thuật (tầng 2, PM cấp)

- **Tầng**: 2 — nằm trong phạm vi `brief.md`, PM tự quyết.
- **Lý do writer báo `PARTIAL`**: `U-06d` (key custody) **nay là blocker** nhưng *"không có nguồn nào cấp owner kỹ thuật — `GATE-01` chỉ cấp owner cho 18/18 risk gốc, không cấp cho open item này"*. Writer ghi `TBD` + điều kiện đóng và nói thẳng *"tài liệu này không tự gán owner"*.
- **PM đánh giá: writer ĐÚNG khi từ chối tự gán.** `GATE-01` cấp owner cho **18 risk của `RQ.md §21`**, không phải cho mọi open item kỹ thuật. Suy rộng ra là bịa. Đây là lần thứ **hai** trong cùng run một writer từ chối lấp chỗ trống — `business-analyst` cũng báo `PARTIAL` vì đúng cụm `U-06d` (xem E-05, hạng mục a/b).
- **Quyết định của PM**: cấp **`@TrisJr`** làm owner của `GATE-05b-r2`, ghi tại **`Risk-Register §4.2`** — **không** ghi vào `ADR-009`. Lý do phân tầng: `ADR-009` khai *unknown kỹ thuật còn hở*; `Risk-Register` khai *ai chịu trách nhiệm*. Đặt owner vào ADR sẽ trộn hai loại thông tin, và làm ADR trông như đã có kế hoạch giải khi thực tế chưa.
- **Cơ sở**: cùng logic dự án-một-người của `GATE-01` — `@TrisJr` là người duy nhất trong mọi vai quản trị. Ghi kèm cảnh báo tại `Charter §5.1`.
- **Điều kiện đóng `U-06d`**: có thiết kế key management (nơi giữ · luân chuyển · xoá · quy trình mất khoá) **trước khi** capsule format v1 đóng băng — mốc này do `Threat-Model §11.c` đặt ra, không phải PM tự nghĩ.

### Hai judgment call của writer PM chấp nhận

| # | Writer làm gì | PM đánh giá |
|---|---|---|
| 1 | Reconcile contract của PM đòi `Decision status: Accepted` **3/3 file**, nhưng `SDD-Repro.md` là `type: sdd` và **không có** trường `Decision status`. Writer **không tự thêm trường**, đặt tuyên bố 11/11 `Accepted` vào `SDD §1.6` | ✅ **Đúng, và lỗi ở PM.** Tiêu chí "3/3" của PM viết sai — SDD không phải ADR. Thêm trường sai loại vào SDD sẽ là vi phạm RULE-001. Con số đúng là **2/2 ADR** + một tuyên bố ở `SDD §1.6` |
| 2 | `GATE-05b` va vào **nhiều chỗ hơn** bản kê: `SDD §3.5` (khẳng định *"replay offline khả thi"*), `ADR-002` Decision #3 / `A8` / *"capsule bất biến mâu thuẫn quyền xoá"*, và 3 bullet `ADR-009 §Consequences` nói *"D5 chưa chốt"* / *"bất khả hồi"*. Writer sửa thêm | ✅ **Đúng.** Bỏ lại sẽ tái lập chính failure mode `C1` của run trước. Đây là bằng chứng thứ hai trong run rằng **bản kê inventory chưa đủ** (xem E-05, bảng 4 chỗ lệch) |

Writer cũng tự bắt và gỡ một **dòng `Authn + authz` trùng** mà chính họ vừa tạo trong bảng hook ở `SDD §7.4` — hai dòng một định danh trong cùng bảng là đúng lớp nhập nhằng mà run này tồn tại để chặn.

---

## E-07 — Đóng E-03 và E-04 (tầng 2, PM ghi kết thúc)

File này **append-only**, nên hai entry `⏳` ở trên **không được sửa** — entry này ghi kết thúc cho chúng. `context-auditor` ở Bước 6 phát hiện đúng việc này (`WARN-3`): run-state đang nói ngược lane tài liệu.

### Đóng E-03 — con số dẫn xuất

`security-auditor` đã trả lời. **Con số dẫn xuất sau `GATE-05` = `9`.**

| Hạng mục | Kết quả |
|---|---|
| **Loại trừ khỏi nhóm** | `THREAT-016` — và lý do là **`GATE-05a`**, không phải `GATE-05b`: TTL mặc định 30 ngày là mitigation **vô điều kiện** cho vế *"tồn tại vô thời hạn"* |
| **9 threat còn lại** | `THREAT-004`, `005`, `006`, `007`, `009`, `011`, `013`, `018`, `019` |
| **`THREAT-007` / `THREAT-011` cố ý Ở LẠI** | Mitigation duy nhất của chúng là crypto-shred, treo **hoàn toàn** trên key custody (`U-06d`, blocker). `SEC-044` là `SHOULD` + hygiene control, không tạo containment. Nguyên văn lý do của họ: *"một mitigation chưa thực thi được thì chưa phải mitigation"* ⇒ **PM đã đúng khi không tự kết luận** |
| **`11` không đổi** | Đo `RQ.md`, và `RQ.md` không thay đổi |
| **Residual `THREAT-016` vẫn Cao** | *"Rời nhóm ≠ đã an toàn"* — nhóm này đếm *có mitigation hay chưa*, không đếm *residual đã thấp hay chưa* |

**PM đã đồng bộ `Risk-Register §3`**: callout đổi từ *"hai con số"* thành **ba** (11 / 10 / 9), dòng `THREAT-016` viết lại, và `§3.1` ghi phần `R-16` đã đóng. `context-auditor` xác nhận hai file khớp **đến từng ID**, và `grep '10 threat|còn 10'` ngoài `pm-runs` = **0 hit**.

⇒ **Trạng thái E-03: ĐÓNG.** Điều mà E-03 tự khai là *"nếu đóng run mà chưa đồng bộ thì đó là CRITICAL"* — **không xảy ra**.

### Đóng E-04 — chuẩn hoá nhãn

**Đã chuẩn hoá 47 chỗ** trên 3 file của `architect` lượt A về dạng không backtick. Kết quả `context-auditor` đo: `grep 'CHỐT GATE-0'` bắt được **32/32 file**.

Ba việc phát sinh, đều đã xử ở close-step:

| # | Chỗ sót | Xử lý |
|---|---|---|
| 1 | `SDD-Repro.md:27` — **dòng legend dạy cách ghi nhãn** dùng đúng biến thể có backtick mà E-04 đã loại (`WARN-2`). Nguy hiểm riêng: legend là thứ writer sau đọc để copy | Viết lại thành dạng chuẩn + thêm câu giải thích *vì sao* không backtick |
| 2 | Hai biến thể phụ `CHỐT GATE-05a` / `GATE-05b` và `GATE-05a/GATE-05b` (`SUG-1`) — vẫn `grep` được nên truy vết **không đứt**, khác hẳn ca E-04 | Tách thành hai nhãn đầy đủ |
| 3 | `ADR-002:16`, `ADR-009:16`, `ADR-009:240` — callout `GATE-03-r` trỏ `Risk-Register` **không có số section** (`WARN-1`), đúng vào mục vừa bị đánh số lại | Thêm `§4.2` |

⇒ **Trạng thái E-04: ĐÓNG.**

### Hai đính chính vào `outline.md` (`WARN-4`)

| Hợp đồng ghi | Thực tế | Đã sửa |
|---|---|---|
| *"**6 file** phải THÊM `updated:`"* | **9** (`+UC-02`, `UC-03`, `BRD-001`) | ✓ ràng buộc #4, kèm lý do gốc |
| *"`Decision status: Accepted` **3/3 file**"* (trong prompt dispatch lượt A) | **2/2 ADR + tuyên bố ở `SDD §1.6`** — `SDD` là `type: sdd`, không có trường đó | ✓ mục 4 |

### Hai headword bổ sung vào Glossary (`SUG-2`, `SUG-3`)

- **`key custody`** — xuất hiện **63 lần trên 11 file** và `GATE-05b` vừa nâng nó thành **blocker**, nhưng trước đó chỉ nằm *bên trong* entry `Crypto-shredding`, không có headword riêng.
- **`GATE-0N`** — họ định danh, kèm khai tường minh **`GATE-05` = `GATE-05a` + `GATE-05b`** (`SUG-3`: trước đó `GATE-05` được dùng như ID bao trùm mà không tài liệu nào khai nó là ID, nên `grep 'GATE-05'` sẽ ra ba định danh cho hai quyết định), và bảng ba họ nhãn/ID không được trộn.

### Một bài học về giới hạn của inventory — đáng vào role memory

`context-auditor` tự chỉ ra nguyên nhân gốc của cái thiếu ở Bước 2: bản kê khai *"6/11 ADR thiếu `updated:`"* vì nó **chỉ kiểm trường đó ở nhóm ADR — nơi câu hỏi trỏ tới**, không quét toàn kho. Nguyên văn: *"auditor có xu hướng chỉ kiểm ở nơi câu hỏi trỏ tới."*

**Quy tắc rút ra cho run sau**: prompt inventory phải tách rõ hai loại yêu cầu — *"kiểm X ở những chỗ tôi liệt kê"* và *"quét X trên toàn phạm vi"*. Bốn chỗ lệch ở E-05 và E-06 đều thuộc loại thứ hai.
