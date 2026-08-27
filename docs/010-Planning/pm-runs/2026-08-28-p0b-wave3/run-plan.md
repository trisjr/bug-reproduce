---
id: PM-RUN-PLAN-2026-08-28-P0B-W3
type: reference
status: draft
created: 2026-08-28
---

# Run Plan: 2026-08-28-p0b-wave3

**Lane** `code` · **Tier** `T3` (3/4 điểm) · 4 lens phân tích đã hoàn tất và hội tụ 100%.

---

## 1. Tóm tắt kết quả phân tích (Analysis Synthesis)

Bốn lens phân tích (`architect`, `security-auditor`, `devops-engineer`, `quality-assurance`) đã hoàn toàn hội tụ về kiến trúc và phương pháp kiểm chứng cho Wave 3:
1. **`B5` Replay Runtime (4.0 MD)**: Nạp capsule từ $B4$, tra cứu interaction bằng `identityOf()` và `normalize()` của $B0'$ với hàng đợi FIFO queue; áp dụng cơ chế fail-closed `MISSING_RECORDING` ($SEC\text{-}034$); thực thi **Default-Deny Write 2 lớp fail-closed** (L1 AST SQL classifier + HTTP R3 allowlist, L2 isolation); kiểm chứng trọn vẹn **12/12 test $T1$–$T12$** trên Canary Sink độc lập, giữ nguyên quy tắc $D\text{-}2$ cho $T8$ ($T8\text{-}a$ ghi nhận khoảng hở đo được, $T8\text{-}b$ probe `--permission`).
2. **`B6` Verification & Diff Engine (3.0 MD)**: Cấu trúc 2 tầng: **Cổng `inconclusive` Tầng 1** ($Spec\ \S3.5$) đứng trước rubric để bảo toàn denominator $D=7$; **Rubric so khớp nhị phân Tầng 2** ($Spec\ \S3.4$) thẩm định 3 điều kiện; trích xuất **Execution Diff hạng nhất** ($ADR\text{-}011$) với First Divergence Point và thủ tục quy trách nhiệm 6 bước (CẤM gộp thầm `unattributed` vào `code`).
3. **`B7a` Overhead Benchmark Harness (2.3 MD)**: Đo 3 thành phần overhead (Latency endpoint in-process delta tách 2 path `P-discard`/`P-persist`, CPU delta, Memory RSS/peak delta) theo quy trình xen kẽ `OFF/ON/OFF/ON` ($D\text{-}11$) kết hợp `resetOrders()` khử drift seq-scan; tích hợp **Resource Gates $D\text{-}12$** (cgroup v2 `nr_throttled`, `oom_kill`, `memory.peak < 0.9 * mem_limit`, probe 4/4 `tnm_*` running) và xuất output JSON/CSV máy đọc được theo $MTP\ \S3.1/\S3.2$.

---

## 2. File Ownership Map

> Các tập ownership **rời nhau tuyệt đối (disjoint)**. `tasks.md` và các tài liệu planning do PM độc quyền sở hữu.

| Agent / Role | Tập file được ghi (Ownership) | Cấm chạm |
|---|---|---|
| **PM** | `docs/010-Planning/pm-runs/2026-08-28-p0b-wave3/**`, `tasks.md`, `docs/010-Planning/Estimates/Timeline-Repro.md`, `docs/010-Planning/Planning-MOC.md` | `src/**`, `test/**` |
| `software-engineer` (`B5`) | `src/spike/replay/**`, `test/spike/replay/**` | `src/spike/verify/**`, `src/spike/bench/**`, `src/spike/contract/**`, `docs/**` |
| `software-engineer` #2 (`B6`) | `src/spike/verify/**`, `test/spike/verify/**` | `src/spike/replay/**`, `src/spike/bench/**`, `src/spike/contract/**`, `docs/**` |
| `devops-engineer` (`B7a`) | `src/spike/bench/**`, `test/spike/bench/**` | `src/spike/replay/**`, `src/spike/verify/**`, `src/spike/contract/**`, `docs/**` |
| `context-auditor` (Verifier) | *(read-only)* — xuất verdict cho PM | Tất cả source code |

---

## 3. Kế hoạch Dispatch theo Lô (Batching & Tool Call Budgets)

