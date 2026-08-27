---
id: PM-BRIEF-2026-08-28-P0B-W3
type: reference
status: draft
created: 2026-08-28
---

# Brief: 2026-08-28-p0b-wave3

**Lane**: `code`

## Yêu cầu gốc

> Thực hiện Phase P0-B Wave 3

## Bối cảnh kế thừa

- `P0-A` đóng, `Gate A` duyệt 2026-08-15. Đóng băng denominator $D = 7$, ngưỡng $\ge 6/7$, chỉ số composite fail-closed, $K = 3$.
- `P0-B Wave 1` (`B0` + `B1` + `B2`) đóng 2026-08-15, merge vào `main` qua PR #7.
- `P0-B Wave 2` (`B0'` + `S-1` + `INF-1` + `B3` + `B4` + `B8` + `m5-signatures.json`) hoàn tất và merge vào `main` qua PR #9 (`da29c0e`).
- `Wave 3` thực hiện 3 task cốt lõi tiếp theo theo `Timeline-Repro §4` và `Run Plan Wave 2–4`:
  1. **`B5`** (4.0 MD): Replay runtime tối thiểu + default-deny write fail-closed 2 lớp (`L1` sink classifier, `L2` network/process isolation), 12/12 test `T1`–`T12` (`T8-a`/`T8-b` theo `D-2`), allowlist `R3`, recorded data dispatch.
  2. **`B6`** (3.0 MD): Verification + diff engine tối thiểu, hiện thực đúng rubric `A3` (`Spec §3`), cổng `inconclusive` tầng 1 đứng TRƯỚC rubric, kết luận nhị phân `matched`/`diverged` + first divergence point.
  3. **`B7a`** (2.3 MD): Harness đo overhead baseline latency / CPU / memory khi recorder OFF vs ON. Chạy xen kẽ `OFF/ON/OFF/ON` (`D-11`), `resetOrders()`, in-process endpoint latency delta, gating checks (`memory.peak`, `nr_throttled`, `oom_kill` theo `D-12`).
- Tổng ngân sách Wave 3: **9.3 MD**.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---|---|---|
| Q1 | Chạm > 1 domain? | **Có** | BE (`B5` replay runtime, `B6` verify + diff engine), Security (`B5` default-deny 2 lớp `L1`/`L2`, ma trận `T1`–`T12`), Infra/Performance (`B7a` harness benchmark, resource gates `D-12`). |
| Q2 | Đổi kiến trúc / contract? | **Có** | Quyết định kiến trúc & thi hành cơ chế bảo mật: `B5` (default-deny write 2 lớp fail-closed, xử lý `T8-a`/`T8-b` theo `D-2`, fake clock/sink dispatching), `B6` (cổng `inconclusive` tầng 1 lọc denominator, rubric diff first-class theo `Spec §3`), `B7a` (harness benchmark A/B xen kẽ `OFF/ON/OFF/ON` khử drift seq-scan). |
| Q3 | Mơ hồ, thiếu AC? | **Không** | Exit criteria đã định nghĩa cụ thể, đánh số chi tiết trong `Timeline-Repro §4`, `Spec-Spike-Protocol §3`, và `MTP-Spike-Phase-0 §3/§5`. |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 9.3 MD, 3 task lớn, tạo ≥ 3 module mới (`src/spike/replay/**`, `src/spike/verify/**`, `src/spike/bench/**`, `test/spike/bench/**`). |

**Điểm**: 3/4 → **Tier**: `T3`

**Chọn tier thấp do phân vân**: **Không**. 3 điểm rơi thẳng vào Tier T3. Theo tiền lệ các run `P0-A`, `P0-B Wave 1`, và `Wave 2`, quy trình sử dụng `run-plan.md` + `tasks.md` làm planning artifact (do code phase này là `throwaway` theo `Spec §0.3`).

## Assumptions

- `AS-1`: Code contract `src/spike/contract/` ($B0'$) và capsule writer `src/spike/capsule/` ($B4$) đã ổn định, cung cấp đầy đủ API `parseArtifact`, `serializeArtifact`, `normalize`, `identityOf`, `directionOf` cho $B5$ và $B6$.
- `AS-2`: `D-2` được áp dụng cho `T8`: `T8-a` chạy không `--permission` (FAIL, ghi nhận khoảng hở đã đo được ở tầng runtime), `T8-b` chạy có `--permission` (probe kiểm chứng ứng viên L2 tầng process).
- `AS-3`: `B7a` chỉ đo overhead (latency delta, CPU, memory), KHÔNG tính composite metric $B7\text{-}12$ hay fidelity run trên cả 10 scenario (phần đó thuộc $B7b$ của Wave 4).
- `AS-4`: Code Wave 3 tiếp tục tuân thủ nguyên tắc `throwaway` theo `Spec §0.3`, phục vụ mục tiêu trả lời `RQ.md §39`.

## Open questions

- `OQ-1`: Môi trường kiểm thử `T1`–`T12` của $B5$ cần chạy kết hợp canary sink (`src/spike/infra/canary/`) để đo `escaped_side_effects = 0`. Cần đảm bảo script run test khởi tạo canary độc lập hoặc mock loopback probe tương thích.
- `OQ-2`: Cơ chế đo latency của $B7a$ cần đọc in-process latency header/log từ endpoint $POST /checkout$ đã được instrument ở $S-1$ (`MTP §3.1`).
