/**
 * Solar Astronomical Calculator & Theme Scheduler
 * 
 * Computes official sunrise and sunset times based on the NOAA Solar Position Algorithm
 * for automatic switching between Light and Dark mode based on local daylight hours.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  source?: 'gps' | 'timezone' | 'preset' | 'custom';
}

export interface SolarScheduleInfo {
  sunrise: Date;
  sunset: Date;
  sunriseFormatted: string;
  sunsetFormatted: string;
  isDaytime: boolean;
  activeTheme: 'light' | 'dark';
  nextTransition: {
    type: 'sunrise' | 'sunset';
    time: Date;
    timeFormatted: string;
    targetTheme: 'light' | 'dark';
    minutesRemaining: number;
    countdownFormatted: string;
  };
  location: LocationCoordinates;
}

export const PRESET_LOCATIONS: LocationCoordinates[] = [
  { name: 'DKI Jakarta (WIB)', latitude: -6.2088, longitude: 106.8456, source: 'preset' },
  { name: 'Surabaya, Jawa Timur (WIB)', latitude: -7.2575, longitude: 112.7521, source: 'preset' },
  { name: 'Bandung, Jawa Barat (WIB)', latitude: -6.9175, longitude: 107.6191, source: 'preset' },
  { name: 'Medan, Sumatera Utara (WIB)', latitude: 3.5952, longitude: 98.6722, source: 'preset' },
  { name: 'Yogyakarta (WIB)', latitude: -7.7956, longitude: 110.3695, source: 'preset' },
  { name: 'Denpasar, Bali (WITA)', latitude: -8.6705, longitude: 115.2126, source: 'preset' },
  { name: 'Makassar, Sulawesi Selatan (WITA)', latitude: -5.1477, longitude: 119.4327, source: 'preset' },
  { name: 'Jayapura, Papua (WIT)', latitude: -2.5916, longitude: 140.6690, source: 'preset' },
  { name: 'Pontianak, Kalimantan Barat (WIB)', latitude: -0.0263, longitude: 109.3425, source: 'preset' },
  { name: 'Singapura / Kuala Lumpur', latitude: 1.3521, longitude: 103.8198, source: 'preset' },
  { name: 'Tokyo, Jepang (JST)', latitude: 35.6762, longitude: 139.6503, source: 'preset' },
  { name: 'Los Angeles, USA (PT)', latitude: 34.0522, longitude: -118.2437, source: 'preset' },
  { name: 'New York, USA (ET)', latitude: 40.7128, longitude: -74.0060, source: 'preset' },
  { name: 'London, UK (GMT/BST)', latitude: 51.5074, longitude: -0.1278, source: 'preset' },
];

/**
 * Detect best fallback location based on the browser's resolved timezone
 */
export function getDefaultLocation(): LocationCoordinates {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    
    if (timeZone.includes('Jakarta') || timeZone.includes('Pontianak') || timeZone === 'Asia/Bangkok') {
      return { name: `Deteksi Timezone (${timeZone.split('/')[1] || 'Jakarta'})`, latitude: -6.2088, longitude: 106.8456, source: 'timezone' };
    }
    if (timeZone.includes('Makassar') || timeZone.includes('Ujung_Pandang')) {
      return { name: 'Deteksi Timezone (Makassar / WITA)', latitude: -5.1477, longitude: 119.4327, source: 'timezone' };
    }
    if (timeZone.includes('Jayapura')) {
      return { name: 'Deteksi Timezone (Jayapura / WIT)', latitude: -2.5916, longitude: 140.6690, source: 'timezone' };
    }
    if (timeZone.includes('Singapore') || timeZone.includes('Kuala_Lumpur')) {
      return { name: 'Deteksi Timezone (Singapura)', latitude: 1.3521, longitude: 103.8198, source: 'timezone' };
    }
    if (timeZone.includes('Los_Angeles') || timeZone.includes('Pacific')) {
      return { name: 'Deteksi Timezone (Los Angeles)', latitude: 34.0522, longitude: -118.2437, source: 'timezone' };
    }
    if (timeZone.includes('New_York') || timeZone.includes('Eastern')) {
      return { name: 'Deteksi Timezone (New York)', latitude: 40.7128, longitude: -74.0060, source: 'timezone' };
    }
    if (timeZone.includes('London')) {
      return { name: 'Deteksi Timezone (London)', latitude: 51.5074, longitude: -0.1278, source: 'timezone' };
    }
    if (timeZone.includes('Tokyo')) {
      return { name: 'Deteksi Timezone (Tokyo)', latitude: 35.6762, longitude: 139.6503, source: 'timezone' };
    }
    
    // General fallback using timezone offset
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    const approxLng = offsetHours * 15;
    return {
      name: `Timezone Lokal (${timeZone || `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`})`,
      latitude: -6.2, // Default equator / Southeast Asia
      longitude: approxLng,
      source: 'timezone'
    };
  } catch {
    return PRESET_LOCATIONS[0]; // Default Jakarta
  }
}

/**
 * Format a Date to HH:MM in user's local 24-hour time
 */
