let isDarkLevel = false;     // this level uses darkness at all
let fullDarkActive = false;  // upgraded to “pitch black + halo”
let firstTurnDone = false;

let lanternTile = null;
let brazierTile = null;
let lanternCollected = false;

let litTiles = new Set();      // tiles fully lit (no darkness)
let shadowTiles = new Set();   // tiles with semi-transparent shadow

function resetDarkness() {
  isDarkLevel = false;
  fullDarkActive = false;
  firstTurnDone = false;
  lanternCollected = false;
  lanternTile = null;
  brazierTile = null;
  brazierLit = false;
  litTiles.clear();
  shadowTiles.clear();
}

function initDarkness(difficulty, spawnCornerIndices) {
  resetDarkness();

  // difficulty 11–12: always dark; 13+: 60% dark
  if (difficulty >= 11 && difficulty <= 12) {
    isDarkLevel = true;
  } else if (difficulty >= 13) {
    isDarkLevel = Math.random() < 0.6;
  } else {
    return; // not a dark level → no lantern, no brazier
  }

  if (!spawnCornerIndices || !Array.isArray(spawnCornerIndices)) return;

  const unusedCorners = spawnCornerIndices.filter(idx => idx !== avatarIndex);

  // Lantern: always when dark
  if (unusedCorners.length > 0) {
    const lanternIdx = unusedCorners.splice(
      Math.floor(Math.random() * unusedCorners.length), 1
    )[0];
    lanternTile = lanternIdx;
  }

  // Brazier: only on dark levels
  const shouldSpawnBrazier =
    unusedCorners.length > 0 &&
    (
      (difficulty >= 11 && difficulty <= 12) ||
      (difficulty >= 13 && Math.random() < 0.75) // 25% chance to skip
    );

  if (shouldSpawnBrazier) {
    const brazierIdx = unusedCorners.splice(
      Math.floor(Math.random() * unusedCorners.length), 1
    )[0];
    brazierTile = brazierIdx;
  } else {
    brazierTile = null;
  }
}

function activateFullDarkness() {
  if (!isDarkLevel || fullDarkActive) return false;
  fullDarkActive = true;
  firstTurnDone = true;
  recomputeDarkness();
  return true;
}

function onPlayerMoved() {
  if (!isDarkLevel || !fullDarkActive) return;
  recomputeDarkness();
}

function onMortarTargetsChanged() {
  if (!isDarkLevel || !fullDarkActive) return;
  recomputeDarkness();
}

function onLanternCollected() {
  lanternCollected = true;
  // vision shape changes; recompute immediately
  recomputeDarkness();
}

function recomputeDarkness() {
  litTiles.clear();
  shadowTiles.clear();

  if (!fullDarkActive) {
    return;
  }

  if (!gridSize || !avatarIndex) return;

  const size = gridSize;
  const maxIndex = size * size;

  const dist = (a, b) => {
    const az = a - 1;
    const bz = b - 1;
    const ar = Math.floor(az / size);
    const ac = az % size;
    const br = Math.floor(bz / size);
    const bc = bz % size;
    const dr = Math.abs(ar - br);
    const dc = Math.abs(ac - bc);
    return Math.max(dr, dc);   // Chebyshev distance
  };

  // 1) Base vision radii depend on lantern
  let litRadius = 0;      // fully lit tiles: distance <= litRadius
  let shadowRadius = 1;   // shadow ring: distance > litRadius && <= shadowRadius

  if (!lanternCollected) {
    // Before lantern: only the current tile lit, 1-tile shadow ring
    litRadius = 0;
    shadowRadius = 1;
  } else {
    // After getting lantern: 2 lit rings, third shadow ring
    litRadius = 2;     // Could lower to 1, But bigger maps may work with this
    shadowRadius = 3;   // Could lower to 2
  }

  for (let i = 1; i <= maxIndex; i++) {
    const d = dist(avatarIndex, i);

    if (d <= litRadius) {
      litTiles.add(i);
    } else if (d <= shadowRadius) {
      shadowTiles.add(i);
    }
  }

  // 2) Mortar target tiles are always fully lit
  if (Array.isArray(mortarTargets)) {
    mortarTargets.forEach(t => litTiles.add(t));
  }

  // 3) Lantern tile itself glows until collected
  if (lanternTile && !lanternCollected) {
    litTiles.add(lanternTile);
  }

  // Brazier alone does not add light
}