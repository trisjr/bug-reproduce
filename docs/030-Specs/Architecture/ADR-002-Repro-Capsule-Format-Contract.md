---
id: ADR-002
type: adr
status: approved
project: repro
created: 2026-08-14
updated: 2026-08-28
---

# ADR-002: Repro Capsule Format Contract

**Decision status**: **Accepted** — ✅ **CHỐT GATE-03 — 2026-08-14**
**Người duyệt**: **`@TrisJr`** · **Ngày duyệt**: **2026-08-14** (duyệt toàn bộ 11 ADR)
**Related to**: [SDD-Repro](./SDD-Repro.md)

> ⚠️ **`Accepted` xác nhận hướng quyết định, KHÔNG đóng mục `Open items`.** Các unknown `TBD`/`SPIKE` bên dưới vẫn chưa được trả lời — xem `GATE-03-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md).
>
> **Mapping tên gọi** — `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.

## Context

[ADR-001](./ADR-001-Replay-Execution-Not-Environment.md) quyết định tái tạo execution thay vì environment. Điều đó chỉ khả thi nếu execution được đóng gói thành **một artifact portable**. `RQ.md` §6 đặt tên cho artifact đó — **Repro Capsule** — và §40 phát biểu vai trò của nó nguyên văn: *"This is everything needed to understand the execution."*

§6 đưa ra layout ví dụ:

```text
repro-1842/
├── manifest.json
├── request.json
├── environment.json
├── feature-flags.json
├── database/
│   ├── query-001.json
│   └── query-002.json
├── network/
│   ├── tax-api.json
│   └── payment-api.json
└── metadata.json
```

và liệt kê nội dung có thể có: original request, relevant database query results, external API responses, feature flag state, relevant environment metadata, timestamps, application version, Git commit, runtime information. §6 chốt hai ràng buộc đối lập nhau: capsule chứa *"only the information necessary to reproduce the execution"* và *"should not be a copy of the production environment"*.

**Vì sao capsule là một *contract*, không chỉ là một định dạng file.** §17 vẽ luồng `Repro Recorder → Repro Capsule → (pull) → Replay Runtime`. Recorder chạy **trong production**; Replay Runtime chạy **trên laptop developer**; hai bên khác chủ sở hữu, khác chu kỳ deploy, khác phiên bản. §8 thêm chiều thời gian: `repro pull 1842` xảy ra sau khi capture, có thể rất lâu sau. §28 xếp *"Capsule Format"* vào OSS core, nghĩa là nó là bề mặt công khai mà bên thứ ba sẽ viết code dựa vào. Ba điều này cộng lại nghĩa là capsule format là **giao diện tích hợp duy nhất giữa recorder và replay runtime**, và nó phải được đối xử như API công khai chứ không như chi tiết triển khai.

**Ràng buộc kích thước.** §20.12 xếp Capsule Size ở mức High: request lớn, DB result lớn, file upload, binary data có thể tạo capsule rất lớn. Mitigation của §20.12 gồm: compression, deduplication, content hashing, size limits, selective capture, lazy loading. §23 yêu cầu đo cả average lẫn P95 capsule size; §24 chỉ đặt một ngưỡng `< 10 MB average` và tự gắn nhãn *"initial hypotheses, not final product commitments"* — không có ngưỡng cho P95.

**Ràng buộc bảo mật & riêng tư.** §16 yêu cầu redaction, PII anonymization, và *"Capsules should support encryption at rest"*. §20.5 (Critical) liệt kê PII, credential, token, tài chính, dữ liệu nội bộ. §20.6 (Critical) ưu tiên topology `Production → Private Recorder → Encrypted Capsule → Private Storage`. §20.17 (High) thêm retention, deletion, audit log, data residency.

**Chiều mà RQ.md hoàn toàn không nhìn tới: capsule đi *vào*.** Toàn bộ §16/§20.5/§20.6 nhìn dữ liệu chảy **ra** khỏi production. Nhưng `repro replay` (§8) **deserialize một artifact do bên khác tạo và tiêm giá trị đó vào runtime trên máy developer** — máy có SSH key, cloud credential, quyền push code. RQ.md không có một dòng nào về capsule integrity: không hash, không signature, không verification. `findings/security-auditor.md` (`THREAT-009`, `SEC-027`) nêu các lớp vector cụ thể: zip-slip/path traversal ở entry của capsule; prototype pollution qua key `__proto__`/`constructor` (đặc biệt đúng chỗ vì §18 chọn Node.js); decompression bomb (§20.12 dùng compression); capsule ép replay runtime kết nối tới host do bên khác chọn; manifest chỉ định module để load. Đây là con đường từ *lộ dữ liệu* sang *compromise chuỗi phát triển*.

