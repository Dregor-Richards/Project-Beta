// cheats.js
// Simple Tab-activated cheat console for Project Beta - Offline

let cheatConsoleOpen = false;

// Track which cheats have been used this run
let usedCheats = new Set();

// Load from sessionStorage in case we refresh mid-run
(function initUsedCheats() {
  try {
    const stored = sessionStorage.getItem('pbo_usedCheats');
    if (stored) {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr)) {
        usedCheats = new Set(arr);
      }
    }
  } catch (e) {
    usedCheats = new Set();
  }
})();

function markCheatUsed(code) {
  usedCheats.add(code);
  try {
    sessionStorage.setItem('pbo_usedCheats', JSON.stringify([...usedCheats]));
  } catch (e) {}
}

function openCheatConsole() {
  const consoleEl = document.getElementById('cheat-console');
  const inputEl = document.getElementById('cheat-input');
  if (!consoleEl || !inputEl) return;

  cheatConsoleOpen = true;
  consoleEl.classList.remove('hidden');
  inputEl.value = '';
  inputEl.focus();
}

function closeCheatConsole() {
  const consoleEl = document.getElementById('cheat-console');
  const inputEl = document.getElementById('cheat-input');
  if (!consoleEl || !inputEl) return;

  const raw = inputEl.value.trim();
  const code = raw.toLowerCase(); // normalize for matching

  if (code) {
    runCheatCode(code);
  }

  cheatConsoleOpen = false;
  consoleEl.classList.add('hidden');
  inputEl.blur();
}

// Central cheat dispatcher
function runCheatCode(rawCode) {
  const code = rawCode.toLowerCase();

  // Already used this cheat during this run → ignore
  if (usedCheats.has(code)) {
    return;
  }

  switch (code) {
    case 'aceofspades':
      cheatWinLevel();
      markCheatUsed(code);
      break;

    case 'ghostparty':
      cheatFillMapWithGhosts();
      markCheatUsed(code);
      break;

    case 'armorup':
      cheatPresetEquipment1();
      markCheatUsed(code);
      break;

    case 'dinlorknowledgeseeker':
      cheatGiveAllWands();
      markCheatUsed(code);
      break;

    default:
      // Unknown code; no action for now
      break;
  }
}

function hasUsedCheatsThisRun() {
  return usedCheats.size > 0;
}

// === Cheat handlers (empty templates for now) ===

// Instantly win the current level
function cheatWinLevel() {
  const rawDiff = sessionStorage.getItem('currentDifficulty');
  let difficulty = rawDiff !== null ? Number(rawDiff) || 1 : 1;
  difficulty += 1;
  sessionStorage.setItem('currentDifficulty', String(difficulty));
  resetLevelState();
  advanceLevel();
  window.location.href = 'level.html';
  // TODO: implement forced win (e.g., move avatar to door, clear enemies, then call checkForWin()).
}

// Fill the map with ghosts
function cheatFillMapWithGhosts() {
  // TODO: implement spawning a large number of normal enemies across the board.
  // Likely needs access to gridSize, avatarIndex, doorIndex, etc., then call redrawBoard().
}

// Give 1 of each wand to the player
function cheatPresetEquipment1() {
  // TODO: implement adding a full set of gear to the equipment tab, replacing former and filling empty.
}

// Give 1 of each Wand subtype to the player
function cheatGiveAllWands() {
  if (typeof pickupWand !== 'function') {
    return;
  }
  // Ensure inventory is initialized; in practice it already is on a level
  pickupWand('fire');
  pickupWand('ice');
  pickupWand('lightning');
  if (typeof renderInventory === 'function') {
    renderInventory();
  }
}


// === Global key handling for the cheat console ===

window.addEventListener('keydown', (e) => {
  // Tab toggles the cheat console
  if (e.key === 'Tab') {
    e.preventDefault(); // prevent default focus change
    if (cheatConsoleOpen) {
      closeCheatConsole();
    } else {
      openCheatConsole();
    }
    return;
  }
});