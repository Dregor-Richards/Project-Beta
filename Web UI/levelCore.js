// --- Menu confirm ---

function showMenuConfirm() {
  const menuModal = document.getElementById('menu-modal');
  menuModal.classList.remove('hidden');
}

// --- Grid + game state ---

let gridSize = 3;
let avatarIndex = 1;
let enemies = [];  // Red Square
let fastEnemies = [];  // Red Octo
let doorIndex = null;
let playerTurn = true;
let movesThisTurn = 0;
let playerDead = false;
let lives = 3;
let score = 0;
let heartIndex = null;
let levelNumber = 1;
let skipTileIndex = null;
let skipNextTurn = false;

// --- Just for Hitting Enter ---
let winOpen = false;
let deathOpen = false;
let uiInputLocked = false;

// --- Inventory ---
// Inventory: 21 slots (3 x 7)
let inventory = new Array(21).fill(null);
let frozenEnemyTiles = new Set();
let wandIndex = null;          // tile index for whatever wand is on the map
let currentWandSubtype = null;
let stoneIndex = null;          // tile index for Wyrd Stone
let stonePresent = false;
let currentStoneSubtype = null;
let armedItem = null;          // { type: 'wand', subtype: 'ice'|'fire'|'lightning', slotIndex }
let hasDoubleMove = false;
let hasTripleEnemyTurns = false;

function getAllCells() {
  return document.querySelectorAll('.grid-cell');
}

function findCellByIndex(cells, index) {
  return Array.from(cells).find(c => Number(c.dataset.index) === index) || null;
}

function intDiv(a, b) {
  return Math.floor(a / b);
}

function buildGrid(size) {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';

  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  const cellCount = size * size;
  for (let i = 1; i <= cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = i;
    grid.appendChild(cell);
  }
}

function redrawBoard() {
  const cells = getAllCells();
  cells.forEach(c => (c.innerHTML = ''));

  // door
  if (doorIndex != null) {
    const doorCell = findCellByIndex(cells, doorIndex);
    if (doorCell) {
      const door = document.createElement('div');
      door.className = 'door';
      doorCell.appendChild(door);
    }
  }

  // skip-turn tile
  if (skipTileIndex != null) {
    const skipCell = findCellByIndex(cells, skipTileIndex);
    if (skipCell) {
      const skipDiv = document.createElement('div');
      skipDiv.className = 'skip-tile';
      skipCell.appendChild(skipDiv);
    }
  }

// Wand on board (any subtype)
if (wandIndex != null && currentWandSubtype) {
  const wandCell = findCellByIndex(cells, wandIndex);
  if (wandCell) {
    const wand = document.createElement('div');
    if (currentWandSubtype === 'ice') {
      wand.className = 'ice-wand';        // CSS = thin blue diagonal
    } else if (currentWandSubtype === 'fire') {
      wand.className = 'fire-wand';       // thin red opposite diagonal
    } else if (currentWandSubtype === 'lightning') {
      wand.className = 'lightning-wand';  // thin yellow vertical
    }
    wandCell.appendChild(wand);
  }
}

  if (stonePresent && stoneIndex != null) {
    const stoneCell = findCellByIndex(cells, stoneIndex);
    if (stoneCell) {
      const stone = document.createElement('div');
      stone.className = 'wyrd-stone';
      stoneCell.appendChild(stone);
    }
  }

  // player
  const playerCell = findCellByIndex(cells, avatarIndex);
  if (playerCell && !playerDead) {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    playerCell.appendChild(avatar);
  }

    // enemies (normal red squares)
    enemies.forEach(idx => {
    const cell = findCellByIndex(cells, idx);
    if (!cell) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    cell.appendChild(enemy);
    });

    // fast enemies (red octagons)
    fastEnemies.forEach(idx => {
    const cell = findCellByIndex(cells, idx);
    if (!cell) return;
    const enemy = document.createElement('div');
    enemy.className = 'fast-enemy';
    cell.appendChild(enemy);
    });

  // heart
  if (heartIndex != null) {
    const heartCell = findCellByIndex(cells, heartIndex);
    if (heartCell) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heartCell.appendChild(heart);
    }
  }
}


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
    const onRight = col === 1 * size - 1;

    if (onTop || onBottom || onLeft || onRight) {
      rimIndices.push(i);
    }
  }

  const blocked = new Set([avatarIndex, ...enemies]);
  const candidates = rimIndices.filter(i => !blocked.has(i));

  if (candidates.length === 0) {
    return null;
  }

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeEnemies(enemyCount) {
  enemies = [];
  const maxIndex = gridSize * gridSize;

  while (enemies.length < enemyCount) {
    const candidate = getRandomInt(1, maxIndex);

    if (candidate === avatarIndex) continue;
    if (enemies.includes(candidate)) continue;

    enemies.push(candidate);
  }
}

