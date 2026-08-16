# `src/spike/contract` — Shared Spike Contract (task `B0`)

> ⚠️ **THROWAWAY.** Toàn bộ code `P0-B` là throwaway — `Spec-Spike-Protocol §0.3`, neo `RQ.md [stated §22]/[stated §39]`. Thư mục này tồn tại để trả lời **một** câu hỏi (`GATE-06`), **KHÔNG** để tiến hoá thành V0.1. Tái sử dụng bất kỳ phần nào cho V0.1 là **một quyết định riêng phải đi qua `P1`**.
>
> 🏷️ **Mọi quyết định trong thư mục này là `HYPOTHESIS — cần validate`** theo `Spec §0.2`/`§1.2`. Nhãn nằm ngay trong header từng file `.js`, mã hoá `H-N*` (normalize), `H-I*` (identity), `H-S*` (schema). Danh sách đầy đủ ở §5 dưới.

---

## 1. Đây là cái gì — và tường minh KHÔNG phải cái gì

`B0` cấp **một** artifact dùng chung cho ba consumer `B3` / `B5` / `B6`:

| File | Nội dung |
|---|---|
| `schema.js` | Schema artifact spike: bản ghi `interaction` **6 field** + **hai neo `U0`/`U∞`** + khối **`class_assessment`** bắt buộc |
| `normalize.js` | **Đúng bốn** phép normalization của `Spec §3.2` — không thêm, không bớt |
| `identity.js` | Hàm định danh tra cứu dùng chung — hiện thực **duy nhất** cho cả ba consumer |
| `self-check.js` | Self-check tự chạy, chứng minh bốn phép chạy đúng trên ví dụ |
| `index.js` | Điểm vào: `require('./src/spike/contract')` |

### ⛔ KHÔNG phải capsule format v1

Ba neo, đọc trực tiếp từ tài liệu đã đóng băng:

- `Timeline-Repro` dòng **`B4`**: *"Capsule writer tối thiểu — **KHÔNG** phải capsule format v1"*.
- **`ADR-002`** đặc tả layout **của sản phẩm** và tự để ở `Open items`: *"**Container format** (thư mục / tar / zip) và encoding chuẩn cho từng entry — **TBD**"*.
- Đóng băng capsule format v1 là task **`D5`**, thuộc **`P1`** (`Timeline` §D, phụ thuộc `D4`/`D3`).

⇒ Schema ở đây là **spike-local**. Nó **KHÔNG ràng buộc `D5`**, **KHÔNG** lấn vào ô `TBD` của `ADR-002`, và **KHÔNG** được trích dẫn ở bất kỳ tài liệu hạ nguồn nào như một quyết định format (`Spec §1.3` — quy tắc cấm nâng cấp). Nhãn version cố tình là `spike-0-HYPOTHESIS`, và mỗi artifact tự mang cờ `notCapsuleFormatV1: true`.

### ⛔ KHÔNG đóng `U-01` / `U-02`

`U-01` (interception mechanism) và `U-02` (query matching identity) thuộc **`D3` của `P1`**. **`P0-B` không có thẩm quyền đóng chúng.**

`Spec §3.2` tự cảnh báo: *"**Phép 1 và 2 đứng trên `U-02` — rủi ro hiện thực cao nhất của cả thiết kế**"* (`SDD-Repro §4.4`: bốn phương án, chưa chọn phương án nào). Hiện thực ở đây **thừa hưởng nguyên vẹn độ giòn đó** (`W2`, `Spec §3.11`).

**Việc `self-check.js` chạy 42/42 PASS KHÔNG phải bằng chứng `U-02` đã đóng.** Nó chỉ chứng minh hiện thực **khớp** với một rubric đã đóng băng tại `Gate A` — đúng phạm vi mà `B0` được cấp.

---

## 2. Schema — 6 field + hai neo + `class_assessment`

```
artifact
├─ schema / schemaVersion / notCapsuleFormatV1
├─ capsuleId          ← MTP §8.1 B3-4
├─ scenarioId         ← MTP §8.1 B3-4
├─ classAssessment    ← Spec §2.6   ⛔ BẮT BUỘC — thiếu ⇒ validateArtifact() FAIL
├─ u0                 ← Spec §3.1   neo đầu dãy (kind = inbound-http)
├─ interactions[]     ← Spec §3.1   dãy đơn vị ở giữa
└─ uInfinity          ← Spec §3.1   neo cuối dãy (outcome = danh tính LOẠI)
```

### 2.1 Sáu field của bản ghi `interaction` (`Spec §3.2`)

