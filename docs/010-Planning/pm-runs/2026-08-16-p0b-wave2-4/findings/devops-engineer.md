---
id: PM-FIND-2026-08-16-DEVOPS
type: reference
status: draft
created: 2026-08-16
---

# Findings — devops-engineer (lens hạ tầng, read-only)

## Kết luận của worker

### Q1 — `DEBT-1`: tài nguyên colima

**Số đo thật:**
```
colima list  → default Running aarch64  CPUS 2  MEMORY 2GiB  DISK 100GiB
docker info  → CPUs: 2 · Total Memory: 1.913GiB
sysctl       → hw.ncpu 8 · hw.memsize 16.0 GiB
colima ssh -- free -m → total 1958, available 1255, Swap: 0   🔴
```
`DEBT-1` xác nhận đúng, **cộng một dữ kiện gate chưa có: `Swap: 0`** — VM không có đường suy giảm mềm; chạm trần là **OOM-kill**, không phải chậm lại.

**Đính chính tiền đề của đề bài**: *"spike stack + canary stack đồng thời"* **không phải cấu hình có thật** — `cycle.sh:107-109` chạy `destroy.sh` **hai lần trước** `canary-up.sh:128`; canary tái chiếm đúng bốn cổng spike vừa nhả (`Deploy-Spike.md:115`). Hai stack **loại trừ nhau theo thiết kế**. Bài toán thật của `B7` là **spike stack + load generator**.

| Stack | `mem_limit` | `cpus` |
|---|---:|---:|
| spike-app · httpstub · postgres · redis | **1024m** | **1.50** |
| canary-net · canary-db | 384m | 0.65 |
| *(nếu chạy chung — giả định)* | 1408m | **2.15** → vượt 2 vCPU **trước khi** load gen có gì |

**(i) KHÔNG đủ — ba lý do, xếp theo độ nặng:**
1. **CFS throttling làm P99 đo cái khác.** `cpus: 0.5` ⇒ `cpu.max = 50000 100000`. Xác minh có thật: `cgroup.controllers` = `cpuset cpu io memory …`, `cpu.stat` in đủ `nr_periods`/`nr_throttled`/`throttled_usec`. Đuôi latency bị **lượng tử hoá theo bội số ~100ms**; recorder ON chạm trần **sớm hơn** ⇒ delta A/B đo **chi phí throttle**, không đo chi phí recorder — quan hệ **phi tuyến**, không hiệu chỉnh lại được. Đúng định nghĩa *"con số không diễn giải được"* mà `MTP §3.2:219` bắt `C2` từ chối.
2. **`mem_limit: 320m` là một cái cap trá hình, và nó kiểm duyệt đúng metric `B7` phải in.** `B3-6` (`MTP:556`) + `MTP §4.2` bắt recorder chạy **KHÔNG CAP**; `U-09` bắt buffer **100% traffic**; `B7-7` (`MTP:571`) đòi in **peak RSS**. Không thể đo một đỉnh mà `mem_limit` đã cắt cụt — và vì `Swap: 0`, cắt cụt ở đây là **OOM-kill giữa run**.
3. **Load generator trên host đo cái port-forwarder, không đo app.** `colima.yaml: portForwarder: ssh`; `lsof` bắt được: `ssh 82105 admin 13u TCP *:6379 (LISTEN)`.

**(ii) Cấu hình tối thiểu:**

| | vCPU | RAM | Căn cứ |
|---|---:|---:|---|
| **Sàn cứng** | **4** | **6 GiB** | app 1.0 + pg 1.0 + stub 0.5 + redis 0.25 + loadgen 0.5 + system ~0.5 = 3.75/4 |
| ✅ **Đề xuất** | **6** | **8 GiB** | +1 core riêng cho load gen (chống self-interference), +1 core đệm để `nr_throttled` giữ `0`. Host còn **2 core / 8 GiB** |

**Nguyên tắc nghiệm thu, không phải cảm tính**: cấu hình đủ ⟺ **`nr_throttled == 0` và `oom_kill == 0`** trong toàn bộ cửa sổ đo. Cả hai đọc được bằng một lần `cat`.

**(iii) 🔺 Nâng colima — thao tác, thời gian, và có phá `tnm_*` không**

