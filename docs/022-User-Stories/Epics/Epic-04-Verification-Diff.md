---
id: EPIC-04
type: epic
status: approved
project: repro
owner: "@product-owner"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/PRD-Repro.md"
---

# 🔍 Epic-04 — Execution Verification & First-Class Execution Diff Engine

## 1. Overview & Business Value

Epic này xây dựng động cơ **Execution Verification** và **Execution Diff** ([ADR-006](../../030-Specs/Architecture/ADR-006-Execution-Verification-By-Equivalence.md) & [ADR-011](../../030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md)). Động cơ có nhiệm vụ so sánh đối chiếu chuỗi `InteractionUnit` ($U_0 \to U_i \dots \to U_\infty$) giữa môi trường production và local, áp dụng Rubric 2 tầng để đưa ra phán quyết nhị phân (`Execution matched` / `Execution diverged`), tự động quy trách nhiệm nguyên nhân phân kỳ qua quy trình 6 bước, và sinh ra báo cáo so sánh có giá trị chẩn đoán độc lập.

- **Parent Requirements**: [PRD-Repro §5.4](../../020-Requirements/PRD-Repro.md) (`FR-039` .. `FR-046`).
- **Target Workstream**: `WS-4` (Verification & Diff).
- **Target Persona**: Software Engineer & QA Engineer.

---

## 2. In-Scope User Stories

1. **`Story-13`**: Động Cơ So Sánh Tương Đương 2 Tầng (Inconclusive Gate & Rubric 4 Phép Chuẩn Hoá $ACG\text{-}01$).
2. **`Story-14`**: Quy Trình Phân Lập Nguyên Nhân Phân Kỳ 6 Bước Tự Động (Divergence Attribution Protocol).
3. **`Story-15`**: Trình Bày Báo Cáo Execution Diff Theo Cặp Production/Local (`repro diff`).

---

## 3. High-Level Acceptance Criteria (DoD)

- [ ] **AC-01 (Equivalence Precision)**: Phân biệt tuyệt đối giữa `Replay completed` và `Execution matched` ($§10$), đảm bảo chỉ số $N\text{-}05 \ge 90.0\%$ trên Supported Execution Class.
- [ ] **AC-02 (Attribution Accuracy)**: Phân loại chính xác 100% các trường hợp phân kỳ do redaction (`redaction`), thiếu dữ liệu (`incomplete-capture`), chạm trần kích thước (`truncated`), lệch phiên bản (`version-drift`), hoặc ngoài class (`out-of-scope-determinism`).
- [ ] **AC-03 (Actionable Diff Output)**: Lệnh `repro diff` hiển thị danh sách đánh số các điểm phân kỳ, nhóm theo loại input (Database, HTTP, Flags, Clock), đối chiếu trực quan `Production → / Local →`.
- [ ] **AC-04 (Verification Fix Contract)**: Lệnh `repro verify` so sánh trạng thái trước/sau khi sửa code và in đúng thông điệp hợp đồng chuẩn: `✓ Captured execution no longer reproduces` ($§20.16$).
