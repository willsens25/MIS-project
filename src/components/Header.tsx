import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { DivisionId } from '../types';
import { SHOW_DUMMY_BUTTON } from '../lib/config';
import { NotificationBell } from './NotificationBell';
import { MascotAvatar } from './MascotAvatar';
import { EditProfileModal } from './profile/EditProfileModal';
import { DivisionReportModal } from './modals/DivisionReportModal';
import { AnnualReportModal } from './modals/AnnualReportModal';
import {
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  Sun,
  Moon,
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
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
  onOpenAuditLogs: () => void;
  onOpenPersetujuan: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAI,
  onOpenAuditLogs,
  onOpenPersetujuan,
}) => {
  const {
    currentUser,
    switchDivision,
    divisiList,
    usersList,
    theme,
    toggleTheme,
    pengajuans,
    resetToDefault,
    clearAllData,
    loadDemoData,
    isAuthenticated,
    logout,
    openLoginModal,
    openRegisterModal,
    quickLoginAs
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDivisiMenu, setShowDivisiMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowMobileMenu(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showMobileMenu]);

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
    <header className="print:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <img
                src="/img/logo-lamrimnesia.png"
                alt="Logo Lamrimnesia"
                className="h-9 sm:h-10 w-auto object-contain rounded-lg shadow-xs hover:opacity-95 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Division Switcher Bar with Animated Sliding Pill */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 relative">
              {divisiList.map((div) => {
                const isActive = currentUser.divisi_id === div.id;
                return (
                  <motion.button
                    key={div.id}
                    id={`btn-divisi-${div.kode.toLowerCase()}`}
                    onClick={() => switchDivision(div.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-10 cursor-pointer ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={div.deskripsi}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-division-pill"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}
                    {getDivisionIcon(div.id)}
                    <span>{div.kode}</span>
                    {div.id === 2 && pendingPengajuansCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Desktop Actions Container (Hidden on Mobile < lg) */}
            <div className="hidden lg:flex items-center space-x-2.5">

            {/* Download PDF Report Button */}
            <motion.button
              id="btn-download-pdf-report"
              onClick={() => setShowReportModal(true)}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-600/25 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download PDF Report — Cetak Ringkasan Laporan Divisi"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Laporan PDF</span>
              <span className="sm:hidden inline">PDF</span>
            </motion.button>

            {/* AI Assistant Button with Mascot Logo */}
            <motion.button
              id="btn-gemini-assistant"
              onClick={onOpenAI}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700/70 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer group"
              title="Tanya Asisten AI MIS Lamrimnesia"
            >
              <MascotAvatar size="xs" variant="badge" interactive={false} className="w-5 h-5 group-hover:scale-110 transition-transform shadow-xs" />
              <span className="hidden sm:inline font-bold">AI MIS</span>
            </motion.button>

            {/* Division-Specific Notification Bell */}
            <NotificationBell
              onOpenPersetujuan={onOpenPersetujuan}
              onOpenAuditLogs={onOpenAuditLogs}
            />

            {/* Persistent UI Theme Toggle Switch Button */}
            <motion.button
              id="btn-theme-toggle"
              type="button"
              role="switch"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Mode Gelap Aktif — Klik untuk beralih ke Mode Terang' : 'Mode Terang Aktif — Klik untuk beralih ke Mode Gelap'}
              title={theme === 'dark' ? 'Mode Gelap Aktif — Klik untuk beralih ke Mode Terang (Light Mode)' : 'Mode Terang Aktif — Klik untuk beralih ke Mode Gelap (Dark Mode)'}
              className={`relative inline-flex items-center h-8 rounded-full p-1 transition-colors cursor-pointer select-none border shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 group ${
                theme === 'dark'
                  ? 'bg-slate-800/95 border-slate-700 hover:border-slate-600 text-slate-200'
                  : 'bg-slate-200/90 border-slate-300 hover:border-slate-400 text-slate-700'
              }`}
            >
              <span className="sr-only">Toggle theme</span>
              {/* Dual icon background track */}
              <span className="flex items-center justify-between w-[52px] px-1 pointer-events-none">
                <Sun className={`w-3.5 h-3.5 transition-colors duration-200 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <Moon className={`w-3.5 h-3.5 transition-colors duration-200 ${theme === 'dark' ? 'text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
              </span>

              {/* Sliding thumb */}
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center border border-slate-200/90 dark:border-slate-700 pointer-events-none ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform duration-200" />
                )}
              </motion.span>
            </motion.button>

            {/* If Not Authenticated: Show Login / Register Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-header-login"
                  onClick={openLoginModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
                <button
                  id="btn-header-register"
                  onClick={openRegisterModal}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
              </div>
            ) : (
              /* Authenticated User Profile & Actions Dropdown */
              <>
                {SHOW_DUMMY_BUTTON && (
                  <button
                    id="btn-header-quick-dummy"
                    type="button"
                    onClick={handleLoadDemoWithToast}
                    className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
                    title="Pintasan Uji Coba: Muat Data Dummy (Otomatis tidak muncul di versi publish)"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Data Dummy</span>
                    <span className="text-[9px] bg-amber-400/25 text-amber-800 dark:text-amber-200 px-1 py-0.2 rounded font-mono font-bold">
                      DEV
                    </span>
                  </button>
                )}

                <div className="relative">
                <motion.button
                  id="btn-user-profile"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-1 ring-white/40">
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
                  <div className="hidden md:block text-left">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">{divisiList.find(d => d.id === currentUser.divisi_id)?.nama_divisi}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
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

                      <button
                        id="menu-audit-log"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAuditLogs();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400 mr-2.5" />
                        <span>Audit System Log</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        {theme === 'dark' ? (
                          <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Tema Tampilan</span>
                      </span>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                      >
                        {theme === 'dark' ? 'Mode Gelap 🌙' : 'Mode Terang ☀️'}
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
            <div className="flex lg:hidden items-center space-x-1.5 sm:space-x-2">
              {/* Quick AI Trigger */}
              <motion.button
                id="btn-mobile-ai-trigger"
                onClick={onOpenAI}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                className="flex items-center justify-center p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700/60 text-teal-800 dark:text-teal-200 shadow-xs cursor-pointer"
                title="Tanya Asisten AI MIS Lamrimnesia"
              >
                <MascotAvatar size="xs" variant="badge" interactive={false} className="w-5 h-5" />
              </motion.button>

              {/* Mobile Notification Bell */}
              <NotificationBell
                onOpenPersetujuan={onOpenPersetujuan}
                onOpenAuditLogs={onOpenAuditLogs}
              />

              {/* Mobile Hamburger Menu Toggle Button */}
              <motion.button
                id="btn-mobile-menu-toggle"
                type="button"
                onClick={() => setShowMobileMenu(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Buka Menu Navigasi Modul"
                aria-expanded={showMobileMenu}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer transition-colors"
              >
                <Menu className="w-5 h-5" />
                {pendingPengajuansCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </motion.button>
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

      {/* Mobile Navigation Drawer Portal (Small Screens < lg) */}
      {showMobileMenu && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Slide-in Panel */}
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-sm h-full bg-white dark:bg-[#15181C] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Top Bar with Logo & Close */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/img/logo-lamrimnesia.png"
                  alt="Logo Lamrimnesia"
                  className="h-8 w-auto object-contain rounded-lg shadow-xs"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">SAPA-ALL MIS</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Navigasi Modul & Operasional</p>
                </div>
              </div>

              <button
                id="btn-close-mobile-menu"
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Account / Auth Card */}
              {isAuthenticated ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 ring-2 ring-indigo-500/20">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        currentUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {divisiList.find(d => d.id === currentUser.divisi_id)?.kode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      id="btn-mobile-switch-user"
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowSwitchUserModal(true);
                      }}
                      className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Ganti Akun</span>
                    </button>
                    <button
                      id="btn-mobile-edit-profile"
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowEditProfileModal(true);
                      }}
                      className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                    >
                      <UserCog className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Edit Profil</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    id="btn-mobile-login"
                    onClick={() => {
                      setShowMobileMenu(false);
                      openLoginModal();
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>
                  <button
                    id="btn-mobile-register"
                    onClick={() => {
                      setShowMobileMenu(false);
                      openRegisterModal();
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </button>
                </div>
              )}

              {/* Modul Divisi Navigasi Section */}
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Modul Divisi Operasional ({divisiList.length})
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Sentuh untuk buka
                  </span>
                </div>

                <div className="space-y-1.5">
                  {divisiList.map((div) => {
                    const isActive = currentUser.divisi_id === div.id;
                    return (
                      <button
                        key={div.id}
                        id={`btn-mobile-nav-div-${div.kode.toLowerCase()}`}
                        onClick={() => {
                          switchDivision(div.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {getDivisionIcon(div.id)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate">{div.nama_divisi}</p>
                            <p className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {div.deskripsi}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          {div.id === 2 && pendingPengajuansCount > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 animate-pulse'
                            }`}>
                              {pendingPengajuansCount}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-indigo-700/60 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {div.kode}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Action Tools & Services */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 mb-2 block">
                  Layanan & Laporan MIS
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Tanya AI Assistant */}
                  <button
                    id="btn-mobile-ai-assistant"
                    onClick={() => {
                      setShowMobileMenu(false);
                      onOpenAI();
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-300/70 dark:border-teal-700/60 text-teal-900 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors text-left cursor-pointer"
                  >
                    <MascotAvatar size="xs" variant="badge" interactive={false} className="w-5 h-5 shrink-0" />
                    <span className="truncate">Tanya AI MIS</span>
                  </button>

                  {/* Unduh Laporan PDF Divisi */}
                  <button
                    id="btn-mobile-pdf-report"
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowReportModal(true);
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-300/70 dark:border-indigo-700/60 text-indigo-900 dark:text-indigo-200 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors text-left cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">Laporan PDF</span>
                  </button>

                  {/* Laporan Tahunan / Audit PDF */}
                  <button
                    id="btn-mobile-annual-report"
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowAnnualReportModal(true);
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">Audit Tahunan</span>
                  </button>

                  {/* Log Audit Aktivitas */}
                  <button
                    id="btn-mobile-audit-logs"
                    onClick={() => {
                      setShowMobileMenu(false);
                      onOpenAuditLogs();
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Log Audit</span>
                  </button>
                </div>
              </div>

              {/* Pengaturan Tampilan & Sistem */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium">
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Mode Tampilan</span>
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors shadow-xs"
                  >
                    {theme === 'dark' ? 'Mode Gelap 🌙' : 'Mode Terang ☀️'}
                  </button>
                </div>

                {SHOW_DUMMY_BUTTON && (
                  <button
                    id="btn-mobile-load-dummy"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLoadDemoWithToast();
                    }}
                    className="w-full flex items-center justify-between p-2 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Muat Data Demo / Sampel</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-mono">
                      DEV
                    </span>
                  </button>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <button
                    id="btn-mobile-clear-all"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleClearDataWithToast();
                    }}
                    className="w-full flex items-center px-2 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                    <span>Kosongkan Semua Data (0 Data)</span>
                  </button>

                  {isAuthenticated && (
                    <button
                      id="btn-mobile-logout"
                      onClick={() => {
                        setShowMobileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2 shrink-0" />
                      <span>Keluar (Logout)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center shrink-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                SAPA-ALL MIS v4.0 • Yayasan Lamrimnesia
              </p>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </header>
  );
};

