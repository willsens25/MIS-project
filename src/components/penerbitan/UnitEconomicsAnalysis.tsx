import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calculator,
  Download,
  Search,
  Filter,
  Edit3,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  HelpCircle,
  Percent,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { DownloadPdfButton } from '../common/DownloadPdfButton';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { RupiahInput } from '../common/RupiahInput';

interface UnitEconomicRow {
  id: number;
  judul: string;
  penulis: string;
  isbn?: string;
  kategori: string;
  harga_jual: number;
  biaya_pokok: number;
  margin_unit: number;
  margin_percent: number;
  total_cetak: number;
  total_terjual: number;
  stok_gudang: number;
  total_modal_cetak: number;
  total_omset: number;
  laba_kotor: number;
  gross_margin_percent: number;
  arus_kas_bersih: number;
  recovery_rate_percent: number;
  bep_units: number;
  sisa_bep_units: number;
  potensi_sisa_omset: number;
  potensi_sisa_laba: number;
  status_bep: 'Lunas Modal (+Surplus)' | 'Mendekati BEP' | 'Dalam Distribusi' | 'Baru Terbit';
  velocity: 'Fast Moving' | 'Moderate' | 'Slow Moving';
}

export const UnitEconomicsAnalysis: React.FC = () => {
  const {
    books,
    orders,
    productionLogs,
    pengajuans,
    updateBookCost,
    ajukanCetak
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'margin_percent' | 'total_omset' | 'laba_kotor' | 'recovery_rate_percent' | 'stok_gudang'>('total_omset');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Quick edit HPP modal
  const [editingBookHpp, setEditingBookHpp] = useState<Book | null>(null);
  const [newHppValue, setNewHppValue] = useState<number>(0);

  // Reprint Simulator state
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorBookId, setSimulatorBookId] = useState<number>(books[0]?.id || 0);
  const [simulatorOplah, setSimulatorOplah] = useState<number>(500);
  const [simulatorTotalCost, setSimulatorTotalCost] = useState<number>(17500000);
  const [simulationTargetMargin, setSimulationTargetMargin] = useState<number>(60);
  const [simulatorToast, setSimulatorToast] = useState<string | null>(null);

  // Compute unit economic data for all books
  const economicData: UnitEconomicRow[] = useMemo(() => {
    return books.map((book) => {
      const hpp = book.biaya_pokok !== undefined && book.biaya_pokok > 0
        ? book.biaya_pokok
        : Math.round(book.harga_jual * 0.4);

      // Sold units from paid orders
      const soldQty = orders
        .filter((o) => o.status === 'Lunas')
        .reduce((sum, order) => {
          const item = order.items?.find((i) => i.buku_id === book.id);
          return sum + (item?.jumlah || 0);
        }, 0);

      // Realized revenue from paid orders
      const bookRevenue = orders
        .filter((o) => o.status === 'Lunas')
        .reduce((sum, order) => {
          const item = order.items?.find((i) => i.buku_id === book.id);
          if (!item) return sum;
          return sum + (item.subtotal || item.jumlah * book.harga_jual);
        }, 0);

      // Production log total
      const prodLogged = productionLogs
        .filter((p) => p.buku_id === book.id)
        .reduce((sum, p) => sum + (p.qty_produksi || 0), 0);

      // Approved print proposals
      const approvedPengajuan = pengajuans
        .filter((p) => p.buku_id === book.id && p.status === 'approved')
        .reduce((sum, p) => sum + (p.jumlah_pengajuan || 0), 0);

      // Total copies published/printed (accounting for stock + sold or logged production)
      const totalCetak = Math.max(prodLogged, approvedPengajuan, book.stok_gudang + soldQty, 100);

      const marginUnit = book.harga_jual - hpp;
      const marginPercent = book.harga_jual > 0 ? Math.round((marginUnit / book.harga_jual) * 100) : 0;
      const totalModalCetak = totalCetak * hpp;
      const cogsTerjual = soldQty * hpp;
      const labaKotor = bookRevenue - cogsTerjual;
      const grossMarginPercent = bookRevenue > 0 ? Math.round((labaKotor / bookRevenue) * 100) : marginPercent;
      const arusKasBersih = bookRevenue - totalModalCetak;
      const recoveryRatePercent = totalModalCetak > 0 ? Math.round((bookRevenue / totalModalCetak) * 100) : 0;
      const bepUnits = book.harga_jual > 0 ? Math.ceil(totalModalCetak / book.harga_jual) : 0;
      const sisaBepUnits = Math.max(0, bepUnits - soldQty);

      let statusBep: UnitEconomicRow['status_bep'] = 'Dalam Distribusi';
      if (recoveryRatePercent >= 100) {
        statusBep = 'Lunas Modal (+Surplus)';
      } else if (recoveryRatePercent >= 70) {
        statusBep = 'Mendekati BEP';
      } else if (soldQty === 0) {
        statusBep = 'Baru Terbit';
      }

      let velocity: UnitEconomicRow['velocity'] = 'Moderate';
      if (soldQty >= 10 || (totalCetak > 0 && (soldQty / totalCetak) >= 0.35)) {
        velocity = 'Fast Moving';
      } else if (soldQty <= 2 && book.stok_gudang > 30) {
        velocity = 'Slow Moving';
      }

      return {
        id: book.id,
        judul: book.judul,
        penulis: book.penulis,
        isbn: book.isbn,
        kategori: book.kategori || 'Umum',
        harga_jual: book.harga_jual,
        biaya_pokok: hpp,
        margin_unit: marginUnit,
        margin_percent: marginPercent,
        total_cetak: totalCetak,
        total_terjual: soldQty,
        stok_gudang: book.stok_gudang,
        total_modal_cetak: totalModalCetak,
        total_omset: bookRevenue,
        laba_kotor: labaKotor,
        gross_margin_percent: grossMarginPercent,
        arus_kas_bersih: arusKasBersih,
        recovery_rate_percent: recoveryRatePercent,
        bep_units: bepUnits,
        sisa_bep_units: sisaBepUnits,
        potensi_sisa_omset: book.stok_gudang * book.harga_jual,
        potensi_sisa_laba: book.stok_gudang * marginUnit,
        status_bep: statusBep,
        velocity
      };
    });
  }, [books, orders, productionLogs, pengajuans]);

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    const totalOmset = economicData.reduce((acc, row) => acc + row.total_omset, 0);
    const totalModalCetak = economicData.reduce((acc, row) => acc + row.total_modal_cetak, 0);
    const totalCogsTerjual = economicData.reduce((acc, row) => acc + (row.total_terjual * row.biaya_pokok), 0);
    const totalLabaKotor = totalOmset - totalCogsTerjual;
    const avgMarginPercent = economicData.length > 0
      ? Math.round(economicData.reduce((acc, row) => acc + row.margin_percent, 0) / economicData.length)
      : 0;
    const totalPotensiSisaOmset = economicData.reduce((acc, row) => acc + row.potensi_sisa_omset, 0);
    const totalPotensiSisaLaba = economicData.reduce((acc, row) => acc + row.potensi_sisa_laba, 0);
    const countLunasModal = economicData.filter((r) => r.status_bep === 'Lunas Modal (+Surplus)').length;
    const countMendekatiBep = economicData.filter((r) => r.status_bep === 'Mendekati BEP').length;
    const countSlowMoving = economicData.filter((r) => r.velocity === 'Slow Moving').length;

    return {
      totalOmset,
      totalModalCetak,
      totalLabaKotor,
      avgMarginPercent,
      totalPotensiSisaOmset,
      totalPotensiSisaLaba,
      countLunasModal,
      countMendekatiBep,
      countSlowMoving
    };
  }, [economicData]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.kategori) set.add(b.kategori);
    });
    return Array.from(set);
  }, [books]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return economicData
      .filter((row) => {
        const matchQuery =
          row.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.penulis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (row.isbn && row.isbn.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchCategory = categoryFilter === 'ALL' || row.kategori === categoryFilter;
        const matchStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'BEP' && row.status_bep === 'Lunas Modal (+Surplus)') ||
          (statusFilter === 'NEAR_BEP' && row.status_bep === 'Mendekati BEP') ||
          (statusFilter === 'SLOW' && row.velocity === 'Slow Moving');

        return matchQuery && matchCategory && matchStatus;
      })
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [economicData, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Chart Data: Top 7 Titles by Revenue vs Production Cost
  const chartData = useMemo(() => {
    return [...economicData]
      .sort((a, b) => b.total_omset - a.total_omset)
      .slice(0, 7)
      .map((item) => ({
        name: item.judul.length > 20 ? `${item.judul.substring(0, 18)}...` : item.judul,
        fullJudul: item.judul,
        omset: item.total_omset,
        modalCetak: item.total_modal_cetak,
        labaKotor: item.laba_kotor,
        recoveryRate: item.recovery_rate_percent,
        marginPercent: item.margin_percent
      }));
  }, [economicData]);

  // Handle Quick Edit HPP
  const handleOpenHppEdit = (bookId: number) => {
    const target = books.find((b) => b.id === bookId);
    if (!target) return;
    setEditingBookHpp(target);
    setNewHppValue(target.biaya_pokok || Math.round(target.harga_jual * 0.4));
  };

  const handleSaveHpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookHpp || newHppValue <= 0) return;
    updateBookCost(editingBookHpp.id, newHppValue);
    setEditingBookHpp(null);
  };

  // Reprint Simulator Calculations
  const simulationResult = useMemo(() => {
    const selectedBook = books.find((b) => b.id === simulatorBookId) || books[0];
    if (!selectedBook || simulatorOplah <= 0 || simulatorTotalCost <= 0) {
      return null;
    }

    const hppBaru = Math.round(simulatorTotalCost / simulatorOplah);
    // Recommended retail price with target margin: Retail = HPP / (1 - targetMargin/100)
    const marginRatio = Math.min(0.85, Math.max(0.2, simulationTargetMargin / 100));
    const hargaJualRekomendasi = Math.round((hppBaru / (1 - marginRatio)) / 1000) * 1000;
    
    // Units needed for BEP at recommended retail price
    const bepUnitsRekomendasi = Math.ceil(simulatorTotalCost / hargaJualRekomendasi);
    // Units needed for BEP at current retail price
    const bepUnitsCurrent = selectedBook.harga_jual > 0
      ? Math.ceil(simulatorTotalCost / selectedBook.harga_jual)
      : 0;

    // Revenue and profit projections at current retail price
    const revenue100 = simulatorOplah * selectedBook.harga_jual;
    const profit100 = revenue100 - simulatorTotalCost;
    const revenue75 = Math.round(simulatorOplah * 0.75) * selectedBook.harga_jual;
    const profit75 = revenue75 - simulatorTotalCost;
    const revenue50 = Math.round(simulatorOplah * 0.5) * selectedBook.harga_jual;
    const profit50 = revenue50 - simulatorTotalCost;

    return {
      selectedBook,
      hppBaru,
      hargaJualRekomendasi,
      bepUnitsRekomendasi,
      bepUnitsCurrent,
      revenue100,
      profit100,
      revenue75,
      profit75,
      revenue50,
      profit50
    };
  }, [books, simulatorBookId, simulatorOplah, simulatorTotalCost, simulationTargetMargin]);

  const handleAjukanFromSimulator = () => {
    if (!simulationResult) return;
    ajukanCetak(simulationResult.selectedBook.id, simulatorOplah);
    setSimulatorToast(`Pengajuan cetak ${simulatorOplah} eks "${simulationResult.selectedBook.judul}" berhasil dikirim ke Finance!`);
    setTimeout(() => setSimulatorToast(null), 4000);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID Buku',
      'Judul Buku',
      'Penulis',
      'Kategori',
      'ISBN',
      'Harga Jual (Rp)',
      'HPP / Biaya Cetak (Rp)',
      'Margin Unit (Rp)',
      'Margin Unit (%)',
      'Total Eksemplar Cetak',
      'Total Terjual (Eks)',
      'Stok Gudang (Eks)',
      'Total Modal Cetak (Rp)',
      'Total Omset Penjualan (Rp)',
      'Laba Kotor Terealisasi (Rp)',
      'Gross Margin (%)',
      'Arus Kas Bersih (Rp)',
      'Tingkat Pemulihan Modal (%)',
      'Titik Impas / BEP (Eks)',
      'Sisa Eksemplar ke BEP',
      'Potensi Omset Sisa Stok (Rp)',
      'Potensi Laba Sisa Stok (Rp)',
      'Status BEP',
      'Kecepatan Perputaran'
    ];

    const rows = economicData.map((r) => [
      r.id,
      `"${r.judul.replace(/"/g, '""')}"`,
      `"${r.penulis.replace(/"/g, '""')}"`,
      `"${r.kategori}"`,
      `"${r.isbn || '-'}"`,
      r.harga_jual,
      r.biaya_pokok,
      r.margin_unit,
      `${r.margin_percent}%`,
      r.total_cetak,
      r.total_terjual,
      r.stok_gudang,
      r.total_modal_cetak,
      r.total_omset,
      r.laba_kotor,
      `${r.gross_margin_percent}%`,
      r.arus_kas_bersih,
      `${r.recovery_rate_percent}%`,
      r.bep_units,
      r.sisa_bep_units,
      r.potensi_sisa_omset,
      r.potensi_sisa_laba,
      `"${r.status_bep}"`,
      `"${r.velocity}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Analisis_Unit_Ekonomi_Buku_Lamrimnesia_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <PieChart className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold tracking-tight">
              Analisis Unit Ekonomi Buku & Margin Laba
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              HPP & Profitability
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 max-w-2xl">
            Evaluasi komprehensif efisiensi biaya cetak, margin kotor per judul, perputaran modal, titik impas (Break-Even Point), dan potensi sisa stok naskah dharma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reprint Simulator Toggle */}
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              showSimulator
                ? 'bg-amber-400 text-slate-900 shadow-sm font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{showSimulator ? 'Tutup Simulator' : 'Kalkulator Cetak Ulang'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all"
            title="Ekspor data lengkap ke CSV"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          {/* Direct PDF Download */}
          <DownloadPdfButton
            id="btn-download-pdf-unit-economics"
            filename={`Analisis_Unit_Ekonomi_Buku_Lamrimnesia_${new Date().toISOString().slice(0, 10)}`}
            tooltip="Unduh analisis unit ekonomi naskah sebagai file PDF resmi"
          />

          {/* Print Button */}
          <PrintCurrentViewButton
            id="btn-print-unit-economics"
            fallbackFilename="Analisis_Unit_Ekonomi_Buku"
          />
        </div>
      </div>

      {/* Toast Notification */}
      {simulatorToast && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{simulatorToast}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Omset Penjualan</span>
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            Rp {aggregateMetrics.totalOmset.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Lunas
            </span>
            <span>dari pesanan selesai</span>
          </div>
        </div>

        {/* Laba Kotor & Gross Margin */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Laba Kotor Terealisasi</span>
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            Rp {aggregateMetrics.totalLabaKotor.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Rata-rata Margin Jual:</span>
            <span className="font-bold text-slate-900 dark:text-white">{aggregateMetrics.avgMarginPercent}%</span>
          </div>
        </div>

        {/* Modal Cetak Terinvestasi */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Modal Percetakan</span>
            <span className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            Rp {aggregateMetrics.totalModalCetak.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Status Balik Modal:</span>
            <span className="font-semibold text-emerald-600">
              {aggregateMetrics.countLunasModal} Judul Lunas
            </span>
          </div>
        </div>

        {/* Potensi Sisa Stok */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Valuasi Potensi Sisa Stok</span>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">
            Rp {aggregateMetrics.totalPotensiSisaOmset.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Potensi Laba Sisa:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Rp {aggregateMetrics.totalPotensiSisaLaba.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* REPRINT & BEP SIMULATOR SECTION */}
      {showSimulator && (
        <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-50 to-indigo-50/20 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-amber-400/40 dark:border-amber-500/30 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-amber-500 text-slate-900 rounded-lg font-black">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kalkulator Simulasi Cetak Ulang & Titik Impas (BEP)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Simulasikan dampak oplah cetak, estimasi tagihan percetakan, dan margin harga jual sebelum mengajukan anggaran ke Bendahara.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSimulator(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕ Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {/* Input 1: Judul Buku */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih Judul Buku
              </label>
              <select
                value={simulatorBookId}
                onChange={(e) => setSimulatorBookId(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul} (Jual: Rp {b.harga_jual.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {/* Input 2: Rencana Oplah */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rencana Oplah Cetak
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={simulatorOplah}
                  onChange={(e) => setSimulatorOplah(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs p-2.5 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Eks</span>
              </div>
            </div>

            {/* Input 3: Total Biaya Percetakan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estimasi Total Biaya Cetak
              </label>
              <RupiahInput
                value={simulatorTotalCost}
                onChange={(val) => setSimulatorTotalCost(val)}
                placeholder="Contoh: 10.000.000"
                className="text-xs"
              />
            </div>

            {/* Input 4: Target Margin */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Margin Keuntungan
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="85"
                  step="5"
                  value={simulationTargetMargin}
                  onChange={(e) => setSimulationTargetMargin(Number(e.target.value))}
                  className="w-full text-xs p-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Cards */}
          {simulationResult && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Hasil 1: HPP Baru */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">HPP / Biaya Pokok Baru:</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  Rp {simulationResult.hppBaru.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  per eksemplar buku
                </span>
              </div>

              {/* Hasil 2: Rekomendasi Harga Jual */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Rekomendasi Harga Jual ({simulationTargetMargin}%):</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  Rp {simulationResult.hargaJualRekomendasi.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  (Saat ini: Rp {simulationResult.selectedBook.harga_jual.toLocaleString('id-ID')})
                </span>
              </div>

              {/* Hasil 3: Titik Impas (BEP) */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Titik Impas (BEP Satuan):</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {simulationResult.bepUnitsCurrent} Eks
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round((simulationResult.bepUnitsCurrent / simulatorOplah) * 100)}% dari oplah)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Balik modal jika terjual {simulationResult.bepUnitsCurrent} eks
                </span>
              </div>

              {/* Action: Ajukan Anggaran */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 block">
                    Proyeksi Laba Bersih (100%):
                  </span>
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                    +Rp {simulationResult.profit100.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAjukanFromSimulator}
                  className="mt-2 w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ajukan Cetak ({simulatorOplah} Eks)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Charts: Top Books Omset vs Production Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart: Omset vs Production Cost */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Komparasi Omset Penjualan vs Modal Cetak (Top 7 Judul)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Memperlihatkan perbandingan dana produksi yang dialokasikan vs penerimaan kas penjualan.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `Rp ${Number(val).toLocaleString('id-ID')}`,
                    name === 'omset' ? 'Omset Penjualan' : name === 'modalCetak' ? 'Modal Cetak' : 'Laba Kotor'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? item.fullJudul : label;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  formatter={(val) => (val === 'omset' ? 'Omset Penjualan' : val === 'modalCetak' ? 'Modal Cetak' : 'Laba Kotor')}
                />
                <Bar dataKey="modalCetak" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="omset" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="labaKotor" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status BEP & Distribution Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Status Pengembalian Modal (BEP)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Progres penutupan biaya produksi dari hasil penjualan buku.
            </p>
          </div>

          <div className="space-y-3 my-auto">
            {/* Lunas Modal */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Lunas Modal (+Surplus)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {aggregateMetrics.countLunasModal} Judul ({economicData.length > 0 ? Math.round((aggregateMetrics.countLunasModal / economicData.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{
                    width: `${economicData.length > 0 ? (aggregateMetrics.countLunasModal / economicData.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Mendekati BEP */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Mendekati BEP (&gt;70%)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {aggregateMetrics.countMendekatiBep} Judul ({economicData.length > 0 ? Math.round((aggregateMetrics.countMendekatiBep / economicData.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${economicData.length > 0 ? (aggregateMetrics.countMendekatiBep / economicData.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Slow Moving Need Promotion */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Perlu Dorongan Promosi (Slow)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {aggregateMetrics.countSlowMoving} Judul
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{
                    width: `${economicData.length > 0 ? (aggregateMetrics.countSlowMoving / economicData.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 space-y-1 border border-slate-200/60 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">💡 Rekomendasi Manajerial:</span>
            <p>
              Buku berstatus <em>Lunas Modal</em> dapat dipertimbangkan untuk subsidi silang ke naskah langka atau cetak edisi donasi massal.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul buku, penulis, atau ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Status BEP</option>
            <option value="BEP">Lunas Modal (+Surplus)</option>
            <option value="NEAR_BEP">Mendekati BEP (&gt;70%)</option>
            <option value="SLOW">Slow Moving</option>
          </select>

          {/* Sorting */}
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="total_omset">Urutkan: Total Omset</option>
              <option value="laba_kotor">Urutkan: Laba Kotor</option>
              <option value="margin_percent">Urutkan: Margin (%)</option>
              <option value="recovery_rate_percent">Urutkan: % BEP</option>
              <option value="stok_gudang">Urutkan: Sisa Stok</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              title="Ganti Urutan (Naik/Turun)"
            >
              {sortOrder === 'desc' ? '⬇' : '⬆'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Unit Economics Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Unit Ekonomi Judul Buku ({filteredData.length} Judul)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Klik tombol pensil pada HPP untuk menyesuaikan biaya cetak satuan riil
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Judul & Penulis</th>
                <th className="py-3 px-2 text-right">Harga Jual</th>
                <th className="py-3 px-2 text-right">HPP / Biaya Cetak</th>
                <th className="py-3 px-2 text-center">Margin %</th>
                <th className="py-3 px-2 text-center">Cetak / Terjual / Stok</th>
                <th className="py-3 px-2 text-right">Modal Cetak</th>
                <th className="py-3 px-2 text-right">Omset Penjualan</th>
                <th className="py-3 px-2 text-right">Laba Kotor</th>
                <th className="py-3 px-2 text-center">Tingkat BEP</th>
                <th className="py-3 px-3 text-center">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada data buku yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Judul & Penulis */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {row.judul}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>{row.penulis}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">
                          {row.kategori}
                        </span>
                      </div>
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3 px-2 text-right font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      Rp {row.harga_jual.toLocaleString('id-ID')}
                    </td>

                    {/* HPP (Editable) */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1 justify-end">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Rp {row.biaya_pokok.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenHppEdit(row.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Ubah HPP / Biaya Cetak Satuan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Margin % */}
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.margin_percent >= 60
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : row.margin_percent >= 40
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {row.margin_percent}%
                      </span>
                    </td>

                    {/* Cetak / Terjual / Stok */}
                    <td className="py-3 px-2 text-center text-[11px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.total_terjual} <span className="text-slate-400 font-normal">/ {row.total_cetak} Eks</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sisa: <span className="font-bold text-indigo-600 dark:text-indigo-400">{row.stok_gudang}</span> eks
                      </div>
                    </td>

                    {/* Total Modal Cetak */}
                    <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      Rp {row.total_modal_cetak.toLocaleString('id-ID')}
                    </td>

                    {/* Omset Penjualan */}
                    <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      Rp {row.total_omset.toLocaleString('id-ID')}
                    </td>

                    {/* Laba Kotor */}
                    <td className="py-3 px-2 text-right whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {row.laba_kotor.toLocaleString('id-ID')}
                    </td>

                    {/* Tingkat BEP (Progress Bar) */}
                    <td className="py-3 px-2 text-center min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {row.recovery_rate_percent}%
                        </span>
                        <span className="text-slate-400">
                          {row.sisa_bep_units === 0 ? 'Surplus' : `-${row.sisa_bep_units} eks`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            row.recovery_rate_percent >= 100
                              ? 'bg-emerald-500'
                              : row.recovery_rate_percent >= 70
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, row.recovery_rate_percent)}%` }}
                        />
                      </div>
                    </td>

                    {/* Status & Quick Action */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            row.status_bep === 'Lunas Modal (+Surplus)'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : row.status_bep === 'Mendekati BEP'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {row.status_bep}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSimulatorBookId(row.id);
                            setShowSimulator(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium transition-colors"
                          title="Simulasikan Cetak Ulang Buku Ini"
                        >
                          Simulasi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK EDIT HPP MODAL */}
      {editingBookHpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sesuaikan HPP / Biaya Cetak Satuan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBookHpp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Judul Buku:</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {editingBookHpp.judul}
              </div>
              <div className="text-xs text-slate-500">
                Harga Jual Saat Ini: <span className="font-semibold text-slate-800 dark:text-slate-200">Rp {editingBookHpp.harga_jual.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <form onSubmit={handleSaveHpp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  HPP / Biaya Cetak per Eksemplar (Rp)
                </label>
                <RupiahInput
                  value={newHppValue}
                  onChange={(val) => setNewHppValue(val)}
                  placeholder="Contoh: 45.000"
                  required
                  allowZero={false}
                />
              </div>

              {/* Instant calculation preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Margin Satuan:</span>
                  <span className="font-bold text-emerald-600">
                    Rp {(editingBookHpp.harga_jual - newHppValue).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Margin Persentase:</span>
                  <span className="font-bold text-indigo-600">
                    {editingBookHpp.harga_jual > 0 ? Math.round(((editingBookHpp.harga_jual - newHppValue) / editingBookHpp.harga_jual) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBookHpp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Simpan Perubahan HPP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
