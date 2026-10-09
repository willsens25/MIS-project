import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  LayoutGrid,
  Calendar,
  Database,
  ArrowUpRight,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Bookmark
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  getStoredCalendarEvents,
  getDeadlineInfo,
  getTaskCompletionProgress
} from '../common/DivisionCalendarTodoView';
import { DIVISION_WIDGET_DEFINITIONS } from '../dashboard-layout/DivisionWidgetGrid';

export type CommandPaletteCategory = 'all' | 'widget' | 'task' | 'content' | 'preset';

export interface CommandPaletteItem {
  id: string;
  category: Exclude<CommandPaletteCategory, 'all'>;
  categoryLabel: string;
  divisionId: DivisionId;
  divisionName: string;
  divisionCode: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
  keywords: string;
  targetSubTab: string;
  widgetId?: string;
  presetId?: string;
  filterKeyword?: string;
}

interface GlobalCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIVISION_META: Record<
  DivisionId,
  { name: string; code: string; badgeClass: string; icon: React.ReactNode }
> = {
  1: {
    name: 'Direktorat & Sekretariat',
    code: 'DIR',
    badgeClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30',
    icon: <Building2 className="w-3.5 h-3.5" />
  },
  2: {
    name: 'Bendahara & Finance',
    code: 'FIN',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    icon: <Wallet className="w-3.5 h-3.5" />
  },
  3: {
    name: 'Penerbitan & Redaksi',
    code: 'PUB',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    icon: <BookOpen className="w-3.5 h-3.5" />
  },
  4: {
    name: 'Marketing & Distribusi',
    code: 'MKT',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    icon: <ShoppingBag className="w-3.5 h-3.5" />
  },
  5: {
    name: 'Produksi & Percetakan',
    code: 'PRD',
    badgeClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30',
    icon: <Factory className="w-3.5 h-3.5" />
  },
  6: {
    name: 'Logistik & Gudang',
    code: 'LOG',
    badgeClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
    icon: <Truck className="w-3.5 h-3.5" />
  }
};

const RECENT_SEARCHES_KEY = 'mis_cmd_palette_recent_v1';

