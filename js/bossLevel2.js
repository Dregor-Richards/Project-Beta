// Boss arena configuration (21x21, 0-based indices)
const BOSS_GRID_SIZE = 21;

// Tiles that do NOT exist (holes), 0-based
const BOSS_MISSING_TILES = [
 0, 1, 19, 20, 21, 41, 66, 67,
 68, 69, 77, 78, 79, 80, 87, 
 90, 98, 101, 108, 111, 119, 
 122, 129, 130, 131, 132, 140, 141, 142, 
 143, 210, 211, 229, 230, 231, 232, 250, 
 251, 378, 379, 381, 382, 383, 385, 386, 
 387, 389, 390, 391, 393, 394, 395, 397, 
 398, 399, 400, 402, 403, 404, 406, 407, 
 408, 410, 411, 412, 414, 415, 416, 418, 
 419, 420, 421, 423, 424, 425, 427, 428, 
 429, 431, 432, 433, 435, 436, 437, 439, 440
];

// Lantern Spawn Upper Left, 0-based
const BOSS_LANTERN_A_SPAWN_TILES = [
 3, 4, 5, 6, 7, 8, 9, 10, 22, 23, 24, 25, 26, 27, 28, 
 29, 30, 42, 43, 45, 46, 47, 48, 49, 50, 51, 63, 64, 
 65, 70, 71, 72, 84, 85, 86, 91, 92, 93, 105, 106, 107,
 112, 113, 114, 126, 127, 128, 133, 134, 135, 147, 148, 
 149, 150, 151, 152, 153, 154, 155, 156, 168, 169, 170, 
 172, 173, 174, 175, 176, 177, 189, 190, 191, 192, 193, 
 194, 195, 196, 197, 198
];

// Lantern Lighting Upper Left, 0-based
const BOSS_LIGHTING_A_TILES = [
 3, 4, 5, 6, 7, 8, 9, 10, 22, 23, 24, 25, 26, 27, 28, 
 29, 30, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 63, 
 64, 65, 66, 67, 68, 69, 70, 71, 72, 84, 85, 86, 87, 
 88, 89, 90, 91, 92, 93, 105, 106, 107, 108, 109, 110, 
 111, 112, 113, 114, 126, 127, 128, 129, 130, 131, 132,
 133, 134, 135, 147, 148, 149, 150, 151, 152, 153, 154, 
 155, 156, 168, 169, 170, 171, 172, 173, 174, 175, 176, 
 177, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198
];

// Lantern Spawn Upper Right, 0-based
const BOSS_LANTERN_B_SPAWN_TILES = [
 12, 13, 14, 15, 16, 17, 18, 19, 32, 33, 34, 35, 36, 37, 
 38, 39, 40, 53, 54, 55, 56, 57, 58, 59, 61, 62, 74, 75, 
 76, 81, 82, 83, 95, 96, 97, 102, 103, 104, 116, 117, 118, 
 123, 124, 125, 137, 138, 139, 144, 145, 146, 158, 159, 160, 
 161, 162, 163, 164, 165, 166, 167, 179, 180, 181, 182, 183, 
 184, 186, 187, 188, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209
];

// Lantern Lighting Upper Right, 0-based
const BOSS_LIGHTING_B_TILES = [
 12, 13, 14, 15, 16, 17, 18, 19, 32, 33, 34, 35, 
 36, 37, 38, 39, 40, 53, 54, 55, 56, 57, 58, 59, 
 60, 61, 62, 74, 75, 76, 77, 78, 79, 80, 81, 82, 
 83, 95, 96, 97, 98, 99, 100, 101, 102, 103, 
 104, 116, 117, 118, 119, 120, 121, 122, 123, 
 124, 125, 137, 138, 139, 140, 141, 142, 143, 
 144, 145, 146, 158, 159, 160, 161, 162, 163, 
 164, 165, 166, 167, 179, 180, 181, 182, 183,
 184, 185, 186, 187, 188, 200, 201, 202, 203,
 204, 205, 206, 207, 208, 209
];

// Lantern Spawn Lower, 0-based
const BOSS_LANTERN_C_SPAWN_TILES = [
 252, 253, 254, 255, 256, 257, 258, 259, 260, 261,
 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 
 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 
 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 
 292, 293, 294, 295, 296, 297, 298, 300, 301, 302, 
 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 
 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 
 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 
 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 
 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 
 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 
 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 
 373, 374, 375, 376, 377
];

