---
id: MOC-STORIES
type: moc
status: approved
project: repro
owner: "@product-owner"
created: 2026-02-04
updated: 2026-08-28
---

# 📚 User Stories Map of Content (MOC)

Agile backlog: Toàn bộ danh mục Epic và User Story của Repro V0.1. Xem thêm [Documentation Master Index](../000-Index.md).

---

## 1. Trạng Thái Hiện Tại — ✅ ĐÃ GỠ `GATE-02` (Phase P1 — 2026-08-28)

Toàn bộ **hai điều kiện gỡ hoãn** của `GATE-02` đã được hoàn tất trọn vẹn:
1. **`GATE-06` (§39) đã được phê duyệt `CÓ` ngày 2026-08-28**: Technical Spike Phase 0 đã hoàn thành 100% với Composite Fail-Closed $7/7$ ($100.0\%$), $R_{em} = 100\%$, `escaped_side_effects = 0`.
2. **Chốt ngưỡng cam kết $N\text{-}05$ và Định nghĩa Sản phẩm $ACG\text{-}01/02/03/07$ tại Task `D1` & `D2`**: Execution Match Rate đạt $R_{em} \ge 90.0\%$ trên Supported Execution Class, xóa bỏ hoàn toàn các vùng $TBD$.

---

## 2. Danh Mục 5 Epics V0.1

| Epic ID | Tiêu Đề Epic | Target Workstream | Deliverable Path |
|---|---|---|---|
| **`EPIC-01`** | **In-Process SDK & Bounded Production Capture** | `WS-1` & `WS-6` | [Epic-01-SDK-Capture.md](./Epics/Epic-01-SDK-Capture.md) |
| **`EPIC-02`** | **Repro Capsule Format v1 & Private Key Custody Store** | `WS-2` & `WS-6` | [Epic-02-Capsule-Store.md](./Epics/Epic-02-Capsule-Store.md) |
| **`EPIC-03`** | **Deterministic Local Replay Runtime & Fail-Closed Write Defense** | `WS-3` & `WS-6` | [Epic-03-Replay-Runtime.md](./Epics/Epic-03-Replay-Runtime.md) |
| **`EPIC-04`** | **Execution Verification & First-Class Execution Diff Engine** | `WS-4` | [Epic-04-Verification-Diff.md](./Epics/Epic-04-Verification-Diff.md) |
| **`EPIC-05`** | **Unified Developer CLI & Operational Admin Tooling** | `WS-5` & `WS-7` | [Epic-05-CLI-Admin.md](./Epics/Epic-05-CLI-Admin.md) |

---

## 3. Danh Mục 15 User Stories (Backlog V0.1)

| Story ID | Tiêu Đề User Story | Thuộc Epic | Estimation | Deliverable Path |
|---|---|---|:---:|---|
| **`STORY-001`** | Cài Đặt và Khởi Tạo SDK In-Process `@repro/node` | `EPIC-01` | 2.0 MD | [Story-01-SDK-Installation-Init.md](./Backlog/Story-01-SDK-Installation-Init.md) |
| **`STORY-002`** | Đánh Chặn & Ghi Nhận 8 Nhóm Tương Tác Cốt Lõi | `EPIC-01` | 3.5 MD | [Story-02-Capture-Eight-Groups.md](./Backlog/Story-02-Capture-Eight-Groups.md) |
| **`STORY-003`** | Pipeline Khử Dữ Liệu Nhạy Cảm (Redaction) Format-Preserving | `EPIC-01` | 2.5 MD | [Story-03-Redaction-Pipeline.md](./Backlog/Story-03-Redaction-Pipeline.md) |
| **`STORY-004`** | Bộ Nhớ Đệm Bất Đồng Bộ & Giới Hạn Kích Thước $SEC\text{-}008$ | `EPIC-01` | 2.5 MD | [Story-04-Async-Bounded-Buffer.md](./Backlog/Story-04-Async-Bounded-Buffer.md) |
| **`STORY-005`** | Đóng Gói Định Dạng Repro Capsule Format v1 | `EPIC-02` | 3.0 MD | [Story-05-Capsule-Packaging-Format-v1.md](./Backlog/Story-05-Capsule-Packaging-Format-v1.md) |
| **`STORY-006`** | Giao Thức Mã Hoá Envelope AES-256-GCM & Kiểm Tra Toàn Vẹn $SEC\text{-}027$ | `EPIC-02` | 3.0 MD | [Story-06-Envelope-Encryption-Digest.md](./Backlog/Story-06-Envelope-Encryption-Digest.md) |
| **`STORY-007`** | Tích Hợp Private Key Custody Store & Quản Lý Định Danh Khoá | `EPIC-02` | 3.0 MD | [Story-07-Key-Custody-Integration.md](./Backlog/Story-07-Key-Custody-Integration.md) |
| **`STORY-008`** | Cơ Chế Tự Động Huỷ Khoá TTL 30 Ngày & Lệnh Crypto-Shredding `repro purge` | `EPIC-02` | 2.5 MD | [Story-08-Crypto-Shredding-Purge.md](./Backlog/Story-08-Crypto-Shredding-Purge.md) |
| **`STORY-009`** | Nạp Capsule & Kích Hoạt Inbound Request Replay Cục Bộ | `EPIC-03` | 2.5 MD | [Story-09-Replay-Inbound-Injection.md](./Backlog/Story-09-Replay-Inbound-Injection.md) |
| **`STORY-010`** | Đánh Chặn & Phát Lại Dữ Liệu PostgreSQL & External HTTP API | `EPIC-03` | 3.5 MD | [Story-10-Database-HTTP-Mocking.md](./Backlog/Story-10-Database-HTTP-Mocking.md) |
| **`STORY-011`** | Tịnh Tiến Thời Gian Ảo Tất Định (Virtual Clock Progression) | `EPIC-03` | 2.5 MD | [Story-11-Virtual-Clock-Progression.md](./Backlog/Story-11-Virtual-Clock-Progression.md) |
| **`STORY-012`** | Lá Chắn Chống Tác Dụng Phụ Fail-Closed Hai Tầng ($L1+L2$) | `EPIC-03` | 3.5 MD | [Story-12-Default-Deny-Write-Defense.md](./Backlog/Story-12-Default-Deny-Write-Defense.md) |
| **`STORY-013`** | Động Cơ So Sánh Tương Đương Hai Tầng (Two-Tier Verification Engine) | `EPIC-04` | 3.5 MD | [Story-13-Two-Tier-Verification-Engine.md](./Backlog/Story-13-Two-Tier-Verification-Engine.md) |
| **`STORY-014`** | Quy Trình Phân Lập Nguyên Nhân Phân Kỳ Tự Động 6 Bước | `EPIC-04` | 3.0 MD | [Story-14-Divergence-Attribution-Protocol.md](./Backlog/Story-14-Divergence-Attribution-Protocol.md) |
| **`STORY-015`** | Trình Bày Báo Cáo Execution Diff Trực Quan & Lệnh `repro verify` | `EPIC-04` / `05` | 2.5 MD | [Story-15-Execution-Diff-CLI-Presentation.md](./Backlog/Story-15-Execution-Diff-CLI-Presentation.md) |

---

## 4. Liên Kết Liên Quan

- [PRD-Repro](../020-Requirements/PRD-Repro.md) — Product Requirements Document.
- [NFR-Repro](../020-Requirements/NFR-Repro.md) — Non-Functional Requirements.
- [MTP-Repro-V0.1](../035-QA/Test-Plans/MTP-Repro-V0.1.md) — Master Test Plan V0.1.
- [Documentation Master Index](../000-Index.md)
