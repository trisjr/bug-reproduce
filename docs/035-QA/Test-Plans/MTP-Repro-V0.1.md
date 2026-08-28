---
id: MTP-002
type: test-plan
status: approved
project: repro
owner: "@quality-assurance"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../../020-Requirements/NFR-Repro.md"
---

# 🧪 Master Test Plan — Repro V0.1

## 1. Executive Summary & Test Mission

Master Test Plan (MTP) này xác lập chiến lược kiểm thử tự động hoá toàn diện cho phiên bản **Repro V0.1 (Validate the Core)**, nhằm bảo chứng bằng thực nghiệm rằng:
1. **Core Replay Loop** có khả năng ghi nhận và tái hiện tất định một lớp lỗi production có ý nghĩa (*Supported Execution Class* — [NFR-Repro §7.7](../../020-Requirements/NFR-Repro.md)) đạt tỷ lệ **Execution Match Rate $N\text{-}05 \ge 90.0\%$** và **Composite Gate $\ge 80.0\%$** ($\ge 6/7$ scenarios).
2. **Nguyên tắc An toàn Tuyệt đối (Safe by Default — [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md))**: Cơ chế Default-deny write fail-closed 2 tầng ($L1$ Sink AST Filter + $L2$ Container Sandbox) bảo đảm **`escaped_side_effects == 0`** trên toàn bộ các kịch bản tấn công và rò rỉ side effect ($T1$–$T12$).
3. **Tuân thủ Bảo mật Tuyệt đối**: 100% trong số **33 requirement `SEC MUST-V0.1`** được kiểm chứng bằng test suites tự động hoá trong pipeline CI/CD trước khi release.

---

## 2. Test Scope & Boundaries

### 2.1 In-Scope (Phạm vi Kiểm thử V0.1)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         V0.1 TEST SUITE TAXONOMY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Core Replay Engine Suite:                                                │
│    • Inbound HTTP Request Replay (Method, Path, Canonical JSON Body).       │
│    • PostgreSQL Interaction Wire Mock (pg Client/Pool queries & results).   │
│    • External HTTP API Interception (Stubbed responses, timeouts).          │
│    • System Clock & Timers Virtual Tick Progression (ADR-010).              │
│    • Feature Flag State Evaluation (Boolean & String flags).                │
│                                                                             │
│ 2. Security & Compliance Suite:                                             │
│    • 33 SEC MUST-V0.1 Requirements (Groups A–I, TC-SEC-001..048).           │
│    • Envelope Encryption (AES-256-GCM) & Key Custody / Crypto-shredding.   │
│    • Digest-Before-Parse Integrity Gate (HMAC-SHA256, SEC-027).             │
│    • Redaction Preservation & Masking Verification (SEC-001..007).          │
│                                                                             │
│ 3. Side-Effect Containment Suite:                                           │
│    • 12 Attack & Leak Scenarios (T1–T12) with Independent Canary Sink.      │
│    • L1 AST SQL Query Classifier (DML, DDL, CTE, Stored Procedures).        │
│    • L2 Node.js Permission Sandbox (--deny-child-process, isolated proxy).  │
│                                                                             │
│ 4. CLI Contract & Developer Experience Suite:                               │
│    • 6 Developer Verbs (list, pull, inspect, replay, diff, verify).         │
│    • 4 Operational Verbs (auth, purge, keys, audit).                        │
│    • Exact Contract Language Enforcement (§20.16, UX-03).                   │
│                                                                             │
│ 5. Automated CI/CD N-05 Quality Gate:                                       │
│    • D=7 In-Class Test Suite × K=3 Replications (21 runs).                  │
│    • Automated 6-Step Divergence Attribution Engine (Spec §3.6).            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Out-of-Scope (Phụ lục Post-MVP)
- Multi-service distributed replay (Hoãn V0.3 / `WS-3`).
- Distributed race-condition capture (Hoãn Future).
- Browser UI Replay (Hoãn V0.2).
- Non-Node.js runtimes (Python / Go — Hoãn V0.3).

---

## 3. Automated CI/CD $N\text{-}05$ Measurement & Quality Gate

### 3.1 Công thức Tính Toán & Cổng Đánh Giá

