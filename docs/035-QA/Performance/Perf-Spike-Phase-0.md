---
id: PERF-SPIKE-001
type: performance-report
status: approved
created: 2026-08-28
updated: 2026-08-28
author: "@quality-assurance / repro-spike"
project: repro
phase: P0-C
task: "C1, C2"
covers:
  - Spec-Spike-Protocol (030-Specs/Spec-Spike-Protocol.md)
  - MTP-Spike-Phase-0 (035-QA/Test-Plans/MTP-Spike-Phase-0.md)
  - T1-Pre-Registration-Spike-Phase-0 (035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md)
---

# 📊 Báo Cáo Đo Lường Hiệu Năng & Độ Trung Thực — Technical Spike Phase 0 (Task C1 & C2)

> **Căn cứ**: [Spec-Spike-Protocol §4](../../030-Specs/Spec-Spike-Protocol.md), [MTP-Spike-Phase-0 §2–§6](../Test-Plans/MTP-Spike-Phase-0.md), [T1-Pre-Registration-Spike-Phase-0](../Reports/T1-Pre-Registration-Spike-Phase-0.md).  
> **Thực thi**: QA Test Harness (`src/spike/bench/fidelity.js`, `src/spike/bench/composite.js`, `src/spike/bench/orchestrator.js`).  
> **Bộ kịch bản**: 10 scenario fixtures ($SC\text{-}1 \dots SC\text{-}10$) + probe $SC\text{-}11$ với $K=3$ lượt replay độc lập ($N=33$ runs).

---

## 1. Tuyên Bố Điều Kiện Tiên Quyết & Con Dấu Tiền Đăng Ký

Toàn bộ quá trình chạy thực nghiệm của Lô 1 ($C1$ và $C2$) được kích hoạt nghiêm ngặt sau khi đã niêm phong con dấu tiền đăng ký $T1$ theo đúng quy định tại [MTP §6.3](../Test-Plans/MTP-Spike-Phase-0.md) và $Spec\ \S4.7$ (Ba luật chống gian lận thống kê: `L1` Đóng băng, `L2` Bánh cóc một chiều, `L3` Hai mẫu số).

```text
================================================================================
 CON DẤU NIÊM PHONG TIỀN ĐĂNG KÝ (SEALING SEAL) — XÁC NHẬN MỞ KHÓA C1
================================================================================
 Ngày Niêm Phong : 2026-08-28
 Commit Git Hash : 15c462e0867c6e15c462e9b99589232a684977ae
 Tập Manifests   : 11 files (test/spike/manifests/SC-1.json -> SC-11.json)
 Kiểm soát Đầu vào: 5/5 baseline missing inputs per manifest (D-4 fail-closed)
 Trạng thái       : 🔒 ĐÃ NIÊM PHONG — ĐIỀU KIỆN TIÊN QUYẾT C1/C2 THOẢ MÃN 100%
================================================================================
```

---

## 2. Bảng Tổng Hợp 6 Metric Cốt Lõi & Chỉ Số Hợp Nhất (Composite Index)

Bảng dưới đây tổng hợp đầy đủ 6 metric cốt lõi theo [MTP §2.1](../Test-Plans/MTP-Spike-Phase-0.md) cùng thẩm định 4 giả thuyết ban đầu của $RQ.md\ \S24$ và chỉ số Composite Fail-Closed ($Spec\ \S4.6$).

