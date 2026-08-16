---
id: DEPLOY-SPIKE-P0B
type: runbook
status: draft
owner: devops-engineer
created: 2026-08-15
phase: P0-B
task: B2
---

# 🛠️ Deploy-Spike — Môi trường spike `P0-B`, destroy, và thiết bị đo

> ⚠️ **Toàn bộ code mô tả ở đây là `throwaway`** — [Spec-Spike-Protocol](../030-Specs/Spec-Spike-Protocol.md) §0.3. Nó tồn tại để trả lời `RQ.md §39`, **không** để tiến hoá thành V0.1. Muốn tái dùng bất kỳ phần nào ⇒ đi qua `P1` theo §5.3, và đọc dòng ledger `§5.2` mang tên module đó trước.
>
> 🔴 **Một câu phải đọc trước mọi thứ khác**: con số `escaped_side_effects = 0` mà `GATE-06` sẽ đọc như bằng chứng an toàn **có thể là một số giả**. Toàn bộ cơ chế `canary_coverage` ở [§6](#6-canary_coverage--cơ-chế-fail-closed) tồn tại để phát hiện đúng điều đó. **Không đọc `escaped_side_effects` khi chưa đọc `canary_coverage` nằm ngay cạnh nó.**

---

## 0. Bản đồ file

| File | Vai trò |
|---|---|
| `src/spike/infra/docker-compose.spike.yml` | Topology 4 service `CT-3` trên network **external, sống lâu** |
| `src/spike/infra/docker-compose.canary.yml` | Canary sink — chiếm lại địa chỉ cũ sau destroy |
| `src/spike/infra/Dockerfile.app` | Image cho `spike-app` + `spike-httpstub` (code từ `src/spike/app/`, thuộc `B1`) |
| `src/spike/infra/canary/Dockerfile.canary` | Image cho canary network sink **và** cho control-probe |
| `src/spike/infra/canary/canary.js` | TCP accept log + HTTP log, CommonJS, zero dependency |
| `src/spike/infra/canary/initdb/01-canary-audit.sql` | DB sink — bảng audit **INSERT-only** |
| `src/spike/infra/canary/probe-control.sh` | Control probe của `canary_coverage` vế (i) |
| `src/spike/infra/lib/common.sh` | Hằng số dùng chung cho **script vận hành** (verifier **không** dùng) |
| `src/spike/infra/up.sh` | Dựng môi trường |
| `src/spike/infra/destroy.sh` | Destroy **theo nhãn**, idempotent. **Không sinh bằng chứng** |
| `src/spike/infra/verify/verify.js` | **Verifier độc lập** — sinh bằng chứng JSON |
| `src/spike/infra/verify/verify.sh` | Launcher mỏng (chỉ đổi biến shell thành CLI argument) |
| `src/spike/infra/coverage/coverage.js` | Đánh giá `canary_coverage`, in cạnh `escaped_side_effects` |
| `src/spike/infra/cycle.sh` | Chạy trọn một chu trình bằng chứng |
| `docs/035-QA/Evidence/*.json` | **Bằng chứng có ngày tháng, vào git** |
| `src/spike/infra/canary-log/`, `src/spike/infra/artifacts/` | Dữ liệu runtime thô — **gitignored có chủ đích** |

> Script chưa chắc có bit `+x` sau khi checkout. Gọi bằng `bash ./up.sh` là cách an toàn nhất; hoặc `chmod +x src/spike/infra/*.sh src/spike/infra/verify/*.sh src/spike/infra/canary/*.sh` một lần.

---

## 1. Cách dựng

```bash
cd src/spike/infra

# đầy đủ 4 service — cần src/spike/app/ của worker B1 đã tồn tại
bash ./up.sh

# chế độ suy giảm: chỉ spike-postgres + spike-redis
# dùng khi src/spike/app/ chưa có (Wave 1 chạy song song)
bash ./up.sh --infra-only
```

`up.sh` chạy phần chuẩn bị rồi **6 bước có thứ tự bắt buộc**:

**Chuẩn bị:**
1. **Tạo network external `repro-spike-net` nếu chưa có.** Network này **sống lâu**, mang nhãn `repro.spike.persistent=true`, và `destroy.sh` **không bao giờ** chạm vào nó.
2. Sinh `run_id` + **nonce** riêng cho run, ghi ra `artifacts/run.env` (gitignored), rồi **đọc ngược lại** file đó — để credential dùng ở bước seed là **đúng** credential compose inject, một nguồn sự thật, không trôi.
3. **Fail-closed nếu cổng host đã bị chiếm** — không stop ai, không lặng lẽ đổi cổng.

**Sáu bước — thứ tự là load-bearing, không đảo được:**

| # | Bước | Vì sao phải đứng ở đúng chỗ này |
|:--:|---|---|
| 1 | `compose build spike-app` | Một image `repro-spike-app:<run_id>` dùng chung cho **cả** `spike-app` lẫn `spike-httpstub`; entrypoint chọn lúc **runtime** qua `SPIKE_ENTRYPOINT`. Build hai lần cùng layer trên 2 vCPU là lãng phí thuần |
| 2 | `compose **create**` (không phải `up`) | Tạo container **và named volume có nhãn** mà **chưa start gì**. Nhờ vậy bước 3 ghi được vào volume flags **trước khi** tồn tại container nào đọc nó. Tự `docker volume create` thay vào đây sẽ **đua** với sổ sách volume của chính compose |
| 3 | **`INT-1`** — nạp `flags.json` vào volume, **rồi đọc ngược lại để verify** | `flags.js` của `B1` đọc `SPIKE_FLAG_FILE` **ở mỗi request**; file không tồn tại ⇒ **mọi request 500 với `FlagError`**. Nguồn là default `B1` ship sẵn **trong image** tại `/srv/spike/flags/spike-flags.default.json` — **copy** chứ không bind-mount cây làm việc của `B1`, để file flags nằm trên volume **có nhãn**, tức **trong scope destroy**, và chết cùng môi trường như mọi thứ khác. Nạp mà không verify chỉ là phỏng đoán |
| 4 | `compose up -d --wait spike-postgres spike-redis` | Seed **không** kết nối được vào một Postgres còn đang `initdb`. Phải `--wait` cho healthy trước |
| 5 | **`INT-2`** — one-shot `start:seed` trên spike network | Chưa có bảng ⇒ mọi query `pg` fail. Chạy như **container riêng trên spike network** để nó resolve đúng tên DNS `spike-postgres` **y như app sẽ làm**. `seed.js` của `B1` **idempotent** (`CREATE TABLE IF NOT EXISTS`, upsert, `TRUNCATE ... RESTART IDENTITY`) ⇒ chạy lại an toàn, trạng thái đầu **tất định** |
| 6 | `compose up -d --wait` | Start nốt `spike-httpstub` + `spike-app` |

> ⚠️ `INT-1` và `INT-2` nằm **đúng trên ranh giới infra/app** — không phải việc của `B1` (app không tự provision hạ tầng của chính nó) và trước đây không thuộc về ai. Chúng thuộc file này.
>
> ⚠️ **`--infra-only` KHÔNG provision flags và KHÔNG seed.** Nó chỉ dựng `spike-postgres` + `spike-redis` để test riêng phần destroy/verifier/canary. Đừng dùng nó rồi kỳ vọng `POST /checkout` trả 2xx.

**Hai ràng buộc tích hợp phải giữ khi sửa compose:**
- `loadStubConfig()` của `B1` lấy **cổng lắng nghe của stub từ `SPIKE_HTTP_STUB_URL`**, không phải từ `SPIKE_APP_PORT`. Hai chỗ đều ghi `8081`; lệch nhau ⇒ stub bind một cổng không ai route tới.
- `requireEnv()` của `B1` chỉ kiểm key bắt buộc **có mặt**, nên biến thừa (`SPIKE_ENTRYPOINT`) là **vô hại**. `CT-4` vẫn nguyên 11 tên.

### 🔴 Vì sao network phải `external` — ràng buộc **cứng**

Vòng đời mặc định của compose xoá network của project khi `down`. Nếu để compose sở hữu network, thì đúng những tên DNS mà canary phải **chiếm lại** sau destroy — `spike-postgres`, `spike-redis`, `spike-httpstub`, `spike-app` — sẽ biến mất **cùng với network**. Canary attach bằng `network-alias` trùng tên service đã destroy; không còn network thì không còn alias để chiếm, và **cơ chế bằng chứng của cả phase sụp**.

⇒ Sai thiết kế chỗ này thì **làm lại từ đầu**. Đừng thay `external: true` bằng bất cứ thứ gì, và đừng dùng `docker compose down` trên stack môi trường — dùng `destroy.sh`.

---

## 2. Bảng cổng — và đã né cổng nào

**Daemon này đang có người ở.** Bốn container của **một dự án khác** chạy 7+ ngày trên cùng daemon. ⛔ **Tuyệt đối không stop / restart / xoá** bất kỳ container, volume hay network nào có tiền tố `tnm_`.

### 2.1 Cổng đang bị chiếm — đo được, không phải giả định

| Container (dự án khác) | Giữ cổng host | Ghi chú |
|---|---|---|
| `tnm_postgres` | **5433** → 5432 | pgvector |
| `tnm_redis` | **6379** | |
| `tnm_minio` | **9000–9001** | |
| `tnm_video_preprocessor` | **8100** | |

Ngoài ra, `lsof` lúc đo còn thấy host listener ở `3000`, `4322`, `5000`, `7000`, `30000`, `30001`, `44950`, `44960`, `49153`, `52829`, `62479`–`62482`, `62574`, `63342`, `64068`, `64182`, `64642` (IDE, agent, Control Center).

### 2.2 Cổng spike chọn — né toàn bộ danh sách trên

| Service `CT-3` | Cổng **trong container** | Cổng **host** | Bind |
|---|:--:|:--:|---|
| `spike-app` | `8080` | **18080** | `127.0.0.1` |
| `spike-httpstub` | `8081` | **18081** | `127.0.0.1` |
| `spike-postgres` | `5432` | **15432** | `127.0.0.1` |
| `spike-redis` | `6379` | **16379** | `127.0.0.1` |

**Canary republish ĐÚNG bốn cổng host đó** — `18080`, `18081`, `15432`, `16379`, cùng bind `127.0.0.1`. Cùng số cổng là **có chủ đích**: một canary đứng ở cổng khác không chứng minh được gì về địa chỉ mà workload thật sự đã dùng.

Bên trong network, canary chiếm lại **cổng container** nguyên vẹn (`8080`, `8081`, `6379`, `5432`) qua `network-alias`.

Override được bằng biến môi trường `HOST_APP_PORT`, `HOST_STUB_PORT`, `HOST_PG_PORT`, `HOST_REDIS_PORT`.

### 2.3 Về việc `docker stop` tạm 4 container `tnm_*`

`G-3` của gate **đã duyệt** thao tác này — nhưng **cắn ở `B5`/`C1`, KHÔNG phải Wave 1**. Bộ script ở đây **thiết kế cho tình huống đó** (né cổng, fail-closed khi cổng bị chiếm) và **không tự thực hiện nó**. Không script nào trong `src/spike/infra/` gọi `docker stop tnm_*`. Khi tới `B5`/`C1` phải xác nhận lại với `@TrisJr` trước khi chạm.

### 2.4 Runtime đo được

| Thứ | Giá trị **đo được** trên máy này | Ghi chú |
|---|---|---|
| Docker Server | **29.5.2** | Brief ghi `29.6.1` — **giá trị đo được là 29.5.2** |
| Docker Compose | `v5.2.0` | |
| Node (host) | `v22.21.1` | |
| Backend | `colima`, **2 vCPU / 1.91 GiB** | `DEBT-1` của gate: giữ nguyên, cắn ở `B7` |
| Docker context | **3** — `colima` (active), `default`, `desktop-linux` | Nguồn của một điểm mù, xem [§5.2](#52-khoảng-hở--nói-thẳng) |
| bash | **3.2.57** — không có `mapfile` | Script viết cho bash 3.2 |

Vì colima chỉ có 2 vCPU / 1.91 GiB, mỗi service đều đặt `mem_limit` và `cpus` khiêm tốn. Tổng RAM cấp cho stack môi trường ≈ 1.0 GiB, cho canary ≈ 0.4 GiB.

---

## 3. Biến môi trường inject cho `spike-app` — hợp đồng `CT-4`

Đúng tập này, **không hơn không kém**. Worker `B1` đọc đúng những tên này.

| Biến | Giá trị inject | Ghi chú |
|---|---|---|
| `SPIKE_RUN_ID` | `r<UTC timestamp>` | có trong nhãn của mọi resource |
| `SPIKE_APP_PORT` | `8080` | cổng **trong container** |
| `SPIKE_PG_HOST` | `spike-postgres` | tên DNS trên network |
| `SPIKE_PG_PORT` | `5432` | **cổng container**, không phải `15432` |
| `SPIKE_PG_USER` | `spike` | |
| `SPIKE_PG_PASSWORD` | `spk_<nonce>` | **rotate mỗi run** — xem cảnh báo dưới |
| `SPIKE_PG_DATABASE` | `spikedb` | |
| `SPIKE_REDIS_HOST` | `spike-redis` | |
| `SPIKE_REDIS_PORT` | `6379` | **cổng container**, không phải `16379` |
| `SPIKE_HTTP_STUB_URL` | `http://spike-httpstub:8081` | stub **tự chạy**, không API key thật (`B9` vế ii) |
| `SPIKE_FLAG_FILE` | `/var/spike/flags/flags.json` | trên named volume `repro-spike-flags-<run_id>`, có nhãn |

> ⚠️ **`SPIKE_PG_PASSWORD` rotate mỗi run — nhưng đừng đọc nhầm nó.** Nó rotate **secret của môi trường** (bảo vệ `A-05`). Nó **KHÔNG** thoả vế *"revoke/rotate credential destroy"* của exit criteria `B2(d)`: yêu cầu đó nói về **thẩm quyền của đường teardown**, và docker socket **không có token để thu hồi**. Xem [§5.3](#53-ba-thứ-bị-bỏ-có-ý-thức).

**Healthcheck của `spike-app`/`spike-httpstub` là TCP-level, có chủ đích.** `CT-4` không định nghĩa endpoint `/health`; bịa ra một cái sẽ tạo một hợp đồng ngầm lên `B1` mà không ai ký.

---

## 4. Cách destroy

```bash
cd src/spike/infra
bash ./destroy.sh                 # dùng run_id trong artifacts/run.env
bash ./destroy.sh --run-id rXXXX  # hoặc chỉ định
```

### 4.1 ⛔ `docker system prune` bị cấm — lý do cụ thể

Không phải nguyên tắc chung. Daemon này **đang chứa tài sản của một dự án khác** (`tnm_postgres`, `tnm_redis`, `tnm_minio`, `tnm_video_preprocessor`, 10 volume, 2 network). Một lệnh prune quét luôn `tnm_postgres` là **thiệt hại không thu hồi được** lên dataset của dự án đó.

Cấm ở mọi dạng: `docker system prune`, `docker volume prune`, `docker network prune`, `docker image prune`, `docker rm $(docker ps -aq)`.

### 4.2 *"Môi trường gốc"* định nghĩa bằng **NHÃN**, không phải *"mọi thứ trên daemon"*

Scope lỏng ⇒ một trong hai kết cục, **cả hai đều hỏng**:
- verifier báo `tnm_*` là tàn dư ⇒ **false positive mỗi lần chạy**, bằng chứng mất giá trị; hoặc
- destroy quét luôn tài sản dự án khác ⇒ **thiệt hại thật**.

**Ba namespace nhãn rời nhau tuyệt đối** — đây là định nghĩa vận hành của *"môi trường gốc"*:

| Namespace | Nhãn | Ai xoá nó | Vì sao tách |
|---|---|---|---|
| **Môi trường** | `repro.spike.env=<run_id>` + `repro.spike.nonce=<nonce>` | `destroy.sh` — **đây là filter DUY NHẤT của nó** | Là thứ exit criteria gọi là *"môi trường gốc"* |
| **Network sống lâu** | `repro.spike.persistent=true` | **Không ai.** Tồn tại xuyên run | Gộp vào namespace trên ⇒ destroy xoá network ⇒ canary mất chỗ đứng ⇒ sụp cơ chế bằng chứng |
| **Canary** | `repro.spike.canary=<run_id>` | `canary-down.sh` | Gộp vào namespace trên ⇒ **lần destroy thứ hai** (chính là phép chứng minh idempotent) sẽ **giết mất người quan sát** giữa hai file bằng chứng |

**Image cũng nằm trong scope.** `build.labels` gắn nhãn run lên chính image `repro-spike-app:<run_id>`, nên `destroy.sh` dọn nó ở bước 4/4. Không gắn nhãn thì mỗi run để lại một image nằm **ngoài** mọi scope và tích tụ vô hạn. Image nền (`node`, `postgres`, `redis`) **không** mang nhãn và **không** bị xoá — chúng dùng chung cache với dự án khác trên cùng daemon.

**Image canary cũng vậy, nhưng do `canary-down.sh` dọn.** `repro-spike-canary:<run_id>` trước đây **không có** `build.labels` ⇒ nó nằm ngoài **mọi** scope: `destroy.sh` không được phép chạm (khác namespace, đúng thiết kế) và `canary-down.sh` cũng không tìm ra. `compose down` **không bao giờ** xoá image. Nay image mang `repro.spike.canary=<run_id>` và `canary-down.sh` xoá **theo nhãn** — cùng kỷ luật `destroy.sh` dùng, **không** wildcard, **không** `prune`.

Hai container one-shot của bước 3 và 5 (`INT-1` nạp flags, `INT-2` seed) chạy với `--rm` nên tự biến mất; container seed vẫn mang nhãn run để nếu nó chết giữa chừng thì destroy vẫn quét được.

`destroy.sh` còn có **guard tường minh**: bất kỳ tên resource nào lọt vào scope mà mang tiền tố `tnm_` ⇒ **dừng ngay, không mutate gì**. Và nếu network sống lâu bị phát hiện mang nhãn `env` ⇒ **từ chối xoá** và báo là lỗi namespace, thay vì lặng lẽ xoá.

### 4.3 Bẫy volume ẩn danh — đã bịt cả hai đầu

Image `postgres` và `redis` khai `VOLUME`. Volume **ẩn danh** sinh từ đó **không** thừa kế nhãn compose ⇒ **cả destroy theo nhãn lẫn verifier theo nhãn đều mù** với chúng. Đó là một tàn dư thật mà chính bằng chứng của mình không thấy.

Bịt hai đầu:
1. Mọi đường `VOLUME` được gắn vào **named volume có nhãn** trong compose (`repro-spike-pgdata-*`, `repro-spike-redisdata-*`, `repro-spike-flags-*`).
2. `destroy.sh` vẫn dùng `docker rm -f -v` — `-v` gỡ volume ẩn danh bám vào container trong scope, phòng khi có image khác lọt vào sau này.

Verifier báo thêm số volume *"trông như ẩn danh"* trên daemon dưới dạng **observation kèm caveat**, không dưới dạng assertion — vì dự án khác cũng sở hữu volume dạng đó.

### 4.4 Idempotent nghĩa là gì ở đây

**Không** phải *"chạy hai lần không báo lỗi"*. Nghĩa là **vòng hội tụ về vắng mặt**: chạy `N ≥ 1` lần, post-state **giống hệt nhau**.

**Cách chứng minh** (chính là bước 3–7 của `cycle.sh`):

```bash
bash ./destroy.sh
E1=$(bash ./verify/verify.sh --phase post-destroy-1)
bash ./destroy.sh
E2=$(bash ./verify/verify.sh --phase post-destroy-2)
# so khối `assertions` của hai file — phải GIỐNG HỆT
node -e 'var f=require("node:fs");var A=p=>JSON.stringify(JSON.parse(f.readFileSync(p,"utf8")).assertions);
process.exit(A(process.argv[1])===A(process.argv[2])?0:31)' "$E1" "$E2"
```

> So khối `assertions`, **không** so cả file. Khối `volatile` chứa timestamp và **phải** khác nhau; so cả file sẽ luôn báo khác và biến phép chứng minh thành nghi thức rỗng.

---

## 5. Bằng chứng — cách đọc, và **khoảng hở**

### 5.1 Verifier chạy thế nào

```bash
bash ./verify/verify.sh --phase pre-destroy --scope-proof establish
bash ./verify/verify.sh --phase post-destroy-1
bash ./verify/verify.sh --phase canary-active
```

#### 5.1.1 🔴 `--scope-proof` — positive control cho **chính bộ chọn nhãn**

`destroy_clean` được tính bằng *"cả 4 mảng tàn dư đều rỗng"*. **Rỗng vì không còn gì** và **rỗng vì hỏi sai câu** là **cùng một giá trị**. Trước bản này, ba lời gọi sau **đều** trả `destroy_clean=true, exit 0`:

| Probe | Tham số | Trước | Sau |
|---|---|:--:|:--:|
| `A` | label-key đúng + `run_id` thật | `exit 0` | `exit 0` |
| `B` | `--label-key repro.spike.THIS_KEY_DOES_NOT_EXIST` | `exit 0` ❌ **sai âm tính** | `exit 25` ✅ |
| `C` | `--run-id rNEVER_EXISTED_9999` | `exit 0` ❌ **sai âm tính** | `exit 25` ✅ |

Cơ chế: một lần đọc *rỗng* chỉ được tin khi **đúng chuỗi `<label-key>=<run_id>` đó** đã từng được ghi nhận là **chọn trúng resource thật**. Bằng chứng đó là một file `destroy-evidence` **cùng `run_id`, cùng `label_scope`**, có `assertions.destroy_clean === false`.

| Mode | Ý nghĩa |
|---|---|
| `establish` | Chính phép đo này là hiệu chuẩn — **fail nếu scope không chọn được gì**. Dùng cho `--phase pre-destroy`, lúc môi trường còn sống |
| `require` | **Mặc định**, fail-closed. Phải đã có file hiệu chuẩn. Một lời gọi `node verify.js` gõ tay nhận đúng mode này — nên lỗ hổng được bịt **trong `verify.js`**, không phải trong orchestrator |
| `none` | Khai từ chối hiệu chuẩn. Ghi vào evidence và `destroy_clean_readable` đọc `false` |

Ba trường mới nằm trong `assertions` (chỉ scalar ổn định, để khối `assertions` vẫn **byte-identical** giữa hai lần post-destroy): `scope_proof_mode` · `scope_calibrated` · `destroy_clean_readable`. Danh sách file hiệu chuẩn khớp được nằm ở `observations.scope_calibration` vì nó **có thể thay đổi**.

> ⚠️ `cycle.sh` **không** còn bọc bước `pre-destroy` bằng `|| true`. Nuốt đúng bước duy nhất hiệu chuẩn được scope nghĩa là toàn bộ pipeline có thể in ra một bộ evidence `clean + IDEMPOTENT` hoàn chỉnh, exit `0`, trong khi môi trường **vẫn sống**.

Mỗi lần chạy ghi **một file JSON** vào `docs/035-QA/Evidence/destroy-evidence-<run_id>-<phase>-<ts>.json`.

⚠️ **Đường này được chọn có chủ đích.** `.gitignore` của repo đang nuốt `logs/`, `*.log`, `data/`, `tmp/`, `out/`, `dev/`, và cả `src/spike/**/canary-log/`. Bằng chứng rơi vào các path đó thì **không bao giờ vào git**, trong khi chuẩn niêm phong của phase (`B10`) là *"commit vào git"*. `.gitignore` hiện đã có dòng `!docs/035-QA/Evidence/` tường minh. **Không thêm pattern rộng** (`*.json`, `evidence/`) nuốt mất nó.

Cấu trúc file, ba khối, tách theo mục đích **so sánh được**:

| Khối | Nội dung | Dùng để |
|---|---|---|
| `assertions` | tàn dư theo nhãn, network sống lâu còn không, tài sản `tnm_*` còn nguyên không, kết quả probe cổng | **So hai run ⇒ phép chứng minh idempotent** |
| `observations` | ai đang giữ cổng spike, **toàn bộ loopback listener đầu/cuối**, volume ẩn danh | Đọc bối cảnh, **không** so |
| `volatile` | timestamp, thời gian probe | **Không bao giờ** so |
| `independence` | khoảng hở, xem ngay dưới | Đọc cùng mọi kết luận |

Exit code fail-closed: `21` còn tàn dư · `22` mất network sống lâu · `23` tài sản `tnm_*` bị chạm · `24` lỗi gọi Engine API · `25` **scope chưa được hiệu chuẩn** ([§5.1.1](#511--scope-proof--positive-control-cho-chính-bộ-chọn-nhãn)).

`25` được kiểm **trước** `21` có chủ đích: nếu bộ chọn chưa từng được chứng minh là chọn trúng thứ gì, thì `destroy_clean` không phải một **kết quả** — nó là sản phẩm phụ của **câu hỏi**.

**Bằng chứng bảo toàn tài sản** nằm trong `assertions.foreign_assets`: mỗi lần chạy, verifier khẳng định 4 container `tnm_*` **vẫn đang chạy**. Đây là mặt kia của phép kiểm tàn dư — một destroy scope lỏng sẽ **fail ở đây**, không phải ở chỗ khác.

### 5.2 🔴 Khoảng hở — nói thẳng

Exit criteria `B2(b)` đòi *"bằng chứng phải do một công cụ **ĐỘC LẬP** sinh ra"*. **Cái được cấp là một nửa của câu đó**, và đây là phần khai thẳng.

| Tầng | Trạng thái | Chi tiết |
|---|:--:|---|
| **Độc lập tầng công cụ** | ✅ **ĐẠT** | Package riêng. **Không import** `destroy.sh` hay `lib/common.sh`. Không gọi `docker` CLI cho assertion — nói thẳng **Docker Engine HTTP API** qua unix socket, cộng probe TCP từ host và `lsof`, hai thứ **không có đối ứng nào** trong destroy. Nhận scope nhãn qua **CLI argument**: tham số là **dữ liệu**, không phải code path dùng chung. Một lời gọi thứ hai vào cùng code path **không phải** verifier độc lập — đó chính là kiểu tự lừa mà file này được viết ra để tránh |
| **Độc lập tầng thẩm quyền** | ❌ **KHÔNG ĐẠT** | Nguồn sự thật **vẫn là chính `dockerd` mà destroy điều khiển**. Máy có **3 docker context** (`colima`, `default`, `desktop-linux`); resource sống sót **ngoài context được enumerate** thì verifier **mù hoàn toàn**. Thứ đóng được khoảng hở này là **inventory phía provider** — không tồn tại trong một mô phỏng cục bộ |

⚠️ **Một correlation nhỏ phải khai kèm**: `verify.js` không import gì, nhưng launcher `verify.sh` **có** `source lib/common.sh` — đúng file mà `destroy.sh` cũng source. Nếu `common.sh` mang sai label key thì destroy và verify sai **tương quan với nhau**. Đường **hoàn toàn không tương quan** luôn có sẵn: bỏ launcher, gọi thẳng `node verify/verify.js --run-id ... --socket ... --label-key ... --ports ... --foreign ... --out-dir ...` với tham số **gõ tay**. Reviewer của `B9` nên dùng đúng đường đó.

**⇒ Mệnh đề thật sự được chứng minh, phát biểu chính xác:**

> *"Trong scope nhãn đã khai, trên **một** docker context, tại thời điểm đo, không còn resource nào khớp nhãn."*

**Mệnh đề KHÔNG được chứng minh:**

> *"Không tồn tại đường nào để môi trường gốc còn sống."*

Exit criteria gốc đang đòi mệnh đề thứ hai. Ở đây cấp mệnh đề thứ nhất, và **khoảng cách được ghi vào chính mỗi file bằng chứng** ở khối `independence` (`authority_layer: false` + danh sách context **không** được probe). `C4` phải phát biểu theo mệnh đề thứ nhất, không được nói quá tay.

### 5.3 Ba thứ bị bỏ có ý thức

Cả ba nằm trong dòng shortcut ledger `Spec-Spike-Protocol §5.2`.

1. **Cách ly tầng IAM KHÔNG TỒN TẠI** — không phải *"làm yếu hơn"*, mà là *"không tồn tại ở dạng cục bộ"*. **Docker socket là ambient authority tương đương root trên toàn daemon**: không principal, không scope, không deny boundary, không policy engine. Ai destroy được spike thì cũng destroy được `tnm_postgres`. Vế *"credential destroy không có quyền chạm ngoài scope"* được thay bằng **kỷ luật nhãn trong script** — tức một ràng buộc do **chính script tự áp lên mình**, cưỡng chế bởi guard tiền tố `tnm_` ở [§4.2](#42-môi-trường-gốc-định-nghĩa-bằng-nhãn-không-phải-mọi-thứ-trên-daemon). Một control tự-áp không phải một boundary.
2. **Bằng chứng chỉ độc lập ở tầng công cụ** — [§5.2](#52--khoảng-hở--nói-thẳng).
3. **Không revoke/rotate credential destroy** — docker socket **không có token để thu hồi, không có phiên để hết hạn**. Điều khoản này ở cục bộ là **no-op**, **không phải** *đã thoả*. (Rotate mật khẩu Postgres mỗi run là chuyện khác và **không** đếm vào đây.)

**Những vế được hiện thực ĐẦY ĐỦ và KHÔNG nằm trong dòng ledger**: destroy theo **nhãn** · **idempotent** (có phép chứng minh hai lần chạy) · **canary sink** (TCP + HTTP + DB).

### 5.4 Ranh giới cần giữ trong Spike Report

Mô phỏng cục bộ hạ giá trị của **bằng chứng destroy**. Nó **KHÔNG** hạ giá trị của **bằng chứng an toàn** — vì `escaped_side_effects` lấy nguồn từ **canary log**, và canary được hiện thực đầy đủ. `C4` **không được gộp** hai thứ này rồi hạ thấp cả hai; làm vậy là vứt đi một kết luận vốn còn nguyên giá trị.

---

## 6. `canary_coverage` — cơ chế fail-closed

### 6.1 Vì sao nó tồn tại

Ba lens phân tích đi ba đường và **cùng chạm một cơ chế hỏng**:

| Lens | Đường vào |
|---|---|
| `security-auditor` | egress tới địa chỉ **ngoài** tập canary phủ (`BS-2`) |
| `architect` | `L2` tầng runtime **mù** với `child_process`; Node `--permission` **không có** `--allow-net` ⇒ không chạm được `T12` |
| `devops-engineer` | canary **không bind được** `6379`/`5433` vì `tnm_redis`/`tnm_postgres` đang giữ ⇒ WRITE rò rỉ **đáp xuống DB thật của dự án khác** |

> 🔴 **`escaped_side_effects = 0` có thể là một số GIẢ, và không có gì trong thiết kế gốc phát hiện được điều đó.**

Threat model, `THREAT-018` residual risk (b), **nguyên văn**: *"đường loopback bị lạm dụng nếu máy developer có dịch vụ thật lắng nghe ở localhost"*. Trên máy này đó là **điều kiện hiện hữu**, không phải giả định. Hai hệ quả, **cả hai đều im lặng**: metric đọc ra `0` sai, **và** thiệt hại dữ liệu ra ngoài blast radius.

Gộp ba phát hiện thành **MỘT** điều kiện tiên quyết là phân xử của PM. Không gộp thì sinh ra ba dòng exit criteria rời rạc, và một implementer sẽ thoả **từng dòng** mà vẫn để lọt **đúng chế độ hỏng cả ba cùng chỉ tới**.

### 6.2 Bốn vế

Một run **chỉ được đọc** `escaped_side_effects` khi chứng minh được canary **thực sự chiếm đủ** địa chỉ nó cần:

| Vế | Nội dung | Ai cấp | Đo ở đâu |
|:--:|---|---|---|
| **(i)** | Một `curl <host-cũ>` **đối chứng**, chạy **từ trong container replay**, **NGOÀI** mọi test, **phải** xuất hiện trong canary log — ở **CẢ HAI** sink (`network_sink_satisfied` **và** `db_sink_satisfied`, xem [§6.6](#66-db-sink-tự-chứng-minh-alias-của-nó)) | `B2` — `canary/probe-control.sh`, gọi qua `canary-up.sh --control-probe` | `clauses[0]` |
| **(ii)** | Fixture của test egress bắn vào một đích **thuộc tập canary phủ**, và **ghi điều đó vào chính fixture** | **Fixture thuộc task khác** (`B5`/`B8`). `B2` cấp **cơ chế** + **cách đo**, đọc file attestation | `clauses[1]` — trường **luôn có mặt**, kể cả khi thiếu attestation |
| **(iii)** | Verifier độc lập enumerate **mọi loopback listener** ở **đầu và cuối** mỗi scenario | `B2` — `verify/verify.js` | `clauses[2]` |
| **(iv)** | Canary **thật sự bind** đủ tập địa chỉ — không lỗi bind, không thiếu alias, DB sink harvest được. `claimed_aliases` là **hợp** của hai sink: `canary-net` tự khai trong ndjson, `canary-db` **được chứng minh bằng chính statement log của nó** ([§6.6](#66-db-sink-tự-chứng-minh-alias-của-nó)) | `B2` | `clauses[3]` |
| **(v)** | **Thiếu bất kỳ vế nào ⇒ `canary_coverage: incomplete` ⇒ fail-closed** theo `Spec §4.6`: *"bằng chứng thiếu ⇒ tính là KHÔNG đạt"* | | `verdict.value = NOT_EVALUABLE` |

**Hợp đồng đầu ra**: `coverage.js` in `canary_coverage` **ngay cạnh** `escaped_side_effects`, **trong cùng một file**. Một số `0` không kèm coverage là **số không diễn giải được** — cùng logic mà `MTP §3.2` áp cho `error_rate`.

Shape của file attestation mà vế (ii) chờ (được in sẵn trong output dưới `expected_attestation_shape`, nên task fixture không phải đoán):

```json
{ "fixture_id": "T8", "egress_targets": ["spike-httpstub"], "declared_inside_canary_set": true }
```

### 6.3 Canary sink — nó là gì

| Thành phần | Hiện thực | Bắt được gì |
|---|---|---|
| **TCP accept log** | `canary.js`, `net.createServer` | Mọi kết nối chạm tới — **kể cả** đóng ngay, **kể cả** không gửi byte nào |
| **HTTP log** | `canary.js`, `http.createServer` | method · path · query · header · body |
| **DB sink** | `postgres:16-alpine`, `log_statement=all` + `log_connections=on` + bảng `canary_audit` **INSERT-only** (`REVOKE UPDATE, DELETE, TRUNCATE` + trigger chặn) | Mọi câu lệnh nhận được, kể cả câu lỗi, kể cả DDL |

Hai chi tiết **không được đổi**:

- **Canary nghe cả trên loopback.** `MTP §5.2`: không nghe loopback thì `T12` **mù và báo pass sai**, vì allowlist của `L2` **bao gồm loopback theo thiết kế**.
- **DB sink dùng ĐÚNG credential của môi trường đã destroy.** Một WRITE rò rỉ mà **fail auth** thì không bao giờ tới được `log_statement` ⇒ canary sai credential sẽ **đếm thiếu một cách im lặng**.

Chọn Postgres vanilla + bảng audit thật là **có chủ đích rẻ**: không tự viết PostgreSQL wire-protocol responder.

> 🔺 **`escaped_side_effects` chỉ được lấy từ canary log.** `MTP §5.2` và `B7-11` **cấm** lấy từ log của replay runtime: dùng runtime để chứng minh runtime đã chặn là **xác minh vòng tròn** — đúng những trường hợp nguy hiểm nhất là những trường hợp runtime **mù**.

### 6.5 Sáu quy tắc đếm — nhiễu bị **định danh**, không bị **trừ**

In sẵn trong `escaped_side_effects_breakdown.counting_rules` của mỗi file, để người đọc không phải tin vào tài liệu.

> 🔴 **Nguyên tắc bất di dịch**: không có gì bị loại khỏi `escaped_side_effects` trừ khi nó được **định danh** — bằng một marker suy ra từ `run_id`, hoặc bằng một **bất khả thi cấu trúc**. ⛔ **CẤM**: trừ đi một hằng số · bỏ qua `N` event đầu · loại theo địa chỉ nguồn. Cái cuối đặc biệt nguy hiểm: traffic đi từ host vào canary mang địa chỉ **gateway của bridge**, mà host **đúng là nơi** một leak `T12` (đích resolve về loopback) sẽ đi ra. Loại theo địa chỉ nguồn là **làm mù canary đúng ở chỗ nó được dựng lên để nhìn**.

**Ba namespace marker rời nhau** — không cái nào là substring của cái nào:

| Marker | Nguồn | Vai trò |
|---|---|---|
| `repro-canary-control-<run_id>` | `canary/probe-control.sh` | **Calibration** — vế (i). |
| `repro-canary-selftest-<run_id>` | healthcheck của `canary-net` trong compose | Tự-kiểm, **không** được thoả vế (i) |
| `repro-verify-probe-<run_id>` | probe TCP host-side của `verify.js` | Dụng cụ đo tự khai mình |

⚠️ Vì sao **phải** tách namespace: nếu healthcheck mang marker của control probe thì vế (i) tự thoả bằng việc canary nói chuyện với chính nó — positive control biến thành **đồng nghĩa phản phục**.

| # | Quy tắc | Thiếu nó thì hỏng thế nào |
|:--:|---|---|
| `R1` | **Control probe là calibration, không phải leak.** Mọi event **chung `conn_id`** với một event mang marker đều bị loại | Marker chỉ nằm trên event có payload (`http_request` header, `tcp_close` body), **không** nằm trên accept trần. Không loại theo `conn_id` ⇒ một run **hoàn toàn sạch** vẫn đọc ra `≥ 3` từ chính probe đối chứng của nó |
| `R2` | **Một connection đếm một lần** — accept cộng request của nó là **một** mưu toan, không phải hai | Đếm gấp đôi mọi HTTP request |
| `R3` | **Statement log là nguồn headline của DB sink**; `canary_audit` là **tập con** nên chỉ báo cáo, **không cộng** | Một `INSERT` rò rỉ sinh **một** audit row **và** **một** statement line ⇒ cộng cả hai là đếm đúp. Statement log rộng hơn: nó bắt cả câu **lỗi**, thứ không bao giờ tới được bảng |
| `R4` | Statement line có `client=[local]` bị loại — nó đến qua **unix socket** | 🔴 Postgres in `%h` cho unix socket là **chuỗi `[local]`**, **KHÔNG** phải chuỗi rỗng. Bộ lọc cũ `/client=\S/` định loại traffic local nhưng `[local]` **khớp** `\S` ⇒ nó **chưa bao giờ loại được dòng nào**, và **toàn bộ 19 câu lệnh `initdb` của `01-canary-audit.sql`** bị tính là leak. Cơ sở để loại **không** phải "nó là nhiễu" mà là **bất khả thi cấu trúc**: workload cần đo nằm ở container khác và **chỉ có thể** tới Postgres này qua TCP, nên một câu lệnh qua unix socket **không thể** thuộc về nó |
| `R5` | Healthcheck của canary và probe TCP của `verify.js` bị loại **theo marker riêng của chúng** | Healthcheck chạy mỗi `5s` ⇒ `escaped_side_effects` là **hàm của thời gian canary sống** (lên ~4s ⇒ 1; lên 60s ⇒ ~12). **Không tồn tại giá trị nền cố định để trừ** — đây chính là *"con số không diễn giải được"*. Verifier thì probe **mọi** cổng published ở **mọi** phase theo thiết kế |
| `R6` | Connection có peer là **loopback của chính container canary** bị loại | Đây là lớp dự phòng cho `R5`: nếu canary bị tear-down giữa lúc healthcheck đã accept nhưng request mang marker chưa tới, sẽ còn một accept **không marker**. Chỉ process **bên trong chính container canary** mới có peer `127.0.0.1`; traffic từ host tới bằng địa chỉ **gateway**, nên quy tắc này **không** che được leak `T12` |

**`baseline_from_own_tooling`** in **ngay cạnh** `escaped_side_effects`: tổng số event bị loại, **kèm tên từng nguồn**. Một phần nhiễu là **thiết kế**, không phải defect — verifier **phải** probe mọi cổng, canary **phải** được healthcheck. In ra con số đó bền hơn là tuyên bố đã lọc sạch tuyệt đối: người đọc **thấy cơ chế đang chạy** thay vì phải tin rằng nó đã chạy. Nó **không thay thế** yêu cầu một run sạch đọc `0`.

`escaped_side_effects_breakdown.network_sink_counted_events` dump **từng connection còn bị đếm**. Một con số không soi được từng dòng vẫn là con số không diễn giải được, chỉ đội mũ mới.

### 6.6 DB sink tự chứng minh alias của nó

Vế (iv) so `expected_aliases` với `claimed_aliases`. `claimed_aliases` trước đây **chỉ** lấy từ ndjson, mà **chỉ `canary-net` ghi ndjson** — `canary-db` không ghi. Hệ quả: `missing_aliases: ["spike-postgres"]` ở **mọi run, vĩnh viễn**, dù `canary-db` **thật sự có** alias đó. Cơ chế **tự báo cáo sai về chính nó**, và `complete` trở thành trạng thái **bất khả đạt**.

Sửa: control probe nói chuyện với `spike-postgres` bằng **`psql` thật**, với **đúng credential của môi trường đã destroy**, mang marker trong `application_name`:

```
... app=repro-canary-control-<run> client=10.83.0.x LOG:  statement:
    SELECT 'repro-canary-db-control alias=spike-postgres marker=repro-canary-control-<run>' ...
```

Dòng đó nằm trong log của **chính `canary-db`** và chứng minh **bốn** thứ cùng lúc, không thứ nào phải giả định: alias resolve được · nó resolve tới một Postgres thật · Postgres đó **nhận credential cũ** (nên một write rò rỉ **không** bị từ chối trước khi kịp log) · `log_statement=all` đang bật. `coverage.js` đọc **tên alias ra từ log của DB**, không phải từ một danh sách hardcode. Vế (i) vì thế đòi **cả hai sink**: `network_sink_satisfied` **và** `db_sink_satisfied`.

### 6.4 Vì sao enumerate loopback listener lại đáng giá

Allowlist egress của `L2` **bao gồm loopback theo thiết kế**, nên `T12` (đích resolve về loopback) **không chặn được** và là **điểm mù đã biết** — `MTP §5.4` cấm làm nhẹ nó. Việc enumerate `lsof -nP -iTCP -sTCP:LISTEN` ở **đầu và cuối** mỗi lần chạy **biến chính điểm mù đó thành bằng chứng có ngày tháng**, chi phí ≈ 0 vì verifier đã phải tồn tại. Nó cũng là thứ bắt được đúng mối nguy đang hiện hữu: nếu một service lạ đang giữ cổng mà canary cần, file bằng chứng **ghi lại tên process và PID**.

---

## 7. Chu trình đầy đủ

```bash
cd src/spike/infra
bash ./cycle.sh                 # đủ 4 service
bash ./cycle.sh --infra-only    # khi src/spike/app/ chưa có
```

11 bước, đúng thứ tự ở đầu `cycle.sh`: `up` → verify(pre, `--scope-proof establish`) → destroy → verify(1) → destroy → verify(2) → **so `assertions`** → canary up + control probe → verify(canary-active) → canary down + harvest → `coverage.js`.

Với `C1` (destroy 10 lần ⇒ 10 bằng chứng), chạy `cycle.sh` 10 lần; mỗi lần sinh `run_id` + nonce mới và một bộ file JSON riêng trong `docs/035-QA/Evidence/`.

### 7.1 Không phụ thuộc bit `+x`

`cycle.sh` gọi **mọi** sub-script dưới dạng `bash "<path>"`, **không bao giờ** `"<path>"` trực tiếp. Bit `+x` không chắc sống sót qua checkout, và bản trước **chết ngay dòng đầu** với `Permission denied` khi chạy đúng lệnh mà chính tài liệu này chỉ. Phụ thuộc `chmod` là để pipeline phụ thuộc vào một thuộc tính **có thể đổi** của working copy thay vì vào **nội dung đã commit**. `bash ./cycle.sh` giờ chạy được **dù có hay không** `chmod +x`.

### 7.2 Exit code của `cycle.sh` — và vì sao **non-zero là đúng** lúc này

Các tầng dưới **cố ý** fail-closed: `verify.js` exit `21`/`22`/`23`/`24`/`25`, `coverage.js` exit `30`. Bản trước bọc chúng bằng `|| true` rồi in `cycle complete` và trả `0` — tức `Spec §4.6` còn hiệu lực với **người đọc file JSON** nhưng **hết hiệu lực với máy**.

| Nhóm bước | Chính sách | Vì sao |
|---|---|---|
| `up` · verify(pre) · 2× `destroy` · 2× verify(post) · so `assertions` | **HARD-FAIL**, dừng ngay | Đi tiếp là sinh bằng chứng về một trạng thái không ai thiết lập |
| `canary-up` · verify(canary-active) · `canary-down` · `coverage.js` | **Ghi sổ** exit code, chạy tiếp, trả về mã ở cuối | Dừng giữa `canary-up` và `canary-down` sẽ **để lại** stack canary + volume + cổng published đang sống ⇒ vi phạm dọn dẹp, và run kế tiếp sẽ fail-closed vì tranh chấp cổng |

> 🔺 **Hiện tại `bash ./cycle.sh` kết thúc với exit `30`, và đó là kết quả ĐÚNG.** Vế (ii) — fixture attestation — thuộc task fixture (`B5`/`B8`, Wave 2–3). Chừng nào file attestation chưa tồn tại thì `canary_coverage` là `incomplete` và `coverage.js` exit `30` **theo thiết kế**. Non-zero ở đây **chính là cơ chế đang chạy đúng**, không phải lỗi hạ tầng. Đọc `verdict.unsatisfied_clauses` để biết vế nào còn thiếu.

---

## 8. Đọc kết quả — thứ tự bắt buộc

1. Mở file `canary-coverage-*.json` **trước**.
2. Đọc `canary_coverage`. **`incomplete` ⇒ dừng.** `escaped_side_effects` của run đó **không được đọc như con số an toàn**; run tính là **KHÔNG đạt**. Xem `verdict.unsatisfied_clauses` để biết vế nào thiếu.
3. Chỉ khi `complete` mới đọc `escaped_side_effects`, và luôn kèm `escaped_side_effects_breakdown`.
4. Mở `destroy-evidence-*-post-destroy-1.json` và `*-post-destroy-2.json`, so khối `assertions` ⇒ idempotent.
5. Đọc `independence` trong bất kỳ file bằng chứng nào **trước khi** phát biểu bất cứ điều gì về destroy. Mệnh đề đúng nằm ở `proposition_proven`; mệnh đề **không** được nói nằm ở `proposition_NOT_proven`.
6. Kiểm `assertions.foreign_assets_preserved === true` ở **mọi** file. `false` là sự cố — dừng và báo `@TrisJr` ngay.

---

## 9. Related Documents

- [Spec-Spike-Protocol](../030-Specs/Spec-Spike-Protocol.md) — §0.3 throwaway · §4.6 fail-closed · §5.2 shortcut ledger
- [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) — §5.1 bẫy `ECONNREFUSED` · §5.2 đặc tả canary · §5.3–§5.4 `T8`/`T12`
- [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) — `THREAT-018` và residual risk (b)
- [Timeline-Repro](../010-Planning/Estimates/Timeline-Repro.md) — §4 dòng `B2`, exit criteria gốc
