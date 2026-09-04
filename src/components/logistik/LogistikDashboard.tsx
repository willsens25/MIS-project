import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Penyaluran, LogisticLog, Book } from '../../types';
import {
  Truck,
  Package,
  CheckCircle2,
  Printer,
  History,
  Send,
  AlertTriangle,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { SuratJalanPrintModal } from '../modals/SuratJalanPrintModal';

export const LogistikDashboard: React.FC = () => {
  const {
    penyalurans,
    logisticLogs,
    bulkDeleteLogisticLogs,
    bulkDeletePenyalurans,
    books,
    dispatchShipment,
    addManualLogisticLog,
    orders
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'antrean' | 'manual' | 'logs'>('antrean');

  // Bulk delete selection states
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [selectedInvoiceNos, setSelectedInvoiceNos] = useState<string[]>([]);

  // Surat Jalan Print Modal
  const [printingInvoiceNo, setPrintingInvoiceNo] = useState<string | null>(null);

  // Manual Dispatch Form
  const [manualBookId, setManualBookId] = useState<number>(books[0]?.id || 1);
  const [manualQty, setManualQty] = useState<number>(5);
  const [manualTujuan, setManualTujuan] = useState('');
  const [manualKeterangan, setManualKeterangan] = useState('');

  // Group pending packing items by invoice number
  const pendingPacking = penyalurans.filter(p => p.status === 'proses packing');
  const groupedInvoices: Record<string, Penyaluran[]> = {};
  
  pendingPacking.forEach(item => {
    if (!groupedInvoices[item.no_invoice]) {
      groupedInvoices[item.no_invoice] = [];
    }
    groupedInvoices[item.no_invoice].push(item);
  });

  const availableInvoiceNos = Object.keys(groupedInvoices);

  // Handlers for Antrean bulk delete
  const handleToggleSelectInvoice = (invNo: string) => {
    setSelectedInvoiceNos(prev =>
      prev.includes(invNo) ? prev.filter(item => item !== invNo) : [...prev, invNo]
    );
  };

  const handleSelectAllInvoices = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceNos(availableInvoiceNos);
    } else {
      setSelectedInvoiceNos([]);
    }
  };

  const handleBulkDeleteInvoices = () => {
    if (selectedInvoiceNos.length === 0) return;
    if (confirm(`Hapus ${selectedInvoiceNos.length} antrean invoice terpilih dari daftar antrean logistik?`)) {
      const idsToDelete = penyalurans
        .filter(p => selectedInvoiceNos.includes(p.no_invoice))
        .map(p => p.id);
      bulkDeletePenyalurans(idsToDelete);
      setSelectedInvoiceNos([]);
    }
  };

  // Handlers for Logistic Logs bulk delete
  const handleToggleSelectLog = (id: number) => {
    setSelectedLogIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLogs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogIds(logisticLogs.map(l => l.id));
    } else {
      setSelectedLogIds([]);
    }
  };

  const handleBulkDeleteLogs = () => {
    if (selectedLogIds.length === 0) return;
    if (confirm(`Yakin ingin menghapus ${selectedLogIds.length} catatan riwayat pengeluaran gudang terpilih?`)) {
      bulkDeleteLogisticLogs(selectedLogIds);
      setSelectedLogIds([]);
    }
  };

  const handleDispatch = (no_invoice: string) => {
    if (confirm(`Konfirmasi pengiriman pesanan untuk Invoice #${no_invoice}? Seluruh item akan ditandai telah dikirim dan surat jalan dapat dicetak.`)) {
      const res = dispatchShipment(no_invoice);
      if (res.success) {
        alert(res.message);
        setPrintingInvoiceNo(no_invoice);
      } else {
        alert(res.message);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookId || manualQty <= 0 || !manualTujuan.trim()) {
      alert('Pilih buku, masukkan jumlah dan tujuan pengeluaran!');
      return;
    }
    const book = books.find(b => b.id === manualBookId);
    if (confirm(`Keluarkan ${manualQty} pcs buku "${book?.judul}" untuk tujuan: ${manualTujuan}?`)) {
      const res = addManualLogisticLog(manualBookId, manualQty, manualTujuan, manualKeterangan);
      if (res.success) {
        alert(res.message);
        setManualTujuan('');
        setManualKeterangan('');
        setManualQty(5);
        setActiveSubTab('logs');
      } else {
        alert(res.message);
      }
    }
  };

  const itemsForSuratJalan = printingInvoiceNo ? penyalurans.filter(p => p.no_invoice === printingInvoiceNo) : [];

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('antrean')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'antrean'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Antrean Packing Pesanan</span>
            {Object.keys(groupedInvoices).length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {Object.keys(groupedInvoices).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pengeluaran Manual Gudang</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Pengeluaran ({logisticLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ANTREAN PACKING SUB TAB */}
      {activeSubTab === 'antrean' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Daftar Pesanan Siap Packing & Kirim
              </h3>
              <p className="text-xs text-slate-500">Invoice yang telah LUNAS di bagian Marketing otomatis masuk ke sini untuk diproses gudang.</p>
            </div>
            {selectedInvoiceNos.length > 0 && (
              <button
                onClick={handleBulkDeleteInvoices}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Antrean Terpilih ({selectedInvoiceNos.length})</span>
              </button>
            )}
          </div>

          {availableInvoiceNos.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  onChange={handleSelectAllInvoices}
                  checked={selectedInvoiceNos.length === availableInvoiceNos.length && availableInvoiceNos.length > 0}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Pilih Semua Antrean Packing</span>
              </label>
              <span className="text-slate-500 text-[11px]">
                {selectedInvoiceNos.length} dari {availableInvoiceNos.length} dipilih
              </span>
            </div>
          )}

          {Object.keys(groupedInvoices).length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Semua Antrean Pengiriman Telah Selesai!</p>
              <p className="text-xs text-slate-500 mt-1">Tidak ada paket tertunda dalam proses packing saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupedInvoices).map(([invNo, items]) => {
                const linkedOrder = orders.find(o => o.no_invoice === invNo);
                const recipient = items[0]?.nama_agen || linkedOrder?.nama_penerima || 'Agen';
                const totalBuku = items.reduce((s, it) => s + it.qty, 0);

                return (
                  <div
                    key={invNo}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-colors ${
                      selectedInvoiceNos.includes(invNo)
                        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={selectedInvoiceNos.includes(invNo)}
                            onChange={() => handleToggleSelectInvoice(invNo)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                              {invNo}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium">Tujuan: <span className="text-slate-900 dark:text-white font-bold">{recipient}</span></p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-bold uppercase">
                          Proses Packing
                        </span>
                      </div>

                      {linkedOrder?.alamat_penerima && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">Alamat: </span>
                          {linkedOrder.alamat_penerima} (Kurir: {linkedOrder.ekspedisi})
                        </p>
                      )}

                      {/* Items list */}
                      <div className="mt-3 space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Daftar Buku Yang Harus Dikemas:</span>
                        {items.map((it, idx) => {
                          const book = books.find(b => b.id === it.buku_id) || it.book;
                          return (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{book?.judul || `Buku #${it.buku_id}`}</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                                {it.qty} Eks
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">Total: {totalBuku} Eks</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setPrintingInvoiceNo(invNo)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          <Printer className="w-3.5 h-3.5 inline mr-1" />
                          Surat Jalan
                        </button>
                        <button
                          onClick={() => handleDispatch(invNo)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 inline mr-1" />
                          Kirim Pesanan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PENGELUARAN MANUAL SUB TAB */}
      {activeSubTab === 'manual' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Catat Pengeluaran Buku Manual dari Gudang
            </h3>
            <p className="text-xs text-slate-500">Gunakan form ini untuk penyaluran donasi gratis, display pameran, atau keperluan internal yayasan.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pilih Judul Buku</label>
              <select
                value={manualBookId}
                onChange={e => setManualBookId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.judul} (Tersedia: {b.stok_gudang} Eks)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jumlah Eksemplar Keluar</label>
              <input
                type="number"
                required
                min="1"
                value={manualQty}
                onChange={e => setManualQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tujuan Penyaluran / Penerima *</label>
              <input
                type="text"
                required
                value={manualTujuan}
                onChange={e => setManualTujuan(e.target.value)}
                placeholder="Contoh: Donasi Perpustakaan Vihara Dhammacakka"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Keterangan Tambahan</label>
              <textarea
                rows={2}
                value={manualKeterangan}
                onChange={e => setManualKeterangan(e.target.value)}
                placeholder="Disetujui oleh Direktur untuk kegiatan retret..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm"
            >
              Simpan Pengeluaran Gudang
            </button>
          </form>
        </div>
      )}

      {/* RIWAYAT LOGISTIK KELUAR */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Riwayat Pengeluaran Fisik Gudang Logistik</h3>
              <p className="text-xs text-slate-500">Mencatat seluruh buku yang keluar baik dari order penjualan maupun distribusi manual.</p>
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
                      checked={selectedLogIds.length === logisticLogs.length && logisticLogs.length > 0}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="p-3">Waktu Keluar</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3 text-center">Jumlah</th>
                  <th className="p-3">Tujuan / Penerima</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logisticLogs.map(log => {
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
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.created_at}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{book?.judul || `Buku ID #${log.buku_id}`}</td>
                      <td className="p-3 text-center font-bold text-rose-600 dark:text-rose-400">-{log.qty_keluar} Eks</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.tujuan}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{log.keterangan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Surat Jalan Modal */}
      {printingInvoiceNo && (
        <SuratJalanPrintModal
          noInvoice={printingInvoiceNo}
          items={itemsForSuratJalan}
          onClose={() => setPrintingInvoiceNo(null)}
        />
      )}

    </div>
  );
};
