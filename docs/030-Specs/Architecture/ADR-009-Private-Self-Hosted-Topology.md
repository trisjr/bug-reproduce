---
id: ADR-009
type: adr
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# ADR-009: Private / Self-Hosted Topology

**Decision status**: Proposed
**Related to**: [SDD-Repro](./SDD-Repro.md)

## Context

Repro Capsule chứa dữ liệu production thật. §16 liệt kê những gì có thể bị bắt: `user data`, `authentication information`, `database results`, `HTTP headers`, `API responses`, `internal service data`. §20.5 (*Sensitive Production Data — Critical*) nói lại bằng ngôn ngữ rủi ro: `PII`, `credentials`, `tokens`, `financial information`, `internal data`.

§20.6 (*Security Attack Surface — Critical*) đưa ra topology được khuyến nghị dưới dạng một sơ đồ bốn tầng, nguyên văn:

```text
Production
    ↓
Private Recorder
    ↓
Encrypted Capsule
    ↓
Private Storage
```

kèm câu chốt: *"rather than requiring production data to be sent to a public SaaS by default."*

§16 nói cùng một điều ở tầng sản phẩm: *"Organizations should be able to run Repro entirely inside their own infrastructure."* §21 chốt lại thành hai dòng có thẩm quyền: `Security exposure / Critical / MVP? Yes / Private/self-hosted architecture` và `Compliance / High / MVP? Yes / Policies + self-hosting`.

### Lý do nâng cấp: lập luận compliance mạnh hơn lập luận bảo mật

§20.6 lập luận cho self-hosting bằng **bảo mật**: *"A compromised Repro storage or collector could expose production information."* Lập luận đó đúng nhưng **không đủ mạnh để bắt buộc** — một nhà cung cấp SaaS đủ tốt hoàn toàn có thể có security posture cao hơn khách hàng tự vận hành. Nếu chỉ dựa vào §20.6, self-hosting là *nên có*, không phải *bắt buộc*.

Lập luận **compliance** thì bắt buộc, và ADR này ghi nó là lý do chính:

- Self-hosting là **thứ duy nhất** giúp tổ chức **không phải đưa nhà cung cấp Repro vào vai processor** đối với dữ liệu production. Ngay khi capsule rời hạ tầng của tổ chức, quan hệ processor phát sinh cùng toàn bộ nghĩa vụ hợp đồng và trách nhiệm giải trình đi kèm.
- Self-hosting là **thứ duy nhất** giúp **không phát sinh transfer xuyên biên giới**. Capsule đi ra khỏi khu vực tài phán là một sự kiện có nghĩa vụ pháp lý riêng, độc lập với việc nó được mã hoá tốt đến đâu.
- §20.17 (*Compliance / Legal — High*) đã liệt kê `GDPR`, `HIPAA`, `PCI DSS`, `SOC 2`, `internal security policies`, và mitigation của nó bao gồm cả `self-hosting` lẫn `data residency where required` — nhưng §20.17 xếp self-hosting ngang hàng với các mitigation khác, **không** nhận ra rằng nó là điều kiện *cần* để những mục còn lại có nghĩa.

Đây là một **nâng cấp so với RQ.md**, không phải một cách diễn đạt lại: chuyển self-hosting từ *khuyến nghị vì bảo mật* (§20.6) thành *bắt buộc vì compliance*.

§38 Q12 hỏi *"Is self-hosting required from day one?"* và RQ.md **để ngỏ**. Ba lens độc lập của run này (kiến trúc, business analysis, security) đều kết luận **có**. Quyết định **E7** chốt: **self-hosting bắt buộc từ V0.1**, lý do mạnh nhất là compliance.

### Khoảng trống: Capsule Store hoàn toàn chưa được đặc tả

§8 định nghĩa `repro pull 1842` và §18 định nghĩa `repro list` trong danh sách CLI. Hai lệnh này **hàm ý tồn tại một store ở xa, có API và có auth** — `pull` phải kéo từ đâu đó, `list` phải hỏi ai đó. §20.6 vẽ ô `Private Storage`. §28 xếp `Basic Self-hosting` vào OSS core.

Nhưng **RQ.md không có một dòng đặc tả nào cho thành phần này**: không API, không auth, không storage backend, không mô hình triển khai, không mô hình định danh capsule (`1842` là gì và ai cấp).