**Chiều bị bỏ sót thứ hai: capsule vào git vĩnh viễn.** `findings/security-auditor.md` (`THREAT-006`) chỉ ra đường thứ hai **là tính năng có chủ đích**: §26 xếp "Regression test generation" ở V0.2 và §25 in `✓ Regression case generated`. Regression test *phải* mang dữ liệu production để chạy được, và test *phải* được commit. Git history bất biến; force-push không xoá được fork, clone, hay CI cache. Quyết định này **phải chốt ở V0.1** dù tính năng ở V0.2, vì nó ràng buộc chính capsule format.

**Redaction làm hỏng fidelity.** `findings/architect.md` (`U-15`) và `findings/security-auditor.md` (mục 3.1, `SEC-048`) độc lập kết luận: redaction đổi giá trị ⇒ Execution Diff (§9) sẽ báo diverge vì lý do do chính Repro gây ra. Hai lens đồng thuận ⇒ đủ mạnh để viết như quyết định trong ADR này.

## Decision

**Repro Capsule là hợp đồng (contract) giữa recorder và replay runtime. Nó được đặc tả, được đánh version, được xác thực trước khi dùng, và tự chứa.**

1. **Capsule là giao diện duy nhất giữa recorder và replay runtime.** Hai bên tiến hoá độc lập miễn là cùng thoả thuận format version. Không bên nào được giả định chi tiết triển khai của bên kia (§17, §28).
2. **Layout v1 Chính Thức (Đóng băng tại Phase P1 — 2026-08-28)**: Container là file `.repro.tar.gz` chứa:
   - `manifest.json`: Header v1, version `"1.0.0"`, `capsule_id` (UUIDv7), `created_at`, `target_commit`, `class_assessment` ($ACG\text{-}07$), `key_id` reference ([ADR-012](./ADR-012-Key-Custody.md)), `encryption_metadata` (AES-256-GCM), `payload_hmac` (HMAC-SHA256, $SEC\text{-}027$).
   - `interactions.jsonl`: Dãy `InteractionUnit` ($U_0 \to U_i \dots \to U_\infty$) đã chuẩn hóa (fingerprinted SQL, normalized URLs, canonical JSON).
   - `runtime_metadata.json`: Node.js version, OS platform, git branch, process env keys allowlist.
   - `checksums.sha256`: Bảng digest SHA-256 cho từng entry trước khi nén.
