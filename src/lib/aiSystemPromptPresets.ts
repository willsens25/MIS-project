import { DivisionId, AIResponseTone } from '../types';

export interface DivisionPromptPreset {
  divisionId: DivisionId;
  divisionName: string;
  divisionCode: string;
  iconName: string;
  badgeClass: string;
  defaultPrompt: string;
  styleDescription: string;
  suggestedSnippets: Array<{ label: string; text: string }>;
}

export interface AIResponseToneConfig {
  id: AIResponseTone;
  label: string;
  shortLabel: string;
  iconName: string;
  badgeClass: string;
  description: string;
  directive: string;
}

export const AI_RESPONSE_TONE_CONFIGS: Record<AIResponseTone, AIResponseToneConfig> = {
  professional: {
    id: 'professional',
    label: 'Profesional & Formal',
    shortLabel: 'Profesional',
    iconName: 'Briefcase',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Bahasa Indonesia baku, tata krama formal, struktur rapi, cocok untuk notulensi dan pelaporan resmi yayasan.',
    directive: 'NADA RESPON GLOBAL (PROFESIONAL): Gunakan bahasa Indonesia baku, sopan, struktur formal, dan artikulasi teratur yang siap untuk pelaporan resmi yayasan.'
  },
  concise: {
    id: 'concise',
    label: 'Ringkas & Padat (To-The-Point)',
    shortLabel: 'Ringkas',
    iconName: 'Zap',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Langsung ke inti solusi tanpa basa-basi pembuka/penutup, poin-poin padat, efisien dan hemat waktu.',
    directive: 'NADA RESPON GLOBAL (RINGKAS & TO-THE-POINT): Berikan jawaban yang sangat padat, to-the-point, hilangkan basa-basi pembuka dan penutup. Utamakan poin-poin penting yang ringkas.'
  },
  casual: {
    id: 'casual',
    label: 'Santai & Bersahabat',
    shortLabel: 'Santai',
    iconName: 'Smile',
    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    description: 'Hangat, ramah, komunikatif seperti berdiskusi dengan rekan kerja se-tim tanpa mengurangi keakuratan data.',
    directive: 'NADA RESPON GLOBAL (SANTAI & BERSAHABAT): Gunakan gaya bahasa yang hangat, komunikatif, ramah dan santai layaknya berdiskusi dengan rekan kerja se-tim, tanpa mengurangi keakuratan informasi operasional.'
  },
  analytical: {
    id: 'analytical',
    label: 'Analitis & Kritis',
    shortLabel: 'Analitis',
    iconName: 'BarChart3',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Fokus pada komparasi data, rasio angka, sebab-akibat, evaluasi risiko/anomali, dan rekomendasi berbasis fakta.',
    directive: 'NADA RESPON GLOBAL (ANALITIS & KRITIS): Analisis secara mendalam berbasis data kuantitatif, sebab-akibat, perbandingan metrik, identifikasi risiko/anomali, dan rekomendasi berbasis fakta terukur.'
  }
};

