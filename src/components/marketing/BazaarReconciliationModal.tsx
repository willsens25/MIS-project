import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BazaarEvent, BazaarAllocationItem, Book } from '../../types';
import { Scale, CheckCircle2, X, AlertCircle, RefreshCw, Sparkles, DollarSign } from 'lucide-react';

interface BazaarReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BazaarEvent | null;
  books: Book[];
  onConfirmReconcile: (eventId: number, items: BazaarAllocationItem[], notes?: string) => void;
}

export const BazaarReconciliationModal: React.FC<BazaarReconciliationModalProps> = ({
  isOpen,
  onClose,
  event,
  books,
  onConfirmReconcile
}) => {
  const [items, setItems] = useState<BazaarAllocationItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      if (event.items && event.items.length > 0) {
        setItems(
          event.items.map(it => ({
            ...it,
            qty_terjual: it.qty_terjual || 0,
            qty_kembali: it.qty_kembali !== undefined ? it.qty_kembali : Math.max(0, it.qty_dibawa - (it.qty_terjual || 0)),
            qty_rusak: it.qty_rusak || 0
          }))
        );
      } else {
        setItems([]);
      }
      setNotes('');
      setErrorMessage(null);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleUpdateTerjual = (bookId: number, soldQty: number) => {
    setErrorMessage(null);
    setItems(prev =>
      prev.map(i => {
        if (i.buku_id === bookId) {
          const validSold = Math.max(0, Math.min(i.qty_dibawa, soldQty));
          const autoKembali = Math.max(0, i.qty_dibawa - validSold - (i.qty_rusak || 0));
          return {
            ...i,
            qty_terjual: validSold,
            qty_kembali: autoKembali
          };
        }
        return i;
      })
    );
  };

  const handleUpdateKembali = (bookId: number, returnQty: number) => {
    setErrorMessage(null);
    setItems(prev =>
      prev.map(i => {
        if (i.buku_id === bookId) {
          const validReturn = Math.max(0, Math.min(i.qty_dibawa, returnQty));
          return {
            ...i,
            qty_kembali: validReturn
          };
        }
        return i;
      })
    );
  };

  const handleQuickAllSold = () => {
    setItems(prev =>
      prev.map(i => ({
        ...i,
        qty_terjual: i.qty_dibawa,
        qty_kembali: 0,
        qty_rusak: 0
      }))
    );
  };

  const handleQuickAutoReturn = () => {
    setItems(prev =>
      prev.map(i => ({
        ...i,
        qty_kembali: Math.max(0, i.qty_dibawa - (i.qty_terjual || 0) - (i.qty_rusak || 0))
      }))
    );
  };

  const totalDibawa = items.reduce((s, i) => s + (i.qty_dibawa || 0), 0);
  const totalTerjual = items.reduce((s, i) => s + (i.qty_terjual || 0), 0);
  const totalKembali = items.reduce((s, i) => s + (i.qty_kembali || 0), 0);
  const totalOmzet = items.reduce((s, i) => s + (i.qty_terjual || 0) * (i.harga_satuan || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi selisih
    for (const it of items) {
      const b = books.find(book => book.id === it.buku_id);
      const totalOut = (it.qty_terjual || 0) + (it.qty_kembali || 0) + (it.qty_rusak || 0);
      if (totalOut > it.qty_dibawa) {
        setErrorMessage(`Buku "${b?.judul}": Jumlah terjual + kembali (${totalOut}) melebihi jumlah bawaan (${it.qty_dibawa}).`);
        return;
      }
    }

    onConfirmReconcile(event.id, items, notes);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Rekonsiliasi Selesai Bazaar & Pengembalian Stok
              </h3>
              <p className="text-xs text-slate-500">
                Acara: <strong className="text-slate-800 dark:text-slate-200">{event.nama_event}</strong> - PIC: {event.pic_nama}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Helper Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Isi jumlah terjual dan sisa buku yang kembali ke gudang:</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleQuickAutoReturn}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
            >
              🔄 Hitung Otomatis Sisa Kembali
            </button>
            <button
              type="button"
              onClick={handleQuickAllSold}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              ⚡ Tandai Ludes Terjual Semua
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Table of Reconciliation Items */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 sticky top-0 z-10 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Judul Buku</th>
                  <th className="p-2.5 text-center w-20">Dibawa</th>
                  <th className="p-2.5 text-center w-24">Terjual</th>
                  <th className="p-2.5 text-center w-24">Kembali Gudang</th>
                  <th className="p-2.5 text-right w-28">Harga Satuan</th>
                  <th className="p-2.5 text-right w-32">Subtotal Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Tidak ada alokasi buku yang tercatat pada acara ini.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => {
                    const b = books.find(book => book.id === it.buku_id);
                    const subtotal = (it.qty_terjual || 0) * (it.harga_satuan || 0);
                    const isSelisih = ((it.qty_terjual || 0) + (it.qty_kembali || 0)) !== it.qty_dibawa;

                    return (
                      <tr key={it.buku_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {b?.judul || 'Buku'}
                          </p>
                          {isSelisih && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              ⚠️ Selisih: {it.qty_dibawa - ((it.qty_terjual || 0) + (it.qty_kembali || 0))} eks belum terhitung
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                          {it.qty_dibawa}
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.qty_dibawa}
                            value={it.qty_terjual || 0}
                            onChange={e => handleUpdateTerjual(it.buku_id, Number(e.target.value))}
                            className="w-18 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.qty_dibawa}
                            value={it.qty_kembali || 0}
                            onChange={e => handleUpdateKembali(it.buku_id, Number(e.target.value))}
                            className="w-18 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                          Rp {(it.harga_satuan || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          Rp {subtotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Catatan Rekonsiliasi / Kondisi Stan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Misal: 2 buku sobek terkena air hujan, hasil penjualan telah disetor ke rekening penerbit..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-xs"
            />
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Total Buku Bawaan:</span>
              <strong className="font-mono text-slate-900 dark:text-white">{totalDibawa} eks</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
              <span>Total Buku Terjual:</span>
              <strong className="font-mono text-base font-bold">{totalTerjual} eks</strong>
            </div>
            <div className="flex justify-between items-center text-indigo-700 dark:text-indigo-400">
              <span>Buku Kembali ke Gudang (Restock):</span>
              <strong className="font-mono text-base font-bold">+{totalKembali} eks</strong>
            </div>
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white">Total Omzet Penjualan:</span>
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 font-mono">
                Rp {totalOmzet.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={items.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan & Restock {totalKembali} Buku ke Gudang</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
