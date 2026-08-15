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

## Kết quả Bước 2 — analysis fan-out (4/4 lens, read-only)

Chi tiết ở `findings/`. Bốn kết luận đổi plan:

### K1 — `GAP-Redis`: PM đã trình bày SAI ở lượt trước, hai lần

| Sai | Đúng (PM tự verify trong `RQ.md`) |
|---|---|
| *"§22 bắt test app chạm Redis ở mọi request, `B1` **chép đúng**"* | §22 chỉ **liệt kê dependency của test app**. Ràng buộc *"chạm cả 5 trong một request"* đến từ **exit criteria `B1` của Timeline** — artifact dự án, sửa được. `B1` **siết chặt hơn nguồn** (**F1**) |
| *"ba phương án (a)/(b)/(c) ngang nhau"* | **(a) đơn độc ⇒ denominator = 0**, tự huỷ. Và (a)+(c) **không phải hai lựa chọn** mà là **hai mặt của một quyết định**: (a) là phần định nghĩa (`ACG-07` ii-b), (c) là phần hiện thực (`B1`) |

Cộng **F2**: **không scenario nào trong 10** lấy Redis làm tác nhân gây lỗi ⇒ (c) **không xoá scenario nào** khỏi danh sách của `RQ.md`.

⇒ Lo ngại *"(c) làm spike dễ hơn thực tế"* mà PM viết ở Timeline §3 là **quá nặng so với sự thật**. Chi phí thật của (c) = sửa một dòng exit criteria `B1`.

### K2 — Mâu thuẫn BA ↔ Architect về denominator, PM đã phân xử

BA nói **7** = {1,2,3,4,5,6,8}; Architect nói **5** = {1,2,3,5,8}, còn 4 và 6 bị chặn bởi `U-13` (ngữ nghĩa clock) và `ACG-10`/`U-16` (drift warn hay fatal).

**Phân xử**: cả hai đúng về hai thứ khác nhau. BA hỏi *"input nhân quả có được capture không"* → có. Architect hỏi *"verdict có xác định được không"* → chưa. Hai lens gặp nhau tại **`M-5` của BA** (*khai verdict kỳ vọng trước khi chạy*): **không thể khai verdict kỳ vọng cho scenario 4 khi `U-13` chưa giải**.

⇒ **Denominator là hàm của phạm vi `A3`**: đóng thêm `U-13` + `U-16` ⇒ **7**; không đóng ⇒ **5**. Đây là quyết định phạm vi có chi phí MD ⇒ **đưa lên gate**.

### K3 — Ba ràng buộc phải vào protocol TRƯỚC `P0-B`, nếu không tiêu 32 MD mà không kết luận được

| # | Ràng buộc | Không có thì hỏng gì |
|:--:|---|---|
| 1 | **Canary sink** tại địa chỉ môi trường đã destroy | Sau destroy, WRITE **rò rỉ** nhận `ECONNREFUSED` — **trông giống hệt** WRITE **bị chặn**. Mọi bằng chứng an toàn của `C1` vô nghĩa |
| 2 | **Capture không-cap + thí nghiệm cắt offline** | `11.b` đòi **hai vế**; vế 2 (*tỉ lệ replay theo từng mức cắt*) bị bỏ quên. Cắt tại lúc record ⇒ môi trường đã destroy, **đuôi phân bố mất vĩnh viễn**, `SEC-008` không bao giờ chốt |
| 3 | **L2 phải tồn tại và protocol ghi rõ ở tầng nào** | Exit criteria `B5` hiện **thoả được bằng L1 đơn thuần** ⇒ `THREAT-018` tái diễn nguyên vẹn |

### K4 — Bốn hội tụ độc lập giữa các lens (mức bằng chứng cao nhất run này có)

| Điểm | Lens hội tụ |
|---|---|
| **Fail-closed khi thiếu bằng chứng** — tính là KHÔNG đạt, không loại khỏi mẫu số | QA (`U-25`) · BA (scenario không replay được) · Security (`MISSING_RECORDING`) |
| **`U-25` là điều kiện tiên quyết**, không phải nice-to-have | QA (tách non-determinism) · Architect (`out-of-scope-determinism` không có tín hiệu nào khác) · BA (`K` lần đều `matched`) |
| **Quan sát viên phải ĐỘC LẬP với thứ đang được đo** | QA (verdict `B6` ≠ log replay) · Security (canary log ≠ log replay runtime) |
| **WRITE bị chặn + recorded result trả về ⇒ phân loại `matched`** | Security · Architect (đề xuất độc lập, cùng nội dung) |

### Hạng mục MỚI so với plan gốc — chờ gate duyệt

| Hạng mục | Rơi vào | Ghi chú |
|---|---|---|
| `escaped_side_effects` = **metric thứ 6**, target `0` | `A5` + `A6` | `ADR-005` ghi risk 🔴 §20.4 hiện **không có bằng chứng chấp nhận nào được định nghĩa`**. Con số `0` suy ra từ §13, không phải ngưỡng bịa |
| Ma trận 12 test `T1`–`T12` cho `THREAT-018` | `A5` | `T8` (`child_process`) **sẽ FAIL nếu L2 ở tầng runtime** — ghi nhận là khoảng hở đã đo được, **không** làm nhẹ test |
| **Shortcut ledger** — bảng ghi mỗi `SEC-xxx` bị cố ý bỏ qua | `A1` | Kiểm soát `TL-r4`; prefix nhánh `spike/` là **quy ước, không phải control** |
| Probe **`S11`** — một execution cố tình phụ thuộc Redis, ngoài denominator | `A4` khai, `B8` dựng | Kiểm chính **thủ tục quy trách nhiệm**: `S11` phải ra `incomplete-capture`, không phải `out-of-scope-determinism` |
| **Known-Missing-Input Manifest**, niêm phong trước `C1` | `A2` + `A5` | — |
| Ripple sang `P0-B`/`P0-C` | ghi vào `outline.md` §Ripple | `B1` (bất biến hạ dòng + exit criteria mới) · `B3` (log row/byte + không-cap) · `B5` (L2 + 12 test) · `B7` (A/B xen kẽ, traffic đa số thành công) · `B9` (quyết định → xác minh) · `C1` (`U-25`, canary) |

## Gate

- **Trình ngày**: cuối `W2` — dự kiến 2026-08-28
- **Câu hỏi Gate A phải trả lời**: *"Chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"*
- **Kết quả**: *(chưa trình)*
- **Điều chỉnh của anh**: *(chưa có)*

> [!WARNING]
> **Gate A không được bỏ qua để "tiết kiệm thời gian".** Bỏ qua ⇒ `P0-B` và `P0-C` chạy hết ~32 MD rồi cho ra một kết quả **không kết luận được** — đúng kịch bản `GATE-01-r` mô tả.
