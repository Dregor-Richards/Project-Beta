// Shared damage handling for all enemy hits
async function applyPlayerHit(
  damage = 1,
  moveIntoPlayerTile = false,
  enemyArray = null,
  enemyIndex = null,
  newEnemyPos = null,
  skipDeathModal = false
) {
  // Greaves of Dodging: chance to avoid all damage
  if (typeof getTotalDodgeChance === 'function') {
    const dodgeChance = getTotalDodgeChance();
    if (dodgeChance > 0 && Math.random() < dodgeChance) {
      playSfx && playSfx('playerDodge');
      return false; // treated as "player survived without losing lives"
    }
  }

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

  await moveMimic(size, maxIndex);
  if (playerDead) return;

  await moveSummonerEnemies(size, maxIndex);
  if (playerDead) return;

  await handleMortarPhase();
  if (playerDead) return;

  redrawBoard();
}

function getAdjacentEmptyTiles(center, size, maxIndex) {
  const neighbors = [];

  const up    = center - size;
  const down  = center + size;
  const left  = center - 1;
  const right = center + 1;

  const isValid = (idx) => idx >= 1 && idx <= maxIndex;

  if (isValid(up)    && !isBlockedBossTile(up)    && (!isWallTile || !isWallTile(up)))    neighbors.push(up);
  if (isValid(down)  && !isBlockedBossTile(down)  && (!isWallTile || !isWallTile(down)))  neighbors.push(down);
  if (center % size !== 1 && isValid(left) && !isBlockedBossTile(left) && (!isWallTile || !isWallTile(left))) {
    neighbors.push(left);
  }
  if (center % size !== 0 && isValid(right) && !isBlockedBossTile(right) && (!isWallTile || !isWallTile(right))) {
    neighbors.push(right);
  }

  // Filter out anything occupied by enemies, player, or special tiles
  return neighbors.filter(idx => {
    if (idx === avatarIndex) return false;
    if (enemies.includes(idx)) return false;
    if (fastEnemies.includes(idx)) return false;
    if (trackerEnemies.includes(idx)) return false;
    if (mortarEnemies.includes(idx)) return false;
    if (summonerEnemies.includes(idx)) return false;
    if (typeof bossIndex === 'number' && idx === bossIndex + 1) return false;
    if (idx === chestIndex || idx === mimicChestIndex || idx === mimicIndex) return false;
    if (idx === heartIndex || idx === skipTileIndex) return false;
    if (idx === stoneIndex) return false;
    if (Array.isArray(wandsOnBoard) && wandsOnBoard.some(w => w.index === idx)) return false;
    return true;
  });
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
      if (isBlockedBossTile(next)) continue;

      if (typeof isWallTile === 'function' && isWallTile(next)) {
        continue;
      }

      // Hit player
      if (next === avatarIndex) {
        const died = await applyPlayerHit(1, true, enemies, i, next);
        if (died) return;

        moved = true;
        next = idx; // enemy stays in place if player survives
        break;
      }

      const bossTileIndex = bossIndex != null ? bossIndex + 1 : null;

      const occupiedByOther =
        enemies.some((e, j) => j !== i && e === next) ||
        fastEnemies.includes(next) ||
        trackerEnemies.includes(next) ||
        mortarEnemies.includes(next) ||
        (bossTileIndex !== null && next === bossTileIndex);
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

    // Guard if phases array got out of sync for any reason
    if (fastEnemyPhases.length <= i) {
      fastEnemyPhases[i] = randomInt(0, 2);
    }

    // Advance this bat’s phase: 0 → 1 → 2 → 0 ...
    fastEnemyPhases[i] = (fastEnemyPhases[i] + 1) % 3;

    // On phase 2, this bat rests for this enemy turn
    if (fastEnemyPhases[i] === 2) {
      continue;
    }

    // If they start on an icy tile, they are already frozen
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
        if (isBlockedBossTile(next)) continue;

        if (typeof isWallTile === 'function' && isWallTile(next)) {
          continue;
        }

        // Hit player
        if (next === avatarIndex) {
          const died = await applyPlayerHit(
            1,
            true,           // moveIntoPlayerTile
            fastEnemies,    // enemyArray
            i,              // enemyIndex
            next            // newEnemyPos
          );
          if (died) return;

          moved = true;
          step = stepsThisTurn; // stop remaining steps for this bat
          break;
        }

        const bossTileIndex = bossIndex != null ? bossIndex + 1 : null;

        const occupiedByOther =
          enemies.includes(next) ||
          fastEnemies.some((e, j) => j !== i && e === next) ||
          trackerEnemies.includes(next) ||
          mortarEnemies.includes(next) ||
          (bossTileIndex !== null && next === bossTileIndex);
        if (occupiedByOther) continue;

        // Move one step
        idx = next;
        fastEnemies[i] = idx;
        moved = true;

        redrawBoard();
        await sleep(ENEMY_STEP_DELAY_MS);

        // If we just stepped onto an icy tile, lock and stop all movement
        if (frozenEnemyTiles.has(idx)) {
          step = stepsThisTurn;
          break;
        }
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

    // Already frozen
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
      if (isBlockedBossTile(next)) continue;

      if (typeof isWallTile === 'function' && isWallTile(next)) {
        continue;
      }

      // Hit player: damage and move into their tile if they kill the player
      if (next === avatarIndex) {
        const died = await applyPlayerHit(
          1,
          true,             // moveIntoPlayerTile
          trackerEnemies,   // enemyArray
          i,                // enemyIndex
          next              // newEnemyPos
        );
        if (died) return;

        movedThisEnemy = true;
        break;
      }

      const bossTileIndex = bossIndex != null ? bossIndex + 1 : null;

      const occupiedByOther =
        enemies.includes(next) ||
        fastEnemies.includes(next) ||
        trackerEnemies.some((e, j) => j !== i && e === next) ||
        mortarEnemies.includes(next) ||
        (bossTileIndex !== null && next === bossTileIndex);
      if (occupiedByOther) break;

      // Move one step
      idx = next;
      trackerEnemies[i] = idx;
      movedThisEnemy = true;

      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);

      // New: if we just stepped onto an icy tile, lock immediately and stop all movement
      if (frozenEnemyTiles.has(idx)) {
        break; // stop their remaining step(s)
      }
    }
  }
}

