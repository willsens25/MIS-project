/**
 * Greeting & Salutation Utilities for MIS Lamrimnesia
 * Handles dynamic time-of-day greetings (Pagi/Siang/Sore/Malam),
 * user-friendly name parsing, and contextual division welcomes
 * with real-time Indonesian timezone synchronization (WIB, WITA, WIT, Lokal).
 */

export type IndonesianTimezoneKey = 'WIB' | 'WITA' | 'WIT' | 'LOCAL';

export interface TimezoneInfo {
  key: IndonesianTimezoneKey;
  iana: string;
  label: string;
  name: string;
  offset: string;
}

export const TIMEZONE_MAPPING: Record<IndonesianTimezoneKey, TimezoneInfo> = {
  WIB: { key: 'WIB', iana: 'Asia/Jakarta', label: 'WIB', name: 'Waktu Indonesia Barat', offset: 'UTC+7' },
  WITA: { key: 'WITA', iana: 'Asia/Makassar', label: 'WITA', name: 'Waktu Indonesia Tengah', offset: 'UTC+8' },
  WIT: { key: 'WIT', iana: 'Asia/Jayapura', label: 'WIT', name: 'Waktu Indonesia Timur', offset: 'UTC+9' },
  LOCAL: {
    key: 'LOCAL',
    iana: (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Jakarta') || 'Asia/Jakarta',
    label: 'Lokal',
    name: 'Waktu Perangkat Lokal',
    offset: ''
  }
};

const TIMEZONE_STORAGE_KEY = 'mis_app_timezone_preference';

/**
 * Gets the active timezone preference. Defaults to WIB (Asia/Jakarta)
 * which is the operational standard of Yayasan Lamrimnesia.
 */
export const getActiveTimezone = (): IndonesianTimezoneKey => {
  if (typeof window === 'undefined') return 'WIB';
  try {
    const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY) as IndonesianTimezoneKey;
    if (saved && (saved === 'WIB' || saved === 'WITA' || saved === 'WIT' || saved === 'LOCAL')) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'WIB';
};

/**
 * Sets the active timezone preference and dispatches a global event for instant UI sync.
 */
export const setActiveTimezone = (tz: IndonesianTimezoneKey): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    window.dispatchEvent(new CustomEvent('mis-timezone-changed', { detail: { timezone: tz } }));
  } catch {
    // ignore
  }
};

/**
 * Extracts accurate hours, minutes, and seconds in the specified timezone
 * using Intl.DateTimeFormat (ensures real sync regardless of client/container machine TZ).
 */
export const getTimePartsInTimezone = (
  date: Date = new Date(),
  tzKey: IndonesianTimezoneKey = getActiveTimezone()
): { hour: number; minute: number; second: number; tzLabel: string; isDST?: boolean } => {
  const iana = TIMEZONE_MAPPING[tzKey]?.iana || 'Asia/Jakarta';

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    let hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

    return {
      hour,
      minute,
      second,
      tzLabel: TIMEZONE_MAPPING[tzKey]?.label || 'WIB'
    };
  } catch {
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      tzLabel: 'WIB'
    };
  }
};

export interface TimeSalutationInfo {
  salutation: string;
  period: 'pagi' | 'siang' | 'sore' | 'malam';
  icon: string;
  description: string;
  currentTimeString: string;
  timezoneLabel: string;
}

/**
 * Returns dynamic salutation based on current time in the active Indonesian timezone:
 * - 04:00 - 10:59: Selamat pagi (🌅)
 * - 11:00 - 14:59: Selamat siang (☀️)
 * - 15:00 - 18:29: Selamat sore (🌤️)
 * - 18:30 - 03:59: Selamat malam (🌙)
 */