// Lantern Lighting Lower Left, 0-based
const BOSS_LIGHTING_C_TILES = [
 233, 234, 235, 236, 237, 238, 239, 240, 252, 253, 
 254, 255, 256, 257, 258, 259, 260, 261, 273, 
 274, 275, 276, 277, 278, 279, 280, 281, 282, 294, 295, 
 296, 297, 298, 299, 300, 301, 302, 303, 315, 316, 317, 
 318, 319, 320, 321, 322, 323, 324, 336, 337, 338, 339, 
 340, 341, 342, 343, 344, 345, 357, 358, 359, 360, 361, 
 362, 363, 364, 365, 366, 380, 384, 401, 405, 422, 426
];

// Lantern Lighting Lower Right, 0-based (Shares C Spawn)
const BOSS_LIGHTING_D_TILES = [
 242, 243, 244, 245, 246, 247, 248, 249, 263, 264, 265, 
 266, 267, 268, 269, 270, 271, 272, 284, 285, 286, 287, 
 288, 289, 290, 291, 292, 293, 305, 306, 307, 308, 309, 
 310, 311, 312, 313, 314, 326, 327, 328, 329, 330, 331, 
 332, 333, 334, 335, 347, 348, 349, 350, 351, 352, 353, 
 354, 355, 356, 368, 369, 370, 371, 372, 373, 374, 375, 
 376, 377, 393, 397, 413, 417, 434, 438
];

// Lantern A&B Cross Lighting, 0-based
const BOSS_LIGHTING_AB_TILES = [11, 31, 51, 71, 91, 111, 131, 151, 171, 191, 211];

// Lantern A&C Cross Lighting, 0-based
const BOSS_LIGHTING_AC_TILES = [212, 213, 214, 215, 216, 217, 218, 219, 220];

// Lantern B&D Cross Lighting, 0-based
const BOSS_LIGHTING_BD_TILES = [220, 221, 222, 223, 224, 225, 226, 227, 228];

// Lantern C&D Cross Lighting, 0-based
const BOSS_LIGHTING_CD_TILES = [220, 241, 262, 283, 304, 325, 346, 367, 388, 409, 430];

// Boss spawn candidates (0-based)
const BOSS_SPAWN_TILES = [31, 171, 185, 299, 309];

// Mortar spawn candidates (0-based)
const BOSS_MORTAR_TILES = [422, 426, 430, 434, 438];

// Spectator spawns (0-based)
const BOSS_SPECTATOR_TILES = [88, 89, 99, 100, 109, 110, 120, 121];

// Brazier spawn (0-based)
const BOSS_BRAZIER_SPAWN_TILES = [44, 60, 337, 355];

// Player spawn (0-based)
const BOSS_PLAYER_SPAWN = 220;

// Global boss index for later use
let bossIndex = null;

let bossScoreBase = 25;        // normal boss kill value
let bossWyrdScoreMultiplier = 1;
let bossHeartScoreMultiplier = 1;

// Boss health
let bossMaxHealth = 7;
let bossHealth = 7;
let bossStage = 1;          // 1, 2, or 3
let bossTurnCounter = 0;    // counts boss turns for patterns (e.g., move / move / pause)
let bossCanMoveThisTurn = false; // derived each boss turn

/**
 * Called instead of normal layout when difficulty 10.
 * Builds a 21x21 grid, removes missing tiles, positions player & boss.
 */
function setupBossLevelB() {
  gridSize = BOSS_GRID_SIZE_B;
  bossMaxHealth = 7;
  bossHealth = 7;
  bossStage = 1;
  bossTurnCounter = 0;
  bossWyrdScoreMultiplier = 1;
  bossHeartScoreMultiplier = 1;

  buildGrid(gridSize);

  const cells = getAllCells();
  markBossMissingTiles(cells, BOSS_MISSING_TILES);

  avatarIndex = BOSS_PLAYER_SPAWN;
  resetCommonBossState();

  const choice = BOSS_SPAWN_TILES[Math.floor(Math.random() * BOSS_SPAWN_TILES.length)];
  bossIndex = choice;

  spawnBoss2StageEnemies();

  showBossHealthBar();
  updateBossStage();
  redrawBoard();
};

function spawnBoss2StageEnemies() {
  const blocked = new Set([
    bossIndex,
    avatarIndex,
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...summonerEnemies,
    ...spectatorEnemies
  ]);

  function takeRandomAvailable(pool) {
    const candidates = pool.filter(t => !blocked.has(t));
    if (candidates.length === 0) return null;
    const tile = candidates[Math.floor(Math.random() * candidates.length)];
    blocked.add(tile);
    return tile;
  }

  let mortarMin = 0;
  let mortarMax = 0;

  if (bossStage === 1) {
    mortarMin = 3;
    mortarMax = 5;
  } else if (bossStage === 2) {
    mortarMin = 2;
    mortarMax = 4;
  } else {
    mortarMin = 1;
    mortarMax = 3;
  }

  const mortarCount = randomInt(mortarMin, mortarMax);

  for (let i = 0; i < mortarCount; i++) {
    const tile = takeRandomAvailable(BOSS_MORTAR_TILES);
    if (tile == null) break;
    mortarEnemies.push(tile);
  }

  for (const tile of BOSS_SPECTATOR_TILES) {
    if (blocked.has(tile)) continue;
    blocked.add(tile);
    spectatorEnemies.push(tile);
  }
}

