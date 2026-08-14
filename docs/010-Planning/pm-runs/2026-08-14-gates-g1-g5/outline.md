# Doc Plan: 2026-08-14-gates-g1-g5

> **File này do PM độc quyền chỉnh sửa.** Writer báo xong trong `SUMMARY` + `FILES_TOUCHED`, PM đối chiếu rồi tick.
> **Bản chất run**: Shape B — **lan** năm quyết định đã chốt vào 32 file đã tồn tại. **Không tạo file mới.** Phát sinh nhu cầu tạo file → báo `BLOCKED`.
> **Nguồn sự thật cho quyết định**: `run-plan.md §Gate` + `escalations.md` **E-01**/**E-02** của chính run này. **Nguồn sự thật cho nội dung nền**: `docs/999-Resources/RQ.md`. Không có căn cứ ở một trong hai → ghi `TBD` + báo `PARTIAL`. **Không bịa.**

---

## 0. NĂM QUYẾT ĐỊNH — trích nguyên văn vào MỌI prompt dispatch

| ID | Quyết định của anh (2026-08-14) |
|---|---|
| **`GATE-01`** | **Go** — bật **Phase 0 technical spike**, coi là **điều kiện đầu tư** chứ không phải task. `Sponsor` = **`@TrisJr`** · `Manager` = **`@TrisJr`** · Owner của **18/18 risk** = **`@TrisJr`** |
| **`GATE-02`** | **Spike trước, Epic/Story sau** — hoãn phân rã Epic/Story tới **sau khi Phase 0 đóng gate**. Lý do: acceptance criteria dựa trên *"execution matched"* chưa kiểm chứng được |
| **`GATE-03`** | **Duyệt toàn bộ 11 ADR** — `Decision status: Proposed` → **`Accepted`**. Người duyệt **`@TrisJr`**, ngày **2026-08-14** |
| **`GATE-04`** | **Chốt sàn tối thiểu của Capsule Store** = **object/file storage + một index + authn/authz/audit hook**, với 3 thao tác tối thiểu theo `SDD §5.4`. **Phần sàn ĐÓNG**; **cơ chế** authn/authz cụ thể **vẫn `TBD`** |
| **`GATE-05a`** | **TTL mặc định của capsule = 30 ngày** (`SEC-022`). Vẫn cấu hình được (`FR-024`); 30 ngày là **mặc định khi không cấu hình**. Đóng `U-06b` |
| **`GATE-05b`** | **`SEC-016` crypto-shredding = ÁP DỤNG, phân loại `MUST-V0.1`**. Khoá giữ phía server; xoá khoá ⇒ capsule không giải được. Đóng `U-06c` |

### Mapping tên gọi — mỗi neo chính phải có một dòng này để tra được hai chiều

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.
> **Trong tài liệu chỉ dùng `GATE-0N`.** `G1`/`G2`/`G3` đã bị `PRD-Repro.md §Goals` chiếm — dùng lại sẽ tạo dead link ngữ nghĩa.

---

## 1. TÁM RÀNG BUỘC áp cho MỌI writer

1. **Nhãn**: `✅ CHỐT GATE-01 — 2026-08-14` (thay số theo gate). **TUYỆT ĐỐI KHÔNG** dùng lại chuỗi `ĐÃ CHỐT 2026-08-14` — chuỗi đó thuộc M1/M2 của run trước và đang là tiêu chí `grep` truy vết của nó.
2. **Giữ nguyên 100% bằng chứng hai phía.** Chỉ **thêm** quyết định / lý do / hệ quả và **đổi nhãn trạng thái**. Không xoá trích dẫn kèm section number. Không sửa `RQ.md`.
3. **Không bịa.** Tên duy nhất được phép ghi là **`@TrisJr`**. Con số duy nhất được phép ghi cho TTL là **30 ngày**. Ngoài hai thứ đó, không có nguồn thì ghi `TBD` **kèm điều kiện + owner** và báo `PARTIAL`.
4. **Frontmatter**: bump `updated: 2026-08-14`. ⚠ **9 file phải THÊM trường vì hiện KHÔNG CÓ**: `ADR-001`, `ADR-003`, `ADR-005`, `ADR-007`, `ADR-008`, `ADR-010`, **`UC-02`**, **`UC-03`**, **`BRD-001`**.
   > **Đính chính sau Bước 5** *(2026-08-14)*: bản đầu ghi *"6 file"*, lấy từ inventory Bước 2 — inventory chỉ kiểm trường `updated:` ở **nhóm ADR** (nơi được hỏi đích danh), không quét toàn kho. `business-analyst` tìm thêm 3 file và đã bù. `context-auditor` ở Bước 6 đối chiếu `git show HEAD:<file>` cho từng file: đúng **9 file và chỉ 9 file** thiếu trường, cả 9 nay đã có. Ghi lại vì đây là **giới hạn có tính hệ thống của inventory**: *auditor chỉ kiểm ở nơi câu hỏi trỏ tới* — xem `escalations.md` E-05.
5. **Link**: standard markdown link + relative path — `[Tên](./path.md)`. **KHÔNG wiki-link `[[...]]`** (RULE-001 MUST-rule #5).
6. **Không chạm** `*-MOC.md`, `000-Index.md`, `Glossary.md`, và file ngoài ownership của mình.
7. **Bộ số bảo mật ĐỔI**: `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` → **`33 / 8 / 2 = 43`**. Ai trích con số này đều phải sửa.
8. **`GATE-03` không đóng `Open items`.** Mọi ADR chuyển `Accepted` **bắt buộc** mang callout: *"`Accepted` xác nhận **hướng quyết định**, KHÔNG đóng mục `Open items`. Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại `Risk-Register §4.2`."*

---

## 2. Bảng hạng mục — 32 file

| # | File | Loại (RULE-001) | Gate chạm | Writer | Xong |
|---|---|---|---|---|---|
| 1 | `docs/010-Planning/Charter-Repro.md` | charter | 01·02·03·05 | **PM** | [x] |
| 2 | `docs/010-Planning/Roadmap.md` | roadmap | 01·02 | **PM** | [x] |
| 3 | `docs/010-Planning/Risk-Register.md` | risk-register | 01·04·05 | **PM** | [x] |
| 4 | `docs/010-Planning/Planning-MOC.md` | moc | 01 | **PM** | [x] |
| 5 | `docs/000-Index.md` | index | 01·02·03·04 | **PM** | [x] |
| 6 | `docs/999-Resources/Glossary.md` | glossary | 01·04·05 | **PM** | [x] |
| 7 | `docs/022-User-Stories/Stories-MOC.md` | moc | 01·02·04 | **PM** | [x] |
| 8 | `docs/030-Specs/Specs-MOC.md` | moc | 03·04·05 | **PM** | [x] |
| 9 | `docs/035-QA/QA-MOC.md` | moc | 01·02 | **PM** | [x] |
| 10 | `docs/080-Operations/Operations-MOC.md` | moc | 04·05 | **PM** | [x] |
| 11 | `docs/020-Requirements/Requirements-MOC.md` | moc | 02·03 | **PM** | [x] |
| 12 | `docs/020-Requirements/PRD-Repro.md` | prd | 01·04·05 | `business-analyst` | [x] |
| 13 | `docs/020-Requirements/NFR-Repro.md` | nfr | 01·02·04·05 | `business-analyst` | [x] |
| 14 | `docs/020-Requirements/BRD/BRD-001-Problem-Statement.md` | brd | 01 | `business-analyst` | [x] |
| 15 | `docs/020-Requirements/Use-Cases/UC-01-Capture-Failed-Production-Execution.md` | use-case | 04·05 | `business-analyst` | [x] |
| 16 | `docs/020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md` | use-case | 01·04 | `business-analyst` | [x] |
| 17 | `docs/020-Requirements/Use-Cases/UC-03-Read-Execution-Diff.md` | use-case | 01 | `business-analyst` | [x] |
| 18 | `docs/020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md` | use-case | 04·05 | `business-analyst` | [x] |
| 19 | `docs/050-Research/Analysis-Target-Users.md` | research | 01·04·05 | `business-analyst` | [x] |
| 20 | `docs/030-Specs/Architecture/SDD-Repro.md` | sdd | **01·02·03·04·05** | `architect` **A** | [x] |
| 21 | `docs/030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md` | adr | 01·03·05 | `architect` **A** | [x] |
| 22 | `docs/030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md` | adr | 01·03·04·05 | `architect` **A** | [x] |
| 23 | `docs/030-Specs/Architecture/ADR-001-Replay-Execution-Not-Environment.md` | adr | 01·03 | `architect` **B** | [x] |
| 24 | `…/ADR-003-Database-Record-Replay-Not-Snapshot.md` | adr | 01·03 | `architect` **B** | [x] |
| 25 | `…/ADR-004-Record-Replay-External-Inputs-At-Boundary.md` | adr | **03** | `architect` **B** | [x] |
| 26 | `…/ADR-005-Default-Deny-Write-Side-Effects.md` | adr | 01·03 | `architect` **B** | [x] |
| 27 | `…/ADR-006-Execution-Verification-By-Equivalence.md` | adr | 01·03 | `architect` **B** | [x] |
| 28 | `…/ADR-007-In-Process-SDK-Interception.md` | adr | 01·03 | `architect` **B** | [x] |
| 29 | `…/ADR-008-Async-Bounded-Failure-Triggered-Capture.md` | adr | 01·03 | `architect` **B** | [x] |
| 30 | `…/ADR-010-Bounded-Determinism-Scope.md` | adr | 01·03 | `architect` **B** | [x] |
| 31 | `…/ADR-011-Execution-Diff-First-Class.md` | adr | **03** | `architect` **B** | [x] |
| 32 | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | security-spec | 01·04·05 | `security-auditor` | [x] |

---

## 3. Outline — `business-analyst` (8 file)

- **Độc giả đích**: BA/PO sẽ phân rã story sau Phase 0; QA đọc để biết cái gì đã có tiêu chí.
- **Nguồn sự thật**: mục 0 của file này (quyết định) + `RQ.md` (nội dung nền).
- **Tiêu chí xong chung**: sau khi sửa, `grep "cần anh chốt"` trong 8 file **không còn trả về mục nào thuộc `GATE-04`/`GATE-05`**; mọi chỗ trích `32/8/3` hoặc `43` đã đổi.

| File | Vùng | Việc phải làm | Tiêu chí xong |
|---|---|---|---|
| `PRD-Repro.md` | `§10.5 U-06` (**637**, 643) | **Neo chính `GATE-04`.** Ghi sàn đã chốt + nhãn. Câu 643 (*"nếu chấp nhận capsule là file chuyển tay thì MVP nhỏ hơn đáng kể"*) **giữ nguyên làm bằng chứng**, thêm một dòng nói phương án đó đã bị loại vì `D2` | `U-06` không còn được mô tả là *"khoảng trống ước lượng"* |
| | `§5.2 Capsule` (291, 295) `FR-024` | Ghi **TTL mặc định 30 ngày** vào `FR-024`; nêu rõ *cấu hình được, 30 ngày là mặc định* | `FR-024` mang con số |
| | `§10.4 M2` (**606–612**), 618 | Cập nhật: `GAP-04` **vẫn nguyên** sau `GATE-04` — trỏ `GATE-04-r` | Không nói `GAP-04` đã đóng |
| | `§8.4` (509–513), `§9` | `GATE-01 = Go`: đổi từ *khuyến nghị §39* sang *quyết định đã ghi*. Thêm `GATE-01-r`: **Go không tự làm spike đo được** — `ACG-01`/`02`/`03`/`07` vẫn hở | `§9` vẫn giữ 4 ngưỡng §24 là **hypothesis**, không thành acceptance criteria |
| `NFR-Repro.md` | `§5.4` (240, 246–266) + heading `⏳ Crypto-shredding — CHƯA chốt` (**262**) | **Neo NFR của `GATE-05b`.** Heading 262 **phải đổi** thành đã chốt `MUST-V0.1`. Ghi đánh đổi: mất *"replay không cần mạng"* (`GATE-05b-r`) | `grep "CHƯA chốt"` = 0 trong file này |
| | 211, 240, 252 | Ba dòng mang **trạng thái hỗn hợp** (M2 chốt + crypto-shred chưa) — phải đổi phần crypto-shred, **giữ nguyên** phần M2 | Không xoá nhãn M1/M2 nào |
| | 260 | `GAP-04` sau `GATE-04`: sàn đóng, verb vận hành **vẫn thiếu** | Trỏ `GATE-04-r` |
| | `§3.1` open item `N-05` | **KHÔNG chốt `N-05`.** Nó vẫn *"cần anh chốt sau spike §22"* — `GATE-01` không đặt ngưỡng | `N-05` vẫn `TBD` |
| | 31 | `GATE-02`: nhắc lại ràng buộc *không dùng `N-01`…`N-04` làm AC của story* — nay là guardrail chính thức khi phân rã mở | — |
| | `§1`, `§2`, `§3` | `GATE-01 = Go` — đổi diễn đạt từ khuyến nghị sang quyết định | — |
| `BRD-001-Problem-Statement.md` | Open Questions (395, 400) | Q7: `GATE-01 = Go` ⇒ spike **đã được bật**; Q7 vẫn chưa trả lời nhưng lý do đổi từ *"chưa quyết chạy spike"* sang *"chờ kết quả spike"* | — |
| `UC-01` | 223, 225 (`GATE-04`) | Bỏ `⚠ TBD — RQ.md hoàn toàn không đặc tả Capsule Store`, thay bằng sàn đã chốt + ghi rõ **cơ chế auth vẫn `TBD`** | — |
| | `S5` (241), 267–286 (`GATE-05`) | `S5` retention policy: ghi **30 ngày mặc định**; thêm hệ quả crypto-shred lên capsule đã capture | — |
| `UC-02` | 202, 272 (`I5`) | `GATE-01 = Go`. ⚠ **`GATE-05b` phá `I5`**: *"capsule replay được ở môi trường khác"* nay **cần khoá từ server** ⇒ `I5` phải ghi điều kiện mới | `I5` không còn khẳng định replay hoàn toàn offline |
| | 319, 326 | Citation `U-06` — cập nhật cho khớp | — |
| `UC-03` | 246 | `FR-041` vẫn không spec được vì `ACG-01` — **không đổi bản chất**, chỉ nói rõ `GATE-01` không giải `ACG-01` | `ACG-01` vẫn hở |
| `UC-05` | `A2` (**164–177**) | **Trả lời trực tiếp 2 câu hỏi đang treo**: (a) *"retention mặc định bao nhiêu?"* → **30 ngày**; (b) *"capsule đã pull về máy local có bị retention chi phối không?"* → **có, qua crypto-shred `GATE-05b`** | Hai câu hỏi không còn ở dạng câu hỏi |
| | 41, 45, 158 (`GATE-04`) | Sàn đã chốt; nhưng 158 (*"§18 không có một CLI verb nào"*) **giữ nguyên** — `GAP-04` chưa đóng | — |
| `Analysis-Target-Users.md` | `§4.1 GAP-04` (**181–218**), 198, 202, 218 | 218 (*"Trạng thái: `TBD` — cần bổ sung verb vận hành"*): sàn đã chốt nhưng **verb vẫn thiếu** ⇒ trạng thái đổi thành `TBD (đã thu hẹp)` + trỏ `GATE-04-r`. Retention nay có giá trị 30 ngày | Không nói `GAP-04` đã đóng |
| | 285 | Q7 bị chặn bởi spike — spike nay **đã bật** | — |

---

## 4. Outline — `architect` lượt A (3 file, có ràng buộc chéo)

- **Vì sao gom ba file này một writer**: `SDD §8.3` giữ register `U-06`; `ADR-009` giữ `U-06b`/`U-06c`/`U-06d`; `ADR-002` giữ ràng buộc *"chốt `SEC-016` trước khi capsule format v1 đóng băng"*. Ba thứ **phải khớp nhau**. `verdict.md §8` của run trước: lỗi CRITICAL duy nhất đến từ writer sở hữu nhiều file mà **không reconcile register của chính mình**. → **Bắt buộc có bước reconcile trước khi bàn giao.**

> **Đính chính một tiêu chí reconcile của PM** *(sau Bước 5, 2026-08-14)*: prompt dispatch cho lượt A đòi `Decision status: Accepted` **"3/3 file"** — **sai, lỗi ở PM**. `SDD-Repro.md` là `type: sdd` và **không có** trường `Decision status`; thêm trường đó vào là vi phạm RULE-001. Con số đúng: **2/2 ADR** (`ADR-002`, `ADR-009`) **+ một tuyên bố 11/11 `Accepted` ở `SDD §1.6`**. Writer từ chối tự thêm trường sai loại — **đúng**. Xem `escalations.md` E-06.
- **Tiêu chí xong chung**: `U-06` / `U-06b` / `U-06c` / `U-06d` nói **cùng một điều** ở cả ba file.

| File | Vùng | Việc phải làm |
|---|---|---|
| `SDD-Repro.md` | `§3.6 Capsule Store` (**492–519**), đặc biệt **502**, **506** | **Neo kiến trúc `GATE-04`.** Nâng 502 từ *"quyết ở mức tối thiểu, cố ý đặc tả ít nhất có thể"* thành **quyết định chính thức**; 506 là dòng định nghĩa sàn — ghi rõ **object/file storage + một index + authn/authz/audit hook** |
| | `§5.4 Capsule Store API` (**1052–1068**) | 1058: 3 thao tác tối thiểu nay là **sàn đã chốt**. 1063 (*"cơ chế authn/authz vẫn `TBD`"*) **giữ nguyên `TBD`** — `GATE-04` chốt *cái gì*, không chốt *cách nào* |
| | `§8.3 TBD Register` (**1501**, dòng `U-06` tại **1516**) | `U-06` → **`CHỐT (phần sàn)` + `TBD` (cơ chế auth)**. **KHÔNG xoá dòng, KHÔNG giảm 25 → 23** (lý do: `escalations.md` E-02) |
| | `§4.9 Encryption at rest` (**903**, `E12` tại **911**) và `§7.4` (**1362**, `E12` tại **1389**) | **Neo `GATE-05b`.** Cả **hai** chỗ đổi `E12` từ *"ràng buộc được đề xuất, cần validate"* → **đã chốt `MUST-V0.1`**. Hai chỗ phải **cùng** đổi |
| | **1145** | ⚠ **Câu này phải đổi**: *"Nếu `E12` được chấp nhận, dòng 'không cần kết nối mạng lúc replay' không còn đúng"* → `E12` **đã** được chấp nhận ⇒ viết ở thể khẳng định + trỏ `GATE-05b-r` |
| | `§7.4` (**1372**, 1373, 1385) | TTL: *"giá trị `TBD` — cần PM và pháp chế"* → **30 ngày**, disposition `TBD` → `CHỐT` |
| | `§1.1` (32–43), `§8.2` (**1454–1499**) | `GATE-01 = Go`. `§8.2` là kế hoạch spike — thêm `GATE-01-r`: kế hoạch này **chưa cho điểm được** (thiếu denominator, thiếu định nghĩa *reproduced*, thiếu tiêu chí chọn test case, thiếu *Supported Execution Class*); và thêm `U-25` (replay 2 lần cùng capsule) làm **kiểm tra bắt buộc** |
| | `§1.6 Decision index` (**126**, dòng **130**) | ⚠ **`GATE-03`**: *"Mọi ADR ở trạng thái **Proposed** — chưa có ai duyệt thật"* → **11/11 `Accepted`, duyệt bởi `@TrisJr` ngày 2026-08-14**, kèm callout ràng buộc #8 |
| | 1208, 1572 | `GATE-02`: cụm *"spike trước, platform sau"* nay là **quyết định**, không còn là *lý do chọn phía §26* |
| | `§6.6` (1218), 1278–1280 | 1280 (*"Hai mục §28 chưa được quyết định này phán xử: `Retention policies` và `Enterprise security`"*) → **`Retention policies` nay ĐÃ được `GATE-05` phán xử**; `Enterprise security` vẫn chưa |
| `ADR-002` | dòng **12** | `Decision status: Proposed` → `Accepted` + người duyệt + ngày + callout #8 |
| | `E12` tại **95**, **112** | Đổi từ *"ràng buộc được đề xuất"* → **đã chốt**. ⚠ **Đây là chỗ `GATE-05b` va vào chính ADR-002**: capsule không còn self-contained tuyệt đối ⇒ ghi vào `## Consequences` như `GATE-05b-r`, **hệ quả được chấp nhận có ý thức** |
| | frontmatter (7) | bump `updated` |
| `ADR-009` | dòng **12** | `Proposed` → `Accepted` + callout #8 |
| | `### D3` (**79–89**) | **Neo `GATE-04`.** 81 *"đặc tả ở mức nhỏ nhất còn thoả §8 và §18"* → sàn đã chốt tường minh. 89 (*"API và cơ chế auth vẫn `TBD`"*) **giữ `TBD` cho cơ chế**, đóng phần sàn |
| | `## Alternatives` (**146–151**) | Ghi rõ **C3** (store đầy đủ) và **C4** (file chuyển tay) và **C6** (BYO-bucket không index) đều **bị loại**, kèm lý do từng cái |
| | `### D5` (**95–105**) | **Neo ADR của `GATE-05b`.** Heading *"crypto-shredding: ràng buộc ĐỀ XUẤT, chưa chốt"* → **đã chốt `MUST-V0.1`**. Dòng **105** đang là câu chặn *"M2 KHÔNG chạm tới D5"* → nay **`GATE-05b` CÓ chạm**, phải viết lại |
| | `## Consequences` (**136**), 163–180 | 136 (*"Không thuộc phạm vi quyết định này: `Retention policies` và `Enterprise security`"*) → `Retention` nay thuộc `GATE-05`. 171 (*"`U-06` chưa giải ⇒ ước lượng MVP chưa đứng được"*) → đã giải phần sàn |
| | `## Open items` (**189–194**) | `U-06` thu hẹp · `U-06b` **đóng** (TTL = 30 ngày) · `U-06c` **đóng** (crypto-shred áp dụng) · ⚠ **`U-06d` (key custody) NÂNG THÀNH BLOCKER** — trỏ `GATE-05b-r2`. `U-06e` giữ nguyên |

---

## 5. Outline — `architect` lượt B (9 ADR)

- **Việc chính**: `GATE-03` (đổi `Decision status`) + `GATE-01` (cập nhật vùng trích mốc spike). Không có ràng buộc chéo giữa 9 file.
- **Tiêu chí xong**: 9/9 file có `Decision status: Accepted` + người duyệt + ngày + callout #8; 6 file thiếu `updated:` đã **được thêm trường**.

| File | Dòng `Decision status` | `updated:` | Vùng `GATE-01` cần rà |
|---|---|---|---|
| `ADR-001` | **11** | ❌ **THÊM** | `Consequences` 64, 65 · `Open items` 91, **94** (*"chỉ giải được bằng technical spike §22 + §39"*) |
| `ADR-003` | **11** | ❌ **THÊM** | `Open items` **91** (`U-02` query matching identity — vẫn `TBD`) |
| `ADR-004` | **12** | ✅ bump | ⚠ **Chỉ `GATE-03`.** File này bị **sót ở E-06 run trước** — kiểm riêng ở verify |
| `ADR-005` | **11** | ❌ **THÊM** | `Open items` 102, **106** (§22 kịch bản #8 *Side effect*) |
| `ADR-006` | **12** | ✅ bump | `Open items` **85**, **88** — `U-04` là **TBD LÕI**, `N-05` chưa có pass/fail. ⚠ **Callout #8 đặc biệt quan trọng ở file này**: `Accepted` mà `U-04` chưa giải là đúng loại rủi ro `GATE-03-r` nói tới |
| `ADR-007` | **11** | ❌ **THÊM** | `Open items` **93** (`U-01` cơ chế chặn driver `pg`) |
| `ADR-008` | **11** | ❌ **THÊM** | `Context` 32 · `Consequences` 90 · `Open items` 98–100 (`U-09`, `U-09b`, `U-09c`). Giữ nguyên *"`<5%` là initial hypothesis, không dùng làm cổng nghiệm thu"* |
| `ADR-010` | **11** | ❌ **THÊM** | `Context` 46 · `Consequences` **98** (§33.7 *Narrow before broad* + §39) · `Open items` 117, 120 |
| `ADR-011` | **12** | ✅ bump | ⚠ **Chỉ `GATE-03`.** Cẩn thận: file này dùng `D3`…`D6` làm **Decision sub-ID nội bộ** — **không** nhầm với `GATE-0N` |

---

## 6. Outline — `security-auditor` (1 file)

- **File**: `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` (1336 dòng)
- **Đây là file mang neo chính của `GATE-05`.** Cũng là file có **con số phải đổi**.
- **Tiêu chí xong**: `grep "DEFER"` cho `SEC-016` = 0; bộ số đọc ra **33/8/2 = 43**; 4 dòng residual có điều kiện ở `§9.3` thành khẳng định.

| Vùng | Việc phải làm |
|---|---|
| `§11.a` (**1252–1260**) | **Neo `GATE-05a`.** Ghi **TTL = 30 ngày**. Giữ nguyên cột *"vì sao không khẳng định được"* làm bằng chứng; cột *"Cần ai"* (`PM + pháp chế`) đổi thành **đã quyết bởi `@TrisJr`** |
| `§11.c` (**1272–1281**) | **Neo `GATE-05b`.** `SEC-016` `DEFER` → **`MUST-V0.1`**. Dòng **1281** (*"phải chốt trước khi capsule format v1 đóng băng"*) — ghi rõ **đã chốt đúng lúc**, format v1 chưa đóng băng |
| `§11.d` (1283), 1288–**1291** | 1291 (*"11.a và 11.c không tự giải — nếu không ai quyết thì trôi vào TTL vô hạn, không có crypto-shred"*) → **đã có người quyết**, cả hai nhánh xấu **đã bị chặn** |
| `§9 Nhóm C` (1010, **1017**) · `Nhóm D` (1026, **1032**, 1033, 1035) | `SEC-016` (1017): `DEFER` → `MUST-V0.1`. `SEC-022` (1032): điền **30 ngày** |
| **`§9.2` (960, 963)** | ⚠ **Con số phải đổi**: `32 MUST-V0.1 / 8 SHOULD / 3 DEFER` → **`33 / 8 / 2`**. Dòng **963** (*"Quyết định `D2` KHÔNG làm đổi bộ số này"*) → giữ mệnh đề về `D2`, **thêm**: *"nhưng `GATE-05b` thì CÓ — `SEC-016` rời `DEFER` sang `MUST-V0.1`"* |
| **`§9.3` (1112, 1117, 1121, 1126)** | 4 dòng residual **có điều kiện** (*"Thấp, nếu `SEC-016` được chốt"* / *"Cao trừ khi `SEC-016` được chốt"*) → **`SEC-016` đã chốt** ⇒ viết ở thể khẳng định |
| `§3.5 TB-4` (**194–210**), 176 | `TB-4` từ **bất khả hồi** → **khả hồi** nhờ crypto-shred. ⚠ Nhưng **kèm điều kiện**: chỉ khả hồi khi có key management ⇒ trỏ `GATE-05b-r2` (`U-06d` là blocker) |
| `§8.1 GDPR` (830–**887**), 843, 856 | **887** (*"`[cần validate]` — đề xuất này chưa được ai cân đo. RQ.md không nhắc crypto-shredding ở bất kỳ đâu"*) → **đã được cân và chốt bởi `@TrisJr`**. Giữ nguyên mệnh đề *"RQ.md không nhắc"* — đó là sự thật về `RQ.md` |
| `#### THREAT-016` (**494–507**), `THREAT-002` (282, 293), `THREAT-007` (359, 372, 373), `THREAT-011` (424, 437, 438) | Cập nhật residual sau `GATE-05`. **506** (*"`SEC-022`/`SEC-023` xoá được bản gốc, không chạm được tới N bản ở Zone 3"*) → **crypto-shred CHẠM được** ⇒ đây là thay đổi có sức nặng nhất |
| `§10 GAP-04` (**1230–1244**), `§12.3` (1320–**1328**) | `GATE-04`: sàn đã chốt. **1244** (*"quyết định giao diện vận hành KHÔNG thuộc thẩm quyền của tài liệu này"*) → vẫn đúng, `GAP-04` **chưa đóng** ⇒ trỏ `GATE-04-r`. `§12.3` cập nhật: 3 mục `TBD` của `§11` nay còn **1** (`11.b` — tự giải khi spike chạy) |
| `§11.b`, `§1.4` (56, 65) | `GATE-01 = Go` ⇒ `SEC-008` *"tự giải khi spike chạy"* — spike **đã được bật** |
| Câu chặn hiểu nhầm tại **1146**, **1163**, **1280** | Ba dòng nói `SEC-016` *"KHÔNG nằm trong quyết định này"* / *"vẫn `DEFER`"* / *"không được đọc như đã chốt"* → **phải viết lại**. Giữ nguyên mệnh đề về `D2`, thêm mệnh đề về `GATE-05b` |

---

## 7. Outline — PM tự viết (11 file)

| File | Vùng | Việc phải làm |
|---|---|---|
| `Charter-Repro.md` | `§1` (**24**, **25**) | `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr`. Cột *"Nguồn"* đổi từ *"RQ.md không có tên người"* → *"`GATE-01`, 2026-08-14"* |
| | `§5` (**153**) | Điền `@TrisJr` cho người duyệt + budget owner. ⚠ **Phần pháp chế**: `GATE-05a` đã quyết TTL **không qua pháp chế** — ghi thẳng đây là **rủi ro được chấp nhận**, không giả vờ đã có pháp chế |
| | `§6.3` (**181**, **182**, **184**) | 3 dòng liền nhau: `A2` (ADR `Proposed`) → `Accepted`; `A3` (chưa dùng được để xuống story) → `GATE-02` hoãn có điều kiện; `A5` (chưa có ai duyệt) → `@TrisJr` là người duyệt |
| | `§6.4` (**188**), `§7` (**192–207**) | **Neo chính `GATE-01`.** Ghi `Go` + nhãn. Giữ nguyên trích §24/§39. Thêm `GATE-01-r` |
| | `§8` (220) | Số ADR không đổi (11) — chỉ rà |
| `Roadmap.md` | Phase 0 (**33–41**) | Trạng thái Phase 0 = **Go, owner `@TrisJr`** |
| | `### Gate chuyển phase` (**103–107**) | `GATE-01` ghi quyết định. ⚠ **`GATE-02` là GHI MỚI** ở đây — thêm câu sequencing *spike trước, Epic/Story sau* |
| | 161 | Nhãn M1 cũ — **không chạm** |
| `Risk-Register.md` | callout (**15**) | Viết lại: Owner **đã được cấp** = `@TrisJr` cho 18/18 |
| | `§2` (**42–59**) | Điền `@TrisJr` vào **18/18** ô `Owner` |
| | `§3` (97), `§3.2` (**117**, **119**) | **Neo Planning của `GATE-05`.** 117 (TTL, *"trôi vào TTL vô hạn"*) → **30 ngày, đã chốt**. 119 (`SEC-016`, *"TB-4 vĩnh viễn bất khả hồi"*) → **đã chốt áp dụng**. 3 mục `TBD` còn **1** |
| | `§4.1` (**177**, **178**) | `C-02-r` / `C-02-r2` cập nhật sau `GATE-04` — sàn đóng, `GAP-04` chưa |
| | **`§4.2` MỚI** | Thêm section: **5 rủi ro `GATE-0N-r`** theo `escalations.md` E-02, đủ cột như `§4.1` |
| | 129, 130, 180 | 180 (*"Crypto-shredding KHÔNG nằm trong quyết định này"*) → **phải viết lại**. 129/130 là nhãn M1/M2 — **không chạm** |
| `Planning-MOC.md` | 28, **29** | 29 (Owner `TBD` trên 18 risk) → đã cấp. 28 (OKRs stub *"chưa có owner"*) → nay **có** owner ⇒ ghi rõ OKRs vẫn giữ stub vì **chưa có kỳ và chưa có baseline** (không phải vì thiếu owner) |
| `000-Index.md` | 37, 46, 62, **77**, 86, **88** | 77 + 88 (`GATE-03`): *"11 ADR đang `Proposed` — chưa ai duyệt"* / *"ADR là đề xuất chưa được chấp thuận"* → **đã duyệt**. 88 cũng mang `GATE-01` (*"chưa có người duyệt"*) — **một dòng, hai gate**. 46 Roadmap Phase 0 = Go. 62 `022-User-Stories` = hoãn theo `GATE-02`. 37 trỏ thêm `§4.2` |
| | callout `§IMPORTANT` (30–37) | **Thêm** khối 5 quyết định `GATE-0N` bên cạnh khối M1/M2. **Không xoá** khối M1/M2 |
| `Glossary.md` | **38** (Crypto-shredding) | `⚠ đề xuất cần validate` → **đã chốt `MUST-V0.1`, `GATE-05b`**. Giữ mệnh đề *"không có trong RQ.md"* |
| | **42** (Capsule Store) | `⚠ RQ.md không có một dòng đặc tả nào` → giữ, **thêm** sàn đã chốt bởi `GATE-04` |
| | **43** (Technical Spike) | Thêm trạng thái Phase 0 = Go |
| | *(mới)* | Thêm headword **`Retention TTL`** = 30 ngày mặc định, cấu hình được |
| `Stories-MOC.md` | **15–20** | **Neo chính `GATE-02`.** 17+18 hiện nói *"phạm vi đã ổn định đủ để phân rã"* → phải ghi **lý do hoãn** (AC dựa *"execution matched"* chưa kiểm chứng) + nhãn. 20 (§39 spike trước) nay là **quyết định**, không còn là khuyến nghị |
| | 9, 11, 24–26 | Cập nhật mô tả thư mục theo sequencing |
| `Specs-MOC.md` | **27** | `GATE-03`: *"Tất cả 11 ADR đang `Proposed` — chưa ai duyệt"* → **11/11 `Accepted`** |
| | **54** (2 gate), 59 | 54 mang cả `GATE-04` (`GAP-04` nặng thêm) và `GATE-05` (`SEC-016` giữ `DEFER`) → `SEC-016` **đã chốt**; `GAP-04` **chưa đóng**. 59 (`U-06` là `TBD`) → sàn đã chốt |
| `QA-MOC.md` | **18**, 19, 30 | 18 mang **cả** `GATE-01` và `GATE-02` trong một dòng: spike đã bật, test plan vẫn hoãn tới sau spike. 19 (chưa có pass/fail cho V0.1) → **vẫn đúng**, `GATE-01` không đặt ngưỡng `N-05` |
| `Operations-MOC.md` | callout **20–24** | Một khối mang cả `GATE-04` và `GATE-05`: retention nay có **30 ngày**; `GAP-04` (không có verb vận hành) **vẫn hở** |
| `Requirements-MOC.md` | 62, 63, **65** | 65 mang cả `GATE-02` (Bước 4 Specification hoãn) và `GATE-03` (*"chưa có người duyệt được chỉ định"* → `@TrisJr`) |

---

## 8. Markdown link phải tạo/kiểm

| Từ | Tới | Quan hệ (RULE-001 §Linking Rules) |
|---|---|---|
| `Risk-Register.md §4.2` | `../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md` | `GATE-05b-r2` trỏ tới `U-06d` |
| `Risk-Register.md §4.2` | `../030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | `GATE-05b-r` trỏ tới `§11.c` |
| `Risk-Register.md §4.2` | `../020-Requirements/NFR-Repro.md` | `GATE-01-r` trỏ tới `ACG-01`/`02`/`03`/`07` ở `§7` |
| `Charter-Repro.md §7` | `./Roadmap.md` | `GATE-01` trỏ tới Phase 0 |
| `Stories-MOC.md` | `../010-Planning/Roadmap.md` | `GATE-02` trỏ tới gate chuyển phase |
| Mọi ADR (11) | `./SDD-Repro.md` | ADR → SDD, giữ nguyên |
| `000-Index.md` | `./010-Planning/Risk-Register.md` | trỏ `§4.2` mới |

**Kiểm cuối**: 0 link chết, **0 wiki-link `[[...]]`**, 0 file orphan.

---

## 9. MOC cần cập nhật (close-step — PM)

| MOC | Mục thêm/sửa |
|---|---|
| `Planning-MOC.md` | Owner đã cấp · `§4.2` mới của Risk-Register |
| `Requirements-MOC.md` | Bước 3 Validation có người duyệt · Bước 4 Specification hoãn theo `GATE-02` |
| `Stories-MOC.md` | Lý do hoãn phân rã |
| `Specs-MOC.md` | 11/11 ADR `Accepted` · `SEC-016` đã chốt · `U-06` sàn đã chốt |
| `QA-MOC.md` | Spike đã bật, test plan vẫn hoãn |
| `Operations-MOC.md` | TTL 30 ngày · `GAP-04` vẫn hở |
| `000-Index.md` | Khối 5 quyết định `GATE-0N` · trỏ `§4.2` |

---

## 10. Ripple (T3) — tài liệu trích dẫn phạm vi này và sẽ lệch sau khi sửa

| Ripple | Ai chịu | Rủi ro nếu bỏ sót |
|---|---|---|
| **Bộ số `32/8/3 = 43`** | `security-auditor` + mọi writer trích con số | Kho tự nói ngược về số requirement bảo mật |
| **15 câu chặn hiểu nhầm về crypto-shred** ở 8 file | tất cả writer | `GATE-05b` lan nửa vời — đúng thứ Shape B sinh ra để chặn |
| **5 chỗ khai *"11 ADR đang Proposed"*** ngoài file ADR | PM (4) + `architect` A (SDD §1.6) | Kho nói ADR chưa duyệt trong khi ADR nói đã duyệt |
| **~25 vùng trích mốc *"sẽ giải khi spike chạy"*** trên 15 file | tất cả | `GATE-01 = Go` nên **không đổi nghĩa** — chỉ rà, không sửa hàng loạt |
| **`U-06` / `U-06b` / `U-06c` / `U-06d`** ở 3 file của lượt A | `architect` A | Register nói khác ADR — đúng lỗi `C1` của run trước |
| **Nhãn M1/M2** ở 17 file | tất cả | Xoá hoặc đổi nhãn cũ làm mất dấu vết `D1`/`D2` |
| **`RQ.md`** | — | **KHÔNG sửa.** Nếu writer sửa, mọi trích dẫn `§N` trong 26 file mất khả năng kiểm chứng |
