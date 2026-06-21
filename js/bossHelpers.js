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

function isTileOccupiedByEnemy(tileIndex) {
  return enemies.includes(tileIndex) ||
         fastEnemies.includes(tileIndex) ||
         trackerEnemies.includes(tileIndex) ||
         mortarEnemies.includes(tileIndex);
}

function getBossMissingSet(missingTiles) {
  return new Set(missingTiles.map(idx => idx + 1));
}

function markBossMissingTiles(cells, missingTiles) {
  missingTiles.forEach((idx) => {
    const cell = cells[idx];
    if (!cell) return;
    cell.classList.add('boss-hole');
  });
}

function getAllValidBossTiles(gridSize, missingTiles) {
  const maxIndex = gridSize * gridSize;
  const missingSet = getBossMissingSet(missingTiles);
  const valid = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!missingSet.has(i)) valid.push(i);
  }
  return valid;
}

function resetCommonBossState() {
  enemies = [];
  fastEnemies = [];
  trackerEnemies = [];
  mortarEnemies = [];
  mortarTargets = [];
  mortarJustTargeted = false;
  mortarFireCount = 0;
  frozenEnemyTiles = new Set();
  blockedMortarTiles = new Set();
  doorIndex = null;
  heartIndex = null;
  skipTileIndex = null;
  wandIndex = null;
  currentWandSubtype = null;
  stoneIndex = null;
  stonePresent = false;
  stoneType = null;
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

// If a boss is ever immune to freeze, or is handled differently, may need to relocate
function isBossFrozen() {
  if (bossIndex == null) return false;
  const bossTileIndex = bossIndex + 1; // 1-based
  return frozenEnemyTiles.has(bossTileIndex);
}

async function resolveBossMortarHitsShared(targetsArray) {
  if (!Array.isArray(targetsArray) || targetsArray.length === 0) return;

  if (isBossFrozen()) {
    targetsArray.length = 0;
    return;
  }

  const hits = targetsArray.slice();
  targetsArray.length = 0;

  for (const idx of hits) {
    if (idx === avatarIndex && !playerDead) {
      const died = await applyPlayerHit(1);
      if (died) return;
    }
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

  const rings = getRandomRings(2);
  openRingChoiceModal(rings, () => {
    showWinModal();
  });
}