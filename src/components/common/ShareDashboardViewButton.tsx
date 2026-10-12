import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Check,
  Copy,
  Link2,
  X,
  Sparkles,
  QrCode,
  Download,
  Smartphone,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';

interface ShareDashboardViewButtonProps {
  id?: string;
  divisionId?: DivisionId;
  subTab?: string;
  presetId?: string | null;
  label?: string;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
  showQrTriggerButton?: boolean;
}

const DIVISION_CODES: Record<DivisionId, { code: string; name: string }> = {
  1: { code: 'DIR', name: 'Direktorat & Sekretariat' },
  2: { code: 'KEU', name: 'Keuangan & Finansial' },
  3: { code: 'PEN', name: 'Penerbitan' },
  4: { code: 'MKT', name: 'Marketing & Penjualan' },
  5: { code: 'PRD', name: 'Produksi & Percetakan' },
  6: { code: 'LOG', name: 'Logistik & Distribusi' }
};

export const buildDashboardDeepLinkUrl = (
  divisionId: DivisionId,
  subTab: string,
  presetId?: string | null
): string => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const divCode = DIVISION_CODES[divisionId]?.code.toLowerCase() || String(divisionId);
  url.searchParams.set('divisi', String(divisionId));
  url.searchParams.set('kode', divCode);
  url.searchParams.set('tab', subTab || 'overview');
  if (presetId) {
    url.searchParams.set('preset', presetId);
  } else {
    url.searchParams.delete('preset');
  }
  return url.toString();
};

