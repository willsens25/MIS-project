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
    $allBuku = Book::where('stok_gudang', '>', 0)->get();

    $identitas = Identitas::all();

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

                return redirect()->route('mad.index')->with('success', 'Invoice #' . $order->id . ' Berhasil Diterbitkan!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }

    public function tandaiLunas($id)
{
    $order = Order::findOrFail($id);

    $order->update([
        'status' => 'Lunas'
    ]);

    $pemasukanCategory = \App\Models\Category::where('nama_kategori', 'like', '%Penjualan%')
                            ->orWhere('nama_kategori', 'like', '%Invoice%')
                            ->first();
    $defaultAccountId = 1;

    \App\Models\Mutasi::create([
        'account_id'  => $defaultAccountId,
        'category_id' => $pemasukanCategory->id ?? null,
        'user_id'     => auth()->id(),
        'tipe'        => 'Masuk',
        'nominal'     => $order->total_tagihan,
        'keterangan'  => 'Pelunasan Otomatis Order #' . $order->id . ' - ' . $order->nama_pembeli,
        'tanggal'     => now(),
        'jenis'       => 'INVOICE'
    ]);

    return redirect()->back()->with('success', 'Order #' . $order->id . ' Lunas & Tercatat di Finance!');
}

    public function hapusInvoice($id)
    {
        // PERBAIKAN: Gunakan Model Order
        $order = Order::findOrFail($id);
        $order->delete();

        return redirect()->back()->with('success', 'Pesanan berhasil dihapus!');
    }
}
