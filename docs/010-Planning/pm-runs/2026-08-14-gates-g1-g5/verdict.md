# Verdict: 2026-08-14-gates-g1-g5

**Bước 6 — Verification.** Verifier: `context-auditor`, dispatch độc lập, **read-only** (`FILES_TOUCHED: none`). Verifier này **không phải** một trong bốn writer đã ghi file — đúng guardrail *"verify phải do agent KHÁC agent đã thực thi"*.

**Phạm vi audit**: **32 file** deliverable, đối chiếu với `outline.md` (hợp đồng của run), `RULE-001` (contract của lane), `escalations.md` E-01…E-06 (quyết định + phân xử), và `git show HEAD:<file>` (trạng thái trước run).

---

## Verdict tổng thể: **PASS**

| Tiêu chí | Kết quả |
|---|---|
| **Completeness** | ✅ PASS — 32/32 file mang nhãn; 32/32 frontmatter đủ 5 trường; 11/11 ADR `Accepted` + callout |
| **Correctness** | ✅ PASS — **15/15 mục phải hở vẫn hở**; 0 khẳng định bịa; bộ số `33/8/2 = 43` verifier **tự cộng lại từng dòng**; `RQ.md` **0 byte** thay đổi |
| **Coherence** | ✅ PASS — hai họ nhãn không trộn; ba họ ID rủi ro sạch; 0 chỗ kho tự nói ngược |
| **Connectivity** | ✅ PASS — 919 link + 17 anchor phân giải hết; 0 wiki-link thật; 0 orphan |

**0 CRITICAL · 4 WARNING · 3 SUGGESTION.** Toàn bộ 7 mục đã được PM xử ở close-step, **không cần dispatch worker mới**.

---

## 1. Số đếm đã được verify độc lập

Verifier **không tin tuyên bố của writer** — mọi con số dưới đây do verifier tự đếm bằng `Read`/`Grep`/`Bash`/`git`.

