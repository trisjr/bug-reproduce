---
author: trisjr
description: Mandatory formatting guidelines when interacting with ClickUp through the MCP Layer (mcp_clickup).
---

# ClickUp MCP Formatting Rule (TNMCORE-OS Standard)

> [!IMPORTANT]
> This is a **MANDATORY** rule (System Constitution) for every Agent and Role (PO, Architect, Engineer...) when creating or updating Tickets (Tasks) on ClickUp via the MCP protocol (`mcp_clickup`).

## 1. MCP Invocation Rule (The `markdown_description` Rule)

When using content manipulation tools like `clickup_create_task` or `clickup_update_task`:

- **ABSOLUTELY DO NOT** use the basic `description` parameter (Plain text format) unless explicitly instructed otherwise.
- **ALWAYS** inject the entire work content payload into the `markdown_description` parameter. This ensures all Headers, Checklists (Task Lists), and Alerts are preserved and compatible with the ClickUp GUI.

## 2. Formatting Standards (Markdown Blueprints)

Any content (payload) passed to `markdown_description` **MUST MAP 1:1 WITH DEFINED TEMPLATES** of TNMCORE-OS. Depending on the nature of the Work Item, the Agent must select the appropriate template:

### A. For Task/Feature (New feature, Plan, Infrastructure)

> Must be based on the standard form at: **`knowledge-base/99-Templates/Template-ClickUp-Task.md`**

### B. For Bug/System Error (Reporting, Logging, Debugging)

> Must be based on the standard form at: **`knowledge-base/99-Templates/Template-ClickUp-Bug.md`**

---

### General Conventions (For Agent Rendering):

1. **Emojis:** Must maintain Context Classification Emojis in the Title (`🚀`, `🐞`, `🏗️`, `⚙️`).
2. **Lists & Alerts:** Apply standard GitHub-favored Task lists (`- [ ]`) for checklists. Must use Markdown Blockquotes (`> [!NOTE]`, `> [!WARNING]`) for important content.
3. **Signatures:** Always conclude the Ticket content with 2 lines of identification notice (Following SDC Standard):

   ```markdown
   ---

   _Created by [Agent Name]_
   _Author: trisjr_
   ```
