# Run Plan: 2026-08-14-gates-g1-g5

**Lane**: doc · **Shape**: **B** (propagation sweep) · **Tier**: **T3** (3/4 điểm triage)
**Bản chất run**: ghi và **lan** năm quyết định gate vào toàn kho tài liệu. Không tạo tài liệu mới.
**Định danh trong tài liệu**: `GATE-01`…`GATE-05` (xem `brief.md` A6 — `G1`…`G5` đã bị chiếm).
**Nhãn quyết định**: `✅ CHỐT GATE-0N — 2026-08-14` (cố ý **không** chứa chuỗi `ĐÃ CHỐT 2026-08-14` của M1/M2 — xem `brief.md` A3).

| ID run này | Tên anh gọi | Nội dung |
|---|---|---|
| `GATE-01` | G1 | Phase 0 technical spike — Go / No-Go / narrowed + cấp `Sponsor` / `Manager` / risk owner |
| `GATE-02` | G2 | Sequencing — spike **trước** khi phân rã Epic/Story |
| `GATE-03` | G3 | 11 ADR — giữ `Decision status: Proposed` kèm điều kiện review, hay duyệt ngay |
| `GATE-04` | G4 | `U-06` — sàn tối thiểu của Capsule Store |
| `GATE-05` | G5 | `SEC-022` TTL mặc định + `SEC-016` crypto-shredding |

---

## Phases

| # | Phase | Agent | Song song? | Input | Output |
|---|-------|-------|-----------|-------|--------|
| 1 | Intake & Triage | **PM** | — | Yêu cầu gốc | `brief.md` ✅ |
| 2 | Inventory (Shape B, bắt buộc) | `context-auditor` | — (1 lens) | toàn bộ `docs/**` | `findings/context-auditor.md` ✅ |
| 3 | **GATE** | **PM** | — | inventory | `run-plan.md` + quyết định của anh |
| 4 | Doc plan | **PM** | — | inventory + quyết định | `outline.md` |
| 5a | Requirements + Persona | `business-analyst` | **Có** | outline (toàn văn) | 8 file |
| 5b | SDD + 2 ADR nặng | `architect` (lượt A) | **Có** | outline (toàn văn) | 3 file |
| 5c | 9 ADR còn lại | `architect` (lượt B) | **Có** | outline (toàn văn) | 9 file |
| 5d | Threat Model | `security-auditor` | **Có** | outline (toàn văn) | 1 file |
| 5e | Planning + MOC + Index + Glossary | **PM tự viết** | **Có** | outline | 11 file |
| 6 | Verify | `context-auditor` | — | toàn bộ deliverable | `verdict.md` |
| 6b | Close-step + verify lần cuối | **PM tự làm** | — | verdict | Validation Checklist RULE-001 |

Phase 5a–5e chạy **đồng thời** vì ownership rời nhau tuyệt đối.

> **Vì sao tách `architect` thành hai lượt**: `verdict.md §8` của run trước rút ra bài học — lỗi CRITICAL duy nhất (`C1`) đến từ **cùng một writer** sở hữu nhiều file mà không đối chiếu ngược lại register định danh của chính mình. Lượt A gom đúng ba file có ràng buộc chéo (`SDD §8.3` giữ `U-06`; `ADR-009` giữ `U-06b`/`U-06c`; `ADR-002` giữ ràng buộc *"chốt `SEC-016` trước khi format v1 đóng băng"*) ⇒ **một writer nhìn thấy cả ba, buộc phải reconcile**. Lượt B là 9 ADR không có ràng buộc chéo, phần lớn là sửa nhãn + thêm frontmatter.

---

## File ownership map

**Nguyên tắc cắt: theo FILE, không theo gate.** Mỗi writer thi hành **mọi** gate chạm file của mình. Lý do đầy đủ ở `brief.md` A7 và `findings/context-auditor.md §3.1`.

