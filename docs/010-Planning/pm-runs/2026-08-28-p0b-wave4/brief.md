---
id: PM-BRIEF-2026-08-28-P0B-W4
type: reference
status: draft
created: 2026-08-28
---

# Brief: 2026-08-28-p0b-wave4

**Lane**: `code`

## Yêu cầu gốc

> Thực hiện Phase P0-B Wave 4

## Bối cảnh kế thừa

- `P0-A` đã đóng, `Gate A` duyệt ngày 2026-08-15. Đóng băng denominator $D = 7$, ngưỡng $\ge 6/7$, composite metric fail-closed, $K = 3$.
- `P0-B Wave 1` (`B0` + `B1` + `B2`) đóng ngày 2026-08-15, merge vào `main` qua PR #7.
- `P0-B Wave 2` (`B0'` + `S-1` + `INF-1` + `B3` + `B4` + `B8` + `m5-signatures.json`) hoàn tất ngày 2026-08-16, merge vào `main` qua PR #9 (`da29c0e`).
- `P0-B Wave 3` (`B5` + `B6` + `B7a`) hoàn tất ngày 2026-08-28: Replay runtime tối thiểu + default-deny write 2 lớp $T1$–$T12$ ($B5$), Verification + Diff engine nhị phân có cổng `inconclusive` ($B6$), Overhead benchmark harness ($B7a$).
- `Wave 4` là chặng cuối cùng của Phase `P0-B` theo `Timeline-Repro §4` và `Run Plan Wave 2–4`, gồm 3 task then chốt trước khi mở gate vào Phase `P0-C`:
  1. **`B7b`** (1.2–1.9 MD): Fidelity Benchmark & Composite Metric $B7\text{-}12$ (`Depends: B4, B5, B6`). Mở rộng harness `src/spike/bench/` để thực thi toàn bộ 10 scenario fixtures từ $B8$ ($K=3$ replays per scenario = 30 runs) + probe `SC-11`, thu thập và tính toán 6 metric cốt lõi ($R_{sr}$, $R_{em}$, Overhead, Capsule Size P95, Replay Time, $escaped\_side\_effects = 0$), đối chiếu 4 giả thuyết §24.
  2. **`B9`** (1.5 MD): Security Review Code Spike (`Depends: B4, B5`). Rà soát và thẩm định 5 khía cạnh bảo mật: (i) Synthetic data 100% không rò rỉ dữ liệu thật; (ii) External HTTP stub cô lập, zero production API keys; (iii) Shortcut Ledger `Spec §5` khớp đúng thực tế code; (iv) Phân loại exclusion STRUCTURAL vs FORGEABLE cho `SPIKE_RUN_ID`; (v) Bề mặt output (capsule, canary logs, bench reports).
  3. **`B10`** (0.8 MD): Known-Missing-Input Manifests (`Depends: B8`). Viết 11 file manifest (`SC-1` đến `SC-10` + `SC-11`) tại `test/spike/manifests/` với đủ 5 mục sàn ($D\text{-}4$: Redis, Filesystem, Env var, Process state, OS behavior) + trường `dự đoán ảnh hưởng` ghi trước khi chạy; lập bảng `T1-Pre-Registration-Spike-Phase-0.md` ($D\text{-}7$) và niêm phong con dấu (commit hash + ngày).
- Tổng ngân sách Wave 4: **3.5–4.2 MD**.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---|---|---|
| Q1 | Chạm > 1 domain? | **Có** | BE/QA Engine (`B7b` composite harness & verification runner), Security (`B9` security review code spike), QA/Audit (`B10` missing input manifests & pre-registration sealing). |
| Q2 | Đổi kiến trúc / contract? | **Có** | Định hình composite metric calculation, đối chiếu 4 ngưỡng §24, niêm phong tiền đăng ký ($D\text{-}7$), và phân tích cơ chế miễn trừ bảo mật $SPIKE\_RUN\_ID$. |
| Q3 | Mơ hồ, thiếu AC? | **Không** | Exit criteria đã định nghĩa cụ thể, chi tiết trong `Timeline-Repro §4`, `Spec-Spike-Protocol §5`, và `MTP-Spike-Phase-0 §3/§6`. |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 3.5–4.2 MD, 11 file manifest mới, mở rộng module `src/spike/bench/**`, tạo bảng tiền đăng ký `T1`, và audit report. |

**Điểm**: 3/4 → **Tier**: `T3`

**Chọn tier thấp do phân vân**: **Không**. 3 điểm rơi thẳng vào Tier T3. Theo tiền lệ các run trước, quy trình sử dụng `run-plan.md` + `tasks.md` làm planning artifact (code phase này là `throwaway` theo `Spec §0.3`).

## Assumptions

- `AS-1`: Code $B5$ (`src/spike/replay/`), $B6$ (`src/spike/verify/`), và $B8$ (`test/spike/scenarios/`) đã hoàn chỉnh và sẵn sàng để $B7b$ tích hợp và gọi trực tiếp.
- `AS-2`: Con dấu niêm phong cho $B10$ sẽ được chốt bằng Git commit hash sau khi 11 file manifest và bảng `T1` được tạo đầy đủ.
- `AS-3`: $B9$ đóng vai trò xác minh độc lập (independent audit) các cam kết bảo mật và shortcut ledger.
- `AS-4`: Toàn bộ code Wave 4 tiếp tục tuân thủ nguyên tắc `throwaway` theo `Spec §0.3`, phục vụ mục tiêu trả lời câu hỏi của `RQ.md §39`.

## Open questions

- `OQ-1`: Host test environment có cần cấu hình thêm cgroup v2 hay mock sampler để đo P95/P99 latency & capsule size trong chế độ unit test độc lập không?
- `OQ-2`: Việc niêm phong con dấu $B10$ trên branch làm việc hiện tại có cần commit riêng biệt trước khi bàn giao cho $C1$ không? (Đáp án: Commit cục bộ với message chuẩn và ghi hash vào bảng $T1$).
