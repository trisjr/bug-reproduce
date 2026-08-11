---
id: DOM-ACE-001
type: domain-knowledge
status: live
created: 2026-03-02
updated: 2026-03-02
tags: [agentic-ai, context-engineering, anthropic, best-practices]
---

# 🧠 Kiến thức nền tảng: Agentic Context Engineering

## Mục lục
1. [Giới thiệu](#1-giới-thiệu)
2. [Sự khác biệt: Prompt vs Context Engineering](#2-sự-khác-biệt-prompt-vs-context-engineering)
3. [Các nguyên tắc cốt lõi (Anthropic Standard)](#3-các-nguyên-tắc-cốt-lõi-anthropic-standard)
4. [Các kỹ thuật tối ưu hóa](#4-các-kỹ-thuật-tối-ưu-hóa)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## 1. Giới thiệu
Context Engineering là nghệ thuật và khoa học trong việc tuyển lựa (curating) và duy trì tập hợp các token tối ưu trong cửa sổ ngữ cảnh (Context Window) của LLM trong quá trình thực thi. Đây là bước tiến hóa tất yếu từ Prompt Engineering khi hệ thống chuyển dịch sang mô hình Tác nhân (Agents) hoạt động đa bước và dài hạn.

## 2. Sự khác biệt: Prompt vs Context Engineering
- **Prompt Engineering:** Tập trung vào việc viết chỉ dẫn (Instructions) hiệu quả trong System Prompt.
- **Context Engineering:** Quản trị toàn bộ trạng thái ngữ cảnh (System instructions, Tools, MCP, dữ liệu ngoại vi, lịch sử tin nhắn) qua nhiều lượt hội thoại.

## 3. Các nguyên tắc cốt lõi (Anthropic Standard)

### 3.1 Attention Scarcity (Sự khan hiếm chú ý)
LLM có "ngân sách chú ý" hữu hạn. Khi số lượng token tăng lên, khả năng recall (truy hồi) chính xác thông tin giảm dần. Hiện tượng này gọi là **Context Rot**.
- **Nguyên tắc:** Dùng tập hợp token nhỏ nhất có tín hiệu cao nhất (High-signal tokens) để đạt được kết quả mong muốn.

### 3.2 Right Altitude (Độ cao phù hợp)
- **Failure Mode 1:** Hardcode logic quá phức tạp, cứng nhắc → Khiến hệ thống dễ gãy (brittle).
- **Failure Mode 2:** Chỉ dẫn quá mơ hồ → Agent thiếu tín hiệu cụ thể để hành động.
- **Goldilocks Zone:** Cụ thể đủ để hướng dẫn hành vi, linh hoạt đủ để Model tự suy luận.

### 3.3 Just-in-Time Context retrieval
Thay vì nạp toàn bộ dữ liệu ngay từ đầu, Agent nên:
1. Giữ các định danh nhẹ (File paths, Web links, MoC).
2. Sử dụng công cụ (grep, list_dir, read_url) để nạp dữ liệu **đúng lúc cần**.
3. Tận dụng Metadata (Folder hierarchy, naming conventions) làm tín hiệu dẫn đường.

## 4. Các kỹ thuật tối ưu hóa

### 4.1 Compaction (Nén ngữ cảnh)
Khi hội thoại tiến gần giới hạn context window:
- Tóm tắt các quyết định quan trọng, bug chưa giải quyết, chi tiết thực thi.
- Loại bỏ các thông tin dư thừa (Tool outputs cũ, tin nhắn rác).
- Khởi tạo context mới với bản tóm tắt + các file quan trọng gần nhất.

### 4.2 Structured Note-taking (Agentic Memory)
Agent chủ động ghi chép vào bộ nhớ ngoài (Memory files) và đọc lại khi cần. Điều này giúp duy trì tính nhất quán (Coherence) qua hàng ngàn bước xử lý mà không làm đầy context window.

### 4.3 Sub-agent Architectures
Chia nhỏ các task phức tạp cho các Sub-agents chuyên biệt với cửa sổ ngữ cảnh sạch (Clean context windows). Lead Agent chịu trách nhiệm tổng hợp kết quả (Distilled summary).

## Tài liệu tham khảo
- [Effective Context Engineering for AI Agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [AGENTS.md](../../AGENTS.md)
- [OS-Handbook.md](../../OS-Handbook.md)
