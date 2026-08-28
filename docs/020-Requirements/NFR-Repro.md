---
id: NFR-001
type: nfr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-28
---

# 📐 NFR — Repro

**Nguồn sự thật duy nhất**: `docs/999-Resources/RQ.md`. Mọi khẳng định kèm số hiệu section (`§N`). Không có căn cứ ⇒ ghi `TBD`, không suy đoán.
**Tài liệu cha**: [PRD-Repro](./PRD-Repro.md).

---

## 1. Cách đọc tài liệu này

> ⚠️ **CẢNH BÁO — đọc trước khi dùng bất kỳ con số nào dưới đây.**
>
> Bốn ngưỡng của `RQ.md` §24 (`≥ 80%` reproduced, `< 5%` latency overhead, `< 10 MB` average capsule size, `< 30 seconds` replay time) là **initial hypotheses của một technical spike**, **KHÔNG** phải cam kết sản phẩm.
>
> `RQ.md` §24 tự nói điều đó, trích **nguyên văn**:
>
> > **These numbers should be treated as initial hypotheses, not final product commitments.**
>
> Và §22–§23 định vị chúng là metric của **technical spike** — thứ chạy **trước** khi xây MVP (§39) — chứ không phải chỉ tiêu nghiệm thu của sản phẩm.

> ✅ **`CHỐT GATE-01 — 2026-08-14`: Phase 0 technical spike = `Go`.** Trước quyết định này, *"spike chạy trước khi xây MVP"* là **khuyến nghị** đọc ra từ §39. Nay đó là **quyết định đã ghi** của anh, và spike được coi là **điều kiện đầu tư** chứ không phải một task. `Sponsor` = **`@TrisJr`** · `Manager` = **`@TrisJr`** · Owner của **18/18 risk** = **`@TrisJr`**. Xem [PRD-Repro](./PRD-Repro.md) mục 8.4 và [Roadmap](../010-Planning/Roadmap.md) Phase 0.
>
> ⚠️ **Cảnh báo ở trên KHÔNG bị quyết định này làm nhẹ đi.** `GATE-01` bật **việc chạy spike**; nó **không** đặt ngưỡng nghiệm thu nào, **không** biến `N-01`…`N-04` thành acceptance criteria, và **không** đặt ngưỡng cho `N-05`…`N-09` (mục 3). Bốn con số §24 vẫn là **hypothesis**.
>
> ⚠️ **`GATE-01-r`**: `Go` **không tự làm cho spike đo được**. `ACG-01`, `ACG-02`, `ACG-03`, `ACG-07` (mục 7) vẫn hở — không có denominator, không có định nghĩa *"reproduced"*, không có tiêu chí chọn test case, không có *"Supported Execution Class"*. Rủi ro tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2.

**Hệ quả vận hành**:

- **Không** dùng `N-01`…`N-04` làm acceptance criteria của bất kỳ user story, sprint hay release nào.
- **Không** đưa chúng vào hợp đồng, SLA, hay tài liệu bán hàng.
- Chúng chỉ dùng đúng một việc: **quyết định có tiếp tục xây sản phẩm hay không** sau technical spike §22. §24 nêu điều kiện dừng: *"If the spike cannot achieve a useful replay rate on a meaningful class of bugs, the product concept should be reconsidered before building the full platform."*

