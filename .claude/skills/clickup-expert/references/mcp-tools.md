# AI Coding
# ClickUp MCP Tools Reference

This document provides a detailed reference for all available ClickUp MCP tools. Use these tools to interact with ClickUp programmatically.

## Tool Categories

- **Search & Exploration**: `clickup_search`, `clickup_get_workspace_hierarchy`
- **Task Management**: `clickup_create_task`, `clickup_get_task`, `clickup_update_task`
- **Comments & Files**: `clickup_get_task_comments`, `clickup_create_task_comment`, `clickup_attach_task_file`
- **Time Tracking**: `clickup_get_task_time_entries`, `clickup_start_time_tracking`, `clickup_stop_time_tracking`, `clickup_add_time_entry`, `clickup_get_current_time_entry`
- **Hierarchy Structure**: `clickup_create_list`, `clickup_create_list_in_folder`, `clickup_get_list`, `clickup_update_list`, `clickup_create_folder`, `clickup_get_folder`, `clickup_update_folder`
- **Tags & Members**: `clickup_add_tag_to_task`, `clickup_remove_tag_from_task`, `clickup_get_workspace_members`, `clickup_find_member_by_name`, `clickup_resolve_assignees`
- **Communication**: `clickup_get_chat_channels`, `clickup_send_chat_message`
- **Documents**: `clickup_create_document`, `clickup_list_document_pages`, `clickup_get_document_pages`, `clickup_create_document_page`, `clickup_update_document_page`

---