export const getTimeBasedSalutation = (
  date: Date = new Date(),
  tzKey: IndonesianTimezoneKey = getActiveTimezone()
): TimeSalutationInfo => {
  const { hour, minute, second, tzLabel } = getTimePartsInTimezone(date, tzKey);
  const totalMinutes = hour * 60 + minute;
  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  // 04:00 = 240 mins, 11:00 = 660 mins
  if (totalMinutes >= 240 && totalMinutes < 660) {
    return {
      salutation: 'Selamat pagi',
      period: 'pagi',
      icon: '🌅',
      description: 'Semangat mengawali hari dan aktivitas kerja di Lamrimnesia!',
      currentTimeString: timeString,
      timezoneLabel: tzLabel
    };
  }
  // 11:00 = 660 mins, 15:00 = 900 mins
  else if (totalMinutes >= 660 && totalMinutes < 900) {
    return {
      salutation: 'Selamat siang',
      period: 'siang',
      icon: '☀️',
      description: 'Selamat beraktivitas siang dan tetap fokus produktif!',
      currentTimeString: timeString,
      timezoneLabel: tzLabel
    };
  }
  // 15:00 = 900 mins, 18:30 = 1110 mins
  else if (totalMinutes >= 900 && totalMinutes < 1110) {
    return {
      salutation: 'Selamat sore',
      period: 'sore',
      icon: '🌤️',
      description: 'Semoga tugas dan agenda kerja hari ini berjalan lancar.',
      currentTimeString: timeString,
      timezoneLabel: tzLabel
    };
  }
  // 18:30 - 03:59
  else {
    return {
      salutation: 'Selamat malam',
      period: 'malam',
      icon: '🌙',
      description: 'Selamat beristirahat atau melanjutkan koordinasi malam.',
      currentTimeString: timeString,
      timezoneLabel: tzLabel
    };
  }
};

/**
 * Extracts a friendly first name, omitting trailing parentheticals such as '(Admin)'.
 */
export const getFriendlyUserFirstName = (fullName: string): string => {
  if (!fullName) return 'Rekan';
  const clean = fullName.replace(/\s*\([^)]*\)/g, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  return parts[0] || 'Rekan';
};

/**
 * Normalizes division names for concise, natural Indonesian greeting phrases.
 */
export const getCleanDivisionName = (divisiId: number, rawName?: string): string => {
  switch (divisiId) {
    case 1:
      return 'Direktorat & HRD';
    case 2:
      return 'Keuangan & Bendahara';
    case 3:
      return 'Penerbitan';
    case 4:
      return 'Marketing & Distribusi';
    case 5:
      return 'Produksi Percetakan';
    case 6:
      return 'Logistik & Gudang';
    default:
      return rawName || 'Operasional MIS';
  }
};

/**
 * Builds the exact entrance greeting requested:
 * "Selamat pagi/siang/sore/malam Kak [Nama]! Selamat datang di Divisi [Divisi]."
 */
export const getWelcomeSalutation = (
  userName: string,
  divisiId: number,
  rawDivisiName?: string,
  date: Date = new Date()
): string => {
  const { salutation } = getTimeBasedSalutation(date);
  const firstName = getFriendlyUserFirstName(userName);
  const divisionName = getCleanDivisionName(divisiId, rawDivisiName);

  return `${salutation} Kak ${firstName}! Selamat datang di Divisi ${divisionName}.`;
};

/**
 * Returns division greeting choices including the time-aware salutation.
 */
