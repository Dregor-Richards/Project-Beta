const HS_KEY = 'sandcrypt_highscores';

const DEFAULT_HIGHSCORES = [
  { name: 'Pixel', score: 500 },
  { name: 'Skinbones', score: 100 },
  { name: 'Dregor', score: 90 },
  { name: 'Eddard', score: 80 },
  { name: 'Bobbingo', score: 70 },
  { name: 'Talion', score: 60 },
  { name: 'Coraline', score: 50 },
  { name: 'Cinder', score: 40 },
  { name: 'Val', score: 30 },
  { name: 'Dan', score: 20 }
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

function saveHighScores(list) {
  localStorage.setItem(HS_KEY, JSON.stringify(list));
}

/**
 * Attempt to insert a new score.
 * Returns { updatedList, isHighScore }.
 */
function submitHighScore(name, score) {
  const list = loadHighScores();

  // Add and sort descending
  list.push({ name, score });
  list.sort((a, b) => b.score - a.score);

  // Keep top 10
  const trimmed = list.slice(0, 10);
  saveHighScores(trimmed);

  const isHighScore = trimmed.some(
    entry => entry.name === name && entry.score === score
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
