---
id: FINDING-SEC-2026-08-28-PHASE-P1-UNGATE-V01
type: security-finding
status: ready
author: SecurityAuditorLens
date: 2026-08-28
lane: doc
project: repro
phase: P1
task: D9, LG3, LG5
related:
  - docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md
  - docs/010-Planning/Risk-Register.md
  - docs/035-QA/Reports/Report-Spike-Phase-0.md
  - docs/035-QA/Performance/Perf-Spike-Phase-0.md
  - docs/030-Specs/Spec-Spike-Protocol.md
  - docs/020-Requirements/NFR-Repro.md
  - docs/020-Requirements/PRD-Repro.md
  - docs/030-Specs/Architecture/SDD-Repro.md
  - docs/030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md
  - docs/010-Planning/Estimates/Timeline-Repro.md
---

# Báo cáo Phân tích An ninh & Thiết kế Giải pháp Bảo mật Phase P1 (Ungate V0.1)

> **Lens**: 🛡️ Security Auditor (`SecurityAuditorLens`)  
> **Ngày lập**: 2026-08-28  
> **Phạm vi thẩm định**: Phase P1 (Gỡ khoá sau gate · W13–W17, 24.5 MD + Legal Track 10.0 MD) theo `Timeline-Repro.md §6 & §6.1`, `Spec-Security-Repro-Threat-Model.md`, và bằng chứng thực nghiệm từ Spike Phase 0 (`Report-Spike-Phase-0.md`, `Perf-Spike-Phase-0.md`).

---

## 1. Tổng quan & Đánh giá Vị thế An ninh sau `GATE-06`

Sau khi `GATE-06` chính thức được phê duyệt `Go` (2026-08-28), dự án Repro chuyển từ giai đoạn thực nghiệm giả thuyết (`Phase 0`) sang giai đoạn chuẩn hoá kiến trúc và xây dựng nền tảng kỹ thuật chính thức (`Phase P1 / V0.1`).

Dưới góc nhìn **Security Auditor**, kết quả Phase 0 đã mang lại những chứng cứ thực nghiệm vô cùng giá trị, đồng thời chỉ ra chính xác các khoảng hở an ninh cần được thiết kế và khắc phục triệt để trong Phase P1:
1. **Side-effect isolation**: Chỉ số `escaped_side_effects = 0` được kiểm chứng độc lập qua Canary Sink trên 33 lượt replay. Tuy nhiên, khoảng hở tại test $T8\text{-}a$ (`child_process` gọi `curl` thoát khỏi monkeypatching in-process) và $T12$ (resolve loopback bypass) đã được đo lường chính xác, đặt ra yêu cầu bắt buộc phải nâng cấp cơ chế phòng thủ lên tầng **L2 Container Sandbox / Network Namespace**.
2. **Data Truncation Safety (`SEC-008`)**: Thí nghiệm cắt offline 70 replays xác thực cơ chế cắt kết quả DB query hoạt động ổn định và fail-closed, cho phép chốt ngưỡng sàn cấu hình thực tế ($100\text{ rows} / 64\text{ KB}$).
3. **Capsule Integrity (`SEC-027`)**: Rủi ro `THREAT-009` (Capsule là untrusted input gây RCE trên máy developer) đòi hỏi quy tắc xác thực toàn vẹn mật mã học nghiêm ngặt **TRƯỚC KHI** giải nén hoặc parse payload.
4. **Pháp chế & Quyền được lãng quên (`LG3` / GDPR Art 17)**: Cơ chế **Crypto-shredding (`SEC-016`)** kết hợp với **Key Custody Store (`D4` / `ADR-012`)** và **TTL 30 ngày (`GATE-05a` / `SEC-022`)** là giải pháp kỹ thuật duy nhất khả thi và hợp lệ về mặt pháp lý để thực thi quyền xoá dữ liệu trên $N+1$ bản sao phân tán.
5. **Chính sách công bố lỗ hổng & SLA an ninh (`LG5`)**: Thiết lập khung `SECURITY.md` và `SLA-Security-Response.md` chuẩn hoá quy trình Coordinated Vulnerability Disclosure (CVD) và cam kết SLA xử lý sự cố an ninh nghiêm ngặt.

---

## 2. Task D9 — Cập nhật Threat Model & Đánh giá 19 Threats

### 2.1 Rà soát và cập nhật nhóm Threat trong Threat Model

Theo `Spec-Security-Repro-Threat-Model.md §4.3 & §4.5` và `Risk-Register §3`, hệ thống gồm **19 threats** được phân tích per-boundary theo mô hình STRIDE trên 4 Trust Zones. Sau các quyết định `D2` (2026-08-14), `GATE-05a`, `GATE-05b`, và kết quả thực nghiệm Spike Phase 0 (2026-08-28), vị thế an ninh của các threat trọng điểm được rà soát và thiết kế giải pháp như sau:

