let gridSize = 3;
let avatarIndex = 1;
let doorIndex = null;
let playerTurn = true;
let movesThisTurn = 0;
let playerDead = false;
let lives = 3;
let score = 0;
let heartIndex = null;
let levelNumber = 1;
let skipTileIndex = null;
let skipNextTurn = false;

// Enemies
let enemies = [];
let fastEnemies = [];
let trackerEnemies = [];
let mortarEnemies = [];
let trackerTurnParity = 0;      // 0 = rest, 1 = active
let mortarTargets = [];  // tiles targeted by mortars
let mortarJustTargeted = false; // tracks targeting/firing phase

// Get-Hit globals
let shakeTime = 0;
let shakeDuration = 150; //ms
let shakeMagnitude = 6; //pixels

// inventory-related globals
let inventory = new Array(21).fill(null);
let frozenEnemyTiles = new Set();
let wandIndex = null;
let currentWandSubtype = null;
let stoneIndex = null;
let stonePresent = false;
let hasDoubleMove = false;
let hasTripleEnemyTurns = false;
let armedItem = null;

// shared flags
let winOpen = false;
let deathOpen = false;
let uiInputLocked = false;

function intDiv(a, b) {
  return Math.floor(a / b);
}