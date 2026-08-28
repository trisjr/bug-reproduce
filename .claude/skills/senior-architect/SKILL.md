---
name: senior-architect
description: Kỹ năng kiến trúc phần mềm toàn diện để thiết kế các hệ thống có khả năng mở rộng (scalable), dễ bảo trì bằng cách sử dụng ReactJS, NextJS, NodeJS, Express, React Native, Swift, Kotlin, Flutter, Postgres, GraphQL, Go, Python. Bao gồm tạo sơ đồ kiến trúc, các design pattern của hệ thống, framework đưa ra quyết định tech stack và phân tích dependency. Sử dụng khi thiết kế kiến trúc hệ thống, đưa ra các quyết định kỹ thuật, tạo sơ đồ kiến trúc, đánh giá sự đánh đổi (trade-offs) hoặc định nghĩa các pattern tích hợp (integration patterns).
---

# Senior Architect

Kỹ năng kiến trúc phần mềm đẳng cấp thế giới để thiết kế các hệ thống có khả năng mở rộng (Scalable), tin cậy và hiệu quả cao.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
3. [Dòng tài liệu tham khảo](#dòng-tài-liệu-tham-khảo-reference-documentation)
4. [Tóm tắt Best Practices](#tóm-tắt-best-practices-summary)
5. [Quy trình Ra quyết định](#quy-trình-ra-quyết-định-decision-trees)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)

Skill này cung cấp 3 năng lực cốt lõi thông qua các script tự động:

```bash
# Script 1: Architecture Diagram Generator
python scripts/generator.py --type [diagram_type] --output [path]

# Script 2: Project Architecture Analyzer
python scripts/analyzer.py --project [path] --format [output_format]

# Script 3: Dependency Tracker
python scripts/dependency_analyzer.py --file [path] --depth [n]
```

## Năng lực cốt lõi (Core Capabilities)

- **Architecture Diagram Generation**: Tự động tạo các sơ đồ kiến trúc (C4 Model, Flowcharts...).
- **Project Architecture Analysis**: Phân tích cấu trúc dự án hiện tại và đề xuất cải tiến.
- **Dependency Analysis**: Theo dõi và phân tích các phụ thuộc giữa các module/thư viện.
- **Tech Stack Selection**: Framework đưa ra quyết định lựa chọn công nghệ phù hợp với ngữ cảnh.
- **Trade-off Evaluation**: Đánh giá sự đánh đổi giữa các phương án kiến trúc (ví dụ: Microservices vs Monolith).

## Dòng tài liệu tham khảo (Reference Documentation)

### Architecture Patterns
Hướng dẫn toàn diện tại `references/architecture_patterns.md`:
- Các pattern thiết kế hiện đại (Clean Architecture, HEX, DDD).
- Ví dụ và Best practices trong thực tế.

### Development Workflows
Tài liệu quy trình đầy đủ tại `references/development_workflow.md`:
- Các bước từ Discovery đến Deployment.
- Tích hợp các công cụ tự động.

## Tóm tắt Best Practices (Summary)

### Hệ thống & Hiệu năng
- Luôn ưu tiên sự đơn giản (Simplicity first).
- Thiết kế hệ thống không có điểm chết duy nhất (No Single Point of Failure).
- Sử dụng Caching đúng nơi, đúng lúc.
- Tối ưu hóa Database queries và Indexing.

### Maintainability & Security
- Viết code sạch (Clean Code) và dễ test.
- Triển khai bảo mật nhiều lớp (Security in depth).
- Quản lý secrets thông qua biến môi trường hoặc vault.

## Quy trình Ra quyết định (Decision Trees)
- **Chọn ORM**: Drizzle (ưu tiên cho TypeScript/Serverless) vs Prisma vs TypeORM.
- **Tổ chức Module**: Domain-driven vs Layer-driven.
- **Chiến lược Testing**: Kim tự tháp kiểm thử (Unit > Integration > E2E).

## Tài liệu tham khảo
- `references/architecture_patterns.md`.
- `references/development_workflow.md`.
- "Architecture Patterns" - O'Reilly.
- Martin Fowler's guide on Architecture.
