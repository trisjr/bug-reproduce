// AI Coding
/**
 * Script: clickup_action.js
 * Purpose: A universal wrapper to call any ClickUp MCP tool via script.
 * Usage: node clickup_action.js <tool_name> <json_arguments>
 * Example: node clickup_action.js clickup_get_task '{"task_id": "86b84gx1p"}'
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

async function callTool(name, args) {
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
        return data.result.content[0].text;
    }
    throw new Error("Invalid response from ClickUp MCP: " + text);
}

const [, , toolName, argsString] = process.argv;

if (!toolName) {
    console.error("Usage: node clickup_action.js <tool_name> <json_arguments>");
    process.exit(1);
}

let args = {};
try {
    args = argsString ? JSON.parse(argsString) : {};
} catch (e) {
    console.error("Invalid JSON arguments provided.");
    process.exit(1);
}

// Auto-inject Workspace ID if missing
if (!args.workspace_id && process.env.CLICKUP_WORKSPACE_ID) {
    args.workspace_id = process.env.CLICKUP_WORKSPACE_ID;
}

callTool(toolName, args)
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.error("Error:", err.message);
        process.exit(1);
    });