async function moveMimic(size, maxIndex) {
  if (!mimicActive || mimicIndex == null || playerDead) return;

  // Phase cycle: 1 → 2 → 3 → 4 → 5 → 1 ...
  // 1: slow approach (1 toward)
  // 2: slow approach (1 toward again)
  // 3: stronger approach (2 toward)
  // 4: erratic (up to 3 random steps)
  // 5: away (up to 3 away from player)
  if (mimicPhase < 1 || mimicPhase > 5) mimicPhase = 1;

  let steps = 0;
  let mode = 'toward'; // 'toward', 'erratic', or 'away'

  if (mimicPhase === 1) {
    steps = 1;
    mode = 'toward';
  } else if (mimicPhase === 2) {
    steps = 1;
    mode = 'toward';
  } else if (mimicPhase === 3) {
    steps = 2;
    mode = 'toward';
  } else if (mimicPhase === 4) {
    steps = 3;
    mode = 'erratic';
  } else if (mimicPhase === 5) {
    steps = 3;
    mode = 'away';
  }

  let idx = mimicIndex;

  for (let step = 0; step < steps; step++) {
    if (playerDead) return;

    let dir = null;

    if (mode === 'toward') {
      // Reuse tracker logic for "towards player"
      dir = chooseTrackerStepDirection(idx);
    } else if (mode === 'away') {
      dir = chooseMimicAwayDirection(idx);
    } else if (mode === 'erratic') {
      dir = randomDirection();
    }

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

    if (next === idx) continue;
    if (isBlockedBossTile(next)) continue;

    if (typeof isWallTile === 'function' && isWallTile(next)) {
      continue;
    }

    // Hit player
    if (next === avatarIndex) {
      const died = await applyPlayerHit(
        1,
        true,           // moveIntoPlayerTile (on kill)
        null,           // enemyArray - mimic is single, tracked by mimicIndex
        null,           // enemyIndex
        next            // newEnemyPos
      );
      if (died) return;

      // If player survives, mimic stays where it was before this step
      // so we do not move idx
      break;
    }

    // Check occupancy: don't overlap with other enemies or boss
    const bossTileIndex = bossIndex != null ? bossIndex + 1 : null;
    const occupiedByOther =
      enemies.includes(next) ||
      fastEnemies.includes(next) ||
      trackerEnemies.includes(next) ||
      mortarEnemies.includes(next) ||
      (bossTileIndex !== null && next === bossTileIndex);

    if (occupiedByOther) continue;

    // Move one step
    idx = next;
    mimicIndex = idx;

    redrawBoard();
    await sleep(ENEMY_STEP_DELAY_MS);
  }

  // Advance phase for next enemy turn
  mimicPhase += 1;
  if (mimicPhase > 5) mimicPhase = 1;
}

