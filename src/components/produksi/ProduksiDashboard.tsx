import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Book, ProductionLog } from '../../types';
import {
  Factory,
  Plus,
  Layers,
  History,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Trash2,
  BookOpen
} from 'lucide-react';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { DownloadPdfButton } from '../common/DownloadPdfButton';
import { ShareDashboardViewButton } from '../common/ShareDashboardViewButton';
import { DivisionCalendarTodoView } from '../common/DivisionCalendarTodoView';
import { DivisionQuickSearchBar } from '../common/DivisionQuickSearchBar';
import { DivisionWidgetGrid } from '../dashboard-layout/DivisionWidgetGrid';

export const ProduksiDashboard: React.FC = () => {
  const {
    books,
    productionLogs,
    addProductionOutput,
    bulkDeleteProductionLogs,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const activeSubTab = (['overview', 'input', 'logs', 'kalender'].includes(currentSubTab)
    ? currentSubTab
    : 'overview') as 'overview' | 'input' | 'logs' | 'kalender';
  const setActiveSubTab = (tab: 'overview' | 'input' | 'logs' | 'kalender') => setCurrentSubTab(tab);

  const [selectedBookId, setSelectedBookId] = useState<number>(books[0]?.id || 1);
  const [qtyProduksi, setQtyProduksi] = useState<number>(100);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [produksiSearch, setProduksiSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProductionLogs = productionLogs.filter(log => {
    if (!produksiSearch.trim()) return true;
    const q = produksiSearch.toLowerCase();
    const book = books.find(b => b.id === log.buku_id) || log.book;
    const title = book?.judul || `Buku ID #${log.buku_id}`;
    return (
      title.toLowerCase().includes(q) ||
      log.tanggal_produksi.toLowerCase().includes(q) ||
      String(log.qty_produksi).includes(q)
    );
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalProduksiUnit = productionLogs.reduce((sum, p) => sum + p.qty_produksi, 0);

  const handleSelectAllLogs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogIds(productionLogs.map(l => l.id));
    } else {
      setSelectedLogIds([]);
    }
  };

  const handleToggleSelectLog = (id: number) => {
    setSelectedLogIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDeleteLogs = () => {
    if (selectedLogIds.length === 0) return;
    bulkDeleteProductionLogs(selectedLogIds);
    showToast(`✅ Berhasil menghapus ${selectedLogIds.length} catatan log produksi terpilih.`);
    setSelectedLogIds([]);
  };

  const handleProduksiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || qtyProduksi <= 0) {
      showToast('⚠️ Pilih buku dan masukkan jumlah produksi yang valid!');
      return;
    }
    const book = books.find(b => b.id === selectedBookId);
    addProductionOutput(selectedBookId, qtyProduksi);
    setQtyProduksi(100);
    showToast(`🎉 Selesai cetak ${qtyProduksi} eks "${book?.judul || 'Buku'}". Stok gudang bertambah.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintReportHeader
        divisionName="Produksi & Percetakan"
        divisionCode="PRD"
        subTabTitle={
          activeSubTab === 'overview'
            ? 'Pusat Cetak & Ringkasan Produksi'
            : activeSubTab === 'input'
            ? 'Pencatatan Hasil Cetak Eksemplar'
            : activeSubTab === 'kalender'
            ? 'Kalender Kerja & To-Do List Direktorat Produksi'
            : 'Riwayat Batch Log Produksi Percetakan'
        }
      />

      {/* Real-time Division Search Bar (Tasks, Documents & Data Entries) */}
      <DivisionQuickSearchBar
        divisionId={5}
        value={produksiSearch}
        onQueryChange={q => setProduksiSearch(q)}
      />

      {/* React Grid Layout Draggable, Resizable & Hideable Division Widgets */}
      <DivisionWidgetGrid
        divisionId={5}
        onNavigateSubTab={tab => setActiveSubTab(tab as any)}
      />

      {/* Top Banner & Stats - Bento Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Unit Dicetak</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            {totalProduksiUnit.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Eks</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 inline-block">Total batch produksi percetakan</span>
        </div>

        <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul Buku Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            {books.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Judul</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 inline-block">Katalog aktif siap diproduksi</span>
        </div>

        <div className="p-4 sm:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batch Produksi</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
            {productionLogs.length} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Kali Selesai</span>
          </p>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 inline-block">Tercatat di riwayat sistem</span>
        </div>
      </div>

      {/* Sub navigation tabs & Action Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/60 dark:bg-white/[0.05] p-1 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] backdrop-blur-md">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Pusat Cetak & Log</span>
          </button>

          <button
            onClick={() => setActiveSubTab('input')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'input'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Hasil Cetak</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Log ({productionLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('kalender')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'kalender'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender & To-Do</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share Current Dashboard View Deep-Link URL */}
          <ShareDashboardViewButton
            id="btn-share-produksi"
            divisionId={5}
            subTab={activeSubTab}
            label="Share"
          />

          {/* Print Current View Action Button */}
          <PrintCurrentViewButton
            id="btn-print-produksi"
            fallbackFilename={`Laporan_Produksi_${activeSubTab}`}
          />

          {/* Download Current Table View directly as PDF */}
          <DownloadPdfButton
            id="btn-download-pdf-produksi"
            filename={`Laporan_Produksi_${activeSubTab}`}
            tooltip="Unduh tampilan produksi saat ini langsung sebagai file PDF resmi berformat cetak"
          />
        </div>
      </div>

      <div className={activeSubTab === 'overview' ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6"}>
        
        {/* Form Input Hasil Produksi */}
        {(activeSubTab === 'overview' || activeSubTab === 'input') && (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 ${activeSubTab === 'input' ? 'max-w-2xl mx-auto' : ''}`}>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Factory className="w-4 h-4 text-indigo-600" />
              Catat Hasil Cetak Baru
            </h3>
            <p className="text-xs text-slate-500">Input kuantitas eksemplar buku yang telah selesai dicetak & siap masuk gudang.</p>
          </div>

          <form onSubmit={handleProduksiSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pilih Judul Buku</label>
              <select
                value={selectedBookId}
                onChange={e => setSelectedBookId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.judul} (Stok Saat Ini: {b.stok_gudang})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jumlah Eksemplar Selesai (Pcs/Eks)</label>
              <input
                type="number"
                required
                min="1"
                step="10"
                value={qtyProduksi}
                onChange={e => setQtyProduksi(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 text-sm"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Menekan tombol ini akan langsung menambah stok fisik pada database gudang Logistik secara real-time.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Tambah Stok Gudang</span>
            </button>
          </form>
        </div>
        )}

        {/* Riwayat Log Produksi */}
        {(activeSubTab === 'overview' || activeSubTab === 'logs') && (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 ${activeSubTab === 'overview' ? 'lg:col-span-2' : 'w-full'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Riwayat Hasil Produksi & Cetak
              </h3>
              <p className="text-xs text-slate-500">Daftar buku yang telah dicetak dan masuk ke inventaris gudang.</p>
            </div>
            {selectedLogIds.length > 0 && (
              <button
                onClick={handleBulkDeleteLogs}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Log Terpilih ({selectedLogIds.length})</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllLogs}
                      checked={selectedLogIds.length === productionLogs.length && productionLogs.length > 0}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="p-3">Tanggal Produksi</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3 text-center">Jumlah Selesai</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProductionLogs.map((log) => {
                  const book = books.find(b => b.id === log.buku_id) || log.book;
                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                        selectedLogIds.includes(log.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLogIds.includes(log.id)}
                          onChange={() => handleToggleSelectLog(log.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.tanggal_produksi}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{book?.judul || `Buku ID #${log.buku_id}`}</td>
                      <td className="p-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{log.qty_produksi} Eks
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold">
                          Masuk Gudang
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* KALENDER & TO-DO LIST PRODUKSI SUB TAB */}
        {activeSubTab === 'kalender' && (
          <DivisionCalendarTodoView divisionId={5} />
        )}

      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold rounded-xl shadow-2xl border border-teal-500/40 animate-fade-in flex items-center space-x-2 pointer-events-auto">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
