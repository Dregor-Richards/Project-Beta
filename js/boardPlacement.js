function chooseDoorIndex() {
  const size = gridSize;
  const maxIndex = size * size;
  const rimIndices = [];

  for (let i = 1; i <= maxIndex; i++) {
    const row = Math.floor((i - 1) / size);
    const col = (i - 1) % size;

    const onTop = row === 0;
    const onBottom = row === size - 1;
    const onLeft = col === 0;
    const onRight = col === size - 1;

    if (onTop || onBottom || onLeft || onRight) {
      rimIndices.push(i);
    }
  }

  const blocked = new Set([avatarIndex, ...enemies]);
  const candidates = rimIndices.filter(i => !blocked.has(i));
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (enemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

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
    // if summon
    if (isWallTile(candidate)) continue;
    
    enemies.push(candidate);
  }
}

function placeFastEnemies(count) {
  fastEnemies = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (fastEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

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
    // if summon
    if (isWallTile(candidate)) continue;

    fastEnemies.push(candidate);
    fastEnemyPhases.push(randomInt(0, 2));
  }
}

function placeTrackerEnemies(count) {
  trackerEnemies = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (trackerEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

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
    // if summon
    if (isWallTile(candidate)) continue;

    trackerEnemies.push(candidate);
  }
}

function placeMortarEnemies(count) {
  mortarEnemies = [];
  if (count <= 0) return;

  const maxIndex = gridSize * gridSize;
  const unsafe = new Set(getUnsafeSpawnTilesNearPlayer());

  while (mortarEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

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
    // if summon
    if (isWallTile(candidate)) continue;

    mortarEnemies.push(candidate);
  }
}

function shouldSpawnHeart() {
  return levelNumber % 3 === 0;
}

function shouldSpawnChest() {
  return levelNumber % 6 === 0;     // % 6
}

let wallIndices = [];

function placeWallTiles(gridSize, wallPercent) {
  wallIndices = [];
  if (!wallPercent || wallPercent <= 0) return;

  const totalTiles = gridSize * gridSize;
  const wallTileCount = Math.round((totalTiles * wallPercent) / 100);

  const existingWandIndices = Array.isArray(wandsOnBoard)
    ? wandsOnBoard.map(w => w.index)
    : (wandIndex != null ? [wandIndex] : []);

  const blocked = new Set([
    avatarIndex,
    doorIndex,
    heartIndex,
    skipTileIndex,
    stoneIndex,
    chestIndex,
    lanternTile,
    brazierTile,
    mimicChestIndex,
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...existingWandIndices,
    ...pickupIndices,     // avoid any existing pickups (wands/stones)
  ]);

  const candidates = [];
  for (let i = 1; i <= totalTiles; i++) {
    if (!blocked.has(i)) {
      candidates.push(i);
    }
  }

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const count = Math.min(wallTileCount, candidates.length);
  for (let i = 0; i < count; i++) {
    wallIndices.push(candidates[i]);
  }
}

function getNeighbors(idx, size, maxIndex) {
  const neighbors = [];

  // up
  if (idx > size) neighbors.push(idx - size);
  // down
  if (idx <= maxIndex - size) neighbors.push(idx + size);
  // left
  if ((idx - 1) % size !== 0) neighbors.push(idx - 1);
  // right
  if (idx % size !== 0) neighbors.push(idx + 1);

  return neighbors;
}

// Check if door and all enemies are reachable from player given current walls
function isLevelReachable(size) {
  const maxIndex = size * size;

  const wallSet = new Set(wallIndices || []);

  const blocked = new Set([...wallSet]);

  const visited = new Set();
  const queue = [];

  // Start BFS from player
  if (blocked.has(avatarIndex)) {
    // Player spawned in a blocked tile? Should never happen, but guard anyway
    return false;
  }
  visited.add(avatarIndex);
  queue.push(avatarIndex);

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getNeighbors(current, size, maxIndex);

    for (const n of neighbors) {
      if (blocked.has(n)) continue;
      if (visited.has(n)) continue;
      visited.add(n);
      queue.push(n);
    }
  }

  // Door must be reachable
  if (doorIndex != null && !visited.has(doorIndex)) {
    return false;
  }

  // All core enemies must be reachable
  const allEnemyIndices = [
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    //...summonerEnemies, 
    //...beamerEnemies,
  ];

  for (const idx of allEnemyIndices) {
    if (!visited.has(idx)) {
      return false;
    }
  }

  return true;
}