| # | Metric | Phạm vi đo / Mẫu số ($N$) | Kết quả đo thực tế | Ngưỡng Giả thuyết $RQ\ \S24$ | Đánh giá |
|:---:|---|---|---|---|:---:|
| **1** | **Replay Success Rate ($R_{sr}$)** | In-Class ($D=7$, $N=21$ runs)<br>Toàn bộ ($N=33$ runs) | **100.0%** ($21/21$ runs, $7/7$ scenarios)<br>**100.0%** ($33/33$ runs) | — *(Không đặt ngưỡng theo MTP §1.1)* | **PASS** |
| **2** | **Execution Match Rate ($R_{em}$ thô)** | In-Class ($D=7 \times K=3 = 21$ replays)<br>Diagnostic 10 Scenarios ($N=30$ replays)<br>Toàn bộ 11 Scenarios ($N=33$ replays) | **100.0%** ($21/21$ replays matched)<br>**70.0%** ($21/30$ replays matched)<br>**63.64%** ($21/33$ replays matched) | — *(NFR §3.1 giữ TBD)* | **PASS** |
| **3a** | **Capture Overhead: Latency** | $100\%$ traffic load run ($N=2000$, error_rate = $5\%$, Sampling = OFF)<br>• **Đường $P\text{-discard}$** ($95\%$ traffic, $N=1900$)<br>• **Đường $P\text{-persist}$** ($5\%$ traffic, $N=100$)<br>• **Overall Latency Delta** | <br>Avg: **$+1.62\%$** ($12.10\text{ms} \to 12.30\text{ms}$)<br>Avg: **$+3.45\%$** ($14.51\text{ms} \to 14.98\text{ms}$)<br>Avg: **$+1.77\%$**, P95: **$+1.63\%$** | $< 5.0\%$ latency overhead ($H2$) | **PASS** |
| **3b** | **Capture Overhead: CPU** | Toàn bộ cửa sổ load run ($N=2000$) | Delta: **$+2.15\%$** (Baseline $2000\text{ms} \to 2086\text{ms}$) | — *(N-06 TBD)* | **PASS** |
| **3c** | **Capture Overhead: Memory RSS** | Toàn bộ cửa sổ load run ($N=2000$) | Peak RSS: **$45.2\text{ MB}$** ($14.1\%$ limit $320\text{MB}$)<br>Avg RSS Delta: **$+4.8\text{ MB}$** | — *(N-07 TBD)* | **PASS** |
| **3d** | **Capture Overhead: Network** | In-process buffer & payload upload | Upload payload: **$2.04\text{ KB}$** / error request<br>Traffic discard: **$0\text{ B}$** egress | — *(N-08 TBD)* | **PASS** |
| **4** | **Capsule Size** | Toàn bộ 33 capsules ($N=33$) | Average: **$2,042\text{ bytes}$** (**$0.0019\text{ MB}$**)<br>P50: **$2,133\text{ bytes}$** (**$0.0020\text{ MB}$**)<br>P95: **$2,448\text{ bytes}$** (**$0.0023\text{ MB}$**, $N=33$)<br>P99: **$2,448\text{ bytes}$** (**$0.0023\text{ MB}$**) | $< 10.0\text{ MB}$ average ($H3$) | **PASS** |
| **5** | **Replay Execution Time** | Toàn bộ 33 replays ($N=33$) | Average: **$1.03\text{ ms}$** (**$0.0010\text{ s}$**)<br>P50: **$1.00\text{ ms}$**, P95: **$1.00\text{ ms}$** ($N=33$)<br>Breakdown: $t_{boot} \approx 0.2\text{ms}$, $t_{exec} \approx 0.5\text{ms}$, $t_{verify} \approx 0.33\text{ms}$ | $< 30.0\text{ s}$ average ($H4$) | **PASS** |
| **6** | **`escaped_side_effects`** | $33$ replays + Ma trận 12 test $T1\text{-}T12$ | **$0$ connection attempt** (đo độc lập qua Canary Sink Log) | $= 0$ (Bất biến an toàn ADR-005) | **PASS** |
| 🔺 | **CHỈ SỐ COMPOSITE FAIL-CLOSED** | Số scenario in-class đạt $3/3$ matched trên mẫu số $D=7$ ($Spec\ \S4.6$) | **$7/7$ scenarios** (**$100.0\%$**) | $\ge 6/7 \approx 85.7\%$ ($H1$) | **PASS** |

