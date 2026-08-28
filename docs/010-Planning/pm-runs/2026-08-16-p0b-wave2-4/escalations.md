---
id: PM-ESC-2026-08-16-P0B-W24
type: reference
status: draft
created: 2026-08-16
---

# Escalations: 2026-08-16-p0b-wave2-4

Append-only. Không sửa entry cũ.

---

## E1 — Đường `T3` của `pm-code` không chạy được: `openspec` chưa vào allowlist

- **Tầng**: 2 (PM tự quyết)
- **Thời điểm**: Bước 4 (Planning artifacts), trước dispatch
- **Vấn đề**: `pm-code` Bước 4 bắt `T3` chạy `/opsx:ff` + delta specs trong `openspec/changes/<name>/specs/` + `design.md`. Nhưng **chính guardrail lane code** của nó nói: *"Tier T3 cần các lệnh `openspec archive|sync|validate` nằm trong allowlist của `.claude/settings.local.json`. Thiếu là run sẽ treo ở permission prompt giữa chừng."*
- **Đo được**:
  - `openspec/changes/` — **rỗng**, mtime `Aug 11 15:26`. Repo **chưa từng** dùng đường này.
  - `grep openspec .claude/settings.local.json` → **0 hit**. Điều kiện tiên quyết **không thoả**.
  - `P0-A` (`T3`, đã đóng) và `P0-B` Wave 1 (`T2`, đã đóng) đều dùng `run-plan.md` + `tasks.md` làm planning artifact, không dùng `openspec`.
- **Quyết định**: **Đi tiếp bằng `run-plan.md` + `tasks.md`**, không scaffold `openspec`.
- **Lý do**, ba cái, xếp theo sức nặng:
  1. **Điều kiện tiên quyết không thoả.** Chạy `/opsx:ff` bây giờ là **cố tình đâm vào chế độ hỏng mà chính guardrail cảnh báo** — treo giữa chừng, sau khi đã dispatch worker.
  2. **Code phase này là `throwaway`** (`Spec §0.3`, `Timeline §4`). Một delta spec được archive cho code mà tài liệu **cấm** tiến hoá thành V0.1 là nghi thức rỗng.
  3. **Nhất quán với tiền lệ.** Hai run đã đóng của `P0-A`/`P0-B` dùng cùng bộ artifact; đổi đường ở run thứ ba làm mất khả năng so sánh run-state.
- **Cái giá đã cân nhắc**: mất `openspec validate` như một lớp kiểm hình thức. Bù lại bằng verify của `context-auditor` ở `W2.v` — kiểm nội dung, không kiểm schema.
- **Hành động**: ghi vào đây, báo `@TrisJr` trong lượt trình gate. **Anh phủ quyết được** — nếu muốn đường `openspec`, chỉ cần thêm `openspec` vào allowlist rồi bảo em chạy lại Bước 4.

---

## E2 — Gate 2026-08-16: bốn quyết định của `@TrisJr`

- **Tầng**: — (đây là GATE chính thức, không phải escalation; ghi ở đây để có một chỗ tra duy nhất)
- **Trình ngày**: 2026-08-16 · **Kết quả**: ✅ **DUYỆT**

| # | Câu hỏi | Quyết định |
|:--:|---|---|
| `G-1` | Phạm vi run | **Wave 2 rồi đóng run** — `B0'` + `S-1` + `INF-1` song song, rồi `B3` + `B4` + `B8` song song, verify, đóng. **10.2 MD, 6 implementer + 1 verifier.** Wave 3–4 chạy bằng **run mới + gate mới**, với velocity thật của Wave 2 |
| `G-2` | `DEBT-1` colima | **"Không cần run"** ⇒ PM đọc là **không nâng colima cho run này**. Hợp lý vì Wave 2 không chạy phép đo P95/P99 nào.<br>⚠️ **`DEBT-1` KHÔNG đóng** — vẫn phải hỏi lại **trước `B7`**. Và vì `devops Q5` cảnh báo OOM có thể cắn **ngay Wave 2** (recorder chạy KHÔNG CAP + buffer 100% traffic, trong `mem_limit: 320m`, trên VM `Swap: 0`), PM **bắt `INF-1` gắn cổng `memory.peak`/`oom_kill`/`nr_throttled` ngay run này** — xem `D-12` |
| `G-3` | Capacity 147–151% | **Giãn Phase 0, dời `GATE-06`.** PM cập nhật `Timeline` + `Planning-MOC` với ngày mới và ghi lý do vào §15. Đệm `P0-C` 70% **giữ nguyên** cho khả năng `C1` chạy lại |
| `G-4` | Ai duyệt `M-5` | **`@TrisJr` duyệt, TRƯỚC khi `B8` chạy fixture.** ⇒ `B8` viết 10 bộ *chữ ký lỗi + verdict kỳ vọng* rồi **DỪNG**; PM trình `@TrisJr`; duyệt xong mới chạy fixture, commit cùng nhau.<br>🔺 Đây là **điểm dừng có chủ đích giữa run** — ngoại lệ hợp lệ của quy tắc một gate, theo Escalation Protocol tầng 3 |

