import { NightShiftConfig, NightShiftPreset, NightShiftScheduleType } from '../types';

export const DEFAULT_NIGHT_SHIFT_CONFIG: NightShiftConfig = {
  enabled: true,
  autoOvertime: true,
  scheduleType: 'overtime-hours',
  startTime: '19:00',
  endTime: '06:00',
  warmth: 45,       // 45% warmth / amber temperature (~4200K)
  contrast: 90,     // 90% soft contrast (relaxes eye strain against harsh pure black/white)
  brightness: 95,   // 95% backlight level (soft glare dampening)
  preset: 'balanced'
};

export interface NightShiftPresetDetail {
  id: NightShiftPreset;
  name: string;
  subtitle: string;
  description: string;
  warmth: number;
  contrast: number;
  brightness: number;
  colorTempKelvin: string;
  badgeColor: string;
}

export const NIGHT_SHIFT_PRESETS: Record<NightShiftPreset, NightShiftPresetDetail> = {
  balanced: {
    id: 'balanced',
    name: 'Lembur Seimbang',
    subtitle: 'Rekomendasi Utama',
    description: 'Kehangatan amber alami, kontras lembut anti-silau untuk olah angka & spreadsheet.',
    warmth: 45,
    contrast: 90,
    brightness: 95,
    colorTempKelvin: '4200K',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
  },
  'deep-night': {
    id: 'deep-night',
    name: 'Larut Malam (Deep)',
    subtitle: 'Dini Hari 00:00+',
    description: 'Penyaringan cahaya biru maksimal dengan kontras teduh untuk ruangan temaram.',
    warmth: 70,
    contrast: 85,
    brightness: 88,
    colorTempKelvin: '3200K',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-700'
  },
  'paper-reading': {
    id: 'paper-reading',
    name: 'Sepia Naskah',
    subtitle: 'Kertas Klasik',
    description: 'Nuansa kertas sepia yang nyaman untuk membaca atau menyunting naskah teks panjang.',
    warmth: 55,
    contrast: 92,
    brightness: 94,
    colorTempKelvin: '3800K',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Eye-Care',
    subtitle: 'Sentuhan Halus',
    description: 'Reduksi cahaya biru tipis dengan akurasi warna tetap mendekati tampilan standar.',
    warmth: 25,
    contrast: 95,
    brightness: 98,
    colorTempKelvin: '5200K',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-700'
  },
  custom: {
    id: 'custom',
    name: 'Kustom Pengguna',
    subtitle: 'Pengaturan Manual',
    description: 'Kombinasi intensitas kehangatan, kontras, dan kecerahan sesuai preferensi pribadi.',
    warmth: 50,
    contrast: 90,
    brightness: 95,
    colorTempKelvin: 'Kustom',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
  }
};

/**
 * Checks if the specified time is within an overtime window.
 * Supports cross-midnight windows like 19:00 -> 06:00.
 */
export function isCurrentTimeInOvertime(
  startTime: string = '19:00',
  endTime: string = '06:00',
  date: Date = new Date()
): boolean {
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (startMinutes > endMinutes) {
      // Overtime crosses midnight (e.g. 19:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Same day overtime window (e.g. 18:00 to 23:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  } catch (e) {
    console.warn('Error parsing overtime times:', e);
    return false;
  }
}

/**
 * Determines whether Night Shift should currently be active.
 */
export function evaluateNightShiftActive(
  config: NightShiftConfig,
  now: Date = new Date(),
  isDaytime: boolean = true,
  currentTheme: 'light' | 'dark' = 'light'
): boolean {
  if (!config.enabled) {
    return false;
  }

  // If autoOvertime is enabled, check schedule conditions
  if (config.autoOvertime) {
    switch (config.scheduleType) {
      case 'overtime-hours':
        return isCurrentTimeInOvertime(config.startTime, config.endTime, now);
      case 'sunset-to-sunrise':
        return !isDaytime;
      case 'always-on-dark':
        return currentTheme === 'dark';
      case 'manual':
        return config.enabled;
      default:
        return isCurrentTimeInOvertime(config.startTime, config.endTime, now);
    }
  }

  // If autoOvertime is false, user manually toggled enabled ON
  return config.enabled;
}

