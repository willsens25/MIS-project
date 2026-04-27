<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Book;
use App\Models\Identitas;
use Illuminate\Support\Facades\DB;

class MarketingOrderController extends Controller
{
    /**
     * Menampilkan Form Input Pesanan & Daftar Invoice
     */
    public function create()
    {
        // Hanya ambil buku yang stoknya masih ada
        $allBuku = Book::where('stok_gudang', '>', 0)->get();

        // Ambil data identitas untuk pencarian nama agen di Select2
        $identitas = Identitas::all();

        // Ambil 10 invoice terbaru untuk ditampilkan di tabel daftar
        $invoices = Order::latest()->take(10)->get();

        return view('marketing.create_order', [
            'books' => $allBuku,
            'identitas' => $identitas,
            'invoices' => $invoices
        ]);
    }

    /**
     * Menyimpan Data Pesanan ke Database
     */
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'tanggal_pesan' => 'required|date',
            'nama_pembeli'  => 'required|string',
            'buku_id'       => 'required|array',
            'qty'           => 'required|array',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Buat Header Order
                $order = Order::create([
                    'tanggal_pesan'     => $request->tanggal_pesan,
                    'via'               => $request->via,
                    'nama_pembeli'      => $request->nama_pembeli,
                    // Logika Nama & Alamat: Cek apakah kirim ke diri sendiri (Agen) atau orang lain
                    'nama_penerima'     => $request->has('samaPenerima') ? $request->nama_pembeli : ($request->nama_penerima ?? $request->nama_pembeli),
                    'alamat_penerima'   => $request->has('samaPenerima') ? 'Alamat Sesuai Identitas' : ($request->alamat_penerima ?? 'Alamat Sesuai Identitas'),
                    'ekspedisi'         => $request->ekspedisi,
                    'ongkir'            => $request->ongkir ?? 0,
                    'total_tagihan'     => 0, // Akan diupdate setelah loop selesai
                ]);

                $totalSemuaBuku = 0;

                // 2. Simpan Detail Item (Looping buku yang dipilih)
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue; // Skip jika ada baris yang belum dipilih bukunya

                    $book = Book::findOrFail($idBuku);
                    $jumlahPesanan = $request->qty[$key] ?? 1;
                    $hargaSatuan = $book->harga_jual ?? 0;

                    // HITUNG SUB-TOTAL UNTUK TIAP BARIS
                    $subtotal = $hargaSatuan * $jumlahPesanan;

                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'buku_id'      => $idBuku,
                        'jumlah'       => $jumlahPesanan,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal'     => $subtotal, // MENGISI KOLOM SUB-TOTAL AGAR TIDAK ERROR
                    ]);

                    // Potong stok gudang secara otomatis
                    $book->decrement('stok_gudang', $jumlahPesanan);

                    // Akumulasi total tagihan
                    $totalSemuaBuku += $subtotal;
                }

                // 3. Update Total Akhir pada Tabel Orders (Total Buku + Ongkir)
                $order->update([
                    'total_tagihan' => $totalSemuaBuku + ($request->ongkir ?? 0)
                ]);

                return redirect()->route('marketing')->with('success', 'Invoice #' . $order->id . ' Berhasil Diterbitkan!');
            });
        } catch (\Exception $e) {
            // Jika gagal, kembalikan inputan user agar tidak mengetik ulang
            return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }
}