3. **Capsule tự chứa về mặt dữ liệu (Self-contained Payload)**: Mọi dữ liệu cần thiết để replay ($U_0 \dots U_\infty$) nằm trong capsule; tuyệt đối không fetch dữ liệu từ production lúc replay. Khoá giải mã `key_id` được quản lý độc lập tại Key Custody Store ([ADR-012](./ADR-012-Key-Custody.md)) phục vụ crypto-shredding $SEC\text{-}016$.
4. **Format version bắt buộc có trong `manifest.json` từ v1 (`"format_version": "1.0.0"`)**. Replay runtime gặp major version lạ $\to$ từ chối replay fail-closed.
5. **Verify-trước-khi-parse bắt buộc ($SEC\text{-}027$)**: Runtime kiểm tra HMAC-SHA256 của payload trước khi giải nén và deserialize JSON. Từ chối mọi zip-slip path traversal, decompression bomb ($>50\text{MB}$), và prototype pollution keys (`__proto__`, `constructor`).
6. **Quản lý kích thước theo §20.12**: Compression gzip, stream JSONL per-interaction, trần cứng $SEC\text{-}008$ ($100\text{ rows} / 64\text{ KB}$ per query).
7. **Envelope Encryption**: AES-256-GCM với DEK riêng per capsule, quản lý tại Key Custody Store ([ADR-012](./ADR-012-Key-Custody.md)).
8. **Dấu vết Redaction**: Ghi rõ cờ `redacted: true` cho từng field bị khử dữ liệu để phục vụ Divergence Attribution bước 1 của [ADR-006](./ADR-006-Execution-Verification-By-Equivalence.md).
9. **Tính Bất Biến & Chừa chỗ cho Regression Test V0.2 ($THREAT\text{-}006$)**: Format v1 có sẵn cờ `is_derived_sanitized: boolean` (mặc định `false`) để V0.2 sinh regression test an toàn để commit vào git mà không lộ ciphertext sản thi.

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ & lý do loại |
|---|---|---|---|
| A1 | **Capsule chứa bản sao production environment** | **[stated]** §6, §19 | §6 nguyên văn: *"It should not be a copy of the production environment"*; §19 Non-Goal. Trái ADR-001. |
| A2 | **Capsule là con trỏ, dữ liệu fetch lazy từ production lúc replay** | **[stated]** §20.12 (cụm *"lazy loading"*) — cách đọc *"fetch từ production"* là **[inferred]** của em | §20.12 là bằng chứng văn bản duy nhất, nhưng RQ.md **không** ở đâu nói fetch từ production. Loại vì: §11 nêu lợi ích *"avoids requiring production database access"*; §40 đòi portable; §22 có bước *"Destroy original environment"* — capsule phải sống sót sau khi môi trường gốc biến mất. Giữ lại phần lazy *khi đọc*. |
| A3 | **Blob nhị phân đóng / định dạng riêng không đọc được bằng mắt** | **[inferred]** | RQ.md không nêu. Loại vì §8 có `repro inspect 1842` và §33.5 *"Determinism over magic — The system should explain exactly what was captured and replayed"*. Một artifact không soi được thì không thể giải thích được. |
| A4 | **Tái dùng định dạng sẵn có làm định dạng capsule**: HAR cho HTTP, cassette/VCR, hoặc OpenTelemetry trace | **[inferred]** | RQ.md không nêu. Loại làm *định dạng capsule*: HAR chỉ phủ HTTP, không có DB result, feature flag, clock, execution trace; OTel trace thuộc tầng observability mà §3 đã nói là không đủ (*"What happened?"* ≠ *"Can I replay it?"*). Vẫn là ứng viên hợp lý cho **encoding của riêng phần `network/`** — để ngỏ. |
| A5 | **Không có format version ở v1, thêm sau khi cần** | **[inferred]** | RQ.md không nêu. Loại vì capsule là artifact **bất biến** và **đã rời khỏi tầm kiểm soát** (đã pull xuống N laptop, và theo `THREAT-006` có thể đã vào git). Capsule không version là capsule không bao giờ nâng cấp được. Chi phí thêm version ở v1 gần bằng không; chi phí thêm sau là không thu hồi được. |
| A6 | **Capsule không ký, không hash — tin tưởng nguồn** (đây là trạng thái ngầm định của RQ.md) | **[inferred]** — RQ.md hoàn toàn im lặng về capsule integrity; §16 chỉ nói redaction/anonymization/encryption/self-hosting | Loại: `repro replay` nạp artifact do bên khác tạo vào runtime của máy developer. Likelihood tăng theo thời gian khi hệ sinh thái OSS xuất hiện "sample capsule" chia sẻ công khai. Đóng được bằng một requirement rẻ (`SEC-027`). |
| A7 | **Một file JSON phẳng duy nhất thay vì cây thư mục** | **[inferred]** | RQ.md §6 dùng cây thư mục. Loại: cây cho phép dedup theo entry, lazy read từng phần (§20.12), và hash per-entry; một file phẳng buộc phải parse toàn bộ trước khi biết nó có an toàn không — mâu thuẫn trực tiếp với quyết định #5. |
| A8 | **Capsule mã hoá bằng khoá tổ chức dùng chung** thay vì khoá riêng từng capsule | **[inferred]** | ✅ **BỊ LOẠI DỨT KHOÁT — CHỐT GATE-05b — 2026-08-14** (trước đó: *"loại (yếu — chưa validate)"*). Khoá dùng chung không cho phép xoá chọn lọc, nên **không hỗ trợ được crypto-shredding** — mà crypto-shredding (`SEC-016`) nay là **`MUST-V0.1`** ⇒ một mô hình khoá dùng chung **loại `E12` vĩnh viễn**, tức là vi phạm một ràng buộc `MUST`. Lý do loại **thôi là "yếu"**. Xem `E12` ở §Consequences và §Open items, và `U-06d` ở [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md) §Open items. |

## Consequences

### Positive

