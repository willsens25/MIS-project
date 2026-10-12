/**
 * Greeting & Salutation Utilities for MIS Lamrimnesia
 * Handles dynamic time-of-day greetings (Pagi/Siang/Sore/Malam),
 * user-friendly name parsing, and contextual division welcomes
 * with real-time Indonesian timezone synchronization (WIB, WITA, WIT, Lokal).
 */

import { MascotPersonality, MascotSpeechFrequency } from '../types';

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

export interface MascotPersonalityConfig {
  id: MascotPersonality;
  name: string;
  subtitle: string;
  badgeText: string;
  defaultFrequency: MascotSpeechFrequency;
  autoFadeMs: number;
  proactiveIntervalMs: number | null; // null if only on entrance/hover
  description: string;
}

export const MASCOT_PERSONALITY_CONFIGS: Record<MascotPersonality, MascotPersonalityConfig> = {
  professional: {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Formal, Ringkas & Fokus Eksekutif',
    badgeText: 'Formal • Jarang (Hening)',
    defaultFrequency: 'minimal',
    autoFadeMs: 4500,
    proactiveIntervalMs: 120000, // 120s when proactive is active, or minimal by default
    description: 'Sapaan baku nan lugas ("Bapak/Ibu/Rekan"), fokus pada metrik KPI, audit, serta laporan operasional dengan frekuensi kemunculan lebih tenang.'
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    subtitle: 'Ramah, Santai & Akrab Sehari-hari',
    badgeText: 'Santai • Frekuensi Normal',
    defaultFrequency: 'normal',
    autoFadeMs: 5500,
    proactiveIntervalMs: 60000, // Every 60s
    description: 'Sapaan hangat dan bersahabat ("Halo Kak!"), menggunakan bahasa percakapan sehari-hari yang ringan dengan frekuensi kemunculan seimbang.'
  },
  motivational: {
    id: 'motivational',
    name: 'Motivational',
    subtitle: 'Antusias, Inspiratif & Semangat Dharma',
    badgeText: 'Semangat • Frekuensi Aktif',
    defaultFrequency: 'frequent',
    autoFadeMs: 6800,
    proactiveIntervalMs: 35000, // Every 35s
    description: 'Sapaan penuh energi positif, apresiasi kerja keras, dan kutipan semangat pelestarian Dharma dengan frekuensi sapaan proaktif yang lebih sering.'
  }
};

export interface MascotFrequencyConfig {
  id: MascotSpeechFrequency;
  name: string;
  label: string;
  intervalMs: number | null;
  autoFadeMs: number;
  description: string;
}

export const MASCOT_FREQUENCY_CONFIGS: Record<MascotSpeechFrequency, MascotFrequencyConfig> = {
  frequent: {
    id: 'frequent',
    name: 'Sering (Aktif)',
    label: 'Tiap ~35 Detik + Hover',
    intervalMs: 35000,
    autoFadeMs: 6500,
    description: 'Maskot menyapa secara berkala setiap ~35 detik saat berpindah aktivitas serta saat kursor diarahkan.'
  },
  normal: {
    id: 'normal',
    name: 'Normal (Seimbang)',
    label: 'Tiap ~65 Detik + Hover',
    intervalMs: 65000,
    autoFadeMs: 5200,
    description: 'Muncul saat masuk divisi, sapaan berkala setiap ~65 detik, dan saat kursor diarahkan ke maskot.'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal (Hening)',
    label: 'Hanya Hover & Pindah Divisi',
    intervalMs: null,
    autoFadeMs: 4200,
    description: 'Tidak memunculkan balon kata berkala secara otomatis; hanya tampil singkat saat pindah divisi atau di-hover.'
  }
};

/**
 * Builds the entrance greeting tailored to the selected mascot personality:
 * - 'professional': Formal & concise executive tone
 * - 'casual': Friendly "Kak [Nama]" everyday tone
 * - 'motivational': Energetic & inspiring Dharma tone
 */
export const getWelcomeSalutation = (
  userName: string,
  divisiId: number,
  rawDivisiName?: string,
  date: Date = new Date(),
  personality: MascotPersonality = 'casual'
): string => {
  const { salutation } = getTimeBasedSalutation(date);
  const firstName = getFriendlyUserFirstName(userName);
  const divisionName = getCleanDivisionName(divisiId, rawDivisiName);

  if (personality === 'professional') {
    return `${salutation}, Rekan ${firstName}. Sistem informasi Divisi ${divisionName} siap mendukung agenda operasional Anda.`;
  }

  if (personality === 'motivational') {
    return `${salutation} Kak ${firstName}! 🌟 Semangat menebar manfaat di Divisi ${divisionName}—setiap langkah kecil hari ini sangat berarti!`;
  }

  return `${salutation} Kak ${firstName}! Selamat datang di Divisi ${divisionName}.`;
};

