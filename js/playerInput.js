function getAllowedMovesThisTurn() {
  // 1 * (2 ^ extraMoves)
  return 1 << extraMoves; // bit shift, equivalent to Math.pow(2, extraMoves)
}

let itemToastTimeoutId = null;

function showItemPickupToast(options) {
  const toast = document.getElementById('item-pickup-toast');
  const nameEl = document.getElementById('item-pickup-name');
  const iconEl = toast ? toast.querySelector('.item-pickup-icon') : null;

  if (!toast || !nameEl || !iconEl) return;

  const { name, iconClass } = options;

  // Set text
  nameEl.textContent = name;

  // Reset icon classes and apply sprite class if provided
  iconEl.className = 'item-pickup-icon';
  if (iconClass) {
    iconEl.classList.add(iconClass);
  }

  // Show toast
  toast.classList.remove('hidden');

  // Clear any existing timer
  if (itemToastTimeoutId !== null) {
    clearTimeout(itemToastTimeoutId);
  }

  // Auto-hide after ~10 seconds
  itemToastTimeoutId = window.setTimeout(() => {
    toast.classList.add('hidden');
    itemToastTimeoutId = null;
  }, 5000);
}

// Click → open inventory and hide toast
window.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('item-pickup-toast');
  if (toast) {
    toast.addEventListener('click', () => {
      toggleInventory();
      toast.classList.add('hidden');
      if (itemToastTimeoutId !== null) {
        clearTimeout(itemToastTimeoutId);
        itemToastTimeoutId = null;
      }
    });
  }
});