## Detailed Tool Descriptions
1. clickup_search
Universal search across your entire ClickUp workspace. This is a powerful global search tool that finds ANY type of content - tasks, documents, dashboards, attachments, whiteboards, chat messages, and forms. Use this tool when: - You need to find something but don't know exactly where it is or what type it is - You want to search across multiple asset types at once - You're looking for items by keyword, content, or partial name matches - You need to find all items assigned to specific users or created by certain people - You want to search within specific spaces, folders, or lists - You need to filter by creation date or due date ranges - You need results sorted by creation or update time This tool searches EVERYTHING - it looks inside task names, descriptions, document content, chat messages, file names, and more. Results include highlighted matches and full hierarchy (Space > Folder > List) for context. Supports advanced filtering by assignees, creators, status, location, asset types, and date ranges (creation date and due date). Date filters accept dates in YYYY-MM-DD format or date-time in YYYY-MM-DD HH:MM format, and use your user timezone. Returns paginated results with a cursor for fetching additional pages. The results are intelligently formatted for optimal readability, providing a concise overview and structured data for each result. Note: For specific operations on known items (like updating a task you already identified), use the dedicated tools instead.
2. clickup_get_workspace_hierarchy
Get workspace hierarchy (spaces, folders, lists) from your authenticated workspace with pagination support. Workspace ID is automatically detected from your session. Returns tree structure with names and IDs for navigation. Supports pagination for large workspaces and depth control to fetch only needed levels. Note: Use this ONLY when you need to see the workspace structure - most tools can resolve names automatically without this lookup.
3. clickup_create_task
Create task in a ClickUp list. Requires task name and list_id. ALWAYS ask user which list to use - never guess. Use clickup_get_list to resolve list names to IDs. Supports assignees as array of user IDs, emails, usernames, or "me". Supports task_type to specify the task type by name (e.g., 'Bug', 'Feature').
4. clickup_get_task
Get task details by task_id (works with regular/custom IDs). Set subtasks=true to include all subtask details. Response Size Optimization: - Use detail_level='summary' for lightweight responses when full details aren't needed - Responses exceeding 50,000 tokens automatically switch to summary format to prevent client issues - Summary format includes essential fields: id, name, status, description (truncated), assignees, tags, due_date, url
5. clickup_update_task
Update task properties. Requires task_id and at least one update field. Custom fields supported as array of {id, value}. Supports assignees as array of user IDs, emails, usernames, or "me". Supports task_type to change the task type by name (e.g., 'Bug', 'Feature'), or null to reset to default.
6. clickup_get_task_comments
Get task comments. Use start/start_id params for pagination.
7. clickup_create_task_comment
Create task comment. Requires task_id and comment_text. Supports notify_all to alert assignees and assignee to assign the comment.
8. clickup_attach_task_file
Attach file to task. Requires task_id. File sources: 1) base64 + filename, 2) URL (http/https).
9. clickup_get_task_time_entries
Get all time entries for a task with filtering options. Returns all tracked time with user info, descriptions, tags, start/end times, and durations.
10. clickup_start_time_tracking
Start time tracking on a task. Supports description, billable status, and tags. Only one timer can be running at a time. For best results, omit extra parameters unless specifically needed.
11. clickup_stop_time_tracking
Stop the currently running time tracker. Supports description and tags. Returns the completed time entry details.
12. clickup_add_time_entry
Add a manual time entry to a task. You can provide either (start + duration) OR (start + end). The tool will calculate missing values. Requires task_id, start time, and either duration or end time. Supports description, billable flag, and tags.
13. clickup_get_current_time_entry
Get the currently running time entry, if any. No parameters needed.
14. clickup_create_list
Create a list in a ClickUp space efficiently. The system automatically detects workspace ID and resolves space names. Use space_name (preferred for simplicity) or space_id + list name. Name is required. For lists in folders, use clickup_create_list_in_folder. Supports content, due_date, priority, assignee, and status. Note: No need to look up workspace hierarchy or space IDs first - the system handles space name resolution automatically.
15. clickup_create_list_in_folder
Create a list in a ClickUp folder. Requires folder_id and list name. Supports content and status. If you need to get a folder ID from a folder name, use clickup_get_folder first.
16. clickup_get_list
Get details of a ClickUp list by ID or name. Use this tool to lookup a list ID from a list name before calling other list operations. Returns list details including id, name, content, and space info. Accepts either list_id or list_name.
17. clickup_update_list
Update a ClickUp list. Requires list_id + at least one update field (name/content/status). Only specified fields updated. If you need to get a list ID from a list name, use clickup_get_list first.
18. clickup_create_folder
Create folder in ClickUp space. Use space_id (preferred) or space_name + folder name. Supports override_statuses for folder-specific statuses. Use clickup_create_list_in_folder to add lists after creation.
19. clickup_get_folder
Get details of a ClickUp folder by ID or name. Use this tool to lookup a folder ID from a folder name before calling other folder operations. Returns folder details including id, name, and space info. Accepts either folder_id or folder_name + space info.
20. clickup_update_folder
Update a ClickUp folder. Requires folder_id + at least one update field (name/override_statuses). Only specified fields updated. Changes apply to all lists in folder. If you need to get a folder ID from a folder name, use clickup_get_folder first.
21. clickup_add_tag_to_task
Add existing tag to task. Tag must exist in space. Note: Will fail if tag doesn't exist.
22. clickup_remove_tag_from_task
Remove tag from task. Only removes tag-task association, tag remains in space.
23. clickup_get_workspace_members
Get all members (users) in the ClickUp workspace/team from your authenticated workspace. No parameters needed - workspace ID is automatically detected. Note: Most tools automatically resolve assignees by name or email without needing this lookup first. Use this ONLY when you need to see all available members.
24. clickup_find_member_by_name
Get a member in the ClickUp workspace by name or email. Returns the member object if found, or null if not found.
25. clickup_resolve_assignees
Resolve an array of assignee names or emails to ClickUp user IDs. Returns an array of user IDs, or null for any that cannot be resolved. Note: Most task tools automatically resolve assignees - use this only when you need the user IDs separately.
26. clickup_get_chat_channels
Get chat channels in a workspace. Allows you to see available chat channels including their members, privacy settings, and creation details. Supports pagination using the cursor parameter.
27. clickup_send_chat_message
Send a message to a specific chat channel in the workspace. Messages can be either simple messages or posts with additional metadata.
28. clickup_create_document
Create a document in a ClickUp space, folder, or list. Requires name, parent info, visibility and create_page flag.
29. clickup_list_document_pages
Get all pages in a document with optional depth control.
30. clickup_get_document_pages
Get the content of specific pages from a document.
31. clickup_create_document_page
Create a new page in a ClickUp document.
32. clickup_update_document_page
Update an existing page in a ClickUp document. Supports updating name, subtitle, and content with different edit modes (replace/append/prepend).