function placeFastEnemies() {
  fastEnemies = [];

  if (gridSize < 5) return;  // only spawn on 5x5+ boards

  const maxIndex = gridSize * gridSize;
  const targetCount = Math.floor(gridSize / 5); // size / 5

  while (fastEnemies.length < targetCount) {
    const candidate = getRandomInt(1, maxIndex);

    // avoid overlapping player, door, heart, normal enemies, or existing fast enemies
    if (candidate === avatarIndex) continue;
    if (candidate === doorIndex) continue;
    if (candidate === heartIndex) continue;
    if (enemies.includes(candidate)) continue;
    if (fastEnemies.includes(candidate)) continue;

    fastEnemies.push(candidate);
  }
}

function shouldSpawnHeart() {
  return levelNumber % 4 === 0;
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

function chooseWandIndex() {
  const maxIndex = gridSize * gridSize;
  const blocked = new Set([
    avatarIndex,
    doorIndex,
    heartIndex,
    skipTileIndex,
    ...enemies,
    ...fastEnemies
  ]);
  const candidates = [];
  for (let i = 1; i <= maxIndex; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) return null;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

function pickWandSubtype() {
  const r = Math.random(); // 0..1
  // 0.0–0.39  => fire (40%)
  // 0.40–0.69 => ice (30%)
  // 0.70–0.99 => lightning (30%)
  if (r < 0.4) return 'fire';
  if (r < 0.7) return 'ice';
  return 'lightning';
}

function pickupWand(subtype) {
  // Look for stack with same subtype and count < 3
  const existingIndex = inventory.findIndex(
    item =>
      item &&
      item.type === 'wand' &&
      item.subtype === subtype &&
      item.count < 3
  );

  if (existingIndex !== -1) {
    inventory[existingIndex].count += 1;
  } else {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: 'wand', subtype: subtype, count: 1 };
    }
    // if inventory full, we silently drop it as before
  }

  renderInventory();
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}

function pickupStone() {
  const existingIndex = inventory.findIndex(
    item => item && item.type === 'wyrd_stone' && item.count < 3
  );

  if (existingIndex !== -1) {
    inventory[existingIndex].count += 1;
  } else {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: 'wyrd_stone', count: 1 };
    }
  }

  renderInventory();
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory() {
  const slots = document.querySelectorAll('.inventory-slot');
  slots.forEach((slot, index) => {
    slot.innerHTML = '';

    const item = inventory[index];
    if (!item) return;

    if (item.type === 'wand') {
      const icon = document.createElement('div');
      if (item.subtype === 'ice') {
        icon.className = 'inventory-ice-wand';
      } else if (item.subtype === 'fire') {
        icon.className = 'inventory-fire-wand';
      } else if (item.subtype === 'lightning') {
        icon.className = 'inventory-lightning-wand';
      }
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);

    } else if (item.type === 'wyrd_stone') {
      const icon = document.createElement('div');
      icon.className = 'inventory-wyrd-stone';
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);
    }
  });
}

function randomDirection() {
  const dirs = ['up', 'down', 'left', 'right'];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function flashDamage() {
  const overlay = document.getElementById('damage-flash');
  if (!overlay) return;

  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
  }, 150);
}

const ENEMY_STEP_DELAY_MS = 75; // tweak for faster/slower animations

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveAllEnemies() {
  if (playerDead) return;

  const size = gridSize;
  const maxIndex = size * size;

  // --- 1. Normal enemies (one step) ---
  for (let i = 0; i < enemies.length; i++) {
    let idx = enemies[i];

    if (frozenEnemyTiles.has(idx)) {
    continue;
    }

    let moved = false;
    for (let attempts = 0; attempts < 10 && !moved; attempts++) {
      const dir = randomDirection();
      let next = idx;

      if (dir === 'up') {
        if (idx > size) next = idx - size;
      } else if (dir === 'down') {
        if (idx <= maxIndex - size) next = idx + size;
      } else if (dir === 'left') {
        if ((idx - 1) % size !== 0) next = idx - 1;
      } else if (dir === 'right') {
        if (idx % size !== 0) next = idx + 1;
      }

      if (next === idx) continue;

      // Hit player
      if (next === avatarIndex) {
        lives = Math.max(0, lives - 1);
        sessionStorage.setItem('playerLives', String(lives));
        redrawLives();
        flashDamage();

        if (lives === 0) {
          playerDead = true;
          enemies[i] = next;
          redrawBoard();
          await sleep(200);
          showDeathModal();
          return;
        }

        moved = true;
        next = idx;
        break;
      }

      const occupiedByOther =
        enemies.some((e, j) => j !== i && e === next) ||
        fastEnemies.includes(next);
      if (occupiedByOther) continue;

      enemies[i] = next;
      moved = true;

      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);
    }
  }

  // --- 2. Fast enemies (1–3 steps each) ---
  for (let i = 0; i < fastEnemies.length; i++) {
    let idx = fastEnemies[i];

    if (frozenEnemyTiles.has(idx)) {
      continue; // this fast enemy is frozen permanently
    }

    const stepsThisTurn = getRandomInt(1, 3);
    for (let step = 0; step < stepsThisTurn; step++) {
      if (playerDead) return;

      let moved = false;
      for (let attempts = 0; attempts < 10 && !moved; attempts++) {
        const dir = randomDirection();
        let next = idx;

        if (dir === 'up') {
          if (idx > size) next = idx - size;
        } else if (dir === 'down') {
          if (idx <= maxIndex - size) next = idx + size;
        } else if (dir === 'left') {
          if ((idx - 1) % size !== 0) next = idx - 1;
        } else if (dir === 'right') {
          if (idx % size !== 0) next = idx + 1;
        }

        if (next === idx) continue;

        // Hit player: deal damage, but DON'T move into their tile
        if (next === avatarIndex) {
          lives = Math.max(0, lives - 1);
          sessionStorage.setItem('playerLives', String(lives));
          redrawLives();
          flashDamage();

          if (lives === 0) {
            playerDead = true;
            redrawBoard(); // player disappears
            await sleep(200);
            showDeathModal();
            return;
          }

          // End this enemy's movement for this turn
          moved = true;
          // idx stays the same (enemy does not enter player tile)
          step = stepsThisTurn; // break outer loop for this enemy
          break;
        }

        const occupiedByOther =
          enemies.includes(next) ||
          fastEnemies.some((e, j) => j !== i && e === next);
        if (occupiedByOther) continue;

        idx = next;
        fastEnemies[i] = idx;
        moved = true;

        redrawBoard();
        await sleep(ENEMY_STEP_DELAY_MS);
      }

      if (!moved) {
        // Can't move further this turn
        break;
      }
    }
  }

  redrawBoard();
}

