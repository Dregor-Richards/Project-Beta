function handleGridClick(event) {
  if (!armedItem) return;

  const cell = event.target.closest('.grid-cell');
  if (!cell) return;

  const tileIndex = Number(cell.dataset.index);

  // ===== Door Key: click door to unlock, consume key, but don't win yet =====
  if (armedItem.type === 'door_key') {
    if (tileIndex !== doorIndex) {
      // Clicked somewhere else → do nothing, keep key armed
      return;
    }

    // Consume the key immediately
    const slotIndex = armedItem.slotIndex;
    const item = inventory[slotIndex];
    if (item && item.type === 'door_key') {
      item.count -= 1;
      if (item.count <= 0) {
        inventory[slotIndex] = null;
      }
    }

    armedItem = null;
    clearInventorySelection();
    renderInventory();
    sessionStorage.setItem('inventory', JSON.stringify(inventory));

    // Mark door as unlocked by key; enemies still move, no win yet
    doorUnlockedByKey = true;
    if (typeof playSfx === 'function') {
      playSfx('useKey'); // or reuse an existing SFX
    }

    return;
  }

  // ===== Wands =====
  if (armedItem.type === 'wand') {
    if (armedItem.subtype === 'ice') {
      applyIceWandAtTile(tileIndex);

      // Ice wand particles
      spawnParticlesAtCell(tileIndex, 'iceWand', undefined, [
        '#99d9ff', // light blue
        '#4fa3ff', // medium blue
        '#ffffff', // white
      ]);

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
      // Boss hit by Fire wand (difficulty 10)
      const storedDifficulty = sessionStorage.getItem('currentDifficulty');
      const difficulty =
        storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;
      if (difficulty === 10 && typeof bossIndex === 'number') {
        const bossTileIndex = bossIndex + 1; // 0-based -> 1-based
        if (tileIndex === bossTileIndex) {
          playSfx('useFireWand');
          consumeWandCharge(armedItem.slotIndex);
          armedItem = null;
          clearInventorySelection();
          renderInventory();
          sessionStorage.setItem('inventory', JSON.stringify(inventory));

          hitBoss(); // treat as a boss hit, not a kill
          return;
        }
      }

      // Mimic hit by Fire wand
      if (mimicActive && mimicIndex != null && tileIndex === mimicIndex) {
        playSfx('useFireWand');

        // Fire wand deals 1 damage to the mimic (does NOT guarantee a kill)
        hitMimic();

        consumeWandCharge(armedItem.slotIndex);
        armedItem = null;
        clearInventorySelection();
        renderInventory();
        sessionStorage.setItem('inventory', JSON.stringify(inventory));

        // Board and boss/mimic bar are updated inside hitMimic()
        // but we can safely ensure visuals are current:
        redrawBoard();
        return;
      }

      let removed = false;

      // Normal
      const normalIndex = enemies.indexOf(tileIndex);
      if (normalIndex !== -1) {
        enemies.splice(normalIndex, 1);
        addScore(1);
        spawnParticlesAtCell(tileIndex, 'fireWand', undefined, [
          '#ffff66', // yellow
          '#ff9933', // orange
          '#ff3333', // red
        ]);
        removed = true;
      } else {
        // Fast
        const fastIndex = fastEnemies.indexOf(tileIndex);
        if (fastIndex !== -1) {
          fastEnemies.splice(fastIndex, 1);
          addScore(2);
          spawnParticlesAtCell(tileIndex, 'fireWand', undefined, [
            '#ffff66', // yellow
            '#ff9933', // orange
            '#ff3333', // red
          ]);
          removed = true;
        } else {
          // Tracker
          const trackerIndex = trackerEnemies.indexOf(tileIndex);
          if (trackerIndex !== -1) {
            trackerEnemies.splice(trackerIndex, 1);
            addScore(1);
            spawnParticlesAtCell(tileIndex, 'fireWand', undefined, [
              '#ffff66', // yellow
              '#ff9933', // orange
              '#ff3333', // red
            ]);
            removed = true;
          } else {
            // Mortar
            const mortarIndex = mortarEnemies.indexOf(tileIndex);
            if (mortarIndex !== -1) {
              mortarEnemies.splice(mortarIndex, 1);
              addScore(2);
              spawnParticlesAtCell(tileIndex, 'fireWand', undefined, [
                '#ffff66', // yellow
                '#ff9933', // orange
                '#ff3333', // red
              ]);
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

      // Lightning particles at the player
      spawnParticlesAtCell(tileIndex, 'wand', undefined, [
        '#ffffff', // white
        '#fff799', // pale yellow
        '#ffff33', // bright yellow
        '#a0c8ff', // soft blue accent
      ]);

      extraMoves += 1;
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

function applyIceWandAtTile(centerIndex) {
  // 1) Always freeze the chosen tile
  frozenEnemyTiles.add(centerIndex);

  // 2) Remove mortar targeting for this tile and prevent future targeting
  if (!blockedMortarTiles) {
    window.blockedMortarTiles = new Set();
  }
  blockedMortarTiles.add(centerIndex);
  mortarTargets = mortarTargets.filter(t => t !== centerIndex);

  // 3) If a mortar enemy is actually standing here, “freeze” its firing
  const mortarIdx = mortarEnemies.indexOf(centerIndex);
  if (mortarIdx !== -1) {
    // handled elsewhere via frozenEnemyTiles
  }

  // Ice wand particle palette (not used if we rely on sprites only,
  // but safe to keep for now)
  const icePalette = [
    '#99d9ff', // light blue
    '#4fa3ff', // medium blue
    '#ffffff', // white
  ];

  // Particles on the central tile - use iceWand
  spawnParticlesAtCell(centerIndex, 'iceWand', undefined, icePalette);

  // 4) Freeze 0–8 random surrounding tiles (8-way)
  const neighbors = getNeighborIndices(centerIndex, gridSize);
  const extraCount = Math.floor(Math.random() * 9); // 0..8

  for (let i = 0; i < extraCount; i++) {
    const randomNeighbor =
      neighbors[Math.floor(Math.random() * neighbors.length)];

    frozenEnemyTiles.add(randomNeighbor);
    blockedMortarTiles.add(randomNeighbor);
    mortarTargets = mortarTargets.filter(t => t !== randomNeighbor);

    // Particles on each chosen neighbor - use iceWand
    spawnParticlesAtCell(randomNeighbor, 'iceWand', undefined, icePalette);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('level-grid');
  if (grid) {
    grid.addEventListener('click', handleGridClick);
  }
});


window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('level-grid');
  if (grid) {
    grid.addEventListener('click', handleGridClick);
  }
});