import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPleasantSuccessChime } from '../../utils/soundEffects';

export interface ElegantTaskProgressBarProps {
  percent: number;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showSparkleOnComplete?: boolean;
  triggerConfettiOnComplete?: boolean;
  showGlow?: boolean;
  statusLabel?: string;
  className?: string;
  compact?: boolean;
  interactiveOnClick?: () => void;
}

/**
 * Fires a tasteful, polite micro-confetti burst with reduced motion safety
 */
export const fireTaskCelebrationConfetti = (clientX?: number, clientY?: number) => {
  try {
    const origin =
      clientX !== undefined && clientY !== undefined && typeof window !== 'undefined'
        ? { x: Math.max(0.1, Math.min(0.9, clientX / window.innerWidth)), y: Math.max(0.1, Math.min(0.9, clientY / window.innerHeight)) }
        : { x: 0.5, y: 0.6 };

    confetti({
      particleCount: 26,
      spread: 55,
      startVelocity: 24,
      origin,
      colors: ['#10B981', '#34D399', '#6366F1', '#818CF8', '#F59E0B'],
      disableForReducedMotion: true,
      gravity: 0.9,
      ticks: 140,
      scalar: 0.75
    });
  } catch {
    // Fail silently in environments without canvas support
  }
};

export const ElegantTaskProgressBar: React.FC<ElegantTaskProgressBarProps> = ({
  percent,
  height = 'sm',
  showBadge = false,
  showSparkleOnComplete = true,
  triggerConfettiOnComplete = true,
  showGlow = true,
  statusLabel,
  className = '',
  compact = false,
  interactiveOnClick
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const prevPercentRef = useRef<number>(clamped);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Monitor transitions to 100% completion to provide instant visual and acoustic celebration
  useEffect(() => {
    const prev = prevPercentRef.current;
    if (prev < 100 && clamped >= 100) {
      setJustCompleted(true);

      // Play soft harmonic audio feedback
      playPleasantSuccessChime();

      // Trigger subtle particle celebration if configured
      if (triggerConfettiOnComplete) {
        fireTaskCelebrationConfetti();
      }

      // Hide the celebratory popout after 2.8 seconds
      const timer = setTimeout(() => {
        setJustCompleted(false);
      }, 2800);
      prevPercentRef.current = clamped;
      return () => clearTimeout(timer);
    } else {
      prevPercentRef.current = clamped;
    }
  }, [clamped, triggerConfettiOnComplete]);

  // Determine height classes
  const heightClass =
    height === 'xs'
      ? 'h-1.5'
      : height === 'sm'
      ? 'h-2'
      : height === 'md'
      ? 'h-2.5'
      : 'h-3.5';

  // Dynamic gradient based on completion tier
  const getGradientFill = () => {
    if (clamped >= 100) {
      return {
        bar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
        glow: showGlow ? 'shadow-[0_0_14px_rgba(16,185,129,0.55)]' : '',
        text: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    }
    if (clamped >= 60) {
      return {
        bar: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600',
        glow: showGlow ? 'shadow-[0_0_12px_rgba(99,102,241,0.4)]' : '',
        text: 'text-indigo-700 dark:text-indigo-300',
        badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/90 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
      };
    }
    if (clamped > 0) {
      return {
        bar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500',
        glow: showGlow ? 'shadow-[0_0_10px_rgba(245,158,11,0.35)]' : '',
        text: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    }
    return {
      bar: 'bg-slate-300 dark:bg-slate-600',
      glow: '',
      text: 'text-slate-500 dark:text-slate-400',
      badgeBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
    };
  };

  const styleConfig = getGradientFill();

  return (
    <div
      className={`relative flex flex-col justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={interactiveOnClick}
    >
      {/* Top Meta row if badge/label requested */}
      {showBadge && (
        <div className="flex items-center justify-between gap-1.5 mb-1 text-[10.5px]">
          <span className="font-bold text-slate-600 dark:text-slate-300 truncate">
            {statusLabel || (clamped >= 100 ? 'Tuntas Sempurna' : clamped > 0 ? 'Sedang Berjalan' : 'Belum Mulai')}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-1.5 py-0.2 rounded-full font-extrabold border transition-colors ${styleConfig.badgeBg}`}
            >
              {clamped}%
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar Outer Track */}
      <div
        className={`w-full ${heightClass} bg-slate-200/90 dark:bg-slate-700/80 rounded-full overflow-hidden relative shadow-inner`}
      >
        {/* Animated Fill Bar with Smooth Spring Physics */}
        <motion.div
          className={`h-full rounded-full relative ${styleConfig.bar} ${styleConfig.glow}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{
            type: 'spring',
            stiffness: 65,
            damping: 15,
            mass: 0.8
          }}
        >
          {/* Shimmer light beam sweep effect */}
          {clamped > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/25 to-transparent w-full h-full"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                repeat: Infinity,
                duration: clamped >= 100 ? 2.2 : 3,
                ease: 'easeInOut',
                repeatDelay: clamped >= 100 ? 0.8 : 1.5
              }}
            />
          )}

          {/* Glowing leading-edge dot at progress tip */}
          {clamped > 5 && clamped < 100 && (
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
          )}

          {/* Sparkle icon at completion tip */}
          {clamped >= 100 && showSparkleOnComplete && (
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Instant Celebratory Floating Pill on 100% Completion */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20 whitespace-nowrap"
          >
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-lg shadow-emerald-500/30 border border-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>Tuntas 100%! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover tooltip for compact mode */}
      {compact && isHovered && !justCompleted && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[9.5px] font-mono font-bold pointer-events-none z-10 shadow-xs whitespace-nowrap">
          {clamped}% Selesai
        </div>
      )}
    </div>
  );
};
