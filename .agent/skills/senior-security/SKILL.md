---
name: senior-security
description: Kỹ năng kỹ thuật bảo mật toàn diện cho bảo mật ứng dụng, kiểm thử xâm nhập (penetration testing), kiến trúc bảo mật và kiểm toán tuân thủ. Bao gồm các công cụ đánh giá bảo mật, mô phỏng mối đe dọa (threat modeling), triển khai mã hóa (crypto) và tự động hóa bảo mật. Sử dụng khi thiết kế kiến trúc bảo mật, thực hiện kiểm thử xâm nhập, triển khai mã hóa hoặc thực hiện kiểm toán bảo mật.
---

# Senior Security

Bộ công cụ hoàn chỉnh dành cho Senior Security với các công cụ hiện đại và best practices.

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
# Script 1: Threat Modeler
python scripts/threat_modeler.py [options]

# Script 2: Security Auditor
python scripts/security_auditor.py [options]

# Script 3: Pentest Automator
python scripts/pentest_automator.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Threat Modeler
Công cụ tự động cho các tác vụ mô phỏng mối đe dọa.

- **Tính năng:** Tự động tạo khung (scaffolding), tích hợp best practices, template có thể cấu hình, kiểm tra chất lượng.

### 2. Security Auditor
Công cụ phân tích và tối ưu hóa bảo mật toàn diện.

- **Tính năng:** Phân tích sâu, đo lường các chỉ số, đưa ra khuyến nghị, tự động fix lỗi.

### 3. Pentest Automator
Công cụ nâng cao cho việc tự động hóa kiểm thử xâm nhập (Penetration Testing).

- **Tính năng:** Tự động hóa cấp độ chuyên gia, cấu hình tùy chỉnh, sẵn sàng tích hợp, đầu ra chuẩn Production.

## Dòng tài liệu tham khảo (Reference Documentation)

### Security Architecture Patterns
Hướng dẫn toàn diện có tại `references/security_architecture_patterns.md`:
- Các pattern và thực hành chi tiết.
- Ví dụ code và Best practices.
- Các Anti-patterns cần tránh.

### Penetration Testing Guide
Tài liệu workflow đầy đủ tại `references/penetration_testing_guide.md`:
- Quy trình từng bước.
- Chiến lược tối ưu hóa và tích hợp công cụ.

### Cryptography Implementation
Tài liệu hướng dẫn kỹ thuật tại `references/cryptography_implementation.md`:
- Chi tiết tech stack.
- Ví dụ cấu hình và pattern tích hợp.
- Các lưu ý về bảo mật và khả năng mở rộng.

## Tech Stack
- **Ngôn ngữ:** TypeScript, JavaScript, Python, Go, Swift, Kotlin.
- **Backend:** Node.js, Express, GraphQL, REST APIs.
- **Bảo mật:** OWASP Top 10, JWT, OAuth2, TLS/SSL.
- **Công cụ:** Nmap, Burp Suite, Metasploit (cho pentest), SonarQube (cho audit).
- **Cloud:** AWS Security, GCP IAM, Azure Security Center.

## Workflow phát triển (Development Workflow)

### 1. Thiết lập và Cấu hình
```bash
npm install # hoặc pip install -r requirements.txt
cp .env.example .env
```

### 2. Kiểm tra Chất lượng Bảo mật
Sử dụng script `security_auditor.py` để phân tích dự án, review các khuyến nghị và áp dụng sửa lỗi.

### 3. Triển khai Best Practices
Tuân theo các pattern trong tài liệu tham khảo về kiến trúc bảo mật, pentest và mã hóa.

## Tóm tắt Best Practices (Summary)

### Bảo mật (Security)
- Validate tất cả đầu vào (Input validation).
- Sử dụng parameterized queries để chống SQL Injection.
- Triển khai xác thực (Authentication) và phân quyền (Authorization) đúng cách.
- Giữ các dependency luôn được cập nhật phiên bản mới nhất.

### Duy trì (Maintainability)
- Viết code rõ ràng, sử dụng cách đặt tên nhất quán.
- Thêm các comment hữu ích và giữ mọi thứ đơn giản (KISS principle).

## Tài liệu tham khảo
- `references/security_architecture_patterns.md`.
- `references/penetration_testing_guide.md`.
- `references/cryptography_implementation.md`.
- OWASP Foundation Guidelines.
- Thư mục `scripts/`.
