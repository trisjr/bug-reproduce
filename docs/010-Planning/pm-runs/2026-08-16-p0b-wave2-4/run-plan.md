---
id: PM-RUN-PLAN-2026-08-16-P0B-W24
type: reference
status: draft
created: 2026-08-16
---

# Run Plan: 2026-08-16-p0b-wave2-4

**Lane** `code` · **Tier** `T3` (3/4, không phân vân) · 4 lens read-only đã chạy

---

## 0. Điều PM phải nói trước mọi thứ khác — capacity `P0-B` từ 122.5% lên **147–151%**

Bốn lens tìm ra **ba hạng mục chưa ai sở hữu** và **năm ước lượng vượt**. Không phải scope creep — là phạm vi **vốn đã tồn tại** trong exit criteria hoặc trong `Spec`/`MTP`, chưa ai cộng vào tổng.

| Hạng mục | `Timeline` cấp | Đo lại | Chênh | Nguồn |
|---|:--:|:--:|:--:|---|
| 🆕 **`B0'`** — mở rộng schema (3/8 nhóm capture §18 vắng `kind`; **không có slot cờ drift** ⇒ `Spec §3.6` bước 3 chết; không có con trỏ manifest) + `directionOf()` dùng chung | **0** | **0.8** | **+0.8** | `architect Q2`/`Q1` |
| 🆕 **`S-1`** — seam `B1`/`B2`: `Δ1`–`Δ6` (tiêm clock, đọc clock ≥2 lần, fault stub, random chạm kết cục, async không đóng, `U∞` ở 404) + instrument latency + công tắc recorder OFF/ON + công tắc `InteractionLog` | **0** | **0.8** | **+0.8** | `QA Q2` · `devops Q2`/`Q3` |
| 🆕 **`INF-1`** — `W-7` vá + `W-3` doc + metric loopback coverage + mạng `--internal` + `cap_drop`/`read_only` | **0** | **0.6** | **+0.6** | `devops Q4b`/`Q5` · `security Q2`/`Q5` |
| `B7` — harness | 2.0 | **3.5–4.2** | **+1.5–2.2** | ≈85 scalar tổng hợp + ≈180 scalar hàng (Wave 1 đoán "≈60+", **thấp ~40%**) |
| `B8` — fixture | 2.0 | **2.5** | **+0.5** | `M-5` (chữ ký lỗi + verdict kỳ vọng) là deliverable orphan |
| `B9` — security review | 1.0 | **1.5** | **+0.5** | thêm mục (iv) forgeable exclusion, (v) bề mặt **output** |
| `B10` — manifest | 0.5 | **0.8** | **+0.3** | 11 file (không phải 10), + tiêu thụ file tiền-đăng-ký `T1` |

**Wave 2–4 thật: 18.0 → 23.0–23.7 MD.**
**`P0-B` toàn phase**: Wave 1 thực tế `6.5` + Wave 2–4 `23.0–23.7` = **29.5–30.2 MD** trên capacity `W4`–`W7` = **20 MD** ⇒ 🔴 **147–151%**.

> Quy ra lịch: `20 MD` = 4 tuần. `29.5–30.2 MD` ≈ **6 tuần** ⇒ `P0-B` trượt **~2 tuần**, và vì `P0-B` không có đệm, nó trượt **thẳng vào `GATE-06`**: `2026-10-23` → **≈ `2026-11-06`**.
>
> Con số này khác các con số trước ở một điểm quan trọng: nó **không** đến từ ước lượng bi quan hơn. Nó đến từ việc bốn lens **đọc code thật và chạy lệnh thật** — `coverage.js` được chạy lại để tái hiện `W-7` ra đúng `4` thay vì `3`; `--permission` được đo trên 8 kịch bản; `colima ssh -- free -m` in ra `Swap: 0`.

---

## 1. Phát hiện hội tụ — bốn lens, một chủ đề

Bốn lens đi bốn đường và **cùng chạm một chỗ**: **tính hợp lệ của con số, chứ không phải tính đúng của code.**

