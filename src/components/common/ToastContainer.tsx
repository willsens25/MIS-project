import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification, ToastType, ToastCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  X,
  ChevronRight,
  ChevronDown,
  Package,
  FileCheck,
  Truck,
  Wallet,
  SlidersHorizontal,
  Filter,
  Check,
  Sparkles,
  RotateCcw,
  Settings,
  Printer,
  Eye,
  EyeOff
} from 'lucide-react';
import { playPleasantClickSound } from '../../utils/soundEffects';

export type ToastFilterOption = 'all' | 'stock' | 'finance' | 'order' | 'production' | 'logistic' | 'system';

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (isHovered) return;

    const startTime = Date.now();
    const initialProgress = progress;
    const remainingMs = Math.max(0, (initialProgress / 100) * duration);

    if (remainingMs <= 0) {
      onDismissRef.current(toast.id);
      return;
    }

    const dismissTimeout = setTimeout(() => {
      onDismissRef.current(toast.id);
    }, remainingMs);

    const intervalTime = 50;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.max(0, initialProgress - (elapsed / duration) * 100);
      setProgress(currentProgress);
    }, intervalTime);

    return () => {
      clearTimeout(dismissTimeout);
      clearInterval(progressInterval);
    };
  }, [isHovered, duration, toast.id]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'urgent':
        return <Bell className="w-5 h-5 text-red-500 shrink-0 animate-bounce" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-cyan-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 shadow-emerald-500/10 dark:border-emerald-500/30';
      case 'warning':
        return 'border-amber-500/40 shadow-amber-500/10 dark:border-amber-500/30';
      case 'error':
        return 'border-rose-500/40 shadow-rose-500/10 dark:border-rose-500/30';
      case 'urgent':
        return 'border-red-500/50 shadow-red-500/20 ring-1 ring-red-500/30 dark:border-red-500/40';
      case 'info':
      default:
        return 'border-cyan-500/40 shadow-cyan-500/10 dark:border-cyan-500/30';
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'error':
        return 'bg-rose-500';
      case 'urgent':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-cyan-500';
    }
  };

  const getCategoryBadge = () => {
    if (!toast.category) return null;
    const labels: Record<string, { text: string; bg: string; icon: React.ReactNode }> = {
      order: {
        text: 'INVOICE',
        bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        icon: <FileCheck className="w-2.5 h-2.5 mr-0.5" />
      },
      stock: {
        text: 'GUDANG',
        bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        icon: <Package className="w-2.5 h-2.5 mr-0.5" />
      },
      finance: {
        text: 'KEUANGAN',
        bg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        icon: <Wallet className="w-2.5 h-2.5 mr-0.5" />
      },
      production: {
        text: 'SPK CETAK',
        bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        icon: <Printer className="w-2.5 h-2.5 mr-0.5" />
      },
      logistic: {
        text: 'LOGISTIK',
        bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        icon: <Truck className="w-2.5 h-2.5 mr-0.5" />
      },
      system: {
        text: 'SISTEM',
        bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
        icon: <Settings className="w-2.5 h-2.5 mr-0.5" />
      }
    };
    const b = labels[toast.category];
    if (!b) return null;
    return (
      <span className={`inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${b.bg}`}>
        {b.icon}
        {b.text}
      </span>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 30, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full sm:w-[390px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border shadow-xl overflow-hidden p-3.5 flex flex-col gap-2 transition-all ${getBorderColor()}`}
    >
      {/* Top row: Icon, Category, Title, Timestamp & Close */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getCategoryBadge()}
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                {toast.title}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {toast.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 -mt-0.5 -mr-1">
          <span className="text-[9px] text-slate-400 font-mono">
            {toast.timestamp || 'Baru'}
          </span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action button if provided */}
      {toast.actionLabel && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              if (toast.onAction) {
                toast.onAction();
              }
              onDismiss(toast.id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
          >
            <span>{toast.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${getProgressBarColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
  activeFilter?: ToastFilterOption;
  onFilterChange?: (filter: ToastFilterOption) => void;
}

const CATEGORIES_CONFIG: Array<{
  id: ToastFilterOption;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
}> = [
  {
    id: 'all',
    label: 'Semua Notifikasi',
    shortLabel: 'Semua',
    icon: Bell,
    color: 'text-indigo-500',
    activeClass: 'bg-indigo-600 text-white shadow-xs'
  },
  {
    id: 'stock',
    label: 'Stok Gudang',
    shortLabel: 'Stok',
    icon: Package,
    color: 'text-amber-500',
    activeClass: 'bg-amber-600 text-white shadow-xs'
  },
  {
    id: 'finance',
    label: 'Keuangan & Kas',
    shortLabel: 'Keuangan',
    icon: Wallet,
    color: 'text-cyan-500',
    activeClass: 'bg-cyan-600 text-white shadow-xs'
  },
  {
    id: 'order',
    label: 'Invoice / Penjualan',
    shortLabel: 'Invoice',
    icon: FileCheck,
    color: 'text-emerald-500',
    activeClass: 'bg-emerald-600 text-white shadow-xs'
  },
  {
    id: 'production',
    label: 'Produksi & SPK',
    shortLabel: 'SPK',
    icon: Printer,
    color: 'text-indigo-400',
    activeClass: 'bg-indigo-700 text-white shadow-xs'
  },
  {
    id: 'logistic',
    label: 'Logistik & Kirim',
    shortLabel: 'Logistik',
    icon: Truck,
    color: 'text-blue-500',
    activeClass: 'bg-blue-600 text-white shadow-xs'
  }
];

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onClearAll,
  activeFilter: controlledFilter,
  onFilterChange
}) => {
  // App context for toast simulation
  let appCtx: ReturnType<typeof useApp> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    appCtx = useApp();
  } catch {
    appCtx = null;
  }

  // Active Category Filter State (persisted in localStorage)
  const [internalFilter, setInternalFilter] = useState<ToastFilterOption>(() => {
    try {
      const saved = localStorage.getItem('mis_toast_filter_category');
      return (saved as ToastFilterOption) || 'all';
    } catch {
      return 'all';
    }
  });

  const activeCategory = controlledFilter || internalFilter;

  // Filter Popover / Preference Panel Toggle
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [isFloatingBadgeOpen, setIsFloatingBadgeOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowFilterSettings(false);
      }
    };
    if (showFilterSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterSettings]);

  const handleSelectFilter = (filterKey: ToastFilterOption) => {
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
    setInternalFilter(filterKey);
    try {
      localStorage.setItem('mis_toast_filter_category', filterKey);
    } catch {
      // ignore
    }
    if (onFilterChange) {
      onFilterChange(filterKey);
    }
  };

  // Compute counts per category
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: toasts.length,
      stock: 0,
      finance: 0,
      order: 0,
      production: 0,
      logistic: 0,
      system: 0
    };
    toasts.forEach(t => {
      if (t.category && res[t.category] !== undefined) {
        res[t.category] += 1;
      }
    });
    return res;
  }, [toasts]);

  // Filtered toasts to render
  const filteredToasts = useMemo(() => {
    if (activeCategory === 'all') {
      return toasts;
    }
    return toasts.filter(t => t.category === activeCategory);
  }, [toasts, activeCategory]);

  const hiddenCount = toasts.length - filteredToasts.length;

  const currentCategoryConfig = CATEGORIES_CONFIG.find(c => c.id === activeCategory) || CATEGORIES_CONFIG[0];

  // If there are no toasts and the user is not opening the settings popover, render the subtle filter pill
  if (toasts.length === 0 && !showFilterSettings && !isFloatingBadgeOpen) {
    // Discreet mini-button if non-'all' filter is active, so the user remembers that a filter is active
    if (activeCategory !== 'all') {
      return (
        <div className="fixed top-3 right-4 z-[9990] pointer-events-auto print:hidden">
          <button
            onClick={() => setShowFilterSettings(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 rounded-full shadow-sm hover:bg-amber-100 transition-colors cursor-pointer"
            title={`Filter Notifikasi Aktif: Hanya ${currentCategoryConfig.label}. Klik untuk mengubah.`}
          >
            <Filter className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Filter: {currentCategoryConfig.shortLabel}</span>
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-[96vw] sm:max-w-[410px] pointer-events-auto print:hidden"
    >
      {/* Toast Filter & Controls Header Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg p-2 flex flex-col gap-1.5 transition-all">
        {/* Top Control Bar: Active Filter Pill, Filter Options Toggle & Batch Clear */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setShowFilterSettings(!showFilterSettings)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeCategory !== 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Atur Jenis Notifikasi Toast (Filter Kategori)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                {activeCategory === 'all' ? 'Filter Notifikasi' : `Filter: ${currentCategoryConfig.shortLabel}`}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilterSettings ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Badge indicator */}
            {toasts.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700">
                {filteredToasts.length}/{toasts.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Batch Clear Button if there are toasts */}
            {toasts.length > 0 && onClearAll && (
              <button
                onClick={onClearAll}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                title="Tutup semua notifikasi saat ini"
              >
                Tutup Semua
              </button>
            )}

            {/* Close Settings popover if open */}
            {showFilterSettings && (
              <button
                onClick={() => setShowFilterSettings(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup menu filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Horizontal Chips Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES_CONFIG.map(cat => {
            const Icon = cat.icon;
            const count = counts[cat.id] || 0;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectFilter(cat.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? cat.activeClass
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50'
                }`}
                title={`Pilih notifikasi ${cat.label}`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : cat.color}`} />
                <span>{cat.shortLabel}</span>
                {count > 0 && (
                  <span
                    className={`ml-0.5 px-1 rounded-full text-[9px] font-mono leading-none ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Expandable Filter Settings Popover Panel */}
        <AnimatePresence>
          {showFilterSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200/80 dark:border-slate-800 pt-2.5 mt-1 flex flex-col gap-2.5 text-xs"
            >
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pilih Kategori Yang Ditampilkan
                </span>
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => handleSelectFilter('all')}
                    className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset ke Semua</span>
                  </button>
                )}
              </div>

              {/* Grid of Category Selectors */}
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES_CONFIG.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectFilter(cat.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 font-bold text-indigo-900 dark:text-indigo-200 shadow-2xs'
                          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`p-1 rounded-lg ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] leading-tight truncate">{cat.label}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                            {counts[cat.id] || 0} notifikasi aktif
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Simulation / Testing Buttons */}
              {appCtx?.simulateToastNotification && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold">Simulasi Uji Notifikasi (Real-time Preview):</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => appCtx?.simulateToastNotification('stock')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                    >
                      ⚠️ Tes Stok Menipis
                    </button>
                    <button
                      onClick={() => appCtx?.simulateToastNotification('finance')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-300 transition-colors cursor-pointer"
                    >
                      💰 Tes Invoice Lunas
                    </button>
                    <button
                      onClick={() => appCtx?.simulateToastNotification('order')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      📝 Tes Order Baru
                    </button>
                    <button
                      onClick={() => appCtx?.simulateToastNotification('production')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      🏭 Tes SPK Cetak
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notice Banner when some notifications are hidden by the active filter */}
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 shadow-xs"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] truncate">
              {hiddenCount} notifikasi disembunyikan oleh filter ({currentCategoryConfig.shortLabel}).
            </span>
          </div>
          <button
            onClick={() => handleSelectFilter('all')}
            className="text-[10px] font-bold underline hover:text-amber-900 dark:hover:text-amber-200 shrink-0 cursor-pointer ml-1"
          >
            Lihat Semua
          </button>
        </motion.div>
      )}

      {/* Render Filtered Toast Notifications */}
      <AnimatePresence mode="popLayout">
        {filteredToasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
