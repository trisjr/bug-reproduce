---
id: PM-RUN-PLAN-2026-08-28-P0B-W4
type: reference
status: draft
created: 2026-08-28
---

# Run Plan: 2026-08-28-p0b-wave4

**Lane** `code` · **Tier** `T3` (3/4 điểm) · 3 lens phân tích đã hoàn tất và hội tụ 100%.

---

## 1. Tóm tắt kết quả phân tích (Analysis Synthesis)

Ba lens phân tích (`architect`, `security-auditor`, `quality-assurance`) đã hội tụ về phương án thực thi và nghiệm thu cho Wave 4 — chặng cuối của Phase `P0-B`:
1. **`B7b` Fidelity Benchmark & Composite Metric Engine (1.2–1.9 MD)**: Mở rộng `src/spike/bench/` để thực thi Replay ($B5$) và Verification ($B6$) trên toàn bộ 10 scenario fixtures ($B8$) với $K=3$ lần ($10 \times 3 = 30$ replays) + probe $SC\text{-}11$. Tính toán đầy đủ **6 metric cốt lõi của Phase 0** ($R_{sr}$, $R_{em}$, Overhead latency/CPU/memory, Capsule Size P95, Replay Time, $escaped\_side\_effects = 0$), so khớp tự động với **4 giả thuyết ban đầu của §24** ($R_{em} \ge 80\%$, Overhead $< 5\%$, Avg Size $< 10$ MB, Replay Time $< 30$s), xuất output JSON/CSV chuẩn $MTP\ \S3.1/\S3.2$.
2. **`B9` Security Review Code Spike (1.5 MD)**: Xác minh độc lập 5 chiều bảo mật: (i) Synthetic data 100%, không rò rỉ dữ liệu thật; (ii) External HTTP stub tự chạy, zero credentials; (iii) Shortcut Ledger `Spec §5` khớp đúng thực tế mã nguồn; (iv) Phân tích cơ chế miễn trừ $SPIKE\_RUN\_ID$ (structural vs forgeable); (v) Bề mặt output (capsule format, canary logs, report files). Xuất báo cáo audit `Audit-Spike-Code-Phase-0.md`.
3. **`B10` Known-Missing-Input Manifests (0.8 MD)**: Lập 11 file manifest JSON cho `SC-1` đến `SC-10` + `SC-11` tại `test/spike/manifests/` với đủ 5 mục sàn ($D\text{-}4$: Redis, Filesystem, Env vars, Process state, OS behavior) và trường `dự đoán ảnh hưởng` ghi trước khi chạy; khởi tạo bảng tiền đăng ký $T1$ tại `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md` ($D\text{-}7$) và niêm phong con dấu (commit hash + ngày) trước khi mở gate sang Phase `P0-C` ($C1$).

---

## 2. File Ownership Map

> Các tập ownership **rời nhau tuyệt đối (disjoint)**. `tasks.md` và các tài liệu planning do PM độc quyền sở hữu.

| Agent / Role | Tập file được ghi (Ownership) | Cấm chạm |
|---|---|---|
| **PM** | `docs/010-Planning/pm-runs/2026-08-28-p0b-wave4/**`, `tasks.md`, `docs/010-Planning/Estimates/Timeline-Repro.md`, `docs/010-Planning/Planning-MOC.md`, `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md` | `src/**`, `test/**` |
| `software-engineer` / `devops-engineer` (`B7b`) | `src/spike/bench/**`, `test/spike/bench/**` | `src/spike/replay/**`, `src/spike/verify/**`, `src/spike/contract/**`, `test/spike/scenarios/**`, `docs/**` |
| `security-auditor` (`B9`) | `docs/030-Specs/Security/Audit-Spike-Code-Phase-0.md`, `docs/010-Planning/pm-runs/2026-08-28-p0b-wave4/findings/security-auditor.md` | `src/**`, `test/**`, `docs/010-Planning/pm-runs/**` *(trừ finding của mình)* |
| `quality-assurance` (`B10`) | `test/spike/manifests/**`, `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md` | `src/**`, `test/spike/scenarios/**`, `test/spike/bench/**`, `docs/010-Planning/**` |
| `context-auditor` (Verifier) | *(read-only)* — xuất verdict cho PM | Tất cả source code |