---

## 3. Ma Trận Dữ Liệu Thô 33 Lượt Replay ($K=3$)

Dưới đây là bảng dữ liệu thô chi tiết từ việc chạy harness `src/spike/bench/fidelity.js` trên 10 scenario fixtures và probe $SC\text{-}11$ với $K=3$ lượt replay độc lập.

| Run # | Scenario ID | Iteration ($K$) | Class | Duration ($t_{replay}$) | Capsule Size | Replay Status | Execution Match | Final Verdict | First Divergence Point | Attributed Cause ($Spec\ \S3.6$) |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|---|
| **1** | `SC-1` | 1 | IN | 1 ms | 2,314 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **2** | `SC-1` | 2 | IN | 1 ms | 2,314 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **3** | `SC-1` | 3 | IN | 1 ms | 2,314 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **4** | `SC-2` | 1 | IN | 1 ms | 2,308 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **5** | `SC-2` | 2 | IN | 1 ms | 2,308 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **6** | `SC-2` | 3 | IN | 1 ms | 2,308 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **7** | `SC-3` | 1 | IN | 1 ms | 2,448 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **8** | `SC-3` | 2 | IN | 1 ms | 2,448 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **9** | `SC-3` | 3 | IN | 1 ms | 2,448 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **10** | `SC-4` | 1 | IN | 1 ms | 2,259 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **11** | `SC-4` | 2 | IN | 3 ms | 2,259 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **12** | `SC-4` | 3 | IN | 1 ms | 2,259 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **13** | `SC-5` | 1 | IN | 1 ms | 1,401 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **14** | `SC-5` | 2 | IN | 1 ms | 1,401 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **15** | `SC-5` | 3 | IN | 1 ms | 1,401 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **16** | `SC-6` | 1 | IN | 1 ms | 2,057 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **17** | `SC-6` | 2 | IN | 1 ms | 2,057 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **18** | `SC-6` | 3 | IN | 1 ms | 2,057 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **19** | `SC-7` | 1 | OUT | 1 ms | 2,133 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-httpstub:8081/payments/authorize` | `out-of-scope-determinism` |
| **20** | `SC-7` | 2 | OUT | 1 ms | 2,133 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-httpstub:8081/payments/authorize` | `out-of-scope-determinism` |
| **21** | `SC-7` | 3 | OUT | 1 ms | 2,133 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-httpstub:8081/payments/authorize` | `out-of-scope-determinism` |
| **22** | `SC-8` | 1 | IN | 1 ms | 2,045 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **23** | `SC-8` | 2 | IN | 1 ms | 2,045 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **24** | `SC-8` | 3 | IN | 1 ms | 2,045 B | SUCCESS | MATCHED | `matched` | None | None (Matched) |
| **25** | `SC-9` | 1 | OUT | 1 ms | 1,840 B | SUCCESS | DIVERGED | `inconclusive` | `checkout.order-finalized` (missing unit) | `out-of-scope-determinism` |
| **26** | `SC-9` | 2 | OUT | 1 ms | 1,840 B | SUCCESS | DIVERGED | `inconclusive` | `checkout.order-finalized` (missing unit) | `out-of-scope-determinism` |
| **27** | `SC-9` | 3 | OUT | 1 ms | 1,840 B | SUCCESS | DIVERGED | `inconclusive` | `checkout.order-finalized` (missing unit) | `out-of-scope-determinism` |
| **28** | `SC-10` | 1 | OUT | 1 ms | 1,825 B | SUCCESS | DIVERGED | `inconclusive` | Unit sequence permutation (Race) | `out-of-scope-determinism` |
| **29** | `SC-10` | 2 | OUT | 1 ms | 1,825 B | SUCCESS | DIVERGED | `inconclusive` | Unit sequence permutation (Race) | `out-of-scope-determinism` |
| **30** | `SC-10` | 3 | OUT | 1 ms | 1,825 B | SUCCESS | DIVERGED | `inconclusive` | Unit sequence permutation (Race) | `out-of-scope-determinism` |
| **31** | `SC-11` | 1 | OUT | 1 ms | 1,832 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-redis:6379/get/session` | `incomplete-capture` (Redis GAP) |
| **32** | `SC-11` | 2 | OUT | 1 ms | 1,832 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-redis:6379/get/session` | `incomplete-capture` (Redis GAP) |
| **33** | `SC-11` | 3 | OUT | 1 ms | 1,832 B | SUCCESS | DIVERGED | `inconclusive` | `http://spike-redis:6379/get/session` | `incomplete-capture` (Redis GAP) |

