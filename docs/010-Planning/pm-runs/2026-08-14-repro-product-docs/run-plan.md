# Run Plan: 2026-08-14-repro-product-docs

**Lane**: doc · **Shape**: A (Authoring) · **Tier**: **T3** (3/4 điểm triage)
**Nguồn sự thật duy nhất**: `docs/999-Resources/RQ.md` (1995 dòng)

## Phases

| # | Phase | Agent | Song song? | Input | Output |
|---|-------|-------|-----------|-------|--------|
| 1 | Intake & Triage | PM | — | Yêu cầu gốc | `brief.md` |
| 2 | Analysis fan-out | `business-analyst`, `architect`, `security-auditor` | **Có** (3 lens, read-only) | `RQ.md` | `findings/*.md` (PM ghi) |
| 3 | GATE | PM | — | findings | `run-plan.md` + duyệt của anh |
| 4 | Doc plan | PM | — | findings + duyệt | `outline.md` |
| 5a | Soạn Requirements + Persona | `business-analyst` | **Có** | outline (toàn văn) | `docs/020-**`, `docs/050-**` |
| 5b | Soạn Architecture | `architect` | **Có** | outline (toàn văn) | `docs/030-Specs/Architecture/**` |
| 5c | Soạn Security Spec | `security-auditor` | **Có** | outline (toàn văn) | `docs/030-Specs/Security/**` |
| 5d | Soạn Planning | **PM tự viết** | Có | outline | `docs/010-Planning/**` |
| 6 | Verify | `context-auditor` | — | toàn bộ deliverable | `verdict.md` |
| 6b | Close-step | **PM tự làm** | — | verdict | MOC, `000-Index.md`, `Glossary.md` |

Phase 5a/5b/5c/5d chạy **đồng thời** vì ownership rời nhau tuyệt đối (xem bảng dưới).

## File ownership map

| Agent | Sở hữu (được ghi) | Cấm chạm |
|-------|-------------------|----------|
| **PM** (main loop) | `docs/010-Planning/Charter-Repro.md`, `docs/010-Planning/Roadmap.md`, `docs/010-Planning/Risk-Register.md`, `docs/000-Index.md`, `docs/999-Resources/Glossary.md`, **mọi file `*-MOC.md`**, toàn bộ `docs/010-Planning/pm-runs/2026-08-14-repro-product-docs/` | — |
| `business-analyst` | `docs/020-Requirements/PRD-Repro.md`, `docs/020-Requirements/NFR-Repro.md`, `docs/020-Requirements/BRD/BRD-001-Problem-Statement.md`, `docs/020-Requirements/Use-Cases/UC-*.md`, `docs/050-Research/Analysis-Target-Users.md` | MOC, `000-Index.md`, `Glossary.md`, `docs/030-**`, `docs/010-**` |
| `architect` | `docs/030-Specs/Architecture/SDD-Repro.md`, `docs/030-Specs/Architecture/ADR-*.md` | MOC, `000-Index.md`, `Glossary.md`, `docs/020-**`, `docs/050-**`, `docs/030-Specs/Security/**` |
| `security-auditor` | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | MOC, `000-Index.md`, `Glossary.md`, mọi thứ ngoài file của mình |
| `context-auditor` | **read-only** — không ghi gì | tất cả |

> Các tập ownership **rời nhau tuyệt đối**. Cắt theo **thư mục**, không cắt theo chủ đề — chủ đề chồng lấn file.
> `outline.md` và mọi file MOC + `000-Index.md` + `Glossary.md` **thuộc PM**, không cấp cho worker nào. Đây là điểm hội tụ của mọi writer.

## Bảng đích tài liệu (tra Document Type Mapping của RULE-001)

