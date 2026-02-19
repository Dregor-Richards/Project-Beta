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
  score += points;
  sessionStorage.setItem('playerScore', String(score));
  redrawScore();
}

// --- DOM ready: core setup ---

window.addEventListener('DOMContentLoaded', () => {
  loadLevelNumber();
  playMusic('level');

  // Difficulty from setup; default to 1
  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  let difficulty = storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;
  if (difficulty < 1) difficulty = 1;

  const diffEl = document.getElementById('difficulty-text');
  if (diffEl) {
    diffEl.textContent = `Difficulty: ${difficulty}`;
  }

  const config = getDifficultyConfig(difficulty);
  gridSize = config.gridSize;

  // Existing lives/score/inventory loading...
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

  avatarIndex = gridSize * gridSize - gridSize + 1;

  // Place enemies according to config
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

  // Wands & stones
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
  hasTripleEnemyTurns = false;

  if (config.guaranteeStone) {
    const idx = chooseFreeIndex();
    if (idx !== null) {
      stoneIndex = idx;
      stonePresent = true;
    }
  } else {
    // existing 5% roll
    const wyrdRoll = Math.random();
    if (wyrdRoll < 0.05) {
      const idx = chooseFreeIndex();
      if (idx !== null) {
        stoneIndex = idx;
        stonePresent = true;
      }
    }
  }

  buildGrid(gridSize);
  redrawBoard();
  redrawLives();
  redrawScore();
});

