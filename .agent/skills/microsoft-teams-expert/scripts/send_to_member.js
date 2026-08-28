// AI Coding
import https from 'https';

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node send_to_member.js <email> <message>");
    process.exit(1);
}

const [email, message] = args;

// Load .env file (requires Node.js v20.6.0+)
try {
    process.loadEnvFile();
} catch (e) {
    // .env might not exist or error loading, continue to see if env var is set otherwise
}

const url = process.env.MICROSOFT_TEAMS_FLOW_MEMBER_URL;

if (!url) {
    console.error("Error: MICROSOFT_TEAMS_FLOW_MEMBER_URL not set in .env or environment.");
    process.exit(1);
}

const payload = JSON.stringify({
    "id": email,
    "content": message
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log(`Response Body: ${data}`);
    });
});

req.on('error', (error) => {
    console.error("Error sending request:", error);
    process.exit(1);
});

req.write(payload);
req.end();

