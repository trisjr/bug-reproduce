---
name: senior-prompt-engineer
description: World-class prompt engineering skill cho LLM optimization, prompt patterns, structured outputs, và phát triển sản phẩm AI. Chuyên môn về Claude, GPT-4, prompt design patterns, few-shot learning, chain-of-thought, và đánh giá AI. Bao gồm tối ưu hóa RAG, thiết kế tác nhân (agent design), và kiến trúc hệ thống LLM. Sử dụng khi xây dựng các sản phẩm AI, tối ưu hóa hiệu năng LLM, thiết kế các hệ thống tác nhân, hoặc triển khai các kỹ thuật gợi ý (prompting) nâng cao.
---

# Senior Prompt Engineer

Kỹ năng Senior Prompt Engineer đẳng cấp thế giới cho các hệ thống AI/ML/Data chuẩn Production.

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
# Core Tool 1: Tối ưu hóa Prompt
python scripts/prompt_optimizer.py --input data/ --output results/

# Core Tool 2: Đánh giá RAG
python scripts/rag_evaluator.py --target project/ --analyze

# Core Tool 3: Điều phối Tác nhân (Agent Orchestrator)
python scripts/agent_orchestrator.py --config config.yaml --deploy
```

## Chuyên môn cốt lõi (Core Expertise)

- Các Pattern và Kiến trúc LLM Production nâng cao.
- Thiết kế hệ thống tác nhân (Agentic system design) và điều phối.
- Tối ưu hóa RAG (Retrieval-Augmented Generation) chuyên sâu.
- Các kỹ thuật Prompting nâng cao: Chain-of-Thought, ReAct, Few-shot.
- Đánh giá chất lượng và độ an toàn của LLM (LLM Evaluation & Safety).
- Tối ưu hóa độ trễ (Latency) và chi phí vận hành LLM.
- Tích hợp công cụ (Tool Use) và hàm (Function Calling) hiệu quả.

## Tech Stack
- **Ngôn ngữ:** Python, SQL, R, Scala, Go.
- **LLM Providers:** Anthropic (Claude), OpenAI (GPT-4), Google (Gemini), Llama (Meta).
- **LLM Frameworks:** LangChain, LlamaIndex, DSPy, CrewAI.
- **RAG & Vector DB:** Pinecone, Milvus, Chroma, Weaviate.
- **Deployment:** Docker, Kubernetes, LangServe, Vercel AI SDK.
- **Giám sát:** LangSmith, Arize Phoenix, Weights & Biases.

## Dòng tài liệu tham khảo (Reference Documentation)

### 1. Prompt Engineering Patterns
Hướng dẫn toàn diện tại `references/prompt_engineering_patterns.md`:
- Các Pattern thiết kế prompt nâng cao và Best practices.

### 2. LLM Evaluation Frameworks
Tài liệu workflow đầy đủ tại `references/llm_evaluation_frameworks.md`:
- Quy trình đánh giá chất lượng phản hồi LLM chuẩn khoa học.

### 3. Agentic System Design
Hướng dẫn kỹ thuật tại `references/agentic_system_design.md`:
- Nguyên tắc thiết kế tác nhân AI tự chủ và tin cậy.

## Pattern trong Production (Production Patterns)

### Pattern 1: Xử lý Prompt Mở rộng (Scalable Prompt Processing)
- Quản lý Template prompt hiệu quả và linh hoạt.
- Đảm bảo chất lượng đầu ra có cấu trúc (Structured Outputs).

### Pattern 2: Triển khai Tác nhân AI
- Thiết kế luồng xử lý Agentic workflow với khả năng phục hồi (Resilience).
- Tối ưu hóa việc gọi công cụ và xử lý context window lớn.

## Best Practices

### Phát triển (Development)
- Tiếp cận hướng dữ liệu và đánh giá định lượng.
- Code review tập trung vào logic prompt và tính ổn định của hệ thống.
- Tài liệu hóa các phiên bản prompt và kết quả đánh giá.

### Sản xuất (Production)
- Giám sát chất lượng phản hồi LLM theo thời gian thực.
- Kiểm soát chi phí (Token cost control) và giới hạn tốc độ (Rate limiting).
- Đảm bảo an toàn thông tin và chống Prompt Injection.

## Trách nhiệm cấp độ Senior (Senior-Level Responsibilities)

1. **Lãnh đạo Kỹ thuật (Technical Leadership)**: Dẫn dắt các chiến lược ứng dụng AI, cố vấn cho team và đảm bảo tính nhân văn/đạo đức trong AI.
2. **Tư duy Chiến lược**: Cân nhắc giữa độ phức tạp của Prompt và hiệu quả mang lại cho sản phẩm.
3. **Cộng tác**: Làm việc chặt chẽ với Frontend/Backend Dev để tích hợp AI mượt mà.

## Tài liệu tham khảo
- `references/prompt_engineering_patterns.md`.
- `references/llm_evaluation_frameworks.md`.
- `references/agentic_system_design.md`.
- Thư mục `scripts/`.
- Tài liệu từ Anthropic, OpenAI và LangChain.
