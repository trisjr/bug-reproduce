---
id: PM-OUTLINE-2026-08-28-PHASE-P1-UNGATE-V01
type: reference
status: draft
created: 2026-08-28
---

# Doc Plan & Outline: 2026-08-28-phase-p1-ungate-v01

## 1. Danh Sách Hạng Mục Deliverables Của Phase P1

| # | Hạng mục Deliverable | Loại (RULE-001) | Thư mục đích | Trạng thái đích | Writer / Driver | Xong |
|---|---|---|---|---|---|:---:|
| **W1.1** | `NFR-Repro.md` (Update §3 & §7) | nfr | `docs/020-Requirements/` | approved | `business-analyst` | [ ] |
| **W1.2** | `PRD-Repro.md` (Update §3.4 & §5.5) | prd | `docs/020-Requirements/` | approved | `business-analyst` | [ ] |
| **W1.3** | `UC-02-Replay-Capsule-Locally.md` (Update) | use-case | `docs/020-Requirements/Use-Cases/` | approved | `business-analyst` | [ ] |
| **W1.4** | `ADR-012-Key-Custody.md` (New) | adr | `docs/030-Specs/Architecture/` | approved | `architect` | [ ] |
| **W1.5** | `ADR-013-OSS-License-And-Contribution-Model.md` (New) | adr | `docs/030-Specs/Architecture/` | approved | `architect` | [ ] |
| **W2.1** | `ADR-001` .. `ADR-011` (Update Open items) | adr | `docs/030-Specs/Architecture/` | approved | `architect` | [ ] |
| **W2.2** | `ADR-002-Repro-Capsule-Format-Contract.md` (Update) | adr | `docs/030-Specs/Architecture/` | approved | `architect` | [ ] |
| **W2.3** | `SDD-Repro.md` (Update §4, §5.4, §8) | sdd | `docs/030-Specs/Architecture/` | approved | `architect` | [ ] |
| **W2.4** | `Spec-Security-Repro-Threat-Model.md` (Update) | spec | `docs/030-Specs/Security/` | approved | `security-auditor` | [ ] |
| **W3.1** | `Epic-01` .. `Epic-05.md` (5 Epics mới) | epic | `docs/022-User-Stories/Epics/` | approved | `product-owner` | [ ] |
| **W3.2** | `Story-01` .. `Story-15.md` (15 Stories mới) | story | `docs/022-User-Stories/Backlog/` | approved | `product-owner` | [ ] |
| **W3.3** | `MTP-Repro-V0.1.md` (New) | test-plan | `docs/035-QA/Test-Plans/` | approved | `quality-assurance` | [ ] |
| **W3.4** | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (New) | governance | Repo Root | approved | `product-owner` | [ ] |
| **W3.5** | `SECURITY.md`, `SLA-Security-Response.md` (New) | policy/sla | Repo Root, `docs/080-Operations/SLAs/` | approved | `security-auditor` | [ ] |
| **W4.1** | Đồng bộ 7 MOCs & `000-Index.md` (Update) | moc/index | `docs/` | approved | `product-manager` | [ ] |
| **W4.2** | Báo cáo kiểm toán & Phán quyết Gate D10 | verdict | `docs/010-Planning/pm-runs/.../` | approved | `context-auditor`, 👤 `@TrisJr` | [ ] |

---

## 2. Outline Chi Tiết Từng Khối Tài Liệu

### Wave 1: Foundation & Core Definitions

#### 1. `NFR-Repro.md` (Update Task D1 & D2)
- **Độc giả đích**: PM, QA, Architect, Engineer, Sponsor.
- **Nguồn sự thật**: `Report-Spike-Phase-0.md`, `Perf-Spike-Phase-0.md`, `findings/business-analyst.md`.
- **Cấu trúc cập nhật**:
  - §3: Chốt chính thức $N\text{-}05$ Execution Match Rate: In-Class $R_{em} \ge 90.0\%$, Composite fail-closed $\ge 80.0\%$, Diagnostic floor $\ge 60.0\%$. Xoá nhãn `TBD`.
  - §7: Chuyển 4 ACGs ($ACG\text{-}01, ACG\text{-}02, ACG\text{-}03, ACG\text{-}07$) từ `Gap/Hypothesis` sang **Định nghĩa sản phẩm chính thức**.
- **Tiêu chí xong**: Không còn `TBD` hay `HYPOTHESIS` trong §3 và §7.

#### 2. `PRD-Repro.md` & `UC-02-Replay-Capsule-Locally.md` (Update Task D2 & D6)
- **Độc giả đích**: PM, PO, Engineer, BA.
- **Nguồn sự thật**: `findings/business-analyst.md`, `findings/architect.md`.
- **Cấu trúc cập nhật**:
  - PRD §3.4: Bổ sung định nghĩa Supported Execution Class chính thức; PRD §5.5: Bổ sung authn/authz & CLI operational verbs (`repro auth login`, `repro purge`, `repro keys rotate`).
  - UC-02: Cập nhật Main Scenario và Exception Flows theo Rubric so sánh 2 tầng và phân loại divergence 6 bước.