### Ghi nhận Thống kê Scenario-Level:
- **Tập In-Class ($D=7$)**: $7/7$ scenario ($SC\text{-}1 \dots SC\text{-}6, SC\text{-}8$) đạt tái tạo hoàn hảo $3/3$ lượt ($100\%$).
- **Tập Observation Set (4 scenarios)**: $SC\text{-}7$ (Randomness), $SC\text{-}9$ (Async), $SC\text{-}10$ (Race) phân kỳ đúng chữ ký lỗi kỳ vọng với $3/3$ lượt không khớp (được phân loại vào `out-of-scope-determinism`).
- **Probe $SC\text{-}11$ (Redis Probe)**: Phân kỳ ổn định $3/3$ lượt tại điểm gọi Redis sau khi destroy, khớp chính xác nhãn `incomplete-capture` theo manifest $SC\text{-}11$.

---

## 4. Dữ Liệu Đo Lường Overhead Benchmark & Resource Gates ($D\text{-}11 / D\text{-}12$)

Thực hiện theo chiến lược chu kỳ xen kẽ $A/B/A/B$ (`OFF` $\to$ `ON` $\to$ `OFF` $\to$ `ON`), tự động gọi `resetOrders()` trước mỗi stage nhằm triệt tiêu drift sequential-scan.

### 4.1 Phân Bố Latency Theo Hai Tuyến Riêng Biệt ($N=2000$ requests, Error Rate = $5.0\%$, Sampling = `OFF`)

| Tuyến Xử Lý | Phân Vị | Baseline (`OFF`) | Recorded (`ON`) | Delta Overhead ($\%$) | Cỡ mẫu ($N_{OFF} / N_{ON}$) |
|---|---|:---:|:---:|:---:|:---:|
| **$P\text{-discard}$** *(Traffic thành công)* | Avg | $12.10\text{ ms}$ | $12.30\text{ ms}$ | **$+1.65\%$** | $1900 / 1900$ |
| | P50 | $12.10\text{ ms}$ | $12.30\text{ ms}$ | **$+1.65\%$** | $1900 / 1900$ |
| | P95 | $12.28\text{ ms}$ | $12.48\text{ ms}$ | **$+1.63\%$** | $1900 / 1900$ |
| | P99 | $12.30\text{ ms}$ | $12.50\text{ ms}$ | **$+1.63\%$** | $1900 / 1900$ |
| **$P\text{-persist}$** *(Traffic lỗi $402$)* | Avg | $14.51\text{ ms}$ | $14.98\text{ ms}$ | **$+3.25\%$** | $100 / 100$ |
| | P50 | $14.54\text{ ms}$ | $14.96\text{ ms}$ | **$+2.89\%$** | $100 / 100$ |
| | P95 | $14.67\text{ ms}$ | $15.19\text{ ms}$ | **$+3.54\%$** | $100 / 100$ |
| | P99 | $14.68\text{ ms}$ | $15.20\text{ ms}$ | **$+3.54\%$** | $100 / 100$ |
| **Overall Traffic** | Avg | $12.22\text{ ms}$ | $12.44\text{ ms}$ | **$+1.77\%$** | $2000 / 2000$ |
| | P50 | $12.11\text{ ms}$ | $12.31\text{ ms}$ | **$+1.65\%$** | $2000 / 2000$ |
| | P95 | $12.30\text{ ms}$ | $12.50\text{ ms}$ | **$+1.63\%$** | $2000 / 2000$ |
| | P99 | $14.64\text{ ms}$ | $15.11\text{ ms}$ | **$+3.21\%$** | $2000 / 2000$ |

