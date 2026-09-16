import React, { useState } from 'react';
import { FileSpreadsheet, Check } from 'lucide-react';

interface ExportCsvButtonProps {
  onClick: () => void;
  label?: string;
  id?: string;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
  count?: number;
  compact?: boolean;
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  onClick,
  label = 'Export CSV',
  id = 'btn-export-csv',
  tooltip = 'Ekspor data tabel saat ini ke file CSV / Excel untuk laporan eksternal',
  className = '',
  disabled = false,
  count,
  compact = false,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    onClick();
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
      aria-label={label}
      className={`print:hidden group inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
        disabled
          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
          : downloaded
          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40 shadow-emerald-600/20'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-md hover:shadow-emerald-600/20 active:bg-emerald-700'
      } ${className}`}
    >
      {downloaded ? (
        <Check className="w-3.5 h-3.5 text-white animate-bounce" />
      ) : (
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
      )}
      
      {!compact && (
        <span className="hidden sm:inline">
          {downloaded ? 'Terekspor!' : label}
        </span>
      )}
      {compact && !downloaded && (
        <span className="text-[11px]">CSV</span>
      )}
      {count !== undefined && count > 0 && !downloaded && (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-700/80 text-emerald-100">
          {count}
        </span>
      )}
    </button>
  );
};
