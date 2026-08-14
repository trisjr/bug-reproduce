# Doc Plan: 2026-08-14-repro-product-docs

> **File này do PM độc quyền chỉnh sửa.** Writer báo xong trong `SUMMARY` + `FILES_TOUCHED`, PM đối chiếu rồi tick.
> **Nguồn sự thật duy nhất cho mọi tài liệu**: `docs/999-Resources/RQ.md` (1995 dòng). Không có căn cứ trong RQ.md hoặc trong findings → ghi `TBD`, báo `PARTIAL`. **Không bịa.**

## Ràng buộc đóng băng — writer KHÔNG được tự đặt path hay id

Ba writer chạy **song song** và phải cross-link tới file mà lúc viết **chưa tồn tại**. Vì vậy toàn bộ đường dẫn và `id` frontmatter được **chốt tại đây**. Writer tra bảng này, **không** tự phát minh.

| `id` | `type` | Đường dẫn | Writer |
|---|---|---|---|
| `INDEX-000` | `index` | `docs/000-Index.md` | PM |
| `CHARTER-001` | `charter` | `docs/010-Planning/Charter-Repro.md` | PM |
| `ROADMAP-001` | `roadmap` | `docs/010-Planning/Roadmap.md` *(đã tồn tại — sửa)* | PM |
| `RISK-001` | `risk-register` | `docs/010-Planning/Risk-Register.md` | PM |
| `GLOSSARY-001` | `glossary` | `docs/999-Resources/Glossary.md` *(đã tồn tại — sửa)* | PM |
| `BRD-001` | `brd` | `docs/020-Requirements/BRD/BRD-001-Problem-Statement.md` | `business-analyst` |
| `PRD-001` | `prd` | `docs/020-Requirements/PRD-Repro.md` | `business-analyst` |
| `NFR-001` | `nfr` | `docs/020-Requirements/NFR-Repro.md` | `business-analyst` |
| `UC-01` | `use-case` | `docs/020-Requirements/Use-Cases/UC-01-Capture-Failed-Production-Execution.md` | `business-analyst` |
| `UC-02` | `use-case` | `docs/020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md` | `business-analyst` |
| `UC-03` | `use-case` | `docs/020-Requirements/Use-Cases/UC-03-Read-Execution-Diff.md` | `business-analyst` |
| `UC-04` | `use-case` | `docs/020-Requirements/Use-Cases/UC-04-Verify-Fix.md` | `business-analyst` |
| `UC-05` | `use-case` | `docs/020-Requirements/Use-Cases/UC-05-Browse-And-Inspect-Capsules.md` | `business-analyst` |
| `ANALYSIS-001` | `research` | `docs/050-Research/Analysis-Target-Users.md` | `business-analyst` |
| `SDD-001` | `sdd` | `docs/030-Specs/Architecture/SDD-Repro.md` | `architect` |
| `ADR-001` | `adr` | `docs/030-Specs/Architecture/ADR-001-Replay-Execution-Not-Environment.md` | `architect` |
| `ADR-002` | `adr` | `docs/030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md` | `architect` |
| `ADR-003` | `adr` | `docs/030-Specs/Architecture/ADR-003-Database-Record-Replay-Not-Snapshot.md` | `architect` |
| `ADR-004` | `adr` | `docs/030-Specs/Architecture/ADR-004-Record-Replay-External-Inputs-At-Boundary.md` | `architect` |
| `ADR-005` | `adr` | `docs/030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md` | `architect` |
| `ADR-006` | `adr` | `docs/030-Specs/Architecture/ADR-006-Execution-Verification-By-Equivalence.md` | `architect` |
| `ADR-007` | `adr` | `docs/030-Specs/Architecture/ADR-007-In-Process-SDK-Interception.md` | `architect` |
| `ADR-008` | `adr` | `docs/030-Specs/Architecture/ADR-008-Async-Bounded-Failure-Triggered-Capture.md` | `architect` |
| `ADR-009` | `adr` | `docs/030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md` | `architect` |
| `ADR-010` | `adr` | `docs/030-Specs/Architecture/ADR-010-Bounded-Determinism-Scope.md` | `architect` |
| `ADR-011` | `adr` | `docs/030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md` | `architect` |
| `SPEC-SEC-001` | `security-spec` | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | `security-auditor` |

**Frontmatter bắt buộc mọi file** (RULE-001): `id`, `type`, `status: draft`, `created: 2026-08-14`. File đã tồn tại → thêm/bump `updated: 2026-08-14`. Thêm `project: repro` cho mọi file.

**Linking**: **standard markdown link + relative path** — `[Tên](./đường-dẫn.md)`. **KHÔNG dùng wiki-link `[[...]]`** (RULE-001 §Linking Rules, updated 2026-03-03).

## Bốn ràng buộc nội dung áp cho MỌI writer

1. **G4 — hai mâu thuẫn nội tại: ghi trung thực, KHÔNG tự quyết.** Nêu cả hai phía kèm section number, đưa phương án đề xuất, gắn nhãn **"cần anh chốt"**. Cấm im lặng chọn một phía.
   - **M1 — Regression test generation**: §26 đặt ở **V0.2**; nhưng §25 Killer Demo in `✓ Regression case generated`, §30 journey kết ở "Regression test", §31 **North Star Metric** đếm *"converted into regression tests"*. Hệ quả: **North Star Metric của V0.1 không đo được bằng chính V0.1.**
   - **M2 — Access control**: §28 xếp Access control / Retention policies / Team management / Enterprise security vào **commercial layer**, OSS core chỉ có "Basic Self-hosting"; nhưng §20.5 + §21 (cột "MVP?") coi strict access control là **MVP=Yes**. Hệ quả: **bản self-host mà §20.6 khuyến nghị dùng vì lý do bảo mật lại là bản không có control bảo mật.**
2. **Bốn con số này là VÍ DỤ MINH HOẠ, tuyệt đối không được trình bày như KPI/target**: `2,431 / 1,827 / 1,203` bugs/tháng (§31 ghi rõ "Example"); `60–90 giây` (§25, ràng buộc UX cho demo); `Hours/Days → Minutes` (§32, outcome metric không test được); `"within minutes"` (§38.14 — là một **câu hỏi**, không phải cam kết).
3. **Bốn ngưỡng §24** (`≥80%` reproduced, `<5%` latency overhead, `<10MB` capsule, `<30s` replay) — §24 **tự nói** *"These numbers should be treated as initial hypotheses, not final product commitments"*, và §22–23 định vị chúng là metric của **technical spike**. → đi vào mục **Validation Hypotheses**, **KHÔNG** vào Acceptance Criteria.
4. **Unknown lõi: ghi `TBD` + phương án đề xuất gắn nhãn "cần validate" + chỉ rõ nó chặn cái gì.** Cấm viết Decision dứt khoát. Áp đặc biệt cho: định nghĩa "execution path"/"sufficiently equivalent" (§10 — `U-04`/`ACG-01`), query matching identity (`U-02`), "Supported Execution Class" (§20.1 — `ACG-07`).

