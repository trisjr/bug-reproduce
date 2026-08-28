---
id: ADR-012
type: adr
status: approved
project: repro
owner: "@TrisJr"
created: 2026-08-28
updated: 2026-08-28
linked-to: "./SDD-Repro.md"
---

# 🏛️ ADR-012 — Key Custody Architecture & Crypto-Shredding Protocol

## 1. Context & Problem Statement

Theo quyết định `GATE-05b` (2026-08-14), **Crypto-shredding** được phê duyệt là yêu cầu bắt buộc mức **`MUST-V0.1`** (`SEC-016`), kết hợp với chính sách lưu trữ mặc định TTL 30 ngày (`GATE-05a` / `FR-024`) để bảo vệ dữ liệu sản thi và đáp ứng quyền được quên (GDPR Art 17 Right-to-Erasure) trên $N+1$ bản sao phân tán.

Tuy nhiên, open item **`U-06d`** trong [SDD-Repro](./SDD-Repro.md) và [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md) đã chỉ ra một khoảng hở kiến trúc nghiêm trọng (`GATE-05b-r2` / [Risk-Register §4.2](../../010-Planning/Risk-Register.md)):
> *Nếu không có kiến trúc Key Custody xác định rõ khoá được lưu trữ ở đâu, ai cấp, xoay vòng thế nào và xoá bằng thao tác nào, thì crypto-shredding là bất khả thi trên thực tế, khiến cam kết bảo mật MUST-V0.1 trở thành lời hứa suông.*

Tài liệu này giải quyết triệt để `U-06d`, xác lập mô hình Key Custody, phân tách khoá mã hoá hai tầng (Envelope Encryption), quy trình Crypto-shredding không thể phục hồi, và định nghĩa 4 trạng thái khoá khi developer thực hiện lệnh `repro inspect` hoặc `repro replay`.

---

## 2. Decision Drivers & Constraints

1. **Private Self-Hosted Topology ([ADR-009](./ADR-009-Private-Self-Hosted-Topology.md))**: Không phụ thuộc vào SaaS Key Management công cộng; tổ chức phải tự chủ toàn bộ hạ tầng giữ khoá.
2. **GDPR Art 17 Right-to-Erasure Compliance**: Việc xoá khoá mã hoá tại Key Custody Store phải lập tức biến mọi bản sao capsule phân tán (trên S3, local disk, developer machines, CI runners) thành dữ liệu rác ngẫu nhiên không thể giải mã.
3. **Fail-Closed Security ([ADR-005](./ADR-005-Default-Deny-Write-Side-Effects.md))**: Khi Key Custody không thể kết nối hoặc khoá bị thu hồi/hết hạn, hệ thống phải từ chối giải mã payload ngay lập tức.
4. **Minimal Runtime Overhead**: Quá trình ghi nhận capsule tại SDK Recorder không được bị chặn (blocked) bởi độ trễ của Key Custody Server.

---

## 3. Considered Architectural Options

- **Option A — Symmetrical Pre-shared Key (PSK)**: Dùng chung một khoá tĩnh được nhúng vào file cấu hình / env var.
  - *Đánh giá*: ❌ Bị loại. Lộ khoá một nơi là lộ toàn bộ lịch sử; xoá khoá làm hỏng toàn bộ capsule của mọi tenant; không thể thu hồi hạt mịn theo capsule hoặc theo thời gian.
- **Option B — Decentralized Public Key Infrastructure (Asymmetric Encrypt-Only)**: Recorder mã hoá bằng Public Key, chỉ Private Key được giữ tại máy developer.
  - *Đánh giá*: ❌ Bị loại. Không thể thực thi crypto-shredding tập trung: khi cần xoá một capsule theo yêu cầu GDPR, ta không thể ép toàn bộ developer xoá Private Key tương ứng.
- **Option C — Envelope Encryption with Centralized Private Key Custody Store (Được Chọn)**: Phân tách khoá 2 tầng — Data Encryption Key (DEK) được sinh ngẫu nhiên cho từng capsule, và được mã hoá / quản lý bởi Master Key Encryption Key (KEK) tại Key Custody Store (HashiCorp Vault / Private KMS / Local Vault Daemon).

---

## 4. Decision: Envelope Encryption & Private Key Custody Protocol

Repro V0.1 chính thức áp dụng **Option C**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REPRO KEY CUSTODY ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 1. CAPTURE STAGE (SDK Recorder In-Process):                                 │
│    • Generate ephemeral DEK (AES-256-GCM, CSPRNG 256-bit).                  │
│    • Encrypt Capsule Payload (interactions.jsonl, etc.) using DEK.          │
│    • Register DEK with Key Custody Store → Receive unique `key_id`.         │
│    • Store only `key_id` and KEK metadata in Capsule Header v1.             │
│    • Zeroize (wipe memory) ephemeral DEK immediately after encryption.      │
│                                                                             │
│ 2. KEY CUSTODY STORE (Private KMS / Vault / Repro Key Daemon):              │
│    • Store: { key_id, encrypted_dek, tenant_id, created_at, ttl_expires_at, │
│               status: 'ACTIVE' | 'SHREDDED' | 'EXPIRED' }                   │
│    • Auto-Shredding Job: Sweep every 1 hour; delete DEK if now > ttl.       │
│                                                                             │
│ 3. REPLAY / INSPECT STAGE (Developer Local CLI):                            │
│    • Read `key_id` from Capsule Header.                                     │
│    • Request DEK from Key Custody Store via mTLS / Auth Token.              │
│    • If Granted → Decrypt payload into isolated memory, execute replay.     │
│    • If Denied / Shredded → Fail-closed with explicit error message.        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Cấu trúc Định danh Khoá trong Capsule Header v1

