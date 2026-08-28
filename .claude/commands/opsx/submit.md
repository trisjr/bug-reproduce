---
description: Automate the process of creating a new branch, creating selective commits, and opening a Pull Request (PR) according to project standards.
author: trisjr
---

// turbo-all

# 🚀 Workflow: Submit Pull Request

Automated workflow from code completion to opening a fully formatted Pull Request.

**Dependent Skills:**

- `clickup-commenter` — Posts Markdown comments to ClickUp tasks.
- `github-mcp-server` — Posts Markdown comments to GitHub Issues (`add_issue_comment`).
- `task-logger` — Automatically logs completed task into weekly task-log markdown files.

> **⚡ Performance contract (read first):** This workflow is optimized to minimize sequential tool round-trips. Two rules:
>
> 1. **Batch read-only Git into ONE call**, then reason locally over the combined output. Never split `rev-parse`, `remote -v`, `status -s`, `diff` into separate turns.
> 2. **Chain the mutation sequence into ONE call** (`checkout && add && commit && push`). Never run these as separate turns.
> 3. The PR body template + placeholder mapping are **inlined below** — do NOT load external skill files for it.

**🔧 Tool Selection Strategy:**

> - **`run_command`** → Git (batched reads + chained mutation) and `gh` CLI.
> - **`gh` CLI** → Create PR via `gh pr create --body-file <file> --assignee @me`. Writing the body to a file (via the file-write tool) eliminates shell-escaping issues for long markdown, so the CLI is safe here and saves a round-trip vs. MCP (no schema load, create + assign in one call).
> - **GitHub MCP** → Only for posting Task comments to GitHub Issues (`add_issue_comment`) in Step 5.

> **📌 Inline Git Rules & Language (do not load external files):**
>
> - **MANDATORY LANGUAGE: 100% English for Commit messages, PR titles, PR bodies, and Task Comments.**
> - Branch format: `<type>/<GITHUB_USERNAME>/<short-description>` (must be entirely lowercase) — e.g., `feat/trisjr/referral-qr-modal`
> - Types: `feat | fix | refactor | chore | docs | ci`
> - Commit format: `<type>(<scope>): <description>` — lowercase, no trailing period
> - PR title format: `<Scope> — Capitalized description` — e.g., `Auth — Fix token api`
> - **TITLE QUALITY (applies to commit descriptions, PR titles and `tnm task log --title`):** state the **outcome the change delivers**, not the mechanical steps taken. A reader who never opens the diff must understand what is now true that was not true before. Name the business capability, the risk closed or the guarantee added — not the files touched.
>   - ✅ `Rate Limit — Harden storage resilience, trust proxy and admin plane tracking`
>   - ✅ `Payment — Close Paddle money-path P0/P1/P2 findings`
>   - ✅ `Content Studio — Enforce AI skill entitlement, conflicts and cap in FE`
>   - ❌ `Cli — Update files` · ❌ `Auth — Fix bug` · ❌ `Api — Change handler`
>   - `<Scope>` is the **business module** in Title Case (`Content Studio`, `Brand Vault`), or the bare acronym when it is one (`CLI`, `API`, `UI`). Never a raw folder name.
> - **FORBIDDEN:** Committing at Hub Root (unless `ALLOW_COMMIT_HUB_ROOT=true` in `.env`); NEVER use `git add .`; ignore `package.json/package-lock.json` if the task does not modify libraries.

---

## Step 1: Gather Context & Evaluate Pause Conditions (Conditional Pause)

1. **Resolve HUB_ROOT:** Save the absolute path to the TNMCORE-OS root directory. This value is used throughout the workflow.

2. **Read `.env` ONCE and cache it.** A single read of `<HUB_ROOT>/.env` provides every key used across the whole workflow — `GITHUB_USERNAME`, `ALLOW_COMMIT_HUB_ROOT`, `CLICKUP_API_KEY`, `PROJECT_SHORT_NAME`, `TNMCORE_HUB_DIR`. Never re-read `.env` in later steps.
   - **GITHUB_USERNAME** (needed for the branch name): use `.env` value. _Fallback only if empty → `gh api user --jq '.login'`, save to env. If `gh api user` fails due to missing auth: Warn and fall back to `git config user.name`. Do NOT interact with GitHub CLI auth._ Assignment in Step 4 uses `@me`, so this value is only required for branch naming.

3. **Determine scan targets:**
   - If `ALLOW_COMMIT_HUB_ROOT=true`, include `HUB_ROOT` as a target.
   - Run `list_dir` on `src/` to get subdirectories; targets = those containing `.git` (+ `HUB_ROOT` if allowed).
   - **FALLBACK if `src/` is empty / no sub-repos (and HUB_ROOT not allowed):** use the current directory if it has `.git`; else Ask User.

