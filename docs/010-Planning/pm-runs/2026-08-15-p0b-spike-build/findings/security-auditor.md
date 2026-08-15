# Findings — security-auditor

> Lens **read-only trước gate** (KHÔNG phải task `B9` — `B9` cần code tồn tại, `Depends: B4`).
> `FILES_TOUCHED: none` — đã đối chiếu, đúng ownership đã cấp.

## Kết luận của worker

**Q1 — `B3` chạy KHÔNG CAP.** Miễn trừ **XÁC NHẬN** cho dữ liệu seed: [`MTP §4.2`](../../../../035-QA/Test-Plans/MTP-Spike-Phase-0.md) ghi *"Capture không-cap chỉ chấp nhận được vì dữ liệu là synthetic"*, và chuỗi 4 bước của `THREAT-005` không tạo tổn hại khi cái bị mở rộng là dữ liệu do `B8` tự viết.

**Nhưng bác bỏ phần phụ** — và đây là phần mới so với lens của run trước: chữ *"synthetic"* trong `G2` phủ **dữ liệu seed / nội dung**, nó **không** phủ **môi trường process** của máy chạy spike. Ba dòng ghép lại thành khoảng hở:

| Nguồn | Nội dung |
|---|---|
| `Timeline §4` dòng `B3` | capture 8 nhóm §18, **trong đó có `runtime metadata`** |
| `Spec-Spike-Protocol §5.2` | `SEC-001` + `SEC-011` **bị bỏ qua có ý thức** — *"Không có redaction engine trong `P0-B`"* |
| Threat model `A-05` | credential nằm trong *"mật khẩu DB trong environment"* |

⇒ Recorder không cap + không redact + capture runtime metadata, chạy trên máy có secret thật trong `process.env`, sẽ ghi secret thật vào artifact **dù 100% seed là synthetic**. Không tài liệu nào trong `P0-B` đóng vế này.

**Nếu ai đó chạy recorder lên dữ liệu không-synthetic: không có gì trong thiết kế ngăn được.** Không cổng kỹ thuật (không `data_classification`, không content detector); miễn trừ `MTP §4.2` là một **điều kiện**, không phải **cơ chế** — không gì đo được nó tại runtime; kiểm duy nhất là `B9`, mà `B9` `Depends: B4` ⇒ chạy **sau** khi capsule đã ghi. Rủi ro này thuộc lớp *"không có control"*, không phải *"control yếu"*.

**Q2 — `escaped_side_effects = 0`.** Canary đóng đúng thứ nó được thiết kế để đóng (`ECONNREFUSED` ambiguity, `MTP §5.1`) và là control đúng. Nhưng `0` **không** đồng nghĩa *"không có side effect nào thoát"*. Ba điểm mù:

| # | Đường thoát | Canary mù vì | `L1`/`L2` mù vì |
|---|---|---|---|
| `BS-1` | side effect **không qua mạng, không qua DB** (ghi file, `process.exit`, process con làm việc cục bộ) | canary là listener mạng, không có gói tin để bắt | `ADR-005` §Consequences-Negative **ghi thẳng** đây là thứ nó không chặn |
| `BS-2` | egress tới địa chỉ **KHÔNG** thuộc tập canary phủ | `MTP §5.2` chỉ định canary chiếm *host cũ* + loopback | `L2` chốt **tầng runtime** ⇒ mù với `child_process`. **`BS-2` × `T8` = đường thoát KHÔNG control nào thấy** |
| `BS-3` | non-TCP — UDP (statsd/syslog), ICMP, unix socket | `MTP §5.2` chỉ định **TCP accept log**; UDP không có `accept()` | `dgram` là module riêng, phải vá tường minh |

`BS-2` là điểm nặng nhất và **chưa được nêu ở bất kỳ đâu**: residual của `THREAT-018` chỉ liệt kê (a) side effect cục bộ và (b) loopback.

