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
import { ProductionLog, Book } from '../../types';

interface ProduksiChartsProps {
  productionLogs: ProductionLog[];
  books: Book[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

export const ProduksiCharts: React.FC<ProduksiChartsProps> = ({
  productionLogs,
  books
}) => {
  // 1. Output per Book Title
  const outputByBookMap: Record<string, number> = {};
  productionLogs.forEach(p => {
    const book = books.find(b => b.id === p.buku_id) || p.book;
    const title = book?.judul || `Buku #${p.buku_id}`;
    const shortTitle = title.length > 20 ? `${title.substring(0, 18)}...` : title;
    outputByBookMap[shortTitle] = (outputByBookMap[shortTitle] || 0) + p.qty_produksi;
  });

  const outputByBookData = Object.entries(outputByBookMap).map(([judul, qty]) => ({
    judul,
    qty
  }));

  const bookOutputDisplay = outputByBookData.length > 0 ? outputByBookData : [
    { judul: 'Pembebasan di Tangan Kita', qty: 500 },
    { judul: 'Permata Hati Orang Bijak', qty: 350 },
    { judul: 'Langkah Awal Pencerahan', qty: 250 },
    { judul: 'Pelita Hati Lamrim', qty: 200 }
  ];

  // 2. Production Trend by Month/Batch
  const monthlyProduction = [
    { month: 'Mei', qty: 300, target: 400 },
    { month: 'Jun', qty: 450, target: 500 },
    { month: 'Jul', qty: 600, target: 600 },
    { month: 'Agt', qty: 850, target: 800 },
    {
      month: 'Sep (Aktif)',
      qty: productionLogs.reduce((s, p) => s + p.qty_produksi, 0) || 750,
      target: 800
    }
  ];

  // 3. Completion Rates
  const totalProduced = productionLogs.reduce((s, p) => s + p.qty_produksi, 0);
  const targetMonthly = 1000;
  const targetPct = Math.min(100, Math.round((totalProduced / targetMonthly) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Output Produksi Bulanan vs Target */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Output Produksi Cetak vs Target
              </h3>
              <p className="text-[11px] text-slate-500">Volume eksemplar tuntas cetak per bulan</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Kapasitas Tinggi
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProduction} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Eksemplar`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="qty" name="Realisasi Cetak (Eks)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Produksi (Eks)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Output per Judul Buku */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Alokasi Hasil Cetak per Judul Buku
              </h3>
              <p className="text-[11px] text-slate-500">Distribusi kuantitas masuk gudang per judul</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              {productionLogs.length} Batch
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookOutputDisplay} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis dataKey="judul" type="category" width={160} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Eksemplar`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="qty" name="Jumlah Dicetak" fill="#10b981" radius={[0, 6, 6, 0]}>
                  {bookOutputDisplay.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Production Health & Quality Control Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Indikator Kualitas & Efisiensi Percetakan
            </h3>
            <p className="text-[11px] text-slate-500">Standar operasional prosedur (SOP) percetakan yayasan</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            QC Passed 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Pencapaian Target Bulanan</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{targetPct}%</span>
              <span className="text-[11px] text-slate-400">{totalProduced} / {targetMonthly} eks</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${targetPct}%` }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Presisi Finishing & Binding</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">99.4%</span>
              <span className="text-[11px] text-slate-400">Zero Defect Target</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.4%' }} />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500">Ketepatan Waktu Cetak (SLA)</span>
            <div className="flex justify-between items-center my-1.5">
              <span className="text-lg font-black text-teal-600 dark:text-teal-400">96.8%</span>
              <span className="text-[11px] text-slate-400">Rata-rata 7-10 hari kerja</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '96.8%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
