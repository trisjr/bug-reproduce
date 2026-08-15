---
id: TEMP-SPIKEREPORT
type: template
status: approved
owner: "@TrisJr"
created: 2026-08-15
updated: 2026-08-15
---

> [!IMPORTANT]
> ✅ **`Gate A` DUYỆT — `@TrisJr`, 2026-08-15.** Khuôn này đã **đóng băng**: 8 bảng `T1`–`T8` là **bắt buộc điền**, và danh sách phát biểu **CẤM** ở §3 là **ràng buộc**, không phải lời khuyên văn phong. Bản ghi quyết định: [`pm-runs/2026-08-15-p0a-spike-protocol/verdict.md`](../../010-Planning/pm-runs/2026-08-15-p0a-spike-protocol/verdict.md).

# 🧪 Template: Spike Report — Phase 0

> Khuôn bắt buộc cho `docs/035-QA/Reports/Report-Spike-Phase-0.md` (task `C4`).
>
> Người đọc cuối cùng của tài liệu điền theo khuôn này là **`@TrisJr` tại `GATE-06`**, và câu hỏi ông ấy phải trả lời là câu hỏi nguyên văn của [RQ.md](../RQ.md) §39:
>
> > **Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?**

---

## 1. Cách dùng template này

### 1.1 Ai điền, khi nào, ai đọc

