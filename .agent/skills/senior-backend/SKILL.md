---
name: senior-backend
description: Kỹ năng phát triển backend toàn diện để xây dựng các hệ thống backend có khả năng mở rộng (scalable) bằng cách sử dụng NodeJS, Express, Go, Python, Postgres, GraphQL, REST APIs. Bao gồm việc tạo khung API (scaffolding), tối ưu hóa database, triển khai bảo mật và tinh chỉnh hiệu năng. Sử dụng khi thiết kế API, tối ưu hóa các query database, thực hiện logic nghiệp vụ, xử lý authentication/authorization hoặc review code backend.
---

# Senior Backend

Bộ công cụ toàn diện dành cho Senior Backend với các công cụ hiện đại và các best practice.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
3. [Tài liệu tham khảo](#tài-liệu-tham-khảo)
4. [Tech Stack](#tech-stack)
5. [Workflow phát triển](#workflow-phát-triển)
6. [Tóm tắt Best Practices](#tóm-tắt-best-practices)
7. [Các lệnh phổ biến](#các-lệnh-phổ biến)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)

### Các năng lực chính (Main Capabilities)

Skill này cung cấp ba năng lực cốt lõi thông qua các script tự động:

```bash
# Script 1: Api Scaffolder
python scripts/api_scaffolder.py [options]

# Script 2: Database Migration Tool
python scripts/database_migration_tool.py [options]

# Script 3: Api Load Tester
python scripts/api_load_tester.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Api Scaffolder
Công cụ tự động cho các tác vụ tạo khung (scaffolding) API.

**Tính năng:**
- Tự động hóa việc tạo khung.
- Tích hợp sẵn các best practice.
- Các template có thể cấu hình.
- Kiểm tra chất lượng (quality checks).

**Cách sử dụng:**
```bash
python scripts/api_scaffolder.py <project-path> [options]
```

### 2. Database Migration Tool
Công cụ phân tích và tối ưu hóa toàn diện.

**Tính năng:**
- Phân tích sâu (deep analysis).
- Các chỉ số hiệu năng (performance metrics).
- Đưa ra các khuyến nghị.
- Tự động sửa lỗi (automated fixes).

**Cách sử dụng:**
```bash
python scripts/database_migration_tool.py <target-path> [--verbose]
```

### 3. Api Load Tester
Công cụ nâng cao cho các tác vụ chuyên biệt.

**Tính năng:**
- Tự động hóa ở mức độ chuyên gia.
- Cấu hình tùy chỉnh (custom configurations).
- Sẵn sàng để tích hợp.
- Output ở cấp độ production.

**Cách sử dụng:**
```bash
python scripts/api_load_tester.py [arguments] [options]
```

## Tài liệu tham khảo (Reference Documentation)

### Api Design Patterns
Hướng dẫn toàn diện có sẵn tại `references/api_design_patterns.md`:
- Các pattern và thực hành chi tiết.
- Các ví dụ code.
- Các best practice.
- Các anti-pattern cần tránh.
- Các kịch bản thế giới thực.

### Database Optimization Guide
Tài liệu workflow đầy đủ tại `references/database_optimization_guide.md`:
- Các quy trình từng bước.
- Chiến lược tối ưu hóa.
- Tích hợp công cụ.
- Tinh chỉnh hiệu năng (performance tuning).
- Hướng dẫn xử lý sự cố (troubleshooting).

### Backend Security Practices
Hướng dẫn tham chiếu kỹ thuật tại `references/backend_security_practices.md`:
- Chi tiết về tech stack.
- Các ví dụ cấu hình.
- Các pattern tích hợp.
- Các cân nhắc về bảo mật.
- Hướng dẫn về khả năng mở rộng (scalability).

## Tech Stack
- **Ngôn ngữ:** TypeScript, JavaScript, Python, Go, Swift, Kotlin
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
# Sử dụng script migration tool để phân tích
python scripts/database_migration_tool.py .

# Xem xét các khuyến nghị
# Áp dụng các bản sửa lỗi (fixes)
```

### 3. Áp dụng Best Practices
Làm theo các pattern và thực hành được tài liệu hóa trong:
- `references/api_design_patterns.md`
- `references/database_optimization_guide.md`
- `references/backend_security_practices.md`

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
python scripts/database_migration_tool.py .
python scripts/api_load_tester.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Tài liệu tham khảo
- Api Design Patterns: `references/api_design_patterns.md`
- Database Optimization Guide: `references/database_optimization_guide.md`
- Backend Security Practices: `references/backend_security_practices.md`
- Tool Scripts: Thư mục `scripts/`
