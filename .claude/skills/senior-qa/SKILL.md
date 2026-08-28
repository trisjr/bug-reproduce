---
name: senior-qa
description: Kỹ năng QA và kiểm thử toàn diện để đảm bảo chất lượng, tự động hóa kiểm thử (test automation) và xây dựng chiến lược kiểm thử cho các ứng dụng ReactJS, NextJS, NodeJS. Bao gồm việc tạo bộ test suite, phân tích độ bao phủ (coverage analysis), thiết lập E2E testing và các chỉ số chất lượng (quality metrics). Sử dụng khi thiết kế chiến lược kiểm thử, viết test case, triển khai tự động hóa kiểm thử, thực hiện kiểm thử thủ công hoặc phân tích độ bao phủ kiểm thử.
---

# Senior Qa

Bộ công cụ toàn diện dành cho Senior QA với các công cụ hiện đại và các best practice.

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
# Script 1: Test Suite Generator
python scripts/test_suite_generator.py [options]

# Script 2: Coverage Analyzer
python scripts/coverage_analyzer.py [options]

# Script 3: E2E Test Scaffolder
python scripts/e2e_test_scaffolder.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Test Suite Generator
Công cụ tự động cho các tác vụ tạo bộ kiểm thử (test suite).

**Tính năng:**
- Tự động hóa việc tạo khung.
- Tích hợp sẵn các best practice.
- Các template có thể cấu hình.
- Kiểm tra chất lượng (quality checks).

**Cách sử dụng:**
```bash
python scripts/test_suite_generator.py <project-path> [options]
```

### 2. Coverage Analyzer
Công cụ phân tích và tối ưu hóa toàn diện.

**Tính năng:**
- Phân tích sâu (deep analysis).
- Các chỉ số hiệu năng (performance metrics).
- Đưa ra các khuyến nghị.
- Tự động sửa lỗi (automated fixes).

**Cách sử dụng:**
```bash
python scripts/coverage_analyzer.py <target-path> [--verbose]
```

### 3. E2E Test Scaffolder
Công cụ nâng cao cho các tác vụ chuyên biệt.

**Tính năng:**
- Tự động hóa ở mức độ chuyên gia.
- Cấu hình tùy chỉnh (custom configurations).
- Sẵn sàng để tích hợp.
- Output ở cấp độ production.

**Cách sử dụng:**
```bash
python scripts/e2e_test_scaffolder.py [arguments] [options]
```

## Tài liệu tham khảo (Reference Documentation)

### Testing Strategies
Hướng dẫn toàn diện có sẵn tại `references/testing_strategies.md`:
- Các pattern và thực hành chi tiết.
- Các ví dụ code.
- Các best practice.
- Các anti-pattern cần tránh.
- Các kịch bản thế giới thực.

### Test Automation Patterns
Tài liệu workflow đầy đủ tại `references/test_automation_patterns.md`:
- Các quy trình từng bước.
- Chiến lược tối ưu hóa.
- Tích hợp công cụ.
- Tinh chỉnh hiệu năng (performance tuning).
- Hướng dẫn xử lý sự cố (troubleshooting).

### Qa Best Practices
Hướng dẫn tham chiếu kỹ thuật tại `references/qa_best_practices.md`:
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
# Sử dụng script coverage analyzer để phân tích
python scripts/coverage_analyzer.py .

# Xem xét các khuyến nghị
# Áp dụng các bản sửa lỗi (fixes)
```

### 3. Áp dụng Best Practices
Làm theo các pattern và thực hành được tài liệu hóa trong:
- `references/testing_strategies.md`
- `references/test_automation_patterns.md`
- `references/qa_best_practices.md`

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
python scripts/coverage_analyzer.py .
python scripts/e2e_test_scaffolder.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Tài liệu tham khảo
- Testing Strategies: `references/testing_strategies.md`
- Test Automation Patterns: `references/test_automation_patterns.md`
- Qa Best Practices: `references/qa_best_practices.md`
- Tool Scripts: Thư mục `scripts/`