export const GlobalCommandPaletteModal: React.FC<GlobalCommandPaletteModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentUser,
    switchDivision,
    setCurrentSubTab,
    books,
    orders,
    mutasis,
    accounts,
    pengajuans,
    promos,
    bazaarEvents,
    preOrderCampaigns,
    donasiProyeks,
    royaltiPenulisList,
    identitasList,
    usersList,
    productionLogs,
    logisticLogs,
    showToast
  } = useApp();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandPaletteCategory>('all');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<'all' | DivisionId>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 40);
    } else {
      setQuery('');
      setActiveCategory('all');
      setSelectedDivisionFilter('all');
    }
  }, [isOpen]);

  const saveRecentQuery = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentQueries(prev => {
      const next = [trimmed, ...prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const fmtNum = (n?: number | null) => Number(n ?? 0).toLocaleString('id-ID');

  // Build unified index: 1) Dashboard Widgets (RGL), 2) Calendar Tasks, 3) Division-Specific Content, 4) RGL Layout Presets
  const allItems = useMemo<CommandPaletteItem[]>(() => {
    if (!isOpen) return [];
    const items: CommandPaletteItem[] = [];

    // 1. DASHBOARD WIDGETS (All 24 React Grid Layout widgets across 6 divisions)
    ([1, 2, 3, 4, 5, 6] as DivisionId[]).forEach(divId => {
      const divMeta = DIVISION_META[divId];
      const widgets = DIVISION_WIDGET_DEFINITIONS[divId] || [];
      widgets.forEach(w => {
        items.push({
          id: `cmd-widget-${w.id}`,
          category: 'widget',
          categoryLabel: 'Widget Beranda (RGL)',
          divisionId: divId,
          divisionName: divMeta.name,
          divisionCode: divMeta.code,
          title: w.title,
          subtitle: `${w.subtitle} • Ukuran Default ${w.defaultW}/12 Kolom × ${w.defaultH} Baris`,
          badge: `Widget ${divMeta.code}`,
          badgeVariant: 'indigo',
          keywords: `${w.id} ${w.title} ${w.subtitle} ${divMeta.name} ${divMeta.code} widget rgl beranda grid`,
          targetSubTab: 'overview',
          widgetId: w.id
        });
      });

      // Built-in Preset Dashboard Layouts per division
      const presets = [
        {
          id: 'morning-routine',
          name: 'Morning Routine',
          desc: 'Prioritas pagi: jadwal tugas harian di baris teratas & ikhtisar seluruh metrik aktif'
        },
        {
          id: 'deep-work',
          name: 'Deep Work',
          desc: 'Mode fokus tinggi: memperbesar 2 widget eksekusi utama & menyembunyikan sisanya'
        },
        {
          id: 'end-of-day',
          name: 'End of Day',
          desc: 'Evaluasi sore: rekapitulasi realisasi harian, penutupan kas/log, dan progres target'
        }
      ];
      presets.forEach(pr => {
        items.push({
          id: `cmd-preset-${divId}-${pr.id}`,
          category: 'preset',
          categoryLabel: 'Preset Layout RGL',
          divisionId: divId,
          divisionName: divMeta.name,
          divisionCode: divMeta.code,
          title: `Preset Layout: ${pr.name} (${divMeta.code})`,
          subtitle: pr.desc,
          badge: 'Preset RGL',
          badgeVariant: 'violet',
          keywords: `${pr.name} ${pr.desc} preset layout morning routine deep work end of day ${divMeta.name} ${divMeta.code}`,
          targetSubTab: 'overview',
          presetId: pr.id
        });
      });
    });

    // 2. CALENDAR TASKS & TO-DO LISTS (Across all 6 directorates)
    const calEvents = getStoredCalendarEvents();
    calEvents.forEach(ev => {
      const divId = (ev.divisionId || ev.picDivisionId || 1) as DivisionId;
      const divMeta = DIVISION_META[divId] || DIVISION_META[1];
      const dl = getDeadlineInfo(ev.date, ev.status);
      const prog = getTaskCompletionProgress(ev);

      items.push({
        id: `cmd-task-${ev.id}`,
        category: 'task',
        categoryLabel: 'Tugas Kalender & To-Do',
        divisionId: divId,
        divisionName: divMeta.name,
        divisionCode: divMeta.code,
        title: ev.title,
        subtitle: `PIC: ${ev.picName} • Tenggat: ${ev.date} (${dl.label}) • Progres ${prog.percent}%`,
        badge: ev.status === 'done' ? 'Selesai' : dl.label,
        badgeVariant: ev.status === 'done' ? 'emerald' : dl.isOverdue ? 'rose' : 'amber',
        keywords: `${ev.title} ${ev.description} ${ev.picName} ${ev.date} ${divMeta.name} ${divMeta.code} tugas kalender todo agenda`,
        targetSubTab: 'kalender',
        filterKeyword: ev.title
      });
    });

    // 3. DIVISION-SPECIFIC CONTENT (Modules, Books, Orders, Mutasi, SPK, Members, Bazaar, Logistics)
    const divisionModules: Array<{
      divId: DivisionId;
      subTab: string;
      title: string;
      subtitle: string;
      keywords: string;
    }> = [
      {
        divId: 1,
        subTab: 'productivity',
        title: 'Productivity Stats & Analitik Jam Aktif (Recharts)',
        subtitle: 'Visualisasi tren penyelesaian tugas, rata-rata waktu per divisi, dan jam aktif pengguna',
        keywords: 'productivity stats recharts grafik produktivitas jam aktif tren tugas direktorat'
      },
      {
        divId: 1,
        subTab: 'users',
        title: 'Manajemen Staf & Hak Akses Pengurus',
        subtitle: `Kelola ${usersList.length} akun pengguna lintas 6 direktorat yayasan`,
        keywords: 'manajemen staf user pengguna akun pengurus hrd direktorat'
      },
      {
        divId: 1,
        subTab: 'identitas',
        title: 'Database Anggota, Donatur & Sangha',
        subtitle: `Direktori ${identitasList.length} profil umat, Dharma Patriot, dan relasi yayasan`,
        keywords: 'database anggota identitas umat donatur sangha dharma patriot'
      },
      {
        divId: 2,
        subTab: 'mutasi',
        title: 'Jurnal Mutasi Kas & Arus Kas Bank',
        subtitle: `${mutasis.length} transaksi kas masuk dan keluar pada rekening yayasan`,
        keywords: 'jurnal mutasi kas arus kas bank bendahara finance pemasukan pengeluaran'
      },
      {
        divId: 2,
        subTab: 'rekonsiliasi',
        title: 'Rekonsiliasi Rekening Koran Bank (Auto-Match)',
        subtitle: 'Pencocokan mutasi bank otomatis dengan jurnal internal keuangan',
        keywords: 'rekonsiliasi bank rekening koran auto match finance bendahara'
      },
      {
        divId: 2,
        subTab: 'persetujuan',
        title: 'Otorisasi & Persetujuan Dana SPK Cetak',
        subtitle: 'Verifikasi anggaran pengajuan cetak buku dari Penerbitan',
        keywords: 'persetujuan spk cetak dana otorisasi anggaran finance'
      },
      {
        divId: 3,
        subTab: 'buku',
        title: 'Katalog Buku Dharma & Nomor ISBN',
        subtitle: `Manajemen ${books.length} judul buku, HPP cetak, dan stok gudang`,
        keywords: 'katalog buku isbn naskah penerbitan redaksi hpp'
      },
      {
        divId: 3,
        subTab: 'fashili',
        title: 'Proyek Donasi Cetak Dharma (Fashili)',
        subtitle: `${donasiProyeks.length} kampanye penghimpunan dana sponsor cetak buku`,
        keywords: 'fashili donasi sponsor proyek cetak buku dharma penerbitan'
      },
      {
        divId: 3,
        subTab: 'royalti',
        title: 'Royalti Penulis, Penerjemah & Lisensi Hak Cipta',
        subtitle: `${royaltiPenulisList.length} kontrak lisensi dan perhitungan bagi hasil buku`,
        keywords: 'royalti penulis penerjemah lisensi hak cipta penerbitan'
      },
      {
        divId: 4,
        subTab: 'pesanan',
        title: 'Faktur Penjualan & POS Kasir Pesanan',
        subtitle: `${orders.length} faktur penjualan buku dan manajemen pembayaran`,
        keywords: 'faktur penjualan invoice pesanan pos kasir marketing omset'
      },
      {
        divId: 4,
        subTab: 'bazar',
        title: 'Manajemen Event Bazar & Konsinyasi Pameran',
        subtitle: `${bazaarEvents.length} agenda bazar dan rekonsiliasi stok pameran`,
        keywords: 'bazar bazaar konsinyasi pameran event marketing'
      },
      {
        divId: 4,
        subTab: 'preorder',
        title: 'Kampanye Pre-Order (PO) & Bundling Buku',
        subtitle: `${preOrderCampaigns.length} kampanye pre-order buku terbitan baru`,
        keywords: 'pre-order po kampanye bundling paket buku marketing'
      },
      {
        divId: 4,
        subTab: 'promo',
        title: 'VLOOKUP Kupon Promo & Diskon Pelanggan',
        subtitle: `${promos.length} kode voucher diskon persentase dan nominal`,
        keywords: 'kupon promo voucher diskon vlookup marketing'
      },
      {
        divId: 5,
        subTab: 'spk',
        title: 'Antrean SPK Pabrikasi & Mandat Naik Cetak',
        subtitle: `${pengajuans.length} berkas Surat Perintah Kerja percetakan`,
        keywords: 'spk pabrikasi naik cetak antrean produksi percetakan'
      },
      {
        divId: 5,
        subTab: 'log',
        title: 'Log Realisasi Output Cetak & Quality Control',
        subtitle: `${productionLogs.length} pencatatan batch cetak selesai produksi`,
        keywords: 'log output produksi cetak quality control qc oplah'
      },
      {
        divId: 6,
        subTab: 'pengiriman',
        title: 'Antrean Packing, Surat Jalan & Resi Ekspedisi',
        subtitle: 'Penerbitan surat jalan pengiriman kargo untuk faktur lunas',
        keywords: 'pengiriman surat jalan resi ekspedisi packing logistik gudang'
      },
      {
        divId: 6,
        subTab: 'stok',
        title: 'Inventaris Stok Fisik Gudang & Stock Opname',
        subtitle: `${logisticLogs.length} log mutasi barang keluar dan audit stok buku`,
        keywords: 'stok gudang inventaris stock opname logistik buku'
      }
    ];

    divisionModules.forEach(m => {
      const divMeta = DIVISION_META[m.divId];
      items.push({
        id: `cmd-mod-${m.divId}-${m.subTab}`,
        category: 'content',
        categoryLabel: 'Modul & Konten Divisi',
        divisionId: m.divId,
        divisionName: divMeta.name,
        divisionCode: divMeta.code,
        title: m.title,
        subtitle: m.subtitle,
        badge: `Modul ${divMeta.code}`,
        badgeVariant: 'cyan',
        keywords: `${m.title} ${m.subtitle} ${m.keywords} ${divMeta.name} ${divMeta.code}`,
        targetSubTab: m.subTab
      });
    });

    // Books (Division 3 & 6)
    books.forEach(b => {
      items.push({
        id: `cmd-book-${b.id}`,
        category: 'content',
        categoryLabel: 'Katalog Buku (PUB)',
        divisionId: 3,
        divisionName: DIVISION_META[3].name,
        divisionCode: 'PUB',
        title: b.judul,
        subtitle: `Penulis: ${b.penulis} • ISBN: ${b.isbn || '-'} • Stok: ${fmtNum(b.stok_gudang)} eks • Harga: Rp ${fmtNum(b.harga_jual)}`,
        badge: b.stok_gudang < 25 ? `Stok Kritis (${b.stok_gudang})` : `${b.stok_gudang} Eks`,
        badgeVariant: b.stok_gudang < 25 ? 'rose' : 'emerald',
        keywords: `${b.judul} ${b.penulis} ${b.isbn || ''} ${b.kategori || ''} buku katalog penerbitan stok`,
        targetSubTab: 'buku',
        filterKeyword: b.judul
      });
    });

    // Orders / Invoices (Division 4)
    orders.forEach(o => {
      items.push({
        id: `cmd-order-${o.id}`,
        category: 'content',
        categoryLabel: 'Faktur Penjualan (MKT)',
        divisionId: 4,
        divisionName: DIVISION_META[4].name,
        divisionCode: 'MKT',
        title: `Invoice ${o.no_invoice} — ${o.nama_pembeli}`,
        subtitle: `Tagihan: Rp ${fmtNum(o.total_tagihan)} • Status: ${o.status} • Tanggal: ${o.tanggal}`,
        badge: o.status,
        badgeVariant: o.status === 'Lunas' ? 'emerald' : 'amber',
        keywords: `${o.no_invoice} ${o.nama_pembeli} ${o.status} invoice faktur pesanan marketing`,
        targetSubTab: 'pesanan',
        filterKeyword: o.no_invoice
      });
    });

    // SPK Pengajuan Cetak (Division 2 & 5)
    pengajuans.forEach(p => {
      const bookTitle = books.find(b => b.id === p.book_id)?.judul || `Buku #${p.book_id}`;
      items.push({
        id: `cmd-spk-${p.id}`,
        category: 'content',
        categoryLabel: 'Berkas SPK Cetak (PRD)',
        divisionId: 5,
        divisionName: DIVISION_META[5].name,
        divisionCode: 'PRD',
        title: `SPK-${String(p.id).padStart(3, '0')}: ${bookTitle}`,
        subtitle: `Oplah: ${fmtNum(p.jumlah_cetak)} eks • Estimasi Biaya: Rp ${fmtNum(p.estimasi_biaya)} • Status: ${p.status.toUpperCase()}`,
        badge: p.status.toUpperCase(),
        badgeVariant: p.status === 'approved' ? 'emerald' : p.status === 'pending' ? 'amber' : 'rose',
        keywords: `spk-${String(p.id).padStart(3, '0')} ${bookTitle} ${p.status} pengajuan cetak produksi`,
        targetSubTab: 'spk',
        filterKeyword: bookTitle
      });
    });

    // Mutasi Kas (Division 2)
    mutasis.slice(0, 25).forEach(m => {
      const accName = accounts.find(a => a.id === m.account_id)?.nama_akun || 'Rekening Kas';
      items.push({
        id: `cmd-mutasi-${m.id}`,
        category: 'content',
        categoryLabel: 'Jurnal Mutasi Kas (FIN)',
        divisionId: 2,
        divisionName: DIVISION_META[2].name,
        divisionCode: 'FIN',
        title: `${m.keterangan} (${m.tipe})`,
        subtitle: `${accName} • Kategori: ${m.nama_kategori} • Rp ${fmtNum(m.nominal)} • ${m.tanggal}`,
        badge: `${m.tipe} Rp ${fmtNum(m.nominal)}`,
        badgeVariant: m.tipe === 'Masuk' ? 'emerald' : 'rose',
        keywords: `${m.keterangan} ${m.nama_kategori} ${accName} ${m.tanggal} mutasi kas keuangan finance`,
        targetSubTab: 'mutasi',
        filterKeyword: m.keterangan
      });
    });

    // Identitas / Anggota (Division 1)
    identitasList.slice(0, 25).forEach(idn => {
      items.push({
        id: `cmd-identitas-${idn.id}`,
        category: 'content',
        categoryLabel: 'Anggota & Relasi (DIR)',
        divisionId: 1,
        divisionName: DIVISION_META[1].name,
        divisionCode: 'DIR',
        title: `${idn.nama_lengkap} (${idn.jenis_identitas})`,
        subtitle: `${idn.kota || 'Indonesia'} • ${idn.no_wa || '-'} • ${idn.catatan || 'Anggota Terdaftar'}`,
        badge: idn.jenis_identitas,
        badgeVariant: 'indigo',
        keywords: `${idn.nama_lengkap} ${idn.jenis_identitas} ${idn.kota || ''} ${idn.no_wa || ''} anggota umat donatur direktorat`,
        targetSubTab: 'identitas',
        filterKeyword: idn.nama_lengkap
      });
    });

    return items;
  }, [
    isOpen,
    books,
    orders,
    mutasis,
    accounts,
    pengajuans,
    promos.length,
    bazaarEvents.length,
    preOrderCampaigns.length,
    donasiProyeks.length,
    royaltiPenulisList.length,
    identitasList,
    usersList.length,
    productionLogs.length,
    logisticLogs.length
  ]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const matched = allItems.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (selectedDivisionFilter !== 'all' && item.divisionId !== selectedDivisionFilter) return false;

      if (tokens.length === 0) return true;
      const haystack = `${item.title} ${item.subtitle} ${item.keywords} ${item.divisionName} ${item.divisionCode}`.toLowerCase();
      return tokens.every(tok => haystack.includes(tok));
    });

    // Prioritize items belonging to the user's active division when query is empty
    if (tokens.length === 0) {
      return matched
        .sort((a, b) => {
          const aIsCurrent = a.divisionId === currentUser.divisi_id ? 0 : 1;
          const bIsCurrent = b.divisionId === currentUser.divisi_id ? 0 : 1;
          if (aIsCurrent !== bIsCurrent) return aIsCurrent - bIsCurrent;
          return 0;
        })
        .slice(0, 40);
    }

    return matched.slice(0, 50);
  }, [allItems, query, activeCategory, selectedDivisionFilter, currentUser.divisi_id]);

  // Reset selectedIndex when filter or query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory, selectedDivisionFilter]);

  const handleSelectItem = useCallback(
    (item: CommandPaletteItem) => {
      if (query.trim()) {
        saveRecentQuery(query);
      }

      // Switch division and target sub-tab
      if (currentUser.divisi_id !== item.divisionId) {
        switchDivision(item.divisionId, item.targetSubTab);
      } else {
        setCurrentSubTab(item.targetSubTab);
      }

      // If navigating to a specific Dashboard Widget or RGL Preset, dispatch custom event so DivisionWidgetGrid highlights/scrolls to it
      if (item.category === 'widget' && item.widgetId) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('mis-focus-rgl-widget', {
              detail: {
                divisionId: item.divisionId,
                widgetId: item.widgetId,
                title: item.title
              }
            })
          );
        }, 160);
      } else if (item.category === 'preset' && item.presetId) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('mis-apply-rgl-preset', {
              detail: {
                divisionId: item.divisionId,
                presetId: item.presetId
              }
            })
          );
        }, 160);
      } else if (item.filterKeyword) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('mis-global-search-navigate', {
              detail: {
                divisionId: item.divisionId,
                subTab: item.targetSubTab,
                keyword: item.filterKeyword
              }
            })
          );
        }, 140);
      }

      showToast({
        title: `🚀 Navigasi Cepat (${item.divisionCode})`,
        message: `Membuka "${item.title}" pada ${item.divisionName}.`,
        type: 'info',
        category: 'system',
        divisionName: item.divisionCode,
        duration: 3200
      });

      onClose();
    },
    [query, saveRecentQuery, currentUser.divisi_id, switchDivision, setCurrentSubTab, showToast, onClose]
  );

  // Keyboard navigation inside Command Palette (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev =>
          filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
        return;
      }
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelectItem(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelectItem, onClose]);

  // Keep active item scrolled into view
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(`[data-cmd-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const counts = useMemo(() => {
    return {
      all: allItems.length,
      widget: allItems.filter(i => i.category === 'widget').length,
      task: allItems.filter(i => i.category === 'task').length,
      content: allItems.filter(i => i.category === 'content').length,
      preset: allItems.filter(i => i.category === 'preset').length
    };
  }, [allItems]);

  const getBadgeStyle = (variant?: CommandPaletteItem['badgeVariant']) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30';
      case 'violet':
        return 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30';
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30';
      case 'indigo':
      default:
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30';
    }
  };

  const getCategoryIcon = (category: CommandPaletteItem['category']) => {
    switch (category) {
      case 'widget':
        return <LayoutGrid className="w-4 h-4 text-indigo-500" />;
      case 'task':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'preset':
        return <Bookmark className="w-4 h-4 text-violet-500" />;
      case 'content':
      default:
        return <Database className="w-4 h-4 text-emerald-500" />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-6 print:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Command Palette Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative z-10 w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 shadow-2xl overflow-hidden flex flex-col max-h-[84vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Global Search Command Palette"
        >
          {/* Top Search Input Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Search className="w-4 h-4" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ketik untuk mencari widget beranda RGL, tugas kalender, buku, faktur, SPK, atau modul divisi..."
                className="flex-1 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Bersihkan kata kunci"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-[10px] font-mono font-extrabold text-slate-600 dark:text-slate-300 border border-slate-300/70 dark:border-slate-700">
                <Command className="w-3 h-3" />
                <span>Ctrl+K</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs & Division Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'Semua', count: counts.all, icon: <Sparkles className="w-3 h-3" /> },
                    { id: 'widget', label: 'Widget Beranda', count: counts.widget, icon: <LayoutGrid className="w-3 h-3" /> },
                    { id: 'task', label: 'Tugas Kalender', count: counts.task, icon: <Calendar className="w-3 h-3" /> },
                    { id: 'content', label: 'Konten & Data Divisi', count: counts.content, icon: <FileText className="w-3 h-3" /> },
                    { id: 'preset', label: 'Preset Layout', count: counts.preset, icon: <Bookmark className="w-3 h-3" /> }
                  ] as const
                ).map(tab => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono ${
                          isActive
                            ? 'bg-indigo-800/80 text-indigo-100'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Division Scope Selector */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedDivisionFilter('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border cursor-pointer transition-colors ${
                    selectedDivisionFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  6 Divisi
                </button>
                {([1, 2, 3, 4, 5, 6] as DivisionId[]).map(dId => (
                  <button
                    key={dId}
                    type="button"
                    onClick={() =>
                      setSelectedDivisionFilter(prev => (prev === dId ? 'all' : dId))
                    }
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border cursor-pointer transition-colors ${
                      selectedDivisionFilter === dId
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                    title={DIVISION_META[dId].name}
                  >
                    {DIVISION_META[dId].code}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches Bar */}
            {recentQueries.length > 0 && !query && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>Pencarian Terakhir:</span>
                </span>
                {recentQueries.map(rq => (
                  <button
                    key={rq}
                    type="button"
                    onClick={() => setQuery(rq)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
                  >
                    {rq}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const divMeta = DIVISION_META[item.divisionId];
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-cmd-index={idx}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/95 dark:bg-indigo-950/60 ring-1 ring-indigo-400/60 dark:ring-indigo-500/50 shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                            : 'bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {getCategoryIcon(item.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9.5px] font-extrabold border ${divMeta.badgeClass}`}
                          >
                            {divMeta.icon}
                            <span>{item.divisionCode}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            {item.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9.5px] font-extrabold border ${getBadgeStyle(
                              item.badgeVariant
                            )}`}
                          >
                            {item.badge}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-center shrink-0">
                      <span
                        className={`text-[10.5px] font-bold px-2 py-1 rounded-xl flex items-center gap-1 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="hidden sm:inline">Buka</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                  Tidak ditemukan hasil untuk "{query}"
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba gunakan kata kunci lain seperti nama widget ("Likuiditas", "SPK", "Stok"), judul buku, nomor invoice, atau pilih filter "Semua".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveCategory('all');
                    setSelectedDivisionFilter('all');
                  }}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Filter Pencarian
                </button>
              </div>
            )}
          </div>

          {/* Footer Keyboard Navigation Legend */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <ArrowUp className="w-3 h-3 inline" />
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <ArrowDown className="w-3 h-3 inline" />
                </kbd>
                <span>Navigasi</span>
              </span>

              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <CornerDownLeft className="w-3 h-3 inline" /> Enter
                </kbd>
                <span>Buka Item / Sorot Widget</span>
              </span>

              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Esc
                </kbd>
                <span>Tutup</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{filteredItems.length} Hasil Siap Navigasi</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