| Threat ID | Tên & Ranh giới | Trạng thái ban đầu | Cập nhật sau Spike Phase 0 & Thiết kế Phase P1 | Residual Risk |
|---|---|---|---|:---:|
| **`THREAT-004`** | Redaction config fail-open (`TB-1` → `TB-2`) | `[GAP]` trong RQ.md. File YAML lỗi/thiếu dẫn tới full capture âm thầm. | **Mitigation hoàn chỉnh**: `SEC-009` (refuse to start khi config lỗi), `SEC-011` (built-in default profile bảo thủ), `SEC-012` (cấm bypass redaction trừ khi có cờ tường minh `--i-accept-full-capture` + audit cảnh báo), `SEC-010` (fingerprint config trong manifest). | **Medium** |
| **`THREAT-005`** | Recorder bị lạm dụng thành công cụ exfiltration nội bộ (`TB-1` → `TB-4`) | `[GAP]` trong RQ.md. Insider merge PR sửa config để capture dữ liệu production. | **Mitigation hoàn chỉnh**: `SEC-013` (enforce CODEOWNERS 2-man rule cho file config capture/redaction), `SEC-020` (append-only audit log không thể xoá), `SEC-019` (RBAC service-level scoping). | **Medium** |
| **`THREAT-006`** | Capsule vào git vĩnh viễn (Zone 3 → Zone 4) | `[GAP]` trong RQ.md. Vô tình `git add` hoặc cố ý commit regression test V0.2. | **Mitigation hoàn chỉnh**: `SEC-043` (CLI từ chối pull vào git working tree trừ khi có cờ tường minh; tự động tạo `.gitignore`), phân tách rõ Capsule format v1 (`D5` / `ADR-002`) giữa phần raw capture được mã hoá với fixture pseudonymized an toàn cho commit. | **High** *(đường 2 cần format V0.2)* |
| **`THREAT-007`** | Capsule sprawl trong Zone 3 (`TB-4`, Zone 3 → Zone 4) | `[GAP]` trong RQ.md. Rò rỉ qua Cloud sync, IDE indexer, AI assistant, mất máy. | **Mitigation hoàn chỉnh**: `SEC-042` (POSIX 0600/0700 file permission), `SEC-044` (Local TTL 30 ngày + `repro gc`), `SEC-045` (cảnh báo cloud-sync path), và **cốt lõi là `SEC-016` Crypto-shredding** (`D4` / `ADR-012` Key Custody) giúp vô hiệu hoá mọi bản copy khi huỷ khoá. | **Medium** *(sau khi có Key Custody)* |
| **`THREAT-008`** | Bản self-host không có access control (`TB-3` + `TB-4`) | `[GAP]` trong RQ.md. Bản self-host thiếu authn/authz. | **Đã có mitigation từ quyết định `D2`**: Authn + Authz + Audit log được đưa vào OSS core. Phase P1 thiết kế cơ chế chi tiết tại `D6` (`SDD §5.4`). | **Medium** |
| **`THREAT-009`** | Capsule là input không tin cậy → RCE trên máy developer (`TB-5`) | `[GAP]` trong RQ.md. Attacker tạo capsule độc hại để khai thác parser/runtime. | **Mitigation hoàn chỉnh**: **Bổ sung `SEC-027` (Verify integrity & signature TRƯỚC KHI parse/deserialize)**, `SEC-028` (chống path traversal/zip slip), `SEC-029` (chống prototype pollution), `SEC-030` (chống decompression bomb), `SEC-036` (cô lập credentials máy host). | **Low** |
| **`THREAT-010`** | Replay gây side effect thật lên production (`TB-6`) | Có nguyên tắc §13 nhưng cơ chế fail-open. | **Mitigation hoàn chỉnh**: Bằng chứng Canary Spike xác nhận `escaped_side_effects = 0`. Triệt tiêu hoàn toàn nhờ kiến trúc 3 lớp kết hợp **L2 Container Sandbox** (`THREAT-018`). | **Low** |
| **`THREAT-011`** | Không quy trách nhiệm được sau khi capsule rời Zone 2 (`TB-4`) | `[GAP]` trong RQ.md. Storage chỉ log ai pull, không biết capsule đi đâu. | **Mitigation hoàn chỉnh**: `SEC-020` (audit log ghi nhận thời điểm pull và thời điểm cấp key JIT), kết hợp `SEC-016` (crypto-shredding vô hiệu hoá tập trung không phụ thuộc vị trí bản sao). | **Medium** |
| **`THREAT-013`** | Capsule giả mạo được nạp vào storage (`TB-3`) | `[GAP]` trong RQ.md. Attacker nạp artifact giả mạo vào Zone 2. | **Mitigation hoàn chỉnh**: `SEC-017` (mTLS + recorder authentication per service), `SEC-027` (digest verification tại collector ingest), `SEC-039` (ký capsule bằng private key recorder). | **Low** |
| **`THREAT-015`** | Replay "thành công" nhưng đi đường khác, tạo kết luận sai (`TB-5`) | Có §10 nhưng chưa xét phân kỳ do redaction. | **Mitigation hoàn chỉnh**: `SEC-047` (redaction manifest ghi nhận vị trí thay đổi), `SEC-048` (Execution Diff rubric phân biệt rõ "diverged do code" vs "diverged do redaction / drift"). | **Low** |
| **`THREAT-016`** | Capsule tồn tại vô thời hạn và không xoá được (`TB-3` + `TB-4`) | `[GAP]` trong RQ.md. | **Mitigation hoàn chỉnh từ `GATE-05a` & `GATE-05b`**: `SEC-022` áp TTL mặc định 30 ngày, `SEC-023` auto-purge Zone 2, `SEC-016` crypto-shredding phá khoá vô hiệu hoá Zone 3/4, được hiện thực hoá qua `D4` (`ADR-012`). | **Low** *(khi D4 hoàn tất)* |
| **`THREAT-017`** | Replay sai version/schema tạo kết luận không đáng tin (`TB-5`) | Có cảnh báo §15 nhưng chưa ràng buộc output diff. | **Mitigation hoàn chỉnh**: `SEC-024` (metadata drift được nhúng trực tiếp vào kết quả diff), `Spec-Spike-Protocol §3.6` (quy trình quy trách nhiệm divergence 6 bước). | **Low** |
| **`THREAT-018`** | Egress khi replay không thực sự bị chặn — phân loại theo verb fail-open (`TB-6`) | `[GAP]` trong RQ.md. Denylist verb SQL/HTTP bị bypass bởi raw socket, subprocess, uninstrumented sinks. | **Mitigation hoàn chỉnh**: **Thiết kế L2 Container Sandbox / Network Namespace cô lập triệt để** (chi tiết tại mục 2.2 bên dưới), khắc phục hoàn toàn khoảng hở test $T8\text{-}a$ và $T12$. | **Low** |
| **`THREAT-019`** | Chuỗi cung ứng `@repro/node` bị chiếm (`TB-1` → `TB-2`) | `[GAP]` trong RQ.md. In-process agent production bị cài mã độc. | **Mitigation hoàn chỉnh**: `SEC-040` (SLSA Level 3 build provenance, Sigstore/Cosign keyless signing, pinned lockfiles, zero-transitive-dependency core capture engine), `SEC-004` (strict allowlist cho env vars). | **Medium** *(đánh đổi cố hữu in-process)* |

