---
id: PM-RUN-TASKS-2026-08-15-P0B
type: reference
status: draft
created: 2026-08-15
---

# Tasks: 2026-08-15-p0b-spike-build — Wave 1

> 🔒 **File này do PM ĐỘC QUYỀN tick.** Worker báo task nào xong qua `FILES_TOUCHED` + `SUMMARY`; PM đối chiếu với ownership đã cấp rồi mới tick. Chốt chặn chống ghi đè.
> Phạm vi run đã chốt tại gate (`G-1`): **chỉ Wave 1**. `B3`–`B10` thuộc run sau.

## W1.0 — PM tự làm (không dispatch)

- [x] **`CTL-2`** — `.gitignore` phủ artifact spike (`capsules/`, `artifacts/`, `*.capsule`, `canary-log/`), **giữ `test/spike/manifests/` và `docs/035-QA/Evidence/` KHÔNG ignore**, kèm chú thích lý do neo `THREAT-006`
- [x] **Tạo branch `spike/p0b-wave1`** (`G-4`) — ✅ xong ở phiên mới (`escalations.md` `E4`). Chặn của `E2`/`E3` là ràng buộc **của phiên cũ**, không phải của công việc.
- [x] **`E1` đóng** — `.env` chưa từng track, chưa từng vào history ⇒ **không cần rotate** secret nào (`E4` mục 2)

## W1.1 — ba task song song, ownership rời nhau tuyệt đối

> ✅ **ĐÃ DISPATCH** — 2026-08-15, phiên mới, ba Agent trong **một** message. Chặn của `E2`/`E3` không còn.
> 🔒 Bốn contract PM chốt trước dispatch để ba worker song song không lệch nhau: `CT-1` CommonJS · `CT-2` `contract/` zero-dep · `CT-3` tên service `spike-{app,postgres,redis,httpstub}` · `CT-4` tập biến `SPIKE_*`. Chi tiết + lý do: [`escalations.md` `E4`](escalations.md).
> ⚠️ Mục *"dòng shortcut ledger"* của `B2` **đã chuyển chủ**: worker soạn nguyên văn trả trong `SUMMARY`, **PM** đặt vào `Spec §5.2` — `run-plan §3` cấm `devops-engineer` chạm `docs/030-Specs/**`.

- [x] **`B0`** 🆕 `architect` → `src/spike/contract/` — **`STATUS: DONE`**
  - [x] Schema artifact spike, nhãn `HYPOTHESIS`, đủ 6 field `Spec §3.1` + hai neo `U0`/`U∞` — `schema.js`; `U0`/`U∞` là **field riêng** ⇒ `§3.4` điều kiện 3 thành ràng buộc cấu trúc; mỗi artifact mang cờ `notCapsuleFormatV1: true`
  - [x] Module `identity()` / `normalize()` dùng chung — hiện thực **đúng 4 phép** `Spec §3.2`
  - [x] Ghi rõ **ba** consumer (`B3` recorder · `B5` allowlist `R3` · `B6` rubric) trong tài liệu module — README §3, mỗi consumer một bảng nghĩa vụ có neo
  - [x] Khối `class_assessment` có mặt trong schema (`Spec §2.6` — hạng mục orphan phát hiện ở gate) — `validateArtifact()` **trả `ok: false`** khi khối vắng mặt; `inClass: null` là giá trị hợp lệ (= KHÔNG KIỂM ĐƯỢC)
  - [x] Không tuyên bố `U-01`/`U-02` đã đóng — tuyên bố trong header cả 3 file `.js` + README §1; 0 lần xuất hiện `matched`/`diverged` trong thư mục

  **PM đối chiếu ownership**: 6 file, **toàn bộ** trong `src/spike/contract/` ⇒ ✅ đúng ownership đã cấp, không chạm file lạ.
  **PM chạy lại độc lập** (không tin báo cáo suông): `node -e "require('./src/spike/contract')"` → `REQUIRE_OK` · `node src/spike/contract/self-check.js` → **42 pass / 0 fail**, exit `0`. `CT-1`/`CT-2` thoả — require được từ repo root **khi chưa có `package.json`** ⇒ đúng là CommonJS zero-dep.
  **10 `HYPOTHESIS` đã gắn nhãn** (`H-S1`–`H-S5`, `H-N1`, `H-N2`, `H-N4`, `H-N5`, `H-I1`), mỗi mục kèm điểm yếu đã khai theo `Spec §1.2` quy tắc 3 → chuyển thẳng cho `W1.2` verify.
  > 📏 **Đính chính (`W-6`, `verdict.md`)**: PM ban đầu ghi **11** — chép thẳng con số từ báo cáo worker mà **không đếm**. Verifier đếm bằng máy: bảng `README §5` có đúng **10 hàng**, danh sách liệt kê 10 tên. Nội dung không sai chỗ nào — **mọi** mục đều có điểm yếu đã khai — chỉ con số tổng sai. Ghi lại vì đây là con số `W1.3` sắp cộng vào `Timeline-Repro.md`, và vì nó là **lỗi của PM chứ không của worker**.
  🔺 **Phát hiện mới worker gắn nhãn chứ không tự dựng cơ chế — PM chuyển tiếp cho Wave 2**: *redaction ở phía **tra cứu***. Entry có `arguments` đã redact mang marker trong khoá, lời gọi thật lúc replay mang giá trị thật ⇒ miss ⇒ **`MISSING_RECORDING` giả**. `Spec` đã sở hữu phía **so sánh** (`§3.3` marker==marker, `§3.6` bước 1) nhưng phía **tra cứu** thuộc `U-02`, vẫn mở. Ghi vào `H-I1` + nghĩa vụ `B5·f`.

