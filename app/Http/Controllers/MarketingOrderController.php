<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Buku;
use Illuminate\Support\Facades\DB;

class MarketingOrderController extends Controller
{
    // 1. Menampilkan Form Input Pesanan
    public function create()
    {
        $allBuku = Buku::where('stok_gudang', '>', 0)->get();

        // Data via & ekspedisi (bisa diganti ambil dari DB kalau sudah ada tabel masternya)
        $viaOptions = ['Tokopedia', 'Shopee', 'Event', 'Call Center', 'WhatsApp'];
        $ekspedisiOptions = ['JNE', 'J&T', 'SiCepat', 'Grab', 'Gojek', 'Ambil Sendiri'];

        return view('marketing.create_order', compact('allBuku', 'viaOptions', 'ekspedisiOptions'));
    }

    // 2. Menyimpan Data Pesanan ke Database
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'tanggal_pesan' => 'required|date',
            'nama_pembeli' => 'required|string',
            'buku_id' => 'required|array', // Harus ada minimal 1 buku
        ]);

        try {
            // Gunakan Transaction supaya kalau detail gagal simpan, order induk batal otomatis
            DB::transaction(function () use ($request) {

                // Simpan Data Induk ke tabel 'orders'
                // Sesuaikan dengan nama input di Blade tadi
                $order = Order::create([
                'tanggal_pesan'   => $request->tanggal_pesan,
                'via'             => $request->via,
                'nama_pembeli'    => $request->nama_pembeli,
                'nama_penerima'   => $request->samaPenerima ? $request->nama_pembeli : $request->nama_penerima,
                'alamat_penerima' => $request->alamat_penerima,
                'ekspedisi'       => $request->ekspedisi,
                'ongkir'          => $request->ongkir ?? 0,
                'nominal_donasi'  => $request->nominal_donasi ?? 0,
                'keterangan_donasi'=> $request->keterangan_donasi,
                'catatan_khusus'  => $request->catatan_khusus,
                ]);

                // Simpan Data Buku (Looping karena buku bisa banyak)
                foreach ($request->buku_id as $key => $idBuku) {
                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'buku_id'      => $idBuku,
                        'jumlah'       => $request->qty[$key],
                        'harga_satuan' => $request->harga_satuan[$key],
                        'subtotal'     => $request->qty[$key] * $request->harga_satuan[$key],
                    ]);

                    // Opsional: Potong stok buku otomatis
                    $buku = Buku::find($idBuku);
                    $buku->decrement('stok_gudang', $request->qty[$key]);
                }
            });

            return redirect()->back()->with('success', 'Pesanan berhasil disimpan!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal simpan: ' . $e->getMessage());
        }
    }
}