| Lens | Đường vào | Chế độ hỏng |
|---|---|---|
| `architect` | `B3` ghi `inClass: null` **một cách trung thực** ⇒ cổng `B6` loại hết ⇒ `D = 0` | `validateArtifact(inClass=null)` → `ok=true`, **`B3`/`B4`/`B5` đều XANH** |
| `quality-assurance` | `M-5` (chữ ký lỗi + verdict kỳ vọng) **không có chủ** ⇒ verdict diễn giải **sau khi nhìn kết quả** | `X5`: mỗi lần co denominator **hạ ngưỡng** `6/7` → `5/6` → `4/5` |
| `security-auditor` | Exclusion của bộ đếm khoá vào **định danh giả mạo được**; token miễn trừ (`SPIKE_RUN_ID`) được **inject thẳng vào workload bị đo** | `escaped_side_effects = 0` vẫn có thể là số giả |
| `devops-engineer` | Điều kiện đo không cho phép **diễn giải**: CFS throttling lượng tử hoá đuôi latency; `mem_limit: 320m` kiểm duyệt `peak RSS`; seq-scan tăng đơn điệu **thổi phồng overhead recorder có hệ thống** | `MTP §3.2` bắt `C2` **PHẢI từ chối** một con số không diễn giải được |

> 🔴 **Kết luận chung: `P0-B` có thể giao đủ 8 task, mọi test xanh, mọi luật được tuân thủ đúng chữ — và `GATE-06` vẫn không có một con số nào đọc được.**
>
> Đây **cùng loại tín hiệu** đã sinh ra cơ chế `canary_coverage` ở Wave 1 (ba lens cùng chỉ vào *"`escaped_side_effects = 0` có thể là số GIẢ"*). Lần đó PM gộp ba phát hiện thành **một điều kiện tiên quyết**. Lần này bốn phát hiện **không gộp được** — chúng tấn công bốn khâu khác nhau của cùng một chuỗi, nên phải xử **từng cái, ở đúng task sinh ra nó**.

---

## 2. Quyết định PM tự chốt (tầng 2 — trong phạm vi `brief.md`)

Ghi đủ ở [`escalations.md`](escalations.md). Tóm tắt để anh phủ quyết cái nào thấy sai:

