---
id: PM-TASKS-2026-08-28-P0B-W3
type: reference
status: draft
created: 2026-08-28
---

# Tasks: 2026-08-28-p0b-wave3 (Wave 3)

> 🔒 **File này do PM độc quyền tick.** Worker báo trong `FILES_TOUCHED` + `SUMMARY`; PM đối chiếu với ownership rồi mới tick.

**Gate**: ✅ DUYỆT 2026-08-28 · **Phạm vi**: Wave 3 (`B5` + `B6` + `B7a`) · **Tổng ngân sách**: 9.3 MD

> ✅ **TRẠNG THÁI: WAVE 3 HOÀN TẤT VÀ ĐÃ ĐẠT 100% PASS TOÀN BỘ TEST SUITES.**

---

## Lô 1 — `B5` Core Replay Engine & Adapters (`software-engineer` · 2.0 MD · Ngân sách: 75 calls)

- [x] `src/spike/replay/errors.js`: Định nghĩa các lỗi có cấu trúc `MissingRecordingError` (`code: 'MISSING_RECORDING'`), `ReplayBlockedWriteError` (`code: 'BLOCKED_WRITE_SIDE_EFFECT'`).
- [x] `src/spike/replay/session.js`: Quản lý `ReplaySession`, nạp capsule qua `parseArtifact()` / `readCapsule()`, xây dựng FIFO occurrence queue per `identityOf()` key.
- [x] `src/spike/replay/adapters/db-adapter.js`: Interceptor cho `pg.Pool` / `pg.Client` — phân loại `directionOf()`, chặn mọi SQL WRITE, trả recorded rows cho SELECT, ném `MISSING_RECORDING` nếu không có trong capsule (fail-closed, không fallback).
- [x] `src/spike/replay/adapters/http-adapter.js`: Interceptor cho HTTP/HTTPS/Fetch — áp dụng quy tắc $R3$ allowlist, chặn HTTP write/side-effects, trả recorded response.
- [x] `src/spike/replay/adapters/clock-adapter.js`: Interceptor cho System Clock — phát lại tuần tự theo FIFO cursor ($U\text{-}13$).
- [x] `src/spike/replay/adapters/flag-adapter.js`: Interceptor cho Feature Flags — trả về boolean flag state từ capsule.
- [x] `src/spike/replay/index.js`: Khởi tạo `SpikeReplayRuntime` và bọc ứng dụng local (`wrapApp()`).
- [x] `src/spike/replay/self-check.js`: Unit test nội bộ cho toàn bộ engine B5, zero external dependency.

---

## Lô 2 — `B5` Security Matrix T1–T12 & Fixture Scenarios (`software-engineer` · 2.0 MD · Ngân sách: 75 calls)

- [x] `test/spike/replay/t1-t12-matrix.test.js`: Hiện thực tự động hóa 12/12 test cases $T1$–$T12$ ($MTP\ \S5.3$, $THREAT\text{-}018$).
- [x] Xác nhận $T1$–$T5$ (SQL write variations, CTE write, Function side-effect, Stored procedure, Multi-statement) bị chặn bởi L1 Sink Classifier.
- [x] Xác nhận $T6$ (HTTP GET write semantics) và $T10$ (Unrecorded Read) ném `MISSING_RECORDING`, không fall-through ra ngoài.
- [x] Xác nhận $T7$ (Raw TCP socket) và $T9$ (SDK custom transport) bị chặn bởi L2 isolation.
- [x] Hiện thực $T8$ theo đúng Quyết định $D\text{-}2$: $T8\text{-}a$ (không `--permission`) ghi nhận FAIL có kiểm soát; $T8\text{-}b$ (probe `--permission`) PASS. CẤM làm nhẹ test.
- [x] Xác nhận $T11$ (Anti-spoofing capsule host) và $T12$ (Loopback protection).
- [x] `test/spike/replay/replay-scenarios.test.js`: Tái hiện Replay trên cả 10 scenario fixtures từ $B8$ (`test/spike/scenarios/`) với $K=3$ lần chạy.

---

## Lô 3 — `B6` Verification & Diff Engine (`software-engineer` #2 · 3.0 MD · Ngân sách: 75 calls)

