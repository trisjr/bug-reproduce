---
id: FINDINGS-BA-PHASE-P1-UNGATE-V01
type: findings-report
status: approved
phase: P1
tasks: "D1, D2"
driver: "Business Analyst Lens (@business-analyst)"
date: 2026-08-28
reference_documents:
  - docs/010-Planning/pm-runs/2026-08-28-phase-p1-ungate-v01/brief.md
  - docs/035-QA/Reports/Report-Spike-Phase-0.md
  - docs/035-QA/Performance/Perf-Spike-Phase-0.md
  - docs/030-Specs/Spec-Spike-Protocol.md
  - docs/020-Requirements/NFR-Repro.md
  - docs/020-Requirements/PRD-Repro.md
  - docs/030-Specs/Architecture/SDD-Repro.md
  - docs/020-Requirements/Use-Cases/UC-02-Replay-Capsule-Locally.md
---

# 🕵️ Báo Cáo Phân Tích Chuyên Sâu Của Business Analyst — Phase P1

**Nhiệm vụ trọng tâm**: Task `D1` (Chốt ngưỡng cam kết $N\text{-}05$ Execution Match Rate) & Task `D2` (Nâng cấp 4 Acceptance Criteria Gaps $ACG\text{-}01/02/03/07$ thành Định Nghĩa Sản Phẩm Chính Thức cho Repro V0.1).

---

## 1. Tóm Tắt Điều Hành & Bối Cảnh Chuyển Giao Sau `GATE-06`

Sau khi **`GATE-06` (§39) chính thức được phê duyệt `CÓ` vào ngày 2026-08-28** (`docs/010-Planning/pm-runs/2026-08-28-p0c-spike-run-report/verdict.md`), Technical Spike Phase 0 đã hoàn thành 100% sứ mệnh kiểm chứng tính khả thi kỹ thuật với các kết quả thực nghiệm xuất sắc:
- **Tập In-Class ($D=7$)**: $21/21$ lượt replay đạt `matched` ($100.0\%$).
- **Chỉ số Composite Fail-Closed**: $7/7$ scenarios reproduced ($100.0\%$), vượt xa ngưỡng hiệu dụng ban đầu $\ge 6/7$.
- **An toàn tuyệt đối**: `escaped_side_effects = 0` được kiểm chứng độc lập bởi Canary Sink.
- **Tập Diagnostic (10 scenarios)**: $21/30$ replays matched ($70.0\%$), $3$ kịch bản ngoài phạm vi phân kỳ chính xác tại biên thiết kế với nhãn `out-of-scope-determinism`.
- **Probe $SC\text{-}11$ (Redis GAP)**: Phân kỳ ổn định $3/3$ lượt tại điểm gọi Redis sau khi destroy môi trường, gán nhãn chính xác `incomplete-capture`.

Bước sang **Phase P1 (Gỡ khoá sau gate · $W13\text{–}W15$, 24.5 MD)**, vai trò Business Analyst chịu trách nhiệm chuyển hoá các kết quả đo lường và các giả thuyết kỹ thuật (`HYPOTHESIS`) của Spike thành **bộ định nghĩa sản phẩm chính thức**, xoá bỏ hoàn toàn các vùng `TBD` và gỡ bỏ điều kiện phong toả của `GATE-02` để đội ngũ Product Owner và Architect sẵn sàng phân rã User Stories và đóng băng kiến trúc cho V0.1.

---

## 2. Task `D1` — Phân Tích Thực Nghiệm & Đề Xuất Ngưỡng Cam Kết $N\text{-}05$ (Execution Match Rate) Cho V0.1

### 2.1 Đối chiếu dữ liệu phân bố thực tế từ Spike Phase 0

Theo `Report-Spike-Phase-0.md` (Bảng `T2`, `T3`, `T6`), các chỉ số phân bố thực nghiệm thu được như sau:

