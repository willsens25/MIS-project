import { useState, useEffect } from 'react';
import {
  MascotMood,
  MoodMetrics,
  getMascotMoodMetrics,
  subscribeToMascotMood,
  MASCOT_MOOD_CONFIGS
} from '../services/mascotMoodTracker';

export function useMascotMood() {
  const [metrics, setMetrics] = useState<MoodMetrics>(() => getMascotMoodMetrics());

  useEffect(() => {
    // Sync initially
    setMetrics(getMascotMoodMetrics());

    // Subscribe to changes
    const unsubscribe = subscribeToMascotMood((updated) => {
      setMetrics({ ...updated });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const moodConfig = MASCOT_MOOD_CONFIGS[metrics.currentMood];

  return {
    mood: metrics.currentMood,
    metrics,
    moodConfig,
    isShortcutDominant: metrics.shortcutRatio >= 0.35 && metrics.shortcutCount >= 2,
    isClickDominant: metrics.shortcutRatio < 0.2 && metrics.clickCount >= 3
  };
}