Trong pipeline CI/CD, bộ test harness `@repro/test-harness` tự động thực thi $D=7$ scenarios chuẩn thuộc Supported Execution Class với $K=3$ lượt lặp lại độc lập ($N_{pop} = 21$ replays):

$$R_{em} = \frac{\text{Total Matched Replays}}{D \times K} \times 100\% = \frac{\text{Matched Replays}}{21} \times 100\%$$

$$\text{Composite Rate} = \frac{\text{Scenarios with } 3/3 \text{ matched}}{7} \times 100\%$$

**Tiêu chí Pass CI Gate**:
1. $R_{em} \ge 90.0\%$ trên $D=7$ in-class scenarios.
2. $\text{Composite Rate} \ge 80.0\%$ (tối thiểu $6/7$ scenarios đạt $3/3$ match).
3. $\text{Canary Escaped Connections} == 0$.

### 3.2 Automated 6-Step Divergence Attribution Protocol

Khi phát hiện phân kỳ ($Execution\ diverged$), Test Harness tự động chạy qua 6 bước phân lập nguyên nhân:
1. `redaction`: Khớp tương đối sau khi bù trừ các trường có cờ `redacted: true`.
2. `incomplete-capture`: Phát sinh tương tác mới không có trong `interactions.jsonl`.
3. `truncated`: Capsule có cờ `truncated: true` do chạm trần $SEC\text{-}008$.
4. `version-drift`: Lệch commit hash, schema migration version hoặc Node.js version.
5. `out-of-scope-determinism`: Tương tác chạm tài nguyên phi tất định ngoài class ($ACG\text{-}07$).
6. `code`: Phân kỳ logic thật sự do mã nguồn ứng dụng thay đổi.

---

## 4. Ma Trận Test Case Chi Tiết 33 `SEC MUST-V0.1`

| Test Suite ID | Nhóm Yêu Cầu | Mục Tiêu Kiểm Thử | Vector Kiểm Thử & Assertion | Tiêu Chí Pass |
|---|---|---|---|:---:|
| `TC-SEC-001..007` | **Nhóm A: Redaction** | Khử PII, Passwords, Tokens trước khi ghi capsule | Injection payload chứa `authorization`, `password`, `credit_card`. Assert: Header/Body được thay bằng token format-preserving, cờ `redacted: true` được ghi lại. | $100\%$ Redacted |
| `TC-SEC-008..010` | **Nhóm B: Size Limits** | Trọng tài kích thước $SEC\text{-}008$ & Buffer | DB query trả về $10,000$ rows. Assert: Truncate tại đúng $100\text{ rows} / 64\text{ KB}$, capsule gắn cờ `truncated: true`, bộ nhớ không vượt $50\text{ MB}$. | Truncate sạch |
| `TC-SEC-011..016` | **Nhóm C: Encryption** | Envelope AES-256-GCM & Crypto-shredding | Kiểm tra file capsule vật lý là ciphertext ngẫu nhiên. Gọi `repro purge` $\to$ xoá DEK tại Key Custody $\to$ Replay ném lỗi `SHREDDED` ngay lập tức. | Zero Plaintext |
| `TC-SEC-017..020` | **Nhóm D: Storage Auth** | Xác thực mTLS & Token Capsule Store | Ghi capsule từ unauthenticated recorder $\to$ `401 Unauthorized`. Pull từ developer trái quyền $\to$ `403 Forbidden`. | RBAC Enforced |
| `TC-SEC-021..026` | **Nhóm E: Retention** | TTL 30 ngày & Auto-Purge | Cấu hình TTL 30 ngày. Thiết lập đồng hồ ảo $>30$ ngày $\to$ Key Custody tự động huỷ DEK và từ chối cấp khoá. | Auto-shredding |
| `TC-SEC-027..031` | **Nhóm F: Integrity** | Digest-Before-Parse ($SEC\text{-}027$) | Sửa đổi 1 byte trong `interactions.jsonl`. Assert: Replay runtime từ chối trước khi giải nén với lỗi `HMAC_VERIFICATION_FAILED`. | Fail-Closed |
| `TC-SEC-032..036` | **Nhóm G: Side-effects** | Default-deny write $L1+L2$ | Thực thi 12 kịch bản $T1$–$T12$. Assert: Canary Sink ghi nhận `0` kết nối thoát ra ngoài (`escaped_side_effects == 0`). | 0 Egress Leak |
| `TC-SEC-037..043` | **Nhóm H: Operational** | Fail-safe Recorder & Audit Logging | Bơm lỗi vào pipeline recorder. Assert: Ứng dụng production không bị crash ($§20.7$), ghi audit log đầy đủ mọi thao tác pull/purge. | 100% Uptime |
| `TC-SEC-044..048` | **Nhóm I: Diff Fidelity** | Dấu vết Redaction trong Execution Diff | Replay capsule đã redact. Assert: Execution Diff phân loại chính xác nhãn `redaction`, không quy kết nhầm thành bug code. | 0 False Blame |

