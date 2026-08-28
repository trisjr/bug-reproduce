#!/usr/bin/env python3
"""
ClickUp Markdown Comment Script
================================
Gửi comment có hỗ trợ rich text lên ClickUp Task thông qua API v2.

ClickUp API v2 không hỗ trợ Markdown cho comment, nhưng hỗ trợ rich text
thông qua structured JSON format với mảng `comment` chứa các object
có `text` và `attributes`.

Script này parse Markdown đơn giản và chuyển đổi sang ClickUp rich text format.

Usage:
  python .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> "<markdown_content>"
  python .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> --file <path_to_md_file>

Environment Variables (từ .env):
  - CLICKUP_API_KEY: Personal API Token của ClickUp

References:
  - https://developer.clickup.com/reference/createtaskcomment
"""

import os
import sys
import json
import re
import urllib.request
import urllib.error


def load_env(env_path=None):
    """Load biến môi trường từ file .env (lightweight, không cần python-dotenv)."""
    if env_path is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # go up 4 levels: scripts -> clickup-commenter -> skills -> .agent -> root
        env_path = os.path.abspath(os.path.join(script_dir, "../../../../.env"))

    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value:
                os.environ.setdefault(key, value)


def markdown_to_clickup_comment(md_text):
    """
    Parse Markdown text thành ClickUp structured comment format.

    ClickUp comment format dùng mảng `comment` với các object:
    - {"text": "...", "attributes": {"bold": true, "italic": true, ...}}
    - {"text": "...", "type": "tag", "attributes": {"class": "..."}}

    Hỗ trợ:
    - ## Heading → bold text + newline
    - **bold** → {"bold": true}
    - *italic* → {"italic": true}
    - `code` → {"code": true}
    - [text](url) → dùng text + url inline
    - - list items → bullet point (•)
    - Newlines
    """
    comment_parts = []
    lines = md_text.strip().split("\n")

    for i, line in enumerate(lines):
        stripped = line.strip()

        if not stripped:
            comment_parts.append({"text": "\n"})
            continue

        # Heading: ## text → bold
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading_match:
            heading_text = heading_match.group(2)
            parsed = _parse_inline(heading_text)
            # Make all heading parts bold
            for part in parsed:
                if "attributes" not in part:
                    part["attributes"] = {}
                part["attributes"]["bold"] = True
            comment_parts.extend(parsed)
            comment_parts.append({"text": "\n"})
            continue

        # List item: - text → • text
        list_match = re.match(r"^[-*]\s+(.+)$", stripped)
        if list_match:
            list_text = list_match.group(1)
            comment_parts.append({"text": "• "})
            comment_parts.extend(_parse_inline(list_text))
            comment_parts.append({"text": "\n"})
            continue

        # Regular line
        comment_parts.extend(_parse_inline(stripped))
        comment_parts.append({"text": "\n"})

    # Remove trailing newline
    if comment_parts and comment_parts[-1] == {"text": "\n"}:
        comment_parts.pop()

    return comment_parts


def _parse_inline(text):
    """
    Parse inline Markdown patterns: **bold**, *italic*, `code`, [text](url), <@user_id>.
    Returns list of ClickUp comment parts.
    """
    parts = []
    # Named groups để tránh index lệch
    pattern = re.compile(
        r"(?P<bold>\*\*(?P<bold_text>.+?)\*\*)"
        r"|(?P<italic>\*(?P<italic_text>.+?)\*)"
        r"|(?P<code>`(?P<code_text>.+?)`)"
        r"|(?P<link>\[(?P<link_text>.+?)\]\((?P<link_url>.+?)\))"
        r"|(?P<tag><@(?P<tag_id>\d+)>)"
        r"|(?P<plain>[^*`<\[]+)"
    )

    for match in pattern.finditer(text):
        if match.group("bold_text"):
            parts.append({
                "text": match.group("bold_text"),
                "attributes": {"bold": True}
            })
        elif match.group("italic_text"):
            parts.append({
                "text": match.group("italic_text"),
                "attributes": {"italic": True}
            })
        elif match.group("code_text"):
            parts.append({
                "text": match.group("code_text"),
                "attributes": {"code": True}
            })
        elif match.group("link"):
            parts.append({
                "text": match.group("link_text"),
                "attributes": {"link": match.group("link_url")}
            })
        elif match.group("tag"):
            parts.append({
                "text": match.group("tag"),
                "type": "tag",
                "user": {"id": int(match.group("tag_id"))}
            })
        elif match.group("plain"):
            parts.append({"text": match.group("plain")})

    return parts


def create_rich_comment(task_id, content_md, api_key):
    """
    Gửi comment rich text lên ClickUp Task sử dụng API v2 với structured format.

    Args:
        task_id: ID của task
        content_md: Nội dung comment dạng Markdown
        api_key: ClickUp Personal API Token

    Returns:
        dict: Response từ ClickUp API
    """
    url = f"https://api.clickup.com/api/v2/task/{task_id}/comment"

    # Convert markdown to structured comment
    comment_parts = markdown_to_clickup_comment(content_md)

    payload = json.dumps({
        "comment": comment_parts,
        "notify_all": False,
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": api_key,
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No response body"
        print(f"❌ HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        print(f"   Response: {error_body}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ Connection Error: {e.reason}", file=sys.stderr)
        sys.exit(1)


def main():
    load_env()

    api_key = os.environ.get("CLICKUP_API_KEY", "").strip()
    if not api_key:
        print("❌ CLICKUP_API_KEY không được tìm thấy trong .env hoặc environment.", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 3:
        print("Usage:", file=sys.stderr)
        print('  python .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> "<markdown_content>"', file=sys.stderr)
        print("  python .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> --file <path_to_md_file>", file=sys.stderr)
        sys.exit(1)

    task_id = sys.argv[1]

    if sys.argv[2] == "--file":
        if len(sys.argv) < 4:
            print("❌ Thiếu đường dẫn file sau --file", file=sys.stderr)
            sys.exit(1)
        file_path = sys.argv[3]
        if not os.path.exists(file_path):
            print(f"❌ File không tồn tại: {file_path}", file=sys.stderr)
            sys.exit(1)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = sys.argv[2]

    if not content.strip():
        print("❌ Nội dung comment không được để trống.", file=sys.stderr)
        sys.exit(1)

    print(f"📤 Đang gửi rich text comment lên task {task_id}...")
    result = create_rich_comment(task_id, content, api_key)

    comment_id = result.get("id", "N/A")
    print(f"✅ Comment đã được tạo thành công!")
    print(f"   Comment ID: {comment_id}")
    print(json.dumps({"success": True, "comment_id": comment_id}))


if __name__ == "__main__":
    main()
