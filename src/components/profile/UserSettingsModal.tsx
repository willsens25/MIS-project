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
  Bell,
  Eye,
  EyeOff,
  Bot,
  Activity,
  Database
} from 'lucide-react';
import { MascotAvatar } from '../MascotAvatar';

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
  const { userSettings, updateUserSettings, currentUser } = useApp();
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
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
    updateUserSettings({
      mascotSpeechBubbleEnabled: true,
      mascotSoundEffectsEnabled: true,
      mascotParticleBurstEnabled: true,
      mascotShortcutHintsEnabled: true,
      mascotIdleAnimationEnabled: true,
    });
    showToast('🔄 Preferensi Maskot AI dikembalikan ke setelan default');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Pengaturan Pengguna & Maskot AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur preferensi tampilan balon kata otomatis dan interaksi asisten
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        <AnimatePresence>
          {toastNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-200 text-xs rounded-xl font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
              <span>{toastNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Live Preview Box */}
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

        {/* Setting Toggles List */}
        <div className="space-y-3.5">
          {/* 1. Mascot Speech Bubble Toggle (The requested primary feature) */}
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

            {/* Custom Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={userSettings.mascotSpeechBubbleEnabled}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSpeechBubble();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
                  Animasi partikel bintang magis yang terpancar saat kursor mendekati Maskot
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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

          {/* 5. Mascot Idle Animations Toggle (Blinking, Floating Bob) */}
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
                  Gerakan bernapas melayang santai (*floating bob*) dan kedipan mata berkala maskot menggunakan Motion
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
            title="Kembalikan semua preferensi ke setelan standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Setelan Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-all"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
