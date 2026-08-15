# Findings — devops-engineer

> Lens **read-only trước gate**. `FILES_TOUCHED: none` — đã đối chiếu, đúng ownership đã cấp.
> Worker chạy lệnh **chỉ đọc** để verify toolchain và trạng thái daemon. Mọi con số dưới đây là **đo được**, không suy đoán.

## Kết luận của worker

### Q1 — Máy này chạy được `B2` tới đâu

**Toolchain (ngoài 4 thứ PM đã verify):**

| Nhóm | Có | **Không có** |
|---|---|---|
| Container | `docker compose v5.2.0`, `colima`, `lima` | `podman`, `nerdctl` |
| **IaC** | — | 🔴 **không có gì**: `terraform`, `tofu`, `pulumi`, `ansible` |
| K8s | `kubectl` nhưng **`~/.kube/config` ABSENT**, 0 context | `kind`, `minikube`, `k3d`, `helm` |
| Cloud CLI | `aws` (**`~/.aws/credentials` ABSENT**; `~/.aws/config` có 2 profile SSO `infonet-svc`/`infonet-sys` — **của tổ chức khác**), `gcloud` (project **unset**) | `az`, `localstack`, `vault` |
| Đo/mạng | `jq`, `ab`, `curl`, `tcpdump`, `nc`, `python3` | 🔴 `k6`, `autocannon`, `wrk`, `hey` |

**Hạ tầng thật của daemon** — active context là **`colima`**, không phải Docker Desktop: `NCPU = 2`, `MemTotal ≈ 1.91 GiB`. Máy host có **8 CPU / 16 GB** ⇒ container chỉ được cấp **¼ CPU và ⅛ RAM của máy**.

🔴 **Daemon này đang có người ở**: 4 container của **dự án khác** chạy **7 ngày** — `tnm_postgres` (pgvector, `5433→5432`), `tnm_redis` (`6379`), `tnm_minio` (`9000-9001`), `tnm_video_preprocessor` (`8100`), cộng 10 volume, 2 network `tnm-marketing-studio_*`.

**Chấm từng vế exit criteria `B2`:**

| Vế | Kết quả | Ghi chú |
|---|---|---|
| **(a)** không service nào của môi trường gốc sống | ✅ **THOẢ** có điều kiện | *"Môi trường gốc"* **phải** định nghĩa bằng **nhãn**, không phải *"mọi thứ trên daemon"*. Scope lỏng ⇒ một trong hai kết cục đều hỏng: verifier báo `tnm_*` là tàn dư (false positive mỗi lần chạy), hoặc destroy quét luôn `tnm_postgres` của dự án khác. ⛔ **CẤM `docker system prune` ở mọi dạng** |
| **(b)** bằng chứng do công cụ **độc lập** sinh | ⚠️ **MỘT PHẦN** | Độc lập **tầng công cụ**: đạt (package riêng, không import destroy, gọi thẳng Docker Engine API + probe TCP từ host + `lsof`, JSON mỗi run). Độc lập **tầng thẩm quyền**: **KHÔNG** — nguồn sự thật vẫn là chính `dockerd` mà destroy điều khiển, và máy có **3 docker context**; resource sống sót ngoài context được enumerate thì verifier **mù hoàn toàn**. Exit criteria đang đòi cái thứ hai |
| **(c)** cách ly **tầng IAM** | ❌ **KHÔNG THOẢ** | **Docker không có IAM.** `docker.sock` là **ambient authority tương đương root trên toàn daemon** — ai destroy được spike thì cũng destroy được `tnm_postgres`. Không credential để thu hẹp, không policy engine, không deny boundary, không `vault`/`localstack`. Vế này **không tồn tại ở dạng cục bộ**, không phải *"làm yếu hơn"* |
| **(d)** nhãn · idempotent · revoke/rotate | ⚠️ **2/3** | Nhãn ✅ · idempotent ✅ (vòng hội tụ-về-vắng-mặt, chứng minh bằng chạy 2 lần liên tiếp so 2 file bằng chứng) · **revoke/rotate ❌**: docker socket **không có token để thu hồi, không có phiên để hết hạn**. Rotate secret **của môi trường** thì làm được và nên làm (bảo vệ `A-05`), nhưng **không** thoả yêu cầu — yêu cầu nói về **thẩm quyền của đường teardown**, không nói về secret ứng dụng |
| **(e)** canary sink | ✅ **THOẢ** | Vế mạnh nhất ở cục bộ, nhưng **có giá** — xem dưới |

