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
  Cell
} from 'recharts';
import { Book, PengajuanCetak } from '../../types';

interface PenerbitanChartsProps {
  books: Book[];
  pengajuans: PengajuanCetak[];
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const STATUS_COLORS: Record<string, string> = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#f43f5e'
};

export const PenerbitanCharts: React.FC<PenerbitanChartsProps> = ({
  books,
  pengajuans
}) => {
  // 1. Stock by Book
  const stockByBookData = books.map(b => ({
    judul: b.judul.length > 20 ? `${b.judul.substring(0, 18)}...` : b.judul,
    fullJudul: b.judul,
    stok: b.stok_gudang || 0,
    valuasi: (b.stok_gudang || 0) * (b.harga_jual || 0)
  })).sort((a, b) => b.stok - a.stok).slice(0, 6);

  // 2. Status Pengajuan Cetak
  const statusCounts = {
    approved: pengajuans.filter(p => p.status === 'approved').length,
    pending: pengajuans.filter(p => p.status === 'pending').length,
    rejected: pengajuans.filter(p => p.status === 'rejected').length
  };

  const statusPieData = [
    { name: 'Disetujui', value: statusCounts.approved || 1, key: 'approved' },
    { name: 'Menunggu', value: statusCounts.pending || 0, key: 'pending' },
    { name: 'Ditolak', value: statusCounts.rejected || 0, key: 'rejected' }
  ].filter(d => d.value > 0);

  // 3. Price vs Margin Insight
  const totalValuasi = books.reduce((sum, b) => sum + ((b.stok_gudang || 0) * (b.harga_jual || 0)), 0);
  const totalStok = books.reduce((sum, b) => sum + (b.stok_gudang || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stock Volume per Judul Buku */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Stok Fisik & Valuasi per Judul Buku Teratas
              </h3>
              <p className="text-[11px] text-slate-500">Ketersediaan eksemplar di gudang yayasan</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
              {totalStok} Total Eks
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByBookData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="judul" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'Stok (Eks)' ? `${value} Eksemplar` : `Rp ${Number(value).toLocaleString('id-ID')}`,
                    name
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullJudul || label;
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="stok" name="Stok (Eks)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pengajuan Cetak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Rasio Pengajuan Cetak
              </h3>
              <p className="text-[11px] text-slate-500">Status verifikasi SPK cetak</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              {pengajuans.length} Dokumen
            </span>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={STATUS_COLORS[entry.key] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Judul`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Total Valuasi Aset Buku:</span>
              <strong className="text-slate-900 dark:text-white font-mono">Rp {totalValuasi.toLocaleString('id-ID')}</strong>
            </div>
            <div className="flex justify-between">
              <span>Judul Terdaftar:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{books.length} Judul</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
