# Findings — context-auditor (Bước 2, Inventory)

**Dispatch**: read-only, `FILES_TOUCHED: none`. Phạm vi quét: toàn bộ `docs/**/*.md`. Loại trừ khỏi *phạm vi sửa* (vẫn đọc để lấy bối cảnh): `docs/010-Planning/pm-runs/**`, `docs/999-Resources/RQ.md`, `docs/999-Resources/Templates/**`.

---

## Kết luận của worker

```
STATUS: DONE
FILES_TOUCHED: none
SUMMARY:
Đã lập ma trận inventory cho G1–G5 trên toàn bộ docs/**/*.md bằng grep, không dùng bản kê tóm tắt.
Số đo chốt: 11/11 ADR ở `Decision status: Proposed` (dòng 11 hoặc 12), `Accepted` = 0, và 6/11 ADR THIẾU trường `updated:` (001,003,005,007,008,010).
Nhãn quyết định: chuỗi chính xác `✅ ĐÃ CHỐT 2026-08-14` ở 13 file (10 trong phạm vi sửa); chuỗi lỏng `ĐÃ CHỐT 2026-08-14` ở 20 file (17 trong phạm vi) — con số 14 ở brief A3 / verdict §10.3 KHÔNG tái lập được bằng bất kỳ pattern nào, PM cần chốt pattern verify trước khi giao writer.
`Owner`/`Sponsor`/`Manager` = `TBD` tại 22 chỗ (Charter 24/25/153/184, Risk-Register 15/40 + 18/18 ô dòng 42–59, Planning-MOC 28/29); RQ.md có 0 hit tên người.
Va chạm: SDD-Repro bị cả 5 gate, Charter 4 gate (dòng 181/182/184 liền nhau), ADR-009 4 gate, Roadmap có G1+G2 cùng chèn vùng 103–107 — ba file này phải cắt ownership theo section, không theo file. Đã tự bắt và loại 3 lỗi regex (`C-02-r` ⊂ `UC-02-Replay`, `TTL` ⊂ `BOTTLENECKS`, thiếu `-E`).
```

---

## 1. Ma trận file × gate — bảng chủ để cắt ownership

Đây là artifact quan trọng nhất của Bước 2. Cột **Neo chính** = chỗ quyết định *phải* được ghi vào; các chỗ còn lại là trích dẫn cần rà cho khỏi nói ngược.

