---
id: PM-BRIEF-2026-08-28-PHASE-P1-UNGATE-V01
type: reference
status: draft
created: 2026-08-28
---

# Brief: 2026-08-28-phase-p1-ungate-v01

**Lane**: `doc`  
**Shape**: `B — Normalization sweep & Authoring`

## Yêu cầu gốc

> Thực hiện Phase P1

## Bối cảnh kế thừa

1. **`GATE-06` (§39) đã chính thức được phê duyệt ngày 2026-08-28** (`GATE-06 = CÓ`, xem `docs/010-Planning/pm-runs/2026-08-28-p0c-spike-run-report/verdict.md`). Toàn bộ Phase 0 (Technical Spike) gồm 10 scenario fixtures $\times$ 7 bước và probe $SC\text{-}11$ đã hoàn tất 100% với các chỉ số thực nghiệm đột phá:
   - Composite Fail-Closed: $7/7$ ($100.0\%$) trên tập in-class $D=7$ (vượt xa ngưỡng $\ge 6/7$).
   - Replay Success Rate ($R_{sr}$): $100\%$, Execution Match Rate ($R_{em}$): $100\%$ in-class.
   - Bất biến an toàn: `escaped_side_effects = 0` được xác nhận qua Canary Log độc lập.
   - Hiệu năng NFR: Latency overhead $+1.62\%$ ($P\text{-discard}$) / $+1.77\%$ (overall) $< 5.0\%$, Avg Capsule Size $2,042\text{ B} < 10\text{ MB}$, Replay Time $1.03\text{ ms} < 30\text{ s}$.
   - Đo lường thực tế $SEC\text{-}008$: Phân bố thực tế và thí nghiệm cắt offline ($70$ replays) chứng minh $100\%$ replay thành công ở trần $100\text{ rows} / 64\text{ KB}$.
2. **Phase P1 (Gỡ khoá sau gate · $W13\text{–}W17$, 24.5 MD)** theo `Timeline-Repro.md §6` là phase chuyển giao bản lề để biến các giả thuyết (`HYPOTHESIS`) của Spike thành **định nghĩa sản phẩm chính thức**, giải quyết 4 blocker cốt lõi, hoàn tất thiết kế kiến trúc/bảo mật/QA, và phân rã Backlog để chuẩn bị cho **Gate Cấp vốn V0.1 (`D10`)**:
   - **`D1`** (1.0 MD, PM): Chốt ngưỡng cam kết $N\text{-}05$ ($R_{em}$) từ phân bố thực tế spike.
   - **`D2`** (3.0 MD, BA): Nâng 4 hypothesis $ACG\text{-}01/02/03/07$ thành định nghĩa sản phẩm; sửa `NFR-Repro.md`, `PRD-Repro.md`, `SDD-Repro.md`, `UC-02`.
   - **`D3`** (4.0 MD, Architect): Giải quyết 6 open items ($U\text{-}01, U\text{-}02, U\text{-}03, U\text{-}04, U\text{-}13, U\text{-}20$) của 11 ADRs.
   - **`D4`** (3.0 MD, Architect): Ban hành `ADR-012-Key-Custody.md` ($U\text{-}06d$) mở khoá crypto-shredding $SEC\text{-}016$.
   - **`D5`** (2.0 MD, Architect): Đóng băng Repro Capsule Format v1 trong `SDD-Repro.md` §4 và `ADR-002`.
   - **`D6`** (2.5 MD, Architect): Thiết kế cơ chế authn/authz cho Capsule Store & CLI verbs vận hành trong `SDD-Repro.md` §5.4 & `PRD-Repro.md` §5.5.
   - **`D7`** (4.0 MD, PO): Gỡ `GATE-02` — Phân rã Epics và User Stories chuẩn INVEST trong `docs/022-User-Stories/`.
   - **`D8`** (2.5 MD, QA): Soạn Master Test Plan V0.1 (`docs/035-QA/Test-Plans/MTP-Repro-V0.1.md`).
   - **`D9`** (2.0 MD, Security): Cập nhật `Spec-Security-Repro-Threat-Model.md` theo $D4/D5/D6$ và rà 9 threats chưa có mitigation.
   - **`D10`** (0.5 MD, Sponsor `@TrisJr`): Gate Cấp vốn V0.1.
