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

  // === Difficulty (for mortars and boss) ===
  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  const difficulty =
    storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;

  // mortar target tiles (red skip-tile style)
  const targetsToDraw =
    difficulty === 10 ? bossMortarTargets : mortarTargets;

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

function clampCameraToGrid() {
  const viewport = document.querySelector('.level-viewport');
  const grid = document.getElementById('level-grid');
  if (!viewport || !grid) return;

  const viewportRect = viewport.getBoundingClientRect();
  const viewportWidth = viewportRect.width;
  const viewportHeight = viewportRect.height;

  const nativeGridWidth = grid.offsetWidth;
  const nativeGridHeight = grid.offsetHeight;

  const scaledGridWidth = nativeGridWidth * cameraZoom;
  const scaledGridHeight = nativeGridHeight * cameraZoom;

  // How much extra "void" we allow around the grid (0.5 = up to half a grid offscreen)
  const overscrollFactor = 0.5;

  // Offsets = grid top-left relative to viewport top-left
  const minOffsetX = viewportWidth - scaledGridWidth - scaledGridWidth * overscrollFactor;
  const maxOffsetX = scaledGridWidth * overscrollFactor;

  const minOffsetY = viewportHeight - scaledGridHeight - scaledGridHeight * overscrollFactor;
  const maxOffsetY = scaledGridHeight * overscrollFactor;

  cameraOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, cameraOffsetX));
  cameraOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, cameraOffsetY));
}


function applyCameraTransform() {
  const wrapper = document.querySelector('.level-grid-wrapper');
  if (!wrapper) return;
  wrapper.style.transform =
    `translate(${cameraOffsetX}px, ${cameraOffsetY}px) scale(${cameraZoom})`;
}

function centerCameraOnPlayer() {
  const viewport = document.querySelector('.level-viewport');
  const grid = document.getElementById('level-grid');
  if (!viewport || !grid) return;

  const cells = getAllCells();
  const playerCell = findCellByIndex(cells, avatarIndex);
  if (!playerCell) return;

  const viewportRect = viewport.getBoundingClientRect();
  const gridRect = grid.getBoundingClientRect();
  const cellRect = playerCell.getBoundingClientRect();

  // Player center in *grid* coordinates
  const playerCenterX = (cellRect.left - gridRect.left) + cellRect.width / 2;
  const playerCenterY = (cellRect.top - gridRect.top) + cellRect.height / 2;

  // We want the player at the center of the viewport
  const targetOffsetX = (viewportRect.width / 2) - playerCenterX;
  const targetOffsetY = (viewportRect.height / 2) - playerCenterY;

  cameraOffsetX = targetOffsetX;
  cameraOffsetY = targetOffsetY;

  // Respect current clamp / overscroll
  clampCameraToGrid();
  applyCameraTransform();
}

document.addEventListener('keydown', (e) => {
  const zoomStep = 0.1;

  if (e.key === '=' || e.key === '+') {
    cameraZoom = Math.min(2.0, cameraZoom + zoomStep);
    clampCameraToGrid();
    applyCameraTransform();
  } else if (e.key === '-' || e.key === '_') {
    cameraZoom = Math.max(0.5, cameraZoom - zoomStep);
    clampCameraToGrid();
    applyCameraTransform();
  } else if (e.key === 'c' || e.key === 'C') {
    centerCameraOnPlayer();
  }
});

const viewport = document.querySelector('.level-viewport');
const gridWrapper = document.querySelector('.level-grid-wrapper');
const gridEl = document.getElementById('level-grid');

// Mouse wheel zoom on viewport
if (viewport) {
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    console.log('wheel event');
    const zoomFactor = 0.1;
    const oldZoom = cameraZoom;
    const zoomDir = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(2.0, Math.max(0.5, cameraZoom + zoomDir * zoomFactor));

    if (newZoom === oldZoom) return;

    const rect = viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    cameraOffsetX = cx - (cx - cameraOffsetX) * (newZoom / oldZoom);
    cameraOffsetY = cy - (cy - cameraOffsetY) * (newZoom / oldZoom);

    cameraZoom = newZoom;
    clampCameraToGrid();
    applyCameraTransform();
  }, { passive: false });

  // Block context menu so right-drag feels clean
  viewport.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Use the grid itself for panning
if (gridEl) {
  gridEl.addEventListener('mousedown', (e) => {
    if (e.button !== 2) return; // right button only
    e.preventDefault();
    isPanning = true;
        console.log('panning start', e.button);
    if (viewport) viewport.classList.add('is-panning');
    panStartX = e.clientX;
    panStartY = e.clientY;
    panOriginX = cameraOffsetX;
    panOriginY = cameraOffsetY;
  });
}

window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  const dx = e.clientX - panStartX;
  const dy = e.clientY - panStartY;
  cameraOffsetX = panOriginX + dx;
  cameraOffsetY = panOriginY + dy;
  clampCameraToGrid();
  applyCameraTransform();
});

window.addEventListener('mouseup', () => {
  if (!isPanning) return;
  isPanning = false;
  if (viewport) viewport.classList.remove('is-panning');
});
