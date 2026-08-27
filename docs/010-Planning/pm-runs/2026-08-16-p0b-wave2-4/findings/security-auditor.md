---
id: PM-FIND-2026-08-16-SEC
type: reference
status: draft
created: 2026-08-16
---

# Findings — security-auditor (lens bảo mật, read-only)

> ⚠️ **Ghi chú quy trình của PM**: output của lens này trở về kèm cảnh báo *"UNREVIEWED — safety review không đánh giá được"*. PM đã đọc toàn văn: **không** có dấu hiệu prompt injection, **không** yêu cầu hành động bất thường, mọi kết luận đều neo `file:line`. Ngoài ra PM **tự kiểm độc lập ba khẳng định nặng nhất** (mục ✅ ở dưới) thay vì chấp nhận nguyên trạng. Worker cũng tự khai 3 mục **không** xác minh được do bash bị chặn giữa phiên — ghi ở cuối.

## Kết luận của worker

### Q1 — `DEBT-2`: `T8` + Node `--permission`

**Đo lại trên máy này**, `node v22.21.1`:

| # | Lệnh | Kết quả |
|:--:|---|---|
| 1 | `node t8-child.js` (baseline) | `CHILD_PROCESS_OK "000"` — curl chạy |
| 2 | `node --permission t8-child.js` | `CHILD_PROCESS_BLOCKED ERR_ACCESS_DENIED … Use --allow-child-process` |
| 3 | `node --permission --allow-fs-read='*' t8-child.js` | vẫn `ERR_ACCESS_DENIED` |
| **4** | `node --permission --allow-fs-read='*' t12-net.js` | 🔴 **`NET_CONNECT_OK to 127.0.0.1:6379`** — kết nối TCP **thành công** |
| 5 | `node --permission … t-fs-write.js` | `FS_WRITE_BLOCKED ERR_ACCESS_DENIED` |
| 6 | `node --permission --allow-worker t-worker.js` | `SecurityWarning: … could invalidate the permission model` + `WORKER_CHILD_BLOCKED` |
| 7 | `node --permission req.js` | `REQUIRE_BLOCKED` — `require()` chết nếu không có `--allow-fs-read` |
| 8 | `--allow-fs-write="$SP/allowed/*"` | `WRITE_OK …/allowed/ok.txt` · `WRITE_DENY …/denied.txt` · `WRITE_DENY /tmp/…` |

**Dòng 4 là bằng chứng trực tiếp, không cần tra flag**: với `--permission` bật hoàn toàn, `net.connect()` ra ngoài **vẫn đi được**. Permission model v22 **không có chiều mạng** — `T12` nằm ngoài tầm với **vĩnh viễn**, không phải "thiếu `--allow-net`" mà là "không có trục nào để cấp/từ chối". **Dòng 8** là thứ Wave 1 chưa đo: `--allow-fs-write` có granularity theo path và deny mọi thứ ngoài glob — một `L2` thật, nhưng cho **filesystem**, không cho mạng.

**Chiếu lên `T1`–`T12`: `--permission` chỉ chạm đúng 1/12 ô (`T8`).** `T7` (net.Socket thô), `T9` (SDK transport), `T12` (loopback) đều không đổi.

🔴 **Giá thật của việc bật `--permission` — mất phép đo, không phải vi phạm điều cấm.** Với `--permission`, `T8` bị chặn **trong process, trước khi có một byte ra dây** ⇒ canary **không thấy gì**. Nhưng canary cũng không thấy gì khi test **không chạy**. Đó là bẫy `MTP §5.1:382-395` tái xuất dưới hình dạng mới: *"đã chặn"* và *"chưa từng thử"* trông **giống hệt nhau** trong canary log. Clause (i) hiệu chuẩn **canary**, không hiệu chuẩn **test**. `MTP §5.4:455` nói giá trị của `T8` nằm ở chỗ nó cho `@TrisJr` quyết định *"L2 tầng OS hay chấp nhận residual"* **bằng dữ liệu** — bật `--permission` xoá đúng dữ liệu đó.

*(Làm rõ: bật `--permission` **không** nằm trong ba hành vi bị cấm của `MTP §5.4:450-453` — không sửa fixture, không bỏ test, không ghi "ngoài phạm vi". Vấn đề là mất phép đo.)*