| # | Quyết định | Lý do ngắn |
|:--:|---|---|
| `D-1` | **THU HỒI `G-3`** (phê duyệt `docker stop tnm_*`), thay bằng **một dòng cấm override `HOST_*_PORT` vào dải `{5433, 6379, 8100, 9000, 9001}`** | Xung đột port **không còn thật**: canary chiếm `18080`/`18081`/`15432`/`16379`, giao với 5 cổng `tnm_*` = **rỗng**; container port trùng nằm ở **netns khác**. `Deploy-Spike.md:123` đã viết sẵn *"không script nào gọi `docker stop tnm_*`"*. Giữ một phê duyệt *"được phép stop container dự án khác"* treo suốt Wave 2–4 là **rủi ro thuần, không đổi lại được gì** |
| `D-2` | **`DEBT-2` không phải câu hỏi nhị phân.** `T8` chạy **hai lần cùng một fixture**: `T8-a` không `--permission` (**ô chính thức**, FAIL, giữ khoảng hở đã đo) + `T8-b` có `--permission` (**probe**, ghi *"ứng viên `L2` tầng process, chi phí đã đo"*). Ghi vào exit criteria `B5` | Bật cờ ⇒ `T8` bị chặn **trong process** ⇒ canary không thấy gì ⇒ *"đã chặn"* và *"chưa từng thử"* **trông giống hệt nhau** — đúng bẫy `MTP §5.1`. Chi phí phương án này: **một lần gọi thêm, 0 dòng code, 0 test bị làm nhẹ** |
| `D-3` | **`W-3` = phương án (a)** (`B3` map tại hook driver), **kèm hai guardrail bắt buộc**: (i) `B3` **cấm đọc** `interaction-log.js`; (ii) `direction` derive bằng **một hàm thuần `directionOf()` đặt trong `B0'`**, `B3` và `B5` cùng gọi | (b) mở `KINDS` = **đảo ngược `G1`** (Redis thành đơn vị so sánh) và tốn 3 chỗ sửa, ra 4 lỗi validate. (c) sửa `B1` = phá `test-invariant.js` = phá bằng chứng `G1`/`R2` |
| `D-4` | **Sàn manifest = 5 mục, thêm `OS behavior`.** Ghi một dòng đính chính vào `MTP §6.2` | `Spec:187` liệt kê **bốn** nhóm và `Spec:197` bắt cả bốn vào manifest; `Spec:246` tự chép lại chỉ **ba**, `MTP:486-489` chép theo, `Timeline:302` chép tiếp. Ba tầng tài liệu, không tầng nào sai một mình. **Đọc fail-closed ⇒ chọn bản nghiêm hơn** |
| `D-5` | **`B10` viết 11 file, không phải 10** — thêm manifest cho `SC-11` | `Spec:259` bắt `SC-11` phải ra `incomplete-capture`; `MTP:525` bắt nhãn đó chỉ được chứng minh bằng *"tên mục trong manifest + hash"* ⇒ không có file thì **probe kiểm chính thủ tục quy trách nhiệm lại không chấm được** |
| `D-6` | **Tách `B7` → `B7a`** (overhead, `Depends: B3`, ≈2.3 MD, chạy được **Wave 2–3**) **+ `B7b`** (fidelity + composite, `Depends: B4,B5,B6`, ≈1.2–1.9 MD, **Wave 4**) | `Timeline:298` khai `Depends: B3, A5` — **thiếu**. 4/6 metric đọc verdict `B6`, `t_verify`, `T1`–`T12`. `B7` đơn khối **không thể bắt đầu** trước Wave 3. Tách **không giảm MD nhưng giải phóng lịch** |
| `D-7` | **PM tạo `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md`** trước khi dispatch `B10`; `B10` **append** con dấu; `C4` chép nguyên văn sang `T1` của report | `DEBT-3` không phải "thiếu file" mà là **hợp đồng tự mâu thuẫn về thời điểm** (đóng băng tại `Gate A` / ô 6 điền sau `B10` / report viết ở `C4`), cộng `Template:84` cấm sửa đè ⇒ lần ghi ô 6 **đầu tiên** trông như amend. Tách bảng chống-gian-lận khỏi report giải được mâu thuẫn |
| `D-8` | **Capsule writer từ chối ghi** nếu out-dir không chứa `/capsules/` và filename không kết thúc `.capsule` | `.gitignore:61` phủ `src/spike/**/capsule**s**/` nhưng `Timeline:295` đặt `B4` ở `src/spike/capsule/` — **thiếu một chữ `s`** ⇒ capsule đi thẳng vào git (`THREAT-006` đường 1: *"Git history là bất biến theo thiết kế"*). **Một câu `if`** biến `.gitignore` từ hy vọng thành mặt cưỡng chế |
| `D-9` | 🎩 **Quy tắc gán `inClass` cho spike**, chốt **trước** khi dispatch `B3`: *"`S1`–`S6` đánh giá tại capture bằng lời khai, mỗi điều kiện ghi kèm `mechanism`; **`S7` KHÔNG tham gia `inClass` ở `P0-B`**, được `B7` kiểm riêng qua bảng `K=3` verdict"* | Không có quy tắc thì `B3` **buộc phải đoán**, và **cả hai hướng đoán đều hỏng**: `null` trung thực ⇒ `D = 0`; `true` cho cả 10 ⇒ denominator **chưa từng được lọc**, *"không cách nào phát hiện từ chính báo cáo"* (`Timeline:297`). Ở giữa **không có mặc định an toàn nào** |
| `D-10` | **`M-5` vào exit criteria `B8`**: mỗi fixture kèm `chữ ký lỗi` + `verdict kỳ vọng`, **commit cùng fixture**. Người duyệt: xem gate `Q4` | Đây là chặn rẻ nhất và sớm nhất; sau khi fixture đã chạy thì **không có cách nào khôi phục** tính tiền-đăng-ký |
| `D-11` | **`B7` gọi `resetOrders()` trước MỖI chặng A/B**, và đảo thứ tự thành **`OFF/ON/ON/OFF`** | `spike_order` **không có index trên `customer_id`** + INSERT mỗi request ⇒ seq-scan **tăng đơn điệu ngay trong cửa sổ đo**. A/B xen kẽ khử drift **thời gian**, không khử drift **trạng thái** ⇒ ON luôn sau OFF ⇒ **overhead recorder bị thổi phồng có hệ thống**, không lộ ra từ báo cáo |

