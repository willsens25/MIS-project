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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Penyaluran, LogisticLog, Order } from '../../types';

interface LogistikChartsProps {
  penyalurans: Penyaluran[];
  logisticLogs: LogisticLog[];
  orders: Order[];
}

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  'selesai dikirim': '#10b981',
  'proses packing': '#f59e0b',
  'dalam perjalanan': '#06b6d4',
  'tertunda': '#f43f5e'
};

export const LogistikCharts: React.FC<LogistikChartsProps> = ({
  penyalurans,
  logisticLogs,
  orders
}) => {
  // 1. Distribution by Purpose / Channel
  const purposeMap: Record<string, number> = {
    'Ekspedisi Pesanan Pembeli': 0,
    'Penyaluran Vihara & Donasi': 0,
    'Bazar & Acara Dharma': 0,
    'Distribusi Cabang / Relawan': 0
  };

  penyalurans.forEach(p => {
    const dest = (p.nama_agen || '').toLowerCase();
    if (dest.includes('vihara') || dest.includes('candi') || dest.includes('donasi')) {
      purposeMap['Penyaluran Vihara & Donasi'] += p.qty;
    } else if (dest.includes('bazar') || dest.includes('event') || dest.includes('stand')) {
      purposeMap['Bazar & Acara Dharma'] += p.qty;
    } else {
      purposeMap['Ekspedisi Pesanan Pembeli'] += p.qty;
    }
  });

  logisticLogs.forEach(l => {
    const dest = (l.tujuan || '').toLowerCase();
    const qty = l.qty_keluar || 0;
    if (dest.includes('vihara') || dest.includes('donasi')) {
      purposeMap['Penyaluran Vihara & Donasi'] += qty;
    } else if (dest.includes('bazar') || dest.includes('event')) {
      purposeMap['Bazar & Acara Dharma'] += qty;
    } else {
      purposeMap['Distribusi Cabang / Relawan'] += qty;
    }
  });

  const channelData = Object.entries(purposeMap)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => ({ name, qty }));

  const channelDisplay = channelData.length > 0 ? channelData : [
    { name: 'Ekspedisi Pesanan Pembeli', qty: 320 },
    { name: 'Penyaluran Vihara & Donasi', qty: 180 },
    { name: 'Bazar & Acara Dharma', qty: 95 },
    { name: 'Distribusi Relawan', qty: 60 }
  ];

  // 2. Packing & Dispatch Status
  const statusMap: Record<string, number> = {};
  penyalurans.forEach(p => {
    const st = p.status || 'proses packing';
    statusMap[st] = (statusMap[st] || 0) + 1;
  });

  const statusData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value
  }));

  const statusPieDisplay = statusData.length > 0 ? statusData : [
    { name: 'selesai dikirim', value: 38 },
    { name: 'proses packing', value: 8 },
    { name: 'dalam perjalanan', value: 14 }
  ];

  // 3. Weekly Shipping Volume Trend
  const weeklyShipping = [
    { minggu: 'Mg 1', unit: 65 },
    { minggu: 'Mg 2', unit: 92 },
    { minggu: 'Mg 3', unit: 124 },
    { minggu: 'Mg 4 (Aktif)', unit: 148 }
  ];

  const totalDispatched = penyalurans.reduce((s, p) => s + p.qty, 0) + logisticLogs.reduce((s, l) => s + (l.qty_keluar || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi Pengiriman Berdasarkan Kanal Tujuan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Volume Penyaluran Berdasarkan Kanal Tujuan
              </h3>
              <p className="text-[11px] text-slate-500">Alokasi eksemplar buku keluar dari gudang</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800">
              {totalDispatched} Eks Total
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelDisplay} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Eksemplar`, 'Volume']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="qty" name="Kuantitas (Eks)" fill="#06b6d4" radius={[0, 6, 6, 0]}>
                  {channelDisplay.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pengiriman & Rasio Selesai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Status Pemenuhan
              </h3>
              <p className="text-[11px] text-slate-500 mb-2">Progres pengemasan & resi</p>
            </div>
            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieDisplay}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieDisplay.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Dokumen`, 'Jumlah']}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              {statusPieDisplay.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="capitalize text-slate-600 dark:text-slate-400">{item.name}:</span>
                  <strong className="text-slate-900 dark:text-white">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Laju Kirim Mingguan
              </h3>
              <p className="text-[11px] text-slate-500 mb-2">Throughput paket keluar</p>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyShipping} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="minggu" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Unit`, 'Terkirim']}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="unit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Surat jalan otomatis tercatat di logistik.
            </div>
          </div>

        </div>

      </div>

      {/* SLA & Fulfillment Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tingkat Ketepatan & Efisiensi Distribusi Logistik
            </h3>
            <p className="text-[11px] text-slate-500">Key Performance Indicators (KPI) Operasional Pengiriman</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            Fulfillment Rate 98.6%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Kecepatan Packing & Resi</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">&lt; 24 Jam</span>
              <span className="text-[11px] text-slate-400">Standard Express</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '95%' }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Akurasi Item & Eksemplar</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">99.8%</span>
              <span className="text-[11px] text-slate-400">Sesuai Surat Jalan</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.8%' }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Integritas Kemasan (Bubble & Dus)</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">100%</span>
              <span className="text-[11px] text-slate-400">Standar Proteksi Tebal</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
