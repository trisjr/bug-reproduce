/**
 * Script: get_workspace_hierarchy.js
 * Purpose: Call the clickup_get_workspace_hierarchy tool via direct MCP URL.
 */

import fs from 'fs';

// Load environment from root .env
try {
    process.loadEnvFile();
} catch (e) {
    // .env might not exist or error loading
}

const CLICKUP_MCP_URL = process.env.CLICKUP_MCP_URL;
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const CLICKUP_WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID;

if (!CLICKUP_MCP_URL || !CLICKUP_API_KEY || !CLICKUP_WORKSPACE_ID) {
    console.error("Error: Missing CLICKUP_MCP_URL, CLICKUP_API_KEY, or CLICKUP_WORKSPACE_ID in .env");
    process.exit(1);
}

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
    // Handling potential multi-line/stream response from mcp-remote
    const match = text.match(/data: (\{.*\})/);
    if (match) {
        const data = JSON.parse(match[1]);
        if (data.error) throw new Error(JSON.stringify(data.error));
        return data.result.content[0].text;
    }

    // Fallback if not a stream
    try {
        const data = JSON.parse(text);
        if (data.error) throw new Error(JSON.stringify(data.error));
        return data.result.content[0].text;
    } catch (e) {
        throw new Error("Invalid response from ClickUp MCP: " + text);
    }
}

console.log(`Fetching hierarchy for Workspace ${CLICKUP_WORKSPACE_ID}...`);

callTool('clickup_get_workspace_hierarchy', { workspace_id: CLICKUP_WORKSPACE_ID })
    .then(result => {
        console.log("\n--- Workspace Hierarchy ---\n");
        console.log(result);
    })
    .catch(err => {
        console.error("Error:", err.message);
        process.exit(1);
    });