| Agent | Sở hữu (được ghi) | Gate phải thi hành | Cấm chạm |
|-------|-------------------|---|----------|
| **PM** (main loop) | `docs/010-Planning/Charter-Repro.md`<br>`docs/010-Planning/Roadmap.md`<br>`docs/010-Planning/Risk-Register.md`<br>`docs/010-Planning/Planning-MOC.md`<br>`docs/000-Index.md`<br>`docs/999-Resources/Glossary.md`<br>`docs/022-User-Stories/Stories-MOC.md`<br>`docs/030-Specs/Specs-MOC.md`<br>`docs/035-QA/QA-MOC.md`<br>`docs/080-Operations/Operations-MOC.md`<br>`docs/020-Requirements/Requirements-MOC.md`<br>+ toàn bộ `pm-runs/2026-08-14-gates-g1-g5/` | 01 · 02 · 03 · 04 · 05 | — |
| `business-analyst` | `docs/020-Requirements/PRD-Repro.md`<br>`docs/020-Requirements/NFR-Repro.md`<br>`docs/020-Requirements/BRD/BRD-001-Problem-Statement.md`<br>`docs/020-Requirements/Use-Cases/UC-01-*.md`<br>`docs/020-Requirements/Use-Cases/UC-02-*.md`<br>`docs/020-Requirements/Use-Cases/UC-03-*.md`<br>`docs/020-Requirements/Use-Cases/UC-05-*.md`<br>`docs/050-Research/Analysis-Target-Users.md` | 01 · 02 · 04 · 05 | mọi `*-MOC.md`, `000-Index.md`, `Glossary.md`, `docs/030-**`, `docs/010-**`, `UC-04` |
| `architect` **lượt A** | `docs/030-Specs/Architecture/SDD-Repro.md`<br>`docs/030-Specs/Architecture/ADR-002-*.md`<br>`docs/030-Specs/Architecture/ADR-009-*.md` | 01 · 02 · 03 · 04 · 05 | 9 ADR của lượt B, mọi thứ ngoài `Architecture/` |
| `architect` **lượt B** | `docs/030-Specs/Architecture/ADR-001-*.md`<br>`ADR-003` · `ADR-004` · `ADR-005` · `ADR-006`<br>`ADR-007` · `ADR-008` · `ADR-010` · `ADR-011` | 01 · 03 | `SDD-Repro.md`, `ADR-002`, `ADR-009`, mọi thứ ngoài `Architecture/` |
| `security-auditor` | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | 01 · 04 · 05 | mọi thứ ngoài file của mình |
| `context-auditor` | **read-only** — `FILES_TOUCHED: none` | verify | tất cả |

> Các tập ownership **rời nhau tuyệt đối**. Tổng **32 file**: PM 11 · `business-analyst` 8 · `architect` 3+9 · `security-auditor` 1.
> `outline.md` + mọi `*-MOC.md` + `000-Index.md` + `Glossary.md` **thuộc PM**, không cấp cho worker nào — đây là điểm hội tụ của mọi writer.

### Cố ý KHÔNG chạm (là quyết định, không phải bỏ sót)

| File / vùng | Lý do |
|---|---|
| `docs/999-Resources/RQ.md` | Nguồn sự thật gốc. Quyết định của anh **không xoá** nội dung `RQ.md` — tiền lệ `verdict.md §10.1` |
| `docs/010-Planning/pm-runs/2026-08-14-repro-product-docs/**` | Run-state của run cũ. Guardrail cấm sửa. Con số *"14 file"* sai ở `verdict.md §10.3` **vẫn giữ nguyên** — nó là dấu vết đo tại thời điểm đó |
| `docs/999-Resources/Templates/**` | Template dùng chung, không thuộc phạm vi |
| `docs/010-Planning/OKRs.md` | **0 hit** cho cả 5 gate. Và viết OKR lúc này vẫn là bịa (`Planning-MOC:28`) |
| `docs/040-Design/Design-MOC.md` · `Research-MOC.md` · `Deployment-MOC.md` · `Resources-MOC.md` | **0 hit** cho cả 5 gate (auditor đã kiểm) |
| `docs/020-Requirements/Use-Cases/UC-04-*.md` | **0 hit** cho cả 5 gate |
| `knowledge-base/**` | `RULE-001` ở `status: approved`, chỉ đọc |
| `src/`, `test/` | Lane `/pm-code` |
| **G6 / W1** — `status: live` ngoài enum, 8 link chết, `Design-MOC` thiếu frontmatter | Nợ có sẵn từ trước (`verdict.md §9.2`). Anh yêu cầu `G1=>G5`, không phải `G6`. Thuộc một run Shape B housekeeping riêng |
| **A2** — `docs/030-Specs/Spec-Phase-0-Spike-Protocol.md` | Là **run kế tiếp**, kể cả khi `GATE-01 = Go`. Nêu ở gate để anh biết mình đang duyệt cái gì |

---

## Bảng đích tài liệu (tra Document Type Mapping — RULE-001)

Run này **không tạo tài liệu mới** ⇒ không cần tra mapping cho đích mới. Mọi file đều đã tồn tại, đã đúng thư mục Dewey, đã đúng naming convention.

