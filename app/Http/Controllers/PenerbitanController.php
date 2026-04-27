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
            'stok_gudang' => 0
        ]);

        return back()->with('success', 'Buku baru berhasil didaftarkan ke katalog!');
    }

    public function updateHarga(Request $request, $id)
{
    $request->validate([
        'harga_jual' => 'required|numeric|min:0',
    ]);

    $buku = \App\Models\Book::findOrFail($id);
    $buku->update([
        'harga_jual' => $request->harga_jual
    ]);

    return redirect()->back()->with('success', 'Harga buku ' . $buku->judul . ' berhasil diupdate!');
}

    public function bulkDelete(Request $request)
{
    $ids = $request->input('ids');

    if (!$ids || empty($ids)) {
        return redirect()->back()->with('error', 'Pilih item yang ingin dihapus terlebih dahulu.');
    }

    \App\Models\Book::whereIn('id', $ids)->delete();

    return redirect()->back()->with('success', count($ids) . ' item berhasil dihapus.');
}

}