Tệ hơn, nó va thẳng vào chính guardrail của RQ.md: §20.15 liệt kê **`Artifact storage`** như một biểu hiện của scope explosion, và §20.14 cảnh báo *"If integration requires significant infrastructure, adoption will suffer."* Tức là §8/§18/§28 **đòi** phải có store, còn §20.14/§20.15 **cảnh báo** đừng xây store. Đây là `U-06` — khối việc lớn nhất bị ẩn của cả tài liệu, ảnh hưởng trực tiếp tới ước lượng MVP.

## Decision

### D1 — Topology mặc định và duy nhất của V0.1

```text
Production (in-process Recorder, ADR-007)
    ↓  capture
Encrypted Repro Capsule
    ↓  recorder tự upload
Private Storage do tổ chức cấu hình và vận hành
    ↓  repro pull
Máy developer
```

**Không** có bước nào gửi dữ liệu production tới một dịch vụ SaaS công cộng. **Không** có chế độ mặc định nào yêu cầu điều đó. Self-hosting là **cấu hình mặc định và là con đường duy nhất được hỗ trợ ở V0.1** (E7), không phải một tuỳ chọn nâng cao.

### D2 — Recorder tự upload; CLI không có lệnh push

Recorder mã hoá capsule rồi **tự đẩy** lên private storage do tổ chức cấu hình. `repro pull` (§8) đọc từ đó. **Không có lệnh push phía CLI** — danh sách CLI của §18 gồm đúng `list`, `pull`, `inspect`, `replay`, `diff`, `verify` và **không có** `push`. Việc đưa capsule từ production về storage **không phải việc của developer** (quyết định **E8**).

Hệ quả: đường đi của dữ liệu production là một chiều, do hạ tầng kiểm soát, không đi qua máy developer trước khi vào storage.

### D3 — Capsule Store ở mức TỐI THIỂU, không phải một service đầy đủ

Theo **E8**, V0.1 đặc tả Capsule Store ở mức nhỏ nhất còn thoả được §8 và §18:

- **Một backend lưu trữ object/file** do tổ chức tự chọn và tự vận hành.
- **Một index** đủ để `repro list` (§18) trả về danh sách capsule và để `repro pull <id>` (§8) định vị được một capsule.
- ✅ **Authentication + authorization + audit hook** — **bắt buộc**, thuộc OSS core theo **M2 (ĐÃ CHỐT 2026-08-14, D6)**. Đây là phần **sửa đổi so với bản đầu của D3**: sàn tối thiểu không còn là "object storage + index" thuần tuý.

Và **không** gồm: web dashboard, retention engine, team/tenant management, analytics. §20.15 đã cảnh báo `Artifact storage`; §19 đã loại `Large observability dashboard`; §28 xếp `Analytics` và `Team management` ở tầng thương mại — ba mục sau vẫn ở tầng thương mại sau M2.

**API và *cơ chế* auth của store vẫn là `TBD` tường minh** — xem §Open items `U-06`. M2 chốt **việc phải có** authn/authz/audit và **chỗ đứng** của chúng (OSS core), **không** chốt chúng được hiện thực thế nào. Cơ sở giữ nguyên: §38 Q12 là **chỗ duy nhất RQ.md chạm tới mô hình triển khai**, và nó là một **câu hỏi**, không phải một đặc tả. Viết một Decision dứt khoát về API/cơ chế auth ở đây sẽ là bịa.

### D4 — Mã hoá là bắt buộc trước khi capsule rời process

§16 nói *"Capsules should support encryption at rest"*; §20.6 đặt `Encrypted Capsule` **giữa** recorder và storage. ADR này đọc §20.6 theo nghĩa mạnh hơn §16: capsule được mã hoá **trước khi rời process của ứng dụng**, nên private storage không bao giờ thấy plaintext. Điều đó khiến bảo đảm bảo mật **không phụ thuộc** vào chất lượng cấu hình storage của từng tổ chức — đúng tinh thần §20.6, vốn lo về *"a compromised Repro storage or collector"*.

### D5 — Crypto-shredding: ràng buộc ĐỀ XUẤT, chưa chốt