| File | G1 | G2 | G3 | G4 | G5 | Neo chính / ghi chú |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `030-Specs/Architecture/SDD-Repro.md` | ✅ | ✅ | ✅ | ✅ | ✅ | **5/5 gate.** 1609 dòng. G1 §1.1/§8.2 · G2 1208/1572 · G3 §1.6 (130) + index 134–144 · G4 §3.6/§5.4/§8.3 (1516) · G5 §4.9/§7.4 (1372, 911, 1389) |
| `010-Planning/Charter-Repro.md` | ✅ | ✅ | ✅ | — | ✅ | **Neo chính G1**: §1 (24, 25), §6.4 (188), §7 (194–207). G2 = 182 (A3) · G3 = 181 (A2), 184 (A5), 220 · G5 = 153. **Dòng 181/182/184 nằm liền nhau trong cùng bảng §6.3** |
| `030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md` | ✅ | — | ✅ | ✅ | ✅ | **ADR duy nhất bị 4 gate.** G3 = 12 · G4 = D3 (79–89) + Alternatives (148–151) + `U-06` (189) · G5 = D5 (95–105) + `U-06b`/`U-06c` (191–192) · G1 = 148 |
| `030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | ✅ | — | — | ✅ | ✅ | **Neo chính G5**: §11.a (1252–1260), §11.c (1272–1281), §9 Nhóm C/D (1017, 1032). G4 = §10 `GAP-04` (1230–1244), §12.3 (1328) · G1 = §11.b, §12.3 |
| `020-Requirements/NFR-Repro.md` | ✅ | ✅ | — | ✅ | ✅ | G5 = §5.4 (240, 252, 262 — heading tự khai *"CHƯA chốt"*) · G4 = 260 · G2 = 31 · G1 = §1/§2/§3 |
| `020-Requirements/PRD-Repro.md` | ✅ | — | — | ✅ | ✅ | **Neo chính G4**: §10.5 `U-06` (637, 643). G5 = §5.2 (291, 295), §10.4 (606–612) · G1 = §8.4 (509–513), §9 |
| `010-Planning/Risk-Register.md` | ✅ | — | — | ✅ | ✅ | **Neo chính G1**: callout (15) + §2 header (40) + **18/18 ô Owner** (42–59). **Neo Planning của G5**: §3.2 (117, 119) + §3 (97) · G4 = §4.1 (177, 178) |
| `000-Index.md` | ✅ | ✅ | ✅ | — | — | G1 = 46, 86, 88 · G2 = 62 · G3 = 77, 88 · G4 = 37. **Dòng 88 bị cả G1 và G3** |
| `999-Resources/Glossary.md` | ✅ | — | — | ✅ | ✅ | Ba dòng liền nhau: 38 (Crypto-shredding) · 42 (Capsule Store) · 43 (Technical Spike) |
| `050-Research/Analysis-Target-Users.md` | ✅ | — | — | ✅ | ✅ | G4 = §4.1 `GAP-04` (181–218) · G5 = 198, 202, 218 · G1 = 285 |
| `030-Specs/Specs-MOC.md` | — | — | ✅ | ✅ | ✅ | G3 = 27 (con số `11 ADR` + `Proposed`) · **Dòng 54 bị cả G4 và G5** · G4 = 59 |
| `022-User-Stories/Stories-MOC.md` | ✅ | ✅ | — | ✅ | — | **Neo chính G2**: 15, 17, 18, 19, 20. File 30 dòng nhưng 3 gate |
| `010-Planning/Roadmap.md` | ✅ | ✅ | — | — | — | G1 = Phase 0 (33–41) + Gate chuyển phase (103–107). **G2 = 0 hit ⇒ là GHI MỚI**, chèn vào đúng vùng 103–107 mà G1 đang sửa |
| `030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md` | ✅ | — | ✅ | — | ✅ | G5 = `E12` (95, 112). Ràng buộc *"chốt `SEC-016` trước khi format v1 đóng băng"* đi qua chính file này |
| `020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md` | — | — | — | ✅ | ✅ | G4 = 41, 45, 158 · G5 = `A2` (164–177) — 174/175 là **hai câu hỏi trực tiếp** về retention |
| `020-Requirements/Use-Cases/UC-01-Capture-Failed-Production-Execution.md` | — | — | — | ✅ | ✅ | G4 = 223, 225 · G5 = 241, 267–286 |
| `080-Operations/Operations-MOC.md` | — | — | — | ✅ | ✅ | Callout 20–24 mang cả `GAP-04` và retention **trong một khối** |
| `035-QA/QA-MOC.md` | ✅ | ✅ | — | — | — | Dòng 18 mang **cả hai** lập luận ⇒ không tách được |
| `020-Requirements/Requirements-MOC.md` | — | ✅ | ✅ | — | — | G2 = 63, 65 · G3 = 62, 65. **Dòng 65 bị cả hai** |
| `010-Planning/Planning-MOC.md` | ✅ | — | — | — | — | 28, 29 — cắt rời được |
| `020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md` | ✅ | — | — | ✅ | — | G1 = 202, 272 · G4 = 319, 326 (citation) |
| `020-Requirements/Use-Cases/UC-03-Read-Execution-Diff.md` | ✅ | — | — | — | — | 246 |
| `020-Requirements/BRD/BRD-001-Problem-Statement.md` | ✅ | — | — | — | — | Open Questions 395, 400 |
| `ADR-001, 003, 005, 007, 008, 010` | ✅ | — | ✅ | — | — | G3 = `Decision status` (dòng 11) + **thêm `updated:`** · G1 = `Open items`/`Consequences` |
| `ADR-004`, `ADR-011` | — | — | ✅ | — | — | **Hai file duy nhất chỉ bị G3.** ⚠ `ADR-004` là file bị sót ở E-06 |

**0 hit cho cả 5 gate** (đã kiểm, không nhồi cho đủ): `010-Planning/OKRs.md` · `040-Design/Design-MOC.md` · `050-Research/Research-MOC.md` · `070-Deployment/Deployment-MOC.md` · `999-Resources/Resources-MOC.md`.

---

## 2. Số đo đã verify bằng công cụ

| Hạng mục | Kết quả |
|---|---|
| Số file ADR | `ls ADR-*.md \| wc -l` = **11** |
| `Decision status` | **11/11** dòng, giá trị **100% `Proposed`**; chuỗi `Accepted` = **0** |
| ADR **thiếu** trường `updated:` | **6/11** — `ADR-001`, `003`, `005`, `007`, `008`, `010` |
| Ô `Owner` = `TBD` trong Risk-Register §2 | **18/18** (dòng 42–59), không ô nào đã điền |
| `Sponsor`/`Manager`/`Owner` = `TBD` | **22 chỗ** — Charter 24, 25, 153, 184 · Risk-Register 15, 40 + 18 ô · Planning-MOC 28, 29 |
| `grep -nE "Sponsor\|Manager\|Owner" RQ.md` | **0 hit** — không có nguồn để lấy tên người |
| `crypto` trong `RQ.md` | **0 hit** |
| Giá trị TTL trong `RQ.md` | **không có con số nào** — chỉ *"configurable retention"* (1016), *"data retention policies"* (1260) |
| Nhãn `✅ ĐÃ CHỐT 2026-08-14` (exact) | **13 file** toàn bộ · **10 file** trong phạm vi sửa |
| Nhãn `ĐÃ CHỐT 2026-08-14` (loose) | **20 file** toàn bộ · **17 file** trong phạm vi sửa |

### Ba lỗi regex worker tự bắt và loại — đáng ghi vào memory

| # | Lỗi | Hệ quả nếu không bắt |
|---|---|---|
| 1 | `grep -i "C-02-r"` match **`UC-02-R`**eplay-Capsule-Locally | Kéo oan `BRD-001`, `UC-03`, `UC-04`, `Requirements-MOC` vào tập G4 |
| 2 | `grep -i "TTL"` match **`BO TTL ENECKS`** (`BOTTLENECKS`) | Kéo oan `Template-Report-Unit.md` vào tập G5 |
| 3 | `grep -rli "a\|b"` **thiếu `-E`** ⇒ `\|` là ký tự thường | **Tập file rỗng giả** — nguy hiểm nhất, vì nó trông như "không có hit" |

---

## 3. PM đọc được gì

### 3.1 Ownership **không cắt được theo gate** — phải cắt theo file

Đây là kết luận làm đổi run plan. Auditor đề xuất *"cắt theo section number"* cho `SDD`, `Charter`, `Roadmap`. **PM không làm theo.** Lý do: `pm-core.md` Guardrail nói *"không bao giờ dispatch song song hai worker có giao file ownership"*, và `pm-doc.md` Bước 5 nói *"cắt theo file hoặc theo thư mục con, **không bao giờ cắt theo chủ đề** vì chủ đề chồng lấn file"*. Gate **chính là** chủ đề. Hai worker cùng ghi hai section của một file 1609 dòng là ghi đè, không phải phân công.

→ **Cắt theo file. Mỗi writer thi hành MỌI gate chạm file của mình.** Tái dùng ownership split của run trước (đã được kiểm chứng là rời nhau).

### 3.2 Nhãn quyết định — PM chốt pattern, không dùng lại chuỗi cũ

Nếu nhãn mới chứa chuỗi `ĐÃ CHỐT 2026-08-14` thì mọi `grep` truy vết M1/M2 về sau sẽ **lẫn** quyết định của run này. Vì vậy nhãn mới **cố ý không chứa** chuỗi đó:

| Mục đích | Pattern grep |
|---|---|
| Truy vết M1/M2 (run trước) | `ĐÃ CHỐT 2026-08-14` — **giữ nguyên, không đổi con số** |
| Truy vết run này | `CHỐT GATE-0` |

**Nhãn dùng cho run này**: `✅ CHỐT GATE-01 — 2026-08-14` … `✅ CHỐT GATE-05 — 2026-08-14`.

### 3.3 Định danh gate: **`GATE-01`…`GATE-05`**, không dùng `G1`…`G5`

`G1`…`G5` **không dùng được làm ID trong tài liệu** — đã bị chiếm hai lần, và `D3`…`D7` cũng vậy:

| Định danh | Đã bị chiếm ở |
|---|---|
| `G1` / `G2` / `G3` | `PRD-Repro.md:84–86` — **Goals** của V0.1 |
| `G1`…`G4` | `run-plan.md` của run trước — **gate item** (mapping tài liệu, số ADR, hạng mục bổ sung, hai mâu thuẫn) |
| `D1` / `D2` | Quyết định M1/M2 của anh — **45 hit `D2`** |
| `D3`…`D6` | `ADR-011:81–107` — Decision sub-ID nội bộ |
| `D-24` | Decision ID của architect lens run trước |

PM đã verify `GATE-0`, `GATE-`, `PG-`, `DEC-` đều **0 hit** trong toàn kho. Chọn **`GATE-01`…`GATE-05`** vì nó tự mô tả và không đụng namespace nào.

> Trong hội thoại với anh vẫn gọi `G1`…`G5` theo cách anh đặt; trong **tài liệu** dùng `GATE-01`…`GATE-05`, kèm một dòng mapping ở mỗi neo chính để tra được hai chiều.

### 3.4 Ba hạng mục writer dễ làm sai nếu không được dặn tường minh

| # | Bẫy | Cách chặn |
|---|---|---|
| 1 | **6/11 ADR thiếu `updated:`** — writer quen "bump" sẽ không thấy trường nào để bump rồi bỏ qua | Prompt phải nói **thêm trường** ở đúng 6 file có tên |
| 2 | **`SEC-016` rời `DEFER` ⇒ đổi bộ số `32 MUST / 8 SHOULD / 3 DEFER = 43`** ở `Threat-Model:960`, và dòng 963 đang khẳng định *"`D2` KHÔNG làm đổi bộ số này"* | Nếu `GATE-05` chốt `SEC-016`, writer phải sửa cả con số **và** dòng 963; mọi file trích *"43"* phải rà lại |
| 3 | **15 câu chặn hiểu nhầm** (*guard sentence*) về crypto-shred nằm rải ở 8 file, diễn đạt **khác nhau**. `verdict.md §10.4` chỉ ghi *"3 chỗ"* | Writer phải dùng bản kê 15 dòng của auditor, **không** dùng con số 3 của verdict |

### 3.5 `Roadmap.md` với `GATE-02` là **ghi mới**, không phải sửa

`Roadmap.md` có **0 hit** `Epic`/`Story`. `brief.md` OQ-2 nêu Roadmap là đích của G2 ⇒ writer phải **thêm** câu sequencing vào `### Gate chuyển phase` (103–107), đúng vùng mà `GATE-01` cũng đang sửa. Cùng một writer (PM) ⇒ không xung đột.