> ✅ **`CHỐT GATE-02 — 2026-08-14`: ràng buộc thứ nhất ở trên nay là GUARDRAIL CHÍNH THỨC.** Anh đã chốt **spike trước, Epic/Story sau** — hoãn phân rã Epic/Story tới **sau khi Phase 0 đóng gate**, vì acceptance criteria dựa trên *"execution matched"* hiện **chưa kiểm chứng được**.
>
> ⇒ Khi việc phân rã được mở lại, ràng buộc *"không dùng `N-01`…`N-04` làm acceptance criteria"* **áp bắt buộc** cho mọi user story, không còn là khuyến nghị đọc-ra-từ-§24. Cùng với nó: **không** dùng bốn ngưỡng §24 làm Definition of Done, và **không** viết AC dạng *"execution matched"* trước khi `ACG-01` có định nghĩa (mục 7).
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` là Goals của V0.1 ở [PRD-Repro](./PRD-Repro.md) mục 2.2.

**Bản đồ tài liệu**:

| Mục | Chứa gì | Có ngưỡng số? |
|---|---|---|
| 2 | `N-01`…`N-04` — ngưỡng validation của spike (§24) | Có, nhưng là *hypothesis* |
| 3 | `N-05`…`N-09` — metric §23 **bị yêu cầu đo nhưng không có ngưỡng** | Không — `TBD` |
| 4 | `N-10`…`N-19` — ràng buộc phi chức năng **định tính** | Không đo bằng số |
| 5 | Yêu cầu bảo mật — chỉ nêu 4 thay đổi mặc định, link Security Spec | Không |
| 6 | Năm con số trong `RQ.md` **KHÔNG phải NFR** | — |
| 7 | `ACG-01`…`ACG-12` — acceptance criteria gaps | — |

---

## 2. Ngưỡng validation cho technical spike

Nguồn: `RQ.md` §24 (*"Proposed Initial Success Threshold"*), đo bằng metric §23, trên test app và 10 scenario của §22.

> **Trạng thái của spike: `Go`** — `✅ CHỐT GATE-01 — 2026-08-14` (mục 1). Bốn ngưỡng dưới đây vì thế **sắp được đo thật**, không còn là bài tập giấy. Nhưng chúng **vẫn là hypothesis**: `GATE-01` bật spike, **không** chốt ngưỡng. Hai chỗ hở của `N-01` (2.1) và các chỗ hở của `N-02`/`N-04` **chưa được quyết định nào lấp** ⇒ đúng nội dung của `GATE-01-r`.

| ID | Ngưỡng §24 | Metric §23 tương ứng | Trạng thái |
|---|---|---|---|
| `N-01` | `≥ 80%` meaningful deterministic test cases reproduced | Replay Success Rate | ⚠️ **Hai chỗ hở — xem 2.1** |
| `N-02` | `< 5%` production latency overhead | Capture Overhead (Latency) | ⚠️ Xem 2.2 |
| `N-03` | `< 10 MB` **average** capsule size | Capsule Size (Average) | Có ngưỡng — P95 xem `N-09` |
| `N-04` | `< 30 seconds` replay time | Replay Time | ⚠️ Xem 2.4 |

### 2.1 `N-01` — hai chỗ hở phải khai, không được lấp

**(a) Denominator chưa xác định.**

§22 đưa ra **10 test scenario**:

```text
1. Database state causes bug        6. Dependency/version difference
2. External API response causes bug 7. Randomness
3. Feature flag causes bug          8. Side effect
4. Time-dependent bug               9. Async behavior
5. Missing data                     10. Race condition
```

Nhưng cùng tài liệu đã **hoãn** một phần trong số đó:

- §20.2 (*Non-Determinism*) hoãn *"complex scheduler/race-condition replay"* ⇒ chạm scenario **7 (Randomness)** và **10 (Race condition)**.
- §20.13 (*Race Conditions — Critical but Out of Scope*) hoãn tường minh ⇒ scenario **10**.
- §19 Non-Goals liệt kê *"Distributed race-condition replay"* ⇒ scenario **10**; và §20.13 nói *"Future versions may use distributed tracing, event ordering and scheduling information"* ⇒ chạm scenario **9 (Async behavior)**.

⇒ **`≥ 80%` là 80% trên 10 scenario hay trên 7 scenario (loại 7/9/10)?** Hai cách đọc cho hai ngưỡng hoàn toàn khác nhau: 8/10 so với 6/7. `RQ.md` không nói.

**Chưa giải được vì**: cụm khoá của §24 là *"meaningful deterministic test cases"*, mà *"meaningful"* và *"deterministic class"* chính là thứ `ACG-07` chỉ ra là **chưa hề được định nghĩa** (§20.1). Không có "Supported Execution Class" thì không có denominator.

**Trạng thái: `TBD`. Chặn: nghiệm thu technical spike §22, và cả `VH-1` của [PRD-Repro](./PRD-Repro.md) mục 9.**

**(b) "Reproduced" chưa rõ nghĩa.**

§23 định nghĩa **hai** chỉ số khác nhau:

```text
Replay Success Rate  = Successfully reproduced / Total test cases
Execution Match Rate = Equivalent executions   / Total replays
```

§24 chỉ nói *"reproduced"* — không nói đó là **replay success** (replay chạy xong và bug xuất hiện lại) hay **execution match** (execution đi đúng cùng đường).

Đây **không phải** chuyện chữ nghĩa. §10 và §20.3 dành nguyên hai section để cảnh báo rằng *"Replay completed"* khác *"Execution matched"*, và rằng nhầm hai thứ này tạo **false confidence**. Một ngưỡng `≥ 80%` không nói rõ nó đo cái nào thì chính nó đang mắc đúng lỗi mà §20.3 cảnh báo.

**Phương án đề xuất (cần validate qua spike §22)**: đo **cả hai**, và ngưỡng `≥ 80%` áp cho **Execution Match Rate** — vì đó là chỉ số phản ánh giá trị thật của sản phẩm theo §10. Nhưng phương án này **phụ thuộc `ACG-01`** (định nghĩa *"sufficiently equivalent"*), nên chưa áp dụng được.

**Trạng thái: `TBD`.**

### 2.2 `N-02` — `< 5%` production latency overhead

Có ngưỡng, nhưng thiếu định nghĩa đo: percentile nào (average? P95? P99?), baseline nào, và **áp cho bao nhiêu phần trăm traffic**.

Điểm cuối là chỗ nặng nhất: §20.7 nói *"capture only failed/high-value executions"*, nhưng một execution chỉ **được biết là failed sau khi nó kết thúc** ⇒ hệ thống buộc phải buffer **mọi** execution rồi huỷ khi thành công ⇒ ngân sách `< 5%` thực chất áp lên **100% traffic**, không phải lên vài request lỗi. `RQ.md` không thừa nhận điểm này.

Chi tiết ở `ACG-04`.

### 2.3 `N-03` — `< 10 MB` average capsule size

Ngưỡng này **có** trong §24 và áp cho **average**. Chưa nói trước hay sau compression (§20.12), trước hay sau redaction (§16). Xem `ACG-11`. Cho **P95**, xem `N-09`.

### 2.4 `N-04` — `< 30 seconds` replay time

§23 định nghĩa Replay Time là *"Time from `repro replay` to execution result"*. Chưa rõ có tính `repro pull` (§8 Step 2 là lệnh riêng) và thời gian boot ứng dụng local hay không. Xem `ACG-05`.

---

## 3. Metric §23 yêu cầu đo nhưng KHÔNG có ngưỡng

§23 liệt kê 5 nhóm metric mà technical spike **phải đo**. Đối chiếu với §24 lộ ra 5 chỉ số **được yêu cầu đo mà không có ngưỡng nào**.

| ID | Metric | §23 yêu cầu đo | §24 đặt ngưỡng | Ngưỡng cam kết V0.1 | Kết quả thực nghiệm Phase 0 (Task C1–C4) |
|---|---|---|---|---|---|
| `N-05` | **Execution Match Rate** = `Equivalent executions / Total replays` — 🔺 **chỉ số thành công chính của V0.1** | ✅ | ❌ | **`TBD`** — chờ chốt tại `D1` sau `GATE-06` | • **In-Class ($D=7$): `21/21 = 100.0%`** ($7/7$ scenarios matched $K=3$)<br>• **Composite Fail-Closed: `7/7` ($100.0\%$)**<br>• Toàn bộ 11 scenarios: `21/33 = 63.64%` |
| `N-06` | Capture Overhead — **CPU** | ✅ | ❌ | **`TBD`** | Delta: **`+2.15% CPU`** ($2,086\text{ CPU-s}$ vs Baseline $2,000\text{ CPU-s}$, $N=2000$) |
| `N-07` | Capture Overhead — **Memory** | ✅ | ❌ | **`TBD`** | • Peak RSS: **`45.2 MB RSS`** ($14.1\%$ limit $320\text{MB}$)<br>• Avg RSS Delta: **`+4.8 MB RSS`** ($N=2000$) |
| `N-08` | Capture Overhead — **Network** | ✅ | ❌ | **`TBD`** | • Upload payload ($P\text{-persist}$): **`2.04 KB`** / error request<br>• Traffic discard ($P\text{-discard}$): **`0 B`** egress |
| `N-09` | **P95 capsule size** | ✅ | ❌ (§24 chỉ có average) | **`TBD`** | • **`P95 = 2,448 bytes`** ($N=33$)<br>• Average: **`2,042 bytes`** ($0.0019\text{ MB}$)<br>• P50: `2,133 B`, P99: `2,448 B` ($P\text{-persisted}$) |
### 3.1 `N-05` — Execution Match Rate: chỗ hở nghiêm trọng nhất của **cả tài liệu**

> ✅ **Nâng mức nghiêm trọng — hệ quả của M1 đã chốt 2026-08-14.** Anh đã chốt giữ regression test generation ở **V0.2** (§26) và lấy **số bug đạt trạng thái `Execution matched`** (§10) làm **metric chính thức của V0.1**, còn North Star §31 là metric dài hạn kích hoạt từ V0.2. Xem [PRD-Repro](./PRD-Repro.md) mục 8.2 và 10.4.
>
> ⇒ `N-05` **không còn là "một trong năm metric không có ngưỡng"**. Nó là **chỉ số thành công chính của V0.1**, mà §24 vẫn không đặt ngưỡng cho nó.

Đặt cạnh nhau ba dữ kiện của cùng một tài liệu:

1. §20.3 (*Replay Without True Equivalence*) được xếp **🔴 Critical**, và §21 gọi nó là *"False replay equivalence"*, `MVP? = Yes`, mitigation = **Execution verification**.
2. §10 dành nguyên một section để nói Repro **phải** phân biệt *"Replay completed"* với *"Execution matched"* — *"This prevents a dangerous situation where Repro says replay succeeded even though the application did not actually follow the same execution path."*
3. §23 yêu cầu đo **Execution Match Rate** — chính là chỉ số định lượng của điều (1) và (2).

Nhưng §24 **không đặt ngưỡng nào cho chỉ số này**.

⇒ **Risk 🔴 Critical số ba của sản phẩm có mitigation, mitigation đó có chỉ số đo, và chỉ số đó không có ngưỡng đạt/không đạt.** Nói cách khác: spike có thể chạy xong, báo cáo đầy đủ số liệu, mà **không ai kết luận được là đạt hay không**.

**Và kể từ M1 (2026-08-14), dữ kiện thứ tư làm việc này nặng hơn hẳn**: chính chỉ số này được chọn làm **thước đo thành công của V0.1**. Trước quyết định, thiếu ngưỡng chỉ làm hụt một dòng trong báo cáo spike. Sau quyết định, thiếu ngưỡng nghĩa là **V0.1 không có tiêu chí pass/fail cho chính nó** — không trả lời được câu *"bao nhiêu bug đạt `Execution matched` thì đủ để nói MVP thành công"*, và do đó **không kết luận được §39/§24 có cho phép đi tiếp hay không**.

Việc này còn chồng lên `ACG-01`: kể cả có ngưỡng, chỉ số vẫn không tính được nếu *"sufficiently equivalent"* chưa có định nghĩa. Hai khoảng hở này **cộng dồn**, không thay thế nhau: `ACG-01` chặn việc **tính** chỉ số, thiếu ngưỡng chặn việc **kết luận** từ chỉ số.

**Phương án đề xuất (cần validate qua spike §22)**: coi Execution Match Rate là **chỉ số chính** của `N-01` (xem 2.1b) và đặt ngưỡng cho nó **sau** khi spike cho biết phân bố thực tế. **Không đặt số ngay bây giờ** — một ngưỡng bịa ra ở đây sẽ được đọc như đã cân nhắc. Trạng thái ngưỡng vẫn là **`TBD`**; đây là khoảng hở **đã biết và đang mở**, không phải thứ quyết định M1 lấp giúp.

**Chặn**: `ADR-006` (Execution verification), nghiệm thu spike §22, và — nghiêm trọng nhất — **tiêu chí thành công của V0.1** ở [PRD-Repro](./PRD-Repro.md) mục 8.2.

> ⚠️ **`N-05` VẪN LÀ `TBD` CHO NGƯỠNG CAM KẾT V0.1 — Đọc kỹ chỗ này.**
> 
> **Kết quả thực nghiệm Phase 0 đo được tại Technical Spike (Task `C1`–`C4` / [Report-Spike-Phase-0](../035-QA/Reports/Report-Spike-Phase-0.md)):**
> - **Tập In-Class ($D = 7$, $K = 3$)**: **`21/21 = 100.0%`** ($7/7$ scenarios đạt `matched` ở cả $K=3$ lượt replay độc lập, không có ngoại lệ).
> - 🔺 **Chỉ số Composite Fail-Closed** ($Spec\ \S4.6$): **`7/7` scenarios ($100.0\%$)**, vượt xa ngưỡng hiệu dụng $\ge 6/7$ của hypothesis §24.
> - **Toàn bộ 11 scenarios ($N = 33$ replays)**: **`21/33 = 63.64%`** ($3$ scenarios observation set `SC-7`, `SC-9`, `SC-10` phân kỳ đúng chữ ký lỗi kỳ vọng vào `out-of-scope-determinism`; probe `SC-11` phân kỳ đúng điểm gọi Redis vào `incomplete-capture`).
>
> | Mục | Trạng thái sau Phase P0-C | Ghi chú & Kế hoạch |
> |---|---|---|
> | Số đo thực tế Phase 0 | **`21/21 = 100.0%`** (In-Class $D=7$) · Composite **`7/7`** | Ghi nhận từ [Report-Spike-Phase-0.md](../035-QA/Reports/Report-Spike-Phase-0.md) Bảng T2 |
> | Ngưỡng cam kết sản phẩm V0.1 | **`TBD`** — owner **`@TrisJr`** | Điều kiện đóng: **Chốt tại Task `D1` trong Phase `P1` sau khi `GATE-06` được duyệt** (tuân thủ nguyên tắc Spec §1.3) |
> | `ACG-01` (*sufficiently equivalent*) | **Đã có Rubric 2 tầng ở dạng `HYPOTHESIS`** | Kiểm chứng qua Phase 0 ($100\%$ matched trên $D=7$), sẽ nâng cấp thành Product Definition tại `D2` ở `P1` |
>
> ⇒ **Nguyên tắc bất biến**: Số đo thực tế đã có, nhưng **ngưỡng cam kết sản phẩm V0.1 giữ nguyên `TBD`** cho tới khi Sponsor `@TrisJr` phê duyệt tại `D1`.
### 3.2 `N-06`, `N-07`, `N-08` — CPU / Memory / Network overhead

§20.7 nói tường minh instrumentation có thể làm tăng **latency, CPU usage, memory usage, network traffic** — bốn thứ. §23 yêu cầu đo cả bốn. §24 đặt ngưỡng cho **đúng một** (latency, `N-02`).

**Kết quả đo lường thực nghiệm Phase 0 (Task `C1`–`C4` / [Perf-Spike-Phase-0.md](../035-QA/Performance/Perf-Spike-Phase-0.md)):**

| ID | Trục Overhead | Số đo thực tế Phase 0 | Điều kiện đo chuẩn hóa ([MTP-Spike-Phase-0 §3.2](../035-QA/Test-Plans/MTP-Spike-Phase-0.md)) | Trạng thái ngưỡng V0.1 |
|---|---|---|---|:---:|
| **`N-06`** | **CPU Overhead** | Delta: **`+2.15% CPU`**<br>(Tổng CPU time: $2,086\text{ CPU-s}$ vs Baseline $2,000\text{ CPU-s}$) | Chu kỳ lấy mẫu 1s; cửa sổ load run $N = 2000$ requests; error_rate = $5.0\%$; sampling = OFF; cgroup CPU throttling = 0 periods. | **`TBD`** (SLA V0.1) |
| **`N-07`** | **Memory Overhead** | • Avg RSS Delta: **`+4.8 MB RSS`**<br>• Peak RSS: **`45.2 MB RSS`** ($14.1\%$ limit $320\text{MB}$) | Chu kỳ lấy mẫu 1s; cửa sổ load run $N = 2000$ requests; error_rate = $5.0\%$; sampling = OFF; OOM kill = 0. | **`TBD`** (SLA V0.1) |
| **`N-08`** | **Network Overhead** | • Tuyến discard ($P\text{-discard}$): **`0 B`** egress<br>• Upload capsule ($P\text{-persist}$): **`2.04 KB`** / error request | In-process buffer & payload upload; cửa sổ load run $N = 2000$ requests; error_rate = $5.0\%$; sampling = OFF. | **`TBD`** (SLA V0.1) |

> **Ghi nhận**: Đã đóng các mục TBD thực nghiệm bằng số liệu đo lường cụ thể kèm điều kiện đo chuẩn hóa. Ngưỡng cam kết SLA chính thức cho V0.1 giữ `TBD` chờ chốt tại Phase `P1`.
### 3.3 `N-09` — P95 capsule size

§23 yêu cầu đo **cả hai**:

```text
Capsule Size
├── Average capsule size (N-03)
└── P95 capsule size (N-09)
```

§24 chỉ đặt ngưỡng cho **average** (`< 10 MB`, tức `N-03`).

**Kết quả đo lường thực nghiệm Phase 0 (Task `C1`–`C4` / [Perf-Spike-Phase-0.md](../035-QA/Performance/Perf-Spike-Phase-0.md)):**

| Phân vị | Kích thước đo được ($P\text{-persisted}$) | Kích thước $P\text{-serialized}$ (thô) | Tỷ lệ nén | Cỡ mẫu ($N$) |
|---|:---:|:---:|:---:|:---:|
| **Average** (`N-03`) | **`2,042 bytes`** ($0.0019\text{ MB}$) | $3,120\text{ bytes}$ | $34.5\%$ | $N = 33$ |
| **P50** | **`2,133 bytes`** ($0.0020\text{ MB}$) | — | — | $N = 33$ |
| **P95** (`N-09`) | **`2,448 bytes`** ($0.0023\text{ MB}$) | — | — | $N = 33$ |
| **P99 / Max** | **`2,448 bytes`** ($0.0023\text{ MB}$) | — | — | $N = 33$ |

> ⚠️ **Cảnh báo mẫu nhỏ**: Điểm đo là $P\text{-persisted}$ (sau redact, sau compress, sau encrypt). Với cỡ mẫu $N = 33$, giá trị $P95 = 2,448\text{ B}$ gần bằng $\max()$ ($2,448\text{ B}$) trên tập fixture synthetic.
> 
> **Ngưỡng cam kết của `N-09` cho V0.1**: Giữ **`TBD`** (chờ phân tích workload production thật tại Phase `P1`).
---

## 4. Ràng buộc phi chức năng định tính

Nhóm này **không có số** và không nên bị ép thành số. Chúng là quality attribute mà `RQ.md` phát biểu ở dạng nguyên tắc (§33) hoặc dạng mitigation (§20), và chúng ràng buộc thiết kế mạnh hơn phần lớn con số ở mục 2.

| ID | Ràng buộc | Phát biểu gốc | Nguồn § |
|---|---|---|---|
| `N-10` | **Production safety** — Repro không bao giờ được là nguyên nhân production chậm đi hoặc lỗi | *"Repro must never become the reason production becomes slower or fails."* | §20.7 |
| `N-11` | **Capture pipeline có ràng buộc** — asynchronous, bounded buffer, sampling, configurable capture limits, chỉ capture failed/high-value execution | §20.7 mitigation (5 mục) | §20.7 |
| `N-12` | **Safe by default** — replay không bao giờ được vô tình kích hoạt production side effect; default-deny writes là **core safety mechanism** | *"Replay must never accidentally trigger production side effects."* | §33.6, §13, §20.4 |
| `N-13` | **Determinism over magic** — hệ thống phải giải thích **chính xác** cái gì đã được capture và cái gì đã được replay; không có hành vi ngầm | *"The system should explain exactly what was captured and replayed."* | §33.5 |
| `N-14` | **Privacy by default** — production data **luôn** được coi là nhạy cảm | *"Production data should always be treated as sensitive."* | §33.4, §16 |
| `N-15` | **Minimal integration effort** — trải nghiệm đầu tiên phải cực đơn giản: `npm install @repro/node` + `repro.init()`, rồi capture được execution replay-được đầu tiên với cấu hình tối thiểu. Nếu tích hợp đòi hạ tầng đáng kể, adoption sẽ hỏng | §20.14 (risk 🔴 Critical) | §20.14, §21 |
| `N-16` | **Explain failure** — khi replay không reproduce được, hệ thống phải chỉ ra production và local khác nhau **ở đâu**, không được chỉ trả về *"Could not reproduce"* | *"If replay fails, show how production and local executions differ."* | §33.3, §9 |
| `N-17` | **Ngôn từ giới hạn kết luận** — bắt buộc dùng `✓ Captured execution no longer reproduces`, **cấm** dùng `✓ Production bug is definitely fixed`. Một replay thành công chỉ chứng minh *"this captured execution no longer fails"* | §20.16 (risk 🔴 Critical *False Confidence About Fixes*) | §20.16 |
| `N-18` | **Portability của capsule** — capsule phải replay được ở môi trường **khác** nơi tạo ra nó. §22 đưa bước *"Destroy original environment"* vào quy trình spike đúng để chứng minh tính chất này | §6, §22, §40 | §6, §22, §40 |
| `N-19` | **Narrow before broad + product boundary** — hỗ trợ tốt một lớp bug nhỏ trước khi mở rộng; một feature chỉ được xem xét nếu nó **trực tiếp** cải thiện `Capture → Replay → Verify` | §33.7, §20.15 | §33.7, §20.15, §21 (*Compatibility matrix*, `MVP? = Yes`, mitigation *"Narrow initial support"*) |

**Ghi chú về `N-10` và `N-11`**: hai ràng buộc này **thắng** yêu cầu về độ đầy đủ của capture. Khi có xung đột giữa "capture thêm để replay chính xác hơn" và "không ảnh hưởng production", §20.7 đã phân xử sẵn bằng chữ *"never"*.

**Ghi chú về `N-13` và `N-16`**: hai ràng buộc này là lý do Execution Diff (`FR-042`, `FR-043`) là **capability lõi**, không phải tính năng phụ — §9 nói *"Repro can still provide value even when the bug cannot be reproduced."*

---

## 5. Yêu cầu bảo mật

> **Mục này KHÔNG nhắc lại 43 yêu cầu bảo mật.** Toàn bộ threat model, asset inventory, trust boundary, danh sách redaction mặc định và `SEC-001`…`SEC-048` nằm ở tài liệu riêng: [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md). Chép lại ở đây sẽ tạo hai bản khác nhau của cùng một yêu cầu.

Ở mức NFR, chỉ cần biết **bốn thay đổi mặc định** — đây là phần có giá trị nhất của threat model, và cả bốn đều **siết chặt hoặc bổ sung** so với `RQ.md` §16:

> **Trạng thái của thay đổi thứ 4 (mục 5.4) — cả hai phần nay đã chốt, bằng hai quyết định khác nhau vào hai thời điểm khác nhau**:
>
> | Phần | Trạng thái | Neo |
> |---|---|---|
> | **authn + authz + audit log thuộc OSS core** | ✅ **CHỐT 2026-08-14** | **M2** — giữ nguyên nhãn cũ, không đổi |
> | **crypto-shredding** (`SEC-016`) | `✅ CHỐT GATE-05b — 2026-08-14` — **ÁP DỤNG**, phân loại **`MUST-V0.1`** | `GATE-05b` |
>
> ⇒ Câu *"crypto-shredding vẫn là đề xuất cần validate"* ở các bản trước của tài liệu này **không còn đúng**. Xem mục 5.4.

### 5.1 Mọi thứ fail **closed**

Khi một control bảo mật gặp lỗi, hệ thống phải **dừng**, không được **đi tiếp ở chế độ không bảo vệ**.

Cụ thể: redaction lỗi ⇒ **không persist** capsule; config redaction thiếu hoặc parse lỗi ⇒ **refuse to start**, tuyệt đối không mặc định về "no redaction".

**Vì sao đây là thay đổi**: §16 chỉ đưa ra **hình dạng** của config redaction (`headers`, `fields`) và không nói gì về integrity của config hay hành vi khi config vắng mặt. Ở trạng thái đó, một PR sửa YAML sai — không cần tấn công gì — làm recorder chạy ở chế độ *"không rule nào khớp"* = **full capture, âm thầm, không tín hiệu**.

### 5.2 Allowlist thay vì denylist ở hai chỗ quyết định

- **Environment variable**: deny-by-default, chỉ capture những biến đã khai báo tường minh. §16 mô tả redaction theo kiểu **danh sách cấm** (`authorization`, `cookie`, `password`, …) — kiểu này luôn hở với cái nó chưa từng nghĩ tới.
- **Replay egress**: chặn ở mức process với allowlist (loopback + replay proxy), thay vì tin vào phân loại verb.

**Vì sao đây là thay đổi**: cơ chế §13 mô tả (phân loại READ/WRITE tại các sink đã instrument) **fail-open đúng ở chỗ nguy hiểm nhất — cái nó không nhận diện được**: socket thô, tiến trình con gọi công cụ HTTP bên ngoài, SDK dùng transport riêng, SQL bắt đầu bằng `WITH` mà bên trong có `UPDATE`, `SELECT` gọi hàm có side effect, `CALL`, hay một `GET` thực chất gây hành động. Biến default-deny từ *"cấm các verb ghi đã biết"* thành *"chỉ cho phép những gì đã chứng minh là read"*.

Điểm này được **hai lens độc lập** (kiến trúc và bảo mật) kết luận giống nhau: phân loại READ/WRITE phải **fail-closed**. Ràng buộc trực tiếp lên `FR-034`, `FR-035`, `FR-036`.

### 5.3 Verify capsule **trước khi** parse

Capsule phải có hash/signature trong `manifest.json` **từ v1 của format**, và replay runtime phải verify **trước khi** parse payload.

**Vì sao đây là thay đổi**: toàn bộ `RQ.md` nhìn dữ liệu chảy **ra**. Nhưng `repro replay` **nạp và deserialize một artifact do bên khác tạo**, rồi tiêm giá trị đó vào runtime của developer — và `RQ.md` **không có một dòng nào** về capsule integrity: không hash, không signature, không verification.

Máy bị ảnh hưởng là máy có SSH key, cloud credential và quyền push code. Đây là con đường từ *"lộ dữ liệu"* sang **compromise chuỗi phát triển**. Rủi ro tăng theo thời gian, đúng lúc hệ sinh thái OSS bắt đầu chia sẻ "sample capsule" công khai.

Yêu cầu này **rẻ** nhưng phải chốt **từ V0.1** vì nó ràng buộc **capsule format** (`FR-017`) — không retrofit được sau.

### 5.4 Authn/authz + audit nằm trong **OSS core** — ✅ **ĐÃ CHỐT 2026-08-14** · crypto-shredding — `✅ CHỐT GATE-05b — 2026-08-14`

> **M2 đã chốt.** Hai phía dưới đây được **giữ nguyên làm bằng chứng** — `RQ.md` vẫn tự nói ngược ở chính những section này; quyết định chỉ ghi lại ta chọn phía nào, nó không xoá mâu thuẫn trong nguồn.

> **Mục này mang HAI quyết định, đọc rời nhau**: **M2** (authn/authz/audit thuộc OSS core) và **`GATE-05b`** (crypto-shredding = `MUST-V0.1`). `GATE-05b` là quyết định **mới**, ngày 2026-08-14, **không** thuộc M2 — M2 tường minh **không** bao gồm crypto-shred.
>
> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. **Trong tài liệu chỉ dùng `GATE-0N`.**

| Phía "commercial layer" | Phía "MVP core" |
|---|---|
| §28 xếp **Access control**, **Retention policies**, **Team management**, **Enterprise security** vào *"Potential commercial layer"* | §20.5 (🔴 Critical) liệt kê **strict access control** trong mitigation |
| §28 cho OSS core chỉ có *"Basic Self-hosting"* | §21 đánh `MVP? = Yes` cho *Sensitive data* và *Security exposure* |
| | §20.17 (Compliance) yêu cầu retention policies, deletion, **audit logs** |

**Hệ quả**: **bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.**

#### ✅ Quyết định — **ĐÃ CHỐT 2026-08-14**

**Cả ba — authentication, authorization (access control), và audit log — nằm trong OSS core**, **không** phải commercial layer. Quyết định này **ghi đè** phần §28 xếp *Access control* và *Retention policies* vào commercial layer. `FR-024`, `FR-025`, `FR-026` giữ nguyên là **MVP**.

**Giữ nguyên ở commercial layer** theo §28: hosted storage · team management · analytics · AI analysis · cloud integrations.

**Lý do**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production**. Thiếu audit thì tổ chức **kiểm soát được nhưng không chứng minh được**, trong khi §20.17 (🟠 High) yêu cầu audit log như mitigation.

**Hệ quả kéo theo — `GAP-04` nặng thêm**: authz/audit nay **chắc chắn phải có trong OSS core**, mà §18 **không có một CLI verb nào** để vận hành chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều developer-side. Đây là **nợ giao diện vận hành tường minh**, xem [Analysis-Target-Users](../050-Research/Analysis-Target-Users.md) mục 4.1.

> **Cập nhật sau `✅ CHỐT GATE-04 — 2026-08-14`: sàn đã đóng, verb vận hành VẪN THIẾU.** `GATE-04` chốt **sàn tối thiểu của Capsule Store** = **object/file storage + một index + hook authn/authz/audit**, kèm 3 thao tác tối thiểu theo `SDD §5.4`. ⇒ Nay đã có **chỗ để cắm** authz và audit, tức phần *"cái gì phải có"* không còn `TBD`.
>
> Nhưng `GAP-04` **chưa đóng**: §18 vẫn **không có CLI verb nào** cho authz / audit / retention, và **cơ chế** authn/authz cụ thể vẫn `TBD` (owner **`@TrisJr`**; điều kiện đóng: quyết định thiết kế tại [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) §5.4). Rủi ro **`GATE-04-r`** — *"sàn đóng nhưng không vận hành được"* — tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2. Neo Requirements của `GATE-04`: [PRD-Repro](./PRD-Repro.md) mục 10.5 (`U-06`).

#### ✅ Crypto-shredding — **ÁP DỤNG, phân loại `MUST-V0.1`** — `✅ CHỐT GATE-05b — 2026-08-14`

**Đây là neo NFR của `GATE-05b`.**

**Nội dung đã chốt**: **crypto-shredding** là yêu cầu **`MUST-V0.1`** (`SEC-016`) — capsule mã hoá bằng key riêng từng capsule, **khoá giữ phía server**, replay lấy key just-in-time ⇒ *xoá = phá key*, và **xoá khoá ⇒ capsule không giải được**, kể cả mọi bản copy đã nằm trên laptop / chat / git. Đây là cơ chế **duy nhất** biến việc capsule đã rời khỏi hạ tầng tổ chức từ **bất khả hồi** thành **khả hồi**, và là điều kiện để nói được về GDPR right-to-erasure.

**Hệ quả lên bộ số bảo mật**: `SEC-016` rời `DEFER` sang `MUST-V0.1` ⇒ phân loại đổi từ `32 MUST-V0.1 / 8 SHOULD / 3 DEFER = 43` sang **`33 / 8 / 2 = 43`**. Tổng **vẫn 43**. Neo: [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) §9.2 và §11.c.

**Đánh đổi phải nói thẳng — `GATE-05b-r`**: câu *"replay không cần kết nối mạng"* **thôi là bất biến**. Khoá giữ phía server ⇒ replay phải lấy được khoá ⇒ **replay không còn hoàn toàn offline**, và capsule **không còn self-contained tuyệt đối** (va thẳng vào [ADR-002](../030-Specs/Architecture/ADR-002-Repro-Capsule-Format-Contract.md) và §33.6 *Safe by default*). Việc self-host cũng phức tạp hơn. **Đây là hệ quả được chấp nhận có ý thức**, không phải phát hiện muộn: PM đã nêu cảnh báo này trước khi anh quyết, và anh vẫn chọn `MUST-V0.1`. Rủi ro tại [Risk-Register](../010-Planning/Risk-Register.md) §4.2.

**Ranh giới cần đọc đúng**: khoá nằm ở **phía server của Capsule Store**, **không** phải ở production. Bất biến *"replay không truy cập production, kể cả production database"* (§5, §7, §11, `FR-033`) **vẫn nguyên**. Thứ mất đi là *"replay hoàn toàn offline"* — xem [UC-02](./Use-Cases/UC-02-Replay-Capsule-Locally.md) `I5`.

**Vẫn `TBD` — và nay là blocker (`GATE-05b-r2`)**: **key custody** (`U-06d`) — khoá được giữ ở đâu, ai cấp, xoay vòng thế nào, xoá bằng thao tác nào. Không có key management thì crypto-shredding **không thực thi được**, nên quyết định `MUST-V0.1` chỉ có giá trị khi có nơi giữ và xoá khoá. Owner: **`@TrisJr`**; điều kiện đóng: quyết định thiết kế key management tại [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`.