Lens `security-auditor` chỉ ra crypto-shredding là **cơ chế duy nhất** biến ranh giới storage → laptop developer từ **bất khả hồi** thành **khả hồi**: mỗi capsule mã hoá bằng một key riêng giữ phía server, `replay` lấy key just-in-time ⇒ **xoá dữ liệu = phá key**, và mọi bản sao đã nằm trên laptop/chat/git lập tức thành ciphertext vô nghĩa.

Ghi vào đây như một **ràng buộc thiết kế được đề xuất**, gắn nhãn:

> **cần validate — đánh đổi với replay offline chưa được giải** (quyết định **E12**)

Đánh đổi: crypto-shredding **làm mất khả năng replay offline** và làm tăng độ phức tạp của bản self-host. RQ.md **không đề cập** crypto-shredding ở bất kỳ đâu; §20.17 chỉ nêu `deletion` như một mitigation mà không nói cơ chế. Không được viết như đã chốt.

> 📌 **M2 (✅ ĐÃ CHỐT 2026-08-14, D6) KHÔNG chạm tới D5.** Quyết định đó chỉ nói về authn + authz + audit. Crypto-shredding giữ nguyên nhãn ***cần validate***.

### D6 — Mâu thuẫn M2: ✅ **ĐÃ CHỐT 2026-08-14**

**Đây là mâu thuẫn nội tại của RQ.md.** ADR này không có thẩm quyền phân xử, và đã không tự phân xử — người có thẩm quyền đã chốt ngày 2026-08-14. **Bối cảnh hai phía bên dưới được giữ nguyên**: RQ.md vẫn tự nói ngược ở chính §28 vs §20.5/§21, quyết định chỉ nói ta chọn phía nào.

| Phía | Văn bản |
|---|---|
| **Access control thuộc tầng thương mại** | **§28** liệt kê OSS core gồm đúng: `Repro SDK`, `Recorder`, `Replay Runtime`, `Capsule Format`, `CLI`, **`Basic Self-hosting`**. Và xếp `Access control`, `Retention policies`, `Team management`, `Enterprise security` vào **commercial layer**. |
| **Access control là MVP** | **§20.5** liệt kê mitigation cho *Sensitive Production Data — Critical* gồm `configurable retention`, `self-hosting`, **`strict access control`**. **§21** chốt `Sensitive data / Critical / MVP? Yes`. |

**Hệ quả đã phát hiện:** bản self-host — **đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật, và ADR này bắt buộc vì lý do compliance** — lại là bản **không có control bảo mật**. Tổ chức chọn self-host để tránh rủi ro sẽ nhận được một store không có access control, không có retention policy, không có audit.

Hai lens độc lập của run này tìm ra cùng chỗ này (`THREAT-008` của security lens, `FR-025` của BA lens). Security lens khuyến nghị mạnh: authn/authz phải nằm trong **OSS core**, lập luận *"bán access control như tính năng trả phí, trong khi sản phẩm cốt lõi bê dữ liệu production ra ngoài, là một tư thế không bảo vệ được"*.

**Đề xuất của lens kiến trúc (nêu tại thời điểm viết ADR):** đưa **authn/authz + audit log + retention TTL** vào OSS core; giữ ở tầng thương mại những thứ *quy mô tổ chức* (team management, SSO/SCIM, analytics, hosted storage) chứ không phải những thứ *điều kiện an toàn tối thiểu*. Lý do: §28 tự nói *"The commercial model should only be defined after validating developer adoption and the core replay capability"* — nghĩa là chính §28 **chưa phải là một quyết định đã chốt**, nên nó không nên thắng §20.5/§21.

---

#### ✅ **QUYẾT ĐỊNH 2026-08-14 — chọn phía §20.5/§21**

**Authentication + authorization (access control) + audit log nằm trong OSS core.** Đây là **ghi đè có chủ đích** phần §28 xếp *Access control* và *Retention policies* vào commercial layer.

| Control | Trả lời câu hỏi | Thiếu nó thì |
|---|---|---|
| **Authentication** | *Bạn là ai?* | Không có chủ thể để gắn quyền hay gắn audit record |
| **Authorization** | *Bạn xem được capsule nào?* | Bản self-host là bản **ai đăng nhập cũng đọc được mọi capsule production** |
| **Audit log** | *Ai đã pull cái gì?* | Tổ chức **kiểm soát được nhưng không chứng minh được** — §20.17 yêu cầu audit log như mitigation cho risk `🟠 High` |