| Loại (RULE-001) | Thư mục đích | Số file sửa |
|---|---|---|
| Project Charter · Roadmap · Risk Register · MOC | `docs/010-Planning/` | 4 |
| PRD · NFR · BRD · Use Case · MOC | `docs/020-Requirements/` (+ `BRD/`, `Use-Cases/`) | 6 |
| MOC | `docs/022-User-Stories/` | 1 |
| SDD · ADR · Security Spec · MOC | `docs/030-Specs/` (+ `Architecture/`, `Security/`) | 15 |
| MOC | `docs/035-QA/` · `docs/080-Operations/` | 2 |
| Research / Analysis | `docs/050-Research/` | 1 |
| Index · Glossary | `docs/000-Index.md` · `docs/999-Resources/` | 2 |

**Nếu phát sinh nhu cầu tạo file mới giữa run** → **dừng, escalate tầng 3**. Không tự chế đường dẫn.

---

## Ràng buộc nội dung áp cho MỌI writer

1. **Giữ nguyên 100% bằng chứng hai phía.** Chỉ **thêm** quyết định / lý do / hệ quả và **đổi nhãn trạng thái**. Không xoá phần trích dẫn kèm section number. Tiền lệ: `verdict.md §10.1`.
2. **Không bịa.** Không tên người, không ngày tháng, không con số TTL, không đặc tả Capsule Store tự phát minh. `RQ.md` có **0 hit** cho tên người, **0 hit** `crypto`, **không có con số TTL nào** — auditor đã verify. Anh không cấp → ghi `TBD` **kèm điều kiện và owner**, và báo `PARTIAL`.
3. **Nhãn**: `✅ CHỐT GATE-0N — 2026-08-14`. **Không** dùng lại chuỗi `ĐÃ CHỐT 2026-08-14`.
4. **Link**: standard markdown link + relative path — `[Tên](./đường-dẫn.md)`. **KHÔNG wiki-link `[[...]]`** (RULE-001 MUST-rule #5; `verdict.md §4` tính *"0 wiki-link"* là tiêu chí PASS).
5. **Frontmatter**: bump `updated: 2026-08-14`. ⚠ **6 file phải THÊM trường `updated:` vì hiện không có**: `ADR-001`, `ADR-003`, `ADR-005`, `ADR-007`, `ADR-008`, `ADR-010`.
6. **Không chạm `*-MOC.md`, `000-Index.md`, `Glossary.md`** — PM giữ.
7. **Mọi con số dẫn xuất phải được rà lại.** Cụ thể: nếu `GATE-05` chốt `SEC-016` thì bộ số `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` ở `Threat-Model:960` **đổi**, và dòng 963 (*"`D2` KHÔNG làm đổi bộ số này"*) phải sửa theo.
8. **15 câu chặn hiểu nhầm về crypto-shred** nằm ở 8 file với diễn đạt khác nhau — dùng bản kê của auditor (`findings/context-auditor.md`), **không** dùng con số *"3 chỗ"* của `verdict.md §10.4`.

---

## Assumptions

Bảy assumption ở `brief.md` (A1–A7) giữ nguyên. Bổ sung sau inventory:

- **A8 — `Roadmap.md` với `GATE-02` là GHI MỚI.** `Roadmap.md` có **0 hit** `Epic`/`Story`. Writer phải **thêm** câu sequencing vào `### Gate chuyển phase` (103–107) — đúng vùng `GATE-01` cũng sửa. Cùng writer (PM) ⇒ không xung đột.
  → **sai thì hỏng ở đâu**: nếu coi là "sửa dòng có sẵn", writer sẽ tìm không thấy rồi bỏ qua ⇒ `GATE-02` lan nửa vời.
- **A9 — `ADR-004` và `ADR-011` chỉ bị `GATE-03` chạm.** Hai file duy nhất trong 11 ADR không bị gate nào khác. ⚠ `ADR-004` chính là file bị sót ở `E-06` run trước ⇒ **kiểm riêng nó ở verify**.
  → **sai thì hỏng ở đâu**: sót lại lần thứ hai cùng một file là lỗi hệ thống, không phải lỗi ngẫu nhiên.
- **A10 — Nếu `GATE-01 = No-Go` thì phạm vi run PHÌNH RA, không co lại.** Toàn bộ nhóm `G1.b` của inventory (khoảng 25 vùng trích mốc *"sẽ giải khi spike chạy"* trên 15 file) **đổi nghĩa** và phải rà từng dòng.
  → **sai thì hỏng ở đâu**: nếu PM lập plan theo giả định `Go` rồi anh chọn `No-Go`, run sẽ thiếu khoảng một nửa khối lượng ⇒ phải escalate và lập lại outline, không được im lặng làm nửa vời.

---

## Artifact sẽ tạo/sửa ngoài run-state

**Tạo mới**: **không có file nào.**
**Sửa**: **32 file** đã liệt kê ở File ownership map.
**Close-step (PM)**: 6 MOC (`Planning`, `Requirements`, `Stories`, `Specs`, `QA`, `Operations`) + `000-Index.md` + `Glossary.md` — đã nằm trong 32 file trên.

---

## Gate

- **Trình ngày**: 2026-08-14
- **Kết quả**: **DUYỆT kèm điều chỉnh** — anh chốt cả 5 gate, trong đó **2 gate quyết khác khuyến nghị của PM**.
- **Số vòng hỏi**: 2 (vòng 2 thu nội dung cụ thể cho ba lựa chọn mà `RQ.md` không cấp dữ liệu — đã báo trước ở vòng 1).
- **Chi tiết + phản biện PM đã nêu**: `escalations.md` **E-01**.

### Năm quyết định của anh — nguồn mà mọi nhãn trong 32 file trỏ về

| ID | Quyết định | So với khuyến nghị PM |
|---|---|---|
| `GATE-01` | **Go** — bật Phase 0 như **điều kiện đầu tư**. `Sponsor` = `@TrisJr` · `Manager` = `@TrisJr` · Owner **18/18** risk = `@TrisJr` | ✅ Theo khuyến nghị |
| `GATE-02` | **Spike trước** — hoãn phân rã Epic/Story tới sau khi Phase 0 đóng gate | ✅ Theo khuyến nghị |
| `GATE-03` | **Duyệt toàn bộ 11 ADR → `Accepted`**, người duyệt `@TrisJr`, ngày 2026-08-14 | ⚠ **Ngược khuyến nghị** (PM đề xuất giữ `Proposed`) |
| `GATE-04` | **Chốt sàn Capsule Store** = object/file storage + **một index** + **authn/authz/audit hook**; 3 thao tác tối thiểu theo `SDD §5.4`. Phần **sàn đóng**, **cơ chế** auth vẫn `TBD` | ⚠ Quyết **sớm hơn** khuyến nghị, nhưng **nội dung trùng** phương án PM sẽ đề xuất |
| `GATE-05a` | **TTL mặc định = 30 ngày** (`SEC-022`), vẫn cấu hình được. Đóng `U-06b` | ⚠ Quyết sớm hơn khuyến nghị |
| `GATE-05b` | **`SEC-016` crypto-shredding = ÁP DỤNG, `MUST-V0.1`**. Đóng `U-06c` | ⚠ **Ngược khuyến nghị** (PM đề xuất chốt deadline rồi quyết ở lượt riêng) |

### Hai hệ quả bắt buộc lan khắp kho — writer phải thi hành

| # | Hệ quả | Chi tiết |
|---|---|---|
| 1 | **Bộ số requirement bảo mật ĐỔI** | `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` → **`33 / 8 / 2 = 43`**. Sửa `Threat-Model:960` **và** `:963` (câu *"`D2` KHÔNG làm đổi bộ số này"* phải nói rõ **`GATE-05b` thì CÓ**), cùng **mọi** file trích `43` hoặc `32/8/3` |
| 2 | **`GATE-05b` phá một bất biến** | *"Replay không cần kết nối mạng"* (`SDD:1145`) **thôi là bất biến**. Va vào `ADR-002` (capsule self-contained) và `§33.6 Safe by default`. Ghi là **hệ quả được chấp nhận có ý thức** (`GATE-05b-r`), không im lặng bỏ qua |

### Năm rủi ro MỚI sinh từ chính năm quyết định

Định danh **`GATE-0N-r`**. Ghi vào `Risk-Register §4.2` mới. Chi tiết đầy đủ ở `escalations.md` **E-02**.

`GATE-01-r` (Go không tự làm spike đo được) · `GATE-03-r` (ADR `Accepted` mà bên trong còn 6 unknown) · `GATE-04-r` (sàn đóng nhưng `GAP-04` còn nguyên) · `GATE-05b-r` (mất bất biến replay offline) · `GATE-05b-r2` (`U-06d` key custody thành blocker).