export const DIVISION_PROMPT_PRESETS: Record<DivisionId, DivisionPromptPreset> = {
  1: {
    divisionId: 1,
    divisionName: 'Direktorat & HRD',
    divisionCode: 'DIR',
    iconName: 'Building2',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    defaultPrompt:
      'Bertindaklah sebagai Penasihat Eksekutif Manajemen Yayasan. Sajikan jawaban dalam format Ringkasan Eksekutif (Executive Summary). Fokuskan sudut pandang pada Key Performance Indicators (KPI), evaluasi tata kelola yayasan, kepatuhan kebijakan organisasi, serta rekomendasi strategis berorientasi jangka panjang.',
    styleDescription: 'Gaya Ringkasan Eksekutif, berbobot, berbasis KPI, dan strategis.',
    suggestedSnippets: [
      { label: '3 Poin Kunci', text: 'Sajikan kesimpulan dalam maksimal 3 poin keputusan strategis.' },
      { label: 'Analisis Risiko', text: 'Sertakan tinjauan risiko tata kelola dan langkah mitigasinya.' },
      { label: 'Format Rapat Dewan', text: 'Formatkan agar siap dibacakan saat agenda evaluasi dewan pengurus.' }
    ]
  },
  2: {
    divisionId: 2,
    divisionName: 'Bendahara / Finance',
    divisionCode: 'FIN',
    iconName: 'Wallet',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    defaultPrompt:
      'Bertindaklah sebagai Auditor Keuangan & Analis Anggaran Senior. Sajikan setiap data finansial dengan nominal rupiah yang presisi, pemisahan arus kas masuk vs keluar, verifikasi saldo rekening kas & bank, analisis kepatuhan anggaran (budget compliance), serta rekomendasi pengawasan likuiditas.',
    styleDescription: 'Format audit formal, presisi angka, pemisahan debit/kredit, dan rekonsiliasi kas.',
    suggestedSnippets: [
      { label: 'Tabel Rekonsiliasi', text: 'Tampilkan perbandingan saldo dalam bentuk tabel per komparasi akun.' },
      { label: 'Peringatan Defisit', text: 'Berikan peringatan dini jika ada pos pengeluaran melampaui batas wajar.' },
      { label: 'Kepatuhan SPK', text: 'Validasi kesesuaian anggaran terhadap SPK persetujuan cetak buku.' }
    ]
  },
  3: {
    divisionId: 3,
    divisionName: 'Penerbitan & Editorial',
    divisionCode: 'PNB',
    iconName: 'BookOpen',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    defaultPrompt:
      'Bertindaklah sebagai Kepala Redaksi & Kurator Naskah Dharma. Gunakan gaya bahasa editorial yang santun, tertata, dan berbobot. Berikan penekanan pada kelayakan naskah, perhitungan Harga Pokok Penjualan (HPP) per eksemplar, kepatuhan katalogisasi ISBN, serta ketepatan terminologi literatur ajaran Lamrim.',
    styleDescription: 'Gaya literatur santun, presisi HPP, kelayakan ISBN, dan kurasi naskah.',
    suggestedSnippets: [
      { label: 'Rincian Margin HPP', text: 'Sertakan perhitungan margin laba dan batas harga jual optimal.' },
      { label: 'Cek Kelengkapan ISBN', text: 'Verifikasi status pendaftaran ISBN dan barcode per naskah.' },
      { label: 'Daftar Istilah Dharma', text: 'Gunakan istilah bahasa Indonesia baku yang sesuai korpus teks Lamrim.' }
    ]
  },
  4: {
    divisionId: 4,
    divisionName: 'Marketing & Distribution',
    divisionCode: 'MAD',
    iconName: 'ShoppingBag',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    defaultPrompt:
      'Bertindaklah sebagai Manajer Pemasaran & Strategi Penjualan. Gunakan gaya bahasa persuasif, berorientasi pertumbuhan, dan berbasis data. Soroti angka konversi bazar, efektivitas promosi bundling buku, retensi donatur dan pembeli, serta analisis saluran distribusi ritel dan online.',
    styleDescription: 'Dinamis, persuasif, fokus konversi bazaar, retensi donatur, dan omset.',
    suggestedSnippets: [
      { label: 'Analisis Omset Bazar', text: 'Bandingkan performa transaksi booth event bazar terhadap target omset.' },
      { label: 'Draf Broadcast Promo', text: 'Sertakan draf pesan promosi WhatsApp yang siap dikirim ke agen/umat.' },
      { label: 'Bundling Buku', text: 'Berikan rekomendasi paket hemat 2-3 judul buku dengan minat tertinggi.' }
    ]
  },
  5: {
    divisionId: 5,
    divisionName: 'Produksi Percetakan',
    divisionCode: 'PRD',
    iconName: 'Factory',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    defaultPrompt:
      'Bertindaklah sebagai Manajer Pabrikasi & Teknik Percetakan. Berikan laporan berbasis teknis manufaktur percetakan. Fokuskan pada oplah cetak, jadwal mesin pabrikasi, jenis kertas dan gramatur (HVS/Bookpaper), kontrol kualitas fisik buku (finishing/jilid), dan minimalisasi rasio waste kertas.',
    styleDescription: 'Teknis manufaktur, kontrol kualitas kertas, jadwal mesin, dan efisiensi oplah.',
    suggestedSnippets: [
      { label: 'Jadwal Antrean Mesin', text: 'Petakan estimasi hari kerja percetakan berdasarkan antrean mesin aktif.' },
      { label: 'Spesifikasi Kertas & Jilid', text: 'Uraikan ketebalan punggung buku, jenis laminasi, dan gramatur kertas.' },
      { label: 'Efisiensi Bahan Baku', text: 'Hitung rasio penggunaan kertas untuk meminimalkan potongan sisa (afval).' }
    ]
  },
  6: {
    divisionId: 6,
    divisionName: 'Logistik & Gudang',
    divisionCode: 'LOG',
    iconName: 'Truck',
    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    defaultPrompt:
      'Bertindaklah sebagai Koordinator Rantai Pasok (Supply Chain) & Logistik Gudang. Fokuskan pada akurasi pencatatan stok fisik rak, batas minimum pemesanan ulang (reorder point), kecepatan proses packing pesanan, pelacakan ekspedisi kurir, serta keabsahan surat jalan serah terima buku.',
    styleDescription: 'Operasional logistik, akurasi stok rak, verifikasi surat jalan, dan pelacakan ekspedisi.',
    suggestedSnippets: [
      { label: 'Audit Stok Kritis', text: 'Soroti judul buku dengan sisa stok rak di bawah batas aman minimum (20 pcs).' },
      { label: 'Draf Surat Jalan', text: 'Formatkan rincian muatan paket sesuai format resmi surat jalan pengiriman.' },
      { label: 'Estimasi Ongkir & Resi', text: 'Kelompokkan paket berdasarkan wilayah ekspedisi untuk efisiensi biaya kirim.' }
    ]
  }
};

