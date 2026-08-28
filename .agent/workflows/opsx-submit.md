---
description: Automate the process of creating a new branch, creating selective commits, and opening a Pull Request (PR) according to Monorepo project standards.
author: trisjr
---

// turbo-all

# 🚀 Workflow: Submit Pull Request (Monorepo Standard)

Automated workflow from code completion to opening a fully formatted Pull Request on our Monorepo codebase.

**Dependent Skills:**

- `pr-templates` — Templates for PR body and Task comments.
- `clickup-commenter` — Posts Markdown comments to ClickUp tasks.
- `github-mcp-server` — Posts Markdown comments to GitHub Issues (`add_issue_comment`).
- `task-logger` — Automatically logs completed task into weekly task-log markdown files.

**🔧 Tool Selection Strategy (Hybrid MCP + CLI):**

> This workflow combines **GitHub MCP** and **`gh` CLI** following these principles:
>
> - **MCP** → When the operation requires passing/receiving **long markdown bodies** (create PR, update PR cross-link) to avoid shell escaping issues.
> - **`gh` CLI** → When the operation is **simple with short outputs** (resolve username, assign PR). Saves output tokens.
> - **`run_command`** → Pure Git commands (`git status`, `git add`, `git commit`, `git push`).

> **📌 Inline Git Rules & Language (do not load external files):**
>
> - **MANDATORY LANGUAGE: 100% English for Commit messages, PR titles, PR bodies, and Task Comments.**
> - Branch format: `<type>/<GITHUB_USERNAME>/<short-description>` (must be entirely lowercase) — e.g., `feat/trisjr/referral-qr-modal`
> - Types: `feat | fix | refactor | chore | docs | ci`
> - Commit format: `<type>(<scope>): <description>` — lowercase, no trailing period
> - PR title format: `[Scope] Capitalized description` — e.g., `[Auth] Fix token api`
> - **MONOREPO RULE:** The repository is a single unified repository at HUB_ROOT. Commits and Pull Requests are created directly on the root repository. NEVER use `git add .` blindly; ignore `package.json/package-lock.json` if the task does not modify libraries.

---

## Step 1: Gather Context & Evaluate Pause Conditions (Conditional Pause)

1. **Resolve HUB_ROOT:** Save the absolute path to the TNMCORE-OS root directory. This value is used throughout the workflow.

2. **Resolve Identities (priority order, stop at first match):**
   - **GITHUB_USERNAME:** `GITHUB_USERNAME` in `.env` → `gh api user --jq '.login'` _(fallback only if .env is empty → Save to env)_. _Note: If `gh api user` fails due to missing auth, output a Warning and fallback to `git config user.name` (skip step 4.5 Auto-Assign if fallback is triggered). Do NOT attempt to interact with GitHub CLI auth._

3. **Scan Git Status (Monorepo Root):**
   - Run `git status -s` directly at HUB_ROOT to analyze modified files.

