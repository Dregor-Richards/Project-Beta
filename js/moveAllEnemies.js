async function moveAllEnemies() {
  if (playerDead) return;

  const size = gridSize;
  const maxIndex = size * size;

  await moveNormalEnemies(size, maxIndex);
  await moveFastEnemies(size, maxIndex);
  await moveTrackerEnemies(size, maxIndex);
  await handleMortarPhase();

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
        lives = Math.max(0, lives - 1);
        sessionStorage.setItem('playerLives', String(lives));
        redrawLives();
        damageEffect();

        if (lives === 0) {
          playerDead = true;
          enemies[i] = next;
          redrawBoard();
          await sleep(200);
          playSfx('death');
          showDeathModal();
          return;
        } else {
          playSfx('playerHit');
        }

        moved = true;
        next = idx;
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

        // Hit player: deal damage, but DON'T move into their tile
        if (next === avatarIndex) {
          lives = Math.max(0, lives - 1);
          sessionStorage.setItem('playerLives', String(lives));
          redrawLives();
          damageEffect();

          if (lives === 0) {
            playerDead = true;
            redrawBoard();
            await sleep(200);
            playSfx('death');
            showDeathModal();
            return;
          } else {
            playSfx('playerHit');
          }

          moved = true;
          step = stepsThisTurn;
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
        break;
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
        lives = Math.max(0, lives - 1);
        sessionStorage.setItem('playerLives', String(lives));
        redrawLives();
        damageEffect();

        if (lives === 0) {
          playerDead = true;
          redrawBoard();
          await sleep(200);
          playSfx('death');
          showDeathModal();
          return;
        } else {
          playSfx('playerHit');
        }

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
    lives = Math.max(0, lives - 1);
    sessionStorage.setItem('playerLives', String(lives));
    redrawLives();
    damageEffect();

    if (lives === 0) {
      playerDead = true;
      redrawBoard();
      await sleep(200);
      playSfx('death');
      showDeathModal();
      return;
    } else {
      playSfx('playerHit');
    }
  }

  // Clear old targets and immediately pick new ones
  pickMortarTargets(5);
  mortarJustTargeted = true;
  redrawBoard();
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
        damageEffect();

        if (lives === 0) {
          playerDead = true;
          enemies[i] = next;
          redrawBoard();
          await sleep(200);
          playSfx('death');
          showDeathModal();
          return;
        } else {
          playSfx('playerHit');
        }

        moved = true;
        next = idx;
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

  // --- 2. Fast enemies (1–3 steps each) ---
  for (let i = 0; i < fastEnemies.length; i++) {
    let idx = fastEnemies[i];

    if (frozenEnemyTiles.has(idx)) {
      continue; // this fast enemy is frozen permanently
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

        // Hit player: deal damage, but DON'T move into their tile
        if (next === avatarIndex) {
          lives = Math.max(0, lives - 1);
          sessionStorage.setItem('playerLives', String(lives));
          redrawLives();
          damageEffect();

          if (lives === 0) {
            playerDead = true;
            redrawBoard();
            await sleep(200);
            playSfx('death');
            showDeathModal();
            return;
          } else {
            playSfx('playerHit');
          }

          moved = true;
          step = stepsThisTurn;
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
        // Can't move further this turn
        break;
      }
    }
  }

  // --- 3. Tracker enemies (skip every other turn, 2 steps toward player) ---
  trackerTurnParity = 1 - trackerTurnParity; // toggle each enemy phase

  if (trackerTurnParity === 1) {
    const size = gridSize;
    const maxIndex = size * size;

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
          lives = Math.max(0, lives - 1);
          sessionStorage.setItem('playerLives', String(lives));
          redrawLives();
          damageEffect();

          if (lives === 0) {
            playerDead = true;
            redrawBoard();
            await sleep(200);
            playSfx('death');
            showDeathModal();
            return;
          } else {
            playSfx('playerHit');
          }

          movedThisEnemy = true;
          break; // stop further steps for this tracker
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


    // --- 4. Mortar enemies: target then fire ---
  if (mortarEnemies.length > 0) {
    if (!mortarJustTargeted || mortarTargets.length === 0) {
      pickMortarTargets(5);
      mortarJustTargeted = true;
      redrawBoard();
    } else {
        // Second phase: fire on targets, then retarget immediately
    if (mortarTargets.includes(avatarIndex)) {
      lives = Math.max(0, lives - 1);
      sessionStorage.setItem('playerLives', String(lives));
      redrawLives();
      damageEffect();

      if (lives === 0) {
        playerDead = true;
        redrawBoard();
        await sleep(200);
        playSfx('death');
        showDeathModal();
        return;
      } else {
        playSfx('playerHit');
      }
    }

    // Clear old targets and immediately pick new ones
    pickMortarTargets(5);
    mortarJustTargeted = true;
    redrawBoard();
    }
  }



  redrawBoard();
}