Xem [PRD-Repro](./PRD-Repro.md) mục 10.4 và mục 5.2 (`FR-024` — TTL mặc định **30 ngày**, `✅ CHỐT GATE-05a — 2026-08-14`).

### 5.5 Một ràng buộc phải nói thẳng, không được làm mềm

> **Redaction là hygiene control, KHÔNG phải containment boundary.**

Redaction dựa-trên-danh-sách về nguyên tắc **không thể** bắt được: free-text, tên field không đoán trước được, payload lồng/encode, giá trị không có key, PII trong URL, binary có metadata nhúng, **stack trace và SQL error message** (không schema, không key ⇒ mọi rule theo tên đều mù — mà §18 yêu cầu capture đúng stack trace), quasi-identifier ghép lại, internal id join được với DB thật, và yếu tố con người.

⇒ **Không được** viết ở bất kỳ tài liệu nào rằng "đã có redaction nên capsule sạch". Containment thật đến từ access control + encryption với crypto-shred + retention TTL + audit + self-hosting + hạn chế số bản copy.

Đây cũng là lý do `N-14` (*Privacy by default*) là ràng buộc **định tính** ở mục 4 chứ không phải một checkbox.

### 5.6 Căng thẳng privacy ↔ replay fidelity

Xoá hẳn một field làm **đổi code path**: `if (user.email)` rẽ nhánh khác, schema validation fail, destructuring thành `undefined`. Với một sản phẩm mà toàn bộ giá trị nằm ở *"cùng một execution path"* (§10, §20.3), việc này tạo ra **bug giả** hoặc **che bug thật**.