```
colima stop
colima start --cpu 6 --memory 8        # ⛔ KHÔNG truyền --disk
```

**KHÔNG phá `tnm_*` — sáu bằng chứng:**

| # | Bằng chứng | Nguồn |
|:--:|---|---|
| 1 | *"The state of the VM is persisted at stop. A start afterwards should return it back to its previous state."* | `colima stop --help`, nguyên văn |
| 2 | **Cả 4 container `RestartPolicy=always`** ⇒ dockerd tự bật lại khi VM boot | `docker inspect` |
| 3 | Data trên named volume (`…_postgres_data`, `_redis_data`, `_minio_data`); `tnm_video_preprocessor` là bind mount | `docker inspect` |
| 4 | `tnm_redis` chạy `redis-server --appendonly yes` ⇒ AOF trên volume | `docker inspect` |
| 5 | `--cpu`/`--memory` chỉ đổi tham số VM; `disk: 100` không bị đụng | `~/.colima/default/colima.yaml` |
| 6 | Assertion máy của verifier **không** dựa vào uptime — `preserved: … c.State === 'running'` | `verify.js:438` |

**Thời lượng: worker KHÔNG đo được** (bị cấm restart) và **từ chối bịa số**. Dữ kiện gián tiếp duy nhất: `colima.yaml` mtime `Aug 8 12:54` → `tnm_*` `StartedAt 12:57:39 +07` = **~3 phút 39 giây**, nhưng đó là **cold boot lần đầu** (gồm tạo disk image) cộng thời gian người gõ `docker compose up` ⇒ chỉ là **chặn trên yếu**. Đề nghị **cửa sổ bảo trì 10 phút**.

**Bốn thứ phải biết trước khi bấm:**
1. ⛔ **Không truyền `--disk`** — đổi CPU/RAM non-destructive; đổi disk là thao tác khác hẳn.
2. ⚠️ **`Up 8 days` sẽ reset.** Machine gate sống sót (`verify.js:438` chỉ xét `State === 'running'`), **nhưng tiêu chí nghiệm thu đã viết thành văn** ở `p0b verdict.md:249` (*"4/4 vẫn `Up 7 days`, **không lệch một giây**"*) và `:306` sẽ **vỡ** ⇒ PM phải **re-baseline dòng đó TRƯỚC**, nếu không mọi run sau đọc thành regression.
3. ⚠️ Chờ đủ 4 container `running` rồi mới chạy cycle (`destroy.sh:146` sẽ in WARNING).
4. **Blast radius thật**: `colima start` fail sau khi đã stop ⇒ dự án `tnm` **down tới khi xử lý xong**. Rollback: `colima stop; colima start --cpu 2 --memory 2`.

**(iv) Nếu KHÔNG nâng** — có đường ra số diễn giải được, nhưng **không đường nào cứu P99 dưới tải hình-production**:

| | Cách | Được | Mất |
|:--:|---|---|---|
| **A** ✅ | **Cổng throttle fail-closed** — đọc `cpu.stat`/`memory.events` trước-sau mỗi chặng A/B; khác `0` ⇒ **huỷ con số đó** | Biến "chắc là bị throttle" thành **mệnh đề kiểm được bằng máy**. Thi hành `MTP §3.2:219` | ~0. **Nên làm dù có nâng hay không** |
| **B** ✅ | **Đo latency in-process phía app** — vốn là thứ `MTP §3.1:187` **đã bắt buộc** | Loại hẳn ssh forwarder khỏi đường đo ⇒ **xoá luôn vấn đề "k6 vắng mặt"** | Phải instrument `server.js` |
| **C** ✅ | `GET /healthz` làm **null-route control** | Tách chi phí **hook thuần** khỏi chi phí **capture dependency**. Cực rẻ | Không thay được `N-02` |
| D | concurrency = 1 | P50/P95 = service time thuần | Là hệ **không tải**; phải khai thẳng |
| E | throughput OFF vs ON | Bền hơn latency khi CPU-bound | `MTP §3.1` **từ chối** thay percentile — chỉ là số **bổ sung** |
| F | Gỡ `cpus:` | Hết throttle | ❌ **Tệ hơn** — đổi artifact **đã biết và đo được** lấy artifact **không đo được** |

