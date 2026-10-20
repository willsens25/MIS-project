import React, { useState, useRef } from 'react';
import { Paperclip, Plus, Eye, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentAttachment, AttachmentCategory, DivisionId } from '../../types';
import { formatFileSize, downloadAttachment, readFileAsDataUrl } from '../../utils/attachmentHelper';
import { AttachmentViewerModal } from './AttachmentViewerModal';

interface AttachmentListBadgeProps {
  relatedEntityType: 'mutasi' | 'pengajuan' | 'buku' | 'surat_jalan' | 'todo_task' | 'general';
  relatedEntityId: string | number;
  divisionId?: DivisionId;
  defaultCategory?: AttachmentCategory;
  defaultReference?: string;
  label?: string;
  compact?: boolean;
}

export const AttachmentListBadge: React.FC<AttachmentListBadgeProps> = ({
  relatedEntityType,
  relatedEntityId,
  divisionId = 2,
  defaultCategory = 'Bukti Transaksi & Nota',
  defaultReference,
  label,
  compact = false
}) => {
  const { getAttachmentsForEntity, addAttachment, currentUser } = useApp();
  const attachments = getAttachmentsForEntity(relatedEntityType, relatedEntityId);
  const [selectedAtt, setSelectedAtt] = useState<DocumentAttachment | null>(null);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const readResult = await readFileAsDataUrl(file);
      addAttachment({
        name: readResult.name,
        size: readResult.size,
        type: readResult.type,
        category: defaultCategory,
        divisionId,
        uploadedBy: currentUser.name,
        referenceNumber: defaultReference || `${relatedEntityType.toUpperCase()}-${relatedEntityId}`,
        relatedEntityType,
        relatedEntityId,
        fileData: readResult.dataUrl,
        description: `Lampiran untuk ${relatedEntityType} #${relatedEntityId}`
      });
      setIsOpenMenu(false);
    } catch (err) {
      console.error('Gagal membaca berkas:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative inline-block text-left">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (attachments.length === 1) {
            setSelectedAtt(attachments[0]);
          } else {
            setIsOpenMenu(prev => !prev);
          }
        }}
        className={`inline-flex items-center space-x-1.5 rounded-lg font-bold transition-all cursor-pointer ${
          attachments.length > 0
            ? 'px-2 py-1 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs shadow-2xs'
            : 'px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 border border-dashed border-slate-300 dark:border-slate-700 text-xs'
        }`}
        title={attachments.length > 0 ? `${attachments.length} Dokumen / Bukti terlampir` : 'Belum ada bukti transaksi terlampir. Klik untuk unggah.'}
      >
        <Paperclip className="w-3.5 h-3.5" />
        <span>
          {label || (attachments.length > 0 ? `${attachments.length} Dokumen` : 'Lampiran')}
        </span>
      </button>

      {/* Popover list if multiple or empty */}
      {isOpenMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpenMenu(false)}
          />
          <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 p-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
              <span>Lampiran Terkait ({attachments.length})</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Unggah Baru</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="py-3 px-2 text-center text-slate-400 space-y-1.5">
                <FileText className="w-6 h-6 mx-auto opacity-50" />
                <p className="text-[11px]">Belum ada berkas pendukung terlampir.</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold"
                >
                  + Unggah Bukti Sekarang
                </button>
              </div>
            ) : (
              <div className="max-h-48 overflow-auto space-y-1">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between gap-2 border border-slate-100 dark:border-slate-800"
                  >
                    <div
                      className="min-w-0 cursor-pointer flex-1"
                      onClick={() => {
                        setSelectedAtt(att);
                        setIsOpenMenu(false);
                      }}
                    >
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(att.size)} · {att.uploadedAt.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAtt(att);
                          setIsOpenMenu(false);
                        }}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg"
                        title="Lihat Pratinjau"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAttachment(att)}
                        className="p-1 text-slate-500 hover:text-emerald-600 rounded-lg"
                        title="Unduh Berkas"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Dedicated Interactive Preview Modal */}
      <AttachmentViewerModal
        attachment={selectedAtt}
        isOpen={!!selectedAtt}
        onClose={() => setSelectedAtt(null)}
      />
    </div>
  );
};
