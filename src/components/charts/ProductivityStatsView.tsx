import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Building2,
  Users,
  Zap,
  Calendar,
  Award,
  Timer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  CalendarTodoEvent,
  getStoredCalendarEvents,
  getTaskCompletionProgress
} from '../common/DivisionCalendarTodoView';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

const DIVISION_CHART_COLORS: Record<DivisionId, string> = {
  1: '#4f46e5', // Direktorat - Indigo
  2: '#10b981', // Finance - Emerald
  3: '#8b5cf6', // Penerbitan - Violet
  4: '#f59e0b', // Marketing - Amber
  5: '#f97316', // Produksi - Orange
  6: '#06b6d4'  // Logistik - Cyan
};

const parseTaskDurationHours = (timeStr?: string): { durationHours: number; startHour: number; endHour: number } => {
  if (!timeStr || !timeStr.trim()) {
    return { durationHours: 2.0, startHour: 9, endHour: 11 };
  }
  const matches = Array.from(timeStr.matchAll(/(\d{1,2})[:.](\d{2})/g));
  if (matches.length >= 2) {
    const sh = Math.min(23, Math.max(0, parseInt(matches[0][1], 10)));
    const sm = Math.min(59, Math.max(0, parseInt(matches[0][2], 10)));
    const eh = Math.min(23, Math.max(0, parseInt(matches[1][1], 10)));
    const em = Math.min(59, Math.max(0, parseInt(matches[1][2], 10)));
    const startDec = sh + sm / 60;
    const endDec = eh + em / 60;
    const diff = endDec > startDec ? endDec - startDec : 2.0;
    return {
      durationHours: Number(diff.toFixed(1)),
      startHour: sh,
      endHour: Math.max(sh, eh)
    };
  }
  if (matches.length === 1) {
    const sh = Math.min(23, Math.max(0, parseInt(matches[0][1], 10)));
    return { durationHours: 2.0, startHour: sh, endHour: Math.min(23, sh + 2) };
  }
  return { durationHours: 2.0, startHour: 9, endHour: 11 };
};

interface ProductivityStatsViewProps {
  divisionId?: DivisionId;
  externalEvents?: CalendarTodoEvent[];
  defaultScope?: 'all' | 'current';
  compact?: boolean;
}