> **Kết luận `Q1`**: A+B+C nên làm **bất kể** quyết định gate. Không nâng thì `B7` chỉ giao được **P50/P95 concurrency thấp có khai điều kiện** + throughput ratio; **P99 dưới tải hình-production không giao được**, và `peak RSS` (`N-07`) **bị kiểm duyệt ở 320 MiB** — không phải "đo được nhưng xấu".

### Q2 — `B7`: chi phí thật

**Lý do 1 — "≈60+ scalar": ✅ ĐÚNG, và là con số THIẾU.** Đếm từ `MTP §2.1` + `§3.1`–`§3.3` + `§8.2`: **≈85 scalar tổng hợp** (`N-02` chiếm 23; `N-04` chiếm 25) + **≈180 scalar hàng** (`B7-9` bắt capsule size in **cùng dòng** với replay time từng capsule ⇒ 30 replay × 5). Ước lượng Wave 1 **thấp hơn thực tế ~40%** ngay ở mức tổng hợp.

**Lý do 2 — `B7-12` composite là trường riêng: ✅ ĐÚNG** (`MTP:576-578`), không cắt được.

**Lý do 3 — load generator phải tự viết: ⚠️ ĐÚNG MỘT NỬA — đính chính Wave 1.**
```
k6 · autocannon · wrk · wrk2 · hey · vegeta · siege · bombardier · oha · locust · artillery · drill  → ABSENT
ab → /usr/sbin/ab   ApacheBench 2.3        🔺 CÓ MẶT
npm ls (app) → ioredis@5.11.1, pg@8.23.0 · npm -g, npx cache → không có load tool
```
`Timeline:311` nêu đúng bốn tên và **cả bốn đúng là vắng**. Nhưng `ab` **có sẵn** (có `-p/-T` POST, `-e` CSV percentile, `-g` gnuplot, bảng có `99%`).

**`ab` vẫn KHÔNG thay thế được — ba lý do cụ thể, không phải vì nó "kém"**: (1) body cố định ⇒ không tạo được **tỷ lệ success/error có kiểm soát** (`B7-5`) và không tách `P-discard`/`P-persist` (`B7-4`); (2) đo **phía client** tức qua ssh forwarder, trái `MTP §3.1:187`; (3) không gắn nhãn request → path.

⇒ **Kết luận đúng**: không cần viết một *load tool*; cần viết một **driver phát tải có kiểm soát tỷ lệ lỗi** (~50 dòng Node zero-dep) **cộng instrument phía app**. `ab` dùng được làm smoke driver.

**Ước lượng: 3.5 – 4.2 MD** *(Wave 1: 3.0–3.7; ngân sách 2.0)*

| Hạng mục | MD |
|---|---:|
| Driver phát tải + tỷ lệ lỗi tất định + reset giữa chặng | 0.4 |
| 🔺 **Instrument latency + gắn nhãn path trong app** — *Wave 1 chưa đếm; chạm file `B1` đã đóng* | 0.3 |
| 🔺 **Công tắc recorder OFF/ON thoả "không load SDK"** — *Wave 1 chưa đếm; chạm `config.js` + compose, cả hai đã đóng* | 0.2 |
| Sampler 4 chiều qua cgroup v2 (`memory.peak` cho peak RSS thật) | 0.5 |
| Orchestrator A/B/A/B + cổng throttle + đóng dấu điều kiện đo | 0.5 |
| Tổng hợp + xuất JSON ~85 scalar, `N` cạnh mọi P95/P99 | 0.6 |
| 🔴 Metric 1/2/4/5 + composite — **đọc output `B4`/`B5`/`B6`**, không build/test được tới Wave 3 | 0.9–1.6 |
| `escaped_side_effects` — gần **miễn phí**, `coverage.js` đã xuất JSON | 0.1 |

**Cắt được**: `t_pull` → `null` + lý do (*spike không có remote store*, `MTP §3.3:243` đã tách nó khỏi `N-04`) ~0.2 MD · `N-08` bytes upload capsule ~0.3 MD · không viết percentile engine. **KHÔNG cắt được**: `B7-2` · `B7-5` · `B7-10` · `B7-12`.

