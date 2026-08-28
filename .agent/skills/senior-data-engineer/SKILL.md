---
name: senior-data-engineer
description: Kỹ năng Data Engineering đẳng cấp thế giới để xây dựng các pipeline dữ liệu có khả năng mở rộng, hệ thống ETL/ELT và hạ tầng dữ liệu. Chuyên môn về Python, SQL, Spark, Airflow, dbt, Kafka và modern data stack. Bao gồm mô hình hóa dữ liệu (data modeling), điều phối pipeline, chất lượng dữ liệu và DataOps. Sử dụng khi thiết kế kiến trúc dữ liệu, xây dựng pipeline, tối ưu hóa workflow dữ liệu hoặc triển khai quản trị dữ liệu (data governance).
---

# Senior Data Engineer

Kỹ năng Senior Data Engineer đẳng cấp thế giới cho các hệ thống AI/ML/Data chuẩn Production.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Chuyên môn cốt lõi](#chuyên-môn-cốt-lõi)
3. [Tech Stack](#tech-stack)
4. [Dòng tài liệu tham khảo](#dòng-tài-liệu-tham-khảo-reference-documentation)
5. [Pattern trong Production](#pattern-trong-production)
6. [Best Practices](#best-practices)
7. [Mục tiêu Hiệu năng](#mục-tiêu-hiệu-năng-performance-targets)
8. [Bảo mật & Tuân thủ](#bảo-mật--tuân-thủ-security--compliance)
9. [Trách nhiệm cấp độ Senior](#trách-nhiệm-cấp-độ-senior-senior-level-responsibilities)
10. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)

### Các công cụ chính:

```bash
# Core Tool 1: Điều phối Pipeline
python scripts/pipeline_orchestrator.py --input data/ --output results/

# Core Tool 2: Kiểm tra Chất lượng Dữ liệu
python scripts/data_quality_validator.py --target project/ --analyze

# Core Tool 3: Tối ưu hóa hiệu năng ETL
python scripts/etl_performance_optimizer.py --config config.yaml --deploy
```

## Chuyên môn cốt lõi (Core Expertise)

- Các Pattern và Kiến trúc Production nâng cao.
- Thiết kế và triển khai hệ thống có khả năng mở rộng (Scalable).
- Tối ưu hóa hiệu năng ở quy mô lớn.
- Best practices về MLOps và DataOps.
- Xử lý thời gian thực (Real-time processing) và suy luận (inference).
- Framework tính toán phân tán (Distributed computing).
- Triển khai và giám sát Model.

## Tech Stack
- **Ngôn ngữ:** Python, SQL, R, Scala, Go.
- **ML Frameworks:** PyTorch, TensorFlow, Scikit-learn, XGBoost.
- **Data Tools:** Spark, Airflow, dbt, Kafka, Databricks.
- **LLM Frameworks:** LangChain, LlamaIndex, DSPy.
- **Deployment:** Docker, Kubernetes, AWS/GCP/Azure.
- **Databases:** PostgreSQL, BigQuery, Snowflake, Pinecone.

## Dòng tài liệu tham khảo (Reference Documentation)

### 1. Data Pipeline Architecture
Hướng dẫn toàn diện tại `references/data_pipeline_architecture.md`:
- Các Pattern nâng cao và Best practices.
- Chiến lược triển khai Production và kỹ thuật tối ưu hóa.

### 2. Data Modeling Patterns
Tài liệu workflow đầy đủ tại `references/data_modeling_patterns.md`:
- Quy trình thiết kế kiến trúc và tích hợp công cụ.

### 3. DataOps Best Practices
Hướng dẫn kỹ thuật tại `references/dataops_best_practices.md`:
- Nguyên tắc thiết kế hệ thống và quan sát (Observability).

## Pattern trong Production (Production Patterns)

### Pattern 1: Xử lý Dữ liệu Mở rộng (Scalable Data Processing)
- Kiến trúc mở rộng theo chiều ngang (Horizontal scaling).
- Thiết kế chịu lỗi (Fault-tolerant) và xử lý Batch/Real-time.

### Pattern 2: Triển khai ML Model
- Phục vụ Model với độ trễ thấp (Low latency).
- Hạ tầng A/B testing và Feature store integration.

## Best Practices

### Phát triển (Development)
- Phát triển hướng kiểm thử (TDD).
- Code review và Pair programming.
- Documentation as code và Version control cho mọi thứ.

### Sản xuất (Production)
- Giám sát mọi thứ quan trọng.
- Tự động hóa deployment và sử dụng Feature flags.
- Canary deployments và logging toàn diện.

## Trách nhiệm cấp độ Senior (Senior-Level Responsibilities)

1. **Lãnh đạo kỹ thuật (Technical Leadership)**: Đưa ra các quyết định kiến trúc, hướng dẫn team viên và đảm bảo chất lượng code.
2. **Tư duy chiến lược**: Thống nhất với mục tiêu kinh doanh, đánh giá các sự đánh đổi (trade-offs) và lập kế hoạch mở rộng.
3. **Cộng tác**: Làm việc liên chức năng, giao tiếp hiệu quả và chia sẻ kiến thức.

## Tài liệu tham khảo
- `references/data_pipeline_architecture.md`.
- `references/data_modeling_patterns.md`.
- `references/dataops_best_practices.md`.
- Thư mục `scripts/`.
- Tài liệu từ các nền tảng Spark, Airflow, và Cloud providers.
