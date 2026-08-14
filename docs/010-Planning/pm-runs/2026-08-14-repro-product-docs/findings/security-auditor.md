# Findings — security-auditor

**Lens**: bảo mật, quyền riêng tư, tuân thủ. Read-only, `FILES_TOUCHED: none`. `STATUS: DONE`.
**Phạm vi đã đọc**: toàn bộ `RQ.md` (1995 dòng), `.agent/roles/security-auditor.md`, RULE-001.

## ⚠️ Cảnh báo hệ thống và đánh giá của PM

Task notification của worker này kèm cảnh báo: **công việc chưa được safety review** — upstream safety filter từ chối *chính yêu cầu review*, và cảnh báo ghi rõ việc từ chối đó phản ứng với nội dung trong transcript của worker (thứ mà worker tự kiểm soát), **không phải là phán quyết về chất lượng công việc**. Cảnh báo yêu cầu PM tự kiểm hai điều trước khi dùng output.

**PM đã kiểm và kết luận: output dùng được.** Căn cứ:

| Kiểm gì | Kết quả |
|---|---|
| Có dấu hiệu prompt injection? | **Không.** Không có chỉ thị nào nhắm vào PM hay vào agent khác, không có văn bản giả dạng system message, không có yêu cầu bỏ qua ràng buộc đã cấp. |
| Có yêu cầu PM làm việc gì đáng ngờ? | **Không.** Worker chỉ trả về phân tích và nói rõ vị trí file *nếu* PM muốn ghi ra — rồi tự khẳng định **"Em không tạo file đó"**. |
| Có tuân thủ ownership read-only? | **Có.** `FILES_TOUCHED: none`, đã verify không có file mới nào ngoài các file PM tự ghi. |
| Có exploit code / payload tấn công thật? | **Không.** Các lớp lỗ hổng được nhắc (zip-slip, prototype pollution, decompression bomb, ANSI escape) xuất hiện **trong ngữ cảnh phòng thủ** — mỗi cái đi kèm một yêu cầu `SEC-xxx` dạng given/then để **chặn** nó. Không có PoC, không có payload dùng được. |
| Nội dung có hợp mục đích? | **Có.** Đây là threat model của một thiết kế cho sản phẩm hợp pháp, do chính chủ sản phẩm yêu cầu. |

**PM suy đoán nguyên nhân filter từ chối**: output dày đặc thuật ngữ tấn công (RCE, exfiltration, credential theft, account takeover, breach) ở mật độ cao — đúng như một threat model nghiêm túc phải có. Đây là false positive về hình thức, không phải nội dung. Ghi lại ở đây để về sau đọc run-state còn hiểu vì sao có cảnh báo.

## Kết luận của worker

**13 asset** (`A-01`…`A-13`) và **6 trust boundary** (`TB-1`…`TB-6`), với hai kết luận được phân biệt rạch ròi:

- **`TB-2` (redaction gate) = control point quan trọng nhất.** Là nơi *duy nhất* ngăn được dữ liệu nhạy cảm bước vào lifecycle. Hỏng ở đây thì mọi control phía sau (encryption, ACL, retention) chỉ đang bảo vệ dữ liệu mà lẽ ra không nên tồn tại.
- **`TB-4` (storage → laptop developer, `repro pull`) = boundary NGUY HIỂM NHẤT.** Năm lý do, theo thứ tự sức nặng: (1) **bất khả hồi** — mọi boundary khác còn sửa được (rotate key, đổi ACL, xoá object), sau `TB-4` tổ chức **không còn khả năng thu hồi**; (2) **bị vượt qua trên happy path, không do bị tấn công** — `repro pull` *là* tính năng, nên rủi ro tăng tuyến tính theo mức adoption: càng thành công càng nhiều dữ liệu production nằm trên laptop; (3) Zone 3 có security posture thấp nhất (cloud sync tự backup `~/.repro`, IDE indexer đọc file, AI assistant đọc workspace, laptop mất/bị đánh cắp); (4) **sau `TB-4` không còn audit** — storage log được "ai pull", không log được "capsule đó sau đó đi đâu"; (5) **nó nhân bản asset** — một capsule → N bản trên N laptop, mà retention policy chỉ áp được lên bản gốc.