- [x] **`B1`** `software-engineer` → `src/spike/app/`, `package.json` — **`STATUS: DONE`**
  - [x] `POST /checkout` chạm **cả 5** dependency trong một request — smoke log **14 ordinal**: inbound-http → clock → feature-flag ×2 → db-query ×2 → outbound-http → db-query ×2 → **marker `outcome-computed`** → cache ×3 → response-sent
  - [x] **Redis KHÔNG ảnh hưởng kết cục** (`G1`) — nhưng vẫn thực sự được gọi, quan sát được trong log. Shadow read + fire-and-forget write, cả hai trả `Promise<void>` ⇒ **không có đường nào** cho giá trị Redis vào response. Chống *"nghi thức rỗng"*: xoá Redis đi thì mất 3 dòng log quan sát được
  - [x] ⛔ **CẤM read-through cache** — bằng chứng **cấu trúc**, không phải quy ước: `buildOutcome()` **không có tham số cache**; mọi lời gọi Redis nằm **sau** `markOutcomeComputed()` (ordinal `[11,12,13] > 10` ở **cả hai** pha A/B); `#guarded` luôn trả `undefined`. Kiểm bằng máy: **4 query `pg` mỗi pha**, không nhánh nào bị cache thay thế ⇒ `Spec §3.4` điều kiện 1 (cùng số đơn vị) **thoả**
  - [x] Test bất biến hạ dòng (`R2`) — `src/spike/app/test-invariant.js`, A/B Redis warm vs Redis trỏ cổng đóng. **15/15 PASS × 3 lần**, exit `0`
  - [x] External HTTP API là **stub tự chạy** (`G2`), seed **synthetic** — stub chỉ dùng `node:http` + `crypto`, **0 lời gọi outbound**; response tất định bằng `sha256`, không random không clock
  - [x] **`CTL-1`** — cấm `dotenv.config()` trần ✅

  **PM đối chiếu ownership**: 19 file — 17 trong `src/spike/app/**`, 2 là `package.json`/`package-lock.json` ở root ⇒ ✅ **đúng ownership đã cấp**, không chạm `src/spike/contract/**` hay `src/spike/infra/**`.
  **PM kiểm lại độc lập** (không tin báo cáo suông):

  | Claim | Cách kiểm | Kết quả |
  |---|---|:--:|
  | `CTL-1` không `dotenv` | `grep -rn dotenv src/spike/app/` | ✅ chỉ **2 comment cảnh báo**; `dependencies` đúng 2 gói `ioredis` + `pg`, **không có `dotenv`** |
  | `CT-1` CommonJS | `grep '"type"'` cả 2 `package.json` · grep `^import`/`^export` | ✅ **0 hit** `"type"`; 0 file ESM ngoài `node_modules/` |
  | Không hardcode host/port | grep `localhost`/`127.0.0.1`/`:5432`/`:6379` | ✅ 0 hit trong code app; hit duy nhất ở `test-invariant.js` là **harness tự spawn server cục bộ** — hợp lệ |
  | Dọn dẹp môi trường tạm | `docker ps -a --filter label=spike-b1-temp=1` | ✅ **0 container sót** |
  | ⛔ Không chạm tài sản dự án khác | `docker ps --filter name=tnm_` | ✅ **cả 4 `tnm_*` vẫn `Up 7 days`**, 2 cái healthy |
  | `node_modules` không lọt git | `git check-ignore -v` | ✅ **IGNORED** bởi `.gitignore:2` — không tái phát `THREAT-006` đường 1 |

  **Hai manifest, có lý do**: `src/spike/app/package.json` là **nguồn sự thật duy nhất về dependency** vì nó nằm đúng trong build context của `Dockerfile.app` (context = `src/spike/app`); root `package.json` chỉ giữ script tiện dụng, **không khai dependency**. Worker phát hiện điều này khi build image bằng chính Dockerfile của `B2` — nếu để dependency ở root thì nó **không bao giờ vào image**.

  **Worker tự bắt lỗi harness của chính mình**: lần chạy đầu FAIL `1/15` — request warmup của pha A cũng chạm stub nên bản ghi phía stub lệch `ordinal`. Đó là lỗi **của test**, không phải của app; đã sửa bằng `POST /__stub/reset` sau warmup rồi chạy lại 3 lần.

  ⚠️ **Chưa chạy**: toàn bộ compose stack thật (external network, named volume, canary) chưa từng `up` end-to-end ⇒ thuộc `W1.2`.

