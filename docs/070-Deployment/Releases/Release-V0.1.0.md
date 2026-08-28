---
id: RELEASE-V0.1.0
type: release-notes
status: released
project: repro
version: v0.1.0
created: 2026-08-28
updated: 2026-08-28
---

# 🚀 Release Notes — Repro V0.1.0 *(Core Engine)*

> **Production happened. Now replay it.**
>
> Bản phát hành công khai đầu tiên của Repro. V0.1.0 khoá lại **Core Engine**: capture in-process, replay tất định cục bộ, verification diff hai tầng và CLI thống nhất — trên 5 workspace package của monorepo.

---

## 1. Release Info

| Trường | Giá trị |
|---|---|
| **Version** | `v0.1.0` |
| **Date** | 2026-08-28 |
| **Git tag** | `v0.1.0` |
| **Commit** | Xem `git rev-parse v0.1.0` |
| **Environment** | **Self-hosted only** — theo [ADR-009](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md), self-hosting là **bắt buộc từ V0.1**, không phải tuỳ chọn về sau. Không có managed service, không có SaaS endpoint. |
| **Distribution** | Source-only qua GitHub (public repo, MIT). **Chưa publish lên npm registry** — xem §4. |
| **Gate** | `D10` — Release Candidate V0.1 → **phát hành**, trên nền `CLEAN_PASS` của [Phase P2 verdict](../../010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict.md). |
| **Owner** | `@TrisJr` |

---

## 2. What's New

Đây là bản phát hành **đầu tiên** — toàn bộ nội dung dưới đây là mới. Trước V0.1.0, lịch sử repo là lịch sử **tài liệu và technical spike** (Phase 0 → P1), không có phần mềm nào được phát hành.

### 2.1. Features

#### 🧱 Monorepo 5 package (ESM-native `npm workspaces`)