**Chi phí vận hành nếu bật**: `require()` chết nếu thiếu `--allow-fs-read` (dòng 7) ⇒ phải khai allowlist cho `node_modules` + capsule dir. `ENTRYPOINT` chạy `npm run --silent start:app` (`Dockerfile.app:38-52`), mà `npm` spawn con bằng `child_process` ⇒ entrypoint tự chết *(suy luận từ dòng 2/3, worker khai rõ là suy luận)*; đường vòng có sẵn ở `Dockerfile.app:43-44`. `--allow-worker` in `SecurityWarning` chính thức ⇒ nếu cần worker thì `L2` này tự tuyên bố đã thủng.

**Khuyến nghị `(c)` — chạy `T8` hai lần, cùng một fixture, không sửa một chữ:**
- **`T8-a`** (ô chính thức của ma trận): replay **không** `--permission` ⇒ **FAIL**, canary ghi được `curl` thật ⇒ *khoảng hở đã đo được, có số, có ngày*.
- **`T8-b`** (probe kèm theo, **không** thay `T8-a` trong bảng kết quả): cùng fixture, replay khởi động với `--permission --allow-fs-read=<capsule+node_modules> --allow-fs-write=<out-dir>` ⇒ ghi là *"ứng viên L2 tầng process, chi phí đã đo"*.

Chi phí: **một lần gọi thêm, 0 dòng code mới, 0 test bị làm nhẹ**. `@TrisJr` nhận **hai số cạnh nhau** thay vì một quyết định. Kèm miễn phí: `--allow-fs-write` path-scoped là containment thật cho artifact (thứ `Q4` cần).

⛔ **`(c)` KHÔNG hứa**: `T12` vẫn hở (dòng 4). Trần của `--permission` là **11/12**, và ô còn lại là ô nguy hiểm nhất — xem `Q5`.

### Q2 — `L2` đặt ở tầng nào

```
grep -rn "internal:|cap_drop|security_opt|read_only|NODE_OPTIONS|privileged|no-new-privileges" src/spike/
→ ZERO hit
```
**Wave 1 không có một biện pháp cách ly tầng container nào.**

| Tầng | Chạm `T8`? | Chạm `T12`? | Đánh giá |
|---|:--:|:--:|---|
| **Network `internal: true`** | ✅ (biên ở netns ⇒ `child_process` cũng bị) | ❌ (đúng thiết kế `ADR-005 §Decision #3`) | ⭐ **Rẻ nhất mà thật, ~10 dòng** |
| `cap_drop: [ALL]` + `no-new-privileges` | ❌ | ❌ | 2 dòng, nên có, đừng kể công |
| `read_only: true` + `tmpfs` | ❌ | ❌ | Phục vụ `Q4`, không phục vụ metric |
| seccomp custom | ❌ thực tế | ❌ | ⛔ lọc **syscall** chứ không lọc **đích**; chặn `socket()` thì runtime tự chết |
| userns remap | ❌ | ❌ | ⛔ **vi phạm ràng buộc** — setting toàn daemon, phải restart `dockerd` đang chạy 4 container `tnm_*` |
| iptables trong container | ✅ nhưng | ❌ | ⛔ cần `NET_ADMIN` — cấp một capability để lấy đi một capability; rule nằm **trong** blast radius |
| DNS blackhole | ❌ | ❌ | ⛔ vòng qua bằng IP literal; spike **đã có bản tốt hơn** |

**Đề xuất — mạng thứ hai `--internal`**: replay container gắn **chỉ** vào mạng internal, canary gắn cả hai (kèm alias `spike-*`). Không có default route ra ngoài ⇒ `curl` của `T8` **không rời được máy**, nhưng `curl http://spike-httpstub/...` **vẫn tới canary và vẫn được ghi log**. Điểm mấu chốt: chặn ở tầng kernel **mà không làm mù canary** ⇒ `T8` vẫn cho ra một **phép đo** thay vì một **khoảng lặng**.

