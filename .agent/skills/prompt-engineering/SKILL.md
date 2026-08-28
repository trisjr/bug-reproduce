---
name: prompt-engineering
description: Hướng dẫn chuyên gia về các pattern của prompt engineering, các best practice và kỹ thuật tối ưu hóa. Sử dụng khi người dùng muốn cải thiện prompt, học các chiến lược gợi ý (prompting strategy), hoặc debug hành vi của tác nhân (agent).
---

# Prompt Engineering Patterns

Các kỹ thuật prompt engineering nâng cao để tối đa hóa hiệu năng, độ tin cậy và khả năng kiểm soát của LLM.

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Các Pattern chính](#các-pattern-chính)
3. [Best Practices](#best-practices)
4. [Các sai lầm thường gặp](#các-sai-lầm-thường-gặp)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Năng lực cốt lõi (Core Capabilities)

### 1. Few-Shot Learning

Dạy mô hình bằng cách hiển thị các ví dụ thay vì giải thích các quy tắc. Bao gồm 2-5 cặp input-output mô phỏng hành vi mong muốn. Sử dụng khi bạn cần định dạng nhất quán, các pattern suy luận cụ thể, hoặc xử lý các trường hợp biên (edge cases). Càng nhiều ví dụ càng tăng độ chính xác nhưng lại tiêu tốn token—hãy cân bằng dựa trên độ phức tạp của tác vụ.

**Ví dụ:**

```markdown
Trích xuất thông tin chính từ các support tickets:

Input: "My login doesn't work and I keep getting error 403"
Output: {"issue": "authentication", "error_code": "403", "priority": "high"}

Input: "Feature request: add dark mode to settings"
Output: {"issue": "feature_request", "error_code": null, "priority": "low"}

Bây giờ hãy xử lý: "Can't upload files larger than 10MB, getting timeout"
```

### 2. Chain-of-Thought Prompting

Yêu cầu mô hình suy luận từng bước (step-by-step reasoning) trước khi đưa ra câu trả lời cuối cùng. Thêm cụm từ "Let's think step by step" (zero-shot) hoặc bao gồm các dấu vết suy luận ví dụ (few-shot). Sử dụng cho các vấn đề phức tạp đòi hỏi logic nhiều bước, suy luận toán học, hoặc khi bạn cần xác minh quá trình tư duy của mô hình. Tăng độ chính xác cho các tác vụ phân tích từ 30-50%.

**Ví dụ:**

```markdown
Phân tích bug report này và xác định nguyên nhân gốc rễ (root cause).

Hãy suy nghĩ từng bước:

1. Hành vi mong đợi là gì?
2. Hành vi thực tế là gì?
3. Điều gì đã thay đổi gần đây có thể gây ra việc này?
4. Những component nào có liên quan?
5. Nguyên nhân gốc rễ có khả năng nhất là gì?

Bug: "Users can't save drafts after the cache update deployed yesterday"
```

### 3. Tối ưu hóa Prompt (Prompt Optimization)

Cải thiện prompt một cách hệ thống thông qua kiểm thử và tinh chỉnh. Bắt đầu đơn giản, đo lường hiệu năng (độ chính xác, tính nhất quán, mức sử dụng token), sau đó lặp lại (iterate). Kiểm thử trên các input đa dạng bao gồm cả các trường hợp biên. Sử dụng A/B testing để so sánh các biến thể. Quan trọng đối với các prompt trong production nơi tính nhất quán và chi phí là đóng vai trò then chốt.

**Ví dụ:**

```markdown
Phiên bản 1 (Đơn giản): "Summarize this article"
→ Kết quả: Độ dài không nhất quán, thiếu các ý chính

Phiên bản 2 (Thêm ràng buộc): "Summarize in 3 bullet points"
→ Kết quả: Cấu trúc tốt hơn, nhưng vẫn thiếu sắc thái

Phiên bản 3 (Thêm suy luận): "Identify the 3 main findings, then summarize each"
→ Kết quả: Nhất quán, chính xác, nắm bắt được thông tin quan trọng
```

### 4. Hệ thống Template (Template Systems)

Xây dựng các cấu trúc prompt có thể tái sử dụng với các biến (variables), các phần có điều kiện (conditional sections) và các component mô-đun. Sử dụng cho các cuộc hội thoại nhiều lượt (multi-turn), các tương tác dựa trên vai trò (role-based), hoặc khi cùng một pattern được áp dụng cho các input khác nhau. Giúp giảm trùng lặp và đảm bảo tính nhất quán trên các tác vụ tương tự.

**Ví dụ:**

```python
# Reusable code review template
template = """
Review this {language} code for {focus_area}.

Code:
{code_block}

Provide feedback on:
{checklist}
"""

# Usage
prompt = template.format(language="Python", focus_area="security vulnerabilities", code_block=user_code, checklist="1. SQL injection\n2. XSS risks\n3. Authentication")
```

### 5. Thiết kế System Prompt

Thiết lập hành vi và các ràng buộc toàn cục (global constraints) kéo dài suốt cuộc hội thoại. Định nghĩa vai trò của mô hình, cấp độ chuyên môn, định dạng output và các hướng dẫn an toàn. Sử dụng system prompt cho các chỉ dẫn ổn định không nên thay đổi theo từng lượt, giải phóng token trong user message cho các nội dung biến đổi.

**Ví dụ:**

```markdown
System: Bạn là một senior backend engineer chuyên về thiết kế API.

Quy tắc:

- Luôn xem xét khả năng mở rộng (scalability) và hiệu năng
- Gợi ý các RESTful patterns theo mặc định
- Cảnh báo các vấn đề bảo mật ngay lập tức
- Cung cấp ví dụ code bằng Python
- Sử dụng early return pattern

Định dạng phản hồi theo:

1. Phân tích (Analysis)
2. Khuyến nghị (Recommendation)
3. Ví dụ Code
4. Sự đánh đổi (Trade-offs)
```

## Các Pattern chính (Key Patterns)

### Tiết lộ tăng dần (Progressive Disclosure)

Bắt đầu với các prompt đơn giản, chỉ thêm độ phức tạp khi cần thiết:

1. **Cấp độ 1**: Chỉ dẫn trực tiếp
   - "Summarize this article"

2. **Cấp độ 2**: Thêm ràng buộc
   - "Summarize this article in 3 bullet points, focusing on key findings"

3. **Cấp độ 3**: Thêm suy luận
   - "Read this article, identify the main findings, then summarize in 3 bullet points"

4. **Cấp độ 4**: Thêm ví dụ
   - Bao gồm 2-3 ví dụ tóm tắt với các cặp input-output

### Phân cấp Chỉ dẫn (Instruction Hierarchy)

```
[System Context] → [Task Instruction] → [Examples] → [Input Data] → [Output Format]
```

### Khôi phục lỗi (Error Recovery)

Xây dựng các prompt có khả năng xử lý lỗi một cách tinh tế:

- Bao gồm các chỉ dẫn dự phòng (fallback instructions).
- Yêu cầu điểm số tin cậy (confidence scores).
- Yêu cầu các diễn giải thay thế khi không chắc chắn.
- Chỉ rõ cách xử lý khi thông tin bị thiếu.

## Best Practices

1. **Cụ thể (Be Specific)**: Các prompt mơ hồ tạo ra kết quả không nhất quán.
2. **Show, Don't Tell**: Các ví dụ hiệu quả hơn là các mô tả.
3. **Kiểm thử diện rộng**: Đánh giá trên các input đa dạng và mang tính đại diện.
4. **Lặp lại nhanh chóng**: Những thay đổi nhỏ có thể có tác động lớn.
5. **Giám sát hiệu năng**: Theo dõi các chỉ số trong môi trường production.
6. **Quản lý phiên bản (Version Control)**: Coi prompt như code với việc quản lý phiên bản phù hợp.
7. **Tài liệu hóa ý định**: Giải thích tại sao các prompt được cấu trúc như vậy.

## Các sai lầm thường gặp (Common Pitfalls)

- **Over-engineering**: Bắt đầu với các prompt phức tạp trước khi thử các prompt đơn giản.
- **Ô nhiễm ví dụ (Example pollution)**: Sử dụng các ví dụ không phù hợp với tác vụ mục tiêu.
- **Tràn ngữ cảnh (Context overflow)**: Vượt quá giới hạn token với quá nhiều ví dụ.
- **Chỉ dẫn mơ hồ**: Để lại không gian cho nhiều cách hiểu khác nhau.
- **Bỏ qua các trường hợp biên**: Không kiểm thử trên các input bất thường hoặc tại ranh giới.

## Tài liệu tham khảo
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Learn Prompting](https://learnprompting.org)
