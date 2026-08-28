---
id: EPIC-02
type: epic
status: approved
project: repro
owner: "@product-owner"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/PRD-Repro.md"
---

# 📦 Epic-02 — Repro Capsule Format v1 & Private Key Custody Store

## 1. Overview & Business Value

Epic này xây dựng cấu trúc định dạng lưu trữ bất biến **Repro Capsule Format v1** (`.repro.tar.gz`) và hệ thống **Capsule Store** tự lưu trữ (Self-Hosted Private Storage). Tích hợp giao thức **Envelope Encryption (AES-256-GCM)** và kiến trúc **Key Custody** ([ADR-012](../../030-Specs/Architecture/ADR-012-Key-Custody.md)) để thực thi **Crypto-shredding** ($SEC\text{-}016$, GDPR Art 17) và chính sách tự động huỷ theo vòng đời TTL 30 ngày (`FR-024`).

- **Parent Requirements**: [PRD-Repro §5.2 & §5.6](../../020-Requirements/PRD-Repro.md) (`FR-017` .. `FR-026`, `FR-054`, `FR-055`).
- **Target Workstream**: `WS-2` (Capsule & Store) & `WS-6` (Security MUST-V0.1).
- **Target Persona**: SRE / DevOps & Security Auditor.

---

## 2. In-Scope User Stories

1. **`Story-05`**: Đóng gói và Nén Capsule Format v1 (`manifest.json`, `interactions.jsonl`, `runtime_metadata.json`, `checksums.sha256`).
2. **`Story-06`**: Giao thức Mã hoá Hai Tầng (Envelope Encryption AES-256-GCM & Payload Digest HMAC-SHA256 $SEC\text{-}027$).
3. **`Story-07`**: Tích hợp Private Key Custody Store & Quản lý Định danh Khoá `key_id` ([ADR-012](../../030-Specs/Architecture/ADR-012-Key-Custody.md)).
4. **`Story-08`**: Cơ chế Tự động Huỷ Khoá TTL 30 Ngày & Lệnh Huỷ Vĩnh viễn Crypto-Shredding (`repro purge`).

---

## 3. High-Level Acceptance Criteria (DoD)

- [ ] **AC-01 (Format Integrity)**: File capsule v1 được đóng gói đúng chuẩn tar.gz, chứa đầy đủ 4 entry bắt buộc và metadata `class_assessment` ($ACG\text{-}07$).
- [ ] **AC-02 (Digest-Before-Parse)**: Runtime từ chối giải nén capsule ngay lập tức nếu mã HMAC-SHA256 payload không khớp ($SEC\text{-}027$).
- [ ] **AC-03 (Zero Key Storage)**: File capsule vật lý tuyệt đối không chứa khoá giải mã DEK; DEK chỉ được nạp just-in-time từ Key Custody Store.
- [ ] **AC-04 (Irreversible Shredding)**: Thực thi lệnh `repro purge` $\to$ DEK bị ghi đè và xóa tại Key Custody Store $\to$ 100% các bản sao capsule phân tán lập tức không thể giải mã.
- [ ] **AC-05 (Self-Hosted Storage)**: Hỗ trợ backend lưu trữ Local Filesystem & S3-compatible Object Storage (MinIO, AWS S3 Private VPC).
