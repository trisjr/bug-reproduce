---
id: PM-RUN-PLAN-2026-08-15-P0B
type: reference
status: draft
created: 2026-08-15
---

# Run Plan: 2026-08-15-p0b-spike-build

**Lane** `code` · **Tier** `T2` (2/4, chọn thấp do phân vân — điều kiện escalate ghi tại [`brief.md`](brief.md))

---

## 0. Điều PM phải nói trước mọi thứ khác — phạm vi thật LỚN HƠN ngân sách

Ba lens read-only tìm ra **bốn hạng mục chưa từng được đếm**, cộng hai ước lượng vượt. Đây không phải scope creep — đây là phạm vi **vốn đã tồn tại** trong exit criteria nhưng chưa ai cộng vào tổng.

| Hạng mục | MD `Timeline` cấp | MD đo lại | Chênh | Nguồn |
|---|:--:|:--:|:--:|---|
| `B2` — mô phỏng cục bộ | 2.0 | **3.0–3.5** | **+1.0–1.5** | verifier độc lập, DB sink canary, chiếm lại địa chỉ sau destroy — ba thứ mà 2.0 MD giả định không tồn tại |
| `B7` — harness | 2.0 | **3.0–3.7** | **+1.0–1.7** | *"6 metric"* thật ra là **≈60+ scalar**; `B7-12` composite là trường riêng; load generator phải tự viết (`k6`/`autocannon`/`wrk`/`hey` **đều vắng mặt**) |
| 🆕 **`B0`** — schema artifact spike + module `identity()`/`normalize()` dùng chung | **0** | **0.5–1.0** | **+0.5–1.0** | `B3`/`B5`/`B6` có **ba** consumer chung một hàm định danh (`R3`); không có `B0` thì hoặc chạy tuần tự toàn bộ, hoặc trả giá tích hợp ở `B6` |
| 🆕 **`class_assessment` + cổng `inconclusive`** | **0** | **~0.5** | **+0.5** | `Spec §2.6`/`§3.5` **bắt buộc**; `Template` **đã có ô để in**; nhưng cả hai chuỗi xuất hiện **0 lần** trong `Timeline` và **0 lần** trong `MTP` |

**⇒ `P0-B` thật: 22.0 → 25.0–26.7 MD trên capacity `W4`–`W7` = 20 MD ⇒ 125–134%.** Trước đó đã là **110% không đệm**, và đệm duy nhất của Phase 0 (`P0-C`, 30%) **đã có chủ**.

> Đây là thông tin PM **bắt buộc** phải đưa lên trước khi anh duyệt, không phải thứ để phát hiện ở `W6`. `TL-r1` đã khai: mọi MD ở đây là phán đoán chuyên môn không có velocity đứng sau — và đây là lần đầu có người **đo lại bằng máy thật**.

---

## 1. Phát hiện hội tụ — ba lens, một cơ chế hỏng

Ba lens đi ba đường khác nhau và **cùng chạm một chỗ**. Tín hiệu mạnh, không phải trùng lặp.

| Lens | Đường vào |
|---|---|
| `security-auditor` | `BS-2` — egress tới địa chỉ **ngoài** tập canary phủ. `T8` chỉ fail *có bằng chứng* nếu `E1` (remap host-cũ ở **tầng OS**) + `E2` (fixture bắn vào **đích canary phủ**) |
| `architect` | `L2` tầng runtime **mù** với `child_process`. Node v22 `--permission` **đóng được** `T8` (đo thật: `ERR_ACCESS_DENIED`) nhưng **không có `--allow-net`** ⇒ không chạm `T12` |
| `devops-engineer` | Canary **không bind được** `6379`/`5433` vì `tnm_redis`/`tnm_postgres` của **dự án khác** đang giữ ⇒ WRITE rò rỉ đáp xuống DB thật |

> 🔴 **Kết luận chung: `escaped_side_effects = 0` có thể là một số GIẢ, và không có gì trong thiết kế hiện tại phát hiện được điều đó.**

**PM phân xử — gộp ba phát hiện thành MỘT điều kiện tiên quyết, đặt tên `canary_coverage`:**

