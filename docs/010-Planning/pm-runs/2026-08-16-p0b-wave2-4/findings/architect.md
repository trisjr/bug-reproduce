---
id: PM-FIND-2026-08-16-ARCH
type: reference
status: draft
created: 2026-08-16
---

# Findings — architect (lens kiến trúc, read-only)

## Kết luận của worker

### Q1 — Seam `B1` → `B0` (nợ `W-3`): CÒN ĐÚNG, và nặng hơn bảng nợ mô tả

| Điều `W-3` khai | Verify | Thực tế đo được |
|---|:--:|---|
| `0 hit` `direction` | ✅ | `record()` phát 10 key, không có `direction` — `interaction-log.js:46-58` |
| `cache`/`marker` ngoài `KINDS` | ✅ | `interaction-log.js:22-26` vs `normalize.js:217-223` (5 kind) |
| `normalize()` ném `RangeError` | ✅ | `normalize.js:234` (kind), `normalize.js:268` (direction) |

**Ba thứ `W-3` khai thiếu, cả ba đổi kết luận:**

1. **Không phải 2/7 kind hỏng — 100% bản ghi hỏng.** `direction` fail-closed tại `normalize.js:268-272` ⇒ một entry `db-query` **hợp lệ hoàn toàn** vẫn ném `RangeError`. Đo: `normalize kind=db-query -> RangeError: direction phải là READ|WRITE ... got undefined`. `W-3` đọc như "hai kind lạ cần map"; thực tế **không một bản ghi nào của `B1` đi qua được `B0`**.

2. 🔴 **`B1` ĐÃ có normalization thứ hai — `R1` đã tái xuất ở tầng match, ngay bây giờ.** Không nằm trong bảng nợ:
   - `db.js:42-44` `normalizeSql()` — chuẩn hoá whitespace, ghi vào `target` tại `db.js:53`
   - `external.js:26` — `target = \`POST ${AUTHORIZE_PATH}\`` — tự dựng path template thủ công

   Hệ quả đo được:
   ```
   B1 target 'POST /payments/authorize'
     → normalize().target = "/POST%20/payments/authorize"   ← RÁC, KHÔNG ném lỗi
   raw url qua hook driver
     → normalize().target = "POST http://stub:9099/payments/authorize"
   SAME identity? false
   ```
   SQL may mắn idempotent; **outbound-http hỏng IM LẶNG** — không exception, chỉ ra một `identity()` khác. `B3` sẽ không tự phát hiện.

3. **Tiền đề của `W-3` sai: `B3` KHÔNG tiêu thụ log của `B1`.** `interaction-log.js:6-8`: *"Đây KHÔNG phải recorder B3 — B3 sẽ tự chặn ở tầng driver."* `cache`/`marker` chỉ nuôi `test-invariant.js:305,323`, là hợp đồng nội bộ của `B1`.

**Phán quyết: phương án (a) — `B3` map tại hook driver.** Bác (b) và (c):

| | `B3` | `B5` | `B6` |
|---|---|---|---|
| **(a) `B3` map lúc capture** | Derive `direction` tại hook (có SQL verb / HTTP method). **Drop** `cache`+`marker` | Không đổi | Không đổi — dãy sạch, đúng 5 kind |
| **(b) mở `KINDS` trong `B0`** | Bớt việc | 🔴 phải quyết phục vụ hay chặn `cache` lúc replay | 🔴 Redis thành **đơn vị so sánh** trong execution path |
| **(c) sửa `B1`** | Bớt việc | Không đổi | Không đổi — nhưng `B1` đã `DONE` + merge |

- **(b) đảo ngược `G1`**: cho `cache` vào `KINDS` ⇒ capsule mang đơn vị Redis ⇒ `B5` phải phục vụ lúc replay ⇒ đúng là **hook Redis hai phía**, phương án (b) của `GAP-Redis` mà `G1` **đã loại**. Đo lại chi phí thật: phải sửa **ba** chỗ (`normalize.js:217`, nhánh `else` `normalize.js:257-260` — kind lạ rơi vào nhánh **clock** ⇒ `target = null`, và `schema.js:352`) ⇒ `validateArtifact` ra **4 lỗi**.
- **(c) không sai kỹ thuật nhưng sai địa chỉ**: `marker` không phải interaction; xoá nó phá `test-invariant.js` = phá bằng chứng `G1`/`R2`, vốn là exit criteria `B1` (`Timeline:292`).

