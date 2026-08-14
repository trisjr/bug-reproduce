# Verdict: 2026-08-14-repro-product-docs

**Bước 6 — Verification.** Verifier: `context-auditor`, dispatch độc lập, **read-only** (`FILES_TOUCHED: none`). Verifier này **không viết** bất kỳ file nào trong 26 deliverable — đúng guardrail *"verify phải do agent KHÁC agent đã thực thi"*.

**Phạm vi audit**: 26 file deliverable, đối chiếu với `outline.md` (hợp đồng của run), `RULE-001` (contract của lane) và `RQ.md` (nguồn sự thật nội dung).

---

## Verdict tổng thể: **PASS-WITH-WARNINGS**

| Tiêu chí | Kết quả |
|---|---|
| **Completeness** | ✅ PASS — mọi bộ định danh đủ số, frontmatter 26/26, H2 khớp 100% *Tiêu chí xong* |
| **Correctness** | ✅ PASS — **0 trích dẫn `§N` sai** trên toàn bộ **302 câu trích nguyên văn** đã kiểm |
| **Coherence** | ✅ PASS — G4 được tuân thủ ở cả **19 chỗ** M1/M2 xuất hiện; E1/E4/E5/E9 nhất quán |
| **Connectivity** | ✅ PASS — **0 link chết** trên ~570 link, **0 wiki-link**, **0 orphan** |

**1 CRITICAL · 4 WARNING · 5 SUGGESTION.**

---

## 1. CRITICAL — đã xử lý

### C1 — `ADR-010` tái định nghĩa `U-21` / `U-22` / `U-23`, xung đột với TBD Register ở `SDD §8.3`

**Bản chất**: **dead link ngữ nghĩa** — nguy hiểm hơn link chết thông thường vì nó **phân giải im lặng sang nội dung sai** thay vì báo lỗi.

| ID | Nghĩa đúng (SDD §8.3) | Nghĩa sai mà ADR-010 gán |
|---|---|---|
| `U-21` | Exit code CLI và output máy đọc được | *"UUID capture where practical" — practical nghĩa là gì?* |
| `U-22` | Capsule format có chỗ chứa multi-service không | Cơ chế phát hiện *"execution nằm ngoài phạm vi determinism"* |
| `U-23` | Capsule format có language-agnostic không | Replay hai lần có cho cùng kết quả không? |

**Đối chứng của auditor**: `ADR-002` dùng `U-22`/`U-23` **đúng** nghĩa SDD ⇒ va chạm chỉ ở `ADR-010`. Thêm nữa `outline.md` dòng 271 đã quy định mục UUID của `ADR-010` phải mang định danh **`ACG-06`**, và `NFR-Repro.md §7` **đã có sẵn** `ACG-06` với đúng nội dung đó.

**PM phân xử và cách sửa đã chỉ định**:

| Sai | → Đúng | Lý do |
|---|---|---|
| `U-21` | **`ACG-06`** | Là *acceptance-criteria gap*, không phải technical unknown. ID **đã tồn tại** ở NFR §7 — chỉ cần trỏ đúng, không tạo mới |
| `U-22` | **`U-24`** | ID mới. Nội dung hợp lệ và đáng giữ — nó chỉ đang đeo nhầm số |
| `U-23` | **`U-25`** | ID mới. Quan sát có giá trị (`RQ.md` không đặt câu hỏi này; §23 chỉ đo match rate production↔local, chưa bao giờ local↔local) |

Kèm theo: sửa 2 tham chiếu ngược trong cùng file (dòng 57, 109); thêm `U-24`/`U-25` vào TBD Register `SDD §8.3`; cập nhật con số *"23 technical unknown"* → **25**.

> **Xử lý**: **KHÔNG do PM tự vá.** Theo guardrail *"có lỗi CRITICAL → quay lại Bước 5 với worker MỚI, kèm nguyên văn lỗi"*, PM đã dispatch một worker `architect` **mới** với nguyên văn báo cáo của auditor và phương án sửa đã phân xử. Ownership giới hạn đúng 2 file (`ADR-010`, `SDD-Repro.md`).

