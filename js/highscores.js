const HS_KEY = 'sandcrypt_highscores';

const DEFAULT_HIGHSCORES = [
  { name: 'Pixel',    score: 500, avatarId: 'avatar4' },
  { name: 'Skinbones',score: 200, avatarId: 'avatar2' },
  { name: 'Dregor',   score: 150, avatarId: 'avatar1' },
  { name: 'Eddard',   score: 125, avatarId: 'avatar1' },
  { name: 'Bobbingo', score: 100, avatarId: 'avatar3' },
  { name: 'Talion',   score: 75,  avatarId: 'avatar1' },
  { name: 'Coraline', score: 65,  avatarId: 'avatar4' },
  { name: 'Cinder',   score: 50,  avatarId: 'avatar3' },
  { name: 'Val',      score: 40,  avatarId: 'avatar3' },
  { name: 'Dan',      score: 30,  avatarId: 'avatar2' }
];

function loadHighScores() {
  const raw = localStorage.getItem(HS_KEY);
  if (!raw) return [...DEFAULT_HIGHSCORES];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_HIGHSCORES];
    return parsed;
  } catch {
    return [...DEFAULT_HIGHSCORES];
  }
}

function saveHighScore(name, scoreValue) {
  const scores = getHighScores(); // from highScorePage.js or duplicated helper
  scores.push({ name, score: scoreValue });
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, 10);
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(trimmed));
}

function saveHighScores(list) {
  localStorage.setItem(HS_KEY, JSON.stringify(list));
}

/**
 * Attempt to insert a new score.
 * Returns { updatedList, isHighScore }.
 */
// highScores.js
function submitHighScore(name, score, avatarId = 'avatar1') {
  const list = loadHighScores();

  // Add and sort descending
  list.push({ name, score, avatarId });
  list.sort((a, b) => b.score - a.score);

  // Keep top 10
  const trimmed = list.slice(0, 10);
  saveHighScores(trimmed);

  const isHighScore = trimmed.some(
    entry =>
      entry.name === name &&
      entry.score === score &&
      entry.avatarId === avatarId
  );

  return { updatedList: trimmed, isHighScore };
}

/**
 * Check if a raw score would qualify for top 10 (before asking name).
 */
function wouldBeHighScore(score) {
  const list = loadHighScores();
  const minScore = list[list.length - 1]?.score ?? -Infinity;
  return score > minScore || list.length < 10;
}