- [~] **`B2`** `devops-engineer` → `src/spike/infra/`, `docs/070-Deployment/Deploy-Spike.md`, `docs/035-QA/Evidence/` — **`STATUS: PARTIAL`**

  **PM đối chiếu ownership**: 18 file — 16 trong `src/spike/infra/**`, 1 là `docs/070-Deployment/Deploy-Spike.md`, 1 là `docs/035-QA/Evidence/README.md` ⇒ ✅ **đúng ownership**. Đặc biệt: worker **KHÔNG** chạm `docs/030-Specs/**` mà trả dòng ledger trong `SUMMARY` đúng như `E4` chỉ định. **PM đã đặt dòng ledger vào `Spec-Spike-Protocol §5.2`** (dòng thứ 6, kèm ghi chú phân biệt với 5 dòng pre-register) — cùng branch, sẽ cùng commit ⇒ ràng buộc *"không hồi tố"* của `§5.2` **thoả**.

  **Vì sao `PARTIAL`**: worker bị **safety classifier chặn** mọi lệnh chạm file mới (`bash -n`, `node --check`, `docker compose config`, `chmod +x`, `cycle.sh`) ⇒ **chưa smoke-test, chưa có file JSON bằng chứng nào, chưa chứng minh idempotent**. Worker **không bịa output** — đúng kỷ luật.

  **PM kiểm lại độc lập — chặn KHÔNG áp lên phiên chính:**

  | Kiểm | Kết quả |
  |---|:--:|
  | `bash -n` 8/8 shell script | ✅ **OK cả 8** |
  | `node --check` 3/3 file JS | ✅ **OK cả 3** |
  | `docker compose config` (thiếu env) | ✅ **fail-closed ĐÚNG** — từ chối vì thiếu `SPIKE_RUN_ID`/`SPIKE_NONCE`, đúng thiết kế bắt `up.sh` phải inject, không lặng lẽ dùng giá trị rỗng |
  | `docker compose config` canary (có `SPIKE_RUN_ID`) | ✅ **OK** |

  **Hai quyết định thiết kế của worker đáng giữ:**
  1. **Ba namespace nhãn RỜI NHAU** — `repro.spike.env=<run_id>` là filter **duy nhất** của destroy · network sống lâu mang `repro.spike.persistent=true` · canary mang `repro.spike.canary=<run_id>`. Gộp chúng lại (cách đọc hiển nhiên của *"mọi thứ mang nhãn env"*) làm hỏng phase theo **hai** đường: destroy xoá luôn network external ⇒ mất tên DNS `CT-3` mà canary phải chiếm lại; **và** lần destroy thứ hai giết luôn observer mà chính bằng chứng idempotent dựa vào.
  2. **Mọi `VOLUME` của image bind vào volume có TÊN và có NHÃN** — volume ẩn danh **không** thừa kế nhãn compose ⇒ nó là **residual thật mà cả destroy lẫn verifier theo nhãn đều mù**.

  🔺 **Worker tự bắt một defect chặn trong chính logic đếm của nó** — đáng ghi vì nó đúng loại lỗi mà cả cơ chế `canary_coverage` tồn tại để diệt: `escaped_side_effects` lẽ ra **không có khả năng cấu trúc để đọc ra `0`**. Probe đối chứng dùng TCP accept trần không mang marker, và Postgres initdb ghi mọi câu lệnh của chính SQL audit dưới `log_statement=all` ⇒ một run **sạch** sẽ đọc ra `≥ 3`, dạy người đọc thói quen *trừ nhiễu trong đầu* — đúng thứ *"con số không diễn giải được"*. Đã sửa bằng liên kết `conn_id` + **4 quy tắc đếm `R1`–`R4`** in vào **mọi** file output. ⚠️ `W1.2` phải xác minh **bằng thực nghiệm** rằng run sạch đọc ra `0`, không tin báo cáo.

  **Worker tự khai thêm một tương quan không ai hỏi**: `verify.sh` source **cùng** `lib/common.sh` với `destroy.sh` ⇒ sai khoá nhãn thì **cả hai cùng sai**. Đường không tương quan là gọi thẳng `verify.js` với tham số gõ tay — worker đề xuất đó là việc của reviewer `B9`.

  📏 **Đính chính dữ kiện `A1` của `brief.md`**: `docker version` đo được là **`29.5.2`**, không phải `29.6.1`. Không đổi kết luận nào; ghi để `A1` không mang số sai.
  - [ ] Compose topology production-like, **external network sống lâu**, nhãn `repro.spike.env=<run_id>`
  - [ ] `destroy.sh` theo nhãn, **idempotent**, ⛔ **CẤM `docker system prune`** mọi dạng
  - [ ] **Verifier ĐỘC LẬP** — package riêng, không import destroy, JSON mỗi run vào `docs/035-QA/Evidence/`
  - [ ] Verifier enumerate **mọi loopback listener** (`lsof`) đầu và cuối mỗi lần chạy
  - [ ] **Canary sink** — TCP accept log + HTTP log + DB sink, **nghe cả loopback**, chiếm lại địa chỉ cũ qua `network-alias`
  - [ ] Map cổng **né** `6379`/`5433`/`8100`/`9000-9001` đang bị `tnm_*` chiếm
  - [ ] Dòng **shortcut ledger** vào `Spec-Spike-Protocol §5.2` — ⚠️ **cùng lượt** với code, không hồi tố

