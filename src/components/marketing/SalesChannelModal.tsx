import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SalesChannel } from '../../types';
import { Globe, Plus, X } from 'lucide-react';

interface SalesChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channel: Omit<SalesChannel, 'id'>) => void;
}

export const SalesChannelModal: React.FC<SalesChannelModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [namaChannel, setNamaChannel] = useState('');
  const [kategori, setKategori] = useState<'Marketplace' | 'Social Media' | 'Direct / Offline' | 'Event' | 'Website' | 'Lainnya'>('Marketplace');
  const [deskripsi, setDeskripsi] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaChannel.trim()) return;

    onSave({
      nama_channel: namaChannel.trim(),
      kategori,
      deskripsi: deskripsi.trim() || undefined,
      aktif: true,
      is_active: true
    });

    setNamaChannel('');
    setDeskripsi('');
    setKategori('Marketplace');
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
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tambah Saluran Penjualan (Via)
                </h3>
                <p className="text-xs text-slate-500">
                  Tambahkan marketplace, event, atau kanal pemasaran baru
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
                Nama Saluran / Marketplace *
              </label>
              <input
                type="text"
                required
                value={namaChannel}
                onChange={e => setNamaChannel(e.target.value)}
                placeholder="Contoh: TikTok Shop, Blibli, Call Center, Bazar Vihara..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Kategori Saluran
              </label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <option value="Marketplace">Marketplace (Tokopedia, Shopee, TikTok Shop, dll)</option>
                <option value="Social Media">Social Media / Chat (WhatsApp, Instagram, Telegram)</option>
                <option value="Direct / Offline">Direct Order / Offline (Kantor / Toko)</option>
                <option value="Event">Event / Bazar / Pameran</option>
                <option value="Website">Website Yayasan / E-Commerce</option>
                <option value="Lainnya">Lainnya / Mitra</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Keterangan / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                placeholder="Misal: Biaya admin 3%, link toko, atau nomor CS..."
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Saluran</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
