<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\Mutasi;
use App\Models\Category;
use App\Models\Invoice;
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

        // 1. Query Utama
        $query = Mutasi::with(['category', 'account'])->whereYear('tanggal', $tahun);
        if ($bulan) { $query->whereMonth('tanggal', $bulan); }

        $mutasis = $query->latest()->get();

        // Summary
        $totalMasuk = (clone $query)->where('tipe', 'Masuk')->sum('nominal');
        $totalKeluar = (clone $query)->where('tipe', 'Keluar')->sum('nominal');
        $total_saldo = $totalMasuk - $totalKeluar;

        // 2. LOGIC GRAFIK DINAMIS
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

        return view('pages.finance', compact(
            'accounts', 'categories', 'mutasis', 'totalMasuk', 'totalKeluar', 'total_saldo',
            'days', 'masukHarian', 'keluarHarian', 'tahun', 'bulan'
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

    // DELETE - Hapus Transaksi
    public function destroy($id) {
        Mutasi::findOrFail($id)->delete();
        return back()->with('success', 'Transaksi berhasil dihapus!');
    }

    // --- FITUR LAINNYA ---

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

        $pemasukanCategory = Category::where('nama_kategori', 'like', '%Penjualan%')
                            ->orWhere('nama_kategori', 'like', '%Invoice%')
                            ->first();

        Mutasi::create([
            'account_id'  => $request->account_id,
            'category_id' => $pemasukanCategory->id ?? null,
            'user_id'     => auth()->id(),
            'tipe'        => 'Masuk',
            'nominal'     => $nominal,
            'keterangan'  => 'Terima Pembayaran #'.$invoice->no_invoice,
            'tanggal'     => now(),
            'jenis'       => 'INVOICE'
        ]);

        $invoice->update(['tercatat_finance' => 1]);
        return redirect()->route('finance.index')->with('success', 'Pembayaran Berhasil Masuk!');
    }

    public function downloadReport(Request $request)
{
    $bulan = $request->query('bulan');
    $tahun = $request->query('tahun', date('Y'));

    $query = Mutasi::with(['category', 'account']);

    if ($bulan) {
        $query->whereMonth('tanggal', $bulan);
    }
    $query->whereYear('tanggal', $tahun);

    $mutasis = $query->orderBy('tanggal', 'desc')->get();

    // Hitung total untuk summary di PDF
    $totalMasuk = $mutasis->where('tipe', 'Masuk')->sum('nominal');
    $totalKeluar = $mutasis->where('tipe', 'Keluar')->sum('nominal');
    $saldo = $totalMasuk - $totalKeluar;

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pages.finance_pdf', [
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

}
