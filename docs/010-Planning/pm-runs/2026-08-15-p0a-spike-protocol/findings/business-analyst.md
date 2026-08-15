# Findings — business-analyst

> Lens phân tích cho `A4` (`ACG-02` tiêu chí *"meaningful"* + `ACG-03` denominator và định nghĩa *"reproduced"*). **Read-only**, `FILES_TOUCHED: none`.

## Kết luận của worker

```
STATUS: DONE
FILES_TOUCHED: none
SUMMARY: Đề xuất 6 tiêu chí "meaningful" kiểm được (M-1…M-6), áp lên 10 scenario §22 ⇒
IN = {1,2,3,4,5,6,8}, OUT = {7,9,10}; denominator hypothesis = 7, ngưỡng hiệu dụng ≥6/7.
"Reproduced" đề xuất = Execution Match Rate (bị M1 2026-08-14 ràng buộc, không phải quyết định hộ),
kèm chỉ số composite ở mức scenario để bịt lỗ rò "Total replays" của §23 — nếu không bịt, EMR có
thể đọc 100% khi 4/7 scenario chưa từng replay.
GAP-Redis: (a) đơn độc ⇒ denominator = 0 (suy biến, không trả lời được §39); (b) = 7; (c) = 7 kèm
yêu cầu bất biến hạ nguồn ở B1; (a)+(c) = 7. Lựa chọn thật cho Sponsor là (b) · (c) · (a)+(c).
Scenario 7/9/10 vẫn dựng fixture và chạy, ghi riêng ở observation set, ràng buộc bằng ba luật:
đóng băng tại GA · bánh cóc một chiều · báo cáo hai mẫu số.
Mọi thứ trên là HYPOTHESIS; nâng lên định nghĩa sản phẩm là D2. Phụ thuộc cứng: lựa chọn EMR sụp
nếu A3 không cho ra rubric nhị phân — phải escalate GA, không được âm thầm tụt về RSR.
```

## Nội dung chính

### `ACG-02` — định nghĩa hẹp lại, cố ý

> **meaningful ≡ (nằm trong Supported Execution Class của `A2`) ∧ (chấm được pass/fail bằng rubric `A3` không cần phán đoán chủ quan)**

Worker **cố ý không** định nghĩa *"meaningful"* theo nghĩa *"quan trọng với business"* — tiêu chí kiểu đó không kiểm được và mở đúng cửa gian lận mà `ACG-02` cảnh báo. Bộ tiêu chí này trả lời *"case này có được tính vào ngưỡng không"*, **không** trả lời *"case này có đáng làm sản phẩm không"*.

**Sáu tiêu chí nhị phân, kiểm được trước khi chạy:**

| ID | Nội dung |
|---|---|
| `M-1` | Trigger lặp lại được `K/K` lần (`K` là tham số chốt ở `A5`) |
| `M-2` | Input nhân quả nằm trong **8 nhóm capture §18** |
| `M-3` | Execution đóng: một request → một response, cùng process |
| `M-4` | Không phụ thuộc concurrency / event ordering |
| `M-5` | Chữ ký lỗi **và verdict kỳ vọng** khai trước khi chạy |
| `M-6` | Chấm được dưới ràng buộc default-deny WRITE của `B5` (qua block log) |

### Áp lên 10 scenario §22

| IN — denominator (7) | OUT — observation set (3) |
|---|---|
| 1 DB state · 2 External API · 3 Feature flag · 4 Time-dependent · 5 Missing data · 6 Version diff · 8 Side effect | 7 Randomness (`M-2` hỏng) · 9 Async (`M-3` hỏng) · 10 Race condition (`M-4` hỏng) |

**Denominator = 7. Ngưỡng hiệu dụng `≥80%` ⇒ `≥ 6/7`.** `5/7 = 71.4%` là trượt.

Scenario 6 **IN có điều kiện**: fixture phải replay theo version ghi trong capsule (verdict kỳ vọng `matched`). Nếu fixture thay vào đó đo *version mismatch detection* thì verdict kỳ vọng là `diverged` ⇒ **OUT**. Chọn nhánh nào phải khai **tại `A4`**.

### `ACG-03` — *"reproduced"* = Execution Match Rate

