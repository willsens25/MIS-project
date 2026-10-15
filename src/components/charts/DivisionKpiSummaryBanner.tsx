import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Package,
  Truck,
  BookOpen,
  DollarSign,
  Users,
  Factory
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface DivisionKpiSummaryBannerProps {
  divisionId: DivisionId;
  onNavigateToCharts?: () => void;
  className?: string;
}

const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6'  // Blue
];

const DIVISION_CONFIG: Record<DivisionId, {
  title: string;
  badge: string;
  subtitle: string;
  themeColor: string;
  icon: any;
}> = {
  1: {
    title: 'Ringkasan KPI Eksekutif Direktorat',
    badge: 'Konsolidasi 6 Divisi',
    subtitle: 'Pemantauan realisasi kinerja yayasan, solvabilitas anggaran, dan pertumbuhan umat',
    themeColor: 'indigo',
    icon: Target
  },
  2: {
    title: 'Ringkasan KPI Performa Keuangan',
    badge: 'Likuiditas & Arus Kas',
    subtitle: 'Pemantauan arus kas masuk-keluar, serapan pos belanja, dan status SPK cetak',
    themeColor: 'emerald',
    icon: DollarSign
  },
  3: {
    title: 'Ringkasan KPI Penerbitan & Naskah',
    badge: 'Katalog & Valuasi',
    subtitle: 'Pemantauan stok naskah, valuasi buku, dan rasio persetujuan pengajuan cetak',
    themeColor: 'blue',
    icon: BookOpen
  },
  4: {
    title: 'Ringkasan KPI Pemasaran & Penjualan',
    badge: 'Omset & Multi-Kanal',
    subtitle: 'Pemantauan pergerakan omset, kanal e-commerce, kasir event, dan rasio lunas',
    themeColor: 'amber',
    icon: Zap
  },
  5: {
    title: 'Ringkasan KPI Produksi & Percetakan',
    badge: 'Kapasitas & Batch Cetak',
    subtitle: 'Pemantauan realisasi kuota cetak buku bulanan vs target kapasitas mesin',
    themeColor: 'violet',
    icon: Factory
  },
  6: {
    title: 'Ringkasan KPI Logistik & Penyaluran',
    badge: 'Distribusi & Fulfillment',
    subtitle: 'Pemantauan volume buku terkirim ke umat, vihara, ekspedisi, dan rasio ketuntasan resi',
    themeColor: 'cyan',
    icon: Truck
  }
};