> 🔺 **Đề xuất giá trị nhất — không phải cắt mà là TÁCH**:
> **`B7a`** = harness overhead (metric 3 bốn chiều + metric 6), `Depends: B3` → chạy được **ngay Wave 2**, ≈ **2.3 MD**.
> **`B7b`** = metric fidelity + composite, `Depends: B4, B5, B6` → **bắt buộc Wave 3**, ≈ **1.2–1.9 MD**.
> Lý do: `Timeline:298` ghi `Depends: B3, A5` — **thiếu**. 4/6 metric đọc output `B4`/`B5`/`B6` ⇒ `B7` đơn khối **không thể bắt đầu** trước Wave 3. Tách không giảm MD nhưng **giải phóng lịch**.

### Q3 — Cặp A/B xen kẽ

```
src/spike/bench/ → ABSENT · test/spike/ → ABSENT · test/ rỗng hoàn toàn
grep -riE "recorder|sampling|bench|latency|duration_ms|hrtime" src/spike/ → 0 hit về instrument
```
**App KHÔNG có endpoint/cờ nào bật-tắt recorder.** `config.js:17-29` đóng băng đúng 11 `APP_ENV_KEYS`; `requireEnv()` (`:56-72`) **fail-fast** ⇒ thêm biến là **sửa file**, không phải thêm env.

**Cần thêm 7 thứ**, trong đó **3 thứ chạm file của task đã đóng**: công tắc recorder OFF/ON (`config.js` + compose), đồng hồ per-request phía app (`server.js:62-70` `sendJson()` hiện **không có timing** nào), nhãn path `P-discard`/`P-persist` per-request.

> #### 🔺 Bẫy đo 1 — A/B xen kẽ **KHÔNG** khử được drift đơn điệu, và ở đây có một cái
> `checkout.js:38`: `SELECT COUNT(*) FROM spike_order WHERE customer_id = $1`. `seed.js:44-54` tạo `spike_order` **chỉ có PK identity — KHÔNG index trên `customer_id`** ⇒ **seq scan**. `checkout.js:175` **INSERT một dòng mỗi request thành công**. `seed.js:17-21` chỉ có **3 customer** ⇒ dòng dồn vào vài giá trị.
> ⇒ Request thứ N quét ~N dòng. **Chi phí per-request tăng đơn điệu ngay bên trong cửa sổ đo.**
> Xen kẽ `OFF/ON/OFF/ON` khử drift **theo thời gian** (`MTP §3.1:186`), **không** khử drift **theo trạng thái tăng dần**: ON luôn đi **sau** OFF ⇒ mọi chặng ON thấy bảng lớn hơn ⇒ **overhead recorder bị thổi phồng CÓ HỆ THỐNG**, và **không lộ ra từ chính báo cáo**.
> **Vá rẻ, đã có sẵn**: gọi `seed.js:93 resetOrders()` (`TRUNCATE … RESTART IDENTITY`) **trước mỗi chặng**; đảo thứ tự thành `OFF/ON/ON/OFF` để triệt tiêu drift bậc nhất.

> #### 🔺 Bẫy đo 2 — `InteractionLog` luôn bật, làm loãng mẫu số của `<5%`
> `interaction-log.js:60`: sink mặc định `process.stdout.write` — **một dòng JSON đồng bộ cho MỌI interaction**, ~10 dòng/request, kèm nguyên `arguments`. **Không có công tắc tắt.**
> Có mặt ở **cả** OFF lẫn ON ⇒ triệt tiêu trong **delta tuyệt đối**, nhưng ngân sách `<5%` là **tỷ lệ**. Baseline bị bơm phồng bởi một logger tầng app mà production không có ⇒ **5% của một baseline phồng là dung sai lớn hơn thực tế**. Đúng chỗ hở *"baseline so với cái gì"* của `ACG-04` mà `MTP §3.1` tưởng đã bịt — **nó bịt ở tầng recorder, hở lại ở tầng app**. Chưa ai sở hữu.