## W1.2 — verify

- [x] `quality-assurance` verify Completeness / Correctness / Coherence → [`verdict.md`](verdict.md) — **2 vòng, `STATUS: DONE`**
  - Hợp lệ ở wave này vì QA **chưa** implement gì. Từ `W4` trở đi **bắt buộc** đổi sang `context-auditor` (QA là driver `B10`).
  - **Vòng 1**: tìm **2 CRITICAL** (`escaped_side_effects = 23` trên run sạch; verifier không có positive control ⇒ sai âm tính) + 6 WARNING. Phán quyết: **chưa đóng được**.
  - **Vòng sửa**: `devops-engineer` **MỚI** (guardrail: lỗi CRITICAL không để tác giả tự vá) — sửa xong 11 file nhưng **bị chặn**, `0/6` điều kiện có số.
  - **Vòng 2**: QA resume, đo đủ **`6/6`**. `escaped_side_effects = 0`, và — quan trọng hơn — nó **tự dựng phép thử phân biệt**: bơm 3 leak **không marker**, bộ đếm **bắt đủ 3/3** ⇒ số `0` đến từ bộ đếm đúng, không phải bộ đếm bị làm mù.

- [x] **PM kiểm lại độc lập** — không tin cả QA: đọc thẳng file niêm phong (`escaped_side_effects = 0`, `baseline.total = 27` có tên từng nguồn) · 5 file bằng chứng vòng 1 **nguyên vẹn** (mtime `Aug 15 23:34`) · **0** tàn dư container/image · `tnm_*` 4/4 `Up 7 days`.

