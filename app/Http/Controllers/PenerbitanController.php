<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Book;
use App\Models\ActivityLog;

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

        $book = Book::create([
            'judul' => $request->judul,
            'penulis' => $request->penulis,
            'harga_jual' => $request->harga_jual,
            'stok_gudang' => 0
        ]);

        // 📝 AUDIT LOG
        ActivityLog::record('Tambah Buku', 'Book', 'Mendaftarkan buku baru ke katalog: "' . $book->judul . '" karya ' . $book->penulis . ' (Harga: Rp ' . number_format($book->harga_jual, 0, ',', '.') . ')');

        return back()->with('success', 'Buku baru berhasil didaftarkan ke katalog!');
    }

    public function updateHarga(Request $request, $id)
    {
        $request->validate([
            'harga_jual' => 'required|numeric|min:0',
        ]);

        $buku = \App\Models\Book::findOrFail($id);
        $hargaLama = $buku->harga_jual;

        $buku->update([
            'harga_jual' => $request->harga_jual
        ]);

        // 📝 AUDIT LOG
        ActivityLog::record('Update Harga Buku', 'Book', 'Mengubah harga buku "' . $buku->judul . '" dari Rp ' . number_format($hargaLama, 0, ',', '.') . ' menjadi Rp ' . number_format($buku->harga_jual, 0, ',', '.'));

        return redirect()->back()->with('success', 'Harga buku ' . $buku->judul . ' berhasil diupdate!');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids');

        if (!$ids || empty($ids)) {
            return redirect()->back()->with('error', 'Pilih item yang ingin dihapus terlebih dahulu.');
        }

        // Ambil judul buku terlebih dahulu untuk histori log sebelum datanya terhapus
        $judulBuku = \App\Models\Book::whereIn('id', $ids)->pluck('judul')->toArray();
        $daftarJudul = implode(', ', $judulBuku);

        \App\Models\Book::whereIn('id', $ids)->delete();

        // 📝 AUDIT LOG
        ActivityLog::record('Hapus Massal Buku', 'Book', 'Menghapus massal ' . count($ids) . ' buku dari katalog: [' . $daftarJudul . ']');

        return redirect()->back()->with('success', count($ids) . ' item berhasil dihapus.');
    }

    public function ajukanCetak(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:bukus,id',
            'jumlah' => 'required|numeric|min:1',
        ]);

        $buku = \App\Models\Book::findOrFail($request->book_id);

        \App\Models\PengajuanCetak::create([
            'buku_id' => $request->book_id,
            'jumlah_pengajuan' => $request->jumlah,
            'status' => 'pending',
        ]);

        // 📝 AUDIT LOG
        ActivityLog::record('Ajukan Cetak Buku', 'PengajuanCetak', 'Mengajukan cetak ulang untuk buku "' . $buku->judul . '" sebanyak ' . $request->jumlah . ' Eks. Menunggu persetujuan Finance.');

        return back()->with('success', 'Pengajuan cetak telah dikirim ke Finance!');
    }
}
