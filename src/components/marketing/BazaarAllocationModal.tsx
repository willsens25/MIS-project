import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BazaarEvent, BazaarAllocationItem, Book } from '../../types';
import { Package, Plus, Trash2, X, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface BazaarAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BazaarEvent | null;
  books: Book[];
  onConfirmAllocation: (eventId: number, items: BazaarAllocationItem[]) => void;
}

export const BazaarAllocationModal: React.FC<BazaarAllocationModalProps> = ({
  isOpen,
  onClose,
  event,
  books,
  onConfirmAllocation
}) => {
  const [items, setItems] = useState<BazaarAllocationItem[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number>(books[0]?.id || 1);
  const [selectedQty, setSelectedQty] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      if (event.items && event.items.length > 0) {
        setItems([...event.items]);
      } else {
        // Preset with top 3 available books in warehouse
        const topBooks = books.filter(b => b.stok_gudang > 0).slice(0, 3);
        setItems(
          topBooks.map(b => ({
            buku_id: b.id,
            qty_dibawa: Math.min(10, b.stok_gudang),
            qty_terjual: 0,
            qty_kembali: Math.min(10, b.stok_gudang),
            harga_satuan: b.harga_jual
          }))
        );
      }
      setErrorMessage(null);
    }
  }, [event, isOpen, books]);

  if (!isOpen || !event) return null;

  const currentBook = books.find(b => b.id === selectedBookId);

  const handleAddItem = () => {
    setErrorMessage(null);
    if (!currentBook) return;

    if (currentBook.stok_gudang <= 0) {
      setErrorMessage(`Stok "${currentBook.judul}" di gudang habis (0 pcs).`);
      return;
    }

    if (selectedQty <= 0) {
      setErrorMessage('Jumlah eksemplar harus lebih dari 0.');
      return;
    }

    if (selectedQty > currentBook.stok_gudang) {
      setErrorMessage(`Jumlah diminta (${selectedQty}) melebihi sisa stok gudang (${currentBook.stok_gudang} pcs).`);
      return;
    }

    const existingIndex = items.findIndex(i => i.buku_id === selectedBookId);
    if (existingIndex >= 0) {
      const updated = [...items];
      const newTotal = updated[existingIndex].qty_dibawa + selectedQty;
      if (newTotal > currentBook.stok_gudang) {
        setErrorMessage(`Total alokasi (${newTotal}) melebihi stok gudang (${currentBook.stok_gudang} pcs).`);
        return;
      }
      updated[existingIndex].qty_dibawa = newTotal;
      updated[existingIndex].qty_kembali = newTotal;
      setItems(updated);
    } else {
      setItems(prev => [
        ...prev,
        {
          buku_id: currentBook.id,
          qty_dibawa: selectedQty,
          qty_terjual: 0,
          qty_kembali: selectedQty,
          harga_satuan: currentBook.harga_jual
        }
      ]);
    }

    // Reset picker
    setSelectedQty(10);
  };

  const handleRemoveItem = (bookId: number) => {
    setItems(prev => prev.filter(i => i.buku_id !== bookId));
  };

  const handleUpdateQty = (bookId: number, newQty: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (newQty < 1) return;
    if (newQty > book.stok_gudang) {
      setErrorMessage(`Alokasi tidak boleh melebihi stok gudang (${book.stok_gudang} pcs).`);
      return;
    }

    setErrorMessage(null);
    setItems(prev =>
      prev.map(i =>
        i.buku_id === bookId
          ? { ...i, qty_dibawa: newQty, qty_kembali: newQty }
          : i
      )
    );
  };

  const handleUpdatePrice = (bookId: number, newPrice: number) => {
    setItems(prev =>
      prev.map(i =>
        i.buku_id === bookId
          ? { ...i, harga_satuan: Math.max(0, newPrice) }
          : i
      )
    );
  };

  const totalQtyDibawa = items.reduce((s, i) => s + (i.qty_dibawa || 0), 0);
  const totalEstimasiNilai = items.reduce(
    (s, i) => s + (i.qty_dibawa || 0) * (i.harga_satuan || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Pilih minimal 1 judul buku untuk dialokasikan ke bazaar.');
      return;
    }

    // Final stock check
    for (const it of items) {
      const b = books.find(book => book.id === it.buku_id);
      if (b && b.stok_gudang < it.qty_dibawa) {
        setErrorMessage(`Stok buku "${b.judul}" tidak mencukupi (${b.stok_gudang} < ${it.qty_dibawa}).`);
        return;
      }
    }

    onConfirmAllocation(event.id, items);
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
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Alokasikan Buku dari Gudang ke Stan Bazaar
              </h3>
              <p className="text-xs text-slate-500">
                Acara: <strong className="text-slate-800 dark:text-slate-200">{event.nama_event}</strong> ({event.lokasi})
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

        <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Otomatis Potong Stok Fisik Gudang & Catat Manifest</p>
            <p className="text-blue-700 dark:text-blue-400 leading-relaxed text-[11px]">
              Buku yang dialokasikan akan langsung dipotong dari stok riil gudang demi mencegah selisih persediaan ganda. Setelah acara selesai, sisa buku yang tidak terjual akan dikembalikan secara akurat saat rekonsiliasi.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Bar: Add book to allocation */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pilih Buku & Jumlah yang Dibawa
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-7">
              <select
                value={selectedBookId}
                onChange={e => setSelectedBookId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {books.map(b => (
                  <option key={b.id} value={b.id} disabled={b.stok_gudang <= 0}>
                    {b.judul} {b.stok_gudang <= 0 ? '(STOK HABIS)' : `(Stok Gudang: ${b.stok_gudang} eks)`} - Rp {b.harga_jual.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <input
                type="number"
                min="1"
                max={currentBook?.stok_gudang || 999}
                value={selectedQty}
                onChange={e => setSelectedQty(Math.max(1, Number(e.target.value)))}
                placeholder="Qty"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full flex items-center justify-center space-x-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>

        {/* Allocated Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Daftar Alokasi Buku ({items.length} Judul)</span>
            <span className="text-slate-500">Total Bawa: <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{totalQtyDibawa}</strong> eks</span>
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {items.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Belum ada buku yang ditambahkan ke alokasi stan ini.
              </div>
            ) : (
              items.map((it, idx) => {
                const b = books.find(book => book.id === it.buku_id);
                return (
                  <div key={it.buku_id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {b?.judul || 'Buku Tidak Diketahui'}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tersedia di Gudang: <span className="font-semibold text-slate-700 dark:text-slate-300">{b?.stok_gudang || 0} pcs</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block text-right mb-0.5">Harga Jual (Rp)</span>
                        <input
                          type="number"
                          value={it.harga_satuan || 0}
                          onChange={e => handleUpdatePrice(it.buku_id, Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block text-center mb-0.5">Qty Dibawa</span>
                        <input
                          type="number"
                          min="1"
                          max={b?.stok_gudang || 999}
                          value={it.qty_dibawa}
                          onChange={e => handleUpdateQty(it.buku_id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-bold text-blue-600 dark:text-blue-400 font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.buku_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Hapus dari daftar bawaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500">Estimasi Nilai Barang Bawaan:</span>
            <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">
              Rp {totalEstimasiNilai.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
              className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi & Potong Stok Gudang ({totalQtyDibawa} Eks)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
