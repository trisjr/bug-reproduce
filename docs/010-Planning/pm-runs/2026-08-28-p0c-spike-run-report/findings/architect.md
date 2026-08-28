# Findings — architect

## Kết luận của worker

Sau khi rà soát toàn bộ hệ thống tài liệu kiến trúc ([`Spec-Spike-Protocol.md`](../../../../030-Specs/Spec-Spike-Protocol.md), [`SDD-Repro.md`](../../../../030-Specs/Architecture/SDD-Repro.md), các ADR từ `ADR-001` đến `ADR-011`), bảng tiền đăng ký [`T1-Pre-Registration-Spike-Phase-0.md`](../../../../035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md), cùng mã nguồn và test suite của verification engine (`src/spike/verify/`, `test/spike/verify/`), em xin báo cáo phân tích chiều kiến trúc cho các task $C3$, $C4$ và `GATE-06` (§39) của Phase `P0-C` như sau:

---

### 1. Rà soát Thủ tục Quy trách nhiệm Phân kỳ (Divergence Attribution Procedure) theo Spec §3.6 & Đánh giá Attribution Engine

#### 1.1 Kiến trúc Bộ máy So khớp 2 Tầng & Nguyên tắc Thứ tự Quy trách nhiệm
- **Bộ lọc 2 tầng tách biệt (`src/spike/verify/index.js`)**:
  - **Tầng 1 — Cổng Inconclusive (`gate.js`)**: Đứng **TRƯỚC** rubric so sánh. Đánh giá khối `class_assessment` bắt buộc trong capsule theo `Spec §2.6`. Nếu execution nằm ngoài class (`inClass: false`) hoặc không kiểm được (`inClass: null` do loại trừ bằng lời khai), Cổng lập tức trả về `verdict = inconclusive` và **KHÔNG CHẠY** Rubric Tầng 2. Toàn bộ các ca này bị loại khỏi denominator $D=7$.
  - **Tầng 2 — Rubric So sánh Nhị phân (`rubric.js`)**: So sánh chính xác trên 3 điều kiện cấu trúc (`Spec §3.4`):
    1. *Bằng độ dài*: Số lượng đơn vị so sánh (Units) của production và local bằng nhau sau chuẩn hoá (nhóm đồng thời tính là 1 đơn vị).
    2. *Mọi đơn vị bằng nhau*: 5 trường exact (`kind`, `target`, `arguments`, `direction`, `result`) sau khi áp dụng 3 quan hệ tương đương (nhóm đồng thời so như tập set equality, marker tương đương marker cho trường redact, và canonical form cho JSON/SQL/URL).
    3. *Hai neo bằng nhau*: Neo đầu $U_0$ (Inbound HTTP) và neo cuối $U_\infty$ (Outcome Identity so theo danh tính loại, không so stack trace theo `ADR-006 A3`).
    - Kết quả Tầng 2 là **nhị phân tuyệt đối**: `matched` hoặc `diverged` (kèm First Divergence Point).

- **Thủ tục Quy trách nhiệm 6 Bước ("Khớp đầu tiên thắng" — `attribution.js`)**:
  Khi Tầng 2 ghi nhận `diverged`, `attributeDivergence()` duyệt tuần tự 6 bước theo thứ tự bất biến của `Spec §3.6` (quy lỗi cho Repro trước khi quy lỗi cho developer):
  - **Bước 1 (`redaction`)**: Điểm phân kỳ chạm trường nằm trong `redactedFields` hoặc mang `REDACTION_MARKER`.
  - **Bước 2 (`incomplete-capture`)**: Capsule thiếu entry mà code local yêu cầu (hoặc khớp `knownMissingInputs` trong manifest), với điều kiện loại trừ: **KHÔNG** mang cờ `truncated: true`.
  - **Bước 2b (`truncated`)**: Capsule mang cờ `truncated: true` tại điểm phân kỳ do chạm trần buffer/row cap (`SEC-008`).
  - **Bước 3 (`version-drift`)**: Cờ drift (`gitCommit`, `runtime`, `dependency`, `schemaVersion`) được bật.
  - **Bước 4 (`out-of-scope-determinism`)**: **RÀNG BUỘC CỨNG**: Chỉ khớp khi $K=3$ lần replay cho **KHÁC VERDICT** (`replay_unstable: true`). Nếu cả 3 lần cho cùng verdict, bước 4 **CẤM KHỚP** dù có nghi ngờ phi tất định.
  - **Bước 5 (`code`)**: Code local khác code trong capsule.
  - **Bước 6 (`unattributed`)**: Không khớp 5 bước trên. ⛔ **CẤM gộp thầm vào `code`**; phải xuất thành metric độc lập để cảnh báo khoảng trống của rubric (`Spec §3.6 CAUTION`).