- **Tiêu chí xong**: Khớp 100% với $ACG\text{-}01$ và $ACG\text{-}07$.

#### 3. `ADR-012-Key-Custody.md` (New Task D4)
- **Độc giả đích**: Architect, Security Auditor, DevOps, Engineer.
- **Nguồn sự thật**: `findings/architect.md`, `findings/security-auditor.md`.
- **Cấu trúc**:
  - Context & Problem: Quản lý khoá mã hoá capsule phân tán ($U\text{-}06d$), thực thi crypto-shredding $SEC\text{-}016$ và GDPR Art 17.
  - Decision: Chọn Private Self-Hosted Key Custody (KMS / Vault) lưu trữ DEK; Capsule mang KEK metadata; xoá DEK $\to$ capsule lập tức vô phương giải mã.
  - 4 Trạng thái khoá khi `repro inspect`: `Key Available`, `Key Revoked/Shredded`, `Key Expired`, `Key Custody Unreachable`.
  - Consequences: Mở khoá an toàn dữ liệu V0.1, tương thích $ADR\text{-}009$.
- **Tiêu chí xong**: Đủ frontmatter chuẩn RULE-001, giải quyết trọn vẹn $U\text{-}06d$.

#### 4. `ADR-013-OSS-License-And-Contribution-Model.md` (New Task LG1)
- **Độc giả đích**: Sponsor, PM, Legal, Community Contributors.
- **Nguồn sự thật**: `findings/architect.md`, `findings/context-auditor.md`.
- **Cấu trúc**:
  - Context: Chọn license mã nguồn mở cho `@repro/node` SDK và CLI Core.
  - Decision: Chọn **Apache-2.0** với CLA/DCO.
  - Consequences: Cho phép áp dụng rộng rãi, bảo vệ quyền sở hữu trí tuệ/patent, mở đường cho Commercial Enterprise add-ons ở V0.3+.
- **Tiêu chí xong**: Đủ frontmatter chuẩn RULE-001, có phân tích đối chiếu MIT vs Apache-2.0 vs BSL.

---

### Wave 2: Architecture, Specs & Capsule Freeze

#### 5. Giải quyết 6 Open Items của 11 ADRs (`ADR-001` .. `ADR-011`) (Task D3)
- **Độc giả đích**: Architect, Engineer.
- **Nguồn sự thật**: `findings/architect.md`.
- **Cấu trúc cập nhật**: Cập nhật mục `Open items` trong các file ADR tương ứng:
  - `ADR-004`: Đóng $U\text{-}01$ (in-process monkey-patching wrapper cho `pg`).
  - `ADR-006` & `ADR-011`: Đóng $U\text{-}02$ (Normalized SQL + parameter array matching) và $U\text{-}04$ (6-step divergence attribution).
  - `ADR-007` & `ADR-010`: Đóng $U\text{-}03$ và $U\text{-}13$ (Virtual clock tick progression).
  - `ADR-008`: Đóng $U\text{-}20$ (Fail-closed unconsumed interactions policy).
- **Tiêu chí xong**: Không còn open item `TBD` không có lời giải trong 11 ADRs.

#### 6. `ADR-002-Repro-Capsule-Format-Contract.md` & `SDD-Repro.md` §4 (Task D5 & D6)
- **Độc giả đích**: Architect, Engineer, Security.
- **Nguồn sự thật**: `findings/architect.md`.
- **Cấu trúc cập nhật**:
  - `ADR-002`: Đóng băng **Repro Capsule Format v1** (Tar.gz payload: Header v1, `manifest.json`, `interactions.jsonl`, `runtime_metadata.json`, `checksums.sha256`, `key_id`).
  - `SDD-Repro.md`: Cập nhật §4 (Format v1 layout), §5.4 (Capsule Store authn/authz & CLI operational verbs), §8 (Đóng 6 open items).
- **Tiêu chí xong**: Format v1 có versioning rõ ràng, tương thích ngược với regression test v2.

#### 7. `Spec-Security-Repro-Threat-Model.md` (Update Task D9 & LG3)
- **Độc giả đích**: Security Auditor, Architect, DevOps.
- **Nguồn sự thật**: `findings/security-auditor.md`.
- **Cấu trúc cập nhật**:
  - Nâng cấp Threat Matrix: Thiết kế mitigation cho $THREAT\text{-}018$ bằng L2 Container Sandbox (`--deny-child-process` / seccomp profile) triệt tiêu khoảng hở $T8\text{-}a$.
  - Cập nhật $SEC\text{-}008$: Chốt trần $100\text{ rows} / 64\text{ KB}$ per DB query result.
  - Bổ sung $SEC\text{-}027$: Bắt buộc Integrity verification (HMAC-SHA256) trước khi parse JSON/unzip.
  - Cập nhật phân tích GDPR Art 17 cho Crypto-shredding + TTL 30 ngày.