| # | Anh yêu cầu | Loại (RULE-001) | Thư mục đích | Tên file | Writer |
|---|---|---|---|---|---|
| 1 | **Idea Brief** ⚠ | Project Charter | `docs/010-Planning/` | `Charter-Repro.md` | PM |
| 2 | **Problem Statement** ⚠ | BRD | `docs/020-Requirements/BRD/` | `BRD-001-Problem-Statement.md` | `business-analyst` |
| 3 | **Target User / Persona** ⚠ | Research / Analysis | `docs/050-Research/` | `Analysis-Target-Users.md` | `business-analyst` |
| 4 | **Use Cases** | Use Case | `docs/020-Requirements/Use-Cases/` | `UC-01-Capture-Failed-Production-Execution.md` … `UC-05-*.md` (5 file) | `business-analyst` |
| 5 | **Scope / MVP** ⚠ | *(không có slot riêng)* | — | PRD §Scope + §Non-Goals, **và** `docs/010-Planning/Roadmap.md` (phasing V0.1→V0.3) | `business-analyst` + PM |
| 6 | **PRD** | PRD | `docs/020-Requirements/` | `PRD-Repro.md` | `business-analyst` |
| 7 | **Technical Design** | SDD | `docs/030-Specs/Architecture/` | `SDD-Repro.md` | `architect` |
| 8 | **ADR** | ADR | `docs/030-Specs/Architecture/` | `ADR-001-*.md` … `ADR-011-*.md` | `architect` |

⚠ = **không có tên riêng** trong Document Type Mapping. Bốn hạng mục này PM phải *diễn giải* mapping, không tự chế đường dẫn mới. → **hạng mục gate.**

### Hạng mục bổ sung PM đề xuất (anh không nêu tên, nhưng **có chỗ chính thức** trong RULE-001)

