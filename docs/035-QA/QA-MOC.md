---
id: MOC-QA
type: moc
status: approved
project: repro
owner: "@quality-assurance"
created: 2026-02-04
updated: 2026-08-28
---

# 📂 035-QA Map of Content (MOC)

Đảm bảo chất lượng: Kế hoạch kiểm thử (Test Plans), Báo cáo thực nghiệm (Execution Reports), và Đo lường hiệu năng (Performance Benchmarks). Xem thêm [Documentation Master Index](../000-Index.md).

---

## 📋 Master Test Plans

- [MTP-Repro-V0.1](./Test-Plans/MTP-Repro-V0.1.md) — **Master Test Plan cho Repro V0.1** (Ban hành chính thức tại Phase P1 — 2026-08-28, Task `D8`).
  - **Phạm vi kiểm thử V0.1**: Core Replay Loop, 33 requirement `SEC MUST-V0.1`, Default-deny write fail-closed 2 tầng ($L1+L2$), CLI 6 verbs.
  - **Phương pháp đo lường tự động hoá $N\text{-}05$ trong CI**: Công thức tính toán trên $D=7, K=3$ replays ($N_{pop}=21$), tích hợp 6 bước Divergence Attribution Protocol tự động.
  - **Ma trận 33 test suites `SEC MUST-V0.1`** (`TC-SEC-001..048`) bao phủ Redaction, Envelope Encryption, Key Custody, Digest-Before-Parse, Retention, và Audit Log.
  - **Suite 12 kịch bản tấn công/side-effect ($T1$–$T12$)** kết hợp Canary Sink độc lập (`canary-net` + `canary-db`) xác nhận `escaped_side_effects == 0`.
- [MTP-Spike-Phase-0](./Test-Plans/MTP-Spike-Phase-0.md) — Kế hoạch đo lường thực nghiệm Technical Spike Phase 0 (2026-08-15).

---

## 📊 Reports & Performance Benchmarks

- [Reports/Report-Spike-Phase-0](./Reports/Report-Spike-Phase-0.md) — Báo cáo kết quả thực nghiệm Technical Spike Phase 0 (2026-08-28, Task `C3` & `C4`). Đầy đủ 8 bảng $T1$–$T8$, đối chiếu 4 giả thuyết §24 và trả lời câu hỏi cốt lõi §39 với chỉ số Composite Fail-Closed đạt **$7/7$ ($100.0\%$)**.
- [Reports/T1-Pre-Registration-Spike-Phase-0](./Reports/T1-Pre-Registration-Spike-Phase-0.md) — Bảng tiền đăng ký bất biến $T1$ với con dấu niêm phong git commit.
- [Performance/Perf-Spike-Phase-0](./Performance/Perf-Spike-Phase-0.md) — Dữ liệu đo lường hiệu năng thô 33 lượt replay, phân bố $SEC\text{-}008$ ($70$ replays cắt offline), bằng chứng Destroy và Canary Sink logs.

---

## 🔗 Liên Kết Liên Quan

- [Documentation Master Index](../000-Index.md)
- [NFR-Repro](../020-Requirements/NFR-Repro.md)
- [PRD-Repro](../020-Requirements/PRD-Repro.md)
- [Specs-MOC](../030-Specs/Specs-MOC.md)
