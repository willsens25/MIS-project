import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Cpu,
  Zap,
  ShieldCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import { AiHealthInfo } from '../services/aiHealthService';

interface AiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthInfo: AiHealthInfo | null;
  isChecking: boolean;
  onRefresh: () => void;
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  healthInfo,
  isChecking,
  onRefresh
}) => {
  if (!isOpen) return null;

  const getStatusVisuals = () => {
    if (isChecking && !healthInfo) {
      return {
        icon: <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />,
        badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
        badgeText: 'Sedang Memeriksa...',
        title: 'Mendeteksi Status Koneksi...',
        desc: 'Mengirimkan probe ping ke gateway server Google Gemini...',
        ringColor: 'ring-teal-500/30'
      };
    }

    if (!healthInfo) {
      return {
        icon: <Info className="w-8 h-8 text-slate-400" />,
        badgeBg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
        badgeText: 'Status Belum Dimuat',
        title: 'Belum Ada Data Diagnostik',
        desc: 'Klik tombol di bawah untuk memeriksa koneksi ke server AI.',
        ringColor: 'ring-slate-500/30'
      };
    }

    switch (healthInfo.status) {
      case 'healthy':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          badgeText: `Optimal • Latensi ${healthInfo.latencyMs}ms`,
          title: healthInfo.title,
          desc: healthInfo.message,
          ringColor: 'ring-emerald-500/30'
        };
      case 'degraded':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          badgeText: `Kapasitas Padat (503) • Latensi ${healthInfo.latencyMs}ms`,
          title: healthInfo.title,
          desc: healthInfo.message,
          ringColor: 'ring-amber-500/40'
        };
      case 'quota_exceeded':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
          badgeBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
          badgeText: 'Batas Kuota Tercapai (429)',
          title: healthInfo.title,
          desc: healthInfo.message,
          ringColor: 'ring-orange-500/40'
        };
      case 'unconfigured':
      case 'invalid_key':
        return {
          icon: <XCircle className="w-8 h-8 text-rose-400" />,
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          badgeText: healthInfo.status === 'unconfigured' ? 'API Key Belum Terpasang' : 'API Key Ditolak',
          title: healthInfo.title,
          desc: healthInfo.message,
          ringColor: 'ring-rose-500/40'
        };
      case 'down':
      default:
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          badgeBg: 'bg-red-500/20 border-red-500/40 text-red-300',
          badgeText: 'Gangguan Teknis Server',
          title: healthInfo.title,
          desc: healthInfo.message,
          ringColor: 'ring-red-500/40'
        };
    }
  };

  const visuals = getStatusVisuals();

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">
                  Status & Diagnostik Koneksi AI
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pemantauan real-time gateway Google Gemini
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

          {/* Content Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Status Hero Card */}
            <div className={`p-4 rounded-xl border bg-slate-850/80 ${visuals.ringColor} ring-1 space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 shadow-inner">
                    {visuals.icon}
                  </div>
                  <div>
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${visuals.badgeBg}`}>
                      {visuals.badgeText}
                    </span>
                    <h4 className="font-bold text-base text-white mt-1">
                      {visuals.title}
                    </h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {visuals.desc}
              </p>

              {healthInfo?.troubleshooting && (
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Petunjuk / Solusi Teknis:</span>
                  </div>
                  <p className="text-slate-300/90 leading-relaxed font-sans">
                    {healthInfo.troubleshooting}
                  </p>
                </div>
              )}
            </div>

            {/* Architecture & Multi-Model Chain Card */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span>Rantai Model & Perlindungan Failover</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Model Utama</span>
                    <span className="text-emerald-400 font-semibold">Aktif</span>
                  </div>
                  <div className="font-mono text-xs font-semibold text-teal-300">
                    gemini-3.8-flash
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Penalaran cerdas & analisis data MIS mendalam
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Cadangan Otomatis</span>
                    <span className="text-teal-400 font-semibold">Siap Sedia</span>
                  </div>
                  <div className="font-mono text-xs font-semibold text-indigo-300">
                    gemini-3.1-flash-lite
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Throughput tinggi & proteksi lonjakan trafik 503
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostics Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Waktu Respons</span>
                <span className="font-mono font-bold text-sm text-teal-300">
                  {healthInfo ? `${healthInfo.latencyMs} ms` : '-'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Metode Komunikasi</span>
                <span className="font-semibold text-xs text-slate-200 block truncate">
                  SSE Streaming
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Pemeriksaan</span>
                <span className="text-[11px] text-slate-300 block">
                  {healthInfo?.cached ? `Cache (${healthInfo.ageSeconds || 0}d lalu)` : 'Real-time'}
                </span>
              </div>
            </div>

            {/* Hosting Note for Vercel / Environment */}
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-750 flex items-start gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>
                  Kunci API dilindungi di sisi server (Server-Side Proxy). Kunci tidak pernah diekspos ke browser pengguna.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/90">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isChecking}
              className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-md shadow-teal-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Memeriksa...' : 'Periksa Ulang Sekarang'}</span>
            </button>

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
