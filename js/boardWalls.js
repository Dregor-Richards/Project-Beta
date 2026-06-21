let wallIndices = [];
let falseWallIndices = [];  // new: indices of false walls

function placeWallTiles(gridSize, wallPercent) {
  wallIndices = [];
  falseWallIndices = [];
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
    ...pickupIndices,
    ...safetyTiles,
  ]);

  const candidates = [];
  for (let i = 1; i <= totalTiles; i++) {
    if (!blocked.has(i)) {
      candidates.push(i);
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const count = Math.min(wallTileCount, candidates.length);

  // Spread false walls among real walls: 1 false per 10 real
  let realCount = 0;
  for (let i = 0; i < count; i++) {
    realCount++;
    if (realCount % 10 === 0 && fakeWallSlotsLeft(falseWallIndices.length, realCount, count)) {
      falseWallIndices.push(candidates[i]);
    } else {
      wallIndices.push(candidates[i]);
    }
  }
}

function fakeWallSlotsLeft(currentFalseCount, realCountSoFar, totalCount) {
  // This is a simple heuristic: if we could still fit more false walls, take this one.
  const targetFalse = Math.floor(realCountSoFar / 10);
  return currentFalseCount < targetFalse;
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
  // False walls are NOT in wallSet, so they don't block BFS
  const blocked = new Set([...wallSet]);

  const visited = new Set();
  const queue = [];

  if (blocked.has(avatarIndex)) {
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

  if (doorIndex != null && !visited.has(doorIndex)) {
    return false;
  }

  if (typeof lanternTile === 'number' && lanternTile >= 1) {
    if (!visited.has(lanternTile)) return false;
  }
  if (typeof brazierTile === 'number' && brazierTile >= 1) {
    if (!visited.has(brazierTile)) return false;
  }

  const allEnemyIndices = [
    ...enemies,
    ...fastEnemies,
    ...trackerEnemies,
    ...mortarEnemies,
    ...summonerEnemies,
  ];

  for (const idx of allEnemyIndices) {
    if (!visited.has(idx)) return false;
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

function isFalseWallTile(index) {
  return falseWallIndices && falseWallIndices.includes(index);
}

function removeWallAtIndex(index) {
  if (!wallIndices || wallIndices.length === 0) return;

  const pos = wallIndices.indexOf(index);
  if (pos === -1) return;

  wallIndices.splice(pos, 1);  // remove from walls list
  // After changing walls, just redraw the board
  redrawBoard();
}

function removeFalseWallAtIndex(index) {
  if (!falseWallIndices || falseWallIndices.length === 0) return;

  const pos = falseWallIndices.indexOf(index);
  if (pos === -1) return;

  falseWallIndices.splice(pos, 1);
  redrawBoard();
}