function intDiv(a, b) {
  return Math.floor(a / b);
}

function loadLevelNumber() {
  const raw = sessionStorage.getItem('currentLevel');
  levelNumber = raw !== null ? Number(raw) || 1 : 1;
}

function resetLevelNumber() {
  levelNumber = 1;
  sessionStorage.setItem('currentLevel', '1');
}

function advanceLevel() {
  levelNumber += 1;
  sessionStorage.setItem('currentLevel', String(levelNumber));
}

window.loadLevelNumber = loadLevelNumber;
window.resetLevelNumber = resetLevelNumber;
window.advanceLevel = advanceLevel;

function chooseWeightedRandom(options) {
  // options: [{ type: 'fire', weight: 50 }, ...]
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let r = Math.random() * totalWeight;

  for (const opt of options) {
    if (r < opt.weight) {
      return opt.type;
    }
    r -= opt.weight;
  }
  return options[options.length - 1].type; // fallback
}