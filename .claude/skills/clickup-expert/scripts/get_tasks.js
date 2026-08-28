import fs from 'fs';

try {
    process.loadEnvFile();
} catch (e) { }

const CLICKUP_MCP_URL = process.env.CLICKUP_MCP_URL;
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;

if (!CLICKUP_MCP_URL || !CLICKUP_API_KEY) {
    console.error("Error: Missing CLICKUP_MCP_URL or CLICKUP_API_KEY in .env");
    process.exit(1);
}

async function callTool(name, args) {
    const response = await fetch(CLICKUP_MCP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Authorization": "Bearer " + CLICKUP_API_KEY,
            "x-workspace-id": process.env.CLICKUP_WORKSPACE_ID,
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

    try {
        const data = JSON.parse(text);
        if (data.error) throw new Error(JSON.stringify(data.error));
        return data.result.content[0].text;
    } catch (e) {
        throw new Error("Invalid response from ClickUp MCP: " + text);
    }
}

callTool('clickup_search', {
    workspace_id: process.env.CLICKUP_WORKSPACE_ID,
    keywords: " "
})
    .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.error("Error:", err.message);
        process.exit(1);
    });
