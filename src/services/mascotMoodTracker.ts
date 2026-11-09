/**
 * Hidden Mascot Mood Tracker Service
 * Passively observes user interaction patterns (keyboard shortcuts vs. mouse clicks,
 * pacing, exploration, task completion) to determine the mascot's subtle emotional expression.
 */

export type MascotMood = 'focused' | 'cheerful' | 'chill' | 'curious' | 'zen';

export interface MoodMetrics {
  shortcutCount: number;
  clickCount: number;
  totalInteractions: number;
  shortcutRatio: number; // 0 to 1
  consecutiveShortcuts: number;
  consecutiveClicks: number;
  tabSwitchCount: number;
  taskCompletedCount: number;
  currentMood: MascotMood;
  lastInteractionTime: number;
  lastInteractionType: 'shortcut' | 'click' | 'task' | 'tab' | 'idle';
  lastShortcutKey?: string;
  sessionStartTime: number;
}

const STORAGE_KEY = 'mis_mascot_mood_metrics_v2';
const MOOD_EVENT_NAME = 'mis_mascot_mood_changed';

const DEFAULT_METRICS: MoodMetrics = {
  shortcutCount: 0,
  clickCount: 0,
  totalInteractions: 0,
  shortcutRatio: 0,
  consecutiveShortcuts: 0,
  consecutiveClicks: 0,
  tabSwitchCount: 0,
  taskCompletedCount: 0,
  currentMood: 'chill',
  lastInteractionTime: Date.now(),
  lastInteractionType: 'idle',
  sessionStartTime: Date.now()
};

// In-memory state synchronized with localStorage
let state: MoodMetrics = loadInitialMetrics();
const listeners = new Set<(metrics: MoodMetrics) => void>();

