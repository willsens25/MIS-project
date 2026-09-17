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
  Move
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
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onMoveCard: (cardId: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (cardId: string) => void;
  onApplyPreset: (presetKey: LayoutPresetKey) => void;
  onSetColumns: (cols: 2 | 3 | 4) => void;
  onResetToDefault: () => void;
  onEnableInlineDragMode: () => void;
}

export const DashboardLayoutConfiguratorModal: React.FC<DashboardLayoutConfiguratorModalProps> = ({
  isOpen,
  onClose,
  cards,
  columns,
  activePreset,
  onReorder,
  onMoveCard,
  onToggleVisibility,
  onApplyPreset,
  onSetColumns,
  onResetToDefault,
  onEnableInlineDragMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      showToast('Urutan kartu berhasil diperbarui!');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const filteredCards = selectedCategory === 'all'
    ? cards
    : cards.filter((c) => c.category === selectedCategory);

  const getDivisionBadgeColor = (category: DashboardCardCategory) => {
    switch (category) {
      case 'keuangan':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'logistik':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'marketing':
        return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'produksi':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'penerbitan':
        return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'keanggotaan':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'laporan':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Drag & Drop
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Susun ulang urutan kartu dashboard untuk memprioritaskan informasi divisi yang paling relevan.
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
                      showToast(`Template "${preset.name}" diterapkan!`);
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

          {/* Grid Layout Density Settings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Kerapatan Kolom Grid Dashboard
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih jumlah kartu yang ditampilkan per baris pada layar monitor/laptop.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onSetColumns(2)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  columns === 2
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                2 Kolom (Lebar)
              </button>
              <button
                type="button"
                onClick={() => onSetColumns(3)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  columns === 3
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3 Kolom (Seimbang)
              </button>
              <button
                type="button"
                onClick={() => onSetColumns(4)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  columns === 4
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                4 Kolom (Kompak)
              </button>
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
                  Tahan & geser ikon titik enam (⠿) atau gunakan panah naik/turun untuk mengatur prioritas.
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
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Cards List */}
            <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
              {filteredCards.map((card, idx) => {
                const globalIndex = cards.findIndex((c) => c.id === card.id);
                const isOver = dragOverIndex === globalIndex;
                const isDragging = draggedIndex === globalIndex;

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, globalIndex)}
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDrop={(e) => handleDrop(e, globalIndex)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 bg-white dark:bg-slate-800/80 rounded-xl border transition-all select-none ${
                      isDragging
                        ? 'opacity-40 border-dashed border-indigo-500 scale-[0.99]'
                        : isOver
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-400/40'
                        : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                    } ${!card.visible ? 'opacity-60 bg-slate-100/60 dark:bg-slate-900/60' : ''}`}
                  >
                    {/* Left: Drag Handle, Order Badge, Title */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Tahan dan geser untuk menyusun ulang"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                        #{card.order}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${getDivisionBadgeColor(card.category)}`}>
                            {card.divisiCode}
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {card.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden sm:block">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Up/Down buttons and Visibility Toggle */}
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => {
                          onMoveCard(card.id, 'up');
                          showToast(`"${card.title}" dipindahkan ke atas`);
                        }}
                        disabled={globalIndex === 0}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Pindahkan ke urutan lebih prioritas (ke atas)"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => {
                          onMoveCard(card.id, 'down');
                          showToast(`"${card.title}" dipindahkan ke bawah`);
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
                              ? `"${card.title}" disembunyikan dari dashboard`
                              : `"${card.title}" ditampilkan kembali di dashboard`
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
                  </div>
                );
              })}
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
                showToast('Tata letak dikembalikan ke pengaturan awal!');
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
            onClick={onClose}
            className="flex items-center justify-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Terapkan Tata Letak</span>
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
