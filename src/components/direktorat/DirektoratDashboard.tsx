import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Identitas, User, DivisionId } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { IdentitasModal } from '../modals/IdentitasModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { DirektoratCharts } from '../charts/DirektoratCharts';
import { AnnualReportModal } from '../modals/AnnualReportModal';

interface DirektoratDashboardProps {
  initialSubTab?: 'overview' | 'identitas' | 'users' | 'audit';
}

export const DirektoratDashboard: React.FC<DirektoratDashboardProps> = ({ initialSubTab }) => {
  const {
    identitasList,
    deleteIdentitas,
    bulkDeleteIdentitas,
    usersList,
    addUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    currentUser,
    divisiList,
    mutasis,
    orders,
    books,
    pengajuans,
    activityLogs
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'identitas' | 'users' | 'audit'>(
    initialSubTab || 'overview'
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchIdentitas, setSearchIdentitas] = useState('');
  const [filterUmat, setFilterUmat] = useState<string>('all');
  const [filterKeamanan, setFilterKeamanan] = useState<string>('all');
  const [selectedIdentitasIds, setSelectedIdentitasIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Audit log search & division filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterDivisi, setAuditFilterDivisi] = useState<string>('all');

  const filteredActivityLogs = activityLogs.filter(log => {
    const matchesSearch =
      auditSearch.trim() === '' ||
      (log.user_name || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.aksi || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.model || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.keterangan || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.divisi_name || '').toLowerCase().includes(auditSearch.toLowerCase());

    const matchesDivisi =
      auditFilterDivisi === 'all' ||
      String(log.divisi_id) === auditFilterDivisi;

    return matchesSearch && matchesDivisi;
  });
  
  const [modalIdentitasOpen, setModalIdentitasOpen] = useState(false);
  const [editingIdentitas, setEditingIdentitas] = useState<Identitas | null>(null);
  const [viewOnlyIdentitas, setViewOnlyIdentitas] = useState(false);
  const [annualReportOpen, setAnnualReportOpen] = useState(false);

  // In-app Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Action Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    divisi_id: 1 as DivisionId,
    role: 'Staff',
    password: '',
    phone: ''
  });

  // Calculation for overview
  const totalKasMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((sum, m) => sum + m.nominal, 0);
  const totalKasKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((sum, m) => sum + m.nominal, 0);
  const saldoKasBersih = totalKasMasuk - totalKasKeluar;
  const totalInvoiceLunas = orders.filter(o => o.status === 'Lunas').length;
  const totalBukuStok = books.reduce((sum, b) => sum + b.stok_gudang, 0);

  // Filtered identitas
  const filteredIdentitas = identitasList.filter(item => {
    const matchSearch = item.nama_lengkap.toLowerCase().includes(searchIdentitas.toLowerCase()) ||
      item.nomor_identitas.includes(searchIdentitas) ||
      (item.kota && item.kota.toLowerCase().includes(searchIdentitas.toLowerCase())) ||
      (item.nomor_hp_primary && item.nomor_hp_primary.includes(searchIdentitas));
    
    const matchUmat = filterUmat === 'all' || item.jenis_umat === filterUmat;
    const matchKeamanan = filterKeamanan === 'all' || item.status_keamanan === filterKeamanan;

    return matchSearch && matchUmat && matchKeamanan;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIdentitasIds(filteredIdentitas.map(i => i.id));
    } else {
      setSelectedIdentitasIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIdentitasIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteIdentitas = (item: Identitas) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Anggota',
      message: `Yakin ingin menghapus data anggota "${item.nama_lengkap}" (${item.jenis_identitas}: ${item.nomor_identitas})? Data profil ini akan dihapus dari sistem master database.`,
      confirmText: 'Ya, Hapus Data',
      variant: 'danger',
      onConfirm: () => {
        deleteIdentitas(item.id);
        showToast(`Data anggota "${item.nama_lengkap}" berhasil dihapus.`);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIdentitasIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Massal Data Anggota',
      message: `Yakin ingin menghapus ${selectedIdentitasIds.length} data anggota terpilih secara permanen? Data yang telah dihapus tidak dapat dikembalikan.`,
      confirmText: `Hapus ${selectedIdentitasIds.length} Anggota`,
      variant: 'danger',
      onConfirm: () => {
        bulkDeleteIdentitas(selectedIdentitasIds);
        showToast(`${selectedIdentitasIds.length} data anggota berhasil dihapus secara massal.`);
        setSelectedIdentitasIds([]);
      }
    });
  };

  const selectableUserIds = usersList.filter(u => u.id !== currentUser.id && u.id !== 1).map(u => u.id);

  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(selectableUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: number) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteUser = (usr: User) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      message: `Yakin ingin menghapus akun "${usr.name}" (${usr.email})? Pengguna ini tidak akan dapat login lagi ke sistem.`,
      confirmText: 'Ya, Hapus User',
      variant: 'danger',
      onConfirm: () => {
        deleteUser(usr.id);
        showToast(`Akun pengguna "${usr.name}" berhasil dihapus.`);
      }
    });
  };

  const handleBulkDeleteUsers = () => {
    if (selectedUserIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Massal Akun Pengguna',
      message: `Yakin ingin menghapus ${selectedUserIds.length} akun pengguna yang dipilih?`,
      confirmText: `Hapus ${selectedUserIds.length} User`,
      variant: 'danger',
      onConfirm: () => {
        bulkDeleteUsers(selectedUserIds);
        showToast(`${selectedUserIds.length} akun pengguna berhasil dihapus.`);
        setSelectedUserIds([]);
      }
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    if (editingUser) {
      updateUser(
        editingUser.id,
        userForm.name,
        userForm.email,
        userForm.divisi_id,
        userForm.role,
        userForm.password || undefined,
        userForm.phone || undefined
      );
    } else {
      addUser(
        userForm.name,
        userForm.email,
        userForm.divisi_id,
        userForm.role || 'Staff',
        userForm.password || 'password123',
        userForm.phone
      );
    }
    setUserModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSubTab('identitas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'identitas'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Database Anggota ({identitasList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manajemen Tim ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit System Log</span>
          </button>
        </div>

        {activeSubTab === 'overview' && (
          <button
            onClick={() => setAnnualReportOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Laporan Tahunan (Annual Report)</span>
          </button>
        )}

        {activeSubTab === 'identitas' && (
          <button
            onClick={() => {
              setEditingIdentitas(null);
              setViewOnlyIdentitas(false);
              setModalIdentitasOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota Baru</span>
          </button>
        )}

        {activeSubTab === 'users' && (
          <button
            onClick={() => {
              setEditingUser(null);
              setUserForm({
                name: '',
                email: '',
                divisi_id: 1,
                role: 'Staff',
                password: 'password123',
                phone: ''
              });
              setUserModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User Sistem</span>
          </button>
        )}
      </div>

      {/* OVERVIEW SUB TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saldo Bersih Kas</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Rp {saldoKasBersih.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">+{totalKasMasuk.toLocaleString('id-ID')}</span>
                <span>/</span>
                <span className="text-rose-500">-{totalKasKeluar.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Anggota</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {identitasList.length} <span className="text-xs font-normal text-slate-500">Jiwa</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {identitasList.filter(i => i.is_dharma_patriot).length} Dharma Patriot / Donatur
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice Lunas</span>
                <div className="p-2 bg-cyan-500/10 text-cyan-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalInvoiceLunas} <span className="text-xs font-normal text-slate-500">/ {orders.length} Invoice</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {orders.filter(o => o.status === 'Pending').length} menunggu pelunasan
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Stok Gudang</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                {totalBukuStok} <span className="text-xs font-normal text-slate-500">Eksemplar</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Dari {books.length} judul buku aktif
              </p>
            </div>
          </div>

          {/* Annual Report Quick Access Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300/70 dark:border-amber-700/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Laporan Pertanggungjawaban Tahunan Yayasan (Annual Report)
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                    Resmi & Tervalidasi
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Konsolidasi data kinerja keuangan berimbang, produksi naskah, logistik penyaluran, dan keanggotaan umat untuk Dewan Pembina.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAnnualReportOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Laporan Tahunan</span>
            </button>
          </div>

          {/* Performance & Financial Metrics Visualizations */}
          <DirektoratCharts
            mutasis={mutasis}
            identitasList={identitasList}
            orders={orders}
            books={books}
            pengajuans={pengajuans}
          />

          {/* Quick Division Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Struktur Penanggung Jawab Divisi */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Struktur Penanggung Jawab Divisi
                </h3>
                <button
                  onClick={() => setActiveSubTab('users')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Kelola Akses
                </button>
              </div>

              <div className="space-y-2.5">
                {usersList.slice(0, 5).map((u) => {
                  const div = divisiList.find(d => d.id === u.divisi_id);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {div?.kode || 'DIR'} • {u.role || 'Staff'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Distribusi Keanggotaan & Keamanan
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400">Anggota Terdaftar Biasa:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{identitasList.filter(i => i.jenis_umat === 'Anggota').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400">Sangha / Rohaniwan:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{identitasList.filter(i => i.jenis_umat === 'Sangha').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400">Status Keamanan VIP:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{identitasList.filter(i => i.status_keamanan === 'VIP').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400">Agen Buku Purna:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{identitasList.filter(i => i.is_agen_purna).length}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveSubTab('identitas')}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-semibold"
                >
                  Buka Master Database Anggota →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* IDENTITAS / ANGGOTA SUB TAB */}
      {activeSubTab === 'identitas' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama lengkap, NIK, kota, nomor WA..."
                  value={searchIdentitas}
                  onChange={e => setSearchIdentitas(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterUmat}
                  onChange={e => setFilterUmat(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="all">Semua Kategori Umat</option>
                  <option value="Anggota">Anggota</option>
                  <option value="Simpatisan">Simpatisan</option>
                  <option value="Pengurus">Pengurus</option>
                  <option value="Sangha">Sangha</option>
                </select>

                <select
                  value={filterKeamanan}
                  onChange={e => setFilterKeamanan(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="all">Semua Status Keamanan</option>
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                  <option value="Pengawasan">Pengawasan</option>
                </select>

                {selectedIdentitasIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus ({selectedIdentitasIds.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIdentitasIds.length === filteredIdentitas.length && filteredIdentitas.length > 0}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="p-3.5">Nama Lengkap & NIK</th>
                    <th className="p-3.5">Kontak / Kota</th>
                    <th className="p-3.5">Kategori / Status</th>
                    <th className="p-3.5">Badge Khusus</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredIdentitas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIdentitasIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.jenis_identitas}: {item.nomor_identitas}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200">{item.nomor_hp_primary || '-'}</div>
                        <div className="text-[11px] text-slate-500">{item.kota || item.alamat || 'Indonesia'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {item.jenis_umat || 'Anggota'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status_keamanan === 'VIP' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {item.status_keamanan}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {Boolean(item.is_dharma_patriot) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              Dharma Patriot
                            </span>
                          )}
                          {Boolean(item.is_agen_purna) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Agen Purna
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingIdentitas(item);
                              setViewOnlyIdentitas(true);
                              setModalIdentitasOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Lihat Detail Profil Anggota"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span className="hidden sm:inline">Detail</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingIdentitas(item);
                              setViewOnlyIdentitas(false);
                              setModalIdentitasOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Edit Data Profil Anggota"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteIdentitas(item)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Hapus Anggota dari Database"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MANAJEMEN USER SUB TAB */}
      {activeSubTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Pengguna Sistem & Hak Akses Divisi</h3>
              <p className="text-xs text-slate-500">Kelola akun staf, direktur, dan delegasi akses divisi MIS.</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedUserIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteUsers}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedUserIds.length})</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({
                    name: '',
                    email: '',
                    divisi_id: 1,
                    role: 'Staff',
                    password: 'password123',
                    phone: ''
                  });
                  setUserModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah User Baru</span>
              </button>
            </div>
          </div>

          {selectableUserIds.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  onChange={handleSelectAllUsers}
                  checked={selectedUserIds.length === selectableUserIds.length && selectableUserIds.length > 0}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Pilih Semua Akun Staf (dapat dihapus massal)</span>
              </label>
              <span className="text-slate-500 text-[11px]">
                {selectedUserIds.length} dari {selectableUserIds.length} dipilih
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersList.map((usr) => {
              const isSuperAdmin = usr.id === 1;
              const isCurrent = usr.id === currentUser.id;
              const canDelete = !isSuperAdmin && !isCurrent;

              return (
                <div
                  key={usr.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    selectedUserIds.includes(usr.id)
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {canDelete && (
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(usr.id)}
                          onChange={() => handleToggleSelectUser(usr.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{usr.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {divisiList.find(d => d.id === usr.divisi_id)?.nama_divisi || 'Divisi'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{usr.email}</p>
                  {usr.phone && <p className="text-[11px] text-slate-400">WA: {usr.phone}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Role: {usr.role || 'Staff'} {isCurrent ? '(Anda)' : ''}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(usr);
                          setUserForm({
                            name: usr.name,
                            email: usr.email,
                            divisi_id: usr.divisi_id,
                            role: usr.role || 'Staff',
                            password: usr.password || '',
                            phone: usr.phone || ''
                          });
                          setUserModalOpen(true);
                        }}
                        className="text-amber-600 hover:underline font-semibold text-[11px]"
                      >
                        Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteUser(usr)}
                          className="text-rose-600 hover:underline font-semibold text-[11px]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AUDIT LOG SUB TAB */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Audit Trail & Log Aktivitas Sistem MIS
              </h3>
              <p className="text-xs text-slate-500">Mencatat seluruh aksi transaksi, perubahan status, pelunasan kas, dan persetujuan secara real-time.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                {filteredActivityLogs.length} dari {activityLogs.length} Log
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Cari user, aksi, modul, keterangan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={auditFilterDivisi}
                onChange={e => setAuditFilterDivisi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="all">Semua Divisi</option>
                {divisiList.map(d => (
                  <option key={d.id} value={String(d.id)}>{d.nama_divisi}</option>
                ))}
              </select>
              {(auditSearch || auditFilterDivisi !== 'all') && (
                <button
                  onClick={() => {
                    setAuditSearch('');
                    setAuditFilterDivisi('all');
                  }}
                  className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl whitespace-nowrap font-medium transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">User & Divisi</th>
                  <th className="p-3">Aksi & Modul</th>
                  <th className="p-3">Keterangan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredActivityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Tidak ada catatan aktivitas sistem yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredActivityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">{log.created_at}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.user_name}</div>
                        <div className="text-[10px] text-slate-400">{log.divisi_name}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold text-[10px]">
                          {log.aksi}
                        </span>
                        <span className="ml-1 text-[10px] text-slate-400 font-mono">[{log.model}]</span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{log.keterangan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Modal */}
      <IdentitasModal
        isOpen={modalIdentitasOpen}
        onClose={() => setModalIdentitasOpen(false)}
        identitas={editingIdentitas}
        readOnly={viewOnlyIdentitas}
        onDeleteRequested={handleDeleteIdentitas}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-4 duration-200 border border-slate-700 dark:border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {userModalOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setUserModalOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'Edit User Sistem' : 'Tambah User Sistem'}
              </h3>
              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="nama@lamrimnesia.org"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jabatan / Role</label>
                    <input
                      type="text"
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      placeholder="Staff / Koordinator"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">No. HP / WhatsApp</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="08123456789"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Password {editingUser && '(Kosongkan bila tak diubah)'}
                    </label>
                    <input
                      type="text"
                      value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'password123'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Divisi Penugasan</label>
                  <select
                    value={userForm.divisi_id}
                    onChange={e => setUserForm({ ...userForm, divisi_id: parseInt(e.target.value) as DivisionId })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {divisiList.map(d => (
                      <option key={d.id} value={d.id}>{d.nama_divisi} ({d.kode})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Simpan User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Annual Executive Report Modal */}
      <AnnualReportModal
        isOpen={annualReportOpen}
        onClose={() => setAnnualReportOpen(false)}
      />

    </div>
  );
};
