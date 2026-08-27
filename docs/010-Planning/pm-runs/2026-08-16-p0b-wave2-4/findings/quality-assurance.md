---
id: PM-FIND-2026-08-16-QA
type: reference
status: draft
created: 2026-08-16
---

# Findings — quality-assurance (lens QA, read-only)

## Kết luận của worker

### Q1 — 10 scenario §22: nguồn định nghĩa mỏng hơn tưởng

§22 nằm ở `docs/999-Resources/RQ.md:1295-1354`. Toàn bộ "định nghĩa" 10 scenario là **10 dòng tiêu đề** (`RQ.md:1326-1335`) — không trigger, không định nghĩa "lỗi", không chữ ký lỗi. Bồi thêm ở `Spec:720-731` (bảng `M-1`–`M-6`), `:739-750` (nhánh `SC-6`), `:869` (observation set), `p0a verdict.md:238-248`.

> #### 🔴 Lỗ hổng #0 — áp cho **cả 10**, là gốc của `Q5`
>
> `Spec:707` định nghĩa `M-5` = *"Chữ ký lỗi **VÀ** verdict kỳ vọng đã được khai **trước khi chạy**"*, người viết BA, **`@TrisJr` duyệt tại `Gate A`**.
> Bảng `Spec:722-731` chấm `M-5` = ✅ cho **cả 10**. Nhưng `p0a verdict.md:250` khai ngược: *"`M-5` chưa niêm phong được ở đây — nó sinh ra tại `B8` khi fixture tồn tại."*
> Exit criteria `B8` (`Timeline:299`) nguyên văn: *"10 fixture tái tạo được lỗi trên môi trường production-like, chạy lại vẫn lỗi"* — **không một chữ nào** về chữ ký lỗi hay verdict kỳ vọng.
>
> ⇒ `M-5` ✅ trên giấy, hiện vật hoãn sang `B8`, `B8` không được giao, **người duyệt đã hết cửa sổ** (`Gate A` đóng 2026-08-15). Hạng mục orphan cùng lớp với `B10`, chưa ai bắt.

| # | Scenario | Chấm | Thiếu gì |
|:--:|---|:--:|---|
| `SC-1` | Database state | 🟡 dựng được, thiếu định nghĩa lỗi | Seed synthetic có (`seed.js:17-29`). "Lỗi" là 500, 402, hay 201-với-số-sai? |
| `SC-2` | External API response | 🟠 thiếu cơ chế | Lever duy nhất là nhánh `declined` (`stub/server.js:40-42`) — **business path thiết kế sẵn, không phải fault** |
| `SC-3` | Feature flag | 🟢 **đủ nhất trong 10** | `flags.js:34` đọc lại file mỗi request; 2 flag chạm kết cục; JSON hỏng → `FlagError` → 500 |
| `SC-4` | Time-dependent | 🔴 **lỗi kép** | Không seam tiêm clock (`clock.js:28` hardcode `Date.now()`); **và** app đọc clock **1 lần** (`checkout.js:133`) trong khi hệ quả quan sát được của `§3.8` là *"`t2 − t1` local bằng `t2 − t1` production"* ⇒ **hypothesis mở khoá `SC-4` vào denominator (`Spec:735`) không bao giờ bị kiểm** |
| `SC-5` | Missing data | 🟡 đủ, lộ seam hở | 404 (`checkout.js:146-151`) `return` **trước** `markOutcomeComputed()` (`:206`) và marker `response-sent` (`:221`) ⇒ **dãy đơn vị không có neo `U∞`** |
| `SC-6` | Dependency/version | 🔴 **định nghĩa yếu nhất** | Nhánh (A) đóng băng (`Spec:745`) chỉ nói **không được làm gì**. Fixture không phân biệt được với `SC-1` |
| `SC-7` | Randomness | 🔴 **không dựng được trên `B1`** | `crypto.randomUUID()` (`server.js:85`) không vào `buildOutcome` (`checkout.js:101-120`), không vào fingerprint stub, không vào `arguments` outbound ⇒ randomness **không có tác dụng quan sát được** |
| `SC-8` | Side effect | 🟢 dựng được, zero-change | `INSERT_ORDER` vô điều kiện (`checkout.js:175`) + `SKU-GPU-004` → stub `declined` → **vẫn ghi order row** → 402. ⚠️ **trùng trigger với `SC-2`** — hai ô denominator, một cơ chế |
| `SC-9` | Async behavior | 🔴 không dựng được đúng giả định đóng băng | `Spec:730` khai `OUT` vì *"async không đóng trong cửa sổ request"*; `B1` **cố ý làm ngược** (`await` hết, `checkout.js:210,214`). `B8` phải **cố ý dựng đuôi async không đóng**; dựng đóng gọn ⇒ `X6` kích hoạt |
| `SC-10` | Race condition | 🟡 dựng được, **dự kiến flaky — đó là kết quả** | `COUNT_ORDERS` sau `INSERT` (`checkout.js:187`) ⇒ 2 request đồng thời cho `orders_for_customer` không xác định |

