import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertTriangle,
  Globe,
  Trash2,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Percent,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoyaltiPenulis, RoyaltiStatement } from '../../types';
import { RupiahInput } from '../common/RupiahInput';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { DownloadPdfButton } from '../common/DownloadPdfButton';

export const RoyaltiPenerbitanTab: React.FC = () => {
  const {
    royaltiPenulisList,
    addRoyaltiPenulis,
    updateRoyaltiPenulis,
    deleteRoyaltiPenulis,
    royaltiStatements,
    addRoyaltiStatement,
    updateRoyaltiStatement,
    books,
    orders
  } = useApp();

  const [activeTab, setActiveTab] = useState<'master' | 'kalkulator' | 'statements'>('master');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatement, setSelectedStatement] = useState<RoyaltiStatement | null>(null);

  // Modals
  const [isModalRoyaltiOpen, setIsModalRoyaltiOpen] = useState(false);
  const [isModalStatementOpen, setIsModalStatementOpen] = useState(false);

  // Form State: Royalti Penulis Baru
  const [royaltiForm, setRoyaltiForm] = useState({
    buku_id: books[0]?.id || 1,
    nama_penerima: '',
    peran: 'Penerjemah' as 'Penulis' | 'Penerjemah' | 'Editor' | 'Illustrator',
    no_kontak: '',
    email: '',
    rekening_bank: '',
    tipe_royalti: 'persentase' as 'persentase' | 'nominal_per_buku',
    nilai_royalti: 10,
    lisensi_nama: 'Izin Terjemahan Naskah Resmi',
    lisensi_asal: '',
    lisensi_kedaluwarsa: new Date(Date.now() + 365 * 2 * 86400000).toISOString().substring(0, 10),
    maksimal_cetak_lisensi: 5000,
    eksemplar_tercetak: 1000,
    status_lisensi: 'Aktif' as const
  });

  // Form State: Generate Statement Baru
  const [statementForm, setStatementForm] = useState({
    royalti_id: royaltiPenulisList[0]?.id || 1,
    periode: `Semester 1 (Januari - Juni ${new Date().getFullYear()})`,
    total_terjual: 200,
    total_omzet: 30000000,
    total_hak_royalti: 3000000,
    status_bayar: 'Belum Dibayar' as 'Belum Dibayar' | 'Sudah Ditransfer',
    tanggal_bayar: new Date().toISOString().substring(0, 10),
    nomor_referensi_bayar: `TRF-ROY-${new Date().getFullYear()}-001`,
    catatan: ''
  });

  // Calculate Real-Time Sales Metrics per Book from actual Orders
  const bookSalesAnalytics = useMemo(() => {
    const stats: Record<number, { qtyTerjual: number; omzet: number }> = {};
    orders.forEach(ord => {
      // Count completed / paid orders
      if (ord.status === 'Lunas' || ord.status === 'Dikirim' || ord.status === 'Pending') {
        ord.items.forEach(item => {
          if (!stats[item.buku_id]) {
            stats[item.buku_id] = { qtyTerjual: 0, omzet: 0 };
          }
          stats[item.buku_id].qtyTerjual += item.jumlah;
          stats[item.buku_id].omzet += (item.harga_satuan || item.subtotal / (item.jumlah || 1) || 0) * item.jumlah;
        });
      }
    });
    return stats;
  }, [orders]);

  // KPIs
  const totalHakRoyalti = useMemo(() => {
    return royaltiStatements.reduce((sum, s) => sum + (s.total_hak_royalti || 0), 0);
  }, [royaltiStatements]);

  const totalSudahDitransfer = useMemo(() => {
    return royaltiStatements
      .filter(s => s.status_bayar === 'Sudah Ditransfer')
      .reduce((sum, s) => sum + (s.total_hak_royalti || 0), 0);
  }, [royaltiStatements]);

  const totalPendingTransfer = Math.max(0, totalHakRoyalti - totalSudahDitransfer);

  // Filtered List
  const filteredRoyaltiList = useMemo(() => {
    return royaltiPenulisList.filter(r => {
      const book = books.find(b => b.id === r.buku_id);
      return (
        r.nama_penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book?.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.lisensi_asal || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [royaltiPenulisList, searchQuery, books]);

  // Handle Create Royalti
  const handleCreateRoyaltiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!royaltiForm.nama_penerima.trim()) return;

    addRoyaltiPenulis({
      buku_id: Number(royaltiForm.buku_id),
      nama_penerima: royaltiForm.nama_penerima.trim(),
      peran: royaltiForm.peran,
      no_kontak: royaltiForm.no_kontak.trim(),
      email: royaltiForm.email.trim(),
      rekening_bank: royaltiForm.rekening_bank.trim(),
      tipe_royalti: royaltiForm.tipe_royalti,
      nilai_royalti: Number(royaltiForm.nilai_royalti) || 0,
      lisensi_nama: royaltiForm.lisensi_nama.trim(),
      lisensi_asal: royaltiForm.lisensi_asal.trim(),
      lisensi_kedaluwarsa: royaltiForm.lisensi_kedaluwarsa,
      maksimal_cetak_lisensi: Number(royaltiForm.maksimal_cetak_lisensi) || 5000,
      eksemplar_tercetak: Number(royaltiForm.eksemplar_tercetak) || 0,
      status_lisensi: royaltiForm.status_lisensi
    });

    setIsModalRoyaltiOpen(false);
  };

  // Handle Create Statement
  const handleCreateStatementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoyaltiStatement({
      royalti_id: Number(statementForm.royalti_id),
      periode: statementForm.periode,
      total_terjual: Number(statementForm.total_terjual) || 0,
      total_omzet: Number(statementForm.total_omzet) || 0,
      total_hak_royalti: Number(statementForm.total_hak_royalti) || 0,
      status_bayar: statementForm.status_bayar,
      tanggal_bayar: statementForm.status_bayar === 'Sudah Ditransfer' ? statementForm.tanggal_bayar : undefined,
      nomor_referensi_bayar: statementForm.status_bayar === 'Sudah Ditransfer' ? statementForm.nomor_referensi_bayar : undefined,
      catatan: statementForm.catatan
    });
    setIsModalStatementOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Hak Intelektual & Lisensi Naskah Dharma</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kalkulator Royalti & Manajemen Lisensi Hak Cipta
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Kelola bagi hasil royalti penulis, penerjemah, dan editor secara transparan. Pantau masa berlaku lisensi terjemahan internasional (Wisdom Publications, LYWA, dll.) dan cetak laporan <em>Royalty Statement</em> resmi per periode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalStatementOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Statement Royalti</span>
            </button>
            <button
              onClick={() => setIsModalRoyaltiOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Daftar Royalti Naskah Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Royalti */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hak Royalti</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              Rp {totalHakRoyalti.toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Dari {royaltiStatements.length} statement periode
            </p>
          </div>
        </div>

        {/* Sudah Ditransfer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Royalti Telah Ditransfer</p>
            <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 truncate">
              Rp {totalSudahDitransfer.toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">
              Lunas terbayar ke rekening penulis
            </p>
          </div>
        </div>

        {/* Pending Transfer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Menunggu Pembayaran</p>
            <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 truncate">
              Rp {totalPendingTransfer.toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">
              Akan dibayarkan pada tutup buku
            </p>
          </div>
        </div>

        {/* Penulis & Lisensi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
            <Globe className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lisensi Naskah Aktif</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {royaltiPenulisList.length} Judul / Penulis
            </h3>
            <p className="text-[11px] text-purple-600 font-medium">
              {royaltiPenulisList.filter(r => r.status_lisensi === 'Aktif').length} berstatus aman
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            onClick={() => setActiveTab('master')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'master'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Master Royalti & Lisensi ({royaltiPenulisList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('kalkulator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kalkulator'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kalkulator Penjualan Riil</span>
          </button>

          <button
            onClick={() => setActiveTab('statements')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'statements'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Statement & Slip Royalti ({royaltiStatements.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <PrintCurrentViewButton
            id="btn-print-royalti"
            fallbackFilename={`Laporan_Royalti_${activeTab}`}
          />
          <DownloadPdfButton
            id="btn-download-pdf-royalti"
            filename={`Laporan_Royalti_${activeTab}`}
            tooltip="Unduh rekap royalti penerbitan sebagai PDF resmi"
          />
        </div>
      </div>

      {/* TAB 1: MASTER ROYALTI & LISENSI */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama penulis, naskah, atau yayasan lisensi..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <button
              onClick={() => setIsModalRoyaltiOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Master Royalti</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoyaltiList.map(r => {
              const book = books.find(b => b.id === r.buku_id);
              const sales = bookSalesAnalytics[r.buku_id] || { qtyTerjual: 0, omzet: 0 };
              const sisaCetak = Math.max(0, (r.maksimal_cetak_lisensi || 5000) - (r.eksemplar_tercetak || 0));

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                        {r.peran}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        r.status_lisensi === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        Lisensi {r.status_lisensi}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {r.nama_penerima}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{book?.judul || 'Buku Dharma'}</span>
                      </p>
                    </div>

                    {/* Skema Royalti */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Skema Hak Royalti:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {r.tipe_royalti === 'persentase'
                            ? `${r.nilai_royalti}% dari Omzet Buku`
                            : `Rp ${r.nilai_royalti.toLocaleString('id-ID')} / Eksemplar`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Rekening Bank:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                          {r.rekening_bank || '-'}
                        </span>
                      </div>
                    </div>

                    {/* License Info */}
                    {r.lisensi_asal && (
                      <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="flex items-center justify-between">
                          <span>Pemberi Lisensi:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {r.lisensi_asal}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Masa Berlaku Izin:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            s/d {r.lisensi_kedaluwarsa || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Sisa Kuota Cetak:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {sisaCetak.toLocaleString('id-ID')} Eks
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const calculatedRoyalti =
                          r.tipe_royalti === 'persentase'
                            ? Math.round(sales.omzet * (r.nilai_royalti / 100))
                            : Math.round(sales.qtyTerjual * r.nilai_royalti);

                        setStatementForm(prev => ({
                          ...prev,
                          royalti_id: r.id,
                          total_terjual: sales.qtyTerjual,
                          total_omzet: sales.omzet,
                          total_hak_royalti: calculatedRoyalti
                        }));
                        setIsModalStatementOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buat Statement</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus master royalti untuk ${r.nama_penerima}?`)) {
                          deleteRoyaltiPenulis(r.id);
                        }
                      }}
                      className="p-2 ml-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR PENJUALAN RIIL DARI ORDER */}
      {activeTab === 'kalkulator' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Simulasi Perhitungan Royalti Otomatis Real-Time
              </h3>
              <p className="text-xs text-slate-500">
                Data terakumulasi langsung dari seluruh transaksi pesanan lunas di sistem Marketing & POS.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Judul Buku</th>
                    <th className="p-3.5">Penerima Hak</th>
                    <th className="p-3.5">Skema Tarif</th>
                    <th className="p-3.5 text-center">Buku Terjual</th>
                    <th className="p-3.5 text-right">Omzet Kotor</th>
                    <th className="p-3.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      Hak Royalti Terhitung
                    </th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {royaltiPenulisList.map(r => {
                    const book = books.find(b => b.id === r.buku_id);
                    const sales = bookSalesAnalytics[r.buku_id] || { qtyTerjual: 0, omzet: 0 };
                    const calculatedRoyalti =
                      r.tipe_royalti === 'persentase'
                        ? Math.round(sales.omzet * (r.nilai_royalti / 100))
                        : Math.round(sales.qtyTerjual * r.nilai_royalti);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {book?.judul || 'Buku Dharma'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold block">{r.nama_penerima}</span>
                          <span className="text-[10px] text-slate-400">({r.peran})</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {r.tipe_royalti === 'persentase' ? `${r.nilai_royalti}% Omzet` : `Rp ${r.nilai_royalti.toLocaleString('id-ID')}/eks`}
                        </td>
                        <td className="p-3.5 text-center font-bold">
                          {sales.qtyTerjual} Eks
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          Rp {sales.omzet.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                          Rp {calculatedRoyalti.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setStatementForm({
                                royalti_id: r.id,
                                periode: `Periode s/d ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
                                total_terjual: sales.qtyTerjual,
                                total_omzet: sales.omzet,
                                total_hak_royalti: calculatedRoyalti,
                                status_bayar: 'Belum Dibayar',
                                tanggal_bayar: new Date().toISOString().substring(0, 10),
                                nomor_referensi_bayar: `TRF-ROY-${Date.now().toString().slice(-4)}`,
                                catatan: `Rekapitulasi otomatis penjualan buku ${book?.judul}`
                              });
                              setIsModalStatementOpen(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs"
                          >
                            Generate Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATEMENTS & SLIP RESMI */}
      {activeTab === 'statements' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Daftar Lembar Statement & Slip Pembayaran Royalti
                </h3>
                <p className="text-xs text-slate-500">
                  Arsip resmi slip transfer royalti naskah untuk dikirimkan ke pihak penulis atau penerbit pemilik lisensi.
                </p>
              </div>

              <button
                onClick={() => setIsModalStatementOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Statement Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Periode</th>
                    <th className="p-3.5">Penerima Hak</th>
                    <th className="p-3.5 text-center">Buku Terjual</th>
                    <th className="p-3.5 text-right">Omzet Kotor</th>
                    <th className="p-3.5 text-right font-bold">Total Hak Royalti</th>
                    <th className="p-3.5">Status Pembayaran</th>
                    <th className="p-3.5 text-center">Aksi & Cetak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {royaltiStatements.map(st => {
                    const royalti = royaltiPenulisList.find(r => r.id === st.royalti_id);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {st.periode}
                        </td>
                        <td className="p-3.5 font-semibold">
                          {royalti?.nama_penerima || 'Penerima Royalti'}
                        </td>
                        <td className="p-3.5 text-center font-bold">
                          {st.total_terjual} Eks
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          Rp {st.total_omzet.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                          Rp {st.total_hak_royalti.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.status_bayar === 'Sudah Ditransfer'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {st.status_bayar}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedStatement(st)}
                            className="flex items-center space-x-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-lg text-xs font-semibold mx-auto transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Lihat Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR ROYALTI NASKAH BARU */}
      {isModalRoyaltiOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Registrasi Master Royalti & Hak Cipta</h3>
              </div>
              <button
                onClick={() => setIsModalRoyaltiOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoyaltiSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Pilih Naskah / Judul Buku Master *
                </label>
                <select
                  required
                  value={royaltiForm.buku_id}
                  onChange={e => setRoyaltiForm({ ...royaltiForm, buku_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.judul} — {b.penulis} (Harga Jual: Rp {b.harga_jual.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Penerima Royalti *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bhikkhu Subhamitto"
                    value={royaltiForm.nama_penerima}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, nama_penerima: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Peran dalam Naskah
                  </label>
                  <select
                    value={royaltiForm.peran}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, peran: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Penulis">Penulis Utama</option>
                    <option value="Penerjemah">Penerjemah</option>
                    <option value="Editor">Editor Naskah</option>
                    <option value="Illustrator">Illustrator / Perancang</option>
                  </select>
                </div>
              </div>

              {/* Tipe & Nilai Royalti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tipe Royalti
                  </label>
                  <select
                    value={royaltiForm.tipe_royalti}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, tipe_royalti: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="persentase">Persentase dari Omzet (%)</option>
                    <option value="nominal_per_buku">Nominal Tetap per Buku (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {royaltiForm.tipe_royalti === 'persentase' ? 'Besaran Royalti (%)' : 'Besaran Royalti per Buku (Rp)'} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={royaltiForm.nilai_royalti}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, nilai_royalti: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600"
                  />
                </div>
              </div>

              {/* Rekening Bank */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nomor Rekening Bank Penerima
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA 8001122334 a/n Tim Penerjemah Dharma"
                  value={royaltiForm.rekening_bank}
                  onChange={e => setRoyaltiForm({ ...royaltiForm, rekening_bank: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Lisensi Asal Luar Negeri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Pemilik Lisensi Asal (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Wisdom Publications USA"
                    value={royaltiForm.lisensi_asal}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, lisensi_asal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Masa Berlaku Izin Lisensi
                  </label>
                  <input
                    type="date"
                    value={royaltiForm.lisensi_kedaluwarsa}
                    onChange={e => setRoyaltiForm({ ...royaltiForm, lisensi_kedaluwarsa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalRoyaltiOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Daftarkan Royalti Naskah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SLIP STATEMENT ROYALTI (A4 Print Preview) */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Lembar Royalty Statement — {selectedStatement.periode}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Slip</span>
                </button>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Slip Sheet Canvas */}
            <div className="p-8 bg-white text-slate-900 font-sans space-y-6">
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    Official Royalty Statement
                  </h2>
                  <p className="text-xs text-slate-500">
                    Yayasan Pelestarian & Penerbitan Naskah Dharma Nusantara (Lamrimnesia)
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-mono font-bold block">No: {selectedStatement.nomor_referensi_bayar || `STMT-${selectedStatement.id}`}</span>
                  <span className="text-slate-500">Periode: {selectedStatement.periode}</span>
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Penerima Hak Royalti:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {royaltiPenulisList.find(r => r.id === selectedStatement.royalti_id)?.nama_penerima}
                  </span>
                  <span className="text-slate-500 block">
                    Peran: {royaltiPenulisList.find(r => r.id === selectedStatement.royalti_id)?.peran}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Rekening Bank Tujuan:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {royaltiPenulisList.find(r => r.id === selectedStatement.royalti_id)?.rekening_bank || '-'}
                  </span>
                  <span className="text-slate-500 block">
                    Status: {selectedStatement.status_bayar}
                  </span>
                </div>
              </div>

              {/* Calculation Summary Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Keterangan / Naskah Buku</th>
                    <th className="p-3 text-center">Eksemplar Terjual</th>
                    <th className="p-3 text-right">Omzet Kotor</th>
                    <th className="p-3 text-right">Hak Royalti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-semibold">
                      {books.find(b => b.id === royaltiPenulisList.find(r => r.id === selectedStatement.royalti_id)?.buku_id)?.judul || 'Naskah Buku'}
                    </td>
                    <td className="p-3 text-center font-bold">{selectedStatement.total_terjual} Eks</td>
                    <td className="p-3 text-right font-mono">Rp {selectedStatement.total_omzet.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-bold text-indigo-700 font-mono text-sm">
                      Rp {selectedStatement.total_hak_royalti.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Notes & Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-slate-600 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Catatan Keuangan:</span>
                  <p className="italic">{selectedStatement.catatan || 'Pembayaran ditransfer melalui rekening operasional Yayasan.'}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Disahkan Oleh:</span>
                  <span className="font-bold text-slate-900 block pt-4">Bagian Penerbitan & Keuangan Yayasan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
