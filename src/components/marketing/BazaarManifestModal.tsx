import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { BazaarEvent, Book } from '../../types';
import { Printer, X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BazaarManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BazaarEvent | null;
  books: Book[];
}

export const BazaarManifestModal: React.FC<BazaarManifestModalProps> = ({
  isOpen,
  onClose,
  event,
  books
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalDibawa = (event.items || []).reduce((s, i) => s + (i.qty_dibawa || 0), 0);
  const totalNilai = (event.items || []).reduce(
    (s, i) => s + (i.qty_dibawa || 0) * (i.harga_satuan || 0),
    0
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Surat Jalan / Manifest Bawaan Stan Bazaar
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen pengeluaran persediaan barang konsinyasi untuk tim lapangan & sekuriti
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable) */}
        <div
          ref={printContentRef}
          className="p-6 sm:p-8 bg-white text-slate-900 rounded-xl border border-slate-200 space-y-6 text-xs print:p-0 print:border-none print:shadow-none print:m-0"
        >
          {/* Header Kop */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
                Penerbit Dharma Nusantara (Lamrimnesia)
              </h2>
              <p className="text-[11px] text-slate-600">
                Divisi Pemasaran, Logistik & Pengelolaan Konsinyasi Stan
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Dokumen Resmi: Surat Pengantar Muatan Barang Acara
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-[11px] text-slate-800">
                SJ-BZR-{event.id.toString().slice(-6)}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Tanggal Diterbitkan: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 text-[10px] block">NAMA ACARA / STAN:</span>
                <strong className="text-sm font-bold text-slate-900">{event.nama_event}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">LOKASI / TEMPAT:</span>
                <span className="font-semibold text-slate-800">{event.lokasi}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PERIODE ACARA:</span>
                <span className="font-medium text-slate-800">
                  {event.tanggal_mulai} s/d {event.tanggal_selesai}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-4">
              <div>
                <span className="text-slate-500 text-[10px] block">PENANGGUNG JAWAB (PIC):</span>
                <strong className="font-bold text-slate-900">{event.pic_nama || event.penanggung_jawab}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">KONTAK WHATSAPP PIC:</span>
                <span className="font-mono text-slate-800">{event.pic_kontak || event.kontak_pic || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">STATUS ALOKASI:</span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Stok Resmi Dialokasikan dari Gudang
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">
              Daftar Eksemplar Buku yang Dibawa ke Stan:
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2 text-left">Judul Buku Dharma</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Jumlah (Eks)</th>
                  <th className="border border-slate-300 p-2 text-right w-28">Harga Resmi</th>
                  <th className="border border-slate-300 p-2 text-right w-32">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                {(!event.items || event.items.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      Belum ada alokasi buku pada acara ini.
                    </td>
                  </tr>
                ) : (
                  event.items.map((it, idx) => {
                    const b = books.find(book => book.id === it.buku_id);
                    const subtotal = (it.qty_dibawa || 0) * (it.harga_satuan || 0);
                    return (
                      <tr key={it.buku_id} className="border-b border-slate-200">
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-semibold">{b?.judul || 'Buku'}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold font-mono text-slate-900">
                          {it.qty_dibawa}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          Rp {(it.harga_satuan || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                          Rp {subtotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td colSpan={2} className="border border-slate-300 p-2 text-right">
                    TOTAL KESELURUHAN BAWAAN:
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono text-sm">
                    {totalDibawa} eks
                  </td>
                  <td className="border border-slate-300 p-2 text-right"></td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-sm">
                    Rp {totalNilai.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {event.catatan && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700">
              <strong>Catatan Stan:</strong> {event.catatan}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-14">Petugas Logistik Gudang,</p>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( ..................................... )</p>
            </div>
            <div>
              <p className="text-slate-500 mb-14">Koordinator PIC Stan,</p>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">
                ( {event.pic_nama || event.penanggung_jawab} )
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-14">Penerima / Security Venue,</p>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( ..................................... )</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
