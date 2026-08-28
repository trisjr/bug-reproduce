# Markdown Support Reference — ClickUp API

Reference for supported Markdown syntax and limitations when posting comments to ClickUp via API v2.

## Core Issue

ClickUp API v2 **does not support plain Markdown** for comments. Instead, it requires a structured JSON format — an array of `comment` objects with `text` and `attributes` fields.

The `clickup_comment_md.py` script handles this conversion automatically.

## Supported Syntax

| Markdown Syntax | ClickUp Rendering | Notes |
| :--- | :--- | :--- |
| `## Heading` | **Heading** (bold) | All heading levels (h1–h6) render as bold |
| `**bold text**` | **bold text** | |
| `*italic text*` | *italic text* | |
| `` `inline code` `` | `inline code` | |
| `[text](url)` | text (hyperlinked) | |
| `- list item` | • list item | Bullet character `•` |
| `* list item` | • list item | Alternative list syntax |
| `<@user_id>` | @mention user | `user_id` must be a ClickUp integer user ID |
| Blank line | Blank line | Creates paragraph spacing |

## Unsupported Features

| Feature | Status | Workaround |
| :--- | :--- | :--- |
| Tables | ❌ Not supported | Use bullet lists |
| Fenced code blocks (` ``` `) | ❌ Not supported | Use inline code or plain text |
| Strikethrough (`~~text~~`) | ❌ Not supported | — |
| Checkboxes (`- [ ]`) | ❌ Not supported | Use `•` with status label |
| Images | ❌ Not supported via API | Upload file separately |
| Nested lists | ⚠️ Limited | Only 1 level deep |

## ClickUp Structured JSON Example

Markdown input:
```markdown
## ✅ Title

Body text with **bold** and *italic*.

- Item 1
- Item 2 with [link](https://example.com)
```

Converted JSON:
```json
{
  "comment": [
    {"text": "✅ Title", "attributes": {"bold": true}},
    {"text": "\n"},
    {"text": "\n"},
    {"text": "Body text with "},
    {"text": "bold", "attributes": {"bold": true}},
    {"text": " and "},
    {"text": "italic", "attributes": {"italic": true}},
    {"text": "."},
    {"text": "\n"},
    {"text": "\n"},
    {"text": "• "},
    {"text": "Item 1"},
    {"text": "\n"},
    {"text": "• "},
    {"text": "Item 2 with "},
    {"text": "link", "attributes": {"link": "https://example.com"}}
  ],
  "notify_all": false
}
```

## Configuration

`CLICKUP_API_KEY` must be declared in `.env` at the project root:

```env
CLICKUP_API_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Obtain your API key at: ClickUp → Settings → Apps → API Token.
