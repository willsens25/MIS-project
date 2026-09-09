import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { DivisionId } from '../types';
import { NotificationBell } from './NotificationBell';
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
  Award
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
    isAuthenticated,
    logout,
    openLoginModal,
    openRegisterModal,
    quickLoginAs
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDivisiMenu, setShowDivisiMenu] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1A1D21]/95 backdrop-blur-md text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
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

            {/* Division Switcher Bar */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {divisiList.map((div) => {
                const isActive = currentUser.divisi_id === div.id;
                return (
                  <button
                    key={div.id}
                    id={`btn-divisi-${div.kode.toLowerCase()}`}
                    onClick={() => switchDivision(div.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
                    }`}
                    title={div.deskripsi}
                  >
                    {getDivisionIcon(div.id)}
                    <span>{div.kode}</span>
                    {div.id === 2 && pendingPengajuansCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Mobile Division Selector Dropdown */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setShowDivisiMenu(!showDivisiMenu)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700"
              >
                {getDivisionIcon(currentUser.divisi_id)}
                <span>{divisiList.find(d => d.id === currentUser.divisi_id)?.kode}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showDivisiMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Pilih Divisi MIS
                  </div>
                  {divisiList.map(div => (
                    <button
                      key={div.id}
                      onClick={() => {
                        switchDivision(div.id);
                        setShowDivisiMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left ${
                        currentUser.divisi_id === div.id
                          ? 'bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {getDivisionIcon(div.id)}
                        <span>{div.nama_divisi}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{div.kode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download PDF Report Button */}
            <button
              id="btn-download-pdf-report"
              onClick={() => setShowReportModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-600/25 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Download PDF Report — Cetak Ringkasan Laporan Divisi"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Laporan PDF</span>
              <span className="sm:hidden inline">PDF</span>
            </button>

            {/* AI Assistant Button */}
            <button
              id="btn-gemini-assistant"
              onClick={onOpenAI}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-600/30 hover:bg-emerald-100 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Tanya Asisten AI Gemini MIS"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">AI MIS</span>
            </button>

            {/* Division-Specific Notification Bell */}
            <NotificationBell
              onOpenPersetujuan={onOpenPersetujuan}
              onOpenAuditLogs={onOpenAuditLogs}
            />

            {/* Persistent UI Theme Toggle Switch Button */}
            <button
              id="btn-theme-toggle"
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Mode Gelap Aktif — Klik untuk beralih ke Mode Terang' : 'Mode Terang Aktif — Klik untuk beralih ke Mode Gelap'}
              title={theme === 'dark' ? 'Mode Gelap Aktif — Klik untuk beralih ke Mode Terang (Light Mode)' : 'Mode Terang Aktif — Klik untuk beralih ke Mode Gelap (Dark Mode)'}
              className={`relative inline-flex items-center h-8 rounded-full p-1 transition-all duration-300 cursor-pointer select-none border shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 group ${
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
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-sm transform transition-transform duration-300 ease-out flex items-center justify-center border border-slate-200/90 dark:border-slate-700 pointer-events-none ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform duration-200" />
                )}
              </span>
            </button>

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
              <div className="relative">
                <button
                  id="btn-user-profile"
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
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                        id="btn-reset-data"
                        onClick={() => {
                          if (confirm('Kembalikan database ke seed awal pabrik?')) {
                            resetToDefault();
                            setShowProfileMenu(false);
                          }
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 mr-2.5" />
                        <span>Reset Data Default</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

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
    </header>
  );
};

