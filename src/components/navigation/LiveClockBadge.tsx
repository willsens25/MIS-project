import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Globe } from 'lucide-react';
import {
  IndonesianTimezoneKey,
  getActiveTimezone,
  setActiveTimezone,
  getTimePartsInTimezone,
  TIMEZONE_MAPPING
} from '../../utils/greetingUtils';

interface LiveClockBadgeProps {
  showSeconds?: boolean;
  showTimezone?: boolean;
  variant?: 'compact' | 'standard' | 'prominent';
  className?: string;
  allowTimezoneSwitch?: boolean;
}

export const LiveClockBadge: React.FC<LiveClockBadgeProps> = ({
  showSeconds = true,
  showTimezone = true,
  variant = 'standard',
  className = '',
  allowTimezoneSwitch = true
}) => {
  const [activeTz, setActiveTz] = useState<IndonesianTimezoneKey>(getActiveTimezone());
  const [timeParts, setTimeParts] = useState(() => getTimePartsInTimezone(new Date(), getActiveTimezone()));

  // Sync state when global timezone changes
  useEffect(() => {
    const handleTzChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ timezone: IndonesianTimezoneKey }>;
      if (customEvent.detail?.timezone) {
        setActiveTz(customEvent.detail.timezone);
        setTimeParts(getTimePartsInTimezone(new Date(), customEvent.detail.timezone));
      }
    };

    window.addEventListener('mis-timezone-changed', handleTzChange);
    return () => window.removeEventListener('mis-timezone-changed', handleTzChange);
  }, []);

  // Update every second with accurate timezone calculation
  useEffect(() => {
    const tick = () => {
      setTimeParts(getTimePartsInTimezone(new Date(), activeTz));
    };

    // Initial tick & 1s interval
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeTz]);

  // Cycle timezones on click: WIB -> WITA -> WIT -> LOCAL -> WIB
  const handleCycleTimezone = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!allowTimezoneSwitch) return;

    const order: IndonesianTimezoneKey[] = ['WIB', 'WITA', 'WIT', 'LOCAL'];
    const currentIndex = order.indexOf(activeTz);
    const nextIndex = (currentIndex + 1) % order.length;
    const nextTz = order[nextIndex];

    setActiveTz(nextTz);
    setActiveTimezone(nextTz);
  }, [activeTz, allowTimezoneSwitch]);

  const hours = String(timeParts.hour).padStart(2, '0');
  const minutes = String(timeParts.minute).padStart(2, '0');
  const seconds = String(timeParts.second).padStart(2, '0');
  const tzConfig = TIMEZONE_MAPPING[activeTz] || TIMEZONE_MAPPING.WIB;

  const tooltipText = `Jam Tersinkronisasi Realtime: ${hours}:${minutes}:${seconds} ${tzConfig.label} (${tzConfig.name})${
    allowTimezoneSwitch ? ' — Klik untuk ganti zona waktu' : ''
  }`;

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs select-none ${className}`}
        title={tooltipText}
      >
        <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <span className="font-mono text-xs font-semibold tabular-nums tracking-wide">
          {hours}:{minutes}{showSeconds && <span className="text-slate-400 dark:text-slate-500">:{seconds}</span>}
        </span>
        {showTimezone && (
          <button
            type="button"
            onClick={handleCycleTimezone}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-0.5"
            title={`Zona Waktu: ${tzConfig.label}. Klik untuk ganti`}
          >
            {tzConfig.label}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'prominent') {
    return (
      <div
        className={`inline-flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-indigo-800/70 shadow-xs select-none ${className}`}
        title={tooltipText}
      >
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
          <Clock className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">
              Waktu Sistem
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Tersinkronisasi" />
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums tracking-wider">
              {hours}:{minutes}
              {showSeconds && <span className="text-indigo-600 dark:text-indigo-400">:{seconds}</span>}
            </span>
            {showTimezone && (
              <button
                type="button"
                onClick={handleCycleTimezone}
                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer ml-1"
                title="Ganti zona waktu (WIB / WITA / WIT / Lokal)"
              >
                {tzConfig.label}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard (Default) — well-balanced, clear, not too small
  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors select-none ${className}`}
      title={tooltipText}
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
          title="Tersinkronisasi Realtime"
        />
      </div>

      <div className="flex items-center space-x-1 font-mono text-xs sm:text-[13px] font-bold tabular-nums tracking-wide text-slate-800 dark:text-slate-100">
        <span>{hours}:{minutes}</span>
        {showSeconds && (
          <span className="text-slate-400 dark:text-slate-400 font-medium text-[11px] sm:text-xs">
            :{seconds}
          </span>
        )}
      </div>

      {showTimezone && (
        <button
          type="button"
          onClick={handleCycleTimezone}
          className="group inline-flex items-center space-x-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-1.5 py-0.5 rounded-md border border-indigo-200/70 dark:border-indigo-800/70 transition-colors cursor-pointer leading-none"
          title={`Zona waktu aktif: ${tzConfig.label} (${tzConfig.name}). Klik untuk beralih ke WITA / WIT / Lokal.`}
        >
          <span>{tzConfig.label}</span>
          {allowTimezoneSwitch && (
            <Globe className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      )}
    </div>
  );
};
