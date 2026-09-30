import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Eye, Sliders, X, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NIGHT_SHIFT_PRESETS } from '../../lib/nightShiftHelper';

export const NightShiftFloatingWidget: React.FC = () => {
  const { nightShift, isNightShiftActive, updateNightShift, toggleNightShift } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // If Night Shift is not currently active or user dismissed this session
  if (!isNightShiftActive || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 print:hidden night-shift-ui-exclude">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900/90 dark:bg-slate-950/95 text-white rounded-2xl shadow-xl border border-amber-500/40 backdrop-blur-md text-xs ring-1 ring-amber-500/20 max-w-xs overflow-hidden"
      >
        <div className="flex items-center justify-between px-3.5 py-2.5 gap-2.5">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Klik untuk atur cepat kenyamanan lembur"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Moon className="w-3.5 h-3.5 fill-amber-400/40" />
            </div>
            <div>
              <div className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                <span>Mode Lembur Aktif</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Hangat: {nightShift.warmth}% • Kontras: {nightShift.contrast}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Sembunyikan panel slider' : 'Buka slider kenyamanan'}
              aria-label="Toggle slider"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup indikator ini (Mode Lembur tetap aktif)"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Quick Sliders */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3.5 pb-3 pt-1 border-t border-slate-800/80 space-y-2.5"
            >
              {/* Warmth Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-300">Kehangatan Amber:</span>
                  <span className="font-mono text-amber-400 font-bold">{nightShift.warmth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={nightShift.warmth}
                  onChange={(e) => updateNightShift({ warmth: Number(e.target.value), preset: 'custom' })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-300">Kontras Layar:</span>
                  <span className="font-mono text-indigo-400 font-bold">{nightShift.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="2"
                  value={nightShift.contrast}
                  onChange={(e) => updateNightShift({ contrast: Number(e.target.value), preset: 'custom' })}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={toggleNightShift}
                  className="text-[10px] text-slate-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Matikan Mode Lembur
                </button>
                <span className="text-[10px] text-amber-400 font-semibold">
                  Preset: {NIGHT_SHIFT_PRESETS[nightShift.preset]?.name}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
