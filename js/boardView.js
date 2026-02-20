function getAllCells() {
  return document.querySelectorAll('.grid-cell');
}

function findCellByIndex(cells, index) {
  return Array.from(cells).find(c => Number(c.dataset.index) === index) || null;
}

function buildGrid(size) {
  const grid = document.getElementById('level-grid');
  if (!grid) return;

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
  cells.forEach(c => {
    c.innerHTML = '';
  });

  frozenEnemyTiles.forEach(index => {
    const frozenCell = findCellByIndex(cells, index);
    if (frozenCell) {
      const overlay = document.createElement('div');
      overlay.className = 'frozen-overlay';
      frozenCell.appendChild(overlay);
    }
  });

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
        wand.className = 'ice-wand';
      } else if (currentWandSubtype === 'fire') {
        wand.className = 'fire-wand';
      } else if (currentWandSubtype === 'lightning') {
        wand.className = 'lightning-wand';
      }
      wandCell.appendChild(wand);
    }
  }

  // Wyrd Stone
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

  // tracker enemies (red arrows)
  trackerEnemies.forEach(idx => {
    const cell = findCellByIndex(cells, idx);
    if (!cell) return;
    const enemy = document.createElement('div');
    enemy.className = 'tracker-enemy';
    cell.appendChild(enemy);
  });

  // mortar enemies (Square frame with small square inside)
  mortarEnemies.forEach(idx => {
    const cell = findCellByIndex(cells, idx);
    if (!cell) return;
    const enemy = document.createElement('div');
    enemy.className = 'mortar-enemy';
    cell.appendChild(enemy);
  });

  // mortar target tiles (red skip-tile style)
mortarTargets.forEach(idx => {
  const cell = findCellByIndex(cells, idx);
  if (!cell) return;

  const mark = document.createElement('div');

  // 50/50 pick between A and B
  const variantClass = Math.random() < 0.5 ? 'mortar-target-a' : 'mortar-target-b';
  mark.className = variantClass;

  cell.appendChild(mark);
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

function spawnParticlesAtCell(index, kind = 'hit', countOverride) {
  const gameWrapper = document.getElementById('game-wrapper');
  if (!gameWrapper) return;

  const cell = document.querySelector(`.grid-cell[data-index="${index}"]`);
  if (!cell) return;

  // Make sure we have or create a particle layer
  let layer = gameWrapper.querySelector('.particle-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'particle-layer';
    gameWrapper.appendChild(layer);
  }

  const rect = cell.getBoundingClientRect();
  const wrapperRect = gameWrapper.getBoundingClientRect();

  // Center in the cell, relative to wrapper
  const centerX = rect.left - wrapperRect.left + rect.width / 2;
  const centerY = rect.top - wrapperRect.top + rect.height / 2;

  // Different “weights” per kind
  let baseCount = 6;
  if (kind === 'kill') baseCount = 10;
  if (kind === 'pickup') baseCount = 8;
  if (kind === 'door') baseCount = 14;

  const particleCount = countOverride ?? baseCount;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = `particle particle--${kind}`;

    // Random direction and distance (softer overall)
    const angle = Math.random() * Math.PI * 2;
    const distance =
      kind === 'door'
        ? 26 + Math.random() * 10
        : 16 + Math.random() * 8; // hits/pickups smaller

    const px = Math.cos(angle) * distance;
    const py = Math.sin(angle) * distance;

    p.style.left = `${centerX}px`;
    p.style.top = `${centerY}px`;
    p.style.setProperty('--px', `${px}px`);
    p.style.setProperty('--py', `${py}px`);

    // Remove when animation ends
    p.addEventListener('animationend', () => {
      p.remove();
    });

    layer.appendChild(p);
  }
}