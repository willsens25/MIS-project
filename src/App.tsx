import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Check, Sparkles, Loader2, Settings, Sliders } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { TopGreetingBanner } from './components/navigation/TopGreetingBanner';
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
import { UserSettingsModal } from './components/profile/UserSettingsModal';
import { QuickActionsFloatingMenu } from './components/navigation/QuickActionsFloatingMenu';
import { useAutoLogout } from './hooks/useAutoLogout';
import { DivisionId } from './types';
import { playPleasantClickSound, playPleasantSuccessChime, isEnvironmentMuted, toggleSoundMuted } from './utils/soundEffects';
import { getWelcomeSalutation, getDivisionGreetingOptions, getTimeBasedSalutation } from './utils/greetingUtils';

interface MascotParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  isSparkle?: boolean;
}

const MASCOT_HOVER_PARTICLES: MascotParticle[] = [
  { id: 1, x: 0, y: -38, size: 5, color: 'bg-teal-400 dark:bg-teal-300 shadow-teal-400/60', delay: 0 },
  { id: 2, x: 26, y: -26, size: 4.5, color: 'bg-amber-400 dark:bg-amber-300 shadow-amber-400/60', delay: 0.03, isSparkle: true },
  { id: 3, x: 38, y: 0, size: 5, color: 'bg-cyan-400 dark:bg-cyan-300 shadow-cyan-400/60', delay: 0.01 },
  { id: 4, x: 28, y: 28, size: 4, color: 'bg-emerald-400 dark:bg-emerald-300 shadow-emerald-400/60', delay: 0.04 },
  { id: 5, x: 0, y: 38, size: 5, color: 'bg-teal-300 dark:bg-teal-200 shadow-teal-300/60', delay: 0.02 },
  { id: 6, x: -28, y: 28, size: 4.5, color: 'bg-violet-400 dark:bg-violet-300 shadow-violet-400/60', delay: 0.05, isSparkle: true },
  { id: 7, x: -38, y: 0, size: 5, color: 'bg-amber-300 dark:bg-amber-200 shadow-amber-300/60', delay: 0.01 },
  { id: 8, x: -26, y: -26, size: 4, color: 'bg-sky-400 dark:bg-sky-300 shadow-sky-400/60', delay: 0.03 },
  { id: 9, x: 14, y: -44, size: 3.5, color: 'bg-rose-300 dark:bg-rose-200 shadow-rose-300/60', delay: 0.06 },
  { id: 10, x: -14, y: -44, size: 3.5, color: 'bg-yellow-300 dark:bg-yellow-200 shadow-yellow-300/60', delay: 0.04, isSparkle: true },
];

interface DivisionContextInfo {
  divisionName: string;
  divisionCode: string;
  badgeColor: string;
  dotColor: string;
  activeComponentLabel: string;
  primaryShortcut: string; // e.g. 'Query Finance', 'Check Production'
  suggestedPrompt: string;
  secondaryShortcut?: string;
  secondaryPrompt?: string;
}