async function handleMove(event) {
  // Block if cheat console is open OR any text input/textarea is focused
  const active = document.activeElement;
  const isTypingField =
    active &&
    (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

  if (window.cheatConsoleOpen || isTypingField) {
    return;
  }

  if (!canPlayerMove || winOpen) return;
  if (uiInputLocked) return;
  const isConfirmKey =
    event.key === 'Enter' || event.key === 'e' || event.key === 'E';

  // Toggle inventory with 'i' or 'I'
  if (event.key === 'i' || event.key === 'I') {
    event.preventDefault();
    toggleInventory();
    return;
  }

  if (winOpen && isConfirmKey) {
    event.preventDefault();
    document.getElementById('win-next').click();
    return;
  }

  if (deathOpen && isConfirmKey) {
    event.preventDefault();
    document.getElementById('death-ok').click();
    return;
  }

  if (playerDead || !playerTurn) return;

  const key = event.key;
  let direction = null;
  if (key === 'ArrowUp' || key === 'w' || key === 'W') direction = 'up';
  else if (key === 'ArrowDown' || key === 's' || key === 'S') direction = 'down';
  else if (key === 'ArrowLeft' || key === 'a' || key === 'A') direction = 'left';
  else if (key === 'ArrowRight' || key === 'd' || key === 'D') direction = 'right';
  if (!direction) return;

  const size = gridSize;
  const maxIndex = size * size;
  let next = avatarIndex;

  if (direction === 'up') {
    if (avatarIndex > size) next = avatarIndex - size;
  } else if (direction === 'down') {
    if (avatarIndex <= maxIndex - size) next = avatarIndex + size;
  } else if (direction === 'left') {
    if ((avatarIndex - 1) % size !== 0) next = avatarIndex - 1;
  } else if (direction === 'right') {
    if (avatarIndex % size !== 0) next = avatarIndex + 1;
  }

  if (next === avatarIndex) return;

  if (isWallTile && isWallTile(next)) {
    return; // do nothing; treat as solid tile
  }

  // Prevent walking into missing tiles on boss level (difficulty 10)
const storedDifficultyBoss = sessionStorage.getItem('currentDifficulty');
const difficultyBoss =
  storedDifficultyBoss !== null ? Number(storedDifficultyBoss) || 1 : 1;

if (difficultyBoss === 10 && Array.isArray(BOSS_MISSING_TILES)) {
  // BOSS_MISSING_TILES is 0-based, board indices are 1-based
  const bossMissingSet = new Set(BOSS_MISSING_TILES.map(idx => idx + 1));
  if (bossMissingSet.has(next)) {
    // Illegal move: treat as hitting a wall, do nothing
    return;
  }
}

  // === Boss collision (difficulty 10) ===
  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  const difficulty = storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;
  if (difficulty === 10 && typeof bossIndex === 'number') {
    const bossTileIndex = bossIndex + 1; // bossIndex is 0-based, board is 1-based
    if (next === bossTileIndex) {
      await hitBoss(); // implement in bossLevel1.js
      return;          // boss hit consumes the turn
    }
  }

  // --- Normal enemies ---
  const enemyIndex = enemies.indexOf(next);
  if (enemyIndex !== -1) {
    enemies.splice(enemyIndex, 1);
    enemyIsSummoned.splice(enemyIndex, 1);
    // Update summoner child tracking
    for (let s = 0; s < summonerChildNormalIndices.length; s++) {
      const arr = summonerChildNormalIndices[s];
      for (let k = 0; k < arr.length; k++) {
        if (arr[k] === enemyIndex) {
          arr[k] = -1;        // this child is gone
        } else if (arr[k] > enemyIndex) {
          arr[k] -= 1;        // shift down
        }
      }
    }
    addScore(1);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  const fastIndex = fastEnemies.indexOf(next);
  if (fastIndex !== -1) {
    fastEnemies.splice(fastIndex, 1);
    fastEnemyIsSummoned.splice(fastIndex, 1);
    // Update summoner child tracking
    for (let s = 0; s < summonerChildFastIndices.length; s++) {
      const arr = summonerChildFastIndices[s];
      for (let k = 0; k < arr.length; k++) {
        if (arr[k] === enemyIndex) {
          arr[k] = -1;        // this child is gone
        } else if (arr[k] > enemyIndex) {
          arr[k] -= 1;        // shift down
        }
      }
    }
    addScore(2);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  const trackerIndex = trackerEnemies.indexOf(next);
  if (trackerIndex !== -1) {
    trackerEnemies.splice(trackerIndex, 1);
    trackerEnemyIsSummoned.splice(trackerIndex, 1);
    // Update summoner child tracking
    for (let s = 0; s < summonerChildTrackerIndices.length; s++) {
      const arr = summonerChildTrackerIndices[s];
      for (let k = 0; k < arr.length; k++) {
        if (arr[k] === enemyIndex) {
          arr[k] = -1;        // this child is gone
        } else if (arr[k] > enemyIndex) {
          arr[k] -= 1;        // shift down
        }
      }
    }
    addScore(2);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

const mortarIndex = mortarEnemies.indexOf(next);
if (mortarIndex !== -1) {
  mortarEnemies.splice(mortarIndex, 1);
  mortarEnemyIsSummoned.splice(mortarIndex, 1);

  const tilesMarked = Array.isArray(mortarTargets) ? mortarTargets.length : 0;

  // Always at least 1 point; +1 for every additional 5 tiles beyond the first 5
  const mortarPoints = 1 + Math.max(0, Math.floor((tilesMarked - 5) / 5));

    // Update summoner child tracking
  for (let s = 0; s < summonerChildMortarIndices.length; s++) {
    const arr = summonerChildMortarIndices[s];
    for (let k = 0; k < arr.length; k++) {
      if (arr[k] === enemyIndex) {
        arr[k] = -1;        // this child is gone
      } else if (arr[k] > enemyIndex) {
        arr[k] -= 1;        // shift down
      }
    }
  }

  addScore(mortarPoints);
  spawnParticlesAtCell(next, 'kill');
  playSfx('enemyDeath');
}

  // if no mortars remain, clear their targets
  if (mortarEnemies.length === 0) {
    mortarTargets = [];
  }

  if (next === heartIndex) {
    if (lives < 3) {
      lives += 1;
      sessionStorage.setItem('playerLives', String(lives));
      redrawLives();
    }
    spawnParticlesAtCell(next, 'pickup');
    playSfx('heartPickup');
    addScore(1);
    heartIndex = null;
  }

  const summonerIndex = summonerEnemies.indexOf(next);
  if (summonerIndex !== -1) {
    summonerEnemies.splice(summonerIndex, 1);
    summonerStages.splice(summonerIndex, 1);
    summonerFailStreaks.splice(summonerIndex, 1);
    summonerMustCombo.splice(summonerIndex, 1);

    addScore(3); // Update Score?
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  // Wand pickup (supports multiple wands)
  if (Array.isArray(wandsOnBoard) && wandsOnBoard.length > 0) {
    const wandIdx = wandsOnBoard.findIndex(w => w.index === next);
    if (wandIdx !== -1) {
      const picked = wandsOnBoard[wandIdx];
      pickupWand(picked.subtype);
      spawnParticlesAtCell(next, 'pickup');
      playSfx('itemPickup');
      const bonus = getPrismsPickupBonus();
      if (bonus > 0) {
        addScore(bonus);
      }
      wandsOnBoard.splice(wandIdx, 1); // remove from board

      // show item pickup toast
      const wandName = getItemDisplayName('wand', picked.subtype);

      showItemPickupToast({
        name: wandName,
        iconClass: `icon-wand-${picked.subtype}`
      });
    }
  }


  // Stone pickup
  if (next === stoneIndex && stonePresent) {
    pickupStone(stoneType);
    spawnParticlesAtCell(next, 'pickup');
    playSfx('stonePickup');
    const bonus = getPrismsPickupBonus();
    if (bonus > 0) {
      addScore(bonus);
    }
    stonePresent = false;
    stoneIndex = null;

    const pickedStoneType = stoneType;
    stoneType = null;

    const stoneName = getItemDisplayName('stone', pickedStoneType);

    showItemPickupToast({
      name: stoneName,
      iconClass: pickedStoneType ? `icon-stone-${pickedStoneType}` : null
    });
  }

  // Chest pickup / open
  const steppingOntoNormalChest = (next === chestIndex && !chestOpened);
  const steppingOntoMimicChest = (next === mimicChestIndex && !mimicActive);

  if (steppingOntoNormalChest) {
    chestOpened = true;

    // Flip sprite to open and show particles/SFX
    spawnParticlesAtCell(next, 'chestLoot');
    playSfx('lootChest');
    redrawBoard();

    // Roll a single random loot item and show a modal with a Choose button
    const item = chooseRandomLootItem();
    showChestLootModal(item);
  }

  // Stepping onto a hidden mimic chest: trap spring
  if (steppingOntoMimicChest) {
    // Reveal the mimic at that tile (but the player does NOT move there)
    mimicActive = true;
    mimicIndex = mimicChestIndex;
    mimicHealth = 4;
    mimicPhase = 1;          // start of its movement cycle
    mimicChestIndex = null;  // no longer a chest

    // Visual feedback for the ambush
    spawnParticlesAtCell(mimicIndex, 'mimicReveal');
    playSfx('mimicTransform');
    redrawBoard();

    // No damage on reveal: the *next* time it reaches the player, it will hit
  }

  // Attacking an already-revealed mimic: moving into its tile hits it instead of moving
  const steppingOntoActiveMimic = (mimicActive && mimicIndex != null && next === mimicIndex);

  if (steppingOntoActiveMimic) {
    hitMimic();        // damages mimic, may kill it and show loot
    // Attack consumes the move, but the player does NOT move into the tile

    // If the mimic died, hitMimic() will clear mimicActive/mimicIndex and handle visuals
    // We still continue into the normal turn‑end logic below so the move is spent
  }

  const steppingOntoSkipTile = (next === skipTileIndex);

  // Only move the avatar if we did NOT:
  // - spring a hidden mimic chest trap
  // - attack an active mimic
  if (!steppingOntoMimicChest && !steppingOntoActiveMimic) {
    avatarIndex = next;
  }

  // === Darkness: lantern & brazier interactions ===
  if (isDarkLevel && fullDarkActive) {
    // Lantern pickup
    if (!lanternCollected && avatarIndex === lanternTile) {
      lanternCollected = true;
      recomputeDarkness();
      playSfx('itemPickup');
      spawnParticlesAtCell(avatarIndex, 'pickup');
    }

    // Brazier: if carrying lantern, clear all darkness for this level
    if (lanternCollected && avatarIndex === brazierTile && !brazierLit) {
      brazierLit = true;
      playLevelMusic();

      // Permanently clear darkness for this level
      litTiles.clear();
      shadowTiles.clear();
      isDarkLevel = false;
      fullDarkActive = false;
    }

    // Recompute light/shadow around new player position
    recomputeDarkness();
  }

  onPlayerMoved();
  redrawBoard();


  checkForWin();

  const storedDifficulty2 = sessionStorage.getItem('currentDifficulty');
  const difficulty2 =
    storedDifficulty2 !== null ? Number(storedDifficulty2) || 1 : 1;

  const noCoreEnemiesLeft = allEnemiesDead();
  const mimicAlive = mimicActive && mimicIndex != null && mimicHealth > 0;

  // If the player is dead, always stop.
  if (playerDead) return;

  // If there are no core enemies left and no mimic, we can stop (like before).
  // On boss level (10), we still fall through so the boss gets a turn.
  if (!mimicAlive && difficulty2 !== 10 && noCoreEnemiesLeft) {
    return;
  }

  // If we stepped on the skip tile, we force enemies to move now
  if (steppingOntoSkipTile) {
    playSfx('skipTile');
    movesThisTurn = 0;
    await endPlayerTurn();
    if (!playerDead && !allEnemiesDead()) {
      await endPlayerTurn();
    }
    return;
  }

  // Normal (non-skip) tile
  movesThisTurn += 1;
  const allowedMoves = getAllowedMovesThisTurn();

  if (movesThisTurn < allowedMoves) {
    // Player still has remaining moves this turn
    return;
  }

  refreshEnemyRoster();

  movesThisTurn = 0;
  await endPlayerTurn();
}

function toggleInventory() {
  const inv = document.getElementById('inventory-panel');
  if (!inv) return;

  const willOpen = inv.classList.contains('hidden'); // true if we're about to show it
  inv.classList.toggle('hidden');

  // Only play if we actually changed state
  playSfx('uiInventory');
}


window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', handleMove);
});