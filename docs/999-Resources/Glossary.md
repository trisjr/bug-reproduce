---
id: GLOSSARY-001
type: glossary
status: live
created: 2026-02-04
updated: 2026-08-14
---

# Glossary (Từ điển Thuật ngữ)

## Repro — từ vựng sản phẩm

> **Nguồn**: [RQ.md](./RQ.md). Mỗi mục ghi section nguồn. Thuật ngữ nào `RQ.md` **dùng nhưng không định nghĩa** đều được đánh dấu rõ — đó là nợ định nghĩa thật, không phải chỗ để suy đoán.

- **Repro Capsule** *(§6, §40)*: Artifact **portable** đóng gói một execution đã được capture ở production — request gốc, kết quả database query liên quan, external API response, feature flag state, environment metadata, timestamp, application version, Git commit, runtime information. Nguyên tắc bất biến: capsule chứa **chỉ thông tin cần thiết để tái hiện execution**, **không** phải bản sao của môi trường production.
- **Capture** *(§5, §18, §20.7)*: Hành vi ghi lại các external input của một execution ở production. Ở V0.1, capture là **async, bounded, có sampling và trigger theo failure**.
- **Execution Replay** *(§5, §8)*: Chạy lại một execution trên code local bằng cách cấp cho ứng dụng **đúng những input mà production đã nhận**, thay vì tái dựng môi trường production. Ứng dụng local không chạy *bên trong* production — nó chỉ *nhận lại* input.
- **Execution Diff** *(§9, §18)*: Kết quả hạng nhất của một reproduction **thất bại** — bảng đối chiếu từng điểm mà execution ở production và ở local phân kỳ (đánh số divergence, nhóm theo loại input, trình bày theo cặp Production/Local). Đây là lý do Repro vẫn tạo ra giá trị ngay cả khi bug không tái hiện được.
- **Execution Verification** *(§10, §18, §20.3)*: Cơ chế xác định replay có **tương đương** hay không, thay vì chỉ xác định replay có **chạy xong** hay không. Phân biệt hai trạng thái: *"Replay completed"* và *"Execution matched"*.
- **Execution matched** *(§10)*: Trạng thái khi execution ở local được coi là tương đương với execution ở production. **Đây là chỉ số thành công chính thức của V0.1** (quyết định 2026-08-14) — phân biệt rạch ròi với *"Replay completed"*, vốn chỉ nói replay chạy xong chứ không nói nó đi đúng đường.
- **Execution diverged** *(§9, §10)*: Trạng thái khi execution ở local đi theo đường khác với production. Không phải lỗi của người dùng — đây là đầu vào của Execution Diff.
- **Divergence** *(§9)*: Một điểm phân kỳ cụ thể giữa execution ở production và ở local — ví dụ `Production → coupon = null` so với `Local → coupon = { discount: 10 }`. Execution Diff trình bày các divergence đã **đánh số** và **nhóm theo loại input**. Phân biệt: *divergence* (số ít, một điểm khác biệt) là đơn vị cấu thành; *Execution diverged* là **trạng thái** của cả lần replay.
- **Sufficiently equivalent** *(§10)* — ⚠ **`RQ.md` dùng thuật ngữ này làm tiêu chí trung tâm của Execution Verification nhưng KHÔNG định nghĩa nó.** Ký hiệu `A → B → C` được dùng mà không nói A/B/C là gì (function call? code line? span?), không nói so bao nhiêu field, không nói exact hay tolerant. Là nợ định nghĩa lớn nhất của tài liệu gốc — theo dõi ở [NFR-Repro §7](../020-Requirements/NFR-Repro.md) (`ACG-01`) và [SDD-Repro §8.3](../030-Specs/Architecture/SDD-Repro.md) (`U-04`).
- **Execution path** *(§10)* — ⚠ Cùng tình trạng với *sufficiently equivalent*: được dùng như đơn vị so sánh của verification nhưng chưa được định nghĩa bằng cái gì đo được.
- **Recorder** *(§17, §20.6)*: Thành phần chạy **phía production** (in-process, qua SDK) làm nhiệm vụ intercept và ghi lại các external input, rồi tạo capsule.
- **Replay Runtime** *(§17)*: Thành phần chạy **phía local**, nạp capsule và cấp lại các recorded input cho ứng dụng của developer.
- **Replay Layer** *(§11)*: Lớp đứng giữa ứng dụng local và dependency thật, trả về **recorded result** thay vì gọi hệ thống thật.
- **Verification Engine** *(tên component — [SDD §3.9](../030-Specs/Architecture/SDD-Repro.md))*: Thành phần thực hiện Execution Verification — so execution ở local với execution đã ghi và quyết định *"Execution matched"* hay *"Execution diverged"*. ⚠ Tiêu chí so sánh của nó chính là chỗ nợ định nghĩa lớn nhất (`U-04`).
- **Diff Engine** *(tên component — [SDD §3.10](../030-Specs/Architecture/SDD-Repro.md))*: Thành phần sinh ra Execution Diff khi replay phân kỳ. Là một **execution mode riêng**, không phải cách trình bày kết quả của Verification Engine — xem [ADR-011](../030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md).
- **Replay Boundary** *(§14, §20.11)*: Ranh giới phân định cái gì được replay từ bản ghi và cái gì thực sự chạy. Ở V0.1, replay boundary **trùng với service boundary** của service đang được điều tra: service đó chạy code local thật, mọi dependency được replay từ recorded response.
- **Default-deny write** *(§13, §20.4, §33.6)*: Cơ chế an toàn lõi — trong lúc replay, mọi thao tác ghi (INSERT/UPDATE/DELETE, POST payment, publish event, gửi email, tạo shipment, gọi webhook) **không được thực thi** vào hệ thống thật; thay vào đó trả về recorded result.
- **Drift** *(§20.8, §20.9, §20.10)*: Sai lệch giữa production và local. Ba loại được đặt tên riêng: **Version drift** (Git commit / runtime / dependency / OS / database version — §20.8), **Schema drift** (phiên bản schema hoặc migration của database — §20.9), **External dependency drift** (external service đổi hành vi giữa lúc capture và lúc replay — §20.10).
- **Code mismatch** *(§15)*: Trường hợp riêng của version drift — commit ở production khác commit local. Repro cảnh báo `Replay may not be deterministic` thay vì im lặng chạy tiếp.
- **Supported Execution Class** *(§20.1)* — ⚠ **Thuật ngữ mà `RQ.md` HÀM Ý nhưng chưa bao giờ định nghĩa.** §20.1 đặt mitigation là *"Limit the MVP to a clearly defined class of deterministic request/response executions"* — nhưng "clearly defined class" đó không tồn tại ở đâu trong tài liệu. Không có nó thì denominator của ngưỡng `≥80%` (§24) không xác định được. Theo dõi ở [NFR-Repro §7](../020-Requirements/NFR-Repro.md) (`ACG-07`).
- **Hidden input** *(§20.1)*: Các nguồn đầu vào mà một execution phụ thuộc nhưng Repro **không** capture ở V0.1 — environment variable, filesystem state, randomness, system clock, process state, concurrency, network behavior, OS behavior, background job.
- **Redaction** *(§16, §20.5)*: Quá trình loại bỏ hoặc thay thế dữ liệu nhạy cảm **trước khi** nó được ghi vào capsule. Xem thêm: [threat model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) — redaction là **hygiene control**, không phải containment boundary.
- **PII Anonymization** *(§16)*: Thay giá trị định danh cá nhân bằng giá trị giữ nguyên hình dạng nhưng không truy ngược được (ví dụ `john@example.com` → `user-1842@example.test`).
- **Crypto-shredding** — ⚠ **Không có trong `RQ.md`**; là cơ chế do lens bảo mật đề xuất: mã hoá mỗi capsule bằng một key riêng giữ phía server, nên **xoá key = vô hiệu hoá mọi bản copy** của capsule đó. Được ghi lại như **đề xuất cần validate** (đánh đổi: mất khả năng replay offline), không phải quyết định đã chốt.
- **Self-hosting** *(§16, §20.6, §28)*: Khả năng tổ chức chạy toàn bộ Repro bên trong hạ tầng của chính mình, thay vì gửi dữ liệu production lên một SaaS bên thứ ba.
- **OSS core** *(§28, + quyết định 2026-08-14)*: Phần mã nguồn mở của Repro. Theo §28 gồm SDK, Recorder, Replay Runtime, Capsule Format, CLI và Basic Self-hosting — **cộng thêm authentication, authorization (access control) và audit log** theo quyết định ngày 2026-08-14, vốn **ghi đè** phần §28 xếp Access control và Retention policies vào commercial layer. Lý do: thiếu authz thì bản self-host là bản *ai đăng nhập cũng đọc được mọi capsule production*; thiếu audit thì tổ chức kiểm soát được nhưng không chứng minh được. Xem [Risk-Register §4.1](../010-Planning/Risk-Register.md).
- **Commercial layer** *(§28)*: Phần thương mại, sau quyết định 2026-08-14 còn lại: Hosted storage, Team management, Analytics, AI analysis, Cloud integrations.
- **Capsule Store** *(hàm ý ở §8, §17, §18, §20.6)* — ⚠ Nơi capsule được lưu và là nguồn của `repro pull` / `repro list`. `RQ.md` **không có một dòng đặc tả nào** cho nó: không API, không auth, không storage backend, không mô hình triển khai. Theo dõi ở [SDD-Repro §3.6](../030-Specs/Architecture/SDD-Repro.md) (`U-06`) và [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md).
- **Technical Spike** *(§22, §39)*: Giai đoạn trước MVP, tồn tại **chỉ để** trả lời câu hỏi *"có capture và replay một cách xác định được không?"*. §22 nói rõ mục tiêu của spike **không phải** là xây sản phẩm.
- **North Star Metric** *(§31)*: *Số production bug được chuyển thành deterministic local test case.* Là metric **dài hạn**, **kích hoạt từ V0.2** — vì nó neo vào regression test generation, thứ §26 đặt ở V0.2. Quyết định ngày 2026-08-14, xem [Risk-Register §4.1](../010-Planning/Risk-Register.md).
- **Chỉ số thành công của V0.1** *(quyết định 2026-08-14)*: **số bug đạt trạng thái *Execution matched***. Đây là trạng thái mạnh nhất mà V0.1 tự sinh ra được, và là chỉ số trực tiếp chống risk Critical §20.3. ⚠ Nó được đo bởi `N-05` (Execution Match Rate, §23) — mà §24 **không đặt ngưỡng** cho `N-05`, nên chỉ số này hiện **chưa có tiêu chí pass/fail**. Xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md).

## Từ vựng cũ (không liên quan Repro)

> Giữ lại để không phá vỡ tham chiếu cũ. Ba mục dưới đây thuộc một dự án khác.

- **OTP (One-Time Password)**: Mật khẩu sử dụng một lần để xác thực người dùng.
- **OTP Expiry**: Thời gian hết hạn của mã OTP kể từ khi được tạo.
- **Rate Limit**: Cơ chế giới hạn số lượng yêu cầu (ví dụ: gửi OTP) trong một khoảng thời gian nhất định để bảo mật.
