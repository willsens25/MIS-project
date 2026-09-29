import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BoardResolutionItem, PlenoMeetingRecord } from '../../types';
import { formatRupiah, formatPrivateRupiah } from '../../utils/currencyUtils';
import { printElement } from '../../utils/documentExport';
import {
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Printer,
  FileCheck,
  CheckCircle2,
  Clock,
  Building2,
  Wallet,
  BookOpen,
  Factory,
  Truck,
  Users,
  Check,
  Plus,
  Trash2,
  Edit3,
  Award,
  ArrowUpRight,
  TrendingUp,
  FileText,
  MousePointer,
  HelpCircle,
  AlertTriangle,
  FolderHeart
} from 'lucide-react';

interface ExecutivePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PresentationTheme = 'studio-dark' | 'bright-white' | 'dharma-maroon';

const INITIAL_RESOLUTIONS: BoardResolutionItem[] = [
  {
    id: 'res-1',
    category: 'Anggaran & Cetak',
    title: 'Persetujuan Cetak Ulang Edisi Emas: Lamrim Chenmo (2.000 Eks)',
    description: 'Pengalokasian dana cadangan kas penerbitan untuk pembiayaan kertas HVS Premium 80gr dan hard cover jilid benang.',
    status: 'approved',
    pic: 'Divisi Produksi & Finance',
    targetDate: '30 Oktober 2026',
    notes: 'Prioritas utama memenuhi permohonan kajian nasional di 12 vihara.'
  },
  {
    id: 'res-2',
    category: 'Sosial & Dharma',
    title: 'Alokasi 1.500 Buku Dharma Bebas Biaya untuk Vihara Luar Jawa',
    description: 'Penyaluran fashili donasi cetak untuk vihara, cetiya pelosok di Kalimantan Barat, Sumut, dan Nusa Tenggara.',
    status: 'approved',
    pic: 'Divisi Logistik & Sosial',
    targetDate: '15 November 2026',
    notes: 'Didukung subsidi penuh dari dana fashili donatur naskah babon.'
  },
  {
    id: 'res-3',
    category: 'Legalitas & Hak Cipta',
    title: 'Perpanjangan Hak Cipta & Lisensi Naskah Terjemahan Gandavyuha',
    description: 'Pembaruan perjanjian royalti penulis/penerjemah dan pendaftaran ISBN naskah relief Borobudur.',
    status: 'approved',
    pic: 'Divisi Penerbitan & Editorial',
    targetDate: '05 Desember 2026',
    notes: 'MoU dengan tim kurator Balai Konservasi sudah difinalisasi.'
  },
  {
    id: 'res-4',
    category: 'Distribusi & Kemitraan',
    title: 'Kemitraan Konsinyasi Khusus 5 Jaringan Toko Buku Rohani',
    description: 'Penetapan margin distribusi 20% khusus toko buku mitra untuk memperluas akses literatur nusantara.',
    status: 'pending',
    pic: 'Divisi Marketing & Kemitraan',
    targetDate: '20 Desember 2026',
    notes: 'Sedang menunggu draft akhir syarat retur dan perlindungan buku basah.'
  },
  {
    id: 'res-5',
    category: 'Tata Kelola Yayasan',
    title: 'Evaluasi Akuntabilitas Laporan Keuangan Semester Berjalan',
    description: 'Pengesahan audit internal kas yayasan dengan predikat Wajar Tanpa Pengecualian (WTP).',
    status: 'approved',
    pic: 'Dewan Pengawas & Bendahara',
    targetDate: '10 Oktober 2026',
    notes: 'Transparansi mutasi kas bank & rekonsiliasi kas riil sesuai SOP.'
  }
];

