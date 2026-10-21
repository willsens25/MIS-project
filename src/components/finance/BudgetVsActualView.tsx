import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BudgetPagu, DivisionId } from '../../types';
import {
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  Layers,
  HelpCircle,
  Info,
  RefreshCw,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { RupiahInput } from '../common/RupiahInput';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';

const DIVISION_NAMES: Record<DivisionId, string> = {
  1: 'Direktorat',
  2: 'Finance & Akuntansi',
  3: 'Penerbitan & Editor',
  4: 'Marketing & Bazaar',
  5: 'Produksi & Cetak',
  6: 'Logistik & Distribusi'
};

const DIVISION_COLORS: Record<DivisionId, string> = {
  1: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  2: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  3: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  4: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  5: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  6: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
};

type BudgetPeriod = 'Tahunan' | 'Semester 1' | 'Semester 2' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Bulanan';

const PERIOD_OPTIONS: BudgetPeriod[] = [
  'Tahunan',
  'Semester 1',
  'Semester 2',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Bulanan'
];

export interface ComputedBudgetItem extends BudgetPagu {
  realisasi_terhitung: number;
  sisa: number;
  persentase: number;
  spending_status: 'safe' | 'warning' | 'danger';
}

export const BudgetVsActualView: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, bulkDeleteBudgets, mutasis, categories, showToast } = useApp();

  // Filters & State
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [selectedDivision, setSelectedDivision] = useState<DivisionId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'safe' | 'warning' | 'danger'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<number[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetPagu | null>(null);

  // Form Fields
  const [formDivisiId, setFormDivisiId] = useState<DivisionId>(2);
  const [formNamaPos, setFormNamaPos] = useState('');
  const [formTahun, setFormTahun] = useState<number>(2026);
  const [formPeriode, setFormPeriode] = useState<BudgetPeriod>('Tahunan');
  const [formKategoriId, setFormKategoriId] = useState<number | undefined>(undefined);
  const [formPaguAnggaran, setFormPaguAnggaran] = useState<number>(0);
  const [formRealisasiManual, setFormRealisasiManual] = useState<number | undefined>(undefined);
  const [formPenanggungJawab, setFormPenanggungJawab] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Calculate actual expenditure for each budget item
  // Matches against mutasi 'Keluar' where category or description correlates
  const computedBudgets: ComputedBudgetItem[] = useMemo(() => {
    return budgets.map(b => {
      let actualSpending = 0;

      // If user supplied an explicit manual realization override
      if (b.realisasi_manual !== undefined && b.realisasi_manual > 0) {
        actualSpending = b.realisasi_manual;
      } else {
        // Calculate dynamic spending from mutasis of type 'Keluar'
        const matchedMutasis = mutasis.filter(m => {
          if (m.tipe !== 'Keluar') return false;

          // Check if mutasi year matches budget year
          const mutasiYear = new Date(m.tanggal).getFullYear();
          if (mutasiYear !== b.tahun) return false;

          // Check category match if category_id exists
          if (b.kategori_id && m.category_id) {
            if (m.category_id === b.kategori_id) return true;
          }

          // Check pos description keywords in mutasi keterangan
          if (b.nama_pos_anggaran && m.keterangan) {
            const posKeywords = b.nama_pos_anggaran.toLowerCase().split(' ').filter(w => w.length > 3);
            if (posKeywords.some(kw => m.keterangan.toLowerCase().includes(kw))) {
              return true;
            }
          }

          return false;
        });

        const totalFromMutasi = matchedMutasis.reduce((sum, m) => sum + (m.nominal || 0), 0);
        actualSpending = totalFromMutasi;
      }

      const sisa = b.pagu_anggaran - actualSpending;
      const persentase = b.pagu_anggaran > 0 ? (actualSpending / b.pagu_anggaran) * 100 : 0;

      let spending_status: 'safe' | 'warning' | 'danger' = 'safe';
      if (persentase >= 100) {
        spending_status = 'danger';
      } else if (persentase >= 75) {
        spending_status = 'warning';
      }

      return {
        ...b,
        realisasi_terhitung: actualSpending,
        sisa,
        persentase,
        spending_status
      };
    });
  }, [budgets, mutasis]);

  // Filtered budgets
  const filteredBudgets = useMemo(() => {
    return computedBudgets.filter(item => {
      if (selectedYear !== 'all' && item.tahun !== selectedYear) return false;
      if (selectedDivision !== 'all' && item.divisi_id !== selectedDivision) return false;
      if (selectedStatus !== 'all' && item.spending_status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchPos = item.nama_pos_anggaran.toLowerCase().includes(query);
        const matchKet = (item.keterangan || '').toLowerCase().includes(query);
        const matchDivisi = DIVISION_NAMES[item.divisi_id]?.toLowerCase().includes(query);
        if (!matchPos && !matchKet && !matchDivisi) return false;
      }

      return true;
    });
  }, [computedBudgets, selectedYear, selectedDivision, selectedStatus, searchQuery]);

  // KPI Aggregates
  const totalPagu = useMemo(() => {
    return filteredBudgets.reduce((sum, b) => sum + b.pagu_anggaran, 0);
  }, [filteredBudgets]);

  const totalRealisasi = useMemo(() => {
    return filteredBudgets.reduce((sum, b) => sum + b.realisasi_terhitung, 0);
  }, [filteredBudgets]);

  const totalSisa = totalPagu - totalRealisasi;
  const totalPersenPenyerapan = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;
  const overbudgetCount = filteredBudgets.filter(b => b.spending_status === 'danger').length;
  const warningCount = filteredBudgets.filter(b => b.spending_status === 'warning').length;

  // Chart Data: Group by Division
  const divisionChartData = useMemo(() => {
    const map = new Map<DivisionId, { divisionName: string; pagu: number; realisasi: number }>();

    // Initialize all 6 divisions
    ([1, 2, 3, 4, 5, 6] as DivisionId[]).forEach(divId => {
      map.set(divId, {
        divisionName: DIVISION_NAMES[divId].split(' ')[0], // short name
        pagu: 0,
        realisasi: 0
      });
    });

    filteredBudgets.forEach(b => {
      const entry = map.get(b.divisi_id);
      if (entry) {
        entry.pagu += b.pagu_anggaran;
        entry.realisasi += b.realisasi_terhitung;
      }
    });

    return Array.from(map.values()).filter(d => d.pagu > 0 || d.realisasi > 0);
  }, [filteredBudgets]);

  // Form open handler
  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setFormDivisiId(selectedDivision !== 'all' ? selectedDivision : 2);
    setFormNamaPos('');
    setFormTahun(selectedYear !== 'all' ? selectedYear : 2026);
    setFormPeriode('Tahunan');
    setFormKategoriId(categories.length > 0 ? categories[0].id : undefined);
    setFormPaguAnggaran(10000000);
    setFormRealisasiManual(undefined);
    setFormPenanggungJawab('');
    setFormKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget: BudgetPagu) => {
    setEditingBudget(budget);
    setFormDivisiId(budget.divisi_id);
    setFormNamaPos(budget.nama_pos_anggaran);
    setFormTahun(budget.tahun);
    setFormPeriode(budget.periode);
    setFormKategoriId(budget.kategori_id);
    setFormPaguAnggaran(budget.pagu_anggaran);
    setFormRealisasiManual(budget.realisasi_manual);
    setFormPenanggungJawab(budget.penanggung_jawab || '');
    setFormKeterangan(budget.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaPos.trim()) {
      showToast('Nama pos belanja wajib diisi.', 'error');
      return;
    }
    if (formPaguAnggaran <= 0) {
      showToast('Alokasi nominal pagu harus lebih besar dari 0.', 'error');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        divisi_id: formDivisiId,
        nama_pos_anggaran: formNamaPos.trim(),
        tahun: formTahun,
        periode: formPeriode,
        kategori_id: formKategoriId,
        pagu_anggaran: formPaguAnggaran,
        realisasi_manual: formRealisasiManual && formRealisasiManual > 0 ? formRealisasiManual : undefined,
        penanggung_jawab: formPenanggungJawab.trim() || undefined,
        keterangan: formKeterangan.trim() || undefined
      });
    } else {
      addBudget({
        divisi_id: formDivisiId,
        nama_pos_anggaran: formNamaPos.trim(),
        tahun: formTahun,
        periode: formPeriode,
        kategori_id: formKategoriId,
        pagu_anggaran: formPaguAnggaran,
        realisasi_manual: formRealisasiManual && formRealisasiManual > 0 ? formRealisasiManual : undefined,
        penanggung_jawab: formPenanggungJawab.trim() || undefined,
        keterangan: formKeterangan.trim() || undefined,
        status: 'Aktif'
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteSingle = (id: number, namaPos: string) => {
    if (window.confirm(`Yakin ingin menghapus pagu anggaran "${namaPos}"?`)) {
      deleteBudget(id);
      setSelectedBudgetIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedBudgetIds.length === 0) return;
    if (window.confirm(`Yakin ingin menghapus ${selectedBudgetIds.length} pagu anggaran yang dipilih?`)) {
      bulkDeleteBudgets(selectedBudgetIds);
      setSelectedBudgetIds([]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBudgetIds(filteredBudgets.map(b => b.id));
    } else {
      setSelectedBudgetIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedBudgetIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const exportRows = filteredBudgets.map((b, idx) => ({
      no: idx + 1,
      divisi: DIVISION_NAMES[b.divisi_id],
      pos: b.nama_pos_anggaran,
      periode: b.periode,
      tahun: b.tahun,
      pagu: b.pagu_anggaran,
      realisasi: b.realisasi_terhitung,
      sisa: b.sisa,
      persen: `${b.persentase.toFixed(1)}%`,
      status: b.spending_status === 'danger' ? 'OVERBUDGET' : b.spending_status === 'warning' ? 'PERINGATAN' : 'AMAN',
      pic: b.penanggung_jawab || '-',
      keterangan: b.keterangan || ''
    }));

    exportDataToCsv({
      filename: `Laporan_Pagu_Anggaran_${getCsvDateStamp()}`,
      title: 'LAPORAN PAGU ANGGARAN VS REALISASI BELANJA - MIS LAMRIMNESIA',
      columns: [
        { header: 'No', key: 'no' },
        { header: 'Divisi', key: 'divisi' },
        { header: 'Pos Belanja', key: 'pos' },
        { header: 'Periode', key: 'periode' },
        { header: 'Tahun', key: 'tahun' },
        { header: 'Pagu Alokasi (Rp)', key: 'pagu' },
        { header: 'Realisasi Belanja (Rp)', key: 'realisasi' },
        { header: 'Sisa Anggaran (Rp)', key: 'sisa' },
        { header: 'Penyerapan (%)', key: 'persen' },
        { header: 'Status', key: 'status' },
        { header: 'Penanggung Jawab', key: 'pic' },
        { header: 'Keterangan', key: 'keterangan' }
      ],
      data: exportRows
    });

    showToast('Laporan Pagu & Realisasi berhasil diekspor ke CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <PieIcon className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">
              Pengendalian Biaya & Anggaran (Budgetary Control)
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pagu Anggaran vs Realisasi Belanja
          </h2>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            Pantau batas plafon biaya per divisi, lacak tingkat penyerapan anggaran, dan deteksi peringatan overbudget lebih dini secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-medium text-white transition-colors"
            title="Ekspor CSV"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Pagu Anggaran
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Pagu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Pagu</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Rp {totalPagu.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredBudgets.length} pos anggaran aktif
          </div>
        </div>

        {/* Card 2: Realisasi */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Realisasi</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Rp {totalRealisasi.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Terserap riil dari mutasi / buku kas
          </div>
        </div>

        {/* Card 3: Sisa Anggaran */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sisa Saldo</span>
            <ArrowDownRight className={`w-4 h-4 ${totalSisa < 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-xl font-bold ${totalSisa < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {totalSisa < 0 ? '-' : ''}Rp {Math.abs(totalSisa).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalSisa >= 0 ? 'Plafon dana masih tersedia' : 'Defisit anggaran terlampaui!'}
          </div>
        </div>

        {/* Card 4: Penyerapan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Penyerapan</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalPersenPenyerapan.toFixed(1)}%
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                totalPersenPenyerapan >= 100
                  ? 'bg-rose-500'
                  : totalPersenPenyerapan >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(totalPersenPenyerapan, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 5: Overbudget Alert */}
        <div className={`rounded-2xl p-4 border shadow-sm relative overflow-hidden ${
          overbudgetCount > 0
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Overbudget</span>
            {overbudgetCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="text-xl font-bold">
            {overbudgetCount} Pos Belanja
          </div>
          <div className="text-xs mt-1 opacity-80">
            {overbudgetCount > 0
              ? `${overbudgetCount} pos melebihi 100% alokasi`
              : `${warningCount} pos mendekati batas aman`}
          </div>
        </div>
      </div>

      {/* Chart & Highlights */}
      {divisionChartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Komparasi Pagu Anggaran vs Realisasi per Divisi
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Perbandingan alokasi rencana biaya (biru) vs serapan aktual (emas) untuk tahun {selectedYear === 'all' ? 'Seluruh Tahun' : selectedYear}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Pagu
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 ml-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Realisasi
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionChartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="divisionName" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={value => `Rp ${(value / 1000000).toFixed(0)}Jt`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  labelFormatter={(label) => `Divisi: ${label}`}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="pagu" fill="#F59E0B" name="Pagu Anggaran" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasi" fill="#3B82F6" name="Realisasi Belanja" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pos / keterangan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Filter Divisi */}
          <div>
            <select
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value === 'all' ? 'all' : Number(e.target.value) as DivisionId)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
            >
              <option value="all">Semua Divisi (1 - 6)</option>
              <option value="1">Divisi 1: Direktorat</option>
              <option value="2">Divisi 2: Finance & Akuntansi</option>
              <option value="3">Divisi 3: Penerbitan & Editor</option>
              <option value="4">Divisi 4: Marketing & Bazaar</option>
              <option value="5">Divisi 5: Produksi & Cetak</option>
              <option value="6">Divisi 6: Logistik & Distribusi</option>
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
            >
              <option value="all">Semua Tahun Anggaran</option>
              <option value="2026">Tahun Anggaran 2026</option>
              <option value="2025">Tahun Anggaran 2025</option>
              <option value="2024">Tahun Anggaran 2024</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
            >
              <option value="all">Semua Status Penyerapan</option>
              <option value="safe">Aman (&lt; 75%)</option>
              <option value="warning">Peringatan (75% - 99%)</option>
              <option value="danger">Overbudget (≥ 100%)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Banner */}
        {selectedBudgetIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
            <span>
              <strong>{selectedBudgetIds.length}</strong> pos pagu anggaran dipilih.
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Terpilih
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredBudgets.length > 0 && selectedBudgetIds.length === filteredBudgets.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="p-3">Pos Belanja & Divisi</th>
                <th className="p-3">Periode</th>
                <th className="p-3 text-right">Pagu Alokasi</th>
                <th className="p-3 text-right">Realisasi Aktual</th>
                <th className="p-3 text-right">Sisa Saldo</th>
                <th className="p-3 text-center min-w-[140px]">Penyerapan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <PieIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                      <p className="font-medium text-sm">Tidak ada pos pagu anggaran yang cocok</p>
                      <p className="text-xs text-gray-400">
                        Coba sesuaikan filter pencarian atau tambahkan pos anggaran baru untuk divisi terkait.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Pos Pagu Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map(item => {
                  const isSelected = selectedBudgetIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-amber-50/40 dark:hover:bg-gray-700/40 transition-colors ${
                        isSelected ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {item.nama_pos_anggaran}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              DIVISION_COLORS[item.divisi_id]
                            }`}
                          >
                            {DIVISION_NAMES[item.divisi_id]}
                          </span>
                          {item.penanggung_jawab && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                              PIC: {item.penanggung_jawab}
                            </span>
                          )}
                        </div>
                        {item.keterangan && (
                          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">
                            "{item.keterangan}"
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">
                          {item.periode}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          TA {item.tahun}
                        </div>
                      </td>

                      <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                        Rp {item.pagu_anggaran.toLocaleString('id-ID')}
                      </td>

                      <td className="p-3 text-right">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          Rp {item.realisasi_terhitung.toLocaleString('id-ID')}
                        </div>
                        {item.realisasi_manual !== undefined && (
                          <span className="text-[10px] text-gray-400 block">
                            (override manual)
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <span
                          className={`font-semibold ${
                            item.sisa < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.sisa < 0 ? '-' : ''}Rp {Math.abs(item.sisa).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            {item.persentase.toFixed(1)}%
                          </span>
                          {item.persentase >= 100 && (
                            <span className="text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                              Over +{(item.persentase - 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              item.spending_status === 'danger'
                                ? 'bg-rose-500'
                                : item.spending_status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(item.persentase, 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        {item.spending_status === 'danger' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-500" /> Overbudget
                          </span>
                        ) : item.spending_status === 'warning' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <Info className="w-3 h-3 text-amber-500" /> Peringatan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <Check className="w-3 h-3 text-emerald-500" /> Aman
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit Pagu"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(item.id, item.nama_pos_anggaran)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Budget */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <PieIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {editingBudget ? 'Edit Pagu Anggaran' : 'Tetapkan Pagu Anggaran Baru'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Plafon batas pengeluaran divisi dan pos kegiatan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="p-5 space-y-4">
                {/* Divisi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Divisi Penanggung Jawab *
                  </label>
                  <select
                    value={formDivisiId}
                    onChange={e => setFormDivisiId(Number(e.target.value) as DivisionId)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                    required
                  >
                    <option value="1">Divisi 1: Direktorat</option>
                    <option value="2">Divisi 2: Finance & Akuntansi</option>
                    <option value="3">Divisi 3: Penerbitan & Editor</option>
                    <option value="4">Divisi 4: Marketing & Bazaar</option>
                    <option value="5">Divisi 5: Produksi & Cetak</option>
                    <option value="6">Divisi 6: Logistik & Distribusi</option>
                  </select>
                </div>

                {/* Nama Pos */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nama Pos Pengeluaran / Program *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cetak Ulang Buku Lamrim, Beli Perlengkapan Gudang"
                    value={formNamaPos}
                    onChange={e => setFormNamaPos(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                    required
                  />
                </div>

                {/* Grid: Tahun & Periode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Tahun Anggaran *
                    </label>
                    <input
                      type="number"
                      min={2020}
                      max={2035}
                      value={formTahun}
                      onChange={e => setFormTahun(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Periode *
                    </label>
                    <select
                      value={formPeriode}
                      onChange={e => setFormPeriode(e.target.value as BudgetPeriod)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                      required
                    >
                      {PERIOD_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kategori Beban Kas (Opsional)
                  </label>
                  <select
                    value={formKategoriId || ''}
                    onChange={e => setFormKategoriId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                  >
                    <option value="">-- Tanpa Kategori Khusus --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama_kategori} ({cat.jenis || 'Umum'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alokasi Pagu (Rupiah) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Alokasi Pagu Nominal (Rp) *
                  </label>
                  <RupiahInput
                    value={formPaguAnggaran}
                    onChange={val => setFormPaguAnggaran(val)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100 font-semibold"
                    placeholder="Masukkan nominal plafon anggaran..."
                  />
                </div>

                {/* Manual Override Realisasi (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Override Realisasi Manual (Opsional)
                  </label>
                  <RupiahInput
                    value={formRealisasiManual || 0}
                    onChange={val => setFormRealisasiManual(val > 0 ? val : undefined)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                    placeholder="Biarkan Rp 0 untuk auto-hitung dari mutasi kas..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Bila diisi Rp 0, sistem akan otomatis menjumlahkan pengeluaran riil dari buku mutasi yang cocok.
                  </span>
                </div>

                {/* Penanggung Jawab */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC pemegang anggaran pos ini..."
                    value={formPenanggungJawab}
                    onChange={e => setFormPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Keterangan / Rencana Penggunaan
                  </label>
                  <textarea
                    rows={2}
                    value={formKeterangan}
                    onChange={e => setFormKeterangan(e.target.value)}
                    placeholder="Keterangan alokasi atau persetujuan rapat..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors"
                  >
                    {editingBudget ? 'Simpan Perubahan' : 'Tetapkan Pagu Anggaran'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
