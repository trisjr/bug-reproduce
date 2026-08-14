---
id: ADR-002
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
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
2. **Layout v1 theo §6**: `manifest.json`, `request.json`, `environment.json`, `feature-flags.json`, `database/query-NNN.json`, `network/<dependency>.json`, `metadata.json`.
3. **Capsule tự chứa (self-contained) — bất biến của V0.1.** Mọi thứ cần để replay nằm trong capsule; **không** có thao tác fetch dữ liệu từ production tại thời điểm replay. Cụm *"lazy loading"* ở §20.12 được diễn giải là **lazy khi *đọc* capsule** (không nạp toàn bộ vào memory), **không phải** lazy fetch từ production. Đây là **diễn giải có chủ ý**, ghi ra chứ không giấu: nó là cách đọc duy nhất giữ được đồng thời §6 (*"only the information necessary"*), §40 (*portable*) và §20.12.
   > ⚠️ ✅ **CHỐT GATE-05b — 2026-08-14 — quyết định #3 BỊ THU HẸP, đọc kèm §Consequences.** `SEC-016` crypto-shredding nay là **`MUST-V0.1`**: khoá giải mã giữ **phía server**, `replay` lấy khoá just-in-time. ⇒ Capsule **không còn self-contained tuyệt đối**. Hai vế phải đọc tách nhau: *"không fetch **dữ liệu** từ **production** lúc replay"* — **vẫn đúng nguyên vẹn**, đây là phần bất biến còn lại; *"mọi thứ cần để replay nằm trong capsule"* — **không còn đúng**, vì **khoá không nằm trong capsule**. Hệ quả được ghi tường minh và **được chấp nhận có ý thức** ở §Consequences → `GATE-05b-r`.
4. **Format version bắt buộc có trong `manifest.json` từ v1.** Replay runtime gặp major version không nhận ra ⇒ **từ chối replay**, không đoán.
5. **Manifest PHẢI có chỗ chứa hash/signature từ v1, và replay runtime PHẢI verify TRƯỚC KHI parse payload** (`SEC-027`). Thứ tự này là bắt buộc: verify sau khi parse là không có tác dụng, vì chính bước parse là bước bị tấn công. Kèm theo: mọi entry path phải được canonicalize và từ chối path thoát khỏi thư mục capsule; giới hạn tỉ lệ giải nén và kích thước sau giải nén; deserialize không được cho phép key nguyên mẫu (`__proto__`, `constructor`, `prototype`) tạo thuộc tính; manifest **không** được quyền chỉ định module để runtime load.
6. **Quản lý kích thước theo §20.12**: compression, deduplication, content hashing, size limits, selective capture. Content hashing phục vụ đồng thời dedup và integrity.
7. **Encryption at rest được hỗ trợ** (§16, §20.6).
8. **Capsule PHẢI ghi lại *field nào đã bị redact*** (dấu vết redaction, không phải giá trị gốc) để Execution Diff phân biệt được *"diverged vì code"* với *"diverged vì redaction"*. Hai lens độc lập cùng kết luận điều này ⇒ ghi như quyết định, không phải TBD.
9. **Capsule là artifact bất biến.** Sau khi ghi xong, không sửa tại chỗ. Mọi biến đổi (ví dụ sinh bản dẫn xuất đã khử dữ liệu để commit vào git) tạo ra artifact mới có identity riêng.

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