⚠️ **Hai cơ chế bắt buộc của vế (e), bỏ qua thì nó chỉ đúng trên giấy**: (1) môi trường phải nằm trên **docker network external, sống lâu**, và destroy **không** xoá network đó — để `compose down` xoá network mặc định thì chính những tên DNS (`postgres`, `redis`, `api`) mà canary cần **chiếm lại** sẽ biến mất cùng nó; canary attach bằng `network-alias` trùng tên service đã destroy. (2) Phía host, canary republish **đúng** những cổng môi trường đã publish, bind `127.0.0.1`.

⚠️ **Cảnh báo `.gitignore` cho đường bằng chứng**: repo đang ignore `logs/`, `*.log`, `data/`, `tmp/`, `out/`, `dev/`. Nếu 10 file bằng chứng và canary log rơi vào các path đó, chúng **không bao giờ vào git** ⇒ không có bằng chứng có ngày tháng, trong khi `B10` đặt chuẩn *"niêm phong = commit vào git"*. Bằng chứng destroy phải nằm ở path **không bị ignore**, đuôi `.json` — đề xuất `docs/035-QA/Evidence/`.

⛔ **Cấm tường minh**: **không** dùng `infonet-svc` / `infonet-sys` — SSO của **tổ chức khác**; chĩa một script destroy vào account bên thứ ba là rủi ro **không thu hồi được**. Cũng không dùng account gcloud cá nhân khi `project` đang `unset`.

### Q2 — Dòng shortcut ledger `§5.2`

🔺 **Phát hiện phải khai trước**: **không có mã `SEC-xxx` nào phủ *"cách ly IAM cho quyền teardown hạ tầng"***. Worker grep toàn bộ threat model theo `IAM|least privilege|rotate|revoke|credential|destroy`: `SEC-017`–`SEC-020` nói về collector và capsule store; `SEC-032`–`SEC-036` nói về egress lúc replay. **Không mã nào nói về thẩm quyền phá huỷ môi trường.** ⇒ Gán bừa một mã sẽ làm `B9` xác minh một dòng **sai**. Cột 1 phải neo vào **vế exit criteria `B2`** + `THREAT-018`. Bản thân sự vắng mặt của mã `SEC` là một phát hiện đáng nói ở gate.

Dòng ledger đề xuất (đủ 5 cột) đã soạn xong: khai **ba** thứ bị bỏ có ý thức — (1) cách ly IAM **không tồn tại**, vế *"credential destroy không có quyền chạm ngoài scope"* được thay bằng **kỷ luật nhãn trong script**, tức một ràng buộc do chính script **tự áp lên mình**; (2) bằng chứng chỉ độc lập ở tầng công cụ; (3) không revoke/rotate credential destroy. Đồng thời khai rõ vế (a), nhãn, idempotent, canary sink **được hiện thực đầy đủ**, **không** nằm trong dòng này.

**Hệ quả lên giá trị bằng chứng `C1` — phải đi kèm dòng ledger, không tách rời:**