function loadInitialMetrics(): MoodMetrics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Decay metrics if session is old (more than 4 hours)
      const ageHours = (Date.now() - (parsed.lastInteractionTime || 0)) / (1000 * 60 * 60);
      if (ageHours < 4) {
        return {
          ...DEFAULT_METRICS,
          ...parsed,
          sessionStartTime: parsed.sessionStartTime || Date.now()
        };
      }
    }
  } catch {
    // ignore parsing errors
  }
  return { ...DEFAULT_METRICS };
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function notifyListeners() {
  persistState();
  listeners.forEach(cb => {
    try {
      cb(state);
    } catch {
      // ignore callback error
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(MOOD_EVENT_NAME, { detail: state })
    );
  }
}

/**
 * Calculates current mood based on interaction ratio & pacing
 */
function evaluateMood(m: MoodMetrics): MascotMood {
  const currentHour = new Date().getHours();
  const isNightHours = currentHour >= 22 || currentHour < 5;
  const isIdle = Date.now() - m.lastInteractionTime > 45000;

  // 1. Zen / Sleepy mood during late hours or long calm idle
  if (isNightHours && isIdle) {
    return 'zen';
  }

  // 2. Focused / Power User: high shortcut usage ratio or multiple shortcuts in a row
  if (
    (m.shortcutCount >= 2 && m.shortcutRatio >= 0.35) ||
    m.consecutiveShortcuts >= 2
  ) {
    return 'focused';
  }

  // 3. Cheerful / Happy: recently completed tasks or energetic balanced interactions
  if (m.taskCompletedCount > 0 && Date.now() - m.lastInteractionTime < 40000) {
    return 'cheerful';
  }

  // 4. Curious / Explorer: frequently switching tabs / searching
  if (m.tabSwitchCount >= 3 && Date.now() - m.lastInteractionTime < 45000) {
    return 'curious';
  }

  // 5. Default baseline: Chill (casual clicking & browsing)
  return 'chill';
}

/**
 * Record a keyboard shortcut interaction
 */
export function recordShortcutInteraction(keyCombo?: string): MoodMetrics {
  const now = Date.now();
  const nextShortcuts = state.shortcutCount + 1;
  const nextConsecutive = state.consecutiveShortcuts + 1;
  const total = nextShortcuts + state.clickCount;
  const ratio = total > 0 ? nextShortcuts / total : 0;

  state = {
    ...state,
    shortcutCount: nextShortcuts,
    consecutiveShortcuts: nextConsecutive,
    consecutiveClicks: 0,
    totalInteractions: total,
    shortcutRatio: Math.round(ratio * 100) / 100,
    lastInteractionTime: now,
    lastInteractionType: 'shortcut',
    lastShortcutKey: keyCombo || state.lastShortcutKey
  };

  state.currentMood = evaluateMood(state);
  notifyListeners();
  return state;
}

/**
 * Record a mouse click interaction
 */
export function recordClickInteraction(): MoodMetrics {
  const now = Date.now();
  const nextClicks = state.clickCount + 1;
  const nextConsecutiveClicks = state.consecutiveClicks + 1;
  const total = state.shortcutCount + nextClicks;
  const ratio = total > 0 ? state.shortcutCount / total : 0;

  state = {
    ...state,
    clickCount: nextClicks,
    consecutiveClicks: nextConsecutiveClicks,
    consecutiveShortcuts: 0,
    totalInteractions: total,
    shortcutRatio: Math.round(ratio * 100) / 100,
    lastInteractionTime: now,
    lastInteractionType: 'click'
  };

  state.currentMood = evaluateMood(state);
  notifyListeners();
  return state;
}

/**
 * Record a division tab or subtab switch (curiosity metric)
 */
export function recordTabSwitchInteraction(): MoodMetrics {
  const now = Date.now();
  state = {
    ...state,
    tabSwitchCount: state.tabSwitchCount + 1,
    lastInteractionTime: now,
    lastInteractionType: 'tab'
  };
  state.currentMood = evaluateMood(state);
  notifyListeners();
  return state;
}

/**
 * Record task or report completion (joy / cheer metric)
 */
export function recordTaskCompletedInteraction(): MoodMetrics {
  const now = Date.now();
  state = {
    ...state,
    taskCompletedCount: state.taskCompletedCount + 1,
    lastInteractionTime: now,
    lastInteractionType: 'task'
  };
  state.currentMood = evaluateMood(state);
  notifyListeners();
  return state;
}

/**
 * Get the current mood metrics snapshot
 */
export function getMascotMoodMetrics(): MoodMetrics {
  return state;
}

/**
 * Subscribe to mood changes across any component
 */
export function subscribeToMascotMood(callback: (metrics: MoodMetrics) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Mood configuration details (for tooltips, secret inspector, and expression descriptions)
 */
export const MASCOT_MOOD_CONFIGS: Record<
  MascotMood,
  {
    label: string;
    description: string;
    cause: string;
    auraGlow: string;
    borderRing: string;
    badgeEmoji: string;
  }
> = {
  focused: {
    label: 'Fokus & Gesit (Power User)',
    description: 'Maskot terlihat bersemangat dengan tatapan tajam dan senyum percaya diri!',
    cause: 'Terpicu karena Anda sering bernavigasi menggunakan pintasan keyboard (Alt/Ctrl hotkeys).',
    auraGlow: 'shadow-[0_0_16px_rgba(99,102,241,0.5)]',
    borderRing: 'ring-indigo-400 dark:ring-indigo-300',
    badgeEmoji: '⚡'
  },
  cheerful: {
    label: 'Ceria & Bersemangat',
    description: 'Maskot tersenyum lebar dengan pipi merona bahagia.',
    cause: 'Terpicu oleh tugas yang baru saja selesai diproses atau interaksi yang sukses.',
    auraGlow: 'shadow-[0_0_16px_rgba(16,185,129,0.5)]',
    borderRing: 'ring-emerald-400 dark:ring-emerald-300',
    badgeEmoji: '✨'
  },
  chill: {
    label: 'Santai & Ramah',
    description: 'Maskot tersenyum ramah dan bersahaja dengan tatapan teduh.',
    cause: 'Pola interaksi kasual menggunakan mouse klik dengan ritme yang tenang.',
    auraGlow: 'shadow-[0_0_14px_rgba(20,184,166,0.4)]',
    borderRing: 'ring-teal-400 dark:ring-teal-300',
    badgeEmoji: '🍵'
  },
  curious: {
    label: 'Penasaran & Eksploratif',
    description: 'Salah satu alis maskot terangkat penasaran dengan mulut sedikit terbuka.',
    cause: 'Terpicu karena Anda sering berpindah divisi dan menjelajahi berbagai modul.',
    auraGlow: 'shadow-[0_0_15px_rgba(14,165,233,0.5)]',
    borderRing: 'ring-cyan-400 dark:ring-cyan-300',
    badgeEmoji: '🔍'
  },
  zen: {
    label: 'Tenang & Mengantuk (Zen)',
    description: 'Mata maskot terpejam damai (^_^) dengan senyuman lembut.',
    cause: 'Waktu malam hari atau jeda waktu membaca yang hening dan damai.',
    auraGlow: 'shadow-[0_0_14px_rgba(168,85,247,0.4)]',
    borderRing: 'ring-purple-400 dark:ring-purple-300',
    badgeEmoji: '🌙'
  }
};

/**
 * Initialize automatic global DOM interaction listeners (runs once per window)
 */
let isInitialized = false;
export function initMascotMoodTracker() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // Track keyboard shortcuts
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      // Ignore bare modifier keys
      if (['Alt', 'Control', 'Meta', 'Shift'].includes(e.key)) return;

      const hasModifier = e.altKey || e.ctrlKey || e.metaKey;
      const isStandaloneHotkey = e.key === '?' || (e.key === 'Escape' && !e.target);

      if (hasModifier || isStandaloneHotkey) {
        const combo = [
          e.metaKey ? 'Cmd' : '',
          e.ctrlKey ? 'Ctrl' : '',
          e.altKey ? 'Alt' : '',
          e.shiftKey ? 'Shift' : '',
          e.key.toUpperCase()
        ]
          .filter(Boolean)
          .join('+');

        recordShortcutInteraction(combo);
      }
    },
    { passive: true }
  );

  // Track mouse clicks on buttons, links, or interactive elements
  window.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select');

      if (isInteractive) {
        recordClickInteraction();
      }
    },
    { passive: true }
  );
}

// Auto-run listener setup on import in browser environment
if (typeof window !== 'undefined') {
  initMascotMoodTracker();
}
