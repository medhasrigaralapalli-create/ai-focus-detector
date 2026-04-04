export const EMOTION_BACKEND_URL = 'http://localhost:5000';

export const DEFAULT_EMOTIONS = {
  happy: 0,
  neutral: 0,
  surprise: 0,
  fear: 0,
  disgust: 0,
  angry: 0,
  sad: 0,
};

const UI_NEUTRAL_OVERRIDE_THRESHOLD = 10;
const HISTORY_EVENT_NAME = 'emotion-history-updated';

export function normalizeEmotionScores(apiEmotions = []) {
  const normalized = { ...DEFAULT_EMOTIONS };
  apiEmotions.forEach((emotion) => {
    if (emotion?.label in normalized) {
      normalized[emotion.label] = emotion.percentage ?? 0;
    }
  });
  return normalized;
}

export function pickDisplayDominant(apiEmotions, apiDominant, emotionMeta) {
  if (!apiDominant || !Array.isArray(apiEmotions) || apiEmotions.length < 2) {
    return apiDominant;
  }

  const sorted = [...apiEmotions].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const top = sorted[0];
  const runnerUp = sorted[1];

  if (
    top?.label === 'neutral' &&
    runnerUp?.label &&
    (top.percentage - runnerUp.percentage) <= UI_NEUTRAL_OVERRIDE_THRESHOLD
  ) {
    return {
      ...runnerUp,
      percentage: runnerUp.percentage,
      emoji: runnerUp.emoji || emotionMeta?.[runnerUp.label]?.emoji || '?',
    };
  }

  return apiDominant;
}

export async function requestEmotionPrediction(imageData, signal) {
  const response = await fetch(`${EMOTION_BACKEND_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function storeAnalysisResult({ emotion, score, sourceMode, emotionMeta, lastStoredRef }) {
  if (!emotion) return;

  const now = Date.now();
  const lastStored = lastStoredRef?.current || {};
  const isLiveMode = sourceMode === 'live';
  const sameEmotion = lastStored.emotion === emotion;
  const confidenceDelta = Math.abs((lastStored.confidence || 0) - score);
  const elapsed = now - (lastStored.timestamp || 0);

  if (isLiveMode && sameEmotion && elapsed < 8000 && confidenceDelta < 8) {
    return;
  }

  const history = JSON.parse(localStorage.getItem('emotionHistory') || '[]');
  history.unshift({
    id: now,
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    confidence: score,
    date: new Date().toLocaleString(),
    emoji: emotionMeta?.[emotion]?.emoji || '?',
    timestamp: now,
    sourceMode,
  });

  const trimmed = history.slice(0, 20);
  localStorage.setItem('emotionHistory', JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent(HISTORY_EVENT_NAME, { detail: trimmed }));

  if (lastStoredRef) {
    lastStoredRef.current = { emotion, timestamp: now, confidence: score };
  }
}

export function subscribeToEmotionHistory(listener) {
  const wrapped = (event) => listener(event?.detail);
  window.addEventListener(HISTORY_EVENT_NAME, wrapped);
  return () => window.removeEventListener(HISTORY_EVENT_NAME, wrapped);
}