/**
 * Formats status text explaining why Night Shift is active or standby.
 */
export function getNightShiftStatusText(
  config: NightShiftConfig,
  isActive: boolean,
  now: Date = new Date(),
  isDaytime: boolean = true
): { title: string; subtitle: string; indicatorColor: string } {
  if (!config.enabled) {
    return {
      title: 'Night Shift Nonaktif',
      subtitle: 'Mode perlindungan mata dimatikan secara manual.',
      indicatorColor: 'bg-slate-400'
    };
  }

  if (isActive) {
    if (config.autoOvertime) {
      if (config.scheduleType === 'overtime-hours') {
        return {
          title: 'Mode Lembur Aktif (Otomatis)',
          subtitle: `Mendeteksi jam lembur (${config.startTime} - ${config.endTime}). Kontras & intensitas warna disesuaikan.`,
          indicatorColor: 'bg-amber-400 animate-pulse'
        };
      }
      if (config.scheduleType === 'sunset-to-sunrise') {
        return {
          title: 'Mode Malam Aktif (Sunset Sync)',
          subtitle: 'Matahari terbenam. Kontras & cahaya biru diredam otomatis.',
          indicatorColor: 'bg-amber-400 animate-pulse'
        };
      }
      if (config.scheduleType === 'always-on-dark') {
        return {
          title: 'Night Shift Aktif (Mode Gelap)',
          subtitle: 'Menyelaraskan kenyamanan mata dengan tema gelap aktif.',
          indicatorColor: 'bg-amber-400 animate-pulse'
        };
      }
    }
    return {
      title: 'Night Shift Aktif (Manual)',
      subtitle: `Preset: ${NIGHT_SHIFT_PRESETS[config.preset]?.name || 'Kustom'} (${config.warmth}% Kehangatan • ${config.contrast}% Kontras).`,
      indicatorColor: 'bg-amber-400'
    };
  }

  // Standby (waiting for overtime window)
  if (config.autoOvertime && config.scheduleType === 'overtime-hours') {
    return {
      title: 'Standby Jam Lembur',
      subtitle: `Akan aktif otomatis pukul ${config.startTime} saat jam lembur dimulai.`,
      indicatorColor: 'bg-emerald-500'
    };
  }

  return {
    title: 'Standby',
    subtitle: 'Menunggu pemicu otomatis jadwal.',
    indicatorColor: 'bg-slate-400'
  };
}

/**
 * Applies the calculated CSS variables directly to the document root element.
 */
export function applyNightShiftToDom(isActive: boolean, config: NightShiftConfig): void {
  if (typeof document === 'undefined') return;

  try {
    const root = document.documentElement;
    root.setAttribute('data-night-shift', isActive ? 'active' : 'inactive');

    if (isActive) {
      const warmthFactor = Math.max(0, Math.min(100, config.warmth)) / 100;
      const contrastFactor = Math.max(50, Math.min(120, config.contrast)) / 100;
      const brightnessFactor = Math.max(50, Math.min(110, config.brightness)) / 100;

      root.style.setProperty('--ns-warmth', `${warmthFactor}`);
      root.style.setProperty('--ns-contrast', `${contrastFactor}`);
      root.style.setProperty('--ns-brightness', `${brightnessFactor}`);
      root.style.setProperty('--ns-amber-opacity', `${warmthFactor * 0.16}`);
    } else {
      root.style.setProperty('--ns-warmth', '0');
      root.style.setProperty('--ns-contrast', '1');
      root.style.setProperty('--ns-brightness', '1');
      root.style.setProperty('--ns-amber-opacity', '0');
    }
  } catch (e) {
    console.warn('Error applying Night Shift to DOM:', e);
  }
}
