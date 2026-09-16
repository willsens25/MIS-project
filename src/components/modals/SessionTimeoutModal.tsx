import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, LogOut, RefreshCw, Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (remainingSeconds <= 30) {
      setPulse(true);
    } else {
      setPulse(false);
    }
  }, [remainingSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / 120) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-amber-500/50 dark:border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="session-timeout-title"
        >
          {/* Header Bar */}
          <div className="p-6 pb-4 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="p-3 bg-amber-500/20 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 rounded-2xl ring-4 ring-amber-500/15">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                {pulse && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 id="session-timeout-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                    Peringatan Sesi Tidak Aktif
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Keamanan
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proteksi Keamanan Sistem MIS SAPA-ALL Lamrimnesia
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tidak ada aktivitas pengguna yang terdeteksi selama hampir <strong className="font-semibold text-slate-900 dark:text-white">30 menit</strong>. Demi menjaga keamanan data operasional organisasi, sesi Anda akan ditutup secara otomatis dalam:
            </p>

            {/* Countdown Badge & Circular / Progress Representation */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-xs font-semibold uppercase tracking-wider">Sisa Waktu Sesi</span>
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-amber-600 dark:text-amber-400">
                {formattedTime}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {remainingSeconds} detik tersisa sebelum auto-logout
              </span>

              {/* Progress indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    remainingSeconds <= 30 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              *Klik &quot;Tetap Masuk&quot; untuk memperpanjang sesi selama 30 menit ke depan, atau gerakkan kursor mouse/ketik di layar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              id="btn-timeout-logout"
              type="button"
              onClick={onLogoutNow}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sekarang</span>
            </button>

            <button
              id="btn-timeout-stay-logged-in"
              type="button"
              onClick={onStayLoggedIn}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tetap Masuk (Perpanjang Sesi)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