1. 10 bằng chứng destroy chứng minh mệnh đề **hẹp hơn** mệnh đề exit criteria phát biểu. Chúng chứng minh: *"trong scope nhãn đã khai, trên một docker context, tại thời điểm đo, không còn resource nào khớp nhãn"*. Chúng **không** chứng minh: *"không tồn tại đường nào để môi trường gốc còn sống"*.
2. ✅ **Điều này KHÔNG làm hỏng `escaped_side_effects`** — metric số 6 lấy nguồn sự thật từ **canary log**, và canary được hiện thực đầy đủ. **Ranh giới quan trọng: cái bị hạ là *bằng chứng destroy*, không phải *bằng chứng an toàn*.**
3. Nhưng bẫy `ECONNREFUSED` (`MTP §5.1`) chỉ được xử đúng **khi canary chiếm được đúng địa chỉ cũ** — trên máy hiện tại điều đó **chưa đảm bảo** (xem Q5). Không chiếm đủ ⇒ run đánh dấu `canary_coverage: incomplete` và tính **fail-closed** theo `Spec §4.6`: *"bằng chứng thiếu ⇒ tính là KHÔNG đạt"*.
4. **Ràng buộc thời điểm ghi**: `§5.2` cấm ghi hồi tố, và nói rõ 5 dòng pre-register hiện có là **ngoại lệ được nêu tên, không phải tiền lệ**. ⇒ Dòng này nằm **trong cùng PR** với compose file + `destroy.sh`. ⛔ **Không để `B9` viết hộ ở cuối phase** — `B9` là người **xác minh** dòng này, và một dòng do chính `B9` viết ra thì **không còn gì để `B9` xác minh**.

### Q3 — `B7` harness

**(a) 🔴 "6 metric" là chưa đủ — và chính `MTP` tự nói vậy.** `B7-1` ghi *"Đây chưa phải toàn bộ hợp đồng đầu ra — xem `B7-12`"*. `B7-12` đòi **trường composite** xuất trong **cùng output máy đọc được**, thành **trường riêng**, **không trộn** vào `N-01`/`N-05`; tử số fail-closed; scenario không replay được ⇒ **không** reproduced và **không** rời mẫu số; mẫu số **cố định 7**. `Spec §4.6` đòi **ba** con số cùng xuất hiện ở `C4`: `RSR`, `EMR` thô (mẫu số danh nghĩa `D×K = 21`), composite. ⇒ Tối thiểu **7 nhóm trường**, không phải 6.

Ngoài composite, `MTP §8.2` nở từng metric thành phân bố: `B7-4` tách `P-discard`/`P-persist`, **cấm gộp trung bình** · `B7-6` in `avg/P50/P95/P99` cho **cả** baseline lẫn ON kèm `N` · `B7-7` bốn chiều overhead (latency + CPU + memory + network) · `B7-8` breakdown `t_boot`/`t_replay_exec`/`t_verify`, `t_pull` riêng **không** cộng vào `N-04` · `B7-9` capsule size **cùng dòng** với replay time của chính capsule đó · `B7-10` in `N` cạnh mọi P95/P99 · cộng `P-serialized`, tỉ lệ nén, `error_rate` và `sampling = OFF` **đóng dấu lên mọi con số**.

Đếm riêng latency: `{OFF, ON} × {P-discard, P-persist} × {avg, P50, P95, P99, N}` = **20 số**. Cộng CPU/mem/network hai chiều, capsule size, bảng replay time `D×K = 21` dòng (diagnostic `10×K = 30`) mỗi dòng 5 trường ⇒ **tổng ≈ 60+ scalar**. *"6 metric"* là **tên gọi của nhóm**, không phải hợp đồng schema. Xây theo nghĩa đen *"6 con số"* ⇒ thiếu, và chỉ lộ ra ở `C1`.