Ba lý do: (1) quyết định `M1` 2026-08-14 chốt metric V0.1 = *"số bug đạt `Execution matched`"* — gate spike bằng RSR là chấm bằng chỉ số không đo trạng thái mà V0.1 dùng để định nghĩa thành công; (2) `NFR` 2.1(b) đã đề xuất hướng này; (3) **scenario 8 chỉ chấm được bằng EMR** — side effect thật không được phép xảy ra, nên RSR không chấm được, còn EMR chấm qua block log của `B5`.

> Worker phát biểu đúng mức: `M1` **ràng buộc**, **không chốt hộ** `ACG-03` — nó chỉ loại nhánh RSR khỏi tập lựa chọn hợp lệ.

### 🔺 Lỗ rò của EMR — điểm nặng nhất của lens này

§23 định nghĩa `EMR = Equivalent executions / **Total replays**`. Mẫu số là **số lần replay**, không phải số test case.

⇒ Scenario **không replay được** (crash, capsule không mở được, replay từ chối) **rơi hẳn khỏi mẫu số**. Hệ quả: **3 scenario replay, cả 3 khớp ⇒ EMR = 100%**, trong khi **4/7 scenario chưa từng replay**. Spike báo *"đạt"* trong đúng kịch bản tệ nhất.

**Bịt bằng chỉ số composite ở mức scenario, fail-closed:**

```
scenario "reproduced" ⟺ (a) replay chạy tới kết quả VÀ (b) verdict A3 = Execution matched
scenario không replay được ⇒ KHÔNG reproduced, KHÔNG bị loại khỏi mẫu số
chỉ số gate = (số scenario reproduced) / 7
```

`C2` **vẫn** báo cả RSR lẫn EMR thô theo §23 — composite là **chỉ số gate**, không thay thế.

### Ba luật chống gian lận thống kê

| Luật | Nội dung |
|---|---|
| **Đóng băng** | Tập 7 scenario + toàn bộ verdict kỳ vọng đóng băng **tại `GA`**, ghi vào `verdict.md`, trước khi `C1` chạy dòng đầu tiên |
| **Bánh cóc một chiều** | Denominator **chỉ co, không bao giờ nở**. Scenario trong observation set **dù pass** cũng không được kéo vào. Chỉ loại khỏi denominator nếu `M-1` hỏng tại `B8`, ghi lý do **trước** `C1` |
| **Hai mẫu số** | Denominator co lại ⇒ `C4` in **cả** `7` gốc **và** số đã co, kèm lý do |

## PM đọc được gì

### 1. 🔴 Lens này LẬT phương án (a) của `GAP-Redis` — em đã trình bày sai cho anh ở lượt trước

Em đưa ba phương án (a)/(b)/(c) như ba lựa chọn ngang nhau. **Sai.**

`Timeline §3` tự viết: *"cache state lại là **input thật** của execution"* và *"**cả 10 scenario** đều replay với ít nhất một input không được ghi lại"*. Với test app đúng đặc tả `B1` (*"chạm **cả 5** dependency trong một request"*), **mọi** execution phụ thuộc Redis state ⇒ `M-2` hỏng ở **cả 10 dòng** ⇒ **denominator = 0**.

> **Phương án (a) đơn độc là suy biến: nó cho denominator = 0 và spike không trả lời được câu hỏi §39.**

⇒ Lựa chọn thật đưa Sponsor là **(b) · (c) · (a)+(c)** — ba phương án, không phải ba trong đó có một cái vô nghĩa.

### 2. Mỗi phương án đổi **ý nghĩa** của cùng con số `6/7` — đây mới là điều Sponsor cần biết

| Phương án | Denom | Con số `6/7` khi đó nói gì |
|---|:--:|---|
| **(b)** capture Redis throwaway | 7 | Trả lời câu hỏi **rộng hơn V0.1** — spike đo một capture surface mà V0.1 **sẽ không có** (`C-03` đặt Redis ở V0.3). `C4` bắt buộc khai giới hạn này |
| **(c)** Redis không ảnh hưởng kết quả | 7 | Trả lời câu hỏi **hẹp hơn thực tế** — Redis đóng góp **đúng 0 thông tin**. Đúng như Timeline gọi là *"dễ hơn thực tế"* |
| **(a)+(c)** | 7 | Sạch nhất về định nghĩa **và** giữ denominator. Nhưng **không cho biết gì** về execution có cache — mà cache là thứ hầu như mọi app production đều dùng |

