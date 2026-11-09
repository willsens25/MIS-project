import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAiHealth } from '../hooks/useAiHealth';
import { AiDiagnosticsModal } from './AiDiagnosticsModal';

export const AiHealthNavbarIndicator: React.FC = () => {
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const {
    healthInfo,
    isChecking,
    checkStatus,
    isHealthy,
    isDegraded,
    isDown,
    isQuotaExceeded
  } = useAiHealth({ autoCheck: true, pollIntervalMs: 45000 });

  // Calculate latency in ms
  const latency = healthInfo?.latencyMs || 0;

  // Determine status tier: Green (Operational) | Amber (High Latency) | Red (Outage)
  // High Latency: degraded (503 traffic spike), quota exceeded (429), or latency >= 1500ms
  const isOutage = isDown || healthInfo?.status === 'down' || healthInfo?.status === 'invalid_key' || healthInfo?.status === 'unconfigured';
  const isHighLatency = !isOutage && (isDegraded || isQuotaExceeded || (isHealthy && latency >= 1500) || healthInfo?.status === 'degraded');

  let statusTier: 'operational' | 'high_latency' | 'outage';
  let dotColor: string;
  let pingColor: string;
  let bgClass: string;
  let labelText: string;
  let shortLabel: string;
  let tooltipText: string;
  let StatusIcon: React.ElementType;

  if (isOutage) {
    statusTier = 'outage';
    dotColor = 'bg-rose-500';
    pingColor = 'bg-rose-400';
    bgClass = 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/35 hover:border-rose-500/50';
    labelText = 'Outage';
    shortLabel = 'Outage';
    StatusIcon = AlertCircle;
    tooltipText = `Status AI: Outage / Terputus (${healthInfo?.title || 'Gateway tidak terhubung'}) — Klik untuk diagnostik & pemulihan`;
  } else if (isHighLatency) {
    statusTier = 'high_latency';
    dotColor = 'bg-amber-400';
    pingColor = 'bg-amber-400';
    bgClass = 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/35 hover:border-amber-500/50';
    labelText = 'High Latency';
    shortLabel = latency > 0 ? `${latency}ms` : '503';
    StatusIcon = AlertTriangle;
    tooltipText = `Status AI: High Latency (${latency > 0 ? `${latency}ms` : 'Trafik Antrean Tinggi'}) — Klik untuk rincian diagnostik`;
  } else {
    statusTier = 'operational';
    dotColor = 'bg-emerald-500';
    pingColor = 'bg-emerald-400';
    bgClass = 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 hover:border-emerald-500/50';
    labelText = 'Operational';
    shortLabel = latency > 0 ? `${latency}ms` : 'Online';
    StatusIcon = CheckCircle2;
    tooltipText = `Status AI: Operational (${latency > 0 ? `${latency}ms` : 'Koneksi Optimal'}) — Klik untuk melihat diagnostik lengkap`;
  }

  return (
    <>
      <motion.button
        id="btn-ai-health-navbar-indicator"
        type="button"
        onClick={() => setIsDiagnosticsOpen(true)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`h-8.5 px-2.5 flex items-center space-x-1.5 border rounded-xl text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer group select-none ${bgClass}`}
        title={tooltipText}
        aria-label={`Status Koneksi AI: ${labelText}`}
      >
        {/* Animated Radar Pulse Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>

        {/* Small Status Icon on Hover */}
        <StatusIcon className="w-3 h-3 shrink-0 hidden sm:inline opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Text Status Label */}
        <span className="font-bold tracking-tight hidden sm:inline">
          {labelText}
        </span>

        {/* Real-time Latency Tag */}
        {latency > 0 && (
          <span className="hidden md:inline text-[10px] font-mono px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 opacity-85">
            {latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`}
          </span>
        )}

        {/* Compact Label for Mobile Screen */}
        <span className="sm:hidden font-bold text-[10.5px]">
          {shortLabel}
        </span>

        {/* Loading Spinner when check is actively running */}
        {isChecking && (
          <RefreshCw className="w-2.5 h-2.5 animate-spin opacity-70 ml-0.5" />
        )}
      </motion.button>

      {/* Detailed Diagnostic Modal */}
      <AiDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        healthInfo={healthInfo}
        isChecking={isChecking}
        onRefresh={() => checkStatus(true)}
      />
    </>
  );
};
