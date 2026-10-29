import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  HelpCircle,
  AlertCircle,
  Command,
  Languages,
  CheckCircle2,
  Tv,
  EyeOff,
  Moon,
  Paperclip,
  BarChart3,
  Keyboard,
  Send
} from 'lucide-react';
import { useWebSpeech } from '../../hooks/useWebSpeech';
import { parseVoiceCommand, ParsedVoiceCommand } from '../../utils/voiceCommandParser';
import { DivisionId } from '../../types';
import { useApp } from '../../context/AppContext';
import { MascotAvatar } from '../MascotAvatar';
import { playPleasantSuccessChime, playPleasantClickSound } from '../../utils/soundEffects';

interface VoiceActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateDivision: (divisionId: DivisionId, subTab?: string) => void;
  onTriggerAiQuery: (queryPrompt: string) => void;
}

const EXAMPLE_COMMANDS = [
  { icon: <Wallet className="w-3.5 h-3.5 text-emerald-500" />, text: 'Buka Divisi Keuangan', category: 'Navigasi' },
  { icon: <BookOpen className="w-3.5 h-3.5 text-indigo-500" />, text: 'Pindah ke Penerbitan', category: 'Navigasi' },
  { icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />, text: 'Navigasi ke Marketing', category: 'Navigasi' },
  { icon: <Truck className="w-3.5 h-3.5 text-cyan-500" />, text: 'Ke Divisi Logistik', category: 'Navigasi' },
  { icon: <Building2 className="w-3.5 h-3.5 text-teal-500" />, text: 'Buka Direktorat Utama', category: 'Navigasi' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-violet-500" />, text: 'Tanya AI: Berapa sisa kas masuk yayasan?', category: 'Tanya AI' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-teal-500" />, text: 'Tanya AI: Buku apa saja yang stoknya menipis?', category: 'Tanya AI' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, text: 'Tanya AI: Rangkum pesanan dan invoice terbaru', category: 'Tanya AI' }
];

