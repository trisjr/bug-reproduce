---
id: SPEC-SEC-001
type: security-spec
status: draft
project: repro
created: 2026-08-14
updated: 2026-08-14
---

# Spec-Security — Repro Threat Model

> **Threat model của một thiết kế, không phải audit của một hệ thống đang chạy.**

**Table of Contents**

1. [Phạm vi và giới hạn](#1-phạm-vi-và-giới-hạn)
2. [Asset inventory](#2-asset-inventory)
3. [Trust boundary](#3-trust-boundary)
4. [Threat model](#4-threat-model)
5. [Default redaction list](#5-default-redaction-list)
6. [Căng thẳng privacy ↔ replay fidelity](#6-căng-thẳng-privacy--replay-fidelity)
7. [Giới hạn của redaction dựa-trên-danh-sách](#7-giới-hạn-của-redaction-dựa-trên-danh-sách)
8. [Ràng buộc tuân thủ](#8-ràng-buộc-tuân-thủ)
9. [Yêu cầu bảo mật cho MVP](#9-yêu-cầu-bảo-mật-cho-mvp)
10. [Mâu thuẫn M2 — ĐÃ CHỐT 2026-08-14](#10-mâu-thuẫn-m2--đã-chốt-2026-08-14)
11. [Ba mục TBD](#11-ba-mục-tbd)
12. [Related Documents](#12-related-documents)

---

## 1. Phạm vi và giới hạn

### 1.1 Đối tượng được mô hình hoá

Tài liệu này mô hình hoá mối đe doạ đối với **thiết kế** của Repro như được mô tả trong `docs/999-Resources/RQ.md` (Product Proposal, `Status: Concept`). Repro là một developer tool mã nguồn mở, ghi lại một execution lỗi ở production thành artifact portable (**Repro Capsule**) rồi replay nó trên máy local của developer `[stated §1, §6, §17]`.

Phạm vi bao gồm: recorder trong process production, capsule format, storage/collector, CLI (`repro list/pull/inspect/replay/diff/verify` `[stated §18]`), replay runtime trên máy developer, và vòng đời của capsule sau khi nó rời khỏi hạ tầng của tổ chức.

### 1.2 Những gì tài liệu này KHÔNG phải

| Không phải | Vì sao |
|---|---|
| **Code audit / SAST result** | `src/` **rỗng** — chưa có một dòng code nào. Không có gì để quét, không có gì để chứng minh. Mọi phát biểu ở đây là về *ý định thiết kế*, không phải về *hiện thực*. |
| **Penetration test report** | Không có hệ thống chạy được để kiểm thử. Không có finding nào ở đây đã được xác nhận bằng thực nghiệm. |
| **Chứng nhận / trạng thái tuân thủ** | Tài liệu này **không cấp trạng thái tuân thủ cho bất kỳ tổ chức nào**. Mục 8 nêu *ràng buộc mà các khung tuân thủ đặt lên thiết kế*, không phải kết luận rằng thiết kế đã đạt. |
| **Kết luận pháp lý** | Mọi diễn giải GDPR / HIPAA / PCI DSS / SOC 2 ở mục 8 **cần pháp chế (và với PCI DSS là QSA) xác nhận** trước khi được dùng để ra quyết định. |

### 1.3 Vì sao KHÔNG gán điểm CVSS

Role định nghĩa của `security-auditor` có nêu "risk classification by CVSS score". Tài liệu này **cố ý không gán điểm CVSS**, và đây là quyết định có chủ đích:

CVSS chấm điểm một lỗ hổng **trong một hiện thực cụ thể** — nó cần biết attack vector thật, điều kiện tiền đề thật, ranh giới scope thật. Ở đây chưa có hiện thực. Gán một con số như `8.6` cho một threat của một thiết kế chưa viết dòng code nào là **bịa độ chính xác**: con số trông như đo được nhưng thật ra là ý kiến đã bị làm tròn thành số, và nó sẽ được trích dẫn lại như dữ kiện.

Thay vào đó mỗi threat mang **impact** và **likelihood** định tính (Low / Medium / High) kèm lý do. Khi có implementation, CVSS nên được gán lại từ đầu trên code thật.

### 1.4 Bốn con số của RQ.md KHÔNG được dùng làm KPI trong tài liệu này

Ghi lại để tài liệu hạ nguồn không hiểu nhầm:

- `2,431 / 1,827 / 1,203` — RQ.md tự ghi là **"Example"** `[stated §31]`. Là minh hoạ hình dạng metric, không phải số liệu.
- `60–90 second` — thời lượng một **demo UX** `[stated §25]`, không phải cam kết hiệu năng.
- `Hours / Days → Minutes` — mô tả **outcome kỳ vọng** `[stated §32]`, không phải SLA.
- `"within minutes"` — nằm trong `§38` và là một **câu hỏi cần validate** `[stated §38.14]`, không phải một khẳng định.

Tương tự, bốn ngưỡng `≥80%` / `<5%` / `<10MB` / `<30s` `[stated §24]` là metric của **technical spike** `[stated §22]`; RQ.md tự nói chúng là *"initial hypotheses, not final product commitments"* `[stated §24]`. Chúng **không phải acceptance criteria** và không được dùng làm căn cứ cho bất kỳ yêu cầu `SEC-xxx` nào ở mục 9.

> **`✅ CHỐT GATE-01 — 2026-08-14` — spike đã được bật, và điều đó KHÔNG đổi đoạn trên.** Phase 0 technical spike `[stated §22]` được `@TrisJr` chốt **`Go`** và coi là **điều kiện đầu tư**; `Sponsor` = `@TrisJr`, `Manager` = `@TrisJr` (xem [Roadmap](../../010-Planning/Roadmap.md) Phase 0, [Charter-Repro §7](../../010-Planning/Charter-Repro.md)). Bốn ngưỡng §24 **vẫn là hypothesis**, **vẫn không phải acceptance criteria**, và **vẫn không được dùng** làm căn cứ cho requirement nào ở mục 9 — `GATE-01` quyết *có chạy spike hay không*, nó không biến hypothesis thành ngưỡng nghiệm thu.
>
> **`GATE-01-r`** — `Go` **không tự làm cho spike đo được**: `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở (không có denominator, không có định nghĩa *"reproduced"*, không có tiêu chí chọn test case, không có *Supported Execution Class*). Hệ quả trong tài liệu này: `SEC-008` (mục 11.b) **vẫn chưa có ngưỡng** — spike đã bật không đồng nghĩa spike sẽ cấp được con số. Định nghĩa rủi ro ở [Risk-Register §4.2](../../010-Planning/Risk-Register.md).

### 1.5 Quy ước nhãn nguồn

| Nhãn | Nghĩa |
|---|---|
| `[stated §N]` | RQ.md nói tường minh điều này ở section N. |
| `[inferred §N]` | Suy ra từ nội dung section N, RQ.md không nói tường minh. Đây là diễn giải của tài liệu này và có thể sai. |
| `[GAP]` | RQ.md **không nói gì** về điều này. |
| `[cần validate]` | Đề xuất chưa được ai cân nhắc đánh đổi, không được đọc như đã chốt. |
| `[cần anh chốt]` | Có mâu thuẫn thật giữa hai section của RQ.md; tài liệu này cố ý **không** tự quyết. **Không còn mục nào mang nhãn này** — `M2` là mâu thuẫn duy nhất từng mang nhãn, và nó đã được chốt (xem dòng dưới). |
| `✅ ĐÃ CHỐT 2026-08-14` | Chủ sản phẩm đã quyết định phía nào của một mâu thuẫn `[cần anh chốt]`. **Nhãn này KHÔNG có nghĩa là RQ.md đã hết mâu thuẫn** — RQ.md vẫn nguyên văn nói ngược; nhãn chỉ ghi lại ta chọn phía nào và vì sao. Bằng chứng hai phía kèm section number được **giữ nguyên** ở mục 10. **Nhãn này thuộc quyết định `M1`/`M2` (`D1`/`D2`) và KHÔNG được dùng lại** cho các quyết định sau. |
| `✅ CHỐT GATE-0N — 2026-08-14` | Chủ sản phẩm (`@TrisJr`) đã quyết một hạng mục **`TBD`/`DEFER`** của tài liệu này. Khác nhãn ở dòng ngay trên ở chỗ: nhãn kia đóng một **mâu thuẫn của `RQ.md`** (`M1`/`M2`), nhãn này đóng một **khoảng trống mà `RQ.md` không nói gì**. Ba gate chạm tài liệu này: **`GATE-01`** (Phase 0 = `Go` · mục 1.4, 11.b) · **`GATE-04`** (sàn Capsule Store · cuối mục 10, mục 3.2) · **`GATE-05a`**/**`GATE-05b`** (TTL 30 ngày · crypto-shred `MUST-V0.1` · mục 11.a, 11.c). Cùng quy ước với nhãn trên: **giữ nguyên 100% bằng chứng** và phần *"vì sao không khẳng định được"*; nhãn chỉ ghi ai quyết, quyết gì, và hệ quả nào phải trả. **Mapping**: `GATE-01` = G1 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5 — trong tài liệu **chỉ dùng `GATE-0N`**. |

### 1.6 Nguyên tắc nền

Tài liệu này viết theo Zero Trust: **capsule là dữ liệu không tin cậy ở cả hai chiều** — không tin dữ liệu chảy *vào* capsule (mục 5, 6, 7), và không tin capsule khi nó chảy *ra* vào replay runtime (`THREAT-009`, nhóm E của mục 9). Chiều thứ hai hoàn toàn vắng mặt trong RQ.md `[GAP]`.

---

## 2. Asset inventory

Asset ở đây là **thứ đáng để mất**, xếp theo mức độ thiệt hại khi mất chứ không theo thứ tự xuất hiện trong luồng.

| ID | Asset | Mô tả | Nguồn | Vì sao đáng bảo vệ |
|---|---|---|---|---|
| `A-01` | **Repro Capsule** (artifact hoàn chỉnh) | Gói chứa toàn bộ input cần để tái hiện một execution production `[stated §6]` | §6, §17 | Đây là asset tổng hợp: nó **cô đặc** nhiều loại dữ liệu nhạy cảm vào một file **portable, bất biến, dễ copy**. Một capsule bị lộ là một lát cắt production bị lộ. |
| `A-02` | Nội dung HTTP request production | Header, cookie, query string, URL, body của request thật đã gây lỗi `[stated §6, §18]` | §6, §18 | Chứa credential của phiên làm việc và PII do chính người dùng nhập. |
| `A-03` | Kết quả truy vấn database production | Row dữ liệu thật do PostgreSQL trả về `[stated §11, §18]` | §11, §18 | Đây là **dữ liệu khách hàng thật, không phải mẫu**. RQ.md khẳng định mô hình là record/replay *kết quả* truy vấn `[stated §11]`, nghĩa là nội dung row nằm trong capsule. |
| `A-04` | Response của external API | Response từ tax API, payment API, dịch vụ nội bộ `[stated §12, §14]` | §12, §14 | Thường mang dữ liệu tài chính, địa chỉ, định danh của bên thứ ba — và có thể mang token do bên thứ ba cấp. |
| `A-05` | Credential & secret | Authorization header, cookie, API key, token, mật khẩu DB trong environment `[inferred §6 "relevant environment metadata", §16]` | §6, §16 | Lộ một credential production là **lộ chính production**, không chỉ lộ dữ liệu. |
| `A-06` | PII của end user | Dữ liệu cá nhân của người **không phải** người dùng Repro | §16, §20.5 | Đây là điểm đạo đức riêng: chủ thể dữ liệu **không có mặt trong quyết định** capture, không được thông báo, không có lợi ích gì từ việc capsule tồn tại. |
| `A-07` | Metadata thực thi | Stack trace, timestamp, git commit, runtime/dependency version, schema version `[stated §15, §18]` | §15, §18 | Ít nhạy cảm hơn nội dung, nhưng **stack trace và SQL error message thường mang giá trị dữ liệu nhúng trong chuỗi** (xem mục 7 nhóm 7) và tiết lộ topology nội bộ. |
| `A-08` | Feature flag state & cấu hình nội bộ | Trạng thái flag tại thời điểm lỗi `[stated §6, §18]` | §6, §18 | Tiết lộ lộ trình sản phẩm chưa công bố và logic phân nhánh nội bộ. |
| `A-09` | **Cấu hình redaction** | File khai báo header/field nào bị che `[stated §16]` | §16 | Bản thân nó là asset hạng nhất: **ai sửa được file này thì điều khiển toàn bộ `TB-2`**. RQ.md coi nó là cấu hình thường, không coi là asset `[GAP]`. |
| `A-10` | Khoá mã hoá capsule | Key dùng cho encryption at rest `[stated §16 "Capsules should support encryption at rest"]` | §16 | Nếu crypto-shredding được chọn (mục 8.1), key trở thành **cơ chế xoá duy nhất còn hiệu lực** sau `TB-4` — mất kiểm soát key là mất luôn khả năng thu hồi. **`✅ CHỐT GATE-05b — 2026-08-14`: đã được chọn** (`SEC-016` = `MUST-V0.1`) ⇒ điều kiện *"nếu"* đã thành hiện thực, và `A-10` **nâng từ asset thường lên asset then chốt**: nó vừa là cơ chế xoá duy nhất còn hiệu lực, vừa là **điểm chết** — mất key store là mất **toàn bộ** capsule, kể cả bản trong Zone 2. `RQ.md` không nói gì về key custody `[GAP]`; `U-06d` là **blocker** (`GATE-05b-r2`, mục 11.c). |
| `A-11` | Audit log truy cập capsule | Ai đã list/pull/inspect/replay capsule nào `[stated §20.17 "audit logs"]` | §20.17 | Là bằng chứng duy nhất trả lời được câu hỏi sau sự cố: *dữ liệu này đã đi tới những ai*. Không có nó thì mọi điều tra là phỏng đoán. |
| `A-12` | **Máy developer và credential trên đó** | Laptop chạy `repro replay`: SSH key, cloud credential, session của IDE, quyền push code `[inferred §8, §18]` | §8, §18 | Đây là asset mà RQ.md **không hề coi là asset**. Nó biến `THREAT-009` từ "lộ dữ liệu" thành **compromise chuỗi phát triển**. |
| `A-13` | Hệ thống production thật | Payment gateway, mail sender, Kafka, DB production `[stated §13, §20.4]` | §13, §20.4 | Là **đích của side effect ngoài ý muốn** khi replay. RQ.md nhận ra rủi ro này `[stated §13]` nhưng cơ chế đề xuất fail-open (xem `THREAT-018`). |

**Ba asset mà RQ.md không liệt kê**: `A-09` (cấu hình redaction), `A-11` (audit log — có nhắc "audit logs" ở §20.17 nhưng như một mitigation, không như một asset cần bảo vệ), và `A-12` (máy developer). Ba asset này đúng là ba nơi mà 11 threat không-có-mitigation tập trung.

---

## 3. Trust boundary

### 3.1 Bốn zone

| Zone | Tên | Ai kiểm soát | Security posture |
|---|---|---|---|
| **Zone 1** | Production runtime | Tổ chức (SRE/platform team) | Cao — có hardening, monitoring, change control |
| **Zone 2** | Repro control plane & storage | Tổ chức (nếu self-host) hoặc nhà cung cấp (nếu SaaS) | Trung bình — phụ thuộc hoàn toàn vào lựa chọn triển khai `[stated §20.6, §28]` |
| **Zone 3** | Laptop developer | Cá nhân developer | **Thấp nhất** — máy đa mục đích, cài phần mềm tuỳ ý, đồng bộ cloud, có IDE và AI assistant đọc workspace |
| **Zone 4** | Hạ tầng ngoài kiểm soát | Không ai trong tổ chức | **Không có** — git remote/fork, CI cache, Slack, cloud sync, dịch vụ SaaS bên thứ ba |

### 3.2 Sơ đồ

```text
╔═══════════════════════════════ ZONE 1 — PRODUCTION RUNTIME ═══════════════════════════════╗
║                                                                                            ║
║   Redaction config  ──── TB-1 ────►  Repro Recorder (in-process)                            ║
║   (A-09, file YAML)   [ai quyết         │                                                  ║
║                        capture gì]      │  đọc: HTTP req, DB result, API response,          ║
║                                         │       feature flag, clock, stack trace            ║
║                                         │       (A-02 A-03 A-04 A-05 A-06 A-07 A-08)        ║
║                                         │                                                  ║
║                                    ═══ TB-2 ═══  ◄── REDACTION GATE                         ║
║                                         │        control point QUAN TRỌNG NHẤT              ║
║                                         ▼                                                  ║
║                                  Repro Capsule (A-01)                                       ║
╚═════════════════════════════════════════│══════════════════════════════════════════════════╝
                                          │
                                     ─── TB-3 ───  transport + at-rest
                                          │        (mã hoá, xác thực recorder)
                                          ▼
╔═══════════════════════════ ZONE 2 — CONTROL PLANE & STORAGE ══════════════════════════════╗
║   Collector  →  Capsule Store (A-01)  ·  Key Store (A-10)  ·  Audit Log (A-11)             ║
║   authn/authz  ·  retention TTL  ·  crypto-shred                                            ║
╚═════════════════════════════════════════│══════════════════════════════════════════════════╝
                                          │
                                    ▓▓▓ TB-4 ▓▓▓  ◄── `repro pull`
                                          │         boundary NGUY HIỂM NHẤT
                                          │         BẤT KHẢ HỒI bằng thu hồi file — không có đường quay lại;
                                          │         chỉ khả hồi qua crypto-shred (SEC-016, MUST-V0.1)
                                          │         VÀ chỉ khi có key custody (U-06d) — xem 3.5
                                          ▼
╔═══════════════════════════ ZONE 3 — LAPTOP DEVELOPER ═════════════════════════════════════╗
║                                                                                            ║
║   ~/.repro/capsule (A-01, bản copy thứ N)                                                   ║
║          │                                                                                 ║
║     ─── TB-5 ───  capsule ─► Replay Runtime   ◄── CHIỀU NGƯỢC: capsule là INPUT KHÔNG TIN CẬY ║
║          │        (parse, giải nén, deserialize, tiêm giá trị vào runtime)                   ║
║          ▼                                                                                 ║
║   Replay Runtime + Local App   ── TB-6 ──►  egress / side effect  ──► A-13 (production thật) ║
║                                                                                            ║
║   Cùng máy: SSH key, cloud credential, quyền push code (A-12)                                ║
║             IDE indexer · AI assistant · cloud sync · backup                                 ║
╚═════════════════════════════════════════│══════════════════════════════════════════════════╝
                                          │
                              ✗ KHÔNG CÓ TRUST BOUNDARY NÀO ✗
                                          │
╔═══════════════════════════ ZONE 4 — NGOÀI KIỂM SOÁT ══════════════════════════════════════╗
║   git remote / fork / clone  ·  CI cache  ·  Slack  ·  iCloud/Dropbox/OneDrive/Drive        ║
║   ·  AI assistant backend  ·  backup của bên thứ ba                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝
```

**Trạng thái ba thành phần của Zone 2 sau các quyết định ngày 2026-08-14** — sơ đồ trên vẽ *thiết kế mong muốn*, dòng này ghi *cái gì đã được chốt*:

| Thành phần trong sơ đồ | Trạng thái |
|---|---|
| `Capsule Store (A-01)` · `authn/authz` | **Sàn đã chốt** — `✅ CHỐT GATE-04 — 2026-08-14`: object/file storage + **một index** + **authn/authz/audit hook**, 3 thao tác tối thiểu theo `SDD §5.4`. ⚠ **Cơ chế** authn/authz cụ thể vẫn **`TBD`**, và `GAP-04` (không có CLI verb vận hành) **chưa đóng** — `GATE-04-r`, xem cuối mục 10 |
| `retention TTL` | **Đã có giá trị** — `✅ CHỐT GATE-05a — 2026-08-14`: mặc định **30 ngày**, cấu hình được (`FR-024`), `SEC-022` · mục 11.a |
| `Key Store (A-10)` · `crypto-shred` | **Đã chốt áp dụng** — `✅ CHỐT GATE-05b — 2026-08-14`: `SEC-016` = **`MUST-V0.1`**, khoá giữ phía server · mục 11.c. ⚠ **Nhưng `Key Store` trong sơ đồ vẫn là một hộp chưa ai đặc tả**: key custody `U-06d` nay là **blocker** (`GATE-05b-r2`) |
| `Audit Log (A-11)` | `MUST-V0.1` trong OSS core theo quyết định `D2` (`M2`) — xem mục 10, nhãn giữ nguyên ở đó |

### 3.3 Bảng sáu trust boundary

| ID | Boundary | Từ → Đến | Control point tương ứng |
|---|---|---|---|
| `TB-1` | Cấu hình → Recorder | Người/PR quyết định capture gì → recorder trong Zone 1 | Integrity của `A-09`, review gate, fail-closed khi thiếu config |
| `TB-2` | **Redaction gate** | Dữ liệu runtime → nội dung capsule (bên trong Zone 1) | Redaction engine — **điểm kiểm soát quan trọng nhất** |
| `TB-3` | Recorder → Collector/Storage | Zone 1 → Zone 2 | TLS, xác thực recorder, mã hoá at-rest, authz ghi |
| `TB-4` | **Storage → laptop** (`repro pull`) | Zone 2 → Zone 3 | authn/authz đọc (**sàn `GATE-04`**; cơ chế vẫn `TBD`), audit, TTL (**mặc định 30 ngày, `GATE-05a`**), và **crypto-shred** (`SEC-016` = `MUST-V0.1`, `GATE-05b`; cần key custody `U-06d`) — **boundary nguy hiểm nhất** |
| `TB-5` | Capsule → Replay Runtime | Dữ liệu không tin cậy → code thực thi trong Zone 3 | Verify trước khi parse, sandbox deserialize |
| `TB-6` | Replay Runtime → thế giới bên ngoài | Zone 3 → mạng / `A-13` | Chặn egress ở mức process, default-deny write |

**Zone 3 → Zone 4 không có boundary.** Đây không phải thiếu sót của bảng: nó là mô tả đúng hiện trạng thiết kế. Sau khi capsule nằm trong `~/.repro`, không tồn tại **bất kỳ** điểm kiểm soát nào của Repro giữa nó và git, Slack, cloud sync hay AI assistant. Mọi control còn lại đều là control của tổ chức áp lên endpoint, không phải của sản phẩm. `THREAT-006` và `THREAT-007` sống trong khoảng trống này.

### 3.4 `TB-2` là control point QUAN TRỌNG NHẤT

`TB-2` là **nơi duy nhất** trong toàn bộ vòng đời mà dữ liệu nhạy cảm còn có thể bị ngăn *không bước vào* lifecycle. Trước `TB-2` dữ liệu ở trong production nơi nó vốn thuộc về; sau `TB-2` nó đã nằm trong một artifact portable.

Hệ quả cần nói thẳng:

> **Nếu `TB-2` hỏng, mọi control phía sau — encryption `[stated §16]`, access control `[stated §20.5]`, retention `[stated §20.17]`, audit `[stated §20.17]` — chỉ đang bảo vệ dữ liệu lẽ ra không nên tồn tại.**

Chúng bảo vệ *tốt hơn* thì thiệt hại *nhỏ hơn*, nhưng không control nào trong số đó **đảo ngược** được quyết định capture. Encryption bảo vệ một bí mật đã bị sao chép; ACL giới hạn ai đọc được một thứ lẽ ra không được ghi; TTL rút ngắn thời gian tồn tại của một thứ đáng lẽ có thời gian tồn tại bằng không.

Đây là lý do vì sao mọi requirement nhóm A và nhóm B ở mục 9 đều **fail-closed**: một `TB-2` thỉnh thoảng chặn nhầm dữ liệu vô hại là chi phí chấp nhận được; một `TB-2` thỉnh thoảng cho lọt dữ liệu nhạy cảm là chi phí không thu hồi được.

### 3.5 `TB-4` là boundary NGUY HIỂM NHẤT

`TB-4` là `repro pull` — thao tác đưa capsule từ Zone 2 xuống Zone 3 `[stated §8 Step 2]`. Năm lý do, xếp theo sức nặng:

**(1) Bất khả hồi.** Mọi boundary khác còn có đường sửa sai. Key rò rỉ ở `TB-3` thì rotate key. ACL sai ở Zone 2 thì đổi ACL. Object thừa trong storage thì xoá object. Nhưng **sau `TB-4`, tổ chức không còn khả năng thu hồi** — không có cơ chế nào trong thiết kế cho phép Zone 2 lấy lại hay vô hiệu hoá một file đã nằm trên máy của người khác. Đây là loại rủi ro khác về chất: không phải "khó khắc phục" mà là "không có khái niệm khắc phục".

> **`✅ CHỐT GATE-05b — 2026-08-14` — lý do (1) đã đổi, nhưng CHƯA hết.** `SEC-016` (crypto-shredding) nay là **`MUST-V0.1`** (mục 11.c): capsule được mã hoá bằng khoá riêng giữ ở Zone 2, và **phá khoá làm mọi bản copy trở thành ciphertext vô nghĩa mà không cần biết chúng ở đâu**. Nghĩa là `TB-4` chuyển từ **bất khả hồi** sang **khả hồi** — đây là thay đổi về chất, không phải cải thiện mức độ: lần đầu tiên tồn tại một *"khái niệm khắc phục"* cho boundary này.
>
> ⚠ **Hai điều kiện, và nếu bỏ một trong hai thì câu trên sai:**
> 1. **Khả hồi CHỈ khi có key management.** Không có nơi giữ khoá, vòng đời khoá, cơ chế phá khoá và chính sách sao lưu khoá thì `SEC-016` là một quyết định chưa thực thi được. `U-06d` (key custody) nay là **blocker** — `GATE-05b-r2`, xem mục 11.c và [Risk-Register §4.2](../../010-Planning/Risk-Register.md). **Cho tới khi `U-06d` được giải, đoạn "Bất khả hồi" ở trên vẫn là mô tả đúng hiện trạng.**
> 2. **Khả hồi không có nghĩa là an toàn.** Crypto-shred thu hồi **khả năng đọc**, nó **không** thu hồi *"dữ liệu đã từng bị đọc"*: một bản copy đã được giải mã và lưu lại ở dạng plaintext, hoặc một khoá đã bị lấy trước khi phá, nằm ngoài tầm của cơ chế này. Bốn lý do (2)…(5) bên dưới **không lý do nào bị `GATE-05b` xoá bỏ** — `TB-4` vẫn là boundary nguy hiểm nhất.

**(2) Bị vượt qua trên happy path, không do bị tấn công.** Đây là điểm dễ bị bỏ qua nhất. `repro pull` **không phải lỗ hổng — nó là tính năng**, là chính cái mà sản phẩm bán `[stated §8, §18, §35]`. Không có attacker nào cần xuất hiện để dữ liệu production đi qua `TB-4`; nó đi qua mỗi lần sản phẩm được dùng đúng mục đích.

Hệ quả: **rủi ro tăng tuyến tính theo mức adoption**. North Star Metric của sản phẩm là số bug production được chuyển thành test case `[stated §31]` — nghĩa là **chỉ số thành công của sản phẩm và chỉ số phơi nhiễm dữ liệu là cùng một chỉ số**. Càng thành công thì càng nhiều dữ liệu production nằm trên càng nhiều laptop. Không có threat model nào khác trong RQ.md có tính chất này.

**(3) Zone 3 có security posture thấp nhất trong bốn zone.** Laptop developer là máy đa mục đích: thư mục `~/.repro` bị cloud sync tự động backup lên hạ tầng bên thứ ba; IDE indexer đọc và index nội dung file trong workspace; AI assistant đọc workspace và có thể gửi nội dung ra ngoài; và bản thân máy có thể bị mất hoặc bị đánh cắp. Không có cái nào trong số này là tấn công — chúng là hành vi mặc định của môi trường làm việc hiện đại.

**(4) Sau `TB-4` không còn audit.** Storage log được *"ai đã pull capsule nào, lúc nào"* `[inferred §20.17]`. Nó **không** log được *"capsule đó sau đó đi đâu"*. Sau `TB-4`, chuỗi bằng chứng đứt hẳn. Khi có sự cố, câu hỏi mà tổ chức phải trả lời cho cơ quan quản lý — *dữ liệu này đã tới những đâu* — trở thành không trả lời được, không phải vì thiếu công cụ mà vì **không tồn tại dữ kiện để trả lời**.

**(5) Nó nhân bản asset.** Một capsule trong Zone 2 là **một** object chịu **một** retention policy. Sau khi N developer pull, nó là **N+1 bản** trong đó chỉ bản gốc chịu policy. Retention TTL, crypto-shred, ACL — tất cả đều chỉ áp được lên bản gốc. Thiết kế hiện tại nhân bản asset nhanh hơn khả năng quản trị nó.

*Cập nhật sau `GATE-05` — 2026-08-14*: mệnh đề *"tất cả đều chỉ áp được lên bản gốc"* **không còn đúng với crypto-shred**. `SEC-016` = `MUST-V0.1` ⇒ **phá khoá áp lên toàn bộ N+1 bản cùng lúc**, vì cái bị phá không phải bản copy mà là **điều kiện đọc được chúng**. Hai control còn lại **không đổi**: retention TTL (nay mặc định 30 ngày, `GATE-05a`) và ACL vẫn chỉ chạm được bản gốc ở Zone 2 — `SEC-044` (TTL cục bộ) là `SHOULD` và bị vô hiệu bằng một thao tác copy file. Và bản thân crypto-shred **chỉ áp được khi có key custody** (`U-06d`, `GATE-05b-r2`). Nghĩa là: **tốc độ nhân bản không giảm**, nhưng lần đầu tiên có một control theo kịp nó — với điều kiện control đó được vận hành thật.

**Kết luận kết hợp**: `TB-2` quyết định *dữ liệu nào tồn tại*; `TB-4` quyết định *dữ liệu đó tồn tại ở bao nhiêu nơi ngoài tầm với*. Hai boundary này phải được xử lý bằng hai tư duy khác nhau — `TB-2` bằng fail-closed engineering, `TB-4` bằng chấp nhận rằng nó không thể được "bảo vệ" mà chỉ có thể được **giảm giá trị của thứ đi qua nó** (mục 5, 6) và **làm cho nó khả hồi** (crypto-shredding, mục 8.1) — **đường thứ hai nay đã được chọn**: `SEC-016` = `MUST-V0.1`, `✅ CHỐT GATE-05b — 2026-08-14`, với điều kiện key custody `U-06d` (`GATE-05b-r2`).

---

## 4. Threat model

### 4.1 Khung phân tích

STRIDE được áp **per-boundary**, không áp per-component. Lý do: rủi ro của Repro nằm ở **chỗ dữ liệu đổi tay**, không nằm ở chỗ dữ liệu ngồi yên. Một capsule nằm im trong storage đã mã hoá là vấn đề nhỏ; chính khoảnh khắc nó đi qua `TB-2` và `TB-4` mới tạo ra rủi ro không thể đảo ngược.

**Không có điểm CVSS** — lý do ở mục 1.3. `Impact` và `Likelihood` là đánh giá định tính về một thiết kế, không phải phép đo.

### 4.2 Attacker model

| ID | Attacker model | Năng lực giả định | Vì sao đáng mô hình hoá |
|---|---|---|---|
| `AM-1` | Attacker ngoài, chưa xác thực | Chỉ tiếp cận được bề mặt mạng công khai | Mô hình cơ sở |
| `AM-2` | Attacker đã chiếm được collector hoặc capsule storage | Đọc/ghi Zone 2 | **Đây là mô hình duy nhất RQ.md có nêu** `[stated §20.6]` |
| `AM-3` | **Insider có quyền merge config, không có quyền truy cập dữ liệu production** | Sửa được `A-09`, deploy được code; **không** có `psql` production | Đây là hồ sơ của phần lớn developer trong tổ chức có phân quyền dữ liệu. `THREAT-005` sống ở đây. |
| `AM-4` | Insider tò mò, không ác ý | Là người dùng hợp lệ của Repro, có quyền pull | Vượt need-to-know mà không vi phạm quy tắc nào — không có control nào ngăn |
| `AM-5` | Attacker đã chiếm được laptop developer | Toàn quyền Zone 3 | Sau `TB-4`, đây là nơi capsule sống |
| `AM-6` | **Bên cung cấp được capsule cho developer** | Tạo được file capsule và khiến developer mở nó (sample capsule công khai, capsule đính kèm bug report, capsule từ khách hàng) | `THREAT-009` sống ở đây. Không cần chiếm được gì trước. |
| `AM-7` | Dependency bị chiếm trong chuỗi cung ứng | Kiểm soát code của `@repro/node` hoặc một transitive dependency `[stated §20.14]` | Recorder chạy **trong process production** — vị trí đắt nhất trong toàn hệ thống |
| `AM-8` | Bên thứ ba xử lý dữ liệu **không do tấn công** | Cloud sync, IDE indexer, AI assistant, backup SaaS đọc `~/.repro` | Không phải adversary, nhưng hậu quả dữ liệu giống hệt. Đây là mô hình mà mọi threat model tập trung vào "kẻ tấn công" đều bỏ sót. |
| `AM-9` | Lỗi vận hành / cấu hình sai | Không có ý định xấu | `THREAT-004` sống ở đây. Với `TB-2`, đây là mô hình **có xác suất cao nhất**. |
| `AM-10` | Người có tiếp cận vật lý thiết bị mất/bị đánh cắp | Có ổ đĩa, không có mật khẩu | Zone 3 là thiết bị di động |

### 4.3 Bảng chỉ mục 19 threat

| ID | Tên rút gọn | Boundary | RQ.md có mitigation? |
|---|---|---|---|
| `THREAT-001` | PII/credential lọt vào capsule vì denylist không phủ hết | `TB-2` | Một phần `[stated §16, §20.5]` |
| `THREAT-002` | Capsule đọc được bởi ai kiểm soát storage | `TB-3` | Một phần `[stated §16, §20.6]` |
| `THREAT-003` | Dữ liệu production rời khỏi tổ chức sang SaaS bên thứ ba | `TB-3` | Một phần `[stated §20.6, §28]` |
| `THREAT-004` | **Redaction config fail-open** | `TB-1` | **KHÔNG** `[GAP]` |
| `THREAT-005` | **Recorder bị lạm dụng thành công cụ exfiltration nội bộ** | `TB-1` + `TB-2` + `TB-4` | **KHÔNG** `[GAP]` |
| `THREAT-006` | **Capsule vào git vĩnh viễn** | Zone 3 → Zone 4 | **KHÔNG** `[GAP]` |
| `THREAT-007` | Capsule sprawl trong Zone 3 (cloud sync, IDE, AI assistant, mất máy) | `TB-4`, Zone 3 → Zone 4 | **KHÔNG** `[GAP]` — và **vẫn thuộc nhóm không có mitigation thực thi được** sau `GATE-05`: crypto-shred đã chốt nhưng treo trên key custody `U-06d` |
| `THREAT-008` | Bản self-host không có access control | `TB-3` + `TB-4` | **KHÔNG** `[GAP]` trong RQ.md — nhưng **✅ ĐÃ CHỐT 2026-08-14**: mitigation đến từ quyết định sản phẩm `D2`, xem mục 10 |
| `THREAT-009` | **Capsule là input không tin cậy → thực thi mã trên máy developer** | `TB-5` | **KHÔNG** `[GAP]` |
| `THREAT-010` | Replay gây side effect thật lên production | `TB-6` | Có, ở mức nguyên tắc `[stated §13, §20.4]` |
| `THREAT-011` | Không quy trách nhiệm được sau khi capsule rời Zone 2 | `TB-4` | **KHÔNG** `[GAP]` |
| `THREAT-012` | Recorder làm suy giảm hoặc gây lỗi production | `TB-2` | Một phần `[stated §20.7]` |
| `THREAT-013` | Capsule giả mạo được nạp vào storage | `TB-3` | **KHÔNG** `[GAP]` |
| `THREAT-014` | Capsule quá lớn gây cạn tài nguyên | `TB-2` + `TB-3` | Có `[stated §20.12]` |
| `THREAT-015` | Replay "thành công" nhưng đi đường khác → kết luận sai | `TB-5` | Khá đủ `[stated §10, §20.3, §20.16]` |
| `THREAT-016` | Capsule tồn tại vô thời hạn, không xoá được | `TB-3` + `TB-4` | **KHÔNG** `[GAP]` trong RQ.md — nhưng **✅ CHỐT GATE-05a — 2026-08-14 và ✅ CHỐT GATE-05b — 2026-08-14**: mitigation đến từ quyết định sản phẩm (TTL 30 ngày · crypto-shred `MUST-V0.1`), xem 4.4 và mục 11 |
| `THREAT-017` | Replay sai version/schema tạo kết luận không đáng tin | `TB-5` | Có `[stated §15, §20.8, §20.9]` |
| `THREAT-018` | **Egress khi replay không thực sự bị chặn — phân loại theo verb fail-open** | `TB-6` | **KHÔNG** `[GAP]` — §13 nêu ý định, không nêu cơ chế đủ |
| `THREAT-019` | Chuỗi cung ứng `@repro/node` bị chiếm | `TB-1` + `TB-2` | **KHÔNG** `[GAP]` |

**11 threat mà RQ.md HOÀN TOÀN KHÔNG CÓ mitigation**: `THREAT-004`, `005`, `006`, `007`, `008`, `009`, `011`, `013`, `016`, `018`, `019`. Chúng được đánh dấu `[GAP — RQ.md KHÔNG CÓ MITIGATION]` ở đầu mỗi mục dưới đây.

> **Con số 11 đo RQ.md, không đo trạng thái sản phẩm — và nó GIỮ NGUYÊN sau 2026-08-14.** Quyết định `D2` (mục 10) cấp mitigation cho `THREAT-008`, nhưng mitigation đó đến từ một **quyết định sản phẩm ghi đè §28**, không phải từ RQ.md; nguyên văn RQ.md vẫn không có mitigation nào cho `THREAT-008`. Đổi 11 thành 10 sẽ làm con số nói sai điều mà cột *"RQ.md có mitigation?"* hỏi. **Điều này áp y hệt cho `GATE-05a`/`GATE-05b`**: hai quyết định đó cấp mitigation cho `THREAT-016`, nhưng `RQ.md` vẫn không nhắc tới giá trị TTL mặc định nào và không nhắc tới crypto-shredding ở bất kỳ đâu ⇒ nhãn `[GAP]` của `THREAT-016` **giữ nguyên**, và **11 vẫn là 11**.
>
> **Ba con số, đo ba thứ khác nhau** — `✅ CHỐT GATE-05a — 2026-08-14` · `✅ CHỐT GATE-05b — 2026-08-14`
>
> | Con số | Đo cái gì | Giá trị | Đổi khi nào |
> |---|---|---|---|
> | **11** | **`RQ.md` thiếu bao nhiêu** — cột *"RQ.md có mitigation?"* của bảng trên | **11** — `THREAT-004`, `005`, `006`, `007`, `008`, `009`, `011`, `013`, `016`, `018`, `019` | **Chỉ khi `RQ.md` được sửa.** `RQ.md` là nguồn sự thật và không được sửa ⇒ con số này **bất biến**. Quyết định sản phẩm **không bao giờ** làm nó đổi |
> | **10** | Còn bao nhiêu threat hở **sau `D2`** (2026-08-14) | **10** — bỏ `THREAT-008` | Lịch sử: đây là giá trị ngay sau `D2`, giữ lại để tra được |
> | **9** | Còn bao nhiêu threat **không có mitigation từ bất kỳ nguồn nào**, **sau `GATE-05`** | **9** — `THREAT-004`, `005`, `006`, `007`, `009`, `011`, `013`, `018`, `019` | **Con số dùng cho lập kế hoạch hôm nay.** `THREAT-016` rời nhóm |
>
> **Vì sao `THREAT-016` rời nhóm — và vì sao chỉ nó.** `THREAT-016` = *"capsule tồn tại vô thời hạn **và** không xoá được"*, hai vế. `GATE-05a` cấp cho vế thứ nhất một mitigation **vô điều kiện**: `SEC-022` nay có giá trị mặc định **30 ngày**, nên trạng thái *"không ai quyết ⇒ TTL vô hạn"* **không còn là mặc định của thiết kế**. Điều đó đủ để threat này thôi thuộc nhóm *"không có mitigation từ bất kỳ nguồn nào"*. Vế thứ hai (*bản copy ở Zone 3/Zone 4*) do `GATE-05b` xử lý và **có điều kiện** — vì vậy **residual của `THREAT-016` vẫn Cao**, xem 4.4. **Rời nhóm ≠ đã an toàn**: nhóm này đếm *"có mitigation từ bất kỳ nguồn nào hay không"*, không đếm *"residual đã thấp hay chưa"* — đúng như `THREAT-008` rời nhóm mà vẫn giữ residual Medium.
>
> **Vì sao `THREAT-007` và `THREAT-011` KHÔNG rời nhóm.** Với hai threat này, thứ duy nhất mà `GATE-05` cấp là **crypto-shred**, và hiệu lực của crypto-shred **treo hoàn toàn** trên key custody — `U-06d`, nay là **blocker** (`GATE-05b-r2`). `SEC-044` (TTL cục bộ, nay neo vào 30 ngày) là `SHOULD` và là hygiene control, **không** tạo containment (mục 7.1, `SEC-044`). Một mitigation chưa thực thi được thì chưa phải mitigation; đếm chúng đã rời nhóm là làm con số nói sai. Chúng sẽ rời nhóm khi `U-06d` có câu trả lời — không phải trước đó.
>
> **Nguyên tắc chung của ba con số** (giữ nguyên từ cách xử `THREAT-008` trước đây): mitigation đến từ **`RQ.md`** và mitigation đến từ **quyết định sản phẩm** (`D2`, `GATE-04`, `GATE-05a`, `GATE-05b`) là **hai loại khác nhau**. Không gộp chúng, không xoá nhãn `[GAP]` của threat nào, không đánh số lại. Đóng một mục thì **đổi disposition của mục đó**, không xoá dấu vết là nó **từng** hở. Xem 4.5.

### 4.4 Chi tiết từng threat

#### THREAT-001 — PII và credential lọt vào capsule vì denylist không phủ hết

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** · `TB-2` |
| Asset | `A-01`, `A-02`, `A-03`, `A-05`, `A-06` |
| Attacker model | `AM-9` (chủ yếu), `AM-4` |
| Impact | **High.** Capsule chứa dữ liệu cá nhân hoặc credential thật mà không ai biết. Vì capsule sau đó đi qua `TB-4` và nhân bản (mục 3.5), một lần lọt tạo ra N bản lọt. |
| Likelihood | **High.** Không cần attacker. RQ.md đề xuất redaction theo **danh sách tên** `[stated §16]`; mục 7 liệt kê 11 nhóm mà cách tiếp cận này về nguyên tắc không bắt được. Với một schema thật bất kỳ, xác suất phủ 100% bằng danh sách tay là rất thấp. |
| Mitigation trong RQ.md | Automatic Redaction theo danh sách header/field `[stated §16]`; PII anonymization dạng `john@example.com → user-1842@example.test` `[stated §16]`; §20.5 liệt kê redaction + anonymization là mitigation `[stated §20.5]`. Đây là mitigation **một phần**: nó đúng hướng nhưng chỉ phủ được nhóm "tên field đoán được". |
| Residual risk | **Cao và không loại bỏ được.** Ngay cả với default list ở mục 5 và content-based detector (`SEC-005`, `SEC-007`), vẫn còn free-text đã drop nhưng có thể cần cho replay, quasi-identifier, và internal id join được với DB thật. Residual risk này **không đóng được bằng redaction** — nó chỉ giảm được bằng containment (mục 7). |
| Mitigation bổ sung | `SEC-002`, `SEC-003`, `SEC-005`, `SEC-006`, `SEC-007`, `SEC-047` — và quan trọng nhất: chấp nhận ở mục 7 rằng đây là hygiene control, để không xây tiếp giả định "capsule đã sạch". |

#### THREAT-002 — Capsule đọc được bởi bất kỳ ai kiểm soát storage

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** · `TB-3` |
| Asset | `A-01`, `A-10` |
| Attacker model | `AM-2`, `AM-1` |
| Impact | **High.** Một storage bị chiếm là toàn bộ lịch sử execution production bị lộ cùng lúc — không phải một request mà là mọi request đã từng lỗi. |
| Likelihood | **Medium.** Zone 2 là hạ tầng có chủ đích được bảo vệ; nhưng nó là mục tiêu giá trị cao và tập trung. |
| Mitigation trong RQ.md | *"Capsules should support encryption at rest"* `[stated §16]`; kiến trúc ưu tiên `Private Recorder → Encrypted Capsule → Private Storage` `[stated §20.6]`; §21 xếp "Security exposure" là Critical, MVP=Yes `[stated §21]`. Đây là mitigation **một phần**: RQ.md nói *should support* — tức là khả năng, không phải mặc định — và không nói gì về key custody, tức không nói ai **không** đọc được. |
| Residual risk | Nếu key nằm cùng nơi với ciphertext thì encryption at rest chỉ bảo vệ trước mất ổ đĩa, không bảo vệ trước `AM-2`. RQ.md không phân tách key khỏi storage `[GAP]`. **Sau `GATE-05b` (2026-08-14): thấp về nguyên tắc, nhưng đổi hình dạng.** `SEC-016` = `MUST-V0.1` bắt buộc **khoá riêng từng capsule giữ ở Zone 2, không đi kèm capsule** ⇒ việc phân tách key khỏi ciphertext nay là **yêu cầu**, không còn là khoảng trống. Đánh đổi: nó tạo ra một **asset tập trung mới** — key store (`A-10`) trở thành mục tiêu giá trị cao nhất trong Zone 2, vì chiếm được nó là giải được **toàn bộ** capsule. `RQ.md` vẫn không nói gì về key custody `[GAP]`; `U-06d` nay là blocker (`GATE-05b-r2`). |
| Mitigation bổ sung | `SEC-015` (AEAD, storage không giữ key), `SEC-016` **`MUST-V0.1`** (`✅ CHỐT GATE-05b — 2026-08-14`, mục 11.c), `SEC-017`, `SEC-019` |

#### THREAT-003 — Dữ liệu production rời khỏi tổ chức sang hạ tầng bên thứ ba

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** · `TB-3` |
| Asset | `A-01`, `A-06` |
| Attacker model | `AM-8` (bên xử lý hợp pháp nhưng ngoài kiểm soát), `AM-2` |
| Impact | **High**, và **không chỉ là impact bảo mật**: đưa nhà cung cấp vào vai processor và có thể phát sinh chuyển dữ liệu xuyên biên giới (mục 8.1, 8.5). |
| Likelihood | **Medium** — phụ thuộc hoàn toàn vào việc bản hosted có phải mặc định hay không. |
| Mitigation trong RQ.md | §20.6 nêu **rõ ràng và đúng**: ưu tiên kiến trúc private *"rather than requiring production data to be sent to a public SaaS by default"* `[stated §20.6]`; §28 đặt self-hosting làm lý do chính để mã nguồn mở `[stated §28]`; §16 liệt kê Self-hosting `[stated §16]`. Đây là mitigation **một phần** vì nó ở dạng *khuyến nghị kiến trúc*, không ở dạng yêu cầu có thể kiểm chứng. |
| Residual risk | RQ.md lập luận self-host bằng **bảo mật**. Mục 8 của tài liệu này cho rằng lập luận **compliance mạnh hơn** (xem 8.5, trả lời §38 Q12) — nếu chỉ giữ lập luận bảo mật thì self-host dễ bị đánh đổi khi bản hosted tiện hơn. |
| Mitigation bổ sung | `SEC-017`, `SEC-018`, `SEC-021`; và quyết định ở mục 8.5: self-hosting là **bắt buộc từ V0.1**, không phải tuỳ chọn. |

#### THREAT-004 — Redaction config fail-open

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Tampering** (chủ động) + **Information Disclosure** (hệ quả) · `TB-1` → `TB-2` |
| Asset | `A-09` (mục tiêu trực tiếp), `A-01`…`A-06` (hệ quả) |
| Attacker model | `AM-9` (chủ yếu — **không cần attacker**), `AM-3` |
| Impact | **Critical.** Recorder chạy ở chế độ "không rule nào khớp" nghĩa là **full capture**: mọi header, mọi field, mọi row đi thẳng vào capsule. Đây không phải rò rỉ một trường — đây là **tắt toàn bộ `TB-2`**, tức tắt control point quan trọng nhất (mục 3.4). |
| Likelihood | **High.** Cần bao nhiêu nỗ lực để xảy ra? **Một PR sửa YAML.** File config bị xoá nhầm khi refactor; một typo làm YAML parse ra object rỗng; một key bị đổi tên khi nâng version; deploy thiếu file config vào image; biến môi trường trỏ sai đường dẫn. Không tình huống nào trong số này đòi hỏi ý định xấu. |
| Đặc điểm khiến nó nguy hiểm | **Âm thầm.** Ở chế độ fail-open, hệ thống vẫn chạy, capsule vẫn được tạo, developer vẫn replay được — thậm chí replay **tốt hơn** vì fidelity cao hơn khi không redact. Không có tín hiệu nào cho biết đã sai. Sự cố chỉ lộ ra khi có người tình cờ `repro inspect` và nhìn thấy dữ liệu thật. |
| Mitigation trong RQ.md | **Không có.** §16 đưa ra *hình dạng* file config (`redaction: headers: [...] fields: [...]`) `[stated §16]` nhưng **không nói gì** về integrity của file đó, không nói hành vi khi file thiếu, không nói hành vi khi parse lỗi, không nói ai được sửa `[GAP]`. |
| Residual risk | Kể cả sau `SEC-009`/`SEC-011`/`SEC-012`, vẫn còn trường hợp config **parse thành công nhưng sai nghĩa** (rule viết đúng cú pháp nhưng không khớp field nào). `SEC-010` (fingerprint config trong manifest) chỉ giúp *phát hiện sau*, không ngăn *trước*. Residual: Medium. |
| Mitigation bổ sung | `SEC-009` (parse lỗi ⇒ refuse to start), `SEC-011` (không config ⇒ dùng built-in default profile, **không bao giờ** "no redaction"), `SEC-012` (tắt redaction phải tường minh + audit + cảnh báo trên mọi capsule), `SEC-010` (fingerprint), `SEC-013` (CODEOWNERS gate cho PR sửa config), `SEC-001` (lỗi runtime ⇒ không persist) |

#### THREAT-005 — Recorder bị lạm dụng thành công cụ exfiltration nội bộ

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Elevation of Privilege** (chính) + **Information Disclosure** · `TB-1` → `TB-2` → `TB-4` |
| Asset | `A-03`, `A-06`, `A-01` |
| Attacker model | `AM-3` — insider **không** có quyền truy cập dữ liệu production nhưng **có** quyền merge config |
| Impact | **Critical.** Bản chất vấn đề: Repro **tạo ra một kênh dữ liệu hợp pháp mới** từ production ra ngoài. Trước Repro, tổ chức phân quyền dữ liệu production bằng quyền truy cập DB. Sau Repro, tồn tại đường thứ hai — và đường này được cấp cho một tập người **rộng hơn nhiều** (mọi developer cần debug), qua một cơ chế **được thiết kế để không gây ma sát**. |
| Chuỗi hành vi | Từng bước một đều là thao tác hợp lệ: (1) mở rộng phạm vi capture sang bảng có giá trị cao — trông như "cần thêm context để debug"; (2) tắt redaction cho một field — trông như "field này bị redact làm replay sai"; (3) chờ một lỗi xảy ra, hoặc chủ động tạo điều kiện cho lỗi xảy ra; (4) `repro pull`. **Không bước nào trông bất thường.** Toàn bộ chuỗi trông giống hệt công việc debug bình thường, và mỗi bước đều có lý do kỹ thuật chính đáng để nêu trong PR. |
| Likelihood | **Medium**, nhưng tăng theo quy mô tổ chức và mức độ nhạy cảm của dữ liệu. Điều đáng lo không phải xác suất mà là **khả năng phát hiện gần bằng không**. |
| Vì sao đây là privilege escalation | Repro biến "quyền merge config" thành "quyền đọc dữ liệu production" mà **không đi qua** cơ chế phân quyền dữ liệu hiện có của tổ chức. Nó không phá vỡ mô hình phân quyền — nó **đi vòng qua** mô hình đó, ở một tầng mà mô hình đó không nhìn thấy. |
| Mitigation trong RQ.md | **Không có.** §20.6 là section duy nhất bàn về attack surface, và nó chỉ mô hình hoá attacker **bên ngoài** chiếm được storage `[stated §20.6]`. **Mô hình insider hoàn toàn vắng mặt trong RQ.md** `[GAP]`. §20.5 liệt kê "strict access control" `[stated §20.5]` nhưng access control kiểm soát *ai đọc capsule*, không kiểm soát *ai quyết định capsule chứa gì*. |
| Residual risk | **Cao và không đóng được bằng công cụ.** `SEC-013` (CODEOWNERS) và `SEC-020` (audit) làm chuỗi trên **để lại dấu vết** và **cần đồng loã**, nhưng không ngăn được. Một tổ chức triển khai Repro phải chấp nhận rằng mình đang mở một kênh mới và phải quản trị nó như quản trị quyền truy cập dữ liệu, không như quản trị một dev tool. |
| Mitigation bổ sung | `SEC-013` (thay đổi phạm vi capture và redaction cần approval của owner khác người đề xuất), `SEC-012` (tắt redaction phải tường minh, có audit, có cảnh báo hiện trên capsule), `SEC-020` (audit append-only, không xoá được bởi chính principal), `SEC-019` (scoping: chỉ pull được capsule của service mình sở hữu), `SEC-010` (fingerprint config trong manifest ⇒ đối chiếu được capsule nào được tạo dưới config nào) |

#### THREAT-006 — Capsule vào git vĩnh viễn

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** · Zone 3 → Zone 4 (không có boundary — mục 3.3) |
| Asset | `A-01`, `A-03`, `A-06` |
| Attacker model | `AM-9` (đường 1), `AM-8` (đường 2 — không có attacker nào cả) |
| Impact | **Critical vì tính vĩnh viễn.** Git history là bất biến theo thiết kế. Force-push viết lại được history của một remote, nhưng **không xoá được** bản đã tồn tại trong: fork, clone của từng máy, CI cache, artifact cache, mirror, và mọi bản backup. Với repo mã nguồn mở thì thêm: mirror công khai của bên thứ ba. |
| **Đường 1 — vô tình** | Developer `repro pull` vào bên trong working tree của repo, rồi `git add .`. Không có gì trong thiết kế ngăn điều này `[GAP]`. |
| **Đường 2 — có chủ đích, và đây mới là vấn đề thật** | §26 xếp **"Regression test generation"** vào V0.2 `[stated §26]`, và §25 kết thúc demo bằng `✓ Regression case generated` `[stated §25]`. Một regression test sinh ra từ capsule **phải mang theo dữ liệu production** — nếu không nó không chạy được, vì chính dữ liệu đó là thứ tạo ra bug. Và một regression test **phải được commit** — nếu không nó không phải regression test. Nghĩa là: **tính năng này, đúng như thiết kế, đưa dữ liệu production vào git một cách có chủ đích.** Đây không phải lạm dụng; đây là dùng đúng. |
| Likelihood | Đường 1: **Medium**. Đường 2: **chắc chắn xảy ra** nếu tính năng V0.2 được xây theo mô tả hiện tại. |
| Mitigation trong RQ.md | **Không có** cho cả hai đường `[GAP]`. §26 liệt kê "Better data anonymization" ở V0.2 `[stated §26]` nhưng đặt nó ngang hàng như một cải tiến, không nối nó với vấn đề regression test mang dữ liệu vào git. |
| **Vì sao phải chốt ở V0.1 dù tính năng ở V0.2** | Đây là điểm quan trọng nhất của threat này. Regression test cần một dạng dữ liệu **an toàn để commit** — nghĩa là capsule format phải có sẵn chỗ để phân biệt "phần replay được nhưng không commit được" với "phần commit được", hoặc phải có cơ chế sinh fixture đã pseudonymize từ capsule. Cả hai đều **ràng buộc capsule format**. Capsule format là hợp đồng: sửa nó ở V0.2 nghĩa là phá vỡ mọi capsule đã tạo ở V0.1. **Quyết định phải nằm ở V0.1.** |
| Residual risk | `SEC-043` chặn được đường 1 ở mức CLI, nhưng không chặn được developer copy file thủ công. Đường 2 **không đóng được bằng requirement bảo mật** — nó cần một quyết định thiết kế sản phẩm, và quyết định đó thuộc về `ADR-002` (capsule format). Residual: **High** cho tới khi có quyết định đó. |
| Mitigation bổ sung | `SEC-043` (CLI từ chối ghi capsule vào trong git working tree trừ khi có cờ tường minh; tự ghi `.gitignore`), `SEC-042`, `SEC-047` (bản kê redaction để biết một capsule có commit được không). **Hạng mục chuyển tiếp**: ràng buộc lên capsule format cần được ghi vào `ADR-002` `[cần validate]`. |

#### THREAT-007 — Capsule sprawl trong Zone 3

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** · `TB-4` và Zone 3 → Zone 4 |
| Asset | `A-01`, `A-06`, `A-03` |
| Attacker model | `AM-8` (chủ yếu — **không phải tấn công**), `AM-10`, `AM-5` |
| Impact | **High.** Dữ liệu production được xử lý bởi các hệ thống mà tổ chức chưa bao giờ đánh giá, chưa ký hợp đồng xử lý dữ liệu, và trong nhiều trường hợp không biết là có. |
| Bốn đường rò rỉ, không đường nào là tấn công | (1) **Cloud sync**: `~/.repro` nằm trong home directory; iCloud Drive / Dropbox / OneDrive / Google Drive backup home directory theo mặc định ở nhiều cấu hình ⇒ capsule được upload lên hạ tầng bên thứ ba tự động. (2) **IDE indexer**: nếu capsule nằm trong workspace, IDE index nội dung để phục vụ tìm kiếm; index đó có thể được đồng bộ. (3) **AI assistant**: công cụ hỗ trợ lập trình đọc workspace và gửi nội dung tới backend — đây chính là công cụ mà developer đang debug sẽ dùng. (4) **Thiết bị mất hoặc bị đánh cắp**. |
| Likelihood | **High.** Không cần ai làm gì sai. Đây là hành vi mặc định của môi trường làm việc developer năm 2026. |
| Mitigation trong RQ.md | **Không có.** RQ.md không mô hình hoá Zone 3 như một môi trường có rủi ro; nó coi laptop developer là điểm đến an toàn `[inferred §8]` `[GAP]`. |
| Residual risk | **Cao — và vẫn Cao sau `GATE-05`.** `SEC-042`/`SEC-044`/`SEC-045` là hygiene control ở mức CLI — chúng giảm ma sát sai, không tạo containment. Containment thật ở Zone 3 chỉ đến từ (a) giảm giá trị nội dung capsule (mục 5, 6), (b) crypto-shredding để bản copy trở nên vô nghĩa khi bị thu hồi (mục 8.1), (c) chính sách endpoint của tổ chức — nằm ngoài sản phẩm. **Sau `GATE-05b`: đường (b) đã được CHỌN** — `SEC-016` = `MUST-V0.1` ⇒ lần đầu tiên tồn tại một cơ chế containment thật cho Zone 3 ở tầng quyết định. **Nhưng residual không hạ**, vì hiệu lực của (b) treo hoàn toàn trên **key custody** (`U-06d`, blocker theo `GATE-05b-r2`): không có nơi giữ và phá khoá thì bản copy trong iCloud, trong index của IDE, trong backend của AI assistant vẫn là **plaintext đã rời tổ chức**. `SEC-044` nay neo vào TTL server 30 ngày (`GATE-05a`) nhưng vẫn là `SHOULD` và vẫn bị vô hiệu bằng một thao tác copy file. **Vì vậy `THREAT-007` KHÔNG rời nhóm dẫn xuất** — xem callout ba con số ở 4.3. |
| Mitigation bổ sung | `SEC-042` (permission 0600/0700), `SEC-044` (TTL cục bộ + `repro gc`, neo vào 30 ngày phía server), `SEC-045` (cảnh báo khi đích nằm trong đường dẫn cloud-sync đã biết), `SEC-016` **`MUST-V0.1`** (`✅ CHỐT GATE-05b — 2026-08-14`) — crypto-shred, cơ chế duy nhất làm bản copy ở Zone 3 trở nên khả hồi; **khả hồi CÓ ĐIỀU KIỆN**: chỉ khi key custody tồn tại (`U-06d`, `GATE-05b-r2`) |

#### THREAT-008 — Bản self-host không có access control

`[GAP — RQ.md KHÔNG CÓ MITIGATION]` · **✅ ĐÃ CHỐT 2026-08-14 — mitigation đến từ quyết định sản phẩm `D2`, KHÔNG từ RQ.md** · xem mục 10

> **Phân biệt hai điều, đừng gộp**: (1) `RQ.md` **vẫn không có mitigation** cho threat này — §28 nguyên văn vẫn xếp *Access control* và *Retention policies* vào commercial layer, nên nhãn `[GAP]` **giữ nguyên** đúng theo quy ước mục 1.5; (2) quyết định sản phẩm ngày **2026-08-14** (`D2`, mục 10) **ghi đè** phần đó của §28 và cấp một mitigation: authn + authz + audit **nằm trong OSS core**. Threat này có mitigation vì **có người quyết**, không phải vì tài liệu nguồn đã tính tới nó.

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Elevation of Privilege** + **Information Disclosure** · `TB-3`, `TB-4` |
| Asset | `A-01`, `A-11`, toàn bộ nội dung capsule |
| Attacker model | `AM-4` (chủ yếu), `AM-3`, `AM-1` |
| Impact | **Critical.** Nếu bản self-host không có authn/authz thì mọi người trong mạng nội bộ có thể `repro list` và `repro pull` **mọi capsule của mọi service** — bao gồm capsule của service mà họ không liên quan. Điều này đồng thời vô hiệu hoá mọi lập luận compliance ở mục 8 (không có logical access control ⇒ không chứng minh được CC6.1; không có audit control ⇒ không đạt yêu cầu audit của HIPAA). |
| Nghịch lý trung tâm | §20.6 khuyến nghị dùng bản self-host **vì lý do bảo mật** `[stated §20.6]`. §28 xếp Access control, Retention policies, Team management, Enterprise security vào **commercial layer**, còn OSS core chỉ có `Basic Self-hosting` `[stated §28]`. Ghép hai câu này: **bản mà RQ.md khuyến nghị dùng vì bảo mật lại chính là bản không có control bảo mật.** |
| Likelihood | **Trước 2026-08-14: High** nếu §28 được hiện thực đúng như viết. **Sau `D2`: Medium** — kịch bản "bản self-host không có control nào" đã bị loại bỏ ở mức quyết định phạm vi; phần xác suất còn lại chuyển từ *"sản phẩm cố ý không có authz"* sang *"authz được hiện thực sai hoặc triển khai sai"*. |
| Mitigation trong RQ.md | **Không có** — và tệ hơn: RQ.md **mâu thuẫn với chính nó**. §20.5 liệt kê "strict access control" là mitigation cho Sensitive Production Data `[stated §20.5]`, và §21 xếp dòng "Sensitive data" là Critical với cột **MVP? = Yes** `[stated §21]`. Hai section này coi access control là hạng mục MVP; §28 coi nó là tính năng trả phí. **Điều này vẫn đúng nguyên văn với RQ.md tại thời điểm đọc** — quyết định `D2` không sửa RQ.md. |
| **Mitigation từ quyết định sản phẩm** | **✅ `D2`, 2026-08-14** — authentication + authorization (access control) + audit log được chốt **nằm trong OSS core**, ghi đè phần §28 xếp *Access control* và *Retention policies* vào commercial layer. Hệ quả trực tiếp: `SEC-018` (authn + authz deny-by-default), `SEC-019` (capsule scoping), `SEC-020` (audit append-only), `SEC-021` (xoá cứng ở bản self-host) được **xác nhận `MUST-V0.1` trong OSS core**, không còn treo chờ quyết định. Chi tiết và lý do: mục 10. |
| Residual risk | **Giảm nhưng KHÔNG về 0 — Medium.** Ba lý do, và cần đọc rời nhau: **(1) `D2` là quyết định *phạm vi*, không phải một control đang chạy.** Nó trả lời "control này có được xây không", không trả lời "control này có đúng không". Authz hiện thực sai — deny-by-default bị lách, scope leak trong `repro list`, phân quyền theo service không khớp mô hình sở hữu thật của tổ chức — là một rủi ro **riêng biệt**, và nó thuộc lớp lỗi phổ biến nhất trong mọi hệ thống có phân quyền. **(2) `GAP-04` còn nguyên**: §18 khai báo đúng 6 CLI verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) `[stated §18]` và **cả 6 đều developer-side** — không có verb nào để cấp/thu quyền, đọc audit log, hay vận hành retention. Control bắt buộc phải tồn tại nhưng **không có giao diện để vận hành** thì trên thực tế nó không được vận hành. **`GATE-04` (2026-08-14) KHÔNG đóng `GAP-04`**: nó đưa `authn/authz/audit hook` vào **sàn bắt buộc của Capsule Store** — tức xác nhận control phải tồn tại **ở tầng kiến trúc** — nhưng §18 vẫn không có verb nào để vận hành, và **cơ chế** authn/authz cụ thể vẫn `TBD` (`GATE-04-r`, cuối mục 10). **(3)** Bản self-host vẫn phải tự vận hành key custody và audit storage; `D2` không cấp cho tổ chức năng lực làm việc đó — và sau `GATE-05b`, **key custody nặng hơn hẳn**: crypto-shred `MUST-V0.1` biến key store từ hạng mục tuỳ chọn thành **thành phần bắt buộc chưa có ai đặc tả** (`U-06d`, blocker theo `GATE-05b-r2`). **Residual giữ Medium** — `GATE-04` và `GATE-05` không hạ nó. |
| Mitigation bổ sung | `SEC-018`, `SEC-019`, `SEC-020`, `SEC-021` — **cả bốn nay là `MUST-V0.1` trong OSS core theo `D2`**, không còn `[cần anh chốt]`. Còn thiếu và là nợ tường minh: **giao diện vận hành cho `GAP-04`** — cần một quyết định sản phẩm về nơi SRE/admin thao tác authz, audit và retention (CLI verb mới, hay giao diện khác). Threat model không tự chốt việc này vì nó là quyết định phạm vi sản phẩm, không phải quyết định bảo mật. **Sau `GATE-04` (2026-08-14)**: sàn của Capsule Store **đã chốt** và `authn/authz/audit hook` nằm trong sàn ⇒ bốn requirement trên có chỗ đứng kiến trúc; nhưng **`GAP-04` vẫn chưa đóng** và **cơ chế** authn/authz vẫn `TBD` — nợ này **không** được `GATE-04` trả (`GATE-04-r`). |

#### THREAT-009 — Capsule là input không tin cậy → thực thi mã trên máy developer

`[GAP — RQ.md KHÔNG CÓ MITIGATION]` · **Đây là khoảng trống lớn nhất của thiết kế**

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Tampering** + **Elevation of Privilege** · `TB-5` |
| Asset | **`A-12`** (máy developer và credential trên đó) — không phải capsule |
| Attacker model | `AM-6` — bên cung cấp được capsule cho developer. Không cần chiếm được gì trước. |
| **Bản chất vấn đề** | Toàn bộ RQ.md nhìn dữ liệu chảy **ra**: production → capsule → storage → laptop. Mọi mitigation ở §16, §20.5, §20.6 đều là mitigation cho chiều đó. Nhưng `repro replay` làm một việc ngược lại về mặt trust: nó **nạp và deserialize một artifact do bên khác tạo, rồi tiêm giá trị trong đó vào runtime đang chạy code của developer** `[stated §8, §11, §12]`. Ở khoảnh khắc đó, capsule là **input không tin cậy**, và RQ.md **không có một dòng nào về capsule integrity** — không hash, không signature, không verification `[GAP]`. |
| Lớp lỗ hổng liên quan (nêu trong ngữ cảnh phòng thủ, mỗi lớp đi kèm một `SEC-xxx` để chặn) | **(a) Path traversal / zip-slip khi extract** — entry trong capsule chỉ định vị trí ghi file; nếu vị trí đó thoát khỏi thư mục đích thì việc mở capsule ghi đè file ngoài ý muốn ⇒ chặn bằng `SEC-028`. **(b) Prototype pollution** — MVP là Node.js `[stated §18]`; nếu key trong dữ liệu capsule được gán vào object mà không chặn `__proto__` / `constructor` / `prototype`, thuộc tính bị chèn vào prototype chung và thay đổi hành vi của code không liên quan ⇒ chặn bằng `SEC-029`. **(c) Decompression bomb** — §20.12 chọn compression làm mitigation cho capsule size `[stated §20.12]`, nghĩa là replay runtime sẽ giải nén dữ liệu do bên khác cung cấp ⇒ chặn bằng `SEC-030`. **(d) Điều hướng kết nối** — capsule chỉ định endpoint mà replay runtime kết nối tới ⇒ chặn bằng `SEC-035` (giá trị trong capsule chỉ được dùng làm **khoá tra cứu**, không bao giờ dùng để mở kết nối) và `SEC-032` (allowlist egress). **(e) Manifest chỉ định module để load** — capsule khai báo adapter/plugin cần nạp ⇒ chặn bằng `SEC-035`. |
| Impact | **Critical — và impact không nằm ở dữ liệu.** Máy chạy replay là máy có SSH key vào hạ tầng, cloud credential, session đăng nhập của các dịch vụ nội bộ, và **quyền push code**. Vì vậy đây là con đường đi từ *lộ dữ liệu* sang **compromise chuỗi phát triển**: từ một capsule tới quyền ghi vào mã nguồn của tổ chức. |
| Likelihood | **Medium hôm nay, và tăng theo thời gian.** Ban đầu capsule chỉ đến từ storage của chính tổ chức. Nhưng đây là một OSS dev tool `[stated §28]`: hệ sinh thái sẽ tự nhiên sinh ra **"sample capsule" chia sẻ công khai** để demo, để báo bug, để viết tutorial, để đính kèm vào issue trên GitHub. Ở thời điểm đó, "mở một capsule người lạ gửi" trở thành thao tác thường ngày và likelihood lên **High**. Điều đáng chú ý: **thời điểm đó cũng chính là thời điểm sản phẩm thành công.** |
| Mitigation trong RQ.md | **Không có gì cả.** Không phải "chưa đủ" mà là **không tồn tại**: RQ.md không nhắc tới integrity, hash, signature hay verification của capsule ở bất kỳ section nào `[GAP]`. |
| Residual risk | **Thấp nếu đóng ngay, cao nếu để lại.** Đây là threat có tỉ lệ chi phí/lợi ích tốt nhất trong toàn bộ tài liệu: nó đóng được bằng **một requirement rẻ** — `SEC-027`: **verify hash/signature TRƯỚC KHI parse payload**. Điều kiện là manifest phải có chỗ chứa digest **từ v1 của capsule format**; nếu format v1 không có chỗ đó thì việc bổ sung sau là breaking change. |
| Mitigation bổ sung | `SEC-027` (verify trước khi parse — **ưu tiên cao nhất**), `SEC-028`, `SEC-029`, `SEC-030`, `SEC-035`, `SEC-036`, `SEC-038`, `SEC-039` `[DEFER]`. **Hạng mục chuyển tiếp**: `ADR-002` phải dành chỗ cho digest/signature trong manifest v1. |

#### THREAT-010 — Replay gây side effect thật lên hệ thống production

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Tampering** (lên hệ thống thật) · `TB-6` |
| Asset | `A-13` |
| Attacker model | `AM-9` (chủ yếu), `AM-6` |
| Impact | **Critical.** RQ.md liệt kê đúng: charge credit card, send email, create shipment, send webhook, delete record, publish Kafka event `[stated §13]`. Thiệt hại ở đây là **thiệt hại thật ngoài đời**, không phải thiệt hại dữ liệu — và nó xảy ra với người dùng cuối, không với tổ chức. |
| Likelihood | **Medium.** Replay được thiết kế để chạy code production thật với input production thật; nếu một sink không bị chặn thì nó sẽ chạy. |
| Mitigation trong RQ.md | **Có, ở mức nguyên tắc.** §13 nêu yêu cầu phân biệt READ/WRITE và quy định `WRITE → do not execute against real production systems → return recorded result` `[stated §13]`; §20.4 nêu *"Default-deny write behavior during replay"* `[stated §20.4]`; §21 xếp "Side effects" là Critical, MVP=Yes `[stated §21]`; §33 nguyên tắc 6 *"Safe by default"* `[stated §33]`. Nguyên tắc **đúng và rõ**. |
| Residual risk | Nguyên tắc đúng nhưng **cơ chế được mô tả không đủ** — đó là nội dung riêng của `THREAT-018`. Ở mức nguyên tắc, residual risk là Low; ở mức cơ chế, residual risk là High. Hai điều này phải được tách ra để không tạo cảm giác an toàn sai. |
| Mitigation bổ sung | `SEC-034` (thiếu recorded response ⇒ trả lỗi `MISSING_RECORDING`, **không** fall through ra hệ thống thật), `SEC-032`, `SEC-033` — xem `THREAT-018` |

#### THREAT-011 — Không quy trách nhiệm được sau khi capsule rời Zone 2

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Repudiation** · `TB-4` |
| Asset | `A-11`, `A-01` |
| Attacker model | `AM-4`, `AM-3` |
| Impact | **High, và impact chủ yếu là impact pháp lý/tổ chức chứ không phải kỹ thuật.** Khi có sự cố, tổ chức phải trả lời: *dữ liệu của những chủ thể nào đã bị lộ, và đã đi tới đâu*. Không có audit thì câu trả lời là "không biết" — và "không biết" là câu trả lời tệ nhất có thể đưa cho cơ quan quản lý (mục 8.1, nghĩa vụ thông báo vi phạm). |
| Hai lớp của vấn đề | **Lớp 1**: bản thân audit log có thể không tồn tại trong bản self-host, vì §28 xếp Enterprise security vào commercial `[stated §28]` — xem `THREAT-008`. **Lớp 2**: kể cả khi có audit đầy đủ, nó chỉ ghi được *"ai đã pull"*. Nó **không thể** ghi *"capsule đó sau đó đi đâu"* — vì sau `TB-4` không còn điểm quan sát nào (mục 3.5 lý do 4). |
| Likelihood | **High** — đây là trạng thái mặc định của thiết kế, không cần điều kiện gì. |
| Mitigation trong RQ.md | **Không có.** §20.17 có liệt kê "audit logs" trong danh sách những thứ cần support cho compliance `[stated §20.17]`, nhưng đó là một gạch đầu dòng trong danh sách, không phải một cơ chế được thiết kế: không nói ghi gì, ghi ở đâu, ai xoá được, giữ bao lâu `[GAP]`. |
| Residual risk | **Lớp 2 không đóng được.** `SEC-020` đóng được lớp 1 (audit tồn tại, append-only, principal không tự xoá được dấu vết của mình), nhưng không có requirement nào đóng được lớp 2. Đây là giới hạn cấu trúc của một sản phẩm phát artifact portable. Cách duy nhất làm nhẹ nó: crypto-shredding (`SEC-016`) biến "không biết nó ở đâu" thành "không quan trọng nó ở đâu, vì nó không đọc được nữa". **Sau `GATE-05b`: cách đó đã được chọn** — `SEC-016` = `MUST-V0.1`. Nhưng ba điều **không đổi**: (a) lớp 2 vẫn **không đóng được** — crypto-shred *làm nhẹ* hệ quả, nó **không** cấp lại khả năng biết capsule đã đi tới đâu, và câu trả lời cho cơ quan quản lý vẫn không phải *"nó ở những nơi này"*; (b) việc *làm nhẹ* treo trên key custody (`U-06d`, `GATE-05b-r2`); (c) một khoá đã bị lấy trước khi phá thì phá khoá không cứu được gì — audit việc **lấy khoá** (`SEC-020`) vì vậy nay quan trọng hơn trước. **`THREAT-011` KHÔNG rời nhóm dẫn xuất** (4.3). |
| Mitigation bổ sung | `SEC-020` (audit append-only cho mọi `list/pull/inspect`/lấy key — **nay là control chính của key custody**), `SEC-024` (`data_classification` trên capsule ⇒ khoanh vùng được phạm vi sự cố), `SEC-047` (bản kê redaction ⇒ biết capsule đó *có thể* chứa gì), `SEC-016` **`MUST-V0.1`** (`✅ CHỐT GATE-05b — 2026-08-14`, kèm điều kiện `U-06d`) |

#### THREAT-012 — Recorder làm suy giảm hoặc gây lỗi production

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Denial of Service** · `TB-2` (recorder nằm trong process production) |
| Asset | `A-13` — chính hệ thống production |
| Attacker model | `AM-9`, `AM-1` (gửi request cỡ lớn để khuếch đại chi phí capture) |
| Impact | **High.** Recorder chạy **in-process** `[stated §17, §20.14]`. Một lỗi trong recorder là một lỗi trong production. RQ.md hiểu điều này và phát biểu rất đúng: *"Repro must never become the reason production becomes slower or fails"* `[stated §20.7]`. |
| Likelihood | **Medium.** |
| Mitigation trong RQ.md | **Một phần.** §20.7 liệt kê asynchronous capture, bounded buffers, sampling, configurable capture limits, capture only failed/high-value executions `[stated §20.7]`; §21 xếp "Production overhead" là High, MVP=Yes `[stated §21]`. Danh sách đúng hướng nhưng ở dạng danh sách kỹ thuật, chưa có hành vi bắt buộc khi vượt ngưỡng. |
| Residual risk | Điểm chưa được RQ.md nói: **hành vi khi buffer đầy**. Nếu buffer đầy mà recorder chờ, nó chặn request production; nếu nó ném lỗi ra ngoài, nó làm hỏng request. Cả hai đều vi phạm chính nguyên tắc §20.7. Đáp án duy nhất đúng là **drop capture**, và điều đó phải được viết ra chứ không suy diễn `[GAP]`. Ngoài ra `SEC-001` (redaction lỗi ⇒ không persist) tương tác với threat này: fail-closed về **dữ liệu** phải đi kèm fail-open về **tính sẵn sàng của production** — mất capsule thì chấp nhận được, mất request production thì không. |
| Mitigation bổ sung | `SEC-037` (async + bounded buffer; đầy ⇒ **drop capture**, không bao giờ chặn hay ném lỗi ra luồng request), `SEC-008` (row/byte cap — ngưỡng `TBD`, mục 11.b) |

#### THREAT-013 — Capsule giả mạo được nạp vào storage

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Spoofing** · `TB-3` |
| Asset | `A-01`, và qua đó là `A-12` |
| Attacker model | `AM-1`, `AM-2`, `AM-3` |
| Impact | **High, vì nó nối vào `THREAT-009`.** Nếu collector nhận capsule mà không xác thực nguồn gửi, một bên bất kỳ có thể đặt capsule vào storage của tổ chức. Capsule đó sau đó xuất hiện trong `repro list` như một capsule hợp lệ, mang **uy tín của hạ tầng nội bộ** — và developer sẽ mở nó mà không nghi ngờ. Đây là cách biến `AM-6` (cần thuyết phục developer mở file lạ) thành một attacker không cần thuyết phục ai. |
| Likelihood | **Medium** — phụ thuộc vào việc collector có xác thực recorder hay không, mà RQ.md không nói. |
| Mitigation trong RQ.md | **Không có.** RQ.md mô tả luồng `Recorder → Capsule → Storage` `[stated §17]` nhưng không nói collector xác thực recorder bằng cách nào, cũng không nói capsule có ràng buộc gì với service đã tạo ra nó `[GAP]`. |
| Residual risk | Sau `SEC-017` + `SEC-027`, residual thấp: capsule không đúng nguồn bị từ chối ở ingest, và capsule bị sửa sau ingest bị phát hiện ở replay. Residual còn lại nằm ở `AM-2` (đã chiếm được chính collector) — đóng bằng `SEC-039` `[DEFER]`. |
| Mitigation bổ sung | `SEC-017` (mỗi service có credential riêng để ghi vào collector; capsule ghi vào scope của service đó), `SEC-027`, `SEC-019`, `SEC-039` `[DEFER]` |

#### THREAT-014 — Capsule quá lớn gây cạn tài nguyên

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Denial of Service** · `TB-2` + `TB-3` |
| Asset | `A-13`, hạ tầng Zone 2 |
| Attacker model | `AM-1`, `AM-9` |
| Impact | **Medium.** Capsule khổng lồ làm cạn bộ nhớ ở recorder, cạn dung lượng ở storage, và làm `repro pull` trở nên bất khả thi. |
| Likelihood | **Medium** — file upload, kết quả truy vấn không giới hạn, dữ liệu binary đều xuất hiện tự nhiên `[stated §20.12]`. |
| Mitigation trong RQ.md | **Có.** §20.12 liệt kê compression, deduplication, content hashing, size limits, selective capture, lazy loading `[stated §20.12]`; §21 xếp "Capsule size" là High, MVP=Yes `[stated §21]`. |
| Residual risk | Hai điểm còn lại. **(a)** Ngưỡng cụ thể chưa có và không thể bịa — xem mục 11.b. **(b)** Chính lựa chọn **compression** ở §20.12 mở ra bề mặt tấn công ở chiều ngược: replay runtime phải giải nén dữ liệu do bên khác cung cấp ⇒ decompression bomb (`THREAT-009` lớp c). Đây là ví dụ sạch của một mitigation ở chiều ra tạo ra rủi ro ở chiều vào — RQ.md không nhìn thấy vì nó không mô hình hoá chiều vào. |
| Mitigation bổ sung | `SEC-008` (row/byte cap, truncate + đánh dấu `truncated: true`), `SEC-030` (giới hạn kích thước sau giải nén, số entry, tỉ lệ nén), `SEC-037` |

#### THREAT-015 — Replay "thành công" nhưng đi đường khác, tạo kết luận sai

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Repudiation** / tính toàn vẹn của kết luận · `TB-5` |
| Asset | `A-07`, và uy tín của chính sản phẩm |
| Attacker model | `AM-9` |
| Impact | **High.** Nếu Repro báo "reproduced" trong khi execution đi một đường khác, developer sẽ "sửa" một bug không tồn tại và tin rằng bug thật đã hết. Đây là một dạng **false assurance được sản phẩm cấp phát**. |
| Likelihood | **Medium.** |
| Mitigation trong RQ.md | **Khá đủ — đây là threat được RQ.md xử lý tốt nhất.** §10 đặt Execution Verification làm tính năng lõi và phân biệt rõ *"Replay completed"* với *"Execution matched"* `[stated §10, §20.3]`; §9 đưa Execution Diff thành khả năng chính `[stated §9]`; §20.16 yêu cầu dùng ngôn ngữ chính xác — `✓ Captured execution no longer reproduces` thay vì `✓ Production bug is definitely fixed` `[stated §20.16]`; §21 xếp cả "False replay equivalence" lẫn "False confidence" là Critical, MVP=Yes `[stated §21]`. |
| Residual risk | Một điểm RQ.md **chưa nhìn thấy**, và nó đến từ chính công việc bảo mật: **redaction làm thay đổi execution path** (mục 6). Nghĩa là Execution Diff sẽ báo divergence do redaction gây ra và developer sẽ hiểu nhầm là divergence do code. Điều này làm suy yếu chính cơ chế mà §10 dựa vào. Đóng bằng `SEC-048`. |
| Mitigation bổ sung | `SEC-048` (Execution Diff phải phân biệt "diverged vì code" với "diverged vì redaction"), `SEC-047` (bản kê redaction làm dữ liệu đầu vào cho `SEC-048`) |

#### THREAT-016 — Capsule tồn tại vô thời hạn và không xoá được

`[GAP — RQ.md KHÔNG CÓ MITIGATION]` · **✅ CHỐT GATE-05a — 2026-08-14** (TTL mặc định = 30 ngày) · **✅ CHỐT GATE-05b — 2026-08-14** (crypto-shred = `MUST-V0.1`) · **mitigation đến từ quyết định sản phẩm, KHÔNG từ RQ.md** · xem mục 11.a, 11.c

> **Phân biệt ba điều, đừng gộp**: (1) `RQ.md` **vẫn không có mitigation** cho threat này — §16 không nhắc retention, §20.5/§20.17 chỉ có gạch đầu dòng không giá trị mặc định, §28 vẫn xếp *Retention policies* vào commercial layer, và `RQ.md` **không nhắc tới crypto-shredding ở bất kỳ đâu** ⇒ nhãn `[GAP]` **giữ nguyên** đúng quy ước mục 1.5; (2) hai quyết định ngày **2026-08-14** cấp mitigation: `GATE-05a` cho vế *"vô thời hạn"* — **vô điều kiện**, và `GATE-05b` cho vế *"không xoá được"* — **có điều kiện key custody**; (3) vì vậy threat này **rời nhóm dẫn xuất** (10 → 9, xem callout ba con số ở 4.3) **nhưng residual vẫn Cao**. Rời nhóm đo *"có mitigation hay chưa"*, không đo *"đã an toàn hay chưa"*.

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Information Disclosure** (kéo dài theo thời gian) · `TB-3` + `TB-4` |
| Asset | `A-01`, `A-06` |
| Attacker model | `AM-8`, `AM-2`, `AM-10` |
| Impact | **High.** Mỗi capsule còn tồn tại là một cửa sổ phơi nhiễm còn mở. Một capsule sống 3 năm là một capsule có 3 năm để bị lộ, và mang dữ liệu đã hết mục đích sử dụng từ lâu — mục đích của nó là debug một lỗi cụ thể, và mục đích đó chấm dứt khi lỗi được sửa. |
| Likelihood | **Trước 2026-08-14: High** — đây là hành vi mặc định nếu không có TTL. **Sau `GATE-05a`: Medium** — *"không ai cấu hình ⇒ sống mãi"* **không còn là hành vi mặc định**: `SEC-022` áp **30 ngày** khi cấu hình vắng mặt, và cấu hình TTL vô hạn bị **từ chối**. Phần xác suất còn lại chuyển từ *"thiết kế không có TTL"* sang *"tổ chức tự nới TTL lên rất dài"* (TTL cấu hình được theo `FR-024`) và *"cơ chế hết hạn hiện thực sai"* — cùng lớp rủi ro với `GATE-04-r`: một control tồn tại không đồng nghĩa control chạy đúng. |
| Mitigation trong RQ.md | **Không có cơ chế.** §16 không nhắc retention `[stated §16]`. §20.5 liệt kê "configurable retention" và §20.17 liệt kê "data retention policies" + "deletion" `[stated §20.5, §20.17]` — nhưng cả hai đều là **gạch đầu dòng trong danh sách mitigation**, không phải thiết kế: không có giá trị mặc định, không có hành vi khi hết hạn, không có định nghĩa "xoá" nghĩa là gì khi capsule đã qua `TB-4`. Và §28 xếp "Retention policies" vào **commercial layer** `[stated §28]` ⇒ bản self-host có thể **không có** cơ chế này. **Điều này vẫn đúng nguyên văn với `RQ.md` tại thời điểm đọc** — `GATE-05` không sửa `RQ.md`. |
| **Mitigation từ quyết định sản phẩm** | **✅ `GATE-05a`, 2026-08-14** — TTL mặc định = **30 ngày**, quyết bởi `@TrisJr`; `SEC-022` nay có giá trị để áp khi cấu hình vắng mặt, vẫn cấu hình được theo `FR-024`. Đóng `U-06b`. **✅ `GATE-05b`, 2026-08-14** — crypto-shredding = **`MUST-V0.1`** (`SEC-016`), khoá giữ phía server; xoá khoá ⇒ capsule không giải được. Đóng `U-06c`. Hai quyết định này **ghi đè phần §28** xếp *Retention policies* vào commercial layer, cùng cách `D2` đã ghi đè phần *Access control* (mục 10). Chi tiết và lý do: mục 11.a và 11.c. |
| Residual risk | **Cao ở phần bản copy — nhưng lý do đã đổi hoàn toàn.** Hai vế phải đọc rời nhau. **(1) Vế *"tồn tại vô thời hạn"* — đóng.** `SEC-022` có giá trị mặc định (30 ngày) và `SEC-023` xoá tự động khi hết hạn; cửa sổ phơi nhiễm của **bản gốc** nay hữu hạn theo mặc định, không cần ai cấu hình gì. **(2) Vế *"không xoá được bản copy"* — có cơ chế, chưa có hiệu lực.** Câu cũ *"`SEC-022`/`SEC-023` xoá được bản gốc ở Zone 2, chúng **không chạm được** tới N bản đã nằm ở Zone 3 và Zone 4"* **vẫn đúng về hai requirement đó**, nhưng kết luận rút ra từ nó **không còn đúng**: `SEC-016` nay là **`MUST-V0.1`** ⇒ **crypto-shred CHẠM ĐƯỢC tới N bản copy đó** — phá khoá làm mọi bản trên laptop, trong git, trong Slack, trong backup trở thành ciphertext vô nghĩa **mà không cần biết chúng ở đâu** (mục 8.1.2). **Đây là thay đổi có sức nặng nhất mà `GATE-05` tạo ra trong tài liệu này.** ⚠ **Điều kiện, và nó là điều kiện cứng**: hiệu lực đó **chỉ tồn tại khi có key custody** — nơi giữ khoá, vòng đời khoá, cơ chế phá khoá, và chính sách sao lưu khoá (nghịch lý sao lưu ở mục 8.1.2). `U-06d` nay là **blocker** (`GATE-05b-r2`). Cho tới khi `U-06d` được giải, residual của vế (2) giữ **Cao**: quyết định đã có, năng lực thực thi thì chưa. |
| Mitigation bổ sung | `SEC-022` (mọi capsule có TTL hữu hạn; hệ thống **từ chối** cấu hình TTL vô hạn — **giá trị mặc định = 30 ngày**, `✅ CHỐT GATE-05a — 2026-08-14`, mục 11.a), `SEC-023` (hết hạn ⇒ xoá tự động + ghi audit), `SEC-021` (lệnh xoá cứng nằm trong OSS core — **nay bao gồm phá khoá**, vì `SEC-016` đã chốt), `SEC-044` (TTL cục bộ ở Zone 3, neo vào 30 ngày phía server), `SEC-016` **`MUST-V0.1`** (`✅ CHỐT GATE-05b — 2026-08-14`; thực thi được **khi và chỉ khi** có key custody — `U-06d`, `GATE-05b-r2`). **Còn thiếu và là nợ tường minh**: `GAP-04` — không có CLI verb nào để **đặt/kiểm tra retention** hay **thực thi phá khoá**; một TTL 30 ngày không kiểm tra được và một lệnh phá khoá không có giao diện thì trên thực tế không được vận hành (`GATE-04-r`, cuối mục 10). |

#### THREAT-017 — Replay sai version/schema tạo kết luận không đáng tin

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Repudiation** / tính toàn vẹn của kết luận · `TB-5` |
| Asset | `A-07` |
| Attacker model | `AM-9` |
| Impact | **Medium.** Kết luận rút ra từ một replay chạy trên code khác, dependency khác hoặc schema khác không dùng được làm bằng chứng trong hồ sơ sự cố. |
| Likelihood | **High** — drift là trạng thái bình thường, không phải ngoại lệ. |
| Mitigation trong RQ.md | **Có.** §15 yêu cầu ghi application version, git commit, runtime version, dependency versions, schema version, và cảnh báo khi lệch `[stated §15]`; §20.8 và §20.9 lặp lại cho version drift và schema drift `[stated §20.8, §20.9]`; §21 xếp cả hai là High, MVP=Yes `[stated §21]`. |
| Residual risk | RQ.md chọn **cảnh báo**, không chọn **chặn** `[stated §15 "Replay may not be deterministic"]`. Đó là lựa chọn hợp lý về UX, nhưng nó đẩy rủi ro sang phía người đọc kết quả. Residual: Medium. Từ góc bảo mật, điều cần thêm là metadata drift phải xuất hiện **trong output của diff**, không chỉ trong một dòng cảnh báo lúc khởi động — để kết luận luôn đi kèm điều kiện của nó. |
| Mitigation bổ sung | `SEC-024` (metadata phân loại và điều kiện replay đi kèm capsule), `SEC-048` (phân loại nguyên nhân divergence — code, redaction, hay drift) |

#### THREAT-018 — Egress khi replay không thực sự bị chặn: phân loại theo verb fail-open

`[GAP — RQ.md KHÔNG CÓ MITIGATION]` · **Siết chặt lên §13 / §20.4** — §13 nêu *ý định* nhưng không nêu cơ chế đủ, nên threat này được tính vào nhóm không-có-mitigation

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Tampering** + **Information Disclosure** · `TB-6` |
| Asset | `A-13` (side effect thật), `A-01` (capsule bị gửi ra ngoài) |
| Attacker model | `AM-9` (chủ yếu), `AM-6` |
| **Vấn đề** | §13 đề xuất phân biệt READ/WRITE bằng **danh sách verb**: READ là `SELECT`, `GET`, cache read; WRITE là `INSERT`, `UPDATE`, `DELETE`, `POST payment`, publish event `[stated §13]`. Cơ chế này **fail-open đúng ở chỗ nguy hiểm nhất — cái nó không nhận diện được.** Nếu một operation không khớp mẫu nào trong danh sách WRITE, cơ chế mặc định coi nó là an toàn và cho chạy. Nói cách khác: bất kỳ đường đi nào mà instrumentation chưa biết đều được cấp quyền đi ra. |
| Các dạng không nhận diện được (nêu để định nghĩa yêu cầu phòng thủ, không phải hướng dẫn khai thác) | **Đường mạng không qua sink đã instrument**: `net.Socket` thô; `child_process` gọi công cụ dòng lệnh như `curl`; SDK của nhà cung cấp dùng transport riêng thay vì HTTP client tiêu chuẩn. **Câu SQL ghi nhưng không bắt đầu bằng verb ghi**: `WITH x AS (UPDATE ...) SELECT ...` bắt đầu bằng `WITH`; `SELECT charge_customer(...)` bắt đầu bằng `SELECT` nhưng gọi hàm có side effect; `CALL` gọi stored procedure. **HTTP ghi bằng verb đọc**: `GET /v1/send?to=...` — verb là `GET`, hành vi là gửi. |
| Impact | **Critical.** Trùng impact của `THREAT-010` (side effect thật lên `A-13`) cộng thêm một impact riêng: nếu egress không bị chặn thì **capsule có thể tự gửi chính nó ra ngoài** khi replay — biến `THREAT-009` từ "thực thi mã" thành "thực thi mã có kênh liên lạc". |
| Likelihood | **High.** Không cần attacker: chỉ cần một codebase thật đủ phức tạp có một đường ghi mà instrumentation chưa phủ. Với mọi ứng dụng production thực tế, xác suất tồn tại ít nhất một đường như vậy là rất cao. |
| Mitigation trong RQ.md | **Ý định có, cơ chế không đủ.** §20.4 nói "Default-deny write behavior" `[stated §20.4]` — nhưng cơ chế mô tả ở §13 thực chất là **deny theo danh sách**, tức denylist, chứ không phải default-deny. Một denylist gọi tên là default-deny là một nhầm lẫn nguy hiểm vì nó tạo cảm giác an toàn của cái sau với tính chất của cái trước. |
| Residual risk | Sau `SEC-032` + `SEC-033`, residual chuyển sang: (a) side effect **cục bộ** không qua mạng — ghi file, xoá file — cần `SEC-036` (sandbox); (b) đường loopback bị lạm dụng nếu máy developer có dịch vụ thật lắng nghe ở localhost. Residual: Medium. |
| Mitigation bổ sung | **`SEC-032`** — chặn egress ở **mức process** với **allowlist loopback + replay proxy**, thay vì dựa vào phân loại ở sink. Đây là đảo chiều then chốt: từ *"denylist các verb ghi"* thành *"allowlist những gì đã chứng minh là read"*. **`SEC-033`** — operation không chứng minh được là READ ⇒ **từ chối thực thi** với lỗi tường minh, không fall through. `SEC-034`, `SEC-035`, `SEC-036`. |

#### THREAT-019 — Chuỗi cung ứng `@repro/node` bị chiếm

`[GAP — RQ.md KHÔNG CÓ MITIGATION]`

| Trường | Nội dung |
|---|---|
| STRIDE + boundary | **Tampering** + **Elevation of Privilege** · `TB-1` → `TB-2` |
| Asset | Toàn bộ — `A-02`…`A-08`, và `A-13` |
| Attacker model | `AM-7` |
| Impact | **Critical, và là impact lớn nhất trong toàn bộ tài liệu này.** Recorder chạy **trong process production** `[stated §17, §20.14]`. Nghĩa là code của `@repro/node` — và của mọi transitive dependency của nó — chạy với **toàn quyền của ứng dụng production**: đọc được mọi biến môi trường, mọi credential, mọi kết nối DB, mọi dữ liệu đi qua ứng dụng. Đây là vị trí đắt nhất mà một attacker chuỗi cung ứng có thể chiếm được, và Repro đặt chính mình vào đó theo thiết kế. |
| Điểm khuếch đại | §20.14 chọn adoption path là `npm install @repro/node` + `repro.init()` `[stated §20.14]` — tối giản ma sát, đúng cho adoption. Nhưng nó cũng có nghĩa: **một package, cài vào nhiều production, chạy in-process**. Càng thành công thì mục tiêu càng đáng giá. Đây là threat thứ hai (cùng với `TB-4`) mà rủi ro **tăng theo thành công của sản phẩm**. |
| Likelihood | **Low–Medium** hôm nay, tăng theo mức phổ biến của package. |
| Mitigation trong RQ.md | **Không có.** RQ.md không nhắc tới chuỗi cung ứng, ký artifact, provenance, hay giới hạn dependency ở bất kỳ section nào `[GAP]`. |
| Residual risk | **Không loại bỏ được, chỉ giảm.** `SEC-040` (provenance/attestation khi publish, lockfile pinned) làm khó việc chèn code lạ và làm dễ việc phát hiện, nhưng bản chất "code của bên thứ ba chạy trong production" là đánh đổi mà tổ chức nhận khi cài Repro. Điều đúng đắn là **nói thẳng đánh đổi này** trong tài liệu hướng tới người ra quyết định, thay vì để nó ẩn dưới một dòng `npm install`. |
| Mitigation bổ sung | `SEC-040` (publish có provenance/attestation; lockfile pinned; số lượng dependency của recorder giữ ở mức tối thiểu và được liệt kê tường minh), `SEC-037` (recorder không được có khả năng làm hỏng request production), `SEC-004` (allowlist env ⇒ ngay cả recorder cũng không đọc biến môi trường ngoài danh sách) |

### 4.5 Tổng kết mục 4

| Chỉ số | Giá trị |
|---|---|
| Tổng số threat | 19 |
| RQ.md có mitigation (đủ hoặc một phần) | 8 — `THREAT-001, 002, 003, 010, 012, 014, 015, 017` |
| **RQ.md hoàn toàn không có mitigation** | **11 — `THREAT-004, 005, 006, 007, 008, 009, 011, 013, 016, 018, 019`** — con số này **đo RQ.md** và **không đổi** sau 2026-08-14 |
| **Không có mitigation từ bất kỳ nguồn nào** — giá trị **sau `D2`** (lịch sử) | **10 — `THREAT-004, 005, 006, 007, 009, 011, 013, 016, 018, 019`**. `THREAT-008` rời nhóm này: mitigation của nó đến từ quyết định sản phẩm `D2` (mục 10), **không** từ RQ.md |
| **Không có mitigation từ bất kỳ nguồn nào** — giá trị **hiện hành, sau `GATE-05a`/`GATE-05b`** (2026-08-14) | **9 — `THREAT-004, 005, 006, 007, 009, 011, 013, 018, 019`**. `THREAT-016` rời nhóm: `GATE-05a` cấp giá trị TTL mặc định (30 ngày, **vô điều kiện**) và `GATE-05b` cấp crypto-shred `MUST-V0.1` (**có điều kiện** `U-06d`) — cả hai từ quyết định sản phẩm, **không** từ RQ.md. `THREAT-007` và `THREAT-011` **ở lại**: mitigation duy nhất của chúng là crypto-shred, treo hoàn toàn trên key custody. Đây là **con số dùng cho lập kế hoạch**; xem callout ba con số ở 4.3 |
| Threat có residual risk **không đóng được bằng requirement** | `THREAT-005` (cần quản trị tổ chức), `THREAT-006` đường 2 (cần quyết định capsule format), `THREAT-011` lớp 2 (giới hạn cấu trúc), `THREAT-019` (đánh đổi cố hữu) |
| Threat mà rủi ro **tăng theo mức thành công của sản phẩm** | `TB-4` nói chung, `THREAT-007`, `THREAT-009`, `THREAT-019` |

Hai quan sát xuyên suốt:

1. **11 threat không có mitigation tập trung vào ba asset mà RQ.md không coi là asset**: `A-09` (cấu hình redaction), `A-11` (audit log), `A-12` (máy developer). Đây không phải trùng hợp — không coi là asset thì không nghĩ tới việc bảo vệ. Quyết định `D2` (2026-08-14) **xác nhận quan sát này thay vì phủ nhận nó**: điều phải làm để đóng `THREAT-008` chính là **nâng `A-11` (audit log) từ "một mitigation được nhắc qua ở §20.17" lên "một asset hạng nhất phải tồn tại trong OSS core"**. Hai asset còn lại — `A-09` và `A-12` — vẫn chưa được RQ.md coi là asset, và **9 threat còn lại vẫn nằm ở đó** (con số dẫn xuất hiện hành sau `GATE-05`; xem 4.3). **`GATE-05b` lặp lại đúng khuôn mẫu đó với `A-10`**: điều phải làm để đóng vế *"không xoá được"* của `THREAT-016` là **nâng `A-10` (khoá mã hoá capsule) từ "một dòng *should support encryption at rest* ở §16" lên "một asset hạng nhất phải có key store, vòng đời khoá và chính sách sao lưu khoá"**. `RQ.md` nhắc `A-10` nhưng **không nói gì về key custody** `[GAP]` — và đó chính là lý do `U-06d` nay là blocker (`GATE-05b-r2`), không phải một chi tiết hiện thực.
2. **Ba threat nghiêm trọng nhất đều nằm ở chiều mà RQ.md không nhìn**: `THREAT-009` (dữ liệu chảy **vào** replay runtime), `THREAT-005` (kênh dữ liệu mới nhìn từ phía **insider**), `THREAT-019` (code chảy **vào** production). RQ.md nhìn dữ liệu chảy ra, và mọi mitigation của nó phục vụ chiều đó.

---

## 5. Default redaction list

### 5.1 Trả lời §38 Q10 — *What production data can safely be captured?*

> **Đáp án: shape + metadata + internal id. KHÔNG phải nội dung.**

Diễn giải:

| Được capture an toàn | Ví dụ | Vì sao |
|---|---|---|
| **Shape** — cấu trúc, kiểu, độ dài, tính hiện diện | `{ user: { email: <string,17>, couponId: <number> } }`, `rows: 0` | Phần lớn bug là bug về **hình dạng dữ liệu**, không về giá trị. Ví dụ trung tâm của chính RQ.md chứng minh điều này: bug xảy ra vì `coupon` là `null` `[stated §7]` — cái gây lỗi là *sự vắng mặt*, không phải nội dung của coupon. |
| **Metadata thực thi** | status code, số row trả về, thời điểm, git commit, schema version, dependency version | Không phải dữ liệu chủ thể, và là thứ §15 vốn đã yêu cầu `[stated §15]` |
| **Internal id** | `userId = 18392`, `couponId = 9182` `[stated §7]` | Bắt buộc phải giữ nguyên: chúng là **khoá tra cứu** để replay khớp được recorded result với lời gọi. Đổi chúng là làm hỏng replay. |
| **Giá trị tham gia trực tiếp vào logic phân nhánh** | `tax = 0` `[stated §7, §12]`, `flag = true`, `amount` | Đây là giá trị *gây ra* bug. Bỏ chúng là bỏ luôn lý do tồn tại của sản phẩm. Giữ + `MARK`. |

**Không an toàn để capture**: nội dung do người dùng nhập (free-text), thông tin định danh trực tiếp, và mọi thứ dùng để xác thực.

Hai cảnh báo phải đi kèm đáp án này:

- **Internal id là an toàn "trong capsule", không an toàn "ngoài capsule".** `userId = 18392` không tự nó tiết lộ gì, nhưng nó **join được với DB production thật**. Ai có capsule và có quyền đọc DB thì có đủ dữ liệu để tái định danh. Xem mục 7 nhóm 9.
- **"Shape" không miễn nhiễm.** Độ dài chuỗi, số row, tổ hợp các trường hiện diện — ghép lại vẫn có thể thu hẹp danh tính. Xem mục 7 nhóm 8.

### 5.2 Trả lời §38 Q11 — *What should be redacted by default?*

Toàn bộ mục 5 này là đáp án, với **hai đảo chiều bắt buộc so với §16**:

| # | Đảo chiều | §16 hiện tại | Đề xuất |
|---|---|---|---|
| **1** | **Environment variable dùng allowlist** | §16 chỉ liệt kê `headers` và `fields` `[stated §16]`; §6 nói capsule chứa *"relevant environment metadata"* `[stated §6]` mà không nói lọc thế nào | **Deny-by-default**: chỉ capture các biến nằm trong allowlist tường minh (nhóm 4). Lý do: tên biến môi trường là **không giới hạn và không đoán trước được** — mỗi tổ chức đặt tên khác nhau, mỗi vendor thêm tiền tố riêng. Một denylist ở đây chắc chắn thiếu; một allowlist thì thiếu về phía an toàn. Thêm nữa: **chính tên biến đã tiết lộ thông tin** (tiền tố của nhà cung cấp cho biết tổ chức dùng dịch vụ gì). |
| **2** | **Free-text mặc định drop** | §16 không nhắc free-text `[stated §16]` — mặc định của một danh sách theo tên là **giữ lại** những gì không khớp | **Mặc định drop nội dung, giữ metadata** `{type, length, sha256_prefix}`. Lý do: free-text về nguyên tắc không redact được bằng rule theo tên (mục 7 nhóm 1) và là nơi người dùng dán vào những thứ không ai lường trước. |

### 5.3 Sáu chiến lược

| Chiến lược | Hành vi | Giữ hình dạng? | Đảo ngược được? | Dùng khi |
|---|---|---|---|---|
| `NEVER-STORE` | Giá trị **không bao giờ** đi vào buffer persist. Capsule ghi sự tồn tại của field, không ghi giá trị. | Không (chỉ giữ key + type) | Không | Nghĩa vụ pháp lý hoặc thiệt hại vượt xa giá trị replay: credential, PAN, dữ liệu xác thực |
| `DROP` | Xoá hẳn key khỏi payload. | **Không — làm đổi cấu trúc** | Không | **Chỉ khi** chắc chắn field không tham gia logic. Xem mục 6 để hiểu vì sao đây là chiến lược nguy hiểm nhất về tính đúng. |
| `REPLACE-FIXED` | Thay bằng hằng số **format-preserving** (đúng type, đúng độ dài, đúng hình dạng). | **Có** | Không | Mặc định cho dữ liệu định danh có format cố định: `ssn`, `national_id`, `dob` |
| `HMAC-HASH` | HMAC với key riêng từng capsule. | Có (nếu mã hoá lại về format gốc) | Không | Khi cần **giữ quan hệ bằng nhau** trong phạm vi capsule (cùng một IP, cùng một user xuất hiện nhiều chỗ) mà không giữ giá trị |
| `PSEUDONYMIZE` | Thay bằng giá trị giả **hợp lệ về format**. `john@example.com → user-<hmac>@example.test` — chính là ý §16 `[stated §16]`. | **Có** | Không | Mặc định cho PII tham gia vào logic: `email`, `phone`, `name`, `address` |
| `MARK` | **Giữ nguyên giá trị**, gắn nhãn nhạy cảm vào manifest ⇒ kích hoạt control phía sau: ACL chặt hơn, TTL ngắn hơn, cảnh báo khi `pull`, chặn commit | Có (nguyên bản) | — | Khi giá trị **bắt buộc phải đúng** để replay đúng, và rủi ro được chuyển sang tầng containment thay vì tầng redaction |

**Nguyên tắc chọn chiến lược** (chi tiết ở mục 6): mặc định là `PSEUDONYMIZE` hoặc `REPLACE-FIXED` (giữ hình dạng) → `DROP` chỉ khi chắc chắn không tham gia logic → `NEVER-STORE` khi nghĩa vụ pháp lý thắng tính đúng của replay → `MARK` khi tính đúng thắng và rủi ro được đẩy sang containment.

### 5.4 Nhóm 1 — HTTP header

| Header | Chiến lược | Ghi chú |
|---|---|---|
| `authorization`, `proxy-authorization` | `NEVER-STORE` | Credential. Không có ngoại lệ. §16 đã liệt kê `authorization` `[stated §16]` |
| `cookie`, `set-cookie` | `NEVER-STORE` | Session token. §16 đã liệt kê `cookie` `[stated §16]`; `set-cookie` là chiều ngược và **§16 thiếu** `[GAP]` |
| `x-api-key`, `x-auth-token`, `x-access-token`, `x-csrf-token`, `x-amz-security-token`, `x-goog-*-token` | `NEVER-STORE` | Biến thể phổ biến; danh sách này về nguyên tắc không đầy đủ (mục 7 nhóm 2) |
| `referer` | `PSEUDONYMIZE` | URL trong `referer` thường mang PII ở query string (mục 7 nhóm 5). Giữ origin, thay path+query |
| `x-forwarded-for`, `true-client-ip`, `cf-connecting-ip` | `HMAC-HASH` | Giữ khả năng phân biệt "cùng một client" mà không giữ địa chỉ. IP là personal data theo GDPR |
| `user-agent` | `MARK` | Giữ nguyên: có thể là nguyên nhân phân nhánh của bug. Là quasi-identifier ⇒ đánh nhãn |
| `host`, `content-type`, `content-length`, `accept`, `accept-encoding`, `traceparent`, `x-request-id` | Giữ nguyên | Nêu tường minh để tránh over-redact — over-redact làm hỏng replay và đẩy người dùng tới chỗ tắt redaction (mục 6.4) |
| **Bất kỳ header nào không có trong bảng** | `MARK` + đưa qua content scrubber (`SEC-007`) | Deny-by-default không áp được cho header vì nhiều header là cần thiết; thay vào đó mọi header lạ đều bị quét nội dung |

### 5.5 Nhóm 2 — HTTP body field (theo tên)

| Nhóm field | Chiến lược | Ghi chú |
|---|---|---|
| `password`, `passwd`, `pwd`, `secret`, `token`, `access_token`, `refresh_token`, `id_token`, `api_key`, `client_secret`, `private_key`, `otp`, `pin`, `mfa_code`, `session` | `NEVER-STORE` | §16 đã liệt kê `password`, `access_token` `[stated §16]` |
| `credit_card`, `card_number`, `pan`, `cvv`, `cvc`, `cvv2`, `expiry`, `exp_month`, `exp_year`, `track_data` | `NEVER-STORE` | Bắt buộc tuyệt đối theo PCI DSS (mục 8.3). §16 đã liệt kê `credit_card` `[stated §16]` |
| `ssn`, `tax_id`, `national_id`, `cmnd`, `cccd`, `passport_no`, `driver_license` | `REPLACE-FIXED` format-preserving | Giữ độ dài và ký tự hợp lệ để validation phía ứng dụng không đổi nhánh |
| `email`, `*_email`, `mail` | `PSEUDONYMIZE` | `user-<hmac>@example.test` — đúng như §16 đề xuất `[stated §16]`. Format-preserving là bắt buộc: `if (user.email)` và regex validation phải cho cùng kết quả |
| `phone`, `sdt`, `so_dien_thoai`, `mobile`, `tel` | `PSEUDONYMIZE` format-preserving | Giữ độ dài và mã vùng giả, vì logic thường phân nhánh theo mã vùng |
| `name`, `first_name`, `last_name`, `full_name`, `ho_ten`, `ten` | `PSEUDONYMIZE` | |
| `address`, `dia_chi`, `street`, `city`, `postal_code`, `zip` | `PSEUDONYMIZE` **format-preserving, giữ ngữ nghĩa vùng** | Đây là trường hợp cần cẩn trọng nhất: chính ví dụ của RQ.md gọi `taxAPI.calculate(user.address)` `[stated §7]` — địa chỉ **tham gia trực tiếp vào logic tính thuế**. Pseudonymize sai vùng địa lý ⇒ thuế khác ⇒ replay đi đường khác |
| `dob`, `date_of_birth`, `ngay_sinh` | `REPLACE-FIXED` | Giữ kiểu date hợp lệ; nếu logic phân nhánh theo tuổi thì giữ đúng nhóm tuổi |
| `amount`, `balance`, `salary`, `price`, `total`, `discount`, `tax` | `MARK` — **giữ nguyên** | Đây là giá trị gây ra bug (`{tax: 0}` `[stated §7, §12]`). Redact chúng là phá huỷ giá trị sản phẩm. Rủi ro đẩy sang containment |
| **Free-text**: `message`, `comment`, `note`, `description`, `bio`, `review`, `content`, `body`, `feedback`, `reason` | **`DROP` nội dung**, giữ `{type, length, sha256_prefix}` | **Đảo chiều 2.** Xem mục 7 nhóm 1 |
| **Internal id**: `user_id`, `order_id`, `coupon_id`, `tenant_id`, `*_id` | Giữ nguyên + `MARK` | Bắt buộc giữ để replay khớp `[stated §7]`. `MARK` vì chúng join được với DB thật (mục 7 nhóm 9) |
| **Field không khớp rule nào và không phải free-text** | `MARK` + content scrubber (`SEC-005`, `SEC-007`) | |

### 5.6 Nhóm 3 — DB column pattern

Áp lên kết quả truy vấn PostgreSQL `[stated §11, §18]`. Khớp theo pattern tên cột, **cộng thêm** một lớp phân loại theo kiểu cột — vì tên cột trong DB nội bộ còn khó đoán hơn tên field trong API (mục 7 nhóm 2).

| Pattern / kiểu cột | Chiến lược | Ghi chú |
|---|---|---|
| `*password*`, `*_hash`, `*secret*`, `*token*`, `*api_key*`, `*private_key*`, `*salt*` | `NEVER-STORE` | Bao gồm cả cột hash — hash mật khẩu là mục tiêu bẻ khoá offline |
| `*card*`, `*cvv*`, `*pan*`, `*iban*`, `*account_number*`, `*routing*` | `NEVER-STORE` | PCI DSS |
| `email`, `*_email` | `PSEUDONYMIZE` | |
| `phone`, `sdt`, `*_phone`, `*_mobile` | `PSEUDONYMIZE` format-preserving | |
| `*ssn*`, `*national_id*`, `cmnd`, `cccd`, `*passport*` | `REPLACE-FIXED` | |
| `name`, `*_name`, `ho_ten`, `address`, `dia_chi` | `PSEUDONYMIZE` | |
| `id`, `*_id`, khoá ngoại | Giữ nguyên + `MARK` | Bắt buộc cho replay |
| `created_at`, `updated_at`, `*_at`, cột timestamp | Giữ nguyên | Cần cho clock replay `[stated §18]` |
| Cột kiểu `text` / `varchar` dài / `json` / `jsonb` **không khớp rule nào** | **`DROP` nội dung**, giữ `{type, length}` | Đảo chiều 2 áp cho DB: cột text tự do là nơi chứa free-text |
| Cột kiểu `bytea` / blob / binary | `NEVER-STORE` | Không inspect được, có thể là tài liệu, ảnh có EXIF, file đính kèm (mục 7 nhóm 6) |
| Cột `enum`, `boolean`, `integer` không khớp rule | Giữ nguyên | Miền giá trị hẹp, thường là cờ phân nhánh |
| **Mọi result set** | Áp `SEC-008` row cap + byte cap | Ngưỡng `TBD` — mục 11.b |

### 5.7 Nhóm 4 — Environment variable (ALLOWLIST — đảo chiều 1)

**Deny-by-default.** Chỉ những key dưới đây được capture. Mọi key khác: `NEVER-STORE`, **kể cả tên key**.

| Key được phép | Chiến lược | Vì sao cần |
|---|---|---|
| `NODE_ENV` | Giữ nguyên | Phân nhánh logic phổ biến nhất |
| `APP_VERSION`, `GIT_COMMIT`, `BUILD_ID` | Giữ nguyên | §15 yêu cầu `[stated §15]` |
| `SERVICE_NAME` | Giữ nguyên | Định tuyến capsule về đúng scope (`SEC-019`) |
| `REGION`, `AZ`, `DEPLOYMENT_ENV` | Giữ nguyên | Logic theo vùng; cần cho data residency (mục 8) |
| `TZ`, `LANG`, `LC_ALL` | Giữ nguyên | Ảnh hưởng trực tiếp tới format ngày/số ⇒ ảnh hưởng execution path |
| `SCHEMA_VERSION`, `MIGRATION_VERSION` | Giữ nguyên | §20.9 yêu cầu `[stated §20.9]` |
| `FEATURE_FLAG_SET_VERSION` | Giữ nguyên | §6 yêu cầu feature flag state `[stated §6]` |
| `LOG_LEVEL` | Giữ nguyên | Có thể đổi code path |
| **Mọi key khác** | **`NEVER-STORE`, không ghi cả tên key** | Tên key tự nó tiết lộ topology và nhà cung cấp đang dùng |

Nếu một biến ngoài allowlist thực sự cần cho replay: phải thêm **tường minh** vào config, và việc thêm đó phải đi qua `SEC-013` (approval) + được ghi vào audit (`SEC-020`) + xuất hiện trong fingerprint config của manifest (`SEC-010`).

### 5.8 Nhóm 5 — External API response field

Response từ bên thứ ba `[stated §12, §14]`. Đây là nhóm khó nhất vì **schema thuộc về bên khác** và có thể đổi bất cứ lúc nào mà không báo.

| Nhóm | Chiến lược | Ghi chú |
|---|---|---|
| Toàn bộ body của endpoint xác thực (`/oauth/token`, `/login`, `/session`, `/token`) | `NEVER-STORE` body — chỉ giữ status code + shape | Nhận diện theo endpoint, không theo tên field: một endpoint token thì **mọi** field trong nó đều đáng ngờ |
| `access_token`, `refresh_token`, `id_token`, `client_secret`, `signature`, `webhook_secret` | `NEVER-STORE` | |
| PAN từ payment provider | `NEVER-STORE` | |
| `last4`, `brand`, `exp_month` | `MARK` — giữ nguyên | Thường tham gia logic hiển thị và phân nhánh; không phải PAN đầy đủ |
| `customer_email`, `billing_address`, `shipping_address`, `customer_name` | `PSEUDONYMIZE` format-preserving | Địa chỉ giữ ngữ nghĩa vùng (xem 5.5) |
| Giá trị số tham gia logic: `tax`, `amount`, `rate`, `discount`, `total`, `currency` | `MARK` — **giữ nguyên** | Chính là dữ liệu gây bug trong ví dụ của RQ.md `[stated §7, §12]` |
| `error.message`, `error.detail`, `error.description`, `debug` | Content scrubber (`SEC-007`) rồi mới giữ | Thông điệp lỗi của bên thứ ba thường nhúng giá trị đã gửi lên — mục 7 nhóm 7 |
| Field free-text trong response | **`DROP`** nội dung, giữ `{type, length}` | Đảo chiều 2 |
| **Field không nhận diện được** | `MARK` + content scrubber | Vì schema thuộc bên khác, đây là trường hợp **thường gặp**, không phải ngoại lệ |

### 5.9 Điều mà default list này KHÔNG làm được

Danh sách trên là **điểm khởi đầu tốt nhất có thể xây bằng danh sách**. Nó vẫn nằm trong giới hạn nêu ở mục 7. Nó **không** biến capsule thành artifact sạch, và không được trình bày như vậy trong bất kỳ tài liệu hạ nguồn nào.

---

## 6. Căng thẳng privacy ↔ replay fidelity

### 6.1 Vấn đề: `DROP` làm đổi execution path

Đây là điểm mà một threat model thông thường sẽ bỏ qua, vì nó không phải lỗ hổng bảo mật — nó là **tác dụng phụ của biện pháp bảo mật lên tính đúng của sản phẩm**.

Xoá một key khỏi payload không phải là thao tác trung tính. Nó thay đổi hành vi của code đọc payload đó theo ít nhất ba cách:

| Cơ chế | Điều xảy ra |
|---|---|
| **Kiểm tra tính hiện diện** | `if (user.email)` — trước redaction đi nhánh true, sau redaction đi nhánh false. Execution path đổi ngay tại đó. |
| **Schema validation** | Nếu ứng dụng validate payload đầu vào và `email` là bắt buộc, việc xoá key làm validation **fail** — replay dừng ở một chỗ mà production không hề dừng. |
| **Destructuring / truy cập thuộc tính** | `const { email } = user` cho `undefined`; thao tác tiếp theo trên `undefined` sinh ra lỗi hoàn toàn khác lỗi cần điều tra. |

Hai hậu quả, cả hai đều tệ:

- **Bug giả**: replay báo lỗi ở một chỗ mà production không lỗi. Developer đuổi theo một lỗi do redaction tạo ra.
- **Che bug thật**: replay đi sang nhánh khác và **không** chạm tới đoạn code có bug. Repro báo "không tái hiện được", developer kết luận sai rằng bug không tồn tại hoặc dữ liệu không đủ.

### 6.2 Vì sao điều này nghiêm trọng riêng với Repro

Với hầu hết sản phẩm, redaction làm mất một phần thông tin và người dùng chấp nhận. Với Repro thì khác: **toàn bộ giá trị của sản phẩm nằm ở chỗ execution local đi đúng cùng một đường với execution production**.

§10 đặt Execution Verification làm tính năng lõi và phân biệt "Replay completed" với "Execution matched" `[stated §10]`; §20.3 xếp "Replay Without True Equivalence" là Critical `[stated §20.3]`. Nghĩa là "cùng một execution path" **là định nghĩa của thành công**.

> **`DROP` là kẻ thù trực tiếp của tiêu chí thành công của chính sản phẩm.**

### 6.3 Nguyên tắc: giữ hình dạng làm mặc định

Thứ tự ưu tiên khi chọn chiến lược:

1. **Mặc định — giữ hình dạng.** `REPLACE-FIXED` hoặc `PSEUDONYMIZE` **format-preserving**: đúng type, đúng độ dài, đúng hình dạng, đúng miền giá trị nếu miền đó tham gia logic. Với chiến lược này, `if (user.email)` vẫn đi đúng nhánh, validation vẫn pass, destructuring vẫn ra chuỗi.
2. **`DROP` chỉ khi chắc chắn field không tham gia logic.** Free-text là trường hợp điển hình được phép drop — nội dung một comment hiếm khi quyết định phân nhánh. Nhưng ngay cả ở đây phải giữ `{type, length}`, vì `body.length > 5000` là một điều kiện hoàn toàn có thật.
3. **`NEVER-STORE` khi nghĩa vụ pháp lý thắng tính đúng của replay.** Credential, PAN, dữ liệu xác thực: chấp nhận replay sai còn hơn lưu chúng. Đây là đánh đổi **có ý thức**, không phải sơ suất — và phải được ghi vào capsule để `SEC-048` giải thích được divergence.
4. **`MARK` khi tính đúng thắng.** Giá trị bắt buộc phải đúng thì giữ nguyên, và chuyển rủi ro sang tầng containment (ACL chặt hơn, TTL ngắn hơn, cảnh báo khi pull).

### 6.4 Hệ quả phải nói thật: replay của capsule đã redact KHÔNG bảo đảm bit-perfect

Đây là điều tài liệu này từ chối làm mềm.

Bất kể chiến lược nào được chọn, một capsule đã qua redaction **có thể** cho execution path khác với production. Format-preserving giảm mạnh xác suất đó nhưng không đưa về không: một `email` được pseudonymize vẫn có thể rơi vào nhánh khác nếu code phân nhánh theo domain; một `address` giả vẫn có thể ra mức thuế khác.

Vì vậy:

> **`SEC-048` — Execution Diff phải phân biệt "diverged vì code" với "diverged vì redaction".**

Không có `SEC-048`, sản phẩm tạo ra một dạng nhiễu mà người dùng không thể tự phân giải: mỗi lần diff báo lệch, developer phải tự đoán xem đó là bug của mình hay là dấu vết của redaction. Đoán sai theo một chiều thì mất thời gian; đoán sai theo chiều kia thì bỏ sót bug thật. Cơ chế: capsule mang bản kê `redaction_applied[]` (`SEC-047`), và diff đối chiếu vị trí phân kỳ với bản kê đó để quy trách nhiệm.

**Xác nhận chéo**: lens kiến trúc độc lập đi tới cùng kết luận và cùng giải pháp — capsule phải ghi lại **đã redact field nào** để diff quy trách nhiệm đúng (`U-15`). Hai đường tiếp cận khác nhau, một kết luận.

### 6.5 Cách redaction thực sự thất bại trong đời thực

Điều quan trọng nhất của mục này:

> **Redaction không thất bại vì bị bypass kỹ thuật. Nó thất bại vì bị người dùng vô hiệu hoá.**

Chuỗi nhân quả có thể đoán trước được, và nó bắt đầu từ mục 6.1:

1. Redaction quá mạnh hoặc chọn sai chiến lược ⇒ replay không tái hiện được bug.
2. Developer thấy sản phẩm "không hoạt động" — đúng theo trải nghiệm của họ.
3. Ai đó phát hiện tắt bớt rule thì replay chạy đúng.
4. Rule bị nới, rồi bị nới tiếp, rồi bị tắt.
5. Từ đó về sau, mọi capsule là full capture — và **không ai nhận ra**, vì hệ thống không phát tín hiệu nào (`THREAT-004`).

Điều này nối thẳng vào `THREAT-005`: bước 3 và 4 ở trên **trông giống hệt** bước đầu của chuỗi lạm dụng nội bộ. Một tổ chức không thể phân biệt hai thứ đó nếu không có `SEC-010` (fingerprint config) + `SEC-013` (approval) + `SEC-020` (audit).

Hệ quả cho thiết kế, và đây là điểm chuyển từ nhận định sang yêu cầu:

- **Chất lượng của redaction được đo bằng mức độ nó KHÔNG làm hỏng replay**, không phải bằng số lượng field nó che. Một danh sách che nhiều hơn nhưng làm replay vô dụng là một danh sách **kém an toàn hơn**, vì nó sẽ bị tắt.
- Vì vậy `MARK` và format-preserving không phải là "redaction yếu" — chúng là **redaction bền**, loại còn sống sót sau sáu tháng vận hành.
- Và vì vậy việc tắt redaction phải **đắt và ồn ào**: `SEC-012` yêu cầu cờ tường minh + audit + cảnh báo hiện trên mọi capsule sinh ra trong trạng thái đó. Nếu tắt redaction là một dòng YAML im lặng, nó sẽ được tắt.

---

## 7. Giới hạn của redaction dựa-trên-danh-sách

Mục này liệt kê những gì cách tiếp cận của §16 — danh sách tên header và tên field `[stated §16]` — **về nguyên tắc không thể** bắt được. "Về nguyên tắc" nghĩa là: không phải do danh sách chưa đủ dài, mà do **cơ chế khớp theo tên không có thông tin để ra quyết định**.

| # | Nhóm | Vì sao rule theo tên mù |
|---|---|---|
| **1** | **Free-text** | Nội dung nằm trong một field có tên hoàn toàn vô hại (`message`, `note`, `description`). Người dùng dán vào đó số thẻ, mật khẩu, số căn cước, tiền sử bệnh. Tên field **không mang thông tin nào** về việc bên trong có gì. Đây là lý do đảo chiều 2 (mặc định drop) tồn tại. |
| **2** | **Tên field không đoán được** | Rule theo tên chỉ khớp được tên mà người viết rule **nghĩ ra trước**. Thực tế: tên tiếng Việt (`ho_ten`, `dia_chi`, `ngay_sinh`), viết tắt nội bộ (`sdt`, `cmnd`, `cccd`), tên do lịch sử để lại (`f_name_2`, `col_47`, `usr_dat`), tên của hệ thống kế thừa. Không danh sách nào phủ được không gian tên của một tổ chức mà người viết danh sách chưa từng thấy. |
| **3** | **Payload lồng hoặc đã encode** | JSON nằm trong một string, XML trong một field, base64 của một object, và đặc biệt: **payload của JWT**. Một JWT nằm ở field tên `state` hay `data` là một object base64 chứa email, id, role, tenant — nhưng với parser thì nó chỉ là một chuỗi ký tự không khớp rule nào. |
| **4** | **Giá trị không có key** | Array của tuple (`[[18392, "john@example.com", "0912..."], ...]`), CSV nhét trong một string, kết quả truy vấn dạng positional. Không có key thì **không có gì để khớp tên**. Đây là dạng rất phổ biến trong kết quả DB. |
| **5** | **PII trong URL, path và Referer** | `/api/users/john@example.com/orders`, `?email=...&phone=...`. PII nằm trong **cấu trúc đường dẫn**, không nằm trong một field có tên. Header `referer` mang cả URL của trang trước, thường kèm token trong query. |
| **6** | **Binary có metadata nhúng** | Ảnh có EXIF (toạ độ GPS, thời điểm, số serial thiết bị), PDF có thuộc tính tác giả, tài liệu office có lịch sử chỉnh sửa. Nội dung nhị phân với rule theo tên là một khối không đọc được. Đây là lý do nhóm 3 đặt `bytea`/blob vào `NEVER-STORE`. |
| **7** | **Stack trace và SQL error message** | Đây là nhóm nguy hiểm nhất, và RQ.md **bắt buộc capture stack trace** `[stated §18]`. Một stack trace mang giá trị tham số trong frame; một thông điệp lỗi của PostgreSQL mang giá trị vi phạm ràng buộc (`duplicate key value violates unique constraint ... Key (email)=(...) already exists`). Ở đây **không có schema, không có key, không có cấu trúc** — chỉ là một chuỗi ký tự. **Mọi rule theo tên đều mù hoàn toàn.** Chỉ content-based scrubbing (`SEC-007`) mới chạm được, và nó cũng chỉ bắt được thứ nó biết hình dạng. |
| **8** | **Quasi-identifier ghép lại tái định danh được** | Từng trường một đều vô hại: mã bưu chính, ngày sinh, giới tính, user-agent, múi giờ, ngôn ngữ. Ghép lại, chúng thu hẹp danh tính xuống rất hẹp. Redaction làm việc **trên từng field**; tái định danh xảy ra **giữa các field**. Cơ chế không nhìn thấy tổ hợp. |
| **9** | **Internal id giữ nguyên ⇒ join được với DB thật** | Mục 5.1 khẳng định internal id là an toàn để capture, và điều đó đúng — **trong phạm vi capsule**. Nhưng ai có capsule *và* có quyền đọc DB production thì `userId = 18392` là chìa khoá tra ra toàn bộ hồ sơ. Với `AM-3`/`AM-4`, đây là một dạng tái định danh không cần phá vỡ gì cả. Đây cũng là mâu thuẫn thật: giữ id là **bắt buộc** để replay chạy `[stated §7]`. |
| **10** | **Metadata của `repro list`** | Bản thân danh sách capsule đã là thông tin: endpoint nào hay lỗi, service nào không ổn định, thời điểm nào có sự cố, tần suất lỗi theo khách hàng. Redaction áp lên **nội dung** capsule; nó không áp lên **sự tồn tại** của capsule. `repro list` `[stated §18]` phơi bày tầng metadata này mà không có rule nào chạm tới. |
| **11** | **Yếu tố con người** | Đã phân tích ở mục 6.5. Không có rule nào tự bảo vệ mình khỏi việc bị xoá. Đây là nhóm có **xác suất xảy ra cao nhất** trong cả 11 nhóm, và là nhóm duy nhất mà biện pháp kỹ thuật hoàn toàn không chạm tới. |

### 7.1 Kết luận bắt buộc

> ## **Redaction là hygiene control, KHÔNG phải containment boundary.**

Nói cho rõ nghĩa từng vế:

- **Hygiene control**: nó giảm lượng dữ liệu nhạy cảm đi vào hệ thống. Nó có giá trị thật, đáng đầu tư, và mục 5 tồn tại vì lý do đó.
- **KHÔNG phải containment boundary**: nó **không** cho phép bất kỳ ai kết luận rằng "capsule đã được redact nên capsule sạch". Không có ngưỡng cấu hình nào, không có danh sách đủ dài nào, không có phiên bản nào của mục 5 biến phát biểu đó thành đúng.

Câu này được viết ra để chặn một hệ quả cụ thể: mọi tài liệu hạ nguồn (PRD, SDD, tài liệu bán hàng, câu trả lời cho khách hàng về compliance) đều có xu hướng tự nhiên rút gọn "có redaction" thành "an toàn". Đó là **false assurance**, và nó nguy hiểm hơn việc không có redaction, vì nó khiến người ta bỏ qua các control thật.

### 7.2 Containment thật đến từ đâu

| Control | Vai trò | Requirement |
|---|---|---|
| **Access control** | Giới hạn *ai* chạm được vào capsule — là thứ duy nhất hoạt động bất kể capsule chứa gì | `SEC-018`, `SEC-019` |
| **Encryption + crypto-shred** | Làm cho việc chiếm được bản copy trở nên vô nghĩa, và **biến `TB-4` từ bất khả hồi thành khả hồi** (mục 8.1) — `✅ CHỐT GATE-05b — 2026-08-14`, **có điều kiện key custody** `U-06d` | `SEC-015`, `SEC-016` **`MUST-V0.1`**, `SEC-021` |
| **Retention TTL** | Giới hạn *bao lâu* — cửa sổ phơi nhiễm hữu hạn thay vì vô hạn; **mặc định 30 ngày**, `✅ CHỐT GATE-05a — 2026-08-14` | `SEC-022`, `SEC-023`, `SEC-044` |
| **Audit** | Làm cho việc truy cập **để lại dấu vết** — điều kiện cần để trả lời được câu hỏi sau sự cố | `SEC-020` |
| **Locality (self-host)** | Giữ dữ liệu trong ranh giới pháp lý và hợp đồng của tổ chức | mục 8.5 |
| **Hạn chế bản copy ở Zone 3** | Tấn công trực diện vào lý do 5 của `TB-4` (nhân bản asset) | `SEC-042`, `SEC-043`, `SEC-044`, `SEC-045` |

Sáu control này khác redaction ở một điểm quyết định: **hiệu lực của chúng không phụ thuộc vào việc có đoán đúng tên field hay không.**

---

## 8. Ràng buộc tuân thủ

**Nhắc lại mục 1.2**: mục này **không cấp trạng thái tuân thủ cho tổ chức nào** và **không phải kết luận pháp lý**. Nó nêu *ràng buộc mà bốn khung đặt lên capsule và lifecycle của nó*, để thiết kế không tự khoá mình vào một chỗ không thể tuân thủ về sau. Mọi diễn giải ở đây **cần pháp chế xác nhận**; riêng phạm vi PCI DSS cần QSA xác định.

RQ.md nhận diện đúng bốn khung này `[stated §20.17]` và liệt kê mitigation ở mức danh mục: data retention policies, deletion, encryption, audit logs, redaction, self-hosting, data residency `[stated §20.17]`. Mục này chuyển danh mục đó thành ràng buộc cụ thể.

### 8.1 GDPR

| Ràng buộc lên capsule / lifecycle | Hệ quả thiết kế |
|---|---|
| **Capsule là hoạt động xử lý dữ liệu cá nhân.** Không phải log kỹ thuật — nó chứa nội dung request và row dữ liệu thật `[stated §6, §11]`. | Phải có cơ sở pháp lý và **mục đích giới hạn**. Mục đích của capsule là *debug một lỗi cụ thể*, không phải phân tích chung. |
| **Storage limitation** — dữ liệu không được giữ lâu hơn mục đích | Mục đích chấm dứt khi lỗi được sửa ⇒ TTL **bắt buộc hữu hạn** (`SEC-022`). TTL vô hạn là mặc định không thể biện hộ. **`✅ CHỐT GATE-05a — 2026-08-14`: mặc định = 30 ngày**, cấu hình được (`FR-024`) — mục 11.a. ⚠ **30 ngày là quyết định sản phẩm, KHÔNG phải kết luận tuân thủ**: nó được `@TrisJr` quyết **không qua pháp chế**, nên việc nó có thoả nghĩa vụ lưu trữ của một khu vực pháp lý cụ thể **vẫn chưa được ai kiểm**. Mục 1.2 vẫn áp: tài liệu này không cấp trạng thái tuân thủ. |
| **Data minimisation** — chỉ xử lý dữ liệu cần thiết | Đây chính là đáp án §38 Q10 ở mục 5.1: **shape + metadata + internal id**, không phải nội dung. Bất kỳ trường nào không cần cho replay mà vẫn nằm trong capsule đều khó biện hộ. |
| **Security of processing** | `SEC-015` (mã hoá), `SEC-017` (transport), `SEC-018`/`SEC-019` (access control), `SEC-020` (audit) |
| **Records of processing** — phải mô tả được đang xử lý loại dữ liệu nào | `SEC-024` (`data_classification` trên capsule) + `SEC-047` (bản kê redaction). Không có hai thứ này, tổ chức không mô tả được chính hoạt động của mình. |
| **Nghĩa vụ thông báo vi phạm trong thời hạn ngắn** | Để thông báo được, phải biết **capsule bị lộ chứa gì** và **nó đã đi tới đâu**. Điều thứ nhất cần `SEC-024`/`SEC-047`; điều thứ hai là `THREAT-011` lớp 2 — **không giải được sau `TB-4`**. Đây là rủi ro tuân thủ có thật, không phải rủi ro giả định. |
| **Vai trò processor** | Dùng bản hosted ⇒ nhà cung cấp trở thành processor, cần hợp đồng xử lý dữ liệu. Self-host tránh được — xem 8.5. |
| **Chuyển dữ liệu xuyên biên giới** | Bản hosted đặt ở khu vực pháp lý khác làm phát sinh nghĩa vụ chuyển dữ liệu. Self-host tránh được — xem 8.5. |

#### 8.1.1 Right to erasure — mâu thuẫn thiết kế THẬT

Đây không phải hạng mục "chưa làm". Đây là **mâu thuẫn giữa yêu cầu pháp lý và bản chất của artifact**, và nó phải được nhận diện đúng như vậy.

Thực thi được quyền xoá đòi hỏi **hai điều kiện**, và thiết kế hiện tại **không đáp ứng điều kiện nào**:

| Điều kiện | Trạng thái trong thiết kế hiện tại |
|---|---|
| **(a) Biết capsule nào chứa dữ liệu của chủ thể nào** | Không có cơ chế. Capsule được đánh chỉ mục theo bug id `[stated §8]`, không theo chủ thể dữ liệu. Sau khi pseudonymize, việc tra ngược thậm chí còn khó hơn. `SEC-025` đề xuất cơ chế nhưng được xếp `[DEFER]` vì thiết kế của nó chưa tồn tại. |
| **(b) Xoá được MỌI bản copy** | **Không thể.** Capsule là artifact **bất biến, đã được copy xuống N laptop** qua `TB-4`, và có thể đã vào git (`THREAT-006`), vào Slack, vào cloud sync (`THREAT-007`). Xoá object trong Zone 2 không chạm tới bản nào trong số đó. |

Điều kiện (b) là điều kiện không thể đáp ứng bằng cách xoá — vì **không tồn tại danh sách các bản copy**.

> **`✅ CHỐT GATE-05b — 2026-08-14`.** Câu trên **vẫn đúng nguyên vẹn** — và đó chính là lý do quyết định này được đưa ra: điều kiện (b) không giải được **bằng cách xoá**, nên nó được giải **bằng cách khác** — phá khoá thay vì phá file (mục 8.1.2). `SEC-016` nay là `MUST-V0.1`. Hai điều kiện (a) và (b) sau quyết định:
> - **(b)** có cơ chế đáp ứng, **với điều kiện key custody** (`U-06d`, `GATE-05b-r2`). Chưa có key store thì (b) vẫn là *"không thể"*.
> - **(a)** vẫn **không có cơ chế** — `SEC-025` giữ `DEFER` vì thiết kế của nó chưa tồn tại. Nhưng sức nặng của (a) **giảm**: khi phá khoá có hiệu lực trên mọi bản copy, việc xoá không còn đòi hỏi phải tra ra *capsule nào chứa dữ liệu của chủ thể nào* trước đã. Đây là lý do `SEC-025` vẫn `DEFER` mà không phải nâng lên `MUST-V0.1`.

#### 8.1.2 Crypto-shredding là cơ chế duy nhất

Cách duy nhất được biết để biến `TB-4` từ **bất khả hồi** thành **khả hồi**:

```text
Capture  ──► capsule được mã hoá bằng KEY RIÊNG CHO TỪNG CAPSULE
                        │
                        │  key nằm ở Zone 2, KHÔNG đi kèm capsule
                        ▼
`repro pull`  ──► developer nhận CIPHERTEXT (không đọc được)
                        │
`repro replay` ──► lấy key just-in-time từ Zone 2, giải mã trong bộ nhớ
                        │
                        ▼
        Yêu cầu xoá  ──► PHÁ KEY
                        │
                        ▼
  MỌI bản copy — trên N laptop, trong git, trong Slack, trong backup —
  lập tức trở thành ciphertext vô nghĩa, KHÔNG cần biết chúng ở đâu
```

Điều làm cơ chế này khác về chất so với mọi control khác: **nó không cần biết bản copy nằm ở đâu.** Nó tấn công đúng vào điều kiện (b) — thứ không giải được bằng bất kỳ cách nào khác. Nó cũng đồng thời làm nhẹ `THREAT-007` (bản copy ở Zone 3 mất giá trị), `THREAT-006` (bản trong git mất giá trị), và `THREAT-016` (xoá trở nên có hiệu lực thật).

**Đánh đổi — nêu thẳng, không giấu:**

| Đánh đổi | Nội dung |
|---|---|
| **Mất replay offline** | Đây là cái giá lớn nhất. `repro replay` phải gọi về Zone 2 để lấy key ⇒ không replay được khi không có mạng, không replay được khi hệ thống Repro đang có sự cố, và **Zone 2 trở thành điểm phụ thuộc cứng cho một thao tác cục bộ**. Với một dev tool đề cao trải nghiệm tối giản `[stated §20.14, §33]`, đây là ma sát đáng kể. |
| **Tăng độ phức tạp self-host** | Bản self-host phải vận hành thêm một key store, với vòng đời key, sao lưu key, và khôi phục key. Mất key store = mất **toàn bộ** capsule, kể cả bản trong Zone 2. Điều này va thẳng vào mô tả `Basic Self-hosting` của §28 `[stated §28]`. |
| **Nghịch lý sao lưu** | Sao lưu key store làm giảm hiệu lực của việc phá key (bản backup vẫn còn key). Chính sách backup của key phải được thiết kế cùng lúc, không phải sau. |

**`✅ CHỐT GATE-05b — 2026-08-14`** — Đề xuất này **đã được cân và đã được chốt**. Nhãn `[cần validate]` được gỡ; `SEC-016` = **`MUST-V0.1`**.

| | |
|---|---|
| **Đã quyết** | **Áp dụng crypto-shredding.** Khoá giữ phía server (Zone 2), không đi kèm capsule; xoá khoá ⇒ capsule không giải được. |
| **Ai quyết** | **`@TrisJr`** (chủ sản phẩm), ngày 2026-08-14. Đóng `U-06c`. `§11.c` từng ghi *"Cần ai = architect"*; trên thực tế `@TrisJr` quyết, và hệ quả kiến trúc được ghi ở `ADR-002`/`ADR-009` (writer khác, cùng run). |
| **Ba đánh đổi ở bảng trên đã được TRẢ, không được xoá** | *Mất replay offline* · *Tăng độ phức tạp self-host* · *Nghịch lý sao lưu*. Cả ba **giữ nguyên nguyên văn** và nay là **hệ quả được chấp nhận có ý thức** (`GATE-05b-r`), không phải rủi ro chưa nhìn thấy. Đặc biệt: *nghịch lý sao lưu* từ một ghi chú trở thành **hạng mục thiết kế bắt buộc** — sao lưu khoá làm giảm hiệu lực của việc phá khoá, nên chính sách backup khoá phải được thiết kế **cùng lúc**, không phải sau. |
| **Điều kiện thực thi — `GATE-05b-r2`** | Cơ chế ở sơ đồ trên **chỉ chạy được khi có key custody**: nơi giữ khoá, vòng đời khoá, quyền phá khoá, audit việc lấy khoá (`SEC-020`). `U-06d` nay là **blocker**. Một khoá bị lấy trước khi phá thì phá khoá không cứu được gì. |
| **Mệnh đề vẫn đúng, giữ nguyên** | **`RQ.md` không nhắc tới crypto-shredding ở bất kỳ đâu** `[GAP]`. Đây là sự thật về `RQ.md`, **không** phải trạng thái quyết định: mitigation này đến từ **quyết định sản phẩm**, không từ tài liệu nguồn — vì vậy nhãn `[GAP]` của `THREAT-016` và con số **11** ở mục 4.3 **không đổi**. Điều **không còn đúng** là *"nó không nằm trong bất kỳ đánh đổi nào đã được cân nhắc"*: đánh đổi đã được nêu, đã được cân, và đã được chọn. |

Xem mục 11.c để có toàn bộ lý do, hai rủi ro kèm theo, và ràng buộc thời điểm (đã chốt **trước khi** capsule format v1 đóng băng).

### 8.2 HIPAA

Áp dụng khi ứng dụng được instrument xử lý dữ liệu sức khoẻ.

| Ràng buộc lên capsule / lifecycle | Hệ quả thiết kế |
|---|---|
| **Capsule chứa dữ liệu sức khoẻ ⇒ hạ tầng Repro trở thành một phần của hệ thống chịu điều chỉnh** | Capsule store, collector, **và mọi laptop đã pull** đều bị kéo vào phạm vi. `TB-4` mở rộng phạm vi này ra N thiết bị cá nhân — điểm mà tổ chức thường không lường trước khi phê duyệt công cụ. |
| **Nhà cung cấp xử lý dữ liệu sức khoẻ ⇒ cần thoả thuận đối tác kinh doanh** | Bản hosted đòi hỏi thoả thuận này; self-host tránh được — xem 8.5. |
| **Audit control là yêu cầu bắt buộc, không phải tuỳ chọn** | `SEC-020` phải tồn tại trong **bản được triển khai**. Nếu audit nằm ở commercial layer `[stated §28]` thì bản self-host **không dùng được** cho dữ liệu sức khoẻ. Đây là hệ quả trực tiếp của `THREAT-008` và là một lý do cụ thể, không trừu tượng, cho mục 10. |
| **Nguyên tắc tối thiểu cần thiết** | Va chạm trực diện với mục tiêu "capture đủ để replay". Chỉ đáp án Q10 ở mục 5.1 (shape + metadata + id) là thoả được; capture nội dung thì không. |
| **Kiểm soát truy cập và mã hoá** | `SEC-015`, `SEC-018`, `SEC-019` |
| **`repro pull` là một hành vi tiết lộ dữ liệu ra workstation** | Không có control kỹ thuật nào của sản phẩm ở boundary này (mục 3.3). Tổ chức phải phủ bằng chính sách thiết bị — và tài liệu phải **nói rõ** rằng sản phẩm không phủ, để tổ chức không giả định ngược lại. |

### 8.3 PCI DSS

| Ràng buộc lên capsule / lifecycle | Hệ quả thiết kế |
|---|---|
| **Dữ liệu xác thực nhạy cảm (CVV/CVC, dữ liệu track, PIN) không được lưu sau khi giao dịch được cấp phép — đây là cấm tuyệt đối, không có ngoại lệ vận hành** | `NEVER-STORE` ở nhóm 2 và nhóm 5 của mục 5. Không có chiến lược nào khác được phép áp cho các trường này. |
| **PAN không được lưu trừ khi có nhu cầu nghiệp vụ được biện hộ, và phải được làm cho không đọc được ở nơi lưu trữ** | Repro **không có** nhu cầu nghiệp vụ nào để lưu PAN. Do đó: `NEVER-STORE`, cộng `SEC-015` cho phần còn lại. |
| **Đây là ràng buộc quyết định: lưu PAN sẽ kéo phạm vi đánh giá lên toàn bộ hạ tầng Repro VÀ mọi laptop đã pull** | Đây là lập luận mạnh nhất trong toàn mục 8, vì nó không phải rủi ro mà là **chi phí trực tiếp**: `repro pull` biến mỗi laptop developer thành một phần của môi trường dữ liệu thẻ. Không tổ chức nào chấp nhận đánh đổi này để đổi lấy tiện lợi debug. |
| **Hệ quả: phát hiện PAN phải dựa trên NỘI DUNG, không dựa trên tên field** | `SEC-005` — quét theo hình dạng và kiểm tra tổng kiểm tra, áp cho **mọi** chuỗi trong payload, **kể cả khi tên field hoàn toàn vô hại**. Đây là hệ quả trực tiếp của mục 7 nhóm 1, 2, 4 và 7: PAN có thể xuất hiện trong free-text, trong field tên lạ, trong array không key, và trong thông điệp lỗi. Rule theo tên không đủ. |
| **Ghi log truy cập** | `SEC-020` |

**Phạm vi áp dụng cần QSA xác định.** Tài liệu này không kết luận Repro nằm trong hay ngoài phạm vi của bất kỳ tổ chức nào.

### 8.4 SOC 2

Khác ba khung trên ở một điểm quan trọng: SOC 2 không hỏi "anh có an toàn không" mà hỏi **"anh chứng minh được không"**. Vì vậy ràng buộc của nó rơi vào *khả năng đưa ra bằng chứng*.

| Ràng buộc lên capsule / lifecycle | Hệ quả thiết kế |
|---|---|
| **Logical access control phải tồn tại và chứng minh được** | `SEC-018`, `SEC-019`. Một bản triển khai **không có** access control không thể đưa ra bằng chứng nào — đây là phát hiện kiểm toán trực tiếp, không phải khuyến nghị. Lại là `THREAT-008` và mục 10. |
| **Hạn chế việc truyền và mang dữ liệu ra khỏi hệ thống** | `TB-4` **chính là** sự kiện mang dữ liệu ra. Cần `SEC-020` (ghi lại), `SEC-043`/`SEC-044` (giới hạn nơi đến và thời gian tồn tại). Nếu không có gì, tổ chức phải khai rằng có một kênh mang dữ liệu ra không được kiểm soát. |
| **Giám sát và phát hiện** | `SEC-020` append-only, và **principal không xoá được dấu vết của chính mình** — nếu xoá được thì bằng chứng không có giá trị. |
| **Huỷ dữ liệu khi hết mục đích** | `SEC-021`, `SEC-022` (**mặc định 30 ngày**, `GATE-05a`), `SEC-023`. Với các bản copy ở Zone 3/Zone 4, chỉ crypto-shred (8.1.2) mới cho phép khai một cách trung thực rằng dữ liệu đã được huỷ — **cơ chế đó nay đã được chốt** (`SEC-016` = `MUST-V0.1`, `GATE-05b`). ⚠ Nhưng SOC 2 đòi **bằng chứng**, không đòi sự tồn tại: khai được điều đó cần **key custody vận hành được** (`U-06d`) **và** một đường để xuất bằng chứng phá khoá — `GAP-04` chưa đóng nên đường đó chưa có. |
| **Thay đổi cấu hình có kiểm soát** | `SEC-013` (approval cho thay đổi `A-09`), `SEC-010` (fingerprint config đi kèm mọi capsule ⇒ đối chiếu được capsule nào sinh dưới cấu hình nào). Đây cũng chính là bằng chứng chống `THREAT-005`. |

### 8.5 Trả lời §38 Q12 — *Is self-hosting required from day one?*

> **Đáp án: CÓ. Và lý do mạnh nhất KHÔNG phải bảo mật — mà là compliance.**

RQ.md lập luận cho self-host bằng **bảo mật**: hạ tầng riêng thì attacker khó chiếm hơn `[stated §20.6]`. Lập luận đó đúng nhưng **yếu**, vì nó là lập luận so sánh: một nhà cung cấp chuyên nghiệp hoàn toàn có thể vận hành hạ tầng an toàn hơn tổ chức tự làm. Nếu chỉ có lập luận bảo mật, self-host sẽ bị đánh đổi ngay khi bản hosted tiện hơn — và nó sẽ tiện hơn.

Lập luận compliance thì khác về chất, vì nó **không so sánh mức độ, nó thay đổi bản chất nghĩa vụ**:

| Điều self-host tránh được | Vì sao không đánh đổi được bằng "nhà cung cấp làm tốt hơn" |
|---|---|
| **Không đưa nhà cung cấp vào vai processor / đối tác kinh doanh** | Đây là câu hỏi *có hay không*, không phải câu hỏi *tốt đến đâu*. Ngay khi dữ liệu production rời khỏi tổ chức, một quan hệ hợp đồng và một chuỗi nghĩa vụ mới phát sinh — cùng với nghĩa vụ đánh giá nhà cung cấp, ràng buộc nhà thầu phụ, và trách nhiệm khi họ có sự cố. |
| **Không phát sinh chuyển dữ liệu xuyên biên giới** | Nếu hạ tầng của nhà cung cấp nằm ở khu vực pháp lý khác, việc gửi dữ liệu tới đó là một hành vi chuyển dữ liệu với nghĩa vụ riêng. Không có mức độ bảo mật nào làm nghĩa vụ này biến mất. |
| **Không mở rộng phạm vi đánh giá tuân thủ sang bên thứ ba** | Với PCI DSS và HIPAA, việc đưa dữ liệu ra ngoài kéo theo cả chuỗi đánh giá. |
| **Giữ được data residency** | §20.17 đã liệt kê "data residency where required" `[stated §20.17]` — yêu cầu này chỉ thoả được bằng self-host. |

Nói ngắn: **bảo mật là câu hỏi "an toàn đến đâu"; compliance là câu hỏi "có được phép không".** Câu thứ hai chặn cứng, câu thứ nhất thì thương lượng được. Đó là lý do self-hosting phải là **bắt buộc từ V0.1**, không phải một tuỳ chọn triển khai.

Hệ quả kéo theo, và nó dẫn thẳng sang mục 10: nếu self-host là con đường bắt buộc cho mọi tổ chức có nghĩa vụ tuân thủ, thì **bản self-host phải là bản có đủ control để tuân thủ**. Một bản self-host thiếu access control và audit không giải quyết được vấn đề mà nó được chọn để giải quyết. **Điểm này đã được chốt** — quyết định `D2` ngày 2026-08-14 đưa authn + authz + audit vào OSS core (mục 10).

---

## 9. Yêu cầu bảo mật cho MVP

### 9.1 Quy ước

- Mỗi requirement viết dạng **given/then kiểm chứng được** — có thể chuyển thành test case mà không cần diễn giải thêm.
- **Phân loại**: `MUST-V0.1` (bắt buộc có trước khi bất kỳ dữ liệu production nào được capture) · `SHOULD` (nên có, hoãn được mà không tạo rủi ro không thu hồi) · `DEFER` (**hoãn vì cần quyết định, không phải vì cần ưu tiên**).
- **Không** requirement nào lấy ngưỡng từ §24 hay §31 — lý do ở mục 1.4.
- **Không gian ID chạy tới `SEC-048`, trong đó 43 ID được cấp và 5 ID để trống** (`SEC-014`, `SEC-026`, `SEC-031`, `SEC-041`, `SEC-046`). Năm ID trống là **cố ý reserve** ở cuối mỗi nhóm để yêu cầu mới chèn vào đúng nhóm mà không phải đánh số lại — vì các ID này đã được tài liệu khác trích dẫn.

| Phân loại | Số lượng |
|---|---|
| `MUST-V0.1` | **33** |
| `SHOULD` | **8** |
| `DEFER` | **2** — `SEC-025`, `SEC-039` |
| **Tổng** | **43** |

> **Quyết định `D2` (2026-08-14) KHÔNG làm đổi bộ số này — nhưng `GATE-05b` thì CÓ.** `✅ CHỐT GATE-05b — 2026-08-14`
>
> - **Mệnh đề về `D2` vẫn đúng nguyên vẹn**: `SEC-018`/`SEC-019`/`SEC-020`/`SEC-021` vốn đã là `MUST-V0.1`; `D2` chỉ **gỡ điều kiện treo** `[cần anh chốt]` khỏi chúng và xác nhận chúng thuộc **OSS core**. `D2` không chuyển phân loại của bất kỳ requirement nào, nên nó **không** làm đổi bộ số.
> - **`GATE-05b` làm đổi bộ số**: `SEC-016` **rời `DEFER` sang `MUST-V0.1`** (mục 11.c). Đây là **thay đổi phân loại duy nhất** của ngày 2026-08-14 — không requirement nào khác bị nâng hay hạ, và `SEC-025` **giữ `DEFER`** (thiết kế cơ chế của nó vẫn chưa tồn tại).
> - **Bộ số hiện hành: `33 MUST-V0.1` / `8 SHOULD` / `2 DEFER` = `43`.** **Tổng 43 không đổi** — chỉ phân bố đổi, vì đây là một requirement **chuyển nhóm**, không phải requirement mới. Phân bố **trước `GATE-05b`** (một `MUST-V0.1` ít hơn, một `DEFER` nhiều hơn) chỉ còn tồn tại ở **một chỗ duy nhất**: bảng lịch sử `Trước D2 / Sau D2` ở mục 10, nơi nó có ghi ngày và ghi rõ đã bị `GATE-05b` thay thế. Mọi tài liệu hạ nguồn trích bộ số này phải đọc **`33 / 8 / 2`**.

### 9.2 Bốn thay đổi mặc định — phần giá trị nhất của tài liệu này

Nếu chỉ đọc một mục trong toàn bộ tài liệu, đọc mục này. Giá trị của phân tích bảo mật ở đây **không phải "redact nhiều hơn"** — mục 7 vừa chứng minh redaction có trần cứng. Giá trị nằm ở **bốn mặc định bị đảo chiều**:

| # | Thay đổi | Từ → Đến | Requirement |
|---|---|---|---|
| **1** | **Mọi thứ fail closed** | Hệ thống gặp trạng thái bất thường thì **dừng**, không **tiếp tục ở chế độ không bảo vệ** | `SEC-001` (redaction lỗi ⇒ **không persist**), `SEC-005` (phát hiện PAN theo nội dung, không chờ tên field), `SEC-012` (config thiếu ⇒ **refuse to start**, **không bao giờ** mặc định "no redaction") |
| **2** | **Allowlist thay denylist ở hai chỗ quyết định** | Ở hai nơi mà không gian đầu vào là **không giới hạn và không đoán trước được**, denylist chắc chắn thiếu | `SEC-004` (environment variable), `SEC-032` (**replay egress**) |
| **3** | **Capsule phải verify trước khi parse** | Capsule là dữ liệu không tin cậy, không phải dữ liệu của mình | `SEC-027` — **RQ.md hoàn toàn chưa có** `[GAP]` |
| **4** | **Authn/authz + audit nằm trong OSS core** — **✅ ĐÃ CHỐT 2026-08-14** | Không phải commercial layer | `SEC-018`, `SEC-019`, `SEC-020`, `SEC-021` = `MUST-V0.1` **trong OSS core** theo `D2`. Ghi đè phần §28 xếp *Access control* / *Retention policies* vào commercial layer — bằng chứng hai phía giữ nguyên ở mục 10. **`SEC-016` (crypto-shred) KHÔNG nằm trong `D2`** — mệnh đề này **vẫn đúng**: `D2` chỉ chốt authn/authz/audit. **Nhưng `SEC-016` ĐÃ được chốt bởi một quyết định khác**: `✅ CHỐT GATE-05b — 2026-08-14`, nay `MUST-V0.1`, nhãn `[cần validate]` đã gỡ — xem mục 11.c. Đừng đọc `D2` như đã chốt phần này, và cũng **đừng đọc "không thuộc `D2`" thành "chưa chốt"** |

---

### Nhóm A — Redaction và tối giản dữ liệu tại điểm capture (`TB-2`)

Đối ứng: `THREAT-001`, `THREAT-004`, `THREAT-012`, `THREAT-014`

| ID | Loại | Given / Then |
|---|---|---|
| **`SEC-001`** | `MUST-V0.1` | **Given** redaction engine ném lỗi, hết thời gian chờ, hoặc không nạp được rule khi xử lý một bản ghi, **then** recorder **KHÔNG persist** bản ghi đó; capsule chỉ chứa placeholder `<REDACTION-FAILED>` tại vị trí đó; và counter `redaction_failed_total` tăng. **Không bao giờ** persist dữ liệu chưa qua redaction. |
| `SEC-002` | `MUST-V0.1` | **Given** một HTTP header thuộc nhóm `NEVER-STORE` của mục 5.4, **then** giá trị của nó **không bao giờ** được ghi vào buffer persist ở bất kỳ giai đoạn nào; capsule ghi tên header và độ dài, không ghi giá trị. |
| `SEC-003` | `MUST-V0.1` | **Given** một field trong body khớp một rule của mục 5.5, **then** chiến lược tương ứng được áp, **và** một bản ghi `{path, strategy}` được thêm vào `redaction_applied[]` của manifest — bản ghi này **không** chứa giá trị gốc. |
| **`SEC-004`** | `MUST-V0.1` | **Given** recorder capture environment variable, **then** chỉ những key nằm trong **allowlist tường minh** (mục 5.7) xuất hiện trong capsule; mọi key khác **không xuất hiện dưới bất kỳ dạng nào, kể cả tên key rỗng**. **Given** một key ngoài allowlist được thêm vào config, **then** thay đổi đó phải qua `SEC-013` và xuất hiện trong fingerprint của `SEC-010`. |
| **`SEC-005`** | `MUST-V0.1` | **Given** bất kỳ chuỗi ký tự nào trong payload có hình dạng số thẻ và thoả thuật toán kiểm tra tổng của số thẻ, **then** giá trị bị thay bằng `REPLACE-FIXED` giữ định dạng **bất kể tên field là gì**, và cờ `pan_detected` được ghi vào manifest. Yêu cầu này áp cho **cả** free-text, array không key, thông điệp lỗi và stack trace. |
| `SEC-006` | `MUST-V0.1` | **Given** một field được phân loại free-text (mục 5.5), **then** nội dung bị `DROP` và thay bằng metadata `{type, length, sha256_prefix}`; **and** cấu trúc bao ngoài (sự tồn tại của key) được giữ nguyên để không đổi execution path (mục 6.1). |
| `SEC-007` | `MUST-V0.1` | **Given** một stack trace hoặc thông điệp lỗi từ database/external API được capture, **then** chuỗi đó đi qua content scrubber trước khi persist; scrubber phát hiện theo **hình dạng** (số thẻ, email, số điện thoại, token có cấu trúc, cặp `key=value` mang tên nhạy cảm) chứ không theo schema. |
| `SEC-008` | `MUST-V0.1` | **Given** một kết quả truy vấn vượt ngưỡng số row hoặc ngưỡng byte, **then** recorder cắt bớt tại ngưỡng, đánh dấu `truncated: true` kèm số row thực tế, và **không** persist phần vượt. **Ngưỡng cụ thể = `TBD`** — xem mục 11.b. **Given** ngưỡng chưa được cấu hình, **then** áp giá trị mặc định bảo thủ do implementation quy định, **không** coi là "không giới hạn". |

---

### Nhóm B — Toàn vẹn cấu hình và hành vi fail-closed (`TB-1`)

Đối ứng: `THREAT-004`, `THREAT-005`

| ID | Loại | Given / Then |
|---|---|---|
| `SEC-009` | `MUST-V0.1` | **Given** file cấu hình redaction tồn tại nhưng không parse được, hoặc parse ra cấu trúc không hợp lệ theo schema, **then** recorder **refuse to start** với lỗi tường minh. **Không** khởi động ở trạng thái "bỏ qua config lỗi". |
| `SEC-010` | `SHOULD` | **Given** recorder nạp cấu hình thành công, **then** fingerprint (hash) của cấu hình đang hiệu lực được ghi vào manifest của **mọi** capsule sinh ra dưới cấu hình đó, cho phép đối chiếu về sau capsule nào được tạo dưới rule nào. |
| `SEC-011` | `MUST-V0.1` | **Given** không có cấu hình redaction nào được cung cấp, **then** recorder chạy với **built-in default profile** của mục 5. Recorder **không bao giờ** chạy ở trạng thái "không rule nào khớp" — trạng thái đó phải là bất khả thi về mặt cài đặt, không chỉ là bất khả thi về mặt quy ước. |
| **`SEC-012`** | `MUST-V0.1` | **Given** cấu hình khai báo tắt redaction (`enabled: false`, profile rỗng, hoặc tương đương), **then** recorder **refuse to start** trừ khi có cờ tường minh dạng `--i-accept-full-capture`; **and** khi cờ đó được dùng: một bản ghi audit được tạo, một cảnh báo được in ở mỗi lần khởi động, **và mọi capsule sinh ra mang nhãn `UNREDACTED` hiển thị trong `repro list` và `repro inspect`**. Tắt redaction phải **đắt và ồn ào** (mục 6.5). |
| `SEC-013` | `SHOULD` | **Given** một pull request thay đổi file cấu hình redaction hoặc phạm vi capture, **then** CI chặn merge nếu thiếu phê duyệt của owner được khai báo trong `CODEOWNERS`, và owner đó **không phải** người tạo pull request. Đây là control chính chống `THREAT-005`. |
| `SEC-014` | — | *Reserved* |

---

### Nhóm C — Bảo vệ capsule at rest và control plane trong OSS core (`TB-3`)

Đối ứng: `THREAT-002`, `THREAT-003`, `THREAT-008`, `THREAT-011`, `THREAT-013`, `THREAT-016`

| ID | Loại | Given / Then |
|---|---|---|
| `SEC-015` | `MUST-V0.1` | **Given** một capsule được lưu vào storage, **then** nội dung được mã hoá bằng thuật toán mã hoá có xác thực (AEAD); **and** storage backend **không** giữ khoá giải mã. **Given** ciphertext bị sửa đổi, **then** giải mã thất bại và capsule bị từ chối. |
| **`SEC-016`** | **`MUST-V0.1`** · `✅ CHỐT GATE-05b — 2026-08-14` | **Given** một capsule được tạo, **then** nó được mã hoá bằng **khoá riêng của capsule đó**, khoá nằm ở Zone 2 và **không** đi kèm capsule; **and** `repro replay` lấy khoá just-in-time; **and** lệnh xoá phá khoá ⇒ mọi bản copy trở thành ciphertext vô nghĩa. **Trước 2026-08-14 yêu cầu này là `DEFER` vì cần một QUYẾT ĐỊNH, không vì thiếu ưu tiên** — đánh đổi với replay offline chưa được cân (mục 8.1.2, mục 11.c). **Nay đã được cân và chọn**: `@TrisJr` chốt áp dụng crypto-shredding, phân loại `MUST-V0.1`; nhãn `[cần validate]` được gỡ. **Quyết định `D2` KHÔNG bao gồm yêu cầu này** — mệnh đề đó vẫn đúng; thứ chốt `SEC-016` là **`GATE-05b`**. **Hai điều kiện đi kèm, không được bỏ**: (a) `GATE-05b-r` — *"replay không cần kết nối mạng"* thôi là bất biến; (b) `GATE-05b-r2` — **`U-06d` (key custody) là blocker**: không có nơi giữ và xoá khoá thì yêu cầu này **không thực thi được**, và mọi mệnh đề *"bản copy trở thành ciphertext vô nghĩa"* trong tài liệu này đều treo trên điều kiện đó. |
| `SEC-017` | `MUST-V0.1` | **Given** recorder gửi capsule tới collector, **then** kết nối dùng TLS **và** recorder xác thực bằng credential riêng của từng service; **and** capsule được ghi vào scope của chính service đó. **Given** credential không hợp lệ hoặc scope không khớp, **then** collector từ chối nhận. |
| **`SEC-018`** | `MUST-V0.1` | **Given** bất kỳ thao tác nào trên capsule (`list`, `pull`, `inspect`, `delete`, lấy khoá), **then** thao tác đòi hỏi **authentication** và **authorization deny-by-default** — không có quyền tường minh thì bị từ chối. **Yêu cầu này nằm trong OSS core, không phải commercial layer** — `✅ ĐÃ CHỐT 2026-08-14` (`D2`), ghi đè §28; bằng chứng mâu thuẫn giữ ở mục 10. |
| `SEC-019` | `MUST-V0.1` | **Given** một principal chạy `repro list` hoặc `repro pull`, **then** chỉ những capsule thuộc service/team mà principal được cấp quyền mới hiển thị và tải được; capsule ngoài scope **không xuất hiện trong danh sách** (không chỉ là bị từ chối khi tải — sự tồn tại của chúng cũng là thông tin, mục 7 nhóm 10). Đây là phần *authorization* của `D2`, **nằm trong OSS core** — `✅ ĐÃ CHỐT 2026-08-14`. |
| **`SEC-020`** | `MUST-V0.1` | **Given** bất kỳ truy cập nào tới capsule, **then** một bản ghi audit `{who, what, when, from-where}` được ghi vào log **append-only**; **and** principal thực hiện thao tác **không** có quyền sửa hoặc xoá bản ghi của chính mình. **Yêu cầu này nằm trong OSS core** — `✅ ĐÃ CHỐT 2026-08-14` (`D2`), xem mục 10. |
| **`SEC-021`** | `MUST-V0.1` | **Given** một yêu cầu xoá capsule, **then** tồn tại lệnh xoá cứng thực thi được **trong bản self-host** và việc xoá được ghi audit. **Given** `SEC-016` đã được chốt, **then** lệnh này cũng phá khoá tương ứng (crypto-shred) — mệnh đề này **KHÔNG còn treo**: `SEC-016` **đã được chốt `MUST-V0.1`** (`✅ CHỐT GATE-05b — 2026-08-14`, mục 11.c) ⇒ **xoá cứng nay bao gồm phá khoá**, và đó là phần làm cho việc xoá có hiệu lực trên bản copy ngoài Zone 2. Điều kiện thực thi: phải có key store để phá khoá (`U-06d`, `GATE-05b-r2`). **Yêu cầu này nằm trong OSS core** — `✅ ĐÃ CHỐT 2026-08-14` (`D2`), xem mục 10. |

---

### Nhóm D — Retention, xoá và quyền của chủ thể dữ liệu

Đối ứng: `THREAT-016`, `THREAT-011`, `THREAT-007`

| ID | Loại | Given / Then |
|---|---|---|
| **`SEC-022`** | `MUST-V0.1` | **Given** một capsule được tạo, **then** nó mang một TTL **hữu hạn**. **Given** cấu hình cố gắng đặt TTL vô hạn, **then** hệ thống **từ chối** cấu hình đó. **Given** cấu hình **không đặt TTL**, **then** hệ thống áp **giá trị mặc định = `30 ngày`** — `✅ CHỐT GATE-05a — 2026-08-14`, quyết bởi `@TrisJr` (mục 11.a). TTL **vẫn cấu hình được** (`FR-024`): 30 ngày là **mặc định khi không cấu hình**, không phải giới hạn cứng. ⚠ Con số này là **quyết định sản phẩm, không qua pháp chế** — nghĩa vụ lưu trữ theo khu vực pháp lý vẫn chưa được ai kiểm (mục 11.a). Điều **khẳng định được** vẫn là: giá trị phải hữu hạn. |
| `SEC-023` | `MUST-V0.1` | **Given** TTL của một capsule hết hạn, **then** capsule bị xoá tự động khỏi Zone 2 mà không cần thao tác thủ công, **and** việc xoá được ghi vào audit log của `SEC-020`. |
| `SEC-024` | `SHOULD` | **Given** một capsule được tạo, **then** manifest mang `data_classification` mô tả **loại** dữ liệu mà capsule có thể chứa (không phải nội dung), đủ để trả lời câu hỏi khoanh vùng phạm vi khi có sự cố mà không cần mở capsule. |
| `SEC-025` | **`DEFER`** | **Given** một yêu cầu xoá dữ liệu của một chủ thể, **then** hệ thống tra được danh sách capsule có liên quan qua một tham chiếu giả danh. **`SEC-025` GIỮ `DEFER` vì thiết kế của cơ chế này chưa tồn tại** — `GATE-05b` **không** đổi phân loại của yêu cầu này. Nó tương tác trực tiếp với `SEC-016`: **crypto-shred nay đã được chọn** (`MUST-V0.1`, `GATE-05b`) ⇒ điều kiện (a) ở mục 8.1.1 (*biết capsule nào chứa dữ liệu của chủ thể nào*) trở nên **ít quan trọng hơn nhiều**, vì phá khoá có hiệu lực mà không cần tra ngược tới từng chủ thể. Điều kiện tiên quyết *"quyết định `SEC-016` phải có trước"* **đã được thoả**; phần còn thiếu là **thiết kế cơ chế tra cứu**, và đó là lý do `DEFER` vẫn đứng. |
| `SEC-026` | — | *Reserved* |

---

### Nhóm E — Capsule là input không tin cậy (`TB-5`)

Đối ứng: `THREAT-009`, `THREAT-013`, `THREAT-014`. **Toàn bộ nhóm này là `[GAP]` — RQ.md không có gì tương ứng.**

| ID | Loại | Given / Then |
|---|---|---|
| **`SEC-027`** | `MUST-V0.1` | **Given** `repro replay`, `repro inspect` hoặc `repro diff` mở một capsule, **then** CLI verify integrity (digest được khai báo trong manifest, và chữ ký nếu có) **TRƯỚC KHI** parse, giải nén hoặc deserialize **bất kỳ** phần payload nào. **Given** verify thất bại hoặc digest vắng mặt, **then** thao tác dừng lại với lỗi tường minh và **không phần nào của payload được xử lý**. Thứ tự "verify trước, parse sau" là bản chất của yêu cầu — verify sau khi parse không có giá trị. |
| `SEC-028` | `MUST-V0.1` | **Given** một entry trong capsule có đường dẫn chứa thành phần đi lên thư mục cha, đường dẫn tuyệt đối, symlink, hoặc resolve ra ngoài thư mục đích, **then** **toàn bộ** capsule bị từ chối. Không extract từng phần — từ chối một phần vẫn để lại các entry đã ghi trước đó. |
| `SEC-029` | `MUST-V0.1` | **Given** dữ liệu từ capsule được deserialize thành object, **then** các key `__proto__`, `constructor`, `prototype` **không** được gán vào prototype của object; **and** object chứa dữ liệu capsule được tạo với prototype rỗng. **Given** một key như vậy xuất hiện, **then** nó được từ chối và ghi nhận, không được xử lý im lặng. |
| `SEC-030` | `MUST-V0.1` | **Given** một phần capsule được giải nén, **then** áp giới hạn cứng về kích thước sau giải nén, số lượng entry, và tỉ lệ nén; vượt bất kỳ giới hạn nào ⇒ **abort**. Yêu cầu này là hệ quả trực tiếp của việc §20.12 chọn compression `[stated §20.12]`. |
| `SEC-031` | — | *Reserved* |

---

### Nhóm F — Egress và side effect khi replay (`TB-6`)

Đối ứng: `THREAT-010`, `THREAT-018`, `THREAT-009`

| ID | Loại | Given / Then |
|---|---|---|
| **`SEC-032`** | `MUST-V0.1` | **Given** replay runtime đang chạy, **then** mọi kết nối mạng đi ra bị chặn **ở mức process**, và chỉ **allowlist gồm loopback + replay proxy** được phép. **Given** code ứng dụng mở kết nối bằng bất kỳ cơ chế nào — HTTP client tiêu chuẩn, socket thô, tiến trình con gọi công cụ dòng lệnh, SDK dùng transport riêng — **then** kết nối đó vẫn bị chặn, vì việc chặn **không phụ thuộc vào việc nhận diện được cơ chế**. Đây là siết chặt lên §13/§20.4: đổi từ *"denylist các verb ghi"* sang *"allowlist những gì đã chứng minh là read"*. |
| **`SEC-033`** | `MUST-V0.1` | **Given** replay runtime gặp một operation mà nó **không chứng minh được là READ** — verb không nhận diện được, câu SQL bắt đầu bằng `WITH` có mệnh đề ghi lồng bên trong, `SELECT` gọi hàm có side effect, `CALL` gọi stored procedure, hay một sink chưa được instrument — **then** replay **từ chối thực thi** operation đó và trả lỗi tường minh nêu rõ operation nào bị chặn. **Không** fall through thành "cho chạy". Fail-closed, không fail-open. |
| `SEC-034` | `MUST-V0.1` | **Given** replay cần một recorded response không có trong capsule, **then** replay runtime trả lỗi `MISSING_RECORDING` kèm mô tả lời gọi bị thiếu; **and** **không** gọi ra hệ thống thật trong bất kỳ hoàn cảnh nào. Thiếu dữ liệu là lỗi replay, không phải lý do để đi ra ngoài. |
| `SEC-035` | `MUST-V0.1` | **Given** capsule chứa một giá trị chỉ định host, URL, đường dẫn file hay tên module, **then** giá trị đó **chỉ** được dùng làm **khoá tra cứu** trong bảng recorded response; nó **không bao giờ** được dùng để mở kết nối, resolve đường dẫn, hay nạp module. Capsule không được phép điều khiển replay runtime đi đâu hoặc nạp gì. |
| `SEC-036` | `SHOULD` | **Given** `repro replay` chạy, **then** replay runtime chạy trong môi trường cách ly (container hoặc tài khoản người dùng riêng) **không** có quyền đọc `~/.ssh`, `~/.aws`, keychain hệ thống, hay thư mục cấu hình của các công cụ khác. Đây là control giảm thiệt hại cho `THREAT-009` khi các control trước thất bại — bảo vệ `A-12`. |

---

### Nhóm G — Vận hành production, hardening và chuỗi cung ứng

Đối ứng: `THREAT-012`, `THREAT-019`, `THREAT-013`, `THREAT-009`

| ID | Loại | Given / Then |
|---|---|---|
| `SEC-037` | `MUST-V0.1` | **Given** buffer capture đầy, hoặc thao tác capture vượt ngân sách thời gian, **then** recorder **drop capture** và tăng counter tương ứng; **and** recorder **không bao giờ** chặn luồng request hoặc ném lỗi ra luồng request production. Mất một capsule là chấp nhận được; làm hỏng một request production thì không — đúng theo nguyên tắc §20.7 `[stated §20.7]`. |
| `SEC-038` | `SHOULD` | **Given** `repro inspect` hoặc `repro diff` in nội dung capsule ra terminal, **then** ký tự điều khiển và escape sequence trong nội dung được vô hiệu hoá trước khi in. Capsule là dữ liệu không tin cậy kể cả khi chỉ được hiển thị. |
| `SEC-039` | **`DEFER`** | **Given** một capsule được tạo, **then** nó được ký bằng hạ tầng khoá của tổ chức, cho phép verify **nguồn gốc** chứ không chỉ **tính toàn vẹn**. **`DEFER` vì** nó đòi hỏi tổ chức có sẵn hạ tầng khoá và làm tăng đáng kể độ phức tạp self-host. `SEC-027` (verify digest) đã đóng phần lớn `THREAT-009` mà không cần điều kiện này. |
| `SEC-040` | `SHOULD` | **Given** gói `@repro/node` được publish, **then** artifact đi kèm provenance/attestation kiểm chứng được; **and** danh sách dependency trực tiếp của recorder được liệt kê tường minh trong tài liệu và giữ ở mức tối thiểu; **and** lockfile được pin. Đối ứng `THREAT-019` — không loại bỏ được rủi ro, chỉ làm việc chèn code lạ khó hơn và dễ phát hiện hơn. |
| `SEC-041` | — | *Reserved* |

---

### Nhóm H — Vệ sinh Zone 3 (laptop developer)

Đối ứng: `THREAT-006`, `THREAT-007`. **Toàn bộ nhóm này là hygiene control, không phải containment** — xem mục 7.1.

| ID | Loại | Given / Then |
|---|---|---|
| `SEC-042` | `MUST-V0.1` | **Given** `repro pull` ghi capsule xuống đĩa, **then** file được tạo với quyền chỉ chủ sở hữu đọc/ghi và thư mục chứa chỉ chủ sở hữu truy cập. **Given** không đặt được quyền đó, **then** thao tác thất bại thay vì ghi với quyền rộng hơn. |
| **`SEC-043`** | `MUST-V0.1` | **Given** `repro pull` được chạy với thư mục đích nằm **bên trong** một git working tree, **then** CLI **từ chối** ghi trừ khi có cờ tường minh; **and** khi ghi vào thư mục mặc định, CLI tạo hoặc cập nhật `.gitignore` để loại trừ capsule. Đối ứng `THREAT-006` đường 1. **Đường 2 (regression test) không đóng được bằng requirement này** — nó cần một quyết định về capsule format, xem mục 11 và `ADR-002`. |
| `SEC-044` | `SHOULD` | **Given** một capsule tồn tại trong `~/.repro`, **then** nó mang TTL cục bộ **không dài hơn** TTL phía server — nay là một con số cụ thể: **mặc định 30 ngày** (`SEC-022`, `GATE-05a`). **and** `repro gc` xoá capsule quá hạn. Phân loại `SHOULD` chứ không `MUST` là **có chủ đích và không đổi sau `GATE-05`**: TTL cục bộ bị vô hiệu hoá bằng một thao tác copy file, nên nó là hygiene control chứ không tạo containment — xếp nó là `MUST` sẽ tạo cảm giác an toàn không tương xứng. Containment thật ở Zone 3 chỉ đến từ `SEC-016` — **nay là `MUST-V0.1`** (`GATE-05b`), **với điều kiện key custody `U-06d` (`GATE-05b-r2`)**. |
| `SEC-045` | `SHOULD` | **Given** thư mục đích của `repro pull` nằm trong một đường dẫn đồng bộ cloud đã biết, **then** CLI cảnh báo tường minh trước khi ghi và yêu cầu xác nhận. Đối ứng `THREAT-007` đường 1. |
| `SEC-046` | — | *Reserved* |

---

### Nhóm I — Minh bạch và quy trách nhiệm fidelity

Đối ứng: `THREAT-015`, `THREAT-001`, `THREAT-011`. Đây là nhóm nối công việc bảo mật với tính đúng của sản phẩm (mục 6).

| ID | Loại | Given / Then |
|---|---|---|
| `SEC-047` | `MUST-V0.1` | **Given** một capsule được tạo, **then** manifest mang bản kê `redaction_applied[]` gồm `{path, strategy}` cho **mọi** vị trí đã bị redact; **and** bản kê này **không** chứa giá trị gốc dưới bất kỳ dạng nào (kể cả hash có thể tra ngược bằng từ điển). |
| **`SEC-048`** | `MUST-V0.1` | **Given** Execution Diff phát hiện một điểm phân kỳ giữa execution production và execution local, **then** nó đối chiếu vị trí phân kỳ với `redaction_applied[]` của `SEC-047` và phân loại nguyên nhân thành **"diverged vì code"**, **"diverged vì redaction"**, hoặc **"diverged vì version/schema drift"**; **and** output hiển thị phân loại đó. **Given** không phân loại được, **then** hiển thị "không xác định được nguyên nhân" thay vì mặc định quy cho code. Không có yêu cầu này, redaction tạo ra nhiễu mà người dùng không tự phân giải được (mục 6.4) — và đó là con đường dẫn thẳng tới việc redaction bị tắt (mục 6.5). |

---

### 9.3 Bảng truy vết threat → requirement

| Threat | Requirement đối ứng | Còn residual sau khi áp đủ? |
|---|---|---|
| `THREAT-001` | `SEC-002` `SEC-003` `SEC-005` `SEC-006` `SEC-007` `SEC-047` | **Có** — trần cứng của redaction, mục 7 |
| `THREAT-002` | `SEC-015` `SEC-016` `SEC-017` `SEC-019` | **Thấp** — `SEC-016` **đã chốt** `MUST-V0.1` (`GATE-05b`); điều kiện còn lại là key custody (`U-06d`) |
| `THREAT-003` | `SEC-017` `SEC-018` `SEC-021` + quyết định self-host (8.5) | Thấp |
| `THREAT-004` | `SEC-009` `SEC-010` `SEC-011` `SEC-012` `SEC-013` `SEC-001` | Trung bình — config đúng cú pháp nhưng sai nghĩa |
| `THREAT-005` | `SEC-010` `SEC-012` `SEC-013` `SEC-019` `SEC-020` | **Cao** — cần quản trị tổ chức, không đóng được bằng công cụ |
| `THREAT-006` | `SEC-042` `SEC-043` `SEC-047` | **Cao** — đường 2 cần quyết định capsule format |
| `THREAT-007` | `SEC-042` `SEC-044` `SEC-045` `SEC-016` | **Cao** — `SEC-016` **đã chốt** `MUST-V0.1` (`GATE-05b`) nên đường containment nay **tồn tại**, nhưng hiệu lực của nó treo trên key custody `U-06d` (`GATE-05b-r2`); residual chỉ hạ khi có key store vận hành được |
| `THREAT-008` | `SEC-018` `SEC-019` `SEC-020` `SEC-021` | **Trung bình — không đổi sau `GATE-04`** — mục 10 đã chốt (`D2`); residual còn lại là **hiện thực authz đúng** + `GAP-04` (không có CLI verb để vận hành, **vẫn nguyên**) + **cơ chế** authn/authz vẫn `TBD` sau `GATE-04` (`GATE-04-r`) |
| `THREAT-009` | `SEC-027` `SEC-028` `SEC-029` `SEC-030` `SEC-035` `SEC-036` `SEC-038` `SEC-039` | **Thấp nếu đóng ngay** |
| `THREAT-010` | `SEC-032` `SEC-033` `SEC-034` | Thấp |
| `THREAT-011` | `SEC-020` `SEC-024` `SEC-047` `SEC-016` | **Cao ở lớp 2** — giới hạn cấu trúc. `SEC-016` **đã chốt** `MUST-V0.1` (`GATE-05b`) nên lớp 2 được **làm nhẹ** (*"không quan trọng nó ở đâu"*), **không** được đóng; và phần làm nhẹ đó treo trên `U-06d` |
| `THREAT-012` | `SEC-037` `SEC-008` | Thấp |
| `THREAT-013` | `SEC-017` `SEC-019` `SEC-027` `SEC-039` | Thấp |
| `THREAT-014` | `SEC-008` `SEC-030` `SEC-037` | Trung bình — ngưỡng `TBD` |
| `THREAT-015` | `SEC-047` `SEC-048` | Thấp |
| `THREAT-016` | `SEC-021` `SEC-022` `SEC-023` `SEC-044` `SEC-016` | **Cao ở phần bản copy** — nhưng đã đổi bản chất: phần *"tồn tại vô thời hạn"* **đóng vô điều kiện** (`SEC-022` = 30 ngày, `GATE-05a`); phần *"không xoá được bản copy"* có cơ chế **đã chốt** (`SEC-016` = `MUST-V0.1`, `GATE-05b`) nhưng **chỉ có hiệu lực khi có key custody** `U-06d` (`GATE-05b-r2`) ⇒ residual giữ **Cao** tới lúc đó |
| `THREAT-017` | `SEC-024` `SEC-048` | Trung bình |
| `THREAT-018` | `SEC-032` `SEC-033` `SEC-034` `SEC-035` `SEC-036` | Trung bình — side effect cục bộ |
| `THREAT-019` | `SEC-040` `SEC-037` `SEC-004` | **Không loại bỏ được** — đánh đổi cố hữu |

---

## 10. Mâu thuẫn M2 — ĐÃ CHỐT 2026-08-14

### M2 — Access control nằm ở OSS core hay commercial layer? · `✅ ĐÃ CHỐT 2026-08-14`

Đây là một **mâu thuẫn nội tại của RQ.md**, không phải một khoảng trống. Hai section của cùng một tài liệu nói hai điều loại trừ nhau. Tài liệu này **cố ý không kết luận một phía**; quyết định thuộc về chủ sản phẩm vì nó vừa là quyết định bảo mật vừa là quyết định mô hình kinh doanh. **Chủ sản phẩm đã chốt ngày 2026-08-14** — quyết định `D2` ghi ngay dưới đây.

#### ✅ Quyết định `D2` — 2026-08-14

| | |
|---|---|
| **Chốt** | **Authentication + authorization (access control) + audit log — cả ba — nằm trong OSS core**, không phải commercial layer. |
| **Ghi đè** | `RQ.md §28`, phần xếp *Access control* và *Retention policies* vào commercial layer `[stated §28]`, `RQ.md:1605-1627`. |
| **Giữ nguyên ở commercial layer** | Hosted storage · Team management · Analytics · AI analysis · Cloud integrations `[stated §28]`. |
| **KHÔNG nằm trong quyết định này** | **Crypto-shred (`SEC-016`)** — **`D2` không chốt phần này, và mệnh đề đó vẫn đúng**: `D2` chỉ gồm authn + authz + audit. **Đừng đọc `D2` như đã chốt luôn phần này.** ⚠ **Nhưng cũng đừng đọc dòng này thành "`SEC-016` chưa chốt"**: `SEC-016` **đã được chốt bởi `GATE-05b` ngày 2026-08-14** — `MUST-V0.1`, quyết bởi `@TrisJr`, nhãn `[cần validate]` đã gỡ, đánh đổi với replay offline **đã được cân và chấp nhận** (`GATE-05b-r`). Xem mục 11.c. Hai quyết định **rời nhau**: `D2` là phạm vi OSS core, `GATE-05b` là phân loại crypto-shred. |
| **Ai quyết** | Chủ sản phẩm. Lens bảo mật đã khuyến nghị (xem *Khuyến nghị của lens bảo mật* dưới đây) và khuyến nghị đó **được chấp thuận**. |

**Lý do chọn cả ba chứ không chỉ authn** — ba câu hỏi khác nhau, không thay thế được cho nhau:

| Control | Trả lời câu hỏi | Thiếu nó thì sao |
|---|---|---|
| **Authentication** | *Bạn là ai* | Không có gốc để gắn bất kỳ quyết định nào khác |
| **Authorization** (access control) | *Bạn xem được capsule nào* | Bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production** — tức mâu thuẫn `M2` **chưa được giải**, chỉ được đổi hình dạng. Đây là lý do authn một mình không đủ. |
| **Audit log** | *Ai đã pull gì* | Tổ chức **kiểm soát được nhưng không chứng minh được**. Và §20.17 yêu cầu audit log như mitigation cho một risk 🟠 High `[stated §20.17]` — bỏ audit là bỏ chính mitigation mà RQ.md đã tự nêu. |

**Hệ quả lên threat và requirement**:

| Đối tượng | Trước `D2` | Sau `D2` |
|---|---|---|
| `THREAT-008` | `[GAP]` — không mitigation; residual *"không đánh giá được, chờ mục 10"* | `[GAP]` **giữ nguyên với RQ.md** (nguyên văn §28 không đổi), nhưng có mitigation từ quyết định sản phẩm; residual **Medium**, không về 0 |
| `SEC-018`, `SEC-019`, `SEC-020`, `SEC-021` | `MUST-V0.1` nhưng treo nhãn `[cần anh chốt]` | `MUST-V0.1` **trong OSS core**, không còn treo |
| `SEC-016` | `DEFER` `[cần validate]` | **`D2` không đổi nó** — `DEFER` `[cần validate]` sau `D2`. ⚠ **`GATE-05b` (2026-08-14) thì đổi**: nay **`MUST-V0.1`**, nhãn `[cần validate]` đã gỡ — xem mục 11.c |
| Bộ số phân loại (mục 9.1) | `32 MUST-V0.1` / `8 SHOULD` / `3 DEFER` | **`D2` không đổi bộ số** — `D2` không chuyển phân loại của requirement nào. ⚠ **`GATE-05b` thì CÓ**: bộ số hiện hành là **`33 / 8 / 2 = 43`**; cột này là giá trị **trước `GATE-05b`**, giữ lại để tra được lịch sử |
| Số threat RQ.md không có mitigation (mục 4.3, 4.5) | 11 | **Không đổi — 11** (con số đo RQ.md; `RQ.md` không thay đổi thì con số này không bao giờ đổi). Con số dẫn xuất *"không có mitigation từ bất kỳ nguồn nào"* = **10** sau `D2`, và **9** sau `GATE-05` (`THREAT-016` rời nhóm) — xem callout ba con số ở mục 4.3 |
| Kết luận mục 7 (redaction là hygiene control, **không** phải containment boundary) | Đúng | **Đúng hơn.** `D2` **củng cố** kết luận đó chứ không làm mềm nó: containment thật đến từ access control + encryption + retention + audit, và nay ba trong bốn thứ đó **chắc chắn tồn tại trong OSS core**. Điều này không làm redaction mạnh lên chút nào — nó chỉ xác nhận rằng thứ gánh containment không bao giờ là redaction. |

> **Vì sao phần trình bày hai phía vẫn còn nguyên trong mục này.** Quyết định của chủ sản phẩm **không sửa RQ.md**. Mở `RQ.md` hôm nay, §28 vẫn xếp *Access control* và *Retention policies* vào commercial layer, và §20.5/§21 vẫn coi chúng là hạng mục MVP — hai câu đó vẫn nói ngược nhau. Xoá bằng chứng đi thì người đọc RQ.md về sau sẽ kết luận rằng threat model trích dẫn sai. **Phía A và phía B dưới đây là dấu vết vì sao có quyết định này, không phải nội dung lỗi thời.**

#### Phía A — §28 xếp access control vào commercial layer

`[stated §28]`, `RQ.md:1605-1627`:

| OSS core (§28) | Commercial layer (§28) |
|---|---|
| Repro SDK | Hosted storage |
| Recorder | **Team management** |
| Replay Runtime | **Access control** |
| Capsule Format | **Retention policies** |
| CLI | Analytics |
| **Basic Self-hosting** | **Enterprise security** |
| | AI analysis |
| | Cloud integrations |

Lập luận đứng sau phía này (hợp lý và phổ biến): mô hình open-core cần một ranh giới thương mại rõ ràng, và access control + team management là ranh giới kinh điển mà nhiều sản phẩm hạ tầng đang dùng. §28 cũng ghi rõ mô hình thương mại *"should only be defined after validating developer adoption"* `[stated §28]` — tức đây là phác thảo, không phải cam kết.

#### Phía B — §20.5 và §21 coi access control là hạng mục MVP

- §20.5 liệt kê mitigation cho "Sensitive Production Data" gồm: redaction, anonymization, encryption, configurable retention, self-hosting, **strict access control** `[stated §20.5]`, `RQ.md:1011-1018`.
- §21 Risk Matrix, cột **"MVP?"**: dòng `Sensitive data | Critical | **Yes** | Redaction + encryption`; dòng `Security exposure | Critical | **Yes** | Private/self-hosted architecture`; dòng `Compliance | High | **Yes** | Policies + self-hosting` `[stated §21]`, `RQ.md:1278-1289`.
- §20.17 liệt kê audit logs và data retention policies là mitigation cho compliance `[stated §20.17]`.

Nghĩa là: cùng một tài liệu vừa xếp access control, retention và audit là **hạng mục MVP bắt buộc**, vừa xếp chúng là **tính năng trả phí**.

#### Hệ quả nếu để nguyên

*(Giữ nguyên — đây là bốn hệ quả mà `D2` đã tránh được. Chúng là lý do quyết định được đưa ra, và là danh sách kiểm tra để biết `D2` có được thi hành đúng hay không.)*

> **Bản self-host — đúng bản mà §20.6 khuyến nghị dùng vì lý do bảo mật `[stated §20.6]` — lại là bản không có control bảo mật.**

Cụ thể hoá hệ quả đó:

| Hệ quả | Chi tiết |
|---|---|
| `THREAT-008` thành hiện thực | Mọi người trong mạng nội bộ `repro list` và `repro pull` được mọi capsule của mọi service |
| Lập luận self-host của §20.6 tự phá | Tổ chức chọn self-host **vì bảo mật** lại nhận bản yếu hơn về bảo mật |
| Lập luận compliance ở mục 8.5 tự phá | Self-host là con đường bắt buộc cho tổ chức có nghĩa vụ tuân thủ (8.5), nhưng bản self-host lại thiếu chính hai control mà HIPAA và SOC 2 đòi hỏi bằng chứng: logical access control và audit (8.2, 8.4) |
| Tổ chức bị đẩy vào lựa chọn sai | Để có control bảo mật, phải mua bản commercial — thường đi kèm hosted storage, tức phải **đưa dữ liệu production ra ngoài** để đổi lấy quyền bảo vệ nó |

Hệ quả cuối là điểm nghiêm trọng nhất: nó biến một quyết định đóng gói sản phẩm thành một áp lực đẩy dữ liệu production ra khỏi tổ chức.

#### Khuyến nghị của lens bảo mật

**Chuyển authn/authz (`SEC-018`, `SEC-019`), audit (`SEC-020`), và khả năng xoá cứng/crypto-shred (`SEC-021`, `SEC-016`) vào OSS core.** Giữ ở commercial layer những thứ thật sự là tiện ích vận hành và quy mô: hosted storage, team management ở mức tổ chức lớn, analytics, cloud integration, AI analysis.

Lập luận:

> **Bán access control như một tính năng trả phí, trong khi sản phẩm cốt lõi bê dữ liệu production ra ngoài, là một tư thế không bảo vệ được.**

Ba lý do cụ thể hơn:

1. **Sản phẩm này khác các sản phẩm open-core khác ở một điểm.** Với phần lớn công cụ hạ tầng, bản OSS thiếu access control chỉ có nghĩa là "kém tiện". Với Repro, bản OSS thiếu access control nghĩa là **một kho dữ liệu production mở cho toàn tổ chức**. Rủi ro không tỉ lệ với sự bất tiện.
2. **Nó vô hiệu hoá lý do tồn tại của bản OSS.** §28 nêu rõ Repro là ứng viên tốt cho mã nguồn mở **chính vì** dữ liệu execution production rất nhạy cảm `[stated §28]`. Nếu bản OSS không bảo vệ được thứ nhạy cảm đó, lập luận mã nguồn mở tự mâu thuẫn.
3. **Nó tạo ra một rủi ro thương hiệu bất đối xứng.** Sự cố dữ liệu đầu tiên xảy ra trên một bản self-host không có access control sẽ được ghi nhận là "sự cố của Repro", bất kể ai triển khai.

**`✅ ĐÃ CHỐT 2026-08-14`** — Đây là quyết định của chủ sản phẩm. Nó đụng tới mô hình kinh doanh, không chỉ tới bảo mật, và lens bảo mật không có thẩm quyền quyết định ranh giới thương mại; vì vậy tài liệu này đã **không** tự viết dứt khoát một phía mà trình bày cả hai. **Khuyến nghị trên đã được chấp thuận** đối với phần authn/authz/audit (`SEC-018`, `SEC-019`, `SEC-020`, `SEC-021` ⇒ `MUST-V0.1` trong OSS core). **Phần crypto-shred (`SEC-016`) KHÔNG được chốt bởi `D2`** — ở thời điểm ngay sau `D2`, yêu cầu đó vẫn còn ở nhóm hoãn-chờ-quyết-định (mục 11.c). ⚠ **Cập nhật: phần còn lại của khuyến nghị nay CŨNG đã được chấp thuận** — `✅ CHỐT GATE-05b — 2026-08-14`: `SEC-016` ⇒ **`MUST-V0.1`**, quyết bởi `@TrisJr`. Nghĩa là **toàn bộ** khuyến nghị của lens bảo mật ở mục này (authn/authz, audit, xoá cứng **và** crypto-shred) đã được chấp thuận, nhưng bằng **hai quyết định rời nhau** — `D2` cho ba phần đầu, `GATE-05b` cho phần crypto-shred. Không còn requirement nào trong tài liệu này mang nhãn `[cần anh chốt]`, và **không còn requirement nào mang `[cần validate]` vì chờ quyết định crypto-shred**.

**Ghi chú xác nhận chéo**: lens phân tích nghiệp vụ độc lập cũng phát hiện đúng mâu thuẫn này từ một góc khác (`FR-025`) — hai lens, hai đường tiếp cận, cùng một chỗ.

#### Hệ quả còn lại sau quyết định — `GAP-04` nay là nợ tường minh, và nặng hơn trước

`D2` đóng câu hỏi *"các control này có tồn tại không"*. Nó **không** đóng câu hỏi *"ai bấm nút nào để vận hành chúng"*.

> **`✅ CHỐT GATE-04 — 2026-08-14` — sàn tối thiểu của Capsule Store đã đóng, `GAP-04` thì KHÔNG.**
> **Mapping tên gọi**: `GATE-01` = G1 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.
>
> **Phần đã đóng** — `@TrisJr` chốt sàn tối thiểu của Capsule Store = **object/file storage + một index + authn/authz/audit hook**, với 3 thao tác tối thiểu theo `SDD §5.4` (neo kiến trúc nằm ở [SDD-Repro](../Architecture/SDD-Repro.md) và [ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md), **không** ở tài liệu này). Ý nghĩa bảo mật: **`authn/authz/audit hook` nay là thành phần bắt buộc của sàn**, không còn là thứ có thể bị cắt khi tối giản hoá store — đây là điều kiện tồn tại của `SEC-018`/`SEC-019`/`SEC-020` mà `D2` yêu cầu.
>
> **Phần KHÔNG đóng — ba thứ, phải đọc rời nhau** (`GATE-04-r`, định nghĩa ở [Risk-Register §4.2](../../010-Planning/Risk-Register.md)):
> 1. **Cơ chế** authn/authz cụ thể vẫn **`TBD`**. `GATE-04` chốt *cái gì phải có*, không chốt *làm bằng cách nào*. Một `hook` chưa phải một cơ chế; residual của `THREAT-008` (*hiện thực authz đúng*) **không** giảm chút nào nhờ `GATE-04`.
> 2. **`GAP-04` còn nguyên**: §18 vẫn không có một CLI verb nào cho authz/audit/retention — xem đoạn ngay dưới, giữ nguyên toàn bộ.
> 3. `A-09`/`A-11`/`A-12` — ba asset mà `RQ.md` không coi là asset — **không** được `GATE-04` chạm tới.

`RQ.md §18` khai báo đúng **sáu** CLI verb — `repro list`, `pull`, `inspect`, `replay`, `diff`, `verify` `[stated §18]` — và **cả sáu đều developer-side**. Không có verb nào để: cấp hoặc thu quyền truy cập capsule, đọc và xuất audit log, đặt hoặc kiểm tra retention policy, thực thi xoá cứng theo yêu cầu. Đây là `GAP-04`.

Vì sao nó **nặng hơn** sau `D2`, chứ không nhẹ đi:

| Trước `D2` | Sau `D2` |
|---|---|
| Authz/audit **có thể** không được lấp ở bản OSS (theo §28). `GAP-04` khi đó còn mơ hồ: thiếu giao diện vận hành cho một control **có thể không tồn tại** là một khoảng trống chưa xác định. | Authz/audit/retention **chắc chắn phải tồn tại trong OSS core**. Thiếu giao diện vận hành cho một control **bắt buộc phải có** là một **nợ tường minh, đo được, và chặn được việc release**. |

Hệ quả bảo mật cụ thể: một control tồn tại trong code nhưng không có đường để người vận hành **thay đổi, kiểm tra và xuất bằng chứng** thì trên thực tế nó vận hành ở giá trị mặc định vĩnh viễn — và một audit log không xuất ra được thì không dùng được cho chính mục đích tồn tại của nó (mục 8.2, 8.4: HIPAA và SOC 2 đòi **bằng chứng**, không đòi sự tồn tại). Đây là lý do `THREAT-008` giữ residual **Medium** thay vì về thấp.

**Việc phải làm, và nó KHÔNG thuộc thẩm quyền của tài liệu này**: quyết định giao diện vận hành cho SRE/admin (thêm CLI verb, hay một giao diện khác) là quyết định phạm vi sản phẩm. Threat model nêu ràng buộc — *phải có đường để cấp/thu quyền, đọc audit, đặt retention, và xoá cứng* — nhưng **không tự chốt hình dạng của nó**.

> **Câu trên VẪN ĐÚNG sau `GATE-04` — `GAP-04` CHƯA ĐÓNG.** `GATE-04` chốt **sàn của store**, không chốt **giao diện vận hành**. Đây là hai câu hỏi khác nhau và chỉ câu thứ nhất được trả lời. Sau `GATE-04`, `GAP-04` **nặng thêm lần thứ hai**: `D2` làm authz/audit/retention *chắc chắn phải tồn tại*, `GATE-04` đưa `authn/authz/audit hook` vào *sàn bắt buộc của store* — nhưng vẫn **không có verb nào** để cấp/thu quyền, đọc/xuất audit, đặt/kiểm tra retention. Nay lại thêm một khoản phải vận hành mà không có giao diện: **retention 30 ngày** (`GATE-05a`) và **phá khoá crypto-shred** (`GATE-05b`) — cả hai đều là thao tác của SRE/admin, và cả hai đều không có verb. Trỏ `GATE-04-r` tại [Risk-Register §4.2](../../010-Planning/Risk-Register.md).

---

## 11. Ba mục TBD

> **Trạng thái sau `GATE-05` — 2026-08-14: còn `1` trong `3`.** Tiêu đề *"Ba mục TBD"* và số thứ tự `11.a`/`11.b`/`11.c` **giữ nguyên** vì các tài liệu khác đã trích dẫn chúng theo số — đóng một mục nghĩa là **đổi trạng thái của mục đó**, không xoá mục và không đánh số lại (cùng nguyên tắc mà tài liệu này đã áp cho `THREAT-008` ở run trước).
>
> | Mục | Trước 2026-08-14 | Sau `GATE-05` |
> |---|---|---|
> | `11.a` — TTL mặc định (`SEC-022`) | `TBD` | **✅ CHỐT GATE-05a** — 30 ngày, `@TrisJr` |
> | `11.b` — row cap / byte cap (`SEC-008`) | `TBD` | **vẫn `TBD`** — chờ số liệu spike §22; spike **đã được bật** (`GATE-01`), ngưỡng **vẫn chưa có** |
> | `11.c` — crypto-shred (`SEC-016`) | `TBD` / `DEFER` | **✅ CHỐT GATE-05b** — `MUST-V0.1`, `@TrisJr`, kèm `GATE-05b-r` và `GATE-05b-r2` |

Ba mục dưới đây **cố ý không được điền tại thời điểm lập tài liệu**. Chúng là những chỗ mà tài liệu này có thể đưa ra một con số nghe hợp lý, và việc đó sẽ là bịa. Mỗi mục ghi rõ: **phần khẳng định được** và **phần cần ai quyết** — và với hai mục đã chốt, **ai đã quyết trên thực tế**, kể cả khi người đó khác với dòng *"Cần ai"* ghi ban đầu.

### 11.a — Giá trị TTL mặc định (`SEC-022`) · `✅ CHỐT GATE-05a — 2026-08-14`

> **Mapping tên gọi**: `GATE-01` = G1 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. Trong tài liệu **chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị `PRD-Repro.md §Goals` chiếm, `D1`/`D2` là quyết định của run trước.

**Đây là neo chính của `GATE-05a` trong tài liệu này.** Mục này **đã được điền** ngày 2026-08-14. Phần *"vì sao không khẳng định được"* bên dưới **giữ nguyên 100%** — nó là bằng chứng vì sao lens bảo mật đã từ chối tự chọn con số, không phải nội dung lỗi thời.

| | |
|---|---|
| **✅ Quyết định** | **TTL mặc định của capsule = `30 ngày`.** Đây là **giá trị mặc định khi không cấu hình**, không phải giới hạn cứng: TTL vẫn **cấu hình được** theo `FR-024`. Mệnh đề *"hệ thống từ chối TTL vô hạn"* của `SEC-022` **không đổi** — nay nó có thêm một giá trị mặc định để áp khi cấu hình vắng mặt. |
| **Ai quyết** | **`@TrisJr`** (chủ sản phẩm), ngày **2026-08-14**. Đóng `U-06b`. |
| **⚠ Quyết định này KHÔNG đi qua pháp chế** | Dòng *"Cần ai"* bên dưới ghi **PM + pháp chế**. Thực tế: **`@TrisJr` quyết một mình, không có pháp chế tham gia.** Đây là **rủi ro được chấp nhận có ý thức**, không phải sơ suất và cũng không phải một xác nhận pháp lý. Vế (2) của *"Vì sao không"* — nghĩa vụ pháp lý về thời gian lưu trữ tối đa theo từng loại dữ liệu và từng khu vực pháp lý — **vẫn chưa được ai kiểm**. Con số 30 ngày vì vậy là **quyết định sản phẩm**, không phải kết luận tuân thủ; mục 1.2 và mục 8 vẫn áp: tài liệu này không cấp trạng thái tuân thủ. Cùng rủi ro này được PM ghi ở [Charter-Repro §5](../../010-Planning/Charter-Repro.md). |
| **Khẳng định được** | TTL **phải là một giá trị hữu hạn**. Hệ thống phải **từ chối** cấu hình TTL vô hạn hoặc thiếu TTL. Điều này là kết luận chắc chắn từ mục 8.1 (nguyên tắc giới hạn lưu trữ) và `THREAT-016`. |
| **Không khẳng định được** *(giữ nguyên — bằng chứng tại thời điểm lập, trước gate)* | Giá trị cụ thể là bao nhiêu ngày. |
| **Vì sao không** *(giữ nguyên — đây là lý do lens bảo mật không tự chọn, và nay là lý do con số phải được rà lại khi có bối cảnh tổ chức)* | Con số này là **giao điểm của ba thứ mà lens bảo mật không có**: (1) chu kỳ debug thực tế của tổ chức — capsule phải sống đủ lâu để người ta kịp dùng, nếu không sản phẩm vô dụng; (2) nghĩa vụ pháp lý về thời gian lưu trữ tối đa cho từng loại dữ liệu và từng khu vực pháp lý; (3) chính sách nội bộ của tổ chức triển khai. Chọn một con số ở đây là chọn hộ cả ba. |
| **Cần ai** *(nguyên văn tại thời điểm lập)* | **PM** (chu kỳ debug thực tế) + **pháp chế** (nghĩa vụ lưu trữ). — **Đã quyết bởi `@TrisJr` ngày 2026-08-14, KHÔNG qua pháp chế** (xem dòng ⚠ trên). |
| **Hệ quả nếu chọn sai** *(giữ nguyên — nay là tiêu chí rà lại giá trị 30 ngày)* | Quá ngắn ⇒ capsule hết hạn trước khi developer kịp dùng ⇒ người dùng sẽ đòi kéo dài, rồi đòi bỏ TTL. Quá dài ⇒ cửa sổ phơi nhiễm mở rộng vô ích. Cả hai hướng đều dẫn ngược về mục 6.5: control gây ma sát sai sẽ bị vô hiệu hoá. |
| **Hệ quả bảo mật của quyết định** | Nhánh xấu *"mặc định trôi vào TTL vô hạn"* (mục 11.d) **đã bị chặn**. `THREAT-016` mất phần *"tồn tại vô thời hạn"*: đây là mitigation **vô điều kiện**, không phụ thuộc key custody — xem `THREAT-016` và callout ba con số ở mục 4.3. Phần *"không xoá được"* của `THREAT-016` do `GATE-05b` xử lý và **có điều kiện**. |

### 11.b — Ngưỡng row cap và byte cap (`SEC-008`)

| | |
|---|---|
| **Khẳng định được** | **Phải có** cả row cap và byte cap; vượt ngưỡng thì **cắt và đánh dấu**, không persist phần vượt và không âm thầm bỏ qua. |
| **Không khẳng định được** | Con số cụ thể của hai ngưỡng. |
| **Vì sao không** | Ngưỡng này là đánh đổi giữa **tỉ lệ replay thành công** (cắt quá sớm ⇒ thiếu dữ liệu ⇒ replay hỏng) và **overhead + kích thước capsule**. Không có dữ liệu nào để cân đánh đổi này — RQ.md tự nói cần một technical spike để đo `[stated §22, §23]`. **Bốn ngưỡng ở §24 không dùng được** cho việc này: chúng là mục tiêu của chính spike đó và RQ.md ghi rõ chúng là *"initial hypotheses, not final product commitments"* `[stated §24]` (mục 1.4). |
| **Cần ai** | Số liệu đo được từ **technical spike §22** — cụ thể là phân bố kích thước kết quả truy vấn và tỉ lệ replay thành công theo từng mức cắt. |
| **Trạng thái sau `GATE-01`** | **Spike đã được bật** — `GATE-01 = Go` ngày 2026-08-14, Phase 0 technical spike được coi là **điều kiện đầu tư**; `Sponsor` = `@TrisJr`, `Manager` = `@TrisJr` (xem [Roadmap](../../010-Planning/Roadmap.md) Phase 0 và [Charter-Repro §7](../../010-Planning/Charter-Repro.md)). **Mục 11.b vẫn `TBD`** — điều đổi là *lý do* chờ: từ *"chưa biết có chạy spike không"* sang *"đang chờ kết quả spike"*. |
| **⚠ `GATE-01-r`** | `Go` **không tự làm cho spike đo được**. `ACG-01`/`ACG-02`/`ACG-03`/`ACG-07` vẫn hở — không có denominator, không có định nghĩa *"reproduced"*, không có tiêu chí chọn test case, không có *Supported Execution Class*. Hệ quả trực tiếp lên tài liệu này: `SEC-008` **vẫn chưa có ngưỡng**, và một spike chạy mà không kết luận được pass/fail thì cũng không cấp được con số cho mục này. Định nghĩa rủi ro ở [Risk-Register §4.2](../../010-Planning/Risk-Register.md). |
| **Hệ quả nếu chọn sai** | Đặt bừa một con số rồi để nó thành mặc định vĩnh viễn là cách phổ biến nhất để một ngưỡng sai tồn tại nhiều năm. Ghi `TBD` và buộc spike trả lời là lựa chọn đúng hơn. |

### 11.c — Khoá giữ phía server (crypto-shred) hay replay offline? (`SEC-016`) · `✅ CHỐT GATE-05b — 2026-08-14`

> **Mapping tên gọi**: `GATE-01` = G1 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5. Trong tài liệu **chỉ dùng `GATE-0N`** — `G1`/`G2`/`G3` đã bị `PRD-Repro.md §Goals` chiếm, `D1`/`D2` là quyết định của run trước.

**Đây là neo chính của `GATE-05b` trong tài liệu này.** `SEC-016` rời `DEFER` sang **`MUST-V0.1`**. Phần *"vì sao không khẳng định được"* bên dưới **giữ nguyên 100%** — nó chính là bảng giá của quyết định, và cái giá đó nay **đã được trả có ý thức**, không phải bị bỏ qua.

| | |
|---|---|
| **✅ Quyết định** | **Crypto-shredding = ÁP DỤNG. `SEC-016` phân loại `MUST-V0.1`.** Khoá giữ **phía server** (Zone 2), không đi kèm capsule; **xoá khoá ⇒ capsule không giải được**. |
| **Ai quyết** | **`@TrisJr`** (chủ sản phẩm), ngày **2026-08-14**. Đóng `U-06c`. |
| **Lệch so với dòng *"Cần ai"*** | Dòng *"Cần ai"* bên dưới ghi **architect**. Thực tế **`@TrisJr` quyết**; hệ quả kiến trúc phải được ghi lại ở [ADR-002](../Architecture/ADR-002-Repro-Capsule-Format-Contract.md) (capsule self-contained) và [ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md) (`D5`, key custody) — hai file này do lượt `architect` của cùng run cập nhật, **không** thuộc tài liệu này. Cho tới khi hai ADR đó phản ánh xong, trạng thái *"đã chốt"* chỉ đứng vững ở tầng requirement, chưa ở tầng ADR. |
| **Khẳng định được** | Crypto-shredding là **cơ chế duy nhất được biết** biến `TB-4` từ bất khả hồi thành khả hồi, và là cơ chế duy nhất làm cho quyền xoá dữ liệu có hiệu lực thật trên các bản copy (mục 8.1.2). Điều này là kết luận kỹ thuật, không phải sở thích. |
| **Không khẳng định được** *(nguyên văn tại thời điểm lập)* | Rằng nên chọn nó. — **Nay đã có người chọn: `@TrisJr`.** Lens bảo mật vẫn **không** tự khẳng định điều này; nó ghi lại rằng chủ sản phẩm đã khẳng định. |
| **Vì sao không** *(giữ nguyên 100% — đây là cái giá đã được chấp nhận, không phải phản đối bị gạt bỏ)* | Vì cái giá là **mất replay offline** — và replay offline có thể là điều kiện cần của trải nghiệm sản phẩm. §33 đặt "Developer-first" và CLI tối giản làm nguyên tắc `[stated §33]`; §20.14 xếp adoption là rủi ro Critical `[stated §20.14]`. Một sản phẩm debug mà không chạy được khi mất mạng, hoặc không chạy được khi chính hệ thống Repro đang có sự cố, là một đánh đổi lớn về sản phẩm. Thêm nữa nó làm bản self-host phức tạp hơn hẳn (vận hành key store, sao lưu key, và nghịch lý ở mục 8.1.2). |
| **Cần ai** *(nguyên văn tại thời điểm lập)* | **Architect** — đây là quyết định kiến trúc có hệ quả bảo mật, không phải quyết định bảo mật có hệ quả kiến trúc. Cần được ghi thành ADR với đầy đủ hệ quả. |
| **Trạng thái** | `SEC-016` = **`MUST-V0.1`** — `✅ CHỐT GATE-05b — 2026-08-14`, quyết bởi `@TrisJr`. Nhãn `[cần validate]` **được gỡ**: đánh đổi đã được cân và chọn. **Mệnh đề vẫn đúng và phải giữ**: `RQ.md` **không nhắc tới crypto-shredding ở bất kỳ đâu** `[GAP]` — đó là sự thật về `RQ.md`, không phải trạng thái quyết định; mitigation này đến từ **quyết định sản phẩm**, không từ tài liệu nguồn. **Quyết định `D2` (mục 10) vẫn KHÔNG chạm tới mục này** — `D2` chỉ chốt authn + authz + audit; thứ chốt `SEC-016` là `GATE-05b`, một quyết định khác, ngày khác trong cùng ngày ghi nhận. |
| **Ràng buộc thời điểm — đã chốt ĐÚNG LÚC** | Quyết định **ràng buộc capsule format** (capsule mã hoá bằng khoá riêng có cấu trúc manifest khác) ⇒ phải chốt **trước khi** capsule format v1 đóng băng. **Điều kiện này được thoả**: dự án đang ở `Status: Concept`, `src/` rỗng, capsule format v1 **chưa đóng băng** và `ADR-002` vẫn đang được sửa trong cùng run. Không có capsule nào đã được tạo để bị phá vỡ. Cùng tính chất với `THREAT-006` đường 2 — mục đó **vẫn chưa** được chốt. |
| **⚠ `GATE-05b-r` — hệ quả được chấp nhận có ý thức** | *"Replay không cần kết nối mạng"* **thôi là bất biến**. `SEC-016 = MUST-V0.1` va trực tiếp vào `ADR-002` (capsule self-contained), `SDD:1145`, và nguyên tắc §33.6 *Safe by default* `[stated §33]`. Đây **không** phải phát hiện muộn — nó là chính cái giá ở dòng *"Vì sao không"*, được nêu trước khi quyết và vẫn được chọn. Định nghĩa đầy đủ ở [Risk-Register §4.2](../../010-Planning/Risk-Register.md). |
| **⚠ `GATE-05b-r2` — `U-06d` (key custody) từ open item phụ THÀNH BLOCKER** | Không có key management thì crypto-shredding **không thực thi được**: quyết định `MUST-V0.1` chỉ có giá trị khi có **nơi giữ khoá và cơ chế xoá khoá**. Mọi chỗ trong tài liệu này nói *"crypto-shred làm bản copy khả hồi"* đều mang điều kiện này — xem `THREAT-016`, `THREAT-007`, `THREAT-011`, mục 3.5, mục 8.1.2. `U-06d` sống ở [ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md) `Open items`; định nghĩa rủi ro ở [Risk-Register §4.2](../../010-Planning/Risk-Register.md). Nghịch lý sao lưu khoá (mục 8.1.2) nay là một hạng mục thiết kế **bắt buộc**, không còn là ghi chú. |

### 11.d — Ghi chú: ba mục này khác nhau về bản chất

| Mục | Loại chưa biết | Giải bằng cách nào |
|---|---|---|
| 11.a | Chưa biết **bối cảnh** | Hỏi PM và pháp chế — **đã quyết bởi `@TrisJr` (không qua pháp chế), `GATE-05a`** |
| 11.b | Chưa biết **dữ kiện** | Đo bằng spike §22 — **spike đã bật (`GATE-01`), dữ kiện vẫn chưa có** |
| 11.c | Chưa có **quyết định** | Architect cân đánh đổi và ghi ADR — **đã quyết bởi `@TrisJr`, `GATE-05b`**; phần *ghi ADR* thuộc `ADR-002`/`ADR-009` |

Phân biệt này quan trọng cho close-step: 11.b sẽ tự giải khi spike chạy; 11.a và 11.c **không tự giải** — chúng cần có người quyết, và nếu không ai quyết thì chúng sẽ mặc định trôi vào trạng thái xấu (TTL vô hạn, không có crypto-shred).

> **✅ Đã có người quyết — 2026-08-14. Cả hai nhánh xấu đã bị chặn.** `@TrisJr` quyết cả hai mục: `11.a` → TTL mặc định **30 ngày** (`GATE-05a`) chặn nhánh *TTL vô hạn*; `11.c` → `SEC-016` **`MUST-V0.1`** (`GATE-05b`) chặn nhánh *không có crypto-shred*. Câu trên **vẫn được giữ nguyên** vì nó đúng về bản chất hai mục này (chúng không tự giải, chúng cần người quyết) — và nó là lý do vì sao việc có người quyết là điều kiện, không phải thủ tục.
>
> **Điều KHÔNG được đọc thành "đã xong"**: `11.b` vẫn `TBD` (`GATE-01-r`); `GATE-05b` mở ra `GATE-05b-r2` — **`U-06d` key custody nay là blocker**, và nhánh xấu *"không có crypto-shred"* bị chặn ở tầng **quyết định**, chưa ở tầng **thực thi**. Không có nơi giữ và xoá khoá thì `SEC-016` là một `MUST-V0.1` chưa thực thi được.

---

## 12. Related Documents

### 12.1 Tài liệu liên quan trong repo

| Tài liệu | Đường dẫn | Quan hệ |
|---|---|---|
| SDD — Repro | [SDD-Repro](../Architecture/SDD-Repro.md) | §7 Security & Compliance của SDD tham chiếu tài liệu này thay vì lặp lại 43 requirement; trust boundary ở mục 3 là đầu vào cho §7.1 |
| ADR-002 — Capsule Format Contract | [ADR-002](../Architecture/ADR-002-Repro-Capsule-Format-Contract.md) | Ràng buộc từ tài liệu này lên capsule format: chỗ chứa digest/signature trong manifest v1 (`SEC-027`), `redaction_applied[]` (`SEC-047`), `data_classification` (`SEC-024`), fingerprint config (`SEC-010`), và hệ quả của `THREAT-006` đường 2 + `SEC-016`. **Sau `GATE-05b` (2026-08-14)**: ràng buộc từ `SEC-016` **không còn là đề xuất** — capsule mã hoá bằng khoá riêng giữ ở Zone 2 là `MUST-V0.1`, và nó **va vào tiền đề capsule self-contained** của ADR này (`GATE-05b-r`). Quyết định được chốt **trước khi** capsule format v1 đóng băng — mục 11.c |
| ADR-009 — Open items `U-06b` / `U-06c` / `U-06d` | [ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md) | `U-06b` **đóng** (TTL = 30 ngày, `GATE-05a`) · `U-06c` **đóng** (crypto-shred áp dụng, `GATE-05b`) · ⚠ **`U-06d` (key custody) nay là BLOCKER** — `GATE-05b-r2`: không có nơi giữ và xoá khoá thì `SEC-016` không thực thi được. Sàn Capsule Store của `GATE-04` cũng sống ở ADR này |
| ADR-005 — Default-Deny Write & Side Effects | [ADR-005](../Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) | `THREAT-018`, `SEC-032`, `SEC-033` — cơ chế phân loại READ/WRITE phải fail-closed |
| ADR-009 — Private / Self-Hosted Topology | [ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md) | Mục 8.5 (đáp án §38 Q12) là đầu vào cho phần Context: lập luận compliance mạnh hơn lập luận bảo mật của §20.6 |
| Risk Register | [Risk-Register](../../010-Planning/Risk-Register.md) | 11 threat không có mitigation **trong RQ.md** là **risk mới**, không nằm trong §20/§21. Sau quyết định `D2` (2026-08-14): con số **11 giữ nguyên** (nó đo RQ.md), nhưng số threat **không có mitigation từ bất kỳ nguồn nào** là **10** — `THREAT-008` đã rời nhóm đó. **Sau `GATE-05a`/`GATE-05b` (2026-08-14): con số dẫn xuất là `9`** — `THREAT-016` rời nhóm; `THREAT-007` và `THREAT-011` **ở lại** vì mitigation duy nhất của chúng treo trên key custody `U-06d`. Xem callout ba con số ở 4.3 và bảng 4.5. `§4.2` của Risk Register giữ định nghĩa `GATE-01-r`, `GATE-04-r`, `GATE-05b-r`, `GATE-05b-r2` mà tài liệu này trỏ tới |
| NFR — Repro | [NFR-Repro](../../020-Requirements/NFR-Repro.md) | Chi tiết bảo mật nằm ở tài liệu này; NFR tham chiếu, không lặp lại |
| PRD — Repro | [PRD-Repro](../../020-Requirements/PRD-Repro.md) | Mục 5 của PRD nêu bốn thay đổi mặc định (9.2) và `M2`, link về đây cho chi tiết |
| Analysis — Target Users | [Analysis-Target-Users](../../050-Research/Analysis-Target-Users.md) | §4.1 định nghĩa `GAP-04` (SRE không có CLI verb nào của §18). Sau `D2`, `GAP-04` là hệ quả còn lại của `THREAT-008` — xem cuối mục 10 |

> Các tài liệu trên đang được viết song song trong cùng run và **có thể chưa tồn tại** tại thời điểm đọc.

### 12.2 Nguồn sự thật

| Nguồn | Vai trò |
|---|---|
| `docs/999-Resources/RQ.md` — Repro Product Proposal, `Status: Concept`, 1995 dòng | **Nguồn sự thật duy nhất.** Mọi khẳng định về sản phẩm trong tài liệu này đều gắn nhãn `[stated §N]`, `[inferred §N]` hoặc `[GAP]` theo quy ước mục 1.5 |

Section của RQ.md được trích dẫn trong tài liệu này: §1, §6, §7, §8, §9, §10, §11, §12, §13, §14, §15, §16, §17, §18, §20.3, §20.4, §20.5, §20.6, §20.7, §20.8, §20.9, §20.12, §20.14, §20.16, §20.17, §21, §22, §23, §24, §25, §26, §28, §31, §32, §33, §35, §38.

### 12.3 Trạng thái và giới hạn của tài liệu này

| | |
|---|---|
| **Trạng thái** | `draft` — chưa được ai duyệt |
| **Loại** | Threat model của **một thiết kế**. `src/` rỗng; không có code nào được audit |
| **Không cấp** | Trạng thái tuân thủ cho bất kỳ tổ chức nào; kết luận pháp lý; điểm CVSS |
| **Cần xác nhận** | Toàn bộ mục 8 cần **pháp chế**; phạm vi PCI DSS cần **QSA**. Mục 10 (`M2`) **đã được chủ sản phẩm chốt 2026-08-14** — không còn chờ ai. **Cập nhật sau `GATE-05` — 2026-08-14**: mục **11.a** *(từng ghi: cần PM + pháp chế)* → **đã quyết bởi `@TrisJr`, KHÔNG qua pháp chế** ⇒ con số 30 ngày là quyết định sản phẩm, **phần nghĩa vụ pháp lý vẫn chưa được ai kiểm**; mục **11.c** *(từng ghi: cần architect)* → **đã quyết bởi `@TrisJr`**, phần *ghi thành ADR* thuộc `ADR-002`/`ADR-009`; mục **11.b** vẫn cần **số liệu spike §22** — spike đã được bật (`GATE-01`) nhưng `ACG-01`/`02`/`03`/`07` chưa cho phép kết luận pass/fail (`GATE-01-r`) |
| **Còn mở sau 2026-08-14** | **Ba mục `TBD` của mục 11 nay còn `1`**: chỉ `11.b` (row cap / byte cap của `SEC-008`) — và nó **tự giải khi spike chạy và cấp được số liệu**. `11.a` và `11.c` đã chốt. **Còn mở, không liên quan tới mục 11**: `GAP-04` (giao diện vận hành authz/audit/retention — cuối mục 10) cần **quyết định phạm vi sản phẩm**, `GATE-04` **không** đóng nó · **cơ chế** authn/authz của Capsule Store vẫn `TBD` (`GATE-04-r`) · **`U-06d` key custody — blocker** của `SEC-016` (`GATE-05b-r2`) · `SEC-025` và `SEC-039` giữ `DEFER` · `Enterprise security` §28 vẫn chưa được quyết định nào phán xử · `THREAT-006` đường 2 (ràng buộc capsule format cho regression test) vẫn chờ `ADR-002` · **9 threat** vẫn không có mitigation từ bất kỳ nguồn nào (4.3) |
| **Cần làm lại khi** | Có implementation — lúc đó threat model phải được kiểm chứng lại trên code thật, và CVSS mới có ý nghĩa để gán |







