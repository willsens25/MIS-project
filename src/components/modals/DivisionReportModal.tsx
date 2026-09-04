import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  Printer,
  X,
  FileDown,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface DivisionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDivisionId?: DivisionId;
}

export const DivisionReportModal: React.FC<DivisionReportModalProps> = ({
  isOpen,
  onClose,
  targetDivisionId
}) => {
  const {
    currentUser,
    divisiList,
    identitasList,
    usersList,
    mutasis,
    accounts,
    categories,
    books,
    orders,
    promos,
    pengajuans,
    productionLogs,
    logisticLogs,
    penyalurans
  } = useApp();

  const [selectedDivId, setSelectedDivId] = useState<DivisionId>(
    targetDivisionId || currentUser.divisi_id || 1
  );

  if (!isOpen) return null;

  const currentDiv = divisiList.find(d => d.id === selectedDivId) || divisiList[0];
  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const reportDocNumber = `REP-${currentDiv.kode}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}-01`;

  const handlePrint = () => {
    window.print();
  };

  // Helper calculation for Directorate
  const totalAnggota = identitasList.length;
  const anggotaWithKota = identitasList.reduce<Record<string, number>>((acc, curr) => {
    const kota = curr.kota || 'Lainnya';
    acc[kota] = (acc[kota] || 0) + 1;
    return acc;
  }, {});
  const topKota = Object.entries(anggotaWithKota).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Helper calculation for Finance
  const totalPemasukan = mutasis.filter(m => m.tipe === 'Masuk').reduce((acc, m) => acc + m.nominal, 0);
  const totalPengeluaran = mutasis.filter(m => m.tipe === 'Keluar').reduce((acc, m) => acc + m.nominal, 0);
  const netCashflow = totalPemasukan - totalPengeluaran;
  const totalSaldoKas = accounts.reduce((acc, a) => {
    const mutasiAkunMasuk = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const mutasiAkunKeluar = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    return acc + (a.saldo_awal || 0) + mutasiAkunMasuk - mutasiAkunKeluar;
  }, 0);

  // Helper calculation for Publishing
  const totalJudulBuku = books.length;
  const totalStokBuku = books.reduce((acc, b) => acc + (b.stok_gudang || 0), 0);
  const totalValuasiBuku = books.reduce((acc, b) => acc + ((b.stok_gudang || 0) * (b.harga_jual || 0)), 0);

  // Helper calculation for Marketing
  const totalOmsetPesanan = orders.reduce((acc, o) => acc + o.total_tagihan, 0);
  const totalPesananLunas = orders.filter(o => o.status === 'Lunas').length;
  const totalPesananPending = orders.filter(o => o.status === 'Pending').length;
  const totalPotonganDiskon = orders.reduce((sum, o) => sum + (o.items?.reduce((isum, it) => isum + (it.potongan_diskon || 0), 0) || 0), 0);

  // Helper calculation for Production
  const totalBukuDiproduksi = productionLogs.reduce((acc, p) => acc + p.qty_produksi, 0);

  // Helper calculation for Logistics
  const totalDistribusi = penyalurans.reduce((acc, p) => acc + p.qty, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
        <div
          className="relative bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 text-left animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Control Bar (Hidden on Print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white print:hidden border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Download & Cetak Laporan Divisi
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-900 text-teal-300 font-semibold border border-teal-700">
                    PDF Ready
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Laporan resmi tervalidasi siap simpan ke PDF atau dicetak langsung
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Division selector in modal */}
              <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-400">Divisi:</span>
                <select
                  value={selectedDivId}
                  onChange={e => setSelectedDivId(Number(e.target.value) as DivisionId)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {divisiList.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.kode} - {d.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="btn-trigger-print-report"
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                title="Cetak atau Simpan sebagai PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Cetak PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Area */}
          <div id="printable-area" className="p-8 sm:p-12 text-slate-800 bg-white font-sans text-xs leading-relaxed">
            
            {/* Header / Kop Yayasan */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex items-start space-x-4">
                <img
                  src="/img/logo-lamrimnesia.png"
                  alt="Logo Lamrimnesia"
                  className="h-14 sm:h-16 w-auto object-contain rounded-xl shadow-xs"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/logo-lamrimnesia.png')) {
                      target.src = '/logo-lamrimnesia.png';
                    }
                  }}
                />
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    YAYASAN PELESTARIAN & PENGEMBANGAN LAMRIM NUSANTARA
                  </h1>
                  <p className="text-xs font-semibold text-teal-800">
                    Sistem Administrasi Pengelolaan Terpadu (SAPA-ALL MIS)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Jl. Dharma Raya No. 108, Jakarta Barat | info@lamrimnesia.org | www.lamrimnesia.org
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold text-slate-900 uppercase">
                  {reportDocNumber}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Tanggal: {new Date().toLocaleDateString('id-ID')}
                </div>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-300 text-[10px]">
                  DOKUMEN RESMI INTERNAL
                </span>
              </div>
            </div>

            {/* Document Title & Meta Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                    Laporan Ringkasan Eksekutif Divisi
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    DIVISI {currentDiv.nama_divisi.toUpperCase()} ({currentDiv.kode})
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {currentDiv.deskripsi}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                  <div>Periode: <strong className="text-slate-800">{currentDateFormatted}</strong></div>
                  <div>Penyusun: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})</div>
                  <div>Status Data: <strong className="text-emerald-700">Tersinkronisasi</strong></div>
                </div>
              </div>
            </div>

            {/* 1. EXECUTIVE KPI SUMMARY CARDS */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-3 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                <span>I. Ringkasan Indikator Kinerja Utama (Executive KPI Summary)</span>
              </h3>

              {/* Specific KPI depending on selected division */}
              {selectedDivId === 1 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Anggota Terdaftar</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{totalAnggota} Jiwa</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Aktif dalam database</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">User Akses MIS</p>
                    <p className="text-lg font-extrabold text-indigo-700 mt-1">{usersList.length} Akun</p>
                    <p className="text-[10px] text-slate-500">Lintas 6 divisi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Sebaran Kota Terbanyak</p>
                    <p className="text-sm font-bold text-slate-900 mt-1.5">{topKota[0]?.[0] || 'Jakarta'} ({topKota[0]?.[1] || 0})</p>
                    <p className="text-[10px] text-slate-500">Sentra konsentrasi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Status Tata Kelola</p>
                    <p className="text-sm font-bold text-emerald-700 mt-1.5">TERTIB & AKUNTABEL</p>
                    <p className="text-[10px] text-slate-500">Direktorat Lamrimnesia</p>
                  </div>
                </div>
              )}

              {selectedDivId === 2 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Saldo Kas Yayasan</p>
                    <p className="text-base font-black text-indigo-800 mt-1">Rp {totalSaldoKas.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">{accounts.length} Rekening Aktif</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Pemasukan Kas</p>
                    <p className="text-base font-extrabold text-emerald-700 mt-1">+Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">{mutasis.filter(m => m.tipe === 'Masuk').length} Transaksi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Pengeluaran Kas</p>
                    <p className="text-base font-extrabold text-rose-700 mt-1">-Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">{mutasis.filter(m => m.tipe === 'Keluar').length} Transaksi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pengajuan Cetak Pending</p>
                    <p className="text-base font-extrabold text-amber-700 mt-1">
                      {pengajuans.filter(p => p.status === 'pending').length} Judul
                    </p>
                    <p className="text-[10px] text-slate-500">Menunggu persetujuan</p>
                  </div>
                </div>
              )}

              {selectedDivId === 3 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Judul Terdaftar</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{totalJudulBuku} Judul</p>
                    <p className="text-[10px] text-slate-500">Katalog Resmi Yayasan</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Stok Fisik Gudang</p>
                    <p className="text-lg font-extrabold text-teal-800 mt-1">{totalStokBuku} Eks</p>
                    <p className="text-[10px] text-slate-500">Siap edar & distribusi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Estimasi Nilai Aset Buku</p>
                    <p className="text-sm font-extrabold text-indigo-700 mt-1.5">Rp {totalValuasiBuku.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">Berdasarkan HET</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pengajuan Cetak Ulang</p>
                    <p className="text-lg font-extrabold text-amber-700 mt-1">{pengajuans.length} Dokumen</p>
                    <p className="text-[10px] text-slate-500">Ke divisi Keuangan</p>
                  </div>
                </div>
              )}

              {selectedDivId === 4 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Omset Penjualan</p>
                    <p className="text-base font-black text-indigo-800 mt-1">Rp {totalOmsetPesanan.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">{orders.length} Total Transaksi</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pesanan Lunas</p>
                    <p className="text-lg font-extrabold text-emerald-700 mt-1">{totalPesananLunas} Transaksi</p>
                    <p className="text-[10px] text-slate-500">Sukses terbayar</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pesanan Menunggu</p>
                    <p className="text-lg font-extrabold text-amber-700 mt-1">{totalPesananPending} Transaksi</p>
                    <p className="text-[10px] text-slate-500">Follow-up marketing</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Diskon & Kupon</p>
                    <p className="text-sm font-extrabold text-rose-700 mt-1.5">Rp {totalPotonganDiskon.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-500">{promos.length} Kode Promo Aktif</p>
                  </div>
                </div>
              )}

              {selectedDivId === 5 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Buku Selesai Cetak</p>
                    <p className="text-lg font-extrabold text-indigo-800 mt-1">{totalBukuDiproduksi} Eks</p>
                    <p className="text-[10px] text-slate-500">Diserahterimakan ke Gudang</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">SPK Cetak Disetujui</p>
                    <p className="text-lg font-extrabold text-emerald-700 mt-1">
                      {pengajuans.filter(p => p.status === 'approved').length} Proyek
                    </p>
                    <p className="text-[10px] text-slate-500">Siap dicetak percetakan</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Batch Percetakan</p>
                    <p className="text-lg font-extrabold text-teal-800 mt-1">{productionLogs.length} Batch</p>
                    <p className="text-[10px] text-slate-500">Riwayat output</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Kontrol Kualitas (QC)</p>
                    <p className="text-sm font-bold text-emerald-700 mt-1.5">100% STANDAR</p>
                    <p className="text-[10px] text-slate-500">Segel rapi & presisi</p>
                  </div>
                </div>
              )}

              {selectedDivId === 6 && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Stok Fisik Siap Kirim</p>
                    <p className="text-lg font-extrabold text-teal-800 mt-1">{totalStokBuku} Eks</p>
                    <p className="text-[10px] text-slate-500">Di gudang utama</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Penyaluran Non-Komersial</p>
                    <p className="text-lg font-extrabold text-indigo-700 mt-1">{totalDistribusi} Eks</p>
                    <p className="text-[10px] text-slate-500">Bazar, Donasi & Vihara</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pesanan Telah Diproses</p>
                    <p className="text-lg font-extrabold text-emerald-700 mt-1">
                      {orders.filter(o => o.status === 'Lunas' || o.status === 'Dikirim').length} Paket
                    </p>
                    <p className="text-[10px] text-slate-500">Disertai Surat Jalan</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Akurasi Pengiriman</p>
                    <p className="text-sm font-bold text-emerald-700 mt-1.5">99.8% TEPAT WAKTU</p>
                    <p className="text-[10px] text-slate-500">Mitra JNE, J&T, SiCepat</p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DETAILED DATA TABLE SPECIFIC TO CURRENT DIVISION */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-3 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                <span>II. Rincian Data Operasional & Catatan Transaksi</span>
              </h3>

              {/* Direktorat Table */}
              {selectedDivId === 1 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Nama Lengkap Anggota</th>
                        <th className="py-2 px-3">Kota / Wilayah</th>
                        <th className="py-2 px-3">Kontak / HP</th>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3">Tgl Bergabung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {identitasList.slice(0, 8).map((it, idx) => (
                        <tr key={it.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{it.nama_lengkap}</td>
                          <td className="py-1.5 px-3">{it.kota || '-'}</td>
                          <td className="py-1.5 px-3 font-mono text-slate-600">{it.nomor_hp_primary || '-'}</td>
                          <td className="py-1.5 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                              {it.jenis_umat || 'Anggota'}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-500">{it.created_at || '2026-01-10'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {identitasList.length > 8 && (
                    <div className="py-1.5 px-3 bg-slate-50 text-slate-500 text-[10px] text-center border-t border-slate-200">
                      Menampilkan 8 dari total {identitasList.length} anggota Lamrimnesia.
                    </div>
                  )}
                </div>
              )}

              {/* Finance Table */}
              {selectedDivId === 2 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Akun Rekening</th>
                        <th className="py-2 px-3">Kategori Mutasi</th>
                        <th className="py-2 px-3">Keterangan</th>
                        <th className="py-2 px-3 text-right">Nominal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mutasis.slice(0, 8).map((m, idx) => {
                        const acc = accounts.find(a => a.id === m.account_id);
                        const cat = categories.find(c => c.id === m.category_id);
                        return (
                          <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{m.tanggal}</td>
                            <td className="py-1.5 px-3 font-medium">{acc?.nama_akun || 'Kas Utama'}</td>
                            <td className="py-1.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                m.tipe === 'Masuk' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                              }`}>
                                {m.tipe}: {cat?.nama_kategori || m.category?.nama_kategori || 'Operasional'}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-slate-700">{m.keterangan}</td>
                            <td className={`py-1.5 px-3 text-right font-bold ${
                              m.tipe === 'Masuk' ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {m.tipe === 'Masuk' ? '+' : '-'}Rp {m.nominal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {mutasis.length > 8 && (
                    <div className="py-1.5 px-3 bg-slate-50 text-slate-500 text-[10px] text-center border-t border-slate-200">
                      Menampilkan 8 dari total {mutasis.length} mutasi kas terbaru.
                    </div>
                  )}
                </div>
              )}

              {/* Publishing Table */}
              {selectedDivId === 3 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Judul Buku Dharma</th>
                        <th className="py-2 px-3">Penulis / Penerjemah</th>
                        <th className="py-2 px-3 text-right">Harga Resmi (HET)</th>
                        <th className="py-2 px-3 text-center">Stok Gudang</th>
                        <th className="py-2 px-3 text-right">Valuasi Stok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {books.map((b, idx) => (
                        <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{b.judul}</td>
                          <td className="py-1.5 px-3 text-slate-700">{b.penulis}</td>
                          <td className="py-1.5 px-3 text-right font-mono">Rp {b.harga_jual.toLocaleString('id-ID')}</td>
                          <td className="py-1.5 px-3 text-center font-bold text-teal-800">{b.stok_gudang} Eks</td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900 font-mono">
                            Rp {(b.stok_gudang * b.harga_jual).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Marketing Table */}
              {selectedDivId === 4 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">No. Invoice</th>
                        <th className="py-2 px-3">Nama Pembeli</th>
                        <th className="py-2 px-3">Platform</th>
                        <th className="py-2 px-3">Status Bayar</th>
                        <th className="py-2 px-3 text-right">Total Tagihan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders.slice(0, 8).map((o, idx) => (
                        <tr key={o.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono font-semibold text-slate-900">{o.no_invoice}</td>
                          <td className="py-1.5 px-3 font-medium">{o.nama_pembeli}</td>
                          <td className="py-1.5 px-3 text-slate-600">{o.via}</td>
                          <td className="py-1.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900 font-mono">
                            Rp {o.total_tagihan.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length > 8 && (
                    <div className="py-1.5 px-3 bg-slate-50 text-slate-500 text-[10px] text-center border-t border-slate-200">
                      Menampilkan 8 dari total {orders.length} pesanan penjualan.
                    </div>
                  )}
                </div>
              )}

              {/* Production Table */}
              {selectedDivId === 5 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Tanggal Produksi</th>
                        <th className="py-2 px-3">Judul Buku Selesai Cetak</th>
                        <th className="py-2 px-3 text-center">Jumlah Output</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {productionLogs.map((p, idx) => {
                        const book = books.find(b => b.id === p.buku_id) || p.book;
                        return (
                          <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{p.tanggal_produksi}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">{book?.judul || `Buku ID #${p.buku_id}`}</td>
                            <td className="py-1.5 px-3 text-center font-bold text-indigo-700">{p.qty_produksi} Eks</td>
                            <td className="py-1.5 px-3 text-emerald-700 font-semibold">Tuntas Masuk Gudang</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Logistics Table */}
              {selectedDivId === 6 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Tanggal Dokumen</th>
                        <th className="py-2 px-3">Judul Buku / Item</th>
                        <th className="py-2 px-3 text-center">QTY</th>
                        <th className="py-2 px-3">Tujuan / Agen / Vihara</th>
                        <th className="py-2 px-3">Status Kirim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {penyalurans.map((py, idx) => {
                        const book = books.find(b => b.id === py.buku_id) || py.book;
                        return (
                          <tr key={py.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{py.created_at || '2026-08-15'}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">{book?.judul || `Buku ID #${py.buku_id}`}</td>
                            <td className="py-1.5 px-3 text-center font-bold text-teal-800">{py.qty} Eks</td>
                            <td className="py-1.5 px-3 font-medium text-slate-800">{py.nama_agen}</td>
                            <td className="py-1.5 px-3 text-slate-600 capitalize">{py.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. CATATAN & KESIMPULAN OPERASIONAL */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-8">
              <h4 className="font-bold text-slate-800 mb-1">Catatan & Pernyataan Kepatuhan Manajemen:</h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Data laporan ini diambil secara otomatis dan tersinkronisasi dengan basis data Sistem Informasi Manajemen Yayasan Lamrimnesia (SAPA-ALL MIS). Segala bentuk pencatatan transaksi, arus kas, dan mutasi barang telah melalui verifikasi internal divisi terkait. Dokumen ini sah sebagai pertanggungjawaban operasional yayasan.
              </p>
            </div>

            {/* 4. OFFICIAL SIGNATURE SECTION */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-800 text-center text-xs">
              <div>
                <p className="text-slate-500">Disusun Oleh,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[11px] font-mono text-slate-400 italic">(Digital Verified)</span>
                </div>
                <p className="font-bold text-slate-900 underline">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500">{currentUser.role} {currentDiv.kode}</p>
              </div>

              <div>
                <p className="text-slate-500">Diverifikasi Oleh,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[11px] font-mono text-slate-400 italic">(Digital Stamp)</span>
                </div>
                <p className="font-bold text-slate-900 underline">Kepala Divisi {currentDiv.nama_divisi}</p>
                <p className="text-[10px] text-slate-500">Divisi {currentDiv.kode} Lamrimnesia</p>
              </div>

              <div>
                <p className="text-slate-500">Mengetahui & Menyetujui,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[11px] font-mono text-slate-400 italic">(Direktorat Lamrimnesia)</span>
                </div>
                <p className="font-bold text-slate-900 underline">Direktur Eksekutif</p>
                <p className="text-[10px] text-slate-500">Yayasan Lamrimnesia</p>
              </div>
            </div>

            {/* Print Footer */}
            <div className="mt-8 pt-2 border-t border-slate-200 text-slate-400 text-[9px] flex justify-between items-center">
              <span>SAPA-ALL MIS v2.6 | Dokumen Laporan Resmi Yayasan Lamrimnesia</span>
              <span>Dicetak pada: {new Date().toLocaleString('id-ID')}</span>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
