---
name: senior-frontend
description: Kỹ năng phát triển frontend toàn diện để xây dựng các ứng dụng web hiện đại, hiệu năng cao bằng cách sử dụng ReactJS, NextJS, TypeScript, Tailwind CSS. Bao gồm việc tạo khung component (scaffolding), tối ưu hóa hiệu năng, phân tích bundle và các best practice cho UI. Sử dụng khi phát triển các tính năng frontend, tối ưu hóa hiệu năng, triển khai các UI/UX design, quản lý state hoặc review code frontend.
---

# Senior Frontend

Bộ công cụ toàn diện dành cho Senior Frontend với các công cụ hiện đại và các best practice.

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
# Script 1: Component Generator
python scripts/component_generator.py [options]

# Script 2: Bundle Analyzer
python scripts/bundle_analyzer.py [options]

# Script 3: Frontend Scaffolder
python scripts/frontend_scaffolder.py [options]
```

## Năng lực cốt lõi (Core Capabilities)

### 1. Component Generator
Công cụ tự động cho các tác vụ tạo component.

**Tính năng:**
- Tự động hóa việc tạo khung (scaffolding).
- Tích hợp sẵn các best practice.
- Các template có thể cấu hình.
- Kiểm tra chất lượng (quality checks).

**Cách sử dụng:**
```bash
python scripts/component_generator.py <project-path> [options]
```

### 2. Bundle Analyzer
Công cụ phân tích và tối ưu hóa toàn diện.

**Tính năng:**
- Phân tích sâu (deep analysis).
- Các chỉ số hiệu năng (performance metrics).
- Đưa ra các khuyến nghị.
- Tự động sửa lỗi (automated fixes).

**Cách sử dụng:**
```bash
python scripts/bundle_analyzer.py <target-path> [--verbose]
```

### 3. Frontend Scaffolder
Công cụ nâng cao cho các tác vụ chuyên biệt.

**Tính năng:**
- Tự động hóa ở mức độ chuyên gia.
- Cấu hình tùy chỉnh (custom configurations).
- Sẵn sàng để tích hợp.
- Output ở cấp độ production.

**Cách sử dụng:**
```bash
python scripts/frontend_scaffolder.py [arguments] [options]
```

## Tài liệu tham khảo (Reference Documentation)

### React Patterns
Hướng dẫn toàn diện có sẵn tại `references/react_patterns.md`:
- Các pattern và thực hành chi tiết.
- Các ví dụ code.
- Các best practice.
- Các anti-pattern cần tránh.
- Các kịch bản thế giới thực.

### Nextjs Optimization Guide
Tài liệu workflow đầy đủ tại `references/nextjs_optimization_guide.md`:
- Các quy trình từng bước.
- Chiến lược tối ưu hóa.
- Tích hợp công cụ.
- Tinh chỉnh hiệu năng (performance tuning).
- Hướng dẫn xử lý sự cố (troubleshooting).

### Frontend Best Practices
Hướng dẫn tham chiếu kỹ thuật tại `references/frontend_best_practices.md`:
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
# Sử dụng script analyzer
python scripts/bundle_analyzer.py .

# Xem xét các khuyến nghị
# Áp dụng các bản sửa lỗi (fixes)
```

### 3. Áp dụng Best Practices
Làm theo các pattern và thực hành được tài liệu hóa trong:
- `references/react_patterns.md`
- `references/nextjs_optimization_guide.md`
- `references/frontend_best_practices.md`

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
python scripts/bundle_analyzer.py .
python scripts/frontend_scaffolder.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Tài liệu tham khảo
- React Patterns: `references/react_patterns.md`
- Nextjs Optimization Guide: `references/nextjs_optimization_guide.md`
- Frontend Best Practices: `references/frontend_best_practices.md`
- Tool Scripts: Thư mục `scripts/`