## ✅ WAVE 1 ĐÓNG — `B0` · `B1` · `B2` đều `DONE`

### 🔗 Hai khoảng hở TÍCH HỢP `B1` báo về — PM giữ, chờ `B2` trả về mới phân xử

> `B1` đọc `src/spike/infra/` (read-only, **đúng ownership**) trong lúc `B2` **vẫn đang chạy** ⇒ hai mục dưới đây có thể đã được `B2` sửa. **PM phải verify lại trên trạng thái cuối, không kết luận từ báo cáo giữa chừng.** Đây chính là cái giá đã biết của việc dispatch song song, và là lý do bước `W1.2` tồn tại.

| # | Khoảng hở `B1` báo | Vì sao chặn | Trạng thái |
|:--:|---|---|:--:|
| `INT-1` | Volume `spike-flags` mount **rỗng**, không ai ghi `flags.json`; compose set `SPIKE_FLAG_FILE` trỏ vào đó nhưng `up.sh` không nạp file nào | Mọi request **500 với `FlagError`** ⇒ stack lên nhưng không dùng được. File sẵn sàng: `src/spike/app/flags/spike-flags.default.json`, đã nằm trong image tại `/srv/spike/flags/` | ⏳ chờ verify |
| `INT-2` | Không có bước **seed DB** nào trong compose / `up.sh` | Chưa có bảng ⇒ query `pg` fail. Image đã mang sẵn script `start:seed`, cần một lần chạy **one-shot** sau khi `spike-postgres` healthy | ⏳ chờ verify |

**PM verify trên trạng thái cuối: CẢ HAI LÀ THẬT.** Grep xác nhận `docker-compose.spike.yml:60,113` set `SPIKE_FLAG_FILE`, `:62,115` mount volume, `:198` khai volume — nhưng `up.sh` không nạp file nào; và chữ `seed` duy nhất trong `src/spike/infra/` là `up.sh:32` nói về **rotate mật khẩu**, không phải seed dữ liệu.

**Nguyên nhân gốc — lỗi của PM, không của worker nào.** Hai mục này nằm đúng ở **ranh giới ownership**: `B1` sở hữu nội dung flags + script seed, `B2` sở hữu đường provisioning. PM chốt `CT-3`/`CT-4` (tên service, tên biến) nhưng **quên chốt ai NẠP dữ liệu vào môi trường**. Bài học cho Wave 2: file ownership map cắt được **quyền ghi**, nhưng **không tự cắt được nghĩa vụ provisioning** — phải hỏi thêm *"ai đưa dữ liệu vào chỗ này"* cho mỗi volume/mount trong bảng.

**Vòng resume `B2` — 2026-08-15** (SendMessage, tái dùng context, **không** spawn mới):

