---
id: SPEC-SEC-002
type: security-spec
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "./Spec-Security-Repro-Threat-Model.md"
---

# 📜 Hồ Sơ Giải Trình Pháp Lý: Cơ Chế Crypto-Shredding & Thời Hạn Lưu Trữ Dữ Liệu (TTL 30 Ngày)

## 1. Mục Đích & Bối Cảnh Giải Trình

Tài liệu này là **Hồ sơ Giải trình Kỹ thuật (Technical Briefing Dossier)** do đội ngũ Kiến trúc & An ninh Repro soạn thảo nhằm phục vụ công tác rà soát pháp lý độc lập bởi **Luật sư / Chuyên gia Pháp chế ngoài** ([Charter §5.1 Cảnh báo #2](../../010-Planning/Charter-Repro.md) / [Timeline-Repro §6.1](../../010-Planning/Estimates/Timeline-Repro.md) — Task `LG3`).

### Bối Cảnh Vận Hành
Repro là một công cụ mã nguồn mở hỗ trợ lập trình viên tái hiện lỗi sản thi (Production Bug Capture & Local Replay). Do bản chất của phần mềm là ghi lại một phần ngữ cảnh thực thi lỗi (HTTP headers/body, database query results) tại môi trường production và lưu trữ dưới dạng **Repro Capsule**, hệ thống có khả năng tiếp xúc với dữ liệu cá nhân (Personal Data) của công dân EU (chịu sự điều chỉnh của **GDPR**) hoặc công dân California (chịu sự điều chỉnh của **CCPA/CPRA**).

Hồ sơ này giải trình chi tiết hai cơ chế bảo vệ cốt lõi của Repro V0.1:
1. **Chính sách lưu trữ có thời hạn mặc định TTL 30 ngày** (`GATE-05a` / `FR-024` / `SEC-022`).
2. **Giao thức huỷ dữ liệu vĩnh viễn bằng Crypto-Shredding** (`GATE-05b` / `SEC-016` / [ADR-012](../Architecture/ADR-012-Key-Custody.md)).

---

## 2. Mô Hình Kỹ Thuật: Envelope Encryption & Crypto-Shredding Protocol

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CRYPTO-SHREDDING ARCHITECTURAL LIFECYCLE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 1. CAPTURE & ENCRYPTION (Production Node):                                  │
│    • Ephemeral Data Encryption Key (DEK) được sinh bằng CSPRNG 256-bit.     │
│    • Capsule Payload được mã hoá chuẩn AES-256-GCM (Auth Tag 128-bit).      │
│    • DEK được mã hoá bởi Master KEK và gửi về Private Key Custody Store.     │
│    • DEK plaintext lập tức bị xoá sạch khỏi bộ nhớ RAM (Zeroized).          │
│                                                                             │
│ 2. STORAGE & REPLICATION (Storage Tier):                                    │
│    • File vật lý `.repro.tar.gz` chỉ chứa ciphertext và mã định danh        │
│      `key_id` (tham chiếu tới Key Custody Store), TUYỆT ĐỐI KHÔNG CHỨA KHOÁ.│
│    • File capsule có thể được nhân bản qua N máy developer hoặc CI runner.  │
│                                                                             │
│ 3. SHREDDING STAGE (Kích hoạt Huỷ Dữ liệu):                                │
│    • Khi hết hạn TTL 30 ngày hoặc khi nhận yêu cầu GDPR Right-to-Erasure:   │
│      Lệnh `repro purge --capsule-id=<id>` được kích hoạt.                   │
│    • Key Custody Store ghi đè bộ nhớ DEK bằng bytes ngẫu nhiên và xoá       │
│      bản ghi khoá khỏi cơ sở dữ liệu.                                       │
│    • Toàn bộ N+1 bản sao capsule phân tán vật lý ngay lập tức trở thành     │
│      chuỗi bit ngẫu nhiên vô phương giải mã toán học.                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Các Câu Hỏi Trọng Tâm Trình Luật Sư / Pháp Chế Bên Ngoài

### ❓ Câu Hỏi 1: Tính Hợp Lệ Của Crypto-Shredding Đối Với GDPR Article 17 (Right-to-Erasure)
- **Vấn đề**: Khi một chủ thể dữ liệu (Data Subject) yêu cầu xoá thông tin cá nhân của họ theo Điều 17 GDPR, nhưng dữ liệu đó đã nằm trong một số file capsule nén được lưu trữ phân tán trên máy trạm của lập trình viên (`TB-4`):
- **Cơ sở kỹ thuật**: Việc xoá hoàn toàn khoá DEK tại Key Custody Store tập trung khiến toàn bộ ciphertext không thể phục hồi (tương đương với việc tiêu huỷ vật lý về mặt toán học theo tiêu chuẩn NIST SP 800-88 Rev 1 Cryptographic Erase).
- **Yêu cầu tư vấn**: Cơ chế Crypto-shredding này có được các cơ quan giám sát bảo vệ dữ liệu EU (DPAs) chấp thuận là hình thức tuân thủ hợp lệ của nghĩa vụ *"Erasure without undue delay"* mà không bắt buộc phải truy vết và xoá vật lý từng file rác đã mã hoá trên từng máy trạm không?

### ❓ Câu Hỏi 2: Tính Hợp Lý Của Thời Hạn Lưu Trữ Mặc Định TTL 30 Ngày (Storage Limitation Principle — Art 5(1)(e))
- **Vấn đề**: Repro thiết lập thời hạn lưu trữ mặc định cho mọi capsule là **30 ngày** (hết 30 ngày khoá DEK tự động huỷ vĩnh viễn, `SEC-022`).
- **Cơ sở kỹ thuật**: Chu kỳ sprint trung bình của đội ngũ kỹ thuật là 2 tuần, thời gian 30 ngày là thời lượng tối thiểu cần thiết để developer tải capsule, phân tích nguyên nhân gốc, sửa mã nguồn và verify fix.
- **Yêu cầu tư vấn**: Con số 30 ngày có thoả mãn nguyên tắc *Cân xứng và Tối thiểu hoá thời gian lưu trữ (Proportionality & Storage Limitation)* trong bối cảnh dữ liệu phục vụ mục đích duy nhất là chẩn đoán sự cố phần mềm không?

### ❓ Câu Hỏi 3: Ranh Giới Trách Nhiệm Dữ Liệu Khi Di Chuyển Qua Máy Trạm (`TB-4`)
- **Vấn đề**: Khi lập trình viên thực hiện lệnh `repro pull` để tải capsule về laptop cá nhân phục vụ debug:
- **Cơ sở kỹ thuật**: Quá trình giải mã chỉ diễn ra trong bộ nhớ tạm (in-memory) trong phiên replay và được bảo vệ bằng kiểm soát truy cập RBAC / Token.
- **Yêu cầu tư vấn**: Tổ chức triển khai Repro (Data Controller) cần ban hành những quy định nội bộ nào (Security Policies / BYOD Policy) đối với lập trình viên để đảm bảo duy trì tính bảo mật theo Điều 32 GDPR?

---

## 4. Biện Pháp Kỹ Thuật & Tổ Chức Bổ Trợ (TOMs — Technical & Organizational Measures)

Bên cạnh Crypto-shredding và TTL, Repro V0.1 tích hợp sẵn 5 tầng bảo vệ bổ trợ:
1. **Redaction Stage (`TB-2`)**: Tự động khử toàn bộ Passwords, Auth Tokens, Credit Cards, và ẩn danh hoá PII dạng email/tên theo cơ chế Format-Preserving ([Spec-Security-Repro-Threat-Model §5](./Spec-Security-Repro-Threat-Model.md)).
2. **Private Self-Hosted Architecture ([ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md))**: 100% dữ liệu lưu trữ bên trong hạ tầng của chính doanh nghiệp, không gửi dữ liệu ra public SaaS của bên thứ ba, tránh phát sinh vấn đề Chuyển giao Dữ liệu Xuyên biên giới (Cross-Border Data Transfer / Schrems II).
3. **Digest-Before-Parse Integrity Check ($SEC\text{-}027$)**: Kiểm tra mã HMAC-SHA256 trước khi giải mã để ngăn chặn sửa đổi trái phép.
4. **L2 Container Sandbox ($THREAT\text{-}018$)**: Cô lập hoàn toàn tiến trình replay, ngăn chặn rò rỉ dữ liệu qua mạng hoặc subprocess (`escaped_side_effects == 0`).
5. **Append-Only Immutable Audit Log**: Ghi nhận toàn bộ nhật ký ai đã pull, inspect, replay hoặc purge capsule nào để phục vụ nghĩa vụ Trách nhiệm giải trình (Accountability Principle — Art 5(2)).

---

## 5. Kế Hoạch Làm Việc Với Luật Sư Ngoài (Action Plan)

1. **Gửi hồ sơ**: Chuyển giao toàn văn tài liệu này kèm [ADR-012](../Architecture/ADR-012-Key-Custody.md) và [Spec-Security-Repro-Threat-Model](./Spec-Security-Repro-Threat-Model.md) cho công ty luật chuyên về Data Privacy / GDPR.
2. **Thời gian rà soát**: Dự kiến $2\text{–}6$ tuần (chạy song song trong suốt Phase P2).
3. **Kết quả đầu ra**: Ý kiến Pháp lý bằng văn bản (Legal Memorandum) phê chuẩn cơ chế Crypto-shredding và các điều khoản hướng dẫn trong DPA Template ([Spec-Security-Data-Processing-Agreement.md](./Spec-Security-Data-Processing-Agreement.md)).

---

## 6. Liên Kết Liên Quan

- [ADR-012 — Key Custody Architecture](../Architecture/ADR-012-Key-Custody.md)
- [Spec-Security-Data-Processing-Agreement](./Spec-Security-Data-Processing-Agreement.md)
- [Spec-Security-Repro-Threat-Model](./Spec-Security-Repro-Threat-Model.md)
- [NFR-Repro](../../020-Requirements/NFR-Repro.md)
