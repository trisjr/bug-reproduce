---
name: clickup-expert
description: Chuyên gia ClickUp quản lý Workspace hierarchy, Tasks và Documentation. Ưu tiên sử dụng MCP Tools trực tiếp và BẮT BUỘC load context từ file .env trước khi thực thi.
---

# ClickUp Expert (MCP-First & Context-Aware)

Skill này đóng vai trò điều phối tất cả các hoạt động quản trị dự án trên ClickUp, tối ưu hóa hiệu suất bằng cách sử dụng trực tiếp MCP ClickUp Toolbelt.

## Table of Contents
1. [Giới thiệu](#giới-thiệu)
2. [Cấu trúc Context Bắt Buộc (.env)](#cấu-trúc-context-bắt-buộc-env)
3. [Quy trình thực thi MCP-First](#quy-trình-thực-thi-mcp-first)
4. [Sử dụng Scripts Chuyên Biệt](#sử-dụng-scripts-chuyên-biệt)
5. [Quy tắc Vận hành & Best Practices](#quy-tắc-vận-hành--best-practices)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Giới thiệu
Skill này giúp quản lý dự án, task và tài liệu trên ClickUp một cách minh bạch và nhanh chóng. Agent sử dụng bộ công cụ MCP để tương tác với API của ClickUp, đảm bảo dữ liệu luôn được cập nhật theo thời gian thực.

## Cấu trúc Context Bắt Buộc (.env)
Để đảm bảo tính nhất quán, Agent **BẮT BUỘC** phải thực hiện quy trình sau trước khi gọi các công cụ ClickUp:
1. **Đọc file**: Sử dụng `view_file` để kiểm tra nội dung `.env` tại root.
2. **Trích xuất IDs**: Tìm kiếm `CLICKUP_WORKSPACE_ID`, `CLICKUP_SPACE_ID`, `CLICKUP_FOLDER_ID`, v.v.
3. **Áp dụng**: Luôn truyền các ID này vào tham số của MCP Tools nếu không có chỉ định khác.

## Quy trình thực thi MCP-First
Tất cả các thao tác tiêu chuẩn phải được thực hiện thông qua công cụ `mcp_clickup_*`:
- **Search**: `clickup_search`, `clickup_get_chat_channels`.
- **Task**: `clickup_create_task`, `clickup_get_task`, `clickup_update_task`.
- **Comments & Files**: `clickup_create_task_comment`, `clickup_attach_task_file`.
- **Documents**: `clickup_create_document`, `clickup_list_document_pages`, `clickup_get_document_pages`.

## Sử dụng Scripts Chuyên Biệt
Chỉ sử dụng `run_command` để chạy các script tại thư mục `.agent/skills/clickup-expert/scripts/` khi:
- **Logic phức tạp**: Tổng hợp dữ liệu từ nhiều nguồn (ví dụ: báo cáo Sprint tự động).
- **Batch Processing**: Quét và xử lý hàng loạt task (ví dụ: `check_missing_duedates.js`).
- **Dự phòng (Fallback)**: Khi kết nối MCP gặp sự cố không thể khắc phục.

## Quy tắc Vận hành & Best Practices
- **Anti-Hallucination**: Tuyệt đối không đoán ID. Nếu không tìm thấy, phải báo cáo người dùng để được cung cấp.
- **Minh bạch Link**: Luôn trả về URL của Task/Doc sau khi tạo hoặc cập nhật.
- **Logging**: Kèm theo comment giải trình khi thay đổi trạng thái task quan trọng.
- **Quản lý lỗi**: Gợi ý kiểm tra `CLICKUP_API_KEY` nếu gặp lỗi xác thực (Authorization).

## Tài liệu tham khảo
- `references/mcp-tools.md` - Hướng dẫn chi tiết các công cụ MCP.
- `.env` tại root dự án.
- ClickUp API Documentation (developer.clickup.com).