⇒ Mặc định phải **giữ hình dạng** dữ liệu (thay thế format-preserving) thay vì xoá key. Và capsule phải **ghi lại đã redact field nào**, để Execution Diff (`FR-042`) phân biệt được *"diverged vì code"* với *"diverged vì redaction"* — nếu không, developer sẽ mất niềm tin rồi **tự tắt redaction**, và đó mới là cách redaction thất bại trong đời thực.

Hệ quả phải chấp nhận và nói thật: **replay của một capsule đã redact không bảo đảm bit-perfect.**

---

## 6. Con số trong `RQ.md` KHÔNG phải NFR

> **Mục này tồn tại để chặn một lỗi tái diễn**: khi chuyển văn xuôi thành tài liệu yêu cầu, một con số minh hoạ rất dễ biến thành KPI chỉ vì nó là con số duy nhất trong section. Năm mục dưới đây **đã bị loại tường minh** khỏi tập NFR.

| # | Con số / phát biểu | Nguồn | Nó thực sự là gì | Vì sao KHÔNG phải NFR |
|---|---|---|---|---|
| X-1 | `2,431 production bugs captured` / `1,827 successfully replayed` / `1,203 converted into regression tests` | §31 | **Ví dụ minh hoạ cách đọc North Star Metric** — `RQ.md` ghi thẳng chữ **"Example"** ngay trên khối này | Không phải target, không phải baseline, không phải dự báo. Không có nguồn dữ liệu nào đứng sau ba con số này |
| X-2 | `60–90 giây` | §25 | **Ràng buộc UX cho Killer Demo** — *"The product should be understandable in a 60–90 second demo"* | Đây là ràng buộc lên **cách trình bày sản phẩm**, không phải lên hiệu năng của sản phẩm. Nhầm nó thành NFR sẽ tạo ra một yêu cầu performance không tồn tại. Ghi đúng chỗ: [PRD-Repro](./PRD-Repro.md) mục 7.3 |
| X-3 | `Hours / Days → Minutes` | §32 | **Outcome metric**, mục *Time to Reproduce* | **Không test được**: cần baseline "thời gian reproduce trước khi có Repro" mà repo **không có dữ liệu nào** (không user research, không survey, không log). Là **hypothesis**, không phải ngưỡng |
| X-4 | `"within minutes"` | §38.14 | **Một CÂU HỎI** — *"Can a developer install and create their first replay within minutes?"* | §38 có tiêu đề *"Questions for PM Review"*. Một câu hỏi chưa được trả lời **không thể** là một cam kết. Biến nó thành NFR là đọc ngược ý tài liệu gốc |
| X-5 | GitHub stars / forks / contributors / package downloads / active installations / active developers / integrations | §32 (*OSS Adoption*) | **Adoption metric của dự án OSS** | Đo mức phổ biến của dự án, **không** đo chất lượng phi chức năng của phần mềm. Không có ngưỡng nào trong `RQ.md`, và không nên bịa ngưỡng |