| Hạng mục | Cam kết | Thực tế | |
|---|---|---|---|
| File mang nhãn `CHỐT GATE-0` | 32 | **32/32**. Thấp nhất 1 lần (`Planning-MOC`, `QA-MOC`, `Stories-MOC`, `UC-03`, `ADR-004`, `ADR-011`), cao nhất **32** (`Threat-Model`), kế đó **26** (`SDD`) | ✅ |
| Frontmatter `id`/`type`/`status`/`created`/`updated` | 32/32 | **32/32**, `updated: 2026-08-14` ở cả 32 | ✅ |
| File trước run **thiếu** trường `updated:` | *outline ghi 6* | **9** — đối chiếu `git show HEAD:` từng file: `ADR-001`, `003`, `005`, `007`, `008`, `010`, **`UC-02`**, **`UC-03`**, **`BRD-001`**. Cả 9 nay đã có | ⚠ → `WARN-4` |
| `Decision status: Accepted` | 11 | **11/11**, đều ở **dòng 12**, kèm `Người duyệt: @TrisJr` + ngày | ✅ |
| Chuỗi `Proposed` trong `030-Specs/Architecture/` | 0 | **0** | ✅ |
| `Proposed` còn lại toàn kho | — | 3 chỗ, **đều là trích lịch sử có nhãn**: `RQ.md:1408`/`:1711` (tên section gốc *"§24. Proposed Initial Success Threshold"*), `NFR:62` (trích nguyên văn) | ✅ |
| Callout *"`Accepted` KHÔNG đóng `Open items`"* + trỏ `GATE-03-r` | 11 | **11/11** | ✅ |
| Bộ số requirement bảo mật | `33/8/2 = 43` | Verifier **bóc từng dòng requirement ra cộng lại**: `MUST-V0.1` = **33** · `SHOULD` = **8** · `DEFER` = **2** (`SEC-025`, `SEC-039`) · reserved 5 → **43** ✓. `SEC-016` = `MUST-V0.1` tại dòng requirement thật | ✅ |
| Chỗ còn khai `32/8/3` | chỉ chỗ có nhãn lịch sử | **3 chỗ, cả 3 có nhãn**: `Threat-Model:1222` (cột *"Trước `D2`"*), `NFR:307` + `PRD:212` (dạng chuyển tiếp *"đổi từ … sang"*) | ✅ |
| Ba con số threat **11 / 10 / 9** | khớp 2 file | `Risk-Register §3` và `Threat-Model §4.3`+`§4.5` **trùng khớp từng ID**. `grep '10 threat\|còn 10'` ngoài `pm-runs` = **0** | ✅ |
| Ô `Owner` của Risk Log | 18 | **18/18 = `@TrisJr`**, 0 ô còn `TBD` | ✅ |
| `@` token toàn `docs/` | chỉ `@TrisJr` | **`@TrisJr` 201 lần**; ba token khác đều không phải tên người (`@repro` npm scope, `@example` email ví dụ, `@docs`) | ✅ |
| Con số TTL | chỉ 30 ngày | `grep '[0-9]\+ ngày'` → **chỉ `30 ngày`, 106 lần**. Ba lần *"1 ngày"* đều là *"vượt 1 ngày công"* trong triage `pm-runs` | ✅ |
| Thành phần sàn Capsule Store | đúng 3 | 5 neo kiểm (`SDD:506/539/1431`, `ADR-009 D3`, `Glossary`, `Threat-Model:180`, `000-Index:47`) — **không thành phần nào bị thêm** | ✅ |
| Link tương đối | 0 chết | **919 link, 0 chết** | ✅ |
| Anchor nội-tài-liệu `](#…)` | 0 chết | **17/17 phân giải được** | ✅ |
| Wiki-link `[[` | 0 | **1 hit duy nhất** = literal JSON array `[[18392, …]]` tại `Threat-Model:829`, **có trước run**. 0 wiki-link thật | ✅ |
| Orphan | 0 | **0/50 file**; 10/10 MOC được `000-Index` trỏ tới | ✅ |
| Nhãn M1/M2 bị giảm | 0 file | **0/32 file giảm** (so `git show HEAD:`). 3 file **tăng** (`000-Index` 0→1, `ADR-002` 5→6, `ADR-009` 9→11) — đều là thêm ngữ cảnh | ✅ |
| `RQ.md` | 0 byte | **0 byte.** `git status` rỗng, `git diff --stat` rỗng | ✅ |

---

## 2. Kiểm tra chống chốt-hộ — **15/15 mục vẫn hở, và hở CÓ ĐỊA CHỈ**

Đây là phần PM quan tâm nhất. Failure mode nguy hiểm nhất của một run *"lan quyết định"* **không phải** thiếu nhãn — mà là **nhãn lan quá xa**, đóng hộ những mục quyết định không hề chạm tới. Verifier kiểm ở **register có thẩm quyền**, không kiểm bằng câu văn rời.

