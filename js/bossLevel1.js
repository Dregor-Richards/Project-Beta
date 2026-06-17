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

// Center 5x5 block around the player (safe zone excluded later if needed) (1-based indices)
const BOSS_CENTER_5X5_TILES = [
  81, 82, 83, 84, 85,
  96, 97, 98, 99, 100,
  111, 112, 113, 114, 115,
  126, 127, 128, 129, 130,
  141, 142, 143, 144, 145
];

// Arms: the 1x5 hallways that connect each outer 5x5 patch (1-based indices)
const BOSS_ARM_TILES = [
  33, 34, 35, 41, 42, 43, 48, 58, 63, 73, 
  153, 163, 168, 178, 183, 184, 185,
  191, 192, 193
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
function setupBossLevelA() {
  gridSize = BOSS_GRID_SIZE;

  bossMaxHealth = 6;
  bossHealth = 6;
  bossStage = 1;
  bossTurnCounter = 0;
  bossWyrdScoreMultiplier = 1;
  bossHeartScoreMultiplier = 1;

  buildGrid(gridSize);

  const cells = getAllCells();
  markBossMissingTiles(cells, BOSS_MISSING_TILES); // another tiny helper if you like

  avatarIndex = BOSS_PLAYER_SPAWN + 1;

  resetCommonBossState();

  const choice = BOSS_SPAWN_TILES[Math.floor(Math.random() * BOSS_SPAWN_TILES.length)];
  bossIndex = choice;

  spawnBossStageEnemies();

  showBossHealthBar();
  updateBossStage();
  redrawBoard();
}

function spawnBossStageEnemies() {
  const maxIndex = gridSize * gridSize;
  const missingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));

  const bossTile = bossIndex + 1;

  function tileAt(r, c) {
    return r * gridSize + c + 1; // r,c 0-based
  }

  // Ring around center: 5x5 areas around the *central* 5x5,
  // excluding: actual center 5x5, boss spawn tiles, arms.
  const ringPool = [];

  // Precompute sets for quick exclusion
  const centerSet = new Set(BOSS_CENTER_5X5_TILES);
  const armSet    = new Set(BOSS_ARM_TILES);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const t = tileAt(r, c);
      if (missingSet.has(t)) continue;
      if (centerSet.has(t)) continue;   // keep center safe
      if (armSet.has(t)) continue;      // not an arm
      // This leaves: the four 5x5 “rings” around the center cross
      ringPool.push(t);
    }
  }

  // Arms pool for mortars
  const armPool = BOSS_ARM_TILES.filter(t => !missingSet.has(t));

  // Blocked tiles
  const blocked = new Set([
    bossTile,
    avatarIndex,
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...summonerEnemies,
  ]);

  function takeFrom(pool) {
    const candidates = pool.filter(t => !blocked.has(t));
    if (candidates.length === 0) return null;
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    blocked.add(idx);
    return idx;
  }

  // Stage ranges (unchanged) ...
  let mortarMin, mortarMax;
  let trackerMin, trackerMax;
  let normFastMin, normFastMax;

  if (bossStage === 1) {
    mortarMin   = 0; mortarMax   = 1;
    trackerMin  = 0; trackerMax  = 2;
    normFastMin = 0; normFastMax = 4;
  } else if (bossStage === 2) {
    mortarMin   = 2; mortarMax   = 3;
    trackerMin  = 2; trackerMax  = 4;
    normFastMin = 2; normFastMax = 8;
  } else {
    mortarMin   = 3; mortarMax   = 4;
    trackerMin  = 3; trackerMax  = 4;
    normFastMin = 4; normFastMax = 10;
  }

  const mortarCount   = randomInt(mortarMin,   mortarMax);
  const trackerCount  = randomInt(trackerMin,  trackerMax);
  const normFastCount = randomInt(normFastMin, normFastMax);

  // Mortars → only arms (correct)
  for (let i = 0; i < mortarCount; i++) {
    const tile = takeFrom(armPool);
    if (tile == null) break;
    mortarEnemies.push(tile);
  }

  // Trackers → ring around center (5x5 regions)
  for (let i = 0; i < trackerCount; i++) {
    const tile = takeFrom(ringPool);
    if (tile == null) break;
    trackerEnemies.push(tile);
  }

  // Normal + Fast → ring around center as well
  for (let i = 0; i < normFastCount; i++) {
    const tile = takeFrom(ringPool);
    if (tile == null) break;
    const isFast = Math.random() < 0.5;
    if (isFast) {
      fastEnemies.push(tile);
    } else {
      enemies.push(tile);
    }
  }
}