⚠️ **(a) chỉ thoả điều kiện "không hai normalization" NẾU gate chốt thêm hai dòng:**
- `B3` **cấm đọc bất cứ thứ gì** từ `interaction-log.js` — đọc là thừa hưởng `normalizeSql()` và target thủ công ⇒ hai bản. `B3` hook driver, đưa **giá trị thô** vào `normalize()`.
- `direction` derive ở **đúng một chỗ**: hàm thuần `directionOf(kind, target)` đặt **trong `B0`**, `B3` và `B5` cùng gọi. Lý do: `direction` ngoài khoá `identity()` (`identity.js:79-83`) nhưng **có** trong 6 field so sánh (`schema.js:177-184`); derive lệch ⇒ `B5·d` sai ⇒ `Spec §3.6` bước 2 quy sai trách nhiệm.

### Q2 — `B4` capsule "tự chứa": schema `B0` **CHƯA** đủ

`makeArtifact()` (`schema.js:246-259`) sinh 9 key. **Đã đủ**: DB result payload + stub response body có chỗ qua field `result` (`schema.js:177-184`, `Spec:345`); `db.js:60` ghi `{row_count, rows}`, `external.js:41` ghi `{status_code, body}`; `serializeArtifact`/`parseArtifact` đã có (`schema.js:358-364`).

**Thiếu ba lớp:**

| # | Thiếu | Bằng chứng |
|:--:|---|---|
| (i) | **3/8 nhóm capture §18 không có `kind`** — stack trace · Git commit · runtime metadata | cả ba `normalize()` ném `RangeError`; `grep gitCommit\|runtimeMetadata\|drift\|stackTrace src/spike/contract/` → NO MATCH. *(`Spec §3.2:351` loại stack trace khỏi **so sánh** — "không so" ≠ "không lưu")* |
| (ii) | **Không có slot cờ drift** ⇒ `Spec §3.6` bước 3 chết | `Spec:444` hỏi cờ drift; `MTP:527` chỉ định nguồn *"cờ drift **trong capsule** — trường máy đọc được"* + *"giá trị hai bên (capsule vs local)"*. Capsule không mang giá trị nào để so. `Spec §3.9:612`: không cờ ⇒ *"mọi divergence do drift rơi xuống bước 5 và bị dán nhãn `code`"*. Chặn **scenario 6** vào denominator (`Spec:632`) |
| (iii) | **Không có con trỏ tới commit hash manifest `B10`** | chỉ có `scenarioId`; `MTP:501` bắt hash vào `T1` ô 6. Sau destroy, nối capsule ↔ manifest phải làm tay |

🔴 **`1.5 MD` của `B4` giả định schema đã đủ chỗ — nó không đủ. Và KHÔNG task nào được giao mở rộng schema**: `B0` đã đóng ở Wave 1; `B3` mục (iv) chỉ nói *dùng* `normalize()`/`identity()`, không nói *mở rộng*; `B4` chỉ nói *tự chứa*. **Đúng lớp lỗi `INT-1`/`INT-2`** (`tasks.md:119`) — nghĩa vụ nằm ở ranh giới, không ai được giao.

### Q3 — Cổng `inconclusive`: `B6` **KHÔNG** tự suy được

Dữ liệu bắt buộc: khối `classAssessment` 4 trường — `B0` đã cưỡng chế (`schema.js:115-171`: `inClass` ∈ {true,false,null}, `mechanism` ∈ 4 giá trị, `failedConditions` ⊂ S1–S7, `exclusionAxis` bắt buộc khi `inClass=false`) + `scenarioId` (`schema.js:289-293`).

**Bốn chặn độc lập, mỗi cái đủ để chặn suy luận:**
1. **`S7` không quan sát được tại capture** — `Spec:158` đòi replay `K=3` (`MTP:118`); so `K` verdict là **bảng của harness `B7`** (`MTP:528`)
2. **4 nhóm trục 1 không có cơ chế phát hiện nào** — `Spec §2.3:186-191`: env var · filesystem state · process state · OS behavior, *"không `M-cap`, không `M-rep`, không `M-scope`"*
3. **Trục 2 mù theo cấu tạo** — `R1` cấm hook Redis ⇒ capsule chứa **0** đơn vị Redis ⇒ loại trừ bằng **lời khai**, không phải suy luận
4. **`M-rep` không khai đúng được tại capture** — enum `schema.js:72-77` cho phép ghi, nhưng tại capture chưa có phép lặp nào