#### 1.2 Đánh giá Tính sẵn sàng khi Phân loại các Scenario Thất bại & Observation Set
Qua rà soát mã nguồn `src/spike/verify/attribution.js` và test suite `test/spike/verify/verify.test.js`, attribution engine đã sẵn sàng 100% cho $C3$:

1. **Probe `SC-11` (Cache Probe / Redis)**:
   - *Đặc điểm cấu tạo*: Cố tình phụ thuộc Redis state (Trục 2 Loại trừ, `Spec §2.4`, Quyết định `G1`).
   - *Hành vi dự kiến*: Redis production bị destroy sau capture, allowlist egress của `ADR-005 L2` chặn kết nối Redis ở local $\rightarrow$ cả $K=3$ lần replay đều thất bại đồng nhất tại cùng điểm gọi Redis.
   - *Phán quyết attribution engine*: Do $K=3$ cho cùng verdict, Bước 4 (`out-of-scope-determinism`) **im lặng**; Bước 2 (`incomplete-capture`) **khớp chính xác** nhờ manifest `SC-11.json`. Điều này chứng minh engine không bị lỗi "đổ vấy cho phi tất định", vượt qua phép thử tự kiểm định của `Spec §2.5`.

2. **Scenario `SC-7` (Randomness / UUID)**:
   - *Đặc điểm*: Thuộc Observation Set ($M\text{-}2$ hỏng do UUID nằm ngoài 8 nhóm capture §18, `ACG-06` treo).
   - *Hành vi dự kiến*: Sinh UUID ngẫu nhiên tại local khác production $\rightarrow$ nếu giá trị ngẫu nhiên đổi nhánh logic hoặc outcome qua các lần chạy, $K=3$ lần replay sẽ tạo ra các verdict không đồng nhất $\rightarrow$ Bước 4 (`out-of-scope-determinism`) kích hoạt chuẩn xác.

3. **Scenario `SC-9` (Async behavior)**:
   - *Đặc điểm*: Thuộc Observation Set ($M\text{-}3$ hỏng do tác vụ async không đóng trong cửa sổ request, `U-20` chưa có cơ chế nhận diện ranh giới nhóm).
   - *Hành vi dự kiến*: Nếu thứ tự async trôi dạt giữa các lần chạy, $K=3$ lần replay kích hoạt Bước 4 (`out-of-scope-determinism`); nếu thứ tự ổn định nhưng interaction ngoài cửa sổ bị thiếu, Bước 2 (`incomplete-capture`) khớp.

4. **Scenario `SC-10` (Race condition)**:
   - *Đặc điểm*: Thuộc Observation Set ($M\text{-}4$ hỏng do phụ thuộc concurrency giữa nhiều execution, hoãn theo `RQ.md §20.13` và `ADR-010 D3`).
   - *Hành vi dự kiến*: Lệch pha race condition tạo ra kết quả phân kỳ không ổn định qua $K=3$ lần $\rightarrow$ Bước 4 (`out-of-scope-determinism`) khớp.

---

### 2. Phân tích Ranh giới Supported Execution Class (Spec §2, ADR-010) & 3 Luật Chống Gian lận Thống kê (L1, L2, L3)

#### 2.1 Cấu trúc Ranh giới Supported Execution Class (Mẫu số $D=7$)
Theo `Spec-Spike-Protocol §2` và `ADR-010`, một execution thuộc Supported Execution Class của V0.1 khi và chỉ khi thoả mãn đồng thời:
- **7 Điều kiện đủ ($S1$–$S7$)**:
  - $S1$: 1 Inbound HTTP request $\rightarrow$ 1 Outcome (Response hoặc Unhandled Exception).
  - $S2$: Hoàn tất trong 1 process (mọi dependency ngoài process được mock bằng recorded value).
  - $S3$: Mọi causal external input đi qua 8 nhóm capture của §18.
  - $S4$: Nguồn phi tất định giới hạn ở Clock (Randomness treo theo `ACG-06`).
  - $S5$: Độc lập với concurrency giữa các execution (Async nội bộ 1 request thuộc class).
  - $S6$: Mọi ghi chép tương tác tuân thủ fail-closed (Default-deny write theo `ADR-005`).
  - $S7$: Ổn định dưới phép lặp ($K=3$ lần replay cùng capsule, cùng code cho cùng kết quả).
