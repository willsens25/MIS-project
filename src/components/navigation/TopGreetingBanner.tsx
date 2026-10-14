import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, X, ArrowRight, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTimeBasedSalutation, getFriendlyUserFirstName, getCleanDivisionName } from '../../utils/greetingUtils';
import { LiveClockBadge } from './LiveClockBadge';

interface TopGreetingBannerProps {
  onOpenAI?: () => void;
}

export const TopGreetingBanner: React.FC<TopGreetingBannerProps> = ({ onOpenAI }) => {
  const { currentUser, divisiList } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  // Time & greeting calculations (reactive to timezone and real-time interval)
  const [timeInfo, setTimeInfo] = useState(() => getTimeBasedSalutation());

  useEffect(() => {
    const updateTime = () => setTimeInfo(getTimeBasedSalutation());

    const handleTzChange = () => updateTime();
    window.addEventListener('mis-timezone-changed', handleTzChange);

    // Refresh every 30 seconds to catch period transitions
    const interval = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener('mis-timezone-changed', handleTzChange);
      clearInterval(interval);
    };
  }, []);

  const firstName = getFriendlyUserFirstName(currentUser.name);
  const currentDivisi = divisiList.find((d) => d.id === currentUser.divisi_id);
  const cleanDivisiName = getCleanDivisionName(currentUser.divisi_id, currentDivisi?.nama_divisi);

  // Formatted date string (Indonesian locale)
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  if (isDismissed) {
    return null;
  }

  // Dynamic division-specific color accents
  const getDivisionTheme = (id: number) => {
    switch (id) {
      case 2: // Finance
        return {
          gradient: 'from-amber-500/10 via-teal-500/5 to-indigo-500/10 dark:from-amber-950/30 dark:via-teal-950/20 dark:to-indigo-950/30',
          border: 'border-amber-200/80 dark:border-amber-800/60',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
          accent: 'text-amber-700 dark:text-amber-300'
        };
      case 3: // Penerbitan
        return {
          gradient: 'from-sky-500/10 via-indigo-500/5 to-teal-500/10 dark:from-sky-950/30 dark:via-indigo-950/20 dark:to-teal-950/30',
          border: 'border-sky-200/80 dark:border-sky-800/60',
          iconBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
          badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
          accent: 'text-sky-700 dark:text-sky-300'
        };
      case 4: // Marketing
        return {
          gradient: 'from-rose-500/10 via-amber-500/5 to-indigo-500/10 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-indigo-950/30',
          border: 'border-rose-200/80 dark:border-rose-800/60',
          iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
          accent: 'text-rose-700 dark:text-rose-300'
        };
      case 5: // Produksi
        return {
          gradient: 'from-orange-500/10 via-indigo-500/5 to-teal-500/10 dark:from-orange-950/30 dark:via-indigo-950/20 dark:to-teal-950/30',
          border: 'border-orange-200/80 dark:border-orange-800/60',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700/60',
          badgeBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/80',
          accent: 'text-orange-700 dark:text-orange-300'
        };
      case 6: // Logistik
        return {
          gradient: 'from-emerald-500/10 via-teal-500/5 to-indigo-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30',
          border: 'border-emerald-200/80 dark:border-emerald-800/60',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
          accent: 'text-emerald-700 dark:text-emerald-300'
        };
      case 1: // Direktorat
      default:
        return {
          gradient: 'from-indigo-500/10 via-teal-500/5 to-purple-500/10 dark:from-indigo-950/30 dark:via-teal-950/20 dark:to-purple-950/30',
          border: 'border-indigo-200/80 dark:border-indigo-800/60',
          iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60',
          badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
          accent: 'text-indigo-700 dark:text-indigo-300'
        };
    }
  };

  const theme = getDivisionTheme(currentUser.divisi_id);

  return (
    <AnimatePresence>
      <motion.div
        key={`top-welcome-banner-${currentUser.divisi_id}`}
        initial={{ opacity: 0, y: -8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-3xl border ${theme.border} bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl p-4.5 sm:p-5 shadow-xs hover:shadow-md print:hidden mb-6 transition-all duration-300`}
      >
        {/* Top subtle glow accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 dark:via-indigo-400/80 to-transparent pointer-events-none" />

        {/* Ambient background mesh */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-36 -bottom-12 w-40 h-40 rounded-full bg-teal-500/10 dark:bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left section: Icon + Dynamic Salutation + Division Welcome */}
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
            {/* Time icon with pleasant frame */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-xs transition-transform duration-300 hover:scale-105 ${theme.iconBg}`}
              title={`${timeInfo.salutation} (${timeInfo.period})`}
            >
              <span className="select-none leading-none">{timeInfo.icon}</span>
            </div>

            {/* Headline and Division Welcome message */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Workspace Aktif · {timeInfo.period}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {cleanDivisiName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {timeInfo.salutation}, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">Kak {firstName}</span>! ✨
                </h1>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex flex-wrap items-center gap-1.5 leading-relaxed">
                <span>Selamat bertugas di <strong>Divisi {cleanDivisiName}</strong>.</span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">{timeInfo.description}</span>
              </p>
            </div>
          </div>

          {/* Right section: Live Clock, Date Badge, AI Quick Assist & Dismiss */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800/60 w-full md:w-auto justify-between md:justify-end">
            {/* Live Clock Badge (Crisp & Well-proportioned) */}
            <LiveClockBadge variant="standard" showSeconds={true} showTimezone={true} />

            {/* Today Date Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* Quick Ask AI Button */}
            {onOpenAI && (
              <button
                type="button"
                onClick={onOpenAI}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Tanya panduan atau rekap data dengan Asisten AI MIS"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tanya AI</span>
                <ArrowRight className="w-3 h-3 ml-0.5 opacity-80" />
              </button>
            )}

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Tutup salam penyambutan"
              aria-label="Tutup salam penyambutan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
