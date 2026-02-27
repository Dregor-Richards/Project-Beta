// Shared damage handling for all enemy hits
async function applyPlayerHit(
  damage = 1,
  moveIntoPlayerTile = false,
  enemyArray = null,
  enemyIndex = null,
  newEnemyPos = null,
  skipDeathModal = false
) {
  if (heartStoneActive) {
    lives = 0;
  } else {
    lives = Math.max(0, lives - damage);
  }

  sessionStorage.setItem('playerLives', String(lives));
  redrawLives();
  damageEffect();

  if (lives === 0) {
    playerDead = true;

    if (moveIntoPlayerTile && enemyArray && enemyIndex != null && newEnemyPos != null) {
      enemyArray[enemyIndex] = newEnemyPos;
    }

    redrawBoard();
    await sleep(200);
    playSfx('death');

    if (!skipDeathModal) {
      showDeathModal();
    }

    return true; // player died
  } else {
    playSfx('playerHit');
    return false; // player survived
  }
}

async function moveAllEnemies() {
  if (playerDead) return;

  const size = gridSize;
  const maxIndex = size * size;

  await moveNormalEnemies(size, maxIndex);
  if (playerDead) return;

  await moveFastEnemies(size, maxIndex);
  if (playerDead) return;

  await moveTrackerEnemies(size, maxIndex);
  if (playerDead) return;

  await handleMortarPhase();
  if (playerDead) return;

  redrawBoard();
}

async function moveNormalEnemies(size, maxIndex) {
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
        const died = await applyPlayerHit(1, true, enemies, i, next);
        if (died) return;

        moved = true;
        next = idx; // enemy stays in place if player survives
        break;
      }

      const occupiedByOther =
        enemies.some((e, j) => j !== i && e === next) ||
        fastEnemies.includes(next) ||
        trackerEnemies.includes(next) ||
        mortarEnemies.includes(next);
      if (occupiedByOther) continue;

      enemies[i] = next;
      moved = true;

      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);
    }
  }
}

async function moveFastEnemies(size, maxIndex) {
  for (let i = 0; i < fastEnemies.length; i++) {
    let idx = fastEnemies[i];

    if (frozenEnemyTiles.has(idx)) {
      continue;
    }

    const stepsThisTurn = randomInt(1, 3);
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

        // Hit player: damage, but DON'T move into their tile
        if (next === avatarIndex) {
          const died = await applyPlayerHit(1);
          if (died) return;

          moved = true;
          step = stepsThisTurn; // stop remaining steps for this fast enemy
          break;
        }

        const occupiedByOther =
          enemies.includes(next) ||
          fastEnemies.some((e, j) => j !== i && e === next) ||
          trackerEnemies.includes(next) ||
          mortarEnemies.includes(next);
        if (occupiedByOther) continue;

        idx = next;
        fastEnemies[i] = idx;
        moved = true;

        redrawBoard();
        await sleep(ENEMY_STEP_DELAY_MS);
      }

      if (!moved) {
        break; // can't move further this turn
      }
    }
  }
}

async function moveTrackerEnemies(size, maxIndex) {
  trackerTurnParity = 1 - trackerTurnParity; // toggle each enemy phase

  if (trackerTurnParity !== 1) return;

  for (let i = 0; i < trackerEnemies.length; i++) {
    let idx = trackerEnemies[i];

    if (frozenEnemyTiles.has(idx)) {
      continue;
    }

    let movedThisEnemy = false;

    // Trackers move 2 steps in one enemy phase
    for (let step = 0; step < 2; step++) {
      if (playerDead) return;

      const dir = chooseTrackerStepDirection(idx);
      if (!dir) break;

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

      if (next === idx) break;

      // Hit player: damage but do not move into their tile
      if (next === avatarIndex) {
        const died = await applyPlayerHit(1);
        if (died) return;

        movedThisEnemy = true;
        break;
      }

      const occupiedByOther =
        enemies.includes(next) ||
        fastEnemies.includes(next) ||
        trackerEnemies.some((e, j) => j !== i && e === next) ||
        mortarEnemies.includes(next);

      if (occupiedByOther) break;

      idx = next;
      trackerEnemies[i] = idx;
      movedThisEnemy = true;

      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);
    }
  }
}

async function handleMortarPhase() {
  if (mortarEnemies.length === 0) return;

  if (!mortarJustTargeted || mortarTargets.length === 0) {
    pickMortarTargets(5);
    mortarJustTargeted = true;
    redrawBoard();
    return;
  }

  // Second phase: fire on targets, then retarget immediately
  if (mortarTargets.includes(avatarIndex)) {
    const died = await applyPlayerHit(1);
    if (died) return;
  }

  // Clear old targets and immediately pick new ones
  pickMortarTargets(5);
  mortarJustTargeted = true;
  redrawBoard();
}