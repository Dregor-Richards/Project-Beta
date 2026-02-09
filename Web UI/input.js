async function handleMove(event) {
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

  const enemyIndex = enemies.indexOf(next);
  if (enemyIndex !== -1) {
    enemies.splice(enemyIndex, 1);
    addScore(hasTripleEnemyTurns ? 2 : 1);
  }

  const fastIndex = fastEnemies.indexOf(next);
  if (fastIndex !== -1) {
    fastEnemies.splice(fastIndex, 1);
    addScore(hasTripleEnemyTurns ? 4 : 2);
  }

  if (next === heartIndex) {
    if (lives < 3) {
      lives += 1;
      sessionStorage.setItem('playerLives', String(lives));
      redrawLives();
    }
    heartIndex = null;
  }

  // Wand pickup
  if (next === wandIndex && currentWandSubtype) {
    pickupWand(currentWandSubtype);
    wandIndex = null;
    currentWandSubtype = null;
  }

  // Wyrd Stone pickup
  if (next === stoneIndex && stonePresent) {
    pickupStone();
    stoneIndex = null;
    stonePresent = false;
  }

  const steppingOntoSkipTile = (next === skipTileIndex);

  avatarIndex = next;
  redrawBoard();

  checkForWin();

  if (playerDead || allEnemiesDead()) return;

  // If we stepped on the skip tile, we force enemies to move now,
  // regardless of Lightning, and consume the rest of this “turn”.
  if (steppingOntoSkipTile) {
    movesThisTurn = 0; // reset
    await endPlayerTurn({ allowLightning: true });
    // Plus your extra penalty turn logic if you keep it:
    if (!playerDead && !allEnemiesDead()) {
      await endPlayerTurn({ allowLightning: true });
    }
    return;
  }

  // Normal (non-skip) tile
  movesThisTurn += 1;

  if (hasDoubleMove && movesThisTurn < 2) {
    // Lightning active: player gets a second move before enemies.
    // Do NOT call endPlayerTurn yet.
    return;
  }

  // Either Lightning not active, or this was the second Lightning move.
  // Enemies get their turn now.
  movesThisTurn = 0;
  await endPlayerTurn({ allowLightning: true });

}

function toggleInventory() {
  const inv = document.getElementById('inventory-panel'); // use your actual id
  if (!inv) return;
  inv.classList.toggle('hidden');
}

function getInventoryItemName(item) {
  if (!item) return '';
  if (item.type === 'wand') {
    if (item.subtype === 'ice') return 'Ice Wand';
    if (item.subtype === 'fire') return 'Fire Wand';
    if (item.subtype === 'lightning') return 'Lightning Wand';
    return 'Wand';
  }
  if (item.type === 'wyrd_stone') {
    return 'Wyrd Stone';
  }
  return 'Item';
}