---

### 2.2 Thiết kế chi tiết Mitigation cho THREAT-018 (L2 Container Sandbox cô lập subprocess/curl)

#### 2.2.1 Bối cảnh và Phân tích khoảng hở thực nghiệm Spike Phase 0
Trong Spike Phase 0, Ma trận 12 test an toàn ($T1\text{–}T12$) đã ghi nhận hai khoảng hở có số liệu rõ ràng tại Bảng $T7$ dòng 7 (`Report-Spike-Phase-0.md`):
1. **Test $T8\text{-}a$ (`child_process` gọi `curl`)**: Khi code ứng dụng chạy lệnh spawn tiến trình con (ví dụ `child_process.execSync("curl https://api.partner.com/charge")`), request mạng rời khỏi Node.js runtime process. Tầng **L1** (Monkeypatching HTTP/HTTPS sinks) và tầng **L2-Runtime** (vá `net.Socket` in-process) hoàn toàn **mù** trước kết nối này.
2. **Test $T12$ (Đích resolve về Loopback)**: Một số request cố tình trỏ domain về `127.0.0.1` hoặc `localhost` đã lọt qua allowlist cơ bản nếu allowlist cho phép loopback mà không kiểm soát port/proxy.

#### 2.2.2 Kiến trúc phòng thủ 3 tầng (3-Layer Defense-in-Depth) cho Replay Runtime V0.1

Để triệt tiêu hoàn toàn `THREAT-018`, kiến trúc Replay Runtime trong Phase P1 được chuẩn hoá thành 3 lớp phòng vệ độc lập, fail-closed:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  REPLAY RUNTIME SANDBOX (Zone 3 - Developer Workstation)                                         │
│                                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. LỚP L1: APPLICATION SINK INTERCEPTION (In-Process Hooking)                              │  │
│  │    • Intercept pg, http/https, undici, fetch                                               │  │
│  │    • Chuyển đổi DENYLIST → ALLOWLIST: Chỉ MATCHED RECORDED INTERACTIONS mới được trả lời   │  │
│  │    • Mọi unrecorded request / unproven READ ⇒ Trả lỗi MISSING_RECORDING (SEC-034)          │  │
│  └─────────────────────────────────────────┬──────────────────────────────────────────────────┘  │
│                                            │ (Nếu ứng dụng spawn subprocess hoặc dùng raw socket) │
│                                            ▼                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 2. LỚP L2-RUNTIME: NODE.JS PROCESS PERMISSION BOUNDARY                                     │  │
│  │    • Kích hoạt Node.js Permission Model: `--permission --allow-fs-read=...`               │  │
│  │    • Chặn mở raw net.Socket ngoài danh sách loopback đã kiểm soát (SEC-032)                │  │
│  │    • Vô hiệu hoá eval / dynamic module loading từ capsule payload                          │  │
│  └─────────────────────────────────────────┬──────────────────────────────────────────────────┘  │
│                                            │ (Nếu tiến trình con curl / binary độc lập thoát ra)   │
│                                            ▼                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 3. LỚP L2-CONTAINER: OS / NETWORK NAMESPACE SANDBOX (Bịt hoàn toàn T8-a & T12)             │  │
│  │    • Network Namespace Isolation: `--network none` (hoặc isolated bridge tới Mock Proxy)    │  │
│  │    • Kernel drop toàn bộ egress ra physical network interface (ENETUNREACH / EPERM)        │  │
│  │    • Loopback Protection: Chặn mọi kết nối tới localhost services của host (trừ Replay Mock)│ │
│  │    • Filesystem Sandbox: Mount READ-ONLY workspace, cô lập ~/.ssh, ~/.aws, Keychain        │  │
│  │    • Linux Capabilities Drop: CAP_NET_RAW, CAP_SYS_ADMIN, bật no-new-privileges (SEC-036) │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2.2.3 Đặc tả kỹ thuật triển khai L2 Container Sandbox
- **Đối với môi trường Docker / OCI Container**: Khi developer thực hiện `repro replay --sandbox=container`, CLI khởi chạy ephemeral container với cờ:
  ```bash
  docker run --rm \
    --network none \
    --cap-drop=ALL \
    --security-opt=no-new-privileges \
    --read-only \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    -v ~/.repro/workspaces/<id>:/app:ro \
    repro-replay-runner:v0.1
  ```
  Khi đó, kể cả `child_process.exec("curl https://payment.com")` có chạy, kernel mạng trả về ngay `curl: (7) Couldn't connect to server` (Network unreachable), hoàn toàn không thể chạm tới hệ thống thật $A\text{-}13$.
- **Đối với môi trường Local Host Native (Node.js Native Wrapper)**:
  - Tích hợp Node.js built-in flag `--permission --allow-child-process=false` mặc định trong `repro replay`.
  - Nếu execution thực sự cần spawn subprocess nằm trong class đã capture, tiến trình con được wrap qua một sandbox runner sử dụng `unshare -n` (Linux Network Namespace) hoặc `sandbox-exec` (macOS Seatbelt profile) để cắt toàn bộ quyền truy cập mạng.

---

### 2.3 Cập nhật phân bố SEC-008 (Row/Byte Cap per DB Query Result)

