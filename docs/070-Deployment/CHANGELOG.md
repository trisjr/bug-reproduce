---
id: CHANGELOG-001
type: changelog
status: active
project: repro
created: 2026-08-28
updated: 2026-08-28
---

# 📜 Changelog — Repro

Ghi lại mọi thay đổi **phần mềm** đáng chú ý của dự án Repro.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); đánh phiên bản theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> [!NOTE]
> File này chỉ ghi thay đổi **phần mềm**, tính từ V0.1.0 trở đi. Lịch sử **tài liệu** của giai đoạn trước đó (Phase 0 → P1) nằm ở [`docs/010-Planning/pm-runs/`](../010-Planning/pm-runs/README.md), không lặp lại tại đây.
>
> Release notes đầy đủ của từng phiên bản đặt tại [`Releases/`](./Releases/).

---

## [Unreleased]

Chưa có thay đổi nào sau `v0.1.0`.

---

## [0.1.0] — 2026-08-28

Bản phát hành công khai đầu tiên. Khoá lại **Core Engine**: capture → replay → verify.
Release notes đầy đủ: [`Release-V0.1.0.md`](./Releases/Release-V0.1.0.md).

### Added

- **Monorepo 5 workspace package** (ESM-native `npm workspaces`, Node.js ≥ 22):
  - `@repro/core` — domain type & cryptography: Manifest v1, envelope encryption AES-256-GCM, HMAC-SHA256 Digest-Before-Parse (`SEC-027`), memory zeroization (`SEC-038`), Key Custody REST client, tar POSIX ustar an toàn Zip-Slip (`THREAT-009`).
  - `@repro/node` — in-process capture SDK: `AsyncLocalStorage` context tracking, interceptor cho `pg` và `http`/`https`, redaction PII/PAN giữ format kèm Luhn (`SEC-002`, `SEC-005`), bounded ring buffer 100 rows / 64 KB (`SEC-008`). **Zero external production dependency** (`SEC-037`).
  - `@repro/replay` — deterministic replay engine: wire mocking adapter (PostgreSQL, outbound HTTP, feature flag), Virtual Clock đóng băng tại `T0` (`ADR-010`), Synthetic Request Injector, Layer 1 write defense `L1AstSqlFilter` / `HttpVerbGuard` / `FallbackGuard` fail-closed (`ADR-005`).
  - `@repro/diff` — verification & diff engine: 4 canonical normalizer (`ADR-006`), Two-Tier Equivalence (`Story-13`), 6-Step Divergence Attribution (`Story-14`), terminal diff UI tuân thủ ngôn từ hợp đồng §20.16.
  - `@repro/cli` — 6 verb `list` / `pull` / `inspect` / `replay` / `diff` / `verify`, cùng `purge` (crypto-shredding, GDPR Art. 17 — `Story-08`) và `keys` rotate.
- **Repro Capsule** (`.repro.tar.gz`) — artifact portable, tự chứa, mã hoá; replay được sau khi môi trường gốc đã bị phá huỷ.
- **Bộ kiểm chứng**: 111 test / 24 suite chạy native trên `node:test` (unit · integration · security · fidelity), gồm ma trận side-effect `T1`–`T12` và fidelity benchmark `N-05`.
- **POSIX permission & Git Guard** (`SEC-042`, `SEC-043`) — ép `0600` cho file capsule, `0700` cho thư mục; chặn `repro pull` vào repo git chưa cấu hình `.gitignore`.
- **GitHub Pages site** kèm workflow deploy (`.github/workflows/pages.yml`).
- **Repo metadata**: `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.

### Security

- 33/33 requirement `SEC MUST-V0.1` được kiểm chứng bằng test tự động.
- `escaped_side_effects == 0` trên toàn bộ 12 kịch bản `T1`–`T12`, đối chiếu Canary Sink.
- Redaction chạy **tại thời điểm capture, trước khi lưu** — không có đường ghi dữ liệu thô xuống storage.
- Digest-Before-Parse chặn Zip-Slip và decompression bomb (trần 50 MB) trước mọi thao tác parse.

### Known limitations

- **Chưa publish lên npm registry** — phát hành dạng source qua GitHub; cài đặt bằng cách clone repo.
- **Chưa có bước build** — package ship TypeScript nguồn, chạy bằng `--experimental-strip-types`.
- **Ngoài phạm vi V0.1**: Redis, Kafka, background job, multi-service replay, Python, Go, browser replay, regression test generation.
- **Lớp bug chưa hỗ trợ đầy đủ**: randomness (chỉ UUID capture where practical), race giữa nhiều execution, race condition.

---

[Unreleased]: https://github.com/trisjr/bug-reproduce/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/trisjr/bug-reproduce/releases/tag/v0.1.0
