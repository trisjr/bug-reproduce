---
id: MTP-SPIKE-P0
type: test-plan
status: approved
project: repro
owner: "@TrisJr"
created: 2026-08-15
updated: 2026-08-15
---

> [!IMPORTANT]
> ✅ **`Gate A` DUYỆT — `@TrisJr`, 2026-08-15.** Measurement plan này đã **đóng băng**; `B3`, `B7` và `C1` phải xây theo đúng yêu cầu ở §8. Bản ghi quyết định: [`pm-runs/2026-08-15-p0a-spike-protocol/verdict.md`](../../010-Planning/pm-runs/2026-08-15-p0a-spike-protocol/verdict.md).
>
> ⚠️ Tài liệu này định nghĩa **cách đo**, **không** định nghĩa ngưỡng đạt — `approved` không đổi điều đó. Ngoại lệ ngưỡng duy nhất vẫn là `escaped_side_effects = 0` (§2.7), có ghi xuất xứ.

# 🧪 MTP — Spike Phase 0 (Measurement Plan)

**Covers:** [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md)

> **Độc giả đích**: ⚙️ DevOps xây harness `B7` · 🧑‍💻 Engineer xây recorder `B3` và replay runtime `B5` · 🧪 QA chạy `C1`–`C2`.
>
> Người đọc phải trả lời được đúng một câu: **"tôi phải đo cái gì, bằng công cụ nào, từ mốc nào tới mốc nào, trên population nào, đơn vị gì — và điều kiện đo nào phải ghi kèm mỗi con số?"**

## Quy ước nhãn dùng trong tài liệu này

| Nhãn | Nghĩa |
|---|---|
| `[stated]` | Chép từ nguồn (`RQ.md`, `NFR-Repro`, threat model, ADR, Timeline) — có neo trích dẫn |
| `[inferred]` | **Suy luận của QA**, không có trong nguồn nào. Mọi dòng `[inferred]` đều là ứng viên bị phản bác |
| `CHỐT` | Quyết định do **chính tài liệu này** sở hữu và đóng |
| `TIÊU THỤ` | Giá trị tài liệu này **dùng** nhưng **không sở hữu** — chủ sở hữu ghi ở cột bên cạnh |

