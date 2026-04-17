window.addEventListener('DOMContentLoaded', () => {
  playHighscoreMusic();
  const tbody = document.getElementById('hs-table-body');
  if (!tbody) return;

  function renderTable() {
    const list = loadHighScores();
    tbody.innerHTML = '';
    list.forEach((entry, index) => {
      const tr = document.createElement('tr');

      if (index === 0) {
        tr.classList.add('hs-gold');
      } else if (index >= 1 && index <= 3) {
        tr.classList.add('hs-silver');
      } else if (index >= 4 && index <= 7) {
        tr.classList.add('hs-copper');
      } else {
        tr.classList.add('hs-plain');
      }

      const rankTd = document.createElement('td');
      rankTd.textContent = index + 1;

      // Avatar cell
      const avatarTd = document.createElement('td');
      const img = document.createElement('img');
      img.classList.add('highscore-avatar');

      // Use avatarId if present; fall back to avatar1
      const avatarId = entry.avatarId || 'avatar1';
      img.src = `../assets/sprites/${avatarId}.png`;
      img.alt = avatarId;

      avatarTd.appendChild(img);

      const nameTd = document.createElement('td');
      nameTd.textContent = entry.name;

      const scoreTd = document.createElement('td');
      scoreTd.textContent = entry.score;

      tr.appendChild(rankTd);
      tr.appendChild(avatarTd);
      tr.appendChild(nameTd);
      tr.appendChild(scoreTd);
      tbody.appendChild(tr);
    });
  }

  renderTable();

  const backBtn = document.getElementById('highscore-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 250);
    });
  }

  // === Reset scores ===
  const resetBtn = document.getElementById('highscore-reset');
  const resetModal = document.getElementById('hs-reset-modal');
  const resetConfirm = document.getElementById('hs-reset-confirm');
  const resetCancel = document.getElementById('hs-reset-cancel');

  function openResetModal() {
    if (!resetModal) return;
    resetModal.classList.remove('hidden');
    playSfx('uiClick');
  }

  function closeResetModal() {
    if (!resetModal) return;
    resetModal.classList.add('hidden');
    playSfx('uiCancel');
  }

  if (resetBtn && resetModal && resetConfirm && resetCancel) {
    resetBtn.addEventListener('click', openResetModal);

    resetCancel.addEventListener('click', closeResetModal);

    resetConfirm.addEventListener('click', () => {
      // Reset localStorage to defaults
      saveHighScores([...DEFAULT_HIGHSCORES]);
      renderTable();
      playSfx('uiConfirm');
      closeResetModal();
    });
  }
});
