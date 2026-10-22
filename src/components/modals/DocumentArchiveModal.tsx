import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Upload,
  Download,
  Eye,
  Trash2,
  FileText,
  FileUp,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Building2,
  Layers,
  HardDrive,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Paperclip,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentAttachment, AttachmentCategory, DivisionId } from '../../types';
import {
  formatFileSize,
  getCategoryBadge,
  downloadAttachment,
  readFileAsDataUrl
} from '../../utils/attachmentHelper';
import { AttachmentViewerModal } from '../common/AttachmentViewerModal';

const CATEGORIES: AttachmentCategory[] = [
  'Bukti Transaksi & Nota',
  'Draft Naskah & Editorial',
  'Surat Jalan & Logistik',
  'Notulensi & Berita Acara',
  'Kontrak & MoU',
  'Dokumen Tugas & TOR',
  'Lainnya'
];

const DIVISION_NAMES: Record<DivisionId, string> = {
  1: 'Direktorat & SDM',
  2: 'Finance & Bendahara',
  3: 'Penerbitan & Editorial',
  4: 'Marketing & Sales',
  5: 'Produksi Percetakan',
  6: 'Logistik & Gudang'
};

export const DocumentArchiveModal: React.FC = () => {
  const {
    attachments,
    addAttachment,
    deleteAttachment,
    isDocumentArchiveOpen,
    setIsDocumentArchiveOpen,
    activeArchiveCategoryFilter,
    activeArchiveDivisionFilter,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(activeArchiveCategoryFilter || 'all');
  const [selectedDivision, setSelectedDivision] = useState<string>(
    activeArchiveDivisionFilter ? String(activeArchiveDivisionFilter) : 'all'
  );
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Preview & Delete Confirmation
  const [previewAttachment, setPreviewAttachment] = useState<DocumentAttachment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload Form Drawer / Toggle
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDataUrl, setUploadDataUrl] = useState<string>('');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<AttachmentCategory>('Bukti Transaksi & Nota');
  const [docDivisionId, setDocDivisionId] = useState<DivisionId>(currentUser.divisi_id || 2);
  const [docReference, setDocReference] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter attachments
  const filteredAttachments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return attachments.filter(att => {
      // Category filter
      if (selectedCategory !== 'all' && att.category !== selectedCategory) {
        return false;
      }
      // Division filter
      if (selectedDivision !== 'all' && String(att.divisionId) !== selectedDivision) {
        return false;
      }
      // Search query
      if (q) {
        const matchName = att.name.toLowerCase().includes(q);
        const matchRef = att.referenceNumber?.toLowerCase().includes(q);
        const matchDesc = att.description?.toLowerCase().includes(q);
        const matchUploader = att.uploadedBy.toLowerCase().includes(q);
        const matchTags = att.tags?.some(t => t.toLowerCase().includes(q));
        return matchName || matchRef || matchDesc || matchUploader || matchTags;
      }
      return true;
    });
  }, [attachments, searchQuery, selectedCategory, selectedDivision]);

  // Overall Statistics
  const totalBytes = useMemo(() => {
    return attachments.reduce((acc, a) => acc + (a.size || 0), 0);
  }, [attachments]);

  const handleSelectFile = async (file: File) => {
    setUploadFile(file);
    if (!docName) {
      setDocName(file.name);
    }
    try {
      const res = await readFileAsDataUrl(file);
      setUploadDataUrl(res.dataUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleSelectFile(e.dataTransfer.files[0]);
      setShowUploadForm(true);
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsSubmitting(true);
    try {
      addAttachment({
        name: docName.trim(),
        size: uploadFile ? uploadFile.size : 150000,
        type: uploadFile ? uploadFile.type : 'application/pdf',
        category: docCategory,
        divisionId: Number(docDivisionId) as DivisionId,
        uploadedBy: currentUser.name,
        referenceNumber: docReference.trim() || undefined,
        description: docDescription.trim() || undefined,
        fileData: uploadDataUrl || undefined,
        tags: [docCategory.split(' ')[0]]
      });

      // Reset form
      setUploadFile(null);
      setUploadDataUrl('');
      setDocName('');
      setDocReference('');
      setDocDescription('');
      setShowUploadForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    deleteAttachment(id);
    setDeletingId(null);
  };

  if (!isDocumentArchiveOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-6xl h-[92vh] max-h-[900px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Pusat Arsip Dokumen &amp; Lampiran Bukti
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                  {attachments.length} Dokumen
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manajemen digital nota keuangan, draft naskah editorial, surat jalan logistik, dan arsip yayasan.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowUploadForm(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                showUploadForm
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{showUploadForm ? 'Tutup Formulir' : 'Unggah Dokumen Baru'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDocumentArchiveOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berkas, nomor nota/ref, keterangan, atau pengunggah..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Division Filter */}
            <select
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Divisi (All)</option>
              <option value="1">Direktorat &amp; SDM</option>
              <option value="2">Finance &amp; Bendahara</option>
              <option value="3">Penerbitan &amp; Editorial</option>
              <option value="4">Marketing &amp; Sales</option>
              <option value="5">Produksi Percetakan</option>
              <option value="6">Logistik &amp; Gudang</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Tampilan Grid Visual"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Tampilan Daftar Ringkas"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Zero-Pill discipline: segmented tabs with unboxed counts) */}
        <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center overflow-x-auto gap-1.5 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span>Semua Dokumen</span>
            <span className="opacity-80 text-[10px] font-mono">({attachments.length})</span>
          </button>
          {CATEGORIES.map(cat => {
            const count = attachments.filter(a => a.category === cat).length;
            const isAct = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  isAct
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span className="opacity-80 text-[10px] font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Upload Drawer / Collapse Form */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-slate-200 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden shrink-0"
            >
              <form onSubmit={handleSubmitUpload} className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/60">
                  <div className="flex items-center space-x-2">
                    <FileUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Unggah &amp; Arsipkan Dokumen Baru
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-100/50 dark:bg-indigo-900/40'
                      : 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 bg-white dark:bg-slate-800/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    {uploadFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-white">{uploadFile.name}</span>
                        <span className="text-slate-500"> ({formatFileSize(uploadFile.size)})</span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          ✓ Berkas siap diunggah. Klik untuk mengganti.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Tarik berkas ke sini, atau <span className="text-indigo-600 dark:text-indigo-400 underline">klik untuk memilih dari komputer</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Mendukung gambar (PNG, JPG, WebP), dokumen PDF, DOCX, dan teks (Maks. 25 MB).
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Meta Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      placeholder="e.g. Bukti Transfer Royalti Juli 2026"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori Dokumen
                    </label>
                    <select
                      value={docCategory}
                      onChange={e => setDocCategory(e.target.value as AttachmentCategory)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Divisi Terkait
                    </label>
                    <select
                      value={docDivisionId}
                      onChange={e => setDocDivisionId(Number(e.target.value) as DivisionId)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <option value="1">Direktorat &amp; SDM</option>
                      <option value="2">Finance &amp; Bendahara</option>
                      <option value="3">Penerbitan &amp; Editorial</option>
                      <option value="4">Marketing &amp; Sales</option>
                      <option value="5">Produksi Percetakan</option>
                      <option value="6">Logistik &amp; Gudang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor Referensi / Nota
                    </label>
                    <input
                      type="text"
                      value={docReference}
                      onChange={e => setDocReference(e.target.value)}
                      placeholder="e.g. NOTA-2026-088 / TRF-BCA"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan &amp; Catatan Dokumen
                  </label>
                  <input
                    type="text"
                    value={docDescription}
                    onChange={e => setDocDescription(e.target.value)}
                    placeholder="Rincian keterangan transaksi atau petunjuk isi dokumen..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !docName.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
                  >
                    {isSubmitting ? 'Mengarsipkan...' : 'Simpan ke Arsip Digital'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body: Document Cards */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {filteredAttachments.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Tidak Ada Dokumen yang Cocok
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all' || selectedDivision !== 'all'
                  ? 'Coba bersihkan kata kunci pencarian atau ganti filter kategori/divisi.'
                  : 'Belum ada dokumen yang diarsipkan di sistem.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {(searchQuery || selectedCategory !== 'all' || selectedDivision !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedDivision('all');
                    }}
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUploadForm(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  + Unggah Dokumen Baru
                </button>
              </div>
            </div>
          ) : layoutMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAttachments.map(att => {
                const badge = getCategoryBadge(att.category);
                const isImg = att.type.startsWith('image/') || att.fileData?.startsWith('data:image/');

                return (
                  <div
                    key={att.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Document Preview Thumbnail Box */}
                      <div
                        onClick={() => setPreviewAttachment(att)}
                        className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-3 flex items-center justify-center cursor-pointer border border-slate-200/60 dark:border-slate-700/60 relative group/thumb"
                      >
                        {att.fileData && isImg ? (
                          <img
                            src={att.fileData}
                            alt={att.name}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2 p-3 text-center">
                            <FileText className="w-10 h-10 text-indigo-500/80 group-hover/thumb:scale-110 transition-transform" />
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                              {att.name.split('.').pop() || 'DOC'}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>Pratinjau</span>
                        </div>
                      </div>

                      {/* Header with Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border} truncate`}>
                            {att.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatFileSize(att.size)}
                          </span>
                        </div>

                        <h4
                          onClick={() => setPreviewAttachment(att)}
                          className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer pt-1"
                          title={att.name}
                        >
                          {att.name}
                        </h4>

                        {/* Unboxed metadata with typographic separators (anti-slop rule) */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span>{DIVISION_NAMES[att.divisionId] || `Divisi ${att.divisionId}`}</span>
                          <span aria-hidden="true">·</span>
                          <span>{att.uploadedAt.split(' ')[0]}</span>
                        </div>

                        {att.referenceNumber && (
                          <p className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 truncate mt-1">
                            Ref: {att.referenceNumber}
                          </p>
                        )}

                        {att.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
                            {att.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        👤 {att.uploadedBy}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadAttachment(att)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Unduh Dokumen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(att.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Hapus dari Arsip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {filteredAttachments.map(att => {
                const badge = getCategoryBadge(att.category);

                return (
                  <div
                    key={att.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        onClick={() => setPreviewAttachment(att)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer shrink-0 mt-0.5"
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4
                            onClick={() => setPreviewAttachment(att)}
                            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate"
                          >
                            {att.name}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {att.category}
                          </span>
                        </div>

                        {/* Unboxed Metadata Line */}
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span>{DIVISION_NAMES[att.divisionId]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatFileSize(att.size)}</span>
                          <span aria-hidden="true">·</span>
                          <span>Diunggah {att.uploadedAt} oleh {att.uploadedBy}</span>
                          {att.referenceNumber && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">Ref: {att.referenceNumber}</span>
                            </>
                          )}
                        </div>

                        {att.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {att.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setPreviewAttachment(att)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAttachment(att)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="Unduh Berkas"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(att.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Total: <strong className="text-slate-800 dark:text-slate-200">{filteredAttachments.length}</strong> dokumen aktif</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kapasitas Digunakan: <strong className="text-slate-800 dark:text-slate-200">{formatFileSize(totalBytes)}</strong></span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Seluruh berkas terenkripsi &amp; tersimpan secara lokal dan otomatis tercakup dalam ekspor cadangan (.JSON).
          </p>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Hapus Berkas dari Arsip?</h4>
            </div>
            <p className="text-xs text-slate-500">
              Dokumen ini akan dihapus secara permanen dari sistem arsip digital MIS. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Interactive Preview Modal */}
      <AttachmentViewerModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
