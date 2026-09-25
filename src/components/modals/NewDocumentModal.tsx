import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Printer,
  ShoppingBag,
  Wallet,
  BookOpen,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RupiahInput } from '../common/RupiahInput';

export type DocumentType = 'pengajuan' | 'order' | 'mutasi' | 'buku' | 'identitas';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: DocumentType;
  onSuccessToast?: (msg: string) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  initialType = 'pengajuan',
  onSuccessToast,
}) => {
  const {
    books,
    accounts,
    categories,
    salesChannels,
    expeditions,
    ajukanCetak,
    createOrder,
    addMutasi,
    addBook,
    addIdentitas,
    currentUser,
    switchDivision,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DocumentType>(initialType);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states - Pengajuan Cetak
  const [pengajuanBookId, setPengajuanBookId] = useState<number>(books[0]?.id || 1);
  const [pengajuanJumlah, setPengajuanJumlah] = useState<number>(500);

  // Form states - Order / Faktur
  const [orderNama, setOrderNama] = useState('');
  const [orderKontak, setOrderKontak] = useState('');
  const [orderAlamat, setOrderAlamat] = useState('');
  const [orderBookId, setOrderBookId] = useState<number>(books[0]?.id || 1);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderVia, setOrderVia] = useState<string>(salesChannels[0]?.nama_channel || 'WhatsApp');
  const [orderEkspedisi, setOrderEkspedisi] = useState<string>(expeditions[0]?.nama_ekspedisi || 'JNE');
  const [orderOngkir, setOrderOngkir] = useState<number>(15000);
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Lunas'>('Pending');

  // Form states - Mutasi Kas
  const [mutasiAccountId, setMutasiAccountId] = useState<number>(accounts[0]?.id || 1);
  const [mutasiTipe, setMutasiTipe] = useState<'Masuk' | 'Keluar'>('Keluar');
  const [mutasiKategori, setMutasiKategori] = useState<string>('Operasional');
  const [mutasiNominal, setMutasiNominal] = useState<number>(100000);
  const [mutasiKeterangan, setMutasiKeterangan] = useState('');

  // Form states - Buku Baru
  const [bukuJudul, setBukuJudul] = useState('');
  const [bukuPenulis, setBukuPenulis] = useState('');
  const [bukuKategori, setBukuKategori] = useState('Dharma');
  const [bukuHarga, setBukuHarga] = useState<number>(75000);
  const [bukuBiayaPokok, setBukuBiayaPokok] = useState<number>(30000);
  const [bukuStok, setBukuStok] = useState<number>(0);
  const [bukuIsbn, setBukuIsbn] = useState('');

  // Form states - Identitas Baru
  const [identitasNama, setIdentitasNama] = useState('');
  const [identitasKontak, setIdentitasKontak] = useState('');
  const [identitasEmail, setIdentitasEmail] = useState('');
  const [identitasAlamat, setIdentitasAlamat] = useState('');
  const [identitasKategori, setIdentitasKategori] = useState('Pelanggan');

  if (!isOpen) return null;

  const selectedPengajuanBook = books.find((b) => b.id === pengajuanBookId) || books[0];
  const pengajuanEstimasiBiaya = pengajuanJumlah * (selectedPengajuanBook?.biaya_pokok || 25000);

  const selectedOrderBook = books.find((b) => b.id === orderBookId) || books[0];
  const orderSubtotal = (selectedOrderBook?.harga_jual || 0) * orderQty;
  const orderTotal = orderSubtotal + Number(orderOngkir || 0);

  // Submit Handlers
  const handlePengajuanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengajuanBookId || pengajuanJumlah <= 0) {
      setErrorMsg('Pilih buku dan masukkan jumlah eksemplar minimal 1.');
      return;
    }
    ajukanCetak(pengajuanBookId, pengajuanJumlah);
    const msg = `Dokumen pengajuan cetak "${selectedPengajuanBook?.judul}" (${pengajuanJumlah.toLocaleString('id-ID')} eks) berhasil dibuat dan masuk antrean persetujuan!`;
    if (onSuccessToast) onSuccessToast(msg);
    onClose();
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNama.trim()) {
      setErrorMsg('Nama pembeli / pemesan wajib diisi.');
      return;
    }
    if (!orderBookId || orderQty <= 0) {
      setErrorMsg('Pilih buku dan kuantitas minimal 1.');
      return;
    }

    const res = createOrder({
      no_invoice: `INV-${Date.now().toString().slice(-6)}`,
      tanggal_pesan: new Date().toISOString().split('T')[0],
      via: orderVia,
      nama_pembeli: orderNama.trim(),
      kontak_pembeli: orderKontak.trim() || '-',
      nama_penerima: orderNama.trim(),
      kontak_penerima: orderKontak.trim() || '-',
      alamat_penerima: orderAlamat.trim() || 'Ambil di Kantor',
      ekspedisi: orderEkspedisi,
      ongkir: Number(orderOngkir) || 0,
      status: orderStatus,
      total_tagihan: orderTotal,
      keterangan: 'Dibuat via Quick Actions Menu',
      items: [
        {
          buku_id: orderBookId,
          book: selectedOrderBook,
          jumlah: orderQty,
          harga_satuan: selectedOrderBook?.harga_jual || 0,
          subtotal: orderSubtotal,
        },
      ],
    });

    if (res.success) {
      const msg = `Dokumen faktur ${res.invoice || 'Pesanan'} berhasil dibuat untuk ${orderNama}!`;
      if (onSuccessToast) onSuccessToast(msg);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleMutasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutasiNominal <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!mutasiKeterangan.trim()) {
      setErrorMsg('Keterangan transaksi kas wajib diisi.');
      return;
    }

    addMutasi(
      mutasiAccountId,
      mutasiKategori,
      mutasiTipe,
      mutasiNominal,
      mutasiKeterangan.trim(),
      new Date().toISOString().split('T')[0]
    );

    const acc = accounts.find((a) => a.id === mutasiAccountId);
    const msg = `Voucher mutasi kas ${mutasiTipe.toLowerCase()} Rp ${mutasiNominal.toLocaleString('id-ID')} berhasil dicatat pada akun ${acc?.nama_akun || 'Kas'}!`;
    if (onSuccessToast) onSuccessToast(msg);
    onClose();
  };

  const handleBukuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bukuJudul.trim() || !bukuPenulis.trim()) {
      setErrorMsg('Judul buku dan nama penulis wajib diisi.');
      return;
    }

    addBook(
      bukuJudul.trim(),
      bukuPenulis.trim(),
      bukuHarga,
      bukuStok,
      bukuBiayaPokok,
      bukuKategori,
      bukuIsbn.trim() || undefined
    );

    const msg = `Dokumen naskah "${bukuJudul}" berhasil ditambahkan ke katalog penerbitan!`;
    if (onSuccessToast) onSuccessToast(msg);
    onClose();
  };

  const handleIdentitasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identitasNama.trim()) {
      setErrorMsg('Nama lengkap kontak / mitra wajib diisi.');
      return;
    }

    addIdentitas({
      nama_lengkap: identitasNama.trim(),
      jenis_identitas: 'KTP',
      nomor_identitas: `ID-${Date.now().toString().slice(-6)}`,
      nomor_hp_primary: identitasKontak.trim() || '-',
      email: identitasEmail.trim() || '',
      alamat: identitasAlamat.trim() || '-',
      kategori_identitas: identitasKategori,
      status_keamanan: 'Normal',
      jenis_umat: 'Simpatisan',
      bhante_lay: 'Lay',
      is_agen_purna: false,
      is_dharma_patriot: false,
      divisi_id: currentUser.divisi_id,
    });

    const msg = `Data identitas mitra "${identitasNama}" berhasil disimpan!`;
    if (onSuccessToast) onSuccessToast(msg);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-3xl my-auto py-2 sm:py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/80 shadow-xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Tambah Dokumen & Transaksi Baru</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      Quick Action
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Buat dokumen pengajuan, faktur pesanan, mutasi kas, naskah buku, atau kontak langsung.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Type Tab Switcher */}
            <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pengajuan');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'pengajuan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Pengajuan Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('order');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'order'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Faktur Pesanan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('mutasi');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'mutasi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Voucher Kas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('buku');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'buku'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Naskah Buku</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('identitas');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'identitas'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Mitra / Kontak</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
              {/* TAB 1: Pengajuan Cetak & Anggaran */}
              {activeTab === 'pengajuan' && (
                <form onSubmit={handlePengajuanSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Dokumen ini akan diajukan ke <strong>Divisi Keuangan</strong> untuk verifikasi anggaran & persetujuan SPK cetak ke divisi Produksi.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Pilih Judul Buku / Naskah
                    </label>
                    <select
                      value={pengajuanBookId}
                      onChange={(e) => setPengajuanBookId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.judul} — {b.penulis} (HPP: Rp {(b.biaya_pokok || 25000).toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Jumlah Cetak (Oplah / Eksemplar)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={pengajuanJumlah}
                        onChange={(e) => setPengajuanJumlah(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Biaya Pokok per Eks (HPP)
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        Rp {(selectedPengajuanBook?.biaya_pokok || 25000).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Estimasi Kebutuhan Dana Cetak:</div>
                      <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                        Rp {pengajuanEstimasiBiaya.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                      Target: <strong>Produksi MIS</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim Dokumen Pengajuan</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: Faktur Pesanan Penjualan */}
              {activeTab === 'order' && (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nama Pembeli / Pemesan *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={orderNama}
                        onChange={(e) => setOrderNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nomor Kontak / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx"
                        value={orderKontak}
                        onChange={(e) => setOrderKontak(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Alamat Pengiriman
                    </label>
                    <input
                      type="text"
                      placeholder="Jalan, Kota, Kode Pos"
                      value={orderAlamat}
                      onChange={(e) => setOrderAlamat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Pilih Buku
                      </label>
                      <select
                        value={orderBookId}
                        onChange={(e) => setOrderBookId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.judul} (Rp {b.harga_jual.toLocaleString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Jumlah (Qty)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Saluran Penjualan
                      </label>
                      <select
                        value={orderVia}
                        onChange={(e) => setOrderVia(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {salesChannels.map((c) => (
                          <option key={c.id} value={c.nama_channel}>
                            {c.nama_channel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Ekspedisi
                      </label>
                      <select
                        value={orderEkspedisi}
                        onChange={(e) => setOrderEkspedisi(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {expeditions.map((ex) => (
                          <option key={ex.id} value={ex.nama_ekspedisi}>
                            {ex.nama_ekspedisi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Biaya Ongkir (Rp)
                      </label>
                      <RupiahInput
                        value={orderOngkir}
                        onChange={(val) => setOrderOngkir(val)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Order Total Bar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total Tagihan:</span>
                      <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                        Rp {orderTotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Status:</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value as 'Pending' | 'Lunas')}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Pending">Pending (Belum Lunas)</option>
                        <option value="Lunas">Lunas</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Terbitkan Faktur Pesanan</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: Voucher Mutasi Kas */}
              {activeTab === 'mutasi' && (
                <form onSubmit={handleMutasiSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Tipe Mutasi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMutasiTipe('Masuk')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            mutasiTipe === 'Masuk'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          + Kas Masuk (Pemasukan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMutasiTipe('Keluar')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            mutasiTipe === 'Keluar'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          - Kas Keluar (Pengeluaran)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Akun Rekening Kas / Bank
                      </label>
                      <select
                        value={mutasiAccountId}
                        onChange={(e) => setMutasiAccountId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.nama_akun} ({acc.kode_akun})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kategori Transaksi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Operasional, Donasi, Percetakan"
                        value={mutasiKategori}
                        onChange={(e) => setMutasiKategori(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nominal (Rp)
                      </label>
                      <RupiahInput
                        required
                        allowZero={false}
                        value={mutasiNominal}
                        onChange={(val) => setMutasiNominal(val)}
                        placeholder="Contoh: 500.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Keterangan / Uraian Transaksi
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Uraian bukti pengeluaran atau penerimaan..."
                      value={mutasiKeterangan}
                      onChange={(e) => setMutasiKeterangan(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Voucher Mutasi</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: Naskah Buku Baru */}
              {activeTab === 'buku' && (
                <form onSubmit={handleBukuSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Judul Buku *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pembebasan di Telapak Tangan Anda"
                        value={bukuJudul}
                        onChange={(e) => setBukuJudul(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nama Penulis / Penyusun *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pabongka Rinpoche"
                        value={bukuPenulis}
                        onChange={(e) => setBukuPenulis(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kategori Naskah
                      </label>
                      <input
                        type="text"
                        placeholder="Dharma, Lamrim, Biografi..."
                        value={bukuKategori}
                        onChange={(e) => setBukuKategori(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Harga Jual (Rp)
                      </label>
                      <RupiahInput
                        value={bukuHarga}
                        onChange={(val) => setBukuHarga(val)}
                        placeholder="Contoh: 145.000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Biaya Pokok (HPP)
                      </label>
                      <RupiahInput
                        value={bukuBiayaPokok}
                        onChange={(val) => setBukuBiayaPokok(val)}
                        placeholder="Contoh: 58.000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nomor ISBN (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="978-602-xxxx-xx-x"
                        value={bukuIsbn}
                        onChange={(e) => setBukuIsbn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Stok Fisik Awal (Eks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={bukuStok}
                        onChange={(e) => setBukuStok(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Daftarkan Naskah Buku</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: Data Identitas / Mitra Baru */}
              {activeTab === 'identitas' && (
                <form onSubmit={handleIdentitasSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nama Lengkap / Instansi *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Upasika Ratna / Vihara Buddha"
                        value={identitasNama}
                        onChange={(e) => setIdentitasNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Kategori Kontak
                      </label>
                      <select
                        value={identitasKategori}
                        onChange={(e) => setIdentitasKategori(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Pelanggan">Pelanggan Buku</option>
                        <option value="Donatur">Donatur Cetak</option>
                        <option value="Mitra Percetakan">Mitra Percetakan</option>
                        <option value="Relawan">Relawan / Simpatisan</option>
                        <option value="Lembaga">Lembaga / Komunitas</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx"
                        value={identitasKontak}
                        onChange={(e) => setIdentitasKontak(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        placeholder="kontak@email.com"
                        value={identitasEmail}
                        onChange={(e) => setIdentitasEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Alamat / Domisili
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alamat lengkap domisili..."
                      value={identitasAlamat}
                      onChange={(e) => setIdentitasAlamat(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Identitas Mitra</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