const SUMMON_ORDER = ['normal', 'fast', 'tracker', 'mortar'];

function summonerHasActiveChildren(sIndex) {
  const hasNormal = summonerChildNormalIndices[sIndex]?.some(idx => idx >= 0);
  const hasFast = summonerChildFastIndices[sIndex]?.some(idx => idx >= 0);
  const hasTracker = summonerChildTrackerIndices[sIndex]?.some(idx => idx >= 0);
  const hasMortar = summonerChildMortarIndices[sIndex]?.some(idx => idx >= 0);
  return !!(hasNormal || hasFast || hasTracker || hasMortar);
}

async function moveSummonerEnemies(size, maxIndex) {
  const SUMMON_SUCCESS = {
    normal: 0.75,  // high chance 75
    fast: 0.65, // 65
    tracker: 0.55, // 55
    mortar: 0.45,  // lowest chance 45
  };

  for (let i = 0; i < summonerEnemies.length; i++) {
    if (playerDead) return;

    let idx = summonerEnemies[i];

    // If frozen, Summoner does nothing this turn
    if (frozenEnemyTiles.has(idx)) {
      continue;
    }

    if (summonerHasActiveChildren(i)) {
      // Behavior while children are alive: move 2 random tiles
      idx = await moveSummonerRandomSteps(idx, size, maxIndex, 2, i);
      summonerEnemies[i] = idx;
      continue;
    }

    // Combo turn overrides: guaranteed multi-summon
    if (summonerMustCombo[i]) {
      await performSummonerComboSummon(i, size, maxIndex);
      summonerMustCombo[i] = false;
      summonerStages[i] = 0;
      summonerFailStreaks[i] = 0;
      continue;
    }

    // Choose current summon type based on stage
    const stage = summonerStages[i] || 0;
    const type = SUMMON_ORDER[Math.min(stage, SUMMON_ORDER.length - 1)];

    // Attempt summon
    const availableTiles = getAdjacentEmptyTiles(idx, size, maxIndex);
    const successChance = SUMMON_SUCCESS[type];
    const roll = Math.random();

    if (availableTiles.length > 0 && roll < successChance) {
      // Successful summon: 1–4 units, capped by available tiles
      const count = randomInt(1, Math.min(4, availableTiles.length));
      // Shuffle neighbors a bit
      for (let j = availableTiles.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [availableTiles[j], availableTiles[k]] = [availableTiles[k], availableTiles[j]];
      }

      for (let n = 0; n < count; n++) {
        const tile = availableTiles[n];
        if (type === 'normal') {
          enemies.push(tile);
          enemyIsSummoned.push(true);
          summonerChildNormalIndices[i].push(enemies.length - 1);
        } else if (type === 'fast') {
          fastEnemies.push(tile);
          fastEnemyPhases.push(randomInt(0, 2));
          fastEnemyIsSummoned.push(true);
          summonerChildFastIndices[i].push(enemies.length - 1);
        } else if (type === 'tracker') {
          trackerEnemies.push(tile);
          trackerEnemyIsSummoned.push(true);
          summonerChildTrackerIndices[i].push(enemies.length - 1);
        } else if (type === 'mortar') {
          mortarEnemies.push(tile);
          mortarEnemyIsSummoned.push(true);
          summonerChildMortarIndices[i].push(enemies.length - 1);
        }
        spawnParticlesAtCell(tile, 'summon');
      }

      summonerFailStreaks[i] = 0;
      summonerStages[i] = (stage + 1) % SUMMON_ORDER.length;

      // Summoners do not move on successful summon
      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);
      continue;
    }

    // Failed summon: increase fail streak and advance stage
    summonerFailStreaks[i] = (summonerFailStreaks[i] || 0) + 1;
    summonerStages[i] = (stage + 1) % SUMMON_ORDER.length;

    if (summonerFailStreaks[i] >= SUMMON_ORDER.length) {
      // Next turn, perform combo summon
      summonerMustCombo[i] = true;
      summonerFailStreaks[i] = 0;
    }

    // On failure, move 2 random tiles
    idx = await moveSummonerRandomSteps(idx, size, maxIndex, 2, i);
    summonerEnemies[i] = idx;
  }
}