**19 threat** (`THREAT-001`…`THREAT-019`) theo khung **STRIDE áp per-boundary**. Worker chủ động **không** gán điểm CVSS dù role file có nêu, lý do: chưa có implementation, gán số sẽ là *bịa độ chính xác*. **PM đánh giá đây là judgment call đúng.**

RQ.md **có** mitigation cho: THREAT-001/002 (một phần), 010 (nguyên tắc), 012 (một phần), 015 (khá đủ).
RQ.md **hoàn toàn không có** mitigation cho **11 threat**: 004, 005, 006, 007, 008, 009, 011, 013, 016, 018, 019.

**Danh sách redaction mặc định** theo 5 nhóm (HTTP header, HTTP body field, DB column pattern, environment variable, external API response field) với 6 chiến lược (`NEVER-STORE`, `DROP`, `REPLACE-FIXED`, `HMAC-HASH`, `PSEUDONYMIZE`, `MARK`).

**Ràng buộc tuân thủ** quy về **9 hạng mục bắt buộc day-1** và một danh sách hoãn được, mỗi mục kèm lý do *vì sao không retrofit được*.

**43 yêu cầu** `SEC-001`…`SEC-048` dạng **given/then kiểm chứng được** (32 MUST-V0.1, 8 SHOULD, 3 DEFER), nhóm theo A–I.

## PM đọc được gì

### 1. Xác nhận chéo mâu thuẫn §28 — lens thứ hai độc lập tìm ra

`THREAT-008` phát hiện: §28 xếp **Access control, Retention policies, Team management, Enterprise security** vào **commercial layer**, còn OSS core chỉ có "Basic Self-hosting". Nghĩa là:

> **Bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có access control.**

PM đã tự đọc lại `RQ.md:1605-1630` để verify. **Đúng nguyên văn.**

`business-analyst` lens độc lập tìm ra cùng chỗ này (`FR-025`): §20.5 + §21 coi strict access control là MVP=Yes, nhưng §28 đẩy nó sang commercial. **Hai lens, hai góc nhìn khác nhau, cùng một kết luận.**

Worker khuyến nghị mạnh: **authn/authz phải nằm trong OSS core, không phải commercial** — lập luận *"bán access control như tính năng trả phí, trong khi sản phẩm cốt lõi bê dữ liệu production ra ngoài, là một tư thế không bảo vệ được"*.

**PM đánh giá**: đây là quyết định **business model có hệ quả bảo mật trực tiếp**, vượt xa `brief.md`. → **GATE (tầng 3)**.

### 2. Khoảng trống bị bỏ sót nhiều nhất là **chiều ngược** — `THREAT-009`

Toàn bộ RQ.md nhìn dữ liệu chảy **ra**. Nhưng `repro replay` **nạp và deserialize một artifact do bên khác tạo**, rồi tiêm giá trị đó vào runtime. Và **RQ.md không có một dòng nào về capsule integrity** — không hash, không signature, không verification.

Vector cụ thể: zip-slip/path traversal trong entry của capsule; **prototype pollution** qua key `__proto__`/`constructor` (MVP là Node.js — rất đúng chỗ); decompression bomb (§20.12 dùng compression); capsule ép replay runtime kết nối tới host do attacker chọn; manifest chỉ định module để load.

Impact: **code execution trên máy developer** — tức máy có SSH key, cloud credential, quyền push code. Worker mô tả đúng bản chất: đây là con đường từ *"lộ dữ liệu"* sang **compromise chuỗi phát triển**.

Và likelihood tăng theo thời gian: worker chỉ ra sẽ lên **High** khi hệ sinh thái xuất hiện "sample capsule" chia sẻ công khai — điều rất hợp lý với một OSS dev tool.

**PM đánh giá**: đây là phát hiện có giá trị cao nhất của lens này. Nó không có trong RQ.md, không suy ra được nếu chỉ đọc theo mạch tác giả, và **đóng được bằng một requirement rẻ** (`SEC-027`: verify hash/signature *trước khi* parse payload). Bắt buộc vào SDD §7 và vào ADR-002 (vì nó ràng buộc capsule format — manifest phải có chỗ chứa hash/signature **từ v1**).

### 3. Ba threat khác RQ.md không có mitigation, đều đáng vào tài liệu

