# Findings — architect

> Lens phân tích cho `A2` (`ACG-07` Supported Execution Class) và `A3` (`ACG-01` rubric execution path), cộng câu chặn `GAP-Redis`. **Read-only**, `FILES_TOUCHED: none`.

## Kết luận của worker

```
STATUS: DONE
FILES_TOUCHED: none
SUMMARY:
(1) ACG-01: đề xuất đơn vị so sánh = interaction tại boundary đã instrument + hai đơn vị neo
(inbound request, terminal outcome); "sufficiently" vận hành hoá thành exact-trên-tập-field-thu-hẹp,
KHÔNG có ngưỡng %; tolerance = normalization + tập đồng thời + redaction marker; quy trách nhiệm
theo thủ tục 6 bước ưu tiên "lỗi Repro trước lỗi developer". Đã chạy tay một ví dụ cho verdict nhị
phân `Execution matched`. Điểm mù W1 (rẽ nhánh thuần logic, recall = 0) nêu thẳng.
(2) ACG-07: đủ ba phần — 7 điều kiện đủ (S1–S7); loại trừ đối chiếu đủ 9 nhóm §20.1 (4 nhóm KHÔNG
có cơ chế phát hiện) VÀ 6 dependency ngoài 8 nhóm capture §18; hành vi ngoài class = capture kèm
cảnh báo + chặn trần verdict lúc replay + loại khỏi denominator.
(3) GAP-Redis: hai phát hiện văn bản đổi hình bài toán — (F1) ràng buộc "chạm cả 5 dependency trong
một request" đến từ exit criteria B1 của Timeline chứ KHÔNG từ RQ.md §22; (F2) không scenario nào
trong 10 lấy Redis làm tác nhân gây lỗi. Bảng 10×3: (a) 0/10 — denominator 0, tự huỷ; (b) 5 ✅ +
5 ⚠️; (c) 5 ✅ + 5 ⚠️. RECOMMEND = (c) với phần định nghĩa của (a) viết vào ACG-07(ii-b) — một
quyết định hai mặt; loại (b) chủ yếu vì bằng chứng không chuyển giao được. Kèm probe S11.
```

## Nội dung chính

### `ACG-01` — *"sufficiently equivalent"* được vận hành hoá thế nào

**Đơn vị so sánh** = một **interaction đã đi qua interception layer**, cộng **hai đơn vị neo**: `U0` (inbound HTTP request đã chuẩn hoá) và `U∞` (kết cục — response hoặc exception thoát ra, so bằng **danh tính loại**, không so stack trace).

Ba ứng viên khác bị loại có nguồn: syscall/instruction trace (`ADR-006 A4` — va §20.7, §20.15, §20.14) · function call/code line (đòi instrument mới ở production) · tracing span (§26 đặt distributed tracing ở **V0.3**).

**Phát biểu then chốt**: *"sufficiently"* được vận hành hoá thành **exact trên một tập field đã bị thu hẹp có chủ đích** — **KHÔNG** phải *"khớp ≥ X%"*.

> Lý do worker nói thẳng: một ngưỡng phần trăm sẽ dựng lại đúng cái false confidence mà §20.3 tồn tại để chặn — **90% khớp mà 10% lệch ở đúng nhánh gây bug thì kết luận `matched` là sai nguy hiểm**.

**Tolerance được hiện thực bằng normalization + quan hệ tương đương, không bằng ngưỡng số**: nhóm đồng thời so như **tập** (set equality), giữa các nhóm so như **dãy** · field redact so bằng **marker** · SQL → fingerprint, URL → path template, JSON → canonical form · **clock KHÔNG tolerant** (giá trị đồng hồ là input đã capture).

Worker **cố ý không** đưa `epsilon` cho số thực hay tolerance mili giây cho timestamp — không có nguồn cấp con số đó.

### `inconclusive` là cổng ĐỨNG TRƯỚC rubric, không phải verdict thứ ba

```
[Gate lớp] execution có trong Supported Execution Class không?
   ├─ không / không kiểm được → inconclusive · KHÔNG chạy rubric
   └─ có → [Rubric] → matched | diverged   ← nhị phân tuyệt đối
```

Cách đặt này giữ **cả** exit criteria của `A3` (kết luận nhị phân) **lẫn** `ADR-006` Decision #7 (kết quả không kết luận được phải là trạng thái riêng). Đây là chỗ trước đó tưởng mâu thuẫn.

### Quy trách nhiệm — nguyên tắc "lỗi Repro trước lỗi developer"

Thủ tục 6 bước, khớp đầu tiên thắng: `redaction` → `incomplete-capture` → cờ `version-drift` → `out-of-scope-determinism` → `code` → `unattributed`.

