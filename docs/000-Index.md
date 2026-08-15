---
id: INDEX-000
type: index
status: draft
created: 2026-08-14
updated: 2026-08-15
---

# 📚 Documentation Master Index

Trang chủ của kho tài liệu. Mọi tài liệu đều nằm dưới `docs/` theo cấu trúc Dewey Decimal quy định tại [Documentation Structure Rule](../knowledge-base/99-Templates/Documents-Template.md) (RULE-001).

> **Dự án hiện tại**: **Repro** — open-source developer tool biến production bug thành reproducible local execution.
> **Trạng thái**: `Concept`, **đã cấp vốn cho Phase 0** (technical spike) từ 2026-08-14. Chưa có code (`src/` và `test/` còn rỗng) — toàn bộ tài liệu kỹ thuật là **thiết kế trước khi hiện thực**. V0.1 và các phase sau **chưa được cấp vốn**.
> **Nguồn sự thật gốc**: [RQ.md](./999-Resources/RQ.md).

---

## 🚀 Bắt đầu từ đâu

Đọc theo thứ tự này nếu lần đầu tiếp cận dự án:

| # | Tài liệu | Đọc để biết | Thời gian |
|---|---|---|---|
| 1 | [Charter-Repro](./010-Planning/Charter-Repro.md) | Ý tưởng là gì, vì sao đáng làm, bước tiếp theo | ~5 phút |
| 2 | [BRD-001 — Problem Statement](./020-Requirements/BRD/BRD-001-Problem-Statement.md) | Vấn đề trước khi nghe giải pháp | ~10 phút |
| 3 | [PRD-Repro](./020-Requirements/PRD-Repro.md) | Sản phẩm làm gì, phạm vi MVP, đo thành công thế nào | ~30 phút |
| 4 | [SDD-Repro](./030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật và những gì còn chưa biết | ~60 phút |
| 5 | [Timeline-Repro](./010-Planning/Estimates/Timeline-Repro.md) | **Nếu anh vào vai PM**: ai làm gì, theo thứ tự nào, xong thì căn cứ vào đâu | ~15 phút |

> [!IMPORTANT]
> **Hai mâu thuẫn nội tại của `RQ.md` đã ✅ CHỐT 2026-08-14** — chúng ảnh hưởng tới cách đọc gần như mọi tài liệu bên dưới:
> - **M1** (`D1`) — regression test generation **giữ ở V0.2**. Chỉ số thành công của V0.1 là **số bug đạt trạng thái *"Execution matched"*** (`RQ.md §10`); North Star `§31` giữ làm metric dài hạn, **kích hoạt từ V0.2**.
> - **M2** (`D2`) — **authentication + authorization + audit log thuộc OSS core**, ghi đè `§28`. Hosted storage, team management, analytics, AI analysis, cloud integrations vẫn ở commercial layer.
>
> **Quyết định không xoá mâu thuẫn — `RQ.md` vẫn nguyên văn nói ngược ở chính những chỗ đó.** Bằng chứng hai phía kèm section number được giữ nguyên tại [Risk-Register §4](./010-Planning/Risk-Register.md) và [PRD §10](./020-Requirements/PRD-Repro.md).
>
> **Bốn rủi ro mới do chính hai quyết định sinh ra** (`C-01-r`, `C-01-r2`, `C-02-r`, `C-02-r2`) được ghi tại [Risk-Register §4.1](./010-Planning/Risk-Register.md) — đọc trước khi lập kế hoạch V0.1.

> [!IMPORTANT]
> **Năm quyết định gate `GATE-01`…`GATE-05` cũng đã ✅ CHỐT 2026-08-14** — cùng ngày với M1/M2 nhưng là **quyết định khác, ghi bằng nhãn khác**. Nhãn của M1/M2 là `ĐÃ CHỐT 2026-08-14`; nhãn của năm gate này là `CHỐT GATE-0N — 2026-08-14`. Hai họ nhãn cố ý không trùng chuỗi để `grep` truy vết được riêng.
>
> | ID | Tên anh gọi | Quyết định |
> |---|---|---|
> | `GATE-01` | G1 | **Phase 0 technical spike = `Go`**, coi là **điều kiện đầu tư** (không phải task). `Sponsor` / `Manager` / owner **18/18** risk = **`@TrisJr`** |
> | `GATE-02` | G2 | **Spike trước, Epic/Story sau** — hoãn phân rã tới sau khi gate Phase 0 đóng |
> | `GATE-03` | G3 | **11 ADR → `Decision status: Accepted`**, duyệt bởi `@TrisJr` |
> | `GATE-04` | G4 | **Sàn Capsule Store** = object/file storage + một index + authn/authz/audit hook. **Cơ chế** auth vẫn `TBD` |
> | `GATE-05a` / `GATE-05b` | G5 | **TTL mặc định 30 ngày** · **crypto-shredding `MUST-V0.1`** |
>
> ⚠ **`GATE-03` và `GATE-05b` được anh quyết KHÁC khuyến nghị của PM.** Phản biện PM đã nêu trước khi anh chọn được giữ nguyên tại [pm-runs/2026-08-14-gates-g1-g5/escalations.md](./010-Planning/pm-runs/2026-08-14-gates-g1-g5/escalations.md) **E-01**.
>
> **Năm rủi ro mới do chính năm quyết định này sinh ra** (`GATE-01-r`, `GATE-03-r`, `GATE-04-r`, `GATE-05b-r`, `GATE-05b-r2`) tại [Risk-Register §4.2](./010-Planning/Risk-Register.md). **Ba mục KHÔNG bị đóng hộ** (`N-05`, `U-04`/`ACG-01`, `ACG-07`) tại §4.2.1 — đọc cả hai trước khi lập kế hoạch.
>
> ⚠ **Điều dễ đọc lệch nhất**: `GATE-01 = Go` **không** làm cho spike đo được. Bốn khoảng hở `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn nguyên ⇒ **chạy spike lúc này vẫn không kết luận được pass/fail**. Một **spike protocol** chốt bốn mục đó **chưa được viết**, và không thuộc phạm vi quyết định ngày 2026-08-14.

---

## 🗂️ Tài liệu lớn

| Tài liệu | Loại | Mô tả |
|---|---|---|
| [Charter-Repro](./010-Planning/Charter-Repro.md) | Project Charter | Business case, objectives, stakeholders, recommended next step |
| [Roadmap](./010-Planning/Roadmap.md) | Roadmap | Phase 0 (technical spike — **✅ `Go` từ 2026-08-14**) → V0.1 → V0.2 → V0.3 → Future + Non-Goals |
| [Timeline-Repro](./010-Planning/Estimates/Timeline-Repro.md) | Timeline & WBS | ✅ **`approved` 2026-08-15**. **Lớp execution đặt trên Roadmap** — 9 khối `P0-A`→`P5` (spike → V0.1 → phát hành → design partner → thương mại hoá), 10 vai, WBS task-level cho Phase 0, critical path hai nhánh, **6 blocker**. `T0` đã chốt (`W1` = 2026-08-17), Phase 0 = **10 tuần** (`P0-A` = `W1`–`W3`) ⇒ **`GATE-06` = 2026-10-23**. Capacity **solo** |
| [Spec-Spike-Protocol](./030-Specs/Spec-Spike-Protocol.md) | Technical Spec | **Thứ làm cho technical spike cho ra được pass/fail** *(2026-08-15)*. Đóng 4 `ACG` ở dạng **hypothesis có nhãn**: `ACG-07` Supported Execution Class · `ACG-01` rubric `matched`/`diverged` (là `U-04` — *"unknown lớn nhất của cả tài liệu"*) · `ACG-02`+`ACG-03` denominator = **7**, ngưỡng **`≥6/7`**. Kèm `U-13`, `U-16`, và **shortcut ledger**. ⚠️ Toàn bộ là `HYPOTHESIS`, nâng lên định nghĩa là `D2` sau `GATE-06` |
| [MTP-Spike-Phase-0](./035-QA/Test-Plans/MTP-Spike-Phase-0.md) | Master Test Plan | **Tài liệu QA đầu tiên của dự án** *(2026-08-15)*. Định nghĩa **cách đo**, không định nghĩa ngưỡng đạt: 6 metric × 4 thuộc tính · điều kiện đo bịt `ACG-04`/`ACG-05`/`ACG-11` · thu dữ liệu `SEC-008` · **ma trận 12 test `THREAT-018` + canary sink** · thủ tục quy trách nhiệm divergence |
| [Risk-Register](./010-Planning/Risk-Register.md) | Risk Register | 18 risk của `RQ.md §21` + 11 threat chưa có mitigation + 5 mâu thuẫn nội tại + **5 rủi ro sinh từ năm quyết định gate** (§4.2) + **6 rủi ro và 2 blocker sinh từ Timeline** (§4.4, họ `TL-*`) |
| [PRD-Repro](./020-Requirements/PRD-Repro.md) | PRD | Scope/MVP, `FR-001`…`FR-082`, Success Metrics, Validation Hypotheses, Open Questions |
| [NFR-Repro](./020-Requirements/NFR-Repro.md) | NFR | `N-01`…`N-19`, acceptance criteria gaps, và **những con số KHÔNG phải NFR** |
| [SDD-Repro](./030-Specs/Architecture/SDD-Repro.md) | SDD | Thiết kế hệ thống, capsule format, TBD register |
| [Spec-Security-Repro-Threat-Model](./030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Security Spec | 13 asset, 6 trust boundary, 19 threat, 43 requirement bảo mật |
| [Analysis-Target-Users](./050-Research/Analysis-Target-Users.md) | Research | Persona — **và mức độ bằng chứng của từng persona** |

---

## 🧭 Map of Content theo thư mục

| Thư mục | MOC | Nội dung |
|---|---|---|
| `010-Planning/` | [Planning-MOC](./010-Planning/Planning-MOC.md) | Chiến lược, roadmap, **timeline & WBS** (`Estimates/`), risk, run-state của PM |
| `020-Requirements/` | [Requirements-MOC](./020-Requirements/Requirements-MOC.md) | PRD, BRD, NFR, Use Cases |
| `022-User-Stories/` | [Stories-MOC](./022-User-Stories/Stories-MOC.md) | Epic và User Story — *rỗng theo **`GATE-02`**: hoãn phân rã tới sau khi gate Phase 0 đóng. Là **quyết định**, không phải trạng thái chờ* |
| `030-Specs/` | [Specs-MOC](./030-Specs/Specs-MOC.md) | SDD, ADR, Security Spec |
| `035-QA/` | [QA-MOC](./035-QA/QA-MOC.md) | Test plan, test case *(chưa có nội dung)* |
| `040-Design/` | [Design-MOC](./040-Design/Design-MOC.md) | UI/UX *(chưa có nội dung — Repro là CLI-first, xem `RQ.md §33.2`)* |
| `050-Research/` | [Research-MOC](./050-Research/Research-MOC.md) | Phân tích persona, nghiên cứu |
| `070-Deployment/` | [Deployment-MOC](./070-Deployment/Deployment-MOC.md) | Release, runbook *(chưa có nội dung)* |
| `080-Operations/` | [Operations-MOC](./080-Operations/Operations-MOC.md) | Incident, SLA *(chưa có nội dung)* |
| `999-Resources/` | [Resources-MOC](./999-Resources/Resources-MOC.md) | Template, Glossary, nguồn sự thật |

---

## 📖 Tra cứu nhanh

- **Thuật ngữ**: [Glossary](./999-Resources/Glossary.md) — từ vựng Repro, kèm đánh dấu rõ **4 thuật ngữ mà `RQ.md` dùng nhưng chưa định nghĩa**.
- **Nguồn sự thật gốc**: [RQ.md](./999-Resources/RQ.md) — *Repro — Product Proposal*, 1995 dòng.
- **Quyết định kiến trúc**: 11 ADR tại [Specs-MOC](./030-Specs/Specs-MOC.md). **Tất cả đã ở `Decision status: Accepted`** — duyệt bởi `@TrisJr` ngày 2026-08-14 (`GATE-03`). ⚠ **`Accepted` chỉ xác nhận hướng quyết định, KHÔNG đóng mục `Open items`** — 6 unknown (`U-01`, `U-02`, `U-03`, `U-04`, `U-13`, `U-20`) vẫn chưa giải; xem `GATE-03-r`.
- **Run-state của tài liệu**: [pm-runs/](./010-Planning/pm-runs/README.md) — dấu vết quyết định của từng run.

---

## ⚠️ Cách đọc bộ tài liệu này cho đúng

Ba quy ước xuyên suốt, đặt ở đây để không ai đọc lệch:

1. **Nguồn sự thật là `RQ.md`, cộng thêm các quyết định của anh — hai loại được đánh dấu khác nhau.** Mọi khẳng định trích từ `RQ.md` đều kèm được section number. Những gì `RQ.md` **không** nói mà anh đã quyết (tên người `@TrisJr`, TTL `30 ngày`, sàn Capsule Store, trạng thái duyệt ADR, sequencing story) đều được ghi kèm nhãn `D1`/`D2` hoặc `CHỐT GATE-0N` và **nói rõ là quyết định, không phải nội dung `RQ.md`**. Chỗ nào không có cả hai căn cứ đều ghi `TBD` — số lượng `TBD` nhiều là **có chủ ý**, không phải làm dở.
2. **Không có con số nào ở đây là cam kết sản phẩm.** Bốn ngưỡng của `RQ.md §24` (`≥80%`, `<5%`, `<10MB`, `<30s`) là *initial hypotheses* của technical spike — chính §24 nói vậy. Bốn con số khác (`2,431/1,827/1,203`, `60–90s`, `Hours/Days→Minutes`, `"within minutes"`) là **ví dụ minh hoạ hoặc câu hỏi**, không phải KPI. [NFR §6](./020-Requirements/NFR-Repro.md) liệt kê tường minh từng con số bị loại.
3. **Toàn bộ tài liệu vẫn ở `status: draft` — nhưng ADR thì đã được duyệt.** Hai trường khác nhau, đừng lẫn:
   - **`status:` trong frontmatter** — vẫn `draft` ở **mọi** file. Chưa có tài liệu nào được chuyển sang `approved`.
   - **`Decision status` của ADR** — **`Accepted`** ở cả 11 file từ 2026-08-14 (`GATE-03`), người duyệt `@TrisJr`. ⚠ Nhưng `Accepted` **không** đóng mục `Open items` — xem `GATE-03-r` tại [Risk-Register §4.2](./010-Planning/Risk-Register.md).

   **Người duyệt nay đã có**: `@TrisJr` — xem [Charter §5.1](./010-Planning/Charter-Repro.md), kèm cảnh báo rằng một người giữ mọi vai quản trị là trạng thái **dự án một người**, không có ai ở vị trí phản biện độc lập.

   **Persona vẫn là giả thuyết chưa validated** — điều này **không** đổi; không quyết định nào ngày 2026-08-14 chạm tới nó.
