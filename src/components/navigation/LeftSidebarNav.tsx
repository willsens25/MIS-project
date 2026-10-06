import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import { getStoredCalendarEvents, getDeadlineInfo } from '../common/DivisionCalendarTodoView';
import {
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  TrendingUp,
  Users,
  UserCog,
  CheckCircle2,
  CreditCard,
  Building,
  Printer,
  FileText,
  Tag,
  Globe,
  Plus,
  History,
  Package,
  Send,
  Calendar,
  Zap,
  Rocket,
  Crown,
  Heart,
  Award,
  Scale,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
  Bot,
  Tv,
  Sparkles,
  Layers
} from 'lucide-react';

export interface SidebarSubMenuItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export interface SidebarDivisionGroup {
  id: DivisionId;
  name: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  accentText: string;
  accentBg: string;
  activePillBg: string;
  defaultSubTab: string;
  subItems: SidebarSubMenuItem[];
}

export interface SidebarCategorySection {
  id: string;
  categoryTitle: string;
  categorySubtitle: string;
  categoryBadgeColor: string;
  divisions: SidebarDivisionGroup[];
}

interface LeftSidebarNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAI?: () => void;
}

export const LeftSidebarNav: React.FC<LeftSidebarNavProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenAI
}) => {
  const {
    currentUser,
    currentSubTab,
    switchDivision,
    setCurrentSubTab,
    pengajuans,
    orders,
    books,
    donasiProyeks,
    openPresentationMode
  } = useApp();

  const [menuSearch, setMenuSearch] = useState('');
  // Track which divisions have their sub-menus expanded in the sidebar
  const [expandedDivisions, setExpandedDivisions] = useState<Record<number, boolean>>(() => ({
    [currentUser.divisi_id]: true
  }));

  // Track collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Auto-expand active division when user switches division
  useEffect(() => {
    setExpandedDivisions(prev => ({
      ...prev,
      [currentUser.divisi_id]: true
    }));
  }, [currentUser.divisi_id]);

  // Dynamic badge counts
  const pendingSpkCount = pengajuans.filter(p => p.status === 'pending').length;
  const readyToPackCount = orders.filter(o => o.status === 'Lunas').length;
  const lowStockCount = books.filter(b => (b.stok_gudang ?? 0) <= 20).length;

  // Count overdue/urgent calendar tasks per division
  const urgentCalendarCounts = useMemo(() => {
    const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    try {
      const evts = getStoredCalendarEvents();
      evts.forEach(ev => {
        if (ev.status === 'Selesai') return;
        const dl = getDeadlineInfo(ev.date, ev.status);
        if (dl.state === 'overdue' || dl.state === 'today') {
          const dId = ev.divisionId || ev.picDivisionId || 1;
          map[dId] = (map[dId] || 0) + 1;
        }
      });
    } catch {
      // ignore
    }
    return map;
  }, [currentUser.divisi_id, currentSubTab]);

  const categoriesConfig = useMemo<SidebarCategorySection[]>(
    () => [
      {
        id: 'cat-governance-finance',
        categoryTitle: 'Tata Kelola & Keuangan',
        categorySubtitle: 'Direktorat Eksekutif, HRD & Bendahara Kas',
        categoryBadgeColor: 'text-indigo-600 dark:text-indigo-400',
        divisions: [
          {
            id: 1,
            name: 'Direktorat & SDM',
            code: 'DIR',
            icon: Building2,
            accentText: 'text-indigo-600 dark:text-indigo-400',
            accentBg: 'bg-indigo-50 dark:bg-indigo-950/60',
            activePillBg: 'bg-indigo-600 text-white shadow-sm',
            defaultSubTab: 'overview',
            subItems: [
              { id: 'overview', label: 'Executive Dashboard', shortLabel: 'Overview', icon: TrendingUp },
              { id: 'identitas', label: 'Database Anggota', shortLabel: 'Anggota', icon: Users },
              {
                id: 'kalender',
                label: 'Kalender & To-Do List',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[1] > 0 ? urgentCalendarCounts[1] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              },
              { id: 'users', label: 'Manajemen Staf & Akun', shortLabel: 'Staf', icon: UserCog }
            ]
          },
          {
            id: 2,
            name: 'Bendahara & Finance',
            code: 'FIN',
            icon: Wallet,
            accentText: 'text-emerald-600 dark:text-emerald-400',
            accentBg: 'bg-emerald-50 dark:bg-emerald-950/60',
            activePillBg: 'bg-emerald-600 text-white shadow-sm',
            defaultSubTab: 'grafik',
            subItems: [
              { id: 'grafik', label: 'Grafik & Arus Kas', shortLabel: 'Grafik', icon: TrendingUp },
              { id: 'mutasi', label: 'Jurnal Mutasi Kas', shortLabel: 'Mutasi', icon: Wallet },
              {
                id: 'persetujuan',
                label: 'Persetujuan Cetak (SPK)',
                shortLabel: 'Approval SPK',
                icon: CheckCircle2,
                badge: pendingSpkCount > 0 ? pendingSpkCount : undefined,
                badgeColor: 'bg-amber-500 text-slate-950'
              },
              { id: 'rekonsiliasi', label: 'Rekonsiliasi Bank', shortLabel: 'Rekonsiliasi', icon: Scale },
              { id: 'laporan', label: 'Laporan PSAK / ISAK 35', shortLabel: 'Laporan PSAK', icon: FileText },
              { id: 'penjualan', label: 'Rekapitulasi Omset', shortLabel: 'Omset', icon: CreditCard },
              { id: 'akun', label: 'Master Rekening Bank', shortLabel: 'Rekening', icon: Building },
              {
                id: 'kalender',
                label: 'Kalender & To-Do Finance',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[2] > 0 ? urgentCalendarCounts[2] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              }
            ]
          }
        ]
      },
      {
        id: 'cat-publishing-production',
        categoryTitle: 'Redaksi & Pabrikasi',
        categorySubtitle: 'Penerbitan Naskah, ISBN & Percetakan Buku',
        categoryBadgeColor: 'text-violet-600 dark:text-violet-400',
        divisions: [
          {
            id: 3,
            name: 'Penerbitan & Redaksi',
            code: 'PUB',
            icon: BookOpen,
            accentText: 'text-violet-600 dark:text-violet-400',
            accentBg: 'bg-violet-50 dark:bg-violet-950/60',
            activePillBg: 'bg-violet-600 text-white shadow-sm',
            defaultSubTab: 'katalog',
            subItems: [
              {
                id: 'katalog',
                label: 'Katalog Buku & ISBN',
                shortLabel: 'Katalog',
                icon: BookOpen,
                badge: lowStockCount > 0 ? `${lowStockCount} Kritis` : undefined,
                badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              },
              {
                id: 'donasi_cetak',
                label: 'Fashili & Donasi Cetak',
                shortLabel: 'Fashili',
                icon: Heart,
                badge: donasiProyeks.length,
                badgeColor: 'bg-amber-500 text-white'
              },
              { id: 'royalti', label: 'Royalti & Lisensi Penulis', shortLabel: 'Royalti', icon: Award },
              { id: 'ekonomi', label: 'Analisis Unit Ekonomi', shortLabel: 'HPP & BEP', icon: TrendingUp },
              { id: 'grafik', label: 'Statistik & Valuasi Stok', shortLabel: 'Valuasi', icon: Layers },
              { id: 'pengajuan', label: 'Riwayat Pengajuan Cetak', shortLabel: 'Pengajuan', icon: Printer },
              {
                id: 'kalender',
                label: 'Kalender & To-Do Redaksi',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[3] > 0 ? urgentCalendarCounts[3] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              }
            ]
          },
          {
            id: 5,
            name: 'Produksi Percetakan',
            code: 'PRD',
            icon: Factory,
            accentText: 'text-orange-600 dark:text-orange-400',
            accentBg: 'bg-orange-50 dark:bg-orange-950/60',
            activePillBg: 'bg-orange-600 text-white shadow-sm',
            defaultSubTab: 'overview',
            subItems: [
              { id: 'overview', label: 'Pusat Cetak & Ringkasan', shortLabel: 'Pusat Cetak', icon: Factory },
              { id: 'input', label: 'Catat Hasil Cetak Baru', shortLabel: 'Input Cetak', icon: Plus },
              { id: 'logs', label: 'Riwayat Batch Produksi', shortLabel: 'Log Cetak', icon: History },
              {
                id: 'kalender',
                label: 'Kalender & To-Do Produksi',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[5] > 0 ? urgentCalendarCounts[5] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              }
            ]
          }
        ]
      },
      {
        id: 'cat-sales-logistics',
        categoryTitle: 'Niaga, Distribusi & Gudang',
        categorySubtitle: 'Kasir POS, Kampanye Marketing & Ekspedisi',
        categoryBadgeColor: 'text-amber-600 dark:text-amber-400',
        divisions: [
          {
            id: 4,
            name: 'Marketing & Sales',
            code: 'MKT',
            icon: ShoppingBag,
            accentText: 'text-amber-600 dark:text-amber-400',
            accentBg: 'bg-amber-50 dark:bg-amber-950/60',
            activePillBg: 'bg-amber-600 text-white shadow-sm',
            defaultSubTab: 'pos',
            subItems: [
              { id: 'event_pos', label: '⚡ Kasir Cepat POS Event', shortLabel: 'POS Event', icon: Zap },
              { id: 'pos', label: 'Kasir POS & Order Baru', shortLabel: 'Kasir POS', icon: ShoppingBag },
              { id: 'bazaar', label: 'Event & Konsinyasi Bazar', shortLabel: 'Bazaar', icon: Layers },
              { id: 'preorder', label: 'Pre-Order & Bundling', shortLabel: 'PO & Bundle', icon: Rocket },
              { id: 'membership', label: 'Sahabat Member (Loyalty)', shortLabel: 'Loyalty', icon: Crown },
              { id: 'invoices', label: 'Daftar Invoice & Pesanan', shortLabel: 'Invoice', icon: FileText },
              { id: 'promos', label: 'Kupon Promo & Diskon', shortLabel: 'Promo', icon: Tag },
              { id: 'saluran', label: 'Saluran & Ekspedisi', shortLabel: 'Saluran', icon: Globe },
              { id: 'agen', label: 'Direktori Agen & Pembeli', shortLabel: 'Agen', icon: Users },
              { id: 'whatsapp', label: 'Integrasi WhatsApp', shortLabel: 'WhatsApp', icon: MessageSquare },
              { id: 'grafik', label: 'Grafik & Analitik Sales', shortLabel: 'Grafik', icon: TrendingUp },
              {
                id: 'kalender',
                label: 'Kalender & To-Do Marketing',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[4] > 0 ? urgentCalendarCounts[4] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              }
            ]
          },
          {
            id: 6,
            name: 'Logistik & Gudang',
            code: 'LOG',
            icon: Truck,
            accentText: 'text-cyan-600 dark:text-cyan-400',
            accentBg: 'bg-cyan-50 dark:bg-cyan-950/60',
            activePillBg: 'bg-cyan-600 text-white shadow-sm',
            defaultSubTab: 'antrean',
            subItems: [
              {
                id: 'antrean',
                label: 'Antrean Packing Pesanan',
                shortLabel: 'Packing',
                icon: Package,
                badge: readyToPackCount > 0 ? readyToPackCount : undefined,
                badgeColor: 'bg-amber-500 text-slate-950'
              },
              { id: 'manual', label: 'Pengeluaran Manual Gudang', shortLabel: 'Manual', icon: Send },
              { id: 'logs', label: 'Riwayat Distribusi Keluar', shortLabel: 'Log Gudang', icon: History },
              {
                id: 'kalender',
                label: 'Kalender & To-Do Logistik',
                shortLabel: 'Kalender',
                icon: Calendar,
                badge: urgentCalendarCounts[6] > 0 ? urgentCalendarCounts[6] : undefined,
                badgeColor: 'bg-rose-500 text-white'
              }
            ]
          }
        ]
      }
    ],
    [pendingSpkCount, readyToPackCount, lowStockCount, donasiProyeks.length, urgentCalendarCounts]
  );

  // Filter categories & menu items by search keyword
  const filteredCategories = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return categoriesConfig;

    return categoriesConfig
      .map(cat => {
        const matchedDivisions = cat.divisions
          .map(div => {
            const divMatches =
              div.name.toLowerCase().includes(q) ||
              div.code.toLowerCase().includes(q) ||
              cat.categoryTitle.toLowerCase().includes(q);
            const matchedSubs = div.subItems.filter(
              sub =>
                sub.label.toLowerCase().includes(q) || sub.shortLabel.toLowerCase().includes(q)
            );
            if (divMatches) {
              return div;
            }
            if (matchedSubs.length > 0) {
              return { ...div, subItems: matchedSubs };
            }
            return null;
          })
          .filter(Boolean) as SidebarDivisionGroup[];

        if (matchedDivisions.length === 0) return null;
        return { ...cat, divisions: matchedDivisions };
      })
      .filter(Boolean) as SidebarCategorySection[];
  }, [categoriesConfig, menuSearch]);

  const handleSelectMenuItem = (divId: DivisionId, subTabId: string) => {
    if (currentUser.divisi_id !== divId) {
      switchDivision(divId, subTabId);
    } else {
      setCurrentSubTab(subTabId);
    }
    onCloseMobile();
  };

  const handleClickDivisionHeader = (div: SidebarDivisionGroup) => {
    if (isCollapsed) {
      // In collapsed icon mode, clicking a division icon immediately switches to it
      handleSelectMenuItem(div.id, div.defaultSubTab);
      return;
    }

    if (currentUser.divisi_id !== div.id) {
      switchDivision(div.id, div.defaultSubTab);
      setExpandedDivisions(prev => ({ ...prev, [div.id]: true }));
    } else {
      setExpandedDivisions(prev => ({ ...prev, [div.id]: !prev[div.id] }));
    }
  };

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const renderSidebarBody = (forMobile = false) => {
    const effectiveCollapsed = forMobile ? false : isCollapsed;
    let runningDivisionIndex = 0;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#15181C] text-slate-800 dark:text-slate-100 border-r border-slate-200/90 dark:border-slate-800/90 select-none overflow-hidden">
        {/* Top Sidebar Header: Brand & Collapse Toggle with Staggered Morph */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className={`flex items-center ${
            effectiveCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          } h-14 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 overflow-hidden`}
        >
          <motion.div
            layout="position"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="flex items-center space-x-2.5 min-w-0"
          >
            {!effectiveCollapsed && (
              <motion.div
                layout="position"
                initial={{ scale: 0.85, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24, delay: 0.02 }}
                className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0"
              >
                LM
              </motion.div>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {!effectiveCollapsed && (
                <motion.div
                  key="sidebar-brand-text"
                  initial={{ opacity: 0, x: -12, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -10, filter: 'blur(2px)' }}
                  transition={{
                    duration: 0.24,
                    delay: 0.04,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="min-w-0"
                >
                  <p className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    Menu Kategori MIS
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    6 Direktorat Terpadu
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {forMobile ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Menu Sidebar"
            >
              <X className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              layout="position"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={effectiveCollapsed ? 'Perluas Sidebar Menu (Kiri)' : 'Kecilkan Sidebar ke Mode Ikon'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {effectiveCollapsed ? (
                  <motion.span
                    key="icon-open"
                    initial={{ opacity: 0, rotate: -90, scale: 0.75 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.75 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="block"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="icon-close"
                    initial={{ opacity: 0, rotate: 90, scale: 0.75 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.75 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="block"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </motion.div>

        {/* Quick Menu Filter Input (Staggered Expand/Collapse) */}
        <AnimatePresence initial={false}>
          {!effectiveCollapsed && (
            <motion.div
              key="sidebar-search-box"
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{
                duration: 0.24,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="border-b border-slate-100 dark:border-slate-800/70 shrink-0 overflow-hidden"
            >
              <div className="p-3">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    placeholder="Filter menu atau kategori..."
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                  {menuSearch && (
                    <button
                      type="button"
                      onClick={() => setMenuSearch('')}
                      className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categorized Scrollable Navigation Tree with Staggered Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 no-scrollbar overflow-x-hidden">
          {filteredCategories.map((cat, catIdx) => {
            const isCatCollapsed = collapsedCategories[cat.id] && !menuSearch.trim();
            const catStaggerDelay = 0.04 + catIdx * 0.045;

            return (
              <motion.div
                layout="position"
                key={cat.id}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="space-y-1.5"
              >
                {/* Category Header with Smooth Crossfade */}
                <AnimatePresence mode="wait" initial={false}>
                  {!effectiveCollapsed ? (
                    <motion.button
                      key={`cat-header-${cat.id}`}
                      type="button"
                      initial={{ opacity: 0, x: -10, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, x: -8, filter: 'blur(2px)' }}
                      transition={{
                        duration: 0.22,
                        delay: catStaggerDelay,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      onClick={() => toggleCategoryCollapse(cat.id)}
                      className="w-full flex items-center justify-between px-2 py-1 text-left group cursor-pointer"
                      title={cat.categorySubtitle}
                    >
                      <div className="min-w-0">
                        <span
                          className={`block text-[10px] font-extrabold uppercase tracking-wider ${cat.categoryBadgeColor}`}
                        >
                          {cat.categoryTitle}
                        </span>
                        <span className="block text-[9.5px] text-slate-400 dark:text-slate-500 truncate">
                          {cat.categorySubtitle}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isCatCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </motion.button>
                  ) : (
                    <motion.div
                      key={`cat-divider-${cat.id}`}
                      initial={{ opacity: 0, scaleX: 0.4 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.4 }}
                      transition={{ duration: 0.2, delay: catIdx * 0.03 }}
                      className="h-px bg-slate-200 dark:bg-slate-800 mx-2 my-1 origin-center"
                    />
                  )}
                </AnimatePresence>

                {/* Divisions inside this Category */}
                {!isCatCollapsed && (
                  <div className="space-y-1.5">
                    {cat.divisions.map(div => {
                      const DivIcon = div.icon;
                      const isActiveDivision = currentUser.divisi_id === div.id;
                      const isExpanded =
                        Boolean(menuSearch.trim()) || Boolean(expandedDivisions[div.id]);
                      const divOrder = runningDivisionIndex++;
                      const itemStaggerDelay = 0.05 + divOrder * 0.032;

                      return (
                        <motion.div
                          layout="position"
                          key={div.id}
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                          className={`rounded-2xl transition-colors ${
                            isActiveDivision && !effectiveCollapsed
                              ? 'bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/90 p-1.5'
                              : ''
                          }`}
                        >
                          {/* Division Item Button */}
                          <motion.button
                            layout="position"
                            type="button"
                            whileHover={{ x: effectiveCollapsed ? 0 : 2, scale: effectiveCollapsed ? 1.06 : 1 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            onClick={() => handleClickDivisionHeader(div)}
                            title={`${div.name} (${div.code})`}
                            className={`w-full flex items-center ${
                              effectiveCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                            } rounded-xl text-xs font-bold transition-colors cursor-pointer overflow-hidden ${
                              isActiveDivision
                                ? div.activePillBg
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <motion.div
                              layout="position"
                              transition={{
                                type: 'spring',
                                stiffness: 360,
                                damping: 28,
                                delay: itemStaggerDelay * 0.4
                              }}
                              className={`flex items-center ${
                                effectiveCollapsed ? 'justify-center' : 'space-x-2.5'
                              } min-w-0`}
                            >
                              <motion.div
                                layout="position"
                                animate={{
                                  scale: effectiveCollapsed ? 1.08 : 1
                                }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 380,
                                  damping: 24,
                                  delay: itemStaggerDelay * 0.5
                                }}
                                className={`relative flex items-center justify-center shrink-0 ${
                                  !isActiveDivision ? div.accentText : 'text-white'
                                }`}
                              >
                                <DivIcon className="w-4 h-4" />
                                {effectiveCollapsed && urgentCalendarCounts[div.id] > 0 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
                                  />
                                )}
                              </motion.div>

                              <AnimatePresence initial={false} mode="popLayout">
                                {!effectiveCollapsed && (
                                  <motion.div
                                    key={`div-label-${div.id}`}
                                    initial={{ opacity: 0, x: -10, filter: 'blur(2px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: -8, filter: 'blur(2px)' }}
                                    transition={{
                                      duration: 0.22,
                                      delay: itemStaggerDelay,
                                      ease: [0.22, 1, 0.36, 1]
                                    }}
                                    className="truncate text-left"
                                  >
                                    <span className="block truncate leading-tight">{div.name}</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>

                            <AnimatePresence initial={false} mode="popLayout">
                              {!effectiveCollapsed && (
                                <motion.div
                                  key={`div-meta-${div.id}`}
                                  initial={{ opacity: 0, x: 8, scale: 0.9 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: 6, scale: 0.9 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: itemStaggerDelay + 0.03,
                                    ease: [0.22, 1, 0.36, 1]
                                  }}
                                  className="flex items-center space-x-1.5 shrink-0"
                                >
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-extrabold ${
                                      isActiveDivision
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    {div.code}
                                  </span>
                                  <motion.span
                                    animate={{ rotate: isExpanded ? 0 : -90 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                                    className="inline-flex"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5 opacity-75" />
                                  </motion.span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>

                          {/* Sub-menu Items under Division with Staggered Cascade */}
                          <AnimatePresence initial={false}>
                            {!effectiveCollapsed && isExpanded && (
                              <motion.div
                                key={`sub-list-${div.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  height: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                                  opacity: { duration: 0.2, delay: 0.03 }
                                }}
                                className="overflow-hidden"
                              >
                                <div className="mt-1 pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 ml-3.5">
                                  {div.subItems.map((sub, subIdx) => {
                                    const SubIcon = sub.icon;
                                    const isSubActive =
                                      isActiveDivision && currentSubTab === sub.id;

                                    return (
                                      <motion.button
                                        key={sub.id}
                                        type="button"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -6 }}
                                        transition={{
                                          duration: 0.2,
                                          delay: itemStaggerDelay + 0.02 + subIdx * 0.022,
                                          ease: [0.22, 1, 0.36, 1]
                                        }}
                                        whileHover={{ x: 2.5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectMenuItem(div.id, sub.id)}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11.5px] transition-colors cursor-pointer ${
                                          isSubActive
                                            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200/70 dark:border-indigo-800/70 shadow-2xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50 font-medium'
                                        }`}
                                      >
                                        <span className="flex items-center space-x-2 min-w-0 truncate">
                                          <SubIcon
                                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                                              isSubActive
                                                ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                                                : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                          />
                                          <span className="truncate">{sub.label}</span>
                                        </span>

                                        {sub.badge !== undefined && (
                                          <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                              delay: itemStaggerDelay + 0.06 + subIdx * 0.022
                                            }}
                                            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold shrink-0 ${
                                              sub.badgeColor ||
                                              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                                            }`}
                                          >
                                            {sub.badge}
                                          </motion.span>
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Quick Shortcuts Section with Staggered Icon & Text Transitions */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5 shrink-0 overflow-hidden"
        >
          <AnimatePresence initial={false}>
            {!effectiveCollapsed && (
              <motion.span
                key="footer-shortcuts-title"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, delay: 0.12 }}
                className="px-2 block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Pintasan Cepat
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            layout="position"
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCurrentSubTab('kalender');
              onCloseMobile();
            }}
            title="Buka Kalender & To-Do List Divisi Aktif"
            className={`w-full flex items-center ${
              effectiveCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
            } rounded-xl text-xs font-bold transition-colors cursor-pointer overflow-hidden ${
              currentSubTab === 'kalender'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            <motion.span layout="position" className="flex items-center space-x-2 min-w-0">
              <Calendar
                className={`w-3.5 h-3.5 shrink-0 ${
                  currentSubTab === 'kalender' ? 'text-white' : 'text-indigo-500'
                }`}
              />
              <AnimatePresence initial={false} mode="popLayout">
                {!effectiveCollapsed && (
                  <motion.span
                    key="shortcut-cal-text"
                    initial={{ opacity: 0, x: -8, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -6, filter: 'blur(2px)' }}
                    transition={{ duration: 0.22, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="truncate"
                  >
                    Kalender & To-Do
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>

            <AnimatePresence initial={false} mode="popLayout">
              {!effectiveCollapsed && (
                <motion.span
                  key="shortcut-cal-badge"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18, delay: 0.18 }}
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                    currentSubTab === 'kalender'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                  }`}
                >
                  12 Bln
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.div
            layout
            className={`grid ${effectiveCollapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-1.5'}`}
          >
            <motion.button
              layout="position"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                openPresentationMode();
                onCloseMobile();
              }}
              title="Buka Layar Presentasi Mode Rapat Pleno"
              className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-400/40 transition-colors cursor-pointer overflow-hidden"
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <AnimatePresence initial={false} mode="popLayout">
                {!effectiveCollapsed && (
                  <motion.span
                    key="shortcut-pleno-text"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.2, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="truncate"
                  >
                    Rapat Pleno
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {onOpenAI && (
              <motion.button
                layout="position"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onOpenAI();
                  onCloseMobile();
                }}
                title="Buka Asisten AI SAPA-ALL MIS"
                className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer overflow-hidden"
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <AnimatePresence initial={false} mode="popLayout">
                  {!effectiveCollapsed && (
                    <motion.span
                      key="shortcut-ai-text"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2, delay: 0.21, ease: [0.22, 1, 0.36, 1] }}
                      className="truncate"
                    >
                      Tanya AI
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Left Sidebar with Spring Width Animation */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 288 }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 32,
          mass: 0.85
        }}
        className="print:hidden hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30 overflow-hidden"
      >
        {renderSidebarBody(false)}
      </motion.aside>

      {/* Mobile / Tablet Slide-over Left Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="print:hidden fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative w-76 max-w-[86vw] h-full z-10 shadow-2xl"
            >
              {renderSidebarBody(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
