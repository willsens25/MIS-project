import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BackupData, RestoreSummary } from '../../types';
import { DatabaseSeederTab } from './DatabaseSeederTab';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Shield,
  Layers,
  Sparkles,
  X,
  FileText,
  Clock,
  UserCheck,
  Calendar,
  HardDrive
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'backup' | 'restore' | 'seeder';
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'backup'
}) => {
  const {
    exportBackupData,
    importBackupData,
    books,
    orders,
    mutasis,
    identitasList,
    accounts,
    pengajuans,
    productionLogs,
    logisticLogs,
    promos,
    bazaarEvents,
    activityLogs,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'seeder'>(initialTab);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [backupNote, setBackupNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Restore States
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    summary?: RestoreSummary;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const totalActiveItems =
    books.length +
    orders.length +
    mutasis.length +
    identitasList.length +
    accounts.length +
    pengajuans.length +
    productionLogs.length +
    logisticLogs.length +
    promos.length +
    bazaarEvents.length;

  const handleDownloadBackup = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);

    try {
      const backupData = exportBackupData(backupNote.trim() || undefined);
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `backup-mis-lamrimnesia-${dateStr}-${timeStr}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);

      setExportSuccessMessage(`Cadangan database berhasil diunduh (${filename})!`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error('Export error:', err);
      setExportSuccessMessage('Gagal mengunduh file cadangan.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setParseError(null);
    setRestoreResult(null);

    if (!file) {
      setSelectedFile(null);
      setParsedBackup(null);
      return;
    }

    if (!file.name.endsWith('.json')) {
      setParseError('Format file tidak didukung! Mohon unggah berkas berekstensi .json cadangan MIS.');
      setSelectedFile(null);
      setParsedBackup(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text) as BackupData;

        if (!json.data || typeof json.data !== 'object') {
          throw new Error('Struktur berkas JSON tidak memiliki properti data yang valid.');
        }

        setParsedBackup(json);
      } catch (err: unknown) {
        console.error('Parse error:', err);
        setParseError('File JSON korup atau bukan file cadangan resmi MIS Lamrimnesia.');
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!parsedBackup) return;

    const confirmText =
      restoreMode === 'replace'
        ? 'Apakah Anda yakin ingin menimpa seluruh database saat ini dengan data cadangan ini? Tindakan ini akan menggantikan seluruh data buku, pesanan, keuangan, dan anggota saat ini.'
        : 'Apakah Anda yakin ingin menggabungkan data cadangan ini dengan data yang ada saat ini?';

    if (!window.confirm(confirmText)) {
      return;
    }

    setIsRestoring(true);
    setRestoreResult(null);

    setTimeout(() => {
      const result = importBackupData(parsedBackup, restoreMode);
      setRestoreResult(result);
      setIsRestoring(false);
    }, 400);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Pusat Cadangan & Pemulihan Database
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                  Snapshot JSON
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Amankan data 6 divisi yayasan secara offline atau pulihkan data saat berpindah perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Ekspor (*Backup*)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'restore'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pulihkan (*Restore*)</span>
          </button>
          <button
            type="button"
            id="tab-btn-seeder"
            onClick={() => setActiveTab('seeder')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'seeder'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Data Dummy (*Seeder*)</span>
          </button>
        </div>

        {/* TAB CONTENT 1: BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Info Summary Grid */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  <span>Kondisi Database Aktif Saat Ini</span>
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {totalActiveItems} Total Data Tersimpan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-medium">Buku & Katalog</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{books.length} judul</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-medium">Pesanan & POS</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{orders.length} order</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-medium">Mutasi Keuangan</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{mutasis.length} transaksi</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-medium">Anggota / Identitas</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{identitasList.length} orang</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Operator: {currentUser?.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                </span>
              </div>
            </div>

            {/* Catatan Cadangan Optional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan Cadangan (*Opsional*)</span>
              </label>
              <input
                type="text"
                value={backupNote}
                onChange={(e) => setBackupNote(e.target.value)}
                placeholder="Contoh: Cadangan tutup buku akhir bulan / Sebelum update katalog besar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400">
                Catatan ini akan tersimpan ke dalam metadata file cadangan untuk riwayat audit.
              </p>
            </div>

            {/* Download CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-download-full-backup"
                onClick={handleDownloadBackup}
                disabled={isExporting}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Membuat Arsip JSON...' : 'Unduh Berkas Cadangan (.JSON)'}</span>
              </button>
            </div>

            {exportSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{exportSuccessMessage}</span>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: RESTORE */}
        {activeTab === 'restore' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">Perhatian Penting Sebelum Memulihkan Data</p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Pastikan berkas cadangan berasal dari sistem resmi MIS Yayasan Lamrimnesia. Gunakan mode <strong>Timpa Penuh</strong> untuk mengembalikan sistem ke kondisi persis saat dicadangkan, atau mode <strong>Gabung Data</strong> untuk menambahkan entri tanpa menghapus data baru.
                </p>
              </div>
            </div>

            {/* Mode Pemulihan Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Pilih Mode Pemulihan (*Restore Strategy*)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    restoreMode === 'replace'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === 'replace'}
                      onChange={() => setRestoreMode('replace')}
                      className="text-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Timpa Penuh (*Replace*)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    Menghapus data saat ini dan menggantikannya seluruhnya dengan isi cadangan.
                  </p>
                </div>

                <div
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    restoreMode === 'merge'
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === 'merge'}
                      onChange={() => setRestoreMode('merge')}
                      className="text-teal-600"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Gabung Data (*Merge*)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    Menyatukan data cadangan ke data saat ini (mencegah ID ganda / duplikasi).
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/60 dark:bg-slate-800/30 group"
              >
                <FileJson className="w-8 h-8 mx-auto text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih berkas cadangan (.JSON)'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ukuran maksimal berkas ~25MB
                </p>
              </div>
            </div>

            {parseError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed Preview */}
            {parsedBackup && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Berkas Cadangan Valid Terdeteksi</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {parsedBackup.metadata?.exported_at
                      ? new Date(parsedBackup.metadata.exported_at).toLocaleString('id-ID')
                      : 'Waktu Tidak Tercatat'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Katalog Buku</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {parsedBackup.data?.books?.length || 0} judul
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Pesanan Masuk</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {parsedBackup.data?.orders?.length || 0} order
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Mutasi Keuangan</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {parsedBackup.data?.mutasis?.length || 0} mutasi
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Anggota Yayasan</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {parsedBackup.data?.identitasList?.length || 0} orang
                    </span>
                  </div>
                </div>

                {parsedBackup.metadata?.system_note && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1">
                    "{parsedBackup.metadata.system_note}"
                  </p>
                )}
              </div>
            )}

            {/* Execute Button */}
            {parsedBackup && (
              <button
                type="button"
                id="btn-confirm-restore"
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                <span>
                  {isRestoring
                    ? 'Sedang Memulihkan Database...'
                    : `Eksekusi Pemulihan Database (${restoreMode === 'replace' ? 'Timpa Penuh' : 'Gabung Data'})`}
                </span>
              </button>
            )}

            {restoreResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  restoreResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {restoreResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  )}
                  <span>{restoreResult.message}</span>
                </div>

                {restoreResult.summary && (
                  <div className="text-[11px] opacity-90 pl-7 space-y-0.5">
                    <p>• {restoreResult.summary.booksRestored} judul buku tersimpan</p>
                    <p>• {restoreResult.summary.ordersRestored} transaksi pesanan siap dikelola</p>
                    <p>• {restoreResult.summary.mutasisRestored} mutasi kas & bank diperbarui</p>
                    <p>• {restoreResult.summary.identitasRestored} data anggota & donatur tersedia</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* TAB CONTENT 3: SEEDER */}
        {activeTab === 'seeder' && <DatabaseSeederTab />}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Format Data: JSON Standar ISO 8601</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
