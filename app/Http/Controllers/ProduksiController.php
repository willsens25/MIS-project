<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\ProductionLog;
use Illuminate\Support\Facades\DB;

class ProduksiController extends Controller
{
    public function index()
    {
        // Ambil semua buku untuk dropdown
        $books = Book::all();
        
        // Eager load relasi 'book' agar tidak N+1 query
        $logs = ProductionLog::with('book')->latest()->get();
        
        // Statistik dashboard
        $stats = [
            'total_produksi'    => ProductionLog::sum('qty_produksi') ?? 0,
            'buku_aktif'        => Book::count(),
            'produksi_hari_ini' => ProductionLog::whereDate('tanggal_produksi', now()->toDateString())->sum('qty_produksi') ?? 0
        ];

        return view('dashboards.produksi', compact('books', 'logs', 'stats'));
    }

    public function simpan(Request $request)
    {
        $request->validate([
            'buku_id' => 'required|exists:bukus,id',
            'jumlah'  => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($request) {
                // 1. Ambil data buku
                $buku = Book::findOrFail($request->buku_id);

                // 2. Simpan Riwayat Produksi
                ProductionLog::create([
                    'buku_id'          => $request->buku_id,
                    'qty_produksi'     => $request->jumlah,
                    'tanggal_produksi' => now(),
                ]);

                // 3. Update Stok (Gunakan increment langsung ke Database agar lebih presisi)
                // Ini akan menangani jika stok_gudang awalnya NULL menjadi tetap bisa ditambah
                DB::table('bukus')->where('id', $request->buku_id)->increment('stok_gudang', $request->jumlah);
            });

            return back()->with('success', 'Mantap! Stok berhasil ditambah ke gudang.');

        } catch (\Exception $e) {
            return back()->with('error', 'Gagal update stok: ' . $e->getMessage());
        }
    }
}