| Tập khảo sát | Mẫu số ($N$) | Replay Success Rate ($R_{sr}$) | Execution Match Rate ($R_{em}$ thô) | Composite Fail-Closed ($K=3$) |
|---|:---:|:---:|:---:|:---:|
| **In-Class ($D=7$)** | $21$ replays ($7 \times 3$) | **`21/21 = 100.0%`** | **`21/21 = 100.0%`** | **`7/7 = 100.0%`** |
| **Diagnostic (10 scenarios)** | $30$ replays ($10 \times 3$) | **`30/30 = 100.0%`** | **`21/30 = 70.0%`** | **`7/10 = 70.0%`** |
| **Toàn bộ (11 scenarios gồm Probe)** | $33$ replays ($11 \times 3$) | **`33/33 = 100.0%`** | **`21/33 = 63.64%`** | **`7/11 = 63.64%`** |

### 2.2 Phân tích rủi ro độ mịn và cỡ mẫu nhỏ ($D=7$)

1. **Hiệu ứng bước nhảy phân vị**: Với $D=7$ kịch bản in-class, mỗi kịch bản tương đương với $14.285\%$ ($1/7$). Vì vậy, một con số cam kết trừu tượng dạng $\ge 80\%$ trong thực tế là quy tắc **"cho phép sai tối đa $1$ trên $7$ kịch bản"** ($\ge 6/7 = 85.71\%$).
2. **Khoảng cách giữa Synthetic Spike và Production Workload**: Mặc dù $100.0\%$ kịch bản in-class đạt `matched` trong môi trường spike, khi ra mắt sản phẩm V0.1 thực tế, các ứng dụng Node.js của khách hàng sẽ có sự phức tạp cao hơn về cấu trúc câu lệnh SQL, rẽ nhánh bất đồng bộ lồng nhau, và các middleware xử lý dữ liệu. Do đó, việc cam kết $100\%$ cứng nhắc sẽ tạo ra rủi ro vi phạm cam kết chất lượng sản phẩm (SLA breach).

### 2.3 Đề xuất Hệ thống Cam kết Đa Tầng (Multi-tier Commitment Framework) cho $N\text{-}05$ tại V0.1

Em đề xuất PM và Sponsor `@TrisJr` chính thức phê duyệt cấu trúc cam kết kép có phân tầng rõ ràng cho $N\text{-}05$ trong `NFR-Repro.md §3`:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG CAM KẾT EXECUTION MATCH RATE V0.1                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Core In-Class SLA (Ngưỡng cam kết sản phẩm chính thức):                  │
│    Execution Match Rate (Rem) ≥ 90.0% trên Supported Execution Class        │
│    (Cho phép dung sai ≤ 10% đối với các trường hợp biên phát sinh thực tế). │
│                                                                             │
│ 2. Composite Fail-Closed Gate (Ngưỡng kiểm thử chấp nhận MTP V0.1):          │
│    Composite Reproducibility Rate ≥ 80.0% (tức ≥ 6/7 kịch bản chuẩn         │
│    đạt đồng thời K=3 lượt replay matched liên tiếp).                        │
│                                                                             │
│ 3. Overall Diagnostic Floor (Sàn quan sát chẩn đoán):                      │
│    Rem (Composite Overall) ≥ 60.0% trên toàn bộ tập execution captured      │
│    (bao gồm cả các trường hợp rơi vào vùng biên out-of-scope).              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Cơ sở bảo vệ của đề xuất (Defensibility):**
- **Ngưỡng $\ge 90.0\%$ cho In-Class**: Khả thi và được bảo chứng bởi dữ liệu thực tế ($100\%$ tại Spike), đồng thời tạo biên an toàn $10\%$ cho các biến thể query/async phức tạp ở V0.1.
- **Ngưỡng $\ge 80.0\%$ Composite**: Duy trì đúng tinh thần ban đầu của $RQ.md\ \S24$ dòng 1, bịt kín lỗ rò co mẫu số khi replay hỏng bằng cơ chế fail-closed.
- **Sàn $\ge 60.0\%$ Diagnostic**: Đảm bảo Repro vẫn cung cấp giá trị chẩn đoán (Execution Diff) ngay cả khi ứng dụng của người dùng chạm vào các ranh giới chưa được hỗ trợ hoàn toàn.