function placeWallsWithConnectivity(gridSize, wallPercent) {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    placeWallTiles(gridSize, wallPercent);

    if (isLevelReachable(gridSize)) {
      return; // success
    }

    // If not reachable, clear walls and try again (optionally reduce density)
    wallIndices = [];
  }

  // If after maxAttempts it’s still bad, fall back to no walls for safety
  wallIndices = [];
}

function isWallTile(index) {
  return wallIndices && wallIndices.includes(index);
}

function chooseFreeIndex() {
  const maxIndex = gridSize * gridSize;

  const existingWandIndices = Array.isArray(wandsOnBoard)
    ? wandsOnBoard.map(w => w.index)
    : (wandIndex != null ? [wandIndex] : []);

  const blocked = new Set([
    avatarIndex,
    doorIndex,
    heartIndex,
    skipTileIndex,
    ...wallIndices,
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...existingWandIndices,
    ...pickupIndices, // avoid any existing pickups (wands/stones)
  ]);

  const candidates = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  const chosen = candidates[idx];
  pickupIndices.push(chosen); // mark this tile as used by a pickup
  return chosen;
}

function chooseHeartIndex() {
  const maxIndex = gridSize * gridSize;
  const blocked = new Set([avatarIndex, doorIndex, ...enemies, ...wallIndices]);
  const candidates = [];

  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function chooseSkipTileIndex() {
  const maxIndex = gridSize * gridSize;
  const blocked = new Set([avatarIndex, doorIndex, heartIndex, ...enemies, ...wallIndices]);
  const candidates = [];

  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function shouldSpawnWand() {
  const wandChance = 0.3;  // 0.30%, Comes out to roughly 51% of a wand being on a level at all, since checked twice
  return Math.random() < wandChance;
}

function chooseWandSubtype() {
  const wandOptions = [
    { type: 'fire',      weight: 60 }, // 60%
    { type: 'ice',       weight: 30 }, // 30%
    { type: 'lightning', weight: 10 }, // 10%
  ];
  return chooseWeightedRandom(wandOptions);
}

function chooseWandIndex() {
  const maxIndex = gridSize * gridSize;

  const existingWandIndices = Array.isArray(wandsOnBoard)
    ? wandsOnBoard.map(w => w.index)
    : (wandIndex != null ? [wandIndex] : []);

  const blocked = new Set([
    avatarIndex,
    doorIndex,
    heartIndex,
    skipTileIndex,
    ...wallIndices,
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...existingWandIndices,
    ...pickupIndices,            // <- NEW: avoid any existing pickups
  ]);

  const candidates = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  pickupIndices.push(candidates[idx]); // <- NEW: record for necklaces, etc.
  return candidates[idx];
}

function resetStoneState() {
  stoneIndex = null;
  stonePresent = false;
  stoneType = null;
}

function placeStoneForConfig(config) {
  resetStoneState();

  // If the config wants a guaranteed stone
  if (config.guaranteeStone) {
    const idx = chooseFreeIndex();
    if (idx !== null) {
      stoneIndex = idx;
      stonePresent = true;
      stoneType = Math.random() < 0.5 ? 'wyrd' : 'heart';
    }
    return;
  }

  // Otherwise, use the random 5% chance
  const stoneRoll = Math.random();
  if (stoneRoll < 0.05) {
    const idx = chooseFreeIndex();
    if (idx !== null) {
      stoneIndex = idx;
      stonePresent = true;
      stoneType = Math.random() < 0.5 ? 'wyrd' : 'heart';
    }
  }
}