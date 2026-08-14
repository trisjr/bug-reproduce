---
id: INDEX-000
type: index
status: draft
created: 2026-08-14
---

# 📚 Documentation Master Index

Trang chủ của kho tài liệu. Mọi tài liệu đều nằm dưới `docs/` theo cấu trúc Dewey Decimal quy định tại [Documentation Structure Rule](../knowledge-base/99-Templates/Documents-Template.md) (RULE-001).

> **Dự án hiện tại**: **Repro** — open-source developer tool biến production bug thành reproducible local execution.
> **Trạng thái**: `Concept`. Chưa có code (`src/` và `test/` còn rỗng) — toàn bộ tài liệu kỹ thuật là **thiết kế trước khi hiện thực**.
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

> [!IMPORTANT]
> **Hai mâu thuẫn nội tại của `RQ.md` đang chờ quyết định** — chúng ảnh hưởng tới cách đọc gần như mọi tài liệu bên dưới:
> - **M1** — regression test generation ở V0.1 hay V0.2, kéo theo **North Star Metric của V0.1 có đo được bằng V0.1 hay không**.
> - **M2** — access control thuộc OSS core hay commercial layer, kéo theo **bản self-host có control bảo mật hay không**.
>
> Cả hai được ghi trung thực cả hai phía tại [Risk-Register §4](./010-Planning/Risk-Register.md) và [PRD §10](./020-Requirements/PRD-Repro.md).

---

## 🗂️ Tài liệu lớn

| Tài liệu | Loại | Mô tả |
|---|---|---|
| [Charter-Repro](./010-Planning/Charter-Repro.md) | Project Charter | Business case, objectives, stakeholders, recommended next step |
| [Roadmap](./010-Planning/Roadmap.md) | Roadmap | Phase 0 (technical spike) → V0.1 → V0.2 → V0.3 → Future + Non-Goals |
| [Risk-Register](./010-Planning/Risk-Register.md) | Risk Register | 18 risk của `RQ.md §21` + 11 threat chưa có mitigation + 5 mâu thuẫn nội tại |
| [PRD-Repro](./020-Requirements/PRD-Repro.md) | PRD | Scope/MVP, `FR-001`…`FR-082`, Success Metrics, Validation Hypotheses, Open Questions |
| [NFR-Repro](./020-Requirements/NFR-Repro.md) | NFR | `N-01`…`N-19`, acceptance criteria gaps, và **những con số KHÔNG phải NFR** |
| [SDD-Repro](./030-Specs/Architecture/SDD-Repro.md) | SDD | Thiết kế hệ thống, capsule format, TBD register |
| [Spec-Security-Repro-Threat-Model](./030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Security Spec | 13 asset, 6 trust boundary, 19 threat, 43 requirement bảo mật |
| [Analysis-Target-Users](./050-Research/Analysis-Target-Users.md) | Research | Persona — **và mức độ bằng chứng của từng persona** |

---

## 🧭 Map of Content theo thư mục

| Thư mục | MOC | Nội dung |
|---|---|---|
| `010-Planning/` | [Planning-MOC](./010-Planning/Planning-MOC.md) | Chiến lược, roadmap, risk, run-state của PM |
| `020-Requirements/` | [Requirements-MOC](./020-Requirements/Requirements-MOC.md) | PRD, BRD, NFR, Use Cases |
| `022-User-Stories/` | [Stories-MOC](./022-User-Stories/Stories-MOC.md) | Epic và User Story *(chưa có nội dung cho Repro)* |
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
- **Quyết định kiến trúc**: 11 ADR tại [Specs-MOC](./030-Specs/Specs-MOC.md). Tất cả đang ở `Decision status: Proposed` — **chưa ai duyệt**.
- **Run-state của tài liệu**: [pm-runs/](./010-Planning/pm-runs/README.md) — dấu vết quyết định của từng run.

---

## ⚠️ Cách đọc bộ tài liệu này cho đúng

Ba quy ước xuyên suốt, đặt ở đây để không ai đọc lệch:

1. **Nguồn sự thật duy nhất là `RQ.md`.** Mọi khẳng định trong bộ tài liệu này đều trích được section number của nó. Chỗ nào không có căn cứ đều ghi `TBD` — số lượng `TBD` nhiều là **có chủ ý**, không phải làm dở.
2. **Không có con số nào ở đây là cam kết sản phẩm.** Bốn ngưỡng của `RQ.md §24` (`≥80%`, `<5%`, `<10MB`, `<30s`) là *initial hypotheses* của technical spike — chính §24 nói vậy. Bốn con số khác (`2,431/1,827/1,203`, `60–90s`, `Hours/Days→Minutes`, `"within minutes"`) là **ví dụ minh hoạ hoặc câu hỏi**, không phải KPI. [NFR §6](./020-Requirements/NFR-Repro.md) liệt kê tường minh từng con số bị loại.
3. **Toàn bộ tài liệu ở `status: draft`.** Chưa có quy trình phê duyệt, chưa có người duyệt. Persona là **giả thuyết chưa validated**; ADR là **đề xuất chưa được chấp thuận**.
