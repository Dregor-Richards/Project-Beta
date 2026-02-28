function applyCameraTransform() {
  const wrapper = document.querySelector('.level-grid-wrapper');
  if (!wrapper) return;
  wrapper.style.transform =
    `translate(${cameraOffsetX}px, ${cameraOffsetY}px) scale(${cameraZoom})`;
}

function damageEffect() {
  const overlay = document.getElementById('damage-flash');
  const gameWrapper = document.getElementById('game-wrapper');

  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 150);
  }

  if (gameWrapper) {
    gameWrapper.classList.add('shake');
    setTimeout(() => {
      gameWrapper.classList.remove('shake');
    }, 150);
  }
}

const ENEMY_STEP_DELAY_MS = 75; // tweak for faster/slower animations

function checkForWin() {
  if (allEnemiesDead() && avatarIndex === doorIndex && !playerDead) {
    spawnParticlesAtCell(doorIndex, 'door');
    addScore(3);
    playSfx('doorWin');
    showWinModal();
  }
}

function redrawLives() {
  const dots = document.querySelectorAll('.life-dot');
  dots.forEach((dot, index) => {
    dot.style.opacity = index < lives ? '1' : '0.2';
  });
}

function redrawScore() {
  const el = document.getElementById('score-text');
  if (el) {
    el.textContent = 'Score = ' + score;
  }
}

function addScore(points) {
  let final = points;

  if (hasTripleEnemyTurns) {
    final *= 2;
  }
  if (heartStoneActive) {
    final *= 3;
  }

  score += final;
  sessionStorage.setItem('playerScore', String(score));
  redrawScore();
}

// --- DOM ready: core setup ---

window.addEventListener('DOMContentLoaded', () => {
  loadLevelNumber();
  playMusic('level');

  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  let difficulty = storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;
  if (difficulty < 1) difficulty = 1;

  const diffEl = document.getElementById('difficulty-text');
  if (diffEl) {
    diffEl.textContent = `Difficulty: ${difficulty}`;
  }

  const config = getDifficultyConfig(difficulty);

  const storedLives = sessionStorage.getItem('playerLives');
  lives = storedLives !== null ? Number(storedLives) || 3 : 3;

  const storedScore = sessionStorage.getItem('playerScore');
  score = storedScore !== null ? Number(storedScore) || 0 : 0;

  const storedInventory = sessionStorage.getItem('inventory');
  if (storedInventory) {
    try {
      const parsed = JSON.parse(storedInventory);
      if (Array.isArray(parsed) && parsed.length === 21) {
        inventory = parsed;
      }
    } catch (e) {}
  }

  renderInventory();

  if (difficulty === 10) {
    // Boss arena setup instead of normal generation
    setupBossLevel();
  } else {
    // Normal levels
    gridSize = config.gridSize;

    // Default spawn in lower-left row (your existing logic)
    avatarIndex = gridSize * gridSize - gridSize + 1;

    placeNormalEnemies(config.normalCount);
    placeFastEnemies(config.fastCount);
    placeTrackerEnemies(config.trackerCount);
    placeMortarEnemies(config.mortarCount);

    doorIndex = chooseDoorIndex();

    if (shouldSpawnHeart()) {
      heartIndex = chooseHeartIndex();
    } else {
      heartIndex = null;
    }

    skipTileIndex = chooseSkipTileIndex();

    wandIndex = null;
    currentWandSubtype = null;

    if (shouldSpawnWand()) {
      const idx = chooseWandIndex();
      if (idx !== null) {
        wandIndex = idx;
        currentWandSubtype = chooseWandSubtype();
      }
    }

    stoneIndex = null;
    stonePresent = false;
    stoneType = null;
    hasTripleEnemyTurns = false;
    heartStoneActive = false;

    if (config.guaranteeStone) {
      const idx = chooseFreeIndex();
      if (idx !== null) {
        stoneIndex = idx;
        stonePresent = true;
        stoneType = Math.random() < 0.5 ? 'wyrd' : 'heart';
      }
    } else {
      const stoneRoll = Math.random();
      if (stoneRoll < 0.05) {
        const idx = chooseFreeIndex();
        if (idx !== null) {
          stoneIndex = idx;
          stonePresent = true;
          stoneType = Math.random() < 0.5 ? 'wyrd' : 'heart';
        }
      }
    }

    buildGrid(gridSize);
    redrawBoard();
  }

  redrawLives();
  redrawScore();
});