Mỗi Repro Capsule Format v1 lưu trữ khối metadata khoá như sau:

```json
{
  "encryption_metadata": {
    "algorithm": "AES-256-GCM",
    "key_id": "k_01HZX89J4V8BQ7M2N3P4R5T6W7",
    "custody_endpoint": "https://vault.internal.corp/v1/repro/keys",
    "digest_algorithm": "HMAC-SHA256",
    "payload_hmac": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

### 4.2 Bốn Trạng Thái Khoá Khi Thực Thi `repro inspect` / `repro replay`

Khi developer hoặc CI runner cố gắng nạp một capsule, hệ thống xử lý tường minh 4 kịch bản:

| Trạng thái Khoá | Phản hồi từ Key Custody | Hành vi CLI (`repro inspect / replay`) | Ý nghĩa Bảo mật |
|---|---|---|---|
| **1. `Key Available`** | `200 OK` + `DEK` | Giải mã payload, nạp vào bộ nhớ cách ly, tiến hành replay bình thường. | Capsule hợp lệ, còn trong hạn TTL. |
| **2. `Key Revoked / Shredded`** | `404 Not Found` / `410 Gone` (`status: SHREDDED`) | Báo lỗi: `❌ ERROR: Capsule key has been permanently shredded (Crypto-shredded). Payload is unrecoverable.` Không crash tiến trình. | Đã kích hoạt quyền GDPR Art 17 hoặc `repro purge`. Không ai có thể giải mã lại. |
| **3. `Key Expired`** | `403 Forbidden` (`status: EXPIRED`) | Báo lỗi: `⚠️ ERROR: Capsule retention period (TTL 30 days) has expired. Key is locked pending shredding.` | Hết hạn lưu trữ theo chính sách `FR-024`. |
| **4. `Key Custody Unreachable`** | `503 Service Unavailable` / `ECONNREFUSED` | Báo lỗi: `🔒 ERROR: Cannot connect to Key Custody Store at <endpoint>. Check network or auth credentials.` Fail-closed. | Không có quyền truy cập hoặc mất mạng nội bộ. |

---

## 5. Thao Tác Crypto-Shredding (`repro purge`)

Để kích hoạt huỷ dữ liệu vĩnh viễn theo GDPR Art 17 hoặc chính sách nội bộ:
1. Quản trị viên SRE hoặc hệ thống tự động phát lệnh:
   ```bash
   repro purge --capsule-id=1842 --reason="GDPR_REQUEST_7731"
   # hoặc xoá toàn bộ capsule quá hạn:
   repro purge --before="2026-07-28"
   ```
2. Key Custody Store thực hiện:
   - Ghi đè bộ nhớ chứa DEK bằng giá trị ngẫu nhiên (`crypto.randomBytes(32)`), sau đó xoá bản ghi khỏi database.
   - Ghi log bất biến vào `audit.log`: `{ action: "CRYPTO_SHRED", key_id: "...", actor: "admin@corp", timestamp: "..." }`.
3. Mọi file capsule phân tán vật lý ngay lập tức trở thành chuỗi bytes ngẫu nhiên không thể phục hồi toán học kể cả khi kẻ tấn công chiếm được physical storage.

---

## 6. Consequences & Compliance Impact

### Tích cực (Positive)
- **Giải quyết dứt điểm `U-06d`**: Đóng hoàn toàn blocker `GATE-05b-r2` của [Risk-Register §4.2](../../010-Planning/Risk-Register.md).
- **Hợp chuẩn GDPR Art 17 (Right-to-Erasure)**: Đã được thẩm định bởi Security Auditor (`Spec-Security-Data-Retention-Legal-Review.md`).
- **Phù hợp Self-Hosting ([ADR-009](./ADR-009-Private-Self-Hosted-Topology.md))**: Tương thích với HashiCorp Vault, AWS KMS (Private VPC Endpoint), hoặc standalone Repro Key Daemon.

### Tiêu cực & Biện pháp Giảm thiểu (Mitigations)
- **Rủi ro mất Master Key KEK**: Nếu Key Custody Store mất dữ liệu, toàn bộ capsule không thể mở.
  - *Giảm thiểu*: Yêu cầu backup định kỳ Key Custody metadata (chỉ backup encrypted DEKs và Master KEK, không chứa payload dữ liệu nhạy cảm).
- **Yêu cầu kết nối mạng khi Replay**: Developer phải có kết nối tới Key Custody Store trong mạng nội bộ / VPN để lấy DEK lần đầu.
  - *Giảm thiểu*: Hỗ trợ cơ chế Local Key Cache có thời hạn ngắn (Short-lived Session Token, e.g. 1 hour) trên máy developer.

---

## 7. Related Documents

- [SDD-Repro](./SDD-Repro.md) — System Design Document (§4 & §5.4).
- [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md) — Repro Capsule Format Contract v1.
- [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md) — Private Self-Hosted Topology.
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md) — `SEC-016` & `THREAT-009`.
- [NFR-Repro](../../020-Requirements/NFR-Repro.md) — `SEC-016` Crypto-shredding.