**Giữ nguyên ở commercial layer theo §28**: `Hosted storage`, `Team management`, `Analytics`, `AI analysis`, `Cloud integrations`.

**Không thuộc phạm vi quyết định này**: `Retention policies` và `Enterprise security` của §28 — chưa được phán xử. Giá trị TTL retention vẫn là `U-06b` bên dưới; crypto-shredding vẫn là **D5**, nhãn *cần validate*.

**Hệ quả trực tiếp lên chính ADR này**: mâu thuẫn *"bản self-host được khuyến nghị vì bảo mật lại là bản không có control bảo mật"* **đã được giải quyết**. Khuyến nghị self-host của ADR này nay đứng vững **cả ở ranh giới tổ chức lẫn bên trong ranh giới đó** — chứ không còn "chỉ đúng một nửa".

**Hệ quả lên D3**: Capsule Store tối thiểu **không còn là** *"object/file storage + một index"* thuần tuý. Sàn tối thiểu nay là **object/file storage + index + authn + authz + audit hook**. Điều này **thu hẹp** `U-06` nhưng **không giải** `U-06` — API và **cơ chế** auth vẫn `TBD` tường minh, xem §Open items. Nó cũng **loại C4** (*capsule là file chuyển tay*) khỏi tập phương án còn thoả sàn. Chi phí của việc nâng sàn được ghi ở §Consequences → Negative, **không được giấu**.

## Alternatives considered

| # | Alternative | Nhãn | Căn cứ |
|---|---|---|---|
| C1 | **Public SaaS mặc định** — recorder gửi capsule tới collector/storage do nhà cung cấp vận hành | **[stated]** — **§20.6** loại nguyên văn: *"rather than requiring production data to be sent to a public SaaS by default"*; **§28** đối lập trực tiếp `Self-hosted → Private Repro infrastructure` với `Production → Third-party SaaS` | Ưu: onboarding rẻ nhất, đúng hướng §20.14. Nhược: đặt nhà cung cấp vào vai processor và tạo transfer xuyên biên giới — hai thứ §20.17 phải né. Bị loại tường minh. |
| C2 | **Hybrid — private recorder + hosted storage của nhà cung cấp** | **[stated]** — sơ đồ **§20.6** kết thúc ở `Private Storage`, không ở storage của bên thứ ba; **§28** xếp `Hosted storage` vào **commercial layer**, tức là tuỳ chọn cộng thêm chứ không phải nền | Ưu: tổ chức không phải vận hành storage. Nhược: capsule vẫn rời hạ tầng tổ chức ⇒ lập luận compliance ở §Context bị vô hiệu hoàn toàn. Có thể là sản phẩm thương mại sau này, **không** phải mặc định V0.1. |
| C3 | **Capsule Store đầy đủ ngay V0.1** — API + authn/authz + web UI + retention engine + multi-tenant | **[stated]** — **§20.15** liệt kê `Artifact storage` như biểu hiện của scope explosion khiến *"the project too large"*; **§20.14** cảnh báo *"significant infrastructure"* hại adoption; **§19** loại `Large observability dashboard` | Ưu: giải quyết dứt điểm `U-06` và cả M2. Nhược: bị hai risk Critical của RQ.md chặn; và biến V0.1 từ "chứng minh replay được" (§39) thành "xây một nền tảng". **Sau M2 (✅ ĐÃ CHỐT 2026-08-14)**: khoảng cách giữa D3 và C3 đã **thu hẹp** — sàn tối thiểu nay gồm authn/authz/audit — nhưng C3 **vẫn bị loại**: nó còn thêm web UI, retention engine và multi-tenant, những thứ §19/§20.15/§28 vẫn để ngoài V0.1. |
| C4 | **Không có store — capsule là file chuyển tay** (chat/scp/email) | **[inferred]** — RQ.md không nêu phương án này | Ưu: MVP **nhỏ hơn nhiều**; loại bỏ hoàn toàn `U-06`. Nhược: mâu thuẫn trực tiếp với §8 (`repro pull 1842`) và §18 (`repro list`) — hai lệnh này vô nghĩa nếu không có store; và chuyển-tay là con đường đưa dữ liệu production vào chat/git nhanh nhất. Bị loại, nhưng **đây là alternative đáng cân nhắc lại nếu `U-06` làm vỡ ước lượng**. **Sau M2 (✅ ĐÃ CHỐT 2026-08-14)**: C4 **không còn thoả sàn tối thiểu** — không có store thì không có chỗ đặt authn/authz/audit, tức là không có nơi nào trả lời được *ai xem được capsule nào* và *ai đã pull gì*. Loại bỏ dứt điểm, kể cả như phương án dự phòng cho ước lượng. |
| C5 | **Developer push capsule bằng CLI** (`repro push`) | **[inferred]** — RQ.md không nêu; bằng chứng là **sự vắng mặt**: danh sách CLI §18 gồm đúng sáu lệnh và **không có** `push`. Vắng mặt không phải loại bỏ tường minh, nên nhãn là `[inferred]` | Bị loại theo **E8**: nếu developer phải push thì capsule phải đi qua máy developer *trước khi* vào storage — đảo ngược thứ tự tin cậy và đưa dữ liệu production sang vùng có security posture thấp nhất trước khi nó được quản lý. |
| C6 | **BYO-bucket thuần, không index** — chỉ cấu hình một bucket, không có lớp danh mục | **[inferred]** — RQ.md không nêu | Nhược: `repro list` (§18) không hiện thực được một cách hữu dụng nếu không có tối thiểu một index. Đây chính là lý do D3 giữ lại "một index" thay vì chỉ "object storage". |
| C7 | **Gửi capsule qua hệ thống observability sẵn có** của tổ chức (§34: Sentry/APM) thay vì store riêng | **[inferred]** — §34 chỉ nói Repro *bổ trợ* các hệ thống đó, **không** nói dùng chúng làm kênh vận chuyển | Nhược: đẩy dữ liệu production nhạy cảm vào một SaaS bên thứ ba khác ⇒ lặp lại đúng vấn đề của C1 dưới tên khác. |

