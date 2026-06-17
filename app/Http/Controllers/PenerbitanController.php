<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Book;
use App\Models\ActivityLog;
use Barryvdh\DomPDF\Facade\Pdf;

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

    /**
     * Fitur Bulk Delete (Hapus Massal Terpilih) - Dengan Bypass Foreign Key Constraint
     */
    public function bulkDelete(Request $request)
    {
        // 1. Validasi request input array id buku
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'numeric'
        ]);

        try {
            DB::beginTransaction();

            $ids = $request->input('ids');
            $count = count($ids);

            // Ambil judul buku terlebih dahulu untuk histori log sebelum datanya lenyap
            $judulBuku = \App\Models\Book::whereIn('id', $ids)->pluck('judul')->toArray();
            $daftarJudul = implode(', ', $judulBuku);

            // 🔥 BYPASS LANGKAH 1: Bersihkan semua pengajuan cetak yang mengikat id buku ini
            \App\Models\PengajuanCetak::whereIn('buku_id', $ids)->delete();

            // 🔥 BYPASS LANGKAH 2: Bersihkan detail orderan yang mengikat id buku ini (Mengatasi Error SQLSTATE[23000])
            DB::table('order_details')->whereIn('buku_id', $ids)->delete();

            // 2. Eksekusi penghapusan massal data buku utama setelah seluruh data relasi bersih
            \App\Models\Book::whereIn('id', $ids)->delete();

            // 📝 AUDIT LOG
            ActivityLog::record(
                'Hapus Massal Buku',
                'Book',
                'Menghapus massal ' . $count . ' buku beserta riwayat transaksi dan pengajuan cetaknya dari katalog: [' . $daftarJudul . ']'
            );

            DB::commit();
            return redirect()->back()->with('success', $count . ' item buku dan seluruh data keterkaitannya berhasil dibersihkan total.');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal melakukan hapus massal: ' . $e->getMessage());
        }
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

    public function exportPdf()
    {
    // Ambil semua data buku dari database
    $books = \App\Models\Book::latest()->get();

    // Catat aksi ke Audit Log
    ActivityLog::record('Lihat PDF Katalog Buku', 'Book', 'Membuka preview laporan katalog buku dalam format PDF.');

    // Load view html dan ubah menjadi kertas PDF berukuran A4 Portrait
    $pdf = Pdf::loadView('dashboards.penerbitan_pdf', compact('books'))->setPaper('a4', 'portrait');

    // 🔥 GANTI DI SINI: Dari download() menjadi stream()
    return $pdf->stream('Laporan_Katalog_S_SALUR_' . date('Ymd_His') . '.pdf');
    }
}