#### 2.3.1 Phân tích dữ liệu thực nghiệm Spike Phase 0
Theo Bảng $T5$ của `Report-Spike-Phase-0.md` và `Perf-Spike-Phase-0.md`:
- Tập mẫu $N=13$ query results trong tập in-class ($D=7$) cho thấy kích thước trung bình và P95 rất nhỏ:
  - `row_count`: $Min = 0$, $P50 = 1$, $P95 = 1$, $Max = 1\text{ row}$ (phân bố suy biến do synthetic fixture $B8$).
  - `byte_size`: $Min = 24\text{ B}$, $P50 = 71\text{ B}$, $P75 = 75\text{ B}$, $P95 = 84.8\text{ B}$, $Max = 85\text{ B}$.
- Thí nghiệm cắt offline 70 replays ($D=7 \times 5\text{ mức} \times 2\text{ trục}$) chứng minh:
  - Mức cắt $0\text{ rows}$ hoặc $<75\text{ B}$ gây ra phân kỳ (`diverged` do `truncated`).
  - Mức cắt $\ge 1\text{ row}$ và $\ge 75\text{ B}$ đạt tỷ lệ replay thành công **`100.0%`**.

#### 2.3.2 Chốt ngưỡng sàn cấu hình mặc định (Baseline Thresholds) cho V0.1
Dựa trên nguyên tắc an toàn bộ nhớ (tránh OOM recorder, kiểm soát kích thước capsule dưới hypothesis $<10\text{ MB}$) và tính khả thi trong thực tế production:
- **Ngưỡng Row Cap mặc định**: **`100 rows`** per query result.
- **Ngưỡng Byte Cap mặc định**: **`64 KB`** (65,536 bytes) per query result.
- **Tính cấu hình được (`FR-024`)**: Cho phép tổ chức tuỳ chỉnh trong `repro.yaml` (ví dụ: `database.max_rows: 500`, `database.max_bytes: 262144`). Nếu không cấu hình, hệ thống bắt buộc áp dụng ngưỡng mặc định bảo thủ $100\text{ rows} / 64\text{ KB}$, tuyệt đối **không bao giờ** coi là không giới hạn.
- **Hành vi Fail-Closed khi vượt ngưỡng**:
  1. Recorder chỉ ghi lại đúng 100 rows đầu tiên (hoặc 64 KB đầu tiên).
  2. Gán cờ `truncated: true` trong metadata của query result.
  3. Ghi nhận `actual_row_count` và `actual_byte_size` thực tế để phục vụ audit và chẩn đoán.
  4. Lúc replay: Replay engine trả về tập dữ liệu đã cắt. Nếu execution rẽ nhánh lỗi do thiếu row bị cắt, Execution Diff rubric (`SEC-048`) quy trách nhiệm chính xác với mã lỗi `DIVERGENCE_REASON_TRUNCATION`, không gây false confidence.
- **Nhãn bắt buộc**: `HYPOTHESIS — hiệu chỉnh trên baseline synthetic, có cơ chế cấu hình và sẽ revalidate tại pilot production P4`.

---

### 2.4 Bổ sung quy tắc bắt buộc SEC-027 (Integrity Verification trước khi parse payload)

#### 2.4.1 Mối nguy cốt lõi (`THREAT-009`)
Capsule là artifact di động và có thể đến từ nguồn không tin cậy (developer tải về, nhận đính kèm bug report, sample công khai). Nếu CLI thực hiện giải nén (`zstd`/`gzip`) hoặc deserialize (`JSON.parse`, `MessagePack`, `v8.deserialize`) trước khi kiểm tra toàn vẹn, attacker có thể khai thác các lỗ hổng Memory Corruption trong thư viện nén C-bindings, Prototype Pollution trong JSON parser, hoặc Decompression Bomb gây treo máy developer ($A\text{-}12$).

#### 2.4.2 Đặc tả Given/Then của SEC-027
> **`SEC-027` (MUST-V0.1)**:  
> **Given** bất kỳ CLI command nào (`repro replay`, `repro inspect`, `repro diff`, `repro pull`) nạp một capsule artifact,  
> **Then** hệ thống **BẮT BUỘC** thực hiện xác thực tính toàn vẹn (Integrity Digest Verification và Cryptographic Signature Verification nếu có) trên toàn bộ raw payload buffer **TRƯỚC KHI** thực hiện giải nén, giải mã, hoặc deserialize bất kỳ phần payload nào.  
> **Given** digest không khớp, chữ ký không hợp lệ, hoặc manifest metadata bị sai lệch,  
> **Then** thao tác lập tức **ABORT** với exit code `41` (`CAPSULE_INTEGRITY_FAILED`), ghi log lỗi tường minh, giải phóng buffer bộ nhớ, và **TUYỆT ĐỐI KHÔNG** chuyển bất kỳ byte dữ liệu nào sang bộ giải nén hoặc parser.

#### 2.4.3 Quy trình 4 bước thực thi SEC-027
1. **Bước 1 — Header Verification**: Đọc 16-byte magic header (`REPRO\x01\x00...`), kiểm tra format version và layout metadata.
2. **Bước 2 — Hash & Signature Check**:
   - Tính `computed_digest = SHA-256(raw_encrypted_payload)`.
   - So khớp hằng số thời gian (`crypto.timingSafeEqual`) với `manifest.payload_digest`.
   - Nếu capsule có chữ ký Ed25519 từ Key Custody / Collector (`SEC-039`), xác thực chữ ký bằng public key tương ứng.
3. **Bước 3 — Fail-Fast Exit**: Nếu Bước 2 thất bại, dừng ngay lập tức, xoá bỏ scratch memory.
4. **Bước 4 — Safe Resource-Bounded Parsing**: Chỉ khi Bước 2 PASS, mới kích hoạt stream decompressor với giới hạn cứng theo `SEC-030` (Max uncompressed ratio $\le 10:1$, Max uncompressed size $\le 50\text{ MB}$, Max entries $\le 1,000$) và parser an toàn không prototype pollution (`SEC-029`).

---

## 3. Task LG3 — Pháp chế & GDPR Compliance Review (Data Retention & Crypto-shredding)

