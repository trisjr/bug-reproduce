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

async function listTools() {
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
            method: "tools/list",
            params: {},
        }),
    });

    const text = await response.text();
    const match = text.match(/data: (\{.*\})/);
    if (match) {
        const data = JSON.parse(match[1]);
        return data.result.tools;
    }
    const data = JSON.parse(text);
    return data.result.tools;
}

listTools()
    .then(tools => {
        const filtered = tools.filter(t => t.name.includes('task'));
        console.log(filtered.map(t => t.name));
    })
    .catch(err => {
        console.error("Error:", err.message);
        process.exit(1);
    });
