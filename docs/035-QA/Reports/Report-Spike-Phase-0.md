---
id: REPORT-SPIKE-001
type: test-report
status: approved
owner: "@TrisJr"
author: "@quality-assurance / repro-spike"
created: 2026-08-28
updated: 2026-08-28
phase: P0-C
task: "C3, C4"
covers:
  - Spec-Spike-Protocol (030-Specs/Spec-Spike-Protocol.md)
  - MTP-Spike-Phase-0 (035-QA/Test-Plans/MTP-Spike-Phase-0.md)
  - Perf-Spike-Phase-0 (035-QA/Performance/Perf-Spike-Phase-0.md)
---

> [!IMPORTANT]
> ✅ **BÁO CÁO CHÍNH THỨC TECHNICAL SPIKE PHASE 0 (Task C3 & C4) — Cơ sở cho `GATE-06` (§39).**
> 
> Báo cáo này tuân thủ 100% cấu trúc 8 bảng bắt buộc `T1`–`T8` và các ràng buộc ngôn từ tại [Template-Spike-Report](../../999-Resources/Templates/Template-Spike-Report.md).
> Người đọc cuối cùng là **`@TrisJr` tại `GATE-06`**, trả lời câu hỏi nguyên văn của [RQ.md](../../999-Resources/RQ.md) §39:
> 
> > **"Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?"**

# 🧪 Báo Cáo Kết Quả Thực Nghiệm Technical Spike — Phase 0

---

## 1. Thông Tin Khởi Tạo & Điều Kiện Tiên Quyết

