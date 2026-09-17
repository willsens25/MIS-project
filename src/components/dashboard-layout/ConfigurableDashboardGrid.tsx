import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Users,
  ShoppingBag,
  Layers,
  CheckCircle2,
  Truck,
  Store,
  Factory,
  BookOpen,
  Award,
  SlidersHorizontal,
  Move,
  RotateCcw,
  Check,
  Eye,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { DashboardCardWrapper } from './DashboardCardWrapper';
import { DashboardLayoutConfiguratorModal } from './DashboardLayoutConfiguratorModal';
import { DashboardCardConfig, LAYOUT_PRESETS } from '../../types/dashboardLayout';

interface ConfigurableDashboardGridProps {
  onOpenAnnualReport?: () => void;
  onOpenIdentitasTab?: () => void;
}

export const ConfigurableDashboardGrid: React.FC<ConfigurableDashboardGridProps> = ({
  onOpenAnnualReport,
  onOpenIdentitasTab
}) => {
  const {
    currentUser,
    mutasis,
    identitasList,
    orders,
    books,
    pengajuans,
    productionLogs,
    penyalurans,
    salesChannels,
    promos,
    switchDivision
  } = useApp();

  const {
    cards,
    visibleCards,
    columns,
    activePreset,
    isConfigMode,
    isConfigModalOpen,
    setIsConfigMode,
    toggleConfigMode,
    setIsConfigModalOpen,
    reorderCards,
    moveCard,
    toggleCardVisibility,
    applyPreset,
    setColumns,
    resetToDefault
  } = useDashboardLayout({ userId: currentUser.id });

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculations for cards
  const totalKasMasuk = mutasis.filter((m) => m.tipe === 'Masuk').reduce((sum, m) => sum + m.nominal, 0);
  const totalKasKeluar = mutasis.filter((m) => m.tipe === 'Keluar').reduce((sum, m) => sum + m.nominal, 0);
  const saldoKasBersih = totalKasMasuk - totalKasKeluar;
  const totalInvoiceLunas = orders.filter((o) => o.status === 'Lunas').length;
  const totalOmsetPenjualan = orders
    .filter((o) => o.status === 'Lunas')
    .reduce((sum, o) => sum + (o.total_tagihan || 0), 0);
  const totalBukuStok = books.reduce((sum, b) => sum + b.stok_gudang, 0);
  const totalNilaiInventaris = books.reduce((sum, b) => sum + (b.stok_gudang * b.harga_jual), 0);
  const pendingPengajuans = pengajuans.filter((p) => p.status === 'pending');
  const totalDanaDiajukan = pendingPengajuans.reduce(
    (sum, p) => sum + (p.jumlah_pengajuan * Math.round((p.buku?.harga_jual || 25000) * 0.45)),
    0
  );
  const antreanPackingCount = penyalurans.filter((p) => p.status === 'proses packing').length;
  const totalEksemplarCetak = productionLogs.reduce((sum, p) => sum + (p.qty_produksi || 0), 0);
  const totalAgenAktif = identitasList.filter((i) => i.is_agen_purna).length;

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, destinationIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);

    if (!isNaN(sourceIndex) && sourceIndex !== destinationIndex) {
      // Find actual card IDs to map between visible cards and full cards list
      const sourceCard = visibleCards[sourceIndex];
      const destCard = visibleCards[destinationIndex];
      if (sourceCard && destCard) {
        const fullSourceIndex = cards.findIndex((c) => c.id === sourceCard.id);
        const fullDestIndex = cards.findIndex((c) => c.id === destCard.id);
        reorderCards(fullSourceIndex, fullDestIndex);
        showToast(`Urutan kartu berhasil dipindahkan ke posisi #${destinationIndex + 1}!`);
      }
    }
    setDragOverIndex(null);
  };

  // Render individual card content based on its unique card ID
  const renderCardContent = (card: DashboardCardConfig) => {
    switch (card.id) {
      case 'card-finance-saldo':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Saldo Bersih Kas
                </span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
                Rp {saldoKasBersih.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">+{totalKasMasuk.toLocaleString('id-ID')}</span>
                <span>/</span>
                <span className="text-rose-500">-{totalKasKeluar.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Kas & Rekening Bank</span>
              <button
                type="button"
                onClick={() => switchDivision(2, 'mutasi')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Keuangan</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-keanggotaan-umat':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Anggota Umat
                </span>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {identitasList.length} <span className="text-xs font-normal text-slate-500">Jiwa</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {identitasList.filter((i) => i.is_dharma_patriot).length} Dharma Patriot / Donatur
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {identitasList.filter((i) => i.jenis_umat === 'Sangha').length} Anggota Sangha
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenIdentitasTab) onOpenIdentitasTab();
                  else switchDivision(1, 'identitas');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Data Umat</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-marketing-invoices':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-cyan-300 dark:hover:border-cyan-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Invoice & Penjualan
                </span>
                <div className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalInvoiceLunas} <span className="text-xs font-normal text-slate-500">/ {orders.length} Lunas</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Omset Rp {totalOmsetPenjualan.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-cyan-600 font-semibold">
                {orders.filter((o) => o.status === 'Pending').length} Pending
              </span>
              <button
                type="button"
                onClick={() => switchDivision(4, 'invoices')}
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Marketing</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-logistik-stok':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Stok Gudang
                </span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalBukuStok} <span className="text-xs font-normal text-slate-500">Eksemplar</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Dari {books.length} judul buku aktif
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Gudang Utama</span>
              <button
                type="button"
                onClick={() => switchDivision(6, 'stok')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Logistik</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-finance-persetujuan':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Persetujuan Cetak
                </span>
                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {pendingPengajuans.length} <span className="text-xs font-normal text-slate-500">Pengajuan Pending</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Total Biaya Rp {totalDanaDiajukan.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{pengajuans.filter((p) => p.status === 'approved').length} Disetujui</span>
              <button
                type="button"
                onClick={() => switchDivision(2, 'persetujuan')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Verifikasi Dana</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-logistik-antrean':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Antrean Packing & Kirim
                </span>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {antreanPackingCount} <span className="text-xs font-normal text-slate-500">Paket Siap Packing</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {penyalurans.filter((p) => p.status === 'dikirim').length} Paket Selesai Dikirim
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Ekspedisi Logistik</span>
              <button
                type="button"
                onClick={() => switchDivision(6, 'antrean')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Antrean Kirim</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-marketing-agen':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Jaringan Agen & Mitra
                </span>
                <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalAgenAktif} <span className="text-xs font-normal text-slate-500">Agen Buku Purna</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {salesChannels?.length || 4} Saluran Penjualan Aktif
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{promos?.length || 0} Kode Promo</span>
              <button
                type="button"
                onClick={() => switchDivision(4, 'channels')}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Kelola Saluran</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-produksi-status':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aktivitas Produksi Cetak
                </span>
                <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
                  <Factory className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalEksemplarCetak.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Eksemplar</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Dari {productionLogs.length} gelombang cetak teregistrasi
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Percetakan Mitra</span>
              <button
                type="button"
                onClick={() => switchDivision(5, 'overview')}
                className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Produksi</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-penerbitan-katalog':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Katalog Penerbitan
                </span>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {books.length} <span className="text-xs font-normal text-slate-500">Judul Buku Terbit</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Nilai Aset Rp {totalNilaiInventaris.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Hak Cipta Lamrim</span>
              <button
                type="button"
                onClick={() => switchDivision(3, 'buku')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Katalog Buku</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      case 'card-annual-report':
        return (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800/80 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Laporan Tahunan Resmi
                </span>
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Tervalidasi <span className="text-xs font-normal text-slate-500">Yayasan</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Konsolidasi kinerja 6 divisi lengkap
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-amber-600 font-semibold">Dewan Pembina</span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAnnualReport) onOpenAnnualReport();
                }}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Report</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Determine grid column classes
  const getGridColsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const currentPresetName = LAYOUT_PRESETS.find((p) => p.id === activePreset)?.name || 'Kustom';

  return (
    <div className="space-y-4">
      {/* Top Configurator Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs backdrop-blur-xs print:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Tata Letak Kartu Divisi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {currentPresetName}
              </span>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                • {visibleCards.length} Kartu Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Prioritaskan metrik divisi yang paling penting bagi peran kerja harian Anda.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Quick inline Drag & Drop mode toggle */}
          <button
            type="button"
            onClick={toggleConfigMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isConfigMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Aktifkan/Nonaktifkan mode drag-and-drop langsung pada grid kartu"
          >
            <Move className="w-3.5 h-3.5" />
            <span>{isConfigMode ? 'Selesai Atur' : 'Atur Urutan (Drag & Drop)'}</span>
          </button>

          {/* Open Full Configurator Modal */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Buka panel Dashboard Layout Configurator lengkap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Configurator</span>
          </button>
        </div>
      </div>

      {/* Interactive Sticky Config Mode Banner */}
      <AnimatePresence>
        {isConfigMode && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-3.5 bg-indigo-50/90 dark:bg-indigo-950/70 border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                <Move className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  Mode Drag & Drop Aktif
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Tahan kartu lalu geser (drag) ke posisi baru untuk mengatur prioritas divisi Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
              {/* Quick preset selector inside edit mode */}
              <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase">Template:</span>
                {LAYOUT_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      applyPreset(p.id);
                      showToast(`Template "${p.name}" diterapkan!`);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activePreset === p.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Reset Default */}
              <button
                type="button"
                onClick={() => {
                  resetToDefault();
                  showToast('Tata letak kartu dikembalikan ke default!');
                }}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
                title="Reset ke urutan default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => setIsConfigMode(false)}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Selesai & Simpan</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      <div className={`grid ${getGridColsClass()} gap-4`}>
        {visibleCards.map((card, index) => {
          return (
            <DashboardCardWrapper
              key={card.id}
              card={card}
              index={index}
              totalCards={visibleCards.length}
              isConfigMode={isConfigMode}
              onMove={(dir) => moveCard(card.id, dir)}
              onToggleVisibility={() => {
                toggleCardVisibility(card.id);
                showToast(`Kartu "${card.title}" disembunyikan.`);
              }}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragTarget={dragOverIndex === index}
            >
              {renderCardContent(card)}
            </DashboardCardWrapper>
          );
        })}
      </div>

      {/* Notice if any cards are currently hidden */}
      {cards.some((c) => !c.visible) && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <span>
              Terdapat <strong>{cards.filter((c) => !c.visible).length} kartu</strong> yang sedang disembunyikan dari dashboard.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Kelola Kartu Tersembunyi ➜
          </button>
        </div>
      )}

      {/* Full Configurator Modal */}
      <DashboardLayoutConfiguratorModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        cards={cards}
        columns={columns}
        activePreset={activePreset}
        onReorder={reorderCards}
        onMoveCard={moveCard}
        onToggleVisibility={toggleCardVisibility}
        onApplyPreset={applyPreset}
        onSetColumns={setColumns}
        onResetToDefault={resetToDefault}
        onEnableInlineDragMode={() => setIsConfigMode(true)}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 pointer-events-none"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
