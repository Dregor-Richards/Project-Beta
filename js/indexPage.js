// Javascript Specific to index.html

window.addEventListener('DOMContentLoaded', () => {
  playMusic('index');
  const startButton = document.getElementById('start-button');
  const quickStartBtn = document.getElementById('quick-start');
  const highscoreBtn = document.querySelector('.highscore-button');
  const creditsBtn = document.getElementById('credits-button');

  // Start button
  if (startButton) {
    startButton.addEventListener('click', () => {
      playSfx('uiConfirm');
      setTimeout(() => {
        window.location.href = 'levelSetup.html';
      }, 250);
    });
  }

  // High Scores button
  if (highscoreBtn) {
    highscoreBtn.addEventListener('click', () => {
      playSfx('uiClick');
      setTimeout(() => {
        window.location.href = 'highScore.html';
      }, 250);
    });
  }

  // ===== Quick Start wiring =====
  if (quickStartBtn) {
    quickStartBtn.addEventListener('click', () => {
      playSfx('uiConfirm');

      const base = sessionStorage.getItem('baseDifficulty');

      setTimeout(() => {
        if (base !== null) {
          // We have a previous chosen difficulty → jump straight to level
          sessionStorage.setItem('currentDifficulty', base);

          // Fresh run state
          sessionStorage.removeItem('playerLives');
          sessionStorage.removeItem('playerScore');
          sessionStorage.removeItem('inventory');

          window.location.href = 'level.html';
        } else {
          // No prior run this session → go to setup
          window.location.href = 'levelSetup.html';
        }
      }, 250);
    });
  }

  if (creditsBtn) {
    creditsBtn.addEventListener('click', () => {
      playSfx('uiClick');             // or uiConfirm/uiCancel as you prefer
      setTimeout(() => {
        window.location.href = 'credits.html';
      }, 200);                        // match your other UI delays
    });
  }

  // Enter/E = Start, F = Quick Start
  window.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'Enter' || key === 'e' || key === 'E') {
      event.preventDefault();
      if (startButton) startButton.click();
      return;
    }

    if (key === 'f' || key === 'F') {
      if (quickStartBtn) {
        event.preventDefault();
        quickStartBtn.click();
      }
    }
  });

  // Controls / Instructions modals
  const controlButton = document.getElementById('index-controls-button');
  const instructionsButton = document.getElementById('index-instructions-button');
  const controlModal = document.getElementById('control-modal');
  const instructionsModal = document.getElementById('instructions-modal');
  const controlOk = document.getElementById('control-ok');
  const instructionsOk = document.getElementById('instructions-ok');

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

  if (instructionsButton && instructionsModal && instructionsOk) {
    instructionsButton.addEventListener('click', () => {
      instructionsModal.classList.remove('hidden');
      playSfx('uiClick');
    });

    instructionsOk.addEventListener('click', () => {
      instructionsModal.classList.add('hidden');
      playSfx('uiCancel');
    });
  }

  // Escape closes any open modal
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    let closed = false;

    if (!controlModal.classList.contains('hidden')) {
      controlModal.classList.add('hidden');
      closed = true;
    }

    if (!instructionsModal.classList.contains('hidden')) {
      instructionsModal.classList.add('hidden');
      closed = true;
    }

    if (closed) {
      playSfx('uiCancel');
      event.preventDefault();
    }
  });
});
