const fs = require('fs');
let html = fs.readFileSync('public/games/craft-work.html', 'utf8');

// Fix spawnEnemy fallback
html = html.replace(
    /if \(customSpriteKey && SPRITES\[customSpriteKey\]\) \{\s*spriteData = SPRITES\[customSpriteKey\];\s*\} else if \(type === 'boss'\) \{/,
    `if (customSpriteKey) {
        spriteData = SPRITES[customSpriteKey] || customSpriteKey;
    } else if (type === 'boss') {`
);

// Fix auto-patch
html = html.replace(
    /if \(ENEMY_TYPES\.includes\(asset\.type\) && !asset\.interactProps\) \{\s*asset\.interactProps = \{ type: 'enemy' \};\s*\}/,
    `if (!asset.interactProps) {
            if (ENEMY_TYPES.includes(asset.type)) asset.interactProps = { type: 'enemy' };
            if (asset.type === 'crystal_arch_entrance') asset.interactProps = { type: 'portal' };
            if (asset.type === 'crystal_closed_doors' || asset.type === 'crystal_open_doors') asset.interactProps = { type: 'door' };
            if (asset.type === 'shard') asset.interactProps = { type: 'shard' };
        }`
);

fs.writeFileSync('public/games/craft-work.html', html);