const getDivisionContextInfo = (divisiId: number, subTab: string): DivisionContextInfo => {
  switch (divisiId) {
    case 2: // Bendahara / Finance
      return {
        divisionName: 'Bendahara / Finance',
        divisionCode: 'KEU',
        badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        dotColor: 'bg-emerald-500',
        activeComponentLabel:
          subTab === 'mutasi' ? 'Jurnal Mutasi' :
          subTab === 'persetujuan' ? 'Persetujuan Cetak' :
          subTab === 'laporan' ? 'Laporan Kas' : 'Kas & Bank',
        primaryShortcut: 'Query Finance',
        suggestedPrompt: 'Berapa saldo kas aktif dan total mutasi bulan ini?',
        secondaryShortcut: 'Cek Verifikasi Invoice',
        secondaryPrompt: 'Cek invoice yang belum diverifikasi atau pending pembayaran'
      };
    case 3: // Penerbitan
      return {
        divisionName: 'Penerbitan & Editorial',
        divisionCode: 'PNB',
        badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        dotColor: 'bg-indigo-500',
        activeComponentLabel:
          subTab === 'katalog' ? 'Katalog & ISBN' :
          subTab === 'pengajuan' ? 'Pengajuan Cetak' :
          subTab === 'hpp' ? 'Kalkulator HPP' : 'Katalog Buku',
        primaryShortcut: 'Query Penerbitan',
        suggestedPrompt: 'Cek judul buku dengan margin HPP dan stok paling optimal',
        secondaryShortcut: 'Cek Status ISBN',
        secondaryPrompt: 'Rangkum buku yang belum memiliki nomor ISBN terdaftar'
      };
    case 4: // Marketing & Sales
      return {
        divisionName: 'Marketing & Distribution',
        divisionCode: 'MAD',
        badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-500',
        activeComponentLabel:
          subTab === 'bazaar' ? 'Agenda Bazaar & Konsinyasi' :
          subTab === 'event_pos' ? 'Kasir Event Bazaar' :
          subTab === 'pos' ? 'POS Kasir Pesanan' :
          subTab === 'promos' ? 'Kupon Promo' :
          subTab === 'saluran' ? 'Saluran & Ekspedisi' :
          subTab === 'whatsapp' ? 'Otomatisasi WhatsApp' :
          subTab === 'grafik' ? 'Grafik Penjualan' : 'Pesanan & Invoice',
        primaryShortcut: subTab === 'bazaar' ? 'Cek Stok Bazaar' : 'Query Marketing',
        suggestedPrompt: subTab === 'bazaar'
          ? 'Rangkum status alokasi buku ke stan bazaar dan hitung sisa buku yang belum kembali'
          : 'Rangkum pesanan terbaru dan kupon promo paling aktif',
        secondaryShortcut: subTab === 'bazaar' ? 'Rekonsiliasi Stan' : 'Draft Promo WA',
        secondaryPrompt: subTab === 'bazaar'
          ? 'Bagaimana alur rekonsiliasi sisa buku pameran dan pengembalian stok ke gudang?'
          : 'Buatkan draf penawaran promo WhatsApp untuk pelanggan'
      };
    case 5: // Produksi
      return {
        divisionName: 'Produksi Percetakan',
        divisionCode: 'PRD',
        badgeColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
        dotColor: 'bg-orange-500',
        activeComponentLabel:
          subTab === 'spk' ? 'SPK Pabrikasi' :
          subTab === 'qc' ? 'Quality Control' :
          subTab === 'logs' ? 'Log Pabrikasi' : 'Jadwal Percetakan',
        primaryShortcut: 'Check Production',
        suggestedPrompt: 'Rangkum status antrean SPK cetak dan estimasi selesai produksi',
        secondaryShortcut: 'Cek Kebutuhan Cetak',
        secondaryPrompt: 'Buku apa saja yang mendesak diajukan cetak ulang?'
      };
    case 6: // Logistik
      return {
        divisionName: 'Logistik & Gudang',
        divisionCode: 'LOG',
        badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        dotColor: 'bg-cyan-500',
        activeComponentLabel:
          subTab === 'antrean' ? 'Antrean Packing' :
          subTab === 'stok' ? 'Stok Gudang Riil' :
          subTab === 'ekspedisi' ? 'Ekspedisi Pengiriman' : 'Surat Jalan Gudang',
        primaryShortcut: 'Check Logistics',
        suggestedPrompt: 'Berapa pesanan siap kirim dan buku dengan stok menipis (<20 pcs)?',
        secondaryShortcut: 'Draft Surat Jalan',
        secondaryPrompt: 'Buatkan draf surat jalan pengiriman ekspedisi hari ini'
      };
    case 1: // Direktorat
    default:
      return {
        divisionName: 'Direktorat & HRD',
        divisionCode: 'DIR',
        badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
        dotColor: 'bg-teal-500',
        activeComponentLabel:
          subTab === 'audit' ? 'Log Audit Aktivitas' :
          subTab === 'users' ? 'Manajemen Staf' :
          subTab === 'kpi' ? 'KPI & Evaluasi' : 'Ringkasan Eksekutif',
        primaryShortcut: 'Query Direktorat',
        suggestedPrompt: 'Rangkum performa operasional seluruh divisi dan peringatan penting',
        secondaryShortcut: 'Audit Aktivitas',
        secondaryPrompt: 'Tampilkan rekap aktivitas pengguna terbaru lintas divisi'
      };
  }
};

