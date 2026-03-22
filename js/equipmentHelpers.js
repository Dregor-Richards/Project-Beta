// equipmentHelpers.js

const RING_CHESTS_PER_RING = 0.03; // 3% per Ring of Chests

function countEquippedRingsByEffect(effectId) {
  if (!Array.isArray(equippedRings)) return 0;
  return equippedRings.reduce((count, ring) => {
    if (!ring) return count;
    return ring.effect === effectId ? count + 1 : count;
  }, 0);
}

function getExtraChestChanceFromRings() {
  const copies = countEquippedRingsByEffect('extra_chest_spawn');
  return copies * RING_CHESTS_PER_RING; // e.g. 2 rings → 0.06 (6%)
}