**Đọc đúng chữ "chạy lại vẫn lỗi"**: `Spec:703` định lượng — `M-1` = trigger tái tạo **`K/K` = 3/3**. Và **hậu quả `M-1` hỏng KHÔNG đồng đều**:
- `SC-7`/`SC-9`/`SC-10` đã ở observation set (`Spec:869`) ⇒ hỏng thì **denominator không đổi**, ghi *"không tái tạo xác định được"* là **phát hiện hợp lệ và miễn phí**.
- Hỏng ở `{1,2,3,4,5,6,8}` là **con đường co ①** của `L2-a` ⇒ `D` co ⇒ theo `X5` mỗi lần co **làm ngưỡng dễ hơn**: `6/7` → `5/6` → `4/5`.
- Ứng viên co số một: **`SC-4`** — `test-invariant.js:30-31` đã tự khai chế độ hỏng đó.

### Q2 — `B8` dựng được trên `B1` hiện tại? — 5/10, và 5 cái còn lại chạm ownership khác

**Có sẵn, `B8` tự làm được**: seed DB (`seed.js:130`), request body bất thường (`checkout.js:59-67`), 404 (`checkout.js:146-151`), `INSERT` vô điều kiện + `SKU-GPU-004`, race trên `COUNT_ORDERS`.

**Sáu chỗ phải sửa `B1`:**

| ID | Sửa gì | Scenario | Mức |
|:--:|---|:--:|:--:|
| `Δ1` | Seam tiêm clock trong `readClock` (`clock.js:27-36`) | `SC-4` | 🔴 chặn |
| `Δ2` | Đọc clock **≥ 2 lần**/request (nay 1, `checkout.js:133`) | `SC-4` + tính kiểm chứng được của `§3.8` | 🔴 chặn |
| `Δ3` | Fault injection tất định cho stub (`stub/server.js:86-133` nay chỉ có `/healthz`, `/__stub/calls`, `/__stub/reset`) | `SC-2` | 🔴 chặn |
| `Δ4` | Một giá trị ngẫu nhiên **chạm kết cục** | `SC-7` | 🟠 |
| `Δ5` | Một đuôi async **không đóng** trong cửa sổ request | `SC-9` | 🟠 |
| `Δ6` | 404 path phát `outcome-computed` + `response-sent` | `SC-5` (neo `U∞`) | 🟡 |

⚠️ **Ripple `Δ1`/`Δ3` không dừng ở `B1`**: `config.js:13` cấm fallback thầm lặng, `:17-29` là danh sách `CT-4` bắt buộc, `:56-67` fail-fast. Thêm biến mà không vào `APP_ENV_KEYS` = optional lén; thêm vào = mọi caller vỡ tới khi `docker-compose.spike.yml` sửa theo. ⇒ **`B1` + `B2` cùng lúc**. File flag nằm trên **named volume** `spike-flags`, không bind mount (`compose:69-71`, `:211-212`) ⇒ `SC-3` cũng chạm `B2`.

🔺 **Bẫy**: đường spawn app ngoài compose (`test-invariant.js:94`, `:188-211`) là rẻ nhất và **phá exit criteria** — không đi qua canary sink, không qua destroy rig ⇒ chuỗi bằng chứng `C1` đứt. Không phải đường thoát.

### Q3 — `B10` manifest: hai gap + 0.5 MD có điều kiện

