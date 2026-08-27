---
id: PM-BRIEF-2026-08-16-P0B-W24
type: reference
status: draft
created: 2026-08-16
---

# Brief: 2026-08-16-p0b-wave2-4

**Lane**: `code`

## Yêu cầu gốc

> tiếp tục thực hiện Wave 2–4 (B3–B10)

## Bối cảnh kế thừa (không phải diễn giải yêu cầu — là trạng thái đã chốt)

- `P0-A` đóng, `Gate A` duyệt 2026-08-15. Đóng băng theo `L1`: `D = 7`, ngưỡng `≥6/7`, chỉ số composite fail-closed, `K = 3`.
- `P0-B` **Wave 1** (`B0` + `B1` + `B2`) đóng 2026-08-15, run [`2026-08-15-p0b-spike-build`](../2026-08-15-p0b-spike-build/verdict.md). Đã **merge vào `main`** qua PR #7 (`15c462e`).
- Quyết định `G-1` của Wave 1: *"Wave 2–4 chạy bằng **run mới + gate mới**, với ước lượng đã hiệu chỉnh bằng velocity thật của Wave 1"*. Run này chính là run đó.
- Phạm vi: `B3` (4.0) · `B4` (1.5) · `B5` (4.0) · `B6` (3.0) · `B7` (2.0, đo lại 3.0–3.7) · `B8` (2.0) · `B9` (1.0) · `B10` (0.5) = **18.0 MD trên ngân sách**, tức **~73% toàn bộ `P0-B`** dồn vào một run.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---|---|---|
| Q1 | Chạm > 1 domain? | **Có** | BE (`B3`–`B6`, `B8`), Infra (`B7` harness + colima + container `tnm_*`), Security (`B5` default-deny hai lớp, `B9` audit), QA (`B10` manifest + con dấu). Bốn domain, không phải hai. |
| Q2 | Đổi kiến trúc / contract? | **Có** | Ba thứ: (i) seam `B1`→`B0` còn hở (`W-3`: `direction` vắng, `kind` ngoài `KINDS`) phải vá **tại tầng contract**; (ii) `DEBT-2` — `L2` đặt ở tầng nào cho `T8` là quyết định kiến trúc bảo mật chưa chốt; (iii) `B4` capsule "tự chứa" định nghĩa lại ranh giới artifact. Cộng thêm `Spec-Spike-Protocol` là spec **đã publish + approved**. |
| Q3 | Mơ hồ, thiếu AC? | **Không** | Hiếm khi trả lời Không, nhưng đúng ở đây: `Timeline §4` cấp exit criteria **tường minh tới mức đánh số** cho cả 8 task, và `Gate A` đã đóng băng mọi tham số đo. Chỗ mơ hồ còn lại là **3 nợ có tên** (`DEBT-1`/`-2`/`-3`) — nợ đã định danh không phải mơ hồ, nó là mục nghị sự của gate. |
| Q4 | > 5 file hoặc > 1 ngày công? | **Có** | 18.0 MD, 8 task, ≥ 5 thư mục mới (`recorder`, `capsule`, `replay`, `verify`, `bench`, `test/spike/{scenarios,manifests,bench}`). Vượt xa mọi ngưỡng. |

**Điểm**: 3/4 → **Tier**: `T3`

**Chọn tier thấp do phân vân**: **Không**. Không có phân vân — 3 điểm rơi thẳng vào dải `T3`, và ngay cả nếu chấm `Q3` = Có thì vẫn `T3`. Đây là tier cao nhất; không còn chỗ escalate lên, chỉ còn chỗ **cắt scope xuống**, và đó là câu hỏi số một của gate.

## Assumptions

- `AS-1` — **Wave 1 là nền móng dùng được, không phải nền móng phải sửa.** `B3`–`B6` xây thẳng lên `src/spike/contract/` và `src/spike/app/` đang có.
  → **sai thì hỏng ở đâu**: nếu `B0` phải đổi signature giữa chừng, cả ba consumer (`B3`/`B5`/`B6`) rework cùng lúc — đúng chế độ hỏng mà `B0` sinh ra để chống.
- `AS-2` — **`W-3` là việc của `B3`, không phải việc của `B0`.** `Timeline` đã ghi vào exit criteria `B3` mục (v): `B3` bù trường `direction` và ánh xạ `kind`.
  → **sai thì hỏng ở đâu**: nếu bù ở tầng `B3` mà `B5`/`B6` lại nhận dữ liệu chưa bù từ đường khác, ta có **hai** normalization — tái tạo `R1` ở tầng match.
- `AS-3` — **`escaped_side_effects` đo được ở `B5` bằng rig của Wave 1.** Rig đã verify: bơm 3 leak không marker thì đếm đủ 3/3.
  → **sai thì hỏng ở đâu**: `canary_coverage` còn `incomplete` tới khi `B8` giao fixture attestation ⇒ `B5` không được phép **tuyên bố** `= 0`, chỉ được **đo**. Đảo thứ tự `B8`/`B5` là đảo cả điều kiện đọc số.
- `AS-4` — **Code Wave 2–4 vẫn là `throwaway`** theo `Spec §0.3`, branch mang tiền tố `spike/`.
  → **sai thì hỏng ở đâu**: coi nó là code sản phẩm ⇒ chi phí chất lượng đội lên trên một phase vốn đã 122.5% capacity.
- `AS-5` — **Verify run này KHÔNG dùng `quality-assurance`** (kế thừa `AS-5` của Wave 1): QA là driver của `B10`, verify bằng chính nó là nghi thức rỗng. Dùng `context-auditor`.
  → **sai thì hỏng ở đâu**: con dấu `B10` được kiểm bởi người vừa đóng dấu.

## Open questions

- `OQ-1` — **Phạm vi run**: chạy hết 8 task, hay cắt theo sóng? 18.0 MD trong một run so với 6.0 MD của Wave 1 (đã tốn 5 spawn + 2 resume + 2 vòng verify). → **gate**, chặn toàn bộ.
- `OQ-2` — `DEBT-1` **colima 2 vCPU / 1.91 GiB**. → **gate**, chặn `B7`. Không có nó, `B7` sinh số mà `MTP §3.2` bắt `C2` **phải từ chối**.
- `OQ-3` — `DEBT-2` **`T8` + `--permission`**: bật `--permission` cho replay runtime hay ghi `T8` là khoảng hở đã đo? → **gate**, chặn `B5`. Nay không còn là "quyết trong chân không" — `B5` bắt đầu trong run này.
- `OQ-4` — `G-3` **`docker stop` 4 container `tnm_*`**: đã duyệt có điều kiện *"cắn ở `B5`/`C1`, xác nhận lại đúng lúc"*. Đúng lúc **là bây giờ**. → **gate**, chặn `B5`.
- `OQ-5` — `DEBT-3` khung file bảng `T1` cho con dấu `B10`; và quyền git: `B10` định nghĩa **niêm phong = commit**, nên quyền commit ở đây không phải tiện ích mà là **một phần của deliverable**. → **gate**, chặn `B10`.
- `OQ-6` — `W-7` (đếm đôi statement SQL lỗi) phải đóng **trước `C1`**. Nó thuộc `src/spike/infra/coverage/` — vùng của `B2`, đã đóng. Ai nhận? → PM phân xử ở run-plan, không cần gate.
