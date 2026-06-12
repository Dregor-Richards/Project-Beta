const RING_CHESTS_PER_RING = 0.03; // 3% per Ring of Chests
const BOOK_WANDS_CHANCE_PER = 0.05;  // Updated to 5%, was 1% per Book of Wands
const BOOK_STONES_CHANCE_PER = 0.05; // Updated to 5%, was 1% per Book of Stones
const PRISMS_BONUS_PER_RING = 1; // +1 Point per Ring Of Prisms
const DODGE_PANTS_CHANCE_PER = 0.05; // Updated to 5%, was 3% per Greaves of Dodging

// Count equipped equipment pieces by effect id
function countEquippedEquipmentByEffect(effectId) {
  if (!equippedEquipment || typeof equippedEquipment !== 'object') return 0;

  const slots = ['head', 'chest', 'legs', 'hand-left', 'hand-right'];
  let count = 0;

  for (const slot of slots) {
    const item = equippedEquipment[slot];
    if (item && item.effect === effectId) {
      count += 1;
    }
  }
  return count;
}

function countEquippedRingsByEffect(effectId) {
  if (!Array.isArray(equippedRings)) return 0;
  return equippedRings.reduce((count, ring) => {
    if (!ring) return count;
    return ring.effect === effectId ? count + 1 : count;
  }, 0);
}

// Roll a per-level proc that can stack from multiple copies of an item.
function rollStackingPerLevelProc(baseChancePerItem, copies) {
  if (baseChancePerItem <= 0 || copies <= 0) return false;
  const totalChance = baseChancePerItem * copies;
  return Math.random() < totalChance;
}

// --- Item Specific Helpers ---

function maybeGrantBookOfWandsReward() {
  const copies = countEquippedEquipmentByEffect('gain-a-wand');
  if (copies <= 0) return;

  const proc = rollStackingPerLevelProc(BOOK_WANDS_CHANCE_PER, copies);
  if (!proc) return;

  // If it procs, generate a random wand directly into inventory
  const subtype = pickWandSubtype
    ? pickWandSubtype()
    : 'fire';

  if (typeof pickupWand === 'function') {
    pickupWand(subtype);
  }
}

function maybeGrantBookOfStonesReward() {
  const copies = countEquippedEquipmentByEffect('gain-a-stone');
  if (copies <= 0) return;

  const proc = rollStackingPerLevelProc(BOOK_STONES_CHANCE_PER, copies);
  if (!proc) return;

  // Randomly decide heart vs wyrd stone
  const kind = Math.random() < 0.5 ? 'heart' : 'wyrd';

  if (typeof pickupStone === 'function') {
    pickupStone(kind);
  }
}

function getDodgePantsCount() {
  return countEquippedEquipmentByEffect('dodge_pants');
}

function getTotalDodgeChance() {
  const copies = getDodgePantsCount();
  if (copies <= 0) return 0;
  return Math.min(1, copies * DODGE_PANTS_CHANCE_PER); // linear stack
}

function getExtraChestChanceFromRings() {
  const copies = countEquippedRingsByEffect('extra_chest_spawn');
  return copies * RING_CHESTS_PER_RING; // e.g. 2 rings → 0.06 (6%)
}

function getPrismsRingCount() {
  return countEquippedRingsByEffect('prisms_score_bonus');
}

function getPrismsPickupBonus() {
  const rings = getPrismsRingCount();
  if (rings <= 0) return 0;
  return rings * PRISMS_BONUS_PER_RING; // e.g. 2 rings → +2 score per pickup
}