Không phương án nào cho câu trả lời "đúng thực tế". Đây là đánh đổi thật, không phải chọn cái tốt nhất.

### 3. Phương án (c) đẻ ra một yêu cầu kỹ thuật mới cho `B1`

Worker chỉ ra: dưới (c), interaction Redis **tự động** không nằm trong phép so sánh (vì Redis không được instrument) ⇒ **không cần** luật loại trừ trong rubric `A3`. Thứ cần thay vào là một **bất biến hạ nguồn kiểm được**:

> Lúc replay, Redis đã bị destroy ⇒ lời gọi Redis sẽ lỗi. Lỗi đó **không được làm đổi bất kỳ instrumented interaction hạ nguồn nào** — cache-hit lúc capture và cache-miss/lỗi lúc replay phải cho **cùng** chuỗi DB/HTTP và **cùng** response.

⇒ Đây là **exit criteria mới cho `B1`**, ripple sang `P0-B`. PM ghi vào `outline.md`.

### 4. Hai lens QA và BA **khớp nhau**, không mâu thuẫn

Cả hai đọc §23 giống nhau (`EMR` mẫu số = `Total replays`). Khác biệt là **vai trò**: QA mô tả metric §23 phải báo cáo thế nào; BA chỉ ra dùng nó **làm chỉ số gate** thì rò, và đề xuất composite. BA nói thẳng *"composite là chỉ số gate, không thay thế hai chỉ số §23"* ⇒ **hai lens hợp nhất được**, không cần PM phân xử.

Điểm hai lens **cùng** chỉ ra, ở hai đường khác nhau — đáng chú ý:

| | QA | BA |
|---|---|---|
| Nguyên tắc | fail-closed khi replay 2 lần khác verdict (`U-25`) | fail-closed khi scenario không replay được |
| Chung một điều | **Bằng chứng thiếu ⇒ tính là KHÔNG đạt, không phải loại khỏi mẫu số** | |

### 5. Phụ thuộc cứng phải khai ở `A1`

Lựa chọn EMR **sụp hoàn toàn** nếu `A3` không cho ra rubric nhị phân chạy tay được. Khi đó `A4` **không được âm thầm tụt về RSR** — phải escalate lên `GA` như `BLOCKER`, vì tụt về RSR là **đổi cả câu hỏi mà `GATE-06` trả lời**.

### 6. Cảnh báo độ mịn — nên trình bày dạng `6/7`, không dạng `80%`

Denominator = 7 ⇒ **một scenario = 14.3 điểm phần trăm**. Ngưỡng `≥80%` mất gần hết ý nghĩa thống kê ở cỡ mẫu này; nó thực chất là quy tắc *"được sai tối đa 1 trên 7"*. PM đồng ý: mọi nơi trình bày cho Sponsor dùng **`≥6/7`**, không dùng `80%` — để không tạo cảm giác chính xác giả.

## Mâu thuẫn với lens khác

Không có mâu thuẫn với `quality-assurance` (xem mục 4 ở trên). `architect` và `security-auditor` chưa trả kết quả tại thời điểm ghi file này — hai điểm cần đối chiếu:

| Cần đối chiếu | Với lens | Vì sao |
|---|---|---|
| `M-2` dựa trên "8 nhóm capture §18"; `M-6` dựa trên block log của `B5` | `architect` | Nếu `A2` định nghĩa Supported Execution Class rộng/hẹp hơn 8 nhóm §18 thì bảng IN/OUT phải tính lại |
| Rubric `A3` có xuất ra verdict nhị phân **và** điểm phân kỳ đầu tiên không | `architect` | Cả BA (`ACG-03`) lẫn QA (checklist quy trách nhiệm) đều treo trên điều này |
| Phương án (b) — capture Redis trong spike | `security-auditor` | Mở rộng capture surface ⇒ chạm `OQ-2` (dữ liệu thật hay giả lập) và `THREAT-005` |
