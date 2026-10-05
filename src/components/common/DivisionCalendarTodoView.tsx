import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  Trash2,
  Edit,
  Search,
  LayoutGrid,
  CalendarDays,
  ListTodo,
  MapPin,
  CheckSquare,
  X,
  RotateCcw,
  Building2,
  Layers,
  BellRing,
  AlertTriangle
} from 'lucide-react';

export interface TodoSubtask {
  id: string;
  title: string;
  completed: boolean;
  picName?: string;
}

export interface CalendarTodoEvent {
  id: string;
  divisionId: DivisionId; // 1: Direktorat, 2: Finance, 3: Penerbitan, 4: Marketing, 5: Produksi, 6: Logistik
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  location?: string;
  category:
    | 'Rapat & Pleno'
    | 'Penerbitan & Cetak'
    | 'Bazaar & Event'
    | 'Distribusi & Logistik'
    | 'Keuangan & Audit'
    | 'Dharma & Sosial';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Selesai';
  picName: string; // Person-In-Charge (PIC) Utama
  picRole?: string;
  picDivisionId?: DivisionId;
  coPicNames?: string[]; // Tim Pendamping
  subtasks: TodoSubtask[];
  createdAt: string;
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const SHORT_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CATEGORY_STYLES: Record<
  CalendarTodoEvent['category'],
  { bg: string; text: string; border: string; dot: string }
> = {
  'Rapat & Pleno': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800/70',
    dot: 'bg-indigo-500'
  },
  'Penerbitan & Cetak': {
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800/70',
    dot: 'bg-violet-500'
  },
  'Bazaar & Event': {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/70',
    dot: 'bg-amber-500'
  },
  'Distribusi & Logistik': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800/70',
    dot: 'bg-cyan-500'
  },
  'Keuangan & Audit': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    dot: 'bg-emerald-500'
  },
  'Dharma & Sosial': {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/70',
    dot: 'bg-rose-500'
  }
};

const PRIORITY_BADGE: Record<CalendarTodoEvent['priority'], string> = {
  Tinggi: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  Sedang: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  Rendah: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
};

const DIVISION_META: Record<
  DivisionId,
  {
    title: string;
    subtitle: string;
    defaultCategory: CalendarTodoEvent['category'];
    defaultLocation: string;
    badgeBg: string;
  }
> = {
  1: {
    title: 'Kalender Kerja & To-Do List Direktorat',
    subtitle: 'Jadwal rapat pleno, evaluasi tata kelola yayasan, dan delegasi PIC tingkat Direktorat.',
    defaultCategory: 'Rapat & Pleno',
    defaultLocation: 'Ruang Sidang Direktorat',
    badgeBg: 'bg-indigo-600'
  },
  2: {
    title: 'Kalender Kerja & To-Do List Direktorat Finance',
    subtitle: 'Jadwal tutup buku bulanan, rekonsiliasi rekening bank, pencairan SPK cetak, dan audit PSAK.',
    defaultCategory: 'Keuangan & Audit',
    defaultLocation: 'Ruang Bendahara & Finance',
    badgeBg: 'bg-emerald-600'
  },
  3: {
    title: 'Kalender Kerja & To-Do List Direktorat Penerbitan',
    subtitle: 'Jadwal penyuntingan naskah, pengajuan ISBN Perpusnas, royalti penulis, dan kampanye Fashili.',
    defaultCategory: 'Penerbitan & Cetak',
    defaultLocation: 'Ruang Redaksi Penerbitan',
    badgeBg: 'bg-violet-600'
  },
  4: {
    title: 'Kalender Kerja & To-Do List Direktorat Marketing',
    subtitle: 'Jadwal pameran bazar buku, peluncuran Pre-Order (PO), promo bulanan, dan program Sahabat Member.',
    defaultCategory: 'Bazaar & Event',
    defaultLocation: 'Area Pameran / Divisi Marketing',
    badgeBg: 'bg-amber-600'
  },
  5: {
    title: 'Kalender Kerja & To-Do List Direktorat Produksi',
    subtitle: 'Jadwal naik cetak pabrikasi, Quality Control (QC) hasil jilid, dan target serah terima batch cetak.',
    defaultCategory: 'Penerbitan & Cetak',
    defaultLocation: 'Pabrik Percetakan & QC',
    badgeBg: 'bg-orange-600'
  },
  6: {
    title: 'Kalender Kerja & To-Do List Direktorat Logistik',
    subtitle: 'Jadwal packing pesanan massal, pengiriman ekspedisi kargo, dan stock opname fisik gudang.',
    defaultCategory: 'Distribusi & Logistik',
    defaultLocation: 'Gudang Utama Logistik',
    badgeBg: 'bg-cyan-600'
  }
};

export const CALENDAR_STORAGE_KEY = 'mis_all_divisions_calendar_todos_v3';