export const getDivisionGreetingOptions = (
  userName: string,
  divisiId: number,
  rawDivisiName?: string,
  date: Date = new Date()
): string[] => {
  const { salutation } = getTimeBasedSalutation(date);
  const firstName = getFriendlyUserFirstName(userName);
  const divisionName = getCleanDivisionName(divisiId, rawDivisiName);

  const mainWelcome = `${salutation} Kak ${firstName}! Selamat datang di Divisi ${divisionName}. Ada yang bisa saya bantu hari ini?`;

  switch (divisiId) {
    case 2: // Finance
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Butuh cek saldo kas, rekening bank, atau verifikasi invoice pending?`,
        `Siap bantu hitung arus kas & rekonsiliasi mutasi keuangan Lamrimnesia!`,
        `Halo Kak ${firstName}! Ada invoice bazaar atau pengajuan dana cetak yang mau divalidasi?`,
        `Keuangan aman, operasional lancar! Butuh saya rangkumkan kas aktif hari ini?`
      ];
    case 3: // Penerbitan
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Mau cek kalkulator HPP, status ISBN, atau katalog buku Dharma?`,
        `Siap bantu draf pengajuan cetak dan kurasi naskah penerbitan Lamrimnesia!`,
        `Halo Kak ${firstName}! Ada judul buku yang stoknya menipis dan perlu dicetak ulang?`,
        `Semangat berkarya Kak ${firstName}! Butuh saya carikan informasi naskah atau pengarang?`
      ];
    case 4: // Marketing
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Mau cek pesanan terbaru, kupon diskon, atau buat draf promo WhatsApp?`,
        `Siap bantu strategi penawaran & analisis omzet penjualan buku Dharma hari ini!`,
        `Halo Kak ${firstName}! Penjualan lancar? Saya siap bantu periksa transaksi kasir POS & bazaar.`,
        `Butuh ide bundling paket buku Dharma untuk pembaca setia? Tanyakan saja!`
      ];
    case 5: // Produksi
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Siap pantau antrean SPK fisik & estimasi jadwal selesai percetakan!`,
        `Ada jadwal cetak atau log pabrikasi percetakan yang perlu diperiksa hari ini?`,
        `Halo Kak ${firstName}! Butuh hitung estimasi kebutuhan eksemplar cetak ulang buku?`,
        `Kualitas cetak terjaga, manfaat meluas! Ada SPK yang mau kita verifikasi bersama?`
      ];
    case 6: // Logistik
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Butuh cek antrean packing gudang atau buat draf surat jalan ekspedisi?`,
        `Siap pantau stok fisik riil di gudang & jadwal pengiriman hari ini!`,
        `Halo Kak ${firstName}! Ada kiriman buku yang siap di-pickup kurir? Mari kita periksa!`,
        `Stok akurat, kiriman tepat waktu! Mau cek pesanan yang siap dikirim hari ini?`
      ];
    case 1: // Direktorat
    default:
      return [
        mainWelcome,
        `Halo Kak ${firstName}! Siap bantu pantau performa seluruh divisi & rekap KPI yayasan!`,
        `Ada rekap evaluasi, data keanggotaan staf, atau draf pengumuman yang ingin disiapkan?`,
        `Halo Kak ${firstName}! Semua data operasional lintas 6 divisi siap saya rangkumkan.`,
        `Manajemen terpadu Lamrimnesia! Ada ringkasan eksekutif yang ingin ditinjau hari ini?`
      ];
  }
};

/**
 * Formats any raw log timestamp (including stored UTC string 'YYYY-MM-DD HH:mm:ss',
 * ISO strings, or epoch numbers) into the currently active timezone (e.g. WIB / Asia/Jakarta).
 * Automatically resolves time differences so warehouse exit times (Waktu Keluar) and activity logs
 * stay 100% synchronized with the current system clock.
 */
export const formatLogDateTime = (
  raw: string | number | Date | null | undefined,
  options?: {
    showSeconds?: boolean;
    showTz?: boolean;
    tzKey?: IndonesianTimezoneKey;
  }
): string => {
  if (!raw) return '-';
  const tzKey = options?.tzKey || getActiveTimezone();
  const iana = TIMEZONE_MAPPING[tzKey]?.iana || 'Asia/Jakarta';
  const tzLabel = TIMEZONE_MAPPING[tzKey]?.label || 'WIB';

  let d: Date;
  if (raw instanceof Date) {
    d = raw;
  } else if (typeof raw === 'number') {
    d = new Date(raw);
  } else {
    const s = String(raw).trim();
    if (!s) return '-';
    // If it is in format YYYY-MM-DD HH:mm:ss without offset, it was saved from toISOString() (UTC)
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(s)) {
      d = new Date(s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z'));
    } else {
      d = new Date(s);
    }
  }

  if (isNaN(d.getTime())) {
    return String(raw);
  }

  try {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: iana,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: options?.showSeconds === false ? undefined : '2-digit',
      hour12: false
    });

    const formatted = formatter.format(d).replace('T', ' ');
    if (options?.showTz) {
      return `${formatted} ${tzLabel}`;
    }
    return formatted;
  } catch {
    return String(raw);
  }
};