> **Ghi chú về phân loại**: auditor tự đề nghị *"nếu PM cho rằng phạm vi ảnh hưởng chỉ nội bộ nhãn định danh thì hạ xuống WARNING là hợp lý"*. **PM giữ nguyên CRITICAL.** Lý do: `SDD §8.3` tự khai là *"hợp đồng trung thực của tài liệu"* — nó là nơi bộ tài liệu này khai báo mình **chưa biết gì**. Một register mà hai file cùng dự án đọc ra hai nghĩa khác nhau thì nó thôi làm được đúng cái việc nó sinh ra để làm. Sửa lúc này rẻ; để lại thì mỗi tài liệu dẫn xuất về sau đều nhân bản lỗi.

---

## 2. WARNING — xử lý từng mục

| # | Vấn đề | Quyết định của PM |
|---|---|---|
| **W1** | `Glossary.md` có `status: live`, **không nằm trong enum** của RULE-001 (`draft\|review\|approved\|deprecated`) | **Không sửa trong run này — ghi thành nợ đã biết, cần anh chốt.** Lý do: (a) auditor xác nhận đây là lỗi **có sẵn từ trước** run (`git show HEAD`); (b) **không phải lỗi riêng của Glossary** — `Requirements-MOC.md` và `Resources-MOC.md` cũng đang dùng `status: live`. Sửa mình Glossary sẽ tạo bất nhất trong chính repo. Hai đường đi đều **vượt phạm vi run**: hoặc mở rộng enum trong `RULE-001` (file `status: approved`, run này bị cấm sửa), hoặc quét toàn kho (đó là một run **Shape B** riêng). |
| **W2** | `Glossary.md` thiếu `project: repro` — file duy nhất trong 26 file thiếu trường này | **Cố ý không thêm.** Auditor tự nêu sắc thái giảm nhẹ và PM đồng ý: Glossary **cố ý là file đa dự án** — nó giữ 3 thuật ngữ OTP của một dự án khác. Gán `project: repro` cho cả file là **sai về ngữ nghĩa**. `outline.md` dòng 40 nói *"thêm `project: repro` cho mọi file"* — quy tắc đó đúng cho tài liệu của sản phẩm Repro, không đúng cho một file dùng chung. Đã ghi lý do tại chỗ. |
| **W3** | `SDD §2.7` vẽ **3 zone** dùng chung cách đánh số với threat model có **4 zone**; `Zone 4` (*Hạ tầng ngoài kiểm soát*) bị bỏ | **Sửa — giao cho worker `architect` mới cùng lượt với C1.** Cách sửa: thêm **một ghi chú** nói rõ sơ đồ §2.7 **cố ý** chỉ vẽ zone triển khai, `Zone 4` xem threat model §3.1. **Không** vẽ lại sơ đồ, **không** copy nội dung threat model sang SDD — §7 của SDD cố ý chỉ link, và cách làm đó đã PASS audit. |
| **W4** | `Glossary.md` thiếu headword **`Divergence`** dù `outline.md` dòng 340 liệt kê tường minh; khái niệm dùng **74 lần** trong bộ tài liệu | **PM sửa** — Glossary thuộc quyền PM. Đã bổ sung. |

---

## 3. SUGGESTION — xử lý