> **Redaction và incomplete-capture đứng TRÊN `code`.** Không có nguyên tắc này, Repro sẽ đổ lỗi cho code của developer trong đúng những ca mà **chính nó** gây ra.

`unattributed` **phải hiện ra như vậy** — cấm gộp thầm vào `code`.

**Bước 4 biến `U-25` (replay lặp N lần) thành *điều kiện tiên quyết*, không phải nice-to-have**: không lặp thì `out-of-scope-determinism` **không có tín hiệu quan sát được nào**.

### Điểm yếu đã biết — `W1` là cái nặng nhất

| # | Điểm yếu | Mức |
|:--:|---|:--:|
| **W1** | **Rẽ nhánh thuần logic: recall = 0.** Hai nhánh khác nhau, cả hai không chạm dependency nào, cùng kết cục ⇒ rubric kết luận `matched` **trong khi execution thực sự đã khác**. Phát biểu trung thực nhất rubric hỗ trợ được là *"không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục"* — **không phải** *"execution giống nhau"* | 🔴 |
| **W2** | Thừa hưởng toàn bộ độ giòn của `U-02` — `SDD` gọi là *"rủi ro hiện thực cao nhất"* | 🔴 |
| **W3**–**W7** | `U-20` chưa đóng · capsule đã redact không bao giờ bit-perfect · không dùng nguyên xi cho `repro verify` (`U-08`) · chưa có dữ liệu hiệu chỉnh · phụ thuộc `U-13` | 🟠 |

**Đính chính có giá trị**: `NFR ACG-01` viết `W1` là *"đúng loại bug mà §7 lấy làm ví dụ mở đầu"*. Worker đọc lại §7 và chỉ ra bug đó **chạm DB** (`db.coupons.find(9182) → null`) rồi kết thúc bằng `TypeError` ⇒ với đơn vị neo `U∞`, rubric **bắt được** ca §7. `W1` vẫn đúng nguyên vẹn, nhưng §7 **không phải** ví dụ của nó.

### `ACG-07` — đủ ba phần, và phần (ii-b) là phần Timeline còn thiếu

**(i) 7 điều kiện đủ `S1`–`S7`**, trong đó `S7` (*ổn định dưới phép lặp*) là phần worker thêm để class **kiểm được**, không chỉ **khai được** — *"không có nó, class là một lời tuyên bố không có phép thử, đúng lỗi mà `ACG-07` đang tố cáo §20.1"*.

**(ii-a) 9 nhóm §20.1**: **4 nhóm KHÔNG có cơ chế phát hiện nào** — environment variables, filesystem state, process state, OS behavior. Class loại trừ chúng **bằng lời khai, không bằng phép kiểm** — phải nói thẳng trong Spike Report.

> Đáng chú ý: **process state** (module-level cache, memoization, độ ấm của pool) là **cùng lớp vấn đề với Redis**, chỉ khác là nó nằm **trong** process.

**(ii-b) dependency ngoài 8 nhóm capture §18** — phần này chưa từng có ở đâu: Redis/cache · Kafka/MQ · background jobs · browser state · egress phi-HTTP (gRPC, socket thô) · DB khác PostgreSQL.

Phát biểu gọn phủ được tất cả: *"Một execution nằm ngoài Supported Execution Class nếu kết cục của nó phụ thuộc một dependency không thuộc 8 nhóm capture của §18."*

⇒ Đây là **câu trả lời cho lý do `A2` không tự bắt được `GAP-Redis`**: Redis nằm ở **trục khác** với 9 nhóm §20.1 — nó là dependency được đặt tên tường minh nhưng chủ động không capture.

**(iii) Hành vi ngoài class — ba thời điểm, ba hành vi:**

| Thời điểm | Hành vi | Lý do |
|---|---|---|
| Capture | ✅ **VẪN CAPTURE** + khối `class_assessment` trong capsule | Lỗi **đã xảy ra rồi**; từ chối capture là phá huỷ bằng chứng duy nhất |
| Replay | ✅ **VẪN CHẠY**, không crash, không fallback gọi hệ thống thật — nhưng **verdict bị chặn trần**, không bao giờ in `Execution matched` trơn | `ADR-011 D1/D4` |
| Đếm metric | ⛔ **LOẠI khỏi denominator**, công bố **TRƯỚC** khi chạy | `ADR-010 §Consequences` cảnh báo `≥80%` có thể làm đẹp bằng cách thu hẹp phạm vi |

**Không có phương án "capture im lặng"** — §33.5 (*Determinism over magic*) loại nó ở tầng nguyên tắc.

### `GAP-Redis` — bảng 10 × 3

