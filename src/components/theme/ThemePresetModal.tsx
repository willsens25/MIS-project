import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COLOR_PRESETS, ColorPresetId, getColorPreset } from '../../lib/themePresets';

interface ThemePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePresetModal: React.FC<ThemePresetModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, colorPreset, setColorPreset } = useApp();

  if (!isOpen) return null;

  const currentPresetObj = getColorPreset(colorPreset);

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-2xl my-auto py-2 sm:py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Pinned at Top) */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/80 shadow-xs shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Tema & Palet Warna Dashboard</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      Kustomisasi
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sesuaikan mode terang/gelap serta warna aksen primer & sekunder di seluruh antarmuka.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
              {/* Section 1: Mode Tampilan (Light vs Dark) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Mode Tampilan (Appearance Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      theme === 'light'
                        ? 'bg-amber-50/50 border-amber-400 dark:border-amber-500 shadow-sm ring-2 ring-amber-400/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          Mode Terang
                          {theme === 'light' && <span className="text-[10px] text-amber-600 font-semibold">• Aktif</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Bersih, cerah & kontras optimal</div>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-indigo-400 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-400/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 border border-slate-700">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          Mode Gelap
                          {theme === 'dark' && <span className="text-[10px] text-indigo-400 font-semibold">• Aktif</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Teduh, nyaman di mata redup</div>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Preset Warna Aksen (Color Presets) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    2. Preset Warna Aksen (Primary & Secondary Accents)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Aktif: <strong className="text-slate-800 dark:text-slate-200">{currentPresetObj.name}</strong></span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = colorPreset === preset.id;
                    return (
                      <motion.button
                        key={preset.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setColorPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-900 dark:border-slate-100 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            {/* Dual Accent Swatches */}
                            <div className="relative flex items-center shrink-0 w-9 h-7">
                              <span
                                className="w-6 h-6 rounded-full shadow-xs border border-white dark:border-slate-800 z-10"
                                style={{ backgroundColor: preset.primaryHex }}
                                title={`Warna Primer: ${preset.primaryHex}`}
                              />
                              <span
                                className="w-5 h-5 rounded-full shadow-xs border border-white dark:border-slate-800 -ml-2.5 opacity-90"
                                style={{ backgroundColor: preset.secondaryHex }}
                                title={`Warna Sekunder: ${preset.secondaryHex}`}
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{preset.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {preset.tagline}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>

                        {/* Mini Live Preview Bar */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: preset.primaryHex }}
                            />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Primer</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: preset.secondaryHex }}
                            />
                            <span className="text-slate-500 dark:text-slate-400 font-mono">Sekunder</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${preset.badgeBg} ${preset.badgeText}`}>
                            Preview
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Live Component Simulation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Simulasi Tampilan Komponen</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentPresetObj.name} ({theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'})
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 shadow-xs">
                        Tombol Utama
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                        Lencana Status
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Nilai Omset: <span className="font-bold text-indigo-600 dark:text-indigo-400">Rp 128.500.000</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-28 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 w-3/4 rounded-full" />
                    </div>
                    <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">75%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Pinned at Bottom) */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                Pilihan tema tersimpan otomatis di peramban Anda.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