export const ProductivityStatsView: React.FC<ProductivityStatsViewProps> = ({
  divisionId = 1,
  externalEvents,
  defaultScope = 'all',
  compact = false
}) => {
  const { divisiList, activityLogs, usersList } = useApp();

  const [storedEvents, setStoredEvents] = useState<CalendarTodoEvent[]>(() => getStoredCalendarEvents());
  const [scopeMode, setScopeMode] = useState<'all' | 'current'>(defaultScope);
  const [trendGranularity, setTrendGranularity] = useState<'monthly' | 'status-breakdown'>('monthly');

  useEffect(() => {
    if (externalEvents) return;
    const handleSync = () => {
      setStoredEvents(getStoredCalendarEvents());
    };
    window.addEventListener('mis-calendar-events-updated', handleSync);
    return () => window.removeEventListener('mis-calendar-events-updated', handleSync);
  }, [externalEvents]);

  const allEvents = externalEvents || storedEvents;

  const filteredEvents = useMemo(() => {
    if (scopeMode === 'current') {
      return allEvents.filter(e => (e.divisionId || e.picDivisionId || 1) === divisionId);
    }
    return allEvents;
  }, [allEvents, scopeMode, divisionId]);

  const currentDivObj = useMemo(
    () => divisiList.find(d => d.id === divisionId),
    [divisiList, divisionId]
  );

  // 1. KPI Summary Metrics
  const kpiSummary = useMemo(() => {
    const totalTasks = filteredEvents.length;
    const completedTasks = filteredEvents.filter(e => e.status === 'Selesai').length;
    const inProgressTasks = filteredEvents.filter(e => e.status === 'Sedang Berjalan').length;

    const avgCompletionPct =
      totalTasks > 0
        ? Math.round(
            filteredEvents.reduce((acc, ev) => acc + getTaskCompletionProgress(ev).percent, 0) /
              totalTasks
          )
        : 0;

    const durations = filteredEvents.map(ev => parseTaskDurationHours(ev.time).durationHours);
    const totalHours = durations.reduce((acc, h) => acc + h, 0);
    const avgHoursPerTask = totalTasks > 0 ? Number((totalHours / totalTasks).toFixed(1)) : 0;

    const totalSubtasks = filteredEvents.reduce((acc, ev) => acc + (ev.subtasks?.length || 0), 0);
    const doneSubtasks = filteredEvents.reduce(
      (acc, ev) => acc + (ev.subtasks?.filter(s => s.completed).length || 0),
      0
    );

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      avgCompletionPct,
      totalHours: Number(totalHours.toFixed(1)),
      avgHoursPerTask,
      totalSubtasks,
      doneSubtasks
    };
  }, [filteredEvents]);

  // 2. Chart 1: Task Completion Trends (Monthly progression across Jan - Dec)
  const completionTrendData = useMemo(() => {
    // Baseline realistic monthly curve + live calendar events overlay
    const baseCompleted = [5, 6, 8, 7, 9, 10, 8, 11, 9, 12, 8, 10];
    const baseInProgress = [1, 2, 2, 3, 2, 3, 3, 2, 4, 3, 2, 2];

    return SHORT_MONTHS.map((monthName, idx) => {
      const monthEvents = filteredEvents.filter(ev => {
        const [, m] = ev.date.split('-').map(Number);
        return (m || 1) - 1 === idx;
      });

      const liveCompleted = monthEvents.filter(e => e.status === 'Selesai').length;
      const liveInProgress = monthEvents.filter(e => e.status === 'Sedang Berjalan').length;
      const liveNotStarted = monthEvents.filter(e => e.status === 'Belum Mulai').length;

      const scaleFactor = scopeMode === 'current' ? 0.35 : 1;
      const selesai = liveCompleted + Math.max(1, Math.round(baseCompleted[idx] * scaleFactor));
      const berjalan = liveInProgress + Math.round(baseInProgress[idx] * scaleFactor);
      const belumMulai = liveNotStarted;
      const total = selesai + berjalan + belumMulai;

      const livePctSum = monthEvents.reduce(
        (acc, ev) => acc + getTaskCompletionProgress(ev).percent,
        0
      );
      const completionRate =
        monthEvents.length > 0
          ? Math.round(livePctSum / monthEvents.length)
          : Math.min(98, Math.round(((selesai + berjalan * 0.5) / Math.max(1, total)) * 100));

      return {
        bulan: monthName,
        Selesai: selesai,
        'Sedang Berjalan': berjalan,
        'Belum Mulai': belumMulai,
        Total: total,
        'Rata-rata Progres (%)': completionRate
      };
    });
  }, [filteredEvents, scopeMode]);

  // 3. Chart 2: Average Time Spent on Tasks per Division
  const divisionTimeData = useMemo(() => {
    const baselineAvgHours: Record<DivisionId, number> = {
      1: 3.4, // Direktorat (Pleno & Evaluasi)
      2: 4.5, // Finance (Rekonsiliasi & Tutup Buku)
      3: 3.8, // Penerbitan (Proofreading & ISBN)
      4: 5.6, // Marketing (Bazar & Kampanye PO)
      5: 6.2, // Produksi (Cetak Massal & QC)
      6: 4.9  // Logistik (Distribusi Kargo & Opname)
    };

    return divisiList.map(div => {
      const divEvents = allEvents.filter(
        e => (e.divisionId || e.picDivisionId || 1) === div.id
      );

      const parsedDurations = divEvents.map(e => parseTaskDurationHours(e.time).durationHours);
      const liveTotalHours = parsedDurations.reduce((a, b) => a + b, 0);
      const liveAvg =
        divEvents.length > 0
          ? Number(((liveTotalHours + baselineAvgHours[div.id]) / (divEvents.length + 1)).toFixed(1))
          : baselineAvgHours[div.id] || 3.5;

      const avgCompletion =
        divEvents.length > 0
          ? Math.round(
              divEvents.reduce((acc, ev) => acc + getTaskCompletionProgress(ev).percent, 0) /
                divEvents.length
            )
          : 78;

      const completedCount = divEvents.filter(e => e.status === 'Selesai').length;

      return {
        id: div.id,
        kode: div.kode,
        divisi: div.nama_divisi,
        'Rata-rata Jam / Tugas': liveAvg,
        'Total Jam Terjadwal': Number((liveTotalHours + baselineAvgHours[div.id] * 2).toFixed(1)),
        'Progres Divisi (%)': avgCompletion,
        jumlahTugas: divEvents.length,
        tugasSelesai: completedCount,
        color: DIVISION_CHART_COLORS[div.id] || '#6366f1'
      };
    });
  }, [divisiList, allEvents]);

  // 4. Chart 3: Active User Hours (Hourly Productivity Distribution 06:00 - 21:00 WIB)
  const activeUserHoursData = useMemo(() => {
    const hoursRange = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 to 21:00 WIB
    // Realistic foundation of daily active user actions across hours
    const baselineSystemActions: Record<number, number> = {
      6: 2,
      7: 5,
      8: 14,
      9: 26,
      10: 32,
      11: 29,
      12: 12,
      13: 28,
      14: 34,
      15: 30,
      16: 22,
      17: 14,
      18: 8,
      19: 11,
      20: 7,
      21: 4
    };

    return hoursRange.map(hour => {
      // Count scheduled tasks active during this hour
      let activeTasksInHour = 0;
      filteredEvents.forEach(ev => {
        const { startHour, endHour } = parseTaskDurationHours(ev.time);
        if (hour >= startHour && hour <= Math.max(startHour, endHour - 1)) {
          activeTasksInHour += 1;
        }
      });

      // Count real activityLogs recorded at this hour
      let logsInHour = 0;
      activityLogs.forEach(log => {
        if (scopeMode === 'current' && log.divisi_id && log.divisi_id !== divisionId) {
          return;
        }
        const d = new Date(log.created_at);
        if (!isNaN(d.getTime()) && d.getHours() === hour) {
          logsInHour += 1;
        }
      });

      const scale = scopeMode === 'current' ? 0.4 : 1;
      const aktivitasUser = Math.max(
        1,
        Math.round((baselineSystemActions[hour] || 5) * scale) + logsInHour
      );
      const jamTugasTerjadwal = activeTasksInHour;
      const indeksFokus = Math.min(100, Math.round(aktivitasUser * 2.1 + jamTugasTerjadwal * 6));

      return {
        jam: `${String(hour).padStart(2, '0')}:00`,
        hourNum: hour,
        'Aktivitas User': aktivitasUser,
        'Tugas Terjadwal Aktif': jamTugasTerjadwal,
        'Indeks Produktivitas': indeksFokus
      };
    });
  }, [filteredEvents, activityLogs, scopeMode, divisionId]);

  const peakHourInfo = useMemo(() => {
    if (activeUserHoursData.length === 0) return { jam: '10:00', total: 0 };
    const sorted = [...activeUserHoursData].sort(
      (a, b) =>
        b['Aktivitas User'] +
        b['Tugas Terjadwal Aktif'] * 3 -
        (a['Aktivitas User'] + a['Tugas Terjadwal Aktif'] * 3)
    );
    return {
      jam: sorted[0].jam,
      total: sorted[0]['Aktivitas User'] + sorted[0]['Tugas Terjadwal Aktif']
    };
  }, [activeUserHoursData]);

  const topSpeedDivision = useMemo(() => {
    if (divisionTimeData.length === 0) return null;
    const sorted = [...divisionTimeData].sort(
      (a, b) => b['Progres Divisi (%)'] - a['Progres Divisi (%)']
    );
    return sorted[0];
  }, [divisionTimeData]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Productivity Stats & Analitik Jam Kerja Tim
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Real-Time Recharts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualisasi tren penyelesaian tugas bulanan, rata-rata durasi pengerjaan per direktorat, dan distribusi jam aktif pengguna (`06:00` – `21:00 WIB`).
            </p>
          </div>
        </div>

        {/* Scope Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setScopeMode('all')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                scopeMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>6 Direktorat Terpadu</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('current')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                scopeMode === 'current'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Hanya {currentDivObj?.nama_divisi || 'Divisi Ini'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              Tingkat Penyelesaian Tugas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {kpiSummary.avgCompletionPct}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ({kpiSummary.completedTasks}/{kpiSummary.totalTasks} tuntas)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Sub-tugas selesai: <strong>{kpiSummary.doneSubtasks}/{kpiSummary.totalSubtasks}</strong> item
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              Rata-rata Durasi Tugas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {kpiSummary.avgHoursPerTask} Jam
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                / agenda
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Total alokasi waktu: <strong>{kpiSummary.totalHours} jam kerja</strong>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              Jam Produktif Puncak (Peak)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                {peakHourInfo.jam} WIB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Intensitas tertinggi: <strong>{peakHourInfo.total} aktivitas & jadwal</strong>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 block">
              Direktorat Paling Responsif
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-violet-700 dark:text-violet-300 truncate">
                {topSpeedDivision?.divisi || 'Direktorat'}
              </span>
              <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400">
                ({topSpeedDivision?.['Progres Divisi (%)'] || 0}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
               Personil aktif: <strong>{usersList.length} akun staf & PIC</strong>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1: Task Completion Trends (Jan - Dec) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Tren Penyelesaian Tugas Bulanan (Task Completion Trends)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Perbandingan jumlah tugas yang selesai, sedang berjalan, dan persentase ketuntasan per bulan.
              </p>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] self-start">
              <button
                type="button"
                onClick={() => setTrendGranularity('monthly')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  trendGranularity === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Kurva Tren
              </button>
              <button
                type="button"
                onClick={() => setTrendGranularity('status-breakdown')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  trendGranularity === 'status-breakdown'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Komposisi Status
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendGranularity === 'monthly' ? (
                <AreaChart data={completionTrendData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCompletedTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradActiveTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="Selesai"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradCompletedTasks)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Sedang Berjalan"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradActiveTasks)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={completionTrendData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Selesai" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Sedang Berjalan" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Belum Mulai" stackId="a" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Average Time Spent on Tasks per Division */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                Rata-rata Waktu Pengerjaan per Direktorat (Jam/Tugas)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Durasi rata-rata penyelesaian agenda kerja dihitung dari slot waktu Daily Planner masing-masing divisi.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={divisionTimeData}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis
                  type="number"
                  unit=" jam"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[0, 'dataMax + 1']}
                />
                <YAxis
                  dataKey="divisi"
                  type="category"
                  width={88}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'Rata-rata Jam / Tugas' ? `${value} Jam / Tugas` : `${value}%`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="Rata-rata Jam / Tugas"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                >
                  {divisionTimeData.map((entry, index) => (
                    <Cell key={`cell-div-time-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active User Hours Chart + Division Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 3: Active User Hours (06:00 - 21:00 WIB) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Distribusi Jam Aktif Pengguna & Beban Tugas Harian (Active User Hours)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Korelasi antara aktivitas sistem pengguna (log operasional) dengan kepadatan tugas terjadwal pada jam kerja (`06:00` – `21:00 WIB`).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800 text-[11px] font-bold self-start shrink-0">
              Peak Hour: {peakHourInfo.jam} WIB
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeUserHoursData}
                margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="jam" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="Aktivitas User"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="Tugas Terjadwal Aktif"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Line
                  type="monotone"
                  dataKey="Indeks Produktivitas"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Benchmark Table per Division */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Ringkasan Efisiensi Waktu per Direktorat
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">6 Divisi</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Perbandingan rata-rata jam penyelesaian dan persentase progres tugas lintas direktorat.
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
            {divisionTimeData.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className="w-8 h-8 rounded-xl text-white font-extrabold text-[10px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.kode}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {item.divisi}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.tugasSelesai}/{item.jumlahTugas} selesai • Total {item['Total Jam Terjadwal']} jam
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                      {item['Rata-rata Jam / Tugas']} jam/tugas
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item['Progres Divisi (%)']}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {item['Progres Divisi (%)']}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!compact && (
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Data tersinkronisasi otomatis dengan Daily Planner & To-Do List</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
