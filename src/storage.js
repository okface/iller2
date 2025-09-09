// Local storage helpers for progress tracking
// Schema:
// quizProgress = {
//   perQuestion: { [id]: { attempts: n, correct: n } },
//   perCategory: { [category]: { attempts: n, correct: n } },
//   daily: { [yyyy-mm-dd]: { attempts: n, correct: n } }
// }

const STORAGE_KEY = 'medQuizProgress_v1';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { perQuestion:{}, perCategory:{}, daily:{} };
  } catch { return { perQuestion:{}, perCategory:{}, daily:{} }; }
}

function saveProgress(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function recordResult(question, wasCorrect) {
  const data = loadProgress();
  const today = new Date().toISOString().slice(0,10);
  const q = data.perQuestion[question.id] ||= { attempts:0, correct:0 };
  q.attempts++; if (wasCorrect) q.correct++;
  const c = data.perCategory[question.category] ||= { attempts:0, correct:0 };
  c.attempts++; if (wasCorrect) c.correct++;
  const d = data.daily[today] ||= { attempts:0, correct:0 };
  d.attempts++; if (wasCorrect) d.correct++;
  saveProgress(data);
}

function resetProgress() { localStorage.removeItem(STORAGE_KEY); }

function getCategoryStats() {
  const { perCategory } = loadProgress();
  return Object.entries(perCategory).map(([cat, val]) => ({
    category: cat,
    attempts: val.attempts,
    correct: val.correct,
    accuracy: val.attempts ? val.correct / val.attempts : 0
  })).sort((a,b) => a.accuracy - b.accuracy);
}

function getDailyStats(days = 14) {
  const { daily } = loadProgress();
  return Object.keys(daily).sort().slice(-days).map(date => ({ date, ...daily[date], accuracy: daily[date].attempts ? daily[date].correct / daily[date].attempts : 0 }));
}

function overallStats() {
  const data = loadProgress();
  let attempts=0, correct=0;
  for (const v of Object.values(data.perQuestion)) { attempts += v.attempts; correct += v.correct; }
  return { attempts, correct, accuracy: attempts ? correct/attempts : 0 };
}

export { loadProgress, saveProgress, recordResult, resetProgress, getCategoryStats, getDailyStats, overallStats };
