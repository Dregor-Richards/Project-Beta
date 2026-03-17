// equipment.js

// Simple ID-based ring pool (easy to reuse later for chests, etc.)
// NOTE: WHEN CHANGING iconClass HERE, UPDATE IN CSS AS WELL
const RING_POOL = [
  {
    id: 'ring_extra_fruit',
    title: 'Ring of Freshness',
    description: 'Allows you to hold 3 fruit in inventory, and increases the chance of their spawn (5%).',
    iconClass: 'ring-extra-fruit',   // CSS class for icon sprite
    type: 'passive',
    effect: 'extra_fruit'
  },
  {
    id: 'ring_betrayal',
    title: 'Ring of Betrayal',
    description: 'Each level brings a 1% chance that an enemy will betray their comrades, in your favour.',
    iconClass: 'ring-betrayal',
    type: 'passive',
    effect: 'enemy_betrayal'
  },
  {
    id: 'ring_shadow_step',
    title: 'Ring of Fading',
    description: 'Every fifth turn, become a pale phantom, avoiding damage.',
    iconClass: 'ring-shadow-step',
    type: 'passive',
    effect: 'shadow_step'
  },
  {
    id: 'ring_prisms',
    title: 'Ring of Prisms',
    description: 'Every collected item grants +1 bonus score.',
    iconClass: 'ring-prisms',
    type: 'passive',
    effect: 'prisms_score_bonus'
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