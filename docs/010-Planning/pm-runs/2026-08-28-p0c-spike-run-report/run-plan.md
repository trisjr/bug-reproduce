---
id: PM-RUN-PLAN-2026-08-28-P0C-SPIKE-RUN-REPORT
type: reference
status: draft
created: 2026-08-28
---

# Run Plan: 2026-08-28-p0c-spike-run-report

**Lane** `code` · **Tier** `T3` (3/4 điểm) · 3 lens phân tích (`quality-assurance`, `architect`, `security-auditor`) đã hoàn tất và hội tụ 100%.

---

## 1. Tóm tắt kết quả phân tích (Analysis Synthesis)

Ba lens phân tích độc lập đã hội tụ toàn diện về kế hoạch thực thi, phương pháp luận và nghiệm thu cho Phase `P0-C` (Spike Run & Report, ngân sách 10.5 MD):
1. **QA & Benchmark Execution ($C1$, $C2$, $C4$)**:
   - Khẳng định tính sẵn sàng 100% của test harness (`src/spike/bench/`) để chạy 10 scenarios fixtures $\times$ $K=3$ lần ($10 \times 3 = 30$ runs) + probe $SC\text{-}11$ ($3$ runs) = 33 runs tổng cộng, xuất dữ liệu thô ra `docs/035-QA/Performance/Perf-Spike-Phase-0.md`.
   - Chuẩn hoá cấu trúc tính toán 6 metric cốt lõi cùng chỉ số **Composite Fail-Closed** trên mẫu số cố định $D=7$ (ngưỡng hiệu dụng $\ge 6/7 \approx 85.7\%$).
   - Ban hành chính thức **Spike Report** tại `docs/035-QA/Reports/Report-Spike-Phase-0.md` với đầy đủ 8 bảng chuẩn $T1$–$T8$ theo `Template-Spike-Report.md`, đối chiếu 4 giả thuyết $RQ\ \S24$ và thực thi kiểm duyệt 8 điều cấm ngôn từ bảo vệ tính khách quan.
2. **Kiến trúc & Phân loại Phân kỳ ($C3$, $GATE\text{-}06$)**:
   - Khẳng định tính sẵn sàng 100% của verification & attribution engine (`src/spike/verify/`), áp dụng bộ lọc 2 tầng (Cổng `inconclusive` Tầng 1 và Rubric nhị phân Tầng 2) và thủ tục quy trách nhiệm 6 bước ("khớp đầu tiên thắng").
   - Xác nhận probe $SC\text{-}11$ sẽ ra đúng verdict `diverged` + `incomplete-capture` (chứng minh engine không đổ lỗi sai cho phi tất định).
   - Bảo toàn 3 luật chống gian lận thống kê ($L1$ đóng băng, $L2$ bánh cóc một chiều, $L3$ báo cáo hai mẫu số) và xác lập hệ thống điều kiện cần và đủ cho phán quyết $GATE\text{-}06$ (§39).
3. **An toàn, Kiểm chứng Bất biến & Đóng TBDs ($C1$, $C5$)**:
   - $C1$ bắt buộc chạy ở chế độ **KHÔNG-CAP** trên 100% dữ liệu synthetic nhằm bảo toàn phân bố đuôi phục vụ Thí nghiệm Cắt Offline cho `SEC-008`.
   - Xác nhận bất biến an toàn `escaped_side_effects = 0` qua hệ thống Canary Sink độc lập.
   - Phân loại rạch ròi 4 mục $TBD$ được đóng tại $C5$ dựa trên số đo thực nghiệm (`SEC-008`, `N-09`, `N-06..08`, residual risks) và 6 mục $TBD$/blockers giữ nguyên chuyển giao sang Phase $P1$/V0.1 ($D1$, $D4$, $D6$, $LG1$, $LG3$).

---

## 2. File Ownership Map

> Các tập ownership **rời nhau tuyệt đối (disjoint)**. `tasks.md` và các tài liệu điều phối do PM độc quyền sở hữu.

| Agent / Role | Tập file được ghi (Ownership) | Cấm chạm |
|---|---|---|
| **PM** | `docs/010-Planning/pm-runs/2026-08-28-p0c-spike-run-report/**`, `tasks.md`, `docs/010-Planning/Estimates/Timeline-Repro.md`, `docs/010-Planning/Planning-MOC.md` | `src/**`, `test/**`, `docs/020-Requirements/**`, `docs/030-Specs/**`, `docs/035-QA/**` |
| `quality-assurance` (`C1`, `C2`, `C4`) | `docs/035-QA/Performance/Perf-Spike-Phase-0.md`, `docs/035-QA/Reports/Report-Spike-Phase-0.md`, `docs/035-QA/QA-MOC.md` | `src/**`, `test/**`, `docs/010-Planning/**`, `docs/020-Requirements/**`, `docs/030-Specs/**` |
| `architect` (`C3`) | `docs/030-Specs/Specs-MOC.md`, đóng góp nội dung phân tích nguyên nhân gốc cho `Report-Spike-Phase-0.md` | `src/**`, `test/**`, `docs/010-Planning/**`, `docs/020-Requirements/**` |
| `business-analyst` / `security-auditor` (`C5`) | `docs/020-Requirements/NFR-Repro.md`, `docs/020-Requirements/Requirements-MOC.md`, `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md`, `docs/010-Planning/Risk-Register.md` | `src/**`, `test/**`, `docs/035-QA/**`, `docs/010-Planning/pm-runs/**` |
| `context-auditor` (`C6`, Verifier) | `docs/010-Planning/pm-runs/2026-08-28-p0c-spike-run-report/findings/context-auditor.md`, `verdict.md` (read-only audit) | Tất cả source code và deliverable documents |

