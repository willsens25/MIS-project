import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BankStatementItem, Account } from '../../types';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronDown,
  X,
  FileText
} from 'lucide-react';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';
import { parseBankStatementCsv } from '../../lib/reconciliationHelper';
import { RupiahInput } from '../common/RupiahInput';

export const BankReconciliationView: React.FC = () => {
  const {
    accounts,
    mutasis,
    bankStatements,
    addBankStatement,
    addBankStatementsBulk,
    updateBankStatement,
    deleteBankStatement,
    clearBankStatements,
    loadSampleBankStatements,
    autoMatchBankStatements,
    createAdjustmentMutasiFromBankItem,
    saveBankReconciliationRecord,
    showToast,
    currentUser
  } = useApp();

  // Selected Account for Reconciliation
  const bankAccounts = useMemo(() => {
    return accounts.filter(a => !a.nama_akun.toLowerCase().includes('tunai'));
  }, [accounts]);

  const [selectedAccountId, setSelectedAccountId] = useState<number>(() => {
    return bankAccounts[0]?.id || accounts[0]?.id || 1;
  });

  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Current sub-view: 'matching' | 'statement' (Berita Acara)
  const [activeTab, setActiveTab] = useState<'matching' | 'statement'>('matching');

  // Filter for bank items
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New item form
  const [newItemForm, setNewItemForm] = useState({
    tanggal: new Date().toISOString().substring(0, 10),
    keterangan: '',
    tipe: 'Masuk' as 'Masuk' | 'Keluar',
    nominal: 0,
    referensi: ''
  });

  // Calculate General Ledger (Buku Kas Yayasan) Balance
  const accountMutasis = useMemo(() => {
    return mutasis.filter(m => m.account_id === selectedAccountId);
  }, [mutasis, selectedAccountId]);

  const totalMutasiMasuk = useMemo(() => {
    return accountMutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
  }, [accountMutasis]);

  const totalMutasiKeluar = useMemo(() => {
    return accountMutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
  }, [accountMutasis]);

  const saldoBukuKas = useMemo(() => {
    return (selectedAccount?.saldo_awal || 0) + totalMutasiMasuk - totalMutasiKeluar;
  }, [selectedAccount, totalMutasiMasuk, totalMutasiKeluar]);

  // Bank Statement Items for this account
  const accountBankItems = useMemo(() => {
    return bankStatements.filter(item => item.account_id === selectedAccountId);
  }, [bankStatements, selectedAccountId]);

  // Computed Bank Balance based on statement items
  const bankMasuk = useMemo(() => {
    return accountBankItems.filter(i => i.tipe === 'Masuk').reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  const bankKeluar = useMemo(() => {
    return accountBankItems.filter(i => i.tipe === 'Keluar').reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  // Physical Bank Statement Ending Balance
  const [customBankEndingBalance, setCustomBankEndingBalance] = useState<number | null>(null);

  const saldoRekeningKoranBank = useMemo(() => {
    if (customBankEndingBalance !== null) return customBankEndingBalance;
    // Default estimated from initial account + bank mutations
    return (selectedAccount?.saldo_awal || 0) + bankMasuk - bankKeluar;
  }, [customBankEndingBalance, selectedAccount, bankMasuk, bankKeluar]);

  // Breakdown for Reconciliation Statement
  const setoranDalamPerjalanan = useMemo(() => {
    // Bank items marked as Deposit in Transit
    return accountBankItems
      .filter(i => i.status_rekonsiliasi === 'Setoran Dalam Perjalanan')
      .reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  const cekBeredar = useMemo(() => {
    // Bank items marked as Outstanding Checks
    return accountBankItems
      .filter(i => i.status_rekonsiliasi === 'Cek Beredar')
      .reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  const pendapatanBankBelumDicatat = useMemo(() => {
    // Bank-only credits like Giro / Interest not yet adjusted into books
    return accountBankItems
      .filter(i => i.status_rekonsiliasi === 'Penyesuaian Buku' && i.tipe === 'Masuk')
      .reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  const bebanBankBelumDicatat = useMemo(() => {
    // Bank-only debits like Admin fee or Tax not yet adjusted into books
    return accountBankItems
      .filter(i => i.status_rekonsiliasi === 'Penyesuaian Buku' && i.tipe === 'Keluar')
      .reduce((s, i) => s + i.nominal, 0);
  }, [accountBankItems]);

  // Adjusted balances
  const saldoBankDisesuaikan = saldoRekeningKoranBank + setoranDalamPerjalanan - cekBeredar;
  const saldoBukuDisesuaikan = saldoBukuKas + pendapatanBankBelumDicatat - bebanBankBelumDicatat;
  const selisihRekonsiliasi = Math.abs(saldoBankDisesuaikan - saldoBukuDisesuaikan);
  const isBalanced = selisihRekonsiliasi === 0;

  // Filtered bank items for UI table
  const filteredBankItems = useMemo(() => {
    return accountBankItems.filter(item => {
      const matchSearch = item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.referensi && item.referensi.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || item.status_rekonsiliasi === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [accountBankItems, searchQuery, statusFilter]);

  // Handlers
  const handleRunAutoMatch = () => {
    if (accountBankItems.length === 0) {
      showToast('Belum ada data rekening koran. Muat contoh atau impor CSV terlebih dahulu.', 'warning');
      return;
    }
    autoMatchBankStatements(selectedAccountId);
  };

  const handleLoadSample = () => {
    loadSampleBankStatements(selectedAccountId);
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.keterangan.trim()) {
      showToast('Keterangan transaksi bank wajib diisi', 'warning');
      return;
    }
    if (newItemForm.nominal <= 0) {
      showToast('Nominal harus lebih dari Rp 0', 'warning');
      return;
    }

    addBankStatement({
      account_id: selectedAccountId,
      tanggal: newItemForm.tanggal,
      keterangan: newItemForm.keterangan.trim(),
      tipe: newItemForm.tipe,
      nominal: newItemForm.nominal,
      referensi: newItemForm.referensi.trim() || undefined,
      status_rekonsiliasi: 'Belum Cocok',
      catatan: 'Ditambahkan manual'
    });

    setIsAddModalOpen(false);
    setNewItemForm({
      tanggal: new Date().toISOString().substring(0, 10),
      keterangan: '',
      tipe: 'Masuk',
      nominal: 0,
      referensi: ''
    });
  };

  const handleImportCsvSubmit = () => {
    if (!importCsvText.trim()) {
      showToast('Harap tempel teks CSV rekening koran bank.', 'warning');
      return;
    }
    const { items, errors } = parseBankStatementCsv(importCsvText, selectedAccountId);
    if (items.length === 0) {
      showToast('Tidak ada data valid yang dapat diimpor dari teks CSV.', 'error');
      return;
    }

    addBankStatementsBulk(items);
    setIsImportModalOpen(false);
    setImportCsvText('');

    if (errors.length > 0) {
      showToast(`Impor selesai dengan ${errors.length} peringatan.`, 'warning');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setImportCsvText(text);
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportStatementCsv = () => {
    const dateStamp = getCsvDateStamp();
    const success = exportDataToCsv({
      filename: `rekonsiliasi_bank_${selectedAccount.nama_akun.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStamp}.csv`,
      title: `BERITA ACARA REKONSILIASI BANK - YAYASAN LAMRIMNESIA (${selectedAccount.nama_akun})`,
      columns: [
        { header: 'No.', accessor: (_, idx) => idx + 1 },
        { header: 'Tanggal', key: 'tanggal' },
        { header: 'Keterangan Rekening Koran', key: 'keterangan' },
        { header: 'Referensi / No. Cek', accessor: i => i.referensi || '-' },
        { header: 'Arus Kas', key: 'tipe' },
        { header: 'Nominal (Rp)', accessor: i => (i.tipe === 'Keluar' ? -i.nominal : i.nominal) },
        { header: 'Status Rekonsiliasi', key: 'status_rekonsiliasi' },
        { header: 'Catatan Audit', accessor: i => i.catatan || '-' }
      ],
      data: accountBankItems
    });
    if (success) {
      showToast('Berhasil mengekspor Berita Acara Rekonsiliasi Bank ke CSV.', 'success');
    }
  };

  const handleArchiveReconciliation = () => {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    saveBankReconciliationRecord({
      account_id: selectedAccountId,
      periode_bulan: monthStr,
      tanggal_rekonsiliasi: today.toISOString().substring(0, 10),
      saldo_buku: saldoBukuKas,
      saldo_bank: saldoRekeningKoranBank,
      total_setoran_dalam_perjalanan: setoranDalamPerjalanan,
      total_cek_beredar: cekBeredar,
      total_pendapatan_bank_belum_tercatat: pendapatanBankBelumDicatat,
      total_beban_bank_belum_tercatat: bebanBankBelumDicatat,
      saldo_disesuaikan_buku: saldoBukuDisesuaikan,
      saldo_disesuaikan_bank: saldoBankDisesuaikan,
      selisih: selisihRekonsiliasi,
      is_balanced: isBalanced,
      status: isBalanced ? 'Terekonsiliasi' : 'Ada Selisih',
      diverifikasi_oleh: currentUser?.name || 'Bendahara Yayasan'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Account Selector & Live Balance Comparison Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Rekonsiliasi Kas & Rekening Koran Bank
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  {selectedAccount.kode_akun}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencocokan mutasi buku kas yayasan dengan laporan rekening koran bank resmi.
              </p>
            </div>
          </div>

          {/* Account Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih Rekening:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(Number(e.target.value));
                setCustomBankEndingBalance(null);
              }}
              className="text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.nama_akun} ({acc.kode_akun})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Metric Cards: Saldo Buku, Saldo Bank, Status Selisih */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          
          {/* 1. Saldo Buku Kas Yayasan */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Saldo Buku Kas Yayasan</span>
              <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                General Ledger
              </span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
              Rp {saldoBukuKas.toLocaleString('id-ID')}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-600 font-semibold">+{accountMutasis.filter(m => m.tipe === 'Masuk').length} Masuk</span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">-{accountMutasis.filter(m => m.tipe === 'Keluar').length} Keluar</span>
            </div>
          </div>

          {/* 2. Saldo Rekening Koran Bank */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Saldo Rekening Koran Bank</span>
              <span className="text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded">
                Bank Statement
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <p className="text-xl font-black text-cyan-700 dark:text-cyan-400">
                Rp {saldoRekeningKoranBank.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>{accountBankItems.length} Baris Bank Terdaftar</span>
              <button
                onClick={() => {
                  const val = prompt('Masukkan saldo akhir rekening koran bank fisik (Rp):', String(saldoRekeningKoranBank));
                  if (val !== null) {
                    const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
                    if (!isNaN(parsed)) setCustomBankEndingBalance(parsed);
                  }
                }}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                title="Sesuaikan saldo akhir fisik bank"
              >
                Ubah Saldo
              </button>
            </div>
          </div>

          {/* 3. Status Selisih Rekonsiliasi */}
          <div className={`p-4 rounded-xl border transition-all ${
            isBalanced
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Status Rekonsiliasi</span>
              {isBalanced ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  <CheckCircle2 className="w-3 h-3" /> SEIMBANG
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  <AlertTriangle className="w-3 h-3" /> PERLU SESUAIKAN
                </span>
              )}
            </div>
            <p className={`text-xl font-black mt-1.5 ${isBalanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-400'}`}>
              {isBalanced ? 'Rp 0 (Cocok Sempurna)' : `Selisih Rp ${selisihRekonsiliasi.toLocaleString('id-ID')}`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isBalanced
                ? 'Seluruh mutasi telah terekonsiliasi dengan rekening bank.'
                : 'Terdapat transaksi bank/buku kas yang belum dicocokkan.'}
            </p>
          </div>

        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunAutoMatch}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Jalankan pencocokan otomatis berdasarkan nominal & tanggal"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Jalankan Auto-Match</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Muat contoh mutasi rekening koran bank untuk simulasi"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Contoh Rekening Koran</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Impor file rekening koran CSV dari internet banking (BCA/Mandiri/BSI)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor CSV Bank</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris Bank</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportStatementCsv}
              disabled={accountBankItems.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleArchiveReconciliation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arsipkan Berita Acara</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation: Tabel Mutasi Bank vs Berita Acara Rekonsiliasi */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matching')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Pencocokan Transaksi Bank ({accountBankItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('statement')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'statement'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formulir Berita Acara Resmi (A4)</span>
          </button>
        </div>

        {activeTab === 'matching' && accountBankItems.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Kosongkan daftar mutasi rekening koran untuk akun ini?')) {
                clearBankStatements(selectedAccountId);
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Data Bank</span>
          </button>
        )}
      </div>

      {/* TAB 1: MATCHING LIST & TABLE */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari keterangan / no. referensi bank..."
                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Cocok">Cocok Sempurna</option>
                <option value="Belum Cocok">Belum Cocok</option>
                <option value="Penyesuaian Buku">Perlu Penyesuaian Buku</option>
                <option value="Setoran Dalam Perjalanan">Setoran Dalam Perjalanan</option>
                <option value="Cek Beredar">Cek Beredar</option>
              </select>
            </div>
          </div>

          {/* Bank Items Table */}
          {accountBankItems.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Belum Ada Mutasi Rekening Koran Bank
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan muat contoh rekening koran bank atau unggah file CSV dari e-banking untuk mulai mencocokkan transaksi dengan jurnal kas yayasan.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Muat Contoh Transaksi Bank
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Impor CSV Rekening Koran
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Keterangan & Referensi Bank</th>
                      <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                      <th className="px-4 py-3">Status Rekonsiliasi</th>
                      <th className="px-4 py-3">Catatan Audit</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredBankItems.map((item) => {
                      const isAdjustmentCandidate = item.status_rekonsiliasi === 'Penyesuaian Buku';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap text-slate-500">
                            {item.tanggal}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.keterangan}
                            </div>
                            {item.referensi && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Ref: {item.referensi}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className={`font-mono font-bold ${
                              item.tipe === 'Masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {item.tipe === 'Masuk' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.status_rekonsiliasi === 'Cocok' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Cocok
                              </span>
                            )}
                            {item.status_rekonsiliasi === 'Penyesuaian Buku' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" /> Penyesuaian Buku
                              </span>
                            )}
                            {item.status_rekonsiliasi === 'Belum Cocok' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                Belum Cocok
                              </span>
                            )}
                            {item.status_rekonsiliasi === 'Setoran Dalam Perjalanan' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                Setoran dlm Perjalanan
                              </span>
                            )}
                            {item.status_rekonsiliasi === 'Cek Beredar' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
                                Cek Beredar
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                            {item.catatan || '-'}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Adjust Mutasi Kas */}
                              {isAdjustmentCandidate && (
                                <button
                                  onClick={() => createAdjustmentMutasiFromBankItem(item)}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                  title="Otomatis buatkan Jurnal Mutasi Kas Yayasan untuk transaksi ini"
                                >
                                  <Zap className="w-2.5 h-2.5" />
                                  <span>Buat Jurnal</span>
                                </button>
                              )}

                              {/* Manual Status Toggle */}
                              <select
                                value={item.status_rekonsiliasi}
                                onChange={(e) => updateBankStatement(item.id, { status_rekonsiliasi: e.target.value as any })}
                                className="text-[10px] px-1.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                              >
                                <option value="Cocok">Cocok</option>
                                <option value="Belum Cocok">Belum Cocok</option>
                                <option value="Penyesuaian Buku">Penyesuaian Buku</option>
                                <option value="Setoran Dalam Perjalanan">Setoran Perjalanan</option>
                                <option value="Cek Beredar">Cek Beredar</option>
                              </select>

                              <button
                                onClick={() => deleteBankStatement(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* TAB 2: OFFICIAL PRINTABLE RECONCILIATION STATEMENT (BERITA ACARA REKONSILIASI BANK) */}
      {activeTab === 'statement' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          
          {/* Header Berita Acara */}
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              YAYASAN LAMRIMNESIA • DIVISI KEUANGAN & AKUNTANSI
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
              BERITA ACARA REKONSILIASI SALDO BANK
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rekening: <strong className="text-slate-800 dark:text-slate-200">{selectedAccount.nama_akun}</strong> ({selectedAccount.kode_akun}) • Per Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Dua Kolom Standar Akuntansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sisi Kiri: Rekonsiliasi Saldo Bank */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  I. SISI REKENING KORAN BANK
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bank Statement</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Saldo Akhir per Rekening Koran:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    Rp {saldoRekeningKoranBank.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">Ditambah (+):</span>
                  <div className="flex justify-between pl-3 py-0.5 text-slate-600 dark:text-slate-400">
                    <span>Setoran dalam Perjalanan (Deposit in Transit):</span>
                    <span className="font-mono font-semibold">Rp {setoranDalamPerjalanan.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-rose-600 uppercase">Dikurangi (-):</span>
                  <div className="flex justify-between pl-3 py-0.5 text-slate-600 dark:text-slate-400">
                    <span>Cek / Pengeluaran Beredar (Outstanding Checks):</span>
                    <span className="font-mono font-semibold">(Rp {cekBeredar.toLocaleString('id-ID')})</span>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t-2 border-slate-300 dark:border-slate-600 font-bold text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg">
                  <span>Saldo Kas Bank yang Disesuaikan:</span>
                  <span className="font-mono font-black">
                    Rp {saldoBankDisesuaikan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Rekonsiliasi Saldo Buku Kas Yayasan */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  II. SISI BUKU KAS YAYASAN
                </span>
                <span className="text-[10px] text-slate-400 font-mono">General Ledger</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Saldo Kas per Buku Yayasan:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    Rp {saldoBukuKas.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">Ditambah (+):</span>
                  <div className="flex justify-between pl-3 py-0.5 text-slate-600 dark:text-slate-400">
                    <span>Pendapatan Jasa Giro / Bagi Hasil Bank:</span>
                    <span className="font-mono font-semibold">Rp {pendapatanBankBelumDicatat.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-rose-600 uppercase">Dikurangi (-):</span>
                  <div className="flex justify-between pl-3 py-0.5 text-slate-600 dark:text-slate-400">
                    <span>Beban Administrasi Bank & Pajak Giro:</span>
                    <span className="font-mono font-semibold">(Rp {bebanBankBelumDicatat.toLocaleString('id-ID')})</span>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t-2 border-slate-300 dark:border-slate-600 font-bold text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg">
                  <span>Saldo Kas Buku yang Disesuaikan:</span>
                  <span className="font-mono font-black">
                    Rp {saldoBukuDisesuaikan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Summary Box Status Seimbang */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            isBalanced
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
              <span>
                {isBalanced
                  ? 'KESIMPULAN: Saldo Kas Bank dan Saldo Buku Kas Yayasan telah SEIMBANG (Zero Variance / Rp 0 Selisih).'
                  : `PERHATIAN: Terdapat selisih rekonsiliasi sebesar Rp ${selisihRekonsiliasi.toLocaleString('id-ID')}. Periksa transaksi yang belum cocok.`}
              </span>
            </div>
            <span className="text-sm font-mono font-black">
              SELISIH: Rp {selisihRekonsiliasi.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Tanda Tangan Resmi Yayasan (Print Ready) */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500 font-medium">Disiapkan oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Bendahara / Bagian Keuangan</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Tanda Tangan Digital Terverifikasi]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[160px]">
                {currentUser?.name || 'Siti Rahmawati'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Mengetahui & Menyetujui,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Ketua Yayasan / Direktur</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Stempel & Tanda Tangan]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[160px]">
                Direktur Utama Yayasan
              </p>
            </div>
          </div>

          {/* Action Print Button */}
          <div className="flex justify-end gap-2 pt-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Berita Acara (A4)</span>
            </button>
          </div>

        </div>
      )}

      {/* MODAL 1: TAMBAH MUTASI BANK MANUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tambah Baris Rekening Koran Bank
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Transaksi Bank</label>
                <input
                  type="date"
                  value={newItemForm.tanggal}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, tanggal: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jenis Arus</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemForm(prev => ({ ...prev, tipe: 'Masuk' }))}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      newItemForm.tipe === 'Masuk'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    + Kredit (Masuk ke Bank)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemForm(prev => ({ ...prev, tipe: 'Keluar' }))}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      newItemForm.tipe === 'Keluar'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    - Debet (Keluar dari Bank)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={newItemForm.keterangan}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Contoh: TRF SETORAN POS / BIAYA ADM REK"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nominal (Rp)</label>
                <RupiahInput
                  value={newItemForm.nominal}
                  onChange={(val) => setNewItemForm(prev => ({ ...prev, nominal: val }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">No. Referensi / Cek (Opsional)</label>
                <input
                  type="text"
                  value={newItemForm.referensi}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, referensi: e.target.value }))}
                  placeholder="Contoh: REF-99018"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPOR CSV REKENING KORAN BANK */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Impor Rekening Koran CSV ({selectedAccount.nama_akun})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mendukung ekspor e-banking BCA, Mandiri, BSI, dan bank umum lainnya.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih File CSV atau Tempel Teks:
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas CSV...</span>
                  </button>
                  <span className="text-[11px] text-slate-400">Atau tempel teks CSV di bawah:</span>
                </div>

                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`Tanggal,Keterangan,Tipe,Nominal,Referensi\n2026-09-29,"TRF INVOICE POS",CR,450000,REF-001\n2026-09-29,"BIAYA ADM BULANAN",DB,15000,ADM-99`}
                  className="w-full p-2.5 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Format Kolom CSV yang didukung:
                </span>
                <p>Kolom 1: Tanggal (YYYY-MM-DD) • Kolom 2: Keterangan • Kolom 3: Tipe (CR/DB atau Masuk/Keluar) • Kolom 4: Nominal • Kolom 5: No Referensi.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportCsvSubmit}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Proses Impor Rekening Koran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