---

## 5. Suite Regression Testing 12 Kịch Bản Tấn Công / Thoát Side-Effect ($T1$–$T12$)

Toàn bộ suite kiểm thử này bắt buộc phải chạy song song với **Canary Sink độc lập (`canary-net` + `canary-db`)** làm nguồn thẩm định duy nhất:

| Test ID | Kịch bản / Vector Tấn công | Cơ chế Bảo vệ | Assertion Bắt buộc |
|---|---|---|:---:|
| `T1` | `INSERT / UPDATE / DELETE` tiêu chuẩn | $L1$ SQL AST Classifier | Intercepted & Mocked, Canary Sink `0` connection |
| `T2` | CTE SQL: `WITH x AS (UPDATE ...) SELECT ...` | $L1$ Deep AST Parsing | Phân loại WRITE fail-closed, Canary `0` connection |
| `T3` | `SELECT side_effecting_func()` | $L1$ Function Denylist / L2 Proxy | Chặn tại L1/L2, Canary `0` connection |
| `T4` | `CALL stored_procedure()` | $L1$ Stored Proc Filter | Phân loại WRITE, Canary `0` connection |
| `T5` | Multi-statement SQL (`SELECT 1; DROP TABLE users;`) | $L1$ Multi-statement Tokenizer | Bẻ gãy chuỗi câu lệnh, từ chối toàn bộ |
| `T6` | Outbound HTTP `POST /payments` | $L1$ HTTP Method Filter + Mock | Trả recorded response, không gửi packet mạng |
| `T7` | Outbound HTTP `GET /trigger-export` có side-effect | $L2$ Replay Network Proxy | Mọi outbound request không khớp mock bị chặn |
| `T8` | `child_process.exec('curl ...')` ($T8\text{-}a$) | **$L2$ Node.js `--deny-child-process`** | Tiến trình con bị chặn ở tầng OS sandbox ($T8\text{-}b$) |
| `T9` | Raw TCP `net.connect()` / `dgram.Socket` | $L2$ Process-level Network Sandbox | Socket raw bị từ chối kết nối |
| `T10` | SSRF / DNS Rebinding tới Production Egress | $L2$ Egress Allowlist (chỉ loopback proxy) | Giao thức ngoài allowlist bị drop |
| `T11` | Host Header Injection / Capsule Endpoint Tampering | $SEC\text{-}027$ Payload HMAC Verification | Capsule giả mạo bị từ chối trước khi chạy |
| `T12` | Loopback Bypass (gửi request tới service local khác) | $L2$ Port & Token Scoped Proxy | Chặn kết nối tới port ngoài danh mục allowlist |

---

## 6. Definition of Done (DoD) Cho Toàn Bộ Sprint V0.1

Một User Story hoặc Workstream chỉ được đánh dấu **Done** khi thoả mãn 5 cổng chất lượng:
1. **Unit Test Coverage**: Đạt $\ge 85\%$ line coverage và $100\%$ branch coverage trên các module bảo mật và format parser.
2. **E2E Core Loop Pass**: Kịch bản Capture-to-Replay chạy thông suốt trên Node.js + PostgreSQL synthetic app.
3. **Security Audit Zero Defect**: 100% các test case `TC-SEC-*` liên quan đạt PASS, không có lỗ hổng Critical/High.
4. **Side-effect Zero Leak**: Chạy qua bộ 12 test $T1$–$T12$ với xác nhận `escaped_side_effects == 0` từ Canary Sink.
5. **Traceability Matrix**: 100% AC của User Story được ánh xạ $1:1$ tới mã nguồn test case cụ thể.
