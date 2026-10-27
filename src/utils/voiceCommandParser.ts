import { DivisionId } from '../types';

export type VoiceCommandType = 'navigate' | 'ai_query' | 'system_action' | 'unknown';

export interface ParsedVoiceCommand {
  rawTranscript: string;
  normalizedText: string;
  type: VoiceCommandType;
  title: string;
  description: string;
  confidence: number; // 0 to 1

  // For division navigation
  targetDivisionId?: DivisionId;
  targetDivisionName?: string;
  targetSubTab?: string;

  // For AI queries
  aiQueryPrompt?: string;

  // For system actions
  actionId?: 'privacy_mode' | 'night_shift' | 'theme_toggle' | 'presentation' | 'archive' | 'performance_report' | 'calendar' | 'hotkeys';
}

const DIVISION_MAP: Array<{
  id: DivisionId;
  name: string;
  code: string;
  keywords: string[];
  subTabs?: Record<string, string[]>;
}> = [
  {
    id: 1,
    name: 'Direktorat & Sekretariat',
    code: 'DIR',
    keywords: [
      'direktorat',
      'sekretariat',
      'manajemen',
      'dashboard utama',
      'beranda',
      'halaman utama',
      'pimpinan',
      'yayasan',
      'divisi satu',
      'divisi 1',
      'directorate',
      'executive'
    ],
    subTabs: {
      overview: ['ringkasan', 'overview', 'dashboard', 'eksekutif'],
      identitas: ['identitas', 'anggota', 'umat', 'data anggota', 'ktp'],
      users: ['pengguna', 'user', 'staf', 'akun'],
      kalender: ['kalender', 'jadwal', 'todo', 'agenda', 'tenggat'],
      'productivity-stats': ['produktivitas', 'statistik', 'grafik performa'],
      struktur: ['struktur', 'kepanitiaan', 'organisasi']
    }
  },
  {
    id: 2,
    name: 'Bendahara & Finance',
    code: 'FIN',
    keywords: [
      'keuangan',
      'finance',
      'bendahara',
      'kas',
      'uang',
      'bank',
      'mutasi',
      'anggaran',
      'pagu',
      'laporan keuangan',
      'divisi dua',
      'divisi 2',
      'treasury'
    ],
    subTabs: {
      grafik: ['grafik', 'ringkasan kas', 'arus kas'],
      mutasi: ['mutasi', 'transaksi', 'kas masuk', 'kas keluar'],
      rekonsiliasi: ['rekonsiliasi', 'bank', 'bca', 'mandiri', 'rekening'],
      anggaran: ['anggaran', 'pagu', 'budget', 'pos anggaran'],
      royalti: ['royalti', 'honor penulis', 'penulis'],
      kalender: ['kalender', 'jadwal finance', 'pembayaran']
    }
  },
  {
    id: 3,
    name: 'Penerbitan & Redaksi',
    code: 'PUB',
    keywords: [
      'penerbitan',
      'editorial',
      'redaksi',
      'naskah',
      'katalog buku',
      'penerbit',
      'buku',
      'isbn',
      'hpp',
      'katalog',
      'publishing',
      'divisi tiga',
      'divisi 3'
    ],
    subTabs: {
      katalog: ['katalog', 'daftar buku', 'stok buku', 'isbn'],
      pengajuan: ['pengajuan', 'pengajuan cetak', 'approval'],
      hpp: ['hpp', 'harga pokok', 'kalkulator hpp'],
      kalender: ['kalender', 'jadwal terbit', 'timeline naskah']
    }
  },
  {
    id: 4,
    name: 'Marketing & Distribusi',
    code: 'MKT',
    keywords: [
      'marketing',
      'pemasaran',
      'penjualan',
      'distribusi',
      'sales',
      'pesanan',
      'order',
      'invoice',
      'bazaar',
      'promo',
      'kupon',
      'toko',
      'divisi empat',
      'divisi 4'
    ],
    subTabs: {
      pos: ['kasir', 'pos', 'penjualan langsung'],
      pesanan: ['pesanan', 'invoice', 'order', 'tagihan'],
      bazaar: ['bazaar', 'pameran', 'konsinyasi', 'stan'],
      promos: ['promo', 'kupon', 'diskon'],
      saluran: ['saluran', 'ekspedisi', 'marketplace'],
      grafik: ['grafik penjualan', 'omzet'],
      kalender: ['kalender', 'jadwal marketing', 'event']
    }
  },
  {
    id: 5,
    name: 'Produksi & Percetakan',
    code: 'PRD',
    keywords: [
      'produksi',
      'percetakan',
      'pabrikasi',
      'cetak fisik',
      'spk',
      'quality control',
      'qc',
      'production',
      'pencetakan',
      'divisi lima',
      'divisi 5'
    ],
    subTabs: {
      overview: ['overview', 'ringkasan produksi'],
      spk: ['spk', 'surat perintah kerja', 'antrean cetak'],
      qc: ['qc', 'quality control', 'cek mutu'],
      logs: ['log pabrikasi', 'catatan cetak', 'riwayat cetak'],
      kalender: ['kalender', 'jadwal cetak']
    }
  },
  {
    id: 6,
    name: 'Logistik & Gudang',
    code: 'LOG',
    keywords: [
      'logistik',
      'gudang',
      'stok gudang',
      'pengiriman',
      'surat jalan',
      'packing',
      'ekspedisi pengiriman',
      'kurir',
      'logistics',
      'warehouse',
      'divisi enam',
      'divisi 6'
    ],
    subTabs: {
      antrean: ['antrean', 'antrean packing', 'packing'],
      stok: ['stok riil', 'stok gudang', 'stok fisik'],
      'surat-jalan': ['surat jalan', 'resi', 'pengiriman'],
      ekspedisi: ['ekspedisi', 'kurir', 'ongkir'],
      kalender: ['kalender', 'jadwal kirim']
    }
  }
];

