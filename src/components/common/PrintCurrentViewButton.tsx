import React from 'react';
import { Printer } from 'lucide-react';

interface PrintCurrentViewButtonProps {
  id?: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'subtle';
}

export const PrintCurrentViewButton: React.FC<PrintCurrentViewButtonProps> = ({
  id = 'btn-print-current-view',
  label = 'Print Current View',
  className = '',
  variant = 'default'
}) => {
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Error invoking print dialog:', err);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handlePrint}
      className={`print:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer border ${
        variant === 'outline'
          ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
      } ${className}`}
      title="Cetak tampilan dashboard saat ini dengan format laporan rapi (Print Current View)"
    >
      <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      <span>{label}</span>
    </button>
  );
};