**Tầng Wave 1 đã vô tình có sẵn:**
1. ⭐ **DNS sinkhole — bản tốt hơn blackhole**: canary chiếm 4 alias `CT-3` trên external network (`docker-compose.canary.yml:69-74` + `docker-compose.spike.yml:7-15`, `external: true` nên sống sót qua destroy). Đây là lớp **redirect** chứ không phải block — và với `T8` thì **redirect quý hơn**, vì nó **sinh ra bằng chứng**.
2. Chiếm lại host port y hệt, bind `127.0.0.1` — nhưng **chỉ 3 cổng** `18080`/`18081`/`16379`.
3. **Fail-closed port contention** (`up.sh:81-87`): cổng đã bị giữ ⇒ **từ chối chạy**, không remap ngầm, không stop kẻ đang giữ.
4. `mem_limit`/`cpus` — blast radius, **không** phải `L2`.

🔴 **Cái Wave 1 vô tình thiếu, và nó ngược dấu**: `up.sh:44-49` tạo mạng **không** có `--internal` ⇒ **mọi container spike hiện có NAT egress ra Internet thật**. Hôm nay `L2` tầng mạng **bằng không**.
✅ **PM kiểm độc lập**: đọc `up.sh:40-52` — `docker network create` chỉ có `--label` ×3 và `--subnet`. **Xác nhận không có `--internal`.**

### Q3 — Phạm vi `B9`

**`SUGGESTION-6` đúng, và nặng hơn mô tả.**

| `file:line` | Exclusion | Loại | Ai giả mạo được |
|---|---|:--:|---|
| `coverage.js:230` | `app === 'pg_isready'` | **FORGEABLE** | `application_name` là **connection parameter do client đặt** — chính `db.js:32` đang dùng đúng knob đó |
| `coverage.js:224` | `app.indexOf(MARKERS.control) >= 0` | **FORGEABLE** | như trên |
| **`coverage.js:227`** | `line.indexOf(MARKERS.control) >= 0` | **FORGEABLE — nặng nhất** | khớp marker ở **bất kỳ đâu trong text câu lệnh** ⇒ `INSERT INTO orders VALUES ('repro-canary-control-…')` **biến mất khỏi bộ đếm**. Thân SQL do fixture kiểm soát 100% |
| `coverage.js:470-479` | `JSON.stringify(e).indexOf(marker)` | **FORGEABLE** | event stringify trùm `headers`, `raw_url`, `query`, `body_utf8`, `payload_utf8` ⇒ **một header** là loại **cả connection** theo `conn_id` (`coverage.js:505`) |
| `coverage.js:221` | `client === '[local]'` | **STRUCTURAL — giữ** | unix socket vs TCP, do Postgres ghi |
| `coverage.js:482-485` | R6 loopback | **STRUCTURAL — giữ** | từ `sock.remoteAddress`, kernel cấp |

🔴 **Điểm chí mạng `SUGGESTION-6` chưa nói**: marker là `repro-canary-{control,selftest}-${runId}` (`coverage.js:85-91`), `runId` = `SPIKE_RUN_ID` — biến này được **inject thẳng vào environment của chính workload đang bị đo** (`docker-compose.spike.yml:59`), lại còn được canary **trả về trong body mọi HTTP response** (`canary.js:218-220`). ⇒ **Token miễn trừ không phải bí mật đối với đối tượng bị đo; nó được trao tận tay.**

**Nâng thành `B9` mục (iv)** — phát biểu kiểm chứng được:
> Mọi exclusion áp lên `escaped_side_effects` phải được phân loại **STRUCTURAL** (dẫn xuất từ thuộc tính workload không đặt được) hoặc **FORGEABLE** (dẫn xuất từ chuỗi workload phát ra được). `B9` in **hai danh sách kèm `file:line`**; run báo thêm `forgeable_exclusions = N` **in cạnh** `escaped_side_effects` theo khuôn clause (v) (`coverage.js:579-583`). Một run có `escaped_side_effects = 0` **và** `N > 0` **không được đọc là bằng chứng an toàn tuyệt đối** — chỉ là bằng chứng có điều kiện *"không có leak nào cố tình mang marker"*.

**Test chứng minh, ~15 phút, 0 code mới**: chạy lại **đúng 3 leak** Wave 1 đã bơm (bắt 3/3), nhưng nhét marker vào `application_name` và vào một header. Kỳ vọng: **3/3 → 0/3**. Con số `0/3` **chính là** finding của mục (iv).

