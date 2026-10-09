import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  LayoutItem,
  Layout,
  ResponsiveLayouts
} from 'react-grid-layout';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Move,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  GripHorizontal,
  ArrowUpRight,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Download,
  Database,
  Lightbulb,
  X,
  ChevronRight,
  Bookmark,
  Sunrise,
  Brain,
  Moon,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  exportRglDashboardToPdf,
  RglWidgetSnapshotItem
} from '../../utils/exportPdf';
import {
  getStoredCalendarEvents,
  getTaskCompletionProgress,
  getDeadlineInfo
} from '../common/DivisionCalendarTodoView';

export interface DivisionWidgetItem {
  id: string;
  title: string;
  subtitle: string;
  defaultW: number; // out of 12 columns on lg
  defaultH: number; // rowHeight units
  minW?: number;
  minH?: number;
}

export const DIVISION_WIDGET_DEFINITIONS: Record<DivisionId, DivisionWidgetItem[]> = {
  1: [
    {
      id: 'dir-w-kas',
      title: 'Likuiditas & Saldo Kas Yayasan',
      subtitle: 'Rekapitulasi kas masuk, kas keluar, dan saldo bersih',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'dir-w-umat',
      title: 'Demografi Anggota & Sangha',
      subtitle: 'Total anggota terdaftar, Dharma Patriot, dan Sangha',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'dir-w-agenda',
      title: 'Progres Tugas & Pleno Direktorat',
      subtitle: 'Persentase penyelesaian agenda kalender direktorat',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'dir-w-lintas',
      title: 'Monitor Kinerja 6 Direktorat',
      subtitle: 'Status SPK cetak, antrean logistik, dan omset penjualan',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ],
  2: [
    {
      id: 'fin-w-arus-kas',
      title: 'Ringkasan Arus Kas & Likuiditas',
      subtitle: 'Total pemasukan, pengeluaran, dan rasio kas bersih',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'fin-w-spk',
      title: 'Antrean Persetujuan Dana Cetak (SPK)',
      subtitle: 'Pengajuan anggaran cetak dari Penerbitan yang menunggu verifikasi',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'fin-w-rekon',
      title: 'Status Rekonsiliasi & Rekening Bank',
      subtitle: 'Saldo rekening kas/bank aktif dan kecocokan mutasi',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'fin-w-tugas',
      title: 'Target Tutup Buku & Tugas Finance',
      subtitle: 'Progres penyelesaian agenda audit & pajak bulanan',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ],
  3: [
    {
      id: 'pub-w-katalog',
      title: 'Katalog Naskah & Status ISBN',
      subtitle: 'Jumlah judul buku aktif, ISBN terdaftar, dan valuasi',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'pub-w-fashili',
      title: 'Proyek Donasi Cetak Dharma (Fashili)',
      subtitle: 'Realisasi penghimpunan dana sponsor cetak buku Dharma',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'pub-w-royalti',
      title: 'Royalti Penulis & Pengajuan Cetak',
      subtitle: 'Status lisensi naskah dan pengajuan cetak ke Finance',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'pub-w-tugas',
      title: 'Agenda Redaksi & Penyuntingan Naskah',
      subtitle: 'Progres tugas proofreading dan penerbitan bulan berjalan',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ],
  4: [
    {
      id: 'mkt-w-omset',
      title: 'Performa Omset & Invoice Penjualan',
      subtitle: 'Total pendapatan pesanan lunas dan tagihan menunggu bayar',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'mkt-w-bazar',
      title: 'Event Bazar & Kampanye Pre-Order',
      subtitle: 'Alokasi stok pameran bazar dan capaian kuota PO aktif',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'mkt-w-promo',
      title: 'VLOOKUP Kupon Promo & Mitra Agen',
      subtitle: 'Kupon diskon aktif dan jaringan agen distribusi resmi',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'mkt-w-tugas',
      title: 'Jadwal Promosi & Tugas Marketing',
      subtitle: 'Progres kegiatan kampanye dan tindak lanjut pelanggan',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ],
  5: [
    {
      id: 'prd-w-output',
      title: 'Total Output Cetak & Batch Pabrikasi',
      subtitle: 'Akumulasi eksemplar buku selesai cetak dan lolos QC',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'prd-w-spk',
      title: 'SPK Siap Naik Cetak & Antrean',
      subtitle: 'Daftar pengajuan cetak yang telah disetujui Bendahara',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'prd-w-kritis',
      title: 'Deteksi Stok Buku Menipis (<25 Eks)',
      subtitle: 'Judul buku yang memerlukan prioritas cetak ulang segera',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'prd-w-tugas',
      title: 'Jadwal Mesin & Tugas Produksi',
      subtitle: 'Progres agenda pabrikasi dan perawatan kualitas cetak',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ],
  6: [
    {
      id: 'log-w-packing',
      title: 'Antrean Packing & Siap Kirim',
      subtitle: 'Pesanan lunas yang siap dikemas dan dibuatkan Surat Jalan',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'log-w-stok',
      title: 'Kapasitas Stok Fisik Gudang Utama',
      subtitle: 'Total eksemplar buku tersimpan dan nilai inventaris gudang',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'log-w-riwayat',
      title: 'Log Pengeluaran & Distribusi Kargo',
      subtitle: 'Catatan pengiriman paket ekspedisi dan hibah vihara',
      defaultW: 4,
      defaultH: 2,
      minW: 3,
      minH: 2
    },
    {
      id: 'log-w-tugas',
      title: 'Jadwal Stock Opname & Tugas Logistik',
      subtitle: 'Progres agenda audit fisik rak gudang dan pengiriman',
      defaultW: 12,
      defaultH: 2,
      minW: 6,
      minH: 2
    }
  ]
};

export interface RglNamedLayoutPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  iconType: 'morning' | 'deepwork' | 'eod' | 'custom';
  isBuiltIn?: boolean;
  layouts: ResponsiveLayouts;
  hiddenIds: string[];
  savedAt: string;
}

export interface StoredDivisionGridState {
  layouts: ResponsiveLayouts;
  hiddenIds: string[];
  isCollapsed?: boolean;
  updatedAt?: string;
  activePresetId?: string;
  presets?: RglNamedLayoutPreset[];
}

export const RGL_MASTER_STORAGE_KEY = 'mis_rgl_dashboard_layouts_v1';
export const getDivisionRglStorageKey = (divisionId: DivisionId) =>
  `mis_rgl_division_widgets_v1_div_${divisionId}`;

/**
 * Generates the 3 built-in named Preset Dashboard Layouts ('Morning Routine', 'Deep Work', 'End of Day')
 * tailored to each division's widgets so users can switch or overwrite them anytime.
 */
const buildBuiltInPresetsForDivision = (divisionId: DivisionId): RglNamedLayoutPreset[] => {
  const defs = DIVISION_WIDGET_DEFINITIONS[divisionId] || DIVISION_WIDGET_DEFINITIONS[1];
  const defaultLayouts = buildDefaultLayoutsForDivision(divisionId);
  const nowIso = new Date().toISOString();

  // 1. Morning Routine: Full overview with priority operational & task/schedule widgets prominently placed at top
  const morningLg: LayoutItem[] = defs.map((item, idx) => {
    // Move task/agenda or primary operational widget to top full-width banner on Morning Routine
    if (idx === defs.length - 1) {
      return {
        i: item.id,
        x: 0,
        y: 0,
        w: 12,
        h: 2,
        minW: item.minW || 3,
        minH: item.minH || 2
      };
    }
    const colIndex = idx % 3;
    const rowIndex = Math.floor(idx / 3) + 1;
    return {
      i: item.id,
      x: colIndex * 4,
      y: rowIndex * 2,
      w: 4,
      h: 2,
      minW: item.minW || 3,
      minH: item.minH || 2
    };
  });

  // 2. Deep Work: Distraction-free focused workspace showing only top 2 core execution widgets expanded to 6 columns each
  const deepWorkVisibleIds = defs.slice(0, 2).map(d => d.id);
  const deepWorkHiddenIds = defs.slice(2).map(d => d.id);
  const deepWorkLg: LayoutItem[] = defs.map((item, idx) => ({
    i: item.id,
    x: idx === 0 ? 0 : idx === 1 ? 6 : (idx % 3) * 4,
    y: idx < 2 ? 0 : 3,
    w: idx < 2 ? 6 : item.defaultW,
    h: idx < 2 ? 3 : item.defaultH,
    minW: item.minW || 3,
    minH: item.minH || 2
  }));

  // 3. End of Day: Audit, closing realization & task completion review layout (hides middle secondary widget, expands summary & audit logs)
  const eodHiddenIds = defs.length >= 4 ? [defs[1].id] : [];
  const eodVisibleDefs = defs.filter(d => !eodHiddenIds.includes(d.id));
  const eodLg: LayoutItem[] = defs.map(item => {
    const visIdx = eodVisibleDefs.findIndex(v => v.id === item.id);
    if (visIdx === 0) {
      return { i: item.id, x: 0, y: 0, w: 6, h: 2, minW: item.minW || 3, minH: item.minH || 2 };
    }
    if (visIdx === 1) {
      return { i: item.id, x: 6, y: 0, w: 6, h: 2, minW: item.minW || 3, minH: item.minH || 2 };
    }
    return { i: item.id, x: 0, y: 2, w: 12, h: 2, minW: item.minW || 3, minH: item.minH || 2 };
  });

  return [
    {
      id: 'morning-routine',
      name: 'Morning Routine',
      description: 'Prioritas pagi: jadwal tugas harian di baris teratas & ikhtisar seluruh metrik aktif',
      badge: 'Pagi • Ikhtisar',
      iconType: 'morning',
      isBuiltIn: true,
      layouts: mergeResponsiveLayouts(defaultLayouts, { ...defaultLayouts, lg: morningLg }, divisionId),
      hiddenIds: [],
      savedAt: nowIso
    },
    {
      id: 'deep-work',
      name: 'Deep Work',
      description: `Mode fokus tinggi: memperbesar ${deepWorkVisibleIds.length} widget eksekusi utama & menyembunyikan sisanya`,
      badge: 'Fokus • Minim Distraksi',
      iconType: 'deepwork',
      isBuiltIn: true,
      layouts: mergeResponsiveLayouts(defaultLayouts, { ...defaultLayouts, lg: deepWorkLg }, divisionId),
      hiddenIds: deepWorkHiddenIds,
      savedAt: nowIso
    },
    {
      id: 'end-of-day',
      name: 'End of Day',
      description: 'Evaluasi sore: rekapitulasi realisasi harian, penutupan kas/log, dan progres target',
      badge: 'Sore • Rekap & Audit',
      iconType: 'eod',
      isBuiltIn: true,
      layouts: mergeResponsiveLayouts(defaultLayouts, { ...defaultLayouts, lg: eodLg }, divisionId),
      hiddenIds: eodHiddenIds,
      savedAt: nowIso
    }
  ];
};

const buildDefaultLayoutsForDivision = (divisionId: DivisionId): ResponsiveLayouts => {
  const defs = DIVISION_WIDGET_DEFINITIONS[divisionId] || DIVISION_WIDGET_DEFINITIONS[1];
  let currentX = 0;
  let currentY = 0;

  const lgLayout: LayoutItem[] = defs.map(item => {
    if (currentX + item.defaultW > 12) {
      currentX = 0;
      currentY += 2;
    }
    const entry: LayoutItem = {
      i: item.id,
      x: currentX,
      y: currentY,
      w: item.defaultW,
      h: item.defaultH,
      minW: item.minW || 3,
      minH: item.minH || 2
    };
    currentX += item.defaultW;
    return entry;
  });

  const mdLayout: LayoutItem[] = defs.map((item, idx) => ({
    i: item.id,
    x: (idx % 2) * 5,
    y: Math.floor(idx / 2) * 2,
    w: item.defaultW >= 12 ? 10 : 5,
    h: item.defaultH,
    minW: 3,
    minH: 2
  }));

  const smLayout: LayoutItem[] = defs.map((item, idx) => ({
    i: item.id,
    x: 0,
    y: idx * 2,
    w: 6,
    h: item.defaultH,
    minW: 3,
    minH: 2
  }));

  return { lg: lgLayout, md: mdLayout, sm: smLayout };
};

/**
 * Merges incoming layouts from React Grid Layout with existing stored layouts,
 * preserving coordinates of hidden widgets and enforcing minW/minH constraints.
 */
const mergeResponsiveLayouts = (
  existingLayouts: ResponsiveLayouts,
  incomingLayouts: ResponsiveLayouts,
  divisionId: DivisionId
): ResponsiveLayouts => {
  const defaults = buildDefaultLayoutsForDivision(divisionId);
  const defs = DIVISION_WIDGET_DEFINITIONS[divisionId] || DIVISION_WIDGET_DEFINITIONS[1];
  const breakpoints: Array<'lg' | 'md' | 'sm'> = ['lg', 'md', 'sm'];
  const result: ResponsiveLayouts = {};

  breakpoints.forEach(bp => {
    const defaultList = defaults[bp] || [];
    const existingList = existingLayouts[bp] || defaultList;
    const incomingList = incomingLayouts[bp] || [];

    result[bp] = defs.map(def => {
      const incomingItem = incomingList.find(item => item.i === def.id);
      const existingItem = existingList.find(item => item.i === def.id);
      const fallbackItem = defaultList.find(item => item.i === def.id) || {
        i: def.id,
        x: 0,
        y: 0,
        w: def.defaultW,
        h: def.defaultH
      };

      const source = incomingItem || existingItem || fallbackItem;
      return {
        i: def.id,
        x: typeof source.x === 'number' && Number.isFinite(source.x) ? source.x : fallbackItem.x,
        y: typeof source.y === 'number' && Number.isFinite(source.y) ? source.y : fallbackItem.y,
        w: typeof source.w === 'number' && Number.isFinite(source.w) ? source.w : fallbackItem.w,
        h: typeof source.h === 'number' && Number.isFinite(source.h) ? source.h : fallbackItem.h,
        minW: def.minW || 3,
        minH: def.minH || 2
      };
    });
  });

  return result;
};

/**
 * Deeply checks whether any widget's position (x, y) or size (w, h) changed across breakpoints.
 */
const hasRglLayoutsChanged = (prev: ResponsiveLayouts, next: ResponsiveLayouts): boolean => {
  const breakpoints: Array<'lg' | 'md' | 'sm'> = ['lg', 'md', 'sm'];
  for (const bp of breakpoints) {
    const prevList = prev[bp] || [];
    const nextList = next[bp] || [];
    if (prevList.length !== nextList.length) return true;

    for (const nextItem of nextList) {
      const prevItem = prevList.find(p => p.i === nextItem.i);
      if (!prevItem) return true;
      if (
        prevItem.x !== nextItem.x ||
        prevItem.y !== nextItem.y ||
        prevItem.w !== nextItem.w ||
        prevItem.h !== nextItem.h
      ) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Loads and validates a division's RGL widget configuration from localStorage upon mount.
 */
const loadPersistedDivisionGridState = (divisionId: DivisionId): StoredDivisionGridState => {
  const storageKey = getDivisionRglStorageKey(divisionId);
  const defaultLayouts = buildDefaultLayoutsForDivision(divisionId);
  const validWidgetIds = new Set(
    (DIVISION_WIDGET_DEFINITIONS[divisionId] || DIVISION_WIDGET_DEFINITIONS[1]).map(d => d.id)
  );

  try {
    // 1. Check division-specific storage key first, then master storage key
    let raw = localStorage.getItem(storageKey);
    if (!raw) {
      const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
      if (masterRaw) {
        const masterParsed = JSON.parse(masterRaw);
        if (masterParsed && masterParsed[divisionId]) {
          raw = JSON.stringify(masterParsed[divisionId]);
        }
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.layouts && typeof parsed.layouts === 'object') {
        const hydratedLayouts = mergeResponsiveLayouts(defaultLayouts, parsed.layouts, divisionId);
        const validHiddenIds = Array.isArray(parsed.hiddenIds)
          ? parsed.hiddenIds.filter((id: string) => validWidgetIds.has(id))
          : [];

        const builtInPresets = buildBuiltInPresetsForDivision(divisionId);
        let mergedPresets: RglNamedLayoutPreset[] = builtInPresets;

        if (Array.isArray(parsed.presets) && parsed.presets.length > 0) {
          const storedPresets: RglNamedLayoutPreset[] = parsed.presets
            .filter((p: RglNamedLayoutPreset) => p && typeof p.id === 'string' && typeof p.name === 'string')
            .map((p: RglNamedLayoutPreset) => ({
              ...p,
              layouts: mergeResponsiveLayouts(defaultLayouts, p.layouts || defaultLayouts, divisionId),
              hiddenIds: Array.isArray(p.hiddenIds)
                ? p.hiddenIds.filter((id: string) => validWidgetIds.has(id))
                : []
            }));

          // Ensure the 3 built-in presets ('Morning Routine', 'Deep Work', 'End of Day') always exist
          const storedIds = new Set(storedPresets.map(p => p.id));
          const missingBuiltIns = builtInPresets.filter(b => !storedIds.has(b.id));
          mergedPresets = [...missingBuiltIns, ...storedPresets];
        }

        return {
          layouts: hydratedLayouts,
          hiddenIds: validHiddenIds,
          isCollapsed: Boolean(parsed.isCollapsed),
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          activePresetId: typeof parsed.activePresetId === 'string' ? parsed.activePresetId : 'default',
          presets: mergedPresets
        };
      }
    }
  } catch {
    // Ignore storage read errors and fall back to defaults
  }

  const initial: StoredDivisionGridState = {
    layouts: defaultLayouts,
    hiddenIds: [],
    isCollapsed: false,
    updatedAt: new Date().toISOString(),
    activePresetId: 'default',
    presets: buildBuiltInPresetsForDivision(divisionId)
  };

  // Seed initial state into localStorage on first mount
  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
    const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
    const masterObj = masterRaw ? JSON.parse(masterRaw) : {};
    masterObj[divisionId] = initial;
    localStorage.setItem(RGL_MASTER_STORAGE_KEY, JSON.stringify(masterObj));
  } catch {
    // ignore
  }

  return initial;
};

interface DivisionWidgetGridProps {
  divisionId: DivisionId;
  onNavigateSubTab?: (subTab: string) => void;
}

export const DivisionWidgetGrid: React.FC<DivisionWidgetGridProps> = ({
  divisionId,
  onNavigateSubTab
}) => {
  const {
    divisiList,
    mutasis,
    orders,
    books,
    pengajuans,
    accounts,
    identitasList,
    bazaarEvents,
    preOrders,
    donasiProyeks,
    royaltiPenulisList,
    productionLogs,
    penyalurans,
    logisticLogs,
    promos,
    currentUser,
    setCurrentSubTab,
    showToast
  } = useApp();

  const storageKey = getDivisionRglStorageKey(divisionId);
  const defs = useMemo(
    () => DIVISION_WIDGET_DEFINITIONS[divisionId] || DIVISION_WIDGET_DEFINITIONS[1],
    [divisionId]
  );

  const loadInitialState = useCallback((): StoredDivisionGridState => {
    return loadPersistedDivisionGridState(divisionId);
  }, [divisionId]);

  const [gridState, setGridState] = useState<StoredDivisionGridState>(() => loadInitialState());
  const [layoutResetKey, setLayoutResetKey] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportStatus, setPdfExportStatus] = useState<string>('');
  const [pdfExportMenuOpen, setPdfExportMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [highlightedWidgetId, setHighlightedWidgetId] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState(() => getStoredCalendarEvents());
  const { width: containerWidth, containerRef } = useContainerWidth({ initialWidth: 1120 });

  // Contextual Idle Tip Toast State (triggers when user spends >60s on dashboard view without widget interaction)
  const IDLE_TIP_THRESHOLD_SECONDS = 60;
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [activeTipIndex, setActiveTipIndex] = useState<number | null>(null);
  const lastTipIndexRef = useRef<number>(-1);
  const lastWidgetInteractionAtRef = useRef<number>(Date.now());
  const idleTipShownForCurrentCycleRef = useRef<boolean>(false);

  // Hydrate saved RGL state upon mount and when divisionId changes
  useEffect(() => {
    setGridState(loadInitialState());
    setIsEditMode(false);
  }, [divisionId, loadInitialState]);

  // Listen for cross-tab localStorage updates so RGL state stays in sync
  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === storageKey || e.key === RGL_MASTER_STORAGE_KEY) {
        setGridState(loadPersistedDivisionGridState(divisionId));
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [divisionId, storageKey]);

  useEffect(() => {
    const syncCal = () => setCalendarEvents(getStoredCalendarEvents());
    window.addEventListener('mis-calendar-events-updated', syncCal);
    return () => window.removeEventListener('mis-calendar-events-updated', syncCal);
  }, []);

  const persistState = useCallback(
    (nextState: StoredDivisionGridState) => {
      const stampedState: StoredDivisionGridState = {
        ...nextState,
        updatedAt: new Date().toISOString()
      };
      setGridState(stampedState);
      try {
        localStorage.setItem(storageKey, JSON.stringify(stampedState));
        const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
        const masterObj = masterRaw ? JSON.parse(masterRaw) : {};
        masterObj[divisionId] = stampedState;
        localStorage.setItem(RGL_MASTER_STORAGE_KEY, JSON.stringify(masterObj));
      } catch {
        // ignore quota errors
      }
    },
    [storageKey, divisionId]
  );

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  /**
   * Automatically persists any detected change in widget positions (x, y) or sizes (w, h)
   * to localStorage whenever React Grid Layout emits a layout update.
   */
  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      setGridState(prev => {
        const mergedLayouts = mergeResponsiveLayouts(prev.layouts, allLayouts, divisionId);
        if (!hasRglLayoutsChanged(prev.layouts, mergedLayouts)) {
          return prev;
        }
        const nextState: StoredDivisionGridState = {
          ...prev,
          layouts: mergedLayouts,
          updatedAt: new Date().toISOString()
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextState));
          const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
          const masterObj = masterRaw ? JSON.parse(masterRaw) : {};
          masterObj[divisionId] = nextState;
          localStorage.setItem(RGL_MASTER_STORAGE_KEY, JSON.stringify(masterObj));
        } catch {
          // ignore
        }
        return nextState;
      });
    },
    [divisionId, storageKey]
  );

  // Record user interaction with any dashboard widget and reset the 60s idle timer
  const registerWidgetInteraction = useCallback(() => {
    lastWidgetInteractionAtRef.current = Date.now();
    idleTipShownForCurrentCycleRef.current = false;
    setIdleSeconds(0);
  }, []);

  const handleDragOrResizeStop = useCallback(
    (currentLayout: Layout) => {
      registerWidgetInteraction();
      setGridState(prev => {
        const mergedLayouts = mergeResponsiveLayouts(
          prev.layouts,
          { ...prev.layouts, lg: currentLayout },
          divisionId
        );
        const nextState: StoredDivisionGridState = {
          ...prev,
          layouts: mergedLayouts,
          updatedAt: new Date().toISOString()
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextState));
          const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
          const masterObj = masterRaw ? JSON.parse(masterRaw) : {};
          masterObj[divisionId] = nextState;
          localStorage.setItem(RGL_MASTER_STORAGE_KEY, JSON.stringify(masterObj));
        } catch {
          // ignore
        }
        return nextState;
      });
      triggerToast('Posisi & ukuran widget disimpan ke LocalStorage!');
    },
    [divisionId, storageKey]
  );

  const handleToggleWidgetVisibility = (widgetId: string, title: string) => {
    registerWidgetInteraction();
    const isCurrentlyHidden = gridState.hiddenIds.includes(widgetId);
    const nextHidden = isCurrentlyHidden
      ? gridState.hiddenIds.filter(id => id !== widgetId)
      : [...gridState.hiddenIds, widgetId];

    persistState({
      ...gridState,
      hiddenIds: nextHidden
    });
    triggerToast(
      isCurrentlyHidden
        ? `Widget "${title}" ditampilkan kembali.`
        : `Widget "${title}" disembunyikan dari beranda.`
    );
  };

  const handleQuickResizeWidget = (widgetId: string, deltaW: number, deltaH: number) => {
    registerWidgetInteraction();
    const currentLg = gridState.layouts.lg || buildDefaultLayoutsForDivision(divisionId).lg || [];
    const updatedLg = currentLg.map(item => {
      if (item.i !== widgetId) return item;
      const nextW = Math.min(12, Math.max(item.minW || 3, item.w + deltaW));
      const nextH = Math.min(4, Math.max(item.minH || 2, item.h + deltaH));
      return { ...item, w: nextW, h: nextH };
    });

    persistState({
      ...gridState,
      layouts: {
        ...gridState.layouts,
        lg: updatedLg
      }
    });
    triggerToast('Ukuran widget berhasil diperbarui!');
  };

  const isLayoutCustomized = useMemo(() => {
    const defaultLayouts = buildDefaultLayoutsForDivision(divisionId);
    return (
      gridState.hiddenIds.length > 0 ||
      hasRglLayoutsChanged(defaultLayouts, gridState.layouts)
    );
  }, [divisionId, gridState.hiddenIds, gridState.layouts]);

  const handleResetDefault = useCallback(() => {
    try {
      // Clear saved React Grid Layout configuration from localStorage
      localStorage.removeItem(storageKey);
      const masterRaw = localStorage.getItem(RGL_MASTER_STORAGE_KEY);
      if (masterRaw) {
        const masterObj = JSON.parse(masterRaw);
        if (masterObj && typeof masterObj === 'object') {
          delete masterObj[divisionId];
          localStorage.setItem(RGL_MASTER_STORAGE_KEY, JSON.stringify(masterObj));
        }
      }
    } catch {
      // ignore storage errors
    }

    const defaultState: StoredDivisionGridState = {
      layouts: buildDefaultLayoutsForDivision(divisionId),
      hiddenIds: [],
      isCollapsed: false,
      updatedAt: undefined,
      activePresetId: 'default',
      presets: buildBuiltInPresetsForDivision(divisionId)
    };

    setGridState(defaultState);
    setLayoutResetKey(prev => prev + 1);
    triggerToast('Konfigurasi LocalStorage dihapus & posisi widget dikembalikan ke Default!');
  }, [divisionId, storageKey]);

  const availablePresets = useMemo<RglNamedLayoutPreset[]>(() => {
    if (gridState.presets && gridState.presets.length > 0) {
      return gridState.presets;
    }
    return buildBuiltInPresetsForDivision(divisionId);
  }, [gridState.presets, divisionId]);

  const activePresetObj = useMemo(() => {
    return availablePresets.find(p => p.id === gridState.activePresetId) || null;
  }, [availablePresets, gridState.activePresetId]);

  const handleApplyNamedPreset = useCallback(
    (preset: RglNamedLayoutPreset) => {
      registerWidgetInteraction();
      const hydratedLayouts = mergeResponsiveLayouts(
        buildDefaultLayoutsForDivision(divisionId),
        preset.layouts,
        divisionId
      );
      const nextState: StoredDivisionGridState = {
        ...gridState,
        layouts: hydratedLayouts,
        hiddenIds: [...preset.hiddenIds],
        isCollapsed: false,
        activePresetId: preset.id,
        presets: availablePresets
      };
      persistState(nextState);
      setLayoutResetKey(prev => prev + 1);
      setPresetMenuOpen(false);
      triggerToast(`Preset "${preset.name}" diterapkan & disimpan ke LocalStorage!`);
    },
    [divisionId, gridState, availablePresets, persistState, registerWidgetInteraction]
  );

  const handleUpdateExistingPresetWithCurrentLayout = useCallback(
    (presetId: string) => {
      registerWidgetInteraction();
      const targetPreset = availablePresets.find(p => p.id === presetId);
      if (!targetPreset) return;

      const updatedPresets = availablePresets.map(p =>
        p.id === presetId
          ? {
              ...p,
              layouts: gridState.layouts,
              hiddenIds: [...gridState.hiddenIds],
              savedAt: new Date().toISOString()
            }
          : p
      );

      persistState({
        ...gridState,
        activePresetId: presetId,
        presets: updatedPresets
      });
      triggerToast(`Konfigurasi saat ini disimpan ke preset "${targetPreset.name}"!`);
    },
    [availablePresets, gridState, persistState, registerWidgetInteraction]
  );

  const handleSaveNewNamedPreset = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      registerWidgetInteraction();
      const trimmedName = newPresetName.trim();
      if (!trimmedName) return;

      const slugId = `custom-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const newPreset: RglNamedLayoutPreset = {
        id: slugId,
        name: trimmedName,
        description:
          newPresetDesc.trim() ||
          `Tata letak kustom (${ defs.length - gridState.hiddenIds.length }/${defs.length} widget aktif)`,
        badge: 'Preset Kustom',
        iconType: 'custom',
        isBuiltIn: false,
        layouts: gridState.layouts,
        hiddenIds: [...gridState.hiddenIds],
        savedAt: new Date().toISOString()
      };

      const nextPresets = [...availablePresets, newPreset];
      persistState({
        ...gridState,
        activePresetId: newPreset.id,
        presets: nextPresets
      });
      setNewPresetName('');
      setNewPresetDesc('');
      triggerToast(`Preset baru "${trimmedName}" disimpan ke LocalStorage!`);
    },
    [newPresetName, newPresetDesc, defs.length, gridState, availablePresets, persistState, registerWidgetInteraction]
  );

  const handleDeleteCustomPreset = useCallback(
    (presetId: string, presetName: string) => {
      registerWidgetInteraction();
      const nextPresets = availablePresets.filter(p => p.id !== presetId);
      const nextActiveId = gridState.activePresetId === presetId ? 'default' : gridState.activePresetId;
      persistState({
        ...gridState,
        activePresetId: nextActiveId,
        presets: nextPresets
      });
      triggerToast(`Preset kustom "${presetName}" dihapus dari LocalStorage.`);
    },
    [availablePresets, gridState, persistState, registerWidgetInteraction]
  );

  // Listen for Command Palette (Ctrl+K) navigation to a specific RGL widget or preset
  useEffect(() => {
    const handleFocusWidget = (e: Event) => {
      const customEvt = e as CustomEvent<{
        divisionId: DivisionId;
        widgetId: string;
        title?: string;
      }>;
      const detail = customEvt.detail;
      if (!detail || detail.divisionId !== divisionId) return;

      registerWidgetInteraction();
      // If panel is collapsed or widget is hidden, uncollapse and unhide it so user sees it
      const isHidden = gridState.hiddenIds.includes(detail.widgetId);
      if (gridState.isCollapsed || isHidden) {
        persistState({
          ...gridState,
          isCollapsed: false,
          hiddenIds: isHidden
            ? gridState.hiddenIds.filter(id => id !== detail.widgetId)
            : gridState.hiddenIds
        });
      }

      setHighlightedWidgetId(detail.widgetId);
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-rgl-widget-id="${detail.widgetId}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      setTimeout(() => {
        setHighlightedWidgetId(prev => (prev === detail.widgetId ? null : prev));
      }, 3600);
    };

    const handleApplyPresetEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{
        divisionId: DivisionId;
        presetId: string;
      }>;
      const detail = customEvt.detail;
      if (!detail || detail.divisionId !== divisionId) return;
      const foundPreset = availablePresets.find(p => p.id === detail.presetId);
      if (foundPreset) {
        handleApplyNamedPreset(foundPreset);
      }
    };

    window.addEventListener('mis-focus-rgl-widget', handleFocusWidget);
    window.addEventListener('mis-apply-rgl-preset', handleApplyPresetEvent);
    return () => {
      window.removeEventListener('mis-focus-rgl-widget', handleFocusWidget);
      window.removeEventListener('mis-apply-rgl-preset', handleApplyPresetEvent);
    };
  }, [
    divisionId,
    gridState,
    availablePresets,
    persistState,
    registerWidgetInteraction,
    handleApplyNamedPreset
  ]);

  const navigateToTab = (tabId: string) => {
    registerWidgetInteraction();
    if (onNavigateSubTab) {
      onNavigateSubTab(tabId);
    } else {
      setCurrentSubTab(tabId);
    }
  };

  const currentDivObj = divisiList.find(d => d.id === divisionId);
  const visibleDefs = defs.filter(d => !gridState.hiddenIds.includes(d.id));
  const hiddenDefs = defs.filter(d => gridState.hiddenIds.includes(d.id));

  // Contextual tips tailored to the current division & RGL dashboard capabilities
  const contextualTips = useMemo(() => {
    const divName = currentDivObj?.nama_divisi || `Divisi ${divisionId}`;
    const divisionSpecificTips: Record<
      number,
      Array<{
        title: string;
        message: string;
        badge: string;
        ctaLabel?: string;
        ctaTab?: string;
        ctaAction?: 'editMode' | 'exportPdf' | 'resetLayout';
      }>
    > = {
      1: [
        {
          title: 'Tips Eksekutif: Otorisasi SPK & Mutasi Kas',
          message:
            'Klik tombol pintasan di dalam widget "Persetujuan SPK Cetak" atau "Ringkasan Kas & Likuiditas" untuk memvalidasi antrean pengajuan cetak secara langsung.',
          badge: divName,
          ctaLabel: 'Buka Antrean SPK',
          ctaTab: 'persetujuan'
        },
        {
          title: 'Tips Produktivitas: Pantau Tren Lintas Divisi',
          message:
            'Gunakan tab "Productivity Stats" atau tarik (drag) sudut kanan-bawah widget di beranda ini untuk memperluas grafik pantauan kinerja.',
          badge: 'Analitik',
          ctaLabel: 'Buka Productivity Stats',
          ctaTab: 'productivity'
        }
      ],
      2: [
        {
          title: 'Tips Keuangan: Rekonsiliasi & Verifikasi Dana SPK',
          message:
            'Anda dapat langsung menuju modul Kas & Mutasi dari widget "Arus Kas Masuk vs Keluar" atau menyusun ulang posisi widget prioritas Anda.',
          badge: divName,
          ctaLabel: 'Buka Kas & Mutasi',
          ctaTab: 'mutasi'
        }
      ],
      3: [
        {
          title: 'Tips Penerbitan: Pantau Stok Kritis & Royalti',
          message:
            'Widget "Peringatan Stok Kritis (<25 Eks)" memudahkan Anda mendeteksi buku yang perlu segera diajukan cetak ulang ke Direktorat.',
          badge: divName,
          ctaLabel: 'Kelola Katalog Buku',
          ctaTab: 'buku'
        }
      ],
      4: [
        {
          title: 'Tips Pemasaran: Konversi Faktur & Voucher Promo',
          message:
            'Klik pintasan pada widget "Performa Faktur & Omset" untuk menindaklanjuti pesanan berstatus Pending atau mengecek kuota kode voucher aktif.',
          badge: divName,
          ctaLabel: 'Buka Faktur & Pesanan',
          ctaTab: 'pesanan'
        }
      ],
      5: [
        {
          title: 'Tips Produksi: Eksekusi SPK & Catat Output Harian',
          message:
            'Gunakan widget "Antrean SPK Siap Cetak" untuk memantau mandat cetak yang telah disetujui dan langsung catat realisasi oplah produksi.',
          badge: divName,
          ctaLabel: 'Buka Log Produksi',
          ctaTab: 'log'
        }
      ],
      6: [
        {
          title: 'Tips Distribusi: Pengiriman Faktur Lunas & Stok Gudang',
          message:
            'Cek widget "Antrean Faktur Siap Kirim" untuk segera menerbitkan surat jalan dan nomor resi bagi pesanan yang telah lunas.',
          badge: divName,
          ctaLabel: 'Buka Pengiriman & Resi',
          ctaTab: 'pengiriman'
        }
      ]
    };

    const sharedRglTips = [
      {
        title: 'Tips Tata Letak: Drag & Resize Widget Beranda',
        message:
          'Tahukah Anda? Anda bisa menarik ikon grip di bagian atas kartu untuk memindahkan posisi widget, atau tarik sudut kanan-bawahnya untuk mengubah ukuran. Semua tersimpan otomatis di LocalStorage!',
        badge: 'React Grid Layout',
        ctaLabel: 'Aktifkan Mode Atur Widget',
        ctaAction: 'editMode' as const
      },
      {
        title: 'Tips Laporan: Ekspor PDF Tata Letak Beranda',
        message:
          'Ingin membagikan potret metrik beranda & matriks koordinat widget saat ini? Gunakan tombol "PDF Export" di header beranda untuk mengunduh laporan A4 terpaginasi.',
        badge: 'PDF Export',
        ctaLabel: 'Unduh PDF Sekarang',
        ctaAction: 'exportPdf' as const
      },
      {
        title: 'Tips Pintasan: Gunakan Global Hotkey Map',
        message:
          'Tekan tombol "?" atau "Alt + K" kapan saja untuk melihat daftar lengkap pintasan keyboard seperti Mode Privasi (Alt + P) dan Mode Presentasi.',
        badge: 'Shortcut Cepat',
        ctaLabel: 'Atur Widget Beranda',
        ctaAction: 'editMode' as const
      }
    ];

    return [...(divisionSpecificTips[divisionId] || []), ...sharedRglTips];
  }, [divisionId, currentDivObj?.nama_divisi]);

  const showContextualTipToast = useCallback(
    (manualTrigger: boolean = false) => {
      if (contextualTips.length === 0) return;
      const nextIdx = (lastTipIndexRef.current + 1) % contextualTips.length;
      lastTipIndexRef.current = nextIdx;
      const selectedTip = contextualTips[nextIdx];
      setActiveTipIndex(nextIdx);

      // Also dispatch to global toast notification system
      showToast({
        title: `💡 ${selectedTip.title}`,
        message: selectedTip.message,
        type: 'info',
        category: 'system',
        divisionName: selectedTip.badge,
        duration: 8000
      });

      if (manualTrigger) {
        lastWidgetInteractionAtRef.current = Date.now();
        idleTipShownForCurrentCycleRef.current = false;
        setIdleSeconds(0);
      }
    },
    [contextualTips, showToast]
  );

  // Reset idle tracker when division changes
  useEffect(() => {
    lastWidgetInteractionAtRef.current = Date.now();
    idleTipShownForCurrentCycleRef.current = false;
    setIdleSeconds(0);
    setActiveTipIndex(null);
  }, [divisionId]);

  // Monitor time spent on the dashboard view without interacting with any widgets (>60 seconds)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.hidden || gridState.isCollapsed) return;

      const elapsedSec = Math.floor((Date.now() - lastWidgetInteractionAtRef.current) / 1000);
      setIdleSeconds(elapsedSec);

      if (elapsedSec >= IDLE_TIP_THRESHOLD_SECONDS && !idleTipShownForCurrentCycleRef.current) {
        idleTipShownForCurrentCycleRef.current = true;
        showContextualTipToast(false);
        // Reset cycle timestamp so another helpful tip can surface if user remains idle for another 60s
        lastWidgetInteractionAtRef.current = Date.now();
        idleTipShownForCurrentCycleRef.current = false;
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [gridState.isCollapsed, showContextualTipToast]);

  const handleExportRglPdf = async (
    includeFullDashboard: boolean = true,
    orientation: 'landscape' | 'portrait' = 'landscape'
  ) => {
    if (isExportingPdf) return;
    setPdfExportMenuOpen(false);

    // Ensure panel is expanded before capturing
    if (gridState.isCollapsed) {
      persistState({ ...gridState, isCollapsed: false });
      await new Promise(resolve => setTimeout(resolve, 120));
    }

    setIsExportingPdf(true);
    setPdfExportStatus('Menyiapkan PDF...');

    try {
      const lgLayout = gridState.layouts.lg || buildDefaultLayoutsForDivision(divisionId).lg || [];
      const widgetsSnapshot: RglWidgetSnapshotItem[] = defs.map((def, index) => {
        const layoutItem = lgLayout.find(l => l.i === def.id);
        return {
          id: def.id,
          title: def.title,
          subtitle: def.subtitle,
          x: layoutItem ? layoutItem.x : (index * 4) % 12,
          y: layoutItem ? layoutItem.y : Math.floor((index * 4) / 12) * 2,
          w: layoutItem ? layoutItem.w : def.defaultW,
          h: layoutItem ? layoutItem.h : def.defaultH,
          visible: !gridState.hiddenIds.includes(def.id)
        };
      });

      const divCodes: Record<number, string> = {
        1: 'DIR',
        2: 'FIN',
        3: 'PUB',
        4: 'MKT',
        5: 'PRD',
        6: 'LOG'
      };

      const success = await exportRglDashboardToPdf({
        divisionId,
        divisionName: currentDivObj?.nama_divisi || `Divisi ${divisionId}`,
        divisionCode: divCodes[divisionId] || `DIV-${divisionId}`,
        userName: currentUser?.name || 'Eksekutif Yayasan',
        userRole: currentUser?.role || 'Administrator',
        rglContainerElement: containerRef.current,
        includeFullDashboard,
        orientation,
        widgetsSnapshot,
        onProgress: msg => setPdfExportStatus(msg)
      });

      if (success) {
        triggerToast(
          includeFullDashboard
            ? 'Laporan PDF Beranda & State RGL berhasil diunduh!'
            : 'Laporan PDF Konfigurasi RGL Widget berhasil diunduh!'
        );
      } else {
        triggerToast('Gagal mengekspor laporan PDF.');
      }
    } catch (err) {
      console.error('RGL PDF Export Error:', err);
      triggerToast('Terjadi kesalahan saat membuat PDF.');
    } finally {
      setIsExportingPdf(false);
      setPdfExportStatus('');
    }
  };

  // Shared computed metrics
  const totalMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
  const totalKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
  const saldoBersih = totalMasuk - totalKeluar;
  const pendingSpk = pengajuans.filter(p => p.status === 'pending');
  const approvedSpk = pengajuans.filter(p => p.status === 'approved');
  const lunasOrders = orders.filter(o => o.status === 'Lunas');
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const totalOmset = lunasOrders.reduce((s, o) => s + o.total_tagihan, 0);
  const totalStokBuku = books.reduce((s, b) => s + b.stok_gudang, 0);
  const lowStockBooks = books.filter(b => b.stok_gudang < 25);
  const totalProdEks = productionLogs.reduce((s, l) => s + l.qty_produksi, 0);
  const packingQueue = penyalurans.filter(p => p.status === 'proses packing');

  const divEvents = useMemo(
    () => calendarEvents.filter(e => (e.divisionId || e.picDivisionId || 1) === divisionId),
    [calendarEvents, divisionId]
  );

  const avgDivProgress = useMemo(() => {
    if (divEvents.length === 0) return 0;
    return Math.round(
      divEvents.reduce((acc, ev) => acc + getTaskCompletionProgress(ev).percent, 0) /
        divEvents.length
    );
  }, [divEvents]);

  const urgentDivEvents = useMemo(
    () =>
      divEvents.filter(e => {
        const st = getDeadlineInfo(e.date, e.status).state;
        return st === 'overdue' || st === 'today' || st === 'approaching';
      }),
    [divEvents]
  );

  const renderWidgetBody = (widget: DivisionWidgetItem) => {
    // Task progress widget shared pattern for `*-w-tugas` or `dir-w-agenda`
    if (widget.id.endsWith('-w-tugas') || widget.id === 'dir-w-agenda') {
      return (
        <div className="flex flex-col justify-between h-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {avgDivProgress}%
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {divEvents.filter(e => e.status === 'Selesai').length}/{divEvents.length} Tugas Selesai
                </span>
                {urgentDivEvents.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {urgentDivEvents.length} Perlu Perhatian
                  </span>
                )}
              </div>
              <div className="w-full max-w-md h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                  style={{ width: `${avgDivProgress}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateToTab('kalender')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Buka Kalender & Daily Planner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {divEvents.slice(0, 3).map(ev => {
              const prog = getTaskCompletionProgress(ev);
              return (
                <div
                  key={ev.id}
                  onClick={() => navigateToTab('kalender')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 hover:border-indigo-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="font-bold text-slate-500 truncate">👤 {ev.picName}</span>
                    <span className={`font-extrabold ${prog.textColor}`}>{prog.percent}%</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {ev.title}
                  </p>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${prog.barColor}`}
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    switch (widget.id) {
      case 'dir-w-kas':
      case 'fin-w-arus-kas':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                Rp {saldoBersih.toLocaleString('id-ID')}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Masuk: Rp {totalMasuk.toLocaleString('id-ID')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">
                  Keluar: Rp {totalKeluar.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{mutasis.length} Jurnal Mutasi</span>
              <button
                type="button"
                onClick={() => navigateToTab(divisionId === 2 ? 'mutasi' : 'overview')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Detail Kas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'dir-w-umat':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {identitasList.length} <span className="text-xs font-normal text-slate-400">Anggota</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {identitasList.filter(i => i.is_dharma_patriot).length} Dharma Patriot
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                  {identitasList.filter(i => i.jenis_umat === 'Sangha').length} Sangha
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Database Terverifikasi</span>
              <button
                type="button"
                onClick={() => navigateToTab('identitas')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Anggota</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'dir-w-lintas':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full items-center">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Omset Penjualan
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Rp {totalOmset.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                SPK Cetak Pending
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {pendingSpk.length} Pengajuan
              </p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-800/60">
              <span className="text-[10px] font-bold uppercase text-violet-700 dark:text-violet-300">
                Total Stok Gudang
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {totalStokBuku.toLocaleString('id-ID')} Eks
              </p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/60">
              <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-300">
                Antrean Packing
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {packingQueue.length} Paket
              </p>
            </div>
          </div>
        );

      case 'fin-w-spk':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {pendingSpk.length} <span className="text-xs font-normal text-slate-400">Menunggu Approval</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Telah disetujui: <strong>{approvedSpk.length} SPK Cetak</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Pencairan Anggaran Cetak</span>
              <button
                type="button"
                onClick={() => navigateToTab('persetujuan')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Verifikasi SPK</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'fin-w-rekon':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {accounts.length} <span className="text-xs font-normal text-slate-400">Rekening Aktif</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Auto-Match Rekonsiliasi & Laporan ISAK 35 siap diaudit
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Standar PSAK / ISAK 35</span>
              <button
                type="button"
                onClick={() => navigateToTab('rekonsiliasi')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Rekonsiliasi</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'pub-w-katalog':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-violet-600 dark:text-violet-400">
                {books.length} <span className="text-xs font-normal text-slate-400">Judul Buku</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Terdaftar ISBN: <strong>{books.filter(b => b.isbn).length} judul</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Master Katalog Naskah</span>
              <button
                type="button"
                onClick={() => navigateToTab('katalog')}
                className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Katalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'pub-w-fashili':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {donasiProyeks.length} <span className="text-xs font-normal text-slate-400">Proyek Fashili</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Dana Terkumpul:{' '}
                <strong>
                  Rp{' '}
                  {donasiProyeks
                    .reduce((s, p) => s + p.dana_terkumpul, 0)
                    .toLocaleString('id-ID')}
                </strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Donasi Cetak Dharma</span>
              <button
                type="button"
                onClick={() => navigateToTab('donasi_cetak')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Fashili</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'pub-w-royalti':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {royaltiPenulisList.length} <span className="text-xs font-normal text-slate-400">Kontrak Lisensi</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Pengajuan Cetak Aktif: <strong>{pengajuans.length} riwayat</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Royalti & Hak Cipta</span>
              <button
                type="button"
                onClick={() => navigateToTab('royalti')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Cek Royalti</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'mkt-w-omset':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                Rp {totalOmset.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <strong>{lunasOrders.length} Lunas</strong> • {pendingOrders.length} Pending Bayar
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">POS & Rekap Invoice</span>
              <button
                type="button"
                onClick={() => navigateToTab('invoices')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Invoice</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'mkt-w-bazar':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {bazaarEvents.length} <span className="text-xs font-normal text-slate-400">Event Bazar</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Kampanye Pre-Order (PO): <strong>{preOrders.length} gelombang</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Pameran & Touch POS</span>
              <button
                type="button"
                onClick={() => navigateToTab('bazaar')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Agenda Bazar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'mkt-w-promo':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {promos.length} <span className="text-xs font-normal text-slate-400">Kupon Diskon</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mitra Agen Resmi: <strong>{identitasList.filter(i => i.is_agen_purna).length} agen</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Otomasi VLOOKUP POS</span>
              <button
                type="button"
                onClick={() => navigateToTab('promos')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Promo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'prd-w-output':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                {totalProdEks.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-400">Eksemplar</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tercatat dalam <strong>{productionLogs.length} batch log produksi</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Sinkronisasi Stok Real-time</span>
              <button
                type="button"
                onClick={() => navigateToTab('logs')}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Riwayat Cetak</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'prd-w-spk':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {approvedSpk.length} <span className="text-xs font-normal text-slate-400">SPK Approved</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Menunggu persetujuan Finance: <strong>{pendingSpk.length} pengajuan</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Antrean Mesin Offset</span>
              <button
                type="button"
                onClick={() => navigateToTab('input')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Input Hasil Cetak</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'prd-w-kritis':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {lowStockBooks.length} <span className="text-xs font-normal text-slate-400">Judul Menipis</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {lowStockBooks[0]
                  ? `Prioritas: ${lowStockBooks[0].judul} (${lowStockBooks[0].stok_gudang} eks)`
                  : 'Seluruh stok buku dalam batas aman'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Monitoring Re-stock</span>
              <button
                type="button"
                onClick={() => navigateToTab('overview')}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Cek Stok</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'log-w-packing':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {packingQueue.length} <span className="text-xs font-normal text-slate-400">Antrean Paket</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Terkirim: <strong>{penyalurans.filter(p => p.status === 'dikirim').length} item distribusi</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Cetak Surat Jalan & Resi</span>
              <button
                type="button"
                onClick={() => navigateToTab('antrean')}
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Antrean</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'log-w-stok':
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {totalStokBuku.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-400">Eksemplar</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tersebar di <strong>{books.length} judul buku</strong> siap distribusi
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Gudang Utama Logistik</span>
              <button
                type="button"
                onClick={() => navigateToTab('manual')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Gudang</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 'log-w-riwayat':
      default:
        return (
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {logisticLogs.length} <span className="text-xs font-normal text-slate-400">Log Keluar</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Total buku keluar:{' '}
                <strong>
                  {logisticLogs.reduce((s, l) => s + l.qty_keluar, 0).toLocaleString('id-ID')} eks
                </strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Audit Mutasi Fisik</span>
              <button
                type="button"
                onClick={() => navigateToTab('logs')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      data-rgl-widget-workspace="true"
      className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Workspace Widget Beranda {currentDivObj?.nama_divisi || 'Direktorat'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                React Grid Layout ({visibleDefs.length}/{defs.length} Aktif)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                <span>Preset: {activePresetObj ? activePresetObj.name : 'Default Standar'}</span>
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 cursor-default"
                title={`Posisi (x, y) & ukuran (w, h) widget otomatis disimpan di LocalStorage (${storageKey})`}
              >
                <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Tersimpan di LocalStorage
                  {gridState.updatedAt
                    ? ` • ${new Date(gridState.updatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    : ''}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sesuaikan posisi (drag), rentang ukuran kolom/tinggi (resize), atau ekspor laporan tata letak RGL ke PDF.
            </p>
          </div>
        </div>

        <div className="print:hidden flex flex-wrap items-center gap-2">
          {/* Preset Dashboard Layouts Switcher & Manager ('Morning Routine', 'Deep Work', 'End of Day', + Custom) */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={() => {
                registerWidgetInteraction();
                setPresetMenuOpen(prev => !prev);
                setPdfExportMenuOpen(false);
              }}
              title="Pilih atau simpan Preset Dashboard Layout (Morning Routine, Deep Work, End of Day, atau Kustom)"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                presetMenuOpen || activePresetObj
                  ? 'bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-xs'
                  : 'bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/70 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>
                Preset Layout{activePresetObj ? `: ${activePresetObj.name}` : ''}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {presetMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                        <Bookmark className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span>Preset Dashboard Layouts</span>
                      </p>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Beralih cepat antar konfigurasi RGL atau simpan tata letak Anda ke LocalStorage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPresetMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Switcher Pill Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {availablePresets.slice(0, 3).map(preset => {
                      const isCurrent = gridState.activePresetId === preset.id;
                      return (
                        <button
                          key={`quick-pill-${preset.id}`}
                          type="button"
                          onClick={() => handleApplyNamedPreset(preset)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                              : 'bg-slate-100 hover:bg-violet-50 dark:bg-slate-800 dark:hover:bg-violet-950/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {preset.iconType === 'morning' && <Sunrise className="w-3 h-3 text-amber-500" />}
                          {preset.iconType === 'deepwork' && <Brain className="w-3 h-3 text-indigo-400" />}
                          {preset.iconType === 'eod' && <Moon className="w-3 h-3 text-sky-400" />}
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Preset List */}
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                    {availablePresets.map(preset => {
                      const isSelected = gridState.activePresetId === preset.id;
                      const activeCount = defs.length - preset.hiddenIds.length;
                      return (
                        <div
                          key={preset.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-violet-50/90 dark:bg-violet-950/50 border-violet-300 dark:border-violet-700'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplyNamedPreset(preset)}
                              className="text-left flex-1 min-w-0 cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {preset.iconType === 'morning' && (
                                  <Sunrise className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                )}
                                {preset.iconType === 'deepwork' && (
                                  <Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                )}
                                {preset.iconType === 'eod' && (
                                  <Moon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                )}
                                {preset.iconType === 'custom' && (
                                  <Bookmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                                <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                  {preset.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {activeCount}/{defs.length} Widget
                                </span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-violet-600 text-white">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {preset.description}
                              </p>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateExistingPresetWithCurrentLayout(preset.id)}
                                title={`Timpa preset "${preset.name}" dengan posisi & ukuran widget di layar saat ini`}
                                className="p-1.5 rounded-lg bg-white hover:bg-violet-100 dark:bg-slate-900 dark:hover:bg-violet-900/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              {!preset.isBuiltIn && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomPreset(preset.id, preset.name)}
                                  title={`Hapus preset "${preset.name}"`}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Current Layout as New Named Preset Form */}
                  <form
                    onSubmit={handleSaveNewNamedPreset}
                    className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-violet-600" />
                      <span>Simpan Konfigurasi Saat Ini Sebagai Preset Baru</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newPresetName}
                        onChange={e => setNewPresetName(e.target.value)}
                        placeholder="Nama preset (mis. Rapat Mingguan)..."
                        className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="submit"
                        disabled={!newPresetName.trim()}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PDF Export Button with Quick Options for RGL State */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              disabled={isExportingPdf}
              onClick={() => handleExportRglPdf(true, 'landscape')}
              title="Unduh Laporan PDF Beranda & State React Grid Layout (Terpaginasi via html2pdf)"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-l-xl text-xs font-bold border transition-all cursor-pointer ${
                isExportingPdf
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 cursor-wait'
                  : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs'
              }`}
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>
                {isExportingPdf ? pdfExportStatus || 'Mengekspor PDF...' : 'PDF Export'}
              </span>
            </button>
            <button
              type="button"
              disabled={isExportingPdf}
              onClick={() => setPdfExportMenuOpen(prev => !prev)}
              title="Pilih cakupan & orientasi ekspor PDF RGL"
              className="px-2 py-1.5 rounded-r-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white border border-l-rose-500 border-rose-700 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {pdfExportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-40 text-xs space-y-1"
                >
                  <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Opsi Ekspor PDF (html2pdf RGL)</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Menangkap koordinat widget RGL ({visibleDefs.length}/{defs.length} aktif) ke dokumen A4 terpaginasi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportRglPdf(true, 'landscape')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Full Dashboard + RGL State (Landscape)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Kanvas RGL, Tabel Koordinat Grid & Lampiran Tabel Beranda
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[9px] font-extrabold shrink-0">
                      A4 Landscape
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportRglPdf(false, 'landscape')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Hanya RGL Widget & Matriks Koordinat
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Ekspor ringkas khusus tata letak widget & ukuran span kolom
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-extrabold shrink-0">
                      Ringkas
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportRglPdf(true, 'portrait')}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Laporan Beranda & RGL (A4 Portrait)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Format dokumen vertikal multi-halaman dengan nomor halaman
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-extrabold shrink-0">
                      A4 Portrait
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => {
              if (gridState.isCollapsed) {
                persistState({ ...gridState, isCollapsed: false });
              }
              setIsEditMode(!isEditMode);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isEditMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Selesai Atur Widget' : 'Atur Widget (Drag & Resize)'}</span>
          </button>

          <button
            type="button"
            onClick={() => showContextualTipToast(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 transition-all cursor-pointer"
            title={`Tips Kontekstual Beranda (Otomatis muncul saat tanpa interaksi widget selama 60 detik • Idle: ${idleSeconds}d/${IDLE_TIP_THRESHOLD_SECONDS}d)`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Tips</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200">
              {Math.min(idleSeconds, IDLE_TIP_THRESHOLD_SECONDS)}s
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLayoutCustomized
                ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Hapus konfigurasi tata letak React Grid Layout dari LocalStorage dan kembalikan posisi/ukuran widget ke standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <button
            type="button"
            onClick={() => persistState({ ...gridState, isCollapsed: !gridState.isCollapsed })}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={gridState.isCollapsed ? 'Tampilkan Widget Beranda' : 'Lipat Panel Widget'}
          >
            {gridState.isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Edit Mode Banner & Hidden Widgets Drawer */}
      <AnimatePresence>
        {isEditMode && !gridState.isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-dashed border-indigo-400 dark:border-indigo-700 space-y-2.5 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Mode Kustomisasi React Grid Layout Aktif: Tarik header kartu untuk memindahkan posisi, tarik sudut kanan-bawah untuk mengubah ukuran (resize), atau klik ikon mata untuk menyembunyikan widget.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Tata Letak</span>
              </button>
            </div>

            {/* Widget Visibility Toggle Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mr-1">
                Tampilkan / Sembunyikan Widget:
              </span>
              {defs.map(w => {
                const isHidden = gridState.hiddenIds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleToggleWidgetVisibility(w.id, w.title)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                      isHidden
                        ? 'bg-white/80 dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-700 line-through'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    }`}
                  >
                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{w.title}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* React Grid Layout Canvas */}
      {!gridState.isCollapsed && (
        <div
          ref={containerRef}
          className="w-full"
          onPointerDownCapture={registerWidgetInteraction}
          onKeyDownCapture={registerWidgetInteraction}
          onWheelCapture={registerWidgetInteraction}
        >
          {visibleDefs.length > 0 ? (
            <ResponsiveGridLayout
              key={`rgl-div-${divisionId}-reset-${layoutResetKey}`}
              className="layout"
              width={containerWidth || 1120}
              layouts={gridState.layouts}
              breakpoints={{ lg: 1024, md: 768, sm: 480 }}
              cols={{ lg: 12, md: 10, sm: 6 }}
              rowHeight={86}
              margin={[14, 14]}
              dragConfig={{
                enabled: true,
                handle: '.rgl-widget-drag-handle'
              }}
              resizeConfig={{
                enabled: true,
                handles: ['se']
              }}
              onLayoutChange={handleLayoutChange}
              onDragStop={handleDragOrResizeStop}
              onResizeStop={handleDragOrResizeStop}
            >
              {visibleDefs.map(widget => {
                const lgItem = gridState.layouts.lg?.find(l => l.i === widget.id);
                const curW = lgItem?.w || widget.defaultW;
                const curH = lgItem?.h || widget.defaultH;

                return (
                  <div
                    key={widget.id}
                    data-rgl-widget-id={widget.id}
                    onMouseEnter={registerWidgetInteraction}
                    onClick={registerWidgetInteraction}
                    className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 flex flex-col justify-between transition-all overflow-hidden ${
                      highlightedWidgetId === widget.id
                        ? 'border-2 border-amber-500 ring-4 ring-amber-400/30 shadow-xl'
                        : isEditMode
                        ? 'border-2 border-dashed border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                        : 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800/80'
                    }`}
                  >
                    {/* Widget Header & Drag Handle */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div
                        className="rgl-widget-drag-handle cursor-grab active:cursor-grabbing flex items-center gap-2 min-w-0 flex-1 select-none"
                        title="Tarik (drag) header ini untuk memindahkan posisi widget — otomatis tersimpan di LocalStorage"
                      >
                        <span
                          className={`p-1 rounded-lg shrink-0 transition-colors ${
                            isEditMode
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                        >
                          <GripHorizontal className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {widget.title}
                            </h4>
                            {isEditMode && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 shrink-0">
                                {curW}×{curH}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-400 truncate">{widget.subtitle}</p>
                        </div>
                      </div>

                      {/* Edit Mode Widget Controls (Resize Width & Hide) */}
                      {isEditMode && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickResizeWidget(widget.id, curW >= 8 ? -4 : 4, 0)
                            }
                            className="p-1 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title={curW >= 8 ? 'Perkecil Lebar Widget' : 'Perlebar Widget (Span Kolom)'}
                          >
                            {curW >= 8 ? (
                              <Minimize2 className="w-3.5 h-3.5" />
                            ) : (
                              <Maximize2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleWidgetVisibility(widget.id, widget.title)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                            title="Sembunyikan Widget Ini"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Widget Dynamic Body */}
                    <div className="flex-1 pt-2.5 overflow-y-auto no-scrollbar">
                      {renderWidgetBody(widget)}
                    </div>
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">
              <EyeOff className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Seluruh widget beranda divisi ini sedang disembunyikan.
              </p>
              <button
                type="button"
                onClick={handleResetDefault}
                className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tampilkan Kembali Semua Widget</span>
              </button>
            </div>
          )}

          {/* Notice when some widgets are hidden outside edit mode */}
          {!isEditMode && hiddenDefs.length > 0 && (
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Terdapat <strong>{hiddenDefs.length} widget</strong> yang disembunyikan (
                {hiddenDefs.map(h => h.title).join(', ')}).
              </span>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Kelola Widget Tersembunyi ➜
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contextual Helpful Tip Toast Notification (Appears after 60s without widget interaction or via Tips button) */}
      <AnimatePresence>
        {activeTipIndex !== null && contextualTips[activeTipIndex] && (
          <motion.div
            key={`contextual-tip-${activeTipIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="fixed bottom-6 left-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-2xl bg-slate-900/95 dark:bg-slate-900 text-white p-4 shadow-2xl border border-amber-500/40 backdrop-blur-md print:hidden"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Tips Kontekstual • {contextualTips[activeTipIndex].badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    60d Tanpa Interaksi Widget
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-1.5">
                  {contextualTips[activeTipIndex].title}
                </h4>
                <p className="text-[11.5px] text-slate-300 leading-relaxed mt-1">
                  {contextualTips[activeTipIndex].message}
                </p>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {contextualTips[activeTipIndex].ctaLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          const tip = contextualTips[activeTipIndex];
                          registerWidgetInteraction();
                          setActiveTipIndex(null);
                          if (tip.ctaTab) {
                            navigateToTab(tip.ctaTab);
                          } else if (tip.ctaAction === 'editMode') {
                            setIsEditMode(true);
                          } else if (tip.ctaAction === 'exportPdf') {
                            handleExportRglPdf(true, 'landscape');
                          } else if (tip.ctaAction === 'resetLayout') {
                            handleResetDefault();
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold transition-colors cursor-pointer"
                      >
                        <span>{contextualTips[activeTipIndex].ctaLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => showContextualTipToast(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Tips Berikutnya
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      registerWidgetInteraction();
                      setActiveTipIndex(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white font-semibold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  registerWidgetInteraction();
                  setActiveTipIndex(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Tutup Tips"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