🔺 **Phát hiện dependency phải sửa vào đồ thị**: `B7` **không tự sinh được 4/6 metric**. `N-01`/`N-05`/composite đến từ verdict của `B6`; `escaped_side_effects` từ canary log của `B2` (`B7-11` **cấm** lấy từ log replay runtime); capsule size từ store của `B4`; replay time từ lần chạy `B5`/`B6`. **`B7` về bản chất là aggregator trên artifact của task khác.** Nhưng `Timeline` chỉ cho `B7` cạnh `Depends: B3, A5` — lúc xây `B7` thì **format verdict của `B6` và format canary log của `B2` chưa tồn tại**. Hai lối thoát: (i) `B7` sở hữu và **publish sớm** hai schema đó làm contract để `B2`/`B6` tuân theo, hoặc (ii) `B7` bị viết lại sau `B6`. **Đề xuất lối (i)**, và thêm cạnh `B2 → B7`, `B6 → B7` vào đồ thị.

**(b) A/B xen kẽ.** `MTP §3.1` chốt baseline = recorder **tắt hoàn toàn, không load SDK, không init** — *"không phải bật nhưng no-op"*. ⇒ Hệ quả kỹ thuật **cứng**: OFF/ON **không thể** là một flag runtime trong cùng process; mỗi pha phải là **process mới**, khác nhau ở entry point. Hiện thực: harness là orchestrator, mỗi round spawn OFF → warmup (bỏ) → load cố định → kill; spawn ON → lặp; chạy `R` round; **phân tích delta theo CẶP trong từng round**, không gộp trung bình toàn cục — đây mới là thứ thật sự triệt tiêu drift (nhiệt, cache OS, JIT warm-up).

**Chỗ không có công cụ**: `B7-4` đòi tách latency theo outcome ⇒ cần **bản ghi từng request** nối status với latency. `ab` **không làm được**, và `k6`/`autocannon`/`wrk`/`hey` **đều vắng mặt**. ⇒ Phải viết generator nhỏ bằng Node (~0.3 MD) hoặc `npm install autocannon`.

🔴 **Cảnh báo mức CHẶN về máy**: colima cấp **2 vCPU / 1.91 GiB**, daemon đã có 4 container dự án khác. Load generator + app + Postgres + Redis + stub + canary trên 2 vCPU nghĩa là **cái đuôi P95/P99 mà `MTP §3.1` bắt buộc in ra sẽ bị chi phối bởi tranh chấp CPU, không phải bởi recorder**. A/B theo cặp xử được **drift**, **không** xử được **contention**. ⇒ Trước khi `B7` chạy cần nâng colima lên **≥ 4 CPU / ≥ 8 GB** (host có 8/16, dư) và đặt load generator **trên host macOS** bắn vào cổng đã publish, đồng hồ vẫn ở tầng ứng dụng bên trong app. **Đây là điều kiện tiên quyết, không phải tối ưu**: phương án còn lại là một con số không diễn giải được, mà `MTP §3.2` đã nói thẳng *"`C2` phải từ chối nó"*. Nâng colima là **thay đổi cấu hình máy của anh** ⇒ cần anh duyệt tường minh.

**(c) Hai loại traffic — XÁC NHẬN cách đọc của PM, và sắc hơn ba mức.** Neo trực tiếp: `MTP §3.2` nói nguyên văn 10 scenario §22 đều là execution lỗi, load run 100% lỗi thì *"chỉ đo đường persist"*, con số thu được **không phải** con số mà ngân sách `<5%` nói tới. `B8` dựng fixture *"mỗi scenario một cách gây lỗi có chủ đích"* ⇒ **toàn bộ corpus fixture là traffic lỗi. Không task nào sở hữu workload thành công.**

Sắc hơn: (1) `B7-5` biến `error_rate` thành **điều kiện đo bắt buộc** đóng dấu lên mọi con số ⇒ harness phải **điều khiển được** tỷ lệ lỗi (chạy ở 1%, 5%), không chỉ đo nó; (2) `B7-4` cần correlate outcome ↔ latency **từng request**; (3) ⇒ `B7` cần **ba** thứ không nằm trong exit criteria của nó **cũng không** nằm trong `B1`: workload checkout **thành công** · error injector **điều chỉnh được**, **không** phụ thuộc fixture `B8` · bản ghi per-request. Phần thiếu ~0.5 MD.

