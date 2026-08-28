---
id: PM-BRIEF-2026-08-28-P0C-SPIKE-RUN-REPORT
type: reference
status: draft
created: 2026-08-28
---

# Brief: 2026-08-28-p0c-spike-run-report

**Lane**: `code`

## Yêu cầu gốc

> Thực hiện Phase P0-C

## Bối cảnh kế thừa

- `P0-A` (Spike Protocol) đã hoàn thành và `Gate A` duyệt ngày 2026-08-15. Đóng băng denominator $D = 7$, ngưỡng $\ge 6/7$, composite metric fail-closed, $K = 3$.
- `P0-B` (Spike Build) hoàn tất 100% qua 4 Waves (Wave 1: $B0$+$B1$+$B2$; Wave 2: $B0'$+$S\text{-}1$+$INF\text{-}1$+$B3$+$B4$+$B8$; Wave 3: $B5$+$B6$+$B7a$; Wave 4: $B7b$+$B9$+$B10$) ngày 2026-08-28. Toàn bộ mã nguồn harness, fixture, verification, replay runtime và security review đã hoàn tất và vượt qua 100% kiểm chứng.
- Bảng tiền đăng ký $T1$ (`docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`) cùng 11 manifests tại `test/spike/manifests/` đã được niêm phong với đầy đủ 5 mục sàn ($D\text{-}4$), thoả mãn 100% điều kiện tiên quyết bắt buộc để khởi động `C1` theo `MTP-Spike-Phase-0 §6.3` và `Spec-Spike-Protocol §1.5`.
- `Phase P0-C` (Spike Run & Report, $W10\text{–}W12$) là chặng thực nghiệm và tổng kết cao nhất của Phase 0 theo `Timeline-Repro §5` (ngân sách 10.5 MD), gồm 6 task và 1 gate quyết định:
  1. **`C1`** (3.0 MD): Chạy đủ 10 scenario $\times$ 7 bước + probe $SC\text{-}11$ ($K=3$), xuất dữ liệu thô vào `docs/035-QA/Performance/Perf-Spike-Phase-0.md`.
  2. **`C2`** (1.0 MD): Tổng hợp 6 metric cốt lõi ($R_{sr}$, $R_{em}$, Overhead, Capsule Size avg/P95, Replay Time, $escaped\_side\_effects = 0$).
  3. **`C3`** (1.5 MD): Phân loại scenario thất bại $\rightarrow$ lớp bug không replay được và quy trách nhiệm gốc đối chiếu 9 hidden input `RQ.md §20.1`.
  4. **`C4`** (2.0 MD): Ban hành chính thức **Spike Report** tại `docs/035-QA/Reports/Report-Spike-Phase-0.md`, đối chiếu 4 giả thuyết `RQ.md §24` và trả lời câu hỏi cốt lõi `RQ.md §39`.
  5. **`C5`** (1.5 MD): Cập nhật tài liệu theo dữ liệu thật (`NFR-Repro.md`, `Risk-Register.md`, `Spec-Security-*.md`, `QA-MOC.md`, `Specs-MOC.md`).
  6. **`C6`** (1.0 MD): Kiểm toán nhất quán toàn kho tài liệu sau khi đóng các $TBD$.
  7. **`G06`** (0.5 MD): **`GATE-06` (§39)** — Sponsor `@TrisJr` đưa ra phán quyết chuyển phase sang $P1$ (hoặc $P0\text{-}D$).

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---|---|---|
| Q1 | Chạm > 1 domain? | **Có** | QA/Benchmarking (`C1`, `C2`, `C4`), Architecture/Analysis (`C3`), Requirements/BA/Security (`C5`), Audit/Governance (`C6`, `G06`). |
| Q2 | Đổi kiến trúc / contract? | **Có** | Chốt kết luận kỹ thuật của toàn bộ Phase 0 cho câu hỏi `RQ.md §39`, đóng các $TBD$ về ngưỡng NFR/SEC-008 trong tài liệu nền tảng và chuẩn bị gate chuyển giao sang V0.1. |
| Q3 | Mơ hồ, thiếu AC? | **Không** | Exit criteria của từng task `C1`–`C6` và `G06` được định nghĩa chính xác và chi tiết trong `Timeline-Repro §5`, `Spec-Spike-Protocol.md`, `MTP-Spike-Phase-0.md`, và `Template-Spike-Report.md`. |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 10.5 MD, tác động lên nhiều tài liệu quan trọng (`Perf-Spike-Phase-0.md`, `Report-Spike-Phase-0.md`, `NFR-Repro.md`, `Risk-Register.md`, `Spec-Security-Repro-Threat-Model.md`, v.v.). |

**Điểm**: 3/4 → **Tier**: `T3`

**Chọn tier thấp do phân vân**: **Không**. 3 điểm rơi thẳng vào Tier T3 (Full OpenSpec / Artifact path với đầy đủ các bước GATE, analysis, execution theo lô và verification độc lập).

## Assumptions

- `AS-1`: Code harness `$B7a$`, `$B7b$`, replay engine `$B5$`, verify engine `$B6$`, và test fixtures `$B8$` đã qua kiểm chứng 100% PASS, sẵn sàng chạy lấy dữ liệu thực nghiệm phục vụ `$C1$`/`$C2$`.
- `AS-2`: Con dấu niêm phong $T1$ (`docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`) là căn cứ pháp lý tiền đăng ký bất biến, không bị sửa đổi trong suốt quá trình chạy `$C1$`.
- `AS-3`: Mọi phân loại divergence trong `$C3$` và kết luận trong `$C4$` phải được dẫn xuất 100% từ dữ liệu đo thô của `$C1$`/`$C2$`, không suy diễn cảm tính.
- `AS-4`: Việc đóng các mục $TBD$ tại `$C5$` tuân thủ nghiêm ngặt nguyên tắc `Spec §1.3` (chỉ đóng khi có dữ liệu thực chứng đầy đủ, nếu không có dữ liệu thì giữ nguyên $TBD$ kèm lý do).

## Open questions

- `OQ-1`: Kết quả thực nghiệm của 10 scenarios + probe $SC\text{-}11$ có đáp ứng trọn vẹn 4 giả thuyết của `RQ.md §24` và điều kiện $escaped\_side\_effects = 0$ để làm cơ sở cho `@TrisJr` ra phán quyết **Có** tại `GATE-06` không?
