import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Calendar,
  User,
  HardDrive,
  Tag,
  Building2,
  Printer
} from 'lucide-react';
import { DocumentAttachment } from '../../types';
import { formatFileSize, downloadAttachment, getCategoryBadge } from '../../utils/attachmentHelper';

interface AttachmentViewerModalProps {
  attachment: DocumentAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({
  attachment,
  isOpen,
  onClose,
  onDelete
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen || !attachment) return null;

  const isImage =
    attachment.type.startsWith('image/') ||
    attachment.name.match(/\.(png|jpe?g|webp|svg|gif)$/i) ||
    attachment.fileData?.startsWith('data:image/');

  const isPdf =
    attachment.type === 'application/pdf' ||
    attachment.name.toLowerCase().endsWith('.pdf');

  const badgeStyle = getCategoryBadge(attachment.category);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePrint = () => {
    if (!attachment.fileData) {
      window.print();
      return;
    }
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${attachment.name}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${attachment.fileData}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-5xl h-[90vh] max-h-[850px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {attachment.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {attachment.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Ref: {attachment.referenceNumber || 'Tidak ada referensi'} · {formatFileSize(attachment.size)} · Diunggah oleh {attachment.uploadedBy}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {isImage && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  title="Perkecil (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                  title="Kembalikan Skala (100%)"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  title="Perbesar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors ml-1"
                  title="Putar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => downloadAttachment(attachment)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              title="Unduh Berkas ke Komputer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Canvas / Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-100/70 dark:bg-slate-950/80 p-4 sm:p-6 flex items-center justify-center relative select-none">
          {attachment.fileData ? (
            isImage ? (
              <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
                <img
                  src={attachment.fileData}
                  alt={attachment.name}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <object
                  data={attachment.fileData}
                  type="application/pdf"
                  className="w-full h-[65vh] rounded-2xl border border-slate-300 dark:border-slate-700 bg-white shadow-md"
                >
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-4">
                    <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                    <h4 className="font-bold text-slate-900 dark:text-white">Dokumen PDF Siap Diunduh</h4>
                    <p className="text-xs text-slate-500">
                      Browser Anda tidak mendukung preview PDF langsung. Klik tombol di bawah untuk mengunduh atau membuka di tab baru.
                    </p>
                    <button
                      type="button"
                      onClick={() => downloadAttachment(attachment)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      Buka &amp; Unduh PDF
                    </button>
                  </div>
                </object>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md space-y-3 shadow-md">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">{attachment.name}</h4>
                <p className="text-xs text-slate-500">
                  Format berkas {attachment.type || 'Dokumen'}. Silakan unduh berkas untuk membukanya di aplikasi pendukung.
                </p>
                <button
                  type="button"
                  onClick={() => downloadAttachment(attachment)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas</span>
                </button>
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md space-y-3 shadow-md">
              <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white">{attachment.name}</h4>
              <p className="text-xs text-slate-500">
                Dokumen telah tersimpan di sistem arsip. Anda dapat mengunduh atau menyunting catatan terkait dokumen ini.
              </p>
              <button
                type="button"
                onClick={() => downloadAttachment(attachment)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Salinan Dokumen</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Metadata Inspector */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal: <strong className="text-slate-800 dark:text-slate-200">{attachment.uploadedAt}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Pengunggah: <strong className="text-slate-800 dark:text-slate-200">{attachment.uploadedBy}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Ukuran: <strong className="text-slate-800 dark:text-slate-200">{formatFileSize(attachment.size)}</strong></span>
            </span>
            {attachment.tags && attachment.tags.length > 0 && (
              <span className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Tag: {attachment.tags.join(', ')}</span>
              </span>
            )}
          </div>

          {attachment.description && (
            <p className="w-full text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <strong>Catatan:</strong> {attachment.description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
