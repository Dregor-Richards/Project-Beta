function getUnsafeSpawnTilesNearPlayer() {
  const size = gridSize;
  const base = avatarIndex;        // 1-based
  const unsafe = [];

  // Above
  const above = base - size;
  if (above >= 1) unsafe.push(above);

  // Right
  const right = base + 1;
  if (base % size !== 0) unsafe.push(right);

  // Diagonal up-right
  const diag = above + 1;
  if (above >= 1 && base % size !== 0) unsafe.push(diag);

  return unsafe;
}

function placeNormalEnemies(count) {
  enemies = [];
  enemyIsSummoned = [];
  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (enemies.length < count) {
    const candidate = randomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (unsafe.has(candidate)) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (candidate === skipTileIndex) continue;
    if (candidate === wandIndex) continue;
    if (candidate === stoneIndex) continue;
    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;
    if (trackerEnemies.includes(candidate)) continue;
    if (mortarEnemies.includes(candidate)) continue;
    if (summonerEnemies.includes(candidate)) continue;
    if (isWallTile(candidate)) continue;
    
    enemies.push(candidate);
    enemyIsSummoned.push(false);
  }
}

function placeFastEnemies(count) {
  fastEnemies = [];
  fastEnemyIsSummoned = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (fastEnemies.length < count) {
    const candidate = randomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (unsafe.has(candidate)) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (candidate === skipTileIndex) continue;
    if (candidate === wandIndex) continue;
    if (candidate === stoneIndex) continue;
    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;
    if (trackerEnemies.includes(candidate)) continue;
    if (mortarEnemies.includes(candidate)) continue;
    if (summonerEnemies.includes(candidate)) continue;
    if (isWallTile(candidate)) continue;

    fastEnemies.push(candidate);
    fastEnemyPhases.push(randomInt(0, 2));
    fastEnemyIsSummoned.push(false);
  }
}

function placeTrackerEnemies(count) {
  trackerEnemies = [];
  trackerEnemyIsSummoned = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (trackerEnemies.length < count) {
    const candidate = randomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (unsafe.has(candidate)) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (candidate === skipTileIndex) continue;
    if (candidate === wandIndex) continue;
    if (candidate === stoneIndex) continue;
    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;
    if (trackerEnemies.includes(candidate)) continue;
    if (mortarEnemies.includes(candidate)) continue;
    if (summonerEnemies.includes(candidate)) continue;
    if (isWallTile(candidate)) continue;

    trackerEnemies.push(candidate);
    trackerEnemyIsSummoned.push(false);
  }
}

function placeMortarEnemies(count) {
  mortarEnemies = [];
  mortarEnemyIsSummoned = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (mortarEnemies.length < count) {
    const candidate = randomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (unsafe.has(candidate)) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (candidate === skipTileIndex) continue;
    if (candidate === wandIndex) continue;
    if (candidate === stoneIndex) continue;
    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;
    if (trackerEnemies.includes(candidate)) continue;
    if (mortarEnemies.includes(candidate)) continue;
    if (summonerEnemies.includes(candidate)) continue;
    if (isWallTile(candidate)) continue;

    mortarEnemies.push(candidate);
    mortarEnemyIsSummoned.push(false);
  }
}

function placeSummonerEnemies(count) {
  // Reset all Summoner-related state
  summonerEnemies = [];
  summonerStages = [];
  summonerFailStreaks = [];
  summonerMustCombo = [];

  // IMPORTANT: reset per-summoner child lists here, not with a single push
  summonerChildNormalIndices = [];
  summonerChildFastIndices = [];
  summonerChildTrackerIndices = [];
  summonerChildMortarIndices = [];

  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (summonerEnemies.length < count) {
    const candidate = randomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (unsafe.has(candidate)) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (candidate === skipTileIndex) continue;
    if (candidate === wandIndex) continue;
    if (candidate === stoneIndex) continue;
    if (isWallTile(candidate)) continue;

    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;
    if (trackerEnemies.includes(candidate)) continue;
    if (mortarEnemies.includes(candidate)) continue;
    if (summonerEnemies.includes(candidate)) continue;

    // Place this Summoner
    summonerEnemies.push(candidate);
    summonerStages.push(0);        // start at Normal
    summonerFailStreaks.push(0);   // no fails yet
    summonerMustCombo.push(false); // no combo queued yet

    // Create empty child lists for THIS summoner (index = summonerEnemies.length - 1)
    summonerChildNormalIndices.push([]);
    summonerChildFastIndices.push([]);
    summonerChildTrackerIndices.push([]);
    summonerChildMortarIndices.push([]);
  }
}