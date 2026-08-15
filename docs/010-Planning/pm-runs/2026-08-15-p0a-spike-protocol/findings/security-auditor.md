# Findings — security-auditor

> Lens phân tích cho `A7` (review chéo) + phán quyết `OQ-2`. **Read-only**, `FILES_TOUCHED: none`.

## Kết luận của worker

```
STATUS: DONE
FILES_TOUCHED: none
SUMMARY: OQ-2 có phán quyết dứt khoát — spike dùng DỮ LIỆU GIẢ LẬP, không ngoại lệ: dự án chưa có
production của chính nó, mọi control cho phép dữ liệu thật (Nhóm A–D của §9) đều chưa tồn tại ở
P0-B, và SEC-016 không thực thi được vì U-06d là blocker nên dữ liệu thật capture hôm nay là dữ
liệu không xoá được. Kèm bảng control bắt buộc nếu Sponsor lật quyết định — trong đó có một dòng
không thoả được.
Ba rủi ro spike: destroy xoá thiếu LÀM HỎNG THÍ NGHIỆM (replay đọc service sống sót ⇒ GATE-06 sai)
nên phải cách ly ở tầng IAM + bằng chứng do công cụ độc lập sinh; capsule spike cần vòng đời khai
báo tay; TL-r4 cần shortcut ledger + CI import-guard, prefix nhánh không phải control.
THREAT-018: bảy ràng buộc R1–R7 cho B5, và ma trận 12 test T1–T12 với pass criterion
escaped_side_effects = 0. Bẫy phải xử trước: sau destroy, WRITE rò rỉ nhận ECONNREFUSED và trông
giống hệt WRITE bị chặn ⇒ bắt buộc có canary sink, nếu không bằng chứng an toàn của C1 vô nghĩa.
SEC-008 có phát hiện chặn protocol: thí nghiệm cắt đòi capture KHÔNG CAP rồi cắt offline; nếu
B3/B4 cắt tại lúc record thì môi trường đã destroy, đuôi phân bố mất vĩnh viễn.
```

## Nội dung chính

### `OQ-2` — phán quyết: **SYNTHETIC, không ngoại lệ**

Bốn lập luận, cái đầu gần như tự đóng câu hỏi:

| # | Lập luận |
|---|---|
| **a** | **Dự án chưa có production của chính nó.** `B1` *dựng* test app, `B8` *tự viết* 10 fixture. ⇒ "dữ liệu thật" không phải tuỳ chọn có sẵn — nó là hành vi **chủ động import dữ liệu production của hệ thống khác vào một giàn throwaway** |
| **b** | **Mọi control cho phép dữ liệu thật đều chưa tồn tại ở `P0-B`.** `SEC-001/009/011/012` là `MUST-V0.1`, nhưng **không có một task redaction nào trong toàn bộ WBS `P0-B`**. Recorder spike **theo cấu trúc** đang ở đúng chế độ fail-open mà `THREAT-004` mô tả |
| **c** | **Dữ liệu thật capture hôm nay là dữ liệu KHÔNG XOÁ ĐƯỢC.** `SEC-016` crypto-shred treo trên `U-06d` (blocker). Cộng với §22 bắt capsule **tự chứa** và sống sót sau destroy ⇒ capsule spike là bản trích dữ liệu bền vững, không TTL, không cơ chế xoá có hiệu lực |
| **d** | **`THREAT-005` mô tả chính xác hồ sơ người chạy spike.** Chuỗi 4 bước của threat (mở rộng capture → tắt redaction → chờ lỗi → pull) ở spike **không cần bước nào** — recorder vốn đã full-capture. Spike với dữ liệu thật **chính là** `THREAT-005` được hiện thực hoá |

**Cách đọc *"production-like"* của §22** phải ghi thẳng vào Spike Protocol: **giống production về cấu hình/topology/độ phức tạp**, KHÔNG phải *có dữ liệu production*. Đây là cách đọc duy nhất tương thích §20.5 Critical + `THREAT-005`. Và §23 đo 5 metric đều là **hình dạng**, không metric nào phụ thuộc **nội dung** dữ liệu.

**Hai lệnh cấm cụ thể cho `B1`/`B2`**: (1) không seed Postgres/Redis bằng bất kỳ dump nào của hệ thống thật — PII giả theo §16, số thẻ giả **thoả Luhn**; (2) **External HTTP API phải là stub tự chạy** — gọi thật sẽ capture response thật + credential thật vào artifact không redact, và destroy sẽ phải rotate một credential đội **không sở hữu**.

**Nếu Sponsor lật quyết định**: có bảng 7 control bắt buộc, trong đó **dòng cuối (`SEC-016` xoá có hiệu lực trên mọi bản copy) KHÔNG THOẢ ĐƯỢC hôm nay** vì `U-06d`. Kết luận chi phí: dòng 1–5 là gần trọn Nhóm A+B+C+D của §9 — **nhiều MD hơn toàn bộ 4.0 MD của `B3`**, viết trong code throwaway. ⇒ *"Dữ liệu thật" không phải đắt hơn — nó **không đóng được**.*

