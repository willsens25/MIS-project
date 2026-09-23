import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Package,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Printer,
  Scale,
  Zap,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BazaarEvent, BazaarAllocationItem } from '../../types';
import { BazaarEventModal } from './BazaarEventModal';
import { BazaarAllocationModal } from './BazaarAllocationModal';
import { BazaarReconciliationModal } from './BazaarReconciliationModal';
import { BazaarManifestModal } from './BazaarManifestModal';

interface BazaarEventsTabProps {
  onOpenEventPOS?: () => void;
}

export const BazaarEventsTab: React.FC<BazaarEventsTabProps> = ({ onOpenEventPOS }) => {
  const {
    bazaarEvents,
    books,
    addBazaarEvent,
    updateBazaarEvent,
    deleteBazaarEvent,
    allocateBazaarBooks,
    reconcileBazaarEvent,
    setCurrentSubTab
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BazaarEvent['status']>('all');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BazaarEvent | null>(null);

  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocatingEvent, setAllocatingEvent] = useState<BazaarEvent | null>(null);

  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [reconcilingEvent, setReconcilingEvent] = useState<BazaarEvent | null>(null);

  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [manifestEvent, setManifestEvent] = useState<BazaarEvent | null>(null);

  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<BazaarEvent | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return bazaarEvents.filter(ev => {
      const pic = ev.pic_nama || ev.penanggung_jawab || '';
      const matchSearch =
        ev.nama_event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || ev.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bazaarEvents, searchQuery, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalEvents = bazaarEvents.length;
    const activeEvents = bazaarEvents.filter(e => e.status === 'Sedang Berlangsung').length;
    const plannedEvents = bazaarEvents.filter(e => e.status === 'Direncanakan').length;
    const completedEvents = bazaarEvents.filter(e => e.status === 'Selesai Rekonsiliasi').length;

    let totalBawa = 0;
    let totalTerjual = 0;
    let totalKembali = 0;
    let totalOmzet = 0;

    bazaarEvents.forEach(e => {
      totalBawa += e.total_buku_dibawa || 0;
      totalTerjual += e.total_buku_terjual || 0;
      totalKembali += e.total_buku_kembali || 0;
      totalOmzet += e.total_omzet || 0;
    });

    return {
      totalEvents,
      activeEvents,
      plannedEvents,
      completedEvents,
      totalBawa,
      totalTerjual,
      totalKembali,
      totalOmzet
    };
  }, [bazaarEvents]);

  const handleCreateOrUpdateEvent = (eventData: any) => {
    if (editingEvent) {
      updateBazaarEvent(editingEvent.id, eventData);
    } else {
      addBazaarEvent(eventData);
    }
    setEditingEvent(null);
  };

  const handleOpenPOS = (event: BazaarEvent) => {
    if (onOpenEventPOS) {
      onOpenEventPOS();
    } else {
      setCurrentSubTab('event_pos');
    }
  };

  const getStatusBadge = (status: BazaarEvent['status']) => {
    switch (status) {
      case 'Direncanakan':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Direncanakan</span>
          </span>
        );
      case 'Sedang Berlangsung':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Sedang Berlangsung</span>
          </span>
        );
      case 'Selesai Rekonsiliasi':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai Rekonsiliasi</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            <span>Dibatalkan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Guidance Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Siklus Konsinyasi & Alokasi Persediaan Stan Bazaar
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Lacak setiap eksemplar buku yang dibawa ke luar kantor agar tidak ada selisih stok fisik gudang dan omzet tercatat presisi.
            </p>
          </div>

          {/* 4 Step Diagram */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] shrink-0">
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">1. Rencanakan</span>
              <span className="text-slate-500 text-[10px]">Daftar Stan & Jadwal</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">2. Alokasi Stok</span>
              <span className="text-slate-500 text-[10px]">Potong Gudang & SJ</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">3. Kasir POS</span>
              <span className="text-slate-500 text-[10px]">Jual Cepat di Stan</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-purple-600 dark:text-purple-400 block">4. Rekonsiliasi</span>
              <span className="text-slate-500 text-[10px]">Restock Sisa Buku</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Agenda Bazaar</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.totalEvents}
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{metrics.activeEvents} Aktif</span>
            <span>•</span>
            <span>{metrics.completedEvents} Selesai</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Buku Dibawa ke Stan</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {metrics.totalBawa}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total dialokasikan dari gudang
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Buku Terjual di Stan</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {metrics.totalTerjual}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Terserap pembaca di pameran
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Omzet Bazaar</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            Rp {metrics.totalOmzet.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Pemasukan bruto acara
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Buku Kembali (Restock)</span>
            <RotateCcw className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {metrics.totalKembali}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Telah kembali ke rak gudang
          </p>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama bazaar, lokasi venue, PIC..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Status</option>
            <option value="Direncanakan">Direncanakan</option>
            <option value="Sedang Berlangsung">Sedang Berlangsung</option>
            <option value="Selesai Rekonsiliasi">Selesai Rekonsiliasi</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsEventModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Bazaar Baru</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Tidak Ada Agenda Bazaar Ditemukan
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada agenda yang cocok dengan kriteria pencarian atau filter status.'
                : 'Belum ada agenda bazaar atau stan konsinyasi. Klik tombol "+ Tambah Agenda Bazaar Baru" untuk mulai mencatat.'}
            </p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const totalDibawa = (event.items || []).reduce((s, i) => s + (i.qty_dibawa || 0), 0);
            const totalTerjual = (event.items || []).reduce((s, i) => s + (i.qty_terjual || 0), 0);
            const totalKembali = (event.items || []).reduce((s, i) => s + (i.qty_kembali || 0), 0);
            const totalOmzet = (event.items || []).reduce(
              (s, i) => s + (i.qty_terjual || 0) * (i.harga_satuan || 0),
              0
            );
            const sisaStan = Math.max(0, totalDibawa - totalTerjual - totalKembali);

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Event Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {event.nama_event}
                      </h3>
                      {getStatusBadge(event.status)}
                      {event.stok_gudang_dipotong && (
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                          📦 Stok Gudang Terpotong
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.lokasi}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.tanggal_mulai} s/d {event.tanggal_selesai}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>PIC: <strong className="text-slate-700 dark:text-slate-300">{event.pic_nama || event.penanggung_jawab}</strong></span>
                        {(event.pic_kontak || event.kontak_pic) && (
                          <a
                            href={`https://wa.me/${(event.pic_kontak || event.kontak_pic || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 ml-1 font-mono font-bold"
                          >
                            ({event.pic_kontak || event.kontak_pic})
                          </a>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Top Right Quick Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setManifestEvent(event);
                        setIsManifestModalOpen(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                      title="Cetak Surat Jalan / Manifest Barang Bawaan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Surat Jalan</span>
                    </button>

                    <button
                      onClick={() => handleOpenPOS(event)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      title="Buka Kasir POS Khusus Stan Ini"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Buka Kasir</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setIsEventModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                      title="Edit Detail Acara"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmEvent(event)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                      title="Hapus Acara"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Event Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Alokasi Bawaan:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                      {totalDibawa} eks
                    </span>
                    <span className="text-[10px] text-slate-400 block">{(event.items || []).length} Judul Buku</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Terjual di Stan:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {totalTerjual} eks
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Rp {totalOmzet.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Kembali ke Gudang:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-sm">
                      {totalKembali} eks
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {event.status === 'Selesai Rekonsiliasi' ? 'Telah direkonsiliasi' : 'Belum selesai'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Status Stan Saat Ini:</span>
                    {event.status === 'Selesai Rekonsiliasi' ? (
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Tuntas & Restock Rapi
                      </span>
                    ) : (
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                        Sisa di Stan: {sisaStan} eks
                      </span>
                    )}
                    {event.target_omzet ? (
                      <span className="text-[10px] text-slate-400 block">
                        Target: Rp {event.target_omzet.toLocaleString('id-ID')}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>RINCIAN BUKU KONSINYASI BAZAAR ({(event.items || []).length} JUDUL)</span>
                    <span className="font-normal text-slate-500">
                      Omzet Saat Ini: <strong className="font-mono text-slate-900 dark:text-white">Rp {totalOmzet.toLocaleString('id-ID')}</strong>
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold bg-white dark:bg-slate-900">
                        <tr>
                          <th className="p-2.5">Judul Buku</th>
                          <th className="p-2.5 text-center w-20">Dibawa</th>
                          <th className="p-2.5 text-center w-20">Terjual</th>
                          <th className="p-2.5 text-center w-20">Kembali</th>
                          <th className="p-2.5 text-right w-28">Harga Satuan</th>
                          <th className="p-2.5 text-right w-32">Subtotal Omzet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {(!event.items || event.items.length === 0) ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-slate-400">
                              Belum ada alokasi buku dari gudang. Silakan klik tombol <strong>"Alokasikan Buku dari Gudang"</strong> di bawah.
                            </td>
                          </tr>
                        ) : (
                          event.items.map(it => {
                            const b = books.find(book => book.id === it.buku_id);
                            const itemOmzet = (it.qty_terjual || 0) * (it.harga_satuan || 0);

                            return (
                              <tr key={it.buku_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <td className="p-2.5 font-medium text-slate-900 dark:text-white">
                                  {b?.judul || 'Buku'}
                                </td>
                                <td className="p-2.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                                  {it.qty_dibawa}
                                </td>
                                <td className="p-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {it.qty_terjual || 0}
                                </td>
                                <td className="p-2.5 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                                  {it.qty_kembali || 0}
                                </td>
                                <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                                  Rp {(it.harga_satuan || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                                  Rp {itemOmzet.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Event Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    {event.catatan && (
                      <p className="italic text-[11px] truncate max-w-md">
                        <strong>Catatan:</strong> {event.catatan}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setAllocatingEvent(event);
                        setIsAllocationModalOpen(true);
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>{event.stok_gudang_dipotong ? 'Ubah / Tambah Alokasi' : 'Alokasikan Buku dari Gudang'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReconcilingEvent(event);
                        setIsReconciliationModalOpen(true);
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Rekonsiliasi Selesai & Restock</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <BazaarEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleCreateOrUpdateEvent}
        initialEvent={editingEvent}
      />

      <BazaarAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setAllocatingEvent(null);
        }}
        event={allocatingEvent}
        books={books}
        onConfirmAllocation={allocateBazaarBooks}
      />

      <BazaarReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => {
          setIsReconciliationModalOpen(false);
          setReconcilingEvent(null);
        }}
        event={reconcilingEvent}
        books={books}
        onConfirmReconcile={reconcileBazaarEvent}
      />

      <BazaarManifestModal
        isOpen={isManifestModalOpen}
        onClose={() => {
          setIsManifestModalOpen(false);
          setManifestEvent(null);
        }}
        event={manifestEvent}
        books={books}
      />

      {/* Confirm Delete Modal */}
      {deleteConfirmEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Hapus Agenda Bazaar?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus agenda bazaar <strong>"{deleteConfirmEvent.nama_event}"</strong>?
              {deleteConfirmEvent.stok_gudang_dipotong && deleteConfirmEvent.status !== 'Selesai Rekonsiliasi' && (
                <span className="block mt-2 font-semibold text-amber-600 dark:text-amber-400">
                  ⚠️ Perhatian: Stok buku yang dialokasikan dan belum direkonsiliasi akan otomatis dikembalikan ke stok gudang.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteBazaarEvent(deleteConfirmEvent.id);
                  setDeleteConfirmEvent(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