| Mục | Trạng thái sau run | Neo verifier kiểm |
|---|---|---|
| `N-05` (ngưỡng) | ⏳ `TBD` | `NFR:170` ghi *"VẪN LÀ `TBD` sau ngày 2026-08-14"* + owner + điều kiện đóng; `ADR-006:104` nói cùng điều |
| `ACG-01`…`ACG-12` | ⏳ hở | `NFR:357`: *"Không một mục nào của `ACG-01`…`ACG-12` được các quyết định ngày 2026-08-14 đóng lại"* |
| `U-01` | ⏳ `SPIKE` | `SDD §8.3` |
| `U-02` | ⏳ `TBD` *"rủi ro hiện thực cao nhất"* | `SDD §8.3` |
| `U-04` | ⏳ `TBD` *"unknown lớn nhất tài liệu"* | `SDD §8.3` |
| `U-10` | ⏳ `TBD` | `SDD §8.3` |
| `U-06d` (key custody) | 🚨 `TBD` — **BLOCKER** | `ADR-009 Open items`; owner `@TrisJr` cấp ở `Risk-Register §4.2` (E-06) |
| **Cơ chế** authn/authz | ⏳ `TBD` | `SDD §5.4`; `ADR-009 D3` đóng **sàn**, giữ `TBD` **cơ chế** |
| `GAP-04` | ⏳ **chưa đóng** | Verifier đọc **toàn bộ 40 chỗ** nhắc `GAP-04` — **0 chỗ nói đã đóng** |
| `Enterprise security` (§28) | ⏳ chưa ai phán xử | `ADR-009:173`, `SDD:1335`, `ADR-002:143` — cả ba nhất quán |
| `SEC-008` | ⏳ `TBD` | `Threat-Model §11.b`; `Risk-Register §3.2` ghi *"Còn mở"* |
| `SEC-025` | ⏳ giữ `DEFER` | `Threat-Model:1093`, có lý do tường minh |
| **4 ngưỡng §24** | ⏳ vẫn *hypothesis* | 14 neo kiểm; `Stories-MOC:43` còn biến ràng buộc thành **guardrail chính thức** khi phân rã mở |
| `SDD §8.3` TBD Register | **25 mục, không giảm 25→23** | Verifier đếm `^| \`U-` = 25 dòng. Đúng quyết định E-02 |
| `U-06` | `CHỐT (phần sàn)` + `TBD (cơ chế auth)` | Dòng **không bị xoá** — đổi disposition, giữ dấu vết |

**Bảng tra nhanh của `ADR-009 Open items` khớp từng ô với disposition trong từng dòng** ⇒ writer lượt A **đã reconcile thật**, không tái lập lỗi `C1` của run trước.

---

## 3. WARNING — xử lý từng mục

| # | Vấn đề | Xử lý của PM |
|---|---|---|
| **W1** | Callout `GATE-03-r` trỏ `Risk-Register` **không có số section**, đúng vào mục vừa bị đánh số lại (`§4.2` mới ↔ `§4.3` cũ) | ✅ **PM sửa — nhưng phải sửa lại phạm vi vì báo cáo verifier NGƯỢC.** Xem mục 4 |
| **W2** | `SDD-Repro.md:27` — **dòng legend dạy cách ghi nhãn** dùng đúng biến thể có backtick mà E-04 đã loại. Nguy hiểm riêng: legend là thứ writer sau đọc để **copy** | ✅ **PM sửa** — viết lại dạng chuẩn + thêm câu giải thích *vì sao* không backtick, để lần sau không ai "sửa lại cho đẹp" |
| **W3** | `escalations.md` E-03/E-04 còn `⏳`, và E-03 khai *"`§3` tạm giữ nguyên con số 10"* trong khi `§3` đã là **9**. **Run-state nói ngược lane tài liệu** | ✅ **PM append `E-07`** — file append-only nên không sửa entry cũ. E-07 ghi kết thúc cả hai + bài học |
| **W4** | `outline.md` còn hai con số hợp đồng lạc hậu: *"6 file thiếu `updated:`"* (thực tế **9**) và tiêu chí *"`Decision status` 3/3 file"* (thực tế **2/2 ADR + tuyên bố ở `SDD §1.6`**) | ✅ **PM sửa** — thêm hai khối *Đính chính* tại chỗ, kèm nguyên nhân gốc. Không xoá con số cũ |

### SUGGESTION — cả 3 đã làm