| ID | Unknown | Phương án đề xuất (nhãn) | Nó chặn cái gì |
|---|---|---|---|
| **`U-05`** | **Format versioning** — cơ chế cụ thể chưa có trong RQ.md, nhưng **phải có từ v1**. | Trường version trong `manifest.json`; semantic major/minor; major lạ ⇒ từ chối replay, minor lạ ⇒ replay + cảnh báo. *cần validate*. | Chặn mọi câu chuyện tương thích recorder ↔ runtime; chặn `repro pull`/`inspect` với capsule cũ; chặn khả năng tiến hoá của chính format này. |
| **`U-07`** | **Capsule ID vs trace ID.** §8 dùng `repro pull 1842`; §2.1 hiển thị `ERROR #1842` **và** `Trace ID: abc123` như hai thứ khác nhau. RQ.md không nói capsule id là incident id, là trace id, hay là id riêng. | Capsule có id riêng, mang *tham chiếu* tới incident id và trace id trong `manifest.json`. *cần validate*. | Chặn cách đánh địa chỉ của `repro list/pull/inspect/replay/diff/verify` (§18); chặn tương quan với observability (§34); chặn `U-22`. |
| **`U-18`** | **Hành vi khi vượt size limit.** §20.12 nêu *"size limits"* nhưng RQ.md không nói chuyện gì xảy ra khi vượt: truncate, bỏ capture, hay tạo capsule đánh dấu không đầy đủ. | Capsule vẫn được tạo nhưng đánh dấu *incomplete* + ghi rõ phần nào bị cắt; lúc replay, phần thiếu áp `E9` (divergence + incomplete capture, không crash, **không** fallback gọi hệ thống thật). *cần validate*. | Chặn exception flow của use case capture; chặn ngữ nghĩa `incomplete` mà ADR-003/005/006 đều tham chiếu. |
| **`U-22`** | **Multi-service capsule.** §14 đặt service boundary làm replay boundary; §26 xếp "Multi-service replay" ở V0.3. Format v1 có chừa chỗ cho >1 service không? | Chừa chỗ ở cấu trúc (mỗi interaction mang định danh service) nhưng V0.1 chỉ ghi một service. *cần validate*. | Chặn hình dạng format v1 — thêm sau là thay đổi major. |
| **`U-23`** | **Language-agnostic.** §18 giới hạn V0.1 ở Node.js; §26 thêm Python/Go ở V0.3. Format v1 có trung lập ngôn ngữ không? | Trung lập ngôn ngữ ngay từ v1: cấm mọi ngữ nghĩa serialize đặc thù JavaScript. *cần validate*. | Chặn khả năng mở rộng ở V0.3 mà không phá format; chặn lựa chọn encoding cho `database/` và `network/`. |
| **`E3`** | **Self-contained là bất biến** — đã chốt (quyết định #3), ghi ở đây vì nó là **diễn giải** của §20.12 chứ không phải nguyên văn RQ.md. | — (đã chốt) | Nếu diễn giải này bị lật, toàn bộ mô hình bảo mật và tính portable (§40) phải thiết kế lại. |
| **`SEC-027`** | **Capsule integrity** — hash/signature phải có chỗ trong manifest từ v1 (đã chốt là *phải có chỗ*). Chưa chốt: ai ký, khoá phân phối thế nào, capsule **không** ký thì từ chối hay cảnh báo. | V0.1 tối thiểu: hash toàn vẹn bắt buộc + verify trước khi parse; signature để ngỏ cho self-host. *cần validate*. | Chặn việc đóng `THREAT-009`; chặn thiết kế `repro pull` (verify ở đâu — lúc pull hay lúc replay, hay cả hai). |
| **`E12`** | ✅ **Crypto-shredding — ĐÃ CHỐT `MUST-V0.1`** (`SEC-016`), ✅ **CHỐT GATE-05b — 2026-08-14**, người quyết **`@TrisJr`**. Nhãn cũ ***"cần validate — đánh đổi với replay offline chưa được giải"*** **đã được gỡ**. 📌 **M2 (✅ ĐÃ CHỐT 2026-08-14) KHÔNG chạm tới mục này** — mệnh đề đó **vẫn đúng về M2** (M2 chỉ nói về authn + authz + audit) — **nhưng `GATE-05b` THÌ CÓ CHẠM**, và chính nó đã chốt mục này. | ✅ **Đã chọn**: khoá riêng từng capsule giữ phía server, lấy just-in-time lúc replay; xoá = phá khoá. ⇒ **Ràng buộc lên format v1**: manifest **bắt buộc** có chỗ chứa **key reference** (không retrofit được). | ✅ **Đã mở khoá**: câu trả lời GDPR right-to-erasure (cơ chế đã có); và câu hỏi *capsule có replay offline được hay không* **đã được trả lời — KHÔNG**, replay cần khoá từ store (`GATE-05b-r`, xem quyết định #3 và §Consequences). ⚠️ **Vẫn chặn**: **thiết kế key management của bản self-host** — `U-06d` nay là **BLOCKER** (`GATE-05b-r2`), xem [ADR-009](./ADR-009-Private-Self-Hosted-Topology.md) §Open items. |
| **`THREAT-006`** | **Capsule vào git vĩnh viễn qua regression test V0.2.** **Phải chốt ở V0.1** vì ràng buộc format. **M1 ✅ ĐÃ CHỐT 2026-08-14**: tính năng ở **V0.2** — thời điểm nay **đã biết chắc**, ràng buộc format **không** vì thế mà nhẹ đi. | Format v1 chừa chỗ cho *artifact dẫn xuất đã khử dữ liệu* và/hoặc cờ `not-for-commit`; regression test sinh ra ở V0.2 chỉ được dùng artifact dẫn xuất. *cần validate*. | Chặn hình dạng format v1; chặn thiết kế tính năng V0.2; chặn cam kết retention (§20.17) vì git history bất biến. |
| — | **Container format** (thư mục / tar / zip) và encoding chuẩn cho từng entry. | TBD | Chặn quyết định #5 (canonicalize path, giới hạn giải nén chỉ có nghĩa với container nén). |

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