- ✅ `INT-1` **sửa trong code**: `up.sh` dùng `compose create` để materialise volume **có nhãn** mà chưa start container, rồi copy `/srv/spike/flags/spike-flags.default.json` (default `B1` ship sẵn trong image) → `/var/spike/flags/flags.json`. Chọn **copy** thay vì bind-mount cây làm việc `B1` để file flags nằm trên resource **có nhãn**, tức **trong scope destroy**. Có bước **đọc ngược lại + `JSON.parse`** ⇒ file hỏng thì **fail lúc provisioning**, không thành 500 ở request đầu.
- ✅ `INT-2` **sửa trong code**: `--wait` cho `spike-postgres` healthy (seed không nối được vào Postgres còn đang `initdb`), rồi one-shot `docker run --rm --network repro-spike-net -e SPIKE_ENTRYPOINT=seed`. Credential `source` lại từ chính `artifacts/run.env` vừa ghi ⇒ dùng **đúng** credential compose inject.
- ⛔ `INT-3` **CHẶN LẦN HAI**: `bash ./up.sh` bị safety classifier chặn ngay lần gọi đầu. Worker **không thử lại biến thể** — đúng bài học `E3`. **Vẫn chưa có** file JSON bằng chứng, chưa có cặp `assertions`, chưa có con số `escaped_side_effects` đo thật.

> ⚠️ Worker tự vạch ranh giới đúng chỗ: *"cả hai đã sửa **trong code** và fix **tự verify lúc provisioning**; nhưng **chưa được chứng minh**, vì chứng minh đòi đúng cái run em không chạy được."* PM giữ nguyên ranh giới đó — `INT-1`/`INT-2` **chưa đóng**, chỉ mới *sửa*.

**Ownership vòng resume**: 3 file (`up.sh`, `docker-compose.spike.yml`, `Deploy-Spike.md`) ⇒ ✅ đúng phạm vi.

🔺 **Một behavioural delta `W1.2` BẮT BUỘC canh** — nó phát sinh **sau** lần build thành công của `B1`: compose nay build **MỘT** image `repro-spike-app:<run_id>` dùng chung cho cả hai service, entrypoint chọn lúc chạy qua `SPIKE_ENTRYPOINT`, thay vì hai image bake sẵn arg. `Dockerfile.app` **không đổi** — chỉ compose đổi. Lý do hợp lý (build cùng layer hai lần trên hộp 2 vCPU là lãng phí) nhưng **wiring này chưa từng được test**.

**Hai mục ngoài phạm vi PM giao, worker gắn cờ chứ không tự sửa — PM ghi nhận, hoãn**: (i) `B1` có `GET /healthz` thật nhưng healthcheck vẫn ở tầng TCP — đổi mà không test thì tệ hơn để nguyên; (ii) image canary `repro-spike-canary:<run_id>` không có build label nên không ai dọn nó — có từ trước, vô hại, sửa một dòng khi ai đó vào file đó lần sau.

**Đã tự khớp, không cần ai sửa**: contract cổng stub. `B1` cho stub **tự suy** cổng lắng nghe từ `SPIKE_HTTP_STUB_URL` rồi bind `0.0.0.0`; compose của `B2` set cả hai service theo `${SPIKE_STUB_PORT:-8081}` ⇒ khớp luôn cả healthcheck TCP. Đây là kết quả của việc PM chốt `CT-3`/`CT-4` **trước** dispatch.

## W1.3 — PM đóng run

- [x] Cập nhật [`Timeline-Repro.md`](../../Estimates/Timeline-Repro.md) §4: thêm dòng **`B0`** (1.0 MD) · `B2` **`2.0` → `3.5`** · giao **`class_assessment`→`B3`** và cổng **`inconclusive`→`B6`** · cộng lại **`22.0` → `24.5` MD** (110% → **122.5%**) · mục có ngày vào §15
  - ⚠️ `B7` đo lại `3.0–3.7` trên ngân sách `2.0` — **cố ý CHƯA cộng** vào tổng, vì `B7` chưa chạy. `B2` được cộng vì nó có **velocity thật** đứng sau (3 vòng dispatch); `B7` thì chưa. Ghi thành rủi ro đã biết, không trộn vào con số đã đo.