- **Tiêu chí xong**: Rà soát đầy đủ 19 threats, không còn unmitigated threat mà không có phương án.

---

### Wave 3: QA, Stories & Governance

#### 8. `docs/022-User-Stories/` — Phân Rã 5 Epics & 15 User Stories (Task D7 — Gỡ GATE-02)
- **Độc giả đích**: PO, Engineer, QA, PM.
- **Nguồn sự thật**: `findings/quality-assurance.md`, `findings/business-analyst.md`, `Timeline-Repro.md §7`.
- **Cấu trúc**:
  - 5 Epics (`docs/022-User-Stories/Epics/`):
    1. `Epic-01-SDK-Capture.md` (In-process SDK, 8 capture groups, async bounded).
    2. `Epic-02-Capsule-Store.md` (Writer/reader format v1, Key custody, TTL 30 days, crypto-shredding).
    3. `Epic-03-Replay-Runtime.md` (Replay HTTP/DB/Clock/API, default-deny write L1+L2).
    4. `Epic-04-Verification-Diff.md` (Execution match verification, 6-step attribution, execution diff).
    5. `Epic-05-CLI-Admin.md` (CLI 6 verbs + admin verbs `purge`, `keys`, `auth`).
  - 15 User Stories (`docs/022-User-Stories/Backlog/Story-01..15.md`) chuẩn INVEST, kèm Acceptance Criteria dạng Given-When-Then và DoD chi tiết.
- **Tiêu chí xong**: Thư mục `022-User-Stories/` có đủ 5 Epics và 15 Stories, liên kết chuẩn tới PRD.

#### 9. `docs/035-QA/Test-Plans/MTP-Repro-V0.1.md` (New Task D8)
- **Độc giả đích**: QA, Engineer, DevOps, PM.
- **Nguồn sự thật**: `findings/quality-assurance.md`.
- **Cấu trúc**:
  - Phạm vi kiểm thử V0.1: Core Replay Loop, 33 $SEC\text{ MUST-V0.1}$, Default-deny write fail-closed (L1+L2), CLI 6 verbs.
  - Đo lường tự động $N\text{-}05$ trong CI/CD pipeline ($D=7, K=3$).
  - Ma trận test case chi tiết 33 $SEC\text{ MUST-V0.1}$ (Nhóm A–I, `TC-SEC-001` đến `TC-SEC-048`).
  - Suite Regression Testing 12 kịch bản tấn công/side-effect $T1$–$T12$ với Canary Sink độc lập.
- **Tiêu chí xong**: Đủ frontmatter, chiến lược test tự động hoá khả thi 100%.

#### 10. `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SLA-Security-Response.md` (New Tasks LG2 & LG5)
- **Độc giả đích**: Open Source Contributors, Security Researchers, Enterprise Users.
- **Nguồn sự thật**: `findings/architect.md`, `findings/security-auditor.md`.
- **Cấu trúc**:
  - `CONTRIBUTING.md` & `CODE_OF_CONDUCT.md` (Repo Root): Hướng dẫn đóng góp, quy tắc DCO/CLA, Code of Conduct Contributor Covenant v2.1.
  - `SECURITY.md` (Repo Root): Chính sách công bố lỗ hổng bảo mật có trách nhiệm, PGP key, kênh liên hệ bí mật.
  - `docs/080-Operations/SLAs/SLA-Security-Response.md`: Bảng SLA cam kết xử lý sự cố an ninh (P0 $<24$h, P1 $<48$h, P2 $<7$ ngày).
- **Tiêu chí xong**: Đúng vị trí, đúng chuẩn OSS quốc tế.

---

### Wave 4: Verification, MOCs & Funding Gate

#### 11. Đồng Bộ 7 MOCs & `docs/000-Index.md` (Task W4.1)
- **Độc giả đích**: Toàn bộ dự án.
- **Nguồn sự thật**: RULE-001, các deliverables mới tạo.
- **Cấu trúc**: Cập nhật `Requirements-MOC.md`, `Stories-MOC.md`, `Specs-MOC.md`, `QA-MOC.md`, `Operations-MOC.md`, `Planning-MOC.md`, `Timeline-Repro.md`, và `000-Index.md`.
- **Tiêu chí xong**: Không còn dead links, MOCs phản ánh chính xác 100% file mới.

#### 12. Verification Toàn Kho & Phán Quyết Gate D10 (Task W4.2)
- **Độc giả đích**: Sponsor `@TrisJr`.
- **Cấu trúc**: Context Auditor verify 4 tiêu chí (Completeness, Correctness, Coherence, Connectivity). Soạn thảo `verdict.md` trình Sponsor phê duyệt Gate Cấp vốn V0.1 (`D10`). Đo lường `cost.md`.
- **Tiêu chí xong**: Verdict sạch (0 Critical, 0 Warning), sẵn sàng mở Phase P2.