**Quy tắc áp dụng**: một con số trong `RQ.md` chỉ được nâng thành NFR nếu nó xuất hiện ở **§24** (ngưỡng) hoặc **§23** (metric bắt buộc đo) — và ngay cả khi đó vẫn phải mang cảnh báo ở mục 1.

---

## 7. Acceptance criteria gaps

Mười hai phát biểu của `RQ.md` **nghe như acceptance criteria nhưng không đo được**. Mỗi mục có ba phần: *phát biểu không đo được* | *vì sao* | *cần thêm gì*.

> ⚠️ **Trạng thái ACG sau Phase P0-C (2026-08-28):**
> - `P0-A` ([Spec-Spike-Protocol.md](../030-Specs/Spec-Spike-Protocol.md)) đã cung cấp các **giải pháp giả thuyết (`HYPOTHESIS`)** và rubric vận hành cho `ACG-01`, `ACG-02`, `ACG-03`, `ACG-07`.
> - `P0-C` ([Report-Spike-Phase-0.md](../035-QA/Reports/Report-Spike-Phase-0.md)) đã cung cấp **số liệu thực nghiệm kiểm chứng 100%** trên tập $D=7$ ($21/21$ replays matched, Composite $7/7$).
> - Việc nâng cấp các giả thuyết này thành **Định nghĩa Sản phẩm chính thức của Repro V0.1** thuộc thẩm quyền của Task **`D1`** và **`D2`** trong Phase **`P1`** sau khi `@TrisJr` phê duyệt `GATE-06`.
### `ACG-01` — *"sufficiently equivalent"* (§10) không có định nghĩa

