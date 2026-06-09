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
        $pendingShipments = \App\Models\Penyaluran::with('book')
                            ->where('status', 'proses packing')
                            ->latest()
                            ->get();

        $books = \App\Models\Book::all();

        $logs = \App\Models\LogisticLog::with('book')
                ->whereDate('created_at', now()->toDateString())
                ->latest()
                ->get();

        $totalHariIni = \App\Models\LogisticLog::whereDate('created_at', now()->toDateString())
                        ->sum('qty_keluar');

        return view('logistik.index', compact('pendingShipments', 'books', 'logs', 'totalHariIni'));
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

    public function kirimDariMarketing($id)
    {
        $antrean = \App\Models\Penyaluran::with('book')->findOrFail($id);
        $jumlahKeluar = $antrean->qty;
        $judulBuku = $antrean->book->judul ?? 'Buku ID: ' . $antrean->buku_id;

        return DB::transaction(function () use ($antrean, $jumlahKeluar, $judulBuku) {
            $antrean->update(['status' => 'dikirim']);

            \App\Models\LogisticLog::create([
                'buku_id'    => $antrean->buku_id,
                'qty_keluar' => $jumlahKeluar,
                'tujuan'     => $antrean->nama_agen ?? 'Marketing',
                // 'no_invoice' => $antrean->no_invoice,
            ]);

            // 📝 AUDIT LOG
            ActivityLog::record(
                'Kirim Pesanan Marketing',
                'Penyaluran',
                'Memproses antrean logistik untuk Invoice #' . $antrean->no_invoice . '. Status diubah menjadi DIKIRIM. Barang: "' . $judulBuku . '" sejumlah ' . $jumlahKeluar . ' pcs ke penerima: ' . ($antrean->nama_agen ?? 'Marketing')
            );

            return redirect()->back()->with('success', 'Barang berhasil diproses logistik!');
        });
    }

    public function simpanKeluar(Request $request)
    {
        $request->validate([
            'buku_id' => 'required',
            'qty_keluar' => 'required|numeric|min:1',
        ]);

        // Fix Bug: Mengubah \App\Models\Buku menjadi \App\Models\Book sesuai relasi yang ada
        $buku = \App\Models\Book::findOrFail($request->buku_id);

        if ($buku->stok_gudang < $request->qty_keluar) {
            return redirect()->back()->with('error', 'Stok tidak mencukupi!');
        }

        $buku->decrement('stok_gudang', $request->qty_keluar);

        $keteranganLog = $request->keterangan ?? 'Barang Keluar';

        \App\Models\LogisticLog::create([
            'buku_id' => $request->buku_id,
            'qty_keluar' => $request->qty_keluar,
            'keterangan' => $keteranganLog,
        ]);

        // 📝 AUDIT LOG
        ActivityLog::record(
            'Pengeluaran Manual Gudang',
            'LogisticLog',
            'Mengeluarkan stok secara manual untuk buku "' . $buku->judul . '" sebanyak ' . $request->qty_keluar . ' pcs. Keterangan: ' . $keteranganLog
        );

        return redirect()->back()->with('success', 'Data pengeluaran berhasil disimpan.');
    }

    public function cetakSuratJalan($id)
    {
        // Ambil dari LogisticLog karena tombolnya mengirimkan ID dari tabel logs
        $log = \App\Models\LogisticLog::with(['book'])->findOrFail($id);
        $judulBuku = $log->book->judul ?? 'Buku ID: ' . $log->buku_id;

        // 📝 AUDIT LOG
        ActivityLog::record(
            'Cetak Surat Jalan',
            'LogisticLog',
            'Mencetak dokumen Surat Jalan untuk pengiriman "' . $judulBuku . '" sejumlah ' . $log->qty_keluar . ' pcs dengan tujuan: ' . ($log->tujuan ?? $log->keterangan)
        );

        // Kirim data log ke view cetak
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('logistik.cetak_surat_jalan', [
            'data' => $log
        ]);

        return $pdf->stream('Surat_Jalan_' . date('Ymd') . '.pdf');
    }
}
