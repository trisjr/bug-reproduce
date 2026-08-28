# Task Comment Template

Standard template for composing status update comments after creating a PR.
Rendered by the `clickup-commenter` skill directly using native Markdown.

---

## Template Structure

```markdown
## ✅ Pull Request Created

{{SUMMARY}}

**Related PRs:**

{{PR_LIST}}
```

## Placeholder Reference

| Placeholder | Description | Example |
| :--- | :--- | :--- |
| `{{SUMMARY}}` | Summary of key changes (1-2 sentences) | "Implemented point conversion logic updates to ensure accuracy." |
| `{{PR_LIST}}` | List of PRs formatted strictly according to the PR List rule | `- \`loyalty-frontend\` \| [PR #129](https://github.com/...)` |

## Content Rules

1. **Tone:** Write as the **Assignee/User completing the task**. DO NOT use "I am an AI" or an assistant persona. Write the actual comment in **English**.
2. **Concise:** Summarize in 3-5 lines. Do not copy the entire PR body content.
3. **Traceability:** Always include the PR link so the reviewer can click directly.
4. **PR List Format:** You **MUST** format each PR in the `{{PR_LIST}}` exactly like this:
   `- \`repository-name\` | [PR #NUMBER](https://github.com/owner/repo/pull/NUMBER)`
   *(Do NOT deviate from this format. Ensure the repository name is wrapped in backticks and separated by a pipe `|`).*
