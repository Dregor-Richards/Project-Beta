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

    fastEnemies.push(candidate);
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

    mortarEnemies.push(candidate);
  }
}

function shouldSpawnHeart() {
  return levelNumber % 3 === 0;
}

function shouldSpawnChest() {
  return levelNumber % 2 === 0;   //6
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
  const blocked = new Set([avatarIndex, doorIndex, ...enemies]);
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
  const blocked = new Set([avatarIndex, doorIndex, heartIndex, ...enemies]);
  const candidates = [];

  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function shouldSpawnWand() {
  const wandChance = 1.00;  // 0.20%
  return Math.random() < wandChance;
}

function chooseWandSubtype() {
  const wandOptions = [
    { type: 'fire',      weight: 100 }, // 60%
    { type: 'ice',       weight: 0 }, // 30%
    { type: 'lightning', weight: 0 }, // 10%
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