## Consequences

### Positive

- **Lập luận compliance đứng vững.** Dữ liệu production không rời tổ chức ⇒ không phát sinh quan hệ processor với nhà cung cấp, không phát sinh transfer xuyên biên giới, và `data residency` (§20.17) được thoả mãn theo cấu trúc chứ không bằng cấu hình.
- **Bề mặt tấn công thu nhỏ đúng như §20.6 muốn.** Không tồn tại một kho tập trung chứa dữ liệu production của nhiều tổ chức — mục tiêu giá trị cao nhất bị loại bỏ ngay ở mức topology.
- **Mã hoá trước khi rời process (D4)** khiến bảo đảm không phụ thuộc vào chất lượng cấu hình storage của từng tổ chức.
- **Recorder tự upload (D2)** giữ đường đi dữ liệu một chiều và do hạ tầng kiểm soát; developer chỉ có quyền đọc.
- **Là lợi thế cạnh tranh, không chỉ là chi phí.** §28 nhận định Repro là ứng viên mạnh cho open source **chính vì** dữ liệu execution production rất nhạy cảm. Self-host mặc định biến ràng buộc compliance thành lý do để chọn Repro.
- **Giữ được kỷ luật phạm vi.** D3 ở mức tối thiểu tôn trọng cả §20.15 (`Artifact storage`) lẫn §20.14 (*significant infrastructure*) — dù sàn tối thiểu đã bị M2 nâng lên, xem §Negative.
- ✅ **M2 (ĐÃ CHỐT 2026-08-14) làm khuyến nghị self-host của ADR này đứng vững hoàn toàn.** Trước đó, khuyến nghị này **chỉ đúng một nửa**: nó bảo vệ được ranh giới tổ chức nhưng không bảo vệ được bên trong ranh giới đó. Với authn + authz + audit thuộc **OSS core**, bản self-host — bản mà §20.6 khuyến nghị vì bảo mật và ADR này bắt buộc vì compliance — **là bản có control bảo mật**. Nghịch lý được ghi ở D6 **đã được giải quyết**.
- ✅ **Mitigation của §20.5 và §20.17 nay có hiệu lực với mọi người dùng, không chỉ khách trả phí.** §20.5 liệt kê `strict access control` và §20.17 liệt kê `audit logs` như mitigation cho risk `🔴 Critical` / `🟠 High` với cột `MVP? = Yes` (§21). Chừng nào chúng còn ở commercial layer thì mitigation cho risk MVP chỉ tồn tại ở bản trả phí — một tư thế không đứng được. M2 đóng khoảng hở đó.
- ✅ **Audit làm ranh giới `storage → laptop` từ *"không quan sát được"* thành *"quan sát được một nửa"*.** Store nay chắc chắn ghi được **ai đã pull capsule nào** — tổ chức không chỉ kiểm soát được mà còn **chứng minh được** phần trước ranh giới. Lưu ý: phần **sau** ranh giới vẫn không quan sát được (xem §Negative) — audit **không** giải `U-06e`.