// Helper to normalize speech strings (remove punctuation, multiple spaces, lowercase)
export const normalizeSpeechText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Parses user voice transcript and determines intent:
 * 1. Division Navigation
 * 2. AI Assistant Query
 * 3. System Action (Theme, Privacy Mode, Night Shift, Presentation, etc.)
 */
export function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const raw = transcript.trim();
  const normalized = normalizeSpeechText(raw);

  if (!normalized) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'unknown',
      title: 'Tidak Ada Suara Terdeteksi',
      description: 'Silakan berbicara lebih dekat ke mikrofon.',
      confidence: 0
    };
  }

  // --------------------------------------------------------------------------
  // 1. SYSTEM ACTIONS MATCHING
  // --------------------------------------------------------------------------
  if (
    normalized.includes('mode privasi') ||
    normalized.includes('sensor layar') ||
    normalized.includes('samarkan angka') ||
    normalized.includes('sensor privasi') ||
    normalized.includes('privacy mode')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'privacy_mode',
      title: 'Sensor Privasi Proyektor',
      description: 'Menyalakan/mematikan penyamaran angka finansial (Alt+P)',
      confidence: 0.95
    };
  }

  if (
    normalized.includes('mode malam') ||
    normalized.includes('night shift') ||
    normalized.includes('filter mata') ||
    normalized.includes('layar hangat') ||
    normalized.includes('pelindung mata')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'night_shift',
      title: 'Night Shift Mode',
      description: 'Mengubah filter kehangatan layar untuk kenyamanan lembur (Alt+N)',
      confidence: 0.95
    };
  }

  if (
    normalized.includes('ganti tema') ||
    normalized.includes('ubah tema') ||
    normalized.includes('mode gelap') ||
    normalized.includes('mode terang') ||
    normalized.includes('dark mode') ||
    normalized.includes('light mode') ||
    normalized.includes('toggle theme')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'theme_toggle',
      title: 'Alih Tema Tampilan',
      description: 'Beralih antara Mode Terang dan Mode Gelap (Alt+T)',
      confidence: 0.92
    };
  }

  if (
    normalized.includes('rapat pleno') ||
    normalized.includes('layar pleno') ||
    normalized.includes('presentasi') ||
    normalized.includes('mode presentasi') ||
    normalized.includes('layar proyektor')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'presentation',
      title: 'Mode Rapat Pleno',
      description: 'Membuka layar presentasi penuh untuk rapat pengurus (Alt+Shift+P)',
      confidence: 0.94
    };
  }

  if (
    normalized.includes('arsip dokumen') ||
    normalized.includes('buka arsip') ||
    normalized.includes('lampiran dokumen') ||
    normalized.includes('file arsip')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'archive',
      title: 'Pusat Arsip Dokumen',
      description: 'Membuka repositori arsip bukti nota, naskah, dan surat jalan',
      confidence: 0.92
    };
  }

  if (
    normalized.includes('laporan performa') ||
    normalized.includes('performa bulanan') ||
    normalized.includes('laporan bulanan') ||
    normalized.includes('evaluasi tugas')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'performance_report',
      title: 'Laporan Performa Bulanan',
      description: 'Membuka laporan rekap performa dan audit tugas tuntas per divisi',
      confidence: 0.93
    };
  }

  if (
    normalized.includes('pintasan keyboard') ||
    normalized.includes('hotkey') ||
    normalized.includes('shortcut') ||
    normalized.includes('bantuan keyboard')
  ) {
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'system_action',
      actionId: 'hotkeys',
      title: 'Peta Pintasan Keyboard',
      description: 'Menampilkan daftar hotkey dan kombinasi tombol sistem (Alt+H)',
      confidence: 0.9
    };
  }

  // --------------------------------------------------------------------------
  // 2. EXPLICIT AI QUERY TRIGGERS
  // --------------------------------------------------------------------------
  const aiTriggerPrefixes = [
    'tanya asisten ai',
    'tanya asisten',
    'tanya ai',
    'tanya gemini',
    'tanya mis',
    'tanya bot',
    'tanyakan ke ai',
    'tanyakan pada ai',
    'tanya ke ai',
    'tanya',
    'ask ai',
    'ask assistant',
    'ai tolong',
    'halo ai',
    'hai ai',
    'hei ai',
    'hey ai',
    'asisten ai',
    'ai'
  ];

  for (const prefix of aiTriggerPrefixes) {
    if (normalized.startsWith(prefix + ' ') || normalized === prefix) {
      const cleanPrompt = raw.slice(prefix.length).replace(/^[\s,:-]+/, '').trim();
      return {
        rawTranscript: raw,
        normalizedText: normalized,
        type: 'ai_query',
        title: 'Tanya Asisten AI',
        description: cleanPrompt ? `Query: "${cleanPrompt}"` : 'Buka Asisten AI MIS',
        confidence: 0.96,
        aiQueryPrompt: cleanPrompt || undefined
      };
    }
  }

  // --------------------------------------------------------------------------
  // 3. DIVISION NAVIGATION MATCHING
  // --------------------------------------------------------------------------
  const navigationIntentVerbs = [
    'buka',
    'pergi ke',
    'pindah ke',
    'ke',
    'menuju',
    'navigasi ke',
    'tampilkan',
    'lihat',
    'masuk ke',
    'switch to',
    'go to',
    'open',
    'navigate to',
    'show'
  ];

  const hasNavigationVerb = navigationIntentVerbs.some(verb => 
    normalized.startsWith(verb + ' ') || normalized.includes(' ' + verb + ' ')
  );

  for (const div of DIVISION_MAP) {
    // Check if any keyword matches
    const matchedKeyword = div.keywords.find(kw => {
      if (normalized === kw) return true;
      if (normalized.includes(kw)) {
        // Higher confidence if navigation verb is also present or exact phrase match
        return true;
      }
      return false;
    });

    if (matchedKeyword) {
      // Find possible sub-tab mentioned
      let matchedSubTab: string | undefined = undefined;
      if (div.subTabs) {
        for (const [subTabKey, subTabKeywords] of Object.entries(div.subTabs)) {
          if (subTabKeywords.some(skw => normalized.includes(skw))) {
            matchedSubTab = subTabKey;
            break;
          }
        }
      }

      const confidence = hasNavigationVerb || normalized === matchedKeyword ? 0.95 : 0.85;

      return {
        rawTranscript: raw,
        normalizedText: normalized,
        type: 'navigate',
        targetDivisionId: div.id,
        targetDivisionName: div.name,
        targetSubTab: matchedSubTab,
        title: `Buka ${div.name}`,
        description: matchedSubTab 
          ? `Beralih ke Divisi ${div.code} pada tab "${matchedSubTab}"` 
          : `Beralih ke dashboard ${div.name} (Divisi ${div.id})`,
        confidence
      };
    }
  }

  // --------------------------------------------------------------------------
  // 4. IMPLICIT QUESTIONS OR ASSISTANCE (AI QUERY FALLBACK)
  // --------------------------------------------------------------------------
  const questionWords = [
    'berapa',
    'apa',
    'siapa',
    'bagaimana',
    'kapan',
    'dimana',
    'kenapa',
    'mengapa',
    'apakah',
    'tolong',
    'buatkan',
    'cek',
    'analisis',
    'rangkum',
    'jelaskan',
    'hitung',
    'rekomendasikan',
    'saran',
    'bagikan',
    'draft',
    'how',
    'what',
    'which',
    'who',
    'can you',
    'summarize'
  ];

  const startsWithQuestionWord = questionWords.some(qw => 
    normalized.startsWith(qw + ' ') || normalized === qw
  );

  if (startsWithQuestionWord || raw.includes('?') || raw.split(' ').length >= 3) {
    // If it looks like a natural query/question, route to AI Assistant
    return {
      rawTranscript: raw,
      normalizedText: normalized,
      type: 'ai_query',
      title: 'Pertanyaan untuk Asisten AI',
      description: `Menanyakan ke AI MIS: "${raw}"`,
      confidence: 0.88,
      aiQueryPrompt: raw
    };
  }

  // --------------------------------------------------------------------------
  // 5. DEFAULT / UNKNOWN
  // --------------------------------------------------------------------------
  return {
    rawTranscript: raw,
    normalizedText: normalized,
    type: 'unknown',
    title: 'Perintah Belum Dikenali',
    description: `Kata terdeteksi: "${raw}". Ucapkan misalnya: "Buka Keuangan" atau "Tanya AI: Berapa sisa kas?"`,
    confidence: 0.4
  };
}
