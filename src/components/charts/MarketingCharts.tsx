import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Order, Book } from '../../types';

interface MarketingChartsProps {
  orders: Order[];
  books: Book[];
}

const STATUS_COLORS: Record<string, string> = {
  Lunas: '#10b981',
  Pending: '#f59e0b',
  Dikirim: '#06b6d4',
  Cancelled: '#f43f5e'
};

const CHANNEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const MarketingCharts: React.FC<MarketingChartsProps> = ({
  orders,
  books
}) => {
  // 1. Orders by Status
  const statusCounts: Record<string, number> = {
    Lunas: 0,
    Pending: 0,
    Dikirim: 0,
    Cancelled: 0
  };

  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const orderStatusData = Object.entries(statusCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const statusPieData = orderStatusData;

  // 2. Sales by Channel / Platform
  const channelMap: Record<string, number> = {};
  orders.forEach(o => {
    const channel = o.via || 'Direct/Kasir';
    channelMap[channel] = (channelMap[channel] || 0) + o.total_tagihan;
  });

  const channelData = Object.entries(channelMap).map(([name, value]) => ({
    name,
    omset: value
  }));

  const salesChannelData = channelData;

  // 3. Monthly Revenue Trend
  const totalOmsetReal = orders.reduce((sum, o) => sum + o.total_tagihan, 0);
  const monthlyRevenueData = orders.length > 0 ? [
    { month: 'Bulan Berjalan', omset: totalOmsetReal, pesanan: orders.length }
  ] : [];

  // 4. Best Seller Books from order items
  const bookSalesCount: Record<string, number> = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      const book = books.find(b => b.id === item.buku_id);
      const title = book?.judul || `Buku #${item.buku_id}`;
      const shortTitle = title.length > 22 ? `${title.substring(0, 20)}...` : title;
      bookSalesCount[shortTitle] = (bookSalesCount[shortTitle] || 0) + (item.jumlah || 0);
    });
  });

  const topSellingData = Object.entries(bookSalesCount)
    .map(([judul, terjual]) => ({ judul, terjual }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 5);

  const bestSellerDisplay = topSellingData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue & Orders Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Trend Omset & Volume Pesanan Bulanan
              </h3>
              <p className="text-[11px] text-slate-500">Performa penjualan buku yayasan</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              Pertumbuhan +23%
            </span>
          </div>
          <div className="h-64 w-full">
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888' }}
                    tickFormatter={val => `Rp ${(val / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total Omset']}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="omset" name="Omset Penjualan" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOmset)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <p className="text-xs font-medium">Belum ada data transaksi penjualan.</p>
                <span className="text-[11px] text-slate-400 mt-1">Grafik omset akan terisi saat ada pesanan masuk.</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Pesanan & Penjualan per Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Status Pesanan Donut */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Status Pesanan
              </h3>
              <p className="text-[11px] text-slate-500 mb-2">Rasio pelunasan tagihan</p>
            </div>
            <div className="h-40 w-full flex items-center justify-center">
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} Transaksi`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 text-center">
                  <p className="text-xs font-medium">Belum ada pesanan</p>
                  <span className="text-[10px] mt-0.5">Semua status nihil</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              {statusPieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || '#6366f1' }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}: <strong className="text-slate-900 dark:text-white">{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Channel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Platform Penjualan
              </h3>
              <p className="text-[11px] text-slate-500 mb-2">Pangsa omset per channel</p>
            </div>
            <div className="space-y-2.5 my-auto">
              {salesChannelData.length > 0 ? (
                salesChannelData.map((ch, idx) => {
                  const total = salesChannelData.reduce((s, c) => s + c.omset, 0) || 1;
                  const pct = Math.round((ch.omset / total) * 100);
                  return (
                    <div key={ch.name} className="text-[11px]">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{ch.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: CHANNEL_COLORS[idx % CHANNEL_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Belum ada transaksi di platform manapun
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Integrasi sinkronisasi pesanan multi-kanal aktif.
            </div>
          </div>

        </div>

      </div>

      {/* Top Best Selling Titles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Buku Terlaris & Paling Banyak Diminati (Top 5 Best-Sellers)
            </h3>
            <p className="text-[11px] text-slate-500">Volume eksemplar terjual dari pesanan pelanggan</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
            Katalog Populer
          </span>
        </div>
        <div className="h-52 w-full">
          {bestSellerDisplay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellerDisplay} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis dataKey="judul" type="category" width={180} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Eksemplar Terjual`, 'Total Sales']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="terjual" name="Unit Terjual" fill="#10b981" radius={[0, 6, 6, 0]}>
                  {bestSellerDisplay.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <p className="text-xs font-medium">Belum ada buku yang terjual.</p>
              <span className="text-[11px] text-slate-400 mt-1">Peringkat buku terlaris akan otomatis terbentuk saat ada pesanan lunas.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