---

## Hạng mục

| # | Tài liệu | Loại | Đích | Writer | Xong |
|---|---|---|---|---|---|
| 1 | Project Charter (Idea Brief) | charter | `docs/010-Planning/Charter-Repro.md` | PM | [x] |
| 2 | Roadmap (Scope/MVP phasing) | roadmap | `docs/010-Planning/Roadmap.md` | PM | [x] |
| 3 | Risk Register | risk-register | `docs/010-Planning/Risk-Register.md` | PM | [x] |
| 4 | Problem Statement | brd | `docs/020-Requirements/BRD/BRD-001-Problem-Statement.md` | `business-analyst` | [x] |
| 5 | PRD (gồm Scope/MVP) | prd | `docs/020-Requirements/PRD-Repro.md` | `business-analyst` | [x] |
| 6 | NFR | nfr | `docs/020-Requirements/NFR-Repro.md` | `business-analyst` | [x] |
| 7 | Use Cases ×5 | use-case | `docs/020-Requirements/Use-Cases/UC-01..05-*.md` | `business-analyst` | [x] |
| 8 | Target User / Persona | research | `docs/050-Research/Analysis-Target-Users.md` | `business-analyst` → **PM ghi hộ** | [x] |
| 9 | SDD (Technical Design) | sdd | `docs/030-Specs/Architecture/SDD-Repro.md` | `architect` | [x] |
| 10 | ADR ×11 | adr | `docs/030-Specs/Architecture/ADR-001..011-*.md` | `architect` | [x] |
| 11 | Security Spec / Threat Model | security-spec | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | `security-auditor` | [x] |
| 12 | `000-Index.md` | index | `docs/000-Index.md` | PM (close-step) | [x] |
| 13 | Glossary (từ vựng Repro) | glossary | `docs/999-Resources/Glossary.md` | PM (close-step) | [x] |
| 14 | 5 MOC | moc | xem §MOC cần cập nhật | PM (close-step) | [x] |

> **Chú giải trạng thái**: `[x]` xong và đã đối chiếu `FILES_TOUCHED`.
>
> **Toàn bộ 14 hạng mục đã đóng.** Bước 6 verify: `PASS-WITH-WARNINGS`, 1 CRITICAL đã được worker mới sửa và verify lại bằng grep. Chi tiết ở `verdict.md`.

---

## Outline từng tài liệu

### 1. `Charter-Repro.md` — Project Charter (Idea Brief)

- **Độc giả đích**: người quyết định có đầu tư vào Repro hay không. Đọc trong 5 phút để hiểu ý tưởng, vì sao đáng làm, và bước tiếp theo là gì.
- **Cấu trúc** (theo `Template-Project-Charter.md`, giữ 6 H2 + thêm 2):
  - `## 1. Project Information` — Name: Repro. Sponsor/Manager: **`TBD`** (RQ.md không có tên người). Type: Open-source Developer Tool. Status: Concept.
  - `## 2. Business Case` — bài toán "cannot reproduce"; observability trả lời *what happened* nhưng không trả lời *can I replay it*; one-liner §35; tagline §36; positioning §29.
  - `## 3. Project Objectives` — Key Hypothesis §37 nguyên văn; North Star §31 **kèm cảnh báo M1**.
  - `## 4. High-Level Requirements` — Capture → Replay → Verify (§20.15 product boundary); 6 CLI verb §18.
  - `## 5. Stakeholders` — 3 nhóm target user, **theo phân cấp E10** (Engineer primary / SRE secondary / QA activated at V0.2), nói rõ vì sao.
  - `## 6. Assumptions & Constraints` — product principles §33 (7 mục); guardrail §20.15; narrow stack §18.
  - `## 7. Recommended Next Step` — technical spike §39 + §22 trước MVP; điều kiện xem xét lại sản phẩm §24.
  - `## 8. Related Documents` — link tới PRD, SDD, Risk-Register, Roadmap.
- **Nguồn sự thật**: `RQ.md` §1, §18, §20.15, §22, §24, §29, §31, §33, §35, §36, §37, §39, §40. Phân cấp persona: `findings/business-analyst.md` §PM đọc được gì mục 2.
- **Tiêu chí xong**: 8 H2 đủ; Sponsor/Manager ghi `TBD` chứ không bịa tên; có cảnh báo M1 ở §3; 4 link markdown phân giải được.

### 2. `Roadmap.md` — Scope/MVP phasing *(sửa file đang là stub)*

- **Độc giả đích**: người cần biết cái gì làm ở phase nào và vì sao.
- **Cấu trúc**:
  - `## Nguyên tắc phân phase` — §33.7 "Narrow before broad"; §20.15 product boundary.
  - `## Phase 0 — Technical Spike` (trước V0.1) — §22 test app + 10 scenario + quy trình 7 bước (có bước **"Destroy original environment"** — đây là bước chứng minh tính portable của capsule, phải giữ); §23 metric; §24 ngưỡng **gắn nhãn "initial hypotheses"**; §39 gate.
  - `## V0.1 — Validate the Core` — §26 V0.1 (10 mục) + §18 MVP capabilities. Ghi rõ **E1**: Redis **không** thuộc V0.1 (§18/§26 thắng sơ đồ §5/§17).
  - `## V0.2 — Developer Workflow` — §26 V0.2 (7 mục). **Đánh dấu M1** tại "Regression test generation".
  - `## V0.3 — Distributed Systems` — §26 V0.3 (7 mục).
  - `## Future` — §26 Future (7 mục) + `--checkout` (§15) + minimal DB snapshot (§11).
  - `## Non-Goals của V0.1` — §19 (11 mục), phân biệt *hoãn* với *loại vĩnh viễn* (§19 environment cloning trái §33.1/§40 ⇒ loại vĩnh viễn).
  - `## Related Documents`
- **Nguồn sự thật**: `RQ.md` §11, §15, §18, §19, §22, §23, §24, §26, §33.7, §39.
- **Tiêu chí xong**: 4 phase + Future + Non-Goals đủ; mọi mục có section nguồn; `updated: 2026-08-14` đã bump; M1 và E1 được đánh dấu.

