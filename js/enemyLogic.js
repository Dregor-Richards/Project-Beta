function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  mortarEnemies.forEach(mortarIndex => {
    const blocked = new Set([
      avatarIndex,
      doorIndex,
      heartIndex,
      skipTileIndex,
      wandIndex,
      stoneIndex,
      ...enemies,
      ...fastEnemies,
      ...trackerEnemies,
      ...mortarEnemies,
      ...mortarTargets, // already chosen targets
    ]);

    blocked.delete(mortarIndex);

    const candidates = [];
    for (let i = 1; i <= maxIndex; i++) {
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

  // Base 1 enemy phase
  await moveAllEnemies();

  // If Wyrd Stone active, add 2 more enemy phases
  if (hasTripleEnemyTurns && !playerDead && !allEnemiesDead()) {
    for (let i = 0; i < 2; i++) {
      await moveAllEnemies();
      if (playerDead || allEnemiesDead()) break;
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