// Collects and reads audio files (.wav) to be played in events

const sfx = {
  enemyDeath:       new Audio('../assets/sfx/24_orc_death_spin.wav'),
  playerHit:        new Audio('../assets/sfx/punch_3.wav'),
  doorWin:          new Audio('../assets/sfx/Piano_assending_dissonent.wav'),  //Awesome
  death:            new Audio('../assets/sfx/Scream.wav'),
  beatBoss:         new Audio('../assets/sfx/8_bit_positive_long.wav'),
  killMimic:        new Audio('../assets/sfx/Monster_Roar_2.wav'),
  heartPickup:      new Audio('../assets/sfx/08_human_charge_2.wav'),
  itemPickup:       new Audio('../assets/sfx/Check 1.wav'),
  stonePickup:      new Audio('../assets/sfx/Ghost_moan_2.wav'),
  useIceWand:       new Audio('../assets/sfx/13_Ice_explosion_01.wav'),
  useFireWand:      new Audio('../assets/sfx/24_orc_death_spin.wav'),  // Could later switch to fire specific
  useLightningWand: new Audio('../assets/sfx/08_human_charge_2.wav'), // Same as Heart pickup for now
  useWyrdStone:     new Audio('../assets/sfx/Spooky Ambience.wav'),  // Could Make Shorter
  lootChest:        new Audio('../assets/sfx/Metal_resonance.wav'),
  selectLoot:       new Audio('../assets/sfx/sci_fi_confirm.wav'),
  mimicTransform:   new Audio('../assets/sfx/Ghost_scream_3.wav'),
  equippedItem:     new Audio('../assets/sfx/Coin Flip_3.wav'),
  uiClick:          new Audio('../assets/sfx/synth_cancel.wav'),   // Ended up matching Cancel for now
  uiConfirm:        new Audio('../assets/sfx/synth_warning.wav'),
  uiCancel:         new Audio('../assets/sfx/synth_cancel.wav'),
  uiInventory:      new Audio('../assets/sfx/Keys_pick up.wav'),    // Could Be Better
  uiGlossary:       new Audio('../assets/sfx/Writing.wav'),
  skipTile:         new Audio('../assets/sfx/44_Sleep_01.wav'),
};

function playSfx(name) {
  const sound = sfx[name];
  if (!sound) return;

  // Rewind so rapid repeats work
  sound.currentTime = 0;
  sound.play().catch(() => {
    // Ignore play errors (e.g. autoplay restrictions)
  });
}

const music = {
  setup:       new Audio('../assets/music/Goblins_Den_(Regular).wav'),   // levelSetup.html   - Will change later
  level:       new Audio('../assets/music/Goblins_Dance_(Battle).wav'),  // level.html        - Will change later
  boss:        new Audio('../assets/music/Larger_Than_Life_Battle_Sequence.wav'),
  levelDark:   new Audio('../assets/music/02.To_Grind_Out_Your_Soul.wav'),  // CHange Later
  highscore:   new Audio('../assets/music/Ghost chior.wav'),             // highScore.html    - Will change later
  credits:     new Audio('../assets/music/Ghost chior.wav'),             // credits.html      - Will change later
};

// Configure looping + base volume for all music
Object.values(music).forEach(track => {
  track.loop = true;
  track.volume = 0.35; // gentle by default; tweak to taste
});

let currentMusic = null;

function playMusic(name) {
  const track = music[name];
  if (!track) return;

  // If this track is already playing, do nothing
  if (currentMusic === track && !currentMusic.paused) {
    return;
  }

  // If a different track is playing, stop it
  if (currentMusic && currentMusic !== track) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  currentMusic = track;

  // Start playback; may only succeed after a user gesture
  currentMusic.play().catch(() => {
    // Ignore autoplay errors; page interactions will unlock it
  });
}

function playMenuMusic() {
  playMusic('setup');    // index.html, levelSetup.html
}

function playLevelMusic() {
  playMusic('level');    // normal levels
}

function playBossMusic() {
  playMusic('boss');     // boss floors
}

function playDarkLevelMusic() {
  playMusic('levelDark');  // dark variant
}

function playHighscoreMusic() {
  playMusic('highscore');
}

function playCreditsMusic() {
  playMusic('credits');
}

function stopMusic() {
  if (!currentMusic) return;
  currentMusic.pause();
  currentMusic.currentTime = 0;
  currentMusic = null;
}

// --- Master volume controls ---

// 0–1 values; default 100% (1.0)
let sfxVolume = 1.0;
let musicVolume = 1.0;

// Apply current volumes to all loaded Audio objects
function applyVolumes() {
  // SFX
  Object.values(sfx).forEach(sound => {
    // base volumes can be baked into the files; treat these as master
    sound.volume = sfxVolume;
  });

  // Music
  Object.values(music).forEach(track => {
    track.volume = musicVolume * 0.35; // 0.35 was your base music level
  });
}

// Load saved volumes from localStorage (0–10 scale)
(function initVolumesFromStorage() {
  try {
    const savedSfx = localStorage.getItem('pbo_sfxVolume');
    const savedMusic = localStorage.getItem('pbo_musicVolume');

    if (savedSfx !== null) {
      const v = Math.min(10, Math.max(0, Number(savedSfx)));
      sfxVolume = v / 10;
    }

    if (savedMusic !== null) {
      const v = Math.min(10, Math.max(0, Number(savedMusic)));
      musicVolume = v / 10;
    }
  } catch (e) {
    // ignore storage errors
  }

  applyVolumes();
})();

// Public helpers to change volume in 10% steps (0–10)
function setSfxVolumeStep(step) {
  const clamped = Math.min(10, Math.max(0, step));
  sfxVolume = clamped / 10;
  try {
    localStorage.setItem('pbo_sfxVolume', String(clamped));
  } catch (e) {}
  applyVolumes();
}

function setMusicVolumeStep(step) {
  const clamped = Math.min(10, Math.max(0, step));
  musicVolume = clamped / 10;
  try {
    localStorage.setItem('pbo_musicVolume', String(clamped));
  } catch (e) {}
  applyVolumes();
}

// Getters for UI
function getSfxVolumeStep() {
  return Math.round(sfxVolume * 10);
}

function getMusicVolumeStep() {
  return Math.round(musicVolume * 10);
}