**Trường bắt buộc mỗi mục** (`MTP §6.2:476-480`): `input` · `nhóm` (đối chiếu 9 hidden input `RQ §20.1` **và** 8 nhóm capture §18) · `vì sao không capture` · `dự đoán ảnh hưởng` (**ghi TRƯỚC khi chạy**). Cấp file (không trong `§6.2` nhưng consumer đòi): `scenario_id` (`MTP:525`), đường dẫn fixture, ngày viết, người viết. Worker **đề xuất thêm** trường `cơ chế phát hiện` = `M-cap`/`M-rep`/`M-scope`/không-có — để `C3` đối chiếu được manifest với khối `class_assessment`.

✅ Xác nhận 4 mục sàn có mặt mọi file (`MTP:486-489`) và `dự đoán ảnh hưởng` ghi trước khi chạy (`MTP:480`).

> #### 🔴 Gap (a) — danh sách sàn thiếu một nhóm mà `Spec` bắt buộc
> `Spec:187` cảnh báo **bốn** nhóm loại trừ bằng lời khai: env var · filesystem state · process state · **`OS behavior`**. `Spec:197` bắt *"bốn nhóm này **phải nằm trong** Known-Missing-Input Manifest của từng scenario"*.
> Nhưng `Spec:246` tự liệt kê lại chỉ **ba** (bỏ `OS behavior`), `MTP:486-489` chép theo ba, `Timeline:302` chép tiếp.
> ⇒ **Một manifest thoả đúng exit criteria `B10` vẫn vi phạm `Spec §2.3` điểm 3.** Cần PM phân xử: thêm `OS behavior` vào sàn (5 mục), hoặc sửa `Spec:197` — không giữ cả hai.

> #### 🔴 Gap (b) — manifest cho `SC-11` không tồn tại
> `MTP:473` + `Timeline:302` nói **10 file**. `SC-11` không phải scenario §22 (`Spec:134`) ⇒ không nằm trong 10.
> Nhưng `Spec:259` bắt `SC-11` **phải** ra `incomplete-capture`, và `MTP:525` bắt nhãn đó chỉ được chứng minh bằng *"tên mục trong manifest + commit hash niêm phong"*, kèm *"❌ Không có hai thứ này thì nhãn chưa được chứng minh"*.
> ⇒ **Probe `SC-11` — thứ tồn tại để kiểm chính thủ tục quy trách nhiệm trước khi `C3` chạy — không chấm được.** Đề xuất: `B10` viết **11 file**.

**0.5 MD khả thi CHỈ KHI `B8` bàn giao 5 thứ**: (1) kiểm kê input nhân quả từng fixture; (2) **`M-5`** — *chặn cứng*, không biết verdict kỳ vọng thì không thể dự đoán "input này có ảnh hưởng kết cục không"; (3) container mới hay dùng lại giữa `K=3` (đổi mục `process state`: `pg.Pool` `db.js:23-33` `max:5`, `ioredis` `cache.js:54` đều module-level); (4) tập env var chính xác; (5) **`B8` có buộc `B1` mở seam mới không** — 🔺 *ràng buộc thứ tự chưa ai ghi*: mỗi biến mới là một dòng ở mục `env var` của **cả 10 file** ⇒ **`B10` không niêm phong được trước khi bề mặt env của `B1` đóng băng**, mà `Timeline:302` chỉ ghi `Depends: B8`.

**Bằng chứng copy-paste sẽ SAI**: mục Redis — `dự đoán = "không ảnh hưởng"` đã được Wave 1 chứng minh sống (`verdict.md:129-135`). **Nhưng** chỉ trên happy path; nhánh 404 `return` **trước khi** chạm Redis (`verdict.md:137`) ⇒ với `SC-5` dự đoán đúng là *"Redis **không được chạm** ở path này"* — mệnh đề **khác**.

### Q4 — `DEBT-3`: không phải "thiếu file", là hợp đồng tự mâu thuẫn về thời điểm

**(i) CHƯA tồn tại.** `T1` chỉ có dạng khuôn ở `Template-Spike-Report.md:72-80` (7 ô, ô 6 = con dấu tại `:79`); đích là `docs/035-QA/Reports/Report-Spike-Phase-0.md` (`Template:32`) — thư mục `Reports/` **rỗng hoàn toàn**.

**Ba mốc mâu thuẫn:**

