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
let brazierLit = false;

// Camera
let cameraZoom = 1;
let cameraOffsetX = 0;
let cameraOffsetY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panOriginX = 0;
let panOriginY = 0;

// Enemies
let enemies = [];
let fastEnemies = [];
let trackerEnemies = [];
let mortarEnemies = [];
let trackerTurnParity = 0;      // 0 = rest, 1 = active
let mortarTargets = [];  // tiles targeted by mortars
let mortarJustTargeted = false; // tracks targeting/firing phase
let mortarFireCount = 0;
let blockedMortarTiles = new Set();

// Get-Hit globals
let shakeTime = 0;
let shakeDuration = 150; //ms
let shakeMagnitude = 6; //pixels

// inventory-related globals
let inventory = new Array(21).fill(null);
let frozenEnemyTiles = new Set();
//let wandIndex = null;
//let currentWandSubtype = null;
let wandsOnBoard = [];
let stoneIndex = null;
let stonePresent = false;
let stoneType = null;
let extraMoves = 0;
let hasTripleEnemyTurns = false;
let heartStoneActive = false;
let armedItem = null;

// shared flags
let winOpen = false;
let deathOpen = false;
let canPlayerMove = true;
let uiInputLocked = false;