---

## 3. Task `D2` — Nâng Cấp 4 ACGs Thành Định Nghĩa Sản Phẩm Chính Thức

### 3.1 `ACG-01` (Sufficiently Equivalent): Định Nghĩa Vận Hành & Rubric So Sánh 2 Tầng

#### 3.1.1 Định nghĩa đơn vị của Execution Path
Một đơn vị của Execution Path trong Repro V0.1 là một **`Interaction`** diễn ra tại ranh giới đã instrument (thuộc 8 nhóm capture của $RQ.md\ \S18$), được đóng khung bởi hai đơn vị neo bắt buộc:
1. **`U0` (Inbound Boundary Neo)**: Inbound HTTP Request đã chuẩn hoá (HTTP Method, Route Template, Filtered Headers, Canonical JSON Body).
2. **`U_i` (Intermediate Interaction Units)**: Dãy các tương tác với dependency bên ngoài trong quá trình thực thi:
   - `db-query`: SQL Query Fingerprint + Parameterized Bind Values $\to$ Recorded Result Rows.
   - `outbound-http`: Normalized URL Path Template + Query String $\to$ Recorded Status & Body.
   - `feature-flag`: Flag Key Name $\to$ Recorded Boolean/String Value.
   - `clock`: System Clock Access $\to$ Recorded Timestamp Value (phục vụ theo ngữ nghĩa $U\text{-}13$).
3. **`U∞` (Outbound Terminal Neo)**: Kết cục cuối cùng của execution — bao gồm HTTP Response Status Code / Canonical Body, hoặc **Danh tính Loại của Exception** (Exception Type Identity, e.g., `TypeError`, `QueryFailedError`). Tuyệt đối **không** so sánh chuỗi Stack Trace để tránh phân kỳ giả khi refactor code.

#### 3.1.2 Bốn phép Chuẩn hoá (Normalization Engine)
Trước khi đưa vào so sánh, mọi Interaction Unit phải đi qua 4 phép chuẩn hoá bắt buộc:
1. **SQL Fingerprinting**: Thay thế toàn bộ literal values bằng parameter markers (`$1, $2, ...`), chuẩn hoá khoảng trắng và chuyển keywords về chữ hoa. Giá trị literals được đưa vào trường `arguments` riêng biệt.
2. **URL Path Templating**: Rút gọn URL động về template (`/users/7731` $\to$ `/users/:id`) và sắp xếp lại thứ tự query parameters theo alphabet.
3. **JSON Canonical Form**: Sắp xếp toàn bộ key của object theo thứ tự từ điển, loại bỏ mọi khoảng trắng dư thừa.
4. **Redaction Marker Equivalence**: Mọi trường dữ liệu đã bị xoá/thay thế bởi Redaction Gate được gán nhãn `__REPRO_REDACTED__`. Phép so sánh chỉ so sánh sự xuất hiện của marker, coi hai marker là tương đương.

