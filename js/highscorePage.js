// highscorePage.js

window.addEventListener('DOMContentLoaded', () => {
  playMusic('highscore');
  const tbody = document.getElementById('hs-table-body');
  if (!tbody) return;

  const list = loadHighScores(); // from highScores.js

  tbody.innerHTML = '';
  list.forEach((entry, index) => {
    const tr = document.createElement('tr');

    // Rank-based class
    if (index === 0) {
      tr.classList.add('hs-gold');        // gold
    } else if (index >= 1 && index <= 3) {
      tr.classList.add('hs-silver');      // silver
    } else if (index >= 4 && index <= 7) {
      tr.classList.add('hs-copper');      // copper
    } else {
      tr.classList.add('hs-plain');     // plain/white
    }

    const rankTd = document.createElement('td');
    rankTd.textContent = index + 1;

    const nameTd = document.createElement('td');
    nameTd.textContent = entry.name;

    const scoreTd = document.createElement('td');
    scoreTd.textContent = entry.score;

    tr.appendChild(rankTd);
    tr.appendChild(nameTd);
    tr.appendChild(scoreTd);

    tbody.appendChild(tr);
  });

  // Back to Title button with SFX + delay
  const backBtn = document.getElementById('highscore-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 250);
    });
  }
});
