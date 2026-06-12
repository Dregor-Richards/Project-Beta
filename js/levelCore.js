function resetPlayerInventoryAndEquipment() {
  inventory = new Array(21).fill(null);
  equippedRings = new Array(10).fill(null);
  equippedEquipment = {
    head: null,
    chest: null,
    legs: null,
    'hand-left': null,
    'hand-right': null,
  };

  // Clear any persisted state
  sessionStorage.removeItem('inventory');
  sessionStorage.removeItem('equippedRings');
  sessionStorage.removeItem('equippedEquipment');
}

function applyStartingItemInventory() {
  const startingItemId = sessionStorage.getItem('startingItemId');

  if (startingItemId === 'start_item_3') {
    pickupWand('fire');
    pickupWand('fire');
    pickupWand('fire');
  }

  if (startingItemId === 'start_item_1') {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: 'coin_pouch', count: 1 };
    }
    sessionStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
  }

  if (startingItemId === 'start_item_2') {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: 'door_key', count: 1 };
    }
    sessionStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
  }
}

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
  const atDoor = avatarIndex === doorIndex && !playerDead;

  const enemiesCleared = allEnemiesDead();
  const keyUnlocked = doorUnlockedByKey === true;

  if (atDoor && (enemiesCleared || keyUnlocked)) {
    spawnParticlesAtCell(doorIndex, 'door');

    const storedDifficulty = sessionStorage.getItem('currentDifficulty');
    const difficulty =
      storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;

    // Base 3 points, +2 for each full block of 10 difficulties
    const blocksOfTen = Math.floor((difficulty - 1) / 10);
    const winPoints = 3 + blocksOfTen * 2;

    addScore(winPoints);
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

// Calculates base enemy scores, for Coin Pouch
function getTotalEnemyBaseValue() {
  let total = 0;
  const NORMAL_VALUE = 1;
  const FAST_VALUE = 2;
  const TRACKER_VALUE = 2;
  const MORTAR_VALUE = 2;
  total += enemies.length * NORMAL_VALUE;
  total += fastEnemies.length * FAST_VALUE;
  total += trackerEnemies.length * TRACKER_VALUE;
  total += mortarEnemies.length * MORTAR_VALUE;
  return total;
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
  resetLevelState();
  resetDarkness();
  loadLevelNumber();
  doorUnlockedByKey = false;

  // Restore lives and score from previous levels
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
    } catch (e) {
      // bad data → leave inventory as whatever default was set
    }
  } else {
    // No inventory in sessionStorage → this is a fresh run.
    // Start from a clean 21-slot inventory and apply starting item.
    inventory = new Array(21).fill(null);
    applyStartingItemInventory();  // will give 3 Fire Wands for start_item_3
    // pickupWand inside applyStartingItemInventory will save inventory for later levels
  }


  // Matches upper-right avatar icon to chosen character
  const hudAvatar = document.getElementById('hud-avatar');
  if (!hudAvatar) return;
  const idx = (typeof getSelectedAvatarIndex === 'function')
    ? getSelectedAvatarIndex()
    : 0;
  const classes = ['hud-avatar1', 'hud-avatar2', 'hud-avatar3', 'hud-avatar4', 'hud-avatar5', 'hud-avatar6', 'hud-avatar7', 'hud-avatar8'];
  hudAvatar.classList.remove(...classes);
  hudAvatar.classList.add(`hud-avatar${idx + 1}`);

  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  let difficulty = storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;
  if (difficulty < 1) difficulty = 1;

  const diffEl = document.getElementById('difficulty-text');
  if (diffEl) {
    diffEl.textContent = `Difficulty: ${difficulty}`;
  }

  // Decide music BEFORE we branch into boss vs normal
  if (difficulty >= 10 && difficulty % 10 === 0) {
    // Boss floors: play boss track
    playBossMusic();
  } else {
    // Normal / post-boss / endless: regular level track
    playLevelMusic();
  }

  // Boss level: skip normal config and use custom setup
  if (difficulty >= 10 && difficulty % 10 === 0) {
    initDarkness(0, []);
    setupBossLevelA();
  } else {
    // Normal / post-boss / endless
    const config = getDifficultyConfig(difficulty);

    gridSize = config.gridSize;

    // Default spawn in lower-left row
    avatarIndex = gridSize * gridSize - gridSize + 1;

    // Corner indices for lantern/brazier (assuming 1-based indexing)
    const bottomLeft = gridSize * gridSize - gridSize + 1;
    const bottomRight = gridSize * gridSize;
    const topLeft = 1;
    const topRight = gridSize;
    initDarkness(difficulty, [bottomLeft, bottomRight, topRight, topLeft]);

    placeNormalEnemies(config.normalCount);
    placeFastEnemies(config.fastCount);
    placeTrackerEnemies(config.trackerCount);
    placeMortarEnemies(config.mortarCount);
    // placeSummonerEnemies(config.summonerCount);
    // placeBeamerEnemies(config.beamerCount);

    doorIndex = chooseDoorIndex();

    if (shouldSpawnHeart()) {
      heartIndex = chooseHeartIndex();
    } else {
      heartIndex = null;
    }

    skipTileIndex = chooseSkipTileIndex();

    let spawnChest = false;

    // First: guaranteed 6th-level rule
    if (shouldSpawnChest()) {
      spawnChest = true;
    } else {
      // Only apply Ring of Chests on non-6th levels
      const bonusChance = getExtraChestChanceFromRings();
      if (bonusChance > 0 && Math.random() < bonusChance) {
        spawnChest = true;
      }
    }

    if (spawnChest) {
      chestIndex = chooseFreeIndex();
      chestOpened = false;

      // 25% chance to spawn mimic chest, etc. (your existing code)
      if (Math.random() < 0.25) {
        mimicChestIndex = chooseFreeIndex();
      } else {
        mimicChestIndex = null;
      }

      mimicActive = false;
      mimicIndex = null;
      mimicHealth = 0;
      mimicPhase = 0;
    } else {
      chestIndex = null;
      chestOpened = false;

      mimicChestIndex = null;
      mimicActive = false;
      mimicIndex = null;
      mimicHealth = 0;
      mimicPhase = 0;
    }

    wandsOnBoard = [];
    // If this difficulty guarantees a wand, place one first
    if (config.guaranteeWand) {
      const guaranteedIdx = chooseWandIndex();
      if (guaranteedIdx !== null) {
        const guaranteedSubtype = chooseWandFromTier(0); // Tier 0: pre-boss pool
        if (guaranteedSubtype) {
          wandsOnBoard.push({ index: guaranteedIdx, subtype: guaranteedSubtype });
        }
      }
    }
    const wandRolls = 2;
    for (let i = 0; i < wandRolls; i++) {
      if (shouldSpawnWand()) {
        const idx = chooseWandIndex();
        if (idx !== null) {
          // For now, all random wands come from Tier 1
          const subtype = chooseWandFromTier(1);
          if (subtype) {
            wandsOnBoard.push({ index: idx, subtype });
          }
        }
      }
    }

    placeStoneForConfig(config);
    // Per-level equipment procs
    maybeGrantBookOfWandsReward();
    maybeGrantBookOfStonesReward();

    // DO THIS LAST OUT OF PLACEMENTS
    placeWallsWithConnectivity(gridSize, config.wallPercent);
    
    buildGrid(gridSize);

    // If dark level and full-dark not yet active, add global overlay
    if (isDarkLevel) {
      const wrapper = document.querySelector('.level-viewport');
      if (wrapper) {
        const existing = wrapper.querySelector('.level-dark-overlay');
        if (!existing) {
          const overlay = document.createElement('div');
          overlay.className = 'level-dark-overlay';
          wrapper.appendChild(overlay);
        }
      }
    }

    redrawBoard();
  }

  redrawLives();
  redrawScore();
  renderInventory();
  renderJewelry();
});