export const GLOBAL_STYLE_MODIFIERS = [
  {
    id: 'bullet_concise',
    label: '⚡ Ringkas & Poin Kunci',
    snippet: 'Sajikan jawaban dalam format bullet points padat, langsung ke inti solusi tanpa basa-basi pembuka.'
  },
  {
    id: 'markdown_table',
    label: '📊 Tabel Markdown',
    snippet: 'Formatkan data perbandingan dan metrik angka ke dalam tabel Markdown yang rapi dan mudah dibandingkan.'
  },
  {
    id: 'step_sop',
    label: '📋 Langkah SOP Bertahap',
    snippet: 'Sajikan panduan operasional dalam urutan nomor langkah bertahap (Langkah 1, 2, 3) yang siap dieksekusi.'
  },
  {
    id: 'swot_analysis',
    label: '🔍 Analisis SWOT & Mitigasi',
    snippet: 'Sertakan analisis SWOT ringkas (Kekuatan, Kelemahan, Peluang, Ancaman) beserta saran mitigasi risiko operasional.'
  }
];

export function getEffectivePromptPrefix(
  divisionId: DivisionId,
  aiDivisionPromptPrefixes?: Partial<Record<DivisionId, string>>,
  aiSystemPromptPrefix?: string,
  aiResponseTone?: AIResponseTone
): string {
  let basePrompt = '';
  if (aiDivisionPromptPrefixes && aiDivisionPromptPrefixes[divisionId] !== undefined) {
    basePrompt = aiDivisionPromptPrefixes[divisionId]!;
  } else if (aiSystemPromptPrefix) {
    basePrompt = aiSystemPromptPrefix;
  } else {
    basePrompt = DIVISION_PROMPT_PRESETS[divisionId]?.defaultPrompt || '';
  }

  const tone = aiResponseTone || 'professional';
  const toneConfig = AI_RESPONSE_TONE_CONFIGS[tone];
  if (toneConfig && toneConfig.directive) {
    if (!basePrompt.trim()) {
      return toneConfig.directive;
    }
    return `[${toneConfig.directive}]\n\n${basePrompt.trim()}`;
  }

  return basePrompt;
}