Phương án trung gian *"dùng production đã anonymize"* bị **bác tường minh**: pipeline anonymize chính là thứ chưa tồn tại.

### 🔺 Bẫy phương pháp — `ECONNREFUSED` làm mọi bằng chứng an toàn vô nghĩa

> Sau bước *Destroy original environment*, một WRITE **bị rò rỉ** sẽ nhận `ECONNREFUSED` và **trông giống hệt** một WRITE **bị chặn**.

⇒ Toàn bộ bằng chứng an toàn của `C1` **vô nghĩa** nếu không có quan sát viên độc lập. Đây là lỗ hổng **phương pháp**, không phải lỗ hổng code.

**Control bắt buộc — canary sink**: sau destroy, trỏ DNS/host cũ về một listener ghi lại **mọi** kết nối đến (TCP accept log + HTTP endpoint + DB giả có bảng audit append-only). Canary làm ba việc không cách nào khác làm được: phân biệt *"có mưu toan egress"* với *"không có mưu toan"*; **đo** được khoảng hở `child_process`; và dùng lại chính stub API ⇒ chi phí thêm ≈ 0.

**Nguồn sự thật của test không được là log của chính replay runtime** (xác minh vòng tròn) — phải là canary log, thu độc lập, đối chiếu sau **mỗi** scenario.

### Destroy xoá thiếu **làm hỏng thí nghiệm**, không chỉ lộ dữ liệu

Nếu destroy sót một service, replay có thể **âm thầm đọc từ service sống sót** và cho `matched`. ⇒ `C1`/`C2` báo replay success cao, `GATE-06` được trả lời **Có** bằng dữ liệu sai. Nặng hơn rò rỉ dữ liệu vì nó tấn công thẳng vào kết luận của cả Phase 0.

Ràng buộc: **cách ly ở tầng IAM, không ở tầng script** (credential destroy không có quyền chạm ngoài scope) · destroy **theo nhãn, không theo tên** · **bằng chứng do công cụ độc lập sinh**, mỗi lần chạy (10 lần ⇒ 10 bằng chứng) · destroy phải **idempotent** · phải **revoke/rotate credential**.

### `TL-r4` — prefix nhánh là quy ước, không phải control

Ba control worker cho là đủ: (1) **shortcut ledger** — bảng ghi **ngay lúc phát sinh** mỗi `SEC-xxx` bị cố ý bỏ qua (chắc chắn có: `SEC-027`, `SEC-001/011`, `SEC-015`, `SEC-018`–`020`); (2) **CI import-guard** — build ngoài spike mà resolve tới `src/spike/` ⇒ fail; (3) **không publish gì trong Phase 0** — `THREAT-019` gọi vị trí `@repro/node` là *"đắt nhất trong toàn hệ thống"*.

### `THREAT-018` × `B5` — 7 ràng buộc + 12 test

Điểm nặng nhất: **exit criteria hiện của `B5`** (*"có test chứng minh một WRITE bị chặn"*) **thoả được bằng L1 đơn thuần** ⇒ phải siết thành: chứng minh cả các đường **L1 không nhìn thấy**.

Và `R3` — định nghĩa lại *"chứng minh được là READ"*: trong replay, cái chứng minh READ **không phải verb**, mà là **khớp với một entry READ đã ghi trong capsule**. Đây là phát biểu duy nhất làm `GET /v1/send?to=` không lọt.

Ma trận `T1`–`T12`, pass criterion **`escaped_side_effects = 0`**. `T8` (`child_process` gọi `curl`) **sẽ FAIL nếu L2 ở tầng runtime** — ghi nhận là **khoảng hở đã đo được**, tuyệt đối **không** sửa bằng cách làm nhẹ test.

## PM đọc được gì

### 1. ✅ Hai OQ tưởng khoá nhau, hoá ra GỠ cho nhau

Ở `findings/quality-assurance.md` PM ghi: `SEC-008` cần cap **TẮT** khi spike chạy, nhưng AC của `SEC-008` bắt *"chưa cấu hình ⇒ áp mặc định bảo thủ"* ⇒ cần miễn trừ, mà miễn trừ có an toàn không thì phụ thuộc `OQ-2`. Em ghi là **hai OQ khoá nhau**.

Security gỡ đúng chỗ đó:

> **Capture không-cap chỉ chấp nhận được VÌ dữ liệu là synthetic.** Với dữ liệu thật, không-cap là điều cấm.

⇒ Chốt `OQ-2 = synthetic` **tự động cấp** miễn trừ cap cho `SEC-008`. Không cần quyết định thứ hai. **Hai lens độc lập hội tụ vào cùng một kết luận từ hai hướng khác nhau** — đây là mức bằng chứng cao nhất run này có.

### 2. Security đi XA HƠN QA ở `SEC-008`, và phần xa hơn đó là phần bị bỏ quên

