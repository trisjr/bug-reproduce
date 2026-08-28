# Design: Repro V0.1 Architecture & Modular Design

## 1. Monorepo Architecture
Repro V0.1 được tổ chức dưới dạng monorepo sử dụng `npm workspaces` nguyên bản (native), chia thành 5 packages độc lập tại `packages/`:

```text
repro/
├── package.json                   # Root workspace manifest (private: true)
├── tsconfig.base.json             # ES2022 / NodeNext
├── packages/
│   ├── core/                      # Domain types, Envelope crypto, Capsule Format v1 I/O
│   ├── sdk/                       # @repro/node (Zero-dependency in-process capture SDK)
│   ├── replay/                    # Deterministic local replay engine & Wire mocking
│   ├── diff/                      # Two-tier equivalence & Divergence attribution
│   └── cli/                       # Unified developer CLI & Operational verbs
└── test/                          # Test suites (unit, integration, security, fidelity)
```

## 2. Cryptographic Protocol & Capsule Format Contract
- **Capsule Structure**: Archive `.repro.tar.gz` chứa:
  1. `manifest.json`: Metadata, environment, runtime, key reference URN, payload digest HMAC-SHA256.
  2. `interactions.jsonl`: Dòng tuần tự tương tác (U0..Un), mã hóa bằng AES-256-GCM với DEK ngẫu nhiên 256-bit.
  3. `runtime_metadata.json`: Node version, OS, git commit, env variables redacted.
  4. `checksums.sha256`: SHA-256 hash của từng file bên trong.
- **Key Custody Integration (ADR-012)**:
  - DEK được lưu trữ độc quyền tại Key Custody Store qua REST API (`/api/v1/keys/:key_ref`).
  - Lệnh `repro purge` gửi yêu cầu xóa DEK $\to$ Toàn bộ bản sao capsule phân tán lập tức không thể giải mã (`Crypto-shredding`).
- **Digest-Before-Parse (SEC-027)**:
  - Replay engine tính HMAC-SHA256 của archive trước khi giải nén. Sai lệch $\to$ Từ chối ngay lập tức, chặn đứng Zip-Slip và Decompression Bomb.

## 3. Two-Tier Write Defense (ADR-005)
- **Layer 1 (L1 AST Classifier)**: Phân tích cú pháp câu lệnh SQL và HTTP method; chặn đứng mọi câu lệnh WRITE (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `CALL`, `POST`, `PUT`, `PATCH`) trong quá trình replay.
- **Layer 2 (L2 OS/Container Sandbox)**: Chạy ứng dụng trong container `--internal` không có default gateway; mọi nỗ lực kết nối mạng ra ngoài đều bị drop tại kernel/firewall.

## 4. Two-Tier Verification & 6-Step Divergence Attribution
- **4 Phép chuẩn hoá**: SQL query whitespace & casing, URL query parameter alphabetization, JSON key canonicalization & floating-point rounding, Header casing & allowlist filtering.
- **Verification Engine**:
  - Tier 1 Gate: Kiểm tra đồng nhất byte sau chuẩn hóa.
  - Tier 2 Rubric: Đánh giá tương đương ngữ nghĩa.
- **6-Step Divergence Attribution**: Phân biệt phân kỳ do Code Change vs Environment Drift vs Redaction Artifact vs Unattributed.
