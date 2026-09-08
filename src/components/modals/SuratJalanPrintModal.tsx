import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Penyaluran, LogisticLog } from '../../types';
import { Printer, X, Download, FileDown, Loader2 } from 'lucide-react';
import { printElement, downloadDocumentAsPdf, downloadDocumentAsHtml } from '../../utils/documentExport';

interface SuratJalanPrintModalProps {
  noInvoice: string;
  items: Penyaluran[];
  onClose: () => void;
}

export const SuratJalanPrintModal: React.FC<SuratJalanPrintModalProps> = ({ noInvoice, items, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  if (!items || items.length === 0) return null;

  const docTitle = `Surat Jalan Pengiriman #${noInvoice} - Yayasan Dharma Patriot`;
  const filenameBase = `Surat_Jalan_${noInvoice}`;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    await downloadDocumentAsPdf('printable-area', filenameBase);
    setIsGeneratingPdf(false);
  };

  const handlePrint = () => {
    printElement('printable-area', docTitle, filenameBase);
  };

  const handleDownloadHtml = () => {
    downloadDocumentAsHtml('printable-area', filenameBase, docTitle);
  };

  const recipientName = items[0]?.nama_agen || 'Agen Dharma';

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
          {/* Controls */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
            <div className="flex items-center space-x-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Surat Jalan Pengiriman #{noInvoice}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadHtml}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 transition-all"
                title="Unduh dokumen surat jalan (HTML)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTML</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
                title="Unduh langsung file PDF surat jalan ke perangkat Anda"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 transition-all"
                title="Buka dialog cetak browser atau printer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Cetak</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Area */}
          <div id="printable-area" className="p-8 sm:p-12 text-slate-800 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-5 gap-4">
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
                  <h1 className="text-xl font-extrabold text-slate-900 leading-tight">YAYASAN LAMRIMNESIA</h1>
                  <p className="text-xs font-semibold text-teal-800">Departemen Logistik & Gudang Distribusi</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Penerbitan & Pengiriman Buku Dharma Nusantara</p>
                  <p className="text-[11px] text-slate-500">Jl. Dharma Raya No. 108, Jakarta Barat | logistik@lamrimnesia.org</p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="text-xl font-black text-slate-900 tracking-wider">SURAT JALAN GUDANG</div>
                <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">NO: SJ-{noInvoice.replace('INV-', '')}</div>
                <div className="text-xs text-slate-500 mt-0.5">Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider">
                  Siap Kirim / Dispatched
                </span>
              </div>
            </div>

            <div className="my-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <p className="text-slate-500 font-bold uppercase text-[10px]">Tujuan Penerima / Agen:</p>
              <p className="text-sm font-bold text-slate-900">{recipientName}</p>
              <p className="text-slate-600 mt-1">Ref Invoice: <span className="font-semibold">{noInvoice}</span></p>
            </div>

            <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden mb-6">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="py-2.5 px-3 text-left w-8">No</th>
                  <th className="py-2.5 px-3 text-left">Judul Buku / Item Dikirim</th>
                  <th className="py-2.5 px-3 text-center">Jumlah (QTY)</th>
                  <th className="py-2.5 px-3 text-left">Kondisi / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{it.book?.judul || `Buku ID #${it.buku_id}`}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{it.qty} Eks / Pcs</td>
                    <td className="py-2 px-3 text-slate-600">Buku baru, kondisi segel plastik rapi</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-600">
              <div>
                <p>Bagian Gudang,</p>
                <div className="h-14"></div>
                <p className="font-semibold text-slate-800 underline">( Petugas Logistik )</p>
              </div>
              <div>
                <p>Kurir / Driver,</p>
                <div className="h-14"></div>
                <p className="font-semibold text-slate-800 underline">( Ekspedisi / Kurir )</p>
              </div>
              <div>
                <p>Penerima Barang,</p>
                <div className="h-14"></div>
                <p className="font-semibold text-slate-800 underline">({recipientName})</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