- **`THREAT-005` — recorder bị lạm dụng thành công cụ exfiltration nội bộ.** Repro tạo ra một **kênh dữ liệu hợp pháp mới** từ production ra ngoài. Insider không có quyền `psql` production nhưng **có quyền merge config**: mở rộng capture sang bảng giá trị cao, tắt redaction một field, chờ (hoặc chủ động gây) lỗi, rồi `repro pull`. Toàn bộ chuỗi này **trông giống debug bình thường**. §20.6 chỉ lo attacker *bên ngoài* chiếm storage — **mô hình insider hoàn toàn vắng mặt trong RQ.md**. Đây là Repro trở thành **privilege escalation path**, bypass mô hình phân quyền dữ liệu production hiện có của tổ chức.
- **`THREAT-006` — capsule vào git vĩnh viễn.** Hai đường, và đường thứ hai **là tính năng có chủ đích**: §25/§26 V0.2 "Regression test generation" — regression test *phải* mang dữ liệu production để chạy được, và test *phải* được commit. Git history bất biến; force-push không xoá được fork/clone/CI cache. Worker nhấn đúng: **quyết định này phải chốt ở V0.1** dù tính năng ở V0.2, vì nó **ràng buộc capsule format**.
- **`THREAT-004` — redaction config fail-open.** Config bị xoá/typo/parse lỗi/deploy thiếu ⇒ recorder chạy ở chế độ "không rule nào khớp" = **full capture**, âm thầm, không tín hiệu. Không cần tấn công gì, chỉ cần một PR sửa YAML. RQ.md §16 chỉ đưa ra *hình dạng* config, không nói gì về integrity hay hành vi khi thiếu.

### 4. Điểm căng thẳng thật giữa privacy và tính đúng của replay — và nó gặp `architect` lens

Worker chỉ ra: **`DROP` làm đổi code path.** Xoá key ⇒ `if (user.email)` chuyển nhánh, schema validation fail, destructuring thành `undefined` → tạo ra **bug giả** hoặc **che bug thật**. Với một sản phẩm mà toàn bộ giá trị nằm ở "cùng một execution path" (§10, §20.3), `DROP` là kẻ thù của tính đúng.

Nên mặc định phải là **giữ hình dạng** (`REPLACE-FIXED` / `PSEUDONYMIZE` format-preserving), chỉ `DROP` khi field chắc chắn không tham gia logic, và `NEVER-STORE` khi nghĩa vụ pháp lý thắng tính đúng của replay.

Và hệ quả phải chấp nhận + nói thật: replay của capsule đã redact **không bảo đảm bit-perfect**, nên Execution Diff phải phân biệt *"diverged vì code"* với *"diverged vì redaction"* (`SEC-048`).

Lý do worker đưa ra rất đáng chú ý:

> Đây là cách redaction thực sự thất bại trong đời thực: **bị người dùng vô hiệu hoá**, không phải bị bypass kỹ thuật.

**Đây chính là `U-15` mà `architect` lens tìm ra từ phía kiến trúc.** Hai lens độc lập, hai đường tiếp cận, gặp nhau ở cùng một kết luận và cùng một giải pháp (capsule phải ghi lại *đã redact field nào* để diff quy trách nhiệm đúng). PM coi đây là hạng mục **đã được chống lưng đủ mạnh để đưa vào SDD như một quyết định**, không phải TBD.

### 5. Redaction là hygiene control, KHÔNG phải containment boundary

Worker liệt kê 11 nhóm mà redaction dựa-trên-danh-sách **về nguyên tắc không thể** bắt được: free-text, tên field không đoán được (tiếng Việt, viết tắt `sdt`/`cmnd`, tên nội bộ), payload lồng/encode (JSON-trong-string, base64, **payload của JWT**), giá trị không có key (array của tuple, CSV trong string), PII trong URL/Referer, binary có EXIF, **stack trace và SQL error message** (không có schema, không có key ⇒ mọi rule theo tên đều mù), quasi-identifier ghép lại re-identify được, internal id giữ nguyên ⇒ join được với DB thật, metadata của `repro list`, và **yếu tố con người**.

Kết luận worker: containment thật phải đến từ **access control + encryption với crypto-shred + retention TTL + audit + locality (self-host) + hạn chế bản copy ở Zone 3**.