Một run chỉ được đọc `escaped_side_effects` khi chứng minh được canary **thực sự chiếm đủ** địa chỉ nó cần:
1. Một `curl <host-cũ>` **đối chứng**, chạy từ trong container replay, **ngoài** mọi test, **phải** xuất hiện trong canary log (`E1`).
2. Fixture `T8` bắn vào một đích **thuộc tập canary phủ**, và điều đó ghi vào chính fixture (`E2`).
3. Verifier độc lập enumerate **mọi loopback listener** (`lsof -nP -iTCP -sTCP:LISTEN`) tại **đầu và cuối mỗi scenario** — biến điểm mù `T12` thành **bằng chứng có ngày tháng**, chi phí ≈ 0.
4. Thiếu bất kỳ vế nào ⇒ `canary_coverage: incomplete` ⇒ **fail-closed** theo `Spec §4.6` (*"bằng chứng thiếu ⇒ tính là KHÔNG đạt"*).
5. `B7` in `canary_coverage` **cạnh** `escaped_side_effects` trong cùng output máy đọc được.

Không gộp thì ba lens sinh ra ba dòng exit criteria rời rạc, và một implementer sẽ thoả **từng dòng** mà vẫn để lọt **đúng chế độ hỏng cả ba cùng chỉ tới**.

---

## 2. Phases

Sóng, cắt theo đồ thị `Depends` — không phải theo ý PM.

### Wave 1 — nền móng (phạm vi PM đề xuất cho run này)

| # | Phase | Agent | Song song? | Input | Output |
|---|---|---|---|---|---|
| `W1.0` | **`CTL-2`** — `.gitignore` phủ artifact spike, **giữ `test/spike/manifests/` KHÔNG ignore** | **PM** | — | finding security `CTL-2` + finding devops (đường bằng chứng né ignore) | `.gitignore` |
| `W1.1a` | **`B0`** 🆕 — schema artifact spike + `identity()`/`normalize()`, nhãn `HYPOTHESIS` | `architect` | ✅ **cả ba song song** | `Spec §3.1`–`§3.2` (6 field + `U0`/`U∞`), `MTP §8.1` | `src/spike/contract/` |
| `W1.1b` | **`B1`** — test app `POST /checkout`, 5 dependency, **cấm read-through cache** | `software-engineer` | ✅ | `Timeline B1`, `G1`, `G2`, `R2` | `src/spike/app/`, `package.json` |
| `W1.1c` | **`B2`** — môi trường + destroy + verifier độc lập + canary sink + dòng ledger | `devops-engineer` | ✅ | `Timeline B2`, `MTP §5.2`, dòng ledger đã soạn | `src/spike/infra/`, `docs/070-Deployment/Deploy-Spike.md`, `docs/035-QA/Evidence/` |
| `W1.2` | **Verify** — Completeness / Correctness / Coherence | `quality-assurance` | — | exit criteria `B0`/`B1`/`B2` | `verdict.md` |

> **Vì sao ba task này dispatch được SONG SONG dù `B0` là contract**: `B1` là test app — nó **không tiêu thụ** module `identity()`. Ba consumer của `B0` là `B3`/`B5`/`B6`, đều nằm ở Wave 2–3. ⇒ Ràng buộc thật là **`B0` trước `B3`**, không phải *`B0` trước mọi thứ*. Ownership ba tập rời nhau tuyệt đối.

**Vì sao đúng ba task này:**
- `B1` là **nút thắt tuyệt đối** — 6/10 task nằm sau nó.
- `B2` là nhánh **duy nhất** chạy song song được ngay từ đầu (`Depends: GA`).
- `B0` phải đi **trước** cả hai, vì nó là thứ **duy nhất** cho phép `B3`–`B6` về sau không phải chạy tuần tự cứng.
- Ba task này cho **số liệu velocity thật đầu tiên** của dự án — thứ `TL-r1` gọi là bắt buộc phải có trước khi tin bất kỳ ước lượng nào còn lại.

### Wave 2–4 — nếu anh chọn chạy hết `P0-B` trong run này

| Wave | Task | Agent | Song song |
|---|---|---|---|
| `W2` | `B3` → `B4` (kèm ghi khối `class_assessment`) | `software-engineer` | ❌ tuần tự — cùng chuỗi contract |
| `W3` | `B5` (kèm `canary_coverage` `E1`/`E2`) → `B6` (kèm cổng `inconclusive`) | `software-engineer` | ❌ tuần tự |
| `W3'` | `B8` fixture 10 scenario | `software-engineer` #2 | ✅ song song `W3` — ownership rời (`test/spike/scenarios/`) |
| `W4` | `B7` harness · `B9` security review · `B10` manifest + niêm phong | `devops-engineer` · `security-auditor` · `quality-assurance` | ✅ ba ownership rời nhau |
| `W4.v` | Verify | `context-auditor` ⚠️ **KHÔNG dùng `quality-assurance`** — QA là driver của `B10` | — |

---

## 3. File ownership map

> Các tập PHẢI rời nhau tuyệt đối. `tasks.md` thuộc về PM, không cấp cho worker nào.

