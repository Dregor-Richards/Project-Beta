// inventory.js
// Functions for rendering inventory, tracking item collection, and allowing for item usage.

function initRunInventory() {
  inventory = new Array(21).fill(null);

  const startingItemId = sessionStorage.getItem('startingItemId');

  // If player chose the Fire Wand starting item, give a stack of 3
  if (startingItemId === 'start_item_3') {
    pickupWand('fire');
    pickupWand('fire');
    pickupWand('fire');
    // pickupWand handles renderInventory() and sessionStorage
  } else {
    // If you want to persist an empty inventory:
    sessionStorage.setItem('inventory', JSON.stringify(inventory));
  }
}

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

    } else if (item.type === 'ring') {
      const icon = document.createElement('div');
      icon.className = item.iconClass || 'inventory-ring-generic';
      slot.appendChild(icon);

    } else if (item.type === 'equipment') {
      const icon = document.createElement('div');
      icon.className = item.iconClass || 'inventory-equipment-generic';
      slot.appendChild(icon);

    } else if (item.type === 'coin_pouch') {
      const icon = document.createElement('div');
      icon.className = 'inventory-coin-pouch';
      slot.appendChild(icon);

      const countLabel = document.createElement('div');
      countLabel.textContent = String(item.count);
      countLabel.className = 'inventory-stack-count';
      slot.appendChild(countLabel);

    } else if (item.type === 'door_key') {
      const icon = document.createElement('div');
      icon.className = 'inventory-door-key';
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
  if (item.type === 'wyrd_stone') return 'Wyrd Stone';
  if (item.type === 'heart_stone') return 'Heart Stone';
  if (item.type === 'ring') return item.title || 'Ring';
  if (item.type === 'equipment') return item.title || 'Equipment';
  if (item.type === 'coin_pouch') return 'Coin Pouch';
  if (item.type === 'door_key') return 'Door Key';
  return 'Item';
}

function renderJewelry() {
  const slots = document.querySelectorAll('.jewelry-slot');
  if (!slots.length) return;

  slots.forEach(slot => {
    const idx = Number(slot.dataset.slot);
    const ring = equippedRings[idx] || null;

    slot.innerHTML = '';
    slot.classList.remove('has-ring');

    if (!ring) return;

    const icon = document.createElement('div');
    icon.className = ring.iconClass || 'inventory-ring-generic';
    slot.appendChild(icon);
    slot.classList.add('has-ring');
  });
}