| Field | Vào so sánh | Ghi chú |
|---|:--:|---|
| `kind` | ✅ | `inbound-http` · `db-query` · `outbound-http` · `feature-flag` · `clock` |
| `target` | ✅ | SQL fingerprint · URL path template · tên feature flag · `null` với `clock` |
| `arguments` | ✅ | canonical JSON string; literal SQL và query string nhập vào đây |
| `direction` | ✅ | `READ`/`WRITE`, fail-closed (`ACG-09` + `ADR-005`) |
| `result` | ✅ | canonical JSON string. **Giá trị clock là `result` của `kind=clock`, KHÔNG tolerant** |
| `ordinal` | 🟡 | tolerant — nhóm đồng thời so như **TẬP** (`Spec §3.3`); **không** vào `identity()` |

`outcome` **không** nằm trong 6 field trên: `Spec §3.2` ghi nó là *"Chỉ ở `U∞`"* ⇒ nó là field của **neo**, không phải của bản ghi interaction.

**Ba slot KHÔNG vào so sánh** (carrier, neo `MTP §8.1 B3-8`):

- `redactedFields[]` — redaction record của đơn vị; phép 4 dùng nó, `Spec §3.6` **bước 1** đọc nó.
- `truncated` — cờ `truncated: true` **tại điểm phân kỳ**; `Spec §3.6` **bước `2b`** đọc nó.
- `concurrencyGroup` — slot mang ranh giới nhóm đồng thời. ⚠️ **`U-20` vẫn `SPIKE`**: schema cấp **chỗ để ghi**, **không** phát biểu cơ chế nhận diện nhóm (`Spec §3.3` cuối mục).

### 2.2 Khối `class_assessment` — hạng mục orphan, `B0` cấp chỗ đứng

`Spec §2.6` bắt buộc khối này ở thời điểm **capture**; khối `CAUTION` ghi *"**KHÔNG có phương án capture im lặng**"* — một capsule không mang đánh giá class *"trông giống hệt capsule hợp lệ… sẽ được replay, được chấm điểm, và được đưa vào một con số"*.

Ba trường theo đúng ba gạch đầu dòng của `Spec §2.6`:

| Trường | Nội dung | Neo |
|---|---|---|
| `inClass` | `true` · `false` · **`null` = KHÔNG KIỂM ĐƯỢC** | `Spec §2.6`; `null` vì `Spec §3.5` xử *"KHÔNG, hoặc KHÔNG KIỂM ĐƯỢC"* như nhau ở cổng tầng 1 |
| `failedConditions[]` | tập con `S1`–`S7` không thoả | `Spec §2.2` |
| `exclusionAxis` | `{axis:1, group}` (trục 1, nhóm §20.1) hoặc `{axis:2, dependency}` (trục 2, tên dependency) | `Spec §2.3` / `§2.4` |
| `mechanism` | `M-cap` · `M-rep` · `M-scope` · **`none-declaration`** (*"không cơ chế nào — kết luận đến từ **lời khai**"*) | `Spec §2.3` / `§2.6` |

⛔ **`validateArtifact()` CỐ Ý trả `ok: false` khi khối này vắng mặt.** Đây là toàn bộ khả năng thực thi mà `B0` cấp được cho khối `CAUTION §2.6`: một schema coi khối này là tuỳ chọn sẽ **tự tay dựng lại "capture im lặng" theo cấu tạo**.

⚠️ Hình dạng khối là một **đề xuất cơ chế cho `U-24`**, **chưa** phải câu trả lời của `U-24` — `Spec §2.3` (cảnh báo cuối) và `Spec §2.7 E-F`.

**Phân vai — `B0` chỉ giữ một phần ba:**

| Việc | Chủ |
|---|---|
| **GHI** khối lúc capture | `B3` |
| **THI HÀNH** cổng `inconclusive` (`Spec §3.5` tầng 1) | `B6` |
| **CHỖ ĐỂ NÓ TỒN TẠI** trong schema | **`B0` — file này** |

---

## 3. BA consumer và nghĩa vụ của từng consumer

Lý do `B0` tồn tại, phát biểu một lần cho rõ: neo **`R3`** (`MTP-Spike-Phase-0` bảng **`T6`**) — *"cái chứng minh **READ** trong replay **không phải verb**, mà là **khớp với một entry READ đã ghi trong capsule**"* ⇒ **allowlist an toàn của `B5` dùng chung hàm định danh với rubric của `B6` và với recorder của `B3`**. Hai phía hiện thực normalization lệch nhau ⇒ tái tạo đúng cơ chế hỏng mà **`R1`** (`Spec §2.5`) mô tả — *cả 10 scenario `diverged` với nguyên nhân `incomplete-capture` **giả*** — lần này ở **tầng match** thay vì tầng hook, **triệu chứng giống hệt**.

### 3.1 `B3` — recorder (`src/spike/recorder/`)

