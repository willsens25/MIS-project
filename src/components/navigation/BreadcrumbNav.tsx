import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  Home,
  ChevronRight,
  ChevronDown,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  TrendingUp,
  Users,
  UserCog,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building,
  Printer,
  FileText,
  Tag,
  Globe,
  Plus,
  History,
  Package,
  Send,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

export interface BreadcrumbTabConfig {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface DivisionNavConfig {
  id: DivisionId;
  name: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultTab: string;
  tabs: BreadcrumbTabConfig[];
}

export const NAVIGATION_CONFIG: Record<DivisionId, DivisionNavConfig> = {
  1: {
    id: 1,
    name: 'Direktorat',
    code: 'DIR',
    icon: Building2,
    description: 'Tata Kelola, Kepegawaian & Audit',
    defaultTab: 'overview',
    tabs: [
      {
        id: 'overview',
        name: 'Executive Overview',
        shortName: 'Overview',
        icon: TrendingUp,
        description: 'Ringkasan KPI eksekutif, neraca kas & statistik'
      },
      {
        id: 'identitas',
        name: 'Database Anggota',
        shortName: 'Anggota & Umat',
        icon: Users,
        description: 'Master identitas umat, simpatisan & agen'
      },
      {
        id: 'users',
        name: 'Manajemen Pengguna',
        shortName: 'Pengguna Sistem',
        icon: UserCog,
        description: 'Akun tim, hak akses & audit keamanan'
      },
      {
        id: 'audit',
        name: 'Audit Trail & Log',
        shortName: 'Audit Log',
        icon: ShieldCheck,
        description: 'Catatan jejak aktivitas & histori transaksi'
      }
    ]
  },
  2: {
    id: 2,
    name: 'Finance',
    code: 'FIN',
    icon: Wallet,
    description: 'Manajemen Kas, Buku Bank & SPK Cetak',
    defaultTab: 'grafik',
    tabs: [
      {
        id: 'grafik',
        name: 'Grafik Finansial',
        shortName: 'Grafik & Analitik',
        icon: TrendingUp,
        description: 'Analisis arus kas masuk/keluar & neraca'
      },
      {
        id: 'mutasi',
        name: 'Buku Kas & Mutasi',
        shortName: 'Jurnal Kas',
        icon: Wallet,
        description: 'Pencatatan mutasi kas masuk dan keluar'
      },
      {
        id: 'persetujuan',
        name: 'Persetujuan Cetak',
        shortName: 'Approval SPK',
        icon: CheckCircle2,
        description: 'Validasi & penerbitan SPK cetak buku'
      },
      {
        id: 'penjualan',
        name: 'Rekapitulasi Omset',
        shortName: 'Omset Penjualan',
        icon: CreditCard,
        description: 'Rekap transaksi penjualan & penerimaan donasi'
      },
      {
        id: 'akun',
        name: 'Master Rekening',
        shortName: 'Rekening Bank',
        icon: Building,
        description: 'Daftar buku tabungan & dompet kas operasional'
      }
    ]
  },
  3: {
    id: 3,
    name: 'Penerbitan',
    code: 'PUB',
    icon: BookOpen,
    description: 'Katalog Buku, ISBN & Pengajuan Cetak',
    defaultTab: 'katalog',
    tabs: [
      {
        id: 'katalog',
        name: 'Katalog Master Buku',
        shortName: 'Katalog Buku',
        icon: BookOpen,
        description: 'Daftar judul buku dharma, ISBN & harga jual'
      },
      {
        id: 'grafik',
        name: 'Statistik Stok & Valuasi',
        shortName: 'Statistik Royalti',
        icon: TrendingUp,
        description: 'Analisis valuasi inventori & data royalti'
      },
      {
        id: 'pengajuan',
        name: 'Pengajuan Cetak',
        shortName: 'Riwayat Pengajuan',
        icon: Printer,
        description: 'Permohonan cetak ulang buku ke Finance'
      }
    ]
  },
  4: {
    id: 4,
    name: 'Marketing',
    code: 'MKT',
    icon: ShoppingBag,
    description: 'Kasir POS, Invoicing, Promo & Ekspedisi',
    defaultTab: 'pos',
    tabs: [
      {
        id: 'pos',
        name: 'Kasir POS & Order Baru',
        shortName: 'Kasir POS',
        icon: ShoppingBag,
        description: 'Form pemesanan buku lengkap 12 kolom'
      },
      {
        id: 'grafik',
        name: 'Grafik Penjualan',
        shortName: 'Analitik Sales',
        icon: TrendingUp,
        description: 'Grafik tren omset & performa buku terlaris'
      },
      {
        id: 'invoices',
        name: 'Daftar Invoice & Pesanan',
        shortName: 'Daftar Invoice',
        icon: FileText,
        description: 'Rekap nomor invoice, status bayar & kurir'
      },
      {
        id: 'promos',
        name: 'Master Promo & Diskon',
        shortName: 'Kode Promo',
        icon: Tag,
        description: 'Kelola kupon diskon, kuota & syarat pesanan'
      },
      {
        id: 'saluran',
        name: 'Saluran & Ekspedisi',
        shortName: 'Saluran & Kurir',
        icon: Globe,
        description: 'Daftar marketplace & ekspedisi pengiriman'
      },
      {
        id: 'agen',
        name: 'Agen & Pembeli Terdaftar',
        shortName: 'Agen & Pembeli',
        icon: Users,
        description: 'Database pelanggan tetap & reseller'
      }
    ]
  },
  5: {
    id: 5,
    name: 'Produksi',
    code: 'PROD',
    icon: Factory,
    description: 'Pusat Pabrikasi, Cetak & Batch Gudang',
    defaultTab: 'overview',
    tabs: [
      {
        id: 'overview',
        name: 'Pusat Pabrikasi Cetak',
        shortName: 'Pabrikasi Cetak',
        icon: Factory,
        description: 'Pencatatan batch selesai cetak & inventori'
      },
      {
        id: 'input',
        name: 'Catat Hasil Cetak',
        shortName: 'Input Batch Baru',
        icon: Plus,
        description: 'Tambah stok langsung dari percetakan ke gudang'
      },
      {
        id: 'logs',
        name: 'Riwayat Log Produksi',
        shortName: 'Log Percetakan',
        icon: History,
        description: 'Histori kuantitas eksemplar yang telah selesai'
      }
    ]
  },
  6: {
    id: 6,
    name: 'Logistik',
    code: 'LOG',
    icon: Truck,
    description: 'Packing Pesanan, Ekspedisi & Gudang',
    defaultTab: 'antrean',
    tabs: [
      {
        id: 'antrean',
        name: 'Antrean Packing Pesanan',
        shortName: 'Antrean Packing',
        icon: Package,
        description: 'Daftar pesanan lunas yang siap dikirim'
      },
      {
        id: 'manual',
        name: 'Distribusi Manual Gudang',
        shortName: 'Distribusi Manual',
        icon: Send,
        description: 'Pengeluaran buku dharma sukarela/donasi'
      },
      {
        id: 'logs',
        name: 'Riwayat Pengeluaran Gudang',
        shortName: 'Log Pengeluaran',
        icon: History,
        description: 'Catatan surat jalan & nomor resi pengiriman'
      }
    ]
  }
};

export const BreadcrumbNav: React.FC = () => {
  const {
    currentUser,
    switchDivision,
    currentSubTab,
    setCurrentSubTab,
    divisiList,
    pengajuans
  } = useApp();

  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);