/**
 * Returns division greeting choices tailored to the active MascotPersonality ('professional' | 'casual' | 'motivational').
 */
export const getDivisionGreetingOptions = (
  userName: string,
  divisiId: number,
  rawDivisiName?: string,
  date: Date = new Date(),
  personality: MascotPersonality = 'casual'
): string[] => {
  const { salutation } = getTimeBasedSalutation(date);
  const firstName = getFriendlyUserFirstName(userName);
  const divisionName = getCleanDivisionName(divisiId, rawDivisiName);

  if (personality === 'professional') {
    const mainPro = `${salutation}, Rekan ${firstName}. Dashboard Divisi ${divisionName} telah tersinkronisasi. Silakan pilih modul yang ingin ditinjau.`;
    switch (divisiId) {
      case 2: // Finance
        return [
          mainPro,
          `Rekan ${firstName}, laporan posisi kas, mutasi rekening, dan antrean verifikasi invoice siap untuk diaudit.`,
          `Sistem Keuangan siap menyajikan analisis arus kas serta rekonsiliasi buku bank secara akurat.`,
          `Terdapat modul persetujuan anggaran cetak dan verifikasi pembayaran yang dapat segera diproses.`,
          `Integritas data finansial terjaga. Apakah Anda memerlukan ringkasan neraca kas hari ini?`
        ];
      case 3: // Penerbitan
        return [
          mainPro,
          `Rekan ${firstName}, data kalkulasi HPP, registrasi ISBN, dan inventaris katalog naskah siap ditinjau.`,
          `Modul Penerbitan siap memfasilitasi pengajuan cetak ulang dan pemantauan lisensi royalti penulis.`,
          `Silakan periksa indikator stok buku kritis guna menjaga kontinuitas ketersediaan pustaka.`,
          `Data kurasi naskah dan struktur biaya produksi telah diperbarui secara real-time.`
        ];
      case 4: // Marketing
        return [
          mainPro,
          `Rekan ${firstName}, metrik performa penjualan, kampanye Pre-Order, dan kupon promosi siap dianalisis.`,
          `Sistem POS dan rekapitulasi transaksi per kanal distribusi telah siap untuk evaluasi omzet.`,
          `Data alokasi stok bazaar dan tingkat konversi penjualan dapat diakses melalui panel utama.`,
          `Apakah Anda memerlukan draf komunikasi resmi atau laporan tren penjualan periode ini?`
        ];
      case 5: // Produksi
        return [
          mainPro,
          `Rekan ${firstName}, status antrean Surat Perintah Kerja (SPK) dan jadwal produksi siap dipantau.`,
          `Laporan realisasi cetak pabrikasi dan efisiensi pemakaian kuota produksi tersedia untuk diverifikasi.`,
          `Silakan tinjau estimasi penyelesaian cetak guna memastikan ketepatan jadwal distribusi.`,
          `Standar kendali mutu percetakan terpantau optimal pada seluruh lini produksi aktif.`
        ];
      case 6: // Logistik
        return [
          mainPro,
          `Rekan ${firstName}, data inventaris fisik gudang, antrean pengemasan, dan log ekspedisi siap diperiksa.`,
          `Sistem Logistik siap mencetak dokumen surat jalan serta memvalidasi stok keluar harian.`,
          `Pemantauan saldo stok gudang real-time aktif untuk mencegah selisih persediaan.`,
          `Apakah Anda ingin meninjau daftar pesanan terverifikasi yang siap dikirim hari ini?`
        ];
      case 1: // Direktorat
      default:
        return [
          mainPro,
          `Rekan ${firstName}, ikhtisar eksekutif lintas 6 divisi dan indikator KPI yayasan siap ditinjau.`,
          `Laporan konsolidasi keuangan, progres cetak, serta matriks kinerja staf telah diperbarui.`,
          `Seluruh log audit aktivitas dan resolusi rapat pleno tersedia untuk evaluasi manajemen.`,
          `Apakah Anda memerlukan ringkasan eksekutif terpadu untuk mendukung pengambilan keputusan hari ini?`
        ];
    }
  }

  if (personality === 'motivational') {
    const mainMotivational = `${salutation} Kak ${firstName}! ✨ Selamat berkarya di Divisi ${divisionName}! Mari wujudkan pelayanan terbaik hari ini!`;
    switch (divisiId) {
      case 2: // Finance
        return [
          mainMotivational,
          `Semangat Kak ${firstName}! 💪 Ketelitian Anda mengelola kas & keuangan adalah fondasi kokoh bagi kelancaran penyebaran buku Dharma!`,
          `Setiap angka yang terekonsiliasi dengan rapi membawa keberkahan bagi seluruh program yayasan. Yuk kita cek mutasi hari ini! 🌟`,
          `Luar biasa Kak ${firstName}! Mari tuntaskan verifikasi invoice & anggaran cetak dengan penuh sukacita dan fokus!`,
          `Keuangan yang sehat, manfaat Dharma makin meluas! 🔥 Butuh asisten bantu rangkumkan capaian kas hari ini?`
        ];
      case 3: // Penerbitan
        return [
          mainMotivational,
          `Semangat menginspirasi Kak ${firstName}! 📚 Setiap naskah buku Dharma yang Anda terbitkan adalah pelita kebijaksanaan bagi banyak pembaca!`,
          `Karya besar berawal dari langkah tekun hari ini! Yuk kita cek progres naskah, ISBN, dan rencana cetak berikutnya! ✨`,
          `Halo Kak ${firstName}! Dedikasi Anda di Divisi Penerbitan menjaga ajaran luhur tetap hidup lintas generasi. Siap berkarya! 🌱`,
          `Jangan lelah menebar kebaikan lewat literasi! Butuh bantuan menghitung HPP atau mengecek stok buku unggulan?`
        ];
      case 4: // Marketing
        return [
          mainMotivational,
          `Energi positif hari ini Kak ${firstName}! 🚀 Setiap buku yang sampai ke tangan pembaca adalah benih kebajikan yang tumbuh subur!`,
          `Semangat melayani umat & pembaca setia! Mari hadirkan kampanye buku dan pelayanan POS yang hangat serta menginspirasi! 🌟`,
          `Luar biasa Kak ${firstName}! Antusiasme Anda di Marketing & Distribusi menjembatani buku bermutu menuju ribuan hati pembaca!`,
          `Hari yang cerah untuk mencetak rekor kebajikan baru! 🔥 Mau buat ide promo kreatif atau cek pesanan terbaru?`
        ];
      case 5: // Produksi
        return [
          mainMotivational,
          `Semangat pantang menyerah Kak ${firstName}! ⚙️ Setiap lembar halaman yang tercetak rapi adalah wujud nyata dedikasi Divisi Produksi!`,
          `Kualitas cetak terbaik lahir dari tangan-tangan penuh perhatian! Yuk kita kawal antrean SPK hari ini hingga tuntas! 💪`,
          `Hebat sekali Kak ${firstName}! Ketepatan jadwal produksi Anda memastikan pembaca segera menerima pustaka yang dinantikan! ✨`,
          `Mari jadikan setiap proses produksi penuh makna! Ada target cetak SPK yang ingin kita akselerasi hari ini?`
        ];
      case 6: // Logistik
        return [
          mainMotivational,
          `Semangat prima Kak ${firstName}! 📦 Setiap paket buku yang Anda kemas dengan rapi membawa kebahagiaan hingga ke pelosok Nusantara!`,
          `Ketertiban gudang & kecepatan pengiriman Anda adalah kunci kepuasan pembaca Lamrimnesia! Mari bergerak penuh semangat! 🚀`,
          `Luar biasa Kak ${firstName}! Tak ada jarak yang terlalu jauh untuk menyebarkan inspirasi. Siap cek surat jalan & ekspedisi hari ini? 🌟`,
          `Stok terjaga rapi, distribusi mengalir lancar! 💪 Butuh bantuan menyiapkan daftar kiriman prioritas hari ini?`
        ];
      case 1: // Direktorat
      default:
        return [
          mainMotivational,
          ` kepemimpinan yang menginspirasi, Kak ${firstName}! 🌟 Sinergi 6 divisi Lamrimnesia tumbuh kuat berkat visi dan koordinasi Anda!`,
          `Setiap keputusan bijak hari ini membuka jalan bagi ribuan manfaat di masa depan. Semangat memimpin dengan hati! ✨`,
          `Luar biasa Kak ${firstName}! Mari pantau capaian KPI dan dukung seluruh tim mencapai potensi terbaiknya hari ini! 🔥`,
          `Bersama kita wujudkan tata kelola yayasan yang unggul dan penuh berkah! Ada agenda strategis yang ingin disiapkan?`
        ];
    }
  }

  // Default: 'casual' (Friendly & approachable)
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

