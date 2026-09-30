import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon,
  Sun,
  Eye,
  Sliders,
  Clock,
  Sparkles,
  BookOpen,
  ChevronDown,
  Info,
  Check,
  Shield,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  NIGHT_SHIFT_PRESETS,
  getNightShiftStatusText,
  NightShiftPresetDetail
} from '../../lib/nightShiftHelper';
import { NightShiftPreset } from '../../types';

interface NightShiftHeaderButtonProps {
  onOpenSettingsModal?: () => void;
}

export const NightShiftHeaderButton: React.FC<NightShiftHeaderButtonProps> = ({
  onOpenSettingsModal
}) => {
  const {
    nightShift,
    isNightShiftActive,
    updateNightShift,
    toggleNightShift,
    setNightShiftPreset,
    solarSchedule
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const status = getNightShiftStatusText(
    nightShift,
    isNightShiftActive,
    new Date(),
    solarSchedule ? solarSchedule.isDaytime : true
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button in Header */}
      <motion.button
        id="btn-night-shift-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer border ${
          isNightShiftActive
            ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/30 font-bold'
            : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        }`}
        title={`Night Shift Mode (${isNightShiftActive ? 'Aktif' : 'Standby'}) — Penyesuaian intensitas warna & kontras ramah mata saat lembur`}
        aria-label="Night Shift Mode"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center">
          <Moon
            className={`w-3.5 h-3.5 transition-colors ${
              isNightShiftActive ? 'text-amber-500 fill-amber-400/30' : 'text-slate-500 dark:text-slate-400'
            }`}
          />
          {isNightShiftActive && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          )}
        </div>

        <span className="hidden sm:inline">
          {isNightShiftActive ? 'Lembur' : 'Night Shift'}
        </span>

        {isNightShiftActive && (
          <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1 rounded font-mono font-bold">
            {nightShift.warmth}%
          </span>
        )}

        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </motion.button>

      {/* Popover Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-80 sm:w-92 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100 space-y-3.5"
          >
            {/* Header with Title & Active Indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Moon className="w-4 h-4 fill-amber-400/20" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Night Shift Mode</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold">
                      Lembur
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Otomatis meredam silau & cahaya biru
                  </p>
                </div>
              </div>

              {/* Master Power Toggle Button */}
              <button
                type="button"
                onClick={toggleNightShift}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  nightShift.enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={nightShift.enabled}
              >
                <span className="sr-only">Toggle Night Shift</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    nightShift.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Status Information Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${status.indicatorColor}`} />
                  {status.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {nightShift.scheduleType === 'overtime-hours' ? `${nightShift.startTime} - ${nightShift.endTime}` : 'Matahari'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {status.subtitle}
              </p>
            </div>

            {/* Auto-Overtime Toggle Switch */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Otomatis Saat Jam Lembur
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Aktif pk {nightShift.startTime} s/d {nightShift.endTime}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateNightShift({ autoOvertime: !nightShift.autoOvertime })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  nightShift.autoOvertime ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={nightShift.autoOvertime}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                    nightShift.autoOvertime ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>PILIH PRESET KENYAMANAN:</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  {NIGHT_SHIFT_PRESETS[nightShift.preset]?.colorTempKelvin}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['balanced', 'deep-night', 'paper-reading', 'minimal'] as NightShiftPreset[]).map(presetKey => {
                  const p = NIGHT_SHIFT_PRESETS[presetKey];
                  const isSelected = nightShift.preset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => setNightShiftPreset(presetKey)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/30'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold truncate">{p.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] opacity-75 font-mono">
                        Hangat: {p.warmth}% • Kontras: {p.contrast}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Sliders: Warmth & Contrast Tuning */}
            <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              {/* Slider 1: Color Warmth (Amber / Blue Light Reduction) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Intensitas Kehangatan (Amber):
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                    {nightShift.warmth}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={nightShift.warmth}
                  onChange={(e) => updateNightShift({ warmth: Number(e.target.value), preset: 'custom' })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-gradient-to-r from-sky-200 via-amber-200 to-orange-400 dark:from-sky-900 dark:via-amber-800 dark:to-orange-700 rounded-lg"
                />
                <div className="flex justify-between text-[9.5px] text-slate-400">
                  <span>Dingin (6500K)</span>
                  <span>Alami (4500K)</span>
                  <span>Amber Hangat (3200K)</span>
                </div>
              </div>

              {/* Slider 2: Dashboard Contrast Softening */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    Kontras Dashboard (Anti-Silau):
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                    {nightShift.contrast}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="2"
                  value={nightShift.contrast}
                  onChange={(e) => updateNightShift({ contrast: Number(e.target.value), preset: 'custom' })}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[9.5px] text-slate-400">
                  <span>Kontras Sangat Lembut (70%)</span>
                  <span>Teduh (88%)</span>
                  <span>Standar (100%)</span>
                </div>
              </div>
            </div>

            {/* Footer with Link to Detailed Settings */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                Bebas silau LED
              </span>
              {onOpenSettingsModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettingsModal();
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Atur Jadwal Lengkap</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