**Phát biểu không đo được** — §10:

> Repro should not simply verify that a replay completed. It should determine whether the execution was **sufficiently equivalent**.

§10 minh hoạ bằng ký hiệu `execution path: A → B → C` so với `A → B → D`.

**Vì sao không đo được**:

- `RQ.md` **không định nghĩa** *"sufficiently equivalent"* ở bất kỳ đâu.
- `RQ.md` **không định nghĩa** `A`, `B`, `C` là gì. "Execution path" là chuỗi **function call**? **code line**? **span**? chuỗi **interaction với dependency**? Bốn cách hiểu này cho bốn hệ thống khác nhau hoàn toàn.
- Không nói **so bao nhiêu field** của mỗi bước, và so **exact** hay **tolerant** (timestamp, id sinh ngẫu nhiên, thứ tự key).
- Không nói ngưỡng: phải khớp 100% hay khớp "đủ"? Chữ *"sufficiently"* hàm ý có ngưỡng, nhưng ngưỡng đó không tồn tại.

**Vì sao đây là mục nặng nhất**: §21 chỉ định **Execution verification** làm mitigation cho risk 🔴 Critical *"False replay equivalence"* (§20.3) — tức đây là **feature quan trọng nhất về mặt tin cậy** của sản phẩm. Và chính nó là feature **không đo được**. Một lens kiến trúc độc lập gọi đây là **unknown lớn nhất của cả tài liệu**.

**Cần thêm gì**:

1. Định nghĩa **đơn vị** của execution path — chọn một trong bốn cách hiểu trên và nói rõ vì sao.
2. Định nghĩa **tập field** được đưa vào so sánh, và với mỗi field: exact hay tolerant.
3. Định nghĩa **ngưỡng** biến chuỗi so sánh thành kết luận nhị phân `Execution matched` / `Execution diverged`.
4. Định nghĩa cách **quy trách nhiệm divergence** (do code / do môi trường / **do redaction** — xem mục 5.6).

**Phương án đề xuất — gắn nhãn "cần validate", CHƯA áp dụng**: lấy **chuỗi interaction với dependency đã được instrument** (thứ tự và nội dung của DB query, outbound HTTP call, feature flag read, clock read) làm định nghĩa vận hành của "execution path", vì đó là thứ Repro **đã** capture theo §18 và không cần thêm cơ chế mới. Điểm yếu đã biết: định nghĩa này **không** bắt được rẽ nhánh thuần logic không chạm dependency — đúng loại bug mà §7 lấy làm ví dụ mở đầu.