**Mục (v) BẮT BUỘC sau Wave 2–4:**
> Không artifact nào do `B3`/`B4` sinh ra chứa: (1) giá trị credential `SPIKE_PG_*`; (2) dump nguyên khối `process.env`; (3) giá trị của bất kỳ biến nào trong 13 biến `.env` gốc; (4) object cấu hình driver/pool. **Test**: `grep -r "$SPIKE_PG_PASSWORD" <capsule-out-dir>` = **0 hit**; env-capture phải là **allowlist tên key tường minh** bằng đúng `APP_ENV_KEYS` (`config.js:17-29`) **trừ** `SPIKE_PG_PASSWORD`.

Lý do (v) bắt buộc: ba mục (i)–(iii) hiện có **đều nhìn INPUT** của spike. **Không mục nào nhìn OUTPUT.** Wave 2–4 mới là lúc spike **bắt đầu ghi ra đĩa**.

### Q4 — `CTL-1` và bề mặt secret

**`CTL-1` còn được giữ ✅** — `grep dotenv src/` chỉ ra **3 dòng comment** (`server.js:7`, `config.js:7-8`), **0 dòng code**; app deps đúng 2 gói; `config.js:56-72` fail-fast không fallback.

`.env` gốc: worker chỉ liệt kê **tên biến**, không đọc giá trị — 13 biến gồm 4 capability URL `MICROSOFT_TEAMS_FLOW_*`, `CLICKUP_API_KEY`, `TELEGRAM_BOT_TOKEN`.

**Chín đường secret/PII vào artifact, kèm biện pháp rẻ nhất:**

| # | Đường | Biện pháp |
|:--:|---|---|
| 1 | `runtime metadata` = nguyên `process.env` (chứa `SPIKE_PG_PASSWORD`, `compose:64`); recorder chạy trên host thì `cwd` = repo root nơi `.env` nằm. `CTL-1` chặn `dotenv`, **không** chặn recorder tự dump env | Allowlist tên key = `APP_ENV_KEYS` trừ password, ~3 dòng. ⚠️ Miễn trừ "KHÔNG CAP" của `G2` áp cho **kích thước**, **không** cấp phép mở rộng **tập key** |
| 2 | Hook driver serialize `Pool` config chứa `password` (`db.js:24-33`) | Chỉ ghi `{sql, values, rowCount, rows}` + unit test assert không có key `password`/`connectionString`, ~5 dòng |
| 3 | `result.rows` uncapped — kênh PII **theo thiết kế** | Không redact trong spike; control là `B9(i)` + assert `seed.js` là **writer duy nhất** của reference data |
| 4 | Header request + body response HTTP ngoài (`external.js:33`) | Denylist tên header (`authorization`, `cookie`, `x-api-key`, `proxy-authorization`) → `[redacted:<len>]`, ~4 dòng. Control duy nhất **dù sao cũng phải sống tới V0.1** |
| **5** | ⭐ **`.gitignore` phủ `src/spike/**/capsule**s**/` nhưng `Timeline:295` đặt `B4` ở `src/spike/capsule/`** — **thiếu một chữ `s`**, không khớp pattern nào ⇒ capsule đi **thẳng vào git** (`THREAT-006` đường 1, *"Git history là bất biến theo thiết kế"*) | Capsule writer **từ chối ghi** nếu out-dir đã resolve không chứa `/capsules/` và filename không kết thúc `.capsule`. **Một câu `if`** — biến `.gitignore` từ một hy vọng thành một **mặt cưỡng chế** |
| 6 | `src/spike/infra/artifacts/run.env` chứa `SPIKE_PG_PASSWORD` plaintext (`up.sh:53-68`); artifact *"tự chứa"* là đúng loại hay được đính kèm `run.env` | Capsule ghi **tên key** + `run_id`/`nonce`, **không bao giờ** ghi file |
| 7 | Git metadata — `git remote -v` có thể chứa token-in-URL; author email là PII | Chỉ `git rev-parse HEAD`. Không remote, không author. ~1 dòng |
| 8 | Stack trace nhúng absolute path host `/Users/trisjr/…` | Chấp nhận trong spike, khai 1 dòng ledger `§5.2`. Chi phí 0 |
| **9** | ⚠️ **ĐÃ XẢY RA** — `docs/035-QA/Evidence/` cố ý un-ignore, `destroy-evidence-*.json` mang `all_listeners_at_start/end` (`verify.js:576-578`) ⇒ **inventory host nằm vĩnh viễn trong git history** | ⛔ **Không rewrite history** (bằng chứng có ngày tháng). `B9` ghi nhận là **disclosure đã biết và được chấp nhận** vào ledger `§5.2`.<br>**Tin tốt cần biến thành LUẬT**: `coverage.js:524-533` và `:249-260` chỉ đưa **metadata**, **không payload**, vào Evidence ⇒ **cấm `B5` dump text SQL / body của leak vào bất cứ file nào ghi xuống `Evidence/`**. Cám dỗ ở `B5` sẽ đúng là làm ngược lại |

