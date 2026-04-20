<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Transaction;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
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