---
id: MOC-999
type: moc
status: draft
project: TNMCORE-OS
created: 2026-02-26
updated: 2026-08-14
---

# 📂 999-Resources Map of Content (MOC)

Chào mừng tới danh mục Tài Nguyên của dự án. Đây là nơi chứa các mẫu, bảng thuật ngữ và ghi chép cuộc họp.

> [!NOTE]
> **Thư mục này dùng chung cho nhiều dự án**, không riêng Repro — cùng lý do với `Glossary.md`. Trường `project: TNMCORE-OS` ở frontmatter là **di sản của scaffold gốc**, giữ nguyên chờ quyết định; nó **không** có nghĩa các file trong đây chỉ thuộc TNMCORE-OS.

## 📋 Mục lục (Table of Contents)
1. [Glossary (Thuật ngữ)](#-glossary-thuật-ngữ)
2. [Templates (Bản mẫu)](#-templates-bản-mẫu)
3. [Meeting Notes (Ghi chép cuộc họp)](#-meeting-notes-ghi-chép-cuộc-họp)
4. [Nguồn của dự án Repro](#-nguồn-của-dự-án-repro)

---

## 📖 Glossary (Thuật ngữ)

- [Glossary](./Glossary.md) — Định nghĩa thuật ngữ nghiệp vụ và kỹ thuật. Chứa **từ vựng sản phẩm Repro** (`Repro Capsule`, `Execution Replay`, `Execution Diff`, `Divergence`, `Replay Boundary`…) và 3 thuật ngữ OTP của một dự án khác. **Cố ý là file đa dự án** — vì vậy nó không mang trường `project`.

## 📂 Templates (Bản mẫu)

*Các mẫu chuẩn nhằm đảm bảo tính nhất quán cho tài liệu dự án. Tra [RULE-001 §Document Type Mapping](../../knowledge-base/99-Templates/Documents-Template.md) để biết mẫu nào dùng cho thư mục nào.*

| Bản mẫu | Dùng cho |
|---|---|
| [Template-Analysis](./Templates/Template-Analysis.md) | Research / Analysis — `050-Research/` |
| [Template-Component](./Templates/Template-Component.md) | Design System component — `040-Design/Design-System/` |
| [Template-Daily-Report](./Templates/Template-Daily-Report.md) | Báo cáo hàng ngày của Dev |
| [Template-Incident-Report](./Templates/Template-Incident-Report.md) | Incident Report — `080-Operations/Incidents/` |
| [Template-PRD](./Templates/Template-PRD.md) | PRD — `020-Requirements/` |
| [Template-Project-Charter](./Templates/Template-Project-Charter.md) | Project Charter — `010-Planning/` |
| [Template-Release-Notes](./Templates/Template-Release-Notes.md) | Release Notes — `070-Deployment/Releases/` |
| [Template-Report-Unit](./Templates/Template-Report-Unit.md) | Báo cáo đơn vị |
| [Template-Risk-Register](./Templates/Template-Risk-Register.md) | Risk Register — `010-Planning/` |
| [Template-SDD](./Templates/Template-SDD.md) | System Design Document — `030-Specs/Architecture/` |
| [Template-Spec](./Templates/Template-Spec.md) | Technical Spec — `030-Specs/` |
| [Template-SRS](./Templates/Template-SRS.md) | SRS — `020-Requirements/` |
| [Template-Status-Report](./Templates/Template-Status-Report.md) | Status Report — `010-Planning/` |
| [Template-Test-Plan](./Templates/Template-Test-Plan.md) | Master Test Plan — `035-QA/Test-Plans/` |
| [Template-WBS-ETA](./Templates/Template-WBS-ETA.md) | WBS / ETA — `010-Planning/Estimates/` |

## 🗒️ Meeting Notes (Ghi chép cuộc họp)

`Meeting-Notes/` — **chưa tạo**. `RULE-001` dành thư mục này cho `{Type}-{Date}.md`; repo chưa có ghi chép cuộc họp nào.

## 🧭 Nguồn của dự án Repro

- [RQ](./RQ.md) — **Concept proposal gốc của Repro, 1995 dòng.** Đây là **nguồn sự thật duy nhất** mà toàn bộ bộ tài liệu sản phẩm được dẫn xuất từ đó.

> [!IMPORTANT]
> `RQ.md` là **đề xuất**, không phải đặc tả đã được validate. Nó **tự khai 16 câu hỏi chưa có đáp án** ở §38 và **tự nói ngược** ở hai chỗ (`M1`, `M2` — đã được chốt ngày 2026-08-14 nhưng nguyên văn `RQ.md` vẫn giữ mâu thuẫn). Mọi trích dẫn từ file này phải kèm **số section**.

---

## 📚 Tài liệu tham khảo
- [Documentation Master Index](../000-Index.md)
- [Documentation Structure Rule (RULE-001)](../../knowledge-base/99-Templates/Documents-Template.md)

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Meeting-Notes/` — **thư mục chưa bao giờ tồn tại trong repo**; link chết đó đã được gỡ ngày 2026-08-14. Cùng ngày, mục Templates được bổ sung từ **1 lên đủ 15 bản mẫu** đang có trong `Templates/`, và `RQ.md` được đưa vào MOC (trước đó nó nằm trong thư mục nhưng không được index ở đâu). Không có file nào bị xoá.