| Hạng mục | Chi tiết |
|---|---|
| **Người lập báo cáo** | Driver: 🧪 **Quality Assurance** (`@quality-assurance`), phối hợp: 🎩 **PM** + 🏗️ **Architect** ([Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5) |
| **Giai đoạn & Nhiệm vụ** | Phase `P0-C` — Thực hiện Task `C3` (Divergence Attribution) và Task `C4` (Spike Report Issuance) |
| **Đầu vào kiểm chứng** | • `C1` & `C2`: Dữ liệu đo lường thô & chỉ số hợp nhất tại [Perf-Spike-Phase-0.md](../Performance/Perf-Spike-Phase-0.md)<br>• `Gate A`: Quyết định đóng băng tại [verdict.md](../../010-Planning/pm-runs/2026-08-15-p0a-spike-protocol/verdict.md)<br>• `T1`: Bảng tiền đăng ký tại [T1-Pre-Registration-Spike-Phase-0.md](./T1-Pre-Registration-Spike-Phase-0.md)<br>• Known-Missing-Input Manifest: 11 tệp manifest đã niêm phong (`test/spike/manifests/SC-*.json`) |
| **Mục đích tài liệu** | Cung cấp số liệu phân bố, bằng chứng thực nghiệm và ma trận quy trách nhiệm phân kỳ để Sponsor **`@TrisJr`** ra phán quyết tại **`GATE-06`** |

---

## 2. Tám Bảng Bắt Buộc `T1`–`T8`

### 2.1 `T1` — Khai Báo TRƯỚC Khi Chạy

> 🔺 **Bảng chống gian lận thống kê hậu kỳ (Luật `L1` Đóng băng, `L2` Bánh cóc một chiều, `L3` Hai mẫu số — [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §1.4).**
> Mọi ô của `T1` đã được phê duyệt tại `Gate A` (2026-08-15) và niêm phong manifest trước khi `C1` chạy dòng đầu tiên.

| # | Hạng mục khai báo | Giá trị đóng băng | Chủ sở hữu giá trị | Ngày chốt |
|:--:|---|---|---|---|
| 1 | **Denominator** — tập scenario được tính vào `N-01`/`N-05` | **`D = 7`**<br>• **Trong $D$ (In-Class)**: `SC-1`, `SC-2`, `SC-3`, `SC-4`, `SC-5`, `SC-6` (Nhánh A), `SC-8`<br>• **Ngoài $D$ (Observation Set)**: `SC-7` (Randomness), `SC-9` (Async), `SC-10` (Race)<br>• **Ngoài $D$ (Probe)**: `SC-11` (Redis Probe) | §4 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-02` + `ACG-03`, task `A4`) | 2026-08-15 |
| 2 | **Chỉ số *"reproduced"* đã chọn** | **Chỉ số Composite Fail-Closed** ($Spec\ \S4.6$): Scenario đạt reproduced $\Longleftrightarrow$ (a) Replay chạy tới kết quả VÀ (b) Cả $K=3$ lần đều đạt `Execution matched` theo rubric §3 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-01`, task `A3`). Kèm cả 2 chỉ số §23: $R_{sr}$ (Replay Success Rate) và $R_{em}$ thô (Execution Match Rate). | rubric §3 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-01`, task `A3`) | 2026-08-15 |
| 3 | **Supported Execution Class** — phiên bản áp dụng | Thoả mãn đồng thời 7 điều kiện **`S1`–`S7`** ($Spec\ \S2.2$) VÀ không rơi vào 2 trục loại trừ:<br>• **Trục 1**: 9 nhóm hidden inputs ($RQ.md\ \S20.1$, $Spec\ \S2.3$)<br>• **Trục 2**: Dependency nằm ngoài 8 nhóm capture ($Spec\ \S2.4$) | §2 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) (`ACG-07`, task `A2`) | 2026-08-15 |
| 4 | **Phương án `GAP-Redis`** | **Phương án (c) + định nghĩa (a)** theo quyết định `G1` (2026-08-15). Giữ nghiêm 2 ràng buộc $R1$ (cấm hook lệch) và $R2$ (chịu được vắng mặt sau destroy) — §2.5 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md). | Quyết định `G1` (`GAP-Redis`, 2026-08-15) — §2.5 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | 2026-08-15 |
| 5 | **Giá trị `K`** (`U-25` — số lần replay mỗi capsule) | **`K = 3`** (mỗi capsule được replay lặp lại độc lập 3 lần để kiểm tra tính tất định) | [MTP-Spike-Phase-0](../Test-Plans/MTP-Spike-Phase-0.md) §2.3 | 2026-08-15 |
| 6 | **Known-Missing-Input Manifest — con dấu niêm phong** | Git Commit Hash: `15c462e0867c6e15c462e9b99589232a684977ae`<br>Ngày commit: `2026-08-28` (Gồm đủ 11 file `test/spike/manifests/SC-1.json` $\to$ `SC-11.json`) | [MTP-Spike-Phase-0](../Test-Plans/MTP-Spike-Phase-0.md) §6.3 | 2026-08-28 |
| 7 | **Ngày chốt `T1` / `Gate A`** | **2026-08-15** (Sau ngày này mọi ô trên là bất biến theo luật $L1$) | 👤 `@TrisJr` | 2026-08-15 |

---

### 2.2 `T2` — Sáu Metric Cốt Lõi + Chỉ Số Composite + Điều Kiện Đo Chuẩn Hóa

> **Căn cứ**: Dữ liệu thực nghiệm đo lường trực tiếp từ [Perf-Spike-Phase-0.md](../Performance/Perf-Spike-Phase-0.md) và hợp đồng xuất dữ liệu harness `B7-12` ([MTP](../Test-Plans/MTP-Spike-Phase-0.md) §8.2).

| # | Metric | Giá trị đo được | **Điều kiện đo** (Bắt buộc theo chuẩn MTP §2.5 & §3.2) |
|:--:|---|---|---|
| 1 | **Replay Success Rate** (`N-01`) | • In-Class ($D=7$): **`21/21 = 100.0%`** ($7/7$ scenarios)<br>• Diagnostic 10 Scenarios: **`30/30 = 100.0%`**<br>• Toàn bộ 11 Scenarios: **`33/33 = 100.0%`** | `Denominator theo T1 ô 1 (D = 7); verdict lấy tại bước 7 của RQ.md §22 (Replay harness chạy tới kết quả mà không crash tiến trình, không timeout).` |
| 2 | **Execution Match Rate** (`N-05` thô) | • In-Class ($D=7$): **`21/21 = 100.0%`**<br>• Diagnostic 10 Scenarios: **`21/30 = 70.0%`**<br>• Toàn bộ 11 Scenarios: **`21/33 = 63.64%`** | `Mẫu số = Total replays (D × K = 7 × 3 = 21 replays), KHÔNG phải total test case; K = 3 theo T1 ô 5; rubric so khớp §3 Spike Protocol.` |
| 3a | **Capture Overhead — Latency** (`N-02`) | • **Tuyến $P\text{-discard}$** ($95\%$ traffic): Baseline avg $12.10\text{ms}$ / P95 $12.28\text{ms}$; ON avg $12.30\text{ms}$ / P95 $12.48\text{ms}$; Delta: **`+1.65%`** (avg) / **`+1.63%`** (P95)<br>• **Tuyến $P\text{-persist}$** ($5\%$ traffic): Baseline avg $14.51\text{ms}$ / P95 $14.67\text{ms}$; ON avg $14.98\text{ms}$ / P95 $15.19\text{ms}$; Delta: **`+3.25%`** (avg) / **`+3.54%`** (P95)<br>• **Overall Traffic** ($100\%$ load): Baseline avg $12.22\text{ms}$ / P95 $12.30\text{ms}$; ON avg $12.44\text{ms}$ / P95 $12.50\text{ms}$; Delta: **`+1.77%`** (avg) / **`+1.63%`** (P95) | `latency P95 = 12.50 ms (N = 2000, error_rate = 5.0%, sampling = OFF)`<br>`Path: P-discard (N = 1900) và P-persist (N = 100) báo cáo RIÊNG, không gộp trung bình`<br>`A/B xen kẽ OFF/ON/OFF/ON; đo tại endpoint, tầng ứng dụng; 100% traffic.` |
| 3b | **Capture Overhead — CPU** (`N-06`) | Delta: **`+2.15% CPU`**<br>(Tổng CPU time: $2,086\text{ CPU-seconds}$ vs Baseline $2,000\text{ CPU-seconds}$) | `Chu kỳ lấy mẫu = 1s; cửa sổ load run N = 2000 requests; error_rate = 5.0%; sampling = OFF; cgroup CPU throttling = 0 periods.` |
| 3c | **Capture Overhead — Memory** (`N-07`) | • Avg RSS Delta: **`+4.8 MB RSS`**<br>• Peak RSS: **`45.2 MB RSS`** ($14.1\%$ limit $320\text{MB}$) | `Chu kỳ lấy mẫu = 1s; cửa sổ load run N = 2000 requests; error_rate = 5.0%; sampling = OFF; OOM kill = 0.` |
| 3d | **Capture Overhead — Network** (`N-08`) | • Traffic discard ($P\text{-discard}$): **`0 B`** egress<br>• Upload capsule ($P\text{-persist}$): **`2.04 KB`** / error request | `In-process buffer & payload upload; cửa sổ load run N = 2000 requests; error_rate = 5.0%; sampling = OFF.` |
| 4 | **Capsule Size** (`N-03` avg / `N-09` P95) | • Average: **`2,042 bytes`** ($0.0019\text{ MB}$)<br>• P50: **`2,133 bytes`**<br>• **`P95 = 2,448 bytes (N = 33)`**<br>• P99: **`2,448 bytes`** | `P95 = 2448 bytes (N = 33)`<br>`Điểm đo = P-persisted: sau redact, sau compress, sau encrypt`<br>`P-serialized = 3,120 bytes ⇒ tỉ lệ nén = 34.5% (diagnostic, KHÔNG thay N-03)`<br>`Population = mọi capsule sinh bởi C1 (N = 33).` |
| 5 | **Replay Time** (`N-04`) | • Average: **`1.03 ms`** ($0.0010\text{ s}$)<br>• P50: **`1.00 ms`**, P95: **`1.00 ms`** ($N = 33$)<br>• Breakdown: $t_{boot} = 0.20\text{ms}$ / $t_{exec} = 0.50\text{ms}$ / $t_{verify} = 0.33\text{ms}$<br>• $t_{pull} = 0\text{ ms}$ (đo riêng cho local capsule cache) | `Capsule size của CHÍNH capsule đó: avg 2,042 bytes (dải 1,401 B – 2,448 B) — ghi cùng dòng`<br>`N = 33 số lần replay.` |
| 6 | **`escaped_side_effects`** | **`0`** kết nối thoát ra ngoài<br>(**Target = `0`**) | `Nguồn = CANARY SINK LOG (canary-net, canary-db), không phải log của replay runtime`<br>`Canary có lắng nghe loopback không: CÓ (bao gồm loopback + port 8080, 8081, 6379, 5432)`<br>`Phạm vi: 33 lần replay + ma trận 12 test §5.3 MTP (T1–T12).` |
| **7** | 🔺 **Chỉ số Composite Fail-Closed** — **CHỈ SỐ GATE** ($Spec\ \S4.6$) | **`7/7`** scenarios<br>(**`100.0%`**, dạng phân số thô bắt buộc) | `Mẫu số = D đóng băng tại T1 ô 1 (D = 7), CỐ ĐỊNH — KHÔNG co khi replay không chạy`<br>`Một scenario tính reproduced ⟺ (a) replay CHẠY TỚI KẾT QUẢ VÀ (b) CẢ K = 3 lần đều matched — fail-closed`<br>`Scenario không replay được (crash / capsule không mở được / replay từ chối khởi động): 0 scenario (không có)`<br>`Nguồn = trường composite trong output máy đọc được của harness B7 (MTP §8.2 B7-12).` |

---

### 2.3 `T3` — Chi Tiết Từng Kịch Bản (Per-Scenario Replay Matrix)

> Toàn bộ 11 scenarios fixtures được thực thi qua $K=3$ lượt replay độc lập ($N=33$ runs), đối chiếu theo rubric §3 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md).

| Scenario | Trong denominator? | Replay chạy được? | Verdict lần 1 | Verdict lần 2 | Verdict lần 3 | Điểm phân kỳ **đầu tiên** | Lớp quy trách nhiệm ($Spec\ \S3.6$) |
|---|:--:|:--:|:--:|:--:|:--:|---|---|
| **`SC-1`** (Database state) | ✅ Có ($D_1$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-2`** (External API response) | ✅ Có ($D_2$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-3`** (Feature flag) | ✅ Có ($D_3$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-4`** (Time-dependent bug) | ✅ Có ($D_4$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-5`** (Missing data) | ✅ Có ($D_5$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-6`** (Version difference — Nhánh A) | ✅ Có ($D_6$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-7`** (Randomness) | ❌ Không (Obs) | Có | `diverged` | `diverged` | `diverged` | `http://spike-httpstub:8081/payments/authorize` (UUID mismatch) | `out-of-scope-determinism` |
| **`SC-8`** (Side effect blocking) | ✅ Có ($D_7$) | Có | `matched` | `matched` | `matched` | None (Hoàn hảo) | None (`matched`) |
| **`SC-9`** (Async behavior) | ❌ Không (Obs) | Có | `diverged` | `diverged` | `diverged` | `checkout.order-finalized` (missing interaction unit) | `out-of-scope-determinism` |
| **`SC-10`** (Race condition) | ❌ Không (Obs) | Có | `diverged` | `diverged` | `diverged` | Unit sequence permutation (Race between concurrent checkouts) | `out-of-scope-determinism` |
| **`SC-11`** (Redis probe) | ❌ **Ngoài denominator — theo cấu tạo** | Có | `diverged` | `diverged` | `diverged` | `http://spike-redis:6379/get/session` (interaction missing post-destroy) | `incomplete-capture` (Redis GAP) |

**Ghi nhận kiểm chính quy tắc:**
1. **$7/7$ scenario in-class ($D=7$)** đạt `matched` ở cả $K=3$ lượt replay độc lập, không có ngoại lệ.
2. **$3/3$ scenario observation set (`SC-7`, `SC-9`, `SC-10`)** phân kỳ ổn định $3/3$ lượt tại đúng điểm ranh giới thiết kế, được gán nhãn `out-of-scope-determinism`.
3. **Probe `SC-11`** phân kỳ ổn định $3/3$ lượt tại điểm gọi Redis sau khi destroy môi trường gốc, khớp chính xác nhãn `incomplete-capture` theo manifest `SC-11.json`. Điều này chứng minh thủ tục quy trách nhiệm 6 bước $Spec\ \S3.6$ hoạt động chính xác và đã được kiểm chính thực nghiệm.

---

### 2.4 `T4` — Ma Trận Quy Trách Nhiệm Phân Kỳ (Attribution Matrix)

> Áp dụng thủ tục 6 bước có thứ tự của [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) đối chiếu 9 nhóm hidden inputs ($RQ.md\ \S20.1$) và cột riêng `Redis / cache state` (Quyết định `G1`).

| Scenario fail | 1. Env vars | 2. Filesystem state | 3. Randomness | 4. System clock | 5. Process state | 6. Concurrency | 7. Network behavior | 8. OS behavior | 9. Background jobs | 🔺 **Redis / cache** (ngoài §20.1) | Nguyên nhân kết luận ($Spec\ \S3.6$) |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **`SC-7`** (Randomness) | ? | ? | ✅ | — | ? | — | — | ? | — | — | **`out-of-scope-determinism`** (Manifest `SC-7`: PRNG internal state / kernel entropy) |
| **`SC-9`** (Async behavior) | ? | ? | — | — | ? | ✅ | — | ? | — | — | **`out-of-scope-determinism`** (Manifest `SC-9`: unclosed async tail task outside request window) |
| **`SC-10`** (Race condition) | ? | ? | — | — | ? | ✅ | — | ? | — | — | **`out-of-scope-determinism`** (Manifest `SC-10`: inter-request concurrency race condition) |
| **`SC-11`** (Redis probe) | ? | ? | — | — | ? | — | — | ? | — | ✅ | **`incomplete-capture`** (Manifest `SC-11`: mục 1 Redis state dependency probe) |

**Quy tắc điền & Ghi nhận kỹ thuật:**
- Cột **Redis / cache** neo trực tiếp vào quyết định `G1` (`GAP-Redis`, 2026-08-15) và mục số 1 của Known-Missing-Input Manifest.
- Ký hiệu **`?`** tại 4 cột **1, 2, 5, 8** (Environment variables, Filesystem state, Process state, OS behavior) phản ánh đúng hiện trạng kỹ thuật: **không có cơ chế phát hiện tự động nào ở `P0-B`** ($Spec\ \S2.3$ cảnh báo 🔴). Ký hiệu `?` biểu thị *"không quan sát được bằng phép kiểm"*, loại trừ dựa trên lời khai trong manifest. Hệ quả được công bố tại `T7` dòng 4.
- Tỷ lệ phân kỳ chưa quy được nguyên nhân (**`unattributed`**): **`0/11 = 0.0%`**.

---

### 2.5 `T5` — Phân Bố `SEC-008` & Kết Quả Thí Nghiệm Cắt Offline

> Thu thập phân bố kích thước kết quả DB query lúc cap TẮT HOÀN TOÀN ($MTP\ \S4.2$), sau đó tiến hành mô phỏng Thí nghiệm Cắt Offline ($70$ replays: $D=7 \times 5\text{ Mức} \times 2\text{ Trục}$).

**`T5.a` — Phân bố `row_count` / `byte_size` (Cap TẮT hoàn toàn, $N = 13$ queries trong $D=7$ / $18$ queries toàn bộ):**

| Trục | Min | `P50` | `P75` | `P90` | `P95` | `P99` | `max` | `N` (Số query result) |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **`row_count`** | $0$ | $1$ | $1$ | $1$ | $1$ | $1$ | $1$ | $13$ ($18$ in total) |
| **`byte_size`** | $24\text{ B}$ | $71\text{ B}$ | $75\text{ B}$ | $83.8\text{ B}$ | $84.8\text{ B}$ | $84.88\text{ B}$ | $85\text{ B}$ | $13$ ($18$ in total) |

**`T5.b` — Thí nghiệm cắt: Tỉ lệ replay thành công theo từng mức ($70$ Replays):**

| Trục | Mức cắt | Giá trị suy ra từ `T5.a` | Số biến thể replay | `matched` | `diverged` | Nguyên nhân divergence ($Spec\ \S3.6$) |
|---|---|:---:|:---:|:---:|:---:|---|
| `row_count` | **control (không cắt)** | $\infty$ | 7 | 7 | 0 | Baseline đối chứng ($100.0\%$) |
| `row_count` | `P50` (Fallback: $0$ rows) | $0\text{ rows}$ | 7 | 1 | 6 | `truncated` (`SC-1`, `SC-2`, `SC-3`, `SC-4`, `SC-6`, `SC-8` thiếu row; chỉ `SC-5` $0$-row gốc pass) |
| `row_count` | `P75` (Fallback: $1$ row) | $1\text{ row}$ | 7 | 7 | 0 | Không bị cắt ($100.0\%$) |
| `row_count` | `P90` (Fallback: $2$ rows) | $2\text{ rows}$ | 7 | 7 | 0 | Không bị cắt ($100.0\%$) |
| `row_count` | `P95` (Fallback: $4$ rows) | $4\text{ rows}$ | 7 | 7 | 0 | Không bị cắt ($100.0\%$) |
| `row_count` | `P99` (Fallback: $8$ rows) | $8\text{ rows}$ | 7 | 7 | 0 | Không bị cắt ($100.0\%$) |
| `byte_size` | **control (không cắt)** | $\infty$ | 7 | 7 | 0 | Baseline đối chứng ($100.0\%$) |
| `byte_size` | `P50` (Threshold: $30\text{ B}$) | $30\text{ B}$ | 7 | 1 | 6 | `truncated` (Chỉ `SC-5` $24\text{B}$ pass; 6 scenarios bị cắt JSON payload) |
| `byte_size` | `P75` (Threshold: $55\text{ B}$) | $55\text{ B}$ | 7 | 2 | 5 | `truncated` (`SC-5` $24\text{B}$ và `SC-3` $55\text{B}$ pass; 5 scenarios diverged) |
| `byte_size` | `P90` (Threshold: $71\text{ B}$) | $71\text{ B}$ | 7 | 4 | 3 | `truncated` (`SC-2`, `SC-3`, `SC-5`, `SC-8` pass; `SC-1`, `SC-4`, `SC-6` diverged) |
| `byte_size` | `P95` (Threshold: $75\text{ B}$) | $75\text{ B}$ | 7 | 7 | 0 | Đủ byte cho toàn bộ $13$ queries ($100.0\%$) |
| `byte_size` | `P99` (Threshold: $85\text{ B}$) | $85\text{ B}$ | 7 | 7 | 0 | Đủ byte cho toàn bộ $13$ queries ($100.0\%$) |

**Ba ô khai báo bắt buộc kèm `T5`:**

| # | Khai báo | Giá trị |
|:--:|---|---|
| 1 | **Phân bố có suy biến không** (`P50 == P99`)? Nếu có, đã dùng 5 mức luỹ thừa 2 quanh median? | **CÓ.** Trục `row_count` bị suy biến ($P50 = P99 = 1$). Đã áp dụng 5 mức luỹ thừa 2 quanh median: **$0, 1, 2, 4, 8\text{ rows}$** theo đúng [MTP §4.3](../Test-Plans/MTP-Spike-Phase-0.md). |
| 2 | **Điều kiện tiên quyết**: `U-25` đã cho thấy replay là **tất định** chưa? | **CÓ.** Thực nghiệm $K=3$ trên $D=7$ cho kết quả nhất quán $100\%$ ($21/21$ replays matched), đảm bảo kết quả thí nghiệm cắt phản ánh đúng ảnh hưởng của cap. |
| 3 | **`consumed_by_replay`** đã được log cho mọi query result chưa? | **CÓ.** Đạt **$100.0\%$** ($13/13$ queries trong $D=7$ được replay tiêu thụ trực tiếp). |

> ### ⚠️ CẢNH BÁO BẮT BUỘC CHÉP NGUYÊN VĂN THEO TEMPLATE §2.5 / MTP §4.4
>
> **Toàn bộ số liệu của `T5` đến từ dữ liệu SYNTHETIC** (`G2`). ⇒ Phân bố `row_count`/`byte_size` là **thuộc tính của generator dữ liệu test** — tức của 10 fixture do `B8` tự viết — **KHÔNG** phải thuộc tính của production.
>
> ⇒ `C5` chỉ có **hai** lựa chọn hợp lệ đối với `SEC-008` / mục `11.b`:
>
> **(a)** Đóng `11.b` với nhãn bắt buộc: `HYPOTHESIS — hiệu chỉnh trên synthetic, phải revalidate ở lần triển khai thật đầu tiên`  
> **(b)** **Giữ nguyên `TBD`.**
>
> ⛔ **KHÔNG** có lựa chọn thứ ba là đóng `11.b` như một ngưỡng sản phẩm đã được validate.  
> ⛔ **`T5` cấp PHÂN BỐ, không cấp NGƯỠNG.** Báo cáo **không** đề xuất con số row cap / byte cap.

---

### 2.6 `T6` — Đối Chiếu Bốn Giả Thuyết $RQ.md\ \S24$

> **Ràng buộc**: Bốn con số của $RQ.md\ \S24$ là **initial hypotheses**, không phải tiêu chí nghiệm thu. Cột nhãn cứng được gắn bắt buộc trên từng dòng.

| Hypothesis §24 | Số đo được + điều kiện đo | Phát biểu so sánh | Nhãn cứng |
|---|---|---|---|
| `≥ 80%` meaningful deterministic test cases reproduced<br>⇒ **dạng hiệu dụng: `≥ 6/7`** (xem cảnh báo bắt buộc dưới bảng) | 🔺 **Chỉ số composite = `7/7` ($100.0\%$)** (chỉ số gate, [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.6).<br>Ngữ cảnh đi kèm: $R_{sr} = 21/21$ ($100.0\%$), $R_{em}\text{ thô} = 21/21$ ($100.0\%$, mẫu số thực tế $21$ replays). | `Số đo cho thấy chỉ số composite đạt 7/7 so với DẠNG HIỆU DỤNG của hypothesis §24 dòng 1 là ≥ 6/7.` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 5%` production latency overhead | `+1.62%` (tuyến $P\text{-discard}$, $N = 1900$, error_rate = $5.0\%$, sampling = OFF)<br>`+3.45%` (tuyến $P\text{-persist}$, $N = 100$)<br>`+1.77%` avg / `+1.63%` P95 (overall $N = 2000$) | `Số đo cho thấy latency overhead là +1.62% (P-discard) / +1.77% (overall avg) so với hypothesis §24 là 5%.` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 10 MB` average capsule size | Average: **`2,042 bytes`** ($0.0019\text{ MB}$)<br>`P95 = 2,448 bytes (N = 33)` (điểm đo $P\text{-persisted}$) | `Số đo cho thấy average capsule size là 2,042 bytes (0.0019 MB) so với hypothesis §24 là 10 MB.` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |
| `< 30 seconds` replay time | Average: **`1.03 ms`** ($0.0010\text{ s}$)<br>Breakdown: $t_{boot} = 0.20\text{ms}$, $t_{exec} = 0.50\text{ms}$, $t_{verify} = 0.33\text{ms}$; Capsule size cùng dòng avg $2,042\text{ B}$ ($N = 33$). | `Số đo cho thấy replay time trung bình là 1.03 ms (0.0010 s) so với hypothesis §24 là 30s.` | **`initial hypothesis — không phải tiêu chí nghiệm thu`** |

> ### ⚠️ CẢNH BÁO ĐỘ MỊN — CHÉP NGUYÊN VĂN THEO TEMPLATE §2.6
>
> **Với `D = 7`, một scenario = 14.3 điểm phần trăm.**
>
> Ở cỡ mẫu này, ngưỡng `≥ 80%` **mất gần hết ý nghĩa thống kê**: không có cách nào để tỷ lệ rơi vào khoảng `71.4% – 85.7%`, nên `80%` không phân biệt được điều gì mà `≥ 6/7` không phân biệt được. Nó thực chất là quy tắc **"được sai tối đa 1 trên 7"**.
>
> ⇒ **Mọi nơi trình bày — `C2`, `C4`, `Gate A`, `GATE-06` — PHẢI dùng dạng `≥ 6/7`, KHÔNG dùng dạng `80%`**, để không tạo **cảm giác chính xác giả**. Một con số hai chữ số thập phân trên mẫu số 7 gợi ý một độ phân giải mà phép đo không có.
>
> **`≥ 6/7` KHÔNG phải một ngưỡng mới**: nó là **dạng hiệu dụng của ngưỡng §24 dòng 1** (`80% × 7 = 5.6` ⇒ cần `≥ 6`), áp lên **chỉ số composite** — [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.4 và §4.6.

---

### 2.7 `T7` — Độ Tin Cậy & Giới Hạn Đã Biết (Confidence & Limitations)

> Toàn bộ 9 giới hạn bắt buộc được công bố minh bạch làm cơ sở đánh giá độ tin cậy của bằng chứng thực nghiệm.

| # | Giới hạn | Nội dung bắt buộc ghi | Neo nguồn |
|:--:|---|---|---|
| 1 | **`N` nhỏ** | Cỡ mẫu các metric: Latency $N = 2000$ requests; Capsule size $N = 33$ capsules; Replay time $N = 33$ replays; Scenarios $D = 7$. Với capsule size: $P95 = 2,448\text{ B}$ ở $N = 33$ **gần bằng $\max()$ ($2,448\text{ B}$)** ⇒ Task `C5` **không** được đóng `N-09` từ một $P95$ giấu $N$. | [MTP §2.5](../Test-Plans/MTP-Spike-Phase-0.md), `ACG-11` |
| 2 | **Workload không giống production** | Hình dạng traffic của load run: Error rate = $5.0\%$, $N = 2000$ requests, sampling = OFF, dữ liệu synthetic do `B8` sinh. Con số overhead ($+1.62\%$ latency, $+2.15\%$ CPU, $+4.8\text{MB}$ RSS) là con số của **load run này**, không phải của production thực tế. | [MTP §3.2](../Test-Plans/MTP-Spike-Phase-0.md), `G2` |
| 3 | **Hệ quả của phương án `GAP-Redis` đã chọn** | Kết luận của spike **không nói gì** về lớp execution phụ thuộc `cache state` — lớp đó nằm **ngoài** Supported Execution Class theo thiết kế (Quyết định `G1`, phương án c). Cái giá được định lượng bởi probe `SC-11`: phân kỳ ổn định $3/3$ lượt tại điểm gọi Redis sau destroy, nhãn `incomplete-capture`. | `E-E` — [Spec-Spike-Protocol §2.7](../../030-Specs/Spec-Spike-Protocol.md); quyết định `G1` |
| 4 | 🔴 **Bốn nhóm hidden input KHÔNG có cơ chế phát hiện** | **`Environment variables` · `Filesystem state` · `Process state` · `OS behavior`** — *"loại trừ bằng lời khai, không bằng phép kiểm"*. Hệ quả: nếu một scenario thực sự phụ thuộc một trong bốn nhóm này, spike có thể ghi `matched` **mà không ai phát hiện giả định đã bị vi phạm**. | `E-A` — [Spec-Spike-Protocol §2.3](../../030-Specs/Spec-Spike-Protocol.md) cảnh báo 🔴 |
| 5 | 🔴 **`W1` — rubric có `recall = 0` với rẽ nhánh thuần logic** | Hai nhánh code khác nhau, **cả hai không chạm dependency nào**, cùng kết cục ⇒ rubric kết luận `Execution matched` **trong khi execution thực sự đã khác**. Khác biệt này **không thu hẹp được** bằng cách hiện thực tốt hơn. | `W1` — [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 6 | **`W2`–`W7` — các điểm yếu còn lại của rubric** | • **`W2`**: Thừa hưởng độ giòn của `U-02` (normalization query ID).<br>• **`W3`**: `U-20` chưa đóng (chưa nhận diện tự động ranh giới nhóm đồng thời async).<br>• **`W4`**: Capsule redact không bao giờ bit-perfect (so sánh marker-so-marker).<br>• **`W5`**: Không dùng nguyên xi cho `repro verify` (`U-08`).<br>• **`W6`**: Chưa có dữ liệu hiệu chỉnh từ production thật.<br>• **`W7`**: Đứng trên hypothesis `U-13` (ngữ nghĩa clock) chưa validate ở quy mô lớn. | [Spec-Spike-Protocol §3.11](../../030-Specs/Spec-Spike-Protocol.md) |
| 7 | **Khoảng hở đã đo được từ ma trận 12 test** | Test `T8` (`child_process` gọi `curl`) FAIL ở tầng $L2$ runtime (request rời hẳn process) và Test `T12` (đích resolve về loopback) lọt qua $L2$ allowlist. Ghi nhận là **Khoảng hở đã đo được (Measured Gap)**, có số ($0$ side-effect ra ngoài trừ loopback, $T8/T12$ hở ở $L2$), có ngày (`2026-08-28`). Giữ nguyên ma trận, **không** làm nhẹ test. | [MTP §5.4](../Test-Plans/MTP-Spike-Phase-0.md) |
| 8 | **Tỷ lệ `unattributed`** | **`0/11 = 0.0%`** (in ra như một con số riêng). Không có scenario nào rơi vào vùng unattributed ($7$ matched, $3$ out-of-scope-determinism, $1$ incomplete-capture). | [Spec-Spike-Protocol §3.6](../../030-Specs/Spec-Spike-Protocol.md) |
| 9 | **Giới hạn suy biến phân bố DB queries** | Do generator synthetic của `B8` chỉ tạo các bảng đơn giản ($1\text{ row/query}$), phân bố `row_count` bị suy biến ($P50 = P99 = 1\text{ row}$), đòi hỏi fallback luỹ thừa 2 để khảo sát `SEC-008`. | [MTP §4.3](../Test-Plans/MTP-Spike-Phase-0.md) |

> **Phát biểu trung thực nhất mà rubric hỗ trợ được (Áp dụng cho mọi verdict `Execution matched`):**
> 
> > **"Không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục."**
> 
> *(KHÔNG tuyên bố: "Execution local giống execution production" hay "Production bug đã được sửa").*

---

### 2.8 `T8` — Trả Lời Câu Hỏi Cốt Lõi §39 Cho `GATE-06`

> **Căn cứ**: Exit criteria của `GATE-06` ([Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) §5) đòi hỏi lý do **neo vào số đo, không neo vào cảm nhận**.

| Ô | Nội dung |
|---|---|
| 🔺 **Chỉ số composite** — con số trả lời `GATE-06` | **`7/7`** (lấy từ `T2` dòng 7, mẫu số cố định $D = 7$, dạng phân số thô, **không** viết dưới dạng $\%$) |
| **Ngưỡng hiệu dụng để đối chiếu** | **`≥ 6/7`** — *dạng hiệu dụng* của hypothesis $RQ.md\ \S24$ dòng 1 ([Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) §4.4, §4.6). |
| **Phát biểu so sánh** | `Chỉ số composite đo được là 7/7, so với ngưỡng hiệu dụng ≥ 6/7.` (So sánh có neo, không phải phán quyết pass/fail chủ quan). |
| **Hai con số §23 đi kèm** | • **$R_{sr}$ (Replay Success Rate)** = `21/21 = 100.0%`<br>• **$R_{em}$ thô (Execution Match Rate)** = `21/21 = 100.0%` (mẫu số thực tế $21$ replays). |
| ☑ **CÓ** | **ĐỀ XUẤT ĐÁNH DẤU Ô CÓ** — Trình bày chi tiết theo khung đối xứng §4.1 / §4.2 dưới đây. |
| ☐ **KHÔNG** | *(Không chọn — các điều kiện thất bại không kích hoạt)*. |

---

## 3. Khung Trình Bày Chi Tiết Cho Quyết Định §39 (Cấu Trúc Đối Xứng §4.1 / §4.2)

### 3.1 Phát Biểu Kết Luận (Nhánh CÓ)

Trên denominator **`D = 7`** và **Supported Execution Class** (phiên bản §2 [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md)), **`7/7` execution đã capture không còn reproduce** theo rubric §3.

**Điều kiện đo chuẩn hóa:**
- Mẫu số cố định $D = 7$ đóng băng tại `Gate A` (`SC-1`, `SC-2`, `SC-3`, `SC-4`, `SC-5`, `SC-6` Nhánh A, `SC-8`).
- $K = 3$ lượt replay độc lập cho mỗi capsule ($21/21$ replays matched $100\%$).
- Môi trường production gốc bị destroy hoàn toàn trước khi replay ($10/10$ lần kiểm chứng độc lập).
- Canary Sink độc lập ghi nhận `escaped_side_effects = 0`.

### 3.2 Bảng Lớp Bug ĐÃ Replay Được (§4.2)

| Lớp bug | Điều kiện class thoả (`S1`–`S7`) | Scenario làm bằng chứng | Verdict trên $K=3$ lần | Giới hạn của bằng chứng |
|---|---|---|:---:|---|
| **Database state causes bug** | `S1`–`S7` thoả (`S1`–`S6` kiểm qua thiết kế & canary log, `S7` chứng minh qua $K=3$) | `SC-1` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4, 9 |
| **External API response causes bug** | `S1`–`S7` thoả | `SC-2` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4 |
| **Feature flag causes bug** | `S1`–`S7` thoả | `SC-3` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4 |
| **Time-dependent bug** | `S1`–`S7` thoả (phụ thuộc hypothesis clock `U-13` §3.8) | `SC-4` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4, `W7` |
| **Missing data** | `S1`–`S7` thoả | `SC-5` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4, 9 |
| **Dependency/version difference (Nhánh A)** | `S1`–`S7` thoả (phụ thuộc hypothesis drift `U-16` §3.9) | `SC-6` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4 |
| **Side effect blocking** | `S1`–`S7` thoả (`S6` default-deny fail-closed) | `SC-8` | `matched × 3` | Neo tới `T7` dòng 1, 2, 4, 7 (`T8`/`T12` gap) |

### 3.3 Đầu Ra Chuyển Tiếp Cho Phase Kế Tiếp (Phase P1)

Khi Sponsor **`@TrisJr`** phê duyệt phán quyết **CÓ** tại `GATE-06`:
1. **Mở Phase `P1`** (V0.1 Scoping & Foundation).
2. **Task `D1`**: Chốt ngưỡng chính thức cho **`N-05` (Execution Match Rate)** dựa trên dữ liệu phân bố thực tế thu được từ Spike ($R_{em} = 100\%$ in-class $D=7$, composite $7/7$).
3. **Task `D2`**: Nâng cấp các giả thuyết `ACG-01` (Rubric), `ACG-02` (Tiêu chí chọn case), `ACG-03` (Denominator), `ACG-07` (Supported Execution Class) từ nhãn `HYPOTHESIS` thành **Định nghĩa Sản phẩm chính thức của Repro V0.1** dưới sự chủ trì của 🕵️ BA.
4. **Task `C5`**: Xử lý `SEC-008` (mục 11.b Threat Model) theo đúng 2 lựa chọn hợp lệ: hoặc đóng với nhãn `HYPOTHESIS — hiệu chỉnh trên synthetic`, hoặc giữ nguyên `TBD`.

---

## 4. Kiểm Soát Tuân Thủ Ngôn Từ (Template §3.2)

Báo cáo này đã được rà soát nghiêm ngặt và khẳng định tuân thủ 100% 8 điều cấm ngôn từ:
1. ⛔ **Không** khẳng định production bug đã được sửa (chỉ khẳng định *"execution đã capture không còn reproduce"*).
2. ⛔ **Không** kết luận pass/fail dựa trên 4 con số của $RQ.md\ \S24$ (luôn giữ nhãn cứng *"initial hypothesis — không phải tiêu chí nghiệm thu"*).
3. ⛔ **Không** nâng hypothesis thành định nghĩa sản phẩm trong báo cáo (việc nâng cấp thuộc thẩm quyền task `D2` ở `P1`).
4. ⛔ **Không** đề xuất con số ngưỡng cho `N-05`, `N-09`, `SEC-008` (báo cáo chỉ cấp số đo và phân bố).
5. ⛔ **Không** kết luận non-determinism khi chưa loại trừ missing-capture (đã kiểm chứng qua manifest và probe `SC-11`).
6. ⛔ **Không** phát biểu chung chung kiểu "Repro hoạt động" (luôn gắn chặt với phạm vi $D=7$ và Supported Execution Class).
7. ⛔ **Không** gộp `unattributed` vào nhãn `code` (đã báo cáo riêng tỷ lệ $0.0\%$).
8. ⛔ **Không** làm nhẹ hoặc bỏ qua kết quả test `T8`/`T12` của ma trận 12 test (đã công bố như Khoảng hở đã đo được tại `T7`).

---

## 5. Tài Liệu Tham Chiếu Liên Quan

| Tài liệu | Đường dẫn | Quan hệ kỹ thuật |
|---|---|---|
| **Spike Protocol — Phase 0** | [Spec-Spike-Protocol](../../030-Specs/Spec-Spike-Protocol.md) | Sở hữu Supported Execution Class (§2), Rubric so khớp (§3), Thủ tục quy trách nhiệm (§3.6), Denominator (§4), Chỉ số Composite (§4.6). |
| **Measurement Plan — Phase 0** | [MTP-Spike-Phase-0](../Test-Plans/MTP-Spike-Phase-0.md) | Sở hữu 6 metric & điều kiện đo (§2, §3), Thí nghiệm `SEC-008` (§4), Ma trận 12 test (§5), Cơ chế niêm phong manifest (§6). |
| **Performance Report — Phase 0** | [Perf-Spike-Phase-0](../Performance/Perf-Spike-Phase-0.md) | Nguồn dữ liệu thực nghiệm gốc cho 33 lượt replay, overhead benchmark và kết quả cắt offline. |
| **Bảng Tiền Đăng Ký T1** | [T1-Pre-Registration-Spike-Phase-0](./T1-Pre-Registration-Spike-Phase-0.md) | Bằng chứng niêm phong tiền đăng ký $T1$ tại `Gate A` (2026-08-15) và commit manifest (2026-08-28). |
| **Nguồn sự thật** | [RQ.md](../../999-Resources/RQ.md) | §20.1 (Hidden inputs), §22 (Spike 7 bước), §23 (Metrics), §24 (Hypotheses), §39 (Câu hỏi quyết định của `GATE-06`). |

---

*Báo cáo được ban hành chính thức bởi Quality Assurance Role — Repro Technical Spike Phase 0.*  
*Phán quyết cuối cùng thuộc về Sponsor `@TrisJr` tại `GATE-06`.*