### 3. `Risk-Register.md`

- **Độc giả đích**: người cần biết cái gì có thể làm sản phẩm thất bại và đang được xử lý thế nào.
- **Cấu trúc** (theo `Template-Risk-Register.md`):
  - `## 1. Risk Matrix Overview` — thang của RQ.md (🔴 Critical / 🟠 High / 🟡 Medium) + cột "MVP?"; giải thích ý nghĩa cột MVP theo **E2**.
  - `## 2. Risk Log` — bảng 18 risk từ §21, đối chiếu với §20.1–§20.17. Cột: `ID (R-01..R-18) | Risk | Severity | MVP? | Mitigation | Nguồn §`. **Giữ nguyên severity và cột MVP? của §21, không tự đánh giá lại.**
  - `## 3. Risk phát sinh từ threat model` — 11 threat mà **RQ.md không có mitigation** (`THREAT-004, 005, 006, 007, 008, 009, 011, 013, 016, 018, 019`), mỗi dòng link tới Security Spec. Đánh dấu rõ đây là **risk mới, không có trong §21**.
  - `## 4. Mâu thuẫn nội tại của tài liệu gốc` — M1, M2, `I-01` Redis, `I-03` P95, `I-04` lazy loading. **Đây là một loại risk thật**: tài liệu gốc tự nói ngược thì mọi thứ dẫn xuất đều lệch.
  - `## 5. Related Documents`
- **Nguồn sự thật**: `RQ.md` §20 (17 mục), §21 (bảng 18 dòng). Mục 3: `findings/security-auditor.md`. Mục 4: `findings/architect.md` §I-01..I-04 + `findings/business-analyst.md` §B-A.
- **Tiêu chí xong**: đủ 18 risk của §21 với severity/MVP nguyên bản; 11 threat mới; 5 mâu thuẫn; `Owner` ghi `TBD` (RQ.md không có tên người).

---

### 4. `BRD-001-Problem-Statement.md`

- **Độc giả đích**: mọi người cần hiểu **vấn đề** trước khi đọc giải pháp. Là tài liệu được PRD/SDD trích dẫn.
- **Cấu trúc**:
  - `## 1. Vấn đề` — "A bug happens in production, but nobody can reproduce it locally" (§1); ví dụ incident §2.1 (`ERROR #1842`); 9 câu hỏi developer phải tự trả lời (§2.1); debugging loop kết thúc bằng **"Hope"** (§2.1, §30).
  - `## 2. Vì sao observability không đủ` — §3: observability trả lời *what happened*, không trả lời *can I make the same execution happen again*.
  - `## 3. Vì sao clone production không khả thi` — §4: bảng đối chiếu prod (K8s, 20 replicas, PG cluster, Redis, Kafka, external API, cloud, flags, secrets) vs local (Docker, 1 API, local PG, local Redis, mock); §14 microservices.
  - `## 4. Chi phí hiện tại` — §32 Time to Reproduce. **Cảnh báo bắt buộc**: "Hours/Days" là claim **không có nguồn** trong RQ.md (repo không có user research) → gắn nhãn hypothesis.
  - `## 5. Insight nền tảng` — §4/§33.1: *"Capture the execution, not the environment"*; §40 product thesis.
  - `## 6. Phạm vi vấn đề KHÔNG bao gồm` — §20.1 hidden inputs (9 loại); §20.13 race condition; §20.16 replay thành công không chứng minh bug đã hết.
  - `## 7. Open Questions` — §38 Q1, Q2, Q3, Q7 (validation questions chưa có đáp án).
  - `## 8. Related Documents` — `[PRD-Repro](../PRD-Repro.md)`, `[Charter-Repro](../../010-Planning/Charter-Repro.md)`.
- **Nguồn sự thật**: `RQ.md` §1, §2.1, §3, §4, §14, §20.1, §20.13, §20.16, §30, §32, §33.1, §38, §40.
- **Tiêu chí xong**: 8 H2; §6 tồn tại (nêu giới hạn của chính vấn đề, không chỉ khuếch đại nó); "Hours/Days" có nhãn hypothesis; 2 link phân giải được.

### 5. `PRD-Repro.md` — tài liệu trung tâm

- **Độc giả đích**: người xây sản phẩm. Là tài liệu được Epic/Story dẫn xuất từ đó về sau.
- **Cấu trúc** (theo `Template-PRD.md`, giữ 7 H2 + thêm 4):
  - `## 1. Executive Summary` — §1 + one-liner §35.
  - `## 2. Background & Objectives` — Problem Statement (link `./BRD/BRD-001-Problem-Statement.md`); Goals từ §37 Key Hypothesis; **`### Non-Goals`** = §19 (11 mục) + **E5** (không có manual recording ở V0.1).
  - `## 3. Scope / MVP` ← **đây là hạng mục "Scope / MVP" anh yêu cầu**
    - `### 3.1 Target stack` — §18: Node.js + PostgreSQL + HTTP. **E6**: §38 Q4 coi như đã được §18 trả lời, không để lơ lửng.
    - `### 3.2 In scope V0.1` — nhóm Capture / Replay / Analysis / CLI theo §18.
    - `### 3.3 Out of scope V0.1` — §19, phân biệt hoãn vs loại vĩnh viễn.
    - `### 3.4 Diễn giải §18 vs §21` — **E2** tường minh: §18 là danh sách *core replay loop*, §21 cột "MVP?" là nguồn có thẩm quyền cho capability phi chức năng (redaction, encryption, retention, audit, self-hosting đều MVP=Yes). Nói rõ đây là **diễn giải của PM để hai section tương thích**, không phải RQ.md nói thẳng.
    - `### 3.5 Redis` — **E1**: ngoài V0.1. Ghi rõ §5/§17 có Redis nhưng §18/§26 không.
  - `## 4. Target Audience` — tóm 3 persona theo **E10**, link `../050-Research/Analysis-Target-Users.md`.
  - `## 5. Functional Requirements` — bảng `FR-001`…`FR-055` (nhóm In-MVP) từ `findings/business-analyst.md`. Cột: `ID | Yêu cầu | Nhóm | Nguồn § | Ưu tiên`. Nhóm Post-MVP `FR-056`…`FR-082` để ở phụ lục hoặc trỏ sang Roadmap.
  - `## 6. Non-Functional Requirements` — **không nhắc lại**, link `./NFR-Repro.md`; chỉ nêu 3–5 ràng buộc quan trọng nhất.
  - `## 7. User Flows & UX Requirements` — journey §8 (5 bước) + §30 (without/with Repro) + §25 Killer Demo; link 5 UC.
  - `## 8. Success Metrics` — §31 North Star + §32 supporting metrics. **BẮT BUỘC có cảnh báo M1**: North Star đếm regression conversion mà tính năng đó ở V0.2 (§26) ⇒ **không đo được ở V0.1**; đề xuất metric tạm cho V0.1 (số bug đạt trạng thái *Execution matched*), gắn nhãn **"cần anh chốt"**. **Không** đưa `2,431/1,827/1,203` vào như target.
  - `## 9. Validation Hypotheses` — 4 ngưỡng §24 + metric §23, gắn nhãn nguyên văn *"initial hypotheses, not final product commitments"*. **Tách khỏi mục 5/6 để không ai đọc thành cam kết.**
  - `## 10. Open Questions` — §38 phân loại: đã được RQ.md trả lời (Q4); PM chốt kèm neo (Q5, Q6, Q9, Q10–12); còn mở (Q1–3, Q7–8, Q13–16). **Cộng M1, M2 kèm nhãn "cần anh chốt".** Cộng `ACG-07` (Supported Execution Class chưa định nghĩa) và `U-06` (Capsule Store chưa đặc tả — ảnh hưởng ước lượng MVP).
  - `## 11. Related Documents`
