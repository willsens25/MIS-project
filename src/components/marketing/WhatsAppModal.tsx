import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '../../types';
import {
  WHATSAPP_TEMPLATES,
  formatIndonesianPhone,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  replaceWhatsAppVariables,
  WhatsAppLogItem,
  YAYASAN_BANK_INFO
} from '../../utils/whatsappTemplates';
import {
  MessageSquare,
  X,
  Copy,
  ExternalLink,
  Check,
  Smartphone,
  CheckCheck,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  defaultPhone?: string;
  defaultRecipientName?: string;
  initialTemplateId?: string;
  onLogSent?: (log: WhatsAppLogItem) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  order,
  defaultPhone = '',
  defaultRecipientName = '',
  initialTemplateId,
  onLogSent
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || (order?.status === 'Pending' ? 'pengingat_ramah' : 'tagihan_pending')
  );
  const [customResi, setCustomResi] = useState('');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'edit'>('edit');

  // Initialize data when modal opens or order changes
  useEffect(() => {
    if (isOpen) {
      const initialName = order?.nama_pembeli || defaultRecipientName || '';
      const rawPhone = order?.kontak_pembeli || order?.kontak_penerima || defaultPhone || '';
      setRecipientName(initialName);
      setPhone(rawPhone);

      const templateToUse = initialTemplateId || (
        order?.status === 'Pending' ? 'pengingat_ramah' :
        order?.status === 'Lunas' ? 'lunas_packing' :
        order?.status === 'Dikirim' ? 'resi_pengiriman' :
        'tagihan_pending'
      );
      setSelectedTemplateId(templateToUse);

      const templateObj = WHATSAPP_TEMPLATES.find(t => t.id === templateToUse) || WHATSAPP_TEMPLATES[0];
      const generated = replaceWhatsAppVariables(templateObj.defaultText, {
        order,
        customPembeli: initialName,
        customPhone: rawPhone,
        customResi
      });
      setMessageText(generated);
    }
  }, [isOpen, order, defaultPhone, defaultRecipientName, initialTemplateId]);

  // Handle template selection change
  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = WHATSAPP_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      const generated = replaceWhatsAppVariables(tmpl.defaultText, {
        order,
        customPembeli: recipientName,
        customPhone: phone,
        customResi
      });
      setMessageText(generated);
    }
  };

  // Re-run variable replacement if custom resi changes
  const handleResiChange = (resi: string) => {
    setCustomResi(resi);
    const tmpl = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tmpl) {
      const generated = replaceWhatsAppVariables(tmpl.defaultText, {
        order,
        customPembeli: recipientName,
        customPhone: phone,
        customResi: resi
      });
      setMessageText(generated);
    }
  };

  const handleInsertTag = (tag: string) => {
    setMessageText(prev => prev + ' ' + tag);
  };

  const formattedPhone = formatIndonesianPhone(phone);
  const isPhoneValid = isValidWhatsAppNumber(phone);

  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (onLogSent) {
      onLogSent({
        id: 'walog_' + Date.now(),
        orderId: order?.id,
        invoiceNo: order?.no_invoice,
        pembeliName: recipientName || 'Pelanggan',
        phone: formattedPhone,
        templateId: selectedTemplateId,
        templateName: WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId)?.nama || 'Kustom',
        sentAt: new Date().toLocaleString('id-ID'),
        status: 'Tersalin ke Clipboard'
      });
    }
  };

  const handleOpenWhatsApp = () => {
    if (!isPhoneValid) return;
    const url = buildWhatsAppLink(phone, messageText);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (onLogSent) {
      onLogSent({
        id: 'walog_' + Date.now(),
        orderId: order?.id,
        invoiceNo: order?.no_invoice,
        pembeliName: recipientName || 'Pelanggan',
        phone: formattedPhone,
        templateId: selectedTemplateId,
        templateName: WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId)?.nama || 'Kustom',
        sentAt: new Date().toLocaleString('id-ID'),
        status: 'Terkirim (WA Link Terbuka)'
      });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 flex items-center justify-center p-3 sm:p-5"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 text-left animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white border-b border-emerald-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base">Kirim Notifikasi & Pengingat WhatsApp</h3>
                {order && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-200 border border-emerald-500/30">
                    #{order.no_invoice}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Otomatisasi pesan transaksi & CRM Lamrimnesia siap kirim ke WhatsApp Web/App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two columns on desktop */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Form & Template Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Recipient & Phone Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Informasi Penerima</span>
                {formattedPhone && (
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    Format WA: +{formattedPhone}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nama Penerima / Pembeli
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Contoh: Bpk. Budi Santoso"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789 atau 62812..."
                    className={`w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:ring-2 text-slate-800 dark:text-slate-100 ${
                      phone && !isPhoneValid
                        ? 'border-amber-400 focus:ring-amber-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
                    }`}
                  />
                  {phone && !isPhoneValid && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Nomor HP terlalu pendek atau format belum valid.
                    </p>
                  )}
                </div>
              </div>

              {/* Ekspedisi Resi Extra Field (if template is resi_pengiriman) */}
              {selectedTemplateId === 'resi_pengiriman' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nomor Resi Pengiriman (Opsional untuk disisipkan)
                  </label>
                  <input
                    type="text"
                    value={customResi}
                    onChange={e => handleResiChange(e.target.value)}
                    placeholder="Contoh: JP8291028472 / SOC-19283"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Template Pesan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WHATSAPP_TEMPLATES.map(tmpl => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-[11px] truncate flex items-center justify-between">
                        <span>{tmpl.nama}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tmpl.deskripsi}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Isi Pesan WhatsApp</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    ({messageText.length} karakter)
                  </span>
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Sisipkan Tag:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('*{nama_pembeli}*')}
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    +Nama
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag('*{no_invoice}*')}
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    +Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTag(`*${YAYASAN_BANK_INFO}*`)}
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    +Rek BCA
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Tulis atau sunting pesan WhatsApp Anda di sini..."
                className="w-full p-3 text-xs font-sans leading-relaxed bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 resize-none shadow-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tips: Gunakan tanda asterik *tebal* untuk teks tebal dan _miring_ untuk cetak miring di WhatsApp.
              </p>
            </div>
          </div>

          {/* Right Column: Smartphone Chat Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Simulasi Tampilan WhatsApp</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                Live Preview
              </span>
            </div>

            {/* Smartphone Mockup */}
            <div className="flex-1 bg-slate-900 rounded-3xl p-3 border-4 border-slate-800 shadow-xl flex flex-col overflow-hidden min-h-[360px] max-h-[480px]">
              {/* Phone Status bar */}
              <div className="flex justify-between items-center px-3 py-1 text-[10px] text-slate-400 border-b border-slate-800/80 mb-2">
                <span>09:41</span>
                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
                <span>4G 100%</span>
              </div>

              {/* WhatsApp App Header */}
              <div className="flex items-center space-x-2.5 px-3 py-2 bg-[#075E54] text-white rounded-t-xl shrink-0">
                <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-xs text-slate-900">
                  {recipientName ? recipientName.charAt(0).toUpperCase() : 'L'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate">
                    {recipientName || 'Nama Penerima'}
                  </div>
                  <div className="text-[10px] text-emerald-100/70 truncate">
                    {formattedPhone ? `+${formattedPhone}` : 'online'}
                  </div>
                </div>
              </div>

              {/* Chat Canvas (WhatsApp Background pattern feel) */}
              <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0b141a] p-3 overflow-y-auto space-y-2 rounded-b-xl relative text-slate-900 dark:text-slate-100">
                {/* Date bubble */}
                <div className="text-center my-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-[9px] text-slate-500 shadow-2xs">
                    HARI INI
                  </span>
                </div>

                {/* Sent Message Bubble (Outbound - green in WhatsApp) */}
                <div className="flex justify-end">
                  <div className="max-w-[92%] bg-[#D9FDD3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs whitespace-pre-wrap leading-relaxed relative break-words">
                    {messageText || (
                      <span className="italic text-slate-400">Pesan akan muncul di sini...</span>
                    )}

                    {/* Bubble timestamp & double check mark */}
                    <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-500 dark:text-emerald-200/80">
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-300 inline" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isPhoneValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Nomor terverifikasi: +{formattedPhone}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                Masukkan nomor HP yang valid untuk kirim langsung ke WhatsApp
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Salin teks pesan ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!isPhoneValid}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              title={isPhoneValid ? 'Buka WhatsApp Web atau Aplikasi' : 'Nomor telepon belum valid'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
