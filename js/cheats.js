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

    case 'minionsofthecolddark':
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

// === Cheat handlers ===

// Instantly win the current level
function cheatWinLevel() {
  const rawDiff = sessionStorage.getItem('currentDifficulty');
  let difficulty = rawDiff !== null ? Number(rawDiff) || 1 : 1;
  difficulty += 1;
  sessionStorage.setItem('currentDifficulty', String(difficulty));
  resetLevelState();
  advanceLevel();
  window.location.href = 'level.html';
}

// Fill the map with ghosts (normal enemies for now)
function cheatFillMapWithGhosts() {
  if (typeof redrawBoard !== 'function') return;
  const maxIndex = gridSize * gridSize;
  // Start from scratch: no existing enemies
  enemies = [];
  for (let tile = 1; tile <= maxIndex; tile++) {
    // Skip the avatar and any special / already‑occupied tiles
    if (tile === avatarIndex) continue;
    if (tile === doorIndex) continue;
    if (tile === chestIndex) continue;
    if (tile === skipTileIndex) continue;
    if (tile === heartIndex) continue;
    if (tile === wandIndex) continue;
    if (tile === stoneIndex) continue;

    if (tile === mimicIndex) continue;

    if (enemies.includes(tile)) continue;
    if (fastEnemies.includes(tile)) continue;
    if (trackerEnemies.includes(tile)) continue;
    if (mortarEnemies.includes(tile)) continue;

    enemies.push(tile); // Change this line when changing spawned enemy-type
  }
  redrawBoard();
}

function cheatPresetEquipment1() {
  // Safety: ensure helpers / globals exist
  if (typeof renderEquipment !== 'function') return;
  if (typeof EQUIP_POOL === 'undefined') return;
  if (typeof equippedEquipment === 'undefined') return;

  // Look up the specific equipment defs from the global pool
  const greavesDef = EQUIP_POOL.find(e => e.id === 'equip_dodge_pants') || null;
  const bookWandsDef = EQUIP_POOL.find(e => e.id === 'equip_book_of_wands') || null;
  const bookStonesDef = EQUIP_POOL.find(e => e.id === 'equip_book_of_stones') || null;

  // Clear all equipment slots first
  equippedEquipment.head = null;
  equippedEquipment.chest = null;
  equippedEquipment.legs = null;
  equippedEquipment['hand-left'] = null;
  equippedEquipment['hand-right'] = null;

  // Helper to turn a def into the actual equipped item payload
  function makeEquipItem(def) {
    // Mirror makeEquipmentInventoryItem’s shape so existing logic/tooltip works
    return {
      type: 'equipment',
      id: def.id,
      title: def.title,
      description: def.description,
      iconClass: def.iconClass,
      effect: def.effect,
      slotType: def.slotType,
    };
  }

  // Legs → Greaves of Dodging (if present)
  if (greavesDef) {
    equippedEquipment.legs = makeEquipItem(greavesDef);
  }

  // Left hand → Book of Wands
  if (bookWandsDef) {
    equippedEquipment['hand-left'] = makeEquipItem(bookWandsDef);
  }

  // Right hand → Book of Stones
  if (bookStonesDef) {
    equippedEquipment['hand-right'] = makeEquipItem(bookStonesDef);
  }

  // Persist and redraw
  sessionStorage.setItem('equippedEquipment', JSON.stringify(equippedEquipment));
  renderEquipment();
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