- **Nguồn sự thật**: `RQ.md` §1, §8, §18, §19, §23, §24, §25, §30, §31, §32, §35, §37, §38 + `findings/business-analyst.md` (FR inventory, ACG) + `findings/architect.md` (I-01..I-04, U-06) + `findings/security-auditor.md` (32 MUST-V0.1).
- **Tiêu chí xong**: 11 H2; FR-001..055 đủ với section nguồn từng dòng; mục 8 có cảnh báo M1; mục 9 tách khỏi AC; mục 10 có M1+M2 gắn nhãn "cần anh chốt"; **không** con số minh hoạ nào bị dùng như KPI.

### 6. `NFR-Repro.md`

- **Độc giả đích**: architect và QA — người cần con số để thiết kế và để test.
- **Cấu trúc**:
  - `## 1. Cách đọc tài liệu này` — **cảnh báo đặt ngay đầu**: 4 ngưỡng §24 là *initial hypotheses* của technical spike, **không** phải cam kết sản phẩm.
  - `## 2. Ngưỡng validation cho technical spike` — `N-01`…`N-04` (§24). Với `N-01` phải ghi rõ **denominator chưa xác định** (§22 có 10 scenario nhưng §20.2/§20.13 đã hoãn scenario 7/9/10 ⇒ 80% trên 10 hay trên 7?) và **"reproduced" chưa rõ là replay success hay execution match** — §23 phân biệt hai metric này.
  - `## 3. Metric §23 yêu cầu đo nhưng KHÔNG có ngưỡng` — `N-05`…`N-09`. Nhấn `N-05` (Execution Match Rate): §20.3/§21 xếp false replay equivalence là **Critical** nhưng chính chỉ số đo nó **không có ngưỡng**. `N-09` P95 = **E4**, ngưỡng `TBD`, không bịa số.
  - `## 4. Ràng buộc phi chức năng định tính` — `N-10`…`N-19`.
  - `## 5. Yêu cầu bảo mật` — **không nhắc lại 43 SEC**, link `../030-Specs/Security/Spec-Security-Repro-Threat-Model.md`, chỉ nêu 4 thay đổi mặc định (fail-closed; allowlist cho env + replay egress; verify capsule trước khi parse; authn/authz+audit+crypto-shred trong OSS core — **kèm M2**).
  - `## 6. Con số trong RQ.md KHÔNG phải NFR` — 5 mục: `2,431/1,827/1,203` (§31 "Example"), `60–90s` (§25 UX), `Hours/Days→Minutes` (§32 outcome), `"within minutes"` (§38.14 là câu hỏi), OSS adoption metric (§32). **Mục này tồn tại để chặn lỗi tái diễn.**
  - `## 7. Acceptance criteria gaps` — `ACG-01`…`ACG-12`, mỗi mục: phát biểu không đo được | vì sao | cần thêm gì.
  - `## 8. Related Documents`
- **Nguồn sự thật**: `RQ.md` §16, §20.5, §20.7, §20.12, §20.17, §23, §24, §25, §31, §32, §38 + `findings/architect.md` (N-01..N-19) + `findings/business-analyst.md` (ACG-01..12) + `findings/security-auditor.md`.
- **Tiêu chí xong**: 8 H2; mục 1 là cảnh báo; mục 6 đủ 5 con số bị loại; mục 7 đủ 12 ACG; `N-09` là `TBD` chứ không phải số bịa.

### 7. Use Cases ×5

**Khung chung mọi UC**: `## 1. Mục tiêu` · `## 2. Actor` · `## 3. Trigger` · `## 4. Preconditions` · `## 5. Main success flow` (bước đánh số) · `## 6. Alternative / Exception flows` (đánh `A1`, `A2`…) · `## 7. Postconditions` · `## 8. FR bao phủ` · `## 9. Related Documents` (link `../PRD-Repro.md` + UC liên quan).

Nội dung chi tiết từng UC lấy **nguyên** từ `findings/business-analyst.md` §Phần 2 (đã có main flow đánh số + 4–6 exception flow + pre/postcondition + FR mapping cho cả 5 UC).