### Negative

- **Chi phí vận hành bị đẩy sang người dùng — đánh thẳng vào risk Critical §20.14.** Tổ chức phải cấu hình và vận hành storage trước khi thấy được giá trị đầu tiên. §20.14 đặt tiêu chuẩn *"capture the first replayable execution with minimal configuration"*; self-host mặc định **kéo ngược** tiêu chuẩn đó. Đây là xung đột thật giữa hai risk Critical (§20.6/§20.17 vs §20.14) và ADR này **chọn phía compliance**, chấp nhận trả giá bằng ma sát onboarding.
- **`U-06` chưa giải ⇒ ước lượng MVP chưa đứng được.** Đây là hệ quả nghiêm trọng nhất về kế hoạch: một khối việc bắt buộc (store + index + authn + authz + audit) đang không có đặc tả nào. **M2 làm khối việc này lớn hơn, không nhỏ đi** — xem gạch đầu dòng kế tiếp và §Open items.
- ⚠️ **M2 (✅ ĐÃ CHỐT 2026-08-14) làm TĂNG phạm vi hiện thực của V0.1 — đây là cái giá thật của quyết định, không được giấu.** Trước M2, sàn tối thiểu của D3 là *object storage + index*; sau M2, nó là *object storage + index + authn + authz + audit hook*. Ba control này **không phải add-on hoãn được sang V0.2** — chúng là điều kiện để bản self-host có nghĩa, nên chúng nằm trong V0.1.
  Hệ quả là quyết định này **va thẳng vào hai cảnh báo của chính RQ.md**:
  - **§20.14** — *"If integration requires significant infrastructure, adoption will suffer."* Tổ chức nay phải dựng thêm mô hình danh tính và lưu trữ audit trước khi thấy giá trị đầu tiên, trong khi §20.14 đặt tiêu chuẩn *"capture the first replayable execution with minimal configuration"*.
  - **§20.15** — liệt kê **`Artifact storage`** như một biểu hiện của scope explosion khiến *"the project too large"*. M2 đẩy Capsule Store đi **đúng hướng mà §20.15 cảnh báo**, tiến gần alternative **C3** vốn đã bị loại vì lý do phạm vi.
  ADR này **chọn phía bảo mật/compliance** và chấp nhận trả giá bằng phạm vi và ma sát onboarding — cùng một kiểu đánh đổi đã làm ở gạch đầu dòng trên, nhưng lần này với chi phí lớn hơn. Người lập kế hoạch MVP phải đọc `U-06` với sàn **mới**, không phải sàn cũ.