| # | Gợi ý | Quyết định |
|---|---|---|
| S1 | `outline.md` dòng 212/223 tự mâu thuẫn về cấp heading của SDD (*"7 H1"* vs khối Cấu trúc dùng `##`). **SDD làm đúng theo khối Cấu trúc** | **PM sửa `outline.md`** — lỗi ở outline, không ở SDD |
| S2 | Chuẩn hoá cách gọi *"43 SEC"* vs không gian ID chạy tới `SEC-048` | **PM sửa `outline.md`** — chép cách diễn đạt minh bạch mà threat model đã dùng: 43 ID được cấp + 5 ID reserve (`SEC-014, 026, 031, 041, 046`) |
| S3 | `Resources-MOC.md:32` trỏ `../000-Index.md` chưa tồn tại | **Tự lành ở close-step** khi PM tạo `000-Index.md`. Đã ghi vào checklist |
| S4 | Bổ sung Glossary hai tên component: `Diff Engine` (SDD §3.10), `Verification Engine` (SDD §3.9) | **PM đã bổ sung** |
| S5 | `SDD-Repro.md` (1537 dòng) và threat model (1273 dòng) đã tiệm cận mức agent hạ nguồn khó nạp trọn | **Ghi nhận, không hành động trong run này.** Cả hai đã có điều hướng nội bộ tốt. Khuyến nghị cho bước sau: khi viết Epic/Story thì trỏ **section cụ thể** (`SDD §3.7`) thay vì trỏ cả file |

---

## 4. Số đếm đã được verify độc lập

Auditor **không tin tuyên bố của writer** — mọi con số dưới đây do auditor tự đếm bằng Read/Grep/Bash.

| Bộ định danh | Cam kết | Thực tế | |
|---|---|---|---|
| `FR-001`…`FR-082` | 82 | **82** unique, không thiếu ID | ✅ |
| `N-01`…`N-19` | 19 | **19** | ✅ |
| `ACG-01`…`ACG-12` | 12 | **12** | ✅ |
| `U-01`…`U-23` (SDD §8.3) | 23 | **23** *(→ 25 sau khi sửa C1)* | ✅ |
| `SEC-001`…`SEC-048` | 43 requirement | **43** cấp + **5** reserve cố ý = 48 ID; phân loại **32** MUST-V0.1 + **8** SHOULD + **3** DEFER | ✅ |
| `THREAT-001`…`THREAT-019` | 19 | **19**; **cả 11** threat `[GAP]` đều có mặt ở `Risk-Register §3` | ✅ |
| `A-01`…`A-13` · `TB-1`…`TB-6` · `AM-1`…`AM-10` | 13 · 6 · 10 | **13 · 6 · 10** | ✅ |
| `R-01`…`R-18` | 18 | **18**, khớp đúng 18 dòng `RQ.md §21` | ✅ |
| Frontmatter 4 trường bắt buộc | 26/26 | **26/26**, `id` khớp **bảng đóng băng** 100% | ✅ |
| Bump `updated: 2026-08-14` | Roadmap + Glossary | **cả 2 đã bump** | ✅ |
| ADR `Decision status: Proposed` | 11 | **11/11**; chuỗi `Accepted` **không xuất hiện** ở bất kỳ ADR nào | ✅ |
| ADR `### Negative` không rỗng | 11 | **11/11** (6–11 dòng mỗi file) | ✅ |
| Exception flow mỗi UC | ≥1 | UC-01: 6 · UC-02: 6 · UC-03: 5 · UC-04: 4 · UC-05: 6 | ✅ vượt yêu cầu |
| Link phân giải được | — | **~570 link, 0 chết**; 0 wiki-link; 0 orphan | ✅ |

---

## 5. Bốn kiểm tra chống ảo giác — kết quả

Đây là phần PM quan tâm nhất, vì nó là failure mode đặc thù của lane tài liệu: **prose sai trôi thẳng vào kho tri thức mà không có compiler nào bắt được**.

