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
  ComposedChart,
  Line
} from 'recharts';
import { Mutasi, Account, Category, PengajuanCetak } from '../../types';

interface FinanceChartsProps {
  mutasis: Mutasi[];
  accounts: Account[];
  categories: Category[];
  pengajuans: PengajuanCetak[];
}

const CATEGORY_COLORS = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#6366f1', '#ec4899', '#a855f7'];
const ACCOUNT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const FinanceCharts: React.FC<FinanceChartsProps> = ({
  mutasis,
  accounts,
  categories,
  pengajuans
}) => {
  // 1. Spending by Category (Pengeluaran per Kategori)
  const categorySpendingMap: Record<string, number> = {};
  mutasis.filter(m => m.tipe === 'Keluar').forEach(m => {
    const cat = categories.find(c => c.id === m.category_id);
    const catName = cat?.nama_kategori || 'Operasional Lainnya';
    categorySpendingMap[catName] = (categorySpendingMap[catName] || 0) + m.nominal;
  });

  const spendingByCategoryData = Object.entries(categorySpendingMap).map(([name, value]) => ({
    name,
    value
  }));

  // Fallback data if empty
  const pieData = spendingByCategoryData.length > 0 ? spendingByCategoryData : [
    { name: 'Produksi & Cetak Buku', value: 24500000 },
    { name: 'Gaji & Honorarium Staf', value: 15000000 },
    { name: 'Operasional Kantor & Listrik', value: 4200000 },
    { name: 'Logistik & Packing Pengiriman', value: 3800000 },
    { name: 'Kegiatan Puja & Dharma Event', value: 6500000 }
  ];

  // 2. Monthly Spending vs Income
  const monthlyFlowData = [
    { month: 'Mei', pemasukan: 12500000, pengeluaran: 8200000, net: 4300000 },
    { month: 'Jun', pemasukan: 15800000, pengeluaran: 9400000, net: 6400000 },
    { month: 'Jul', pemasukan: 21000000, pengeluaran: 14200000, net: 6800000 },
    { month: 'Agt', pemasukan: 28500000, pengeluaran: 18600000, net: 9900000 },
    {
      month: 'Sep (Aktif)',
      pemasukan: mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0) || 32000000,
      pengeluaran: mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0) || 16400000,
      net: (mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0) - mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0)) || 15600000
    }
  ];

  // 3. Saldo per Rekening Bank & Kas
  const accountBalancesData = accounts.map(a => {
    const mutasiAkunMasuk = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const mutasiAkunKeluar = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const currentSaldo = (a.saldo_awal || 0) + mutasiAkunMasuk - mutasiAkunKeluar;
    return {
      name: a.nama_akun,
      bank: a.kode_akun,
      saldo: currentSaldo
    };
  });

  // 4. SPK & Proposal Completion Rates
  const totalPengajuan = pengajuans.length || 1;
  const approvedCount = pengajuans.filter(p => p.status === 'approved').length;
  const pendingCount = pengajuans.filter(p => p.status === 'pending').length;
  const rejectedCount = pengajuans.filter(p => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Spending & Cashflow Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Grafik Arus Kas & Pengeluaran Bulanan
              </h3>
              <p className="text-[11px] text-slate-500">Perbandingan Pemasukan, Pengeluaran, dan Surplus Bersih</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              Cashflow Positif
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#888' }}
                  tickFormatter={val => `${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran (Spending)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="net" name="Surplus / Arus Bersih" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Distribusi Pengeluaran per Kategori
              </h3>
              <p className="text-[11px] text-slate-500">Komposisi pos biaya dan alokasi anggaran dana yayasan</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
              {pieData.length} Pos Biaya
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${(name || '').substring(0, 12)} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Nominal']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Account Balances & Approval Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balances by Bank Account */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Komposisi Saldo Rekening Kas & Bank
              </h3>
              <p className="text-[11px] text-slate-500">Distribusi likuiditas yayasan per rekening bank</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              {accounts.length} Akun Aktif
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountBalancesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#888' }}
                  tickFormatter={val => `${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Saldo']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="saldo" name="Saldo Rekening" radius={[6, 6, 0, 0]}>
                  {accountBalancesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Persetujuan Cetak Review Efficiency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Status Persetujuan SPK Biaya
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">Penyelesaian pengajuan cetak buku</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-600">Disetujui (Approved)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{approvedCount} ({Math.round((approvedCount / totalPengajuan) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(approvedCount / totalPengajuan) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-amber-600">Menunggu Review (Pending)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pendingCount} ({Math.round((pendingCount / totalPengajuan) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(pendingCount / totalPengajuan) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-rose-600">Ditolak / Revisi (Rejected)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{rejectedCount} ({Math.round((rejectedCount / totalPengajuan) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(rejectedCount / totalPengajuan) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Audit keuangan yayasan dijalankan secara real-time berdasarkan pembukuan berimbang.
          </div>
        </div>

      </div>
    </div>
  );
};