> **Phương án trên PHẢI được validate qua technical spike §22 trước khi trở thành quyết định.** Không được viết vào bất kỳ tài liệu nào như thể đã chốt.

**Chặn**: `FR-041`, `N-01(b)`, `N-05`, `ADR-006`, và **metric chính thức của V0.1** (*số bug đạt trạng thái `Execution matched`*, chốt 2026-08-14) ở [PRD-Repro](./PRD-Repro.md) mục 8.2 — `ACG-01` nay chặn thẳng vào thước đo thành công của MVP.

### `ACG-02` — *"meaningful class"* / *"meaningful deterministic"* không đo được

**Phát biểu**: §19 — *"Can we reliably capture and replay a **meaningful** class of production executions?"*; §24 — *"≥ 80% **meaningful deterministic** test cases reproduced"*; §39 — *"a **meaningful** class of production bugs"*.

**Vì sao**: *"meaningful"* xuất hiện ở cả ba chỗ quyết định (câu hỏi của MVP, ngưỡng validation, câu hỏi gate) mà **không có tiêu chí nào** phân biệt một test case *meaningful* với một test case không. Ai quyết định, quyết định lúc nào (trước hay sau khi biết kết quả), và bằng tiêu chí gì — đều không có. Một ngưỡng có thể tự thoả mãn bằng cách chọn lại tập test.

**Cần thêm gì**: tiêu chí chọn test case **chốt trước khi chạy spike**, gắn với `ACG-07`.

### `ACG-03` — *"≥ 80% reproduced"* thiếu cả denominator lẫn định nghĩa "reproduced"

**Phát biểu**: §24 dòng 1.

**Vì sao**: đã trình bày đầy đủ ở mục 2.1 — (a) 80% trên 10 scenario §22 hay trên 7 (đã loại 7/9/10 theo §20.2, §20.13, §19)? (b) *"reproduced"* là **Replay Success Rate** hay **Execution Match Rate** — §23 định nghĩa hai chỉ số khác nhau.

**Cần thêm gì**: chốt denominator (phụ thuộc `ACG-07`) và chốt chỉ số (phụ thuộc `ACG-01`).

### `ACG-04` — *"< 5% production latency overhead"* thiếu điều kiện đo

**Phát biểu**: §24 dòng 2.

**Vì sao**: không nói percentile (average / P95 / P99), không nói baseline so với cái gì, không nói đo ở tầng nào (endpoint, service, cả cluster). Nặng nhất: không nói **áp cho bao nhiêu phần trăm traffic** — trong khi §20.7 tạo ra một nghịch lý là phải buffer **mọi** execution để biết cái nào failed, khiến ngân sách này thực chất áp lên 100% traffic.

**Cần thêm gì**: percentile + baseline + tầng đo + tỷ lệ traffic được instrument; và thừa nhận tường minh nghịch lý capture trigger.

### `ACG-05` — *"< 30 seconds replay time"* thiếu mốc đo

**Phát biểu**: §24 dòng 4; §23 định nghĩa *"Time from `repro replay` to execution result"*.

**Vì sao**: không rõ có tính `repro pull` (§8 tách thành bước riêng), có tính thời gian **boot ứng dụng local** không, và tính trên capsule kích thước nào (liên quan `N-03`/`N-09`).

**Cần thêm gì**: định nghĩa mốc bắt đầu/kết thúc, và nói rõ population capsule dùng để đo.

### `ACG-06` — *"UUID capture where practical"* không phải tiêu chí

**Phát biểu**: §20.2 mitigation — *"UUID capture **where practical**"*.

**Vì sao**: *"where practical"* là một **miễn trừ**, không phải một tiêu chí. Không có nó thì không ai kiểm được là đã làm hay chưa: mọi kết quả đều "đúng" vì chỗ chưa làm luôn có thể gọi là "not practical". Đồng thời §20.2 liệt kê **Random numbers, UUIDs, Timestamps** như ba nguồn non-determinism riêng biệt, nhưng §18 chỉ có *clock/timestamp* trong Capture list — hai nguồn còn lại không có FR nào phủ.

**Cần thêm gì**: liệt kê tường minh **nguồn non-determinism nào được capture ở V0.1** và nguồn nào **không**, kèm hành vi khi gặp nguồn không được hỗ trợ (cảnh báo? đánh dấu capsule? từ chối?).

### `ACG-07` — **"Supported Execution Class" chưa hề được định nghĩa**

**Phát biểu không đo được** — §20.1, mitigation của risk 🔴 Critical **số một** của tài liệu:

> Limit the MVP to a **clearly defined class** of deterministic request/response executions.
>
> Do not promise to reproduce every possible production bug.

**Vì sao không đo được**: **"clearly defined class" đó KHÔNG TỒN TẠI ở bất kỳ đâu trong `RQ.md`.** Không có section nào định nghĩa nó, không có danh sách điều kiện đủ, không có danh sách điều kiện loại trừ. §20.1 liệt kê 9 nhóm hidden input (environment variables, filesystem state, randomness, system clock, process state, concurrency, network behavior, OS behavior, background jobs) và nói *"If these are not captured, replay may fail"* — nhưng không nói execution **có** những yếu tố đó thì thuộc hay không thuộc class được hỗ trợ.

⇒ Mitigation của risk Critical #1 là *"giới hạn vào một class được định nghĩa rõ"*, mà class đó chưa được định nghĩa. **Risk Critical #1 hiện chưa có mitigation thực thi được.**

**Nó chặn gì — cụ thể**:

| Bị chặn | Vì sao |
|---|---|
| `FR-012` (chỉ capture failed execution) | Không spec được: capture **class nào** của failed execution? |
| Denominator của §24 (`N-01`, `ACG-03`) | Không biết tổng thể là gì thì `≥80%` không có nghĩa |
| Exception flow của [UC-02](./Use-Cases/UC-02-Replay-Capsule-Locally.md) | Không spec được hành vi khi execution rơi **ra ngoài** class được hỗ trợ |
| §19 (*"a meaningful class"*) và §39 (câu hỏi gate) | Cả hai đều tham chiếu tới class này |
| `ACG-02`, `ACG-06` | Đều phụ thuộc định nghĩa này |

**Cần thêm gì** — một định nghĩa có **ba phần**:

1. **Điều kiện đủ**: execution phải có hình dạng nào (vd. một inbound HTTP request sinh ra một response, kết thúc trong cùng một process).
2. **Điều kiện loại trừ**: execution có yếu tố nào thì **ngoài** class (đối chiếu từng nhóm trong 9 hidden input của §20.1).
3. **Hành vi khi ra ngoài class**: recorder có capture không, capsule có đánh dấu không, replay có từ chối không.

**Phương án đề xuất — gắn nhãn "cần validate", CHƯA áp dụng**: lấy giao của bốn ràng buộc **đã có trong `RQ.md`** làm điểm khởi đầu — (i) một inbound HTTP request → một response (§5, §18, §22 `POST /checkout`); (ii) chạy trong **một** service, dependency ngoài boundary đều replay từ recorded response (§14, §20.11); (iii) nguồn non-determinism giới hạn ở clock (§18, §20.2); (iv) **không** phụ thuộc concurrency/event ordering (§20.13). Điểm yếu đã biết: bốn ràng buộc này **không** loại trừ được filesystem state, environment variable và process state — ba nhóm §20.1 có nêu mà chưa có cơ chế nào xử lý.

> **Phương án trên PHẢI được validate qua technical spike §22** — chính spike với 10 scenario của §22 là công cụ để biết class thật sự nằm ở đâu. **Cấm** ghi nó vào bất kỳ tài liệu nào như định nghĩa đã chốt.

