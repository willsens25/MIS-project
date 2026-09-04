import React from 'react';
import { createPortal } from 'react-dom';
import { Order } from '../../types';
import { Printer, X, Download } from 'lucide-react';

interface InvoicePrintModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalDiskon = order.items.reduce((sum, it) => sum + (it.potongan_diskon || 0), 0);
  const subtotalKotor = order.items.reduce((sum, it) => sum + (it.harga_satuan * it.jumlah), 0);

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="relative bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 text-left animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Controls (Not printed) */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
            <div className="flex items-center space-x-2">
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-sm">Cetak Invoice Resmi #{order.no_invoice}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div id="printable-area" className="p-8 sm:p-12 text-slate-800 bg-white">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-6 gap-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src="/img/logo-lamrimnesia.png"
                  alt="Logo Lamrimnesia"
                  className="h-14 sm:h-16 w-auto object-contain rounded-xl shadow-xs"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/logo-lamrimnesia.png')) {
                      target.src = '/logo-lamrimnesia.png';
                    }
                  }}
                />
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">YAYASAN LAMRIMNESIA</h1>
                  <p className="text-xs font-semibold text-teal-800">Penerbitan & Distribusi Buku Dharma Nusantara</p>
                  <p className="text-xs text-slate-500">Jl. Dharma Raya No. 108, Jakarta Barat | Telp: (021) 5678-9011</p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="text-2xl font-black text-indigo-700 tracking-wider">INVOICE</div>
                <div className="text-xs font-mono font-bold text-slate-800">{order.no_invoice}</div>
                <div className="text-xs text-slate-500 mt-1">Tanggal: {order.tanggal_pesan}</div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                  order.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Info Customer & Pengiriman */}
            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Tagihan Kepada:</span>
                <p className="font-bold text-sm text-slate-900">{order.nama_pembeli}</p>
                <p className="text-slate-600 mt-0.5">Via / Platform: <span className="font-semibold">{order.via}</span></p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Tujuan Pengiriman:</span>
                <p className="font-semibold text-slate-900">{order.nama_penerima || order.nama_pembeli}</p>
                <p className="text-slate-600 mt-0.5">{order.alamat_penerima}</p>
                <p className="text-slate-600 mt-0.5">Ekspedisi: <span className="font-semibold">{order.ekspedisi}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="py-2.5 px-3 text-left w-8">No</th>
                    <th className="py-2.5 px-3 text-left">Judul Buku / Item</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-center">QTY</th>
                    <th className="py-2.5 px-3 text-right">Diskon / Promo</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {it.book?.judul || `Buku #${it.buku_id}`}
                        {it.kode_promo_terpakai && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                            {it.kode_promo_terpakai}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">Rp {it.harga_satuan.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.jumlah}</td>
                      <td className="py-2 px-3 text-right text-rose-600">
                        {it.potongan_diskon ? `-Rp ${it.potongan_diskon.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        Rp {it.subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-between items-start pt-2">
              <div className="w-1/2 pr-4 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">Catatan / Rekening Pembayaran:</p>
                  <p className="mt-1">Bank BCA: 789-0123-456 (a/n Yayasan Lamrimnesia)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Harap sertakan nomor invoice pada berita transfer.</p>
                  {order.keterangan && (
                    <p className="mt-2 text-slate-700 italic border-t border-slate-200 pt-1">
                      "{order.keterangan}"
                    </p>
                  )}
                </div>
              </div>

              <div className="w-5/12 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Item:</span>
                  <span>Rp {subtotalKotor.toLocaleString('id-ID')}</span>
                </div>
                {totalDiskon > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Total Potongan Diskon:</span>
                    <span>-Rp {totalDiskon.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({order.ekspedisi}):</span>
                  <span>Rp {order.ongkir.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t-2 border-slate-800 pt-2 text-sm font-extrabold text-slate-900">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="text-indigo-700">Rp {order.total_tagihan.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Footer Signature */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-600">
              <div>
                <p>Penerima / Pembeli,</p>
                <div className="h-16"></div>
                <p className="font-semibold text-slate-800 underline">({order.nama_penerima || order.nama_pembeli})</p>
              </div>
              <div>
                <p>Bagian Marketing Lamrimnesia,</p>
                <div className="h-16"></div>
                <p className="font-semibold text-slate-800 underline">( Staff Penjualan & Distribusi )</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