> ⚠️ `D-9` là quyết định **nặng nhất** trong danh sách này — nó diễn giải `Spec §2.2`/`§2.6`, là tài liệu `approved` của `Gate A`. Em xếp nó ở tầng 2 vì nó **không đổi** `D = 7`, **không đổi** ngưỡng `≥6/7`, **không đổi** `K = 3` — ba tham số `L1` đã đóng băng. Nó chỉ nói **ai chấm `S7` và chấm ở đâu**. Nhưng anh nên biết em đã chốt nó, và phủ quyết được.

---

## 3. Phases — phạm vi PM đề xuất cho run này: **Wave 2**

Cắt theo đồ thị `Depends` **thật** (`architect Q4` đã bác 4 cạnh thừa và tìm 6 cạnh thiếu), không theo bảng `Timeline`.

### Wave 2.1 — nền móng (3 worker **song song**, ownership rời tuyệt đối)

| # | Task | Agent | MD | Output |
|---|---|---|:--:|---|
| `W2.1a` | 🆕 **`B0'`** — mở rộng schema: 3 `kind` §18 (`stack-trace`, `git-commit`, `runtime-metadata`) + **lớp cờ drift** (`Spec §3.6` bước 3, `MTP:527` đòi *"giá trị hai bên"*) + con trỏ commit hash manifest + hàm thuần **`directionOf(kind, target)`** | `architect` | 0.8 | `src/spike/contract/**` |
| `W2.1b` | 🆕 **`S-1`** — seam `B1`/`B2`: `Δ1` tiêm clock · `Δ2` đọc clock ≥2 lần · `Δ3` fault injection tất định cho stub · `Δ4` random chạm kết cục · `Δ5` async không đóng · `Δ6` `U∞` ở nhánh 404 · instrument latency in-process · công tắc recorder OFF/ON **trước `require`** (mở rộng `SPIKE_ENTRYPOINT`) · công tắc `InteractionLog` | `software-engineer` | 0.8 | `src/spike/app/**` · `src/spike/infra/docker-compose.spike.yml` |
| `W2.1c` | 🆕 **`INF-1`** — `W-7` vá (`/LOG:\s+statement:/` + quy tắc `R7` + 2 test hồi quy) · metric `loopback_listeners_not_covered_by_canary` · positive control loopback · mạng thứ hai `--internal` cho `B5` · `cap_drop: [ALL]` + `no-new-privileges` · `W-3` ghi chú | `devops-engineer` | 0.6 | `src/spike/infra/**` **trừ** `docker-compose.spike.yml` |

### Wave 2.2 — capture & fixture (3 worker **song song**)

| # | Task | Agent | MD | Output |
|---|---|---|:--:|---|
| `W2.2a` | **`B3`** recorder — 8 nhóm §18, `class_assessment` theo `D-9`, dùng `B0'`, **cấm đọc `interaction-log.js`**, chốt `S1`/`S2`/`S3` (cơ chế OFF/ON · nhãn path `P-discard`/`P-persist` · định nghĩa *failed execution*), chạy **KHÔNG CAP** | `software-engineer` | 4.0 | `src/spike/recorder/**` |
| `W2.2b` | **`B4`** capsule writer — tự chứa, `D-8` enforcement out-dir | `software-engineer` #2 | 1.5 | `src/spike/capsule/**` |
| `W2.2c` | **`B8`** fixture 10 scenario + **`M-5`** (`D-10`) + bàn giao 5 input cho `B10` | `software-engineer` #3 | 2.5 | `test/spike/scenarios/**` |
| `W2.v` | **Verify** Completeness / Correctness / Coherence | `context-auditor` ⚠️ **KHÔNG dùng `quality-assurance`** — QA là driver `B10` (`AS-5`) | — | `verdict.md` |

**Tổng Wave 2: 10.2 MD, 6 implementer + 1 verifier.**

