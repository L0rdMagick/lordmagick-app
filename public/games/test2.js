const fs = require('fs');

global.document = require('jsdom').jsdom().defaultView.document;
global.window = document.defaultView;

// mock game state
global.gameState = { screen: 'RITUAL_MAP', camera: {x:0,y:0}, enemies: [], projects: [] };
global.SPRITES = {}; global.SPRITE_SHEETS = {};
global.VIEWPORT_W = 800; global.VIEWPORT_H = 600;
global.player = {hp:100, customAssetType: 'wizard'};
global.keys = {};
global.playSound = console.log;

// evaluation
eval(fs.readFileSync('c:/Users/danie/Documents/Projects/lordmagick-app/public/games/js/engine.js', 'utf8'));
eval(fs.readFileSync('c:/Users/danie/Documents/Projects/lordmagick-app/public/games/js/ritual-map.js', 'utf8'));

