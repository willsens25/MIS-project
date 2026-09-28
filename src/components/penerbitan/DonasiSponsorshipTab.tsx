import React, { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  BookOpen,
  DollarSign,
  Users,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Share2,
  FileText,
  Download,
  Award,
  Calendar,
  Building,
  ArrowUpRight,
  Eye,
  Trash2,
  ExternalLink,
  Gift,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonasiProyekCetak, DonasiSponsorRecord } from '../../types';
import { RupiahInput } from '../common/RupiahInput';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { DownloadPdfButton } from '../common/DownloadPdfButton';

export const DonasiSponsorshipTab: React.FC = () => {
  const {
    donasiProyeks,
    addDonasiProyek,
    updateDonasiProyek,
    deleteDonasiProyek,
    donasiSponsors,
    addDonasiSponsor,
    deleteDonasiSponsor,
    books,
    accounts,
    identitasList,
    orders
  } = useApp();

  const [activeView, setActiveView] = useState<'katalog' | 'sponsor_list' | 'dedikasi_page'>('katalog');
  const [selectedProyekId, setSelectedProyekId] = useState<number>(donasiProyeks[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isModalProyekOpen, setIsModalProyekOpen] = useState(false);
  const [isModalDonasiOpen, setIsModalDonasiOpen] = useState(false);
  const [selectedCertificateDonor, setSelectedCertificateDonor] = useState<DonasiSponsorRecord | null>(null);

  // Form State: Proyek Baru
  const [proyekForm, setProyekForm] = useState({
    judul_proyek: '',
    kode_proyek: `FAS-${new Date().getFullYear()}-0${donasiProyeks.length + 1}`,
    buku_id: books[0]?.id || 1,
    target_eksemplar: 1000,
    target_dana: 25000000,
    tanggal_mulai: new Date().toISOString().substring(0, 10),
    target_selesai: new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
    status: 'Penggalangan' as const,
    deskripsi: '',
    tujuan_distribusi: '',
    halaman_dedikasi_catatan: ''
  });

  // Form State: Catat Donasi Baru
  const [donasiForm, setDonasiForm] = useState({
    proyek_id: donasiProyeks[0]?.id || 1,
    identitas_id: undefined as number | undefined,
    nama_donatur: '',
    no_wa: '',
    nominal: 500000,
    paket: 'Paket Teratai (5 Buku)',
    jumlah_eksemplar_didukung: 10,
    nama_dedikasi: '',
    doa_dedikasi: 'Semoga kebajikan ini melimpah bagi keluarga dan semua makhluk.',
    tanggal: new Date().toISOString().substring(0, 10),
    account_id: accounts[0]?.id || 1,
    auto_mutasi: true
  });

  // KPI Calculations
  const totalDanaTerkumpul = useMemo(() => {
    return donasiSponsors.reduce((sum, s) => sum + (s.nominal || 0), 0);
  }, [donasiSponsors]);

  const totalTargetDana = useMemo(() => {
    return donasiProyeks.reduce((sum, p) => sum + (p.target_dana || 0), 0);
  }, [donasiProyeks]);

  const totalBukuTerdanai = useMemo(() => {
    return donasiSponsors.reduce((sum, s) => sum + (s.jumlah_eksemplar_didukung || 0), 0);
  }, [donasiSponsors]);

  const totalDonaturUnik = useMemo(() => {
    const names = new Set(donasiSponsors.map(s => s.nama_donatur.trim().toLowerCase()));
    return names.size;
  }, [donasiSponsors]);

  // Filtered Proyeks
  const filteredProyeks = useMemo(() => {
    return donasiProyeks.filter(p => {
      const matchSearch =
        p.judul_proyek.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nama_buku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kode_proyek.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [donasiProyeks, searchQuery, statusFilter]);

  // Selected Proyek for Dedication Page Preview
  const activeProyekForDedication = useMemo(() => {
    return donasiProyeks.find(p => p.id === selectedProyekId) || donasiProyeks[0];
  }, [donasiProyeks, selectedProyekId]);

  // Sponsors for Selected Proyek
  const activeProyekSponsors = useMemo(() => {
    if (!activeProyekForDedication) return [];
    return donasiSponsors.filter(s => s.proyek_id === activeProyekForDedication.id);
  }, [activeProyekForDedication, donasiSponsors]);

  // Handle Proyek Create
  const handleCreateProyekSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find(b => b.id === Number(proyekForm.buku_id));
    addDonasiProyek({
      kode_proyek: proyekForm.kode_proyek || `FAS-${Date.now().toString().slice(-4)}`,
      judul_proyek: proyekForm.judul_proyek,
      buku_id: targetBook?.id,
      nama_buku: targetBook?.judul || 'Buku Dharma Baru',
      penulis: targetBook?.penulis || 'Penulis Dharma',
      target_eksemplar: Number(proyekForm.target_eksemplar) || 1000,
      target_dana: Number(proyekForm.target_dana) || 25000000,
      tanggal_mulai: proyekForm.tanggal_mulai,
      target_selesai: proyekForm.target_selesai,
      status: proyekForm.status,
      deskripsi: proyekForm.deskripsi,
      tujuan_distribusi: proyekForm.tujuan_distribusi,
      halaman_dedikasi_catatan: proyekForm.halaman_dedikasi_catatan
    });
    setIsModalProyekOpen(false);
  };

  // Handle Donasi Create
  const handleCreateDonasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donasiForm.nama_donatur.trim() || donasiForm.nominal <= 0) return;

    addDonasiSponsor(
      {
        proyek_id: Number(donasiForm.proyek_id),
        identitas_id: donasiForm.identitas_id,
        nama_donatur: donasiForm.nama_donatur.trim(),
        no_wa: donasiForm.no_wa.trim(),
        nominal: Number(donasiForm.nominal),
        paket: donasiForm.paket,
        jumlah_eksemplar_didukung: Number(donasiForm.jumlah_eksemplar_didukung) || 1,
        nama_dedikasi: donasiForm.nama_dedikasi.trim() || donasiForm.nama_donatur.trim(),
        doa_dedikasi: donasiForm.doa_dedikasi.trim(),
        tanggal: donasiForm.tanggal,
        account_id: Number(donasiForm.account_id),
        status_verifikasi: 'Terverifikasi'
      },
      donasiForm.auto_mutasi
    );

    setIsModalDonasiOpen(false);
    // Reset form
    setDonasiForm({
      ...donasiForm,
      nama_donatur: '',
      no_wa: '',
      nominal: 500000,
      nama_dedikasi: '',
      doa_dedikasi: 'Semoga kebajikan ini melimpah bagi keluarga dan semua makhluk.'
    });
  };

  // WhatsApp Share Message Generator
  const sendWhatsAppAnumodana = (sponsor: DonasiSponsorRecord) => {
    const cleanPhone = (sponsor.no_wa || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const proyek = donasiProyeks.find(p => p.id === sponsor.proyek_id);

    const msg = `🙏 *Anumodana & Ucapan Terima Kasih Donasi Cetak Dharma* 🙏\n\n` +
      `Kepada Yth. *${sponsor.nama_donatur}*,\n\n` +
      `Yayasan Pelestarian & Penerbitan Naskah Dharma Nusantara (Lamrimnesia) dengan penuh sukacita dan rasa hormat yang mendalam telah menerima dana kebajikan sponsorship cetak buku:\n\n` +
      `📖 *Proyek:* ${proyek?.judul_proyek || 'Penerbitan Buku Dharma'}\n` +
      `📚 *Judul Buku:* ${proyek?.nama_buku || '-'}\n` +
      `💰 *Nominal Dana:* Rp ${sponsor.nominal.toLocaleString('id-ID')}\n` +
      `🧾 *No. Tanda Terima:* ${sponsor.nomor_tanda_terima || '-'}\n` +
      `✨ *Dukungan:* ~${sponsor.jumlah_eksemplar_didukung} eksemplar buku dharma\n\n` +
      `🌟 *Nama Dedikasi yang Dicantumkan di Buku:*\n` +
      `"${sponsor.nama_dedikasi || sponsor.nama_donatur}"\n` +
      `🕊️ *Doa & Aspirasi Kebajikan:*\n` +
      `"${sponsor.doa_dedikasi || '-'}"\n\n` +
      `Semoga melalui jasa kebajikan penyebaran ajaran Dharma (Dhamma Dana) yang tak ternilai ini, Anda dan seluruh sanak keluarga senantiasa dilimpahi berkah kesehatan prima, ketenangan batin, panjang umur, kedamaian, dan kemajuan spiritual menuju pencerahan sejati.\n\n` +
      `*Yayasan Lamrimnesia*\n` +
      `_Pustaka Dharma Nusantara_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Filosofi Dhamma Dana */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sabba Dānam Dhamma Dānam Jināti — Pemberian Dharma Mengungguli Segala Pemberian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Program Fashili & Donasi Cetak Buku Dharma
            </h2>
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Pusat penggalangan dana gotong-royong pelestarian pustaka suci Buddhis. Kelola target biaya produksi naskah, pencatatan donatur terverifikasi, dan otomatisasi tata letak Halaman Persembahan Nama Dedikasi (*Book Dedication Page*) langsung siap cetak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalDonasiOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Catat Donasi Masuk</span>
            </button>
            <button
              onClick={() => setIsModalProyekOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-white/20 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Proyek Fashili Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dana */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Dana Terhimpun</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              Rp {totalDanaTerkumpul.toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">
              {totalTargetDana > 0 ? `${Math.round((totalDanaTerkumpul / totalTargetDana) * 100)}% dari target cetak` : 'Target tercapai'}
            </p>
          </div>
        </div>

        {/* Total Donatur */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pelindung Dharma / Donatur</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {donasiSponsors.length} Donasi ({totalDonaturUnik} Dermawan)
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">
              Terverifikasi masuk kas yayasan
            </p>
          </div>
        </div>

        {/* Buku Terdanai */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Buku Terdanai</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {totalBukuTerdanai.toLocaleString('id-ID')} Eksemplar
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">
              Untuk perpustakaan & vihara binaan
            </p>
          </div>
        </div>

        {/* Proyek Aktif */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Proyek Cetak</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
              {donasiProyeks.filter(p => p.status === 'Penggalangan').length} Aktif / {donasiProyeks.length} Total
            </h3>
            <p className="text-[11px] text-purple-600 font-medium">
              {donasiProyeks.filter(p => p.status === 'Proses Cetak' || p.status === 'Selesai & Didistribusikan').length} naskah terealisasi
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            onClick={() => setActiveView('katalog')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'katalog'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Katalog Proyek Cetak ({donasiProyeks.length})</span>
          </button>

          <button
            onClick={() => setActiveView('sponsor_list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'sponsor_list'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Daftar Donatur & Kuitansi ({donasiSponsors.length})</span>
          </button>

          <button
            onClick={() => setActiveView('dedikasi_page')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'dedikasi_page'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🪷 Layout Halaman Dedikasi Buku</span>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-2">
          <PrintCurrentViewButton
            id="btn-print-donasi"
            fallbackFilename={`Laporan_Fashili_Donasi_${activeView}`}
          />
          <DownloadPdfButton
            id="btn-download-pdf-donasi"
            filename={`Laporan_Fashili_Donasi_${activeView}`}
            tooltip="Unduh tampilan laporan donasi fashili sebagai PDF resmi"
          />
        </div>
      </div>

      {/* VIEW 1: KATALOG PROYEK FASHILI CETAK */}
      {activeView === 'katalog' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari judul proyek fashili atau naskah..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100"
              >
                <option value="all">Semua Status Proyek</option>
                <option value="Penggalangan">Penggalangan Aktif</option>
                <option value="Target Tercapai">Target Tercapai</option>
                <option value="Proses Cetak">Sedang Dicetak</option>
                <option value="Selesai & Didistribusikan">Selesai & Didistribusikan</option>
              </select>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProyeks.map(proyek => {
              const pct = Math.min(100, Math.round((proyek.dana_terkumpul / (proyek.target_dana || 1)) * 100));
              const sisaDana = Math.max(0, proyek.target_dana - proyek.dana_terkumpul);
              const relatedDonors = donasiSponsors.filter(s => s.proyek_id === proyek.id);

              return (
                <div
                  key={proyek.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Code & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/50">
                        {proyek.kode_proyek}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        proyek.status === 'Penggalangan'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : proyek.status === 'Target Tercapai'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : proyek.status === 'Proses Cetak'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {proyek.status}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {proyek.judul_proyek}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{proyek.nama_buku}</span>
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {proyek.deskripsi}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Rp {proyek.dana_terkumpul.toLocaleString('id-ID')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Target: Rp {proyek.target_dana.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100
                              ? 'bg-emerald-500'
                              : pct >= 50
                              ? 'bg-amber-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{pct}% Tercapai</span>
                        {sisaDana > 0 ? (
                          <span className="text-amber-600 font-medium">Kurang Rp {sisaDana.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Lunas Terdanai</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quota & Beneficiaries */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block">Target Cetak:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {proyek.target_eksemplar.toLocaleString('id-ID')} Eks
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                        <span className="text-slate-400 block">Dermawan:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {relatedDonors.length} Donatur
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setDonasiForm(prev => ({
                          ...prev,
                          proyek_id: proyek.id
                        }));
                        setIsModalDonasiOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>Berdana Sekarang</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProyekId(proyek.id);
                        setActiveView('dedikasi_page');
                      }}
                      title="Pratinjau Halaman Dedikasi Buku"
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 hover:text-amber-600 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Dedikasi</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus proyek fashili "${proyek.judul_proyek}"?`)) {
                          deleteDonasiProyek(proyek.id);
                        }
                      }}
                      title="Hapus Proyek"
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
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

      {/* VIEW 2: DAFTAR DONATUR & KUITANSI */}
      {activeView === 'sponsor_list' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Rekapitulasi Donatur & Sponsorship Terverifikasi
                </h3>
                <p className="text-xs text-slate-500">
                  Seluruh dana yang masuk telah tercatat secara otomatis di Kas Keuangan Yayasan.
                </p>
              </div>

              <button
                onClick={() => setIsModalDonasiOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Donasi Manual</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">No. Tanda Terima</th>
                    <th className="p-3.5">Nama Donatur</th>
                    <th className="p-3.5">Proyek Naskah</th>
                    <th className="p-3.5">Nominal Dana</th>
                    <th className="p-3.5">Nama Dedikasi Buku</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5 text-center">Aksi & Anumodana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {donasiSponsors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada catatan donasi sponsor. Klik "Catat Donasi Masuk" untuk menambahkan.
                      </td>
                    </tr>
                  ) : (
                    donasiSponsors.map(sponsor => {
                      const proyek = donasiProyeks.find(p => p.id === sponsor.proyek_id);
                      return (
                        <tr key={sponsor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            {sponsor.nomor_tanda_terima || `DON-${sponsor.id}`}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {sponsor.nama_donatur}
                            </span>
                            {sponsor.no_wa && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {sponsor.no_wa}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 max-w-xs truncate">
                            <span className="text-slate-900 dark:text-slate-200 font-medium block truncate">
                              {proyek?.nama_buku || 'Buku Dharma'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {proyek?.judul_proyek}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {sponsor.nominal.toLocaleString('id-ID')}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              ({sponsor.jumlah_eksemplar_didukung} Eks)
                            </span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                              "{sponsor.nama_dedikasi || sponsor.nama_donatur}"
                            </span>
                            <span className="text-[10px] text-slate-400 italic block truncate">
                              {sponsor.doa_dedikasi || '-'}
                            </span>
                          </td>
                          <td className="p-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                            {sponsor.tanggal}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* WhatsApp Anumodana */}
                              <button
                                onClick={() => sendWhatsAppAnumodana(sponsor)}
                                title="Kirim Ucapan Anumodana via WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* View Certificate */}
                              <button
                                onClick={() => setSelectedCertificateDonor(sponsor)}
                                title="Lihat Piagam Apresiasi Anumodana"
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus donasi ${sponsor.nama_donatur}?`)) {
                                    deleteDonasiSponsor(sponsor.id);
                                  }
                                }}
                                title="Hapus Donasi"
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GENERATOR & PREVIEW HALAMAN DEDIKASI BUKU */}
      {activeView === 'dedikasi_page' && (
        <div className="space-y-6">
          {/* Selector Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Proyek Cetak:
              </label>
              <select
                value={selectedProyekId}
                onChange={e => setSelectedProyekId(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
              >
                {donasiProyeks.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.kode_proyek} — {p.nama_buku} ({donasiSponsors.filter(s => s.proyek_id === p.id).length} Donatur)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Ekspor PDF Halaman Dedikasi</span>
              </button>
            </div>
          </div>

          {/* SACRED BOOK DEDICATION PAGE LAYOUT (A4-Style Layout Sheet) */}
          <div className="max-w-3xl mx-auto bg-stone-50 text-stone-900 border-4 border-amber-900/30 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden font-serif">
            {/* Buddhist Ornate Corner Accents */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800/60" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800/60" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800/60" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800/60" />

            {/* Sacred Lotus Watermark */}
            <div className="text-center space-y-3 border-b-2 border-amber-900/20 pb-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-amber-950 uppercase">
                Persembahan Jasa Kebajikan
              </h1>
              <p className="text-xs sm:text-sm italic text-stone-600 max-w-xl mx-auto leading-relaxed">
                "Pemberian Dharma melampaui segala bentuk pemberian. Jasa kebajikan dari mencetak dan menyebarkan ajaran suci ini dipersembahkan demi tercapainya pembebasan dan kebahagiaan sejati bagi semua makhluk di sepuluh penjuru."
              </p>
              <div className="text-[11px] font-sans font-bold text-amber-900 tracking-wider">
                Naskah: {activeProyekForDedication?.nama_buku} ({activeProyekForDedication?.kode_proyek})
              </div>
            </div>

            {/* Donor Group 1: Pelindung Utama / Mahadana */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-4 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-sans font-bold uppercase tracking-wider">
                  Pelindung Dharma Utama (Mahadana Patron)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProyekSponsors
                  .filter(s => s.nominal >= 2500000)
                  .map(sponsor => (
                    <div
                      key={sponsor.id}
                      className="bg-white/90 border border-amber-200/80 p-4 rounded-xl shadow-xs space-y-1.5"
                    >
                      <h4 className="font-bold text-sm text-stone-900">
                        {sponsor.nama_dedikasi || sponsor.nama_donatur}
                      </h4>
                      <p className="text-xs text-stone-600 italic">
                        "{sponsor.doa_dedikasi || 'Semoga semua makhluk senantiasa damai dan berbahagia.'}"
                      </p>
                      <div className="text-[10px] font-sans text-amber-800 font-semibold pt-1">
                        Penyokong: {sponsor.nama_donatur}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Donor Group 2: Pelindung Dharma & Donatur Umum */}
            <div className="space-y-4 pt-4 border-t border-amber-900/15">
              <div className="text-center">
                <span className="px-4 py-1 rounded-full bg-stone-200/80 text-stone-800 text-xs font-sans font-bold uppercase tracking-wider">
                  Para Donatur & Pelindung Naskah
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeProyekSponsors
                  .filter(s => s.nominal < 2500000)
                  .map(sponsor => (
                    <div
                      key={sponsor.id}
                      className="bg-white/70 border border-stone-200 p-3 rounded-lg text-xs space-y-1"
                    >
                      <span className="font-bold text-stone-800 block">
                        {sponsor.nama_dedikasi || sponsor.nama_donatur}
                      </span>
                      {sponsor.doa_dedikasi && (
                        <p className="text-[11px] text-stone-500 italic line-clamp-2">
                          "{sponsor.doa_dedikasi}"
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Closing Dharma Prayer */}
            <div className="text-center pt-8 border-t-2 border-amber-900/20 text-xs text-stone-600 space-y-2">
              <p className="font-bold text-amber-950 uppercase tracking-widest text-[11px] font-sans">
                Yayasan Pelestarian & Penerbitan Naskah Dharma Nusantara (Lamrimnesia)
              </p>
              <p className="italic">
                Dicetak dengan restu para Guru Silsilah dan didistribusikan secara berkesinambungan. Sadhu, Sadhu, Sadhu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT DONASI BARU */}
      {isModalDonasiOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 fill-white" />
                <h3 className="font-bold text-base">Pencatatan Donasi & Sponsorship Cetak</h3>
              </div>
              <button
                onClick={() => setIsModalDonasiOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDonasiSubmit} className="p-6 space-y-4 text-xs">
              {/* Proyek Selector */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Pilih Proyek Cetak Naskah *
                </label>
                <select
                  required
                  value={donasiForm.proyek_id}
                  onChange={e => setDonasiForm({ ...donasiForm, proyek_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  {donasiProyeks.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.kode_proyek} — {p.nama_buku} (Target: Rp {p.target_dana.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Donatur Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Lengkap Donatur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendrik Wijaya"
                    value={donasiForm.nama_donatur}
                    onChange={e => setDonasiForm({ ...donasiForm, nama_donatur: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nomor WhatsApp (Untuk Tanda Terima)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={donasiForm.no_wa}
                    onChange={e => setDonasiForm({ ...donasiForm, no_wa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Nominal & Quick Chips */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nominal Donasi (Rp) *
                </label>
                <RupiahInput
                  value={donasiForm.nominal}
                  onChange={val => {
                    const eks = Math.max(1, Math.round(val / 25000));
                    setDonasiForm({
                      ...donasiForm,
                      nominal: val,
                      jumlah_eksemplar_didukung: eks
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-600"
                />
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[100000, 250000, 500000, 1000000, 2500000, 5000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        const eks = Math.max(1, Math.round(amt / 25000));
                        setDonasiForm({
                          ...donasiForm,
                          nominal: amt,
                          jumlah_eksemplar_didukung: eks
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      +Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedication Name */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nama yang Dicantumkan di Halaman Dedikasi Buku *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Keluarga Besar Budi Santoso & Alm. Tan Ah Kow"
                  value={donasiForm.nama_dedikasi}
                  onChange={e => setDonasiForm({ ...donasiForm, nama_dedikasi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Boleh atas nama keluarga, leluhur yang telah berpulang, atau nama doa aspirasi kebajikan.
                </p>
              </div>

              {/* Dedication Prayer */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Doa / Aspirasi Kebajikan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Semoga terlahir di alam bahagia Sukhavati dan semua makhluk berbahagia..."
                  value={donasiForm.doa_dedikasi}
                  onChange={e => setDonasiForm({ ...donasiForm, doa_dedikasi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Account Bank & Auto Mutasi Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Rekening Kas Yayasan Penerima
                  </label>
                  <select
                    value={donasiForm.account_id}
                    onChange={e => setDonasiForm({ ...donasiForm, account_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.nama_akun} ({acc.kode_akun})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="auto_mutasi"
                    checked={donasiForm.auto_mutasi}
                    onChange={e => setDonasiForm({ ...donasiForm, auto_mutasi: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <label htmlFor="auto_mutasi" className="text-slate-700 dark:text-slate-300 font-medium">
                    Otomatis catat jurnal kas masuk ke Keuangan Yayasan
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalDonasiOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Terbitkan Tanda Terima</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUKA PROYEK FASHILI BARU */}
      {isModalProyekOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Buka Program Fashili / Sponsorship Cetak Baru</h3>
              </div>
              <button
                onClick={() => setIsModalProyekOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProyekSubmit} className="p-6 space-y-4 text-xs">
              {/* Linked Book */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Pilih Naskah / Judul Buku Master *
                </label>
                <select
                  required
                  value={proyekForm.buku_id}
                  onChange={e => {
                    const bId = Number(e.target.value);
                    const b = books.find(book => book.id === bId);
                    setProyekForm({
                      ...proyekForm,
                      buku_id: bId,
                      judul_proyek: b ? `Fashili Cetak: ${b.judul}` : proyekForm.judul_proyek
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.judul} — {b.penulis} (HPP: Rp {(b.biaya_pokok || 0).toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Program Fashili *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fashili Cetak Massal Sutra Hati"
                    value={proyekForm.judul_proyek}
                    onChange={e => setProyekForm({ ...proyekForm, judul_proyek: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Kode Proyek
                  </label>
                  <input
                    type="text"
                    value={proyekForm.kode_proyek}
                    onChange={e => setProyekForm({ ...proyekForm, kode_proyek: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Target Eksemplar & Target Dana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Target Cetak (Eksemplar) *
                  </label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={proyekForm.target_eksemplar}
                    onChange={e => setProyekForm({ ...proyekForm, target_eksemplar: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Target Kebutuhan Dana Cetak (Rp) *
                  </label>
                  <RupiahInput
                    value={proyekForm.target_dana}
                    onChange={val => setProyekForm({ ...proyekForm, target_dana: val })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-amber-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Deskripsi & Tujuan Distribusi
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tujuan penerbitan buku ini dan target penerima manfaatnya (misal: 100 vihara binaan luar Jawa)..."
                  value={proyekForm.deskripsi}
                  onChange={e => setProyekForm({ ...proyekForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalProyekOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buka Program Fashili</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PIAGAM APRESIASI ANUMODANA DONATUR (Certificate of Merit) */}
      {selectedCertificateDonor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Piagam Apresiasi Anumodana — {selectedCertificateDonor.nomor_tanda_terima}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Piagam</span>
                </button>
                <button
                  onClick={() => setSelectedCertificateDonor(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="p-8 sm:p-12 bg-amber-50/40 text-stone-900 border-8 border-double border-amber-800/40 m-4 rounded-2xl relative font-serif text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-600/40 flex items-center justify-center text-amber-800 shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-amber-950">
                  Piagam Penghargaan Anumodana
                </h2>
                <p className="text-xs uppercase tracking-widest font-sans font-bold text-amber-800">
                  Yayasan Pelestarian & Penerbitan Naskah Dharma Nusantara
                </p>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-xs italic text-stone-600">Diberikan dengan rasa hormat dan syukur mendalam kepada:</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 underline decoration-amber-500/60 decoration-2 underline-offset-4">
                  {selectedCertificateDonor.nama_donatur}
                </h3>
                <p className="text-xs text-stone-700 max-w-lg mx-auto leading-relaxed pt-2">
                  Atas kedermawanan dan kebajikan tak ternilai dalam menyokong pencetakan naskah suci Dharma:
                </p>
                <p className="text-sm font-bold text-amber-900 font-sans">
                  "{donasiProyeks.find(p => p.id === selectedCertificateDonor.proyek_id)?.nama_buku || 'Buku Dharma'}"
                </p>
                <p className="text-xs font-mono text-stone-600 font-semibold">
                  Nominal: Rp {selectedCertificateDonor.nominal.toLocaleString('id-ID')} (~{selectedCertificateDonor.jumlah_eksemplar_didukung} Eksemplar)
                </p>
              </div>

              <div className="p-3 bg-white/70 border border-amber-200 rounded-xl max-w-md mx-auto text-xs italic text-stone-700">
                "{selectedCertificateDonor.doa_dedikasi || 'Semoga kebajikan ini melimpah bagi semua makhluk.'}"
              </div>

              <div className="pt-6 grid grid-cols-2 gap-8 text-xs font-sans text-stone-700 border-t border-amber-900/20">
                <div>
                  <span className="block text-stone-400 text-[10px]">Tanggal Terbit</span>
                  <span className="font-bold">{selectedCertificateDonor.tanggal}</span>
                </div>
                <div>
                  <span className="block text-stone-400 text-[10px]">Dewan Pengurus</span>
                  <span className="font-bold text-amber-900">Yayasan Lamrimnesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