### Q4 — Ước lượng lại

> Khác biệt so với 2.0 MD của `Timeline` **không** phải *"cùng khối lượng, ước lượng bi quan hơn"*, mà là **khối lượng mà 2.0 MD giả định không tồn tại**: verifier độc lập, DB sink của canary, load generator, và schema đầu ra.

**`B2` (i) mô phỏng cục bộ: 3.0–3.5 MD** (ngân sách 2.0 ⇒ **vượt 1.0–1.5**)
compose topology + external network + nhãn + healthcheck + map cổng né `6379`/`5433`/`8100`/`9000-9001` **đang bị chiếm** `0.5` · `destroy.sh` `0.5` · **verifier độc lập** `0.7` · **canary sink** `0.8–1.1` · `Deploy-Spike.md` + ledger + bàn giao `B9` `0.4`.
Tốn nhất theo thứ tự: **(1) chiếm lại địa chỉ sau destroy** — canary phải chiếm đúng địa chỉ vừa ngừng tồn tại, mà vòng đời mặc định của compose lại **xoá đúng cái network mang những tên đó**; sai thiết kế chỗ này thì **làm lại từ đầu**. **(2) DB sink** — `0.8` nếu dùng Postgres vanilla `log_statement=all` + bảng audit thật (INSERT-only, `REVOKE UPDATE, DELETE`); `1.1` nếu tự viết responder PostgreSQL wire protocol. **(3) làm verifier THẬT SỰ độc lập** thay vì một lời gọi thứ hai vào cùng code path — **chỗ dễ tự lừa nhất**.

**`B2` (ii) cloud thật: 6.0–8.0 MD + 2–5 ngày lịch chờ + chi phí cloud định kỳ.** Cộng thêm: cài + viết `terraform`/`tofu` (máy **không có gì**), account/project chuyên dụng + SCP/org policy, OIDC + credential ngắn hạn, permission boundary + ABAC theo tag, **inventory phía provider** cho vế (b), DNS flip cho canary + listener có flow log, rotate credential mỗi run, budget alarm.
⇒ **Giá của vế (c) và nửa `revoke/rotate` của vế (d) là ~4–6 MD cộng thời gian chờ lịch.** Đó là con số để quyết `OQ-B3`, không phải một câu *"cloud thì đắt hơn"*.

**`B7`: 3.0–3.7 MD** (ngân sách 2.0 ⇒ **vượt 1.0–1.7**)
orchestrator A/B `0.5` · load generator per-request + núm `error_rate` `0.5` · sampler 4 chiều `0.4` · breakdown replay time + join capsule size `0.4` · **schema + emitter** `0.5` · composite `B7-12` `0.2` · parser canary log `0.3` · **rework do format `B6`/`B2` chưa tồn tại lúc build `0.3–0.7`**.
Tốn nhất: **schema/emitter và load generator**, không phải bản thân phép đo — vì `MTP` biến *"6 metric"* thành hợp đồng nơi **mỗi scalar phải mang theo điều kiện đo**, và giá của làm ẩu chỗ này là `C2` **từ chối toàn bộ số**, tức mất luôn 3.0 MD của `C1`.

🔴 **Cộng lại: hai task này 6.0–7.2 MD trên 4.0 MD được cấp**, trong một phase **đã ở 110% capacity không đệm**.

### Q5 — 🔴 Rủi ro vận hành lớn nhất PM chưa hỏi tới

> **Máy này đang chạy sẵn dịch vụ THẬT trên loopback tại đúng những cổng mà canary phải chiếm — biến `T12` thành mù, và biến một side effect rò rỉ thành thiệt hại lên dự án khác.**