---

## 3. Kế hoạch Dispatch theo Lô (Batching & Tool Call Budgets)

| Lô | Nhiệm vụ | Task & Files sở hữu | Worker | Ngân sách Tool Call | Phương thức |
|:---:|---|---|---|:---:|:---:|
| **Lô 1** | **B7b Fidelity Benchmark & Composite Metric Engine** | `src/spike/bench/fidelity.js`, `composite.js`, mở rộng `reporter.js`, `index.js`, `self-check.js`, `test/spike/bench/fidelity.test.js` | `software-engineer` | **75 calls** (60 + 15) | Song song với Lô 2, 3 |
| **Lô 2** | **B9 Security Review Code Spike** | `docs/030-Specs/Security/Audit-Spike-Code-Phase-0.md`, `findings/security-auditor.md` | `security-auditor` | **45 calls** | Song song với Lô 1, 3 |
| **Lô 3** | **B10 Known-Missing-Input Manifests & T1 Pre-Registration** | `test/spike/manifests/SC-*.json` (11 files), `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md` | `quality-assurance` | **60 calls** | Song song với Lô 1, 2 |
| **Lô 4** | **Wave 4 Verification & Seal Pass** | Read-only check: Completeness, Correctness, Coherence, Composite calculation, Audit report, Manifest integrity, Con dấu Git commit | `context-auditor` | **45 calls** | Sau khi Lô 1, 2, 3 hoàn tất |

**Tổng ngân sách toàn run**: ~225 tool calls.

---

## 4. Artifact sẽ tạo / sửa ngoài run-state

1. **Source Code & Harness**:
   - `src/spike/bench/fidelity.js`: Bộ điều phối chạy 10 scenarios ($K=3$) + probe SC-11 qua $B5$ Replay và $B6$ Verification.
   - `src/spike/bench/composite.js`: Module tính toán 6 metric Phase 0 và đánh giá 4 giả thuyết §24.
   - `src/spike/bench/reporter.js`: Bổ sung định dạng xuất Fidelity & Composite report (JSON/CSV).
   - `src/spike/bench/index.js` & `self-check.js`: Cập nhật CLI commands và self-check.
2. **Test Suites**:
   - `test/spike/bench/fidelity.test.js`: Kiểm thử tích hợp chạy 30 replays + SC-11, tính toán composite metrics.
3. **Manifests & Pre-Registration**:
   - `test/spike/manifests/SC-1.json` ... `SC-11.json` (11 file manifest đầy đủ 5 mục sàn $D\text{-}4$).
   - `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`: Bảng tiền đăng ký $T1$ được niêm phong bằng con dấu Git commit hash.
4. **Security Audit Document**:
   - `docs/030-Specs/Security/Audit-Spike-Code-Phase-0.md`: Báo cáo thẩm định an toàn mã nguồn spike 5 chiều.
5. **Planning & Roadmap Updates (PM ghi)**:
   - `docs/010-Planning/Estimates/Timeline-Repro.md`: Đánh dấu hoàn tất toàn bộ Phase `P0-B` (Wave 1–4).
   - `docs/010-Planning/Planning-MOC.md`: Cập nhật trạng thái Phase P0-B -> Done, sẵn sàng cho Phase `P0-C`.

---

## 5. Assumptions & Rủi ro

- `AS-1`: Code $B5$ (Replay) và $B6$ (Verify) hoạt động ổn định và có thể import trực tiếp vào $B7b$.
  → *Nếu sai*: Cần xử lý error wrapper trong $B7b$, không sửa ngược vào $B5$/$B6$.
- `AS-2`: Con dấu niêm phong $B10$ sử dụng Git commit hash của commit chứa 11 manifest files và bảng $T1$.
  → *Nếu sai*: $C1$ sẽ không đủ điều kiện tiên quyết khởi động theo $MTP\ \S6.3$.
- `AS-3`: $B9$ rà soát 100% codebase spike hiện tại và xác nhận tuân thủ synthetic data và shortcut ledger.
  → *Nếu sai*: Phải ghi nhận finding và khắc phục ngay trong Wave 4.

---

## 6. Gate Presentation

- **Trình ngày**: 2026-08-28
- **Kết quả**: Chờ duyệt từ `@TrisJr`.
