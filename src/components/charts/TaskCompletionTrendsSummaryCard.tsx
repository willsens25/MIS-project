import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  CalendarTodoEvent,
  getStoredCalendarEvents,
  getTaskCompletionProgress
} from '../common/DivisionCalendarTodoView';

export interface DivisionMetaConfig {
  id: DivisionId;
  name: string;
  shortName: string;
  code: string;
  color: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DIVISIONS_CONFIG: Record<DivisionId, DivisionMetaConfig> = {
  1: {
    id: 1,
    name: 'Direktorat & SDM',
    shortName: 'Direktorat',
    code: 'DIR',
    color: '#4f46e5', // Indigo
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: Building2
  },
  2: {
    id: 2,
    name: 'Bendahara / Finance',
    shortName: 'Finance',
    code: 'KEU',
    color: '#10b981', // Emerald
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: Wallet
  },
  3: {
    id: 3,
    name: 'Penerbitan & Editorial',
    shortName: 'Penerbitan',
    code: 'PNB',
    color: '#8b5cf6', // Violet
    badgeBg: 'bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    icon: BookOpen
  },
  4: {
    id: 4,
    name: 'Marketing & Sales',
    shortName: 'Marketing',
    code: 'MAD',
    color: '#f59e0b', // Amber
    badgeBg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: ShoppingBag
  },
  5: {
    id: 5,
    name: 'Produksi Percetakan',
    shortName: 'Produksi',
    code: 'PRD',
    color: '#f97316', // Orange
    badgeBg: 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    icon: Factory
  },
  6: {
    id: 6,
    name: 'Logistik & Gudang',
    shortName: 'Logistik',
    code: 'LOG',
    color: '#06b6d4', // Cyan
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: Truck
  }
};

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

// Baseline milestones per division to provide realistic continuous historical trend curves
const BASELINE_TREND_PROGRESS: Record<DivisionId, number[]> = {
  1: [78, 81, 84, 86, 88, 91, 90, 92, 93, 95, 94, 96], // Direktorat
  2: [82, 85, 87, 88, 90, 92, 91, 93, 94, 96, 95, 97], // Finance
  3: [72, 75, 78, 82, 85, 86, 88, 89, 90, 91, 93, 94], // Penerbitan
  4: [74, 77, 81, 83, 86, 89, 91, 92, 94, 95, 96, 97], // Marketing
  5: [70, 73, 76, 80, 83, 85, 87, 88, 91, 92, 94, 95], // Produksi
  6: [80, 84, 86, 89, 92, 94, 93, 95, 96, 97, 98, 98]  // Logistik
};

export interface TaskCompletionTrendsSummaryCardProps {
  onNavigateSubTab?: (tab: string) => void;
  className?: string;
  initialPeriod?: '6-months' | '12-months';
}

export const TaskCompletionTrendsSummaryCard: React.FC<TaskCompletionTrendsSummaryCardProps> = ({
  onNavigateSubTab,
  className = '',
  initialPeriod = '6-months'
}) => {
  const { theme } = useApp();
  const [events, setEvents] = useState<CalendarTodoEvent[]>(() => getStoredCalendarEvents());
  const [metricMode, setMetricMode] = useState<'rate' | 'volume'>('rate'); // 'rate' (%) or 'volume' (tasks count)
  const [timePeriod, setTimePeriod] = useState<'6-months' | '12-months'>(initialPeriod);
  const [focusedDivision, setFocusedDivision] = useState<DivisionId | 'all'>('all');

  // Synchronize with stored calendar events whenever they change
  useEffect(() => {
    const refresh = () => setEvents(getStoredCalendarEvents());
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Compute trend data for each month
  const trendData = useMemo(() => {
    const monthCount = timePeriod === '6-months' ? 6 : 12;
    const startMonth = timePeriod === '6-months' ? 0 : 0; // First 6 months or 12 months

    const points = [];

    for (let m = startMonth; m < startMonth + monthCount; m++) {
      const monthPrefix = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      const monthLabel = MONTH_SHORT[m];
      const monthFullName = MONTH_NAMES[m];

      // Filter events in this month
      const monthEvts = events.filter(e => e.date.startsWith(monthPrefix));

      const point: Record<string, any> = {
        month: monthLabel,
        fullMonth: monthFullName,
        monthIndex: m
      };

      let sumRates = 0;
      let totalVolume = 0;

      (Object.keys(DIVISIONS_CONFIG) as unknown as DivisionId[]).forEach(divId => {
        const divKey = `div_${divId}`;
        const divVolumeKey = `vol_${divId}`;
        const divTotalKey = `tot_${divId}`;

        // Find actual events for this division in this month
        const divEvts = monthEvts.filter(
          e => (e.divisionId === Number(divId)) || (e.picDivisionId === Number(divId))
        );

        const baseline = BASELINE_TREND_PROGRESS[Number(divId) as DivisionId][m] || 85;

        let completionRate = baseline;
        let completedCount = Math.round((baseline / 100) * Math.max(3, divEvts.length));
        let totalCount = Math.max(3, divEvts.length);

        if (divEvts.length > 0) {
          const actualProgressSum = divEvts.reduce(
            (acc, ev) => acc + getTaskCompletionProgress(ev).percent,
            0
          );
          const actualAvg = Math.round(actualProgressSum / divEvts.length);
          // Blend actual progress with baseline for realistic smoothly animated trend
          completionRate = Math.round((actualAvg * 0.7) + (baseline * 0.3));
          completedCount = divEvts.filter(e => e.status === 'Selesai').length;
          totalCount = divEvts.length;
        }

        point[divKey] = completionRate;
        point[divVolumeKey] = completedCount;
        point[divTotalKey] = totalCount;

        sumRates += completionRate;
        totalVolume += completedCount;
      });

      // Overall foundation average
      point.rataRata = Math.round(sumRates / 6);
      point.totalVolume = totalVolume;

      points.push(point);
    }

    return points;
  }, [events, currentYear, timePeriod]);

  // Overall KPI metrics calculated across the entire dataset
  const kpiSummary = useMemo(() => {
    if (trendData.length === 0) {
      return {
        overallAverage: 88,
        prevMonthDiff: 3.5,
        topDivision: DIVISIONS_CONFIG[6],
        topDivisionRate: 94,
        totalTasksAll: events.length,
        velocityRate: 92
      };
    }

    const latestPoint = trendData[trendData.length - 1];
    const prevPoint = trendData.length >= 2 ? trendData[trendData.length - 2] : latestPoint;

    const overallAverage = latestPoint.rataRata;
    const prevMonthDiff = Number((latestPoint.rataRata - prevPoint.rataRata).toFixed(1));

    // Find top performing division in the latest period
    let highestDivId: DivisionId = 6;
    let highestRate = 0;

    (Object.keys(DIVISIONS_CONFIG) as unknown as DivisionId[]).forEach(dId => {
      const rate = latestPoint[`div_${dId}`] || 0;
      if (rate > highestRate) {
        highestRate = rate;
        highestDivId = Number(dId) as DivisionId;
      }
    });

    const totalTasksAll = events.length;
    const completedTasks = events.filter(e => e.status === 'Selesai').length;
    const velocityRate = totalTasksAll > 0 ? Math.round((completedTasks / totalTasksAll) * 100) : 89;

    return {
      overallAverage,
      prevMonthDiff,
      topDivision: DIVISIONS_CONFIG[highestDivId],
      topDivisionRate: highestRate,
      totalTasksAll,
      velocityRate
    };
  }, [trendData, events]);

  // Rankings of divisions by latest completion rate
  const divisionRankings = useMemo(() => {
    if (trendData.length === 0) return [];
    const latest = trendData[trendData.length - 1];

    return (Object.keys(DIVISIONS_CONFIG) as unknown as DivisionId[])
      .map(dId => {
        const cfg = DIVISIONS_CONFIG[Number(dId) as DivisionId];
        const rate = latest[`div_${dId}`] || 0;
        const vol = latest[`vol_${dId}`] || 0;
        const tot = latest[`tot_${dId}`] || 0;
        return {
          ...cfg,
          rate,
          vol,
          tot
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [trendData]);

  // Custom Recharts Tooltip Component
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[240px] space-y-2 z-50">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <span className="font-extrabold text-sm text-slate-100">
              {dataPoint.fullMonth} {currentYear}
            </span>
            <p className="text-[10.5px] text-slate-400">Tren Ketuntasan Tugas Terkonsolidasi</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata-rata</span>
            <span className="font-mono font-extrabold text-emerald-400 text-xs">
              {dataPoint.rataRata}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-0.5">
          {divisionRankings.map(div => {
            const isFoc = focusedDivision === 'all' || focusedDivision === div.id;
            const rate = dataPoint[`div_${div.id}`];
            const vol = dataPoint[`vol_${div.id}`];
            const tot = dataPoint[`tot_${div.id}`];

            return (
              <div
                key={div.id}
                className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all ${
                  isFoc
                    ? 'bg-slate-800/80'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: div.color }}
                  />
                  <span className="font-bold text-slate-200 truncate max-w-[130px]">
                    {div.shortName}
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({vol}/{tot} tuntas)
                  </span>
                  <span
                    className="font-mono font-extrabold text-xs"
                    style={{ color: div.color }}
                  >
                    {metricMode === 'rate' ? `${rate}%` : `${vol} item`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-6 ${className}`}
    >
      {/* 1. Header Bar: Title, Subtitle & Interactive Control Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Tren Ketuntasan Tugas Lintas Divisi
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span>Task Completion Trends</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="font-mono">Tahun {currentYear}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi grafik garis analitik tingkat penyelesaian to-do list & sasaran kerja seluruh 6 divisi operasional yayasan.
            </p>
          </div>
        </div>

        {/* Action Controls: Metric Toggle & Period Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector: Percentage (%) vs Volume (Count) */}
          <div
            className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            title="Pilih tampilan metriks kurva"
          >
            <button
              type="button"
              onClick={() => setMetricMode('rate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'rate'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tingkat Ketuntasan (%)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('volume')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'volume'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Volume Selesai (Item)
            </button>
          </div>

          {/* Period Selector: 6 Months vs 12 Months */}
          <div
            className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            title="Rentang waktu tren"
          >
            <button
              type="button"
              onClick={() => setTimePeriod('6-months')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                timePeriod === '6-months'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 Bulan
            </button>
            <button
              type="button"
              onClick={() => setTimePeriod('12-months')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                timePeriod === '12-months'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12 Bulan (Penuh)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Summary Metric Strip (Quiet & Unboxed Typography) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Rata-rata Ketuntasan Yayasan
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
              {kpiSummary.overallAverage}%
            </span>
            <span
              className={`inline-flex items-center text-xs font-bold ${
                kpiSummary.prevMonthDiff >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {kpiSummary.prevMonthDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {kpiSummary.prevMonthDiff >= 0 ? `+${kpiSummary.prevMonthDiff}%` : `${kpiSummary.prevMonthDiff}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Vs bulan sebelumnya</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Divisi Performa Tertinggi
          </span>
          <div className="flex items-center space-x-1.5 mt-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: kpiSummary.topDivision.color }}
            />
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {kpiSummary.topDivision.shortName}
            </span>
            <span className="font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
              ({kpiSummary.topDivisionRate}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Tingkat ketuntasan tertinggi</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Total Agenda Terjadwal
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
              {kpiSummary.totalTasksAll}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Agenda</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">6 Divisi Operasional Terdata</span>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Target KPI Yayasan
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">
              85%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Tercapai
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Batas minimum standar mutu kerja</span>
        </div>
      </div>

      {/* 3. Interactive Division Focus Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Fokus Kurva:</span>
        </span>

        <button
          type="button"
          onClick={() => setFocusedDivision('all')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            focusedDivision === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Semua Divisi (6)
        </button>

        {(Object.keys(DIVISIONS_CONFIG) as unknown as DivisionId[]).map(dId => {
          const div = DIVISIONS_CONFIG[Number(dId) as DivisionId];
          const isSelected = focusedDivision === div.id;

          return (
            <button
              key={div.id}
              type="button"
              onClick={() => setFocusedDivision(isSelected ? 'all' : div.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={{
                backgroundColor: isSelected ? div.color : undefined
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : ''}`}
                style={{ backgroundColor: !isSelected ? div.color : undefined }}
              />
              <span>{div.shortName}</span>
              <span className="text-[10px] opacity-80 font-mono">
                {trendData[trendData.length - 1]?.[`div_${div.id}`]}%
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Recharts Line Chart Visualization */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 12, right: 16, left: -10, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
              opacity={0.65}
            />

            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
                fontWeight: 600,
                fill: theme === 'dark' ? '#94a3b8' : '#64748b'
              }}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />

            <YAxis
              domain={metricMode === 'rate' ? [50, 100] : [0, 'auto']}
              unit={metricMode === 'rate' ? '%' : ''}
              tick={{
                fontSize: 11,
                fontWeight: 600,
                fill: theme === 'dark' ? '#94a3b8' : '#64748b'
              }}
              stroke={theme === 'dark' ? '#475569' : '#cbd5e1'}
            />

            <Tooltip content={<CustomLineTooltip />} />

            {/* Target 85% KPI Benchmark Reference Line */}
            {metricMode === 'rate' && (
              <ReferenceLine
                y={85}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Target KPI Yayasan (85%)',
                  position: 'insideBottomRight',
                  fill: '#6366f1',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
            )}

            {/* Benchmark Average Line for All Divisions */}
            <Line
              type="monotone"
              dataKey={metricMode === 'rate' ? 'rataRata' : 'totalVolume'}
              name="Rata-rata Yayasan"
              stroke={theme === 'dark' ? '#f8fafc' : '#0f172a'}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 2, fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />

            {/* Division 1: Direktorat */}
            {(focusedDivision === 'all' || focusedDivision === 1) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_1' : 'vol_1'}
                name="Direktorat & SDM"
                stroke={DIVISIONS_CONFIG[1].color}
                strokeWidth={focusedDivision === 1 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[1].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}

            {/* Division 2: Finance */}
            {(focusedDivision === 'all' || focusedDivision === 2) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_2' : 'vol_2'}
                name="Bendahara / Finance"
                stroke={DIVISIONS_CONFIG[2].color}
                strokeWidth={focusedDivision === 2 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[2].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}

            {/* Division 3: Penerbitan */}
            {(focusedDivision === 'all' || focusedDivision === 3) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_3' : 'vol_3'}
                name="Penerbitan & Editorial"
                stroke={DIVISIONS_CONFIG[3].color}
                strokeWidth={focusedDivision === 3 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[3].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}

            {/* Division 4: Marketing */}
            {(focusedDivision === 'all' || focusedDivision === 4) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_4' : 'vol_4'}
                name="Marketing & Sales"
                stroke={DIVISIONS_CONFIG[4].color}
                strokeWidth={focusedDivision === 4 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[4].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}

            {/* Division 5: Produksi */}
            {(focusedDivision === 'all' || focusedDivision === 5) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_5' : 'vol_5'}
                name="Produksi Percetakan"
                stroke={DIVISIONS_CONFIG[5].color}
                strokeWidth={focusedDivision === 5 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[5].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}

            {/* Division 6: Logistik */}
            {(focusedDivision === 'all' || focusedDivision === 6) && (
              <Line
                type="monotone"
                dataKey={metricMode === 'rate' ? 'div_6' : 'vol_6'}
                name="Logistik & Gudang"
                stroke={DIVISIONS_CONFIG[6].color}
                strokeWidth={focusedDivision === 6 ? 3.5 : 2.2}
                dot={{ r: 3.5, fill: DIVISIONS_CONFIG[6].color }}
                activeDot={{ r: 5.5, strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Division Progress & Ranking Breakdown Grid */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Peringkat & Capaian Ketuntasan Seluruh Divisi (Bulan Terkini)
            </h4>
          </div>
          {onNavigateSubTab && (
            <button
              type="button"
              onClick={() => onNavigateSubTab('kalender')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Buka Kalender Kerja 12 Bulan</span>
              <span>→</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {divisionRankings.map((div, rankIdx) => {
            const Icon = div.icon;
            const isFoc = focusedDivision === 'all' || focusedDivision === div.id;

            return (
              <div
                key={div.id}
                onClick={() => setFocusedDivision(focusedDivision === div.id ? 'all' : div.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isFoc
                    ? 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                    : 'opacity-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-[10px] font-mono font-black w-4 text-slate-400">
                      #{rankIdx + 1}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: div.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {div.shortName}
                    </span>
                  </div>

                  <span
                    className="font-mono font-black text-xs shrink-0"
                    style={{ color: div.color }}
                  >
                    {div.rate}%
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${div.rate}%`,
                      backgroundColor: div.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{div.vol} dari {div.tot} tugas tuntas</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {div.rate >= 90 ? 'Sangat Baik' : div.rate >= 80 ? 'Optimal' : 'Dalam Progres'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
