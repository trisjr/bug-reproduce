---
name: senior-secops
description: Kỹ năng SecOps toàn diện cho bảo mật ứng dụng, quản lý lỗ hổng (vulnerability management), tuân thủ và các thực hành phát triển bảo mật. Bao gồm quét bảo mật, đánh giá lỗ hổng, kiểm tra tuân thủ và tự động hóa bảo mật. Sử dụng khi triển khai các biện pháp kiểm soát bảo mật, thực hiện kiểm toán bảo mật, phản ứng với các lỗ hổng hoặc đảm bảo các yêu cầu tuân thủ.
---

# Senior Secops

Bộ công cụ hoàn chỉnh dành cho Senior SecOps với các công cụ hiện đại và best practices.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
3. [Dòng tài liệu tham khảo](#dòng-tài-liệu-tham-khảo-reference-documentation)
4. [Tech Stack](#tech-stack)
5. [Workflow phát triển](#workflow-phát-triển)
6. [Tóm tắt Best Practices](#tóm-tắt-best-practices-summary)
7. [Các lệnh thông dụng](#các-lệnh-thông-dụng)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)

Skill này cung cấp ba năng lực cốt lõi thông qua các script tự động:

```bash
# Script 1: Security Scanner
python scripts/security_scanner.py [options]

# Script 2: Vulnerability Assessor
python scripts/vulnerability_assessor.py [options]

# Script 3: Compliance Checker
python scripts/compliance_checker.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Security Scanner
Công cụ tự động cho các tác vụ quét bảo mật.

- **Tính năng:** Tự động tạo khung (scaffolding), tích hợp best practices, template có thể cấu hình, kiểm tra chất lượng.

### 2. Vulnerability Assessor
Công cụ phân tích và tối ưu hóa việc quản lý lỗ hổng toàn diện.

- **Tính năng:** Phân tích sâu, đo lường các chỉ số, đưa ra khuyến nghị, tự động fix lỗi.

### 3. Compliance Checker
Công cụ nâng cao cho việc kiểm tra tuân thủ (Compliance).

- **Tính năng:** Tự động hóa cấp độ chuyên gia, cấu hình tùy chỉnh, sẵn sàng tích hợp, đầu ra chuẩn Production.

## Dòng tài liệu tham khảo (Reference Documentation)

### Security Standards
Hướng dẫn toàn diện có tại `references/security_standards.md`:
- Các tiêu chuẩn và thực hành chi tiết.
- Ví dụ code và Best practices.
- Các Anti-patterns cần tránh.

### Vulnerability Management Guide
Tài liệu workflow đầy đủ tại `references/vulnerability_management_guide.md`:
- Quy trình từng bước.
- Chiến lược tối ưu hóa và tích hợp công cụ.

### Compliance Requirements
Tài liệu hướng dẫn kỹ thuật tại `references/compliance_requirements.md`:
- Chi tiết tech stack.
- Ví dụ cấu hình và pattern tích hợp.
- Các lưu ý về bảo mật và khả năng mở rộng.

## Tech Stack
- **Ngôn ngữ:** TypeScript, JavaScript, Python, Go, Swift, Kotlin.
- **Backend:** Node.js, Express, GraphQL, REST APIs.
- **Công cụ SecOps:** Snyk, Checkmarx, Aqua Security, Vault.
- **Hạ tầng:** Docker, Kubernetes, Terraform.
- **Cloud:** AWS Security Hub, Azure Sentinel, GCP Cloud Security Command Center.

## Workflow phát triển (Development Workflow)

### 1. Thiết lập và Cấu hình
```bash
npm install # hoặc pip install -r requirements.txt
cp .env.example .env
```

### 2. Chạy Kiểm tra Chất lượng
Sử dụng script `vulnerability_assessor.py` để phân tích dự án, review các khuyến nghị và áp dụng sửa lỗi.

### 3. Triển khai Best Practices
Tuân theo các tiêu chuẩn bảo mật, quản lý lỗ hổng và yêu cầu tuân thủ trong tài liệu tham khảo.

## Tóm tắt Best Practices (Summary)

### Bảo mật (Security)
- Quét bảo mật (Security Scanning) trong mọi build pipeline.
- Quản lý lỗ hổng (Vulnerability management) liên tục.
- Triển khai "Least Privilege" cho mọi quyền truy cập.
- Tự động hóa việc kiểm tra tuân thủ (Compliance automation).

## Tài liệu tham khảo
- `references/security_standards.md`.
- `references/vulnerability_management_guide.md`.
- `references/compliance_requirements.md`.
- Thư mục `scripts/`.
- Tiêu chuẩn SOC2, HIPAA, GDPR (nếu áp dụng).
