async function handleMove(event) {
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
    addScore(1);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  const fastIndex = fastEnemies.indexOf(next);
  if (fastIndex !== -1) {
    fastEnemies.splice(fastIndex, 1);
    addScore(2);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  const trackerIndex = trackerEnemies.indexOf(next);
  if (trackerIndex !== -1) {
    trackerEnemies.splice(trackerIndex, 1);
    addScore(2);
    spawnParticlesAtCell(next, 'kill');
    playSfx('enemyDeath');
  }

  const mortarIndex = mortarEnemies.indexOf(next);
  if (mortarIndex !== -1) {
    mortarEnemies.splice(mortarIndex, 1);
    addScore(1);
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
    heartIndex = null;
  }

  // Wand pickup
  if (next === wandIndex && currentWandSubtype) {
    pickupWand(currentWandSubtype);
    spawnParticlesAtCell(next, 'pickup');
    playSfx('itemPickup');
    wandIndex = null;
    currentWandSubtype = null;
  }

  // Stone pickup
  if (next === stoneIndex && stonePresent) {
    pickupStone(stoneType);
    spawnParticlesAtCell(next, 'pickup');
    playSfx('stonePickup');
    stonePresent = false;
    stoneIndex = null;
    stoneType = null;
  }

  const steppingOntoSkipTile = (next === skipTileIndex);

  avatarIndex = next;
  redrawBoard();

  checkForWin();

  const storedDifficulty2 = sessionStorage.getItem('currentDifficulty');
  const difficulty2 =
    storedDifficulty2 !== null ? Number(storedDifficulty2) || 1 : 1;

  // On boss level (10), we always let the boss take a turn,
  // even if there are no regular enemies.
  if (playerDead || (difficulty2 !== 10 && allEnemiesDead())) return;

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

  if (hasDoubleMove && movesThisTurn < 2) {
    return;
  }

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