| # | Gợi ý | Xử lý |
|---|---|---|
| **S1** | Hai biến thể nhãn phụ (`CHỐT GATE-05a` / `GATE-05b` gộp) — **vẫn `grep` được** nên truy vết không đứt, khác hẳn ca E-04 | ✅ Tách thành hai nhãn đầy đủ |
| **S2** | `Glossary` thiếu headword cho khái niệm **nặng nhất run này sinh ra**: `key custody` — 63 lần trên 11 file, và `GATE-05b` vừa nâng nó thành blocker, nhưng chỉ nằm *bên trong* entry `Crypto-shredding` | ✅ Thêm headword **`key custody`** và **`GATE-0N`** |
| **S3** | `GATE-05` được dùng như ID bao trùm mà không tài liệu nào khai nó là ID ⇒ `grep 'GATE-05'` sẽ ra **ba** định danh cho **hai** quyết định | ✅ Khai tường minh **`GATE-05` = `GATE-05a` + `GATE-05b`** trong entry `GATE-0N` của Glossary |

---

## 4. Một lỗi của VERIFIER mà PM bắt được — đáng ghi nhất run này

`WARN-1` của verifier viết: *"`ADR-002:16` và `ADR-009:16` ghi … **không có `§4.2`**. **9/11 ADR còn lại đều có `§4.2`**."*

**Thực tế ngược lại hoàn toàn.** PM tự chạy `grep` từng file trước khi sửa:

| Verifier nói | PM đo được |
|---|---|
| `ADR-002`, `ADR-009` **thiếu** `§4.2`; 9 file kia **có** | `ADR-002`, `ADR-009` là **hai file DUY NHẤT có** `§4.2` — vì PM vừa thêm ở lượt sửa trước đó. **9 file kia mới là nhóm thiếu** |

**Vì sao lỗi này đáng ghi**: nếu PM tin báo cáo và sửa đúng 2 file như verifier chỉ, thì **9 file sẽ vẫn thiếu** — và verdict sẽ tuyên bố `W1` đã đóng trong khi 82% phạm vi của nó còn nguyên. Đây đúng là loại lỗi mà guardrail *"không tick thay worker khi chưa đọc `FILES_TOUCHED`"* sinh ra để chặn, chỉ khác là lần này nó xảy ra ở **báo cáo của verifier**, không ở báo cáo của writer.

**Quy tắc rút ra cho run sau**: **verdict của verifier cũng phải được verify.** Cụ thể: với mọi finding có dạng *"file A/B sai, các file còn lại đúng"*, PM **phải tự chạy phép đếm ngược lại trên toàn tập** trước khi sửa — không sửa theo danh sách được đưa.

PM đã sửa **11/11 ADR** (và mở rộng sang mọi link `Risk-Register` khác trong `ADR-002`/`ADR-009` trỏ tới `GATE-04-r`/`GATE-05b-r`/`GATE-05b-r2`, vì chúng cũng nằm ở `§4.2`).

---

## 5. Hai `PARTIAL` — cả hai là hành vi ĐÚNG, không phải làm dở

| Writer | Lý do `PARTIAL` | Phân xử |
|---|---|---|
| `business-analyst` | Ba **hệ quả phái sinh** của `GATE-05b` không có nguồn ở cả mục 0 lẫn `RQ.md`: (a) hành vi khi replay không lấy được khoá; (b) `repro inspect` nay phải phân biệt **bốn** tình huống thay vì ba; (c) retry/buffer khi upload lỗi dưới `N-10` | ✅ Chấp nhận. Ghi `TBD` + owner + điều kiện đóng. Bịa hành vi là đúng thứ ràng buộc #3 sinh ra để chặn. **Hạng mục (b) là phát hiện có giá trị riêng** — nó cho thấy `GATE-05b` sinh một **chế độ hỏng mới ở tầng UX**, không chỉ phá bất biến kỹ thuật |
| `architect` lượt A | `U-06d` nay là blocker nhưng **không nguồn nào cấp owner kỹ thuật** — *"`GATE-01` chỉ cấp owner cho 18/18 risk gốc"* | ✅ Chấp nhận, và **writer đúng khi từ chối tự gán**. PM cấp `@TrisJr` ở **`Risk-Register §4.2`** chứ không ở `ADR-009`: ADR khai *unknown còn hở*, Risk-Register khai *ai chịu trách nhiệm* (E-06) |