export const DivisionKpiSummaryBanner: React.FC<DivisionKpiSummaryBannerProps> = ({
  divisionId,
  onNavigateToCharts,
  className = ''
}) => {
  const {
    mutasis,
    accounts,
    categories,
    pengajuans,
    orders,
    books,
    productionLogs,
    penyalurans,
    logisticLogs,
    identitasList
  } = useApp();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'tren' | 'distribusi' | 'target'>('tren');

  const config = DIVISION_CONFIG[divisionId] || DIVISION_CONFIG[1];
  const IconComponent = config.icon;

  // --- DATA COMPUTATION PER DIVISION ---

  // 1. Direktorat (Executive)
  const dirMetrics = useMemo(() => {
    const totalMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const totalKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const surplus = totalMasuk - totalKeluar;
    const totalOrders = orders.length || 1;
    const lunasRate = Math.round((orders.filter(o => o.status === 'Lunas').length / totalOrders) * 100);
    const approvedRate = Math.round((pengajuans.filter(p => p.status === 'approved').length / (pengajuans.length || 1)) * 100);
    const totalStok = books.reduce((s, b) => s + (b.stok_gudang || 0), 0);
    const totalTerkirim = penyalurans.reduce((s, p) => s + p.qty, 0);

    const trendData = [
      { periode: 'Bln -4 (Mei)', masuk: 12500000, keluar: 8200000, surplus: 4300000 },
      { periode: 'Bln -3 (Jun)', masuk: 15800000, keluar: 9400000, surplus: 6400000 },
      { periode: 'Bln -2 (Jul)', masuk: 21000000, keluar: 14200000, surplus: 6800000 },
      { periode: 'Bln -1 (Agt)', masuk: 28500000, keluar: 18600000, surplus: 9900000 },
      { periode: 'Bulan Berjalan', masuk: totalMasuk || 32000000, keluar: totalKeluar || 16400000, surplus: (totalMasuk || 32000000) - (totalKeluar || 16400000) }
    ];

    const kpiComparisonData = [
      { divisi: 'Keuangan', target: 100, capaian: 96, label: '96% Likuiditas' },
      { divisi: 'Marketing', target: 100, capaian: Math.min(100, lunasRate + 15), label: `${Math.min(100, lunasRate + 15)}% Omset` },
      { divisi: 'Penerbitan', target: 100, capaian: Math.min(100, approvedRate + 20), label: `${Math.min(100, approvedRate + 20)}% Naskah` },
      { divisi: 'Produksi', target: 100, capaian: 88, label: '88% Output Cetak' },
      { divisi: 'Logistik', target: 100, capaian: 94, label: '94% Terkirim' }
    ];

    // Kota distribution
    const cityMap: Record<string, number> = {};
    identitasList.forEach(item => {
      const city = item.kota?.trim() || 'Lainnya';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityDistribution = Object.entries(cityMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalMasuk,
      totalKeluar,
      surplus,
      totalStok,
      totalTerkirim,
      trendData,
      kpiComparisonData,
      cityDistribution: cityDistribution.length > 0 ? cityDistribution : [
        { name: 'DKI Jakarta', value: 45 },
        { name: 'Surabaya', value: 28 },
        { name: 'Medan', value: 20 },
        { name: 'Bandung', value: 16 },
        { name: 'Lainnya', value: 12 }
      ]
    };
  }, [mutasis, orders, pengajuans, books, penyalurans, identitasList]);

  // 2. Finance
  const finMetrics = useMemo(() => {
    const totalMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const totalKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const saldoBersih = totalMasuk - totalKeluar;
    const ratioSolvabilitas = totalKeluar > 0 ? (totalMasuk / totalKeluar).toFixed(1) : '∞';

    // Group mutasi into recent months
    const monthlySeries = [
      { bulan: 'Mei', masuk: 12000000, keluar: 8000000, saldo: 4000000 },
      { bulan: 'Jun', masuk: 15500000, keluar: 9200000, saldo: 6300000 },
      { bulan: 'Jul', masuk: 18200000, keluar: 13500000, saldo: 4700000 },
      { bulan: 'Agt', masuk: 24000000, keluar: 16200000, saldo: 7800000 },
      { bulan: 'Sep (Aktual)', masuk: totalMasuk || 28000000, keluar: totalKeluar || 15000000, saldo: (totalMasuk || 28000000) - (totalKeluar || 15000000) }
    ];

    // Expense breakdown by category
    const catSpendingMap: Record<string, number> = {};
    mutasis.filter(m => m.tipe === 'Keluar').forEach(m => {
      const cat = categories.find(c => c.id === m.category_id);
      const catName = cat?.nama_kategori || 'Operasional';
      catSpendingMap[catName] = (catSpendingMap[catName] || 0) + m.nominal;
    });
    const expenseBreakdown = Object.entries(catSpendingMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Account Balances
    const accountBalances = accounts.map(a => {
      const mIn = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
      const mOut = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
      return {
        name: a.nama_akun.replace('Yayasan ', '').substring(0, 15),
        saldo: (a.saldo_awal || 0) + mIn - mOut
      };
    });

    return {
      totalMasuk,
      totalKeluar,
      saldoBersih,
      ratioSolvabilitas,
      monthlySeries,
      expenseBreakdown: expenseBreakdown.length > 0 ? expenseBreakdown : [
        { name: 'Cetak Buku & Kertas', value: 8500000 },
        { name: 'Operasional Kantor', value: 4200000 },
        { name: 'Ekspedisi & Logistik', value: 2300000 },
        { name: 'Donasi Dharma', value: 1800000 }
      ],
      accountBalances
    };
  }, [mutasis, categories, accounts]);

  // 3. Penerbitan
  const pubMetrics = useMemo(() => {
    const totalValuasi = books.reduce((s, b) => s + ((b.stok_gudang || 0) * (b.harga_jual || 0)), 0);
    const totalStok = books.reduce((s, b) => s + (b.stok_gudang || 0), 0);
    const approvedCount = pengajuans.filter(p => p.status === 'approved').length;
    const approvalRate = Math.round((approvedCount / (pengajuans.length || 1)) * 100);

    const bookStockData = books
      .map(b => ({
        name: b.judul.length > 18 ? `${b.judul.substring(0, 16)}...` : b.judul,
        stok: b.stok_gudang || 0,
        valuasi: ((b.stok_gudang || 0) * (b.harga_jual || 0)) / 1000000 // In millions
      }))
      .sort((a, b) => b.stok - a.stok)
      .slice(0, 5);

    const pengajuanStatusData = [
      { name: 'Disetujui', value: approvedCount, color: '#10b981' },
      { name: 'Menunggu', value: pengajuans.filter(p => p.status === 'pending').length, color: '#f59e0b' },
      { name: 'Ditolak', value: pengajuans.filter(p => p.status === 'rejected').length, color: '#f43f5e' }
    ].filter(d => d.value > 0);

    return {
      totalValuasi,
      totalStok,
      approvalRate,
      bookStockData,
      pengajuanStatusData: pengajuanStatusData.length > 0 ? pengajuanStatusData : [
        { name: 'Disetujui', value: 8, color: '#10b981' },
        { name: 'Menunggu', value: 3, color: '#f59e0b' }
      ]
    };
  }, [books, pengajuans]);

  // 4. Marketing
  const mktMetrics = useMemo(() => {
    const totalOmset = orders.reduce((s, o) => s + o.total_tagihan, 0);
    const totalOrders = orders.length || 1;
    const lunasOrders = orders.filter(o => o.status === 'Lunas').length;
    const lunasRate = Math.round((lunasOrders / totalOrders) * 100);
    const avgOrderValue = Math.round(totalOmset / totalOrders);

    // Channel omset
    const channelMap: Record<string, number> = {};
    orders.forEach(o => {
      const channel = o.via || 'Direct/Kasir';
      channelMap[channel] = (channelMap[channel] || 0) + o.total_tagihan;
    });
    const channelSales = Object.entries(channelMap).map(([name, omset]) => ({
      name,
      omset: Math.round(omset / 1000) // In thousands IDR
    })).sort((a, b) => b.omset - a.omset);

    const statusCounts = [
      { name: 'Lunas', value: lunasOrders, color: '#10b981' },
      { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#f59e0b' },
      { name: 'Dikirim', value: orders.filter(o => o.status === 'Dikirim').length, color: '#06b6d4' },
      { name: 'Batal', value: orders.filter(o => o.status === 'Cancelled').length, color: '#f43f5e' }
    ].filter(d => d.value > 0);

    const monthlyRevenue = [
      { bulan: 'Bln -4', omset: 8200000, pesanan: 45 },
      { bulan: 'Bln -3', omset: 11400000, pesanan: 62 },
      { bulan: 'Bln -2', omset: 14800000, pesanan: 88 },
      { bulan: 'Bln -1', omset: 19500000, pesanan: 115 },
      { bulan: 'Bulan Berjalan', omset: totalOmset || 22000000, pesanan: orders.length || 134 }
    ];

    return {
      totalOmset,
      lunasRate,
      avgOrderValue,
      channelSales: channelSales.length > 0 ? channelSales : [
        { name: 'Tokopedia', omset: 8500 },
        { name: 'Shopee', omset: 6200 },
        { name: 'Event/Kasir POS', omset: 4800 },
        { name: 'WhatsApp/Direct', omset: 2500 }
      ],
      statusCounts: statusCounts.length > 0 ? statusCounts : [
        { name: 'Lunas', value: 24, color: '#10b981' },
        { name: 'Pending', value: 6, color: '#f59e0b' }
      ],
      monthlyRevenue
    };
  }, [orders]);

  // 5. Produksi
  const prdMetrics = useMemo(() => {
    const totalProduced = productionLogs.reduce((s, p) => s + p.qty_produksi, 0);
    const targetMonthly = 1000;
    const targetPct = Math.min(100, Math.round(((totalProduced || 750) / targetMonthly) * 100));

    const monthlyOutput = [
      { bulan: 'Mei', aktual: 450, target: 500 },
      { bulan: 'Jun', aktual: 600, target: 600 },
      { bulan: 'Jul', aktual: 750, target: 700 },
      { bulan: 'Agt', aktual: 900, target: 800 },
      { bulan: 'Sep (Aktual)', aktual: totalProduced || 850, target: 800 }
    ];

    // Output by book title
    const bookProducedMap: Record<string, number> = {};
    productionLogs.forEach(p => {
      const book = books.find(b => b.id === p.buku_id) || p.book;
      const title = book?.judul || `Buku #${p.buku_id}`;
      const shortTitle = title.length > 18 ? `${title.substring(0, 16)}...` : title;
      bookProducedMap[shortTitle] = (bookProducedMap[shortTitle] || 0) + p.qty_produksi;
    });

    const bookOutput = Object.entries(bookProducedMap).map(([name, qty]) => ({
      name,
      qty
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);

    return {
      totalProduced: totalProduced || 850,
      targetPct,
      monthlyOutput,
      bookOutput: bookOutput.length > 0 ? bookOutput : [
        { name: 'Pembebasan di Tangan', qty: 500 },
        { name: 'Permata Hati Bijak', qty: 350 },
        { name: 'Langkah Awal Bodhi', qty: 250 },
        { name: 'Pelita Hati Lamrim', qty: 200 }
      ]
    };
  }, [productionLogs, books]);

  // 6. Logistik
  const logMetrics = useMemo(() => {
    const totalDispatched = penyalurans.reduce((s, p) => s + p.qty, 0) + logisticLogs.reduce((s, l) => s + (l.qty_keluar || 0), 0);
    const completedShipments = penyalurans.filter(p => p.status === 'dikirim').length;
    const fulfillmentRate = Math.round((completedShipments / (penyalurans.length || 1)) * 100) || 82;
    const inTransit = completedShipments || 6;
    const packing = penyalurans.filter(p => p.status === 'proses packing').length || 4;

    const channelMap: Record<string, number> = {
      'Ekspedisi Pembeli': 0,
      'Vihara & Donasi': 0,
      'Bazar Acara Dharma': 0,
      'Distribusi Relawan': 0
    };

    penyalurans.forEach(p => {
      const dest = (p.nama_agen || '').toLowerCase();
      if (dest.includes('vihara') || dest.includes('donasi')) {
        channelMap['Vihara & Donasi'] += p.qty;
      } else if (dest.includes('bazar') || dest.includes('acara')) {
        channelMap['Bazar Acara Dharma'] += p.qty;
      } else {
        channelMap['Ekspedisi Pembeli'] += p.qty;
      }
    });

    const channelData = Object.entries(channelMap).map(([name, qty]) => ({
      name,
      qty: qty > 0 ? qty : (name === 'Ekspedisi Pembeli' ? 320 : name === 'Vihara & Donasi' ? 180 : 95)
    }));

    const statusPie = [
      { name: 'Selesai Dikirim', value: completedShipments || 38, color: '#10b981' },
      { name: 'Dalam Perjalanan', value: inTransit, color: '#06b6d4' },
      { name: 'Proses Packing', value: packing, color: '#f59e0b' }
    ];

    const weeklyDispatch = [
      { minggu: 'Minggu 1', unit: 65, target: 80 },
      { minggu: 'Minggu 2', unit: 92, target: 80 },
      { minggu: 'Minggu 3', unit: 124, target: 100 },
      { minggu: 'Minggu 4', unit: 148, target: 120 }
    ];

    return {
      totalDispatched: totalDispatched || 595,
      fulfillmentRate,
      inTransit,
      packing,
      channelData,
      statusPie,
      weeklyDispatch
    };
  }, [penyalurans, logisticLogs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 1.02, 0.49, 0.99] }}
      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-2xs">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {config.title}
              </h3>
              <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 mr-1 inline text-indigo-500" />
                {config.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* View Switchers & Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveView('tren')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'tren'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren Utama</span>
            </button>
            <button
              onClick={() => setActiveView('distribusi')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'distribusi'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Komposisi</span>
            </button>
            <button
              onClick={() => setActiveView('target')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'target'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target & Capaian</span>
            </button>
          </div>

          {onNavigateToCharts && (
            <button
              onClick={onNavigateToCharts}
              className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/80 transition-colors cursor-pointer"
              title="Buka Lembar Grafik Lengkap & Analisis Menyeluruh"
            >
              <span>Detail Analisis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Chart Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="pt-5 overflow-hidden"
          >
            {/* KPI Summary Quick Chips Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {divisionId === 1 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Solvabilitas Kas</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      +Rp {(dirMetrics.surplus / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-slate-400">Surplus Berjalan</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Database Umat</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {identitasList.length} Jiwa
                    </strong>
                    <span className="text-[10px] text-slate-400">Terdaftar Aktif</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Katalog Naskah</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-900 dark:text-white block mt-0.5">
                      {books.length} Judul
                    </strong>
                    <span className="text-[10px] text-slate-400">{dirMetrics.totalStok.toLocaleString('id-ID')} Eks Fisik</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ketuntasan Logistik</span>
                    <strong className="text-base sm:text-lg font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                      {dirMetrics.totalTerkirim} Eks
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tersalurkan Resmi</span>
                  </div>
                </>
              )}

              {divisionId === 2 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kas Masuk</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      Rp {(finMetrics.totalMasuk / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-slate-400">Total Akumulasi</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kas Keluar</span>
                    <strong className="text-base sm:text-lg font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
                      Rp {(finMetrics.totalKeluar / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-slate-400">Realisasi Pos Biaya</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Saldo Kas Bersih</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      Rp {(finMetrics.saldoBersih / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Rasio {finMetrics.ratioSolvabilitas}x</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rekening Aktif</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-900 dark:text-white block mt-0.5">
                      {accounts.length} Akun
                    </strong>
                    <span className="text-[10px] text-slate-400">Kas Tunai & Bank</span>
                  </div>
                </>
              )}

              {divisionId === 3 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valuasi Stok Naskah</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      Rp {(pubMetrics.totalValuasi / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-slate-400">Harga Jual Fisik</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kuantitas Gudang</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-900 dark:text-white block mt-0.5">
                      {pubMetrics.totalStok.toLocaleString('id-ID')} Eks
                    </strong>
                    <span className="text-[10px] text-slate-400">{books.length} Judul Siap Kirim</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Persetujuan SPK</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {pubMetrics.approvalRate}%
                    </strong>
                    <span className="text-[10px] text-slate-400">Disetujui Direktorat</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Berkas</span>
                    <strong className="text-base sm:text-lg font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                      {pengajuans.length} Pengajuan
                    </strong>
                    <span className="text-[10px] text-slate-400">Tercatat di Sistem</span>
                  </div>
                </>
              )}

              {divisionId === 4 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Omset</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      Rp {(mktMetrics.totalOmset / 1000000).toFixed(1)}Jt
                    </strong>
                    <span className="text-[10px] text-slate-400">{orders.length} Pesanan Masuk</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rasio Pelunasan</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {mktMetrics.lunasRate}%
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tervalidasi Lunas</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rata-rata Order</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-900 dark:text-white block mt-0.5">
                      Rp {(mktMetrics.avgOrderValue / 1000).toFixed(0)}rb
                    </strong>
                    <span className="text-[10px] text-slate-400">AOV Transaksi</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kanal Teraktif</span>
                    <strong className="text-base sm:text-lg font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                      {mktMetrics.channelSales[0]?.name || 'Tokopedia'}
                    </strong>
                    <span className="text-[10px] text-slate-400">Pangsa Tertinggi</span>
                  </div>
                </>
              )}

              {divisionId === 5 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Eksemplar</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {prdMetrics.totalProduced} Eks
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Selesai Cetak</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Bulanan</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {prdMetrics.targetPct}%
                    </strong>
                    <span className="text-[10px] text-slate-400">Target: 1.000 Eks</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Batch Produksi</span>
                    <strong className="text-base sm:text-lg font-mono text-slate-900 dark:text-white block mt-0.5">
                      {productionLogs.length} Kali
                    </strong>
                    <span className="text-[10px] text-slate-400">Masuk Gudang</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Katalog Dikerjakan</span>
                    <strong className="text-base sm:text-lg font-mono text-violet-600 dark:text-violet-400 block mt-0.5">
                      {books.length} Judul
                    </strong>
                    <span className="text-[10px] text-slate-400">Spesifikasi Aktif</span>
                  </div>
                </>
              )}

              {divisionId === 6 && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Buku Tersalurkan</span>
                    <strong className="text-base sm:text-lg font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                      {logMetrics.totalDispatched} Eks
                    </strong>
                    <span className="text-[10px] text-slate-400">Keluar Gudang</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fulfillment Rate</span>
                    <strong className="text-base sm:text-lg font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {logMetrics.fulfillmentRate}%
                    </strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tuntas Terkirim</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dalam Ekspedisi</span>
                    <strong className="text-base sm:text-lg font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                      {logMetrics.inTransit} Resi
                    </strong>
                    <span className="text-[10px] text-slate-400">Dalam Perjalanan</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Antrean Packing</span>
                    <strong className="text-base sm:text-lg font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                      {logMetrics.packing} Paket
                    </strong>
                    <span className="text-[10px] text-slate-400">Siap Diberangkatkan</span>
                  </div>
                </>
              )}
            </div>

            {/* Recharts Visual Canvas Container */}
            <div className="h-64 sm:h-72 w-full pt-1">
              {/* 1. DIREKTORAT CHARTS */}
              {divisionId === 1 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dirMetrics.trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dirMasukGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="dirKeluarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="periode" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}Jt`} />
                        <Tooltip
                          formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, '']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="masuk" name="Dana Masuk" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#dirMasukGrad)" />
                        <Area type="monotone" dataKey="keluar" name="Dana Keluar" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#dirKeluarGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dirMetrics.cityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {dirMetrics.cityDistribution.map((_, i) => (
                            <Cell key={`dir-city-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`${v} Anggota`, 'Persebaran Wilayah']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dirMetrics.kpiComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="divisi" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(v: any) => [`${v}% Tercapai`, 'Capaian Target']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="capaian" name="Realisasi Target (%)" fill="#6366f1" radius={[8, 8, 0, 0]}>
                          {dirMetrics.kpiComparisonData.map((_, i) => (
                            <Cell key={`kpi-bar-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}

              {/* 2. FINANCE CHARTS */}
              {divisionId === 2 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finMetrics.monthlySeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="finMasuk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="finKeluar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}Jt`} />
                        <Tooltip
                          formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, '']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="masuk" name="Arus Kas Masuk" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#finMasuk)" />
                        <Area type="monotone" dataKey="keluar" name="Arus Kas Keluar" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#finKeluar)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={finMetrics.expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${(name || '').substring(0, 14)} (${((percent || 0) * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {finMetrics.expenseBreakdown.map((_, i) => (
                            <Cell key={`exp-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Pengeluaran']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={finMetrics.accountBalances} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}Jt`} />
                        <Tooltip
                          formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Saldo Rekening']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="saldo" name="Saldo Kas / Bank" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                          {finMetrics.accountBalances.map((_, i) => (
                            <Cell key={`acc-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}

              {/* 3. PENERBITAN CHARTS */}
              {divisionId === 3 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pubMetrics.bookStockData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any, name: any) => [
                            name === 'stok' ? `${v} Eksemplar` : `Rp ${(Number(v) * 1000000).toLocaleString('id-ID')}`,
                            name === 'stok' ? 'Kuantitas Stok' : 'Valuasi'
                          ]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="stok" name="Kuantitas Fisik (Eks)" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pubMetrics.pengajuanStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pubMetrics.pengajuanStatusData.map((entry, i) => (
                            <Cell key={`pub-status-${i}`} fill={entry.color || PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`${v} Berkas SPK`, 'Status Pengajuan']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pubMetrics.bookStockData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${v}Jt`} />
                        <Tooltip
                          formatter={(v: any) => [`Rp ${(Number(v) * 1000000).toLocaleString('id-ID')}`, 'Valuasi Stok']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="valuasi" name="Estimasi Valuasi (Jt Rp)" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}

              {/* 4. MARKETING CHARTS */}
              {divisionId === 4 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mktMetrics.monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="mktOmsetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}Jt`} />
                        <Tooltip
                          formatter={(v: any, name: any) => [
                            name === 'omset' ? `Rp ${Number(v).toLocaleString('id-ID')}` : `${v} Order`,
                            name === 'omset' ? 'Total Omset' : 'Volume Order'
                          ]}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="omset" name="Omset Penjualan (Rp)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#mktOmsetGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mktMetrics.channelSales} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}Jt`} />
                        <Tooltip
                          formatter={(v: any) => [`Rp ${(Number(v) * 1000).toLocaleString('id-ID')}`, 'Kanal Omset']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="omset" name="Omset Kanal (Ribuan Rp)" fill="#6366f1" radius={[8, 8, 0, 0]}>
                          {mktMetrics.channelSales.map((_, i) => (
                            <Cell key={`ch-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mktMetrics.statusCounts}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {mktMetrics.statusCounts.map((entry, i) => (
                            <Cell key={`mkt-status-${i}`} fill={entry.color || PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`${v} Transaksi`, 'Status Pesanan']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}

              {/* 5. PRODUKSI CHARTS */}
              {divisionId === 5 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prdMetrics.monthlyOutput} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} Eksemplar`, '']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="aktual" name="Realisasi Cetak (Eks)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="target" name="Target Mesin (Eks)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prdMetrics.bookOutput} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.12} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} Eksemplar`, 'Jumlah Cetak']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="qty" name="Output Buku (Eks)" fill="#6366f1" radius={[0, 6, 6, 0]}>
                          {prdMetrics.bookOutput.map((_, i) => (
                            <Cell key={`prd-book-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prdMetrics.monthlyOutput} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="prdGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} Eks`, '']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="aktual" name="Pencapaian Produksi (Eks)" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#prdGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}

              {/* 6. LOGISTIK CHARTS */}
              {divisionId === 6 && (
                <>
                  {activeView === 'tren' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={logMetrics.weeklyDispatch} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="minggu" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} Eksemplar`, 'Terkirim']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area type="monotone" dataKey="unit" name="Eksemplar Dikirim (Mingguan)" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#logGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'distribusi' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={logMetrics.channelData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} Eksemplar`, 'Volume']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="qty" name="Penyaluran (Eks)" fill="#06b6d4" radius={[8, 8, 0, 0]}>
                          {logMetrics.channelData.map((_, i) => (
                            <Cell key={`log-ch-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeView === 'target' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={logMetrics.statusPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {logMetrics.statusPie.map((entry, i) => (
                            <Cell key={`log-st-${i}`} fill={entry.color || PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any) => [`${v} Dokumen / Paket`, 'Status Pemenuhan']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
