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

  // --- Character selector wiring ---

  const avatarPaths = [
    '../assets/sprites/Avatar1.png',
    '../assets/sprites/Avatar2.png',
    '../assets/sprites/Avatar3.png',
    '../assets/sprites/Avatar4.png',
  ];

  const leftImg = document.getElementById('char-left-img');
  const centerImg = document.getElementById('char-center-img');
  const rightImg = document.getElementById('char-right-img');

  const leftSlot = document.querySelector('.char-slot-left');
  const rightSlot = document.querySelector('.char-slot-right');

  const btnLeft = document.getElementById('char-left');
  const btnRight = document.getElementById('char-right');

  let currentIndex = typeof getSelectedAvatarIndex === 'function'
    ? getSelectedAvatarIndex()
    : 0;

  function wrapIndex(i) {
    if (i < 0) return 3;
    if (i > 3) return 0;
    return i;
  }

  function updateWheel() {
    if (!centerImg || !leftImg || !rightImg) return;

    // center is current
    centerImg.src = avatarPaths[currentIndex];

    // left and right neighbors in circular fashion
    const leftIndex = wrapIndex(currentIndex - 1);
    const rightIndex = wrapIndex(currentIndex + 1);

    leftImg.src = avatarPaths[leftIndex];
    rightImg.src = avatarPaths[rightIndex];

    // Always show three visible slots; CSS handles depth/scale.
    if (leftSlot) leftSlot.classList.remove('char-slot-hidden');
    if (rightSlot) rightSlot.classList.remove('char-slot-hidden');
  }

  if (btnLeft) {
    btnLeft.addEventListener('click', () => {
      currentIndex = wrapIndex(currentIndex - 1);
      playSfx('uiClick');
      updateWheel();
    });
  }

  if (btnRight) {
    btnRight.addEventListener('click', () => {
      currentIndex = wrapIndex(currentIndex + 1);
      playSfx('uiClick');
      updateWheel();
    });
  }

  // Initial draw for selector
  updateWheel();

  // --- Starting item selector wiring (mouse only) ---

  const startingItems = [
    {
      id: 'none',
      img: '../assets/sprites/Empty.png',
    },
    {
      id: 'start_item_1',
      img: '../assets/sprites/CoinPouch.png',
    },
    {
      id: 'start_item_2',
      img: '../assets/sprites/StartDoorKey.png',
    },
    {
      id: 'start_item_3',
      img: '../assets/sprites/FireWand.png',
    },
  ];

  let selectedItemIndex = 0; // start on "none"

  function updateItemWheel() {
    const leftItemImg = document.getElementById('item-left-img');
    const centerItemImg = document.getElementById('item-center-img');
    const rightItemImg = document.getElementById('item-right-img');

    if (!leftItemImg || !centerItemImg || !rightItemImg) return;

    const len = startingItems.length;
    const center = selectedItemIndex;
    const left = (center - 1 + len) % len;
    const right = (center + 1) % len;

    leftItemImg.src = startingItems[left].img;
    centerItemImg.src = startingItems[center].img;
    rightItemImg.src = startingItems[right].img;
  }

  const itemLeftBtn = document.getElementById('item-left');
  const itemRightBtn = document.getElementById('item-right');

  if (itemLeftBtn && itemRightBtn) {
    itemLeftBtn.addEventListener('click', () => {
      selectedItemIndex =
        (selectedItemIndex - 1 + startingItems.length) % startingItems.length;
      playSfx('uiClick');
      updateItemWheel();
    });

    itemRightBtn.addEventListener('click', () => {
      selectedItemIndex =
        (selectedItemIndex + 1) % startingItems.length;
      playSfx('uiClick');
      updateItemWheel();
    });

    // Initial draw for item wheel
    updateItemWheel();
  }

  // When Begin is clicked, store the chosen avatar index + starting item, then go to level
  if (goButton) {
    goButton.addEventListener('click', () => {
      if (typeof setSelectedAvatarIndex === 'function') {
        setSelectedAvatarIndex(currentIndex);
      }

      const selectedItem = startingItems[selectedItemIndex];
      sessionStorage.setItem(
        'startingItemId',
        selectedItem ? selectedItem.id : 'none'
      );

      if (selectedItem && selectedItem.id !== 'none') {
        sessionStorage.setItem('startingItemScorePenalty', '-10');
      } else {
        sessionStorage.removeItem('startingItemScorePenalty');
      }

      // NEW: initialize score once for this run
      let baseScore = 0;
      const penalty =
        Number(sessionStorage.getItem('startingItemScorePenalty')) || 0;
      const initialScore = baseScore + penalty;
      sessionStorage.setItem('playerScore', String(initialScore));

      goToLevel();
    });
  }

  // Enter key triggers GO, Escape closes open modals
  window.addEventListener('keydown', (event) => {
    const anyModalOpen =
      (rangeModal && !rangeModal.classList.contains('hidden')) ||
      (menuModal && !menuModal.classList.contains('hidden')) ||
      (controlModal && !controlModal.classList.contains('hidden'));

    // Character wheel: A / D / Arrow keys
    if (!anyModalOpen) {
      const key = event.key;

      // Move left: A or Left Arrow
      if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
        event.preventDefault();
        if (btnLeft) {
          btnLeft.click(); // Reuse existing click handler
        } else {
          currentIndex = wrapIndex(currentIndex - 1);
          playSfx('uiClick');
          updateWheel();
        }
        return;
      }

      // Move right: D or Right Arrow
      if (key === 'd' || key === 'D' || key === 'ArrowRight') {
        event.preventDefault();
        if (btnRight) {
          btnRight.click(); // Reuse existing click handler
        } else {
          currentIndex = wrapIndex(currentIndex + 1);
          playSfx('uiClick');
          updateWheel();
        }
        return;
      }
    }

    // Enter/E: trigger Begin when no modal is open
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