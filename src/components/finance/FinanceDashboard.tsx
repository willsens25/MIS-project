import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Mutasi, Account, PengajuanCetak } from '../../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Printer,
  Building,
  CreditCard,
  Layers,
  AlertCircle,
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import { FinanceCharts } from '../charts/FinanceCharts';
import { SixMonthCashFlowBarChart } from '../charts/SixMonthCashFlowBarChart';
import { ConfirmModal } from '../modals/ConfirmModal';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { ExportCsvButton } from '../common/ExportCsvButton';
import { DownloadPdfButton } from '../common/DownloadPdfButton';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';
import { formatLogDateTime } from '../../utils/greetingUtils';

interface FinanceDashboardProps {
  initialSubTab?: 'grafik' | 'mutasi' | 'persetujuan' | 'penjualan' | 'akun';
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ initialSubTab }) => {
  const {
    mutasis,
    addMutasi,
    updateMutasi,
    deleteMutasi,
    bulkDeleteMutasi,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    categories,
    pengajuans,
    approvePengajuanCetak,
    rejectPengajuanCetak,
    bulkDeletePengajuanCetak,
    penjualans,
    books,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const activeSubTab = (['grafik', 'mutasi', 'persetujuan', 'penjualan', 'akun'].includes(currentSubTab)
    ? currentSubTab
    : 'grafik') as 'grafik' | 'mutasi' | 'persetujuan' | 'penjualan' | 'akun';
  const setActiveSubTab = (tab: 'grafik' | 'mutasi' | 'persetujuan' | 'penjualan' | 'akun') => setCurrentSubTab(tab);

  useEffect(() => {
    if (initialSubTab) {
      setCurrentSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMutasiChart, setShowMutasiChart] = useState(false);

  // Selection states for bulk actions
  const [selectedMutasiIds, setSelectedMutasiIds] = useState<number[]>([]);
  const [selectedPengajuanIds, setSelectedPengajuanIds] = useState<number[]>([]);

  // Mutasi Modal
  const [modalMutasiOpen, setModalMutasiOpen] = useState(false);
  const [editingMutasi, setEditingMutasi] = useState<Mutasi | null>(null);
  const [mutasiForm, setMutasiForm] = useState({
    account_id: accounts[0]?.id || 1,
    nama_kategori: 'Donasi Umum',
    tipe: 'Masuk' as 'Masuk' | 'Keluar',
    nominal: 0,
    keterangan: '',
    tanggal: new Date().toISOString().substring(0, 10)
  });

  // Account Modal
  const [modalAccountOpen, setModalAccountOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [accountName, setAccountName] = useState('');

  // Reject Modal
  const [rejectingPengajuanId, setRejectingPengajuanId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Approve Confirmation Modal & Toast
  const [approvingPengajuan, setApprovingPengajuan] = useState<{
    id: number;
    bookTitle: string;
    qty: number;
    biaya: number;
    accountId: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generic Confirm Modal for deletions
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

  // Approval account selection
  const [approvalAccountMap, setApprovalAccountMap] = useState<Record<number, number>>({});

  // Calculation for filters
  const filteredMutasi = mutasis.filter(m => {
    const matchSearch = m.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category?.nama_kategori && m.category.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = filterType === 'all' || m.tipe === filterType;
    const matchAccount = filterAccount === 'all' || m.account_id === parseInt(filterAccount);
    const matchMonth = filterMonth === 'all' || m.tanggal.startsWith(filterMonth);
    return matchSearch && matchType && matchAccount && matchMonth;
  });

  const totalMasuk = filteredMutasi.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
  const totalKeluar = filteredMutasi.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
  const saldoBersih = totalMasuk - totalKeluar;

  const pendingPengajuans = pengajuans.filter(p => p.status === 'pending');

  const handleToggleSelectMutasi = (id: number) => {
    setSelectedMutasiIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllMutasi = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMutasiIds(filteredMutasi.map(m => m.id));
    } else {
      setSelectedMutasiIds([]);
    }
  };

  const handleBulkDeleteMutasi = () => {
    if (selectedMutasiIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Transaksi Kas Terpilih',
      message: `Yakin ingin menghapus ${selectedMutasiIds.length} data transaksi mutasi kas & bank yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Data',
      onConfirm: () => {
        bulkDeleteMutasi(selectedMutasiIds);
        setSelectedMutasiIds([]);
        setToastMessage(`${selectedMutasiIds.length} transaksi mutasi berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleToggleSelectPengajuan = (id: number) => {
    setSelectedPengajuanIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllPengajuan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPengajuanIds(pengajuans.map(p => p.id));
    } else {
      setSelectedPengajuanIds([]);
    }
  };

  const handleBulkDeletePengajuan = () => {
    if (selectedPengajuanIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Pengajuan Cetak Terpilih',
      message: `Yakin ingin menghapus ${selectedPengajuanIds.length} permohonan cetak buku terpilih?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Pengajuan',
      onConfirm: () => {
        bulkDeletePengajuanCetak(selectedPengajuanIds);
        setSelectedPengajuanIds([]);
        setToastMessage(`${selectedPengajuanIds.length} pengajuan cetak berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleBulkApprovePengajuan = () => {
    const pendingSelected = pengajuans.filter(p => selectedPengajuanIds.includes(p.id) && p.status === 'pending');
    if (pendingSelected.length === 0) {
      setToastMessage('Tidak ada pengajuan berstatus pending dalam pilihan.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    pendingSelected.forEach(p => {
      const accId = approvalAccountMap[p.id] || accounts[0]?.id || 1;
      approvePengajuanCetak(p.id, accId);
    });

    setToastMessage(`${pendingSelected.length} pengajuan cetak buku berhasil disetujui & SPK diterbitkan!`);
    setTimeout(() => setToastMessage(null), 4000);
    setSelectedPengajuanIds([]);
  };

  const handleSaveMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutasiForm.nominal <= 0 || !mutasiForm.keterangan.trim()) {
      setToastMessage('⚠️ Nominal harus lebih dari 0 dan keterangan wajib diisi!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (editingMutasi) {
      updateMutasi(editingMutasi.id, mutasiForm.nama_kategori, mutasiForm.tipe, mutasiForm.nominal, mutasiForm.keterangan);
    } else {
      addMutasi(mutasiForm.account_id, mutasiForm.nama_kategori, mutasiForm.tipe, mutasiForm.nominal, mutasiForm.keterangan, mutasiForm.tanggal);
    }
    setModalMutasiOpen(false);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;
    if (editingAcc) {
      updateAccount(editingAcc.id, accountName.trim());
    } else {
      addAccount(accountName.trim());
    }
    setModalAccountOpen(false);
    setAccountName('');
  };

  const getCurrentViewCount = (): number | undefined => {
    switch (activeSubTab) {
      case 'mutasi': return filteredMutasi.length;
      case 'persetujuan': return pengajuans.length;
      case 'penjualan': return penjualans.length;
      case 'akun': return accounts.length;
      default: return undefined;
    }
  };

  const getCurrentViewTitle = (): string => {
    switch (activeSubTab) {
      case 'mutasi': return 'Jurnal Mutasi Kas';
      case 'persetujuan': return 'Persetujuan Anggaran Cetak';
      case 'penjualan': return 'Rekapitulasi Penjualan';
      case 'akun': return 'Akun Kas & Bank';
      default: return 'Finansial';
    }
  };

  const handleExportCurrentViewCSV = () => {
    const dateStamp = getCsvDateStamp();

    if (activeSubTab === 'mutasi') {
      const success = exportDataToCsv({
        filename: `keuangan_jurnal_mutasi_kas_${dateStamp}.csv`,
        title: 'LAPORAN JURNAL MUTASI KAS & TRANSAKSI - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'ID Transaksi', key: 'id' },
          { header: 'Tanggal', key: 'tanggal' },
          { header: 'Tipe', key: 'tipe' },
          { header: 'Akun Kas / Bank', accessor: m => m.account?.nama_akun || accounts.find(a => a.id === m.account_id)?.nama_akun || 'Kas Utama' },
          { header: 'Kategori', accessor: m => m.category?.nama_kategori || categories.find(c => c.id === m.category_id)?.nama_kategori || 'Umum' },
          { header: 'Nominal (Rp)', accessor: m => (m.tipe === 'Keluar' ? -m.nominal : m.nominal) },
          { header: 'Keterangan', key: 'keterangan' },
          { header: 'Jenis / Sumber', key: 'jenis' }
        ],
        data: filteredMutasi
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${filteredMutasi.length} transaksi jurnal mutasi kas ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else if (activeSubTab === 'persetujuan') {
      const success = exportDataToCsv({
        filename: `keuangan_pengajuan_anggaran_cetak_${dateStamp}.csv`,
        title: 'LAPORAN PENGAJUAN & PERSETUJUAN ANGGARAN CETAK BUKU - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'ID Pengajuan', key: 'id' },
          { header: 'Waktu Diajukan', accessor: p => formatLogDateTime(p.created_at) },
          { header: 'Judul Buku', accessor: p => (books.find(b => b.id === p.buku_id) || p.buku)?.judul || `Buku #${p.buku_id}` },
          { header: 'Oplah Cetak (Eks)', key: 'jumlah_pengajuan' },
          { header: 'Estimasi Biaya (Rp)', accessor: p => p.jumlah_pengajuan * 20000 },
          { header: 'Status Persetujuan', key: 'status' },
          { header: 'Sumber Rekening Kas', accessor: p => accounts.find(a => a.id === (approvalAccountMap[p.id] || p.account_id))?.nama_akun || '-' },
          { header: 'Catatan Bendahara', accessor: p => p.catatan_bendahara || '-' }
        ],
        data: pengajuans
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${pengajuans.length} pengajuan anggaran cetak ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else if (activeSubTab === 'penjualan') {
      const success = exportDataToCsv({
        filename: `keuangan_rekapitulasi_penjualan_${dateStamp}.csv`,
        title: 'LAPORAN REKAPITULASI PENJUALAN BUKU - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'No. Invoice', key: 'no_invoice' },
          { header: 'Tanggal Penjualan', key: 'tanggal_penjualan' },
          { header: 'Nama Pelanggan / Agen', key: 'nama_pelanggan' },
          { header: 'Total Buku (Pcs)', key: 'total_item' },
          { header: 'Total Tagihan Lunas (Rp)', key: 'total_bayar' },
          { header: 'Status Pembayaran', accessor: () => 'Lunas' }
        ],
        data: penjualans
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${penjualans.length} data rekapitulasi penjualan ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else if (activeSubTab === 'akun') {
      const success = exportDataToCsv({
        filename: `keuangan_master_akun_kas_${dateStamp}.csv`,
        title: 'LAPORAN MASTER REKENING KAS & BANK - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'No.', accessor: (_, idx) => idx + 1 },
          { header: 'Kode Akun', key: 'kode_akun' },
          { header: 'Nama Akun Kas/Bank', key: 'nama_akun' },
          { header: 'Saldo Awal (Rp)', accessor: a => a.saldo_awal || 0 },
          { header: 'Total Kas Masuk (Rp)', accessor: a => mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0) },
          { header: 'Total Kas Keluar (Rp)', accessor: a => mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0) },
          {
            header: 'Saldo Berjalan (Rp)',
            accessor: a => {
              const masuk = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
              const keluar = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
              return (a.saldo_awal || 0) + masuk - keluar;
            }
          },
          { header: 'Jumlah Mutasi', accessor: a => mutasis.filter(m => m.account_id === a.id).length }
        ],
        data: accounts
      });
      if (success) {
        setToastMessage(`Berhasil mengekspor ${accounts.length} rekening akun kas & bank ke CSV.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      // Grafik / Summary
      const success = exportDataToCsv({
        filename: `keuangan_ringkasan_finansial_${dateStamp}.csv`,
        title: 'RINGKASAN EKSEKUTIF KEUANGAN - YAYASAN LAMRIMNESIA',
        columns: [
          { header: 'Metrik Keuangan', key: 'metrik' },
          { header: 'Nilai Ringkasan', key: 'nilai' }
        ],
        data: [
          { metrik: 'Total Kas Masuk (Rp)', nilai: `Rp ${totalMasuk.toLocaleString('id-ID')}` },
          { metrik: 'Total Kas Keluar (Rp)', nilai: `Rp ${totalKeluar.toLocaleString('id-ID')}` },
          { metrik: 'Saldo Bersih (Rp)', nilai: `Rp ${saldoBersih.toLocaleString('id-ID')}` },
          { metrik: 'Jumlah Transaksi Masuk', nilai: filteredMutasi.filter(m => m.tipe === 'Masuk').length },
          { metrik: 'Jumlah Transaksi Keluar', nilai: filteredMutasi.filter(m => m.tipe === 'Keluar').length },
          { metrik: 'Total Tagihan Penjualan Lunas (Rp)', nilai: `Rp ${penjualans.reduce((s, p) => s + p.total_bayar, 0).toLocaleString('id-ID')}` },
          { metrik: 'Jumlah Rekening Kas Aktif', nilai: accounts.length }
        ]
      });
      if (success) {
        setToastMessage('Berhasil mengekspor ringkasan keuangan ke CSV.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintReportHeader
        divisionName="Keuangan & Finansial"
        divisionCode="KEU"
        subTabTitle={
          activeSubTab === 'grafik'
            ? 'Grafik & Analisis Finansial'
            : activeSubTab === 'mutasi'
            ? 'Jurnal Mutasi Kas & Transaksi'
            : activeSubTab === 'persetujuan'
            ? 'Persetujuan Pengajuan Anggaran Cetak'
            : activeSubTab === 'penjualan'
            ? 'Rekapitulasi Penjualan Buku'
            : 'Daftar Akun Kas & Bank'
        }
      />

      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Masuk</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            Rp {totalMasuk.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-400">{filteredMutasi.filter(m => m.tipe === 'Masuk').length} Transaksi</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Keluar</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            Rp {totalKeluar.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-400">{filteredMutasi.filter(m => m.tipe === 'Keluar').length} Transaksi</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Bersih</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl font-extrabold mt-2 ${saldoBersih >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            Rp {saldoBersih.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-400">Total Akumulatif Periode</span>
        </div>
      </div>

      {/* Sub tabs & Actions */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('grafik')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'grafik'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grafik & Analisis Finansial</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              6 Bln
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('mutasi')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'mutasi'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Jurnal Mutasi Kas ({mutasis.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('persetujuan')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'persetujuan'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Persetujuan Cetak</span>
            {pendingPengajuans.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingPengajuans.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('penjualan')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'penjualan'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Rekap Penjualan ({penjualans.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('akun')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'akun'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Akun Kas & Bank ({accounts.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Print Current View Action Button */}
          <PrintCurrentViewButton
            id="btn-print-finance"
            fallbackFilename={`Laporan_Keuangan_${activeSubTab}`}
          />

          {/* Download Current Table View directly as PDF */}
          <DownloadPdfButton
            id="btn-download-pdf-finance"
            filename={`Laporan_Keuangan_${activeSubTab}`}
            tooltip={`Unduh tabel ${getCurrentViewTitle()} langsung sebagai file PDF resmi berformat cetak`}
          />

          {/* Dynamic Export CSV for Current View */}
          <ExportCsvButton
            id="btn-export-csv-finance"
            onClick={handleExportCurrentViewCSV}
            count={getCurrentViewCount()}
            label="Ekspor CSV"
            tooltip={`Ekspor data tabel ${getCurrentViewTitle()} ke file CSV untuk laporan eksternal`}
          />

          {activeSubTab === 'mutasi' && (
            <button
              onClick={() => {
                setEditingMutasi(null);
                setMutasiForm({
                  account_id: accounts[0]?.id || 1,
                  nama_kategori: 'Donasi Umum',
                  tipe: 'Masuk',
                  nominal: 0,
                  keterangan: '',
                  tanggal: new Date().toISOString().substring(0, 10)
                });
                setModalMutasiOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Mutasi Kas</span>
            </button>
          )}

          {activeSubTab === 'akun' && (
            <button
              onClick={() => {
                setEditingAcc(null);
                setAccountName('');
                setModalAccountOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Kas/Bank</span>
            </button>
          )}
        </div>
      </div>

      {/* GRAFIK & ANALISIS SUB TAB */}
      {activeSubTab === 'grafik' && (
        <FinanceCharts
          mutasis={mutasis}
          accounts={accounts}
          categories={categories}
          pengajuans={pengajuans}
        />
      )}

      {/* JURNAL MUTASI SUB TAB */}
      {activeSubTab === 'mutasi' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi, nomor invoice, keterangan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedMutasiIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteMutasi}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Massal ({selectedMutasiIds.length})</span>
                  </button>
                )}

                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="Masuk">Pemasukan (Masuk)</option>
                  <option value="Keluar">Pengeluaran (Keluar)</option>
                </select>

                <select
                  value={filterAccount}
                  onChange={e => setFilterAccount(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="all">Semua Rekening Kas</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.nama_akun}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowMutasiChart(prev => !prev)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    showMutasiChart
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Tampilkan grafik batang ringkasan mutasi kas 6 bulan terakhir"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{showMutasiChart ? 'Sembunyikan Grafik 6 Bln' : 'Lihat Grafik 6 Bln'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible 6-Month Cash Flow Bar Chart */}
          {showMutasiChart && (
            <div className="animate-fadeIn">
              <SixMonthCashFlowBarChart mutasis={mutasis} />
            </div>
          )}

          {/* Mutasi Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table id="table-finance-mutasi" className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800 tracking-wider">
                  <tr>
                    <th className="p-3.5 w-10 text-center no-export print:hidden">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllMutasi}
                        checked={selectedMutasiIds.length === filteredMutasi.length && filteredMutasi.length > 0}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Pilih Semua"
                      />
                    </th>
                    <th className="p-3.5 whitespace-nowrap">Tanggal</th>
                    <th className="p-3.5">Tipe</th>
                    <th className="p-3.5">Akun Kas / Bank</th>
                    <th className="p-3.5">Kategori Transaksi</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5 text-right no-export print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMutasi.length === 0 ? (
                    <tr className="no-export">
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        <Wallet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada data mutasi kas</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Coba sesuaikan filter pencarian atau tanggal transaksi di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMutasi.map((m) => (
                      <tr
                        key={m.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedMutasiIds.includes(m.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center no-export print:hidden">
                          <input
                            type="checkbox"
                            checked={selectedMutasiIds.includes(m.id)}
                            onChange={() => handleToggleSelectMutasi(m.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{m.tanggal}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          {m.tipe === 'Masuk' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>Masuk</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Keluar</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {m.account?.nama_akun || accounts.find(a => a.id === m.account_id)?.nama_akun || 'Kas Utama'}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {m.category?.nama_kategori || categories.find(c => c.id === m.category_id)?.nama_kategori || 'Umum'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs">
                          <div className="truncate font-medium">{m.keterangan}</div>
                          {m.jenis === 'INVOICE' && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded">
                              Auto-POS Lunas
                            </span>
                          )}
                        </td>
                        <td className={`p-3.5 text-right font-mono font-bold whitespace-nowrap ${
                          m.tipe === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {m.tipe === 'Masuk' ? '+' : '-'} Rp {m.nominal.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap no-export print:hidden">
                          <button
                            onClick={() => {
                              setEditingMutasi(m);
                              setMutasiForm({
                                account_id: m.account_id,
                                nama_kategori: m.category?.nama_kategori || 'Umum',
                                tipe: m.tipe,
                                nominal: m.nominal,
                                keterangan: m.keterangan,
                                tanggal: m.tanggal
                              });
                              setModalMutasiOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Hapus Transaksi Mutasi',
                                message: `Yakin ingin menghapus mutasi: "${m.keterangan}" sebesar Rp ${m.nominal.toLocaleString('id-ID')}?`,
                                variant: 'danger',
                                confirmText: 'Ya, Hapus',
                                onConfirm: () => {
                                  deleteMutasi(m.id);
                                  setToastMessage('Data mutasi berhasil dihapus.');
                                  setTimeout(() => setToastMessage(null), 3000);
                                }
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredMutasi.length > 0 && (
                  <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                    <tr>
                      <td colSpan={2} className="p-3 text-slate-500 no-export print:hidden">
                        Total {filteredMutasi.length} Transaksi
                      </td>
                      <td colSpan={4} className="p-3 text-right text-slate-600 dark:text-slate-300">
                        <span className="text-emerald-600 mr-3">Masuk: +Rp {totalMasuk.toLocaleString('id-ID')}</span>
                        <span className="text-rose-600 mr-3">Keluar: -Rp {totalKeluar.toLocaleString('id-ID')}</span>
                        <span className="font-bold">Saldo Bersih:</span>
                      </td>
                      <td className={`p-3 text-right font-mono font-extrabold ${saldoBersih >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                        Rp {saldoBersih.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 no-export print:hidden"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PERSETUJUAN CETAK SUB TAB */}
      {activeSubTab === 'persetujuan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Persetujuan Biaya Cetak Buku dari Penerbitan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Estimasi biaya standar: Rp 20.000 / eks. Persetujuan akan mencairkan dana kas dan menerbitkan SPK ke Divisi Produksi & Gudang.</p>
            </div>
            {selectedPengajuanIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkApprovePengajuan}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Setujui Terpilih ({selectedPengajuanIds.length})</span>
                </button>
                <button
                  onClick={handleBulkDeletePengajuan}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedPengajuanIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table id="table-finance-persetujuan" className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center no-export print:hidden">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllPengajuan}
                      checked={selectedPengajuanIds.length === pengajuans.length && pengajuans.length > 0}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="p-3 whitespace-nowrap">Waktu Diajukan</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3 text-center">Jumlah Oplah</th>
                  <th className="p-3 text-right">Estimasi Biaya</th>
                  <th className="p-3">Sumber Dana Akun</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right no-export print:hidden">Tindakan Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pengajuans.length === 0 ? (
                  <tr className="no-export">
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada pengajuan anggaran cetak</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pengajuan dari Divisi Penerbitan akan muncul di sini untuk persetujuan pencairan dana.</p>
                    </td>
                  </tr>
                ) : (
                  pengajuans.map((p) => {
                    const book = books.find(b => b.id === p.buku_id) || p.buku;
                    const biaya = p.jumlah_pengajuan * 20000;
                    const selectedAccId = approvalAccountMap[p.id] || accounts[0]?.id || 1;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedPengajuanIds.includes(p.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="p-3 text-center no-export print:hidden">
                          <input
                            type="checkbox"
                            checked={selectedPengajuanIds.includes(p.id)}
                            onChange={() => handleToggleSelectPengajuan(p.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{formatLogDateTime(p.created_at)}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{book?.judul || `Buku #${p.buku_id}`}</td>
                        <td className="p-3 text-center font-bold font-mono">{p.jumlah_pengajuan.toLocaleString('id-ID')} Eks</td>
                        <td className="p-3 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          Rp {biaya.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          {p.status === 'pending' ? (
                            <select
                              value={selectedAccId}
                              onChange={e => setApprovalAccountMap({ ...approvalAccountMap, [p.id]: parseInt(e.target.value) })}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            >
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.nama_akun}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-500 font-medium text-[11px]">
                              {accounts.find(a => a.id === p.account_id)?.nama_akun || 'Kas Utama'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            p.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'approved' ? 'bg-emerald-500' :
                              p.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                            }`} />
                            <span>{p.status}</span>
                          </span>
                          {p.catatan_bendahara && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5">"{p.catatan_bendahara}"</p>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap no-export print:hidden">
                          {p.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => {
                                  setApprovingPengajuan({
                                    id: p.id,
                                    bookTitle: book?.judul || `Buku #${p.buku_id}`,
                                    qty: p.jumlah_pengajuan,
                                    biaya,
                                    accountId: selectedAccId
                                  });
                                }}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                title="Setujui dan Terbitkan SPK"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui Cetak</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingPengajuanId(p.id);
                                  setRejectNote('');
                                }}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                title="Tolak Pengajuan"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Sudah Diproses</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {pengajuans.length > 0 && (
                <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                  <tr>
                    <td colSpan={3} className="p-3 text-slate-500">
                      Total {pengajuans.length} Pengajuan
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {pengajuans.reduce((s, p) => s + p.jumlah_pengajuan, 0).toLocaleString('id-ID')} Eks
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      Rp {pengajuans.reduce((s, p) => s + p.jumlah_pengajuan * 20000, 0).toLocaleString('id-ID')}
                    </td>
                    <td colSpan={2} className="p-3 text-slate-500">
                      {pengajuans.filter(p => p.status === 'approved').length} Disetujui, {pengajuans.filter(p => p.status === 'pending').length} Pending
                    </td>
                    <td className="p-3 no-export print:hidden"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* REKAP PENJUALAN SUB TAB */}
      {activeSubTab === 'penjualan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rekap Transaksi Penjualan Lunas</h3>
              <p className="text-xs text-slate-500">Otomatis tercatat saat invoice Marketing dikonfirmasi lunas.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg self-start sm:self-auto">
              Total Omzet: Rp {penjualans.reduce((s, p) => s + p.total_bayar, 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="table-finance-penjualan" className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 whitespace-nowrap">Tanggal Penjualan</th>
                  <th className="p-3">No. Invoice</th>
                  <th className="p-3">Nama Pelanggan / Agen</th>
                  <th className="p-3 text-center">Total Buku</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total Tagihan Lunas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {penjualans.length === 0 ? (
                  <tr className="no-export">
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada data penjualan lunas</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Transaksi yang dikonfirmasi lunas di modul Marketing akan muncul di sini.</p>
                    </td>
                  </tr>
                ) : (
                  penjualans.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{p.tanggal_penjualan}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{p.no_invoice}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{p.nama_pelanggan}</td>
                      <td className="p-3 text-center font-mono font-bold">{p.total_item} pcs</td>
                      <td className="p-3">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>Lunas</span>
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rp {p.total_bayar.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {penjualans.length > 0 && (
                <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                  <tr>
                    <td colSpan={3} className="p-3 text-slate-500">
                      Total {penjualans.length} Transaksi Invoice
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {penjualans.reduce((s, p) => s + p.total_item, 0).toLocaleString('id-ID')} pcs
                    </td>
                    <td className="p-3 text-slate-500 text-right">Total Pendapatan:</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      Rp {penjualans.reduce((s, p) => s + p.total_bayar, 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* AKUN KAS SUB TAB */}
      {activeSubTab === 'akun' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Akun Kas & Rekening Bank</h3>
              <p className="text-xs text-slate-500">Kelola master buku kas dan rekening perbankan yayasan.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg self-start sm:self-auto">
              Total Saldo Berjalan: Rp {accounts.reduce((sum, acc) => {
                const masukAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
                const keluarAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
                return sum + ((acc.saldo_awal || 0) + masukAcc - keluarAcc);
              }, 0).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => {
              const masukAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
              const keluarAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
              const saldoAcc = (acc.saldo_awal || 0) + masukAcc - keluarAcc;

              return (
                <div key={acc.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{acc.nama_akun}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {acc.kode_akun}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    Rp {saldoAcc.toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[11px] text-slate-400">Mutasi: {mutasis.filter(m => m.account_id === acc.id).length} kali</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingAcc(acc);
                          setAccountName(acc.nama_akun);
                          setModalAccountOpen(true);
                        }}
                        className="text-amber-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModalConfig({
                            isOpen: true,
                            title: 'Hapus Rekening Akun',
                            message: `Yakin ingin menghapus akun ${acc.nama_akun}? Akun yang memiliki riwayat transaksi tidak dapat dihapus demi integritas data.`,
                            variant: 'danger',
                            confirmText: 'Ya, Hapus Akun',
                            onConfirm: () => {
                              const res = deleteAccount(acc.id);
                              if (!res.success) {
                                setToastMessage(`Gagal: ${res.message}`);
                              } else {
                                setToastMessage(`Akun ${acc.nama_akun} berhasil dihapus.`);
                              }
                              setTimeout(() => setToastMessage(null), 3500);
                            }
                          });
                        }}
                        className="text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Structured Table for Accounts */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tabel Rekapitulasi Akun Kas & Bank
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table id="table-finance-akun" className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Kode Akun</th>
                    <th className="p-3">Nama Akun Kas/Bank</th>
                    <th className="p-3 text-right">Saldo Awal</th>
                    <th className="p-3 text-right">Total Masuk</th>
                    <th className="p-3 text-right">Total Keluar</th>
                    <th className="p-3 text-right">Saldo Berjalan</th>
                    <th className="p-3 text-center">Mutasi</th>
                    <th className="p-3 text-right no-export print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accounts.map(acc => {
                    const masukAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
                    const keluarAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
                    const saldoAcc = (acc.saldo_awal || 0) + masukAcc - keluarAcc;
                    const mutasiCount = mutasis.filter(m => m.account_id === acc.id).length;

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-semibold text-slate-500">{acc.kode_akun}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{acc.nama_akun}</td>
                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          Rp {(acc.saldo_awal || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                          +Rp {masukAcc.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                          -Rp {keluarAcc.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                          Rp {saldoAcc.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-mono">{mutasiCount}x</td>
                        <td className="p-3 text-right space-x-2 no-export print:hidden">
                          <button
                            onClick={() => {
                              setEditingAcc(acc);
                              setAccountName(acc.nama_akun);
                              setModalAccountOpen(true);
                            }}
                            className="text-amber-600 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-semibold border-t-2 border-slate-200 dark:border-slate-700 text-[11px]">
                  <tr>
                    <td colSpan={2} className="p-3 text-slate-500">
                      Total {accounts.length} Akun Terdaftar
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      Rp {accounts.reduce((s, a) => s + (a.saldo_awal || 0), 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-600">
                      +Rp {mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-600">
                      -Rp {mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      Rp {accounts.reduce((sum, acc) => {
                        const masukAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
                        const keluarAcc = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
                        return sum + ((acc.saldo_awal || 0) + masukAcc - keluarAcc);
                      }, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-center font-mono">{mutasis.length}x</td>
                    <td className="p-3 no-export print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mutasi Modal */}
      {modalMutasiOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setModalMutasiOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingMutasi ? 'Edit Catatan Mutasi Kas' : 'Catat Mutasi Kas Baru'}
              </h3>
              <form onSubmit={handleSaveMutasi} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipe Mutasi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMutasiForm({ ...mutasiForm, tipe: 'Masuk' })}
                      className={`py-2 rounded-xl font-bold ${
                        mutasiForm.tipe === 'Masuk' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Pemasukan (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMutasiForm({ ...mutasiForm, tipe: 'Keluar' })}
                      className={`py-2 rounded-xl font-bold ${
                        mutasiForm.tipe === 'Keluar' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      Pengeluaran (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pilih Rekening Kas / Bank</label>
                  <select
                    value={mutasiForm.account_id}
                    onChange={e => setMutasiForm({ ...mutasiForm, account_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.nama_akun}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Kategori Transaksi</label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={mutasiForm.nama_kategori}
                    onChange={e => setMutasiForm({ ...mutasiForm, nama_kategori: e.target.value })}
                    placeholder="Ketik atau pilih kategori..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <datalist id="category-suggestions">
                    {categories.map(c => (
                      <option key={c.id} value={c.nama_kategori} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={mutasiForm.nominal || ''}
                    onChange={e => setMutasiForm({ ...mutasiForm, nominal: parseInt(e.target.value) || 0 })}
                    placeholder="Contoh: 500000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Keterangan Detail</label>
                  <textarea
                    rows={2}
                    required
                    value={mutasiForm.keterangan}
                    onChange={e => setMutasiForm({ ...mutasiForm, keterangan: e.target.value })}
                    placeholder="Uraian transaksi keuangan..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalMutasiOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Account Modal */}
      {modalAccountOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setModalAccountOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingAcc ? 'Edit Akun Kas' : 'Tambah Akun Kas / Rekening Baru'}
              </h3>
              <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nama Akun / Rekening</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="Contoh: Bank BSI Yayasan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalAccountOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {rejectingPengajuanId && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setRejectingPengajuanId(null);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tolak Pengajuan Cetak Buku</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Alasan Penolakan</label>
                  <textarea
                    rows={3}
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="Contoh: Alokasi anggaran dialihkan untuk kegiatan retreat..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingPengajuanId(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!rejectNote.trim()) {
                        setToastMessage('⚠️ Harap masukkan alasan penolakan.');
                        setTimeout(() => setToastMessage(null), 3000);
                        return;
                      }
                      rejectPengajuanCetak(rejectingPengajuanId, rejectNote);
                      setToastMessage('Pengajuan cetak berhasil ditolak.');
                      setTimeout(() => setToastMessage(null), 3000);
                      setRejectingPengajuanId(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Tolak Pengajuan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Persetujuan Cetak Modal */}
      {approvingPengajuan && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setApprovingPengajuan(null)}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Persetujuan Cetak & Pencairan Kas
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Penerbitan Surat Perintah Kerja (SPK) Cetak Buku
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setApprovingPengajuan(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2.5 text-xs border border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Judul Buku:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right max-w-[260px] truncate">
                    {approvingPengajuan.bookTitle}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Jumlah Cetak:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {approvingPengajuan.qty.toLocaleString('id-ID')} Eksemplar
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimasi Biaya Cetak:</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Rp {approvingPengajuan.biaya.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Pilih Rekening Kas / Bank Pencairan:
                  </label>
                  <select
                    value={approvingPengajuan.accountId}
                    onChange={e =>
                      setApprovingPengajuan({
                        ...approvingPengajuan,
                        accountId: parseInt(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nama_akun} ({a.kode_akun})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1.5">
                <p className="font-bold flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Proses Otomatis Sistem setelah Disetujui:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
                  <li>
                    Mencatat mutasi <strong>kas keluar</strong> sebesar{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Rp {approvingPengajuan.biaya.toLocaleString('id-ID')}
                    </strong>{' '}
                    pada rekening terpilih.
                  </li>
                  <li>
                    Status pengajuan berubah menjadi{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Disetujui (Approved)
                    </span>
                    .
                  </li>
                  <li>
                    Otomatis menerbitkan SPK ke{' '}
                    <strong>Divisi Produksi</strong> dan mengalokasikan{' '}
                    <strong>{approvingPengajuan.qty} eks</strong> ke inventaris Gudang Logistik.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovingPengajuan(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    approvePengajuanCetak(approvingPengajuan.id, approvingPengajuan.accountId);
                    setToastMessage(
                      `Pengajuan cetak "${approvingPengajuan.bookTitle}" (${approvingPengajuan.qty} Eks) berhasil disetujui!`
                    );
                    setTimeout(() => setToastMessage(null), 4000);
                    setApprovingPengajuan(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui & Terbitkan SPK</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Generic Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmText={confirmModalConfig.confirmText}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center space-x-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
};
