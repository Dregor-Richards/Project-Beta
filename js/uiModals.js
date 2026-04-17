function showMenuConfirm() {
  const menuModal = document.getElementById('menu-modal');
  if (menuModal) {
    menuModal.classList.remove('hidden');
    playSfx('uiClick');
  }
}

function resetRunAndGoToMenu() {
  sessionStorage.removeItem('playerLives');
  sessionStorage.removeItem('playerScore');
  sessionStorage.removeItem('currentLevel');
  sessionStorage.removeItem('inventory');
  sessionStorage.removeItem('pbo_usedCheats');

  inventory = new Array(21).fill(null);
  iceWandIndex = null;
  frozenEnemyTiles = new Set();
  blockedMortarTiles = new Set();

  // NEW: clear equipped rings/equipment and their persisted state
  equippedRings = new Array(10).fill(null);
  equippedEquipment = {
    head: null,
    chest: null,
    legs: null,
    'hand-left': null,
    'hand-right': null,
  };
  sessionStorage.removeItem('equippedRings');
  sessionStorage.removeItem('equippedEquipment');

  window.location.href = '../index.html';
}

let pendingRingChoices = null;
let onRingChoiceComplete = null;

function openRingChoiceModal(rings, onComplete) {
  pendingRingChoices = rings;
  onRingChoiceComplete = onComplete || null;

  const modal = document.getElementById('ring-choice-modal');
  const optionsContainer = document.getElementById('ring-choice-options');
  if (!modal || !optionsContainer) return;

  optionsContainer.innerHTML = '';

  rings.forEach((ring, index) => {
    const card = document.createElement('div');
    card.className = 'ring-choice-card';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'ring-choice-icon-wrapper';

    const iconInner = document.createElement('div');
    iconInner.className = `ring-choice-icon ${ring.iconClass}`;
    iconWrapper.appendChild(iconInner);

    const titleEl = document.createElement('h3');
    titleEl.className = 'ring-choice-title';
    titleEl.textContent = ring.title;

    const descEl = document.createElement('p');
    descEl.className = 'ring-choice-desc';
    descEl.textContent = ring.description;

    const button = document.createElement('button');
    button.className = 'modal-ok-button ring-choice-button';
    button.textContent = 'Choose';
    button.addEventListener('click', () => {
      playSfx('selectLoot');
      handleRingChosen(index);
    });

    card.appendChild(iconWrapper);
    card.appendChild(titleEl);
    card.appendChild(descEl);
    card.appendChild(button);

    optionsContainer.appendChild(card);
  });

  modal.classList.remove('hidden');
}