| Lô | Nhiệm vụ | Task & Files sở hữu | Worker | Ngân sách Tool Call | Phương thức |
|:---:|---|---|---|:---:|:---:|
| **Lô 1** | **B5 Core Engine & Adapters** | `src/spike/replay/index.js`, `session.js`, `errors.js`, `adapters/*.js`, `self-check.js` | `software-engineer` | **75 calls** (60 + 15) | Song song với Lô 3, 4 |
| **Lô 2** | **B5 Security Matrix & Scenarios** | `test/spike/replay/t1-t12-matrix.test.js`, `test/spike/replay/replay-scenarios.test.js` | `software-engineer` | **75 calls** (60 + 15) | Tuần tự sau Lô 1 |
| **Lô 3** | **B6 Verification & Diff Engine** | `src/spike/verify/index.js`, `gate.js`, `rubric.js`, `attribution.js`, `diff-formatter.js`, `self-check.js`, `test/spike/verify/**` | `software-engineer` #2 | **75 calls** (60 + 15) | Song song với Lô 1, 4 |
| **Lô 4** | **B7a Overhead Benchmark Harness** | `src/spike/bench/index.js`, `config.js`, `driver.js`, `orchestrator.js`, `sampler.js`, `gates.js`, `reporter.js`, `self-check.js`, `test/spike/bench/**` | `devops-engineer` | **75 calls** (60 + 15) | Song song với Lô 1, 3 |
| **Lô 5** | **Wave 3 Verification Pass** | Read-only check: Completeness, Correctness, Coherence, T1-T12 results, Rubric match rates | `context-auditor` | **45 calls** | Sau khi Lô 2, 3, 4 xong |

**Tổng ngân sách toàn run**: ~345 tool calls (ước lượng kiểm soát chặt chẽ, chia nhỏ lô để tránh runaway token).

---

## 4. Artifact sẽ tạo / sửa ngoài run-state

1. **Source Code**:
   - `src/spike/replay/**`: Toàn bộ Replay Engine, session manager, adapters (db, http, clock, flag), self-check.
   - `src/spike/verify/**`: Toàn bộ Inconclusive Gate, Binary Rubric, 6-step Attribution Engine, Diff Formatter, self-check.
   - `src/spike/bench/**`: Toàn bộ Benchmark Runner, A/B Orchestrator, Cgroup Sampler, D-12 Resource Gates, MTP Reporter, self-check.
2. **Test Suites**:
   - `test/spike/replay/**`: Ma trận 12 test an toàn $T1$–$T12$, integration test replay trên 10 scenario fixtures.
   - `test/spike/verify/**`: Test cases cho Cổng Inconclusive, 3 điều kiện rubric, và 6 bước attribution.
   - `test/spike/bench/**`: Unit test cho percentile distributions, cgroup parser, và D-12 gate aborts.
3. **Planning & Timeline Updates (PM ghi)**:
   - `docs/010-Planning/Estimates/Timeline-Repro.md`: Cập nhật tiến độ hoàn thành Wave 3.
   - `docs/010-Planning/Planning-MOC.md`: Cập nhật trạng thái Phase P0-B.

---

## 5. Assumptions & Rủi ro

- `AS-1`: Code contract $B0'$ và capsule reader $B4$ cung cấp đầy đủ API ổn định cho $B5$ và $B6$.
  → *Nếu sai*: Cần bổ sung adapter cục bộ trong $B5$/$B6$, không sửa đè $B0'$ làm phá vỡ hợp đồng đã merge.
- `AS-2`: $T8\text{-}a$ chạy không `--permission` ghi nhận FAIL có kiểm soát là hành vi đúng chuẩn theo $D\text{-}2$; $T8\text{-}b$ chạy có `--permission` chứng minh $L2$ tầng process.
  → *Nếu sai*: Test bị sửa làm nhẹ hoặc bỏ qua vi phạm $MTP\ \S5.4$.
- `AS-3`: Endpoint $POST /checkout$ đã có instrument latency header `x-spike-duration-ms` từ $S\text{-}1$, sẵn sàng cho $B7a$ tiêu thụ.
  → *Nếu sai*: $B7a$ sẽ đo qua fallback timer của driver hoặc parse application logs.

---

## 6. Gate Presentation

- **Trình ngày**: 2026-08-28
- **Kết quả**: Chờ duyệt từ `@TrisJr`.