✅ **PM kiểm độc lập mục 5 và mục 9**:
- `.gitignore:61` = `src/spike/**/capsules/`, `:63` = `test/spike/**/capsules/`, `:64` = `*.capsule`. **Xác nhận mismatch chữ `s`.**
- Đọc `destroy-evidence-r20260815T163415Z-canary-active-*.json`: `all_listeners_at_start` = **35 record**, mỗi record `{command, pid, user, type, address, port, is_loopback, is_wildcard, raw}` — `ControlCe`, `webstorm`, `jetbrains`, `limactl`, `rapportd`… **Xác nhận disclosure là thật.**

### Q5 — 🔴 Rủi ro bảo mật số một

> **Một WRITE rò rỉ resolve về loopback của host sẽ đáp xuống một dịch vụ THẬT của dự án khác đang chạy trên cùng máy, thay vì đáp xuống canary. Hệ quả kép, cả hai đều im lặng: `escaped_side_effects` đọc ra `0` SAI, và thiệt hại dữ liệu xảy ra NGOÀI blast radius của spike.**

`THREAT-018` residual (b) — trên máy này **không phải giả định**. Ba mảnh bằng chứng độc lập:
1. `docker ps`: `tnm_redis` publish `0.0.0.0:6379`, `tnm_postgres` publish `0.0.0.0:5433`, cả hai **`Up 8 days`**.
2. Canary chỉ chiếm **3 cổng host** (`canary.yml:66-68`); **không thể** chiếm `6379`/`5433` — `up.sh:81-87` fail-closed đúng vì lý do đó.
3. Thí nghiệm dòng 4: `net.connect(127.0.0.1:6379)` → **thành công, ngay cả dưới `--permission` bật hết mức**.

Xếp **trên** rủi ro marker giả mạo (`Q3`) vì marker giả mạo cần một leak **cố ý** — trong spike, fixture do chính team viết, không có đối thủ. **Loopback là tai nạn, và nó phá dữ liệu thật.**

**Dấu hiệu sớm nhất — đã quan sát được ngay hôm nay, không cần `B5`**: hiệu của tập listener loopback ở clause (iii) trừ `clauseIV.ports_listening` là **khác rỗng, và hiện bằng 28**:
```
6379 ssh ← tnm_redis (colima port-forward) · 5433 ssh ← tnm_postgres
8100 ssh ← tnm_video_preprocessor · 9000/9001 ssh ← tnm_minio
3000/4321/4322 node · 30000 cef_serve · webstorm ×8 · jetbrains ×2
figma_age ×2 · ControlCe ×2 · limactl ×2 · embedding · rapportd
```
Mỗi phần tử là một địa chỉ mà `T12` có thể nhắm tới, **sẽ nhận được kết nối thành công**, và **canary không thấy gì**.

**Test rẻ nhất, tái dùng dữ liệu đã có, không chạm container `tnm_*` nào:**
1. **~10 dòng trong `coverage.js`**: tính `loopback_listeners_not_covered_by_canary` từ `observations.all_listeners_at_*` mà clause (iii) **đã đọc sẵn** (`coverage.js:357-393`), in **cạnh** `escaped_side_effects` theo khuôn clause (v). Đúng tinh thần `coverage.js:389-392` đã tự viết.
2. **Positive control cho loopback sink**: từ trong replay container dial `127.0.0.1:16379` — cổng canary **thật sự đang giữ** — và assert nó vào canary log. Thiếu bước này thì *"canary không thấy gì trên loopback"* và *"canary không có mặt trên loopback"* **vẫn không phân biệt được** — đúng lỗi mà clause (i) sinh ra để giết.

