import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showDivisionReportModal, setShowDivisionReportModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [reportTargetDivisi, setReportTargetDivisi] = useState<DivisionId | undefined>(undefined);

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

      {/* Floating AI Assistant Mascot Trigger with Interactive Animations */}
      <motion.button
        id="btn-floating-ai-mascot"
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        whileHover={{ scale: 1.12, y: -3 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="fixed bottom-6 right-6 z-40 p-1 bg-white dark:bg-slate-900 rounded-full shadow-2xl border-2 border-teal-500/90 cursor-pointer group flex items-center justify-center print:hidden hover:shadow-teal-500/30"
        title="Buka Asisten AI MIS Lamrimnesia"
        aria-label="Buka Asisten AI MIS Lamrimnesia"
      >
        <div className="relative">
          <MascotAvatar size="md" variant="badge" interactive={false} className="shadow-xs" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border-2 border-white dark:border-slate-900" />
          </span>
        </div>
      </motion.button>

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