**Tin tốt — cần gạt tỷ lệ lỗi đã có sẵn và TẤT ĐỊNH**: `stub/server.js:23,40-42` `DECLINE_THRESHOLD_CENTS = 500000` ⇒ 402 (`checkout.js:220`); `seed.js:28` cố ý cấp `SKU-GPU-004` giá `620000`. ⇒ `error_rate` **đặt được chính xác**, không phải quan sát thụ động.
⚠️ Nhưng: **404** (`checkout.js:146-151`) return **trước** outbound-http và Redis; **400** (`server.js:117`) return trước **mọi** dependency ⇒ **chỉ nhánh 402 chạm đủ 5 dependency**. Và **cửa sổ đêm 22:00–06:00 UTC = 05:00–13:00 giờ VN** (`clock.js:18-19,44`): phụ thu 5% có thể **lật ngưỡng decline giữa run** ⇒ pin clock hoặc tránh biên, và đóng dấu `pricing_window` vào điều kiện đo.

**Điểm nối `B3` ↔ `B7` — `B3` phải chốt trước:**

| # | Điều khoản | Trạng thái |
|:--:|---|---|
| `S1` | Cơ chế OFF/ON thoả *"không load SDK, không init"* — cờ runtime **sau** `require` **KHÔNG thoả** | 🔴 chưa có. Gợi ý rẻ nhất: mở rộng `SPIKE_ENTRYPOINT`, cơ chế **đã tồn tại** (`compose:58`) |
| `S2` | `B3` phát ra path `P-discard`/`P-persist` per-request, máy đọc được | 🔴 **`MTP §8.1` không liệt kê** ⇒ `B7-4` không thi hành được |
| `S3` | "Failed execution" định nghĩa thế nào — 402 decline có kích `P-persist` không? | 🔴 chưa quyết |
| `S4` | Điểm đo `P-serialized` vs `P-persisted` | ✅ `B3-9` đã ghi |

> `S1`+`S2`+`S3` **hiện không nằm trong `MTP §8.1 B3-1…B3-9`** ⇒ PM không thêm tường minh vào ownership map Wave 2 thì **tái hiện đúng lớp lỗi `W-3`**.

### Q4a — `G-3`: **xung đột KHÔNG CÒN THẬT, `B5` không cần stop `tnm_*`**

```
docker ps → tnm_video_preprocessor 8100 · tnm_redis 6379 · tnm_postgres 5433 · tnm_minio 9000-9001, cả 4 Up 8 days
lsof      → 5 cổng đó do ssh PID 82105 (port-forwarder colima) giữ
```

**Nhưng canary không cần một cổng nào trong đó** — tiền đề của `G-3` **sai so với thứ đã được xây**:

| Cấp | Canary chiếm | Neo |
|---|---|---|
| **Host** | `127.0.0.1:18080`, `:18081`, `:15432`, `:16379` | `canary.yml:66-68`, `:127`; `Deploy-Spike.md:108-115` |
| **Trong network** | container port `8080`/`8081`/`6379`/`5432` qua **network-alias** | `canary.yml:49`, `:71`, `:130` |

Giao của `{18080, 18081, 15432, 16379}` với `{6379, 5433, 8100, 9000, 9001}` = **RỖNG**. Container port `6379` canary bind **bên trong** container không đụng `tnm_redis`: **hai network namespace khác nhau** (`repro-spike-net` vs `tnm-marketing-studio_default` `172.19.0.0/16`).

Ba xác nhận nữa: `Deploy-Spike.md:123` đã viết sẵn *"**không script nào trong `src/spike/infra/` gọi `docker stop tnm_*`**"*; fail-closed chỉ kiểm 4 cổng của chính spike (`up.sh:81-85`, `canary-up.sh:49-56`); `destroy.sh:68-97` có **guard cứng** cho tiền tố `tnm_`.

> **Khuyến nghị: THU HỒI `G-3`.** Đường vòng mà đề bài hỏi (*đổi port canary / netns riêng / host alias khác*) **đã được thi hành từ `B2`** và đã qua 2 vòng verify.
> ⚠️ Điều kiện **duy nhất** làm `G-3` sống lại: ai đó **override** `HOST_APP_PORT`/`HOST_STUB_PORT`/`HOST_PG_PORT`/`HOST_REDIS_PORT` (`Deploy-Spike.md:119`) vào một trong 5 cổng kia ⇒ đóng `G-3` kèm **một dòng cấm override vào dải `{5433, 6379, 8100, 9000, 9001}`**. Rẻ hơn giữ một phê duyệt *"được phép stop container dự án khác"* treo lơ lửng suốt Wave 2–4.

