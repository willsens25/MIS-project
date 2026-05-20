<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\Mutasi;
use App\Models\Category;
use App\Models\Invoice;
use App\Models\PengajuanCetak;
use App\Models\Book;
use App\Models\Penjualan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->get('tahun', date('Y'));
        $bulan = $request->has('bulan') && $request->bulan != null ? (int) $request->bulan : null;

        $accounts = Account::all();
        $categories = Category::all();

        // 1. Query Utama Mutasi (Tetap hitung SEMUA termasuk INVOICE agar SALDO & GRAFIK akurat)
        $query = Mutasi::with(['category', 'account'])->whereYear('tanggal', $tahun);
        if ($bulan) { $query->whereMonth('tanggal', $bulan); }

        // Untuk list Riwayat Transaksi di view, kita FILTER hanya yang jenisnya MANUAL
        $mutasis = (clone $query)->where('jenis', 'MANUAL')->latest()->get();

        // Summary Keuangan (Tetap hitung total keseluruhan agar tidak selisih uang)
        $totalMasuk = (clone $query)->where('tipe', 'Masuk')->sum('nominal');
        $totalKeluar = (clone $query)->where('tipe', 'Keluar')->sum('nominal');
        $total_saldo = $totalMasuk - $totalKeluar;

        // 2. LOGIC GRAFIK DINAMIS (Menggunakan semua data agar grafik naik)
        $days = collect();
        $masukHarian = collect();
        $keluarHarian = collect();

        if ($bulan) {
            $jumlahHari = cal_days_in_month(CAL_GREGORIAN, $bulan, $tahun);
            $stats = Mutasi::whereYear('tanggal', $tahun)->whereMonth('tanggal', $bulan)
                ->selectRaw('DAY(tanggal) as tgl, tipe, SUM(nominal) as total')
                ->groupBy('tgl', 'tipe')->get()->groupBy('tgl');

            for ($d = 1; $d <= $jumlahHari; $d++) {
                $days->push($d);
                $dataTglIni = $stats->get($d) ?? collect();
                $masukHarian->push($dataTglIni->where('tipe', 'Masuk')->first()->total ?? 0);
                $keluarHarian->push($dataTglIni->where('tipe', 'Keluar')->first()->total ?? 0);
            }
        } else {
            $namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            $stats = Mutasi::whereYear('tanggal', $tahun)
                ->selectRaw('MONTH(tanggal) as bln, tipe, SUM(nominal) as total')
                ->groupBy('bln', 'tipe')->get()->groupBy('bln');

            for ($m = 1; $m <= 12; $m++) {
                $days->push($namaBulan[$m - 1]);
                $dataBulanIni = $stats->get($m) ?? collect();
                $masukHarian->push($dataBulanIni->where('tipe', 'Masuk')->first()->total ?? 0);
                $keluarHarian->push($dataBulanIni->where('tipe', 'Keluar')->first()->total ?? 0);
            }
        }

        // 3. Ambil data pengajuan cetak
        $pengajuans = PengajuanCetak::with('buku')->where('status', 'pending')->get();

        // 4. DATA REKAP PENJUALAN: Mengambil data gabungan operasional kasir + limpahan invoice
        $penjualans = Penjualan::orderBy('tanggal_penjualan', 'desc')->take(15)->get();

        return view('pages.finance', compact(
            'accounts', 'categories', 'mutasis', 'totalMasuk', 'totalKeluar', 'total_saldo',
            'days', 'masukHarian', 'keluarHarian', 'tahun', 'bulan', 'pengajuans', 'penjualans'
        ));
    }

    // CREATE - Simpan Transaksi Baru
    public function store_transaction(Request $request) {
        $nominalBersih = preg_replace('/[^0-9]/', '', $request->nominal);

        Mutasi::create([
            'account_id'  => $request->account_id,
            'category_id' => $request->category_id,
            'user_id'     => auth()->id(),
            'tipe'        => $request->tipe,
            'nominal'     => $nominalBersih,
            'keterangan'  => $request->keterangan,
            'tanggal'     => $request->tanggal ?? now(),
            'jenis'       => 'MANUAL',
        ]);

        return redirect()->back()->with('success', 'Transaksi berhasil disimpan!');
    }

    public function update(Request $request, $id) {
        $request->validate([
            'category_id' => 'required',
            'tipe'        => 'required',
            'nominal'     => 'required',
            'keterangan'  => 'required'
        ]);

        $nominalBersih = preg_replace('/[^0-9]/', '', $request->nominal);

        $mutasi = Mutasi::findOrFail($id);
        $mutasi->update([
            'category_id' => $request->category_id,
            'tipe'        => $request->tipe,
            'nominal'     => $nominalBersih,
            'keterangan'  => $request->keterangan,
        ]);

        return back()->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function destroy($id) {
        Mutasi::findOrFail($id)->delete();
        return back()->with('success', 'Transaksi berhasil dihapus!');
    }

    public function simpanAkun(Request $request) {
        $request->validate(['nama_akun' => 'required']);
        Account::create([
            'nama_akun'  => $request->nama_akun,
            'kode_akun'  => 'ACC-'.strtoupper(substr(uniqid(),-5)),
            'saldo_awal' => 0
        ]);
        return back()->with('success', 'Akun ditambahkan!');
    }

    public function konfirmasiInvoice(Request $request, $id) {
        $invoice = Invoice::findOrFail($id);
        $nominal = $invoice->total_tagihan;
        if (!$nominal || $nominal == 0) return back()->with('error', 'Gagal: Nominal Rp 0.');

        DB::beginTransaction();

        try {
            $pemasukanCategory = Category::where('nama_kategori', 'like', '%Penjualan%')
                                ->orWhere('nama_kategori', 'like', '%Invoice%')
                                ->first();

            // 1. Masuk ke database mutasi (Agar saldo & grafik bertambah)
            Mutasi::create([
                'account_id'  => $request->account_id,
                'category_id' => $pemasukanCategory->id ?? null,
                'user_id'     => auth()->id(),
                'tipe'        => 'Masuk',
                'nominal'     => $nominal,
                'keterangan'  => 'Terima Pembayaran #'.$invoice->no_invoice,
                'tanggal'     => now(),
                'jenis'       => 'INVOICE' // Ditandai INVOICE agar tidak lolos ke tabel riwayat harian
            ]);

            // 2. Masuk ke database rekap penjualan operasional
            Penjualan::create([
                'no_invoice'        => $invoice->no_invoice,
                'nama_pelanggan'    => $invoice->nama_pelanggan ?? 'Pelanggan Invoice #' . $invoice->no_invoice,
                'total_item'        => $invoice->total_item ?? 1,
                'total_bayar'       => $nominal,
                'tanggal_penjualan' => now(),
            ]);

            // Update Status Pelacakan Invoice
            $invoice->update(['tercatat_finance' => 1]);

            DB::commit();
            return redirect()->route('finance.index')->with('success', 'Invoice berhasil diproses ke rekap penjualan!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Gagal memproses pelunasan invoice: ' . $e->getMessage());
        }
    }

    public function downloadPdf(Request $request, $id = null)
    {
        return $this->downloadReport($request);
    }

    public function downloadReport(Request $request)
    {
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun', date('Y'));

        $query = Mutasi::with(['category', 'account']);

        if ($bulan) { $query->whereMonth('tanggal', $bulan); }
        $query->whereYear('tanggal', $tahun);

        $mutasis = $query->orderBy('tanggal', 'desc')->get();

        $totalMasuk = $mutasis->where('tipe', 'Masuk')->sum('nominal');
        $totalKeluar = $mutasis->where('tipe', 'Keluar')->sum('nominal');
        $saldo = $totalMasuk - $totalKeluar;

        $pdf = Pdf::loadView('pages.finance_pdf', [
            'mutasis' => $mutasis,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'totalMasuk' => $totalMasuk,
            'totalKeluar' => $totalKeluar,
            'saldo' => $saldo,
            'namaBulanIndo' => [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ]
        ]);

        return $pdf->stream("Laporan_Keuangan_{$bulan}_{$tahun}.pdf");
    }

    // --- INTEGRASI PENERBITAN (PNB) ---

    public function persetujuanCetak()
    {
        $pengajuans = \App\Models\PengajuanCetak::where('status', 'pending')->get();
        $accounts = \App\Models\Account::all();

        return view('pages.finance_persetujuan', compact('pengajuans', 'accounts'));
    }

    public function prosesCetak(Request $request, $id)
    {
        $pengajuan = PengajuanCetak::findOrFail($id);
        $buku = Book::findOrFail($pengajuan->buku_id);

        if ($request->aksi == 'setujui') {
            $biayaCetak = $pengajuan->jumlah_pengajuan * 20000;

            Mutasi::create([
                'account_id'  => $request->account_id,
                'category_id' => 2,
                'user_id'     => auth()->id(),
                'tipe'        => 'Keluar',
                'nominal'     => $biayaCetak,
                'keterangan'  => 'Biaya Cetak Ulang: ' . $buku->judul . ' (' . $pengajuan->jumlah_pengajuan . ' Eks)',
                'tanggal'     => now(),
                'jenis'       => 'MANUAL',
            ]);

            $buku->increment('stok_gudang', $pengajuan->jumlah_pengajuan);
            $pengajuan->update(['status' => 'approved']);

            return back()->with('success', 'Pengajuan disetujui, kas berkurang dan stok buku bertambah!');
        }

        $pengajuan->update([
            'status' => 'rejected',
            'catatan_bendahara' => $request->catatan
        ]);

        return back()->with('info', 'Pengajuan cetak ditolak.');
    }
}