---

## 4. Mâu thuẫn với lens khác

Run này **chỉ dispatch 1 lens** ở Bước 2 (xem `brief.md` mục *Tinh giản có ý thức trong T3*) ⇒ không có mâu thuẫn giữa hai lens.

Nhưng có **một mâu thuẫn với tài liệu run trước**, PM phân xử tại đây:

| Mâu thuẫn | Phân xử của PM |
|---|---|
| `brief.md` A3 và `verdict.md §10.3` nói nhãn ở **14 file**. Auditor đo lại: exact = 13 (10 trong phạm vi), loose = 20 (17 trong phạm vi). **Không pattern nào cho 14** | **Tin số đo của auditor.** Ba dữ kiện chống lưng: (a) `verdict.md §10.1` tự viết *"16 file"* nhưng bảng ownership ngay dưới liệt kê **17 tên**; (b) `Glossary.md` nằm trong bảng ownership đó nhưng mang **0 nhãn** — nó ghi quyết định bằng cụm *"(quyết định 2026-08-14)"*; (c) `Stories-MOC.md` được thêm nhãn ở commit `690a824`, **sau** thời điểm verdict đếm. → PM sửa `brief.md` A3 và **không** sửa `verdict.md` (guardrail: không sửa run-state của run cũ; con số 14 là dấu vết đo tại thời điểm đó) |