| # | Nghĩa vụ | Neo |
|:--:|---|---|
| B3·a | **GHI** artifact đúng `makeArtifact()` / `validateArtifact()`; artifact không pass validate là artifact **không được ghi ra đĩa** | `Spec §2.6` |
| B3·b | **BẮT BUỘC** điền khối `class_assessment` cho **mọi** capsule, kể cả khi kết luận là `inClass: null` + `mechanism: 'none-declaration'` | `Spec §2.6` CAUTION |
| B3·c | Điền `redactedFields[]` và `truncated` ở dạng **máy đọc được** cho từng đơn vị | `MTP §8.1 B3-8` |
| B3·d | **KHÔNG** tự viết normalization riêng. Nếu recorder ghi `target` thô, nó phải ghi thô **nhất quán** và để `normalize()` này là hiện thực duy nhất chuẩn hoá | `R1` — cấm lệch một phía |
| B3·e | Log đo lường của `B3` (`row_count`, `byte_size`, `consumed_by_replay`, `P-serialized`) **KHÔNG** thuộc schema này — chúng là log đo, không phải format trao đổi | `MTP §8.1 B3-1/2/5/9` |

### 3.2 `B5` — replay runtime + allowlist `R3` (`src/spike/replay/`)

| # | Nghĩa vụ | Neo |
|:--:|---|---|
| B5·a | Chứng minh một lời gọi là READ **bằng cách tra `identity()`** trong index của capsule, **KHÔNG** bằng verb | `R3` / `MTP T6` |
| B5·b | Sau khi tra được entry, **phải tự kiểm `direction === 'READ'`** — `direction` **cố tình nằm ngoài** khoá định danh (xem §4) | `ADR-005` default-deny |
| B5·c | **0 hit** ⇒ `MISSING_RECORDING`, **KHÔNG** fall through ra hệ thống thật | `T10`, `SEC-034`, `ADR-011 D4` |
| B5·d | **Hit nhưng `direction === 'WRITE'`** ⇒ từ chối fail-closed. Đây là ca **khác** với `MISSING_RECORDING` và phải phân biệt được | `ADR-005` Decision #2 |
| B5·e | Giá trị `target`/host trong capsule **chỉ** dùng làm **khoá tra cứu**, **không bao giờ** dùng để mở kết nối | `T11`, `SEC-035` |
| B5·f | ⚠️ **Redaction ở phía tra cứu**: entry có `arguments` đã redact mang **marker** trong khoá, lời gọi thật mang **giá trị thật** ⇒ miss ⇒ `MISSING_RECORDING` **giả**. `B5` phải áp redaction record của capsule **trước** khi tính `identity()`, hoặc xử miss theo `Spec §3.6` bước 1. `B0` **chỉ gắn nhãn** rủi ro này — phía tra cứu thuộc `U-02`, **vẫn mở** | `Spec §3.3`/`§3.6` bước 1; `U-02` |

### 3.3 `B6` — rubric (`src/spike/verify/`)

| # | Nghĩa vụ | Neo |
|:--:|---|---|
| B6·a | Chạy `normalizeArtifact()` trên **cả hai** phía trước khi so sánh — **cùng một** hiện thực, không có bản sao | `R1`, `Spec §3.2` |
| B6·b | So trên **đúng** tập field `INTERACTION_COMPARED_FIELDS` + hai neo; `ordinal` xử theo `Spec §3.3` | `Spec §3.4` đk 1–3 |
| B6·c | So `U∞` bằng `outcomeIdentity()` — **danh tính loại**, **không** stack trace (schema không có chỗ cho stack trace, cố ý) | `Spec §3.1`, `ADR-006 A3` |
| B6·d | **Thi hành cổng `inconclusive` TRƯỚC rubric**: đọc `classAssessment`; `inClass !== true` ⇒ `inconclusive`, **không chạy rubric**, **loại khỏi denominator** | `Spec §3.5`, `§2.6` |
| B6·e | Verdict logic (`matched`/`diverged`), thủ tục quy trách nhiệm `§3.6`, chỉ số composite — **thuộc `B6`, KHÔNG có trong `B0`** | ranh giới scope |

---

## 4. `identity()` — vì sao khoá chỉ gồm ba thành phần

```
identity(unit) = kind ␟ target ␟ arguments      (tất cả ĐÃ normalize)
```

Bốn field **cố tình nằm ngoài** khoá:

| Field ngoài khoá | Lý do |
|---|---|
| `direction` | Để `B5` phân biệt **hai ca khác nhau**: (a) **không có entry nào** ⇒ `MISSING_RECORDING`; (b) **có entry nhưng là `WRITE`** ⇒ default-deny. Nhét `direction` vào khoá trộn hai ca thành một *"không tìm thấy"* ⇒ `Spec §3.6` **bước 2** quy sai trách nhiệm |
| `result` | Chưa biết tại thời điểm tra cứu — đưa vào khoá là lập luận vòng tròn |
| `ordinal` | 🟡 tolerant (`Spec §3.2`), nhóm đồng thời so như **TẬP** (`Spec §3.3`) ⇒ vị trí không phải một phần của danh tính |
| `redactedFields` / `truncated` | Slot không vào so sánh |

