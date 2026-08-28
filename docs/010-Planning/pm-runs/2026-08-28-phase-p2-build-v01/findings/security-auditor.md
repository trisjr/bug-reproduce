---
id: FINDING-SECURITY-P2-BUILD-V01
type: finding
status: completed
project: repro
author: 🔐 Security Auditor / DevSecOps Lead (SecurityAuditorLens)
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md"
---

# Báo Cáo Phân Tích An Ninh Kỹ Thuật & Chốt Chặn Bảo Mật Phase P2 (Build V0.1)

> **Vai trò**: Security Auditor / DevSecOps Lead (`SecurityAuditorLens`)  
> **Phạm vi tác vụ**: Phân tích toàn diện 33 yêu cầu bảo mật bắt buộc mức `MUST-V0.1` (`SEC-001` .. `SEC-048`), thiết kế chốt chặn an ninh cốt lõi cho Phase P2 (Fail-closed Write Defense L1+L2, Pipeline Redaction nhạy cảm, Envelope Encryption & Key Custody Store, Crypto-shredding TTL 30 ngày, Digest-Before-Parse $SEC\text{-}027$, Zone 3 Hardening), xây dựng bảng ánh xạ yêu cầu sang Workstreams (`WS-1`..`WS-9`) kèm tiêu chí kiểm thử (Test Criteria), và thiết lập Security CI/CD Gate.  
> **Nguồn sự thật & Căn cứ kỹ thuật**: 
> - `Spec-Security-Repro-Threat-Model.md` (§9 33 SEC MUST, §3 Trust Boundaries, §4 STRIDE 19 Threats, §5 Redaction Spec, §10 M2 Decision, §11 TBDs).
> - `Spec-Security-Data-Retention-Legal-Review.md` (Hồ sơ giải trình pháp lý GDPR Art 17 / TTL 30 ngày).
> - `ADR-005` (Default-Deny Write Side Effects L1+L2), `ADR-012` (Key Custody & Crypto-shredding Protocol).
> - `Story-03`, `Story-04`, `Story-06`, `Story-07`, `Story-08`, `Story-12`.
> - `MTP-Repro-V0.1.md` (Master Test Plan), `Timeline-Repro.md` (Workstream breakdowns `WS-1`..`WS-9`).

---

## ## Kết luận của worker

### 1. Tổng Quan Kiểm Toán An Ninh & Bốn Đảo Chiều Mặc Định

#### 1.1 Nguyên Tắc Zero Trust & Ranh Giới Bảo Vệ
- **Zero Trust Hai Chiều**: Repro xác lập nguyên tắc **Capsule là dữ liệu không tin cậy ở cả hai chiều**:
  1. *Chiều vào* (`TB-1` $\to$ `TB-2` $\to$ `TB-3`): Không tin dữ liệu sản thi chảy vào capsule; bắt buộc lọc qua Redaction Pipeline, kiểm soát bộ nhớ đệm bất đồng bộ, mã hoá Envelope AES-256-GCM tại máy chủ trước khi lưu trữ.
  2. *Chiều ra* (`TB-4` $\to$ `TB-5` $\to$ `TB-6`): Không tin capsule khi nạp vào Replay Runtime; bắt buộc kiểm tra toàn vẹn HMAC-SHA256 trước khi parse ($SEC\text{-}027$), chống Zip-slip/Prototype Pollution, và áp lá chắn chống tác dụng phụ Fail-Closed hai tầng ($L1+L2$) để ngăn rò rỉ side-effect ra ngoài.
- **Redaction là Hygiene Control, KHÔNG phải Containment Boundary**: Theo phân tích §7 của Threat Model, redaction dựa trên danh sách chỉ là lớp vệ sinh cơ bản, không thể đảm bảo an toàn tuyệt đối. Containment thực sự của Repro đến từ **Envelope Encryption với Private Key Custody Store** (`SEC-016` / `ADR-012`) và **L2 Process/Network Sandbox** (`SEC-032` / `ADR-005`).

#### 1.2 Bốn Đảo Chiều Mặc Định Cốt Lõi (Core Default Reversals)
| # | Nguyên Tắc Đảo Chiều | Trạng Thái Cũ (RQ.md Concept) | Quy Chuẩn Sản Phẩm V0.1 (Threat Model §9.2) | Yêu Cầu Đối Ứng |
|---|---|---|---|---|
| **1** | **Fail-Closed Mọi Nơi** | Gặp lỗi hoặc ngoại lệ thì tiếp tục chạy / bỏ qua để không gián đoạn | Gặp bất thường (lỗi parse rule, timeout redaction, kết nối khoá mất) $\to$ **DỪNG NGAY**, không bao giờ persist dữ liệu chưa bảo vệ hoặc thực thi hành vi nguy hiểm. | `SEC-001`, `SEC-005`, `SEC-009`, `SEC-012`, `SEC-033` |
| **2** | **Allowlist thay Denylist ở Điểm Biên** | Denylist danh sách biến môi trường / Denylist các HTTP verbs ghi | **Allowlist tuyệt đối**: Chỉ các env vars trong danh sách trắng được capture; chỉ các network destination trong whitelist (loopback + mock proxy) được phép kết nối. | `SEC-004` (Env vars), `SEC-032` (Replay Egress) |
| **3** | **Verify Toàn Vẹn Trước Khi Parse** | Đọc và giải nén file capsule trực tiếp khi developer chạy lệnh | **Digest-Before-Parse**: Kiểm tra HMAC-SHA256 / SHA-256 Digest trước khi giải nén, parse JSON hay nạp payload vào bộ nhớ. | `SEC-027`, `SEC-028`, `SEC-029`, `SEC-030` |
| **4** | **Authn/Authz & Audit Trong OSS Core** | Đẩy kiểm soát truy cập và phân quyền sang commercial layer | **Bảo mật là tính năng cốt lõi**: Xác thực, phân quyền RBAC deny-by-default và nhật ký kiểm toán Append-Only nằm ngay trong bản OSS Self-Hosted Core (`D2` - 2026-08-14). | `SEC-018`, `SEC-019`, `SEC-020`, `SEC-021` |

---

### 2. Bảng Ánh Xạ 33 Yêu Cầu Bảo Mật `MUST-V0.1` Sang Workstreams & Test Criteria

