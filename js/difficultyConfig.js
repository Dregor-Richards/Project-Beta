// difficultyConfig.js

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Table-driven difficulty configuration.
// Each entry describes a band of difficulties (min..max) and the ranges used.
const DIFFICULTY_TABLE = [
  // Index 0 unused (we treat difficulties as 1-based)
  null,

  // Difficulty 1–2
  {
    min: 1,
    max: 2,
    gridSizes: [3, 4, 5],
    normalRange: [1, 2],
    fastRange: [0, 0],
    trackerRange: [0, 0],
    mortarRange: [0, 0],
    guaranteeStone: false,
  },

  // Difficulty 3–4
  {
    min: 3,
    max: 4,
    gridSizes: [5, 6, 7],
    normalRange: [2, 3],
    fastRange: [1, 2],
    trackerRange: [0, 0],
    mortarRange: [0, 0],
    guaranteeStone: false,
  },

  // Difficulty 5–6
  {
    min: 5,
    max: 6,
    gridSizes: [6, 7, 8],
    normalRange: [2, 3],
    fastRange: [1, 3],
    trackerRange: [1, 3],
    mortarRange: [0, 0],
    guaranteeStone: false,
  },

  // Difficulty 7–8
  {
    min: 7,
    max: 8,
    gridSizes: [8, 9, 10],
    normalRange: [2, 3],
    fastRange: [2, 3],
    trackerRange: [2, 3],
    mortarRange: [1, 2],
    guaranteeStone: false,
  },

  // Difficulty 9
  {
    min: 9,
    max: 9,
    gridSizes: [10],
    normalRange: [3, 3],
    fastRange: [3, 3],
    trackerRange: [3, 3],
    mortarRange: [3, 3],
    guaranteeStone: true, // guaranteed Stone
  },

  // Difficulty 11–12 (post‑boss, pre‑endless)
  {
    min: 11,
    max: 12,
    gridSizes: [9, 10, 11],
    normalRange: [2, 3], // 3 4
    fastRange: [2, 3],  // 3 4
    trackerRange: [2, 3],  // 3 4
    mortarRange: [1, 2],   // 3 4
    guaranteeStone: false,
  },
  
  // Difficulty 13-14
  {
    min: 13,
    max: 14,
    gridSizes: [10, 11, 12],
    normalRange: [3, 4],
    fastRange: [3, 4],
    trackerRange: [3, 4],
    mortarRange: [2, 4],
    guaranteeStone: false,
  },
];

function getDifficultyConfig(difficulty) {
  // 13+ treated as endless placeholder
  if (difficulty >= 15) {
    return {
      gridSize: 12,
      normalCount: randomInt(5, 6),
      fastCount: randomInt(5, 6),
      trackerCount: randomInt(5, 6),
      mortarCount: randomInt(5, 6),
      guaranteeStone: false, // we can still let normal 5% wyrd stone roll
    };
  }

  // Look up a matching config entry for this difficulty
  const entry = DIFFICULTY_TABLE.find(
    (cfg) => cfg && difficulty >= cfg.min && difficulty <= cfg.max
  );

  // Fallback (should not hit)
  if (!entry) {
    const size = 6;
    return {
      gridSize: size,
      normalCount: 2,
      fastCount: 1,
      trackerCount: 0,
      mortarCount: 0,
      guaranteeStone: false,
    };
  }

  // Pick a grid size from the allowed list
  const gridSize =
    entry.gridSizes.length === 1
      ? entry.gridSizes[0]
      : entry.gridSizes[randomInt(0, entry.gridSizes.length - 1)];

  const [nMin, nMax] = entry.normalRange;
  const [fMin, fMax] = entry.fastRange;
  const [tMin, tMax] = entry.trackerRange;
  const [mMin, mMax] = entry.mortarRange;

  return {
    gridSize,
    normalCount: randomInt(nMin, nMax),
    fastCount: randomInt(fMin, fMax),
    trackerCount: randomInt(tMin, tMax),
    mortarCount: randomInt(mMin, mMax),
    guaranteeStone: entry.guaranteeStone,
  };
}
