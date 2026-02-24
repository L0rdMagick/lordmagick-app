const fs = require('fs');
const path = require('path');

const getFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (path.extname(file) === '.png') {
            results.push(file);
        }
    });
    return results;
};

const assets = getFiles('./public/images/craft-work');
let spritesData = [];

assets.forEach(p => {
    const relPath = encodeURI(p.replace('./public/', '../../'));
    const name = path.basename(p, '.png');
    
    // Only fetch first top-left grid slot for characters so they don't blow up the list 16 times
    const isCharacter = relPath.includes('/characters/');

    for(let y=0; y<4; y++) {
        for(let x=0; x<4; x++) {
            if (isCharacter && (x !== 0 || y !== 0)) continue;
            
            spritesData.push({ 
                id: name + (isCharacter ? '' : ('_' + x + '_' + y)), 
                path: relPath, 
                sx: x*512, 
                sy: y*512, 
                sw: 512, 
                sh: 512 
            });
        }
    }
});

const baseStr = 'const AVAILABLE_ASSETS = ' + JSON.stringify(spritesData) + ';\nif(typeof module !== "undefined") try { module.exports = { AVAILABLE_ASSETS }; } catch(e) {}';
fs.writeFileSync('./public/games/map-editor/assetList.js', baseStr);
console.log('Wrote ' + spritesData.length + ' sprites');
