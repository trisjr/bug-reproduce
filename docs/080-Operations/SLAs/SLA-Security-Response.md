---
id: SLA-SEC-001
type: sla
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Operations-MOC.md"
---

# 🛡️ Service Level Agreement — Security Vulnerability Response

## 1. Overview & Scope

Tài liệu này xác lập Cam kết Mức Dịch vụ (SLA) về thời gian phản hồi, phân loại, vá lỗi và công bố có trách nhiệm đối với toàn bộ các lỗ hổng an ninh được báo cáo đối với `@repro/node` SDK, `@repro/cli`, và hệ sinh thái Repro.

Do `@repro/node` chạy **in-process trên môi trường production của người dùng**, mọi sự cố liên quan đến an toàn dữ liệu, rò rỉ side-effect hoặc bypass redaction đều được xử lý với mức độ ưu tiên tối cao.

---

## 2. Bảng Phân Loại Mức Độ Nghiêm Trọng & SLA Phản Hồi

| Mức Độ Ưu Tiên | Phân Loại Lỗ Hổng Điển Hình | Thời Gian Phản Hồi Ban Đầu | Thời Gian Triển Khai Bản Vá (Patch SLA) | Thời Gian Công Bố CVE / Advisory |
|---|---|:---:|:---:|:---:|
| 🔴 **P0 (Critical)** | Bypass Redaction lộ PII/Credentials; Rò rỉ Side-Effect Write ra Production thật (`escaped_side_effects > 0`); Thực thi mã từ xa (RCE) qua Capsule Archive. | **$< 24$ giờ** | **$< 72$ giờ** (Hotfix Release) | Ngay sau khi phát hành bản vá |
| 🟠 **P1 (High)** | Lỗi giải mã Key Custody không phân quyền (RBAC bypass); DoS làm crash ứng dụng production; Bỏ qua kiểm tra toàn vẹn HMAC payload ($SEC\text{-}027$). | **$< 48$ giờ** | **$< 7$ ngày** | Trong vòng 14 ngày |
| 🟡 **P2 (Medium)** | Khả năng rò rỉ metadata nội bộ; Lỗi logic xác thực CLI trong mạng nội bộ; Tỷ lệ nén vượt trần decompression bomb cục bộ. | **$< 7$ ngày** | **$< 30$ ngày** | Trong release định kỳ kế tiếp |
| 🟢 **P3 (Low)** | Lỗi hiển thị cảnh báo drift; Tài liệu hướng dẫn an ninh chưa rõ ràng; Các cải tiến bảo mật phòng ngừa. | **$< 14$ ngày** | Release kế tiếp | Release Notes |

---

## 3. Quy Trình 5 Bước Ứng Phó Sự Cố An Ninh

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. INGEST   │ ──> │ 2. TRIAGE &  │ ──> │  3. HOTFIX   │ ──> │  4. VERIFY   │ ──> │  5. RELEASE  │
│  & ACK       │     │ REPRODUCE    │     │ DEVELOPMENT  │     │ & CANARY     │     │ & ADVISORY   │
│  (< 24h)     │     │ (< 48h)      │     │ (Isolated)   │     │ (Canary Sink)│     │ (GitHub Sec) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Ingest & Acknowledge**: Đội Security Response Team tiếp nhận qua `security@repro.dev`, gửi email xác nhận và thiết lập kênh liên lạc mã hoá PGP.
2. **Triage & Reproduce**: Dựng test case tối thiểu trong môi trường cách ly để tái hiện lỗi, xác định phạm vi ảnh hưởng và gán mức ưu tiên P0–P3.
3. **Hotfix Development**: Phát triển bản vá trên private security fork, nghiêm cấm commit lên public branches trước ngày phát hành.
4. **Verification with Canary Sink**: Chạy toàn bộ suite 12 attack tests ($T1$–$T12$) và 33 $SEC\text{ MUST}$ tests để đảm bảo bản vá triệt tiêu hoàn toàn lỗ hổng mà không gây hồi quy.
5. **Release & Public Advisory**: Đóng gói phiên bản vá lỗi, đăng ký CVE ID qua GitHub Security Advisories và thông báo tới toàn bộ người dùng.

---

## 4. Liên Kết Liên Quan

- `SECURITY.md` (Repo Root)
- [Spec-Security-Repro-Threat-Model](../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md)
- [Operations-MOC](../Operations-MOC.md)
