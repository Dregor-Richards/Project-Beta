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

  // Wands on board (any subtype)
  if (Array.isArray(wandsOnBoard)) {
    wandsOnBoard.forEach(w => {
      const wandCell = findCellByIndex(cells, w.index);
      if (!wandCell) return;

      const wand = document.createElement('div');
      if (w.subtype === 'ice') {
        wand.className = 'ice-wand';
      } else if (w.subtype === 'fire') {
        wand.className = 'fire-wand';
      } else if (w.subtype === 'lightning') {
        wand.className = 'lightning-wand';
      }
      wandCell.appendChild(wand);
    });
  }

  // Stone on board (Wyrd or Heart)
  if (stonePresent && stoneIndex != null && stoneType) {
    const stoneCell = findCellByIndex(cells, stoneIndex);
    if (stoneCell) {
      const stone = document.createElement('div');
      if (stoneType === 'wyrd') {
        stone.className = 'wyrd-stone';
      } else if (stoneType === 'heart') {
        stone.className = 'heart-stone';
      }
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

  if (isDarkLevel && lanternTile && !lanternCollected) {
    const cell = findCellByIndex(cells, lanternTile);
    if (cell) {
      const lantern = document.createElement('div');
      lantern.className = 'lantern-tile';
      cell.appendChild(lantern);
    }
  }

  if (isDarkLevel && brazierTile) {
    const cell = findCellByIndex(cells, brazierTile);
    if (cell) {
      const brazier = document.createElement('div');
      brazier.className = brazierLit ? 'brazier-tile-lit' : 'brazier-tile';
      cell.appendChild(brazier);
    }
  } else if (brazierTile) {
    // Even after darkness is cleared we still want the lit brazier sprite
    const cell = findCellByIndex(cells, brazierTile);
    if (cell) {
      const brazier = document.createElement('div');
      brazier.className = brazierLit ? 'brazier-tile-lit' : 'brazier-tile';
      cell.appendChild(brazier);
    }
  }

  // === Difficulty (for mortars and boss) ===
  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  const difficulty =
    storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;

  // mortar target tiles

  let targetsToDraw = mortarTargets;

  if (difficulty === 10) {
    targetsToDraw = [...mortarTargets, ...bossMortarTargets];
  }

  targetsToDraw.forEach(idx => {
    const cell = findCellByIndex(cells, idx);
    if (!cell) return;

    const mark = document.createElement('div');
    const variantClass =
      Math.random() < 0.5 ? 'mortar-target-a' : 'mortar-target-b';
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

  // === Boss (difficulty 10) ===
  if (difficulty === 10 && typeof bossIndex === 'number' && bossHealth > 0) {
    const bossCell = findCellByIndex(cells, bossIndex + 1);
    if (bossCell) {
      const boss = document.createElement('div');
      boss.className = 'boss-enemy';
      bossCell.appendChild(boss);
    }
  }

  if (isDarkLevel && fullDarkActive) {
    const maxIndex = gridSize * gridSize;
    for (let i = 1; i <= maxIndex; i++) {
      const cell = findCellByIndex(cells, i);
      if (!cell) continue;
      cell.classList.remove('dark-full', 'dark-shadow');

      if (litTiles.has(i)) {
        // no darkness
      } else if (shadowTiles.has(i)) {
        cell.classList.add('dark-shadow');
      } else {
        cell.classList.add('dark-full');
      }
    }
  } else {
    cells.forEach(c => c.classList.remove('dark-full', 'dark-shadow'));
  }

  refreshEnemyRoster();
}


function spawnParticlesAtCell(index, kind = 'hit', countOverride) {
  const grid = document.getElementById('level-grid');
  if (!grid) return;

  const cells = getAllCells();
  const cell = findCellByIndex(cells, index);
  if (!cell) return;

  // Ensure particle-layer lives inside the grid
  let layer = grid.querySelector('.particle-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'particle-layer';
    grid.appendChild(layer);
  }

  // Derive grid size and tile coordinates from index (1-based)
  const totalCells = cells.length;
  const size = Math.sqrt(totalCells);      // assumes square grid
  const zeroBased = index - 1;
  const row = Math.floor(zeroBased / size);
  const col = zeroBased % size;

  // Center of that tile in grid space (percent)
  const tileWidthPct = 100 / size;
  const tileHeightPct = 100 / size;

  const centerXPct = (col + 0.5) * tileWidthPct;
  const centerYPct = (row + 0.5) * tileHeightPct;

  let baseCount = 6;
  if (kind === 'kill') baseCount = 10;
  if (kind === 'pickup') baseCount = 8;
  if (kind === 'door') baseCount = 14;

  const particleCount = countOverride ?? baseCount;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = `particle particle--${kind}`;

    const angle = Math.random() * Math.PI * 2;
    const distance =
      kind === 'door'
        ? 26 + Math.random() * 10
        : 16 + Math.random() * 8;

    const px = Math.cos(angle) * distance;
    const py = Math.sin(angle) * distance;

    // Place particle at tile center in grid coordinate space
    p.style.left = `${centerXPct}%`;
    p.style.top = `${centerYPct}%`;
    p.style.setProperty('--px', `${px}px`);
    p.style.setProperty('--py', `${py}px`);

    p.addEventListener('animationend', () => {
      p.remove();
    });

    layer.appendChild(p);
  }
}