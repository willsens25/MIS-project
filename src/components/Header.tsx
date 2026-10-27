import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { DivisionId } from '../types';
import { SHOW_DUMMY_BUTTON } from '../lib/config';
import { NotificationBell } from './NotificationBell';
import { MascotAvatar } from './MascotAvatar';
import { EditProfileModal } from './profile/EditProfileModal';
import { UserSettingsModal } from './profile/UserSettingsModal';
import { DivisionReportModal } from './modals/DivisionReportModal';
import { AnnualReportModal } from './modals/AnnualReportModal';
import { ThemePresetModal } from './theme/ThemePresetModal';
import { NightShiftHeaderButton } from './theme/NightShiftHeaderButton';
import { BackupRestoreModal } from './common/BackupRestoreModal';
import { DataImportExportModal } from './modals/DataImportExportModal';
import { getColorPreset, COLOR_PRESETS } from '../lib/themePresets';
import {
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  Sun,
  Moon,
  Palette,
  Bot,
  User,
  UserCog,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  Users,
  KeyRound,
  FileDown,
  Printer,
  FileText,
  Award,
  Trash2,
  Database,
  Menu,
  X,
  SlidersHorizontal,
  FileSpreadsheet,
  Tv,
  Eye,
  EyeOff,
  ShieldAlert,
  MonitorPlay,
  PanelLeft,
  Keyboard,
  Search,
  Paperclip,
  Mic
} from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
  onOpenPersetujuan: () => void;
  onSimulateAutoLogout?: () => void;
  onToggleLeftSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  isLeftSidebarCollapsed?: boolean;
  onOpenHotkeyMap?: () => void;
  onOpenCommandPalette?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAI,
  onOpenPersetujuan,
  onSimulateAutoLogout,
  onToggleLeftSidebar,
  onOpenMobileSidebar,
  isLeftSidebarCollapsed,
  onOpenHotkeyMap,
  onOpenCommandPalette,
}) => {
  const {
    currentUser,
    switchDivision,
    divisiList,
    usersList,
    theme,
    themeMode,
    toggleTheme,
    colorPreset,
    setColorPreset,
    userSettings,
    pengajuans,
    resetToDefault,
    clearAllData,
    loadDemoData,
    isAuthenticated,
    logout,
    openLoginModal,
    openRegisterModal,
    quickLoginAs,
    isPrivacyMode,
    togglePrivacyMode,
    openPresentationMode,
    nightShift,
    isNightShiftActive,
    toggleNightShift,
    openDocumentArchive,
    attachments,
    openVoiceActivation
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDivisiMenu, setShowDivisiMenu] = useState(false);
  const [showPlenoMenu, setShowPlenoMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [showThemePresetModal, setShowThemePresetModal] = useState(false);
  const [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false);
  const [backupRestoreInitialTab, setBackupRestoreInitialTab] = useState<'backup' | 'restore' | 'seeder'>('backup');
  const [showDataImportExportModal, setShowDataImportExportModal] = useState(false);
  const [dataImportExportInitialTab, setDataImportExportInitialTab] = useState<'import' | 'export'>('import');
  const [dataImportExportInitialDataType, setDataImportExportInitialDataType] = useState<'books' | 'members'>('books');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeColorPreset = getColorPreset(colorPreset);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowPlenoMenu(false);
        setShowToolsMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLoadDemoWithToast = () => {
    loadDemoData();
    setShowProfileMenu(false);
    setToastMessage('✅ Seluruh data sampel berhasil dimuat! (10 Buku, 5 Mutasi Kas, 2 Invoice, 5 Anggota)');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleClearDataWithToast = () => {
    clearAllData();
    setShowProfileMenu(false);
    setToastMessage('🗑️ Seluruh data aplikasi berhasil dikosongkan (0 Data Bersih).');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const pendingPengajuansCount = pengajuans.filter(p => p.status === 'pending').length;

  const getDivisionIcon = (id: DivisionId) => {
    switch (id) {
      case 1: return <Building2 className="w-4 h-4" />;
      case 2: return <Wallet className="w-4 h-4" />;
      case 3: return <BookOpen className="w-4 h-4" />;
      case 4: return <ShoppingBag className="w-4 h-4" />;
      case 5: return <Factory className="w-4 h-4" />;
      case 6: return <Truck className="w-4 h-4" />;
    }
  };

  return (
    <header className="print:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#0e131b]/80 backdrop-blur-xl text-slate-800 dark:text-white border-b border-slate-200/80 dark:border-white/[0.08] shadow-2xs transition-colors duration-200">
      <div className="w-full px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          
          {/* Left: Sidebar Trigger, Logo & Active Division Context Pill */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            {/* Mobile Left Sidebar Drawer Button */}
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="lg:hidden h-8.5 w-8.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Buka Menu Sidebar Kiri (Kategori)"
                aria-label="Buka Menu Sidebar Kiri"
              >
                <PanelLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>
            )}

            {/* Desktop Left Sidebar Collapse/Expand Toggle */}
            {onToggleLeftSidebar && (
              <button
                type="button"
                onClick={onToggleLeftSidebar}
                className="hidden lg:flex items-center space-x-1.5 h-8.5 px-2.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] hover:bg-indigo-50/80 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/[0.08] text-xs font-semibold transition-colors cursor-pointer"
                title={isLeftSidebarCollapsed ? 'Tampilkan Menu Sidebar Kiri' : 'Kecilkan Sidebar Kiri'}
              >
                <PanelLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden xl:inline text-xs">Sidebar</span>
              </button>
            )}

            <div className="flex items-center">
              <img
                src="/img/logo-lamrimnesia.png"
                alt="Logo Lamrimnesia"
                className="h-8 sm:h-9 w-auto object-contain rounded-lg shadow-2xs hover:opacity-95 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Compact, Refined Division & Category Context Pill */}
            <div className="hidden md:flex items-center pl-2.5 border-l border-slate-200/80 dark:border-white/[0.08]">
              <div className="inline-flex items-center space-x-1.5 h-8.5 px-2.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08]">
                <span className="text-indigo-600 dark:text-indigo-400">
                  {getDivisionIcon(currentUser.divisi_id)}
                </span>
                <span>
                  {divisiList.find(d => d.id === currentUser.divisi_id)?.nama_divisi || 'Direktorat'}
                </span>
                <span className="hidden 2xl:inline text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  · {currentUser.divisi_id === 1 || currentUser.divisi_id === 2
                      ? 'Tata Kelola'
                      : currentUser.divisi_id === 3 || currentUser.divisi_id === 5
                      ? 'Redaksi'
                      : 'Niaga'}
                </span>
                {currentUser.divisi_id === 2 && pendingPengajuansCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Ada pengajuan cetak pending" />
                )}
              </div>
            </div>
          </div>

          {/* Center: Clean Global Command Palette Search Bar (Ctrl+K / ⌘K) */}
          {onOpenCommandPalette && (
            <div className="hidden md:flex items-center justify-center flex-1 max-w-xs xl:max-w-sm mx-2">
              <motion.button
                id="btn-global-command-palette"
                type="button"
                onClick={onOpenCommandPalette}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-2 h-8.5 px-3 bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-500 dark:text-slate-400 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs font-medium shadow-2xs transition-all cursor-pointer group"
                title="Buka Command Palette Pencarian Global (Ctrl+K atau ⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                <span className="flex-1 text-left text-slate-500 dark:text-slate-400 font-normal truncate">
                  Cari cepat menu & data...
                </span>
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  ⌘K
                </kbd>
              </motion.button>
            </div>
          )}

          {/* Right: Coordinated Action Groups & User Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Desktop Actions Container (Hidden on Mobile < lg) */}
            <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2">

              {/* Cluster 1: Mode Rapat Pleno & Executive Tools */}
              <div className="flex items-center space-x-1.5">
                {/* Mode Rapat Pleno (Projector View & Privacy Shield) */}
                <div className="relative">
                  <motion.button
                    id="btn-mode-rapat-pleno"
                    onClick={() => setShowPlenoMenu(!showPlenoMenu)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className={`h-8.5 flex items-center space-x-1.5 px-2.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer border ${
                      isPrivacyMode
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/[0.08]'
                    }`}
                    title="Mode Rapat Pleno & Sensor Privasi Proyektor LCD (Alt+P)"
                  >
                    {isPrivacyMode ? (
                      <EyeOff className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                    ) : (
                      <Tv className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    )}
                    <span className="hidden xl:inline">
                      {isPrivacyMode ? 'Sensor Aktif' : 'Pleno'}
                    </span>
                    {isPrivacyMode && (
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                    )}
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </motion.button>

                  <AnimatePresence>
                    {showPlenoMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowPlenoMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-40 text-slate-800 dark:text-slate-100"
                        >
                          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Fitur Rapat Pleno LCD
                              </span>
                              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-200 dark:border-indigo-800">
                                Proyektor
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Dirancang untuk presentasi ke layar besar di hadapan dewan pengurus & pengawas.
                            </p>
                          </div>

                          <div className="p-1 space-y-1">
                            {/* Option 1: Open Presentation Slides Modal */}
                            <button
                              onClick={() => {
                                setShowPlenoMenu(false);
                                openPresentationMode();
                              }}
                              className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                            >
                              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                                <Tv className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                  <span>Buka Layar Rapat Pleno</span>
                                  <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                                    Alt+Shift+P
                                  </kbd>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                  Tampilan ringkas metrik besar, grafik naskah, fashili, & risalah pengesahan dewan.
                                </p>
                              </div>
                            </button>

                            {/* Option 2: Toggle Privacy Masking */}
                            <button
                              onClick={() => {
                                togglePrivacyMode();
                                setShowPlenoMenu(false);
                              }}
                              className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                                isPrivacyMode
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg shrink-0 group-hover:scale-105 transition-transform ${
                                  isPrivacyMode
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold flex items-center justify-between">
                                  <span>{isPrivacyMode ? 'Nonaktifkan Sensor' : 'Aktifkan Sensor Privasi'}</span>
                                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Alt+P
                                  </kbd>
                                </div>
                                <p className="text-[11px] opacity-75 leading-tight mt-0.5">
                                  {isPrivacyMode
                                    ? 'Seluruh angka & nominal saat ini disensor dengan efek blur / asterik.'
                                    : 'Samarkan saldo kas & nomor kontak pribadi saat laptop terhubung proyektor.'}
                                </p>
                              </div>
                            </button>

                            {/* Option 3: Open Global Hotkey Map */}
                            {onOpenHotkeyMap && (
                              <button
                                onClick={() => {
                                  setShowPlenoMenu(false);
                                  onOpenHotkeyMap();
                                }}
                                className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-2"
                              >
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                                  <Keyboard className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>Peta Pintasan Keyboard</span>
                                    <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      ? / Alt+H
                                    </kbd>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                    Lihat seluruh daftar hotkey (Alt+P, Alt+Shift+P, Ctrl+K, Alt+1..6).
                                  </p>
                                </div>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Digital Document Archive Button */}
                <motion.button
                  id="btn-document-archive"
                  onClick={() => openDocumentArchive()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="h-8.5 flex items-center space-x-1.5 px-2.5 bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs font-medium shadow-2xs transition-all cursor-pointer group"
                  title={`Pusat Arsip Dokumen & Lampiran Bukti Transaksi (${attachments.length} file)`}
                >
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden 2xl:inline">Arsip</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                    {attachments.length}
                  </span>
                </motion.button>

                {/* Download PDF Report Button */}
                <motion.button
                  id="btn-download-pdf-report"
                  onClick={() => setShowReportModal(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="h-8.5 flex items-center space-x-1.5 px-2.5 bg-indigo-50/90 dark:bg-indigo-500/10 hover:bg-indigo-100/90 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-500/30 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Download PDF Report — Cetak Ringkasan Laporan Divisi"
                >
                  <FileDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="hidden 2xl:inline">PDF</span>
                </motion.button>

                {/* Global Hotkey Map Button */}
                {onOpenHotkeyMap && (
                  <motion.button
                    id="btn-global-hotkey-map"
                    type="button"
                    onClick={onOpenHotkeyMap}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="hidden xl:flex h-8.5 w-8.5 items-center justify-center bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs font-medium shadow-2xs transition-all cursor-pointer"
                    title="Peta Pintasan Keyboard (Pencet ? atau Alt+H)"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  </motion.button>
                )}
              </div>

              {/* Subtle Vertical Divider */}
              <div className="h-4.5 w-px bg-slate-200/80 dark:border-white/[0.08] mx-0.5" />

              {/* Cluster 2: AI Assistant Button */}
              <motion.button
                id="btn-gemini-assistant"
                onClick={onOpenAI}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="h-8.5 flex items-center space-x-2 px-2.5 bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-teal-500/10 hover:from-teal-500/25 hover:to-emerald-500/25 text-teal-800 dark:text-teal-200 border border-teal-500/30 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer group"
                title="Tanya Asisten AI MIS Lamrimnesia"
              >
                <MascotAvatar
                  size="xs"
                  variant="badge"
                  interactive={false}
                  enableIdleAnimation={userSettings?.mascotIdleAnimationEnabled !== false}
                  className="w-5 h-5 group-hover:scale-110 transition-transform shadow-xs"
                />
                <span className="font-bold">AI MIS</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                </span>
              </motion.button>

              {/* Voice Command & Navigation Button (Web Speech API) */}
              <motion.button
                id="btn-voice-activation-header"
                type="button"
                onClick={openVoiceActivation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8.5 flex items-center space-x-1.5 px-2.5 bg-slate-100/90 dark:bg-white/[0.06] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/90 dark:border-white/[0.08] hover:border-teal-400/40 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                title="Aktivasi Perintah Suara (Alt+V) — Pindah divisi atau ajukan query AI menggunakan mikrofon"
                aria-label="Aktivasi Perintah Suara"
              >
                <Mic className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline">Suara</span>
                <kbd className="hidden 2xl:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Alt+V
                </kbd>
              </motion.button>

              {/* Subtle Vertical Divider */}
              <div className="h-4.5 w-px bg-slate-200/80 dark:border-white/[0.08] mx-0.5" />

              {/* Cluster 3: Appearance & Notifications */}
              <div className="flex items-center space-x-1.5">
                {/* Clean, Elegant Animated Theme Mode Toggle */}
                <motion.button
                  id="btn-theme-toggle"
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  aria-label={
                    theme === 'dark'
                      ? 'Mode Gelap Aktif — Klik untuk beralih ke Mode Terang'
                      : 'Mode Terang Aktif — Klik untuk beralih ke Mode Gelap'
                  }
                  title={
                    themeMode === 'system-synced'
                      ? `Tema Otomatis Berdasarkan Posisi Matahari (Mode ${theme === 'dark' ? 'Gelap' : 'Terang'}) — Klik untuk alih manual (Alt+T)`
                      : theme === 'dark'
                      ? 'Mode Gelap Aktif — Klik untuk Mode Terang (Alt+T)'
                      : 'Mode Terang Aktif — Klik untuk Mode Gelap (Alt+T)'
                  }
                  className="relative h-8.5 w-8.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                      <motion.div
                        key="dark"
                        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                      >
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="light"
                        initial={{ rotate: 90, scale: 0.7, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -90, scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {themeMode === 'system-synced' && (
                    <span
                      className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                      title="System-Synced Aktif"
                    />
                  )}
                </motion.button>

                {/* Night Shift Mode Quick Button & Popover */}
                <NightShiftHeaderButton
                  onOpenSettingsModal={() => setShowUserSettingsModal(true)}
                />

                {/* Color Theme Preset Selector Trigger */}
                <motion.button
                  id="btn-color-theme-preset"
                  type="button"
                  onClick={() => setShowThemePresetModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-8.5 px-2 flex items-center space-x-1.5 bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                  title={`Palet Warna Aksen: ${activeColorPreset.name} (Klik untuk kustomisasi)`}
                  aria-label={`Palet Warna: ${activeColorPreset.name}`}
                >
                  <div className="relative flex items-center shrink-0 w-4 h-4 pointer-events-none">
                    <span
                      className="w-3 h-3 rounded-full shadow-xs border border-white dark:border-slate-800 z-10 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: activeColorPreset.primaryHex }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-xs border border-white dark:border-slate-800 -ml-1.5 opacity-90 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: activeColorPreset.secondaryHex }}
                    />
                  </div>
                  <span className="hidden 2xl:inline text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    {activeColorPreset.name}
                  </span>
                </motion.button>

                {/* Division-Specific Notification Bell */}
                <NotificationBell
                  onOpenPersetujuan={onOpenPersetujuan}
                />
              </div>

              {/* Subtle Vertical Divider */}
              <div className="h-4.5 w-px bg-slate-200/80 dark:border-white/[0.08] mx-0.5" />

              {/* Cluster 4: Auth, Profile & DEV shortcut */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-header-login"
                    onClick={openLoginModal}
                    className="flex items-center space-x-1.5 h-8.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>
                  <button
                    id="btn-header-register"
                    onClick={openRegisterModal}
                    className="hidden sm:flex items-center space-x-1.5 h-8.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </button>
                </div>
              ) : (
                <>
                  {SHOW_DUMMY_BUTTON && (
                    <button
                      id="btn-header-quick-dummy"
                      type="button"
                      onClick={handleLoadDemoWithToast}
                      className="hidden 2xl:flex items-center space-x-1.5 h-8.5 px-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Pintasan Uji Coba: Muat Data Dummy"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[9px] bg-amber-400/25 text-amber-800 dark:text-amber-200 px-1 py-0.2 rounded font-mono font-bold">
                        DEV
                      </span>
                    </button>
                  )}

                  <div className="relative">
                    <motion.button
                      id="btn-user-profile"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="h-8.5 flex items-center space-x-2 bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border border-slate-200/90 dark:border-white/[0.08] px-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-1 ring-white/40">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="hidden xl:block text-left">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[110px]">{currentUser.name}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-none">{divisiList.find(d => d.id === currentUser.divisi_id)?.nama_divisi}</div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                    {/* User Card Header with Quick Edit Trigger */}
                    <div
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowEditProfileModal(true);
                      }}
                      className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      title="Klik untuk mengedit profil Anda"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-indigo-500/20">
                            {currentUser.avatar ? (
                              <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-indigo-600 text-white rounded-full shadow-xs">
                            <UserCog className="w-2.5 h-2.5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/40">
                              {divisiList.find(d => d.id === currentUser.divisi_id)?.nama_divisi}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">({currentUser.role || 'Staff'})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Edit Profile Action */}
                      <button
                        id="menu-edit-profile"
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowEditProfileModal(true);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-semibold transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300">
                            <UserCog className="w-3.5 h-3.5" />
                          </div>
                          <span>Edit Profil Saya</span>
                        </div>
                        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded font-normal group-hover:underline">
                          Ubah Nama & Foto
                        </span>
                      </button>

                      {/* User Settings & Mascot Bubble Preferences */}
                      <button
                        id="menu-user-settings"
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowUserSettingsModal(true);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 font-semibold transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1 rounded-md bg-teal-100 dark:bg-teal-900/80 text-teal-600 dark:text-teal-300">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </div>
                          <span>Pengaturan Pengguna & AI</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          userSettings?.mascotSpeechBubbleEnabled
                            ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          Balon: {userSettings?.mascotSpeechBubbleEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        id="menu-switch-account"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowSwitchUserModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Users className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" />
                        <span>Ganti Akun / Switch User</span>
                      </button>

                      <button
                        id="menu-register-new-user"
                        onClick={() => {
                          setShowProfileMenu(false);
                          openRegisterModal();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-teal-600 dark:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2.5 text-teal-600 dark:text-teal-400" />
                        <span>Daftar Akun Baru</span>
                      </button>

                      <button
                        id="menu-persetujuan-cetak"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenPersetujuan();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2.5" />
                        <span>Persetujuan Cetak</span>
                        {pendingPengajuansCount > 0 && (
                          <span className="ml-auto bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {pendingPengajuansCount}
                          </span>
                        )}
                      </button>

                      <button
                        id="menu-dashboard-layout-config"
                        onClick={() => {
                          setShowProfileMenu(false);
                          switchDivision(1, 'overview');
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium cursor-pointer"
                        title="Atur tata letak dan prioritas kartu informasi dashboard divisi"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2.5" />
                        <span>Layout Configurator</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                          Drag & Drop
                        </span>
                      </button>

                      <button
                        id="menu-download-pdf-report"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowReportModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium"
                      >
                        <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2.5" />
                        <span>Download PDF Report Divisi</span>
                      </button>

                      <button
                        id="menu-annual-report"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowAnnualReportModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors font-medium"
                      >
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2.5" />
                        <span>Laporan Tahunan Yayasan</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                          Annual
                        </span>
                      </button>

                      {/* Mode Rapat Pleno */}
                      <button
                        id="menu-mode-rapat-pleno"
                        onClick={() => {
                          setShowProfileMenu(false);
                          openPresentationMode();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium cursor-pointer"
                      >
                        <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2.5" />
                        <span>Mode Rapat Pleno (Layar Presentasi)</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                          Slide LCD
                        </span>
                      </button>

                      {/* Sensor Privasi Finansial */}
                      <button
                        id="menu-toggle-privacy-mode"
                        onClick={() => {
                          togglePrivacyMode();
                          setShowProfileMenu(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-xs transition-colors font-medium cursor-pointer ${
                          isPrivacyMode
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {isPrivacyMode ? (
                          <EyeOff className="w-4 h-4 text-amber-500 mr-2.5" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500 mr-2.5" />
                        )}
                        <span>{isPrivacyMode ? 'Sensor Finansial (Aktif)' : 'Sensor Finansial Layar'}</span>
                        <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          Alt+P
                        </span>
                      </button>

                      <button
                        id="menu-import-export-excel"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setDataImportExportInitialTab('import');
                          setShowDataImportExportModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors font-medium cursor-pointer"
                        title="Impor atau ekspor massal data buku, anggota, penjualan, dan mutasi Excel / CSV"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2.5" />
                        <span>Impor & Ekspor Excel (.xlsx)</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                          Spreadsheet
                        </span>
                      </button>

                      <button
                        id="menu-backup-restore"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setBackupRestoreInitialTab('backup');
                          setShowBackupRestoreModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors font-medium cursor-pointer"
                        title="Ekspor cadangan database lengkap JSON atau pulihkan data"
                      >
                        <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2.5" />
                        <span>Cadangan & Pulihkan Database</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                          JSON
                        </span>
                      </button>

                      <button
                        id="menu-database-seeder"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setBackupRestoreInitialTab('seeder');
                          setShowBackupRestoreModal(true);
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors font-medium cursor-pointer"
                        title="Buat data dummy otomatis dengan counter jumlah data"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2.5" />
                        <span>Database Seeder (Data Dummy)</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                          Generator
                        </span>
                      </button>
                    </div>

                    {/* Session Security Status */}
                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Auto-Logout Sesi</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          30 Menit Aktif
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Sesi ditutup otomatis setelah 30 menit tidak aktif demi keamanan data.
                      </p>
                      {onSimulateAutoLogout && (
                        <button
                          id="btn-simulate-inactivity-warning"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onSimulateAutoLogout();
                          }}
                          className="mt-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          title="Simulasi 28.5 menit tidak aktif untuk menguji dialog hitung mundur auto-logout"
                        >
                          <span>⏱️ Uji Peringatan Sesi (Simulasi)</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        {theme === 'dark' ? (
                          <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Mode Tampilan</span>
                      </span>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                      >
                        {themeMode === 'system-synced'
                          ? `Auto 🌅 (${theme === 'dark' ? 'Gelap' : 'Terang'})`
                          : theme === 'dark'
                          ? 'Mode Gelap 🌙'
                          : 'Mode Terang ☀️'}
                      </button>
                    </div>

                    <div className="px-4 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Moon className={`w-3.5 h-3.5 ${isNightShiftActive ? 'text-amber-500 fill-amber-400/30' : 'text-slate-400'}`} />
                        <span>Mode Lembur (Eye-Care)</span>
                      </span>
                      <button
                        type="button"
                        onClick={toggleNightShift}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border cursor-pointer transition-colors ${
                          isNightShiftActive
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isNightShiftActive ? `Aktif (${nightShift.warmth}%)` : 'Nonaktif'}
                      </button>
                    </div>

                    <div className="px-4 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Palet Warna Aksen</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowThemePresetModal(true);
                        }}
                        className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: activeColorPreset.primaryHex }}
                        />
                        <span>{activeColorPreset.name}</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
                      <button
                        id="btn-logout"
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        <span>Keluar (Logout)</span>
                      </button>

                      <button
                        id="btn-clear-all-data"
                        onClick={handleClearDataWithToast}
                        className="w-full flex items-center px-4 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2.5" />
                        <span>Kosongkan Semua Data (0 Data)</span>
                      </button>

                      {SHOW_DUMMY_BUTTON && (
                        <button
                          id="btn-load-demo-data"
                          onClick={handleLoadDemoWithToast}
                          className="w-full flex items-center px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Database className="w-4 h-4 mr-2.5" />
                          <span>Muat Data Demo / Sampel</span>
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono">
                            DEV ONLY
                          </span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
            </div>

            {/* Mobile Actions Container (Visible on Mobile/Tablet < lg) */}
            <div className="flex lg:hidden items-center space-x-1 sm:space-x-1.5">
              {/* Quick Search on Mobile */}
              {onOpenCommandPalette && (
                <motion.button
                  id="btn-mobile-search"
                  type="button"
                  onClick={onOpenCommandPalette}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 shadow-2xs cursor-pointer"
                  title="Pencarian Cepat (Ctrl+K)"
                  aria-label="Pencarian Cepat"
                >
                  <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </motion.button>
              )}

              {/* Quick AI Trigger */}
              <motion.button
                id="btn-mobile-ai-trigger"
                onClick={onOpenAI}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 text-teal-800 dark:text-teal-200 shadow-2xs cursor-pointer"
                title="Tanya Asisten AI MIS Lamrimnesia"
                aria-label="Asisten AI"
              >
                <MascotAvatar size="xs" variant="badge" interactive={false} className="w-5 h-5" />
              </motion.button>

              {/* Mobile Document Archive Trigger */}
              <motion.button
                id="btn-mobile-doc-archive"
                onClick={() => openDocumentArchive()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-2xs cursor-pointer"
                title={`Buka Arsip Dokumen (${attachments.length} file)`}
                aria-label="Arsip Dokumen"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>

              {/* Mobile Notification Bell */}
              <NotificationBell
                onOpenPersetujuan={onOpenPersetujuan}
              />

              {/* Mobile Theme Toggle Button */}
              <motion.button
                id="btn-mobile-theme-toggle"
                type="button"
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="h-8.5 w-8.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs cursor-pointer flex items-center justify-center"
                title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                aria-label="Ganti Tema Tampilan"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </motion.button>

              {/* Mobile User Profile Avatar Trigger */}
              {isAuthenticated ? (
                <button
                  id="btn-mobile-profile-avatar"
                  type="button"
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center justify-center w-8.5 h-8.5 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs ring-1 ring-white/40 shadow-2xs cursor-pointer shrink-0"
                  title="Menu Profil Saya"
                  aria-label="Buka Menu Profil"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </button>
              ) : (
                <button
                  id="btn-mobile-login"
                  type="button"
                  onClick={openLoginModal}
                  className="h-8.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Masuk
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-2xl border border-teal-500/40 flex items-center space-x-2 pointer-events-auto"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch User Modal */}
      {showSwitchUserModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ganti Akun MIS</h3>
              </div>
              <button
                onClick={() => setShowSwitchUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih pengguna untuk langsung beralih profil dan hak akses:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {usersList.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => {
                    quickLoginAs(usr.id);
                    setShowSwitchUserModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    currentUser.id === usr.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                      {usr.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{usr.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{usr.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/30">
                      {divisiList.find(d => d.id === usr.divisi_id)?.kode}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{usr.role}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShowSwitchUserModal(false);
                  openRegisterModal();
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Pengguna Baru</span>
              </button>
              <button
                onClick={() => setShowSwitchUserModal(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit User Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      {/* Division PDF Report Modal */}
      <DivisionReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetDivisionId={currentUser.divisi_id}
      />

      {/* Annual Executive Report Modal */}
      <AnnualReportModal
        isOpen={showAnnualReportModal}
        onClose={() => setShowAnnualReportModal(false)}
      />

      {/* Theme & Color Preset Customizer Modal */}
      <ThemePresetModal
        isOpen={showThemePresetModal}
        onClose={() => setShowThemePresetModal(false)}
      />

      {/* User Settings & Mascot Bubble Preferences Modal */}
      <UserSettingsModal
        isOpen={showUserSettingsModal}
        onClose={() => setShowUserSettingsModal(false)}
        onOpenBackupRestore={() => {
          setBackupRestoreInitialTab('backup');
          setShowBackupRestoreModal(true);
        }}
        onOpenSeeder={() => {
          setBackupRestoreInitialTab('seeder');
          setShowBackupRestoreModal(true);
        }}
      />

      {/* Database Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={showBackupRestoreModal}
        onClose={() => setShowBackupRestoreModal(false)}
        initialTab={backupRestoreInitialTab}
      />

      {/* Spreadsheet Excel / CSV Import & Export Modal */}
      <DataImportExportModal
        isOpen={showDataImportExportModal}
        onClose={() => setShowDataImportExportModal(false)}
        initialTab={dataImportExportInitialTab}
        initialDataType={dataImportExportInitialDataType}
      />

    </header>
  );
};