QA nói: thu phân bố `row_count`/`byte_size` với cap tắt. Security chỉ ra `11.b` đòi **hai vế**, và **vế 2 bị bỏ quên**: *"tỉ lệ replay thành công **theo từng mức cắt**"*.

Vế 2 đòi một **thí nghiệm cắt**: capture **không cap** → sinh biến thể đã cắt **offline** từ capsule đã lưu → replay lại từng biến thể → đo matched/diverged.

⇒ Nếu `B3`/`B4` cắt **tại lúc record**: môi trường gốc đã destroy, **đuôi phân bố mất vĩnh viễn**, thí nghiệm **không chạy lại được**, và `SEC-008` vẫn `TBD` sau khi tiêu hết **32 MD** của `P0-B` + `P0-C`.

Đây là ràng buộc phải vào protocol **trước `B3`**, không phải phát hiện ở `C5`.

### 3. Đề xuất metric thứ 6 — em đồng ý và nâng thành hạng mục của `A5`/`A6`

`ADR-005` ghi risk Critical §20.4 hiện **không có bằng chứng chấp nhận nào được định nghĩa**; §23 không có metric an toàn, §24 không có ngưỡng.

⇒ Thêm **`escaped_side_effects`** làm metric thứ 6, target `0`, có ô riêng trong Template Spike Report.

> Con số `0` **không phải ngưỡng bịa** — nó suy ra từ §13 (*"must never accidentally repeat dangerous side effects"*) và bằng chứng chấp nhận của `ADR-005`. Đây là ngoại lệ hợp lệ duy nhất với luật *"không bịa ngưỡng"* của run, và phải được ghi rõ là suy ra từ đâu.

Nếu không thêm: `GATE-06` trả lời câu §39 mà **không nói được gì** về một risk 🔴 Critical.

### 4. Ba ràng buộc phải vào protocol TRƯỚC `P0-B`, nếu không thì tiêu 32 MD mà không kết luận được

| # | Ràng buộc | Không có thì hỏng gì |
|---|---|---|
| 1 | **Canary sink** tại địa chỉ môi trường đã destroy | Mọi bằng chứng an toàn của `C1` vô nghĩa (`ECONNREFUSED` ≡ blocked) |
| 2 | **Capture không-cap + thí nghiệm cắt offline** | `SEC-008` không bao giờ chốt được, đuôi phân bố mất vĩnh viễn |
| 3 | **L2 phải tồn tại và protocol phải ghi rõ ở tầng nào** | `B5` exit criteria thoả được bằng L1 đơn thuần ⇒ `THREAT-018` tái diễn nguyên vẹn |

Cả ba đều **rơi vào deliverable của `A1`/`A2`/`A5`** — tức trong phạm vi run này. Đây là lý do mạnh nhất để **không** rút gọn `P0-A`.

### 5. `OQ-2` được đóng ở `A7`, và điều đó đổi vai của `B9`

Timeline giao `B9` (`P0-B`, 1.0 MD) nhiệm vụ *"có phán quyết rõ ràng: spike dùng dữ liệu giả lập hay thật"*. Nếu `A7` đã chốt synthetic thì `B9` chuyển từ **quyết định** sang **xác minh** — kiểm `B1`/`B2` đúng là synthetic, stub API đúng là stub, không dump nào lọt vào `src/spike/`.

⇒ Ripple nhẹ vào Timeline §4. PM ghi vào `outline.md`, **không** sửa Timeline giữa run.

## Mâu thuẫn với lens khác

**Không có mâu thuẫn.** Ba lens đã trả kết quả hội tụ:

| Điểm | QA | BA | Security |
|---|---|---|---|
| Cap `SEC-008` phải tắt khi spike chạy | ✅ nêu ra | — | ✅ xác nhận + cấp lý do an toàn (synthetic) |
| Fail-closed khi thiếu bằng chứng | ✅ (`U-25`) | ✅ (scenario không replay được) | ✅ (`MISSING_RECORDING`, không fall through) |
| Cần một quan sát viên **độc lập** với thứ đang được đo | ✅ (verdict `B6`, không phải log replay) | — | ✅ (canary log, không phải log replay runtime) |

`architect` chưa trả kết quả. Ba điểm cần đối chiếu:

| Cần đối chiếu | Vì sao |
|---|---|
| `R3` — *"READ chứng minh bằng khớp entry đã ghi, không bằng verb"* | Chạm thẳng định nghĩa rubric `A3` và `ACG-09` |
| *"WRITE bị chặn + recorded result trả về ⇒ phải phân loại `matched`"* | Nếu `A3` phân loại là `diverged` thì fail-closed hiện lên như nhiễu phân kỳ |
| Phương án (b) `GAP-Redis` — capture Redis throwaway | Mở rộng bề mặt dữ liệu capsule; security nói nếu chọn (b) thì mọi ràng buộc vòng đời capsule áp cả cho phần Redis |
