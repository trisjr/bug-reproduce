# Requirement Elicitation & Analysis Guide

## 1. Elicitation Techniques (Kỹ thuật khơi gợi)

### 1.1 Stakeholder Interviews
*   **Purpose**: Hiểu sâu về nhu cầu cá nhân, pain points và kỳ vọng.
*   **Key Questions**:
    *   "Why do you need this feature?" (Ask 'Why' 5 times to find root cause)
    *   "What happens if we don't build this?"
    *   "Can you walk me through your current process?"

### 1.2 Document Analysis
*   **Purpose**: Hiểu hệ thống hiện tại thông qua tài liệu cũ, quy trình, reports.
*   **Action**: Review tài liệu input đầu vào (Docs, Excel, Legacy Code logic).

### 1.3 Interface Analysis
*   **Purpose**: Xác định requirements dựa trên thiết kế UI/UX hoặc tích hợp hệ thống.
*   **Focus**: Input, Output, Validation rules, Error states.

## 2. Analysis & Modeling (Phân tích & Mô hình hóa)

### 2.1 Process Modeling (BPMN/Flowcharts)
*   Dùng để visual luồng nghiệp vụ.
*   Phân biệt rõ: **User Action** vs **System Action**.

### 2.2 State Analysis
*   Dùng State Diagrams cho các đối tượng có vòng đời phức tạp (e.g., Order Status: New -> Pending -> Paid -> Shipped).

### 2.3 Gap Analysis
*   So sánh: **Current State (As-Is)** vs **Future State (To-Be)**.
*   Xác định những gì cần xây dựng để lấp đầy khoảng cách.

## 3. Prioritization Techniques (Sắp xếp ưu tiên)

### MoSCoW Method
*   **M - Must have**: Critical features, không có thì sản phẩm không hoạt động hoặc không bán được.
*   **S - Should have**: Quan trọng nhưng có thể workaround, hoặc deliver sau 1 chút.
*   **C - Could have**: "Nice to have", làm nếu dư resource.
*   **W - Won't have**: Thống nhất sẽ KHÔNG làm trong release này.