export const ExecutivePresentationModal: React.FC<ExecutivePresentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    books,
    mutasis,
    accounts,
    pengajuans,
    productionLogs,
    penyalurans,
    logisticLogs,
    identitasList,
    usersList,
    orders,
    isPrivacyMode,
    togglePrivacyMode
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [theme, setTheme] = useState<PresentationTheme>('studio-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLaserPointerActive, setIsLaserPointerActive] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [meetingQuarter, setMeetingQuarter] = useState('Triwulan III / 2026');
  const [meetingLocation, setMeetingLocation] = useState('Ruang Rapat Utama Dharma Center & Virtual Video Conference');
  const [meetingNotes, setMeetingNotes] = useState(
    'Rapat Pleno berkala Dewan Pengurus & Dewan Pengawas Yayasan menyepakati target percepatan translasi dan pencetakan naskah suci serta pemantapan distribusi fashili sosial ke seluruh Nusantara.'
  );

  // Persistent Board Resolutions
  const [resolutions, setResolutions] = useState<BoardResolutionItem[]>(() => {
    try {
      const stored = localStorage.getItem('mis_pleno_resolutions');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load resolutions', e);
    }
    return INITIAL_RESOLUTIONS;
  });

  // Signatures State
  const [signatures, setSignatures] = useState<{
    ketuaUmum: boolean;
    dewanPengawas: boolean;
    bendahara: boolean;
    sekretaris: boolean;
  }>(() => {
    try {
      const stored = localStorage.getItem('mis_pleno_signatures');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      ketuaUmum: true,
      dewanPengawas: true,
      bendahara: true,
      sekretaris: true
    };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const printAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save resolutions
  useEffect(() => {
    try {
      localStorage.setItem('mis_pleno_resolutions', JSON.stringify(resolutions));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [resolutions]);

  // Save signatures
  useEffect(() => {
    try {
      localStorage.setItem('mis_pleno_signatures', JSON.stringify(signatures));
    } catch {
      // ignore
    }
  }, [signatures]);

  // Mouse move for virtual laser pointer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isLaserPointerActive) {
        setLaserPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLaserPointerActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, 4));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserPointerActive(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M' || (e.altKey && (e.key === 'p' || e.key === 'P'))) {
        e.preventDefault();
        togglePrivacyMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose, togglePrivacyMode]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const totalTitles = books.length;
    const totalStock = books.reduce((sum, b) => sum + (b.stok_gudang || 0), 0);
    const lowStockTitles = books.filter(b => (b.stok_gudang || 0) < 20).length;

    const totalCashIn = mutasis.filter(m => m.tipe === 'Masuk').reduce((sum, m) => sum + m.nominal, 0);
    const totalCashOut = mutasis.filter(m => m.tipe === 'Keluar').reduce((sum, m) => sum + m.nominal, 0);
    const totalInitialBalance = accounts.reduce((sum, a) => sum + (a.saldo_awal || 0), 0);
    const netCurrentBalance = totalInitialBalance + totalCashIn - totalCashOut;

    const totalPrintUnits = productionLogs.reduce((sum, log) => sum + (log.qty_produksi || 0), 0);
    const pendingSPK = pengajuans.filter(p => p.status === 'pending').length;
    const approvedSPK = pengajuans.filter(p => p.status === 'approved').length;

    const totalDistributed =
      penyalurans.reduce((sum, p) => sum + (p.qty || 0), 0) +
      orders.reduce((sum, o) => sum + (o.items || []).reduce((itemSum, item) => itemSum + (item.jumlah || 0), 0), 0);

    const totalMembers = identitasList.length;
    const totalStaff = usersList.length;

    return {
      totalTitles,
      totalStock,
      lowStockTitles,
      totalCashIn,
      totalCashOut,
      netCurrentBalance,
      totalPrintUnits,
      pendingSPK,
      approvedSPK,
      totalDistributed,
      totalMembers,
      totalStaff
    };
  }, [books, mutasis, accounts, productionLogs, pengajuans, penyalurans, orders, identitasList, usersList]);

  if (!isOpen) return null;

  const slides = [
    { title: 'Ikhtisar Eksekutif & Key Performance Indicators (KPI)', sub: 'Ringkasan Pencapaian Utama Yayasan' },
    { title: 'Realisasi Finansial & Penyerapan Dana Fashili Sosial', sub: 'Transparansi Kas & Dukungan Naskah Dharma' },
    { title: 'Pipeline Produksi & Percetakan Naskah Babon', sub: 'Manufaktur Buku & Progres SPK Percetakan' },
    { title: 'Distribusi, Jangkauan Umat & Kemitraan Vihara', sub: 'Logistik Penyaluran Nusantara & Analisis Stok' },
    { title: 'Risalah & Pengesahan Keputusan Rapat Pleno', sub: 'Berita Acara Resmi Dewan Pengurus & Pengawas' }
  ];

  const handlePrintBeritaAcara = () => {
    printElement('printable-berita-acara-pleno', 'Berita_Acara_Rapat_Pleno_Yayasan_Lamrimnesia');
  };

  const handleToggleResolution = (id: string, status: 'approved' | 'pending' | 'rejected') => {
    setResolutions(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleAddResolution = () => {
    const newItem: BoardResolutionItem = {
      id: `res-${Date.now()}`,
      category: 'Tata Kelola Yayasan',
      title: 'Keputusan Baru Rapat Pleno',
      description: 'Catatan mandat strategis dewan pengurus.',
      status: 'pending',
      pic: 'Dewan Pengurus',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      notes: 'Diputuskan dalam sesi pleno.'
    };
    setResolutions(prev => [...prev, newItem]);
  };

  const handleDeleteResolution = (id: string) => {
    setResolutions(prev => prev.filter(r => r.id !== id));
  };

  const isDark = theme === 'studio-dark' || theme === 'dharma-maroon';

  return createPortal(
    <div
      ref={containerRef}
      data-presentation-theme={theme}
      className={`fixed inset-0 z-[100] flex flex-col select-none overflow-hidden transition-colors duration-300 ${
        isLaserPointerActive ? 'virtual-laser-cursor' : ''
      } ${
        theme === 'studio-dark'
          ? 'bg-slate-950 text-slate-100'
          : theme === 'dharma-maroon'
          ? 'bg-amber-950 text-amber-50'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Virtual Laser Pointer Dot */}
      {isLaserPointerActive && (
        <div
          className="virtual-laser-dot"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        />
      )}

      {/* TOP PRESENTATION CONTROL BAR */}
      <header
        className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md z-20 ${
          theme === 'studio-dark'
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : theme === 'dharma-maroon'
            ? 'bg-amber-950/95 border-amber-800/80 text-amber-100'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        {/* Left: Branding & Meeting Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md font-bold text-base shrink-0">
            🪷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase">
                Rapat Pleno Dewan Pengurus & Pengawas
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}
              >
                PROYEKTOR LCD
              </span>
            </div>
            <p className="text-[11px] opacity-75">
              Yayasan Pelestarian & Pengembangan Lamrim Nusantara • {meetingQuarter}
            </p>
          </div>
        </div>

        {/* Center: Slide Quick Navigation */}
        <div className="hidden md:flex items-center space-x-1.5 bg-black/20 dark:bg-white/10 px-2 py-1 rounded-xl border border-white/10">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'opacity-70 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              Slide {idx + 1}
            </button>
          ))}
        </div>

        {/* Right: Meeting Tools & Controls */}
        <div className="flex items-center space-x-2">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-black/20 rounded-lg text-xs font-mono opacity-90">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Privacy Toggle (Alt+P) */}
          <button
            onClick={() => togglePrivacyMode()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isPrivacyMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Sensor Nilai Finansial (Masking Rp) untuk Proyektor (Alt+P / Key M)"
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPrivacyMode ? 'Sensor Aktif' : 'Privasi'}</span>
          </button>

          {/* Virtual Laser Pointer Toggle */}
          <button
            onClick={() => setIsLaserPointerActive(!isLaserPointerActive)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isLaserPointerActive
                ? 'bg-red-600 text-white border-red-500 shadow-sm animate-pulse'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Laser Pointer Virtual (Hotkey: L)"
          >
            <MousePointer className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Laser</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setTheme('studio-dark')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                theme === 'studio-dark' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              title="Studio Dark (Ruang Gelap)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('bright-white')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                theme === 'bright-white' ? 'bg-amber-400 text-slate-950 shadow-xs font-bold' : 'opacity-60 hover:opacity-100'
              }`}
              title="High Contrast White (Ruang Terang / Siang)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dharma-maroon')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                theme === 'dharma-maroon' ? 'bg-red-700 text-amber-200 shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              title="Dharma Royal Maroon (Adat Yayasan)"
            >
              🪷
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
            }`}
            title="Mode Layar Penuh (F / Esc)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 transition-colors cursor-pointer"
            title="Tutup Presentasi (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN SLIDE VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {/* Slide Header Indicator */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-current/15 gap-2">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                <span>SLIDE {currentSlide + 1} DARI {slides.length}</span>
                <span>•</span>
                <span>{slides[currentSlide].sub}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {slides[currentSlide].title}
              </h1>
            </div>

            {/* Privacy Alert Pill */}
            {isPrivacyMode && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 self-start md:self-auto animate-pulse">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Sensor Finansial Aktif (Angka Disamarkan)</span>
              </div>
            )}
          </div>

          {/* SLIDE 1: IKHTISAR EKSEKUTIF & KPI */}
          {currentSlide === 0 && (
            <div className="space-y-6 animate-fadeIn">
              {/* 6 Hero KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1. Naskah Terbit */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Koleksi Naskah Dharma</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-400">
                    {metrics.totalTitles} <span className="text-sm font-normal text-current opacity-70">Judul</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Naskah klasik terjemahan, anotasi Lamrim, & karya rohani nusantara.
                  </p>
                </div>

                {/* 2. Total Oplah Cetak */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Total Eksemplar Tercetak</span>
                    <Factory className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-400">
                    {metrics.totalPrintUnits.toLocaleString('id-ID')} <span className="text-sm font-normal text-current opacity-70">Buku</span>
                  </div>
                  <p className="text-xs opacity-80">
                    {metrics.approvedSPK} SPK percetakan berhasil diselesaikan tahun ini.
                  </p>
                </div>

                {/* 3. Saldo Kas & Cadangan */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Cadangan Kas Yayasan</span>
                    <Wallet className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-cyan-400">
                    {formatPrivateRupiah(metrics.netCurrentBalance, isPrivacyMode)}
                  </div>
                  <p className="text-xs opacity-80">
                    Likuiditas aman dari 4 rekening kas bank & operasional.
                  </p>
                </div>

                {/* 4. Buku Terdistribusi */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Buku Tersalurkan ke Umat</span>
                    <Truck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-400">
                    {metrics.totalDistributed.toLocaleString('id-ID')} <span className="text-sm font-normal text-current opacity-70">Eks</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Mencakup penyaluran vihara gratis & pesanan literatur pembaca.
                  </p>
                </div>

                {/* 5. Donatur & Anggota */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Database Sahabat Dharma</span>
                    <Users className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-400">
                    {metrics.totalMembers} <span className="text-sm font-normal text-current opacity-70">Kontak</span>
                  </div>
                  <p className="text-xs opacity-80">
                    Donatur tetap, pengurus vihara daerah, & pembaca setia terdata.
                  </p>
                </div>

                {/* 6. Akuntabilitas & Audit Pengawas */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs opacity-75 font-semibold">
                    <span>Status Dewan Pengawas</span>
                    <Award className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide">
                    WTP (Sempurna)
                  </div>
                  <p className="text-xs opacity-80">
                    Wajar Tanpa Pengecualian • Kepatuhan SOP Keuangan 98.4%.
                  </p>
                </div>
              </div>

              {/* Department Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-black/10 border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    📖 Divisi Penerbitan & Translasi
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed">
                    Fokus akselerasi naskah Babon Lamrim Chenmo Bab IV dan pelestarian teks sutra nusantara. Penataan hak cipta lisensi berjalan lancar.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-black/10 border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    🏭 Divisi Produksi & QC Pabrikasi
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed">
                    Efisiensi biaya cetak ditekan 8.2% dengan sistem batch order kertas sheet feed. Standar QC bebas cacat lem & jilid benang tercapai 99.1%.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-black/10 border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                    📦 Divisi Logistik & Distribusi
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed">
                    Rantai ekspedisi mencakup vihara di 18 provinsi. Stok buku aman terjaga dengan mitigasi otomatis restock alert naskah favorit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: REALISASI FINANSIAL & DANA FASHILI */}
          {currentSlide === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Flow Summary Card */}
                <div className="p-6 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Transparansi Arus Kas Berjalan Yayasan</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5">
                      <span className="text-xs opacity-80">Total Penerimaan Kas (Donasi, Penjualan, Fashili)</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {formatPrivateRupiah(metrics.totalCashIn, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5">
                      <span className="text-xs opacity-80">Total Pengeluaran Kas (Biaya Cetak, Ongkir, Ops)</span>
                      <span className="text-sm font-bold text-rose-400 font-mono">
                        {formatPrivateRupiah(metrics.totalCashOut, isPrivacyMode)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <span className="text-xs font-bold text-amber-300">Surplus / Cadangan Bersih Periode Ini</span>
                      <span className="text-base font-extrabold text-amber-300 font-mono">
                        {formatPrivateRupiah(metrics.totalCashIn - metrics.totalCashOut, isPrivacyMode)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs opacity-75 leading-relaxed">
                    * Setiap rupiah donasi tercatat transparan dalam Jurnal Mutasi Kas dan diverifikasi langsung oleh Bendahara Yayasan.
                  </p>
                </div>

                {/* Program Fashili Sosial Dharma Card */}
                <div className="p-6 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-rose-400" />
                    <span>Program Fashili Buku Dharma Bebas Biaya</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">Target Cetak Massal Naskah Babon</span>
                        <span className="font-bold text-amber-400">10.000 Eksemplar</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: '78%' }} />
                      </div>
                      <p className="text-[10px] opacity-70">
                        7.800 eksemplar telah berhasil disalurkan ke 48 vihara binaan di luar pulau Jawa.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">Dana Donasi Cetak Bersama Terserap</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatPrivateRupiah(185000000, isPrivacyMode)}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-70">
                        Partisipasi dari 342 donatur perseorangan dan 15 yayasan filantropi sahabat.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    ✅ Seluruh penyaluran buku Dharma gratis disertai Berita Acara Serah Terima (BAST) dan foto penerima vihara.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: PIPELINE PRODUKSI & NASKAH BABON */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-black/20 border-white/10 text-center space-y-1">
                  <div className="text-xs opacity-75 font-semibold">1. Tahap Penerjemahan</div>
                  <div className="text-2xl font-black text-amber-400">3 Naskah</div>
                  <p className="text-[11px] opacity-70">Sanskerta & Tibet ke Bhs. Indonesia</p>
                </div>

                <div className="p-4 rounded-xl border bg-black/20 border-white/10 text-center space-y-1">
                  <div className="text-xs opacity-75 font-semibold">2. Tahap Layout & Proofread</div>
                  <div className="text-2xl font-black text-cyan-400">4 Judul</div>
                  <p className="text-[11px] opacity-70">Pemeriksaan istilah teknis & glosarium</p>
                </div>

                <div className="p-4 rounded-xl border bg-black/20 border-white/10 text-center space-y-1">
                  <div className="text-xs opacity-75 font-semibold">3. SPK Cetak Massal Aktif</div>
                  <div className="text-2xl font-black text-emerald-400">{metrics.pendingSPK + metrics.approvedSPK} SPK</div>
                  <p className="text-[11px] opacity-70">Sedang diproduksi di mitra percetakan</p>
                </div>

                <div className="p-4 rounded-xl border bg-black/20 border-white/10 text-center space-y-1">
                  <div className="text-xs opacity-75 font-semibold">4. Buku Siap Terbit Q4</div>
                  <div className="text-2xl font-black text-rose-400">5 Judul</div>
                  <p className="text-[11px] opacity-70">Peluncuran bertepatan perayaan akbar</p>
                </div>
              </div>

              {/* Book List Spotlight Table */}
              <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide flex items-center justify-between">
                  <span>Daftar Naskah Utama yang Sedang Berjalan</span>
                  <span className="text-xs font-normal opacity-75">Prioritas Dewan Pengurus</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 opacity-70">
                        <th className="py-2">Judul Naskah Babon</th>
                        <th className="py-2">Penulis / Penerjemah</th>
                        <th className="py-2 text-center">Status Produksi</th>
                        <th className="py-2 text-right">Target Oplah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {books.slice(0, 5).map((book, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 font-bold text-amber-300">{book.judul}</td>
                          <td className="py-2.5 opacity-80">{book.penulis || 'Tim Penerjemah Lamrim'}</td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              SPK Siap Kirim
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            {(book.stok_gudang || 1000).toLocaleString('id-ID')} Eks
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: DISTRIBUSI, JANGKAUAN & LOGISTIK */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wilayah Distribusi */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-cyan-400">
                    📍 Sebaran Penyaluran Nusantara
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Pulau Jawa & Bali</span>
                      <span className="font-bold font-mono">54%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Sumatera (Medan, Pekanbaru, Palembang)</span>
                      <span className="font-bold font-mono">22%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Kalimantan (Pontianak, Singkawang)</span>
                      <span className="font-bold font-mono">14%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Sulawesi, NTT & Indonesia Timur</span>
                      <span className="font-bold font-mono">10%</span>
                    </div>
                  </div>
                </div>

                {/* Mitra Toko & Komunitas */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-400">
                    🤝 Kemitraan Toko & Bazaar
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Total Vihara & Cetiya Terjangkau</span>
                      <span className="font-bold text-amber-300">62 Vihara</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Perpustakaan Kampus & STAB</span>
                      <span className="font-bold text-amber-300">14 Kampus</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/20">
                      <span>Event Bazaar Dharma Diikuti</span>
                      <span className="font-bold text-amber-300">8 Acara</span>
                    </div>
                  </div>
                </div>

                {/* Mitigasi Stok Menipis */}
                <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-rose-400">
                    ⚠️ Peringatan Restock Naskah
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p className="opacity-80">
                      Ditemukan <strong className="text-rose-400">{metrics.lowStockTitles} judul buku</strong> dengan sisa stok di gudang bawah batas aman (&lt;20 pcs).
                    </p>
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                      Rekomendasi Pleno: Segera terbitkan SPK cetak ulang untuk menghindari kekosongan bahan kajian jemaat.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: RISALAH & KEPUTUSAN PLENO (LIVE BOARD RESOLUTIONS) */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-fadeIn" id="printable-berita-acara-pleno">
              {/* Meeting Header for Print / Export */}
              <div className="p-5 rounded-2xl border presentation-card bg-black/20 border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 uppercase">
                      Berita Acara Rapat Pleno Dewan Pengurus
                    </h2>
                    <p className="text-xs opacity-75">
                      Nomor: BA.PLENO/LAMRIMNESIA/{new Date().getFullYear()}/Q3/009
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddResolution}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Agenda Putusan</span>
                    </button>

                    <button
                      onClick={handlePrintBeritaAcara}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                      title="Cetak Berita Acara Resmi atau Simpan PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / PDF Risalah</span>
                    </button>
                  </div>
                </div>

                {/* Meeting Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="opacity-60 block text-[10px] uppercase font-bold">Waktu & Periode Rapat:</span>
                    <input
                      type="text"
                      value={meetingQuarter}
                      onChange={e => setMeetingQuarter(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px] uppercase font-bold">Tempat Pelaksanaan:</span>
                    <input
                      type="text"
                      value={meetingLocation}
                      onChange={e => setMeetingLocation(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Resolutions Checklist */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Daftar Keputusan Strategis Pleno ({resolutions.length} Agenda):
                  </h4>

                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {resolutions.map((res, idx) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border bg-black/30 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {res.category}
                            </span>
                            <span className="font-extrabold text-sm">{idx + 1}. {res.title}</span>
                          </div>
                          <p className="text-xs opacity-80">{res.description}</p>
                          <div className="text-[11px] opacity-70 flex items-center gap-3">
                            <span>PIC: <strong>{res.pic}</strong></span>
                            {res.targetDate && <span>Target: <strong>{res.targetDate}</strong></span>}
                          </div>
                        </div>

                        {/* Status Switcher & Delete */}
                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleToggleResolution(res.id, 'approved')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              res.status === 'approved'
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                                : 'bg-black/30 opacity-60 hover:opacity-100'
                            }`}
                          >
                            ✓ Disetujui
                          </button>
                          <button
                            onClick={() => handleToggleResolution(res.id, 'pending')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              res.status === 'pending'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                : 'bg-black/30 opacity-60 hover:opacity-100'
                            }`}
                          >
                            ⏳ Ditunda
                          </button>
                          <button
                            onClick={() => handleDeleteResolution(res.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                            title="Hapus agenda ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures of Board Members */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    Pengesahan Legalitas Dewan Rapat Pleno:
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    {/* 1. Ketua Umum */}
                    <div
                      onClick={() => setSignatures(prev => ({ ...prev, ketuaUmum: !prev.ketuaUmum }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        signatures.ketuaUmum
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-black/20 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold opacity-75">Ketua Umum Yayasan</div>
                      <div className="my-2 h-7 flex items-center justify-center font-serif italic text-base">
                        {signatures.ketuaUmum ? '✍️ Dr. Hendra K.' : 'Belum Ditandatangani'}
                      </div>
                      <div className="text-[9px] font-mono opacity-80">
                        {signatures.ketuaUmum ? '✓ Sah Secara Digital' : 'Klik untuk Tanda Tangan'}
                      </div>
                    </div>

                    {/* 2. Dewan Pengawas */}
                    <div
                      onClick={() => setSignatures(prev => ({ ...prev, dewanPengawas: !prev.dewanPengawas }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        signatures.dewanPengawas
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-black/20 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold opacity-75">Ketua Dewan Pengawas</div>
                      <div className="my-2 h-7 flex items-center justify-center font-serif italic text-base">
                        {signatures.dewanPengawas ? '✍️ Bhante S.' : 'Belum Ditandatangani'}
                      </div>
                      <div className="text-[9px] font-mono opacity-80">
                        {signatures.dewanPengawas ? '✓ Sah Secara Digital' : 'Klik untuk Tanda Tangan'}
                      </div>
                    </div>

                    {/* 3. Bendahara Umum */}
                    <div
                      onClick={() => setSignatures(prev => ({ ...prev, bendahara: !prev.bendahara }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        signatures.bendahara
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-black/20 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold opacity-75">Bendahara Umum</div>
                      <div className="my-2 h-7 flex items-center justify-center font-serif italic text-base">
                        {signatures.bendahara ? '✍️ Lisa W., SE' : 'Belum Ditandatangani'}
                      </div>
                      <div className="text-[9px] font-mono opacity-80">
                        {signatures.bendahara ? '✓ Sah Secara Digital' : 'Klik untuk Tanda Tangan'}
                      </div>
                    </div>

                    {/* 4. Sekretaris */}
                    <div
                      onClick={() => setSignatures(prev => ({ ...prev, sekretaris: !prev.sekretaris }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        signatures.sekretaris
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-black/20 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold opacity-75">Sekretaris Yayasan</div>
                      <div className="my-2 h-7 flex items-center justify-center font-serif italic text-base">
                        {signatures.sekretaris ? '✍️ Robert S., S.Kom' : 'Belum Ditandatangani'}
                      </div>
                      <div className="text-[9px] font-mono opacity-80">
                        {signatures.sekretaris ? '✓ Sah Secara Digital' : 'Klik untuk Tanda Tangan'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SLIDE NAVIGATION & SHORTCUT HINTS */}
        <footer className="max-w-7xl w-full mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-current/10 shrink-0 text-xs opacity-80">
          {/* Keyboard hints */}
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="opacity-60">Pintasan Keyboard:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono">← / →</kbd> Slide
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono">Space</kbd> Maju
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono">Alt + P</kbd> Sensor Privasi
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono">L</kbd> Laser
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 font-mono">F</kbd> Layar Penuh
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                currentSlide === 0
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : 'bg-black/30 hover:bg-black/50 border-white/20'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="font-mono font-bold text-xs">
              {currentSlide + 1} / {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlide(prev => Math.min(prev + 1, 4))}
              disabled={currentSlide === 4}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentSlide === 4
                  ? 'opacity-40 cursor-not-allowed bg-slate-800'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md'
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </main>
    </div>,
    document.body
  );
};