export function formatTimeHM(date: Date): string {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

/**
 * NOAA Solar Calculation for a specific calendar date and location.
 * Zenith 90.833° accounts for 50' of solar disc radius & atmospheric refraction.
 */
function calculateSolarTimesForDate(
  date: Date,
  latitude: number,
  longitude: number,
  zenith: number = 90.833
): { sunrise: Date; sunset: Date } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. Day of the year
  const N1 = Math.floor((275 * month) / 9);
  const N2 = Math.floor((month + 9) / 12);
  const N3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
  const N = N1 - N2 * N3 + day - 30;

  // 2. Longitude hour value
  const lngHour = longitude / 15;

  const calcHour = (approxT: number, isSunrise: boolean): number => {
    // 3. Sun's mean anomaly
    const M = 0.9856 * approxT - 3.289;
    const MRad = (M * Math.PI) / 180;

    // 4. Sun's true longitude
    let L = M + 1.916 * Math.sin(MRad) + 0.02 * Math.sin(2 * MRad) + 282.634;
    L = ((L % 360) + 360) % 360;
    const LRad = (L * Math.PI) / 180;

    // 5. Sun's right ascension
    let RA = (Math.atan(0.91764 * Math.tan(LRad)) * 180) / Math.PI;
    RA = ((RA % 360) + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;

    // 6. Sun's declination
    const sinDec = 0.39782 * Math.sin(LRad);
    const cosDec = Math.cos(Math.asin(sinDec));

    // 7. Sun's local hour angle
    const cosZenith = Math.cos((zenith * Math.PI) / 180);
    const sinLat = Math.sin((latitude * Math.PI) / 180);
    const cosLat = Math.cos((latitude * Math.PI) / 180);
    const cosH = (cosZenith - sinDec * sinLat) / (cosDec * cosLat);

    if (cosH > 1) {
      // Polar night - sun never rises: set sunrise to midday, sunset to midday
      return 12 - lngHour;
    }
    if (cosH < -1) {
      // Midnight sun - sun never sets
      return isSunrise ? 0 - lngHour : 24 - lngHour;
    }

    const acosH = (Math.acos(cosH) * 180) / Math.PI;
    const H = (isSunrise ? 360 - acosH : acosH) / 15;

    // 8. Local mean time
    const T = H + RA - 0.06571 * approxT - 6.622;

    // 9. UTC time
    const UT = T - lngHour;
    return UT;
  };

  const tSunrise = N + (6 - lngHour) / 24;
  const tSunset = N + (18 - lngHour) / 24;

  const utSunrise = calcHour(tSunrise, true);
  const utSunset = calcHour(tSunset, false);

  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const sunrise = new Date(utcMidnight + Math.round(utSunrise * 3600 * 1000));
  const sunset = new Date(utcMidnight + Math.round(utSunset * 3600 * 1000));

  return { sunrise, sunset };
}

/**
 * Calculates current solar schedule, active daytime status, and countdown to next transition.
 */
export function getSolarSchedule(
  now: Date = new Date(),
  location: LocationCoordinates = getDefaultLocation()
): SolarScheduleInfo {
  const { latitude, longitude } = location;

  const today = calculateSolarTimesForDate(now, latitude, longitude);
  const tomorrowDate = new Date(now.getTime() + 24 * 3600 * 1000);
  const tomorrow = calculateSolarTimesForDate(tomorrowDate, latitude, longitude);

  const currentTimeMs = now.getTime();
  const sunriseTimeMs = today.sunrise.getTime();
  const sunsetTimeMs = today.sunset.getTime();

  let isDaytime = false;
  let nextTime: Date;
  let nextType: 'sunrise' | 'sunset';
  let targetTheme: 'light' | 'dark';

  if (currentTimeMs >= sunriseTimeMs && currentTimeMs < sunsetTimeMs) {
    // Currently day -> waiting for sunset
    isDaytime = true;
    nextTime = today.sunset;
    nextType = 'sunset';
    targetTheme = 'dark';
  } else if (currentTimeMs < sunriseTimeMs) {
    // Before today's sunrise -> waiting for sunrise
    isDaytime = false;
    nextTime = today.sunrise;
    nextType = 'sunrise';
    targetTheme = 'light';
  } else {
    // After today's sunset -> waiting for tomorrow's sunrise
    isDaytime = false;
    nextTime = tomorrow.sunrise;
    nextType = 'sunrise';
    targetTheme = 'light';
  }

  const diffMs = Math.max(0, nextTime.getTime() - currentTimeMs);
  const diffMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let countdownFormatted = '';
  if (hours > 0) {
    countdownFormatted = `${hours} jam ${minutes} menit`;
  } else if (minutes > 0) {
    countdownFormatted = `${minutes} menit`;
  } else {
    countdownFormatted = 'beberapa detik lagi';
  }

  return {
    sunrise: today.sunrise,
    sunset: today.sunset,
    sunriseFormatted: formatTimeHM(today.sunrise),
    sunsetFormatted: formatTimeHM(today.sunset),
    isDaytime,
    activeTheme: isDaytime ? 'light' : 'dark',
    nextTransition: {
      type: nextType,
      time: nextTime,
      timeFormatted: formatTimeHM(nextTime),
      targetTheme,
      minutesRemaining: diffMinutes,
      countdownFormatted
    },
    location
  };
}
