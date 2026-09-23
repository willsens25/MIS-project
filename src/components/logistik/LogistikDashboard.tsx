import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Penyaluran, LogisticLog, Book, Order } from '../../types';
import { formatLogDateTime, getActiveTimezone, IndonesianTimezoneKey } from '../../utils/greetingUtils';
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
  Trash2,
  X,
  Check,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpRight,
  Filter,
  ScanBarcode
} from 'lucide-react';
import { SuratJalanPrintModal } from '../modals/SuratJalanPrintModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { ExportCsvButton } from '../common/ExportCsvButton';
import { DownloadPdfButton } from '../common/DownloadPdfButton';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';

export const LogistikDashboard: React.FC = () => {
  const {
    penyalurans,
    logisticLogs,
    bulkDeleteLogisticLogs,
    bulkDeletePenyalurans,
    books,
    dispatchShipment,
    addManualLogisticLog,
    orders,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const activeSubTab = (['antrean', 'manual', 'logs'].includes(currentSubTab)
    ? currentSubTab
    : 'antrean') as 'antrean' | 'manual' | 'logs';
  const setActiveSubTab = (tab: 'antrean' | 'manual' | 'logs') => setCurrentSubTab(tab);

  // Bulk delete selection states
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [selectedInvoiceNos, setSelectedInvoiceNos] = useState<string[]>([]);

  // Dispatch Confirmation Modal State
  const [dispatchModalInvoice, setDispatchModalInvoice] = useState<string | null>(null);
  const [dispatchResi, setDispatchResi] = useState<string>('');

  // Toast & ConfirmModal states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
    confirmText: 'Ya, Lanjutkan'
  });

  // Surat Jalan Print Modal
  const [printingInvoiceNo, setPrintingInvoiceNo] = useState<string | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Manual Dispatch Form
  const [manualBookId, setManualBookId] = useState<number>(books[0]?.id || 1);
  const [manualQty, setManualQty] = useState<number>(5);
  const [manualTujuan, setManualTujuan] = useState('');
  const [manualKeterangan, setManualKeterangan] = useState('');

  // View mode and search filter states
  const [antreanViewMode, setAntreanViewMode] = useState<'table' | 'cards'>('table');
  const [logSearch, setLogSearch] = useState('');
  const [activeTz, setActiveTz] = useState<IndonesianTimezoneKey>(() => getActiveTimezone());

  useEffect(() => {
    const handleTz = (e: Event) => {
      const customEvent = e as CustomEvent<{ timezone: IndonesianTimezoneKey }>;
      if (customEvent.detail?.timezone) {
        setActiveTz(customEvent.detail.timezone);
      } else {
        setActiveTz(getActiveTimezone());
      }
    };
    window.addEventListener('mis-timezone-changed', handleTz);
    return () => window.removeEventListener('mis-timezone-changed', handleTz);
  }, []);

  // Group pending packing items by invoice number
  const pendingPacking = penyalurans.filter(
    p => (p.status || '').toLowerCase() === 'proses packing'
  );
  const groupedInvoices: Record<string, Penyaluran[]> = {};
  
  pendingPacking.forEach(item => {
    if (!groupedInvoices[item.no_invoice]) {
      groupedInvoices[item.no_invoice] = [];
    }
    groupedInvoices[item.no_invoice].push(item);
  });

  // Include any order that is marked 'Lunas' in orders if not already in penyalurans
  orders.forEach(order => {
    if (order.status === 'Lunas') {
      const alreadyInPenyaluran = penyalurans.some(
        p => (p.no_invoice || '').trim().toUpperCase() === (order.no_invoice || '').trim().toUpperCase()
      );
      if (!alreadyInPenyaluran && order.items && order.items.length > 0) {
        if (!groupedInvoices[order.no_invoice]) {
          groupedInvoices[order.no_invoice] = order.items.map((it, idx): Penyaluran => ({
            id: order.id * 1000 + idx,
            no_invoice: order.no_invoice,
            buku_id: it.buku_id,
            book: books.find(b => b.id === it.buku_id),
            qty: it.jumlah,
            nama_agen: order.nama_penerima || order.nama_pembeli,
            status: 'proses packing',
            created_at: order.created_at
          }));
        }
      }
    }
  });

  const availableInvoiceNos = Object.keys(groupedInvoices);

  // Handlers for Antrean bulk actions
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

  const handleBulkDispatchInvoices = () => {
    if (selectedInvoiceNos.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Kirim Pesanan Terpilih',
      message: `Konfirmasi pengiriman ${selectedInvoiceNos.length} pesanan terpilih sekaligus? Seluruh item akan ditandai telah dikirim dan dicatat ke riwayat pengeluaran gudang.`,
      variant: 'primary',
      confirmText: 'Ya, Kirim Semua Terpilih',
      onConfirm: () => {
        selectedInvoiceNos.forEach(invNo => {
          dispatchShipment(invNo);
        });
        const count = selectedInvoiceNos.length;
        setSelectedInvoiceNos([]);
        setToastMessage(`${count} pesanan berhasil dikirim ke ekspedisi!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    });
  };

  const handleBulkDeleteInvoices = () => {
    if (selectedInvoiceNos.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Antrean Packing Terpilih',
      message: `Hapus ${selectedInvoiceNos.length} antrean invoice terpilih dari daftar antrean logistik?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Antrean',
      onConfirm: () => {
        const idsToDelete = penyalurans
          .filter(p => selectedInvoiceNos.includes(p.no_invoice))
          .map(p => p.id);
        bulkDeletePenyalurans(idsToDelete);
        const count = selectedInvoiceNos.length;
        setSelectedInvoiceNos([]);
        setToastMessage(`${count} antrean packing berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
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
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Catatan Pengeluaran Gudang',
      message: `Yakin ingin menghapus ${selectedLogIds.length} catatan riwayat pengeluaran gudang terpilih?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Log',
      onConfirm: () => {
        const count = selectedLogIds.length;
        bulkDeleteLogisticLogs(selectedLogIds);
        setSelectedLogIds([]);
        setToastMessage(`${count} catatan riwayat pengeluaran gudang berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleExecuteDispatch = (no_invoice: string, resi?: string) => {
    const res = dispatchShipment(no_invoice, resi);
    if (res.success) {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
      setDispatchModalInvoice(null);
      setDispatchResi('');
    } else {
      setToastMessage(`Gagal: ${res.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookId || manualQty <= 0 || !manualTujuan.trim()) {
      setToastMessage('Peringatan: Pilih buku, masukkan jumlah dan tujuan pengeluaran!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    const book = books.find(b => b.id === manualBookId);
    setConfirmModalConfig({
      isOpen: true,
      title: 'Konfirmasi Pengeluaran Manual',
      message: `Keluarkan ${manualQty} pcs buku "${book?.judul}" untuk tujuan: ${manualTujuan}? Stok gudang akan otomatis dipotong.`,
      variant: 'primary',
      confirmText: 'Ya, Keluarkan Buku',
      onConfirm: () => {
        const res = addManualLogisticLog(manualBookId, manualQty, manualTujuan, manualKeterangan);
        if (res.success) {
          setToastMessage(res.message);
          setTimeout(() => setToastMessage(null), 4000);
          setManualTujuan('');
          setManualKeterangan('');
          setManualQty(5);
          setActiveSubTab('logs');
        } else {
          setToastMessage(`Gagal: ${res.message}`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      }
    });
  };

  const itemsForSuratJalan = (() => {
    if (!printingInvoiceNo) return [];
    const directItems = penyalurans.filter(
      p => (p.no_invoice || '').trim().toUpperCase() === printingInvoiceNo.trim().toUpperCase()
    );
    if (directItems.length > 0) return directItems;

    const linkedOrder = orders.find(
      o => (o.no_invoice || '').trim().toUpperCase() === printingInvoiceNo.trim().toUpperCase()
    );
    if (linkedOrder && linkedOrder.items) {
      return linkedOrder.items.map((it, idx): Penyaluran => ({
        id: linkedOrder.id * 1000 + idx,
        no_invoice: linkedOrder.no_invoice,
        buku_id: it.buku_id,
        book: books.find(b => b.id === it.buku_id),
        qty: it.jumlah,
        nama_agen: linkedOrder.nama_penerima || linkedOrder.nama_pembeli,
        status: 'dikirim',
        created_at: linkedOrder.created_at
      }));
    }
    return [];
  })();

  const dispatchOrder = dispatchModalInvoice
    ? orders.find(o => (o.no_invoice || '').trim().toUpperCase() === dispatchModalInvoice.trim().toUpperCase())
    : null;
  const dispatchItems = dispatchModalInvoice
    ? (groupedInvoices[dispatchModalInvoice] || penyalurans.filter(p => (p.no_invoice || '').trim().toUpperCase() === dispatchModalInvoice.trim().toUpperCase()))
    : [];

  const getCurrentViewCount = (): number | undefined => {
    switch (activeSubTab) {
      case 'logs': return logisticLogs.length;
      case 'antrean': return Object.keys(groupedInvoices).length;
      case 'manual': return books.length;
      default: return undefined;
    }
  };

  const getCurrentViewTitle = (): string => {
    switch (activeSubTab) {
      case 'logs': return 'Riwayat Pengeluaran Fisik Gudang';
      case 'antrean': return 'Antrean Packing Pesanan';
      case 'manual': return 'Katalog Stok Gudang';
      default: return 'Logistik';
    }
  };

  const handleExportCurrentViewCSV = () => {
    const dateStamp = getCsvDateStamp();

    if (activeSubTab === 'logs') {
      const success = exportDataToCsv({
        filename: `logistik_riwayat_pengeluaran_gudang_${dateStamp}.csv`,
        title: 'LAPORAN RIWAYAT PENGELUARAN FISIK GUDANG LOGISTIK - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'ID Log', key: 'id' },
          { header: `Waktu Keluar (${activeTz})`, accessor: l => formatLogDateTime(l.created_at, { tzKey: activeTz, showTz: true }) },
          { header: 'Judul Buku', accessor: l => (books.find(b => b.id === l.buku_id) || l.book)?.judul || `Buku #${l.buku_id}` },
          { header: 'Jumlah Keluar (Eks)', key: 'qty_keluar' },
          { header: 'Tujuan / Penerima', key: 'tujuan' },
          { header: 'Keterangan', accessor: l => l.keterangan || '-' }
        ],
        data: logisticLogs
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${logisticLogs.length} riwayat pengeluaran gudang ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else if (activeSubTab === 'antrean') {
      // Flatten all pending invoices into detailed exportable line items
      const flattenedAntrean: Array<{
        no_invoice: string;
        nama_agen: string;
        alamat: string;
        ekspedisi: string;
        judul_buku: string;
        qty: number;
        status: string;
      }> = [];

      Object.entries(groupedInvoices).forEach(([invNo, items]) => {
        const linkedOrder = orders.find(o => o.no_invoice === invNo);
        const recipient = items[0]?.nama_agen || linkedOrder?.nama_penerima || 'Agen';
        const alamat = linkedOrder?.alamat_penerima || '-';
        const ekspedisi = linkedOrder?.ekspedisi || 'Kurir Ekspedisi';

        items.forEach(it => {
          const book = books.find(b => b.id === it.buku_id) || it.book;
          flattenedAntrean.push({
            no_invoice: invNo,
            nama_agen: recipient,
            alamat,
            ekspedisi,
            judul_buku: book?.judul || `Buku #${it.buku_id}`,
            qty: it.qty,
            status: 'Siap Packing & Kirim'
          });
        });
      });

      const success = exportDataToCsv({
        filename: `logistik_antrean_packing_pesanan_${dateStamp}.csv`,
        title: 'LAPORAN ANTREAN PACKING & PENGIRIMAN PESANAN - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'No. Invoice', key: 'no_invoice' },
          { header: 'Penerima / Agen', key: 'nama_agen' },
          { header: 'Alamat Pengiriman', key: 'alamat' },
          { header: 'Ekspedisi Kurir', key: 'ekspedisi' },
          { header: 'Judul Buku', key: 'judul_buku' },
          { header: 'Jumlah (Eks)', key: 'qty' },
          { header: 'Status Gudang', key: 'status' }
        ],
        data: flattenedAntrean
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${flattenedAntrean.length} item antrean packing ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      // Manual / Inventory Catalog View
      const success = exportDataToCsv({
        filename: `logistik_stok_katalog_gudang_${dateStamp}.csv`,
        title: 'LAPORAN STOK FISIK BUKU TERSEDIA DI GUDANG - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'Kode Buku', accessor: b => `B-${String(b.id).padStart(3, '0')}` },
          { header: 'Judul Buku', key: 'judul' },
          { header: 'Penulis', key: 'penulis' },
          { header: 'Kategori', key: 'kategori' },
          { header: 'Stok Fisik Gudang (Eks)', key: 'stok_gudang' },
          { header: 'Harga Jual (Rp)', key: 'harga_jual' },
          { header: 'Status Stok', accessor: b => (b.stok_gudang <= 10 ? 'Menipis' : 'Aman') }
        ],
        data: books
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor stok ketersediaan ${books.length} buku ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintReportHeader
        divisionName="Logistik & Distribusi"
        divisionCode="LOG"
        subTabTitle={
          activeSubTab === 'antrean'
            ? 'Antrean Packing & Pengiriman Pesanan'
            : activeSubTab === 'manual'
            ? 'Pengeluaran Manual Stok Gudang'
            : 'Riwayat Logistik & Distribusi Keluar'
        }
      />

      {/* Sub tabs */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
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

        <div className="flex items-center space-x-2">
          {/* Scan Barcode Button */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Scan barcode fisik buku atau ketik ISBN manual untuk memasukkan stok gudang"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>Scan Barcode (Stok)</span>
          </button>

          {/* Print Current View Action Button */}
          <PrintCurrentViewButton
            id="btn-print-logistik"
            fallbackFilename={`Laporan_Logistik_${activeSubTab}`}
          />

          {/* Download Current Table View directly as PDF */}
          <DownloadPdfButton
            id="btn-download-pdf-logistik"
            filename={`Laporan_Logistik_${activeSubTab}`}
            tooltip={`Unduh tabel ${getCurrentViewTitle()} langsung sebagai file PDF resmi berformat cetak`}
          />

          {/* Export Current View to CSV */}
          <ExportCsvButton
            id="btn-export-csv-logistik"
            onClick={handleExportCurrentViewCSV}
            count={getCurrentViewCount()}
            label="Ekspor CSV"
            tooltip={`Ekspor data tabel ${getCurrentViewTitle()} ke file CSV untuk laporan eksternal`}
          />
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

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {/* View mode toggle */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAntreanViewMode('table')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    antreanViewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Tampilan Tabel Rapi"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAntreanViewMode('cards')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    antreanViewMode === 'cards'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Tampilan Kartu Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kartu</span>
                </button>
              </div>

              {selectedInvoiceNos.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDispatchInvoices}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Terpilih ({selectedInvoiceNos.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDeleteInvoices}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Antrean ({selectedInvoiceNos.length})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {availableInvoiceNos.length > 0 && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  onChange={handleSelectAllInvoices}
                  checked={selectedInvoiceNos.length === availableInvoiceNos.length && availableInvoiceNos.length > 0}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Pilih Semua Antrean Packing ({availableInvoiceNos.length} Invoice)</span>
              </label>
              <span className="text-slate-500 text-[11px] font-mono">
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
          ) : antreanViewMode === 'table' ? (
            /* TABEL RAPI ANTREAN PACKING */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table id="table-logistik-antrean" className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5 w-10 text-center no-export print:hidden">
                        <input
                          type="checkbox"
                          onChange={handleSelectAllInvoices}
                          checked={selectedInvoiceNos.length === availableInvoiceNos.length && availableInvoiceNos.length > 0}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5 whitespace-nowrap">No. Invoice</th>
                      <th className="p-3.5">Penerima & Alamat</th>
                      <th className="p-3.5">Ekspedisi</th>
                      <th className="p-3.5">Daftar Buku Yang Dikemas</th>
                      <th className="p-3.5 text-center">Total Eks</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right no-export print:hidden">Tindakan Logistik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(groupedInvoices).map(([invNo, items]) => {
                      const linkedOrder = orders.find(o => o.no_invoice === invNo);
                      const recipient = items[0]?.nama_agen || linkedOrder?.nama_penerima || 'Agen';
                      const totalBuku = items.reduce((s, it) => s + it.qty, 0);
                      const isSelected = selectedInvoiceNos.includes(invNo);

                      return (
                        <tr
                          key={invNo}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                            isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center no-export print:hidden">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectInvoice(invNo)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {invNo}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{recipient}</div>
                            {linkedOrder?.alamat_penerima && (
                              <div className="text-[11px] text-slate-500 max-w-xs truncate" title={linkedOrder.alamat_penerima}>
                                {linkedOrder.alamat_penerima}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px]">
                              {linkedOrder?.ekspedisi || 'Kurir Ekspedisi'}
                            </span>
                          </td>
                          <td className="p-3.5 space-y-1">
                            {items.map((it, idx) => {
                              const book = books.find(b => b.id === it.buku_id) || it.book;
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                    {book?.judul || `Buku #${it.buku_id}`}
                                  </span>
                                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {it.qty} eks
                                  </span>
                                </div>
                              );
                            })}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                            {totalBuku} Eks
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded-full text-[10px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Siap Packing</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap no-export print:hidden">
                            <button
                              onClick={() => setPrintingInvoiceNo(invNo)}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              title="Cetak Surat Jalan Pengiriman"
                            >
                              <Printer className="w-3.5 h-3.5 inline mr-1" />
                              Surat Jalan
                            </button>
                            <button
                              onClick={() => {
                                setDispatchResi('');
                                setDispatchModalInvoice(invNo);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center space-x-1 cursor-pointer transition-all"
                              title="Kirim dan update stok gudang"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                    <tr>
                      <td colSpan={5} className="p-3.5 text-slate-500">
                        Total {Object.keys(groupedInvoices).length} Antrean Pesanan Siap Packing
                      </td>
                      <td className="p-3.5 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                        {Object.values(groupedInvoices).reduce((sum, items) => sum + items.reduce((s, it) => s + it.qty, 0), 0)} Eks
                      </td>
                      <td colSpan={2} className="p-3.5 no-export print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 inline mr-1" />
                          Surat Jalan
                        </button>
                        <button
                          onClick={() => {
                            setDispatchResi('');
                            setDispatchModalInvoice(invNo);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pesanan</span>
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
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Riwayat Pengeluaran Fisik Gudang Logistik</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Mencatat seluruh buku yang keluar baik dari order penjualan maupun distribusi manual.</p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {/* Search input for logs */}
              <div className="relative">
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  placeholder="Cari buku / tujuan..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:w-60 transition-all focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {selectedLogIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteLogs}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Log ({selectedLogIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* TABEL RAPI RIWAYAT LOGISTIK */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table id="table-logistik-logs" className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 w-10 text-center no-export print:hidden">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllLogs}
                      checked={selectedLogIds.length === logisticLogs.length && logisticLogs.length > 0}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="p-3.5 whitespace-nowrap">Waktu Keluar ({activeTz})</th>
                  <th className="p-3.5">ID Log</th>
                  <th className="p-3.5">Judul Buku</th>
                  <th className="p-3.5 text-center">Jumlah Fisik</th>
                  <th className="p-3.5">Tujuan / Penerima</th>
                  <th className="p-3.5">Keterangan / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  const filteredLogs = logisticLogs.filter(log => {
                    if (!logSearch.trim()) return true;
                    const q = logSearch.toLowerCase();
                    const book = books.find(b => b.id === log.buku_id) || log.book;
                    const formattedTime = formatLogDateTime(log.created_at, { tzKey: activeTz }).toLowerCase();
                    return (
                      (book?.judul || '').toLowerCase().includes(q) ||
                      (log.tujuan || '').toLowerCase().includes(q) ||
                      (log.keterangan || '').toLowerCase().includes(q) ||
                      (log.created_at || '').toLowerCase().includes(q) ||
                      formattedTime.includes(q)
                    );
                  });

                  if (filteredLogs.length === 0) {
                    return (
                      <tr className="no-export">
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada catatan riwayat pengeluaran buku</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {logSearch ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian.' : 'Seluruh buku yang dikirim atau dikeluarkan gudang akan tercatat rapi di sini.'}
                          </p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredLogs.map((log) => {
                    const book = books.find(b => b.id === log.buku_id) || log.book;
                    const isSelected = selectedLogIds.includes(log.id);

                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center no-export print:hidden">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectLog(log.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 font-mono whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">{formatLogDateTime(log.created_at, { tzKey: activeTz })}</span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-1 py-0.5 rounded leading-none">
                              {activeTz}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">#{log.id}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{book?.judul || `Buku ID #${log.buku_id}`}</td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>-{log.qty_keluar} Eks</span>
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{log.tujuan}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">
                          {log.keterangan || '-'}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              {logisticLogs.length > 0 && (
                <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                  <tr>
                    <td colSpan={4} className="p-3.5 text-slate-500">
                      Total {logisticLogs.length} Catatan Log Pengeluaran Gudang
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      -{logisticLogs.reduce((s, l) => s + l.qty_keluar, 0).toLocaleString('id-ID')} Eks
                    </td>
                    <td colSpan={2} className="p-3.5 text-slate-400 text-right">
                      Tercatat otomatis & permanen
                    </td>
                  </tr>
                </tfoot>
              )}
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

      {/* Dispatch Confirmation Modal */}
      {dispatchModalInvoice && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDispatchModalInvoice(null)}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Konfirmasi Pengiriman Pesanan
                    </h3>
                    <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Invoice #{dispatchModalInvoice}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDispatchModalInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Destination Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Penerima / Agen</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {dispatchOrder?.nama_penerima || dispatchItems[0]?.nama_agen || 'Pelanggan'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[11px]">
                    {dispatchOrder?.ekspedisi || 'Kurir Ekspedisi'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Alamat Pengiriman</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {dispatchOrder?.alamat_penerima || 'Alamat Toko / Pengambilan Kantor'}
                  </p>
                </div>
              </div>

              {/* Resi input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor Resi / AWB Pengiriman <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={dispatchResi}
                  onChange={e => setDispatchResi(e.target.value)}
                  placeholder="Contoh: JNE-90812938190 atau resi kurir"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Items summary */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Daftar Buku Dikirim ({dispatchItems.reduce((acc, it) => acc + it.qty, 0)} Eks)
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {dispatchItems.map((it, idx) => {
                    const b = books.find(book => book.id === it.buku_id) || it.book;
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate mr-2">
                          {b?.judul || `Buku ID #${it.buku_id}`}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded shrink-0">
                          {it.qty} Eks
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System synchronization note */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dampak Konfirmasi Pengiriman:</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400 pl-5">
                  • Status pesanan menjadi <strong>DIKIRIM</strong> di sistem marketing.<br />
                  • Pengeluaran buku tercatat di <strong>Riwayat Pengeluaran Gudang</strong>.<br />
                  • Antrean packing selesai dan Surat Jalan siap dicetak.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalInvoice(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const inv = dispatchModalInvoice;
                    const resi = dispatchResi;
                    handleExecuteDispatch(inv, resi);
                    setPrintingInvoiceNo(inv);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Kirim & Cetak Surat Jalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteDispatch(dispatchModalInvoice, dispatchResi)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesanan Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Barcode Scanner & ISBN Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onSuccess={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Generic Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        onConfirm={() => {
          confirmModalConfig.onConfirm();
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl text-xs font-semibold border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
