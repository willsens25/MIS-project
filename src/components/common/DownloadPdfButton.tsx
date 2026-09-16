import React, { useState } from 'react';
import { FileText, Loader2, Check } from 'lucide-react';
import { exportCurrentViewToPdf } from '../../utils/exportPdf';

export interface DownloadPdfButtonProps {
  id?: string;
  label?: string;
  filename?: string;
  tooltip?: string;
  orientation?: 'landscape' | 'portrait' | 'auto';
  targetElementId?: string;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  id = 'btn-download-pdf',
  label = 'Unduh PDF',
  filename = 'laporan_sapa_mis',
  tooltip = 'Unduh tampilan tabel saat ini langsung sebagai dokumen PDF resmi (sesuai format cetak)',
  orientation = 'landscape',
  targetElementId = 'printable-area',
  compact = false,
  className = '',
  disabled = false,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadPdf = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled || loading) return;

    setLoading(true);
    setStatusMessage('Memproses...');

    try {
      const success = await exportCurrentViewToPdf({
        targetElementId,
        filename,
        orientation,
        onProgress: (msg) => setStatusMessage(msg)
      });

      if (success) {
        setDownloaded(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setDownloaded(false);
          setStatusMessage('');
        }, 3000);
      } else {
        if (onError) onError(new Error('Gagal menghasilkan file PDF'));
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handleDownloadPdf}
      disabled={disabled || loading}
      title={tooltip}
      aria-label={label}
      className={`print:hidden group inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer select-none active:scale-95 border ${
        disabled
          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-700 cursor-not-allowed shadow-none'
          : downloaded
          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/30 shadow-sm'
          : loading
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-wait'
          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 shadow-xs hover:shadow-sm'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-spin" />
      ) : downloaded ? (
        <Check className="w-3.5 h-3.5 text-white animate-bounce" />
      ) : (
        <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
      )}

      {!compact && (
        <span className="hidden sm:inline">
          {loading ? (statusMessage || 'Memproses...') : downloaded ? 'PDF Tersimpan!' : label}
        </span>
      )}

      {compact && !loading && !downloaded && (
        <span className="text-[11px]">PDF</span>
      )}
    </button>
  );
};