#### 3.1.3 Rubric So Sánh 2 Tầng Chính Thức

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TẦNG 1: CỔNG ĐÁNH GIÁ PHẠM VI (GATE)                     │
│  Kiểm tra Execution có thuộc "Supported Execution Class" (ACG-07) không?   │
│                                                                             │
│  [KHÔNG / KHÔNG THỂ XÁC ĐỊNH] ───────► Verdict = inconclusive              │
│                                        - Loại khỏi mẫu số cam kết N-05      │
│                                        - Bỏ qua Tầng 2                      │
│                                                                             │
│  [CÓ THUỘC CLASS] ───────────────────► Chuyển tiếp sang TẦNG 2             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   TẦNG 2: RUBRIC SO KHỚP NHỊ PHÂN TUYỆT ĐỐI                 │
│  Thực thi đối chiếu dãy Interaction giữa Production (P) và Local (L):       │
│                                                                             │
│  Điều kiện 1: Bằng nhau về độ dài dãy interaction sau normalization.        │
│  Điều kiện 2: Mọi đơn vị i bằng nhau trên tập trường bắt buộc:              │
│               - kind, target, arguments, direction, result                  │
│               - Ordinal so sánh theo Set Equality cho nhóm async đồng thời  │
│               - Canonical form cho payload JSON và Marker cho Redaction     │
│  Điều kiện 3: Khớp tuyệt đối hai neo biên U0 và U∞.                         │
│                                                                             │
│  [THOẢ CẢ 3 ĐIỀU KIỆN] ──────────────► Verdict = Execution matched          │
│                                                                             │
│  [VI PHẠM BẤT KỲ ĐIỀU KIỆN NÀO] ────► Verdict = Execution diverged         │
│                                        + Ghi nhận chỉ số phân kỳ đầu tiên   │
│                                        + Gán nhãn nguyên nhân 6 bước (§3.6) │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1.4 Thủ tục 6 bước Quy trách nhiệm Phân kỳ (Attribution Procedure)
Khi phán quyết là `Execution diverged`, hệ thống tự động chạy thủ tục kiểm tra theo thứ tự ưu tiên tuyệt đối:
1. **Bước 1 — `redaction`**: Đơn vị phân kỳ chứa trường bị thay đổi bởi Redaction Gate.
2. **Bước 2 — `incomplete-capture`**: Capsule thiếu dữ liệu mà code local yêu cầu (và không có cờ `truncated`).
3. **Bước 2b — `truncated`**: Capsule mang cờ `truncated: true` do chạm trần dung lượng hoặc quota `SEC-008`.
4. **Bước 3 — `version-drift`**: Phát hiện sự sai lệch về Git commit, runtime version, dependency hoặc schema.
5. **Bước 4 — `out-of-scope-determinism`**: Kết quả replay không ổn định qua $K=3$ lượt chạy lặp lại (`replay_unstable`).
6. **Bước 5 — `code`**: Mã nguồn local thực sự đã thay đổi logic so với production và không rơi vào các bước trên.
7. **Bước 6 — `unattributed`**: Không khớp bất kỳ bước nào ở trên (bắt buộc báo cáo tỷ lệ độc lập).

#### 3.1.5 Giới hạn cấu trúc đã biết (Known Structural Limitations)
- **Điểm mù $W1$ (Recall = 0 với rẽ nhánh thuần logic)**: Nếu mã nguồn thay đổi rẽ nhánh nhưng không tạo ra bất kỳ interaction nào với DB/HTTP và cho cùng kết cục exception, rubric sẽ kết luận `Execution matched`.
- **Ràng buộc ngôn từ chính thức**: Phát biểu hợp lệ duy nhất của kết luận `Execution matched` là:
  > *"Không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục."*  
  *(Tuyệt đối cấm phát biểu: "Production bug đã được sửa" hoặc "Local execution giống hệt production").*

---

### 3.2 `ACG-02` (Meaningful Test Case Selection): Tiêu Chí Phân Loại Bug Sản Phẩm Cho V0.1

Chuyển đổi từ các tiêu chí chọn fixture của spike ($M\text{-}1$ đến $M\text{-}6$) thành **Bộ Tiêu Chí Phân Loại Bug Sản Phẩm (Product Bug Qualification Criteria — `PBQ`)** cho V0.1:

