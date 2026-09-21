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
  EyeOff,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Sparkles,
  LayoutGrid,
  Database,
  Save
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
    density,
    lastSaved,
    lastSavedDisplay,
    storageKey,
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
    setDensity,
    resetToDefault,
    persistToLocalStorage,
    exportConfigJson,
    importConfigJson
  } = useDashboardLayout({
    userId: currentUser.id,
    userName: currentUser.name,
    userDivisiId: currentUser.divisi_id
  });

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
  // Render individual card content based on its unique card ID in Modern Bento Studio style
  const renderCardContent = (card: DashboardCardConfig) => {
    switch (card.id) {
      case 'card-finance-saldo':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Saldo Bersih Kas
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                Rp {saldoKasBersih.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-mono font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  +{totalKasMasuk.toLocaleString('id-ID')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10.5px] font-mono font-semibold border border-rose-200/60 dark:border-rose-800/50">
                  -{totalKasKeluar.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">Kas & Rekening Bank</span>
              <button
                type="button"
                onClick={() => switchDivision(2, 'mutasi')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Buka Keuangan</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-keanggotaan-umat':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Total Anggota Umat
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {identitasList.length} <span className="text-xs font-medium text-slate-400 font-sans">Jiwa</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-medium border border-indigo-200/60 dark:border-indigo-800/50">
                  {identitasList.filter((i) => i.is_dharma_patriot).length} Dharma Patriot
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">
                {identitasList.filter((i) => i.jenis_umat === 'Sangha').length} Anggota Sangha
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenIdentitasTab) onOpenIdentitasTab();
                  else switchDivision(1, 'identitas');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Data Umat</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-marketing-invoices':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Invoice & Penjualan
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {totalInvoiceLunas} <span className="text-xs font-medium text-slate-400 font-sans">/ {orders.length} Lunas</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10.5px] font-mono font-medium border border-cyan-200/60 dark:border-cyan-800/50">
                  Omset Rp {totalOmsetPenjualan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold font-mono text-[11px]">
                {orders.filter((o) => o.status === 'Pending').length} Pending
              </span>
              <button
                type="button"
                onClick={() => switchDivision(4, 'invoices')}
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Buka Marketing</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-logistik-stok':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Total Stok Gudang
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {totalBukuStok.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-400 font-sans">Eks</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10.5px] font-medium border border-amber-200/60 dark:border-amber-800/50">
                  {books.length} judul buku aktif
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">Gudang Pusat</span>
              <button
                type="button"
                onClick={() => switchDivision(6, 'stok')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Buka Logistik</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-finance-persetujuan':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Persetujuan Cetak
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {pendingPengajuans.length} <span className="text-xs font-medium text-rose-500 font-sans">Pending</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10.5px] font-mono font-medium border border-rose-200/60 dark:border-rose-800/50">
                  Total Biaya Rp {totalDanaDiajukan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">{pengajuans.filter((p) => p.status === 'approved').length} Disetujui</span>
              <button
                type="button"
                onClick={() => switchDivision(2, 'persetujuan')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Verifikasi SPK</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-logistik-antrean':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Antrean Packing & Kirim
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {antreanPackingCount} <span className="text-xs font-medium text-slate-400 font-sans">Paket</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10.5px] font-medium border border-blue-200/60 dark:border-blue-800/50">
                  {penyalurans.filter((p) => p.status === 'dikirim').length} selesai dikirim
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">Ekspedisi Logistik</span>
              <button
                type="button"
                onClick={() => switchDivision(6, 'antrean')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Antrean Kirim</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-marketing-agen':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Jaringan Agen & Mitra
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {totalAgenAktif} <span className="text-xs font-medium text-slate-400 font-sans">Agen Purna</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10.5px] font-medium border border-purple-200/60 dark:border-purple-800/50">
                  {salesChannels?.length || 4} Saluran Penjualan Aktif
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">{promos?.length || 0} Kode Promo</span>
              <button
                type="button"
                onClick={() => switchDivision(4, 'channels')}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Kelola Saluran</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-produksi-status':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Aktivitas Produksi Cetak
                </span>
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Factory className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {totalEksemplarCetak.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-400 font-sans">Eks</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[10.5px] font-medium border border-violet-200/60 dark:border-violet-800/50">
                  {productionLogs.length} gelombang cetak
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">Mitra Percetakan</span>
              <button
                type="button"
                onClick={() => switchDivision(5, 'overview')}
                className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Buka Produksi</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-penerbitan-katalog':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Katalog Penerbitan
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                {books.length} <span className="text-xs font-medium text-slate-400 font-sans">Judul Terbit</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-mono font-medium border border-indigo-200/60 dark:border-indigo-800/50">
                  Nilai Aset Rp {totalNilaiInventaris.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 font-medium">Hak Cipta Lamrim</span>
              <button
                type="button"
                onClick={() => switchDivision(3, 'buku')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Katalog Buku</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'card-annual-report':
        return (
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800/80 transition-all h-full flex flex-col justify-between group backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Laporan Tahunan Resmi
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 mt-3">
                Tervalidasi <span className="text-xs font-medium text-amber-600 dark:text-amber-400 font-sans">Yayasan</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10.5px] font-medium border border-amber-200/60 dark:border-amber-800/50">
                  Konsolidasi 6 divisi terpadu
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Dewan Pembina</span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAnnualReport) onOpenAnnualReport();
                }}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer group/link"
              >
                <span>Buka Report</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
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
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Tata Letak Kartu Divisi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {currentPresetName}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 cursor-default"
                title={`Preferensi tersimpan di LocalStorage browser (${storageKey}) untuk akun ${currentUser.name}`}
              >
                <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Tersimpan di LocalStorage</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden lg:inline">
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
      <motion.div
        layout
        transition={{ layout: { type: 'spring', damping: 28, stiffness: 320 } }}
        className={`grid ${getGridColsClass()} ${density === 'compact' ? 'gap-3' : 'gap-4'}`}
      >
        <AnimatePresence mode="popLayout">
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
                  showToast(`Kartu "${card.title}" disembunyikan & disimpan.`);
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

          {visibleCards.length === 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full p-8 text-center bg-white/80 dark:bg-slate-900/80 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl"
            >
              <EyeOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Semua kartu sedang disembunyikan</p>
              <p className="text-xs text-slate-500 mt-1">Buka Configurator atau klik Reset Default untuk memunculkan kembali metrik dashboard.</p>
              <button
                type="button"
                onClick={() => {
                  resetToDefault();
                  showToast('Tata letak kartu dikembalikan ke default!');
                }}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Tata Letak Standar</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
        density={density}
        lastSaved={lastSaved}
        storageKey={storageKey}
        userName={currentUser.name}
        onReorder={reorderCards}
        onMoveCard={moveCard}
        onToggleVisibility={toggleCardVisibility}
        onApplyPreset={applyPreset}
        onSetColumns={setColumns}
        onSetDensity={setDensity}
        onResetToDefault={resetToDefault}
        onEnableInlineDragMode={() => setIsConfigMode(true)}
        onExportConfig={exportConfigJson}
        onImportConfig={importConfigJson}
        onSaveExplicit={() => {
          persistToLocalStorage();
          showToast('Preferensi tata letak disimpan ke LocalStorage!');
        }}
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
