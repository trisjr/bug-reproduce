---
id: INDEX-000
type: index
status: approved
project: repro
owner: "@product-manager"
created: 2026-08-14
updated: 2026-08-28
---

# 📚 Documentation Master Index

Trang chủ của kho tài liệu Repro. Mọi tài liệu đều nằm dưới `docs/` theo cấu trúc Dewey Decimal quy định tại [Documentation Structure Rule](../knowledge-base/99-Templates/Documents-Template.md) (RULE-001).

> **Dự án**: **Repro** — Open-source developer tool biến production bug thành reproducible local execution.  
> **Trạng thái**: ✅ **Phase 0 (Technical Spike) & Phase P1 (Gỡ khoá sau gate) HOÀN TẤT 100%**. Sẵn sàng cho **Gate D10 (Cấp vốn V0.1)** để chuyển sang Phase P2 (Build V0.1).  
> **Nguồn sự thật gốc**: [RQ.md](./999-Resources/RQ.md).

---

## 🚀 Bắt Đầu Từ Đâu

Đọc theo thứ tự này nếu lần đầu tiếp cận dự án:

| # | Tài liệu | Đọc để biết | Thời gian |
|---|---|---|---|
| 1 | [Charter-Repro](./010-Planning/Charter-Repro.md) | Ý tưởng là gì, vì sao đáng làm, stakeholder | ~5 phút |
| 2 | [BRD-001 — Problem Statement](./020-Requirements/BRD/BRD-001-Problem-Statement.md) | Vấn đề "cannot reproduce" trước khi nghe giải pháp | ~10 phút |
| 3 | [PRD-Repro](./020-Requirements/PRD-Repro.md) | Sản phẩm làm gì, phạm vi V0.1, $ACG\text{-}07$, Success Metrics | ~30 phút |
| 4 | [SDD-Repro](./030-Specs/Architecture/SDD-Repro.md) | Thiết kế hệ thống, format v1, authn/authz, 25 technical unknowns đã đóng | ~60 phút |
| 5 | [MTP-Repro-V0.1](./035-QA/Test-Plans/MTP-Repro-V0.1.md) | Chiến lược kiểm thử V0.1, đo lường $N\text{-}05$ trong CI, ma trận 33 SEC MUST | ~20 phút |
| 6 | [Timeline-Repro](./010-Planning/Estimates/Timeline-Repro.md) | **Nếu vào vai PM**: Lộ trình 9 khối $P0\text{-}A \to P5$, WBS chi tiết Phase 0 & P1 | ~15 phút |

---

## 🗂️ Danh Mục Tài Liệu Cốt Lõi

