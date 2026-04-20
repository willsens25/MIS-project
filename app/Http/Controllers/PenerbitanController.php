<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Book;

class PenerbitanController extends Controller
{
    public function index(Request $request)
{
    $search = $request->input('search');

    $books = \App\Models\Book::when($search, function ($query, $search) {
            return $query->where('judul', 'like', "%{$search}%")
                        ->orWhere('penulis', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate(10)
        ->withQueryString();

    return view('dashboards.penerbitan', compact('books'));
}

    public function tambahBuku(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'penulis' => 'required',
            'harga_jual' => 'required|numeric',
        ]);

        Book::create([
            'judul' => $request->judul,
            'penulis' => $request->penulis,
            'harga_jual' => $request->harga_jual,
            'stok_gudang' => 0 // Default stok 0, nanti diisi orang Produksi/Logistik
        ]);

        return back()->with('success', 'Buku baru berhasil didaftarkan ke katalog!');
    }

    public function updateHarga(Request $request, $id)
    {
    $request->validate([
        'harga_jual' => 'required|numeric|min:0'
    ]);

    $buku = \App\Models\Book::findOrFail($id);
    
    $buku->update([
        'harga_jual' => $request->harga_jual
    ]);

    return redirect()->back()->with('success', 'Harga buku ' . $buku->judul . ' berhasil diperbarui!');
    }

    public function bulkDelete(Request $request)
{
    $ids = $request->ids;
    if (!$ids) {
        return back()->with('error', 'Pilih buku yang ingin dihapus!');
    }

    try {
        DB::transaction(function () use ($ids) {
            \App\Models\LogisticLog::whereIn('buku_id', $ids)->delete();

            \App\Models\Book::whereIn('id', $ids)->delete();
        });

        return back()->with('success', count($ids) . ' buku dan riwayat terkait berhasil dihapus.');
    } catch (\Exception $e) {
        return back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
    }
}

}