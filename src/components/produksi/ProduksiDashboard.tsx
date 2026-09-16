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
  Trash2
} from 'lucide-react';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { DownloadPdfButton } from '../common/DownloadPdfButton';

export const ProduksiDashboard: React.FC = () => {
  const {
    books,
    productionLogs,
    addProductionOutput,
    bulkDeleteProductionLogs,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const activeSubTab = (['overview', 'input', 'logs'].includes(currentSubTab)
    ? currentSubTab
    : 'overview') as 'overview' | 'input' | 'logs';
  const setActiveSubTab = (tab: 'overview' | 'input' | 'logs') => setCurrentSubTab(tab);

  const [selectedBookId, setSelectedBookId] = useState<number>(books[0]?.id || 1);
  const [qtyProduksi, setQtyProduksi] = useState<number>(100);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
            : 'Riwayat Batch Log Produksi Percetakan'
        }
      />

      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Unit Dicetak</span>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {totalProduksiUnit} <span className="text-xs text-slate-500">Eksemplar</span>
          </p>
          <span className="text-[11px] text-slate-400">Total batch produksi pabrikasi</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Judul Buku Aktif</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {books.length} <span className="text-xs text-slate-500">Judul</span>
          </p>
          <span className="text-[11px] text-slate-400">Tersedia untuk percetakan</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Batch Produksi Tercatat</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {productionLogs.length} <span className="text-xs text-slate-500">Kali Selesai</span>
          </p>
          <span className="text-[11px] text-slate-400">Tercatat di sistem</span>
        </div>
      </div>

      {/* Sub tabs selector & Print action */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Pusat Cetak & Log</span>
          </button>

          <button
            onClick={() => setActiveSubTab('input')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'input'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Hasil Cetak</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Log Produksi ({productionLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
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
                {productionLogs.map((log) => {
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

      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold rounded-xl shadow-2xl border border-teal-500/40 animate-fade-in flex items-center space-x-2 pointer-events-auto">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
