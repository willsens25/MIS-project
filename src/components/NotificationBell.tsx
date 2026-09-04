import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  Package,
  FileText,
  DollarSign,
  Printer,
  ChevronRight,
  Check,
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: string;
  isRead: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationBellProps {
  onOpenPersetujuan?: () => void;
  onOpenAuditLogs?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onOpenPersetujuan,
  onOpenAuditLogs
}) => {
  const {
    currentUser,
    divisiList,
    books,
    orders,
    pengajuans,
    promos,
    accounts,
    productionLogs,
    logisticLogs,
    activityLogs,
    switchDivision
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'info'>('all');
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`mis_read_alerts_u${currentUser.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync read alert IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`mis_read_alerts_u${currentUser.id}`, JSON.stringify(readAlertIds));
    } catch (e) {
      console.warn('Error saving read alerts:', e);
    }
  }, [readAlertIds, currentUser.id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute division-specific alerts dynamically
  const divisionAlerts = useMemo<AlertItem[]>(() => {
    const items: AlertItem[] = [];
    const divId = currentUser.divisi_id;

    const pendingPengajuans = pengajuans.filter(p => p.status === 'pending');
    const approvedPengajuans = pengajuans.filter(p => p.status === 'approved');
    const lowStockBooks = books.filter(b => b.stok_gudang <= 20);
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const paidOrders = orders.filter(o => o.status === 'Lunas');

    // 1. DIREKTORAT & HRD (divId === 1)
    if (divId === 1) {
      if (pendingPengajuans.length > 0) {
        items.push({
          id: `dir-pengajuan-${pendingPengajuans.length}`,
          title: 'Persetujuan Cetak Diperlukan',
          description: `Terdapat ${pendingPengajuans.length} pengajuan cetak buku yang menunggu review & persetujuan manajemen.`,
          time: 'Baru saja',
          type: 'urgent',
          category: 'Persetujuan',
          isRead: false,
          actionLabel: 'Buka Persetujuan',
          onAction: () => {
            onOpenPersetujuan?.();
            setIsOpen(false);
          }
        });
      }

      if (lowStockBooks.length > 0) {
        items.push({
          id: `dir-lowstock-${lowStockBooks.length}`,
          title: 'Peringatan Stok Kritis Nasional',
          description: `${lowStockBooks.length} judul buku memiliki stok di bawah 20 eksemplar di gudang (termasuk '${lowStockBooks[0]?.judul}').`,
          time: '1 jam lalu',
          type: 'warning',
          category: 'Inventori',
          isRead: false
        });
      }

      if (pendingOrders.length > 0) {
        items.push({
          id: `dir-pendingorders-${pendingOrders.length}`,
          title: 'Pesanan Belum Terselesaikan',
          description: `${pendingOrders.length} transaksi invoice penjualan masih menunggu pelunasan customer.`,
          time: '3 jam lalu',
          type: 'info',
          category: 'Penjualan',
          isRead: false
        });
      }

      if (activityLogs.length > 0) {
        const latest = activityLogs[0];
        items.push({
          id: `dir-activity-${latest.id}`,
          title: 'Aktivitas Log Sistem',
          description: `${latest.keterangan} (dilakukan oleh sistem)`,
          time: latest.created_at || 'Hari ini',
          type: 'info',
          category: 'Audit Log',
          isRead: false,
          actionLabel: 'Audit Log',
          onAction: () => {
            onOpenAuditLogs?.();
            setIsOpen(false);
          }
        });
      }
    }

    // 2. BENDAHARA / FINANCE (divId === 2)
    else if (divId === 2) {
      if (pendingPengajuans.length > 0) {
        items.push({
          id: `fin-pengajuan-${pendingPengajuans.length}`,
          title: 'Verifikasi Anggaran Pengajuan Cetak',
          description: `${pendingPengajuans.length} pengajuan biaya percetakan menunggu validasi sumber akun kas/bank.`,
          time: 'Mendesak',
          type: 'urgent',
          category: 'Anggaran',
          isRead: false,
          actionLabel: 'Verifikasi Akun',
          onAction: () => {
            onOpenPersetujuan?.();
            setIsOpen(false);
          }
        });
      }

      if (pendingOrders.length > 0) {
        const totalPendingNominal = pendingOrders.reduce((acc, curr) => acc + (curr.total_tagihan || 0), 0);
        items.push({
          id: `fin-unpaid-${pendingOrders.length}`,
          title: 'Piutang Penjualan Belum Lunas',
          description: `${pendingOrders.length} invoice belum lunas senilai Rp ${totalPendingNominal.toLocaleString('id-ID')}. Perlu rekonsiliasi kas masuk.`,
          time: '2 jam lalu',
          type: 'warning',
          category: 'Kas Masuk',
          isRead: false
        });
      }

      // Check account balances
      accounts.forEach(acc => {
        const saldo = acc.saldo_awal ?? 0;
        if (saldo < 10000000) {
          items.push({
            id: `fin-acc-low-${acc.id}`,
            title: `Saldo Akun Menipis: ${acc.nama_akun}`,
            description: `Saldo saat ini tercatat Rp ${saldo.toLocaleString('id-ID')}. Mohon pantau likuiditas.`,
            time: 'Hari ini',
            type: 'warning',
            category: 'Kas Operasional',
            isRead: false
          });
        }
      });

      items.push({
        id: 'fin-reconcile-ok',
        title: 'Status Buku Kas Terupdate',
        description: 'Jurnal mutasi dan buku kas siap diunduh dalam format laporan periodik.',
        time: 'Hari ini',
        type: 'success',
        category: 'Pembukuan',
        isRead: false
      });
    }

    // 3. PENERBITAN (divId === 3)
    else if (divId === 3) {
      if (lowStockBooks.length > 0) {
        items.push({
          id: `pub-reprint-${lowStockBooks.length}`,
          title: 'Perlu Pengajuan Cetak Ulang',
          description: `Buku '${lowStockBooks[0]?.judul}' tersisa ${lowStockBooks[0]?.stok_gudang} pcs. Segera buat pengajuan cetak baru.`,
          time: 'Prioritas',
          type: 'urgent',
          category: 'Katalog Buku',
          isRead: false
        });
      }

      const pendingForPub = pengajuans.filter(p => p.status === 'pending');
      if (pendingForPub.length > 0) {
        items.push({
          id: `pub-pending-${pendingForPub.length}`,
          title: 'Pengajuan Cetak Dalam Antrean',
          description: `${pendingForPub.length} berkas naskah sedang ditinjau oleh tim Keuangan & Direksi.`,
          time: 'Proses',
          type: 'info',
          category: 'Status Cetak',
          isRead: false
        });
      }

      const approvedForPub = pengajuans.filter(p => p.status === 'approved');
      if (approvedForPub.length > 0) {
        items.push({
          id: `pub-approved-${approvedForPub.length}`,
          title: 'Naskah Disetujui Masuk Percetakan',
          description: `${approvedForPub.length} pengajuan telah disetujui & diteruskan ke jadwal pabrikasi divisi produksi.`,
          time: 'Kemarin',
          type: 'success',
          category: 'Produksi Fisik',
          isRead: false
        });
      }

      items.push({
        id: `pub-total-${books.length}`,
        title: 'Katalog Penerbitan Aktif',
        description: `Total ${books.length} judul naskah terdaftar dengan metadata ISBN resmi.`,
        time: 'Info',
        type: 'info',
        category: 'Koleksi',
        isRead: false
      });
    }

    // 4. MARKETING & DISTRIBUTION (divId === 4)
    else if (divId === 4) {
      if (pendingOrders.length > 0) {
        items.push({
          id: `mkt-pending-${pendingOrders.length}`,
          title: 'Konfirmasi Pembayaran Order',
          description: `${pendingOrders.length} transaksi order menunggu konfirmasi bukti bayar/QRIS dari pemesan.`,
          time: 'Mendesak',
          type: 'urgent',
          category: 'Order POS',
          isRead: false
        });
      }

      if (paidOrders.length > 0) {
        items.push({
          id: `mkt-paid-${paidOrders.length}`,
          title: 'Order Lunas Siap Proses Pengiriman',
          description: `${paidOrders.length} pesanan berhasil lunas dan diteruskan ke antrean packing logistik.`,
          time: '1 jam lalu',
          type: 'success',
          category: 'Distribusi',
          isRead: false
        });
      }

      // Check promos
      promos.forEach(pr => {
        if (pr.used_count >= pr.max_uses * 0.8) {
          items.push({
            id: `mkt-promo-cap-${pr.id}`,
            title: `Batas Voucher '${pr.code}' Hampir Habis`,
            description: `Telah digunakan ${pr.used_count} dari ${pr.max_uses} kuota kupon promo.`,
            time: '2 hari lalu',
            type: 'warning',
            category: 'Promosi',
            isRead: false
          });
        }
      });
    }

    // 5. PRODUKSI (divId === 5)
    else if (divId === 5) {
      if (approvedPengajuans.length > 0) {
        items.push({
          id: `prd-approved-${approvedPengajuans.length}`,
          title: 'SPK Cetak Fisik Siap Dikerjakan',
          description: `${approvedPengajuans.length} Surat Perintah Kerja (SPK) cetak telah disetujui keuangan untuk masuk mesin cetak.`,
          time: 'Mendesak',
          type: 'urgent',
          category: 'Pabrikasi',
          isRead: false
        });
      }

      if (lowStockBooks.length > 0) {
        items.push({
          id: `prd-lowstock-${lowStockBooks.length}`,
          title: 'Antrean Restok Prioritas',
          description: `Judul '${lowStockBooks[0]?.judul}' tersisa ${lowStockBooks[0]?.stok_gudang} unit di gudang. Masukkan ke jadwal cetak berikutnya.`,
          time: '3 jam lalu',
          type: 'warning',
          category: 'Jadwal Mesin',
          isRead: false
        });
      }

      if (productionLogs.length > 0) {
        const lastLog = productionLogs[0];
        items.push({
          id: `prd-log-${lastLog.id}`,
          title: 'Output Cetak Terakhir Selesai',
          description: `Pencetakan ${lastLog.qty_produksi} eksemplar buku berhasil dicatat dan siap serah terima ke logistik.`,
          time: lastLog.tanggal_produksi || 'Hari ini',
          type: 'success',
          category: 'Hasil Cetak',
          isRead: false
        });
      }
    }

    // 6. LOGISTIK & GUDANG (divId === 6)
    else if (divId === 6) {
      if (paidOrders.length > 0) {
        items.push({
          id: `log-dispatch-${paidOrders.length}`,
          title: 'Antrean Packing & Surat Jalan',
          description: `${paidOrders.length} paket pesanan lunas siap dikemas, ditempel label alamat, dan dibuatkan surat jalan ekspedisi.`,
          time: 'Mendesak',
          type: 'urgent',
          category: 'Ekspedisi',
          isRead: false
        });
      }

      if (lowStockBooks.length > 0) {
        items.push({
          id: `log-lowstock-${lowStockBooks.length}`,
          title: 'Peringatan Stok Rak Gudang Menipis',
          description: `${lowStockBooks.length} judul buku mendekati batas stok minimum (di bawah 20 eksemplar).`,
          time: '1 jam lalu',
          type: 'warning',
          category: 'Rak Gudang',
          isRead: false
        });
      }

      if (logisticLogs.length > 0) {
        const lastLog = logisticLogs[0];
        items.push({
          id: `log-movement-${lastLog.id}`,
          title: 'Pergerakan Barang Terakhir',
          description: `${lastLog.keterangan || `Pengeluaran ${lastLog.qty_keluar} buku ke ${lastLog.tujuan}`}`,
          time: lastLog.created_at || 'Hari ini',
          type: 'info',
          category: 'Mutasi Fisik',
          isRead: false
        });
      }
    }

    // Map read status from state
    return items.map(item => ({
      ...item,
      isRead: readAlertIds.includes(item.id)
    }));
  }, [
    currentUser.divisi_id,
    books,
    orders,
    pengajuans,
    promos,
    accounts,
    productionLogs,
    logisticLogs,
    activityLogs,
    readAlertIds,
    onOpenPersetujuan,
    onOpenAuditLogs
  ]);

  const unreadAlerts = useMemo(() => {
    return divisionAlerts.filter(a => !a.isRead);
  }, [divisionAlerts]);

  const urgentAlertsCount = useMemo(() => {
    return divisionAlerts.filter(a => (a.type === 'urgent' || a.type === 'warning') && !a.isRead).length;
  }, [divisionAlerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'urgent') {
      return divisionAlerts.filter(a => a.type === 'urgent' || a.type === 'warning');
    }
    if (filter === 'info') {
      return divisionAlerts.filter(a => a.type === 'info' || a.type === 'success');
    }
    return divisionAlerts;
  }, [divisionAlerts, filter]);

  const markAllAsRead = () => {
    const allIds = divisionAlerts.map(a => a.id);
    setReadAlertIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const markSingleAsRead = (id: string) => {
    setReadAlertIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearAllHistory = () => {
    markAllAsRead();
  };

  const currentDivisi = divisiList.find(d => d.id === currentUser.divisi_id);

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const getAlertBadgeClass = (type: AlertItem['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="btn-notification-bell"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifikasi Divisi ${currentDivisi?.nama_divisi || ''}`}
        aria-expanded={isOpen}
        title={`Alert & Notifikasi Divisi ${currentDivisi?.nama_divisi || ''} (${unreadAlerts.length} belum dibaca)`}
        className={`relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group shadow-sm ${
          isOpen ? 'ring-2 ring-indigo-500/50 text-indigo-600 dark:text-indigo-400' : ''
        }`}
      >
        <Bell className={`w-4 h-4 transition-transform ${unreadAlerts.length > 0 ? 'group-hover:rotate-12' : ''}`} />

        {/* Unread Count Badge */}
        {unreadAlerts.length > 0 && (
          <span
            id="notification-badge-count"
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
          </span>
        )}

        {/* Urgent Pulse Indicator */}
        {urgentAlertsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id="notification-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Alert & Notifikasi</h3>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-mono">
                    {currentDivisi?.kode}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  Divisi {currentDivisi?.nama_divisi}
                </p>
              </div>
            </div>

            {/* Mark all as read button */}
            {unreadAlerts.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline px-2 py-1 rounded transition-colors"
                title="Tandai semua alert telah dibaca"
              >
                <Check className="w-3 h-3" />
                <span>Baca Semua</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 bg-white dark:bg-slate-900 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({divisionAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'urgent'
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Mendesak ({divisionAlerts.filter(a => a.type === 'urgent' || a.type === 'warning').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('info')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'info'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Info ({divisionAlerts.filter(a => a.type === 'info' || a.type === 'success').length})
            </button>
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Tidak ada alert baru</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Seluruh operasi divisi {currentDivisi?.nama_divisi} berjalan normal.
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => markSingleAsRead(alert.id)}
                  className={`p-3.5 transition-colors text-left flex items-start space-x-3 cursor-pointer group ${
                    alert.isRead
                      ? 'bg-white dark:bg-slate-900/60 opacity-80 hover:opacity-100'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {alert.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getAlertBadgeClass(
                          alert.type
                        )}`}
                      >
                        {alert.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2 line-clamp-2">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
                        {!alert.isRead && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1"></span>
                        )}
                      </div>

                      {/* Quick Action Button */}
                      {alert.onAction && alert.actionLabel && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            markSingleAsRead(alert.id);
                            alert.onAction?.();
                          }}
                          className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
                        >
                          <span>{alert.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-[10px]">
              {unreadAlerts.length} alert aktif untuk {currentDivisi?.kode}
            </span>
            <button
              type="button"
              onClick={() => {
                markAllAsRead();
                setIsOpen(false);
              }}
              className="text-[10px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
