let gridSize = 3;
let avatarIndex = 1;
let selectedAvatarIndex = 0;
let doorIndex = null;
let playerTurn = true;
let movesThisTurn = 0;
let playerDead = false;
let lives = 3;
let score = 0;
let doorUnlockedByKey = false;
let heartIndex = null;
let levelNumber = 1;
let skipTileIndex = null;
let skipNextTurn = false;
let brazierLit = false;

// Chest & Mimic
let chestIndex = null;
let chestOpened = false;
let mimicChestIndex = null;      // where the hidden mimic chest sits (looks like chest)
let mimicActive = false;         // has it revealed and become an enemy yet?
let mimicIndex = null;           // current tile of the mimic once active
let mimicHealth = 0;
let mimicPhase = 0;              // movement phase (1→4 cycle) for later AI
let mimicUsingBossBar = false;

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
let fastEnemyPhases = [];
let trackerEnemies = [];
let mortarEnemies = [];
let summonerEnemies = [];
let summonerStages = [];           // 0=Normal, 1=Fast, 2=Tracker, 3=Mortar
let summonerFailStreaks = [];
let summonerMustCombo = [];        // boolean per summoner: next turn = combo summon
let trackerTurnParity = 0;      // 0 = rest, 1 = active
let mortarTargets = [];  // tiles targeted by mortars
let mortarJustTargeted = false; // tracks targeting/firing phase
let mortarFireCount = 0;
let blockedMortarTiles = new Set();
// Pink-tinted enemies (summoned by Summoners)
let enemyIsSummoned = [];
let fastEnemyIsSummoned = [];
let trackerEnemyIsSummoned = [];
let mortarEnemyIsSummoned = [];
// For each summonerEnemies[i], track indices of its children in each enemy array
let summonerChildNormalIndices = [];   // array of arrays
let summonerChildFastIndices = [];
let summonerChildTrackerIndices = [];
let summonerChildMortarIndices = [];

// Get-Hit globals
let shakeTime = 0;
let shakeDuration = 150; //ms
let shakeMagnitude = 6; //pixels

// inventory-related globals
let inventory = new Array(21).fill(null);
let frozenEnemyTiles = new Set();
let pickupIndices = [];
let wandsOnBoard = [];
let stoneIndex = null;
let stonePresent = false;
let stoneType = null;
let extraMoves = 0;
let hasTripleEnemyTurns = false;
let heartStoneActive = false;
let armedItem = null;
// Jewelery inventory
let selectedRingFromInventory = null;
let equippedRings = new Array(10).fill(null);
// Equipment inventory
let selectedEquipmentFromInventory = null;
let equippedEquipment = {
  head: null,
  chest: null,
  legs: null,
  'hand-left': null,
  'hand-right': null,
};



// shared flags
let winOpen = false;
let deathOpen = false;
let canPlayerMove = true;
let uiInputLocked = false;