### Q4b — `W-7`: CÒN ĐÚNG, và đã **tái hiện bằng số**

Lỗi ở `coverage.js:210`: `.filter((l) => /statement:/i.test(l))`. Dòng thật, `canary-db-statements-r20260815T171959Z.log:173-175`:
```
173: … app=psql client=10.83.0.4 LOG:  statement: INSERT INTO orders (payload) VALUES ('qa-unmarked-leak-gamma')
174: … app=psql client=10.83.0.4 ERROR:  column "payload" … does not exist at character 21
175: … app=psql client=10.83.0.4 STATEMENT:  INSERT INTO orders (payload) VALUES ('qa-unmarked-leak-gamma')
```
173 và 175 đều khớp `/i`, đều qua `PG_PREFIX_RE`, đều bị xếp `db_network_client` ⇒ **đếm đôi**.

**Tái hiện bằng máy** (chạy `coverage.js` trên log thô, `--out-dir` trỏ scratchpad — **không ghi gì vào repo**):
```
escaped_side_effects = 4   ← 3 leak thật
network distinct conns = 2  (ĐÚNG)
db statement lines counted = 2  (PHẢI là 1)
db excluded by reason = {"db_local_unix_socket": 19}
```
Khớp chính xác `verdict.md:330`. **Vá ~0.1 MD**: đổi sang `/LOG:\s+statement:/` (bỏ `/i`, neo tiền tố `LOG:`) + 2 test hồi quy + thêm **quy tắc `R7` "một statement đếm một lần"** đối xứng với `R2` phía network.

⚠️ **Đừng vá bằng cách lọc bỏ dòng `STATEMENT:`** — `R3` (`coverage.js:606`) khai riêng rằng *bắt được statement lỗi* là ưu điểm. Vá đúng là **neo vào `LOG:  statement:` để đếm**, giữ `STATEMENT:` cho phần detail/audit.

**Chủ sở hữu**: gộp cùng lô với `W-3` dưới một task hạ tầng nhỏ Wave 2, driver DevOps (~0.2 MD cả hai) — `verdict.md:332` đã xếp *"phải đóng trước `C1`, **cùng lô với `W-3`**"*. Phương án hai: gắn vào `B5`. ❌ **Đừng để tới `C1`** — `C1` chạy `cycle.sh` **10 lần**, và `T1`–`T12` là đúng chỗ sinh số khác `0`.

### Q5 — 🔴 Rủi ro hạ tầng số một

> **`spike-app` bị OOM-kill / peak RSS bị kiểm duyệt: recorder buộc chạy KHÔNG CAP + buffer 100% traffic, bên trong `mem_limit: 320m`, trên VM `Swap: 0`.**

Chọn cái này thay vì CPU vì throttling làm số **xấu-nhưng-còn-đo-lại-được**; OOM/censoring làm **mất dữ liệu**, mà `MTP §4.2` tuyên bố lớp hỏng đó *"không khôi phục được, **phải chạy lại toàn bộ `C1`**"*.

**Mắt nguy hiểm nhất (c)**: phản xạ tự nhiên khi gặp OOM là **nâng `mem_limit` mà không nâng VM**. Hiện đã cam kết `703 (đang dùng) + 1024 (hạn mức spike) = 1727 / 1958 MiB ≈ 88%, swap 0`. Kernel OOM-killer chọn nạn nhân theo `oom_score` **trên toàn VM** — **nó không đọc docker label**. `destroy.sh:68-97` bảo vệ `tnm_*` khỏi **sai lầm của công cụ**, **không** bảo vệ khỏi **áp lực bộ nhớ**. ⇒ Một container `Up 8 days` của **dự án khác** có thể bị giết, **âm thầm**.

**Dấu hiệu sớm nhất** (đọc sau mỗi chặng A/B và mỗi scenario `C1`):

| Tín hiệu | Nguồn | Ngưỡng |
|---|---|---|
| **`memory.peak`** | cgroup v2 | `≥ 0.9 × mem_limit` ⇒ **cảnh báo, bắn TRƯỚC khi có kill** — rẻ nhất và sớm nhất |
| `oom_kill` | `memory.events` | `> 0` ⇒ huỷ số của chặng đó |
| `OOMKilled` | `docker inspect -f '{{.State.OOMKilled}}'` | `true` ⇒ như trên |
| `nr_throttled` | `cpu.stat` | `> 0` ⇒ latency không diễn giải được |
| 4/4 `tnm_*` `running` | `verify.js:438` | lệch ⇒ **dừng ngay, mở incident** |

