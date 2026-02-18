function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDifficultyConfig(difficulty) {
  // 11+ treated as endless placeholder
  if (difficulty >= 11) {
    return {
      gridSize: 12,
      normalCount: randomInt(3, 4),
      fastCount: randomInt(3, 4),
      trackerCount: randomInt(3, 4),
      mortarCount: randomInt(3, 4),
      guaranteeStone: false, // we can still let normal 5% wyrd stone roll
    };
  }

  switch (difficulty) {
    case 1:
    case 2: {
      const sizes = [3, 4, 5];
      return {
        gridSize: sizes[randomInt(0, sizes.length - 1)],
        normalCount: randomInt(1, 3),
        fastCount: 0,
        trackerCount: 0,
        mortarCount: 0,
        guaranteeStone: false,
      };
    }

    case 3:
    case 4: {
      const sizes = [5, 6, 7];
      return {
        gridSize: sizes[randomInt(0, sizes.length - 1)],
        normalCount: randomInt(2, 3),
        fastCount: randomInt(1, 2),
        trackerCount: 0,
        mortarCount: 0,
        guaranteeStone: false,
      };
    }

    case 5:
    case 6: {
      const sizes = [6, 7, 8];
      return {
        gridSize: sizes[randomInt(0, sizes.length - 1)],
        normalCount: randomInt(2, 3),
        fastCount: randomInt(1, 3),
        trackerCount: randomInt(1, 3),
        mortarCount: 0,
        guaranteeStone: false,
      };
    }

    case 7:
    case 8: {
      const sizes = [8, 9, 10];
      return {
        gridSize: sizes[randomInt(0, sizes.length - 1)],
        normalCount: randomInt(2, 3),
        fastCount: randomInt(2, 3),
        trackerCount: randomInt(2, 3),
        mortarCount: randomInt(1, 2),
        guaranteeStone: false,
      };
    }

    case 9: {
      return {
        gridSize: 10,
        normalCount: 3,
        fastCount: 3,
        trackerCount: 3,
        mortarCount: 3,
        guaranteeStone: true, // guaranteed Wyrd Stone
      };
    }

    case 10: {
      // Until boss is implemented, treat like 11+
      return {
        gridSize: 12,
        normalCount: randomInt(3, 4),
        fastCount: randomInt(3, 4),
        trackerCount: randomInt(3, 4),
        mortarCount: randomInt(3, 4),
        guaranteeStone: false,
      };
    }

    default: {
      // Fallback, should not hit
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
  }
}