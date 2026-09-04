import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DivisionId, ActivityLog } from '../types';
import {
  Activity,
  Clock,
  User,
  Users,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  Truck,
  BookOpen,
  DollarSign,
  Package,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RecentActivityWidgetProps {
  divisionId?: DivisionId;
  title?: string;
  limit?: number;
  className?: string;
}

// Relative time formatter in Indonesian
function formatRelativeTime(dateStr: string): string {
  try {
    const logDate = new Date(dateStr.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now.getTime() - logDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return dateStr.substring(0, 16);
  } catch {
    return dateStr;
  }
}

// Avatar color generator based on member name
function getAvatarGradient(name: string): string {
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-blue-500 to-cyan-600',
    'from-teal-500 to-emerald-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-indigo-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Visual style & icon for different action types
function getActionMeta(aksi: string, model: string) {
  const lowerAksi = aksi.toLowerCase();
  const lowerModel = model.toLowerCase();

  if (lowerAksi.includes('lunas') || lowerAksi.includes('setujui') || lowerAksi.includes('selesai') || lowerAksi.includes('kirim')) {
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconClass: 'text-emerald-500',
      icon: CheckCircle2,
      label: 'Selesai / Approved'
    };
  }
  if (lowerAksi.includes('tambah') || lowerAksi.includes('buat') || lowerAksi.includes('ajukan') || lowerAksi.includes('register')) {
    return {
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      iconClass: 'text-indigo-500',
      icon: PlusCircle,
      label: 'Penambahan Data'
    };
  }
  if (lowerAksi.includes('update') || lowerAksi.includes('ubah') || lowerAksi.includes('ganti') || lowerAksi.includes('rekonsiliasi')) {
    return {
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconClass: 'text-amber-500',
      icon: Activity,
      label: 'Pembaruan'
    };
  }
  if (lowerAksi.includes('hapus') || lowerAksi.includes('tolak') || lowerAksi.includes('batal')) {
    return {
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      iconClass: 'text-rose-500',
      icon: AlertCircle,
      label: 'Hapus / Pembatalan'
    };
  }
  if (lowerModel.includes('logistic') || lowerAksi.includes('gudang') || lowerAksi.includes('packing')) {
    return {
      badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      iconClass: 'text-cyan-500',
      icon: Truck,
      label: 'Logistik & Gudang'
    };
  }
  if (lowerModel.includes('mutasi') || lowerModel.includes('account') || lowerModel.includes('penjualan')) {
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconClass: 'text-emerald-500',
      icon: DollarSign,
      label: 'Keuangan'
    };
  }
  if (lowerModel.includes('book') || lowerModel.includes('pengajuan')) {
    return {
      badgeClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      iconClass: 'text-violet-500',
      icon: BookOpen,
      label: 'Penerbitan'
    };
  }

  return {
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    iconClass: 'text-slate-500',
    icon: Activity,
    label: 'Aktivitas Umum'
  };
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  divisionId,
  title,
  limit = 5,
  className = ''
}) => {
  const {
    currentUser,
    divisiList,
    usersList,
    activityLogs,
    recordActivity
  } = useApp();

  // Active division context: from prop, or fallback to current user's division
  const activeDivisiId = divisionId || currentUser.divisi_id;
  const activeDivisi = divisiList.find(d => d.id === activeDivisiId);

  // States
  const [scopeFilter, setScopeFilter] = useState<'division' | 'all'>('division');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick Action Modal / Form
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickAction, setQuickAction] = useState('Koordinasi Tim');
  const [quickNote, setQuickNote] = useState('');

  // Team members belonging to this division
  const divisionTeamMembers = useMemo(() => {
    return usersList.filter(u => u.divisi_id === activeDivisiId);
  }, [usersList, activeDivisiId]);

  // Filter logs for this division or all
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // 1. Division filter
      if (scopeFilter === 'division') {
        const matchesDivId = log.divisi_id === activeDivisiId;
        const matchesDivName = activeDivisi && log.divisi_name?.toLowerCase() === activeDivisi.nama_divisi.toLowerCase();
        // Also match if user belonged to this division
        const matchesUserDiv = usersList.some(u => u.id === log.user_id && u.divisi_id === activeDivisiId);

        if (!matchesDivId && !matchesDivName && !matchesUserDiv) {
          return false;
        }
      }

      // 2. Member filter
      if (selectedMember !== 'all' && log.user_name !== selectedMember) {
        return false;
      }

      // 3. Action type filter
      if (selectedActionType !== 'all') {
        const lowerAksi = log.aksi.toLowerCase();
        if (selectedActionType === 'create' && !lowerAksi.includes('tambah') && !lowerAksi.includes('buat') && !lowerAksi.includes('ajukan')) {
          return false;
        }
        if (selectedActionType === 'update' && !lowerAksi.includes('update') && !lowerAksi.includes('ubah') && !lowerAksi.includes('ganti')) {
          return false;
        }
        if (selectedActionType === 'delete' && !lowerAksi.includes('hapus') && !lowerAksi.includes('batal') && !lowerAksi.includes('tolak')) {
          return false;
        }
        if (selectedActionType === 'approval' && !lowerAksi.includes('lunas') && !lowerAksi.includes('setujui') && !lowerAksi.includes('selesai')) {
          return false;
        }
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${log.keterangan} ${log.aksi} ${log.user_name} ${log.model} ${log.divisi_name}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [activityLogs, scopeFilter, activeDivisiId, activeDivisi, usersList, selectedMember, selectedActionType, searchQuery]);

  // Logs to display based on expand state
  const displayedLogs = isExpanded ? filteredLogs : filteredLogs.slice(0, limit);

  // Quick log submit handler
  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    recordActivity(
      quickAction,
      'Aktivitas Tim',
      `[${currentUser.name}]: ${quickNote.trim()}`,
      activeDivisiId
    );

    setQuickNote('');
    setIsQuickLogOpen(false);
  };

  // Recent Activity Tim is exclusively visible for Direktorat (divisi_id === 1)
  if (activeDivisiId !== 1) {
    return null;
  }

  return (
    <div
      id="recent-activity-widget"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* Header section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{title || 'Recent Activity Tim'}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                    Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aktivitas & riwayat tindakan terkini dari tim anggota divisi{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeDivisi?.nama_divisi || 'Divisi Ini'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right controls: Division Scope Toggle & Quick Log Button */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
              <button
                type="button"
                id="filter-current-division-btn"
                onClick={() => setScopeFilter('division')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  scopeFilter === 'division'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Divisi {activeDivisi?.kode || 'Ini'}
              </button>
              <button
                type="button"
                id="filter-all-division-btn"
                onClick={() => setScopeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  scopeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua ({activityLogs.length})
              </button>
            </div>

            <button
              type="button"
              id="open-quick-log-btn"
              onClick={() => setIsQuickLogOpen(prev => !prev)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
              title="Tambah Catatan Log Aktivitas Manual"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catat Aktivitas</span>
            </button>
          </div>
        </div>

        {/* Quick Log Form Drawer/Panel */}
        {isQuickLogOpen && (
          <form
            onSubmit={handleQuickLogSubmit}
            className="mt-3.5 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Tambah Catatan Aktivitas Tim ({activeDivisi?.nama_divisi})
              </span>
              <button
                type="button"
                onClick={() => setIsQuickLogOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kategori Aksi
                </label>
                <select
                  value={quickAction}
                  onChange={e => setQuickAction(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Koordinasi Tim">Koordinasi Tim</option>
                  <option value="Follow-up Operasional">Follow-up Operasional</option>
                  <option value="Pengecekan Stok & Data">Pengecekan Stok & Data</option>
                  <option value="Briefing Divisi">Briefing Divisi</option>
                  <option value="Pencatatan Khusus">Pencatatan Khusus</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Uraian Aktivitas
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder={`Misal: Menyiapkan rekap harian divisi ${activeDivisi?.kode}...`}
                    value={quickNote}
                    onChange={e => setQuickNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Filter bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-recent-activity-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas, nama anggota, aksi..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action type filter */}
          <select
            id="filter-action-type-select"
            value={selectedActionType}
            onChange={e => setSelectedActionType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
          >
            <option value="all">Semua Tipe Aksi</option>
            <option value="create">Penambahan Data</option>
            <option value="update">Pembaruan (Edit)</option>
            <option value="approval">Persetujuan / Lunas</option>
            <option value="delete">Hapus / Batal</option>
          </select>

          {/* Member filter */}
          {divisionTeamMembers.length > 0 && (
            <select
              id="filter-team-member-select"
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
            >
              <option value="all">Semua Anggota Tim</option>
              {divisionTeamMembers.map(member => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.role || 'Staff'})
                </option>
              ))}
            </select>
          )}

          {/* Reset filters if active */}
          {(searchQuery || selectedActionType !== 'all' || selectedMember !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedActionType('all');
                setSelectedMember('all');
              }}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 font-semibold"
            >
              Reset Filter
            </button>
          )}

          <div className="ml-auto text-[11px] text-slate-400 font-mono">
            {filteredLogs.length} Aktivitas
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="p-4 sm:p-5">
        {filteredLogs.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Belum Ada Aktivitas Terkini
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery || selectedActionType !== 'all' || selectedMember !== 'all'
                ? 'Tidak ada aktivitas yang cocok dengan kriteria filter saat ini.'
                : `Aktivitas yang dilakukan anggota divisi ${activeDivisi?.nama_divisi} akan otomatis tercatat dan muncul di sini secara real-time.`}
            </p>
            <button
              type="button"
              onClick={() => setIsQuickLogOpen(true)}
              className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Catatan Aktivitas Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedLogs.map((log, idx) => {
              const meta = getActionMeta(log.aksi, log.model);
              const ActionIcon = meta.icon;
              const relativeTime = formatRelativeTime(log.created_at);
              const initials = (log.user_name || 'User')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              const avatarGradient = getAvatarGradient(log.user_name || 'User');

              // Find if user has a role recorded
              const linkedUser = usersList.find(u => u.name === log.user_name || u.id === log.user_id);
              const userRole = linkedUser?.role || 'Staff Divisi';

              return (
                <div
                  key={log.id || idx}
                  className="group relative p-3 sm:p-3.5 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700/60 rounded-xl shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Left: User Avatar & Activity Details */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                        title={log.user_name}
                      >
                        {initials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        
                        {/* Member Name + Role + Action Badge */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {log.user_name}
                          </span>

                          <span className="text-[10px] text-slate-400 font-medium">
                            • {userRole}
                          </span>

                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}
                          >
                            <ActionIcon className="w-3 h-3 shrink-0" />
                            <span>{log.aksi}</span>
                          </span>

                          {log.model && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                              [{log.model}]
                            </span>
                          )}

                          {/* Show division badge if in 'all' view */}
                          {scopeFilter === 'all' && log.divisi_name && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                              {log.divisi_name}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                          {log.keterangan}
                        </p>

                      </div>
                    </div>

                    {/* Right: Timestamp */}
                    <div className="text-right shrink-0">
                      <div
                        className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-end space-x-1"
                        title={log.created_at}
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{relativeTime}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {log.created_at.substring(11, 16)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View all / Expand toggle */}
        {filteredLogs.length > limit && (
          <div className="mt-4 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="toggle-expand-activity-btn"
              onClick={() => setIsExpanded(prev => !prev)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Sembunyikan (Tampilkan {limit} Terkini)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>
                    Lihat Seluruh Aktivitas ({filteredLogs.length - limit} Lainnya)
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Widget Footer: Division Team Snapshot */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Tim Divisi {activeDivisi?.nama_divisi}:{' '}
            <strong className="text-slate-700 dark:text-slate-300">
              {divisionTeamMembers.length} Anggota Terdaftar
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Audit Terenkripsi
          </span>
          <span>Kode Divisi: <strong className="font-mono">{activeDivisi?.kode}</strong></span>
        </div>
      </div>
    </div>
  );
};
