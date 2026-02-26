// inventory.js
// Functions for rendering inventory, tracking item collection, and allowing for item usage.

console.log('inventory.js loaded');

function pickWandSubtype() {
  const r = Math.random();
  if (r < 0.4) return 'fire';
  if (r < 0.7) return 'ice';
  return 'lightning';
}

function findFirstEmptySlot() {
  return inventory.findIndex(item => item === null);
}

function pickupWand(subtype) {
  const existingIndex = inventory.findIndex(
    item =>
      item &&
      item.type === 'wand' &&
      item.subtype === subtype &&
      item.count < 3
  );

  if (existingIndex !== -1) {
    inventory[existingIndex].count += 1;
  } else {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: 'wand', subtype: subtype, count: 1 };
    }
  }

  renderInventory();
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}

function pickupStone(kind) {
  const typeKey = kind === 'heart' ? 'heart_stone' : 'wyrd_stone';

  const existingIndex = inventory.findIndex(
    item => item && item.type === typeKey && item.count < 3
  );

  if (existingIndex !== -1) {
    inventory[existingIndex].count += 1;
  } else {
    const slot = findFirstEmptySlot();
    if (slot !== -1) {
      inventory[slot] = { type: typeKey, count: 1 };
    }
  }

  renderInventory();
  sessionStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory() {
  const slots = document.querySelectorAll('.inventory-slot');
  slots.forEach((slot, index) => {
    slot.innerHTML = '';

    const item = inventory[index];
    if (!item) return;

    if (item.type === 'wand') {
      const icon = document.createElement('div');
      if (item.subtype === 'ice') {
        icon.className = 'inventory-ice-wand';
      } else if (item.subtype === 'fire') {
        icon.className = 'inventory-fire-wand';
      } else if (item.subtype === 'lightning') {
        icon.className = 'inventory-lightning-wand';
      }
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);

    } else if (item.type === 'wyrd_stone') {
      const icon = document.createElement('div');
      icon.className = 'inventory-wyrd-stone';
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);

    } else if (item.type === 'heart_stone') {
      const icon = document.createElement('div');
      icon.className = 'inventory-heart-stone';
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);
    }

  });
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
  if (item.type === 'heart_stone') {
    return 'Heart Stone';
  }
  return 'Item';
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

window.addEventListener('DOMContentLoaded', () => {
  console.log('inventory wiring running');

  const wyrdModal = document.getElementById('wyrd-modal');
  const wyrdConfirmBtn = document.getElementById('wyrd-confirm');
  const wyrdCancelBtn = document.getElementById('wyrd-cancel');
  const heartModal = document.getElementById('heart-modal');
  const heartConfirmBtn = document.getElementById('heart-confirm');
  const heartCancelBtn = document.getElementById('heart-cancel');
  const tooltip = document.getElementById('inventory-tooltip');

  const slots = document.querySelectorAll('.inventory-slot');
  if (!slots.length) return;

  // Inventory slots: click + tooltip
  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      // Derive index from current NodeList so DOM and data stay in sync
      const allSlots = Array.from(document.querySelectorAll('.inventory-slot'));
      const currentIndex = allSlots.indexOf(slot);
      const item = inventory[currentIndex];
      console.log('slot click index', currentIndex, 'item', item);
      if (!item) return;

      if (item.type === 'wand') {
        const isSameWand =
          armedItem &&
          armedItem.type === 'wand' &&
          armedItem.slotIndex === currentIndex;

        if (isSameWand) {
          armedItem = null;
        } else {
          armedItem = {
            type: 'wand',
            subtype: item.subtype,
            slotIndex: currentIndex
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

      if (item.type === 'wyrd_stone') {
        armedItem = { type: 'wyrd_stone', slotIndex: currentIndex };

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle('inventory-selected', i === currentIndex);
          });

        if (wyrdModal) {
          wyrdModal.classList.remove('hidden');
        }
        return;
      }

      if (item.type === 'heart_stone') {
        armedItem = { type: 'heart_stone', slotIndex: currentIndex };

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle('inventory-selected', i === currentIndex);
          });

        if (heartModal) {
          heartModal.classList.remove('hidden');
        }
        return;
      }

    });

    // Tooltip
    slot.addEventListener('mouseenter', () => {
      const allSlots = Array.from(document.querySelectorAll('.inventory-slot'));
      const currentIndex = allSlots.indexOf(slot);
      const item = inventory[currentIndex];
      if (!item || !tooltip) return;

      const name = getInventoryItemName(item);
      if (!name) return;

      tooltip.textContent = name;
      tooltip.classList.remove('hidden');
    });

    slot.addEventListener('mousemove', (e) => {
      if (!tooltip || tooltip.classList.contains('hidden')) return;
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
    });

    slot.addEventListener('mouseleave', () => {
      if (!tooltip) return;
      tooltip.classList.add('hidden');
    });
  });

  // Confirm Wyrd Stone
  if (wyrdConfirmBtn && wyrdModal) {
    wyrdConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'wyrd_stone') {
        wyrdModal.classList.add('hidden');
        return;
      }

      hasTripleEnemyTurns = true;
      playSfx('useWyrdStone');

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
  if (wyrdCancelBtn && wyrdModal) {
    wyrdCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      wyrdModal.classList.add('hidden');
    });
  }

    // Confirm Heart Stone
  if (heartConfirmBtn && heartModal) {
    heartConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'heart_stone') {
        heartModal.classList.add('hidden');
        return;
      }

      heartStoneActive = true;
      playSfx('useHeartStone'); // add this in audio if you want

      const slotIndex = armedItem.slotIndex;
      const item = inventory[slotIndex];
      if (item && item.type === 'heart_stone') {
        item.count -= 1;
        if (item.count <= 0) {
          inventory[slotIndex] = null;
        }
      }

      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));

      heartModal.classList.add('hidden');
    });
  }

  // Cancel Heart Stone
  if (heartCancelBtn && heartModal) {
    heartCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      heartModal.classList.add('hidden');
    });
  }

});
