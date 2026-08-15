# Run Plan: 2026-08-15-p0a-spike-protocol

**Tier**: T3 · **Effort**: 9.5 MD · **Cửa sổ**: `W1–W2` (2026-08-17 → 2026-08-28)

**Critical path bên trong run**: `A1 → A3 → A4 → GA`

> `A3` là mắt xích nặng nhất của **cả Phase 0**, không chỉ của run này: `B6` không hiện thực được nếu thiếu rubric, và `C4` không kết luận được nếu thiếu `B6`. **Trượt `A3` là trượt cả Phase 0** — và `P0-A` không có tuần đệm nào (đệm `W7` thuộc `P0-B`/`P0-C`, không kéo ngược được).

## Phases

| # | Phase | Agent | Song song? | Input | Output |
|---|-------|-------|-----------|-------|--------|
| 1 | `A1` — khung Spike Protocol | `business-analyst` | Không | `RQ.md` §22/§39 · `NFR §7` · Timeline §3 | `Spec-Spike-Protocol.md` (khung + frontmatter + 4 mục rỗng) |
| 2 | `A2` — `ACG-07` Supported Execution Class | `architect` | Song song với `A3` | `A1` · `RQ.md §20.1` (9 hidden input) · **`OQ-1` `GAP-Redis`** | §2 của Spec |
| 2 | `A3` — `ACG-01` rubric execution path | `architect` | Song song với `A2` | `A1` · `RQ.md §10` · `ADR-006` · `ADR-011` · `U-04` | §3 của Spec |
| 2 | `A5` — Measurement plan | `quality-assurance` | Song song với `A2`/`A3` | `A1` · `RQ.md §23` · `ACG-04/05/11` · `SEC-008` | `MTP-Spike-Phase-0.md` |
| 3 | `A4` — `ACG-02` + `ACG-03` | `business-analyst` | Không — cần `A2` **và** `A3` | `A2` (class) · `A3` (chỉ số) · `RQ.md §22` (10 scenario) · §24 | §4 của Spec |
| 3 | `A6` — Template Spike Report | `quality-assurance` | Song song với `A4` | `A5` · `RQ.md §39`/§24 | `Template-Spike-Report.md` |
| 4 | `A7` — Review chéo | `architect` · `quality-assurance` · `security-auditor` | Ba lens **song song** | `A2`–`A6` | `findings/<role>.md` × 3 |
| 5 | `A8` — MOC + index | `context-auditor` | Không | `A7` đã xử hết `BLOCKER` | `Specs-MOC` · `QA-MOC` · `000-Index` |
| 6 | `GA` — **Gate A** | 👤 `@TrisJr` | — | `A8` + `escalations.md` | `verdict.md` |

> **`A2` và `A3` song song được vì chúng chạm hai mục khác nhau của cùng một file.** Ownership dưới đây cắt theo **mục**, không theo file — hai agent **không** được ghi đè lên nhau. Nếu công cụ không đảm bảo được điều đó thì chạy **tuần tự `A3` → `A2`** (`A3` trước vì nó trên critical path).

## File ownership map

| Agent | Sở hữu (được ghi) | Cấm chạm |
|-------|-------------------|----------|
| `business-analyst` | `Spec-Spike-Protocol.md` §1 (khung), §4 | §2, §3 · mọi file `035-QA/` |
| `architect` | `Spec-Spike-Protocol.md` §2, §3 | §1, §4 · `035-QA/` · `999-Resources/` |
| `quality-assurance` | `035-QA/Test-Plans/MTP-Spike-Phase-0.md` · `999-Resources/Templates/Template-Spike-Report.md` | toàn bộ `Spec-Spike-Protocol.md` |
| `security-auditor` | `findings/security-auditor.md` | mọi deliverable — chỉ **đọc và báo cáo** ở `A7` |
| `context-auditor` | `Specs-MOC.md` · `QA-MOC.md` · `000-Index.md` | mọi deliverable nội dung |
| 🎩 PM (không giao worker) | `brief.md` · `run-plan.md` · `escalations.md` · `findings/*` phần *"PM đọc được gì"* | — |

> Các tập ownership **rời nhau tuyệt đối**. `verdict.md` thuộc `@TrisJr`, không cấp cho vai nào.

## Artifact sẽ tạo/sửa ngoài run-state

| Đường dẫn | Mục đích | Task |
|---|---|---|
| `docs/030-Specs/Spec-Spike-Protocol.md` | **Deliverable chính** — 4 `ACG` ở dạng hypothesis có nhãn | `A1`–`A4` |
| `docs/035-QA/Test-Plans/MTP-Spike-Phase-0.md` | Cách đo 5 metric §23, gồm **P95 capsule size** (`C-04`) | `A5` |
| `docs/999-Resources/Templates/Template-Spike-Report.md` | Khuôn báo cáo, có ô cho **cả hai** nhánh Có/Không của §39 | `A6` |
| `docs/030-Specs/Specs-MOC.md` · `docs/035-QA/QA-MOC.md` · `docs/000-Index.md` | RULE-001 mục 4 | `A8` |
| `docs/010-Planning/Risk-Register.md` | Chỉ khi `A7` phát hiện rủi ro mới | `A8` |

## Ràng buộc bắt buộc của run

1. **Mọi định nghĩa mang nhãn `HYPOTHESIS — cần validate`.** Nâng lên định nghĩa sản phẩm là `D2`, thuộc `P1`, sau `GATE-06`. Vi phạm điều này là vô hiệu hoá chính mục đích của `P0-A`.
2. **`A4` phải chốt denominator TRƯỚC khi biết kết quả** — `ACG-02` tự nó đòi điều đó. Chọn scenario sau khi đã thấy kết quả là gian lận thống kê.
3. **`OQ-1` (`GAP-Redis`) không được để mặc.** `A2` phải chọn một trong ba phương án và ghi lý do; `A4` phải tính hệ quả lên denominator.
4. **Không viết một dòng code nào trong run này.** Code bắt đầu ở `P0-B`, sau `Gate A`.
5. **Escalate thay vì đoán**: vai nào gặp mục chặn không tự quyết được ⇒ ghi `escalations.md` ⇒ PM tổng hợp **kèm phản biện** ⇒ `@TrisJr` quyết.

## Gate

- **Trình ngày**: cuối `W2` — dự kiến 2026-08-28
- **Câu hỏi Gate A phải trả lời**: *"Chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"*
- **Kết quả**: *(chưa trình)*
- **Điều chỉnh của anh**: *(chưa có)*

> [!WARNING]
> **Gate A không được bỏ qua để "tiết kiệm thời gian".** Bỏ qua ⇒ `P0-B` và `P0-C` chạy hết ~32 MD rồi cho ra một kết quả **không kết luận được** — đúng kịch bản `GATE-01-r` mô tả.