/**
 * Called when the player hits boss 2.
 * Handles health loss, teleport, and boss respawn.
 */
async function hitBoss2() {
  if (bossHealth <= 0) return;

  bossHealth -= 1;
  if (bossHealth < 0) bossHealth = 0;

  redrawBossHealth();
  updateBossStage();

  const bossTileIndex = bossIndex + 1;

  frozenEnemyTiles = new Set();
  blockedMortarTiles = new Set();

  spawnParticlesAtCell(bossTileIndex, 'kill');
  playSfx('enemyDeath');

  if (bossHealth === 0) {
    playSfx('beatBoss');

    const finalBossScore =
      bossScoreBase *
      (bossWyrdScoreMultiplier || 1) *
      (bossHeartScoreMultiplier || 1);

    addScore(finalBossScore);
    hideBossHealthBarIfNoElite();

    const rings = getRandomRings(2);
    openRingChoiceModal(rings, () => {
      showWinModal();
    });

    return;
  }

  avatarIndex = BOSS_PLAYER_SPAWN + 1;

  const choices = BOSS_SPAWN_TILES.filter((idx) => idx !== bossIndex);
  const newChoice = choices[Math.floor(Math.random() * choices.length)];
  bossIndex = newChoice;

  bossTurnCounter = 0;
  movesThisTurn = 0;

  enemies = [];
  fastEnemies = [];
  trackerEnemies = [];
  mortarEnemies = [];
  mortarTargets = [];
  mortarJustTargeted = false;
  mortarFireCount = 0;

  spawnBoss2StageEnemies();

  redrawBoard();
}

function updateBossStage() {
  if (bossHealth > 5) {
    bossStage = 1;
  } else if (bossHealth > 2) {
    bossStage = 2;
  } else {
    bossStage = 3;
  }
}

// Same as boss 1 random moves, made copy just in case later bosses use different random
async function moveBoss2Randomly(stepsMin, stepsMax) {
  if (bossHealth <= 0) return;

  const steps = randomInt(stepsMin, stepsMax);

  const size = gridSize;
  const maxIndex = size * size;
  const missingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));

  let bossTileIndex = bossIndex + 1; // 1-based
  const playerTileIndex = avatarIndex;

  for (let i = 0; i < steps; i++) {
    const dir = randomDirection();
    let next = bossTileIndex;

    if (dir === 'up') {
      const up = bossTileIndex - size;
      if (up >= 1 && !missingSet.has(up)) next = up;
    } else if (dir === 'down') {
      const down = bossTileIndex + size;
      if (down <= maxIndex && !missingSet.has(down)) next = down;
    } else if (dir === 'left') {
      if ((bossTileIndex - 1) % size !== 0) {
        const left = bossTileIndex - 1;
        if (!missingSet.has(left)) next = left;
      }
    } else if (dir === 'right') {
      if (bossTileIndex % size !== 0) {
        const right = bossTileIndex + 1;
        if (!missingSet.has(right)) next = right;
      }
    }

    // If we didn't move, skip this step
    if (next === bossTileIndex) continue;

    // Stepping onto the player
    if (next === playerTileIndex) {
      const died = await applyPlayerHit(1, false, null, null, null, true);
      if (died) {
        bossTileIndex = next;
        bossIndex = bossTileIndex - 1;
        redrawBoard();
        await sleep(250);
        showDeathModal();
        return;
      } else {
        // Non-lethal: boss stays in place this turn
        break;
      }
    }

    // Do not step onto other enemies
    if (isTileOccupiedByEnemy(next)) {
      continue; // skip this direction, try another step next loop
    }

    // Normal random step
    bossTileIndex = next;
    bossIndex = bossTileIndex - 1;

    redrawBoard();
    await sleep(120);
  }

  bossIndex = bossTileIndex - 1;
}

async function bossAct() {
  if (bossHealth <= 0 || playerDead) return;

  bossTurnCounter += 1;

  // If boss is on an icy tile, it does absolutely nothing this turn
  if (isBossFrozen()) {
    bossMortarTargets = [];
    redrawBoard();
    return;
  }

  // Boss 2 does not use boss-fired mortars
  bossMortarTargets = [];

  // If boss 2 has any stage-specific effects, put them here later
  // For now, just move randomly
  await moveBoss2Randomly(2, 4);

  redrawBoard();
}