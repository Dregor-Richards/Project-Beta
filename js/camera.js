
function clampCameraToGrid() {
  const viewport = document.querySelector('.level-viewport');
  const grid = document.getElementById('level-grid');
  if (!viewport || !grid) return;

  const viewportRect = viewport.getBoundingClientRect();
  const viewportWidth = viewportRect.width;
  const viewportHeight = viewportRect.height;

  const nativeGridWidth = grid.offsetWidth;
  const nativeGridHeight = grid.offsetHeight;

  const scaledGridWidth = nativeGridWidth * cameraZoom;
  const scaledGridHeight = nativeGridHeight * cameraZoom;

  // How much extra "void" we allow around the grid (0.5 = up to half a grid offscreen)
  const overscrollFactor = 0.5;

  // Offsets = grid top-left relative to viewport top-left
  const minOffsetX = viewportWidth - scaledGridWidth - scaledGridWidth * overscrollFactor;
  const maxOffsetX = scaledGridWidth * overscrollFactor;

  const minOffsetY = viewportHeight - scaledGridHeight - scaledGridHeight * overscrollFactor;
  const maxOffsetY = scaledGridHeight * overscrollFactor;

  cameraOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, cameraOffsetX));
  cameraOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, cameraOffsetY));
}


function applyCameraTransform() {
  const wrapper = document.querySelector('.level-grid-wrapper');
  if (!wrapper) return;
  wrapper.style.transform =
    `translate(${cameraOffsetX}px, ${cameraOffsetY}px) scale(${cameraZoom})`;
}

function centerCameraOnPlayer() {
  const viewport = document.querySelector('.level-viewport');
  const grid = document.getElementById('level-grid');
  if (!viewport || !grid) return;

  const cells = getAllCells();
  const playerCell = findCellByIndex(cells, avatarIndex);
  if (!playerCell) return;

  const viewportRect = viewport.getBoundingClientRect();
  const gridRect = grid.getBoundingClientRect();
  const cellRect = playerCell.getBoundingClientRect();

  // Player center in *grid* coordinates
  const playerCenterX = (cellRect.left - gridRect.left) + cellRect.width / 2;
  const playerCenterY = (cellRect.top - gridRect.top) + cellRect.height / 2;

  // We want the player at the center of the viewport
  const targetOffsetX = (viewportRect.width / 2) - playerCenterX;
  const targetOffsetY = (viewportRect.height / 2) - playerCenterY;

  cameraOffsetX = targetOffsetX;
  cameraOffsetY = targetOffsetY;

  // Respect current clamp / overscroll
  clampCameraToGrid();
  applyCameraTransform();
}

document.addEventListener('keydown', (e) => {
  const zoomStep = 0.1;

  if (e.key === '=' || e.key === '+') {
    cameraZoom = Math.min(2.0, cameraZoom + zoomStep);
    clampCameraToGrid();
    applyCameraTransform();
  } else if (e.key === '-' || e.key === '_') {
    cameraZoom = Math.max(0.5, cameraZoom - zoomStep);
    clampCameraToGrid();
    applyCameraTransform();
  } else if (e.key === 'c' || e.key === 'C') {
    centerCameraOnPlayer();
  }
});

const viewport = document.querySelector('.level-viewport');
const gridWrapper = document.querySelector('.level-grid-wrapper');
const gridEl = document.getElementById('level-grid');

// Mouse wheel zoom on viewport
if (viewport) {
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    console.log('wheel event');
    const zoomFactor = 0.1;
    const oldZoom = cameraZoom;
    const zoomDir = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(2.0, Math.max(0.5, cameraZoom + zoomDir * zoomFactor));

    if (newZoom === oldZoom) return;

    const rect = viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    cameraOffsetX = cx - (cx - cameraOffsetX) * (newZoom / oldZoom);
    cameraOffsetY = cy - (cy - cameraOffsetY) * (newZoom / oldZoom);

    cameraZoom = newZoom;
    clampCameraToGrid();
    applyCameraTransform();
  }, { passive: false });

  // Block context menu so right-drag feels clean
  viewport.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Use the grid itself for panning
if (gridEl) {
  gridEl.addEventListener('mousedown', (e) => {
    if (e.button !== 2) return; // right button only
    e.preventDefault();
    isPanning = true;
        console.log('panning start', e.button);
    if (viewport) viewport.classList.add('is-panning');
    panStartX = e.clientX;
    panStartY = e.clientY;
    panOriginX = cameraOffsetX;
    panOriginY = cameraOffsetY;
  });
}

window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  const dx = e.clientX - panStartX;
  const dy = e.clientY - panStartY;
  cameraOffsetX = panOriginX + dx;
  cameraOffsetY = panOriginY + dy;
  clampCameraToGrid();
  applyCameraTransform();
});

window.addEventListener('mouseup', () => {
  if (!isPanning) return;
  isPanning = false;
  if (viewport) viewport.classList.remove('is-panning');
});