**PM đánh giá**: đây là loại kết luận em cần nhất — nó ngăn tài liệu tương lai mang một **false assurance** ("đã có redaction nên capsule sạch"). Bắt buộc phải xuất hiện tường minh trong tài liệu, không được làm mềm.

### 6. GDPR right-to-erasure là một mâu thuẫn thiết kế thật, không phải "chưa làm"

Xoá được đòi hỏi (a) biết capsule nào chứa dữ liệu của data subject nào, và (b) xoá được **mọi** bản copy. Nhưng capsule là artifact **bất biến đã copy xuống N laptop**, có thể đã vào git và Slack.

Worker chỉ ra **crypto-shredding là cơ chế duy nhất** biến `TB-4` từ bất khả hồi thành khả hồi: capsule mã hoá bằng **key riêng từng capsule** giữ phía server, `replay` lấy key just-in-time ⇒ **xoá = phá key**, và mọi bản copy trên laptop/Slack/git lập tức thành ciphertext vô nghĩa.

Đánh đổi worker nêu thẳng: **mất replay offline**, tăng độ phức tạp self-host. Và worker **không tự quyết**, ghi rõ *"cần architect lens quyết định"*.

**PM xử lý (tầng 2)**: `architect` lens đã chạy xong và **không** đề cập crypto-shred (nó không có trong RQ.md nên architect không có cơ sở để nêu). PM chốt: đưa vào SDD §7.4 + ADR-002 §Consequences như một **ràng buộc thiết kế được đề xuất, gắn nhãn "cần validate — đánh đổi với replay offline chưa được giải"**. Không viết như đã chốt, vì nó thật sự chưa được ai cân.

### 7. Trả lời trực tiếp §38 Q10–Q12 mà BA lens đã nhường

| §38 | Câu hỏi | Đáp án của security lens |
|---|---|---|
| Q10 | What production data can safely be captured? | **Shape + metadata + internal id**, *không* phải nội dung |
| Q11 | What should be redacted by default? | Toàn bộ Phần 3, với **hai đảo chiều bắt buộc**: env dùng **allowlist** (deny-by-default), free-text **mặc định drop** |
| Q12 | Is self-hosting required from day one? | **Có** — nhưng lý do mạnh nhất **không phải bảo mật mà là compliance**: nó là thứ duy nhất giúp tổ chức tránh đưa nhà cung cấp vào vai processor và tránh phát sinh transfer xuyên biên giới |

Q12 khớp với `FR-054`/`FR-055` của BA lens và `D-12`/`ADR-009` của architect lens — **ba lens đồng thuận**. PM chốt tầng 2: self-hosting là bắt buộc từ V0.1, ghi vào PRD + ADR-009.

Lý do cho Q12 của security lens là một **nâng cấp so với RQ.md**: §20.6 lập luận self-host bằng *bảo mật*, security lens chỉ ra lập luận *compliance* mạnh hơn. Đưa vào ADR-009 §Context.

### 8. Bốn thay đổi mặc định là phần giá trị nhất, không phải "redact nhiều hơn"

Worker tự tổng kết, PM đồng ý và sẽ giữ nguyên khung này khi đưa vào tài liệu:

1. **Mọi thứ fail closed** (`SEC-001` redaction lỗi ⇒ không persist; `SEC-005` PAN detector; `SEC-012` config thiếu ⇒ refuse to start, không bao giờ mặc định "no redaction").
2. **Allowlist thay vì denylist ở hai chỗ quyết định**: env (`SEC-004`) và **replay egress** (`SEC-032`).
3. **Capsule phải verify trước khi parse** (`SEC-027`) — RQ.md hoàn toàn chưa có.
4. **Authn/authz + audit + crypto-shred nằm trong OSS core**, không phải commercial (`SEC-016/018/020/021`) — mâu thuẫn với §28, xem mục 1.

Đặc biệt `SEC-032` là một siết chặt đáng chú ý lên §13/§20.4: worker chỉ ra cơ chế mà RQ.md mô tả (**phân loại theo verb** ở các sink đã instrument) **fail-open đúng ở chỗ nguy hiểm nhất — cái nó không nhận diện được**: `net.Socket` thô, `child_process` gọi `curl`, SDK dùng transport riêng, `WITH x AS (UPDATE ...) SELECT` (bắt đầu bằng `WITH`), `SELECT charge_customer(...)`, `CALL`, `GET /v1/send?to=`. Đề xuất: **chặn egress ở mức process với allowlist loopback + replay proxy**, biến default-deny từ *"denylist các verb ghi"* thành *"allowlist những gì đã chứng minh là read"*.

