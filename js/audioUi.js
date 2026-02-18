function initAudioButtons() {
  const musicBtn = document.getElementById('music-button');
  const sfxBtn   = document.getElementById('sfx-button');

  if (!musicBtn && !sfxBtn) return;

  function updateLabels() {
    if (musicBtn) {
      const m = getMusicVolumeStep();
      musicBtn.textContent = `Music: ${m}`;
    }
    if (sfxBtn) {
      const s = getSfxVolumeStep();
      sfxBtn.textContent = `SFX: ${s}`;
    }
  }

  updateLabels();

  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const newMusic = (getMusicVolumeStep() + 1) % 11; // 0–10
      setMusicVolumeStep(newMusic);
      playSfx('uiClick');
      updateLabels();
    });
  }

  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      const newSfx = (getSfxVolumeStep() + 1) % 11;
      setSfxVolumeStep(newSfx);
      playSfx('uiClick');
      updateLabels();
    });
  }
}

window.addEventListener('DOMContentLoaded', initAudioButtons);