**Về `Depends`: XÁC NHẬN thiếu `B3`→`B6`, kèm đính chính** — về **lịch** cạnh này phủ bắc cầu (`B6←B5←B4←B3`) nên run plan không sai thứ tự. Cái thiếu là **hợp đồng nội dung**, và nó thiếu theo **chiều ngược**: `B3` phải biết ngữ nghĩa cổng của `B6` **trước khi** viết `inClass`, mà `B3` đứng trước `B6` bốn task.

### Q4 — Đồ thị phụ thuộc THẬT

**(i) Cạnh THIẾU**

| # | Cạnh | Bằng chứng | Mức |
|:--:|---|---|:--:|
| 1 | **`B7 ← B6`, `B7 ← B5`** | `MTP:84` RSR *"đọc verdict của `B6`"*; `MTP:85` EMR; `MTP:91` Replay Time bắt buộc breakdown gồm `t_verify`; `MTP:576` `B7-12` composite; `MTP:92` population gồm `T1`–`T12` (exit criteria `B5`). `Timeline:298` khai `B7←B3,A5` ⇒ **4/6 metric không dựng được nếu chưa có `B6`** | 🔴 |
| 2 | **`B9 ← B5`** | `Timeline:300` khai `B9←B4`. Bề mặt security thật (default-deny `L1`/`L2`, egress) nằm ở `B5`. Audit sau `B4` nhưng trước `B5` = **audit nhầm codebase** | 🔴 |
| 3 | **`B3 ← B0`** | `Timeline:294` mục (iv) cấm tự viết normalization; cột `Depends` chỉ ghi `B1`. Vô hại hôm nay — **sống lại nếu gate chốt mở rộng schema** | 🟠 |
| 4 | **`B5 ← B0`** | `README:114-123` đặt `B5` là consumer `identity()` (`B5·a`, `B5·f`); `Timeline:296` `Depends = B4,A5` — `B0` vắng, trong khi `B6` *có* ghi. Bất đối xứng = lỗi khai báo | 🟠 |
| 5 | **`B6 ← B3`** (nội dung) | Q3 | 🟠 |
| 6 | **Chủ sở hữu mở rộng schema** | Không cạnh nào, không task nào. Q2 | 🔴 |

**(ii) Cạnh THỪA (khai tuần tự, thực ra song song được)**

| # | Cạnh | Vì sao thừa |
|:--:|---|---|
| 1 | `B4 ← B3` | Đối tác hợp đồng thật của `B4` là **`B0`**: `serializeArtifact`/`parseArtifact` đã tồn tại, `makeArtifact()` đã cố định hình dạng. `B4` dựng được trên artifact fixture sinh từ `B0` |
| 2 | `B6 ← B5` | `B6` là **hàm thuần trên hai artifact**, unit-test được bằng hai artifact synthetic. Cạnh này đang giam 3.0 MD sau 4.0 MD không cần thiết |
| 3 | `B5 ← A5`, `B6 ← A3` | `A3`/`A5` thuộc `P0-A`, **đã đóng tại Gate A** — cạnh chết, không được xuất hiện như blocker |
| 4 | `B8 ← B1` | `B1` `DONE` ⇒ `B8` **unblocked ngay bây giờ** |

**(iii) Tập song song lớn nhất, ownership rời tuyệt đối: 4 task**

`B3` → `src/spike/recorder/` · `B4` → `src/spike/capsule/` · `B6` → `src/spike/verify/` · `B8` → `test/spike/scenarios/`. Cả bốn đọc `src/spike/contract/` **read-only**. Điều kiện: hợp đồng `B0` (kể cả phần mở rộng) **đóng băng tại gate** trước dispatch.

**Lên 5 task** nếu gate chốt `B5` đọc capsule qua `parseArtifact()` của `B0` thay vì qua reader của `B4` — worker đề xuất phương án này, gọi nó là *"đòn bẩy lịch lớn nhất còn lại trong 18 MD"*.

🔺 **VA CHẠM OWNERSHIP PHẢI SỬA TRƯỚC KHI VIẾT RUN PLAN**: `Timeline:298` cho `B7` sở hữu `src/spike/bench/`, **`test/spike/`** — thư mục **cha** của `test/spike/scenarios/` (`B8`) và `test/spike/manifests/` (`B10`). Thu hẹp `B7` về `test/spike/bench/`.