**Điểm này trùng khớp `U-12` của `architect` lens** (phân loại READ/WRITE bằng cơ chế nào, fail-closed), và cả hai độc lập kết luận **fail-closed**. Xác nhận chéo thứ tư.

### 9. Ba mục `TBD` worker từ chối đoán — PM tôn trọng

- **Giá trị TTL mặc định** (`SEC-022`): cần PM + pháp chế. Worker chỉ yêu cầu *"phải có một giá trị hữu hạn, không được là vô hạn"* — đó là phần có thể khẳng định, và nó dừng đúng chỗ.
- **Ngưỡng row/byte cap** (`SEC-008`): cần số liệu từ technical spike §22.
- **Key server-side (crypto-shred) vs replay offline** (`SEC-016`): cần architect quyết.

PM ghi nhận: worker phân biệt được *"cái tôi khẳng định được"* với *"cái cần người khác quyết"* — đúng chuẩn chống ảo giác của lane.

## Mâu thuẫn với lens khác

**Không có mâu thuẫn. Bốn điểm xác nhận chéo:**

| Chủ đề | `security-auditor` | Lens kia | Kết luận |
|---|---|---|---|
| §28 đẩy access control sang commercial trong khi §20.5/§21 coi là MVP | `THREAT-008` | `business-analyst`: `FR-025` | **Xác nhận chéo độc lập** → GATE (tầng 3) |
| Redaction làm hỏng replay fidelity, capsule phải ghi field đã redact | mục 3.1 + `SEC-048` | `architect`: `U-15` | **Xác nhận chéo độc lập** → đủ mạnh để vào SDD như quyết định |
| Phân loại READ/WRITE phải **fail-closed** | `SEC-032`, `SEC-033` | `architect`: `U-12` | **Xác nhận chéo độc lập** → vào ADR-005 |
| Self-hosting bắt buộc từ V0.1 | Q12 | `business-analyst`: `FR-054/055`; `architect`: `D-12` | **Ba lens đồng thuận** → PM chốt tầng 2 |

**Giải xong `ACG-12` của BA lens.** BA hỏi: §18 "MVP capabilities" không liệt kê redaction/encryption/retention/self-hosting, nhưng §21 Risk Matrix nói MVP=Yes — dùng cái nào? BA đã tạm dùng §21 làm tie-breaker và **chờ security lens xác nhận**.

Security lens **độc lập** kết luận 32 requirement là MUST-V0.1, phủ đúng redaction, encryption, retention, audit, authn/authz. → **tie-breaker của BA được chống lưng bởi lens thứ hai.**

**PM chốt (tầng 2)**: §18 là danh sách **core replay loop**, không phải danh sách đầy đủ mọi capability của MVP; §21 Risk Matrix (cột "MVP?") là nguồn có thẩm quyền cho các capability phi-chức-năng. Cả hai đều là văn bản của RQ.md, cách đọc này làm chúng tương thích thay vì loại trừ nhau. Ghi vào PRD như một *diễn giải tường minh*, không giấu.

## Ghi chú vận hành

Worker báo `knowledge-base/45-Role-Memory/security-auditor/` **không tồn tại**. **PM đã verify: đúng** — thư mục này thật sự không có (11/12 role khác đều có `000-Core-Memory.md`). Worker chạy **không có role memory tiền lệ** và đã nói thẳng điều đó thay vì im lặng.

`docs/030-Specs/Security/` cũng chưa tồn tại. Worker nêu đúng vị trí chính thức theo RULE-001 (`docs/030-Specs/Security/Spec-Security-{Name}.md`) và **không tự tạo file** — tuân thủ ownership.

**Hệ quả cho close-step**: nếu anh duyệt hạng mục Security Spec ở gate, PM sẽ tạo `docs/030-Specs/Security/` như một thư mục con hợp lệ trong hệ Dewey (RULE-001 §Cấu trúc thư mục bắt buộc đã khai báo `030-Specs/Security/`), **không** phải thư mục tự chế.