Toàn bộ 33 yêu cầu bảo mật bắt buộc mức `MUST-V0.1` được chuẩn hoá thành các tiêu chí kiểm thử kiểm chứng được (Given-When-Then), ánh xạ trực tiếp sang 9 Workstreams phát triển của Phase P2:

| Nhóm | Mã SEC | Nội Dung Yêu Cầu Kỹ Thuật | Target Workstream | Tiêu Chí Kiểm Thử (Given-When-Then / Test Assertion) |
|---|---|---|---|---|
| **A** | `SEC-001` | **Fail-closed Redaction**: Khi engine khử dữ liệu gặp lỗi, timeout hoặc rule không hợp lệ $\to$ **KHÔNG persist** bản ghi; thay bằng `<REDACTION-FAILED>`, tăng counter `redaction_failed_total`. | `WS-1` (SDK), `WS-6` (Security) | **Given** Redaction rule ném SyntaxError hoặc timeout > 10ms; **When** SDK ghi interaction; **Then** payload chứa `<REDACTION-FAILED>`, không chứa plaintext, counter tăng `1`. |
| **A** | `SEC-002` | **Headers NEVER-STORE**: HTTP headers nhạy cảm (`Authorization`, `Cookie`, `Proxy-Authorization`) không bao giờ ghi value vào buffer ở bất kỳ giai đoạn nào; chỉ lưu name + length. | `WS-1` (SDK), `WS-6` (Security) | **Given** Header `Authorization: Bearer secret_jwt`; **When** Interceptor bắt request; **Then** buffer chỉ lưu `{"name": "authorization", "value_length": 23, "redacted": true}`. |
| **A** | `SEC-003` | **Body Field Strategy**: Field body khớp rule được áp chiến lược tương ứng; ghi `{path, strategy}` vào `redaction_applied[]` của manifest mà không ghi plaintext. | `WS-1` (SDK), `WS-2` (Store) | **Given** Body `{"password": "secret", "user": "alice"}`; **When** Redaction chạy; **Then** body thành `{"password": "[REDACTED_STRING]", "user": "alice"}`; manifest ghi nhận path. |
| **A** | `SEC-004` | **Allowlist-Only Environment Variables**: Chỉ capture biến môi trường nằm trong allowlist tường minh (`NODE_ENV`, `PORT`, v.v.); biến ngoài allowlist không xuất hiện kể cả key rỗng. | `WS-1` (SDK), `WS-6` (Security) | **Given** `process.env` có `DATABASE_URL`, `AWS_SECRET_KEY`, `NODE_ENV`; **When** Capture env; **Then** Capsule chỉ chứa `{"NODE_ENV": "production"}`; key bí mật vắng mặt 100%. |
| **A** | `SEC-005` | **Content-based PAN Detection**: Chuỗi thoả mãn định dạng thẻ và thuật toán Luhn checksum bị thay bằng `REPLACE-FIXED` trên mọi payload (body, text, error, stack trace), bật cờ `pan_detected`. | `WS-1` (SDK), `WS-6` (Security) | **Given** Chuỗi chứa số Visa thật `4532...` trong error message; **When** Content scrubber quét; **Then** Chuỗi bị thay bằng `4532-XXXX-XXXX-1234`, manifest ghi `pan_detected: true`. |
| **A** | `SEC-006` | **Free-text Field Dropping**: Field tự do (comment, note, description) bị `DROP` nội dung, thay bằng metadata `{type, length, sha256_prefix}`, giữ nguyên key bao ngoài. | `WS-1` (SDK), `WS-6` (Security) | **Given** JSON `{"notes": "Bệnh nhân có triệu chứng..."}`; **When** Redact free-text; **Then** Value thành `{"_type": "string", "_len": 35, "_sha256": "a1b2c3d4"}`; key `notes` giữ nguyên. |
| **A** | `SEC-007` | **Error & Stack Trace Scrubber**: Stack trace hoặc lỗi từ DB/External API đi qua bộ lọc hình dạng (email, phone, API token, secret pairs) trước khi persist. | `WS-1` (SDK), `WS-6` (Security) | **Given** Stack trace chứa `Connection error: postgres://user:p%40ss@db:5432/prod`; **When** Scrubber xử lý; **Then** Chuỗi thành `postgres://user:[REDACTED]@db:5432/prod`. |
| **A** | `SEC-008` | **Query Result Truncation**: Cắt bớt kết quả DB vượt ngưỡng ($100\text{ rows} / 64\text{ KB}$), đánh dấu `truncated: true`, ghi `total_row_count`, không persist phần dư; mặc định bảo thủ nếu thiếu config. | `WS-1` (SDK), `WS-6` (Security) | **Given** Truy vấn SQL trả về 5,000 rows; **When** SDK thu thập query result; **Then** Payload chỉ lưu 100 rows đầu, kèm cờ `truncated: true` và `total_row_count: 5000`. |
| **B** | `SEC-009` | **Config Integrity Fail-Closed**: File config redaction bị lỗi cú pháp hoặc không hợp lệ theo schema $\to$ SDK **refuse to start** với lỗi rõ ràng; không bao giờ bỏ qua lỗi. | `WS-1` (SDK), `WS-6` (Security) | **Given** `repro.config.json` có cú pháp JSON sai; **When** `repro.init()` được gọi; **Then** SDK ném exception `ConfigValidationError` và từ chối khởi chạy runtime. |
| **B** | `SEC-011` | **Built-in Default Profile**: Khi không cung cấp config redaction, SDK tự động áp dụng Profile Mặc Định của Threat Model mục 5; không thể chạy ở trạng thái "không có rule". | `WS-1` (SDK), `WS-6` (Security) | **Given** `repro.init({})` không truyền rule; **When** SDK khởi động; **Then** Active profile chứa đầy đủ built-in rules cho Header, PAN, Token, Password. |
| **B** | `SEC-012` | **Explicit Unredacted Mode Flag**: Tắt redaction (`enabled: false`) bị từ chối trừ khi có cờ `--i-accept-full-capture`; sinh audit log, in cảnh báo, gắn nhãn `UNREDACTED` trên capsule. | `WS-1` (SDK), `WS-5` (CLI) | **Given** Cấu hình `redaction: { enabled: false }` không kèm cờ; **When** Khởi động; **Then** Throw error. Khi có cờ: Capsule manifest mang nhãn `UNREDACTED: true`. |
| **C** | `SEC-015` | **AEAD Encryption at Rest**: Capsule lưu trữ được mã hoá bằng thuật toán AEAD (AES-256-GCM); storage backend không giữ khoá giải mã; ciphertext bị can thiệp $\to$ từ chối giải mã. | `WS-2` (Store), `WS-6` (Security) | **Given** File capsule đã mã hoá bị sửa đổi 1 bit ciphertext; **When** Giải mã bằng AES-GCM; **Then** Ném lỗi `AuthTagVerificationError`, từ chối nạp payload. |
| **C** | `SEC-016` | **Per-Capsule DEK & Key Custody**: Mỗi capsule mã hoá bằng DEK 256-bit riêng; DEK lưu tại Key Custody Store Zone 2; Replay lấy khoá JIT; xoá khoá $\to$ crypto-shred (`GATE-05b`). | `WS-2` (Store), `WS-6` (Security) | **Given** Capsule sinh DEK ngẫu nhiên; **When** Capture xong; **Then** DEK gửi lên Key Custody Store, DEK trong RAM bị zeroize; file capsule chỉ lưu `key_id`. |
| **C** | `SEC-017` | **Collector mTLS & Scoped Ingestion**: SDK gửi capsule tới Collector qua kết nối TLS, xác thực bằng credential riêng của service, kiểm tra đúng tenant scope; sai $\to$ từ chối nhận. | `WS-2` (Store), `WS-7` (Infra) | **Given** SDK gửi payload với token của Service A nhưng claim capsule thuộc Service B; **When** Collector kiểm tra; **Then** Trả về mã lỗi `403 ScopeMismatch`. |
| **C** | `SEC-018` | **OSS Core Authn/Authz Deny-by-Default**: Mọi thao tác capsule (`list`, `pull`, `inspect`, `delete`, lấy khoá) yêu cầu xác thực và phân quyền deny-by-default trong bản OSS Core (`D2`). | `WS-2` (Store), `WS-5` (CLI) | **Given** Request gọi API Key Custody không có Token; **When** Xử lý request; **Then** Trả về `401 Unauthorized`. Có Token nhưng thiếu role: trả về `403 Forbidden`. |
| **C** | `SEC-019` | **Scoped Capsule Visibility**: Principal chạy `repro list` hoặc `repro pull` chỉ thấy và tải capsule thuộc scope được cấp quyền; capsule ngoài scope không hiển thị trong danh sách. | `WS-2` (Store), `WS-5` (CLI) | **Given** User X thuộc Team Frontend; **When** Chạy `repro list`; **Then** Output chỉ chứa capsule của Team Frontend; capsule của Team Payment hoàn toàn ẩn. |
| **C** | `SEC-020` | **Append-Only Immutable Audit Log**: Ghi nhận `{who, what, when, from-where}` vào audit log bất biến cho mọi truy cập capsule; principal không có quyền sửa/xoá log của mình (`D2`). | `WS-2` (Store), `WS-5` (CLI) | **Given** User Y tải capsule `1842`; **When** Thao tác thành công; **Then** Bản ghi audit được append vào storage; quyền của User Y không thể ghi đè/xoá file log. |
| **C** | `SEC-021` | **Hard Delete & Crypto-Shred Command**: Cung cấp lệnh xoá cứng trong bản self-host; ghi audit log và phá huỷ khoá DEK tương ứng tại Key Custody Store (`D2` + `GATE-05b`). | `WS-2` (Store), `WS-5` (CLI) | **Given** Admin chạy `repro purge --capsule-id=1842`; **When** Thực thi; **Then** Key Custody ghi đè DEK bằng random bytes, xoá DB record; audit log ghi nhận `CRYPTO_SHRED`. |
| **D** | `SEC-022` | **Mandatory Finite TTL**: Capsule bắt buộc có TTL hữu hạn; từ chối cấu hình TTL vô hạn; mặc định khi không cấu hình là **30 ngày** (`GATE-05a`). | `WS-2` (Store), `WS-6` (Security) | **Given** Config `retention: "infinite"`; **When** Khởi tạo; **Then** Bị từ chối. Config không đặt TTL: Capsule tự động mang `ttl_expires_at = created_at + 30 days`. |
| **D** | `SEC-023` | **Auto-Purge Expired Capsules**: Khi TTL hết hạn, capsule tự động bị xoá/phá khoá tại Zone 2 qua tiến trình định kỳ mà không cần can thiệp thủ công; ghi audit log. | `WS-2` (Store), `WS-7` (Infra) | **Given** Capsule quá hạn 30 ngày; **When** Auto-Shredding Sweep chạy; **Then** Trạng thái khoá chuyển thành `SHREDDED`, DEK bị huỷ, audit log ghi nhận sự kiện hết hạn. |
| **E** | `SEC-027` | **Digest-Before-Parse Integrity Check**: CLI kiểm tra tính toàn vẹn (HMAC-SHA256 / SHA-256 Digest) **TRƯỚC KHI** parse, giải nén hoặc deserialize payload; sai $\to$ huỷ bỏ lập tức. | `WS-2` (Store), `WS-5` (CLI) | **Given** File `.repro.tar.gz` bị sửa đổi byte; **When** Chạy `repro replay`; **Then** CLI ném lỗi `HMAC_VERIFICATION_FAILED` trước khi gọi `tar.extract()`, không payload nào nạp vào RAM. |
| **E** | `SEC-028` | **Zip-Slip & Path Traversal Defense**: Capsule chứa entry path có `..`, đường dẫn tuyệt đối, symlink, hoặc trỏ ra ngoài thư mục đích $\to$ **Từ chối toàn bộ** capsule (không partial extract). | `WS-2` (Store), `WS-3` (Replay) | **Given** Capsule tar chứa entry `../../etc/shadow`; **When** Trích xuất; **Then** Thao tác bị huỷ toàn phần với lỗi `PATH_TRAVERSAL_DETECTED`; không file rác nào ghi xuống đĩa. |
| **E** | `SEC-029` | **Prototype Pollution Defense**: Dữ liệu capsule deserialize thành object không chứa `__proto__`, `constructor`, `prototype`; object tạo với prototype rỗng (`Object.create(null)`). | `WS-2` (Core), `WS-3` (Replay) | **Given** JSON chứa key `{"__proto__": {"isAdmin": true}}`; **When** Parse JSON; **Then** Key bị từ chối hoặc nạp vào Object sạch; `({}).isAdmin` vẫn là `undefined`. |
| **E** | `SEC-030` | **Decompression Bomb Defense**: Áp trần cứng kích thước sau giải nén (max 50 MB), số lượng entry (max 1000), tỉ lệ nén (max 100:1); vượt trần $\to$ **Abort**. | `WS-2` (Store), `WS-3` (Replay) | **Given** File tar 10 KB nén chuỗi lặp giải nén ra 200 MB; **When** Stream decompress chạm ngưỡng 50 MB; **Then** Quá trình giải nén bị ngắt ngay lập tức với lỗi `DECOMPRESSION_BOMB`. |
| **F** | `SEC-032` | **Process-level Replay Egress Blocking**: Chặn mọi kết nối mạng ra ngoài ở mức process; allowlist chỉ gồm loopback + replay proxy; chặn cả raw socket, child process, custom SDK transport. | `WS-3` (Replay), `WS-6` (Security) | **Given** Code replay gọi `net.connect(80, 'google.com')` hoặc `fetch('https://...')`; **When** L2 Sandbox hoạt động; **Then** Kết nối bị reject với `ECONNREFUSED`; Canary Sink đếm `0` packet. |
| **F** | `SEC-033` | **Fail-Closed Write Side Effects**: Mọi operation không chứng minh được là READ (`WITH...UPDATE`, `CALL`, stored procedures, uninstrumented sink) $\to$ **Từ chối thực thi** kèm lỗi rõ ràng. | `WS-3` (Replay), `WS-6` (Security) | **Given** SQL `WITH t AS (UPDATE accounts SET bal=0) SELECT * FROM t`; **When** L1 AST Tokenizer quét; **Then** Phát hiện mutation token, chặn thực thi, trả mock data an toàn. |
| **F** | `SEC-034` | **No Fall-through on Missing Recording**: Replay thiếu recorded response trả lỗi `MISSING_RECORDING`; **tuyệt đối không** gọi ra hệ thống thật trong bất kỳ hoàn cảnh nào. | `WS-3` (Replay), `WS-6` (Security) | **Given** HTTP call tới URL chưa được capture; **When** Replay tìm trong table; **Then** Ném lỗi `MISSING_RECORDING: [GET https://api.corp/v1/tax]`, không phát HTTP request thật. |
| **F** | `SEC-035` | **Lookup-Only Capsule Values**: Host, URL, file path, module name trong capsule CHỈ dùng làm lookup key trong bảng recorded responses; không bao giờ dùng để mở kết nối hay nạp code. | `WS-3` (Replay), `WS-6` (Security) | **Given** Capsule chứa URL `http://malicious.attacker.com/eval`; **When** Replay nạp key; **Then** Giá trị chỉ dùng làm key chuỗi cho Map tra cứu, không truyền vào `require()` hay socket. |
| **G** | `SEC-037` | **Drop-Not-Block Capture Buffer**: Khi buffer capture đầy hoặc timeout $\to$ **Drop capture**, tăng counter; không bao giờ chặn luồng request hoặc ném exception ra app production. | `WS-1` (SDK), `WS-6` (Security) | **Given** Async buffer chạm ngưỡng 50 MB; **When** Request mới phát sinh; **Then** SDK bỏ qua capture, request production hoàn tất bình thường với độ trễ $\le 5\text{ms}$. |
| **H** | `SEC-042` | **Restricted File Permissions**: `repro pull` ghi capsule xuống đĩa với quyền sở hữu hạn chế (`chmod 0600` cho file, `0700` cho thư mục); thất bại nếu không đặt được quyền. | `WS-5` (CLI), `WS-6` (Security) | **Given** Developer chạy `repro pull 1842`; **When** File được ghi vào `~/.repro/capsules/`; **Then** File mang mode `0600`; user khác trên cùng OS không có quyền đọc (`EACCES`). |
| **H** | `SEC-043` | **Git Working Tree Protection**: `repro pull` từ chối ghi vào git repo trừ khi có cờ tường minh; tự động tạo/cập nhật `.gitignore` để loại trừ file capsule khỏi commit. | `WS-5` (CLI), `WS-6` (Security) | **Given** Thư mục hiện tại là git repo; **When** Chạy `repro pull` không cờ; **Then** CLI từ chối ghi và in hướng dẫn; khi chạy với đường dẫn mặc định `.repro/`, `.gitignore` được cập nhật. |
| **I** | `SEC-047` | **Manifest Redaction Audit Trail**: Manifest chứa danh mục `redaction_applied[]` gồm `{path, strategy}` cho mọi vị trí đã redact, không chứa giá trị gốc hay reversible hash. | `WS-2` (Store), `WS-4` (Diff) | **Given** Capsule có 3 field bị redact; **When** Đóng gói manifest; **Then** `manifest.json` có `redaction_applied: [{path: "body.password", strategy: "REPLACE_FIXED"}]`, 0 plaintext. |
| **I** | `SEC-048` | **Redaction-Aware Divergence Attribution**: Execution Diff đối chiếu điểm phân kỳ với `redaction_applied[]` để phân loại "diverged vì code" vs "diverged vì redaction", không đoán bừa. | `WS-4` (Diff), `WS-5` (CLI) | **Given** Replay phân kỳ tại giá trị field `password`; **When** Diff Engine so khớp; **Then** Kết quả phân loại là `DIVERGENCE_REASON_REDACTION`, không báo lỗi code logic sai. |