Một sự cố/lỗi production được định nghĩa là **"Meaningful Product Bug"** thuộc phạm vi giải quyết của Repro V0.1 khi và chỉ khi thoả mãn đồng thời 5 tiêu chí:
1. **`PBQ-1` (Architecture Scope)**: Xảy ra trong ứng dụng thuộc Target Stack V0.1 (Node.js runtime, cơ sở dữ liệu PostgreSQL, giao tiếp qua giao thức HTTP).
2. **`PBQ-2` (Execution Boundary)**: Phát sinh trong vòng đời của một Inbound HTTP Request đơn lẻ và kết thúc có thể xác định (HTTP Error Response hoặc unhandled Exception).
3. **`PBQ-3` (Causal Capture Completeness)**: Mọi dữ liệu đầu vào có quan hệ nhân quả dẫn đến lỗi đều đi qua 8 interception seams được hỗ trợ ($RQ.md\ \S18$).
4. **`PBQ-4` (Deterministic Reproducibility)**: Lỗi có tính tất định ở tầng logic nghiệp vụ, không phải là kết quả của race condition đa luồng phân tán hoặc biến thiên entropy hệ thống chưa được kiểm soát.
5. **`PBQ-5` (Safe Replayability)**: Có thể replay lại cục bộ dưới cơ chế chặn tác dụng phụ ghi (`default-deny writes`) mà không đòi hỏi phải có kết nối mạng tới hạ tầng production sống.

---

### 3.3 `ACG-03` (Denominator & "Reproduced"): Chuẩn Hoá Mẫu Số & Chỉ Số Thành Công

1. **Mẫu số chính thức của V0.1 (Denominator Definition)**:
   $$\text{Denominator } (D_{supported}) = \text{Toàn bộ các Execution lỗi được Capture thuộc Supported Execution Class}$$
   - Mọi execution được phát hiện nằm ngoài Supported Execution Class sẽ bị chặn tại **Cổng Inconclusive (Tầng 1)** và được loại trừ khỏi mẫu số cam kết SLA $N\text{-}05$.
   - Các trường hợp ngoại lệ bị loại trừ phải được ghi log minh bạch trong báo cáo audit định kỳ.

2. **Định nghĩa chính thức của "Reproduced"**:
   - **`Reproduced` $\equiv$ `Execution Matched`**: Một bug chỉ được tính là đã tái lập thành công khi và chỉ khi lượt replay đạt đầy đủ cả 3 điều kiện của Rubric Tầng 2.
   - **Cấm dùng `Replay Completed` (RSR) làm tiêu chí thành công**: Replay chạy hết tiến trình mà không crash chỉ là điều kiện cần về mặt vận hành, không chứng minh được tính tương đương hành vi.

3. **Nguyên tắc Composite Fail-Closed cho Nghiệm Thu Sản Phẩm**:
   - Một trường hợp kiểm thử / bug chỉ được công nhận là `Reproduced` khi và chỉ khi **cả $K=3$ lượt replay độc lập liên tiếp** đều đạt kết quả `Execution matched`.
   - Bất kỳ lượt chạy nào bị lỗi khởi động, thiếu capture hoặc phân kỳ đều khiến trường hợp đó bị đánh giá là **`Not Reproduced` (Fail-Closed)**.

---

### 3.4 `ACG-07` (Supported Execution Class): Định Nghĩa Sản Phẩm Đầy Đủ 3 Phần

#### 3.4.1 (i) Ba Điều Kiện Đủ Cốt Lõi (`SEC-C1` .. `SEC-C3`)
Một execution được xác định thuộc **Supported Execution Class của Repro V0.1** khi và chỉ khi thoả mãn đồng thời 3 trụ cột:
1. **`SEC-C1` (Hình thái & Không gian tiến trình)**: Execution được khởi tạo bởi **đúng một Inbound HTTP Request**, xử lý tuần tự/bất đồng bộ hoàn toàn **bên trong một OS Process đơn lẻ** (Node.js), và kết thúc bằng một HTTP Response hoặc một Exception văng ra khỏi handler.
2. **`SEC-C2` (Ranh giới Interception Seams)**: Mọi external input ảnh hưởng tới kết cục đều đi qua một trong **8 nhóm capture** của V0.1:
   - PostgreSQL Queries & Results (`pg`, `postgres`, `TypeORM`, `Prisma`).
   - Outbound HTTP Calls & Responses (`fetch`, `http/https`, `axios`).
   - Feature Flag Evaluations (LaunchDarkly, Unleash, internal toggles).
   - System Clock & Timestamp reads (`Date.now()`, `new Date()`).
   - Inbound HTTP Request metadata & canonical payload.
   - Stack trace & Error objects.
   - Git commit hash & Source repository metadata.
   - Node.js runtime version & Environment metadata.