### Q5 — 🔴 Rủi ro kiến trúc số một

> **`B3` ghi `inClass: null` một cách TRUNG THỰC ⇒ denominator sụp về 0 ⇒ `GATE-06` không có số để trả lời, phát hiện lần đầu tại `B6`.**

`Spec §2.2` bắt cả 7 điều kiện `S1`–`S7` đồng thời đúng. Tại **thời điểm capture** — chỗ duy nhất `B3` đứng — `S7` không quan sát được và 4 nhóm trục 1 không có cơ chế phát hiện. Chính `B0` đã viết sẵn lối thoát trung thực, `schema.js:94-96`:

> *"`null` là giá trị hợp lệ và có nghĩa: Spec §3.5 xử 'KHÔNG, hoặc KHÔNG KIỂM ĐƯỢC' như nhau ở cổng tầng 1 ⇒ `B3` **LUÔN ghi được một điều đúng sự thật**."*

Đo: `validateArtifact(inClass=null)` → `ok = true`, `errors = 0` ⇒ **`B3`, `B4`, `B5` đều XANH, không ai chặn**. Cổng `B6` loại **mọi** execution như vậy. Cả 10 scenario ⇒ `D = 0`, `EMR = 0/0`, composite `≥6/7` **không tính được** — 18 MD ra báo cáo không có tử số lẫn mẫu số.

**Cực đối xứng cũng hỏng**: `B3` ghi `inClass: true` cho cả 10 để có số đẹp ⇒ cổng không bao giờ nổ, `≥6/7` tính trên denominator chưa từng được lọc — nguyên văn `Timeline:297`: *"không cách nào phát hiện từ chính báo cáo"*. **Ở giữa không có mặc định an toàn nào.**

**Dấu hiệu sớm nhất**: artifact ĐẦU TIÊN của `B3`, đọc đúng một trường — `node -e "console.log(require('./<artifact>.json').classAssessment)"`. `inClass === null` hoặc `mechanism === 'none-declaration'` ⇒ sụp denominator. `inClass === true` mà không ai giải thích được `S7` kiểm bằng gì ⇒ denominator không bộ lọc. Một lệnh, không cần chờ `B4`/`B5`/`B6`.

**Đề xuất xử ở gate**: chốt thành văn một **quy tắc gán `inClass` cho spike** trước khi dispatch `B3` — ví dụ *"`S1`–`S6` đánh giá tại capture bằng lời khai có ghi `mechanism`; `S7` **không** tham gia `inClass` ở `P0-B`, kiểm riêng qua bảng `K=3` verdict của `B7`"*. Một đoạn văn, không code, không task mới.

## PM đọc được gì

1. **Ba hạng mục chưa có chủ, cả ba đều 🔴** — mở rộng schema `B0` (3 kind §18 + lớp drift + con trỏ manifest), hàm `directionOf()` dùng chung, và quy tắc gán `inClass`. Cả ba nằm ở **ranh giới ownership**, đúng lớp lỗi mà Wave 1 đã trả giá một lần với `INT-1`/`INT-2`. Run plan phải chỉ đích danh chủ sở hữu **trước** dispatch.
2. **`B4` = 1.5 MD là con số của một giả định sai.** Phải cộng lại, và việc cộng lại kéo theo `Timeline §4` + `Planning-MOC` như quy ước repo.
3. **Bốn cạnh `Depends` thừa** ⇒ tập song song thật là 4–5 task chứ không phải chuỗi tuần tự. Đây là đòn bẩy lịch lớn nhất trong 18 MD, và nó **không** đến từ việc cắt scope.
4. **Hai cạnh thiếu 🔴 đảo thứ tự Wave 4**: `B7←B6`/`B7←B5` nghĩa là `B7` **không** chạy song song với `B9`/`B10` như `run-plan` Wave 1 phác thảo; `B9←B5` nghĩa là `B9` phải đứng sau `B5`, không phải sau `B4`.
5. **Rủi ro `Q5` là thứ duy nhất có thể làm hỏng cả 18 MD mà mọi test đều xanh.** Nó phải là một quyết định của gate, không phải một dòng trong prompt dispatch.

## Mâu thuẫn với lens khác

*(chờ `security-auditor`, `devops-engineer`, `quality-assurance`)*
