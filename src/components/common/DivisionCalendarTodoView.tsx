import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  AlertTriangle,
  FileDown,
  Check,
  List
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

export interface TaskCompletionProgressInfo {
  percent: number;
  doneSubtasks: number;
  totalSubtasks: number;
  barColor: string;
  trackColor: string;
  textColor: string;
  badgeClass: string;
  statusLabel: string;
}

export const getTaskCompletionProgress = (
  evt: Pick<CalendarTodoEvent, 'status' | 'subtasks'>
): TaskCompletionProgressInfo => {
  const subtasks = evt.subtasks || [];
  const totalSubtasks = subtasks.length;
  const doneSubtasks = subtasks.filter(s => s.completed).length;

  let percent = 0;
  if (evt.status === 'Selesai') {
    percent = 100;
  } else if (totalSubtasks > 0) {
    const ratio = Math.round((doneSubtasks / totalSubtasks) * 100);
    if (evt.status === 'Sedang Berjalan' && ratio === 0) {
      percent = 50;
    } else {
      percent = ratio;
    }
  } else {
    percent = evt.status === 'Sedang Berjalan' ? 50 : 0;
  }

  if (percent >= 100 || evt.status === 'Selesai') {
    return {
      percent: 100,
      doneSubtasks: totalSubtasks > 0 ? totalSubtasks : doneSubtasks,
      totalSubtasks,
      barColor: 'bg-emerald-500 dark:bg-emerald-400',
      trackColor: 'bg-emerald-100 dark:bg-emerald-950/70',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      badgeClass:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      statusLabel: 'Tuntas (100%)'
    };
  }

  if (percent >= 60) {
    return {
      percent,
      doneSubtasks,
      totalSubtasks,
      barColor: 'bg-indigo-600 dark:bg-indigo-400',
      trackColor: 'bg-indigo-100 dark:bg-indigo-950/70',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      badgeClass:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/90 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      statusLabel: `Sedang Berjalan (${percent}%)`
    };
  }

  if (percent > 0 || evt.status === 'Sedang Berjalan') {
    const activePct = percent > 0 ? percent : 50;
    return {
      percent: activePct,
      doneSubtasks,
      totalSubtasks,
      barColor: 'bg-amber-500 dark:bg-amber-400',
      trackColor: 'bg-amber-100 dark:bg-amber-950/70',
      textColor: 'text-amber-700 dark:text-amber-300',
      badgeClass:
        'bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      statusLabel: `Sedang Berjalan (${activePct}%)`
    };
  }

  return {
    percent: 0,
    doneSubtasks,
    totalSubtasks,
    barColor: 'bg-slate-400 dark:bg-slate-600',
    trackColor: 'bg-slate-200/80 dark:bg-slate-800',
    textColor: 'text-slate-600 dark:text-slate-400',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    statusLabel: 'Belum Mulai (0%)'
  };
};

export const updateStoredCalendarEventStatus = (
  evtId: string,
  explicitStatus?: CalendarTodoEvent['status']
): CalendarTodoEvent[] => {
  const current = getStoredCalendarEvents();
  const updated = current.map(evt => {
    if (evt.id !== evtId) return evt;
    const nextStatus: CalendarTodoEvent['status'] =
      explicitStatus ||
      (evt.status === 'Belum Mulai'
        ? 'Sedang Berjalan'
        : evt.status === 'Sedang Berjalan'
        ? 'Selesai'
        : 'Belum Mulai');
    const updatedSubtasks =
      nextStatus === 'Selesai'
        ? evt.subtasks.map(s => ({ ...s, completed: true }))
        : nextStatus === 'Belum Mulai'
        ? evt.subtasks.map(s => ({ ...s, completed: false }))
        : evt.subtasks;
    return { ...evt, status: nextStatus, subtasks: updatedSubtasks };
  });
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mis-calendar-events-updated'));
  } catch {
    // ignore
  }
  return updated;
};

