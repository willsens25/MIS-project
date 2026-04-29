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
    // 1. Ambil data untuk pilihan (Dropdown)
    $identitas = Identitas::all();
    $books = Book::all();

    // 2. AMBIL INVOICE YANG BENAR-BENAR BELUM LUNAS SAJA
    // Kita filter di sini supaya Blade tidak kerja berat
    $invoices = Order::where('status', '!=', 'Lunas')
                    ->orWhereNull('status')
                    ->latest()
                    ->take(10)
                    ->get();

    return view('marketing.create_order', compact('identitas', 'books', 'invoices'));
}

    /**
     * Menyimpan Data Pesanan ke Database
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_pesan' => 'required|date',
            'nama_agen'     => 'required|string',
            'buku_id'       => 'required|array',
            'qty'           => 'required|array',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Buat Header Order
                $order = Order::create([
                    'tanggal_pesan'     => $request->tanggal_pesan,
                    'via'               => $request->via,
                    'nama_pembeli'      => $request->nama_agen,
                    'nama_penerima'     => $request->has('samaPenerima') ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen),
                    'alamat_penerima'   => $request->has('samaPenerima') ? 'Alamat Sesuai Identitas' : ($request->alamat_penerima ?? 'Alamat Sesuai Identitas'),
                    'ekspedisi'         => $request->ekspedisi,
                    'ongkir'            => $request->ongkir ?? 0,
                    'status'            => 'Pending',
                    'total_tagihan'     => 0,
                ]);

                $totalSemuaBuku = 0;

                // 2. Simpan Detail Item
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    $book = Book::findOrFail($idBuku);
                    $jumlahPesanan = $request->qty[$key] ?? 1;
                    $hargaSatuan = $book->harga_jual ?? 0;
                    $subtotal = $hargaSatuan * $jumlahPesanan;

                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'buku_id'      => $idBuku,
                        'jumlah'       => $jumlahPesanan,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal'     => $subtotal,
                    ]);

                    $book->decrement('stok_gudang', $jumlahPesanan);
                    $totalSemuaBuku += $subtotal;
                }

                // 3. Update Total Akhir
                $order->update([
                    'total_tagihan' => $totalSemuaBuku + ($request->ongkir ?? 0)
                ]);

                return redirect()->route('marketing')->with('success', 'Invoice #' . $order->id . ' Berhasil Diterbitkan!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }

    /**
     * Fungsi Tombol Hijau (Lunas)
     */
    public function tandaiLunas($id)
{
    $order = Order::findOrFail($id);
    $order->status = 'Lunas'; // Pastikan tulisannya "Lunas" (huruf L kapital sesuai filter Blade)
    $order->save();

    return redirect()->back()->with('success', 'Invoice #' . $order->no_invoice . ' berhasil dilunaskan!');
}

    public function hapusInvoice($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return redirect()->back()->with('success', 'Pesanan berhasil dihapus!');
    }
}