| Câu hỏi | Trả lời |
|---|---|
| **Ai điền** | Task **`C4`** — driver 🧪 **QA**, collaborators 🎩 PM + 🏗️ Architect ([Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5) |
| **Khi nào** | Sau `C3` (phân loại scenario thất bại), trước `C5`. **Bảng `T1` là ngoại lệ** — xem §1.2 |
| **Đầu vào** | `C1` (dữ liệu thô, `docs/035-QA/Performance/Perf-Spike-Phase-0.md`) · `C2` (6 metric **+ chỉ số composite**) · `C3` (quy trách nhiệm) · Known-Missing-Input Manifest đã niêm phong |
| **Đầu ra là gì** | `docs/035-QA/Reports/Report-Spike-Phase-0.md` — deliverable của `C4` |
| **Ai đọc** | 👤 **`@TrisJr`** tại **`GATE-06`**. Exit criteria của `G06`: quyết định **Có** hoặc **Không**, *"kèm lý do **neo vào số đo** — **không** neo vào cảm nhận"* |
| **Đọc để làm gì** | Trả lời [RQ.md](../RQ.md) §39. Nhánh **Có** ⇒ mở `P1` (`D1`, `D2`…). Nhánh **Không** ⇒ mở `P0-D` (`N1`–`N4`) |

### 1.2 ⛔ Template này KHÔNG phải gợi ý

> **Tám bảng `T1`–`T8` ở §2 là BẮT BUỘC ĐIỀN.** Không bảng nào là tuỳ chọn. Một bảng không có dữ liệu vẫn phải xuất hiện, với ô ghi rõ **vì sao không có dữ liệu** — không được xoá bảng.
>
> **Danh sách phát biểu cấm ở §3 là RÀNG BUỘC, không phải lời khuyên văn phong.** Mỗi dòng cấm có **neo nguồn** ở cột bên cạnh; vi phạm một dòng là vi phạm chính cái neo đó, không phải một lựa chọn biên tập khác đi.
>
> **`T1` phải được điền và ĐÓNG BĂNG tại `Gate A`** — tức **trước khi `C1` chạy dòng đầu tiên**, không phải lúc ngồi viết report. Đây là bảng duy nhất trong template có thời điểm điền khác với phần còn lại, và lý do nằm ở §2.1.
>
> **Hai nhánh §39 ở §4 dùng CÙNG một bộ khung.** Nhánh **Không** không được rút gọn thành phụ lục.

### 1.3 ⚠️ Xung đột tên — đọc trước khi vào §2

Kho tài liệu này có hai chỗ ký hiệu bị dùng lại. Report điền theo template sẽ chứa **cả hai** namespace trong cùng một file, nên quy ước dưới đây là bắt buộc:

| Ký hiệu | Trong tài liệu này nghĩa là | Namespace kia — cách gọi bắt buộc |
|---|---|---|
| **`T1`–`T8`** | **Tám bảng bắt buộc của Spike Report** (§2) | [MTP-Spike-Phase-0](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §5.3 dùng `T1`–`T12` cho **ma trận 12 test `THREAT-018`**. ⇒ Khi nhắc tới chúng, **luôn viết đủ**: *"test `T8` của ma trận §5.3 MTP"*. `T#` trần **luôn** là bảng của report |
| **`S1`–`S7`** | **Điều kiện đủ của Supported Execution Class** ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §2.2). `S#` **trần** trong report **luôn** mang nghĩa này | **10 scenario của §22 KHÔNG bao giờ được viết là `S#`** — luôn viết **`SC-1`…`SC-10`**, và probe là **`SC-11`**. ⇒ `SC-11` (probe) khác hoàn toàn `S7` (một điều kiện class) |
| **`G1`–`G4`** | **Quyết định của `@TrisJr` ngày 2026-08-15** (`G1` = `GAP-Redis`, `G2` = `OQ-2` synthetic, `G3` = denominator `D`…) — theo cách dùng của [MTP](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) và [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 1 dành `G1`/`G2`/`G3` cho **Goals của V0.1** ở PRD, và alias `GATE-01`…`GATE-05` = `G1`…`G5`. ⇒ Trong report, **luôn qualify**: *"quyết định `G1` (`GAP-Redis`, 2026-08-15)"*. Cổng luôn viết đủ `GATE-0N` |

### 1.4 Khi copy template thành report — re-base đường dẫn

Template nằm ở `docs/999-Resources/Templates/`; report nằm ở `docs/035-QA/Reports/`. **Mọi relative link phải được tính lại khi copy** (ví dụ `../../035-QA/Test-Plans/…` ⇒ `../Test-Plans/…`). Dùng **standard markdown link**, **không** dùng wiki-link.

---

## 2. Tám bảng bắt buộc `T1`–`T8`

### 2.1 `T1` — Khai báo TRƯỚC khi chạy

> 🔺 **Đây là bảng chống gian lận thống kê hậu kỳ.**
>
> Mọi ô của `T1` phải được điền và **đóng băng tại `Gate A`**, trước khi `C1` chạy. Một denominator được chọn *sau khi* nhìn kết quả, một chỉ số *"reproduced"* được định nghĩa lại *sau khi* thấy con số, một class được thu hẹp *sau khi* biết scenario nào fail — cả ba đều tạo ra một báo cáo **đúng về số học và sai về bằng chứng**, và **không có cách nào phát hiện điều đó từ chính báo cáo** nếu bảng này không tồn tại.
>
> Neo: luật **Đóng băng** · **Bánh cóc** · **Hai mẫu số** — [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §1.4. Và [ADR-010](../../030-Specs/Architecture/ADR-010-Bounded-Determinism-Scope.md) §Consequences: `≥80%` *"có thể được làm đẹp bằng cách thu hẹp phạm vi"*.

| # | Hạng mục khai báo | Giá trị đóng băng | Chủ sở hữu giá trị | Ngày chốt |
|:--:|---|---|---|---|
| 1 | **Denominator** — tập scenario được tính vào `N-01`/`N-05` | `<D = …>` · liệt kê **đích danh** scenario nào trong / ngoài | §4 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-02`+`ACG-03`, task `A4`) | `<YYYY-MM-DD>` |
| 2 | **Chỉ số *"reproduced"* đã chọn** | `<tên chỉ số + neo tới rubric>` | rubric §3 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-01`, task `A3`) | `<YYYY-MM-DD>` |
| 3 | **Supported Execution Class** — phiên bản đang áp dụng | `<neo tới §2 Spec-Spike-Protocol, ghi rõ S1–S7 + hai trục loại trừ>` | §2 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-07`, task `A2`) | `<YYYY-MM-DD>` |
| 4 | **Phương án `GAP-Redis`** | `<phương án đã chọn + hai ràng buộc R1/R2 có được giữ không>` | quyết định `G1` (`GAP-Redis`, 2026-08-15) — §2.5 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | `<YYYY-MM-DD>` |
| 5 | **Giá trị `K`** (`U-25` — số lần replay mỗi capsule) | `<K = …>` | [MTP-Spike-Phase-0](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §2.3 | `<YYYY-MM-DD>` |
| 6 | **Known-Missing-Input Manifest — con dấu niêm phong** | `<commit hash>` · `<ngày commit>` | [MTP-Spike-Phase-0](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §6.3 | `<YYYY-MM-DD>` |
| 7 | **Ngày chốt `T1` / `Gate A`** | `<YYYY-MM-DD>` — sau ngày này mọi ô trên là bất biến | 👤 `@TrisJr` | — |

> **Ô 6 không phải trang trí**: [MTP §6.3](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) bước 3 ghi thẳng *"Hash và ngày được chép vào bảng `T1` (bảng khai báo trước khi chạy) của Spike Report"*. Thiếu ô này là một hợp đồng bị treo, và điều kiện tiên quyết (ii) của `C1` trở thành **không kiểm được**.
>
> **Nếu một ô bị đổi sau ngày chốt**: ghi thành **một dòng phụ lục riêng** — giá trị cũ, giá trị mới, ngày đổi, lý do, và **phạm vi phải chạy lại**. ⛔ **CẤM** sửa đè lên ô gốc.

### 2.2 `T2` — Sáu metric + chỉ số composite + điều kiện đo cho TỪNG con số

> **Vì sao bảng này bắt buộc**: một con số overhead không có tỷ lệ lỗi đi kèm, hay một `P95` không có `N` đi kèm, là con số **không diễn giải được** — và một con số không diễn giải được vẫn sẽ được đọc, vẫn sẽ được dùng để quyết định. Cột *"điều kiện đo"* tồn tại để chặn đúng chuyện đó. Neo: `ACG-04`/`ACG-05`/`ACG-11` ([NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 7), bịt tại [MTP](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) §3.

Sáu metric (dòng 1–6) giữ **đúng tên và đúng số thứ tự** của [MTP §2.1](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md). **Dòng 7 KHÔNG phải metric thứ bảy** — nó là **chỉ số gate** của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6, tồn tại vì hai chỉ số §23 ở dòng 1–2 **có lỗ rò**; harness `B7` phải xuất nó ở dạng máy đọc được ([MTP §8.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) `B7-12`).

| # | Metric | Giá trị đo được | **Điều kiện đo** (bắt buộc, không được để trống) |
|:--:|---|---|---|
| 1 | **Replay Success Rate** (`N-01`) | `<x/D = …%>` · **kèm số trên cả 10 scenario**: `<y/10 = …%>` | `<denominator theo T1 ô 1; verdict lấy tại bước 7 của §22>` |
| 2 | **Execution Match Rate** (`N-05`) | `<x/(D×K) = …%>` · diagnostic `<y/(10×K)>` | `<mẫu số = Total replays, KHÔNG phải total test case; K theo T1 ô 5; rubric §3 Spike Protocol>` |
| 3a | **Capture Overhead — Latency** (`N-02`) | baseline `<avg/P50/P95/P99>` · ON `<avg/P50/P95/P99>` · delta `<…%>` | `<latency P95 = <giá trị> ms (N = <số request>, error_rate = <x>%, sampling = OFF)>` · `<path: P-discard hay P-persist — báo cáo RIÊNG, không gộp trung bình>` · `<A/B xen kẽ OFF/ON/OFF/ON; đo tại endpoint, tầng ứng dụng; 100% traffic>` |
| 3b | **Capture Overhead — CPU** (`N-06`) | `<…% CPU>` · `<… CPU-seconds>` | `<chu kỳ lấy mẫu; cửa sổ load run; error_rate; sampling = OFF>` |
| 3c | **Capture Overhead — Memory** (`N-07`) | avg `<… MB RSS>` · peak `<… MB RSS>` | `<như trên>` |
| 3d | **Capture Overhead — Network** (`N-08`) | gửi/nhận `<… bytes>` · upload capsule `<… bytes>` (tách riêng) | `<như trên>` |
| 4 | **Capsule Size** (`N-03` avg / `N-09` P95) | avg `<… bytes>` · **`P95 = <giá trị> (N = <số capsule>)`** | `<điểm đo = P-persisted: sau redact, sau compress, sau encrypt>` · `<P-serialized = <…> ⇒ tỉ lệ nén = <…> (diagnostic, KHÔNG thay N-03)>` · `<population = mọi capsule sinh bởi C1>` |
| 5 | **Replay Time** (`N-04`) | `<… s>` · breakdown `t_boot = <…>` / `t_replay_exec = <…>` / `t_verify = <…>` · `t_pull = <…>` (đo riêng, **không** cộng vào `N-04`) | `<capsule size của CHÍNH capsule đó = <… bytes> — ghi cùng dòng>` · `<N = số lần replay>` |
| 6 | **`escaped_side_effects`** | `<count>` · **Target = `0`** | `<nguồn = CANARY LOG, không phải log của replay runtime>` · `<canary có lắng nghe loopback không: có/không>` · `<phạm vi: 10×K lần replay + ma trận 12 test §5.3 MTP>` |
| **7** | 🔺 **Chỉ số composite** — **CHỈ SỐ GATE**, **KHÁC** `EMR` thô ở dòng 2 ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6) | `<số scenario reproduced / D = …>` — **phân số thô là dạng bắt buộc** | `<mẫu số = D đóng băng tại T1 ô 1, CỐ ĐỊNH — KHÔNG co khi replay không chạy>` · `<một scenario tính reproduced ⟺ (a) replay CHẠY TỚI KẾT QUẢ VÀ (b) CẢ K lần đều matched — fail-closed>` · `<scenario không replay được (crash / capsule không mở được / replay từ chối khởi động): liệt kê đích danh — chúng tính KHÔNG reproduced và VẪN nằm trong mẫu số>` · `<nguồn = trường composite trong output máy đọc được của B7 (MTP §8.2 B7-12)>` |

> **Hai định dạng bắt buộc, chép nguyên văn khi điền** ([MTP §2.5](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) và [§3.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md)):
>
> ```text
> P95 = <giá trị> (N = <số capsule>)
> latency P95 = <giá trị> ms (N = <số request>, error_rate = <x>%, sampling = OFF)
> ```
>
> **Luật in `N` không có ngoại lệ** — mọi chỗ in `P95`/`P99` đều in `N` ngay cạnh.
>
> `Target = 0` của dòng 6 là **ngưỡng duy nhất** trong toàn bộ template này, và xuất xứ của nó ở [MTP §2.7](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) (§13 *"must never"* + [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Open items). Nó **không** phải một đánh đổi định lượng như bốn con số §24.

> ### 🔺 Ba con số PHẢI cùng xuất hiện — dòng 1, dòng 2 và dòng 7
>
> `RSR` (dòng 1) · `EMR` **thô** (dòng 2, mẫu số **danh nghĩa** `D × K` — **và chính mẫu số này co lại khi replay không chạy**) · **chỉ số composite** (dòng 7, mẫu số **cố định** `D`). Neo: [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6.
>
> **In thiếu một trong ba là in một bức tranh không kiểm chứng được**, và đúng chỗ thiếu đó là chỗ lỗ rò ẩn nấp: một scenario **không replay được** rơi hẳn khỏi mẫu số của `EMR` thô — nó **không** làm tỷ lệ xấu đi, nó **biến mất**. ⇒ *"3 scenario replay được, cả 3 khớp"* cho `EMR = 100%` trong khi 4 scenario **chưa từng được replay một lần nào**. Dòng 7 tồn tại để kịch bản đó **không** in ra được con số đẹp.
>
> ⛔ Dòng 7 **không thay thế** dòng 1 và dòng 2: exit criteria của `C2` vẫn đòi cả hai chỉ số §23 đúng theo định nghĩa gốc.

### 2.3 `T3` — Per-scenario

> **Vì sao bảng này bắt buộc**: một tỷ lệ tổng hợp (`x/N`) **không** cho biết lớp bug nào replay được. Nhánh **Không** của §39 yêu cầu *"identify which classes of bugs cannot be replayed"* — thứ đó chỉ dựng được từ bảng per-scenario, không dựng được từ một phần trăm.

| Scenario | Trong denominator? | Replay chạy được? | Verdict lần 1 | Verdict lần 2 | … lần `K` | Điểm phân kỳ **đầu tiên** | Lớp quy trách nhiệm |
|---|:--:|:--:|:--:|:--:|:--:|---|---|
| `<SC-1 — tên scenario §22>` | `<có/không>` | `<có/không — nếu không, ghi lý do>` | `<matched/diverged>` | `<matched/diverged>` | `<matched/diverged>` | `<chỉ số đơn vị + mô tả>` | `<nhãn — xem ghi chú dưới>` |
| `<…>` | | | | | | | |
| **`SC-11`** (probe) | ❌ **Ngoài denominator — theo cấu tạo** | `<có/không>` | `<…>` | `<…>` | `<…>` | `<…>` | `<phải là incomplete-capture>` |

**Quy tắc điền — bốn ràng buộc:**

1. **Verdict ghi cho TỪNG lần trong `K` lần**, không ghi *"lần đại diện"*. Cả `K` lần đều nằm trong population của `N-05` ([MTP §2.3](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) quy tắc 1). ⚠️ **Cả `K` lần cùng `matched`** cũng là điều kiện (b) của chỉ số composite — xem `T2` dòng 7.
2. **`K` lần cho khác verdict ⇒ đây là tín hiệu của `U-25`**, và nó dẫn tới nhãn **`out-of-scope-determinism`** của [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md).
3. **Cột *lớp quy trách nhiệm* lấy nhãn BẰNG THAM CHIẾU từ MỘT nguồn duy nhất**: [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) — nơi sở hữu **thứ tự** và **tập nhãn** (gồm `unattributed`). [MTP §7.1](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) **không** định nghĩa thứ tự; nó chỉ cấp **cách thu bằng chứng** cho từng nhãn (đọc manifest ở đâu, redaction record ở đâu, cờ `truncated` ở đâu, canary log ở đâu). ⛔ Template này **không sở hữu** và **không được sắp xếp lại** thủ tục đó.
4. **Dòng `SC-11` bắt buộc có mặt.** `SC-11` cố tình nằm ngoài class và **phải** ra `diverged` với nguyên nhân `incomplete-capture`. Ra sai nhãn ⇒ **rubric có lỗi**, phải sửa **trước khi `C3` chạy** ([Spec-Spike-Protocol §2.5](../../030-Specs/Spec-Spike-Protocol.md)). Dòng này là bằng chứng duy nhất trong report cho thấy thủ tục quy trách nhiệm **đã được kiểm chính**.

> **Cột *"điểm phân kỳ đầu tiên"* để trống ⇒ ba nhãn `redaction` · `incomplete-capture` · `truncated` của thủ tục quy trách nhiệm không thu được bằng chứng** ([MTP §7.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md)). Nếu rubric không xuất ra được đại lượng này, đó là một phát hiện phải ghi vào `T7`, **không** phải một ô được bỏ trống im lặng.

### 2.4 `T4` — Attribution matrix

> **Vì sao bảng này bắt buộc, và vì sao cột Redis/cache phải ĐỨNG RIÊNG:**
>
> `GAP-Redis` chính là bằng chứng cho thấy **9 nhóm hidden input của §20.1 KHÔNG phủ hết** không gian nguyên nhân. Redis không nằm trong 9 nhóm đó — nó là một dependency **được đặt tên tường minh** mà §18 chủ động không capture, và [Spec-Spike-Protocol §2.4](../../030-Specs/Spec-Spike-Protocol.md) phải **thêm hẳn một trục loại trừ thứ hai** vì *"trục 1 không phủ được `GAP-Redis`"*.
>
> ⇒ Nếu template không có cột riêng, người điền sẽ ép Redis vào một trong 9 cột — và **lỗi sẽ tái diễn** ở đúng chỗ nó đã xảy ra một lần: một nguyên nhân có tên bị quy về một nhóm không chứa nó, rồi biến mất khỏi báo cáo.

Mỗi **scenario fail** một dòng. Đánh dấu `✅` nếu nguyên nhân được quy về cột đó, `—` nếu không, `?` nếu **không có cơ chế phát hiện**.

| Scenario fail | 1. Env vars | 2. Filesystem state | 3. Randomness | 4. System clock | 5. Process state | 6. Concurrency | 7. Network behavior | 8. OS behavior | 9. Background jobs | 🔺 **Redis / cache** (ngoài §20.1) | Nguyên nhân kết luận |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| `<tên scenario>` | `<✅/—/?>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<nhãn từ T3 + neo tới mục manifest nếu có>` |
| `<…>` | | | | | | | | | | | |

**Quy tắc điền:**

- Cột **Redis / cache** neo vào quyết định `G1` (`GAP-Redis`, 2026-08-15) và mục **số 1** của Known-Missing-Input Manifest.
- Bốn cột **1 · 2 · 5 · 8** (env vars · filesystem state · process state · OS behavior) **không có cơ chế phát hiện nào** ở `P0-B` ([Spec-Spike-Protocol §2.3](../../030-Specs/Spec-Spike-Protocol.md) cảnh báo 🔴). ⇒ Ở bốn cột này, `—` **không** có nghĩa là *"đã loại trừ"*, nó chỉ có nghĩa là *"không quan sát được"*. Hệ quả phải được ghi ở **`T7`**.
- Một scenario có thể chạm nhiều cột, nhưng cột **Nguyên nhân kết luận** chỉ được mang **một** nhãn — theo luật *khớp đầu tiên thắng* của [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md).

### 2.5 `T5` — Phân bố `SEC-008` và bảng mô phỏng các mức cắt

> **Vì sao bảng này bắt buộc**: mục **11.b** của threat model là `TBD` cuối cùng còn lại, và điều kiện đóng nó đòi **hai** thứ — *phân bố kích thước kết quả truy vấn* **và** *tỉ lệ replay thành công theo từng mức cắt*. Vế thứ hai **không đọc ra được từ phân bố**; nó đòi một thí nghiệm riêng ([MTP §4.3](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md)). Bảng này là nơi duy nhất cả hai vế cùng xuất hiện.

**`T5.a` — Phân bố `row_count` / `byte_size`** (cap **TẮT**, [MTP §4.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md)):

| Trục | `P50` | `P75` | `P90` | `P95` | `P99` | `max` | `N` (số query result) |
|---|---|---|---|---|---|---|---|
| **`row_count`** | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| **`byte_size`** | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |

**`T5.b` — Thí nghiệm cắt: tỉ lệ replay thành công theo từng mức**:

| Trục | Mức cắt | Giá trị suy ra từ `T5.a` | Số biến thể replay | `matched` | `diverged` | Nguyên nhân divergence |
|---|---|---|:--:|:--:|:--:|---|
| `row_count` | **control (không cắt)** | — | `<…>` | `<…>` | `<…>` | `<…>` |
| `row_count` | `P50` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `row_count` | `P75` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `row_count` | `P90` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `row_count` | `P95` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `row_count` | `P99` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | **control (không cắt)** | — | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | `P50` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | `P75` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | `P90` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | `P95` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |
| `byte_size` | `P99` | `<…>` | `<…>` | `<…>` | `<…>` | `<…>` |

**Ba ô khai báo bắt buộc kèm `T5`:**

| # | Khai báo | Giá trị |
|:--:|---|---|
| 1 | **Phân bố có suy biến không** (`P50 == P99`)? Nếu có, đã dùng 5 mức luỹ thừa 2 quanh median? | `<có/không — nếu có, liệt kê 5 mức đã dùng>` |
| 2 | **Điều kiện tiên quyết**: `U-25` đã cho thấy replay là **tất định** chưa? | `<có/không>` — ⛔ nếu **chưa**, `T5.b` phải được báo cáo là **không kết luận được**, **không** được báo cáo một con số |
| 3 | **`consumed_by_replay`** đã được log cho mọi query result chưa? | `<có/không>` — thiếu trường này thì mọi nhận định về cap chỉ là phỏng đoán trên tổng kích thước |

> ### ⚠️ Cảnh báo bắt buộc — chép NGUYÊN VĂN vào report, ngay dưới `T5`
>
> **Toàn bộ số liệu của `T5` đến từ dữ liệu SYNTHETIC** (`G2`). ⇒ Phân bố `row_count`/`byte_size` là **thuộc tính của generator dữ liệu test** — tức của 10 fixture do `B8` tự viết — **KHÔNG** phải thuộc tính của production.
>
> ⇒ `C5` chỉ có **hai** lựa chọn hợp lệ đối với `SEC-008` / mục `11.b`:
>
> **(a)** Đóng `11.b` với nhãn bắt buộc: `HYPOTHESIS — hiệu chỉnh trên synthetic, phải revalidate ở lần triển khai thật đầu tiên`
> **(b)** **Giữ nguyên `TBD`.**
>
> ⛔ **KHÔNG** có lựa chọn thứ ba là đóng `11.b` như một ngưỡng sản phẩm đã được validate.

> ⛔ **`T5` cấp PHÂN BỐ, không cấp NGƯỠNG.** Report **không** được đề xuất con số row cap / byte cap — xem §3, dòng cấm số 4.

### 2.6 `T6` — Đối chiếu §24

> **Vì sao bảng này bắt buộc, và vì sao nó chỉ có ba cột**: [RQ.md](../RQ.md) §24 tự nói *"These numbers should be treated as **initial hypotheses**, not final product commitments"*, và [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 1 biến câu đó thành hệ quả vận hành. Cột thứ tư mà ai cũng muốn thêm — *đạt / không đạt* — **chính là** phát biểu bị cấm ở §3 dòng 2. Bảng này cố ý không có chỗ cho nó.

| Hypothesis §24 | Số đo được + điều kiện đo | Phát biểu so sánh | Nhãn cứng |
|---|---|---|---|
| `≥ 80%` meaningful deterministic test cases reproduced<br>⇒ **dạng hiệu dụng: `≥ 6/7`** (xem cảnh báo bắt buộc dưới bảng) | 🔺 **`<chỉ số composite từ T2 dòng 7 = x/D>` — đây là con số đối chiếu CHÍNH** (chỉ số gate, [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6). Kèm **cả hai** con số §23 làm ngữ cảnh: `<RSR từ T2 dòng 1>` · `<EMR thô từ T2 dòng 2 + mẫu số thực tế>`. ⛔ **KHÔNG** được lấy một mình dòng 1 hoặc một mình dòng 2 — cả hai đều có lỗ rò | `<Số đo cho thấy <chỉ số composite = x/D> so với DẠNG HIỆU DỤNG của hypothesis §24 dòng 1 là ≥ 6/7>` — ⛔ dòng này **KHÔNG** được viết dưới dạng `80%`, xem cảnh báo độ mịn dưới bảng | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 5%` production latency overhead | `<giá trị từ T2 dòng 3a + N + error_rate + path + sampling>` | `<Số đo cho thấy <giá trị> so với hypothesis §24 là 5%>` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 10 MB` average capsule size | `<giá trị từ T2 dòng 4 (avg) + điểm đo P-persisted + N>` | `<Số đo cho thấy <giá trị> so với hypothesis §24 là 10 MB>` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 30 seconds` replay time | `<giá trị từ T2 dòng 5 + breakdown + capsule size cùng dòng>` | `<Số đo cho thấy <giá trị> so với hypothesis §24 là 30s>` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |

> **Nhãn cứng phải xuất hiện trên TỪNG DÒNG**, không gom thành một câu ghi chú dưới bảng. Lý do: các dòng của bảng này sẽ bị trích lẻ ra khỏi ngữ cảnh, và một dòng bị trích lẻ mà không mang nhãn sẽ được đọc như một tiêu chí nghiệm thu.
>
> ### ⚠️ Cảnh báo độ mịn — chép NGUYÊN VĂN vào report, ngay dưới `T6`
>
> **Với `D = 7`, một scenario = 14.3 điểm phần trăm.**
>
> Ở cỡ mẫu này, ngưỡng `≥ 80%` **mất gần hết ý nghĩa thống kê**: không có cách nào để tỷ lệ rơi vào khoảng `71.4% – 85.7%`, nên `80%` không phân biệt được điều gì mà `≥ 6/7` không phân biệt được. Nó thực chất là quy tắc **"được sai tối đa 1 trên 7"**.
>
> ⇒ **Mọi nơi trình bày — `C2`, `C4`, `Gate A`, `GATE-06` — PHẢI dùng dạng `≥ 6/7`, KHÔNG dùng dạng `80%`**, để không tạo **cảm giác chính xác giả**. Một con số hai chữ số thập phân trên mẫu số 7 gợi ý một độ phân giải mà phép đo không có.
>
> **`≥ 6/7` KHÔNG phải một ngưỡng mới**: nó là **dạng hiệu dụng của ngưỡng §24 dòng 1** (`80% × 7 = 5.6` ⇒ cần `≥ 6`), áp lên **chỉ số composite** — [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.4 và §4.6. Nếu `D` đóng băng ở `T1` ô 1 **khác** `7`, dạng hiệu dụng phải được tính lại theo §4.4 và **ghi lại nguyên văn** ở đây.
>
> ⛔ Cảnh báo này **không** biến `T6` thành bảng *đạt / không đạt* — nhãn cứng của từng dòng vẫn giữ nguyên, và dòng cấm số 2 ở §3.2 vẫn áp.

> **Ba metric `N-06`/`N-07`/`N-08` không có dòng ở `T6`** vì §24 không đặt hypothesis cho chúng. Chúng vẫn **bắt buộc in số** ở `T2` — chúng là đầu vào để `C5` đề xuất ngưỡng sau, không phải mục tuỳ chọn.

### 2.7 `T7` — Confidence & Limitations

> **Vì sao bảng này bắt buộc, và vì sao nó là NƠI DUY NHẤT**: verdict của §39 là **nhị phân** (§4). Mọi sự yếu của bằng chứng phải có một chỗ để đi — nếu không có chỗ, nó sẽ tìm đường vào ô verdict dưới dạng một nhánh thứ ba, hoặc tệ hơn, biến mất. `T7` là chỗ đó.
>
> `T7` **bắt buộc xuất hiện ở CẢ HAI nhánh** của §4.

| # | Giới hạn | Nội dung phải ghi | Neo |
|:--:|---|---|---|
| 1 | **`N` nhỏ** | `<N của từng metric>`. Với capsule size: `P95` ở `N ≈ 10` **gần bằng `max()`** ⇒ `C5` **không** được đóng `N-09` từ một `P95` giấu `N` | [MTP §2.5](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md), `ACG-11` |
| 2 | **Workload không giống production** | `<hình dạng traffic của load run: error_rate, số request, sampling = OFF, dữ liệu synthetic>`. Con số overhead là con số của **load run này**, không phải của production | [MTP §3.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md), `G2` |
| 3 | **Hệ quả của phương án `GAP-Redis` đã chọn** | Kết luận của spike **không nói gì** về lớp execution phụ thuộc `cache state` — lớp đó nằm **ngoài** Supported Execution Class theo thiết kế. `<Cái giá được định lượng bởi probe SC-11: …>` | `E-E` — [Spec-Spike-Protocol §2.7](../../030-Specs/Spec-Spike-Protocol.md); quyết định `G1` |
| 4 | 🔴 **Bốn nhóm hidden input KHÔNG có cơ chế phát hiện** | **`Environment variables` · `Filesystem state` · `Process state` · `OS behavior`** — chép **nguyên văn**: *"loại trừ bằng lời khai, không bằng phép kiểm"*. Hệ quả: nếu một scenario thực sự phụ thuộc một trong bốn nhóm này, spike có thể ghi `matched` **mà không ai phát hiện giả định đã bị vi phạm** | `E-A` — [Spec-Spike-Protocol §2.3](../../030-Specs/Spec-Spike-Protocol.md) cảnh báo 🔴, hệ quả bắt buộc số 2 |
| 5 | 🔴 **`W1` — rubric có `recall = 0` với rẽ nhánh thuần logic** | Hai nhánh code khác nhau, **cả hai không chạm dependency nào**, cùng kết cục ⇒ rubric kết luận `Execution matched` **trong khi execution thực sự đã khác**. Khác biệt này **không thu hẹp được** bằng cách hiện thực tốt hơn | `W1` — [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 6 | **`W2`–`W7`** — các điểm yếu còn lại của rubric | `<liệt kê đủ 6 dòng còn lại>`. Danh sách này thuộc về report **ngay từ `A3`** — viết từ đầu thì là *giới hạn đã công bố*; xuất hiện lần đầu ở `C4` thì là *phát hiện muộn* | [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 7 | **Khoảng hở đã đo được từ ma trận 12 test** | `<kết quả test T8 (child_process) và T12 (loopback) của ma trận §5.3 MTP>`. FAIL ⇒ ghi nhận là **khoảng hở đã đo được**, ⛔ **CẤM** làm nhẹ test, **CẤM** bỏ khỏi ma trận, **CẤM** ghi *"ngoài phạm vi V0.1"* rồi không in kết quả | [MTP §5.4](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) |
| 8 | **Tỷ lệ `unattributed`** | `<x/N>` — in ra như **một con số riêng**. Tỷ lệ cao là bằng chứng **rubric chưa đủ**, không phải bằng chứng code xấu | [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) |
| 9 | `<giới hạn khác phát sinh khi chạy>` | `<…>` | `<…>` |

> **Phát biểu trung thực nhất mà rubric hỗ trợ được** — chép nguyên văn vào `T7` khi có bất kỳ verdict `Execution matched` nào:
>
> > **"Không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục."**
>
> **KHÔNG** phải: ~~"Execution local giống execution production."~~

### 2.8 `T8` — Trả lời §39

> **Vì sao bảng này bắt buộc**: `GATE-06` cần **một ô trả lời**, không cần một đoạn văn. Exit criteria của `G06` là *"Quyết định **Có** hoặc **Không**, kèm lý do neo vào số đo"*.

| Ô | Nội dung |
|---|---|
| 🔺 **Chỉ số composite** — con số mà `GATE-06` được trả lời bằng | `<x/D = …>` — lấy từ **`T2` dòng 7**, mẫu số **cố định**, dạng **phân số**, ⛔ **KHÔNG** viết dưới dạng `%` |
| **Ngưỡng hiệu dụng để đối chiếu** | **`≥ 6/7`** — *dạng hiệu dụng* của ngưỡng §24 dòng 1 ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.4, §4.6), **KHÔNG** phải ngưỡng mới. Nếu `D` ở `T1` ô 1 khác `7` ⇒ tính lại theo §4.4 và ghi rõ |
| **Phát biểu so sánh** | `<Chỉ số composite đo được là <x/D>, so với ngưỡng hiệu dụng ≥ 6/7>` — là **so sánh có neo** (§3.1 dòng 3), **không** phải phán quyết *pass/fail* |
| **Hai con số §23 đi kèm** | `<RSR = …>` · `<EMR thô = … , mẫu số thực tế = …>` — bắt buộc có mặt, xem `T2` |
| ☐ **CÓ** | `<điền theo cấu trúc §4, cột CÓ>` |
| ☐ **KHÔNG** | `<điền theo cấu trúc §4, cột KHÔNG>` |

**Đúng một ô được đánh dấu** (`CÓ` hoặc `KHÔNG`). Cấu trúc bắt buộc của ô được đánh dấu nằm ở **§4** — và nó **giống hệt nhau** ở cả hai ô.

> **Vì sao bốn ô trên đứng TRƯỚC hai ô verdict**: exit criteria của `G06` đòi lý do **neo vào số đo**. Nếu `T8` chỉ có hai ô đánh dấu, cổng sẽ được trả lời bằng con số nào có sẵn trong đầu người điền — và hai con số có sẵn nhất là `RSR`/`EMR` thô, đúng **hai chỉ số mà [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6 chứng minh là có lỗ rò**. Ô chỉ số composite tồn tại để cổng được trả lời bằng chỉ số **fail-closed**.
>
> ⚠️ Bốn ô này **cấp số đo và phép so sánh**, **không** cấp phán quyết. Việc `<x/D>` có đủ để trả lời **CÓ** hay không là **quyết định của `@TrisJr` tại `GATE-06`** — xem cảnh báo ngay dưới.

> ⚠️ **`T8` là ô đề xuất của `C4`, không phải quyết định.** Quyết định thuộc `@TrisJr` tại `G06`, ghi ở `pm-runs/{run}/verdict.md`.

---

## 3. Phát biểu ĐƯỢC PHÉP vs CẤM

### 3.1 Được phép

| # | Phát biểu | Điều kiện đi kèm | Neo nguồn |
|:--:|---|---|---|
| 1 | *"**Execution đã capture không còn reproduce**"* | Bắt buộc kèm **ba** thứ: phạm vi **Supported Execution Class** · **rubric** dùng để phán · **denominator** | [RQ.md](../RQ.md) §20.16 — đây đúng khuôn được phép: `Captured execution no longer reproduces` |
| 2 | *"**`X/N` scenario đạt `Execution matched` theo rubric §3, trên denominator §4, điều kiện đo: …**"* | Không được lược bớt bất kỳ vế nào trong bốn vế: tử số/mẫu số · rubric · denominator · điều kiện đo | `T1` + `T2` + `T3`; [MTP §2.2](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) |
| 3 | *"**Số đo cho thấy `<giá trị>` so với hypothesis §24 là `<giá trị>`**"* | Là **so sánh**, không phải **phán quyết**. Kèm nhãn cứng của `T6` | [RQ.md](../RQ.md) §24 (*initial hypotheses*); [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 1 |
| 4 | *"**Chưa đủ dữ kiện để kết luận về `<mục>`**"* | **Luôn hợp lệ.** Tốt hơn một kết luận yếu. Đi vào `T7`, **không** đi vào ô verdict | [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5 `C5`: *"`TBD` chưa đủ dữ liệu thì **giữ nguyên `TBD`**"* |
| 5 | *"**Không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục**"* | Đây là phát biểu **mạnh nhất** mà một verdict `Execution matched` chống đỡ được | [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 6 | *"**`T8`/`T12` của ma trận §5.3 FAIL ⇒ khoảng hở đã đo được, có số, có ngày**"* | Ghi kèm lớp chặn kỳ vọng và lý do kiến trúc | [MTP §5.4](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) |

### 3.2 ⛔ CẤM

| # | Phát biểu bị cấm | Vì sao cấm | Neo nguồn |
|:--:|---|---|---|
| 1 | *"**Production bug đã được sửa**"* / *"đã hết"* / *"definitely fixed"* | Một replay thành công **chỉ** chứng minh *"this captured execution no longer fails"*. Nó **không** chứng minh mọi biểu hiện production của bug đã bị loại bỏ — race condition có thể vẫn còn | [RQ.md](../RQ.md) **§20.16** nêu **nguyên văn** khuôn cấm `✓ Production bug is definitely fixed`; risk **`R-07` — False confidence — 🔴 Critical**, [Risk-Register](../../010-Planning/Risk-Register.md), owner `@TrisJr` |
| 2 | *"**đạt §24**"* / *"**không đạt §24**"* / *"**pass**"* / *"**fail**"* — dựa trên 4 số §24 | Bốn con số đó là **initial hypotheses**, không phải tiêu chí nghiệm thu. Phán *pass/fail* trên chúng là biến hypothesis thành cam kết **bằng đường vòng** | [RQ.md](../RQ.md) §24 nguyên văn; [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 1 (*"Không dùng `N-01`…`N-04` làm acceptance criteria"*, `GATE-02`) |
| 3 | **Nâng bất kỳ hypothesis nào thành ĐỊNH NGHĨA SẢN PHẨM** (`ACG-01`/`ACG-02`/`ACG-03`/`ACG-07`, rubric, class, `U-13`, `U-16`…) | Việc nâng cấp là **task `D2` của `P1`**, driver 🕵️ BA, và nó chỉ mở sau `GATE-06 = Có`. Report làm việc đó là vượt quyền và bỏ qua một gate | [Spec-Spike-Protocol §1.3](../../030-Specs/Spec-Spike-Protocol.md) *quy tắc cấm nâng cấp*; [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §6 `D2` |
| 4 | **Đề xuất CON SỐ NGƯỠNG** cho `N-05` / `N-09` / `SEC-008` (row cap, byte cap) ngay trong report | Đóng ngưỡng là **`D1`** (`N-05`) và **`C5`** (`N-09`, `SEC-008`), chủ quyết định là **`@TrisJr`**. **Report cấp PHÂN BỐ, không cấp NGƯỠNG** | [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5 `C5` + §6 `D1`; [MTP §1.1](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) |
| 5 | 🔺 *"**Diverged vì non-determinism**"* **khi checklist known-missing-capture CHƯA được loại trừ** | Đây là phát biểu **vận hành hoá `R-07`**: nó gán một nguyên nhân *không đòi bằng chứng* cho một hiện tượng có nguyên nhân *đã biết trước và đã ghi thành văn bản*. Và nó **chính là chế độ hỏng mà `GAP-Redis` cảnh báo nguyên văn**: nếu manifest chưa niêm phong, mọi scenario fail sẽ bị quy về non-determinism trong khi nguyên nhân thật là **thiếu capture đã biết trước** — `GATE-06` khi đó được trả lời **sai bằng dữ liệu sai**, và **không phát hiện được từ chính báo cáo**. **Non-determinism là kết luận DUY NHẤT phải được chứng minh bằng thực nghiệm** (`K` lần cho **khác** verdict) | [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) — `incomplete-capture` được kiểm **TRƯỚC** `out-of-scope-determinism` theo chính thứ tự của thủ tục; [MTP §7.1](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) (bằng chứng bắt buộc của hai nhãn này: mục manifest + commit hash niêm phong · đủ `K` verdict); [MTP §6.1](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md); [Spec-Spike-Protocol §2.5](../../030-Specs/Spec-Spike-Protocol.md) (probe `SC-11`) |
| 6 | *"**Repro hoạt động**"* / *"**core loop đã được validate**"* — dạng **tổng quát, không kèm phạm vi** | Một phát biểu không có phạm vi sẽ được đọc với phạm vi **rộng nhất có thể**. Nó xoá sạch `T7` chỉ bằng một câu, và biến `W1` + bốn nhóm không có cơ chế phát hiện thành vô hình | [RQ.md](../RQ.md) §20.16; §33.5 *"Determinism over magic — explain exactly what was captured and replayed"*; `W1` [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 7 | Gộp thầm **`unattributed`** vào nhãn `code` | Một divergence không quy được nguyên nhân là **sự kiện có thông tin**: nó nói thủ tục chưa phủ hết không gian nguyên nhân. Gộp nó vào `code` biến khoảng trống của Repro thành lời buộc tội developer | [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) ⚠️ CAUTION |
| 8 | Làm nhẹ / bỏ / ghi *"ngoài phạm vi"* cho test `T8` hoặc `T12` của **ma trận §5.3 MTP** | Một khoảng hở **đã đo được, có số, có ngày** là **tài sản**. Một khoảng hở bị test làm nhẹ đi trở thành **cảm giác an toàn sai**, và nó sẽ được phát hiện ở production | [MTP §5.4](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) |

---

## 4. Hai nhánh §39 — cấu trúc ĐỐI XỨNG

> **[RQ.md](../RQ.md) §39 không cho phép hai lựa chọn *"bỏ"* hay *"cứ thế đi tiếp"*.** Nguyên văn: *"If the answer is **no**, **identify which classes of bugs cannot be replayed** and narrow the product scope accordingly."*
>
> ⇒ Nhánh **Không** **bắt buộc sinh ra danh sách lớp bug không replay được**, và template phải xuất đúng thứ mà `N1` cần ăn vào.

### 4.1 Bảng so sánh song song

Cả hai cột dùng **cùng một bộ khung, cùng thứ tự, cùng độ chi tiết**.

| Khung | Nhánh **CÓ** | Nhánh **KHÔNG** |
|---|---|---|
| **1. Phát biểu kết luận** | `<Trên denominator <D> và Supported Execution Class <phiên bản>, <X/N> execution đã capture không còn reproduce theo rubric §3 — điều kiện đo: …>` | `<Trên denominator <D> và Supported Execution Class <phiên bản>, KHÔNG capture đủ thông tin để replay tất định lớp bug <mô tả> — điều kiện đo: …>` |
| **2. Bảng bằng chứng** | **`T2` + `T3` — GIỐNG HỆT nhánh kia**, không rút gọn, không đổi cột | **`T2` + `T3` — GIỐNG HỆT nhánh kia**, không rút gọn, không đổi cột |
| **3. Bảng lớp bug** | Lớp bug **ĐÃ replay được** — xem `4.2` | Lớp bug **KHÔNG replay được** + nguyên nhân từ `T4` — xem `4.3` |
| **4. Đầu ra cho phase sau** | ⇒ **`D1`** (chốt ngưỡng `N-05` từ dữ liệu đo) · **`D2`** (nâng `ACG-01/02/03/07` thành định nghĩa sản phẩm) | ⇒ **`N1`** (thu hẹp Supported Execution Class xuống đúng lớp đã chứng minh replay được) · **`N2`** (cập nhật Roadmap / PRD / Charter theo phạm vi mới) · **`N3`** (đề xuất **một** trong ba: re-scope rồi chạy lại spike thu hẹp · chuyển hướng sản phẩm · dừng) |
| **5. Confidence & Limitations** | **`T7` — BẮT BUỘC**, đầy đủ 9 dòng | **`T7` — BẮT BUỘC**, đầy đủ 9 dòng |

### 4.2 Bảng lớp bug — nhánh **CÓ**

| Lớp bug | Điều kiện class thoả (`S1`–`S7`) | Scenario làm bằng chứng | Verdict trên `K` lần | Giới hạn của bằng chứng |
|---|---|---|---|---|
| `<tên lớp>` | `<S1…S7 nào được chứng minh, cái nào chỉ là lời khai>` | `<danh sách scenario>` | `<matched × K?>` | `<neo tới dòng T7 tương ứng>` |

### 4.3 Bảng lớp bug — nhánh **KHÔNG**

> **Bảng này là đầu vào trực tiếp của `N1`.** Exit criteria của `N1`: *"Class mới có **bằng chứng thực nghiệm** cho **từng** điều kiện"* — nên mỗi dòng dưới đây phải trỏ tới một scenario cụ thể, không được là mô tả chung.

| Lớp bug **không replay được** | Điều kiện class bị vi phạm (`S1`–`S7`) hoặc trục loại trừ (§2.3 / §2.4) | Scenario làm bằng chứng | Nguyên nhân — lấy từ **`T4`** | Đề xuất thu hẹp cho `N1` |
|---|---|---|---|---|
| `<tên lớp>` | `<điều kiện / trục>` | `<danh sách scenario + số lần>` | `<cột nào của T4 được đánh dấu>` | `<phát biểu thu hẹp class — KHÔNG phải quyết định, N1 sở hữu>` |

> Nhánh **Không** cũng phải trả lời điều kiện dừng cứng của [RQ.md](../RQ.md) §24: *"If the spike cannot achieve a useful replay rate on a meaningful class of bugs, the product concept should be **reconsidered before building the full platform**."* ⇒ ô này dẫn thẳng vào `N3`.

### 4.4 ⚠️ Verdict giữ NHỊ PHÂN

> **KHÔNG có verdict thứ ba kiểu *"không kết luận được"*.**
>
> **Bằng chứng yếu đi vào ô Confidence (`T7`), KHÔNG đi vào ô verdict.**
>
> **Vì sao ràng buộc này cứng đến vậy**: thêm một nhánh thứ ba là **cách êm ái nhất để không ai phải quyết gì**. Nó cho phép báo cáo trông đầy đủ, gate trông đã họp, và quyết định thì không tồn tại — trong khi `P0-B` + `P0-C` đã tiêu hết ngân sách để mua đúng một quyết định.
>
> **Neo kỹ thuật**: `inconclusive` **là một CỔNG đứng TRƯỚC rubric, không phải verdict thứ ba** ([Spec-Spike-Protocol §3.5](../../030-Specs/Spec-Spike-Protocol.md)) — nó lọc execution ra khỏi denominator ở tầng lớp, **trước** khi rubric chạy. Ở tầng rubric, verdict là **nhị phân tuyệt đối**. Cùng nguyên tắc áp cho §39: mọi sự không chắc chắn đã có chỗ của nó (`T1` cho phạm vi, `T7` cho độ tin cậy), nên ô verdict **không cần** và **không được** có chỗ chứa thêm.
>
> **Neo quản trị**: exit criteria của `G06` — *"Quyết định **Có** hoặc **Không**, kèm lý do neo vào số đo — **không** neo vào cảm nhận"* ([Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5).

---

## 5. Related Documents

| Tài liệu | Đường dẫn | Quan hệ với template này |
|---|---|---|
| **MTP — Spike Phase 0** | [MTP-Spike-Phase-0](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) | **Nguồn của `T2` (6 metric + điều kiện đo; `B7-12` bắt `B7` xuất chỉ số composite), `T5` (`SEC-008`), `T7` (`K`, `N`, canary), và CÁCH THU BẰNG CHỨNG cho từng nhãn quy trách nhiệm dùng ở `T3`/`T4` (§7.1 — thứ tự và tập nhãn thuộc Spec §3.6).** Cũng là nơi định nghĩa Known-Missing-Input Manifest mà `T1` ô 6 trích con dấu |
| **Spike Protocol — Phase 0** | [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | §2 — Supported Execution Class (`T1` ô 3, `T4`, `T7` dòng 3–4, §4.2/§4.3) · §3 — rubric, verdict nhị phân, `W1`–`W7` (`T3`, `T6`, `T7` dòng 5–6, §4.4) · §4 — denominator (`T1` ô 1) |
| **Timeline & WBS** | [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) | §5 — `C1`–`C6`, `G06` và exit criteria của `C4` · §5.1 — `N1`–`N4` (nhánh **Không**) · §6 — `D1`, `D2` (nhánh **Có**) |
| **NFR — Repro** | [NFR-Repro](../../020-Requirements/NFR-Repro.md) | Mục 1 — bốn ngưỡng §24 là *initial hypotheses*, nền của `T6` và của dòng cấm số 2 · mục 3 — `N-05`…`N-09` không ngưỡng · mục 7 — `ACG-01`…`ACG-11` |
| **Nguồn sự thật** | [RQ.md](../RQ.md) | §20.1 (9 hidden input → `T4`) · §20.16 (false confidence → §3) · §22 (10 scenario × 7 bước) · §23 (5 metric) · §24 (4 ngưỡng → `T6`) · §39 (câu hỏi của `GATE-06` → `T8`, §4) |

---

*Template này là khuôn cho một báo cáo cấp SỐ ĐO và PHÂN BỐ. Ngưỡng và quyết định thuộc về `@TrisJr` tại `GATE-06`.*
