# ClickUp Automation Examples

Automations in ClickUp follow a **Trigger → (Condition) → Action** structure. Below are common automation patterns to improve team efficiency.

## Status-Based Automations

### Auto-assign when status changes
**Trigger:** Status changes to "In Progress"
**Action:** Assign to person who triggered the automation (or specific person)

### Notify when status changes to "Blocked"
**Trigger:** Status changes to "Blocked"
**Action:** Post a comment tagging the `@Project Manager`
**Comment:** "Task is blocked. Needs attention."

### Move to another List on completion
**Trigger:** Status changes to "Done"
**Action:** Move task to "Archive" or "Release" List

---

## Assignment & Notification Rules

### Auto-assign by Custom Field
**Trigger:** Custom Field "Department" changes to "Design"
**Action:** Assign to Design Lead

### Alert for High Priority Tasks
**Trigger:** Task created
**Condition:** Priority is "Urgent"
**Action:** Send notification to specific team members or Slack channel

### Weekly stale task reminder
**Trigger:** Task has been in status "Waiting for Feedback" for 7 days
**Action:** Post a comment tagging the assignee
**Comment:** "This task has been idle for a week. Any updates?"

---

## Date & Schedule Rules

### Set Due Date on creation
**Trigger:** Task created
**Action:** Set Due Date to 3 days after trigger date

### Clear Due Date when cancelled
**Trigger:** Status changes to "Cancelled"
**Action:** Clear Due Date

### Recurring Review Task
**Trigger:** Schedule (e.g., Every Monday at 9 AM)
**Action:** Create a new task "Weekly Team Sync Preparation" in the "Management" List

---

## Custom Field Automations

### Calculate Value based on other fields
**(Requires ClickUp Formula fields, but automations can trigger updates)**
**Trigger:** Custom Field "Complexity" changes
**Action:** Update Custom Field "Estimate" (if logic is simple)

### Tag based on User Input
**Trigger:** Custom Field "Category" is "Bug"
**Action:** Add Tag "Engineering"

---

## Workspace Governance

### Ensure subtasks are closed before parent
**Trigger:** All subtasks are resolved
**Action:** Change task status to "Ready for Review"

### Create subtask templates automatically
**Trigger:** Task created in "Features" List
**Action:** Apply subtask template "Standard Feature AC"

---

## ClickUp MCP Automation (Agent Logic)

Agents can use MCP tools to simulate automations that aren't natively supported:

1. **Hierarchy Cleanup**: Agent runs daily to identify empty Folders/Lists and archives them.
2. **Advanced Reporting**: Agent queries multiple Lists and generates a summary comment in a Master Task.
3. **Cross-Space Sync**: Agent monitors a task in Space A and duplicates updates to a task in Space B.

## Best Practices

1. **Avoid Loops**: Ensure an automation doesn't trigger itself (e.g., Task created triggers task creation).
2. **Keep it simple**: Use Space-level automations instead of List-level if they apply everywhere.
3. **Use Templates**: Apply templates via automations for consistent task structures.
4. **Test First**: Create a "Sandbox" List to test complex automations before applying to active projects.
