import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  X,
  FileDown,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  User as UserIcon,
  Clock,
  AlertTriangle,
  Layers,
  BarChart3,
  Filter,
  ShieldCheck,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
  Target,
  ArrowUpRight,
  Check,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  ListTodo
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  CalendarTodoEvent,
  getStoredCalendarEvents,
  getDeadlineInfo,
  CATEGORY_STYLES,
  PRIORITY_CONFIG,
  INDONESIAN_MONTHS
} from '../common/DivisionCalendarTodoView';
import {
  printElement,
  downloadDocumentAsPdf,
  downloadDocumentAsHtml,
  downloadDocumentAsWord
} from '../../utils/documentExport';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';
import { playPleasantSuccessChime, playPleasantClickSound } from '../../utils/soundEffects';

interface MonthlyTaskPerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDivisionId?: DivisionId | 'all';
  initialMonth?: number; // 0-indexed (0 = Januari, 9 = Oktober)
  initialYear?: number;
}

interface PicPerformanceSummary {
  name: string;
  role: string;
  divisionId: DivisionId;
  totalTasks: number;
  completedTasks: number;
  onTimeTasks: number;
  totalSubtasksDone: number;
  completionRate: number;
  badge: string;
}

const DIVISION_ICONS: Record<DivisionId, React.ReactNode> = {
  1: <Building2 className="w-4 h-4 text-indigo-500" />,
  2: <Wallet className="w-4 h-4 text-emerald-500" />,
  3: <BookOpen className="w-4 h-4 text-violet-500" />,
  4: <ShoppingBag className="w-4 h-4 text-amber-500" />,
  5: <Factory className="w-4 h-4 text-orange-500" />,
  6: <Truck className="w-4 h-4 text-cyan-500" />
};

