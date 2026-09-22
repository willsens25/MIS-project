import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BazaarEvent } from '../../types';
import { Calendar, MapPin, User, Phone, DollarSign, FileText, X, Sparkles } from 'lucide-react';

interface BazaarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  initialEvent?: BazaarEvent | null;
}

export const BazaarEventModal: React.FC<BazaarEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent
}) => {
  const [namaEvent, setNamaEvent] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().substring(0, 10));
  const [tanggalSelesai, setTanggalSelesai] = useState(new Date().toISOString().substring(0, 10));
  const [picNama, setPicNama] = useState('');
  const [picKontak, setPicKontak] = useState('');
  const [targetOmzet, setTargetOmzet] = useState<number>(5000000);
  const [catatan, setCatatan] = useState('');
  const [status, setStatus] = useState<BazaarEvent['status']>('Direncanakan');

  useEffect(() => {
    if (initialEvent) {
      setNamaEvent(initialEvent.nama_event);
      setLokasi(initialEvent.lokasi);
      setTanggalMulai(initialEvent.tanggal_mulai);
      setTanggalSelesai(initialEvent.tanggal_selesai);
      setPicNama(initialEvent.pic_nama);
      setPicKontak(initialEvent.pic_kontak || '');
      setTargetOmzet(initialEvent.target_omzet || 0);
      setCatatan(initialEvent.catatan || '');
      setStatus(initialEvent.status);
    } else {
      setNamaEvent('');
      setLokasi('');
      setTanggalMulai(new Date().toISOString().substring(0, 10));
      setTanggalSelesai(new Date().toISOString().substring(0, 10));
      setPicNama('');
      setPicKontak('');
      setTargetOmzet(5000000);
      setCatatan('');
      setStatus('Direncanakan');
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaEvent.trim() || !lokasi.trim() || !picNama.trim()) return;

    onSave({
      nama_event: namaEvent.trim(),
      lokasi: lokasi.trim(),
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      pic_nama: picNama.trim(),
      pic_kontak: picKontak.trim() || undefined,
      target_omzet: Number(targetOmzet) || 0,
      catatan: catatan.trim() || undefined,
      status,
      items: initialEvent ? initialEvent.items : []
    });

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
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {initialEvent ? 'Edit Agenda Bazaar / Konsinyasi' : 'Daftarkan Agenda Bazaar Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan acara pameran, bazaar waisak, dan stan konsinyasi eksternal
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Nama Acara / Stan *
            </label>
            <input
              type="text"
              required
              value={namaEvent}
              onChange={e => setNamaEvent(e.target.value)}
              placeholder="Contoh: Bazaar Waisak JIExpo Kemayoran"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Lokasi / Venue Acara *</span>
            </label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={e => setLokasi(e.target.value)}
              placeholder="Contoh: Hall B3 JIExpo, Jakarta Pusat"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={e => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                value={tanggalSelesai}
                onChange={e => setTanggalSelesai(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Penanggung Jawab (PIC) *</span>
              </label>
              <input
                type="text"
                required
                value={picNama}
                onChange={e => setPicNama(e.target.value)}
                placeholder="Nama PIC Stan / Koordinator"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>No. Kontak WhatsApp PIC</span>
              </label>
              <input
                type="text"
                value={picKontak}
                onChange={e => setPicKontak(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Omzet (Rp)</span>
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={targetOmzet}
                onChange={e => setTargetOmzet(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Status Acara
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="Direncanakan">Direncanakan</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Selesai Rekonsiliasi">Selesai Rekonsiliasi</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan / Fasilitas Stan</span>
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Nomor booth, fasilitas meja/listrik, pembagian shift relawan..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialEvent ? 'Simpan Perubahan' : 'Daftarkan Agenda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
