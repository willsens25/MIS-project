import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { Mutasi } from '../../types';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';

interface SixMonthCashFlowBarChartProps {
  mutasis: Mutasi[];
  className?: string;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const SixMonthCashFlowBarChart: React.FC<SixMonthCashFlowBarChartProps> = ({
  mutasis,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'nominal' | 'surplus' | 'volume'>('nominal');

  // Compute the last 6 months bucket series based on mutasis date or current date
  const chartData = useMemo(() => {
    // Determine reference anchor date
    let refDate = new Date();
    if (mutasis.length > 0) {
      // Find latest date in mutasis
      const validDates = mutasis
        .map(m => m.tanggal ? new Date(m.tanggal).getTime() : 0)
        .filter(t => !isNaN(t) && t > 0);
      if (validDates.length > 0) {
        const maxTime = Math.max(...validDates);
        const maxDate = new Date(maxTime);
        if (maxDate > refDate) {
          refDate = maxDate;
        }
      }
    }

    const currentYear = refDate.getFullYear();
    const currentMonth = refDate.getMonth(); // 0-indexed

    // Generate array of 6 consecutive months leading up to reference month
    const months: {
      key: string; // YYYY-MM
      shortLabel: string;
      fullLabel: string;
      year: number;
      monthIndex: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      months.push({
        key,
        shortLabel: `${MONTH_NAMES_SHORT[m]} '${String(y).slice(-2)}`,
        fullLabel: `${MONTH_NAMES_FULL[m]} ${y}`,
        year: y,
        monthIndex: m
      });
    }

    // Populate data for each month
    return months.map(m => {
      const monthMutasis = mutasis.filter(mut => {
        if (!mut.tanggal) return false;
        // Mutasi date could be YYYY-MM-DD or ISO string
        return mut.tanggal.startsWith(m.key);
      });

      const masukNominal = monthMutasis
        .filter(mut => mut.tipe === 'Masuk')
        .reduce((sum, mut) => sum + (mut.nominal || 0), 0);

      const keluarNominal = monthMutasis
        .filter(mut => mut.tipe === 'Keluar')
        .reduce((sum, mut) => sum + (mut.nominal || 0), 0);

      const countMasuk = monthMutasis.filter(mut => mut.tipe === 'Masuk').length;
      const countKeluar = monthMutasis.filter(mut => mut.tipe === 'Keluar').length;
      const surplus = masukNominal - keluarNominal;

      return {
        key: m.key,
        bulan: m.shortLabel,
        bulanLengkap: m.fullLabel,
        pemasukan: masukNominal,
        pengeluaran: keluarNominal,
        surplus: surplus,
        volumeMasuk: countMasuk,
        volumeKeluar: countKeluar,
        volumeTotal: countMasuk + countKeluar
      };
    });
  }, [mutasis]);

  // Aggregate statistics for the 6-month period
  const stats = useMemo(() => {
    const totalMasuk = chartData.reduce((acc, d) => acc + d.pemasukan, 0);
    const totalKeluar = chartData.reduce((acc, d) => acc + d.pengeluaran, 0);
    const netSurplus = totalMasuk - totalKeluar;
    const totalVolume = chartData.reduce((acc, d) => acc + d.volumeTotal, 0);
    const avgMasukPerBulan = Math.round(totalMasuk / 6);
    const avgKeluarPerBulan = Math.round(totalKeluar / 6);

    return {
      totalMasuk,
      totalKeluar,
      netSurplus,
      totalVolume,
      avgMasukPerBulan,
      avgKeluarPerBulan
    };
  }, [chartData]);

  const formatRupiah = (val: number) => {
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const formatShortRupiah = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}jt`;
    }
    if (Math.abs(val) >= 1_000) {
      return `${(val / 1_000).toFixed(0)}rb`;
    }
    return `${val}`;
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Grafik Batang Performa Mutasi Kas (6 Bulan Terakhir)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Recharts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Komparasi historis arus kas masuk, pengeluaran operasional, dan volume frekuensi transaksi 6 bulan berjalan
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('nominal')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'nominal'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Arus Kas (Masuk vs Keluar)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('surplus')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'surplus'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Surplus / Defisit
          </button>
          <button
            type="button"
            onClick={() => setViewMode('volume')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'volume'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Volume Transaksi
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              Total Pemasukan
            </span>
          </div>
          <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatRupiah(stats.totalMasuk)}
          </div>
          <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
            Rerata: {formatShortRupiah(stats.avgMasukPerBulan)}/bln
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 font-medium">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Total Pengeluaran
            </span>
          </div>
          <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {formatRupiah(stats.totalKeluar)}
          </div>
          <div className="text-[10px] text-rose-700/70 dark:text-rose-400/70 mt-0.5">
            Rerata: {formatShortRupiah(stats.avgKeluarPerBulan)}/bln
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Surplus Bersih 6 Bln
            </span>
          </div>
          <div className={`text-sm font-extrabold mt-0.5 ${stats.netSurplus >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatRupiah(stats.netSurplus)}
          </div>
          <div className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70 mt-0.5">
            {stats.netSurplus >= 0 ? 'Kondisi Kas Sehat' : 'Defisit Arus Kas'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300 font-medium">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Volume Transaksi
            </span>
          </div>
          <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
            {stats.totalVolume} Mutasi
          </div>
          <div className="text-[10px] text-purple-700/70 dark:text-purple-400/70 mt-0.5">
            Aktivitas pembukuan
          </div>
        </div>
      </div>

      {/* Main Recharts BarChart Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'nominal' ? (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#888' }}
                tickFormatter={formatShortRupiah}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1.5 min-w-[200px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 flex items-center justify-between">
                          <span>{item.bulanLengkap}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {item.volumeTotal} mutasi
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            Pemasukan:
                          </span>
                          <span className="font-bold">{formatRupiah(item.pemasukan)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                            Pengeluaran:
                          </span>
                          <span className="font-bold">{formatRupiah(item.pengeluaran)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400">Net Arus Kas:</span>
                          <span className={`font-bold ${item.surplus >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                            {formatRupiah(item.surplus)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="pemasukan"
                name="Kas Masuk (Inflow)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="pengeluaran"
                name="Kas Keluar (Outflow)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          ) : viewMode === 'surplus' ? (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#888' }}
                tickFormatter={formatShortRupiah}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1 min-w-[190px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {item.bulanLengkap}
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-400">Surplus / (Defisit):</span>
                          <span className={`font-bold ${item.surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatRupiah(item.surplus)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>In: {formatShortRupiah(item.pemasukan)}</span>
                          <span>Out: {formatShortRupiah(item.pengeluaran)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="surplus"
                name="Surplus Bersih (Net Cashflow)"
                radius={[4, 4, 0, 0]}
                maxBarSize={42}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`surplus-cell-${idx}`}
                    fill={entry.surplus >= 0 ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#888' }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1 min-w-[180px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {item.bulanLengkap}
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>Mutasi Masuk:</span>
                          <span className="font-bold">{item.volumeMasuk} transaksi</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-400">
                          <span>Mutasi Keluar:</span>
                          <span className="font-bold">{item.volumeKeluar} transaksi</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 font-bold text-indigo-300">
                          <span>Total Frekuensi:</span>
                          <span>{item.volumeTotal} mutasi</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="volumeMasuk"
                name="Transaksi Kas Masuk"
                fill="#10b981"
                stackId="vol"
                maxBarSize={36}
              />
              <Bar
                dataKey="volumeKeluar"
                name="Transaksi Kas Keluar"
                fill="#f43f5e"
                stackId="vol"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Info Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Periode 6 bulan dihitung secara dinamis dari catatan pembukuan transaksi kas.
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-400">
          Total {stats.totalVolume} mutasi tercatat
        </span>
      </div>
    </div>
  );
};
