---
id: PM-TASKS-2026-08-16-P0B-W24
type: reference
status: draft
created: 2026-08-16
---

# Tasks: 2026-08-16-p0b-wave2-4 (Wave 2)

> 🔒 **File này do PM độc quyền tick.** Worker báo trong `FILES_TOUCHED` + `SUMMARY`; PM đối chiếu với ownership rồi mới tick.

**Gate**: ✅ DUYỆT 2026-08-16 · **Phạm vi**: Wave 2 (`G-1`) · **Branch**: `spike/p0b-wave2` *(⚠️ **chưa tạo được**)*

> 🔴 **TRẠNG THÁI: RUN DỪNG TRƯỚC KHI DISPATCH.** Safety classifier chặn toàn bộ `Bash` và dispatch của phiên PM — xem [`escalations.md §E4`](escalations.md). **Chưa có một dòng code Wave 2 nào.** Mọi ô dưới đây còn trống là **chưa làm**, không phải làm dở.
>
> **Phần đã xong**: toàn bộ run-state + ripple `G-3` vào `Timeline-Repro.md` và `Planning-MOC.md` *(chưa commit)*.
> **Việc đầu tiên của phiên sau**: tạo branch, commit run-state + ripple, rồi dispatch **Wave 2.1** (3 worker song song) theo đúng toàn văn dưới đây.

---

## Wave 2.1 — nền móng (3 worker song song)

### `B0'` — mở rộng contract · `architect` · 0.8 MD · `src/spike/contract/**`

- [ ] Thêm 3 `kind` còn thiếu của 8 nhóm capture §18: `stack-trace`, `git-commit`, `runtime-metadata` *(hiện cả ba đều ném `RangeError`)*
- [ ] Thêm **lớp cờ drift** vào schema — `Spec §3.6` bước 3 + `MTP:527` đòi *"giá trị hai bên (capsule vs local)"* cho Git commit · runtime · dependency · schema version
- [ ] Thêm con trỏ **commit hash manifest `B10`** vào artifact *(nay chỉ có `scenarioId`)*
- [ ] Hàm thuần **`directionOf(kind, target)`** — `B3` và `B5` cùng gọi, không ai tự derive (`D-3`)
- [ ] ⛔ **Mở rộng, KHÔNG đổi signature** đang có — `B1`/`B2` Wave 1 không được phải sửa theo (`AS-1`)
- [ ] `self-check.js` phủ hết phần mới, vẫn zero-dependency

### `S-1` — seam `B1`/`B2` · `software-engineer` · 0.8 MD · `src/spike/app/**` + `docker-compose.spike.yml`

- [ ] `Δ1` seam tiêm clock trong `readClock` (`clock.js:27-36` nay hardcode `Date.now()`)
- [ ] `Δ2` đọc clock **≥ 2 lần**/request (`checkout.js:133` nay 1 lần) — điều kiện để hệ quả `§3.8` (`t2 − t1`) kiểm được
- [ ] `Δ3` fault injection **tất định** cho stub (`stub/server.js:86-133` nay chỉ có `/healthz`, `/__stub/calls`, `/__stub/reset`)
- [ ] `Δ4` một giá trị ngẫu nhiên **chạm kết cục** (`server.js:85 randomUUID` nay không vào `buildOutcome`)
- [ ] `Δ5` một đuôi async **không đóng** trong cửa sổ request (nay `await` hết) — khớp giả định đóng băng `Spec:730`
- [ ] `Δ6` nhánh 404 phát `outcome-computed` + `response-sent` (nay `return` trước cả hai ⇒ dãy không có neo `U∞`)
- [ ] Instrument **latency in-process** phía app (`MTP §3.1:187` bắt đo tại endpoint, tầng ứng dụng)
- [ ] Công tắc recorder **OFF/ON trước `require`** — mở rộng `SPIKE_ENTRYPOINT`; cờ runtime **sau** `require` KHÔNG thoả `MTP §3.1:186`
- [ ] Công tắc tắt `InteractionLog` (`interaction-log.js:60` nay luôn ghi ~10 dòng/request, bơm phồng baseline)
- [ ] ⚠️ Biến env mới **phải** vào `APP_ENV_KEYS` **và** `docker-compose.spike.yml` cùng lúc (`CT-4` fail-fast)
- [ ] ⛔ `CTL-1` giữ nguyên — không `dotenv`

### `INF-1` — nợ hạ tầng + `L2` · `devops-engineer` · 0.6 MD · `src/spike/infra/**` *(trừ `docker-compose.spike.yml`)*

- [ ] **`W-7`**: `coverage.js:210` `/statement:/i` → `/LOG:\s+statement:/` + quy tắc **`R7` "một statement đếm một lần"** + 2 test hồi quy. ⛔ **Không** lọc bỏ dòng `STATEMENT:` — giữ cho detail/audit
- [ ] Metric **`loopback_listeners_not_covered_by_canary`** in **cạnh** `escaped_side_effects` *(hiện đo được = 28)*
- [ ] **Positive control loopback**: dial `127.0.0.1:16379` từ trong container, assert vào canary log
- [ ] Mạng thứ hai **`--internal`** cho `B5` — chặn `T8` ở tầng netns **mà không làm mù canary**
- [ ] `cap_drop: [ALL]` + `no-new-privileges` *(2 dòng, không đổi metric)*
- [ ] 🆕 **`D-12`** cổng tài nguyên fail-closed: `memory.peak`, `memory.events.oom_kill`, `cpu.stat.nr_throttled` + probe **4/4 `tnm_*` `running`**. Cảnh báo tại `memory.peak ≥ 0.9 × mem_limit`
- [ ] `W-3` ghi chú vào README hạ tầng
- [ ] ⛔ **Không** chạm `docker-compose.spike.yml` (của `S-1`), **không** chạm `docs/035-QA/Evidence/`

