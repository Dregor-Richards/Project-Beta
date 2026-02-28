// Boss arena configuration (15x15, 0-based indices)
const BOSS_GRID_SIZE = 15;

// Tiles that do NOT exist (holes), 0-based
const BOSS_MISSING_TILES = [
  0, 1, 2, 3, 4, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 25, 26, 27, 28, 29,
  30, 31, 43, 44, 45, 46, 48, 49, 55, 56,
  58, 59, 60, 61, 63, 64, 70, 71, 73, 74,
  150, 151, 153, 154, 160, 161, 163, 164,
  165, 166, 168, 169, 175, 176, 178, 179,
  180, 181, 193, 194, 195, 196, 197, 198,
  199, 205, 206, 207, 208, 209, 210, 211,
  212, 213, 214, 220, 221, 222, 223, 224
];

// Boss spawn candidates (0-based)
const BOSS_SPAWN_TILES = [37, 107, 117, 187];

// Player spawn (0-based)
const BOSS_PLAYER_SPAWN = 112;

// Global boss index for later use
let bossIndex = null;

let bossScoreBase = 15;        // normal boss kill value
let bossWyrdScoreMultiplier = 1;
let bossHeartScoreMultiplier = 1;

// Boss health
let bossMaxHealth = 6;
let bossHealth = 6;
let bossStage = 1;          // 1, 2, or 3
let bossTurnCounter = 0;    // counts boss turns for patterns (e.g., move / move / pause)
let bossCanMoveThisTurn = false; // derived each boss turn

let bossMortarTargets = [];
let bossPendingHits = [];

/**
 * Called instead of normal layout when difficulty 10.
 * Builds a 15x15 grid, removes missing tiles, positions player & boss.
 */
function setupBossLevel() {
  gridSize = BOSS_GRID_SIZE;

  bossMaxHealth = 6;
  bossHealth = 6;
  bossStage = 1;
  bossTurnCounter = 0;
  bossWyrdScoreMultiplier = 1;
  bossHeartScoreMultiplier = 1;

  buildGrid(gridSize);

  const cells = getAllCells();

  BOSS_MISSING_TILES.forEach((idx) => {
    const cell = cells[idx];
    if (!cell) return;
    cell.classList.add('boss-hole');
  });

  // Center player (convert 0-based spawn to 1-based board index)
  avatarIndex = BOSS_PLAYER_SPAWN + 1;

  // Clear normal level entities
  enemies = [];
  fastEnemies = [];
  trackerEnemies = [];
  mortarEnemies = [];
  mortarTargets = [];
  frozenEnemyTiles = new Set();
  doorIndex = null;
  heartIndex = null;
  skipTileIndex = null;
  wandIndex = null;
  currentWandSubtype = null;
  stoneIndex = null;
  stonePresent = false;
  stoneType = null;
  bossMortarTargets = [];

  // Choose boss spawn (0-based)
  const choice =
    BOSS_SPAWN_TILES[Math.floor(Math.random() * BOSS_SPAWN_TILES.length)];
  bossIndex = choice;

  // Show and fill health bar
  showBossHealthBar();
  updateBossStage();
  redrawBoard();
}


function showBossHealthBar() {
  const wrapper = document.getElementById('boss-health-wrapper');
  const pipsContainer = document.getElementById('boss-health-pips');
  if (!wrapper || !pipsContainer) return;

  wrapper.classList.remove('hidden');

  pipsContainer.innerHTML = '';
  for (let i = 0; i < bossMaxHealth; i++) {
    const pip = document.createElement('div');
    pip.className = 'boss-health-pip' + (i < bossHealth ? ' full' : '');
    pipsContainer.appendChild(pip);
  }
}

function redrawBossHealth() {
  const pipsContainer = document.getElementById('boss-health-pips');
  if (!pipsContainer) return;
  const pips = pipsContainer.querySelectorAll('.boss-health-pip');
  pips.forEach((pip, index) => {
    if (index < bossHealth) {
      pip.classList.add('full');
    } else {
      pip.classList.remove('full');
    }
  });
}

/**
 * Called when the player hits the boss (walk or Fire wand).
 * Handles health loss, teleport, and boss respawn.
 */
async function hitBoss() {
  if (bossHealth <= 0) return;

  // Damage boss
  bossHealth -= 1;
  if (bossHealth < 0) bossHealth = 0;
  redrawBossHealth();
  updateBossStage();

  const bossTileIndex = bossIndex + 1;

  // Clear any Ice on the boss tile from the previous life
  if (frozenEnemyTiles && typeof frozenEnemyTiles.delete === 'function') {
    frozenEnemyTiles.delete(bossTileIndex);
  }

  // Small hit feedback
  spawnParticlesAtCell(bossTileIndex, 'kill');
  playSfx('enemyDeath');

// If boss is dead, end the fight
if (bossHealth === 0) {
  // Final boss score = base * Wyrd multiplier * Heart multiplier
  const finalBossScore =
    bossScoreBase *
    (bossWyrdScoreMultiplier || 1) *
    (bossHeartScoreMultiplier || 1);

  addScore(finalBossScore);
  showWinModal();
  return;
}

  // Teleport player back to center
  avatarIndex = BOSS_PLAYER_SPAWN + 1;

  // Pick a new arm tile different from the current one
  const choices = BOSS_SPAWN_TILES.filter((idx) => idx !== bossIndex);
  const newChoice =
    choices[Math.floor(Math.random() * choices.length)];
  bossIndex = newChoice;

  // Reset boss turn rhythm
  bossTurnCounter = 0;

  // Redraw board and place boss at new spot
  redrawBoard();
}