- **Nợ có ý thức phát sinh từ gate**:

| # | Nợ | Cắn ở đâu | Vì sao chấp nhận được bây giờ |
|:--:|---|---|---|
| `DEBT-1` *(kế thừa, chưa đóng)* | colima `2 vCPU / 1.913 GiB / Swap 0` | **`B7`**, Wave 3–4 | Wave 2 không chạy P95/P99. Nhưng vẫn là **điều kiện tiên quyết, không phải tối ưu** — `MTP §3.2` bắt `C2` **PHẢI từ chối** số không diễn giải được. Đã có phương án đo sẵn (`nr_throttled == 0`, `oom_kill == 0`) để lần hỏi sau có dữ liệu thay vì có ý kiến |
| `DEBT-2` | *(đóng bằng `D-2`)* | — | Không còn là câu hỏi nhị phân |
| `DEBT-3` | Khung file bảng `T1` | `B10`, Wave 4 | `D-7` đã chốt hình dạng lời giải; PM tạo file trước khi dispatch `B10` |
| `DEBT-4` 🆕 | **`M-5` là điểm dừng giữa run** — nếu `@TrisJr` không duyệt kịp, `B8` treo và `B10` treo theo | `B8`, run này | Đây là cái giá **có ý thức** của việc giữ tính tiền-đăng-ký. `QA Q5`: một khi fixture đã chạy trước khi verdict kỳ vọng được ghi, **không có cách nào khôi phục** |

---

## E3 — Mười hai quyết định tầng 2 của PM (chốt trước dispatch)

- **Tầng**: 2 (PM tự quyết, trong phạm vi `brief.md`)
- **Nguồn**: 4 lens read-only, xem `findings/`
- **Danh sách đầy đủ**: [`run-plan.md §2`](run-plan.md) — `D-1`…`D-11`, cộng `D-12` dưới đây phát sinh từ `G-2`.

| # | Quyết định | Ghi chú |
|:--:|---|---|
| `D-12` 🆕 | **`INF-1` phải gắn cổng tài nguyên fail-closed ngay Wave 2**: đọc `memory.peak`, `memory.events.oom_kill`, `cpu.stat.nr_throttled` của `spike-app`, và probe **4/4 `tnm_*` `State == running`**. Ngưỡng cảnh báo `memory.peak ≥ 0.9 × mem_limit` | Phát sinh từ `G-2`. `devops Q5`: mắt nguy hiểm nhất là phản xạ **nâng `mem_limit` mà không nâng VM** ⇒ `703 + 1024 = 1727/1958 MiB` (88%, swap 0) ⇒ kernel OOM-killer chọn nạn nhân **toàn VM** và **không đọc docker label**. `destroy.sh:68-97` bảo vệ `tnm_*` khỏi **sai lầm công cụ**, không bảo vệ khỏi **áp lực bộ nhớ** |

⚠️ **Hai quyết định PM tự chốt mà anh nên biết vì chúng diễn giải tài liệu `approved`:**
*(danh sách ngay dưới đây)*

---

## E4 — 🔴 RUN DỪNG: safety classifier chặn toàn bộ `Bash` và dispatch của phiên PM