4. **Pause Condition Evaluation:**
   Evaluate if we need to pause, based on two conditions:
   - **Condition 1:** The list of pending files contains `package.json` or `package-lock.json`.
   - **Condition 2:** The User has NOT provided a Task/Ticket Link (or explicitly specified `[N/A]`) in this session.

   **If EITHER condition is true, PAUSE and ask the User:**

   ```text
   📋 I found the following files waiting to be committed at Monorepo Root:
   path/to/file.ts, path/to/other.ts

   ⚠️ (If Condition 1 is true) Dependencies modified (package files detected).
   Please confirm which exact files you want to commit, and provide the Task/Ticket Link (or [N/A])!
   ```

   _(Pause here, wait for User's response before proceeding)_

   **If BOTH conditions are false** (no package files AND Task Link/`[N/A]` is provided), **DO NOT PAUSE**. Proceed automatically to Step 2 and commit all available modified/tracked files.

---

## Step 2: Initialize Branch

1. Get the current branch of the root repository (`git rev-parse --abbrev-ref HEAD`). Save as `BASE_BRANCH` (e.g., `BASE_BRANCH = 'dev'`).
2. Determine `<type>` from the context of code changes.
3. Name the branch: `<type>/<GITHUB_USERNAME>/<short-description>` (NOTE: Ensure the entire string is lowercase and trim any spaces/replace with hyphens).
4. **Branch Collision Check:** `git branch --list <name>` (local) + `git ls-remote --heads origin <name>` (remote).
   - If it exists → Ask User: **(A)** Use existing branch, **(B)** Use a different name, **(C)** Delete and recreate. Wait for User's choice.
5. `git checkout -b <new-branch-name>`

---

## Step 3: Stage & Commit

1. `git add`: If proceeding automatically, add all modified files. If paused in Step 1, add strictly only the files confirmed by the User.
2. Auto-generate Commit Message following Conventional Commits.
3. `git commit -m "<commit message>"`

---

## Step 4: Push & Create PR

1. Retrieve `owner`, `repo` from `git remote -v`.
2. `git push -u origin HEAD`
3. **Render PR Body:** Call the `view_file` tool on `.agent/skills/pr-templates/assets/pr-body-template.md` and `.agent/skills/pr-templates/SKILL.md` to get the structure and instructions. Populate the template with actual information using English.
4. Call MCP `create_pull_request`:
   - `head`: new branch name
   - `base`: MANDATORY. You MUST exactly pass the `BASE_BRANCH` of the root repository. Never guess or omit this field.
   - `title`: following the format `Scope – Description`
   - `body`: result from the previous step | `draft`: `false` (unless requested by User)
5. **Auto-Assign:** `gh pr edit {PR_NUMBER} --add-assignee {GITHUB_USERNAME} --repo {owner}/{repo}` immediately after creating the PR.
6. **Result Handling:**
   - **Success:** Output PR URL → save to `CREATED_PR`.
   - **Failure (after successful push):** Notify error + 2 options: **(A)** Retry, **(B)** Rollback (`git push origin --delete <name>` + `git checkout <BASE_BRANCH>`). Wait for User's choice.

---

## Step 5: Update Task (Automated — Conditional)

**ONLY execute this step if the User provided a Task URL in Step 1** (not `[N/A]`). If `[N/A]` → skip completely.

1. Run the automated script to generate the exact template format:
   `node scripts/render-task-comment.js --summary "<1-2 sentence summary>" --pr "<repo|number|url>" --out "/tmp/task_comment.md"`
2. **Platform Routing (Identify Tracker by URL):**
   - **ClickUp:** If the URL contains `clickup.com`:
     - Extract `task_id` from the URL.
     - Activate the `clickup-commenter` skill: call `view_file` on `.agent/skills/clickup-commenter/SKILL.md` and execute, passing `task_id` and `file_path: "/tmp/task_comment.md"`.
       > **AUTO-PROCEED:** Skip the "Preview & Confirm" step in `clickup-commenter` SKILL.md.
   - **GitHub:** If the URL contains `github.com`:
     - Extract `owner`, `repo`, and `issue_number` from the URL.
     - Read the content of `/tmp/task_comment.md` and use the GitHub MCP tool `add_issue_comment`.
   - **Other / Unsupported Tracker:** Skip automated posting and notify the User that the comment markdown is available in `/tmp/task_comment.md` for manual copy-pasting.

---

## Step 6: Auto-log Task (MANDATORY)

**ALWAYS execute this step** after the PR has been created.

1. **Log via CLI:** Execute the `tnm task log` command:

   ```bash
   tnm task log \
     --title="<PR_TITLE>" \
     --project="<PROJECT_SHORT_NAME>" \
     --task-id="<TASK_ID>" \
     --pr="<PR_URL>|<PR_TITLE>"
   ```

   **Parameters:**
   - **`--title`**: PR title (from Step 4).
   - **`--project`**: Extract `PROJECT_SHORT_NAME` from the `.env` file at HUB_ROOT. If not found, use the basename of the target project directory.
   - **`--task-id`** (optional): ClickUp Task ID (extracted from Task URL if provided in Step 1).
   - **`--pr`**: PR URL and title. (e.g., `--pr="url1|title1"`)

2. **Examples:**

   ```bash
   # Single PR without task
   tnm task log --title="Fix auth bug" --project=HPMA --pr="https://github.com/org/repo/pull/123"

   # Single PR with task
   tnm task log --title="Add feature" --project=TNMCore-OS --task-id=abc123 --pr="https://github.com/org/repo/pull/124"
   ```

3. **Note:** The CLI automatically reads `MEMBER_SHORT_NAME` from `.env`. If Task URL is `[N/A]`, omit `--task-id`.