---

## 3. Kế hoạch Dispatch theo Lô (Batching & Tool Call Budgets)

| Lô | Nhiệm vụ | Task & Deliverables | Worker | Ngân sách Tool Call | Phương thức |
|:---:|---|---|---|:---:|:---:|
| **Lô 1** | **C1 & C2: Spike Execution & Metric Aggregation** | Chạy 10 scenarios + SC-11 ($K=3$, 33 runs), xuất dữ liệu thô và 6 metrics vào `docs/035-QA/Performance/Perf-Spike-Phase-0.md` | `quality-assurance` | **60 calls** | Tuần tự mở đầu |
| **Lô 2** | **C3 & C4: Divergence Attribution & Spike Report Issuance** | Phân loại lỗi theo 9 hidden inputs, lập bảng $T1$–$T8$ tại `docs/035-QA/Reports/Report-Spike-Phase-0.md`, đối chiếu §24 và trả lời §39 | `quality-assurance` (lead) & `architect` | **75 calls** (60 + 15) | Sau Lô 1 |
| **Lô 3** | **C5: Update Specs, NFR & Threat Model** | Cập nhật `NFR-Repro.md`, `Risk-Register.md`, `Spec-Security-Repro-Threat-Model.md`, đóng các TBD thực nghiệm | `business-analyst` / `security-auditor` | **60 calls** | Sau Lô 2 |
| **Lô 4** | **C6 & Verification Pass: Consistency Audit & Close** | Kiểm toán nhất quán toàn kho `findings/context-auditor.md`, đối chiếu MTP/NFR/Report, chuẩn bị GATE-06 | `context-auditor` | **45 calls** | Sau Lô 3 |

**Tổng ngân sách toàn run**: ~240 tool calls.

---

## 4. Artifact sẽ tạo / sửa ngoài run-state

1. **Dữ liệu Đo thô & Báo cáo Performance**:
   - `docs/035-QA/Performance/Perf-Spike-Phase-0.md`: Dữ liệu thô 33 runs, bảng phân vị overhead $A/B$, bảng phân vị capsule size, bảng replay time và bằng chứng canary log độc lập.
2. **Báo cáo Spike Report Chính thức**:
   - `docs/035-QA/Reports/Report-Spike-Phase-0.md`: Báo cáo chính thức của Phase 0 gồm đủ 8 bảng chuẩn $T1$–$T8$, đối chiếu 4 giả thuyết $RQ\ \S24$, trả lời câu hỏi cốt lõi $RQ\ \S39$.
3. **Cập nhật Tài liệu Requirements & Security**:
   - `docs/020-Requirements/NFR-Repro.md`: Đóng các TBD thực nghiệm ($N\text{-}06, N\text{-}07, N\text{-}08, N\text{-}09$), ghi nhận số liệu thực tế cho $N\text{-}05$.
   - `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md`: Cập nhật `SEC-008` (row/byte cap baseline), cập nhật residual risks `THREAT-012`, `THREAT-014`, `THREAT-018`.
   - `docs/010-Planning/Risk-Register.md`: Cập nhật tiến độ giải toả rủi ro kỹ thuật.
4. **Cập nhật MOCs & Timeline**:
   - `docs/035-QA/QA-MOC.md`, `docs/030-Specs/Specs-MOC.md`, `docs/020-Requirements/Requirements-MOC.md`, `docs/010-Planning/Planning-MOC.md`.
   - `docs/010-Planning/Estimates/Timeline-Repro.md`: Đánh dấu hoàn tất Phase `P0-C` và sẵn sàng cho `GATE-06`.

---

## 5. Assumptions & Rủi ro

- `AS-1`: Code harness $B7a$, $B7b$, replay engine $B5$, verify engine $B6$, fixtures $B8$ vận hành hoàn toàn ổn định và cho kết quả tất định trong môi trường test độc lập.
  → *Nếu sai*: Lỗi harness sẽ làm phát sinh phân kỳ giả, kích hoạt bước 4 quy trách nhiệm (`out-of-scope-determinism`).
- `AS-2`: Con dấu tiền đăng ký $T1$ (`docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`) bất biến trong suốt quá trình chạy.
  → *Nếu sai*: Toàn bộ kết quả $C1$ mất tính hợp lệ theo `Spec §1.5`.
- `AS-3`: Chế độ chạy không-cap trong $C1$ ghi nhận 100% dữ liệu đầy đủ mà không làm cạn kiệt bộ nhớ test runner.
  → *Nếu sai*: Cần tăng heap size Node.js cho runner.

---

## 6. Gate Presentation

- **Trình ngày**: 2026-08-28
- **Kết quả**: ✅ **ĐÃ DUYỆT** — Sponsor `@TrisJr` duyệt toàn bộ Run Plan 4 lô theo đề xuất của PM ngày 2026-08-28.
