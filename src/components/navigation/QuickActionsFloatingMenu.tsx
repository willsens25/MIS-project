import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Plus,
  Clock,
  FileText,
  Printer,
  ShoppingBag,
  Wallet,
  BookOpen,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
  Building2,
  Factory,
  Truck,
  Sparkles,
  Bot,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  CornerDownLeft,
  AlertTriangle,
  ScanBarcode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import { NewDocumentModal, DocumentType } from '../modals/NewDocumentModal';
import { PendingApprovalsModal } from '../modals/PendingApprovalsModal';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';

interface QuickActionsFloatingMenuProps {
  onOpenAI?: () => void;
  onOpenDivisionReport?: (divisiId?: DivisionId) => void;
  onOpenAnnualReport?: () => void;
}

export const QuickActionsFloatingMenu: React.FC<QuickActionsFloatingMenuProps> = ({
  onOpenAI,
  onOpenDivisionReport,
  onOpenAnnualReport,
}) => {
  const {
    currentUser,
    switchDivision,
    pengajuans,
    orders,
    books,
    accounts,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocInitialType, setNewDocInitialType] = useState<DocumentType>('pengajuan');
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const pendingPengajuansCount = pengajuans.filter((p) => p.status === 'pending').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const totalPendingApprovals = pendingPengajuansCount + pendingOrdersCount;

  // Keyboard shortcut: Alt+Q to toggle Quick Actions menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'q' || e.key === 'Q')) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenNewDoc = (type: DocumentType = 'pengajuan') => {
    setNewDocInitialType(type);
    setIsNewDocModalOpen(true);
    setIsOpen(false);
  };

  const handleOpenApprovals = () => {
    setIsApprovalsModalOpen(true);
    setIsOpen(false);
  };

  // Quick Action Definitions
  interface ActionItem {
    id: string;
    title: string;
    description: string;
    category: 'priority' | 'document' | 'report' | 'navigation';
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    action: () => void;
    keywords: string[];
  }

  const allActions: ActionItem[] = [
    // Priority Actions
    {
      id: 'check-approvals',
      title: 'Periksa Persetujuan Tertunda',
      description: `${totalPendingApprovals} pengajuan anggaran & faktur menunggu verifikasi`,
      category: 'priority',
      icon: Clock,
      badge: totalPendingApprovals > 0 ? `${totalPendingApprovals} Menunggu` : 'Bersih',
      badgeColor: totalPendingApprovals > 0 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      action: handleOpenApprovals,
      keywords: ['approval', 'persetujuan', 'pending', 'anggaran', 'spk', 'acc', 'verifikasi'],
    },
    {
      id: 'scan-barcode-isbn',
      title: 'Scan Barcode & Input Stok ISBN',
      description: 'Pindai barcode kamera / ketik manual ISBN buku, dan masukkan stok fisik',
      category: 'priority',
      icon: ScanBarcode,
      badge: 'Scan',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      action: () => {
        setIsBarcodeModalOpen(true);
        setIsOpen(false);
      },
      keywords: ['barcode', 'scan', 'scanner', 'isbn', 'stok', 'kamera', 'buku', 'fisik', 'opname'],
    },
    {
      id: 'add-document-master',
      title: 'Tambah Dokumen & Transaksi Baru',
      description: 'Buat formulir dokumen pengajuan, faktur, mutasi, atau buku baru',
      category: 'priority',
      icon: Plus,
      badge: 'Cepat',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      action: () => handleOpenNewDoc('pengajuan'),
      keywords: ['tambah', 'dokumen', 'buat', 'formulir', 'transaksi', 'baru', 'document'],
    },

    // Specific Document Creators
    {
      id: 'doc-pengajuan-cetak',
      title: 'Dokumen Pengajuan Cetak & Anggaran',
      description: 'Ajukan permohonan dana oplah cetak buku ke divisi keuangan',
      category: 'document',
      icon: Printer,
      action: () => handleOpenNewDoc('pengajuan'),
      keywords: ['pengajuan', 'cetak', 'buku', 'anggaran', 'oplah', 'biaya', 'penerbitan'],
    },
    {
      id: 'doc-faktur-pesanan',
      title: 'Dokumen Faktur / Pesanan Penjualan',
      description: 'Terbitkan faktur pesanan buku untuk pelanggan/toko',
      category: 'document',
      icon: ShoppingBag,
      action: () => handleOpenNewDoc('order'),
      keywords: ['faktur', 'pesanan', 'invoice', 'order', 'jual', 'penjualan', 'marketing', 'beli'],
    },
    {
      id: 'doc-mutasi-kas',
      title: 'Dokumen Voucher Mutasi Kas / Bank',
      description: 'Catat kas masuk (penerimaan) atau kas keluar (pengeluaran)',
      category: 'document',
      icon: Wallet,
      action: () => handleOpenNewDoc('mutasi'),
      keywords: ['mutasi', 'kas', 'bank', 'keuangan', 'voucher', 'pengeluaran', 'pemasukan', 'biaya'],
    },
    {
      id: 'doc-naskah-buku',
      title: 'Dokumen Naskah & Buku Baru',
      description: 'Daftarkan judul naskah, penulis, HPP, dan harga jual ke katalog',
      category: 'document',
      icon: BookOpen,
      action: () => handleOpenNewDoc('buku'),
      keywords: ['buku', 'naskah', 'katalog', 'isbn', 'penulis', 'judul', 'master'],
    },
    {
      id: 'doc-identitas-mitra',
      title: 'Dokumen Identitas Mitra & Kontak',
      description: 'Tambah data pelanggan, donatur, atau relawan ke buku induk',
      category: 'document',
      icon: UserPlus,
      action: () => handleOpenNewDoc('identitas'),
      keywords: ['mitra', 'kontak', 'identitas', 'pelanggan', 'donatur', 'relawan', 'member'],
    },

    // Reports & Documents
    {
      id: 'report-current-division',
      title: 'Cetak Dokumen Laporan Divisi Saat Ini',
      description: 'Buka lembar pratinjau & unduh dokumen resmi divisi aktif (PDF/HTML)',
      category: 'report',
      icon: FileSpreadsheet,
      action: () => {
        if (onOpenDivisionReport) onOpenDivisionReport(currentUser.divisi_id);
        setIsOpen(false);
      },
      keywords: ['laporan', 'cetak', 'print', 'pdf', 'dokumen', 'divisi', 'resmi', 'unduh'],
    },
    {
      id: 'report-annual-konsolidasi',
      title: 'Dokumen Laporan Tahunan Konsolidasi',
      description: 'Buka laporan eksekutif lengkap seluruh divisi (Annual Report)',
      category: 'report',
      icon: Layers,
      action: () => {
        if (onOpenAnnualReport) onOpenAnnualReport();
        setIsOpen(false);
      },
      keywords: ['tahunan', 'annual', 'report', 'konsolidasi', 'eksekutif', 'direktorat', 'evaluasi'],
    },
    {
      id: 'trigger-ai-assistant',
      title: 'Tanya Asisten AI MIS Lamrimnesia',
      description: 'Analisis data instan, saran bisnis penerbitan & rangkuman otomatis',
      category: 'report',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      action: () => {
        if (onOpenAI) onOpenAI();
        setIsOpen(false);
      },
      keywords: ['ai', 'asisten', 'bot', 'tanya', 'analisis', 'mascot', 'bantu'],
    },

    // Quick Submenu Navigation
    {
      id: 'nav-keuangan-persetujuan',
      title: 'Buka Tabel Persetujuan Keuangan',
      description: 'Lihat daftar lengkap persetujuan pengajuan cetak di Keuangan',
      category: 'navigation',
      icon: Wallet,
      action: () => {
        switchDivision(2, 'persetujuan');
        setIsOpen(false);
      },
      keywords: ['navigasi', 'keuangan', 'persetujuan', 'finance', 'subtab'],
    },
    {
      id: 'nav-penerbitan-katalog',
      title: 'Buka Katalog Buku & Oplah',
      description: 'Kelola stok, harga, dan ajukan oplah cetak naskah',
      category: 'navigation',
      icon: BookOpen,
      action: () => {
        switchDivision(3, 'katalog');
        setIsOpen(false);
      },
      keywords: ['penerbitan', 'katalog', 'buku', 'oplah', 'penulis'],
    },
    {
      id: 'nav-marketing-pesanan',
      title: 'Buka Rekap Pesanan & Kasir Penjualan',
      description: 'Kelola faktur, antrean pembayaran, dan saluran penjualan',
      category: 'navigation',
      icon: ShoppingBag,
      action: () => {
        switchDivision(4, 'pesanan');
        setIsOpen(false);
      },
      keywords: ['marketing', 'pesanan', 'invoice', 'penjualan', 'faktur'],
    },
    {
      id: 'nav-produksi-spk',
      title: 'Buka SPK Produksi & Kalkulator Cetak',
      description: 'Pantau status pengerjaan percetakan dan input output cetak',
      category: 'navigation',
      icon: Factory,
      action: () => {
        switchDivision(5, 'spk');
        setIsOpen(false);
      },
      keywords: ['produksi', 'spk', 'cetak', 'output', 'kalkulator'],
    },
    {
      id: 'nav-logistik-packing',
      title: 'Buka Antrean Packing & Dispatch Gudang',
      description: 'Input nomor resi pengiriman dan pantau stok gudang',
      category: 'navigation',
      icon: Truck,
      action: () => {
        switchDivision(6, 'packing');
        setIsOpen(false);
      },
      keywords: ['logistik', 'packing', 'gudang', 'resi', 'kirim', 'ekspedisi'],
    },
  ];

  // Filter actions based on search query
  const filteredActions = searchQuery.trim()
    ? allActions.filter((a) => {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.keywords.some((k) => k.includes(q))
        );
      })
    : allActions;

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER BUTTON (MAIN DASHBOARD VIEW) */}
      <div className="fixed bottom-6 right-20 sm:right-24 z-40 print:hidden flex items-center">
        <motion.button
          id="btn-floating-quick-actions"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className={`px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-xl border cursor-pointer group flex items-center space-x-2.5 transition-all ${
            isOpen
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 ring-2 ring-indigo-500/40'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-indigo-500/20'
          }`}
          title="Menu Aksi Cepat (Alt+Q atau Ctrl+K)"
          aria-label="Menu Aksi Cepat"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>

            {/* Pulsing indicator if pending approvals exist */}
            {totalPendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-white dark:border-slate-900" />
              </span>
            )}
          </div>

          <span className="text-xs font-bold tracking-tight hidden sm:inline-block">
            Aksi Cepat
          </span>

          {/* Pending badge pill */}
          {totalPendingApprovals > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shrink-0">
              {totalPendingApprovals}
            </span>
          )}

          <kbd className="hidden md:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Alt+Q
          </kbd>
        </motion.button>
      </div>

      {/* 2. FLOATING MENU POPOVER / MODAL */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <div
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
              }}
            >
              <div className="w-full max-w-2xl my-auto py-2 sm:py-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="relative w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Menu Header with Instant Search */}
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Menu Aksi Cepat (Quick Actions)</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            Pintasan
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Jalankan tugas sering pakai tanpa perlu navigasi sub-menu yang rumit.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      aria-label="Tutup"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Input Bar */}
                  <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Ketik untuk memfilter aksi (contoh: persetujuan, dokumen, pesanan, mutasi, cetak)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Items List */}
                  <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
                    {/* Top Highlight Cards: Quick Document & Pending Approvals */}
                    {!searchQuery && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. Add Document Hero Card */}
                        <div
                          onClick={() => handleOpenNewDoc('pengajuan')}
                          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800/70 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group shadow-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Buat Sekarang</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Tambah Dokumen Baru
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              Permohonan cetak, faktur pesanan, voucher mutasi kas, atau master naskah.
                            </p>
                          </div>
                        </div>

                        {/* 2. Check Pending Approvals Hero Card */}
                        <div
                          onClick={handleOpenApprovals}
                          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/70 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group shadow-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>{totalPendingApprovals} Perlu Tindakan</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Periksa Persetujuan Tertunda
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              Verifikasi anggaran cetak & konfirmasi lunas faktur pesanan dalam 1-klik.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* All Actions List */}
                    <div className="space-y-1.5">
                      <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {searchQuery ? `Hasil Pencarian (${filteredActions.length})` : 'Pilihan Aksi Cepat'}
                      </div>

                      {filteredActions.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                          Tidak ada aksi yang sesuai dengan kata kunci &quot;{searchQuery}&quot;.
                        </div>
                      ) : (
                        filteredActions.map((action) => {
                          const IconComp = action.icon;
                          return (
                            <button
                              key={action.id}
                              type="button"
                              onClick={action.action}
                              className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-center shrink-0">
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="truncate">{action.title}</span>
                                    {action.badge && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${action.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                      >
                                        {action.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {action.description}
                                  </div>
                                </div>
                              </div>

                              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Menu Footer */}
                  <div className="px-5 sm:px-6 py-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className="hidden sm:inline">Navigasi pintas:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                        Alt + Q
                      </kbd>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                        ESC
                      </kbd>
                      <span>untuk menutup</span>
                    </div>

                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      SAPA-ALL MIS v4.0
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatePresence>,
          document.body
        )}

      {/* 3. NEW DOCUMENT MODAL */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        initialType={newDocInitialType}
        onSuccessToast={showToast}
      />

      {/* 4. PENDING APPROVALS MODAL */}
      <PendingApprovalsModal
        isOpen={isApprovalsModalOpen}
        onClose={() => setIsApprovalsModalOpen(false)}
        onSuccessToast={showToast}
      />

      {/* 5. BARCODE SCANNER & MANUAL ISBN MODAL */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* 6. TOAST NOTIFICATION */}
      {toastMessage &&
        createPortal(
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-3 duration-200">
            <div className="px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center space-x-3 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