| Phương án | Chấm điểm được (✅) | Chết **do** `GAP-Redis` | Ngoài denominator do gap **khác** (⚠️) |
|---|:--:|:--:|:--:|
| **(a)** đơn độc | **0 / 10** | **10** | — |
| **(b)** capture Redis throwaway | **5 / 10** | **0** | 5 |
| **(c)** Redis không ảnh hưởng kết quả | **5 / 10** | **0** | 5 |

✅ = {1 DB state, 2 External API, 3 Feature flag, 5 Missing data, 8 Side effect}
⚠️ = {4 Time-dependent (`U-13`), 6 Version diff (`ACG-10`/`U-16`), 7 Randomness (`ACG-06`), 9 Async (`U-20`), 10 Race (§19 + §20.13 — ngoài phạm vi ở **mọi** phương án)}

> **(a) và (c) không phải hai lựa chọn loại trừ nhau** — chúng là **hai mặt của cùng một quyết định**: (a) là phần **định nghĩa** (viết vào `ACG-07` ii-b), (c) là phần **hiện thực trong test app**. Nếu (a) đi kèm sửa `B1` cho Redis hết ảnh hưởng, thì (a) **trở thành đúng** (c).

**RECOMMEND: (c) + phần định nghĩa của (a)** — lý do mạnh nhất là **tính chuyển giao của bằng chứng**:

> `GATE-06` là cổng quyết định có xây **V0.1** hay không. V0.1 có **8 nhóm capture**. Phương án **(b)** sẽ đo một hệ thống **9 nhóm** rồi dùng con số đó phán quyết một sản phẩm **8 nhóm** ⇒ `GATE-06` pass mà **bằng chứng không chuyển giao được sang thứ đang được gate**. Đây là lỗi **hiệu lực đo lường**, và tệ hơn (c) ở chỗ nó **vô hình** trong báo cáo.

Mặt yếu của (c) **nêu tên được và báo cáo được** — nó thành một điều khoản loại trừ công bố trước trong `ACG-07`, đúng thứ §20.1 yêu cầu. Mặt yếu của (b) **không nêu tên được** vì nó nằm trong chính con số.

**Hai ràng buộc bắt buộc nếu chọn (c)**: `R1` cấm thêm hook Redis ở **một** phía (sẽ tạo interaction lệch ⇒ cả 10 scenario `diverged` với nguyên nhân `incomplete-capture` giả) · `R2` cách dùng Redis ở `B1` phải **chịu được việc bị `B5` chặn hoặc vắng mặt**.

**Probe `S11`** — đề xuất kèm: chạy **một** execution **cố tình phụ thuộc Redis state**, ghi kết quả **ngoài denominator**. Nó (1) định lượng cái giá của việc loại cache khỏi class, và (2) quan trọng hơn — **kiểm chính thủ tục quy trách nhiệm**: `S11` **phải** ra `diverged` với nguyên nhân `incomplete-capture`, **không** phải `out-of-scope-determinism`. Ra sai nhãn ⇒ rubric có lỗi, phải sửa **trước** khi `C3` chạy.

## PM đọc được gì

### 1. ✅ PM đã tự verify F1 và F2 trực tiếp trong `RQ.md` — cả hai đúng

| Phát hiện | PM kiểm chứng |
|---|---|
| **F1** — §22 chỉ **liệt kê dependency của test app**, không có câu nào bắt mỗi request chạm cả 5 | ✅ Đọc nguyên văn §22 (`RQ.md` dòng 1295–1340): mục *"Dependencies"* là danh sách của **test app**, không phải ràng buộc per-request |
| **F2** — không scenario nào lấy Redis làm tác nhân | ✅ Đọc nguyên văn 10 scenario: tác nhân là DB, external API, feature flag, clock, dữ liệu thiếu, phiên bản, randomness, write, async, race. **Không có cache** |

**Hệ quả: PM phải tự đính chính.** [Timeline §3](../../../Estimates/Timeline-Repro.md) hiện viết *"`RQ.md §22` bắt test app chạm **Redis** ở mọi request (`B1` **chép đúng**)"*. Mệnh đề *"chép đúng"* **sai** — `B1` **siết chặt hơn nguồn**. Đây là lỗi của PM khi viết `GAP-Redis`, không phải lỗi của worker nào.

⇒ Chi phí thật của (c) là **sửa một dòng exit criteria của `B1`**, không phải *"làm spike dễ hơn thực tế"* như PM đã viết. Cách xử lý này thống nhất với chính quy tắc dự án đã dùng để phân xử `C-03`: **phát biểu phạm vi tường minh thắng sơ đồ/minh hoạ**.

### 2. 🔴 MÂU THUẪN THẬT giữa `architect` và `business-analyst` — PM phải phân xử

