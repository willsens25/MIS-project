import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Keyboard,
  X,
  Search,
  Tv,
  EyeOff,
  Zap,
  Calendar,
  PanelLeft,
  Sun,
  Moon,
  Bot,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  Play,
  Sparkles,
  CheckCircle2,
  Command
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';

export interface GlobalHotkeyItem {
  id: string;
  keys: string[];
  altKeys?: string[];
  title: string;
  description: string;
  category: 'rapat-privasi' | 'navigasi-divisi' | 'pencarian-aksi' | 'kalender-tema';
  categoryLabel: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  onTrigger?: () => void;
}

interface GlobalHotkeyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleLeftSidebar?: () => void;
  onOpenAI?: () => void;
  onOpenCommandPalette?: () => void;
}

export const GlobalHotkeyMapModal: React.FC<GlobalHotkeyMapModalProps> = ({
  isOpen,
  onClose,
  onToggleLeftSidebar,
  onOpenAI,
  onOpenCommandPalette
}) => {
  const {
    currentUser,
    switchDivision,
    setCurrentSubTab,
    isPrivacyMode,
    togglePrivacyMode,
    openPresentationMode,
    theme,
    toggleTheme,
    toggleNightShift,
    isNightShiftActive,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'rapat-privasi' | 'navigasi-divisi' | 'pencarian-aksi' | 'kalender-tema'
  >('all');
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
      setLastTriggeredId(null);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const executeShortcutAction = (item: GlobalHotkeyItem) => {
    if (!item.onTrigger) return;
    setLastTriggeredId(item.id);
    item.onTrigger();
    showToast({
      title: `⌨️ Pintasan Dijalankan (${item.keys.join(' + ')})`,
      message: `${item.title} berhasil diaktifkan.`,
      type: 'info',
      category: 'system',
      duration: 3000
    });
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const hotkeyItems = useMemo<GlobalHotkeyItem[]>(() => {
    const focusDivisionSearch = () => {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Ketik kata kunci"], input[placeholder*="Cari"]'
      );
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const triggerQuickActionsMenu = () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', altKey: true }));
    };

    const jumpToDivision = (divId: DivisionId) => {
      switchDivision(divId);
    };

    return [
      // 1. RAPAT PLENO, PRIVASI & PRESENTASI
      {
        id: 'hotkey-privacy-mode',
        keys: ['Alt', 'P'],
        title: 'Toggle Mode Sensor Privasi (Privacy Shield)',
        description:
          'Menyamarkan saldo kas, nominal rupiah, dan nomor kontak pribadi dengan efek blur saat laptop terhubung ke proyektor.',
        category: 'rapat-privasi',
        categoryLabel: 'Rapat Pleno & Privasi',
        badge: isPrivacyMode ? 'Aktif' : 'Siaga',
        badgeColor: isPrivacyMode
          ? 'bg-amber-500 text-slate-950 border-amber-400'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        icon: <EyeOff className="w-4 h-4 text-amber-500" />,
        onTrigger: () => togglePrivacyMode()
      },
      {
        id: 'hotkey-presentation-mode',
        keys: ['Alt', 'Shift', 'P'],
        title: 'Buka Mode Presentasi Rapat Pleno (Projector View)',
        description:
          'Menampilkan slide eksekutif layar penuh berisi konsolidasi kas, progres penerbitan, dan risalah keputusan dewan.',
        category: 'rapat-privasi',
        categoryLabel: 'Rapat Pleno & Privasi',
        badge: 'Layar Penuh',
        badgeColor:
          'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: <Tv className="w-4 h-4 text-indigo-500" />,
        onTrigger: () => openPresentationMode()
      },

      // 2. PENCARIAN CEPAT & AKSI GLOBAL
      {
        id: 'hotkey-quick-search',
        keys: ['Ctrl', 'K'],
        altKeys: ['⌘', 'K'],
        title: 'Buka Global Search Command Palette (Widget, Kalender & Divisi)',
        description:
          'Membuka Command Palette untuk mencari & melompat cepat ke widget beranda RGL, tugas kalender, katalog buku, faktur, SPK, atau modul divisi.',
        category: 'pencarian-aksi',
        categoryLabel: 'Pencarian & Aksi Cepat',
        badge: 'Command Palette',
        badgeColor:
          'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <Search className="w-4 h-4 text-emerald-500" />,
        onTrigger: () => {
          if (onOpenCommandPalette) {
            onOpenCommandPalette();
          } else {
            focusDivisionSearch();
          }
        }
      },
      {
        id: 'hotkey-quick-actions',
        keys: ['Alt', 'Q'],
        title: 'Buka Menu Aksi Cepat (Quick Actions Launcher)',
        description:
          'Membuka panel komando cepat untuk membuat dokumen pengajuan, scan barcode ISBN, kasir POS bazar, dan cek persetujuan.',
        category: 'pencarian-aksi',
        categoryLabel: 'Pencarian & Aksi Cepat',
        badge: 'Launcher',
        badgeColor:
          'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <Zap className="w-4 h-4 text-amber-500" />,
        onTrigger: triggerQuickActionsMenu
      },
      {
        id: 'hotkey-ai-assistant',
        keys: ['Alt', 'A'],
        title: 'Buka Asisten AI SAPA-ALL MIS',
        description:
          'Membuka asisten pintar untuk menganalisis data keuangan, stok gudang, atau membuat draf pesan koordinasi divisi.',
        category: 'pencarian-aksi',
        categoryLabel: 'Pencarian & Aksi Cepat',
        badge: 'AI MIS',
        badgeColor:
          'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        icon: <Bot className="w-4 h-4 text-teal-500" />,
        onTrigger: () => {
          if (onOpenAI) onOpenAI();
        }
      },
      {
        id: 'hotkey-open-map',
        keys: ['?'],
        altKeys: ['Alt', 'H'],
        title: 'Buka Peta Pintasan Keyboard (Global Hotkey Map)',
        description:
          'Menampilkan jendela referensi seluruh pintasan keyboard yang tersedia di aplikasi kapan saja.',
        category: 'pencarian-aksi',
        categoryLabel: 'Pencarian & Aksi Cepat',
        icon: <Keyboard className="w-4 h-4 text-indigo-500" />
      },

      // 3. KALENDER, SIDEBAR & TEMA TAMPILAN
      {
        id: 'hotkey-open-calendar',
        keys: ['Alt', 'C'],
        title: 'Buka Kalender Kerja 12 Bulan, Daily Planner & To-Do List',
        description:
          'Melompat langsung ke modul Kalender & To-Do List pada direktorat yang sedang aktif.',
        category: 'kalender-tema',
        categoryLabel: 'Kalender, Sidebar & Tema',
        badge: '12 Bulan & Harian',
        badgeColor:
          'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: <Calendar className="w-4 h-4 text-indigo-500" />,
        onTrigger: () => setCurrentSubTab('kalender')
      },
      {
        id: 'hotkey-toggle-sidebar',
        keys: ['Alt', 'B'],
        title: 'Collapse / Expand Menu Sidebar Kiri',
        description:
          'Mengecilkan atau memperluas sidebar kategori kiri dengan animasi transisi pegas bertingkat (staggered transition).',
        category: 'kalender-tema',
        categoryLabel: 'Kalender, Sidebar & Tema',
        icon: <PanelLeft className="w-4 h-4 text-violet-500" />,
        onTrigger: () => {
          if (onToggleLeftSidebar) onToggleLeftSidebar();
        }
      },
      {
        id: 'hotkey-toggle-theme',
        keys: ['Alt', 'T'],
        title: `Ganti Mode Tema (${theme === 'dark' ? 'Gelap → Terang' : 'Terang → Gelap'})`,
        description:
          'Beralih secara instan antara tampilan Light Mode (Siang) dan Dark Mode (Malam).',
        category: 'kalender-tema',
        categoryLabel: 'Kalender, Sidebar & Tema',
        badge: theme === 'dark' ? 'Mode Gelap' : 'Mode Terang',
        badgeColor:
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon:
          theme === 'dark' ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          ),
        onTrigger: () => toggleTheme()
      },
      {
        id: 'hotkey-night-shift',
        keys: ['Alt', 'N'],
        title: 'Toggle Filter Pelindung Mata Lembur (Night Shift)',
        description:
          'Mengaktifkan atau mematikan lapisan hangat pelindung mata saat bekerja lembur di malam hari.',
        category: 'kalender-tema',
        categoryLabel: 'Kalender, Sidebar & Tema',
        badge: isNightShiftActive ? 'Aktif' : 'Nonaktif',
        badgeColor: isNightShiftActive
          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        onTrigger: () => toggleNightShift()
      },

      // 4. NAVIGASI CEPAT 6 DIREKTORAT
      {
        id: 'hotkey-div-1',
        keys: ['Alt', '1'],
        title: 'Buka Divisi 1: Direktorat & Sekretariat (DIR)',
        description:
          'Pindah cepat ke Executive Dashboard, Database Master Anggota Umat, dan Manajemen Tim.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 1 ? 'Sedang Aktif' : 'DIR',
        badgeColor:
          currentUser.divisi_id === 1
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <Building2 className="w-4 h-4 text-indigo-500" />,
        onTrigger: () => jumpToDivision(1)
      },
      {
        id: 'hotkey-div-2',
        keys: ['Alt', '2'],
        title: 'Buka Divisi 2: Keuangan & Bendahara (KEU)',
        description:
          'Pindah cepat ke Jurnal Mutasi Kas, Persetujuan Cetak SPK, Rekonsiliasi Bank, dan Laporan PSAK.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 2 ? 'Sedang Aktif' : 'KEU',
        badgeColor:
          currentUser.divisi_id === 2
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <Wallet className="w-4 h-4 text-emerald-500" />,
        onTrigger: () => jumpToDivision(2)
      },
      {
        id: 'hotkey-div-3',
        keys: ['Alt', '3'],
        title: 'Buka Divisi 3: Penerbitan & Redaksi (PNB)',
        description:
          'Pindah cepat ke Katalog Buku & ISBN, Royalti Penulis, Pengajuan Cetak, dan Proyek Fashili.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 3 ? 'Sedang Aktif' : 'PNB',
        badgeColor:
          currentUser.divisi_id === 3
            ? 'bg-violet-600 text-white border-violet-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <BookOpen className="w-4 h-4 text-violet-500" />,
        onTrigger: () => jumpToDivision(3)
      },
      {
        id: 'hotkey-div-4',
        keys: ['Alt', '4'],
        title: 'Buka Divisi 4: Marketing & Distribusi (MKT)',
        description:
          'Pindah cepat ke Invoice Penjualan, Kasir POS Event Bazaar, Kampanye Pre-Order, dan Jaringan Agen.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 4 ? 'Sedang Aktif' : 'MKT',
        badgeColor:
          currentUser.divisi_id === 4
            ? 'bg-amber-500 text-slate-950 border-amber-500'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
        onTrigger: () => jumpToDivision(4)
      },
      {
        id: 'hotkey-div-5',
        keys: ['Alt', '5'],
        title: 'Buka Divisi 5: Produksi & Percetakan (PRD)',
        description:
          'Pindah cepat ke Antrean SPK Pabrikasi, Pemantauan Tahap Cetak, dan Laporan Quality Control.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 5 ? 'Sedang Aktif' : 'PRD',
        badgeColor:
          currentUser.divisi_id === 5
            ? 'bg-rose-600 text-white border-rose-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <Factory className="w-4 h-4 text-rose-500" />,
        onTrigger: () => jumpToDivision(5)
      },
      {
        id: 'hotkey-div-6',
        keys: ['Alt', '6'],
        title: 'Buka Divisi 6: Logistik & Gudang (LOG)',
        description:
          'Pindah cepat ke Stok Gudang Riil, Antrean Packing, Surat Jalan Ekspedisi, dan Riwayat Keluar-Masuk.',
        category: 'navigasi-divisi',
        categoryLabel: 'Navigasi 6 Direktorat',
        badge: currentUser.divisi_id === 6 ? 'Sedang Aktif' : 'LOG',
        badgeColor:
          currentUser.divisi_id === 6
            ? 'bg-cyan-600 text-white border-cyan-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <Truck className="w-4 h-4 text-cyan-500" />,
        onTrigger: () => jumpToDivision(6)
      }
    ];
  }, [
    currentUser.divisi_id,
    isPrivacyMode,
    theme,
    isNightShiftActive,
    togglePrivacyMode,
    openPresentationMode,
    setCurrentSubTab,
    onToggleLeftSidebar,
    onOpenAI,
    toggleTheme,
    toggleNightShift,
    switchDivision
  ]);

  const filteredHotkeys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return hotkeyItems.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = `${item.title} ${item.description} ${item.keys.join(' ')} ${
        item.altKeys?.join(' ') || ''
      } ${item.categoryLabel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [hotkeyItems, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Global Hotkey Map & Pintasan Keyboard
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {hotkeyItems.length} Shortcut Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tingkatkan kecepatan kerja Anda dengan kombinasi tombol cepat atau klik tombol{' '}
                  <strong>Jalankan</strong> pada pintasan mana pun di bawah ini.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Highlighted Featured Shortcuts Banner (Alt+P & Alt+Shift+P) */}
          <div className="px-4 sm:px-5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Mode Sensor Privasi
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9.5px] font-extrabold ${
                        isPrivacyMode
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isPrivacyMode ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    Samarkan nominal rupiah & kontak saat proyektor menyala
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => executeShortcutAction(hotkeyItems[0])}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-800 border border-amber-300 dark:border-amber-700 text-xs font-extrabold text-amber-900 dark:text-amber-300 shadow-2xs shrink-0 cursor-pointer"
              >
                <kbd className="font-mono">Alt + P</kbd>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    Mode Presentasi Rapat Pleno
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    Layar penuh slide metrik 6 divisi & pengesahan dewan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => executeShortcutAction(hotkeyItems[1])}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 shadow-2xs shrink-0 cursor-pointer"
              >
                <kbd className="font-mono">Alt + Shift + P</kbd>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pintasan atau fungsi (contoh: Alt+P, Privasi, Presentasi, Kalender, Keuangan)..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'rapat-privasi', label: 'Rapat & Privasi' },
                  { id: 'pencarian-aksi', label: 'Pencarian & Aksi' },
                  { id: 'kalender-tema', label: 'Kalender & Tema' },
                  { id: 'navigasi-divisi', label: '6 Direktorat' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcut Cards Grid */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {filteredHotkeys.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Keyboard className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Pintasan tidak ditemukan untuk &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Tampilkan Semua Pintasan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredHotkeys.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                              {item.categoryLabel}
                            </span>
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                              item.badgeColor || ''
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Keycap Combination + Direct Trigger Button */}
                    <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.keys.map((k, idx) => (
                          <React.Fragment key={`${item.id}-k-${idx}`}>
                            <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border-b-2 border border-slate-300 dark:border-slate-600 text-[11px] font-mono font-extrabold text-slate-800 dark:text-slate-100 shadow-2xs">
                              {k}
                            </kbd>
                            {idx < item.keys.length - 1 && (
                              <span className="text-[10px] font-bold text-slate-400">+</span>
                            )}
                          </React.Fragment>
                        ))}

                        {item.altKeys && (
                          <>
                            <span className="text-[10px] text-slate-400 mx-1">atau</span>
                            {item.altKeys.map((ak, idx) => (
                              <React.Fragment key={`${item.id}-ak-${idx}`}>
                                <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                                  {ak}
                                </kbd>
                                {idx < item.altKeys!.length - 1 && (
                                  <span className="text-[10px] text-slate-400">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        )}
                      </div>

                      {item.onTrigger && (
                        <button
                          type="button"
                          onClick={() => executeShortcutAction(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/80 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-300 dark:hover:text-white border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                          title={`Jalankan langsung aksi "${item.title}"`}
                        >
                          {lastTriggeredId === item.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aktif!</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Jalankan</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Tip */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Tip: Tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200">?</kbd> atau{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200">Alt + H</kbd> kapan saja di luar kolom input untuk membuka peta pintasan ini.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Selesai (Esc)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
