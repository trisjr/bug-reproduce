# Findings — quality-assurance

> Lens phân tích cho `A5` (measurement plan) và `A6` (template spike report). **Read-only**, `FILES_TOUCHED: none`.

## Kết luận của worker

```
STATUS: DONE
FILES_TOUCHED: none
SUMMARY: Đã phân tích đủ 4 mục cho A5/A6. (1) Bảng 5 metric × 4 thuộc tính, kèm cách bịt ACG-04
(percentile/baseline/tầng app/100% traffic + nghịch lý buffer-rồi-huỷ của FR-012), ACG-05 (loại
repro pull nhưng vẫn đo riêng, boot nằm trong cửa sổ dạng breakdown), ACG-11 (điểm đo = artifact
cuối đã redact+compress, kèm P-serialized làm diagnostic; P95 phải đi kèm N).
(2) SEC-008 cần recorder log row_count/byte_size/consumed_by_replay cho MỌI query result với cap
TẮT — nếu cap bật thì phân bố bị censored và phải chạy lại toàn bộ C1.
(3) Template: 8 bảng bắt buộc, danh sách phát biểu được phép/cấm (chống R-07), hai nhánh §39 đối
xứng, verdict giữ nhị phân — bằng chứng yếu đi vào ô Confidence.
(4) GAP-Redis: Known-Missing-Input Manifest niêm phong TRƯỚC C1 + checklist quy trách nhiệm 5 bước
có thứ tự, với U-25 (replay 2 lần) là công cụ duy nhất tách được non-determinism khỏi thiếu-capture
bằng dữ liệu. Plan chạy được dưới cả 3 phương án A2; ràng buộc cứng duy nhất là C1 không khởi động
trước khi A2 ghi quyết định.
```

## Nội dung chính

### 5 metric × 4 thuộc tính

| Metric | Mốc đo | Population | Điểm cần chú ý |
|---|---|---|---|
| Replay Success Rate `N-01` | hoàn tất bước 7 → verdict *"reproduced"* | denominator của `A4` — **biến**, chốt trước `C1` | — |
| **Execution Match Rate `N-05`** | một lần replay xong → verdict rubric `A3` | **`Total replays`, KHÔNG phải total test case** (§23 viết rõ). Cộng `U-25`: mỗi capsule replay **≥2 lần** ⇒ population = capsule × số lần | Hai denominator này hay bị nhầm lẫn |
| Capture Overhead `N-02/06/07/08` | cặp A/B **xen kẽ** (OFF/ON/OFF/ON), tầng ứng dụng | **100% traffic** | xem bên dưới |
| Capsule Size `N-03`/`N-09` | artifact **đã persist** (sau redact, sau compress, sau encrypt) | mọi capsule của `C1` | avg **và** P95 **và** `N` |
| Replay Time `N-04` | `repro replay` → verification verdict. **Loại `repro pull`** (§8 tách bước riêng) nhưng **vẫn đo riêng** | mọi lần replay | boot app nằm **trong** cửa sổ, tách breakdown |

### `ACG-04` — nghịch lý capture trigger phải đo đúng

`FR-012`/§20.7 nói *"capture only failed executions"*, nhưng execution chỉ biết là failed **sau khi** kết thúc ⇒ recorder buộc buffer **mọi** execution rồi huỷ khi thành công. ⇒ Ngân sách `<5%` áp lên **100% traffic**, và **đường tốn kém nhất về số lượng là buffer-rồi-huỷ**, không phải đường persist.

⇒ Phải đo **hai path riêng**: request thành công (buffer + discard) và request lỗi (buffer + redact + serialize + compress + encrypt + upload). Sampling `FR-015` **phải TẮT** trong spike và trạng thái đó ghi vào điều kiện đo.

### `ACG-11` — P95 với `N`≈10 gần bằng `max()`

Bắt buộc ghi **`N` cạnh P95**. `C5` **không** được chốt `N-09` từ một P95 có `N` quá nhỏ mà không khai điều đó.

### Template — hai nhánh §39 đối xứng, verdict giữ nhị phân

8 bảng bắt buộc (`T1`–`T8`), trong đó `T1` = **khai báo trước khi chạy** (denominator, chỉ số, class, phương án `GAP-Redis`) — bảng này chống gian lận thống kê hậu kỳ.

Nhánh **Không** dùng **cùng bộ khung** với nhánh Có, không phải phụ lục; đầu ra của nó nuôi thẳng `N1`–`N3` ở [Timeline §5.1](../../../Estimates/Timeline-Repro.md).

**Không thêm verdict thứ ba** kiểu *"không kết luận được"* — bằng chứng yếu đi vào ô Confidence (`T7`). Thêm nhánh thứ ba là cách êm ái nhất để không ai phải quyết gì.

### `GAP-Redis` — thủ tục quy trách nhiệm 5 bước

**Bước 0, trước `C1`**: dựng **Known-Missing-Input Manifest** cho từng scenario — mọi input **đã biết trước** là không capture (Redis đứng đầu), **niêm phong trước khi chạy**.

Khi một replay `diverged`, chạy theo **đúng thứ tự**:

| # | Kiểm tra | Kết luận |
|---|---|---|
| 1 | `U-25` — hai lần replay cùng capsule cho **khác** verdict? | **Non-determinism** — kết luận duy nhất được chứng minh bằng thực nghiệm |
| 2 | Điểm phân kỳ đầu tiên chạm mục trong **Manifest**? | *"Thiếu capture, đã biết trước"* — ❌ **CẤM** ghi là non-determinism |
| 3 | Field nằm trong **redaction record** của capsule? | *"Diverged vì redaction"* |
| 3b | Capsule có `truncated: true` tại điểm phân kỳ? | *"Diverged vì cap cắt dữ liệu"* — `UC-02 A5` cảnh báo nó **giống hệt** thiếu input |
| 4 | Còn lại | Code drift / môi trường, phân xử theo `A3` |

`U-25` là công cụ rẻ nhất và mạnh nhất: non-determinism biểu hiện **không lặp lại được chính nó**, thiếu input biểu hiện **diverged ổn định tại cùng một điểm**.

## PM đọc được gì

### 1. Xuất hiện một ràng buộc "mất là mất" chưa ai ghi ở đâu — `SEC-008` cap phải TẮT

Nếu `C1` chạy với **bất kỳ** row/byte cap nào đang bật, mọi result vượt cap bị **cắt trước khi được đo** ⇒ phân bố thu được bị **kiểm duyệt (censored)** ở đúng cái đuôi mà `SEC-008` cần nhìn. **Không khôi phục được hậu kỳ ⇒ phải chạy lại toàn bộ `C1`.**

Đây là rủi ro tiến độ thật, không phải chi tiết kỹ thuật: `C1` là 3.0 MD và nằm ở `W8`. Chạy lại nó **ăn hết tuần đệm `W7`** — đúng tuần đệm anh vừa mua bằng cách giãn Phase 0.

Nhưng có một va chạm: AC hiện tại của `SEC-008` nói *"ngưỡng chưa cấu hình ⇒ áp giá trị mặc định bảo thủ, **không** coi là không giới hạn"*. ⇒ Spike cần **miễn trừ tường minh**, và miễn trừ đó phải được `security-auditor` phán quyết là an toàn — mà điều đó lại phụ thuộc `OQ-2` (dữ liệu thật hay giả lập). **Hai OQ này khoá nhau**, PM sẽ xử ở phần đề xuất.

### 2. Một lỗi thiết kế đo mà nếu không bắt bây giờ thì số overhead sẽ vô nghĩa

10 scenario §22 **đều là execution lỗi** ⇒ chúng chỉ chạy đường **persist**. Nếu load run đo overhead cũng dùng 100% request lỗi thì con số `<5%` đo được **không phải** con số mà ngân sách nói tới — vì thực tế production đa số request **thành công** và đi đường buffer-rồi-huỷ.

⇒ Load run phải dùng traffic **đa số thành công**, và **tỷ lệ lỗi của load run phải là một điều kiện đo bắt buộc** ghi kèm mọi con số overhead. *(Worker đánh dấu đây là suy luận của mình — PM đồng ý và nâng thành yêu cầu của `A5`.)*

### 3. Ràng buộc thứ tự mới, áp lên cả `P0-B` và `P0-C`

> **`C1` không được khởi động trước khi (i) quyết định `A2` về `GAP-Redis` đã thành văn bản, và (ii) Known-Missing-Input Manifest đã niêm phong.**

Điều này biến `GAP-Redis` từ *"một câu hỏi của `A2`"* thành **điều kiện tiên quyết của cả `P0-C`**. Nó củng cố việc đưa `GAP-Redis` lên gate thay vì để `A2` tự quyết.

### 4. Ba yêu cầu mới rơi sang task NGOÀI phạm vi run này

Lens QA sinh ra ba ràng buộc mà chủ sở hữu **không phải** `A5`/`A6`:

| Ràng buộc | Rơi vào task | Xử thế nào |
|---|---|---|
| Recorder log `row_count`/`byte_size`/`consumed_by_replay` cho **mọi** query result | `B3` (`P0-B`) | `A5` ghi thành **yêu cầu đối với `B3`**; PM ghi ripple vào `outline.md` |
| Harness chạy A/B xen kẽ + traffic đa số thành công | `B7` (`P0-B`) | như trên |
| `U-25` — replay mỗi capsule ≥2 lần | `C1` (`P0-C`) | như trên |

Đây **không** phải scope creep của `P0-A`: `A5` chỉ *viết ra yêu cầu đo*, việc hiện thực vẫn ở `P0-B`. Nhưng nếu `A5` không viết ra thì `B3`/`B7` sẽ được xây thiếu và phát hiện muộn ở `C1`.

## Mâu thuẫn với lens khác

Chưa phân xử được — `architect`, `business-analyst`, `security-auditor` chưa trả kết quả tại thời điểm ghi file này. Ba điểm cần đối chiếu khi đủ bốn lens:

| Cần đối chiếu | Với lens | Vì sao |
|---|---|---|
| Denominator của `N-05` = `Total replays` (× `U-25`) | `business-analyst` | BA đang chốt denominator của `ACG-03`; nếu BA hiểu denominator là *số scenario* thì hai lens lệch nhau ở đúng con số quan trọng nhất |
| Cap `SEC-008` phải TẮT trong spike | `security-auditor` | Va thẳng vào AC hiện tại của `SEC-008` và phụ thuộc `OQ-2` |
| Checklist quy trách nhiệm bước 2 dựa trên *"điểm phân kỳ đầu tiên"* | `architect` | Đây là output của rubric `A3`; nếu rubric không xuất ra điểm phân kỳ đầu tiên thì checklist không chạy được |