4. **Batched context gather (ONE call per repo — the Performance contract, rule 1):**
   For each target repo, run a **single** chained command and reason over the combined output. Run repos **concurrently** (parallel tool calls), one batched command each:

   ```bash
   git -C <repo> rev-parse --abbrev-ref HEAD; \
   git -C <repo> remote -v; \
   git -C <repo> status -s; \
   git -C <repo> diff --stat
   ```

   From this single result, derive per repo: `BASE_BRANCH[repo]` (from `rev-parse`), `owner`/`repo` (from `remote -v`), the pending file list (from `status -s`), and the change summary for branch name + commit message (from `diff --stat`; run `git -C <repo> diff` for deeper detail only if the diffstat is insufficient).

5. **Pause Condition Evaluation:**
   Evaluate if we need to pause, based on two conditions:
   - **Condition 1:** The list of pending files contains `package.json` or `package-lock.json`.
   - **Condition 2:** The User has NOT provided a Task/Ticket Link (or explicitly specified `[N/A]`) in this session.

   **If EITHER condition is true, PAUSE and ask the User:**

   ```text
   📋 I found the following files waiting to be committed:
   [Repo 1] path/to/file.ts, path/to/other.ts
   [Repo 2] path/to/file.ts ...

   ⚠️ (If Condition 1 is true) Dependencies modified (package files detected).
   Please confirm which exact files you want to commit, and provide the Task/Ticket Link (or [N/A])!
   ```

   _(Pause here, wait for User's response before proceeding)_

   **If BOTH conditions are false** (no package files AND Task Link/`[N/A]` is provided), **DO NOT PAUSE**. Proceed automatically and commit all available modified/tracked files.

---

## Step 2: Determine Branch Name & Collision Check

1. Determine `<type>` from the context of code changes (already gathered in Step 1.4).
2. Name the branch: `<type>/<GITHUB_USERNAME>/<short-description>` (entire string lowercase; trim spaces / replace with hyphens).
3. **Collision Check (safety gate — kept intentionally, ONE call, local + remote):**

   ```bash
   git -C <repo> branch --list <name>; git -C <repo> ls-remote --heads origin <name>
   ```

   - If it exists → Ask User: **(A)** Use existing branch, **(B)** Use a different name, **(C)** Delete and recreate. Wait for User's choice.

_Note: `BASE_BRANCH[repo]` was already captured in Step 1.4 — do not re-run `rev-parse`._

---

## Step 3: Branch + Stage + Commit + Push (ONE chained call — Performance contract, rule 2)

Auto-generate the Commit Message following Conventional Commits, then run the **entire mutation sequence as a single chained command** per repo (run repos concurrently):

```bash
git -C <repo> checkout -b <new-branch-name> && \
git -C <repo> add <explicit file list> && \
git -C <repo> commit -m "<type>(<scope>): <description>" && \
git -C <repo> push -u origin HEAD
```

- **Staging:** If proceeding automatically, add all modified files; if paused in Step 1, add strictly only the files confirmed by the User. **Always an explicit file list — never `git add .`.**
- If the chain fails at `push` (e.g. branch race), fall through to Step 4's failure handling.

---

## Step 4: Create PR

1. **Render PR Body from the inlined template.** Populate the following template (100% English) using context from Steps 1–3, then write it to `/tmp/pr_body.md` with the file-write tool (this is what makes `--body-file` escaping-safe):

   ```markdown
   <!-- {{SOLUTION_DESCRIPTION}}: bullets, max 3-4 lines. {{KEY_CHANGES}}: group by domain/layer, concise. {{IMPACT_RISKS}}: highlight DB migrations / security / dependency updates; else "No major risks". -->

   ## 🔗 Link Ticket & Resources

   - **Task Link**: {{TASK_LINK}}
   - **Figma Design**: {{FIGMA_LINK}}

   ## 📖📝 Context & Solution

   ### Current Problem

   {{PROBLEM_DESCRIPTION}}

   ### Technical Solution

   {{SOLUTION_DESCRIPTION}}

   ## 🛠 Key Changes

   {{KEY_CHANGES}}

   ## 🧪 Testing & Evidence

   {{TESTING_EVIDENCE}}

   ## 📸 Screenshots (UI/UX)

   {{SCREENSHOTS}}

   ## ⚠️ Impact & Risks

   {{IMPACT_RISKS}}

   ## ✅ Pre-Merge Checklist

   - [ ] I have performed a self-review of my own code.
   - [ ] My implementation accurately matches the approved specs/requirements.
   - [ ] I have executed the required testing evidence (local tests pass).
   - [ ] The code does not contain any sensitive information (API Keys, Passwords).
   - [ ] I have updated the documentation (if applicable).
   - [ ] I have removed any unnecessary debug/log files.
   ```

   **Placeholder → data source:** `{{TASK_LINK}}` = Task URL from Step 1 (or `[N/A]`); `{{FIGMA_LINK}}` = User-provided or `[N/A]`; `{{RELATED_PRS}}` = `CREATED_PRS[]` or `[N/A]`; `{{PROBLEM_DESCRIPTION}}` / `{{SOLUTION_DESCRIPTION}}` = diff + commit context; `{{KEY_CHANGES}}` = synthesized from changed files; `{{TESTING_EVIDENCE}}` = typecheck/lint/test results if applicable; `{{SCREENSHOTS}}` = `[N/A]` or User images; `{{IMPACT_RISKS}}` = change-scope assessment.

2. **Create + assign in ONE call** (`owner`/`repo`/`BASE_BRANCH` already known from Step 1.4):

   ```bash
   gh pr create \
     --repo <owner>/<repo> \
     --base "<BASE_BRANCH[repo]>" \
     --head <new-branch-name> \
     --title "<Scope> — Description" \
     --body-file /tmp/pr_body.md \
     --assignee @me
   ```

   - `--base` is MANDATORY: pass the independently mapped `BASE_BRANCH[repo]` of this specific repo. Never guess or omit it.
   - Add `--draft` only if the User requested it.

3. **Result Handling:**
   - **Success:** Capture PR URL → save to `CREATED_PRS[]`.
   - **Failure (after successful push):** Notify error + 2 options: **(A)** Retry, **(B)** Rollback (`git push origin --delete <name>` + `git checkout <BASE_BRANCH>`). Wait for User's choice.

---

## Step 5: Update Task (Automated — Conditional)

**ONLY execute this step if the User provided a Task URL in Step 1** (not `[N/A]`). If `[N/A]` → skip completely.

1. Wait until **ALL** repos have successfully created their PRs.
2. **ClickUp path — render + post in ONE chained call** (skip the `clickup-commenter` Preview/Confirm; AUTO-PROCEED). Extract `task_id` from the URL:

   ```bash
   node scripts/render-task-comment.js --summary "<1-2 sentence summary>" --pr "<repo|number|url>" --out "/tmp/task_comment.md" && \
   python3 .agent/skills/clickup-commenter/scripts/clickup_comment_md.py <task_id> --file /tmp/task_comment.md
   ```

   _(Use multiple `--pr` flags for multiple PRs. Requires `CLICKUP_API_KEY` in `.env`.)_

3. **GitHub Issue path:** If the URL contains `github.com`, first render the comment:

   ```bash
   node scripts/render-task-comment.js --summary "<summary>" --pr "<repo|number|url>" --out "/tmp/task_comment.md"
   ```

   then extract `owner`/`repo`/`issue_number` from the URL, read `/tmp/task_comment.md`, and post via the GitHub MCP tool `add_issue_comment` (MCP handles the long markdown body cleanly).

4. **Other / Unsupported Tracker:** Skip automated posting; notify the User that the markdown is available in `/tmp/task_comment.md` for manual copy-paste.

---

## Step 6: Auto-log Task (MANDATORY)

**ALWAYS execute this step** after all PRs have been created.

1. **Log via CLI:**

   ```bash
   tnm task log \
     --title="<PR_TITLE>" \
     --project="<PROJECT_SHORT_NAME>" \
     --task="<TASK_URL>" \
     --pr="<PR_URL>|<PR_TITLE>"
   ```

   **Parameters:**
   - **`--title`**: PR title (from Step 4).
   - **`--project`**: `PROJECT_SHORT_NAME` from the cached `.env` (Step 1.2). If not found, use the basename of the target project directory.
   - **`--task`** (optional): full ClickUp Task URL from Step 1 (CLI extracts the ID — do NOT pass a bare ID). Omit if `[N/A]`.
   - **`--pr`**: PR URL. Repeat this flag for each PR (e.g. `--pr="url1|title1" --pr="url2|title2"`).

2. **Examples:**

   ```bash
   # Single PR without task
   tnm task log --title="Fix auth bug" --project=HPMA --pr="https://github.com/org/repo/pull/123"

   # Single PR with task
   tnm task log --title="Add feature" --project=TNMCore-OS --task="https://app.clickup.com/t/abc123" --pr="https://github.com/org/repo/pull/124"

   # Multiple PRs
   tnm task log --title="Update UI" --project=HPMA --task="https://app.clickup.com/t/abc456" \
     --pr="https://github.com/org/repo/pull/125|PR Title" \
     --pr="https://github.com/org/repo/pull/126|PR Title"
   ```

3. **Note:** The CLI automatically reads `MEMBER_SHORT_NAME` from `.env`. If Task URL is `[N/A]`, omit `--task`.

---

_Note: If Step 1 detects ≥ 2 Repositories, execute **Steps 2 through 4** in **PARALLEL (concurrently)** for all involved Repositories — one batched context call and one chained mutation call **per repo**, run at the same time (do not flatten the per-repo chains into a single command). Wait for all parallel operations to complete before proceeding to **Steps 5 and 6**._
