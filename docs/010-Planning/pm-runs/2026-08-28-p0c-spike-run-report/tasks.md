# Tasks: 2026-08-28-p0c-spike-run-report

> File này do PM độc quyền quản lý và cập nhật checkbox tiến độ.

---

## Phase P0-C: Spike Run & Report (Ngân sách: 10.5 MD · W10–W12)
### Lô 1: Spike Execution & Metric Aggregation (Tasks C1, C2 · 60 calls)
- [x] **Task C1**: Chạy đủ 10 scenarios $\times$ 7 bước + probe $SC\text{-}11$ ($K=3$, 33 runs tổng cộng) trên môi trường test độc lập, bước *Destroy original environment* giữ nguyên, capture chế độ không-cap, thu thập canary logs và destroy evidence độc lập.
- [x] **Task C2**: Tổng hợp 6 metric cốt lõi ($R_{sr}$, $R_{em}$, Overhead latency/CPU/memory, Capsule Size avg/P95, Replay Time, $escaped\_side\_effects = 0$) và chỉ số Composite Fail-Closed trên mẫu số $D=7$ vào `docs/035-QA/Performance/Perf-Spike-Phase-0.md`.
### Lô 2: Divergence Attribution & Spike Report Issuance (Tasks C3, C4 · 75 calls)
- [x] **Task C3**: Phân loại các scenario thất bại hoặc nằm ngoài class ($SC\text{-}7, SC\text{-}9, SC\text{-}10, SC\text{-}11$), quy trách nhiệm theo thủ tục 6 bước $Spec\ \S3.6$ đối chiếu 9 hidden inputs $RQ\ \S20.1$ + Cache state (Quyết định $G1$).
- [x] **Task C4**: Ban hành chính thức **Spike Report** tại `docs/035-QA/Reports/Report-Spike-Phase-0.md` với đầy đủ 8 bảng chuẩn $T1$–$T8$ theo `Template-Spike-Report.md`, đối chiếu 4 giả thuyết ban đầu của $RQ\ \S24$, tuân thủ 8 điều cấm ngôn từ, và kiến nghị phán quyết cho $GATE\text{-}06$.

### Lô 3: Update Specs, NFR & Threat Model (Task C5 · 60 calls)
- [x] **Task C5**: Cập nhật các tài liệu nền tảng theo số liệu thực nghiệm từ Spike Report:
  - [x] `docs/020-Requirements/NFR-Repro.md`: Đóng các TBD thực nghiệm ($N\text{-}06, N\text{-}07, N\text{-}08, N\text{-}09$), ghi nhận số liệu $R_{em}$ cho $N\text{-}05$.
  - [x] `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md`: Cập nhật `SEC-008` (row/byte cap baseline & offline truncation results), cập nhật residual risks `THREAT-012, 014, 018`.
  - [x] `docs/010-Planning/Risk-Register.md`: Cập nhật tiến độ giải toả rủi ro kỹ thuật.
  - [x] Cập nhật các MOCs liên quan: `QA-MOC.md`, `Specs-MOC.md`, `Requirements-MOC.md`, `Planning-MOC.md`, `Timeline-Repro.md`.

### Lô 4: Consistency Audit & Close (Tasks C6, G06 · 45 calls)
- [x] **Task C6**: Kiểm toán nhất quán toàn diện toàn bộ kho tài liệu, rà soát dead links, đối chiếu số liệu chéo NFR/MTP/Perf/Report, lập `findings/context-auditor.md`.
- [x] **Task G06**: Sponsor `@TrisJr` ra phán quyết chính thức cho `GATE-06` (§39) — **Có** (Chuyển sang Phase P1) tại `verdict.md`.