**Hai writer độc lập báo `PARTIAL` vì cùng một cụm `U-06d`** — đó là tín hiệu mạnh nhất run này có về việc `GATE-05b-r2` là rủi ro thật, không phải ghi chú thủ tục.

---

## 6. Ba lỗi writer tự bắt và tự sửa

Đáng ghi vì cả ba đều là lỗi **writer tự tạo rồi tự phát hiện**, không do verify bắt:

| Writer | Lỗi | Nếu không tự bắt |
|---|---|---|
| `architect` lượt B | Viết literal `✅ ĐÃ CHỐT 2026-08-14` vào callout mới của `ADR-004` (khi đang cố nói *"đừng chạm nhãn M1"*) | Làm phép đếm truy vết M1/M2 tăng 2→3 — **phá đúng tiêu chí họ được giao bảo vệ** |
| `architect` lượt B | Draft đầu của callout `ADR-010` liệt kê ID bảo vệ là *"`U-21`…`U-25`"* | **Tái khẳng định** rằng `U-21`/`U-22`/`U-23` sống trong file đó — đúng dead link ngữ nghĩa mà `verdict.md §1` run trước nói đã sửa |
| `architect` lượt A | Tạo một **dòng `Authn + authz` trùng** trong bảng hook `SDD §7.4` | Hai dòng một định danh trong cùng bảng — đúng lớp nhập nhằng run này tồn tại để chặn |

---

## 7. Bốn giới hạn của inventory Bước 2 — nguyên nhân gốc và quy tắc rút ra

Bản kê inventory **thiếu ở 4 chỗ**, và cả 4 đều được writer/verifier bù. Verifier tự chỉ ra nguyên nhân gốc:

> *"Auditor có xu hướng chỉ kiểm ở nơi câu hỏi trỏ tới."*

| # | Chỗ thiếu | Loại |
|---|---|---|
| 1 | *"6 file thiếu `updated:`"* — thực tế **9**. Inventory chỉ kiểm trường đó ở **nhóm ADR**, nơi được hỏi đích danh | Phạm vi quét hẹp |
| 2 | `PRD:210` và `NFR:459` viết *"32 requirement MUST-V0.1"* — không khớp pattern `32/8/3` | `grep` chuỗi ghép thay vì từng thành phần |
| 3 | `UC-05:275` mang câu chặn crypto-shred, ngoài vùng 164–177 được giao ⇒ **bản kê 15 câu chặn vẫn chưa đủ** | Bản kê theo vùng, không theo ngữ nghĩa |
| 4 | Con số dẫn xuất *"10 threat còn hở"* — bản dispatch **dặn ngược** là giữ nguyên (E-03) | PM lập prompt sai, không phải lỗi inventory |

**Quy tắc cho run sau**: prompt inventory phải **tách rõ hai loại yêu cầu** — *"kiểm X ở những chỗ tôi liệt kê"* và *"quét X trên toàn phạm vi"*. Ba trong bốn chỗ trên thuộc loại thứ hai mà bị hiểu thành loại thứ nhất.

---

## 8. Verify lần cuối sau close-step — PM tự chạy, không tin báo cáo của ai

| Kiểm | Kết quả |
|---|---|
| 11/11 ADR có callout `GATE-03-r` trỏ `§4.2` | **11/11** ✅ |
| Link `Risk-Register` không có số section còn sót trong ADR | **0** ✅ |
| Biến thể nhãn có backtick toàn kho (ngoài `pm-runs`) | **0** ✅ |
| Biến thể nhãn gộp `GATE-05a/GATE-05b` | **0** *(hit duy nhất còn lại là chính `escalations.md` mô tả vấn đề)* ✅ |
| File mang nhãn chuẩn `CHỐT GATE-0` | **32/32** ✅ |
| Frontmatter 5 trường trên toàn 32 file | **32/32** ✅ |
| Link chết trong 32 file | **0** ✅ |
| Wiki-link thật | **0** *(1 hit = JSON array hợp lệ, có trước run)* ✅ |
| `outline.md` | **32/32 tick**, 0 chưa tick, 2 khối *Đính chính* ✅ |
| `RQ.md` | **0 byte** thay đổi ✅ |
| `git status` phạm vi | đúng **32 file `M`** + 1 thư mục run-state mới. `UC-04`, `OKRs.md`, run-state run cũ, và 4 MOC không có hit — **không có trong danh sách** ✅ |