- **`UC-01`** Capture failed production execution — actor SRE/DevOps hoặc Engineer sở hữu service. Trigger: **E5** (chỉ failed execution). Main flow 9 bước. Exception `A1` capsule vượt size limit, `A2` buffer đầy/vượt sampling, `A3` hidden input (§20.1), `A4` redaction miss. Nguồn: §5, §6, §8, §16, §17, §18, §20.1, §20.7, §20.12, §20.14.
- **`UC-02`** Replay capsule locally — actor Engineer. Main flow 11 bước. Exception `A1` code mismatch (§15), `A2` schema drift (§20.9), `A3` execution diverged → UC-03, `A4` replay completed nhưng không tương đương (§20.3), `A5` **capsule thiếu input → E9** (divergence + incomplete capture, KHÔNG fallback gọi hệ thống thật), `A6` capsule truncate. Nguồn: §8, §10, §11, §12, §13, §14, §15, §18, §20.3, §20.4, §20.9.
- **`UC-03`** Read execution diff — actor Engineer. Trigger: replay diverged. Main flow 5 bước theo format §9 (đánh số divergence, nhóm theo loại input, cặp Production/Local). Exception `A1` divergence do code mismatch, `A2` do schema drift, `A3` do external dependency drift (§20.10), `A4` **không phát hiện được divergence nhưng bug vẫn không xảy ra** → ngờ hidden input (§20.1) hoặc non-determinism (§20.2); hành vi `TBD`, và ghi rõ **đây là case tệ nhất cho user trust**. Nguồn: §9, §10, §18, §20.1, §20.2, §20.8, §20.9, §20.10.
- **`UC-04`** Verify fix — actor Engineer. Main flow 5 bước. **Bắt buộc** dùng ngôn từ §20.16 (`✓ Captured execution no longer reproduces`, **không** `Production bug is definitely fixed`). Exception `A1` fix không hiệu quả, `A2` fix làm execution diverge thay vì fix bug, `A3` code mismatch với baseline, `A4` bug là race condition (§20.13) ⇒ verify pass nhưng bug production còn. Postcondition: regression case **là Post-MVP V0.2 — đánh dấu M1**. Nguồn: §8, §18, §20.3, §20.13, §20.16, §25, §26.
- **`UC-05`** Browse and inspect capsules — actor Engineer + QA. Main flow 4 bước. Exception `A1` không có quyền (**M2**), `A2` hết retention, `A3` encrypted không có key, `A4` field đã redact phải hiển thị **"đã redact"** chứ không hiện rỗng gây hiểu sai (§33.5 "Determinism over magic"). Nguồn: §6, §16, §18, §20.5, §20.17, §33.5.

**Ràng buộc**: mỗi UC phải có **≥1 exception flow** — RQ.md mô tả rất nhiều happy path, và UC chỉ có happy path là UC vô dụng. Chỗ nào RQ.md không định nghĩa hành vi → ghi `TBD` và nói rõ thiếu nguồn.

### 8. `Analysis-Target-Users.md` — Persona

- **Độc giả đích**: người cần biết viết sản phẩm cho ai, và **mức độ tin cậy** của hiểu biết đó.
- **Cấu trúc**:
  - `## 1. Mức độ bằng chứng — đọc trước` — **BẮT BUỘC là mục đầu tiên.** `RQ.md` **không có** section "Target users"; ba nhóm chỉ xuất hiện ở **dòng 7 frontmatter**. PM đã grep xác minh: "QA" và "SRE" xuất hiện **duy nhất 1 lần** (dòng 7); "developer" 34 lần. Repo **không có** user interview / survey / số liệu thị trường. ⇒ Đây là **hypothesis persona chưa validated**. Điều kiện nâng cấp: §38 Q1, Q2, Q13.
  - `## 2. Phân cấp persona` — **E10**: Engineer **primary**; SRE/DevOps **secondary** (capture-side owner); QA **activated at V0.2** kèm lý do (toàn bộ nội dung QA neo vào regression test = Post-MVP, xem M1).
  - `## 3. Persona A — Software Engineer` — bảng: `Thuộc tính | Nội dung | Nguồn § | stated/inferred`. Mục: jobs-to-be-done, pain hiện tại, trigger, tiêu chí thành công, CLI dùng, anti-pattern cần tránh (§20.14 "Another observability SDK" / "complicated to install").
  - `## 4. Persona B — SRE / DevOps` — cùng khung. Neo vào §16, §20.5, §20.6, §20.7, §20.17, §28. **Ghi rõ `GAP-04`**: SRE có `FR-023` (retention) và `FR-024` (audit log) mà **không có lệnh CLI nào để thực hiện** — §18 cả 6 lệnh đều developer-side.
  - `## 5. Persona C — QA Engineer` — cùng khung, **ghi thẳng đây là persona mỏng nhất**, gần như toàn bộ `inferred`, và **chưa có giá trị ở V0.1**.
  - `## 6. Điều chúng ta KHÔNG biết` — không có demographic, không quy mô team, không industry, không số liệu hành vi. **Mục này bắt buộc tồn tại** để không ai đọc tài liệu này như kết quả nghiên cứu.
  - `## 7. Related Documents`
- **Nguồn sự thật**: `RQ.md` dòng 7 + §2.1, §3, §4, §8, §9, §14, §16, §18, §20.5, §20.6, §20.7, §20.14, §20.16, §20.17, §25, §28, §30, §31, §32, §37, §38 + `findings/business-analyst.md` §Phần 3.
- **Tiêu chí xong**: mục 1 và mục 6 tồn tại; **mọi** dòng thuộc tính có nhãn `stated` hoặc `inferred`; **không** một demographic/tên/tuổi/công ty/con số nào không có trong RQ.md.

---

### 9. `SDD-Repro.md` — Technical Design

