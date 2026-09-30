import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Settings,
  MessageSquare,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Activity,
  Database,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  MapPin,
  RefreshCw,
  SunMedium,
  Navigation,
  Check,
  Bell,
  Package,
  Wallet,
  FileCheck,
  Truck,
  Printer,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { MascotAvatar } from '../MascotAvatar';
import { PRESET_LOCATIONS, LocationCoordinates } from '../../lib/solarCalculator';
import {
  NIGHT_SHIFT_PRESETS,
  getNightShiftStatusText,
  DEFAULT_NIGHT_SHIFT_CONFIG
} from '../../lib/nightShiftHelper';
import { NightShiftPreset, NightShiftScheduleType } from '../../types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBackupRestore?: () => void;
  onOpenSeeder?: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenBackupRestore,
  onOpenSeeder
}) => {
  const {
    userSettings,
    updateUserSettings,
    currentUser,
    theme,
    themeMode,
    setThemeMode,
    solarSchedule,
    refreshSolarSchedule,
    autoThemeLocation,
    setAutoThemeLocation,
    simulateToastNotification,
    nightShift,
    isNightShiftActive,
    updateNightShift,
    toggleNightShift,
    setNightShiftPreset
  } = useApp();

  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshingSchedule, setIsRefreshingSchedule] = useState(false);
  const [toastFilter, setToastFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('mis_toast_filter_category') || 'all';
    } catch {
      return 'all';
    }
  });

  const handleSelectToastFilter = (filterKey: string) => {
    setToastFilter(filterKey);
    try {
      localStorage.setItem('mis_toast_filter_category', filterKey);
    } catch {
      // ignore
    }
    const filterNames: Record<string, string> = {
      all: 'Semua Kategori',
      stock: 'Hanya Stok Gudang',
      finance: 'Hanya Keuangan & Kas',
      order: 'Hanya Invoice / Penjualan',
      production: 'Hanya SPK Cetak',
      logistic: 'Hanya Logistik'
    };
    showToast(`🔔 Filter Toast diperbarui: ${filterNames[filterKey] || filterKey}`);
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleSelectThemeMode = (mode: 'light' | 'dark' | 'system-synced') => {
    setThemeMode(mode);
    if (mode === 'system-synced') {
      showToast('🌅 Mode System-Synced aktif! Tampilan otomatis beralih mengikuti matahari terbit & terbenam.');
    } else if (mode === 'light') {
      showToast('☀️ Mode Terang (Light Mode) aktif secara manual.');
    } else {
      showToast('🌙 Mode Gelap (Dark Mode) aktif secara manual.');
    }
  };

  const handleDetectGPSLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('⚠️ Fitur Geolocation tidak didukung peramban.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const newLoc: LocationCoordinates = {
          name: `GPS Lokal (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          latitude,
          longitude,
          source: 'gps'
        };
        setAutoThemeLocation(newLoc);
        showToast(`📍 Koordinat GPS diperbarui: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        showToast('⚠️ Akses GPS tidak diizinkan atau waktu habis. Menggunakan acuan wilayah default.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleSelectPresetLocation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locName = e.target.value;
    const found = PRESET_LOCATIONS.find((l) => l.name === locName);
    if (found) {
      setAutoThemeLocation(found);
      showToast(`📍 Lokasi acuan tema diubah ke: ${found.name}`);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshingSchedule(true);
    refreshSolarSchedule();
    setTimeout(() => {
      setIsRefreshingSchedule(false);
      showToast('🔄 Jadwal waktu matahari lokal berhasil disinkronkan kembali.');
    }, 400);
  };

  const handleToggleSpeechBubble = () => {
    const nextVal = !userSettings.mascotSpeechBubbleEnabled;
    updateUserSettings({ mascotSpeechBubbleEnabled: nextVal });
    showToast(
      nextVal
        ? '✅ Balon kata otomatis Maskot AI diaktifkan!'
        : '🔇 Balon kata otomatis Maskot AI dinonaktifkan.'
    );
  };

  const handleToggleSound = () => {
    const nextVal = !userSettings.mascotSoundEffectsEnabled;
    updateUserSettings({ mascotSoundEffectsEnabled: nextVal });
    showToast(nextVal ? '🔊 Efek suara Maskot AI aktif' : '🔇 Efek suara Maskot AI senyap');
  };

  const handleToggleParticles = () => {
    const nextVal = !userSettings.mascotParticleBurstEnabled;
    updateUserSettings({ mascotParticleBurstEnabled: nextVal });
    showToast(nextVal ? '✨ Animasi partikel Maskot aktif' : '🚫 Animasi partikel Maskot dinonaktifkan');
  };

  const handleToggleShortcuts = () => {
    const nextVal = !userSettings.mascotShortcutHintsEnabled;
    updateUserSettings({ mascotShortcutHintsEnabled: nextVal });
    showToast(nextVal ? '⚡ Pintasan divisi aktif' : '🚫 Pintasan divisi disembunyikan');
  };

  const handleToggleIdleAnimation = () => {
    const nextVal = userSettings.mascotIdleAnimationEnabled === false;
    updateUserSettings({ mascotIdleAnimationEnabled: nextVal });
    showToast(
      nextVal
        ? '🪷 Animasi gerak diam maskot (kedip & melayang) aktif'
        : '⏸️ Animasi gerak diam maskot dijeda / nonaktif'
    );
  };

  const handleResetDefaults = () => {
    setThemeMode('system-synced');
    updateUserSettings({
      mascotSpeechBubbleEnabled: true,
      mascotSoundEffectsEnabled: true,
      mascotParticleBurstEnabled: true,
      mascotShortcutHintsEnabled: true,
      mascotIdleAnimationEnabled: true,
      themeMode: 'system-synced',
    });
    updateNightShift(DEFAULT_NIGHT_SHIFT_CONFIG);
    showToast('🔄 Preferensi Maskot AI, Tema, & Night Shift dikembalikan ke setelan default');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl text-left animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned) */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Pengaturan Pengguna & Preferensi Sistem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur penjadwal tema matahari, balon kata otomatis, serta interaksi asisten
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="py-4 space-y-6 overflow-y-auto flex-1 pr-1 overscroll-contain">
          {/* Toast Feedback */}
          <AnimatePresence>
            {toastNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-200 text-xs rounded-xl font-medium flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
                <span>{toastNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SECTION 1: Appearance Mode & Auto-Theme Scheduler */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <SunMedium className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Mode Tampilan & Penjadwal Tema Otomatis
                </h4>
              </div>
              <span className="text-[10px] font-semibold flex items-center gap-1">
                {themeMode === 'system-synced' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    System-Synced Aktif
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    Mode Manual ({themeMode === 'dark' ? 'Gelap' : 'Terang'})
                  </span>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pilih mode tetap atau aktifkan <strong>System-Synced</strong> untuk menyesuaikan tema otomatis mengikuti siklus terbit dan terbenamnya matahari lokal.
            </p>

            {/* 3 Theme Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Light Mode */}
              <button
                type="button"
                id="btn-mode-light"
                onClick={() => handleSelectThemeMode('light')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  themeMode === 'light'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500 shadow-xs ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  {themeMode === 'light' && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Mode Terang</span>
                    {themeMode === 'light' && (
                      <span className="text-[9px] text-amber-600 font-semibold">• Aktif</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Cerah dan kontras sepanjang hari
                  </div>
                </div>
              </button>

              {/* Option 2: Dark Mode */}
              <button
                type="button"
                id="btn-mode-dark"
                onClick={() => handleSelectThemeMode('dark')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  themeMode === 'dark'
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-500 shadow-xs ring-2 ring-indigo-400/20'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center border border-slate-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  {themeMode === 'dark' && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Mode Gelap</span>
                    {themeMode === 'dark' && (
                      <span className="text-[9px] text-indigo-400 font-semibold">• Aktif</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Teduh & nyaman di ruangan redup
                  </div>
                </div>
              </button>

              {/* Option 3: System-Synced (The requested feature) */}
              <button
                type="button"
                id="btn-mode-system-synced"
                onClick={() => handleSelectThemeMode('system-synced')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  themeMode === 'system-synced'
                    ? 'bg-gradient-to-br from-teal-50/90 via-sky-50/60 to-indigo-50/70 dark:from-teal-950/50 dark:via-sky-950/30 dark:to-indigo-950/50 border-teal-500 dark:border-teal-400 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sunrise className="w-4 h-4" />
                  </div>
                  {themeMode === 'system-synced' ? (
                    <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Auto
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>System-Synced</span>
                    {themeMode === 'system-synced' && (
                      <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold">• Aktif</span>
                    )}
                  </div>
                  <div className="text-[10px] text-teal-700 dark:text-teal-300 font-medium mt-0.5">
                    Matahari Terbit & Terbenam
                  </div>
                </div>
              </button>
            </div>

            {/* Detailed Solar Scheduler Panel (Visible when System-Synced is selected) */}
            {themeMode === 'system-synced' && solarSchedule && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-slate-800/90 dark:via-teal-950/20 dark:to-indigo-950/20 border border-teal-200/80 dark:border-teal-800/80 space-y-3.5 shadow-xs"
              >
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-100 dark:border-teal-900/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 shrink-0">
                      {solarSchedule.isDaytime ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Status Saat Ini:</span>
                        <span className="text-teal-700 dark:text-teal-300">
                          {solarSchedule.isDaytime ? '☀️ Mode Terang (Siang Hari)' : '🌙 Mode Gelap (Malam Hari)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>
                          Beralih ke Mode {solarSchedule.nextTransition.targetTheme === 'dark' ? 'Gelap' : 'Terang'} dalam{' '}
                          <strong className="text-slate-800 dark:text-slate-200">{solarSchedule.nextTransition.countdownFormatted}</strong> ({solarSchedule.nextTransition.timeFormatted})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshingSchedule}
                    className="self-start sm:self-auto flex items-center space-x-1 px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                    title="Hitung ulang kalkulasi astronomi posisi matahari"
                  >
                    <RefreshCw className={`w-3 h-3 text-teal-600 dark:text-teal-400 ${isRefreshingSchedule ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {/* Solar Metrics: Sunrise & Sunset */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Sunrise Card */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sunrise className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Matahari Terbit
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                        {solarSchedule.sunriseFormatted}
                      </div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                        &rarr; Beralih ke Terang
                      </div>
                    </div>
                  </div>

                  {/* Sunset Card */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sunset className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                        Matahari Terbenam
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                        {solarSchedule.sunsetFormatted}
                      </div>
                      <div className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80">
                        &rarr; Beralih ke Gelap
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Reference & GPS detection */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Lokasi Acuan Perhitungan Solar</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isLocating}
                      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      title="Gunakan posisi koordinat GPS terkini dari peramban"
                    >
                      <Navigation className={`w-3 h-3 ${isLocating ? 'animate-bounce text-amber-500' : ''}`} />
                      <span>{isLocating ? 'Mendeteksi GPS...' : 'Gunakan GPS Saya'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={autoThemeLocation.name}
                      onChange={handleSelectPresetLocation}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      {PRESET_LOCATIONS.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                          {preset.name}
                        </option>
                      ))}
                      {!PRESET_LOCATIONS.some((p) => p.name === autoThemeLocation.name) && (
                        <option value={autoThemeLocation.name}>
                          {autoThemeLocation.name} (Kustom/Terdeteksi)
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-0.5">
                    <span>
                      Koordinat: {autoThemeLocation.latitude.toFixed(3)}°, {autoThemeLocation.longitude.toFixed(3)}°
                    </span>
                    <span>Algoritma Solar Zenith NOAA 90.833°</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* SECTION: Night Shift Mode (Kenyamanan Mata & Lembur) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900/50 dark:to-orange-950/20 border border-amber-300/80 dark:border-amber-700/60 shadow-xs space-y-4">
            {/* Header & Status Indicator */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Moon className="w-5 h-5 fill-amber-400/30" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Night Shift Mode (Mode Lembur)</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 uppercase">
                      Eye-Care
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Menyesuaikan suhu warna (amber) dan meredam kontras dashboard secara otomatis saat lembur
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

            {/* Status Pill & Explanation */}
            {(() => {
              const status = getNightShiftStatusText(
                nightShift,
                isNightShiftActive,
                new Date(),
                solarSchedule ? solarSchedule.isDaytime : true
              );
              return (
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${status.indicatorColor} shrink-0`} />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {status.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {status.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg shrink-0 border border-amber-200 dark:border-amber-800">
                    {nightShift.warmth}% Amber • {nightShift.contrast}% Kontras
                  </span>
                </div>
              );
            })()}

            {/* Schedule Type Selection (Berdasarkan Jam Lembur vs Matahari vs Manual) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Pemicu & Penjadwalan Otomatis Mode Lembur:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option 1: Fixed Overtime Hours (19:00 - 06:00) */}
                <button
                  type="button"
                  onClick={() => updateNightShift({ autoOvertime: true, scheduleType: 'overtime-hours', enabled: true })}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    nightShift.autoOvertime && nightShift.scheduleType === 'overtime-hours'
                      ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Jam Lembur Terjadwal
                    </span>
                    {nightShift.autoOvertime && nightShift.scheduleType === 'overtime-hours' && (
                      <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Aktif otomatis saat jam lembur: <strong>{nightShift.startTime} - {nightShift.endTime}</strong>
                  </div>
                </button>

                {/* Option 2: Sunset to Sunrise */}
                <button
                  type="button"
                  onClick={() => updateNightShift({ autoOvertime: true, scheduleType: 'sunset-to-sunrise', enabled: true })}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    nightShift.autoOvertime && nightShift.scheduleType === 'sunset-to-sunrise'
                      ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sunset className="w-3.5 h-3.5 text-amber-600" />
                      Matahari Terbenam ke Terbit
                    </span>
                    {nightShift.autoOvertime && nightShift.scheduleType === 'sunset-to-sunrise' && (
                      <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sinkron otomatis sensor matahari ({solarSchedule ? `${solarSchedule.sunsetFormatted} - ${solarSchedule.sunriseFormatted}` : 'Malam'})
                  </div>
                </button>

                {/* Option 3: Always On Dark Theme */}
                <button
                  type="button"
                  onClick={() => updateNightShift({ autoOvertime: true, scheduleType: 'always-on-dark', enabled: true })}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    nightShift.autoOvertime && nightShift.scheduleType === 'always-on-dark'
                      ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-amber-600" />
                      Selalu Aktif Saat Tema Gelap
                    </span>
                    {nightShift.autoOvertime && nightShift.scheduleType === 'always-on-dark' && (
                      <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Otomatis redam kontras ketika mode gelap diaktifkan
                  </div>
                </button>

                {/* Option 4: Manual Only */}
                <button
                  type="button"
                  onClick={() => updateNightShift({ autoOvertime: false, scheduleType: 'manual' })}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    !nightShift.autoOvertime
                      ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      Manual Sepenuhnya
                    </span>
                    {!nightShift.autoOvertime && (
                      <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hanya aktif saat sakelar utama dinyalakan secara manual
                  </div>
                </button>
              </div>

              {/* Time Inputs for Overtime Hours */}
              {nightShift.autoOvertime && nightShift.scheduleType === 'overtime-hours' && (
                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Mulai Lembur:</span>
                    <input
                      type="time"
                      value={nightShift.startTime}
                      onChange={(e) => updateNightShift({ startTime: e.target.value })}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Selesai Lembur:</span>
                    <input
                      type="time"
                      value={nightShift.endTime}
                      onChange={(e) => updateNightShift({ endTime: e.target.value })}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    (Default jam kerja yayasan: 19:00 malam s/d 06:00 pagi)
                  </span>
                </div>
              )}
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Pilih Profil Preset Kenyamanan Mata:</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                  Suhu Warna: {NIGHT_SHIFT_PRESETS[nightShift.preset]?.colorTempKelvin}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['balanced', 'deep-night', 'paper-reading', 'minimal'] as NightShiftPreset[]).map((presetId) => {
                  const p = NIGHT_SHIFT_PRESETS[presetId];
                  const isSelected = nightShift.preset === presetId;
                  return (
                    <button
                      key={presetId}
                      type="button"
                      onClick={() => setNightShiftPreset(presetId)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-100/90 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/20 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${p.badgeColor}`}>
                            {p.subtitle}
                          </span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-2">
                        {p.description}
                      </p>
                      <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Hangat: {p.warmth}%</span>
                        <span>Kontras: {p.contrast}%</span>
                        <span>Suhu: {p.colorTempKelvin}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine Tuning Sliders */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  Kustomisasi Slider Presisi
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Menggeser slider otomatis memilih profil 'Kustom')
                </span>
              </div>

              {/* Slider 1: Kehangatan Warna / Amber */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Intensitas Kehangatan (Reduksi Cahaya Biru):
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {nightShift.warmth}% ({NIGHT_SHIFT_PRESETS[nightShift.preset]?.colorTempKelvin || 'Kustom'})
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
                  <span>6500K (Cerah Dingin)</span>
                  <span>4500K (Hangat Alami)</span>
                  <span>3200K (Amber Intensif)</span>
                </div>
              </div>

              {/* Slider 2: Dashboard Contrast Softening */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    Kontras Dashboard (Anti-Silau / Easing Halus):
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
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
                  <span>70% (Kontras Sangat Teduh)</span>
                  <span>88% (Rekomendasi Lembur)</span>
                  <span>100% (Kontras Standar Tajam)</span>
                </div>
              </div>

              {/* Slider 3: Backlight Brightness Dimming */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    Kecerahan Tampilan (Dimming Layar Lembut):
                  </span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                    {nightShift.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="2"
                  value={nightShift.brightness}
                  onChange={(e) => updateNightShift({ brightness: Number(e.target.value), preset: 'custom' })}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[9.5px] text-slate-400">
                  <span>70% (Meredupkan Backlight)</span>
                  <span>95% (Ideal Ruangan Temaram)</span>
                  <span>100% (Maksimal)</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                Pratinjau Efek Kenyamanan Mata Pada Data Dashboard:
              </span>
              <div
                className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 transition-all duration-300"
                style={{
                  filter: `sepia(${(nightShift.warmth / 100) * 0.42}) hue-rotate(${-(nightShift.warmth / 100) * 12}deg) contrast(${nightShift.contrast / 100}) brightness(${nightShift.brightness / 100})`,
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Katalog Naskah: Lamrim Chenmo Vol. 1
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Stok Tersedia: 142 eksemplar • HPP Rp 45.000
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                    Rp 120.000
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Pratinjau visual menunjukkan bagaimana kontras tajam LED putih diredam secara lembut menjadi nada amber hangat papirus yang bersahabat untuk retina mata saat bekerja lembur.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  updateNightShift(DEFAULT_NIGHT_SHIFT_CONFIG);
                  showToast('🔄 Night Shift Mode dikembalikan ke profil default (Lembur Seimbang 45%)');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Standar Lembur</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateNightShift({ enabled: true });
                  showToast('🌙 Efek Night Shift Mode aktif seketika pada seluruh layar dashboard.');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Uji Tampilan Sekarang</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Mascot AI Interactive Live Preview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-slate-800/60 dark:to-teal-950/20 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-teal-500" />
                Pratinjau Interaksi Maskot Saat Ini
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  userSettings.mascotSpeechBubbleEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                {userSettings.mascotSpeechBubbleEnabled ? 'Balon Kata: AKTIF' : 'Balon Kata: NONAKTIF'}
              </span>
            </div>

            <div className="flex items-end gap-3.5 pt-2 pb-1">
              {/* Mini Mascot Simulation with real MascotAvatar and idle animation preview */}
              <div className="relative group shrink-0">
                <MascotAvatar
                  size="md"
                  variant="badge"
                  interactive={false}
                  enableIdleAnimation={userSettings.mascotIdleAnimationEnabled !== false}
                  className="shadow-md ring-2 ring-teal-500/80"
                />
                {userSettings.mascotParticleBurstEnabled && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                )}
              </div>

              {/* Bubble Simulation */}
              <div className="flex-1">
                {userSettings.mascotSpeechBubbleEnabled ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/80 rounded-2xl shadow-sm space-y-1.5"
                  >
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      "Halo {currentUser.name ? currentUser.name.split(' ')[0] : 'Rekan'}! Ada data penerbitan atau transaksi yang ingin dicek?"
                    </p>
                    {userSettings.mascotShortcutHintsEnabled && (
                      <div className="flex items-center justify-between text-[10px] text-teal-600 dark:text-teal-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>⚡ Pintasan Otomatis Divisi Aktif</span>
                        <span className="text-[9px] text-slate-400 italic">Auto-fading 4.2s</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="p-3 bg-slate-100/80 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>
                      Balon kata disembunyikan. Maskot tetap siap diklik tanpa memunculkan balon ucapan saat mouse lewat (*hover*).
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Mascot Toggles List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Preferensi Perilaku & Interaksi Maskot AI
            </h4>

            {/* 1. Mascot Speech Bubble Toggle */}
            <div
              onClick={handleToggleSpeechBubble}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-start justify-between gap-4 group"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                    userSettings.mascotSpeechBubbleEnabled
                      ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Balon Kata Otomatis Maskot (*Speech Bubbles*)
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.2 rounded-md ${
                        userSettings.mascotSpeechBubbleEnabled
                          ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {userSettings.mascotSpeechBubbleEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Menampilkan balon sapaan interaktif (*auto-fading*) saat kursor diarahkan ke tombol Maskot AI di sudut kanan bawah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={userSettings.mascotSpeechBubbleEnabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSpeechBubble();
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  userSettings.mascotSpeechBubbleEnabled
                    ? 'bg-teal-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    userSettings.mascotSpeechBubbleEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Audio-Tactile Sound Effects */}
            <div
              onClick={handleToggleSound}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    userSettings.mascotSoundEffectsEnabled
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {userSettings.mascotSoundEffectsEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Efek Suara Audio-Taktil (*Sound Effects*)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bunyi klik lembut saat menekan Maskot AI atau memilih pintasan
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={userSettings.mascotSoundEffectsEnabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSound();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  userSettings.mascotSoundEffectsEnabled
                    ? 'bg-indigo-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    userSettings.mascotSoundEffectsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Particle Burst Animation */}
            <div
              onClick={handleToggleParticles}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    userSettings.mascotParticleBurstEnabled
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Efek Partikel Berkilau (*Hover Burst*)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Animasi partikel bintang yang terpancar saat kursor mendekati Maskot
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={userSettings.mascotParticleBurstEnabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleParticles();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  userSettings.mascotParticleBurstEnabled
                    ? 'bg-amber-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    userSettings.mascotParticleBurstEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Division Context Shortcuts */}
            <div
              onClick={handleToggleShortcuts}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    userSettings.mascotShortcutHintsEnabled
                      ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Pintasan Cepat Divisi (*Context Shortcuts*)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Rekomendasi pertanyaan otomatis berdasarkan divisi aktif (Keuangan, SPK, Logistik, dll.)
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={userSettings.mascotShortcutHintsEnabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleShortcuts();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  userSettings.mascotShortcutHintsEnabled
                    ? 'bg-teal-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    userSettings.mascotShortcutHintsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 5. Mascot Idle Animations Toggle */}
            <div
              onClick={handleToggleIdleAnimation}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    userSettings.mascotIdleAnimationEnabled !== false
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Animasi Diam Interaktif (*Idle Animations*)
                    </h4>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        userSettings.mascotIdleAnimationEnabled !== false
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {userSettings.mascotIdleAnimationEnabled !== false ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gerakan bernapas melayang santai (*floating bob*) dan kedipan mata berkala maskot
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={userSettings.mascotIdleAnimationEnabled !== false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleIdleAnimation();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  userSettings.mascotIdleAnimationEnabled !== false
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    userSettings.mascotIdleAnimationEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SECTION 4: Toast Notifications & Status Filter Preferences */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Filter Notifikasi Toast Real-time
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {toastFilter === 'all' ? 'Semua Notifikasi' : `Filter: ${toastFilter}`}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pilih kategori pembaruan status apa saja yang ingin Anda tampilkan secara instan (misal: hanya stok atau hanya keuangan).
              </p>

              {/* Filter Pills in Settings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'all', label: 'Semua Notifikasi', icon: Bell, color: 'text-indigo-500' },
                  { id: 'stock', label: 'Hanya Stok Gudang', icon: Package, color: 'text-amber-500' },
                  { id: 'finance', label: 'Hanya Keuangan', icon: Wallet, color: 'text-cyan-500' },
                  { id: 'order', label: 'Hanya Invoice', icon: FileCheck, color: 'text-emerald-500' },
                  { id: 'production', label: 'Hanya SPK Cetak', icon: Printer, color: 'text-indigo-400' },
                  { id: 'logistic', label: 'Hanya Logistik', icon: Truck, color: 'text-blue-500' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = toastFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectToastFilter(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 font-bold text-amber-900 dark:text-amber-200 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600 dark:text-amber-400' : item.color}`} />
                        <span className="text-[11px] truncate">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Toast Simulation Trigger Buttons */}
              {simulateToastNotification && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Uji Notifikasi Pop-up (Simulasi):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => simulateToastNotification('stock')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                    >
                      ⚠️ Stok Gudang Menipis
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateToastNotification('finance')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-300 transition-colors cursor-pointer"
                    >
                      💰 Invoice Disetujui (Lunas)
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateToastNotification('order')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      📝 Pesanan Baru
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Quick Access to Database Backup & Restore */}
            {onOpenBackupRestore && (
              <div
                onClick={() => {
                  onClose();
                  onOpenBackupRestore();
                }}
                className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/70 to-cyan-50/50 dark:from-indigo-950/40 dark:to-cyan-950/20 hover:from-indigo-100/80 dark:hover:from-indigo-900/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Cadangkan & Pulihkan Seluruh Database
                    </h4>
                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                      Ekspor seluruh data 6 divisi ke berkas JSON atau impor cadangan saat ganti perangkat.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Buka &rarr;
                </span>
              </div>
            )}

            {/* 7. Quick Access to Database Seeder */}
            {onOpenSeeder && (
              <div
                onClick={() => {
                  onClose();
                  onOpenSeeder();
                }}
                className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-gradient-to-r from-purple-50/70 to-pink-50/50 dark:from-purple-950/40 dark:to-pink-950/20 hover:from-purple-100/80 dark:hover:from-purple-900/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                      Database Seeder (Data Dummy Otomatis)
                    </h4>
                    <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                      Tambahkan sampel buku, anggota, pesanan & mutasi kas dengan tombol counter kustom.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Buka &rarr;
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Pinned) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors cursor-pointer"
            title="Kembalikan semua preferensi ke setelan standar (System-Synced & Balon Kata Aktif)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Setelan Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