| Package | Vai trò | Nội dung chính |
|---|---|---|
| `@repro/core` | Domain Types & Cryptography | Zod/JSON Schema, Manifest v1, envelope encryption AES-256-GCM, HMAC-SHA256 Digest-Before-Parse (`SEC-027`), memory zeroization (`SEC-038`), Key Custody REST client, tar POSIX ustar an toàn Zip-Slip (`THREAT-009`). |
| `@repro/node` | In-Process Capture SDK | `AsyncLocalStorage` context tracking, monkey-patch interceptor cho `pg` và `http`/`https`, scrubbing PII/PAN giữ nguyên format kèm Luhn (`SEC-002`, `SEC-005`), bounded ring buffer 100 rows / 64 KB (`SEC-008`). **Zero external production dependency (`SEC-037`)**. |
| `@repro/replay` | Deterministic Replay Engine | Wire Mocking Adapter (PostgreSQL query matcher, outbound HTTP responder, feature flag evaluator), Virtual Clock đóng băng tại `T0` ([ADR-010](../../030-Specs/Architecture/ADR-010-Bounded-Determinism-Scope.md)), Synthetic Request Injector, Layer 1 Write Defense (`L1AstSqlFilter`, `HttpVerbGuard`, `FallbackGuard` — Rule E9 fail-closed). |
| `@repro/diff` | Verification & Diff Engine | 4 canonical normalizer (SQL whitespace/casing, URL query sorting, JSON recursive sorting + float rounding, header filtering — `ADR-006`), Two-Tier Equivalence (Tier 1 byte equality + Tier 2 semantic rubric — `Story-13`), 6-Step Divergence Attribution (`Story-14`), terminal diff UI tuân thủ ngôn từ hợp đồng §20.16. |
| `@repro/cli` | Developer CLI | 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`), POSIX permission `0600`/`0700` (`SEC-042`), Git Guard (`SEC-043`), và lệnh vận hành bảo mật (`purge` crypto-shredding theo GDPR Art. 17 — `Story-08`, `keys` rotate). |

#### 🎯 Vòng đời Capture → Replay → Verify

- **Repro Capsule** (`.repro.tar.gz`) — artifact tự chứa, portable, mã hoá; replay được **sau khi môi trường gốc đã bị phá huỷ**.
- **Deterministic replay** — virtual clock, mock adapter tầng wire, injector request tổng hợp; không chạm live network/DB.
- **Two-tier verification** — Tier 1 byte equality, Tier 2 semantic rubric; khi lệch thì chạy 6-step divergence attribution để chỉ ra **nguyên nhân**, không chỉ báo "khác".
- **Ngôn từ hợp đồng §20.16** — CLI phát biểu `💥 BUG REPRODUCED (✓ Execution matched)` và `✓ Captured execution no longer reproduces`; **cấm** mọi khẳng định chủ quan kiểu "bug is 100% fixed".

#### 🔒 Security & privacy (33 requirement `SEC MUST-V0.1` — 100% verified)

- **Zero-Dependency SDK** (`SEC-037`) — thu hẹp bề mặt tấn công supply chain của thành phần chạy trong production.
- **Automatic redaction** (`SEC-001`, `SEC-002`, `SEC-005`) — header `authorization`/`cookie`/`x-api-key` và field nhạy cảm bị scrub **tại thời điểm capture, trước khi lưu**; PAN giữ format kèm kiểm tra Luhn.
- **Envelope encryption** (`SEC-009`…`SEC-012`) — AES-256-GCM, DEK sinh bằng CSPRNG (DEK 256-bit, IV 96-bit, Auth Tag 128-bit).
- **Digest-Before-Parse** (`SEC-027`) — HMAC-SHA256 xác minh bằng `timingSafeEqual` **trước** mọi thao tác parse JSON/tar; chặn Zip-Slip (`THREAT-009`) và decompression bomb (trần 50 MB).
- **Crypto-shredding & memory zeroization** (`SEC-016`, `SEC-038`, `Story-08`) — DEK bị ghi đè `0x00` ngay sau khi dùng; `repro purge` xoá vĩnh viễn DEK tại Key Custody (HTTP 410 Gone / `SHREDDED`) → quyền được lãng quên theo GDPR Điều 17.
- **Layer 1 fail-closed write defense** (`ADR-005`, `Story-12`) — chặn toàn bộ DML/DDL và HTTP verb mutating; `FallbackGuard` cấm triệt để fallback ra network/DB thật.
- **POSIX permission & Git Guard** (`SEC-042`, `SEC-043`) — ép `0600` cho file capsule, `0700` cho thư mục; chặn tải capsule vào repo git nếu chưa cấu hình `.gitignore`.

### 2.2. Improvements

- **Cô lập hoàn toàn spike code** — codebase V0.1 tách sạch khỏi `src/spike/`; không có đường dẫn nào từ production package trở lại code thử nghiệm Phase 0.
- **Test chạy native trên `node:test`** — không thêm test framework bên thứ ba; TypeScript chạy trực tiếp bằng `--experimental-strip-types`, không cần bước build.
- **GitHub Pages site** — landing page công khai kèm workflow deploy tự động (`.github/workflows/pages.yml`).
- **Repo metadata hoàn chỉnh** — `LICENSE` (MIT), `README.md` (tiếng Anh), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.

### 2.3. Verification

| Hạng mục | Kết quả | Ngưỡng |
|---|---|---|
| Full test suite | **111/111 PASS** (24 suite, 0 fail / 0 cancelled / 0 skipped) | 100% |
| Fidelity benchmark `N-05` | **`R_em` = 100.0%** trên 21 replay (`D=7 × K=3`) | ≥ 90.0% |
| Composite Gate | **100.0%** | ≥ 80.0% |
| Side-effect matrix `T1`–`T12` | **`escaped_side_effects == 0`** (đối chiếu Canary Sink) | = 0 |
| `SEC MUST-V0.1` | **33/33 tuân thủ** | 100% |
| Phase P2 QA (3 pass độc lập) | **CLEAN_PASS** — Completeness · Correctness · Coherence | Pass cả 3 |

Tái lập kết quả:

```bash
npm test
```

---

## 3. Bug Fixes

Không có. Đây là bản phát hành đầu tiên nên **chưa có baseline đã phát hành nào để sửa lỗi**. Các fix trong lịch sử commit trước tag này (ví dụ `fix(ci): drop unusable pages enablement flag`) là fix nội bộ trên hạ tầng repo, chưa từng lọt tới người dùng.

---

## 4. Known Issues & Limitations

Phần này là **ranh giới có chủ đích của V0.1**, theo nguyên tắc §33.7 *narrow before broad* và §20.15 *product boundary* — không phải nợ kỹ thuật ngoài dự kiến.

### 4.1. Phạm vi capture

| Hạng mục | Trạng thái ở V0.1 | Nguồn |
|---|---|---|
| Node.js · PostgreSQL · outbound HTTP · feature flag · system clock | ✅ Hỗ trợ | Scope V0.1 |
| **Redis** | ❌ Không capture — test app của spike *có* Redis nhưng điều đó không đưa Redis vào phạm vi V0.1 | Roadmap E1 |
| **Kafka, background job, multi-service replay** | ❌ Hoãn sang V0.3 | Roadmap |
| **Python, Go** | ❌ Hoãn sang V0.3 | Roadmap |
| **Browser replay, Next.js / Fastify adapter** | ❌ Hoãn sang V0.2 | Roadmap |
| **Regression test generation, GitHub Actions integration** | ❌ Hoãn sang V0.2 | Roadmap |

### 4.2. Lớp bug chưa hỗ trợ đầy đủ

- **Randomness (scenario 7)** — §20.2 đã hoãn phần scheduler/race; V0.1 chỉ hỗ trợ *"UUID capture where practical"*.
- **Async behavior (scenario 9)** — async **trong một execution** nằm trong phạm vi; race **giữa nhiều execution** thì **không**.
- **Race condition (scenario 10)** — §20.13 xếp là *Critical but Out of Scope*; hoãn sang tương lai.
- **Minimal database snapshot, AI root-cause analysis** — thuộc nhóm *Future*.

### 4.3. Giới hạn vận hành & phân phối

- **Chưa publish npm** — `README` mô tả `npm install @repro/node` như trải nghiệm đích, nhưng V0.1.0 **chỉ phát hành dạng source qua GitHub**. Cài đặt hiện tại là clone repo và dùng workspace cục bộ. Publish registry là việc của một bản phát hành sau.
- **Yêu cầu Node.js ≥ 22** — package ship TypeScript nguồn và chạy bằng `--experimental-strip-types`; **không có bước build/transpile**. `engine-strict=true` sẽ chặn cài đặt trên runtime thấp hơn.
- **Cần Key Custody service** — envelope encryption và `repro purge` phụ thuộc một Key Custody endpoint tự vận hành; V0.1 không kèm bản triển khai managed.
- **Chưa có `Runbooks/`** — chưa có service nào chạy thường trực để viết runbook.
- **Chưa có release CI workflow và SBOM** — hiện chỉ có workflow deploy GitHub Pages. Tự động hoá release và SBOM CycloneDX là khuyến nghị đã ghi nhận, chưa phải yêu cầu bắt buộc của V0.1.

---

## 5. Deployment Steps

> [!IMPORTANT]
> **Deployment guide của Repro không phải tài liệu vận hành thông thường.** Bản self-host chứa dữ liệu production đã capture; ranh giới *storage → laptop developer* được threat model xếp là **boundary nguy hiểm nhất**, và nó bị vượt qua **trên happy path** (`repro pull` *là* tính năng). **Đọc [Spec-Security-Repro-Threat-Model](../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) trước khi triển khai.**

Thiết kế triển khai chuẩn nằm ở tầng spec, không lặp lại tại đây:

- [SDD §6 — Infrastructure & Deployment](../../030-Specs/Architecture/SDD-Repro.md) — topology self-hosted (§6.1), ngân sách overhead phía production (§6.2), môi trường local của developer (§6.3), tích hợp CI (§6.5), ranh giới đóng gói OSS core / commercial layer (§6.6).
- [ADR-009 — Private / Self-Hosted Topology](../../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) — self-hosting bắt buộc từ V0.1.

### 5.1. Lấy bản phát hành

```bash
git clone https://github.com/trisjr/bug-reproduce.git
cd bug-reproduce
git checkout v0.1.0
npm install
```

### 5.2. Kiểm chứng trước khi triển khai

```bash
node --version   # yêu cầu >= 22
npm test         # kỳ vọng: 111/111 pass
```

### 5.3. Thứ tự triển khai

1. **Key Custody trước** — dựng endpoint Key Custody tự vận hành; không có nó thì envelope encryption và `repro purge` không hoạt động.
2. **Capsule storage** — cấu hình storage self-hosted; áp chính sách retention **trước khi** bật capture, không phải sau.
3. **Nhúng SDK vào ứng dụng** — `repro.init()` tại entry point, khai báo `redaction.neverStoreHeaders` và giới hạn `storage` **trước** lần capture đầu tiên. Redaction sai cấu hình = PII lọt vào capsule.
4. **Bật capture cho một service** — theo §33.7, hẹp trước rồi mới mở rộng.
5. **Phía developer** — cài CLI, xác nhận Git Guard và permission `0600`/`0700` hoạt động trước khi `repro pull` capsule thật đầu tiên.

### 5.4. Rollback

Gỡ `repro.init()` khỏi ứng dụng là đủ để dừng toàn bộ capture — SDK không thay đổi hành vi ứng dụng ngoài các interceptor của chính nó, và `init()` được thiết kế fail-safe (config sai không làm crash ứng dụng). Capsule đã tạo vẫn nằm ở storage cho tới khi bị `repro purge` xoá.

---

## 6. Liên kết

- **GitHub Release**: https://github.com/trisjr/bug-reproduce/releases/tag/v0.1.0
- **Changelog**: [`docs/070-Deployment/CHANGELOG.md`](../CHANGELOG.md)
- **Phase P2 verdict**: [`2026-08-28-phase-p2-build-v01/verdict.md`](../../010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/verdict.md)
- **Master Test Plan V0.1**: [`MTP-Repro-V0.1.md`](../../035-QA/Test-Plans/MTP-Repro-V0.1.md)
- **Roadmap**: [`Roadmap.md`](../../010-Planning/Roadmap.md)
- **Security policy**: `SECURITY.md` (repo root)

---

*Generated by TNMCORE-OS DevOps Role.*