- ⚠️ **Nghịch lý M2 đã được giải, nhưng lời giải nằm ở tầng *chỗ đứng*, không ở tầng *cơ chế*.** M2 chốt authn/authz/audit **thuộc OSS core**; nó **không** nói chúng hoạt động thế nào. Chừng nào `U-06` chưa có đặc tả auth, phát biểu *"bản self-host có control bảo mật"* đúng về **cam kết đóng gói** nhưng chưa kiểm chứng được về **hiện thực**. Không được đọc M2 như thể authz đã được thiết kế xong.
- **Audit không vượt được ranh giới `storage → laptop`.** M2 bảo đảm store ghi được *ai đã pull gì*; nó **không** ghi được *capsule sau đó đi đâu*. `U-06e` giữ nguyên, và lập luận về tính bất khả hồi ở gạch đầu dòng dưới **không** vì M2 mà nhẹ đi.
- **Self-hosting dời mục tiêu tấn công chứ không xoá nó.** §20.6 tự thừa nhận *"A compromised Repro storage or collector could expose production information."* Câu đó vẫn đúng nguyên vẹn sau quyết định này — chỉ là kho bị xâm nhập bây giờ thuộc về tổ chức. Với tổ chức có đội bảo mật mỏng, self-host **có thể có posture kém hơn** một SaaS chuyên nghiệp. Lập luận bắt buộc ở §Context là **compliance**, không phải "self-host thì an toàn hơn" — sự phân biệt này phải được giữ trong mọi tài liệu phái sinh.
- **Ranh giới storage → laptop developer là điểm bất khả hồi.** Lens `security-auditor` xếp đây là boundary **nguy hiểm nhất** với năm lý do, đáng chú ý là: nó bị vượt qua **trên happy path chứ không do bị tấn công** (`repro pull` *là* tính năng ⇒ càng adoption cao càng nhiều dữ liệu production nằm trên laptop); sau ranh giới đó **không còn audit** (storage log được "ai pull", không log được "capsule sau đó đi đâu"); và nó **nhân bản asset** (một capsule → N bản trên N laptop, trong khi retention policy chỉ áp được lên bản gốc). Self-hosting **không giải quyết** ranh giới này — D5 (crypto-shredding) là ứng viên duy nhất, và D5 chưa chốt.
- **Không có telemetry ngược về dự án.** Self-host mặc định nghĩa là không ai đo được tỉ lệ replay thành công thực tế ngoài đời (§23, §32) trừ khi tổ chức tự nguyện báo cáo. §31 North Star Metric vì thế **khó đo ở quy mô sản phẩm** — chỉ đo được ở phạm vi từng tổ chức.
- **Phân mảnh phiên bản.** Mỗi tổ chức vận hành một bản riêng ⇒ tồn tại đồng thời nhiều phiên bản store và capsule format ⇒ ràng buộc tương thích ngược lên [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md) chặt hơn nhiều so với mô hình hosted.
- **Nghĩa vụ xoá theo yêu cầu (GDPR) chưa có lời giải.** §20.17 liệt kê `deletion` như mitigation, nhưng capsule là artifact **bất biến, đã được sao chép**. Không có D5, "xoá" chỉ áp được lên bản gốc trong store. Đây là mâu thuẫn thiết kế thật, không phải hạng mục "chưa làm".

## Open items (TBD)

