---
name: microsoft-teams-expert
description: Gửi tin nhắn và thông báo tới Microsoft Teams thông qua các workflow Power Automate. Hỗ trợ gửi tới thành viên (qua email) và kênh (qua conversation ID).
---

# Microsoft Teams Expert

Skill này cung cấp các tiện ích để tương tác với Microsoft Teams thông qua Power Automate Webhooks. Nó giúp đơn giản hóa quá trình gửi thông báo hoặc tin nhắn tới các thành viên hoặc kênh cụ thể.

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Cách sử dụng](#cách-sử-dụng)
3. [Cấu hình môi trường](#cấu-hình-môi-trường)
4. [Dữ liệu tham khảo](#dữ-liệu-tham-khảo)
5. [Quy tắc định dạng](#quy-tắc-định-dạng)
6. [Mẫu kích hoạt (Trigger Patterns)](#mẫu-kích-hoạt-trigger-patterns)
7. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Năng lực cốt lõi (Core Capabilities)

1.  **Gửi tới Kênh (Send to Channel)**: Gửi tin nhắn tới một Kênh Teams cụ thể thông qua Conversation ID.
2.  **Gửi tới Thành viên (Send to Member)**: Gửi tin nhắn trực tiếp tới một Thành viên Teams thông qua Địa chỉ Email.

## Cách sử dụng (Usage)

### 1. Gửi tới Kênh (Send to Channel)
Sử dụng script `send_to_channel.js` để kích hoạt workflow cho một kênh cụ thể.
```bash
node scripts/send_to_channel.js <conversation_id> <message>
```
- `conversation_id`: Định danh duy nhất (ví dụ: `19:xxx@thread.v2`).
- `message`: Nội dung tin nhắn (Plain text, Markdown, hoặc Adaptive Card JSON).

### 2. Gửi tới Thành viên (Send to Member)
Sử dụng script `send_to_member.js` để kích hoạt workflow cho một thành viên cụ thể.
```bash
node scripts/send_to_member.js <email> <message>
```

## Cấu hình môi trường (Configuration)
Các script yêu cầu các biến môi trường trong file `.env` tại root dự án:
```env
MICROSOFT_TEAMS_FLOW_CHANNEL_URL=https://...
MICROSOFT_TEAMS_FLOW_MEMBER_URL=https://...
```

## Dữ liệu tham khảo (Reference Data)
Tham khảo file `resources/channels.json` để ánh xạ giữa tên team/kênh và ID tương ứng. Ví dụ: **TEAM BOM**.

## Quy tắc định dạng (Formatting Rules)
- **Tin nhắn nhiều dòng**: Khi gửi tin nhắn nhiều dòng qua Terminal, hãy sử dụng dấu xuống dòng thực tế (literal newlines) thay vì ký tự `\n`.

## Mẫu kích hoạt (Trigger Patterns)
- "Hãy thông báo lên teams những cập nhật đó cho team BOM"
- "Gửi tin nhắn riêng cho Quan Nguyen"
- "Notify member [name/email] about..."

## Tài liệu tham khảo
- Power Automate Documentation for Teams Integration.
- Adaptive Cards Designer (adaptivecards.io).
- `resources/channels.json`.