- **Độc giả đích**: người sẽ hiện thực. Phải phân biệt được *đã quyết* / *đề xuất cần validate* / *chưa biết*.
- **Cấu trúc**: giữ **7 mục chính của `Template-SDD.md`** làm xương sống *(hiệu chỉnh sau audit: template gọi chúng là H1, nhưng cấu trúc chuẩn dưới đây dùng `##` — SDD phải theo **cấu trúc dưới đây**, tức 1 H1 tiêu đề + 9 H2)*, lồng H2 theo `findings/architect.md` §Phần 2 (47 H2 đã có nội dung + section nguồn từng heading). Ánh xạ template: §4 "Data Schema & Persistence" → **Capsule format** (V0.1 không có application DB); §5 "API Design" → **CLI contract + SDK surface + Capsule Store API**.
  - `## 1. Overview` — 1.1 purpose (thiết kế **trước** hiện thực, `src/` rỗng) · 1.2 product thesis · 1.3 architectural drivers (§20/§21) · 1.4 ubiquitous language · 1.5 out of scope + guardrails (§19, §20.15, §33.7) · 1.6 decision index ADR-001..011.
  - `## 2. Architecture Diagram` — 2.1 context (§3, §34, §29) · 2.2 component, vẽ lại §17 bằng Mermaid · 2.3 capture flow · 2.4 replay flow · 2.5 verification flow · 2.6 diff flow · 2.7 trust boundary + deployment.
  - `## 3. Component Design` — 3.1 SDK/Recorder · 3.2 interception layer (DB/outbound HTTP/inbound HTTP/clock/feature flag; **E1** Redis ngoài V0.1) · 3.3 capture pipeline (**`U-09` nghịch lý capture trigger — phải nêu thẳng**) · 3.4 redaction stage (**`U-15`** trade-off fidelity ↔ privacy) · 3.5 capsule writer · 3.6 capsule store (**`U-06`/E8** Decision mức tối thiểu + `TBD` API/auth) · 3.7 replay runtime (**`U-11`/E9** unmatched interaction policy; **`U-19`** library vs process wrapper) · 3.8 local execution recorder · 3.9 verification engine (**`U-04` — TBD lõi**) · 3.10 diff engine (**`U-10`** diff mode có gọi dependency thật?) · 3.11 drift detector (**`U-16`** phân tầng warning, `U-17` nguồn schema version) · 3.12 CLI (**`U-21`** exit code + `--json`) · 3.13 extension seams.
  - `## 4. Data Schema & Persistence → Capsule Format` — 4.1 layout (§6) · 4.2 manifest + **format version (`U-05` — phải có từ v1)** · 4.3 request/environment/feature-flags/metadata · 4.4 `database/query-NNN.json` + **query identity (`U-02` — TBD, rủi ro hiện thực cao nhất)** · 4.5 `network/*.json` · 4.6 execution trace representation (`U-04`) · 4.7 size management (**E3** self-contained là bất biến; `U-18` hành vi khi vượt limit) · 4.8 capsule identity (**`U-07`** ID vs trace ID; `U-22` multi-service) · 4.9 encryption at rest (**E12** crypto-shred, nhãn "cần validate").
  - `## 5. API Design` — 5.1 SDK surface · 5.2 CLI contract (6 verb §18) · 5.3 result semantics (**§20.16 bắt buộc**; `U-08` verify vs replay cần hai bộ tiêu chí equivalence khác nhau) · 5.4 capsule store API (`TBD`) · 5.5 future surface.
  - `## 6. Infrastructure & Deployment` — 6.1 self-hosted topology (**E7**) · 6.2 production-side + overhead budget · 6.3 local dev environment · 6.4 replay boundary microservices (**E5** Q9) · 6.5 CI integration V0.2 · 6.6 OSS core vs commercial packaging (**M2**).
  - `## 7. Security & Compliance` — 7.1 trust boundary (link Security Spec, **không nhắc lại**) · 7.2 redaction hooks + `U-15` · 7.3 default-deny write (**`U-12`** fail-closed) · 7.4 retention/deletion/audit/residency hooks + **E12** · 7.5 compliance-driven constraints.
  - `## 8. Appendices` — 8.1 link `../../020-Requirements/NFR-Repro.md` · 8.2 technical spike plan (§22 + §39) · 8.3 **TBD register: `U-01`…`U-23`** kèm cái bị chặn và disposition CHỐT/TBD/SPIKE · 8.4 risk → mitigation traceability (§21 ↔ component/ADR).
  - `## 9. Related Documents`
- **Nguồn sự thật**: `RQ.md` toàn bộ + `findings/architect.md` (D-01..D-32, U-01..U-23, SDD skeleton) + `findings/security-auditor.md` (§7) + `run-plan.md` §Assumptions (E1–E12).
- **Tiêu chí xong**: đủ 7 mục chính của template + §8/§9 *(tổng 9 H2)*; §8.3 TBD register có đủ 23 unknown *(→ **25** sau khi sửa lỗi CRITICAL C1: thêm `U-24`, `U-25` — xem `verdict.md`)*; **`U-04` và `U-02` được ghi là TBD kèm phương án "cần validate", KHÔNG viết như đã chốt**; §7 link Security Spec chứ không copy bộ requirement `SEC-*`; mọi H2 có section nguồn.

### 10. ADR ×11

**Khung chung mọi ADR**:
```
---
id: ADR-0NN
type: adr
status: draft
project: repro
created: 2026-08-14
---

# ADR-0NN: <Title>

**Decision status**: Proposed
**Related to**: [SDD-Repro](./SDD-Repro.md)

## Context
## Decision
## Alternatives considered
## Consequences
### Positive
### Negative
## Open items (TBD)
## Related Documents
```

**Ràng buộc riêng ADR:**
- `Decision status: Proposed` — **không phải Accepted**. Chưa có ai duyệt thật (`brief.md` A2, A6).
- `## Alternatives considered`: mỗi alternative phải ghi **`[stated]`** (RQ.md nêu và loại tường minh, kèm §) hoặc **`[inferred]`** (suy ra). Đây là chỗ ADR thường bịa nhất.
- `## Consequences ### Negative`: **bắt buộc không rỗng**, và phải gồm cả phần §20 tự thừa nhận. ADR không có hệ quả tiêu cực là ADR chưa suy nghĩ.
- `## Open items (TBD)`: có unknown thì phải liệt kê, kèm cái nó chặn.

Nội dung từng ADR lấy từ `findings/architect.md` §Phần 1 (mỗi `D-xx` đã có Context / Alternatives `[stated]`+`[inferred]` / Consequences / mức nền tảng):

| ADR | Decision phủ | Unknown phải khai trong §Open items |
|---|---|---|
| `ADR-001` Replay execution, not environment | `D-01` (+`D-19` làm tiêu chí đánh giá alternatives) | — |
| `ADR-002` Repro Capsule format contract | `D-02`, `D-03`, `D-26`, `D-27` | `U-05` versioning, `U-07` ID scheme, `U-18` vượt size limit, `U-22` multi-service, `U-23` language-agnostic, `E3` (I-04), **`SEC-027` capsule integrity — manifest phải có chỗ chứa hash/signature từ v1**, `E12` crypto-shred |
| `ADR-003` DB record/replay, not snapshot | `D-04` (+`D-24` nhắc) | **`U-02` query matching identity**, `U-01` cơ chế intercept pg, `U-11` unmatched interaction |
| `ADR-004` Record/replay external inputs at boundary | `D-05`, `D-29` | `U-03` intercept HTTP (outbound + **inbound**), `U-14` feature flag surface |
| `ADR-005` Default-deny write side effects | `D-06` | **`U-12` phân loại READ/WRITE — fail-closed** (`SEC-032`/`SEC-033` xác nhận chéo), write chưa record thì trả gì |
| `ADR-006` Execution verification by equivalence | `D-07`, `D-18` | **`U-04` định nghĩa execution path — TBD lõi**, `U-08` verify vs replay hai bộ tiêu chí, `U-20` async ordering, `N-05` không có ngưỡng |
| `ADR-007` In-process SDK interception | `D-09` | `U-01`, `U-03`, `U-19`; compatibility matrix là nợ vĩnh viễn (§21) |
| `ADR-008` Async/bounded/failure-triggered capture | `D-11` | **`U-09` nghịch lý capture trigger**; §38 Q5 (E5) |
| `ADR-009` Private self-hosted topology | `D-12`, `D-13` (placement), `D-27` (store) | **`U-06` Capsule Store chưa đặc tả (E8, mức tối thiểu + TBD API/auth)**, `E7`, **`M2`** |
| `ADR-010` Bounded determinism scope | `D-10` | `U-13` clock freeze vs virtual clock, `U-20` async-trong-một-execution **là trong phạm vi** (phân biệt với race condition đã hoãn), "UUID where practical" (`ACG-06`) |
| `ADR-011` Execution Diff first-class | `D-08` | **`U-10` diff mode có gọi dependency thật?** Nếu có thì `ADR-005` default-deny **phải áp cả mode này**, không thì là lỗ hổng side-effect |