3. **`SEC-C3` (Tính tất định cục bộ & An toàn Write)**: 
   - Nguồn phi tất định duy nhất được mô phỏng là System Clock (theo ngữ nghĩa phát lại dãy timestamp đã ghi $U\text{-}13$).
   - Mọi thao tác ghi phân loại WRITE đều được xử lý an toàn fail-closed bởi Replay Proxy mà không làm sai lệch luồng điều khiển.

#### 3.4.2 (ii) Điều Kiện Loại Trừ Tường Minh (Explicit Exclusion Criteria)
Repro V0.1 tường minh loại trừ hai trục khỏi cam kết hỗ trợ:

| Trục loại trừ | Các thành phần cụ thể bị loại trừ | Cơ chế xử lý & Hướng tiến hoá |
|---|---|---|
| **Trục 1: Hidden Inputs & System Entropy** | • **Environment Variables** thay đổi lúc runtime.<br>• **Filesystem State** (đọc ghi file cục bộ ngoài memory).<br>• **Process Memory State** (module-level cache, connection pool warmness).<br>• **Kernel Entropy & Unseeded Randomness** (UUID generation không qua mock).<br>• **Uninstrumented Async Concurrency** (Dangling timers, background workers ngoài request lifecycle).<br>• **OS Scheduling & Hardware Interrupts**. | Đánh giá tại Cổng Tầng 1 $\to$ Trả về `inconclusive`. Nếu lọt vào replay $\to$ Bắt tại bước 4 `out-of-scope-determinism` ($U\text{-}25$). Tiến hoá xử lý tại V0.2/V0.3. |
| **Trục 2: External Dependencies & Topology** | • **Redis / In-memory Cache State** (Quyết định `G1`, `GAP-Redis`).<br>• **Kafka / RabbitMQ / Message Queues**.<br>• **Distributed Race Conditions** (Race giữa nhiều request/service).<br>• **Giao thức Non-HTTP** (gRPC, WebSockets, Raw TCP Sockets).<br>• **Cơ sở dữ liệu ngoài PostgreSQL** (MySQL, MongoDB, Oracle). | Bị chặn bởi biên Interception $\to$ Phân kỳ tại bước 2 `incomplete-capture`. Hoãn hỗ trợ sang V0.2 (Browser) và V0.3 (Redis, Kafka, Multi-service). |

#### 3.4.3 (iii) Quy Tắc Ứng Xử 3 Thời Điểm (Lifecycle Behavior)
1. **Tại thời điểm Capture (Production)**:
   - **Vẫn Capture đầy đủ**: Không từ chối capture khi gặp dependency lạ để bảo vệ tối đa dữ liệu sự cố.
   - **Gắn khối `class_assessment` vào Capsule**: Tự động đánh giá các điều kiện `SEC-C1..C3` và ghi rõ cờ nhận diện (e.g., `is_supported_class: true/false`, `detected_unsupported_dependencies: ["redis"]`).
2. **Tại thời điểm Replay (Local)**:
   - **Vẫn thực thi Replay**: Tận dụng tối đa các recorded inputs đã có trong capsule.
   - **Chặn trần kết quả & Cấm Fallback**: Nếu thiếu dữ liệu của dependency ngoài class, Replay Runtime **tuyệt đối không gọi thật ra ngoài**, không crash tiến trình, mà kết thúc có kiểm soát và trả về verdict `incomplete-capture` / `Execution diverged`.