Bằng chứng máy: `tnm_redis` giữ `0.0.0.0:6379` · `tnm_postgres` (pgvector) giữ `0.0.0.0:5433→5432` · `tnm_minio` giữ `9000-9001` · `tnm_video_preprocessor` giữ `8100` — tất cả **Up 7 days**, 10 volume cùng daemon.

Bằng chứng tài liệu, năm neo:
- Threat model, residual risk (b) của `THREAT-018`, **nguyên văn**: *"đường loopback bị lạm dụng nếu máy developer có dịch vụ thật lắng nghe ở localhost"*. ⇒ **Rủi ro này đang hiện hữu trên máy này, không phải giả định.**
- `MTP §5.3` `T12`: allowlist `L2` **bao gồm loopback** ⇒ `L2` **không chặn**, theo thiết kế.
- `MTP §5.2`: *"canary phải lắng nghe cả trên loopback… nếu không thì `T12` mù và sẽ báo pass sai"*.
- `MTP §5.2`: nguồn sự thật của 12 test là **canary log**.
- `Timeline` `B5`: `escaped_side_effects = 0` **đo bằng canary log**.

**Ghép lại**: canary **không bind được** `6379` và `5433` vì đã có người giữ. Một WRITE rò rỉ đi tới loopback sẽ **không** vào canary — nó vào `tnm_redis` và `tnm_postgres` **thật**. Hai hệ quả, **cả hai đều im lặng**:

1. **`escaped_side_effects` đọc ra `0` trong khi một WRITE thật đã đáp xuống DB của dự án khác.** Canary không thấy thì không đếm; `L2` không chặn loopback theo thiết kế; `T12` báo pass. Đúng kịch bản `MTP §5.1` gọi là làm *"mọi bằng chứng an toàn vô nghĩa"* — chỉ khác là nó vào bằng một cánh cửa **chưa ai kiểm**.
2. **Thiệt hại dữ liệu ra ngoài blast radius của spike** — lệnh ghi thực thi **thật** lên `tnm_postgres`, dataset của dự án khác đang chạy 7 ngày trên cùng laptop.

⚠️ Rủi ro này **không biến mất ở kịch bản cloud**, vì replay **luôn** chạy trên máy developer (`A-12`).

**Xử lý — thuộc `B2`, KHÔNG thuộc `B5`, và phải xong TRƯỚC `C1`:**
1. Trước mỗi cửa sổ chạy `C1`: **`docker stop` (không xoá)** 4 container `tnm_*`, giải phóng `6379`/`5433`/`8100`/`9000-9001`; khôi phục sau. ⚠️ **Thao tác lên tài sản của dự án khác ⇒ cần `@TrisJr` chấp thuận tường minh** — không phải quyết định của PM.
2. Mở rộng verifier độc lập để enumerate **mọi loopback listener** bằng `lsof -nP -iTCP -sTCP:LISTEN` tại **đầu và cuối mỗi scenario**, ghi thẳng vào JSON bằng chứng. **Việc này biến chính điểm mù của `T12` thành bằng chứng có ngày tháng** — chi phí ≈ 0 vì verifier đã phải tồn tại.
3. **Fail-closed**: cổng canary cần chiếm đang bị người khác giữ ⇒ run đánh dấu `canary_coverage: incomplete` và **tính là không đạt** theo `Spec §4.6`.
4. `B7` in **`canary_coverage` cạnh `escaped_side_effects`** trong cùng output máy đọc được. Một số `0` không kèm coverage là **số không diễn giải được** — cùng logic `MTP §3.2` áp cho `error_rate`.

## PM đọc được gì