const getRelativeDateStr = (offsetDays: number, fallbackYear: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // If fallbackYear differs from current year, use fallbackYear
  const yr = fallbackYear || d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mm}-${dd}`;
};

export const getDeadlineInfo = (dateStr: string, status: CalendarTodoEvent['status']) => {
  if (status === 'Selesai') {
    return { state: 'completed' as const, diffDays: 0, label: 'Tuntas' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      state: 'overdue' as const,
      diffDays,
      label: `Terlambat ${Math.abs(diffDays)} hari`
    };
  }
  if (diffDays === 0) {
    return {
      state: 'today' as const,
      diffDays: 0,
      label: 'Deadline Hari Ini!'
    };
  }
  if (diffDays <= 7) {
    return {
      state: 'approaching' as const,
      diffDays,
      label: `H-${diffDays} Hari Lagi`
    };
  }
  return {
    state: 'upcoming' as const,
    diffDays,
    label: `${diffDays} hari lagi`
  };
};

export const getStoredCalendarEvents = (): CalendarTodoEvent[] => {
  const currentYear = new Date().getFullYear();
  try {
    const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return createInitialDivisionEvents(currentYear);
};

export const createInitialDivisionEvents = (year: number): CalendarTodoEvent[] => [
  // 1. DIREKTORAT (Division 1)
  {
    id: 'evt-dir-1',
    divisionId: 1,
    title: 'Rapat Pleno Awal Tahun & Pengesahan RAB 6 Direktorat',
    description: 'Evaluasi capaian tahun lalu dan penetapan target strategis lintas direktorat.',
    date: `${year}-01-15`,
    time: '09:00 - 12:00 WIB',
    location: 'Ruang Sidang Utama Direktorat',
    category: 'Rapat & Pleno',
    priority: 'Tinggi',
    status: 'Selesai',
    picName: 'Budi Santoso',
    picRole: 'Direktur Utama (DIR)',
    picDivisionId: 1,
    coPicNames: ['Siti Aminah', 'Rina Wijaya'],
    subtasks: [
      { id: 'st-d1-1', title: 'Siapkan dokumen rekap kinerja 6 direktorat', completed: true, picName: 'Budi Santoso' },
      { id: 'st-d1-2', title: 'Pengesahan pagu anggaran cetak tahunan', completed: true, picName: 'Siti Aminah' },
      { id: 'st-d1-3', title: 'Distribusi SK penugasan koordinator divisi', completed: true, picName: 'Budi Santoso' }
    ],
    createdAt: `${year}-01-05T08:00:00Z`
  },
  {
    id: 'evt-dir-2',
    divisionId: 1,
    title: 'Verifikasi Data Anggota VIP & Pengurus Direktorat',
    description: 'Validasi pembaruan database identitas anggota, Sangha, dan relawan Dharma Patriot.',
    date: getRelativeDateStr(-2, year), // Overdue 2 days ago for realistic reminder
    time: '10:00 - 13:00 WIB',
    location: 'Sekretariat Direktorat',
    category: 'Rapat & Pleno',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Budi Santoso',
    picRole: 'Direktur Utama (DIR)',
    picDivisionId: 1,
    coPicNames: ['Dewi Lestari'],
    subtasks: [
      { id: 'st-d2-1', title: 'Audit kelengkapan data NIK & jabatan anggota', completed: true, picName: 'Budi Santoso' },
      { id: 'st-d2-2', title: 'Sinkronisasi anggota baru dari event bazar', completed: false, picName: 'Dewi Lestari' }
    ],
    createdAt: `${year}-06-01T08:00:00Z`
  },
  {
    id: 'evt-dir-3',
    divisionId: 1,
    title: 'Rapat Koordinasi Mingguan & Evaluasi KPI Direktorat',
    description: 'Pemeriksaan progres tugas mingguan seluruh kepala divisi kepada Dewan Pembina.',
    date: getRelativeDateStr(1, year), // Approaching (Tomorrow / H-1)
    time: '09:00 - 15:00 WIB',
    location: 'Aula Utama Yayasan',
    category: 'Rapat & Pleno',
    priority: 'Tinggi',
    status: 'Belum Mulai',
    picName: 'Budi Santoso',
    picRole: 'Direktur Utama (DIR)',
    picDivisionId: 1,
    coPicNames: ['Siti Aminah', 'Agus Pratama'],
    subtasks: [
      { id: 'st-d3-1', title: 'Kompilasi laporan keuangan & stok buku terkini', completed: false, picName: 'Siti Aminah' },
      { id: 'st-d3-2', title: 'Siapkan slide presentasi Mode Rapat Pleno', completed: false, picName: 'Budi Santoso' }
    ],
    createdAt: `${year}-10-01T08:00:00Z`
  },

  // 2. FINANCE (Division 2)
  {
    id: 'evt-fin-1',
    divisionId: 2,
    title: 'Rekonsiliasi Rekening Koran Bank & Kas Kuartal I',
    description: 'Pencocokan mutasi buku kas internal dengan e-statement BCA & Mandiri Yayasan.',
    date: `${year}-03-28`,
    time: '10:00 - 15:00 WIB',
    location: 'Ruang Bendahara & Finance',
    category: 'Keuangan & Audit',
    priority: 'Tinggi',
    status: 'Selesai',
    picName: 'Siti Aminah',
    picRole: 'Bendahara (FIN)',
    picDivisionId: 2,
    coPicNames: ['Budi Santoso'],
    subtasks: [
      { id: 'st-f1-1', title: 'Unduh rekening koran BCA & Mandiri bulan Jan-Mar', completed: true, picName: 'Siti Aminah' },
      { id: 'st-f1-2', title: 'Jalankan fitur Auto-Match Rekonsiliasi Bank', completed: true, picName: 'Siti Aminah' }
    ],
    createdAt: `${year}-03-10T09:00:00Z`
  },
  {
    id: 'evt-fin-2',
    divisionId: 2,
    title: 'Pencairan SPK Cetak & Pembayaran Royalti Penulis',
    description: 'Verifikasi tagihan vendor percetakan dan transfer bagi hasil royalti penulis/penerjemah.',
    date: getRelativeDateStr(-1, year), // Overdue 1 day ago
    time: '09:30 - 14:00 WIB',
    location: 'Divisi Finance',
    category: 'Keuangan & Audit',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Siti Aminah',
    picRole: 'Bendahara (FIN)',
    picDivisionId: 2,
    coPicNames: ['Rina Wijaya'],
    subtasks: [
      { id: 'st-f2-1', title: 'Verifikasi invoice SPK cetak dari Produksi', completed: true, picName: 'Siti Aminah' },
      { id: 'st-f2-2', title: 'Transfer royalti penulis & simpan bukti referensi', completed: false, picName: 'Siti Aminah' }
    ],
    createdAt: `${year}-07-01T09:00:00Z`
  },
  {
    id: 'evt-fin-3',
    divisionId: 2,
    title: 'Tutup Buku Kas Bulanan & Audit Laporan ISAK 35',
    description: 'Finalisasi Laporan Posisi Keuangan, Penghasilan Komprehensif, dan Arus Kas.',
    date: getRelativeDateStr(2, year), // Approaching H-2
    time: '09:00 - 17:00 WIB',
    location: 'Ruang Finance',
    category: 'Keuangan & Audit',
    priority: 'Tinggi',
    status: 'Belum Mulai',
    picName: 'Siti Aminah',
    picRole: 'Bendahara (FIN)',
    picDivisionId: 2,
    coPicNames: ['Budi Santoso'],
    subtasks: [
      { id: 'st-f3-1', title: 'Pastikan seluruh invoice lunas tercatat di jurnal mutasi', completed: false, picName: 'Siti Aminah' },
      { id: 'st-f3-2', title: 'Ekspor PDF Laporan Standar PSAK / ISAK 35', completed: false, picName: 'Siti Aminah' }
    ],
    createdAt: `${year}-10-02T09:00:00Z`
  },

  // 3. PENERBITAN (Division 3)
  {
    id: 'evt-pub-1',
    divisionId: 3,
    title: 'Finalisasi Layout Naskah & Pengajuan ISBN Buku Baru',
    description: 'Pemeriksaan akhir naskah terjemahan Lamrim, halaman dedikasi Fashili, dan pengurusan ISBN.',
    date: getRelativeDateStr(0, year), // Deadline Today!
    time: '13:00 - 16:00 WIB',
    location: 'Ruang Redaksi Penerbitan',
    category: 'Penerbitan & Cetak',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Rina Wijaya',
    picRole: 'Kepala Penerbitan (PUB)',
    picDivisionId: 3,
    coPicNames: ['Hendra Kusuma'],
    subtasks: [
      { id: 'st-p1-1', title: 'Proofreading akhir teks & daftar nama donatur cetak', completed: true, picName: 'Rina Wijaya' },
      { id: 'st-p1-2', title: 'Registrasi barcode ISBN ke Perpusnas', completed: false, picName: 'Rina Wijaya' }
    ],
    createdAt: `${year}-02-01T08:00:00Z`
  },
  {
    id: 'evt-pub-2',
    divisionId: 3,
    title: 'Penutupan Kuota Sponsorship Fashili & Pengajuan Cetak',
    description: 'Rekapitulasi dana terkumpul proyek donasi cetak buku Dharma untuk diajukan ke Finance.',
    date: getRelativeDateStr(3, year), // Approaching H-3
    time: '10:00 - 15:00 WIB',
    location: 'Divisi Penerbitan',
    category: 'Dharma & Sosial',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Rina Wijaya',
    picRole: 'Kepala Penerbitan (PUB)',
    picDivisionId: 3,
    coPicNames: ['Siti Aminah'],
    subtasks: [
      { id: 'st-p2-1', title: 'Susun layout Halaman Dedikasi Donatur siap cetak', completed: true, picName: 'Rina Wijaya' },
      { id: 'st-p2-2', title: 'Kirim form Pengajuan Cetak ke Bendahara Finance', completed: false, picName: 'Rina Wijaya' }
    ],
    createdAt: `${year}-07-28T08:00:00Z`
  },

  // 4. MARKETING (Division 4)
  {
    id: 'evt-mkt-1',
    divisionId: 4,
    title: 'Rekonsiliasi Sisa Stok Bazar & Setoran Kasir Event POS',
    description: 'Pengecekan kecocokan buku kembali dari pameran bazar dan setoran omset QRIS/Tunai.',
    date: getRelativeDateStr(-1, year), // Overdue 1 day
    time: '08:00 - 20:00 WIB',
    location: 'Hall Pameran Utama',
    category: 'Bazaar & Event',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Dewi Lestari',
    picRole: 'Koordinator Marketing (MKT)',
    picDivisionId: 4,
    coPicNames: ['Agus Pratama'],
    subtasks: [
      { id: 'st-m1-1', title: 'Alokasi stok buku bazar dari gudang logistik', completed: true, picName: 'Agus Pratama' },
      { id: 'st-m1-2', title: 'Siapkan kupon diskon & katalog paket bundling di POS', completed: true, picName: 'Dewi Lestari' },
      { id: 'st-m1-3', title: 'Rekonsiliasi sisa stok buku bazar selesai acara', completed: false, picName: 'Dewi Lestari' }
    ],
    createdAt: `${year}-04-25T08:00:00Z`
  },
  {
    id: 'evt-mkt-2',
    divisionId: 4,
    title: 'Kampanye Pre-Order (PO) Buku Baru & Broadcast WhatsApp',
    description: 'Pembukaan gelombang Pre-Order dengan harga khusus dan pengiriman pengingat WA ke pelanggan.',
    date: getRelativeDateStr(2, year), // Approaching H-2
    time: '09:00 - 17:00 WIB',
    location: 'Divisi Marketing & Kanal Online',
    category: 'Bazaar & Event',
    priority: 'Tinggi',
    status: 'Belum Mulai',
    picName: 'Dewi Lestari',
    picRole: 'Koordinator Marketing (MKT)',
    picDivisionId: 4,
    coPicNames: ['Rina Wijaya'],
    subtasks: [
      { id: 'st-m2-1', title: 'Aktifkan campaign Pre-Order & target kuota di sistem', completed: true, picName: 'Dewi Lestari' },
      { id: 'st-m2-2', title: 'Broadcast info PO ke member Gold & Platinum via WA', completed: false, picName: 'Dewi Lestari' }
    ],
    createdAt: `${year}-09-29T08:00:00Z`
  },

  // 5. PRODUKSI (Division 5)
  {
    id: 'evt-prd-1',
    divisionId: 5,
    title: 'Produksi Cetak Massal 3.000 Eks Buku Lamrim & Paritta',
    description: 'Proses cetak offset, laminasi sampul, penjilidan, dan Quality Control (QC) pabrikasi.',
    date: getRelativeDateStr(0, year), // Deadline Today!
    time: '08:30 - 16:30 WIB',
    location: 'Pabrik Percetakan & Unit QC',
    category: 'Penerbitan & Cetak',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Hendra Kusuma',
    picRole: 'Supervisor Produksi (PRD)',
    picDivisionId: 5,
    coPicNames: ['Agus Pratama'],
    subtasks: [
      { id: 'st-pr1-1', title: 'Inspeksi dummy cetak (proof print) & warna cover', completed: true, picName: 'Hendra Kusuma' },
      { id: 'st-pr1-2', title: 'Sortir buku lolos QC dan catat batch masuk ke gudang', completed: false, picName: 'Hendra Kusuma' }
    ],
    createdAt: `${year}-06-05T08:00:00Z`
  },
  {
    id: 'evt-prd-2',
    divisionId: 5,
    title: 'Perawatan Mesin Jilid & Evaluasi Vendor Kertas Bookpaper',
    description: 'Pengecekan rutin kualitas bahan baku kertas dan negosiasi HPP cetak kuartal IV.',
    date: getRelativeDateStr(4, year), // Approaching H-4
    time: '09:00 - 14:00 WIB',
    location: 'Workshop Produksi',
    category: 'Penerbitan & Cetak',
    priority: 'Sedang',
    status: 'Belum Mulai',
    picName: 'Hendra Kusuma',
    picRole: 'Supervisor Produksi (PRD)',
    picDivisionId: 5,
    coPicNames: ['Siti Aminah'],
    subtasks: [
      { id: 'st-pr2-1', title: 'Cek stok bahan kertas bookpaper 72gr & art carton', completed: false, picName: 'Hendra Kusuma' },
      { id: 'st-pr2-2', title: 'Perbarui perbandingan penawaran harga vendor cetak', completed: false, picName: 'Hendra Kusuma' }
    ],
    createdAt: `${year}-10-01T08:00:00Z`
  },

  // 6. LOGISTIK (Division 6)
  {
    id: 'evt-log-1',
    divisionId: 6,
    title: 'Distribusi Kargo Buku Hibah ke 25 Vihara & Perpustakaan',
    description: 'Packing aman, pencetakan Surat Jalan resmi, dan pengiriman resi WhatsApp ke pengurus vihara.',
    date: getRelativeDateStr(-1, year), // Overdue 1 day
    time: '08:30 - 16:00 WIB',
    location: 'Gudang Utama Logistik',
    category: 'Distribusi & Logistik',
    priority: 'Tinggi',
    status: 'Sedang Berjalan',
    picName: 'Agus Pratama',
    picRole: 'Kepala Logistik (LOG)',
    picDivisionId: 6,
    coPicNames: ['Dewi Lestari'],
    subtasks: [
      { id: 'st-l1-1', title: 'Siapkan kardus berlapis & cetak label Surat Jalan', completed: true, picName: 'Agus Pratama' },
      { id: 'st-l1-2', title: 'Serah terima paket ke kurir kargo & input nomor resi', completed: false, picName: 'Agus Pratama' }
    ],
    createdAt: `${year}-08-02T08:00:00Z`
  },
  {
    id: 'evt-log-2',
    divisionId: 6,
    title: 'Stock Opname Fisik Gudang & Audit Barcode ISBN',
    description: 'Perhitungan fisik seluruh stok buku di rak gudang dan pencocokan dengan saldo sistem.',
    date: getRelativeDateStr(2, year), // Approaching H-2
    time: '09:00 - 17:00 WIB',
    location: 'Gudang Utama Logistik',
    category: 'Distribusi & Logistik',
    priority: 'Tinggi',
    status: 'Belum Mulai',
    picName: 'Agus Pratama',
    picRole: 'Kepala Logistik (LOG)',
    picDivisionId: 6,
    coPicNames: ['Hendra Kusuma', 'Siti Aminah'],
    subtasks: [
      { id: 'st-l2-1', title: 'Scan barcode ISBN seluruh rak buku gudang', completed: false, picName: 'Agus Pratama' },
      { id: 'st-l2-2', title: 'Buat berita acara hasil stock opname akhir tahun', completed: false, picName: 'Agus Pratama' }
    ],
    createdAt: `${year}-10-03T08:00:00Z`
  }
];

interface DivisionCalendarTodoViewProps {
  divisionId: DivisionId;
}

export const DivisionCalendarTodoView: React.FC<DivisionCalendarTodoViewProps> = ({ divisionId }) => {
  const { usersList, identitasList, divisiList, recordActivity, showToast, switchDivision } = useApp();

  const currentYearActual = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearActual);
  const [viewMode, setViewMode] = useState<'12-months' | 'single-month' | 'todo-list'>('12-months');
  const [focusedMonth, setFocusedMonth] = useState<number>(new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Scope toggle: 'current-division' (only this directorate/division) vs 'all-divisions' (integrated across all 6 directorates)
  const [scopeFilter, setScopeFilter] = useState<'current-division' | 'all-divisions'>('current-division');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPic, setFilterPic] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Load or initialize events shared across all divisions
  const [events, setEvents] = useState<CalendarTodoEvent[]>(() => getStoredCalendarEvents());

  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent('mis-calendar-events-updated'));
    } catch {
      // ignore storage errors
    }
  }, [events]);

  // Manual trigger to test / fire deadline toast notifications for this division
  const handleTriggerDeadlineToastsNow = () => {
    const divEvts = events.filter(e => {
      const evtDiv = e.divisionId || e.picDivisionId || 1;
      return scopeFilter === 'current-division' ? evtDiv === divisionId : true;
    });

    const overdueList = divEvts.filter(e => getDeadlineInfo(e.date, e.status).state === 'overdue');
    const todayOrApproachingList = divEvts.filter(e => {
      const st = getDeadlineInfo(e.date, e.status).state;
      return st === 'today' || st === 'approaching';
    });

    if (overdueList.length === 0 && todayOrApproachingList.length === 0) {
      showToast({
        title: '✅ Seluruh Jadwal Terkendali',
        message: `Tidak ada tugas yang melewati atau mendekati tenggat waktu (deadline) di ${currentDivObj?.nama_divisi || 'Direktorat'}.`,
        type: 'success',
        category: 'deadline',
        duration: 4500
      });
      return;
    }

    overdueList.slice(0, 2).forEach(ev => {
      const info = getDeadlineInfo(ev.date, ev.status);
      showToast({
        title: `🚨 Melewati Tenggat (${info.label})`,
        message: `Tugas "${ev.title}" (PIC: ${ev.picName}) jatuh tempo pada ${ev.date}. Mohon segera ditindaklanjuti!`,
        type: 'urgent',
        category: 'deadline',
        duration: 7000,
        actionLabel: 'Lihat Tugas',
        onAction: () => {
          setSelectedDateStr(ev.date);
        }
      });
    });

    todayOrApproachingList.slice(0, 2).forEach(ev => {
      const info = getDeadlineInfo(ev.date, ev.status);
      showToast({
        title: `⏰ Pengingat Deadline (${info.label})`,
        message: `Agenda "${ev.title}" bersama PIC ${ev.picName} terjadwal pada ${ev.date}.`,
        type: info.state === 'today' ? 'urgent' : 'warning',
        category: 'deadline',
        duration: 6500,
        actionLabel: 'Buka Tanggal',
        onAction: () => {
          setSelectedDateStr(ev.date);
        }
      });
    });
  };

  const divMeta = DIVISION_META[divisionId] || DIVISION_META[1];
  const currentDivObj = divisiList.find(d => d.id === divisionId);

  // Combined list of Responsible Persons (PIC options) prioritizing current division members first
  const picOptions = useMemo(() => {
    const map = new Map<
      string,
      { name: string; role: string; divisionId: DivisionId; isCurrentDiv: boolean }
    >();

    usersList.forEach(u => {
      const div = divisiList.find(d => d.id === u.divisi_id);
      map.set(u.name, {
        name: u.name,
        role: `${u.role || 'Staf'} (${div?.kode || 'DIR'})`,
        divisionId: u.divisi_id,
        isCurrentDiv: u.divisi_id === divisionId
      });
    });

    identitasList.forEach(id => {
      if (!map.has(id.nama_lengkap)) {
        const itemDivId = ((id.divisi_id as DivisionId) || 1) as DivisionId;
        map.set(id.nama_lengkap, {
          name: id.nama_lengkap,
          role: id.jabatan || id.jenis_umat || 'Anggota',
          divisionId: itemDivId,
          isCurrentDiv: itemDivId === divisionId
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.isCurrentDiv && !b.isCurrentDiv) return -1;
      if (!a.isCurrentDiv && b.isCurrentDiv) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [usersList, identitasList, divisiList, divisionId]);

  // Modal State for Creating / Editing Event & To-Do
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarTodoEvent | null>(null);
  const [customPicInput, setCustomPicInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskPic, setNewSubtaskPic] = useState('');
  const [coPicInput, setCoPicInput] = useState('');

  const defaultPicForDivision = useMemo(() => {
    return (
      picOptions.find(p => p.divisionId === divisionId) ||
      picOptions[0] || {
        name: 'Budi Santoso',
        role: 'Koordinator',
        divisionId,
        isCurrentDiv: true
      }
    );
  }, [picOptions, divisionId]);

  const [formState, setFormState] = useState<{
    divisionId: DivisionId;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: CalendarTodoEvent['category'];
    priority: CalendarTodoEvent['priority'];
    status: CalendarTodoEvent['status'];
    picName: string;
    picRole: string;
    picDivisionId: DivisionId;
    coPicNames: string[];
    subtasks: TodoSubtask[];
  }>({
    divisionId,
    title: '',
    description: '',
    date: `${selectedYear}-01-01`,
    time: '09:00 - 11:30 WIB',
    location: divMeta.defaultLocation,
    category: divMeta.defaultCategory,
    priority: 'Tinggi',
    status: 'Belum Mulai',
    picName: defaultPicForDivision.name,
    picRole: defaultPicForDivision.role,
    picDivisionId: divisionId,
    coPicNames: [],
    subtasks: []
  });

  const openCreateModal = (defaultDate?: string) => {
    setEditingEvent(null);
    const initialDate =
      defaultDate ||
      selectedDateStr ||
      `${selectedYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
        new Date().getDate()
      ).padStart(2, '0')}`;

    setFormState({
      divisionId,
      title: '',
      description: '',
      date: initialDate,
      time: '09:00 - 11:30 WIB',
      location: divMeta.defaultLocation,
      category: divMeta.defaultCategory,
      priority: 'Tinggi',
      status: 'Belum Mulai',
      picName: defaultPicForDivision.name,
      picRole: defaultPicForDivision.role,
      picDivisionId: divisionId,
      coPicNames: [],
      subtasks: []
    });
    setCustomPicInput('');
    setNewSubtaskTitle('');
    setNewSubtaskPic(defaultPicForDivision.name);
    setIsModalOpen(true);
  };

  const openEditModal = (evt: CalendarTodoEvent) => {
    setEditingEvent(evt);
    setFormState({
      divisionId: evt.divisionId || divisionId,
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time || '',
      location: evt.location || '',
      category: evt.category,
      priority: evt.priority,
      status: evt.status,
      picName: evt.picName,
      picRole: evt.picRole || '',
      picDivisionId: evt.picDivisionId || evt.divisionId || divisionId,
      coPicNames: evt.coPicNames || [],
      subtasks: [...evt.subtasks]
    });
    setCustomPicInput('');
    setNewSubtaskTitle('');
    setNewSubtaskPic(evt.picName);
    setIsModalOpen(true);
  };

  const handlePicSelectChange = (name: string) => {
    const found = picOptions.find(p => p.name === name);
    setFormState(prev => ({
      ...prev,
      picName: name,
      picRole: found?.role || prev.picRole || 'Penanggung Jawab',
      picDivisionId: found?.divisionId || prev.picDivisionId || divisionId
    }));
    if (!newSubtaskPic) {
      setNewSubtaskPic(name);
    }
  };

  const handleAddSubtaskInForm = () => {
    if (!newSubtaskTitle.trim()) return;
    const item: TodoSubtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      picName: newSubtaskPic || formState.picName
    };
    setFormState(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, item]
    }));
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtaskInForm = (id: string) => {
    setFormState(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  const handleToggleCoPic = (name: string) => {
    if (!name || name === formState.picName) return;
    setFormState(prev => ({
      ...prev,
      coPicNames: prev.coPicNames.includes(name)
        ? prev.coPicNames.filter(n => n !== name)
        : [...prev.coPicNames, name]
    }));
  };

  const handleAddCustomCoPic = () => {
    const trimmed = coPicInput.trim();
    if (!trimmed) return;
    if (!formState.coPicNames.includes(trimmed)) {
      setFormState(prev => ({
        ...prev,
        coPicNames: [...prev.coPicNames, trimmed]
      }));
    }
    setCoPicInput('');
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) return;

    const finalPicName = customPicInput.trim() ? customPicInput.trim() : formState.picName;

    if (editingEvent) {
      setEvents(prev =>
        prev.map(item =>
          item.id === editingEvent.id
            ? {
                ...item,
                ...formState,
                picName: finalPicName
              }
            : item
        )
      );
      recordActivity(
        'Update Agenda & To-Do',
        `Kalender ${currentDivObj?.nama_divisi || 'Direktorat'}`,
        `Memperbarui agenda "${formState.title}" (${formState.date}) - PIC: ${finalPicName}`
      );
      triggerToast(`Agenda "${formState.title}" berhasil diperbarui!`);
    } else {
      const newEvt: CalendarTodoEvent = {
        id: `evt-${Date.now()}`,
        ...formState,
        picName: finalPicName,
        createdAt: new Date().toISOString()
      };
      setEvents(prev => [...prev, newEvt]);
      recordActivity(
        'Buat Event & To-Do',
        `Kalender ${currentDivObj?.nama_divisi || 'Direktorat'}`,
        `Menambahkan event "${formState.title}" pada ${formState.date} (PIC: ${finalPicName})`
      );
      triggerToast(`Event "${formState.title}" (PIC: ${finalPicName}) berhasil disimpan!`);
    }

    // Fire global dashboard toast reminder if the saved task is overdue, due today, or approaching within 7 days
    const dlInfo = getDeadlineInfo(formState.date, formState.status);
    if (dlInfo.state === 'overdue' || dlInfo.state === 'today' || dlInfo.state === 'approaching') {
      showToast({
        title:
          dlInfo.state === 'overdue'
            ? `🚨 Tugas Melewati Tenggat (${dlInfo.label})`
            : dlInfo.state === 'today'
            ? `⏰ Pengingat: Deadline Hari Ini!`
            : `⏳ Pengingat Deadline (${dlInfo.label})`,
        message: `Tugas "${formState.title}" (PIC: ${finalPicName}) memiliki tenggat pada ${formState.date}.`,
        type: dlInfo.state === 'overdue' || dlInfo.state === 'today' ? 'urgent' : 'warning',
        category: 'deadline',
        duration: 6000
      });
    }

    const evtYear = parseInt(formState.date.split('-')[0], 10);
    if (!isNaN(evtYear) && evtYear !== selectedYear) {
      setSelectedYear(evtYear);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEvent = (evt: CalendarTodoEvent) => {
    setEvents(prev => prev.filter(item => item.id !== evt.id));
    recordActivity(
      'Hapus Agenda Kalender',
      `Kalender ${currentDivObj?.nama_divisi || 'Direktorat'}`,
      `Menghapus agenda "${evt.title}" (${evt.date})`
    );
    triggerToast(`Agenda "${evt.title}" telah dihapus.`);
  };

  const handleToggleEventStatus = (evtId: string) => {
    setEvents(prev =>
      prev.map(evt => {
        if (evt.id !== evtId) return evt;
        const nextStatus: CalendarTodoEvent['status'] =
          evt.status === 'Belum Mulai'
            ? 'Sedang Berjalan'
            : evt.status === 'Sedang Berjalan'
            ? 'Selesai'
            : 'Belum Mulai';
        return { ...evt, status: nextStatus };
      })
    );
  };

  const handleToggleSubtask = (evtId: string, subtaskId: string) => {
    setEvents(prev =>
      prev.map(evt => {
        if (evt.id !== evtId) return evt;
        const updatedSubtasks = evt.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        const anyDone = updatedSubtasks.some(s => s.completed);
        const autoStatus: CalendarTodoEvent['status'] = allDone
          ? 'Selesai'
          : anyDone
          ? 'Sedang Berjalan'
          : evt.status;
        return {
          ...evt,
          subtasks: updatedSubtasks,
          status: autoStatus
        };
      })
    );
  };

  // Filtered events for the selected year and division scope
  const yearEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return events
      .filter(evt => {
        const evtYear = parseInt(evt.date.split('-')[0], 10);
        if (evtYear !== selectedYear) return false;

        // Scope check: only current division or all divisions
        const evtDivId = evt.divisionId || evt.picDivisionId || 1;
        if (scopeFilter === 'current-division' && evtDivId !== divisionId) {
          return false;
        }

        const matchSearch =
          !q ||
          evt.title.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.picName.toLowerCase().includes(q) ||
          (evt.coPicNames && evt.coPicNames.some(c => c.toLowerCase().includes(q))) ||
          evt.subtasks.some(
            s => s.title.toLowerCase().includes(q) || (s.picName && s.picName.toLowerCase().includes(q))
          );

        const matchPic =
          filterPic === 'all' ||
          evt.picName === filterPic ||
          (evt.coPicNames && evt.coPicNames.includes(filterPic)) ||
          evt.subtasks.some(s => s.picName === filterPic);

        const matchCategory = filterCategory === 'all' || evt.category === filterCategory;
        const matchStatus = filterStatus === 'all' || evt.status === filterStatus;

        return matchSearch && matchPic && matchCategory && matchStatus;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, selectedYear, scopeFilter, divisionId, searchQuery, filterPic, filterCategory, filterStatus]);

  // Map events by YYYY-MM-DD for quick calendar lookup
  const eventsByDateMap = useMemo(() => {
    const map: Record<string, CalendarTodoEvent[]> = {};
    yearEvents.forEach(evt => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [yearEvents]);

  // Unique PICs active in events for filter dropdown
  const availablePicsForFilter = useMemo(() => {
    const set = new Set<string>();
    picOptions.forEach(p => set.add(p.name));
    events.forEach(e => {
      if (e.picName) set.add(e.picName);
      e.coPicNames?.forEach(c => set.add(c));
    });
    return Array.from(set);
  }, [picOptions, events]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = yearEvents.length;
    const completed = yearEvents.filter(e => e.status === 'Selesai').length;
    const inProgress = yearEvents.filter(e => e.status === 'Sedang Berjalan').length;
    const pending = yearEvents.filter(e => e.status === 'Belum Mulai').length;
    const totalSubtasks = yearEvents.reduce((acc, e) => acc + e.subtasks.length, 0);
    const doneSubtasks = yearEvents.reduce((acc, e) => acc + e.subtasks.filter(s => s.completed).length, 0);
    return { total, completed, inProgress, pending, totalSubtasks, doneSubtasks };
  }, [yearEvents]);

  // Helper to build calendar grid for a specific month (0-11) and year
  const buildMonthDays = (year: number, monthIndex: number) => {
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateStr: string | null }> = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  }, []);

  // Events to display in the To-Do detail panel
  const displayedTodoEvents = useMemo(() => {
    if (selectedDateStr) {
      return yearEvents.filter(e => e.date === selectedDateStr);
    }
    if (viewMode === 'single-month') {
      const prefix = `${selectedYear}-${String(focusedMonth + 1).padStart(2, '0')}`;
      return yearEvents.filter(e => e.date.startsWith(prefix));
    }
    return yearEvents;
  }, [yearEvents, selectedDateStr, viewMode, selectedYear, focusedMonth]);

  // Available years for quick selector
  const yearChoices = useMemo(() => {
    const base = currentYearActual;
    const list: number[] = [];
    for (let y = base - 3; y <= base + 5; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearActual]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Year Selector Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl ${divMeta.badgeBg} text-white flex items-center justify-center shadow-md shrink-0`}
            >
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {divMeta.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Tahun {selectedYear}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Divisi: {currentDivObj?.nama_divisi || 'Direktorat'} ({currentDivObj?.kode || 'DIR'})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{divMeta.subtitle}</p>
            </div>
          </div>

          {/* Controls: Scope Toggle, Year Picker, View Switcher & Create Event Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Division Scope Filter Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setScopeFilter('current-division')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  scopeFilter === 'current-division'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Hanya tampilkan jadwal & To-Do direktorat ini"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Divisi {currentDivObj?.nama_divisi || 'Ini'}</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('all-divisions')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  scopeFilter === 'all-divisions'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Tampilkan gabungan jadwal seluruh 6 direktorat"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lintas Direktorat (Semua)</span>
              </button>
            </div>

            {/* Year Selector Control */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(prev => prev - 1);
                  setSelectedDateStr(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tahun Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedYear}
                onChange={e => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedDateStr(null);
                }}
                aria-label="Pilih Tahun Kalender"
                className="px-2 py-1 bg-transparent font-extrabold text-xs text-indigo-700 dark:text-indigo-300 focus:outline-none cursor-pointer"
              >
                {yearChoices.map(yr => (
                  <option
                    key={yr}
                    value={yr}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    Tahun {yr}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedYear(prev => prev + 1);
                  setSelectedDateStr(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tahun Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('12-months')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === '12-months'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>12 Bulan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single-month')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'single-month'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Bulanan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('todo-list')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'todo-list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>To-Do List</span>
              </button>
            </div>

            {/* Trigger Deadline Reminder Toast Button */}
            <button
              type="button"
              onClick={handleTriggerDeadlineToastsNow}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-400/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Tampilkan notifikasi pengingat (Toast) untuk tugas yang mendekati atau melewati tenggat waktu (Deadline)"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Cek Pengingat Deadline</span>
            </button>

            {/* Create Event & To-Do Button */}
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event & To-Do</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Total Event ({selectedYear})
              </p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.total} Agenda</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Sedang Berjalan / Belum</p>
              <p className="text-lg font-extrabold text-amber-800 dark:text-amber-200">
                {stats.inProgress + stats.pending} Aktif
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Event Selesai</p>
              <p className="text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
                {stats.completed} Tuntas
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-violet-700 dark:text-violet-300 font-medium">
                Checklist Tugas (To-Do)
              </p>
              <p className="text-lg font-extrabold text-violet-800 dark:text-violet-200">
                {stats.doneSubtasks}/{stats.totalSubtasks} Selesai
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Instant Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama event, rincian to-do list, atau nama PIC (Person-In-Charge)..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter by Responsible Person (PIC) */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select
              value={filterPic}
              onChange={e => setFilterPic(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua PIC (Penanggung Jawab)</option>
              {availablePicsForFilter.map(name => (
                <option key={name} value={name}>
                  PIC: {name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="Rapat & Pleno">Rapat & Pleno</option>
            <option value="Penerbitan & Cetak">Penerbitan & Cetak</option>
            <option value="Bazaar & Event">Bazaar & Event</option>
            <option value="Distribusi & Logistik">Distribusi & Logistik</option>
            <option value="Keuangan & Audit">Keuangan & Audit</option>
            <option value="Dharma & Sosial">Dharma & Sosial</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Mulai">Belum Mulai</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Selesai">Selesai</option>
          </select>

          {(searchQuery ||
            filterPic !== 'all' ||
            filterCategory !== 'all' ||
            filterStatus !== 'all' ||
            selectedDateStr) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterPic('all');
                setFilterCategory('all');
                setFilterStatus('all');
                setSelectedDateStr(null);
              }}
              className="flex items-center space-x-1 px-2.5 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: 12-MONTH FULL YEAR INTERACTIVE CALENDAR GRID */}
      {viewMode === '12-months' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Visualisasi Kalender 12 Bulan ({selectedYear})
              </span>
              <span>•</span>
              <span>Klik tanggal untuk memfilter To-Do, atau klik tombol + untuk Create Event baru.</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              {Object.entries(CATEGORY_STYLES).map(([cat, st]) => (
                <span key={cat} className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                  <span>{cat}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {INDONESIAN_MONTHS.map((monthName, monthIdx) => {
              const cells = buildMonthDays(selectedYear, monthIdx);
              const monthPrefix = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
              const monthEvents = yearEvents.filter(e => e.date.startsWith(monthPrefix));

              return (
                <div
                  key={monthName}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                >
                  <div>
                    {/* Month Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMonth(monthIdx);
                          setViewMode('single-month');
                        }}
                        className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title={`Perbesar tampilan bulanan ${monthName} ${selectedYear}`}
                      >
                        <span>{monthName}</span>
                        <span className="text-xs font-normal text-slate-400">{selectedYear}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {monthEvents.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                            {monthEvents.length} tugas
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openCreateModal(`${monthPrefix}-01`)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={`Create Event di bulan ${monthName}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                      {SHORT_DAYS.map((d, i) => (
                        <span
                          key={d}
                          className={`text-[10px] font-bold py-0.5 ${
                            i === 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {cells.map((cell, idx) => {
                        if (!cell.day || !cell.dateStr) {
                          return <div key={`empty-${idx}`} className="h-7" />;
                        }

                        const dayEvts = eventsByDateMap[cell.dateStr] || [];
                        const isSelected = selectedDateStr === cell.dateStr;
                        const isToday = todayStr === cell.dateStr;
                        const hasEvents = dayEvts.length > 0;

                        return (
                          <button
                            key={cell.dateStr}
                            type="button"
                            onClick={() => {
                              if (selectedDateStr === cell.dateStr) {
                                setSelectedDateStr(null);
                              } else {
                                setSelectedDateStr(cell.dateStr);
                              }
                            }}
                            onDoubleClick={() => openCreateModal(cell.dateStr!)}
                            title={
                              hasEvents
                                ? `${dayEvts.length} Agenda pada ${cell.dateStr}: ${dayEvts
                                    .map(e => `${e.title} (PIC: ${e.picName})`)
                                    .join(', ')}`
                                : `Klik untuk pilih ${cell.dateStr} (Klik 2x untuk Create Event)`
                            }
                            className={`relative h-7 rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-extrabold shadow-xs ring-2 ring-indigo-400'
                                : isToday
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-400'
                                : hasEvents
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-200 font-bold hover:bg-indigo-100'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="leading-none">{cell.day}</span>
                            {hasEvents && (
                              <div className="flex items-center space-x-0.5 mt-0.5">
                                {dayEvts.slice(0, 3).map(ev => (
                                  <span
                                    key={ev.id}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected ? 'bg-white' : CATEGORY_STYLES[ev.category]?.dot || 'bg-indigo-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly To-Do List Preview inside each Month Card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    {monthEvents.length === 0 ? (
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 italic text-center py-1">
                        Belum ada agenda bulanan
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
                        {monthEvents.slice(0, 3).map(ev => {
                          const st = CATEGORY_STYLES[ev.category];
                          const dayNum = ev.date.split('-')[2];
                          return (
                            <div
                              key={ev.id}
                              onClick={() => openEditModal(ev)}
                              className={`px-2 py-1 rounded-lg border text-[10.5px] cursor-pointer transition-all hover:brightness-95 flex items-center justify-between gap-1.5 ${st.bg} ${st.border}`}
                            >
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className={`font-extrabold ${st.text} shrink-0`}>{dayNum}:</span>
                                <span
                                  className={`font-semibold truncate ${
                                    ev.status === 'Selesai'
                                      ? 'line-through opacity-65'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {ev.title}
                                </span>
                              </div>
                              <span
                                className="px-1.5 py-0.2 rounded bg-white/80 dark:bg-slate-900/80 text-[9.5px] font-bold text-slate-600 dark:text-slate-300 shrink-0 max-w-[85px] truncate"
                                title={`PIC: ${ev.picName}`}
                              >
                                👤 {ev.picName.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                        {monthEvents.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFocusedMonth(monthIdx);
                              setViewMode('single-month');
                            }}
                            className="w-full text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-0.5 cursor-pointer"
                          >
                            + {monthEvents.length - 3} agenda lainnya...
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE MONTH DETAILED INTERACTIVE CALENDAR */}
      {viewMode === 'single-month' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFocusedMonth(prev => (prev === 0 ? 11 : prev - 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {INDONESIAN_MONTHS[focusedMonth]} {selectedYear}
              </h3>
              <button
                type="button"
                onClick={() => setFocusedMonth(prev => (prev === 11 ? 0 : prev + 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Month Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {INDONESIAN_MONTHS.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFocusedMonth(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    focusedMonth === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {SHORT_DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-xs font-extrabold py-1.5 ${
                  i === 0 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}

            {buildMonthDays(selectedYear, focusedMonth).map((cell, idx) => {
              if (!cell.day || !cell.dateStr) {
                return (
                  <div
                    key={`empty-lg-${idx}`}
                    className="min-h-28 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl"
                  />
                );
              }

              const dayEvts = eventsByDateMap[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday = todayStr === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(isSelected ? null : cell.dateStr)}
                  className={`min-h-28 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                      : isToday
                      ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        openCreateModal(cell.dateStr!);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Create Event pada tanggal ini"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1 mt-1.5">
                    {dayEvts.map(ev => {
                      const st = CATEGORY_STYLES[ev.category];
                      return (
                        <div
                          key={ev.id}
                          onClick={e => {
                            e.stopPropagation();
                            openEditModal(ev);
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] ${st.bg} ${st.border} hover:brightness-95`}
                        >
                          <p className={`font-bold truncate ${st.text}`}>{ev.title}</p>
                          <p className="text-[9.5px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                            👤 PIC: {ev.picName}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY TO-DO LIST & PIC ASSIGNMENT BOARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {selectedDateStr
                  ? `Daftar Event & To-Do List Tanggal ${selectedDateStr}`
                  : viewMode === 'single-month'
                  ? `To-Do List Bulanan: ${INDONESIAN_MONTHS[focusedMonth]} ${selectedYear}`
                  : `Daftar Event & To-Do List (${
                      scopeFilter === 'current-division'
                        ? `Direktorat ${currentDivObj?.nama_divisi || ''}`
                        : 'Seluruh Direktorat'
                    } - ${selectedYear})`}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {displayedTodoEvents.length} Agenda
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Centang langsung item checklist di bawah ini untuk memperbarui progres kerja PIC (Person-In-Charge).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedDateStr && (
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tampilkan Semua Tanggal ({selectedYear})
              </button>
            )}
            <button
              type="button"
              onClick={() => openCreateModal(selectedDateStr || undefined)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Baru</span>
            </button>
          </div>
        </div>

        {displayedTodoEvents.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum Ada Event atau To-Do List pada Periode Ini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Klik tombol &ldquo;Create Event Baru&rdquo; untuk menambahkan jadwal beserta penetapan PIC.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal(selectedDateStr || undefined)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedTodoEvents.map(evt => {
              const catStyle = CATEGORY_STYLES[evt.category];
              const doneCount = evt.subtasks.filter(s => s.completed).length;
              const totalCount = evt.subtasks.length;
              const progressPct =
                totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : evt.status === 'Selesai' ? 100 : 0;
              const evtDivInfo = divisiList.find(d => d.id === (evt.divisionId || evt.picDivisionId));

              return (
                <div
                  key={evt.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                    evt.status === 'Selesai'
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {evtDivInfo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white dark:bg-slate-700">
                            {evtDivInfo.kode}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {evt.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGE[evt.priority]}`}
                        >
                          Prioritas {evt.priority}
                        </span>
                        {(() => {
                          const dl = getDeadlineInfo(evt.date, evt.status);
                          if (dl.state === 'overdue') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{dl.label}</span>
                              </span>
                            );
                          }
                          if (dl.state === 'today') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow-2xs">
                                <BellRing className="w-3 h-3" />
                                <span>{dl.label}</span>
                              </span>
                            );
                          }
                          if (dl.state === 'approaching') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-400/60">
                                <Clock className="w-3 h-3" />
                                <span>{dl.label}</span>
                              </span>
                            );
                          }
                          return null;
                        })()}
                        <button
                          type="button"
                          onClick={() => handleToggleEventStatus(evt.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                            evt.status === 'Selesai'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : evt.status === 'Sedang Berjalan'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}
                          title="Klik untuk mengganti status pelaksanaan"
                        >
                          {evt.status === 'Selesai'
                            ? '✓ Selesai'
                            : evt.status === 'Sedang Berjalan'
                            ? '⏳ Sedang Berjalan'
                            : '○ Belum Mulai'}
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Event & Penetapan PIC"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Hapus Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4
                        className={`font-extrabold text-sm ${
                          evt.status === 'Selesai'
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {evt.title}
                      </h4>
                      {evt.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {/* Date, Time & Location Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{evt.date}</span>
                      </span>
                      {evt.time && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{evt.time}</span>
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{evt.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Person-In-Charge (PIC) Assignment Box */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {evt.picName
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              PIC (Person-In-Charge):
                            </span>
                            {evtDivInfo && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                {evtDivInfo.nama_divisi}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {evt.picName}{' '}
                            {evt.picRole && (
                              <span className="font-normal text-[11px] text-slate-500">• {evt.picRole}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {evt.coPicNames && evt.coPicNames.length > 0 && (
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block">Tim Pendamping:</span>
                          <div className="flex flex-wrap sm:justify-end gap-1 mt-0.5">
                            {evt.coPicNames.map(co => (
                              <span
                                key={co}
                                className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                              >
                                {co}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Subtasks / To-Do Checklist */}
                    {evt.subtasks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Rincian Tugas To-Do ({doneCount}/{totalCount})
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="space-y-1 pt-1">
                          {evt.subtasks.map(st => (
                            <label
                              key={st.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => handleToggleSubtask(evt.id, st.id)}
                                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span
                                  className={`truncate ${
                                    st.completed
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-200 font-medium'
                                  }`}
                                >
                                  {st.title}
                                </span>
                              </div>
                              {st.picName && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700 shrink-0 ml-2">
                                  👤 {st.picName}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT & PIC ASSIGNMENT MODAL */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={e => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
              <div
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {editingEvent
                          ? 'Edit Event Kalender & Penetapan PIC'
                          : `Create Event & To-Do Baru (${currentDivObj?.nama_divisi || 'Direktorat'})`}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Jadwalkan kegiatan bulanan, rincian checklist tugas, dan tetapkan PIC (Person-In-Charge).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                  {/* Judul, Direktorat & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Event / Kegiatan To-Do *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.title}
                        onChange={e => setFormState({ ...formState, title: e.target.value })}
                        placeholder="Contoh: Audit Kas Bulanan, Cetak Ulang Buku, Bazar..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Direktorat / Divisi
                      </label>
                      <select
                        value={formState.divisionId}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            divisionId: Number(e.target.value) as DivisionId,
                            picDivisionId: Number(e.target.value) as DivisionId
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                      >
                        {divisiList.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.nama_divisi} ({d.kode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kategori Agenda
                      </label>
                      <select
                        value={formState.category}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            category: e.target.value as CalendarTodoEvent['category']
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        <option value="Rapat & Pleno">Rapat & Pleno</option>
                        <option value="Penerbitan & Cetak">Penerbitan & Cetak</option>
                        <option value="Bazaar & Event">Bazaar & Event</option>
                        <option value="Distribusi & Logistik">Distribusi & Logistik</option>
                        <option value="Keuangan & Audit">Keuangan & Audit</option>
                        <option value="Dharma & Sosial">Dharma & Sosial</option>
                      </select>
                    </div>
                  </div>

                  {/* Tanggal, Jam, Lokasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tanggal Pelaksanaan *
                      </label>
                      <input
                        type="date"
                        required
                        value={formState.date}
                        onChange={e => setFormState({ ...formState, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Waktu / Jam
                      </label>
                      <input
                        type="text"
                        value={formState.time}
                        onChange={e => setFormState({ ...formState, time: e.target.value })}
                        placeholder="09:00 - 12:00 WIB"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Lokasi / Ruangan
                      </label>
                      <input
                        type="text"
                        value={formState.location}
                        onChange={e => setFormState({ ...formState, location: e.target.value })}
                        placeholder="Ruang Sidang / Gudang"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Penetapan PIC (Person-In-Charge) Section */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-extrabold">
                      <UserCheck className="w-4 h-4" />
                      <span>Penetapan PIC (Person-In-Charge) & Tim Pelaksana</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Pilih PIC Utama dari Daftar Staf / Anggota
                        </label>
                        <select
                          value={formState.picName}
                          onChange={e => handlePicSelectChange(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                        >
                          {picOptions.map(p => (
                            <option key={p.name} value={p.name}>
                              {p.isCurrentDiv ? '★ ' : ''}
                              {p.name} — {p.role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Atau Ketik Nama PIC Baru Secara Manual
                        </label>
                        <input
                          type="text"
                          value={customPicInput}
                          onChange={e => setCustomPicInput(e.target.value)}
                          placeholder="Ketik nama PIC bila belum ada di daftar..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Co-PIC / Tim Pendamping */}
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tambah Anggota Pendamping / Co-PIC (Opsional)
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {picOptions.slice(0, 8).map(p => {
                          const isChosen = formState.coPicNames.includes(p.name);
                          if (p.name === formState.picName) return null;
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => handleToggleCoPic(p.name)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                isChosen
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isChosen ? `✓ ${p.name}` : `+ ${p.name}`}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={coPicInput}
                          onChange={e => setCoPicInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCoPic();
                            }
                          }}
                          placeholder="Ketik nama pendamping lain lalu klik Tambah..."
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCoPic}
                          className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-semibold cursor-pointer"
                        >
                          + Tambah Pendamping
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prioritas, Status & Deskripsi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={formState.priority}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            priority: e.target.value as CalendarTodoEvent['priority']
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        <option value="Tinggi">Tinggi (Mendesak / Strategis)</option>
                        <option value="Sedang">Sedang (Rutin Operasional)</option>
                        <option value="Rendah">Rendah (Fleksibel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Status Pelaksanaan
                      </label>
                      <select
                        value={formState.status}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            status: e.target.value as CalendarTodoEvent['status']
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        <option value="Belum Mulai">Belum Mulai</option>
                        <option value="Sedang Berjalan">Sedang Berjalan</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan / Deskripsi Tugas
                    </label>
                    <textarea
                      rows={2}
                      value={formState.description}
                      onChange={e => setFormState({ ...formState, description: e.target.value })}
                      placeholder="Rincian agenda atau target yang ingin dicapai..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  {/* Rincian Checklist To-Do Items */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <label className="block font-extrabold text-slate-800 dark:text-slate-200">
                      Rincian Checklist To-Do Bulanan & Penetapan PIC per Tugas
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={e => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtaskInForm();
                          }
                        }}
                        placeholder="Ketik item tugas (contoh: Verifikasi berkas, Siapkan laporan)..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                      <select
                        value={newSubtaskPic}
                        onChange={e => setNewSubtaskPic(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                      >
                        <option value={customPicInput.trim() || formState.picName}>
                          PIC: {customPicInput.trim() || formState.picName}
                        </option>
                        {picOptions.map(p => (
                          <option key={`sub-${p.name}`} value={p.name}>
                            PIC: {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSubtaskInForm}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shrink-0 cursor-pointer"
                      >
                        + Tambah Tugas
                      </button>
                    </div>

                    {formState.subtasks.length > 0 && (
                      <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                        {formState.subtasks.map(st => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() =>
                                  setFormState(prev => ({
                                    ...prev,
                                    subtasks: prev.subtasks.map(item =>
                                      item.id === st.id ? { ...item, completed: !item.completed } : item
                                    )
                                  }))
                                }
                                className="rounded text-indigo-600"
                              />
                              <span className={st.completed ? 'line-through text-slate-400' : 'font-medium'}>
                                {st.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                👤 {st.picName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubtaskInForm(st.id)}
                                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                    >
                      {editingEvent ? 'Simpan Perubahan' : 'Simpan Event & PIC'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-4 duration-200 border border-slate-700 dark:border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