- **2 Trục loại trừ**:
  - *Trục 1 (§2.3)*: 9 nhóm hidden input của §20.1 (trong đó 4 nhóm: `Environment variables`, `Filesystem state`, `Process state`, `OS behavior` bị loại trừ bằng **lời khai**, không có cơ chế phát hiện tự động ở Phase 0 — Điểm yếu `E-A`).
  - *Trục 2 (§2.4)*: Dependency nằm ngoài 8 nhóm capture của §18 (Redis/Cache state — Quyết định `G1`, Kafka/MQ, Background jobs, Browser state, Egress phi-HTTP, DB phi-PostgreSQL).

#### 2.2 Đối chiếu Tập Mẫu số $D=7$ và Tiền Đăng Ký $T1$
Bảng tiền đăng ký $T1$ (`docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`) đã niêm phong chính xác:
- **Tập In-Class ($D=7$)**: Gồm 7 scenarios thoả mãn trọn vẹn 6 tiêu chí $M\text{-}1$..$M\text{-}6$:
  - `SC-1` (Database state) $\rightarrow$ $D_1$ (verdict kỳ vọng `matched`).
  - `SC-2` (External API response) $\rightarrow$ $D_2$ (verdict kỳ vọng `matched`).
  - `SC-3` (Feature flag) $\rightarrow$ $D_3$ (verdict kỳ vọng `matched`).
  - `SC-4` (Time-dependent bug) $\rightarrow$ $D_4$ (verdict kỳ vọng `matched`, mở khoá nhờ hypothesis `§3.8 U-13` phát lại dãy clock tuần tự).
  - `SC-5` (Missing data) $\rightarrow$ $D_5$ (verdict kỳ vọng `matched`).
  - `SC-6` (Version difference) $\rightarrow$ $D_6$ (verdict kỳ vọng `matched`, chọn Nhánh A theo `§4.3.1` và hypothesis `§3.9 U-16` warning-only drift).
  - `SC-8` (Side effect) $\rightarrow$ $D_7$ (verdict kỳ vọng `matched`, chấm qua block log của `B5` dưới `ADR-005` mà không cần side effect thật).
- **Tập Observation Set (Ngoại bảng $D=7$)**:
  - `SC-7` (Randomness) $\rightarrow$ $M\text{-}2$ hỏng.
  - `SC-9` (Async behavior) $\rightarrow$ $M\text{-}3$ hỏng.
  - `SC-10` (Race condition) $\rightarrow$ $M\text{-}4$ hỏng.
  - `SC-11` (Redis probe) $\rightarrow$ Loại trừ Trục 2 (Cache state).

#### 2.3 Diễn giải Kết quả Tuân thủ 3 Luật Chống Gian lận Thống kê
1. **Luật `L1` (Đóng băng)**:
   - Danh sách 7 scenario in-class và verdict kỳ vọng `matched` đã được niêm phong tại $T1$ trước khi $C1$ chạy.
   - Cấm mọi hành vi đổi verdict kỳ vọng sau khi đã thấy dữ liệu đo thực nghiệm.
2. **Luật `L2` (Bánh cóc một chiều)**:
   - Mẫu số $D=7$ **CHỈ ĐƯỢC CO, TUYỆT ĐỐI KHÔNG NỞ**.
   - Nếu bất kỳ scenario nào trong Observation Set (`SC-7`, `SC-9`, `SC-10`, `SC-11`) cho kết quả `matched`, **CẤM** kéo vào mẫu số để làm đẹp tỷ lệ.
   - Việc co mẫu số chỉ được phép thông qua 3 con đường hợp lệ ($L2\text{-}a$):
     - *Con đường ①*: $M\text{-}1$ hỏng tại $B8$ (đã xác nhận 10/10 fixture PASS tại B8).
     - *Con đường ②*: Hypothesis `§3.8` ($U-13$) hoặc `§3.9` ($U-16$) bị thực nghiệm $C1$ bác bỏ $\rightarrow$ mất verdict kỳ vọng của `SC-4` hoặc `SC-6`.
     - *Con đường ③*: Cổng `inconclusive` Tầng 1 phát hiện capsule vi phạm class tại runtime $\rightarrow$ loại trước rubric.