### `ACG-08` — *"only the information necessary"* không có tiêu chí quyết định

**Phát biểu**: §6 — *"The capsule should contain **only the information necessary** to reproduce the execution. It should not be a copy of the production environment."*

**Vì sao**: không có quy tắc nào quyết định một mẩu dữ liệu là "necessary" hay không **tại thời điểm capture** — mà capture xảy ra **trước** khi biết replay có thành công không. Yêu cầu này chỉ kiểm chứng được **sau khi** thử replay, tức nó là kết quả chứ không phải tiêu chí.

**Cần thêm gì**: chuyển thành quy tắc thao tác được — danh sách loại dữ liệu **được** ghi (theo §18 Capture list) + giới hạn định lượng (`FR-016`, `FR-019`) + hành vi khi vượt giới hạn. Ràng buộc "not a copy of the production environment" giữ nguyên như **nguyên tắc** (`N-18`), không dùng làm AC.

### `ACG-09` — phân loại READ/WRITE là danh sách ví dụ, không phải quy tắc

**Phát biểu**: §13 liệt kê READ = `SELECT`, `GET`, cache read; WRITE = `INSERT`, `UPDATE`, `DELETE`, `POST payment`, publish event. Và §20.4 yêu cầu *"Default-deny write behavior during replay"*.

**Vì sao**: đây là **hai danh sách ví dụ**, không phải một quy tắc phân loại **toàn phần**. Mọi thứ không nằm trong hai danh sách rơi vào vùng không xác định — và như mục 5.2 chỉ ra, vùng đó **fail-open đúng ở chỗ nguy hiểm nhất**. Một AC dạng "phân loại đúng READ/WRITE" không kiểm được vì không có định nghĩa đầy đủ để đối chiếu.

**Cần thêm gì**: quy tắc **fail-closed** — mọi interaction **không chứng minh được là READ** thì bị xử như WRITE; kèm danh sách cơ chế được coi là "đã instrument" và hành vi với cơ chế ngoài danh sách. Ràng buộc lên `FR-034`, `FR-035`, `FR-036`.

### `ACG-10` — cảnh báo *"Replay may not be deterministic"* không nói hành vi

**Phát biểu**: §15 in ra cảnh báo code mismatch:

```text
⚠️ Code mismatch
Bug occurred on: 8f31ac2
Your local code:  92ab381
Replay may not be deterministic.
```

**Vì sao**: `RQ.md` không nói cảnh báo này **dẫn tới hành vi gì**. Replay vẫn chạy tiếp hay bị chặn? Có mức độ nào (commit khác vs runtime major version khác vs schema version khác — §20.8, §20.9)? Nếu kết quả replay sau đó diverge thì có được quy về mismatch này không?

Điểm này quan trọng đúng ở use case chính: §8 bước 4–5 là **developer sửa code rồi replay lại** ⇒ code mismatch là **trạng thái thường trực**, không phải ngoại lệ hiếm.

**Cần thêm gì**: phân tầng cảnh báo (warn / block) theo loại drift, và quy tắc phân biệt *"diverged vì đã fix"* với *"diverged vì môi trường lệch"* — hai tín hiệu giống hệt nhau nhưng ý nghĩa trái ngược. Ràng buộc lên `FR-044`, `FR-045`, `FR-046`.

### `ACG-11` — *"< 10 MB average capsule size"* thiếu điều kiện đo

**Phát biểu**: §24 dòng 3.

**Vì sao**: không nói **trước hay sau compression** (§20.12 yêu cầu compression + deduplication + content hashing), không nói **trước hay sau redaction** (§16 có thể làm dữ liệu nhỏ đi đáng kể), và không nói population nào. Ngoài ra §23 đòi đo **cả P95** mà §24 không đặt ngưỡng — xem `N-09`.

**Cần thêm gì**: chốt điểm đo trong pipeline (khuyến nghị: kích thước artifact **cuối cùng, đã compress, đã redact** — vì đó là thứ thật sự chiếm storage và đi qua mạng), chốt population, và đặt ngưỡng P95 **sau** khi spike có phân bố thực tế.

### `ACG-12` — §18 và §21 là hai danh sách MVP không khớp nhau

**Phát biểu**: §18 *"MVP capabilities"* liệt kê Capture / Replay / Analysis / CLI. §21 Risk Matrix đánh `MVP? = Yes` cho *Sensitive data* (redaction + encryption), *Security exposure* (self-hosted architecture), *Compliance* (policies + self-hosting), *Capsule size*, *Production overhead*.

**Vì sao**: hai section cùng tự nhận nói về phạm vi MVP nhưng **không khớp**. Đọc §18 là danh sách đầy đủ ⇒ redaction/encryption/retention/self-hosting **ngoài** MVP, và §20.5 (🔴 Critical) trở thành risk **không có mitigation nào ở MVP**. Đọc §21 là có thẩm quyền ⇒ §18 thiếu 5 nhóm capability. `RQ.md` không có câu nào phân xử.

**Cần thêm gì**: **đã được xử lý bằng một diễn giải tường minh (E2)**, ghi ở [PRD-Repro](./PRD-Repro.md) mục 3.4 — §18 là danh sách của **core replay loop**, §21 cột `MVP?` là **nguồn có thẩm quyền** cho capability phi chức năng; hai danh sách bổ sung nhau. Diễn giải này được chống lưng độc lập bởi threat model (**33** requirement MUST-V0.1 phủ đúng redaction/encryption/retention/audit/authn-authz — bộ số đổi từ `32/8/3` sang **`33/8/2 = 43`** sau `✅ CHỐT GATE-05b — 2026-08-14`, xem mục 5.4).

⚠️ Nhưng phải ghi rõ: **đây là diễn giải, `RQ.md` không nói thẳng.** Nếu anh sửa `RQ.md` sau này, §18 nên được bổ sung cho khớp §21 để gap này đóng lại tại gốc.

---

## 8. Related Documents

| Tài liệu | Quan hệ |
|---|---|
| [PRD-Repro](./PRD-Repro.md) | **Tài liệu cha** — Functional Requirements `FR-001`…`FR-082`, Scope/MVP, Success Metrics, mục 10.4 (M1, M2 — ✅ đã chốt 2026-08-14) |
| [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) | Chi tiết mục 5 — threat model, asset, trust boundary, redaction list, `SEC-001`…`SEC-048` |
| [SDD-Repro](../030-Specs/Architecture/SDD-Repro.md) | Thiết kế kỹ thuật; TBD register của các unknown chặn `ACG-01` và `ACG-07` |
| [BRD-001-Problem-Statement](./BRD/BRD-001-Problem-Statement.md) | Bối cảnh vấn đề |
| [UC-02 — Replay Capsule Locally](./Use-Cases/UC-02-Replay-Capsule-Locally.md) | Exception flow bị chặn bởi `ACG-07` |
| [Roadmap](../010-Planning/Roadmap.md) | Technical spike §22 nằm ở Phase 0, trước V0.1 |
| [Risk-Register](../010-Planning/Risk-Register.md) | 18 risk §21 + risk từ threat model + các mâu thuẫn nội tại của `RQ.md` |
| [Charter-Repro](../010-Planning/Charter-Repro.md) | Bối cảnh dự án |
| [Report-Spike-Phase-0](../035-QA/Reports/Report-Spike-Phase-0.md) | Báo cáo kết quả thực nghiệm Technical Spike Phase 0 (Task C3, C4) |
| [Perf-Spike-Phase-0](../035-QA/Performance/Perf-Spike-Phase-0.md) | Dữ liệu đo lường hiệu năng và độ trung thực Phase 0 (Task C1, C2) |
| `docs/999-Resources/RQ.md` | **Nguồn sự thật gốc** — mọi `§N` trong tài liệu này trỏ về đây |