- **Nguồn sự thật**: `findings/architect.md` §Phần 1 (D-01..D-32) + `RQ.md` section được trích trong đó + `findings/security-auditor.md` cho ADR-002/005/009.
- **Tiêu chí xong**: 11 file; mọi file có `Decision status: Proposed`; mọi alternative có nhãn `[stated]`/`[inferred]` + §; `### Negative` không rỗng; `## Open items` khớp bảng trên; `Related to` link `./SDD-Repro.md` phân giải được.

---

### 11. `Spec-Security-Repro-Threat-Model.md`

- **Độc giả đích**: architect, SRE, và người phải trả lời câu hỏi compliance của khách hàng.
- **Cấu trúc**:
  - `## 1. Phạm vi và giới hạn` — đây là threat model của **một thiết kế**, không phải code audit (`src/` rỗng). Không cấp trạng thái tuân thủ cho tổ chức nào. Kết luận pháp lý cần pháp chế xác nhận.
  - `## 2. Asset inventory` — `A-01`…`A-13`.
  - `## 3. Trust boundary` — `TB-1`…`TB-6` dạng sơ đồ text (4 zone). **Nêu rõ hai kết luận phân biệt**: `TB-2` (redaction gate) = **control point quan trọng nhất**; `TB-4` (storage → laptop) = **boundary nguy hiểm nhất**, với 5 lý do — nhấn **tính bất khả hồi** và việc nó **bị vượt qua trên happy path** (`repro pull` *là* tính năng, nên rủi ro tăng tuyến tính theo adoption).
  - `## 4. Threat model` — `THREAT-001`…`THREAT-019`, khung **STRIDE per-boundary**. Mỗi threat: ID | STRIDE + boundary | asset | attacker model (`AM-1`…`AM-10`) | impact | likelihood | **mitigation RQ.md đã có (kèm §)** | **residual risk** | mitigation bổ sung. **Đánh dấu rõ 11 threat mà RQ.md hoàn toàn không có mitigation.** **Không** gán điểm CVSS (chưa có implementation ⇒ gán số là bịa độ chính xác).
  - `## 5. Default redaction list` — 5 nhóm (HTTP header / HTTP body field / DB column pattern / environment variable / external API response field) × 6 chiến lược (`NEVER-STORE` / `DROP` / `REPLACE-FIXED` / `HMAC-HASH` / `PSEUDONYMIZE` / `MARK`). Nêu **hai đảo chiều bắt buộc so với §16**: env dùng **allowlist** (deny-by-default), free-text **mặc định drop**.
  - `## 6. Căng thẳng privacy ↔ replay fidelity` — `DROP` làm đổi code path ⇒ tạo bug giả hoặc che bug thật; mặc định phải **giữ hình dạng**; và **cách redaction thực sự thất bại trong đời thực là bị người dùng vô hiệu hoá, không phải bị bypass kỹ thuật** ⇒ `SEC-048` (diff phải phân biệt "diverged vì redaction"). **Xác nhận chéo với `U-15`** của architect lens.
  - `## 7. Giới hạn của redaction dựa-trên-danh-sách` — 11 nhóm nó **về nguyên tắc không thể** bắt được. Kết luận bắt buộc: **redaction là hygiene control, KHÔNG phải containment boundary.** Không được làm mềm câu này.
  - `## 8. Ràng buộc tuân thủ` — GDPR / HIPAA / PCI DSS / SOC 2, mỗi khung nêu **ràng buộc cụ thể lên capsule và lifecycle** (không mô tả chung về khung). Bắt buộc nêu **GDPR right-to-erasure là mâu thuẫn thiết kế thật** (capsule bất biến đã copy xuống N laptop) và crypto-shred là cơ chế duy nhất biến `TB-4` thành khả hồi — kèm đánh đổi (mất replay offline) và nhãn **"cần validate"** (`E12`).
  - `## 9. Yêu cầu bảo mật cho MVP` — `SEC-001`…`SEC-048` dạng **given/then**, nhóm A–I, phân loại MUST-V0.1 / SHOULD / DEFER.
  - `## 10. Mâu thuẫn cần anh chốt` — **`M2`**: §28 xếp Access control / Retention / Audit / Enterprise security vào commercial layer, §20.5+§21 coi là MVP=Yes ⇒ bản self-host mà §20.6 khuyến nghị vì bảo mật lại là bản không có control bảo mật. Nêu **cả hai phía kèm §**, đưa khuyến nghị (authn/authz/audit vào OSS core) gắn nhãn **"cần anh chốt"**. **Cấm** viết dứt khoát.
  - `## 11. Ba mục TBD` — TTL mặc định (cần PM + pháp chế; chỉ khẳng định *phải hữu hạn*), row/byte cap (cần số liệu spike §22), key server-side vs replay offline (cần architect).
  - `## 12. Related Documents`
- **Nguồn sự thật**: `RQ.md` §6, §12, §13, §15, §16, §18, §20.4, §20.5, §20.6, §20.7, §20.12, §20.17, §25, §26, §27, §28 + `findings/security-auditor.md` (toàn bộ).
- **Tiêu chí xong**: 12 H2; 19 threat với residual risk từng mục; 11 threat không-có-mitigation được đánh dấu; **43 requirement** dạng given/then trên không gian ID `SEC-001`…`SEC-048` *(43 ID được cấp + 5 ID để trống có chủ đích: `SEC-014, 026, 031, 041, 046` — để tài liệu khác trích dẫn không bị dịch số)*; mục 7 và mục 10 tồn tại và không bị làm mềm; mọi khẳng định về RQ.md có nhãn `[stated]`/`[inferred]`.

---

## Wiki-link phải tạo

> **Quy ước: standard markdown link + relative path** (RULE-001 §Linking Rules). **KHÔNG** wiki-link.