Cả hai **không** làm nhẹ `T12`. `T12` vẫn FAIL — nhưng bây giờ có **mẫu số**: *"canary phủ 3/31 loopback listener tại thời điểm đo"* thay vì một chữ *"điểm mù"*.

### ⚠️ Ba mục worker KHÔNG xác minh được (bash bị chặn giữa phiên)

1. Sự tồn tại của flag `--allow-net` trong v22.21.1 — **nhưng hệ quả chức năng đã đo trực tiếp** (dòng 4), bằng chứng mạnh hơn tra flag.
2. `NODE_OPTIONS="--permission"` có được chấp nhận không — kết luận về entrypoint `npm run` là **suy luận**, worker khai rõ.
3. `docker network inspect` / `docker info` — khẳng định *"không `--internal`, có NAT egress"* dựa trên **nguồn tĩnh** `up.sh:44-49`. ✅ **PM đã tự kiểm nguồn tĩnh này và xác nhận.** Quan sát runtime vẫn nên để `devops-engineer` chốt.

## PM đọc được gì

1. **`(c)` là một phát hiện thật, không phải thoả hiệp.** PM đã hỏi *"bật hay không bật"* — worker trả lời rằng câu hỏi đó **đặt sai**: cả hai lựa chọn đều mất thứ gì đó, và chạy hai lần **giữ được cả hai** với chi phí một lần gọi. `DEBT-2` không cần một quyết định nhị phân nữa; nó cần một dòng trong exit criteria `B5`.
2. **Mục 5 (`capsule` vs `capsules`) là lỗi rẻ nhất và nguy hiểm nhất trong toàn bộ finding.** Một chữ cái, phát hiện **trước** khi `B4` viết dòng code đầu tiên, so với `THREAT-006` đường 1 — *"Git history là bất biến theo thiết kế"*. Đây là loại lỗi mà chỉ có lens read-only chạy **trước** implementation mới bắt được.
3. **Mục 9 đã xảy ra rồi, và PM là người đã commit nó.** Wave 1 sinh ra 11 file evidence và PM đã verify chúng, nhưng verify về **tính đúng của phép đo**, không về **nội dung bị lộ**. Không sửa được (không rewrite history, và evidence là bằng chứng có ngày tháng) ⇒ chỉ còn đường khai. Bài học vận hành: **file bằng chứng cũng là file xuất bản.**
4. **`L2` tầng mạng hiện bằng không, và điều đó ngược dấu với giả định của `B5`.** `B5` exit criteria đòi *"fail-closed hai lớp"*. Không có `--internal`, lớp thứ hai chưa tồn tại ở bất kỳ tầng nào.
5. **`Q5` hội tụ với chính `run-plan` Wave 1**: cơ chế `canary_coverage` sinh ra vì ba lens cùng chỉ vào *"`escaped_side_effects = 0` có thể là số GIẢ"*. Lens này nói: **nó vẫn có thể giả**, và giờ đã có **con số 28** đo được thay vì một cảnh báo định tính.

## Mâu thuẫn với lens khác

**Không mâu thuẫn — hội tụ ba chiều.** `architect` (denominator ai được vào), `quality-assurance` (ai được quyền nói kết quả đúng), `security-auditor` (số đo có thật không). Ba lens, ba đường, cùng một kết luận: **các con số của Phase 0 có thể đúng hình thức mà sai bản chất, và không đọc ra được từ chính báo cáo.**

Một khác biệt về **thứ tự ưu tiên** cần PM phân xử: `security-auditor` xếp rủi ro loopback **trên** rủi ro marker giả mạo. `quality-assurance` xếp `M-5` là số một. Hai cái đo hai thứ khác nhau (tính đúng của **số** vs tính hợp lệ của **kết luận**) nên không loại trừ nhau — PM ghi nhận cả hai là 🔴, không ép xếp hạng chung.

*(chờ `devops-engineer`)*