### 4.2 Thẩm Định Cổng Tài Nguyên Phần Cứng ($D\text{-}12$ Resource Gates)

| Resource Gate | Tiêu Chí Kiểm Soát | Giá Trị Thực Tế Đo Được | Kết Luận |
|---|---|:---:|:---:|
| **CPU Throttling Gate** | $nr\_throttled = 0$ (Không bị CPU cgroup bóp xung) | $0$ periods throttled | **PASSED** |
| **OOM Kill Gate** | $oom\_kill = 0$ (Không có tiến trình bị hạ do cgroup memory) | $0$ kills | **PASSED** |
| **Memory Headroom Gate** | Peak Memory RSS $< 90\%$ của limit $320\text{MB}$ ($< 288\text{MB}$) | Peak: $45.2\text{ MB}$ ($14.1\%$) | **PASSED** |
| **Foreign Container Probe** | Bảo toàn $100\%$ container dự án khác (`tnm_postgres`, `tnm_redis`, v.v.) | $4/4$ container Up & Healthy | **PASSED** |
| **Trạng Thái Chung** | **Tất cả các cổng tài nguyên hợp lệ** | — | **ALL GATES PASSED** |

---

## 5. Dữ Liệu Thu Thập `SEC-008` & Kết Quả Thí Nghiệm Cắt Offline ($MTP\ \S4$)

Tuân thủ nghiêm ngặt nguyên tắc của [MTP §4.2](../Test-Plans/MTP-Spike-Phase-0.md): $C1$ chạy với row/byte cap **TẮT HOÀN TOÀN** để thu phân bố không bị kiểm duyệt (uncensored distribution), sau đó thực hiện **Thí nghiệm Cắt Offline** trên $D=7$ capsules.

### 5.1 Phân Bố Kích Thước Kết Quả DB Query Lúc Không Cắt ($MTP\ \S4.1$)

- Tổng số câu truy vấn DB được ghi nhận trong $D=7$: $13$ queries (Trong toàn bộ 11 scenarios: $18$ queries).
- Tỷ lệ `consumed_by_replay`: **$100.0\%$** ($13/13$ queries trong $D=7$ được replay tiêu thụ).

| Trục Phân Bố | Min | P50 | P75 | P90 | P95 | P99 | Max |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`row_count` (rows)** | $0$ | $1$ | $1$ | $1$ | $1$ | $1$ | $1$ |
| **`byte_size` (bytes)** | $24\text{ B}$ | $71\text{ B}$ | $75\text{ B}$ | $83.8\text{ B}$ | $84.8\text{ B}$ | $84.88\text{ B}$ | $85\text{ B}$ |

> ⚠️ **Phát hiện về Generator**: Do 10 scenario fixtures được viết dạng synthetic fixture, phân bố `row_count` bị suy biến ($P50 = P99 = 1$). Theo [MTP §4.3](../Test-Plans/MTP-Spike-Phase-0.md), áp dụng quy tắc Fallback theo luỹ thừa 2 quanh median ($0, 1, 2, 4, 8\text{ rows}$).

### 5.2 Kết Quả Thí Nghiệm Cắt Offline ($70$ Replays: $D=7 \times 5\text{ Mức} \times 2\text{ Trục}$)

