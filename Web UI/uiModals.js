// =================== Glossary ===================

const GLOSSARY_ITEMS = [
  {
    id: 'player',
    title: 'YOU',
    iconClass: 'avatar',
    description: 'You. Likely vital to keep safe, but who knows. Thrice may you be struck, before the floors turn crimson.'
  },
  {
    id: 'door',
    title: 'The Door',
    iconClass: 'door',
    description: 'Reach the door, once all foes have been slain, to delve deeper into these expansive dungeons.'
  },
  {
    id: 'skip',
    title: 'Sand Vortex',
    iconClass: 'skip-tile',
    description: 'This oddity of reality will cause time to move on without you, effectively delaying your movement for a turn. Now why would you want to use this...?'
  },
  {
    id: 'enemy_normal',
    title: 'Skeleton',
    iconClass: 'enemy',
    description: 'Yes, a skeleton. It just looks like a square. Moves one tile per turn. Deals damage if it bumps into you. STAY AWAY.'
  },
  {
    id: 'enemy_fast',
    title: 'Bat',
    iconClass: 'fast-enemy',
    description: 'You should spend less time thinking about the shape, and more time on how you plan to avoid it. This beast can move up to 3 tiles a turn, if it feels like it. And yes, it bites.'
  },
  {
    id: 'heart',
    title: 'Gold Heart',
    iconClass: 'glossary-heart',
    description: 'The one who came with this, surely does not need it any longer. Use its vigor to restore a missing life, if you have been unfortunate enough to lose one.'
  },
  {
    id: 'fire_wand',
    title: 'Fire Wand',
    iconClass: 'inventory-fire-wand',
    description: 'A simple twig of [wood-type here], capable of a single casting. Just point and shoot, so that the denizens of this sprawl shall know your fury.'
  },
  {
    id: 'ice_wand',
    title: 'Ice Wand',
    iconClass: 'inventory-ice-wand',
    description: 'Whatever wood this once was made of, has long since departed. Now only frost remains, and its lethality is minimal. But still, it may prove to slow your foes, for a time.'
  },
  {
    id: 'lightning_wand',
    title: 'Lightning Wand',
    iconClass: 'inventory-lightning-wand',
    description: 'Despite common sense, you will be aiming this one at yourself. It shall spark your heart, and add a spring to your step. For every stride you used to take, you will find you can take another.'
  },
  {
    id: 'wyrd_stone',
    title: 'Wyrd Stone',
    iconClass: 'inventory-wyrd-stone',
    description: 'A physical manifestation of the tether between body and soul. Offer it up as a challenge, and you will find your foes enthralled in frenzy. Their strides will be doubled, but so will your rewards for slaying them.'
  }
];

const GLOSSARY_PAGE_SIZE = 5;
let glossaryPage = 0;

function renderGlossaryPage() {
  const grid = document.getElementById('glossary-grid');
  const indicator = document.getElementById('glossary-page-indicator');
  if (!grid || !indicator) return;

  grid.innerHTML = '';

  const start = glossaryPage * GLOSSARY_PAGE_SIZE;
  const end = Math.min(start + GLOSSARY_PAGE_SIZE, GLOSSARY_ITEMS.length);
  const items = GLOSSARY_ITEMS.slice(start, end);

  items.forEach(item => {
    // Left icon cell
    const iconCell = document.createElement('div');
    iconCell.className = 'glossary-icon-cell';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'glossary-icon-wrapper';

    const icon = document.createElement('div');
    icon.className = item.iconClass + ' glossary-icon-inner';

    iconWrapper.appendChild(icon);
    iconCell.appendChild(iconWrapper);

    // Right text cell
    const textCell = document.createElement('div');
    textCell.className = 'glossary-text-cell';

    const titleEl = document.createElement('div');
    titleEl.className = 'glossary-item-title';
    titleEl.textContent = item.title;

    const descEl = document.createElement('div');
    descEl.className = 'glossary-item-desc';
    descEl.textContent = item.description;

    textCell.appendChild(titleEl);
    textCell.appendChild(descEl);

    grid.appendChild(iconCell);
    grid.appendChild(textCell);
  });

  const totalPages = Math.ceil(GLOSSARY_ITEMS.length / GLOSSARY_PAGE_SIZE);
  indicator.textContent = `Page ${glossaryPage + 1} of ${totalPages}`;
}

