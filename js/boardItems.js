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

function shouldSpawnHeart() {
  return levelNumber % 3 === 0;
}

function shouldSpawnChest() {
  return levelNumber % 6 === 0;     // % 6
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