export const MonthlyTaskPerformanceReportModal: React.FC<MonthlyTaskPerformanceReportModalProps> = ({
  isOpen,
  onClose,
  initialDivisionId,
  initialMonth,
  initialYear
}) => {
  const { currentUser, divisiList, usersList } = useApp();

  const now = new Date();
  const currentYearNum = now.getFullYear();
  const currentMonthNum = now.getMonth(); // 0-indexed

  const [selectedDivision, setSelectedDivision] = useState<DivisionId | 'all'>(
    initialDivisionId !== undefined ? initialDivisionId : (currentUser.divisi_id || 1)
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialMonth !== undefined ? initialMonth : currentMonthNum
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear !== undefined ? initialYear : currentYearNum
  );
  const [filterMode, setFilterMode] = useState<'completed_only' | 'all'>('completed_only');
  const [activeTab, setActiveTab] = useState<'preview' | 'audit_table'>('preview');

  // Export states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      if (initialDivisionId !== undefined) setSelectedDivision(initialDivisionId);
      if (initialMonth !== undefined) setSelectedMonth(initialMonth);
      if (initialYear !== undefined) setSelectedYear(initialYear);
    }
  }, [isOpen, initialDivisionId, initialMonth, initialYear]);

  // Click outside listener for export dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all calendar events stored in system
  const allEvents = useMemo(() => {
    return getStoredCalendarEvents();
  }, [isOpen]);

  // Target Month String format YYYY-MM
  const targetYearMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Filter tasks for selected division & month
  const filteredEvents = useMemo(() => {
    return allEvents.filter(evt => {
      // Division match
      if (selectedDivision !== 'all' && evt.divisionId !== selectedDivision) {
        return false;
      }
      // Month match
      if (!evt.date || !evt.date.startsWith(targetYearMonth)) {
        return false;
      }
      return true;
    });
  }, [allEvents, selectedDivision, targetYearMonth]);

  // Completed tasks specifically
  const completedEvents = useMemo(() => {
    return filteredEvents.filter(
      evt => evt.status === 'Selesai' || (evt.progress !== undefined && evt.progress >= 100)
    );
  }, [filteredEvents]);

  // Tasks to display in table based on filterMode
  const displayTasks = filterMode === 'completed_only' ? completedEvents : filteredEvents;

  // Key KPI Metrics Calculations
  const metrics = useMemo(() => {
    const totalScheduled = filteredEvents.length;
    const totalCompleted = completedEvents.length;
    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    let onTimeCount = 0;
    let overdueCount = 0;
    let totalSubtasksDone = 0;
    let totalSubtasksCount = 0;

    filteredEvents.forEach(evt => {
      const subtasks = evt.subtasks || [];
      totalSubtasksCount += subtasks.length;
      totalSubtasksDone += subtasks.filter(s => s.completed).length;

      if (evt.status === 'Selesai') {
        const info = getDeadlineInfo(evt.date, evt.status);
        if (info.state === 'overdue') {
          overdueCount++;
        } else {
          onTimeCount++;
        }
      }
    });

    const onTimeRate = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 100;

    // Performance Index Grade
    let grade = 'Grade B';
    let gradeLabel = 'Cukup & Sesuai Ekspektasi';
    let gradeBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
    let gradeScore = 70;

    if (completionRate >= 90 && onTimeRate >= 80) {
      grade = 'Grade A';
      gradeLabel = 'Sangat Memuaskan & Produktif';
      gradeBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      gradeScore = 95;
    } else if (completionRate >= 75) {
      grade = 'Grade B+';
      gradeLabel = 'Baik & Efektif';
      gradeBadge = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
      gradeScore = 82;
    } else if (completionRate < 60) {
      grade = 'Grade C';
      gradeLabel = 'Perlu Peningkatan & Pendampingan';
      gradeBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      gradeScore = 55;
    }

    // Category Distribution of completed tasks
    const categoryCounts: Record<string, number> = {};
    completedEvents.forEach(evt => {
      const cat = evt.category || 'Lainnya';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Priority Distribution of completed tasks
    const priorityCounts: Record<string, number> = {
      High: 0,
      Medium: 0,
      Low: 0
    };
    completedEvents.forEach(evt => {
      const p = (evt.priority || 'Medium').toLowerCase();
      if (p === 'high' || p === 'tinggi') priorityCounts.High++;
      else if (p === 'low' || p === 'rendah') priorityCounts.Low++;
      else priorityCounts.Medium++;
    });

    return {
      totalScheduled,
      totalCompleted,
      completionRate,
      onTimeCount,
      overdueCount,
      onTimeRate,
      totalSubtasksDone,
      totalSubtasksCount,
      grade,
      gradeLabel,
      gradeBadge,
      gradeScore,
      categoryCounts,
      priorityCounts
    };
  }, [filteredEvents, completedEvents]);

  // PIC Leaderboard & Workload Breakdown
  const picLeaderboard = useMemo(() => {
    const picMap: Record<string, PicPerformanceSummary> = {};

    filteredEvents.forEach(evt => {
      const picName = evt.picName || 'PIC Tidak Ditugaskan';
      if (!picMap[picName]) {
        picMap[picName] = {
          name: picName,
          role: evt.picRole || 'Staff Divisi',
          divisionId: evt.picDivisionId || evt.divisionId,
          totalTasks: 0,
          completedTasks: 0,
          onTimeTasks: 0,
          totalSubtasksDone: 0,
          completionRate: 0,
          badge: 'Aktif'
        };
      }

      picMap[picName].totalTasks += 1;
      const subtasks = evt.subtasks || [];
      picMap[picName].totalSubtasksDone += subtasks.filter(s => s.completed).length;

      if (evt.status === 'Selesai') {
        picMap[picName].completedTasks += 1;
        const info = getDeadlineInfo(evt.date, evt.status);
        if (info.state !== 'overdue') {
          picMap[picName].onTimeTasks += 1;
        }
      }
    });

    return Object.values(picMap)
      .map(pic => {
        const rate = pic.totalTasks > 0 ? Math.round((pic.completedTasks / pic.totalTasks) * 100) : 0;
        let badge = 'Kontributor Tim';
        if (pic.completedTasks >= 3 && rate >= 80) badge = 'Top Performer ⭐';
        else if (rate === 100) badge = 'Tuntas 100% 🎯';
        else if (pic.totalTasks >= 4) badge = 'High Workload ⚡';

        return {
          ...pic,
          completionRate: rate,
          badge
        };
      })
      .sort((a, b) => b.completedTasks - a.completedTasks || b.completionRate - a.completionRate);
  }, [filteredEvents]);

  // Meta info of the division
  const currentDiv = useMemo(() => {
    if (selectedDivision === 'all') {
      return {
        id: 0 as any,
        nama_divisi: 'Konsolidasi 6 Direktorat & Divisi',
        kode: 'ALL',
        deskripsi: 'Seluruh unit kerja Yayasan Pelestarian & Pengembangan Lamrim Nusantara'
      };
    }
    return divisiList.find(d => d.id === selectedDivision) || divisiList[0];
  }, [selectedDivision, divisiList]);

  const monthName = INDONESIAN_MONTHS[selectedMonth];
  const reportDocNumber = `LPERF-${currentDiv.kode}/${selectedYear}/${String(selectedMonth + 1).padStart(2, '0')}/01`;
  const filenameBase = `Laporan_Performa_${currentDiv.kode}_${monthName}_${selectedYear}`;

  // Export Handlers
  const handlePrint = () => {
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
    printElement('printable-monthly-performance-area');
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showToast('Sedang merender berkas PDF laporan performa...');
    try {
      const success = await downloadDocumentAsPdf(
        'printable-monthly-performance-area',
        `${filenameBase}.pdf`
      );
      if (success) {
        try {
          playPleasantSuccessChime();
        } catch {
          // ignore
        }
        showToast('Laporan performa bulanan berhasil diunduh (PDF).');
      } else {
        showToast('Gagal mengunduh PDF.');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Gagal export PDF'}`);
    } finally {
      setIsGeneratingPdf(false);
      setShowExportMenu(false);
    }
  };

  const handleDownloadHtml = () => {
    try {
      downloadDocumentAsHtml(
        'printable-monthly-performance-area',
        `${filenameBase}.html`,
        `Laporan Performa Bulanan - ${currentDiv.nama_divisi} (${monthName} ${selectedYear})`
      );
      playPleasantSuccessChime();
      showToast('Berkas HTML laporan berhasil diunduh.');
    } catch (err: any) {
      showToast('Gagal mengunduh HTML.');
    }
    setShowExportMenu(false);
  };

  const handleDownloadWord = () => {
    try {
      downloadDocumentAsWord(
        'printable-monthly-performance-area',
        `${filenameBase}.doc`,
        `Laporan Performa Bulanan - ${currentDiv.nama_divisi}`
      );
      playPleasantSuccessChime();
      showToast('Berkas Word (.doc) berhasil diunduh.');
    } catch (err: any) {
      showToast('Gagal mengunduh berkas Word.');
    }
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    try {
      const csvData = displayTasks.map((t, idx) => ({
        No: idx + 1,
        Judul_Tugas: t.title,
        Divisi_ID: t.divisionId,
        Kategori: t.category,
        Prioritas: t.priority,
        Status: t.status,
        Tanggal_Target: t.date,
        PIC_Utama: t.picName,
        PIC_Role: t.picRole || '',
        Tim_Pendamping: (t.coPicNames || []).join('; '),
        Total_Subtask: (t.subtasks || []).length,
        Subtask_Selesai: (t.subtasks || []).filter(s => s.completed).length,
        Keterangan: t.description || ''
      }));

      const columns = [
        { header: 'No', key: 'No' as const },
        { header: 'Judul Tugas', key: 'Judul_Tugas' as const },
        { header: 'Divisi ID', key: 'Divisi_ID' as const },
        { header: 'Kategori', key: 'Kategori' as const },
        { header: 'Prioritas', key: 'Prioritas' as const },
        { header: 'Status', key: 'Status' as const },
        { header: 'Tanggal Target', key: 'Tanggal_Target' as const },
        { header: 'PIC Utama', key: 'PIC_Utama' as const },
        { header: 'PIC Role', key: 'PIC_Role' as const },
        { header: 'Tim Pendamping', key: 'Tim_Pendamping' as const },
        { header: 'Total Subtask', key: 'Total_Subtask' as const },
        { header: 'Subtask Selesai', key: 'Subtask_Selesai' as const },
        { header: 'Keterangan', key: 'Keterangan' as const }
      ];

      exportDataToCsv({
        filename: `${filenameBase}_${getCsvDateStamp()}`,
        columns,
        data: csvData,
        title: `Laporan Performa Bulanan - ${currentDiv.nama_divisi} (${monthName} ${selectedYear})`
      });
      playPleasantSuccessChime();
      showToast('Data histori tugas berhasil diekspor ke CSV.');
    } catch {
      showToast('Gagal mengekspor data CSV.');
    }
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-auto max-h-[94vh] overflow-hidden">
        
        {/* Top Header Bar / Navigation Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wider uppercase mb-0.5">
              <BarChart3 className="w-4 h-4" />
              <span>Sistem Laporan Kinerja Terpadu (SAPA-ALL MIS)</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Laporan Performa Bulanan Divisi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agregasi otomatis histori tugas yang telah diselesaikan pada kalender kerja yayasan.
            </p>
          </div>

          {/* Action Buttons: Tab switcher, Export & Close */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Tab Switcher */}
            <div className="inline-flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Pratinjau Resmi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit_table')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'audit_table'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Tabel Histori ({displayTasks.length})
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              title="Cetak Laporan Resmi"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Cetak</span>
            </button>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
              title="Unduh PDF Resmi"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Download PDF'}</span>
            </button>

            {/* Dropdown More Export Options */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu(prev => !prev)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                title="Format Ekspor Lainnya (Word, HTML, CSV)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-20 text-xs">
                  <button
                    onClick={handleExportCsv}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ekspor CSV Spreadsheet</span>
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dokumen Word (.doc)</span>
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Halaman Web (.html)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Division Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Divisi:</span>
              <select
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value === 'all' ? 'all' : (Number(e.target.value) as DivisionId))}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">🌐 Konsolidasi Semua Divisi</option>
                {divisiList.map(d => (
                  <option key={d.id} value={d.id}>
                    Divisi {d.nama_divisi} ({d.kode})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
              >
                {INDONESIAN_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Tahun:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
              >
                {[currentYearNum - 1, currentYearNum, currentYearNum + 1].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Cakupan:</span>
            <button
              type="button"
              onClick={() => setFilterMode('completed_only')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'completed_only'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Tugas Tuntas Saja ({completedEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'all'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua Tugas Terjadwal ({filteredEvents.length})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 bg-slate-100/50 dark:bg-slate-950/50">
          
          {activeTab === 'preview' ? (
            /* PRINTABLE DOCUMENT CARD */
            <div
              id="printable-monthly-performance-area"
              ref={printableAreaRef}
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 mx-auto max-w-4xl font-sans"
            >
              {/* Kop Yayasan Lamrimnesia Resmi */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="/logo-lamrimnesia.png"
                    alt="Logo Yayasan Lamrimnesia"
                    className="h-14 sm:h-16 w-auto object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith('/logo-lamrimnesia.png')) {
                        target.src = '/logo-lamrimnesia.png';
                      }
                    }}
                  />
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                      YAYASAN PELESTARIAN & PENGEMBANGAN LAMRIM NUSANTARA
                    </h1>
                    <p className="text-xs font-bold text-teal-800">
                      Sistem Administrasi Pengelolaan Terpadu (SAPA-ALL MIS) · Modul Kalender & Kinerja Divisi
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Jl. Dharma Raya No. 108, Jakarta Barat | info@lamrimnesia.org | www.lamrimnesia.org
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 uppercase block">
                    {reportDocNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Periode: <strong>{monthName} {selectedYear}</strong>
                  </span>
                </div>
              </div>

              {/* Title & Division Info Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                    Laporan Kinerja Bulanan Resmi
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">
                    Evaluasi Performa Divisi {currentDiv.nama_divisi}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Periode Pelaporan: <strong>{monthName} {selectedYear}</strong> · Sumber: Histori Kalender Kerja & To-Do List Divisi
                  </p>
                </div>

                {/* Performance Grade Score Badge */}
                <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Indeks Kinerja
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {metrics.gradeLabel}
                    </span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-black text-sm border shadow-2xs ${metrics.gradeBadge}`}>
                    {metrics.grade}
                  </div>
                </div>
              </div>

              {/* SECTION 1: Key Executive Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                    <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tugas Terjadwal</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {metrics.totalScheduled} <span className="text-xs font-normal text-slate-500">agenda</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {metrics.totalSubtasksCount} rincian subtask
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center space-x-1.5 text-emerald-800 text-[11px] font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tugas Tuntas (Selesai)</span>
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    {metrics.totalCompleted} <span className="text-xs font-normal text-emerald-600">tuntas</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Tingkat Ketuntasan: {metrics.completionRate}%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200">
                  <div className="flex items-center space-x-1.5 text-teal-800 text-[11px] font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ketepatan Waktu</span>
                  </div>
                  <div className="text-xl font-black text-teal-700">
                    {metrics.onTimeRate}% <span className="text-xs font-normal text-teal-600">on-time</span>
                  </div>
                  <div className="text-[10px] text-teal-700 mt-0.5">
                    {metrics.onTimeCount} tepat waktu · {metrics.overdueCount} terlambat
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-200">
                  <div className="flex items-center space-x-1.5 text-violet-800 text-[11px] font-semibold mb-1">
                    <Check className="w-3.5 h-3.5 text-violet-600" />
                    <span>Subtask Selesai</span>
                  </div>
                  <div className="text-xl font-black text-violet-700">
                    {metrics.totalSubtasksDone} <span className="text-xs font-normal text-violet-600">checklist</span>
                  </div>
                  <div className="text-[10px] text-violet-700 mt-0.5">
                    Eksekusi mikro checklist
                  </div>
                </div>
              </div>

              {/* SECTION 2: Category & Priority Distribution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Category Breakdown */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Distribusi Kategori Tugas Selesai</span>
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(metrics.categoryCounts).length > 0 ? (
                      Object.entries(metrics.categoryCounts).map(([cat, count]) => {
                        const pct = metrics.totalCompleted > 0 ? Math.round((count / metrics.totalCompleted) * 100) : 0;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-700">
                              <span>{cat}</span>
                              <span className="font-bold text-slate-900">{count} tugas ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400 italic py-2">
                        Belum ada tugas selesai pada bulan {monthName} {selectedYear}.
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority Breakdown */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Beban Tugas Selesai per Tingkat Prioritas</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">Prioritas Tinggi</span>
                      <span className="text-lg font-black text-rose-900 block mt-0.5">
                        {metrics.priorityCounts.High}
                      </span>
                      <span className="text-[10px] text-rose-600">Mendesak / Strategis</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">Prioritas Sedang</span>
                      <span className="text-lg font-black text-amber-900 block mt-0.5">
                        {metrics.priorityCounts.Medium}
                      </span>
                      <span className="text-[10px] text-amber-600">Rutin Operasional</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Prioritas Rendah</span>
                      <span className="text-lg font-black text-emerald-900 block mt-0.5">
                        {metrics.priorityCounts.Low}
                      </span>
                      <span className="text-[10px] text-emerald-600">Fleksibel / Longgar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Performa Anggota & PIC Leaderboard */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Kinerja Person-In-Charge (PIC) Utama</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {picLeaderboard.length} anggota bertugas
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Nama PIC & Jabatan</th>
                        <th className="py-2.5 px-3 text-center">Tugas Diampu</th>
                        <th className="py-2.5 px-3 text-center">Tuntas</th>
                        <th className="py-2.5 px-3 text-center">Ketuntasan (%)</th>
                        <th className="py-2.5 px-3 text-center">Subtask Dituntaskan</th>
                        <th className="py-2.5 px-3 text-right">Apresiasi Kinerja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {picLeaderboard.length > 0 ? (
                        picLeaderboard.map((pic, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{pic.name}</div>
                              <div className="text-[10px] text-slate-500">{pic.role}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                              {pic.totalTasks}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                              {pic.completedTasks}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="font-extrabold text-slate-900">{pic.completionRate}%</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                              {pic.totalSubtasksDone} checklist
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {pic.badge}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                            Tidak ada penugasan PIC pada bulan terpilih.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: Executive Automated Analysis & Recommendations */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-teal-50/30 to-amber-50/30 border border-slate-200 space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kesimpulan Evaluasi & Rekomendasi Manajerial Otomatis</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <p>
                    <strong>1. Capaian Kerja:</strong> Divisi <strong>{currentDiv.nama_divisi}</strong> mencatat tingkat penyelesaian tugas sebesar <strong>{metrics.completionRate}%</strong> ({metrics.totalCompleted} dari {metrics.totalScheduled} tugas), dengan tingkat ketepatan waktu mencapai <strong>{metrics.onTimeRate}%</strong>.
                    {metrics.priorityCounts.High > 0 && ` Berhasil menuntaskan ${metrics.priorityCounts.High} agenda prioritas tinggi strategis.`}
                  </p>

                  <p>
                    <strong>2. Evaluasi Produktivitas:</strong> Sebanyak <strong>{metrics.totalSubtasksDone} checklist subtask</strong> telah dieksekusi dengan baik oleh tim.
                    {metrics.overdueCount > 0
                      ? ` Perlu diperhatikan terdapat ${metrics.overdueCount} tugas yang diselesaikan mendekati atau melewati tanggal tenggat.`
                      : ' Seluruh tugas terselesaikan sesuai dengan jendela waktu operasional yang ditetapkan.'}
                  </p>

                  <p>
                    <strong>3. Rekomendasi Alokasi PIC:</strong> Diharapkan pimpinan divisi menjaga momentum produktivitas, serta mendistribusikan tugas-tugas pendamping (Co-PIC) kepada staf junior untuk memastikan alih pengetahuan dan efisiensi delegasi pada bulan berikutnya.
                  </p>
                </div>
              </div>

              {/* SECTION 5: Detailed List of Completed Tasks in this Month */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Daftar Rinci Histori Tugas Selesai ({completedEvents.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Bulan {monthName} {selectedYear}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3">Judul Tugas & Keterangan</th>
                        <th className="py-2.5 px-3">Tanggal Target</th>
                        <th className="py-2.5 px-3">PIC Utama</th>
                        <th className="py-2.5 px-3 text-center">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Prioritas</th>
                        <th className="py-2.5 px-3 text-center">Subtask</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {completedEvents.length > 0 ? (
                        completedEvents.map((evt, idx) => {
                          const subCount = (evt.subtasks || []).length;
                          const subDone = (evt.subtasks || []).filter(s => s.completed).length;
                          return (
                            <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2 px-3 text-center text-slate-500 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-bold text-slate-900 leading-snug">{evt.title}</div>
                                {evt.description && (
                                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                    {evt.description}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap text-slate-700 font-medium">
                                {evt.date}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-900">{evt.picName}</div>
                                {evt.coPicNames && evt.coPicNames.length > 0 && (
                                  <div className="text-[10px] text-slate-500">
                                    Co: {evt.coPicNames.join(', ')}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700">
                                  {evt.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                    evt.priority === 'High' || evt.priority === 'Tinggi'
                                      ? 'bg-rose-100 text-rose-800'
                                      : evt.priority === 'Low' || evt.priority === 'Rendah'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {evt.priority}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                <span className="font-bold text-emerald-700">
                                  {subDone}/{subCount || '-'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-5 text-center text-slate-400 italic">
                            Belum ada riwayat tugas selesai pada periode {monthName} {selectedYear}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Official Validation Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Dibuat & Diverifikasi Oleh:</div>
                  <div className="font-bold text-slate-900">
                    Kepala Divisi {currentDiv.nama_divisi}
                  </div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded px-3 py-1">
                      [Tanda Tangan & Cap Divisi]
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-800 underline">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    NIP: DIR-{selectedYear}-0{currentUser.id}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-1">Mengetahui & Menyetujui:</div>
                  <div className="font-bold text-slate-900">
                    Direktur Utama Yayasan Lamrimnesia
                  </div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded px-3 py-1">
                      [Pengesahan Dewan Pengurus]
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-800 underline">
                    Budi Santoso, S.Kom., M.M.
                  </div>
                  <div className="text-[10px] text-slate-500">
                    NIP: DIR-2026-001
                  </div>
                </div>
              </div>

              {/* Print Footer Note */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Dokumen dicetak otomatis dari SAPA-ALL MIS Yayasan Lamrimnesia.</span>
                <span>Waktu Cetak: {new Date().toLocaleString('id-ID')}</span>
              </div>
            </div>
          ) : (
            /* AUDIT TABLE VIEW */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-indigo-600" />
                    <span>Daftar Histori Lengkap Tugas Bulanan</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menampilkan {displayTasks.length} tugas untuk Divisi {currentDiv.nama_divisi} pada {monthName} {selectedYear}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Unduh CSV Data Lengkap</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px]">
                    <tr>
                      <th className="py-3 px-3.5 w-10 text-center">No</th>
                      <th className="py-3 px-3.5">Judul Tugas</th>
                      <th className="py-3 px-3.5">Divisi</th>
                      <th className="py-3 px-3.5">Tanggal</th>
                      <th className="py-3 px-3.5">PIC Utama</th>
                      <th className="py-3 px-3.5 text-center">Kategori</th>
                      <th className="py-3 px-3.5 text-center">Prioritas</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-center">Subtask</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayTasks.length > 0 ? (
                      displayTasks.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                            {t.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {t.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            Divisi {divisiList.find(d => d.id === t.divisionId)?.kode || t.divisionId}
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                            {t.date}
                          </td>
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{t.picName}</span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                t.priority === 'High' || t.priority === 'Tinggi'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : t.priority === 'Low' || t.priority === 'Rendah'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                t.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : t.status === 'Sedang Berjalan'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">
                            {(t.subtasks || []).filter(s => s.completed).length}/{(t.subtasks || []).length}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400 italic">
                          Tidak ada data tugas yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast inside modal */}
        {toastMessage && (
          <div className="absolute bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
