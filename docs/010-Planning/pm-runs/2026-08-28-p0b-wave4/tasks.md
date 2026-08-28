---
id: PM-TASKS-2026-08-28-P0B-W4
type: reference
status: draft
created: 2026-08-28
---

# Tasks: 2026-08-28-p0b-wave4 (Wave 4)

> 🔒 **File này do PM độc quyền tick.** Worker báo trong `FILES_TOUCHED` + `SUMMARY`; PM đối chiếu với ownership rồi mới tick.

**Gate**: ✅ DUYỆT 2026-08-28 · **Phạm vi**: Wave 4 (`B7b` + `B9` + `B10`) · **Tổng ngân sách**: 3.5–4.2 MD (~225 tool calls)

---

## Lô 1 — `B7b` Fidelity Benchmark & Composite Metric Engine (`software-engineer` · 1.5 MD · Ngân sách: 75 calls)

- [x] `src/spike/bench/fidelity.js`: Hiện thực bộ điều phối chạy thực nghiệm Replay ($B5$) và Verification ($B6$) trên toàn bộ 10 scenario fixtures ($B8$) với $K=3$ lần ($10 \times 3 = 30$ replays) cộng thêm probe $SC\text{-}11$.
- [x] `src/spike/bench/composite.js`: Hiện thực module tính toán 6 metric cốt lõi của Phase 0 ($R_{sr}$, $R_{em}$, Overhead, Capsule Size P95, Replay Time, $escaped\_side\_effects = 0$) và đối chiếu 4 giả thuyết ban đầu của `RQ.md §24`.
- [x] `src/spike/bench/reporter.js`: Mở rộng xuất báo cáo Fidelity & Composite dạng JSON và CSV theo đúng schema $MTP\ \S3.1/\S3.2$.
- [x] `src/spike/bench/index.js` & `self-check.js`: Cập nhật CLI commands `bench fidelity`, `bench composite` và self-check nội bộ.
- [x] `test/spike/bench/fidelity.test.js`: Test suite tự động hóa kiểm chứng toàn bộ pipeline tính toán composite metric và handling cổng `inconclusive`.

---

## Lô 2 — `B9` Security Review Code Spike (`security-auditor` · 1.5 MD · Ngân sách: 45 calls)

- [x] `docs/030-Specs/Security/Audit-Spike-Code-Phase-0.md`: Lập báo cáo thẩm định an toàn mã nguồn spike bao phủ 5 chiều bảo mật:
  - [x] Chiều 1: Xác minh Synthetic Data 100% ($G2$) — zero production data/PII trong `src/spike/` và `test/spike/`.
  - [x] Chiều 2: Xác minh External HTTP Stub Isolation — tự chạy cục bộ, zero external credentials.
  - [x] Chiều 3: Đối chiếu Shortcut Ledger `Spec §5` với hiện thực mã nguồn thực tế.
  - [x] Chiều 4: Đánh giá cơ chế miễn trừ $SPIKE\_RUN\_ID$ (Structural vs Forgeable Exclusion).
  - [x] Chiều 5: Đánh giá bề mặt Output (Capsule files, canary logs, benchmark exports).
- [x] `docs/010-Planning/pm-runs/2026-08-28-p0b-wave4/findings/security-auditor.md`: Hoàn thiện kết luận audit chính thức.

---

## Lô 3 — `B10` Known-Missing-Input Manifests & T1 Pre-Registration (`quality-assurance` · 0.8 MD · Ngân sách: 60 calls)

- [x] `test/spike/manifests/SC-1.json` đến `SC-10.json`: 10 file manifest cho 10 scenario fixtures $B8$.
- [x] `test/spike/manifests/SC-11.json`: 1 file manifest cho probe $SC\text{-}11$ (loại trừ cache state).
- [x] Xác nhận đủ 5 mục sàn bắt buộc trong MỌI manifest ($D\text{-}4$: Redis, Filesystem, Env vars, Process state, OS behavior) kèm `predicted_effect` và `rationale` ghi trước.
- [x] `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`: Lập bảng tiền đăng ký $T1$ theo $D\text{-}7$.
- [x] Ghi nhận con dấu Git commit hash và ngày niêm phong vào ô 6 của bảng $T1$.
---

## Lô 4 — `Wave 4.v` Verification, Close & Phase P0-B Sign-off (`context-auditor` · Ngân sách: 45 calls)

- [x] Xác minh Completeness: Đủ toàn bộ deliverables B7b, B9, B10.
- [x] Xác minh Correctness: Đạt 100% test pass trên toàn bộ test suite spike (B0', B1/B2, B3, B4, B5, B6, B7a, B7b, B8, B10).
- [x] Xác minh Coherence: Tính nhất quán giữa các metric, manifest niêm phong và audit report.
- [x] Xuất `docs/010-Planning/pm-runs/2026-08-28-p0b-wave4/verdict.md`.
- [x] Cập nhật `Timeline-Repro.md` và `Planning-MOC.md` đánh dấu hoàn tất toàn bộ Phase `P0-B`.
- [x] Đo chi phí và lập `cost.md`.