| | `business-analyst` | `architect` |
|---|---|---|
| Denominator dưới (b)/(c) | **7** = {1,2,3,4,5,6,8} | **5** = {1,2,3,5,8}; scenario **4** và **6** là ⚠️ |
| Lý do khác biệt | `M-2` (input nhân quả nằm trong 8 nhóm §18) — clock và Git commit **đều có** trong §18 ⇒ 4 và 6 IN | Scenario 4 chặn bởi **`U-13`** (freeze vs virtual clock chưa định nghĩa); scenario 6 chặn bởi **`ACG-10`/`U-16`** (warn hay block chưa có hành vi) |

**Phân xử của PM: cả hai đúng về hai thứ khác nhau, và chúng hợp nhất được.**

BA hỏi *"input nhân quả có được capture không"* → có. Architect hỏi *"verdict có xác định được không"* → chưa, vì ngữ nghĩa chưa chốt. Và chính **`M-5` của BA** (*"khai verdict kỳ vọng trước khi chạy"*) là chỗ hai lens gặp nhau: **không thể khai verdict kỳ vọng cho scenario 4 khi `U-13` chưa giải** — với code đo `t2 - t1`, freeze và virtual cho hai kết quả khác nhau.

⇒ **Kết luận: denominator là hàm của việc `A3` có đóng được `U-13` và `U-16` ở dạng hypothesis hay không.**

| `A3` đóng được gì | Denominator |
|---|:--:|
| Không đóng thêm gì | **5** |
| Đóng `U-13` (ngữ nghĩa clock) **và** `U-16` (drift là warn hay fatal) ở dạng hypothesis | **7** |
| Thêm `ACG-06` + `U-20` | 9 |
| — | **10 không bao giờ** — scenario 10 ngoài phạm vi ở mọi phương án |

**Đây là quyết định phạm vi của `A3`, có chi phí MD, và phải đưa lên gate** — không để `A4` tự phát hiện lúc đang viết.

### 3. Ba lens hội tụ vào `U-25` từ ba hướng độc lập

| Lens | Cần `U-25` để làm gì |
|---|---|
| `quality-assurance` | Tách non-determinism khỏi thiếu-capture bằng dữ liệu (checklist bước 1) |
| `architect` | `out-of-scope-determinism` **không có tín hiệu quan sát được nào** nếu không lặp (thủ tục bước 4) |
| `business-analyst` | Scenario chỉ tính `reproduced` khi **cả `K` lần** đều `matched` (fail-closed) |

⇒ **`U-25` nâng từ *"trong phạm vi spike"* lên *"điều kiện tiên quyết"***. `A5` phải chốt `K`. Ripple sang `C1`.

### 4. Bốn nhóm hidden input KHÔNG có cơ chế phát hiện — phải vào Spike Report như giới hạn

env vars · filesystem state · **process state** · OS behavior. Class loại trừ chúng **bằng lời khai**.

Điểm worker nêu đáng chú ý: **process state là cùng lớp vấn đề với Redis**, chỉ khác là nằm trong process. ⇒ `GAP-Redis` không phải ca cá biệt — nó là **thể hiện đầu tiên bị phát hiện** của một lớp vấn đề rộng hơn. Cả `S11` lẫn phát biểu loại trừ gọn ở (ii-b) đều nhằm vào lớp đó, không chỉ vào Redis.

### 5. `W1` phải được viết vào Spike Report ngay từ `A3`, không đợi `C4`

Rubric có **recall = 0** với rẽ nhánh thuần logic. Nếu điều này chỉ xuất hiện ở `C4` thì nó thành *"phát hiện muộn"*; viết từ `A3` thì nó là **giới hạn đã công bố**. Khác biệt lớn về mặt quản trị — và đúng tinh thần `A3` exit criteria (*"nêu rõ điểm yếu đã biết"*).

## Mâu thuẫn với lens khác

| Với | Mâu thuẫn | PM phân xử |
|---|---|---|
| `business-analyst` | Denominator **7** vs **5** | **Hợp nhất được** — xem mục 2. Denominator là hàm của phạm vi `A3`. Đưa lên gate |
| `security-auditor` | Không mâu thuẫn. Security `R3` (*READ chứng minh bằng khớp entry đã ghi, không bằng verb*) **tương thích** với tập field của architect (`direction` theo `ACG-09` fail-closed) | — |
| `quality-assurance` | Không mâu thuẫn. QA cần *"điểm phân kỳ đầu tiên"* — rubric của architect **xuất ra đúng thứ đó** (chỉ số đơn vị phân kỳ đầu tiên) | — |
| `security-auditor` | Security đề xuất *"WRITE bị chặn + recorded result trả về ⇒ phải phân loại `matched`"*; architect **cũng** nêu đúng ràng buộc này | Hai lens **độc lập cùng đề xuất** ⇒ độ tin cậy cao |