export const ShareDashboardViewButton: React.FC<ShareDashboardViewButtonProps> = ({
  id = 'btn-share-dashboard-view',
  divisionId,
  subTab,
  presetId,
  label = 'Share',
  variant = 'default',
  className = '',
  showQrTriggerButton = true
}) => {
  const { currentUser, currentSubTab, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [qrColorTheme, setQrColorTheme] = useState<'slate' | 'teal' | 'indigo'>('slate');
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCanvasWrapperRef = useRef<HTMLDivElement>(null);

  const activeDivId: DivisionId = divisionId || currentUser.divisi_id;
  const activeTab: string = subTab || currentSubTab || 'overview';
  const divMeta = DIVISION_CODES[activeDivId] || { code: 'DIR', name: 'Direktorat' };

  const shareUrl = buildDashboardDeepLinkUrl(activeDivId, activeTab, presetId);

  const qrFgColorMap: Record<'slate' | 'teal' | 'indigo', string> = {
    slate: '#0f172a',
    teal: '#0f766e',
    indigo: '#312e81'
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQrModalOpen) {
        setIsQrModalOpen(false);
      }
    };
    if (isQrModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQrModalOpen]);

  const copyUrlToClipboard = async (urlToCopy: string) => {
    try {
      window.history.replaceState({}, '', urlToCopy);
    } catch {
      // ignore if restricted in iframe
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = urlToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch {
        // ignore
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCopyDeepLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const urlToCopy = buildDashboardDeepLinkUrl(activeDivId, activeTab, presetId);
    await copyUrlToClipboard(urlToCopy);

    setCopied(true);
    setIsOpen(true);
    showToast({
      title: `🔗 Tautan Deep-Link Disalin! (${divMeta.code} • ${activeTab})`,
      message: `URL tampilan ${divMeta.name} (Tab: ${activeTab}) siap dibagikan ke rekan tim.`,
      type: 'success',
      category: 'system',
      duration: 4500
    });

    setTimeout(() => {
      setCopied(false);
    }, 2800);
  };

  const handleOpenQrModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentUrl = buildDashboardDeepLinkUrl(activeDivId, activeTab, presetId);
    try {
      window.history.replaceState({}, '', currentUrl);
    } catch {
      // ignore
    }
    setIsOpen(false);
    setIsQrModalOpen(true);
  };

  const handleCopyFromQrModal = async () => {
    const urlToCopy = buildDashboardDeepLinkUrl(activeDivId, activeTab, presetId);
    await copyUrlToClipboard(urlToCopy);
    setQrCopied(true);
    showToast({
      title: `🔗 URL QR Code Disalin! (${divMeta.code} • ${activeTab})`,
      message: `Tautan deep-link berhasil disalin ke papan klip.`,
      type: 'success',
      category: 'system',
      duration: 3800
    });
    setTimeout(() => setQrCopied(false), 2600);
  };

  const handleDownloadQrPng = () => {
    const canvas = qrCanvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-Dashboard-${divMeta.code}-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast({
        title: `📥 QR Code Berhasil Diunduh!`,
        message: `File PNG QR Code untuk ${divMeta.name} (${activeTab}) telah disimpan.`,
        type: 'success',
        category: 'system',
        duration: 4000
      });
    } catch {
      // ignore
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1.5 print:hidden">
      {/* Share Deep-Link URL Button */}
      <button
        id={id}
        type="button"
        onClick={handleCopyDeepLink}
        title={`Bagikan tautan langsung (Deep-Link URL) ke ${divMeta.name} — Sub-Tab: ${activeTab}`}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
          copied
            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/30'
            : variant === 'primary'
            ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
            : variant === 'outline'
            ? 'bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
            : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/80'
        } ${className}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        <span>{copied ? 'Tautan Tersalin!' : label}</span>
      </button>

      {/* Dedicated Scannable QR Code Modal Button on the #printable-area Dashboard Card */}
      {showQrTriggerButton && (
        <button
          id={`${id}-qr-code`}
          type="button"
          onClick={handleOpenQrModal}
          title={`Tampilkan QR Code yang dapat dipindai (Scannable QR) untuk URL tampilan ${divMeta.name} (${activeTab})`}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Code</span>
        </button>
      )}

      {/* Popover for Quick Deep-Link Copy */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3.5 z-50 text-left space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Bagikan Tampilan Dashboard (Deep-Link)
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Mengarahkan langsung ke divisi & sub-tab aktif
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Context Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Divisi: [{divMeta.code}] {divMeta.name}
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
                Sub-Tab: {activeTab}
              </span>
              {presetId && (
                <span className="px-2 py-0.5 rounded-md font-bold bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  Preset: {presetId}
                </span>
              )}
            </div>

            {/* Deep-Link URL Box */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={e => e.target.select()}
                className="flex-1 bg-transparent text-[11px] font-mono text-slate-700 dark:text-slate-200 focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyDeepLink}
                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10.5px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Open Scannable QR Code Modal Action */}
            <button
              type="button"
              onClick={handleOpenQrModal}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Tampilkan QR Code Siap Pindai (Scannable)</span>
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" />
                <span>Otomatis membuka divisi & tab ini saat diakses</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ?divisi={activeDivId}&tab={activeTab}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scannable QR Code Modal rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isQrModalOpen && (
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs print:hidden"
                onClick={() => setIsQrModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 12 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="qr-share-modal-title"
                  className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
                >
                  {/* Modal Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 text-white flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3
                          id="qr-share-modal-title"
                          className="text-sm sm:text-base font-extrabold tracking-tight text-white"
                        >
                          QR Code Deep-Link Dashboard
                        </h3>
                        <p className="text-[11px] text-white/85">
                          Pindai dengan kamera ponsel atau tablet untuk membuka tampilan ini
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(false)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      aria-label="Tutup Modal QR Code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4">
                    {/* Active Division & Sub-Tab Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                      <span className="px-2.5 py-1 rounded-full font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        [{divMeta.code}] {divMeta.name}
                      </span>
                      <span className="px-2.5 py-1 rounded-full font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
                        Tab: {activeTab}
                      </span>
                      {presetId && (
                        <span className="px-2.5 py-1 rounded-full font-bold bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          Preset: {presetId}
                        </span>
                      )}
                    </div>

                    {/* High-Contrast Scannable QR Code Frame */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col items-center justify-center relative">
                        {/* Visible crisp SVG QR Code for instant scanning */}
                        <QRCodeSVG
                          value={shareUrl || 'https://lamrimnesia.org'}
                          size={216}
                          level="H"
                          marginSize={2}
                          fgColor={qrFgColorMap[qrColorTheme]}
                          bgColor="#ffffff"
                        />

                        {/* Hidden High-Res Canvas used for PNG Download */}
                        <div ref={qrCanvasWrapperRef} className="hidden" aria-hidden="true">
                          <QRCodeCanvas
                            value={shareUrl || 'https://lamrimnesia.org'}
                            size={512}
                            level="H"
                            marginSize={3}
                            fgColor={qrFgColorMap[qrColorTheme]}
                            bgColor="#ffffff"
                          />
                        </div>

                        <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-600">
                          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                          <span>Arahkan Kamera HP untuk Membuka Tampilan Ini</span>
                        </div>
                      </div>

                      {/* Color Contrast Selector for QR Code */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          <span>Warna QR:</span>
                        </span>
                        {(
                          [
                            { id: 'slate', label: 'Hitam Klasik', dot: 'bg-slate-900' },
                            { id: 'teal', label: 'Teal MIS', dot: 'bg-teal-700' },
                            { id: 'indigo', label: 'Indigo', dot: 'bg-indigo-900' }
                          ] as const
                        ).map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setQrColorTheme(opt.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                              qrColorTheme === opt.id
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generated Shareable URL Display & Copy */}
                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Tautan Deep-Link yang Dikodekan
                      </label>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          onFocus={e => e.target.select()}
                          className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-200 focus:outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopyFromQrModal}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                            qrCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          {qrCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{qrCopied ? 'Tersalin!' : 'Salin URL'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions: Download PNG & Close */}
                    <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Koreksi Error Tinggi (Level H)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadQrPng}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh PNG QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQrModalOpen(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
