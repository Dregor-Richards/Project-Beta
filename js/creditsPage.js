// Javascript for the credits page specifically

window.addEventListener('DOMContentLoaded', () => {
  playMusic('credits');
  const backBtn = document.getElementById('credits-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 200);
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('credits-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      playSfx('uiCancel');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 200);
    });
  }

  const container = document.getElementById('credits-scroll-container');
  if (!container) return;

  let scrollPos = 0;
  const speed = 0.3; // pixels per frame-ish

  function step() {
    // If user has scrolled manually, follow their position
    const current = container.scrollTop;

    // Advance
    scrollPos = current + speed;
    container.scrollTop = scrollPos;

    // If we reached the bottom, reset to top
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      container.scrollTop = 0;
      scrollPos = 0;
    }

    requestAnimationFrame(step);
  }

  //requestAnimationFrame(step);    UNCOMMENT ONCE CREDIT PAGE GROWS LONG, WILL ACTIVATE ABOVE CODE
});
