# Brief: 2026-08-28-phase-p2-build-v01

Lane: code

## Yêu cầu gốc
Thực hiện Phase P2

## Triage
| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| Q1 | Chạm > 1 domain? | Có | Đòi hỏi hiện thực SDK (@repro/node), Replay Engine, Storage & Crypto, CLI, và Infrastructure/CI. |
| Q2 | Đổi kiến trúc / contract? | Có | Hiện thực chuẩn production format v1, Wire Protocol, Envelope Encryption AES-256-GCM, Key Custody API, và CLI 6 verbs. |
| Q3 | Mơ hồ, thiếu AC? | Không | Toàn bộ 5 Epics, 15 User Stories, Threat Model 33 SEC MUST, SDD, và MTP-Repro-V0.1 đã được ban hành và nghiệm thu 100% tại Phase P1. |
| Q4 | > 5 file hoặc > 1 ngày công? | Có | ~158 MD theo Timeline-Repro.md, 9 workstreams WS-1..WS-9, toàn bộ codebase production V0.1 tại src/ và test suite test/. |

**Điểm**: 3/4 → **Tier**: T3
**Chọn tier thấp do phân vân**: Không — Đây là toàn bộ Phase P2 (Build V0.1), bắt buộc đi theo Tier T3 (Full Path: Analysis fan-out → GATE → Planning artifacts → Implementation theo lô → Verification độc lập → Close-step).

## Assumptions
- Toàn bộ mã nguồn Phase 0 (`src/spike/`) là throwaway prototype (`TL-r4`); Phase P2 triển khai codebase production sạch tại `src/` và `test/`, tuyệt đối không mang các shortcut thử nghiệm vào production in-process runtime.
  - **Sai thì hỏng ở đâu**: Nếu tái sử dụng code spike chưa qua kiểm duyệt, các lỗ hổng an ninh (e.g. memory leak trong bounded buffer, thiếu integrity check trước parse, fail-open write) sẽ xâm nhập vào runtime của khách hàng.
- Ranh giới kiến trúc V0.1 tuân thủ nghiêm ngặt SDD-Repro, ADR-001..ADR-013, và 33 yêu cầu `MUST-V0.1` của Threat Model.
  - **Sai thì hỏng ở đâu**: Vi phạm tiêu chuẩn an ninh hoặc làm vỡ tính tất định (determinism) của replay loop ($R_{em} \ge 90.0\%$).

## Open questions
- Cần xác lập quy hoạch module / package layout (Monorepo vs Modular packages) và thứ tự các Workstream ưu tiên (`WS-1` SDK, `WS-2` Store, `WS-3` Replay, `WS-4` Verification, `WS-5` CLI) cho các Sprint/Batch đầu tiên.
  - **Ai trả lời**: Architect, DevOps, QA, Security trong bước Analysis fan-out và Sponsor `@TrisJr` phê duyệt tại Gate.
  - **Chặn phase nào**: Chặn Phase 4 (Planning Artifacts) & Phase 5 (Implementation).
