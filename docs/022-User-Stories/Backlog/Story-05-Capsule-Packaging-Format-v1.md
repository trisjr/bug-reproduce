---
id: STORY-005
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-02-Capsule-Store.md"
---

# 📝 Story-05 — Đóng Gói Định Dạng Repro Capsule Format v1

## 1. User Story Statement

**As a** Software Architect / Engineer,  
**I want to** capsule được đóng gói thành tệp nén `.repro.tar.gz` tuân thủ nghiêm ngặt đặc tả Format v1 ([ADR-002](../../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md)),  
**So that** artifact có tính di động cao, tự chứa về mặt dữ liệu, và có khả năng tương thích ngược trong suốt vòng đời dự án.

- **Parent Epic**: [Epic-02 — Capsule & Store](../Epics/Epic-02-Capsule-Store.md)
- **Target Workstream**: `WS-2` (Capsule & Store)
- **Estimation**: 3.0 MD
- **Parent Requirements**: `FR-017`, `FR-018`, `ADR-002`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Tạo Cấu Trúc Archive Chuẩn v1
- **Given** một execution bị lỗi đã hoàn tất capture và redaction,
- **When** Capsule Writer đóng gói artifact,
- **Then** tạo ra tệp `.repro.tar.gz` chứa đầy đủ 4 entry: `manifest.json`, `interactions.jsonl`, `runtime_metadata.json`, và `checksums.sha256`.

### Scenario 2: Cấu Trúc Manifest v1 Bắt Buộc
- **Given** file `manifest.json` được tạo trong capsule,
- **When** kiểm tra các trường dữ liệu bắt buộc,
- **Then** `manifest.json` chứa `format_version: "1.0.0"`, `capsule_id` (UUIDv7), `created_at`, `target_commit`, `class_assessment` ($ACG\text{-}07$), `key_id`, và `encryption_metadata`.

### Scenario 3: Bảng Checksum Từng Entry
- **Given** các file dữ liệu trước khi nén vào tarball,
- **When** Capsule Writer tính toán hash,
- **Then** file `checksums.sha256` chứa mã SHA-256 digest của từng entry độc lập để phát hiện hỏng hóc hoặc can thiệp dữ liệu.