window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', handleMove);

  const grid = document.getElementById('level-grid');
  grid.addEventListener('click', handleGridClick);

  const wyrdModal = document.getElementById('wyrd-modal');
  const wyrdConfirmBtn = document.getElementById('wyrd-confirm');
  const wyrdCancelBtn = document.getElementById('wyrd-cancel');

  const tooltip = document.getElementById('inventory-tooltip');

  // Inventory slots: click + tooltip
  document.querySelectorAll('.inventory-slot').forEach((slot, index) => {
    // CLICK: wand toggle or Wyrd Stone modal
    slot.addEventListener('click', () => {
      const item = inventory[index];
      if (!item) return;

      // --- WANDS: toggle selection ---
      if (item.type === 'wand') {
        const isSameWand =
          armedItem &&
          armedItem.type === 'wand' &&
          armedItem.slotIndex === index;

        if (isSameWand) {
          // Second click on same wand: unselect
          armedItem = null;
        } else {
          // Select this wand
          armedItem = {
            type: 'wand',
            subtype: item.subtype,
            slotIndex: index
          };
        }

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle(
              'inventory-selected',
              !!armedItem &&
                armedItem.type === 'wand' &&
                i === armedItem.slotIndex
            );
          });

        return;
      }

      // --- WYRD STONE: open confirm modal, no toggle ---
      if (item.type === 'wyrd_stone') {
        armedItem = { type: 'wyrd_stone', slotIndex: index };

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle(
              'inventory-selected',
              i === index
            );
          });

        wyrdModal.classList.remove('hidden');
        return;
      }

      // Other item types (if any) ignored for now
    });

    // TOOLTIP: show on hover
    slot.addEventListener('mouseenter', () => {
      const item = inventory[index];
      if (!item) return;

      const name = getInventoryItemName(item);
      if (!name) return;

      tooltip.textContent = name;
      tooltip.classList.remove('hidden');
    });

    // TOOLTIP: follow cursor
    slot.addEventListener('mousemove', (e) => {
      if (tooltip.classList.contains('hidden')) return;
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
    });

    // TOOLTIP: hide on leave
    slot.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  });

  // Confirm Wyrd Stone
  if (wyrdConfirmBtn) {
    wyrdConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'wyrd_stone') {
        wyrdModal.classList.add('hidden');
        return;
      }

      hasTripleEnemyTurns = true;

      const slotIndex = armedItem.slotIndex;
      const item = inventory[slotIndex];
      if (item && item.type === 'wyrd_stone') {
        item.count -= 1;
        if (item.count <= 0) {
          inventory[slotIndex] = null;
        }
      }

      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));

      wyrdModal.classList.add('hidden');
    });
  }

  // Cancel Wyrd Stone
  if (wyrdCancelBtn) {
    wyrdCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      wyrdModal.classList.add('hidden');
    });
  }
});


function handleGridClick(event) {
  if (!armedItem) return;

  const cell = event.target.closest('.grid-cell');
  if (!cell) return;

  const tileIndex = Number(cell.dataset.index);

  // Wands
  if (armedItem.type === 'wand') {
    if (armedItem.subtype === 'ice') {
      // Freeze tile: must contain enemy
      const hasNormal = enemies.includes(tileIndex);
      const hasFast = fastEnemies.includes(tileIndex);
      if (!hasNormal && !hasFast) return;

      frozenEnemyTiles.add(tileIndex);
      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));
      return;
    }

    if (armedItem.subtype === 'fire') {
      // Fire: click enemy to destroy, award score, then check for win
      let removed = false;

      const normalIndex = enemies.indexOf(tileIndex);
      if (normalIndex !== -1) {
        enemies.splice(normalIndex, 1);
        addScore(hasTripleEnemyTurns ? 2 : 1);
        removed = true;
      } else {
        const fastIndex = fastEnemies.indexOf(tileIndex);
        if (fastIndex !== -1) {
          fastEnemies.splice(fastIndex, 1);
          addScore(hasTripleEnemyTurns ? 4 : 2);
          removed = true;
        }
      }

      if (!removed) return; // must click an enemy tile

      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));

      redrawBoard();
      checkForWin(); // handles “standing on door” case
      return;
    }

    if (armedItem.subtype === 'lightning') {
      // Lightning: must click self; grants double-move buff
      if (tileIndex !== avatarIndex) return;

      hasDoubleMove = true;
      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));
      return;
    }

    return;
  }

    armedItem = null;
    clearInventorySelection();
    renderInventory();
    sessionStorage.setItem('inventory', JSON.stringify(inventory));
    return;
}

function consumeWandCharge(slotIndex) {
  const item = inventory[slotIndex];
  if (item && item.type === 'wand') {
    item.count -= 1;
    if (item.count <= 0) {
      inventory[slotIndex] = null;
    }
  }
}

function clearInventorySelection() {
  document.querySelectorAll('.inventory-slot')
    .forEach(s => s.classList.remove('inventory-selected'));
}
