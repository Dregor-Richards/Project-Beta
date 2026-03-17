function randomDirection() {
  const dirs = ['up', 'down', 'left', 'right'];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function chooseTrackerStepDirection(enemyIndex) {
  const size = gridSize;
  const maxIndex = size * size;

  const enemyRow = Math.floor((enemyIndex - 1) / size);
  const enemyCol = (enemyIndex - 1) % size;
  const playerRow = Math.floor((avatarIndex - 1) / size);
  const playerCol = (avatarIndex - 1) % size;

  const candidates = [];

  // Vertical preference
  if (playerRow < enemyRow && enemyIndex > size) {
    candidates.push('up');
  } else if (playerRow > enemyRow && enemyIndex <= maxIndex - size) {
    candidates.push('down');
  }

  // Horizontal preference
  if (playerCol < enemyCol && (enemyIndex - 1) % size !== 0) {
    candidates.push('left');
  } else if (playerCol > enemyCol && enemyIndex % size !== 0) {
    candidates.push('right');
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}


function pickMortarTargets(countPerMortar = 5) {
  mortarTargets = [];

  if (mortarEnemies.length === 0) return;

  const maxIndex = gridSize * gridSize;
  const missingSet = (gridSize === BOSS_GRID_SIZE)
    ? new Set(BOSS_MISSING_TILES.map(idx => idx + 1))
    : null;

  mortarEnemies.forEach(mortarIndex => {
    // If this mortar is frozen, it contributes no targets
    if (frozenEnemyTiles.has(mortarIndex)) {
      return;
    }

    const blocked = new Set([
      doorIndex,
      skipTileIndex,
      lanternTile,
      brazierTile,
      ...enemies,
      ...fastEnemies,
      ...trackerEnemies,
      ...mortarEnemies,
      ...mortarTargets, // already chosen targets
    ]);

    // Permanently blocked / icy tiles
    if (blockedMortarTiles) {
      blockedMortarTiles.forEach(t => blocked.add(t));
    }
    frozenEnemyTiles.forEach(t => blocked.add(t));

    const candidates = [];
    for (let i = 1; i <= maxIndex; i++) {
      if (missingSet && missingSet.has(i)) continue;
      if (!blocked.has(i)) candidates.push(i);
    }

    for (let n = 0; n < countPerMortar && candidates.length > 0; n++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const chosen = candidates[idx];
      mortarTargets.push(chosen);
      candidates.splice(idx, 1);
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function endPlayerTurn() {
  playerTurn = false;

  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  const difficulty =
    storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;

  if (difficulty === 10) {
    // Boss level: enemies move, then boss acts (no darkness here)
    await moveAllEnemies();
    if (!playerDead && bossHealth > 0) {
      await bossAct();
    }

    if (hasTripleEnemyTurns && !playerDead && bossHealth > 0) {
      for (let i = 0; i < 2; i++) {
        await moveAllEnemies();
        if (playerDead || bossHealth <= 0) break;

        await bossAct();
        if (playerDead || bossHealth <= 0) break;
      }
    }
  } else {
    // Normal / post-boss / endless levels
    await moveAllEnemies();

    if (hasTripleEnemyTurns && !playerDead && !allEnemiesDead()) {
      for (let i = 0; i < 2; i++) {
        await moveAllEnemies();
        if (playerDead || allEnemiesDead()) break;
      }
    }

    // After the *first* enemy phase on dark levels, upgrade to full darkness
    if (isDarkLevel && !fullDarkActive) {
      const activated = activateFullDarkness();
      if (activated) {
        const wrapper = document.querySelector('.level-viewport');
        const overlay = wrapper && wrapper.querySelector('.level-dark-overlay');
        if (overlay) overlay.remove();

        // mortarTargets now reflect the first telegraph, so all tiles can be lit
        redrawBoard();
      }
    }
  }

  movesThisTurn = 0;
  playerTurn = true;
}

function allEnemiesDead() {
  return (
    enemies.length === 0 &&
    fastEnemies.length === 0 &&
    trackerEnemies.length === 0 &&
    mortarEnemies.length === 0
  );
}