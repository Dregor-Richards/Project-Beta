// enemyRoster.js

let sidePanelOpen = false;
let activePanel = 'enemies'; // 'enemies' | 'equip'

function getEnemyCounts() {
  return [
    { key: 'enemy',       label: 'Cloak-&-Dagger', count: enemies.length },
    { key: 'fast-enemy',  label: 'Bat',   count: fastEnemies.length },
    { key: 'tracker',     label: 'Hound',count: trackerEnemies.length },
    { key: 'mortar',      label: 'Acolyte Of Voca', count: mortarEnemies.length },
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
  const enemySection = document.getElementById('enemy-roster-panel');
  const equipSection = document.getElementById('character-inventory-panel');
  if (!wrapper || !enemySection || !equipSection) return;

  wrapper.classList.toggle('tabs-open', sidePanelOpen);

  if (activePanel === 'enemies') {
    enemySection.classList.add('panel-section--active');
    equipSection.classList.remove('panel-section--active');
  } else {
    equipSection.classList.add('panel-section--active');
    enemySection.classList.remove('panel-section--active');
  }
}

function setupSideTabs() {
  const enemyTab = document.getElementById('enemy-roster-tab');
  const equipTab = document.getElementById('character-inventory-tab');

  if (enemyTab) {
    enemyTab.addEventListener('click', () => {
      if (activePanel === 'enemies') {
        sidePanelOpen = !sidePanelOpen;
      } else {
        activePanel = 'enemies';
        sidePanelOpen = true;
      }
      renderEnemyRoster();
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
}

// Hook into DOM ready
window.addEventListener('DOMContentLoaded', () => {
  setupSideTabs();
  updateSidePanelVisibility();
});

// Public function you can call whenever enemies change
window.refreshEnemyRoster = function () {
  if (!sidePanelOpen || activePanel !== 'enemies') return;
  renderEnemyRoster();
};
