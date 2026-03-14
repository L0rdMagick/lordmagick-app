const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const RITUAL_MAP_PATH = path.join(__dirname, 'public/games/js/ritual-map.js');

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

                if (!fs.existsSync(RITUAL_MAP_PATH)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'ritual-map.js not found' }));
                    return;
                }

                let html = fs.readFileSync(RITUAL_MAP_PATH, 'utf8');
                
                const startMarker = '// --- MAP EDITOR INJECTION START ---';
                const endMarker = '// --- MAP EDITOR INJECTION END ---';
                
                const startIndex = html.indexOf(startMarker);
                const endIndex = html.indexOf(endMarker);

                if (startIndex === -1 || endIndex === -1) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Injection markers not found in ritual-map.js' }));
                    return;
                }

                // Replace everything between markers
                const newHtml = html.substring(0, startIndex + startMarker.length) + 
                                '\n' + layoutString + '\n    ' + 
                                html.substring(endIndex);

                fs.writeFileSync(RITUAL_MAP_PATH, newHtml);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                console.log('Successfully injected map into js/ritual-map.js!');

            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/scan-images') {
        const IMAGE_ROOT = path.join(__dirname, 'public/images/craft-work');
        const ASSET_LIST_PATH = path.join(__dirname, 'public/games/map-editor/assetList.js');
        const results = [];

        const walkDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            fs.readdirSync(dir).forEach(entry => {
                const full = path.join(dir, entry);
                if (fs.statSync(full).isDirectory()) {
                    // Skip the floors/ subfolder — those are scanned separately by /api/scan-floors
                    if (entry.toLowerCase() === 'floors') return;
                    walkDir(full);
                } else if (/\.png$/i.test(entry)) {
                    const rel = path.relative(IMAGE_ROOT, full).replace(/\\/g, '/');
                    // Build a web-safe relative path from the map-editor's perspective
                    const webPath = '../../images/craft-work/' +
                        rel.split('/').map(encodeURIComponent).join('/');
                    const baseName = path.basename(entry, /\.png$/i.test(entry) ? '.png' : '');
                    const cleanBase = path.basename(entry, '.png');
                    // 4×4 grid of 512×512 cells from a 2048×2048 sprite sheet
                    for (let row = 0; row < 4; row++) {
                        for (let col = 0; col < 4; col++) {
                            results.push({
                                id: `${cleanBase}_${col}_${row}`,
                                path: webPath,
                                sx: col * 512,
                                sy: row * 512,
                                sw: 512,
                                sh: 512
                            });
                        }
                    }
                }
            });
        };

        walkDir(IMAGE_ROOT);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
        console.log(`[scan-images] Returned ${results.length} entries from craft-work folder.`);


    } else if (req.method === 'GET' && req.url === '/api/scan-floors') {
        const FLOORS_ROOT = path.join(__dirname, 'public/images/craft-work/floors');
        const FLOOR_LIST_PATH = path.join(__dirname, 'public/games/map-editor/floorList.js');
        const results = [];

        if (fs.existsSync(FLOORS_ROOT)) {
            fs.readdirSync(FLOORS_ROOT).forEach(entry => {
                const full = path.join(FLOORS_ROOT, entry);
                if (fs.statSync(full).isFile() && /\.(png|jpe?g)$/i.test(entry)) {
                    const webPath = '../../images/craft-work/floors/' + encodeURIComponent(entry);
                    results.push(webPath);
                }
            });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
        console.log(`[scan-floors] Returned ${results.length} floor image(s).`);

    } else if (req.method === 'GET' && req.url === '/api/audio-tracks') {
        // Parse audioTracks.ts with regex — no TypeScript transpile needed
        const AUDIO_TRACKS_PATH = path.join(__dirname, 'src/app/utils/audioTracks.ts');
        try {
            const tsSource = fs.readFileSync(AUDIO_TRACKS_PATH, 'utf8');
            const results = [];
            // Match each object literal inside AUDIO_TRACKS array
            const objRegex = /\{[^{}]*name:\s*"([^"]+)"[^{}]*url:\s*"([^"]+)"[^{}]*category:\s*"([^"]+)"[^{}]*\}/g;
            let m;
            while ((m = objRegex.exec(tsSource)) !== null) {
                results.push({ name: m[1], url: m[2], category: m[3] });
            }
            // Also handle url before name ordering (some entries may differ)
            if (results.length === 0) {
                const looseRegex = /name:\s*"([^"]+)"|url:\s*"([^"]+)"|category:\s*"([^"]+)"/g;
                let cur = {};
                let lm;
                while ((lm = looseRegex.exec(tsSource)) !== null) {
                    if (lm[1]) cur.name = lm[1];
                    if (lm[2]) cur.url  = lm[2];
                    if (lm[3]) { cur.category = lm[3]; if (cur.name && cur.url) { results.push({...cur}); cur = {}; } }
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
            console.log(`[audio-tracks] Returned ${results.length} tracks from audioTracks.ts.`);
        } catch(e) {
            console.error('[audio-tracks] Could not read audioTracks.ts:', e.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n================================`);
    console.log(`Map Editor Server running! `);
    console.log(`You can now automatically save maps directly to js/ritual-map.js`);
    console.log(`Keep this window open in the background while designing.`);
    console.log(`================================\n`);

    // Write assetList.js and floorList.js ONCE at startup so the static fallback files
    // stay fresh. Doing it here (not per-request) avoids triggering Next.js file-watcher
    // on every API call, which would cause an infinite page-reload loop.
    const IMAGE_ROOT   = path.join(__dirname, 'public/images/craft-work');
    const ASSET_LIST   = path.join(__dirname, 'public/games/map-editor/assetList.js');
    const FLOORS_ROOT  = path.join(__dirname, 'public/images/craft-work/floors');
    const FLOOR_LIST   = path.join(__dirname, 'public/games/map-editor/floorList.js');

    // Build asset list
    const assetResults = [];
    const walkDir = (dir) => {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(entry => {
            const full = path.join(dir, entry);
            if (fs.statSync(full).isDirectory()) {
                if (entry.toLowerCase() !== 'floors') walkDir(full);
            } else if (/\.png$/i.test(entry)) {
                const rel = path.relative(IMAGE_ROOT, full).replace(/\\/g, '/');
                const webPath = '../../images/craft-work/' + rel.split('/').map(encodeURIComponent).join('/');
                const cleanBase = path.basename(entry, '.png');
                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 4; col++) {
                        assetResults.push({ id: `${cleanBase}_${col}_${row}`, path: webPath, sx: col*512, sy: row*512, sw: 512, sh: 512 });
                    }
                }
            }
        });
    };
    walkDir(IMAGE_ROOT);
    try {
        fs.writeFileSync(ASSET_LIST, `const AVAILABLE_ASSETS = ${JSON.stringify(assetResults)};\nif(typeof module !== "undefined") try { module.exports = { AVAILABLE_ASSETS }; } catch(e) {}\n`);
        console.log(`[startup] Wrote assetList.js with ${assetResults.length} entries.`);
    } catch(e) { console.error('[startup] Could not write assetList.js:', e.message); }

    // Build floor list
    const floorResults = [];
    if (fs.existsSync(FLOORS_ROOT)) {
        fs.readdirSync(FLOORS_ROOT).forEach(entry => {
            const full = path.join(FLOORS_ROOT, entry);
            if (fs.statSync(full).isFile() && /\.(png|jpe?g)$/i.test(entry)) {
                floorResults.push('../../images/craft-work/floors/' + encodeURIComponent(entry));
            }
        });
    }
    try {
        fs.writeFileSync(FLOOR_LIST, `// Auto-generated by editor_server.js\nconst FLOOR_ASSETS = ${JSON.stringify(floorResults, null, 4)};\nif(typeof module !== "undefined") try { module.exports = { FLOOR_ASSETS }; } catch(e) {}\n`);
        console.log(`[startup] Wrote floorList.js with ${floorResults.length} floor(s).`);
    } catch(e) { console.error('[startup] Could not write floorList.js:', e.message); }
});