- **Tầng**: 3 (vượt phạm vi PM — cần `@TrisJr` hành động)
- **Thời điểm**: ngay sau gate, tại Bước 5 (Implementation), **trước khi dispatch được worker nào**
- **Hiện tượng**, theo đúng thứ tự đã xảy ra:

| # | Hành động | Kết quả |
|:--:|---|---|
| 1 | `git checkout -b spike/p0b-wave2 && git commit` | ❌ **chặn** |
| 2 | `git status --short` *(read-only thuần)* | ❌ **chặn** |
| 3 | Dispatch `architect` (`B0'`) | ❌ **chặn** |
| 4 | Dispatch `software-engineer` (`S-1`) | ❌ **chặn** |
| 5 | Dispatch `devops-engineer` (`INF-1`) | ❌ **chặn** |

Thông điệp của classifier khai rõ hai điều: nó phản ứng với **nội dung hội thoại trước đó**, **không** phải với hành động; và nó **sẽ bắn suốt phần còn lại của phiên**. Viết lại prompt hay đổi cách gọi **không** vòng qua được.

- **Đây KHÔNG phải hiện tượng mới.** `E5` của run Wave 1 đã ghi đúng pattern này: *"block bám theo **phiên**, không theo hành động, và **spawn worker mới không reset được**"*. Wave 1 mất 3/6 worker vì nó. Điểm khác lần này: nó bắn vào **chính PM** chứ không vào worker, nên **không có đường vòng nào** — Wave 1 còn xoay được bằng cách giao phép đo cho một agent khác; lần này không dispatch được ai cả.
- **Trạng thái run bị đóng băng ở**: gate **đã duyệt**, kế hoạch **đã đầy đủ**, **chưa dispatch worker nào**, **chưa có một dòng code Wave 2 nào**.
- **Việc PM VẪN hoàn thành được** (Read/Write/Edit không qua classifier):
  - `brief.md` · `run-plan.md` · `tasks.md` · `escalations.md` · 4 file `findings/`
  - ✅ **Ripple `G-3` đã áp đủ**: `Timeline-Repro.md` (§1 `TL-A1` · §2 bảng phase + bảng capacity 3 lần + phân bổ · §4 ba task 🆕 + tách `B7` + bảng thay đổi + capacity · §2.1 mốc · §15 mục có ngày) và `Planning-MOC.md`.
- **Việc KHÔNG làm được**: branch `spike/p0b-wave2` · commit · toàn bộ Wave 2.1 và 2.2 · verify.
- **Hệ quả cần biết**: run-state và ripple `Timeline`/`MOC` đang nằm **chưa commit trên `main`**. Chúng sẽ theo sang branch mới nguyên vẹn khi tạo được — không mất mát, nhưng cũng **chưa được niêm phong**.
- **Hành động cho `@TrisJr`** — hai đường, chọn một:
  1. **Phiên mới** (`/pm-code` với cùng đối số). Run-state đã đủ để phiên mới đọc và dispatch thẳng: `run-plan.md §3` có phân sóng, `§4` có ownership map, `tasks.md` có toàn văn task. **Đây là đường Wave 1 đã dùng và đã hiệu quả.**
  2. Chuyển khỏi auto mode về **permission mode mặc định** rồi tiếp tục trong phiên này.
- **Việc đầu tiên của phiên sau**: tạo branch `spike/p0b-wave2`, commit run-state + ripple, rồi dispatch **Wave 2.1** (3 worker song song) đúng như `tasks.md`.
- **`D-4`** — sàn manifest thành **5 mục** (thêm `OS behavior`). Ba tầng tài liệu chép lệch nhau; PM chọn **bản nghiêm hơn** theo nguyên tắc fail-closed.
- **`D-9`** — quy tắc gán `inClass` cho spike (`S1`–`S6` tại capture kèm `mechanism`; **`S7` không tham gia `inClass` ở `P0-B`**). Nó **không** đổi `D = 7`, ngưỡng `≥6/7`, hay `K = 3` — ba tham số `L1` đã đóng băng — chỉ nói **ai chấm `S7` và chấm ở đâu**. Nhưng nó là quyết định nặng nhất PM tự chốt trong run này.
