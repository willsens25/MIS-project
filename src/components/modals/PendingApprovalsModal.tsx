import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Ban,
  Check,
  Building2,
  ShoppingBag,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PengajuanCetak, Order } from '../../types';

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const {
    pengajuans,
    orders,
    accounts,
    approvePengajuanCetak,
    rejectPengajuanCetak,
    tandaiLunasOrder,
    switchDivision,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pengajuan' | 'orders'>('pengajuan');
  const [selectedAccountId, setSelectedAccountId] = useState<number>(accounts[0]?.id || 1);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingPengajuans = pengajuans.filter((p) => p.status === 'pending');
  const pendingOrders = orders.filter((o) => o.status === 'Pending');

  const totalPendingPengajuanDana = pendingPengajuans.reduce((acc, curr) => {
    const unitCost = curr.buku?.biaya_pokok || 25000;
    return acc + curr.jumlah_pengajuan * unitCost;
  }, 0);

  const totalPendingOrdersDana = pendingOrders.reduce((acc, curr) => acc + (curr.total_tagihan || 0), 0);

  const handleApprove = (pengajuan: PengajuanCetak) => {
    approvePengajuanCetak(pengajuan.id, selectedAccountId);
    const acc = accounts.find((a) => a.id === selectedAccountId);
    const msg = `Pengajuan cetak "${pengajuan.buku?.judul || 'Buku'}" (${pengajuan.jumlah_pengajuan} Eks) berhasil disetujui melalui akun ${acc?.nama_akun || 'Kas'}! SPK diteruskan ke Produksi.`;
    if (onSuccessToast) onSuccessToast(msg);
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) {
      setRejectError('Mohon isi alasan penolakan.');
      return;
    }
    setRejectError(null);
    rejectPengajuanCetak(id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
    if (onSuccessToast) onSuccessToast('Pengajuan cetak telah ditolak dengan catatan.');
  };

  const handleMarkOrderPaid = (order: Order) => {
    const res = tandaiLunasOrder(order.id, selectedAccountId);
    if (res.success) {
      if (onSuccessToast) onSuccessToast(`Faktur ${order.no_invoice} (${order.nama_pembeli}) berhasil ditandai lunas!`);
    }
  };

  const handleGoToFullApprovalTab = () => {
    switchDivision(2, 'persetujuan');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-3xl my-auto py-2 sm:py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/80 shadow-xs shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Periksa Persetujuan Tertunda</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      {pendingPengajuans.length + pendingOrders.length} Menunggu Tindakan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tinjau dan proses persetujuan anggaran cetak buku & konfirmasi faktur penjualan secara cepat.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs & Source Account Selector */}
            <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('pengajuan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'pengajuan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pengajuan Cetak ({pendingPengajuans.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('orders')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'orders'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Faktur Belum Lunas ({pendingOrders.length})</span>
                </button>
              </div>

              {/* Source Account for 1-click approvals */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Akun Pembayar:</span>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nama_akun}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content List */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
              {/* TAB 1: Pengajuan Cetak */}
              {activeSubTab === 'pengajuan' && (
                <>
                  {pendingPengajuans.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Semua Pengajuan Telah Diproses!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Tidak ada permohonan cetak yang tertunda. Divisi Penerbitan dan Keuangan sinkron sempurna.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            Total Kebutuhan Anggaran Cetak:
                          </span>
                        </div>
                        <span className="font-extrabold text-amber-700 dark:text-amber-300 text-sm">
                          Rp {totalPendingPengajuanDana.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {pendingPengajuans.map((p) => {
                          const estCost = p.jumlah_pengajuan * (p.buku?.biaya_pokok || 25000);
                          const isRejecting = rejectingId === p.id;

                          return (
                            <div
                              key={p.id}
                              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                      ID #{p.id}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                      {p.buku?.judul || 'Buku Tanpa Judul'}
                                    </h4>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span>Penulis: <strong>{p.buku?.penulis || '-'}</strong></span>
                                    <span>•</span>
                                    <span>Oplah: <strong className="text-indigo-600 dark:text-indigo-400">{p.jumlah_pengajuan.toLocaleString('id-ID')} Eks</strong></span>
                                    <span>•</span>
                                    <span>Diajukan: {new Date(p.created_at).toLocaleDateString('id-ID')}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                  <div className="text-left sm:text-right">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Estimasi Dana</div>
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                                      Rp {estCost.toLocaleString('id-ID')}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleApprove(p)}
                                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                      title="Setujui dan terbitkan SPK ke Produksi"
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Setujui</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRejectingId(isRejecting ? null : p.id);
                                        setRejectReason('');
                                      }}
                                      className="p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                      title="Tolak pengajuan"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Form Input */}
                              {isRejecting && (
                                <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/40 space-y-2">
                                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-300">
                                    Alasan Penolakan Pengajuan:
                                  </label>
                                  {rejectError && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold animate-in fade-in">
                                      {rejectError}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      placeholder="Contoh: Anggaran belum mencukupi / Oplah perlu disesuaikan"
                                      value={rejectReason}
                                      onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        if (rejectError) setRejectError(null);
                                      }}
                                      className="flex-1 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleReject(p.id)}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                                    >
                                      Konfirmasi Tolak
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* TAB 2: Faktur Belum Lunas */}
              {activeSubTab === 'orders' && (
                <>
                  {pendingOrders.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Seluruh Faktur Penjualan Telah Lunas!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Tidak ada piutang tertunda. Seluruh pesanan telah lunas atau terkonfirmasi.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            Total Tagihan Menunggu Pembayaran:
                          </span>
                        </div>
                        <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                          Rp {totalPendingOrdersDana.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {pendingOrders.map((o) => (
                          <div
                            key={o.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                  {o.no_invoice}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {o.nama_pembeli}
                                </h4>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>Via: <strong>{o.via}</strong></span>
                                <span>•</span>
                                <span>Ekspedisi: {o.ekspedisi}</span>
                                <span>•</span>
                                <span>Tgl: {o.tanggal_pesan}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                              <div className="text-left sm:text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Tagihan</div>
                                <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                                  Rp {(o.total_tagihan || 0).toLocaleString('id-ID')}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleMarkOrderPaid(o)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                title="Konfirmasi pembayaran dan tandai lunas"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Tandai Lunas</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <button
                type="button"
                onClick={handleGoToFullApprovalTab}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>Buka Tabel Persetujuan Lengkap di Keuangan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