---

### 3. Chốt Chặn 1: Lá Chắn Chống Tác Dụng Phụ Fail-Closed Hai Tầng ($L1 + L2$)

Căn cứ: `ADR-005`, `Story-12`, `SEC-032`, `SEC-033`, `SEC-034`, `SEC-035`.

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   TWO-TIER FAIL-CLOSED WRITE DEFENSE (L1 + L2)                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ [APPLICATION REPLAY RUNTIME]                                                     │
│        │                                                                         │
│        ├── 1. Database Queries / HTTP Requests / SDK Calls                      │
│        ▼                                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ L1: In-Process AST Sink Classifier (Deterministic Filter)                    │ │
│ │  • Deep SQL Tokenizer: Bóc tách CTE (`WITH...UPDATE`), `CALL`, Stored Procs  │ │
│ │  • HTTP Method & Semantic Analyzer: Phân biệt READ (GET) vs WRITE (POST/PUT) │ │
│ │  • IF PROVEN READ  ──► Trả về recorded mock response từ capsule             │ │
│ │  • IF WRITE/UNKNOWN ──► CHẶN ĐỨNG THỰC THI ──► Trả recorded write result      │ │
│ │                         (hoặc ném lỗi rõ ràng nếu thiếu recording)           │ │
│ └──────────────────────────────────────┬───────────────────────────────────────┘ │
│                                        │ Bypass attempts (Raw socket, child_proc)│
│                                        ▼                                         │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ L2: OS Process Sandbox & Egress Boundary (Containment Grid)                  │ │
│ │  • Node.js Permission Model: `--deny-child-process` (Chặn curl/bash spawns)   │ │
│ │  • Isolated Egress Proxy: Allowlist DUY NHẤT Loopback (127.0.0.1) & Mock Sink│ │
│ │  • Monkey-Patched `net.Socket` / TLS: Drop toàn bộ outbound TCP traffic      │ │
│ │  • Canary Sink Assertion: `escaped_side_effects == 0` tuyệt đối              │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1 Tầng $L1$ — In-Process AST Sink Classifier & Deep Tokenizer
- **Lý do cần Deep AST**: Phân loại theo verb đầu chuỗi (như `SELECT` hay `GET`) sẽ bị qua mặt bởi các câu lệnh phức tạp:
  - *Common Table Expressions (CTE)*: `WITH updated_rows AS (UPDATE orders SET status='PAID' RETURNING *) SELECT * FROM updated_rows;` $\to$ Bắt đầu bằng `WITH`, nhưng thực chất là mutation nguy hiểm.
  - *Stored Procedure Call*: `CALL charge_credit_card(1842);` hoặc `SELECT execute_payment(100);` $\to$ Cú pháp là query nhưng bản chất là side-effect.
