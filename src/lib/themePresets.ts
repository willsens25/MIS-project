export type ColorPresetId =
  | 'corporate-blue'
  | 'deep-forest'
  | 'royal-indigo'
  | 'crimson-dharma'
  | 'ocean-teal'
  | 'sunset-amber';

export interface ColorThemePreset {
  id: ColorPresetId;
  name: string;
  tagline: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  gradientClass: string;
  badgeBg: string;
  badgeText: string;
  accentRing: string;
}

export const COLOR_PRESETS: ColorThemePreset[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    tagline: 'Eksekutif & Modern',
    description: 'Aksen biru korporat tegas dipadu biru langit, bernuansa profesional dan stabil.',
    primaryHex: '#2563eb', // blue-600
    secondaryHex: '#0284c7', // sky-600
    gradientClass: 'from-blue-600 to-sky-600',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/70',
    badgeText: 'text-blue-700 dark:text-blue-300',
    accentRing: 'ring-blue-500'
  },
  {
    id: 'deep-forest',
    name: 'Deep Forest',
    tagline: 'Alami & Harmonis',
    description: 'Aksen hijau zamrud hutan mendalam berpadu emas sage hangat yang menenangkan.',
    primaryHex: '#059669', // emerald-600
    secondaryHex: '#d97706', // amber-600
    gradientClass: 'from-emerald-600 to-amber-600',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentRing: 'ring-emerald-500'
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    tagline: 'Orisinal Lamrimnesia',
    description: 'Aksen indigo klasik dipadu violet ametis, anggun, bijaksana, dan spiritual.',
    primaryHex: '#4f46e5', // indigo-600
    secondaryHex: '#7c3aed', // violet-600
    gradientClass: 'from-indigo-600 to-violet-600',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/70',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    accentRing: 'ring-indigo-500'
  },
  {
    id: 'crimson-dharma',
    name: 'Crimson Dharma',
    tagline: 'Agung & Bersemangat',
    description: 'Warna jubah rubi monastik klasik yang agung berpadu emas safron hangat.',
    primaryHex: '#e11d48', // rose-600
    secondaryHex: '#f59e0b', // amber-500
    gradientClass: 'from-rose-600 to-amber-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
    badgeText: 'text-rose-700 dark:text-rose-300',
    accentRing: 'ring-rose-500'
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    tagline: 'Sejuk & Presisi',
    description: 'Aksen teal samudera jernih dipadu pirus/cyan segar, fokus, dan berpresisi tinggi.',
    primaryHex: '#0d9488', // teal-600
    secondaryHex: '#0891b2', // cyan-600
    gradientClass: 'from-teal-600 to-cyan-600',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/70',
    badgeText: 'text-teal-700 dark:text-teal-300',
    accentRing: 'ring-teal-500'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    tagline: 'Hangat & Penuh Energi',
    description: 'Kilau emas senja hangat dipadu terakota membara, ramah dan penuh optimisme.',
    primaryHex: '#d97706', // amber-600
    secondaryHex: '#ea580c', // orange-600
    gradientClass: 'from-amber-600 to-orange-600',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-700 dark:text-amber-300',
    accentRing: 'ring-amber-500'
  }
];

export const DEFAULT_COLOR_PRESET: ColorPresetId = 'royal-indigo';

export function getColorPreset(id?: string): ColorThemePreset {
  return COLOR_PRESETS.find(p => p.id === id) || COLOR_PRESETS[2];
}