- **Recorder và replay runtime tách rời thật sự**: mỗi bên thay đổi được mà không phá bên kia, miễn tôn trọng format version — điều kiện cần cho §28 (capsule format là OSS core, bên thứ ba viết dựa vào).
- **Artifact soi được bằng mắt và bằng `repro inspect`** (§8), phục vụ §33.5.
- **Portable qua máy và qua thời gian** (§40), và sống sót được bước *"Destroy original environment"* của quy trình spike §22.
- **compression + dedup + content hashing** tấn công trực diện risk High §20.12, và content hash dùng lại được cho integrity.
- **Verify-trước-khi-parse đóng cả một lớp threat trước khi nó tồn tại**, với chi phí thấp hơn nhiều so với sửa sau khi hệ sinh thái capsule đã lan ra.
- **Dấu vết redaction trong capsule** cho phép Execution Diff quy trách nhiệm đúng, giữ được niềm tin của developer vào diff (§9, ADR-006).
- **Bất biến + có identity** làm cho retention, audit và deletion có đối tượng rõ ràng để áp (§20.17).

### Negative

- **§20.12 — Capsule Size vẫn là risk High.** Compression và deduplication không miễn phí: chúng tiêu CPU **ở phía production**, va thẳng vào §20.7 (*"Repro must never become the reason production becomes slower or fails"*). Quyết định self-contained (#3) còn tước mất phương án đánh đổi kích thước bằng cách tham chiếu ra ngoài.
- **§23 yêu cầu đo P95 capsule size nhưng §24 không đặt ngưỡng cho P95** — có nghĩa là chưa có tiêu chí để biết format này "đủ nhỏ" hay chưa. Không bịa một con số thay thế.
- **Format contract là nợ tương thích vĩnh viễn.** §21 xếp "Compatibility matrix" ở mức Medium với cột MVP = Yes. Mỗi thay đổi format từ nay về sau đều phải trả giá cho những capsule đã tồn tại.
- **Verify-trước-khi-parse đòi một mô hình tin cậy mà RQ.md chưa có**: ai ký, khoá phân phối thế nào, capsule không ký thì từ chối hay chỉ cảnh báo. Nó thêm một bước và một khả năng thất bại mới vào đúng đường `repro replay` — đường mà §20.14 muốn không có ma sát.
- ✅ **`E12` — Crypto-shredding: ĐÃ CHỐT `MUST-V0.1` — CHỐT GATE-05b — 2026-08-14.** Cơ chế: mỗi capsule mã hoá bằng khoá riêng giữ phía server, `replay` lấy khoá just-in-time ⇒ xoá = phá khoá, và mọi bản copy trên laptop / Slack / git lập tức thành ciphertext vô nghĩa. Đây là cơ chế duy nhất được nêu để biến boundary `storage → laptop` từ **bất khả hồi** thành khả hồi, và là điều kiện thực tế để trả lời GDPR right-to-erasure. Nhãn cũ *"ràng buộc được đề xuất — cần validate — đánh đổi với replay offline chưa được giải"* **đã được gỡ**: `SEC-016` nay là **`MUST-V0.1`**, quyết định của **`@TrisJr`**, và **đánh đổi đã được cân và chấp nhận** (mất replay offline + tăng độ phức tạp self-host) — xem `GATE-05b-r` ở gạch đầu dòng riêng bên dưới. Mệnh đề *"`RQ.md` không có nội dung này"* **giữ nguyên** — đó là sự thật về `RQ.md`; điều đổi là **nó đã được người có thẩm quyền cân và chốt**, nên **không còn** *"không viết như đã chốt"*.
- ⚠️ ✅ **`GATE-05b-r` — CAPSULE KHÔNG CÒN SELF-CONTAINED TUYỆT ĐỐI. Đây là chỗ `GATE-05b` va thẳng vào chính ADR này — hệ quả được chấp nhận CÓ Ý THỨC, không giấu, không làm nhẹ.** `SEC-016` = `MUST-V0.1` (khoá giữ phía server) đụng trực tiếp vào **quyết định #3** (*self-contained là bất biến của V0.1*):
  - **Cái mất**: *"mọi thứ cần để replay nằm trong capsule"* **không còn đúng** — khoá **không** nằm trong capsule. `replay` **cần kết nối tới Capsule Store** để lấy khoá ⇒ *"replay không cần kết nối mạng"* **thôi là bất biến**. Cụm §40 *"portable"* nay đúng theo nghĩa *"đi được qua máy và qua thời gian"*, **không** còn đúng theo nghĩa *"dùng được khi không có mạng"*.
  - **Cái còn**: *"không fetch dữ liệu từ **production** lúc replay"* **vẫn là bất biến** — capsule vẫn không kéo dữ liệu từ production; §22 bước *"Destroy original environment"* vẫn sống sót; diễn giải *lazy khi đọc* của §20.12 **không** bị lật.
  - **Ràng buộc mới lên format v1, không retrofit được**: manifest **BẮT BUỘC** có chỗ chứa **key reference**. Trước `GATE-05b` đây là ràng buộc *có điều kiện* (*"nếu chọn phương án này"*); nay **điều kiện đã xảy ra**.
  - ✅ **Chốt ĐÚNG LÚC — ràng buộc *"phải chốt `SEC-016` trước khi capsule format v1 đóng băng"* ĐÃ ĐƯỢC THOẢ.** Format v1 **chưa đóng băng**: repo chưa có code (`src/` và `test/` rỗng — xem [SDD-Repro](./SDD-Repro.md) §1.1), chưa có capsule nào tồn tại ngoài đời. ⇒ Chỗ chứa key reference vào được **v1** mà **không** cần major version bump và **không** tạo nợ tương thích với capsule đã phát hành (quyết định #4, `U-05`). Nếu quyết định này đến **sau** khi v1 đóng băng thì chi phí là **không thu hồi được**.
  - **Điều kiện để hệ quả này có giá trị**: `U-06d` (key custody) nay là **BLOCKER** — không có nơi giữ và xoá khoá thì crypto-shredding **không thực thi được**, và khi đó ta **mất replay offline mà không thu được khả năng xoá**. Xem `GATE-05b-r`/`GATE-05b-r2` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md) và `U-06d` tại [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md) §Open items.
- **`THREAT-006` — capsule đi vào git vĩnh viễn qua regression test.** Đường đi là *tính năng có chủ đích* (§26 V0.2 "Regression test generation", §25 in `✓ Regression case generated`), không phải tai nạn. Hệ quả với format: v1 phải để chỗ cho khái niệm **artifact dẫn xuất đã khử dữ liệu, an toàn để commit**, hoặc phải có cờ đánh dấu capsule không được phép commit. **Quyết định này phải chốt ở V0.1** vì nó ràng buộc format. **M1 ✅ ĐÃ CHỐT 2026-08-14** xác nhận tính năng nằm ở **V0.2** — điều đó **không** làm ràng buộc này biến mất, và **không** được đọc là "hoãn sang V0.2 rồi tính". Ngược lại: nó biến ràng buộc từ *"chưa biết khi nào tính năng xuất hiện"* thành **ràng buộc đã biết chắc thời điểm** — format v1 phải chừa chỗ **ngay bây giờ** cho một tính năng đã có lịch. Xem §Open items.
- **Dấu vết redaction tự nó là thông tin.** Ghi lại "field X đã bị redact" tiết lộ *sự tồn tại và tên* của field đó cho bất kỳ ai cầm capsule. Đây là chi phí chấp nhận được để đổi lấy tính đúng của diff, nhưng nó là chi phí thật (§20.5) — [inferred].
- **Encryption at rest chỉ bảo vệ ở trạng thái nghỉ.** Lúc replay, capsule phải được giải mã trên laptop developer — vùng có security posture thấp nhất trong toàn bộ vòng đời. Encryption không giải quyết được điều đó.
- **Capsule bất biến mâu thuẫn cấu trúc với quyền xoá.** Xoá được đòi hỏi biết capsule nào chứa dữ liệu của ai *và* xoá được **mọi** bản copy — nhưng bản chất của §40 (portable) là tạo ra nhiều bản copy. Đây là mâu thuẫn thiết kế thật, không phải hạng mục "chưa làm".
  > ✅ **CHỐT GATE-05b — 2026-08-14 — mâu thuẫn này NAY CÓ LỜI GIẢI ĐƯỢC CHỌN.** Crypto-shredding (`E12`, `SEC-016` = `MUST-V0.1`) trả lời đúng nửa khó: **không cần xoá mọi bản copy** — xoá khoá là đủ để mọi bản copy thành ciphertext vô nghĩa. Mệnh đề trên **được giữ nguyên** vì nó vẫn đúng về *bản chất bất biến của capsule*. ⚠️ Nửa còn lại **vẫn hở**: phải biết *capsule nào chứa dữ liệu của ai* (không gate nào chốt điều này), và lời giải chỉ thực thi được khi `U-06d` (key custody) được trả lời — **BLOCKER**, `GATE-05b-r2`.

## Open items (TBD)

| ID | Unknown | Giải pháp Chốt Chính Thức tại Phase P1 (2026-08-28) | Trạng thái |
|---|---|---|:---:|
| **`U-05`** | Format versioning | Semantic versioning `"1.0.0"` trong `manifest.json`; major khác $\to$ reject fail-closed; minor khác $\to$ warn + replay. | ✅ **Đã đóng** |
| **`U-07`** | Capsule ID vs Trace ID | `capsule_id` là UUIDv7 (kèm timestamp), lưu `trace_id` và `incident_id` như correlation metadata trong `manifest.json`. | ✅ **Đã đóng** |
| **`U-18`** | Vượt size limit ($SEC\text{-}008$) | Ghi nhận capsule kèm cờ `truncated: true`; lúc replay phân loại phân kỳ sang `truncated` (không crash, không fallback gọi thật). | ✅ **Đã đóng** |
| **`U-22`** | Multi-service capsule | Format v1 gắn tag `service_name: "checkout"` cho từng interaction; V0.1 hỗ trợ single-service, sẵn sàng mở rộng V0.3. | ✅ **Đã đóng** |
| **`U-23`** | Language-agnostic | interactions.jsonl sử dụng canonical JSON & byte arrays chuẩn UTF-8, không dùng JS serialization đặc thù. | ✅ **Đã đóng** |
| **`E3`** | Self-contained data payload | Bất biến: dữ liệu không fetch từ production; khoá giải mã nạp just-in-time qua [ADR-012](./ADR-012-Key-Custody.md). | ✅ **Đã đóng** |
| **`SEC-027`** | Capsule integrity verification | Bắt buộc kiểm tra HMAC-SHA256 trước khi parse payload/unzip; từ chối capsule hỏng hoặc bị can thiệp. | ✅ **Đã đóng** |
| **`E12` / `U-06d`** | Key custody & Crypto-shredding | Đã ban hành chính thức [ADR-012 Key Custody Architecture](./ADR-012-Key-Custody.md). | ✅ **Đã đóng** |
| **`THREAT-006`** | Regression test commit an toàn | Chừa sẵn trường `is_derived_sanitized: boolean` trong Header v1 cho V0.2. | ✅ **Đã đóng** |
| Container | Container archive format | Định dạng chuẩn `.repro.tar.gz` (Tarball nén Gzip). | ✅ **Đã đóng** |
### Mâu thuẫn nội tại của `RQ.md` — đã được chốt

> Bối cảnh hai phía bên dưới **được giữ nguyên có chủ đích**. `RQ.md` vẫn tự nói ngược ở chính những section được trích; quyết định của người có thẩm quyền chỉ nói **ta chọn phía nào**, nó không làm mâu thuẫn ở nguồn biến mất. Xoá bằng chứng đi thì về sau không ai hiểu vì sao tài liệu dẫn xuất chọn phía này.

- **`M1` — Regression test generation ở V0.1 hay V0.2?** §26 xếp ở **V0.2**. Nhưng §25 Killer Demo in `✓ Regression case generated`, §30 Developer Journey kết thúc ở *"Regression test"*, và §31 North Star Metric đếm *"converted into regression tests"*. Hệ quả đã phát hiện: **North Star Metric §31 không đo được bằng chính V0.1.** Liên quan trực tiếp tới ADR này vì `THREAT-006` (capsule vào git) đến *qua* tính năng đó, và quyết định về format phải chốt ở V0.1 bất kể tính năng nằm ở phase nào.
  ✅ **ĐÃ CHỐT 2026-08-14** — chọn phía **§26: tính năng giữ ở V0.2**, **không** kéo về V0.1. Metric thành công của V0.1 đổi sang **số bug đạt trạng thái `Execution matched`** (§10); North Star §31 giữ nguyên làm metric **dài hạn, kích hoạt từ V0.2**.
  **Hệ quả cho ADR này**: ràng buộc format của `THREAT-006` **vẫn phải chốt ở V0.1** và nay có thêm một tính chất — **thời điểm tiêu thụ nó đã biết chắc là V0.2**. Format v1 không được thiết kế như thể tính năng đó là chuyện xa vời.
  **Hệ quả nằm ngoài ADR này, ghi để không thất lạc**: `U-04` (*"execution path"* / *"sufficiently equivalent"* — §10 không định nghĩa) nay chặn **chính chỉ số thành công của V0.1**, và §24 **không đặt ngưỡng** cho Execution Match Rate. Xem [SDD-Repro](./SDD-Repro.md) §6.5 và §8.3.
- **`M2` — Access control / Retention policies / Enterprise security thuộc OSS core hay commercial?** §28 xếp cả bốn (Access control, Retention policies, Team management, Enterprise security) vào **commercial layer**, OSS core chỉ có *"Basic Self-hosting"*. Nhưng §20.5 + §21 (cột "MVP?") coi strict access control là **MVP = Yes**, và §20.17 yêu cầu **audit logs** như mitigation cho risk `🟠 High`. Hệ quả đã phát hiện: **bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật — lại là bản không có control bảo mật.** Liên quan tới ADR này vì encryption at rest (§16), retention (§20.17) và crypto-shredding (`E12`) đều là control áp lên capsule; nếu chúng nằm ở commercial layer thì các quyết định #7 và `E12` chỉ có hiệu lực với bản trả phí.
  ✅ **ĐÃ CHỐT 2026-08-14** — **authentication + authorization + audit log nằm trong OSS core**, **ghi đè có chủ đích** phần §28 xếp *Access control* và *Retention policies* vào commercial layer. Giữ nguyên ở commercial layer theo §28: `Hosted storage`, `Team management`, `Analytics`, `AI analysis`, `Cloud integrations`. Lý do: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì* — thiếu authz thì bản self-host là bản ai đăng nhập cũng đọc được mọi capsule production; thiếu audit thì tổ chức kiểm soát được nhưng **không chứng minh được** (§20.17).
  **Hệ quả cho ADR này**: capsule bất biến nay có một tập control **chắc chắn tồn tại trong bản OSS** để áp lên — quyết định #7 và mọi phát biểu về *ai đọc được capsule nào* không còn chỉ có hiệu lực với bản trả phí. **Nhưng `E12` (crypto-shredding) KHÔNG nằm trong quyết định này** — nó giữ nguyên nhãn ***cần validate***, xem dòng `E12` ở bảng trên. `Retention policies` cũng chưa được phán xử; hook retention vẫn như cũ.
  > ⚠️ **CẬP NHẬT 2026-08-14 — ba mệnh đề cuối của gạch đầu dòng `M2` ở trên nói về PHẠM VI CỦA M2 và VẪN ĐÚNG NHƯ VẬY; nhưng chúng KHÔNG còn là trạng thái mới nhất của tài liệu.** Hai quyết định gate cùng ngày đã chạm đúng những chỗ mà M2 để ngỏ:
  > - **`E12` (crypto-shredding)** — ✅ **CHỐT GATE-05b — 2026-08-14**: `SEC-016` = **`MUST-V0.1`**. Nhãn *cần validate* **đã được gỡ**. Capsule **không còn self-contained tuyệt đối** ⇒ `GATE-05b-r`, xem §Consequences.
  > - **`Retention policies`** — ✅ **CHỐT GATE-05a — 2026-08-14**: TTL mặc định **30 ngày** (`SEC-022`), vẫn cấu hình được; 30 ngày là mặc định khi không cấu hình. Hook retention **nay có giá trị**, không còn *"như cũ"*.
  > - **`Enterprise security`** (§28) — ⚠️ **vẫn chưa được phán xử**, `TBD`.
  >
  > Nhãn **`M2` ✅ ĐÃ CHỐT 2026-08-14 ở trên KHÔNG bị thay đổi**: nó thuộc quyết định `D2`, và phạm vi của nó đúng như đã ghi. Hai họ nhãn không được đọc lẫn.

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-001: Replay Execution, Not Environment](./ADR-001-Replay-Execution-Not-Environment.md)
- [ADR-003: Database Record/Replay, Not Snapshot](./ADR-003-Database-Record-Replay-Not-Snapshot.md)
- [ADR-004: Record/Replay External Inputs At Boundary](./ADR-004-Record-Replay-External-Inputs-At-Boundary.md)
- [ADR-006: Execution Verification By Equivalence](./ADR-006-Execution-Verification-By-Equivalence.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
- Nguồn sự thật: [RQ.md](../../999-Resources/RQ.md)