- **Quy tắc Xử lý $L1$**:
  1. Tokenize toàn bộ câu truy vấn SQL thành cây cú pháp (AST). Nếu xuất hiện bất kỳ mutation keyword nào (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CALL`, `EXECUTE`, `VACUUM`) ở bất kỳ node con nào $\to$ Phân loại là **WRITE**.
  2. Với các sink HTTP: Chỉ cho phép các methods an toàn theo chuẩn RFC 7231 (`GET`, `HEAD`, `OPTIONS`). Mọi method khác (`POST`, `PUT`, `PATCH`, `DELETE`) bị phân loại là **WRITE**.
  3. Khi gặp operation không thể chứng minh là READ thuần tuý $\to$ **Fail-closed**: Chặn gửi tới kết nối mạng/database thật, trả về recorded result đã ghi trong capsule. Nếu capsule không có recorded result $\to$ Ném ngoại lệ `MISSING_RECORDING` (`SEC-034`), **tuyệt đối không bao giờ** fall-through ra ngoài.

#### 3.2 Tầng $L2$ — OS Process Sandbox & Egress Containment Grid
- **Phòng chống Bypass Tầng $L1$**: Nếu ứng dụng cố tình hoặc vô tình dùng `net.Socket` thô, `dgram` UDP, gọi tiến trình con `child_process.exec('curl ...')`, hoặc sử dụng C++ native binding để gửi request:
  - **Node.js Permission Model**: Khởi chạy tiến trình replay với các cờ bảo mật Node.js native: `--permission --deny-child-process --allow-fs-read=<app_dir> --allow-fs-write=<tmp_dir>`.
  - **Egress Proxy Allowlist**: Cấu hình network interceptor ở mức socket, chỉ cho phép kết nối tới `127.0.0.1` (Replay Mock Proxy). Mọi kết nối ra IP bên ngoài đều bị huỷ kết nối lập tức (`ECONNREFUSED` / `EPERM`).
  - **Canary Sink Verification**: Trong toàn bộ kịch bản kiểm thử E2E, một Canary Server được dựng ngoài mạng giả lập; bài kiểm tra chỉ đạt khi Canary Sink ghi nhận đúng `0` byte / `0` connection thoát ra (`escaped_side_effects == 0`).

---

### 4. Chốt Chặn 2: Pipeline Khử Dữ Liệu Nhạy Cảm (Redaction Pipeline) Format-Preserving

Căn cứ: `Story-03`, `Story-04`, `Spec-Security-Repro-Threat-Model §5`, `SEC-001` .. `SEC-008`, `SEC-047`.

#### 4.1 Chiến Lược Khử Dữ Liệu Định Dạng (Format-Preserving Strategies)
Để tránh làm đổi luồng thực thi (execution path) của ứng dụng khi replay (ví dụ: code kiểm tra `typeof email === 'string'` hoặc độ dài chuỗi), Repro áp dụng 6 chiến lược khử dữ liệu chuẩn:

```text
┌──────────────────────┬─────────────────────────────────────┬──────────────────────────────────────────┐
│ Chiến Lược           │ Cơ Chế Xử Lý                        │ Ví Dụ Input → Output                     │
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. NEVER-STORE       │ Xoá sạch giá trị tại điểm bắt       │ `Authorization: Bearer xyz` →            │
│                      │ Chỉ lưu name + length               │ `{"name": "authorization", "_len": 10}`  │
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 2. REPLACE-FIXED     │ Thay bằng hằng số giả lập           │ `password: "supersecret"` →              │
│                      │ Giữ nguyên kiểu dữ liệu             │ `password: "[REDACTED_STRING]"`          │
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 3. ANONYMIZE-SHAPE   │ Sinh chuỗi ẩn danh giữ nguyên regex │ `email: "alice@company.com"` →           │
│                      │ và format nghiệp vụ                 │ `email: "anon-user-1842@example.test"`   │
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 4. CONTENT-SCRUB-PAN │ Regex pattern + Thuật toán Luhn     │ `Error: Card 4532111122223333 invalid` → │
│                      │ Phát hiện PAN trên mọi free-text    │ `Error: Card 4532-XXXX-XXXX-3333 invalid`│
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 5. DROP-WITH-META    │ Huỷ toàn bộ nội dung trường tự do,  │ `comments: "Bệnh án chi tiết..."` →      │
│                      │ lưu metadata sha256 + độ dài        │ `comments: {"_type":"str","_len":20,...}`│
├──────────────────────┼─────────────────────────────────────┼──────────────────────────────────────────┤
│ 6. ALLOWLIST-ONLY    │ Deny-by-default cho Env Vars        │ `AWS_KEY=xxx`, `PORT=3000` →             │
│                      │ Biến không có tên trong allowlist = 0│ Chỉ capture `PORT=3000`                  │
└──────────────────────┴─────────────────────────────────────┴──────────────────────────────────────────┘
```

#### 4.2 Thuật Toán Kiểm Tra Tổng Luhn Checksum Cho Dữ Liệu Thẻ (PAN - $SEC\text{-}005$)
Bộ lọc $SEC\text{-}005$ quét trên toàn bộ các chuỗi byte thô (kể cả trong exception message, query parameters, logging output):
1. Quét tìm chuỗi số có độ dài từ 13 đến 19 chữ số (khớp IIN/BIN của Visa, MasterCard, Amex, Discover).
2. Thực thi thuật toán Luhn Modulo 10 trên chuỗi số tìm được:
   $$\sum_{i=1}^{k} d_i \equiv 0 \pmod{10}$$
   (với các chữ số ở vị trí chẵn từ phải sang được nhân đôi).
3. Nếu thoả mãn Luhn $\to$ Khẳng định 100% là số thẻ tín dụng hợp lệ $\to$ Lập tức thay thế bằng chuỗi mặt nạ giữ 4 số đầu và 4 số cuối (Masked PAN), gắn cờ `pan_detected: true` vào manifest.

#### 4.3 Khử Tràn Bộ Nhớ & Truncate Kết Quả Database ($SEC\text{-}008$ & Story-04)
- **Cắt Ngưỡng Bảo Thủ**: Mọi câu truy vấn Database trả về nhiều hơn $100\text{ dòng}$ hoặc $64\text{ KB}$ dữ liệu sẽ bị cắt bớt tại ngưỡng.
- SDK lưu $100$ dòng đầu tiên, đánh dấu `truncated: true` và ghi nhận `total_row_count: 5000`.
- **Drop-Not-Block Buffer**: Toàn bộ tương tác capture được lưu trong Ring Buffer bounded in-memory ($50\text{ MB}$). Nếu ứng dụng gặp burst traffic làm đầy buffer $\to$ SDK chuyển sang chế độ drop capture, tăng counter `buffer_overflow_total`, **tuyệt đối không làm chậm hoặc ném lỗi** ra request của khách hàng.

---

### 5. Chốt Chặn 3: Mô Hình Envelope Encryption, Private Key Custody & Crypto-Shredding

Căn cứ: `ADR-012`, `Spec-Security-Data-Retention-Legal-Review.md`, `Story-06`, `Story-07`, `Story-08`, `SEC-015`, `SEC-016`, `SEC-021`, `SEC-022`, `SEC-023`.

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│             REPRO ENVELOPE ENCRYPTION & KEY CUSTODY LIFECYCLE                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ 1. CAPTURE & WRITING (Production SDK Node):                                      │
│    ┌────────────────────────────────────────────────────────┐                    │
│    │ Generate Ephemeral DEK (256-bit CSPRNG AES-GCM)        │                    │
│    │ Encrypt Payload -> Produce Ciphertext + Auth Tag 128b │                    │
│    │ Compute HMAC-SHA256 of encrypted archive               │                    │
│    └───────────────────────────┬────────────────────────────┘                    │
│                                │ Register DEK via mTLS                           │
│                                ▼                                                 │
│    ┌────────────────────────────────────────────────────────┐                    │
│    │ PRIVATE KEY CUSTODY STORE (Vault / KMS / Repro Daemon) │                    │
│    │ Store: { key_id, encrypted_dek, ttl: 30d, status: ACT }│                    │
│    └───────────────────────────┬────────────────────────────┘                    │
│                                │ Return unique `key_id`                          │
│                                ▼                                                 │
│    ┌────────────────────────────────────────────────────────┐                    │
│    │ RAM ZEROIZE: crypto.randomFillSync(dekBuffer)          │                    │
│    │ Capsule v1 Package: Only { key_id, hmac, ciphertext }  │                    │
│    │ (TUYỆT ĐỐI KHÔNG CHỨA KHOÁ DEK TRONG FILE VẬT LÝ)      │                    │
│    └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
│ 2. SHREDDING / PURGE (GDPR Art 17 / TTL 30 Days Expiration):                     │
│    ┌────────────────────────────────────────────────────────┐                    │
│    │ Admin: `repro purge --capsule-id=1842` OR Auto-Sweep   │                    │
│    │ Key Custody Store: Overwrite DEK in RAM + Delete Record│                    │
│    │ Audit Log: Append `{ action: "CRYPTO_SHRED", ... }`    │                    │
│    │ RESULT: ALL N+1 DISTRIBUTED COPIES BECOME RANDOM NOISE │                    │
│    └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### 5.1 Cấu Trúc Header v1 & Quản Lý Khoá Phân Tách
File `.repro.tar.gz` lưu trữ metadata mã hoá trong `manifest.json`:
```json
{
  "format_version": "1.0",
  "capsule_id": "cap_01HZX89J4V8BQ7M2N3P4R5T6W7",
  "created_at": "2026-08-28T10:00:00.000Z",
  "encryption": {
    "algorithm": "AES-256-GCM",
    "key_id": "k_01HZX89J4V8BQ7M2N3P4R5T6W7",
    "custody_endpoint": "https://vault.internal.corp/v1/repro/keys",
    "digest_algorithm": "HMAC-SHA256",
    "payload_hmac": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "auth_tag": "7b23c91a0e5d4f8b9c1e2a3d4f5e6b7c"
  },
  "retention": {
    "ttl_days": 30,
    "expires_at": "2026-09-27T10:00:00.000Z"
  }
}
```

#### 5.2 Bốn Trạng Thái Khoá Tại Replay Runtime (Xử Lý Tường Minh)
| Trạng Thái Khoá | HTTP Response từ Key Custody | Hành Vi Developer CLI | Ý Nghĩa An Ninh |
|---|---|---|---|
| **1. Key Available** | `200 OK` + `DEK` | Giải mã payload vào RAM cô lập, tiến hành Replay. | Capsule hợp lệ, còn trong hạn TTL. |
| **2. Key Shredded** | `410 Gone` (`status: SHREDDED`) | Báo lỗi rõ ràng: `❌ ERROR: Capsule key permanently shredded (GDPR/Purged). Unrecoverable.` Dừng an toàn. | Đã kích hoạt quyền GDPR Art 17 hoặc `repro purge`. |
| **3. Key Expired** | `403 Forbidden` (`status: EXPIRED`)| Báo lỗi: `⚠️ ERROR: Retention period (TTL 30 days) expired. Key locked pending shredding.` | Hết hạn lưu trữ theo $SEC\text{-}022$. |
| **4. Unreachable** | `503 Service Unavailable` / `ECONNREFUSED` | Báo lỗi: `🔒 ERROR: Cannot connect to Key Custody Store at <endpoint>. Fail-closed.` | Mất kết nối hoặc sai token xác thực. |

---

### 6. Chốt Chặn 4: Quy Tắc $SEC\text{-}027$ — Digest-Before-Parse Integrity Check

Căn cứ: `SEC-027`, `SEC-028`, `SEC-029`, `SEC-030`, `Story-06`, `THREAT-009`.

#### 6.1 Quy Trình Kiểm Tra Toàn Vẹn Trước Khi Parse
```text
[ENC CAPSULE FILE ON DISK]
       │
       ▼
 1. Đọc Capsule Manifest Header (Chỉ đọc khối metadata không mã hoá)
       │
       ▼
 2. TÍNH TOÁN HMAC-SHA256 trên toàn bộ ciphertext payload archive
       │
       ├──► HMAC KHÔNG KHỚP? ──► NÉM LỖI `HMAC_VERIFICATION_FAILED` ──► DỪNG LẬP TỨC (0 Byte nạp vào RAM)
       │
       ▼ (HMAC Hợp Lệ 100%)
 3. Gửi Request lấy DEK từ Key Custody Store qua mTLS
       │
       ▼
 4. Giải mã AES-256-GCM với Auth Tag 128-bit
       │
       ▼
 5. Stream Decompression với Decompression Bomb Guard (SEC-030):
    - Max uncompressed size: 50 MB
    - Max entry count: 1000 files
    - Max compression ratio: 100:1
       │
       ▼
 6. Path Sanitization & Zip-Slip Guard (SEC-028):
    - Từ chối `..`, absolute paths, symlinks
       │
       ▼
 7. Safe JSON Deserialization with Prototype Pollution Guard (SEC-029):
    - `Object.create(null)`, cấm `__proto__`, `constructor`, `prototype`
```

- **Tính Bắt Buộc Của Thứ Tự**: Kiểm tra digest sau khi parse hoặc sau khi giải nén là **hoàn toàn vô nghĩa** vì mã độc (Zip-slip, JSON parser exploit, Memory exhaustion bomb) đã kịp thực thi và chiếm quyền điều khiển tiến trình. Thứ tự $SEC\text{-}027$ bảo đảm dữ liệu chỉ được chạm tới CPU parser sau khi đã vượt qua cổng xác thực mật mã học.

---

### 7. Chốt Chặn 5: Bảo Vệ Trạm Cục Bộ (Zone 3) & OSS Core Access Control

Căn cứ: `SEC-018` .. `SEC-021`, `SEC-042`, `SEC-043`, `D2 Decision`.

#### 7.1 Vệ Sinh Máy Trạm Developer (`repro pull`)
- **Phân Quyền File Nghiêm Ngặt ($SEC\text{-}042$)**: Khi capsule được pull về máy developer (`~/.repro/capsules/cap_1842.repro.tar.gz`), CLI bắt buộc thiết lập quyền hệ điều hành `chmod 0600` (chỉ chủ sở hữu được đọc/ghi) và `chmod 0700` cho thư mục. Nếu hệ điều hành từ chối thiết lập quyền $\to$ Thao tác pull thất bại ngay lập tức (`Fail-closed`).
- **Chống Lọt Capsule Vào Git Working Tree ($SEC\text{-}043$)**:
  - `repro pull` tự động kiểm tra xem thư mục hiện tại có nằm trong git repository không.
  - Nếu nằm trong git repo mà không có cờ `--allow-in-repo` $\to$ CLI từ chối ghi file để ngăn ngừa việc developer vô tình `git add .` đẩy dữ liệu capsule lên GitHub/GitLab public.
  - CLI tự động kiểm tra và thêm `.repro/` vào `.gitignore` của project.

#### 7.2 Kiểm Soát Quyền Truy Cập Trong Bản OSS Core ($SEC\text{-}018$ .. $SEC\text{-}021$)
- **RBAC Deny-by-Default Trong Core**: Toàn bộ logic kiểm tra quyền sở hữu capsule theo Team/Service được tích hợp sẵn trong Storage Engine của bản mã nguồn mở (`OSS Core`), không phụ thuộc vào license commercial.
- **Append-Only Immutable Audit Log ($SEC\text{-}020$)**: Mọi hành vi truy cập dữ liệu capsule đều được ghi vào file log bất biến định dạng JSON Lines có hash chaining (mỗi bản ghi audit chứa hash của bản ghi trước đó). Không một user nào (kể cả admin) có thể sửa hoặc xoá nhật ký của chính mình mà không làm gãy chuỗi hash toàn vẹn.

---

### 8. Kế Hoạch Kiểm Thử An Ninh (DevSecOps Test Matrix & CI Hardening Gate)

#### 8.1 Ma Trận Test Suite Chuyên Sâu An Ninh (Automated Security Tests)
| Test Suite | Phạm Vi Kiểm Thử | Công Cụ & Phương Pháp | Tiêu Chí Đạt (Passing SLA) |
|---|---|---|---|
| **Unit Security Tests** | - Redaction rules, Regex, Tokenizer<br>- Luhn checksum algorithm ($SEC\text{-}005$)<br>- Header NEVER-STORE filter ($SEC\text{-}002$)<br>- Env Allowlist filter ($SEC\text{-}004$) | `node:test` native runner, 100+ test vectors | $100\%$ pass, 0 false negatives trên bộ PAN synthetic |
| **Crypto & Integrity Tests** | - AES-256-GCM Encrypt/Decrypt<br>- CSPRNG Key Generation<br>- HMAC-SHA256 Digest-Before-Parse ($SEC\text{-}027$)<br>- 1-bit modified ciphertext rejection ($SEC\text{-}015$) | Node.js `crypto` native module, Fault Injection | $100\%$ tamper detection rate, 0 payload parsed on mismatch |
| **L1/L2 Fail-Closed E2E** | - SQL CTE Mutation (`WITH..UPDATE`)<br>- Stored Procedure Call (`CALL..`)<br>- Raw TCP Socket Bypass<br>- Subprocess Spawn (`child_process.exec`) | Docker Compose Isolated Sandbox + Canary Sink | `escaped_side_effects == 0` trên toàn bộ 10/10 kịch bản |
| **Adversarial Input Fuzzing** | - Zip-Slip Path Traversal ($SEC\text{-}028$)<br>- Prototype Pollution payloads ($SEC\text{-}029$)<br>- Decompression Bomb payloads ($SEC\text{-}030$) | Custom Malicious Tar Generator, Synthetic Fuzzing | $100\%$ rejected fail-closed, 0 unhandled exceptions |
| **Crypto-Shredding Flow** | - `repro purge` execution<br>- 30-day TTL Auto-Sweep<br>- Replay after shredding returns `410 Gone` | Mock Key Custody Service, Time-machine clock shift | Replay sau khi xoá khoá thất bại $100\%$, audit log đầy đủ |

#### 8.2 Security CI Hardening Gate (`WS-7`)
Trong pipeline CI/CD của Phase P2, các chốt chặn tự động sau bắt buộc phải được kích hoạt trước khi merge bất kỳ PR nào:
1. **Dependency CVE Audit**: Chạy `npm audit --audit-level=high` và Trivy scanner. Cho phép `0` High/Critical vulnerabilities.
2. **SAST Scan (Static Application Security Testing)**: Chạy Semgrep với ruleset OWASP Top 10 và rule chống prototype pollution, SQL injection.
3. **Zero Prod-Dependency Enforcement**: Kiểm tra `packages/sdk/package.json` đảm bảo trường `dependencies` là rỗng `{}` (Zero external prod dependencies).
4. **License & Provenance Check**: Kiểm tra toàn bộ mã nguồn tuân thủ giấy phép Apache-2.0 (`ADR-013`), tạo SBOM định dạng CycloneDX JSON, và ký package provenance khi publish npm.

---

### 9. Kết Luận & Khuyến Nghị Trình Phê Duyệt Tại Gate P2

1. **Sự Sẵn Sàng Về Mặt An Ninh (Security Readiness)**:
   - Toàn bộ 33 yêu cầu bảo mật bắt buộc `MUST-V0.1` (`SEC-001` .. `SEC-048`) đã được làm rõ ranh giới kiến trúc, thiết kế chi tiết thuật toán và chuyển hoá thành các tiêu chí kiểm thử cụ thể trong các User Stories (`Story-03`, `04`, `06`, `07`, `08`, `12`).
   - Mâu thuẫn kiến trúc `U-06d` (Key Custody) đã được giải quyết dứt điểm bởi `ADR-012` và sẵn sàng triển khai mã nguồn tại `WS-2` & `WS-6`.
   - Cơ chế phòng hộ 2 tầng $L1+L2$ (`ADR-005`) đảm bảo giải quyết triệt để rủi ro tác dụng phụ nguy hiểm khi replay (`escaped_side_effects == 0`).
2. **Khuyến Nghị Cho Kế Hoạch Triển Khai**:
   - **Ưu tiên Workstream 6 (`WS-6` Security Engine)**: Triển khai song song cùng `WS-1` (SDK) và `WS-2` (Store) ngay từ Sprint đầu tiên để đảm bảo các module khác được xây dựng trực tiếp trên nền tảng an ninh fail-closed (Shift-Left Security).
   - **Pháp chế Song Song (Task `LG3`)**: Chuyển giao ngay `Spec-Security-Data-Retention-Legal-Review.md` và `ADR-012` cho đơn vị tư vấn pháp lý GDPR bên ngoài rà soát song song trong thời gian phát triển Phase P2.

---

STATUS: DONE
FILES_TOUCHED: docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/findings/security-auditor.md
SUMMARY: Đã hoàn tất phân tích toàn diện 33 yêu cầu bảo mật bắt buộc MUST-V0.1 (SEC-001..SEC-048), thiết lập 5 chốt chặn an ninh cốt lõi (Lá chắn 2 tầng L1+L2 ADR-005, Pipeline Redaction nhạy cảm Format-Preserving, Envelope Encryption AES-256-GCM & Key Custody ADR-012, Crypto-shredding TTL 30 ngày, Quy tắc SEC-027 Digest-Before-Parse, Zone 3 Developer Hardening), lập bảng ánh xạ chi tiết 33 yêu cầu sang Workstreams và Test Criteria Given-When-Then, cùng Ma trận DevSecOps CI Hardening Gate cho Phase P2 (Build V0.1). Toàn bộ kết quả đã được ghi vào docs/010-Planning/pm-runs/2026-08-28-phase-p2-build-v01/findings/security-auditor.md.

---

## PM đọc được gì

1. **33 yêu cầu bảo mật bắt buộc MUST-V0.1** đã được phân rã đầy đủ thành các tiêu chí kiểm thử cụ thể (Given-When-Then), đảm bảo kiểm toán bảo mật có thể thực thi tự động trên CI/CD.
2. **5 chốt chặn an ninh cốt lõi** (Fail-closed $L1+L2$, Redaction pipeline, Envelope encryption & Key custody, Crypto-shredding TTL 30 ngày, Digest-Before-Parse) tạo thành bộ giáp toàn diện bảo vệ cả ứng dụng production của khách hàng lẫn máy trạm local của developer.
3. **Quy tắc Vệ sinh Zone 3** (`chmod 0600`, từ chối ghi capsule trực tiếp vào Git working tree mà không có cờ cảnh báo, auto `.gitignore`) loại bỏ rủi ro rò rỉ dữ liệu nhạy cảm lên GitHub/GitLab public.
4. **Chiến lược DevSecOps Gate** (CVE audit, SAST, Zero-prod-dependency check, Apache-2.0 license check, SBOM CycloneDX) tạo nên tiêu chuẩn xuất bản an toàn cho OSS launch.

---

## Mâu thuẫn với lens khác

- **Với Lens Architect (`ArchitectLens`)**: Thống nhất 100% về mô hình Envelope Encryption AES-256-GCM, Key Custody Client REST API, và cơ chế Digest-Before-Parse.
- **Với Lens DevOps (`DevOpsEngineer`)**: Thống nhất 100% về việc đưa các chốt chặn an ninh chuỗi cung ứng (Trivy, Semgrep, CycloneDX, Sigstore provenance) vào pipeline CI `WS-7`.
- **Với Lens QA (`QualityAssurance`)**: Thống nhất 100% về bộ 12 kịch bản $T1$–$T12$ với Canary Sink và yêu cầu `escaped_side_effects == 0`.
