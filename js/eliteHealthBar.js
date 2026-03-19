function showMimicHealthBar() {
  const wrapper = document.getElementById('boss-health-wrapper');
  const pipsContainer = document.getElementById('boss-health-pips');
  if (!wrapper || !pipsContainer) return;

  mimicUsingBossBar = true;

  wrapper.classList.remove('hidden');

  pipsContainer.innerHTML = '';
  for (let i = 0; i < mimicHealth; i++) {
    const pip = document.createElement('div');
    pip.className = 'boss-health-pip' + (i < mimicHealth ? ' full' : '');
    pipsContainer.appendChild(pip);
  }
}

function redrawMimicHealth() {
  const pipsContainer = document.getElementById('boss-health-pips');
  if (!pipsContainer) return;
  const pips = pipsContainer.querySelectorAll('.boss-health-pip');
  pips.forEach((pip, index) => {
    if (index < mimicHealth) {
      pip.classList.add('full');
    } else {
      pip.classList.remove('full');
    }
  });
}

function hideBossHealthBarIfNoElite() {
  const wrapper = document.getElementById('boss-health-wrapper');
  if (!wrapper) return;

  const storedDifficulty = sessionStorage.getItem('currentDifficulty');
  const difficulty =
    storedDifficulty !== null ? Number(storedDifficulty) || 1 : 1;

  const bossAlive = (difficulty === 10 && bossHealth > 0);
  const mimicAlive = mimicActive && mimicHealth > 0;

  if (!bossAlive && !mimicAlive) {
    wrapper.classList.add('hidden');
    mimicUsingBossBar = false;
  }
}