function showBossHealthBar() {
  const wrapper = document.getElementById('boss-health-wrapper');
  const pipsContainer = document.getElementById('boss-health-pips');
  if (!wrapper || !pipsContainer) return;
  mimicUsingBossBar = false;
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

function isBossFrozen() {
  if (bossIndex == null) return false;
  const bossTileIndex = bossIndex + 1; // 1-based
  return frozenEnemyTiles.has(bossTileIndex);
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

  // Clear all Ice tiles and blocked-mortar tiles for the new boss phase
  frozenEnemyTiles = new Set();
  blockedMortarTiles = new Set();

  // Small hit feedback
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

    // Trigger ring choice before the normal win flow
    const rings = getRandomRings(2);
    openRingChoiceModal(rings, () => {
      // After the player picks a ring, show the usual win modal
      showWinModal();
    });

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

  // Reset moves; mainly for lightning wand to get full impact
  movesThisTurn = 0;

  // Clear all adds from previous life, then spawn fresh for this stage
  enemies = [];
  fastEnemies = [];
  trackerEnemies = [];
  mortarEnemies = [];
  mortarTargets = [];
  mortarJustTargeted = false;
  mortarFireCount = 0;
  spawnBossStageEnemies();

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

async function moveBossRandomly(stepsMin, stepsMax) {
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

    // Do not step onto other enemies
    if (isTileOccupiedByEnemy(next)) {
      continue; // skip this direction, try another step next loop
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
    mortarMin = 20;
    mortarMax = 30;
    stepsMin = 2;
    stepsMax = 4;
    pattern = 'everyOther';
  } else {
    mortarMin = 25;
    mortarMax = 35;
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
  await resolveBossMortarHitsShared(bossMortarTargets);
  if (playerDead) return;

  // If boss is on an icy tile, it does absolutely nothing this turn
  if (isBossFrozen()) {
    bossMortarTargets = [];  // ensure no telegraphs remain
    redrawBoard();
    return;
  }

  // 2) Pick new tiles to mark
    const allValidTiles = getAllValidBossTiles(gridSize, BOSS_MISSING_TILES);
    const bossTileIndex = bossIndex + 1; // 1-based

    // Exclude the boss's own tile from mortar targets
    let validTiles = allValidTiles.filter(tile => tile !== bossTileIndex);

    // Exclude icy tiles from boss targeting, to match mortar behavior
    validTiles = validTiles.filter(tile => !frozenEnemyTiles.has(tile));

    const count = randomInt(mortarMin, mortarMax);
    bossMortarTargets = pickRandomTilesFrom(validTiles, count);

    redrawBoard();

    // 3) Move boss
    if (bossMoves && !playerDead) {
      // 50/50: tracker-like (chasing) or normal-like (erratic) movement
      const useTrackerLike = Math.random() < 0.5;

      if (useTrackerLike) {
        await moveBossTowardsPlayer(stepsMin, stepsMax);
      } else {
        await moveBossRandomly(stepsMin, stepsMax);
      }

      redrawBoard();
    }
}





// Debug: instantly kill the boss and trigger win + ring choice
function killBossDebug() {
  bossHealth = 0;
  redrawBossHealth();

  const finalBossScore =
    bossScoreBase *
    (bossWyrdScoreMultiplier || 1) *
    (bossHeartScoreMultiplier || 1);

  addScore(finalBossScore);

  // Optional visual feedback:
  // spawnParticlesAtCell(bossIndex + 1, 'kill');
  // playSfx('enemyDeath');

  const rings = getRandomRings(2);
  openRingChoiceModal(rings, () => {
    showWinModal();
  });
}