| Kiểm tra | Kết quả |
|---|---|
| **302 câu trích nguyên văn** có gắn nguồn, đối chiếu với `RQ.md` | **0 câu sai nội dung.** Mọi lệch chỉ do writer gộp dòng khi trích qua heading/blockquote/bảng |
| **Bốn con số minh hoạ** không bị dùng như KPI | ✅ `2,431/1,827/1,203` — **6/6 chỗ** gắn nhãn *"Example"* · `60–90s` — **7/7 chỗ** ghi rõ là ràng buộc UX cho demo · `Hours/Days→Minutes` — **7/7 chỗ** gắn nhãn outcome hypothesis · `"within minutes"` — **5/5 chỗ** ghi rõ đây là một **câu hỏi** |
| **Bốn ngưỡng §24** không bị dùng làm acceptance criteria | ✅ Xuất hiện ở 11 file, **mọi chỗ** đều kèm nhãn *"initial hypotheses, not final product commitments"*. PRD tách hẳn thành `## 9. Validation Hypotheses`; NFR §1 đặt cảnh báo ngay đầu tài liệu |
| **Hai unknown lõi** không bị viết như đã chốt | ✅ `U-04` — SDD §8.3 ghi `TBD` + *"unknown lớn nhất tài liệu"*; `ADR-006` nói thẳng *"ADR này **cố ý không định nghĩa**"* và *"**không có phương án nào được chọn**"*. `U-02` — SDD §8.3 ghi `TBD` + *"rủi ro hiện thực cao nhất"*. **Không có Decision dứt khoát ở bất kỳ đâu** |
| **Khẳng định không có nguồn** (số liệu, ngày tháng, tên người, demographic bịa) | **0 trường hợp.** Ngược lại, writer **tự khai** chỗ không có nguồn: `UC-05` (*"`RQ.md` **không** nêu yêu cầu này"*), `SDD` (*"Nhánh `C5` **không có trong `RQ.md`**"*), `ADR-010` (*"`RQ.md` **hoàn toàn không đặt câu hỏi này**"*) |

---

## 6. Gate G4 — hai mâu thuẫn được ghi trung thực

Quyết định `G4` tại gate yêu cầu: **ghi cả hai phía kèm section number, đưa phương án đề xuất, gắn nhãn "cần anh chốt", cấm im lặng chọn một phía.**

Auditor kiểm **từng chỗ** M1/M2 xuất hiện — **19 chỗ, không chỗ nào vi phạm**:

- **M1** (regression test V0.1 vs V0.2 → North Star không đo được bằng V0.1): `Charter §3.2` · `Roadmap` (V0.2, kèm cảnh báo ⚠ ngay dòng bảng) · `PRD §8.2` (bảng hai phía + 3 phương án) · `Risk-Register §4 C-01` · `UC-04` · `Persona §2.1` · `SDD §8.3` · `ADR-011` · `Glossary` (mục North Star Metric).
- **M2** (§28 commercial layer vs §20.5/§21 MVP=Yes): `Threat-Model §10` (trích kèm **số dòng `RQ.md`**, tự nói *"cố ý không kết luận một phía"*) · `Risk-Register §4 C-02` · `PRD` · `NFR §5` · `SDD §6.6` · `ADR-009` · `ADR-002` · `UC-01` · `UC-05` · `Persona`.

`Risk-Register §4.1` còn tự giải thích **vì sao** C-01/C-02 được đối xử khác C-03/C-04/C-05 (hai cái đầu đổi *định nghĩa thành công* / *mô hình kinh doanh* ⇒ vượt thẩm quyền PM). Auditor đánh giá đây là *"xử lý G4 mẫu mực"*.

---

## 7. Bốn quyết định tầng 2 — nhất quán toàn bộ

| Quyết định | Kết quả kiểm |
|---|---|
| **E1** — Redis ngoài V0.1 capture | Kiểm **44 chỗ** nhắc Redis trên 15 file: **không file nào** nói Redis thuộc V0.1. `SDD` còn ghi *"Ripple bắt buộc: `RQ.md §17` cần được sửa"* |
| **E5** — chỉ failed execution · không manual recording · boundary = service boundary | Nhất quán ở `PRD` (`FR-012`, `NG-12`), `UC-01`, `SDD`, `ADR-008`. `ADR-008` còn nêu hệ quả tiêu cực (*"không có đường thoát"*) |
| **E9** — thiếu input ⇒ divergence + incomplete capture, **không** fallback | Nhất quán tuyệt đối: `UC-02 A5`, `UC-03`, `SDD §3.7` (*"TUYỆT ĐỐI KHÔNG"*), `ADR-003/004/005/008/011` |
| **E4** — `N-03` có ngưỡng, `N-09` (P95) là `TBD` | `NFR` ghi `TBD` + *"**Không bịa số P95**"*. Kiểm **20 chỗ** nhắc P95: **không có con số P95 bịa nào** |