async function moveSummonerRandomSteps(startIdx, size, maxIndex, steps, summonerIndex) {
  let idx = startIdx;

  for (let step = 0; step < steps; step++) {
    if (playerDead) return idx;

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
      if (isBlockedBossTile(next)) continue;
      if (typeof isWallTile === 'function' && isWallTile(next)) continue;

      // If they walk into the player, damage and move into tile on kill
      if (next === avatarIndex) {
        const died = await applyPlayerHit(
          1,
          true,
          summonerEnemies,
          summonerIndex,
          next
        );
        if (died) return next;

        // If player survives, Summoner stays put and stops moving further
        return idx;
      }

      const bossTileIndex = typeof bossIndex === 'number' ? bossIndex + 1 : null;
      const occupiedByOther =
        enemies.includes(next) ||
        fastEnemies.includes(next) ||
        trackerEnemies.includes(next) ||
        mortarEnemies.includes(next) ||
        summonerEnemies.some((e, j) => j !== summonerIndex && e === next) ||
        (bossTileIndex !== null && next === bossTileIndex);

      if (occupiedByOther) continue;

      idx = next;
      summonerEnemies[summonerIndex] = idx;
      moved = true;

      redrawBoard();
      await sleep(ENEMY_STEP_DELAY_MS);
    }

    if (!moved) {
      break;
    }
  }

  return idx;
}

async function performSummonerComboSummon(sIndex, size, maxIndex) {
  const center = summonerEnemies[sIndex];
  let tiles = getAdjacentEmptyTiles(center, size, maxIndex);
  if (tiles.length === 0) return;

  // Shuffle for variety
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Reverse priority: mortar, tracker, fast, normal
  const priorities = ['mortar', 'tracker', 'fast', 'normal'];

  for (const type of priorities) {
    if (tiles.length === 0) break;

    // Only place normal if we had at least 4 slots to begin with
    if (type === 'normal' && tiles.length < 4) {
      continue;
    }

    const tile = tiles.pop();
    if (type === 'mortar') {
      mortarEnemies.push(tile);
      mortarEnemyIsSummoned.push(true);
      summonerChildMortarIndices[sIndex].push(mortarEnemies.length - 1);
    } else if (type === 'tracker') {
      trackerEnemies.push(tile);
      trackerEnemyIsSummoned.push(true);
      summonerChildTrackerIndices[sIndex].push(trackerEnemies.length - 1);
    } else if (type === 'fast') {
      fastEnemies.push(tile);
      fastEnemyPhases.push(randomInt(0, 2));
      fastEnemyIsSummoned.push(true);
      summonerChildFastIndices[sIndex].push(fastEnemies.length - 1);
    } else if (type === 'normal') {
      enemies.push(tile);
      enemyIsSummoned.push(true);
      summonerChildNormalIndices[sIndex].push(enemies.length - 1);
    }
    spawnParticlesAtCell(tile, 'summon');
  }

  redrawBoard();
  await sleep(ENEMY_STEP_DELAY_MS);
}

async function handleMortarPhase() {
  if (mortarEnemies.length === 0) return;

  // If all mortars are on frozen tiles, they do nothing
  const anyUnfrozen = mortarEnemies.some(idx => !frozenEnemyTiles.has(idx));
  if (!anyUnfrozen) {
    // cancel any already-telegraphed shots
    mortarTargets = [];
    mortarJustTargeted = false;
    return;
  }

  if (!mortarJustTargeted || mortarTargets.length === 0) {
    // Telegraph phase: use current scaling to show how many tiles *will* be hit
    pickMortarTargets(5 + mortarFireCount);
    mortarJustTargeted = true;
    redrawBoard();
    return;
  }

  // Second phase: fire on targets, then retarget immediately
  if (mortarTargets.includes(avatarIndex)) {
    const died = await applyPlayerHit(1);
    if (died) return;
  }

  // Chance for Mortars to gain extra strike each round
  if (Math.random() < 0.25) {
    mortarFireCount++;
  }

  // Clear old targets and immediately pick new ones with updated scaling
  pickMortarTargets(5 + mortarFireCount);
  mortarJustTargeted = true;
  onMortarTargetsChanged();
  redrawBoard();
}