| Nguồn | Bảo `T1` xong lúc nào |
|---|---|
| `Template:42`, `:68` | Điền và **đóng băng tại `Gate A`** — đã qua **2026-08-15** |
| `Template:79` + `MTP:501` | Ô 6 chỉ điền được **sau `B10`** — Wave 4 |
| `Template:29-30` | Report do **`C4`** viết — `P0-C` |

Cộng `Template:84` (*"⛔ CẤM sửa đè lên ô gốc"*) ⇒ lần `B10` ghi ô 6 **lần đầu tiên** trông y hệt một lần sửa hậu-đóng-băng.

**(ii)** Lưu ý **5/7 giá trị `T1` đã có sẵn** ở `p0a verdict.md:238-248`; chỉ ô 6 (con dấu) và ô 7 (ngày chốt) còn mở. Worker **đề xuất phương án (b)**: PM tạo file tiền-đăng-ký riêng `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`, chép các ô đã đóng băng, để ô 6/7 trống; `B10` **append** con dấu (append-only); `C4` chép nguyên văn sang `T1` của report. Người tạo: **PM, trước khi dispatch `B10`** — không phải `B10`, vì `B10` không nên tự tạo cái khung mà chính nó đóng dấu vào.

**(iii) Sáu lỗ hổng con dấu:**

| # | Lỗ hổng | Trạng thái |
|:--:|---|---|
| 1 | Squash-merge / rebase | ✅ **PM đã tra: repo dùng merge commit** — `git merge-base --is-ancestor 232a684 HEAD` → YES; PR #5/#6/#7 đều merge commit. Lỗ hổng đóng **theo thực nghiệm**, không theo chính sách |
| 2 | `--amend` / force-push | mở |
| 3 | **Sửa sau con dấu** | `MTP:502` cấm bằng luật, **không cấp bộ dò** |
| 4 | Ngày commit giả mạo được | `GIT_COMMITTER_DATE` ⇒ *"ngày commit"* tự nó không chứng minh thứ tự |
| 5 | Hash không ràng buộc nội dung | commit chạm cả manifest lẫn file khác vẫn hợp lệ |
| 6 | `.gitignore` nuốt manifest | ✅ **đã đóng** — `.gitignore:71` `!test/spike/manifests/` + cảnh báo tại `:70` |

