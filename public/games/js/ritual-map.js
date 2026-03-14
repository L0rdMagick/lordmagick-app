
/** LABYRINTH & RITUAL MAP: Map injection, collision, and labyrinth loops. */

const RITUAL_SPRITES = {
    crystal_wall_front:                { sx: 0,    sy: 0,    sw: 512, sh: 512 },
    crystal_wall_top_view:             { sx: 512,  sy: 0,    sw: 192, sh: 512 },
    crystal_wall_corner_up_left:       { sx: 1024, sy: 0,    sw: 384, sh: 512 },
    crystal_wall_corner_down_left:     { sx: 1536, sy: 0,    sw: 384, sh: 512 },
    crystal_wall_top_front_angle_view: { sx: 0,    sy: 512,  sw: 192, sh: 512 },
    crystal_open_doors:                { sx: 512,  sy: 512,  sw: 512, sh: 512 },
    crystal_closed_doors:              { sx: 1024, sy: 512,  sw: 512, sh: 512 },
    crystal_arch_entrance:             { sx: 1536, sy: 512,  sw: 512, sh: 512 },
    crystal_down_stairs:               { sx: 0,    sy: 1024, sw: 512, sh: 512 }
};

let ritualState = null;

function initRitualMap() {
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.enemyProjectiles = [];

    ritualState = {
        gridSize: 128, tilesX: 32, tilesY: 32,
        assets: [], floor: null, q1_solved: false, shards: 0,
        questMinions: 0, questBosses: 0, questTreasures: 0, riddleAnswered: false,
        active: true, lastInteractTime: 0,
        collectedKeyItems: new Set(),
        enemies: []
    };

    // setFloor() is called by exported map code to set the background floor image.
    window.setFloor = (editorPath) => {
        ritualState.floor = editorPath ? editorPath.replace('../../', '../') : null;
        if (ritualState.floor && !SPRITE_SHEETS[ritualState.floor]) {
            const img = new Image();
            img.src = ritualState.floor;
            SPRITE_SHEETS[ritualState.floor] = img;
        }
    };
    
    // Updated signature to accept interaction properties from Map Editor
    const addAsset = (id, type, gridX, gridY, w, h, solid, flipX, rotation, interactProps = null, hidden = false) => {
        const asset = { id, type, x: gridX * 128, y: gridY * 128, w: w * 128, h: h * 128, solid, flipX, rotation, interactProps, hidden };
        // Promote visual/geometric props from interactProps to top level (renderers + collision code check top-level)
        if (interactProps) {
            if (interactProps.cx !== undefined) { asset.cx = interactProps.cx; asset.cy = interactProps.cy; asset.cw = interactProps.cw; asset.ch = interactProps.ch; }
            if (interactProps.cornerOffsets) asset.cornerOffsets = interactProps.cornerOffsets;
            if (interactProps.edgeAnchors)   asset.edgeAnchors   = interactProps.edgeAnchors;
            if (interactProps.destructibleHp !== undefined) asset.destructibleHp = parseFloat(interactProps.destructibleHp);
        }
        ritualState.assets.push(asset);
    };

    // addZone stores trigger-zone data (polygon + message + music) from Map Editor exports.
    // Called inline in the injection block — must be defined BEFORE the injection markers run.
    const addZone = (id, points, opts) => {
        if (!ritualState.zones) ritualState.zones = [];
        ritualState.zones.push({
            id,
            points,           // [{x,y}, ...] in pixel coords
            message:   opts?.message   || '',
            musicUrl:  opts?.musicUrl  || '',
            musicName: opts?.musicName || '',
            messageOnce: opts?.messageOnce !== false,
            messageDuration: opts?.messageDuration || 0
        });
    };
    // Also expose on window so the editor's eval() path continues to work
    window.addZone = addZone;

    // --- MAP EDITOR INJECTION START ---
    setFloor('../../images/craft-work/floors/61.jpg');
    addAsset('id_7302', 'crystal_structure_sprite_sheet_0_0', 7.6953125, 27.8515625, 2.301395920758001, 2.301395920758001, true, false);
    addAsset('id_1179', 'crystal_furniture_1_3', 24.3359375, 13.828125, 4.2871776200000005, 4.2871776200000005, false, false, 0, {"renderLayer":"behind"});
    addAsset('id_6682', 'crystal_furniture_1_3', 1.5625, 3.59375, 4.715895382, 4.715895382, false, false, 90, {"renderLayer":"behind"});
    addAsset('id_9970', 'crystal_furniture_1_0', 2.65625, 4.453125, 2.6231791666666675, 2.851944791666666, true, false, 0, {"renderLayer":"behind","cx":534.2222222222222,"cy":0,"cw":458.66666666666674,"ch":498.6666666666665});
    addAsset('id_942', 'crystal_furniture_0_3', 1.484375, 14.8828125, 1.062882, 1.062882, false, false, 0, {"renderLayer":"behind","cx":0,"cy":1536,"cw":512,"ch":512,"cornerOffsets":{"tr":{"x":-23.636363636363626,"y":12.727272727272748},"tl":{"x":5.454545454545439,"y":5.4545454545452685},"br":{"x":-10.909090909090878,"y":-12.727272727272748}}});
    addAsset('id_8937', 'crystal_furniture_0_3', 8.7109375, 16.7578125, 1.1809800000000001, 1.1809800000000001, false, false, 0, {"renderLayer":"behind"});
    addAsset('id_8991', 'ingredients_sheet_2_0_3', 1.7578125, 26.328125, 0.980416237829665, 1.8454893888558401, false, false, 0, {"activationMode":"touch","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"The key to your spell's success is the stepping of you into the success dimension. Do you shift now? Say \"Yes\" and see.","treasureImmediate":"false","treasureGuardianId":"id_4293","treasureVisibleBeforeDefeat":"false","dialogueText":"The Color of Passion is Red","renderLayer":"behind","cx":123.33333333333326,"cy":1536,"cw":272,"ch":512,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.5065104166666679}});
    addAsset('id_4484', 'crystal_furniture_2_1', 7.9296875, 24.3359375, 2, 2, true, false, 0, {"cx":1024,"cy":512,"cw":512,"ch":512,"cornerOffsets":{"tr":{"x":-47.27272727272725,"y":0},"tl":{"x":25.454545454545467,"y":14.545454545454504},"br":{"x":-9.090909090909065,"y":-3.636363636363967}},"edgeAnchors":{"t":0.5,"b":0.5,"l":0.12357954545454497,"r":0.1875}});
    addAsset('id_4431', 'crystal_furniture_2_3', 22.109375, 7.8515625, 2.033364499031253, 2.2525951727812497, true, false, 0, {"cx":1108.4444444444443,"cy":1642.6666666666667,"cw":329.7777777777783,"ch":365.33333333333326,"cornerOffsets":{"tl":{"x":17.77777777777783,"y":11.111111111111086},"br":{"x":-17.77777777777783,"y":-15.555555555555543},"tr":{"x":-13.333333333333485,"y":15.555555555555543},"bl":{"x":13.333333333333485,"y":-20}},"edgeAnchors":{"t":0.5,"b":0.5269541778975735,"l":0.5,"r":0.5}});
    addAsset('id_2011', 'ingredients_sheet_2_3_3', 22.81789389, 13.208518889999999, 1.2860872200000002, 1.2860872200000002, false, false, 0, {"type":"treasure","treasureValue":1,"treasureGuardianId":"id_9296","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('id_8694', 'crystal_furniture_3_2', 25.3125, 14.7890625, 2.1073125000000004, 2.1854375000000004, true, false, 0, {"cx":1581.0788880540947,"cy":1096.1262208865514,"cw":405.313298271976,"ch":420.3395942900075,"cornerOffsets":{"br":{"x":-26,"y":-38},"tr":{"x":-31,"y":52},"tl":{"x":49,"y":41},"bl":{"x":30,"y":-40}},"edgeAnchors":{"t":0.6175417842084507,"b":0.5,"l":0.3875736211448632,"r":0.5}});
    addAsset('id_4293', 'crystal_furniture_3_3', 25.5078125, 25.1171875, 2.4200000000000004, 2.4200000000000004, true, false);
    addAsset('id_9043', 'crystal_furniture_0_3', 15, 22.5, 2, 2, false, false, 0, {"renderLayer":"behind"});
    addAsset('id_4107', 'crystal_furniture_1_2', 11.25, 27.6171875, 2.9282000000000004, 2.9282000000000004, false, false, 0, {"renderLayer":"front"});
    addAsset('id_5629', 'crystal_furniture_2_0', 17.578125, 22.109375, 2.6620000000000004, 2.6620000000000004, false, false, 0, {"renderLayer":"front"});
    addAsset('id_9005', 'crystal_furniture_2_0', 18.7109375, 22.3046875, 2.6620000000000004, 2.6620000000000004, false, false, 0, {"renderLayer":"front"});
    addAsset('id_9343', 'crystal_furniture_2_1', 18.90625, 2.0703125, 2, 2, true, false);
    addAsset('id_6720', 'crystal_furniture_0_2', 15.440422752601197, 4.3604813508570075, 1.1312799322976062, 1.6652757045359845, true, false, 0, {"cx":124.44444444444434,"cy":1095.111111111111,"cw":254.22222222222263,"ch":374.2222222222224,"cornerOffsets":{"tl":{"x":24,"y":15},"tr":{"x":-26,"y":15},"br":{"x":1,"y":-27},"bl":{"x":-3,"y":-28}},"edgeAnchors":{"t":0.5,"b":0.5,"l":0.2748120632646288,"r":0.29357772465924303}});
    addAsset('id_6499', 'crystal_furniture_2_1', 12.03125, 1.9921875, 2, 2, true, false);
    addAsset('id_2988', 'crystal_wall_top_view', 20.9375, 25.234375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_5874', 'crystal_wall_front', 2.3828125, 0, 2, 2, true, false);
    addAsset('id_2105', 'crystal_wall_front', 4.375, 0, 2, 2, true, false);
    addAsset('id_2216', 'crystal_wall_front', 6.3671875, 0, 2, 2, true, false);
    addAsset('id_6241', 'crystal_wall_corner_up_left', 0, -0.0390625, 2.915614821135, 4.668736428180001, true, false, 0, {"cx":1024,"cy":0,"cw":319.74278509507803,"ch":512,"cornerOffsets":{"br":{"x":-146.25,"y":-221.25}},"edgeAnchors":{"t":0.5,"b":0.6105309325031306,"l":0.5,"r":0.6296857852898815}});
    addAsset('id_4943', 'crystal_wall_front', 8.359375, 0, 2, 2, true, false);
    addAsset('id_7003', 'crystal_wall_front', 10.3515625, 0, 2, 2, true, false);
    addAsset('id_9890', 'crystal_wall_front', 12.34375, 0, 2, 2, true, false);
    addAsset('id_7528', 'crystal_wall_front', -0.0390625, 3.046875, 1.7641799999999999, 1.7641799999999999, true, false);
    addAsset('id_9077', 'crystal_wall_front', 14.3359375, 0, 2, 2, true, false);
    addAsset('id_3275', 'crystal_wall_front', 16.328125, 0, 2, 2, true, false);
    addAsset('id_9573', 'crystal_wall_front', 18.3203125, 0, 2, 2, true, false);
    addAsset('id_5884', 'crystal_wall_front', 22.3046875, 0, 2, 2, true, false);
    addAsset('id_8190', 'crystal_wall_front', 24.296875, 0, 2, 2, true, false);
    addAsset('id_2030', 'crystal_wall_front', 26.2890625, 0, 2, 2, true, false);
    addAsset('id_2302', 'crystal_wall_front', 28.28125, 0, 2, 2, true, false);
    addAsset('id_6071', 'crystal_wall_top_view', 10.1171875, 25.234375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_4861', 'crystal_wall_corner_up_left', 29.0625, -0.0390625, 2.980718987801668, 4.591671948541992, true, true, 0, {"cx":1085.4013386869253,"cy":0,"cw":326.8824756400695,"ch":503.5486739974221,"cornerOffsets":{"br":{"x":-146.25,"y":-221.25}},"edgeAnchors":{"t":0.5,"b":0.6105309325031306,"l":0.5,"r":0.6296857852898815}});
    addAsset('id_7042', 'crystal_wall_top_view', 0, 11.9140625, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_2786', 'crystal_wall_top_view', 0, 15.9375, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_2821', 'crystal_wall_top_view', 0, 19.9609375, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_2072', 'crystal_wall_top_view', 0, 23.984375, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_364', 'crystal_wall_top_view', 0, 3.984375, 1.4984736374716352, 3.995929699924361, true, false);
    addAsset('id_1695', 'crystal_wall_top_view', 30.5078125, 11.875, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_3762', 'crystal_wall_top_view', 30.5078125, 15.8984375, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_4074', 'crystal_wall_top_view', 30.5078125, 23.9453125, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_6387', 'crystal_wall_front', 30.3125, 3.0078125, 1.7641799999999999, 1.7641799999999999, true, false);
    addAsset('id_3560', 'crystal_wall_top_view', 30.5078125, 3.8671875, 1.4984736374716352, 3.995929699924361, true, false);
    addAsset('id_3260', 'crystal_structure_sprite_sheet_0_0', 1.5234375, 28.203125, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2229', 'crystal_structure_sprite_sheet_0_0', 11.25, 30.390625, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2846', 'crystal_wall_corner_down_left', 0, 27.265625, 2.953588203166667, 4.715895382, true, false, 0, {"cx":1536,"cy":0,"cw":320.6680889897089,"ch":512,"cornerOffsets":{"tr":{"x":-149.33333333333334,"y":229.33333333333348}},"edgeAnchors":{"t":0.5987499429859446,"b":0.5,"l":0.5,"r":0.3785137030703824}});
    addAsset('id_3531', 'crystal_structure_sprite_sheet_0_0', 12.8515625, 30.390625, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7479', 'crystal_structure_sprite_sheet_0_0', 14.453125, 30.390625, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_6595', 'crystal_structure_sprite_sheet_0_0', 16.0546875, 30.390625, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_1491', 'crystal_structure_sprite_sheet_0_0', 3.046875, 27.8515625, 2.301395920758001, 2.301395920758001, true, false);
    addAsset('id_729', 'crystal_structure_sprite_sheet_0_0', 23.9453125, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_179', 'crystal_structure_sprite_sheet_0_0', 25.5078125, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_9568', 'crystal_structure_sprite_sheet_0_0', 27.03125, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_885', 'crystal_structure_sprite_sheet_0_0', 28.59375, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_5710', 'crystal_wall_corner_down_left', 29.0625, 27.3046875, 2.984838203166667, 4.715895382, true, true, 0, {"cx":1598.7664475191277,"cy":0,"cw":324.0608699366888,"ch":512,"cornerOffsets":{"tr":{"x":-149.33333333333334,"y":229.33333333333348}},"edgeAnchors":{"t":0.5987499429859446,"b":0.5,"l":0.5,"r":0.3785137030703824}});
    addAsset('id_5746', 'crystal_arch_entrance', 5.3125, 27.8515625, 2.3958000000000004, 2.3958000000000004, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorUnlockMode":"question","doorQuestion":"the type of love you need for good health, not for others but for the...","doorAnswer":"Self","doorQuestionCorrectMsg":"Correct. Magick relies on correspondence, the matching of energies, and self love directly matches the energy of the true love of another.","doorQuestionIncorrectMsg":"Incorrect. You may try again."});
    addAsset('id_2947', 'crystal_wall_top_view', 10.1171875, 22.265625, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_9386', 'crystal_structure_sprite_sheet_0_0', 14.3359375, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7223', 'crystal_structure_sprite_sheet_0_0', 15.9375, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2662', 'crystal_structure_sprite_sheet_0_0', 17.5390625, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_5498', 'crystal_structure_sprite_sheet_0_0', 19.140625, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_8396', 'crystal_structure_sprite_sheet_0_0', 22.34375, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2431', 'crystal_structure_sprite_sheet_0_0', 23.9453125, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2565', 'crystal_structure_sprite_sheet_0_0', 27.1484375, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_3893', 'crystal_structure_sprite_sheet_0_0', 28.75, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_4382', 'crystal_structure_sprite_sheet_0_0', 30.3515625, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_4069', 'crystal_wall_top_view', 30.5078125, 19.921875, 1.5136097348198336, 4.036292626186223, true, false);
    addAsset('id_4911', 'crystal_structure_sprite_sheet_0_0', 2.578125, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_4208', 'crystal_structure_sprite_sheet_0_0', 4.1796875, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_1688', 'crystal_structure_sprite_sheet_0_0', 5.78125, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_5204', 'crystal_structure_sprite_sheet_0_0', 8.9453125, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_6130', 'crystal_structure_sprite_sheet_0_0', 10.5859375, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7310', 'crystal_structure_sprite_sheet_0_0', 12.1875, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_5987', 'crystal_structure_sprite_sheet_0_0', 13.7890625, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7288', 'crystal_structure_sprite_sheet_0_0', 16.9921875, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_9693', 'crystal_structure_sprite_sheet_0_0', 18.59375, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2276', 'crystal_structure_sprite_sheet_0_0', 23.3984375, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7285', 'crystal_structure_sprite_sheet_0_0', 25, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2250', 'crystal_structure_sprite_sheet_0_0', 26.6015625, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7811', 'crystal_structure_sprite_sheet_0_0', 29.8046875, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_5061', 'crystal_structure_sprite_sheet_0_0', 0.9765625, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2841', 'crystal_wall_top_view', 0, 7.9296875, 1.4984736374716352, 3.995929699924361, true, false);
    addAsset('id_8630', 'crystal_wall_top_view', 30.5078125, 7.890625, 1.4984736374716352, 3.995929699924361, true, false);
    addAsset('id_4473', 'crystal_wall_top_view', 10.1171875, 19.296875, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_5318', 'crystal_wall_top_view', 10.1171875, 16.328125, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_9220', 'crystal_wall_top_view', 10.1171875, 13.359375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_5601', 'crystal_wall_top_view', 10.1171875, 10.390625, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_8672', 'crystal_wall_top_view', 10.1171875, 7.4609375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_2349', 'crystal_wall_top_view', 10.1171875, 1.5234375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_6443', 'crystal_wall_top_view', 20.9375, 22.265625, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_2959', 'crystal_wall_top_view', 20.9375, 19.296875, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_6264', 'crystal_wall_top_view', 20.9375, 16.328125, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_406', 'crystal_wall_top_view', 20.9375, 13.359375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_8503', 'crystal_wall_top_view', 20.9375, 10.390625, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_343', 'crystal_wall_top_view', 20.9375, 7.4609375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_8749', 'crystal_wall_top_view', 20.9375, 4.4921875, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_7158', 'crystal_wall_top_view', 20.9375, 1.5234375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_1805', 'crystal_structure_sprite_sheet_0_0', 11.1328125, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7091', 'crystal_wall_top_view', 10.1171875, 29.0234375, 1.114567168367332, 2.9721791156462185, true, false);
    addAsset('id_3287', 'crystal_structure_sprite_sheet_0_0', 9.6484375, 28.203125, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_885', 'crystal_structure_sprite_sheet_0_0', 17.6171875, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_9151', 'crystal_structure_sprite_sheet_0_0', 19.21875, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_9265', 'crystal_structure_sprite_sheet_0_0', 20.8203125, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_621', 'crystal_structure_sprite_sheet_0_0', 22.3828125, 30.4296875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_6484', 'crystal_closed_doors', 7.265625, 10, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors","doorUnlockMode":"question","doorQuestion":"The emotion of pink is?","doorAnswer":"Love","doorQuestionCorrectMsg":"Correct. You may continue the spell.","doorQuestionIncorrectMsg":"Incorrect. You may try again."});
    addAsset('id_966', 'crystal_wall_corner_down_left', 9.421164772727273, 3.125, 1.2585227272727266, 2, true, true, 0, {"cx":1597.818181818182,"cy":0,"cw":322.181818181818,"ch":512,"cornerOffsets":{"tr":{"x":-60,"y":90.90909090909093}},"edgeAnchors":{"t":0.6241534988713304,"b":0.5,"l":0.5,"r":0.3579545454545454}});
    addAsset('id_5612', 'crystal_wall_corner_down_left', 10.625, 6.5234375, 1.2869318181818183, 2, true, true, 180, {"cx":1594.181818181818,"cy":0,"cw":329.4545454545455,"ch":512});
    addAsset('id_3455', 'crystal_closed_doors', 2.9296875, 20.1953125, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors","doorUnlockMode":"question","doorQuestion":"I am the love that must be felt, Before the icy heart can melt. I am the fire within your chest, Before your true love’s manifest.","doorAnswer":"self-love"});
    addAsset('id_6250', 'crystal_structure_sprite_sheet_0_0', 20.7421875, 20.546875, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_2272', 'crystal_structure_sprite_sheet_0_0', 21.796875, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_7007', 'crystal_structure_sprite_sheet_0_0', 20.1953125, 10.2734375, 1.5877620000000003, 1.5877620000000003, true, false);
    addAsset('id_8481', 'crystal_wall_front', 20.3125, 0, 2, 2, true, false);
    addAsset('id_5482', 'crystal_wall_corner_down_left', 20.2734375, 26.9921875, 1.2604166666666679, 2, true, true, 0, {"cx":1597.333333333333,"cy":0,"cw":322.66666666666697,"ch":512,"cornerOffsets":{"tr":{"x":-64,"y":93.33333333333303}},"edgeAnchors":{"t":0.6074380165289236,"b":0.5,"l":0.5,"r":0.3697916666666661}});
    addAsset('id_2450', 'crystal_wall_corner_down_left', 21.4453125, 26.9921875, 1.2708333333333321, 2, true, false, 0, {"cx":1536,"cy":0,"cw":325.33333333333303,"ch":512,"cornerOffsets":{"tr":{"x":-64,"y":92}},"edgeAnchors":{"t":0.6065573770491813,"b":0.5,"l":0.5,"r":0.3593750000000018}});
    addAsset('id_9572', 'crystal_wall_corner_down_left', 10.6640625, 3.125, 1.2869318181818166, 2, true, false, 0, {"cx":1536,"cy":0,"cw":329.45454545454504,"ch":512,"cornerOffsets":{"tr":{"x":-65.4545454545455,"y":87.27272727272731}},"edgeAnchors":{"t":0.5993377483443704,"b":0.5,"l":0.5,"r":0.34375}});
    addAsset('id_5672', 'crystal_wall_corner_down_left', 9.4140625, 6.5234375, 1.2869318181818183, 2, true, false, 180, {"cx":1528.7272727272725,"cy":0,"cw":329.4545454545455,"ch":512,"cornerOffsets":{"bl":{"x":-5.454545454545496,"y":-1.8181818181819835}},"edgeAnchors":{"t":0.5,"b":0.3565121412803526,"l":0.6349431818181821,"r":0.5142045454545459}});
    addAsset('id_7079', 'crystal_furniture_1_1', 1.40625, 20.1171875, 1.6211249999999997, 2.1006562500000006, true, false, 0, {"cx":570.1818181818182,"cy":512,"cw":381.090909090909,"ch":493.818181818182,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.4928977272727284}});
    addAsset('id_2616', 'crystal_furniture_1_1', 4.84375, 20.1171875, 1.6211249999999997, 2.1006562500000006, true, false, 0, {"cx":570.1818181818182,"cy":512,"cw":381.090909090909,"ch":493.818181818182,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.4928977272727284}});
    addAsset('id_2975', 'crystal_furniture_1_1', 7.578125, 20.1171875, 1.6211249999999997, 2.1006562500000006, true, false, 0, {"cx":570.1818181818182,"cy":512,"cw":381.090909090909,"ch":493.818181818182,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.4928977272727284}});
    addAsset('id_2363', 'crystal_furniture_1_1', 8.9453125, 20.1171875, 1.6211249999999997, 2.1006562500000006, true, false, 0, {"cx":570.1818181818182,"cy":512,"cw":381.090909090909,"ch":493.818181818182,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.4928977272727284}});
    addAsset('id_7562', 'crystal_furniture_1_1', 6.2109375, 20.1171875, 1.6211249999999997, 2.1006562500000006, true, false, 0, {"cx":570.1818181818182,"cy":512,"cw":381.090909090909,"ch":493.818181818182,"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.4928977272727284}});
    addAsset('id_7932', 'wizard_0_0', 3.9609375, 30.5078125, 0.85312192, 0.92343442, true, false, 0, {"type":"player","playerSpeed":1,"playerWeapon":"projectiles-1_3_2","playerProjSize":100,"playerProjDist":100,"playerProjSpeed":12,"playerFireRate":2,"playerProjDamage":100,"playerRespawnLoc":"death","playerRespawnProgress":"save","cx":78.98394862642382,"cy":0,"cw":507.3538853749162,"ch":549.16891700067,"cornerOffsets":{"tl":{"x":22,"y":14},"tr":{"x":-8,"y":9},"bl":{"x":19,"y":-11},"br":{"x":-8,"y":-16}},"edgeAnchors":{"t":0.5,"b":0.5,"l":0.5,"r":0.5}});
    addAsset('id_1662', 'crystal_furniture_3_1', 25.4893125, 3.028375, 2.2800555555555575, 2.6099166666666664, true, false, 0, {"type":"portal","unlockCondition":"key","portalConditions":[{"condType":"item_collected","assetId":"id_1008","imageId":""}],"cx":1566.052592036063,"cy":512,"cw":438.5381083562905,"ch":501.9824693213122,"cornerOffsets":{"tl":{"x":53.333333333333485,"y":17.77777777777777},"tr":{"x":-51.11111111111086,"y":31.111111111111143}},"edgeAnchors":{"t":0.5,"b":0.49238566311736903,"l":0.3434760831455047,"r":0.29130144419400616}});
    addAsset('id_7862', 'crystal_furniture_0_0', 2.7734375, 10.859375, 1.3028125, 2.4200000000000004, true, false, 0, {"cx":112.72727272727275,"cy":0,"cw":275.6363636363636,"ch":512});
    addAsset('id_3874', 'crystal_furniture_0_0', 4.4140625, 10.859375, 1.3028125, 2.4200000000000004, true, false, 0, {"cx":112.72727272727275,"cy":0,"cw":275.6363636363636,"ch":512});
    addAsset('id_525', 'ingredients_sheet_1_3_3', 7.315032511604546, 19.042507866718175, 0.7057445222454548, 0.7309074483818171, false, false, 0, {"type":"treasure","treasureValue":1,"treasurePickupMsg":"The Secret: Love is a natural frequency of the human soul. It isn't \"missing\"; it is simply muffled.\nIf you want to manifest a \"true love,\" do not ask for a lover. Instead, banish the \"Frequency of Lack\" within yourself.","treasureGuardianId":"dup_17724792538940.9815575992350439","treasureVisibleBeforeDefeat":"false","renderLayer":"behind","cx":1536,"cy":1511.3671450059205,"cw":518.1582137485203,"ch":536.6328549940796,"cornerOffsets":{"tl":{"x":47.27272727272731,"y":50.90909090909099},"br":{"x":-32.72727272727275,"y":-45.454545454545496},"tr":{"x":1.8181818181817562,"y":7.272727272727025}},"edgeAnchors":{"t":0.6944491457926802,"b":0.3217277970766023,"l":0.6606591763380436,"r":0.32344832201035045}});
    addAsset('id_9566', 'ingredients_sheet_2_0_0', 28.828125, 21.953125, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasurePickupMsg":"Do you accept more magick into your being? Say \"yes\" if so.","treasureImmediate":"true","renderLayer":"behind"});
    addAsset('id_5766', 'crystal_furniture_2_0', 18.078125, 22.609375, 2.6620000000000004, 2.6620000000000004, false, false, 0, {"renderLayer":"front"});
    addAsset('id_2477', 'crystal_furniture_3_0', 8.359375, 18.75, 1.6875, 1.2734375, false, false, 0, {"type":"treasure","treasureValue":1,"treasurePickupMsg":"you are energy, energy is everything and everywhere. you are everywhere and everything.","treasureGuardianId":"dup_17724791193430.32686553056150713","treasureVisibleBeforeDefeat":"false","renderLayer":"behind","cx":1572,"cy":88,"cw":432,"ch":326,"cornerOffsets":{"tr":{"x":-13,"y":7},"tl":{"x":13,"y":6},"bl":{"x":8,"y":-2},"br":{"x":-10,"y":-2}}});
    addAsset('id_9296', 'Lucifer_0_0', 26.015625, 17.109375, 2, 2, true, false, 0, {"type":"enemy","hp":150,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_0_2","enemyProjSize":100,"enemySpeed":3,"enemyProjDist":60,"enemyProjSpeed":10,"enemyFireRate":60,"enemyProjDamage":40});
    addAsset('id_5981', 'Dorian_Gray_0_0', 15.625, 25.703125, 2, 2, true, false, 0, {"type":"enemy","hp":130,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_2_2","enemyProjSize":100,"enemySpeed":2,"enemyProjDist":60,"enemyProjSpeed":6,"enemyFireRate":50,"enemyProjDamage":50});
    addAsset('id_4293', 'bat_0_0', 5.2734375, 23.0078125, 1.062882, 1.062882, false, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_3_3","enemyProjSize":60,"enemySpeed":3,"enemyProjDist":30,"enemyProjSpeed":6,"enemyFireRate":50,"enemyProjDamage":20,"cx":0,"cy":0,"cw":512,"ch":512,"cornerOffsets":{"br":{"x":2.5,"y":-5}}});
    addAsset('use (1)_0_0', 'use (1)_0_0', 9.194323963519, 22.358386463519004, 0.564859072962, 0.564859072962, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"Repeat this incantation:\nI awaken the fragrance\nof self-love within my cells.\nMy heart is a garden, vibrant and blooming,\nattracting a love that honors my delicate strength and eternal worth.","treasureGuardianId":"id_4293","treasureVisibleBeforeDefeat":"false","destructibleHp":0,"renderLayer":"behind"});
    addAsset('use (1)_1_0', 'use (1)_1_0', 4.375, 14.5703125, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"Repeat with Power!\nI ground my spirit\nin ancient wisdom\nand unwavering truth. \nI am a pillar of my own values;\nlet the resonance \nof my integrity \ncall forth one who \nstands as firmly as I.","treasureGuardianId":"dup_17724792434750.26964263301963887","treasureVisibleBeforeDefeat":"false","destructibleHp":0,"renderLayer":"behind"});
    addAsset('use (1)_2_0', 'use (1)_2_0', 1.8359375, 8.984375, 0.9565938, 0.9565938, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"Speak this Spell!\nI release the armor of my past.\nIn the breaking of old defenses,\nmy true light flashes forth.\nI am vulnerable,\nI am powerful, \nand I am ready to be seen.","treasureGuardianId":"Medusa_0_0","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('use (1)_0_1', 'use (1)_0_1', 18.59375, 14.296875, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"I govern my mind \nwith sovereignty and grace. \nI am the ruler \nof my own peace, \ninviting a love \nthat is a meeting \nof equals and a union \nof shared purpose.","treasureGuardianId":"Moaning_Ghost_0_0","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('use (1)_1_1', 'use (1)_1_1', 11.3671875, 26.6796875, 1.062882, 1.062882, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"REPEAT!\nI see myself clearly, \nwithout judgment \nor veil. \nAs I recognize \nthe pulse of \nmy own truth, \nI gain the vision \nto recognize \nthe true heart \nof another.","treasureGuardianId":"id_5981","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('use (1)_2_1', 'use (1)_2_1', 22.1875, 24.2578125, 1.1809800000000001, 1.1809800000000001, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"SAY THIS!\nI trust my intuition \nto pierce the fog \nof illusion. \nMy inner \neye is open; \nI sense the soul beneath the skin and welcome only that which is authentic and pure.","treasureImmediate":"true","treasureUnlockMode":"question","treasureQuestion":"The eye that sees truth that comes after the second","treasureAnswer":"third","treasureQuestionCorrectMsg":"correct. your third eye is also the eye of manifestation. for it is here that the manifestation begins.","renderLayer":"behind"});
    addAsset('use (1)_3_1', 'use (1)_3_1', 25.2734375, 13.1640625, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"REPEAT THIS:\nI cut the cords \nof all that \nno longer \nserves me. \nI free my energy \nfrom the ghosts of yesterday, clearing the path for a love that begins on holy, untethered ground.","treasureGuardianId":"id_9296","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('use (1)_0_2', 'use (1)_0_2', 29.237635, 6.2298225, 1.1809800000000001, 1.1809800000000001, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"touch","treasurePickupMsg":"SPEAK THIS TRUTH!\nI spark the fire\nof transformation. \nI am a force of nature, \nmoving toward my destiny \nwith cosmic speed. \nMy energy is electric, \ndrawing in a love \nthat thrives on growth.","renderLayer":"behind"});
    addAsset('dup_17724787613040.8194631836576641', 'bat_0_0', 3.515625, 23.4375, 1.062882, 1.062882, false, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_3_3","enemyProjSize":60,"enemySpeed":3,"enemyProjDist":30,"enemyProjSpeed":6,"enemyFireRate":50,"enemyProjDamage":20,"cx":0,"cy":0,"cw":512,"ch":512,"cornerOffsets":{"br":{"x":2.5,"y":-5}}});
    addAsset('dup_17724787669380.3109842722197106', 'bat_0_0', 2.734375, 25.9375, 1.062882, 1.062882, false, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_3_3","enemyProjSize":50,"enemySpeed":3,"enemyProjDist":30,"enemyProjSpeed":6,"enemyFireRate":50,"enemyProjDamage":20,"cx":0,"cy":0,"cw":512,"ch":512,"cornerOffsets":{"br":{"x":2.5,"y":-5}}});
    addAsset('dup_17724791193430.32686553056150713', 'goblin_0_0', 2.265625, 13.359375, 1.7465382000000003, 1.7465382000000003, true, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_2_3","enemyProjSize":70,"enemySpeed":3,"enemyProjDist":60,"enemyProjSpeed":4,"enemyFireRate":30,"enemyProjDamage":10});
    addAsset('dup_17724792434750.26964263301963887', 'goblin_0_0', 8.0882184261, 16.5257184261, 1.2732263478000003, 1.2732263478000003, true, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_2_3","enemyProjSize":70,"enemySpeed":3,"enemyProjDist":60,"enemyProjSpeed":4,"enemyFireRate":30,"enemyProjDamage":10});
    addAsset('dup_17724792538940.9815575992350439', 'goblin_0_0', 6.5234375, 13.203125, 1.2732263478000003, 1.2732263478000003, true, false, 0, {"type":"enemy","hp":20,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_2_3","enemyProjSize":70,"enemySpeed":3,"enemyProjDist":60,"enemyProjSpeed":4,"enemyFireRate":30,"enemyProjDamage":10});
    addAsset('use (1)_1_2', 'use (1)_1_2', 15.6640625, 7.3046875, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"REPEAT THIS NOW!\nI cultivate a sanctuary \nwithin my soul. \nWithin me, \nlife flourishes in quiet harmony. I offer a soft place to land and seek a partner who tends their own inner garden.","treasureUnlockMode":"question","treasureQuestion":"if you do something in a small way, are you making changes in the broader universe too?","treasureAnswer":"yes","renderLayer":"behind"});
    addAsset('use (1)_3_2', 'use (1)_3_2', 21.953125, 2.109375, 0.9565938, 0.9565938, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"touch","treasurePickupMsg":"I embrace the lightness \nof being \nand the power \nof flight. \nI am agile in spirit \nand soft in touch. \nI balance my mind, body, and soul\nto soar \nalongside my equal.","treasureUnlockMode":"question","treasureQuestion":"Where does magick begin? \"The ... \"","treasureAnswer":"mind","treasureQuestionCorrectMsg":"correct. magick as with the rest of the universe does begin within the mind. the mind is the birth place of all realities and dimensions.","renderLayer":"behind"});
    addAsset('use (1)_2_3', 'use (1)_2_3', 28.203125, 17.96875, 2, 2, false, false, 0, {"type":"treasure","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"REPEAT NOW!\nI fill my cup from the wellspring\nof my own spirit. \nI am not a vessel to be filled,\nbut a fountain that overflows. \nI drink deep of my own joy \nto share its sweetness \nwith another.","treasureGuardianId":"id_9296","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('dup_17725100897900.7450567488490553', 'crystal_closed_doors', 15.15625, 9.9609375, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors"});
    addAsset('dup_17725101127130.5281922532247488', 'crystal_closed_doors', 12.578125, 20.1953125, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors","doorUnlockMode":"none","doorQuestion":"opposite of hot","doorAnswer":"cold","doorQuestionCorrectMsg":"Correct! You may pass.","doorQuestionIncorrectMsg":"Incorrect. You may try again."});
    addAsset('dup_17725101225350.25458603755215536', 'crystal_closed_doors', 25.3515625, 20.2734375, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors","doorUnlockMode":"question","doorQuestion":"Where does magick come from?","doorAnswer":"The Void","doorQuestionCorrectMsg":"Correct. You may pass.","doorQuestionIncorrectMsg":"Incorrect. You may try again."});
    addAsset('dup_17725101283380.5898565431628155', 'crystal_closed_doors', 27.9296875, 10, 2, 2, true, false, 0, {"type":"door","activationMode":"touch","doorState":"closed","doorOpenImage":"crystal_open_doors","doorUnlockMode":"question","doorQuestion":"If you love someone, set them...","doorAnswer":"Free","doorQuestionCorrectMsg":"Correct. You may proceed.","doorQuestionIncorrectMsg":"Incorrect. You may try again."});
    addAsset('The_Void_0_0', 'The_Void_0_0', 12.8515625, 14.375, 2, 2, true, false, 0, {"type":"enemy","hp":100,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_0_3","enemyProjSize":65,"enemySpeed":2,"enemyProjDist":60,"enemyProjSpeed":10,"enemyFireRate":33,"enemyProjDamage":50});
    addAsset('Moaning_Ghost_0_0', 'Moaning_Ghost_0_0', 15.1953125, 17.109375, 2, 2, true, false, 0, {"type":"enemy","hp":120,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_3_2","enemyProjSize":65,"enemySpeed":2,"enemyProjDist":60,"enemyProjSpeed":10,"enemyFireRate":40,"enemyProjDamage":50});
    addAsset('Medusa_0_0', 'Medusa_0_0', 7.0288125, 5.7006875, 1.4580000000000002, 1.4580000000000002, true, false, 0, {"type":"enemy","hp":150,"aiChase":"true","aiPatrol":"true","aiShoot":"true","enemyWeapon":"projectiles-1_1_3","enemyProjSize":70,"enemySpeed":2,"enemyProjDist":100,"enemyProjSpeed":10,"enemyFireRate":50,"enemyProjDamage":50});
    addAsset('use (1)_1_3', 'use (1)_1_3', 8.5919875, 30.450168359375, 0.9841500000000001, 1.17380390625, false, false, 0, {"type":"treasure","activationMode":"touch","treasureValue":1,"treasureCollectMode":"press","treasurePickupMsg":"SAY THIS NOW:\nI drop the persona \nto reveal the divine spark within. \nMy 'imperfections' are the cracks\nwhere the light gets in. \nI am whole in my brokenness \nand beautiful in my truth.","treasureImmediate":"true","dialogueText":"Solve the riddles of the castle and collect the wisdom you need to complete your spell.","renderLayer":"behind","cx":576,"cy":1560,"cw":384,"ch":458,"cornerOffsets":{"bl":{"x":35,"y":-24},"br":{"x":-18,"y":-9},"tr":{"x":-19,"y":10},"tl":{"x":8,"y":6}},"edgeAnchors":{"t":0.5,"b":0.5,"l":0.46943231441048033,"r":0.5}});
    addAsset('use (1)_2_2', 'use (1)_2_2', 28.7109375, 27.8515625, 0.9565938, 0.9565938, true, false, 0, {"type":"treasure","treasurePickupMsg":"REPEAT THIS!\nI align my path \nwith the stars \nof my highest intent. \nMy direction is true; I walk toward love with certainty, knowing every step brings me closer to home.\"","treasureImmediate":"true","treasureUnlockMode":"question","treasureQuestion":"follow your?","treasureAnswer":"spirit"});
    addAsset('dup_17726794093900.6792242071546629', 'crystal_furniture_2_1', 22.1484375, 21.2890625, 2.9282000000000004, 2.9282000000000004, false, false, 0, {"renderLayer":"behind"});
    addAsset('use (1)_0_3', 'use (1)_0_3', 11.523246499999999, 12.148246499999999, 1.062882, 1.062882, true, false, -60, {"type":"treasure","treasureValue":1,"treasurePickupMsg":"REPEAT!\nI honor the rhythm of \ndivine timing. \nI do not rush, nor do I linger \nin the past. \nI am present in the 'now,' \nwhere the sands of fate \nalign to bring us together.","treasureGuardianId":"The_Void_0_0","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    addAsset('use (1)_3_3', 'use (1)_3_3', 19.921875, 26.8359375, 0.86093442, 0.86093442, false, false, 30, {"type":"treasure","treasureValue":1,"treasurePickupMsg":"SAY THIS OUT LOUD NOW!\nI set the sacred boundary \nof my worth. \nMy heart is a treasure, \nguarded by courage. \nOnly one who carries \nthe key of respect \nand devotion shall \nenter my inner sanctum.","treasureGuardianId":"id_5981","treasureVisibleBeforeDefeat":"false","renderLayer":"behind"});
    // --- MAP EDITOR INJECTION END ---

    // DYNAMIC EVENT BINDING: Process interactProps from Map Editor instead of hardcoding
    
    const ENEMY_TYPES = ['slime','bat','spider','ghost','goblin','skeleton', 'cupid', 'demon', 'rot_golem', 'mirror_shadow', 'narcissus', 'moaning_ghost', 'tin_man', 'medusa', 'siren', 'davy_jones', 'black_widow', 'leprechaun', 'king_midas', 'ebenezer_scrooge', 'harpy', 'smaug', 'atlas', 'the_void', 'sloth', 'dorian_gray', 'hydra', 'golem', 'chimera', 'sisyphus', 'grim_reaper', 'invisible_man', 'step_sister', 'doppelganger', 'gargoyle', 'phantom', 'frankenstein', 'lucifer'];
    
    // Auto-patch assets so the user doesn't strictly have to use the properties menu for standard enemies!
    ritualState.assets.forEach(asset => {
        if (!asset.interactProps) {
            if (ENEMY_TYPES.includes(asset.type)) asset.interactProps = { type: 'enemy' };
            if (asset.type === 'crystal_arch_entrance') asset.interactProps = { type: 'portal' };
            if (asset.type === 'crystal_closed_doors' || asset.type === 'crystal_open_doors') asset.interactProps = { type: 'door' };
            if (asset.type === 'shard') asset.interactProps = { type: 'shard' };
        }
    });

    // 1. Player Spawn Point
    // Priority: find an asset explicitly designated as interactType 'player' via the properties panel.
    // Fallback: the legacy wizard/witch type names still work as spawn points.
    const spawnPoint = ritualState.assets.find(a => a.interactProps && a.interactProps.type === 'player')
                    || ritualState.assets.find(a => ['wizard', 'witch'].includes(a.type));
    if (spawnPoint) {
        // If this is a custom character (not wizard/witch), use its asset type as the playerClass
        // so the renderer picks the right sprite. wizard/witch stay as-is for backward compat.
        const isLegacy = ['wizard', 'witch'].includes(spawnPoint.type);
        if (isLegacy) {
            gameState.playerClass = spawnPoint.type;
        } else {
            // Custom character: keep the class name for the sprite lookup key (strip _0_0 suffix)
            gameState.playerClass = spawnPoint.type.replace(/_0_0$/, '');
            // Store the full asset info so drawRitualMap can fall back to the sprite sheet
            player.customAssetType = spawnPoint.type;
            player.customAssetPath = spawnPoint.interactProps && spawnPoint.interactProps._assetPath
                ? spawnPoint.interactProps._assetPath : null;
        }
        player.x = spawnPoint.x;
        player.y = spawnPoint.y;
        player.w = spawnPoint.w; // Automatically adapt bounds to editor scale
        player.h = spawnPoint.h;
        // Ingest the newly defined map editor player powers!
        if (spawnPoint.interactProps) {
            const up = spawnPoint.interactProps;
            if (up.playerSpeed) player.speed = 10 * parseFloat(up.playerSpeed); // base speed 10
            if (up.playerFlying === 'true') player.isLevitating = true;
            if (up.playerWeapon) player.weapon = up.playerWeapon;
            if (up.playerAura === 'true') player.killAura = true;
            if (up.playerProjDist) player.projDist = parseInt(up.playerProjDist, 10);
            if (up.playerProjSpeed) player.projSpeed = parseFloat(up.playerProjSpeed);
            if (up.playerFireRate) player.fireRate = parseInt(up.playerFireRate, 10);
            if (up.playerProjDamage) player.projDamage = parseInt(up.playerProjDamage, 10);
            if (up.playerProjSize) player.projSize = parseFloat(up.playerProjSize);
            
            gameState.playerRespawnLoc = up.playerRespawnLoc || 'start';
            gameState.playerRespawnProgress = up.playerRespawnProgress || 'restart';
        } else {
            gameState.playerRespawnLoc = 'start';
            gameState.playerRespawnProgress = 'restart';
        }
        
        gameState.mapStartX = player.x;
        gameState.mapStartY = player.y;
        
        ritualState.assets = ritualState.assets.filter(a => a !== spawnPoint);
    } else {
        // Fallback spawn
        player.x = 14 * 128 + 64; 
        player.y = 30 * 128 + 64;
        gameState.mapStartX = player.x;
        gameState.mapStartY = player.y;
        gameState.playerRespawnLoc = 'start';
        gameState.playerRespawnProgress = 'restart';
    }

    // Pre-load custom player character sprite sheet if needed
    if (player.customAssetPath) {
        const gamePath = player.customAssetPath.replace('../../', '../');
        if (!SPRITE_SHEETS[gamePath]) {
            const img = new Image();
            img.src = gamePath;
            SPRITE_SHEETS[gamePath] = img;
        }
        player._resolvedAssetPath = gamePath;
    } else if (player.customAssetType && typeof AVAILABLE_ASSETS !== 'undefined') {
        // Fallback: look up path from AVAILABLE_ASSETS
        const dInfo = AVAILABLE_ASSETS.find(a => a.id === player.customAssetType);
        if (dInfo) {
            const gamePath = dInfo.path.replace('../../', '../');
            if (!SPRITE_SHEETS[gamePath]) {
                const img = new Image();
                img.src = gamePath;
                SPRITE_SHEETS[gamePath] = img;
            }
            player._resolvedAssetPath = gamePath;
        }
    }

        gameState.camera.x = player.x - VIEWPORT_W/2;
    gameState.camera.y = player.y - VIEWPORT_H/2;

    // 2. Iterate dynamically over objects with interactProps
    ritualState.assets.forEach(asset => {
        if (!asset.interactProps) return;
        
        const props = asset.interactProps;
        
        // Portals
        if (props.type === 'portal') {
            asset.interact = () => {
                let unlocked = true;
                let msg = "Portal is sealed! Complete the quest conditions:\n";
                if (props.qMinions && ritualState.questMinions < parseInt(props.qMinions)) {
                    unlocked = false; msg += `- Defeat ${parseInt(props.qMinions) - ritualState.questMinions} more Minions.\n`;
                }
                if (props.qBosses && ritualState.questBosses < parseInt(props.qBosses)) {
                    unlocked = false; msg += `- Defeat ${parseInt(props.qBosses) - ritualState.questBosses} more Bosses.\n`;
                }
                if (props.qTreasures && ritualState.questTreasures < parseInt(props.qTreasures)) {
                    unlocked = false; msg += `- Find ${parseInt(props.qTreasures) - ritualState.questTreasures} more Treasures.\n`;
                }
                
                if (props.unlockCondition === 'quest' && !unlocked) {
                    alert(msg);
                    return;
                }
                
                if (props.unlockCondition === 'quest' && props.qRiddle && props.qRiddle.trim() !== '' && !ritualState.riddleAnswered) {
                    showRiddleModal(props, asset.interact);
                    return;
                }
                
                // If there's an unlock condition like boss_defeated, check it here
                if (props.unlockCondition === 'boss_defeated' && !currentObjective.bossDefeated) {
                    alert('The portal is sealed. Defeat the guardian first.');
                    return;
                }
                
                playSound('portal');
                // Use target spawn if defined, else generic
                if (props.targetX !== undefined && props.targetY !== undefined) {
                    player.x = props.targetX * 128 + 64;
                    player.y = props.targetY * 128 + 64;
                }
                if (props.targetMap) {
                    console.log("Loading map: " + props.targetMap);
                    // In a full implementation, fetch and load targetMap data here
                    alert(`Targeting Map: ${props.targetMap}. Feature in development.`);
                }
            };

            // 'touch' mode: flag the asset so the update loop auto-triggers on overlap
            if (props.activationMode === 'touch') asset.autoTrigger = true;
        }
        
        // Doors
        if (props.type === 'door') {
            // If door starts open: make it passable right away, but keep its current visual type.
            // The image placed in the editor IS the intended open-door image.
            if (props.doorState === 'open') {
                asset.solid = false;
                // Do NOT change asset.type — the editor-placed image is already correct
            }

            // Helper: open the door (switch visual + make passable)
            const openDoor = () => {
                asset.solid = false;
                if (props.doorOpenImage && props.doorOpenImage !== '') {
                    asset.type = props.doorOpenImage;
                }
                playSound('collect');
            };

            asset.interact = () => {
                if (!asset.solid) return; // Already open

                // Determine unlock mode (new fields, with fallback to legacy doorRequiresKey)
                const mode = props.doorUnlockMode || (props.doorRequiresKey === 'true' ? 'question' : 'none');

                if (mode === 'none') {
                    openDoor();
                }
                else if (mode === 'question') {
                    const question = props.doorQuestion || 'Knowledge Gate: What blocks the path?';
                    const correctAnswer = (props.doorAnswer || '').trim().toLowerCase();
                    customPrompt(question, (answer) => {
                        if (!answer) return;
                        // If no answer was specified any response opens the door (legacy behaviour)
                        if (correctAnswer === '' || answer.trim().toLowerCase() === correctAnswer) {
                            openDoor();
                            if (props.doorQuestionCorrectMsg && props.doorQuestionCorrectMsg.trim() !== '') {
                                alert(props.doorQuestionCorrectMsg);
                            }
                        } else {
                            if (props.doorQuestionIncorrectMsg && props.doorQuestionIncorrectMsg.trim() !== '') {
                                alert(props.doorQuestionIncorrectMsg);
                            } else {
                                alert('That is not the right answer. The door remains sealed.');
                            }
                        }
                    });
                }
                else if (mode === 'item') {
                    const requiredItem = (props.doorKeyItem || '').trim();
                    if (!requiredItem) { openDoor(); return; }
                    if (ritualState.collectedKeyItems && ritualState.collectedKeyItems.has(requiredItem)) {
                        openDoor();
                    } else {
                        alert(`This door is sealed. You need to acquire: "${requiredItem}" first.`);
                    }
                }
            };
        }

        // 'touch' activation: auto-trigger on overlap (door/portal/npc)
        if ((props.type === 'door' || props.type === 'portal' || props.type === 'npc') && props.activationMode === 'touch') {
            asset.autoTrigger = true;
        }
        
        // NPCs
        if (props.type === 'npc') {
            asset.interact = () => {
                if (props.dialogueText) alert(props.dialogueText);
            };
        }
        
        // Treasures
        if (props.type === 'treasure') {
            if (props.treasureImmediate !== 'true' && props.treasureImmediate !== true && props.treasureGuardianId) {
                if (props.treasureVisibleBeforeDefeat === 'false' || props.treasureVisibleBeforeDefeat === false) {
                    asset.hidden = true;
                }
            }

            const processTreasureAcquisition = () => {
                let val = props.treasureValue ? parseInt(props.treasureValue) : 1;
                ritualState.questTreasures += val;
                // Register this asset's type and ID as collected key items
                ritualState.collectedKeyItems.add(asset.type);
                if (asset.id) ritualState.collectedKeyItems.add(asset.id);
                asset.hidden = true;
                asset.solid = false;
                asset.interact = null; // Consume
                asset.autoTrigger = false;
                playSound('collect');
                createParticles(asset.x + asset.w/2, asset.y + asset.h/2, 10, '#fa0');
                // Custom pickup message, or sensible default
                const msg = (props.treasurePickupMsg && props.treasurePickupMsg.trim())
                    ? props.treasurePickupMsg.trim()
                    : `\u2728 Treasure Acquired! +${val}\n(${ritualState.questTreasures} collected so far)`;
                setTimeout(() => showZoneMessage(msg), 16);
            };

            const collectTreasure = () => {
                if (props.treasureImmediate !== 'true' && props.treasureImmediate !== true && props.treasureGuardianId) {
                    const guardianAlive = gameState.enemies.some(e => e.id === props.treasureGuardianId);
                    if (guardianAlive) {
                        return;
                    }
                }

                if (props.treasureUnlockMode === 'question') {
                    const question = props.treasureQuestion || 'Knowledge Gate: Define the secret?';
                    const correctAnswer = (props.treasureAnswer || '').trim().toLowerCase();
                    customPrompt(question, (answer) => {
                        if (!answer) return;
                        if (correctAnswer === '' || answer.trim().toLowerCase() === correctAnswer) {
                            if (props.treasureQuestionCorrectMsg && props.treasureQuestionCorrectMsg.trim() !== '') {
                                alert(props.treasureQuestionCorrectMsg);
                            }
                            processTreasureAcquisition();
                        } else {
                            if (props.treasureQuestionIncorrectMsg && props.treasureQuestionIncorrectMsg.trim() !== '') {
                                alert(props.treasureQuestionIncorrectMsg);
                            } else {
                                alert("Incorrect. You cannot claim this treasure yet.");
                            }
                        }
                    });
                    return;
                }
                
                if (props.treasureUnlockMode === 'multiple_choice') {
                    const question = props.treasureQuestion || 'Knowledge Gate: what is the answer?';
                    const choices = `A) ${props.treasureChoiceA || ''}\nB) ${props.treasureChoiceB || ''}\nC) ${props.treasureChoiceC || ''}\nD) ${props.treasureChoiceD || ''}\nEnter A, B, C, or D:`;
                    const correctAnswer = (props.treasureAnswer || 'A').trim().toLowerCase();
                    
                    customPrompt(question + '\n\n' + choices, (answer) => {
                        if (!answer) return;
                        if (answer.trim().toLowerCase() === correctAnswer) {
                            if (props.treasureQuestionCorrectMsg && props.treasureQuestionCorrectMsg.trim() !== '') {
                                alert(props.treasureQuestionCorrectMsg);
                            }
                            processTreasureAcquisition();
                        } else {
                            if (props.treasureQuestionIncorrectMsg && props.treasureQuestionIncorrectMsg.trim() !== '') {
                                alert(props.treasureQuestionIncorrectMsg);
                            } else {
                                alert("Incorrect. You cannot claim this treasure yet.");
                            }
                        }
                    });
                    return;
                }

                processTreasureAcquisition();
            };
            asset.interact = collectTreasure;

            // 'touch' mode: auto-collect on overlap (walk over)
            if (props.treasureCollectMode === 'touch') asset.autoTrigger = true;
        }
        
        // Enemies & Bosses
        if (props.type === 'enemy' || props.type === 'boss') {
            // Spawn the enemy directly into the game loop's array
            const enemy = spawnEnemy(asset.x, asset.y, props.type, asset.type); if (enemy) enemy.id = asset.id;
            if (enemy) {
                // Override default constraints and stats with custom map stats from Editor
                enemy.w = asset.w;
                enemy.h = asset.h;
                if (props.hp) { enemy.hp = props.hp; enemy.maxHp = props.hp; }
                if (props.aiBehavior) { enemy.aiBehavior = props.aiBehavior; } // Legacy fallback
                if (props.aiChase === 'true' || props.aiChase === true) enemy.canChase = true;
                if (props.aiPatrol === 'true' || props.aiPatrol === true) enemy.canPatrol = true;
                if (props.aiShoot === 'true' || props.aiShoot === true) enemy.canShoot = true;
                if (props.enemySpeed) { enemy.speed *= parseFloat(props.enemySpeed); }
                if (props.enemyProjDist) { enemy.projDist = parseInt(props.enemyProjDist, 10); }
                if (props.enemyProjSpeed) { enemy.projSpeed = parseFloat(props.enemyProjSpeed); }
                if (props.enemyFireRate) { enemy.fireRate = parseInt(props.enemyFireRate, 10); }
                if (props.enemyProjDamage) { enemy.projDamage = parseInt(props.enemyProjDamage, 10); }
                if (props.enemyWeapon) { enemy.enemyWeapon = props.enemyWeapon; }
                if (props.enemyProjSize) { enemy.enemyProjSize = props.enemyProjSize; }
            }
            // Remove the static asset since it's now an active enemy entity
            asset.hidden = true; 
            asset.solid = false;
        }
    });

    // 3. Fallback manual exit shard for testing if no portals defined
    const exitStairs = ritualState.assets.find(a => a.type === 'crystal_down_stairs' || (a.id && a.id.includes('stairs')));
    if (exitStairs && !exitStairs.interactProps) {
        exitStairs.id = 'stairs';
        exitStairs.hidden = true;
        exitStairs.interact = () => {
            if (ritualState.shards === 1) {
                gameState.screen = 'CAULDRON';
                document.getElementById('cauldron-screen').classList.remove('hidden');
                document.getElementById('ritual-intro-modal').classList.add('show');
                initRitual();
            }
        };
    }

    const shard = ritualState.assets.find(a => a.type === 'shard' || (a.id && a.id.includes('shard')));
    if (shard && !shard.interactProps) {
        shard.id = 'shard';
        shard.solid = false;
        shard.interact = () => processShardCollect(shard, exitStairs);
    } 
    
    function processShardCollect(shardObj, stairsObj) {
        if(ritualState.shards === 1) return;
        ritualState.shards = 1;
        ritualState.assets = ritualState.assets.filter(a => a.id !== 'shard' && a !== shardObj);
        playSound('collect');
        alert('You found the Shard! The exit stairs have unsealed!');
        if (stairsObj) stairsObj.hidden = false;
    }

    // End binding segment
    
}

function segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
    const d1x = bx-ax, d1y = by-ay, d2x = dx-cx, d2y = dy-cy;
    const cross = d1x*d2y - d1y*d2x;
    if (Math.abs(cross) < 1e-10) return false;
    const t = ((cx-ax)*d2y - (cy-ay)*d2x) / cross;
    const u = ((cx-ax)*d1y - (cy-ay)*d1x) / cross;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
function polyVsRect(poly, rx, ry, rw, rh) {
    const pxs = poly.map(p => p[0]), pys = poly.map(p => p[1]);
    if (rx + rw < Math.min(...pxs) || rx > Math.max(...pxs) || ry + rh < Math.min(...pys) || ry > Math.max(...pys)) return false;
    if (pointInPoly(rx, ry, poly) || pointInPoly(rx+rw, ry, poly) || pointInPoly(rx, ry+rh, poly) || pointInPoly(rx+rw, ry+rh, poly)) return true;
    if (pointInPoly(rx+rw/2, ry+rh/2, poly)) return true;
    for (const [px, py] of poly) if (px >= rx && px <= rx+rw && py >= ry && py <= ry+rh) return true;
    // Edge-segment intersection: catches player rect straddling a polygon edge between two vertices.
    const re = [[rx,ry,rx+rw,ry],[rx+rw,ry,rx+rw,ry+rh],[rx+rw,ry+rh,rx,ry+rh],[rx,ry+rh,rx,ry]];
    for (let i = 0; i < poly.length; i++) {
        const [ax,ay] = poly[i], [bx,by] = poly[(i+1)%poly.length];
        for (const [cx,cy,dx,dy] of re) if (segIntersect(ax,ay,bx,by,cx,cy,dx,dy)) return true;
    }
    return false;
}
// Apply the same flipX + rotation transforms the canvas draw call uses, keeping
// the collision polygon in sync with the rendered sprite at all times.
function transformPoly(poly, a) {
    const cx = a.x + a.w / 2;
    const cy = a.y + a.h / 2;
    const rad = (a.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return poly.map(([px, py]) => {
        // 1. Mirror horizontally around object centre (matches ctx.scale(-1,1))
        let x = a.flipX ? (2 * cx - px) : px;
        let y = py;
        // 2. Rotate around object centre (matches ctx.rotate())
        if (a.rotation) {
            const dx = x - cx, dy = y - cy;
            x = cx + dx * cos - dy * sin;
            y = cy + dx * sin + dy * cos;
        }
        return [x, y];
    });
}
function assetIntersect(px, py, pw, ph, a) {
    if (!(a.cornerOffsets || a.edgeAnchors)) {
        // AABB fallback for plain walls — flip/rotation not authored, use full box bottom 70%.
        return rectIntersect(px, py, pw, ph, a.x, a.y + a.h * 0.3, a.w, a.h * 0.7);
    }
    // Build polygon then apply the same visual transforms (flip + rotation).
    const poly = transformPoly(buildAssetPoly(a), a);
    return polyVsRect(poly, px, py, pw, ph);
}

// Displays a styled zone-entry message overlay that blocks until the player dismisses it.
// Player key input is paused while it is visible.
function showZoneMessage(message, durationSec = 0) {
    console.log("[DEBUG] showZoneMessage explicitly called with:", message);
    
    // Proactively clear any stuck message overlays that survived respawns or overlaps
    const existing = document.getElementById('zone-msg-overlay');
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'zone-msg-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:9999',
        'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
        'background:rgba(0,0,0,0.72)',
        'font-family:"Segoe UI",sans-serif',
        'animation:zoneFadeIn 0.35s ease'
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
        'max-width:520px', 'width:90%',
        'background:linear-gradient(160deg,#1a0a2e 0%,#0d0520 100%)',
        'border:1px solid #6a3fa0', 'border-radius:12px',
        'padding:32px 36px', 'text-align:center',
        'box-shadow:0 0 40px rgba(160,80,255,0.35)'
    ].join(';');

    const icon = document.createElement('div');
    icon.textContent = '\u2728'; // sparkle
    icon.style.cssText = 'font-size:36px;margin-bottom:14px;';

    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = [
        'color:#e8d5ff', 'font-size:18px', 'line-height:1.6',
        'margin:0 0 24px', 'white-space:pre-wrap'
    ].join(';');

    const btn = document.createElement('button');
    btn.textContent = 'Continue';
    btn.style.cssText = [
        'background:linear-gradient(135deg,#6a0dad,#3a005a)',
        'color:#fff', 'border:1px solid #9b59b6',
        'padding:10px 36px', 'border-radius:8px',
        'font-size:15px', 'cursor:pointer',
        'transition:background 0.2s'
    ].join(';');
    btn.onmouseenter = () => btn.style.background = 'linear-gradient(135deg,#8e44ad,#5a007a)';
    btn.onmouseleave = () => btn.style.background = 'linear-gradient(135deg,#6a0dad,#3a005a)';
    btn.onclick = () => {
        overlay.remove();
        // Re-clear all keys so the player doesn't lurch off after dismissing
        if (typeof keys !== 'undefined') {
            ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' ','Enter','z','Z'].forEach(k => { keys[k] = false; });
        }
    };

    box.appendChild(icon);
    box.appendChild(text);

    if (durationSec > 0) {
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                if (typeof keys !== 'undefined') {
                    ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' ','Enter','z','Z'].forEach(k => { keys[k] = false; });
                }
            }
        }, durationSec * 1000);
    } else {
        box.appendChild(btn);
    }

    overlay.appendChild(box);

    // Inject keyframe animation once
    if (!document.getElementById('zone-msg-style')) {
        const style = document.createElement('style');
        style.id = 'zone-msg-style';
        style.textContent = '@keyframes zoneFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}';
        document.head.appendChild(style);
    }

    const container = document.getElementById('game-container') || document.body;
    container.appendChild(overlay);
    setTimeout(() => { if (btn) btn.focus(); }, 10);
}

function updateRitualMap(dt) {

    if (player.invulnTimer > 0) player.invulnTimer--;

    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    
    if (joystickInput.active) { dx = joystickInput.x; dy = joystickInput.y; }

    
    if (player.hp <= 0) { dx = 0; dy = 0; }
let speed = player.speed * 0.8; 
    if (player.isLevitating) speed *= 3; // Triple speed testing modifier!
    
    let moveX = 0, moveY = 0;
    if (dx !== 0 || dy !== 0) {
        let mag = Math.hypot(dx, dy);
        moveX = (dx / mag) * speed;
        moveY = (dy / mag) * speed;

        // Determine primary facing for sprites
        if (joystickInput.active) {
            const angle = Math.atan2(dy, dx);
            const deg = angle * (180 / Math.PI);
            if (deg > -22.5 && deg <= 22.5) player.facing = 'right';
            else if (deg > 22.5 && deg <= 67.5) player.facing = 'down-right';
            else if (deg > 67.5 && deg <= 112.5) player.facing = 'down';
            else if (deg > 112.5 && deg <= 157.5) player.facing = 'down-left';
            else if (Math.abs(deg) > 157.5) player.facing = 'left';
            else if (deg < -112.5 && deg >= -157.5) player.facing = 'up-left';
            else if (deg < -67.5 && deg >= -112.5) player.facing = 'up';
            else if (deg < -22.5 && deg >= -67.5) player.facing = 'up-right';
        } else {
            if (dy < 0 && dx === 0) player.facing = 'up';
            else if (dy > 0 && dx === 0) player.facing = 'down';
            else if (dx < 0 && dy === 0) player.facing = 'left';
            else if (dx > 0 && dy === 0) player.facing = 'right';
            else if (dy < 0 && dx < 0) player.facing = 'up-left';
            else if (dy < 0 && dx > 0) player.facing = 'up-right';
            else if (dy > 0 && dx < 0) player.facing = 'down-left';
            else if (dy > 0 && dx > 0) player.facing = 'down-right';
        }
        
        let newX = player.x + moveX;
        let newY = player.y + moveY;
        
        newX = Math.max(0, Math.min(newX, ritualState.tilesX * ritualState.gridSize - player.w));
        newY = Math.max(0, Math.min(newY, ritualState.tilesY * ritualState.gridSize - player.h));
        
        let hitX = false, hitY = false;
        ritualState.assets.forEach(a => {
            if (a.hidden || !a.solid) return;
            if (assetIntersect(newX, player.y, player.w, player.h, a)) hitX = true;
            if (assetIntersect(player.x, newY, player.w, player.h, a)) hitY = true;
        });
        
        if (!hitX) player.x = newX;
        if (!hitY) player.y = newY;
    }
    
    // --- PLAYER ANIMATION LOGIC ---
    if (player.isAttacking) {
        player.animTimer++;
        if (player.animTimer > 5) { // Fast attack
            player.frameX++;
            player.animTimer = 0;
            if (player.frameX > 3) {
                player.isAttacking = false;
                player.frameX = 0;
                if(player.facing && player.facing.includes('down')) player.frameY = 0;
                else if(player.facing && player.facing.includes('up')) player.frameY = 1;
                else if(player.facing === 'left' || player.facing === 'right') player.frameY = 2;
            }
        }
    } else {
        if (moveX !== 0 || moveY !== 0) {
            if (Math.abs(moveY) > Math.abs(moveX)) {
                if (moveY > 0) { player.frameY = 0; player.flipX = false; }
                else { player.frameY = 1; player.flipX = false; }
            } else {
                player.frameY = 2; // Side
                if (moveX < 0) player.flipX = true; else player.flipX = false;
            }
            player.animTimer++;
            if (player.animTimer > 5) {
                player.frameX = (player.frameX + 1) % 4;
                player.animTimer = 0;
            }
        } else {
            player.frameX = 0; // idle
        }
    }

    // Mana Regeneration
    if (player.isLevitating) { 
        player.mana -= 0.1; 
        if (player.mana <= 0) player.isLevitating = false; 
    } else { 
        if (player.mana < player.maxMana) player.mana += 0.2; 
    }
    if (typeof updateManaUI === 'function') updateManaUI();
    
    // Interactions
    const now = Date.now();
    
    // Check for interaction via Keyboard (Space/Enter) OR nearby collision
    const isInteracting = (player.hp > 0) && (keys[' '] || keys['Enter'] || keys['z'] || keys['Z']);
    const interactRadius = 80;

    ritualState.assets.forEach(a => {
        if (a.hidden) return;
        
        // autoTrigger assets fire on pure overlap (no keypress needed)
        // Set by activationMode='touch' (portals/doors) or treasureCollectMode='touch'
        if ((a.autoTrigger || a.id === 'shard') && player.hp > 0) {
            const padding = a.solid ? 20 : 0;
            const isOverlapping = rectIntersect(player.x - padding, player.y - padding, player.w + padding * 2, player.h + padding * 2, a.x, a.y, a.w, a.h);
            
            if (isOverlapping) {
                if (!a._currentlyOverlapping) {
                    a._currentlyOverlapping = true;
                    if (a.interact && now - ritualState.lastInteractTime > 500) {
                        ritualState.lastInteractTime = now;
                        a.interact();
                    }
                }
            } else {
                a._currentlyOverlapping = false;
            }
        } 
        // Manual triggers (like Doors/Oracles) trigger when player is nearby AND presses action
        else if (a.interact && isInteracting) {
            // Check if player center is within interactRadius of the asset center
            const pCX = player.x + player.w/2;
            const pCY = player.y + player.h/2;
            const aCX = a.x + a.w/2;
            const aCY = a.y + a.h/2;
            
            if (distance(pCX, pCY, aCX, aCY) < (a.w/2 + interactRadius)) {
                if (now - ritualState.lastInteractTime > 1000) {
                    ritualState.lastInteractTime = now;
                    a.interact();
                    // Consume key to prevent double triggers
                    keys[' '] = false; keys['Enter'] = false; keys['z'] = false; keys['Z'] = false;
                }
            }
        }
    });

    // ── Zone Trigger Checks ──────────────────────────────────────────────────
    if (player.hp > 0 && ritualState.zones && ritualState.zones.length > 0) {
        if (!ritualState._triggeredZones) ritualState._triggeredZones = new Set();

        const pCx = player.x + player.w / 2;
        const pCy = player.y + player.h / 2;
        let currentZone = null;

        for (const zone of ritualState.zones) {
            if (!zone.points || zone.points.length < 3) continue;
            const poly = zone.points.map(p => [p.x, p.y]);
            if (pointInPoly(pCx, pCy, poly)) {
                currentZone = zone;
                if (!ritualState._triggeredZones.has(zone.id)) {
                    ritualState._triggeredZones.add(zone.id);
                    if (zone.message) {
                        setTimeout(() => showZoneMessage(zone.message, zone.messageDuration), 16);
                    }
                }
                break;
            }
        }

        // Re-arm zones when player has fully left all zones
        if (!currentZone) {
            for (let zId of ritualState._triggeredZones) {
                const zObj = ritualState.zones.find(z => z.id === zId);
                if (zObj && zObj.messageOnce === false) {
                    ritualState._triggeredZones.delete(zId);
                }
            }
        }

        // Zone music management
        const nextMusicUrl = currentZone?.musicUrl || '';
        if (nextMusicUrl !== (ritualState._activeZoneMusicUrl || '')) {
            if (ritualState._zoneAudio) {
                try { ritualState._zoneAudio.pause(); } catch(e) {}
                ritualState._zoneAudio = null;
            }
            ritualState._activeZoneMusicUrl = nextMusicUrl;
            if (nextMusicUrl) {
                const za = new Audio(nextMusicUrl);
                za.loop = true;
                za.volume = 0.45;
                za.play().catch(() => {});
                ritualState._zoneAudio = za;
            }
        }
    }

    // Camera follow limits
    if (typeof VIEWPORT_W !== 'undefined') {
        gameState.camera.x += (player.x - VIEWPORT_W/2 - gameState.camera.x) * 0.1;
        gameState.camera.y += (player.y - VIEWPORT_H/2 - gameState.camera.y) * 0.1;
        gameState.camera.x = Math.max(0, Math.min(gameState.camera.x, ritualState.tilesX * ritualState.gridSize - VIEWPORT_W));
        gameState.camera.y = Math.max(0, Math.min(gameState.camera.y, ritualState.tilesY * ritualState.gridSize - VIEWPORT_H));
    }

    gameState.enemies = gameState.enemies.filter(e => {
        if (e.dead) {
            if (e.type === 'boss') ritualState.questBosses++;
            else ritualState.questMinions++;
            
            if (e.id && ritualState.assets) {
                const guardedTreasures = ritualState.assets.filter(a => 
                    a.interactProps && 
                    a.interactProps.type === 'treasure' && 
                    a.interactProps.treasureGuardianId === e.id
                );
                
                guardedTreasures.forEach(gt => {
                    if (gt.interactProps.treasureVisibleBeforeDefeat === 'false' || gt.interactProps.treasureVisibleBeforeDefeat === false) {
                        gt.hidden = false;
                        createParticles(gt.x + gt.w/2, gt.y + gt.h/2, 10, '#fa0');
                    }
                    if (gt.interactProps.treasureDefeatMsg) {
                        const msg = gt.interactProps.treasureDefeatMsg.trim();
                        if (msg) setTimeout(() => showZoneMessage(msg), 100);
                    }
                });
            }
            return false;
        }
        return true;
    });

    // --- ENEMY PROJECTILES ---
    gameState.enemyProjectiles.forEach(ep => {
        ep.x += ep.vx; ep.y += ep.vy; ep.life--;
        let hit = false;
        let size = ep.size || 10;
        
        if (rectIntersect(ep.x, ep.y, size, size, player.x, player.y, player.w, player.h)) {
            takeDamage(ep.damage || 15, "Enemy Projectile");
            createParticles(player.x + player.w/2, player.y + player.h/2, 15, '#ff3300');
            hit = true;
        } else {
            // Check Wall Collision
            for (let k = 0; k < ritualState.assets.length; k++) {
                let a = ritualState.assets[k];
                if (a.hidden || !a.solid) continue;
                if (assetIntersect(ep.x, ep.y, size, size, a)) {
                    hit = true;
                    // Destructible Walls check
                    if (a.destructibleHp > 0) {
                        a.destructibleHp -= (ep.damage || 15);
                        createParticles(ep.x, ep.y, 3, '#f00'); // small explosion
                        if (a.destructibleHp <= 0) {
                            a.hidden = true;
                            a.solid = false;
                            playSound('enemy_kill'); // wall broken
                        }
                    }
                    break;
                }
            }
        }
        if (hit) ep.life = 0;
    });
    gameState.enemyProjectiles = gameState.enemyProjectiles.filter(p => p.life > 0);

    // --- PLAYER PROJECTILES ---
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        let p = gameState.projectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        
        let hitEnemy = false;
        let hitWall = false;
        const size = p.size || 10;

        // Check Wall Collision First
        for (let k = 0; k < ritualState.assets.length; k++) {
            let a = ritualState.assets[k];
            if (a.hidden || !a.solid) continue;
            
            if (assetIntersect(p.x, p.y, size, size, a)) {
                hitWall = true;
                if (a.destructibleHp > 0) {
                    a.destructibleHp -= (p.damage || 10);
                    createParticles(p.x, p.y, 5, p.color || '#fff');
                    if (a.destructibleHp <= 0) {
                        a.hidden = true;
                        a.solid = false;
                        playSound('enemy_kill'); // Feedback for wall breaking
                    }
                } else {
                    // Normal invincible wall hit
                    createParticles(p.x, p.y, 2, p.color || '#fff');
                }
                break; // Stop checking other walls
            }
        }

        // Check Enemy Collision
        if (!hitWall) {
            for (let j = 0; j < gameState.enemies.length; j++) {
                let e = gameState.enemies[j];
                if (rectIntersect(p.x, p.y, size, size, e.x, e.y, e.w, e.h)) {
                    e.hp -= (p.damage || 10); 
                    if (!p.pierce) { hitEnemy = true; }
                    playSound('enemy_hit');
                    createParticles(e.x + e.w/2, e.y + e.h/2, 15, p.color || '#fff');
                    if (e.hp <= 0) { e.dead = true; playSound('enemy_kill'); }
                    if (!p.pierce) break;
                }
            }
        }

        if (p.life <= 0 || hitEnemy || hitWall) gameState.projectiles.splice(i, 1);
    }
    
    // Process Kill Aura (Player Map Option)
    if (player.killAura) {
        if (Math.random() < 0.2) createParticles(player.x + player.w/2, player.y + player.h/2, 2, '#fa0');
        gameState.enemies.forEach(e => {
            if (distance(player.x + player.w/2, player.y + player.h/2, e.x + e.w/2, e.y + e.h/2) < 200) {
                e.hp -= 2; 
                createParticles(e.x + e.w/2, e.y + e.h/2, 1, '#ff0');
                if (e.hp <= 0) { e.dead = true; playSound('enemy_kill'); }
            }
        });
    }

    gameState.enemies.forEach(e => {
        let angle = Math.atan2(player.y - e.y, player.x - e.x); 
        let moveX = 0, moveY = 0;
        
        let isChasing = e.canChase || e.aiBehavior === 'chaser' || e.aiBehavior === 'chaser_shooter' || (!e.aiBehavior && !e.canPatrol && !e.canShoot && !e.canChase);
        let isPatrolling = e.canPatrol || e.aiBehavior === 'patrol' || e.aiBehavior === 'patrol_shooter';
        let isShooting = e.canShoot || e.aiBehavior === 'shooter' || e.aiBehavior === 'patrol_shooter' || e.aiBehavior === 'chaser_shooter';
        
        if (isShooting) e.canShoot = true;

        if (isChasing && isPatrolling) {
            // Priority: Chase if close, otherwise Patrol
            if (distance(player.x, player.y, e.x, e.y) < 500) {
                let speed = (e.type === 'boss' ? 2.5 * e.speed : 1.5 * e.speed);
                moveX = Math.cos(angle) * speed; 
                moveY = Math.sin(angle) * speed;
            } else {
                if (!e.patrolDir) e.patrolDir = 1;
                moveX = e.patrolDir * e.speed;
                if (Math.random() < 0.02) e.patrolDir *= -1;
                angle = e.patrolDir > 0 ? 0 : Math.PI;
            }
        } else if (isChasing) {
            let speed = (e.type === 'boss' ? 2.5 * e.speed : 1.5 * e.speed);
            moveX = Math.cos(angle) * speed; 
            moveY = Math.sin(angle) * speed;
        } else if (isPatrolling) {
            if (!e.patrolDir) e.patrolDir = 1;
            moveX = e.patrolDir * e.speed;
            if (Math.random() < 0.02) e.patrolDir *= -1;
            angle = e.patrolDir > 0 ? 0 : Math.PI;
        }

        let newX = e.x + moveX;
        let newY = e.y + moveY;
        
        // Bounds limit
        newX = Math.max(0, Math.min(newX, ritualState.tilesX * ritualState.gridSize - e.w));
        newY = Math.max(0, Math.min(newY, ritualState.tilesY * ritualState.gridSize - e.h));
        
        // Enemy Wall collision logic (sharing player rules)
        let hitX = false, hitY = false;
        ritualState.assets.forEach(a => {
            if (a.hidden || !a.solid) return;
            if (assetIntersect(newX, e.y, e.w, e.h, a)) hitX = true;
            if (assetIntersect(e.x, newY, e.w, e.h, a)) hitY = true;
        });
        
        if (!hitX) e.x = newX; else e.patrolDir = (e.patrolDir || 1) * -1;
        if (!hitY) e.y = newY;
        
        gameState.enemies.forEach(other => {
            if (e === other) return;
            const dist = distance(e.x, e.y, other.x, other.y);
            const minDist = (e.w + other.w) * 0.4;
            if (dist < minDist && dist > 0) {
                e.x += ((e.x - other.x) / dist) * 1.5; 
                e.y += ((e.y - other.y) / dist) * 1.5;
            }
        });
        
        if (e.isAttacking) {
            e.animTimer++;
            if (e.animTimer > 5) {
                e.frameX++; e.animTimer = 0;
                if (e.frameX > 3) { e.isAttacking = false; e.frameX = 0; }
            }
            e.frameY = 3; 
        } else {
            let dirVx = Math.cos(angle); let dirVy = Math.sin(angle);
            if (Math.abs(dirVy) > Math.abs(dirVx)) { e.frameY = dirVy > 0 ? 0 : 1; e.flipX = false; } 
            else { e.frameY = 2; e.flipX = dirVx < 0; }
            e.animTimer++;
            if (e.animTimer > 10) { e.frameX = (e.frameX + 1) % 4; e.animTimer = 0; }
        }
        
        if (e.canShoot) {
            e.shootTimer++;
            const mRate = e.fireRate || 100;
            if (e.shootTimer > mRate) {
                e.shootTimer = 0;
                let ejSpeed = e.projSpeed || 6;
                let ejDamage = e.projDamage || 15;
                gameState.enemyProjectiles.push({ 
                    x: e.x + e.w/2, 
                    y: e.y + e.h/2, 
                    vx: Math.cos(angle)*ejSpeed, 
                    vy: Math.sin(angle)*ejSpeed, 
                    life: e.projDist || 60,
                    damage: ejDamage,
                    weapon: e.enemyWeapon,
                    size: parseFloat(e.enemyProjSize) || 18
                });
                playSound('shoot');
            }
        }

        if (Math.random() < 0.005 && distance(player.x, player.y, e.x, e.y) < 600) playSound(e.soundType);
        
        if (rectIntersect(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) { 
            takeDamage(10, "Enemy Contact (" + e.type + ")");
            if (!e.isAttacking) { e.isAttacking = true; e.frameX = 0; e.frameY = 3; e.animTimer = 0; }
        }
    });
}

function drawRitualMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw floor image if set, scrolled with camera
    const _fi = ritualState && ritualState.floor ? SPRITE_SHEETS[ritualState.floor] : null;
    if (_fi && _fi.complete && _fi.naturalWidth > 0) {
        const mapW = ritualState.tilesX * ritualState.gridSize;
        const mapH = ritualState.tilesY * ritualState.gridSize;
        ctx.drawImage(_fi,
            gameState.camera.x / mapW * _fi.naturalWidth,
            gameState.camera.y / mapH * _fi.naturalHeight,
            (canvas.width  / mapW) * _fi.naturalWidth,
            (canvas.height / mapH) * _fi.naturalHeight,
            0, 0, canvas.width, canvas.height
        );
    } else {
        ctx.fillStyle = '#050212';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(-Math.floor(gameState.camera.x), -Math.floor(gameState.camera.y));

    const viewW = typeof VIEWPORT_W !== 'undefined' ? VIEWPORT_W : canvas.width;
    const viewH = typeof VIEWPORT_H !== 'undefined' ? VIEWPORT_H : canvas.height;
    
    // Build draw list with three-layer ordering:
    //   1. 'behind' assets  — renderLayer === 'behind': always drawn before characters (chars walk over them)
    //   2. 'auto'   assets  — no renderLayer set: merged with chars by y-depth (array order preserved)
    //   3. 'front'  assets  — renderLayer === 'front': always drawn after characters (chars walk behind them)
    // Within the 'auto' middle group, static asset array order (set by the editor's
    // Move to Front/Back controls) is preserved, and dynamic entities (player + enemies)
    // are inserted at their correct y-depth position among those assets.
    const behindAssets = []; // renderLayer === 'behind'
    const autoAssets   = []; // no renderLayer (default depth-sort)
    const frontAssets  = []; // renderLayer === 'front'

    ritualState.assets.forEach(a => {
        if (a.hidden) return;
        const rl = a.renderLayer || (a.interactProps && a.interactProps.renderLayer) || '';
        if (rl === 'behind') behindAssets.push(a);
        else if (rl === 'front') frontAssets.push(a);
        else autoAssets.push(a);
    });

    const dynamics = [];
    if (player.hp > 0) { dynamics.push({ isPlayer: true, sortY: player.y + player.h }); }
    gameState.enemies.forEach(e => {
        dynamics.push({ isEnemy: true, entity: e, sortY: e.y + e.h });
    });

    // Merge dynamics into auto-layer assets only (by y-depth), preserving array order
    const autoWithDynamics = [...autoAssets];
    dynamics.forEach(dyn => {
        let insertAt = autoWithDynamics.length;
        for (let i = 0; i < autoWithDynamics.length; i++) {
            if (autoWithDynamics[i].isPlayer || autoWithDynamics[i].isEnemy) continue;
            const aBottom = (autoWithDynamics[i].y || 0) + (autoWithDynamics[i].h || 0);
            if (aBottom > dyn.sortY) { insertAt = i; break; }
        }
        autoWithDynamics.splice(insertAt, 0, dyn);
    });

    // Final draw order: behind → auto+chars merged → front
    let drawables = [...behindAssets, ...autoWithDynamics, ...frontAssets];
    
    drawables.forEach(item => {
        if (item.isPlayer) {
            let pOpacity = 1.0;
            for (let a of ritualState.assets) {
                if (a.hidden) continue;
                let isDoorOrPortal = (a.interactProps && (a.interactProps.type == 'door' || a.interactProps.type == 'portal')) || a.type.includes('door') || a.type == 'crystal_arch_entrance';
                if (isDoorOrPortal && rectIntersect(player.x, player.y, player.w, player.h, a.x, a.y, a.w, a.h)) {
                    pOpacity = 0.4;
                    break;
                }
            }
            ctx.globalAlpha = pOpacity;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(player.x + player.w/2, player.y + player.h - 5, player.w/2, 10, 0, 0, Math.PI*2); ctx.fill();

            // Render player: use legacy wizard/witch sprites if known class, otherwise
            // fall back to the custom character's sprite sheet from AVAILABLE_ASSETS.
            const isLegacyClass = gameState.playerClass === 'witch' || gameState.playerClass === 'wizard';
            if (isLegacyClass) {
                const pKey = gameState.playerClass === 'witch' ? 'PLAYER_WITCH' : 'PLAYER_WIZARD';
                drawSprite(ctx, SPRITES[pKey], player.x, player.y, player.w, player.frameX, player.frameY, player.flipX);
            } else if (player.customAssetType) {
                // Custom character: look up its sprite sheet via AVAILABLE_ASSETS
                // Use pre-resolved path (set during initRitualMap) or fall back to AVAILABLE_ASSETS lookup
                const charPath = player._resolvedAssetPath
                    || (() => {
                        const dInfo = (typeof AVAILABLE_ASSETS !== 'undefined')
                            ? AVAILABLE_ASSETS.find(a => a.id === player.customAssetType) : null;
                        if (!dInfo) return null;
                        const p = dInfo.path.replace('../../', '../');
                        if (!SPRITE_SHEETS[p]) { const img = new Image(); img.src = p; SPRITE_SHEETS[p] = img; }
                        return p;
                    })();
                const charImg = charPath ? SPRITE_SHEETS[charPath] : null;
                if (charImg && charImg.complete && charImg.naturalWidth > 0) {
                    // Animate through the sprite sheet rows/cols matching player facing
                    const frameCol = player.frameX % 4;
                    ctx.save();
                    ctx.translate(player.x + player.w/2, player.y + player.h/2);
                    if (player.flipX) ctx.scale(-1, 1);
                    ctx.drawImage(charImg, frameCol * 512, player.frameY * 512, 512, 512,
                                  -player.w/2, -player.h/2, player.w, player.h);
                    ctx.restore();
                }
            } else {
                // Ultimate fallback: wizard sprite
                drawSprite(ctx, SPRITES['PLAYER_WIZARD'], player.x, player.y, player.w, player.frameX, player.frameY, player.flipX);
            }
            ctx.globalAlpha = 1.0;
        } else if (item.isEnemy) {
            const e = item.entity;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(e.x + e.w/2, e.y + e.h - 5, e.w/2, 10, 0, 0, Math.PI*2); ctx.fill();
            
            let resolvedKey = e.spriteKey || e.sheet;
            if (typeof resolvedKey === 'string' && !SPRITE_SHEETS[resolvedKey] && typeof AVAILABLE_ASSETS !== 'undefined') {
                const dInfo = AVAILABLE_ASSETS.find(a => a.id === resolvedKey || a.id === resolvedKey + '_0_0');
                if (dInfo) {
                    resolvedKey = dInfo.path.replace('../../', '../');
                    if (!SPRITE_SHEETS[resolvedKey]) {
                        const img = new Image(); img.src = resolvedKey; SPRITE_SHEETS[resolvedKey] = img;
                    }
                }
            }
            drawSprite(ctx, resolvedKey, e.x, e.y, e.w, e.frameX, e.frameY, e.flipX);
        } else {
            // Culling
            if (item.x + item.w < gameState.camera.x - 100 || item.x > gameState.camera.x + viewW + 100 ||
                item.y + item.h < gameState.camera.y - 100 || item.y > gameState.camera.y + viewH + 100) return;
                
            let sInfo = RITUAL_SPRITES[item.type];
            let crystalImg = SPRITE_SHEETS['crystal_structure'];
            let directImg = SPRITE_SHEETS[item.type];
            
            // Map editor dynamic generic objects parsing
            let dAssetInfo = (typeof AVAILABLE_ASSETS !== 'undefined') ? AVAILABLE_ASSETS.find(a => a.id === item.type) : null;
            let mapAssetImage = null;
            if (dAssetInfo) {
                let fixPath = dAssetInfo.path.replace('../../', '../');
                mapAssetImage = SPRITE_SHEETS[fixPath];
            }


            if (sInfo && crystalImg && crystalImg.complete) {
                if (item.id === 'shard') {
                    let pulse = Math.abs(Math.sin(Date.now() / 300)) * 10;
                    ctx.shadowColor = '#ff66aa'; ctx.shadowBlur = 20 + pulse;
                }
                // If the map editor set a cx/cy/cw/ch crop override, use it with transforms.
                // Otherwise fall back to the whole RITUAL_SPRITES region.
                if (item.cx !== undefined) {
                    ctx.save();
                    ctx.translate(item.x + item.w/2, item.y + item.h/2);
                    if (item.flipX) ctx.scale(-1, 1);
                    if (item.rotation) ctx.rotate(item.rotation * Math.PI / 180);
                    // When flipped, the editor stores cx from source-left but scale(-1,1) maps
                    // source-left→visual-right, so mirror cx within the tile to land on the correct side.
                    let drawCX = item.cx;
                    if (item.flipX) drawCX = (sInfo.sx + sInfo.sw) - (item.cx - sInfo.sx) - item.cw;
                    ctx.drawImage(crystalImg, drawCX, item.cy || 0, item.cw, item.ch, -item.w/2, -item.h/2, item.w, item.h);
                    ctx.restore();
                } else {
                    ctx.drawImage(crystalImg, sInfo.sx, sInfo.sy, sInfo.sw, sInfo.sh, item.x, item.y, item.w, item.h);
                }
                ctx.shadowBlur = 0;
            } else if (mapAssetImage && mapAssetImage.complete) {
                // Dynamically cropped sprite sheets from the auto generator
                ctx.save();
                ctx.translate(item.x + item.w/2, item.y + item.h/2);
                if (item.flipX) ctx.scale(-1, 1);
                if (item.rotation) ctx.rotate(item.rotation * Math.PI / 180);
                
                // Per-instance cx/cy/cw/ch overrides take priority (e.g. corner assets with custom crops).
                // Fall back to the asset definition's sheet coordinates.
                let cropX = item.cx !== undefined ? item.cx : ((dAssetInfo && dAssetInfo.sx) || 0);
                let cropY = item.cy !== undefined ? item.cy : ((dAssetInfo && dAssetInfo.sy) || 0);
                let cropW = item.cw !== undefined ? item.cw : ((dAssetInfo && dAssetInfo.sw) || 512);
                let cropH = item.ch !== undefined ? item.ch : ((dAssetInfo && dAssetInfo.sh) || 512);

                // Idle animation specifically designed for characters loosely placed, avoiding sheet crops.
                if (dAssetInfo && dAssetInfo.path && dAssetInfo.path.includes('/characters/') && !dAssetInfo.path.includes('sheet')) {
                    cropX = Math.floor((Date.now() / 250) % 4) * cropW;
                }

                // Destination uses item.w/item.h (the map editor's world-space size) so the sprite
                // fills its intended grid cell. Source uses the correct crop region.
                // When flipped, mirror cropX within the tile so the crop lands on the correct visual side.
                if (item.flipX && item.cx !== undefined) {
                    const tileSx = (dAssetInfo && dAssetInfo.sx) || 0;
                    const tileSw = (dAssetInfo && dAssetInfo.sw) || (mapAssetImage.naturalWidth || 512);
                    cropX = (tileSx + tileSw) - (cropX - tileSx) - cropW;
                }

                ctx.drawImage(mapAssetImage, cropX, cropY, cropW, cropH, -item.w/2, -item.h/2, item.w, item.h);
                ctx.restore();
            } else if (directImg && directImg.complete) {
                // Fallback for ANY map editor placed graphic that isn't a wall block!
                ctx.save();
                ctx.translate(item.x + item.w/2, item.y + item.h/2);
                if (item.flipX) ctx.scale(-1, 1);
                if (item.rotation) ctx.rotate(item.rotation * Math.PI / 180);
                // Draw 1st frame by default for static decoration characters!
                ctx.drawImage(directImg, 0, 0, 512, 512, -item.w/2, -item.h/2, item.w, item.h);
                ctx.restore();
            } else if (item.type === 'shard') { // Fallback if image not loaded
                ctx.fillStyle = '#ff66aa';
                ctx.beginPath();
                ctx.arc(item.x + item.w/2, item.y + item.h/2, 20, 0, Math.PI*2);
                ctx.fill();
            } else if (item.type === 'oracle') { // Fallback
                ctx.fillStyle = '#aaa'; ctx.fillRect(item.x, item.y, item.w, item.h);
            }
            
        }
    });

    gameState.projectiles.forEach(p => window.drawActiveProjectile(ctx, p, false));
    gameState.enemyProjectiles.forEach(p => window.drawActiveProjectile(ctx, p, true));

    // Particles
    gameState.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 30);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
        p.x += p.vx; p.y += p.vy; p.life--;
    });
    gameState.particles = gameState.particles.filter(p => p.life > 0);
    
    // Added GUI text overlay for guidance
    ctx.restore();
    
    ctx.fillStyle = 'white';
    ctx.font = '20px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText("Ritual Labyrinth: The Ego Trap", 20, 30);
    if(ritualState.shards > 0) {
         ctx.fillStyle = '#ff66aa';
         ctx.fillText("Shard Acquired - Seek the Stairs", 20, 60);
    }
}