**Chi phí nếu phát hiện muộn**: Wave 2 ≈ **0.2 MD + 1 cửa sổ 10 phút** → Wave 4 phải chạy lại `B7` **+1.5–2.0 MD** trên phase đã 122.5% → `C1` worst case chạy lại **toàn bộ 3.0 MD**, tiêu nốt đệm `P0-C` 70% vốn **đã có chủ đúng cho tình huống này**, `GATE-06` mất lưới an toàn.
⇒ **Đề nghị thêm probe 4/4 `tnm_* running` vào chính vòng lặp A/B của `B7`**, không chỉ trong `cycle.sh` — `verify.js:438` chỉ chạy **trong** một cycle, không chạy lúc load run.

## PM đọc được gì

1. **`G-3` phải thu hồi, không phải xác nhận.** Em vào gate định hỏi *"có được stop `tnm_*` chưa"*; câu trả lời là **câu hỏi không còn tồn tại** — `B2` đã giải nó bằng thiết kế port từ Wave 1, và chính `Deploy-Spike.md` đã viết điều đó ra. Giữ một phê duyệt *"được phép stop container dự án khác"* treo suốt Wave 2–4 là rủi ro thuần, không đổi lại được gì.
2. **`DEBT-1` nặng hơn "P99 xấu".** Nó là **hai** vấn đề: CPU throttling (số khó diễn giải, còn cứu được) và **OOM trên `Swap: 0`** (mất dữ liệu, `MTP §4.2` nói không khôi phục được). Và mắt (c) — nâng `mem_limit` mà không nâng VM — có thể giết container **dự án khác**, âm thầm, không tín hiệu nào trong pipeline báo lên.
3. **Bẫy đo 1 (`seq scan` tăng đơn điệu) là phát hiện đắt giá nhất của lens này.** Nó **thổi phồng overhead recorder có hệ thống** và **không lộ ra từ báo cáo** — đúng lớp lỗi mà `A/B` xen kẽ được thiết kế để chống, nhưng ở một trục mà `MTP §3.1` không nhắc tới. Vá bằng một lời gọi hàm **đã tồn tại**.
4. **Đính chính Wave 1 về load generator**: `ab` có mặt. Wave 1 nói *"đều vắng mặt"* — đúng với bốn tên đã liệt kê, nhưng kết luận rút ra từ đó ("phải tự viết load tool") thì **quá tay**. Cần viết **driver**, không phải **tool**.
5. **Ba khoản `B7` chưa ai đếm và chạm file đã đóng**: instrument latency (`server.js`), công tắc recorder (`config.js` + compose), công tắc `InteractionLog`. Đây là lần thứ ba trong run này một nghĩa vụ nằm ở ranh giới ownership.

## Mâu thuẫn với lens khác

**Một mâu thuẫn thật, PM phân xử:**

`security-auditor` đề xuất mạng thứ hai `--internal` cho `L2` của `B5`. `devops-engineer` đo được VM chỉ có `2 vCPU / 1.913 GiB / Swap 0` và cảnh báo mọi thứ thêm vào đều ăn vào ngân sách đó.

**Phân xử của PM**: **không mâu thuẫn về kỹ thuật** — một `docker network create --internal` tốn **0 RAM, 0 CPU** (nó là cấu hình netns, không phải container). Cái tốn tài nguyên là **canary**, mà canary **không chạy đồng thời** với spike stack (`devops Q1`, đã đính chính). ⇒ **Cả hai đề xuất tương thích.** Ghi nhận để không ai đọc nhầm thành đánh đổi.

**Hội tụ bốn chiều về cùng một kết luận** — mỗi lens một đường, cùng chỉ vào *tính hợp lệ của con số*:
- `architect`: ai được vào **denominator**
- `quality-assurance`: ai được quyền nói **kết quả nào đúng**
- `security-auditor`: **số đo** có thật không
- `devops-engineer`: **điều kiện đo** có cho phép diễn giải con số không