const AppContent: React.FC = () => {
  const {
    currentUser,
    currentSubTab,
    divisiList,
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    switchDivision,
    logout,
    recordActivity,
    aiAppState,
    lastCompletedTaskMessage,
    userSettings,
    toggleMascotSpeechBubble,
  } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [showDivisionReportModal, setShowDivisionReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [reportTargetDivisi, setReportTargetDivisi] = useState<DivisionId | undefined>(undefined);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => isEnvironmentMuted());
  const [showMascotFeedbackRing, setShowMascotFeedbackRing] = useState(false);
  const [isMascotHovered, setIsMascotHovered] = useState(false);
  const [mascotBurstKey, setMascotBurstKey] = useState(0);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);
  const [speechBubbleMessage, setSpeechBubbleMessage] = useState<string>('');
  const [isSpeechBubbleVisible, setIsSpeechBubbleVisible] = useState<boolean>(false);
  const speechBubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const triggerSpeechBubble = useCallback(() => {
    // If user has disabled mascot speech bubbles globally in settings, do not show
    if (!userSettings?.mascotSpeechBubbleEnabled) {
      return;
    }

    cancelDismissTimer();

    if (speechBubbleTimerRef.current) {
      clearTimeout(speechBubbleTimerRef.current);
    }
    const currentDivisi = divisiList.find(d => d.id === currentUser.divisi_id);
    const greetings = getDivisionGreetingOptions(
      currentUser.name,
      currentUser.divisi_id,
      currentDivisi?.nama_divisi
    );
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setSpeechBubbleMessage(greetings[randomIndex]);
    setIsSpeechBubbleVisible(true);

    // Auto-fades after 5 seconds of complete inactivity
    speechBubbleTimerRef.current = setTimeout(() => {
      setIsSpeechBubbleVisible(false);
      setIsMascotHovered(false);
    }, 5000);
  }, [currentUser.name, currentUser.divisi_id, divisiList, userSettings?.mascotSpeechBubbleEnabled, cancelDismissTimer]);

  // Auto-welcome greeting upon entering the app or switching division/account
  const lastWelcomedUserKeyRef = useRef<string>('');

  useEffect(() => {
    const currentKey = `${currentUser.id}-${currentUser.divisi_id}`;
    if (lastWelcomedUserKeyRef.current === currentKey) {
      return;
    }
    lastWelcomedUserKeyRef.current = currentKey;

    // Respect user's mascot speech bubble preference
    if (userSettings?.mascotSpeechBubbleEnabled === false) {
      return;
    }

    const currentDivisi = divisiList.find(d => d.id === currentUser.divisi_id);
    const welcomeText = getWelcomeSalutation(
      currentUser.name,
      currentUser.divisi_id,
      currentDivisi?.nama_divisi
    );

    // Friendly 850ms entrance delay so the dashboard renders smoothly first
    const entryTimer = setTimeout(() => {
      cancelDismissTimer();
      setSpeechBubbleMessage(welcomeText);
      setIsSpeechBubbleVisible(true);

      // Auto-fades after 6 seconds of complete inactivity unless hovered
      if (speechBubbleTimerRef.current) {
        clearTimeout(speechBubbleTimerRef.current);
      }
      speechBubbleTimerRef.current = setTimeout(() => {
        setIsSpeechBubbleVisible(false);
        setIsMascotHovered(false);
      }, 6000);
    }, 850);

    return () => {
      clearTimeout(entryTimer);
    };
  }, [
    currentUser.id,
    currentUser.divisi_id,
    currentUser.name,
    divisiList,
    userSettings?.mascotSpeechBubbleEnabled,
    cancelDismissTimer
  ]);

  // Grace period dismiss: gives user 750ms of leeway to move cursor to the bubble or buttons without disappearing
  const scheduleDismissSpeechBubble = useCallback((delayMs = 750) => {
    cancelDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setIsSpeechBubbleVisible(false);
      setIsMascotHovered(false);
    }, delayMs);
  }, [cancelDismissTimer]);

  const dismissSpeechBubbleImmediate = useCallback(() => {
    cancelDismissTimer();
    if (speechBubbleTimerRef.current) {
      clearTimeout(speechBubbleTimerRef.current);
      speechBubbleTimerRef.current = null;
    }
    setIsSpeechBubbleVisible(false);
    setIsMascotHovered(false);
  }, [cancelDismissTimer]);

  useEffect(() => {
    return () => {
      if (speechBubbleTimerRef.current) {
        clearTimeout(speechBubbleTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

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

  const contextInfo = getDivisionContextInfo(currentUser.divisi_id, currentSubTab);

  const handleTriggerShortcut = (suggestedPrompt: string) => {
    dismissSpeechBubbleImmediate();
    if (userSettings?.mascotSoundEffectsEnabled !== false) {
      playPleasantClickSound();
    }
    setAiInitialPrompt(suggestedPrompt);
    setIsAiModalOpen(true);
  };

  const handleMascotClick = () => {
    dismissSpeechBubbleImmediate();
    // 1. Play subtle pleasant tactile click sound if enabled
    if (userSettings?.mascotSoundEffectsEnabled !== false) {
      playPleasantClickSound();
    }

    // 2. Audio-visual feedback ripple ring
    setShowMascotFeedbackRing(true);
    setTimeout(() => setShowMascotFeedbackRing(false), 550);

    // 3. Open AI modal without pre-filled shortcut
    setAiInitialPrompt('');
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
        {/* Top Division Welcome Greeting Banner (Time-aware, spacious & clear) */}
        <TopGreetingBanner onOpenAI={() => setIsAiModalOpen(true)} />

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
        initialPrompt={aiInitialPrompt}
      />

      {/* Floating AI Assistant Mascot Trigger with Audio-Visual Feedback & Environment Mute */}
      <div
        className="fixed bottom-6 right-6 z-40 flex items-center print:hidden"
        onMouseEnter={() => {
          cancelDismissTimer();
        }}
        onMouseLeave={() => {
          scheduleDismissSpeechBubble(800);
        }}
      >
        {/* Environment Mute / Sound Toggle Mini Pill */}
        <button
          id="btn-toggle-sound-environment"
          type="button"
          onClick={handleToggleSound}
          onMouseEnter={() => {
            cancelDismissTimer();
          }}
          onMouseLeave={() => {
            scheduleDismissSpeechBubble(800);
          }}
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

        {/* Small Auto-Fading Division-Aware Speech Bubble on Hover with 800ms Grace Period & Pause-on-Hover */}
        <AnimatePresence>
          {isSpeechBubbleVisible && userSettings?.mascotSpeechBubbleEnabled && aiAppState === 'idle' && !soundNotice && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 8, scale: 0.92, transition: { duration: 0.22 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => {
                cancelDismissTimer();
                setIsMascotHovered(true);
                // Freeze the auto-fade timer so user can read comfortably and click without rushing
                if (speechBubbleTimerRef.current) {
                  clearTimeout(speechBubbleTimerRef.current);
                  speechBubbleTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                // Tolerant 800ms grace period so moving away doesn't close abruptly
                scheduleDismissSpeechBubble(800);
              }}
              className="absolute right-0 bottom-full mb-3.5 w-78 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl rounded-br-xs shadow-2xl border border-teal-500/35 dark:border-teal-400/25 text-left z-50 pointer-events-auto"
            >
              {/* Invisible Hover Bridge spanning gap between Bubble and Mascot */}
              <div className="absolute -bottom-5 left-0 right-0 h-5 pointer-events-auto" />

              {/* Downward Speech Bubble Tail pointing directly toward Mascot */}
              <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-white/95 dark:bg-slate-900/95 border-r border-b border-teal-500/35 dark:border-teal-400/25 rotate-45 pointer-events-none" />

              {/* Context Header with Division Badge and Settings Shortcut */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${contextInfo.badgeColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${contextInfo.dotColor} animate-pulse`} />
                  {contextInfo.divisionName}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[100px]" title={contextInfo.activeComponentLabel}>
                    {contextInfo.activeComponentLabel}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserSettingsOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Buka Pengaturan Balon Kata & Maskot AI"
                    aria-label="Pengaturan Maskot"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Speech Bubble Personalized Greeting & Fast Action */}
              <div
                onClick={() => handleTriggerShortcut(contextInfo.suggestedPrompt)}
                className="group/speech cursor-pointer relative mb-2 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-700/70 transition-all duration-150"
                title="Klik untuk langsung menanyakan ke Asisten AI"
              >
                <p className="text-[11.5px] leading-relaxed font-medium text-slate-800 dark:text-slate-100 flex items-start gap-1.5">
                  <span className="text-sm select-none shrink-0 mt-0.5">💬</span>
                  <span>"{speechBubbleMessage}"</span>
                </p>
                {userSettings?.mascotShortcutHintsEnabled !== false && (
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-teal-700 dark:text-teal-300 font-semibold group-hover/speech:underline">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-500" />
                      <span>{contextInfo.primaryShortcut}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-[9.5px]">Tanya AI ↵</span>
                  </div>
                )}
              </div>

              {/* Secondary Quick Action if available and enabled */}
              {userSettings?.mascotShortcutHintsEnabled !== false && contextInfo.secondaryShortcut && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerShortcut(contextInfo.secondaryPrompt!);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="truncate">⚡ {contextInfo.secondaryShortcut}</span>
                  <span className="text-[10px] text-slate-400">→</span>
                </button>
              )}

              {/* Speech Bubble Footer with Auto-fade indicator and Settings Quicklink */}
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Klik balon untuk chat langsung</span>
                <div className="flex items-center gap-1.5">
                  <span className="italic text-[8.5px] text-teal-600/80 dark:text-teal-400/80">Auto-fading</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserSettingsOpen(true);
                    }}
                    className="hover:text-teal-600 dark:hover:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                    title="Atur preferensi balon kata"
                  >
                    <Sliders className="w-2.5 h-2.5" />
                    <span>Atur</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Settings Quick-Trigger Button (Bottom-left to prevent overlap with sound mute) */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsUserSettingsOpen(true);
          }}
          onMouseEnter={() => {
            cancelDismissTimer();
          }}
          onMouseLeave={() => {
            scheduleDismissSpeechBubble(800);
          }}
          whileHover={{ scale: 1.15, rotate: 45 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -bottom-1 -left-2 z-30 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 transition-all opacity-85 hover:opacity-100 cursor-pointer"
          title="Pengaturan Balon Kata & Maskot AI"
          aria-label="Pengaturan Maskot AI"
        >
          <Settings className="w-3 h-3" />
        </motion.button>

        <motion.button
          id="btn-floating-ai-mascot"
          type="button"
          onClick={handleMascotClick}
          onContextMenu={(e) => {
            e.preventDefault();
            handleToggleSound();
          }}
          onMouseEnter={() => {
            cancelDismissTimer();
            setIsMascotHovered(true);
            setMascotBurstKey(prev => prev + 1);
            triggerSpeechBubble();
          }}
          onMouseLeave={() => {
            scheduleDismissSpeechBubble(800);
          }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            aiAppState === 'thinking'
              ? { y: [0, -6, 0], scale: 1, opacity: 1 }
              : userSettings?.mascotIdleAnimationEnabled !== false
              ? { y: [0, -4, 0, 3, 0], scale: 1, opacity: 1 }
              : { y: 0, scale: 1, opacity: 1 }
          }
          transition={
            aiAppState === 'thinking'
              ? {
                  y: { repeat: Infinity, duration: 1.15, ease: 'easeInOut' },
                  scale: { type: 'spring', stiffness: 350, damping: 20 }
                }
              : userSettings?.mascotIdleAnimationEnabled !== false
              ? {
                  y: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' },
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
              : `${contextInfo.primaryShortcut} (${contextInfo.divisionName} - ${contextInfo.activeComponentLabel}) - Klik Kanan untuk Toggle Mute`
          }
          aria-label={
            aiAppState === 'thinking'
              ? 'Asisten AI sedang berpikir'
              : aiAppState === 'success'
              ? 'Tugas selesai'
              : `${contextInfo.primaryShortcut} - Buka Asisten AI MIS Lamrimnesia`
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

          {/* Magical Hover Particle Burst */}
          <AnimatePresence>
            {isMascotHovered && userSettings?.mascotParticleBurstEnabled !== false && (
              <div
                key={`mascot-burst-container-${mascotBurstKey}`}
                className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible"
              >
                {MASCOT_HOVER_PARTICLES.map((particle) => (
                  <motion.div
                    key={`p-${mascotBurstKey}-${particle.id}`}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: particle.x,
                      y: particle.y,
                      scale: particle.isSparkle ? [0, 1.4, 0.9, 0] : [0, 1.25, 0.6, 0],
                      opacity: [0, 1, 0.85, 0],
                      rotate: particle.isSparkle ? [0, 90, 180] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      duration: 0.68,
                      delay: particle.delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`absolute rounded-full pointer-events-none ${particle.color}`}
                    style={{
                      width: particle.size,
                      height: particle.size,
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="relative">
            <MascotAvatar
              size="md"
              variant="badge"
              interactive={false}
              enableIdleAnimation={userSettings?.mascotIdleAnimationEnabled !== false}
              className="shadow-xs"
            />

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

            {/* Contextual Division Code Mini Indicator */}
            <span
              className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded-full text-[7.5px] font-extrabold bg-slate-900/95 text-teal-300 border border-teal-500/40 shadow-xs tracking-wider select-none"
              title={`Divisi Aktif: ${contextInfo.divisionName}`}
            >
              {contextInfo.divisionCode}
            </span>
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

      {/* Global User Settings & Mascot Bubble Preferences Modal */}
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
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
