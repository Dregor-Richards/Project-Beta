function intDiv(a, b) {
  return Math.floor(a / b);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadLevelNumber() {
  const raw = sessionStorage.getItem('currentLevel');
  levelNumber = raw !== null ? Number(raw) || 1 : 1;
}

function resetLevelNumber() {
  levelNumber = 1;
  sessionStorage.setItem('currentLevel', '1');
}

function advanceLevel() {
  levelNumber += 1;
  sessionStorage.setItem('currentLevel', String(levelNumber));
}

function resetLevelState() {
  // Board / positions
  avatarIndex = 1;
  doorIndex = null;
  heartIndex = null;
  skipTileIndex = null;
  pickupIndices = [];
  wandIndex = null;
  stoneIndex = null;
  stonePresent = false;
  stoneType = null;
  chestIndex = null;
  chestOpened = false;

  // Enemies
  enemies = [];
  fastEnemies = [];
  trackerEnemies = [];
  mortarEnemies = [];
  trackerTurnParity = 0;
  mortarTargets = [];
  mortarJustTargeted = false;
  mortarFireCount = 0;

  // Per-level effects
  frozenEnemyTiles = new Set();
  blockedMortarTiles = new Set();
  extraMoves = 0;
  hasTripleEnemyTurns = false;
  heartStoneActive = false;

  // Turn/flow flags
  playerTurn = true;
  movesThisTurn = 0;
  playerDead = false;
  canPlayerMove = true;
  uiInputLocked = false;

  // Modals for this level
  winOpen = false;
  deathOpen = false;
}

window.loadLevelNumber = loadLevelNumber;
window.resetLevelNumber = resetLevelNumber;
window.advanceLevel = advanceLevel;
window.resetLevelState = resetLevelState;

function getSelectedAvatarIndex() {
  const raw = sessionStorage.getItem('selectedAvatarIndex');
  if (raw === null) {
    return selectedAvatarIndex || 0;
  }
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : 0;
}

function setSelectedAvatarIndex(idx) {
  selectedAvatarIndex = idx;
  sessionStorage.setItem('selectedAvatarIndex', String(idx));
}

function chooseWeightedRandom(options) {
  // options: [{ type: 'fire', weight: 50 }, ...]
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let r = Math.random() * totalWeight;

  for (const opt of options) {
    if (r < opt.weight) {
      return opt.type;
    }
    r -= opt.weight;
  }
  return options[options.length - 1].type; // fallback
}

function getNeighborIndices(centerIndex, size) {
  const indices = [];
  const row = Math.floor((centerIndex - 1) / size);
  const col = (centerIndex - 1) % size;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;

      const idx = nr * size + nc + 1; // back to 1-based
      // If you have a “void” tiles structure, skip them here:
      // if (voidTiles.has(idx)) continue;
      indices.push(idx);
    }
  }

  return indices;
}

function isBlockedBossTile(tileIndex) {
  if (gridSize !== BOSS_GRID_SIZE) return false; // only matters on boss level
  // BOSS_MISSING_TILES is 0-based, board is 1-based
  const missingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));
  return missingSet.has(tileIndex);
}

function addItemToInventory(item) {
  if (!Array.isArray(inventory)) return;
  const emptyIndex = inventory.findIndex(slot => slot === null);
  if (emptyIndex === -1) {
    // Inventory full; optional: show a “Inventory full” modal instead
    // or drop the item on the ground.
    return;
  }
  inventory[emptyIndex] = item;
  // Persist and redraw
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
  renderInventory();
}