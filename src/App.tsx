import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Check, Sparkles, Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { DirektoratDashboard } from './components/direktorat/DirektoratDashboard';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { PenerbitanDashboard } from './components/penerbitan/PenerbitanDashboard';
import { MarketingDashboard } from './components/marketing/MarketingDashboard';
import { ProduksiDashboard } from './components/produksi/ProduksiDashboard';
import { LogistikDashboard } from './components/logistik/LogistikDashboard';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MascotAvatar } from './components/MascotAvatar';
import { AuthModal } from './components/auth/AuthModal';
import { SessionTimeoutModal } from './components/modals/SessionTimeoutModal';
import { DivisionReportModal } from './components/modals/DivisionReportModal';
import { AnnualReportModal } from './components/modals/AnnualReportModal';
import { QuickActionsFloatingMenu } from './components/navigation/QuickActionsFloatingMenu';
import { useAutoLogout } from './hooks/useAutoLogout';
import { DivisionId } from './types';
import { playPleasantClickSound, playPleasantSuccessChime, isEnvironmentMuted, toggleSoundMuted } from './utils/soundEffects';

const AppContent: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    switchDivision,
    logout,
    recordActivity,
    aiAppState,
    lastCompletedTaskMessage,
  } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showDivisionReportModal, setShowDivisionReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [reportTargetDivisi, setReportTargetDivisi] = useState<DivisionId | undefined>(undefined);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => isEnvironmentMuted());
  const [showMascotFeedbackRing, setShowMascotFeedbackRing] = useState(false);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);

  useEffect(() => {
    const syncMuteState = () => {
      setIsSoundMuted(isEnvironmentMuted());
    };
    window.addEventListener('mis-sound-state-change', syncMuteState);
    document.addEventListener('visibilitychange', syncMuteState);
    return () => {
      window.removeEventListener('mis-sound-state-change', syncMuteState);
      document.removeEventListener('visibilitychange', syncMuteState);
    };
  }, []);

  // Audio feedback when an app task or AI response completes successfully
  useEffect(() => {
    if (aiAppState === 'success') {
      playPleasantSuccessChime();
    }
  }, [aiAppState]);

  const handleMascotClick = () => {
    // 1. Play subtle pleasant tactile click sound (automatically muted in noise-sensitive environments)
    playPleasantClickSound();

    // 2. Audio-visual feedback ripple ring
    setShowMascotFeedbackRing(true);
    setTimeout(() => setShowMascotFeedbackRing(false), 550);

    // 3. Open AI modal
    setIsAiModalOpen(true);
  };

  const handleToggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = toggleSoundMuted();
    setIsSoundMuted(nextMuted);
    setSoundNotice(nextMuted ? 'Mode Senyap Aktif (Suara Hening)' : 'Efek Suara Aktif (Audio-Visual Klik)');
    setTimeout(() => setSoundNotice(null), 2500);
  };

  // Auto-logout after 30 minutes of inactivity
  const {
    showWarningModal,
    remainingSeconds,
    refreshActivity,
    simulateTimeoutWarning,
  } = useAutoLogout({
    isAuthenticated,
    onLogout: logout,
    onAutoLogoutRecord: (reason) => {
      recordActivity('Auto-Logout Sesi', 'Auth', reason);
    },
  });

  const handleOpenPersetujuan = () => {
    switchDivision(2, 'persetujuan');
  };

  const handleOpenAuditLogs = () => {
    switchDivision(1, 'audit');
  };

  // If user is not logged in, display the full-screen authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
        <AuthModal
          isOpen={true}
          isForcedScreen={true}
          initialMode={authModalMode || 'register'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Division Navigation */}
      <Header
        onOpenAI={() => setIsAiModalOpen(true)}
        onOpenAuditLogs={handleOpenAuditLogs}
        onOpenPersetujuan={handleOpenPersetujuan}
        onSimulateAutoLogout={simulateTimeoutWarning}
      />

      {/* Breadcrumb Navigation Bar */}
      <BreadcrumbNav />

      {/* Main Content Area with Division Switch Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser.divisi_id}
            id="printable-area"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full printable-dashboard"
          >
            {currentUser.divisi_id === 1 && <DirektoratDashboard />}
            {currentUser.divisi_id === 2 && <FinanceDashboard />}
            {currentUser.divisi_id === 3 && <PenerbitanDashboard />}
            {currentUser.divisi_id === 4 && <MarketingDashboard />}
            {currentUser.divisi_id === 5 && <ProduksiDashboard />}
            {currentUser.divisi_id === 6 && <LogistikDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm print:hidden">
        <p>© {new Date().getFullYear()} Yayasan Pelestarian & Pengembangan Lamrim Nusantara (Lamrimnesia). SAPA-ALL MIS Project.</p>
      </footer>

      {/* Global AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Floating AI Assistant Mascot Trigger with Audio-Visual Feedback & Environment Mute */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center print:hidden">
        {/* Environment Mute / Sound Toggle Mini Pill */}
        <button
          id="btn-toggle-sound-environment"
          type="button"
          onClick={handleToggleSound}
          className={`absolute -top-2 -left-2 z-50 p-1.5 rounded-full text-xs shadow-md border backdrop-blur-xs transition-all duration-150 cursor-pointer ${
            isSoundMuted
              ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 hover:bg-amber-200'
              : 'bg-white/95 dark:bg-slate-800/95 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700/80 hover:bg-teal-50 dark:hover:bg-slate-700'
          }`}
          title={
            isSoundMuted
              ? 'Mode Senyap Aktif: Efek suara dibisukan (sesuai untuk rapat/ruang kerja tenang). Klik untuk aktifkan efek suara.'
              : 'Efek Suara Aktif: Memberikan feedback klik taktil. Klik untuk mengaktifkan Mode Senyap (Mute).'
          }
          aria-label={isSoundMuted ? 'Aktifkan Efek Suara' : 'Bisukan Suara (Mode Senyap)'}
        >
          {isSoundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>

        {/* Temporary Feedback Toast for Sound Toggle */}
        <AnimatePresence>
          {soundNotice && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: -55, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 bottom-full mb-1 whitespace-nowrap px-2.5 py-1 bg-slate-900/90 dark:bg-slate-800/95 text-white text-[11px] font-medium rounded-lg shadow-xl border border-slate-700 pointer-events-none"
            >
              {soundNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking State Floating Pill */}
        <AnimatePresence>
          {aiAppState === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: -48, scale: 1 }}
              exit={{ opacity: 0, y: -56, scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className="absolute right-0 bottom-full mb-1 whitespace-nowrap px-3 py-1 bg-violet-900/95 text-violet-100 text-xs font-semibold rounded-full shadow-2xl border border-violet-400/50 flex items-center gap-1.5 backdrop-blur-md pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
              <span>AI Sedang Berpikir...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State Floating Pill */}
        <AnimatePresence>
          {aiAppState === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: -48, scale: 1 }}
              exit={{ opacity: 0, y: -56, scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className="absolute right-0 bottom-full mb-1 whitespace-nowrap px-3 py-1 bg-emerald-700/95 dark:bg-emerald-800/95 text-white text-xs font-semibold rounded-full shadow-2xl border border-emerald-300/60 flex items-center gap-1.5 backdrop-blur-md pointer-events-none"
            >
              <Check className="w-3.5 h-3.5 text-emerald-200 stroke-[3]" />
              <span>{lastCompletedTaskMessage || 'Tugas Berhasil Diselesaikan!'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="btn-floating-ai-mascot"
          type="button"
          onClick={handleMascotClick}
          onContextMenu={(e) => {
            e.preventDefault();
            handleToggleSound();
          }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            aiAppState === 'thinking'
              ? { y: [0, -6, 0], scale: 1, opacity: 1 }
              : { y: 0, scale: 1, opacity: 1 }
          }
          transition={
            aiAppState === 'thinking'
              ? {
                  y: { repeat: Infinity, duration: 1.15, ease: 'easeInOut' },
                  scale: { type: 'spring', stiffness: 350, damping: 20 }
                }
              : { type: 'spring', stiffness: 350, damping: 20 }
          }
          className={`relative p-1 rounded-full cursor-pointer group flex items-center justify-center transition-colors duration-300 ${
            aiAppState === 'thinking'
              ? 'border-2 border-violet-500 shadow-xl shadow-violet-500/50 ring-2 ring-violet-400/50 bg-violet-50 dark:bg-violet-950/80'
              : aiAppState === 'success'
              ? 'border-2 border-emerald-500 shadow-[0_0_28px_rgba(16,185,129,0.75)] ring-4 ring-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/90'
              : 'border-2 border-teal-500/90 shadow-2xl bg-white dark:bg-slate-900 hover:shadow-teal-500/30'
          }`}
          title={
            aiAppState === 'thinking'
              ? 'AI sedang berpikir / memproses respon... Klik untuk membuka Asisten AI'
              : aiAppState === 'success'
              ? `Tugas Selesai: ${lastCompletedTaskMessage || 'Sukses'}! Klik untuk membuka Asisten AI`
              : `Buka Asisten AI MIS Lamrimnesia ${isSoundMuted ? '(Mode Senyap Aktif)' : '(Audio-Visual Aktif)'} - Klik Kanan untuk Toggle Mute`
          }
          aria-label={
            aiAppState === 'thinking'
              ? 'Asisten AI sedang berpikir'
              : aiAppState === 'success'
              ? 'Tugas selesai'
              : 'Buka Asisten AI MIS Lamrimnesia'
          }
        >
          {/* Thinking State Rotating Radiant Aura */}
          {aiAppState === 'thinking' && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
              className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-teal-400 opacity-80 blur-[2px] pointer-events-none"
            />
          )}

          {/* Success State Celebratory Glow Shockwave */}
          {aiAppState === 'success' && (
            <motion.span
              initial={{ scale: 0.85, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400 dark:border-emerald-300 pointer-events-none"
            />
          )}

          {/* Audio-Visual Click Feedback Ripple Ring */}
          {showMascotFeedbackRing && (
            <motion.span
              initial={{ scale: 0.85, opacity: 0.9 }}
              animate={{ scale: 1.95, opacity: 0 }}
              transition={{ duration: 0.52, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full border-2 pointer-events-none ${
                aiAppState === 'thinking'
                  ? 'border-violet-400 dark:border-violet-300'
                  : aiAppState === 'success'
                  ? 'border-emerald-400 dark:border-emerald-300'
                  : 'border-teal-400 dark:border-teal-300'
              }`}
            />
          )}

          <div className="relative">
            <MascotAvatar size="md" variant="badge" interactive={false} className="shadow-xs" />

            {/* Reactive State Badge */}
            {aiAppState === 'thinking' ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-violet-600 text-white border-2 border-white dark:border-slate-900 shadow-xs">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                </span>
              </span>
            ) : aiAppState === 'success' ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-emerald-600 text-white border-2 border-white dark:border-slate-900 shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border-2 border-white dark:border-slate-900" />
              </span>
            )}
          </div>
        </motion.button>
      </div>

      {/* Floating Quick Actions Menu */}
      <QuickActionsFloatingMenu
        onOpenAI={() => setIsAiModalOpen(true)}
        onOpenDivisionReport={(divId) => {
          setReportTargetDivisi(divId || currentUser.divisi_id);
          setShowDivisionReportModal(true);
        }}
        onOpenAnnualReport={() => setShowAnnualReportModal(true)}
      />

      {/* Division Report Modal triggered from Quick Actions */}
      <DivisionReportModal
        isOpen={showDivisionReportModal}
        onClose={() => setShowDivisionReportModal(false)}
        targetDivisionId={reportTargetDivisi || currentUser.divisi_id}
      />

      {/* Annual Report Modal triggered from Quick Actions */}
      <AnnualReportModal
        isOpen={showAnnualReportModal}
        onClose={() => setShowAnnualReportModal(false)}
      />

      {/* Overlay Auth Modal (for Register/Login from inside dashboard) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        isForcedScreen={false}
      />

      {/* 30-Minute Inactivity Auto-Logout Warning Modal */}
      <SessionTimeoutModal
        isOpen={showWarningModal}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={refreshActivity}
        onLogoutNow={logout}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