---

## Wave 2.2 — capture & fixture (3 worker song song, sau 2.1)

### `B3` — recorder · `software-engineer` · 4.0 MD · `src/spike/recorder/**`

- [ ] Capture đủ **8 nhóm** §18 từ một execution thật
- [ ] `row_count` · `byte_size` · `consumed_by_replay` cho **MỌI** DB query result
- [ ] Chạy **KHÔNG CAP** (`B3-6`, `MTP:556`) — cap bật ⇒ phân bố `SEC-008` bị kiểm duyệt **không khôi phục được**
- [ ] Ghi khối **`class_assessment`** theo **`D-9`**: `S1`–`S6` tại capture kèm `mechanism`; **`S7` KHÔNG tham gia `inClass`**
- [ ] Dùng `identity()`/`normalize()`/`directionOf()` của `B0'` — ⛔ **cấm tự viết normalization**
- [ ] ⛔ **CẤM đọc `interaction-log.js`** (`D-3`) — đọc là thừa hưởng normalization thứ hai của `B1`
- [ ] Chốt **`S1`** cơ chế OFF/ON · **`S2`** nhãn path `P-discard`/`P-persist` per-request · **`S3`** định nghĩa *failed execution* (402 decline có kích `P-persist` không?)
- [ ] Overhead được đo (không cần đạt ngưỡng)

### `B4` — capsule writer · `software-engineer` #2 · 1.5 MD · `src/spike/capsule/**`

- [ ] Artifact **tự chứa**, mở được sau khi môi trường gốc bị destroy
- [ ] 🆕 **`D-8`**: từ chối ghi nếu out-dir không chứa `/capsules/` và filename không kết thúc `.capsule` *(`.gitignore:61` thiếu chữ `s` ⇒ capsule đi thẳng vào git)*
- [ ] ⛔ **KHÔNG** phải capsule format v1

### `B8` — fixture 10 scenario + `M-5` · `software-engineer` #3 · 2.5 MD · `test/spike/scenarios/**`

- [ ] 🔺 **BƯỚC 1 — viết 10 bộ `chữ ký lỗi` + `verdict kỳ vọng`, rồi DỪNG.** PM trình `@TrisJr` duyệt (`G-4`)
- [ ] ⏸️ *(chờ duyệt)*
- [ ] **BƯỚC 2** — 10 fixture tái tạo được lỗi trên môi trường production-like, `K/K = 3/3`
- [ ] `SC-7`/`SC-9`/`SC-10` không tái tạo xác định được ⇒ **ghi là phát hiện hợp lệ**, không phải thất bại *(đã ở observation set ⇒ denominator không đổi)*
- [ ] ⚠️ `M-1` hỏng ở `{1,2,3,4,5,6,8}` là **con đường co ①** ⇒ `D` co ⇒ `X5` hạ ngưỡng. Báo `BLOCKED` nếu gặp
- [ ] Bàn giao **5 input cho `B10`**: kiểm kê input nhân quả từng fixture · `M-5` · container mới hay dùng lại giữa `K=3` · tập env var chính xác · có buộc `S-1` mở thêm seam không
- [ ] ⛔ Dữ liệu **synthetic** (`G2`). ⛔ Không spawn app ngoài compose (phá *"production-like"*)

---

## Wave 2.v — verify

- [ ] `context-auditor` — Completeness / Correctness / Coherence ⚠️ **KHÔNG dùng `quality-assurance`** (driver `B10`, `AS-5`)

---

## PM — sau khi verdict sạch

- [ ] `MTP §6.2` — đính chính sàn manifest thành **5 mục** (`D-4`)
- [ ] `Spec §5.2` — **dòng ledger thứ 7**: disclosure inventory host trong `Evidence/` + stack trace absolute path
- [ ] `Timeline §4` — thêm `B0'`/`S-1`/`INF-1`, tách `B7a`/`B7b`, cộng lại tổng, **dời `GATE-06`** (`G-3`), mục §15 có ngày
- [ ] `Planning-MOC` — dòng 122.5% thành cũ
- [ ] Commit trên `spike/p0b-wave2`, message một dòng, không Co-authored

---

## Bảng nợ mang sang Wave 3–4

| # | Nợ | Cắn ở đâu |
|:--:|---|---|
| `DEBT-1` | colima `2 vCPU / 1.913 GiB / Swap 0` — **chưa đóng**, hỏi lại trước `B7` | `B7` |
| `DEBT-3` | File tiền-đăng-ký `T1` (`D-7`) — PM tạo trước khi dispatch `B10` | `B10` |
| `DEBT-4` | `M-5` là điểm dừng giữa run; `@TrisJr` không duyệt kịp ⇒ `B8` treo, `B10` treo theo | run này |
| `D-2` | `T8-a`/`T8-b` — ghi vào exit criteria `B5` | `B5` |
| `D-5` | `B10` viết **11** file (thêm `SC-11`) | `B10` |
| `D-6` | `B7` tách `B7a`/`B7b` | `B7` |
| `SC-2`/`SC-8` | **trùng trigger** — hai ô denominator, một cơ chế. Cần quyết ở `B8` hay Wave 3 | `B8` |
