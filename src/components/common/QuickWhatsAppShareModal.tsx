import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  FileText,
  User,
  Clock,
  Send,
  Eye,
  Edit3
} from 'lucide-react';
import {
  formatIndonesianPhone,
  isValidWhatsAppNumber,
  buildWhatsAppLink
} from '../../utils/whatsappTemplates';
import { playPleasantSuccessChime, playPleasantClickSound } from '../../utils/soundEffects';

export interface WhatsAppPresetTemplate {
  id: string;
  label: string;
  text: string;
  badge?: string;
}

export interface QuickWhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeCategory?: 'Invoice' | 'Logistik' | 'Donasi' | 'Deadline' | 'Umum';
  recipientName: string;
  initialPhone?: string;
  defaultMessage: string;
  presetTemplates?: WhatsAppPresetTemplate[];
  onSentLog?: (data: { recipient: string; phone: string; message: string }) => void;
}

export const QuickWhatsAppShareModal: React.FC<QuickWhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeCategory = 'Umum',
  recipientName: initialRecipient,
  initialPhone = '',
  defaultMessage,
  presetTemplates = [],
  onSentLog
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState(defaultMessage);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    presetTemplates[0]?.id || ''
  );
  const [viewTab, setViewTab] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRecipient(initialRecipient);
      setPhone(initialPhone);
      setMessage(defaultMessage);
      if (presetTemplates.length > 0) {
        setSelectedTemplateId(presetTemplates[0].id);
      }
      setCopied(false);
      setViewTab('edit');
    }
  }, [isOpen, initialRecipient, initialPhone, defaultMessage, presetTemplates]);

  const formattedPhone = useMemo(() => formatIndonesianPhone(phone), [phone]);
  const isPhoneValid = useMemo(() => isValidWhatsAppNumber(phone), [phone]);

  const handleSelectTemplate = (template: WhatsAppPresetTemplate) => {
    setSelectedTemplateId(template.id);
    setMessage(template.text);
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      playPleasantSuccessChime();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }

    const url = buildWhatsAppLink(phone, message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    if (onSentLog) {
      onSentLog({
        recipient,
        phone: formattedPhone,
        message
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {badgeCategory}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold truncate">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-xs text-emerald-100/90 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Recipient & Phone Number Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Penerima:</span>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="Nama Pembeli / PIC / Donatur"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nomor WhatsApp:</span>
                </label>
                {phone && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isPhoneValid
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isPhoneValid ? '✓ Valid' : 'Format 08... / 62...'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {phone && isPhoneValid && (
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Format wa.me: +{formattedPhone}
                </p>
              )}
            </div>
          </div>

          {/* Preset Templates Pills (if available) */}
          {presetTemplates.length > 0 && (
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Pola / Template Pesan:</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {presetTemplates.map(tmpl => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{tmpl.label}</span>
                      {tmpl.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Editor Header: View Tabs & Character Count */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewTab('edit')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  viewTab === 'edit'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Teks</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('preview')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  viewTab === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Pratinjau Balon WA</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              {message.length} karakter • {message.split(/\s+/).filter(Boolean).length} kata
            </div>
          </div>

          {/* Tab 1: Edit Textarea */}
          {viewTab === 'edit' && (
            <div className="space-y-1.5">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={10}
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-sans leading-relaxed focus:ring-2 focus:ring-emerald-500 resize-y shadow-inner"
                placeholder="Ketik isi pesan WhatsApp di sini..."
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Tips format WA: *tebal*, _miring_, ~coret~</span>
                <span className="italic">Dapat diedit bebas sebelum dikirim</span>
              </div>
            </div>
          )}

          {/* Tab 2: WhatsApp Chat Bubble Simulation Preview */}
          {viewTab === 'preview' && (
            <div className="bg-[#EFEAE2] dark:bg-slate-950 p-4 rounded-xl border border-slate-300 dark:border-slate-800 relative overflow-hidden min-h-[220px]">
              <div className="max-w-[92%] sm:max-w-[85%] ml-auto bg-[#E7FFDB] dark:bg-emerald-950 text-slate-900 dark:text-emerald-100 p-3 rounded-2xl rounded-tr-xs shadow-sm text-xs leading-relaxed border border-emerald-200/50 dark:border-emerald-800/40 whitespace-pre-wrap font-sans">
                {message}
                <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-500 dark:text-emerald-400 mt-1">
                  <span>
                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            {/* Copy Message Button */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Salin isi pesan ke clipboard"
            >
              {copied ? <Check className="w-4 h-4 animate-bounce" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Batal
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Open WhatsApp Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!message.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              title={
                phone
                  ? `Buka WhatsApp ke ${recipient || 'Penerima'} (+${formattedPhone})`
                  : 'Buka WhatsApp Web / App'
              }
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