### 3.1 Phân tích tính hợp lệ của Crypto-shredding đối với GDPR Right-to-Erasure (Art 17 GDPR)

#### 3.1.1 Vấn đề pháp lý & Mâu thuẫn cấu trúc của Repro Capsule
- **Bản chất Capsule**: Repro Capsule chứa dữ liệu thực thi production thật, bao gồm HTTP request headers/body ($A\text{-}02$), database query results ($A\text{-}03$), external API responses ($A\text{-}04$), và PII của end-user ($A\text{-}06$). Do đó, Capsule cấu thành **hoạt động xử lý dữ liệu cá nhân (Processing of Personal Data)** theo Điều 4(2) GDPR.
- **Nghịch lý $N+1$ bản sao phân tán**: Khi developer thực hiện `repro pull` qua `TB-4`, capsule được tải về máy trạm local (Zone 3). Từ đây, capsule có thể tiếp tục phân tán vào git repositories, chat logs (Slack), cloud backup (iCloud/Dropbox/OneDrive), hoặc local caching.
- **Sự bất khả thi của việc xoá vật lý**: Khi một chủ thể dữ liệu (Data Subject) thực thi **Quyền được xoá dữ liệu (Right to Erasure / Right to be Forgotten - Điều 17 GDPR)**, tổ chức Controller **không thể** xác định toàn bộ các bản sao vật lý đang nằm rải rác trên máy cá nhân của hàng chục developer để xoá vật lý (physical deletion).

#### 3.1.2 Cơ sở pháp lý khẳng định Crypto-shredding đáp ứng Điều 17 GDPR
1. **Tiêu chuẩn Anonymization không thể đảo ngược (Recital 26 GDPR)**:
   - Theo Recital 26 GDPR, các nguyên tắc bảo vệ dữ liệu không áp dụng cho dữ liệu ẩn danh (anonymous information) — tức là dữ liệu không liên quan đến một thể nhân được xác định hoặc có thể xác định được, hoặc dữ liệu cá nhân đã được xử lý để làm cho chủ thể dữ liệu không còn có thể xác định được nữa.
   - Hướng dẫn của Nhóm Công tác Điều 29 (WP29 Opinion 05/2014 on Anonymization Techniques) và Hướng dẫn của EDPB (Guidelines 04/2019 on Data Protection by Design and by Default) nêu rõ: Dữ liệu mã hoá mạnh (strong encryption) mà khoá giải mã bị tiêu huỷ hoàn toàn và vĩnh viễn (irreversible destruction of decryption keys) khiến cho việc giải mã là **bất khả thi về mặt tính toán (computationally infeasible)** thì dữ liệu đó được coi là đã được ẩn danh hoá / tiêu huỷ hiệu quả.
2. **Cơ chế mật mã học của Repro**:
   - Sử dụng thuật toán mã hoá khóa đối xứng chuẩn quân sự: **AES-256-GCM** hoặc **ChaCha20-Poly1305** (`SEC-015`).
   - Mỗi capsule được mã hoá bằng một **Data Encryption Key (DEK)** ngẫu nhiên 256-bit riêng biệt, sinh ra từ nguồn entropy an toàn (CSPRNG).
   - Bản thân file Capsule (ciphertext) được phân phối xuống Zone 3 **KHÔNG** chứa khoá DEK. Khoá DEK được lưu trữ tập trung độc quyền tại **Key Custody Store (Zone 2)**.
   - Để giải mã một khối ciphertext 256-bit khi không có khoá, kẻ tấn công cần thực hiện trung bình $2^{255}$ phép thử brute-force — vượt quá tổng năng lượng điện toán của toàn bộ nền văn minh nhân loại trong hàng triệu năm.
3. **Kết luận pháp lý**:
   - Thao tác tiêu huỷ khoá DEK tại Key Custody Store lập tức biến $N+1$ bản sao Capsule trên toàn cầu thành các chuỗi byte ngẫu nhiên vô nghĩa (random ciphertext noise) vĩnh viễn.
   - Do đó, **Crypto-shredding đáp ứng đầy đủ yêu cầu pháp lý của Điều 17 GDPR về việc xoá bỏ dữ liệu cá nhân**, đồng thời tuân thủ nguyên tắc Storage Limitation (Điều 5(1)(e) GDPR) và Data Minimisation (Điều 5(1)(c) GDPR).

---

### 3.2 Cơ chế TTL 30 ngày tự động huỷ khoá tại Key Custody Store (`D4` / `ADR-012` Integration)

#### 3.2.1 Vòng đời khoá DEK & Quy trình Auto-Shredding
Để thực thi quyết định `GATE-05a` (TTL mặc định 30 ngày) và `GATE-05b` (`SEC-016` Crypto-shredding là `MUST-V0.1`), Key Custody Store triển khai quy trình quản lý vòng đời khoá tự động:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ KEY CUSTODY STORE (Zone 2 - Private Infrastructure / KMS)                               │
│                                                                                        │
│  1. Ingest Capsule ──► Sinh DEK (256-bit AES-GCM) ──► Ghi Key Record:                  │
│                        { key_id, capsule_id, created_at: T0, expires_at: T0 + 30d }    │
│                                                                                        │
│  2. Vận hành JIT   ──► repro replay ──► Authn/Authz Check (SEC-018/019) ──► Cấp DEK in-memory│
│                                                                                        │
│  3. Auto-Purge     ──► Cron Daemon quét mỗi 1h ──► Tìm { expires_at <= NOW() }          │
│                        │                                                               │
│                        ▼                                                               │
│  4. CRYPTO-SHRED   ──► Cryptographic Zeroization (ghi đè bộ nhớ & disk)                │
│                        Cập nhật trạng thái Key: SHREDDED_EXPIRED                       │
│                        Ghi Audit Log bất biến (SEC-020): Action CRYPTO_SHRED           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Quy định trạng thái phản hồi của Key Service API cho CLI
Khi CLI (`repro inspect` / `repro replay` / `repro pull`) yêu cầu lấy khoá giải mã JIT từ Key Custody Store, API bắt buộc phân biệt rõ ràng **4 trạng thái phản hồi riêng biệt**:

1. **`200 OK` — Key Granted**: Xác thực thành công, khoá còn hạn, trả về DEK qua TLS channel để giải mã in-memory.
2. **`410 Gone` — `KEY_SHREDDED_EXPIRED`**: Khoá đã bị tiêu huỷ có chủ đích do hết hạn TTL 30 ngày (`SEC-022`) hoặc do yêu cầu xoá GDPR Art 17 (`SEC-021`).
   - *Hành vi CLI*: Hiển thị thông báo màu vàng/đỏ rõ ràng cho developer: *"Capsule [id] đã hết hạn lưu trữ (TTL 30 ngày) và khoá giải mã đã bị huỷ theo chính sách an toàn dữ liệu. Capsule này không thể mở lại."*
3. **`503 Service Unavailable` — `KEY_STORE_UNREACHABLE`**: Không thể kết nối tới Key Custody Store do lỗi mạng hoặc hạ tầng Zone 2 tạm thời gián đoạn.
   - *Hành vi CLI*: Hiển thị hướng dẫn: *"Không thể kết nối tới Key Custody Server. Vui lòng kiểm tra VPN / kết nối mạng nội bộ và thử lại."* (Tuyệt đối không nhầm lẫn với trạng thái khoá đã bị huỷ).
4. **`403 Forbidden` — `KEY_ACCESS_DENIED`**: Principal không có quyền RBAC truy cập capsule của service này (`SEC-019`).

---

## 4. Task LG5 — Chính sách Bảo mật (SECURITY.md) & SLA Phản hồi Sự cố An ninh

### 4.1 Khung chính sách bảo mật cho Repo OSS (`SECURITY.md`)

Chính sách `SECURITY.md` được soạn thảo chuẩn hoá đặt tại thư mục gốc repository nhằm phục vụ cam kết bảo vệ chuỗi cung ứng (`THREAT-019`) và thiết lập kênh báo cáo lỗ hổng có trách nhiệm:

```markdown
# Security Policy — Repro Project

Dự án Repro (`@repro/node`) chạy in-process trong môi trường production của người dùng. Chúng tôi coi bảo mật là ưu tiên sống còn hàng đầu và cam kết hợp tác chặt chẽ với cộng đồng nghiên cứu bảo mật.

## 1. Supported Versions

Chúng tôi chỉ hỗ trợ và phát hành bản vá bảo mật cho các phiên bản sau:

| Version | Supported          | Security Maintenance Status |
| ------- | ------------------ | --------------------------- |
| v0.1.x  | :white_check_mark: | Active Support              |
| main    | :white_check_mark: | Development Builds          |
| < v0.1  | :x:                | End of Life (Spike Code)    |

## 2. Reporting a Vulnerability

**TUYỆT ĐỐI KHÔNG mở Public GitHub Issue cho các vấn đề liên quan đến bảo mật.**

Nếu bạn phát hiện một lỗ hổng bảo mật tiềm ẩn trong Repro, vui lòng gửi báo cáo qua một trong hai kênh bảo mật sau:
1. **GitHub Private Vulnerability Reporting (Khuyến nghị)**: Truy cập tab **Security** -> **Advisories** -> **Report a vulnerability** trên repository GitHub chính thức.
2. **Security Email**: Gửi email được mã hoá bằng khoá PGP công khai của dự án tới: `security@repro.dev`.

### Nội dung báo cáo cần cung cấp:
- Mô tả chi tiết lỗ hổng và phạm vi tác động (ví dụ: in-process capture leak, replay sandbox escape, capsule parser RCE).
- Các bước tái hiện cụ thể kèm Proof-of-Concept (PoC) code.
- Phiên bản Repro và môi trường runtime (Node.js version, OS, containerization).
- Đánh giá sơ bộ về mức độ nghiêm trọng và vector tấn công.

## 3. Coordinated Vulnerability Disclosure (CVD) Process
- **Xác nhận tiếp nhận**: Đội ngũ an ninh Repro sẽ gửi xác nhận trong vòng **< 4 giờ đối với P0/Critical** và **< 24 giờ** đối với các mức độ khác.
- **Thời hạn bảo mật thông tin (Embargo)**: Chúng tôi cam kết xử lý và phát hành bản vá trong thời hạn tối đa **90 ngày** trước khi công bố thông tin chi tiết ra công chúng (hoặc sớm hơn nếu có thoả thuận chung).
- **Phối hợp cấp mã CVE**: Repro phối hợp với GitHub CNA / MITRE để định danh CVE ID chính thức cho các phát hiện hợp lệ.
- **Security Hall of Fame**: Chúng tôi vinh danh và ghi nhận công lao của các nhà nghiên cứu bảo mật đóng góp trong release notes và trang danh dự của dự án.

## 4. Researcher Safe Harbor
Repro cam kết không khởi kiện hoặc yêu cầu cơ quan thực thi pháp luật can thiệp đối với các nhà nghiên cứu bảo mật thực hiện nghiên cứu thiện chí (Good-Faith Security Research), tuân thủ nguyên tắc không xâm phạm dữ liệu người dùng thực tế và không làm gián đoạn dịch vụ production.
```

---

### 4.2 Đặc tả SLA phản hồi sự cố an ninh (`docs/080-Operations/SLAs/SLA-Security-Response.md`)

Tài liệu SLA quy định khung thời gian cam kết ứng phó sự cố an ninh theo phân loại mức độ nghiêm trọng:

| Mức độ nghiêm trọng (Severity) | Tiêu chí phân loại & Ví dụ cụ thể | Triage & Acknowledgment | Initial Workaround / Containment | Hotfix & Patch Release | Post-Mortem & Disclosure |
|---|---|:---:|:---:|:---:|:---:|
| **P0 — CRITICAL**<br>*(CVSS 9.0 – 10.0)* | • RCE trong in-process recorder (`@repro/node`) ở production.<br>• Egress sandbox bypass gây side-effect ra production thật ($A\text{-}13$).<br>• Lộ lọt khoá mã hoá master Key Custody ($A\text{-}10$). | **$< 4\text{ giờ}$**<br>*(24/7/365)* | **$< 12\text{ giờ}$** | **$< 24\text{ giờ}$**<br>*(Emergency Hotfix)* | **$< 5\text{ ngày}$** |
| **P1 — HIGH**<br>*(CVSS 7.0 – 8.9)* | • Bypass Authn/Authz Capsule Store trong Zone 2.<br>• Redaction fail-open làm lọt PAN / credentials ($A\text{-}05$).<br>• Replay sandbox escape truy cập file hệ thống host máy dev ($A\text{-}12$). | **$< 12\text{ giờ}$** | **$< 24\text{ giờ}$** | **$< 48\text{ giờ}$** | **$< 10\text{ ngày}$** |
| **P2 — MEDIUM**<br>*(CVSS 4.0 – 6.9)* | • DoS recorder (buffer overflow / OOM làm gián đoạn request).<br>• Decompression bomb / zip slip không gây RCE.<br>• Metadata drift spoofing làm sai lệch Execution Diff. | **$< 24\text{ giờ}$** | **$< 48\text{ giờ}$** | **$< 7\text{ ngày}$**<br>*(Next Patch Release)* | Theo lịch release |
| **P3 — LOW**<br>*(CVSS 0.1 – 3.9)* | • Escape sequence terminal injection không nguy hiểm.<br>• Rò rỉ thông tin stack trace debug không chứa secret.<br>• Cải tiến hardening mã nguồn thông thường. | **$< 48\text{ giờ}$** | N/A | **Next Scheduled Release** | N/A |

---

## 5. Ma trận Yêu cầu Bảo mật MUST-V0.1 (Traceability Matrix)

Dưới đây là bảng đối chiếu 33 yêu cầu `MUST-V0.1` của Threat Model (`Spec-Security-Repro-Threat-Model.md §9`) đã được xác lập và sẵn sàng chuyển giao cho việc xây dựng Master Test Plan V0.1 (`Task D8`) và triển khai Codebase (`Phase P2`):

| Nhóm | Mã yêu cầu | Phân loại | Tóm tắt nội dung quy tắc bảo mật |
|---|---|:---:|---|
| **Nhóm A** (Capture & Redaction) | `SEC-001` | `MUST-V0.1` | Redaction engine lỗi/timeout ⇒ **KHÔNG persist**, ghi placeholder `<REDACTION-FAILED>`. |
| | `SEC-002` | `MUST-V0.1` | Header `NEVER-STORE` (Authorization, Cookie) không bao giờ lưu value. |
| | `SEC-003` | `MUST-V0.1` | Field khớp rule redaction áp dụng chiến lược tương ứng + ghi manifest log. |
| | `SEC-004` | `MUST-V0.1` | Environment variables áp dụng **Strict Allowlist**, cấm capture biến ngoài danh sách. |
| | `SEC-005` | `MUST-V0.1` | Quét số thẻ tín dụng (PAN) theo **nội dung và thuật toán Luhn** trên mọi payload string. |
| | `SEC-006` | `MUST-V0.1` | Free-text fields bị DROP nội dung, chỉ giữ metadata structural key. |
| | `SEC-007` | `MUST-V0.1` | Content scrubber lọc lỗi stack trace và DB error messages theo regex hình dạng. |
| | `SEC-008` | `MUST-V0.1` | Row cap & Byte cap kết quả DB query ($100\text{ rows} / 64\text{ KB}$), cắt fail-closed với `truncated: true`. |
| **Nhóm B** (Config Integrity) | `SEC-009` | `MUST-V0.1` | File config redaction lỗi cú pháp/schema ⇒ **Refuse to start** ngay lập tức. |
| | `SEC-011` | `MUST-V0.1` | Thiếu file config ⇒ Bắt buộc chạy với Built-in Default Profile bảo thủ. |
| | `SEC-012` | `MUST-V0.1` | Tắt redaction đòi hỏi cờ tường minh `--i-accept-full-capture` + audit + nhãn `UNREDACTED`. |
| **Nhóm C** (Storage & Access) | `SEC-015` | `MUST-V0.1` | Mã hoá at-rest bằng thuật toán AEAD (AES-256-GCM / ChaCha20-Poly1305). |
| | `SEC-016` | `MUST-V0.1` | **Crypto-shredding**: Mỗi capsule có DEK riêng ở Zone 2, phá khoá huỷ toàn bộ bản sao. |
| | `SEC-017` | `MUST-V0.1` | Recorder gửi capsule qua TLS + xác thực service credential riêng biệt. |
| | `SEC-018` | `MUST-V0.1` | Thao tác trên Capsule Store yêu cầu Authn + Authz Deny-by-default (**OSS Core** theo `D2`). |
| | `SEC-019` | `MUST-V0.1` | Scoped access control: Chỉ xem và tải capsule thuộc service/team được cấp quyền. |
| | `SEC-020` | `MUST-V0.1` | Audit log ghi nhận truy cập `{who, what, when}` dạng append-only bất biến. |
| | `SEC-021` | `MUST-V0.1` | Lệnh xoá cứng thực thi trong OSS core, bao gồm phá khoá DEK tại Key Store. |
| **Nhóm D** (Retention & TTL) | `SEC-022` | `MUST-V0.1` | Capsule có TTL hữu hạn, **mặc định 30 ngày** (`GATE-05a`), từ chối cấu hình TTL vô hạn. |
| | `SEC-023` | `MUST-V0.1` | Hết hạn TTL ⇒ Tự động purge khỏi Capsule Store & Key Store + ghi audit log. |
| **Nhóm E** (Untrusted Input) | `SEC-027` | `MUST-V0.1` | **Xác thực Integrity Digest & Signature TRƯỚC KHI parse/decompress payload**. |
| | `SEC-028` | `MUST-V0.1` | Chặn path traversal, symlink trỏ ngoài, và zip slip trong capsule entries. |
| | `SEC-029` | `MUST-V0.1` | Chặn Prototype Pollution (`__proto__`, `constructor`) khi deserialize object. |
| | `SEC-030` | `MUST-V0.1` | Giới hạn tài nguyên giải nén chống Decompression Bomb (Ratio $\le 10:1$, Size $\le 50\text{MB}$). |
| **Nhóm F** (Replay Egress) | `SEC-032` | `MUST-V0.1` | Chặn egress mức process, chỉ cho phép allowlist loopback + replay proxy. |
| | `SEC-033` | `MUST-V0.1` | Operation không chứng minh được là READ ⇒ Từ chối thực thi fail-closed. |
| | `SEC-034` | `MUST-V0.1` | Thiếu recorded response ⇒ Trả lỗi `MISSING_RECORDING`, cấm gọi ra hệ thống thật. |
| | `SEC-035` | `MUST-V0.1` | Giá trị host/URL/path trong capsule chỉ dùng làm lookup key, cấm dùng để mở kết nối. |
| **Nhóm G** (Production Safety) | `SEC-037` | `MUST-V0.1` | Buffer đầy hoặc capture timeout ⇒ **Drop capture**, không bao giờ làm hỏng request production. |
| **Nhóm H** (Zone 3 Hygiene) | `SEC-042` | `MUST-V0.1` | Ghi capsule xuống đĩa với quyền nghiêm ngặt 0600 (file) và 0700 (directory). |
| | `SEC-043` | `MUST-V0.1` | CLI từ chối ghi capsule vào git working tree trừ khi có cờ tường minh; tự tạo `.gitignore`. |
| **Nhóm I** (Verification Fidelity) | `SEC-047` | `MUST-V0.1` | Manifest kê khai chi tiết các trường bị redact để làm đầu vào cho Execution Diff. |
| | `SEC-048` | `MUST-V0.1` | Execution Diff rubric phân biệt rạch ròi giữa divergence do code vs do redaction. |