| Loại | Đích | Lý do đề xuất | Writer |
|---|---|---|---|
| Risk Register | `docs/010-Planning/Risk-Register.md` | `RQ.md §20–21` dành 18 risk + risk matrix — chiếm khoảng 1/3 dung lượng tài liệu gốc. Nhét hết vào PRD/Charter sẽ làm cả hai loãng. Template có sẵn. | PM |
| NFR | `docs/020-Requirements/NFR-Repro.md` | `architect` lens trích 19 hạng mục NFR (`N-01`…`N-19`) và **khuyến nghị tách file riêng** vì PRD và SDD sẽ cùng tham chiếu. | `business-analyst` |
| Security Spec / Threat Model | `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | `security-auditor` lens đã sản xuất threat model đầy đủ: 13 asset, 6 trust boundary, 19 threat, 43 requirement `SEC-001`…`SEC-048`. **RQ.md có mitigation list nhưng chưa từng có threat model** — đây là khoảng trống thật, và nội dung đã có sẵn. | `security-auditor` |

→ **hạng mục gate.**

## Artifact sẽ tạo/sửa ngoài run-state

**Tạo mới (~32 file nếu duyệt hết):**
- `docs/000-Index.md` — **RULE-001 quy định BẮT BUỘC nhưng hiện chưa tồn tại**
- `docs/010-Planning/Charter-Repro.md`, `Risk-Register.md`
- `docs/020-Requirements/PRD-Repro.md`, `NFR-Repro.md`, `BRD/BRD-001-Problem-Statement.md`, `Use-Cases/UC-01..05` (5 file)
- `docs/030-Specs/Architecture/SDD-Repro.md`, `ADR-001..011` (11 file)
- `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` (+ tạo thư mục `Security/` — đã khai báo trong RULE-001 §Cấu trúc thư mục bắt buộc, **không** phải thư mục tự chế)
- `docs/050-Research/Analysis-Target-Users.md`

**Sửa file đang có (PM giữ):**
- `docs/010-Planning/Roadmap.md` — hiện là stub `*(Content to be added)*` → điền phasing V0.1/V0.2/V0.3/Future từ §26
- `docs/999-Resources/Glossary.md` — hiện 3 thuật ngữ **toàn bộ về OTP, không liên quan Repro** → bổ sung từ vựng Repro
- `docs/030-Specs/Specs-MOC.md` — hiện **rỗng 0 dòng, không có cả frontmatter**
- `docs/020-Requirements/Requirements-MOC.md` — có **link chết** tới `PRD-TNMCORE-OS.md`
- `docs/050-Research/Research-MOC.md`, `docs/010-Planning/Planning-MOC.md`

**Cố ý KHÔNG chạm:**
- `docs/010-Planning/OKRs.md` — giữ stub. `RQ.md §31–32` là metric, không phải OKR có Objective/Key Result/chủ sở hữu/kỳ hạn. Chưa có tổ chức, chưa có kỳ, chưa có owner → viết OKR bây giờ là bịa. **Là quyết định, không phải bỏ sót.**
- `docs/022-User-Stories/**` — anh không yêu cầu Story/Epic. Nhưng `Stories-MOC.md` đang có **link chết** tới `Story-Request-OTP.md` / `Story-Verify-OTP.md`; PM sẽ sửa link chết ở close-step (file MOC thuộc PM) mà **không** tạo story mới.
- `docs/010-Planning/pm-runs/2026-08-11-repro-product-architecture-docs/` — run cũ bị bỏ dở, rỗng hoàn toàn. Guardrail: không sửa, không xoá.
- `knowledge-base/**` — RULE-001 là `status: approved`, chỉ đọc.
- `src/`, `test/` — lane `/pm-code`.

## Assumptions

Năm assumption gốc ở `brief.md` (A1–A5) vẫn giữ nguyên. Bổ sung sau fan-out:

- **A6 — Mọi ADR mở ở `status: draft` + Decision status `Proposed`.** Chưa có ai duyệt thật. → **sai thì hỏng ở đâu**: nếu anh cần ADR `Accepted` để làm căn cứ thực thi thì phải có một vòng duyệt riêng sau run này.
- **A7 — `RULE-001` thắng command khi mâu thuẫn về link.** `pm-doc.md` yêu cầu wiki-link `[[...]]`; `RULE-001` §Linking Rules (updated 2026-03-03) quy định **standard markdown link + relative path** và ghi rõ **KHÔNG dùng wiki-links**. RULE-001 là contract của lane và mới hơn. Chính command cũng viện dẫn "RULE-001 §Linking Rules" làm thẩm quyền → cách diễn đạt wiki-link của nó là paraphrase cũ. **PM dùng markdown link.** → **sai thì hỏng ở đâu**: nếu anh thực sự muốn wiki-link cho Obsidian thì toàn bộ link phải viết lại.
- **A8 — Không có ai duyệt để chuyển `draft` → `approved`.** Toàn bộ tài liệu ở `draft`. → **sai thì hỏng ở đâu**: chỉ là nhãn trạng thái, sửa rẻ.

### Quyết định PM tự phân xử ở tầng 2 (có neo văn bản mạnh, ghi lại để anh phủ quyết được)

| # | Vấn đề | Quyết định | Neo văn bản |
|---|---|---|---|
| E1 | **Redis trong MVP?** (`I-01`/`FR-016`) | **Không thuộc V0.1 capture** | §18 (MVP capabilities) và §26 (V0.3) là *phát biểu phạm vi tường minh*; §5/§17 là *sơ đồ minh hoạ*; §22 là *dependency của test app*. Phát biểu phạm vi thắng sơ đồ. |
| E2 | **§18 vs §21** — redaction/encryption/retention/self-hosting có thuộc MVP? (`ACG-12`) | **Có.** §18 là danh sách *core replay loop*, không phải danh sách đầy đủ mọi capability | §21 Risk Matrix cột "MVP?" ghi Yes cho Sensitive data / Security exposure / Compliance / Capsule size / Overhead. Cách đọc này làm §18 và §21 **tương thích** thay vì loại trừ. `security-auditor` độc lập kết luận 32 requirement là MUST-V0.1 → chống lưng bởi lens thứ hai. |
| E3 | **Lazy loading vs self-contained** (`I-04`) | Capsule **self-contained là bất biến V0.1**; "lazy loading" = lazy khi *đọc* capsule, **không** phải lazy fetch từ production | Giữ được cả §6/§40 và §20.12 mà không mâu thuẫn |
| E4 | **P95 capsule size** (`I-03`) | `N-03` có ngưỡng (average, §24); `N-09` **ngưỡng TBD** (P95, §23 đòi đo nhưng §24 không đặt ngưỡng). Không bịa số P95 | §23 vs §24 |
| E5 | **§38 Q5 / Q6 / Q9** | Q5: V0.1 **chỉ capture failed executions**. Q6: **không** có manual recording, ghi Non-Goals. Q9: **replay boundary = service boundary** của service đang điều tra, mọi dependency replay từ recorded response | Q5: §20.7, §18 (stack trace chỉ có khi failure), §37. Q6: §18 CLI không có lệnh record, §26 V0.1, §20.15. Q9: §14 nguyên văn, §20.11, §26 V0.3 đặt multi-service ở tương lai |
| E6 | **§38 Q4** (initial stack) | **Coi như ĐÃ được RQ.md trả lời**: Node.js + PostgreSQL + HTTP. Không để lơ lửng trong PRD | §18 "Start with…", §22 test app, §26 V0.1, §20.14 `@repro/node` |
| E7 | **§38 Q12** (self-hosting day one) | **Bắt buộc từ V0.1** | §20.6, §21 (MVP=Yes), §28 ("Basic Self-hosting" ở OSS core). **Ba lens đồng thuận.** `security-auditor` bổ sung lý do mạnh hơn §20.6: lập luận *compliance* (tránh đưa vendor vào vai processor, tránh transfer xuyên biên giới) mạnh hơn lập luận *bảo mật* |
| E8 | **Capsule transfer production → storage** (`B-B`/`GAP-01`/`U-06`) | Recorder tự upload capsule đã encrypt lên private storage do tổ chức cấu hình; `repro pull` đọc từ đó; **không** có lệnh push phía CLI. ADR-009 ghi Decision ở **mức tối thiểu** (object/file storage + index, không phải service đầy đủ) + mục `TBD` tường minh cho API/auth | §17 sơ đồ, §20.6, §18 CLI không có lệnh push ⇒ push không phải việc của developer |
| E9 | **Capsule thiếu input lúc replay** (`B-C`/`UC-02 A5`/`U-11`) | **Divergence + incomplete capture**, không crash, và **tuyệt đối không fallback sang gọi hệ thống thật ở local** | §33.6 Safe by default, §13/§20.4 default-deny, §33.5 "Determinism over magic", §20.3 |
| E10 | **Persona không viết 3 nhóm ngang hàng** | Software Engineer = **primary**; SRE/DevOps = **secondary** (capture-side owner); QA Engineer = **"activated at V0.2"** | `RQ.md` **không có** section "Target users" — 3 nhóm chỉ ở **dòng 7 frontmatter**. PM tự grep verify: "QA" và "SRE" xuất hiện **duy nhất 1 lần**, ở dòng 7; "developer" 34 lần. Toàn bộ nội dung persona QA neo vào regression test = Post-MVP V0.2 |
| E11 | **`U-04`, `U-02` và nhóm unknown lõi** | Writer **bắt buộc** ghi `TBD` + phương án đề xuất gắn nhãn *"cần validate"* + chỉ rõ nó chặn cái gì. **Tuyệt đối không** viết Decision dứt khoát như đã chốt | `brief.md` A4. Đây là ranh giới giữa SDD trung thực và SDD trông đầy đặn mà rỗng |
| E12 | **Crypto-shredding** | Vào SDD §7.4 + ADR-002 §Consequences như **ràng buộc được đề xuất**, gắn nhãn *"cần validate — đánh đổi với replay offline chưa được giải"* | `security-auditor` nêu là cơ chế duy nhất biến `TB-4` từ bất khả hồi thành khả hồi, nhưng **tự nói cần architect quyết**; `architect` không nêu (không có trong RQ.md). Chưa ai cân → không viết như đã chốt |

## Xác nhận chéo giữa các lens (cơ sở để PM tự tin hơn)

Bốn điểm mà **hai lens độc lập** kết luận giống nhau — mức bằng chứng cao nhất run này có:

| Chủ đề | Lens A | Lens B | Xử lý |
|---|---|---|---|
| Regression test V0.1 vs V0.2 → **North Star §31 không đo được bằng V0.1** | `business-analyst` `B-A` | `architect` `I-02` | **→ GATE** |
| §28 đẩy access control sang commercial trong khi §20.5/§21 coi là MVP | `business-analyst` `FR-025` | `security-auditor` `THREAT-008` | **→ GATE** |
| "sufficiently equivalent" §10 không định nghĩa được | `business-analyst` `ACG-01` | `architect` `U-04` | E11 |
| Redaction làm hỏng replay fidelity → capsule phải ghi field đã redact | `architect` `U-15` | `security-auditor` §3.1 + `SEC-048` | Đủ mạnh để vào SDD như **quyết định** |
| Phân loại READ/WRITE phải **fail-closed** | `architect` `U-12` | `security-auditor` `SEC-032/033` | Vào ADR-005 |
| Self-hosting bắt buộc V0.1 | `business-analyst` `FR-054/055` + `architect` `D-12` | `security-auditor` Q12 | E7 (**ba lens**) |

## Hạng mục đẩy lên gate (vượt `brief.md`, tầng 3)

1. **Ánh xạ 4 hạng mục không có tên trong Document Type Mapping** (⚠ ở bảng trên).
2. **Số lượng ADR**: 11 Tier-1 / 8 gọn / 16 đầy đủ.
3. **Ba hạng mục bổ sung**: Risk-Register, NFR, Security Spec.
4. **Hai mâu thuẫn nội tại của RQ.md** được hai lens độc lập xác nhận: regression test/North Star, và §28 access control.

## Gate

- **Trình ngày**: 2026-08-14
- **Kết quả**: **DUYỆT** — anh chọn phương án khuyến nghị ở cả 4 hạng mục.
- **Điều chỉnh của anh**: không có.

### Bốn quyết định của anh tại gate

| # | Hạng mục | Quyết định |
|---|---|---|
| G1 | Ánh xạ 4 hạng mục không có tên trong Document Type Mapping | **Theo đề xuất của PM**: Idea Brief → `Charter-Repro.md`; Problem Statement → `BRD-001-Problem-Statement.md`; Persona → `Analysis-Target-Users.md`; Scope/MVP → PRD §Scope + §Non-Goals **và** `Roadmap.md` (phasing V0.1→V0.3/Future). Không mở rộng taxonomy, không tạo thư mục mới. |
| G2 | Số lượng ADR | **11 ADR nền tảng** (`ADR-001`…`ADR-011`). 5 ADR Tier-2 **không** làm; 14 decision còn lại ánh xạ vào mục SDD cụ thể. |
| G3 | Hạng mục bổ sung | **Làm cả ba**: Security Spec / Threat Model, Risk Register, NFR riêng. |
| G4 | Hai mâu thuẫn nội tại của RQ.md | **Ghi trung thực + đề xuất, không tự quyết.** Tài liệu nêu rõ cả hai phía kèm section number, ghi vào PRD §Open Questions, kèm phương án PM đề xuất gắn nhãn **"cần anh chốt"**. **Cấm** im lặng chọn một phía. |

> **G4 ghi đè một phần các quyết định tầng 2 đã ghi ở §Assumptions.** Cụ thể: `E2` (§18 vs §21) vẫn giữ vì nó là *cách đọc làm hai section tương thích*, không phải chọn phe. Nhưng phần **§28 access control** và **regression test/North Star** chuyển sang chế độ G4 — writer **không** được viết dứt khoát, phải nêu hai phía + đề xuất + nhãn "cần anh chốt".

**Số file cuối cùng: 32.** PM 10 · `business-analyst` 9 · `architect` 12 · `security-auditor` 1.
