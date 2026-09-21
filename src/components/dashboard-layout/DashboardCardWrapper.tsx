import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardCardConfig } from '../../types/dashboardLayout';

interface DashboardCardWrapperProps {
  card: DashboardCardConfig;
  index: number;
  totalCards: number;
  isConfigMode: boolean;
  onMove: (direction: 'up' | 'down') => void;
  onToggleVisibility: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  isDragTarget?: boolean;
  children: React.ReactNode;
}

export const DashboardCardWrapper: React.FC<DashboardCardWrapperProps> = ({
  card,
  index,
  totalCards,
  isConfigMode,
  onMove,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragTarget = false,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    onDragStart(e, index);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  return (
    <motion.div
      layout
      layoutId={card.id}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{
        layout: { type: 'spring', damping: 28, stiffness: 320 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      draggable={isConfigMode}
      onDragStart={isConfigMode ? (handleDragStart as any) : undefined}
      onDragOver={isConfigMode ? (e) => onDragOver(e, index) : undefined}
      onDragEnd={isConfigMode ? (handleDragEnd as any) : undefined}
      onDrop={isConfigMode ? (e) => onDrop(e, index) : undefined}
      className={`relative group h-full ${
        isConfigMode ? 'cursor-grab active:cursor-grabbing select-none' : ''
      } ${
        isDragging
          ? 'opacity-40 scale-98 ring-2 ring-indigo-500 rounded-2xl'
          : ''
      } ${
        isDragTarget
          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 rounded-2xl scale-[1.02]'
          : ''
      }`}
    >
      {/* Config Mode Controls Overlay */}
      {isConfigMode && (
        <div className="absolute -top-3 left-2 right-2 z-20 flex items-center justify-between px-2.5 py-1 bg-slate-900/90 dark:bg-slate-800/95 text-white text-[11px] rounded-lg shadow-md backdrop-blur-xs border border-slate-700/60 transition-all">
          <div className="flex items-center space-x-1.5">
            <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab active:cursor-grabbing" />
            <span className="font-mono font-bold bg-indigo-500/80 text-white text-[10px] px-1.5 py-0.2 rounded">
              #{index + 1}
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[160px]">
              {card.divisiCode} • {card.title}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Move Backward / Up */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove('up');
              }}
              disabled={index === 0}
              className="p-0.5 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pindahkan ke depan (Prioritas Lebih Tinggi)"
              aria-label="Pindahkan ke depan"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Move Forward / Down */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove('down');
              }}
              disabled={index === totalCards - 1}
              className="p-0.5 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pindahkan ke belakang (Prioritas Lebih Rendah)"
              aria-label="Pindahkan ke belakang"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Visibility Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
              title="Sembunyikan kartu ini dari tampilan dashboard"
              aria-label="Sembunyikan kartu"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Actual Card Content with subtle styling adjustment in Config Mode */}
      <div
        className={`h-full flex flex-col transition-colors ${
          isConfigMode
            ? 'border-2 border-dashed border-indigo-400/50 dark:border-indigo-500/40 rounded-2xl pt-2 pb-1'
            : ''
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
};
