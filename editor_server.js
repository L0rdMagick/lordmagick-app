const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CRAFT_WORK_PATH = path.join(__dirname, 'public/games/craft-work.html');

const server = http.createServer((req, res) => {
    // Enable CORS for localhost access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/save-map') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const layoutString = data.layout;

                if (!fs.existsSync(CRAFT_WORK_PATH)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'craft-work.html not found' }));
                    return;
                }

                let html = fs.readFileSync(CRAFT_WORK_PATH, 'utf8');
                
                const startMarker = '// --- MAP EDITOR INJECTION START ---';
                const endMarker = '// --- MAP EDITOR INJECTION END ---';
                
                const startIndex = html.indexOf(startMarker);
                const endIndex = html.indexOf(endMarker);

                if (startIndex === -1 || endIndex === -1) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Injection markers not found in craft-work.html' }));
                    return;
                }

                // Replace everything between markers
                const newHtml = html.substring(0, startIndex + startMarker.length) + 
                                '\n' + layoutString + '\n    ' + 
                                html.substring(endIndex);

                fs.writeFileSync(CRAFT_WORK_PATH, newHtml);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                console.log('Successfully injected map into craft-work.html!');

            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n================================`);
    console.log(`Map Editor Server running! `);
    console.log(`You can now automatically save maps directly to craft-work.html`);
    console.log(`Keep this window open in the background while designing.`);
    console.log(`================================\n`);
});
