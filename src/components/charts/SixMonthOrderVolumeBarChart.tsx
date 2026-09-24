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
  Cell
} from 'recharts';
import { Order } from '../../types';
import {
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';

interface SixMonthOrderVolumeBarChartProps {
  orders: Order[];
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

export const SixMonthOrderVolumeBarChart: React.FC<SixMonthOrderVolumeBarChartProps> = ({
  orders,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'volume' | 'omset' | 'books'>('volume');

  // Compute the last 6 months bucket series based on order date or current date
  const chartData = useMemo(() => {
    // Determine reference anchor date
    let refDate = new Date();
    if (orders.length > 0) {
      const validDates = orders
        .map(o => {
          const raw = o.tanggal_pesan || o.created_at;
          return raw ? new Date(raw).getTime() : 0;
        })
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

    // Generate array of 6 consecutive months
    const months: {
      key: string;
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

    return months.map(m => {
      const monthOrders = orders.filter(o => {
        const d = o.tanggal_pesan || o.created_at;
        if (!d) return false;
        return d.startsWith(m.key);
      });

      const lunasOrders = monthOrders.filter(o => o.status === 'Lunas').length;
      const pendingOrders = monthOrders.filter(o => o.status === 'Pending').length;
      const dikirimOrders = monthOrders.filter(o => o.status === 'Dikirim').length;
      const cancelledOrders = monthOrders.filter(o => o.status === 'Cancelled').length;

      const totalOmset = monthOrders.reduce((sum, o) => sum + (o.total_tagihan || 0), 0);
      const lunasOmset = monthOrders
        .filter(o => o.status === 'Lunas' || o.status === 'Dikirim')
        .reduce((sum, o) => sum + (o.total_tagihan || 0), 0);

      const totalBooks = monthOrders.reduce((sum, o) => {
        const itemCount = (o.items || []).reduce((sub, item) => sub + (item.jumlah || 0), 0);
        return sum + itemCount;
      }, 0);

      return {
        key: m.key,
        bulan: m.shortLabel,
        bulanLengkap: m.fullLabel,
        totalPesanan: monthOrders.length,
        lunas: lunasOrders,
        pending: pendingOrders,
        dikirim: dikirimOrders,
        cancelled: cancelledOrders,
        omset: totalOmset,
        lunasOmset: lunasOmset,
        totalBooks: totalBooks
      };
    });
  }, [orders]);

  // Summary statistics for the 6-month period
  const stats = useMemo(() => {
    const totalOrders = chartData.reduce((acc, d) => acc + d.totalPesanan, 0);
    const totalLunas = chartData.reduce((acc, d) => acc + d.lunas + d.dikirim, 0);
    const totalPending = chartData.reduce((acc, d) => acc + d.pending, 0);
    const totalOmset = chartData.reduce((acc, d) => acc + d.omset, 0);
    const totalBooks = chartData.reduce((acc, d) => acc + d.totalBooks, 0);
    const avgPesananPerBulan = Math.round(totalOrders / 6);
    const lunasRate = totalOrders > 0 ? Math.round((totalLunas / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalLunas,
      totalPending,
      totalOmset,
      totalBooks,
      avgPesananPerBulan,
      lunasRate
    };
  }, [chartData]);

  const formatRupiah = (val: number) => {
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const formatShortRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}jt`;
    }
    if (val >= 1_000) {
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
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Grafik Batang Volume Pesanan & Penjualan (6 Bulan Terakhir)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Recharts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tren volume transaksi masuk, rasio pelunasan pesanan, dan nominal omset selama 6 bulan terakhir
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('volume')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'volume'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Volume Pesanan (Invoice)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('omset')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'omset'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Omset Penjualan (Rp)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('books')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'books'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Eksemplar Buku (Pcs)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              Total Pesanan 6 Bln
            </span>
          </div>
          <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {stats.totalOrders} Transaksi
          </div>
          <div className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mt-0.5">
            Rerata: {stats.avgPesananPerBulan} pesanan/bln
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Tingkat Pelunasan
            </span>
          </div>
          <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.lunasRate}% Lunas
          </div>
          <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
            {stats.totalLunas} lunas / {stats.totalPending} pending
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Total Omset 6 Bln
            </span>
          </div>
          <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {formatRupiah(stats.totalOmset)}
          </div>
          <div className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70 mt-0.5">
            Nilai kotor seluruh pesanan
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
          <div className="flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-300 font-medium">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Buku Didistribusikan
            </span>
          </div>
          <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
            {stats.totalBooks.toLocaleString('id-ID')} Eksemplar
          </div>
          <div className="text-[10px] text-teal-700/70 dark:text-teal-400/70 mt-0.5">
            Volume buku cetak yayasan
          </div>
        </div>
      </div>

      {/* Main Recharts BarChart Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'volume' ? (
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
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1.5 min-w-[210px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 flex items-center justify-between">
                          <span>{item.bulanLengkap}</span>
                          <span className="text-[10px] text-blue-400 font-bold">
                            Total {item.totalPesanan} Pesanan
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            Pesanan Lunas:
                          </span>
                          <span className="font-bold">{item.lunas} invoice</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            Pesanan Pending:
                          </span>
                          <span className="font-bold">{item.pending} invoice</span>
                        </div>
                        {item.dikirim > 0 && (
                          <div className="flex justify-between items-center text-cyan-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                              Sedang Dikirim:
                            </span>
                            <span className="font-bold">{item.dikirim} invoice</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400">Nilai Omset:</span>
                          <span className="font-bold text-indigo-300">
                            {formatRupiah(item.omset)}
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
                dataKey="lunas"
                name="Pesanan Lunas"
                fill="#10b981"
                stackId="orders"
                maxBarSize={38}
              />
              <Bar
                dataKey="dikirim"
                name="Sedang Dikirim"
                fill="#06b6d4"
                stackId="orders"
                maxBarSize={38}
              />
              <Bar
                dataKey="pending"
                name="Menunggu Pelunasan (Pending)"
                fill="#f59e0b"
                stackId="orders"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          ) : viewMode === 'omset' ? (
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1 min-w-[200px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {item.bulanLengkap}
                        </div>
                        <div className="flex justify-between items-center text-indigo-400 pt-1">
                          <span>Total Omset:</span>
                          <span className="font-bold">{formatRupiah(item.omset)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                          <span>Dari {item.totalPesanan} transaksi</span>
                          <span>{item.totalBooks} eksemplar</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="omset"
                name="Total Omset Penjualan"
                fill="#6366f1"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={`omset-cell-${idx}`}
                    fill={idx === chartData.length - 1 ? '#4f46e5' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
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
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs text-white space-y-1 min-w-[190px]">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {item.bulanLengkap}
                        </div>
                        <div className="flex justify-between items-center text-teal-400 pt-1">
                          <span>Buku Terdistribusi:</span>
                          <span className="font-bold">{item.totalBooks} eksemplar</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Total {item.totalPesanan} pesanan pembeli
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalBooks"
                name="Eksemplar Buku Terjual"
                fill="#0d9488"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Info Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Data agregat 6 bulan diperbarui secara real-time dari seluruh kanal penjualan.
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-400">
          Total {stats.totalOrders} pesanan diproses
        </span>
      </div>
    </div>
  );
};
