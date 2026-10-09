import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  getStoredCalendarEvents,
  getDeadlineInfo,
  getTaskCompletionProgress,
  updateStoredCalendarEventStatus,
  toggleStoredCalendarSubtask
} from './DivisionCalendarTodoView';
import {
  Search,
  X,
  Calendar,
  FileText,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Layers,
  SlidersHorizontal,
  ListTodo,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List
} from 'lucide-react';

export type SearchResultType = 'task' | 'document' | 'entry';

export interface DivisionSearchResultItem {
  id: string;
  type: SearchResultType;
  typeLabel: string;
  divisionId: DivisionId;
  divisionCode: string;
  title: string;
  subtitle: string;
  metaBadge: string;
  statusBadge?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  progressPct?: number;
  progressBarColor?: string;
  progressBadgeClass?: string;
  targetSubTab: string;
  targetSubTabLabel: string;
  filterKeyword: string;
}

interface DivisionQuickSearchBarProps {
  divisionId: DivisionId;
  value?: string;
  onQueryChange?: (q: string) => void;
  placeholder?: string;
}

const DIVISION_SEARCH_META: Record<
  DivisionId,
  {
    name: string;
    code: string;
    placeholder: string;
    quickChips: string[];
    accentBorder: string;
    accentBadge: string;
  }
> = {
  1: {
    name: 'Direktorat & Sekretariat',
    code: 'DIR',
    placeholder:
      'Cari tugas kalender, nama anggota, jabatan, staf pengurus, atau dokumen pengajuan (Real-time)...',
    quickChips: ['Budi Santoso', 'Rapat Pleno', 'Pengurus', 'Dharma Patriot', 'Audit'],
    accentBorder: 'focus-within:border-indigo-500 focus-within:ring-indigo-500/20',
    accentBadge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
  },
  2: {
    name: 'Bendahara & Finance',
    code: 'FIN',
    placeholder:
      'Cari jurnal mutasi kas, nama rekening bank, dokumen SPK, atau tugas kalender Finance...',
    quickChips: ['Rekonsiliasi', 'BCA', 'Donasi', 'Royalti', 'ISAK 35'],
    accentBorder: 'focus-within:border-emerald-500 focus-within:ring-emerald-500/20',
    accentBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
  },
  3: {
    name: 'Penerbitan & Redaksi',
    code: 'PUB',
    placeholder:
      'Cari judul buku, nomor ISBN, nama penulis, berkas pengajuan cetak, proyek Fashili, atau tugas...',
    quickChips: ['Lamrim', 'ISBN', 'Fashili', 'Rina Wijaya', 'Royalti'],
    accentBorder: 'focus-within:border-violet-500 focus-within:ring-violet-500/20',
    accentBadge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300'
  },
  4: {
    name: 'Marketing & Distribusi',
    code: 'MKT',
    placeholder:
      'Cari nomor invoice (#INV), nama pembeli, kupon promo, event bazaar, pre-order, atau tugas...',
    quickChips: ['INV-', 'Lunas', 'Bazaar', 'Waisak', 'Promo'],
    accentBorder: 'focus-within:border-amber-500 focus-within:ring-amber-500/20',
    accentBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
  },
  5: {
    name: 'Produksi & Percetakan',
    code: 'PRD',
    placeholder:
      'Cari log hasil cetak, surat perintah kerja (SPK), judul buku dicetak, QC, atau tugas produksi...',
    quickChips: ['Lamrim', 'Naik Cetak', 'Quality Control', 'Hendra Kusuma', 'Approved'],
    accentBorder: 'focus-within:border-orange-500 focus-within:ring-orange-500/20',
    accentBadge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300'
  },
  6: {
    name: 'Logistik & Gudang',
    code: 'LOG',
    placeholder:
      'Cari antrean packing invoice, surat jalan, log pengeluaran gudang, stok buku, atau tugas logistik...',
    quickChips: ['Surat Jalan', 'JNE', 'Stock Opname', 'Agus Pratama', 'Gudang'],
    accentBorder: 'focus-within:border-cyan-500 focus-within:ring-cyan-500/20',
    accentBadge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300'
  }
};

