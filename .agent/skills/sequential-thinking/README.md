# Kỹ năng Sequential Thinking (Sequential Thinking Skill)

Một Agent skill cho phép triển khai giải pháp xử lý tư duy chuỗi một cách hệ thống, tái tạo reasoning lặp lại kèm tracking logic branches.

## Mục lục (Table of Contents)
1. Ứng dụng Kỹ năng Này (What This Skill Does)
2. Hướng dẫn Cài đặt (Installation)
3. Hướng dẫn Sử dụng (Usage)
4. Cách thức Cấu hình (Configuration)
5. Cấu trúc Skill (Skill Structure)
6. Triggering Kỹ năng (When Claude Uses This Skill)
7. Tài Liệu Tham Khảo (References)

## 1. Ứng dụng Kỹ năng Này (What This Skill Does)

Cho phép Claude/Antigravity chia nhỏ các dạng vấn đề siêu phức tạp thành từng steps độc lập để xử lý logic (thought steps), với việc rẽ nhánh, tái lập (revise) các đường lối sai với tốc độ tối ưu, đảm bảo logic chain context vẫn mạch lạc trong quá trình triển khai cấu trúc giải quyết.

## 2. Hướng dẫn Cài đặt (Installation)

Skill cài cắm cần chạy MCP server `sequential-thinking` để khả dụng hoạt động tại Desktop Client hay Config Files.

### B1: Install MCP Server
#### Via NPX (Khuyên dùng)

Thêm param config tại `mcp_config.json`:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

#### Via Docker (Đối lưu)
```json
{
  "mcpServers": {
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/sequentialthinking"]
    }
  }
}
```

### B2: Cài Skill Folder vào Project
Chép code repo skill `sequential-thinking` qua thư mục sau:
```bash
cp -r sequential-thinking /path/to/your/project/.agent/skills/
```

### B3: Kiểm thử
Restart lại Application và kiểm tra tool `mcp__reasoning__sequentialthinking`.

## 3. Hướng dẫn Sử dụng (Usage)

Khi tích hợp lên thành công, Agent sẽ chạy tự sinh khi:
- Gặp 1 logic step nhiều tầng hoặc lặp luồng.
- Phải đập đi xây lại (revise conclusions).
- Mò mẫm qua các concept luồng rẽ nhánh linh tinh.
- Bị mập mờ trong solution flow.

Cũng có thể gọi explicit:
```
"Phân tích hệ thống này với Sequential Thinking step-by-step cho em."
```

## 4. Cách thức Cấu hình (Configuration)

### Disable Logging (Optional)
Tắt cơ chế ghi debug log, config thông số `ENV` theo object:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {
        "DISABLE_THOUGHT_LOGGING": "true"
      }
    }
  }
}
```

## 5. Cấu trúc Skill (Skill Structure)

```
sequential-thinking/
├── SKILL.md              # Khai báo Skill definitions
├── README.md             # File chứa nội dung hiện tại
└── references/
    ├── advanced.md       # Revision và branching design patterns
    └── examples.md       # Use Cases ứng dụng cho Thực tiễn
```

## 6. Triggering Kỹ năng (When Claude Uses This Skill)

Kỹ năng này hoạt động với hiệu suất tốt nhất tại:
- **Complex analysis (Tư duy Siêu phân tích)**: Đập nhuyễn đa điểm mù kỹ thuật.
- **Design decisions (Logic thiết kế)**: Lọc và optimize Trade-offs.
- **Debugging**: Trừ khử triệt để code flaws với course tracking.
- **Planning**: Lên timeline, kiến trúc dự án thay đổi thường trực (Evolving scope).
- **Architecture**: Lọc qua các framework/mô hình tối ưu hơn.

## 7. Tài Liệu Tham Khảo (References)
- [MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Agent Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview.md)