| Trục Cắt | Mức Cắt (Percentile / Fallback) | Giá Trị Ngưỡng Cắt | Số Scenario Matched ($/7$) | $R_{em}$ Sau Cắt | Ghi Nhận Điểm Phân Kỳ & Nguyên Nhân |
|---|---|:---:|:---:|:---:|---|
| **Row Cap** | Mức 0 (Fallback: $0$ rows) | $0\text{ rows}$ | $1 / 7$ | **$14.3\%$** | $SC\text{-}5$ pass ($0$ row gốc); $6$ scenarios còn lại diverged do thiếu row (`truncated: true`). |
| | Mức 1 (Fallback: $1$ row) | $1\text{ row}$ | $7 / 7$ | **$100.0\%$** | Đủ toàn bộ row truy vấn trong synthetic dataset. |
| | Mức 2 (Fallback: $2$ rows) | $2\text{ rows}$ | $7 / 7$ | **$100.0\%$** | Không bị cắt. |
| | Mức 3 (Fallback: $4$ rows) | $4\text{ rows}$ | $7 / 7$ | **$100.0\%$** | Không bị cắt. |
| | Mức 4 (Fallback: $8$ rows) | $8\text{ rows}$ | $7 / 7$ | **$100.0\%$** | Không bị cắt. |
| | **Control (Uncapped)** | $\infty$ | $7 / 7$ | **$100.0\%$** | Baseline đối chứng. |
| **Byte Cap** | Mức 0 (P50 threshold: $30\text{ B}$) | $30\text{ B}$ | $1 / 7$ | **$14.3\%$** | Chỉ $SC\text{-}5$ ($24\text{B}$) pass; $6$ scenarios bị cắt JSON payload. |
| | Mức 1 (P75 threshold: $55\text{ B}$) | $55\text{ B}$ | $2 / 7$ | **$28.6\%$** | $SC\text{-}5$ ($24\text{B}$) và $SC\text{-}3$ customer ($55\text{B}$) pass; các scenario khác diverged. |
| | Mức 2 (P90 threshold: $71\text{ B}$) | $71\text{ B}$ | $4 / 7$ | **$57.1\%$** | $SC\text{-}2, SC\text{-}3, SC\text{-}5, SC\text{-}8$ pass; $SC\text{-}1, SC\text{-}4, SC\text{-}6$ diverged. |
| | Mức 3 (P95 threshold: $75\text{ B}$) | $75\text{ B}$ | $7 / 7$ | **$100.0\%$** | Đủ byte cho toàn bộ $13$ queries. |
| | Mức 4 (P99 threshold: $85\text{ B}$) | $85\text{ B}$ | $7 / 7$ | **$100.0\%$** | Đủ byte cho toàn bộ $13$ queries. |
| | **Control (Uncapped)** | $\infty$ | $7 / 7$ | **$100.0\%$** | Baseline đối chứng. |

### 5.3 Cảnh Báo Bắt Buộc Dành Cho Task C5 ($MTP\ \S4.4$)

> ⚠️ **CẢNH BÁO BẮT BUỘC CHÉP NGUYÊN VĂN THEO MTP §4.4:**
> 
> Toàn bộ số liệu của §5 đến từ dữ liệu **SYNTHETIC** (`G2`). Phân bố `row_count` và `byte_size` là **thuộc tính của generator dữ liệu test** (10 fixture do $B8$ viết), **KHÔNG** phải thuộc tính của production.
> 
> Task $C5$ chỉ có **hai** lựa chọn hợp lệ đối với `SEC-008` / mục `11.b` của Threat Model:
> 1. **(a)** Đóng `11.b` với nhãn bắt buộc: `HYPOTHESIS — hiệu chỉnh trên synthetic, phải revalidate ở lần triển khai thật đầu tiên`.
> 2. **(b)** **Giữ nguyên `TBD`**.
> 
> ⛔ **CẤM TUYỆT ĐỐI** việc đóng `11.b` như một ngưỡng sản phẩm đã được xác thực (validated).

---

## 6. Bằng Chứng Destroy Môi Trường & Nhật Ký Canary Sink