**`T8` fail có bằng chứng hay fail im lặng — phụ thuộc HAI điều kiện, cả hai hiện chưa ai viết ra:**
- **`E1`** — remap *host cũ → canary* phải ở **tầng OS/DNS/container**. Nếu remap được hiện thực bằng vá resolver **trong process** (rất tự nhiên khi `L2` đã ở tầng runtime), `curl` của `T8` **không bao giờ thấy** remap đó.
- **`E2`** — fixture `T8` phải bắn vào đích **thuộc tập canary phủ**. Chọn một URL "cho chân thực" là rơi thẳng vào `BS-2`.

🔴 **Sai một trong hai ⇒ `T8` không fail, nó PASS SAI**: không dòng canary nào ⇒ `escaped_side_effects` vẫn `= 0` ⇒ ma trận 12/12 báo đạt ⇒ `GATE-06` được trả lời với một *"khoảng hở đã đo được"* mà **thực tế chưa bao giờ được đo**. Lệnh cấm `MTP §5.4` chỉ cấm **làm nhẹ test** — nó không chặn được ca **test đầy đủ mà thiết bị đo mù**.

**Q3 — `B2` mô phỏng cục bộ.** Cấp được **1/3** điều khoản:

| Điều khoản exit criteria `B2` | Mô phỏng cục bộ |
|---|---|
| cách ly **tầng IAM** | ❌ Docker socket là all-or-nothing: không principal, không scope, không deny |
| **revoke/rotate credential** | ❌ không có credential nào để revoke — điều khoản thành **no-op**, không phải thoả |
| bằng chứng do **công cụ độc lập** sinh | ✅ còn thi hành được — **đừng để mất nốt cái này** |

