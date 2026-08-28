---
name: code-reviewer
description: Kỹ năng review code toàn diện cho TypeScript, JavaScript, Python, Swift, Kotlin, Go. Bao gồm phân tích code tự động, kiểm tra best practice, quét bảo mật và tạo checklist review. Sử dụng khi review Pull Request, đưa ra phản hồi về code, xác định vấn đề hoặc đảm bảo các tiêu chuẩn chất lượng code.
---

# Code Reviewer

Bộ công cụ toàn diện dành cho Code Reviewer với các công cụ hiện đại và các best practice.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
3. [Tài liệu tham khảo](#tài-liệu-tham-khảo)
4. [Tech Stack](#tech-stack)
5. [Workflow phát triển](#workflow-phát-triển)
6. [Tóm tắt Best Practices](#tóm-tắt-best-practices)
7. [Các lệnh phổ biến](#các-lệnh-phổ biến)
8. [Xử lý sự cố](#xử-lý-sự-cố)
9. [Tài nguyên](#tài-nguyên)

## Khởi đầu nhanh (Quick Start)

### Các năng lực chính (Main Capabilities)

Skill này cung cấp ba năng lực cốt lõi thông qua các script tự động:

```bash
# Script 1: Pr Analyzer
python scripts/pr_analyzer.py [options]

# Script 2: Code Quality Checker
python scripts/code_quality_checker.py [options]

# Script 3: Review Report Generator
python scripts/review_report_generator.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Pr Analyzer
Công cụ tự động cho các tác vụ phân tích Pull Request (PR).

**Tính năng:**
- Tự động hóa việc tạo khung (scaffolding).
- Tích hợp sẵn các best practice.
- Các template có thể cấu hình.
- Kiểm tra chất lượng (quality checks).

**Cách sử dụng:**
```bash
python scripts/pr_analyzer.py <project-path> [options]
```

### 2. Code Quality Checker
Công cụ phân tích và tối ưu hóa chất lượng code toàn diện.

**Tính năng:**
- Phân tích sâu (deep analysis).
- Các chỉ số hiệu năng (performance metrics).
- Đưa ra các khuyến nghị.
- Tự động sửa lỗi (automated fixes).

**Cách sử dụng:**
```bash
python scripts/code_quality_checker.py <target-path> [--verbose]
```

### 3. Review Report Generator
Công cụ nâng cao cho các tác vụ chuyên biệt.

**Tính năng:**
- Tự động hóa ở mức độ chuyên gia.
- Cấu hình tùy chỉnh (custom configurations).
- Sẵn sàng để tích hợp.
- Output ở cấp độ production.

**Cách sử dụng:**
```bash
python scripts/review_report_generator.py [arguments] [options]
```

## Tài liệu tham khảo (Reference Documentation)

### Code Review Checklist
Hướng dẫn toàn diện có sẵn tại `references/code_review_checklist.md`:
- Các pattern và thực hành chi tiết.
- Các ví dụ code.
- Các best practice.
- Các anti-pattern cần tránh.
- Các kịch bản thế giới thực.

### Coding Standards
Tài liệu workflow đầy đủ tại `references/coding_standards.md`:
- Các quy trình từng bước.
- Chiến lược tối ưu hóa.
- Tích hợp công cụ.
- Tinh chỉnh hiệu năng (performance tuning).
- Hướng dẫn xử lý sự cố (troubleshooting).

### Common Antipatterns
Hướng dẫn tham chiếu kỹ thuật tại `references/common_antipatterns.md`:
- Chi tiết về tech stack.
- Các ví dụ cấu hình.
- Các pattern tích hợp.
- Các cân nhắc về bảo mật.
- Hướng dẫn về khả năng mở rộng (scalability).

## Tech Stack
- **Languages:** TypeScript, JavaScript, Python, Go, Swift, Kotlin
- **Frontend:** React, Next.js, React Native, Flutter
- **Backend:** Node.js, Express, GraphQL, REST APIs
- **Database:** PostgreSQL, Prisma, NeonDB, Supabase
- **DevOps:** Docker, Kubernetes, Terraform, GitHub Actions, CircleCI
- **Cloud:** AWS, GCP, Azure

## Workflow phát triển (Development Workflow)

### 1. Thiết lập và Cấu hình
```bash
# Cài đặt dependency
npm install
# hoặc
pip install -r requirements.txt

# Cấu hình môi trường
cp .env.example .env
```

### 2. Chạy kiểm tra chất lượng (Quality Checks)
```bash
# Sử dụng script checker để phân tích
python scripts/code_quality_checker.py .

# Xem xét các khuyến nghị
# Áp dụng các bản sửa lỗi (fixes)
```

### 3. Áp dụng Best Practices
Làm theo các pattern và thực hành được tài liệu hóa trong:
- `references/code_review_checklist.md`
- `references/coding_standards.md`
- `references/common_antipatterns.md`

## Tóm tắt Best Practices (Best Practices Summary)

### Chất lượng Code (Code Quality)
- Tuân theo các pattern đã thiết lập.
- Viết test toàn diện.
- Tài liệu hóa các quyết định.
- Review thường xuyên.

### Hiệu năng (Performance)
- Đo lường trước khi tối ưu hóa.
- Sử dụng caching phù hợp.
- Tối ưu hóa các đường dẫn quan trọng (critical paths).
- Giám sát trong môi trường production.

### Bảo mật (Security)
- Kiểm tra tính hợp lệ (validate) của tất cả đầu vào.
- Sử dụng parameterized queries.
- Triển khai xác thực (authentication) đúng cách.
- Luôn cập nhật các dependency.

### Khả năng bảo trì (Maintainability)
- Viết code rõ ràng.
- Sử dụng cách đặt tên nhất quán.
- Thêm các comment hữu ích.
- Giữ mọi thứ đơn giản.

## Các lệnh phổ biến (Common Commands)
```bash
# Development
npm run dev
npm run build
npm run test
npm run lint

# Phân tích
python scripts/code_quality_checker.py .
python scripts/review_report_generator.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Xử lý sự cố (Troubleshooting)

### Các vấn đề thường gặp
Kiểm tra phần xử lý sự cố toàn diện trong `references/common_antipatterns.md`.

### Nhận hỗ trợ
- Xem lại tài liệu tham khảo.
- Kiểm tra các thông báo output của script.
- Tham khảo tài liệu của tech stack.
- Kiểm tra lại các log lỗi.

## Tài nguyên (Resources)
- Tài liệu Pattern: `references/code_review_checklist.md`
- Hướng dẫn Workflow: `references/coding_standards.md`
- Hướng dẫn Kỹ thuật: `references/common_antipatterns.md`
- Tool Scripts: Thư mục `scripts/`