export const VoiceActivationModal: React.FC<VoiceActivationModalProps> = ({
  isOpen,
  onClose,
  onNavigateDivision,
  onTriggerAiQuery
}) => {
  const {
    showToast,
    togglePrivacyMode,
    toggleNightShift,
    toggleTheme,
    openPresentationMode,
    openDocumentArchive,
    openMonthlyPerformanceModal,
    userSettings
  } = useApp();

  const [manualText, setManualText] = useState('');
  const [activeLang, setActiveLang] = useState<'id-ID' | 'en-US'>('id-ID');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sound feedback setting
  const soundEnabled = userSettings?.mascotSoundEffectsEnabled !== false;

  // Web Speech recognition & TTS
  const {
    isRecognitionSupported,
    isTtsSupported,
    isListening,
    interimTranscript,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking
  } = useWebSpeech({
    defaultLang: activeLang,
    onFinalResult: (transcript) => {
      handleProcessCommand(transcript);
    }
  });

  // Real-time live parsed command preview as user speaks
  const livePreview = interimTranscript ? parseVoiceCommand(interimTranscript) : null;

  // Auto-start listening on open
  useEffect(() => {
    if (isOpen) {
      setLastExecutedCommand(null);
      setIsExecuting(false);
      setManualText('');
      if (isRecognitionSupported) {
        startListening(activeLang);
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, isRecognitionSupported, activeLang, startListening, stopListening, stopSpeaking]);

  // Global keydown: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute recognized command
  const handleProcessCommand = useCallback((transcriptText: string) => {
    const clean = transcriptText.trim();
    if (!clean) return;

    const parsed = parseVoiceCommand(clean);
    setLastExecutedCommand(parsed);
    setIsExecuting(true);

    if (soundEnabled) {
      playPleasantSuccessChime();
    }

    if (parsed.type === 'navigate' && parsed.targetDivisionId) {
      if (isTtsSupported) {
        speak(`Membuka ${parsed.targetDivisionName || 'Divisi'}`, undefined, activeLang);
      }
      showToast({
        title: '🎤 Perintah Suara Dijalankan',
        message: `Navigasi ke ${parsed.targetDivisionName || 'Divisi'} berhasil.`,
        type: 'success',
        duration: 3500
      });
      setTimeout(() => {
        onNavigateDivision(parsed.targetDivisionId!, parsed.targetSubTab);
        onClose();
      }, 550);
    } else if (parsed.type === 'ai_query') {
      const queryPrompt = parsed.aiQueryPrompt || clean;
      if (isTtsSupported) {
        speak('Menanyakan ke Asisten AI', undefined, activeLang);
      }
      showToast({
        title: '🤖 Pertanyaan Dikirim ke AI',
        message: `"${queryPrompt}"`,
        type: 'info',
        duration: 4000
      });
      setTimeout(() => {
        onTriggerAiQuery(queryPrompt);
        onClose();
      }, 550);
    } else if (parsed.type === 'system_action') {
      switch (parsed.actionId) {
        case 'privacy_mode':
          togglePrivacyMode();
          break;
        case 'night_shift':
          toggleNightShift();
          break;
        case 'theme_toggle':
          toggleTheme();
          break;
        case 'presentation':
          openPresentationMode();
          break;
        case 'archive':
          openDocumentArchive();
          break;
        case 'performance_report':
          openMonthlyPerformanceModal();
          break;
        case 'hotkeys':
          // Hotkeys will be triggered
          break;
      }
      showToast({
        title: '⚡ Aksi Sistem Dijalankan',
        message: parsed.title,
        type: 'success',
        duration: 3500
      });
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      // Fallback: If unknown, offer to ask AI
      showToast({
        title: 'ℹ️ Perintah Tidak Spesifik',
        message: `Mengalihkan ucapan "${clean}" ke Asisten AI untuk dijawab.`,
        type: 'info',
        duration: 4500
      });
      setTimeout(() => {
        onTriggerAiQuery(clean);
        onClose();
      }, 750);
    }
  }, [
    soundEnabled,
    isTtsSupported,
    speak,
    activeLang,
    showToast,
    onNavigateDivision,
    onClose,
    onTriggerAiQuery,
    togglePrivacyMode,
    toggleNightShift,
    toggleTheme,
    openPresentationMode,
    openDocumentArchive,
    openMonthlyPerformanceModal
  ]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    stopListening();
    handleProcessCommand(manualText);
  };

  const handleChipClick = (cmdText: string) => {
    stopListening();
    if (soundEnabled) playPleasantClickSound();
    handleProcessCommand(cmdText);
  };

  const toggleLanguage = () => {
    const nextLang = activeLang === 'id-ID' ? 'en-US' : 'id-ID';
    setActiveLang(nextLang);
    if (isListening) {
      stopListening();
      setTimeout(() => startListening(nextLang), 150);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Voice Activation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Aktivasi Perintah Suara
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800">
                  Web Speech API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pindah divisi atau tanya Asisten AI dengan suara Anda
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Ganti Bahasa Pengenalan Suara"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{activeLang === 'id-ID' ? 'ID (Indonesia)' : 'EN (English)'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Listening Arena */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-3.5 sm:space-y-4">
          {/* Animated Glowing Microphone Circle */}
          <div className="relative flex items-center justify-center my-2">
            {/* Pulsing Ripple Rings */}
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full bg-teal-500/20 dark:bg-teal-400/20 pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 1.85, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.35, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full bg-teal-500/10 dark:bg-teal-400/10 pointer-events-none"
                />
              </>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white ring-4 ring-teal-400/40 shadow-teal-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Klik untuk jeda mendengar' : 'Klik untuk mulai mendengarkan'}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <MicOff className="w-8 h-8 opacity-75" />
              )}
            </button>
          </div>

          {/* Audio Wave Visualizer Bars */}
          {isListening && (
            <div className="flex items-center justify-center space-x-1.5 h-6">
              {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.3].map((delay, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    scaleY: [0.3, 1.4, 0.3],
                    backgroundColor: ['#14b8a6', '#10b981', '#14b8a6']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9,
                    delay: delay * 0.4,
                    ease: 'easeInOut'
                  }}
                  className="w-1.5 h-4 rounded-full bg-teal-500"
                />
              ))}
            </div>
          )}

          {/* Status Text & Interim Speech Transcript Display */}
          <div className="w-full max-w-md min-h-[5rem] flex flex-col items-center justify-center px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5">
            {isListening ? (
              interimTranscript ? (
                <div className="space-y-1 w-full text-center">
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                    Mendengarkan...
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white break-words">
                    "{interimTranscript}"
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Silakan berbicara sekarang...
                  </p>
                  <p className="text-xs text-slate-400">
                    Sebut nama divisi (misal: "Buka Keuangan") atau ajukan pertanyaan ke AI
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Mikrofon sedang dijeda
                </p>
                <p className="text-xs text-slate-400">
                  Klik ikon mikrofon di atas untuk mulai berbicara
                </p>
              </div>
            )}

            {speechError && (
              <div className="mt-2 text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {/* Live Intent Match Card */}
          {livePreview && livePreview.type !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full max-w-md p-3 rounded-xl border flex items-center justify-between text-left text-xs ${
                livePreview.type === 'navigate'
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                  : livePreview.type === 'ai_query'
                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                  : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs shrink-0">
                  {livePreview.type === 'navigate' ? (
                    <Building2 className="w-4 h-4 text-indigo-500" />
                  ) : livePreview.type === 'ai_query' ? (
                    <MascotAvatar size="xs" variant="badge" className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span>{livePreview.title}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      ({Math.round(livePreview.confidence * 100)}%)
                    </span>
                  </div>
                  <p className="text-[11px] opacity-85 line-clamp-1">
                    {livePreview.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50 shrink-0" />
            </motion.div>
          )}

          {/* Browser Support Warning if not supported */}
          {!isRecognitionSupported && (
            <div className="w-full max-w-md p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Web Speech API Belum Aktif di Browser Ini</span>
                <p className="mt-0.5 text-[11px] opacity-90">
                  Gunakan peramban modern seperti Google Chrome, Microsoft Edge, atau Safari untuk aktivasi suara langsung. Anda tetap dapat mengetik perintah di kotak teks manual di bawah.
                </p>
              </div>
            </div>
          )}

          {/* Manual Text Fallback Input */}
          <form onSubmit={handleManualSubmit} className="w-full max-w-md flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Atau ketik perintah manual (cth: 'Buka Logistik', 'Tanya AI kas')..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <button
              type="submit"
              disabled={!manualText.trim() || isExecuting}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Kirim</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Interactive Example Suggestion Chips */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>Contoh Perintah yang Bisa Anda Ucapkan:</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Alt+V
              </kbd>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center max-h-36 overflow-y-auto pr-1">
              {EXAMPLE_COMMANDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(item.text)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-300 transition-all text-left cursor-pointer group"
                >
                  <span className="shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="truncate max-w-[240px]">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Tekan <kbd className="font-mono text-slate-700 dark:text-slate-300">Esc</kbd> untuk menutup</span>
          <span>Web Speech API • Multi-bahasa</span>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
