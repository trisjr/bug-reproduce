// AI Coding
/**
 * Script: check_missing_duedates.js
 * Purpose: Identifies tasks in the Woo - Phase 3 folder that do not have a due date set.
 * Usage: node check_missing_duedates.js
 */

import fs from 'fs';
import path from 'path';

// Load environment from root .env
try {
    process.loadEnvFile();
} catch (e) {
    // .env might not exist or error loading
}

const CLICKUP_MCP_URL = process.env.CLICKUP_MCP_URL;
if (!CLICKUP_MCP_URL) {
    console.error("Error: CLICKUP_MCP_URL not set in .env or environment.");
    process.exit(1);
}

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const FOLDER_ID = process.env.CLICKUP_FOLDER_ID;

async function callClickUpMCP(name, args = {}) {
    if (!args.workspace_id) args.workspace_id = process.env.CLICKUP_WORKSPACE_ID;
    const response = await fetch(CLICKUP_MCP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": "Bearer " + CLICKUP_API_KEY,
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: { name, arguments: args },
        }),
    });

    const text = await response.text();
    const match = text.match(/data: (\{.*\})/);
    if (match) {
        const data = JSON.parse(match[1]);
        if (data.error) throw new Error(JSON.stringify(data.error));
        return JSON.parse(data.result.content[0].text);
    }
    console.error("DEBUG: Response text was:", text);
    throw new Error("Invalid response");
}

async function run() {
    console.log(`Checking for missing due dates in Folder ID: ${FOLDER_ID}...`);
    try {
        const searchResult = await callClickUpMCP("clickup_search", {
            query: "",
            filters: { folder_ids: [FOLDER_ID] }
        });

        const tasks = searchResult.results.filter(r => r.type === "task");
        const missingDueDates = tasks.filter(t => !t.due_date);

        if (missingDueDates.length === 0) {
            console.log("✅ All tasks have due dates set!");
            return;
        }

        console.log(`\n🚨 FOUND ${missingDueDates.length} TASKS WITHOUT DUE DATES:\n`);
        missingDueDates.forEach(t => {
            const assigneeNames = t.assignees && t.assignees.length > 0
                ? t.assignees.map(a => a.username || a.name).join(', ')
                : 'Unassigned';
            console.log(`- [${t.status.status || t.status}] ${t.name} (ID: ${t.id}) | Assignee: ${assigneeNames}`);
        });

        console.log("\n--- Recommendation: Update these tasks to ensure timeline accuracy. ---");
    } catch (e) {
        console.error("Failed to check due dates:", e.message);
    }
}

run();