- [x] `src/spike/verify/gate.js`: Hiện thực **Cổng `inconclusive` Tầng 1** ($Spec\ \S3.5$) — loại bỏ execution khỏi denominator ($D=7$) nếu `inClass === false/null` hoặc thiếu metadata bắt buộc, KHÔNG chạy rubric Tầng 2.
- [x] `src/spike/verify/rubric.js`: Hiện thực **Rubric Nhị phân Tầng 2** ($Spec\ \S3.4$) với 3 điều kiện: (i) Độ dài bằng nhau; (ii) Từng unit exact với quan hệ tương đương (canonical form, redaction marker, set equality cho nhóm đồng thời $G_1$ theo $U\text{-}20$); (iii) Hai neo $U_0$ và $U_\infty$ khớp nhau (so danh tính loại).
- [x] `src/spike/verify/attribution.js`: Hiện thực **Thủ tục quy trách nhiệm 6 bước** ($Spec\ \S3.6$): `redaction` $\rightarrow$ `incomplete-capture` $\rightarrow$ `truncated` $\rightarrow$ `version-drift` $\rightarrow$ `out-of-scope-determinism` $\rightarrow$ `code` $\rightarrow$ `unattributed` (CẤM gộp thầm `unattributed` vào `code`).
- [x] `src/spike/verify/diff-formatter.js`: Định dạng **Execution Diff Hạng Nhất** ($ADR\text{-}011$) với First Divergence Point có cấu trúc rõ ràng.
- [x] `src/spike/verify/index.js`: API chính `verifyExecution(expectedCapsule, actualReplayArtifact)`.
- [x] `src/spike/verify/self-check.js` & `test/spike/verify/verify.test.js`: Test suite bao phủ toàn bộ Cổng Inconclusive, 3 điều kiện Rubric và 6 bước Attribution.

---

## Lô 4 — `B7a` Overhead Benchmark Harness (`devops-engineer` · 2.3 MD · Ngân sách: 75 calls)

- [x] `src/spike/bench/config.js`: Cấu hình tham số benchmark, endpoint, tỷ lệ lỗi mục tiêu (5%), timeout.
- [x] `src/spike/bench/driver.js`: Load driver phát tải HTTP production-like (100% traffic, >90% thành công, 5% decline 402 tất định).
- [x] `src/spike/bench/sampler.js`: Thu thập cgroup v2 metrics (`cpu.stat`, `memory.peak`, `memory.events`).
- [x] `src/spike/bench/gates.js`: Hiện thực **Resource Gates $D\text{-}12$** (`nr_throttled`, `oom_kill`, cảnh báo `memory.peak >= 0.9 * mem_limit`, probe 4/4 `tnm_*` running).
- [x] `src/spike/bench/orchestrator.js`: Điều phối vòng lặp A/B xen kẽ `OFF / ON / OFF / ON` ($D\text{-}11$), tự động gọi `resetOrders()` trước mỗi chặng để khử drift seq-scan.
- [x] `src/spike/bench/reporter.js`: Xuất báo cáo JSON/CSV đầy đủ schema $MTP\ \S3.1/\S3.2$ phân tách 2 path `P-discard` và `P-persist`.
- [x] `src/spike/bench/index.js`: CLI entrypoint cho benchmark runner.
- [x] `src/spike/bench/self-check.js` & `test/spike/bench/bench.test.js`: Kiểm thử thuật toán percentile, parse cgroups và fail-fast gates.

---

## Lô 5 — `Wave 3.v` Verification & Close (`context-auditor` · Ngân sách: 45 calls)

- [x] Xác minh Completeness: Đủ toàn bộ deliverables B5, B6, B7a.
- [x] Xác minh Correctness: Ma trận 12/12 T1-T12, Replay 10 scenarios, Rubric logic, Benchmark output.
- [x] Xác minh Coherence: Tính tương thích và tuân thủ hợp đồng B0', Spec §3, MTP §3/§5, Timeline §4.
- [x] Xuất `docs/010-Planning/pm-runs/2026-08-28-p0b-wave3/verdict.md`.
- [x] Đo chi phí và lập `cost.md`.