3. **Luật `L3` (Báo cáo hai mẫu số)**:
   - Nếu mẫu số co lại theo con đường ② hoặc ③, báo cáo $C4$ bắt buộc phải in song song: mẫu số gốc ($D=7$) và mẫu số đã co ($D < 7$), kèm lý do kỹ thuật chi tiết của từng scenario bị loại.
4. **Cảnh báo độ mịn & Chỉ số Composite Fail-Closed (`Spec §4.4`, `§4.6`)**:
   - Ở cỡ mẫu $D=7$, 1 scenario tương ứng 14.3 điểm phần trăm. Ngưỡng $\ge 80\%$ thực chất là quy tắc **"được sai tối đa 1 trên 7"** ($\ge 6/7 \approx 85.7\%$).
   - Bắt buộc dùng chỉ số **Composite Fail-Closed**: Scenario chỉ được tính là "reproduced" khi replay chạy thành công **VÀ** đạt `matched` ở cả $K=3$ lần replay. Nếu replay crash hoặc lỗi runtime, scenario đó **KHÔNG BỊ LOẠI KHỎI MẪU SỐ** mà bị tính là thất bại (0/3).

---

### 3. Đánh giá Điều kiện Cần và Đủ cho GATE-06 (§39)

`GATE-06` (§39) do Sponsor `@TrisJr` chủ trì, trả lời câu hỏi cốt lõi: *"Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?"*

Dưới góc nhìn Kiến trúc Hệ thống, các điều kiện cần và đủ để đạt phán quyết **Có** một cách khách quan gồm:

#### 3.1 Nhóm Điều kiện Cần (Chỉ tiêu Đo lường & An toàn Bắt buộc)
1. **Chỉ số Composite Metric $B7\text{-}12$**:
   $$\text{Composite Rate} = \frac{\text{Số scenario đạt matched đủ } 3/3 \text{ lần}}{D=7} \ge \frac{6}{7} \ (\approx 85.7\%)$$
2. **Tuyệt đối An toàn Tác dụng phụ (Safety Invariant)**:
   $$escaped\_side\_effects = 0$$
   Xác nhận độc lập qua log của Canary Sink listener trên toàn bộ $10 \times 3 = 30$ lượt replay và probe `SC-11` (`ADR-005`, `MTP §5.2`).
3. **Các Ngưỡng NFR Cơ sở (§24)**:
   - Latency Overhead $< 5\%$ trên cả 2 path $P\text{-discard}$ và $P\text{-persist}$.
   - Average Capsule Size $< 10$ MB (và kiểm soát phân vị P95 theo `C-04`).
   - Replay Time $< 30$ seconds.
4. **Kiểm định Tính toàn vẹn của Attribution Engine**:
   - Probe `SC-11` phải ra đúng verdict `diverged` + nguyên nhân `incomplete-capture` (chứng minh engine phân loại chính xác).
   - Tỷ lệ `unattributed` (Bước 6) $\le 10\%$.

#### 3.2 Nhóm Điều kiện Đủ (Tính Pháp lý & Toàn vẹn Dữ liệu)
1. Con dấu tiền đăng ký $T1$ (`docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`) cùng 11 file manifest không bị sửa đổi sau thời điểm niêm phong (2026-08-28).
2. Toàn bộ 10 scenarios được thực thi qua bước **"Destroy original environment"** với bằng chứng độc lập (PostgreSQL container destroy, network isolate).
3. Báo cáo $C4$ tuân thủ nghiêm ngặt quy tắc cấm nâng cấp (`Spec §1.3`): Trình bày kết quả dưới dạng hypothesis được dữ liệu ủng hộ/bác bỏ, không tự ý nâng thành định nghĩa sản phẩm trước khi qua `GATE-06` $\rightarrow$ `D2`.

#### 3.3 Ma trận Phán quyết GATE-06
- **Phán quyết CÓ (Chuyển sang Phase P1 — $W11\text{–}W15$, 24.5 MD)**:
  - Khi thoả mãn 100% các điều kiện cần và đủ trên.
  - Mở khoá các task: $D1$ (chốt ngưỡng $N\text{-}05$ từ phân bố thực tế), $D2$ (nâng 4 `ACG` lên định nghĩa sản phẩm), $D7$ (gỡ `GATE-02` để phân rã Epics/Stories), và $D10$ (Gate cấp vốn V0.1).
