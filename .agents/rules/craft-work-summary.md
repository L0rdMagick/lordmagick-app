---
trigger: always_on
---

Craft-Work Game Architecture & File Structure Overview

1. High-Level Game Description "Craft-Work" is a top-down, 2D web-based
   action/adventure game where the player acts as a Witch or Wizard. The main
   goal is to explore a given map to fight enemies/bosses, solve minor riddles
   at doors, and collect specific Essences (ingredients) to complete one of
   several defined Spells (e.g., Love, Wealth, Health, Glamour). The game
   features active combat relying on projectiles and dodges, inventory
   collection, a Cauldron/Brewing minigame at the end of the level, and dynamic
   mapping driven by a custom web-based Map Editor.

The code avoids monolithic logic files by heavily compartmentalizing the map
data, the core physics engine, player input, and configuration objects.

2. File Responsibilities Breakdown All game files are located inside the
   /public/games/ directory.

A. Core Game Files (Player-Facing) craft-work.html The single HTML file that
houses the game DOM. It is responsible for providing the UI overlays such as HUD
elements (HP, Mana), Start/End screens, Mobile touch interfaces (virtual
joysticks), Modals (riddles, alerts), and the Cauldron minigame interface.
css/game.css Pure visual styling for craft-work.html, including responsive
layouts for mobile UI overlays, HUD aesthetics, and Cauldron animations. B.
JavaScript Structure (/public/games/js/) The game Javascript is modular, with
very strict boundaries between engine logic, map initialization, and hard data.

config.js Data Only. No Game Loop Logic. Holds pure configuration data arrays
and objects. Contains the SPELLS array (defining spell requirements, names, and
incantations), boss mappings, tile color objects, and all hardcoded object paths
for the global SHEET_SRC and SPRITES reference maps. input.js Input Handling &
Controls. Hooks up native browser Event Listeners (keydown, keyup, touchstart,
touchmove, mousedown). It manages the virtual joystick math for mobile and
delegates intent (e.g., set keys.left = true, call handleFire()) out to the
engine. audio.js Sound Manager. Responsible for fetching, caching, and playing
sound effects (playSound()) and background music. cauldron.js The Ritual
Minigame. Manages the endgame sequence entirely. Governs the drag-and-drop /
click-to-add physics of dropping collected ingredients into the pot, managing
the "stirring" counts, and revealing the End Game screen when a spell connects.
engine.js The Core Physics & Rendering Engine. Contains the gameLoop()
recursion. Responsible for physics, entity collision (rectIntersect), updating
player/enemy positions, handling AI states (chase/patrol/shoot), projectile
vectors, and rendering the dynamic entities (Player, Enemies, Projectiles,
Particles) to the Canvas. ritual-map.js Map Binding & Static World Logic. The
"bridge" between the Map Editor and the Game Engine. Contains the
initRitualMap() function. CRITICAL FEATURE: The actual level layout resides in
this file, structured inside block comments labeled // --- MAP EDITOR INJECTION
START ---. The Map Editor injects generated addAsset(...) and addZone(...)
functions directly into this block. Handles all interactions with standard level
assets (detecting overlap with Treasure or Portals, clicking on NPCs or Doors)
and resolving sprite sheet dimensions (cx, cw, sx) specifically for static map
geometry and obstacles. C. The Map Editor (/public/games/map-editor/) A custom,
robust HTML5 Canvas application used by the developer to layout floors, walls,
enemies, treasures, trigger zones, and define item properties.

index.html (Map Editor UI & Logic) A massive, monolithic file responsible for
all Map Editor operations. Handles grid logic, canvas dragging/zooming, layering
tools (bringing to front/back), custom property menus for placed objects
(assigning variables like enemyProjSize, hp, doorState), and the defining of
Trigger Zones (polygons). Critical operation: The "Save to Game" / "Publish"
button scans the editor's entities, serializes them into valid Javascript
function calls (addAsset(...)), and overwrites the injection block within
js/ritual-map.js. assetList.js A statically generated array definition
(AVAILABLE_ASSETS) detailing the URL paths, sprite sheet crops (sx, sy), and
base dimensions of every single placeable image. Loaded by the Map Editor so the
user can select graphics. initialMapData.js The raw JSON stringification of the
map editor's last saved layout. Acts as the persistent "Draft" save file
allowing the developer to reload the session without parsing backwards from
ritual-map.js. editor_server.js (Run locally alongside game via Node for
convenience tools) A local dev server containing helper endpoints. Notably used
so the app can automatically scan subdirectories (like
/images/craft-work/projectiles) and generate assetList.js sprite sheets natively
without manual JSON writing. 🤖 Fast Solutions & "Where to Look" Guide for AI If
you are asked to fix or add a feature, immediately check this guide to prevent
searching across files blindly:

"My newly added image/sprite is not showing up or causes a crash." Look at
js/ritual-map.js rendering checks (ensure dAssetInfo references don't null
pointer error) and ensure js/config.js properly registers the string to a valid
filepath without typos. "The enemy projectiles are doing weird things" / "Player
movement speed is wrong." Look at js/engine.js. That is where all living entity
coordinates are updated. "I want to change the text displayed when a player
walks into a room." Look at the Map Editor (map-editor/index.html) properties
definition for "Zones", and how js/ritual-map.js processes gameState.zones
collisions. "The game didn't save my map correctly" or "I want to add a new
property field to enemies." Look directly at map-editor/index.html to append to
the React/HTML properties panel, update the exportMap() string generation, and
finally update js/ritual-map.js to process that new property when the asset is
initialized.
