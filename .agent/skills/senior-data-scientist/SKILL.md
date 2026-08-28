---
name: senior-data-scientist
description: Kỹ năng Data Science đẳng cấp thế giới để xây dựng các bài toán mô hình hóa thống kê, thử nghiệm, suy luận nhân quả và phân tích nâng cao. Chuyên môn về Python (NumPy, Pandas, Scikit-learn), R, SQL, phương pháp thống kê, A/B testing, chuỗi thời gian (time series) và business intelligence. Bao gồm thiết kế thử nghiệm, feature engineering, đánh giá mô hình và giao tiếp với stakeholder. Sử dụng khi thiết kế thử nghiệm, xây dựng mô hình dự báo, thực hiện phân tích nhân quả hoặc thúc đẩy các quyết định dựa trên dữ liệu.
---

# Senior Data Scientist

Kỹ năng Senior Data Scientist đẳng cấp thế giới cho các hệ thống AI/ML/Data chuẩn Production.

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
# Core Tool 1: Thiết kế thử nghiệm
python scripts/experiment_designer.py --input data/ --output results/

# Core Tool 2: Pipeline Feature Engineering
python scripts/feature_engineering_pipeline.py --target project/ --analyze

# Core Tool 3: Bộ đánh giá Model
python scripts/model_evaluation_suite.py --config config.yaml --deploy
```

## Chuyên môn cốt lõi (Core Expertise)

- Các Pattern và Kiến trúc Production AI/ML nâng cao.
- Thiết kế thử nghiệm và suy luận thống kê (Statistical inference).
- Tối ưu hóa hiệu năng Model ở quy mô lớn.
- Best practices về MLOps và DataOps.
- Phân tích nhân quả (Causal inference) và phân tích nâng cao.
- Feature engineering và Model evaluation chuyên sâu.
- Giao tiếp và trình bày kết quả cho Stakeholders.

## Tech Stack
- **Ngôn ngữ:** Python (NumPy, Pandas, Scikit-learn), SQL, R.
- **ML Frameworks:** PyTorch, TensorFlow, XGBoost, CatBoost.
- **Dữ liệu:** Spark, BigQuery, Snowflake.
- **Thực nghiệm:** A/B Testing frameworks, Causal ML (DoWhy, v.v.).
- **Giám sát:** MLflow, Weights & Biases.
- **Databases:** PostgreSQL, Pinecone (Vector DB).

## Dòng tài liệu tham khảo (Reference Documentation)

### 1. Statistical Methods Advanced
Hướng dẫn toàn diện tại `references/statistical_methods_advanced.md`:
- Các Pattern thống kê nâng cao và Best practices trong Production.

### 2. Experiment Design Frameworks
Tài liệu workflow đầy đủ tại `references/experiment_design_frameworks.md`:
- Quy trình thiết kế thử nghiệm từng bước và tích hợp công cụ.

### 3. Feature Engineering Patterns
Hướng dẫn kỹ thuật tại `references/feature_engineering_patterns.md`:
- Nguyên tắc thiết kế Feature store và quan sát hiệu quả.

## Pattern trong Production (Production Patterns)

### Pattern 1: Xử lý Dữ liệu Mở rộng (Scalable Data Processing)
- Xử lý dữ liệu Batch và Real-time chuẩn mực.
- Đảm bảo chất lượng dữ liệu đầu vào cho Model.

### Pattern 2: Triển khai ML Model
- Phục vụ Model với độ trễ thấp và khả năng chịu tải.
- Tự động hóa pipeline đánh giá và huấn luyện lại (retraining).

## Best Practices

### Phát triển (Development)
- Tiếp cận hướng dữ liệu và thử nghiệm.
- Code review tập trung vào logic toán học và dữ liệu.
- Tài liệu hóa các giả định và phương pháp thử nghiệm.

### Sản xuất (Production)
- Giám sát độ lệch Model (model drift) và dữ liệu.
- Tự động hóa việc đánh giá và triển khai Model.
- Logging chi tiết cho quá trình suy luận.

## Trách nhiệm cấp độ Senior (Senior-Level Responsibilities)

1. **Lãnh đạo Kỹ thuật (Technical Leadership)**: Dẫn dắt các quyết định về phương pháp nghiên cứu, cố vấn cho các thành viên và quản lý chất lượng nghiên cứu.
2. **Tư duy Chiến lược**: Kết nối insight dữ liệu với kết quả kinh doanh, cân nhắc độ phức tạp của Model so với giá trị mang lại.
3. **Cộng tác**: Làm việc chặt chẽ với Data Engineer và Product Team để đưa Model vào thực tế.

## Tài liệu tham khảo
- `references/statistical_methods_advanced.md`.
- `references/experiment_design_frameworks.md`.
- `references/feature_engineering_patterns.md`.
- Thư mục `scripts/`.
- Tài liệu chính thức của Scikit-learn, PyTorch và TensorFlow.
