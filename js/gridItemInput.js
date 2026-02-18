function handleGridClick(event) {
  if (!armedItem) return;

  const cell = event.target.closest('.grid-cell');
  if (!cell) return;

  const tileIndex = Number(cell.dataset.index);

  // Wands
  if (armedItem.type === 'wand') {
    if (armedItem.subtype === 'ice') {
      const hasNormal = enemies.includes(tileIndex);
      const hasFast = fastEnemies.includes(tileIndex);
      if (!hasNormal && !hasFast) return;

      frozenEnemyTiles.add(tileIndex);

      redrawBoard();

      playSfx('useIceWand');
      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));
      return;
    }

    

    if (armedItem.subtype === 'fire') {
      let removed = false;

      // Normal
      const normalIndex = enemies.indexOf(tileIndex);
      if (normalIndex !== -1) {
        enemies.splice(normalIndex, 1);
        addScore(hasTripleEnemyTurns ? 2 : 1);
        spawnParticlesAtCell(tileIndex, 'kill');
        removed = true;
      } else {
        // Fast
        const fastIndex = fastEnemies.indexOf(tileIndex);
        if (fastIndex !== -1) {
          fastEnemies.splice(fastIndex, 1);
          addScore(hasTripleEnemyTurns ? 4 : 2);
          spawnParticlesAtCell(tileIndex, 'kill');
          removed = true;
        } else {
          // Tracker
          const trackerIndex = trackerEnemies.indexOf(tileIndex);
          if (trackerIndex !== -1) {
            trackerEnemies.splice(trackerIndex, 1);
            addScore(hasTripleEnemyTurns ? 2 : 1);
            spawnParticlesAtCell(tileIndex, 'kill');
            removed = true;
          } else {
            // Mortar
            const mortarIndex = mortarEnemies.indexOf(tileIndex);
            if (mortarIndex !== -1) {
              mortarEnemies.splice(mortarIndex, 1);
              addScore(hasTripleEnemyTurns ? 4 : 2);
              spawnParticlesAtCell(tileIndex, 'kill');
              removed = true;

              // If no mortars remain, clear their targets
              if (mortarEnemies.length === 0) {
                mortarTargets = [];
              }
            }
          }
        }
      }

      if (!removed) return;

      playSfx('useFireWand');

      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));

      redrawBoard();
      checkForWin();
      return;
    }

    if (armedItem.subtype === 'lightning') {
      if (tileIndex !== avatarIndex) return;

      hasDoubleMove = true;
      playSfx('useLightningWand');
      consumeWandCharge(armedItem.slotIndex);
      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));
      return;
    }

    return;
  }

  // If some other item types are ever added
  armedItem = null;
  clearInventorySelection();
  renderInventory();
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}


window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('level-grid');
  if (grid) {
    grid.addEventListener('click', handleGridClick);
  }
});