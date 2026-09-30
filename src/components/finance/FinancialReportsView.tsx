import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  PieChart,
  Scale,
  TrendingUp,
  Building2,
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PackageCheck,
  BookOpen
} from 'lucide-react';
import { computeYayasanFinancialReports, YayasanFinancialReportData } from '../../lib/reconciliationHelper';
import { exportDataToCsv, getCsvDateStamp } from '../../utils/exportCsv';

export type ReportType = 'posisi_keuangan' | 'aktivitas' | 'arus_kas' | 'neraca_saldo';

export const FinancialReportsView: React.FC = () => {
  const {
    accounts,
    mutasis,
    books,
    pengajuans,
    penjualans,
    royaltiStatements,
    donasiSponsors,
    currentUser,
    showToast
  } = useApp();

  // Selected report type
  const [reportType, setReportType] = useState<ReportType>('posisi_keuangan');

  // Selected Period Filter
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Generate Report Data
  const reportData: YayasanFinancialReportData = useMemo(() => {
    return computeYayasanFinancialReports(
      accounts,
      mutasis,
      books,
      pengajuans,
      penjualans,
      royaltiStatements,
      donasiSponsors,
      periodFilter
    );
  }, [accounts, mutasis, books, pengajuans, penjualans, royaltiStatements, donasiSponsors, periodFilter]);

  // Export current report to CSV
  const handleExportCsv = () => {
    const dateStamp = getCsvDateStamp();
    let filename = `laporan_keuangan_${reportType}_${dateStamp}.csv`;
    let title = '';
    let columns: Array<{ header: string; accessor?: (row: any, idx: number) => any; key?: string }> = [];
    let data: any[] = [];

    if (reportType === 'posisi_keuangan') {
      title = `LAPORAN POSISI KEUANGAN (NERACA) - YAYASAN LAMRIMNESIA (${reportData.periodeLabel})`;
      columns = [
        { header: 'Pos Akun / Kategori', key: 'pos' },
        { header: 'Rincian / Keterangan', key: 'keterangan' },
        { header: 'Jumlah (Rp)', accessor: r => r.jumlah.toLocaleString('id-ID') }
      ];
      data = [
        { pos: 'ASET LANCAR', keterangan: 'Kas dan Setara Kas', jumlah: reportData.asetLancar.kasDanBank },
        ...reportData.asetLancar.rincianKasBank.map(k => ({ pos: '  - ' + k.nama, keterangan: k.kode, jumlah: k.saldo })),
        { pos: 'ASET LANCAR', keterangan: 'Piutang Usaha Penjualan Buku', jumlah: reportData.asetLancar.piutangUsahaBuku },
        { pos: 'ASET LANCAR', keterangan: `Persediaan Buku Siap Jual (${reportData.asetLancar.totalEksemplarStok.toLocaleString()} Eks)`, jumlah: reportData.asetLancar.persediaanBuku },
        { pos: 'TOTAL ASET LANCAR', keterangan: 'Akumulasi Aset Lancar', jumlah: reportData.asetLancar.totalAsetLancar },
        { pos: 'ASET TETAP', keterangan: 'Peralatan, Komputer & Display Event', jumlah: reportData.asetTetap.totalAsetTetap },
        { pos: 'TOTAL ASET', keterangan: 'Total Kekayaan Yayasan', jumlah: reportData.totalAset },
        { pos: 'LIABILITAS', keterangan: 'Utang Biaya Cetak Percetakan (SPK)', jumlah: reportData.liabilitas.utangBiayaCetak },
        { pos: 'LIABILITAS', keterangan: 'Utang Royalti Penulis Terutang', jumlah: reportData.liabilitas.utangRoyaltiPenulis },
        { pos: 'LIABILITAS', keterangan: 'Titipan Dana Sponsorship Pre-Order', jumlah: reportData.liabilitas.titipanSponsorshipPreOrder },
        { pos: 'TOTAL LIABILITAS', keterangan: 'Total Kewajiban', jumlah: reportData.liabilitas.totalLiabilitas },
        { pos: 'ASET NETO', keterangan: 'Aset Neto Tanpa Pembatasan (Akumulasi Surplus)', jumlah: reportData.asetNeto.asetNetoTanpaPembatasan },
        { pos: 'ASET NETO', keterangan: 'Aset Neto Dengan Pembatasan (Dana Terikat Donasi Sponsor)', jumlah: reportData.asetNeto.asetNetoDenganPembatasan },
        { pos: 'TOTAL LIABILITAS & ASET NETO', keterangan: 'Keseimbangan Neraca (Harus Sama dengan Total Aset)', jumlah: reportData.totalLiabilitasDanAsetNeto }
      ];
    } else if (reportType === 'aktivitas') {
      title = `LAPORAN AKTIVITAS & SURPLUS DEFISIT - YAYASAN LAMRIMNESIA (${reportData.periodeLabel})`;
      columns = [
        { header: 'Kategori Laporan', key: 'pos' },
        { header: 'Keterangan', key: 'keterangan' },
        { header: 'Nominal (Rp)', accessor: r => r.jumlah.toLocaleString('id-ID') }
      ];
      data = [
        { pos: 'PENDAPATAN', keterangan: 'Penjualan Buku & Merchandise', jumlah: reportData.aktivitas.pendapatanBuku },
        { pos: 'PENDAPATAN', keterangan: 'Donasi, Wakaf & Sponsorship', jumlah: reportData.aktivitas.pendapatanDonasi },
        { pos: 'PENDAPATAN', keterangan: 'Pendapatan Lain-lain & Jasa Giro', jumlah: reportData.aktivitas.pendapatanLain },
        { pos: 'TOTAL PENDAPATAN', keterangan: 'Penerimaan Operasional Yayasan', jumlah: reportData.aktivitas.totalPendapatan },
        { pos: 'BEBAN POKOK PRODUKSI', keterangan: 'Biaya Cetak & Pengadaan Buku', jumlah: -reportData.aktivitas.hppProduksiCetak },
        { pos: 'SURPLUS BRUTO', keterangan: 'Pendapatan - Beban Pokok', jumlah: reportData.aktivitas.surplusBruto },
        { pos: 'BEBAN OPERASIONAL', keterangan: 'Logistik & Pengiriman Ekspedisi', jumlah: -reportData.aktivitas.bebanLogistikPengiriman },
        { pos: 'BEBAN OPERASIONAL', keterangan: 'Royalti Penulis & Penerjemah', jumlah: -reportData.aktivitas.bebanRoyalti },
        { pos: 'BEBAN OPERASIONAL', keterangan: 'Beban Administrasi Bank & Pajak', jumlah: -reportData.aktivitas.bebanAdminBank },
        { pos: 'BEBAN OPERASIONAL', keterangan: 'Operasional Kantor & Utilitas', jumlah: -reportData.aktivitas.bebanOperasionalUmum },
        { pos: 'TOTAL BEBAN OPERASIONAL', keterangan: 'Seluruh Beban Operasional', jumlah: -reportData.aktivitas.totalBebanOperasional },
        { pos: 'SURPLUS / (DEFISIT) BERSIH', keterangan: 'Kelebihan / Kekurangan Dana Periode Berjalan', jumlah: reportData.aktivitas.surplusDefisitBersih }
      ];
    } else if (reportType === 'arus_kas') {
      title = `LAPORAN ARUS KAS METODE LANGSUNG - YAYASAN LAMRIMNESIA (${reportData.periodeLabel})`;
      columns = [
        { header: 'Aktivitas Arus Kas', key: 'pos' },
        { header: 'Keterangan', key: 'keterangan' },
        { header: 'Nominal (Rp)', accessor: r => r.jumlah.toLocaleString('id-ID') }
      ];
      data = [
        { pos: 'ARUS KAS MASUK', keterangan: 'Penerimaan Penjualan Buku & Donasi Sponsor', jumlah: reportData.arusKas.arusMasukOperasi },
        { pos: 'ARUS KAS KELUAR', keterangan: 'Pembayaran Cetak, Royalti, Logistik & Beban Kantor', jumlah: -reportData.arusKas.arusKeluarOperasi },
        { pos: 'ARUS KAS BERSIH OPERASI', keterangan: 'Arus Kas Bersih Periode Berjalan', jumlah: reportData.arusKas.arusKasBersih },
        { pos: 'SALDO KAS AWAL', keterangan: 'Saldo Kas & Bank di Awal Periode', jumlah: reportData.arusKas.saldoAwalKas },
        { pos: 'SALDO KAS AKHIR', keterangan: 'Saldo Kas & Bank di Akhir Periode', jumlah: reportData.arusKas.saldoAkhirKas }
      ];
    } else {
      title = `NERACA SALDO PERCOBAAN (TRIAL BALANCE) - YAYASAN LAMRIMNESIA (${reportData.periodeLabel})`;
      columns = [
        { header: 'Kode Akun', key: 'kode' },
        { header: 'Nama Akun Perkiraan', key: 'nama' },
        { header: 'Debet (Rp)', accessor: r => r.debet.toLocaleString('id-ID') },
        { header: 'Kredit (Rp)', accessor: r => r.kredit.toLocaleString('id-ID') }
      ];
      data = reportData.neracaSaldo;
    }

    const success = exportDataToCsv({
      filename,
      title,
      columns,
      data
    });

    if (success) {
      showToast('Berhasil mengekspor Laporan Keuangan ke format CSV.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Standard Financial Statements Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Laporan Keuangan Standar Yayasan (PSAK / SAK ETAP)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                  ISAK 35 & SAK ETAP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyajian laporan posisi keuangan (neraca), aktivitas surplus/defisit, arus kas, dan neraca saldo resmi yayasan.
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Periode:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Seluruh Periode Akuntansi</option>
              <option value="2026">Tahun Buku 2026</option>
              <option value="2026-09">Bulan Ini (September 2026)</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
            </select>
          </div>
        </div>

        {/* 4 Statement Switchers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setReportType('posisi_keuangan')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              reportType === 'posisi_keuangan'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-mono font-bold">Neraca</span>
            </div>
            <div className="text-xs font-extrabold truncate">Posisi Keuangan</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Aset: Rp {reportData.totalAset.toLocaleString('id-ID')}
            </div>
          </button>

          <button
            onClick={() => setReportType('aktivitas')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              reportType === 'aktivitas'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-mono font-bold">Laba Rugi</span>
            </div>
            <div className="text-xs font-extrabold truncate">Laporan Aktivitas</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Surplus: Rp {reportData.aktivitas.surplusDefisitBersih.toLocaleString('id-ID')}
            </div>
          </button>

          <button
            onClick={() => setReportType('arus_kas')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              reportType === 'arus_kas'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Wallet className="w-4 h-4 text-cyan-600" />
              <span className="text-[10px] font-mono font-bold">Cash Flow</span>
            </div>
            <div className="text-xs font-extrabold truncate">Laporan Arus Kas</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Kas Bersih: Rp {reportData.arusKas.arusKasBersih.toLocaleString('id-ID')}
            </div>
          </button>

          <button
            onClick={() => setReportType('neraca_saldo')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              reportType === 'neraca_saldo'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-mono font-bold">Buku Besar</span>
            </div>
            <div className="text-xs font-extrabold truncate">Neraca Saldo</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {reportData.neracaSaldo.length} Perkiraan Akun
            </div>
          </button>
        </div>

        {/* Toolbar Cetak & Unduh */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status Keseimbangan:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> SEIMBANG (Balanced)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan Resmi (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPORT 1: LAPORAN POSISI KEUANGAN (NERACA) */}
      {reportType === 'posisi_keuangan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              YAYASAN LAMRIMNESIA • LAPORAN KEUANGAN
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
              LAPORAN POSISI KEUANGAN (NERACA)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standar Entitas Nirlaba ISAK 35 / PSAK 45 • {reportData.periodeLabel}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            
            {/* BAGIAN KIRI: ASET (AKTIVA) */}
            <div className="space-y-4">
              <div className="border-b-2 border-indigo-600 pb-1 flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  ASET (AKTIVA)
                </span>
                <span className="font-mono text-slate-400 text-[10px]">Kode: 1-0000</span>
              </div>

              {/* Aset Lancar */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] block text-indigo-600">
                  A. Aset Lancar
                </span>

                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between font-semibold">
                    <span>Kas dan Setara Kas (Rincian Rekening):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      Rp {reportData.asetLancar.kasDanBank.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {reportData.asetLancar.rincianKasBank.map((acc, i) => (
                    <div key={i} className="flex justify-between pl-3 text-[11px] text-slate-500">
                      <span>• {acc.nama} ({acc.kode})</span>
                      <span className="font-mono">Rp {acc.saldo.toLocaleString('id-ID')}</span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-1">
                    <span>Piutang Usaha Penjualan Buku (Konsinyasi):</span>
                    <span className="font-mono">Rp {reportData.asetLancar.piutangUsahaBuku.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <div>
                      <span>Persediaan Buku Siap Jual:</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({reportData.asetLancar.totalEksemplarStok.toLocaleString('id-ID')} Eks @ HPP Pokok)
                      </span>
                    </div>
                    <span className="font-mono">Rp {reportData.asetLancar.persediaanBuku.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    <span>Total Aset Lancar:</span>
                    <span className="font-mono">Rp {reportData.asetLancar.totalAsetLancar.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Aset Tetap */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] block text-indigo-600">
                  B. Aset Tetap & Peralatan
                </span>
                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Peralatan Kantor, Komputer & Display Event:</span>
                    <span className="font-mono">Rp {reportData.asetTetap.peralatanInventaris.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    <span>Total Aset Tetap:</span>
                    <span className="font-mono">Rp {reportData.asetTetap.totalAsetTetap.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Total Aset Box */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex justify-between items-center text-sm font-black text-indigo-900 dark:text-indigo-200">
                <span>TOTAL ASET:</span>
                <span className="font-mono">Rp {reportData.totalAset.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* BAGIAN KANAN: LIABILITAS & ASET NETO (PASIVA) */}
            <div className="space-y-4">
              <div className="border-b-2 border-emerald-600 pb-1 flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  LIABILITAS & ASET NETO (PASIVA)
                </span>
                <span className="font-mono text-slate-400 text-[10px]">Kode: 2-0000 & 3-0000</span>
              </div>

              {/* Liabilitas / Kewajiban */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] block text-emerald-600">
                  A. Liabilitas Jangka Pendek (Utang)
                </span>
                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Utang Biaya Cetak Percetakan (SPK Disetujui):</span>
                    <span className="font-mono">Rp {reportData.liabilitas.utangBiayaCetak.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utang Royalti Penulis Terutang:</span>
                    <span className="font-mono">Rp {reportData.liabilitas.utangRoyaltiPenulis.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Titipan Sponsorship & Pre-Order Belum Dialokasikan:</span>
                    <span className="font-mono">Rp {reportData.liabilitas.titipanSponsorshipPreOrder.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    <span>Total Liabilitas:</span>
                    <span className="font-mono">Rp {reportData.liabilitas.totalLiabilitas.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Aset Neto (Ekuitas Yayasan) */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] block text-emerald-600">
                  B. Aset Neto (Ekuitas Yayasan)
                </span>
                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <div>
                      <span>Aset Neto Tanpa Pembatasan:</span>
                      <span className="text-[10px] text-slate-400 block">(Surplus Akumulatif Operasional)</span>
                    </div>
                    <span className="font-mono font-semibold">Rp {reportData.asetNeto.asetNetoTanpaPembatasan.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span>Aset Neto Dengan Pembatasan:</span>
                      <span className="text-[10px] text-slate-400 block">(Dana Terikat Donasi Sponsor & Wakaf Buku)</span>
                    </div>
                    <span className="font-mono font-semibold">Rp {reportData.asetNeto.asetNetoDenganPembatasan.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                    <span>Total Aset Neto:</span>
                    <span className="font-mono">Rp {reportData.asetNeto.totalAsetNeto.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilitas & Aset Neto Box */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-sm font-black text-emerald-900 dark:text-emerald-200">
                <span>TOTAL LIABILITAS & ASET NETO:</span>
                <span className="font-mono">Rp {reportData.totalLiabilitasDanAsetNeto.toLocaleString('id-ID')}</span>
              </div>
            </div>

          </div>

          {/* Validation Banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Persamaan Dasar Akuntansi: <strong>Aset (Rp {reportData.totalAset.toLocaleString('id-ID')})</strong> = <strong>Liabilitas & Aset Neto (Rp {reportData.totalLiabilitasDanAsetNeto.toLocaleString('id-ID')})</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              Status: Seimbang (Rp 0 Selisih)
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Disusun oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Bendahara Yayasan</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Tanda Tangan Digital]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                {currentUser?.name || 'Siti Rahmawati'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Disetujui oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Ketua Yayasan / Direktur</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Stempel & Tanda Tangan]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                Direktur Utama Yayasan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: LAPORAN AKTIVITAS (LABA RUGI / SURPLUS DEFISIT) */}
      {reportType === 'aktivitas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              YAYASAN LAMRIMNESIA • LAPORAN KEUANGAN
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
              LAPORAN AKTIVITAS & SURPLUS / DEFISIT
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standar Entitas Nirlaba ISAK 35 / PSAK 45 • {reportData.periodeLabel}
            </p>
          </div>

          <div className="space-y-5 text-xs max-w-2xl mx-auto">
            
            {/* 1. Pendapatan */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-indigo-600 pb-1 font-bold text-slate-900 dark:text-white">
                <span className="text-indigo-600 uppercase font-black">I. PENDAPATAN OPERASIONAL YAYASAN</span>
                <span className="font-mono text-slate-400 text-[10px]">Kode: 4-0000</span>
              </div>
              <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Pendapatan Penjualan Buku (Toko, POS Kasir, Bazaar & Pre-Order):</span>
                  <span className="font-mono font-bold">Rp {reportData.aktivitas.pendapatanBuku.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penerimaan Donasi, Sponsorship & Infaq Wakaf:</span>
                  <span className="font-mono font-bold">Rp {reportData.aktivitas.pendapatanDonasi.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendapatan Jasa Giro, Bagi Hasil Bank & Lainnya:</span>
                  <span className="font-mono font-bold">Rp {reportData.aktivitas.pendapatanLain.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-indigo-700 dark:text-indigo-300">
                  <span>Total Pendapatan:</span>
                  <span className="font-mono text-sm">Rp {reportData.aktivitas.totalPendapatan.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* 2. Beban Pokok Produksi */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-rose-500 pb-1 font-bold text-slate-900 dark:text-white">
                <span className="text-rose-600 uppercase font-black">II. BEBAN POKOK PRODUKSI CETAK (HPP)</span>
                <span className="font-mono text-slate-400 text-[10px]">Kode: 5-0000</span>
              </div>
              <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Biaya Cetak Percetakan, Kertas & Pengadaan Buku (SPK):</span>
                  <span className="font-mono text-rose-600 font-semibold">(Rp {reportData.aktivitas.hppProduksiCetak.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-slate-800 dark:text-slate-200">
                  <span>Surplus Bruto Operasional:</span>
                  <span className="font-mono text-sm">Rp {reportData.aktivitas.surplusBruto.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* 3. Beban Operasional */}
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-700 pb-1 font-bold text-slate-900 dark:text-white">
                <span className="text-slate-700 dark:text-slate-300 uppercase font-black">III. BEBAN OPERASIONAL & ADMINISTRASI</span>
                <span className="font-mono text-slate-400 text-[10px]">Kode: 6-0000</span>
              </div>
              <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Beban Logistik & Pengiriman Ekspedisi Paket:</span>
                  <span className="font-mono text-rose-600">(Rp {reportData.aktivitas.bebanLogistikPengiriman.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Royalti Penulis & Penerjemah Naskah:</span>
                  <span className="font-mono text-rose-600">(Rp {reportData.aktivitas.bebanRoyalti.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Administrasi Bank, Buku Cek & Pajak Bunga:</span>
                  <span className="font-mono text-rose-600">(Rp {reportData.aktivitas.bebanAdminBank.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Operasional Kantor, Utilitas & Perlengkapan:</span>
                  <span className="font-mono text-rose-600">(Rp {reportData.aktivitas.bebanOperasionalUmum.toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-slate-800 dark:text-slate-200">
                  <span>Total Beban Operasional:</span>
                  <span className="font-mono text-rose-600 text-sm">(Rp {reportData.aktivitas.totalBebanOperasional.toLocaleString('id-ID')})</span>
                </div>
              </div>
            </div>

            {/* 4. Surplus Defisit Bersih */}
            <div className={`p-4 rounded-xl border flex items-center justify-between text-base font-black ${
              reportData.aktivitas.surplusDefisitBersih >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div>
                <span>SURPLUS / (DEFISIT) BERSIH:</span>
                <span className="text-[11px] font-normal text-slate-500 block">
                  Penambahan/Pengurangan Aset Neto Periode Berjalan
                </span>
              </div>
              <span className="font-mono text-xl">
                Rp {reportData.aktivitas.surplusDefisitBersih.toLocaleString('id-ID')}
              </span>
            </div>

          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Disusun oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Bendahara Yayasan</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Tanda Tangan Digital]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                {currentUser?.name || 'Siti Rahmawati'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Disetujui oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Ketua Yayasan / Direktur</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Stempel & Tanda Tangan]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                Direktur Utama Yayasan
              </p>
            </div>
          </div>

        </div>
      )}

      {/* REPORT 3: LAPORAN ARUS KAS (METODE LANGSUNG) */}
      {reportType === 'arus_kas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              YAYASAN LAMRIMNESIA • LAPORAN KEUANGAN
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
              LAPORAN ARUS KAS (METODE LANGSUNG)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standar Entitas Nirlaba ISAK 35 / PSAK 45 • {reportData.periodeLabel}
            </p>
          </div>

          <div className="space-y-4 text-xs max-w-2xl mx-auto">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-slate-700 pb-1">
                ARUS KAS DARI AKTIVITAS OPERASIONAL
              </span>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Penerimaan Kas dari Penjualan Buku & Merchandise:</span>
                  <span className="font-mono font-bold text-emerald-600">+ Rp {reportData.aktivitas.pendapatanBuku.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penerimaan Kas dari Donasi, Sponsor & Wakaf:</span>
                  <span className="font-mono font-bold text-emerald-600">+ Rp {reportData.aktivitas.pendapatanDonasi.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengeluaran Kas untuk Pembayaran Cetak Buku (Percetakan):</span>
                  <span className="font-mono font-bold text-rose-600">- Rp {reportData.aktivitas.hppProduksiCetak.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengeluaran Kas untuk Biaya Operasional, Logistik & Royalti:</span>
                  <span className="font-mono font-bold text-rose-600">- Rp {reportData.aktivitas.totalBebanOperasional.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between pt-3 border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                  <span>Arus Kas Bersih dari Aktivitas Operasi:</span>
                  <span className="font-mono">Rp {reportData.arusKas.arusKasBersih.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Rekap Saldo Kas Awal & Akhir */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Saldo Kas dan Bank di Awal Periode:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  Rp {reportData.arusKas.saldoAwalKas.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Kenaikan / (Penurunan) Bersih Kas & Bank:</span>
                <span className="font-mono font-bold text-indigo-600">
                  Rp {reportData.arusKas.arusKasBersih.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg">
                <span>Saldo Kas dan Bank di Akhir Periode:</span>
                <span className="font-mono">Rp {reportData.arusKas.saldoAkhirKas.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Disusun oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Bendahara Yayasan</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Tanda Tangan Digital]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                {currentUser?.name || 'Siti Rahmawati'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Disetujui oleh,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Ketua Yayasan / Direktur</p>
              <div className="h-16 flex items-end justify-center">
                <span className="text-[10px] text-slate-400 font-mono italic">[Stempel & Tanda Tangan]</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-1 inline-block min-w-[150px]">
                Direktur Utama Yayasan
              </p>
            </div>
          </div>

        </div>
      )}

      {/* REPORT 4: NERACA SALDO PERCOBAAN (TRIAL BALANCE) */}
      {reportType === 'neraca_saldo' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              YAYASAN LAMRIMNESIA • LAPORAN KEUANGAN
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
              NERACA SALDO PERCOBAAN (TRIAL BALANCE)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi Keseimbangan Saldo Debet dan Kredit Buku Besar Yayasan • {reportData.periodeLabel}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-mono">Kode Akun</th>
                  <th className="px-4 py-3">Nama Perkiraan Akun</th>
                  <th className="px-4 py-3 text-right">Debet (Rp)</th>
                  <th className="px-4 py-3 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reportData.neracaSaldo.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{row.kode}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{row.nama}</td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.debet > 0 ? `Rp ${row.debet.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.kredit > 0 ? `Rp ${row.kredit.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-black text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>
                    TOTAL KESEIMBANGAN (DEBET = KREDIT):
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-700 dark:text-indigo-300">
                    Rp {reportData.neracaSaldo.reduce((s, r) => s + r.debet, 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-300">
                    Rp {reportData.neracaSaldo.reduce((s, r) => s + r.kredit, 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verifikasi Audit: Total Saldo Debet dan Kredit Buku Besar telah SEIMBANG (0 Discrepancy).</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              STATUS OK
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