---

## 6. Đề xuất & Hành động Chuyển tiếp (Hand-off cho Phase P1)

1. **Chuyển giao cho Task `D4` (Architect — `ADR-012-Key-Custody.md`)**:
   - Tích hợp mô hình lưu trữ và quản trị vòng đời DEK 256-bit tại Key Custody Store.
   - Hiện thực hoá endpoint huỷ khoá tự động theo TTL 30 ngày và lệnh huỷ khoá tức thời phục vụ GDPR Art 17 (`SEC-016`, `SEC-021`, `SEC-022`).
   - Đảm bảo định nghĩa 4 mã trạng thái phản hồi API (`200 OK`, `410 KEY_SHREDDED_EXPIRED`, `503 KEY_STORE_UNREACHABLE`, `403 KEY_ACCESS_DENIED`).
2. **Chuyển giao cho Task `D5` (Architect — Capsule Format v1 / `ADR-002`)**:
   - Bố trí cấu trúc Fixed Header mang `payload_digest` (SHA-256) và `signature_block` độc lập với Payload Block để thực thi `SEC-027`.
3. **Chuyển giao cho Task `D6` (Architect — Capsule Store Authn/Authz / `SDD §5.4`)**:
   - Thiết kế RBAC service-level scoping (`SEC-018`, `SEC-019`) và append-only audit trail format (`SEC-020`) trong OSS Core.
4. **Chuyển giao cho Task `D8` (QA — Master Test Plan V0.1 / `MTP-Repro-V0.1.md`)**:
   - Đưa đầy đủ bộ test cases kiểm thử tự động cho 33 yêu cầu `MUST-V0.1` vào chiến lược kiểm thử CI/CD của V0.1.
   - Thiết lập automated regression test suite cho Ma trận 12 test an toàn và L2 Container Sandbox verification.
5. **Chuyển giao cho Legal Track (`LG1` / `LG3` / `LG5`)**:
   - Sử dụng kết quả phân tích GDPR Art 17 tại mục 3 làm tài liệu đầu vào chính thức cho việc thẩm định pháp lý với luật sư bên ngoài (`Spec-Security-Data-Retention-Legal-Review.md`).
   - Đưa nội dung `SECURITY.md` và `SLA-Security-Response.md` vào vị trí quy định khi khởi động Wave authoring.

---

STATUS: DONE
FILES_TOUCHED:
- docs/010-Planning/pm-runs/2026-08-28-phase-p1-ungate-v01/findings/security-auditor.md
SUMMARY:
- Hoàn tất rà soát và nâng cấp Threat Model D9: phân tích 19 threats (làm rõ nhóm 9 threats hở và các threats liên đới), thiết kế mitigation L2 Container Sandbox triệt tiêu khoảng hở T8-a/T12 đo được trong Spike Phase 0, chốt ngưỡng sàn SEC-008 (100 rows / 64 KB per query) và quy tắc kiểm tra toàn vẹn SEC-027 trước khi parse payload.
- Hoàn tất phân tích pháp chế LG3: khẳng định tính hợp lệ của Crypto-shredding đối với GDPR Right-to-Erasure (Art 17) trên N+1 bản sao phân tán và thiết lập cơ chế auto-shredding TTL 30 ngày tích hợp Key Custody Store (D4).
- Soạn thảo khung chính sách an ninh LG5: ban hành mẫu SECURITY.md cho repo OSS và xây dựng bảng SLA phản hồi sự cố an ninh nghiêm ngặt (P0 < 24h, P1 < 48h, P2 < 7 ngày) cho SLA-Security-Response.md.
