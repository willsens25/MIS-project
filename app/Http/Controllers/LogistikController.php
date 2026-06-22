<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Invoice;
use App\Models\Penyaluran;
use App\Models\LogisticLog;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class LogistikController extends Controller
{
    public function index()
    {
        $rawData = \App\Models\Penyaluran::with('book')
                    ->where('status', 'proses packing')
                    ->latest()
                    ->get();

        // 💡 Mengelompokkan antrean berdasarkan nomor invoice agar bersatu di view
        $pendingShipments = $rawData->groupBy('no_invoice');

        $books = \App\Models\Book::all();

        $logs = \App\Models\LogisticLog::with('book')
                ->whereDate('created_at', now()->toDateString())
                ->latest()
                ->get();

        $totalHariIni = \App\Models\LogisticLog::whereDate('created_at', now()->toDateString())
                        ->sum('qty_keluar');

        // 💡 Menyediakan array $stats agar sinkron dengan baris statistik di Blade
        $stats = [
            'total_keluar' => $totalHariIni
        ];

        return view('logistik.index', compact('pendingShipments', 'books', 'logs', 'totalHariIni', 'stats'));
    }

    public function siapPacking($id)
    {
        $invoice = Invoice::findOrFail($id);

        $invoice->update(['status_pengiriman' => 'proses packing']);

        \App\Models\Penyaluran::create([
            'no_invoice' => $invoice->no_invoice,
            'buku_id'    => $invoice->buku_id,
            'qty'        => $invoice->jumlah,
            'nama_agen'  => $invoice->nama_agen,
            'status'     => 'proses packing',
        ]);

        return redirect()->back()->with('success', 'Pesanan berhasil dikirim ke Logistik!');
    }

    public function kirimDariMarketing($no_invoice)
    {
        // 💡 Ambil seluruh item buku yang terikat ke nomor invoice ini
        $items = \App\Models\Penyaluran::with('book')
                    ->where('no_invoice', $no_invoice)
                    ->where('status', 'proses packing')
                    ->get();

        if ($items->isEmpty()) {
            return redirect()->back()->with('error', 'Data antrean invoice tidak ditemukan!');
        }

        return DB::transaction(function () use ($items, $no_invoice) {

            foreach ($items as $antrean) {
                $jumlahKeluar = $antrean->qty;
                $judulBuku = $antrean->book->judul ?? 'Buku ID: ' . $antrean->buku_id;

                // 1. Validasi kecukupan stok gudang untuk item ini sebelum diproses
                if ($antrean->book) {
                    if ($antrean->book->stok_gudang < $jumlahKeluar) {
                        throw new \Exception("Stok gudang untuk buku '{$judulBuku}' tidak mencukupi untuk memproses invoice ini!");
                    }
                    // Potong stok gudang secara otomatis
                    $antrean->book->decrement('stok_gudang', $jumlahKeluar);
                }

                // 2. Update status item penyaluran menjadi dikirim
                $antrean->update(['status' => 'dikirim']);

                // 3. Catat log keluar logistik untuk masing-masing item buku
                \App\Models\LogisticLog::create([
                    'buku_id'    => $antrean->buku_id,
                    'qty_keluar' => $jumlahKeluar,
                    'tujuan'     => $antrean->nama_agen ?? 'Marketing',
                ]);

                // 4. 📝 AUDIT LOG per item buku
                ActivityLog::record(
                    'Kirim Pesanan Marketing',
                    'Penyaluran',
                    'Memproses antrean logistik untuk Invoice #' . $antrean->no_invoice . '. Status diubah menjadi DIKIRIM. Barang: "' . $judulBuku . '" sejumlah ' . $jumlahKeluar . ' pcs ke penerima: ' . ($antrean->nama_agen ?? 'Marketing')
                );
            }

            return redirect()->route('logistik')->with('success', 'Seluruh barang di dalam Invoice #' . $no_invoice . ' berhasil dikirim!');
        });
    }

    public function simpanKeluar(Request $request)
    {
        $request->validate([
            'buku_id' => 'required',
            'jumlah' => 'required|numeric|min:1', // Mengubah 'qty_keluar' menjadi 'jumlah' menyesuaikan input Blade
            'tujuan' => 'required|string',
        ]);

        $buku = \App\Models\Book::findOrFail($request->buku_id);
        $qtyKeluar = $request->jumlah;

        if ($buku->stok_gudang < $qtyKeluar) {
            return redirect()->back()->with('error', 'Stok tidak mencukupi!');
        }

        $buku->decrement('stok_gudang', $qtyKeluar);

        $keteranganLog = $request->keterangan ?? 'Barang Keluar Manual';

        \App\Models\LogisticLog::create([
            'buku_id'    => $request->buku_id,
            'qty_keluar' => $qtyKeluar,
            'tujuan'     => $request->tujuan,
            'keterangan' => $keteranganLog,
        ]);

        // 📝 AUDIT LOG
        ActivityLog::record(
            'Pengeluaran Manual Gudang',
            'LogisticLog',
            'Mengeluarkan stok secara manual untuk buku "' . $buku->judul . '" sebanyak ' . $qtyKeluar . ' pcs. Penerima: ' . $request->tujuan
        );

        return redirect()->back()->with('success', 'Data pengeluaran berhasil disimpan.');
    }

    public function cetakSuratJalan($id)
    {
        // 1. Cari log transaksi acuan yang diklik oleh admin
        $mainLog = \App\Models\LogisticLog::findOrFail($id);

        // 2. Ambil seluruh buku yang keluar ke TUJUAN yang sama pada HARI yang sama
        $allLogs = \App\Models\LogisticLog::with(['book'])
                    ->where('tujuan', $mainLog->tujuan)
                    ->whereDate('created_at', $mainLog->created_at->toDateString())
                    ->get();

        // 3. 📝 AUDIT LOG Penggabungan
        ActivityLog::record(
            'Cetak Surat Jalan Massal',
            'LogisticLog',
            'Mencetak dokumen Surat Jalan gabungan untuk tujuan: ' . $mainLog->tujuan . ' berisi ' . $allLogs->count() . ' jenis buku.'
        );

        // 4. Kirim mainData (untuk info tujuan/waktu) dan items (kumpulan buku) ke file PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('logistik.cetak_surat_jalan', [
            'mainData' => $mainLog,
            'items'    => $allLogs
        ]);

        return $pdf->stream('Surat_Jalan_' . str_replace(' ', '_', $mainLog->tujuan) . '_' . date('Ymd') . '.pdf');
    }
}
