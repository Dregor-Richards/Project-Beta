// Handles left-side tabs: Enemies, Equipment, Jewelry

let sidePanelOpen = false;
// 'enemies' | 'equip' | 'jewelry'
let activePanel = 'enemies';

function getEnemyCounts() {
  return [
    { key: 'enemy',      label: 'Cloak-&-Dagger',      count: enemies.length },
    { key: 'fast-enemy', label: 'Bat',                 count: fastEnemies.length },
    { key: 'tracker',    label: 'Hound',               count: trackerEnemies.length },
    { key: 'mortar',     label: 'Acolyte Of Voca',     count: mortarEnemies.length },
  ].filter(e => e.count > 0);
}

function renderEnemyRoster() {
  const list = document.getElementById('enemy-roster-list');
  if (!list) return;

  list.innerHTML = '';

  const counts = getEnemyCounts();
  counts.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.label}: ${entry.count}`;
    list.appendChild(li);
  });
}

function updateSidePanelVisibility() {
  const wrapper = document.getElementById('left-side-tabs');
  const enemySection   = document.getElementById('enemy-roster-panel');
  const equipSection   = document.getElementById('character-inventory-panel');
  const jewelrySection = document.getElementById('jewelry-panel');

  if (!wrapper || !enemySection || !equipSection || !jewelrySection) return;

  wrapper.classList.toggle('tabs-open', sidePanelOpen);

  enemySection.classList.toggle(
    'panel-section--active',
    activePanel === 'enemies'
  );
  equipSection.classList.toggle(
    'panel-section--active',
    activePanel === 'equip'
  );
  jewelrySection.classList.toggle(
    'panel-section--active',
    activePanel === 'jewelry'
  );
}

function setupSideTabs() {
  const enemyTab   = document.getElementById('enemy-roster-tab');
  const equipTab   = document.getElementById('character-inventory-tab');
  const jewelryTab = document.getElementById('jewelry-tab');

  if (enemyTab) {
    enemyTab.addEventListener('click', () => {
      if (activePanel === 'enemies') {
        sidePanelOpen = !sidePanelOpen;
      } else {
        activePanel = 'enemies';
        sidePanelOpen = true;
      }
      if (sidePanelOpen && activePanel === 'enemies') {
        renderEnemyRoster();
      }
      updateSidePanelVisibility();
    });
  }

  if (equipTab) {
    equipTab.addEventListener('click', () => {
      if (activePanel === 'equip') {
        sidePanelOpen = !sidePanelOpen;
      } else {
        activePanel = 'equip';
        sidePanelOpen = true;
      }
      updateSidePanelVisibility();
    });
  }

  if (jewelryTab) {
    jewelryTab.addEventListener('click', () => {
      if (activePanel === 'jewelry') {
        sidePanelOpen = !sidePanelOpen;
      } else {
        activePanel = 'jewelry';
        sidePanelOpen = true;
      }
      updateSidePanelVisibility();
    });
  }
}

// DOM ready
window.addEventListener('DOMContentLoaded', () => {
  setupSideTabs();
  updateSidePanelVisibility();
});

// Public: refresh enemies list when counts change
window.refreshEnemyRoster = function () {
  if (!sidePanelOpen || activePanel !== 'enemies') return;
  renderEnemyRoster();
};