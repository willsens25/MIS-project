import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BookOpen,
  Users,
  FileText,
  DollarSign,
  Info,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportBooksToExcel,
  exportMembersToExcel,
  exportOrdersToExcel,
  exportMutasisToExcel,
  downloadBookTemplateExcel,
  downloadMemberTemplateExcel,
  parseBookSpreadsheet,
  parseMemberSpreadsheet,
  ParsedBookRow,
  ParsedMemberRow,
  ExportFormat
} from '../../utils/excelUtils';
import { formatNumberWithDots } from '../../utils/currencyUtils';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'import' | 'export';
  initialDataType?: 'books' | 'members';
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'import',
  initialDataType = 'books'
}) => {
  const {
    books,
    identitasList,
    orders,
    mutasis,
    bulkImportBooks,
    bulkImportIdentitas
  } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [importDataType, setImportDataType] = useState<'books' | 'members'>(initialDataType);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');

  // File & Parsing States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update'>('skip');

  // Parsed results
  const [parsedBooks, setParsedBooks] = useState<ParsedBookRow[]>([]);
  const [parsedMembers, setParsedMembers] = useState<ParsedMemberRow[]>([]);

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    added: number;
    updated: number;
    skipped: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setImportSummary(null);

    try {
      if (importDataType === 'books') {
        const rows = await parseBookSpreadsheet(file);
        setParsedBooks(rows);
      } else {
        const rows = await parseMemberSpreadsheet(file);
        setParsedMembers(rows);
      }
    } catch (err: any) {
      console.error('Error parsing spreadsheet:', err);
      setParseError(`Gagal membaca file spreadsheet: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setParsedBooks([]);
    setParsedMembers([]);
    setParseError(null);
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    try {
      if (importDataType === 'books') {
        const validRows = parsedBooks.filter(r => r.isValid);
        const result = bulkImportBooks(validRows, duplicateMode);
        setImportSummary(result);
      } else {
        const validRows = parsedMembers.filter(r => r.isValid).map(r => ({
          nama_lengkap: r.nama_lengkap,
          panggilan: r.panggilan,
          nomor_hp_primary: r.nomor_hp_primary,
          email: r.email,
          nomor_identitas: r.nomor_identitas,
          jenis_identitas: r.jenis_identitas,
          kota: r.kota,
          alamat: r.alamat,
          jenis_umat: r.jenis_umat,
          bhante_lay: r.bhante_lay,
          pekerjaan: r.pekerjaan,
          status_keamanan: 'Normal' as const
        }));
        const result = bulkImportIdentitas(validRows, duplicateMode);
        setImportSummary(result);
      }
    } catch (err: any) {
      setParseError(`Gagal memproses impor: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pusat Impor & Ekspor Data Spreadsheet</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Excel & CSV
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Migrasi data massal, unduh template resmi, dan ekspor laporan ke format Microsoft Excel (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveTab('import');
              handleResetFile();
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📥 Impor Data Massal (Upload Excel / CSV)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('export');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>📤 Ekspor Data & Laporan Resmi</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: IMPOR DATA SPREADSHEET                            */}
        {/* ======================================================== */}
        {activeTab === 'import' && (
          <div className="space-y-5">
            {/* Step 1: Select Target Entity & Template */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  setImportDataType('books');
                  handleResetFile();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                  importDataType === 'books'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    1. Impor Katalog Buku & Stok Fisik
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Judul, penulis, ISBN, harga jual, HPP biaya pokok, dan stok awal gudang.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadBookTemplateExcel();
                    }}
                    className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template Excel Buku (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div
                onClick={() => {
                  setImportDataType('members');
                  handleResetFile();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                  importDataType === 'members'
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    2. Impor Master Anggota / Umat / Pelanggan
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Nama lengkap, nomor HP/WhatsApp, KTP, email, kota domisili, dan status umat.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMemberTemplateExcel();
                    }}
                    className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template Excel Anggota (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Area */}
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/60 dark:bg-slate-800/20 transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pilih File Spreadsheet Excel atau CSV
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung format <b>.xlsx</b>, <b>.xls</b>, atau <b>.csv</b> (Maksimal 5.000 baris per file)
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                  <span>Klik untuk browse atau seret file ke sini</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Header Card */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{selectedFile.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                        {importDataType === 'books'
                          ? `${parsedBooks.length} baris terdeteksi (${parsedBooks.filter(b => b.isValid).length} valid)`
                          : `${parsedMembers.length} baris terdeteksi (${parsedMembers.filter(m => m.isValid).length} valid)`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleResetFile}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
                  >
                    Ganti File
                  </button>
                </div>

                {/* Parsing Error */}
                {parseError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* Duplicate Resolution Strategy */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bila ditemukan data dengan ISBN / Nama / No. HP yang sudah ada di sistem:</span>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'skip'}
                        onChange={() => setDuplicateMode('skip')}
                      />
                      <span>Lewati (Skip)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'update'}
                        onChange={() => setDuplicateMode('update')}
                      />
                      <span>Perbarui Data (Update)</span>
                    </label>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        {importDataType === 'books' ? (
                          <tr>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Judul Buku</th>
                            <th className="py-2.5 px-3">Penulis</th>
                            <th className="py-2.5 px-3">ISBN</th>
                            <th className="py-2.5 px-3">Harga Jual</th>
                            <th className="py-2.5 px-3">HPP</th>
                            <th className="py-2.5 px-3">Stok Awal</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Nama Lengkap</th>
                            <th className="py-2.5 px-3">No. HP / WA</th>
                            <th className="py-2.5 px-3">Kota</th>
                            <th className="py-2.5 px-3">Status Umat</th>
                            <th className="py-2.5 px-3">Alamat</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importDataType === 'books' ? (
                          parsedBooks.map((b, i) => (
                            <tr key={i} className={b.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/40 dark:bg-rose-950/20'}>
                              <td className="py-2 px-3">
                                {b.isValid ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    ✓ Siap
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full" title={b.errorReason}>
                                    ✕ Error
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{b.judul}</td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{b.penulis}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{b.isbn || '-'}</td>
                              <td className="py-2 px-3 font-mono">Rp {formatNumberWithDots(b.harga_jual)}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">Rp {formatNumberWithDots(b.biaya_pokok)}</td>
                              <td className="py-2 px-3 font-bold">{b.stok_gudang} eks</td>
                            </tr>
                          ))
                        ) : (
                          parsedMembers.map((m, i) => (
                            <tr key={i} className={m.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/40 dark:bg-rose-950/20'}>
                              <td className="py-2 px-3">
                                {m.isValid ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    ✓ Siap
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full" title={m.errorReason}>
                                    ✕ Error
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{m.nama_lengkap}</td>
                              <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{m.nomor_hp_primary || '-'}</td>
                              <td className="py-2 px-3">{m.kota || '-'}</td>
                              <td className="py-2 px-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                  {m.bhante_lay === 'Bhante' ? 'Sangha' : m.jenis_umat}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">{m.alamat || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Import Result Summary Card */}
                {importSummary && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-1">
                    <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Proses Impor Berhasil Diselesaikan!</span>
                    </div>
                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                      • <b>{importSummary.added}</b> data baru berhasil ditambahkan<br />
                      • <b>{importSummary.updated}</b> data lama diperbarui<br />
                      • <b>{importSummary.skipped}</b> data dilewati
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || (importDataType === 'books' ? parsedBooks.filter(b => b.isValid).length === 0 : parsedMembers.filter(m => m.isValid).length === 0)}
                    onClick={handleExecuteImport}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isProcessing
                        ? 'Memproses Impor...'
                        : `Proses Impor (${importDataType === 'books' ? parsedBooks.filter(b => b.isValid).length : parsedMembers.filter(m => m.isValid).length} Data)`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: EKSPOR DATA MASSAL KE EXCEL / CSV                 */}
        {/* ======================================================== */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            {/* Format Selector */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Pilih Format File Unduhan:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('xlsx')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    exportFormat === 'xlsx'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  📊 Microsoft Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  📄 Comma-Separated (.csv)
                </button>
              </div>
            </div>

            {/* 4 Dataset Export Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dataset 1: Buku */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {books.length} Judul Buku
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Katalog Buku & Stok Gudang</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar seluruh judul, ISBN, harga jual, estimasi HPP biaya cetak, dan sisa stok fisik.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportBooksToExcel(books, exportFormat)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Katalog Buku ({exportFormat.toUpperCase()})</span>
                </button>
              </div>

              {/* Dataset 2: Anggota */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {identitasList.length} Anggota
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Database Anggota & Sahabat</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar anggota, relawan, sangha, nomor WhatsApp, kota, dan status tier keanggotaan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportMembersToExcel(identitasList, orders, exportFormat)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Data Anggota ({exportFormat.toUpperCase()})</span>
                </button>
              </div>

              {/* Dataset 3: Penjualan */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {orders.length} Transaksi
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Laporan Invoice & Penjualan</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rekap nomor invoice, tanggal, rincian buku terjual, pembeli, ekspedisi, dan omzet total.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportOrdersToExcel(orders, exportFormat)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Rekap Penjualan ({exportFormat.toUpperCase()})</span>
                </button>
              </div>

              {/* Dataset 4: Keuangan */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {mutasis.length} Catatan Kas
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Jurnal Mutasi Kas Keuangan</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catatan arus kas masuk dan kas keluar harian, akun rekening bank, dan pos kategori pengeluaran.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportMutasisToExcel(mutasis, exportFormat)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Jurnal Kas ({exportFormat.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
