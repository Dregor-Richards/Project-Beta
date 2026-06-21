// difficultyConfig.js

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Table-driven difficulty configuration.
// Each entry describes a band of difficulties (min..max) and the ranges used.
const DIFFICULTY_TABLE = [
  // Index 0 unused (we treat difficulties as 1-based)
  null,

  // Difficulty 1–2 "Just Normals"
  {
    min: 1,
    max: 2,
    gridSizes: [4, 5],
    normalRange: [1, 2],
    fastRange: [0, 0],
    trackerRange: [0, 0],
    mortarRange: [0, 0],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 3–4 "Introduce Fast"
  {
    min: 3,
    max: 4,
    gridSizes: [5, 6, 7],
    normalRange: [2, 3],
    fastRange: [1, 2],
    trackerRange: [0, 0],
    mortarRange: [0, 0],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 5–6 "Introduce Tracker"
  {
    min: 5,
    max: 6,
    gridSizes: [6, 7, 8],
    normalRange: [2, 3],
    fastRange: [1, 3],
    trackerRange: [1, 3],
    mortarRange: [0, 0],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 7–8 "Introduce Mortar"
  {
    min: 7,
    max: 8,
    gridSizes: [8, 9, 10],
    normalRange: [2, 3],
    fastRange: [2, 3],
    trackerRange: [2, 3],
    mortarRange: [1, 2],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 9 "Pre-Boss"
  {
    min: 9,
    max: 9,
    gridSizes: [10],
    normalRange: [3, 3],
    fastRange: [3, 3],
    trackerRange: [3, 3],
    mortarRange: [3, 3],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: true, // guaranteed Stone
    guaranteeWand: true, // guaranteed Wand
  },

  // Difficulty 11–12 "Introduce Darkness"
  {
    min: 11,
    max: 12,
    gridSizes: [9, 10, 11],
    normalRange: [2, 3],
    fastRange: [2, 3],
    trackerRange: [2, 3],
    mortarRange: [1, 2],
    summonerRange: [0, 0],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },
  
  // Difficulty 13-14 "Introduce Summoner, Decrease Norm/Fast"
  {
    min: 13,
    max: 14,
    gridSizes: [10, 11, 12],
    normalRange: [0, 2],
    fastRange: [2, 3],
    trackerRange: [3, 4],
    mortarRange: [2, 4],
    summonerRange: [1, 2],
    wallRange: [0, 0],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 15-16 "Introduce Walls, Remove Norm"
  {
    min: 15,
    max: 16,
    gridSizes: [11, 12, 13],
    normalRange: [0, 0],
    fastRange: [2, 3],
    trackerRange: [3, 4],
    mortarRange: [2, 4],
    summonerRange: [2, 4],
    wallRange: [15, 25],
    beamerRange: [0, 0],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 17-18 "Introduce Beams"
  {
    min: 17,
    max: 18,
    gridSizes: [12, 13, 14],
    normalRange: [0, 0],
    fastRange: [1, 3],
    trackerRange: [2, 3],
    mortarRange: [1, 3],
    summonerRange: [3, 5],
    wallRange: [10, 30],
    beamerRange: [1, 2],
    guaranteeStone: false,
    guaranteeWand: false,
  },

  // Difficulty 19 "Pre-Boss"
  {
    min: 19,
    max: 19,
    gridSizes: [15],
    normalRange: [0, 0],
    fastRange: [5, 5],
    trackerRange: [5, 5],
    mortarRange: [5, 5],
    summonerRange: [5, 5],
    wallRange: [15, 40],
    beamerRange: [5, 5],
    guaranteeStone: true,
    guaranteeWand: true,
  },
];

function getDifficultyConfig(difficulty) {
  // 20+ treated as endless placeholder
  if (difficulty >= 21) {
    return {
      gridSize: 20,
      normalCount: randomInt(1, 3),
      fastCount: randomInt(2, 4),
      trackerCount: randomInt(3, 5),
      mortarCount: randomInt(4, 6),
      summonerCount: randomInt(5,7),
      wallPercent: randomInt(5,40),
      beamerCount: randomInt(5,7),
      guaranteeStone: false,
      guaranteeWand: false,
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
      summonerCount: 0,
      wallPercent: 0,
      beamerCount: 0,
      guaranteeStone: false,
      guaranteeWand: false,
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
  const [sMin, sMax] = entry.summonerRange;
  const [wMin, wMax] = entry.wallRange;
  const [bMin, bMax] = entry.beamerRange;
  
  const wallPercent = randomInt(wMin, wMax);

  return {
    gridSize,
    normalCount: randomInt(nMin, nMax),
    fastCount: randomInt(fMin, fMax),
    trackerCount: randomInt(tMin, tMax),
    mortarCount: randomInt(mMin, mMax),
    summonerCount: randomInt(sMin, sMax),
    wallPercent,
    beamerCount: randomInt (bMin, bMax),
    guaranteeStone: entry.guaranteeStone,
    guaranteeWand: entry.guaranteeWand,
  };
}
