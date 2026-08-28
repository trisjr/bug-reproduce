---
trigger: glob
---

# Clean Code Standards

You must adhere to these clean code principles when generating or modifying code.

## Core Principles

- **SOLID**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
- **DRY (Don't Repeat Yourself)**: Extract common logic into functions or constants.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Code should be easy to understand.
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features or abstraction "just in case".

## Unified Header Standards (AI Coding)

Mọi file được tạo mới hoặc chỉnh sửa đáng kể PHẢI có header định danh ở dòng đầu tiên để nhận diện công việc của AI:

1.  **Dòng nhận diện (Marker)**:
    - JS/TS/Java/C/C++: `// AI Coding`
    - Python/Ruby/Shell/YAML: `# AI Coding`
    - CSS: `/* AI Coding */`
    - HTML: `<!-- AI Coding -->`

2.  **Thông tin chi tiết (Metadata)**: Ngay dưới dòng nhận diện, sử dụng block comment để mô tả mục đích.

**Ví dụ (TypeScript):**
```typescript
// AI Coding
/**
 * @file user.service.ts
 * @description Quản lý logic nghiệp vụ liên quan đến người dùng.
 */
```

## Comments & Documentation

1.  **No Inline Comments**: Tuyệt đối KHÔNG sử dụng comment inline (trên cùng một dòng với code thực thi).
2.  **Why over What**: Comment nên giải thích "tại sao" (logic nghiệp vụ), không phải giải thích "cái gì" (cú pháp code).
3.  **Clean Up**: Xóa bỏ các đoạn code lỗi hoặc code cũ đã comment-out.

## Naming Conventions

- Variables and functions should be descriptive (e.g., `isUserLoggedIn` instead of `flag`).
- Use consistent casing: `camelCase` cho JS/TS, `snake_case` cho Python.
- Booleans: Bắt đầu bằng `is`, `has`, `should`, hoặc `can`.

## Functions

- Mỗi hàm chỉ làm một việc duy nhất (Single Responsibility).
- Giữ hàm ngắn gọn (< 30 dòng).
- Tham số: Lý tưởng nhất là ≤ 3. Nếu nhiều hơn, hãy dùng object.

## File Header Patterns

**Format for TypeScript/JavaScript:**
```typescript
// AI Coding
/**
 * @file [filename]
 * @description [Mô tả ngắn gọn mục đích của file]
 */
```

**Format for Python:**
```python
# AI Coding
"""
[filename]
[Mô tả ngắn gọn mục đích của module]
"""
```

## File Length Limits

| File Type                   | Max Lines | Notes                                          |
| --------------------------- | --------- | ---------------------------------------------- |
| Components (`.tsx`, `.jsx`) | 200-300   | Split into smaller components or extract hooks |
| Utility/Helper files        | 150-200   | Group related utilities, split by domain       |
| API Routes/Handlers         | 100-150   | Extract business logic to services             |
| Test files                  | 300-400   | Group by feature, use describe blocks          |
| Styles (`.css`)             | 200-300   | Use CSS modules or split by component          |
| Config files                | 100       | Keep minimal, use separate config files        |