---

## 9. Trạng thái đóng run

| Việc | Trạng thái |
|---|---|
| Lan 5 quyết định vào 32 file | ✅ Đóng |
| W1 — `§4.2` trong callout 11 ADR | ✅ Đóng — **sau khi PM sửa lại phạm vi vì verifier báo ngược** (mục 4) |
| W2 — legend nhãn ở `SDD:27` | ✅ Đóng |
| W3 — `E-07` ghi kết thúc E-03/E-04 | ✅ Đóng |
| W4 — hai đính chính `outline.md` | ✅ Đóng |
| S1 · S2 · S3 | ✅ Đóng cả ba |
| E-03 — con số dẫn xuất **9** | ✅ Đóng — `security-auditor` quyết, PM đồng bộ `Risk-Register §3`; hai file khớp **đến từng ID** |
| E-05 (a)(b)(c) — ba hệ quả phái sinh | 📌 **`TBD` có địa chỉ** — owner `@TrisJr`, điều kiện đóng = `U-06d` |
| E-06 — `U-06d` owner | ✅ Đóng — cấp `@TrisJr` ở `Risk-Register §4.2` |
| Close-step — MOC + `000-Index.md` | ✅ Đóng — 6 MOC + Index + Glossary, đều nằm trong 32 file |

### 9.1 Nợ lại — ghi thẳng, không giấu

| # | Nợ | Vì sao không làm trong run này |
|---|---|---|
| **N1** | **Spike protocol** — chốt `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` ở dạng *hypothesis có nhãn* để spike **cho điểm được** | Anh yêu cầu `G1=>G5`, không yêu cầu viết tài liệu mới. Đây là **hạng mục kế tiếp**, và là thứ chặn việc *kết luận* Phase 0 — không chặn việc *bắt đầu*. Rủi ro đã ghi thành `GATE-01-r` |
| **N2** | **Key management design** cho `U-06d` | Là thiết kế kiến trúc, không phải tài liệu hoá quyết định. Chặn nghiệm thu `SEC-016 = MUST-V0.1`. Mốc: **trước khi capsule format v1 đóng băng** |
| **N3** | **Pháp chế rà soát TTL 30 ngày** | `GATE-05a` quyết không qua pháp chế. Đã ghi thành rủi ro được chấp nhận có ý thức tại `Charter §5.1` và `Threat-Model §11.a` |
| **N4** | **G6 / W1 của run trước** — `status: live` ngoài enum RULE-001, 8 link chết ở 4 MOC ngoài phạm vi, `Design-MOC.md` thiếu frontmatter | Nợ **có sẵn từ trước** run (`verdict.md §9.2` của run trước). Anh yêu cầu `G1=>G5`, không phải `G6`. Thuộc một run Shape B housekeeping riêng |
| **N5** | Một dòng trong `.claude/commands/pm-doc.md` yêu cầu wiki-link `[[...]]`, ngược `RULE-001` MUST-rule #5 | Sửa file command là **lane khác**. Ghi tại `brief.md` A2 |

### 9.2 Trạng thái cuối

**Run đóng.** Không còn hạng mục nào chờ quyết định của anh. Năm nợ ở §9.1 đều **có địa chỉ** — owner, điều kiện đóng, và lý do vì sao nằm ngoài phạm vi run này.
