import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  X,
  GripVertical,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Wallet,
  Truck,
  ShoppingBag,
  Factory,
  BookOpen,
  Users,
  Sparkles,
  Move,
  Database,
  Download,
  Upload,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  DashboardCardConfig,
  DashboardCardCategory,
  LayoutPresetKey,
  LAYOUT_PRESETS
} from '../../types/dashboardLayout';

interface DashboardLayoutConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DashboardCardConfig[];
  columns: 2 | 3 | 4;
  activePreset?: LayoutPresetKey;
  density?: 'comfortable' | 'compact';
  lastSaved?: string;
  storageKey?: string;
  userName?: string;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onMoveCard: (cardId: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (cardId: string) => void;
  onApplyPreset: (presetKey: LayoutPresetKey) => void;
  onSetColumns: (cols: 2 | 3 | 4) => void;
  onSetDensity?: (density: 'comfortable' | 'compact') => void;
  onResetToDefault: () => void;
  onEnableInlineDragMode: () => void;
  onExportConfig?: () => string;
  onImportConfig?: (json: string) => { success: boolean; message: string };
  onSaveExplicit?: () => void;
}

export const DashboardLayoutConfiguratorModal: React.FC<DashboardLayoutConfiguratorModalProps> = ({
  isOpen,
  onClose,
  cards,
  columns,
  activePreset,
  density = 'comfortable',
  lastSaved,
  storageKey = 'sapa_dashboard_layout',
  userName = 'Pengguna',
  onReorder,
  onMoveCard,
  onToggleVisibility,
  onApplyPreset,
  onSetColumns,
  onSetDensity,
  onResetToDefault,
  onEnableInlineDragMode,
  onExportConfig,
  onImportConfig,
  onSaveExplicit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showImportBox, setShowImportBox] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder(draggedIndex, targetIndex);
      showToast('Urutan kartu berhasil diperbarui & disimpan ke LocalStorage!');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleExport = () => {
    if (onExportConfig) {
      const json = onExportConfig();
      navigator.clipboard.writeText(json).then(
        () => {
          showToast('Konfigurasi tata letak berhasil disalin ke clipboard!');
        },
        () => {
          showToast('Berhasil menyiapkan file konfigurasi JSON.');
        }
      );
    }
  };

  const handleApplyImport = () => {
    if (!importJsonText.trim()) {
      showToast('Harap tempel teks JSON konfigurasi.');
      return;
    }
    if (onImportConfig) {
      const res = onImportConfig(importJsonText);
      showToast(res.message);
      if (res.success) {
        setShowImportBox(false);
        setImportJsonText('');
      }
    }
  };

  const handleSaveAndClose = () => {
    if (onSaveExplicit) {
      onSaveExplicit();
    }
    showToast('Preferensi tata letak tersimpan di LocalStorage browser!');
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const filteredCards = selectedCategory === 'all'
    ? cards
    : cards.filter((c) => c.category === selectedCategory);

  const getCategoryBadgeClass = (category: DashboardCardCategory) => {
    switch (category) {
      case 'keuangan':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'keanggotaan':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'marketing':
        return 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'logistik':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'produksi':
        return 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800';
      case 'penerbitan':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'laporan':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const formattedSavedTime = lastSaved
    ? new Date(lastSaved).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Sesi Aktif';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Dashboard Layout Configurator
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  LocalStorage Persistent
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Susun urutan kartu & simpan preferensi secara otomatis ke LocalStorage agar konsisten di setiap sesi baru.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Pengaturan"
            aria-label="Tutup Pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* LocalStorage Persistence Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-indigo-50/40 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-indigo-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  Tersimpan Otomatis di LocalStorage Browser
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                    ({storageKey})
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Akun: <strong className="text-slate-800 dark:text-slate-200">{userName}</strong> • Sinkronisasi terakhir: {formattedSavedTime}. Tata letak akan selalu konsisten saat sesi baru dimulai.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleExport}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Salin konfigurasi JSON ke clipboard"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ekspor</span>
              </button>
              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Impor konfigurasi dari teks JSON"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span>Impor</span>
              </button>
            </div>
          </div>

          {/* Collapsible Import Box */}
          {showImportBox && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                Tempel Kode JSON Konfigurasi Layout:
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"columns": 4, "cards": [...]}'
                rows={3}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportBox(false)}
                  className="px-3 py-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Terapkan & Simpan ke LocalStorage
                </button>
              </div>
            </div>
          )}

          {/* Quick Division Priority Presets */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Template Prioritas Divisi Cepat (1-Klik)
              </label>
              <span className="text-[11px] text-slate-400">Pilih alur kerja divisi Anda</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LAYOUT_PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onApplyPreset(preset.id);
                      showToast(`Template "${preset.name}" diterapkan & disimpan ke LocalStorage!`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{preset.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout Density & Columns Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Columns selector */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Jumlah Kolom Grid
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lebar susunan kartu per baris layar desktop.
                </p>
              </div>

              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => onSetColumns(2)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    columns === 2
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  2 Kolom
                </button>
                <button
                  type="button"
                  onClick={() => onSetColumns(3)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    columns === 3
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  3 Kolom
                </button>
                <button
                  type="button"
                  onClick={() => onSetColumns(4)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    columns === 4
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  4 Kolom
                </button>
              </div>
            </div>

            {/* Density Selector */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Kerapatan Tampilan Kartu
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tingkat padding & proporsi teks metrik kartu.
                </p>
              </div>

              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => onSetDensity && onSetDensity('comfortable')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    density === 'comfortable'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Nyaman (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => onSetDensity && onSetDensity('compact')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    density === 'compact'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Kompak (Rapat)
                </button>
              </div>
            </div>
          </div>

          {/* Reorderable Cards Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Urutan Prioritas Kartu ({cards.filter(c => c.visible).length} Aktif dari {cards.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Tahan & geser ikon titik enam (⠿) atau gunakan panah naik/turun untuk mengatur prioritas urutan.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
                {['all', 'keuangan', 'logistik', 'marketing', 'produksi', 'penerbitan'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of draggable / reorderable cards */}
            <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/40 dark:bg-slate-950/20 max-h-[340px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredCards.map((card) => {
                  const globalIndex = cards.findIndex((c) => c.id === card.id);
                  const isOver = dragOverIndex === globalIndex;
                  const isCurrentDrag = draggedIndex === globalIndex;

                  return (
                    <motion.div
                      layout
                      layoutId={`modal-card-${card.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { type: 'spring', damping: 28, stiffness: 320 },
                        opacity: { duration: 0.2 }
                      }}
                      key={card.id}
                      draggable
                      onDragStart={((e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, globalIndex)) as any}
                      onDragOver={(e) => handleDragOver(e, globalIndex)}
                      onDrop={(e) => handleDrop(e, globalIndex)}
                      onDragEnd={handleDragEnd as any}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border select-none ${
                        isCurrentDrag
                          ? 'opacity-40 bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40'
                          : isOver
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-400'
                          : card.visible
                          ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                          : 'bg-slate-100/70 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md shrink-0"
                          title="Tahan lalu geser untuk mengubah urutan"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Order Number Badge */}
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {globalIndex + 1}
                        </span>

                        {/* Title and Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {card.title}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                                card.category
                              )}`}
                            >
                              {card.divisiCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      {/* Controls (Move Up, Down, Visibility) */}
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => {
                            onMoveCard(card.id, 'up');
                            showToast(`"${card.title}" dipindahkan ke atas & disimpan`);
                          }}
                          disabled={globalIndex === 0}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Pindahkan ke urutan sebelumnya (ke atas)"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => {
                            onMoveCard(card.id, 'down');
                            showToast(`"${card.title}" dipindahkan ke bawah & disimpan`);
                          }}
                          disabled={globalIndex === cards.length - 1}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="Pindahkan ke urutan setelahnya (ke bawah)"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          type="button"
                          onClick={() => {
                            onToggleVisibility(card.id);
                            showToast(
                              card.visible
                                ? `"${card.title}" disembunyikan & disimpan ke LocalStorage`
                                : `"${card.title}" ditampilkan kembali & disimpan ke LocalStorage`
                            );
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ml-1 ${
                            card.visible
                              ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                          }`}
                          title={card.visible ? 'Sembunyikan kartu ini' : 'Tampilkan kartu ini'}
                        >
                          {card.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                showToast('Tata letak dikembalikan ke pengaturan awal default!');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEnableInlineDragMode();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Mode Drag Langsung di Grid</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center justify-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Preferensi ke LocalStorage</span>
          </button>
        </div>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 z-50 pointer-events-none"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
