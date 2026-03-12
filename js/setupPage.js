// Javascript specific to levelSetup.html

function showMenuConfirm() {
  const menuModal = document.getElementById('setup-menu-modal');
  if (menuModal) {
    menuModal.classList.remove('hidden');
    playSfx('uiClick');
  }
}

function goToLevel() {
  const raw = document.getElementById("size-input").value;
  const n = Number(raw);

  // Difficulty must be 1–12
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    const rangeModal = document.getElementById('range-modal');
    if (rangeModal) {
      rangeModal.classList.remove('hidden');
      playSfx('uiCancel');
    }
    return;
  }

  const difficulty = n;
  sessionStorage.setItem('baseDifficulty', String(difficulty));
  sessionStorage.setItem('currentDifficulty', String(difficulty));

  // Keep score when starting/continuing a run
  // sessionStorage.removeItem('playerScore');  // REMOVE this line

  // Lives and level number can still reset as designed
  sessionStorage.removeItem('playerLives');
  resetLevelNumber();

  playSfx('uiConfirm');
  setTimeout(() => {
    window.location.href = "level.html";
  }, 250);
}

// Wait for DOM before wiring events
window.addEventListener('DOMContentLoaded', () => {
  playMusic('setup');
  const controlButton = document.querySelector('.control-button');
  const controlModal = document.getElementById('control-modal');
  const controlOk = document.getElementById('control-ok');

  const menuModal = document.getElementById('setup-menu-modal');
  const menuYes = document.getElementById('setup-menu-yes');
  const menuNo = document.getElementById('setup-menu-no');

  const rangeModal = document.getElementById('range-modal');
  const rangeOk = document.getElementById('range-ok');

  const goButton = document.getElementById('go-button');

  // Controls button + modal
  if (controlButton && controlModal && controlOk) {
    controlButton.addEventListener('click', () => {
      controlModal.classList.remove('hidden');
      playSfx('uiClick');
    });

    controlOk.addEventListener('click', () => {
      controlModal.classList.add('hidden');
      playSfx('uiCancel');
    });
  }

  // Menu modal wiring
  if (menuYes && menuModal) {
    menuYes.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 250);
    });
  }

  if (menuNo && menuModal) {
    menuNo.addEventListener('click', () => {
      menuModal.classList.add('hidden');
      playSfx('uiCancel');
    });
  }

  // Range modal wiring
  if (rangeModal && rangeOk) {
    rangeOk.addEventListener('click', () => {
      rangeModal.classList.add('hidden');
      playSfx('uiCancel');
    });
  }

  // Begin button click
  if (goButton) {
    goButton.addEventListener('click', () => {
      goToLevel();
    });
  }

  // Enter key triggers GO, Escape closes open modals
  window.addEventListener('keydown', (event) => {
    const anyModalOpen =
      (rangeModal && !rangeModal.classList.contains('hidden')) ||
      (menuModal && !menuModal.classList.contains('hidden')) ||
      (controlModal && !controlModal.classList.contains('hidden'));

    // Enter: trigger Begin when no modal is open
    if (!anyModalOpen &&
        (event.key === 'Enter' || event.key === 'e' || event.key === 'E')) {
      event.preventDefault();
      if (goButton) goButton.click();
      return;
    }

    // Escape: close whichever modal(s) are open
    if (event.key === 'Escape') {
      let closed = false;

      if (rangeModal && !rangeModal.classList.contains('hidden')) {
        rangeModal.classList.add('hidden');
        closed = true;
      }

      if (menuModal && !menuModal.classList.contains('hidden')) {
        menuModal.classList.add('hidden');
        closed = true;
      }

      if (controlModal && !controlModal.classList.contains('hidden')) {
        controlModal.classList.add('hidden');
        closed = true;
      }

      if (closed) {
        playSfx('uiCancel');
        event.preventDefault();
      }
    }
  });
});