**Quy tắc kiểm rẻ nhất cho `C1`** — ba lệnh, một lần ở đầu `C1`; lệnh giữa là lệnh chịu lực (thứ **duy nhất** bắt được #3):

```bash
git merge-base --is-ancestor "$SEAL_HASH" HEAD || exit 41           # bắt #1, #2
git diff --quiet "$SEAL_HASH" HEAD -- test/spike/manifests/ || exit 42   # bắt #3
[ "$(ls -1 test/spike/manifests/ | wc -l)" -eq 11 ] || exit 43      # bắt xoá lén
```

Thay *"ngày commit"* (giả mạo được) bằng **quan hệ tổ tiên** (không giả mạo mà không viết lại lịch sử — và viết lại làm lệnh 1 fail). ⚠️ Phải **fail-closed**, không `|| true` (bài học `W-2`, `verdict.md:91`); và exit code phải **khác 30** vì `C1` sẽ vẫn `exit 30` cả 10 vòng (`verdict.md:326`).

### Q5 — 🔴 Rủi ro QA số một

> **`M-5` không có chủ: 10 fixture sẽ được dựng mà chữ ký lỗi + verdict kỳ vọng chưa được khai và duyệt trước.**

Mọi ứng viên khác (colima, `T8`, `W-7`, `DEBT-3`) làm **chậm** hoặc làm **một con số** sai, và đều để dấu vết đọc được từ báo cáo. Cái này khác: nó làm **toàn bộ bằng chứng Phase 0 mất tính hợp lệ**, và **không phát hiện được từ chính báo cáo**.

1. `Spec:707` bắt `M-5` khai trước khi chạy, `@TrisJr` duyệt tại `Gate A`.
2. `p0a verdict.md:250` hoãn sang `B8`. `Gate A` đã đóng ⇒ **người duyệt hết cửa sổ, không ai được giao thay**.
3. `Timeline:299` — exit criteria `B8` không có `M-5`.
4. ⇒ 10 fixture ra đời không có verdict kỳ vọng tiền-đăng-ký ⇒ tại `C3`/`C4` mọi verdict được diễn giải **sau khi đã nhìn kết quả** — đúng thứ luật `L1` tồn tại để chặn.
5. Cộng `X5`: scenario "hoá ra không tái tạo được" quy về `M-1` hỏng ⇒ con đường co ① ⇒ `D` co ⇒ ngưỡng **dễ hơn** mỗi lần.
6. ⇒ **`GATE-06` có thể được vượt qua bằng cấu tạo, trong khi mọi luật đều được tuân thủ đúng chữ.**

**Dấu hiệu sớm nhất** 🥇 *trước khi viết dòng code nào*: run-plan Wave 2–4 chép exit criteria `B8` nguyên văn `Timeline:299` mà **không thêm** `M-5` và **không chỉ định người duyệt thay `Gate A`` — dấu hiệu nằm trong chính tài liệu PM sắp viết. 🥈 PR `B8` đầu tiên có fixture mà không có `chữ ký lỗi` + `verdict kỳ vọng` cùng commit — một khi fixture đã chạy trước khi verdict kỳ vọng được ghi, **không có cách nào khôi phục** tính tiền-đăng-ký.

**Chặn rẻ nhất**: PM thêm một dòng vào exit criteria `B8` — *"mỗi fixture kèm `chữ ký lỗi` + `verdict kỳ vọng`, commit **cùng** fixture, `@TrisJr` duyệt trước `C1`"* — và giao `context-auditor` kiểm đúng dòng đó.

## PM đọc được gì

1. **`M-5` là hạng mục orphan thứ hai của repo, cùng lớp với `B10`** — và nó nguy hiểm hơn `B10` vì `B10` chỉ *thiếu*, còn `M-5` được **đánh dấu ✅ trên giấy**. Một bảng nói đã xong, một verdict nói hoãn, một exit criteria không nhắc tới. Ba tài liệu, không tài liệu nào sai một mình.
2. **`B8` không phải 2.0 MD của một task độc lập.** 5/10 scenario cần `B1` mở seam, và `Δ1`/`Δ3` kéo theo `B2` vì `CT-4` fail-fast. Ownership map Wave 1 cho `B8` đúng `test/spike/scenarios/` — với ownership đó `B8` **không thể** hoàn thành.
3. **`SC-4` là ứng viên co denominator số một**, và nó co theo con đường ① (`M-1` hỏng) — con đường **làm ngưỡng dễ hơn**. Đây là chỗ `X5` cắn thật.
4. **`SC-2` và `SC-8` trùng trigger** — hai ô denominator, một cơ chế. Cần quyết ở gate hay ở `B8`?
5. **Hai gap tài liệu cần PM phân xử**: `OS behavior` rơi qua ba tầng; `SC-11` cần file manifest thứ 11.
6. **`DEBT-3` không giải bằng cách tạo file.** Ba mốc thời gian của `T1` mâu thuẫn nhau; phải chọn một cách đọc và ghi rõ, nếu không ô 6 sẽ trông như vi phạm `Template:84` ngay lần ghi đầu.

## Mâu thuẫn với lens khác

**Hội tụ mạnh với `architect` — hai lens đi hai đường, chạm cùng một chỗ:**
- `architect` `Q5`: `B3` ghi `inClass` sai/null ⇒ denominator sụp hoặc không có bộ lọc.
- `quality-assurance` `Q5`: `M-5` không có chủ ⇒ verdict diễn giải sau khi nhìn kết quả ⇒ `X5` co denominator, ngưỡng dễ hơn.

⇒ **Cả hai đều là đòn vào tính hợp lệ của `D` và của ngưỡng `≥6/7`, từ hai đầu đối diện** — một đầu là *ai được vào mẫu số*, đầu kia là *ai được quyền nói kết quả nào là đúng*. Cả hai đều **pass mọi test**, cả hai đều **không đọc ra được từ báo cáo**. PM ghi nhận đây là tín hiệu hội tụ, không phải trùng lặp — cùng loại tín hiệu đã dẫn tới cơ chế `canary_coverage` ở Wave 1.

*(chờ `security-auditor`, `devops-engineer`)*
