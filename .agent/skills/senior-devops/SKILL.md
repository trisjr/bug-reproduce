---
name: senior-devops
description: Kỹ năng DevOps toàn diện cho CI/CD, tự động hóa hạ tầng (IaC), container hóa và các nền tảng đám mây (AWS, GCP, Azure). Bao gồm thiết lập pipeline, hạ tầng dưới dạng code, tự động hóa deployment và giám sát. Sử dụng khi thiết lập pipeline, triển khai ứng dụng, quản lý hạ tầng, triển khai monitoring hoặc tối ưu hóa quy trình deployment.
---

# Senior Devops

Bộ công cụ hoàn chỉnh dành cho Senior DevOps với các công cụ hiện đại và best practices.

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
# Script 1: Pipeline Generator
python scripts/pipeline_generator.py [options]

# Script 2: Terraform Scaffolder
python scripts/terraform_scaffolder.py [options]

# Script 3: Deployment Manager
python scripts/deployment_manager.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Pipeline Generator
Công cụ tự động cho các tác vụ tạo pipeline.

- **Tính năng:** Tự động tạo khung (scaffolding), tích hợp best practices, template có thể cấu hình, kiểm tra chất lượng.

### 2. Terraform Scaffolder
Công cụ phân tích và tối ưu hóa toàn diện cho IaC.

- **Tính năng:** Phân tích sâu, đo lường hiệu năng, đưa ra khuyến nghị, tự động fix lỗi.

### 3. Deployment Manager
Công cụ nâng cao cho các tác vụ triển khai chuyên biệt.

- **Tính năng:** Tự động hóa cấp độ chuyên gia, cấu hình tùy chỉnh, sẵn sàng tích hợp, đầu ra chuẩn Production.

## Dòng tài liệu tham khảo (Reference Documentation)

### Cicd Pipeline Guide
Hướng dẫn toàn diện có tại `references/cicd_pipeline_guide.md`:
- Các pattern và thực hành chi tiết.
- Ví dụ code và Best practices.
- Các Anti-patterns cần tránh.

### Infrastructure As Code
Tài liệu workflow đầy đủ tại `references/infrastructure_as_code.md`:
- Quy trình từng bước, chiến lược tối ưu hóa.
- Tích hợp công cụ và tinh chỉnh hiệu năng.

## Tech Stack
- **Ngôn ngữ:** TypeScript, JavaScript, Python, Go, Swift, Kotlin.
- **Frontend:** React, Next.js, React Native, Flutter.
- **Backend:** Node.js, Express, GraphQL, REST APIs.
- **Database:** PostgreSQL, Prisma, NeonDB, Supabase.
- **DevOps:** Docker, Kubernetes, Terraform, GitHub Actions, CircleCI.
- **Cloud:** AWS, GCP, Azure.

## Workflow phát triển (Development Workflow)

### 1. Thiết lập và Cấu hình
```bash
npm install # hoặc pip install -r requirements.txt
cp .env.example .env
```

### 2. Kiểm tra Chất lượng
Sử dụng script analyzer để review các khuyến nghị và áp dụng sửa lỗi.

### 3. Triển khai Best Practices
Tuân theo các pattern trong tài liệu tham khảo về CI/CD, IaC và chiến lược deployment.

## Tóm tắt Best Practices (Summary)

### Chất lượng Code (Code Quality)
- Tuân theo các pattern đã thiết lập.
- Viết test toàn diện, tài liệu hóa các quyết định.

### Bảo mật (Security)
- Validate tất cả đầu vào.
- Sử dụng parameterized queries.
- Triển khai xác thực (Authentication) đúng cách.
- Cập nhật các dependency thường xuyên.

## Tài liệu tham khảo
- `references/cicd_pipeline_guide.md`.
- `references/infrastructure_as_code.md`.
- `references/deployment_strategies.md`.
- Thư mục `scripts/`.
- Tài liệu Docker, Kubernetes, Terraform chính thức.