3. **Legal Track `LG` ($W13\text{–}W24$, 10.0 MD)** khởi động song song:
   - **`LG1`** (1.5 MD): Chọn OSS License (`ADR-013-OSS-License-And-Contribution-Model.md`).
   - **`LG2`** (1.0 MD): `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.
   - **`LG5`** (1.5 MD): `SECURITY.md`, `docs/080-Operations/SLAs/SLA-Security-Response.md`.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---|---|---|
| Q1 | Chạm > 1 tầng tài liệu? | **Có** | Chạm Planning (`010`), Requirements (`020`), User Stories (`022`), Specs/Architecture/Security (`030`), QA (`035`), Operations (`080`), và Root (`CONTRIBUTING.md`, `SECURITY.md`). |
| Q2 | Sửa tài liệu `approved` / đổi contract? | **Có** | Cập nhật các tài liệu nền tảng đã `approved` (`NFR-Repro`, `PRD-Repro`, `SDD-Repro`, `ADR-001..011`, `Threat-Model`) từ trạng thái `HYPOTHESIS/TBD` sang định nghĩa chính thức; ban hành `ADR-012`, `ADR-013`, `MTP-Repro-V0.1`. |
| Q3 | Mơ hồ, thiếu AC? | **Không** | Từng task `D1`–`D10` và `LG1`–`LG5` có deliverable, exit criteria và neo truy vết chi tiết trong `Timeline-Repro.md §6` và `§6.1`. |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 24.5 MD (P1) + 10.0 MD (Legal), tác động ~25 tài liệu trên toàn kho. |

**Điểm**: 3/4 → **Tier**: **T3**  
**Lane**: `doc`  
**Shape**: **B — Normalization sweep & Authoring** (kết hợp authoring các tài liệu mới và sweep chuẩn hóa cập nhật các tài liệu nền tảng hiện hữu).  
**Chọn tier thấp do phân vân**: **Không**. 3 điểm rơi thẳng vào Tier T3 đầy đủ các bước GATE, analysis/inventory, drafting theo waves, cross-document verification và MOC registration.

## Assumptions

- `AS-1`: Dữ liệu thực nghiệm của Spike Phase 0 ($Perf\text{-}Spike\text{-}Phase\text{-}0.md$, $Report\text{-}Spike\text{-}Phase\text{-}0.md$) là nguồn sự thật duy nhất để chốt ngưỡng $N\text{-}05$ và nâng 4 $ACG$.
- `AS-2`: `GATE-06 = CÓ` đã thỏa mãn điều kiện tiên quyết thứ nhất của `GATE-02`; điều kiện thứ hai (chốt ngưỡng $N\text{-}05$ tại $D1$) sẽ hoàn tất ở Wave 1 để gỡ hoàn toàn `GATE-02` cho $D7$.
- `AS-3`: Kiến trúc Key Custody $D4$ chọn phương án Private KMS / Self-hosted Key Manager để tương thích $ADR\text{-}009$ và mở khoá crypto-shredding $SEC\text{-}016$.
- `AS-4`: Toàn bộ liên kết phải dùng standard relative markdown links `[Text](./path.md)` theo đúng RULE-001 (không dùng wiki-links `[[...]]`).

## Open questions

| # | Câu hỏi | Ai trả lời | Chặn phase nào |
|---|---|---|---|
| `OQ-1` | Ngưỡng cam kết sản phẩm $N\text{-}05$ ($R_{em}$) cho V0.1 nên đặt ở mức nào dựa trên phân bố thực nghiệm ($100\%$ in-class $D=7$, $70\%$ diagnostic $10$ scenarios)? | 🎩 PM đề xuất, 👤 `@TrisJr` duyệt tại `D1` | Chặn `D2`, `D7`, `D8` |
| `OQ-2` | Lựa chọn OSS License tại `LG1`: Apache-2.0, MIT, hay AGPL/BSL? | 🎩 PM + 🏗️ Architect đề xuất, 👤 `@TrisJr` duyệt tại `LG1` | Chặn `LG2`, `LG5`, `WS-7` |
| `OQ-3` | Chiến lược giải quyết 6 open items ($U\text{-}01, U\text{-}02, U\text{-}03, U\text{-}04, U\text{-}13, U\text{-}20$) tại `D3`? | 🏗️ Architect | Chặn `D5`, `D6` |

## Deliverables dự kiến của Phase P1

| Task | Loại (RULE-001) | Thư mục đích | Deliverable File | Driver |
|---|---|---|---|---|
| `D1` | NFR Update | `docs/020-Requirements/` | `NFR-Repro.md` (§3) | 🎩 PM |
| `D2` | Specs/PRD/NFR Update | `docs/020-Requirements/`, `docs/030-Specs/Architecture/` | `NFR-Repro.md` (§7), `PRD-Repro.md`, `SDD-Repro.md`, `UC-02-Replay-Capsule-Locally.md` | 🕵️ BA |
| `D3` | ADR Updates | `docs/030-Specs/Architecture/` | `ADR-001` .. `ADR-011` (mục Open items) | 🏗️ Architect |
| `D4` | ADR New | `docs/030-Specs/Architecture/` | `ADR-012-Key-Custody.md` | 🏗️ Architect |
| `D5` | SDD / ADR Update | `docs/030-Specs/Architecture/` | `SDD-Repro.md` (§4), `ADR-002-Repro-Capsule-Format-Contract.md` | 🏗️ Architect |
| `D6` | SDD / PRD Update | `docs/030-Specs/Architecture/`, `docs/020-Requirements/` | `SDD-Repro.md` (§5.4), `PRD-Repro.md` (§5.5) | 🏗️ Architect |
| `D7` | Epics & Stories New | `docs/022-User-Stories/Epics/`, `Backlog/` | `Epic-01`..`Epic-05.md`, `Story-01`..`Story-15.md` | 📋 PO |
| `D8` | Test Plan New | `docs/035-QA/Test-Plans/` | `MTP-Repro-V0.1.md` | 🧪 QA |
| `D9` | Threat Model Update | `docs/030-Specs/Security/` | `Spec-Security-Repro-Threat-Model.md` | 🛡️ Security |
| `LG1` | ADR New | `docs/030-Specs/Architecture/` | `ADR-013-OSS-License-And-Contribution-Model.md` | 🎩 PM |
| `LG2` | Governance New | Repo Root | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | 🎩 PM |
| `LG5` | Security Policy New | Repo Root, `docs/080-Operations/SLAs/` | `SECURITY.md`, `SLA-Security-Response.md` | 🛡️ Security |
| `D10` | Gate Verdict | `docs/010-Planning/pm-runs/2026-08-28-phase-p1-ungate-v01/` | `verdict.md` | 👤 `@TrisJr` |