| Từ | Tới | Relative path | Quan hệ |
|---|---|---|---|
| `PRD-Repro.md` | `BRD-001-Problem-Statement.md` | `./BRD/BRD-001-Problem-Statement.md` | Problem source |
| `PRD-Repro.md` | `NFR-Repro.md` | `./NFR-Repro.md` | NFR detail |
| `PRD-Repro.md` | `Analysis-Target-Users.md` | `../050-Research/Analysis-Target-Users.md` | Persona |
| `PRD-Repro.md` | `UC-01..05` | `./Use-Cases/UC-0N-*.md` | User flows |
| `PRD-Repro.md` | `SDD-Repro.md` | `../030-Specs/Architecture/SDD-Repro.md` | Technical design |
| `PRD-Repro.md` | `Roadmap.md` | `../010-Planning/Roadmap.md` | Phasing |
| `BRD-001-*.md` | `PRD-Repro.md` | `../PRD-Repro.md` | Implemented by |
| `BRD-001-*.md` | `Charter-Repro.md` | `../../010-Planning/Charter-Repro.md` | Parent |
| `UC-0N-*.md` | `PRD-Repro.md` | `../PRD-Repro.md` | Part of |
| `UC-02` | `UC-03`, `UC-04` | `./UC-03-Read-Execution-Diff.md`, `./UC-04-Verify-Fix.md` | Next flow |
| `NFR-Repro.md` | `Spec-Security-*.md` | `../030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | Security detail |
| `NFR-Repro.md` | `PRD-Repro.md` | `./PRD-Repro.md` | Parent |
| `Analysis-Target-Users.md` | `PRD-Repro.md` | `../020-Requirements/PRD-Repro.md` | Informs |
| `SDD-Repro.md` | `PRD-Repro.md` | `../../020-Requirements/PRD-Repro.md` | Implements |
| `SDD-Repro.md` | `NFR-Repro.md` | `../../020-Requirements/NFR-Repro.md` | NFR |
| `SDD-Repro.md` | `Spec-Security-*.md` | `../Security/Spec-Security-Repro-Threat-Model.md` | Security |
| `SDD-Repro.md` | `ADR-001..011` | `./ADR-0NN-*.md` | Decision index |
| `ADR-0NN-*.md` | `SDD-Repro.md` | `./SDD-Repro.md` | Related to |
| `Spec-Security-*.md` | `SDD-Repro.md` | `../Architecture/SDD-Repro.md` | Related to |
| `Spec-Security-*.md` | `Risk-Register.md` | `../../010-Planning/Risk-Register.md` | Risk |
| `Charter-Repro.md` | `PRD-Repro.md`, `SDD-Repro.md`, `Risk-Register.md`, `Roadmap.md` | `../020-Requirements/PRD-Repro.md`, `../030-Specs/Architecture/SDD-Repro.md`, `./Risk-Register.md`, `./Roadmap.md` | Children |
| `Risk-Register.md` | `Spec-Security-*.md` | `../030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | Threat detail |
| `Roadmap.md` | `PRD-Repro.md`, `Charter-Repro.md` | `../020-Requirements/PRD-Repro.md`, `./Charter-Repro.md` | Context |

## MOC cần cập nhật (PM độc quyền, close-step)

| MOC | Mục thêm/sửa |
|---|---|
| `docs/000-Index.md` | **TẠO MỚI** — RULE-001 quy định BẮT BUỘC nhưng chưa tồn tại. Trỏ tới 11 MOC + các tài liệu lớn (Charter, PRD, SDD, Roadmap, Risk-Register). |
| `docs/010-Planning/Planning-MOC.md` | Thêm `Charter-Repro.md`, `Risk-Register.md`. Ghi rõ `OKRs.md` **cố ý giữ stub** kèm lý do. Bump `updated`. |
| `docs/020-Requirements/Requirements-MOC.md` | **Sửa link chết** `PRD-TNMCORE-OS.md`. Thêm `PRD-Repro.md`, `NFR-Repro.md`, `BRD-001-Problem-Statement.md`, 5 UC. Bump `updated`. |
| `docs/030-Specs/Specs-MOC.md` | **File hiện RỖNG 0 dòng, không có cả frontmatter.** Tạo lại đủ frontmatter + trỏ `SDD-Repro.md`, 11 ADR, `Spec-Security-Repro-Threat-Model.md`. |
| `docs/050-Research/Research-MOC.md` | Thêm `Analysis-Target-Users.md`. Bump `updated`. |
| `docs/022-User-Stories/Stories-MOC.md` | **Sửa 2 link chết** `Story-Request-OTP.md`, `Story-Verify-OTP.md`. **Không** tạo story mới (ngoài phạm vi). Bump `updated`. |
| `docs/999-Resources/Glossary.md` | Bổ sung từ vựng Repro: Repro Capsule, Execution Replay, Execution Diff, Execution Verification, Replay Boundary, Recorder, Replay Runtime, Capture, Divergence, Default-deny write, Drift (code/schema/dependency), Supported Execution Class, Crypto-shredding. Giữ 3 thuật ngữ OTP cũ (không xoá). Bump `updated`. |

## Ripple (T3) — tài liệu đang trích dẫn phạm vi này

| Tài liệu | Ảnh hưởng |
|---|---|
| `docs/999-Resources/RQ.md` | **Không sửa.** Là nguồn sự thật gốc và là input của anh. Nhưng 5 chỗ tự nói ngược (M1, M2, `I-01` Redis, `I-03` P95, `I-04` lazy loading) sẽ được **ghi lại** trong `Risk-Register.md §4` — nếu anh sửa RQ.md sau này, các tài liệu dẫn xuất phải rà lại. |
| `docs/020-Requirements/Requirements-MOC.md` | Đang trỏ `PRD-TNMCORE-OS.md` (link chết) — sửa ở close-step. |
| `docs/022-User-Stories/Stories-MOC.md` | Đang trỏ 2 story OTP không tồn tại — sửa ở close-step. |
| `docs/999-Resources/Glossary.md` | 3 thuật ngữ hiện có **toàn bộ về OTP**, không liên quan Repro. Bổ sung, không xoá. |
| `docs/010-Planning/OKRs.md` | Cố ý **không** chạm. Nếu anh muốn OKR sau này, nguồn là PRD §Success Metrics — nhưng phải có owner + kỳ hạn thật, không suy từ RQ.md. |
| `docs/010-Planning/pm-runs/2026-08-11-*/` | Run cũ bị bỏ dở, rỗng. **Không sửa, không xoá** (guardrail). |
