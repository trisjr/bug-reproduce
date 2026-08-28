---
name: clickup-commenter
description: "Post Markdown comments to any ClickUp task. Accepts 3 input types: task_id + inline markdown string, task_id + path to a .md file, or task_id + AI-generated content from the current session. Use when updating task status, reporting PR results, writing review notes, or any notification to a ClickUp task."
---

# ClickUp Commenter

Specialized skill for posting rich-text comments to ClickUp tasks. Accepts a `task_id` and Markdown content, converts it to ClickUp structured JSON format, and sends it via the API.

## When to Use

- `opsx:submit` workflow needs to report a newly created PR to a ClickUp task.
- `QA` skill wants to log test results to a task.
- Scrum Master wants to attach a daily standup summary to an Epic.
- Any need to post custom Markdown content to a ClickUp task.

## Inputs

| Parameter | Required | Description |
| :--- | :---: | :--- |
| `task_id` | ✅ | ClickUp task ID (e.g., `abc123xyz`) |
| `content` | ✅ (one of two) | Markdown string provided inline |
| `file_path` | ✅ (one of two) | Path to a `.md` file containing comment content |

> **Note:** Provide either `content` OR `file_path`. If both are given, `file_path` takes precedence.

## Execution Process

### Step 1: Validate Input

- `task_id` must not be empty.
- Either `content` (non-empty string) or `file_path` (file must exist) must be provided.
- If missing, stop and ask the User.

### Step 2: Prepare Content

**Case A — Input is `content` (inline Markdown string):**
1. Write content to temp file: `/tmp/clickup_comment.md`
2. Set `file_path = /tmp/clickup_comment.md`

**Case B — Input is `file_path`:**
1. Use directly, no temp file needed.

### Step 3: Preview & Confirm

1. Display the Markdown content for User review.
2. Ask: *"The above content will be posted to task `{task_id}`. Confirm?"*
3. **Only post after User approval.** Never auto-post without confirmation.

> **Callers may override Step 3:** Workflows like `opsx:submit` explicitly instruct this step to be skipped via AUTO-PROCEED.

### Step 4: Execute

Run the following command:

```bash
python3 .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> --file <file_path>
```

> **Requirement:** `CLICKUP_API_KEY` must be set in the `.env` file at the project root.

### Step 5: Report Result

- **Success:** Print `Comment ID` and success message.
- **Failure:** Print specific HTTP error and suggest likely causes (wrong API key, invalid task_id, etc.).

## Usage Examples

### Example 1: Inline content
```
task_id: abc123xyz
content: |
  ## ✅ PR Created

  Refactored the auth module, extracted JWT logic into a dedicated service.

  **Related PRs:**
  - `auth-service` | [PR #42](https://github.com/org/auth-service/pull/42)
```

### Example 2: From file
```
task_id: abc123xyz
file_path: /tmp/sprint_summary.md
```

## Resources

| File | Purpose | Load Trigger |
| :--- | :--- | :--- |
| `scripts/clickup_comment_md.py` | Converts Markdown to ClickUp rich-text JSON and posts via API | Step 4 |
| `references/markdown-support.md` | Supported Markdown syntax and ClickUp API limitations | When troubleshooting formatting |
