---
name: senior-fullstack
description: Kỹ năng phát triển fullstack toàn diện để xây dựng các ứng dụng web hoàn chỉnh với React, Next.js, Node.js, GraphQL và PostgreSQL. Bao gồm tạo khung dự án (project scaffolding), phân tích chất lượng code, các pattern kiến trúc và hướng dẫn toàn diện về tech stack. Sử dụng khi xây dựng các dự án mới, phân tích chất lượng code, triển khai các design pattern hoặc thiết lập workflow phát triển.
---

# Senior Fullstack

Bộ công cụ toàn diện dành cho Senior Fullstack với các công cụ hiện đại và các best practice.

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
# Script 1: Fullstack Scaffolder
python scripts/fullstack_scaffolder.py [options]

# Script 2: Project Scaffolder
python scripts/project_scaffolder.py [options]

# Script 3: Code Quality Analyzer
python scripts/code_quality_analyzer.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Fullstack Scaffolder
Công cụ tự động cho các tác vụ tạo khung (scaffolding) fullstack.

**Tính năng:**
- Tự động hóa việc tạo khung.
- Tích hợp sẵn các best practice.
- Các template có thể cấu hình.
- Kiểm tra chất lượng (quality checks).

**Cách sử dụng:**
```bash
python scripts/fullstack_scaffolder.py <project-path> [options]
```

### 2. Project Scaffolder
Công cụ phân tích và tối ưu hóa toàn diện.

**Tính năng:**
- Phân tích sâu (deep analysis).
- Các chỉ số hiệu năng (performance metrics).
- Đưa ra các khuyến nghị.
- Tự động sửa lỗi (automated fixes).

**Cách sử dụng:**
```bash
python scripts/project_scaffolder.py <target-path> [--verbose]
```

### 3. Code Quality Analyzer
Công cụ nâng cao cho các tác vụ chuyên biệt.

**Tính năng:**
- Tự động hóa ở mức độ chuyên gia.
- Cấu hình tùy chỉnh (custom configurations).
- Sẵn sàng để tích hợp.
- Output ở cấp độ production.

**Cách sử dụng:**
```bash
python scripts/code_quality_analyzer.py [arguments] [options]
```

## Tài liệu tham khảo (Reference Documentation)

### Tech Stack Guide
Hướng dẫn toàn diện có sẵn tại `references/tech_stack_guide.md`:
- Các pattern và thực hành chi tiết.
- Các ví dụ code.
- Các best practice.
- Các anti-pattern cần tránh.
- Các kịch bản thế giới thực.

### Architecture Patterns
Tài liệu workflow đầy đủ tại `references/architecture_patterns.md`:
- Các quy trình từng bước.
- Chiến lược tối ưu hóa.
- Tích hợp công cụ.
- Tinh chỉnh hiệu năng (performance tuning).
- Hướng dẫn xử lý sự cố (troubleshooting).

### Development Workflows
Hướng dẫn tham chiếu kỹ thuật tại `references/development_workflows.md`:
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
# Sử dụng script project scaffolder để phân tích
python scripts/project_scaffolder.py .

# Xem xét các khuyến nghị
# Áp dụng các bản sửa lỗi (fixes)
```

### 3. Áp dụng Best Practices
Làm theo các pattern và thực hành được tài liệu hóa trong:
- `references/tech_stack_guide.md`
- `references/architecture_patterns.md`
- `references/development_workflows.md`

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
python scripts/project_scaffolder.py .
python scripts/code_quality_analyzer.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Tài liệu tham khảo
- Tech Stack Guide: `references/tech_stack_guide.md`
- Architecture Patterns: `references/architecture_patterns.md`
- Development Workflows: `references/development_workflows.md`
- Tool Scripts: Thư mục `scripts/`