function renderEquipment() {
  const slots = document.querySelectorAll('.equipment-slot');
  if (!slots.length) return;

  slots.forEach(slot => {
    const key = slot.dataset.slot;
    const equip = equippedEquipment[key] || null;

    const wrapper = slot.querySelector('.equipment-icon-wrapper');
    if (wrapper) wrapper.innerHTML = '';
    slot.classList.remove('has-equipment');

    if (!equip || !wrapper) return;

    const icon = document.createElement('div');
    icon.className = equip.iconClass || 'inventory-equipment-generic';
    wrapper.appendChild(icon);
    slot.classList.add('has-equipment');
  });
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
  const coinModal = document.getElementById('coin-modal');
  const coinConfirmBtn = document.getElementById('coin-confirm');
  const coinCancelBtn = document.getElementById('coin-cancel');
  const tooltip = document.getElementById('inventory-tooltip');

  const slots = document.querySelectorAll('.inventory-slot');
  if (!slots.length) return;

  // ===== Inventory slots: click + tooltip =====
  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      const allSlots = Array.from(document.querySelectorAll('.inventory-slot'));
      const currentIndex = allSlots.indexOf(slot);
      const item = inventory[currentIndex];
      console.log('slot click index', currentIndex, 'item', item);
      if (!item) return;

      // Wand selection / arming
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

      // Wyrd Stone
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

      // Heart Stone
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

      // Coin Pouch
      if (item.type === 'coin_pouch') {
        armedItem = { type: 'coin_pouch', slotIndex: currentIndex };
        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle('inventory-selected', i === currentIndex);
          });
        if (coinModal) {
          coinModal.classList.remove('hidden');
        }
        return;
      }

      // Door Key selection
      if (item.type === 'door_key') {
        const allSlots = Array.from(document.querySelectorAll('.inventory-slot'));
        const currentIndex = allSlots.indexOf(slot);

        const isSameKey =
          armedItem &&
          armedItem.type === 'door_key' &&
          armedItem.slotIndex === currentIndex;

        if (isSameKey) {
          armedItem = null;
        } else {
          armedItem = { type: 'door_key', slotIndex: currentIndex };
        }

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            s.classList.toggle(
              'inventory-selected',
              !!armedItem &&
                armedItem.type === 'door_key' &&
                i === armedItem.slotIndex
            );
          });

        return;
      }

      // Ring selection
      if (item.type === 'ring') {
        const isSameRing =
          selectedRingFromInventory &&
          selectedRingFromInventory.slotIndex === currentIndex;

        if (isSameRing) {
          selectedRingFromInventory = null;
        } else {
          selectedRingFromInventory = {
            slotIndex: currentIndex,
          };
        }

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            const selected =
              selectedRingFromInventory &&
              i === selectedRingFromInventory.slotIndex;
            s.classList.toggle('inventory-selected', selected);
          });
        return;
      }

      // Equipment selection
      if (item.type === 'equipment') {
        const isSameEquip =
          selectedEquipmentFromInventory &&
          selectedEquipmentFromInventory.slotIndex === currentIndex;

        if (isSameEquip) {
          selectedEquipmentFromInventory = null;
        } else {
          selectedEquipmentFromInventory = {
            slotIndex: currentIndex,
          };
        }

        document.querySelectorAll('.inventory-slot')
          .forEach((s, i) => {
            const selected =
              selectedEquipmentFromInventory &&
              i === selectedEquipmentFromInventory.slotIndex;
            s.classList.toggle('inventory-selected', selected);
          });
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

  // ===== Jewelry slot wiring (equip/swap rings) =====
  const jewelrySlots = document.querySelectorAll('.jewelry-slot');

  const storedRings = sessionStorage.getItem('equippedRings');
  if (storedRings) {
    try {
      const parsed = JSON.parse(storedRings);
      if (Array.isArray(parsed) && parsed.length === 10) {
        equippedRings = parsed;
      }
    } catch (e) {
      // ignore bad data
    }
  }
  renderJewelry();

  if (jewelrySlots.length) {
    jewelrySlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = Number(slot.dataset.slot);
        if (Number.isNaN(idx)) return;

        if (!selectedRingFromInventory) return;

        const invIndex = selectedRingFromInventory.slotIndex;
        const invItem = inventory[invIndex];
        if (!invItem || invItem.type !== 'ring') {
          selectedRingFromInventory = null;
          clearInventorySelection();
          return;
        }

        const jewelryRing = equippedRings[idx] || null;

        if (jewelryRing) {
          inventory[invIndex] = jewelryRing;
        } else {
          inventory[invIndex] = null;
        }

        equippedRings[idx] = invItem;

        selectedRingFromInventory = null;
        clearInventorySelection();

        sessionStorage.setItem('inventory', JSON.stringify(inventory));
        sessionStorage.setItem('equippedRings', JSON.stringify(equippedRings));

        renderInventory();
        renderJewelry();
        playSfx('equippedItem');
      });
    });
  }

  // ===== Jewelry tooltip wiring =====
  if (jewelrySlots.length && tooltip) {
    jewelrySlots.forEach(slot => {
      slot.addEventListener('mouseenter', () => {
        const idx = Number(slot.dataset.slot);
        if (Number.isNaN(idx)) return;

        const ring = equippedRings[idx] || null;
        if (!ring) return;

        const name = ring.title || 'Ring';
        tooltip.textContent = name;
        tooltip.classList.remove('hidden');
      });

      slot.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('hidden')) return;
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
      });

      slot.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });
    });
  }

  // ===== Equipment slot wiring (equip/swap equipment) =====
  const equipmentSlots = document.querySelectorAll('.equipment-slot');

  const storedEquip = sessionStorage.getItem('equippedEquipment');
  if (storedEquip) {
    try {
      const parsed = JSON.parse(storedEquip);
      if (parsed && typeof parsed === 'object') {
        equippedEquipment = parsed;
      }
    } catch (e) {
      // ignore bad data
    }
  }
  renderEquipment();

  if (equipmentSlots.length) {
    equipmentSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const slotKey = slot.dataset.slot;
        if (!slotKey) return;

        if (!selectedEquipmentFromInventory) return;

        const invIndex = selectedEquipmentFromInventory.slotIndex;
        const invItem = inventory[invIndex];
        if (!invItem || invItem.type !== 'equipment') {
          selectedEquipmentFromInventory = null;
          clearInventorySelection();
          return;
        }

        const expectedType =
          slotKey === 'head' ? 'head' :
          slotKey === 'chest' ? 'chest' :
          slotKey === 'legs' ? 'legs' :
          'hand'; // both hand-left and hand-right

        if (invItem.slotType !== expectedType) {
          // wrong equipment type for this slot
          return;
        }

        const currentEquip = equippedEquipment[slotKey] || null;

        if (currentEquip) {
          inventory[invIndex] = currentEquip;
        } else {
          inventory[invIndex] = null;
        }

        equippedEquipment[slotKey] = invItem;

        selectedEquipmentFromInventory = null;
        clearInventorySelection();

        sessionStorage.setItem('inventory', JSON.stringify(inventory));
        sessionStorage.setItem('equippedEquipment', JSON.stringify(equippedEquipment));

        renderInventory();
        renderEquipment();
        playSfx('equippedItem');
      });
    });
  }

  // ===== Wyrd Stone confirm/cancel =====
  if (wyrdConfirmBtn && wyrdModal) {
    wyrdConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'wyrd_stone') {
        wyrdModal.classList.add('hidden');
        return;
      }

      hasTripleEnemyTurns = true;
      playSfx('useWyrdStone');

      if (typeof bossHealth === 'number' && bossHealth > 0 &&
          typeof bossStage === 'number' && bossStage === 1) {
        if (typeof bossWyrdScoreMultiplier === 'number') {
          bossWyrdScoreMultiplier = 2;
        }
      }

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

  if (wyrdCancelBtn && wyrdModal) {
    wyrdCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      wyrdModal.classList.add('hidden');
    });
  }

  // ===== Heart Stone confirm/cancel =====
  if (heartConfirmBtn && heartModal) {
    heartConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'heart_stone') {
        heartModal.classList.add('hidden');
        return;
      }

      heartStoneActive = true;
      playSfx('useWyrdStone');

      if (typeof bossHealth === 'number' && bossHealth > 0 &&
          typeof bossStage === 'number' && bossStage === 1) {
        if (typeof bossHeartScoreMultiplier === 'number') {
          bossHeartScoreMultiplier = 3;
        }
      }

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

  if (heartCancelBtn && heartModal) {
    heartCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      heartModal.classList.add('hidden');
    });
  }

  // ===== Coin Pouch confirm/cancel =====
  if (coinConfirmBtn && coinModal) {
    coinConfirmBtn.addEventListener('click', () => {
      if (!armedItem || armedItem.type !== 'coin_pouch') {
        coinModal.classList.add('hidden');
        return;
      }

      // Compute bonus: half total enemy base value (rounded down)
      if (typeof getTotalEnemyBaseValue === 'function' &&
          typeof addScore === 'function') {
        const total = getTotalEnemyBaseValue();
        const bonus = Math.floor(total / 2);
        addScore(bonus);
      }

      // Consume the Coin Pouch itself
      const slotIndex = armedItem.slotIndex;
      const item = inventory[slotIndex];
      if (item && item.type === 'coin_pouch') {
        item.count -= 1;
        if (item.count <= 0) {
          inventory[slotIndex] = null;
        }
      }

      armedItem = null;
      clearInventorySelection();
      renderInventory();
      sessionStorage.setItem('inventory', JSON.stringify(inventory));

      coinModal.classList.add('hidden');
      playSfx && playSfx('useCoinPouch');
    });
  }

  if (coinCancelBtn && coinModal) {
    coinCancelBtn.addEventListener('click', () => {
      armedItem = null;
      clearInventorySelection();
      coinModal.classList.add('hidden');
    });
  }

});