---
id: MOC-PLANNING
type: moc
status: approved
project: repro
owner: "@product-manager"
created: 2026-02-04
updated: 2026-08-28
---

# 📂 010-Planning Map of Content (MOC)

Chiến lược, kế hoạch thực thi, tiến độ các phase, và quản trị rủi ro dự án Repro. Xem thêm [Documentation Master Index](../000-Index.md).

---

## 🗺️ Tài Liệu Kế Hoạch & Quản Trị

- [Charter-Repro](./Charter-Repro.md) — Project Charter: Business Case, mục tiêu dự án, stakeholder, mô hình quản trị một người.
- [Roadmap](./Roadmap.md) — Lộ trình phát triển sản phẩm: Phase 0 (Technical Spike, **✅ Hoàn thành 100%**) $\to$ **Phase P1 (Gỡ khoá sau gate — ✅ Hoàn thành 100%)** $\to$ V0.1 $\to$ V0.2 $\to$ V0.3 $\to$ Future.
- [Risk-Register](./Risk-Register.md) — Quản lý 18 rủi ro sản phẩm, 19 threats an ninh, các mâu thuẫn nội tại đã giải quyết, và tiến độ giải toả rủi ro sau Phase P1.
- [Estimates/Timeline-Repro](./Estimates/Timeline-Repro.md) — **Timeline & WBS**: Lớp thực thi chi tiết tới mức task cho Phase 0 và Phase P1, workstreams cho V0.1. Cập nhật hoàn tất trọn vẹn Phase P1 (Tasks `D1`–`D10`, 24.5 MD) và Legal Track (`LG1`–`LG5`, 10.0 MD).

---

## 🏃 Run-State Sổ Tay Điều Phối (PM Runs)

- [pm-runs/README.md](./pm-runs/README.md) — Quy chuẩn cấu trúc sổ tay run-state của PM.
- [pm-runs/2026-08-28-phase-p1-ungate-v01/](./pm-runs/2026-08-28-phase-p1-ungate-v01/brief.md) — Run container điều phối toàn diện Phase P1 (Tier T3, Lane `doc`, 27 deliverables qua 4 Waves).

---

## 📌 Tiến Trình Các Phase Cốt Lõi

- ✅ **`Phase 0` (Technical Spike — Tasks A1–C6, 54.7 MD)**: Hoàn tất 100% thực nghiệm trên 10 scenario fixtures $\times$ 7 bước và probe $SC\text{-}11$. `GATE-06` (§39) chính thức được Sponsor `@TrisJr` phê duyệt `CÓ` ngày 2026-08-28 với chỉ số Composite Fail-Closed $7/7$ ($100.0\%$).
- ✅ **`Phase P1` (Gỡ Khoá Sau Gate — Tasks D1–D10, 24.5 MD + Legal Track 10.0 MD)**: Hoàn tất 100% toàn bộ 27 deliverables:
  - `D1`: Chốt cam kết $N\text{-}05$ ($R_{em} \ge 90.0\%$ In-Class, $\ge 80.0\%$ Composite, $\ge 60.0\%$ Diagnostic).
  - `D2`: Nâng cấp 4 ACGs ($ACG\text{-}01/02/03/07$) thành định nghĩa sản phẩm chính thức.
  - `D3`: Giải quyết dứt điểm 6 Open Items của 11 ADRs ($U\text{-}01, U\text{-}02, U\text{-}03, U\text{-}04, U\text{-}13, U\text{-}20$).
  - `D4`: Ban hành [ADR-012 Key Custody Architecture](../030-Specs/Architecture/ADR-012-Key-Custody.md) ($U\text{-}06d$).
  - `D5`: Đóng băng Repro Capsule Format v1 trong [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) và [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) §4.
  - `D6`: Thiết kế cơ chế authn/authz & CLI operational verbs (`repro auth`, `purge`, `keys`, `audit`).
  - `D7`: Gỡ `GATE-02` — Ban hành 5 Epics và 15 User Stories trong [022-User-Stories](../022-User-Stories/Stories-MOC.md).
  - `D8`: Ban hành Master Test Plan V0.1 trong [035-QA](../035-QA/Test-Plans/MTP-Repro-V0.1.md).
  - `D9`: Nâng cấp Threat Model [Spec-Security](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) với L2 Container Sandbox cho $THREAT\text{-}018$.
  - `LG1`–`LG5`: Ban hành [ADR-013 OSS License (Apache-2.0)](../030-Specs/Architecture/ADR-013-OSS-License-And-Contribution-Model.md), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, và [SLA-Security-Response](../080-Operations/SLAs/SLA-Security-Response.md).
  - `D10`: Gate Cấp vốn V0.1 sẵn sàng phán quyết bởi Sponsor `@TrisJr`.

---

## 🔗 Liên Kết Liên Quan

- [Documentation Master Index](../000-Index.md)
- [Requirements-MOC](../020-Requirements/Requirements-MOC.md)
- [Stories-MOC](../022-User-Stories/Stories-MOC.md)
- [Specs-MOC](../030-Specs/Specs-MOC.md)
- [QA-MOC](../035-QA/QA-MOC.md)