---

## 8. Quan sát của auditor đáng đưa vào memory

> Lỗi duy nhất tìm được (**C1**) đến từ **cùng một writer** (`architect`) viết hai file ở hai thời điểm mà **không đối chiếu ngược lại register của chính mình**. Đó là failure mode **dự báo được** của việc soạn song song.

**PM ghi nhận và rút thành quy tắc cho run sau**: khi một writer sở hữu nhiều file mà trong đó có **một file giữ register định danh dùng chung** (kiểu `SDD §8.3`), phải thêm một bước **reconcile định danh nội bộ** trước khi bàn giao — hoặc giao register cho PM giữ như giao MOC.

---

## 9. Trạng thái đóng run

| Việc | Trạng thái |
|---|---|
| C1 — sửa `ADR-010` + `SDD §8.3` | ✅ **Đã đóng** — worker `architect` **mới**, ownership giới hạn 2 file |
| W3 — ghi chú Zone 4 ở `SDD §2.7` | ✅ **Đã đóng** — cùng lượt dispatch trên |
| W4 + S4 — bổ sung Glossary | ✅ PM đã làm |
| W1 — `status: live` ngoài enum | 📌 Nợ đã biết, **cần anh chốt** (xem mục 2) |
| W2 — `project: repro` ở Glossary | ✅ Cố ý không thêm, đã ghi lý do |
| S1 + S2 — sửa `outline.md` | ✅ PM đã làm |
| Close-step — `000-Index.md` + 5 MOC | ✅ **Đã đóng** |

### 9.1 Verify lần cuối sau khi sửa — PM tự chạy, không tin báo cáo của worker

| Kiểm | Lệnh | Kết quả |
|---|---|---|
| `ADR-010` còn dùng `U-21`/`U-22`/`U-23` sai nghĩa? | `grep -cE '`U-2[123]`' ADR-010` | **0** ✅ |
| `ACG-06` đã được trỏ đúng trong `ADR-010`? | `grep -c 'ACG-06' ADR-010` | **4** ✅ |
| `U-24` / `U-25` đã có trong TBD Register? | `grep -cE '^\| .*`U-2[45]`' SDD-Repro.md` | **2** ✅ |
| Con số unknown đã nhất quán? | `grep -o "[0-9]* technical unknown" SDD-Repro.md` | **"25 technical unknown"**, không còn "23" ✅ |
| Ghi chú Zone 4 đã có ở SDD? | `grep -c 'Zone 4' SDD-Repro.md` | **1** ✅ |
| Link chết trong 26 deliverable + 6 file close-step | quét toàn bộ relative link | **0** ✅ |

### 9.2 Nợ có sẵn từ trước run — KHÔNG sửa, ghi lại để anh quyết

Lần quét cuối phát hiện **8 link chết** và **1 file thiếu frontmatter**. **Không mục nào do run này gây ra**, và **không mục nào nằm trong 5 MOC đã duyệt tại gate**:

| File | Vấn đề |
|---|---|
| `docs/035-QA/QA-MOC.md` | Trỏ `./Test-Cases/`, `./Automation/` — thư mục chưa tồn tại |
| `docs/070-Deployment/Deployment-MOC.md` | Trỏ `./Releases/`, `./Runbooks/`, `./CHANGELOG.md` — chưa tồn tại |
| `docs/080-Operations/Operations-MOC.md` | Trỏ `./Incidents/`, `./SLAs/` — chưa tồn tại |
| `docs/999-Resources/Resources-MOC.md` | Trỏ `./Meeting-Notes/` — chưa tồn tại |
| `docs/040-Design/Design-MOC.md` | **Thiếu hoàn toàn frontmatter** (vi phạm RULE-001) |

