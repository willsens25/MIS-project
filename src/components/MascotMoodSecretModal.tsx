import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Keyboard, MousePointer, Info, Heart, Zap, RefreshCw } from 'lucide-react';
import { useMascotMood } from '../hooks/useMascotMood';
import { MascotMood, MASCOT_MOOD_CONFIGS, recordShortcutInteraction, recordClickInteraction } from '../services/mascotMoodTracker';
import { MascotAvatar } from './MascotAvatar';

interface MascotMoodSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MascotMoodSecretModal: React.FC<MascotMoodSecretModalProps> = ({
  isOpen,
  onClose
}) => {
  const { mood, metrics, moodConfig } = useMascotMood();
  const [previewMood, setPreviewMood] = React.useState<MascotMood | null>(null);

  if (!isOpen) return null;

  const activeMood = previewMood || mood;
  const activeConfig = MASCOT_MOOD_CONFIGS[activeMood];

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 12 }}
          transition={{ duration: 0.22 }}
          className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Heart className="w-4 h-4 fill-amber-400/20" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>Mascot Mood Tracker</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Secret Feature
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ekspresi maskot beradaptasi secara dinamis dengan gaya kerja Anda
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Mascot Live Display with Expression */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-850 border border-slate-750 text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative inline-block">
                  <MascotAvatar
                    size="xl"
                    variant="badge"
                    mood={activeMood}
                    interactive={false}
                    enableIdleAnimation={true}
                    className={`shadow-lg ring-4 ${activeConfig.borderRing}`}
                  />
                  <span className="absolute -bottom-1 -right-1 text-base p-1 rounded-full bg-slate-900 border border-slate-700 shadow-md">
                    {activeConfig.badgeEmoji}
                  </span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 border border-slate-700 text-teal-300 shadow-inner">
                  <span>{activeConfig.badgeEmoji}</span>
                  <span>{activeConfig.label}</span>
                </span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeConfig.description}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-left flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Penyebab Ekspresi:</strong> {activeConfig.cause}
                </span>
              </div>
            </div>

            {/* Interaction Stats Ratio Breakdown */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Statistik Pola Interaksi Sesi Ini</span>
                <span className="text-[10px] text-teal-400 lowercase font-normal">
                  (shortcuts vs mouse clicks)
                </span>
              </h5>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Shortcuts</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-300">{metrics.shortcutCount}x</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tombol pintas Alt/Ctrl/Hotkeys
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-3.5 h-3.5 text-teal-400" />
                      <span>Mouse Clicks</span>
                    </span>
                    <span className="font-mono font-bold text-teal-300">{metrics.clickCount}x</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Navigasi tombol & menu klik
                  </div>
                </div>
              </div>

              {/* Ratio Bar */}
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-indigo-300">
                    Shortcut: {Math.round(metrics.shortcutRatio * 100)}%
                  </span>
                  <span className="text-teal-300">
                    Klik: {Math.round((1 - metrics.shortcutRatio) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
                    style={{ width: `${Math.round(metrics.shortcutRatio * 100)}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.round((1 - metrics.shortcutRatio) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Test / Expression Switcher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Pratinjau Ekspresi Maskot
                </h5>
                {previewMood && (
                  <button
                    type="button"
                    onClick={() => setPreviewMood(null)}
                    className="text-[10.5px] text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Kembali ke Mood Asli</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {(['focused', 'cheerful', 'chill', 'curious', 'zen'] as MascotMood[]).map((m) => {
                  const cfg = MASCOT_MOOD_CONFIGS[m];
                  const isSelected = activeMood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPreviewMood(m)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-500 text-white font-bold ring-2 ring-teal-500/30'
                          : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={cfg.label}
                    >
                      <span className="text-lg">{cfg.badgeEmoji}</span>
                      <span className="text-[9px] mt-1 capitalize truncate w-full text-center">
                        {m}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-3.5 border-t border-slate-800 bg-slate-900/90">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