function closeRingChoiceModal() {
  const modal = document.getElementById('ring-choice-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  pendingRingChoices = null;
}

function handleRingChosen(index) {
  if (!pendingRingChoices || index < 0 || index >= pendingRingChoices.length) {
    closeRingChoiceModal();
    if (onRingChoiceComplete) onRingChoiceComplete();
    return;
  }

  const chosenRing = pendingRingChoices[index];

  const item = makeRingInventoryItem(chosenRing);
  addItemToInventory(item);
  playSfx('selectLoot');

  closeRingChoiceModal();

  if (onRingChoiceComplete) {
    onRingChoiceComplete();
  }
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

  const selectedIndex = sessionStorage.getItem('selectedAvatarIndex');
  const avatarIndex = selectedIndex != null ? Number(selectedIndex) || 0 : 0;
  const currentAvatarId = `avatar${avatarIndex + 1}`;

  if (controlButton && controlModal && controlOk) {
    controlButton.addEventListener('click', () => {
      controlModal.classList.remove('hidden');
      playSfx('uiClick');
    });

    controlOk.addEventListener('click', () => {
      controlModal.classList.add('hidden');
      playSfx('uiCancel');
    });
  }

  if (instructionsButton && instructionsModal && instructionsOk) {
    instructionsButton.addEventListener('click', () => {
      instructionsModal.classList.remove('hidden');
      playSfx('uiClick');
    });

    instructionsOk.addEventListener('click', () => {
      instructionsModal.classList.add('hidden');
      playSfx('uiClick');
    });
  }

  // Escape closes control/instructions modals if open
  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;
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
      playSfx('uiCancel');
      event.preventDefault();
    }
  });

  // Menu modal
  const menuModal = document.getElementById('menu-modal');
  const menuYes = document.getElementById('menu-yes');
  const menuNo = document.getElementById('menu-no');

  if (menuYes && menuModal) {
    menuYes.addEventListener('click', () => {
      playSfx('uiConfirm');
      setTimeout(() => {
        resetRunAndGoToMenu();
      }, 250);
    });
  }

  if (menuNo && menuModal) {
    menuNo.addEventListener('click', () => {
      menuModal.classList.add('hidden');
      playSfx('uiCancel');
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
          // Skip highscore modal entirely if cheats were used
      if (typeof hasUsedCheatsThisRun === 'function' && hasUsedCheatsThisRun()) {
        return; // just show death modal, no HS dialog
      }
      if (wouldBeHighScore(score)) {
        highscoreModal.classList.remove('hidden');
        highscoreNameInput.value = '';
        highscoreNameInput.focus();

        uiInputLocked = true;
      }
    }
  };

  const deathPlayAgain = document.getElementById('death-play-again');

  if (deathPlayAgain) {
    deathPlayAgain.addEventListener('click', () => {
      playSfx('uiConfirm');

      const base = sessionStorage.getItem('baseDifficulty');
      if (base !== null) {
        sessionStorage.setItem('currentDifficulty', base);
      }

      // Clear run-specific state
      sessionStorage.removeItem('playerLives');
      sessionStorage.removeItem('playerScore');
      sessionStorage.removeItem('inventory');
      sessionStorage.removeItem('pbo_usedCheats');
      resetLevelNumber();

      // NEW: clear equipped items for a truly fresh run
      equippedRings = new Array(10).fill(null);
      equippedEquipment = {
        head: null,
        chest: null,
        legs: null,
        'hand-left': null,
        'hand-right': null,
      };
      sessionStorage.removeItem('equippedRings');
      sessionStorage.removeItem('equippedEquipment');

      // NEW: reapply starting item penalty for the new run
      const penalty =
        Number(sessionStorage.getItem('startingItemScorePenalty')) || 0;
      const initialScore = 0 + penalty;
      sessionStorage.setItem('playerScore', String(initialScore));

      setTimeout(() => {
        window.location.href = 'level.html';
      }, 250);
    });
  }

  function finishAndReturnToMenu() {
    setTimeout(() => {
      resetRunAndGoToMenu();
    }, 250);
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
      playSfx('uiCancel');
      handlePostDeath();
    });
  }

    // F key → Play Again when death modal is visible
  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;
    if (event.key !== 'f' && event.key !== 'F') return;
    if (!deathModal || deathModal.classList.contains('hidden')) return;

    // Avoid firing if highscore modal is up and waiting for input
    if (highscoreModal && !highscoreModal.classList.contains('hidden')) return;

    if (deathPlayAgain) {
      event.preventDefault();
      deathPlayAgain.click();
    }
  });

  if (highscoreSaveBtn) {
    highscoreSaveBtn.addEventListener('click', () => {
      if (typeof hasUsedCheatsThisRun === 'function' && hasUsedCheatsThisRun()) {
        // Just bail out to menu without saving
        highscoreModal.classList.add('hidden');
        uiInputLocked = false;
        playSfx('uiCancel');
        finishAndReturnToMenu();
        return;
      }

      const name = highscoreNameInput.value.trim() || 'Unknown';
      if (typeof submitHighScore === 'function') {
        submitHighScore(name, score, currentAvatarId);
      }
      highscoreModal.classList.add('hidden');
      uiInputLocked = false;
      playSfx('uiConfirm');
      finishAndReturnToMenu();
    });
  }

  if (highscoreSkipBtn) {
    highscoreSkipBtn.addEventListener('click', () => {
      highscoreModal.classList.add('hidden');
      uiInputLocked = false;
      playSfx('uiCancel');
      finishAndReturnToMenu();
    });
  }

  // ===== Win modal =====

  const winModal = document.getElementById('win-modal');
  const winNext = document.getElementById('win-next');
  const winMenu = document.getElementById('win-menu');

  if (winNext) {
    winNext.addEventListener('click', () => {
      playSfx('uiConfirm');
      setTimeout(() => {
        const rawDiff = sessionStorage.getItem('currentDifficulty');
        let difficulty = rawDiff !== null ? Number(rawDiff) || 1 : 1;
        difficulty += 1;
        sessionStorage.setItem('currentDifficulty', String(difficulty));

        resetLevelState();
        advanceLevel();
        window.location.href = 'level.html';
      }, 250);
    });
  }

  if (winMenu && winModal) {
    winMenu.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        resetRunAndGoToMenu();
      }, 250);
    });
  }

  window.showWinModal = function () {
    winOpen = true;
    canPlayerMove = false;
    if (winModal) {
      winModal.classList.remove('hidden');
    }
  };

  // Win modal keyboard shortcut: E / Enter → Press Onward
  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;
    if (!winModal || winModal.classList.contains('hidden')) return;
    if (event.key === 'Enter' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      if (winNext) {
        winNext.click();
      }
    }
  });

  // ===== Inventory panel wiring (click-based) =====

  const inventoryButton = document.querySelector('.inventory-button');
  const inventoryPanel = document.getElementById('inventory-panel');
  const inventoryClose = document.getElementById('inventory-close');

  if (inventoryButton && inventoryPanel) {
    inventoryButton.addEventListener('click', () => {
      inventoryPanel.classList.remove('hidden');
      playSfx('uiInventory');
    });
  }

  if (inventoryClose && inventoryPanel) {
    inventoryClose.addEventListener('click', () => {
      inventoryPanel.classList.add('hidden');
      playSfx('uiInventory');
    });
  }

  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;
    if (event.key !== 'Escape') return;
    if (inventoryPanel && !inventoryPanel.classList.contains('hidden')) {
      inventoryPanel.classList.add('hidden');
      playSfx('uiInventory');
      event.preventDefault();
    }
  });

  // ===== Glossary wiring =====

  const glossaryButton = document.getElementById('glossary-button');
  const glossaryPrev = document.getElementById('glossary-prev');
  const glossaryNext = document.getElementById('glossary-next');
  const glossaryCloseBtn = document.getElementById('glossary-close');

  if (glossaryButton) {
    glossaryButton.addEventListener('click', () => {
      openGlossary();
      playSfx('uiGlossary');
    });
  }

  if (glossaryCloseBtn) {
    glossaryCloseBtn.addEventListener('click', () => {
      closeGlossary();
      playSfx('uiGlossary');
    });
  }

  // G key → toggle glossary (same behavior as the buttons)
  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;

    // NEW: if user is typing into any input/textarea, let the key go to that field
    const active = document.activeElement;
    const isTypingField =
      active &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    if (isTypingField) return;

    if (event.key !== 'g' && event.key !== 'G') return;

    // If the highscore name input is focused, ignore G so the user can type it
    if (document.activeElement === highscoreNameInput) {
      return;
    }

    const glossaryPanel = document.getElementById('glossary-modal');
    if (!glossaryPanel) return;

    const isOpen = !glossaryPanel.classList.contains('hidden');

    if (isOpen) {
      closeGlossary();
    } else {
      openGlossary();
    }

    playSfx('uiGlossary');
    event.preventDefault();
  });

    // T key → cycle glossary type while glossary is open
    window.addEventListener('keydown', (event) => {
      if (window.cheatConsoleOpen) return;
      const key = event.key;
      if (key !== 't' && key !== 'T') return;

      const glossaryPanel = document.getElementById('glossary-modal');
      if (!glossaryPanel || glossaryPanel.classList.contains('hidden')) return;

      if (typeof getCurrentGlossaryConfig !== 'function') {
        return;
      }

      if (currentGlossaryType === GLOSSARY_TYPES.MAIN) {
        currentGlossaryType = GLOSSARY_TYPES.BOSS;
      } else if (currentGlossaryType === GLOSSARY_TYPES.BOSS) {
        currentGlossaryType = GLOSSARY_TYPES.EQUIPMENT;
      } else {
        currentGlossaryType = GLOSSARY_TYPES.MAIN;
      }

      glossaryPage = 0;
      renderGlossaryPage();
      playSfx('uiGlossary');
      event.preventDefault();
    });

  const glossaryTypeBtn = document.getElementById('glossary-type-button');
  if (glossaryTypeBtn) {
    glossaryTypeBtn.addEventListener('click', () => {
      if (currentGlossaryType === GLOSSARY_TYPES.MAIN) {
        currentGlossaryType = GLOSSARY_TYPES.BOSS;
      } else if (currentGlossaryType === GLOSSARY_TYPES.BOSS) {
        currentGlossaryType = GLOSSARY_TYPES.EQUIPMENT;
      } else {
        currentGlossaryType = GLOSSARY_TYPES.MAIN;
      }
      glossaryPage = 0;
      renderGlossaryPage();
      playSfx('uiGlossary');
    });
  }

  if (glossaryPrev) {
    glossaryPrev.addEventListener('click', () => {
      const { items, pageSize } = getCurrentGlossaryConfig();
      const maxPage = Math.ceil(items.length / pageSize) - 1;
      glossaryPage = (glossaryPage - 1 + (maxPage + 1)) % (maxPage + 1);
      renderGlossaryPage();
      playSfx('uiGlossary');
    });
  }

  if (glossaryNext) {
    glossaryNext.addEventListener('click', () => {
      const { items, pageSize } = getCurrentGlossaryConfig();
      const maxPage = Math.ceil(items.length / pageSize) - 1;
      glossaryPage = (glossaryPage + 1) % (maxPage + 1);
      renderGlossaryPage();
      playSfx('uiGlossary');
    });
  }

  window.addEventListener('keydown', (event) => {
    if (window.cheatConsoleOpen) return;
    const key = event.key;
    if (key !== 'e' && key !== 'E' && key !== 'q' && key !== 'Q') return;

    const glossaryPanel = document.getElementById('glossary-modal');
    if (!glossaryPanel || glossaryPanel.classList.contains('hidden')) return;

    const { items, pageSize } = getCurrentGlossaryConfig();
    const maxPage = Math.ceil(items.length / pageSize) - 1;

    if (key === 'e' || key === 'E') {
      glossaryPage = (glossaryPage + 1) % (maxPage + 1);
    } else {
      glossaryPage = (glossaryPage - 1 + (maxPage + 1)) % (maxPage + 1);
    }

    renderGlossaryPage();
    playSfx('uiGlossary');
    event.preventDefault();
  });


});