function openGlossary() {
  const modal = document.getElementById('glossary-modal');
  if (!modal) return;
  glossaryPage = 0;
  renderGlossaryPage();
  modal.classList.remove('hidden');
}

function closeGlossary() {
  const modal = document.getElementById('glossary-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

// =================== Modal wiring ===================

window.addEventListener('DOMContentLoaded', () => {
  // Controls / Instructions modals
  const controlButton = document.querySelector('.control-button');
  const instructionsButton = document.querySelector('.instructions-button');
  const controlModal = document.getElementById('control-modal');
  const instructionsModal = document.getElementById('instructions-modal');
  const controlOk = document.getElementById('control-ok');
  const instructionsOk = document.getElementById('instructions-ok');

  if (controlButton && controlModal && controlOk) {
    controlButton.addEventListener('click', () => {
      controlModal.classList.remove('hidden');
    });

    controlOk.addEventListener('click', () => {
      controlModal.classList.add('hidden');
    });
  }

  if (instructionsButton && instructionsModal && instructionsOk) {
    instructionsButton.addEventListener('click', () => {
      instructionsModal.classList.remove('hidden');
    });

    instructionsOk.addEventListener('click', () => {
      instructionsModal.classList.add('hidden');
    });
  }

  // Escape closes control/instructions modals if open
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    let closed = false;

    if (controlModal && !controlModal.classList.contains('hidden')) {
      controlModal.classList.add('hidden');
      closed = true;
    }

    if (instructionsModal && !instructionsModal.classList.contains('hidden')) {
      instructionsModal.classList.add('hidden');
      closed = true;
    }

    if (closed) {
      event.preventDefault();
    }
  });

  // Menu modal
  const menuModal = document.getElementById('menu-modal');
  const menuYes = document.getElementById('menu-yes');
  const menuNo = document.getElementById('menu-no');

  if (menuYes && menuModal) {
    menuYes.addEventListener('click', () => {
      sessionStorage.removeItem('playerLives');
      sessionStorage.removeItem('playerScore');
      sessionStorage.removeItem('currentLevel');

      inventory = new Array(21).fill(null);
      iceWandIndex = null;
      frozenEnemyTiles = new Set();
      sessionStorage.removeItem('inventory');

      window.location.href = 'index.html';
    });
  }

  if (menuNo && menuModal) {
    menuNo.addEventListener('click', () => {
      menuModal.classList.add('hidden');
    });
  }

  // ===== Death + High Score =====

  const deathModal = document.getElementById('death-modal');
  const deathOk = document.getElementById('death-ok');

  const highscoreModal = document.getElementById('highscore-modal');
  const highscoreNameInput = document.getElementById('highscore-name');
  const highscoreSaveBtn = document.getElementById('highscore-save');
  const highscoreSkipBtn = document.getElementById('highscore-skip');

  // Enter key triggers highscore save
  if (highscoreNameInput && highscoreSaveBtn) {
    highscoreNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        highscoreSaveBtn.click();
      }
    });
  }

  // Single definition of showDeathModal
  window.showDeathModal = function () {
    deathOpen = true;
    if (deathModal) {
      deathModal.classList.remove('hidden');
    }

    if (highscoreModal && highscoreNameInput && typeof wouldBeHighScore === 'function') {
      if (wouldBeHighScore(score)) {
        highscoreModal.classList.remove('hidden');
        highscoreNameInput.value = '';
        highscoreNameInput.focus();

        uiInputLocked = true;
      }
    }
  };

  function finishAndReturnToMenu() {
    sessionStorage.removeItem('playerLives');
    sessionStorage.removeItem('playerScore');
    sessionStorage.removeItem('currentLevel');

    inventory = new Array(21).fill(null);
    iceWandIndex = null;
    frozenEnemyTiles = new Set();
    sessionStorage.removeItem('inventory');

    window.location.href = 'index.html';
  }

  function handlePostDeath() {
    // If highscore modal is visible, wait for Save/Skip instead
    if (highscoreModal && !highscoreModal.classList.contains('hidden')) {
      return;
    }
    finishAndReturnToMenu();
  }

  if (deathOk) {
    deathOk.addEventListener('click', () => {
      handlePostDeath();
    });
  }

  if (highscoreSaveBtn) {
    highscoreSaveBtn.addEventListener('click', () => {
      const name = highscoreNameInput.value.trim() || 'Unknown';
      if (typeof submitHighScore === 'function') {
        submitHighScore(name, score);
      }
      highscoreModal.classList.add('hidden');
      uiInputLocked = false;
      finishAndReturnToMenu();
    });
  }

  if (highscoreSkipBtn) {
    highscoreSkipBtn.addEventListener('click', () => {
      highscoreModal.classList.add('hidden');
      uiInputLocked = false;
      finishAndReturnToMenu();
    });
  }

  // ===== Win modal =====

  const winModal = document.getElementById('win-modal');
  const winNext = document.getElementById('win-next');
  const winMenu = document.getElementById('win-menu');

  if (winNext) {
    winNext.addEventListener('click', () => {
      const nextSize = Math.min(20, gridSize + 1);
      const nextLevel = levelNumber + 1;
      sessionStorage.setItem('currentLevel', String(nextLevel));
      window.location.href = 'level.html?size=' + nextSize;
    });
  }

  if (winMenu && winModal) {
    winMenu.addEventListener('click', () => {
      sessionStorage.removeItem('playerLives');
      sessionStorage.removeItem('playerScore');

      inventory = new Array(21).fill(null);
      iceWandIndex = null;
      frozenEnemyTiles = new Set();
      sessionStorage.removeItem('inventory');

      window.location.href = 'index.html';
    });
  }

  window.showWinModal = function () {
    winOpen = true;
    if (winModal) {
      winModal.classList.remove('hidden');
    }
  };

  // ===== Inventory panel wiring (click-based) =====

  const inventoryButton = document.querySelector('.inventory-button');
  const inventoryPanel = document.getElementById('inventory-panel');
  const inventoryClose = document.getElementById('inventory-close');

  if (inventoryButton && inventoryPanel) {
    inventoryButton.addEventListener('click', () => {
      inventoryPanel.classList.remove('hidden');
    });
  }

  if (inventoryClose && inventoryPanel) {
    inventoryClose.addEventListener('click', () => {
      inventoryPanel.classList.add('hidden');
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (inventoryPanel && !inventoryPanel.classList.contains('hidden')) {
      inventoryPanel.classList.add('hidden');
      event.preventDefault();
    }
  });

  // ===== Glossary wiring =====

  const glossaryButton = document.getElementById('glossary-button');
  const glossaryPrev = document.getElementById('glossary-prev');
  const glossaryNext = document.getElementById('glossary-next');
  const glossaryCloseBtn = document.getElementById('glossary-close');

  if (glossaryButton) {
    glossaryButton.addEventListener('click', openGlossary);
  }

  if (glossaryCloseBtn) {
    glossaryCloseBtn.addEventListener('click', closeGlossary);
  }

  if (glossaryPrev) {
    glossaryPrev.addEventListener('click', () => {
      if (glossaryPage > 0) {
        glossaryPage -= 1;
        renderGlossaryPage();
      }
    });
  }

  if (glossaryNext) {
    glossaryNext.addEventListener('click', () => {
      const maxPage = Math.ceil(GLOSSARY_ITEMS.length / GLOSSARY_PAGE_SIZE) - 1;
      if (glossaryPage < maxPage) {
        glossaryPage += 1;
        renderGlossaryPage();
      }
    });
  }
});