> **Vì sao `B4` song song được với `B3`** dù `Timeline` khai `B4 ← B3`: đối tác hợp đồng thật của `B4` là **`B0'`** — `serializeArtifact`/`parseArtifact` đã tồn tại (`schema.js:358-364`), `makeArtifact()` đã cố định hình dạng. `B4` dựng trên artifact fixture sinh từ `B0'`. Tuần tự chỉ đúng **lúc tích hợp**.
>
> **Vì sao `B8` phải ở 2.2 chứ không 2.1**: 5/10 scenario cần seam của `S-1` (`Δ1`, `Δ3`).

### Wave 3 và 4 — **run mới, gate mới** (nếu anh chọn phương án A)

| Wave | Task | MD |
|---|---|:--:|
| `W3` | `B5` (4.0, kèm `D-2` `T8-a`/`T8-b` + `L2` `--internal`) · `B6` (3.0, cổng `inconclusive`) · `B7a` (2.3) | 9.3 |
| `W4` | `B7b` (1.2–1.9) · `B9` (1.5, +mục iv/v) · `B10` (0.8, 11 file) | 3.5–4.2 |

---

## 4. File ownership map

> Các tập PHẢI rời nhau tuyệt đối. `tasks.md` thuộc về PM, **không cấp cho worker nào**.

| Agent | Sở hữu (được ghi) | Cấm chạm |
|---|---|---|
| **PM** | `.gitignore` · `docs/010-Planning/pm-runs/2026-08-16-p0b-wave2-4/**` · `tasks.md` · `docs/010-Planning/Estimates/Timeline-Repro.md` · `docs/010-Planning/Planning-MOC.md` · `docs/035-QA/Reports/T1-Pre-Registration-*` · `docs/030-Specs/**` · `docs/035-QA/Test-Plans/**` | `src/**`, `test/**` |
| `architect` (`B0'`) | `src/spike/contract/**` | mọi thứ khác |
| `software-engineer` (`S-1`) | `src/spike/app/**` · `src/spike/infra/docker-compose.spike.yml` | `src/spike/infra/**` *(trừ file trên)*, `src/spike/contract/**`, `docs/**` |
| `devops-engineer` (`INF-1`) | `src/spike/infra/**` **TRỪ** `docker-compose.spike.yml` | `src/spike/app/**`, `docker-compose.spike.yml`, `docs/**`, `docs/035-QA/Evidence/**` |
| `software-engineer` (`B3`) | `src/spike/recorder/**` | — |
| `software-engineer` #2 (`B4`) | `src/spike/capsule/**` | — |
| `software-engineer` #3 (`B8`) | `test/spike/scenarios/**` | `test/spike/manifests/**`, `test/spike/bench/**`, `src/**` |
| `context-auditor` (verify) | *(read-only)* — PM ghi `verdict.md` | tất cả |
| *(W3)* `software-engineer` (`B5`,`B6`) | `src/spike/replay/**` · `src/spike/verify/**` | — |
| *(W3/W4)* `devops-engineer` (`B7a`,`B7b`) | `src/spike/bench/**` · `test/spike/bench/**` | ⚠️ **KHÔNG** phải `test/spike/**` |
| *(W4)* `security-auditor` (`B9`) | *(read-only)* — PM ghi `findings/` | tất cả |
| *(W4)* `quality-assurance` (`B10`) | `test/spike/manifests/**` | `test/spike/scenarios/**`, `test/spike/bench/**` |

⚠️ **Ba va chạm đã cắt tường minh:**
1. `Timeline:298` cấp `B7` cả `test/spike/` — **thư mục CHA** của `scenarios/` (`B8`) và `manifests/` (`B10`). Thu hẹp về `test/spike/bench/`.
2. `S-1` và `INF-1` cùng nằm trong `src/spike/infra/`. Cắt theo **file**: `S-1` giữ **đúng** `docker-compose.spike.yml` (vì `CT-4` fail-fast bắt `config.js` và compose phải đổi **cùng lúc**); `INF-1` giữ **mọi thứ còn lại**.
3. `docs/030-Specs/**` và `docs/035-QA/Test-Plans/**` là file `approved` ⇒ **chỉ PM ghi** (`D-4` đính chính `MTP §6.2`, dòng ledger `§5.2`).