**Vì sao PM không tự sửa**: gate đã duyệt phạm vi close-step là **đúng 5 MOC** (`Planning`, `Requirements`, `Specs`, `Research`, `Stories`) cộng `000-Index.md` và `Glossary.md`. Bốn MOC trên **không** nằm trong đó. Sửa thêm là **mở rộng scope ngầm giữa chừng** — đúng thứ guardrail *"không sửa nửa vời, cắt scope tại gate chứ không cắt ngầm"* sinh ra để chặn. Chúng thuộc về một run **Shape B** (normalization sweep) riêng, cùng với W1 (`status: live` ngoài enum, hiện có ở 2 MOC).

**Khuyến nghị của PM**: chạy một run `/pm-doc` Shape B nhỏ để dọn gọn nhóm này — phạm vi rõ ràng, rủi ro thấp, và nó sẽ đóng luôn W1.

---

## 10. Vòng 2 — thi hành hai quyết định của anh (2026-08-14)

Sau khi run đóng ở mục 9, anh chốt **M1** và **M2** — hai hạng mục `G4` vốn được ghi trung thực hai phía và chờ quyết định. Chi tiết quyết định ở `escalations.md` **E-05**.

### 10.1 Phạm vi thi hành

**16 file** được cập nhật, phân theo đúng ownership map cũ của run:

| Người thực hiện | File |
|---|---|
| **PM** | `Charter-Repro.md` · `Roadmap.md` · `Risk-Register.md` · `Glossary.md` |
| `business-analyst` | `PRD-Repro.md` · `NFR-Repro.md` · `UC-01` · `UC-04` · `UC-05` · `Analysis-Target-Users.md` |
| `architect` (2 lượt) | `SDD-Repro.md` · `ADR-002` · `ADR-009` · `ADR-011` · **`ADR-004`** · **`ADR-006`** |
| `security-auditor` | `Spec-Security-Repro-Threat-Model.md` |

**Nguyên tắc thi hành áp cho mọi worker**: **giữ nguyên 100% phần trích dẫn hai phía kèm section number**, chỉ thay nhãn `cần anh chốt` → `✅ ĐÃ CHỐT 2026-08-14` và bổ sung quyết định / lý do / hệ quả. Lý do: `RQ.md` **vẫn tự nói ngược** ở chính những chỗ đó — quyết định của anh không xoá mâu thuẫn trong tài liệu gốc, nó chỉ ghi lại ta chọn phía nào. Xoá bằng chứng thì người đọc `RQ.md` về sau sẽ tưởng tài liệu dẫn xuất sai.

### 10.2 Một lỗi quy trình đã xảy ra và đã được bắt

PM lập sót `ADR-004` và `ADR-006` ở lượt dispatch đầu — dùng bản kê của auditor (kê *chỗ có sức nặng*) thay vì của writer gốc (kê *mọi chỗ đã ghi*). **Verify vòng 2 do PM tự chạy bắt được**, đã dispatch lượt bổ sung. Ghi đầy đủ ở `escalations.md` **E-06**, kèm bài học: danh sách file để thi hành một quyết định phải lấy từ `grep` toàn kho.

### 10.3 Verify vòng 2 — PM tự chạy sau khi mọi worker báo xong