- 🔴 **Capacity vỡ TRƯỚC khi viết dòng code đầu tiên.** Riêng `B2` + `B7` là **6.0–7.2 MD trên 4.0 MD cấp**. Cộng `B0` (schema + `identity()` dùng chung, từ lens architect) và `class_assessment`/`inconclusive` (hạng mục orphan, cũng từ lens architect) — cả hai **chưa từng được đếm**. `P0-B` vốn đã 110% không đệm ⇒ đây **không** phải chuyện siết tiến độ, mà là **phạm vi thật lớn hơn ngân sách**. Phải đưa lên anh, không được nuốt.
- 🔴 **Hai điều kiện tiên quyết cần anh duyệt, cả hai chạm tài sản ngoài dự án**: (i) `docker stop` tạm 4 container `tnm_*`; (ii) nâng colima `2 vCPU/1.91 GiB` → `≥4 CPU/≥8 GB`. Không có (i) thì `escaped_side_effects = 0` **có thể là số giả** và tệ hơn — có thể kèm thiệt hại thật lên DB dự án khác. Không có (ii) thì `B7` sinh ra số mà `C2` **phải từ chối**.
- ⚠️ **Cạnh dependency thiếu trong `Timeline`**: `B2 → B7` và `B6 → B7`. Không sửa thì `B7` được xây trước khi biết format nó phải đọc ⇒ `0.3–0.7 MD` rework. Đây là **làm rõ đồ thị**, không phải đổi contract `Gate A`.
- ✅ **Một ranh giới quý cần giữ trong Spike Report**: mô phỏng cục bộ hạ **bằng chứng destroy**, **không** hạ **bằng chứng an toàn** — vì `escaped_side_effects` lấy nguồn từ canary, và canary hiện thực được đầy đủ. Đừng để `C4` gộp hai thứ này rồi hạ thấp cả hai.
- ⚠️ **Đường ghi bằng chứng phải né `.gitignore`.** Đề xuất `docs/035-QA/Evidence/*.json`. Nối thẳng với `CTL-2` của lens security (`.gitignore` phủ artifact spike **trước** khi `B3` chạy) — hai lens chạm cùng file `.gitignore` từ hai đầu ngược nhau: một bên cần **thêm** ignore cho capsule, một bên cần **đảm bảo không** ignore bằng chứng. **PM phân xử: cả hai đúng, và chúng không xung đột** — capsule bị ignore, bằng chứng JSON thì không. Phải viết `.gitignore` bằng path tường minh, không dùng pattern rộng.

## Mâu thuẫn với lens khác

**Không mâu thuẫn. Ba lens hội tụ về CÙNG một cơ chế hỏng, tiếp cận từ ba hướng** — và đó là tín hiệu mạnh, không phải trùng lặp:

| Lens | Đường vào | Kết luận chung |
|---|---|---|
| `security-auditor` | `BS-2` — egress tới địa chỉ **ngoài** tập canary phủ; `E1`/`E2` cho `T8` | |
| `architect` | `L2` tầng runtime mù với `child_process`; `--permission` đóng được `T8` nhưng **không** có `--allow-net` ⇒ không chạm `T12` | **`escaped_side_effects = 0` có thể là số GIẢ, và không có gì trong thiết kế hiện tại phát hiện được điều đó** |
| `devops-engineer` | canary **không bind được** `6379`/`5433` vì `tnm_*` đang giữ ⇒ WRITE rò rỉ vào DB thật của dự án khác | |

⇒ **PM phân xử: gộp ba phát hiện thành MỘT điều kiện tiên quyết chung cho `B5`, đặt tên `canary_coverage`.** Một run chỉ được đọc `escaped_side_effects` khi chứng minh được canary **thực sự chiếm đủ** địa chỉ nó cần — đo bằng một `curl` đối chứng từ trong container replay, **ngoài** mọi test (`E1` của security), tới một đích **thuộc tập canary phủ** (`E2`), trên một máy mà **không dịch vụ lạ nào giữ cổng** (devops). Thiếu bất kỳ vế nào ⇒ `canary_coverage: incomplete` ⇒ **fail-closed**.
Không gộp thì ba lens sinh ra ba dòng exit criteria rời rạc, và một implementer sẽ thoả từng dòng mà vẫn để lọt đúng chế độ hỏng mà cả ba cùng chỉ tới.