export const toggleStoredCalendarSubtask = (
  evtId: string,
  subtaskId: string
): CalendarTodoEvent[] => {
  const current = getStoredCalendarEvents();
  const updated = current.map(evt => {
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
      : 'Belum Mulai';
    return {
      ...evt,
      subtasks: updatedSubtasks,
      status: autoStatus
    };
  });
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mis-calendar-events-updated'));
  } catch {
    // ignore
  }
  return updated;
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
  const [viewMode, setViewMode] = useState<'12-months' | 'single-month' | 'daily-planner' | 'todo-list'>('12-months');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('mis_calendar_layout_mode');
      return saved === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });
  const handleChangeLayoutMode = (nextMode: 'grid' | 'list') => {
    setLayoutMode(nextMode);
    try {
      localStorage.setItem('mis_calendar_layout_mode', nextMode);
    } catch {
      // ignore storage errors
    }
  };
  const [focusedMonth, setFocusedMonth] = useState<number>(new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [dailyHourFilter, setDailyHourFilter] = useState<'all-hours' | 'active-only'>('all-hours');

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

  useEffect(() => {
    const handleExternalSync = () => {
      const latest = getStoredCalendarEvents();
      setEvents(prev => {
        if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
        return latest;
      });
    };
    window.addEventListener('mis-calendar-events-updated', handleExternalSync);
    return () => window.removeEventListener('mis-calendar-events-updated', handleExternalSync);
  }, []);

  useEffect(() => {
    const handleJump = (e: Event) => {
      const custom = e as CustomEvent<{ divisionId: number; subTab: string; keyword: string }>;
      if (custom.detail?.subTab === 'kalender' && custom.detail?.keyword !== undefined) {
        setSearchQuery(custom.detail.keyword);
      }
    };
    window.addEventListener('mis-division-search-jump', handleJump);
    return () => window.removeEventListener('mis-division-search-jump', handleJump);
  }, []);

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

  // PDF Export States
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExportMenuOpen]);

  // Generate clean vector A4 Landscape PDF for Monthly or Annual Directorate Calendar Schedule
  const handleExportCalendarPdf = (monthTarget: number | 'all' = focusedMonth) => {
    setIsExportMenuOpen(false);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageW = doc.internal.pageSize.getWidth(); // 297
    const pageH = doc.internal.pageSize.getHeight(); // 210
    const margin = 12;

    const divName =
      scopeFilter === 'all-divisions'
        ? 'Seluruh 6 Direktorat (Terpadu)'
        : `Direktorat ${currentDivObj?.nama_divisi || 'Utama'} (${currentDivObj?.kode || 'DIR'})`;

    const periodLabel =
      monthTarget === 'all'
        ? `Tahun Kalender ${selectedYear} (12 Bulan)`
        : `Bulan ${INDONESIAN_MONTHS[monthTarget]} ${selectedYear}`;

    // Filter events according to scope, year, and target month
    const targetEvents = yearEvents
      .filter(ev => {
        if (monthTarget === 'all') return true;
        const prefix = `${selectedYear}-${String(monthTarget + 1).padStart(2, '0')}`;
        return ev.date.startsWith(prefix);
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Helper: Draw Official Page Header
    const drawOfficialHeader = (pageTitleSuffix?: string) => {
      // Top accent bar
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, 10, pageW - margin * 2, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(
        'YAYASAN PELESTARIAN & PENGEMBANGAN LAMRIM NUSANTARA (LAMRIMNESIA)',
        margin + 4,
        17
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `JADWAL KALENDER KERJA & TO-DO LIST DIREKTORAT • ${divName.toUpperCase()}`,
        margin + 4,
        23.5
      );

      // Right side period badge in header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(
        pageTitleSuffix ? `${periodLabel} — ${pageTitleSuffix}` : periodLabel,
        pageW - margin - 4,
        17.5,
        { align: 'right' }
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(226, 232, 240);
      const printedAt = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Dicetak: ${printedAt} WIB`, pageW - margin - 4, 23.5, { align: 'right' });
    };

    // Helper: Draw KPI Summary Strip
    const drawSummaryStrip = (startY: number, list: CalendarTodoEvent[]) => {
      const total = list.length;
      const done = list.filter(e => e.status === 'Selesai').length;
      const active = list.filter(e => e.status !== 'Selesai').length;
      const overdue = list.filter(e => getDeadlineInfo(e.date, e.status).state === 'overdue').length;
      const totalSub = list.reduce((acc, e) => acc + e.subtasks.length, 0);
      const doneSub = list.reduce((acc, e) => acc + e.subtasks.filter(s => s.completed).length, 0);

      const boxW = (pageW - margin * 2 - 12) / 5;
      const metrics = [
        { label: 'TOTAL AGENDA', val: `${total} Kegiatan`, bg: [241, 245, 249], text: [15, 23, 42] },
        { label: 'AKTIF / BERJALAN', val: `${active} Tugas`, bg: [254, 243, 199], text: [146, 64, 14] },
        { label: 'AGENDA SELESAI', val: `${done} Tuntas`, bg: [209, 250, 229], text: [6, 95, 70] },
        { label: 'MELEWATI DEADLINE', val: `${overdue} Terlambat`, bg: [255, 228, 230], text: [159, 18, 57] },
        { label: 'CHECKLIST SUB-TUGAS', val: `${doneSub}/${totalSub} Selesai`, bg: [237, 233, 254], text: [91, 33, 182] }
      ];

      metrics.forEach((m, i) => {
        const x = margin + i * (boxW + 3);
        doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, startY, boxW, 12, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, x + 3, startY + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(m.text[0], m.text[1], m.text[2]);
        doc.text(m.val, x + 3, startY + 9.8);
      });

      return startY + 15.5;
    };

    // Helper: Draw Visual Monthly Calendar Grid (when exporting a specific month)
    const drawMonthlyVisualGrid = (monthIdx: number, startY: number): number => {
      const firstDay = new Date(selectedYear, monthIdx, 1).getDay();
      const daysInM = new Date(selectedYear, monthIdx + 1, 0).getDate();
      const totalCells = Math.ceil((firstDay + daysInM) / 7) * 7;
      const rows = totalCells / 7;

      const gridW = pageW - margin * 2;
      const colW = gridW / 7;
      const headerH = 6.5;
      const cellH = rows > 5 ? 19.5 : 23;

      // Day headers (Minggu - Sabtu)
      const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      dayNames.forEach((dName, c) => {
        const cx = margin + c * colW;
        doc.setFillColor(c === 0 ? 225 : 241, c === 0 ? 29 : 245, c === 0 ? 72 : 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(cx, startY, colW, headerH, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        if (c === 0) {
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setTextColor(51, 65, 85);
        }
        doc.text(dName, cx + colW / 2, startY + 4.5, { align: 'center' });
      });

      let curY = startY + headerH;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < 7; c++) {
          const cellIndex = r * 7 + c;
          const dayNum = cellIndex - firstDay + 1;
          const cx = margin + c * colW;

          if (dayNum < 1 || dayNum > daysInM) {
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.rect(cx, curY, colW, cellH, 'FD');
          } else {
            const dateStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const dayEvts = targetEvents.filter(e => e.date === dateStr);

            if (dayEvts.length > 0) {
              doc.setFillColor(238, 242, 255); // soft indigo tint for active event date
            } else {
              doc.setFillColor(255, 255, 255);
            }
            doc.setDrawColor(203, 213, 225);
            doc.rect(cx, curY, colW, cellH, 'FD');

            // Date number
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            if (c === 0) {
              doc.setTextColor(225, 29, 72);
            } else {
              doc.setTextColor(30, 41, 59);
            }
            doc.text(String(dayNum), cx + 2, curY + 4.2);

            // Event count badge
            if (dayEvts.length > 0) {
              doc.setFontSize(6.2);
              doc.setTextColor(79, 70, 229);
              doc.text(`${dayEvts.length} agenda`, cx + colW - 2, curY + 4.2, { align: 'right' });
            }

            // Up to 2 event pills inside the cell
            dayEvts.slice(0, 2).forEach((ev, idx) => {
              const pillY = curY + 6 + idx * 6.2;
              if (ev.status === 'Selesai') {
                doc.setFillColor(209, 250, 229);
                doc.setTextColor(6, 95, 70);
              } else if (getDeadlineInfo(ev.date, ev.status).state === 'overdue') {
                doc.setFillColor(254, 205, 211);
                doc.setTextColor(159, 18, 57);
              } else {
                doc.setFillColor(224, 231, 255);
                doc.setTextColor(55, 48, 163);
              }
              doc.roundedRect(cx + 1.2, pillY, colW - 2.4, 5.4, 1, 1, 'F');

              doc.setFont('helvetica', 'bold');
              doc.setFontSize(5.8);
              const shortTitle =
                ev.title.length > 22 ? `${ev.title.substring(0, 21)}...` : ev.title;
              doc.text(shortTitle, cx + 2, pillY + 2.5);

              doc.setFont('helvetica', 'normal');
              doc.setFontSize(5.2);
              doc.text(`PIC: ${ev.picName}`, cx + 2, pillY + 4.7);
            });

            if (dayEvts.length > 2) {
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(5.5);
              doc.setTextColor(100, 116, 139);
              doc.text(`+${dayEvts.length - 2} lainnya`, cx + 2, curY + cellH - 1.2);
            }
          }
        }
        curY += cellH;
      }

      return curY + 4;
    };

    // Helper: Draw Detailed Schedule & To-Do List Table
    const drawScheduleTable = (startY: number, list: CalendarTodoEvent[]) => {
      let y = startY;
      const tableW = pageW - margin * 2;
      // Columns: No (8), Tanggal & Waktu (32), Agenda & Lokasi (72), Kategori & Divisi (36), PIC & Tim (42), Checklist Sub-Tugas (55), Status & Deadline (28) = 273mm
      const cols = [
        { header: 'NO', w: 8 },
        { header: 'TANGGAL & WAKTU', w: 32 },
        { header: 'AGENDA KEGIATAN & LOKASI', w: 70 },
        { header: 'KATEGORI & PRIORITAS', w: 36 },
        { header: 'PENANGGUNG JAWAB (PIC)', w: 42 },
        { header: 'CHECKLIST TO-DO LIST', w: 57 },
        { header: 'STATUS & TENGGAT', w: 28 }
      ];

      const drawTableHeader = (topY: number) => {
        let curX = margin;
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, topY, tableW, 7.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(255, 255, 255);

        cols.forEach(col => {
          doc.text(col.header, curX + 2, topY + 5);
          curX += col.w;
        });
        return topY + 7.5;
      };

      y = drawTableHeader(y);

      if (list.length === 0) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, tableW, 14, 'FD');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          'Tidak ada jadwal kegiatan atau To-Do List terdaftar pada periode ini.',
          pageW / 2,
          y + 8.5,
          { align: 'center' }
        );
        return y + 18;
      }

      list.forEach((ev, idx) => {
        const dl = getDeadlineInfo(ev.date, ev.status);
        const evtDivObj = divisiList.find(d => d.id === (ev.divisionId || ev.picDivisionId || 1));

        // Prepare wrapped lines for dynamic row height
        doc.setFontSize(7);
        const titleLines = doc.splitTextToSize(ev.title, cols[2].w - 4) as string[];
        const locText = ev.location ? `Lokasi: ${ev.location}` : '';
        const subtaskLines: string[] =
          ev.subtasks.length > 0
            ? ev.subtasks.map(
                s => `${s.completed ? '[v]' : '[ ]'} ${s.title}${s.picName ? ` (${s.picName.split(' ')[0]})` : ''}`
              )
            : ['- Belum ada sub-tugas'];

        const wrappedSubtasks = doc.splitTextToSize(subtaskLines.join('\n'), cols[5].w - 4) as string[];
        const maxLines = Math.max(titleLines.length + (locText ? 1 : 0), wrappedSubtasks.length, 2);
        const rowH = Math.max(12, maxLines * 3.6 + 4.5);

        // Page break if needed
        if (y + rowH > pageH - 22) {
          doc.addPage('a4', 'landscape');
          drawOfficialHeader('Lanjutan Rincian Jadwal & To-Do List');
          y = drawTableHeader(32);
        }

        // Row background
        if (idx % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(248, 250, 252);
        }
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, tableW, rowH, 'FD');

        // Column vertical dividers
        let cx = margin;
        cols.forEach(c => {
          doc.line(cx, y, cx, y + rowH);
          cx += c.w;
        });
        doc.line(margin + tableW, y, margin + tableW, y + rowH);

        let colX = margin;

        // 1. NO
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(String(idx + 1), colX + 2.5, y + 5.5);
        colX += cols[0].w;

        // 2. TANGGAL & WAKTU
        const [yr, mo, dy] = ev.date.split('-').map(Number);
        const formattedDate = `${dy} ${INDONESIAN_MONTHS[(mo || 1) - 1]?.slice(0, 3)} ${yr}`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(formattedDate, colX + 2, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(ev.time || '09:00 WIB', colX + 2, y + 9);
        colX += cols[1].w;

        // 3. AGENDA & LOKASI
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(titleLines, colX + 2, y + 4.8);
        if (locText) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.3);
          doc.setTextColor(100, 116, 139);
          doc.text(
            doc.splitTextToSize(locText, cols[2].w - 4)[0],
            colX + 2,
            y + 4.8 + titleLines.length * 3.5
          );
        }
        colX += cols[2].w;

        // 4. KATEGORI & PRIORITAS
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(67, 56, 202);
        doc.text(ev.category, colX + 2, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.3);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Divisi: ${evtDivObj?.kode || 'DIR'} • Prio: ${ev.priority}`,
          colX + 2,
          y + 9
        );
        colX += cols[3].w;

        // 5. PIC & CO-PIC
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(15, 23, 42);
        doc.text(ev.picName, colX + 2, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(100, 116, 139);
        const coPicLabel =
          ev.coPicNames && ev.coPicNames.length > 0
            ? `Tim: ${ev.coPicNames.join(', ')}`
            : ev.picRole || 'PIC Utama';
        doc.text(
          doc.splitTextToSize(coPicLabel, cols[4].w - 4).slice(0, 2),
          colX + 2,
          y + 8.8
        );
        colX += cols[4].w;

        // 6. CHECKLIST TO-DO LIST
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.3);
        doc.setTextColor(51, 65, 85);
        doc.text(wrappedSubtasks, colX + 2, y + 4.6);
        colX += cols[5].w;

        // 7. STATUS & DEADLINE
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        if (ev.status === 'Selesai') {
          doc.setTextColor(4, 120, 87);
        } else if (dl.state === 'overdue') {
          doc.setTextColor(190, 18, 60);
        } else {
          doc.setTextColor(180, 83, 9);
        }
        doc.text(ev.status.toUpperCase(), colX + 2, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(100, 116, 139);
        doc.text(dl.label, colX + 2, y + 9);

        y += rowH;
      });

      return y + 6;
    };

    // Page 1: Header + KPI Summary
    drawOfficialHeader();
    let currentY = drawSummaryStrip(31, targetEvents);

    if (monthTarget !== 'all') {
      // Draw visual calendar grid for the selected month on Page 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `MATRIKS KALENDER BULANAN — ${INDONESIAN_MONTHS[monthTarget].toUpperCase()} ${selectedYear}`,
        margin,
        currentY + 3.5
      );
      currentY = drawMonthlyVisualGrid(monthTarget, currentY + 5.5);

      // Add Page 2 for Detailed To-Do List & Schedule Table + Signatures
      doc.addPage('a4', 'landscape');
      drawOfficialHeader('Rincian Tugas, PIC & Checklist To-Do List');
      currentY = 33;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `TABEL RINCIAN JADWAL & TO-DO LIST (${INDONESIAN_MONTHS[monthTarget].toUpperCase()} ${selectedYear})`,
        margin,
        currentY
      );
      currentY = drawScheduleTable(currentY + 2.5, targetEvents);
    } else {
      // Full 12-Month Schedule Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `DAFTAR LENGKAP JADWAL KERJA & TO-DO LIST TAHUN ${selectedYear}`,
        margin,
        currentY + 3.5
      );
      currentY = drawScheduleTable(currentY + 5.5, targetEvents);
    }

    // Signature Block at the bottom of the final page
    if (currentY > pageH - 36) {
      doc.addPage('a4', 'landscape');
      drawOfficialHeader('Lembar Pengesahan Jadwal Kerja Direktorat');
      currentY = 38;
    }

    const sigY = Math.max(currentY + 4, pageH - 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    doc.text('Disiapkan Oleh,', margin + 20, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Koordinator ${currentDivObj?.nama_divisi || 'Direktorat'}`,
      margin + 20,
      sigY + 18,
      { align: 'center' }
    );
    doc.line(margin + 2, sigY + 14, margin + 38, sigY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text('Mengetahui & Menyetujui,', pageW - margin - 28, sigY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Direktur Utama Yayasan Lamrimnesia', pageW - margin - 28, sigY + 18, {
      align: 'center'
    });
    doc.line(pageW - margin - 50, sigY + 14, pageW - margin - 6, sigY + 14);

    // Add page numbers on all pages
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `SAPA-ALL MIS Lamrimnesia • Dokumen Resmi Kalender & To-Do List Direktorat • Halaman ${p} dari ${pageCount}`,
        pageW / 2,
        pageH - 5,
        { align: 'center' }
      );
    }

    const safeDivCode = (currentDivObj?.kode || 'DIR').toLowerCase();
    const safePeriod =
      monthTarget === 'all'
        ? `tahunan_${selectedYear}`
        : `${INDONESIAN_MONTHS[monthTarget].toLowerCase()}_${selectedYear}`;
    const filename = `jadwal_kalender_${safeDivCode}_${safePeriod}.pdf`;

    doc.save(filename);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);

    recordActivity(
      'Ekspor Kalender PDF',
      `Kalender ${currentDivObj?.nama_divisi || 'Direktorat'}`,
      `Mengunduh dokumen PDF jadwal kalender (${periodLabel}) -> ${filename}`
    );

    showToast({
      title: '📄 Kalender PDF Berhasil Diunduh!',
      message: `Jadwal ${periodLabel} (${divName}) telah diunduh sebagai "${filename}".`,
      type: 'success',
      category: 'system',
      duration: 5000
    });
  };

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

  const openCreateModal = (defaultDate?: string, defaultTime?: string) => {
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
      time: defaultTime || '09:00 - 11:30 WIB',
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

  const handleToggleEventStatus = (evtId: string, explicitStatus?: CalendarTodoEvent['status']) => {
    setEvents(prev =>
      prev.map(evt => {
        if (evt.id !== evtId) return evt;
        const nextStatus: CalendarTodoEvent['status'] =
          explicitStatus ||
          (evt.status === 'Belum Mulai'
            ? 'Sedang Berjalan'
            : evt.status === 'Sedang Berjalan'
            ? 'Selesai'
            : 'Belum Mulai');
        const updatedSubtasks =
          nextStatus === 'Selesai'
            ? evt.subtasks.map(s => ({ ...s, completed: true }))
            : nextStatus === 'Belum Mulai'
            ? evt.subtasks.map(s => ({ ...s, completed: false }))
            : evt.subtasks;
        return { ...evt, status: nextStatus, subtasks: updatedSubtasks };
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
          : 'Belum Mulai';
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

  // Summary statistics including overall average task completion percentage
  const stats = useMemo(() => {
    const total = yearEvents.length;
    const completed = yearEvents.filter(e => e.status === 'Selesai').length;
    const inProgress = yearEvents.filter(e => e.status === 'Sedang Berjalan').length;
    const pending = yearEvents.filter(e => e.status === 'Belum Mulai').length;
    const totalSubtasks = yearEvents.reduce((acc, e) => acc + e.subtasks.length, 0);
    const doneSubtasks = yearEvents.reduce((acc, e) => acc + e.subtasks.filter(s => s.completed).length, 0);
    const avgProgressPct =
      total > 0
        ? Math.round(
            yearEvents.reduce((acc, e) => acc + getTaskCompletionProgress(e).percent, 0) / total
          )
        : 0;
    const subtaskPct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
    return {
      total,
      completed,
      inProgress,
      pending,
      totalSubtasks,
      doneSubtasks,
      avgProgressPct,
      subtaskPct
    };
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

  // Active date for Daily Planner (defaults to selectedDateStr, or todayStr if in selectedYear, or first date with events)
  const activeDailyDateStr = useMemo(() => {
    if (selectedDateStr) return selectedDateStr;
    if (todayStr.startsWith(String(selectedYear))) return todayStr;
    if (yearEvents.length > 0) return yearEvents[0].date;
    return `${selectedYear}-01-01`;
  }, [selectedDateStr, todayStr, selectedYear, yearEvents]);

  const openDailyPlannerForDate = (dateStr?: string) => {
    const target = dateStr || activeDailyDateStr;
    setSelectedDateStr(target);
    const [yr, mo] = target.split('-').map(Number);
    if (yr && yr !== selectedYear) setSelectedYear(yr);
    if (mo && mo - 1 !== focusedMonth) setFocusedMonth(mo - 1);
    setViewMode('daily-planner');
  };

  const shiftDailyDate = (offsetDays: number) => {
    const [y, m, d] = activeDailyDateStr.split('-').map(Number);
    const dt = new Date(y || selectedYear, (m || 1) - 1, (d || 1) + offsetDays);
    const nextStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate()
    ).padStart(2, '0')}`;
    setSelectedDateStr(nextStr);
    if (dt.getFullYear() !== selectedYear) setSelectedYear(dt.getFullYear());
    if (dt.getMonth() !== focusedMonth) setFocusedMonth(dt.getMonth());
  };

  const formatIndonesianFullDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y || selectedYear, (m || 1) - 1, d || 1);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${days[dt.getDay()]}, ${d} ${INDONESIAN_MONTHS[(m || 1) - 1]} ${y}`;
  };

  // Parse start and end hour from event.time string (e.g. "09:00 - 12:00 WIB")
  const parseEventHourRange = (timeStr?: string) => {
    if (!timeStr) {
      return { startHour: 9, endHour: 11, durationHours: 2, label: '09:00 - 11:00 WIB' };
    }
    const matches = Array.from(timeStr.matchAll(/(\d{1,2})[:.](\d{2})/g));
    if (matches.length >= 2) {
      const sh = Math.min(23, Math.max(0, parseInt(matches[0][1], 10)));
      const ehRaw = Math.min(23, Math.max(0, parseInt(matches[1][1], 10)));
      const emRaw = parseInt(matches[1][2], 10);
      // If end time has minutes (e.g. 11:30), include hour 11; if 12:00, last occupied hour slot is 11 unless sh === ehRaw
      const lastOccupiedHour =
        ehRaw > sh ? (emRaw > 0 ? ehRaw : Math.max(sh, ehRaw - 1)) : sh;
      const durationHours = Math.max(1, ehRaw - sh + (emRaw >= 30 ? 0.5 : 0));
      return { startHour: sh, endHour: lastOccupiedHour, durationHours, label: timeStr };
    }
    if (matches.length === 1) {
      const sh = Math.min(23, Math.max(0, parseInt(matches[0][1], 10)));
      return { startHour: sh, endHour: sh + 1, durationHours: 1, label: timeStr };
    }
    return { startHour: 9, endHour: 10, durationHours: 2, label: timeStr };
  };

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
                onClick={() => openDailyPlannerForDate(selectedDateStr || undefined)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'daily-planner'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Buka Daily Planner (Tampilan Harian Jam per Jam)"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Harian (Daily Planner)</span>
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

            {/* Grid vs List Layout Toggle (Visual Grid vs Compact List) */}
            <div
              className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              title="Pilih tampilan Visual (Grid) atau tampilan Ringkas (List)"
            >
              <button
                type="button"
                onClick={() => handleChangeLayoutMode('grid')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilan Grid (Visual & Kartu Lengkap)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleChangeLayoutMode('list')}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tampilan List (Ringkas & Padat)"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
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

            {/* Ekspor Kalender PDF Split Button + Month Selector Dropdown */}
            <div ref={exportMenuRef} className="relative flex items-center">
              <button
                type="button"
                onClick={() =>
                  handleExportCalendarPdf(viewMode === 'single-month' ? focusedMonth : focusedMonth)
                }
                className={`flex items-center space-x-1.5 pl-3 pr-2.5 py-2 rounded-l-xl text-xs font-bold border-y border-l transition-all cursor-pointer shadow-2xs ${
                  exportSuccess
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                }`}
                title={`Unduh jadwal kalender bulanan (${INDONESIAN_MONTHS[focusedMonth]} ${selectedYear}) dalam format PDF resmi`}
              >
                {exportSuccess ? (
                  <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>{exportSuccess ? 'PDF Terunduh!' : 'Ekspor Kalender'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                className={`px-2 py-2 rounded-r-xl text-xs font-bold border transition-all cursor-pointer ${
                  exportSuccess
                    ? 'bg-emerald-700 text-white border-emerald-600'
                    : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-600'
                }`}
                title="Pilih bulan spesifik atau ekspor jadwal 12 bulan penuh (PDF)"
                aria-label="Pilih periode ekspor kalender PDF"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 space-y-2">
                  <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                      Ekspor Jadwal Kalender (PDF)
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Format A4 Landscape resmi dengan matriks kalender, PIC & checklist.
                    </p>
                  </div>

                  {/* Quick Current/Focused Month Export */}
                  <button
                    type="button"
                    onClick={() => handleExportCalendarPdf(focusedMonth)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Bulan {INDONESIAN_MONTHS[focusedMonth]} {selectedYear}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200/70 dark:bg-rose-800 text-rose-900 dark:text-rose-100 font-mono">
                      PDF
                    </span>
                  </button>

                  {/* 12 Months Grid Selector for Monthly PDF */}
                  <div className="px-1 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Pilih Jadwal Bulanan ({selectedYear}):
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {INDONESIAN_MONTHS.map((mName, mIdx) => (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => {
                            setFocusedMonth(mIdx);
                            handleExportCalendarPdf(mIdx);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer text-center ${
                            focusedMonth === mIdx
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {mName.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full Year 12-Month Export */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleExportCalendarPdf('all')}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Rekap Tahunan (12 Bulan)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{selectedYear}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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

        {/* Overall Completion Progress Bar Banner */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                Rata-rata Progres Penyelesaian Tugas ({selectedYear}):
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${
                  stats.avgProgressPct >= 100
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                    : stats.avgProgressPct >= 50
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                }`}
              >
                {stats.avgProgressPct}% Tercapai
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Selesai: {stats.completed} ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Berjalan: {stats.inProgress}
              </span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Belum Mulai: {stats.pending}
              </span>
              <span className="text-violet-600 dark:text-violet-400">
                • Sub-Tugas: {stats.subtaskPct}% ({stats.doneSubtasks}/{stats.totalSubtasks})
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.avgProgressPct >= 100
                  ? 'bg-emerald-500'
                  : stats.avgProgressPct >= 60
                  ? 'bg-indigo-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${stats.avgProgressPct}%` }}
            />
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
                Visualisasi Kalender 12 Bulan ({selectedYear}) — Mode {layoutMode === 'grid' ? 'Grid Visual' : 'List Ringkas'}
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

          {layoutMode === 'list' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden">
              {INDONESIAN_MONTHS.map((monthName, monthIdx) => {
                const monthPrefix = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
                const monthEvents = yearEvents.filter(e => e.date.startsWith(monthPrefix));
                const monthAvgPct =
                  monthEvents.length > 0
                    ? Math.round(
                        monthEvents.reduce((acc, e) => acc + getTaskCompletionProgress(e).percent, 0) /
                          monthEvents.length
                      )
                    : 0;

                return (
                  <div
                    key={monthName}
                    className="p-3.5 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    {/* Left: Month Title & Aggregate Progress */}
                    <div className="flex items-center justify-between lg:justify-start gap-3 lg:w-64 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMonth(monthIdx);
                          setViewMode('single-month');
                        }}
                        className="flex items-center gap-2.5 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                          {String(monthIdx + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {monthName} {selectedYear}
                          </p>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                            {monthEvents.length} agenda terjadwal
                          </p>
                        </div>
                      </button>

                      {monthEvents.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                monthAvgPct >= 100
                                  ? 'bg-emerald-500'
                                  : monthAvgPct >= 50
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${monthAvgPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                            {monthAvgPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Compact Horizontal List of Tasks */}
                    <div className="flex-1 min-w-0">
                      {monthEvents.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">Belum ada jadwal pada bulan ini</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {monthEvents.map(ev => {
                            const st = CATEGORY_STYLES[ev.category];
                            const prog = getTaskCompletionProgress(ev);
                            const dayNum = ev.date.split('-')[2];
                            return (
                              <div
                                key={ev.id}
                                onClick={() => openEditModal(ev)}
                                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[11px] cursor-pointer transition-all hover:brightness-95 max-w-full ${st.bg} ${st.border}`}
                              >
                                <span className={`font-mono font-extrabold ${st.text} shrink-0`}>
                                  Tgl {dayNum}
                                </span>
                                <span
                                  className={`font-bold truncate max-w-[180px] sm:max-w-[240px] ${
                                    ev.status === 'Selesai'
                                      ? 'line-through opacity-60'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {ev.title}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
                                  • PIC: {ev.picName.split(' ')[0]}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9.5px] font-extrabold border shrink-0 ${prog.badgeClass}`}
                                >
                                  {prog.percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Month Actions */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setFocusedMonth(monthIdx);
                          setViewMode('single-month');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold cursor-pointer"
                      >
                        Detail Bulan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportCalendarPdf(monthIdx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Unduh PDF ${monthName}`}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openCreateModal(`${monthPrefix}-01`)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Create Event di bulan ${monthName}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
                          onClick={() => handleExportCalendarPdf(monthIdx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={`Ekspor jadwal bulan ${monthName} ${selectedYear} ke PDF`}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
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

                      {/* Monthly To-Do List Preview inside each Month Card with Instant Task Progress Bars */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                    {monthEvents.length === 0 ? (
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500 italic text-center py-1">
                        Belum ada agenda bulanan
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-0.5">
                        {/* Monthly Aggregate Progress Bar */}
                        {(() => {
                          const monthAvgPct = Math.round(
                            monthEvents.reduce((acc, e) => acc + getTaskCompletionProgress(e).percent, 0) /
                              monthEvents.length
                          );
                          return (
                            <div className="px-1 pb-1">
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="font-bold text-slate-500 dark:text-slate-400">
                                  Progres Bulan {monthName}
                                </span>
                                <span
                                  className={`font-extrabold ${
                                    monthAvgPct >= 100
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : monthAvgPct >= 50
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  {monthAvgPct}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    monthAvgPct >= 100
                                      ? 'bg-emerald-500'
                                      : monthAvgPct >= 50
                                      ? 'bg-indigo-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${monthAvgPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {monthEvents.slice(0, 3).map(ev => {
                          const st = CATEGORY_STYLES[ev.category];
                          const dayNum = ev.date.split('-')[2];
                          const prog = getTaskCompletionProgress(ev);
                          return (
                            <div
                              key={ev.id}
                              onClick={() => openEditModal(ev)}
                              className={`px-2 py-1.5 rounded-lg border text-[10.5px] cursor-pointer transition-all hover:brightness-95 space-y-1 ${st.bg} ${st.border}`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
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
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border shrink-0 ${prog.badgeClass}`}
                                  title={`Progres: ${prog.statusLabel}`}
                                >
                                  {prog.percent}%
                                </span>
                              </div>
                              {/* Per-task instant progress bar in 12-month card */}
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1.5 bg-white/80 dark:bg-slate-900/70 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                                    style={{ width: `${prog.percent}%` }}
                                  />
                                </div>
                                <span
                                  className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 shrink-0 max-w-[75px] truncate"
                                  title={`PIC: ${ev.picName}`}
                                >
                                  👤 {ev.picName.split(' ')[0]}
                                </span>
                              </div>
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
          )}
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
              <button
                type="button"
                onClick={() => handleExportCalendarPdf(focusedMonth)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 text-xs font-bold transition-colors cursor-pointer"
                title={`Ekspor jadwal bulan ${INDONESIAN_MONTHS[focusedMonth]} ${selectedYear} ke PDF`}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh PDF {INDONESIAN_MONTHS[focusedMonth]}</span>
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

          {layoutMode === 'list' ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {(() => {
                const monthDays = buildMonthDays(selectedYear, focusedMonth).filter(
                  c => c.day !== null && c.dateStr !== null
                );
                return monthDays.map(cell => {
                  const dateStr = cell.dateStr!;
                  const dayEvts = eventsByDateMap[dateStr] || [];
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = todayStr === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
                      className={`p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                          : isToday
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : dayEvts.length > 0
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          : 'bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:w-56 shrink-0">
                        <span
                          className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 ${
                            isToday
                              ? 'bg-amber-500 text-white'
                              : isSelected
                              ? 'bg-indigo-600 text-white'
                              : dayEvts.length > 0
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cell.day}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatIndonesianFullDate(dateStr)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {dayEvts.length > 0 ? `${dayEvts.length} tugas terjadwal` : 'Tidak ada tugas'}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {dayEvts.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">Slot tanggal kosong</span>
                        ) : (
                          <div className="space-y-1.5">
                            {dayEvts.map(ev => {
                              const st = CATEGORY_STYLES[ev.category];
                              const prog = getTaskCompletionProgress(ev);
                              return (
                                <div
                                  key={ev.id}
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(ev);
                                  }}
                                  className={`p-2 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${st.bg} ${st.border} hover:brightness-95`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {ev.time && (
                                      <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                        {ev.time}
                                      </span>
                                    )}
                                    <span
                                      className={`font-extrabold truncate ${
                                        ev.status === 'Selesai'
                                          ? 'line-through text-slate-400'
                                          : st.text
                                      }`}
                                    >
                                      {ev.title}
                                    </span>
                                    <span className="text-[10.5px] text-slate-600 dark:text-slate-300 shrink-0">
                                      • PIC: <strong>{ev.picName}</strong>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-20 h-1.5 bg-white/80 dark:bg-slate-900/70 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                                        style={{ width: `${prog.percent}%` }}
                                      />
                                    </div>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${prog.badgeClass}`}
                                    >
                                      {prog.percent}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            openDailyPlannerForDate(dateStr);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 text-slate-600 hover:text-indigo-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Buka Daily Planner tanggal ini"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Jam</span>
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            openCreateModal(dateStr);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                          title="Tambah Event pada tanggal ini"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
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
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          openDailyPlannerForDate(cell.dateStr!);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Buka Daily Planner (Jam per Jam) tanggal ini"
                      >
                        <Clock className="w-3 h-3" />
                      </button>
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
                  </div>

                  <div className="space-y-1.5 mt-1.5">
                    {dayEvts.map(ev => {
                      const st = CATEGORY_STYLES[ev.category];
                      const prog = getTaskCompletionProgress(ev);
                      return (
                        <div
                          key={ev.id}
                          onClick={e => {
                            e.stopPropagation();
                            openEditModal(ev);
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] space-y-1 ${st.bg} ${st.border} hover:brightness-95`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className={`font-bold truncate ${st.text}`}>{ev.title}</p>
                            <span className={`text-[9px] font-extrabold shrink-0 ${prog.textColor}`}>
                              {prog.percent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/80 dark:bg-slate-900/70 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                          <p className="text-[9.5px] text-slate-600 dark:text-slate-300 truncate">
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
          )}
        </div>
      )}

      {/* VIEW 3: DAILY PLANNER (VIEW HARIAN - DETAIL JAM PER JAM) */}
      {viewMode === 'daily-planner' &&
        (() => {
          const dayEvents = (eventsByDateMap[activeDailyDateStr] || []).slice().sort((a, b) => {
            const ha = parseEventHourRange(a.time).startHour;
            const hb = parseEventHourRange(b.time).startHour;
            return ha - hb;
          });

          const totalDayTasks = dayEvents.length;
          const doneDayTasks = dayEvents.filter(e => e.status === 'Selesai').length;
          const totalScheduledHours = dayEvents.reduce(
            (acc, e) => acc + parseEventHourRange(e.time).durationHours,
            0
          );
          const avgDayProgress =
            totalDayTasks > 0
              ? Math.round(
                  dayEvents.reduce((acc, e) => acc + getTaskCompletionProgress(e).percent, 0) /
                    totalDayTasks
                )
              : 0;
          const totalDaySubtasks = dayEvents.reduce((acc, e) => acc + e.subtasks.length, 0);
          const doneDaySubtasks = dayEvents.reduce(
            (acc, e) => acc + e.subtasks.filter(s => s.completed).length,
            0
          );

          // Dates in this year that have events, for quick 1-click jumping
          const activeDatesList = Object.keys(eventsByDateMap).sort();

          // Standard Daily Planner hours (06:00 to 21:00 WIB), plus any earlier/later hour if an event exists there
          const baseHours = Array.from({ length: 16 }, (_, i) => i + 6); // 6..21
          const currentHourNow = new Date().getHours();
          const isSelectedToday = activeDailyDateStr === todayStr;

          const getPeriodLabel = (hr: number) => {
            if (hr < 11) return { text: 'Pagi', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' };
            if (hr < 15) return { text: 'Siang', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
            if (hr < 18) return { text: 'Sore', cls: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' };
            return { text: 'Malam', cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' };
          };

          const hoursToRender = baseHours.filter(hr => {
            if (dailyHourFilter === 'all-hours') return true;
            return dayEvents.some(ev => {
              const r = parseEventHourRange(ev.time);
              return hr >= r.startHour && hr <= r.endHour;
            });
          });

          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
              {/* Top Daily Planner Navigation Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        Daily Planner: {formatIndonesianFullDate(activeDailyDateStr)}
                      </h3>
                      {isSelectedToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                          HARI INI
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {totalDayTasks} Tugas Terjadwal
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Jadwal operasional jam per jam (06:00 – 21:00 WIB) beserta PIC dan persentase progres tugas.
                    </p>
                  </div>
                </div>

                {/* Day Controls: Prev Day, Date Input, Next Day, Today, Hour Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => shiftDailyDate(-1)}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Hari Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="date"
                      value={activeDailyDateStr}
                      onChange={e => {
                        if (e.target.value) openDailyPlannerForDate(e.target.value);
                      }}
                      aria-label="Pilih Tanggal Daily Planner"
                      className="px-2.5 py-1 bg-transparent text-xs font-extrabold text-indigo-700 dark:text-indigo-300 focus:outline-none cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => shiftDailyDate(1)}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Hari Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDailyPlannerForDate(todayStr)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hari Ini
                  </button>

                  {/* Filter All Hours vs Active Hours */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setDailyHourFilter('all-hours')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        dailyHourFilter === 'all-hours'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Semua Jam (06:00–21:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDailyHourFilter('active-only')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        dailyHourFilter === 'active-only'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Hanya Jam Terisi
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateModal(activeDailyDateStr, '09:00 - 11:00 WIB')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Jadwal Jam</span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Strip: Dates with Active Tasks in Selected Year */}
              {activeDatesList.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    Tanggal Berisi Agenda ({activeDatesList.length}):
                  </span>
                  {activeDatesList.map(dStr => {
                    const evtsOnDate = eventsByDateMap[dStr] || [];
                    const avgPct =
                      evtsOnDate.length > 0
                        ? Math.round(
                            evtsOnDate.reduce(
                              (acc, e) => acc + getTaskCompletionProgress(e).percent,
                              0
                            ) / evtsOnDate.length
                          )
                        : 0;
                    const isCurrent = dStr === activeDailyDateStr;
                    const [, mo, dy] = dStr.split('-').map(Number);

                    return (
                      <button
                        key={dStr}
                        type="button"
                        onClick={() => openDailyPlannerForDate(dStr)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>
                          {dy} {INDONESIAN_MONTHS[(mo || 1) - 1]?.slice(0, 3)}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {evtsOnDate.length} tugas • {avgPct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Daily Summary KPI Cards & Daily Progress Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Total Tugas Hari Ini
                  </p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {totalDayTasks} Agenda ({doneDayTasks} Selesai)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50">
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    Alokasi Jam Produktif
                  </p>
                  <p className="text-base font-extrabold text-indigo-900 dark:text-indigo-200 mt-0.5">
                    {totalScheduledHours} Jam Terjadwal
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/50">
                  <p className="text-[11px] text-violet-700 dark:text-violet-300 font-medium">
                    Sub-Tugas Harian
                  </p>
                  <p className="text-base font-extrabold text-violet-900 dark:text-violet-200 mt-0.5">
                    {doneDaySubtasks}/{totalDaySubtasks} Checklist
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      Progres Harian
                    </span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-200">
                      {avgDayProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200/70 dark:bg-emerald-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${avgDayProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hour-by-Hour Timeline Schedule Grid */}
              {hoursToRender.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2.5">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Belum Ada Tugas Terjadwal pada Tanggal {activeDailyDateStr}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tampilkan semua jam kerja atau klik tombol di bawah untuk membuat jadwal baru pada tanggal ini.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDailyHourFilter('all-hours')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Tampilkan Semua Jam (06:00–21:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateModal(activeDailyDateStr, '09:00 - 11:00 WIB')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      + Buat Tugas di Tanggal Ini
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {hoursToRender.map(hour => {
                    const hourLabel = `${String(hour).padStart(2, '0')}:00`;
                    const nextHourLabel = `${String(hour + 1).padStart(2, '0')}:00`;
                    const defaultSlotTime = `${hourLabel} - ${nextHourLabel} WIB`;
                    const period = getPeriodLabel(hour);
                    const isCurrentHour = isSelectedToday && currentHourNow === hour;

                    // Tasks starting in this hour vs continuing through this hour
                    const startingEvents = dayEvents.filter(
                      ev => parseEventHourRange(ev.time).startHour === hour
                    );
                    const continuingEvents = dayEvents.filter(ev => {
                      const r = parseEventHourRange(ev.time);
                      return hour > r.startHour && hour <= r.endHour;
                    });
                    const hasActivity = startingEvents.length > 0 || continuingEvents.length > 0;

                    return (
                      <div
                        key={hour}
                        className={`grid grid-cols-1 md:grid-cols-12 transition-colors ${
                          isCurrentHour
                            ? 'bg-amber-50/50 dark:bg-amber-950/20'
                            : hasActivity
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/10'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Left Hour Column */}
                        <div className="md:col-span-2 p-3 sm:p-3.5 border-b md:border-b-0 md:border-r border-slate-200/70 dark:border-slate-800 flex md:flex-col items-center md:items-start justify-between gap-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                                {hourLabel} WIB
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${period.cls}`}>
                                {period.text}
                              </span>
                            </div>
                            {isCurrentHour && (
                              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-extrabold animate-pulse">
                                ● JAM SEKARANG
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => openCreateModal(activeDailyDateStr, defaultSlotTime)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            title={`Jadwalkan tugas baru pada jam ${defaultSlotTime}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Tugas {hourLabel}</span>
                          </button>
                        </div>

                        {/* Right Hour Tasks Content Column */}
                        <div className="md:col-span-10 p-3 sm:p-3.5 space-y-2.5">
                          {/* Tasks starting at this hour */}
                          {startingEvents.map(ev => {
                            const catStyle = CATEGORY_STYLES[ev.category];
                            const prog = getTaskCompletionProgress(ev);
                            const range = parseEventHourRange(ev.time);
                            const dl = getDeadlineInfo(ev.date, ev.status);
                            const evtDivInfo = divisiList.find(
                              d => d.id === (ev.divisionId || ev.picDivisionId)
                            );

                            return (
                              <div
                                key={ev.id}
                                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${catStyle.bg} ${catStyle.border} shadow-2xs`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-800 font-mono text-[10.5px] font-extrabold">
                                      ⏰ {ev.time || defaultSlotTime} ({range.durationHours} jam)
                                    </span>
                                    {evtDivInfo && (
                                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold">
                                        {evtDivInfo.kode}
                                      </span>
                                    )}
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                                    >
                                      {ev.category}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${PRIORITY_BADGE[ev.priority]}`}
                                    >
                                      Prioritas {ev.priority}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                      {dl.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(ev)}
                                      className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                      title="Edit Tugas"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(ev)}
                                      className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Hapus Tugas"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h4
                                      className={`text-sm font-extrabold ${
                                        ev.status === 'Selesai'
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-900 dark:text-white'
                                      }`}
                                    >
                                      {ev.title}
                                    </h4>
                                    {ev.description && (
                                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                        {ev.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                                    <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                                      👤 PIC: {ev.picName}
                                    </span>
                                    {ev.location && (
                                      <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-indigo-500" />
                                        <span>{ev.location}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Instant Progress Bar & Status Controls inside Hourly Planner */}
                                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                    <span className="font-bold text-slate-700 dark:text-slate-200">
                                      Progres Tugas Jam Ini ({prog.statusLabel})
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {(
                                        [
                                          { label: '0% Belum', val: 'Belum Mulai' as const },
                                          { label: '50% Berjalan', val: 'Sedang Berjalan' as const },
                                          { label: '100% Selesai', val: 'Selesai' as const }
                                        ]
                                      ).map(opt => (
                                        <button
                                          key={opt.val}
                                          type="button"
                                          onClick={() => handleToggleEventStatus(ev.id, opt.val)}
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                            ev.status === opt.val
                                              ? opt.val === 'Selesai'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : opt.val === 'Sedang Berjalan'
                                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                                : 'bg-slate-700 text-white border-slate-700'
                                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                                      style={{ width: `${prog.percent}%` }}
                                    />
                                  </div>

                                  {ev.subtasks.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                      {ev.subtasks.map(st => (
                                        <label
                                          key={st.id}
                                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/50 cursor-pointer text-[11px]"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <input
                                              type="checkbox"
                                              checked={st.completed}
                                              onChange={() => handleToggleSubtask(ev.id, st.id)}
                                              className="rounded text-indigo-600 cursor-pointer"
                                            />
                                            <span
                                              className={`truncate ${
                                                st.completed
                                                  ? 'line-through text-slate-400'
                                                  : 'font-medium text-slate-800 dark:text-slate-200'
                                              }`}
                                            >
                                              {st.title}
                                            </span>
                                          </div>
                                          <span className="text-[9.5px] font-bold text-slate-400 ml-1.5 shrink-0">
                                            {st.completed ? '100%' : '0%'}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Multi-hour continuation blocks */}
                          {continuingEvents.map(ev => {
                            const catStyle = CATEGORY_STYLES[ev.category];
                            const prog = getTaskCompletionProgress(ev);
                            return (
                              <div
                                key={`cont-${ev.id}-${hour}`}
                                onClick={() => openEditModal(ev)}
                                className={`px-3 py-2 rounded-xl border border-dashed ${catStyle.bg} ${catStyle.border} flex flex-wrap items-center justify-between gap-2 text-xs cursor-pointer hover:brightness-95 transition-all`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`font-extrabold ${catStyle.text}`}>
                                    ↳ Sedang Berlangsung ({ev.time}):
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {ev.title}
                                  </span>
                                  <span className="text-[11px] text-slate-500">• PIC: {ev.picName}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="w-20 h-1.5 bg-white/80 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${prog.barColor}`}
                                      style={{ width: `${prog.percent}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-extrabold ${prog.textColor}`}>
                                    {prog.percent}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Empty Hour Slot */}
                          {!hasActivity && (
                            <div
                              onClick={() => openCreateModal(activeDailyDateStr, defaultSlotTime)}
                              className="py-1.5 px-2.5 rounded-xl border border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-between cursor-pointer transition-all"
                            >
                              <span>Slot waktu luang ({defaultSlotTime})</span>
                              <span className="font-semibold">+ Klik untuk menjadwalkan tugas</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

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

          <div className="flex flex-wrap items-center gap-2">
            {/* Inline Grid vs List Toggle on To-Do List Board */}
            <div
              className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              title="Ubah tampilan daftar To-Do antara Grid (Visual) atau List (Ringkas)"
            >
              <button
                type="button"
                onClick={() => handleChangeLayoutMode('grid')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleChangeLayoutMode('list')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {selectedDateStr && (
              <>
                <button
                  type="button"
                  onClick={() => openDailyPlannerForDate(selectedDateStr)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Buka Daily Planner ({selectedDateStr})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateStr(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tampilkan Semua Tanggal ({selectedYear})
                </button>
              </>
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
        ) : layoutMode === 'list' ? (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {displayedTodoEvents.map(evt => {
              const catStyle = CATEGORY_STYLES[evt.category];
              const prog = getTaskCompletionProgress(evt);
              const doneCount = prog.doneSubtasks;
              const totalCount = prog.totalSubtasks;
              const progressPct = prog.percent;
              const evtDivInfo = divisiList.find(d => d.id === (evt.divisionId || evt.picDivisionId));
              const dl = getDeadlineInfo(evt.date, evt.status);

              return (
                <div
                  key={evt.id}
                  className={`p-3.5 sm:px-4 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-3 ${
                    evt.status === 'Selesai'
                      ? 'bg-slate-50/70 dark:bg-slate-900/40'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Date, Badges, Title & PIC */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleEventStatus(evt.id)}
                      className={`mt-0.5 sm:mt-0 w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 cursor-pointer transition-colors ${
                        evt.status === 'Selesai'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : evt.status === 'Sedang Berjalan'
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                      title={`Status: ${evt.status} (Klik untuk ubah)`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {evtDivInfo && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-extrabold bg-slate-900 text-white dark:bg-slate-700">
                            {evtDivInfo.kode}
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {evt.date}
                        </span>
                        {evt.time && (
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                            • {evt.time}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9.5px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {evt.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold border ${PRIORITY_BADGE[evt.priority]}`}
                        >
                          {evt.priority}
                        </span>
                        {dl.state === 'overdue' && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold bg-rose-600 text-white">
                            {dl.label}
                          </span>
                        )}
                        {dl.state === 'today' && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold bg-amber-500 text-slate-950">
                            {dl.label}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h4
                          className={`font-extrabold text-xs sm:text-sm truncate ${
                            evt.status === 'Selesai'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          👤 PIC: <strong className="text-slate-700 dark:text-slate-200">{evt.picName}</strong>
                        </span>
                        {totalCount > 0 && (
                          <span className="text-[10.5px] font-semibold text-violet-600 dark:text-violet-400">
                            • Checklist: {doneCount}/{totalCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Compact Progress Bar, Quick Status Pills & Actions */}
                  <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                    {/* Instant Progress Bar */}
                    <div className="flex items-center gap-2 min-w-[150px]">
                      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${prog.badgeClass}`}
                      >
                        {progressPct}%
                      </span>
                    </div>

                    {/* Quick Status Selector */}
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { label: '0%', val: 'Belum Mulai' as const },
                          { label: '50%', val: 'Sedang Berjalan' as const },
                          { label: '100%', val: 'Selesai' as const }
                        ]
                      ).map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => handleToggleEventStatus(evt.id, opt.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            evt.status === opt.val
                              ? opt.val === 'Selesai'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : opt.val === 'Sedang Berjalan'
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openDailyPlannerForDate(evt.date)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800 cursor-pointer"
                        title="Lihat di Daily Planner (Jam per Jam)"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(evt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit Tugas"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedTodoEvents.map(evt => {
              const catStyle = CATEGORY_STYLES[evt.category];
              const prog = getTaskCompletionProgress(evt);
              const doneCount = prog.doneSubtasks;
              const totalCount = prog.totalSubtasks;
              const progressPct = prog.percent;
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
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-3">
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
                      <button
                        type="button"
                        onClick={() => openDailyPlannerForDate(evt.date)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 text-[10px] font-bold transition-colors cursor-pointer"
                        title="Lihat detail jam per jam di Daily Planner untuk tanggal ini"
                      >
                        <Clock className="w-3 h-3" />
                        <span>View Harian (Jam)</span>
                      </button>
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

                    {/* Always-Visible Instant Task Progress Bar & Interactive Status Controls */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-700 dark:text-slate-200">
                            Progres Penyelesaian Tugas
                          </span>
                          {totalCount > 0 && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              ({doneCount}/{totalCount} sub-tugas selesai)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${prog.badgeClass}`}
                          >
                            {progressPct}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-200/90 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Quick Completion Status Selector Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Status: <strong className={prog.textColor}>{prog.statusLabel}</strong>
                        </span>
                        <div className="flex items-center gap-1">
                          {(
                            [
                              { label: '0% Belum', val: 'Belum Mulai' as const },
                              { label: '50% Berjalan', val: 'Sedang Berjalan' as const },
                              { label: '100% Selesai', val: 'Selesai' as const }
                            ]
                          ).map(opt => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => handleToggleEventStatus(evt.id, opt.val)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                evt.status === opt.val
                                  ? opt.val === 'Selesai'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : opt.val === 'Sedang Berjalan'
                                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                                    : 'bg-slate-700 text-white border-slate-700'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Subtasks / To-Do Checklist */}
                      {evt.subtasks.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                          {evt.subtasks.map(st => (
                            <label
                              key={st.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors text-xs"
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
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span
                                  className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded ${
                                    st.completed
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {st.completed ? '100%' : '0%'}
                                </span>
                                {st.picName && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700">
                                    👤 {st.picName}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
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