**Thứ tự bắt buộc: `normalize()` trước, `identity()` sau.** `identity()` ném lỗi nếu nhận một unit chưa normalize. Khoá là **chuỗi người đọc được**, không hash — cố ý, để debug được ở spike.

**Điểm yếu đã biết** (bắt buộc theo `Spec §1.2` quy tắc 3): hai lời gọi **giống hệt nhau** trong cùng một execution cho **cùng** khoá. `occurrenceKey()` cấp cơ chế phân biệt lần xuất hiện, nhưng **có dùng hay không là quyết định của `B5`/`B6`**, chưa được chốt ở `B0`.

---

## 5. Danh sách `HYPOTHESIS` đã gắn nhãn

| Mã | Giả định | Nhãn | Điểm yếu đã biết |
|:--:|---|---|---|
| `H-S2` | Bản ghi `interaction` có **đúng 6 field** vào so sánh; `outcome` là field của neo `U∞`, không của interaction | `HYPOTHESIS — cần validate` · `[inferred]` | Cách đọc `Spec §3.2` + `findings/architect.md` Q1; nếu `D2` đọc khác thì schema phải đổi |
| `H-S1` | Envelope = **một object JSON**, encoding UTF-8, canonical stringify | `HYPOTHESIS — cần validate` · `[inferred]` | Không stream được, không chứa binary, phải nằm gọn trong RAM |
| `H-S3` | `u0`/`uInfinity` là **field riêng** của envelope, không phải phần tử của mảng | `HYPOTHESIS — cần validate` · `[inferred]` | Biến `Spec §3.4` đk 3 thành ràng buộc cấu trúc — chặt hơn Spec đòi hỏi |
| `H-S4` | `outcome = {class, type}`, so danh tính loại; **không** có chỗ cho stack trace | `HYPOTHESIS — cần validate` · `[inferred]` | Hai lỗi khác nhau cùng là `TypeError` sẽ khớp nhau |
| `H-S5` | Hình dạng khối `class_assessment` | `HYPOTHESIS — cần validate` · `[inferred]` | Là **đề xuất cơ chế cho `U-24`**, chưa validate (`Spec §2.7 E-F`) |
| `H-N1` | Heuristic SQL fingerprint (regex) | `HYPOTHESIS — cần validate` · `[inferred]` | Không xử dollar-quoted string, không tách comment, uppercase làm mất phân biệt quoted identifier |
| `H-N2` | Heuristic path template (digits · UUID · hex ≥ 16) | `HYPOTHESIS — cần validate` · `[inferred]` | Slug `abc-123` không được template hoá; `/v1/2024/report` bị template hoá nhầm |
| `H-N4` | Marker redaction là hằng chuỗi ổn định | `HYPOTHESIS — cần validate` · `[inferred]` | Dữ liệu thật trùng chuỗi marker sẽ bị coi là đã redact |
| `H-N5` | Ánh xạ *"phép nào áp cho field nào của kind nào"* | `HYPOTHESIS — cần validate` · `[inferred]` | `Spec §3.2` liệt kê 4 phép, **không** nói ánh xạ này; thứ tự phép 4 trước phép 3 là lựa chọn |
| `H-I1` | `identity = (kind, target, arguments)` đã normalize | `HYPOTHESIS — cần validate` · `[inferred]` | Stand-in cho `U-02`; hai lời gọi giống hệt cho cùng khoá; thừa hưởng độ giòn của `H-N1`/`H-N2`; **entry có `arguments` đã redact không tra được bằng giá trị thật ⇒ `MISSING_RECORDING` giả** (xem `B5·f`) |

---

## 6. Chạy

```bash
node -e "require('./src/spike/contract')"   # smoke test, phải im lặng
node src/spike/contract/self-check.js       # 42 assertion, exit 0 khi pass
```

**Ràng buộc kỹ thuật** (`CT-1`, `CT-2` — PM chốt): **CommonJS**, file `.js`, **zero-dependency**, chỉ built-in. Thư mục này **không sở hữu `package.json`** (thuộc `B1`) ⇒ nó **không được phép cần** một cái. Runtime kiểm chứng: `node v22.21.1`.

## 7. Ranh giới scope — cái gì **KHÔNG** ở đây

Không verdict logic · không so sánh dãy/tập · không thủ tục quy trách nhiệm `§3.6` · không capture hook · không thi hành allowlist · không harness đo metric. Nếu một PR thêm chữ `matched`/`diverged` vào thư mục này, PR đó đang xây `B6` ở nhầm chỗ.