Điểm mới so với lens run trước: mô phỏng cục bộ nghĩa là **replay chạy trên CHÍNH cái máy vừa destroy**. Named volume sống sót nếu destroy thiếu `-v`; một Postgres **cài native** nghe `5432` sẽ được replay nối vào qua `localhost` **mà không gì báo động**, vì allowlist `L2` **bao gồm loopback** (`ADR-005` §Decision #3). ⇒ `T12` thôi là một ô test, nó thành **điều kiện thường trực của mọi scenario**.

⇒ Bằng chứng destroy cục bộ trả lời được *"compose stack còn service nào sống không"*, và **không** trả lời *"replay chạm được tới cái gì"*. Spike Report phải nói rõ vế thứ hai.

**Bốn dòng làm mạnh bằng chứng, tổng < 0.3 MD, nằm gọn trong 2.0 MD của `B2`**: `S1` nonce nhãn mỗi run · `S2` enumerator độc lập xuất JSON · `S3` replay chạy **không** có docker socket, network riêng (*"IAM của người nghèo"* — ranh giới do **máy** thực thi, không do kỷ luật) · `S4` enumerator liệt kê cả port đang LISTEN **trên host**, không chỉ resource Docker.

**Q4 — Danh sách kiểm `B9`: 20 mục, 4 nhóm, mỗi mục có lệnh + bằng chứng đạt.** Đã lưu nguyên văn để giao thẳng cho worker chạy `B9`. Mục nghiêm nhất: `I-5` — một `require('dotenv').config()` **trần** trong `src/spike/` là **FAIL mức cao nhất của `B9`**.

**Q5 — Rủi ro lớn nhất PM chưa hỏi tới: một chuỗi 5 mắt xích, mỗi mắt xích đã thành văn ở một file khác nhau, không tài liệu nào ghép chúng lại.**

1. `.env` repo root chứa secret **vận hành thật** (13 key, gồm `CLICKUP_API_KEY`, `TELEGRAM_BOT_TOKEN`, 4 Teams Flow URL — bản thân là **capability URL**, ai có URL là gọi được). `.env.example` **không tồn tại** ⇒ không gì tài liệu hoá đâu là biến an toàn.
2. Spike là Node.js, `dotenv.config()` mặc định đọc `.env` ở `process.cwd()`; `npm start` từ repo root cho `cwd` = **repo root**.
3. Recorder ghi tất cả, không cắt, không che (`B3` KHÔNG CAP + ledger khai không có redaction).
4. Capsule **plaintext**, không authn, không audit (`SEC-015`, `SEC-018/019/020` đều ở ledger).
5. 🔴 **`.gitignore` phủ `.env` (dòng 21 — đã verify) nhưng KHÔNG phủ artifact spike**, trong khi `B10` ghi thẳng *"Niêm phong = commit vào git"* và chạy **sau `B8`**, tức khi cây spike đã đầy artifact. Một `git add .` ở bước đó quét cả thứ không ai định commit. Trúng thì `THREAT-006` đường 1: *"Impact: Critical vì tính vĩnh viễn. Git history là bất biến theo thiết kế"*. `SEC-043` (CLI từ chối ghi capsule vào git working tree) **không tồn tại ở `P0-B`**.

## PM đọc được gì

- **Ba control bù phải vào exit criteria, không phải để "nhớ làm sau"** — cả ba đều ~0 MD:
  - **`CTL-1`** `src/spike/` **cấm** `dotenv.config()` trần; bắt buộc `path` tường minh trỏ **vào trong** `src/spike/`, hoặc chỉ nhận env do compose inject. → nhét vào exit criteria `B1` **và** `B3`.
  - **`CTL-2`** `.gitignore` phủ artifact spike **trước khi `B3` chạy dòng đầu tiên** — không phải trước `B10`. Giữ `test/spike/manifests/` **KHÔNG** ignore (`B10` cần commit đúng 10 file đó).
  - **`CTL-3`** allowlist env cho recorder (`SEC-004` ở dạng 5 dòng code, **không** phải redaction engine — thứ ledger đã tuyên bố không có).
- **`E1`/`E2` là bổ sung exit criteria bắt buộc cho `B5` + `B8`.** Không có chúng, `T8` không phân biệt được *"không có mưu toan"* với *"canary không nghe được"* — lặp đúng lỗi phương pháp `ECONNREFUSED` mà `MTP §5.1` sinh ra để diệt, chỉ ở một tầng cao hơn. Chi phí ≈ 0: một lệnh `curl <host-cũ>` từ trong container replay, **ngoài** mọi test, phải xuất hiện trong canary log.
- **Phát biểu đúng của `escaped_side_effects = 0`** — phải in nguyên văn vào Spike Report: *"không có mưu toan egress nào chạm tới địa chỉ của môi trường đã destroy hoặc loopback, qua TCP"*. Đó **không** phải *"không có gì rời process"* — mà đúng phát biểu sau mới là *kiểm chứng dạng phủ định* mà `ADR-005` §Open items đòi làm bằng chứng chấp nhận cho risk Critical §20.4. Khoảng cách giữa hai phát biểu **phải hiện trên báo cáo**, nếu không `GATE-06` đọc `0` như một bảo đảm mà nó không phải.
- **Ledger `B2` phải khai cả hệ quả loopback**, không chỉ khai *"không có IAM"*. Và ngày dòng ledger **≤** ngày commit `src/spike/infra/` — ghi hồi tố thì theo chính `§5.2` là *"không có giá trị chứng minh"*.

## Mâu thuẫn với lens khác

Chưa phân xử được — lens `architect` và `devops-engineer` chưa trả về tại thời điểm ghi file này. Giao nhau đã thấy trước: `BS-2`/`E1`/`E2` chạm câu 3 của `architect` (`L2` tầng runtime) và câu 1e của `devops-engineer` (canary sink). PM sẽ đối chiếu khi đủ 3 lens.

## Việc PM KHÔNG verify được — giao lại `@TrisJr`

Worker không chạy được lệnh `git` (safety classifier chặn). **PM chạy lại cũng bị chặn** — không phải lỗi của worker, và không phải phán quyết rằng hành động nguy hiểm.

⇒ Anh chạy hai lệnh sau bằng `!` để biết `.env` đã từng lọt vào history chưa:

```
git ls-files --error-unmatch .env
git log --oneline --all -- .env
```

Lệnh 1 báo `did not match` **và** lệnh 2 ra rỗng ⇒ an toàn. Ngược lại ⇒ cần rotate `CLICKUP_API_KEY` + `TELEGRAM_BOT_TOKEN` + 4 Teams Flow URL. **Việc này KHÔNG thuộc phạm vi `P0-B`** — nó là vận hành của anh, PM ghi lại để không rơi.