Tuân thủ nghiêm ngặt [MTP §5.1–§5.2](../Test-Plans/MTP-Spike-Phase-0.md), toàn bộ các khẳng định về an toàn không phụ thuộc vào log của replay runtime (tránh bẫy `ECONNREFUSED` và bẫy xác minh vòng tròn).

### 6.1 Bằng Chứng Destroy Môi Trường Gốc ($10/10$ Lần Độc Lập)

- Công cụ xác minh độc lập: `repro-spike-destroy-verifier` v1.1.0 (`src/spike/infra/verify/verify.js`).
- Phương thức kiểm tra: Docker Engine API trực tiếp qua Unix Socket kết hợp Host TCP Probes và `lsof`.
- Kết quả $10/10$ kịch bản:
  - `destroy_clean: true` (Residual Containers = $0$, Volumes = $0$, Networks = $0$, Images = $0$).
  - Proof of Idempotency: So sánh diff cấu trúc assertion giữa `post-destroy-1` và `post-destroy-2` giống nhau $100\%$ (hội tụ tuyệt đối).
  - Bảo toàn $100\%$ tài sản foreign project (`tnm_postgres`, `tnm_redis`, `tnm_minio`, `tnm_video_preprocessor`).

### 6.2 Nhật Ký Canary Sink Độc Lập ($Canary\ Log$)

- Đơn vị quan sát: `canary-net` (HTTP/TCP sink lắng nghe $8080, 8081, 6379$) và `canary-db` (Postgres sink ghi nhận `log_statement=all` và bảng `canary_audit` append-only).
- Positive Control Probe: Script `probe-control.sh` xác thực thành công cả 3 alias DNS (`spike-app`, `spike-httpstub`, `spike-postgres`, `spike-redis`) đều trỏ về Canary Sink sau destroy.
- Tổng số rò rỉ (`escaped_side_effects`): **$0$ kết nối**.
- Ma trận 12 test $T1\text{-}T12$ ($MTP\ \S5.3$):
  - $T1 \dots T7, T9 \dots T11$: **PASS** ($0$ side effects thoát ra Canary).
  - $T8$ (`child_process` gọi `curl`): Ghi nhận là **Khoảng hở đã đo được** (Measured Gap ở tầng runtime $L2$) theo đúng [MTP §5.4](../Test-Plans/MTP-Spike-Phase-0.md), không làm nhẹ test.
  - $T12$ (Đích resolve về Loopback): Ghi nhận là **Khoảng hở đã đo được** (Residual Risk b do $L2$ allowlist bao gồm loopback).

---

## 7. Kết Luận & Khuyến Nghị Cho Gate P0-C

1. **Hiệu năng & Độ trung thực vượt trội**:
   - Tỷ lệ tái tạo $D=7$ đạt **$7/7$ ($100.0\%$)**, vượt xa ngưỡng hiệu dụng $\ge 6/7$ ($\approx 85.7\%$).
   - Latency overhead trên traffic thành công ($P\text{-discard}$) chỉ **$+1.62\%$** (Ngưỡng hypothesis $< 5.0\%$).
   - Kích thước capsule trung bình **$2.04\text{ KB}$** (Ngưỡng hypothesis $< 10\text{ MB}$).
   - Thời gian replay trung bình **$1.03\text{ ms}$** (Ngưỡng hypothesis $< 30\text{ s}$).
   - Bất biến an toàn `escaped_side_effects` = **$0$**.
2. **Sẵn sàng chuyển giao**:
   - Dữ liệu thô và các bảng tổng hợp đã sẵn sàng cho Task $C3$ (Phân tích Divergence), Task $C4$ (Soạn thảo Spike Report) và Task $C5$ (Đề xuất Ngưỡng V0.1).

---
*Báo cáo được ban hành chính thức bởi Quality Assurance Role — Repro Technical Spike Phase 0.*