- **Phán quyết KHÔNG (Kích hoạt Nhánh P0-D — $W11\text{–}W13$, 6.0 MD)**:
  - Khi $\text{Composite} < 6/7$ hoặc $escaped\_side\_effects > 0$ hoặc Latency Overhead $\ge 5\%$.
  - Thực thi các task $N1$–$N4$: Thu hẹp Supported Execution Class xuống tập scenario thực tế chạy được, cập nhật lại PRD/Charter, và trình `@TrisJr` quyết định re-scope, pivot hoặc dừng dự án.

---

### 4. Khuyến nghị Kiến trúc cho Tiến trình Thực thi Phase P0-C

1. **Đối với Task $C3$ (Phân loại Divergence)**:
   - Sử dụng trực tiếp `ExecutionVerifier` (`src/spike/verify/index.js`) để tự động hoá việc trích xuất First Divergence Point và Attribution Label.
   - Bắt buộc đối chiếu nguyên nhân thất bại với bảng 9 nhóm hidden input của `RQ.md §20.1`. Nếu xuất hiện trường hợp Bước 6 (`unattributed`), phải ghi nhận thành một mục riêng biệt trong báo cáo.
2. **Đối với Task $C4$ (Spike Report)**:
   - Trình bày đầy đủ cả 3 chỉ số theo `Spec §4.6`: Replay Success Rate ($R_{sr}$), Execution Match Rate thô ($R_{em}$), và Composite Metric ($\ge 6/7$).
   - Tuân thủ Luật $L3$: Nếu có scenario co khỏi $D=7$, phải in rõ 2 bảng số liệu gốc và co.
3. **Đối với Task $C5$ (Đóng các mục TBD)**:
   - Chỉ đóng các ngưỡng $TBD$ (như $N\text{-}09$ P95 capsule size, `SEC-008` row/byte cap) khi có dữ liệu đo thực tế từ $C1/C2$. Nếu thiếu dữ liệu (ví dụ P95 latency mạng), phải giữ nguyên $TBD$ kèm lý do kỹ thuật theo `Spec §1.3`.

---

## PM đọc được gì

- **Tính sẵn sàng của Toolchain**: Toàn bộ module Verification & Attribution ($B6$) đã hoàn chỉnh, hỗ trợ so khớp nhị phân 2 tầng, quy trách nhiệm 6 bước fail-closed, và định dạng Execution Diff theo `ADR-011`.
- **Ranh giới Mẫu số Bất biến**: Mẫu số $D=7$ và Observation Set ($SC\text{-}7, SC\text{-}9, SC\text{-}10, SC\text{-}11$) đã được niêm phong trong $T1$. Quy tắc tính điểm là $\ge 6/7$ trên chỉ số composite fail-closed.
- **Tiêu chí Rõ ràng cho GATE-06**: Đã định lượng chính xác các điều kiện kỹ thuật để `@TrisJr` ra phán quyết Có/Không tại `GATE-06`, bảo đảm chuyển giao suôn sẻ sang Phase P1 hoặc P0-D mà không có vùng mờ.

---

## Mâu thuẫn với lens khác

- **Không có mâu thuẫn**: Phân tích kiến trúc hoàn toàn đồng thuận và hỗ trợ trực tiếp cho kế hoạch chạy thực nghiệm của QA ($C1/C2$), kiểm toán an toàn của Security Auditor ($escaped\_side\_effects = 0$), và quy trình quản trị tài liệu của Context Auditor ($C6$).

---

STATUS: DONE
FILES_TOUCHED: docs/010-Planning/pm-runs/2026-08-28-p0c-spike-run-report/findings/architect.md
SUMMARY: Đã hoàn tất phân tích kiến trúc toàn diện cho Phase P0-C. Rà soát chi tiết thủ tục quy trách nhiệm 6 bước (Spec §3.6), khẳng định tính sẵn sàng 100% của attribution engine cho các scenario thất bại và probe SC-11. Làm rõ ranh giới Supported Execution Class trên mẫu số D=7 và cơ chế bảo toàn 3 luật chống gian lận thống kê (L1, L2, L3). Thiết lập đầy đủ hệ thống điều kiện cần và đủ cho phán quyết GATE-06 (§39).