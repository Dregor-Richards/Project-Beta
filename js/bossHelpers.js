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