  const divisionDropdownRef = useRef<HTMLDivElement>(null);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        divisionDropdownRef.current &&
        !divisionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDivisionDropdownOpen(false);
      }
      if (
        tabDropdownRef.current &&
        !tabDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTabDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDivisionDropdownOpen(false);
        setIsTabDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentDivisionConfig = NAVIGATION_CONFIG[currentUser.divisi_id] || NAVIGATION_CONFIG[1];
  const DivisionIcon = currentDivisionConfig.icon;

  // Identify current tab
  const activeTabConfig =
    currentDivisionConfig.tabs.find(t => t.id === currentSubTab) ||
    currentDivisionConfig.tabs[0];
  const TabIcon = activeTabConfig?.icon || Layers;

  // Pending count for Finance
  const pendingApprovalsCount = pengajuans.filter(p => p.status === 'pending').length;

  // Formatted date string for Indonesian locale
  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const handleNavigateHome = () => {
    switchDivision(1, 'overview');
    setIsDivisionDropdownOpen(false);
    setIsTabDropdownOpen(false);
  };

  const handleSelectDivision = (id: DivisionId) => {
    switchDivision(id);
    setIsDivisionDropdownOpen(false);
    setIsTabDropdownOpen(false);
  };

  const handleSelectTab = (tabId: string) => {
    setCurrentSubTab(tabId);
    setIsTabDropdownOpen(false);
  };

  return (
    <nav
      aria-label="Breadcrumb Navigation"
      id="breadcrumb-navigation-bar"
      className="print:hidden sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Interactive Breadcrumbs Path */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto scrollbar-none py-0.5">
          
          {/* Node 1: Home Link */}
          <button
            id="breadcrumb-home-link"
            type="button"
            onClick={handleNavigateHome}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors font-medium whitespace-nowrap cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            title="Kembali ke Beranda Utama (Direktorat Overview)"
          >
            <Home className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600" />
            <span className="hidden sm:inline">Beranda</span>
          </button>

          {/* Separator 1 */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 select-none" />

          {/* Node 2: Division Selector Dropdown */}
          <div className="relative" ref={divisionDropdownRef}>
            <button
              id="breadcrumb-division-btn"
              type="button"
              onClick={() => {
                setIsDivisionDropdownOpen(!isDivisionDropdownOpen);
                setIsTabDropdownOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 ${
                isDivisionDropdownOpen
                  ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-800'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
              title="Ganti Divisi Kerja"
              aria-expanded={isDivisionDropdownOpen}
              aria-haspopup="true"
            >
              <DivisionIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{currentDivisionConfig.name}</span>
              {currentDivisionConfig.id === 2 && pendingApprovalsCount > 0 && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                  title={`${pendingApprovalsCount} pengajuan cetak menunggu persetujuan`}
                />
              )}
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  isDivisionDropdownOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {/* Division Popover Menu */}
            {isDivisionDropdownOpen && (
              <div
                id="breadcrumb-division-dropdown-menu"
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Divisi Kerja
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Navigasi langsung ke modul divisi lainnya
                  </p>
                </div>

                <div className="space-y-0.5">
                  {divisiList.map((div) => {
                    const cfg = NAVIGATION_CONFIG[div.id] || {
                      name: div.nama_divisi,
                      code: div.kode,
                      icon: Building2,
                      description: div.deskripsi || ''
                    };
                    const Icon = cfg.icon;
                    const isActive = currentUser.divisi_id === div.id;

                    return (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() => handleSelectDivision(div.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold">{cfg.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono text-slate-600 dark:text-slate-400">
                                {cfg.code}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {cfg.description}
                            </p>
                          </div>
                        </div>

                        {isActive ? (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                        ) : div.id === 2 && pendingApprovalsCount > 0 ? (
                          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[9px] shrink-0 ml-2">
                            {pendingApprovalsCount}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Separator 2 */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 select-none" />

          {/* Node 3: Current Tab Selector Dropdown */}
          <div className="relative" ref={tabDropdownRef}>
            <button
              id="breadcrumb-tab-btn"
              type="button"
              onClick={() => {
                setIsTabDropdownOpen(!isTabDropdownOpen);
                setIsDivisionDropdownOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer border focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 ${
                isTabDropdownOpen
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700 shadow-xs'
                  : 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50'
              }`}
              title="Ganti Tab Halaman Ini"
              aria-expanded={isTabDropdownOpen}
              aria-haspopup="true"
            >
              <TabIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{activeTabConfig?.name || 'Halaman Utama'}</span>
              <ChevronDown
                className={`w-3 h-3 text-indigo-500/80 transition-transform duration-200 ${
                  isTabDropdownOpen ? 'rotate-180 text-indigo-700 dark:text-indigo-300' : ''
                }`}
              />
            </button>

            {/* Tab Popover Menu */}
            {isTabDropdownOpen && (
              <div
                id="breadcrumb-tab-dropdown-menu"
                className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tab {currentDivisionConfig.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pindah sub-modul dalam divisi ini
                  </p>
                </div>

                <div className="space-y-0.5">
                  {currentDivisionConfig.tabs.map((tab) => {
                    const TabItemIcon = tab.icon;
                    const isActive = currentSubTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectTab(tab.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <TabItemIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block">{tab.name}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">
                              {tab.description}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Contextual Metadata */}
        <div className="hidden md:flex items-center space-x-3 text-slate-500 dark:text-slate-400 shrink-0 text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{formattedToday}</span>
          </div>

          <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sistem Aktif" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {currentUser.name}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-[10px] text-slate-600 dark:text-slate-400">
              {currentUser.role || 'Staff'}
            </span>
          </div>
        </div>

      </div>
    </nav>
  );
};