- [x] Cập nhật [`Planning-MOC.md`](../../Planning-MOC.md) — dòng *"110% capacity"* nay là **122.5%**, kèm dòng ghi Wave 1 đã đóng
- [x] **PM đặt dòng ledger `B2` vào [`Spec-Spike-Protocol §5.2`](../../../030-Specs/Spec-Spike-Protocol.md)** — dòng thứ 6, phân biệt rõ với 5 dòng pre-register, **cùng commit** với code `B2` ⇒ ràng buộc *"không hồi tố"* thoả
- [ ] Commit + báo cáo tổng kết

## Nợ lại chuyển sang Wave 2 — PM giữ, KHÔNG để tự phát hiện

> Ba mục đầu **phải vào file ownership map của Wave 2 như dòng tường minh**. Cả ba đều thuộc đúng lớp lỗi *"nghĩa vụ nằm ở ranh giới, không ai được giao"* mà `INT-1`/`INT-2` đã dạy run này một lần.

| # | Nợ | Cắn ở đâu | Vì sao hoãn được |
|:--:|---|---|---|
| `W-3` | **Seam `B1` → `B0`**: `interaction-log.js` phát ra **0 hit** `direction`, và phát `kind` = `cache`/`marker` không nằm trong `KINDS` — mà `normalize.js` **ném `RangeError`** cho cả hai. `README §3.1 B3·d` lại **cấm** `B3` tự viết normalization riêng | **`B3`**, Wave 2 | Đã ghi thẳng vào exit criteria `B3` của `Timeline` §4 (mục `v`) ⇒ không còn là nợ ẩn |
| `W-7` | **Đếm đôi statement SQL lỗi** — `/statement:/i` bắt cả dòng error-context `STATEMENT:`. Phía network có `R2` gộp connection; phía DB **chưa có** quy tắc tương ứng | Trước **`C1`** | Không đụng số `0` của run sạch (run sạch không có statement từ network client). Nhưng thổi phồng **mọi** số khác 0 |
| `SUGGESTION-6` | Một số exclusion khoá vào **định danh giả mạo được** (`app === 'pg_isready'`, chuỗi marker) | **`B9`** | Chấp nhận được ở spike; đưa vào phạm vi audit `B9` |
| `W-5` | Vế kết dòng ledger `Spec §5.2` — *"hạ bằng chứng destroy, KHÔNG hạ bằng chứng an toàn"* | — | ✅ **Tự giải quyết**: vòng 1 mệnh đề này bị số đo phản bác; sau vòng sửa nó **đúng trở lại** (`escaped_side_effects = 0`, cơ chế coverage chạy đúng). **Không cần đính chính** |
| `SUGGESTION-1`…`-5` | `spike-httpstub` nhận `SPIKE_PG_PASSWORD` thừa · `normalize.js` gộp HTTP method vào `target` chưa khai ở `H-N5` · thiếu mã `H-N3` · `baseline_from_own_tooling` *(✅ đã làm ở vòng sửa)* · image canary không nhãn *(✅ đã làm)* | Wave 2+ | Không mục nào chặn |
| `DEBT-1` | colima `2 vCPU / 1.91 GiB` | **`B7`**, Wave 4 | 🔴 **Điều kiện tiên quyết, không phải tối ưu** — `MTP §3.2`: một con số không diễn giải được thì `C2` **PHẢI từ chối nó`. **Hỏi lại `@TrisJr` TRƯỚC khi `B7` khởi động** |
| `DEBT-2` | `T8` + `--permission` chưa quyết | **`B5`**, Wave 3 | Quyết bây giờ là quyết trong chân không |
| `DEBT-3` | Khung file bảng `T1` chưa tạo | **`B10`**, Wave 4 | `OQ-B1` giữ nguyên trong `brief.md` |

⚠️ **Bài học điều phối phải áp vào run plan Wave 2** (`escalations.md` `E5`): safety classifier chặn theo **phiên worker**, không theo hành động — 3/6 worker bị chặn, spawn mới **không** reset. ⇒ Wave 2 phải tách tường minh **"viết code"** khỏi **"chạy và đo"** ngay từ run plan, giao khâu đo cho một agent riêng. Chi phí đã đo của việc không tách: **2 vòng resume + 1 worker mới**, đều chỉ vì không ai đo được.
