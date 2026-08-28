---
name: sequential-thinking
description: Sử dụng khi các bài toán phức tạp yêu cầu suy luận tuần tự từng bước một (step-by-step reasoning), với khả năng sửa đổi (revise thoughts), rẽ nhánh (branch), hoặc điều chỉnh scope (phạm vi) linh hoạt. Thích hợp cho phân tích đa bước, plan thiết kế, và decomposition vấn đề.
license: MIT
---

# Sequential Thinking

Cho phép giải quyết vấn đề có cấu trúc thông qua suy luận lặp lại (iterative reasoning) với các khả năng revision (chỉnh sửa) và branching (rẽ nhánh).

## Mục lục (Table of Contents)
1. Khả năng Cốt lõi (Core Capabilities)
2. Khi nào Sử dụng (When to Use)
3. Cách dùng Cơ bản (Basic Usage)
4. Workflow Pattern
5. Ví dụ Đơn giản (Simple Example)
6. Các tính năng Nâng cao (Advanced Features)
7. Mẹo Vặt (Tips)
8. Tài Liệu Tham Khảo (References)

## 1. Khả năng Cốt lõi (Core Capabilities)

- **Iterative reasoning**: Phân chia các bài toán phức tạp thành các bước suy nghĩ tuần tự (sequential thought steps).
- **Dynamic scope**: Điều chỉnh linh hoạt số lượng thought dự kiến (total thought count) khi độ hiểu biết về bài toán tăng lên.
- **Revision tracking**: Xem xét và sửa chữa các kết luận trước đó.
- **Branch exploration**: Khám phá các luồng suy luận (reasoning paths) thay thế từ bất kỳ điểm nào.
- **Maintained context**: Duy trì và theo dõi chuỗi logic trong suốt quá trình phân tích.

## 2. Khi nào Sử dụng (When to Use)

Sử dụng tool `mcp__reasoning__sequentialthinking` khi:
- Bài toán yêu cầu tính toán logic hoặc suy luận liên kết qua nhiều bước.
- Cách tiếp cận hoặc scope ban đầu chưa rõ ràng.
- Gặp khó khăn và cần phải filtering qua sự phức tạp để tìm vấn đề (core issues).
- Có thể cần phải quay lui (backtrack) hoặc sửa các phán đoán trước đó.
- Muốn rẽ nhánh để explore solution paths thay thế.

**Tuyệt đối không dùng cho**: Các queries đơn giản, truy xuất facts trực tiếp, hoặc các task chạy 1 lệnh là xong (single-step tasks).

## 3. Cách dùng Cơ bản (Basic Usage)

Công cụ `mcp__reasoning__sequentialthinking` cần các tham số sau:

### Tham số bắt buộc (Required Parameters)

- `thought` (string): Bước suy luận hiện tại.
- `nextThoughtNeeded` (boolean): Cần tiếp tục step suy nghĩ tiếp theo hay không.
- `thoughtNumber` (integer): Số thứ tự bước hiện tại (base: 1).
- `totalThoughts` (integer): Số dự kiến còn lại của toàn project.

### Tham số tùy chọn (Optional Parameters)

- `isRevision` (boolean): Chuyển về trạng thái revise các thought từng tạo.
- `revisesThought` (integer): Thought đang được sửa đổi nội dung.
- `branchFromThought` (integer): Đầu mối Thought để rẽ nhánh.
- `branchId` (string): Identifier cho logic path mới.

## 4. Workflow Pattern

```
1. Bắt đầu với thought mở màn (thoughtNumber: 1)
2. Ở mỗi bước:
   - Trình bày suy luận hiện tại ở tham số `thought`
   - Cập nhật số việc còn lại thông qua `totalThoughts` (điều chỉnh động)
   - Lưu trữ `nextThoughtNeeded: true` để luân chuyển tiếp
3. Khi đưa ra kết luận, set `nextThoughtNeeded: false`
```

## 5. Ví dụ Đơn giản (Simple Example)

```typescript
// Bước 1: 
{
  thought: "Vấn đề liên quan đến tối ưu hóa database queries. Cần nhận dạng bottlenecks trước tiên.",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
}

// Bước 2: 
{
  thought: "Phân tích query patterns cho thấy lỗi N+1 problem khi fetch users.",
  thoughtNumber: 2,
  totalThoughts: 6, // Điều chỉnh Scope
  nextThoughtNeeded: true
}

// ... Cứ xử lý đến mức Done
```

## 6. Các tính năng Nâng cao (Advanced Features)

Về các Branching và Strategies workflows:
- [Advanced Usage](references/advanced.md) - Các patterns về revision và branching.
- [Examples](references/examples.md) - Thực tế ứng dụng thực thi.

## 7. Mẹo Vặt (Tips)

- Bắt đầu với mốc `totalThoughts` dự đoán chung chung, tinh chỉnh dần.
- Dùng chức năng **revision** khi điều kiện mặc định ban đầu sai.
- Dùng chức năng **branch** thay thế khi nhiều approach có vẻ phù hợp cùng lúc.
- Luôn hiển thị trạng thái thiếu chắn chắn (uncertainty) tại thought.
- Scope luôn mang tính estimate, khả năng đi đến đích chính xác mới là ưu tiên cao nhất.

## 8. Tài Liệu Tham Khảo (References)
- Tham khảo thêm tại các file trong thư mục `references`.
