<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Transaction;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function detail($id)
{
    try {
        // Cari berdasarkan kolom 'id' bawaan Laravel ATAU kolom 'no_invoice'
        // Ini mencegah crash SQLSTATE karena kolom yang tidak ada dihapus dari query
        $invoice = \App\Models\Invoice::where('id', $id)
                    ->orWhere('no_invoice', $id)
                    ->first();

        // JIKA MASIH BELUM KETEMU:
        // Kemungkinan data $id yang dikirim dari depan adalah string No Invoice utuh,
        // kita bersihkan pencariannya secara spesifik.
        if (!$invoice) {
            $invoice = \App\Models\Invoice::where('no_invoice', 'LIKE', '%' . $id . '%')->first();
        }

        if (!$invoice) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Invoice dengan ID/Nomor ' . $id . ' tidak ditemukan di tabel invoices.'
            ], 404);
        }

        // Ambil judul buku dari relasi 'book' atau gunakan kolom teks jika ada di tabel invoices
        $judulBuku = 'Buku tidak ditemukan';
        if ($invoice->book) {
            $judulBuku = $invoice->book->judul ?? $invoice->book->judul_buku ?? 'Detail Buku';
        } elseif (isset($invoice->judul_buku)) {
            $judulBuku = $invoice->judul_buku;
        } elseif (isset($invoice->buku)) {
            $judulBuku = $invoice->buku;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'no_invoice'    => $invoice->no_invoice ?? '-',
                'status'        => $invoice->status ?? 'Pending',
                'nama_pembeli'  => $invoice->nama_pembeli ?? $invoice->nama_agen ?? '-',
                'nama_penerima' => $invoice->nama_penerima ?? '-',
                'alamat'        => $invoice->alamat_penerima ?? '-',
                'via'           => $invoice->via ?? '-',
                'ekspedisi'     => $invoice->ekspedisi ?? '-',
                'ongkir'        => $invoice->ongkir ?? 0,
                'total_tagihan' => $invoice->total_tagihan ?? 0,
                'keterangan'    => $invoice->keterangan_order ?? '-',
                'buku'          => $judulBuku,
                'qty'           => $invoice->qty ?? 0,
                'harga_satuan'  => $invoice->harga_satuan ?? 0,
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Crash di Server: ' . $e->getMessage() . ' pada baris ' . $e->getLine()
        ], 500);
    }
}

    public function downloadPDF($id)
    {
        $invoice = Invoice::with('book')->findOrFail($id);

        $pdf = Pdf::loadView('pdf.invoice', compact('invoice'));

        return $pdf->stream('invoice-' . $invoice->no_invoice . '.pdf');
    }

    public function generateReport($month, $year)
    {
        $transactions = Transaction::with('account')
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->orderBy('tanggal', 'asc')
            ->get();

        $totalMasuk = $transactions->where('tipe', 'Masuk')->sum('nominal');
        $totalKeluar = $transactions->where('tipe', 'Keluar')->sum('nominal');
        $saldoAkhir = $totalMasuk - $totalKeluar;

        $namaBulan = Carbon::parse("$year-$month-01")->locale('id')->translatedFormat('F');

        $pdf = Pdf::loadView('pdf.report_monthly', compact('transactions', 'totalMasuk', 'totalKeluar', 'saldoAkhir', 'namaBulan', 'year'));

        return $pdf->stream("Laporan_Keuangan_{$namaBulan}_{$year}.pdf");
    }
}
