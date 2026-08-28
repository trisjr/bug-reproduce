---
name: executing-tasks
description: Hướng dẫn thực thi kế hoạch triển khai (Implementation Plan) một cách tuần tự và có đối soát trạng thái.
---

# Executing Tasks

Skill này cho phép Agent thực hiện một cách thông minh các bước đã được vạch ra trong Implementation Plan, đảm bảo tính minh bạch và tránh nhầm lẫn.

## Table of Contents
1. [Quy trình thực thi](#quy-trình-thực-thi)
2. [Nguyên tắc hành động](#nguyên-tắc-hành-động)
3. [Xử lý lỗi & Trạng thái](#xử-lý-lỗi--trạng-thái)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Quy trình thực thi

Khi được yêu cầu "thực thi kế hoạch" hoặc khi vừa hoàn thành lập plan, Agent thực hiện chu kỳ sau:

1.  **Read & Select**: Đọc file Plan hiện hữu. Tìm task `[ ]` đầu tiên chưa hoàn thành (ưu tiên task có nhãn `@task`).
2.  **Execute Task**:
    - Nếu là task viết file: Sử dụng `write_to_file` hoặc `replace_file_content`.
    - Nếu là task chạy lệnh: Sử dụng `run_command`.
    - Luôn báo cáo cho User: *"Tôi đang thực hiện Task [Tên Task]..."*
3.  **Verification**: Sau khi thực hiện, Agent PHẢI tự kiểm tra lại kết quả (đọc lại file vừa sửa, chạy test, hoặc kiểm tra output terminal).
4.  **Mark Done**: Cập nhật trạng thái `[ ]` thành `[x]` trong file Plan bằng `replace_file_content`.
5.  **Iteration**: Tiếp tục task tiếp theo hoặc dừng lại báo cáo nếu đã hết Phase/Tasks.

## Nguyên tắc hành động

- **Không bỏ bước**: Tuyệt đối không nhảy cóc task trừ khi có yêu cầu từ User.
- **Minh bạch**: Sau mỗi 1-2 task quan trọng, hãy tóm tắt những gì đã làm và những gì sắp làm.
- **Dừng lại khi nghi ngờ**: Nếu gặp lỗi không có trong dự kiến, hãy dừng lại, giải thích vấn đề và đề xuất hướng xử lý mới cho User.

## Xử lý lỗi & Trạng thái

- `[ ]`: Chưa làm.
- `[/]`: Đang thực hiện hoặc hoàn thành một phần.
- `[x]`: Đã hoàn thành và verify thành công.
- `[!]`: Gặp lỗi (cần chú ý).

---
## Tài liệu tham khảo
- [Universal Workflow (AGENTS.md)](../../../AGENTS.md#3-universal-workflow-6-bước)
- [Writing Plans Skill](../writing-plans/SKILL.md)