> ⚠️ **Xung đột tên `L1`/`L2` — đọc kỹ trước khi vào §5.**
> [Spec-Spike-Protocol §1.4](../../030-Specs/Spec-Spike-Protocol.md) dùng `L1`/`L2`/`L3` cho **ba luật chống gian lận thống kê**. [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Decision #3 dùng `L1`/`L2` cho **hai lớp chặn write**.
> Trong tài liệu này: **`L1`/`L2` luôn có nghĩa là lớp chặn của `ADR-005`**. Ba luật chống gian lận được gọi tên đầy đủ — *"luật Đóng băng"*, *"luật Bánh cóc"*, *"luật Hai mẫu số"*.

---

## 1. Phạm vi

### 1.1 Tài liệu này định nghĩa CÁCH ĐO, không định nghĩa NGƯỠNG ĐẠT

Đây là ranh giới quan trọng nhất của tài liệu và nó được phát biểu trước mọi thứ khác.

| Tài liệu này **CÓ** làm | Tài liệu này **KHÔNG** làm |
|---|---|
| Chốt công cụ đo, mốc bắt đầu→kết thúc, population, đơn vị cho **6 metric** | Chốt *bao nhiêu là đạt* cho bất kỳ metric nào |
| Chốt **điều kiện đo** phải ghi kèm mỗi con số (bịt `ACG-04`/`ACG-05`/`ACG-11`) | Chọn percentile nào là *"percentile chính thức"* — **chọn percentile chính là đặt ngưỡng** |
| Chốt **cách thu thập bằng chứng** cho từng nhãn của thủ tục quy trách nhiệm (§7.1) | Định nghĩa **thứ tự** hay **tập nhãn** của thủ tục quy trách nhiệm — chủ sở hữu **DUY NHẤT** là §3.6 của Spike Protocol. Cũng không phán xử một scenario cụ thể là pass hay fail — đó là rubric §3 |
| Chốt giá trị `K` của `U-25` và **số mức cắt** của thí nghiệm `SEC-008` | Chốt row cap / byte cap của `SEC-008` — đó là việc của `C5`, **sau** khi có dữ liệu |

**Neo**: `RQ.md` §24 chỉ có **4** ngưỡng và chính nó ghi *"These numbers should be treated as **initial hypotheses**, not final product commitments"* `[stated §24]`. [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 3 liệt kê `N-05`…`N-09` là **`TBD` không ngưỡng**. Một tài liệu đo mà tự đặt ngưỡng sẽ biến hypothesis thành cam kết bằng đường vòng.

> **Ngoại lệ duy nhất**: `escaped_side_effects = 0` — xem §2.7 để biết con số này suy ra từ đâu.

### 1.2 Ba tham số tài liệu này TIÊU THỤ chứ không SỞ HỮU

Ba giá trị dưới đây quyết định ý nghĩa của mọi con số trong tài liệu này, nhưng **chủ sở hữu nằm ở nơi khác**. Nếu chủ sở hữu đổi giá trị, tài liệu này **không** cần sửa — chỉ cần đọc lại với giá trị mới.

| # | Tham số | Chủ sở hữu | Giá trị tại thời điểm viết | Tài liệu này dùng nó để làm gì |
|:--:|---|---|---|---|
| 1 | **Numerator của Execution Match Rate** — thế nào là *"equivalent execution"* | **rubric §3** của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-01`, task `A3`) | Đang được `A3` viết | Đếm tử số của `N-05`. Tài liệu này **không** định nghĩa `matched` |
| 2 | **Denominator** — tập scenario được tính | **§4** của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-02`+`ACG-03`, task `A4`) | `D = 7` theo quyết định **`G3`** của `@TrisJr` — xem [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §15 Ghi chú lịch sử | Nhân với `K` để ra population của `N-05` (§2.3) |
| 3 | **Quyết định `GAP-Redis`** | **§2** của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-07`, task `A2`) | ✅ **Đã chốt = phương án (c)** + phần định nghĩa của (a), quyết định **`G1`** của `@TrisJr` — Redis vẫn tồn tại trong test app nhưng **không ảnh hưởng kết cục** | Là **mục đầu tiên** của Known-Missing-Input Manifest (§6) |

> **Vì sao phải viết ranh giới này ra**: nếu tài liệu đo tự định nghĩa lại tử số hoặc mẫu số, dự án sẽ có **hai** định nghĩa cho cùng một tỷ lệ và không ai biết `C4` in ra cái nào. Ranh giới này cũng là lý do tài liệu này **không** bị chặn bởi việc `A3`/`A4` chưa xong.

### 1.3 Ràng buộc thứ tự mà tài liệu này chịu trách nhiệm một nửa

[Spec-Spike-Protocol §1.5](../../030-Specs/Spec-Spike-Protocol.md) cấm `C1` khởi động trước khi **(i)** quyết định `GAP-Redis` thành văn bản **và (ii)** **Known-Missing-Input Manifest đã niêm phong**. Vế **(ii)** được **định nghĩa vận hành tại §6 của tài liệu này** — bao gồm cả cơ chế niêm phong kiểm chứng được.

---

## 2. Sáu metric × bốn thuộc tính

Năm metric đầu là `RQ.md` §23 `[stated]`. Metric thứ sáu là **bổ sung**, xem §2.7.

Mọi metric ghi ra ở dạng **máy đọc được (JSON hoặc CSV)** bởi harness `B7` (`src/spike/bench/`) — *"chạy một lệnh ra được đủ 6 metric"* `[stated Timeline B7]`.

### 2.1 Bảng tổng hợp

| # | Metric | Công cụ đo | Mốc bắt đầu → kết thúc | Population | Đơn vị |
|:--:|---|---|---|---|---|
| 1 | **Replay Success Rate** (`N-01`) | harness `B7`, đọc verdict của `B6` | bước 1 của quy trình 7 bước §22 → hoàn tất **bước 7** (*Verify execution*) với verdict *"reproduced"* | `D` scenario trong denominator (§4 Spike Protocol). In kèm số trên **cả 10** scenario như một con số **diagnostic** — **không** phải luật Hai mẫu số (`L3` thuộc [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.7, nói về `D` **đóng băng tại `Gate A`** vs **mẫu số đã co**, không phải cặp `7`/`10`) | tỷ lệ `%` (kèm phân số thô `x/D`) |
| 2 | **Execution Match Rate** (`N-05`) | harness `B7`, đọc verdict rubric §3 Spike Protocol | một **lần replay** bắt đầu → verdict của lần replay đó | **`Total replays` = `D × K`** — xem §2.3. Diagnostic: `10 × K` | tỷ lệ `%` (kèm phân số thô) |
| 3a | **Capture Overhead — Latency** (`N-02`) | harness `B7`, đồng hồ ở **tầng ứng dụng**, tại **endpoint** | nhận request tại endpoint → gửi xong response | **100% traffic** của load run. Đo **hai path riêng** (§3.2) | `ms`, báo cáo **phân bố** avg/P50/P95/P99; delta so baseline tính bằng `%` |
| 3b | **Capture Overhead — CPU** (`N-06`) | sampler mức process, chu kỳ lấy mẫu cố định `[inferred]` | toàn bộ cửa sổ load run | 100% traffic | `%` CPU (và `CPU-seconds` tuyệt đối) |
| 3c | **Capture Overhead — Memory** (`N-07`) | sampler mức process, cùng chu kỳ `[inferred]` | toàn bộ cửa sổ load run | 100% traffic | `MB` RSS — báo cáo **avg và peak** |
| 3d | **Capture Overhead — Network** (`N-08`) | bộ đếm byte tại biên process `[inferred]` | toàn bộ cửa sổ load run | 100% traffic | `bytes` gửi/nhận; và `bytes` upload capsule tách riêng |
| 4 | **Capsule Size** (`N-03` avg / `N-09` P95) | harness `B7`, `stat` trên **artifact đã persist** | — (đo trạng thái, không đo thời gian) | mọi capsule sinh ra bởi `C1` | `bytes`. Bắt buộc in **avg** VÀ **P95** VÀ **`N`** — xem §2.5 |
| 5 | **Replay Time** (`N-04`) | harness `B7` | **bắt đầu lệnh `repro replay`** → khi verification verdict được phát ra | mọi lần replay (`D × K`, diagnostic `10 × K`) | `s`. Bắt buộc kèm breakdown `t_boot`/`t_replay_exec`/`t_verify` — xem §3.3 |
| 6 | **`escaped_side_effects`** | 🔺 **canary log** (§5.2) — **không bao giờ** là log của replay runtime | từ khi hoàn tất *Destroy original environment* → hết lần replay cuối cùng của scenario đó | mọi kết nối đến canary trong `10 × K` lần replay **cộng** ma trận 12 test `T1`–`T12` | **count** số connection attempt. **Target = `0`** — xem §2.7 |

### 2.2 Execution Match Rate — mẫu số là `Total replays`, KHÔNG phải total test case

Đây là chỗ hai chỉ số của §23 hay bị trộn lẫn, và trộn lẫn ở đây làm hỏng đúng chỉ số thành công chính của V0.1.

`RQ.md` §23 định nghĩa **hai** phân số khác nhau `[stated §23]`:

```text
Replay Success Rate  =  Successfully reproduced  /  Total test cases
Execution Match Rate =  Equivalent executions    /  Total replays
```

⇒ **`N-05` có mẫu số là số lần replay, không phải số scenario.** [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 3.1 xác nhận `N-05` là *"chỉ số thành công chính của V0.1"* kể từ `M1` — nên nhầm mẫu số ở đây là nhầm ở chỗ đắt nhất.

Cộng thêm **`U-25`** ([SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) §8.2, `CHỐT GATE-01`): mỗi capsule phải được replay **nhiều lần** trên cùng code, cùng capsule. Suy ra:

```text
Population của N-05  =  (số capsule trong denominator)  ×  K
                     =  D × K
```

`D` **TIÊU THỤ** từ §4 Spike Protocol (hiện `D = 7` theo quyết định `G3`). `K` **CHỐT** ngay dưới đây.

### 2.3 `CHỐT` — `K = 3`

> **`K = 3`.** Mỗi capsule được replay **đúng 3 lần**, trên cùng code, cùng capsule, cùng máy. Áp **đồng đều cho cả 10 scenario**, không chỉ cho `D` scenario trong denominator.

**Vì sao tài liệu này phải chốt `K`**: [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5 `C1` ghi thẳng *"Mỗi capsule replay `K` lần (`U-25`, `K` chốt ở `A5`)"* `[stated]`. Ba thứ phụ thuộc trực tiếp: population của `N-05` (§2.2), denominator mà `A4` phải tính (§1.2), và bước `out-of-scope-determinism` của thủ tục quy trách nhiệm ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §3.6 — bằng chứng thu theo §7.1 của tài liệu này).

**Lý do chọn `3`, không phải `2`:**

| # | Lý do |
|:--:|---|
| 1 | **`2` là sàn, không phải lựa chọn.** `findings/quality-assurance.md` đặt sàn ở *"≥2 lần"*; sàn không tự nó là quyết định |
| 2 | **Năng lực phát hiện.** Với xác suất một lần replay lệch là `p`, xác suất `K` lần **không** đồng nhất là `1 − pᴷ − (1−p)ᴷ`. Ví dụ `p = 0.1`: `K=2` → `0.18`; `K=3` → `0.27` — tăng ~50% năng lực phát hiện non-determinism với chi phí gần như bằng không `[inferred]` |
| 3 | **Chi phí thật là phút, không phải ngày.** Với hypothesis `< 30s` replay time (`N-04`, §24), `10 × 3 = 30` lần replay ≈ **15 phút máy**, so với `3.0 MD` của `C1`. Không có lý do ngân sách nào để chọn `2` |
| 4 | **`K` đồng đều giữ trọng số mỗi capsule bằng nhau** trong population của `N-05`. `K` thay đổi theo scenario sẽ làm capsule được replay nhiều lần hơn có trọng số lớn hơn trong tỷ lệ — một dạng bias không ai khai `[inferred]` |

**Quy tắc kèm theo — `CHỐT`:**

1. **Cả `K` lần replay đều vào population của `N-05`**, không lấy *"lần đầu"* hay *"lần đại diện"*. Đây là ý nghĩa nguyên văn của `Total replays` `[stated §23]`.
2. **`K` lần cho khác verdict ⇒ đây là tín hiệu quan sát được của nhãn `out-of-scope-determinism`** ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §3.6; cách thu bằng chứng ở §7.1). Việc *scenario đó rốt cuộc được tính là pass hay fail* thuộc **rubric §3** của Spike Protocol — tài liệu này không phán xử (§1.2 hàng 1).
3. `K` được **đóng băng tại `Gate A`** cùng tập scenario, theo luật Đóng băng của [Spec-Spike-Protocol §1.4](../../030-Specs/Spec-Spike-Protocol.md).

### 2.4 Capture Overhead — bốn chiều, không phải một

`RQ.md` §20.7 liệt kê **bốn** thứ instrumentation làm tăng: latency, CPU, memory, network `[stated §20.7]`. §23 đòi đo cả bốn `[stated §23]`. §24 chỉ đặt ngưỡng cho **một** (latency) — [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 3.2 gọi đúng chỗ hở này.

⇒ Cả bốn đều được đo và báo cáo. **Ba chiều không có ngưỡng (`N-06`/`N-07`/`N-08`) vẫn phải in số** — chúng là dữ liệu đầu vào để `C5` đề xuất ngưỡng sau, không phải mục tuỳ chọn.

### 2.5 Capsule Size — ⚠️ cảnh báo bắt buộc về P95

> ### ⚠️ Với `N ≈ 10` capsule, **P95 gần bằng `max()`**
>
> Với 10 mẫu, phân vị thứ 95 rơi vào giữa mẫu thứ 9 và thứ 10 — nghĩa là **P95 thực chất đang báo cáo giá trị lớn nhất**, không phải một phân vị theo nghĩa thống kê. Một capsule bất thường duy nhất kéo P95 lên bằng chính nó.
>
> ⇒ **LUẬT BẮT BUỘC: mọi chỗ in P95 đều phải in `N` ngay cạnh.** Định dạng bắt buộc: `P95 = <giá trị> (N = <số capsule>)`.
>
> ⇒ **`C5` không được đóng `N-09` (ngưỡng P95 capsule size) từ một P95 có `N` nhỏ mà không khai `N` đó trong chính câu kết luận.** [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 3.3 đang giữ `N-09` ở `TBD`; đóng nó bằng một P95 giấu `N` là thay một `TBD` trung thực bằng một con số sai.

Cùng nguyên tắc áp cho **mọi** P95/P99 khác trong tài liệu này, kể cả P95/P99 của latency ở §3.1 — ở đó `N` lớn hơn nhiều (số request của load run) nên cảnh báo nhẹ hơn, nhưng luật in `N` **không** có ngoại lệ.

### 2.6 Replay Time — luôn đi cặp với capsule size

`CHỐT`: **kích thước capsule phải được ghi CÙNG DÒNG với replay time của chính capsule đó.**

Lý do `[stated]`: [NFR-Repro](../../020-Requirements/NFR-Repro.md) `ACG-05` ghi *"tính trên capsule kích thước nào (liên quan `N-03`/`N-09`)"* là một trong ba chỗ hở của `N-04`. Một bảng replay time không có cột size không trả lời được câu hỏi *"30 giây đó là của capsule 1 MB hay 50 MB"* — và đó chính là quan hệ mà `C5` cần để nói bất cứ điều gì về row/byte cap.

### 2.7 `escaped_side_effects` — metric thứ 6, target `0`

**Đây là ngoại lệ duy nhất với luật "không bịa ngưỡng" của tài liệu này, và nó phải chứng minh được xuất xứ.**

| Câu hỏi | Trả lời |
|---|---|
| **Vì sao có metric này** | [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Consequences/Negative ghi thẳng: *"**Không có metric nào đo an toàn.** §23 đo Replay Success Rate, Execution Match Rate, Capture Overhead, Capsule Size, Replay Time — **không có** chỉ số nào kiểu 'số side effect đã thoát ra'"*, và kết: risk Critical §20.4 hiện **không có bằng chứng chấp nhận nào được định nghĩa** `[stated ADR-005]`. Không có metric này thì `GATE-06` trả lời câu hỏi §39 mà **không nói được gì** về một risk 🔴 Critical |
| **Con số `0` suy ra từ đâu** | Hai nguồn độc lập, cả hai `[stated]`:<br>**(a)** `RQ.md` §13 mở đầu bằng câu tuyệt đối *"Replaying production **must never** accidentally repeat dangerous side effects"* — *"never"* dịch sang metric **chỉ có một giá trị**, là `0`.<br>**(b)** [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Open items, dòng *"Bằng chứng chấp nhận cho risk Critical này"*, phương án đề xuất: *"Thêm một kiểm chứng dạng **phủ định** vào spike: **không có gì rời process** trong toàn bộ 10 kịch bản, đo bằng `L2`"*. Một kiểm chứng phủ định có đúng một ngưỡng |
| **Vì sao đây KHÔNG phải ngưỡng bịa** | Bốn ngưỡng §24 là **đánh đổi định lượng** — `80%`, `5%`, `10 MB`, `30s` đều có thể là `75%` hay `85%` và không ai chứng minh được. `escaped_side_effects` không phải đánh đổi: nó là **phát biểu nhị phân** *"đã có hay chưa có một side effect thật rời máy"*. Không tồn tại phiên bản *"5% side effect thoát ra là chấp nhận được"* |
| **Đo bằng gì** | **Canary log** (§5.2), thu **độc lập** với replay runtime. Xem §5.1 để biết vì sao đây là điều kiện sống-chết của metric này |
| **Đọc kết quả thế nào** | `escaped_side_effects > 0` ⇒ `ADR-005` chưa được thoả bởi hiện thực `B5`. Điều này **không** tự động làm `GATE-06` = No — nó là một input riêng, tách khỏi 5 metric fidelity |

---

## 3. Điều kiện đo — bịt `ACG-04`, `ACG-05`, `ACG-11`

Ba `ACG` này là ba chỗ hở của [NFR-Repro](../../020-Requirements/NFR-Repro.md) mục 7. Mỗi mục dưới đây chốt **điều kiện đo**, không chốt ngưỡng.

### 3.1 `ACG-04` — bốn chỗ hở của *"< 5% production latency overhead"*

`[stated NFR-Repro ACG-04]`: *"không nói percentile, không nói baseline so với cái gì, không nói đo ở tầng nào, không nói áp cho bao nhiêu phần trăm traffic"*.

| Chỗ hở | `CHỐT` của tài liệu này |
|---|---|
| **Percentile** | **Báo cáo PHÂN BỐ, không chọn một percentile.** Bắt buộc in `avg` · `P50` · `P95` · `P99` cho **cả baseline (recorder OFF) lẫn ON**, kèm `N`. ⚠️ Plan này **cố ý KHÔNG** chọn percentile nào là *"đạt"* — **chọn percentile chính là đặt ngưỡng**, và đó là việc của `@TrisJr` tại `GATE-06`, sau khi nhìn phân bố thật |
| **Baseline** | Baseline = **recorder TẮT HOÀN TOÀN** (không load SDK, không init — không phải *"bật nhưng no-op"*). Chạy **XEN KẼ `A/B/A/B`** (OFF/ON/OFF/ON), **không** chạy baseline một lần rồi tái sử dụng `[stated Timeline B7]`. Lý do: drift nhiệt độ máy, cache OS, JIT warm-up làm baseline chạy một lần trở thành so sánh giữa hai thời điểm khác nhau chứ không phải giữa hai cấu hình `[inferred]` |
| **Tầng đo** | **Endpoint, tầng ứng dụng.** Không đo ở tầng load balancer, không đo ở tầng cluster. Lý do: `RQ.md` §20.7 nói về *instrumentation* trong process `[stated]`; đo ngoài process trộn thêm nhiễu mạng mà recorder không gây ra |
| **Tỷ lệ traffic** | **100%.** Xem §3.2 — đây không phải lựa chọn, nó là hệ quả bắt buộc của nghịch lý capture trigger |

### 3.2 🔺 Nghịch lý capture trigger — vì sao ngân sách áp lên 100% traffic

**Đây là một mục riêng, không phải một footnote.** Nó quyết định load run được thiết kế thế nào, và một load run thiết kế sai sẽ cho ra một con số overhead **không phải con số mà ngân sách nói tới**.

**Mâu thuẫn `[stated]`:**

- `FR-012` / `RQ.md` §20.7 nêu mitigation *"capture only failed/high-value executions"* `[stated §20.7]`.
- Nhưng một execution **chỉ được biết là failed SAU KHI nó kết thúc**. [SDD-Repro §3.3](../../030-Specs/Architecture/SDD-Repro.md) gọi đây là `U-09` và ghi thẳng: recorder **buộc phải buffer mọi execution** rồi huỷ record khi execution thành công `[stated SDD §3.3 U-09]`.

**Ba hệ quả bắt buộc lên thiết kế đo:**

**(1) Ngân sách overhead áp lên 100% traffic.** [SDD-Repro §3.3](../../030-Specs/Architecture/SDD-Repro.md): *"Con số `< 5%` ở §24 được đặt như thể chỉ áp cho execution được capture — thực tế nó phải áp cho **mọi** execution vì mọi execution đều bị quan sát và buffer"* `[stated]`.

**(2) Đường tốn kém nhất VỀ SỐ LƯỢNG là buffer-rồi-huỷ, không phải đường persist.** Đường persist đắt hơn **trên mỗi execution**; đường buffer-rồi-huỷ rẻ hơn trên mỗi execution nhưng chạy trên **gần 100%** số request. Trong production, tổng chi phí nghiêng hẳn về đường thứ hai `[inferred]`.

⇒ **`CHỐT` — đo HAI PATH RIÊNG, báo cáo riêng, không gộp trung bình:**

| Path | Nội dung pipeline | Áp cho | Ghi vào báo cáo |
|---|---|---|---|
| **P-discard** — request **thành công** | buffer → (biết là success) → **discard** | ~đa số traffic | avg/P50/P95/P99 riêng, kèm `N` |
| **P-persist** — request **lỗi** | buffer → redact → serialize → compress → encrypt → upload | thiểu số traffic | avg/P50/P95/P99 riêng, kèm `N` |

**(3) Load run phải dùng traffic ĐA SỐ THÀNH CÔNG — và tỷ lệ lỗi là điều kiện đo bắt buộc.**

Lý do là một cái bẫy cụ thể `[stated Timeline B7 + findings/quality-assurance.md]`: **10 scenario của §22 đều là execution lỗi** `[stated §22]`. Nếu load run đo overhead cũng chạy 100% request lỗi, nó chỉ đo **đường persist** — và con số thu được **không phải** con số mà ngân sách `< 5%` nói tới, vì production đa số request **thành công** và đi đường buffer-rồi-huỷ.

> ### `CHỐT` — hai luật của load run
>
> **(a)** Load run dùng traffic **đa số thành công**, giống hình dạng production.
> **(b)** **Tỷ lệ lỗi của load run là một ĐIỀU KIỆN ĐO BẮT BUỘC**, ghi kèm **mọi** con số overhead. Một con số overhead không có tỷ lệ lỗi đi kèm là **không diễn giải được** và `C2` phải từ chối nó.
>
> Định dạng bắt buộc: `latency P95 = <giá trị> ms (N = <số request>, error_rate = <x>%, sampling = OFF)`.

**Sampling `FR-015` — `CHỐT`: TẮT trong toàn bộ spike.** Trạng thái này ghi vào điều kiện đo của mọi con số `[stated Timeline B7]`. Lý do: sampling bật làm overhead đo được là hàm của tỷ lệ sampling chứ không phải của recorder; và [SDD-Repro §3.3](../../030-Specs/Architecture/SDD-Repro.md) `U-09` điểm 2 chỉ ra sampling giảm overhead bằng cách **giảm xác suất bắt được đúng execution lỗi** — thứ spike tồn tại để bắt.

### 3.3 `ACG-05` — ba chỗ hở của *"< 30 seconds replay time"*

`[stated NFR-Repro ACG-05]`: *"không rõ có tính `repro pull`, có tính thời gian boot ứng dụng local không, và tính trên capsule kích thước nào"*.

| Chỗ hở | `CHỐT` của tài liệu này | Lý do |
|---|---|---|
| **`repro pull`** | **NGOÀI** cửa sổ `N-04` — **nhưng VẪN ĐO RIÊNG** và in thành cột riêng | `RQ.md` §8 tách `pull` thành **Step 2**, `replay` là **Step 3** `[stated §8]` ⇒ mốc *"from `repro replay`"* của §23 không bao gồm pull. Nhưng pull phụ thuộc băng thông và capsule size — bỏ hẳn là mất một biến mà `C5` cần |
| **Boot ứng dụng local** | **TRONG** cửa sổ `N-04`, và **bắt buộc tách breakdown** | Từ góc nhìn developer, thời gian chờ bắt đầu từ lúc gõ lệnh `[inferred]`. Nhưng gộp mà không tách sẽ làm mọi con số `N-04` bị chi phối bởi thời gian boot của test app — một đại lượng không nói gì về Repro |
| **Population capsule** | **Ghi capsule size CÙNG DÒNG** với replay time của chính capsule đó (§2.6) | `ACG-05` nêu thẳng liên hệ với `N-03`/`N-09` `[stated]` |

**Breakdown bắt buộc — ba thành phần, in đủ ba:**

```text
t_boot        : bắt đầu boot ứng dụng local  →  ứng dụng sẵn sàng nhận replay
t_replay_exec : bắt đầu thực thi replay      →  execution kết thúc
t_verify      : bắt đầu verification         →  verdict được phát ra
────────────────────────────────────────────────────────────────────────────
N-04 = t_boot + t_replay_exec + t_verify        (đo riêng, không suy ra từ tổng)
t_pull        : đo riêng, KHÔNG cộng vào N-04
```

### 3.4 `ACG-11` — điểm đo capsule size trong pipeline

`[stated NFR-Repro ACG-11]`: *"không nói trước hay sau compression, không nói trước hay sau redaction, không nói population nào"*.

Pipeline theo [SDD-Repro §3.3–§3.5](../../030-Specs/Architecture/SDD-Repro.md): `capture buffer` → **redaction** (§3.4) → `capsule writer`: serialize → **compress** / dedup / content hashing → **encrypt** → upload (§3.5).

> ### `CHỐT` — điểm đo chính thức của `N-03`/`N-09`
>
> **Điểm đo chính thức = kích thước ARTIFACT ĐÃ PERSIST** — tức **sau redact, sau compress, sau encrypt**, đúng byte nằm trên Capsule Store.
>
> **Lý do** `[stated NFR-Repro ACG-11]`: *"đó là thứ thật sự chiếm storage và đi qua mạng"*. Đây cũng là con số duy nhất mà `SEC-022` (TTL/retention) và chi phí lưu trữ nói tới.

**Thêm một điểm đo diagnostic — `P-serialized`:**

| Điểm đo | Là gì | Dùng để làm gì | Có phải `N-03`/`N-09` không |
|---|---|---|---|
| **`P-persisted`** | Sau redact + compress + encrypt | **Chính thức** — `N-03` (avg) và `N-09` (P95) | ✅ **Có** |
| **`P-serialized`** | Sau redact, **trước** compress và encrypt | **Diagnostic** — tính **tỉ lệ nén** `= P-serialized / P-persisted` | ❌ **Không**. Không được dùng thay `N-03` ở bất kỳ đâu |

**Vì sao cần `P-serialized`**: nếu chỉ có `P-persisted`, không ai biết một capsule lớn là vì **dữ liệu nhiều** hay vì **nén kém**. Hai nguyên nhân dẫn tới hai hành động khác nhau ở `C5` (siết row/byte cap vs đổi thuật toán nén) `[inferred]`. Ngoài ra tỉ lệ nén là **đầu vào trực tiếp** của `SEC-030` (giới hạn tỉ lệ nén để chặn decompression bomb) — không đo ở spike thì `SEC-030` cũng không có số `[stated threat model SEC-030]`.

**Population** `CHỐT`: **mọi capsule sinh ra bởi `C1`**, kể cả capsule của scenario nằm ngoài denominator. Kích thước capsule không phụ thuộc scenario đó có được tính vào `≥80%` hay không `[inferred]`.

---

## 4. Thu dữ liệu cho `SEC-008` (row cap / byte cap)

> ### ⛔ Mục này có ràng buộc **"mất là mất"**. Đọc hết trước khi cấu hình `B3`.

[Spec-Security-Repro-Threat-Model](../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) mục **11.b** là **`TBD` cuối cùng còn lại** trong ba mục `TBD` của threat model, và nó ghi rõ điều kiện đóng: *"Số liệu đo được từ **technical spike §22** — cụ thể là **phân bố kích thước kết quả truy vấn** và **tỉ lệ replay thành công theo từng mức cắt**"* `[stated 11.b]`.

**Hai vế. Vế 2 là vế hay bị bỏ quên** — xem §4.3.

### 4.1 Vế 1 — thu phân bố: recorder phải log cho MỌI DB query result

`CHỐT` — recorder `B3` ghi, cho **MỌI** DB query result (không phải chỉ result lớn, không phải chỉ result được persist):

| Trường | Kiểu | Vì sao cần |
|---|---|---|
| `row_count` | integer | Trục thứ nhất của cap. Không có nó thì không có phân bố để đặt row cap |
| `byte_size` | integer (bytes) | Trục thứ hai. Row cap và byte cap là **hai** ngưỡng độc lập `[stated SEC-008]` |
| `query_id` | string ổn định | Để nối một result với đúng lời gọi khi replay, và để so khớp giữa run record và run replay |
| `scenario_id` / `capsule_id` | string | Để quy phân bố về scenario — không có nó thì phân bố là một đống số không quy trách nhiệm được |
| **`consumed_by_replay`** | **bool** | 🔺 **Trường quan trọng nhất và dễ bị bỏ nhất.** Nó tách *"dữ liệu đã capture"* khỏi *"dữ liệu replay **thật sự đọc tới**"*. Một cap cắt vào phần **không bao giờ được đọc** thì miễn phí; cắt vào phần **được đọc** thì làm hỏng replay. Không có trường này, mọi đề xuất cap chỉ là phỏng đoán trên tổng kích thước |

### 4.2 ⛔ Spike chạy với cap **TẮT** — và vì sao không có đường lùi

> **`CHỐT`: `C1` chạy với row cap và byte cap TẮT** (hoặc đặt ở mức thực tế vô hạn — lớn hơn mọi result có thể sinh ra bởi test app).

**Vì sao đây là ràng buộc "mất là mất":**

1. Cap bật ⇒ mọi result vượt cap bị **cắt TRƯỚC KHI được đo**.
2. ⇒ Phân bố thu được bị **kiểm duyệt (censored)** ở **đúng cái đuôi** mà `SEC-008` cần nhìn — vì cả bài toán cap chính là bài toán về cái đuôi.
3. ⇒ **Không khôi phục được hậu kỳ.** Không có phép thống kê nào dựng lại được giá trị đã bị cắt bỏ trước khi ghi.
4. ⇒ Và tới lúc phát hiện thì **môi trường gốc đã bị destroy** theo bước 4 của quy trình §22 `[stated §22]` — không sinh lại được result cũ.
5. ⇒ **Phải chạy lại TOÀN BỘ `C1`** (3.0 MD), tiêu vào tuần đệm `W7`.

**Va chạm với AC hiện tại của `SEC-008` — và cách nó được gỡ:**

AC hiện tại `[stated threat model SEC-008]`: *"**Given** ngưỡng chưa được cấu hình, **then** áp giá trị mặc định bảo thủ do implementation quy định, **không** coi là 'không giới hạn'"*.

⇒ Spike cần một **miễn trừ tường minh**. Miễn trừ đó **đã được cấp**, và lý do an toàn của nó phải được ghi ra chứ không được giả định:

> ### 🔑 Miễn trừ chỉ chấp nhận được VÌ dữ liệu spike là **synthetic**
>
> Quyết định **`G2`** của `@TrisJr` (2026-08-15): `OQ-2` = **dữ liệu SYNTHETIC, không ngoại lệ** — xem [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §15 Ghi chú lịch sử.
>
> **Capture không-cap chỉ chấp nhận được vì dữ liệu là synthetic. Với dữ liệu thật, không-cap là điều CẤM** — vì khi đó không-cap chính là chuỗi hành vi mà `THREAT-005` mô tả.
>
> ⇒ Miễn trừ này **không** phải tiền lệ cho V0.1. Nó **hết hiệu lực** ngay khi có bất kỳ dữ liệu không-synthetic nào chạm vào recorder.

**Kiểm chứng trước khi `C1` chạy** `[inferred]` — `B9` (đã đổi vai từ *quyết định* sang *xác minh* theo `G2`) phải xác nhận: test app seed bằng dữ liệu giả, external HTTP API là **stub tự chạy**, không có dump của hệ thống thật nào trong `src/spike/`.

### 4.3 Vế 2 — **thí nghiệm cắt** (thứ `11.b` đòi và hay bị bỏ quên)

`11.b` đòi **hai** thứ. Vế 1 (§4.1) cho *phân bố*. Vế 2 đòi **"tỉ lệ replay thành công theo từng mức cắt"** `[stated 11.b]` — và cái đó **không** đọc ra được từ phân bố. Nó đòi một thí nghiệm.

**Thiết kế — `CHỐT`:**

```text
capsule ĐÃ LƯU (không cap, từ C1)
        ↓
sinh biến thể ĐÃ CẮT — OFFLINE, từ capsule đã lưu, không chạm môi trường gốc
        ↓
replay lại TỪNG biến thể
        ↓
đo matched / diverged  +  NGUYÊN NHÂN divergence (theo §7)
```

**Vì sao bắt buộc phải cắt OFFLINE, không phải cắt lúc record**: nếu `B3`/`B4` cắt tại lúc record thì tới khi cần thí nghiệm, **môi trường đã destroy**, **đuôi phân bố mất vĩnh viễn**, thí nghiệm **không chạy lại được** — và `SEC-008` vẫn `TBD` sau khi tiêu hết `P0-B` + `P0-C` `[stated findings/security-auditor.md]`.

> ### `CHỐT` — số mức cắt: **5 mức mỗi trục + 1 control**, chốt TRƯỚC khi chạy

| Hạng mục | Giá trị `CHỐT` |
|---|---|
| **Số trục** | **2** — row cap và byte cap, biến thiên **độc lập** (không lưới chéo). Lý do: `SEC-008` định nghĩa hai ngưỡng độc lập `[stated]`; lưới chéo `5×5` nhân số biến thể lên 25 mà không thêm thông tin về từng trục |
| **Số mức mỗi trục** | **5** |
| **Mức được định nghĩa thế nào** | Bằng **phân vị của chính phân bố đo được ở §4.1**: `P50` · `P75` · `P90` · `P95` · `P99` |
| **Control** | **+1 biến thể không cắt** mỗi trục — chính là capsule gốc, dùng làm mốc so sánh |
| **Tập capsule** | `D` capsule **trong denominator**. Lý do: capsule ngoài class diverge vì lý do không liên quan tới cắt ⇒ chúng là **nhiễu**, không phải tín hiệu `[inferred]` |
| **Số lần replay mỗi biến thể** | **1** — xem điều kiện tiên quyết ngay dưới |
| **Tổng số replay** | `D × (5 + 5) = D × 10` (với `D = 7` ⇒ **70 lần replay**) |

**Vì sao dùng phân vị chứ không dùng con số tuyệt đối** — đây là điểm then chốt để thí nghiệm này **không vi phạm luật "không bịa ngưỡng"**:

- Cái được **chốt trước khi chạy** là **số mức** (5) và **quy tắc suy ra mức** (P50/P75/P90/P95/P99). Cả hai đóng băng trong tài liệu này.
- **Giá trị** của từng mức được suy ra **cơ học** từ dữ liệu §4.1 — người chạy thí nghiệm **không có tự do hậu kỳ** nào để dịch chuyển mức cho ra kết quả đẹp hơn.
- Nếu chốt con số tuyệt đối (ví dụ *"1000 rows"*), tài liệu này đang **bịa một ngưỡng** — đúng thứ nó cấm ở §1.1.

**Điều kiện tiên quyết bắt buộc** `[inferred]`: thí nghiệm cắt chỉ diễn giải được **nếu `U-25` đã cho thấy replay là tất định**. Nếu `K` lần replay trên capsule gốc đã cho khác verdict, thì `diverged` của một biến thể cắt **không** quy được cho việc cắt — và thí nghiệm này phải được báo cáo là **không kết luận được**, không phải báo cáo một con số.

**Fallback nếu phân bố suy biến** `[inferred]`: nếu `P50 == P99` (mọi result gần như cùng kích thước — hoàn toàn có thể xảy ra với 10 fixture tự viết), phân vị không tách được 5 mức. Khi đó dùng 5 mức theo **luỹ thừa 2 quanh median**: `median/8`, `median/4`, `median/2`, `median`, `median×2` — và **khai tường minh trong báo cáo** rằng phân bố suy biến, vì điều đó tự nó là một phát hiện về generator.

**Cửa sổ thực hiện** `CHỐT`: **sau khi `C1` hoàn tất, trước khi `C5` được phép đóng `SEC-008`**.

### 4.4 ⚠️ Cảnh báo hợp lệ cho `C5` — số liệu này đến từ dữ liệu synthetic

Đây là cảnh báo **bắt buộc chép nguyên văn** vào bất kỳ chỗ nào `C5` dùng số liệu §4:

> **Toàn bộ số liệu của §4 đến từ dữ liệu SYNTHETIC** (`G2`). ⇒ Phân bố `row_count`/`byte_size` là **thuộc tính của generator dữ liệu test** — tức của 10 fixture do `B8` tự viết — **KHÔNG** phải thuộc tính của production.
>
> ⇒ `C5` chỉ có **hai** lựa chọn hợp lệ đối với `SEC-008` / mục `11.b`:
>
> **(a)** Đóng `11.b` với nhãn bắt buộc:
> `HYPOTHESIS — hiệu chỉnh trên synthetic, phải revalidate ở lần triển khai thật đầu tiên`
>
> **(b)** **Giữ nguyên `TBD`.**
>
> ⛔ **KHÔNG** có lựa chọn thứ ba là đóng `11.b` như một ngưỡng sản phẩm đã được validate. [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5 `C5` đã ghi cùng nguyên tắc: *"`TBD` chưa đủ dữ liệu thì **giữ nguyên `TBD`**"* `[stated]`.
>
> Lý do đây là cảnh báo **hợp lệ** chứ không phải sự thận trọng thừa: threat model `11.b` §*Hệ quả nếu chọn sai* ghi *"Đặt bừa một con số rồi để nó thành mặc định vĩnh viễn là cách phổ biến nhất để một ngưỡng sai tồn tại nhiều năm"* `[stated]`. Một con số hiệu chỉnh trên generator giả, dán nhãn *"đã đo"*, chính là con số đó.

---

## 5. Ma trận 12 test `THREAT-018` + canary sink

### 5.1 🔺 Bẫy phương pháp — `ECONNREFUSED` làm mọi bằng chứng an toàn VÔ NGHĨA

> **Đây là mục đầu tiên của §5 vì nếu không xử nó trước, 12 test dưới đây đều cho kết quả "pass" mà không chứng minh được gì.**

Quy trình §22 bắt buộc bước 4: **Destroy original environment** `[stated §22]`. Sau bước đó:

```text
Một WRITE BỊ RÒ RỈ  →  gửi ra host cũ  →  host không còn  →  ECONNREFUSED
Một WRITE BỊ CHẶN   →  L1/L2 từ chối    →  không gửi gì    →  ECONNREFUSED (hoặc lỗi tương đương)
                                                              ▲
                                        HAI TRƯỜNG HỢP TRÔNG GIỐNG HỆT NHAU
```

⇒ **Mọi bằng chứng an toàn của `C1` là vô nghĩa nếu không có quan sát viên độc lập.** Đây là lỗ hổng **phương pháp**, không phải lỗ hổng code — nó không sửa được bằng cách viết `B5` cẩn thận hơn.

### 5.2 Control bắt buộc — **canary sink**

`CHỐT` — sau bước destroy, **trỏ DNS/host cũ về một canary listener** ghi lại **MỌI** kết nối đến:

| Thành phần canary | Ghi lại cái gì |
|---|---|
| **TCP accept log** | Mọi kết nối TCP chạm tới — kể cả kết nối bị đóng ngay, kể cả không gửi byte nào |
| **HTTP endpoint** | Method · path · query string · header · body của mọi HTTP request |
| **DB giả có bảng audit append-only** | Mọi câu lệnh nhận được, ghi thêm-only để không thể bị xoá dấu vết |

**Ba việc canary làm mà không cách nào khác làm được** `[stated findings/security-auditor.md]`:

1. Phân biệt *"có mưu toan egress"* với *"không có mưu toan"* — chính là thứ `ECONNREFUSED` che mất.
2. **Đo** được khoảng hở `child_process` (`T8`) thay vì chỉ suy đoán nó tồn tại.
3. Dùng lại chính stub API đã có của `B2` ⇒ **chi phí thêm ≈ 0**.

> ### 🔺 `CHỐT` — NGUỒN SỰ THẬT của kết quả 12 test là **CANARY LOG**
>
> **KHÔNG** phải log của chính replay runtime. Dùng log của replay runtime để chứng minh replay runtime đã chặn thành công là **xác minh vòng tròn**: nếu một đường đi lọt qua L1/L2 mà runtime không biết, thì runtime cũng không log nó — đúng những trường hợp nguy hiểm nhất là những trường hợp runtime mù.
>
> Canary log được thu **độc lập** và **đối chiếu sau MỖI scenario** `[stated Timeline C1]`.

**Yêu cầu phủ địa chỉ** `[inferred]`: canary phải lắng nghe **cả trên loopback**, không chỉ trên địa chỉ ngoài. Lý do ở `T12` — allowlist của `L2` **bao gồm** loopback, nên một đích resolve về loopback đi qua `L2` hợp lệ; nếu canary không lắng nghe loopback thì `T12` **mù** và sẽ báo pass sai.

### 5.3 Ma trận 12 test `T1`–`T12`

**Pass criterion toàn ma trận: `escaped_side_effects = 0`, đo bằng canary log.**

Cột *lớp chặn* dùng `L1`/`L2` theo nghĩa của [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Decision #3 — xem cảnh báo tên gọi ở đầu tài liệu.

| # | Test | Lớp chặn kỳ vọng | Test này chứng minh điều gì |
|:--:|---|:--:|---|
| **T1** | `INSERT` / `UPDATE` / `DELETE` trực tiếp | `L1` | Baseline — denylist verb của §13 hoạt động. ⚠️ Đây **chính là** test mà exit criteria cũ của `B5` chấp nhận, và **một mình nó không đủ** `[stated Timeline B5]` |
| **T2** | `WITH x AS (UPDATE ...) SELECT ...` | `L1` | Câu lệnh **bắt đầu bằng `WITH`** ⇒ mọi phép so khớp verb ở đầu chuỗi đọc nhầm thành read. Chứng minh L1 phân loại theo **cấu trúc câu lệnh**, không theo prefix `[stated THREAT-018]` |
| **T3** | `SELECT charge_customer(...)` | `L1` | Verb là `SELECT`, tác dụng là **tính phí**. Chứng minh L1 từ chối mọi `SELECT` **có lời gọi function** — phương án đề xuất của `U-12` trong [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Open items `[stated]` |
| **T4** | `CALL proc(...)` | `L1` | Verb **không nằm trong cả hai danh sách** của §13 ⇒ chứng minh hành vi **default-deny** thật sự (fail-closed), không phải denylist đội lốt `[stated ADR-005 §Decision #2]` |
| **T5** | Multi-statement — một read + một write trong cùng chuỗi | `L1` | Chứng minh phân loại áp cho **từng statement**, không cho statement đầu tiên |
| **T6** | `GET /v1/send?to=...` | `L1` | HTTP verb thuộc nhóm READ của §13, ngữ nghĩa là **gửi**. Chứng minh phát biểu `R3`: *"cái chứng minh READ trong replay **không phải verb**, mà là **khớp với một entry READ đã ghi trong capsule**"* — đây là phát biểu **duy nhất** làm test này không lọt `[stated findings/security-auditor.md]` |
| **T7** | `net.Socket` thô, không qua HTTP client đã instrument | `L2` | Chứng minh tồn tại lưới an toàn cho đường **L1 không nhìn thấy** `[stated THREAT-018]` |
| **T8** | **`child_process` gọi `curl`** | `L2` (tầng OS) | ⚠️ **Xem cảnh báo §5.4** — request **rời hẳn process**, không sink nào trong process thấy |
| **T9** | SDK của nhà cung cấp dùng **transport riêng** | `L2` | Request rời máy mà không chạm HTTP client tiêu chuẩn — đường thứ ba mà L1 mù `[stated THREAT-018]` |
| **T10** | READ **không có** recorded entry trong capsule | `L1` + `SEC-034` | Chứng minh trả lỗi **`MISSING_RECORDING`** và **KHÔNG fall through ra hệ thống thật**. *"Thiếu dữ liệu là lỗi replay, không phải lý do để đi ra ngoài"* `[stated SEC-034]` |
| **T11** | Capsule chứa field **host trỏ tới canary** | `SEC-035` | Chứng minh giá trị host/URL/path/module trong capsule **chỉ** được dùng làm **khoá tra cứu**, không bao giờ dùng để **mở kết nối**. Đây là hướng tấn công ngược: capsule điều khiển replay runtime đi đâu `[stated SEC-035]` |
| **T12** | Đích **resolve về loopback** | ⚠️ **Chỉ `L1` + `SEC-035`** | ⚠️ **Xem cảnh báo §5.4** — allowlist của `L2` **bao gồm loopback** ⇒ `L2` **không** chặn được test này. Đây là residual risk (b) của `THREAT-018`: *"đường loopback bị lạm dụng nếu máy developer có dịch vụ thật lắng nghe ở localhost"* `[stated]` |

### 5.4 ⚠️ Hai ô "khoảng hở đã đo được" — CẤM làm nhẹ test

> ### `T8` SẼ FAIL nếu `L2` được hiện thực ở tầng runtime
>
> [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) §Open items ghi thẳng: *"V0.1: tầng runtime, đủ để phủ `net.Socket` và HTTP client; **tầng OS phủ được cả `child_process`** nhưng đắt hơn nhiều"* `[stated]`. `L2` ở tầng runtime **vá module mạng trong process** — một `child_process` gọi `curl` **rời hẳn process** và không module nào trong process nhìn thấy nó.
>
> ⇒ **Nếu `T8` FAIL: ghi nhận là KHOẢNG HỞ ĐÃ ĐO ĐƯỢC.**
>
> ⛔ **CẤM tuyệt đối** ba hành vi sau:
> - Sửa `T8` cho nó dễ pass hơn (đổi `curl` sang thứ khác, bỏ bước gọi thật).
> - Bỏ `T8` khỏi ma trận.
> - Ghi `T8` là *"ngoài phạm vi V0.1"* rồi không in kết quả.
>
> **Vì sao**: một khoảng hở **đã đo được, có số, có ngày** là tài sản — nó cho `@TrisJr` quyết định *"L2 tầng OS hay chấp nhận residual"* bằng dữ liệu. Một khoảng hở bị test làm nhẹ đi trở thành **cảm giác an toàn sai**, và nó sẽ được phát hiện ở production `[inferred]`.

**`T12` là ô thứ hai cùng loại.** `L2` không chặn loopback theo thiết kế (allowlist gồm **loopback + replay proxy** `[stated ADR-005 §Decision #3]`) ⇒ `T12` đo residual risk (b) của `THREAT-018`, không đo lỗi hiện thực. Áp cùng ba lệnh cấm ở trên. Và nhắc lại yêu cầu §5.2: **canary phải lắng nghe trên loopback**, nếu không `T12` mù và báo pass sai.

---

## 6. Known-Missing-Input Manifest

### 6.1 Manifest là gì và vì sao nó tồn tại

**Manifest = danh sách mọi input mà ta ĐÃ BIẾT TRƯỚC là không được capture, lập cho TỪNG scenario, NIÊM PHONG TRƯỚC KHI `C1` chạy.**

**Vì sao phải niêm phong trước** `[stated Spec-Spike-Protocol §1.5]`: nếu `C1` chạy khi manifest chưa niêm phong, `C3` sẽ quy mọi scenario fail về *"non-determinism"* trong khi nguyên nhân thật là **thiếu capture đã biết trước**. `GATE-06` khi đó được trả lời **sai bằng dữ liệu sai**, và **không có cách nào phát hiện điều đó từ chính báo cáo** — vì phần thiếu không được ghi ở đâu cả.

> Manifest tồn tại để biến *"đã biết trước là thiếu"* thành **bằng chứng có ngày tháng**, chứ không phải một câu giải thích viết sau khi nhìn kết quả.

### 6.2 `CHỐT` — nội dung bắt buộc của mỗi manifest

Một file manifest cho **mỗi** scenario (10 file). Mỗi mục trong manifest:

| Trường | Nội dung |
|---|---|
| `input` | Tên input không được capture |
| `nhóm` | Đối chiếu với 9 hidden input của `RQ.md` §20.1 và 8 nhóm capture của §18 |
| `vì sao không capture` | Quyết định nào loại nó (ví dụ `G1` với Redis) |
| `dự đoán ảnh hưởng` | Có/không ảnh hưởng kết cục của scenario này — **ghi TRƯỚC khi chạy** |

**Các mục bắt buộc có trong MỌI manifest** — danh sách sàn, không phải danh sách đủ:

| # | Input | Neo |
|:--:|---|---|
| **1** | **Redis / cache state** — đứng đầu danh sách | Quyết định **`G1`**: `GAP-Redis` = phương án (c). Test app vẫn có Redis nhưng **Redis không ảnh hưởng kết cục**; `ACG-07` (ii-b) ghi *"execution phụ thuộc cache state nằm ngoài class"*. `B3` **cấm thêm hook Redis** (`R1`) `[stated Timeline B3]` |
| **2** | **Filesystem state** — file mà execution đọc, sự tồn tại/nội dung của chúng | §18 không liệt kê filesystem trong 8 nhóm capture `[stated §18]` |
| **3** | **Environment variable** | §18 có *"runtime metadata"* nhưng không nói rõ phủ env var `[inferred]` — nếu `A2` xác nhận có phủ thì mục này được gỡ khỏi manifest, và việc gỡ đó phải ghi ngày |
| **4** | **Process state** — module-level cache, memoization, độ ấm của connection pool | [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §3 ghi *"process state là **cùng lớp vấn đề** với `GAP-Redis`, chỉ khác là nằm **trong** process"* `[stated]` |

### 6.3 `CHỐT` — cơ chế niêm phong (định nghĩa vận hành của §1.5(ii))

[Spec-Spike-Protocol §1.5](../../030-Specs/Spec-Spike-Protocol.md) trỏ về tài liệu này làm nơi **định nghĩa** manifest, và điều kiện tiên quyết của `C1` phụ thuộc vào việc *"đã niêm phong"* có kiểm chứng được hay không. Nếu *"niêm phong"* không có cơ chế, điều kiện (ii) **không kiểm được**.

> **Niêm phong = commit vào git TRƯỚC khi `C1` chạy dòng đầu tiên.**
>
> | Bước | Nội dung |
> |:--:|---|
> | 1 | 10 file manifest được viết đầy đủ theo §6.2 |
> | 2 | Commit vào git. **Commit hash + ngày commit = con dấu niêm phong** |
> | 3 | Hash và ngày được chép vào bảng `T1` (bảng khai báo trước khi chạy) của Spike Report |
> | 4 | ⛔ Mọi thay đổi manifest **sau** con dấu = một **phiên bản mới**, và nó **mở lại điều kiện tiên quyết của `C1`** — tức `C1` phải chạy lại từ scenario bị ảnh hưởng |
>
> Lý do bước 4 khắt khe `[inferred]`: một manifest sửa được sau khi nhìn kết quả **không còn là bằng chứng** — nó trở thành lời giải thích hậu kỳ, đúng thứ manifest sinh ra để chặn.

---

## 7. Thủ tục quy trách nhiệm divergence

### 7.1 Bảng vận hành — **cách thu bằng chứng**, KHÔNG định nghĩa thứ tự

> ### 🔺 Chủ sở hữu DUY NHẤT của thủ tục là [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §3.6
>
> Thủ tục *"khớp đầu tiên thắng"* — **thứ tự các bước**, **tập nhãn nguyên nhân** (gồm cả `unattributed`), và nguyên tắc *quy lỗi cho Repro trước khi quy lỗi cho developer* — thuộc **§3.6**, neo vào [ADR-011](../../030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md) `D3`.
>
> ⛔ **Tài liệu này KHÔNG có thứ tự riêng và KHÔNG có tập nhãn riêng.** Một thủ tục hai bản với hai thứ tự khác nhau cho **cùng một sự kiện** (`verdict = diverged`) là chỗ hỏng nguy hiểm nhất: mỗi người chạy sẽ đọc bản gần tay mình, và nhãn thu được **không so sánh được với nhau**.
>
> Phần tài liệu này đóng góp — và là phần §3.6 **không** chứa — là **bằng chứng lấy ở đâu, đọc bằng gì** cho từng nhãn. Không có cột đó, thủ tục §3.6 đúng về logic nhưng **không chạy tay được**.

Khi một lần replay cho verdict `diverged`: chạy thủ tục **theo đúng thứ tự của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §3.6**, và với mỗi bước, lấy bằng chứng theo dòng tương ứng dưới đây. Bảng này **tra cứu theo NHÃN**, không theo số thứ tự bước — số thứ tự thuộc §3.6 và có thể đổi ở đó.

| Nhãn của §3.6 | Bằng chứng đọc ở ĐÂU | Đọc bằng gì / dạng nào | Ghi kèm bắt buộc khi nhãn này được chọn |
|---|---|---|---|
| **`redaction`** | **Redaction record** của chính capsule đó | Trường máy đọc được trong capsule format v1 (`B3-8`, §8.1) — *"không có thông tin này, Execution Diff **không thể** phân biệt 'diverged vì code' với 'diverged vì redaction'"* `[stated SDD §3.4 U-15]` | Tên field tại **điểm phân kỳ đầu tiên** + mục tương ứng trong redaction record |
| **`incomplete-capture`** | **Known-Missing-Input Manifest** (§6) của scenario đó | File manifest đã **niêm phong** — đọc theo **commit hash + ngày commit** ghi ở `T1` ô 6 (§6.3) | **Tên mục trong manifest** + **commit hash niêm phong**. ❌ Không có hai thứ này thì nhãn chưa được chứng minh |
| **`truncated` / cap cắt dữ liệu** *(bước §3.6 hấp thụ từ tài liệu này)* | Cờ **`truncated: true`** tại điểm phân kỳ, trong capsule | Trường máy đọc được (`B3-8`, §8.1) | Với `C1` (cap **TẮT** theo §4.2) nhãn này chỉ xuất hiện trong **thí nghiệm cắt §4.3** — ở đó nó là **kết quả mong đợi**, không phải lỗi `[stated SEC-008]`. Ghi kèm **trục** (row/byte) và **mức cắt** |
| **`version-drift`** | **Cờ drift** trong capsule (Git commit · runtime · dependency · schema version) | Trường máy đọc được của capsule; hành vi của cờ do §3.9 Spike Protocol quy định | Cờ nào bật + giá trị hai bên (capsule vs local) |
| **`out-of-scope-determinism`** | So sánh verdict của **`K` lần replay** trên **cùng capsule, cùng code, cùng máy** (§2.3) | Bảng verdict per-scenario của harness `B7` — đủ **cả `K` dòng**, không lấy *"lần đại diện"* | 🔺 Đây là nhãn **DUY NHẤT được chứng minh bằng thực nghiệm**: nó biểu hiện là **không lặp lại được chính nó**. Ghi **đủ `K` verdict**. ❌ **CẤM** chọn nhãn này khi `K` lần cho **cùng** verdict |
| **`code`** | Phân xử theo **rubric §3** của [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | — | Tài liệu này **không** phân xử nhãn này (§1.1) |
| **`unattributed`** | — (không bước nào ở trên khớp) | — | Phải hiện ra **như chính nó** và được in thành **tỷ lệ riêng** ở `T7` — ⛔ **CẤM gộp thầm vào `code`** `[stated Spec §3.6 CAUTION]` |

### 7.2 Điều kiện để bảng này chạy được

`[inferred]` — hai điều kiện, nếu thiếu thì bảng không dùng được và phải báo trước, không phải phát hiện lúc `C3`:

1. **Rubric §3 phải xuất ra "điểm phân kỳ ĐẦU TIÊN"**, không chỉ xuất ra verdict nhị phân. Ba nhãn `redaction` · `incomplete-capture` · `truncated` đều lấy điểm phân kỳ đầu tiên làm khoá tra cứu. Nếu rubric chỉ nói *"matched / diverged"* thì ba nhãn đó **không thu được bằng chứng**.
2. **Capsule phải mang được redaction record và cờ `truncated`** ở dạng máy đọc được, nếu không nhãn `redaction` và `truncated` trở thành phán đoán bằng mắt.

---

## 8. Yêu cầu tài liệu này SINH RA cho `B3`, `B7`, `C1`

Tài liệu này thuộc `P0-A` và **chỉ viết ra yêu cầu đo**; việc hiện thực nằm ở `P0-B`/`P0-C`. Nhưng nếu ba mục dưới đây không được liệt kê tường minh, `B3`/`B7` sẽ được **xây thiếu** và điều đó chỉ lộ ra ở `C1` — quá muộn để sửa mà không chạy lại.

Ba bảng dưới đây khớp với các dòng *"Bổ sung sau `A5`"* trong [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §4–§5.

### 8.1 Yêu cầu đối với `B3` — Recorder tối thiểu

| # | Yêu cầu | Neo | Không có thì hỏng gì |
|:--:|---|---|---|
| B3-1 | Log **`row_count`** cho MỌI DB query result | §4.1 | `SEC-008` không có phân bố trục row |
| B3-2 | Log **`byte_size`** cho MỌI DB query result | §4.1 | `SEC-008` không có phân bố trục byte |
| B3-3 | Log **`query_id`** ổn định | §4.1 | Không nối được result với lời gọi lúc replay |
| B3-4 | Log **`scenario_id`** / **`capsule_id`** | §4.1 | Phân bố không quy trách nhiệm được về scenario |
| B3-5 | Log **`consumed_by_replay: bool`** | §4.1 | Không tách được *"đã capture"* khỏi *"replay thật sự đọc tới"* ⇒ mọi đề xuất cap là phỏng đoán |
| B3-6 | ⛔ Chạy ở chế độ **KHÔNG CAP** | §4.2 | Phân bố bị **censored** ở đúng cái đuôi cần nhìn, **không khôi phục được**, phải chạy lại toàn bộ `C1` |
| B3-7 | **KHÔNG cắt tại lúc record** — cắt phải làm **offline** từ capsule đã lưu | §4.3 | Môi trường đã destroy ⇒ đuôi phân bố **mất vĩnh viễn** ⇒ thí nghiệm cắt không chạy lại được |
| B3-8 | Ghi **redaction record** và cờ **`truncated`** ở dạng máy đọc được | §7.2 | Hai nhãn `redaction` và `truncated` của thủ tục quy trách nhiệm không thu được bằng chứng |
| B3-9 | Đo được **`P-serialized`** (sau redact, trước compress/encrypt) bên cạnh `P-persisted` | §3.4 | Không tính được tỉ lệ nén ⇒ `SEC-030` cũng không có số |

### 8.2 Yêu cầu đối với `B7` — Harness đo metric

| # | Yêu cầu | Neo |
|:--:|---|---|
| B7-1 | Một lệnh ra đủ **6 metric** ở dạng **máy đọc được** (JSON/CSV) — 5 metric §23 + `escaped_side_effects`. ⚠️ **Đây chưa phải toàn bộ hợp đồng đầu ra** — xem `B7-12` | §2.1 |
| B7-2 | Baseline = recorder **tắt hoàn toàn**; chạy cặp **A/B xen kẽ** `OFF/ON/OFF/ON`; **không** chạy baseline một lần rồi tái dùng | §3.1 |
| B7-3 | Đo ở **endpoint, tầng ứng dụng**; **100% traffic**; **sampling `FR-015` TẮT** | §3.1, §3.2 |
| B7-4 | Tách và báo cáo **hai path riêng**: `P-discard` (thành công) và `P-persist` (lỗi) | §3.2 |
| B7-5 | Load run dùng traffic **đa số THÀNH CÔNG**; **tỷ lệ lỗi** đóng dấu vào **mọi** con số overhead | §3.2 |
| B7-6 | Latency in **phân bố** `avg/P50/P95/P99` cho **cả** baseline lẫn ON, **kèm `N`** | §3.1, §2.5 |
| B7-7 | Đo đủ **bốn** chiều overhead: latency + CPU + Memory + Network | §2.4 |
| B7-8 | Replay Time in **breakdown** `t_boot`/`t_replay_exec`/`t_verify`; `t_pull` đo riêng, **không** cộng vào `N-04` | §3.3 |
| B7-9 | Capsule size in **cùng dòng** với replay time của chính capsule đó | §2.6 |
| B7-10 | Mọi chỗ in P95/P99 đều in **`N`** ngay cạnh | §2.5 |
| B7-11 | Đọc `escaped_side_effects` từ **canary log**, **không** từ log replay runtime | §5.2 |
| **B7-12** | 🔺 Xuất **chỉ số composite** — trong **cùng output máy đọc được** của `B7-1`, thành một trường **riêng**, **không** trộn vào `N-01`/`N-05`. Định nghĩa vận hành của tử số: một scenario tính **`reproduced`** ⟺ **(a)** replay **chạy tới kết quả** **VÀ (b)** **cả `K` lần** đều cho verdict `matched`. Scenario **không replay được** (crash · capsule không mở được · replay từ chối khởi động) ⇒ **KHÔNG** `reproduced` và **KHÔNG** rời mẫu số — **fail-closed** | §2.3; **TIÊU THỤ** từ [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6 |

> **Ranh giới của `B7-12`** — nhắc lại §1.1: tài liệu này **chỉ** yêu cầu chỉ số composite **được đo và được xuất ra**. **Chỉ số** và **ngưỡng** của nó (`≥ 6/7` — *dạng hiệu dụng* của ngưỡng §24 dòng 1, **không** phải ngưỡng mới) thuộc [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6 và §4.4. Lý do `B7-12` phải tồn tại: `B7-1` một mình chỉ đòi **6 metric**, và §4.6 của Spec đã chứng minh **hai** chỉ số §23 (`RSR`, `EMR` thô) đều **có lỗ rò** — scenario không replay được **rơi khỏi mẫu số** thay vì làm tỷ lệ xấu đi. Nếu `B7` không xuất composite ở dạng máy đọc được, `C4` chỉ còn hai chỉ số có lỗ rò và **lỗ rò quay lại nguyên vẹn**.

### 8.3 Yêu cầu đối với `C1` — Chạy 10 scenario × 7 bước

| # | Yêu cầu | Neo |
|:--:|---|---|
| C1-1 | ⛔ **Không khởi động** trước khi **(i)** quyết định `GAP-Redis` (`G1`) đã thành văn bản trong §2 Spike Protocol **và (ii)** Manifest đã **niêm phong** (có commit hash + ngày) | §1.3, §6.3 |
| C1-2 | Mỗi capsule replay **`K = 3` lần**, cùng code, cùng capsule; **cả 3 lần** vào population của `N-05` | §2.3 |
| C1-3 | **Canary sink** dựng tại địa chỉ môi trường đã destroy, lắng nghe **cả loopback**; canary log thu và đối chiếu **sau MỖI scenario** | §5.2 |
| C1-4 | Bằng chứng destroy do **công cụ độc lập** sinh, **mỗi lần chạy** (10 lần ⇒ **10 bằng chứng**) | `[stated Timeline C1]` |
| C1-5 | Chạy đủ **12 test `T1`–`T12`**; `T8` và `T12` FAIL ⇒ ghi nhận **khoảng hở đã đo được**, **CẤM** làm nhẹ test | §5.3, §5.4 |
| C1-6 | **GIỮ LẠI mọi capsule** và **toàn bộ log phân bố không bị kiểm duyệt** — chúng là đầu vào bắt buộc của thí nghiệm cắt §4.3 | §4.3 |
| C1-7 | Bước **Destroy original environment** giữ nguyên, không rút gọn | `[stated §22]` |

---

## 9. Related Documents

**Covers:** [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md)

| Tài liệu | Đường dẫn | Quan hệ với tài liệu này |
|---|---|---|
| **Spike Protocol — Phase 0** | [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | 🔺 **`Covers:`** — spec mà test plan này bao phủ. Sở hữu **cả ba** tham số §1.2: numerator (§3), denominator (§4), `GAP-Redis` (§2). Cũng là nơi đặt ràng buộc thứ tự §1.5 mà §6.3 định nghĩa vận hành. 🔺 Sở hữu **DUY NHẤT** thủ tục quy trách nhiệm divergence (§3.6 — §7.1 của tài liệu này chỉ cấp *cách thu bằng chứng*) và **chỉ số composite** + ngưỡng hiệu dụng của nó (§4.6, §4.4 — `B7-12` chỉ bắt **xuất ra**) |
| **Threat Model** | [Spec-Security-Repro-Threat-Model](../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Nguồn của `SEC-008` + mục **11.b** (§4), `THREAT-018` (§5), `SEC-030` (§3.4), `SEC-034` (`T10`), `SEC-035` (`T11`) |
| **ADR-005 — Default-Deny Write & Side Effects** | [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) | Nguồn của hai lớp chặn `L1`/`L2` (§5.3), của xuất xứ `escaped_side_effects = 0` (§2.7), và của cảnh báo `T8` (§5.4) |
| **SDD-Repro** | [SDD-Repro](../../030-Specs/Architecture/SDD-Repro.md) | §3.3 (`U-09` nghịch lý capture trigger → §3.2) · §3.4 (`U-15` redaction → nhãn `redaction`, §7.1) · §3.5 (pipeline → điểm đo §3.4) · §8.2 (`U-25` → `K`, §2.3) |
| **NFR-Repro** | [NFR-Repro](../../020-Requirements/NFR-Repro.md) | Mục 3 (`N-05`…`N-09` không ngưỡng) và `ACG-04`/`ACG-05`/`ACG-11` — ba chỗ hở mà §3 bịt |
| **Timeline-Repro** | [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) | Nguồn của task `B3`/`B5`/`B7`/`C1`–`C5` (§8), của bốn quyết định `G1`–`G4`, và là nơi `K` được giao cho `A5` chốt |
| **ADR-006 — Execution Verification By Equivalence** | [ADR-006](../../030-Specs/Architecture/ADR-006-Execution-Verification-By-Equivalence.md) | Khái niệm *equivalence* đứng sau numerator của `N-05` |
| **Nguồn sự thật** | [RQ.md](../../999-Resources/RQ.md) | §13 (side effects → `escaped_side_effects`) · §20.7 (overhead → §3.1/§3.2) · §20.12 (capsule size → §3.4) · §20.16 (false confidence → giới hạn kết luận) · §22 (10 scenario × 7 bước) · §23 (5 metric) · §24 (4 ngưỡng — **initial hypotheses**) · §39 (câu hỏi mà spike phải trả lời) |

---

*Test plan này định nghĩa CÁCH ĐO. Ngưỡng đạt thuộc về `@TrisJr` tại `GATE-06`, sau khi có số.*
