import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Book, PengajuanCetak } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Layers,
  Check
} from 'lucide-react';
import { PenerbitanCharts } from '../charts/PenerbitanCharts';
import { ConfirmModal } from '../modals/ConfirmModal';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { DownloadPdfButton } from '../common/DownloadPdfButton';

export const PenerbitanDashboard: React.FC = () => {
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    bulkDeleteBooks,
    ajukanCetak,
    pengajuans,
    bulkDeletePengajuanCetak,
    approvePengajuanCetak,
    accounts,
    switchDivision,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const [searchBook, setSearchBook] = useState('');
  const activeSubTab = (['katalog', 'grafik', 'pengajuan'].includes(currentSubTab)
    ? currentSubTab
    : 'katalog') as 'katalog' | 'grafik' | 'pengajuan';
  const setActiveSubTab = (tab: 'katalog' | 'grafik' | 'pengajuan') => setCurrentSubTab(tab);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [selectedPengajuanIds, setSelectedPengajuanIds] = useState<number[]>([]);
  
  // Toast & ConfirmModal states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
    confirmText: 'Ya, Lanjutkan'
  });

  // Modals
  const [modalBookOpen, setModalBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({ judul: '', penulis: '', harga_jual: 0, stok_gudang: 0 });

  // Ajukan Cetak Modal
  const [modalAjukanOpen, setModalAjukanOpen] = useState(false);
  const [selectedBookForAjukan, setSelectedBookForAjukan] = useState<Book | null>(null);
  const [jumlahAjukan, setJumlahAjukan] = useState(100);

  const filteredBooks = books.filter(b => 
    b.judul.toLowerCase().includes(searchBook.toLowerCase()) ||
    b.penulis.toLowerCase().includes(searchBook.toLowerCase()) ||
    (b.kategori && b.kategori.toLowerCase().includes(searchBook.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBookIds(filteredBooks.map(b => b.id));
    } else {
      setSelectedBookIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedBookIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedBookIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Buku Terpilih',
      message: `Yakin ingin menghapus ${selectedBookIds.length} judul buku terpilih dari katalog naskah?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Buku',
      onConfirm: () => {
        bulkDeleteBooks(selectedBookIds);
        setSelectedBookIds([]);
        setToastMessage(`${selectedBookIds.length} judul buku berhasil dihapus dari katalog.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleSelectAllPengajuan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPengajuanIds(pengajuans.map(p => p.id));
    } else {
      setSelectedPengajuanIds([]);
    }
  };

  const handleToggleSelectPengajuan = (id: number) => {
    setSelectedPengajuanIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeletePengajuan = () => {
    if (selectedPengajuanIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Riwayat Pengajuan',
      message: `Yakin ingin menghapus ${selectedPengajuanIds.length} riwayat pengajuan cetak terpilih?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Pengajuan',
      onConfirm: () => {
        bulkDeletePengajuanCetak(selectedPengajuanIds);
        setSelectedPengajuanIds([]);
        setToastMessage(`${selectedPengajuanIds.length} pengajuan cetak berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.judul.trim() || !bookForm.penulis.trim() || bookForm.harga_jual <= 0) {
      alert('Judul, Penulis, dan Harga Jual wajib diisi dengan benar!');
      return;
    }
    if (editingBook) {
      updateBook(editingBook.id, bookForm.judul, bookForm.penulis, bookForm.harga_jual);
    } else {
      addBook(bookForm.judul, bookForm.penulis, bookForm.harga_jual, bookForm.stok_gudang);
    }
    setModalBookOpen(false);
  };

  const handleAjukanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForAjukan || jumlahAjukan <= 0) return;
    ajukanCetak(selectedBookForAjukan.id, jumlahAjukan);
    setModalAjukanOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintReportHeader
        divisionName="Penerbitan"
        divisionCode="PEN"
        subTabTitle={
          activeSubTab === 'katalog'
            ? 'Katalog Judul Buku & Valuasi'
            : activeSubTab === 'grafik'
            ? 'Grafik Stok & Analisis Valuasi'
            : 'Riwayat Pengajuan Anggaran Cetak'
        }
      />

      {/* Header Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Katalog Penerbitan & Manajemen Buku
          </h2>
          <p className="text-xs text-slate-500">Kelola judul buku dharma, penetapan harga jual, dan pengajuan cetak ke Finance.</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Print Current View Action Button */}
          <PrintCurrentViewButton
            id="btn-print-penerbitan"
            fallbackFilename={`Laporan_Penerbitan_${activeSubTab}`}
          />

          {/* Download Current Table View directly as PDF */}
          <DownloadPdfButton
            id="btn-download-pdf-penerbitan"
            filename={`Laporan_Penerbitan_${activeSubTab}`}
            tooltip="Unduh tampilan naskah & katalog buku langsung sebagai file PDF resmi berformat cetak"
          />

          <button
            onClick={() => {
              setEditingBook(null);
              setBookForm({ judul: '', penulis: '', harga_jual: 85000, stok_gudang: 0 });
              setModalBookOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Judul Buku</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="print:hidden flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('katalog')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'katalog'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Katalog Judul ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grafik')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'grafik'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Grafik Stok & Valuasi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pengajuan')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'pengajuan'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Riwayat Pengajuan Cetak ({pengajuans.length})</span>
        </button>
      </div>

      {/* GRAFIK VIEW */}
      {activeSubTab === 'grafik' && (
        <PenerbitanCharts books={books} pengajuans={pengajuans} />
      )}

      {/* KATALOG VIEW */}
      {activeSubTab === 'katalog' && (
        <>
          {/* Quick Metrics preview */}
          <PenerbitanCharts books={books} pengajuans={pengajuans} />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul buku, nama penulis, ISBN..."
              value={searchBook}
              onChange={e => setSearchBook(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {selectedBookIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Massal ({selectedBookIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedBookIds.length === filteredBooks.length && filteredBooks.length > 0}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5">Judul Buku & ISBN</th>
                <th className="p-3.5">Penulis / Guru</th>
                <th className="p-3.5 text-right">Harga Jual</th>
                <th className="p-3.5 text-center">Stok Gudang</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(book.id)}
                      onChange={() => handleToggleSelect(book.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{book.judul}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{book.isbn || 'ISBN: 978-602-...'}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{book.penulis}</td>
                  <td className="p-3.5 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                    Rp {book.harga_jual.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      book.stok_gudang === 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      book.stok_gudang < 20 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {book.stok_gudang} Eks
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBookForAjukan(book);
                        setJumlahAjukan(100);
                        setModalAjukanOpen(true);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold"
                      title="Ajukan Cetak Ulang"
                    >
                      <Send className="w-3 h-3 inline mr-1" />
                      Ajukan Cetak
                    </button>
                    <button
                      onClick={() => {
                        setEditingBook(book);
                        setBookForm({
                          judul: book.judul,
                          penulis: book.penulis,
                          harga_jual: book.harga_jual,
                          stok_gudang: book.stok_gudang
                        });
                        setModalBookOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmModalConfig({
                          isOpen: true,
                          title: 'Hapus Buku dari Katalog',
                          message: `Yakin ingin menghapus buku "${book.judul}" karya ${book.penulis}?`,
                          variant: 'danger',
                          confirmText: 'Ya, Hapus Buku',
                          onConfirm: () => {
                            deleteBook(book.id);
                            setToastMessage(`Buku "${book.judul}" berhasil dihapus.`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        });
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Riwayat Pengajuan Cetak */}
      {(activeSubTab === 'pengajuan' || activeSubTab === 'katalog') && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Printer className="w-4 h-4 text-indigo-500" />
              <span>Riwayat Status Pengajuan Cetak ke Bendahara</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pantau proses persetujuan dan pencairan dana cetak ulang buku serta terbitkan persetujuan cetak.</p>
          </div>
          {selectedPengajuanIds.length > 0 && (
            <button
              onClick={handleBulkDeletePengajuan}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Pengajuan Terpilih ({selectedPengajuanIds.length})</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAllPengajuan}
                    checked={selectedPengajuanIds.length === pengajuans.length && pengajuans.length > 0}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                    title="Pilih Semua"
                  />
                </th>
                <th className="p-3">Waktu Pengajuan</th>
                <th className="p-3">Judul Buku</th>
                <th className="p-3 text-center">Jumlah Eks</th>
                <th className="p-3">Status Bendahara</th>
                <th className="p-3">Catatan Bendahara</th>
                <th className="p-3 text-right">Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pengajuans.map((p) => {
                const book = books.find(b => b.id === p.buku_id) || p.buku;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedPengajuanIds.includes(p.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPengajuanIds.includes(p.id)}
                        onChange={() => handleToggleSelectPengajuan(p.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{p.created_at}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{book?.judul || `Buku #${p.buku_id}`}</td>
                    <td className="p-3 text-center font-bold">{p.jumlah_pengajuan} Eks</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        p.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {p.catatan_bendahara ? `"${p.catatan_bendahara}"` : '-'}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {p.status === 'pending' ? (
                        <button
                          onClick={() => {
                            approvePengajuanCetak(p.id, accounts[0]?.id || 1);
                            setToastMessage(`Pengajuan cetak "${book?.judul || 'Buku'}" (${p.jumlah_pengajuan} Eks) berhasil disetujui! SPK otomatis diteruskan ke Produksi.`);
                            setTimeout(() => setToastMessage(null), 4000);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          title="Setujui Cetak dan Terbitkan SPK"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui Cetak</span>
                        </button>
                      ) : p.status === 'approved' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>SPK Produksi Aktif</span>
                        </span>
                      ) : (
                        <span className="text-rose-500 text-[11px] font-medium">Ditolak Bendahara</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Book Add/Edit Modal */}
      {modalBookOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setModalBookOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingBook ? 'Edit Data Judul Buku' : 'Tambah Judul Buku Baru ke Katalog'}
              </h3>
              <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Judul Lengkap Buku *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.judul}
                    onChange={e => setBookForm({ ...bookForm, judul: e.target.value })}
                    placeholder="Contoh: Pembebasan di Tangan Kita"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Penulis / Penerjemah *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.penulis}
                    onChange={e => setBookForm({ ...bookForm, penulis: e.target.value })}
                    placeholder="Contoh: Pabongka Rinpoche"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Harga Jual Resmi (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={bookForm.harga_jual || ''}
                    onChange={e => setBookForm({ ...bookForm, harga_jual: parseInt(e.target.value) || 0 })}
                    placeholder="145000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                {!editingBook && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Stok Awal Gudang (Opsional)</label>
                    <input
                      type="number"
                      min="0"
                      value={bookForm.stok_gudang || ''}
                      onChange={e => setBookForm({ ...bookForm, stok_gudang: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalBookOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Simpan Buku
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ajukan Cetak Modal */}
      {modalAjukanOpen && selectedBookForAjukan && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setModalAjukanOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ajukan Cetak Ulang ke Bendahara
              </h3>
              <p className="text-xs text-slate-500">
                Buku: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBookForAjukan.judul}</span>
              </p>

              <form onSubmit={handleAjukanSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jumlah Eksemplar Yang Diajukan</label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="10"
                    value={jumlahAjukan}
                    onChange={e => setJumlahAjukan(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex justify-between text-indigo-900 dark:text-indigo-200 font-semibold">
                    <span>Estimasi Biaya Cetak:</span>
                    <span className="font-extrabold">Rp {(jumlahAjukan * 20000).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">*Tarif standar pabrik: Rp 20.000 / eks</p>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalAjukanOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Kirim Pengajuan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Generic Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmText={confirmModalConfig.confirmText}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center space-x-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
};