| Agent | Sở hữu (được ghi) | Cấm chạm |
|---|---|---|
| **PM** (chính em) | `.gitignore` · `docs/010-Planning/pm-runs/2026-08-15-p0b-spike-build/**` · `tasks.md` · mọi file `docs/` không liệt kê ở dưới | `src/**`, `test/**` |
| `architect` (`B0`) | `src/spike/contract/**` | mọi thứ khác |
| `software-engineer` (`B1`) | `src/spike/app/**` · `package.json` | `src/spike/infra/**`, `src/spike/contract/**`, `docs/**`, `.gitignore` |
| `devops-engineer` (`B2`) | `src/spike/infra/**` · `docs/070-Deployment/Deploy-Spike.md` · `docs/035-QA/Evidence/**` | `src/spike/app/**`, `package.json`, `.gitignore`, `docs/030-Specs/**` |
| *(W2)* `software-engineer` (`B3`,`B4`) | `src/spike/recorder/**` · `src/spike/capsule/**` | — |
| *(W3)* `software-engineer` (`B5`,`B6`) | `src/spike/replay/**` · `src/spike/verify/**` | — |
| *(W3')* `software-engineer` #2 (`B8`) | `test/spike/scenarios/**` | `test/spike/manifests/**`, `test/spike/bench/**` |
| *(W4)* `devops-engineer` (`B7`) | `src/spike/bench/**` · `test/spike/bench/**` | ⚠️ **KHÔNG** phải `test/spike/**` — `scenarios/` và `manifests/` có chủ khác |
| *(W4)* `security-auditor` (`B9`) | *(read-only)* — PM ghi `findings/security-auditor-b9.md` | tất cả |
| *(W4)* `quality-assurance` (`B10`) | `test/spike/manifests/**` | `test/spike/scenarios/**`, `test/spike/bench/**` |

⚠️ **Va chạm đã cắt tường minh**: `Timeline` cấp `B7` cả `test/spike/`, nhưng `B8` giữ `test/spike/scenarios/` và `B10` giữ `test/spike/manifests/`. Cắt lại: `B7` = `src/spike/bench/` + `test/spike/bench/`. Không cắt thì ba worker `W4` **không** được chạy song song.

⚠️ **`package.json` thuộc `B1`.** `B2` hay `B7` cần thêm dependency ⇒ **báo `BLOCKED`**, PM quyết và cấp qua worker mới. Đây là điểm va chạm duy nhất còn lại của toàn phase.

---

## 4. Artifact sẽ tạo/sửa ngoài run-state

**Wave 1:**
- `.gitignore` — sửa: phủ `src/spike/**/capsules/`, `src/spike/**/artifacts/`, `*.capsule`, canary log; **giữ `test/spike/manifests/` KHÔNG ignore**; đường bằng chứng `docs/035-QA/Evidence/*.json` **không** bị nuốt bởi pattern rộng
- `src/spike/contract/` — 🆕 schema + `identity()`/`normalize()`, nhãn `HYPOTHESIS`
- `src/spike/app/` + `package.json` — test app 5 dependency
- `src/spike/infra/` — compose topology, `destroy.sh`, verifier độc lập, canary sink
- `docs/070-Deployment/Deploy-Spike.md` — mới
- `docs/035-QA/Evidence/` — mới, chứa JSON bằng chứng destroy
- `docs/030-Specs/Spec-Spike-Protocol.md` §5.2 — **thêm một dòng ledger** cho `B2` mô phỏng cục bộ. ⚠️ Đây là file `approved`; sửa **chỉ** ở bảng ledger, là hành vi **được chính `§5.2` yêu cầu** (*"ghi ngay lúc phát sinh — cùng PR với đoạn code bỏ qua requirement"*), **không** phải đàm phán lại contract `Gate A`
- 🔴 `docs/010-Planning/Estimates/Timeline-Repro.md` — **bắt buộc nếu gate duyệt `B0` và hai hạng mục orphan**: thêm dòng task `B0` vào bảng §4, giao `class_assessment` cho `B3` và cổng `inconclusive` cho `B6` trong exit criteria, cộng lại tổng MD, và ghi một mục có ngày vào §15 Ghi chú lịch sử. **Đây chính xác là quy ước repo đã dùng cho `B10`** — duyệt `B0` mà không ghi vào `Timeline` là đúng thứ trôi phạm vi im lặng mà bộ tài liệu này tồn tại để chống
- 🔴 `docs/010-Planning/Planning-MOC.md` — dòng *"`P0-B` chạy ở 110% capacity"* thành **cũ** ngay khi `Timeline` cộng lại. Sửa kèm, cùng lượt

**Wave 2–4 (nếu duyệt):** `src/spike/{recorder,capsule,replay,verify,bench}/`, `test/spike/{scenarios,manifests,bench}/`, `docs/035-QA/Reports/Report-Spike-Phase-0.md` (khung + `T1` điền từ giá trị đóng băng `Gate A`).

---

## 5. Assumptions PM đang đi theo

| # | Assumption | Sai thì hỏng ở đâu |
|---|---|---|
| `AS-1` | `B2` chạy **mô phỏng cục bộ**, và điều đó được khai bằng **một dòng shortcut ledger** — không phải im lặng | Không khai ⇒ `B9` không có gì để xác minh, và `C4` phát biểu quá tay về bằng chứng destroy |
| `AS-2` | Bằng chứng destroy cục bộ hạ giá trị của **bằng chứng destroy**, **KHÔNG** hạ **bằng chứng an toàn** (`escaped_side_effects` lấy nguồn từ canary, canary hiện thực đầy đủ) | Gộp hai thứ ⇒ `C4` hạ thấp cả hai, mất một kết luận vốn còn giá trị |
| `AS-3` | `T8` + `--permission` là quyết định của `@TrisJr`, **hoãn tới khi `B5` bắt đầu** — không thuộc Wave 1 | Quyết sớm mà chưa có `B5` ⇒ quyết trong chân không |
| `AS-4` | `B10` **chưa** chạy ở Wave 1 ⇒ quyền commit **chưa** chặn Wave 1, nhưng vẫn phải chốt trước khi tới `B10` | Tới `B10` mới hỏi ⇒ `B10` treo, và `C1` bị chặn theo |
| `AS-5` | Verify Wave 1 dùng `quality-assurance` là **hợp lệ** vì QA chưa implement gì ở wave này. Từ `W4` trở đi **bắt buộc** đổi sang `context-auditor` | Dùng QA verify `B10` ⇒ verify bởi chính người vừa làm, nghi thức rỗng |

---

## 6. Gate

- **Trình ngày**: 2026-08-15
- **Kết quả**: ✅ **DUYỆT** — `@TrisJr`, 2026-08-15
- **Bốn quyết định**:

| # | Câu hỏi | Quyết định |
|---|---|---|
| `G-1` | Phạm vi run | **Wave 1 rồi đóng run** — `B0` + `B1` + `B2` song song, verify, đóng. Wave 2–4 chạy bằng **run mới + gate mới**, với ước lượng đã hiệu chỉnh bằng velocity thật của Wave 1 |
| `G-2` | Môi trường `B2` | **Mô phỏng cục bộ + một dòng shortcut ledger `§5.2`**. Vế (c) cách ly IAM và nửa `revoke/rotate` của vế (d) được khai là **bỏ qua có ý thức**, không im lặng |
| `G-3` | Điều kiện máy | ✅ **Duyệt `docker stop` tạm 4 container `tnm_*`** — nhưng **cắn ở `B5`/`C1`, KHÔNG phải Wave 1** ⇒ **không thực thi trong run này**, sẽ xác nhận lại đúng lúc.<br>❌ **Nâng colima KHÔNG được chọn** — xem `DEBT-1` |
| `G-4` | Quyền git | **Tạo branch `spike/p0b-wave1` TRƯỚC khi dispatch, commit code Wave 1 + run-state lên đó**, message một dòng, không Co-authored. Con dấu niêm phong `B10` vẫn là escalation **riêng** về sau |

- **Nợ có ý thức phát sinh từ gate**:

| # | Nợ | Cắn ở đâu | Vì sao chấp nhận được bây giờ |
|---|---|---|---|
| `DEBT-1` | **colima giữ nguyên 2 vCPU / 1.91 GiB** (host có 8/16) | **`B7`, Wave 4** | Wave 1 không chạy phép đo nào cần P95/P99. Nhưng đây là **điều kiện tiên quyết, không phải tối ưu** — `MTP §3.2` nói thẳng một con số không diễn giải được thì **`C2` PHẢI từ chối nó**. ⇒ **Phải hỏi lại trước khi `B7` khởi động**; không có nó thì `B7` sinh ra số vô giá trị và mất luôn 3.0 MD của `C1` |
| `DEBT-2` | `T8` + `--permission` chưa quyết | `B5`, Wave 3 | Quyết bây giờ là quyết trong chân không — `B5` chưa tồn tại |
| `DEBT-3` | Khung file cho bảng `T1` chưa tạo | `B10`, Wave 4 | `B10` không thuộc Wave 1. `OQ-B1` giữ nguyên trong `brief.md` |
