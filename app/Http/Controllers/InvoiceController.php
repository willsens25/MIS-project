<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Transaction;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Menyediakan data JSON untuk fitur Quick View di halaman Blade
     */
    public function detail($id)
{
    // Menggunakan findOrFail agar jika ada error/masalah relasi, datanya terlacak dengan aman
    $invoice = \App\Models\Invoice::with('book')->findOrFail($id);

    return response()->json([
        'status' => 'success',
        'data' => [
            'no_invoice'    => $invoice->no_invoice ?? '-',
            'status'        => $invoice->status ?? 'Pending',
            'nama_pembeli'  => $invoice->nama_pembeli ?? '-',
            'nama_penerima' => $invoice->nama_penerima ?? '-',
            'alamat'        => $invoice->alamat_penerima ?? '-',
            'via'           => $invoice->via ?? '-',
            'ekspedisi'     => $invoice->ekspedisi ?? '-',
            'ongkir'        => $invoice->ongkir ?? 0,
            'total_tagihan' => $invoice->total_tagihan ?? 0,
            'keterangan'    => $invoice->keterangan_order ?? '-',
            'buku'          => $invoice->book->judul ?? 'Detail Buku',
            'qty'           => $invoice->qty ?? 0,
            'harga_satuan'  => $invoice->harga_satuan ?? 0,
        ]
    ]);
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
