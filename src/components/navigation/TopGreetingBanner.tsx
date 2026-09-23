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
        className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-linear-to-r ${theme.gradient} bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-4.5 shadow-2xs print:hidden mb-6 transition-all`}
      >
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-32 h-32 rounded-full bg-teal-500/5 dark:bg-teal-400/5 blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Left section: Icon + Dynamic Salutation + Division Welcome */}
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
            {/* Time icon with pleasant frame */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-2xs ${theme.iconBg}`}
              title={`${timeInfo.salutation} (${timeInfo.period})`}
            >
              <span className="select-none leading-none">{timeInfo.icon}</span>
            </div>

            {/* Headline and Division Welcome message */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {timeInfo.salutation}, <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Kak {firstName}</span>!
                </h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${theme.badgeBg}`}>
                  Divisi {cleanDivisiName}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 leading-relaxed">
                <span>Selamat datang di <strong>Divisi {cleanDivisiName}</strong>.</span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">{timeInfo.description}</span>
              </p>
            </div>
          </div>

          {/* Right section: Live Clock, Date Badge, AI Quick Assist & Dismiss */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800/60 w-full md:w-auto justify-between md:justify-end">
            {/* Live Clock Badge (Crisp & Well-proportioned) */}
            <LiveClockBadge variant="standard" showSeconds={true} showTimezone={true} />

            {/* Today Date Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 text-xs font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {/* Quick Ask AI Button */}
            {onOpenAI && (
              <button
                type="button"
                onClick={onOpenAI}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
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
