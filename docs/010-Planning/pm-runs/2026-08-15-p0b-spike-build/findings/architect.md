# Findings — architect

> Lens **read-only trước gate**. `FILES_TOUCHED: none` — đã đối chiếu, đúng ownership đã cấp.
> Worker có **đo thực nghiệm** trên `node v22.21.1` của chính máy này (chạy lệnh đọc, không ghi file) — phần dưới ghi rõ chỗ nào là *đo được* và chỗ nào là *suy ra từ tài liệu*.

## Kết luận của worker

### Q1 — `B3`/`B4`/`B5`/`B6` **KHÔNG cắt rời được** ở trạng thái hiện tại

**Đã có chủ, dùng ngay được**: schema bản ghi `interaction` 6 field + hai neo `U0`/`U∞` (`Spec §3.1`–`§3.2`) · 9 trường log bắt buộc của recorder (`MTP §8.1`, `B3-1`→`B3-9`) · ngữ nghĩa verdict + *điểm phân kỳ đầu tiên* (`Spec §3.4`) · hợp đồng output máy đọc được của harness gồm composite `B7-12` (`MTP §8.2`).

**CHƯA ai định nghĩa — đúng hai thứ, và chúng là thứ chặn song song hoá**:

1. **Format artifact trên đĩa của spike.** `Timeline` dòng `B4` **cấm** dùng capsule format v1; `ADR-002` đặc tả layout **của sản phẩm** và tự để **container format + encoding** ở dạng `TBD`; đóng băng format v1 nằm ở `D5` của `P1`. ⇒ Schema mà `B3` **ghi ra** và `B5`/`B6` **đọc vào` hiện **không có chủ**.
2. **Định danh tra cứu (`U-02` — query matching identity).** `Timeline` xếp `U-01`/`U-02` vào **`D3` của `P1`** — chưa giải. Bốn phép normalization ở `Spec §3.2` là stand-in mức `HYPOTHESIS`, và **chính chỗ đó tự cảnh báo**: *"Phép 1 và 2 đứng trên `U-02` — rủi ro hiện thực cao nhất của cả thiết kế"*.

🔺 **Điểm PM chưa nhìn thấy**: định danh này có **BA** consumer, không phải một. `MTP` `T6` (phát biểu `R3`) chốt *"cái chứng minh READ trong replay không phải verb, mà là khớp với một entry READ đã ghi trong capsule"* ⇒ **allowlist an toàn của `B5` dùng chung hàm định danh với rubric của `B6` và với recorder `B3`**. Hai phía hiện thực normalization lệch nhau ⇒ tái tạo đúng cơ chế hỏng mà `R1` mô tả (hook lệch một phía ⇒ *cả 10 scenario `diverged` với nguyên nhân `incomplete-capture` giả*), lần này ở **tầng match** thay vì tầng hook — **triệu chứng giống hệt**.

**Khuyến nghị dispatch**: mặc định **tuần tự một implementer** cho `B3→B4→B5→B6`. Muốn song song, PM phải đặt hàng trước **một artifact duy nhất**: schema artifact spike + module `normalize()`/`identity()` **dùng chung**, gắn nhãn `HYPOTHESIS` theo `Spec §0.2`/`§1.2`, sống trong `src/spike/`. Nó là thiết kế **spike-local**, **không** chạm contract đóng băng tại `Gate A`. Không có nó, song song hoá **không tiết kiệm ngày công** mà chỉ đẩy chi phí tích hợp sang `B6` — nơi `P0-B` không còn đệm.

### Q2 — 8 nhóm capture: nơi 4.0 MD của `B3` sẽ bị đốt

| # | Nhóm §18 | Kỹ thuật | Rủi ro |
|---|---|---|---|
| 1 | **DB query/result** | ⚠️ **Đo thực nghiệm trên `node v22.21.1` máy này**: runtime chỉ publish `diagnostics_channel` built-in cho `http.client.*`, `http.server.*`, `net.*`, `dns.*` — **KHÔNG có channel nào cho `pg`**. Còn lại: monkey-patch prototype hoặc wrapper client. `ADR-007` liệt kê 4 ứng viên của `U-01` và **chưa chọn ứng viên nào** | 🔴 **cao nhất** |
| 2 | **External HTTP response** | Quan sát rẻ (`http.client.request.start`/`response.finish` **publish thật**, đã đo). Nhưng `diagnostics_channel` chỉ **quan sát**, không **thay** được response lúc replay ⇒ vẫn phải vá client. `ADR-007` (`U-03`): outbound và inbound là **hai bài toán khác nhau**, cả hai chưa chốt | 🔴 |
| 3 | **Clock/timestamp** | Thay `Date.now`/`new Date`/`hrtime`/timers, phát lại **dãy đã ghi theo thứ tự** (`Spec §3.8`). Ngữ nghĩa đã đóng, ba điểm yếu còn nguyên: **dãy cạn** khi code local đọc nhiều lần hơn · thứ tự thừa hưởng `U-20` · disposition vẫn `SPIKE` | 🟠 |
| 4 | **HTTP request (inbound)** | Nửa còn lại của `U-03`; quan sát rẻ, nhưng *nạp lại* request lúc replay **chưa có đặc tả** | 🟠 |
| 5 | **Feature flag state** | `B1` tự viết client ⇒ bề mặt chặn do chính ta kiểm soát | 🟢 |
| 6–8 | **Stack trace · Git commit · runtime metadata** | `Error.captureStackTrace`, đọc `process.*`. ⚠️ Chỗ hở đã ghi: `MTP` nói *"runtime metadata"* **không rõ có phủ env var** — không phủ thì env var ở lại manifest | 🟢 |

🔺 **`async_hooks` không thuộc riêng nhóm nào — nó là hạ tầng chung.** Cần để quy một interaction về **đúng execution** khi có concurrency, và chạm thẳng `U-20` (ranh giới nhóm đồng thời, vẫn `SPIKE`). **PM nên đếm nó như một hạng mục riêng trong 4.0 MD, không phải chi phí biên.**

**`B3` CÓ chạy được khi `U-01`/`U-02` còn mở.** `ADR-007` ghi thẳng: `GATE-01 = Go` làm quan hệ đảo chiều một nửa — spike *"là **nơi để thử** các cơ chế chặn driver `pg`"*. Chọn một cơ chế trong `B3` là **đúng mục đích** của phase.

**Vi phạm `Gate A` không phải "tự quyết", mà là "tự quyết NGẦM" — ba hình thái**:
- (i) Chọn mà **không gắn nhãn** `HYPOTHESIS — cần validate` theo `Spec §1.2`/`§0.2`.
- (ii) Coi việc `B3` chạy được là đã **đóng** `U-01`/`U-02` — hai mục này thuộc `D3` của `P1`, **`P0-B` không có thẩm quyền đóng chúng**.
- (iii) Hiện thực định danh **lệch** với 4 phép normalization `Spec §3.2` — đó là **hiện thực sai một rubric đã đóng băng tại `Gate A`**, không phải một lựa chọn kỹ thuật.

**Tiền lệ worker chỉ ra**: `U-13` được kéo vào `A3` **chính vì** *"không đóng thì Engineer sẽ phải quyết định **ngầm** trong lúc viết `B5` — một quyết định kiến trúc sinh ra trong một PR, không có ai review nó như một quyết định"*. `U-02` **cùng tính chất** nhưng **không** được kéo vào `P0-A`. Worker báo cáo dạng **rủi ro**, không đề nghị sửa.

### Q3 — `L2` tầng runtime trên Node v22

**(a) XÁC NHẬN** — phủ được `net.Socket` thô **và** HTTP client, **kể cả `fetch` built-in**. Cơ chế: vá `net.Socket.prototype.connect` (cộng `dns.lookup` chặn đường vòng qua tên miền). **Đo thực nghiệm `node v22.21.1`**: cả `http.get(...)` lẫn `fetch(...)` (undici) **đều** đi qua patch — `true` cho cả hai. Một điểm vá duy nhất phủ `http`/`https` + `fetch` + socket thô, đúng như `ADR-005` §Open items dự đoán. Điều kiện: patch cài **trước** khi module đích giữ tham chiếu. Hai đường hở theo cấu trúc: `child_process` (chính là `T8`) và native addon. `worker_threads` là realm khác cùng process ⇒ cần cài lại hook cho từng worker — **worker CHƯA đo**, nêu để `B5` kiểm.

**(b) XÁC NHẬN** — `T12` không chặn được, **và đó là thiết kế, không phải lỗi**. `ADR-005` Decision #3: allowlist `L2` *"chỉ gồm loopback + replay proxy"*. `MTP §5.3` ghi cột lớp chặn `T12` là *"⚠️ Chỉ `L1` + `SEC-035`"*; `§5.4` xác nhận `T12` **đo residual risk (b) của `THREAT-018`, không đo lỗi hiện thực**. Điều kiện cứng: canary **phải nghe trên loopback**, nếu không `T12` mù và **báo pass sai**.

**(c) 🔺 CÓ — Node v22 có cơ chế làm ĐỔI kết luận `T8`, nhưng KHÔNG đổi `T12`.** Đo thực nghiệm trên máy này:
- `node --help` có `--experimental-permission`, `--permission`, `--allow-child-process`.
- Chạy `node --permission --allow-fs-read=/ …` rồi `execSync('echo hi')` → **`ERR_ACCESS_DENIED`**. ⇒ Vector của `T8` (`child_process` gọi `curl`) **chặn được ngay ở tầng runtime**, không cần leo lên tầng OS.
- **KHÔNG có `--allow-net`**, và `net.connect` tới listener nội bộ **vẫn chạy bình thường** dưới `--permission`. ⇒ Permission model **không** cấp allowlist egress, **không** thay thế `L2`, **không** chạm `T12`.
- `node:sea` là cơ chế **đóng gói**, không phải cách ly — không đổi gì cho cả `T8` lẫn `T12`.

**Cách đọc đúng `MTP §5.4` để không vi phạm lệnh cấm**: dòng *"`T8` SẼ FAIL"* là một **dự đoán có điều kiện** — *"**nếu** `L2` được hiện thực ở tầng runtime [vá module mạng trong process]"*. Ba lệnh cấm chỉ cấm **làm nhẹ test** (đổi `curl`, bỏ test, ghi *"ngoài phạm vi"*). Chúng **không** cấm hiện thực **mạnh hơn**. Bật permission model ⇒ `T8` vẫn phải chạy **nguyên văn**, kết quả đọc từ **canary log**; pass hay fail đều là dữ liệu hợp lệ cho `@TrisJr`.
**Cái giá phải khai trước khi chọn**: cờ vẫn mang tên `--experimental` · nó **global cho cả process** nên chặn **mọi** `child_process` kể cả hợp lệ · buộc phải cấp `--allow-fs-read`/`--allow-fs-write` cho I/O capsule ⇒ **một dòng mới cho shortcut ledger `§5.2`**.

### Q4 — `POST /checkout` để `R2` và `G1` cùng đúng

🔺 **Ràng buộc quan trọng nhất chưa ai phát biểu ra: `R2` cấm read-through cache cổ điển, ở tầng cấu trúc.** `Spec §3.4` điều kiện 1 đòi hai dãy đơn vị **cùng số đơn vị**. Một cache hit bỏ qua truy vấn DB làm dãy lúc capture **ngắn hơn** dãy lúc replay ⇒ `diverged` ngay ở điều kiện 1. ⇒ *"cùng chuỗi DB/HTTP"* của `R2` **loại thẳng mọi mẫu hình mà cache thay thế một lời gọi**.

**Hai hình mẫu còn hợp lệ — đúng hai hình mẫu `G1` đã nêu**: (a) **fire-and-forget write** — ghi Redis **sau** khi kết cục đã tính xong, không đọc lại trong cùng execution, bọc timeout ngắn + nuốt lỗi; (b) **read có fallback mà giá trị không đi vào business logic** — đọc counter/session gắn vào log hoặc metric, hoặc *shadow read* đọc rồi đối chiếu rồi vứt. DB vẫn **luôn** được truy vấn và là nguồn sự thật duy nhất của response. Cả hai thoả nửa còn lại của `R2` — *"chịu được việc bị `B5` chặn hoặc vắng mặt"*.

**Nếu Redis bị làm vô hại tầm thường, `B1` còn là bằng chứng gì?** Vẫn là bằng chứng, nhưng **chỉ đúng cái nó tuyên bố**:
- **KHÔNG** chứng minh: replay được execution phụ thuộc cache. `Spec §2.7 E-E` đã ghi đó là **cái giá đã biết**; `SC-11` **định lượng** cái giá; mục 1 của manifest neo nó thành bằng chứng có ngày tháng.
- **CÓ** chứng minh: điều khoản loại trừ `(ii-b)` **sống được** trong một app thật đủ 5 dependency, và `R2` là thứ giữ cho 6 scenario khác **không chết vì chính cơ chế an toàn của spike**.
- **Rủi ro PM phải canh**: Redis vô hại tới mức xoá đi mà app không đổi gì ⇒ exit criteria *"chạm cả 5 dependency"* thành **nghi thức**. Đề xuất trong khung throwaway: giữ ràng buộc *"Redis thực sự được gọi và lời gọi đó quan sát được trong log"*, nhưng **không nằm trên đường tính response**.
- ⚠️ **Ghi chú vận hành**: test bất biến hạ dòng của `B1` phải là **A/B ở tầng app** (Redis warm vs Redis tắt/bị chặn, đối chiếu log `pg` + stub HTTP + response), vì `B1` chỉ `Depends: GA` — **recorder và replay chưa tồn tại** lúc đó.

### Q5 — 🔴 Rủi ro lớn nhất PM chưa hỏi tới

> **Khối `class_assessment` và cổng `inconclusive` là hai cơ chế BẮT BUỘC của `Gate A` nhưng KHÔNG task nào trong `B1`–`B10` chịu trách nhiệm xây.**

Ba mặt bằng chứng:
1. **Spec bắt buộc chúng.** `Spec §2.6`: lúc capture phải ghi **thêm một khối `class_assessment`** vào capsule; khối `CAUTION` ghi *"KHÔNG có phương án capture im lặng"* — một capsule không mang đánh giá class *"trông giống hệt capsule hợp lệ… sẽ được replay, được chấm điểm, và được đưa vào một con số"*. `Spec §3.5` bắt `inconclusive` là **cổng tầng 1 đứng trước rubric**, execution rơi vào đó **bị loại khỏi denominator**.
2. **Spec tự cảnh báo nó có thể không được xây.** `§2.7 E-F`: *"`U-24` chưa có câu trả lời. Khối `class_assessment` là **đề xuất**, chưa được validate; nếu nó không dựng được ở `P0-B` thì hành vi (iii) ở dòng *Capture* **mất cơ chế thực thi**."*
3. **Không task nào nhận.** Grep toàn văn: `class_assessment` xuất hiện **0 lần** trong `Timeline-Repro.md` và **0 lần** trong `MTP-Spike-Phase-0.md`; `inconclusive` cũng **0 lần** ở cả hai. Exit criteria `B3` chỉ đòi 8 nhóm + log `SEC-008`; `B4` chỉ đòi *tự chứa*; `B6` chỉ đòi *"nhị phân `matched`/`diverged` + điểm phân kỳ đầu tiên"*. Trong khi **`Template-Spike-Report` ĐÃ CÓ chỗ in `inconclusive` như một cổng** — tức `C4` sẽ phải báo cáo một thứ mà `P0-B` không xây.

**Hệ quả**: `C3` sẽ tính chỉ số **composite fail-closed `≥6/7`** — con số **đã đóng băng tại `Gate A`** — trên một denominator **không có cổng lọc**. Execution rơi ngoài Supported Execution Class bị chấm thẳng vào ô `matched`/`diverged` thay vì bị loại ra, và **không có cách nào phát hiện điều đó từ chính báo cáo**, vì capsule không mang đánh giá class. Đúng chế độ hỏng mà khối `CAUTION §2.6` tồn tại để chặn.

**Cách xử đúng khung**: đây là **làm rõ task**, KHÔNG phải sửa contract — giao việc ghi khối `class_assessment` cho `B3` (đã có mặt ở chiều capture) và cổng `inconclusive` cho `B6` (đã sở hữu rubric). Chi phí **nhỏ** nếu quyết ở gate; phát hiện ở `C3` thì phải **chạy lại `C1`** — mà đệm 30% của `P0-C` **đã có chủ** (dành cho khả năng `C1` chạy lại vì phân bố `SEC-008`).

## PM đọc được gì

- **Câu 1 phá phương án nhiều implementer song song cho `B3`–`B6`.** Ownership có thể cắt rời theo thư mục, nhưng **contract thì không** — và `pm-core` cấm dispatch song song khi không cắt rời được. ⇒ Run plan đi **tuần tự một implementer** cho nhánh này, trừ khi PM chèn thêm một task `B0` sinh schema + `identity()` dùng chung. **PM chọn: chèn `B0`** — nó biến một rủi ro tích hợp mù thành một artifact review được, và nó là điều kiện cần để `B5` (`R3` allowlist) không lệch với `B6` (rubric).
- **Q5 là hạng mục phát hiện sau `Gate A` thứ HAI**, cùng loại với `B10` (`Timeline` đã ghi `B10` là *"phạm vi chưa từng được đếm"*). Nó **không** được đếm trong 22.0 MD. PM phải đưa vào gate như **scope mới**, không được lặng lẽ nhét vào `B3`/`B6` rồi coi ước lượng cũ vẫn đúng.
- **Q3(c) là món quà, không phải rắc rối.** `T8` có đường đóng ở tầng runtime trên chính Node v22 — nhưng nó là **lựa chọn có giá** (cờ experimental, chặn mọi `child_process`, thêm dòng ledger). Đây là quyết định của `@TrisJr`, không phải của implementer, vì nó đổi cái mà `GATE-06` sẽ đọc: *khoảng hở đã đo được* vs *khoảng hở đã đóng*.
- **Q4 cho `B1` một ràng buộc thiết kế cứng** mà exit criteria hiện không nói: **cấm read-through cache**. Phải đưa nguyên văn vào prompt dispatch `B1`, nếu không implementer sẽ viết mẫu hình phổ biến nhất và `R2` gãy ở điều kiện 1 của rubric.

## Mâu thuẫn với lens khác

**Không mâu thuẫn với `security-auditor` — hai lens giao nhau ở `T8` và CỘNG HƯỞNG, không chọi nhau:**

| | `architect` | `security-auditor` |
|---|---|---|
| `T8` | Node v22 `--permission` **chặn được** `child_process` ⇒ `T8` có đường **pass thật** | `T8` chỉ fail **có bằng chứng** nếu `E1` (remap ở tầng OS) + `E2` (fixture bắn vào đích canary phủ); sai một trong hai ⇒ **PASS SAI** |

⇒ **PM phân xử: hai phát hiện phải đi CÙNG nhau, không được chọn một.** Bật `--permission` mà không có `E1`/`E2` thì `T8` pass — nhưng **không phân biệt được** *"permission model đã chặn"* với *"canary không nghe được"*. Đó là hai nguyên nhân khác nhau cho cùng một quan sát `0`, và đúng lỗi phương pháp `ECONNREFUSED` mà `MTP §5.1` sinh ra để diệt. ⇒ **`E1`/`E2` là điều kiện tiên quyết để đọc kết quả `T8`, bất kể `--permission` bật hay tắt.** Ghi vào exit criteria `B5`.

Giao nhau thứ hai: `architect` nêu *"runtime metadata **không rõ có phủ env var**"*; `security-auditor` nêu chuỗi `.env` → `dotenv` → capture không cap → capsule plaintext → git. **Cùng một lỗ, nhìn từ hai đầu.** ⇒ Control `CTL-3` (allowlist env cho recorder) đóng **cả hai**.
