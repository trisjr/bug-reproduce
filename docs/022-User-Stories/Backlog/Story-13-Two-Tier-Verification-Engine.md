---
id: STORY-013
type: story
status: approved
project: repro
owner: "@quality-assurance"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-04-Verification-Diff.md"
---

# 📝 Story-13 — Động Cơ So Sánh Tương Đương Hai Tầng (Two-Tier Verification Engine)

## 1. User Story Statement

**As a** Quality Assurance Engineer / Developer,  
**I want to** hệ thống so sánh chuỗi Interaction Units ($U_0 \to U_i \dots \to U_\infty$) qua Rubric 2 tầng chuẩn mực ($ACG\text{-}01$),  
**So that** Repro phân biệt chính xác giữa `Replay completed` và `Execution matched` ($§10$), bảo đảm không tạo ra cảm giác an toàn giả tạo (False Confidence).

- **Parent Epic**: [Epic-04 — Verification & Diff](../Epics/Epic-04-Verification-Diff.md)
- **Target Workstream**: `WS-4` (Verification & Diff)
- **Estimation**: 3.5 MD
- **Parent Requirements**: `FR-039` .. `FR-041`, `N-05`, `ADR-006`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Bốn Phép Chuẩn Hoá Tương Tác Bắt Buộc
- **Given** chuỗi interaction thu được từ replay local,
- **When** đưa qua bộ chuẩn hoá (Normalization Engine),
- **Then** thực hiện: (1) SQL Fingerprinting (chuẩn hoá parameter markers), (2) URL Path Templating, (3) JSON Canonical Form (sắp xếp keys), và (4) Header Allowlisting trước khi so sánh.

### Scenario 2: Cổng Tầng 1 — Inconclusive Gate
- **Given** một execution bị lỗi crash do môi trường ngoài phạm vi (ví dụ host OS hết bộ nhớ),
- **When** Verification Engine kiểm tra điều kiện tiên quyết,
- **Then** Engine đánh dấu trạng thái `inconclusive` và loại khỏi mẫu số tính tỷ lệ $N\text{-}05$ SLA sản phẩm.

### Scenario 3: Rubric Tầng 2 — Kết Luận Nhị Phân `Execution matched`
- **Given** Inbound $U0$ khớp, chuỗi $U_i$ khớp $100\%$ về thứ tự & fingerprint, và $U\infty$ khớp về status code / exception type,
- **When** Engine kết luận,
- **Then** in ra thông báo `💥 BUG REPRODUCED (✓ Execution matched)` và ghi nhận thành công cho metric $N\text{-}05$.