3. **Tại thời điểm Đo lường SLA (Metrics & Analytics)**:
   - **Loại trừ khỏi Mẫu số Cam kết $N\text{-}05$**: Các execution mang cờ `is_supported_class = false` không bị tính là lỗi của Repro trong chỉ số cam kết $N\text{-}05$ của V0.1.

---

## 4. Ma Trận Đề Xuất Cập Nhật Các Tài Liệu Yêu Cầu & Kiến Trúc

Dưới đây là danh mục chi tiết các thay đổi cụ thể cần thực hiện trong các tài liệu hạ nguồn tại Phase P1:

| Tài liệu | Mục / Section | Nội dung cập nhật chi tiết | Mục đích & Tác động |
|---|---|---|---|
| **`NFR-Repro.md`** | **§3 (`N-05`)** | • Đóng trạng thái `TBD` của $N\text{-}05$.<br>• Ghi nhận chính thức cam kết SLA V0.1: **$R_{em} \ge 90.0\%$ (In-Class)**, **Composite Fail-Closed $\ge 80.0\%$ (hiệu dụng $\ge 6/7$)**, và **Diagnostic Floor $\ge 60.0\%$**.<br>• Bổ sung số liệu thực nghiệm Phase 0 làm bằng chứng lịch sử. | Chốt thước đo thành công cốt lõi của V0.1; gỡ bỏ blocker của `GATE-02`. |
| **`NFR-Repro.md`** | **§7 (`ACG-01`, `02`, `03`, `07`)** | • Xoá bỏ nhãn `HYPOTHESIS — cần validate`.<br>• Nâng cấp nội dung 4 ACGs thành **Định nghĩa Sản phẩm chính thức** (Rubric 2 tầng, Normalization 4 phép, Phân loại Bug PBQ, Supported Execution Class 3 phần).<br>• Cập nhật các liên kết chéo tới `PRD` và `SDD`. | Chuẩn hoá toàn diện các khoảng trống nghiệm thu của yêu cầu phi chức năng. |
| **`PRD-Repro.md`** | **§5.7 (`FR-041`)** | • Đặc tả chi tiết logic vận hành của `FR-041` (Execution Verification Engine) dựa trên Rubric Tầng 2 và 4 phép chuẩn hoá. | Biến feature quan trọng nhất về độ tin cậy thành tài liệu có thể lập trình được. |
| **`PRD-Repro.md`** | **§8.2 & §10.4 (KPI V0.1)** | • Chốt số lượng bug đạt `Execution matched` với tỷ lệ cam kết $\ge 90\%$ trên tập Supported Execution Class làm KPI chính thức của V0.1. | Đóng vĩnh viễn mâu thuẫn M1 và thiết lập tiêu chí Pass/Fail cho MVP V0.1. |
| **`PRD-Repro.md`** | **§10.5 (`ACG-07`)** | • Đóng mục gap `ACG-07`, thay thế bằng định nghĩa 3 phần của Supported Execution Class. | Xoá nợ khái niệm trong PRD. |
| **`SDD-Repro.md`** | **§1.4 (Ubiquitous Language)** | • Cập nhật định nghĩa chính thức cho `Supported Execution Class`, `Execution Verification`, `Execution Path Interaction Units`. | Đồng bộ ngôn ngữ miền giữa nghiệp vụ và kiến trúc. |
| **`SDD-Repro.md`** | **§3.9 & §8.3 (`U-04`)** | • Đóng `Open item U-04` bằng thiết kế Rubric 2 tầng và mô hình Interaction Unit.<br>• Tích hợp Cổng Inconclusive vào Replay Pipeline Engine. | Hoàn tất thiết kế chi tiết cho module Execution Verification. |
| **`UC-02-Replay-Capsule-Locally.md`** | **Precondition `P6`** | • Thay thế ghi chú `TBD` bằng 3 điều kiện đủ của Supported Execution Class (`SEC-C1..C3`). | Làm cho precondition P6 kiểm chứng được bằng máy. |
| **`UC-02-Replay-Capsule-Locally.md`** | **Main Flow & Flow `A3`, `A4`, `A5`** | • Cập nhật luồng chính với output checklist chuẩn hoá.<br>• Flow `A3`/`A4`: Gắn trực tiếp kết quả đánh giá của Rubric Tầng 2.<br>• Flow `A5`: Quy định rõ phán quyết `incomplete-capture`, cấm fallback sang hệ thống thật. | Hoàn thiện Use Case tái hiện lỗi cục bộ. |

