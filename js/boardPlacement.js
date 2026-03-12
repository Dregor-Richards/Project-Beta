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

function placeNormalEnemies(count) {
  enemies = [];
  const maxIndex = gridSize * gridSize;

  while (enemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
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

  while (fastEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
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

  while (trackerEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
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

  while (mortarEnemies.length < count) {
    const candidate = getRandomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
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

function chooseFreeIndex() {
  const maxIndex = gridSize * gridSize;
  const blocked = new Set([
    avatarIndex,
    doorIndex,
    heartIndex,
    skipTileIndex,
    ...enemies,
    ...fastEnemies,
    wandIndex,
    stoneIndex
  ]);

  const candidates = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
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
  const wandChance = 0.3;  // 0.30%
  return Math.random() < wandChance;
}

function chooseWandSubtype() {
  const wandOptions = [
    { type: 'fire',      weight: 50 }, // 50%
    { type: 'ice',       weight: 30 }, // 30%
    { type: 'lightning', weight: 20 }, // 20%
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
    ...existingWandIndices
  ]);

  const candidates = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}
