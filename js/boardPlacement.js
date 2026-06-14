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
  enemyIsSummoned = [];
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
    const candidate = getRandomInt(1, maxIndex);

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

  // Spawn safety tiles: player spawn + three immediate neighbors
  const safetyTiles = new Set();
  if (typeof avatarIndex === 'number') {
    const spawn = avatarIndex;
    safetyTiles.add(spawn);

    const right = spawn + 1;
    const up = spawn - gridSize;
    const upRight = spawn - gridSize + 1;

    // Bounds checks so we don’t accidentally add off-board indices on small grids
    if (right <= totalTiles && spawn % gridSize !== 0) {
      safetyTiles.add(right);
    }
    if (up > 0) {
      safetyTiles.add(up);
    }
    if (up > 0 && spawn % gridSize !== 0) {
      safetyTiles.add(upRight);
    }
  }

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
    ...summonerEnemies,
    ...existingWandIndices,
    ...pickupIndices,   // avoid any existing pickups (wands/stones)
    ...safetyTiles,     // protect tiles around spawn
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

  // Lantern / brazier must be reachable if they exist
  if (typeof lanternTile === 'number' && lanternTile >= 1) {
    if (!visited.has(lanternTile)) {
      return false;
    }
  }
  if (typeof brazierTile === 'number' && brazierTile >= 1) {
    if (!visited.has(brazierTile)) {
      return false;
    }
  }

  // All core enemies must be reachable
  const allEnemyIndices = [
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...summonerEnemies,
    // ...beamerEnemies,
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
  let currentPercent = wallPercent;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    placeWallTiles(gridSize, currentPercent);

    if (isLevelReachable(gridSize)) {
      return; // success
    }

    // If not reachable, clear walls and try again with fewer walls
    wallIndices = [];

    // Reduce density by 20% of original each attempt (tune as needed)
    currentPercent = Math.max(5, Math.floor(currentPercent * 0.7));
  }

  // If after maxAttempts it’s still bad, keep no walls for safety
  wallIndices = [];
}

function isWallTile(index) {
  return wallIndices && wallIndices.includes(index);
}

function removeWallAtIndex(index) {
  if (!wallIndices || wallIndices.length === 0) return;

  const pos = wallIndices.indexOf(index);
  if (pos === -1) return;

  wallIndices.splice(pos, 1);  // remove from walls list
  // After changing walls, just redraw the board
  redrawBoard();
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
    ...summonerEnemies,
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

const WAND_TIERS = {
  0: [
    { type: 'ice',       weight: 60 }, // guaranteed/pre-boss pool
    { type: 'lightning', weight: 40 },
  ],
  1: [
    { type: 'fire',      weight: 60 },
    { type: 'ice',       weight: 30 },
    { type: 'lightning', weight: 10 },
  ],
  2: [
    { type: 'wallbreak', weight: 100 },
  ],
};

function chooseWandFromTier(tierId) {
  const tier = WAND_TIERS[tierId];
  if (!tier || tier.length === 0) {
    return null;
  }
  // Weighted pick
  let totalWeight = 0;
  for (const item of tier) {
    totalWeight += item.weight;
  }
  let roll = Math.random() * totalWeight;
  for (const item of tier) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.type;
    }
  }
  return tier[tier.length - 1].type; // fallback
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
    ...summonerEnemies,
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