---

## 5. Kế Hoạch Chuyển Giao Cho Các Tasks Tiếp Theo Của Phase P1

Kết quả phân tích của Business Analyst tại tài liệu này là đầu vào trực tiếp để mở khoá các nhiệm vụ tiếp theo trong Phase P1:
1. **Bàn giao cho 🏗️ Architect (Tasks `D3`, `D5`, `D6`)**:
   - Sử dụng định nghĩa đơn vị Interaction và 4 phép normalization để đóng băng **Repro Capsule Format v1 (`D5`)** trong `SDD-Repro.md §4` và `ADR-002`.
   - Sử dụng cơ chế phân loại lỗi và ranh giới class để giải quyết dứt điểm các open items $U\text{-}01, U\text{-}02, U\text{-}03, U\text{-}04, U\text{-}13, U\text{-}20$ tại Task `D3`.
2. **Bàn giao cho 📋 Product Owner (Task `D7` — Gỡ `GATE-02`)**:
   - Toàn bộ điều kiện tiên quyết của `GATE-02` đã được thoả mãn: `GATE-06 = CÓ`, ngưỡng $N\text{-}05$ đã chốt, và 4 ACGs đã có định nghĩa chính thức.
   - PO có đầy đủ cơ sở nghiệm thu để tiến hành phân rã 5 Epics (`Epic-01` .. `Epic-05`) và 15 User Stories chuẩn INVEST trong `docs/022-User-Stories/`.
3. **Bàn giao cho 🧪 Quality Assurance (Task `D8`)**:
   - Sử dụng bộ tiêu chí phân loại Bug `PBQ-1..5` và Rubric 2 tầng để xây dựng **Master Test Plan V0.1 (`MTP-Repro-V0.1.md`)** với ma trận test cases bao phủ toàn bộ Supported Execution Class.
4. **Bàn giao cho 🛡️ Security Specialist (Task `D9`)**:
   - Sử dụng quy tắc Redaction Marker Equivalence và các điều kiện loại trừ hidden inputs để rà soát, cập nhật `Spec-Security-Repro-Threat-Model.md`.

---

```text
STATUS: DONE
FILES_TOUCHED: docs/010-Planning/pm-runs/2026-08-28-phase-p1-ungate-v01/findings/business-analyst.md
SUMMARY: Đã hoàn tất phân tích chi tiết Tasks D1 & D2 cho Phase P1: (1) Chốt đề xuất cam kết SLA N-05 kép (Rem ≥ 90% In-Class, Composite Fail-Closed ≥ 80%, Diagnostic Floor ≥ 60%); (2) Nâng cấp toàn diện 4 ACGs (ACG-01, 02, 03, 07) thành định nghĩa sản phẩm chính thức gồm Rubric 2 tầng, Normalization 4 phép, Tiêu chí phân loại Bug PBQ, và Supported Execution Class 3 phần; (3) Lập ma trận chi tiết các thay đổi cần cập nhật vào NFR-Repro, PRD-Repro, SDD-Repro, UC-02; sẵn sàng mở khoá hoàn toàn cho Tasks D3–D9 và gỡ bỏ GATE-02.
```
