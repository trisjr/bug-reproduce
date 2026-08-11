# Từ Điển Thuật Ngữ (Glossary) - Hệ Điều Hành TNMCORE-OS

## Mục lục
1. [Hệ thống cốt lõi (Core System Concepts)](#1-hệ-thống-cốt-lõi-core-system-concepts)
2. [Cơ chế AI & Thực thi (AI Engine & Execution)](#2-cơ-chế-ai--thực-thi-ai-engine--execution)
3. [Kiến trúc Tri thức & Tài liệu (Knowledge Architecture)](#3-kiến-trúc-tri-thức--tài-liệu-knowledge-architecture)
4. [Bảng đối soát Anh - Việt (English-Vietnamese Mapping)](#4-bảng-đối-soát-anh---việt-english-vietnamese-mapping)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 1. Hệ thống cốt lõi (Core System Concepts)

| Thuật ngữ | Định nghĩa |
|:---|:---|
| **TNMCORE-OS** | Hệ điều hành Agile AI-Native, tập trung vào sự cộng tác giữa Con người và AI thông qua tài liệu hóa và quy trình chuẩn. |
| **Spec-Driven Development (SDD)** | Phương pháp phát triển phần mềm lấy Đặc tả (Specification) làm trung tâm. Mọi dòng code đều phải có nguồn gốc từ Spec. |
| **Hybrid Collaboration** | Mô hình cộng tác lai giữa năng lực sáng tạo/quyết định của Con người và năng lực thực thi/xử lý của AI. |
| **Role-Playing First** | Nguyên tắc ưu tiên xác định Danh tính (Identity/Role) của AI trước khi thực hiện bất kỳ kỹ năng (Skill) nào. |

## 2. Cơ chế AI & Thực thi (AI Engine & Execution)

| Thuật ngữ | Định nghĩa |
|:---|:---|
| **Agentic AI** | Hệ thống AI có khả năng tự lập kế hoạch (Planning), sử dụng công cụ (Tooling) và thực hiện hành động để đạt mục tiêu phức tạp. |
| **Skill** | Bộ hướng dẫn và scripts mở rộng khả năng thực thi chuyên biệt cho Agent (Ví dụ: `clickup-expert`, `code-reviewer`). |
| **Workflow** | Các quy trình vận hành tiêu chuẩn (SOP) được tự động hóa, kích hoạt qua Slash Commands (`/`). |
| **Rule** | Các ràng buộc, kỷ luật và "hàng rào bảo vệ" (Guardrails) buộc AI phải tuân thủ tuyệt đối (Ví dụ: Clean Code rules). |
| **MCP (Model Context Protocol)** | Giao thức kết nối vạn năng, giúp AI truy cập dữ liệu và công cụ từ bên thứ ba (ClickUp, GitHub, DB). |
| **Discovery (Context Loading)** | Quá trình AI tự động quét và nạp các tri thức, tài liệu liên quan trước khi bắt đầu một nhiệm vụ. |
| **Planning Mode** | Chế độ làm việc chiến lược của AI, bắt buộc phải lập kế hoạch và chờ User phê duyệt trước khi thực thi. |

## 3. Kiến trúc Tri thức & Tài liệu (Knowledge Architecture)

| Thuật ngữ | Định nghĩa |
|:---|:---|
| **Single Source of Truth (SSOT)** | Nguồn sự thật duy nhất. Mọi tri thức dự án phải nằm tại `docs/` và `knowledge-base/`. |
| **Dewey Decimal System** | Chuẩn phân loại tài liệu bằng số thập phân (Ví dụ: 010 cho Planning, 020 cho Requirements). |
| **Active Brain (Memory)** | Bộ nhớ đệm của Agent (thường là file `AGENTS.md`) dùng để tải nhanh các tri thức quan trọng nhất. |
| **Learning Loop** | Vòng lặp học hỏi, nơi các bài học kinh nghiệm được đúc kết và nạp ngược lại vào hệ thống tri thức. |
| **Artifact** | Sản phẩm trung gian hoặc kết quả cuối cùng do AI/Con người tạo ra (Ví dụ: Spec file, Code, Implementation Plan). |

## 4. Bảng đối soát Anh - Việt (English-Vietnamese Mapping)

Dưới đây là các thuật ngữ ưu tiên dùng tiếng Anh để giữ tính chuyên nghiệp và chính xác trong kỹ thuật:

| English Term | Vietnamese Translation | Khuyến nghị sử dụng |
|:---|:---|:---|
| **Specification (Spec)** | Đặc tả | Dùng **Spec** |
| **Implementation** | Thực thi / Triển khai | Dùng **Implementation** |
| **Verification** | Kiểm chứng | Dùng **Verification** |
| **Refactor** | Tái cấu trúc mã nguồn | Dùng **Refactor** |
| **Requirement** | Yêu cầu nghiệp vụ | Dùng **Requirement** |
| **Context** | Ngữ cảnh | Dùng **Context** |
| **Hallucination** | Ảo giác AI | Dùng **Hallucination** |
| **Grounding** | Đối soát thực tế | Dùng **Grounding** |

---

## Tài liệu tham khảo
1. [README.md](../../README.md) - Tầm nhìn và Triết lý TNMCORE-OS.
2. [OS-Handbook.md](../../OS-Handbook.md) - Cẩm nang vận hành chi tiết.
3. [OpenAI Documentation - Agentic Concepts](https://platform.openai.com/docs/guides/agents)
4. [Diátaxis Documentation Framework](https://diataxis.fr/)

---
*Glossary được quản lý bởi TNMCORE-OS - Cập nhật lần cuối: 2026-02-05.*
