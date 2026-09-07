import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DirektoratDashboard } from './components/direktorat/DirektoratDashboard';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { PenerbitanDashboard } from './components/penerbitan/PenerbitanDashboard';
import { MarketingDashboard } from './components/marketing/MarketingDashboard';
import { ProduksiDashboard } from './components/produksi/ProduksiDashboard';
import { LogistikDashboard } from './components/logistik/LogistikDashboard';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    switchDivision
  } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [financeSubTab, setFinanceSubTab] = useState<'grafik' | 'mutasi' | 'persetujuan' | 'penjualan' | 'akun'>('grafik');
  const [direktoratSubTab, setDirektoratSubTab] = useState<'overview' | 'identitas' | 'users' | 'audit'>('overview');

  const handleOpenPersetujuan = () => {
    switchDivision(2);
    setFinanceSubTab('persetujuan');
  };

  const handleOpenAuditLogs = () => {
    switchDivision(1);
    setDirektoratSubTab('audit');
  };

  // If user is not logged in, display the full-screen authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
        <AuthModal
          isOpen={true}
          isForcedScreen={true}
          initialMode="login"
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {currentUser.divisi_id === 1 && <DirektoratDashboard initialSubTab={direktoratSubTab} />}
        {currentUser.divisi_id === 2 && <FinanceDashboard initialSubTab={financeSubTab} />}
        {currentUser.divisi_id === 3 && <PenerbitanDashboard />}
        {currentUser.divisi_id === 4 && <MarketingDashboard />}
        {currentUser.divisi_id === 5 && <ProduksiDashboard />}
        {currentUser.divisi_id === 6 && <LogistikDashboard />}
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

      {/* Overlay Auth Modal (for Register/Login from inside dashboard) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        isForcedScreen={false}
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
