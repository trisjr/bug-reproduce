---
name: pr-templates
description: Manage and render standard templates for Pull Request bodies and Task comments. Automatically load templates and insert information based on code change context. Used when creating a PR or drafting comment content for task trackers.
---

# PR Templates

This skill provides standardized templates for Pull Request content and Task comments. It acts as the single source of truth (SSOT) for PR structures across the system.

## When to use

- When the `opsx:submit` workflow needs to render a PR body.
- When drafting a status update comment for a task (ClickUp/GitHub Issue).
- When a new project requires custom templates — override files in `assets/`.

## Assets

| File | Purpose |
|:-----|:---------|
| `assets/pr-body-template.md` | PR body content template containing `{{VARIABLE}}` placeholders |
| `assets/task-comment-template.md` | Task comment template (universal for all platforms) |

## How to use

### 1. Render PR Body

1. Read the `assets/pr-body-template.md` file.
2. Replace the placeholders with actual information from context:

| Placeholder | Data Source |
|:------------|:---------------|
| `{{TASK_LINK}}` | Provided by the User during the Discovery step |
| `{{FIGMA_LINK}}` | Provided by the User or `[N/A]` |
| `{{RELATED_PRS}}` | The `CREATED_PRS[]` list or `[N/A]` |
| `{{PROBLEM_DESCRIPTION}}` | Analysis from code diff and task context |
| `{{SOLUTION_DESCRIPTION}}` | Analysis from code diff and commit message |
| `{{KEY_CHANGES}}` | Synthesized from the list of changed files |
| `{{TESTING_EVIDENCE}}` | Results from typecheck/lint/test if applicable |
| `{{SCREENSHOTS}}` | `[N/A]` or image links provided by the User |
| `{{IMPACT_RISKS}}` | Assessment based on the change scope |

3. The final output is a Markdown string ready to be passed into the `body` parameter of the `create_pull_request` MCP.

### 2. Render Task Comment

See details in the `task-commenter` skill — that skill will read `assets/task-comment-template.md` and render it according to the specific platform.

## Customization

To customize templates for a specific project:
1. Copy the template file from `assets/` to the project directory (e.g., `src/my-project/.pr-template.md`).
2. Modify according to project needs.
3. The workflow will prioritize reading the template in the project directory first, falling back to the global template within this skill.