| Kiểm | Kết quả |
|---|---|
| Nhãn `cần anh chốt` còn gắn với M1/M2 | **0** ✅ *(2 kết quả grep còn lại là dòng legend định nghĩa nhãn, và một open item hợp lệ của `N-05` — "cần anh chốt sau spike §22")* |
| Số file mang nhãn `✅ ĐÃ CHỐT 2026-08-14` | **14** ✅ |
| Link chết trong file của run | **0** ✅ |
| ADR giữ `Decision status: Proposed` | **11/11**; `Accepted`: **0** ✅ *(anh chốt phạm vi sản phẩm, không duyệt quyết định kiến trúc)* |
| `updated: 2026-08-14` đã bump | **16/16** ✅ |
| Bộ số requirement bảo mật | **32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43** — **không đổi**, vì `SEC-018/019/020/021` vốn đã là MUST-V0.1, D2 chỉ gỡ điều kiện treo ✅ |
| TBD Register | vẫn **25** mục (`U-01`…`U-25`) ✅ |

### 10.4 Những gì **không** bị chốt hộ

Worker được dặn tường minh và đã tuân thủ — kiểm lại xác nhận cả 6 mục vẫn nguyên trạng:

`U-04` / `ACG-01` (*sufficiently equivalent*) · `U-02` (query identity) · `ACG-07` (*Supported Execution Class*) · `U-06` (API + cơ chế auth của Capsule Store) · `U-10` (diff mode có gọi dependency thật) · `N-09` (P95) · **crypto-shredding** (`SEC-016` giữ `DEFER`, kèm câu chặn hiểu nhầm ở 3 chỗ: *"Quyết định D2 KHÔNG chạm tới mục này"*).

### 10.5 `THREAT-008` — cách phân loại sau D2

`security-auditor` được giao tự quyết cách phân loại và chọn: **giữ `THREAT-008` trong nhóm 11 threat `[GAP]`**, vì cột đó trả lời đúng câu *"`RQ.md` có mitigation không?"* — và nguyên văn `§28` **không hề thay đổi**. Đổi 11 → 10 sẽ làm con số nói sai điều nó đo.

Thay vào đó, worker bổ sung một **con số dẫn xuất**: *"không có mitigation từ bất kỳ nguồn nào (sau D2) = **10**"*. PM đã đồng bộ `Risk-Register §3` theo đúng lựa chọn này, kèm callout phân biệt hai con số để về sau không ai trích nhầm:

- **11** = tài liệu gốc thiếu bao nhiêu.
- **10** = còn bao nhiêu threat thực sự hở.

`THREAT-008` residual risk: **Critical → Medium**, với ba lý do rời nhau (D2 là quyết định *phạm vi* chứ không phải control đang chạy · `GAP-04` còn nguyên · key custody và audit storage vẫn do tổ chức tự vận hành).

### 10.6 Bốn rủi ro **mới** phát sinh từ chính hai quyết định — đã ghi vào Risk Register §4.1

Quyết định nào cũng có mặt trái. Bộ tài liệu ghi thẳng thay vì chỉ ghi phần tích cực:

| ID | Rủi ro | Nguồn gốc |
|---|---|---|
| **C-01-r** | **Chỉ số thành công của V0.1 chưa có tiêu chí pass/fail** — `N-05` được §23 yêu cầu đo nhưng §24 không đặt ngưỡng | D1 |
| **C-01-r2** | **`U-04` nay chặn cả khả năng ĐẾM chỉ số thành công** — không định nghĩa được equivalence thì không đếm được "Execution matched" | D1 |
| **C-02-r** | **`GAP-04` nặng thêm** — authz/audit nay chắc chắn phải có, mà §18 vẫn không có CLI verb nào để vận hành chúng | D2 |
| **C-02-r2** | **`R-08` Developer adoption xấu đi** — đưa authn/authz/audit vào OSS core làm tăng phạm vi V0.1, va vào §20.14 (*significant infrastructure*) và §20.15 (*Artifact storage* là scope explosion) | D2 |

### 10.7 Trạng thái cuối

**Run đóng.** Không còn hạng mục nào chờ quyết định. Ba nợ đã ghi ở mục 9.2 (8 link chết + 1 file thiếu frontmatter ở 4 MOC ngoài phạm vi, và W1) vẫn giữ nguyên — chúng thuộc một run Shape B riêng.