| ID | Unknown | RQ.md nói gì | Nó chặn cái gì |
|---|---|---|---|
| `U-06` | **Capsule Store chưa hề được đặc tả.** API nào? **Cơ chế** auth nào (token dịch vụ cho recorder ghi, danh tính người dùng cho developer đọc)? Mô hình quyền theo gì? Storage backend nào được hỗ trợ? Mô hình triển khai nào (một binary? container? chỉ là một bucket + convention)? Ai cấp định danh capsule (`1842` ở §8 là gì)? **Audit record gồm những trường gì và lưu ở đâu?** | `repro pull` (§8) và `repro list` (§18) **hàm ý** một store ở xa có API và auth; §20.6 vẽ `Private Storage`; §28 xếp `Basic Self-hosting` vào OSS core. **Không một dòng đặc tả nào.** Đồng thời §20.15 liệt kê `Artifact storage` là scope explosion và §20.14 cảnh báo `significant infrastructure`. §38 Q12 — chỗ duy nhất chạm tới mô hình triển khai — là một **câu hỏi**. | ✅ **M2 (ĐÃ CHỐT 2026-08-14) THU HẸP mục này, KHÔNG GIẢI nó.** Đã biết chắc: sàn tối thiểu **bắt buộc có authn + authz + audit hook**, thuộc **OSS core** ⇒ C4 (*file chuyển tay*) không còn thoả sàn, và *"chặn mọi yêu cầu access control"* ở bản trước **không còn đúng** — yêu cầu đã phát biểu được ở mức chỗ đứng. **Vẫn `TBD`**: API, **cơ chế** auth, mô hình quyền, backend, mô hình triển khai, định danh capsule, hình dạng audit record. **Vẫn chặn**: **ước lượng MVP** — và chặn **nặng hơn trước**, vì sàn đã cao hơn (xem §Consequences → Negative); chặn hợp đồng CLI cho `list`/`pull`; chặn mô hình định danh capsule trong [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md); chặn thiết kế đường upload của recorder (D2). |
| `M2` | **Access control thuộc OSS core hay commercial layer?** | §28 → commercial. §20.5 + §21 → MVP. §20.17 → audit logs. Hai phía đều là văn bản của RQ.md và **vẫn còn nguyên ở nguồn**. Xem D6. | ✅ **ĐÃ CHỐT 2026-08-14** — **authn + authz + audit thuộc OSS core**, ghi đè có chủ đích phần §28. **Đã mở khoá**: nội dung thực chất của `Basic Self-hosting` (nay gồm ba control đó); phần authz của Security Spec nay có chỗ đứng để đặc tả; khuyến nghị self-host của ADR này **đứng vững**. **Còn chặn**: *cơ chế* — xem `U-06` ngay trên. Hai mục §28 chưa được phán xử: `Retention policies`, `Enterprise security`. |
| `U-06b` | **Giá trị TTL retention mặc định.** | §20.5 nêu `configurable retention`; §20.17 nêu `data retention policies`. **Không con số nào.** Lens `security-auditor` từ chối đoán, chỉ khẳng định phần khẳng định được: *phải là một giá trị hữu hạn, không được là vô hạn* — cần PM và pháp chế quyết. | Chặn: cấu hình mặc định của store; chặn lập luận compliance ở §20.17 (không có TTL thì "retention policy" chỉ là cái tên). Không được bịa một con số. |
| `U-06c` | **Crypto-shredding vs replay offline (D5).** Key giữ phía server thì `repro replay` có còn chạy được khi mất mạng không? Nếu key được cache trên laptop thì crypto-shred còn nghĩa gì? | RQ.md **không đề cập** crypto-shredding. §20.17 chỉ nêu `deletion`. Nhãn bắt buộc theo **E12**: *cần validate — đánh đổi với replay offline chưa được giải*. | Chặn: khả năng thực hiện nghĩa vụ xoá theo yêu cầu; chặn việc ranh giới storage → laptop có hồi phục được không; chặn thiết kế quản lý key trong [ADR-002](./ADR-002-Repro-Capsule-Format-Contract.md). |
| `U-06d` | **Quản lý key mã hoá (D4)** — key ở đâu, xoay vòng thế nào, ai giữ? | §16 nói *"Capsules should support encryption at rest"* và §20.6 vẽ `Encrypted Capsule`. **Không nói gì về key.** | Chặn: D4 không cài đặt được nếu chưa có mô hình key; và câu trả lời ở đây **ràng buộc** `U-06c` (crypto-shred cần key riêng từng capsule, một mô hình key dùng chung sẽ loại D5 vĩnh viễn). |
| `U-06e` | **Kiểm soát bản sao ở phía laptop.** Sau `repro pull`, tổ chức còn kiểm soát được gì? | RQ.md **hoàn toàn không nêu** — toàn bộ §16/§20.5/§20.6 nhìn dữ liệu chảy ra khỏi production, không nhìn tiếp sau khi nó tới developer. | Chặn: mọi phát biểu về retention có ý nghĩa thật; chặn nghĩa vụ xoá; là lý do tồn tại của `U-06c`. |

## Related Documents

- [SDD-Repro](./SDD-Repro.md)
- [ADR-002: Repro Capsule Format Contract](./ADR-002-Repro-Capsule-Format-Contract.md)
- [ADR-005: Default-Deny Write Side Effects](./ADR-005-Default-Deny-Write-Side-Effects.md)
- [ADR-007: In-Process SDK Interception](./ADR-007-In-Process-SDK-Interception.md)
- [ADR-008: Async, Bounded, Failure-Triggered Capture](./ADR-008-Async-Bounded-Failure-Triggered-Capture.md)
- [ADR-011: Execution Diff as First-Class Outcome](./ADR-011-Execution-Diff-First-Class.md)
- [Spec-Security-Repro-Threat-Model](../Security/Spec-Security-Repro-Threat-Model.md)
- [PRD-Repro](../../020-Requirements/PRD-Repro.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
- [Risk-Register](../../010-Planning/Risk-Register.md)