| Tài liệu | Loại | Mô tả |
|---|---|---|
| [Charter-Repro](./010-Planning/Charter-Repro.md) | Project Charter | Business case, mục tiêu, stakeholder, mô hình một người |
| [Roadmap](./010-Planning/Roadmap.md) | Roadmap | Lộ trình từ Phase 0 $\to$ P1 $\to$ V0.1 $\to$ V0.2 $\to$ V0.3 $\to$ Future |
| [Timeline-Repro](./010-Planning/Estimates/Timeline-Repro.md) | Timeline & WBS | WBS thực thi, cập nhật hoàn tất 100% Phase 0 (54.7 MD) và Phase P1 (34.5 MD) |
| [Risk-Register](./010-Planning/Risk-Register.md) | Risk Register | 18 rủi ro sản phẩm, 19 threats an ninh, các mâu thuẫn nội tại đã giải quyết |
| [PRD-Repro](./020-Requirements/PRD-Repro.md) | PRD | Functional Requirements `FR-001`…`FR-082`, Supported Execution Class, CLI verbs |
| [NFR-Repro](./020-Requirements/NFR-Repro.md) | NFR | Cam kết $N\text{-}05 \ge 90.0\%$, $N\text{-}06..09$, nâng cấp 4 ACGs thành định nghĩa sản phẩm |
| [SDD-Repro](./030-Specs/Architecture/SDD-Repro.md) | SDD | Thiết kế hệ thống toàn diện, Format v1, Authn/Authz Store, đóng 6 Open Items |
| [ADR-001..013](./030-Specs/Specs-MOC.md) | ADRs | 13 Quyết định kiến trúc đã phê duyệt (gồm ADR-012 Key Custody & ADR-013 Apache-2.0) |
| [MTP-Repro-V0.1](./035-QA/Test-Plans/MTP-Repro-V0.1.md) | Master Test Plan | Kế hoạch kiểm thử V0.1: 33 SEC MUST, $N\text{-}05$ trong CI, 12 test $T1$–$T12$ |
| [Spec-Security-Repro-Threat-Model](./030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Security Spec | 19 threats, 43 security requirements, L2 Sandbox cho $THREAT\text{-}018$, GDPR Art 17 |
| [Spec-Security-Data-Retention-Legal-Review](./030-Specs/Security/Spec-Security-Data-Retention-Legal-Review.md) | Legal Spec | Hồ sơ giải trình pháp lý Crypto-shredding & TTL 30 ngày gửi luật sư ngoài (Task `LG3`) |
| [Spec-Security-Data-Processing-Agreement](./030-Specs/Security/Spec-Security-Data-Processing-Agreement.md) | Legal Spec | Mẫu Thỏa thuận Xử lý Dữ liệu (DPA) chuẩn bị cho Design Partners (Task `LG4`) |
| [Stories-MOC](./022-User-Stories/Stories-MOC.md) | Agile Backlog | 5 Epics (`EPIC-01..05`) và 15 User Stories (`STORY-001..015`) chuẩn INVEST |
| [SLA-Security-Response](./080-Operations/SLAs/SLA-Security-Response.md) | SLA | Cam kết phản hồi sự cố an ninh và vá lỗ hổng (P0 $<24$h, P1 $<48$h, P2 $<7$d) |

---

## 🧭 Map of Content Theo Thư Mục

| Thư mục | MOC | Nội dung |
|---|---|---|
| `010-Planning/` | [Planning-MOC](./010-Planning/Planning-MOC.md) | Chiến lược, roadmap, timeline & WBS, risk register, run-state PM |
| `020-Requirements/` | [Requirements-MOC](./020-Requirements/Requirements-MOC.md) | PRD, BRD, NFR, Use Cases |
| `022-User-Stories/` | [Stories-MOC](./022-User-Stories/Stories-MOC.md) | 5 Epics và 15 User Stories Backlog V0.1 (**✅ Đã gỡ GATE-02**) |
| `030-Specs/` | [Specs-MOC](./030-Specs/Specs-MOC.md) | SDD, 13 ADRs, Threat Model, Spike Protocol |
| `035-QA/` | [QA-MOC](./035-QA/QA-MOC.md) | Master Test Plan V0.1, Spike Report, Performance Benchmark |
| `040-Design/` | [Design-MOC](./040-Design/Design-MOC.md) | UI/UX *(rỗng theo thiết kế — Repro là CLI-first)* |
| `050-Research/` | [Research-MOC](./050-Research/Research-MOC.md) | Phân tích persona người dùng |
| `070-Deployment/` | [Deployment-MOC](./070-Deployment/Deployment-MOC.md) | Hướng dẫn deploy, CHANGELOG & Release Notes (**✅ `v0.1.0` — 2026-08-28**) |
| `080-Operations/` | [Operations-MOC](./080-Operations/Operations-MOC.md) | Thỏa thuận mức dịch vụ SLA Security Response |
| `999-Resources/` | [Resources-MOC](./999-Resources/Resources-MOC.md) | Templates, Glossary, nguồn sự thật gốc RQ.md |

---

## 📖 Tra Cứu Nhanh

- **Thuật ngữ**: [Glossary](./999-Resources/Glossary.md) — Danh mục thuật ngữ chuẩn mực của Repro.
- **Nguồn sự thật gốc**: [RQ.md](./999-Resources/RQ.md) — *Repro — Product Proposal*, 1995 dòng.
- **Quy tắc đóng góp**: `CONTRIBUTING.md` & `CODE_OF_CONDUCT.md` (Repo Root).
- **Chính sách an ninh**: `SECURITY.md` (Repo Root).
- **Run-state PM**: [pm-runs/](./010-Planning/pm-runs/README.md) — Toàn bộ dấu vết điều phối từ Phase 0 đến Phase P1.