async function endPlayerTurn() {
  playerTurn = false;

  // Base 1 enemy phase
  await moveAllEnemies();

  // If Wyrd Stone active, add 2 more enemy phases (each can still use Lightning)
  if (hasTripleEnemyTurns && !playerDead && !allEnemiesDead()) {
    for (let i = 0; i < 2; i++) {
      await moveAllEnemies();
      if (allowLightning && hasDoubleMove && !playerDead && !allEnemiesDead()) {
        await moveAllEnemies();
      }
      if (playerDead || allEnemiesDead()) break;
    }
  }

  movesThisTurn = 0;
  playerTurn = true;
}

function allEnemiesDead() {
  return enemies.length === 0 && fastEnemies.length === 0;
}

function checkForWin() {
  if (allEnemiesDead() && avatarIndex === doorIndex && !playerDead) {
    addScore(3);
    showWinModal();
  }
}

function redrawLives() {
  const dots = document.querySelectorAll('.life-dot');
  dots.forEach((dot, index) => {
    dot.style.opacity = index < lives ? '1' : '0.2';
  });
}

function redrawScore() {
  const el = document.getElementById('score-text');
  if (el) {
    el.textContent = 'Score = ' + score;
  }
}

function addScore(points) {
  score += points;
  sessionStorage.setItem('playerScore', String(score));
  redrawScore();
}

function findFirstEmptySlot() {
  return inventory.findIndex(item => item === null);
}

// --- DOM ready: core setup ---

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  gridSize = Number(params.get('size')) || 3;
  gridSize = Math.max(2, Math.min(20, gridSize));

  const storedLevel = sessionStorage.getItem('currentLevel');
  levelNumber = storedLevel !== null ? Number(storedLevel) || 1 : 1;

  const storedLives = sessionStorage.getItem('playerLives');
  lives = storedLives !== null ? Number(storedLives) || 3 : 3;

  const storedScore = sessionStorage.getItem('playerScore');
  score = storedScore !== null ? Number(storedScore) || 0 : 0;

  const storedInventory = sessionStorage.getItem('inventory');
  if (storedInventory) {
    try {
      const parsed = JSON.parse(storedInventory);
      if (Array.isArray(parsed) && parsed.length === 21) {
        inventory = parsed;
      }
    } catch (e) {
      // if malformed, keep default empty inventory
    }
  }

  renderInventory();

  const enemyCount = Math.max(1, intDiv(gridSize, 3));

  avatarIndex = gridSize * gridSize - gridSize + 1;

  placeEnemies(enemyCount);
  doorIndex = chooseDoorIndex();

  if (shouldSpawnHeart()) {
    heartIndex = chooseHeartIndex();
  } else {
    heartIndex = null;
  }

  skipTileIndex = chooseSkipTileIndex();

  placeFastEnemies();

  wandIndex = null;
  currentWandSubtype = null;

  stoneIndex = null;
  stonePresent = false;
  hasTripleEnemyTurns = false;

  if (levelNumber >= 2 && levelNumber % 2 === 0) {
    const roll = Math.random();  // 60% chance for any wand
    if (roll < 0.6) {
      const idx = chooseWandIndex();
      if (idx !== null) {
        wandIndex = idx;
        currentWandSubtype = pickWandSubtype();
      }
    }
  }

  // Independent 5% Wyrd Stone spawn on ANY level
  const wyrdRoll = Math.random();
  if (wyrdRoll < 0.05) {
    const idx = chooseFreeIndex();
    if (idx !== null) {
      stoneIndex = idx;
      stonePresent = true;
    }
  }

  buildGrid(gridSize);
  redrawBoard();
  redrawLives();
  redrawScore();
});
