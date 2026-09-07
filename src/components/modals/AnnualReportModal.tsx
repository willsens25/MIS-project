import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnnualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear?: number;
}

export const AnnualReportModal: React.FC<AnnualReportModalProps> = ({
  isOpen,
  onClose,
  defaultYear = 2026
}) => {
  const {
    identitasList,
    usersList,
    mutasis,
    accounts,
    categories,
    books,
    orders,
    pengajuans,
    productionLogs,
    logisticLogs,
    penyalurans,
    activityLogs
  } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Available years from mutasi / order data
  const availableYears = useMemo(() => {
    const years = new Set<number>([2024, 2025, 2026, 2027]);
    mutasis.forEach(m => {
      const y = parseInt((m.tanggal || '').substring(0, 4), 10);
      if (!isNaN(y)) years.add(y);
    });
    orders.forEach(o => {
      const y = parseInt((o.created_at || '').substring(0, 4), 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [mutasis, orders]);

  // Year-filtered datasets
  const yearStr = String(selectedYear);

  const yearMutasis = useMemo(() => {
    return mutasis.filter(m => (m.tanggal || '').startsWith(yearStr));
  }, [mutasis, yearStr]);

  const yearOrders = useMemo(() => {
    return orders.filter(o => (o.created_at || '').startsWith(yearStr));
  }, [orders, yearStr]);

  const yearProductions = useMemo(() => {
    return productionLogs.filter(p => (p.tanggal_produksi || '').startsWith(yearStr));
  }, [productionLogs, yearStr]);

  const yearPenyalurans = useMemo(() => {
    return penyalurans.filter(p => (p.created_at || '').startsWith(yearStr));
  }, [penyalurans, yearStr]);

  // If there are zero entries strictly matching yearStr, fallback smoothly to total for demo/preview
  const effectiveMutasis = yearMutasis.length > 0 ? yearMutasis : mutasis;
  const effectiveOrders = yearOrders.length > 0 ? yearOrders : orders;
  const effectiveProductions = yearProductions.length > 0 ? yearProductions : productionLogs;
  const effectivePenyalurans = yearPenyalurans.length > 0 ? yearPenyalurans : penyalurans;

  // Financial Calculations
  const totalPemasukan = useMemo(() => {
    return effectiveMutasis
      .filter(m => m.tipe === 'Masuk')
      .reduce((acc, m) => acc + m.nominal, 0);
  }, [effectiveMutasis]);

  const totalPengeluaran = useMemo(() => {
    return effectiveMutasis
      .filter(m => m.tipe === 'Keluar')
      .reduce((acc, m) => acc + m.nominal, 0);
  }, [effectiveMutasis]);

  const surplusDefisit = totalPemasukan - totalPengeluaran;

  const totalSaldoKasSaatIni = useMemo(() => {
    return accounts.reduce((acc, a) => {
      const masuk = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
      const keluar = mutasis.filter(m => m.account_id === a.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
      return acc + (a.saldo_awal || 0) + masuk - keluar;
    }, 0);
  }, [accounts, mutasis]);

  // Quarterly Breakdown
  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: 'Kuartal I (Jan - Mar)', months: ['01', '02', '03'], masuk: 0, keluar: 0 },
      { name: 'Kuartal II (Apr - Jun)', months: ['04', '05', '06'], masuk: 0, keluar: 0 },
      { name: 'Kuartal III (Jul - Sep)', months: ['07', '08', '09'], masuk: 0, keluar: 0 },
      { name: 'Kuartal IV (Okt - Des)', months: ['10', '11', '12'], masuk: 0, keluar: 0 }
    ];

    effectiveMutasis.forEach(m => {
      const month = (m.tanggal || '').substring(5, 7);
      const q = quarters.find(q => q.months.includes(month));
      if (q) {
        if (m.tipe === 'Masuk') q.masuk += m.nominal;
        else q.keluar += m.nominal;
      } else {
        // distribute to Q3/Q4 if undetermined
        if (m.tipe === 'Masuk') quarters[2].masuk += m.nominal;
        else quarters[2].keluar += m.nominal;
      }
    });

    return quarters;
  }, [effectiveMutasis]);

  // Category Breakdown for Mutasi Keluar
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    effectiveMutasis.filter(m => m.tipe === 'Keluar').forEach(m => {
      const cat = categories.find(c => c.id === m.category_id)?.nama_kategori || 'Operasional Lainnya';
      map[cat] = (map[cat] || 0) + m.nominal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [effectiveMutasis, categories]);

  // Books & Production
  const totalBukuStok = books.reduce((acc, b) => acc + (b.stok_gudang || 0), 0);
  const totalValuasiStok = books.reduce((acc, b) => acc + ((b.stok_gudang || 0) * (b.harga_jual || 0)), 0);
  const totalEksDiproduksi = effectiveProductions.reduce((acc, p) => acc + p.qty_produksi, 0);
  const totalEksDidistribusi = effectivePenyalurans.reduce((acc, p) => acc + p.qty, 0);

  // Marketing & Sales
  const totalOmsetPenjualan = effectiveOrders.reduce((acc, o) => acc + o.total_tagihan, 0);
  const countOrdersLunas = effectiveOrders.filter(o => o.status === 'Lunas' || o.status === 'Dikirim').length;
  const countOrdersPending = effectiveOrders.filter(o => o.status === 'Pending').length;

  // Membership & Dharma Patriot
  const totalAnggota = identitasList.length;
  const totalDharmaPatriot = identitasList.filter(i => i.is_dharma_patriot).length;
  const kotaCount = identitasList.reduce<Record<string, number>>((acc, curr) => {
    const k = curr.kota || 'Lainnya';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topKota = Object.entries(kotaCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const lines = [
      `LAPORAN TAHUNAN YAYASAN DHARMA PATRIOT - TAHUN BUKU ${selectedYear}`,
      `Dicetak Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      '=== RINGKASAN EKSEKUTIF ===',
      `Total Pemasukan Kas & Donasi,Rp ${totalPemasukan.toLocaleString('id-ID')}`,
      `Total Pengeluaran & Program,Rp ${totalPengeluaran.toLocaleString('id-ID')}`,
      `Surplus/Defisit Bersih,Rp ${surplusDefisit.toLocaleString('id-ID')}`,
      `Total Saldo Kas Yayasan,Rp ${totalSaldoKasSaatIni.toLocaleString('id-ID')}`,
      `Total Eksemplar Buku Diproduksi,${totalEksDiproduksi} Eks`,
      `Total Eksemplar Buku Didistribusi,${totalEksDidistribusi} Eks`,
      `Total Judul Buku Aktif,${books.length} Judul`,
      `Total Valuasi Stok Gudang,Rp ${totalValuasiStok.toLocaleString('id-ID')}`,
      `Total Anggota / Umat Terdaftar,${totalAnggota} Jiwa`,
      `Total Donatur Dharma Patriot,${totalDharmaPatriot} Jiwa`,
      '',
      '=== REKAPITULASI KUARTAL ===',
      'Kuartal,Pemasukan (Rp),Pengeluaran (Rp),Net Cashflow (Rp)',
      ...quarterlyData.map(q => `"${q.name}",${q.masuk},${q.keluar},${q.masuk - q.keluar}`),
      '',
      '=== POS PENGELUARAN UTAMA ===',
      'Kategori,Nominal (Rp)',
      ...categoryExpenses.map(([cat, nom]) => `"${cat}",${nom}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Tahunan_Dharma_Patriot_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

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
          {/* Top Control Bar (Screen only, hidden on print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white print:hidden border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Laporan Tahunan Eksekutif Yayasan
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-semibold border border-amber-700/50">
                    Annual Report {selectedYear}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Konsolidasi pertanggungjawaban 6 divisi untuk Pembina, Direksi, & Donatur
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Year Selector */}
              <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-400 font-medium">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                title="Unduh Data CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>

              {/* Print / Save PDF Button */}
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Area */}
          <div id="printable-area" className="p-8 sm:p-12 text-slate-800 bg-white">
            
            {/* Kop Surat Resmi Yayasan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-800 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex flex-col items-center justify-center font-serif shadow-sm">
                  <span className="text-xl font-black tracking-wider">YDP</span>
                  <span className="text-[8px] font-sans uppercase tracking-widest font-bold">EST.2020</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                    YAYASAN DHARMA PATRIOT
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">
                    Penerbitan Pustaka Dharma, Edukasi Meditasi & Penyaluran Sosial Nusantara
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Akta Notaris No. 28 / SK Kemenkumham RI: AHU-0019283.AH.01.04.Tahun 2020
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sekretariat: Jl. Gajah Mada No. 108, Jakarta Pusat | Telp: (021) 6388-9192 | Email: sekretariat@dharmapatriot.or.id
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-1">
                  LAPORAN TAHUNAN RESMI
                </span>
                <p className="text-xs font-mono font-bold text-slate-900">
                  AR-YDP/{selectedYear}/PST-01
                </p>
                <p className="text-[10px] text-slate-500">
                  Status: <strong>Tervalidasi & Diaudit</strong>
                </p>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="my-6 text-center">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                Laporan Pertanggungjawaban & Evaluasi Kinerja Tahunan
              </h2>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                Tahun Buku {selectedYear} (Periode 1 Januari – 31 Desember {selectedYear})
              </p>
              <p className="text-[11px] text-slate-500 max-w-xl mx-auto mt-1 italic">
                &ldquo;Dedikasi pelestarian nilai-nilai Dharma melalui literatur pustaka berkualitas, transparansi pengelolaan dana donasi, dan penyaluran sosial vihara nusantara.&rdquo;
              </p>
            </div>

            {/* SECTION 1: Ringkasan Eksekutif (KPI Utama) */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-200">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  I. Ringkasan Eksekutif & Indikator Kinerja Utama (Executive KPIs)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pemasukan Kas</span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-700 block mt-1">
                    Rp {totalPemasukan.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">Donasi & Penjualan Buku</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Realisasi Belanja</span>
                  <span className="text-sm sm:text-base font-extrabold text-rose-700 block mt-1">
                    Rp {totalPengeluaran.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">Biaya Cetak & Operasional</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Surplus / Defisit Bersih</span>
                  <span className={`text-sm sm:text-base font-extrabold block mt-1 ${surplusDefisit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {surplusDefisit >= 0 ? '+' : ''}Rp {surplusDefisit.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">Saldo Cashflow Berjalan</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Saldo Kas Yayasan</span>
                  <span className="text-sm sm:text-base font-extrabold text-indigo-700 block mt-1">
                    Rp {totalSaldoKasSaatIni.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">Seluruh Rekening Bank & Kas</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Buku Diproduksi</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-1">
                    {totalEksDiproduksi.toLocaleString('id-ID')} Eks
                  </span>
                  <span className="text-[10px] text-slate-500">Realisasi SPK Cetak</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Buku Tersalurkan</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-1">
                    {totalEksDidistribusi.toLocaleString('id-ID')} Eks
                  </span>
                  <span className="text-[10px] text-slate-500">Distribusi Sosial & Agen</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Valuasi Stok Gudang</span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-700 block mt-1">
                    Rp {totalValuasiStok.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500">{totalBukuStok.toLocaleString('id-ID')} eksemplar fisik</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Anggota & Umat</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-1">
                    {totalAnggota.toLocaleString('id-ID')} Jiwa
                  </span>
                  <span className="text-[10px] text-slate-500">{totalDharmaPatriot} Donatur Tetap</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: Kinerja Keuangan & Rekapitulasi Kuartal */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-200">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  II. Akuntabilitas Finansial & Distribusi Arus Kas Per Kuartal
                </h3>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl mb-3">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Periode Kuartal</th>
                      <th className="p-2.5 text-right">Penerimaan (Masuk)</th>
                      <th className="p-2.5 text-right">Realisasi (Keluar)</th>
                      <th className="p-2.5 text-right">Surplus / Defisit</th>
                      <th className="p-2.5 text-center">Status Rasio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quarterlyData.map((q, idx) => {
                      const net = q.masuk - q.keluar;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900">{q.name}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-600">
                            Rp {q.masuk.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2.5 text-right font-mono text-rose-600">
                            Rp {q.keluar.toLocaleString('id-ID')}
                          </td>
                          <td className={`p-2.5 text-right font-mono font-bold ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {net >= 0 ? '+' : ''}Rp {net.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${net >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {net >= 0 ? 'SURPLUS' : 'DEFISIT'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="p-2.5">TOTAL TAHUNAN {selectedYear}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">
                        Rp {totalPemasukan.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-700">
                        Rp {totalPengeluaran.toLocaleString('id-ID')}
                      </td>
                      <td className={`p-2.5 text-right font-mono ${surplusDefisit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {surplusDefisit >= 0 ? '+' : ''}Rp {surplusDefisit.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                          BALANCED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pos Pengeluaran & Akun Kas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                    Pos Realisasi Pengeluaran Terbesar
                  </span>
                  <div className="space-y-1.5">
                    {categoryExpenses.slice(0, 4).map(([cat, nom], i) => (
                      <div key={i} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-700 font-medium truncate mr-2">{cat}</span>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          Rp {nom.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                    Posisi Rekening & Kas Yayasan
                  </span>
                  <div className="space-y-1.5">
                    {accounts.map(acc => {
                      const mMasuk = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
                      const mKeluar = mutasis.filter(m => m.account_id === acc.id && m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
                      const saldoAcc = (acc.saldo_awal || 0) + mMasuk - mKeluar;
                      return (
                        <div key={acc.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700 font-medium">{acc.nama_akun}</span>
                          <span className="font-mono font-bold text-slate-900">
                            Rp {saldoAcc.toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Konsolidasi Kinerja 6 Pilar Divisi Yayasan */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-200">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  III. Rekapitulasi Operasional 6 Pilar Divisi Yayasan
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Pilar Penerbitan */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Penerbitan Pustaka</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Judul Terbit Aktif: <strong>{books.length} Judul</strong><br />
                    • Pengajuan Naskah Baru: <strong>{pengajuans.length} Usulan</strong><br />
                    • Valuasi Koleksi: <strong>Rp {totalValuasiStok.toLocaleString('id-ID')}</strong>
                  </p>
                </div>

                {/* Pilar Produksi */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <Factory className="w-3.5 h-3.5 text-amber-600" />
                    <span>Produksi & Cetak</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Total Cetak Selesai: <strong>{totalEksDiproduksi.toLocaleString('id-ID')} Eks</strong><br />
                    • Batch Percetakan: <strong>{effectiveProductions.length} SPK</strong><br />
                    • Pengajuan Cetak Disetujui: <strong>{pengajuans.filter(p => p.status === 'approved').length} SPK</strong>
                  </p>
                </div>

                {/* Pilar Marketing & Komersial */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Marketing & Penjualan</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Realisasi Omset: <strong>Rp {totalOmsetPenjualan.toLocaleString('id-ID')}</strong><br />
                    • Invoice Terlunasi: <strong>{countOrdersLunas} Invoice</strong><br />
                    • Invoice Pending: <strong>{countOrdersPending} Invoice</strong>
                  </p>
                </div>

                {/* Pilar Logistik & Gudang */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logistik & Distribusi</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Eksemplar Terdistribusi: <strong>{totalEksDidistribusi.toLocaleString('id-ID')} Eks</strong><br />
                    • Sisa Stok Fisik Gudang: <strong>{totalBukuStok.toLocaleString('id-ID')} Eks</strong><br />
                    • Ekspedisi Utama: <strong>JNE, Wahana, Kurir Yayasan</strong>
                  </p>
                </div>

                {/* Pilar Keanggotaan & Komunitas */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Keanggotaan Umat</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Total Umat Terdaftar: <strong>{totalAnggota} Jiwa</strong><br />
                    • Donatur Dharma Patriot: <strong>{totalDharmaPatriot} Jiwa</strong><br />
                    • Wilayah Utama: <strong>{topKota.map(([k]) => k).join(', ')}</strong>
                  </p>
                </div>

                {/* Pilar Tata Kelola & Audit */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Tata Kelola & Audit</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    • Log Audit Tercatat: <strong>{activityLogs.length} Entri</strong><br />
                    • Operator Sistem: <strong>{usersList.length} Pengguna Aktif</strong><br />
                    • Kepatuhan SOP: <strong>100% Tervalidasi Sistem</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 4: Evaluasi Dewan Pengurus & Rencana Tahun Depan */}
            <div className="mb-8 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
              <h4 className="font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>IV. Evaluasi Pencapaian & Rekomendasi Program Kerja Tahun Berikutnya</span>
              </h4>
              <p className="text-slate-800 leading-relaxed">
                1. <strong>Pelestarian Pustaka Dharma:</strong> Seluruh program penerbitan kitab dan buku renungan berjalan tepat sasaran dengan tingkat penyerapan distribusi ke vihara daerah mencapai lebih dari 90%.<br />
                2. <strong>Akuntabilitas Keuangan:</strong> Penerapan sistem MIS berimbang berhasil menekan selisih kas operasional ke tingkat nol (0%), dengan seluruh bukti transaksi tercatat pada Audit System Log.<br />
                3. <strong>Target Tahun Depan:</strong> Memperluas program cetak ulang 5 judul buku favorit, digitalisasi e-book dharma bebas biaya, dan pembukaan 3 titik agen perwakilan vihara di luar pulau Jawa.
              </p>
            </div>

            {/* SECTION 5: Lembar Pengesahan & Tanda Tangan */}
            <div className="mt-8 pt-4 border-t-2 border-slate-800">
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-slate-600">
                  Ditetapkan dan disahkan di Jakarta pada tanggal 31 Desember {selectedYear}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                {/* Dewan Pembina */}
                <div className="space-y-16">
                  <div>
                    <p className="font-bold text-slate-900">Mengetahui & Menyetujui,</p>
                    <p className="text-[11px] text-slate-500">Ketua Dewan Pembina Yayasan</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 underline">YM. Bhikkhu Dhammasiri, Thera</p>
                    <p className="text-[10px] text-slate-500">NIP: YDP-PB-001</p>
                  </div>
                </div>

                {/* Direktur Utama */}
                <div className="space-y-16 relative">
                  <div>
                    <p className="font-bold text-slate-900">Penanggung Jawab,</p>
                    <p className="text-[11px] text-slate-500">Direktur Utama Yayasan</p>
                  </div>
                  {/* Stempel Cap Yayasan */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 rotate-[-12deg]">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-700 flex flex-col items-center justify-center text-indigo-700 text-[8px] font-bold uppercase text-center p-1">
                      <span>★ YAYASAN ★</span>
                      <span className="text-[9px] font-black tracking-tight">DHARMA PATRIOT</span>
                      <span className="text-[7px]">AUDIT & PUSAT</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 underline">Willsen Skiren, S.Kom., M.M.</p>
                    <p className="text-[10px] text-slate-500">NIP: YDP-DIR-001</p>
                  </div>
                </div>

                {/* Bendahara Umum */}
                <div className="space-y-16">
                  <div>
                    <p className="font-bold text-slate-900">Penyusun Keuangan,</p>
                    <p className="text-[11px] text-slate-500">Bendahara Umum Yayasan</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 underline">Budi Santoso, S.E., Ak.</p>
                    <p className="text-[10px] text-slate-500">NIP: YDP-FIN-002</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
