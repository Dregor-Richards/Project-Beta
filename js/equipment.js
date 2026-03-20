// equipment.js

// Simple ID-based ring pool (easy to reuse later for chests, etc.)
// NOTE: WHEN CHANGING iconClass HERE, UPDATE IN CSS AS WELL
const EQUIP_POOL = [
  {
    id: 'equip_dodge_pants',
    title: 'Greaves Of Dodging',
    description: 'Gives you a 3% chance of dodging an attack.',
    iconClass: 'equip-dodge-pants',
    type: 'equipment',
    slotType: 'legs',         
    effect: 'dodge_pants'
  },
  {
    id: 'equip_mining_helm',
    title: 'Mining Helm',
    description: 'Shines a 5-tile long beam of light in the direction you last moved.',
    iconClass: 'equip-mining-helm',
    type: 'equipment',
    slotType: 'head',
    effect: 'light_beam'
  },
  {
    id: 'equip_plated_armor',
    title: 'Plated Armor',
    description: 'Protects you from a single point of damage; has a 5% chance to regen each level.',
    iconClass: 'equip-plated-armor',
    type: 'equipment',
    slotType: 'chest',
    effect: 'armor_plate'
  },
  {
    id: 'equip_retaliation_hammer',
    title: 'Hammer Of Retaliation',
    description: 'Hits the first enemy who attacks you each level.',
    iconClass: 'equip-retaliation-hammer',
    type: 'equipment',
    slotType: 'hand',
    effect: 'retaliation_strike'
  },
  {
    id: 'equip_book_of_wands',
    title: 'Book Of Wands',
    description: 'Has a 1% chance to generate a wand directly into your inventory each level.',
    iconClass: 'equip-book-wands',
    type: 'equipment',
    slotType: 'hand',
    effect: 'gain-a-wand'
  },
  {
    id: 'equip_book_of_stones',
    title: 'Book Of Stones',
    description: 'Has a 1% chance to generate a stone directly into your inventory each level.',
    iconClass: 'equip-book-stones',
    type: 'equipment',
    slotType: 'hand',
    effect: 'gain-a-stone'
  },
];

const RING_POOL = [
  {
    id: 'ring_extra_fruit',
    title: 'Ring of Freshness',
    description: 'Allows you to hold 3 fruit in inventory, and increases the chance of their spawn (5%).',
    iconClass: 'ring-extra-fruit',   // CSS class for icon sprite
    type: 'ring',
    effect: 'extra_fruit'
  },
  {
    id: 'ring_betrayal',
    title: 'Ring of Betrayal',
    description: 'Each level brings a 1% chance that an enemy will betray their comrades, in your favour.',
    iconClass: 'ring-betrayal',
    type: 'ring',
    effect: 'enemy_betrayal'
  },
  {
    id: 'ring_shadow_step',
    title: 'Ring of Fading',
    description: 'Every fifth turn, become a pale phantom, avoiding damage.',
    iconClass: 'ring-shadow-step',
    type: 'ring',
    effect: 'shadow_step'
  },
  {
    id: 'ring_prisms',
    title: 'Ring of Prisms',
    description: 'Every collected item grants +1 bonus score.',
    iconClass: 'ring-prisms',
    type: 'ring',
    effect: 'prisms_score_bonus'
  },
  {
    id: 'ring_chests',
    title: 'Ring of Chests',
    description: 'Each level brings a 3% chance that a chest will appear.',
    iconClass: 'ring-chests',
    type: 'ring',
    effect: 'extra_chest_spawn'
  },
];

// Helper: pick N distinct random rings
function getRandomRings(count = 2) {
  const pool = [...RING_POOL];
  const result = [];
  const max = Math.min(count, pool.length);
  for (let i = 0; i < max; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

// For later: transform a ring into an inventory slot payload
function makeRingInventoryItem(ring) {
  return {
    type: 'ring',
    id: ring.id,
    title: ring.title,
    description: ring.description,
    iconClass: ring.iconClass,
    effect: ring.effect,
  };
}

function chooseRandomLootItem() {
  const pool = EQUIP_POOL;
  const idx = randomInt(0, pool.length - 1);
  return pool[idx];
}

function makeEquipmentInventoryItem(equip) {
  return {
    type: 'equipment',
    id: equip.id,
    title: equip.title,
    description: equip.description,
    iconClass: equip.iconClass,
    effect: equip.effect,
    slotType: equip.slotType,
  };
}

function showChestLootModal(equipDef) {
  const modal = document.getElementById('ring-choice-modal');
  const container = document.getElementById('ring-choice-options');
  const cancelButton = document.getElementById('ring-choice-cancel');

  if (!modal || !container) return;

  // Single-card layout
  container.classList.add('ring-choice-options--single');
  container.innerHTML = '';

  if (cancelButton) cancelButton.classList.add('hidden');

  // Build card exactly like ring cards
  const card = document.createElement('button');
  card.className = 'ring-choice-card';

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'ring-choice-icon-wrapper';

  const icon = document.createElement('div');
  icon.className = 'ring-choice-icon ' + (equipDef.iconClass || '');
  iconWrapper.appendChild(icon);

  const textWrap = document.createElement('div');
  textWrap.className = 'ring-choice-text';

  const title = document.createElement('div');
  title.className = 'ring-choice-title';
  title.textContent = equipDef.title || '';

  const desc = document.createElement('div');
  desc.className = 'ring-choice-desc';
  desc.textContent = equipDef.description || '';

  textWrap.appendChild(title);
  textWrap.appendChild(desc);

  card.appendChild(iconWrapper);
  card.appendChild(textWrap);

  card.addEventListener('click', () => {
    const item = makeEquipmentInventoryItem(equipDef);
    addItemToInventory(item);
    modal.classList.add('hidden');
    playSfx('itemPickup');
  });

  container.appendChild(card);
  modal.classList.remove('hidden');
}