export const DivisionQuickSearchBar: React.FC<DivisionQuickSearchBarProps> = ({
  divisionId,
  value,
  onQueryChange,
  placeholder
}) => {
  const {
    identitasList,
    usersList,
    books,
    orders,
    mutasis,
    accounts,
    pengajuans,
    promos,
    bazaarEvents,
    preOrderCampaigns,
    donasiProyeks,
    royaltiPenulisList,
    productionLogs,
    logisticLogs,
    currentSubTab,
    switchDivision,
    setCurrentSubTab
  } = useApp();

  const [internalQuery, setInternalQuery] = useState(value || '');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SearchResultType>('all');
  const [scopeMode, setScopeMode] = useState<'division' | 'global'>('division');
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [isTaskProgressOpen, setIsTaskProgressOpen] = useState(true);
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'active' | 'done'>('all');
  const [dashboardViewMode, setDashboardViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('mis_dashboard_view_mode');
      return saved === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });
  const handleToggleDashboardViewMode = (nextMode: 'grid' | 'list') => {
    setDashboardViewMode(nextMode);
    try {
      localStorage.setItem('mis_dashboard_view_mode', nextMode);
    } catch {
      // ignore
    }
  };
  const [calendarVersion, setCalendarVersion] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external controlled value if passed
  useEffect(() => {
    if (value !== undefined && value !== internalQuery) {
      setInternalQuery(value);
    }
  }, [value]);

  // Listen to calendar updates
  useEffect(() => {
    const handleCal = () => setCalendarVersion(v => v + 1);
    window.addEventListener('mis-calendar-events-updated', handleCal);
    return () => window.removeEventListener('mis-calendar-events-updated', handleCal);
  }, []);

  // Keyboard shortcut Ctrl+F to focus inline division search bar, and listen to Command Palette (Ctrl+K) filter navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && e.shiftKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const handleGlobalSearchNavigate = (e: Event) => {
      const customEvt = e as CustomEvent<{
        divisionId: DivisionId;
        subTab: string;
        keyword: string;
      }>;
      if (customEvt.detail?.keyword) {
        setInternalQuery(customEvt.detail.keyword);
        if (onQueryChange) {
          onQueryChange(customEvt.detail.keyword);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mis-global-search-navigate', handleGlobalSearchNavigate);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mis-global-search-navigate', handleGlobalSearchNavigate);
    };
  }, [onQueryChange]);

  const handleInputChange = (nextVal: string) => {
    setInternalQuery(nextVal);
    setIsResultsExpanded(true);
    if (onQueryChange) {
      onQueryChange(nextVal);
    }
  };

  const handleClear = () => {
    setInternalQuery('');
    if (onQueryChange) {
      onQueryChange('');
    }
    inputRef.current?.focus();
  };

  const meta = DIVISION_SEARCH_META[divisionId] || DIVISION_SEARCH_META[1];
  const fmtNum = (n?: number | null) => Number(n ?? 0).toLocaleString('id-ID');

  // Build unified index of Tasks, Documents, and Data Entries
  const allIndexedItems = useMemo<DivisionSearchResultItem[]>(() => {
    const list: DivisionSearchResultItem[] = [];

    // 1. CALENDAR TASKS & TO-DO LISTS (Across all 6 directorates)
    const calEvents = getStoredCalendarEvents();
    calEvents.forEach(ev => {
      const evDiv = (ev.divisionId || ev.picDivisionId || 1) as DivisionId;
      const divCode = DIVISION_SEARCH_META[evDiv]?.code || 'DIR';
      const dl = getDeadlineInfo(ev.date, ev.status);
      const prog = getTaskCompletionProgress(ev);
      const subtaskSummary =
        ev.subtasks.length > 0
          ? `${prog.doneSubtasks}/${prog.totalSubtasks} Sub-tugas (${prog.percent}%) • ${ev.subtasks
              .map(s => s.title)
              .join(', ')}`
          : `${prog.statusLabel} • ${ev.description}`;

      list.push({
        id: `task-${ev.id}`,
        type: 'task',
        typeLabel: 'Tugas & Kalender',
        divisionId: evDiv,
        divisionCode: divCode,
        title: ev.title,
        subtitle: `PIC: ${ev.picName}${
          ev.coPicNames?.length ? ` (+${ev.coPicNames.join(', ')})` : ''
        } • ${subtaskSummary}`,
        metaBadge: `${ev.date} • ${ev.category}`,
        statusBadge: `${ev.status} (${dl.label})`,
        statusVariant:
          ev.status === 'Selesai'
            ? 'success'
            : dl.state === 'overdue'
            ? 'danger'
            : dl.state === 'today' || dl.state === 'approaching'
            ? 'warning'
            : 'info',
        progressPct: prog.percent,
        progressBarColor: prog.barColor,
        progressBadgeClass: prog.badgeClass,
        targetSubTab: 'kalender',
        targetSubTabLabel: 'Kalender & To-Do',
        filterKeyword: ev.title
      });
    });

    // 2. DIREKTORAT (Division 1): Anggota & Staf
    identitasList.forEach(id => {
      list.push({
        id: `dir-id-${id.id}`,
        type: 'entry',
        typeLabel: 'Entry Anggota',
        divisionId: 1,
        divisionCode: 'DIR',
        title: `${id.nama_lengkap} (${id.jabatan || id.jenis_umat || 'Anggota'})`,
        subtitle: `${id.kota || '-'} • Telp: ${id.nomor_hp_primary || '-'} • ID: ${id.nomor_identitas || '-'}`,
        metaBadge: id.jenis_umat || 'Anggota',
        statusBadge: id.status_keamanan || 'Normal',
        statusVariant: id.status_keamanan === 'VIP' ? 'success' : id.status_keamanan === 'Pengawasan' ? 'warning' : 'info',
        targetSubTab: 'identitas',
        targetSubTabLabel: 'Database Anggota',
        filterKeyword: id.nama_lengkap
      });
    });

    usersList.forEach(u => {
      list.push({
        id: `dir-usr-${u.id}`,
        type: 'entry',
        typeLabel: 'Staf Pengurus',
        divisionId: 1,
        divisionCode: 'DIR',
        title: `${u.name} — ${u.role || 'Staff'}`,
        subtitle: `Email: ${u.email} • Telepon: ${u.phone || '-'}`,
        metaBadge: `Divisi ID #${u.divisi_id}`,
        statusBadge: 'Aktif',
        statusVariant: 'info',
        targetSubTab: 'users',
        targetSubTabLabel: 'Manajemen Staf',
        filterKeyword: u.name
      });
    });

    // 3. FINANCE (Division 2): Jurnal Mutasi, Rekening, Persetujuan Cetak
    mutasis.forEach(m => {
      list.push({
        id: `fin-mut-${m.id}`,
        type: 'entry',
        typeLabel: 'Jurnal Mutasi Kas',
        divisionId: 2,
        divisionCode: 'FIN',
        title: m.keterangan,
        subtitle: `Kategori: ${m.category?.nama_kategori || 'Umum'} • Tanggal: ${m.tanggal}`,
        metaBadge: `Rp ${fmtNum(m.nominal)}`,
        statusBadge: `Kas ${m.tipe}`,
        statusVariant: m.tipe === 'Masuk' ? 'success' : 'danger',
        targetSubTab: 'mutasi',
        targetSubTabLabel: 'Jurnal Mutasi',
        filterKeyword: m.keterangan
      });
    });

    accounts.forEach(acc => {
      list.push({
        id: `fin-acc-${acc.id}`,
        type: 'document',
        typeLabel: 'Rekening & Kas',
        divisionId: 2,
        divisionCode: 'FIN',
        title: acc.nama_akun,
        subtitle: `Kode Rekening: ${acc.kode_akun || '-'} • Master Kas & Bank Operasional Yayasan`,
        metaBadge: `Saldo Awal: Rp ${fmtNum(acc.saldo_awal)}`,
        statusBadge: 'Rekening Aktif',
        statusVariant: 'success',
        targetSubTab: 'akun',
        targetSubTabLabel: 'Master Rekening',
        filterKeyword: acc.nama_akun
      });
    });

    // 4. PENERBITAN (Division 3): Katalog Buku, Dokumen Pengajuan Cetak, Fashili, Royalti
    books.forEach(b => {
      list.push({
        id: `pub-book-${b.id}`,
        type: 'entry',
        typeLabel: 'Katalog Buku & ISBN',
        divisionId: 3,
        divisionCode: 'PUB',
        title: b.judul,
        subtitle: `Penulis: ${b.penulis} • ISBN: ${b.isbn || 'Belum Terdaftar'} • Kategori: ${b.kategori || 'Umum'}`,
        metaBadge: `Harga: Rp ${fmtNum(b.harga_jual)}`,
        statusBadge: `Stok: ${b.stok_gudang ?? 0} Eks`,
        statusVariant: (b.stok_gudang ?? 0) <= 20 ? 'danger' : 'success',
        targetSubTab: 'katalog',
        targetSubTabLabel: 'Katalog & ISBN',
        filterKeyword: b.judul
      });
    });

    pengajuans.forEach(p => {
      const bookObj = p.buku || books.find(b => b.id === p.buku_id);
      const bookTitle = bookObj?.judul || `Buku #${p.buku_id}`;
      const qtyCetak = p.jumlah_pengajuan || 0;
      const estBiaya = qtyCetak * (bookObj?.biaya_pokok || 25000);

      list.push({
        id: `doc-pengajuan-pub-${p.id}`,
        type: 'document',
        typeLabel: 'Dokumen Pengajuan Cetak',
        divisionId: 3,
        divisionCode: 'PUB',
        title: `Berkas Pengajuan Cetak: ${bookTitle}`,
        subtitle: `Kuantitas: ${qtyCetak} Eks • Est. Biaya: Rp ${fmtNum(estBiaya)} • Tgl: ${p.created_at}`,
        metaBadge: `SPK #${p.id}`,
        statusBadge: (p.status || 'pending').toUpperCase(),
        statusVariant: p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning',
        targetSubTab: 'pengajuan',
        targetSubTabLabel: 'Pengajuan Cetak',
        filterKeyword: bookTitle
      });

      list.push({
        id: `doc-pengajuan-fin-${p.id}`,
        type: 'document',
        typeLabel: 'Dokumen Anggaran Cetak',
        divisionId: 2,
        divisionCode: 'FIN',
        title: `Verifikasi Anggaran Cetak: ${bookTitle}`,
        subtitle: `Tagihan Cetak: Rp ${fmtNum(estBiaya)} (${qtyCetak} Eks) • Tgl: ${p.created_at}`,
        metaBadge: `Berkas #${p.id}`,
        statusBadge: (p.status || 'pending').toUpperCase(),
        statusVariant: p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning',
        targetSubTab: 'persetujuan',
        targetSubTabLabel: 'Persetujuan Cetak',
        filterKeyword: bookTitle
      });
    });

    donasiProyeks.forEach(dp => {
      list.push({
        id: `pub-fashili-${dp.id}`,
        type: 'document',
        typeLabel: 'Dokumen Proyek Fashili',
        divisionId: 3,
        divisionCode: 'PUB',
        title: `Fashili Cetak: ${dp.nama_buku || dp.judul_proyek}`,
        subtitle: `Target: ${dp.target_eksemplar} Eks (Rp ${fmtNum(dp.target_dana)}) • Terkumpul: Rp ${fmtNum(dp.dana_terkumpul)}`,
        metaBadge: `Target: ${dp.target_selesai}`,
        statusBadge: dp.status,
        statusVariant: dp.status === 'Target Tercapai' || dp.status === 'Selesai & Didistribusikan' ? 'success' : 'info',
        targetSubTab: 'donasi_cetak',
        targetSubTabLabel: 'Fashili & Donasi',
        filterKeyword: dp.nama_buku || dp.judul_proyek
      });
    });

    royaltiPenulisList.forEach(rp => {
      list.push({
        id: `pub-royalti-${rp.id}`,
        type: 'document',
        typeLabel: 'Kontrak Royalti & Lisensi',
        divisionId: 3,
        divisionCode: 'PUB',
        title: `${rp.nama_penerima} (${rp.peran})`,
        subtitle: `Lisensi: ${rp.lisensi_nama || 'Internal'} • Bank: ${rp.rekening_bank || '-'}`,
        metaBadge:
          rp.tipe_royalti === 'persentase'
            ? `Royalti ${rp.nilai_royalti}%`
            : `Rp ${fmtNum(rp.nilai_royalti)}/buku`,
        statusBadge: rp.status_lisensi,
        statusVariant: rp.status_lisensi === 'Aktif' ? 'success' : 'warning',
        targetSubTab: 'royalti',
        targetSubTabLabel: 'Royalti & Lisensi',
        filterKeyword: rp.nama_penerima
      });
    });

    // 5. MARKETING (Division 4): Invoice Dokumen, Promo, Bazaar, PreOrder
    orders.forEach(o => {
      list.push({
        id: `mkt-inv-${o.id}`,
        type: 'document',
        typeLabel: 'Dokumen Invoice Pesanan',
        divisionId: 4,
        divisionCode: 'MKT',
        title: `Invoice ${o.no_invoice} — ${o.nama_pembeli}`,
        subtitle: `Saluran: ${o.via} • Ekspedisi: ${o.ekspedisi} • Tanggal: ${o.tanggal_pesan} • Penerima: ${o.nama_penerima || o.nama_pembeli}`,
        metaBadge: `Rp ${fmtNum(o.total_tagihan)}`,
        statusBadge: o.status,
        statusVariant: o.status === 'Lunas' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'warning',
        targetSubTab: 'invoices',
        targetSubTabLabel: 'Daftar Invoice',
        filterKeyword: o.no_invoice
      });
    });

    promos.forEach(pr => {
      const rewardStr =
        pr.type === 'percentage'
          ? `Diskon ${pr.reward_value}%`
          : `Potongan Rp ${fmtNum(pr.reward_value)}`;
      list.push({
        id: `mkt-promo-${pr.id}`,
        type: 'entry',
        typeLabel: 'Kupon Promo',
        divisionId: 4,
        divisionCode: 'MKT',
        title: `Kode Promo: ${pr.code}`,
        subtitle: `${pr.nama_promo || 'Promo Buku'} • ${rewardStr} • Terpakai: ${pr.used_count || 0}/${pr.max_uses || 100}`,
        metaBadge: rewardStr,
        statusBadge: 'Promo Aktif',
        statusVariant: 'info',
        targetSubTab: 'promos',
        targetSubTabLabel: 'Kupon Promo',
        filterKeyword: pr.code
      });
    });

    bazaarEvents.forEach(bz => {
      list.push({
        id: `mkt-bazaar-${bz.id}`,
        type: 'document',
        typeLabel: 'Dokumen Event Bazaar',
        divisionId: 4,
        divisionCode: 'MKT',
        title: bz.nama_event,
        subtitle: `Lokasi: ${bz.lokasi} • PIC: ${bz.penanggung_jawab || bz.pic_nama || '-'} • Tgl: ${bz.tanggal_mulai} s/d ${bz.tanggal_selesai}`,
        metaBadge: `${bz.total_buku_dibawa || bz.items?.length || 0} Buku`,
        statusBadge: bz.status,
        statusVariant: bz.status === 'Selesai Rekonsiliasi' ? 'success' : 'warning',
        targetSubTab: 'bazaar',
        targetSubTabLabel: 'Event & Bazaar',
        filterKeyword: bz.nama_event
      });
    });

    preOrderCampaigns.forEach(po => {
      const poBook = books.find(b => b.id === po.buku_id);
      list.push({
        id: `mkt-po-${po.id}`,
        type: 'document',
        typeLabel: 'Kampanye Pre-Order',
        divisionId: 4,
        divisionCode: 'MKT',
        title: `${po.kode_campaign}: ${po.judul_campaign}`,
        subtitle: `Buku: ${poBook?.judul || po.judul_campaign} • Harga PO: Rp ${fmtNum(po.harga_po)} • Kuota: ${po.tercapai_kuota || 0}/${po.target_kuota || 0} Eks`,
        metaBadge: `Est. Kirim: ${po.estimasi_pengiriman}`,
        statusBadge: po.status,
        statusVariant: po.status === 'Tercapai' || po.status === 'Selesai' ? 'success' : 'info',
        targetSubTab: 'preorder',
        targetSubTabLabel: 'Pre-Order & Bundling',
        filterKeyword: po.judul_campaign
      });
    });

    // 6. PRODUKSI (Division 5): Production Logs & Stock
    productionLogs.forEach(pl => {
      const bTitle = pl.book?.judul || books.find(b => b.id === pl.buku_id)?.judul || `Buku #${pl.buku_id}`;
      list.push({
        id: `prd-log-${pl.id}`,
        type: 'entry',
        typeLabel: 'Log Hasil Produksi',
        divisionId: 5,
        divisionCode: 'PRD',
        title: `Batch Cetak Selesai: ${bTitle}`,
        subtitle: `Tanggal Produksi: ${pl.tanggal_produksi} • Kuantitas Masuk Gudang: +${pl.qty_produksi} Eksemplar`,
        metaBadge: `+${pl.qty_produksi} Eks`,
        statusBadge: 'Masuk Gudang',
        statusVariant: 'success',
        targetSubTab: 'logs',
        targetSubTabLabel: 'Riwayat Log Produksi',
        filterKeyword: bTitle
      });
    });

    // 7. LOGISTIK (Division 6): Surat Jalan / Antrean Packing & Logistic Logs
    orders
      .filter(o => o.status === 'Lunas')
      .forEach(o => {
        list.push({
          id: `log-sj-${o.id}`,
          type: 'document',
          typeLabel: 'Surat Jalan & Antrean Packing',
          divisionId: 6,
          divisionCode: 'LOG',
          title: `Surat Jalan ${o.no_invoice} — ${o.nama_penerima || o.nama_pembeli}`,
          subtitle: `Tujuan: ${o.alamat_penerima || '-'} • Ekspedisi: ${o.ekspedisi}`,
          metaBadge: `${o.items?.reduce((s, i) => s + i.jumlah, 0) || 1} Buku`,
          statusBadge: 'Siap Kirim',
          statusVariant: 'warning',
          targetSubTab: 'antrean',
          targetSubTabLabel: 'Antrean Packing',
          filterKeyword: o.no_invoice
        });
      });

    logisticLogs.forEach(ll => {
      const bTitle = ll.book?.judul || books.find(b => b.id === ll.buku_id)?.judul || `Buku #${ll.buku_id}`;
      list.push({
        id: `log-out-${ll.id}`,
        type: 'entry',
        typeLabel: 'Log Distribusi Gudang',
        divisionId: 6,
        divisionCode: 'LOG',
        title: `Pengeluaran ${ll.qty_keluar} Eks: ${bTitle}`,
        subtitle: `Tujuan: ${ll.tujuan} • Keterangan: ${ll.keterangan || '-'} • Waktu: ${ll.created_at}`,
        metaBadge: `-${ll.qty_keluar} Eks`,
        statusBadge: 'Terkirim',
        statusVariant: 'info',
        targetSubTab: 'logs',
        targetSubTabLabel: 'Riwayat Logistik',
        filterKeyword: bTitle
      });
    });

    return list;
  }, [
    identitasList,
    usersList,
    books,
    orders,
    mutasis,
    accounts,
    pengajuans,
    promos,
    bazaarEvents,
    preOrderCampaigns,
    donasiProyeks,
    royaltiPenulisList,
    productionLogs,
    logisticLogs,
    calendarVersion
  ]);

  // Real-time filtered items based on query, division scope, and category
  const trimmedQuery = internalQuery.trim().toLowerCase();

  const scopedItems = useMemo(() => {
    if (!trimmedQuery) return [];
    return allIndexedItems.filter(item => {
      if (scopeMode === 'division' && item.divisionId !== divisionId) {
        return false;
      }
      const haystack = `${item.title} ${item.subtitle} ${item.metaBadge} ${item.statusBadge || ''} ${
        item.typeLabel
      }`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [allIndexedItems, trimmedQuery, scopeMode, divisionId]);

  const counts = useMemo(() => {
    return {
      all: scopedItems.length,
      task: scopedItems.filter(i => i.type === 'task').length,
      document: scopedItems.filter(i => i.type === 'document').length,
      entry: scopedItems.filter(i => i.type === 'entry').length
    };
  }, [scopedItems]);

  const displayedResults = useMemo(() => {
    if (categoryFilter === 'all') return scopedItems.slice(0, 12);
    return scopedItems.filter(i => i.type === categoryFilter).slice(0, 12);
  }, [scopedItems, categoryFilter]);

  const handleSelectResult = (item: DivisionSearchResultItem) => {
    if (item.divisionId !== divisionId) {
      switchDivision(item.divisionId, item.targetSubTab);
    } else {
      setCurrentSubTab(item.targetSubTab);
    }

    // Propagate filter keyword to local table or calendar view
    if (onQueryChange) {
      onQueryChange(item.filterKeyword);
    }
    window.dispatchEvent(
      new CustomEvent('mis-division-search-jump', {
        detail: {
          divisionId: item.divisionId,
          subTab: item.targetSubTab,
          keyword: item.filterKeyword
        }
      })
    );
  };

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'task':
        return <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'entry':
      default:
        return <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  const getStatusBadgeClasses = (variant?: DivisionSearchResultItem['statusVariant']) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'danger':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'info':
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all space-y-3">
      {/* Search Input Row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
        <div
          className={`flex-1 flex items-center bg-slate-50 dark:bg-slate-800/90 border border-slate-300/90 dark:border-slate-700 rounded-xl px-3.5 py-2 transition-all focus-within:ring-2 ${meta.accentBorder}`}
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={internalQuery}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => setIsResultsExpanded(true)}
            placeholder={placeholder || meta.placeholder}
            aria-label={`Pencarian Terpadu ${meta.name}`}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-medium"
          />
          {internalQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer ml-1"
              title="Bersihkan kata kunci pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shrink-0">
              Ctrl+K
            </kbd>
          )}
        </div>

        {/* Scope Switcher & Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          {/* Scope Toggle: Current Division vs All Divisions */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setScopeMode('division')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                scopeMode === 'division'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={`Cari di dalam ${meta.name}`}
            >
              <Building2 className="w-3 h-3" />
              <span>Divisi {meta.code}</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('global')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                scopeMode === 'global'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Cari lintas seluruh 6 direktorat"
            >
              <Layers className="w-3 h-3" />
              <span>Semua Divisi</span>
            </button>
          </div>

          {/* Quick Suggested Keyword Chips when search is empty */}
          {!trimmedQuery && (
            <div className="hidden xl:flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 mr-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Cepat:
              </span>
              {meta.quickChips.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleInputChange(chip)}
                  className="px-2 py-1 rounded-lg text-[10.5px] font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 border border-slate-200/70 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Filtered Results Panel */}
      {trimmedQuery && isResultsExpanded && (
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
          {/* Category Filter Tabs + Result Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Semua Hasil ({counts.all})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('task')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'task'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Tugas & Kalender ({counts.task})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('document')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'document'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Dokumen & Berkas ({counts.document})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('entry')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'entry'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Entry Data ({counts.entry})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              {/* Grid vs List Toggle inside Search Results Header */}
              <div
                className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10.5px]"
                title="Pilih tampilan hasil pencarian: Grid (Visual) atau List (Ringkas)"
              >
                <button
                  type="button"
                  onClick={() => handleToggleDashboardViewMode('grid')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    dashboardViewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDashboardViewMode('list')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    dashboardViewMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <List className="w-3 h-3" />
                  <span>List</span>
                </button>
              </div>

              <span>
                Filter real-time aktif untuk <strong>"{internalQuery}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsResultsExpanded(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold underline cursor-pointer"
              >
                Sembunyikan Panel
              </button>
            </div>
          </div>

          {/* Results Grid vs Compact List */}
          {displayedResults.length === 0 ? (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tidak ditemukan tugas, dokumen, atau entry data untuk "{internalQuery}" di{' '}
                {scopeMode === 'division' ? `Divisi ${meta.name}` : 'Seluruh Divisi'}.
              </p>
              {scopeMode === 'division' && (
                <button
                  type="button"
                  onClick={() => setScopeMode('global')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Coba cari di Semua 6 Direktorat →</span>
                </button>
              )}
            </div>
          ) : dashboardViewMode === 'list' ? (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-hidden max-h-80 overflow-y-auto bg-slate-50/70 dark:bg-slate-800/50">
              {displayedResults.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="group px-3 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {getTypeIcon(item.type)}
                      <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]">
                        {item.divisionCode}
                      </span>
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                      — {item.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    {item.progressPct !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.progressBarColor || 'bg-indigo-600'}`}
                            style={{ width: `${item.progressPct}%` }}
                          />
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-extrabold border ${
                            item.progressBadgeClass || ''
                          }`}
                        >
                          {item.progressPct}%
                        </span>
                      </div>
                    )}
                    {item.statusBadge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border ${getStatusBadgeClasses(
                          item.statusVariant
                        )}`}
                      >
                        {item.statusBadge}
                      </span>
                    )}
                    <span className="font-mono font-semibold text-[10px] text-slate-500 dark:text-slate-400 hidden lg:inline">
                      {item.metaBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{item.targetSubTabLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {displayedResults.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="group p-3 rounded-xl bg-slate-50/90 hover:bg-indigo-50/60 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {getTypeIcon(item.type)}
                        <span>{item.typeLabel}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]">
                          {item.divisionCode}
                        </span>
                      </span>
                      {item.statusBadge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold border ${getStatusBadgeClasses(
                            item.statusVariant
                          )}`}
                        >
                          {item.statusBadge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>

                    {item.progressPct !== undefined && (
                      <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            Progres Penyelesaian
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9.5px] font-extrabold border ${
                              item.progressBadgeClass || ''
                            }`}
                          >
                            {item.progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.progressBarColor || 'bg-indigo-600'
                            }`}
                            style={{ width: `${item.progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                      {item.metaBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Buka {item.targetSubTabLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD TASK PROGRESS BAR MONITOR (Shown on all division dashboards when not on full Kalender tab) */}
      {currentSubTab !== 'kalender' &&
        (() => {
          const allCalEvents = getStoredCalendarEvents();
          const divisionTasks = allCalEvents
            .filter(ev => {
              const evDiv = (ev.divisionId || ev.picDivisionId || 1) as DivisionId;
              return scopeMode === 'division' ? evDiv === divisionId : true;
            })
            .sort((a, b) => a.date.localeCompare(b.date));

          const filteredDashboardTasks = divisionTasks.filter(ev => {
            if (taskStatusFilter === 'active') return ev.status !== 'Selesai';
            if (taskStatusFilter === 'done') return ev.status === 'Selesai';
            return true;
          });

          const totalTasks = divisionTasks.length;
          const doneTasks = divisionTasks.filter(e => e.status === 'Selesai').length;
          const inProgressTasks = divisionTasks.filter(e => e.status === 'Sedang Berjalan').length;
          const pendingTasks = divisionTasks.filter(e => e.status === 'Belum Mulai').length;
          const avgDivProgress =
            totalTasks > 0
              ? Math.round(
                  divisionTasks.reduce((acc, e) => acc + getTaskCompletionProgress(e).percent, 0) /
                    totalTasks
                )
              : 0;

          return (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {/* Top Summary & Overall Progress Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    <ListTodo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      Progres Tugas & To-Do {scopeMode === 'division' ? `Divisi ${meta.code}` : 'Semua Divisi'}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      avgDivProgress >= 100
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : avgDivProgress >= 50
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    }`}
                  >
                    {avgDivProgress}% Selesai
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ({doneTasks} Tuntas • {inProgressTasks} Berjalan • {pendingTasks} Belum)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setTaskStatusFilter('all')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        taskStatusFilter === 'all'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Semua ({totalTasks})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskStatusFilter('active')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        taskStatusFilter === 'active'
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Aktif ({inProgressTasks + pendingTasks})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskStatusFilter('done')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        taskStatusFilter === 'done'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Selesai ({doneTasks})
                    </button>
                  </div>

                  {/* Grid vs List Toggle for Dashboard Task Monitor */}
                  <div
                    className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10.5px]"
                    title="Ubah tampilan progres tugas di Dashboard antara Grid (Visual) atau List (Ringkas)"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleDashboardViewMode('grid')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        dashboardViewMode === 'grid'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                      title="Tampilan Grid (Visual)"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span>Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDashboardViewMode('list')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        dashboardViewMode === 'list'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                      title="Tampilan List (Ringkas)"
                    >
                      <List className="w-3 h-3" />
                      <span>List</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentSubTab('kalender')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Buka Kalender</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTaskProgressOpen(prev => !prev)}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title={isTaskProgressOpen ? 'Sembunyikan rincian kartu tugas' : 'Tampilkan rincian kartu tugas'}
                  >
                    {isTaskProgressOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Overall Division Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    avgDivProgress >= 100
                      ? 'bg-emerald-500'
                      : avgDivProgress >= 60
                      ? 'bg-indigo-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${avgDivProgress}%` }}
                />
              </div>

              {/* Per-Task Progress Bar Cards on Dashboard (Grid vs Compact List) */}
              {isTaskProgressOpen &&
                (dashboardViewMode === 'list' ? (
                  <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/40">
                    {filteredDashboardTasks.map(ev => {
                      const prog = getTaskCompletionProgress(ev);
                      const dl = getDeadlineInfo(ev.date, ev.status);
                      const evDiv = (ev.divisionId || ev.picDivisionId || 1) as DivisionId;
                      const divCode = DIVISION_SEARCH_META[evDiv]?.code || 'DIR';

                      return (
                        <div
                          key={ev.id}
                          className="px-3 py-2.5 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-2.5"
                        >
                          {/* Left: Div Badge, Date, Title, PIC & Deadline */}
                          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-white dark:bg-slate-700 text-[9px] font-mono font-bold shrink-0">
                              {divCode}
                            </span>
                            <span className="text-[10.5px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                              {ev.date}
                            </span>
                            <h4
                              onClick={() => setCurrentSubTab('kalender')}
                              className={`text-xs font-extrabold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[220px] sm:max-w-[300px] ${
                                ev.status === 'Selesai'
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                              title={ev.title}
                            >
                              {ev.title}
                            </h4>
                            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 shrink-0">
                              • PIC: <strong className="text-slate-700 dark:text-slate-300">{ev.picName}</strong>
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border shrink-0 ${
                                dl.state === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                  : dl.state === 'overdue'
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : dl.state === 'today' || dl.state === 'approaching'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300'
                              }`}
                            >
                              {dl.label}
                            </span>
                          </div>

                          {/* Right: Compact Progress Bar + Status Quick Buttons */}
                          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 shrink-0">
                            <div className="flex items-center gap-2">
                              {prog.totalSubtasks > 0 && (
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                  {prog.doneSubtasks}/{prog.totalSubtasks}
                                </span>
                              )}
                              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                                  style={{ width: `${prog.percent}%` }}
                                />
                              </div>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold border ${prog.badgeClass}`}
                              >
                                {prog.percent}%
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {(
                                [
                                  { label: '0%', val: 'Belum Mulai' as const },
                                  { label: '50%', val: 'Sedang Berjalan' as const },
                                  { label: '100%', val: 'Selesai' as const }
                                ]
                              ).map(opt => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    updateStoredCalendarEventStatus(ev.id, opt.val);
                                    setCalendarVersion(v => v + 1);
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                    ev.status === opt.val
                                      ? opt.val === 'Selesai'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : opt.val === 'Sedang Berjalan'
                                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                                        : 'bg-slate-700 text-white border-slate-700'
                                      : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => setCurrentSubTab('kalender')}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
                            >
                              Detail →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-0.5">
                  {filteredDashboardTasks.map(ev => {
                    const prog = getTaskCompletionProgress(ev);
                    const dl = getDeadlineInfo(ev.date, ev.status);
                    const evDiv = (ev.divisionId || ev.picDivisionId || 1) as DivisionId;
                    const divCode = DIVISION_SEARCH_META[evDiv]?.code || 'DIR';

                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1.5">
                          {/* Task Top Meta & Deadline Badge */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-white dark:bg-slate-700 text-[9px] font-mono font-bold shrink-0">
                                {divCode}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                {ev.date} • PIC: {ev.picName}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-extrabold border shrink-0 ${
                                dl.state === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                  : dl.state === 'overdue'
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : dl.state === 'today' || dl.state === 'approaching'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300'
                              }`}
                            >
                              {dl.label}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4
                            onClick={() => setCurrentSubTab('kalender')}
                            className={`text-xs font-extrabold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 ${
                              ev.status === 'Selesai'
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                            title={ev.title}
                          >
                            {ev.title}
                          </h4>

                          {/* Progress Bar + Instant Percentage */}
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                {prog.totalSubtasks > 0
                                  ? `Checklist: ${prog.doneSubtasks}/${prog.totalSubtasks} selesai`
                                  : `Status: ${ev.status}`}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold border ${prog.badgeClass}`}
                              >
                                {prog.percent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${prog.barColor}`}
                                style={{ width: `${prog.percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Interactive Subtasks mini-checklist on Dashboard */}
                          {ev.subtasks.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {ev.subtasks.slice(0, 2).map(st => (
                                <label
                                  key={st.id}
                                  className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 text-[10.5px] cursor-pointer hover:bg-indigo-50/40"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => {
                                        toggleStoredCalendarSubtask(ev.id, st.id);
                                        setCalendarVersion(v => v + 1);
                                      }}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span
                                      className={`truncate ${
                                        st.completed
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-700 dark:text-slate-200 font-medium'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                    {st.completed ? '100%' : '0%'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Status Buttons on Dashboard Card */}
                        <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {(
                              [
                                { label: '0% Belum', val: 'Belum Mulai' as const },
                                { label: '50% Jalan', val: 'Sedang Berjalan' as const },
                                { label: '100% Selesai', val: 'Selesai' as const }
                              ]
                            ).map(opt => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => {
                                  updateStoredCalendarEventStatus(ev.id, opt.val);
                                  setCalendarVersion(v => v + 1);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                                  ev.status === opt.val
                                    ? opt.val === 'Selesai'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : opt.val === 'Sedang Berjalan'
                                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                                      : 'bg-slate-700 text-white border-slate-700'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentSubTab('kalender')}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
                          >
                            Detail →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                ))}
            </div>
          );
        })()}
    </div>
  );
};