function updateBossStage() {
  if (bossHealth > 4) {
    bossStage = 1;
  } else if (bossHealth > 2) {
    bossStage = 2;
  } else {
    bossStage = 3;
  }
}

function getAllValidBossTiles() {
  const size = gridSize;
  const maxIndex = size * size;
  const missingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));
  const valid = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!missingSet.has(i)) valid.push(i);
  }
  return valid;
}

async function resolveBossMortarHits() {
  if (!Array.isArray(bossMortarTargets) || bossMortarTargets.length === 0) return;

  const hits = bossMortarTargets.slice();  // tiles currently marked
  bossMortarTargets = [];                  // clear marks; redraw will remove icons

  for (const idx of hits) {
    if (idx === avatarIndex && !playerDead) {
      const died = await applyPlayerHit(1);
      if (died) return;
    }
  }
}



function pickRandomTilesFrom(array, count) {
  const result = [];
  const pool = array.slice();
  const max = Math.min(count, pool.length);
  for (let i = 0; i < max; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

async function moveBossTowardsPlayer(stepsMin, stepsMax) {
  if (bossHealth <= 0) return;

  const steps = randomInt(stepsMin, stepsMax);

  const size = gridSize;
  const maxIndex = size * size;
  const missingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));

  let bossTileIndex = bossIndex + 1; // 1-based
  const playerTileIndex = avatarIndex;

  const distance = (a, b) => {
    const az = a - 1;
    const bz = b - 1;
    const ar = Math.floor(az / size);
    const ac = az % size;
    const br = Math.floor(bz / size);
    const bc = bz % size;
    return Math.abs(ar - br) + Math.abs(ac - bc);
  };

  let currentDist = distance(bossTileIndex, playerTileIndex);

  for (let i = 0; i < steps; i++) {
    const candidates = [];

    const up = bossTileIndex - size;
    if (up >= 1 && !missingSet.has(up) && distance(up, playerTileIndex) < currentDist) {
      candidates.push(up);
    }

    const down = bossTileIndex + size;
    if (down <= maxIndex && !missingSet.has(down) && distance(down, playerTileIndex) < currentDist) {
      candidates.push(down);
    }

    if ((bossTileIndex - 1) % size !== 0) {
      const left = bossTileIndex - 1;
      if (!missingSet.has(left) && distance(left, playerTileIndex) < currentDist) {
        candidates.push(left);
      }
    }

    if (bossTileIndex % size !== 0) {
      const right = bossTileIndex + 1;
      if (!missingSet.has(right) && distance(right, playerTileIndex) < currentDist) {
        candidates.push(right);
      }
    }

    if (candidates.length === 0) break;

    const next = candidates[Math.floor(Math.random() * candidates.length)];

    // If boss would step onto the player
    if (next === playerTileIndex) {
        const died = await applyPlayerHit(1, false, null, null, null, true);

        if (died) {
        bossTileIndex = next;
        bossIndex = bossTileIndex - 1;
        redrawBoard();
        await sleep(250);
        showDeathModal();  // now that movement is visible
        return;
        } else {
        // Non-lethal: boss stays in place this turn
        break;
      }
    }

    // Normal step toward player
    bossTileIndex = next;
    bossIndex = bossTileIndex - 1;
    currentDist = distance(bossTileIndex, playerTileIndex);

    // Show each step and pause briefly
    redrawBoard();
    await sleep(120);
  }

  // Ensure final position is synced
  bossIndex = bossTileIndex - 1;
}


async function bossAct() {
  if (bossHealth <= 0 || playerDead) return;

  bossTurnCounter += 1;

  // Stage parameters (unchanged)
  let mortarMin, mortarMax;
  let stepsMin, stepsMax;
  let pattern;

  if (bossStage === 1) {
    mortarMin = 15;
    mortarMax = 25;
    stepsMin = 1;
    stepsMax = 3;
    pattern = 'everyOther';
  } else if (bossStage === 2) {
    mortarMin = 25;
    mortarMax = 35;
    stepsMin = 2;
    stepsMax = 4;
    pattern = 'everyOther';
  } else {
    mortarMin = 35;
    mortarMax = 45;
    stepsMin = 2;
    stepsMax = 4;
    pattern = 'twoThenPause';
  }

  let bossMoves = false;
  if (pattern === 'everyOther') {
    bossMoves = (bossTurnCounter % 2 === 1);
  } else {
    const mod = bossTurnCounter % 3;
    bossMoves = (mod === 1 || mod === 2);
  }

  // 1) Resolve hits on tiles that are currently marked (icons from last player turn)
  await resolveBossMortarHits();
  if (playerDead) return;

  // 2) Pick new tiles to mark
    const allValidTiles = getAllValidBossTiles();
    const bossTileIndex = bossIndex + 1; // 1-based

    // Exclude the boss's own tile from mortar targets
    const validTiles = allValidTiles.filter(tile => tile !== bossTileIndex);

    const count = randomInt(mortarMin, mortarMax);
    bossMortarTargets = pickRandomTilesFrom(validTiles, count);

    redrawBoard();

    // 3) Move boss
    if (bossMoves && !playerDead) {
      await moveBossTowardsPlayer(stepsMin, stepsMax);
      redrawBoard();
    }
}




// Debug: instantly kill the boss and trigger win
function killBossDebug() {
  bossHealth = 0;
  redrawBossHealth();
  const finalBossScore =
    bossScoreBase *
    (bossWyrdScoreMultiplier || 1) *
    (bossHeartScoreMultiplier || 1);

  addScore(finalBossScore);
  // If you want some feedback:
  // spawnParticlesAtCell(bossIndex + 1, 'kill');
  // playSfx('enemyDeath');

  showWinModal(); // same as hitBoss() uses when boss dies
}