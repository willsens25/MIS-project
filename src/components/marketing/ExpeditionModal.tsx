import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Expedition } from '../../types';
import { Truck, Plus, X } from 'lucide-react';

interface ExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expedition: Omit<Expedition, 'id'>) => void;
}

export const ExpeditionModal: React.FC<ExpeditionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [namaEkspedisi, setNamaEkspedisi] = useState('');
  const [kode, setKode] = useState('');
  const [kategori, setKategori] = useState<'Reguler' | 'Express / Kilat' | 'Kargo' | 'Same Day / Instant' | 'Ambil Sendiri' | 'Lainnya'>('Reguler');
  const [estimasi, setEstimasi] = useState('2-3 Hari');
  const [deskripsi, setDeskripsi] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaEkspedisi.trim()) return;

    onSave({
      nama_ekspedisi: namaEkspedisi.trim(),
      kode: kode.trim().toUpperCase() || namaEkspedisi.slice(0, 4).toUpperCase(),
      kategori,
      estimasi: estimasi.trim() || undefined,
      deskripsi: deskripsi.trim() || undefined,
      aktif: true,
      is_active: true
    });

    setNamaEkspedisi('');
    setKode('');
    setEstimasi('2-3 Hari');
    setDeskripsi('');
    setKategori('Reguler');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tambah Jenis Ekspedisi / Kurir
                </h3>
                <p className="text-xs text-slate-500">
                  Daftarkan penyedia jasa pengiriman untuk pilihan order POS
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Nama Ekspedisi & Layanan *
              </label>
              <input
                type="text"
                required
                value={namaEkspedisi}
                onChange={e => setNamaEkspedisi(e.target.value)}
                placeholder="Contoh: J&T Cargo, Paxel Same Day, Wahana Express..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Kode Singkat
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={e => setKode(e.target.value.toUpperCase())}
                  placeholder="Contoh: JNTCARGO"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Kategori Layanan
                </label>
                <select
                  value={kategori}
                  onChange={e => setKategori(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="Reguler">Reguler</option>
                  <option value="Express / Kilat">Express / Kilat</option>
                  <option value="Kargo">Kargo / Muatan Besar</option>
                  <option value="Same Day / Instant">Same Day / Instant</option>
                  <option value="Ambil Sendiri">Ambil Sendiri di Gudang</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Estimasi Pengiriman (Hari)
              </label>
              <input
                type="text"
                value={estimasi}
                onChange={e => setEstimasi(e.target.value)}
                placeholder="Contoh: 1-2 Hari, 3-5 Hari, Hari Ini"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Keterangan / Kontak Kurir (Opsional)
              </label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                placeholder="Misal: Nomor pick-up call center atau batas pickup jam 16.00..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Ekspedisi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