---

## 5. Artifact sẽ tạo/sửa ngoài run-state

**Code**: `src/spike/contract/` *(mở rộng)* · `src/spike/app/` + `docker-compose.spike.yml` *(seam)* · `src/spike/infra/` *(nợ + `L2`)* · `src/spike/recorder/` 🆕 · `src/spike/capsule/` 🆕 · `test/spike/scenarios/` 🆕

**Tài liệu (PM ghi)**:
- `docs/035-QA/Test-Plans/MTP-Spike-Phase-0.md` §6.2 — **đính chính sàn manifest thành 5 mục** (`D-4`) *(file `approved`; sửa vì `Spec:197` đòi bốn nhóm mà `MTP` chỉ chép ba — là **sửa lỗi chép thiếu**, không phải đàm phán lại contract)*
- `docs/030-Specs/Spec-Spike-Protocol.md` §5.2 — **dòng ledger thứ 7**: disclosure inventory host trong `docs/035-QA/Evidence/` *(đã xảy ra ở Wave 1, không rewrite history được)*, + stack trace nhúng absolute path
- 🔴 `docs/010-Planning/Estimates/Timeline-Repro.md` — thêm `B0'`/`S-1`/`INF-1`, tách `B7a`/`B7b`, cộng lại tổng, mục §15 có ngày
- 🔴 `docs/010-Planning/Planning-MOC.md` — dòng 122.5% thành **cũ**
- *(trước `B10`, Wave 4)* `docs/035-QA/Reports/T1-Pre-Registration-Spike-Phase-0.md` 🆕 (`D-7`)

---

## 6. Assumptions

| # | Assumption | Sai thì hỏng ở đâu |
|:--:|---|---|
| `AS-1` | `B0'` **mở rộng** schema chứ không **đổi** signature đang có ⇒ `B1`/`B2` Wave 1 không phải sửa theo | Đổi signature ⇒ ba consumer rework cùng lúc, đúng thứ `B0` sinh ra để chống |
| `AS-2` | `S-1` và `INF-1` cắt được theo **file** trong cùng `src/spike/infra/` | Nếu `INF-1` cần sửa `docker-compose.spike.yml` ⇒ **báo `BLOCKED`**, PM quyết, không tự sửa |
| `AS-3` | `context-auditor` **verify được code**, không chỉ tài liệu | Nếu không, verify Wave 2 phải đổi agent — nhưng **không được dùng `quality-assurance`** (driver `B10`) |
| `AS-4` | Wave 2 **không chạy phép đo nào cần P95/P99** ⇒ `DEBT-1` chưa cắn trong run này | `B3` chạy KHÔNG CAP trong `mem_limit: 320m` trên `Swap: 0` — **`devops Q5` nói OOM có thể cắn NGAY Wave 2**, không đợi `B7`. ⇒ `INF-1` **phải** gắn cổng `memory.peak`/`oom_kill` ngay |
| `AS-5` | Quyền git giống `G-4`: branch `spike/p0b-wave2`, commit, **không** push/PR | Con dấu `B10` (Wave 4) vẫn là escalation **riêng** |

---

## 7. Gate

- **Trình ngày**: 2026-08-16
- **Kết quả**: ✅ **DUYỆT** — `@TrisJr`, 2026-08-16
- **Bốn quyết định**: `G-1` Wave 2 rồi đóng run · `G-2` không nâng colima run này (`DEBT-1` **chưa đóng**) · `G-3` giãn Phase 0, dời `GATE-06` · `G-4` `@TrisJr` duyệt `M-5` **trước** khi `B8` chạy fixture
- **Bản ghi đầy đủ**: [`escalations.md §E2`](escalations.md)
- **Phát sinh từ gate**: `D-12` — `INF-1` gắn cổng `memory.peak`/`oom_kill`/`nr_throttled` + probe `tnm_*` ngay Wave 2
- **Ngoại lệ đường `T3`**: không scaffold `openspec` — điều kiện tiên quyết không thoả, xem [`escalations.md §E1`](escalations.md)
